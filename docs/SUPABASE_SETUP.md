# Quantum Learning Institute / Taxcent Connect
## Academic Records, Authentication, and Certificate Verification Setup

This guide covers Supabase setup for authentication and academic records. The SQL files in this repository are migrations; the app does not run them automatically.

---

### 1. Create a Supabase Project
1. Log in to [Supabase](https://supabase.com) and create a project.
2. Choose the database region that fits your deployment.
3. Save the database password securely.

---

### 2. Review and Apply Database Migrations
Apply every SQL file in `supabase/migrations/` in filename order. In the Supabase Dashboard, open **SQL Editor**, create a query for each file, and run it before connecting the production app.

The `20261029_security_hardening.sql` migration repairs columns that older `CREATE TABLE IF NOT EXISTS` migrations may have skipped, replaces permissive policies on academic records, and adds server-side mock-test RPCs.

Review the SQL and take a database backup before applying migrations to a live database. This repository does not run migrations automatically.

---

### 3. Provision User Accounts
1. Create each person's account in Supabase Auth through a trusted administrative workflow.
2. Link the Auth user UUID to exactly one row in `student_profiles` or `institute_staff` using `user_id`.
3. Assign staff and admin roles in `institute_staff.role` through a trusted administrative process. Do not grant portal roles from browser code or `user_metadata`.
4. Set `is_portal_active = TRUE` for eligible students and `is_active = TRUE`, `invitation_status = 'active'` for eligible staff.

The client verifies each role against these database rows after Supabase password authentication. If Supabase is not configured or the account has no active profile, sign-in is denied.

---

### 4. Create a Private Storage Bucket
1. In the Supabase Dashboard, open **Storage** and create a bucket named `academic-documents`.
2. Leave **Public bucket** switched **OFF**.
3. Optionally allow `application/pdf`, `image/png`, and `image/jpeg`; set a 5 MB size limit.

Private files must be served through authenticated, short-lived signed URLs. Do not publish student documents in a public bucket.

---

### 5. Configure Environment Variables
Copy `.env.example` to `.env` for local development or set these values in your hosting platform:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key
```

Never put `SUPABASE_SERVICE_ROLE_KEY` in frontend code. Use only the public anon key; PostgreSQL Row Level Security (RLS) enforces access. Public certificate verification uses the privacy-preserving `verify_certificate` function.

---

### 6. Development Preview and Mock Tests
Development builds without Supabase may use browser storage and sample data for UI preview. This mode is not secure or authoritative and must not be used for production records.

Production builds fail closed: they do not use browser storage as the source of identity, official records, certificate verification, or mock-test scores. Mock-test questions are served without answer keys. Scores are calculated by `submit_mock_test_attempt()` using the authenticated student's profile, and answer keys are returned only after that student submits. Students should not receive direct table access to `mock_questions` or write access to `mock_test_attempts`.
