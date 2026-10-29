import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Language } from '../types';
import { 
  GraduationCap, 
  UserCheck, 
  ShieldCheck, 
  Lock, 
  Mail, 
  Key, 
  X, 
  AlertCircle, 
  Building2,
  Info
} from 'lucide-react';

interface AuthModalProps {
  lang: Language;
}

export const AuthModal: React.FC<AuthModalProps> = ({ lang }) => {
  const { 
    isAuthModalOpen, 
    closeAuthModal, 
    authModalInitialRole, 
    login,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'student' | 'staff' | 'admin'>('student');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthModalOpen) {
      setActiveTab(authModalInitialRole || 'student');
      setError('');
      setIdentifier('');
      setPassword('');
    }
  }, [isAuthModalOpen, authModalInitialRole]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError(
        activeTab === 'student'
          ? 'Please enter your registered student email address.'
          : 'Please enter your institutional email.'
      );
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await login(identifier, password, activeTab);
      if (!res.success) {
        setError(res.error || 'Authentication failed. Please check your credentials.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unexpected login error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in overflow-y-auto">
      <div 
        className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden my-auto relative"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Top Bar */}
        <div className="bg-gradient-to-r from-[#0a2540] via-slate-900 to-sky-950 p-5 sm:p-6 border-b border-sky-900/60 relative">
          <button
            onClick={closeAuthModal}
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-500/30 flex items-center gap-1">
              <Building2 className="w-3 h-3 text-sky-400" />
              Quantum Learning Institute
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Official Portal Sign In
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {lang === 'as' ? 'প্ৰতিষ্ঠানিক প্ৰৱেশাধিকাৰ পৰ্টেল' : 'Portal Access & Sign In'}
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            {lang === 'as'
              ? 'ছাত্ৰসকলে নিজৰ মাৰ্কশ্বীট চাবলৈ আৰু কৰ্মচাৰীসকলে তথ্য নথিভুক্ত কৰিবলৈ লগইন কৰক।'
              : 'Sign in to access your student records, manage academic documents, or administer institute operations.'}
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-3 bg-slate-950 p-1.5 border-b border-slate-800 gap-1 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setActiveTab('student');
              setError('');
            }}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'student'
                ? 'bg-sky-500 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <GraduationCap className="w-4 h-4 shrink-0" />
            <span>Student</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('staff');
              setError('');
            }}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'staff'
                ? 'bg-sky-500 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <UserCheck className="w-4 h-4 shrink-0" />
            <span>Staff</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('admin');
              setError('');
            }}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'admin'
                ? 'bg-sky-500 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Admin</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4">
          {/* Active Role Explanatory Card */}
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 shrink-0 mt-0.5">
              {activeTab === 'student' && <GraduationCap className="w-4 h-4" />}
              {activeTab === 'staff' && <UserCheck className="w-4 h-4" />}
              {activeTab === 'admin' && <ShieldCheck className="w-4 h-4" />}
            </div>
            <div className="text-xs">
              <span className="font-bold text-white block">
                {activeTab === 'student' && 'Student Portal Access'}
                {activeTab === 'staff' && 'Academic Staff Console'}
                {activeTab === 'admin' && 'Institutional Administrator Authority'}
              </span>
              <p className="text-slate-400 mt-0.5">
                {activeTab === 'student' && 'View your enrolled courses, marksheets, certificates, and take online mock tests.'}
                {activeTab === 'staff' && 'Input marksheet/certificate data, mark daily attendance, and upload course documents.'}
                {activeTab === 'admin' && 'Manage staff, approve certificates, audit student rosters, and supervise institute records.'}
              </p>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Clean Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                {activeTab === 'student' ? 'Registered Student Email' : 'Institutional Email'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  {activeTab === 'student' ? <GraduationCap className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                </div>
                <input
                  type="email"
                  autoComplete="username"
                  required
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  placeholder={
                    activeTab === 'student'
                      ? 'e.g. rahul.sharma@example.com'
                      : 'e.g. staff@taxcent.in'
                  }
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs sm:text-sm focus:border-sky-400 focus:ring-1 focus:ring-sky-400 outline-hidden font-mono"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Password
                </label>
                {(activeTab === 'student' || activeTab === 'staff') && (
                  <span className="text-[11px] text-amber-400 flex items-center gap-1 font-mono">
                    <Info className="w-3 h-3" />
                    Default: 123456
                  </span>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Key className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs sm:text-sm focus:border-sky-400 focus:ring-1 focus:ring-sky-400 outline-hidden font-mono"
                />
              </div>
              {(activeTab === 'student' || activeTab === 'staff') && (
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Newly enrolled students and staff can log in using default password <strong className="text-amber-300 font-mono">123456</strong> and change it anytime from their dashboard.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              {loading ? (
                <span>Signing In...</span>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>
                    {activeTab === 'student' && 'Log In to Student Portal'}
                    {activeTab === 'staff' && 'Log In to Staff Hub'}
                    {activeTab === 'admin' && 'Log In to Admin Console'}
                  </span>
                </>
              )}
            </button>
          </form>

          {/* Footer note */}
          <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 text-center space-y-1">
            <p>
              {activeTab === 'student'
                ? 'Students: Log in using your registered email and default password 123456.'
                : activeTab === 'staff'
                ? 'Staff: Log in with your institutional email and default password 123456.'
                : 'Institutional Administrator: Sign in with your Supabase admin credentials.'}
            </p>
          </div>

          {/* Public Users Notice */}
          <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>General Public? No account required to verify certificates.</span>
            </div>
            <button
              type="button"
              onClick={closeAuthModal}
              className="text-sky-400 hover:text-sky-300 font-semibold underline cursor-pointer"
            >
              Go to Public Verifier
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
