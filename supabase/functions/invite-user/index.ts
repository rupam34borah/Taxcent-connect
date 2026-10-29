import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, 'Content-Type': 'application/json' },
});

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);

  const authorization = request.headers.get('Authorization');
  const token = authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return json({ error: 'Authentication required.' }, 401);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceRoleKey) return json({ error: 'Invitation service is not configured.' }, 500);

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: authData, error: authError } = await admin.auth.getUser(token);
  if (authError || !authData.user) return json({ error: 'Your session is invalid or expired. Sign in again.' }, 401);

  const { data: actor, error: actorError } = await admin
    .from('institute_staff')
    .select('id, role, is_active, invitation_status')
    .eq('user_id', authData.user.id)
    .maybeSingle();
  if (actorError || !actor || actor.is_active !== true || actor.invitation_status !== 'active') {
    return json({ error: 'An active institute staff account is required.' }, 403);
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request body.' }, 400);
  }

  const kind = body.kind;
  const fullName = typeof body.fullName === 'string' ? body.fullName.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
  if ((kind !== 'staff' && kind !== 'student') || fullName.length < 2 || fullName.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 255) {
    return json({ error: 'Enter a valid name and email address.' }, 400);
  }
  if (kind === 'staff' && actor.role !== 'admin') return json({ error: 'Only an administrator can invite staff.' }, 403);

  const redirectTo = Deno.env.get('APP_SITE_URL');
  const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { full_name: fullName },
    ...(redirectTo ? { redirectTo } : {}),
  });
  if (inviteError || !invited.user) return json({ error: inviteError?.message || 'Could not send the invitation email.' }, 400);

  if (kind === 'staff') {
    const role = body.role === 'admin' ? 'admin' : 'staff';
    const { data: staff, error } = await admin.from('institute_staff').insert({
      user_id: invited.user.id,
      staff_id_code: String(body.staffIdCode || '').slice(0, 50),
      full_name: fullName,
      email,
      phone,
      designation: String(body.designation || 'Instructor').slice(0, 150),
      role,
      permissions: Array.isArray(body.permissions) ? body.permissions : [],
      assigned_courses: Array.isArray(body.assignedCourses) ? body.assignedCourses : [],
      assigned_batches: Array.isArray(body.assignedBatches) ? body.assignedBatches : [],
      is_active: true,
      invitation_status: 'active',
    }).select('*').single();
    if (error) {
      await admin.auth.admin.deleteUser(invited.user.id);
      return json({ error: error.message }, 400);
    }
    return json({ staff });
  }

  const { data: student, error } = await admin.from('student_profiles').insert({
    user_id: invited.user.id,
    student_id_code: String(body.studentIdCode || '').slice(0, 50),
    full_name: fullName,
    email,
    phone,
    enrolled_course_id: typeof body.courseId === 'string' ? body.courseId : null,
    enrolled_course_name: String(body.courseName || 'Unassigned').slice(0, 255),
    batch_id: typeof body.batchId === 'string' ? body.batchId : null,
    batch_code: typeof body.batchCode === 'string' ? body.batchCode.slice(0, 100) : null,
    admission_date: typeof body.admissionDate === 'string' ? body.admissionDate : new Date().toISOString().slice(0, 10),
    enrolment_status: 'active',
    is_portal_active: true,
    invitation_sent_at: new Date().toISOString(),
    created_by: actor.id,
  }).select('*').single();
  if (error) {
    await admin.auth.admin.deleteUser(invited.user.id);
    return json({ error: error.message }, 400);
  }
  return json({ student });
});
