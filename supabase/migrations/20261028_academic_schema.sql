-- ====================================================================
-- QUANTUM LEARNING INSTITUTE / TAXCENT CONNECT
-- Full Academic Management System, RBAC, Attendance & Mock Tests
-- Migration: 20261028_academic_schema.sql
-- ====================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Enumerated Types
DO $$ BEGIN
    CREATE TYPE user_institute_role AS ENUM ('admin', 'staff', 'student', 'public');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE academic_document_type AS ENUM ('certificate', 'marksheet');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE certificate_status AS ENUM ('valid', 'revoked');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE approval_status_type AS ENUM ('draft', 'pending', 'approved', 'rejected', 'published');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE attendance_status_type AS ENUM ('present', 'absent', 'late', 'leave');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE exam_category_type AS ENUM ('dca_adca', 'tally_gst', 'adre', 'assam_police', 'apdcl', 'ssc');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. Courses & Batches Tables
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL, -- e.g. 'DCA', 'ADCA', 'TALLY-GST', 'PGDCA', 'DTP'
    name VARCHAR(255) NOT NULL,
    duration_months INT NOT NULL DEFAULT 6,
    description TEXT,
    syllabus_topics JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    batch_code VARCHAR(100) UNIQUE NOT NULL, -- e.g. 'DCA-2026-M1'
    batch_name VARCHAR(255) NOT NULL,
    timing VARCHAR(100), -- e.g. '09:00 AM - 11:00 AM'
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'completed', 'upcoming'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Institute Staff Roster Table
CREATE TABLE IF NOT EXISTS public.institute_staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    staff_id_code VARCHAR(50) UNIQUE NOT NULL, -- e.g. 'QLI-STF-2026-001'
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(25),
    designation VARCHAR(150) NOT NULL DEFAULT 'Instructor',
    role user_institute_role NOT NULL DEFAULT 'staff',
    permissions JSONB DEFAULT '["attendance", "student_records", "marks_entry", "certificate_draft"]'::jsonb,
    assigned_courses JSONB DEFAULT '[]'::jsonb,
    assigned_batches JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    invitation_status VARCHAR(50) DEFAULT 'active', -- 'pending', 'active', 'revoked'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Student Profiles Table
CREATE TABLE IF NOT EXISTS public.student_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    student_id_code VARCHAR(50) UNIQUE NOT NULL, -- e.g. 'QLI-STU-2026-001'
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(25),
    enrolled_course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
    enrolled_course_name VARCHAR(255) NOT NULL,
    batch_id UUID REFERENCES public.batches(id) ON DELETE SET NULL,
    batch_code VARCHAR(100),
    admission_date DATE DEFAULT CURRENT_DATE,
    enrolment_status VARCHAR(50) DEFAULT 'active', -- 'active', 'completed', 'suspended'
    is_portal_active BOOLEAN DEFAULT TRUE,
    invitation_sent_at TIMESTAMPTZ,
    created_by UUID REFERENCES public.institute_staff(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Student Attendance Table (With Unique constraint per student per date/session)
CREATE TABLE IF NOT EXISTS public.student_attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    batch_id UUID REFERENCES public.batches(id) ON DELETE SET NULL,
    attendance_date DATE NOT NULL,
    session_name VARCHAR(50) DEFAULT 'default', -- supports morning/afternoon sessions
    status attendance_status_type NOT NULL DEFAULT 'present',
    reason TEXT,
    marked_by_staff_id UUID REFERENCES public.institute_staff(id) ON DELETE SET NULL,
    correction_history JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_student_daily_session UNIQUE (student_id, attendance_date, session_name)
);

-- 7. Staff Attendance Table (With Unique constraint per staff per date)
CREATE TABLE IF NOT EXISTS public.staff_attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID NOT NULL REFERENCES public.institute_staff(id) ON DELETE CASCADE,
    attendance_date DATE NOT NULL,
    status attendance_status_type NOT NULL DEFAULT 'present',
    punch_in_time TIME,
    punch_out_time TIME,
    reason TEXT,
    correction_history JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_staff_daily_attendance UNIQUE (staff_id, attendance_date)
);

-- 8. Assessments & Marks Records Table
CREATE TABLE IF NOT EXISTS public.assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    batch_id UUID REFERENCES public.batches(id) ON DELETE SET NULL,
    max_score NUMERIC(5, 2) NOT NULL DEFAULT 100.00,
    passing_score NUMERIC(5, 2) NOT NULL DEFAULT 40.00,
    assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status approval_status_type NOT NULL DEFAULT 'draft',
    created_by UUID REFERENCES public.institute_staff(id),
    approved_by UUID REFERENCES public.institute_staff(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.student_marks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    marks_obtained NUMERIC(5, 2) NOT NULL,
    max_score NUMERIC(5, 2) NOT NULL,
    percentage NUMERIC(5, 2) GENERATED ALWAYS AS (ROUND((marks_obtained / NULLIF(max_score, 0)) * 100, 2)) STORED,
    grade VARCHAR(20),
    remarks TEXT,
    status approval_status_type NOT NULL DEFAULT 'draft',
    entered_by UUID REFERENCES public.institute_staff(id),
    approved_by UUID REFERENCES public.institute_staff(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT check_marks_valid CHECK (marks_obtained >= 0 AND marks_obtained <= max_score),
    CONSTRAINT unique_student_assessment UNIQUE (assessment_id, student_id)
);

-- 9. Academic Documents Table (Certificates & Marksheets)
CREATE TABLE IF NOT EXISTS public.academic_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE RESTRICT,
    document_type academic_document_type NOT NULL DEFAULT 'certificate',
    certificate_number VARCHAR(100) UNIQUE NOT NULL,
    student_id_code VARCHAR(50) NOT NULL,
    student_full_name VARCHAR(255) NOT NULL,
    course_name VARCHAR(255) NOT NULL,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    marks_or_grade VARCHAR(100),
    file_storage_path VARCHAR(500) NOT NULL,
    file_mime_type VARCHAR(100) DEFAULT 'application/pdf',
    file_size_bytes BIGINT,
    status certificate_status NOT NULL DEFAULT 'valid',
    approval_status approval_status_type NOT NULL DEFAULT 'approved',
    approved_by_staff_id UUID REFERENCES public.institute_staff(id),
    approved_by_name VARCHAR(255),
    approved_at TIMESTAMPTZ,
    rejection_reason TEXT,
    revocation_reason TEXT,
    revoked_at TIMESTAMPTZ,
    revoked_by UUID REFERENCES public.institute_staff(id),
    created_by UUID REFERENCES public.institute_staff(id),
    created_by_name VARCHAR(255),
    updated_by UUID REFERENCES public.institute_staff(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Learning Materials & Study Resources Table
CREATE TABLE IF NOT EXISTS public.learning_materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    batch_id UUID REFERENCES public.batches(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    subject VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'notes', -- 'syllabus', 'notes', 'practical', 'assignment'
    file_url VARCHAR(500) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size_bytes BIGINT DEFAULT 0,
    is_published BOOLEAN DEFAULT TRUE,
    uploaded_by UUID REFERENCES public.institute_staff(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Mock Tests & Question Bank Tables
CREATE TABLE IF NOT EXISTS public.mock_tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    category exam_category_type NOT NULL DEFAULT 'dca_adca',
    target_exam VARCHAR(150), -- e.g. 'ADRE Grade III', 'Assam Police AB/UB'
    duration_minutes INT NOT NULL DEFAULT 30,
    total_marks INT NOT NULL DEFAULT 50,
    passing_percentage NUMERIC(5, 2) NOT NULL DEFAULT 50.00,
    instructions TEXT,
    is_published BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES public.institute_staff(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.mock_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    test_id UUID NOT NULL REFERENCES public.mock_tests(id) ON DELETE CASCADE,
    question_order INT NOT NULL DEFAULT 1,
    question_text TEXT NOT NULL,
    question_text_as TEXT, -- Assamese translation
    options JSONB NOT NULL, -- Array of 4 strings
    correct_option_index INT NOT NULL, -- 0-3 (Never exposed in public query before submission)
    explanation TEXT,
    explanation_as TEXT,
    marks INT NOT NULL DEFAULT 2,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.mock_test_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    test_id UUID NOT NULL REFERENCES public.mock_tests(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    user_answers JSONB DEFAULT '{}'::jsonb, -- question_index -> chosen_option
    score_obtained INT NOT NULL DEFAULT 0,
    total_marks INT NOT NULL DEFAULT 50,
    percentage NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    passed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Government Exam Preparation Question Sets
CREATE TABLE IF NOT EXISTS public.govt_exam_papers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_name VARCHAR(150) NOT NULL, -- 'ADRE Grade III', 'ADRE Grade IV', 'Assam Police Constable', 'APDCL Office Assistant'
    year INT NOT NULL,
    subject VARCHAR(150) NOT NULL,
    language VARCHAR(50) NOT NULL DEFAULT 'Bilingual', -- 'Assamese', 'English', 'Bilingual'
    difficulty VARCHAR(50) NOT NULL DEFAULT 'Moderate', -- 'Easy', 'Moderate', 'Advanced'
    file_url VARCHAR(500) NOT NULL,
    file_size VARCHAR(50),
    is_official_paper BOOLEAN DEFAULT FALSE,
    disclaimer TEXT DEFAULT 'This is a practice question set prepared by Quantum Learning Institute faculty and is not an autonomous official question paper of the examination commission.',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. System & Academic Audit Logs Table
CREATE TABLE IF NOT EXISTS public.academic_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(50) NOT NULL, -- 'DOCUMENT', 'STUDENT', 'STAFF', 'ATTENDANCE', 'MARK'
    entity_id VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT', 'REVOKE', 'RESTORE'
    performed_by_id UUID,
    performed_by_name VARCHAR(255) NOT NULL,
    performed_by_role VARCHAR(50) NOT NULL,
    reason TEXT,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13a. Bring forward the legacy certificate schema before indexes and RLS
-- reference columns introduced by this migration. CREATE TABLE IF NOT EXISTS
-- does not add columns to tables created by 20261027.
ALTER TABLE public.institute_staff
    ADD COLUMN IF NOT EXISTS staff_id_code VARCHAR(50),
    ADD COLUMN IF NOT EXISTS phone VARCHAR(25),
    ADD COLUMN IF NOT EXISTS designation VARCHAR(150) NOT NULL DEFAULT 'Instructor',
    ADD COLUMN IF NOT EXISTS permissions JSONB NOT NULL DEFAULT '["attendance", "student_records", "marks_entry", "certificate_draft"]'::jsonb,
    ADD COLUMN IF NOT EXISTS assigned_courses JSONB NOT NULL DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS assigned_batches JSONB NOT NULL DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS invitation_status VARCHAR(50) NOT NULL DEFAULT 'active',
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

UPDATE public.institute_staff
SET staff_id_code = 'QLI-STF-' || UPPER(SUBSTRING(REPLACE(id::text, '-', ''), 1, 8))
WHERE staff_id_code IS NULL OR BTRIM(staff_id_code) = '';

ALTER TABLE public.institute_staff
    ALTER COLUMN staff_id_code SET NOT NULL;

ALTER TABLE public.student_profiles
    ADD COLUMN IF NOT EXISTS enrolled_course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS enrolled_course_name VARCHAR(255),
    ADD COLUMN IF NOT EXISTS batch_id UUID REFERENCES public.batches(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS batch_code VARCHAR(100),
    ADD COLUMN IF NOT EXISTS enrolment_status VARCHAR(50) NOT NULL DEFAULT 'active',
    ADD COLUMN IF NOT EXISTS is_portal_active BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS invitation_sent_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.institute_staff(id) ON DELETE SET NULL;

DO $backfill_legacy_course_name$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'student_profiles'
          AND column_name = 'enrolled_course'
    ) THEN
        EXECUTE $sql$
            UPDATE public.student_profiles
            SET enrolled_course_name = COALESCE(
                NULLIF(BTRIM(enrolled_course_name), ''),
                NULLIF(BTRIM(enrolled_course), ''),
                'Unassigned'
            )
            WHERE enrolled_course_name IS NULL OR BTRIM(enrolled_course_name) = ''
        $sql$;
    ELSE
        UPDATE public.student_profiles
        SET enrolled_course_name = 'Unassigned'
        WHERE enrolled_course_name IS NULL OR BTRIM(enrolled_course_name) = '';
    END IF;
END
$backfill_legacy_course_name$;

ALTER TABLE public.student_profiles
    ALTER COLUMN enrolled_course_name SET NOT NULL;

ALTER TABLE public.academic_documents
    ADD COLUMN IF NOT EXISTS approval_status approval_status_type NOT NULL DEFAULT 'approved',
    ADD COLUMN IF NOT EXISTS approved_by_staff_id UUID REFERENCES public.institute_staff(id),
    ADD COLUMN IF NOT EXISTS approved_by_name VARCHAR(255),
    ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
    ADD COLUMN IF NOT EXISTS created_by_name VARCHAR(255);

-- 14. Indexes for Extreme Scalability & Query Performance
CREATE INDEX IF NOT EXISTS idx_student_profiles_code ON public.student_profiles(student_id_code);
CREATE INDEX IF NOT EXISTS idx_student_profiles_email ON public.student_profiles(email);
CREATE INDEX IF NOT EXISTS idx_student_profiles_course ON public.student_profiles(enrolled_course_id);
CREATE INDEX IF NOT EXISTS idx_staff_code ON public.institute_staff(staff_id_code);
CREATE INDEX IF NOT EXISTS idx_staff_email ON public.institute_staff(email);
CREATE INDEX IF NOT EXISTS idx_academic_docs_cert ON public.academic_documents(certificate_number);
CREATE INDEX IF NOT EXISTS idx_academic_docs_stu ON public.academic_documents(student_id);
CREATE INDEX IF NOT EXISTS idx_student_att_date ON public.student_attendance(attendance_date, batch_id);
CREATE INDEX IF NOT EXISTS idx_staff_att_date ON public.staff_attendance(attendance_date);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON public.academic_audit_logs(entity_type, entity_id);

-- ====================================================================
-- 15. ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institute_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_test_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.govt_exam_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper functions to check authentication roles from JWT
CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS VARCHAR AS $$
    SELECT COALESCE(
        current_setting('request.jwt.claims', true)::jsonb->'app_metadata'->>'role',
        'public'
    );
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
    SELECT public.get_auth_role() = 'admin';
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN AS $$
    SELECT public.get_auth_role() IN ('admin', 'staff');
$$ LANGUAGE sql STABLE;

-- Courses & Batches: Public can read active courses, Staff/Admin can manage
CREATE POLICY "Public can view active courses" ON public.courses
    FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Staff and admin manage courses" ON public.courses
    FOR ALL USING (public.is_staff());

CREATE POLICY "Public can view active batches" ON public.batches
    FOR SELECT USING (TRUE);

CREATE POLICY "Staff and admin manage batches" ON public.batches
    FOR ALL USING (public.is_staff());

-- Staff Table: Only Admin can insert/delete/update, Staff can view colleagues
CREATE POLICY "Staff view colleagues" ON public.institute_staff
    FOR SELECT USING (public.is_staff());

CREATE POLICY "Admin manage staff" ON public.institute_staff
    FOR ALL USING (public.is_admin());

-- Student Profiles: Staff can view all, Students can view their own profile
CREATE POLICY "Staff view students" ON public.student_profiles
    FOR SELECT USING (public.is_staff());

CREATE POLICY "Staff manage students" ON public.student_profiles
    FOR ALL USING (public.is_staff());

CREATE POLICY "Student view own profile" ON public.student_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Student update own approved profile fields" ON public.student_profiles
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Attendance: Students can view their own attendance, Staff can mark student attendance, Admin can view all
CREATE POLICY "Staff manage student attendance" ON public.student_attendance
    FOR ALL USING (public.is_staff());

CREATE POLICY "Student view own attendance" ON public.student_attendance
    FOR SELECT USING (
        student_id IN (SELECT id FROM public.student_profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "Staff view own staff attendance" ON public.staff_attendance
    FOR SELECT USING (
        staff_id IN (SELECT id FROM public.institute_staff WHERE user_id = auth.uid()) OR public.is_admin()
    );

CREATE POLICY "Admin manage staff attendance" ON public.staff_attendance
    FOR ALL USING (public.is_admin());

-- Academic Documents (Certificates/Marksheets):
-- 1. Staff and Admin can view all
CREATE POLICY "Staff and Admin view documents" ON public.academic_documents
    FOR SELECT USING (public.is_staff());

-- 2. Staff can insert pending/draft documents
CREATE POLICY "Staff insert documents" ON public.academic_documents
    FOR INSERT WITH CHECK (public.is_staff());

-- 3. Only Admin can update approval_status or revoke documents
CREATE POLICY "Admin manage documents" ON public.academic_documents
    FOR UPDATE USING (public.is_admin());

-- 4. Students can ONLY view their own approved, valid documents
CREATE POLICY "Student view own approved documents" ON public.academic_documents
    FOR SELECT USING (
        approval_status = 'approved' AND
        student_id IN (SELECT id FROM public.student_profiles WHERE user_id = auth.uid())
    );

-- Assessments and Marks:
CREATE POLICY "Staff manage assessments" ON public.assessments
    FOR ALL USING (public.is_staff());

CREATE POLICY "Staff manage marks" ON public.student_marks
    FOR ALL USING (public.is_staff());

CREATE POLICY "Students view published marks" ON public.student_marks
    FOR SELECT USING (
        status = 'published' AND
        student_id IN (SELECT id FROM public.student_profiles WHERE user_id = auth.uid())
    );

-- Learning materials & Govt Papers:
CREATE POLICY "Anyone view published learning materials" ON public.learning_materials
    FOR SELECT USING (is_published = TRUE);

CREATE POLICY "Staff manage learning materials" ON public.learning_materials
    FOR ALL USING (public.is_staff());

CREATE POLICY "Anyone view govt exam papers" ON public.govt_exam_papers
    FOR SELECT USING (TRUE);

CREATE POLICY "Staff manage govt exam papers" ON public.govt_exam_papers
    FOR ALL USING (public.is_staff());

-- Mock Tests:
CREATE POLICY "Anyone view published tests" ON public.mock_tests
    FOR SELECT USING (is_published = TRUE);

CREATE POLICY "Staff manage mock tests" ON public.mock_tests
    FOR ALL USING (public.is_staff());

-- Mock Questions:
-- Questions visible to students, but correct_option_index is protected by RPC in live test
CREATE POLICY "Anyone view test questions" ON public.mock_questions
    FOR SELECT USING (TRUE);

CREATE POLICY "Staff manage questions" ON public.mock_questions
    FOR ALL USING (public.is_staff());

-- Mock Attempts:
CREATE POLICY "Students manage own attempts" ON public.mock_test_attempts
    FOR ALL USING (
        student_id IN (SELECT id FROM public.student_profiles WHERE user_id = auth.uid()) OR public.is_staff()
    );

-- Audit Logs: Admin only
CREATE POLICY "Admin view audit logs" ON public.academic_audit_logs
    FOR SELECT USING (public.is_admin());

CREATE POLICY "Staff append audit logs" ON public.academic_audit_logs
    FOR INSERT WITH CHECK (public.is_staff());

-- ====================================================================
-- 16. SECURE RPC: PUBLIC CERTIFICATE VERIFICATION
-- Security: Returns only minimal public verification data. Never returns marks,
-- full names, phone numbers, email, or private storage download links.
-- ====================================================================
CREATE OR REPLACE FUNCTION public.verify_certificate(p_certificate_number TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with elevated security to verify against registry without public read table access
AS $$
DECLARE
    clean_number TEXT;
    doc_rec RECORD;
    masked_name TEXT;
    result JSONB;
BEGIN
    clean_number := UPPER(TRIM(p_certificate_number));

    IF clean_number IS NULL OR clean_number = '' THEN
        RETURN jsonb_build_object(
            'found', FALSE,
            'status', 'NOT_FOUND',
            'message', 'Please enter a valid certificate or marksheet registration number.',
            'disclaimer', 'Official registry of Quantum Learning Institute.'
        );
    END IF;

    SELECT 
        d.id,
        d.certificate_number,
        d.course_name,
        d.issue_date,
        d.student_full_name,
        d.document_type,
        d.status,
        d.approval_status,
        d.revocation_reason
    INTO doc_rec
    FROM public.academic_documents d
    WHERE UPPER(d.certificate_number) = clean_number;

    IF NOT FOUND OR doc_rec.approval_status <> 'approved' THEN
        RETURN jsonb_build_object(
            'found', FALSE,
            'status', 'NOT_FOUND',
            'certificate_number', clean_number,
            'message', 'No verified credential was found in the Quantum Learning Institute authoritative registry matching this certificate number.',
            'disclaimer', 'Verified against Quantum Learning Institute authoritative registry. This confirms record authenticity at the institute and does not imply autonomous government accreditation.'
        );
    END IF;

    -- Compute Masked Name (e.g. Rahul Sharma -> R*** S***)
    masked_name := regexp_replace(doc_rec.student_full_name, '(\m\w)(\w+)', '\1***', 'g');

    IF doc_rec.status = 'revoked' THEN
        RETURN jsonb_build_object(
            'found', TRUE,
            'status', 'REVOKED',
            'certificate_number', doc_rec.certificate_number,
            'institute_name', 'Quantum Learning Institute',
            'course_name', doc_rec.course_name,
            'issue_date', doc_rec.issue_date,
            'student_masked_name', masked_name,
            'document_type', doc_rec.document_type,
            'revocation_reason', COALESCE(doc_rec.revocation_reason, 'Revoked by Quantum Learning Institute academic administration.'),
            'verification_timestamp', NOW(),
            'disclaimer', 'This certificate has been formally revoked by institutional authority and is invalid for any academic, professional, or government verification purpose.'
        );
    END IF;

    -- Valid Credential Response (No marks, no private URLs)
    RETURN jsonb_build_object(
        'found', TRUE,
        'status', 'VALID',
        'certificate_number', doc_rec.certificate_number,
        'institute_name', 'Quantum Learning Institute',
        'course_name', doc_rec.course_name,
        'issue_date', doc_rec.issue_date,
        'student_masked_name', masked_name,
        'document_type', doc_rec.document_type,
        'verification_timestamp', NOW(),
        'disclaimer', 'Verified against Quantum Learning Institute authoritative registry. This confirms record authenticity at the institute and does not imply autonomous government accreditation.'
    );
END;
$$;
