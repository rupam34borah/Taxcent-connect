import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { AcademicDocument, StudentProfile } from '../types/academic';
import { academicService } from '../services/academicService';
import { useAuth } from '../context/AuthContext';
import { 
  GraduationCap, 
  FileText, 
  Download, 
  Eye, 
  Calendar, 
  Award, 
  ShieldCheck, 
  Lock, 
  User, 
  X, 
  AlertCircle,
  Clock,
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface StudentAcademicDashboardProps {
  lang: Language;
}

export const StudentAcademicDashboard: React.FC<StudentAcademicDashboardProps> = ({ lang }) => {
  const { user, role } = useAuth();
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [activeStudentId, setActiveStudentId] = useState<string>('');
  const [documents, setDocuments] = useState<AcademicDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<AcademicDocument | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [urlLoading, setUrlLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      const roster = await academicService.getStudentProfiles();
      setStudents(roster);

      if (role === 'student' && user) {
        // Find matching student from roster
        const match = roster.find(
          s => s.id === user.studentId || 
               s.studentIdCode === user.studentIdCode ||
               s.email.toLowerCase() === user.email.toLowerCase()
        );
        if (match) {
          setActiveStudentId(match.id);
        } else if (roster.length > 0) {
          setActiveStudentId(roster[0].id);
        }
      } else if (roster.length > 0) {
        setActiveStudentId(roster[0].id);
      }
    }
    loadData();
  }, [role, user]);

  useEffect(() => {
    if (!activeStudentId) return;
    loadStudentDocs(activeStudentId);
  }, [activeStudentId]);

  const loadStudentDocs = async (stuId: string) => {
    setLoading(true);
    try {
      const docs = await academicService.getStudentDocuments(stuId);
      setDocuments(docs);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPreview = async (doc: AcademicDocument) => {
    setPreviewDoc(doc);
    setUrlLoading(true);
    try {
      const secureUrl = await academicService.getSecureDocumentUrl(doc);
      setPreviewUrl(secureUrl);
    } finally {
      setUrlLoading(false);
    }
  };

  const handleClosePreview = () => {
    setPreviewDoc(null);
    setPreviewUrl(null);
  };

  const currentStudent = students.find(s => s.id === activeStudentId);

  return (
    <div className="space-y-6">
      {/* Student Session Switcher Bar (Simulating Supabase Auth context) */}
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-400 flex items-center justify-center text-sky-400 shrink-0 font-bold text-lg">
            {currentStudent ? currentStudent.fullName.charAt(0) : 'S'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
                Authenticated Student Profile
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Active Session
              </span>
            </div>
            <h3 className="text-lg font-bold text-white">
              {currentStudent?.fullName || 'Student'}
            </h3>
            <p className="text-xs text-slate-400">
              ID: <span className="font-mono text-sky-300">{currentStudent?.studentIdCode}</span> · {currentStudent?.enrolledCourse}
            </p>
          </div>
        </div>

        {/* Role-based Student Switcher */}
        {role === 'student' ? (
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono text-sky-300">
              Personal Academic Record
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-300 whitespace-nowrap">
              Preview as Student:
            </label>
            <select
              value={activeStudentId}
              onChange={e => setActiveStudentId(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-600 text-xs font-semibold text-white focus:outline-hidden focus:border-sky-400 cursor-pointer"
            >
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  {s.fullName} ({s.studentIdCode})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Security Privacy Notice */}
      <div className="p-3.5 rounded-xl bg-sky-950/40 border border-sky-800/40 flex items-center gap-2.5 text-xs text-sky-200">
        <Lock className="w-4 h-4 text-sky-400 shrink-0" />
        <span>
          <strong>Encrypted Delivery:</strong> Document links are generated on demand with short-lived authenticated access tokens. Raw storage files are never publicly exposed.
        </span>
      </div>

      {/* Document Records List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-base font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span>My Certificates & Marksheets</span>
          </h4>
          <span className="text-xs text-slate-400">
            {documents.length} {documents.length === 1 ? 'record' : 'records'} available
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            Loading your academic credentials...
          </div>
        ) : documents.length === 0 ? (
          /* Empty state when no documents are available */
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 sm:p-12 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 mx-auto">
              <FileText className="w-7 h-7" />
            </div>
            <h5 className="text-base font-bold text-white">
              No Academic Documents Issued Yet
            </h5>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
              Your marksheets and completion certificates will appear here once officially generated by the Quantum Learning Institute examination board after course completion.
            </p>
            <div className="pt-2">
              <span className="inline-block text-xs text-sky-400 bg-sky-950/60 border border-sky-800/60 px-3 py-1.5 rounded-xl">
                Enrolled Course: {currentStudent?.enrolledCourse}
              </span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.map(doc => {
              const isMarksheet = doc.documentType === 'marksheet';
              const isRevoked = doc.status === 'revoked';

              return (
                <div
                  key={doc.id}
                  className={`rounded-2xl p-5 border transition-all ${
                    isRevoked
                      ? 'bg-rose-950/30 border-rose-800/60'
                      : 'bg-slate-900/90 border-slate-700/80 hover:border-sky-500/50'
                  } space-y-4`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          isRevoked
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : isMarksheet
                            ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {isMarksheet ? <FileText className="w-5 h-5" /> : <GraduationCap className="w-5 h-5" />}
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          {isMarksheet ? 'Official Marksheet' : 'Completion Certificate'}
                        </span>
                        <h5 className="font-bold text-white text-sm sm:text-base leading-snug">
                          {doc.courseName}
                        </h5>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isRevoked
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      }`}
                    >
                      {doc.status}
                    </span>
                  </div>

                  {/* Metadata Chips */}
                  <div className="bg-slate-950/60 rounded-xl p-3 text-xs space-y-1.5 border border-slate-800">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Reg / Cert No:</span>
                      <span className="font-mono font-bold text-sky-300">{doc.certificateNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Issue Date:</span>
                      <span className="text-white">{doc.issueDate}</span>
                    </div>
                    {doc.marksOrGrade && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Evaluation:</span>
                        <span className="font-semibold text-emerald-300">{doc.marksOrGrade}</span>
                      </div>
                    )}
                    {isRevoked && (
                      <div className="pt-2 border-t border-rose-900/60 text-rose-300 text-[11px]">
                        <strong>Revocation Note:</strong> {doc.revocationReason}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleOpenPreview(doc)}
                      className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-600 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-sky-400" />
                      <span>View Document</span>
                    </button>

                    <button
                      type="button"
                      onClick={async () => {
                        const url = await academicService.getSecureDocumentUrl(doc);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = doc.fileName || `${doc.certificateNumber}.pdf`;
                        a.click();
                      }}
                      className="py-2 px-3.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Document Previewer Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between gap-4 bg-slate-950">
              <div>
                <span className="text-[10px] uppercase font-bold text-sky-400 tracking-wider">
                  Secure Document Viewer · Short-Lived Token
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white truncate">
                  {previewDoc.certificateNumber} - {previewDoc.courseName}
                </h3>
              </div>
              <button
                type="button"
                onClick={handleClosePreview}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Document Preview Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950/80 flex items-center justify-center min-h-[300px]">
              {urlLoading ? (
                <div className="text-center text-slate-400 space-y-2">
                  <div className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs">Generating secure short-lived document link...</p>
                </div>
              ) : previewUrl ? (
                <div className="w-full max-w-2xl bg-white rounded-2xl overflow-hidden shadow-2xl border border-slate-200">
                  {previewDoc.fileMimeType.includes('image') ? (
                    <img
                      src={previewUrl}
                      alt={previewDoc.fileName}
                      className="w-full h-auto object-contain max-h-[60vh]"
                    />
                  ) : (
                    /* SVG / PDF Canvas Container */
                    <div className="w-full aspect-[800/560]">
                      <iframe
                        src={previewUrl}
                        title="Document Viewer"
                        className="w-full h-full border-0"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-rose-400 text-sm">Unable to render preview.</div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="text-slate-400">
                <span>Issued to: </span>
                <strong className="text-white">{previewDoc.studentFullName}</strong>
                <span className="mx-1.5">·</span>
                <span>Date: {previewDoc.issueDate}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClosePreview}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  Close
                </button>
                {previewUrl && (
                  <a
                    href={previewUrl}
                    download={previewDoc.fileName}
                    className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download File</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
