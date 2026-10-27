# Quantum Learning Institute / Taxcent Connect
## Marksheets, Certificates & Public Verification Setup Guide

This guide details how to configure Supabase for Quantum Learning Institute's academic records, certificates, marksheets, and public verification system.

---

### 1. Create a Supabase Project
1. Log in to [https://supabase.com](https://supabase.com) and click **New Project**.
2. Set Name: `Taxcent-Quantum-Certificates`.
3. Choose your nearest database region (e.g., `ap-south-1` Mumbai or Singapore).
4. Save your database password securely.

---

### 2. Run Database Migration
1. In the Supabase Dashboard, go to **SQL Editor** in the left sidebar.
2. Click **New Query**.
3. Copy and paste the entire contents of:
   `supabase/migrations/20261027_certificates_and_marksheets.sql`
4. Click **Run** (Ctrl + Enter).
5. All 4 tables (`student_profiles`, `institute_staff`, `academic_documents`, `document_audit_logs`), indexes, RLS policies, and the `verify_certificate()` RPC function will be created.

---

### 3. Create Storage Bucket for Documents
1. In the Supabase Dashboard, navigate to **Storage**.
2. Click **New Bucket**.
3. Name: `academic-documents`
4. **Important**: Leave **Public bucket** switched **OFF** (Private).
   - This prevents unauthorized visitors from guessing URLs to inspect student marks or files.
   - Files are securely retrieved via short-lived authenticated Signed URLs (`createSignedUrl`).
5. Set allowed MIME types (optional): `application/pdf`, `image/png`, `image/jpeg`.
6. Set max file size limit: `5MB`.

---

### 4. Configure Environment Variables
Copy `.env.example` to `.env` or set in your hosting platform (Vercel, Netlify, or GitHub Secrets):

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> **Security Note:** Never expose the `SUPABASE_SERVICE_ROLE_KEY` in frontend client code. Only use the public `VITE_SUPABASE_ANON_KEY`. All security and role separation is enforced at the PostgreSQL database level using Row Level Security (RLS) and the `verify_certificate` SECURITY DEFINER function.

---

### 5. Offline & Preview Fallback
If `VITE_SUPABASE_URL` is not yet configured, the app will run in an intelligent **Secure Offline/Preview Mode** with persistent browser storage, mock students, pre-seeded sample certificates (Valid, Revoked, and Marksheets), allowing you to immediately test Staff uploads, Student viewing, and Public verification without waiting for remote server provisioning!
