-- ====================================================================
-- QUANTUM LEARNING INSTITUTE / TAXCENT CONNECT
-- Academic Documents, Marksheets, Certificates & Verification Migration
-- ====================================================================

-- 1. Enable UUID Extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Enums
DO $$ BEGIN
    CREATE TYPE academic_document_type AS ENUM ('certificate', 'marksheet');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE certificate_status AS ENUM ('valid', 'revoked');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE user_institute_role AS ENUM ('admin', 'staff', 'student');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Student Profiles Table (links to Supabase auth.users or institute roster)
CREATE TABLE IF NOT EXISTS public.student_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    student_id_code VARCHAR(50) UNIQUE NOT NULL, -- e.g. 'QLI-STU-2026-088'
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    enrolled_course VARCHAR(255) NOT NULL,
    admission_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for quick lookup
CREATE INDEX IF NOT EXISTS idx_student_id_code ON public.student_profiles(student_id_code);
CREATE INDEX IF NOT EXISTS idx_student_user_id ON public.student_profiles(user_id);

-- 4. User Roles Table (to manage Staff / Admin privileges securely in DB)
CREATE TABLE IF NOT EXISTS public.institute_staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    role user_institute_role NOT NULL DEFAULT 'staff',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Academic Documents Table (Certificates & Marksheets)
CREATE TABLE IF NOT EXISTS public.academic_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE RESTRICT,
    document_type academic_document_type NOT NULL DEFAULT 'certificate',
    certificate_number VARCHAR(100) UNIQUE NOT NULL, -- Strict uniqueness constraint to prevent duplicates
    student_id_code VARCHAR(50) NOT NULL,
    student_full_name VARCHAR(255) NOT NULL,
    course_name VARCHAR(255) NOT NULL,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    marks_or_grade VARCHAR(100), -- E.g. 'Grade A+ (94%)' or 'Marks: 450/500'
    file_storage_path VARCHAR(500) NOT NULL, -- Path inside Supabase private storage bucket 'academic-documents'
    file_mime_type VARCHAR(100) DEFAULT 'application/pdf',
    file_size_bytes BIGINT,
    status certificate_status NOT NULL DEFAULT 'valid',
    revocation_reason TEXT,
    revoked_at TIMESTAMPTZ,
    revoked_by UUID REFERENCES auth.users(id),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance & secure query lookups
CREATE INDEX IF NOT EXISTS idx_cert_number ON public.academic_documents(certificate_number);
CREATE INDEX IF NOT EXISTS idx_academic_student_id ON public.academic_documents(student_id);
CREATE INDEX IF NOT EXISTS idx_academic_status ON public.academic_documents(status);

-- 6. Document Audit Logs Table
CREATE TABLE IF NOT EXISTS public.document_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES public.academic_documents(id) ON DELETE CASCADE,
    certificate_number VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL, -- 'UPLOAD', 'UPDATE_METADATA', 'REPLACE_FILE', 'REVOKE', 'RESTORE'
    performed_by UUID REFERENCES auth.users(id),
    performed_by_name VARCHAR(255),
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_doc_id ON public.document_audit_logs(document_id);
CREATE INDEX IF NOT EXISTS idx_audit_cert_number ON public.document_audit_logs(certificate_number);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institute_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper security functions
CREATE OR REPLACE FUNCTION public.is_authorised_staff()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.institute_staff
        WHERE user_id = auth.uid() AND is_active = TRUE
    );
$$;

-- 1. Student Profiles RLS:
-- Staff can view/insert/update all student profiles
CREATE POLICY "Staff can manage all student profiles"
    ON public.student_profiles
    FOR ALL
    TO authenticated
    USING (public.is_authorised_staff())
    WITH CHECK (public.is_authorised_staff());

-- Students can read only their own profile
CREATE POLICY "Students can view own profile"
    ON public.student_profiles
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- 2. Academic Documents RLS:
-- Staff can view all, insert, and update documents
CREATE POLICY "Staff full access to academic documents"
    ON public.academic_documents
    FOR ALL
    TO authenticated
    USING (public.is_authorised_staff())
    WITH CHECK (public.is_authorised_staff());

-- Students can read only their own documents
CREATE POLICY "Students can view own academic documents"
    ON public.academic_documents
    FOR SELECT
    TO authenticated
    USING (
        student_id IN (
            SELECT id FROM public.student_profiles
            WHERE user_id = auth.uid()
        )
    );

-- PUBLIC / ANON USERS HAVE ZERO DIRECT SELECT ACCESS TO academic_documents!
-- They must go through the dedicated SECURITY DEFINER function verify_certificate().

-- 3. Document Audit Logs RLS:
CREATE POLICY "Staff can read audit logs"
    ON public.document_audit_logs
    FOR SELECT
    TO authenticated
    USING (public.is_authorised_staff());

CREATE POLICY "Staff can insert audit logs"
    ON public.document_audit_logs
    FOR INSERT
    TO authenticated
    WITH CHECK (public.is_authorised_staff());

-- ====================================================================
-- AUTHORITATIVE PUBLIC VERIFICATION FUNCTION (RPC)
-- ====================================================================
-- Strict privacy rules:
-- 1. Returns ONLY minimal public verification information
-- 2. Never exposes marks, grades, raw private file URLs, emails, or phone numbers
-- 3. Masks student name (e.g., 'Rahul Sharma' -> 'R*** S***')
-- 4. Accurately reports status: 'VALID', 'REVOKED', or 'NOT_FOUND'
-- 5. Revoked certificate is NEVER shown as valid
-- ====================================================================

CREATE OR REPLACE FUNCTION public.mask_student_name(full_name text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
    parts text[];
    part text;
    masked text := '';
    i int;
BEGIN
    IF full_name IS NULL OR TRIM(full_name) = '' THEN
        RETURN 'A*** S***';
    END IF;

    parts := string_to_array(TRIM(full_name), ' ');
    FOR i IN 1..array_length(parts, 1) LOOP
        part := parts[i];
        IF length(part) > 1 THEN
            masked := masked || substring(part from 1 for 1) || repeat('*', length(part) - 1);
        ELSE
            masked := masked || part;
        END IF;
        IF i < array_length(parts, 1) THEN
            masked := masked || ' ';
        END IF;
    END LOOP;
    RETURN masked;
END;
$$;

-- Verification RPC Callable by Anon / Public
CREATE OR REPLACE FUNCTION public.verify_certificate(p_certificate_number text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    cert_record RECORD;
    clean_number text;
BEGIN
    -- Sanitize and normalize input
    clean_number := UPPER(TRIM(p_certificate_number));

    IF clean_number IS NULL OR clean_number = '' THEN
        RETURN json_build_object(
            'found', false,
            'status', 'NOT_FOUND',
            'message', 'Please provide a valid certificate number.'
        );
    END IF;

    -- Query authoritative document registry
    SELECT 
        d.certificate_number,
        d.course_name,
        d.issue_date,
        d.status,
        d.revocation_reason,
        d.student_full_name,
        d.document_type
    INTO cert_record
    FROM public.academic_documents d
    WHERE UPPER(d.certificate_number) = clean_number;

    -- If record doesn't exist
    IF cert_record IS NULL THEN
        RETURN json_build_object(
            'found', false,
            'status', 'NOT_FOUND',
            'certificate_number', clean_number,
            'message', 'No certificate or marksheet was found matching this registration number.'
        );
    END IF;

    -- If revoked, return explicit revoked status without exposing private details
    IF cert_record.status = 'revoked' THEN
        RETURN json_build_object(
            'found', true,
            'status', 'REVOKED',
            'certificate_number', cert_record.certificate_number,
            'institute_name', 'Quantum Learning Institute',
            'course_name', cert_record.course_name,
            'issue_date', cert_record.issue_date,
            'student_masked_name', public.mask_student_name(cert_record.student_full_name),
            'document_type', cert_record.document_type,
            'revocation_reason', COALESCE(cert_record.revocation_reason, 'Revoked by Quantum Learning Institute administration.'),
            'disclaimer', 'This certificate has been revoked and is no longer valid for any official, academic, or professional purpose.'
        );
    END IF;

    -- If valid, return certified confirmation with privacy masking
    RETURN json_build_object(
        'found', true,
        'status', 'VALID',
        'certificate_number', cert_record.certificate_number,
        'institute_name', 'Quantum Learning Institute',
        'course_name', cert_record.course_name,
        'issue_date', cert_record.issue_date,
        'student_masked_name', public.mask_student_name(cert_record.student_full_name),
        'document_type', cert_record.document_type,
        'verification_timestamp', NOW(),
        'disclaimer', 'Verified against Quantum Learning Institute authoritative registry. This confirms record authenticity at the institute and does not imply autonomous government accreditation.'
    );
END;
$$;

-- Grant EXECUTE on verification function to anon and authenticated users
GRANT EXECUTE ON FUNCTION public.verify_certificate(text) TO anon, authenticated;

-- ====================================================================
-- SUPABASE STORAGE BUCKET CONFIGURATION & POLICIES
-- ====================================================================
-- Note: Create bucket 'academic-documents' with public: false in Supabase Dashboard.
-- Below are the storage RLS policies for storage.objects:

-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('academic-documents', 'academic-documents', false)
-- ON CONFLICT (id) DO UPDATE SET public = false;

-- Policy 1: Authorised staff can upload/update/delete documents in bucket
-- CREATE POLICY "Staff can upload academic files"
--     ON storage.objects
--     FOR ALL
--     TO authenticated
--     USING (bucket_id = 'academic-documents' AND public.is_authorised_staff())
--     WITH CHECK (bucket_id = 'academic-documents' AND public.is_authorised_staff());

-- Policy 2: Students can only read their own files via signed short-lived URLs
-- Note: In Supabase, private storage downloads are performed using supabase.storage.from('academic-documents').createSignedUrl(path, 300)
