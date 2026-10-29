import React, { useState } from 'react';
import { Language } from '../types';
import { PublicVerificationResponse } from '../types/academic';
import { academicService } from '../services/academicService';
import { 
  ShieldCheck, 
  Search, 
  AlertTriangle, 
  XCircle, 
  CheckCircle2, 
  Calendar, 
  Award, 
  Building2, 
  User, 
  FileCheck, 
  Lock, 
  RefreshCw, 
  QrCode, 
  Info,
  ChevronRight
} from 'lucide-react';

interface PublicVerifyCertificateProps {
  lang: Language;
  onOpenPortal?: () => void;
}

export const PublicVerifyCertificate: React.FC<PublicVerifyCertificateProps> = ({
  lang,
  onOpenPortal,
}) => {
  const [certQuery, setCertQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PublicVerificationResponse | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const showDemoPills = import.meta.env.DEV;

  const handleVerify = async (queryToSearch?: string) => {
    const q = (queryToSearch ?? certQuery).trim();
    if (!q) return;

    setLoading(true);
    setHasSearched(true);
    try {
      const res = await academicService.verifyCertificate(q);
      setResult(res);
    } catch (err) {
      setResult({
        found: false,
        status: 'UNAVAILABLE',
        message: lang === 'as'
          ? 'পৰীক্ষা সেৱাৰ সৈতে সংযোগ হোৱা নাই। কিছু সময়ৰ পিছত পুনৰ চেষ্টা কৰক।'
          : err instanceof Error
            ? err.message
            : 'A temporary network or verification error occurred. Please try again.',
        disclaimer: 'The authoritative registry could not be reached, so no verification result was determined.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickTest = (certNo: string) => {
    setCertQuery(certNo);
    handleVerify(certNo);
  };

  return (
    <div className="py-8 sm:py-12 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white min-h-[calc(100vh-4rem)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header Breadcrumb / Authority Title */}
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-950/80 border border-sky-800/60 text-xs font-semibold text-sky-300 shadow-inner">
            <ShieldCheck className="w-4 h-4 text-sky-400" />
            <span>
              {lang === 'as' 
                ? 'কোৱাণ্টাম ইনষ্টিটিউট প্ৰমাণপত্ৰ প্ৰমাণীকৰণ পৰ্টেল' 
                : 'Authoritative Certificate Registry · Quantum Learning Institute'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            {lang === 'as' ? 'প্ৰমাণপত্ৰ বা মাৰ্কশ্বীট পৰীক্ষা কৰক' : 'Verify Student Certificate & Marksheet'}
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {lang === 'as'
              ? 'নিযুক্তিদাতা, শিক্ষানুষ্ঠান আৰু প্ৰাৰ্থীসকলে কোৱাণ্টাম লাৰ্নিং ইনষ্টিটিউট (ৰণবাৰী, লখিমপুৰ) ৰ আনুষ্ঠানিক ৰেকৰ্ডৰ সৈতে প্ৰমাণপত্ৰৰ বৈধতা পৰীক্ষা কৰিব পাৰিব।'
              : 'Employers, universities, and students can instantly check the authenticity of official completion certificates and marksheets issued by Quantum Learning Institute, Ranabari, Lakhimpur.'}
          </p>
        </div>

        {/* Search Card */}
        <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700/80 rounded-3xl p-5 sm:p-8 shadow-2xl relative overflow-hidden mb-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

          <form
            onSubmit={e => {
              e.preventDefault();
              handleVerify();
            }}
            className="space-y-4"
          >
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              {lang === 'as' ? 'প্ৰমাণপত্ৰ বা মাৰ্কশ্বীট নম্বৰ দিয়ক' : 'Enter Certificate / Marksheet Number'}
            </label>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-5 h-5 text-sky-400" />
                </div>
                <input
                  type="text"
                  value={certQuery}
                  onChange={e => setCertQuery(e.target.value)}
                  placeholder="e.g. QLI-2026-DCA-1042 or QLI-2026-TLY-2031"
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-slate-900/90 border border-slate-600 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 text-white placeholder-slate-500 font-mono text-sm tracking-wide transition-all outline-hidden"
                />
                {certQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setCertQuery('');
                      setResult(null);
                      setHasSearched(false);
                    }}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={loading || !certQuery.trim()}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 disabled:opacity-50 text-slate-950 font-bold text-sm tracking-wide transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                      <span>{lang === 'as' ? 'পৰীক্ষা হৈছে...' : 'Verifying...'}</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 text-slate-950" />
                      <span>{lang === 'as' ? 'পৰীক্ষা কৰক' : 'Verify Certificate'}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setShowQrModal(true)}
                  title="Scan Certificate QR"
                  className="p-3.5 rounded-2xl bg-slate-700/80 hover:bg-slate-700 border border-slate-600 text-sky-300 transition-colors cursor-pointer flex items-center justify-center shrink-0"
                >
                  <QrCode className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Demo Test Pills (Only shown in Development or when ?demo=true is present) */}
            {showDemoPills ? (
              <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
                <span className="text-amber-400 font-medium">
                  {lang === 'as' ? 'পৰীক্ষাৰ বাবে নমুনা (Dev/Demo):' : 'Dev Test Demonstrators:'}
                </span>
                <button
                  type="button"
                  onClick={() => handleQuickTest('QLI-2026-DCA-1042')}
                  className="px-2.5 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-700/60 text-emerald-300 font-mono text-[11px] cursor-pointer transition-colors"
                >
                  ✓ Valid DCA (1042)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickTest('QLI-2026-TLY-2031')}
                  className="px-2.5 py-1 rounded-lg bg-sky-950/60 hover:bg-sky-900/80 border border-sky-700/60 text-sky-300 font-mono text-[11px] cursor-pointer transition-colors"
                >
                  ✓ Valid Tally (2031)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickTest('QLI-2025-ADCA-0819')}
                  className="px-2.5 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 border border-rose-700/60 text-rose-300 font-mono text-[11px] cursor-pointer transition-colors"
                >
                  ✕ Revoked (0819)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickTest('QLI-9999-FAKE')}
                  className="px-2.5 py-1 rounded-lg bg-amber-950/60 hover:bg-amber-900/80 border border-amber-700/60 text-amber-300 font-mono text-[11px] cursor-pointer transition-colors"
                >
                  ? Not Found
                </button>
              </div>
            ) : (
              <div className="pt-1 text-[11px] text-slate-400 font-mono flex items-center gap-2">
                <span>Standard Format:</span>
                <span className="text-sky-300 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-700">
                  QLI-YYYY-COURSE-XXXX
                </span>
                <span className="text-slate-500 hidden sm:inline">(e.g. QLI-2026-DCA-1042)</span>
              </div>
            )}
          </form>

          {/* Privacy Protection Notice */}
          <div className="mt-5 pt-4 border-t border-slate-700/60 flex items-center justify-between flex-wrap gap-2 text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>
                {lang === 'as'
                  ? 'গোপনীয়তা সুৰক্ষিত: ছাত্ৰৰ ব্যক্তিগত মাৰ্কশ্বীট, ফোন আৰু ইমেইল সৰ্বসাধাৰণক প্ৰকাশ কৰা নহয়।'
                  : 'Privacy Protected: Student marks, phone, email, and files are never exposed publicly.'}
              </span>
            </div>
            <div className="flex items-center gap-1 text-slate-400">
              <Building2 className="w-3.5 h-3.5 text-sky-400" />
              <span>Quantum Learning Institute, Ranabari</span>
            </div>
          </div>
        </div>

        {/* Verification Outcome Cards */}
        {hasSearched && result && (
          <div className="animate-fade-in mb-8">
            {/* OUTCOME 1: VALID CERTIFICATE */}
            {result.status === 'VALID' && (
              <div className="bg-gradient-to-b from-emerald-950/70 to-slate-900 border-2 border-emerald-500/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

                {/* Status Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-emerald-800/40">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-400 shrink-0">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500 text-slate-950 mb-1">
                        ✓ Authenticated & Valid
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold text-white">
                        {lang === 'as' ? 'বৈধ আনুষ্ঠানিক প্ৰমাণপত্ৰ' : 'Valid Certificate of Completion'}
                      </h2>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-[11px] uppercase tracking-wider text-emerald-300/80 block font-semibold">
                      Registration Number
                    </span>
                    <span className="text-base sm:text-lg font-mono font-bold text-white tracking-wider">
                      {result.certificateNumber}
                    </span>
                  </div>
                </div>

                {/* Details Grid (Minimal, Privacy-Conscious) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="bg-slate-900/80 rounded-2xl p-4 border border-emerald-900/50">
                    <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                      <Building2 className="w-3.5 h-3.5 text-sky-400" />
                      <span>Issuing Institute</span>
                    </div>
                    <span className="font-bold text-white text-base block">
                      {result.instituteName || 'Quantum Learning Institute'}
                    </span>
                    <span className="text-xs text-sky-300">Ranabari Market, Lakhimpur, Assam</span>
                  </div>

                  <div className="bg-slate-900/80 rounded-2xl p-4 border border-emerald-900/50">
                    <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                      <Award className="w-3.5 h-3.5 text-amber-400" />
                      <span>Completed Course</span>
                    </div>
                    <span className="font-bold text-white text-base block">
                      {result.courseName}
                    </span>
                    <span className="text-xs text-slate-400 capitalize">
                      Document Type: {result.documentType || 'Certificate'}
                    </span>
                  </div>

                  <div className="bg-slate-900/80 rounded-2xl p-4 border border-emerald-900/50">
                    <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                      <User className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Student (Privacy Masked)</span>
                    </div>
                    <span className="font-mono font-bold text-emerald-300 text-lg block">
                      {result.studentMaskedName}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Full student name is masked in public view for identity protection.
                    </span>
                  </div>

                  <div className="bg-slate-900/80 rounded-2xl p-4 border border-emerald-900/50">
                    <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                      <Calendar className="w-3.5 h-3.5 text-sky-400" />
                      <span>Issue Date</span>
                    </div>
                    <span className="font-semibold text-white text-base block">
                      {result.issueDate}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Verified at: {result.verificationTimestamp ? new Date(result.verificationTimestamp).toLocaleTimeString() : 'Live'}
                    </span>
                  </div>
                </div>

                {/* Official Disclaimer */}
                <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/40 text-xs text-emerald-200/90 leading-relaxed flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-white mb-0.5">Authoritative Verification Notice:</span>
                    {result.disclaimer}
                  </div>
                </div>
              </div>
            )}

            {/* OUTCOME 2: REVOKED CERTIFICATE (Must NEVER show as valid) */}
            {result.status === 'REVOKED' && (
              <div className="bg-gradient-to-b from-rose-950/80 to-slate-900 border-2 border-rose-500 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

                {/* Status Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-rose-800/40">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-400 flex items-center justify-center text-rose-400 shrink-0">
                      <XCircle className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500 text-white mb-1">
                        ✕ CERTIFICATE REVOKED - INVALID
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold text-white">
                        {lang === 'as' ? 'বাতিল কৰা প্ৰমাণপত্ৰ (Revoked)' : 'Revoked / Inactive Credential'}
                      </h2>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-[11px] uppercase tracking-wider text-rose-300 block font-semibold">
                      Registration Number
                    </span>
                    <span className="text-base sm:text-lg font-mono font-bold text-white tracking-wider line-through decoration-rose-400 decoration-2">
                      {result.certificateNumber}
                    </span>
                  </div>
                </div>

                {/* Revocation Warning Box */}
                <div className="p-4 rounded-2xl bg-rose-950/90 border border-rose-600/70 text-sm text-rose-100 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-rose-300">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>Official Revocation Advisory</span>
                  </div>
                  <p className="leading-relaxed text-xs sm:text-sm">
                    {result.revocationReason || 'This certificate has been formally revoked by Quantum Learning Institute administration and is no longer valid.'}
                  </p>
                  <p className="text-xs text-rose-300 font-semibold pt-1">
                    Attention: Employers, institutions, and verification agencies must NOT accept or rely upon this credential.
                  </p>
                </div>

                {/* Minimal Record Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="bg-slate-900/80 rounded-2xl p-4 border border-rose-900/50">
                    <span className="text-xs text-slate-400 block mb-1">Originally Issued For Course</span>
                    <span className="font-semibold text-white block">{result.courseName}</span>
                    <span className="text-xs text-slate-400">Institute: Quantum Learning Institute</span>
                  </div>

                  <div className="bg-slate-900/80 rounded-2xl p-4 border border-rose-900/50">
                    <span className="text-xs text-slate-400 block mb-1">Student (Masked) & Issue Date</span>
                    <span className="font-mono font-bold text-slate-300 block">{result.studentMaskedName}</span>
                    <span className="text-xs text-slate-400">Originally Issued: {result.issueDate}</span>
                  </div>
                </div>

                <div className="text-xs text-slate-400 flex items-start gap-2">
                  <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span>{result.disclaimer}</span>
                </div>
              </div>
            )}

            {/* OUTCOME 3: NOT FOUND */}
            {result.status === 'NOT_FOUND' && (
              <div className="bg-slate-800/90 border-2 border-amber-500/70 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-400 shrink-0">
                    <AlertTriangle className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500 text-slate-950 mb-1">
                      ? Record Not Found
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white">
                      {lang === 'as' ? 'কোনো তথ্য পোৱা নগ’ল' : 'No Matching Record in Institute Database'}
                    </h2>
                  </div>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed">
                  {result.message || 'No certificate or marksheet matching this certificate number was found in the authoritative database.'}
                </p>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700 text-xs text-slate-300 space-y-2">
                  <span className="font-bold text-amber-300 block">Recommended Troubleshooting:</span>
                  <ul className="list-disc pl-5 space-y-1 text-slate-400">
                    <li>Check the exact registration format (e.g., <code className="text-sky-300 font-mono">QLI-2026-DCA-1042</code>).</li>
                    <li>Ensure there are no leading or trailing spaces.</li>
                    <li>If you received a physical certificate recently, it may be undergoing batch indexing. Contact the Ranabari office at <strong>8876824424</strong> to confirm.</li>
                  </ul>
                </div>
              </div>
            )}

            {result.status === 'UNAVAILABLE' && (
              <div className="bg-slate-800/90 border-2 border-sky-500/70 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-400 flex items-center justify-center text-sky-300 shrink-0">
                    <Info className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-sky-500 text-slate-950 mb-1">
                      Verification temporarily unavailable
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white">
                      {lang === 'as' ? 'পৰীক্ষা সেৱা বৰ্তমান উপলব্ধ নহয়' : 'Could not reach the verification service'}
                    </h2>
                  </div>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed">
                  {result.message || 'The registry could not be reached, so this certificate’s status has not been determined. Please try again shortly.'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Portal Access Callout */}
        <div className="bg-sky-950/40 border border-sky-800/50 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400 flex items-center justify-center text-sky-400 shrink-0">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm sm:text-base">
                {lang === 'as' ? 'ছাত্ৰ আৰু কৰ্মচাৰী পৰ্টেল' : 'Quantum Academic Portal (Staff & Student Login)'}
              </h3>
              <p className="text-xs text-slate-300">
                {lang === 'as'
                  ? 'ছাত্ৰসকলে নিজৰ মাৰ্কশ্বীট ডাউনলোড কৰিব পাৰিব আৰু কৰ্মচাৰীসকলে নতুন নথি আপলোড কৰিব পাৰিব।'
                  : 'Students can securely view and download their documents. Staff can upload, manage, or correct records.'}
              </p>
            </div>
          </div>

          {onOpenPortal && (
            <button
              type="button"
              onClick={onOpenPortal}
              className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 shadow-sm cursor-pointer"
            >
              <span>{lang === 'as' ? 'পৰ্টেল খোলক' : 'Open Academic Portal'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Simulated QR Code Scan Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-sm w-full space-y-4 text-center">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
                <QrCode className="w-4 h-4" />
                <span>Certificate QR Scanner</span>
              </div>
              <button
                onClick={() => setShowQrModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="w-48 h-48 mx-auto rounded-2xl bg-slate-950 border-2 border-dashed border-sky-500/60 flex flex-col items-center justify-center relative overflow-hidden p-4">
              <div className="absolute inset-x-0 h-1 bg-sky-400 top-10 animate-bounce opacity-80" />
              <QrCode className="w-20 h-20 text-slate-600 mb-2" />
              <span className="text-[11px] text-slate-400">Hold QR code in view</span>
            </div>

            <p className="text-xs text-slate-400">
              Or simulate scanning one of our authorized student certificates:
            </p>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowQrModal(false);
                  handleQuickTest('QLI-2026-DCA-1042');
                }}
                className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono text-emerald-300 border border-slate-700 transition-colors"
              >
                Simulate Scan: QLI-2026-DCA-1042
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowQrModal(false);
                  handleQuickTest('QLI-2025-ADCA-0819');
                }}
                className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono text-rose-300 border border-slate-700 transition-colors"
              >
                Simulate Scan: QLI-2025-ADCA-0819
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
