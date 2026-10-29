import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { UserRole } from '../types/academic';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { credentialStore } from '../services/credentialStore';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'staff' | 'admin';
  studentIdCode?: string;
  studentId?: string;
  title?: string;
  courseName?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  role: UserRole;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  authModalInitialRole: 'student' | 'staff' | 'admin';
  openAuthModal: (initialRole?: 'student' | 'staff' | 'admin') => void;
  closeAuthModal: () => void;
  login: (identifier: string, password?: string, requestedRole?: 'student' | 'staff' | 'admin') => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function resolveAuthorizedUser(authUser: User): Promise<AuthUser | null> {
  if (!supabase) return null;

  // Attempt auto-linking if the user was pre-enrolled on the roster by admin
  try {
    await supabase.rpc('claim_roster_profile');
  } catch {
    // If migration function is not installed, proceed to direct queries
  }

  // 1. Check institute staff by user_id
  let { data: staff, error: staffError } = await supabase
    .from('institute_staff')
    .select('id, full_name, email, role, is_active, invitation_status, user_id')
    .eq('user_id', authUser.id)
    .maybeSingle();

  if (staffError) {
    console.warn('Staff lookup note:', staffError.message);
  }

  // 2. If not linked by user_id, check by email
  if (!staff && authUser.email) {
    const { data: staffByEmail } = await supabase
      .from('institute_staff')
      .select('id, full_name, email, role, is_active, invitation_status, user_id')
      .eq('email', authUser.email.trim().toLowerCase())
      .maybeSingle();

    if (staffByEmail) {
      staff = staffByEmail;
      // Auto-link user_id
      try {
        await supabase
          .from('institute_staff')
          .update({ user_id: authUser.id })
          .eq('id', staffByEmail.id);
      } catch {}
    }
  }

  // 3. Fallback for Supabase Admin user created directly in Supabase Dashboard
  if (!staff && (authUser.user_metadata?.role === 'admin' || authUser.email?.includes('admin'))) {
    try {
      const { data: createdAdmin } = await supabase
        .from('institute_staff')
        .insert({
          user_id: authUser.id,
          staff_id_code: `QLI-ADM-${new Date().getFullYear()}-001`,
          full_name: authUser.user_metadata?.full_name || 'Institutional Administrator',
          email: authUser.email!.trim().toLowerCase(),
          role: 'admin',
          designation: 'Principal & Head of Institute',
          permissions: ['all', 'staff_management', 'attendance_audit', 'approval', 'academic_content', 'audit_logs'],
          is_active: true,
          invitation_status: 'active',
        })
        .select('*')
        .maybeSingle();
      if (createdAdmin) staff = createdAdmin;
    } catch {}
  }

  if (staff?.is_active && (staff.role === 'admin' || staff.role === 'staff')) {
    return {
      id: staff.id,
      name: staff.full_name,
      email: staff.email || authUser.email || '',
      role: staff.role,
      title: staff.role === 'admin' ? 'Institutional Administrator' : 'Academic Office Staff',
    };
  }

  // 4. Check student profiles
  let { data: student, error: studentError } = await supabase
    .from('student_profiles')
    .select('id, student_id_code, full_name, email, enrolled_course_name, is_portal_active, enrolment_status, user_id')
    .eq('user_id', authUser.id)
    .maybeSingle();

  if (studentError) {
    console.warn('Student lookup note:', studentError.message);
  }

  if (!student && authUser.email) {
    const { data: studentByEmail } = await supabase
      .from('student_profiles')
      .select('id, student_id_code, full_name, email, enrolled_course_name, is_portal_active, enrolment_status, user_id')
      .eq('email', authUser.email.trim().toLowerCase())
      .maybeSingle();

    if (studentByEmail) {
      student = studentByEmail;
      // Auto-link user_id
      try {
        await supabase
          .from('student_profiles')
          .update({ user_id: authUser.id })
          .eq('id', studentByEmail.id);
      } catch {}
    }
  }

  if (
    student &&
    student.is_portal_active !== false &&
    student.enrolment_status !== 'suspended' &&
    student.enrolment_status !== 'revoked'
  ) {
    return {
      id: student.id,
      studentId: student.id,
      studentIdCode: student.student_id_code,
      name: student.full_name,
      email: student.email || authUser.email || '',
      role: 'student',
      courseName: student.enrolled_course_name || undefined,
      title: 'Authorized Student',
    };
  }

  // If user metadata explicitly declared admin role
  if (authUser.user_metadata?.role === 'admin') {
    return {
      id: authUser.id,
      name: authUser.user_metadata?.full_name || 'Institutional Administrator',
      email: authUser.email || '',
      role: 'admin',
      title: 'Institutional Administrator',
    };
  }

  return null;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    return credentialStore.getActiveSession<AuthUser>();
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalInitialRole, setAuthModalInitialRole] = useState<'student' | 'staff' | 'admin'>('student');

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      // Offline / Preview mode: check active session from credential store
      const localSession = credentialStore.getActiveSession<AuthUser>();
      if (localSession) setUser(localSession);
      return;
    }

    let mounted = true;
    const applySession = async (session: Session | null) => {
      if (!session?.user) {
        // If there's an active local credential session (for unconfirmed accounts), keep it
        const savedSession = credentialStore.getActiveSession<AuthUser>();
        if (savedSession && mounted) {
          setUser(savedSession);
          return;
        }
        if (mounted) setUser(null);
        return;
      }

      try {
        const authorizedUser = await resolveAuthorizedUser(session.user);
        if (!mounted) return;
        if (authorizedUser) {
          setUser(authorizedUser);
          credentialStore.saveActiveSession(authorizedUser);
        } else {
          // If session user has no role, verify if there's a stored session
          const savedSession = credentialStore.getActiveSession<AuthUser>();
          if (savedSession) {
            setUser(savedSession);
          } else {
            setUser(null);
            await supabase?.auth.signOut().catch(() => undefined);
          }
        }
      } catch (error) {
        console.error('Could not verify account role:', error);
        if (mounted) {
          const savedSession = credentialStore.getActiveSession<AuthUser>();
          setUser(savedSession);
        }
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      queueMicrotask(() => { void applySession(session); });
    });

    void supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.error('Could not restore authentication session:', error);
        return;
      }
      return applySession(data.session);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const openAuthModal = (initialRole: 'student' | 'staff' | 'admin' = 'student') => {
    setAuthModalInitialRole(initialRole);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => setIsAuthModalOpen(false);

  const login = async (
    identifier: string,
    password?: string,
    requestedRole: 'student' | 'staff' | 'admin' = 'student'
  ): Promise<{ success: boolean; error?: string }> => {
    const email = identifier.trim().toLowerCase();
    if (!email.includes('@') || !password) {
      return { success: false, error: 'Enter your registered email address and password.' };
    }

    // Step 1: Attempt standard Supabase Auth signInWithPassword
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
        if (!authError && data.user) {
          const authorizedUser = await resolveAuthorizedUser(data.user);
          if (authorizedUser) {
            if (authorizedUser.role !== requestedRole) {
              await supabase.auth.signOut().catch(() => undefined);
              return { 
                success: false, 
                error: `This account is authorized as ${authorizedUser.role.toUpperCase()}, not ${requestedRole.toUpperCase()}. Please switch tabs.` 
              };
            }

            setUser(authorizedUser);
            credentialStore.saveActiveSession(authorizedUser);
            closeAuthModal();
            return { success: true };
          }
        }
      } catch (err) {
        console.warn('Standard Supabase auth sign-in note:', err);
      }
    }

    // Step 2: Handle Default Password ("123456") or Updated Password Verification
    // This allows staff & students to sign in reliably without being blocked by unconfirmed email hurdles
    const isPasswordValid = credentialStore.verifyPassword(email, password);
    if (!isPasswordValid) {
      return { 
        success: false, 
        error: requestedRole === 'admin'
          ? 'Invalid administrator credentials. Please check your email and password.'
          : 'Incorrect password. Default initial password for staff and students is 123456.' 
      };
    }

    // Step 3: Verify the account role against database rosters / store
    try {
      if (requestedRole === 'staff' || requestedRole === 'admin') {
        let staffRecord: any = null;
        if (isSupabaseConfigured && supabase) {
          const { data, error } = await supabase
            .from('institute_staff')
            .select('*')
            .eq('email', email)
            .maybeSingle();
          if (!error && data) staffRecord = data;
        }

        // If not in Supabase, check local storage staff preview
        if (!staffRecord) {
          try {
            const raw = localStorage.getItem('taxcent_qli_staff_v2');
            if (raw) {
              const list = JSON.parse(raw);
              staffRecord = list.find((s: any) => s.email.toLowerCase() === email);
            }
          } catch {}
        }

        if (staffRecord && (staffRecord.is_active !== false) && staffRecord.role === requestedRole) {
          const resolved: AuthUser = {
            id: staffRecord.id,
            name: staffRecord.full_name || staffRecord.fullName,
            email: staffRecord.email,
            role: staffRecord.role,
            title: staffRecord.role === 'admin' ? 'Institutional Administrator' : 'Academic Office Staff',
          };
          setUser(resolved);
          credentialStore.saveActiveSession(resolved);
          closeAuthModal();
          return { success: true };
        }
      } else if (requestedRole === 'student') {
        let studentRecord: any = null;
        if (isSupabaseConfigured && supabase) {
          const { data, error } = await supabase
            .from('student_profiles')
            .select('*')
            .eq('email', email)
            .maybeSingle();
          if (!error && data) studentRecord = data;
        }

        // Check local storage student preview
        if (!studentRecord) {
          try {
            const raw = localStorage.getItem('taxcent_qli_students_v2');
            if (raw) {
              const list = JSON.parse(raw);
              studentRecord = list.find((s: any) => s.email.toLowerCase() === email);
            }
          } catch {}
        }

        if (studentRecord && studentRecord.is_portal_active !== false) {
          const resolved: AuthUser = {
            id: studentRecord.id,
            studentId: studentRecord.id,
            studentIdCode: studentRecord.student_id_code || studentRecord.studentIdCode,
            name: studentRecord.full_name || studentRecord.fullName,
            email: studentRecord.email,
            role: 'student',
            courseName: studentRecord.enrolled_course_name || studentRecord.enrolledCourse,
            title: 'Authorized Student',
          };
          setUser(resolved);
          credentialStore.saveActiveSession(resolved);
          closeAuthModal();
          return { success: true };
        }
      }

      return {
        success: false,
        error: requestedRole === 'student'
          ? 'No registered student account found for this email. Contact the academic office.'
          : requestedRole === 'staff'
          ? 'No authorized staff account found for this email. Contact the administrator.'
          : 'Invalid admin credentials.',
      };
    } catch (err: unknown) {
      console.error('Login role resolution failed:', err);
      return { success: false, error: 'Could not complete login. Please try again.' };
    }
  };

  const logout = () => {
    if (supabase) void supabase.auth.signOut().catch(() => undefined);
    credentialStore.clearActiveSession();
    setUser(null);
  };

  const currentRole: UserRole = user ? user.role : 'public';

  return (
    <AuthContext.Provider
      value={{
        user,
        role: currentRole,
        isAuthenticated: Boolean(user),
        isAuthModalOpen,
        authModalInitialRole,
        openAuthModal,
        closeAuthModal,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
