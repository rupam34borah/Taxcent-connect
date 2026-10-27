import React, { useState, useEffect, useRef } from 'react';
import { Language } from '../types';
import { 
  AcademicDocument, 
  StudentProfile, 
  AcademicDocumentType, 
  DocumentAuditLog 
} from '../types/academic';
import { academicService } from '../services/academicService';
import { useAuth } from '../context/AuthContext';
import { 
  Upload, 
  FileText, 
  Plus, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  Edit3, 
  RefreshCw, 
  Trash2, 
  Eye, 
  History, 
  Lock, 
  X, 
  ShieldAlert, 
  Building2, 
  UserCheck, 
  ShieldCheck,
  Award,
  Filter,
  Check,
  Ban,
  Clock
} from 'lucide-react';

interface StaffAcademicDashboardProps {
  lang: Language;
}

export const StaffAcademicDashboard: React.FC<StaffAcademicDashboardProps> = ({ lang }) => {
  const { user, role } = useAuth();
  const isAdmin = role === 'admin';
  const isStaff = role === 'staff';

  const [documents, setDocuments] = useState<AcademicDocument[]>([]);
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'certificate' | 'marksheet'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'valid' | 'revoked'>('all');

  // Authenticated Operator Identity
  const staffName = user?.name || (isAdmin ? 'Prof. D. Saikia (Principal & Admin)' : 'Academic Staff Member (Ranabari Hub)');

  // Modal States
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isReplaceFileModalOpen, setIsReplaceFileModalOpen] = useState(false);
  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

  const [selectedDoc, setSelectedDoc] = useState<AcademicDocument | null>(null);
  const [auditLogs, setAuditLogs] = useState<DocumentAuditLog[]>([]);

  // Form states for Upload
  const [uploadStudentId, setUploadStudentId] = useState('');
  const [uploadDocType, setUploadDocType] = useState<AcademicDocumentType>('certificate');
  const [uploadCertNo, setUploadCertNo] = useState('');
  const [uploadCourseName, setUploadCourseName] = useState('');
  const [uploadIssueDate, setUploadIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [uploadMarks, setUploadMarks] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states for Edit
  const [editCourseName, setEditCourseName] = useState('');
  const [editIssueDate, setEditIssueDate] = useState('');
  const [editMarks, setEditMarks] = useState('');
  const [editError, setEditError] = useState('');

  // Form state for Revocation
  const [revokeReason, setRevokeReason] = useState('');
  const [revokeError, setRevokeError] = useState('');

  // Form state for Replace File
  const [replaceFile, setReplaceFile] = useState<File | null>(null);
  const [replaceError, setReplaceError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [docs, roster] = await Promise.all([
        academicService.getAllDocumentsForStaff(),
        academicService.getStudentProfiles(),
      ]);
      setDocuments(docs);
      setStudents(roster);
      if (roster.length > 0 && !uploadStudentId) {
        setUploadStudentId(roster[0].id);
        setUploadCourseName(roster[0].enrolledCourse);
      }
    } finally {
      setLoading(false);
    }
  };

  // Sync course name when student changes in Upload form
  const handleStudentSelectChange = (stuId: string) => {
    setUploadStudentId(stuId);
    const stu = students.find(s => s.id === stuId);
    if (stu) {
      setUploadCourseName(stu.enrolledCourse);
      // Auto-suggest next certificate number
      const prefix = uploadDocType === 'marksheet' ? 'M' : 'CERT';
      const year = new Date().getFullYear();
      const code = stu.studentIdCode.replace('QLI-STU-', '');
      setUploadCertNo(`QLI-${year}-${prefix}-${code}`);
    }
  };

  const handleOpenUploadModal = () => {
    setUploadError('');
    setIsUploadModalOpen(true);
    if (students.length > 0) {
      const stu = students[0];
      setUploadStudentId(stu.id);
      setUploadCourseName(stu.enrolledCourse);
      setUploadCertNo(`QLI-${new Date().getFullYear()}-CERT-${stu.studentIdCode.replace('QLI-STU-', '')}`);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError('');

    if (!uploadFile) {
      setUploadError('Please select a PDF document or supported image file.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await academicService.uploadAcademicDocument({
        studentId: uploadStudentId,
        documentType: uploadDocType,
        certificateNumber: uploadCertNo,
        courseName: uploadCourseName,
        issueDate: uploadIssueDate,
        marksOrGrade: uploadMarks,
        file: uploadFile,
        staffName,
      });

      if (!res.success) {
        setUploadError(res.error || 'Failed to upload document.');
        return;
      }

      // Success
      setIsUploadModalOpen(false);
      setUploadFile(null);
      setUploadMarks('');
      await loadAllData();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEditModal = (doc: AcademicDocument) => {
    setSelectedDoc(doc);
    setEditCourseName(doc.courseName);
    setEditIssueDate(doc.issueDate);
    setEditMarks(doc.marksOrGrade || '');
    setEditError('');
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoc) return;
    setIsSubmitting(true);
    try {
      const res = await academicService.updateDocumentMetadata(selectedDoc.id, {
        courseName: editCourseName,
        issueDate: editIssueDate,
        marksOrGrade: editMarks,
        staffName,
      });

      if (!res.success) {
        setEditError(res.error || 'Update failed.');
        return;
      }

      setIsEditModalOpen(false);
      await loadAllData();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenReplaceFileModal = (doc: AcademicDocument) => {
    setSelectedDoc(doc);
    setReplaceFile(null);
    setReplaceError('');
    setIsReplaceFileModalOpen(true);
  };

  const handleReplaceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoc || !replaceFile) {
      setReplaceError('Please select a replacement file.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await academicService.replaceDocumentFile(selectedDoc.id, replaceFile, staffName);
      if (!res.success) {
        setReplaceError(res.error || 'Replacement failed.');
        return;
      }

      setIsReplaceFileModalOpen(false);
      await loadAllData();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenRevokeModal = (doc: AcademicDocument) => {
    setSelectedDoc(doc);
    setRevokeReason('');
    setRevokeError('');
    setIsRevokeModalOpen(true);
  };

  const handleRevokeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoc) return;
    if (!revokeReason.trim()) {
      setRevokeError('A mandatory reason is required to revoke an issued document.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await academicService.revokeDocument(selectedDoc.id, revokeReason, staffName);
      if (!res.success) {
        setRevokeError(res.error || 'Revocation failed.');
        return;
      }

      setIsRevokeModalOpen(false);
      await loadAllData();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRestoreDoc = async (doc: AcademicDocument) => {
    if (!isAdmin) {
      alert('Administrator authorization is required to restore certificates.');
      return;
    }
    if (!confirm(`Are you sure you want to reinstate certificate #${doc.certificateNumber}?`)) {
      return;
    }
    await academicService.restoreDocument(doc.id, staffName);
    await loadAllData();
  };

  const handleApproveDoc = async (doc: AcademicDocument) => {
    if (!isAdmin) {
      alert('Administrator authorization is required to approve academic records.');
      return;
    }
    await academicService.approveDocument(doc.id, staffName);
    await loadAllData();
  };

  const handleRejectDoc = async (doc: AcademicDocument) => {
    if (!isAdmin) {
      alert('Administrator authorization is required to reject academic records.');
      return;
    }
    const reason = prompt(`Enter rejection reason for document #${doc.certificateNumber}:`);
    if (!reason || !reason.trim()) return;
    await academicService.rejectDocument(doc.id, reason, staffName);
    await loadAllData();
  };

  const handleOpenAuditModal = (doc?: AcademicDocument) => {
    setSelectedDoc(doc || null);
    const logs = academicService.getAuditLogs();
    if (doc) {
      setAuditLogs(logs.filter(l => l.documentId === doc.id || l.certificateNumber === doc.certificateNumber));
    } else {
      setAuditLogs(logs);
    }
    setIsAuditModalOpen(true);
  };

  // Filtered documents list
  const filteredDocs = documents.filter(doc => {
    if (typeFilter !== 'all' && doc.documentType !== typeFilter) return false;
    if (statusFilter !== 'all' && doc.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = doc.studentFullName.toLowerCase().includes(q);
      const matchCert = doc.certificateNumber.toLowerCase().includes(q);
      const matchCourse = doc.courseName.toLowerCase().includes(q);
      const matchStuId = doc.studentIdCode.toLowerCase().includes(q);
      return matchName || matchCert || matchCourse || matchStuId;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Authority Bar */}
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 font-bold ${
            isAdmin ? 'bg-amber-500/20 border border-amber-400 text-amber-400' : 'bg-sky-500/20 border border-sky-400 text-sky-400'
          }`}>
            {isAdmin ? <ShieldCheck className="w-6 h-6" /> : <UserCheck className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold uppercase tracking-wider ${isAdmin ? 'text-amber-400' : 'text-sky-400'}`}>
                {isAdmin ? 'Institute Admin Console' : 'Academic Staff Data Entry Hub'}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {isAdmin ? 'Full Authority: View, Approve & Revoke' : 'Staff Mode: Input Data & View Records'}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white">
              {isAdmin ? 'Administrative Approval & Record Authority' : 'Academic Marksheets & Certificate Registry'}
            </h3>
            <p className="text-xs text-slate-400">
              Operator: <span className="text-slate-200 font-semibold">{staffName}</span> · {isAdmin ? 'Can view, approve/reject, revoke, and inspect audit logs' : 'Can input new records and view documents'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => handleOpenAuditModal()}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <History className="w-4 h-4 text-sky-400" />
            <span>Audit Trail</span>
          </button>

          <button
            type="button"
            onClick={handleOpenUploadModal}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-md cursor-pointer transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>{isAdmin ? 'Add & Publish Document' : '+ Input / Upload Document'}</span>
          </button>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by student, cert #, or course..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-sky-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center gap-1 text-xs text-slate-400 shrink-0">
            <Filter className="w-3.5 h-3.5 text-sky-400" />
            <span>Type:</span>
          </div>
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value as any)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-hidden focus:border-sky-400 cursor-pointer"
          >
            <option value="all">All Types</option>
            <option value="certificate">Certificates</option>
            <option value="marksheet">Marksheets</option>
          </select>

          <div className="flex items-center gap-1 text-xs text-slate-400 shrink-0 ml-2">
            <span>Status:</span>
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-hidden focus:border-sky-400 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="valid">Valid Only</option>
            <option value="revoked">Revoked Only</option>
          </select>
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Cert / Reg No</th>
                <th className="py-3 px-4">Student & ID</th>
                <th className="py-3 px-4">Course</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Issue Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Approval</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No documents matched the criteria.
                  </td>
                </tr>
              ) : (
                filteredDocs.map(doc => {
                  const isRevoked = doc.status === 'revoked';

                  return (
                    <tr
                      key={doc.id}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        isRevoked ? 'bg-rose-950/20' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-mono font-bold text-sky-300">
                        {doc.certificateNumber}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-white block">
                          {doc.studentFullName}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          {doc.studentIdCode}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300 max-w-[200px] truncate">
                        {doc.courseName}
                      </td>
                      <td className="py-3 px-4 capitalize">
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                          {doc.documentType}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                        {doc.issueDate}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] tracking-wider ${
                            isRevoked
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          }`}
                        >
                          {doc.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {doc.approvalStatus === 'pending' ? (
                          <span className="px-2 py-0.5 rounded-full font-bold uppercase text-[10px] tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>Pending Review</span>
                          </span>
                        ) : doc.approvalStatus === 'rejected' ? (
                          <span className="px-2 py-0.5 rounded-full font-bold uppercase text-[10px] tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40 inline-flex items-center gap-1">
                            <Ban className="w-3 h-3" />
                            <span>Rejected</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full font-bold uppercase text-[10px] tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Approved</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {/* Admin Only Approval Button for pending documents */}
                          {isAdmin && doc.approvalStatus === 'pending' && (
                            <button
                              type="button"
                              onClick={() => handleApproveDoc(doc)}
                              title="Admin: Approve Document"
                              className="px-2 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-[10px] flex items-center gap-1 cursor-pointer shadow-sm active:scale-95"
                            >
                              <Check className="w-3 h-3" />
                              <span>Approve</span>
                            </button>
                          )}

                          {/* Edit Details (Corrections) */}
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(doc)}
                            title="Edit Metadata (Correction)"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Replace File */}
                          <button
                            type="button"
                            onClick={() => handleOpenReplaceFileModal(doc)}
                            title="Replace File"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 transition-colors cursor-pointer"
                          >
                            <Upload className="w-3.5 h-3.5" />
                          </button>

                          {/* Audit History */}
                          <button
                            type="button"
                            onClick={() => handleOpenAuditModal(doc)}
                            title="View Audit Trail"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>

                          {/* Revoke or Restore: Only Admin has authority; for Staff it is restricted */}
                          {isAdmin ? (
                            isRevoked ? (
                              <button
                                type="button"
                                onClick={() => handleRestoreDoc(doc)}
                                title="Admin: Reinstate/Restore Valid Status"
                                className="px-2 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900 transition-colors font-bold text-[10px] cursor-pointer"
                              >
                                Restore
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleOpenRevokeModal(doc)}
                                title="Admin: Revoke Certificate with Mandatory Reason"
                                className="px-2 py-1 rounded-lg bg-rose-950 text-rose-300 border border-rose-800 hover:bg-rose-900 transition-colors font-bold text-[10px] cursor-pointer flex items-center gap-1"
                              >
                                <ShieldAlert className="w-3 h-3" />
                                <span>Revoke</span>
                              </button>
                            )
                          ) : (
                            <span
                              title="Administrator Authority Required: Staff can input data and view records, but cannot revoke certificates."
                              className="px-2 py-1 rounded-lg bg-slate-800/80 text-slate-500 border border-slate-700 text-[10px] flex items-center gap-1 cursor-not-allowed select-none"
                            >
                              <Lock className="w-2.5 h-2.5" />
                              <span>Revoke</span>
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL: UPLOAD NEW ACADEMIC DOCUMENT ================= */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
                  <Upload className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-white text-base">
                  Upload Academic Document / Certificate
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {uploadError && (
              <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-700 text-rose-200 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{uploadError}</span>
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              {/* Student Selection */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Select Authorised Student <span className="text-rose-400">*</span>
                </label>
                <select
                  value={uploadStudentId}
                  onChange={e => handleStudentSelectChange(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-medium focus:border-sky-400"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.studentIdCode}) - {s.enrolledCourse}
                    </option>
                  ))}
                </select>
              </div>

              {/* Document Type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Document Type <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={uploadDocType}
                    onChange={e => {
                      const t = e.target.value as AcademicDocumentType;
                      setUploadDocType(t);
                      if (uploadStudentId) {
                        const stu = students.find(s => s.id === uploadStudentId);
                        if (stu) {
                          const prefix = t === 'marksheet' ? 'M' : 'CERT';
                          setUploadCertNo(`QLI-${new Date().getFullYear()}-${prefix}-${stu.studentIdCode.replace('QLI-STU-', '')}`);
                        }
                      }
                    }}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-medium focus:border-sky-400"
                  >
                    <option value="certificate">Completion Certificate</option>
                    <option value="marksheet">Official Marksheet</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Certificate / Marksheet Number <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={uploadCertNo}
                    onChange={e => setUploadCertNo(e.target.value.toUpperCase())}
                    placeholder="e.g. QLI-2026-DCA-1050"
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono font-bold focus:border-sky-400"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Must be strictly unique across all records.
                  </span>
                </div>
              </div>

              {/* Course & Issue Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Course Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={uploadCourseName}
                    onChange={e => setUploadCourseName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-medium focus:border-sky-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Issue Date <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={uploadIssueDate}
                    onChange={e => setUploadIssueDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-medium focus:border-sky-400"
                  />
                </div>
              </div>

              {/* Marks or Grade */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Marks or Grade Evaluation (Private)
                </label>
                <input
                  type="text"
                  value={uploadMarks}
                  onChange={e => setUploadMarks(e.target.value)}
                  placeholder="e.g. Grade A+ (94%) or Total: 470/500"
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:border-sky-400"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Private record. Visible only to authenticated student and staff; masked in public verification.
                </span>
              </div>

              {/* File Upload Box */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Attach PDF or Document Image (Max 5MB) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".pdf,image/png,image/jpeg,image/webp"
                  onChange={e => {
                    if (e.target.files && e.target.files[0]) {
                      setUploadFile(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-700 hover:border-sky-500 rounded-2xl p-4 text-center cursor-pointer transition-colors bg-slate-950/40"
                >
                  <Upload className="w-6 h-6 text-sky-400 mx-auto mb-1" />
                  {uploadFile ? (
                    <div>
                      <span className="font-semibold text-white block">{uploadFile.name}</span>
                      <span className="text-[10px] text-slate-400">
                        ({(uploadFile.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                  ) : (
                    <div>
                      <span className="font-semibold text-sky-300 block">
                        Click to select document file
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Supports PDF, PNG, JPG, WEBP (Max: 5 MB)
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-slate-950 font-bold transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Uploading...' : 'Save & Publish to Registry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT METADATA / CORRECTION ================= */}
      {isEditModalOpen && selectedDoc && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">
                Correct Metadata · {selectedDoc.certificateNumber}
              </h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editError && (
              <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-700 text-rose-200 text-xs">
                {editError}
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Student</label>
                <input
                  type="text"
                  disabled
                  value={`${selectedDoc.studentFullName} (${selectedDoc.studentIdCode})`}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Course Name</label>
                <input
                  type="text"
                  required
                  value={editCourseName}
                  onChange={e => setEditCourseName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Issue Date</label>
                <input
                  type="date"
                  required
                  value={editIssueDate}
                  onChange={e => setEditIssueDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Marks / Evaluation</label>
                <input
                  type="text"
                  value={editMarks}
                  onChange={e => setEditMarks(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold"
                >
                  Save Corrections
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: REPLACE FILE ================= */}
      {isReplaceFileModalOpen && selectedDoc && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">
                Replace File · {selectedDoc.certificateNumber}
              </h3>
              <button
                type="button"
                onClick={() => setIsReplaceFileModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Upload an updated PDF or image for <strong>{selectedDoc.studentFullName}</strong>. The old document will be superseded and an audit record will be logged.
            </p>

            {replaceError && (
              <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-700 text-rose-200 text-xs">
                {replaceError}
              </div>
            )}

            <form onSubmit={handleReplaceSubmit} className="space-y-4 text-xs">
              <input
                type="file"
                ref={replaceFileInputRef}
                accept=".pdf,image/png,image/jpeg,image/webp"
                onChange={e => {
                  if (e.target.files && e.target.files[0]) {
                    setReplaceFile(e.target.files[0]);
                  }
                }}
                className="hidden"
              />
              <div
                onClick={() => replaceFileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-sky-500 rounded-2xl p-4 text-center cursor-pointer transition-colors bg-slate-950/40"
              >
                <Upload className="w-6 h-6 text-sky-400 mx-auto mb-1" />
                {replaceFile ? (
                  <div>
                    <span className="font-semibold text-white block">{replaceFile.name}</span>
                    <span className="text-[10px] text-slate-400">
                      ({(replaceFile.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                ) : (
                  <div>
                    <span className="font-semibold text-sky-300 block">
                      Click to choose new replacement file
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Supports PDF, PNG, JPG (Max 5MB)
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsReplaceFileModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold"
                >
                  Upload Replacement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: REVOKE DOCUMENT WITH REASON ================= */}
      {isRevokeModalOpen && selectedDoc && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-700 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-rose-900/60">
              <div className="flex items-center gap-2 text-rose-400 font-bold">
                <ShieldAlert className="w-5 h-5" />
                <h3>Revoke Certificate #{selectedDoc.certificateNumber}</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsRevokeModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-rose-200 leading-relaxed">
              <strong>Warning:</strong> Revoking this certificate will immediately mark it as <em>INVALID / REVOKED</em> on the public verification portal and student portal. It will never be shown as valid.
            </p>

            {revokeError && (
              <div className="p-3 rounded-xl bg-rose-950 border border-rose-600 text-rose-200 text-xs">
                {revokeError}
              </div>
            )}

            <form onSubmit={handleRevokeSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Revocation Reason <span className="text-rose-400">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={revokeReason}
                  onChange={e => setRevokeReason(e.target.value)}
                  placeholder="e.g. Identity discrepancy, course discontinuation, or superseded by corrected certificate."
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:border-rose-400"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRevokeModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold"
                >
                  Confirm Revocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: AUDIT LOGS ================= */}
      {isAuditModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-sky-400" />
                <h3 className="font-bold text-white text-base">
                  Audit Trail {selectedDoc ? `· ${selectedDoc.certificateNumber}` : '· Full System'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAuditModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-3 text-xs">
              {auditLogs.length === 0 ? (
                <div className="text-center text-slate-500 py-8">
                  No audit logs recorded for this selection yet.
                </div>
              ) : (
                auditLogs.map(log => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sky-300 font-mono">
                        {log.action}
                      </span>
                      <span className="text-slate-500 text-[10px]">
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-slate-300">
                      Cert #: <strong className="font-mono text-white">{log.certificateNumber}</strong> · Performed by: <span className="text-amber-300">{log.performedByName}</span>
                    </div>
                    {log.details && (
                      <pre className="text-[10px] text-slate-400 bg-slate-900/60 p-2 rounded-lg overflow-x-auto">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setIsAuditModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
