import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { PublicVerifyCertificate } from './PublicVerifyCertificate';
import { StudentAcademicDashboard } from './StudentAcademicDashboard';
import { StaffAcademicDashboard } from './StaffAcademicDashboard';
import { isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  GraduationCap, 
  UserCheck, 
  Building2, 
  Database, 
  CheckCircle2, 
  AlertCircle,
  Lock,
  LogIn,
  LogOut,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

interface AcademicPortalProps {
  lang: Language;
  initialSubTab?: 'verify' | 'student' | 'staff';
}

export const AcademicPortal: React.FC<AcademicPortalProps> = ({
  lang,
  initialSubTab = 'verify',
}) => {
  const { user, role, isAuthenticated, openAuthModal, logout } = useAuth();
  const [currentSubTab, setCurrentSubTab] = useState<'verify' | 'student' | 'staff'>(
    isAuthenticated ? initialSubTab : 'verify'
  );

  // If user logs out while on student/staff tab, return to verify
  useEffect(() => {
    if (!isAuthenticated && currentSubTab !== 'verify') {
      setCurrentSubTab('verify');
    }
  }, [isAuthenticated, currentSubTab]);

  const handleTabClick = (tab: 'verify' | 'student' | 'staff') => {
    if (tab === 'verify') {
      setCurrentSubTab('verify');
      return;
    }

    if (!isAuthenticated) {
      openAuthModal(tab === 'student' ? 'student' : 'staff');
      return;
    }

    // Role-based navigation rules
    if (tab === 'staff' && role === 'student') {
      // Student cannot access staff
      openAuthModal('staff');
      return;
    }

    setCurrentSubTab(tab);
  };

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Module Master Banner */}
        <div className="bg-gradient-to-r from-[#0a2540] via-[#0f2e4d] to-slate-900 border border-sky-900/60 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-500/30 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-sky-400" />
                  Quantum Learning Institute
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5" />
                  {isSupabaseConfigured ? 'Supabase PostgreSQL & Storage Active' : 'Authoritative Registry Active (Preview/Local)'}
                </span>
                {isAuthenticated && (
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border flex items-center gap-1 ${
                    role === 'admin' 
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                      : role === 'staff' 
                      ? 'bg-sky-500/20 text-sky-300 border-sky-500/40' 
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  }`}>
                    {role === 'admin' && '🛡️ Administrator Session'}
                    {role === 'staff' && '📋 Academic Staff Session'}
                    {role === 'student' && '🎓 Authenticated Student'}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {lang === 'as'
                  ? 'কোৱাণ্টাম ইনষ্টিটিউট প্ৰমাণপত্ৰ আৰু শৈক্ষিক নথি পৰ্টেল'
                  : 'Academic Records, Marksheets & Certificate System'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                {lang === 'as'
                  ? 'সৰ্বসাধাৰণৰ বাবে কেৱল প্ৰমাণপত্ৰ পৰীক্ষণ উপলব্ধ। ছাত্ৰসকলে নিজৰ মাৰ্কশ্বীট চাবলৈ আৰু কৰ্মচাৰীসকলে তথ্য নথিভুক্ত কৰিবলৈ অনুগ্ৰহ কৰি লগইন কৰক।'
                  : 'For general public: only certificate verification is available. Logged-in students can view their personal marksheets and certificates. Staff can input data and view records. Administrators can review, approve, and revoke.'}
              </p>
            </div>

            {/* Portal Switcher Tabs with Security Gates */}
            <div className="flex bg-slate-900/90 p-1.5 rounded-2xl border border-slate-700/80 shrink-0 shadow-inner flex-wrap gap-1">
              {/* Tab 1: Public Verify (Available to everyone) */}
              <button
                type="button"
                onClick={() => handleTabClick('verify')}
                className={`flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  currentSubTab === 'verify'
                    ? 'bg-sky-500 text-slate-950 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Verify Credential (Public)</span>
              </button>

              {/* Tab 2: Student Portal (Only logged in student or admin/staff preview) */}
              <button
                type="button"
                onClick={() => handleTabClick('student')}
                className={`flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  currentSubTab === 'student'
                    ? 'bg-sky-500 text-slate-950 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>Student Portal</span>
                {!isAuthenticated && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-amber-300 border border-slate-700 flex items-center gap-1 font-mono">
                    <Lock className="w-2.5 h-2.5" />
                    Login
                  </span>
                )}
              </button>

              {/* Tab 3: Staff & Admin Office (Only logged in staff or admin) */}
              <button
                type="button"
                onClick={() => handleTabClick('staff')}
                className={`flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  currentSubTab === 'staff'
                    ? 'bg-sky-500 text-slate-950 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>{role === 'admin' ? 'Admin Console' : 'Staff Data Entry'}</span>
                {(!isAuthenticated || role === 'student') && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-amber-300 border border-slate-700 flex items-center gap-1 font-mono">
                    <Lock className="w-2.5 h-2.5" />
                    {role === 'student' ? 'Staff Only' : 'Login'}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Portal Active View with Access Guarding */}
        {currentSubTab === 'verify' && (
          <PublicVerifyCertificate
            lang={lang}
            onOpenPortal={() => {
              if (isAuthenticated) {
                setCurrentSubTab(role === 'student' ? 'student' : 'staff');
              } else {
                openAuthModal('student');
              }
            }}
          />
        )}

        {/* Student View (Secured) */}
        {currentSubTab === 'student' && (
          isAuthenticated ? (
            <StudentAcademicDashboard lang={lang} />
          ) : (
            /* Unauthenticated Access Guard for Student Portal */
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 text-center max-w-2xl mx-auto space-y-5 shadow-2xl">
              <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
                <Lock className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-bold text-white">
                  Student Authentication Required
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
                  General public cannot view student marksheet and certificate details. Only authenticated students can access their personal academic records and downloads.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => openAuthModal('student')}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Log In as Student</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentSubTab('verify')}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
                >
                  Back to Public Verification
                </button>
              </div>
            </div>
          )
        )}

        {/* Staff & Admin View (Secured) */}
        {currentSubTab === 'staff' && (
          isAuthenticated && (role === 'staff' || role === 'admin') ? (
            <StaffAcademicDashboard lang={lang} />
          ) : (
            /* Unauthenticated Access Guard for Staff/Admin Hub */
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 text-center max-w-2xl mx-auto space-y-5 shadow-2xl">
              <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-bold text-white">
                  Staff & Administrative Authorization Required
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
                  {role === 'student'
                    ? `You are currently signed in as student (${user?.name}). Staff and administrative privileges are required to input document records or approve credentials.`
                    : 'This section is strictly restricted to authorized Quantum Learning Institute personnel. Staff can input data and view records, while Administrators can review, approve, and revoke.'}
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => openAuthModal('staff')}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Log In as Staff / Admin</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentSubTab('verify')}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
                >
                  Back to Public Verification
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};
