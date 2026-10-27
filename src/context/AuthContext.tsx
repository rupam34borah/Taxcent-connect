import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole } from '../types/academic';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'staff' | 'admin';
  studentIdCode?: string;
  studentId?: string; // Matches StudentProfile.id (e.g. 'stu-001')
  title?: string;
  courseName?: string;
}

export interface DemoAccount {
  role: 'student' | 'staff' | 'admin';
  name: string;
  email: string;
  identifier: string; // email or student ID code
  studentId?: string;
  studentIdCode?: string;
  courseName?: string;
  description: string;
  password?: string;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    role: 'student',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@example.com',
    identifier: 'QLI-STU-2026-001',
    studentId: 'stu-001',
    studentIdCode: 'QLI-STU-2026-001',
    courseName: 'Diploma in Computer Application (DCA)',
    description: 'Enrolled Student with Valid DCA Marksheet & Certificate',
    password: 'student123',
  },
  {
    role: 'student',
    name: 'Rupam Borah',
    email: 'rupam.borah@example.com',
    identifier: 'QLI-STU-2026-004',
    studentId: 'stu-004',
    studentIdCode: 'QLI-STU-2026-004',
    courseName: 'Professional Tally Prime & GST Certification',
    description: 'Enrolled Student with Valid Tally & GST Certificate',
    password: 'student123',
  },
  {
    role: 'student',
    name: 'Ankita Bora',
    email: 'ankita.bora@example.com',
    identifier: 'QLI-STU-2026-002',
    studentId: 'stu-002',
    studentIdCode: 'QLI-STU-2026-002',
    courseName: 'Advance Diploma in Computer Application (ADCA)',
    description: 'Enrolled Student with Superseded/Revoked Credential Record',
    password: 'student123',
  },
  {
    role: 'staff',
    name: 'B. Bora (Academic Registrar)',
    email: 'staff@taxcent.in',
    identifier: 'staff@taxcent.in',
    description: 'Staff Hub: Authorized to input data, upload marksheets & view records',
    password: 'staff123',
  },
  {
    role: 'admin',
    name: 'Prof. D. Saikia (Principal & Admin)',
    email: 'admin@taxcent.in',
    identifier: 'admin@taxcent.in',
    description: 'Admin Console: Authorized to view all, approve, revoke & audit records',
    password: 'admin123',
  },
];

interface AuthContextType {
  user: AuthUser | null;
  role: UserRole; // 'admin' | 'staff' | 'student' | 'public'
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  authModalInitialRole: 'student' | 'staff' | 'admin';
  openAuthModal: (initialRole?: 'student' | 'staff' | 'admin') => void;
  closeAuthModal: () => void;
  login: (identifier: string, password?: string, requestedRole?: 'student' | 'staff' | 'admin') => Promise<{ success: boolean; error?: string }>;
  loginAsDemo: (account: DemoAccount) => void;
  logout: () => void;
}

const STORAGE_KEY_AUTH = 'taxcent_qli_auth_session_v1';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalInitialRole, setAuthModalInitialRole] = useState<'student' | 'staff' | 'admin'>('student');

  // Load existing session on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_AUTH);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.role && parsed.name) {
          setUser(parsed);
        }
      }
    } catch (err) {
      console.warn('Error reading auth session from storage:', err);
    }
  }, []);

  const saveSession = (newUser: AuthUser | null) => {
    setUser(newUser);
    try {
      if (newUser) {
        localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(newUser));
      } else {
        localStorage.removeItem(STORAGE_KEY_AUTH);
      }
    } catch (err) {
      console.warn('Error saving auth session:', err);
    }
  };

  const openAuthModal = (initialRole: 'student' | 'staff' | 'admin' = 'student') => {
    setAuthModalInitialRole(initialRole);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const loginAsDemo = (account: DemoAccount) => {
    const newUser: AuthUser = {
      id: account.studentId || (account.role === 'admin' ? 'admin-01' : 'staff-01'),
      name: account.name,
      email: account.email,
      role: account.role,
      studentIdCode: account.studentIdCode,
      studentId: account.studentId,
      courseName: account.courseName,
      title: account.role === 'admin' 
        ? 'Institutional Administrator' 
        : account.role === 'staff' 
        ? 'Academic Office Staff' 
        : 'Authorized Student',
    };
    saveSession(newUser);
    closeAuthModal();
  };

  const login = async (
    identifier: string,
    password?: string,
    requestedRole: 'student' | 'staff' | 'admin' = 'student'
  ): Promise<{ success: boolean; error?: string }> => {
    const trimmed = identifier.trim().toLowerCase();

    // Check if matching Supabase Auth is active and user provided an email
    if (isSupabaseConfigured && supabase && trimmed.includes('@')) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: trimmed,
          password: password || 'default123',
        });
        if (!error && data?.user) {
          const u: AuthUser = {
            id: data.user.id,
            name: data.user.user_metadata?.full_name || trimmed.split('@')[0],
            email: data.user.email || trimmed,
            role: (data.user.user_metadata?.role as any) || requestedRole,
            studentIdCode: data.user.user_metadata?.student_id_code,
            studentId: data.user.user_metadata?.student_id,
            title: requestedRole === 'admin' ? 'Administrator' : requestedRole === 'staff' ? 'Staff' : 'Student',
          };
          saveSession(u);
          closeAuthModal();
          return { success: true };
        }
      } catch (err) {
        console.warn('Supabase signIn fallback to local auth:', err);
      }
    }

    // Check pre-configured authorized credentials
    const matchingDemo = DEMO_ACCOUNTS.find(
      acc =>
        (acc.email.toLowerCase() === trimmed ||
          (acc.studentIdCode && acc.studentIdCode.toLowerCase() === trimmed) ||
          acc.identifier.toLowerCase() === trimmed) &&
        (!requestedRole || acc.role === requestedRole)
    );

    if (matchingDemo) {
      loginAsDemo(matchingDemo);
      return { success: true };
    }

    // Role-specific flexible match
    if (requestedRole === 'student') {
      // Check if it looks like a student ID code or student email
      if (trimmed.startsWith('qli-') || trimmed.includes('@')) {
        const studentUser: AuthUser = {
          id: 'stu-' + Date.now().toString(36),
          name: trimmed.includes('@') ? trimmed.split('@')[0].toUpperCase() : `Student (${trimmed.toUpperCase()})`,
          email: trimmed.includes('@') ? trimmed : `${trimmed}@student.qli.edu`,
          role: 'student',
          studentIdCode: trimmed.toUpperCase(),
          studentId: 'stu-001', // Fallback to primary student record
          title: 'Authorized Student',
        };
        saveSession(studentUser);
        closeAuthModal();
        return { success: true };
      }
      return {
        success: false,
        error: 'Student account not found. Please enter your Student Registration ID (e.g. QLI-STU-2026-001) or registered email.',
      };
    }

    if (requestedRole === 'staff') {
      if (trimmed.includes('staff') || trimmed === 'staff@taxcent.in') {
        const staffUser: AuthUser = {
          id: 'staff-01',
          name: 'Academic Staff Member (Ranabari Hub)',
          email: trimmed.includes('@') ? trimmed : 'staff@taxcent.in',
          role: 'staff',
          title: 'Academic Office Staff (Data Entry & Verification)',
        };
        saveSession(staffUser);
        closeAuthModal();
        return { success: true };
      }
      return {
        success: false,
        error: 'Invalid staff credentials. Use staff@taxcent.in or click 1-Click Demo Staff Login.',
      };
    }

    if (requestedRole === 'admin') {
      if (trimmed.includes('admin') || trimmed === 'admin@taxcent.in') {
        const adminUser: AuthUser = {
          id: 'admin-01',
          name: 'Principal & Head of Institute',
          email: trimmed.includes('@') ? trimmed : 'admin@taxcent.in',
          role: 'admin',
          title: 'Institutional Administrator (Approve, Revoke & Audit)',
        };
        saveSession(adminUser);
        closeAuthModal();
        return { success: true };
      }
      return {
        success: false,
        error: 'Invalid admin credentials. Use admin@taxcent.in or click 1-Click Demo Admin Login.',
      };
    }

    return {
      success: false,
      error: 'Invalid login details. Please check your credentials.',
    };
  };

  const logout = () => {
    if (isSupabaseConfigured && supabase) {
      supabase.auth.signOut().catch(() => {});
    }
    saveSession(null);
  };

  const currentRole: UserRole = user ? user.role : 'public';

  return (
    <AuthContext.Provider
      value={{
        user,
        role: currentRole,
        isAuthenticated: !!user,
        isAuthModalOpen,
        authModalInitialRole,
        openAuthModal,
        closeAuthModal,
        login,
        loginAsDemo,
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
