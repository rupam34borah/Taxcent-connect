export type UserRole = 'admin' | 'staff' | 'student' | 'public';

export type AcademicDocumentType = 'certificate' | 'marksheet';

export type CertificateStatus = 'valid' | 'revoked';

export type ApprovalStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'published';

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'leave';

export type PersonType = 'student' | 'staff';

export type ExamCategory = 'dca_adca' | 'tally_gst' | 'adre' | 'assam_police' | 'apdcl' | 'ssc';

export interface StudentProfile {
  id: string;
  userId?: string;
  studentIdCode: string;
  fullName: string;
  email: string;
  phone: string;
  enrolledCourse: string;
  enrolledCourseId?: string;
  batchId?: string;
  batchCode?: string;
  admissionDate: string;
  enrolmentStatus: 'active' | 'completed' | 'suspended';
  isPortalActive: boolean;
  invitationStatus?: 'active' | 'pending';
  lastLogin?: string;
}

export interface StaffMember {
  id: string;
  userId?: string;
  staffIdCode: string; // e.g. QLI-STF-2026-001
  fullName: string;
  email: string;
  phone: string;
  designation: string;
  role: 'admin' | 'staff';
  permissions: string[]; // e.g. ['admissions', 'attendance', 'marks', 'certificates_draft', 'learning_materials']
  assignedCourses: string[];
  assignedBatches: string[];
  isActive: boolean;
  invitationStatus: 'active' | 'pending' | 'revoked';
  createdAt: string;
}

export interface CourseItem {
  id: string;
  code: string;
  name: string;
  durationMonths: number;
  description: string;
  syllabusTopics: string[];
  isActive: boolean;
}

export interface BatchItem {
  id: string;
  courseId: string;
  courseName: string;
  batchCode: string;
  batchName: string;
  timing: string;
  startDate: string;
  endDate?: string;
  status: 'active' | 'completed' | 'upcoming';
  activeStudentsCount?: number;
}

export interface AttendanceCorrection {
  correctedAt: string;
  correctedBy: string;
  oldStatus: AttendanceStatus;
  newStatus: AttendanceStatus;
  reason: string;
}

export interface AttendanceRecord {
  id: string;
  personType: PersonType;
  personId: string;
  personName: string;
  identifierCode: string; // Student ID or Staff ID
  courseOrDept: string;
  batchId?: string;
  batchCode?: string;
  date: string; // YYYY-MM-DD
  sessionName?: string; // 'morning' | 'afternoon' | 'default'
  status: AttendanceStatus;
  punchInTime?: string;
  punchOutTime?: string;
  reason?: string;
  markedBy: string;
  markedAt: string;
  correctionHistory?: AttendanceCorrection[];
}

export interface AssessmentItem {
  id: string;
  title: string;
  courseId: string;
  courseName: string;
  batchId?: string;
  batchCode?: string;
  maxScore: number;
  passingScore: number;
  assessmentDate: string;
  status: ApprovalStatus; // 'draft' | 'submitted' | 'approved' | 'published'
  createdBy: string;
  approvedBy?: string;
  createdAt: string;
}

export interface StudentMarkRecord {
  id: string;
  assessmentId: string;
  studentId: string;
  studentIdCode: string;
  studentName: string;
  marksObtained: number;
  maxScore: number;
  percentage: number;
  grade: string;
  remarks?: string;
  status: ApprovalStatus;
  enteredBy: string;
  approvedBy?: string;
  updatedAt: string;
  certificateId?: string;
  certificateNumber?: string;
  answerSheetFileName?: string;
  answerSheetFileData?: string;
}

export interface AcademicDocument {
  id: string;
  studentId: string;
  documentType: AcademicDocumentType;
  certificateNumber: string;
  studentIdCode: string;
  studentFullName: string;
  courseName: string;
  issueDate: string;
  marksOrGrade?: string;
  fileStoragePath: string;
  fileName: string;
  fileMimeType: string;
  fileSizeBytes: number;
  status: CertificateStatus;
  approvalStatus?: ApprovalStatus;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  revocationReason?: string;
  revokedAt?: string;
  revokedBy?: string;
  createdBy: string;
  createdByName?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
  localFileData?: string;
  // Portal Generated & Answer Sheet Fields
  isPortalGenerated?: boolean;
  assessmentId?: string;
  assessmentTitle?: string;
  marksObtained?: number;
  maxScore?: number;
  percentage?: number;
  grade?: string;
  evaluatorRemarks?: string;
  batchCode?: string;
  examAnswerSheetFileName?: string;
  examAnswerSheetFileData?: string;
  examAnswerSheetMimeType?: string;
  courseDurationMonths?: number;
}

export interface LearningResourceItem {
  id: string;
  title: string;
  courseId: string;
  courseName: string;
  batchCode?: string;
  category: 'syllabus' | 'notes' | 'practical' | 'assignment';
  subject: string;
  fileUrl: string;
  fileName: string;
  fileSize: string;
  isPublished: boolean;
  uploadedBy: string;
  uploadedAt: string;
}

export interface MockQuestionItem {
  id: string;
  questionText: string;
  questionTextAs?: string;
  options: string[];
  correctOptionIndex: number; // Hidden from student until test submission
  explanation?: string;
  marks: number;
}

export interface MockTestItem {
  id: string;
  title: string;
  category: ExamCategory;
  targetExam?: string;
  durationMinutes: number;
  totalQuestions: number;
  totalMarks: number;
  passingPercentage: number;
  instructions: string;
  isPublished: boolean;
  questions: MockQuestionItem[];
}

export interface MockTestAttempt {
  id: string;
  testId: string;
  testTitle: string;
  studentId: string;
  studentName: string;
  startedAt: string;
  completedAt: string;
  userAnswers: Record<string, number>; // questionId -> selectedOptionIndex
  scoreObtained: number;
  totalMarks: number;
  percentage: number;
  passed: boolean;
}

export interface GovtExamPaperItem {
  id: string;
  examName: string; // e.g. 'ADRE Grade III', 'Assam Police Constable', 'APDCL Office Assistant', 'SSC MTS'
  year: number;
  subject: string;
  language: 'English' | 'Assamese' | 'Bilingual';
  difficulty: 'Easy' | 'Moderate' | 'Advanced';
  downloadUrl: string;
  fileSize: string;
  isOfficialPaper: boolean;
  disclaimer: string;
}

export interface AcademicAuditLog {
  id: string;
  entityType: 'DOCUMENT' | 'STUDENT' | 'STAFF' | 'ATTENDANCE' | 'MARKS' | 'SYLLABUS' | 'TEST';
  entityId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'REJECT' | 'REVOKE' | 'RESTORE' | 'CORRECTION';
  performedBy: string;
  performedByName: string;
  performedByRole: string;
  reason?: string;
  details: Record<string, any>;
  createdAt: string;
}

// Keep backward-compatible alias
export type DocumentAuditLog = AcademicAuditLog;

export interface PublicVerificationResponse {
  found: boolean;
  status: 'VALID' | 'REVOKED' | 'NOT_FOUND';
  certificateNumber?: string;
  instituteName?: string;
  courseName?: string;
  issueDate?: string;
  studentMaskedName?: string;
  documentType?: AcademicDocumentType;
  revocationReason?: string;
  verificationTimestamp?: string;
  message?: string;
  disclaimer: string;
}
