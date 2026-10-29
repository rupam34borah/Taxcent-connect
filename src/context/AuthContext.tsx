import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { UserRole } from '../types/academic';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

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

  const { data: staff, error: staffError } = await supabase
    .from('institute_staff')
    .select('id, full_name, email, role, is_active, invitation_status')
    .eq('user_id', authUser.id)
    .maybeSingle();

  if (staffError) throw staffError;
  if (staff?.is_active && staff.invitation_status === 'active' && (staff.role === 'admin' || staff.role === 'staff')) {
    return {
      id: staff.id,
      name: staff.full_name,
      email: staff.email || authUser.email || '',
      role: staff.role,
      title: staff.role === 'admin' ? 'Institutional Administrator' : 'Academic Office Staff',
    };
  }

  const { data: student, error: studentError } = await supabase
    .from('student_profiles')
    .select('id, student_id_code, full_name, email, enrolled_course_name, is_portal_active, enrolment_status')
    .eq('user_id', authUser.id)
    .maybeSingle();

  if (studentError) throw studentError;
  if (
    student?.is_portal_active &&
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

  return null;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalInitialRole, setAuthModalInitialRole] = useState<'student' | 'staff' | 'admin'>('student');

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setUser(null);
      return;
    }

    let mounted = true;
    const applySession = async (session: Session | null) => {
      if (!session?.user) {
        if (mounted) setUser(null);
        return;
      }

      try {
        const authorizedUser = await resolveAuthorizedUser(session.user);
        if (!mounted) return;
        setUser(authorizedUser);
        if (!authorizedUser) await supabase.auth.signOut();
      } catch (error) {
        console.error('Could not verify the account role:', error);
        if (mounted) setUser(null);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      queueMicrotask(() => { void applySession(session); });
    });

    void supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.error('Could not restore the authentication session:', error);
        if (mounted) setUser(null);
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
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, error: 'Secure sign-in is not configured. Please contact the administrator.' };
    }

    const email = identifier.trim().toLowerCase();
    if (!email.includes('@') || !password) {
      return { success: false, error: 'Enter your registered email address and password.' };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !data.user) {
        return { success: false, error: 'Sign-in failed. Check your credentials and try again.' };
      }

      const authorizedUser = await resolveAuthorizedUser(data.user);
      if (!authorizedUser || authorizedUser.role !== requestedRole) {
        await supabase.auth.signOut();
        return { success: false, error: 'This account is not authorized for the selected portal.' };
      }

      setUser(authorizedUser);
      closeAuthModal();
      return { success: true };
    } catch (error) {
      console.error('Secure sign-in could not be completed:', error);
      await supabase.auth.signOut().catch(() => undefined);
      return { success: false, error: 'Could not verify your account permissions. Please try again or contact the administrator.' };
    }
  };

  const logout = () => {
    if (supabase) void supabase.auth.signOut();
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
