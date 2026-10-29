-- Security hardening for the academic portal.
-- Apply after 20261027_certificates_and_marksheets.sql and
-- 20261028_academic_schema.sql. This migration is additive so it can repair
-- installations where the earlier CREATE TABLE IF NOT EXISTS statements
-- skipped columns that were already present in the older schema.

-- Repair legacy table shapes used by the current application.
ALTER TABLE public.institute_staff
  ADD COLUMN IF NOT EXISTS staff_id_code VARCHAR(50),
  ADD COLUMN IF NOT EXISTS phone VARCHAR(25),
  ADD COLUMN IF NOT EXISTS designation VARCHAR(150) NOT NULL DEFAULT 'Instructor',
  ADD COLUMN IF NOT EXISTS permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS assigned_courses JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS assigned_batches JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS invitation_status VARCHAR(50) NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

UPDATE public.institute_staff
SET staff_id_code = 'QLI-STF-' || UPPER(SUBSTRING(REPLACE(id::text, '-', ''), 1, 8))
WHERE staff_id_code IS NULL OR BTRIM(staff_id_code) = '';

ALTER TABLE public.institute_staff
  ALTER COLUMN staff_id_code SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_institute_staff_user_id_unique
  ON public.institute_staff(user_id)
  WHERE user_id IS NOT NULL;

ALTER TABLE public.student_profiles
  ADD COLUMN IF NOT EXISTS enrolled_course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS enrolled_course_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS batch_id UUID REFERENCES public.batches(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS batch_code VARCHAR(100),
  ADD COLUMN IF NOT EXISTS enrolment_status VARCHAR(50) NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS is_portal_active BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS invitation_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.institute_staff(id) ON DELETE SET NULL;

DO $backfill_student_course$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'student_profiles'
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
$backfill_student_course$;

ALTER TABLE public.student_profiles
  ALTER COLUMN enrolled_course_name SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_student_profiles_user_id_unique
  ON public.student_profiles(user_id)
  WHERE user_id IS NOT NULL;

ALTER TABLE public.academic_documents
  ADD COLUMN IF NOT EXISTS marksheet_number VARCHAR(100),
  ADD COLUMN IF NOT EXISTS approval_status approval_status_type NOT NULL DEFAULT 'approved',
  ADD COLUMN IF NOT EXISTS approved_by_staff_id UUID REFERENCES public.institute_staff(id),
  ADD COLUMN IF NOT EXISTS approved_by_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
  ADD COLUMN IF NOT EXISTS created_by_name VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_student_profiles_user_id
  ON public.student_profiles(user_id);

-- Use active database roster rows as the source of authorization. JWT user
-- metadata and browser-provided role values are not authorization sources.
CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS VARCHAR
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
  SELECT COALESCE(
    (
      SELECT s.role::text
      FROM public.institute_staff AS s
      WHERE s.user_id = auth.uid()
        AND s.is_active = TRUE
        AND s.invitation_status = 'active'
        AND s.role::text IN ('admin', 'staff')
      LIMIT 1
    ),
    CASE WHEN EXISTS (
      SELECT 1
      FROM public.student_profiles AS sp
      WHERE sp.user_id = auth.uid()
        AND sp.is_portal_active = TRUE
        AND sp.enrolment_status NOT IN ('suspended', 'revoked')
    ) THEN 'student' ELSE 'public' END
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.institute_staff AS s
    WHERE s.user_id = auth.uid()
      AND s.is_active = TRUE
      AND s.invitation_status = 'active'
      AND s.role::text = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.institute_staff AS s
    WHERE s.user_id = auth.uid()
      AND s.is_active = TRUE
      AND s.invitation_status = 'active'
      AND s.role::text IN ('admin', 'staff')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_authorised_staff()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
  SELECT public.is_staff();
$$;

-- Remove permissive legacy policies from both schema generations before
-- installing one explicit policy set for each sensitive table.
DO $drop_sensitive_policies$
DECLARE
  policy_row RECORD;
BEGIN
  FOR policy_row IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = ANY (ARRAY[
        'student_profiles', 'institute_staff', 'academic_documents',
        'document_audit_logs', 'academic_audit_logs',
        'mock_questions', 'mock_test_attempts'
      ])
  LOOP
    EXECUTE FORMAT(
      'DROP POLICY IF EXISTS %I ON %I.%I',
      policy_row.policyname,
      policy_row.schemaname,
      policy_row.tablename
    );
  END LOOP;
END
$drop_sensitive_policies$;

ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institute_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_test_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authorized staff read student profiles"
  ON public.student_profiles FOR SELECT TO authenticated
  USING (public.is_staff() OR user_id = auth.uid());
CREATE POLICY "Authorized staff insert student profiles"
  ON public.student_profiles FOR INSERT TO authenticated
  WITH CHECK (public.is_staff());
CREATE POLICY "Authorized staff update student profiles"
  ON public.student_profiles FOR UPDATE TO authenticated
  USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE POLICY "Admins delete student profiles"
  ON public.student_profiles FOR DELETE TO authenticated
  USING (public.is_admin());

CREATE POLICY "Staff read staff roster"
  ON public.institute_staff FOR SELECT TO authenticated
  USING (public.is_staff());
CREATE POLICY "Admins insert staff roster"
  ON public.institute_staff FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());
CREATE POLICY "Admins update staff roster"
  ON public.institute_staff FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins delete staff roster"
  ON public.institute_staff FOR DELETE TO authenticated
  USING (public.is_admin());

CREATE POLICY "Staff read academic documents"
  ON public.academic_documents FOR SELECT TO authenticated
  USING (public.is_staff());
CREATE POLICY "Students read their approved academic documents"
  ON public.academic_documents FOR SELECT TO authenticated
  USING (
    approval_status = 'approved'
    AND student_id IN (
      SELECT sp.id FROM public.student_profiles AS sp WHERE sp.user_id = auth.uid()
    )
  );
CREATE POLICY "Staff create pending academic documents"
  ON public.academic_documents FOR INSERT TO authenticated
  WITH CHECK (public.is_staff() AND approval_status IN ('draft', 'pending'));
CREATE POLICY "Admins update academic documents"
  ON public.academic_documents FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins delete academic documents"
  ON public.academic_documents FOR DELETE TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins read document audit logs"
  ON public.document_audit_logs FOR SELECT TO authenticated
  USING (public.is_admin());
CREATE POLICY "Staff append document audit logs"
  ON public.document_audit_logs FOR INSERT TO authenticated
  WITH CHECK (public.is_staff() AND performed_by = auth.uid());

CREATE POLICY "Admins read academic audit logs"
  ON public.academic_audit_logs FOR SELECT TO authenticated
  USING (public.is_admin());
CREATE POLICY "Staff append academic audit logs"
  ON public.academic_audit_logs FOR INSERT TO authenticated
  WITH CHECK (public.is_staff() AND performed_by_id = auth.uid());

CREATE POLICY "Staff manage mock questions"
  ON public.mock_questions FOR ALL TO authenticated
  USING (public.is_staff()) WITH CHECK (public.is_staff());

CREATE POLICY "Students and staff read authorized mock attempts"
  ON public.mock_test_attempts FOR SELECT TO authenticated
  USING (
    public.is_staff()
    OR student_id IN (
      SELECT sp.id FROM public.student_profiles AS sp WHERE sp.user_id = auth.uid()
    )
  );

REVOKE ALL ON public.student_profiles, public.institute_staff,
  public.academic_documents, public.document_audit_logs,
  public.academic_audit_logs FROM PUBLIC, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.institute_staff TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.academic_documents TO authenticated;
GRANT SELECT, INSERT ON public.document_audit_logs TO authenticated;
GRANT SELECT, INSERT ON public.academic_audit_logs TO authenticated;

-- No direct public or student query may retrieve correct_option_index or edit
-- a score. Staff retain table access under the staff-only RLS policy.
REVOKE ALL ON public.mock_questions FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mock_questions TO authenticated;
REVOKE ALL ON public.mock_test_attempts FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.mock_test_attempts TO authenticated;

REVOKE ALL ON FUNCTION public.get_auth_role() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_staff() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_authorised_staff() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_auth_role() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_staff() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_authorised_staff() TO anon, authenticated;

-- Return published question text and choices only. Answer keys and explanations
-- are excluded until the authenticated student submits the test.
CREATE OR REPLACE FUNCTION public.get_published_mock_tests(p_category TEXT DEFAULT NULL)
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
  SELECT COALESCE(JSONB_AGG(t.test_json ORDER BY t.title), '[]'::jsonb)
  FROM (
    SELECT
      mt.title,
      JSONB_BUILD_OBJECT(
        'id', mt.id::text,
        'title', mt.title,
        'category', mt.category::text,
        'targetExam', mt.target_exam,
        'durationMinutes', mt.duration_minutes,
        'totalQuestions', COUNT(mq.id),
        'totalMarks', COALESCE(SUM(mq.marks), 0),
        'passingPercentage', mt.passing_percentage,
        'instructions', mt.instructions,
        'isPublished', mt.is_published,
        'questions', COALESCE(
          JSONB_AGG(
            JSONB_BUILD_OBJECT(
              'id', mq.id::text,
              'questionText', mq.question_text,
              'questionTextAs', mq.question_text_as,
              'options', mq.options,
              'marks', mq.marks
            ) ORDER BY mq.question_order
          ) FILTER (WHERE mq.id IS NOT NULL),
          '[]'::jsonb
        )
      ) AS test_json
    FROM public.mock_tests AS mt
    LEFT JOIN public.mock_questions AS mq ON mq.test_id = mt.id
    WHERE mt.is_published = TRUE
      AND (p_category IS NULL OR mt.category::text = p_category)
      AND (
        public.is_staff()
        OR EXISTS (
          SELECT 1
          FROM public.student_profiles AS sp
          WHERE sp.user_id = auth.uid()
            AND sp.is_portal_active = TRUE
            AND sp.enrolment_status NOT IN ('suspended', 'revoked')
        )
      )
    GROUP BY mt.id
  ) AS t;
$$;

REVOKE ALL ON FUNCTION public.get_published_mock_tests(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_published_mock_tests(TEXT) TO authenticated;

-- Score on the server from the authenticated student's database identity.
-- Client-supplied student IDs, names, scores, and pass flags are ignored.
CREATE OR REPLACE FUNCTION public.submit_mock_test_attempt(
  p_test_id UUID,
  p_answers JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_student public.student_profiles%ROWTYPE;
  v_test public.mock_tests%ROWTYPE;
  v_attempt public.mock_test_attempts%ROWTYPE;
  v_score INTEGER;
  v_total INTEGER;
  v_percentage NUMERIC(5, 2);
  v_passed BOOLEAN;
  v_questions JSONB;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;

  SELECT sp.* INTO v_student
  FROM public.student_profiles AS sp
  WHERE sp.user_id = auth.uid()
    AND sp.is_portal_active = TRUE
    AND sp.enrolment_status NOT IN ('suspended', 'revoked')
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'An active student profile is required' USING ERRCODE = '42501';
  END IF;

  SELECT mt.* INTO v_test
  FROM public.mock_tests AS mt
  WHERE mt.id = p_test_id AND mt.is_published = TRUE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Published mock test not found' USING ERRCODE = '22023';
  END IF;

  IF p_answers IS NULL OR JSONB_TYPEOF(p_answers) <> 'object' THEN
    RAISE EXCEPTION 'Answers must be an object of question IDs and option indexes' USING ERRCODE = '22023';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM JSONB_EACH(p_answers) AS answer(key, value)
    WHERE NOT EXISTS (
      SELECT 1
      FROM public.mock_questions AS mq
      WHERE mq.test_id = p_test_id
        AND mq.id::text = answer.key
        AND JSONB_TYPEOF(answer.value) = 'number'
        AND CASE
          WHEN answer.value::text ~ '^[0-3]$'
            THEN answer.value::text::integer < JSONB_ARRAY_LENGTH(mq.options)
          ELSE FALSE
        END
    )
  ) THEN
    RAISE EXCEPTION 'One or more submitted answers are invalid' USING ERRCODE = '22023';
  END IF;

  SELECT
    COALESCE(SUM(CASE
      WHEN p_answers ->> mq.id::text = mq.correct_option_index::text THEN mq.marks
      ELSE 0
    END), 0),
    COALESCE(SUM(mq.marks), 0)
  INTO v_score, v_total
  FROM public.mock_questions AS mq
  WHERE mq.test_id = p_test_id;

  IF v_total <= 0 THEN
    RAISE EXCEPTION 'Mock test has no scorable questions' USING ERRCODE = '22023';
  END IF;

  v_percentage := ROUND((v_score::numeric * 100) / v_total, 2);
  v_passed := v_percentage >= v_test.passing_percentage;

  INSERT INTO public.mock_test_attempts (
    test_id, student_id, started_at, completed_at, user_answers,
    score_obtained, total_marks, percentage, passed
  ) VALUES (
    v_test.id, v_student.id, NOW(), NOW(), p_answers,
    v_score, v_total, v_percentage, v_passed
  )
  RETURNING * INTO v_attempt;

  SELECT COALESCE(
    JSONB_AGG(
      JSONB_BUILD_OBJECT(
        'id', mq.id::text,
        'questionText', mq.question_text,
        'questionTextAs', mq.question_text_as,
        'options', mq.options,
        'correctOptionIndex', mq.correct_option_index,
        'explanation', mq.explanation,
        'marks', mq.marks
      ) ORDER BY mq.question_order
    ),
    '[]'::jsonb
  ) INTO v_questions
  FROM public.mock_questions AS mq
  WHERE mq.test_id = p_test_id;

  RETURN JSONB_BUILD_OBJECT(
    'attempt', JSONB_BUILD_OBJECT(
      'id', v_attempt.id::text,
      'testId', v_attempt.test_id::text,
      'testTitle', v_test.title,
      'studentId', v_student.id::text,
      'studentName', v_student.full_name,
      'startedAt', v_attempt.started_at,
      'completedAt', v_attempt.completed_at,
      'userAnswers', v_attempt.user_answers,
      'scoreObtained', v_attempt.score_obtained,
      'totalMarks', v_attempt.total_marks,
      'percentage', v_attempt.percentage,
      'passed', v_attempt.passed
    ),
    'test', JSONB_BUILD_OBJECT(
      'id', v_test.id::text,
      'title', v_test.title,
      'category', v_test.category::text,
      'targetExam', v_test.target_exam,
      'durationMinutes', v_test.duration_minutes,
      'totalQuestions', JSONB_ARRAY_LENGTH(v_questions),
      'totalMarks', v_total,
      'passingPercentage', v_test.passing_percentage,
      'instructions', v_test.instructions,
      'isPublished', v_test.is_published,
      'questions', v_questions
    )
  );
END;
$$;

REVOKE ALL ON FUNCTION public.submit_mock_test_attempt(UUID, JSONB) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.submit_mock_test_attempt(UUID, JSONB) TO authenticated;

-- Pin the verification function's search path while keeping its response
-- limited to the existing privacy-preserving fields.
CREATE OR REPLACE FUNCTION public.verify_certificate(p_certificate_number TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  clean_number TEXT;
  doc_rec RECORD;
  masked_name TEXT;
BEGIN
  clean_number := UPPER(TRIM(p_certificate_number));

  IF clean_number IS NULL OR clean_number = '' THEN
    RETURN JSONB_BUILD_OBJECT(
      'found', FALSE,
      'status', 'NOT_FOUND',
      'message', 'Please enter a valid certificate or marksheet registration number.',
      'disclaimer', 'Official registry of Quantum Learning Institute.'
    );
  END IF;

  SELECT d.certificate_number, d.course_name, d.issue_date,
         d.student_full_name, d.document_type, d.status,
         d.approval_status, d.revocation_reason
  INTO doc_rec
  FROM public.academic_documents AS d
  WHERE UPPER(d.certificate_number) = clean_number;

  IF NOT FOUND OR doc_rec.approval_status <> 'approved' THEN
    RETURN JSONB_BUILD_OBJECT(
      'found', FALSE,
      'status', 'NOT_FOUND',
      'certificate_number', clean_number,
      'message', 'No verified credential was found in the authoritative registry matching this number.',
      'disclaimer', 'Verified against Quantum Learning Institute authoritative registry.'
    );
  END IF;

  masked_name := REGEXP_REPLACE(doc_rec.student_full_name, '(\m\w)(\w+)', '\1***', 'g');

  IF doc_rec.status = 'revoked' THEN
    RETURN JSONB_BUILD_OBJECT(
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
      'disclaimer', 'This credential has been revoked and is no longer valid.'
    );
  END IF;

  RETURN JSONB_BUILD_OBJECT(
    'found', TRUE,
    'status', 'VALID',
    'certificate_number', doc_rec.certificate_number,
    'institute_name', 'Quantum Learning Institute',
    'course_name', doc_rec.course_name,
    'issue_date', doc_rec.issue_date,
    'student_masked_name', masked_name,
    'document_type', doc_rec.document_type,
    'verification_timestamp', NOW(),
    'disclaimer', 'Verified against Quantum Learning Institute authoritative registry.'
  );
END;
$$;

REVOKE ALL ON FUNCTION public.verify_certificate(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verify_certificate(TEXT) TO anon, authenticated;
