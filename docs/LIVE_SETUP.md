# Live setup checklist

The website uses GitHub Pages for static files and Supabase for accounts and live records. A Pages deploy does not deploy Supabase migrations or Edge Functions.

## 1. Apply the final database migration

In the Supabase SQL Editor, run the complete contents of `supabase/migrations/20261030_public_enquiries.sql` after migrations `20261027`, `20261028`, and `20261029`. The earlier migrations establish the tables and security policies used by this one.

## 2. Create the first administrator

The invitation function is intentionally restricted to an already active administrator, so bootstrap the first administrator once:

1. In Supabase Authentication, create the institute owner's user. Verify the email before continuing.
2. Copy that user's Auth UID and email from the Users page.
3. In the SQL Editor, insert the matching administrator roster row. Replace the example values with the Auth UID, email, and institute owner's name:

```sql
INSERT INTO public.institute_staff (
  user_id, staff_id_code, full_name, email, designation, role,
  is_active, invitation_status
)
VALUES (
  'PASTE-AUTH-USER-UUID', 'QLI-STF-ADMIN-001', 'Institute Owner',
  'owner@example.com', 'Administrator', 'admin', TRUE, 'active'
);
```

Use the same email address that was created in Supabase Auth. Do not put a password, service-role key, or secret key in this SQL or in the website.

## 3. Deploy the invitation Edge Function

Deploy `supabase/functions/invite-user/index.ts` to the same Supabase project with the function name `invite-user` and JWT verification enabled. The function uses Supabase's server-side `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` environment values; never expose the service-role key in frontend variables or GitHub Pages.

## 4. Set Supabase Auth redirects

In Supabase Authentication URL configuration, set the site URL to the GitHub Pages address, normally `https://rupam34borah.github.io/Taxcent-connect/`, and add that address as an allowed redirect URL. If the repository owner or repository name differs, use the actual Pages address. Set the Edge Function's optional `APP_SITE_URL` to that same address so invitation links return to the app.

## 5. Deploy the website

The GitHub Actions workflow expects the repository variable `VITE_SUPABASE_URL` and repository secret `VITE_SUPABASE_ANON_KEY`. The anon/publishable key is designed for browser use when Row Level Security policies are enabled. Never use a Supabase service-role or secret key here. Run the existing Pages workflow from the intended branch after the code and required Supabase setup are ready.

## Empty production data

Local demo records are only enabled for an unconfigured development preview. With Supabase configured, the live app reads and writes database records and does not copy browser-local demo records into Supabase. Add only real courses and batches after the schema is ready; no demo student rows are required.
