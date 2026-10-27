export type Language = 'en' | 'as';

export type ActiveTab = 'home' | 'tax' | 'courses' | 'csc' | 'estimator' | 'verify' | 'academic' | 'about' | 'contact' | 'enquire';

export interface ServiceItem {
  id: string;
  category: 'gst' | 'itr' | 'tds' | 'accounting' | 'registration' | 'digital';
  titleEn: string;
  titleAs: string;
  shortDescEn: string;
  shortDescAs: string;
  fullDescEn: string;
  fullDescAs: string;
  documentsEn: string[];
  documentsAs: string[];
  turnaroundEn: string;
  turnaroundAs: string;
  highlight?: boolean;
}

export interface CourseItem {
  id: string;
  titleEn: string;
  titleAs: string;
  duration: string;
  level: string;
  badge?: string;
  overviewEn: string;
  overviewAs: string;
  syllabusEn: string[];
  syllabusAs: string[];
  timingEn: string;
  timingAs: string;
  practicalLabs: boolean;
  certificateProvided: boolean;
}

export interface CSCServiceItem {
  id: string;
  nameEn: string;
  nameAs: string;
  category: string;
  descriptionEn: string;
  descriptionAs: string;
  documentsEn: string[];
  documentsAs: string[];
  officialPortal: string;
}

export interface AnnouncementItem {
  id: string;
  date: string;
  tag: string;
  titleEn: string;
  titleAs: string;
  contentEn: string;
  contentAs: string;
  urgent?: boolean;
}

export interface EnquiryRecord {
  id: string;
  type: 'tax_service' | 'course_admission' | 'csc_service' | 'callback';
  businessName: string;
  serviceOrCourse: string;
  clientName: string;
  phone: string;
  email?: string;
  location?: string;
  notes?: string;
  submittedAt: string;
  status: 'saved_locally' | 'sent_whatsapp';
}
