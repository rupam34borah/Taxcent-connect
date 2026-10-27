export type UserRole = 'admin' | 'staff' | 'student' | 'public';

export type AcademicDocumentType = 'certificate' | 'marksheet';

export type CertificateStatus = 'valid' | 'revoked';

export type ApprovalStatus = 'approved' | 'pending' | 'rejected';

export interface StudentProfile {
  id: string;
  userId?: string;
  studentIdCode: string;
  fullName: string;
  email: string;
  phone: string;
  enrolledCourse: string;
  admissionDate: string;
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
  revocationReason?: string;
  revokedAt?: string;
  revokedBy?: string;
  createdBy: string;
  createdByName?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
  localFileData?: string;
}

export interface DocumentAuditLog {
  id: string;
  documentId: string;
  certificateNumber: string;
  action: 'UPLOAD' | 'UPDATE_METADATA' | 'REPLACE_FILE' | 'REVOKE' | 'RESTORE' | 'APPROVE' | 'REJECT';
  performedBy: string;
  performedByName: string;
  details: Record<string, any>;
  createdAt: string;
}

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
