import { 
  AcademicDocument, 
  StudentProfile, 
  DocumentAuditLog, 
  PublicVerificationResponse, 
  AcademicDocumentType 
} from '../types/academic';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const STORAGE_KEY_DOCS = 'taxcent_qli_academic_docs_v1';
const STORAGE_KEY_STUDENTS = 'taxcent_qli_students_v1';
const STORAGE_KEY_AUDIT = 'taxcent_qli_audit_v1';

// Seed Initial Authorised Students
const INITIAL_STUDENTS: StudentProfile[] = [
  {
    id: 'stu-001',
    studentIdCode: 'QLI-STU-2026-001',
    fullName: 'Rahul Sharma',
    email: 'rahul.sharma@example.com',
    phone: '9864012345',
    enrolledCourse: 'Diploma in Computer Application (DCA)',
    admissionDate: '2026-01-10',
  },
  {
    id: 'stu-002',
    studentIdCode: 'QLI-STU-2026-002',
    fullName: 'Ankita Bora',
    email: 'ankita.bora@example.com',
    phone: '9435098765',
    enrolledCourse: 'Advance Diploma in Computer Application (ADCA)',
    admissionDate: '2025-06-15',
  },
  {
    id: 'stu-003',
    studentIdCode: 'QLI-STU-2026-003',
    fullName: 'Pranjal Saikia',
    email: 'pranjal.saikia@example.com',
    phone: '8876543210',
    enrolledCourse: 'Post Graduate Diploma in Computer Applications (PGDCA)',
    admissionDate: '2025-10-01',
  },
  {
    id: 'stu-004',
    studentIdCode: 'QLI-STU-2026-004',
    fullName: 'Rupam Borah',
    email: 'rupam.borah@example.com',
    phone: '8876824424',
    enrolledCourse: 'Professional Tally Prime & GST Certification',
    admissionDate: '2026-02-01',
  },
  {
    id: 'stu-005',
    studentIdCode: 'QLI-STU-2026-005',
    fullName: 'Manash Jyoti Nath',
    email: 'manash.nath@example.com',
    phone: '9707123980',
    enrolledCourse: 'Certificate in Desktop Publishing (DTP)',
    admissionDate: '2026-03-12',
  },
];

// Seed Sample Documents (Valid, Revoked, Marksheets)
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
    approvedBy: 'Prof. D. Saikia (Principal & Admin)',
    approvedAt: '2026-08-15T10:05:00Z',
    createdBy: 'staff-ranabari-01',
    createdByName: 'Academic Office (Ranabari Hub)',
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
    approvedBy: 'Prof. D. Saikia (Principal & Admin)',
    approvedAt: '2026-08-15T10:20:00Z',
    createdBy: 'staff-ranabari-01',
    createdByName: 'Academic Office (Ranabari Hub)',
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
    revocationReason: 'Original document superseded following corrected registration records. Academic administration revoked certificate #QLI-2025-ADCA-0819.',
    revokedAt: '2026-01-14T09:30:00Z',
    revokedBy: 'staff-principal-01',
    createdBy: 'staff-ranabari-01',
    createdByName: 'Academic Office (Ranabari Hub)',
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
    approvedBy: 'Prof. D. Saikia (Principal & Admin)',
    approvedAt: '2026-06-10T14:30:00Z',
    createdBy: 'staff-ranabari-01',
    createdByName: 'Academic Office (Ranabari Hub)',
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
    approvedBy: 'Prof. D. Saikia (Principal & Admin)',
    approvedAt: '2026-09-02T16:10:00Z',
    createdBy: 'staff-ranabari-01',
    createdByName: 'Academic Office (Ranabari Hub)',
    createdAt: '2026-09-02T16:00:00Z',
    updatedAt: '2026-09-02T16:00:00Z',
  },
];

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

function getLocalStudents(): StudentProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_STUDENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(INITIAL_STUDENTS));
      return INITIAL_STUDENTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_STUDENTS;
  }
}

function getLocalDocuments(): AcademicDocument[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DOCS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_DOCS, JSON.stringify(INITIAL_DOCUMENTS));
      return INITIAL_DOCUMENTS;
    }
    const parsed: AcademicDocument[] = JSON.parse(raw);
    return parsed.map(d => ({
      ...d,
      approvalStatus: d.approvalStatus || 'approved',
    }));
  } catch {
    return INITIAL_DOCUMENTS;
  }
}

function saveLocalDocuments(docs: AcademicDocument[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_DOCS, JSON.stringify(docs));
  } catch (err) {
    console.warn('Could not save documents to local storage:', err);
  }
}

function getLocalAuditLogs(): DocumentAuditLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AUDIT);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function appendAuditLog(log: Omit<DocumentAuditLog, 'id' | 'createdAt'>): void {
  try {
    const logs = getLocalAuditLogs();
    const newLog: DocumentAuditLog = {
      ...log,
      id: 'audit-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      createdAt: new Date().toISOString(),
    };
    logs.unshift(newLog);
    localStorage.setItem(STORAGE_KEY_AUDIT, JSON.stringify(logs.slice(0, 100)));
  } catch (err) {
    console.warn('Could not log audit:', err);
  }
}

const RATE_LIMIT_WINDOW_MS = 60000;
const MAX_VERIFY_REQUESTS_PER_MIN = 12;
let verifyTimestamps: number[] = [];

export const academicService = {
  isSupabaseMode(): boolean {
    return isSupabaseConfigured;
  },

  async getStudentProfiles(): Promise<StudentProfile[]> {
    if (isSupabaseConfigured && supabase) {
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
          enrolledCourse: d.enrolled_course,
          admissionDate: d.admission_date,
        }));
      }
    }
    return getLocalStudents();
  },

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
        console.warn('Falling back to local authoritative check:', e);
      }
    }

    const docs = getLocalDocuments();
    const doc = docs.find(d => d.certificateNumber.trim().toUpperCase() === cleanCertNo);

    if (!doc) {
      return {
        found: false,
        status: 'NOT_FOUND',
        certificateNumber: cleanCertNo,
        message: 'No certificate or marksheet was found matching this registration number.',
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
        disclaimer: 'This certificate has been revoked and is no longer valid for any official, academic, or professional purpose.',
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

  async getStudentDocuments(studentId: string): Promise<AcademicDocument[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('academic_documents')
        .select('*')
        .eq('student_id', studentId)
        .order('issue_date', { ascending: false });

      if (!error && data) {
        return data.map((d: any) => ({
          id: d.id,
          studentId: d.student_id,
          documentType: d.document_type,
          certificateNumber: d.certificate_number,
          studentIdCode: d.student_id_code,
          studentFullName: d.student_full_name,
          courseName: d.course_name,
          issueDate: d.issue_date,
          marksOrGrade: d.marks_or_grade,
          fileStoragePath: d.file_storage_path,
          fileName: d.file_storage_path.split('/').pop() || 'document.pdf',
          fileMimeType: d.file_mime_type || 'application/pdf',
          fileSizeBytes: d.file_size_bytes || 0,
          status: d.status,
          revocationReason: d.revocation_reason,
          revokedAt: d.revoked_at,
          createdBy: d.created_by,
          createdAt: d.created_at,
          updatedAt: d.updated_at,
        }));
      }
    }

    const docs = getLocalDocuments();
    return docs.filter(d => d.studentId === studentId);
  },

  async getSecureDocumentUrl(doc: AcademicDocument): Promise<string> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.storage
          .from('academic-documents')
          .createSignedUrl(doc.fileStoragePath, 300);

        if (!error && data?.signedUrl) {
          return data.signedUrl;
        }
      } catch (err) {
        console.warn('Error fetching signed URL from Supabase storage:', err);
      }
    }

    if (doc.localFileData) {
      return doc.localFileData;
    }

    const previewSvg = generateCertifiedDocumentPreviewSvg(doc);
    const blob = new Blob([previewSvg], { type: 'image/svg+xml' });
    return URL.createObjectURL(blob);
  },

  async getAllDocumentsForStaff(): Promise<AcademicDocument[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('academic_documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data.map((d: any) => ({
          id: d.id,
          studentId: d.student_id,
          documentType: d.document_type,
          certificateNumber: d.certificate_number,
          studentIdCode: d.student_id_code,
          studentFullName: d.student_full_name,
          courseName: d.course_name,
          issueDate: d.issue_date,
          marksOrGrade: d.marks_or_grade,
          fileStoragePath: d.file_storage_path,
          fileName: d.file_storage_path.split('/').pop() || 'document.pdf',
          fileMimeType: d.file_mime_type || 'application/pdf',
          fileSizeBytes: d.file_size_bytes || 0,
          status: d.status,
          revocationReason: d.revocation_reason,
          revokedAt: d.revoked_at,
          createdBy: d.created_by,
          createdAt: d.created_at,
          updatedAt: d.updated_at,
        }));
      }
    }
    return getLocalDocuments();
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
    approvalStatus?: 'approved' | 'pending';
    isAdmin?: boolean;
  }): Promise<{ success: boolean; error?: string; document?: AcademicDocument }> {
    const cleanCertNo = params.certificateNumber.trim().toUpperCase();

    if (!cleanCertNo) {
      return { success: false, error: 'Certificate or Marksheet number is required.' };
    }
    if (!params.courseName.trim()) {
      return { success: false, error: 'Course name is required.' };
    }
    if (!params.issueDate) {
      return { success: false, error: 'Issue date is required.' };
    }

    const MAX_SIZE = 5 * 1024 * 1024;
    const ALLOWED_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'];

    if (params.file.size > MAX_SIZE) {
      return { success: false, error: 'File exceeds maximum allowed size of 5 MB.' };
    }
    if (!ALLOWED_TYPES.includes(params.file.type)) {
      return { success: false, error: 'Invalid file format. Please upload a PDF document or a supported image (PNG, JPG, WEBP).' };
    }

    const existingDocs = getLocalDocuments();
    const isDuplicate = existingDocs.some(
      d => d.certificateNumber.trim().toUpperCase() === cleanCertNo
    );
    if (isDuplicate) {
      return { 
        success: false, 
        error: `A credential with Certificate Number "${cleanCertNo}" already exists in the registry. Duplicate numbers are prohibited.` 
      };
    }

    const students = await this.getStudentProfiles();
    const student = students.find(s => s.id === params.studentId);
    if (!student) {
      return { success: false, error: 'Selected student profile could not be verified in registry.' };
    }

    const fileDataUrl = await readFileAsDataUrl(params.file);
    const storagePath = `academic-documents/${student.id}/${cleanCertNo}_${params.file.name.replace(/\s+/g, '_')}`;

    const effectiveApproval = params.approvalStatus || (params.isAdmin ? 'approved' : 'approved');

    const newDoc: AcademicDocument = {
      id: 'doc-' + Date.now(),
      studentId: student.id,
      studentIdCode: student.studentIdCode,
      studentFullName: student.fullName,
      documentType: params.documentType,
      certificateNumber: cleanCertNo,
      courseName: params.courseName.trim(),
      issueDate: params.issueDate,
      marksOrGrade: params.marksOrGrade?.trim() || undefined,
      fileStoragePath: storagePath,
      fileName: params.file.name,
      fileMimeType: params.file.type,
      fileSizeBytes: params.file.size,
      status: 'valid',
      approvalStatus: effectiveApproval,
      approvedBy: effectiveApproval === 'approved' ? (params.isAdmin ? params.staffName : 'Institutional Academic Admin') : undefined,
      approvedAt: effectiveApproval === 'approved' ? new Date().toISOString() : undefined,
      createdBy: 'staff-' + params.staffName.toLowerCase().replace(/\s+/g, '-'),
      createdByName: params.staffName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      localFileData: fileDataUrl,
    };

    existingDocs.unshift(newDoc);
    saveLocalDocuments(existingDocs);

    appendAuditLog({
      documentId: newDoc.id,
      certificateNumber: newDoc.certificateNumber,
      action: 'UPLOAD',
      performedBy: newDoc.createdBy,
      performedByName: params.staffName,
      details: {
        documentType: newDoc.documentType,
        studentFullName: newDoc.studentFullName,
        courseName: newDoc.courseName,
        fileName: newDoc.fileName,
        fileSizeBytes: newDoc.fileSizeBytes,
      },
    });

    return { success: true, document: newDoc };
  },

  async updateDocumentMetadata(
    docId: string,
    updates: {
      courseName?: string;
      issueDate?: string;
      marksOrGrade?: string;
      staffName: string;
    }
  ): Promise<{ success: boolean; error?: string }> {
    const docs = getLocalDocuments();
    const index = docs.findIndex(d => d.id === docId);
    if (index === -1) {
      return { success: false, error: 'Document not found.' };
    }

    const doc = docs[index];
    const prevDetails = {
      courseName: doc.courseName,
      issueDate: doc.issueDate,
      marksOrGrade: doc.marksOrGrade,
    };

    if (updates.courseName) doc.courseName = updates.courseName.trim();
    if (updates.issueDate) doc.issueDate = updates.issueDate;
    if (updates.marksOrGrade !== undefined) doc.marksOrGrade = updates.marksOrGrade.trim();
    doc.updatedAt = new Date().toISOString();
    doc.updatedBy = updates.staffName;

    docs[index] = doc;
    saveLocalDocuments(docs);

    appendAuditLog({
      documentId: doc.id,
      certificateNumber: doc.certificateNumber,
      action: 'UPDATE_METADATA',
      performedBy: updates.staffName,
      performedByName: updates.staffName,
      details: {
        before: prevDetails,
        after: {
          courseName: doc.courseName,
          issueDate: doc.issueDate,
          marksOrGrade: doc.marksOrGrade,
        },
      },
    });

    return { success: true };
  },

  async replaceDocumentFile(
    docId: string,
    file: File,
    staffName: string
  ): Promise<{ success: boolean; error?: string }> {
    const MAX_SIZE = 5 * 1024 * 1024;
    const ALLOWED_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'];

    if (file.size > MAX_SIZE) {
      return { success: false, error: 'Replacement file exceeds 5 MB limit.' };
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return { success: false, error: 'Invalid file format. Upload PDF, PNG, JPG, or WEBP.' };
    }

    const docs = getLocalDocuments();
    const index = docs.findIndex(d => d.id === docId);
    if (index === -1) {
      return { success: false, error: 'Document not found.' };
    }

    const doc = docs[index];
    const oldFileName = doc.fileName;
    const fileDataUrl = await readFileAsDataUrl(file);

    doc.fileName = file.name;
    doc.fileMimeType = file.type;
    doc.fileSizeBytes = file.size;
    doc.localFileData = fileDataUrl;
    doc.updatedAt = new Date().toISOString();
    doc.updatedBy = staffName;

    docs[index] = doc;
    saveLocalDocuments(docs);

    appendAuditLog({
      documentId: doc.id,
      certificateNumber: doc.certificateNumber,
      action: 'REPLACE_FILE',
      performedBy: staffName,
      performedByName: staffName,
      details: {
        previousFile: oldFileName,
        newFile: file.name,
        fileSizeBytes: file.size,
      },
    });

    return { success: true };
  },

  async revokeDocument(
    docId: string,
    reason: string,
    staffName: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!reason.trim()) {
      return { success: false, error: 'A clear revocation reason must be provided.' };
    }

    const docs = getLocalDocuments();
    const index = docs.findIndex(d => d.id === docId);
    if (index === -1) {
      return { success: false, error: 'Document not found.' };
    }

    const doc = docs[index];
    doc.status = 'revoked';
    doc.revocationReason = reason.trim();
    doc.revokedAt = new Date().toISOString();
    doc.revokedBy = staffName;
    doc.updatedAt = new Date().toISOString();
    doc.updatedBy = staffName;

    docs[index] = doc;
    saveLocalDocuments(docs);

    appendAuditLog({
      documentId: doc.id,
      certificateNumber: doc.certificateNumber,
      action: 'REVOKE',
      performedBy: staffName,
      performedByName: staffName,
      details: {
        reason: reason.trim(),
        revokedAt: doc.revokedAt,
      },
    });

    return { success: true };
  },

  async restoreDocument(
    docId: string,
    staffName: string
  ): Promise<{ success: boolean; error?: string }> {
    const docs = getLocalDocuments();
    const index = docs.findIndex(d => d.id === docId);
    if (index === -1) {
      return { success: false, error: 'Document not found.' };
    }

    const doc = docs[index];
    doc.status = 'valid';
    doc.revocationReason = undefined;
    doc.revokedAt = undefined;
    doc.revokedBy = undefined;
    doc.updatedAt = new Date().toISOString();
    doc.updatedBy = staffName;

    docs[index] = doc;
    saveLocalDocuments(docs);

    appendAuditLog({
      documentId: doc.id,
      certificateNumber: doc.certificateNumber,
      action: 'RESTORE',
      performedBy: staffName,
      performedByName: staffName,
      details: {
        reinstatedAt: new Date().toISOString(),
      },
    });

    return { success: true };
  },

  async approveDocument(
    docId: string,
    adminName: string
  ): Promise<{ success: boolean; error?: string }> {
    const docs = getLocalDocuments();
    const index = docs.findIndex(d => d.id === docId);
    if (index === -1) {
      return { success: false, error: 'Document not found.' };
    }

    const doc = docs[index];
    doc.approvalStatus = 'approved';
    doc.approvedBy = adminName;
    doc.approvedAt = new Date().toISOString();
    doc.updatedAt = new Date().toISOString();
    doc.updatedBy = adminName;

    docs[index] = doc;
    saveLocalDocuments(docs);

    appendAuditLog({
      documentId: doc.id,
      certificateNumber: doc.certificateNumber,
      action: 'APPROVE',
      performedBy: adminName,
      performedByName: adminName,
      details: {
        approvalStatus: 'approved',
        approvedAt: doc.approvedAt,
      },
    });

    return { success: true };
  },

  async rejectDocument(
    docId: string,
    reason: string,
    adminName: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!reason.trim()) {
      return { success: false, error: 'Rejection reason is required.' };
    }

    const docs = getLocalDocuments();
    const index = docs.findIndex(d => d.id === docId);
    if (index === -1) {
      return { success: false, error: 'Document not found.' };
    }

    const doc = docs[index];
    doc.approvalStatus = 'rejected';
    doc.updatedAt = new Date().toISOString();
    doc.updatedBy = adminName;

    docs[index] = doc;
    saveLocalDocuments(docs);

    appendAuditLog({
      documentId: doc.id,
      certificateNumber: doc.certificateNumber,
      action: 'REJECT',
      performedBy: adminName,
      performedByName: adminName,
      details: {
        reason: reason.trim(),
        rejectedBy: adminName,
      },
    });

    return { success: true };
  },

  getAuditLogs(): DocumentAuditLog[] {
    return getLocalAuditLogs();
  },
};

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
