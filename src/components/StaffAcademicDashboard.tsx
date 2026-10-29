import React, { useState, useEffect, useRef } from 'react';
import { Language } from '../types';
import { 
  AcademicDocument, 
  StudentProfile, 
  StaffMember,
  CourseItem,
  BatchItem,
  AttendanceRecord,
  AssessmentItem,
  StudentMarkRecord,
  LearningResourceItem,
  MockTestItem,
  GovtExamPaperItem,
  AcademicAuditLog,
  AcademicDocumentType,
  AttendanceStatus,
  ApprovalStatus,
  ExamCategory
} from '../types/academic';
import { academicService } from '../services/academicService';
import { useAuth } from '../context/AuthContext';
import { downloadAcademicDocumentPdf, printAcademicDocument } from '../utils/certificateGenerator';
import { 
  LayoutDashboard,
  Users,
  UserPlus,
  GraduationCap,
  CalendarCheck,
  Award,
  BookOpen,
  FileCheck2,
  History,
  Download,
  Search,
  Plus,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  FileText,
  Lock,
  Check,
  X,
  ExternalLink,
  Shield,
  Building2,
  Clock,
  Filter,
  UserCheck,
  RefreshCw,
  Database,
  ChevronRight,
  Send,
  HelpCircle,
  ShieldAlert,
  Printer,
  Paperclip,
  Sparkles,
  UploadCloud
} from 'lucide-react';

interface StaffAcademicDashboardProps {
  lang: Language;
}

export const StaffAcademicDashboard: React.FC<StaffAcademicDashboardProps> = ({ lang }) => {
  const { user, role } = useAuth();
  const isAdmin = role === 'admin';
  const isStaff = role === 'staff';

  // Navigation tab inside Admin/Staff portal
  const [activeTab, setActiveTab] = useState<'dashboard' | 'staff' | 'students' | 'attendance' | 'marks' | 'certificates' | 'learning' | 'audit'>(
    isAdmin ? 'dashboard' : 'attendance'
  );

  // Core Data States
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [batches, setBatches] = useState<BatchItem[]>([]);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [documents, setDocuments] = useState<AcademicDocument[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [assessments, setAssessments] = useState<AssessmentItem[]>([]);
  const [learningMaterials, setLearningMaterials] = useState<LearningResourceItem[]>([]);
  const [mockTests, setMockTests] = useState<MockTestItem[]>([]);
  const [govtPapers, setGovtPapers] = useState<GovtExamPaperItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AcademicAuditLog[]>([]);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBatchFilter, setSelectedBatchFilter] = useState('all');
  const [attendanceTypeFilter, setAttendanceTypeFilter] = useState<'student' | 'staff'>('student');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);

  // Modals
  const [isAddStaffModalOpen, setIsAddStaffModalOpen] = useState(false);
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [isCorrectAttendanceModalOpen, setIsCorrectAttendanceModalOpen] = useState(false);
  const [isUploadDocModalOpen, setIsUploadDocModalOpen] = useState(false);
  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false);
  const [isInviteLinkModalOpen, setIsInviteLinkModalOpen] = useState(false);
  const [isMarksModalOpen, setIsMarksModalOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<AcademicDocument | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Invite Link state
  const [generatedInviteLink, setGeneratedInviteLink] = useState('');
  const [inviteModalTitle, setInviteModalTitle] = useState('');

  // Selected item references for actions
  const [selectedAttendance, setSelectedAttendance] = useState<AttendanceRecord | null>(null);
  const [attendanceNewStatus, setAttendanceNewStatus] = useState<AttendanceStatus>('present');
  const [attendanceCorrectionReason, setAttendanceCorrectionReason] = useState('');

  const [selectedDocForRevoke, setSelectedDocForRevoke] = useState<AcademicDocument | null>(null);
  const [revokeReason, setRevokeReason] = useState('');

  // Form states for Staff Creation (Admin)
  const [staffForm, setStaffForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    designation: 'Faculty Instructor',
    role: 'staff' as 'admin' | 'staff',
    permissions: ['attendance', 'marks_entry', 'learning_materials'],
    assignedCourses: ['DCA'],
  });

  // Form states for Student Admission
  const [studentForm, setStudentForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    courseId: 'crs-dca',
    batchCode: 'DCA-2026-M1',
    admissionDate: new Date().toISOString().split('T')[0],
  });

  // Form states for Document Upload / Certificate Draft
  const [docForm, setDocForm] = useState({
    studentId: '',
    documentType: 'certificate' as AcademicDocumentType,
    certificateNumber: '',
    courseName: 'Diploma in Computer Application (DCA)',
    issueDate: new Date().toISOString().split('T')[0],
    marksOrGrade: '',
  });
  const [docFile, setDocFile] = useState<File | null>(null);
  const docFileInputRef = useRef<HTMLInputElement>(null);

  // Form states for Assessment & Marks
  const [selectedAssessmentForMarks, setSelectedAssessmentForMarks] = useState<AssessmentItem | null>(null);
  const [currentMarksInput, setCurrentMarksInput] = useState<Record<string, { marks: number; remarks: string }>>({});

  // Unified Exam Evaluation & Certificate Submission
  const [isUnifiedModalOpen, setIsUnifiedModalOpen] = useState(false);
  const [unifiedForm, setUnifiedForm] = useState({
    studentId: '',
    courseName: 'Diploma in Computer Application (DCA)',
    batchId: '',
    batchCode: '',
    assessmentTitle: 'Final Comprehensive Practical & Theory Examination',
    examDate: new Date().toISOString().split('T')[0],
    maxScore: 100,
    marksObtained: 85,
    remarks: 'Satisfactorily cleared all practical modules and written examination.',
    certificateNumber: '',
    issueDate: new Date().toISOString().split('T')[0],
  });
  const [answerSheetFile, setAnswerSheetFile] = useState<File | null>(null);
  const answerSheetFileInputRef = useRef<HTMLInputElement>(null);

  // Answer Sheet Viewer State
  const [viewingAnswerSheetDoc, setViewingAnswerSheetDoc] = useState<AcademicDocument | null>(null);
  const [viewingAnswerSheetUrl, setViewingAnswerSheetUrl] = useState<string | null>(null);

  // Operator Identification
  const operatorName = user?.name || (isAdmin ? 'Prof. Debajit Saikia (Admin)' : 'Ananya Dutta (Staff)');
  const operatorRole = role || 'staff';

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [
        crs,
        bts,
        stf,
        stu,
        docs,
        att,
        asm,
        lrn,
        tst,
        gov,
        aud
      ] = await Promise.all([
        academicService.getCourses(),
        academicService.getBatches(),
        academicService.getStaffMembers(),
        academicService.getStudentProfiles(),
        academicService.getAllDocumentsForStaff(),
        academicService.getAllAttendance(),
        academicService.getAssessments(),
        academicService.getLearningMaterials(),
        academicService.getMockTests(),
        academicService.getGovtExamPapers(),
        academicService.getAuditLogs(),
      ]);

      setCourses(crs);
      setBatches(bts);
      setStaffList(stf);
      setStudents(stu);
      setDocuments(docs);
      setAttendance(att);
      setAssessments(asm);
      setLearningMaterials(lrn);
      setMockTests(tst);
      setGovtPapers(gov);
      setAuditLogs(aud);

      // Prepopulate doc form student if available
      if (stu.length > 0 && !docForm.studentId) {
        setDocForm(prev => ({
          ...prev,
          studentId: stu[0].id,
          courseName: stu[0].enrolledCourse,
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------------------------------
  // STAFF ACTIONS (ADMIN)
  // ------------------------------------------------------------------
  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffForm.fullName || !staffForm.email) return;

    const res = await academicService.createStaffMember({
      fullName: staffForm.fullName,
      email: staffForm.email,
      phone: staffForm.phone,
      designation: staffForm.designation,
      role: staffForm.role,
      permissions: staffForm.permissions,
      assignedCourses: staffForm.assignedCourses,
      assignedBatches: [],
      adminName: operatorName,
    });

    if (res.success && res.staff) {
      setIsAddStaffModalOpen(false);
      setStaffForm({
        fullName: '',
        email: '',
        phone: '',
        designation: 'Faculty Instructor',
        role: 'staff',
        permissions: ['attendance', 'marks_entry', 'learning_materials'],
        assignedCourses: ['DCA'],
      });
      await loadAllData();

      if (res.inviteLink) {
        setInviteModalTitle(`Staff Account Created: ${res.staff.fullName}`);
        setGeneratedInviteLink(res.inviteLink);
        setIsInviteLinkModalOpen(true);
      } else {
        alert(`Invitation email sent to ${res.staff.email}. They can sign in after accepting it.`);
      }
    } else {
      alert(res.error || 'Failed to create staff member.');
    }
  };

  const handleToggleStaffActive = async (staff: StaffMember) => {
    const action = staff.isActive ? 'Deactivate' : 'Reactivate';
    if (!confirm(`Are you sure you want to ${action} access for ${staff.fullName}?`)) return;

    const res = await academicService.toggleStaffActive(staff.id, operatorName);
    if (res.success) {
      loadAllData();
    } else {
      alert(res.error || 'Failed to update staff status.');
    }
  };

  const handleResendStaffInvite = async (stf: StaffMember) => {
    const res = await academicService.resendInvitationLink({
      email: stf.email,
      fullName: stf.fullName,
      kind: 'staff',
      operatorName,
    });
    if (res.success && res.inviteLink) {
      setInviteModalTitle(res.message || `Access & Invitation Link for ${stf.fullName} (${stf.email})`);
      setGeneratedInviteLink(res.inviteLink);
      setIsInviteLinkModalOpen(true);
    } else {
      alert(res.error || 'Failed to resend invite link.');
    }
  };

  const handleResendStudentInvite = async (stu: StudentProfile) => {
    const res = await academicService.resendInvitationLink({
      email: stu.email,
      fullName: stu.fullName,
      kind: 'student',
      operatorName,
    });
    if (res.success && res.inviteLink) {
      setInviteModalTitle(res.message || `Access & Invitation Link for ${stu.fullName} (${stu.email})`);
      setGeneratedInviteLink(res.inviteLink);
      setIsInviteLinkModalOpen(true);
    } else {
      alert(res.error || 'Failed to resend invite link.');
    }
  };

  // ------------------------------------------------------------------
  // STUDENT ADMISSION ACTIONS
  // ------------------------------------------------------------------
  const handleRegisterStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentForm.fullName || !studentForm.email) return;

    const selectedCourse = courses.find(c => c.id === studentForm.courseId) || courses[0];
    const res = await academicService.registerStudent({
      fullName: studentForm.fullName,
      email: studentForm.email,
      phone: studentForm.phone,
      courseId: selectedCourse?.id || 'crs-dca',
      courseName: selectedCourse?.name || 'Diploma in Computer Application (DCA)',
      batchCode: studentForm.batchCode,
      admissionDate: studentForm.admissionDate,
      operatorName,
      operatorRole,
    });

    if (res.success && res.student) {
      setIsAddStudentModalOpen(false);
      setStudentForm({
        fullName: '',
        email: '',
        phone: '',
        courseId: 'crs-dca',
        batchCode: 'DCA-2026-M1',
        admissionDate: new Date().toISOString().split('T')[0],
      });
      await loadAllData();

      if (res.inviteLink) {
        setInviteModalTitle(`Student Enrolled: ${res.student.fullName} (${res.student.studentIdCode})`);
        setGeneratedInviteLink(res.inviteLink);
        setIsInviteLinkModalOpen(true);
      } else {
        alert(`Invitation email sent to ${res.student.email}. They can sign in after accepting it.`);
      }
    } else {
      alert(res.error || 'Failed to register student.');
    }
  };

  // ------------------------------------------------------------------
  // ATTENDANCE ACTIONS
  // ------------------------------------------------------------------
  const handleQuickMarkToday = async (student: StudentProfile, status: AttendanceStatus) => {
    const res = await academicService.markAttendanceSession({
      personType: 'student',
      date: attendanceDate,
      sessionName: 'morning',
      records: [
        {
          personId: student.id,
          personName: student.fullName,
          identifierCode: student.studentIdCode,
          courseOrDept: student.enrolledCourse,
          batchId: student.batchId,
          batchCode: student.batchCode,
          status,
        },
      ],
      markedBy: operatorName,
      markedByRole: operatorRole,
    });

    if (res.success) {
      const updated = await academicService.getAllAttendance();
      setAttendance(updated);
    }
  };

  const handleOpenAttendanceCorrection = (rec: AttendanceRecord) => {
    setSelectedAttendance(rec);
    setAttendanceNewStatus(rec.status);
    setAttendanceCorrectionReason('');
    setIsCorrectAttendanceModalOpen(true);
  };

  const handleSaveAttendanceCorrection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAttendance) return;
    if (!attendanceCorrectionReason.trim()) {
      alert('A mandatory reason is required to correct official attendance.');
      return;
    }

    const res = await academicService.correctAttendanceRecord({
      recordId: selectedAttendance.id,
      newStatus: attendanceNewStatus,
      reason: attendanceCorrectionReason,
      correctedBy: operatorName,
      correctedByRole: operatorRole,
    });

    if (res.success) {
      setIsCorrectAttendanceModalOpen(false);
      setSelectedAttendance(null);
      const updated = await academicService.getAllAttendance();
      setAttendance(updated);
    } else {
      alert(res.error || 'Failed to correct attendance record.');
    }
  };

  const handleExportAttendanceCsv = () => {
    const csv = academicService.exportAttendanceCsv(attendance);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `QLI_Attendance_Export_${attendanceDate}.csv`;
    link.click();
  };

  // ------------------------------------------------------------------
  // MARKS & ASSESSMENT ACTIONS
  // ------------------------------------------------------------------
  const handleOpenMarksEntry = async (asm: AssessmentItem) => {
    setSelectedAssessmentForMarks(asm);
    const existingMarks = await academicService.getMarksForAssessment(asm.id);
    const inputMap: Record<string, { marks: number; remarks: string }> = {};

    students.forEach(s => {
      const match = existingMarks.find(m => m.studentId === s.id);
      inputMap[s.id] = {
        marks: match ? match.marksObtained : 0,
        remarks: match?.remarks || '',
      };
    });

    setCurrentMarksInput(inputMap);
    setIsMarksModalOpen(true);
  };

  const handleSaveMarks = async (isDraft: boolean) => {
    if (!selectedAssessmentForMarks) return;

    const marksList = students.map(s => ({
      studentId: s.id,
      studentIdCode: s.studentIdCode,
      studentName: s.fullName,
      marksObtained: Number(currentMarksInput[s.id]?.marks || 0),
      remarks: currentMarksInput[s.id]?.remarks || '',
    }));

    const status: ApprovalStatus = isDraft ? 'draft' : (isAdmin ? 'approved' : 'pending');

    const res = await academicService.saveStudentMarks({
      assessmentId: selectedAssessmentForMarks.id,
      marksList,
      maxScore: selectedAssessmentForMarks.maxScore,
      status,
      enteredBy: operatorName,
    });

    if (res.success) {
      setIsMarksModalOpen(false);
      setSelectedAssessmentForMarks(null);
      await loadAllData();
      alert(isDraft ? 'Marks draft saved successfully.' : 'Marks submitted for review.');
    } else {
      alert(res.error || 'Error saving marks.');
    }
  };

  const handleApproveAssessment = async (asmId: string) => {
    if (!confirm('Approve and publish assessment marks for student portals?')) return;
    const res = await academicService.approveAssessmentMarks(asmId, operatorName);
    if (res.success) {
      await loadAllData();
    }
  };

  // ------------------------------------------------------------------
  // CERTIFICATES & MARKSHEET ACTIONS
  // ------------------------------------------------------------------
  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docForm.certificateNumber.trim() || !docFile) {
      alert('Please fill the certificate number and select a PDF or image document.');
      return;
    }

    const res = await academicService.uploadAcademicDocument({
      studentId: docForm.studentId,
      documentType: docForm.documentType,
      certificateNumber: docForm.certificateNumber,
      courseName: docForm.courseName,
      issueDate: docForm.issueDate,
      marksOrGrade: docForm.marksOrGrade,
      file: docFile,
      staffName: operatorName,
      isAdmin,
    });

    if (res.success) {
      setIsUploadDocModalOpen(false);
      setDocFile(null);
      setDocForm({
        studentId: students[0]?.id || '',
        documentType: 'certificate',
        certificateNumber: '',
        courseName: 'Diploma in Computer Application (DCA)',
        issueDate: new Date().toISOString().split('T')[0],
        marksOrGrade: '',
      });
      await loadAllData();
      alert(isAdmin ? 'Certificate uploaded and approved.' : 'Certificate draft submitted for Admin approval.');
    } else {
      alert(res.error || 'Failed to upload document.');
    }
  };

  const handleApproveDoc = async (doc: AcademicDocument) => {
    const res = await academicService.approveDocument(doc.id, operatorName);
    if (res.success) {
      loadAllData();
    }
  };

  const handleRejectDoc = async (doc: AcademicDocument) => {
    const reason = prompt('Please enter rejection reason:');
    if (!reason) return;
    const res = await academicService.rejectDocument(doc.id, reason, operatorName);
    if (res.success) {
      loadAllData();
    }
  };

  const handleOpenRevoke = (doc: AcademicDocument) => {
    setSelectedDocForRevoke(doc);
    setRevokeReason('');
    setIsRevokeModalOpen(true);
  };

  const handleConfirmRevoke = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDocForRevoke) return;
    if (!revokeReason.trim()) {
      alert('A clear revocation reason is mandatory.');
      return;
    }

    const res = await academicService.revokeDocument(selectedDocForRevoke.id, revokeReason, operatorName);
    if (res.success) {
      setIsRevokeModalOpen(false);
      setSelectedDocForRevoke(null);
      loadAllData();
    } else {
      alert(res.error || 'Failed to revoke document.');
    }
  };

  const handleRestoreDoc = async (doc: AcademicDocument) => {
    if (!confirm(`Restore certificate ${doc.certificateNumber} back to valid standing?`)) return;
    const res = await academicService.restoreDocument(doc.id, operatorName);
    if (res.success) {
      loadAllData();
    }
  };

  const handlePreviewDoc = async (doc: AcademicDocument) => {
    setPreviewDoc(doc);
    const url = await academicService.getSecureDocumentUrl(doc);
    setPreviewUrl(url);
  };

  // ------------------------------------------------------------------
  // UNIFIED EXAM & CERTIFICATE ACTION HANDLERS
  // ------------------------------------------------------------------
  const handleOpenUnifiedModal = async (preselectedStudentId?: string) => {
    const targetStudent = students.find(s => s.id === preselectedStudentId) || students[0];
    const targetCourse = targetStudent?.enrolledCourse || 'Diploma in Computer Application (DCA)';
    const suggestedCertNo = await academicService.getNextCertificateNumber(targetCourse);

    setUnifiedForm({
      studentId: targetStudent?.id || '',
      courseName: targetCourse,
      batchId: targetStudent?.batchId || '',
      batchCode: targetStudent?.batchCode || '',
      assessmentTitle: `${targetCourse} — Final Comprehensive Examination`,
      examDate: new Date().toISOString().split('T')[0],
      maxScore: 100,
      marksObtained: 85,
      remarks: 'Satisfactorily cleared all practical modules and written examination.',
      certificateNumber: suggestedCertNo,
      issueDate: new Date().toISOString().split('T')[0],
    });
    setAnswerSheetFile(null);
    if (answerSheetFileInputRef.current) answerSheetFileInputRef.current.value = '';
    setIsUnifiedModalOpen(true);
  };

  const handleUnifiedStudentChange = async (studentId: string) => {
    const targetStudent = students.find(s => s.id === studentId);
    if (!targetStudent) return;
    const targetCourse = targetStudent.enrolledCourse || 'Diploma in Computer Application (DCA)';
    const suggestedCertNo = await academicService.getNextCertificateNumber(targetCourse);
    setUnifiedForm(prev => ({
      ...prev,
      studentId,
      courseName: targetCourse,
      batchId: targetStudent.batchId || '',
      batchCode: targetStudent.batchCode || '',
      assessmentTitle: `${targetCourse} — Final Comprehensive Examination`,
      certificateNumber: suggestedCertNo,
    }));
  };

  const handleSaveUnifiedSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unifiedForm.studentId) {
      alert('Please select a student.');
      return;
    }
    if (unifiedForm.marksObtained < 0 || unifiedForm.marksObtained > unifiedForm.maxScore) {
      alert(`Marks obtained (${unifiedForm.marksObtained}) must be between 0 and maximum marks (${unifiedForm.maxScore}).`);
      return;
    }

    const res = await academicService.submitUnifiedExamEvaluation({
      studentId: unifiedForm.studentId,
      courseName: unifiedForm.courseName,
      batchId: unifiedForm.batchId,
      batchCode: unifiedForm.batchCode,
      assessmentTitle: unifiedForm.assessmentTitle,
      examDate: unifiedForm.examDate,
      maxScore: Number(unifiedForm.maxScore),
      marksObtained: Number(unifiedForm.marksObtained),
      remarks: unifiedForm.remarks,
      certificateNumber: unifiedForm.certificateNumber,
      issueDate: unifiedForm.issueDate,
      answerSheetFile: answerSheetFile,
      submittedBy: operatorName,
      isAdmin,
    });

    if (res.success && res.document) {
      setIsUnifiedModalOpen(false);
      setAnswerSheetFile(null);
      await loadAllData();
      alert(
        isAdmin 
          ? `Marks recorded and official certificate ${res.document.certificateNumber} issued! PDF is ready to print.` 
          : `Marks & draft certificate ${res.document.certificateNumber} submitted with answer sheet for Admin review.`
      );
    } else {
      alert(res.error || 'Failed to submit exam evaluation.');
    }
  };

  const handleOpenAnswerSheet = async (doc: AcademicDocument) => {
    setViewingAnswerSheetDoc(doc);
    const url = await academicService.getSecureAnswerSheetUrl(doc);
    setViewingAnswerSheetUrl(url || doc.localFileData || null);
  };

  const handleDownloadPdf = (doc: AcademicDocument) => {
    downloadAcademicDocumentPdf(doc);
  };

  const handlePrintDoc = (doc: AcademicDocument) => {
    printAcademicDocument(doc);
  };

  // ------------------------------------------------------------------
  // BACKUP EXPORT
  // ------------------------------------------------------------------
  const handleDownloadFullBackup = async () => {
    const json = await academicService.exportFullBackupJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `QLI_Full_Academic_Backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  // Computed Dashboard Metrics
  const activeStudentsCount = students.filter(s => s.enrolmentStatus === 'active').length;
  const activeStaffCount = staffList.filter(s => s.isActive).length;
  const pendingCertificatesCount = documents.filter(d => d.approvalStatus === 'pending').length;
  const todayStudentAttCount = attendance.filter(a => a.personType === 'student' && a.date === attendanceDate && a.status === 'present').length;
  const todayStaffAttCount = attendance.filter(a => a.personType === 'staff' && a.date === attendanceDate && a.status === 'present').length;
  if (role === 'student') {
    return (
      <div className="bg-slate-900 border border-rose-500/30 rounded-3xl p-8 sm:p-12 text-center max-w-2xl mx-auto space-y-5 shadow-2xl">
        <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl sm:text-2xl font-bold text-white">
            Access Restricted: Student Account
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
            You are signed in with a Student ID ({user?.studentIdCode || user?.name}). Students do not have authorization to view, enter, or correct institutional records or access the staff portal.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Console Navigation Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
          {isAdmin && (
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Executive Dashboard</span>
            </button>
          )}

          {isAdmin && (
            <button
              type="button"
              onClick={() => setActiveTab('staff')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'staff'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Staff Management ({staffList.length})</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab('students')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'students'
                ? 'bg-sky-500 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Students & Admissions ({students.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('attendance')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'attendance'
                ? 'bg-sky-500 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Attendance Hub</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('marks')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'marks'
                ? 'bg-sky-500 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Marks & Marksheets</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('certificates')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'certificates'
                ? 'bg-sky-500 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Certificates</span>
            {pendingCertificatesCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white font-mono font-bold animate-pulse">
                {pendingCertificatesCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('learning')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'learning'
                ? 'bg-sky-500 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Learning Content & Tests</span>
          </button>

          {isAdmin && (
            <button
              type="button"
              onClick={() => setActiveTab('audit')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'audit'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Audit Logs</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadAllData}
            title="Refresh All Records"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-sky-400' : ''}`} />
          </button>
          {isAdmin && (
            <button
              type="button"
              onClick={handleDownloadFullBackup}
              title="Export Full JSON Database Backup"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-emerald-300 border border-emerald-500/30 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Backup</span>
            </button>
          )}
        </div>
      </div>

      {/* ================================================================ */}
      {/* 1. EXECUTIVE DASHBOARD (Admin Only) */}
      {/* ================================================================ */}
      {activeTab === 'dashboard' && isAdmin && (
        <div className="space-y-6">
          {/* Top KPI Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Active Students
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-white">{activeStudentsCount}</span>
                <span className="text-xs text-sky-400 font-mono">100% Verified</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Active Staff
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-amber-400">{activeStaffCount}</span>
                <span className="text-xs text-slate-400 font-mono">Instructors</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                New Admissions
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-emerald-400">+{students.length}</span>
                <span className="text-xs text-emerald-400/80 font-mono">Current Sem</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Today Student Att.
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-white">{todayStudentAttCount}</span>
                <span className="text-xs text-sky-400 font-mono">Present</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Today Staff Att.
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-amber-400">{todayStaffAttCount}</span>
                <span className="text-xs text-slate-400 font-mono">Punched</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Pending Approvals
              </span>
              <div className="flex items-baseline justify-between">
                <span className={`text-2xl font-black ${pendingCertificatesCount > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                  {pendingCertificatesCount}
                </span>
                <span className="text-xs text-slate-400 font-mono">Certificates</span>
              </div>
            </div>
          </div>

          {/* Quick Action Bar */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-400" />
              <span className="text-sm font-bold text-white">Quantum Learning Institute Academic Console</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setIsAddStaffModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create Staff Account</span>
              </button>
              <button
                type="button"
                onClick={() => setIsAddStudentModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>New Student Admission</span>
              </button>
              <button
                type="button"
                onClick={() => setIsUploadDocModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <FileCheck2 className="w-4 h-4 text-emerald-400" />
                <span>Issue Certificate</span>
              </button>
            </div>
          </div>

          {/* Recent Alerts & System Activity Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pending Approvals Queue */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-rose-400" />
                  <span>Certificates & Marksheets Pending Approval ({pendingCertificatesCount})</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveTab('certificates')}
                  className="text-xs text-sky-400 hover:underline cursor-pointer"
                >
                  View All
                </button>
              </div>

              {pendingCertificatesCount === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400 bg-slate-950/50 rounded-xl border border-slate-800/80">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
                  All submitted academic documents have been approved or processed.
                </div>
              ) : (
                <div className="space-y-2">
                  {documents.filter(d => d.approvalStatus === 'pending').map(doc => (
                    <div key={doc.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-sky-400">{doc.certificateNumber}</span>
                          <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                            {doc.documentType}
                          </span>
                        </div>
                        <p className="text-xs text-white font-semibold mt-0.5">{doc.studentFullName} &bull; {doc.courseName}</p>
                        <p className="text-[11px] text-slate-400">Submitted by: {doc.createdByName || 'Staff'}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleApproveDoc(doc)}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs cursor-pointer"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRejectDoc(doc)}
                          className="px-2.5 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold text-xs border border-rose-500/30 cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Audit Activities */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <History className="w-4 h-4 text-amber-400" />
                  <span>Recent Institutional Audit Events</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveTab('audit')}
                  className="text-xs text-sky-400 hover:underline cursor-pointer"
                >
                  Full Log
                </button>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto scrollbar-thin">
                {auditLogs.slice(0, 5).map(log => (
                  <div key={log.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] text-amber-400 font-bold">
                        [{log.entityType}] {log.action}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-300">
                      Operator: <span className="font-semibold text-white">{log.performedByName}</span> ({log.performedByRole})
                    </p>
                    {log.reason && (
                      <p className="text-slate-400 italic text-[11px]">Reason: &ldquo;{log.reason}&rdquo;</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* 2. STAFF MANAGEMENT (Admin Only) */}
      {/* ================================================================ */}
      {activeTab === 'staff' && isAdmin && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-white">Quantum Learning Staff Roster</h2>
              <p className="text-xs text-slate-400">
                Manage instructor accounts, unique Staff IDs, email invitations, and operational permissions. Admin never sees existing staff passwords.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsAddStaffModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 cursor-pointer shadow-sm self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Register New Staff</span>
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Staff ID</th>
                    <th className="py-3 px-4">Name & Designation</th>
                    <th className="py-3 px-4">Verified Email</th>
                    <th className="py-3 px-4">Role & Permissions</th>
                    <th className="py-3 px-4">Assigned Courses</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {staffList.map(stf => (
                    <tr key={stf.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-amber-400">{stf.staffIdCode}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">{stf.fullName}</div>
                        <div className="text-[11px] text-slate-400">{stf.designation}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-300">{stf.email}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          stf.role === 'admin' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                        }`}>
                          {stf.role}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-1">
                          {stf.permissions.slice(0, 3).join(', ')}{stf.permissions.length > 3 ? ` +${stf.permissions.length - 3}` : ''}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex gap-1 flex-wrap">
                          {stf.assignedCourses.map(c => (
                            <span key={c} className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300">
                              {c}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          stf.isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                        }`}>
                          {stf.isActive ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleResendStaffInvite(stf)}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 border border-sky-500/30 cursor-pointer transition-colors flex items-center gap-1"
                            title="Resend invitation and password setup link"
                          >
                            <Send className="w-3 h-3" />
                            <span>Resend Link</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleStaffActive(stf)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                              stf.isActive ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                            }`}
                          >
                            {stf.isActive ? 'Deactivate' : 'Reactivate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* 3. STUDENTS & ADMISSIONS */}
      {/* ================================================================ */}
      {activeTab === 'students' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-white">Student Registry & Admissions</h2>
              <p className="text-xs text-slate-400">
                Enroll new candidates, assign unique Student IDs, courses, and batches. Changes are audited.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsAddStudentModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center gap-2 cursor-pointer shadow-sm self-start sm:self-auto"
            >
              <UserPlus className="w-4 h-4" />
              <span>Enroll New Student</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-xl p-2.5">
            <Search className="w-4 h-4 text-slate-400 ml-2" />
            <input
              type="text"
              placeholder="Search by student name, roll number (e.g. QLI-STU-2026-001), or email..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-white mr-2 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Student ID</th>
                    <th className="py-3 px-4">Candidate Name</th>
                    <th className="py-3 px-4">Contact (Email / Phone)</th>
                    <th className="py-3 px-4">Course & Batch</th>
                    <th className="py-3 px-4">Admission Date</th>
                    <th className="py-3 px-4">Portal Access</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {students
                    .filter(s => {
                      const q = searchQuery.toLowerCase();
                      return (
                        s.fullName.toLowerCase().includes(q) ||
                        s.studentIdCode.toLowerCase().includes(q) ||
                        s.email.toLowerCase().includes(q)
                      );
                    })
                    .map(stu => (
                      <tr key={stu.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-sky-400">{stu.studentIdCode}</td>
                        <td className="py-3.5 px-4 font-semibold text-white">{stu.fullName}</td>
                        <td className="py-3.5 px-4">
                          <div className="font-mono text-slate-300">{stu.email}</div>
                          <div className="text-[11px] text-slate-400">{stu.phone}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-slate-200">{stu.enrolledCourse}</div>
                          <div className="text-[10px] font-mono text-sky-400">{stu.batchCode || 'Batch A'}</div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-400">{stu.admissionDate}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            stu.isPortalActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                          }`}>
                            {stu.isPortalActive ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            <button
                              type="button"
                              onClick={() => handleResendStudentInvite(stu)}
                              className="px-2.5 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1"
                              title="Resend student portal access / login setup link"
                            >
                              <Send className="w-3 h-3" />
                              <span>Resend Link</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setDocForm(prev => ({
                                  ...prev,
                                  studentId: stu.id,
                                  courseName: stu.enrolledCourse,
                                }));
                                setIsUploadDocModalOpen(true);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 font-semibold cursor-pointer"
                            >
                              Issue Cert
                            </button>
                            {isAdmin && (
                              <button
                                type="button"
                                onClick={async () => {
                                  const reason = prompt('Enter reason for changing portal access:');
                                  if (!reason) return;
                                  await academicService.toggleStudentPortalAccess(stu.id, operatorName, reason);
                                  loadAllData();
                                }}
                                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer text-[11px]"
                              >
                                Toggle
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* 4. ATTENDANCE HUB (Student & Staff) */}
      {/* ================================================================ */}
      {activeTab === 'attendance' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-white">Institutional Attendance Hub</h2>
              <p className="text-xs text-slate-400">
                Daily batch attendance marking, duplicate session protection, and audited historical corrections.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportAttendanceCsv}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setAttendanceTypeFilter('student')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  attendanceTypeFilter === 'student' ? 'bg-sky-500 text-slate-950 font-extrabold' : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                Student Attendance
              </button>
              <button
                type="button"
                onClick={() => setAttendanceTypeFilter('staff')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  attendanceTypeFilter === 'staff' ? 'bg-amber-500 text-slate-950 font-extrabold' : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                Staff Attendance
              </button>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <span>Date:</span>
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={e => setAttendanceDate(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white"
                />
              </div>

              {attendanceTypeFilter === 'student' && (
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <span>Batch:</span>
                  <select
                    value={selectedBatchFilter}
                    onChange={e => setSelectedBatchFilter(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white"
                  >
                    <option value="all">All Batches</option>
                    {batches.map(b => (
                      <option key={b.id} value={b.batchCode}>
                        {b.batchCode} ({b.batchName})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Fast Attendance Marking Roster for Selected Date */}
          {attendanceTypeFilter === 'student' ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="p-3 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between text-xs">
                <span className="font-semibold text-white">Daily Session Roster &bull; {attendanceDate} (Morning Session)</span>
                <span className="text-slate-400 font-mono">Instant auto-save with duplicate check</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/40 text-slate-400 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Student ID</th>
                      <th className="py-3 px-4">Student Name</th>
                      <th className="py-3 px-4">Batch</th>
                      <th className="py-3 px-4">Recorded Status</th>
                      <th className="py-3 px-4 text-center">Fast Mark (One-Click)</th>
                      <th className="py-3 px-4 text-right">Correction Audit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {students
                      .filter(s => selectedBatchFilter === 'all' || s.batchCode === selectedBatchFilter)
                      .map(stu => {
                        const rec = attendance.find(
                          a => a.personId === stu.id && a.date === attendanceDate && a.personType === 'student'
                        );
                        return (
                          <tr key={stu.id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="py-3 px-4 font-mono font-bold text-sky-400">{stu.studentIdCode}</td>
                            <td className="py-3 px-4 font-semibold text-white">{stu.fullName}</td>
                            <td className="py-3 px-4 font-mono text-slate-400">{stu.batchCode || 'DCA-2026-M1'}</td>
                            <td className="py-3 px-4">
                              {rec ? (
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  rec.status === 'present'
                                    ? 'bg-emerald-500/20 text-emerald-300'
                                    : rec.status === 'absent'
                                    ? 'bg-rose-500/20 text-rose-300'
                                    : rec.status === 'late'
                                    ? 'bg-amber-500/20 text-amber-300'
                                    : 'bg-sky-500/20 text-sky-300'
                                }`}>
                                  {rec.status}
                                </span>
                              ) : (
                                <span className="text-[11px] text-slate-500 italic">Not marked yet</span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleQuickMarkToday(stu, 'present')}
                                  className={`px-2 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                                    rec?.status === 'present' ? 'bg-emerald-500 text-slate-950 font-extrabold' : 'bg-slate-800 text-emerald-400 hover:bg-slate-700'
                                  }`}
                                >
                                  Present
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleQuickMarkToday(stu, 'late')}
                                  className={`px-2 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                                    rec?.status === 'late' ? 'bg-amber-500 text-slate-950 font-extrabold' : 'bg-slate-800 text-amber-400 hover:bg-slate-700'
                                  }`}
                                >
                                  Late
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleQuickMarkToday(stu, 'absent')}
                                  className={`px-2 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                                    rec?.status === 'absent' ? 'bg-rose-500 text-slate-950 font-extrabold' : 'bg-slate-800 text-rose-400 hover:bg-slate-700'
                                  }`}
                                >
                                  Absent
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleQuickMarkToday(stu, 'leave')}
                                  className={`px-2 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                                    rec?.status === 'leave' ? 'bg-sky-500 text-slate-950 font-extrabold' : 'bg-slate-800 text-sky-400 hover:bg-slate-700'
                                  }`}
                                >
                                  Leave
                                </button>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right">
                              {rec && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenAttendanceCorrection(rec)}
                                  className="text-[11px] text-sky-400 hover:underline cursor-pointer"
                                >
                                  Edit with Reason
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Staff Attendance Table */
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="p-3 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between text-xs">
                <span className="font-semibold text-white">Faculty Punch & Attendance Logs &bull; {attendanceDate}</span>
                <span className="text-slate-400">Staff cannot alter own attendance</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/40 text-slate-400 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Staff ID</th>
                      <th className="py-3 px-4">Faculty Member</th>
                      <th className="py-3 px-4">Designation</th>
                      <th className="py-3 px-4">Punch In Time</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Admin Audit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {staffList.map(stf => {
                      const rec = attendance.find(
                        a => a.personId === stf.id && a.date === attendanceDate && a.personType === 'staff'
                      );
                      return (
                        <tr key={stf.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-amber-400">{stf.staffIdCode}</td>
                          <td className="py-3 px-4 font-semibold text-white">{stf.fullName}</td>
                          <td className="py-3 px-4 text-slate-400">{stf.designation}</td>
                          <td className="py-3 px-4 font-mono text-slate-300">{rec?.punchInTime || '09:00 AM'}</td>
                          <td className="py-3 px-4">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 uppercase">
                              {rec?.status || 'present'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            {isAdmin && rec && (
                              <button
                                type="button"
                                onClick={() => handleOpenAttendanceCorrection(rec)}
                                className="text-[11px] text-amber-400 hover:underline cursor-pointer"
                              >
                                Admin Correction
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================================================================ */}
      {/* 5. MARKS & MARKSHEETS */}
      {/* ================================================================ */}
      {activeTab === 'marks' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-white">Examinations, Marks & Marksheet Approvals</h2>
              <p className="text-xs text-slate-400">
                Submit student exam scores, attach evaluated answer sheets, and generate draft certificates in one consolidated flow.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleOpenUnifiedModal()}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md self-start sm:self-auto"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>{isAdmin ? 'Record Marks & Issue Certificate' : 'Unified Exam & Certificate Entry'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assessments.map(asm => (
              <div key={asm.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-sky-500/20 text-sky-300">
                      {asm.courseName}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-1">{asm.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Batch: {asm.batchCode || 'General'} &bull; Exam Date: {asm.assessmentDate}
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    asm.status === 'published'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : asm.status === 'approved'
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {asm.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-center text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Max Score</span>
                    <span className="font-bold text-white">{asm.maxScore}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Pass Score</span>
                    <span className="font-bold text-white">{asm.passingScore}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Evaluator</span>
                    <span className="font-medium text-slate-300 truncate block">{asm.createdBy}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleOpenMarksEntry(asm)}
                    className="px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Enter / Edit Scores</span>
                  </button>

                  {isAdmin && asm.status !== 'published' && (
                    <button
                      type="button"
                      onClick={() => handleApproveAssessment(asm.id)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve & Publish</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* 6. CERTIFICATES & MARKSHEETS REGISTRY */}
      {/* ================================================================ */}
      {activeTab === 'certificates' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-white">Authoritative Certificates & Marksheets Registry</h2>
              <p className="text-xs text-slate-400">
                Certificates are generated directly by the portal from verified exam scores and evaluated answer sheet uploads.
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
              <button
                type="button"
                onClick={() => handleOpenUnifiedModal()}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>{isAdmin ? 'Issue Official Certificate' : 'Submit Exam & Draft Certificate'}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsUploadDocModalOpen(true)}
                title="Upload Legacy Scanned Document"
                className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer border border-slate-700"
              >
                <UploadCloud className="w-4 h-4 text-slate-400" />
                <span className="hidden sm:inline">Legacy Upload</span>
              </button>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Cert / Reg No.</th>
                    <th className="py-3 px-4">Student & Roll No.</th>
                    <th className="py-3 px-4">Course</th>
                    <th className="py-3 px-4">Exam Marks & Standing</th>
                    <th className="py-3 px-4">Evaluated Answer Sheet</th>
                    <th className="py-3 px-4">Approval</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {documents.map(doc => (
                    <tr key={doc.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-sky-400">
                        {doc.certificateNumber}
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-sky-500/10 text-sky-300 border border-sky-500/20">
                            {doc.isPortalGenerated ? 'PORTAL CERTIFICATE' : doc.documentType}
                          </span>
                          {doc.status === 'revoked' && (
                            <span className="text-[9px] uppercase font-bold px-1 py-0.2 rounded bg-rose-500/20 text-rose-300">
                              REVOKED
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">{doc.studentFullName}</div>
                        <div className="text-[11px] font-mono text-slate-400">{doc.studentIdCode}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-slate-300 font-medium">{doc.courseName}</span>
                        <span className="block text-[11px] text-slate-400 font-mono">Issued: {doc.issueDate}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-emerald-400 block">{doc.marksOrGrade || 'Cleared'}</span>
                        {doc.marksObtained !== undefined && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            {doc.marksObtained} / {doc.maxScore || 100} ({doc.percentage}%)
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {doc.examAnswerSheetFileName ? (
                          <button
                            type="button"
                            onClick={() => handleOpenAnswerSheet(doc)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-semibold transition-colors cursor-pointer"
                            title={`View evaluated paper: ${doc.examAnswerSheetFileName}`}
                          >
                            <Paperclip className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate max-w-[120px]">{doc.examAnswerSheetFileName}</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-500 font-mono">
                            {doc.isPortalGenerated ? 'Assessment Graded' : 'Direct Upload'}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          doc.approvalStatus === 'approved'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : doc.approvalStatus === 'rejected'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {doc.approvalStatus || 'approved'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          <button
                            type="button"
                            onClick={() => handlePreviewDoc(doc)}
                            title={`Preview Official ${doc.documentType === 'marksheet' ? 'Statement of Marks' : 'Certificate'}`}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {doc.approvalStatus === 'approved' && doc.status === 'valid' && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleDownloadPdf(doc)}
                                title={`Download ${doc.documentType === 'marksheet' ? 'Statement of Marks' : 'Completion Certificate'} PDF`}
                                className="px-2 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 font-bold text-[11px] border border-sky-500/30 cursor-pointer flex items-center gap-1"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span className="hidden xl:inline">PDF</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handlePrintDoc(doc)}
                                title={`Print ${doc.documentType === 'marksheet' ? 'Statement of Marks (A4 Portrait)' : 'Completion Certificate (A4 Landscape)'}`}
                                className="px-2 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-[11px] border border-emerald-500/30 cursor-pointer flex items-center gap-1"
                              >
                                <Printer className="w-3.5 h-3.5" />
                                <span className="hidden xl:inline">Print</span>
                              </button>
                            </>
                          )}

                          {isAdmin && doc.approvalStatus === 'pending' && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleApproveDoc(doc)}
                                title="Approve and Issue Official Certificate & Publish Marks"
                                className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] cursor-pointer flex items-center gap-1 shadow-sm"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Approve & Issue</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRejectDoc(doc)}
                                title="Reject"
                                className="px-2 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold text-[11px] border border-rose-500/30 cursor-pointer"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {isAdmin && doc.status === 'valid' && (
                            <button
                              type="button"
                              onClick={() => handleOpenRevoke(doc)}
                              title="Revoke Credential"
                              className="px-2 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-[11px] font-semibold border border-rose-500/30 cursor-pointer"
                            >
                              Revoke
                            </button>
                          )}

                          {isAdmin && doc.status === 'revoked' && (
                            <button
                              type="button"
                              onClick={() => handleRestoreDoc(doc)}
                              title="Restore Credential"
                              className="px-2 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-semibold border border-emerald-500/30 cursor-pointer"
                            >
                              Restore
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* 7. LEARNING CONTENT & MOCK TESTS */}
      {/* ================================================================ */}
      {activeTab === 'learning' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-white">Academic Curriculum & Learning Materials</h2>
              <p className="text-xs text-slate-400">
                Manage syllabus topics, official notes, question banks, and government exam preparation sets.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Courses & Syllabuses */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-sky-400" />
                <span>Authorized Courses & Syllabus Modules</span>
              </h3>
              <div className="space-y-3">
                {courses.map(crs => (
                  <div key={crs.id} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white">{crs.name}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-500/20 text-sky-300">
                        {crs.durationMonths} Months
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">{crs.description}</p>
                    <div className="space-y-1 pt-1 border-t border-slate-900">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Syllabus Topics:</span>
                      {crs.syllabusTopics.map((top, idx) => (
                        <div key={idx} className="text-[11px] text-slate-300 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span>{top}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mock Tests & Question Banks */}
            <div className="space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Timed Mock Tests & Question Banks</span>
                </h3>

                <div className="space-y-3">
                  {mockTests.map(test => (
                    <div key={test.id} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-xs text-white">{test.title}</h4>
                          <span className="text-[10px] text-slate-400">{test.targetExam}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300">
                          {test.durationMinutes} Mins &bull; {test.totalQuestions} Questions
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300">{test.instructions}</p>
                      <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        <span>Answers strictly hidden until student submits test.</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Govt Exam Preparation Sets */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-emerald-400" />
                  <span>Government Exam Question Paper Modules</span>
                </h3>
                <div className="space-y-2">
                  {govtPapers.map(gov => (
                    <div key={gov.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-semibold text-white">{gov.examName} ({gov.year})</div>
                        <div className="text-[11px] text-slate-400">{gov.subject} &bull; {gov.language}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 font-mono">
                        {gov.fileSize}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* 8. AUDIT LOGS (Admin Only) */}
      {/* ================================================================ */}
      {activeTab === 'audit' && isAdmin && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-white">Immutable Institutional Audit Trail</h2>
              <p className="text-xs text-slate-400">
                Every sensitive action (certificate approvals, revocations, profile edits, attendance corrections) is cryptographically recorded with operator identity.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDownloadFullBackup}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Audit Backup (JSON)</span>
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider sticky top-0">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Entity Type</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Operator</th>
                    <th className="py-3 px-4">Reason / Notes</th>
                    <th className="py-3 px-4">Audit Payload</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {auditLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-sky-400">{log.entityType}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{log.performedByName}</div>
                        <div className="text-[10px] text-slate-400 capitalize">{log.performedByRole}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-300 italic text-[11px]">
                        {log.reason || '-'}
                      </td>
                      <td className="py-3 px-4 font-mono text-[10px] text-slate-400 max-w-xs truncate">
                        {JSON.stringify(log.details)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* MODALS */}
      {/* ================================================================ */}

      {/* Modal 1: Create Staff (Admin) */}
      {isAddStaffModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400" />
                <span>Create Staff Account</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddStaffModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Staff Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ananya Dutta"
                  value={staffForm.fullName}
                  onChange={e => setStaffForm({ ...staffForm, fullName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Verified Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. staff@taxcent.in"
                  value={staffForm.email}
                  onChange={e => setStaffForm({ ...staffForm, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  A secure password-setup invitation link will be generated. Admin never sees or sets their password.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 9435011223"
                    value={staffForm.phone}
                    onChange={e => setStaffForm({ ...staffForm, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Designation</label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Faculty"
                    value={staffForm.designation}
                    onChange={e => setStaffForm({ ...staffForm, designation: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Role</label>
                <select
                  value={staffForm.role}
                  onChange={e => setStaffForm({ ...staffForm, role: e.target.value as 'admin' | 'staff' })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="staff">Academic Staff / Faculty</option>
                  <option value="admin">Administrator (Full Control)</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddStaffModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold cursor-pointer"
                >
                  Generate Staff ID & Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Student Admission */}
      {isAddStudentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-sky-400" />
                <span>New Student Admission</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddStudentModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterStudent} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Student Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={studentForm.fullName}
                  onChange={e => setStudentForm({ ...studentForm, fullName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Verified Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. rahul.sharma@example.com"
                  value={studentForm.email}
                  onChange={e => setStudentForm({ ...studentForm, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 9864012345"
                    value={studentForm.phone}
                    onChange={e => setStudentForm({ ...studentForm, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Admission Date</label>
                  <input
                    type="date"
                    value={studentForm.admissionDate}
                    onChange={e => setStudentForm({ ...studentForm, admissionDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Enrolled Course</label>
                <select
                  value={studentForm.courseId}
                  onChange={e => setStudentForm({ ...studentForm, courseId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-400"
                >
                  {courses.map(crs => (
                    <option key={crs.id} value={crs.id}>
                      {crs.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Assigned Batch</label>
                <select
                  value={studentForm.batchCode}
                  onChange={e => setStudentForm({ ...studentForm, batchCode: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-400"
                >
                  {batches.map(b => (
                    <option key={b.id} value={b.batchCode}>
                      {b.batchCode} ({b.timing})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddStudentModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold cursor-pointer"
                >
                  Confirm Admission & Create Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Invite Link Display */}
      {isInviteLinkModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Send className="w-5 h-5 text-emerald-400" />
                <span>Single-Use Password Setup Link</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsInviteLinkModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              {inviteModalTitle}
            </p>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2">
              <span className="text-[10px] text-slate-400 font-mono block">Secure Verification Link:</span>
              <div className="font-mono text-xs text-sky-400 break-all select-all">
                {generatedInviteLink}
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              In production with Supabase Auth, this invitation is dispatched automatically via authenticated email SMTP. The recipient clicks the single-use token to verify their identity and set their confidential password.
            </p>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(generatedInviteLink);
                  alert('Copied invite link to clipboard!');
                  setIsInviteLinkModalOpen(false);
                }}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs cursor-pointer"
              >
                Copy Link & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 4: Attendance Correction with Mandatory Reason */}
      {isCorrectAttendanceModalOpen && selectedAttendance && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-amber-400" />
                <span>Correct Attendance Record</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsCorrectAttendanceModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs space-y-1 bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div className="font-semibold text-white">{selectedAttendance.personName}</div>
              <div className="font-mono text-sky-400">{selectedAttendance.identifierCode}</div>
              <div className="text-slate-400">Date: {selectedAttendance.date} &bull; Current: <span className="uppercase font-bold text-amber-400">{selectedAttendance.status}</span></div>
            </div>

            <form onSubmit={handleSaveAttendanceCorrection} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">New Status</label>
                <select
                  value={attendanceNewStatus}
                  onChange={e => setAttendanceNewStatus(e.target.value as AttendanceStatus)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="late">Late</option>
                  <option value="leave">Authorized Leave</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Mandatory Correction Reason <span className="text-rose-400">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Student submitted doctor medical prescription for morning session; authorized by admin."
                  value={attendanceCorrectionReason}
                  onChange={e => setAttendanceCorrectionReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCorrectAttendanceModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold cursor-pointer"
                >
                  Save Audited Correction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 5: Upload Academic Document / Certificate */}
      {isUploadDocModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-sky-400" />
                <span>{isAdmin ? 'Issue Official Certificate' : 'Submit Draft Certificate for Review'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsUploadDocModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadDocument} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Select Enrolled Student</label>
                <select
                  value={docForm.studentId}
                  onChange={e => {
                    const stu = students.find(s => s.id === e.target.value);
                    setDocForm({
                      ...docForm,
                      studentId: e.target.value,
                      courseName: stu?.enrolledCourse || docForm.courseName,
                    });
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-400"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.studentIdCode}) &bull; {s.enrolledCourse}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Document Type</label>
                  <select
                    value={docForm.documentType}
                    onChange={e => setDocForm({ ...docForm, documentType: e.target.value as AcademicDocumentType })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-400"
                  >
                    <option value="certificate">Certificate of Completion</option>
                    <option value="marksheet">Official Marksheet</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Issue Date</label>
                  <input
                    type="date"
                    value={docForm.issueDate}
                    onChange={e => setDocForm({ ...docForm, issueDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Certificate / Marksheet Number <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. QLI-2026-DCA-1049"
                  value={docForm.certificateNumber}
                  onChange={e => setDocForm({ ...docForm, certificateNumber: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-sky-400 uppercase"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Course Title</label>
                <input
                  type="text"
                  required
                  value={docForm.courseName}
                  onChange={e => setDocForm({ ...docForm, courseName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Marks / Grade Summary</label>
                <input
                  type="text"
                  placeholder="e.g. Grade A+ (94.2%) or Total Marks: 471 / 500"
                  value={docForm.marksOrGrade}
                  onChange={e => setDocForm({ ...docForm, marksOrGrade: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Upload Document File (PDF / PNG / JPG)</label>
                <input
                  type="file"
                  required
                  ref={docFileInputRef}
                  accept=".pdf,image/png,image/jpeg,image/webp"
                  onChange={e => setDocFile(e.target.files?.[0] || null)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsUploadDocModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold cursor-pointer"
                >
                  {isAdmin ? 'Issue & Publish' : 'Submit for Admin Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 6: Marks Entry */}
      {isMarksModalOpen && selectedAssessmentForMarks && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-sky-400" />
                  <span>Enter Student Marks</span>
                </h3>
                <p className="text-xs text-slate-400">
                  {selectedAssessmentForMarks.title} (Max: {selectedAssessmentForMarks.maxScore} marks)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsMarksModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
              {students.map(stu => (
                <div key={stu.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="font-semibold text-white">{stu.fullName}</div>
                    <div className="font-mono text-[11px] text-sky-400">{stu.studentIdCode}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={selectedAssessmentForMarks.maxScore}
                      step={0.5}
                      value={currentMarksInput[stu.id]?.marks ?? 0}
                      onChange={e => {
                        const val = parseFloat(e.target.value) || 0;
                        setCurrentMarksInput({
                          ...currentMarksInput,
                          [stu.id]: {
                            marks: val,
                            remarks: currentMarksInput[stu.id]?.remarks || '',
                          },
                        });
                      }}
                      className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-right font-mono text-white text-xs font-bold"
                    />
                    <span className="text-slate-500 font-mono">/ {selectedAssessmentForMarks.maxScore}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => handleSaveMarks(true)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs cursor-pointer"
              >
                Save as Draft
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsMarksModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 font-semibold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveMarks(false)}
                  className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs cursor-pointer"
                >
                  {isAdmin ? 'Save & Approve' : 'Submit for Review'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 7: Revoke Document */}
      {isRevokeModalOpen && selectedDocForRevoke && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/30 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-rose-400 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                <span>Revoke Academic Credential</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsRevokeModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Revoking certificate <span className="font-mono font-bold text-white">{selectedDocForRevoke.certificateNumber}</span> will immediately render public verification as REVOKED and remove the document from the student portal.
            </p>

            <form onSubmit={handleConfirmRevoke} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Mandatory Revocation Reason <span className="text-rose-400">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Superseded by corrected certificate #QLI-2026-DCA-1043 following official marks re-evaluation."
                  value={revokeReason}
                  onChange={e => setRevokeReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-400"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsRevokeModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold cursor-pointer"
                >
                  Confirm Revocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 8: Credential Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full p-5 sm:p-6 space-y-4 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sky-400 text-sm sm:text-base">{previewDoc.certificateNumber}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold uppercase">
                    {previewDoc.isPortalGenerated ? 'Portal Generated Certificate' : previewDoc.documentType}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{previewDoc.studentFullName} &bull; {previewDoc.courseName}</p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="text-slate-400 hover:text-white cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-950 rounded-2xl p-2 sm:p-4 border border-slate-800 flex items-center justify-center overflow-auto flex-1 min-h-[300px]">
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt={previewDoc.fileName}
                  className="max-h-[500px] w-auto rounded-lg shadow-2xl object-contain border border-slate-800"
                />
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-800 shrink-0">
              <div className="text-[11px] text-slate-400">
                <span>Issue Date: <strong className="text-slate-200">{previewDoc.issueDate}</strong></span>
                {previewDoc.marksOrGrade && (
                  <span className="ml-3 text-emerald-400 font-medium">&bull; {previewDoc.marksOrGrade}</span>
                )}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {previewDoc.examAnswerSheetFileName && (
                  <button
                    type="button"
                    onClick={() => handleOpenAnswerSheet(previewDoc)}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold text-xs flex items-center gap-1.5 border border-amber-500/30 cursor-pointer"
                  >
                    <Paperclip className="w-3.5 h-3.5" />
                    <span>View Answer Sheet</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleDownloadPdf(previewDoc)}
                  className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{previewDoc.documentType === 'marksheet' ? 'Download Statement of Marks PDF' : 'Download Completion Certificate PDF'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handlePrintDoc(previewDoc)}
                  className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{previewDoc.documentType === 'marksheet' ? 'Print Statement of Marks' : 'Print Completion Certificate'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDoc(null)}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 9: Unified Exam Evaluation & Certificate Submission (One-Step Workflow) */}
      {isUnifiedModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-sky-800/80 rounded-3xl p-5 sm:p-7 max-w-2xl w-full space-y-4 shadow-2xl my-6">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400">
                    <Sparkles className="w-4 h-4" />
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    Unified Exam Evaluation & Certificate Submission
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Enter student marks and attach their evaluated exam answer sheet in <strong className="text-sky-300">one single submission</strong>. The official certificate is generated directly by the portal.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsUnifiedModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUnifiedSubmission} className="space-y-4 text-xs">
              {/* Section 1: Student Selection */}
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800/80 space-y-3">
                <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider block">
                  1. Enrolled Student Information
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">
                      Select Student <span className="text-rose-400">*</span>
                    </label>
                    <select
                      required
                      value={unifiedForm.studentId}
                      onChange={e => handleUnifiedStudentChange(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-sky-400"
                    >
                      <option value="">-- Choose Enrolled Student --</option>
                      {students.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.fullName} ({s.studentIdCode}) &bull; {s.enrolledCourse}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Course Name</label>
                    <input
                      type="text"
                      required
                      value={unifiedForm.courseName}
                      onChange={e => setUnifiedForm({ ...unifiedForm, courseName: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-400"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Examination & Evaluation Marks */}
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800/80 space-y-3">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
                  2. Examination Scores & Standing
                </span>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Assessment / Examination Title <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DCA Comprehensive Final Practical & Theory Examination"
                    value={unifiedForm.assessmentTitle}
                    onChange={e => setUnifiedForm({ ...unifiedForm, assessmentTitle: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Exam Date</label>
                    <input
                      type="date"
                      required
                      value={unifiedForm.examDate}
                      onChange={e => setUnifiedForm({ ...unifiedForm, examDate: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-400"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Max Score</label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={1000}
                      value={unifiedForm.maxScore}
                      onChange={e => setUnifiedForm({ ...unifiedForm, maxScore: Number(e.target.value) || 100 })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-sky-400"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">
                      Marks Obtained <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      max={unifiedForm.maxScore}
                      step={0.5}
                      value={unifiedForm.marksObtained}
                      onChange={e => setUnifiedForm({ ...unifiedForm, marksObtained: Number(e.target.value) || 0 })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-sky-400 text-emerald-400"
                    />
                  </div>
                </div>

                {/* Live Computed Grade Badge */}
                {(() => {
                  const pct = Math.round((unifiedForm.marksObtained / (unifiedForm.maxScore || 100)) * 100 * 10) / 10;
                  let gradeBadge = 'Grade C (Passing)';
                  let colorClass = 'text-amber-400 border-amber-500/30 bg-amber-500/10';
                  if (pct >= 85) {
                    gradeBadge = 'Distinction (A+)';
                    colorClass = 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
                  } else if (pct >= 70) {
                    gradeBadge = 'Grade A (First Class)';
                    colorClass = 'text-sky-400 border-sky-500/30 bg-sky-500/10';
                  } else if (pct >= 55) {
                    gradeBadge = 'Grade B (Second Class)';
                    colorClass = 'text-teal-400 border-teal-500/30 bg-teal-500/10';
                  } else if (pct < 40) {
                    gradeBadge = 'Needs Improvement';
                    colorClass = 'text-rose-400 border-rose-500/30 bg-rose-500/10';
                  }
                  return (
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-400">Calculated Percentage & Grade Standing:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white text-sm">{pct}%</span>
                        <span className={`px-2 py-0.5 rounded-lg border text-[11px] font-bold ${colorClass}`}>
                          {gradeBadge}
                        </span>
                      </div>
                    </div>
                  );
                })()}

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Evaluator Remarks</label>
                  <input
                    type="text"
                    placeholder="e.g. Demonstrated exceptional practical mastery in Tally GST reconciliation & Excel reporting"
                    value={unifiedForm.remarks}
                    onChange={e => setUnifiedForm({ ...unifiedForm, remarks: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-400"
                  />
                </div>
              </div>

              {/* Section 3: Certificate Details (Portal Auto-Generated) */}
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800/80 space-y-3">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                  3. Official Certificate Details (Generated by Portal)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">
                      Certificate Registration No. <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. QLI-2026-DCA-1044"
                      value={unifiedForm.certificateNumber}
                      onChange={e => setUnifiedForm({ ...unifiedForm, certificateNumber: e.target.value.toUpperCase() })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold uppercase focus:outline-none focus:border-sky-400"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Official Issue Date</label>
                    <input
                      type="date"
                      required
                      value={unifiedForm.issueDate}
                      onChange={e => setUnifiedForm({ ...unifiedForm, issueDate: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-400"
                    />
                  </div>
                </div>
                <div className="text-[11px] text-slate-400 bg-sky-950/30 border border-sky-800/30 rounded-xl p-2.5 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <span>
                    The official Certificate of Completion will be generated automatically with Institute seal, gold border, and public verification QR code upon approval.
                  </span>
                </div>
              </div>

              {/* Section 4: Exam Answer Sheet File Upload */}
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider block">
                    4. Upload Evaluated Exam Answer Sheet / Marksheet Scan
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">PDF, PNG, JPG</span>
                </div>

                <div>
                  <input
                    type="file"
                    ref={answerSheetFileInputRef}
                    accept=".pdf,image/png,image/jpeg,image/webp"
                    onChange={e => setAnswerSheetFile(e.target.files?.[0] || null)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-300 text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-sky-500 file:text-slate-950 hover:file:bg-sky-400 cursor-pointer"
                  />
                  <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                    Attach the student's evaluated physical answer paper, laboratory marksheet, or scanned exam sheet. Admin will review this attached answer sheet before approving the certificate.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsUnifiedModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-lg"
                >
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>
                    {isAdmin ? 'Save Marks & Issue Official Certificate' : 'Submit Marks & Draft Certificate for Approval'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 10: Answer Sheet Viewer Modal */}
      {viewingAnswerSheetDoc && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full p-5 sm:p-6 space-y-4 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-amber-400" />
                  <h3 className="text-base font-bold text-white">
                    Evaluated Exam Answer Sheet / Marksheet Paper
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Student: <strong className="text-white">{viewingAnswerSheetDoc.studentFullName}</strong> ({viewingAnswerSheetDoc.studentIdCode}) &bull; Course: {viewingAnswerSheetDoc.courseName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewingAnswerSheetDoc(null)}
                className="text-slate-400 hover:text-white cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 flex items-center justify-center overflow-auto flex-1 min-h-[350px]">
              {viewingAnswerSheetUrl ? (
                viewingAnswerSheetDoc.examAnswerSheetMimeType?.includes('pdf') || viewingAnswerSheetDoc.examAnswerSheetFileName?.toLowerCase().endsWith('.pdf') ? (
                  <iframe
                    src={viewingAnswerSheetUrl}
                    title="Answer Sheet Document"
                    className="w-full h-[480px] rounded-lg border border-slate-800"
                  />
                ) : (
                  <img
                    src={viewingAnswerSheetUrl}
                    alt={viewingAnswerSheetDoc.examAnswerSheetFileName || 'Answer Sheet'}
                    className="max-h-[500px] w-auto rounded-lg shadow-lg object-contain"
                  />
                )
              ) : (
                <div className="text-center py-12 space-y-3">
                  <Paperclip className="w-10 h-10 text-slate-600 mx-auto" />
                  <p className="text-sm font-semibold text-white">
                    {viewingAnswerSheetDoc.examAnswerSheetFileName || 'Answer Sheet Attached'}
                  </p>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Physical answer sheet record was recorded by evaluator <strong className="text-slate-200">{viewingAnswerSheetDoc.createdByName || viewingAnswerSheetDoc.createdBy}</strong> during official grading.
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800 shrink-0">
              <span className="text-slate-400">
                Attached File: <strong className="text-amber-400">{viewingAnswerSheetDoc.examAnswerSheetFileName || 'Evaluated Paper'}</strong>
              </span>
              <div className="flex gap-2">
                {viewingAnswerSheetUrl && (
                  <a
                    href={viewingAnswerSheetUrl}
                    download={viewingAnswerSheetDoc.examAnswerSheetFileName || 'Exam_Answer_Sheet'}
                    className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Answer Sheet</span>
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setViewingAnswerSheetDoc(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
