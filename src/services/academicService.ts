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
  MockQuestionItem,
  MockTestAttempt,
  GovtExamPaperItem,
  AcademicAuditLog, 
  PublicVerificationResponse, 
  AcademicDocumentType,
  AttendanceStatus,
  ApprovalStatus,
  ExamCategory,
  PersonType
} from '../types/academic';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { 
  generateOfficialCertificateSvg, 
  generateOfficialMarksheetSvg, 
  computeGradeFrom100 
} from '../utils/certificateGenerator';

// Local Storage Keys for offline / local-authoritative persistence
const STORAGE_KEYS = {
  DOCS: 'taxcent_qli_academic_docs_v2',
  STUDENTS: 'taxcent_qli_students_v2',
  STAFF: 'taxcent_qli_staff_v2',
  COURSES: 'taxcent_qli_courses_v2',
  BATCHES: 'taxcent_qli_batches_v2',
  ATTENDANCE_STUDENT: 'taxcent_qli_attendance_student_v2',
  ATTENDANCE_STAFF: 'taxcent_qli_attendance_staff_v2',
  ASSESSMENTS: 'taxcent_qli_assessments_v2',
  MARKS: 'taxcent_qli_marks_v2',
  LEARNING: 'taxcent_qli_learning_v2',
  MOCK_TESTS: 'taxcent_qli_mock_tests_v2',
  MOCK_ATTEMPTS: 'taxcent_qli_mock_attempts_v2',
  GOVT_PAPERS: 'taxcent_qli_govt_papers_v2',
  AUDIT: 'taxcent_qli_audit_v2',
};

// ====================================================================
// INITIAL SEED DATA FOR QUANTUM LEARNING INSTITUTE
// ====================================================================

const INITIAL_COURSES: CourseItem[] = [
  {
    id: 'crs-dca',
    code: 'DCA',
    name: 'Diploma in Computer Application (DCA)',
    durationMonths: 6,
    description: 'Comprehensive computer fundamentals, MS Office, internet tools, Assamese typing (Ramdhenu), and digital financial services.',
    syllabusTopics: [
      'Module 1: Computer Hardware & OS Basics (Windows/Linux)',
      'Module 2: Word Processing & Professional Formatting',
      'Module 3: Advanced Spreadsheets (Excel Formulas, Pivot, Charts)',
      'Module 4: Presentation Software & Multimedia Design',
      'Module 5: Regional Language Typing (Assamese/Bengali) & Web Utilities',
      'Module 6: Cyber Security Hygiene & Digital Banking',
    ],
    isActive: true,
  },
  {
    id: 'crs-adca',
    code: 'ADCA',
    name: 'Advance Diploma in Computer Application (ADCA)',
    durationMonths: 12,
    description: 'Advanced curriculum covering computer fundamentals, office suites, relational databases, desktop publishing, and introduction to web technologies.',
    syllabusTopics: [
      'Module 1: Advanced Computing Architecture & Networking',
      'Module 2: DBMS & Relational Database Design (PostgreSQL / Access)',
      'Module 3: Desktop Publishing (Photoshop, PageMaker, CorelDraw)',
      'Module 4: Accounting Principles with Tally Prime & GST',
      'Module 5: Modern Web Development (HTML5, CSS3, JavaScript Fundamentals)',
      'Module 6: Practical Capstone Project & Viva Voce',
    ],
    isActive: true,
  },
  {
    id: 'crs-tally',
    code: 'TALLY-GST',
    name: 'Professional Tally Prime & GST Certification',
    durationMonths: 3,
    description: 'Practical corporate accounting, inventory management, e-Way bills, GSTR-1, GSTR-3B filings, and TDS compliance.',
    syllabusTopics: [
      'Module 1: Fundamentals of Double Entry Bookkeeping',
      'Module 2: Company Creation & Ledger Architecture in Tally Prime',
      'Module 3: Inventory Management & Bill of Materials',
      'Module 4: GST Architecture (CGST, SGST, IGST, RCM)',
      'Module 5: E-invoicing, E-Way Bills & Return Preparation',
      'Module 6: Payroll Management & TDS Computation',
    ],
    isActive: true,
  },
  {
    id: 'crs-pgdca',
    code: 'PGDCA',
    name: 'Post Graduate Diploma in Computer Applications (PGDCA)',
    durationMonths: 12,
    description: 'Postgraduate level training in software programming, systems analysis, network administration, and modern data structures.',
    syllabusTopics: [
      'Module 1: Discrete Mathematics & Algorithms',
      'Module 2: Object-Oriented Programming (C++ / Python)',
      'Module 3: Relational Database Management Systems & SQL',
      'Module 4: Computer Networks & Information Security',
      'Module 5: Operating System Internals & Linux Shell Scripting',
      'Module 6: Enterprise Application Development Project',
    ],
    isActive: true,
  },
  {
    id: 'crs-dtp',
    code: 'DTP',
    name: 'Certificate in Desktop Publishing (DTP)',
    durationMonths: 3,
    description: 'Graphic design for publishing, book typography, banners, offset printing prep, and regional publishing layouts.',
    syllabusTopics: [
      'Module 1: Principles of Graphic Design & Color Theory',
      'Module 2: Vector Art in Adobe Illustrator & CorelDraw',
      'Module 3: Image Editing & Pre-press in Adobe Photoshop',
      'Module 4: Book & Newspaper Layout in InDesign / PageMaker',
      'Module 5: Commercial Printing Press Workflow & Exporting',
    ],
    isActive: true,
  },
];

const INITIAL_BATCHES: BatchItem[] = [
  {
    id: 'bat-001',
    courseId: 'crs-dca',
    courseName: 'Diploma in Computer Application (DCA)',
    batchCode: 'DCA-2026-M1',
    batchName: 'DCA Morning Batch A',
    timing: '08:30 AM - 10:30 AM',
    startDate: '2026-01-10',
    status: 'active',
    activeStudentsCount: 18,
  },
  {
    id: 'bat-002',
    courseId: 'crs-adca',
    courseName: 'Advance Diploma in Computer Application (ADCA)',
    batchCode: 'ADCA-2025-E1',
    batchName: 'ADCA Evening Batch B',
    timing: '03:30 PM - 05:30 PM',
    startDate: '2025-06-15',
    status: 'active',
    activeStudentsCount: 14,
  },
  {
    id: 'bat-003',
    courseId: 'crs-tally',
    courseName: 'Professional Tally Prime & GST Certification',
    batchCode: 'TALLY-2026-M2',
    batchName: 'Tally Weekend Masterclass',
    timing: '10:45 AM - 01:15 PM',
    startDate: '2026-02-01',
    status: 'active',
    activeStudentsCount: 22,
  },
  {
    id: 'bat-004',
    courseId: 'crs-pgdca',
    courseName: 'Post Graduate Diploma in Computer Applications (PGDCA)',
    batchCode: 'PGDCA-2025-R1',
    batchName: 'PGDCA Regular Hub',
    timing: '11:00 AM - 01:00 PM',
    startDate: '2025-10-01',
    status: 'active',
    activeStudentsCount: 10,
  },
];

const INITIAL_STAFF: StaffMember[] = import.meta.env.DEV ? [
  {
    id: 'stf-001',
    staffIdCode: 'QLI-STF-2025-001',
    fullName: 'Prof. Debajit Saikia',
    email: 'admin@taxcent.in',
    phone: '9864088990',
    designation: 'Principal & Head of Institute',
    role: 'admin',
    permissions: ['all', 'staff_management', 'attendance_audit', 'approval', 'academic_content', 'audit_logs'],
    assignedCourses: ['DCA', 'ADCA', 'TALLY-GST', 'PGDCA', 'DTP'],
    assignedBatches: ['DCA-2026-M1', 'ADCA-2025-E1', 'TALLY-2026-M2', 'PGDCA-2025-R1'],
    isActive: true,
    invitationStatus: 'active',
    createdAt: '2025-01-01T09:00:00Z',
  },
  {
    id: 'stf-002',
    staffIdCode: 'QLI-STF-2026-002',
    fullName: 'Ananya Dutta',
    email: 'staff@taxcent.in',
    phone: '9435011223',
    designation: 'Senior Faculty (Computer Applications)',
    role: 'staff',
    permissions: ['admissions', 'attendance', 'marks_entry', 'certificates_draft', 'learning_materials'],
    assignedCourses: ['DCA', 'ADCA', 'DTP'],
    assignedBatches: ['DCA-2026-M1', 'ADCA-2025-E1'],
    isActive: true,
    invitationStatus: 'active',
    createdAt: '2026-01-05T10:00:00Z',
  },
  {
    id: 'stf-003',
    staffIdCode: 'QLI-STF-2026-003',
    fullName: 'Biplab Hazarika',
    email: 'biplab.hazarika@taxcent.in',
    phone: '8876599887',
    designation: 'Tally & GST Specialist Instructor',
    role: 'staff',
    permissions: ['attendance', 'marks_entry', 'learning_materials'],
    assignedCourses: ['TALLY-GST'],
    assignedBatches: ['TALLY-2026-M2'],
    isActive: true,
    invitationStatus: 'active',
    createdAt: '2026-02-15T11:30:00Z',
  },
 ] : [];

const INITIAL_STUDENTS: StudentProfile[] = import.meta.env.DEV ? [
  {
    id: 'stu-001',
    studentIdCode: 'QLI-STU-2026-001',
    fullName: 'Rahul Sharma',
    email: 'rahul.sharma@example.com',
    phone: '9864012345',
    enrolledCourse: 'Diploma in Computer Application (DCA)',
    enrolledCourseId: 'crs-dca',
    batchId: 'bat-001',
    batchCode: 'DCA-2026-M1',
    admissionDate: '2026-01-10',
    enrolmentStatus: 'active',
    isPortalActive: true,
    invitationStatus: 'active',
  },
  {
    id: 'stu-002',
    studentIdCode: 'QLI-STU-2026-002',
    fullName: 'Ankita Bora',
    email: 'ankita.bora@example.com',
    phone: '9435098765',
    enrolledCourse: 'Advance Diploma in Computer Application (ADCA)',
    enrolledCourseId: 'crs-adca',
    batchId: 'bat-002',
    batchCode: 'ADCA-2025-E1',
    admissionDate: '2025-06-15',
    enrolmentStatus: 'active',
    isPortalActive: true,
    invitationStatus: 'active',
  },
  {
    id: 'stu-003',
    studentIdCode: 'QLI-STU-2026-003',
    fullName: 'Pranjal Saikia',
    email: 'pranjal.saikia@example.com',
    phone: '8876543210',
    enrolledCourse: 'Post Graduate Diploma in Computer Applications (PGDCA)',
    enrolledCourseId: 'crs-pgdca',
    batchId: 'bat-004',
    batchCode: 'PGDCA-2025-R1',
    admissionDate: '2025-10-01',
    enrolmentStatus: 'active',
    isPortalActive: true,
    invitationStatus: 'active',
  },
  {
    id: 'stu-004',
    studentIdCode: 'QLI-STU-2026-004',
    fullName: 'Rupam Borah',
    email: 'rupam.borah@example.com',
    phone: '8876824424',
    enrolledCourse: 'Professional Tally Prime & GST Certification',
    enrolledCourseId: 'crs-tally',
    batchId: 'bat-003',
    batchCode: 'TALLY-2026-M2',
    admissionDate: '2026-02-01',
    enrolmentStatus: 'active',
    isPortalActive: true,
    invitationStatus: 'active',
  },
  {
    id: 'stu-005',
    studentIdCode: 'QLI-STU-2026-005',
    fullName: 'Manash Jyoti Nath',
    email: 'manash.nath@example.com',
    phone: '9707123980',
    enrolledCourse: 'Certificate in Desktop Publishing (DTP)',
    enrolledCourseId: 'crs-dtp',
    admissionDate: '2026-03-12',
    enrolmentStatus: 'active',
    isPortalActive: true,
    invitationStatus: 'active',
  },
 ] : [];

const INITIAL_DOCUMENTS: AcademicDocument[] = import.meta.env.DEV ? [
  {
    id: 'doc-001',
    studentId: 'stu-001',
    studentIdCode: 'QLI-STU-2026-001',
    studentFullName: 'Rahul Sharma',
    documentType: 'certificate',
    certificateNumber: 'QLI-2026-DCA-1042',
    marksheetNumber: 'QLI-2026-DCA-1042-M',
    courseName: 'Diploma in Computer Application (DCA)',
    issueDate: '2026-08-15',
    marksOrGrade: 'Grade A+ (Distinction - 92.5%) — 92.5/100 Marks',
    marksObtained: 92.5,
    maxScore: 100,
    percentage: 92.5,
    grade: 'A+',
    fileStoragePath: 'academic-documents/stu-001/QLI-2026-DCA-1042.pdf',
    fileName: 'Rahul_Sharma_DCA_Certificate.pdf',
    fileMimeType: 'application/pdf',
    fileSizeBytes: 245800,
    status: 'valid',
    approvalStatus: 'approved',
    approvedBy: 'Prof. Debajit Saikia (Admin)',
    approvedAt: '2026-08-15T10:05:00Z',
    createdBy: 'stf-002',
    createdByName: 'Ananya Dutta',
    createdAt: '2026-08-15T10:00:00Z',
    updatedAt: '2026-08-15T10:00:00Z',
    isPortalGenerated: true,
    batchCode: 'DCA-2026-M1',
  },
  {
    id: 'doc-002',
    studentId: 'stu-001',
    studentIdCode: 'QLI-STU-2026-001',
    studentFullName: 'Rahul Sharma',
    documentType: 'marksheet',
    certificateNumber: 'QLI-2026-DCA-1042',
    marksheetNumber: 'QLI-2026-DCA-1042-M',
    courseName: 'Diploma in Computer Application (DCA)',
    issueDate: '2026-08-15',
    marksOrGrade: 'Total Marks: 92.5 / 100 (92.5%) — Grade A+',
    marksObtained: 92.5,
    maxScore: 100,
    percentage: 92.5,
    grade: 'A+',
    fileStoragePath: 'academic-documents/stu-001/QLI-2026-DCA-1042-M.pdf',
    fileName: 'Rahul_Sharma_DCA_Marksheet.pdf',
    fileMimeType: 'application/pdf',
    fileSizeBytes: 198400,
    status: 'valid',
    approvalStatus: 'approved',
    approvedBy: 'Prof. Debajit Saikia (Admin)',
    approvedAt: '2026-08-15T10:20:00Z',
    createdBy: 'stf-002',
    createdByName: 'Ananya Dutta',
    createdAt: '2026-08-15T10:15:00Z',
    updatedAt: '2026-08-15T10:15:00Z',
    isPortalGenerated: true,
    batchCode: 'DCA-2026-M1',
  },
  {
    id: 'doc-003',
    studentId: 'stu-002',
    studentIdCode: 'QLI-STU-2026-002',
    studentFullName: 'Ankita Bora',
    documentType: 'certificate',
    certificateNumber: 'QLI-2025-ADCA-0819',
    courseName: 'Advance Diploma in Computer Application (ADCA)',
    issueDate: '2025-11-20',
    marksOrGrade: 'Grade A (86%)',
    fileStoragePath: 'academic-documents/stu-002/QLI-2025-ADCA-0819.pdf',
    fileName: 'Ankita_Bora_ADCA_Certificate.pdf',
    fileMimeType: 'application/pdf',
    fileSizeBytes: 212000,
    status: 'revoked',
    approvalStatus: 'approved',
    revocationReason: 'Original document superseded following corrected registration records. Revoked by institutional authority.',
    revokedAt: '2026-01-14T09:30:00Z',
    revokedBy: 'stf-001',
    createdBy: 'stf-002',
    createdByName: 'Ananya Dutta',
    createdAt: '2025-11-20T11:00:00Z',
    updatedAt: '2026-01-14T09:30:00Z',
  },
  {
    id: 'doc-004',
    studentId: 'stu-004',
    studentIdCode: 'QLI-STU-2026-004',
    studentFullName: 'Rupam Borah',
    documentType: 'certificate',
    certificateNumber: 'QLI-2026-TLY-2031',
    marksheetNumber: 'QLI-2026-TLY-2031-M',
    courseName: 'Professional Tally Prime & GST Certification',
    issueDate: '2026-06-10',
    marksOrGrade: 'Grade A+ (Distinction - 96%) — 96/100 Marks',
    marksObtained: 96,
    maxScore: 100,
    percentage: 96,
    grade: 'A+',
    fileStoragePath: 'academic-documents/stu-004/QLI-2026-TLY-2031.pdf',
    fileName: 'Rupam_Borah_Tally_GST_Certificate.pdf',
    fileMimeType: 'application/pdf',
    fileSizeBytes: 231500,
    status: 'valid',
    approvalStatus: 'approved',
    approvedBy: 'Prof. Debajit Saikia (Admin)',
    approvedAt: '2026-06-10T14:30:00Z',
    createdBy: 'stf-003',
    createdByName: 'Biplab Hazarika',
    createdAt: '2026-06-10T14:20:00Z',
    updatedAt: '2026-06-10T14:20:00Z',
    isPortalGenerated: true,
  },
  {
    id: 'doc-005',
    studentId: 'stu-003',
    studentIdCode: 'QLI-STU-2026-003',
    studentFullName: 'Pranjal Saikia',
    documentType: 'certificate',
    certificateNumber: 'QLI-2026-PGDCA-3091',
    marksheetNumber: 'QLI-2026-PGDCA-3091-M',
    courseName: 'Post Graduate Diploma in Computer Applications (PGDCA)',
    issueDate: '2026-09-02',
    marksOrGrade: 'Grade A (First Class - 88%) — 88/100 Marks',
    marksObtained: 88,
    maxScore: 100,
    percentage: 88,
    grade: 'A',
    fileStoragePath: 'academic-documents/stu-003/QLI-2026-PGDCA-3091.pdf',
    fileName: 'Pranjal_Saikia_PGDCA_Certificate.pdf',
    fileMimeType: 'application/pdf',
    fileSizeBytes: 265000,
    status: 'valid',
    approvalStatus: 'approved',
    approvedBy: 'Prof. Debajit Saikia (Admin)',
    approvedAt: '2026-09-02T16:10:00Z',
    createdBy: 'stf-002',
    createdByName: 'Ananya Dutta',
    createdAt: '2026-09-02T16:00:00Z',
    updatedAt: '2026-09-02T16:00:00Z',
    isPortalGenerated: true,
  },
  {
    id: 'doc-006',
    studentId: 'stu-005',
    studentIdCode: 'QLI-STU-2026-005',
    studentFullName: 'Manash Jyoti Nath',
    documentType: 'certificate',
    certificateNumber: 'QLI-2026-DTP-1045',
    marksheetNumber: 'QLI-2026-DTP-1045-M',
    courseName: 'Certificate in Desktop Publishing (DTP)',
    issueDate: '2026-10-25',
    marksOrGrade: 'Grade A+ (Distinction - 89%) — 89/100 Marks',
    marksObtained: 89,
    maxScore: 100,
    percentage: 89,
    grade: 'Distinction (A+)',
    evaluatorRemarks: 'Excellent mastery of Adobe Photoshop, PageMaker and CorelDraw layout design.',
    fileStoragePath: 'academic-documents/stu-005/QLI-2026-DTP-1045_generated.pdf',
    fileName: 'Manash_Jyoti_Nath_QLI-2026-DTP-1045_Certificate.pdf',
    fileMimeType: 'application/pdf',
    fileSizeBytes: 245000,
    status: 'valid',
    approvalStatus: 'pending',
    createdBy: 'stf-002',
    createdByName: 'Ananya Dutta',
    createdAt: '2026-10-25T11:30:00Z',
    updatedAt: '2026-10-25T11:30:00Z',
    isPortalGenerated: true,
    assessmentTitle: 'DTP Comprehensive Final Practical & Theoretical Examination',
    examAnswerSheetFileName: 'Manash_Nath_DTP_Final_Evaluated_Answer_Sheet.pdf',
    examAnswerSheetMimeType: 'application/pdf',
  },
 ] : [];

const INITIAL_ATTENDANCE: AttendanceRecord[] = import.meta.env.DEV ? [
  {
    id: 'att-001',
    personType: 'student',
    personId: 'stu-001',
    personName: 'Rahul Sharma',
    identifierCode: 'QLI-STU-2026-001',
    courseOrDept: 'Diploma in Computer Application (DCA)',
    batchId: 'bat-001',
    batchCode: 'DCA-2026-M1',
    date: new Date().toISOString().split('T')[0],
    sessionName: 'morning',
    status: 'present',
    markedBy: 'Ananya Dutta',
    markedAt: new Date().toISOString(),
  },
  {
    id: 'att-002',
    personType: 'student',
    personId: 'stu-002',
    personName: 'Ankita Bora',
    identifierCode: 'QLI-STU-2026-002',
    courseOrDept: 'Advance Diploma in Computer Application (ADCA)',
    batchId: 'bat-002',
    batchCode: 'ADCA-2025-E1',
    date: new Date().toISOString().split('T')[0],
    sessionName: 'morning',
    status: 'present',
    markedBy: 'Ananya Dutta',
    markedAt: new Date().toISOString(),
  },
  {
    id: 'att-003',
    personType: 'student',
    personId: 'stu-003',
    personName: 'Pranjal Saikia',
    identifierCode: 'QLI-STU-2026-003',
    courseOrDept: 'Post Graduate Diploma in Computer Applications (PGDCA)',
    batchId: 'bat-004',
    batchCode: 'PGDCA-2025-R1',
    date: new Date().toISOString().split('T')[0],
    sessionName: 'morning',
    status: 'late',
    reason: 'Traffic congestion on NH-15 Ranabari',
    markedBy: 'Ananya Dutta',
    markedAt: new Date().toISOString(),
  },
  {
    id: 'att-004',
    personType: 'staff',
    personId: 'stf-002',
    personName: 'Ananya Dutta',
    identifierCode: 'QLI-STF-2026-002',
    courseOrDept: 'Computer Applications Faculty',
    date: new Date().toISOString().split('T')[0],
    status: 'present',
    punchInTime: '08:15 AM',
    markedBy: 'Biometric System / Admin Punch',
    markedAt: new Date().toISOString(),
  },
  {
    id: 'att-005',
    personType: 'staff',
    personId: 'stf-003',
    personName: 'Biplab Hazarika',
    identifierCode: 'QLI-STF-2026-003',
    courseOrDept: 'Tally & Accounts Faculty',
    date: new Date().toISOString().split('T')[0],
    status: 'present',
    punchInTime: '09:00 AM',
    markedBy: 'Biometric System / Admin Punch',
    markedAt: new Date().toISOString(),
  },
 ] : [];

const INITIAL_ASSESSMENTS: AssessmentItem[] = import.meta.env.DEV ? [
  {
    id: 'asm-001',
    title: 'DCA Mid-Term Practical & Theory Examination',
    courseId: 'crs-dca',
    courseName: 'Diploma in Computer Application (DCA)',
    batchId: 'bat-001',
    batchCode: 'DCA-2026-M1',
    maxScore: 100,
    passingScore: 40,
    assessmentDate: '2026-07-20',
    status: 'published',
    createdBy: 'Ananya Dutta',
    approvedBy: 'Prof. Debajit Saikia (Admin)',
    createdAt: '2026-07-20T10:00:00Z',
  },
  {
    id: 'asm-002',
    title: 'Tally Prime GST E-way & Return Filing Assessment',
    courseId: 'crs-tally',
    courseName: 'Professional Tally Prime & GST Certification',
    batchId: 'bat-003',
    batchCode: 'TALLY-2026-M2',
    maxScore: 100,
    passingScore: 45,
    assessmentDate: '2026-05-15',
    status: 'published',
    createdBy: 'Biplab Hazarika',
    approvedBy: 'Prof. Debajit Saikia (Admin)',
    createdAt: '2026-05-15T11:00:00Z',
  },
 ] : [];

const INITIAL_MARKS: StudentMarkRecord[] = import.meta.env.DEV ? [
  {
    id: 'mrk-001',
    assessmentId: 'asm-001',
    studentId: 'stu-001',
    studentIdCode: 'QLI-STU-2026-001',
    studentName: 'Rahul Sharma',
    marksObtained: 92.5,
    maxScore: 100,
    percentage: 92.5,
    grade: 'A+',
    remarks: 'Exceptional proficiency in MS Excel, VLOOKUP, and Assamese Ramdhenu typing.',
    status: 'published',
    enteredBy: 'Ananya Dutta',
    approvedBy: 'Prof. Debajit Saikia (Admin)',
    updatedAt: '2026-07-22T10:00:00Z',
  },
  {
    id: 'mrk-002',
    assessmentId: 'asm-002',
    studentId: 'stu-004',
    studentIdCode: 'QLI-STU-2026-004',
    studentName: 'Rupam Borah',
    marksObtained: 96,
    maxScore: 100,
    percentage: 96.0,
    grade: 'Distinction',
    remarks: 'Flawless GST reconciliation and journal voucher entries in Tally Prime.',
    status: 'published',
    enteredBy: 'Biplab Hazarika',
    approvedBy: 'Prof. Debajit Saikia (Admin)',
    updatedAt: '2026-05-18T14:00:00Z',
  },
 ] : [];

const INITIAL_LEARNING_MATERIALS: LearningResourceItem[] = import.meta.env.DEV ? [
  {
    id: 'mat-001',
    title: 'DCA Complete Official Curriculum & Examination Blueprint 2026',
    courseId: 'crs-dca',
    courseName: 'Diploma in Computer Application (DCA)',
    batchCode: 'All DCA Batches',
    category: 'syllabus',
    subject: 'Complete Syllabus',
    fileUrl: '#download-syllabus-dca',
    fileName: 'QLI_DCA_Curriculum_2026.pdf',
    fileSize: '1.4 MB',
    isPublished: true,
    uploadedBy: 'Prof. Debajit Saikia',
    uploadedAt: '2026-01-15T09:00:00Z',
  },
  {
    id: 'mat-002',
    title: 'Advanced Excel Formulas Cheat Sheet (XLOOKUP, INDEX-MATCH, Pivot Tables)',
    courseId: 'crs-dca',
    courseName: 'Diploma in Computer Application (DCA)',
    category: 'notes',
    subject: 'Spreadsheet Analytics',
    fileUrl: '#download-excel-cheatsheet',
    fileName: 'Advanced_Excel_Formulas_QLI.pdf',
    fileSize: '2.8 MB',
    isPublished: true,
    uploadedBy: 'Ananya Dutta',
    uploadedAt: '2026-02-10T11:20:00Z',
  },
  {
    id: 'mat-003',
    title: 'Tally Prime GST Practical Accounts Handbook & Simulated Invoices',
    courseId: 'crs-tally',
    courseName: 'Professional Tally Prime & GST Certification',
    category: 'practical',
    subject: 'Tally & GST Lab',
    fileUrl: '#download-tally-handbook',
    fileName: 'Tally_Prime_GST_Practical_Manual.pdf',
    fileSize: '4.2 MB',
    isPublished: true,
    uploadedBy: 'Biplab Hazarika',
    uploadedAt: '2026-02-20T16:00:00Z',
  },
  {
    id: 'mat-004',
    title: 'ADCA Database Management with SQL & PostgreSQL Guide',
    courseId: 'crs-adca',
    courseName: 'Advance Diploma in Computer Application (ADCA)',
    category: 'notes',
    subject: 'Database Systems',
    fileUrl: '#download-adca-sql',
    fileName: 'ADCA_SQL_PostgreSQL_Notes.pdf',
    fileSize: '3.1 MB',
    isPublished: true,
    uploadedBy: 'Ananya Dutta',
    uploadedAt: '2026-03-05T14:10:00Z',
  },
 ] : [];

const INITIAL_MOCK_TESTS: MockTestItem[] = import.meta.env.DEV ? [
  {
    id: 'test-dca-01',
    title: 'DCA Computer Fundamentals & MS Office Mastery Test',
    category: 'dca_adca',
    targetExam: 'QLI Academic Semester Test',
    durationMinutes: 20,
    totalQuestions: 5,
    totalMarks: 25,
    passingPercentage: 50,
    instructions: 'Each question carries 5 marks. Time limit is 20 minutes. Answer keys and detailed explanations are revealed immediately upon submission.',
    isPublished: true,
    questions: [
      {
        id: 'q-dca-1',
        questionText: 'Which keyboard shortcut is used to create an absolute cell reference (e.g., $A$1) in Microsoft Excel?',
        questionTextAs: 'মাইক্ৰ’চফ্ট এক্সেলত এবচলিউট চেল ৰেফাৰেন্স (যেনে: $A$1) সৃষ্টি কৰিবলৈ কোনটো কিব’ৰ্ড চৰ্টকাট ব্যৱহাৰ কৰা হয়?',
        options: ['F2', 'F4', 'Ctrl + R', 'Shift + F3'],
        correctOptionIndex: 1,
        explanation: 'Pressing the F4 key in Excel toggles through absolute and relative reference formats ($A$1, A$1, $A1, A1).',
        marks: 5,
      },
      {
        id: 'q-dca-2',
        questionText: 'What is the default port number used by secure web traffic (HTTPS)?',
        questionTextAs: 'সুৰক্ষিত ৱেব ট্ৰেফিক (HTTPS) ৰ বাবে ব্যৱহৃত ডিফল্ট পৰ্ট নম্বৰটো কি?',
        options: ['Port 80', 'Port 21', 'Port 443', 'Port 8080'],
        correctOptionIndex: 2,
        explanation: 'Port 443 is the standard port for HTTPS encrypted communication, whereas Port 80 is for unencrypted HTTP.',
        marks: 5,
      },
      {
        id: 'q-dca-3',
        questionText: 'In MS Word, which feature allows you to send personalized letters to multiple recipients using a database list?',
        questionTextAs: 'এম.এছ. ৱৰ্ডত কোনটো ফিচাৰে ডেটাবেছ তালিকা ব্যৱহাৰ কৰি একাধিক প্ৰাপকলৈ ব্যক্তিগত চিঠি প্ৰেৰণ কৰিবলৈ দিয়ে?',
        options: ['Mail Merge', 'Track Changes', 'Format Painter', 'Macros'],
        correctOptionIndex: 0,
        explanation: 'Mail Merge merges a master document with a structured data source (like an Excel sheet) to generate customized copies.',
        marks: 5,
      },
      {
        id: 'q-dca-4',
        questionText: 'Which regional font encoding is standard for official government Assamese Ramdhenu / Geetanjali layouts?',
        questionTextAs: 'চৰকাৰী অসমীয়া ৰামধেনু / গীতাঞ্জলী লেআউটত সচৰাচৰ কোনটো এনক’ডিং ব্যৱহৃত হয়?',
        options: ['ASCII 7-bit', 'Unicode UTF-8 / InScript', 'EBCDIC', 'Morse Code'],
        correctOptionIndex: 1,
        explanation: 'Modern Assamese digital typography strictly follows Unicode standards (Assamese script range U+0980 to U+09FF).',
        marks: 5,
      },
      {
        id: 'q-dca-5',
        questionText: 'Which component of the Central Processing Unit (CPU) is directly responsible for arithmetic calculations and logical comparisons?',
        questionTextAs: 'চি.পি.ইউ. (CPU) ৰ কোনটো অংশ গাণিতিক গণনা আৰু যুক্তিগত তুলনাৰ বাবে দায়বদ্ধ?',
        options: ['Control Unit (CU)', 'Arithmetic Logic Unit (ALU)', 'Cache Memory', 'Register File'],
        correctOptionIndex: 1,
        explanation: 'The Arithmetic Logic Unit (ALU) performs all binary integer arithmetic and boolean logical operations.',
        marks: 5,
      },
    ],
  },
  {
    id: 'test-adre-01',
    title: 'Assam Direct Recruitment (ADRE Grade III) — Computer Proficiency & GS',
    category: 'adre',
    targetExam: 'Assam Direct Recruitment Examination 2026',
    durationMinutes: 15,
    totalQuestions: 5,
    totalMarks: 25,
    passingPercentage: 40,
    instructions: 'Model question paper aligned with ADRE Grade III syllabus. All questions are bilingual (Assamese and English).',
    isPublished: true,
    questions: [
      {
        id: 'q-adre-1',
        questionText: 'The historic Treaty of Yandabo was signed in which year, ending the First Anglo-Burmese War?',
        questionTextAs: 'ঐতিহাসিক ইয়াণ্ডাবু সন্ধি কোনটো বছৰত স্বাক্ষৰিত হৈছিল, যাৰ দ্বাৰা প্ৰথম ইংগ-বাৰ্মিজ যুদ্ধৰ অন্ত পৰিছিল?',
        options: ['1824', '1826', '1857', '1885'],
        correctOptionIndex: 1,
        explanation: 'The Treaty of Yandabo was signed on 24 February 1826, transferring administration of Assam to the British East India Company.',
        marks: 5,
      },
      {
        id: 'q-adre-2',
        questionText: 'Which national park in Assam is famous worldwide as the largest refuge for the Great One-Horned Rhinoceros?',
        questionTextAs: 'অসমৰ কোনটো ৰাষ্ট্ৰীয় উদ্যান বিশ্ববিখ্যাত এশিঙীয়া গঁড়ৰ বাবে সৰ্ববৃহৎ আশ্ৰয়স্থল হিচাপে জনাজাত?',
        options: ['Manas National Park', 'Kaziranga National Park', 'Dibru-Saikhowa National Park', 'Nameri National Park'],
        correctOptionIndex: 1,
        explanation: 'Kaziranga National Park hosts two-thirds of the world’s great one-horned rhinoceroses and is a UNESCO World Heritage Site.',
        marks: 5,
      },
      {
        id: 'q-adre-3',
        questionText: 'In computer applications, what does SSD stand for?',
        questionTextAs: 'কম্পিউটাৰ এপ্লিকেচনত SSD ৰ সম্পূৰ্ণ নাম কি?',
        options: ['Solid State Drive', 'System Storage Device', 'Serial Super Disk', 'Silicon Sector Data'],
        correctOptionIndex: 0,
        explanation: 'Solid State Drive (SSD) is flash-based persistent storage offering significantly faster read/write speeds than traditional HDDs.',
        marks: 5,
      },
      {
        id: 'q-adre-4',
        questionText: 'Who was the first Chief Minister of post-independence Assam?',
        questionTextAs: 'স্বাধীনোত্তৰ অসমৰ প্ৰথমগৰাকী মুখ্যমন্ত্ৰী কোন আছিল?',
        options: ['Bimala Prasad Chaliha', 'Gopinath Bordoloi', 'Bishnuram Medhi', 'Mahendra Mohan Choudhry'],
        correctOptionIndex: 1,
        explanation: 'Lokapriya Gopinath Bordoloi served as the first Chief Minister of Assam after Indian independence in 1947.',
        marks: 5,
      },
      {
        id: 'q-adre-5',
        questionText: 'Which protocol is primarily used for securely transferring files over an encrypted SSH connection?',
        questionTextAs: 'এনক্ৰিপ্ট কৰা SSH সংযোগৰ জৰিয়তে সুৰক্ষিতভাৱে ফাইল স্থানান্তৰৰ বাবে মূলতঃ কোনটো প্ৰট’কল ব্যৱহাৰ হয়?',
        options: ['FTP', 'SFTP', 'Telnet', 'TFTP'],
        correctOptionIndex: 1,
        explanation: 'SFTP (SSH File Transfer Protocol) runs over an encrypted secure shell transport layer, protecting credentials and content in transit.',
        marks: 5,
      },
    ],
  },
 ] : [];

const INITIAL_GOVT_PAPERS: GovtExamPaperItem[] = [
  {
    id: 'gov-001',
    examName: 'ADRE Grade III (Bachelor & HSSLC Level)',
    year: 2025,
    subject: 'Computer Proficiency, General Knowledge & Mental Ability',
    language: 'Bilingual',
    difficulty: 'Moderate',
    downloadUrl: '#download-adre-2025-set1',
    fileSize: '3.4 MB',
    isOfficialPaper: false,
    disclaimer: 'Curated model mock test paper developed by Quantum Learning Institute academic committee. Not an autonomous exam board publication.',
  },
  {
    id: 'gov-002',
    examName: 'Assam Police Constable (UB/AB) & Sub-Inspector',
    year: 2024,
    subject: 'Reasoning, Elementary Mathematics & Assam Geography',
    language: 'Assamese',
    difficulty: 'Moderate',
    downloadUrl: '#download-ap-2024-set',
    fileSize: '2.8 MB',
    isOfficialPaper: false,
    disclaimer: 'Practice paper prepared for Quantum Learning Institute students. Check slprbassam.in for official recruitment notices.',
  },
  {
    id: 'gov-003',
    examName: 'APDCL Office Cum Field Assistant / Junior Manager',
    year: 2024,
    subject: 'General English, Quantitative Aptitude & IT Basics',
    language: 'English',
    difficulty: 'Advanced',
    downloadUrl: '#download-apdcl-2024',
    fileSize: '2.9 MB',
    isOfficialPaper: false,
    disclaimer: 'Model test series compiled by academic mentors. Intended strictly for skill assessment and student self-evaluation.',
  },
  {
    id: 'gov-004',
    examName: 'SSC CGL / CHSL Tier-I Computer Awareness',
    year: 2025,
    subject: 'Computer Knowledge Qualifying Module (Hardware, Software, Internet)',
    language: 'English',
    difficulty: 'Moderate',
    downloadUrl: '#download-ssc-comp-2025',
    fileSize: '1.9 MB',
    isOfficialPaper: false,
    disclaimer: 'Model test practice module based on latest Staff Selection Commission syllabus.',
  },
];

// Helper to mask name for public privacy
export function maskStudentName(fullName: string): string {
  if (!fullName || !fullName.trim()) return 'A*** S***';
  return fullName
    .trim()
    .split(/\s+/)
    .map(part => {
      if (part.length <= 1) return part;
      return part[0] + '*'.repeat(Math.max(2, part.length - 1));
    })
    .join(' ');
}

// Browser storage is only a development preview. It is never an authority for
// authentication, academic records, grades, or certificate verification.
const LOCAL_PREVIEW_ENABLED = import.meta.env.DEV && !isSupabaseConfigured;

function loadFromStorage<T>(key: string, defaultData: T): T {
  if (!LOCAL_PREVIEW_ENABLED) {
    return (Array.isArray(defaultData) ? [] : defaultData) as T;
  }

  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultData));
      return defaultData;
    }
    return JSON.parse(raw);
  } catch {
    return defaultData;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  if (!LOCAL_PREVIEW_ENABLED) {
    throw new Error('Local academic storage is disabled outside the development preview.');
  }

  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn(`Could not save key ${key}:`, err);
  }
}

async function logAudit(audit: Omit<AcademicAuditLog, 'id' | 'createdAt'>): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) throw new Error('Sign in is required to write an audit entry.');
    const { data: role, error: roleError } = await supabase.rpc('get_auth_role');
    if (roleError) throw roleError;
    const { error } = await supabase.from('academic_audit_logs').insert({
      entity_type: audit.entityType,
      entity_id: audit.entityId,
      action: audit.action,
      performed_by_id: authData.user.id,
      performed_by_name: authData.user.user_metadata?.full_name || authData.user.email || audit.performedByName,
      performed_by_role: role || 'student',
      reason: audit.reason || null,
      details: audit.details || {},
    });
    if (error) throw error;
    return;
  }

  if (!LOCAL_PREVIEW_ENABLED) return;
  try {
    const logs = loadFromStorage<AcademicAuditLog[]>(STORAGE_KEYS.AUDIT, []);
    const entry: AcademicAuditLog = {
      ...audit,
      id: 'aud-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      createdAt: new Date().toISOString(),
    };
    logs.unshift(entry);
    saveToStorage(STORAGE_KEYS.AUDIT, logs.slice(0, 500));
  } catch (err) {
    console.warn('Could not record audit log:', err);
  }
}

// Rate limiting for public verification
const RATE_LIMIT_WINDOW_MS = 60000;
const MAX_VERIFY_REQUESTS_PER_MIN = 12;
let verifyTimestamps: number[] = [];

// ====================================================================
// ACADEMIC SERVICE AUTHORITATIVE EXPORTS
// ====================================================================
export const academicService = {
  isSupabaseMode(): boolean {
    return isSupabaseConfigured;
  },

  // ------------------------------------------------------------------
  // 1. PUBLIC CERTIFICATE VERIFICATION (Privacy-Preserved)
  // ------------------------------------------------------------------
  async verifyCertificate(certificateNumber: string): Promise<PublicVerificationResponse> {
    const cleanCertNo = certificateNumber.trim().toUpperCase();

    const now = Date.now();
    verifyTimestamps = verifyTimestamps.filter(t => now - t < RATE_LIMIT_WINDOW_MS);
    if (verifyTimestamps.length >= MAX_VERIFY_REQUESTS_PER_MIN) {
      return {
        found: false,
        status: 'UNAVAILABLE',
        disclaimer: 'Temporary rate limit reached to protect student registry privacy. Please wait a moment before trying again.',
        message: 'Too many verification attempts. Please wait 30 seconds before searching again.',
      };
    }
    verifyTimestamps.push(now);

    // If Supabase configured, call secure RPC function
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.rpc('verify_certificate', {
          p_certificate_number: cleanCertNo,
        });

        if (error || !data) throw error || new Error('Empty response from certificate verification service.');
        return {
          found: data.found,
          status: data.status,
          certificateNumber: data.certificate_number,
          instituteName: data.institute_name,
          courseName: data.course_name,
          issueDate: data.issue_date,
          studentMaskedName: data.student_masked_name,
          documentType: data.document_type,
          revocationReason: data.revocation_reason,
          verificationTimestamp: data.verification_timestamp,
          message: data.message,
          disclaimer: data.disclaimer || 'Verified against Quantum Learning Institute authoritative registry. This confirms record authenticity at the institute and does not imply autonomous government accreditation.',
        };
      } catch (e) {
        console.error('Certificate verification service failed:', e);
        throw new Error('Certificate verification is temporarily unavailable. Please try again later.');
      }
    }

    if (!LOCAL_PREVIEW_ENABLED) {
      throw new Error('Certificate verification is not configured. Please contact the institute.');
    }

    const docs = loadFromStorage<AcademicDocument[]>(STORAGE_KEYS.DOCS, INITIAL_DOCUMENTS);
    const doc = docs.find(d => d.certificateNumber.trim().toUpperCase() === cleanCertNo);

    if (!doc || doc.approvalStatus !== 'approved') {
      return {
        found: false,
        status: 'NOT_FOUND',
        certificateNumber: cleanCertNo,
        message: 'No verified certificate or marksheet was found in the authoritative registry matching this certificate number.',
        disclaimer: 'Verified against Quantum Learning Institute authoritative registry. This confirms record authenticity at the institute and does not imply autonomous government accreditation.',
      };
    }

    if (doc.status === 'revoked') {
      return {
        found: true,
        status: 'REVOKED',
        certificateNumber: doc.certificateNumber,
        instituteName: 'Quantum Learning Institute',
        courseName: doc.courseName,
        issueDate: doc.issueDate,
        studentMaskedName: maskStudentName(doc.studentFullName),
        documentType: doc.documentType,
        revocationReason: doc.revocationReason || 'This credential was revoked by Quantum Learning Institute administration.',
        disclaimer: 'This certificate has been revoked by institutional authority and is no longer valid for any official, academic, or professional purpose.',
      };
    }

    return {
      found: true,
      status: 'VALID',
      certificateNumber: doc.certificateNumber,
      instituteName: 'Quantum Learning Institute',
      courseName: doc.courseName,
      issueDate: doc.issueDate,
      studentMaskedName: maskStudentName(doc.studentFullName),
      documentType: doc.documentType,
      verificationTimestamp: new Date().toISOString(),
      disclaimer: 'Verified against Quantum Learning Institute authoritative registry. This confirms record authenticity at the institute and does not imply autonomous government accreditation.',
    };
  },

  // ------------------------------------------------------------------
  // 2. COURSES & BATCHES MANAGEMENT
  // ------------------------------------------------------------------
  async getCourses(): Promise<CourseItem[]> {
    if (!isSupabaseConfigured || !supabase) return loadFromStorage<CourseItem[]>(STORAGE_KEYS.COURSES, INITIAL_COURSES);
    const { data, error } = await supabase.from('courses').select('*').order('name');
    if (error) throw error;
    return (data || []).map((row: any) => ({
      id: row.id,
      code: row.code,
      name: row.name,
      durationMonths: row.duration_months,
      description: row.description || '',
      syllabusTopics: Array.isArray(row.syllabus_topics) ? row.syllabus_topics : [],
      isActive: row.is_active !== false,
    }));
  },

  async getBatches(): Promise<BatchItem[]> {
    if (!isSupabaseConfigured || !supabase) return loadFromStorage<BatchItem[]>(STORAGE_KEYS.BATCHES, INITIAL_BATCHES);
    const { data, error } = await supabase.from('batches').select('*, courses(name)').order('start_date', { ascending: false });
    if (error) throw error;
    return (data || []).map((row: any) => ({
      id: row.id,
      courseId: row.course_id,
      courseName: row.courses?.name || '',
      batchCode: row.batch_code,
      batchName: row.batch_name,
      timing: row.timing || '',
      startDate: row.start_date,
      endDate: row.end_date || undefined,
      status: row.status || 'active',
    }));
  },

  async createCourse(course: Omit<CourseItem, 'id'>, performedBy: string): Promise<CourseItem> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('courses').insert({
        code: course.code.trim().toUpperCase(),
        name: course.name.trim(),
        duration_months: course.durationMonths,
        description: course.description,
        syllabus_topics: course.syllabusTopics,
        is_active: course.isActive,
      }).select('*').single();
      if (error) throw error;
      const created: CourseItem = { id: data.id, code: data.code, name: data.name, durationMonths: data.duration_months, description: data.description || '', syllabusTopics: data.syllabus_topics || [], isActive: data.is_active };
      await logAudit({ entityType: 'SYLLABUS', entityId: created.id, action: 'CREATE', performedBy, performedByName: performedBy, performedByRole: 'staff', details: { courseName: created.name, code: created.code } });
      return created;
    }
    const list = await this.getCourses();
    const newCourse: CourseItem = {
      ...course,
      id: 'crs-' + course.code.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    };
    list.push(newCourse);
    saveToStorage(STORAGE_KEYS.COURSES, list);
    await logAudit({
      entityType: 'SYLLABUS',
      entityId: newCourse.id,
      action: 'CREATE',
      performedBy,
      performedByName: performedBy,
      performedByRole: 'admin',
      details: { courseName: newCourse.name, code: newCourse.code },
    });
    return newCourse;
  },

  async createBatch(batch: Omit<BatchItem, 'id'>, performedBy: string): Promise<BatchItem> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('batches').insert({
        course_id: batch.courseId || null,
        batch_code: batch.batchCode.trim().toUpperCase(),
        batch_name: batch.batchName.trim(),
        timing: batch.timing,
        start_date: batch.startDate,
        end_date: batch.endDate || null,
        status: batch.status,
      }).select('*, courses(name)').single();
      if (error) throw error;
      const created: BatchItem = { id: data.id, courseId: data.course_id, courseName: data.courses?.name || batch.courseName, batchCode: data.batch_code, batchName: data.batch_name, timing: data.timing || '', startDate: data.start_date, endDate: data.end_date || undefined, status: data.status || 'active' };
      await logAudit({ entityType: 'SYLLABUS', entityId: created.id, action: 'CREATE', performedBy, performedByName: performedBy, performedByRole: 'staff', details: { batchCode: created.batchCode, batchName: created.batchName } });
      return created;
    }
    const list = await this.getBatches();
    const newBatch: BatchItem = {
      ...batch,
      id: 'bat-' + Date.now(),
    };
    list.push(newBatch);
    saveToStorage(STORAGE_KEYS.BATCHES, list);
    await logAudit({
      entityType: 'SYLLABUS',
      entityId: newBatch.id,
      action: 'CREATE',
      performedBy,
      performedByName: performedBy,
      performedByRole: 'admin',
      details: { batchCode: newBatch.batchCode, batchName: newBatch.batchName },
    });
    return newBatch;
  },

  // ------------------------------------------------------------------
  // 3. STAFF MANAGEMENT (Admin only)
  // ------------------------------------------------------------------
  async getStaffMembers(): Promise<StaffMember[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('institute_staff').select('*').order('full_name');
      if (error) throw error;
      return (data || []).map((row: any) => ({
        id: row.id, userId: row.user_id || undefined, staffIdCode: row.staff_id_code,
        fullName: row.full_name, email: row.email, phone: row.phone || '',
        designation: row.designation || 'Instructor', role: row.role,
        permissions: row.permissions || [], assignedCourses: row.assigned_courses || [],
        assignedBatches: row.assigned_batches || [], isActive: row.is_active !== false,
        invitationStatus: row.invitation_status || 'active', createdAt: row.created_at,
      }));
    }
    return loadFromStorage<StaffMember[]>(STORAGE_KEYS.STAFF, INITIAL_STAFF);
  },

  async createStaffMember(params: {
    fullName: string;
    email: string;
    phone: string;
    designation: string;
    role: 'admin' | 'staff';
    permissions: string[];
    assignedCourses: string[];
    assignedBatches: string[];
    adminName: string;
  }): Promise<{ success: boolean; staff?: StaffMember; error?: string; inviteLink?: string }> {
    if (isSupabaseConfigured && supabase) {
      const email = params.email.trim().toLowerCase();
      const staffIdCode = `QLI-STF-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
      const { data, error } = await supabase.functions.invoke('invite-user', {
        body: { kind: 'staff', fullName: params.fullName.trim(), email, phone: params.phone.trim(), designation: params.designation.trim() || 'Instructor', role: params.role, permissions: params.permissions, assignedCourses: params.assignedCourses, assignedBatches: params.assignedBatches, staffIdCode },
      });
      if (error || !data?.staff) return { success: false, error: error?.message || data?.error || 'Could not invite this staff member.' };
      const row = data.staff;
      return { success: true, staff: { id: row.id, userId: row.user_id, staffIdCode: row.staff_id_code, fullName: row.full_name, email: row.email, phone: row.phone || '', designation: row.designation || 'Instructor', role: row.role, permissions: row.permissions || [], assignedCourses: row.assigned_courses || [], assignedBatches: row.assigned_batches || [], isActive: row.is_active !== false, invitationStatus: row.invitation_status || 'pending', createdAt: row.created_at } };
    }
    const staffList = await this.getStaffMembers();
    const emailNorm = params.email.trim().toLowerCase();

    if (staffList.some(s => s.email.toLowerCase() === emailNorm)) {
      return { success: false, error: 'A staff member with this verified email already exists.' };
    }

    const currentYear = new Date().getFullYear();
    const count = staffList.length + 1;
    const staffIdCode = `QLI-STF-${currentYear}-${String(count).padStart(3, '0')}`;

    const newStaff: StaffMember = {
      id: 'stf-' + Date.now(),
      staffIdCode,
      fullName: params.fullName.trim(),
      email: emailNorm,
      phone: params.phone.trim(),
      designation: params.designation.trim() || 'Instructor',
      role: params.role,
      permissions: params.permissions,
      assignedCourses: params.assignedCourses,
      assignedBatches: params.assignedBatches,
      isActive: true,
      invitationStatus: 'active',
      createdAt: new Date().toISOString(),
    };

    staffList.push(newStaff);
    saveToStorage(STORAGE_KEYS.STAFF, staffList);

    // Simulated single-use invitation link (admin never sees or enters password)
    const inviteToken = Math.random().toString(36).substring(2, 12);
    const inviteLink = `${window.location.origin}${window.location.pathname}#invite?token=${inviteToken}&email=${encodeURIComponent(emailNorm)}`;

    await logAudit({
      entityType: 'STAFF',
      entityId: newStaff.id,
      action: 'CREATE',
      performedBy: params.adminName,
      performedByName: params.adminName,
      performedByRole: 'admin',
      details: {
        staffIdCode: newStaff.staffIdCode,
        fullName: newStaff.fullName,
        email: newStaff.email,
        designation: newStaff.designation,
      },
    });

    return { success: true, staff: newStaff, inviteLink };
  },

  async toggleStaffActive(staffId: string, adminName: string, reason?: string): Promise<{ success: boolean; error?: string }> {
    if (isSupabaseConfigured && supabase) {
      const { data: staff, error: readError } = await supabase.from('institute_staff').select('is_active,staff_id_code,full_name').eq('id', staffId).single();
      if (readError) return { success: false, error: readError.message };
      const nextActive = !staff.is_active;
      const { error } = await supabase.from('institute_staff').update({ is_active: nextActive, invitation_status: nextActive ? 'active' : 'revoked', updated_at: new Date().toISOString() }).eq('id', staffId);
      if (error) return { success: false, error: error.message };
      await logAudit({ entityType: 'STAFF', entityId: staffId, action: nextActive ? 'RESTORE' : 'REVOKE', performedBy: adminName, performedByName: adminName, performedByRole: 'admin', reason, details: { staffIdCode: staff.staff_id_code, fullName: staff.full_name, isActive: nextActive } });
      return { success: true };
    }
    const staffList = await this.getStaffMembers();
    const staff = staffList.find(s => s.id === staffId);
    if (!staff) return { success: false, error: 'Staff member not found.' };

    staff.isActive = !staff.isActive;
    saveToStorage(STORAGE_KEYS.STAFF, staffList);

    await logAudit({
      entityType: 'STAFF',
      entityId: staff.id,
      action: staff.isActive ? 'RESTORE' : 'REVOKE',
      performedBy: adminName,
      performedByName: adminName,
      performedByRole: 'admin',
      reason: reason || (staff.isActive ? 'Reactivated staff privileges' : 'Deactivated staff access'),
      details: { staffIdCode: staff.staffIdCode, fullName: staff.fullName, isActive: staff.isActive },
    });

    return { success: true };
  },

  async updateStaffPermissions(
    staffId: string, 
    permissions: string[], 
    assignedCourses: string[], 
    assignedBatches: string[], 
    adminName: string
  ): Promise<{ success: boolean; error?: string }> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('institute_staff').update({ permissions, assigned_courses: assignedCourses, assigned_batches: assignedBatches, updated_at: new Date().toISOString() }).eq('id', staffId);
      if (error) return { success: false, error: error.message };
      await logAudit({ entityType: 'STAFF', entityId: staffId, action: 'UPDATE', performedBy: adminName, performedByName: adminName, performedByRole: 'admin', details: { permissions, assignedCourses, assignedBatches } });
      return { success: true };
    }
    const staffList = await this.getStaffMembers();
    const staff = staffList.find(s => s.id === staffId);
    if (!staff) return { success: false, error: 'Staff member not found.' };

    staff.permissions = permissions;
    staff.assignedCourses = assignedCourses;
    staff.assignedBatches = assignedBatches;
    saveToStorage(STORAGE_KEYS.STAFF, staffList);

    await logAudit({
      entityType: 'STAFF',
      entityId: staff.id,
      action: 'UPDATE',
      performedBy: adminName,
      performedByName: adminName,
      performedByRole: 'admin',
      details: { staffIdCode: staff.staffIdCode, permissions, assignedCourses, assignedBatches },
    });

    return { success: true };
  },

  // ------------------------------------------------------------------
  // 4. STUDENT MANAGEMENT (Admissions, Rosters & Access)
  // ------------------------------------------------------------------
  async getStudentProfiles(): Promise<StudentProfile[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('student_profiles')
          .select('*')
          .order('full_name', { ascending: true });

        if (!error && data) {
          return data.map((d: any) => ({
            id: d.id,
            userId: d.user_id,
            studentIdCode: d.student_id_code,
            fullName: d.full_name,
            email: d.email,
            phone: d.phone,
            enrolledCourse: d.enrolled_course_name || d.enrolled_course,
            enrolledCourseId: d.enrolled_course_id,
            batchId: d.batch_id,
            batchCode: d.batch_code,
            admissionDate: d.admission_date,
            enrolmentStatus: d.enrolment_status || 'active',
            isPortalActive: d.is_portal_active !== false,
          }));
        }
        if (error) throw error;
      } catch (err) {
        console.error('Could not load students from Supabase:', err);
        throw err;
      }
    }
    return loadFromStorage<StudentProfile[]>(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
  },

  async registerStudent(params: {
    fullName: string;
    email: string;
    phone: string;
    courseId: string;
    courseName: string;
    batchId?: string;
    batchCode?: string;
    admissionDate?: string;
    operatorName: string;
    operatorRole: string;
  }): Promise<{ success: boolean; student?: StudentProfile; error?: string; inviteLink?: string }> {
    if (isSupabaseConfigured && supabase) {
      const studentIdCode = `QLI-STU-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
      const { data, error } = await supabase.functions.invoke('invite-user', {
        body: { kind: 'student', fullName: params.fullName.trim(), email: params.email.trim().toLowerCase(), phone: params.phone.trim(), courseId: params.courseId, courseName: params.courseName, batchId: params.batchId || null, batchCode: params.batchCode || null, admissionDate: params.admissionDate || new Date().toISOString().slice(0, 10), operatorName: params.operatorName, studentIdCode },
      });
      if (error || !data?.student) return { success: false, error: error?.message || data?.error || 'Could not invite this student.' };
      const row = data.student;
      return { success: true, student: { id: row.id, userId: row.user_id || undefined, studentIdCode: row.student_id_code, fullName: row.full_name, email: row.email, phone: row.phone || '', enrolledCourse: row.enrolled_course_name || '', enrolledCourseId: row.enrolled_course_id || undefined, batchId: row.batch_id || undefined, batchCode: row.batch_code || undefined, admissionDate: row.admission_date, enrolmentStatus: row.enrolment_status || 'active', isPortalActive: row.is_portal_active !== false, invitationStatus: row.invitation_status || 'pending' } };
    }
    const students = await this.getStudentProfiles();
    const emailNorm = params.email.trim().toLowerCase();

    if (students.some(s => s.email.toLowerCase() === emailNorm)) {
      return { success: false, error: 'A student profile with this email address already exists.' };
    }

    const currentYear = new Date().getFullYear();
    const count = students.length + 1;
    const studentIdCode = `QLI-STU-${currentYear}-${String(count).padStart(3, '0')}`;

    const newStudent: StudentProfile = {
      id: 'stu-' + Date.now(),
      studentIdCode,
      fullName: params.fullName.trim(),
      email: emailNorm,
      phone: params.phone.trim(),
      enrolledCourse: params.courseName,
      enrolledCourseId: params.courseId,
      batchId: params.batchId,
      batchCode: params.batchCode,
      admissionDate: params.admissionDate || new Date().toISOString().split('T')[0],
      enrolmentStatus: 'active',
      isPortalActive: true,
      invitationStatus: 'active',
    };

    students.unshift(newStudent);
    saveToStorage(STORAGE_KEYS.STUDENTS, students);

    // Auto-create sample student initial attendance record
    const attendance = loadFromStorage<AttendanceRecord[]>(STORAGE_KEYS.ATTENDANCE_STUDENT, INITIAL_ATTENDANCE);
    attendance.unshift({
      id: 'att-' + Date.now(),
      personType: 'student',
      personId: newStudent.id,
      personName: newStudent.fullName,
      identifierCode: newStudent.studentIdCode,
      courseOrDept: newStudent.enrolledCourse,
      batchId: newStudent.batchId,
      batchCode: newStudent.batchCode,
      date: newStudent.admissionDate,
      sessionName: 'morning',
      status: 'present',
      markedBy: params.operatorName,
      markedAt: new Date().toISOString(),
    });
    saveToStorage(STORAGE_KEYS.ATTENDANCE_STUDENT, attendance);

    const inviteToken = Math.random().toString(36).substring(2, 10);
    const inviteLink = `${window.location.origin}${window.location.pathname}#setup-student?token=${inviteToken}&roll=${encodeURIComponent(studentIdCode)}`;

    await logAudit({
      entityType: 'STUDENT',
      entityId: newStudent.id,
      action: 'CREATE',
      performedBy: params.operatorName,
      performedByName: params.operatorName,
      performedByRole: params.operatorRole,
      details: {
        studentIdCode: newStudent.studentIdCode,
        fullName: newStudent.fullName,
        course: newStudent.enrolledCourse,
        batch: newStudent.batchCode,
      },
    });

    return { success: true, student: newStudent, inviteLink };
  },

  async updateStudentProfile(
    studentId: string,
    updates: Partial<StudentProfile>,
    reason: string,
    operatorName: string,
    operatorRole: string
  ): Promise<{ success: boolean; error?: string }> {
    if (isSupabaseConfigured && supabase) {
      const row: Record<string, unknown> = {};
      if (updates.fullName !== undefined) row.full_name = updates.fullName;
      if (updates.email !== undefined) row.email = updates.email.trim().toLowerCase();
      if (updates.phone !== undefined) row.phone = updates.phone;
      if (updates.enrolledCourse !== undefined) row.enrolled_course_name = updates.enrolledCourse;
      if (updates.enrolledCourseId !== undefined) row.enrolled_course_id = updates.enrolledCourseId || null;
      if (updates.batchId !== undefined) row.batch_id = updates.batchId || null;
      if (updates.batchCode !== undefined) row.batch_code = updates.batchCode || null;
      if (updates.enrolmentStatus !== undefined) row.enrolment_status = updates.enrolmentStatus;
      if (updates.isPortalActive !== undefined) row.is_portal_active = updates.isPortalActive;
      row.updated_at = new Date().toISOString();
      const { error } = await supabase.from('student_profiles').update(row).eq('id', studentId);
      if (error) return { success: false, error: error.message };
      await logAudit({ entityType: 'STUDENT', entityId: studentId, action: 'CORRECTION', performedBy: operatorName, performedByName: operatorName, performedByRole: operatorRole, reason, details: { updates } });
      return { success: true };
    }
    const students = await this.getStudentProfiles();
    const index = students.findIndex(s => s.id === studentId);
    if (index === -1) return { success: false, error: 'Student not found.' };

    const before = { ...students[index] };
    students[index] = { ...students[index], ...updates };
    saveToStorage(STORAGE_KEYS.STUDENTS, students);

    await logAudit({
      entityType: 'STUDENT',
      entityId: studentId,
      action: 'CORRECTION',
      performedBy: operatorName,
      performedByName: operatorName,
      performedByRole: operatorRole,
      reason: reason || 'Authorized profile correction',
      details: { before, after: students[index] },
    });

    return { success: true };
  },

  async toggleStudentPortalAccess(
    studentId: string,
    operatorName: string,
    reason: string
  ): Promise<{ success: boolean; error?: string }> {
    if (isSupabaseConfigured && supabase) {
      const { data, error: readError } = await supabase.from('student_profiles').select('is_portal_active,student_id_code').eq('id', studentId).single();
      if (readError) return { success: false, error: readError.message };
      const nextActive = !data.is_portal_active;
      const { error } = await supabase.from('student_profiles').update({ is_portal_active: nextActive, updated_at: new Date().toISOString() }).eq('id', studentId);
      if (error) return { success: false, error: error.message };
      await logAudit({ entityType: 'STUDENT', entityId: studentId, action: nextActive ? 'RESTORE' : 'REVOKE', performedBy: operatorName, performedByName: operatorName, performedByRole: 'admin', reason, details: { studentIdCode: data.student_id_code, isPortalActive: nextActive } });
      return { success: true };
    }
    const students = await this.getStudentProfiles();
    const student = students.find(s => s.id === studentId);
    if (!student) return { success: false, error: 'Student not found.' };

    student.isPortalActive = !student.isPortalActive;
    saveToStorage(STORAGE_KEYS.STUDENTS, students);

    await logAudit({
      entityType: 'STUDENT',
      entityId: student.id,
      action: student.isPortalActive ? 'RESTORE' : 'REVOKE',
      performedBy: operatorName,
      performedByName: operatorName,
      performedByRole: 'admin',
      reason,
      details: { studentIdCode: student.studentIdCode, isPortalActive: student.isPortalActive },
    });

    return { success: true };
  },

  // ------------------------------------------------------------------
  // 5. ATTENDANCE MANAGEMENT (Student & Staff with Duplicate Prevention)
  // ------------------------------------------------------------------
  async getAllAttendance(personType?: PersonType): Promise<AttendanceRecord[]> {
    if (isSupabaseConfigured && supabase) {
      const loadStudents = personType !== 'staff';
      const loadStaff = personType !== 'student';
      const result: AttendanceRecord[] = [];
      if (loadStudents) {
        const { data, error } = await supabase.from('student_attendance').select('*, student_profiles(full_name, student_id_code, enrolled_course_name), batches(batch_code), institute_staff(full_name)').order('attendance_date', { ascending: false });
        if (error) throw error;
        for (const row of data || []) result.push({ id: row.id, personType: 'student', personId: row.student_id, personName: row.student_profiles?.full_name || '', identifierCode: row.student_profiles?.student_id_code || '', courseOrDept: row.student_profiles?.enrolled_course_name || '', batchId: row.batch_id || undefined, batchCode: row.batches?.batch_code || '', date: row.attendance_date, sessionName: row.session_name || 'default', status: row.status, reason: row.reason || undefined, markedBy: row.institute_staff?.full_name || '', markedAt: row.created_at, correctionHistory: row.correction_history || [] });
      }
      if (loadStaff) {
        const { data, error } = await supabase.from('staff_attendance').select('*, institute_staff(full_name, staff_id_code, designation)').order('attendance_date', { ascending: false });
        if (error) throw error;
        for (const row of data || []) result.push({ id: row.id, personType: 'staff', personId: row.staff_id, personName: row.institute_staff?.full_name || '', identifierCode: row.institute_staff?.staff_id_code || '', courseOrDept: row.institute_staff?.designation || '', date: row.attendance_date, sessionName: 'default', status: row.status, punchInTime: row.punch_in_time || undefined, punchOutTime: row.punch_out_time || undefined, reason: row.reason || undefined, markedBy: '', markedAt: row.created_at, correctionHistory: row.correction_history || [] });
      }
      return result.sort((a, b) => b.date.localeCompare(a.date));
    }
    const studentList = loadFromStorage<AttendanceRecord[]>(STORAGE_KEYS.ATTENDANCE_STUDENT, INITIAL_ATTENDANCE);
    if (!personType) return studentList;
    return studentList.filter(a => a.personType === personType);
  },

  async markAttendanceSession(params: {
    personType: PersonType;
    date: string; // YYYY-MM-DD
    sessionName?: string;
    records: Array<{
      personId: string;
      personName: string;
      identifierCode: string;
      courseOrDept: string;
      batchId?: string;
      batchCode?: string;
      status: AttendanceStatus;
      reason?: string;
    }>;
    markedBy: string;
    markedByRole: string;
  }): Promise<{ success: boolean; count: number; error?: string }> {
    if (isSupabaseConfigured && supabase) {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) return { success: false, count: 0, error: 'Sign in before marking attendance.' };
      const { data: staff, error: staffError } = await supabase.from('institute_staff').select('id').eq('user_id', authData.user.id).maybeSingle();
      if (staffError || !staff) return { success: false, count: 0, error: 'Your staff roster record was not found.' };
      const sessionName = params.sessionName || 'default';
      if (params.personType === 'student') {
        const rows = params.records.map(item => ({ student_id: item.personId, batch_id: item.batchId || null, attendance_date: params.date, session_name: sessionName, status: item.status, reason: item.reason || null, marked_by_staff_id: staff.id, updated_at: new Date().toISOString() }));
        if (rows.length) {
          const { error } = await supabase.from('student_attendance').upsert(rows, { onConflict: 'student_id,attendance_date,session_name' });
          if (error) return { success: false, count: 0, error: error.message };
        }
      } else {
        const rows = params.records.map(item => ({ staff_id: item.personId, attendance_date: params.date, status: item.status, reason: item.reason || null, updated_at: new Date().toISOString() }));
        if (rows.length) {
          const { error } = await supabase.from('staff_attendance').upsert(rows, { onConflict: 'staff_id,attendance_date' });
          if (error) return { success: false, count: 0, error: error.message };
        }
      }
      await logAudit({ entityType: 'ATTENDANCE', entityId: `${params.personType}_${params.date}_${sessionName}`, action: 'UPDATE', performedBy: params.markedBy, performedByName: params.markedBy, performedByRole: params.markedByRole, details: { date: params.date, sessionName, totalUpdated: params.records.length } });
      return { success: true, count: params.records.length };
    }
    const list = loadFromStorage<AttendanceRecord[]>(STORAGE_KEYS.ATTENDANCE_STUDENT, INITIAL_ATTENDANCE);
    const sessionName = params.sessionName || 'default';
    let savedCount = 0;

    for (const item of params.records) {
      // Prevent duplicate attendance for the same person on the same date and session
      const existingIdx = list.findIndex(
        a => a.personId === item.personId && a.date === params.date && (a.sessionName || 'default') === sessionName
      );

      if (existingIdx !== -1) {
        // Update existing with correction audit if status changed
        const existing = list[existingIdx];
        if (existing.status !== item.status) {
          const correction = {
            correctedAt: new Date().toISOString(),
            correctedBy: params.markedBy,
            oldStatus: existing.status,
            newStatus: item.status,
            reason: item.reason || 'Session attendance overwrite / re-mark',
          };
          existing.correctionHistory = existing.correctionHistory || [];
          existing.correctionHistory.push(correction);
          existing.status = item.status;
          existing.reason = item.reason;
          existing.markedAt = new Date().toISOString();
        }
      } else {
        const newRecord: AttendanceRecord = {
          id: 'att-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          personType: params.personType,
          personId: item.personId,
          personName: item.personName,
          identifierCode: item.identifierCode,
          courseOrDept: item.courseOrDept,
          batchId: item.batchId,
          batchCode: item.batchCode,
          date: params.date,
          sessionName,
          status: item.status,
          reason: item.reason,
          markedBy: params.markedBy,
          markedAt: new Date().toISOString(),
        };
        list.unshift(newRecord);
        savedCount++;
      }
    }

    saveToStorage(STORAGE_KEYS.ATTENDANCE_STUDENT, list);

    await logAudit({
      entityType: 'ATTENDANCE',
      entityId: `${params.personType}_${params.date}_${sessionName}`,
      action: 'UPDATE',
      performedBy: params.markedBy,
      performedByName: params.markedBy,
      performedByRole: params.markedByRole,
      details: {
        date: params.date,
        sessionName,
        totalUpdated: params.records.length,
      },
    });

    return { success: true, count: savedCount };
  },

  async correctAttendanceRecord(params: {
    recordId: string;
    newStatus: AttendanceStatus;
    reason: string;
    correctedBy: string;
    correctedByRole: string;
  }): Promise<{ success: boolean; error?: string }> {
    if (!params.reason.trim()) {
      return { success: false, error: 'A mandatory justification reason must be provided for attendance correction.' };
    }

    if (isSupabaseConfigured && supabase) {
      const { data: studentRec } = await supabase.from('student_attendance').select('*').eq('id', params.recordId).maybeSingle();
      const { data: staffRec } = studentRec ? { data: null } : await supabase.from('staff_attendance').select('*').eq('id', params.recordId).maybeSingle();
      const current = studentRec || staffRec;
      if (!current) return { success: false, error: 'Attendance record not found.' };
      const table = studentRec ? 'student_attendance' : 'staff_attendance';
      const oldStatus = current.status as AttendanceStatus;
      const history = Array.isArray(current.correction_history) ? current.correction_history : [];
      const { error } = await supabase.from(table).update({ status: params.newStatus, reason: params.reason.trim(), correction_history: [...history, { correctedAt: new Date().toISOString(), correctedBy: params.correctedBy, oldStatus, newStatus: params.newStatus, reason: params.reason.trim() }], updated_at: new Date().toISOString() }).eq('id', params.recordId);
      if (error) return { success: false, error: error.message };
      await logAudit({ entityType: 'ATTENDANCE', entityId: params.recordId, action: 'CORRECTION', performedBy: params.correctedBy, performedByName: params.correctedBy, performedByRole: params.correctedByRole, reason: params.reason, details: { oldStatus, newStatus: params.newStatus } });
      return { success: true };
    }
    const list = loadFromStorage<AttendanceRecord[]>(STORAGE_KEYS.ATTENDANCE_STUDENT, INITIAL_ATTENDANCE);
    const rec = list.find(a => a.id === params.recordId);
    if (!rec) return { success: false, error: 'Attendance record not found.' };

    const oldStatus = rec.status;
    rec.status = params.newStatus;
    rec.correctionHistory = rec.correctionHistory || [];
    rec.correctionHistory.push({
      correctedAt: new Date().toISOString(),
      correctedBy: params.correctedBy,
      oldStatus,
      newStatus: params.newStatus,
      reason: params.reason.trim(),
    });

    saveToStorage(STORAGE_KEYS.ATTENDANCE_STUDENT, list);

    await logAudit({
      entityType: 'ATTENDANCE',
      entityId: rec.id,
      action: 'CORRECTION',
      performedBy: params.correctedBy,
      performedByName: params.correctedBy,
      performedByRole: params.correctedByRole,
      reason: params.reason,
      details: {
        identifierCode: rec.identifierCode,
        personName: rec.personName,
        date: rec.date,
        oldStatus,
        newStatus: params.newStatus,
      },
    });

    return { success: true };
  },

  exportAttendanceCsv(records: AttendanceRecord[]): string {
    const headers = ['Record ID', 'Type', 'Identifier Code', 'Name', 'Course/Department', 'Batch', 'Date', 'Session', 'Status', 'Reason', 'Marked By', 'Marked At'];
    const rows = records.map(r => [
      `"${r.id}"`,
      `"${r.personType}"`,
      `"${r.identifierCode}"`,
      `"${r.personName.replace(/"/g, '""')}"`,
      `"${r.courseOrDept.replace(/"/g, '""')}"`,
      `"${r.batchCode || '-'}"`,
      `"${r.date}"`,
      `"${r.sessionName || 'default'}"`,
      `"${r.status.toUpperCase()}"`,
      `"${(r.reason || '').replace(/"/g, '""')}"`,
      `"${r.markedBy.replace(/"/g, '""')}"`,
      `"${r.markedAt}"`,
    ]);
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  },

  // ------------------------------------------------------------------
  // 6. ASSESSMENTS, MARKS & MARKSHEETS
  // ------------------------------------------------------------------
  async getAssessments(): Promise<AssessmentItem[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('assessments').select('*, courses(name), batches(batch_code)').order('assessment_date', { ascending: false });
      if (error) throw error;
      return (data || []).map((row: any) => ({ id: row.id, title: row.title, courseId: row.course_id, courseName: row.courses?.name || '', batchId: row.batch_id || undefined, batchCode: row.batches?.batch_code || undefined, maxScore: Number(row.max_score), passingScore: Number(row.passing_score), assessmentDate: row.assessment_date, status: row.status, createdBy: row.created_by || '', approvedBy: row.approved_by || undefined, createdAt: row.created_at }));
    }
    return loadFromStorage<AssessmentItem[]>(STORAGE_KEYS.ASSESSMENTS, INITIAL_ASSESSMENTS);
  },

  async createAssessment(params: {
    title: string;
    courseId: string;
    courseName: string;
    batchId?: string;
    batchCode?: string;
    maxScore: number;
    passingScore: number;
    assessmentDate: string;
    creatorName: string;
  }): Promise<{ success: boolean; assessment?: AssessmentItem; error?: string }> {
    if (!params.title.trim()) return { success: false, error: 'Assessment title is required.' };
    if (params.maxScore <= 0) return { success: false, error: 'Maximum score must be greater than 0.' };

    if (isSupabaseConfigured && supabase) {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) return { success: false, error: 'Sign in before creating an assessment.' };
      const { data: staff, error: staffError } = await supabase.from('institute_staff').select('id').eq('user_id', authData.user.id).single();
      if (staffError) return { success: false, error: staffError.message };
      const { data, error } = await supabase.from('assessments').insert({ title: params.title.trim(), course_id: params.courseId || null, batch_id: params.batchId || null, max_score: params.maxScore, passing_score: params.passingScore, assessment_date: params.assessmentDate, status: 'draft', created_by: staff.id }).select('*, courses(name), batches(batch_code)').single();
      if (error) return { success: false, error: error.message };
      return { success: true, assessment: { id: data.id, title: data.title, courseId: data.course_id, courseName: data.courses?.name || params.courseName, batchId: data.batch_id || undefined, batchCode: data.batches?.batch_code || params.batchCode, maxScore: Number(data.max_score), passingScore: Number(data.passing_score), assessmentDate: data.assessment_date, status: data.status, createdBy: params.creatorName, createdAt: data.created_at } };
    }

    const list = await this.getAssessments();
    const newAsm: AssessmentItem = {
      id: 'asm-' + Date.now(),
      title: params.title.trim(),
      courseId: params.courseId,
      courseName: params.courseName,
      batchId: params.batchId,
      batchCode: params.batchCode,
      maxScore: params.maxScore,
      passingScore: params.passingScore,
      assessmentDate: params.assessmentDate,
      status: 'draft',
      createdBy: params.creatorName,
      createdAt: new Date().toISOString(),
    };

    list.unshift(newAsm);
    saveToStorage(STORAGE_KEYS.ASSESSMENTS, list);

    return { success: true, assessment: newAsm };
  },

  async getMarksForAssessment(assessmentId: string): Promise<StudentMarkRecord[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('student_marks').select('*, student_profiles(full_name,student_id_code)').eq('assessment_id', assessmentId).order('updated_at', { ascending: false });
      if (error) throw error;
      return (data || []).map((row: any) => ({ id: row.id, assessmentId: row.assessment_id, studentId: row.student_id, studentIdCode: row.student_profiles?.student_id_code || '', studentName: row.student_profiles?.full_name || '', marksObtained: Number(row.marks_obtained), maxScore: Number(row.max_score), percentage: Number(row.percentage), grade: row.grade || '', remarks: row.remarks || undefined, status: row.status, enteredBy: row.entered_by || '', approvedBy: row.approved_by || undefined, updatedAt: row.updated_at }));
    }
    const list = loadFromStorage<StudentMarkRecord[]>(STORAGE_KEYS.MARKS, INITIAL_MARKS);
    return list.filter(m => m.assessmentId === assessmentId);
  },

  async saveStudentMarks(params: {
    assessmentId: string;
    marksList: Array<{
      studentId: string;
      studentIdCode: string;
      studentName: string;
      marksObtained: number;
      remarks?: string;
    }>;
    maxScore: number;
    status: ApprovalStatus;
    enteredBy: string;
  }): Promise<{ success: boolean; error?: string }> {
    // Validate marks against maximum score
    for (const m of params.marksList) {
      if (m.marksObtained < 0 || m.marksObtained > params.maxScore) {
        return {
          success: false,
          error: `Marks for ${m.studentName} (${m.marksObtained}) exceed maximum valid score of ${params.maxScore}.`,
        };
      }
    }

    if (isSupabaseConfigured && supabase) {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) return { success: false, error: 'Sign in before entering marks.' };
      const { data: staff, error: staffError } = await supabase.from('institute_staff').select('id').eq('user_id', authData.user.id).single();
      if (staffError) return { success: false, error: staffError.message };
      const rows = params.marksList.map(m => {
        const percentage = Math.round((m.marksObtained / params.maxScore) * 100 * 100) / 100;
        const grade = percentage >= 85 ? 'Distinction (A+)' : percentage >= 70 ? 'Grade A' : percentage >= 55 ? 'Grade B' : percentage >= 40 ? 'Grade C' : 'F';
        return { assessment_id: params.assessmentId, student_id: m.studentId, marks_obtained: m.marksObtained, max_score: params.maxScore, grade, remarks: m.remarks || null, status: params.status, entered_by: staff.id, updated_at: new Date().toISOString() };
      });
      if (rows.length) {
        const { error } = await supabase.from('student_marks').upsert(rows, { onConflict: 'assessment_id,student_id' });
        if (error) return { success: false, error: error.message };
      }
      const { error: assessmentError } = await supabase.from('assessments').update({ status: params.status, updated_at: new Date().toISOString() }).eq('id', params.assessmentId);
      if (assessmentError) return { success: false, error: assessmentError.message };
      return { success: true };
    }

    const allMarks = loadFromStorage<StudentMarkRecord[]>(STORAGE_KEYS.MARKS, INITIAL_MARKS);

    for (const m of params.marksList) {
      const percentage = Math.round((m.marksObtained / params.maxScore) * 100 * 10) / 10;
      let grade = 'F';
      if (percentage >= 85) grade = 'Distinction (A+)';
      else if (percentage >= 70) grade = 'Grade A';
      else if (percentage >= 55) grade = 'Grade B';
      else if (percentage >= 40) grade = 'Grade C';

      const existingIdx = allMarks.findIndex(
        x => x.assessmentId === params.assessmentId && x.studentId === m.studentId
      );

      const record: StudentMarkRecord = {
        id: existingIdx !== -1 ? allMarks[existingIdx].id : 'mrk-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
        assessmentId: params.assessmentId,
        studentId: m.studentId,
        studentIdCode: m.studentIdCode,
        studentName: m.studentName,
        marksObtained: m.marksObtained,
        maxScore: params.maxScore,
        percentage,
        grade,
        remarks: m.remarks,
        status: params.status,
        enteredBy: params.enteredBy,
        updatedAt: new Date().toISOString(),
      };

      if (existingIdx !== -1) {
        allMarks[existingIdx] = record;
      } else {
        allMarks.push(record);
      }
    }

    saveToStorage(STORAGE_KEYS.MARKS, allMarks);

    // Update assessment status
    const assessments = await this.getAssessments();
    const asm = assessments.find(a => a.id === params.assessmentId);
    if (asm) {
      asm.status = params.status;
      saveToStorage(STORAGE_KEYS.ASSESSMENTS, assessments);
    }

    return { success: true };
  },

  async approveAssessmentMarks(assessmentId: string, adminName: string): Promise<{ success: boolean }> {
    if (isSupabaseConfigured && supabase) {
      const { data: authData } = await supabase.auth.getUser();
      const { data: staff } = authData.user ? await supabase.from('institute_staff').select('id').eq('user_id', authData.user.id).single() : { data: null };
      const { error: assessmentError } = await supabase.from('assessments').update({ status: 'published', approved_by: staff?.id || null, updated_at: new Date().toISOString() }).eq('id', assessmentId);
      if (assessmentError) throw assessmentError;
      const { error: marksError } = await supabase.from('student_marks').update({ status: 'published', approved_by: staff?.id || null, updated_at: new Date().toISOString() }).eq('assessment_id', assessmentId);
      if (marksError) throw marksError;
      await logAudit({ entityType: 'MARKS', entityId: assessmentId, action: 'APPROVE', performedBy: adminName, performedByName: adminName, performedByRole: 'admin', details: {} });
      return { success: true };
    }
    const assessments = await this.getAssessments();
    const asm = assessments.find(a => a.id === assessmentId);
    if (asm) {
      asm.status = 'published';
      asm.approvedBy = adminName;
      saveToStorage(STORAGE_KEYS.ASSESSMENTS, assessments);
    }

    const marks = loadFromStorage<StudentMarkRecord[]>(STORAGE_KEYS.MARKS, INITIAL_MARKS);
    marks.forEach(m => {
      if (m.assessmentId === assessmentId) {
        m.status = 'published';
        m.approvedBy = adminName;
      }
    });
    saveToStorage(STORAGE_KEYS.MARKS, marks);

    await logAudit({
      entityType: 'MARKS',
      entityId: assessmentId,
      action: 'APPROVE',
      performedBy: adminName,
      performedByName: adminName,
      performedByRole: 'admin',
      details: { assessmentTitle: asm?.title },
    });

    return { success: true };
  },

  async getStudentPublishedMarks(studentId: string): Promise<StudentMarkRecord[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('student_marks').select('*, student_profiles(full_name,student_id_code)').eq('student_id', studentId).eq('status', 'published').order('updated_at', { ascending: false });
      if (error) throw error;
      return (data || []).map((row: any) => ({ id: row.id, assessmentId: row.assessment_id, studentId: row.student_id, studentIdCode: row.student_profiles?.student_id_code || '', studentName: row.student_profiles?.full_name || '', marksObtained: Number(row.marks_obtained), maxScore: Number(row.max_score), percentage: Number(row.percentage), grade: row.grade || '', remarks: row.remarks || undefined, status: row.status, enteredBy: row.entered_by || '', approvedBy: row.approved_by || undefined, updatedAt: row.updated_at }));
    }
    const list = loadFromStorage<StudentMarkRecord[]>(STORAGE_KEYS.MARKS, INITIAL_MARKS);
    return list.filter(m => m.studentId === studentId && m.status === 'published');
  },

  // ------------------------------------------------------------------
  // 7. ACADEMIC DOCUMENTS & CERTIFICATES APPROVAL
  // ------------------------------------------------------------------
  async getAllDocumentsForStaff(): Promise<AcademicDocument[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('academic_documents').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map(mapAcademicDocument);
    }
    return loadFromStorage<AcademicDocument[]>(STORAGE_KEYS.DOCS, INITIAL_DOCUMENTS);
  },

  async getStudentDocuments(studentId: string): Promise<AcademicDocument[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('academic_documents').select('*').eq('student_id', studentId).eq('approval_status', 'approved').eq('status', 'valid').order('issue_date', { ascending: false });
      if (error) throw error;
      return (data || []).map(mapAcademicDocument);
    }
    const list = loadFromStorage<AcademicDocument[]>(STORAGE_KEYS.DOCS, INITIAL_DOCUMENTS);
    // Student only receives approved documents
    return list.filter(d => d.studentId === studentId && d.approvalStatus === 'approved');
  },

  async getNextCertificateNumber(courseName: string): Promise<string> {
    if (isSupabaseConfigured && supabase) {
      const currentYear = new Date().getFullYear();
      let courseCode = 'DCA';
      const lower = (courseName || '').toLowerCase();
      if (lower.includes('adca')) courseCode = 'ADCA';
      else if (lower.includes('tally')) courseCode = 'TLY';
      else if (lower.includes('pgdca')) courseCode = 'PGDCA';
      else if (lower.includes('dtp')) courseCode = 'DTP';
      const prefix = `QLI-${currentYear}-${courseCode}-`;
      const { count, error } = await supabase.from('academic_documents').select('id', { count: 'exact', head: true }).like('certificate_number', `${prefix}%`);
      if (error) throw error;
      return `${prefix}${1041 + (count || 0)}`;
    }
    const docs = loadFromStorage<AcademicDocument[]>(STORAGE_KEYS.DOCS, INITIAL_DOCUMENTS);
    const currentYear = new Date().getFullYear();
    let courseCode = 'DCA';
    const cLower = (courseName || '').toLowerCase();
    if (cLower.includes('adca')) courseCode = 'ADCA';
    else if (cLower.includes('tally')) courseCode = 'TLY';
    else if (cLower.includes('pgdca')) courseCode = 'PGDCA';
    else if (cLower.includes('dtp')) courseCode = 'DTP';

    const prefix = `QLI-${currentYear}-${courseCode}-`;
    const existingMatches = docs
      .map(d => d.certificateNumber)
      .filter(n => typeof n === 'string' && n.startsWith(prefix));

    const count = 1040 + existingMatches.length + 1;
    return `${prefix}${count}`;
  },

  async submitUnifiedExamEvaluation(params: {
    studentId: string;
    courseName: string;
    batchId?: string;
    batchCode?: string;
    assessmentTitle: string;
    examDate: string;
    maxScore: number;
    marksObtained: number;
    remarks?: string;
    certificateNumber?: string;
    issueDate?: string;
    answerSheetFile?: File | null;
    submittedBy: string;
    isAdmin?: boolean;
  }): Promise<{ 
    success: boolean; 
    document?: AcademicDocument; 
    assessment?: AssessmentItem; 
    marksRecord?: StudentMarkRecord; 
    error?: string 
  }> {
    if (!params.studentId) return { success: false, error: 'Student selection is required.' };
    if (!params.courseName.trim()) return { success: false, error: 'Course name is required.' };
    if (!params.assessmentTitle.trim()) return { success: false, error: 'Examination / Assessment title is required.' };
    if (params.maxScore <= 0) return { success: false, error: 'Maximum score must be greater than zero.' };
    if (params.marksObtained < 0 || params.marksObtained > params.maxScore) {
      return { success: false, error: `Marks obtained (${params.marksObtained}) must be between 0 and maximum marks (${params.maxScore}).` };
    }

    if (isSupabaseConfigured && supabase) {
      const marks = Math.max(0, Math.min(100, Number(params.marksObtained)));
      const certificateNumber = (params.certificateNumber || await this.getNextCertificateNumber(params.courseName)).trim().toUpperCase();
      let answerSheetPath: string | null = null;
      const answerFile = params.answerSheetFile;
      if (answerFile) {
        if (answerFile.size > 10 * 1024 * 1024) return { success: false, error: 'Answer sheet must be 10 MB or smaller.' };
        if (!['application/pdf', 'image/jpeg', 'image/png', 'image/webp'].includes(answerFile.type)) return { success: false, error: 'Answer sheet must be a PDF, JPG, PNG, or WebP file.' };
        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError || !authData.user) return { success: false, error: 'Sign in before submitting exam results.' };
        const safeName = answerFile.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-120);
        answerSheetPath = `answer-sheets/${params.studentId}/${crypto.randomUUID()}_${safeName}`;
        const { error: uploadError } = await supabase.storage.from('academic-documents').upload(answerSheetPath, answerFile, { contentType: answerFile.type, upsert: false });
        if (uploadError) return { success: false, error: uploadError.message };
      }
      const { data, error } = await supabase.rpc('submit_exam_evaluation', {
        p_student_id: params.studentId,
        p_course_name: params.courseName.trim(),
        p_batch_id: params.batchId || null,
        p_batch_code: params.batchCode || null,
        p_assessment_title: params.assessmentTitle.trim(),
        p_exam_date: params.examDate || new Date().toISOString().slice(0, 10),
        p_marks_obtained: marks,
        p_remarks: params.remarks?.trim() || null,
        p_certificate_number: certificateNumber,
        p_issue_date: params.issueDate || new Date().toISOString().slice(0, 10),
        p_answer_sheet_storage_path: answerSheetPath,
        p_answer_sheet_file_name: answerFile?.name || null,
        p_answer_sheet_mime_type: answerFile?.type || null,
      });
      if (error) {
        if (answerSheetPath) await supabase.storage.from('academic-documents').remove([answerSheetPath]);
        return { success: false, error: error.message };
      }
      const result = typeof data === 'string' ? JSON.parse(data) : data;
      const student = (await this.getStudentProfiles()).find(item => item.id === params.studentId);
      const document = mapAcademicDocument(result.document);
      const assessment: AssessmentItem = { id: result.assessment.id, title: result.assessment.title, courseId: result.assessment.course_id || student?.enrolledCourseId || '', courseName: params.courseName, batchId: result.assessment.batch_id || undefined, batchCode: params.batchCode || student?.batchCode, maxScore: Number(result.assessment.max_score), passingScore: Number(result.assessment.passing_score), assessmentDate: result.assessment.assessment_date, status: result.assessment.status, createdBy: params.submittedBy, createdAt: result.assessment.created_at };
      const marksRecord: StudentMarkRecord = { id: result.marksRecord.id, assessmentId: result.marksRecord.assessment_id, studentId: result.marksRecord.student_id, studentIdCode: student?.studentIdCode || '', studentName: student?.fullName || '', marksObtained: Number(result.marksRecord.marks_obtained), maxScore: Number(result.marksRecord.max_score), percentage: Number(result.marksRecord.percentage), grade: result.marksRecord.grade || '', remarks: result.marksRecord.remarks || undefined, status: result.marksRecord.status, enteredBy: params.submittedBy, updatedAt: result.marksRecord.updated_at, certificateNumber };
      return { success: true, document, assessment, marksRecord };
    }

    const students = await this.getStudentProfiles();
    const student = students.find(s => s.id === params.studentId);
    if (!student) return { success: false, error: 'Student record not found in institutional registry.' };

    // Enforce 100 Total Marks
    const maxScore = 100;
    const rawMarks = Math.max(0, Math.min(100, Number(params.marksObtained)));
    const percentage = Math.round(rawMarks * 10) / 10;
    const gradeInfo = computeGradeFrom100(rawMarks);
    const grade = gradeInfo.badge;

    // Portal auto-generates certificate number without staff input
    let certNo = (params.certificateNumber || '').trim().toUpperCase();
    if (!certNo) {
      certNo = await this.getNextCertificateNumber(params.courseName);
    }

    const docs = loadFromStorage<AcademicDocument[]>(STORAGE_KEYS.DOCS, INITIAL_DOCUMENTS);
    if (docs.some(d => d.certificateNumber.trim().toUpperCase() === certNo)) {
      certNo = `${certNo}-${Date.now().toString().slice(-3)}`;
    }
    const marksheetNo = `${certNo}-M`;

    // Process Answer Sheet File (PDF / Image) - Accessible ONLY to Staff and Admin
    let answerSheetDataUrl: string | undefined = undefined;
    let answerSheetFileName: string | undefined = undefined;
    let answerSheetMimeType: string | undefined = undefined;

    if (params.answerSheetFile) {
      try {
        answerSheetDataUrl = await readFileAsDataUrl(params.answerSheetFile);
        answerSheetFileName = params.answerSheetFile.name;
        answerSheetMimeType = params.answerSheetFile.type;
      } catch (err) {
        console.warn('Failed to parse answer sheet file:', err);
      }
    }

    const effectiveApproval: ApprovalStatus = params.isAdmin ? 'approved' : 'pending';
    const effectiveMarksStatus: ApprovalStatus = params.isAdmin ? 'published' : 'pending';

    // 1. Create Assessment Item
    const asmId = 'asm-' + Date.now();
    const newAsm: AssessmentItem = {
      id: asmId,
      title: params.assessmentTitle.trim(),
      courseId: student.enrolledCourseId || 'crs-dca',
      courseName: params.courseName,
      batchId: params.batchId || student.batchId,
      batchCode: params.batchCode || student.batchCode,
      maxScore: 100,
      passingScore: 40,
      assessmentDate: params.examDate || new Date().toISOString().split('T')[0],
      status: effectiveMarksStatus,
      createdBy: params.submittedBy,
      approvedBy: params.isAdmin ? params.submittedBy : undefined,
      createdAt: new Date().toISOString(),
    };

    const assessments = await this.getAssessments();
    assessments.unshift(newAsm);
    saveToStorage(STORAGE_KEYS.ASSESSMENTS, assessments);

    // 2. Create Student Mark Record
    const mrkId = 'mrk-' + Date.now();
    const newMrk: StudentMarkRecord = {
      id: mrkId,
      assessmentId: asmId,
      studentId: student.id,
      studentIdCode: student.studentIdCode,
      studentName: student.fullName,
      marksObtained: rawMarks,
      maxScore: 100,
      percentage,
      grade,
      remarks: params.remarks?.trim(),
      status: effectiveMarksStatus,
      enteredBy: params.submittedBy,
      approvedBy: params.isAdmin ? params.submittedBy : undefined,
      updatedAt: new Date().toISOString(),
      certificateNumber: certNo,
      answerSheetFileName,
      answerSheetFileData: answerSheetDataUrl,
    };

    const marks = loadFromStorage<StudentMarkRecord[]>(STORAGE_KEYS.MARKS, INITIAL_MARKS);
    marks.unshift(newMrk);
    saveToStorage(STORAGE_KEYS.MARKS, marks);

    // 3. Create Portal Generated Certificate Document
    const docId = 'doc-' + Date.now();
    const marksOrGradeStr = `${gradeInfo.badge} (${percentage}%) — ${rawMarks}/100 Marks`;

    const newDoc: AcademicDocument = {
      id: docId,
      studentId: student.id,
      studentIdCode: student.studentIdCode,
      studentFullName: student.fullName,
      documentType: 'certificate',
      certificateNumber: certNo,
      marksheetNumber: marksheetNo,
      courseName: params.courseName.trim(),
      issueDate: params.issueDate || new Date().toISOString().split('T')[0],
      marksOrGrade: marksOrGradeStr,
      marksObtained: rawMarks,
      maxScore: 100,
      percentage,
      grade: gradeInfo.grade,
      evaluatorRemarks: params.remarks?.trim(),
      batchCode: params.batchCode || student.batchCode,
      fileStoragePath: `academic-documents/${student.id}/${certNo}_generated.pdf`,
      fileName: `${student.fullName.replace(/\s+/g, '_')}_${certNo}_Certificate.pdf`,
      fileMimeType: 'application/pdf',
      fileSizeBytes: 245000,
      status: 'valid',
      approvalStatus: effectiveApproval,
      approvedBy: effectiveApproval === 'approved' ? params.submittedBy : undefined,
      approvedAt: effectiveApproval === 'approved' ? new Date().toISOString() : undefined,
      createdBy: 'stf-' + params.submittedBy.toLowerCase().replace(/\s+/g, '-'),
      createdByName: params.submittedBy,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPortalGenerated: true,
      assessmentId: asmId,
      assessmentTitle: params.assessmentTitle,
      examAnswerSheetFileName: answerSheetFileName,
      examAnswerSheetFileData: answerSheetDataUrl,
      examAnswerSheetMimeType: answerSheetMimeType,
    };

    // 4. Create Paired Marksheet Document with identical details & -M suffix
    const marksheetDocId = 'doc-m-' + Date.now();
    const marksheetDoc: AcademicDocument = {
      ...newDoc,
      id: marksheetDocId,
      documentType: 'marksheet',
      certificateNumber: certNo,
      marksheetNumber: marksheetNo,
      fileStoragePath: `academic-documents/${student.id}/${marksheetNo}_generated.pdf`,
      fileName: `${student.fullName.replace(/\s+/g, '_')}_${marksheetNo}_Marksheet.pdf`,
    };

    docs.unshift(newDoc);
    docs.unshift(marksheetDoc);
    saveToStorage(STORAGE_KEYS.DOCS, docs);

    // Audit logs
    await logAudit({
      entityType: 'MARKS',
      entityId: asmId,
      action: 'CREATE',
      performedBy: params.submittedBy,
      performedByName: params.submittedBy,
      performedByRole: params.isAdmin ? 'admin' : 'staff',
      details: {
        studentIdCode: student.studentIdCode,
        studentFullName: student.fullName,
        marksObtained: params.marksObtained,
        maxScore: params.maxScore,
        grade,
        certificateNumber: certNo,
        hasAnswerSheet: !!answerSheetDataUrl,
      },
    });

    await logAudit({
      entityType: 'DOCUMENT',
      entityId: docId,
      action: 'CREATE',
      performedBy: params.submittedBy,
      performedByName: params.submittedBy,
      performedByRole: params.isAdmin ? 'admin' : 'staff',
      details: {
        certificateNumber: certNo,
        studentFullName: student.fullName,
        courseName: params.courseName,
        approvalStatus: effectiveApproval,
        isPortalGenerated: true,
        hasAnswerSheet: !!answerSheetDataUrl,
      },
    });

    return {
      success: true,
      document: newDoc,
      assessment: newAsm,
      marksRecord: newMrk,
    };
  },

  async uploadAcademicDocument(params: {
    studentId: string;
    documentType: AcademicDocumentType;
    certificateNumber: string;
    courseName: string;
    issueDate: string;
    marksOrGrade?: string;
    file: File;
    staffName: string;
    approvalStatus?: ApprovalStatus;
    isAdmin?: boolean;
  }): Promise<{ success: boolean; error?: string; document?: AcademicDocument }> {
    const cleanCertNo = params.certificateNumber.trim().toUpperCase();

    if (!cleanCertNo) {
      return { success: false, error: 'Certificate or Marksheet registration number is required.' };
    }
    if (!params.courseName.trim()) {
      return { success: false, error: 'Course name is required.' };
    }

    if (isSupabaseConfigured && supabase) {
      if (params.file.size > 10 * 1024 * 1024) return { success: false, error: 'File must be 10 MB or smaller.' };
      if (!['application/pdf', 'image/jpeg', 'image/png', 'image/webp'].includes(params.file.type)) return { success: false, error: 'Upload a PDF, JPG, PNG, or WebP file.' };
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) return { success: false, error: 'Sign in before uploading an academic document.' };
      const { data: staff, error: staffError } = await supabase.from('institute_staff').select('id').eq('user_id', authData.user.id).single();
      if (staffError) return { success: false, error: 'An active staff roster record is required to upload documents.' };
      const students = await this.getStudentProfiles();
      const student = students.find(s => s.id === params.studentId);
      if (!student) return { success: false, error: 'Student not found in institute registry.' };
      const safeName = params.file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-120);
      const storagePath = `${student.id}/${crypto.randomUUID()}_${safeName}`;
      const { error: uploadError } = await supabase.storage.from('academic-documents').upload(storagePath, params.file, { contentType: params.file.type, upsert: false });
      if (uploadError) return { success: false, error: uploadError.message };
      const effectiveApproval: ApprovalStatus = params.isAdmin ? 'approved' : (params.approvalStatus || 'pending');
      const now = new Date().toISOString();
      const { data, error } = await supabase.from('academic_documents').insert({
        student_id: student.id, document_type: params.documentType, certificate_number: cleanCertNo,
        marksheet_number: params.documentType === 'marksheet' ? cleanCertNo : null,
        student_id_code: student.studentIdCode, student_full_name: student.fullName,
        course_name: params.courseName.trim(), issue_date: params.issueDate || now.slice(0, 10),
        marks_or_grade: params.marksOrGrade?.trim() || null, file_storage_path: storagePath,
        file_name: params.file.name, file_mime_type: params.file.type, file_size_bytes: params.file.size,
        status: 'valid', approval_status: effectiveApproval, approved_by_staff_id: params.isAdmin ? staff.id : null,
        approved_by_name: params.isAdmin ? params.staffName : null, approved_at: params.isAdmin ? now : null,
        created_by: authData.user.id, created_by_name: params.staffName,
      }).select('*').single();
      if (error) {
        await supabase.storage.from('academic-documents').remove([storagePath]);
        return { success: false, error: error.message };
      }
      const document = mapAcademicDocument(data);
      await logAudit({ entityType: 'DOCUMENT', entityId: document.id, action: 'CREATE', performedBy: params.staffName, performedByName: params.staffName, performedByRole: params.isAdmin ? 'admin' : 'staff', details: { certificateNumber: cleanCertNo, documentType: params.documentType, studentFullName: student.fullName, approvalStatus: effectiveApproval } });
      return { success: true, document };
    }

    const docs = loadFromStorage<AcademicDocument[]>(STORAGE_KEYS.DOCS, INITIAL_DOCUMENTS);
    if (docs.some(d => d.certificateNumber.trim().toUpperCase() === cleanCertNo)) {
      return { success: false, error: `Credential number "${cleanCertNo}" already exists in the authoritative registry.` };
    }

    const students = await this.getStudentProfiles();
    const student = students.find(s => s.id === params.studentId);
    if (!student) {
      return { success: false, error: 'Student not found in institute registry.' };
    }

    const fileDataUrl = await readFileAsDataUrl(params.file);
    const effectiveApproval: ApprovalStatus = params.isAdmin ? 'approved' : (params.approvalStatus || 'pending');

    const newDoc: AcademicDocument = {
      id: 'doc-' + Date.now(),
      studentId: student.id,
      studentIdCode: student.studentIdCode,
      studentFullName: student.fullName,
      documentType: params.documentType,
      certificateNumber: cleanCertNo,
      courseName: params.courseName.trim(),
      issueDate: params.issueDate || new Date().toISOString().split('T')[0],
      marksOrGrade: params.marksOrGrade?.trim(),
      fileStoragePath: `academic-documents/${student.id}/${cleanCertNo}_${params.file.name.replace(/\s+/g, '_')}`,
      fileName: params.file.name,
      fileMimeType: params.file.type,
      fileSizeBytes: params.file.size,
      status: 'valid',
      approvalStatus: effectiveApproval,
      approvedBy: effectiveApproval === 'approved' ? (params.isAdmin ? params.staffName : 'Institutional Admin') : undefined,
      approvedAt: effectiveApproval === 'approved' ? new Date().toISOString() : undefined,
      createdBy: 'stf-' + params.staffName.toLowerCase().replace(/\s+/g, '-'),
      createdByName: params.staffName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      localFileData: fileDataUrl,
    };

    docs.unshift(newDoc);
    saveToStorage(STORAGE_KEYS.DOCS, docs);

    await logAudit({
      entityType: 'DOCUMENT',
      entityId: newDoc.id,
      action: 'CREATE',
      performedBy: params.staffName,
      performedByName: params.staffName,
      performedByRole: params.isAdmin ? 'admin' : 'staff',
      details: {
        certificateNumber: newDoc.certificateNumber,
        documentType: newDoc.documentType,
        studentFullName: newDoc.studentFullName,
        approvalStatus: newDoc.approvalStatus,
      },
    });

    return { success: true, document: newDoc };
  },

  async approveDocument(docId: string, adminName: string): Promise<{ success: boolean; error?: string }> {
    if (isSupabaseConfigured && supabase) {
      const { data: authData } = await supabase.auth.getUser();
      const { data: staff } = authData.user ? await supabase.from('institute_staff').select('id').eq('user_id', authData.user.id).single() : { data: null };
      const { data: doc, error: readError } = await supabase.from('academic_documents').select('assessment_id,certificate_number').eq('id', docId).single();
      if (readError) return { success: false, error: readError.message };
      const now = new Date().toISOString();
      let documentUpdate = supabase.from('academic_documents').update({ approval_status: 'approved', approved_by_staff_id: staff?.id || null, approved_by_name: adminName, approved_at: now, updated_by: authData.user?.id || null, updated_at: now });
      documentUpdate = doc.assessment_id
        ? documentUpdate.eq('assessment_id', doc.assessment_id)
        : documentUpdate.eq('certificate_number', doc.certificate_number);
      const { error } = await documentUpdate;
      if (error) return { success: false, error: error.message };
      if (doc.assessment_id) {
        const { error: assessmentError } = await supabase.from('assessments').update({ status: 'published', approved_by: staff?.id || null, updated_at: now }).eq('id', doc.assessment_id);
        if (assessmentError) return { success: false, error: assessmentError.message };
        const { error: marksError } = await supabase.from('student_marks').update({ status: 'published', approved_by: staff?.id || null, updated_at: now }).eq('assessment_id', doc.assessment_id);
        if (marksError) return { success: false, error: marksError.message };
      }
      await logAudit({ entityType: 'DOCUMENT', entityId: docId, action: 'APPROVE', performedBy: adminName, performedByName: adminName, performedByRole: 'admin', details: { certificateNumber: doc.certificate_number } });
      return { success: true };
    }
    const docs = loadFromStorage<AcademicDocument[]>(STORAGE_KEYS.DOCS, INITIAL_DOCUMENTS);
    const doc = docs.find(d => d.id === docId);
    if (!doc) return { success: false, error: 'Document not found.' };

    doc.approvalStatus = 'approved';
    doc.approvedBy = adminName;
    doc.approvedAt = new Date().toISOString();
    doc.updatedAt = new Date().toISOString();
    doc.updatedBy = adminName;
    saveToStorage(STORAGE_KEYS.DOCS, docs);

    // Synchronize linked assessment and marks
    if (doc.assessmentId) {
      const assessments = await this.getAssessments();
      const asm = assessments.find(a => a.id === doc.assessmentId);
      if (asm) {
        asm.status = 'published';
        asm.approvedBy = adminName;
        saveToStorage(STORAGE_KEYS.ASSESSMENTS, assessments);
      }
    }

    const marks = loadFromStorage<StudentMarkRecord[]>(STORAGE_KEYS.MARKS, INITIAL_MARKS);
    let marksChanged = false;
    marks.forEach(m => {
      if ((doc.assessmentId && m.assessmentId === doc.assessmentId) || m.certificateNumber === doc.certificateNumber) {
        m.status = 'published';
        m.approvedBy = adminName;
        marksChanged = true;
      }
    });
    if (marksChanged) {
      saveToStorage(STORAGE_KEYS.MARKS, marks);
    }

    await logAudit({
      entityType: 'DOCUMENT',
      entityId: doc.id,
      action: 'APPROVE',
      performedBy: adminName,
      performedByName: adminName,
      performedByRole: 'admin',
      details: { certificateNumber: doc.certificateNumber },
    });

    return { success: true };
  },

  async rejectDocument(docId: string, reason: string, adminName: string): Promise<{ success: boolean; error?: string }> {
    if (!reason.trim()) return { success: false, error: 'Rejection reason is mandatory.' };

    if (isSupabaseConfigured && supabase) {
      const { data: authData } = await supabase.auth.getUser();
      const { error } = await supabase.from('academic_documents').update({ approval_status: 'rejected', rejection_reason: reason.trim(), updated_by: authData.user?.id || null, updated_at: new Date().toISOString() }).eq('id', docId);
      if (error) return { success: false, error: error.message };
      await logAudit({ entityType: 'DOCUMENT', entityId: docId, action: 'REJECT', performedBy: adminName, performedByName: adminName, performedByRole: 'admin', reason, details: {} });
      return { success: true };
    }

    const docs = loadFromStorage<AcademicDocument[]>(STORAGE_KEYS.DOCS, INITIAL_DOCUMENTS);
    const doc = docs.find(d => d.id === docId);
    if (!doc) return { success: false, error: 'Document not found.' };

    doc.approvalStatus = 'rejected';
    doc.rejectionReason = reason.trim();
    doc.updatedAt = new Date().toISOString();
    doc.updatedBy = adminName;
    saveToStorage(STORAGE_KEYS.DOCS, docs);

    await logAudit({
      entityType: 'DOCUMENT',
      entityId: doc.id,
      action: 'REJECT',
      performedBy: adminName,
      performedByName: adminName,
      performedByRole: 'admin',
      reason,
      details: { certificateNumber: doc.certificateNumber },
    });

    return { success: true };
  },

  async revokeDocument(docId: string, reason: string, adminName: string): Promise<{ success: boolean; error?: string }> {
    if (!reason.trim()) return { success: false, error: 'A clear revocation reason must be entered.' };

    if (isSupabaseConfigured && supabase) {
      const { data: authData } = await supabase.auth.getUser();
      const { error } = await supabase.from('academic_documents').update({ status: 'revoked', revocation_reason: reason.trim(), revoked_at: new Date().toISOString(), revoked_by: authData.user?.id || null, updated_by: authData.user?.id || null, updated_at: new Date().toISOString() }).eq('id', docId);
      if (error) return { success: false, error: error.message };
      await logAudit({ entityType: 'DOCUMENT', entityId: docId, action: 'REVOKE', performedBy: adminName, performedByName: adminName, performedByRole: 'admin', reason, details: {} });
      return { success: true };
    }

    const docs = loadFromStorage<AcademicDocument[]>(STORAGE_KEYS.DOCS, INITIAL_DOCUMENTS);
    const doc = docs.find(d => d.id === docId);
    if (!doc) return { success: false, error: 'Document not found.' };

    doc.status = 'revoked';
    doc.revocationReason = reason.trim();
    doc.revokedAt = new Date().toISOString();
    doc.revokedBy = adminName;
    doc.updatedAt = new Date().toISOString();
    doc.updatedBy = adminName;
    saveToStorage(STORAGE_KEYS.DOCS, docs);

    await logAudit({
      entityType: 'DOCUMENT',
      entityId: doc.id,
      action: 'REVOKE',
      performedBy: adminName,
      performedByName: adminName,
      performedByRole: 'admin',
      reason,
      details: { certificateNumber: doc.certificateNumber },
    });

    return { success: true };
  },

  async restoreDocument(docId: string, adminName: string): Promise<{ success: boolean; error?: string }> {
    if (isSupabaseConfigured && supabase) {
      const { data: authData } = await supabase.auth.getUser();
      const { error } = await supabase.from('academic_documents').update({ status: 'valid', revocation_reason: null, revoked_at: null, revoked_by: null, updated_by: authData.user?.id || null, updated_at: new Date().toISOString() }).eq('id', docId);
      if (error) return { success: false, error: error.message };
      await logAudit({ entityType: 'DOCUMENT', entityId: docId, action: 'RESTORE', performedBy: adminName, performedByName: adminName, performedByRole: 'admin', details: {} });
      return { success: true };
    }
    const docs = loadFromStorage<AcademicDocument[]>(STORAGE_KEYS.DOCS, INITIAL_DOCUMENTS);
    const doc = docs.find(d => d.id === docId);
    if (!doc) return { success: false, error: 'Document not found.' };

    doc.status = 'valid';
    doc.revocationReason = undefined;
    doc.revokedAt = undefined;
    doc.revokedBy = undefined;
    doc.updatedAt = new Date().toISOString();
    doc.updatedBy = adminName;
    saveToStorage(STORAGE_KEYS.DOCS, docs);

    await logAudit({
      entityType: 'DOCUMENT',
      entityId: doc.id,
      action: 'RESTORE',
      performedBy: adminName,
      performedByName: adminName,
      performedByRole: 'admin',
      details: { certificateNumber: doc.certificateNumber },
    });

    return { success: true };
  },

  async getSecureDocumentUrl(doc: AcademicDocument): Promise<string> {
    if (isSupabaseConfigured && supabase && doc.isPortalGenerated) {
      const svg = doc.documentType === 'marksheet' ? generateOfficialMarksheetSvg(doc) : generateOfficialCertificateSvg(doc);
      return URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
    }
    if (isSupabaseConfigured && supabase) {
      if (!doc.fileStoragePath) throw new Error('This document has no stored file.');
      const { data, error } = await supabase.storage.from('academic-documents').createSignedUrl(doc.fileStoragePath, 300);
      if (error) throw error;
      return data.signedUrl;
    }
    if (doc.isPortalGenerated || doc.documentType === 'certificate' || !doc.localFileData) {
      const previewSvg = generateOfficialCertificateSvg(doc);
      const blob = new Blob([previewSvg], { type: 'image/svg+xml' });
      return URL.createObjectURL(blob);
    }
    return doc.localFileData;
  },

  async getSecureAnswerSheetUrl(doc: AcademicDocument): Promise<string | null> {
    if (isSupabaseConfigured && supabase && doc.answerSheetStoragePath) {
      const { data, error } = await supabase.storage.from('academic-documents').createSignedUrl(doc.answerSheetStoragePath, 300);
      if (error) throw error;
      return data.signedUrl;
    }
    if (doc.examAnswerSheetFileData) {
      return doc.examAnswerSheetFileData;
    }
    return null;
  },

  // ------------------------------------------------------------------
  // 8. LEARNING MATERIALS & SYLLABUS
  // ------------------------------------------------------------------
  async getLearningMaterials(courseId?: string): Promise<LearningResourceItem[]> {
    if (isSupabaseConfigured && supabase) {
      let query = supabase.from('learning_materials').select('*, courses(name), batches(batch_code)').order('created_at', { ascending: false });
      if (courseId) query = query.eq('course_id', courseId);
      const { data, error } = await query;
      if (error) throw error;
      return Promise.all((data || []).map(async (row: any) => {
        let fileUrl = row.file_url || '';
        if (fileUrl && !/^https?:\/\//i.test(fileUrl)) {
          const { data: signed, error: urlError } = await supabase.storage.from('academic-documents').createSignedUrl(fileUrl, 300);
          if (!urlError && signed) fileUrl = signed.signedUrl;
        }
        return { id: row.id, title: row.title, courseId: row.course_id || '', courseName: row.courses?.name || '', batchCode: row.batches?.batch_code || undefined, category: row.category, subject: row.subject, fileUrl, fileName: row.file_name, fileSize: row.file_size_bytes ? `${Math.ceil(row.file_size_bytes / 1024)} KB` : '', isPublished: row.is_published !== false, uploadedBy: row.uploaded_by || '', uploadedAt: row.created_at };
      }));
    }
    const list = loadFromStorage<LearningResourceItem[]>(STORAGE_KEYS.LEARNING, INITIAL_LEARNING_MATERIALS);
    if (!courseId) return list;
    return list.filter(m => m.courseId === courseId);
  },

  async createLearningMaterial(item: Omit<LearningResourceItem, 'id' | 'uploadedAt'>, operatorName: string): Promise<LearningResourceItem> {
    if (isSupabaseConfigured && supabase) {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) throw new Error('Sign in before creating learning materials.');
      const { data: staff, error: staffError } = await supabase.from('institute_staff').select('id').eq('user_id', authData.user.id).single();
      if (staffError) throw staffError;
      const { data, error } = await supabase.from('learning_materials').insert({ course_id: item.courseId || null, title: item.title, subject: item.subject, category: item.category, file_url: item.fileUrl, file_name: item.fileName, file_size_bytes: Number.parseInt(item.fileSize, 10) || 0, is_published: item.isPublished, uploaded_by: staff.id }).select('*, courses(name), batches(batch_code)').single();
      if (error) throw error;
      const created: LearningResourceItem = { id: data.id, title: data.title, courseId: data.course_id || '', courseName: data.courses?.name || item.courseName, batchCode: data.batches?.batch_code || item.batchCode, category: data.category, subject: data.subject, fileUrl: data.file_url, fileName: data.file_name, fileSize: item.fileSize, isPublished: data.is_published, uploadedBy: operatorName, uploadedAt: data.created_at };
      await logAudit({ entityType: 'SYLLABUS', entityId: created.id, action: 'CREATE', performedBy: operatorName, performedByName: operatorName, performedByRole: 'staff', details: { title: created.title, courseName: created.courseName } });
      return created;
    }
    const list = await this.getLearningMaterials();
    const newMat: LearningResourceItem = {
      ...item,
      id: 'mat-' + Date.now(),
      uploadedAt: new Date().toISOString(),
    };
    list.unshift(newMat);
    saveToStorage(STORAGE_KEYS.LEARNING, list);

    await logAudit({
      entityType: 'SYLLABUS',
      entityId: newMat.id,
      action: 'CREATE',
      performedBy: operatorName,
      performedByName: operatorName,
      performedByRole: 'staff',
      details: { title: newMat.title, courseName: newMat.courseName },
    });

    return newMat;
  },

  async toggleMaterialPublish(materialId: string, operatorName: string): Promise<{ success: boolean }> {
    if (isSupabaseConfigured && supabase) {
      const { data: current, error: readError } = await supabase.from('learning_materials').select('is_published,title').eq('id', materialId).single();
      if (readError) throw readError;
      const { error } = await supabase.from('learning_materials').update({ is_published: !current.is_published, updated_at: new Date().toISOString() }).eq('id', materialId);
      if (error) throw error;
      await logAudit({ entityType: 'SYLLABUS', entityId: materialId, action: 'UPDATE', performedBy: operatorName, performedByName: operatorName, performedByRole: 'staff', details: { title: current.title, isPublished: !current.is_published } });
      return { success: true };
    }
    const list = await this.getLearningMaterials();
    const mat = list.find(m => m.id === materialId);
    if (mat) {
      mat.isPublished = !mat.isPublished;
      saveToStorage(STORAGE_KEYS.LEARNING, list);
    }
    return { success: true };
  },

  // ------------------------------------------------------------------
  // 9. MOCK TESTS & GOVERNMENT EXAM PREPARATION
  // ------------------------------------------------------------------
  async getMockTests(category?: ExamCategory): Promise<MockTestItem[]> {
    if (isSupabaseConfigured && supabase) {
      const { data: role, error: roleError } = await supabase.rpc('get_auth_role');
      if (roleError) throw roleError;
      if (role === 'admin' || role === 'staff') {
        let query = supabase.from('mock_tests').select('*, mock_questions(*)').order('created_at', { ascending: false });
        if (category) query = query.eq('category', category);
        const { data, error } = await query;
        if (error) throw error;
        return (data || []).map((row: any) => ({ id: row.id, title: row.title, category: row.category, targetExam: row.target_exam || undefined, durationMinutes: row.duration_minutes, totalQuestions: row.mock_questions?.length || 0, totalMarks: row.total_marks, passingPercentage: Number(row.passing_percentage), instructions: row.instructions || '', isPublished: row.is_published, questions: (row.mock_questions || []).sort((a: any, b: any) => a.question_order - b.question_order).map((q: any) => ({ id: q.id, questionText: q.question_text, questionTextAs: q.question_text_as || undefined, options: q.options || [], correctOptionIndex: q.correct_option_index, explanation: q.explanation || undefined, marks: q.marks })) }));
      }
      const { data, error } = await supabase.rpc('get_published_mock_tests', {
        p_category: category || null,
      });
      if (error) {
        console.error('Could not load published mock tests:', error);
        return [];
      }
      const result = typeof data === 'string' ? JSON.parse(data) : data;
      return Array.isArray(result) ? result as MockTestItem[] : [];
    }

    if (!LOCAL_PREVIEW_ENABLED) return [];
    const list = loadFromStorage<MockTestItem[]>(STORAGE_KEYS.MOCK_TESTS, INITIAL_MOCK_TESTS);
    if (!category) return list;
    return list.filter(t => t.category === category);
  },

  async createMockTest(test: Omit<MockTestItem, 'id'>, operatorName: string): Promise<MockTestItem> {
    if (isSupabaseConfigured && supabase) {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) throw new Error('Sign in before creating a mock test.');
      const { data: staff, error: staffError } = await supabase.from('institute_staff').select('id').eq('user_id', authData.user.id).single();
      if (staffError) throw staffError;
      const { data: createdRow, error } = await supabase.from('mock_tests').insert({ title: test.title, category: test.category, target_exam: test.targetExam || null, duration_minutes: test.durationMinutes, total_marks: test.totalMarks, passing_percentage: test.passingPercentage, instructions: test.instructions, is_published: test.isPublished, created_by: staff.id }).select('*').single();
      if (error) throw error;
      const questionRows = test.questions.map((question, index) => ({ test_id: createdRow.id, question_order: index + 1, question_text: question.questionText, question_text_as: question.questionTextAs || null, options: question.options, correct_option_index: question.correctOptionIndex ?? 0, explanation: question.explanation || null, marks: question.marks }));
      if (questionRows.length) {
        const { error: questionError } = await supabase.from('mock_questions').insert(questionRows);
        if (questionError) {
          await supabase.from('mock_tests').delete().eq('id', createdRow.id);
          throw questionError;
        }
      }
      await logAudit({ entityType: 'TEST', entityId: createdRow.id, action: 'CREATE', performedBy: operatorName, performedByName: operatorName, performedByRole: 'staff', details: { title: createdRow.title, category: createdRow.category } });
      return { ...test, id: createdRow.id };
    }
    const list = await this.getMockTests();
    const newTest: MockTestItem = {
      ...test,
      id: 'test-' + Date.now(),
    };
    list.unshift(newTest);
    saveToStorage(STORAGE_KEYS.MOCK_TESTS, list);
    await logAudit({
      entityType: 'TEST',
      entityId: newTest.id,
      action: 'CREATE',
      performedBy: operatorName,
      performedByName: operatorName,
      performedByRole: 'staff',
      details: { title: newTest.title, category: newTest.category },
    });
    return newTest;
  },

  async submitMockTestAttempt(params: {
    testId: string;
    studentId: string;
    studentName: string;
    startedAt: string;
    userAnswers: Record<string, number>;
  }): Promise<{ attempt: MockTestAttempt; test: MockTestItem }> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.rpc('submit_mock_test_attempt', {
        p_test_id: params.testId,
        p_answers: params.userAnswers,
      });
      if (error) throw new Error(`Mock test submission failed: ${error.message}`);
      const result = typeof data === 'string' ? JSON.parse(data) : data;
      if (!result?.attempt || !result?.test) {
        throw new Error('The server returned an invalid mock test result.');
      }
      return result as { attempt: MockTestAttempt; test: MockTestItem };
    }

    if (!LOCAL_PREVIEW_ENABLED) {
      throw new Error('Mock test submissions require secure Supabase authentication.');
    }

    const tests = await this.getMockTests();
    const test = tests.find(t => t.id === params.testId);
    if (!test) throw new Error('Mock test not found.');

    // Compute authoritatively on server/service logic (answers were concealed from student)
    let score = 0;
    test.questions.forEach(q => {
      const selected = params.userAnswers[q.id];
      if (selected !== undefined && selected === q.correctOptionIndex) {
        score += q.marks;
      }
    });

    const percentage = Math.round((score / test.totalMarks) * 100);
    const passed = percentage >= test.passingPercentage;

    const attempt: MockTestAttempt = {
      id: 'att-tst-' + Date.now(),
      testId: test.id,
      testTitle: test.title,
      studentId: params.studentId,
      studentName: params.studentName,
      startedAt: params.startedAt,
      completedAt: new Date().toISOString(),
      userAnswers: params.userAnswers,
      scoreObtained: score,
      totalMarks: test.totalMarks,
      percentage,
      passed,
    };

    const attempts = loadFromStorage<MockTestAttempt[]>(STORAGE_KEYS.MOCK_ATTEMPTS, []);
    attempts.unshift(attempt);
    saveToStorage(STORAGE_KEYS.MOCK_ATTEMPTS, attempts);

    return { attempt, test };
  },

  async getStudentAttempts(studentId: string): Promise<MockTestAttempt[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('mock_test_attempts')
        .select('id, test_id, student_id, started_at, completed_at, user_answers, score_obtained, total_marks, percentage, passed, mock_tests(title), student_profiles(full_name)')
        .eq('student_id', studentId)
        .order('completed_at', { ascending: false });
      if (error) {
        console.error('Could not load mock test attempts:', error);
        return [];
      }
      return (data || []).map((row: any) => {
        const test = Array.isArray(row.mock_tests) ? row.mock_tests[0] : row.mock_tests;
        const student = Array.isArray(row.student_profiles) ? row.student_profiles[0] : row.student_profiles;
        return {
          id: row.id,
          testId: row.test_id,
          testTitle: test?.title || 'Mock Test',
          studentId: row.student_id,
          studentName: student?.full_name || '',
          startedAt: row.started_at,
          completedAt: row.completed_at,
          userAnswers: row.user_answers || {},
          scoreObtained: Number(row.score_obtained),
          totalMarks: Number(row.total_marks),
          percentage: Number(row.percentage),
          passed: Boolean(row.passed),
        };
      });
    }

    if (!LOCAL_PREVIEW_ENABLED) return [];
    const attempts = loadFromStorage<MockTestAttempt[]>(STORAGE_KEYS.MOCK_ATTEMPTS, []);
    return attempts.filter(a => a.studentId === studentId);
  },

  async getGovtExamPapers(): Promise<GovtExamPaperItem[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('govt_exam_papers').select('*').order('year', { ascending: false });
      if (error) throw error;
      return (data || []).map((row: any) => ({ id: row.id, examName: row.exam_name, year: row.year, subject: row.subject, language: row.language, difficulty: row.difficulty, downloadUrl: row.file_url, fileSize: row.file_size || '', isOfficialPaper: row.is_official_paper === true, disclaimer: row.disclaimer || '' }));
    }
    return loadFromStorage<GovtExamPaperItem[]>(STORAGE_KEYS.GOVT_PAPERS, INITIAL_GOVT_PAPERS);
  },

  // ------------------------------------------------------------------
  // 10. AUDIT LOGS & BACKUP EXPORTS
  // ------------------------------------------------------------------
  async getAuditLogs(): Promise<AcademicAuditLog[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('academic_audit_logs').select('*').order('created_at', { ascending: false }).limit(500);
      if (error) throw error;
      return (data || []).map((row: any) => ({ id: row.id, entityType: row.entity_type, entityId: row.entity_id, action: row.action, performedBy: row.performed_by_id || '', performedByName: row.performed_by_name || '', performedByRole: row.performed_by_role || '', reason: row.reason || undefined, details: row.details || {}, createdAt: row.created_at }));
    }
    return loadFromStorage<AcademicAuditLog[]>(STORAGE_KEYS.AUDIT, []);
  },

  async exportFullBackupJson(): Promise<string> {
    if (isSupabaseConfigured && supabase) {
      const [courses, batches, staff, students, documents, attendance, assessments, learningMaterials, mockTests, auditLogs, marks] = await Promise.all([
        this.getCourses(), this.getBatches(), this.getStaffMembers(), this.getStudentProfiles(),
        this.getAllDocumentsForStaff(), this.getAllAttendance(), this.getAssessments(),
        this.getLearningMaterials(), this.getMockTests(), this.getAuditLogs(),
        supabase.from('student_marks').select('*').then(({ data, error }) => { if (error) throw error; return data || []; }),
      ]);
      return JSON.stringify({ timestamp: new Date().toISOString(), institution: 'Quantum Learning Institute / Taxcent Connect', version: '2.0.0', data: { courses, batches, staff, students, documents, attendance, assessments, marks, learningMaterials, mockTests, auditLogs } }, null, 2);
    }
    const fullBackup = {
      timestamp: new Date().toISOString(),
      institution: 'Quantum Learning Institute / Taxcent Connect',
      version: '2.0.0',
      data: {
        courses: loadFromStorage(STORAGE_KEYS.COURSES, INITIAL_COURSES),
        batches: loadFromStorage(STORAGE_KEYS.BATCHES, INITIAL_BATCHES),
        staff: loadFromStorage(STORAGE_KEYS.STAFF, INITIAL_STAFF),
        students: loadFromStorage(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS),
        documents: loadFromStorage(STORAGE_KEYS.DOCS, INITIAL_DOCUMENTS),
        attendanceStudent: loadFromStorage(STORAGE_KEYS.ATTENDANCE_STUDENT, INITIAL_ATTENDANCE),
        assessments: loadFromStorage(STORAGE_KEYS.ASSESSMENTS, INITIAL_ASSESSMENTS),
        marks: loadFromStorage(STORAGE_KEYS.MARKS, INITIAL_MARKS),
        learningMaterials: loadFromStorage(STORAGE_KEYS.LEARNING, INITIAL_LEARNING_MATERIALS),
        mockTests: loadFromStorage(STORAGE_KEYS.MOCK_TESTS, INITIAL_MOCK_TESTS),
        auditLogs: loadFromStorage(STORAGE_KEYS.AUDIT, []),
      },
    };
    return JSON.stringify(fullBackup, null, 2);
  },
};

// ------------------------------------------------------------------
// Internal helper functions
// ------------------------------------------------------------------
function mapAcademicDocument(row: any): AcademicDocument {
  return {
    id: row.id,
    studentId: row.student_id,
    documentType: row.document_type,
    certificateNumber: row.certificate_number,
    marksheetNumber: row.marksheet_number || undefined,
    studentIdCode: row.student_id_code,
    studentFullName: row.student_full_name,
    courseName: row.course_name,
    issueDate: row.issue_date,
    marksOrGrade: row.marks_or_grade || undefined,
    fileStoragePath: row.file_storage_path,
    fileName: row.file_name || row.certificate_number,
    fileMimeType: row.file_mime_type || 'application/pdf',
    fileSizeBytes: Number(row.file_size_bytes || 0),
    status: row.status,
    approvalStatus: row.approval_status,
    approvedBy: row.approved_by_name || undefined,
    approvedAt: row.approved_at || undefined,
    rejectionReason: row.rejection_reason || undefined,
    revocationReason: row.revocation_reason || undefined,
    revokedAt: row.revoked_at || undefined,
    revokedBy: row.revoked_by || undefined,
    createdBy: row.created_by || '',
    createdByName: row.created_by_name || undefined,
    updatedBy: row.updated_by || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    isPortalGenerated: row.is_portal_generated === true,
    assessmentId: row.assessment_id || undefined,
    assessmentTitle: row.assessment_title || undefined,
    marksObtained: row.marks_obtained == null ? undefined : Number(row.marks_obtained),
    maxScore: row.max_score == null ? undefined : Number(row.max_score),
    percentage: row.percentage == null ? undefined : Number(row.percentage),
    grade: row.grade || undefined,
    evaluatorRemarks: row.evaluator_remarks || undefined,
    batchCode: row.batch_code || undefined,
    courseDurationMonths: row.course_duration_months || undefined,
    examAnswerSheetFileName: row.answer_sheet_file_name || undefined,
    examAnswerSheetMimeType: row.answer_sheet_mime_type || undefined,
  };
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function generateCertifiedDocumentPreviewSvg(doc: AcademicDocument): string {
  const isMarksheet = doc.documentType === 'marksheet';
  const docTitle = isMarksheet ? 'OFFICIAL MARKSHEET' : 'CERTIFICATE OF COMPLETION';
  const isRevoked = doc.status === 'revoked';

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 560" width="100%" height="100%" style="font-family: system-ui, -apple-system, sans-serif; background-color: #ffffff;">
      <rect x="20" y="20" width="760" height="520" rx="12" fill="#ffffff" stroke="#0f2e4d" stroke-width="4"/>
      <rect x="30" y="30" width="740" height="500" rx="8" fill="#f8fafc" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="4,2"/>
      
      <text x="400" y="70" font-size="22" font-weight="800" text-anchor="middle" fill="#0a2540" letter-spacing="1.5">
        QUANTUM LEARNING INSTITUTE
      </text>
      <text x="400" y="92" font-size="11" font-weight="600" text-anchor="middle" fill="#0284c7" letter-spacing="1">
        RANABARI MARKET, NH-15, LAKHIMPUR, ASSAM
      </text>
      <text x="400" y="110" font-size="9" text-anchor="middle" fill="#64748b">
        Affiliated Centre under Taxcent Connect Enterprise Registry
      </text>
      
      <line x1="120" y1="125" x2="680" y2="125" stroke="#cbd5e1" stroke-width="1"/>

      <text x="400" y="165" font-size="18" font-weight="700" text-anchor="middle" fill="#0369a1" letter-spacing="2">
        ${docTitle}
      </text>

      <text x="400" y="200" font-size="12" text-anchor="middle" fill="#475569">
        This is to certify that the authorized student
      </text>

      <text x="400" y="235" font-size="22" font-weight="800" text-anchor="middle" fill="#0f172a">
        ${escapeXml(doc.studentFullName)}
      </text>
      <text x="400" y="255" font-size="11" text-anchor="middle" fill="#64748b">
        Student Registration ID: ${escapeXml(doc.studentIdCode)}
      </text>

      <text x="400" y="290" font-size="12" text-anchor="middle" fill="#475569">
        has successfully completed the prescribed curriculum and practical assessments for
      </text>

      <text x="400" y="325" font-size="16" font-weight="700" text-anchor="middle" fill="#0284c7">
        ${escapeXml(doc.courseName)}
      </text>

      ${doc.marksOrGrade ? `
        <rect x="250" y="345" width="300" height="34" rx="6" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1"/>
        <text x="400" y="367" font-size="12" font-weight="600" text-anchor="middle" fill="#1e293b">
          ${escapeXml(doc.marksOrGrade)}
        </text>
      ` : ''}

      <g transform="translate(60, 420)">
        <text x="0" y="0" font-size="10" font-weight="700" fill="#64748b">CERTIFICATE NUMBER</text>
        <text x="0" y="18" font-size="12" font-weight="800" fill="#0f172a" font-family="monospace">${escapeXml(doc.certificateNumber)}</text>
        <text x="0" y="36" font-size="10" fill="#64748b">Issue Date: ${escapeXml(doc.issueDate)}</text>
      </g>

      <g transform="translate(580, 420)">
        <line x1="0" y1="15" x2="160" y2="15" stroke="#0f172a" stroke-width="1.5"/>
        <text x="80" y="32" font-size="10" font-weight="700" text-anchor="middle" fill="#0f172a">AUTHORISED SIGNATORY</text>
        <text x="80" y="46" font-size="9" text-anchor="middle" fill="#64748b">Quantum Learning Institute</text>
      </g>

      <circle cx="400" cy="445" r="32" fill="#f0f9ff" stroke="#0284c7" stroke-width="2"/>
      <text x="400" y="442" font-size="9" font-weight="800" text-anchor="middle" fill="#0369a1">QLI SEAL</text>
      <text x="400" y="454" font-size="7" font-weight="700" text-anchor="middle" fill="#0284c7">VERIFIED</text>

      ${isRevoked ? `
        <g transform="translate(400, 280) rotate(-22)">
          <rect x="-180" y="-36" width="360" height="72" rx="10" fill="#fee2e2" fill-opacity="0.95" stroke="#ef4444" stroke-width="5" stroke-dasharray="10,4"/>
          <text x="0" y="10" font-size="34" font-weight="900" text-anchor="middle" fill="#dc2626" letter-spacing="4">
            REVOKED
          </text>
          <text x="0" y="28" font-size="9" font-weight="700" text-anchor="middle" fill="#b91c1c">
            INVALID FOR OFFICIAL / ACADEMIC USE
          </text>
        </g>
      ` : ''}
    </svg>
  `;
}

function escapeXml(unsafe: string): string {
  return (unsafe || '').replace(/[<>&'"]/g, c => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}
