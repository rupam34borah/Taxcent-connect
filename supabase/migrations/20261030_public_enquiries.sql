-- Store public service and course enquiries centrally without exposing
-- submitted contact information to anonymous visitors.
CREATE TABLE IF NOT EXISTS public.enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number VARCHAR(40) NOT NULL UNIQUE,
  enquiry_type VARCHAR(30) NOT NULL
    CHECK (enquiry_type IN ('tax_service', 'course_admission', 'csc_service')),
  business_name VARCHAR(150) NOT NULL,
  service_or_course VARCHAR(200) NOT NULL,
  client_name VARCHAR(150) NOT NULL,
  phone VARCHAR(25) NOT NULL,
  location TEXT,
  notes TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'contacted', 'closed')),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_enquiries_submitted_at
  ON public.enquiries(submitted_at DESC);

ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.enquiries FROM PUBLIC, anon, authenticated;
GRANT INSERT ON public.enquiries TO anon, authenticated;
GRANT SELECT, UPDATE ON public.enquiries TO authenticated;

DROP POLICY IF EXISTS "Public can submit enquiries" ON public.enquiries;
CREATE POLICY "Public can submit enquiries"
  ON public.enquiries FOR INSERT TO anon, authenticated
  WITH CHECK (
    status = 'new'
    AND length(btrim(client_name)) BETWEEN 2 AND 150
    AND phone ~ '^[0-9+() .-]{10,25}$'
  );

DROP POLICY IF EXISTS "Staff can read enquiries" ON public.enquiries;
CREATE POLICY "Staff can read enquiries"
  ON public.enquiries FOR SELECT TO authenticated
  USING (public.is_staff());

DROP POLICY IF EXISTS "Staff can update enquiries" ON public.enquiries;
CREATE POLICY "Staff can update enquiries"
  ON public.enquiries FOR UPDATE TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

-- Private storage for uploaded academic credentials and staff-only answer sheets.
ALTER TABLE public.academic_documents
  ADD COLUMN IF NOT EXISTS file_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS is_portal_generated BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS assessment_id UUID REFERENCES public.assessments(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS assessment_title VARCHAR(255),
  ADD COLUMN IF NOT EXISTS marks_obtained NUMERIC(5, 2),
  ADD COLUMN IF NOT EXISTS max_score NUMERIC(5, 2),
  ADD COLUMN IF NOT EXISTS percentage NUMERIC(5, 2),
  ADD COLUMN IF NOT EXISTS grade VARCHAR(20),
  ADD COLUMN IF NOT EXISTS evaluator_remarks TEXT,
  ADD COLUMN IF NOT EXISTS batch_code VARCHAR(100),
  ADD COLUMN IF NOT EXISTS course_duration_months INT,
  ADD COLUMN IF NOT EXISTS answer_sheet_storage_path VARCHAR(500),
  ADD COLUMN IF NOT EXISTS answer_sheet_file_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS answer_sheet_mime_type VARCHAR(100);

-- Supabase REST access requires both SQL grants and matching RLS policies.
-- Existing policies in 20261028/20261029 decide which rows each role may use.
GRANT SELECT ON public.courses, public.batches TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.courses, public.batches TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON
  public.student_attendance, public.staff_attendance,
  public.assessments, public.student_marks TO authenticated;
GRANT SELECT ON public.learning_materials, public.govt_exam_papers,
  public.mock_tests TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON
  public.learning_materials, public.govt_exam_papers,
  public.mock_tests TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mock_questions TO authenticated;
GRANT SELECT ON public.mock_test_attempts TO authenticated;
GRANT SELECT, INSERT ON public.academic_audit_logs TO authenticated;

DROP POLICY IF EXISTS "Staff insert documents" ON public.academic_documents;
CREATE POLICY "Staff insert documents"
  ON public.academic_documents FOR INSERT TO authenticated
  WITH CHECK (
    public.is_staff()
    AND (public.is_admin() OR approval_status IN ('draft', 'pending'))
  );

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('academic-documents', 'academic-documents', FALSE, 10485760,
        ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = FALSE,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Staff manage academic storage" ON storage.objects;
CREATE POLICY "Staff manage academic storage"
  ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'academic-documents' AND public.is_staff())
  WITH CHECK (bucket_id = 'academic-documents' AND public.is_staff());

DROP POLICY IF EXISTS "Students read own credential files" ON storage.objects;
CREATE POLICY "Students read own credential files"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'academic-documents'
    AND EXISTS (
      SELECT 1
      FROM public.academic_documents AS d
      JOIN public.student_profiles AS sp ON sp.id = d.student_id
      WHERE d.file_storage_path = storage.objects.name
        AND sp.user_id = auth.uid()
        AND sp.is_portal_active = TRUE
        AND sp.enrolment_status NOT IN ('suspended', 'revoked')
        AND d.approval_status = 'approved'
        AND d.status = 'valid'
    )
  );

-- Persist an exam evaluation, marks entry, paired certificate/marksheet, and
-- audit events atomically. Role and student identity come from the session and
-- database roster; browser-supplied names and role flags are not trusted.
CREATE OR REPLACE FUNCTION public.submit_exam_evaluation(
  p_student_id UUID,
  p_course_name TEXT,
  p_batch_id UUID,
  p_batch_code TEXT,
  p_assessment_title TEXT,
  p_exam_date DATE,
  p_marks_obtained NUMERIC,
  p_remarks TEXT,
  p_certificate_number TEXT,
  p_issue_date DATE,
  p_answer_sheet_storage_path TEXT,
  p_answer_sheet_file_name TEXT,
  p_answer_sheet_mime_type TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_staff public.institute_staff%ROWTYPE;
  v_student public.student_profiles%ROWTYPE;
  v_assessment public.assessments%ROWTYPE;
  v_mark public.student_marks%ROWTYPE;
  v_certificate public.academic_documents%ROWTYPE;
  v_marksheet public.academic_documents%ROWTYPE;
  v_is_admin BOOLEAN;
  v_status approval_status_type;
  v_grade TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;
  SELECT * INTO v_staff FROM public.institute_staff
  WHERE user_id = auth.uid() AND is_active = TRUE AND invitation_status = 'active'
    AND role::text IN ('admin', 'staff') LIMIT 1;
  IF NOT FOUND THEN RAISE EXCEPTION 'Active staff access required' USING ERRCODE = '42501'; END IF;
  v_is_admin := v_staff.role::text = 'admin';
  v_status := CASE WHEN v_is_admin THEN 'published'::approval_status_type ELSE 'pending'::approval_status_type END;

  SELECT * INTO v_student FROM public.student_profiles
  WHERE id = p_student_id AND is_portal_active = TRUE
    AND enrolment_status NOT IN ('suspended', 'revoked');
  IF NOT FOUND THEN RAISE EXCEPTION 'Active student record not found' USING ERRCODE = '22023'; END IF;
  IF p_marks_obtained < 0 OR p_marks_obtained > 100 THEN
    RAISE EXCEPTION 'Marks must be between 0 and 100' USING ERRCODE = '22023';
  END IF;
  IF COALESCE(BTRIM(p_assessment_title), '') = '' OR COALESCE(BTRIM(p_certificate_number), '') = '' THEN
    RAISE EXCEPTION 'Assessment title and certificate number are required' USING ERRCODE = '22023';
  END IF;

  v_grade := CASE
    WHEN p_marks_obtained >= 85 THEN 'Distinction (A+)'
    WHEN p_marks_obtained >= 70 THEN 'Grade A'
    WHEN p_marks_obtained >= 55 THEN 'Grade B'
    WHEN p_marks_obtained >= 40 THEN 'Grade C'
    ELSE 'F'
  END;

  INSERT INTO public.assessments (
    title, course_id, batch_id, max_score, passing_score, assessment_date,
    status, created_by, approved_by
  ) VALUES (
    BTRIM(p_assessment_title), v_student.enrolled_course_id,
    COALESCE(p_batch_id, v_student.batch_id), 100, 40,
    COALESCE(p_exam_date, CURRENT_DATE), v_status, v_staff.id,
    CASE WHEN v_is_admin THEN v_staff.id ELSE NULL END
  ) RETURNING * INTO v_assessment;

  INSERT INTO public.student_marks (
    assessment_id, student_id, marks_obtained, max_score, grade, remarks,
    status, entered_by, approved_by
  ) VALUES (
    v_assessment.id, v_student.id, p_marks_obtained, 100, v_grade,
    NULLIF(BTRIM(p_remarks), ''), v_status, v_staff.id,
    CASE WHEN v_is_admin THEN v_staff.id ELSE NULL END
  ) RETURNING * INTO v_mark;

  INSERT INTO public.academic_documents (
    student_id, document_type, certificate_number, marksheet_number,
    student_id_code, student_full_name, course_name, issue_date,
    marks_or_grade, file_storage_path, file_name, file_mime_type,
    file_size_bytes, status, approval_status, approved_by_staff_id,
    approved_by_name, approved_at, created_by, created_by_name,
    is_portal_generated, assessment_id, assessment_title, marks_obtained,
    max_score, percentage, grade, evaluator_remarks, batch_code,
    answer_sheet_storage_path, answer_sheet_file_name, answer_sheet_mime_type
  ) VALUES (
    v_student.id, 'certificate', p_certificate_number,
    p_certificate_number || '-M', v_student.student_id_code,
    v_student.full_name, COALESCE(NULLIF(BTRIM(p_course_name), ''), v_student.enrolled_course_name),
    COALESCE(p_issue_date, CURRENT_DATE), v_grade || ' (' || p_marks_obtained || '%)',
    'generated/' || v_student.id::text || '/' || p_certificate_number || '.svg',
    v_student.full_name || '_' || p_certificate_number || '_Certificate.svg',
    'image/svg+xml', 0, 'valid', CASE WHEN v_is_admin THEN 'approved'::approval_status_type ELSE 'pending'::approval_status_type END,
    CASE WHEN v_is_admin THEN v_staff.id ELSE NULL END,
    CASE WHEN v_is_admin THEN v_staff.full_name ELSE NULL END,
    CASE WHEN v_is_admin THEN NOW() ELSE NULL END, auth.uid(), v_staff.full_name,
    TRUE, v_assessment.id, p_assessment_title, p_marks_obtained, 100,
    p_marks_obtained, v_grade, NULLIF(BTRIM(p_remarks), ''),
    COALESCE(p_batch_code, v_student.batch_code), p_answer_sheet_storage_path,
    p_answer_sheet_file_name, p_answer_sheet_mime_type
  ) RETURNING * INTO v_certificate;

  INSERT INTO public.academic_documents (
    student_id, document_type, certificate_number, marksheet_number,
    student_id_code, student_full_name, course_name, issue_date,
    marks_or_grade, file_storage_path, file_name, file_mime_type,
    file_size_bytes, status, approval_status, approved_by_staff_id,
    approved_by_name, approved_at, created_by, created_by_name,
    is_portal_generated, assessment_id, assessment_title, marks_obtained,
    max_score, percentage, grade, evaluator_remarks, batch_code,
    answer_sheet_storage_path, answer_sheet_file_name, answer_sheet_mime_type
  ) VALUES (
    v_student.id, 'marksheet', p_certificate_number || '-M',
    p_certificate_number || '-M', v_student.student_id_code,
    v_student.full_name, COALESCE(NULLIF(BTRIM(p_course_name), ''), v_student.enrolled_course_name),
    COALESCE(p_issue_date, CURRENT_DATE), v_grade || ' (' || p_marks_obtained || '%)',
    'generated/' || v_student.id::text || '/' || p_certificate_number || '-M.svg',
    v_student.full_name || '_' || p_certificate_number || '_Marksheet.svg',
    'image/svg+xml', 0, 'valid', CASE WHEN v_is_admin THEN 'approved'::approval_status_type ELSE 'pending'::approval_status_type END,
    CASE WHEN v_is_admin THEN v_staff.id ELSE NULL END,
    CASE WHEN v_is_admin THEN v_staff.full_name ELSE NULL END,
    CASE WHEN v_is_admin THEN NOW() ELSE NULL END, auth.uid(), v_staff.full_name,
    TRUE, v_assessment.id, p_assessment_title, p_marks_obtained, 100,
    p_marks_obtained, v_grade, NULLIF(BTRIM(p_remarks), ''),
    COALESCE(p_batch_code, v_student.batch_code), p_answer_sheet_storage_path,
    p_answer_sheet_file_name, p_answer_sheet_mime_type
  ) RETURNING * INTO v_marksheet;

  INSERT INTO public.academic_audit_logs (
    entity_type, entity_id, action, performed_by_id,
    performed_by_name, performed_by_role, details
  ) VALUES
    ('MARKS', v_assessment.id::text, 'CREATE', auth.uid(), v_staff.full_name, v_staff.role::text,
      jsonb_build_object('studentIdCode', v_student.student_id_code, 'marksObtained', p_marks_obtained, 'certificateNumber', p_certificate_number)),
    ('DOCUMENT', v_certificate.id::text, 'CREATE', auth.uid(), v_staff.full_name, v_staff.role::text,
      jsonb_build_object('certificateNumber', p_certificate_number, 'studentIdCode', v_student.student_id_code));

  RETURN jsonb_build_object(
    'assessment', to_jsonb(v_assessment), 'marksRecord', to_jsonb(v_mark),
    'document', to_jsonb(v_certificate), 'marksheet', to_jsonb(v_marksheet)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.submit_exam_evaluation(UUID, TEXT, UUID, TEXT, TEXT, DATE, NUMERIC, TEXT, TEXT, DATE, TEXT, TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.submit_exam_evaluation(UUID, TEXT, UUID, TEXT, TEXT, DATE, NUMERIC, TEXT, TEXT, DATE, TEXT, TEXT, TEXT) TO authenticated;
