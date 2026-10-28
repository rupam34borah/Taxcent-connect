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

const INITIAL_STAFF: StaffMember[] = [
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
];

const INITIAL_STUDENTS: StudentProfile[] = [
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
];

const INITIAL_DOCUMENTS: AcademicDocument[] = [
  {
    id: 'doc-001',
    studentId: 'stu-001',
    studentIdCode: 'QLI-STU-2026-001',
    studentFullName: 'Rahul Sharma',
    documentType: 'certificate',
    certificateNumber: 'QLI-2026-DCA-1042',
    courseName: 'Diploma in Computer Application (DCA)',
    issueDate: '2026-08-15',
    marksOrGrade: 'Grade A+ (92.5%)',
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
  },
  {
    id: 'doc-002',
    studentId: 'stu-001',
    studentIdCode: 'QLI-STU-2026-001',
    studentFullName: 'Rahul Sharma',
    documentType: 'marksheet',
    certificateNumber: 'QLI-2026-DCA-1042-M',
    courseName: 'Diploma in Computer Application (DCA)',
    issueDate: '2026-08-15',
    marksOrGrade: 'Total Marks: 462 / 500 (92.4%)',
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
    courseName: 'Professional Tally Prime & GST Certification',
    issueDate: '2026-06-10',
    marksOrGrade: 'Grade Distinction (96%)',
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
  },
  {
    id: 'doc-005',
    studentId: 'stu-003',
    studentIdCode: 'QLI-STU-2026-003',
    studentFullName: 'Pranjal Saikia',
    documentType: 'certificate',
    certificateNumber: 'QLI-2026-PGDCA-3091',
    courseName: 'Post Graduate Diploma in Computer Applications (PGDCA)',
    issueDate: '2026-09-02',
    marksOrGrade: 'Grade A (88%)',
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
  },
];

const INITIAL_ATTENDANCE: AttendanceRecord[] = [
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
];

const INITIAL_ASSESSMENTS: AssessmentItem[] = [
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
];

const INITIAL_MARKS: StudentMarkRecord[] = [
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
];

const INITIAL_LEARNING_MATERIALS: LearningResourceItem[] = [
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
];

const INITIAL_MOCK_TESTS: MockTestItem[] = [
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
];

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

// Helpers for localStorage retrieval with fallback
function loadFromStorage<T>(key: string, defaultData: T): T {
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
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn(`Could not save key ${key}:`, err);
  }
}

function logAudit(audit: Omit<AcademicAuditLog, 'id' | 'createdAt'>): void {
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
        status: 'NOT_FOUND',
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

        if (!error && data) {
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
        }
      } catch (e) {
        console.warn('RPC check fallback to local authoritative registry:', e);
      }
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
    return loadFromStorage<CourseItem[]>(STORAGE_KEYS.COURSES, INITIAL_COURSES);
  },

  async getBatches(): Promise<BatchItem[]> {
    return loadFromStorage<BatchItem[]>(STORAGE_KEYS.BATCHES, INITIAL_BATCHES);
  },

  async createCourse(course: Omit<CourseItem, 'id'>, performedBy: string): Promise<CourseItem> {
    const list = await this.getCourses();
    const newCourse: CourseItem = {
      ...course,
      id: 'crs-' + course.code.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    };
    list.push(newCourse);
    saveToStorage(STORAGE_KEYS.COURSES, list);
    logAudit({
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
    const list = await this.getBatches();
    const newBatch: BatchItem = {
      ...batch,
      id: 'bat-' + Date.now(),
    };
    list.push(newBatch);
    saveToStorage(STORAGE_KEYS.BATCHES, list);
    logAudit({
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

    logAudit({
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
    const staffList = await this.getStaffMembers();
    const staff = staffList.find(s => s.id === staffId);
    if (!staff) return { success: false, error: 'Staff member not found.' };

    staff.isActive = !staff.isActive;
    saveToStorage(STORAGE_KEYS.STAFF, staffList);

    logAudit({
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
    const staffList = await this.getStaffMembers();
    const staff = staffList.find(s => s.id === staffId);
    if (!staff) return { success: false, error: 'Staff member not found.' };

    staff.permissions = permissions;
    staff.assignedCourses = assignedCourses;
    staff.assignedBatches = assignedBatches;
    saveToStorage(STORAGE_KEYS.STAFF, staffList);

    logAudit({
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

        if (!error && data && data.length > 0) {
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
      } catch (err) {
        console.warn('Supabase students fallback:', err);
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

    logAudit({
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
    const students = await this.getStudentProfiles();
    const index = students.findIndex(s => s.id === studentId);
    if (index === -1) return { success: false, error: 'Student not found.' };

    const before = { ...students[index] };
    students[index] = { ...students[index], ...updates };
    saveToStorage(STORAGE_KEYS.STUDENTS, students);

    logAudit({
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
    const students = await this.getStudentProfiles();
    const student = students.find(s => s.id === studentId);
    if (!student) return { success: false, error: 'Student not found.' };

    student.isPortalActive = !student.isPortalActive;
    saveToStorage(STORAGE_KEYS.STUDENTS, students);

    logAudit({
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

    logAudit({
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

    logAudit({
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

    logAudit({
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
    const list = loadFromStorage<StudentMarkRecord[]>(STORAGE_KEYS.MARKS, INITIAL_MARKS);
    return list.filter(m => m.studentId === studentId && m.status === 'published');
  },

  // ------------------------------------------------------------------
  // 7. ACADEMIC DOCUMENTS & CERTIFICATES APPROVAL
  // ------------------------------------------------------------------
  async getAllDocumentsForStaff(): Promise<AcademicDocument[]> {
    return loadFromStorage<AcademicDocument[]>(STORAGE_KEYS.DOCS, INITIAL_DOCUMENTS);
  },

  async getStudentDocuments(studentId: string): Promise<AcademicDocument[]> {
    const list = loadFromStorage<AcademicDocument[]>(STORAGE_KEYS.DOCS, INITIAL_DOCUMENTS);
    // Student only receives approved documents
    return list.filter(d => d.studentId === studentId && d.approvalStatus === 'approved');
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

    logAudit({
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
    const docs = loadFromStorage<AcademicDocument[]>(STORAGE_KEYS.DOCS, INITIAL_DOCUMENTS);
    const doc = docs.find(d => d.id === docId);
    if (!doc) return { success: false, error: 'Document not found.' };

    doc.approvalStatus = 'approved';
    doc.approvedBy = adminName;
    doc.approvedAt = new Date().toISOString();
    doc.updatedAt = new Date().toISOString();
    doc.updatedBy = adminName;
    saveToStorage(STORAGE_KEYS.DOCS, docs);

    logAudit({
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

    const docs = loadFromStorage<AcademicDocument[]>(STORAGE_KEYS.DOCS, INITIAL_DOCUMENTS);
    const doc = docs.find(d => d.id === docId);
    if (!doc) return { success: false, error: 'Document not found.' };

    doc.approvalStatus = 'rejected';
    doc.rejectionReason = reason.trim();
    doc.updatedAt = new Date().toISOString();
    doc.updatedBy = adminName;
    saveToStorage(STORAGE_KEYS.DOCS, docs);

    logAudit({
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

    logAudit({
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

    logAudit({
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
    if (doc.localFileData) return doc.localFileData;
    const previewSvg = generateCertifiedDocumentPreviewSvg(doc);
    const blob = new Blob([previewSvg], { type: 'image/svg+xml' });
    return URL.createObjectURL(blob);
  },

  // ------------------------------------------------------------------
  // 8. LEARNING MATERIALS & SYLLABUS
  // ------------------------------------------------------------------
  async getLearningMaterials(courseId?: string): Promise<LearningResourceItem[]> {
    const list = loadFromStorage<LearningResourceItem[]>(STORAGE_KEYS.LEARNING, INITIAL_LEARNING_MATERIALS);
    if (!courseId) return list;
    return list.filter(m => m.courseId === courseId);
  },

  async createLearningMaterial(item: Omit<LearningResourceItem, 'id' | 'uploadedAt'>, operatorName: string): Promise<LearningResourceItem> {
    const list = await this.getLearningMaterials();
    const newMat: LearningResourceItem = {
      ...item,
      id: 'mat-' + Date.now(),
      uploadedAt: new Date().toISOString(),
    };
    list.unshift(newMat);
    saveToStorage(STORAGE_KEYS.LEARNING, list);

    logAudit({
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
    const list = loadFromStorage<MockTestItem[]>(STORAGE_KEYS.MOCK_TESTS, INITIAL_MOCK_TESTS);
    if (!category) return list;
    return list.filter(t => t.category === category);
  },

  async createMockTest(test: Omit<MockTestItem, 'id'>, operatorName: string): Promise<MockTestItem> {
    const list = await this.getMockTests();
    const newTest: MockTestItem = {
      ...test,
      id: 'test-' + Date.now(),
    };
    list.unshift(newTest);
    saveToStorage(STORAGE_KEYS.MOCK_TESTS, list);
    logAudit({
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
    const tests = await this.getMockTests();
    const test = tests.find(t => t.id === params.testId) || INITIAL_MOCK_TESTS[0];

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
    const attempts = loadFromStorage<MockTestAttempt[]>(STORAGE_KEYS.MOCK_ATTEMPTS, []);
    return attempts.filter(a => a.studentId === studentId);
  },

  async getGovtExamPapers(): Promise<GovtExamPaperItem[]> {
    return loadFromStorage<GovtExamPaperItem[]>(STORAGE_KEYS.GOVT_PAPERS, INITIAL_GOVT_PAPERS);
  },

  // ------------------------------------------------------------------
  // 10. AUDIT LOGS & BACKUP EXPORTS
  // ------------------------------------------------------------------
  getAuditLogs(): AcademicAuditLog[] {
    return loadFromStorage<AcademicAuditLog[]>(STORAGE_KEYS.AUDIT, []);
  },

  exportFullBackupJson(): string {
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
