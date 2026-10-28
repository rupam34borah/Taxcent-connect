import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { 
  AcademicDocument, 
  StudentProfile, 
  StudentMarkRecord,
  LearningResourceItem,
  MockTestItem,
  MockTestAttempt,
  GovtExamPaperItem,
  CourseItem 
} from '../types/academic';
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
  ExternalLink,
  BookOpen,
  CheckCircle2,
  XCircle,
  Timer,
  ChevronRight,
  Shield,
  KeyRound,
  FileCheck2,
  FileSpreadsheet,
  Search,
  Filter,
  ShieldAlert
} from 'lucide-react';

interface StudentAcademicDashboardProps {
  lang: Language;
}

export const StudentAcademicDashboard: React.FC<StudentAcademicDashboardProps> = ({ lang }) => {
  const { user, role, logout } = useAuth();
  const [subTab, setSubTab] = useState<'profile' | 'results' | 'certificates' | 'syllabus' | 'tests' | 'govt' | 'account'>('profile');

  // Student Profile Data
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [activeStudentId, setActiveStudentId] = useState<string>('');
  const [currentStudent, setCurrentStudent] = useState<StudentProfile | null>(null);

  // Academic Records
  const [documents, setDocuments] = useState<AcademicDocument[]>([]);
  const [publishedMarks, setPublishedMarks] = useState<StudentMarkRecord[]>([]);
  const [learningMaterials, setLearningMaterials] = useState<LearningResourceItem[]>([]);
  const [courses, setCourses] = useState<CourseItem[]>([]);

  // Mock Tests & Attempts
  const [mockTests, setMockTests] = useState<MockTestItem[]>([]);
  const [testAttempts, setTestAttempts] = useState<MockTestAttempt[]>([]);
  const [activeTest, setActiveTest] = useState<MockTestItem | null>(null);
  const [testAnswers, setTestAnswers] = useState<Record<string, number>>({});
  const [testTimeRemaining, setTestTimeRemaining] = useState<number>(0);
  const [testCompletedResult, setTestCompletedResult] = useState<{ attempt: MockTestAttempt; test: MockTestItem } | null>(null);

  // Govt Exam Prep
  const [govtPapers, setGovtPapers] = useState<GovtExamPaperItem[]>([]);
  const [govtExamFilter, setGovtExamFilter] = useState('all');

  // Document Preview Modal
  const [previewDoc, setPreviewDoc] = useState<AcademicDocument | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Edit Personal Profile state
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');

  // Password Change state
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [passSuccess, setPassSuccess] = useState(false);

  useEffect(() => {
    loadAllStudentData();
  }, [user]);

  const loadAllStudentData = async () => {
    setLoading(true);
    try {
      const roster = await academicService.getStudentProfiles();
      setStudents(roster);

      let targetStudent = roster[0];
      if (role === 'student' && user) {
        const match = roster.find(
          s => s.id === user.studentId || 
               s.studentIdCode === user.studentIdCode ||
               s.email.toLowerCase() === user.email.toLowerCase()
        );
        if (match) targetStudent = match;
      }

      if (targetStudent) {
        setActiveStudentId(targetStudent.id);
        setCurrentStudent(targetStudent);
        setEditPhone(targetStudent.phone);
        setEditEmail(targetStudent.email);
        await loadStudentRecords(targetStudent.id);
      }

      const [allCourses, allMaterials, allTests, allGovt] = await Promise.all([
        academicService.getCourses(),
        academicService.getLearningMaterials(),
        academicService.getMockTests(),
        academicService.getGovtExamPapers(),
      ]);

      setCourses(allCourses);
      setLearningMaterials(allMaterials);
      setMockTests(allTests);
      setGovtPapers(allGovt);
    } finally {
      setLoading(false);
    }
  };

  const loadStudentRecords = async (studentId: string) => {
    const [docs, marks, attempts] = await Promise.all([
      academicService.getStudentDocuments(studentId),
      academicService.getStudentPublishedMarks(studentId),
      academicService.getStudentAttempts(studentId),
    ]);
    setDocuments(docs);
    setPublishedMarks(marks);
    setTestAttempts(attempts);
  };

  // Timer Effect for Active Mock Test
  useEffect(() => {
    let timer: any = null;
    if (activeTest && testTimeRemaining > 0) {
      timer = setInterval(() => {
        setTestTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmitActiveTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [activeTest, testTimeRemaining]);

  const handleStartMockTest = (test: MockTestItem) => {
    setActiveTest(test);
    setTestAnswers({});
    setTestTimeRemaining(test.durationMinutes * 60);
    setTestCompletedResult(null);
  };

  const handleSelectAnswer = (questionId: string, optionIndex: number) => {
    setTestAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleSubmitActiveTest = async () => {
    if (!activeTest || !currentStudent) return;
    const res = await academicService.submitMockTestAttempt({
      testId: activeTest.id,
      studentId: currentStudent.id,
      studentName: currentStudent.fullName,
      startedAt: new Date(Date.now() - (activeTest.durationMinutes * 60 - testTimeRemaining) * 1000).toISOString(),
      userAnswers: testAnswers,
    });

    setTestCompletedResult(res);
    setActiveTest(null);

    // Refresh attempts
    const updatedAttempts = await academicService.getStudentAttempts(currentStudent.id);
    setTestAttempts(updatedAttempts);
  };

  const handleOpenDocPreview = async (doc: AcademicDocument) => {
    setPreviewDoc(doc);
    const url = await academicService.getSecureDocumentUrl(doc);
    setPreviewUrl(url);
  };

  const handleSaveProfileUpdates = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStudent) return;

    const res = await academicService.updateStudentProfile(
      currentStudent.id,
      { phone: editPhone, email: editEmail },
      'Student updated their verified personal contact details',
      currentStudent.fullName,
      'student'
    );

    if (res.success) {
      setIsEditProfileOpen(false);
      setCurrentStudent({ ...currentStudent, phone: editPhone, email: editEmail });
      alert('Your contact information has been updated.');
    } else {
      alert(res.error || 'Failed to update contact info.');
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass.length < 6) {
      alert('Password must be at least 6 characters.');
      return;
    }
    setPassSuccess(true);
    setCurrentPass('');
    setNewPass('');
    setTimeout(() => setPassSuccess(false), 4000);
  };

  const certificatesList = documents.filter(d => d.documentType === 'certificate');
  const marksheetDocs = documents.filter(d => d.documentType === 'marksheet');

  // Hard block staff from student portal
  if (role === 'staff') {
    return (
      <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-8 sm:p-12 text-center max-w-2xl mx-auto space-y-5 shadow-2xl">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl sm:text-2xl font-bold text-white">
            Staff Access Restricted
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
            Staff accounts are authorized for student administration, batch attendance, marks evaluations, and certificate draft submissions. Staff cannot access personal student portals.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Student Session Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-slate-950 font-black text-2xl shadow-lg shrink-0">
            {currentStudent ? currentStudent.fullName.charAt(0) : 'S'}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                {currentStudent?.studentIdCode || user?.studentIdCode || 'QLI-STU-2026-001'}
              </span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                Active Enrolment
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-white mt-1">
              {currentStudent?.fullName || user?.name || 'Rahul Sharma'}
            </h2>
            <p className="text-xs text-slate-400">
              {currentStudent?.enrolledCourse} &bull; Batch: {currentStudent?.batchCode || 'DCA-2026-M1'}
            </p>
          </div>
        </div>

        {/* Admin Only Preview Switcher (Students NEVER see this switcher) */}
        {role === 'admin' && students.length > 1 && (
          <div className="flex items-center gap-2 bg-slate-950/80 p-2 rounded-xl border border-slate-800 self-start md:self-auto">
            <span className="text-[11px] text-amber-400 font-semibold">Admin Student Preview:</span>
            <select
              value={activeStudentId}
              onChange={async e => {
                const stu = students.find(s => s.id === e.target.value);
                if (stu) {
                  setActiveStudentId(stu.id);
                  setCurrentStudent(stu);
                  setEditPhone(stu.phone);
                  setEditEmail(stu.email);
                  await loadStudentRecords(stu.id);
                }
              }}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white font-medium focus:outline-none focus:border-sky-400"
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

      {/* Student Portal Navigation Tabs */}
      <div className="flex bg-slate-900 border border-slate-800 rounded-2xl p-1.5 overflow-x-auto scrollbar-thin gap-1 shadow-sm">
        <button
          type="button"
          onClick={() => { setActiveTest(null); setSubTab('profile'); }}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            subTab === 'profile' ? 'bg-sky-500 text-slate-950 font-extrabold shadow-sm' : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <User className="w-4 h-4" />
          <span>My Profile</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTest(null); setSubTab('results'); }}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            subTab === 'results' ? 'bg-sky-500 text-slate-950 font-extrabold shadow-sm' : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>My Results & Grades ({publishedMarks.length})</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTest(null); setSubTab('certificates'); }}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            subTab === 'certificates' ? 'bg-sky-500 text-slate-950 font-extrabold shadow-sm' : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>My Certificates ({certificatesList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTest(null); setSubTab('syllabus'); }}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            subTab === 'syllabus' ? 'bg-sky-500 text-slate-950 font-extrabold shadow-sm' : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Syllabus & Notes</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTest(null); setSubTab('tests'); }}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            subTab === 'tests' ? 'bg-sky-500 text-slate-950 font-extrabold shadow-sm' : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Timer className="w-4 h-4" />
          <span>Mock Tests ({mockTests.length})</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTest(null); setSubTab('govt'); }}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            subTab === 'govt' ? 'bg-sky-500 text-slate-950 font-extrabold shadow-sm' : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Govt Exam Prep</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTest(null); setSubTab('account'); }}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            subTab === 'account' ? 'bg-sky-500 text-slate-950 font-extrabold shadow-sm' : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Security & Password</span>
        </button>
      </div>

      {/* ================================================================ */}
      {/* 1. MY PROFILE */}
      {/* ================================================================ */}
      {subTab === 'profile' && currentStudent && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white">Institutional Academic Profile</h3>
              <p className="text-xs text-slate-400">
                Official student record enrolled at Quantum Learning Institute, Ranabari Hub.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsEditProfileOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 font-semibold text-xs transition-colors cursor-pointer"
            >
              Update Contact Info
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1">
              <span className="text-slate-500 block uppercase font-bold text-[10px]">Student Registration ID</span>
              <span className="font-mono font-bold text-sky-400 text-sm">{currentStudent.studentIdCode}</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1">
              <span className="text-slate-500 block uppercase font-bold text-[10px]">Full Legal Name</span>
              <span className="font-semibold text-white text-sm">{currentStudent.fullName}</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1">
              <span className="text-slate-500 block uppercase font-bold text-[10px]">Enrolled Course</span>
              <span className="font-semibold text-white">{currentStudent.enrolledCourse}</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1">
              <span className="text-slate-500 block uppercase font-bold text-[10px]">Batch Assignment</span>
              <span className="font-mono text-slate-300">{currentStudent.batchCode || 'DCA Morning Batch'}</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1">
              <span className="text-slate-500 block uppercase font-bold text-[10px]">Admission Date</span>
              <span className="font-mono text-slate-300">{currentStudent.admissionDate}</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1">
              <span className="text-slate-500 block uppercase font-bold text-[10px]">Enrolment Status</span>
              <span className="font-bold text-emerald-400 uppercase tracking-wider">{currentStudent.enrolmentStatus}</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1">
              <span className="text-slate-500 block uppercase font-bold text-[10px]">Registered Email</span>
              <span className="font-mono text-slate-300">{currentStudent.email}</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1">
              <span className="text-slate-500 block uppercase font-bold text-[10px]">Phone Number</span>
              <span className="font-mono text-slate-300">{currentStudent.phone}</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1">
              <span className="text-slate-500 block uppercase font-bold text-[10px]">Institute Affiliation</span>
              <span className="font-medium text-slate-300">Quantum Learning / CSC Ranabari Hub</span>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* 2. MY RESULTS & MARKS */}
      {/* ================================================================ */}
      {subTab === 'results' && (
        <div className="space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white">Official Published Results & Marksheet Transcripts</h3>
            <p className="text-xs text-slate-400">
              Only officially evaluated and admin-published examination records are accessible here.
            </p>
          </div>

          {publishedMarks.length === 0 ? (
            <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-3xl space-y-2">
              <FileSpreadsheet className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">No published examination results available yet for this semester.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {publishedMarks.map(mrk => (
                <div key={mrk.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-sky-400 font-bold">Exam Result Record</span>
                      <h4 className="text-sm font-bold text-white mt-0.5">{mrk.grade}</h4>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300">
                      {mrk.marksObtained} / {mrk.maxScore} ({mrk.percentage}%)
                    </span>
                  </div>

                  {mrk.remarks && (
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-xs text-slate-300 italic">
                      &ldquo;{mrk.remarks}&rdquo;
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                    <span>Evaluated by: {mrk.enteredBy}</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Approved
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Marksheet Documents list */}
          {marksheetDocs.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-sky-400" />
                <span>Downloadable Marksheet Transcripts ({marksheetDocs.length})</span>
              </h4>
              <div className="space-y-2">
                {marksheetDocs.map(doc => (
                  <div key={doc.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-mono font-bold text-sky-400">{doc.certificateNumber}</span>
                      <p className="font-semibold text-white mt-0.5">{doc.fileName}</p>
                      <p className="text-[11px] text-slate-400">Issue Date: {doc.issueDate} &bull; {doc.marksOrGrade}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleOpenDocPreview(doc)}
                      className="px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View & Download</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================================================================ */}
      {/* 3. MY CERTIFICATES */}
      {/* ================================================================ */}
      {subTab === 'certificates' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white">Officially Issued Credentials</h3>
              <p className="text-xs text-slate-400">
                Authorized completion certificates verified against the Quantum Learning Institute registry.
              </p>
            </div>
            <a
              href="#verify"
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Public Verification Portal</span>
            </a>
          </div>

          {certificatesList.length === 0 ? (
            <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-3xl space-y-2">
              <Award className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">
                No certificate has been officially issued yet. Certificates appear here once all course assessments are completed and approved by the academic office.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {certificatesList.map(cert => (
                <div key={cert.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 relative overflow-hidden">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold text-sky-400">{cert.certificateNumber}</span>
                      <h4 className="text-base font-bold text-white mt-1">{cert.courseName}</h4>
                      <p className="text-xs text-slate-400">Issue Date: {cert.issueDate}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      OFFICIAL
                    </span>
                  </div>

                  {cert.marksOrGrade && (
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 text-xs">
                      <span className="text-slate-500 text-[10px] uppercase font-bold block">Standing</span>
                      <span className="font-semibold text-white">{cert.marksOrGrade}</span>
                    </div>
                  )}

                  <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                    <span className="text-[11px] text-slate-400">
                      Approved: {cert.approvedBy || 'Academic Administration'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleOpenDocPreview(cert)}
                      className="px-3.5 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>View & Download</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================================================================ */}
      {/* 4. SYLLABUS & STUDY MATERIALS */}
      {/* ================================================================ */}
      {subTab === 'syllabus' && (
        <div className="space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white">Course Syllabus & Learning Resources</h3>
            <p className="text-xs text-slate-400">
              Download curriculum blueprints, lecture notes, practical files, and assignments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {learningMaterials.map(mat => (
              <div key={mat.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-sky-500/20 text-sky-300">
                      {mat.category}
                    </span>
                    <h4 className="text-sm font-bold text-white mt-1.5">{mat.title}</h4>
                    <p className="text-xs text-slate-400">{mat.courseName} &bull; {mat.subject}</p>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 shrink-0">{mat.fileSize}</span>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-800 text-xs">
                  <span className="text-[11px] text-slate-400">Faculty: {mat.uploadedBy}</span>
                  <button
                    type="button"
                    onClick={() => {
                      alert(`Initiating secure download of "${mat.fileName}" (${mat.fileSize}).`);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* 5. INTERACTIVE TIMED MOCK TESTS */}
      {/* ================================================================ */}
      {subTab === 'tests' && (
        <div className="space-y-6">
          {/* Active Running Test View */}
          {activeTest ? (
            <div className="bg-slate-900 border border-sky-500/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                    Active Examination
                  </span>
                  <h3 className="text-lg font-bold text-white mt-1">{activeTest.title}</h3>
                  <p className="text-xs text-slate-400">{activeTest.targetExam}</p>
                </div>

                <div className="flex items-center gap-2 bg-slate-950 px-4 py-2 rounded-2xl border border-slate-800 self-start sm:self-auto">
                  <Timer className="w-5 h-5 text-amber-400 animate-pulse" />
                  <span className="font-mono text-lg font-black text-amber-400">
                    {Math.floor(testTimeRemaining / 60)}:{String(testTimeRemaining % 60).padStart(2, '0')}
                  </span>
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-6">
                {activeTest.questions.map((q, idx) => (
                  <div key={q.id} className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex items-start gap-2">
                      <span className="font-mono font-bold text-sky-400 text-sm">Q{idx + 1}.</span>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-white leading-relaxed">{q.questionText}</p>
                        {q.questionTextAs && (
                          <p className="text-xs text-sky-300/80 leading-relaxed">{q.questionTextAs}</p>
                        )}
                      </div>
                    </div>

                    {/* Options (Radio style buttons) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                      {q.options.map((opt, optIdx) => {
                        const isSelected = testAnswers[q.id] === optIdx;
                        return (
                          <button
                            key={optIdx}
                            type="button"
                            onClick={() => handleSelectAnswer(q.id, optIdx)}
                            className={`p-3 rounded-xl text-left text-xs font-medium transition-all flex items-center gap-3 cursor-pointer ${
                              isSelected
                                ? 'bg-sky-500 text-slate-950 font-bold shadow-md'
                                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
                            }`}
                          >
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] font-bold shrink-0 ${
                              isSelected ? 'bg-slate-950 text-white' : 'bg-slate-800 text-slate-400'
                            }`}>
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span>{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Cancel active test? Your progress will be lost.')) {
                      setActiveTest(null);
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 font-semibold text-xs cursor-pointer"
                >
                  Cancel Test
                </button>
                <button
                  type="button"
                  onClick={handleSubmitActiveTest}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit & View Results</span>
                </button>
              </div>
            </div>
          ) : testCompletedResult ? (
            /* Test Result & Answer Key Review View */
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="text-center space-y-2 border-b border-slate-800 pb-5">
                <span className="text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-sky-500/20 text-sky-300">
                  Assessment Completed
                </span>
                <h3 className="text-xl font-black text-white">{testCompletedResult.test.title}</h3>
                <div className="flex items-center justify-center gap-4 pt-2">
                  <div className="text-center">
                    <span className="text-slate-500 text-[10px] block">Your Score</span>
                    <span className="text-2xl font-black text-white">
                      {testCompletedResult.attempt.scoreObtained} / {testCompletedResult.attempt.totalMarks}
                    </span>
                  </div>
                  <div className="text-center">
                    <span className="text-slate-500 text-[10px] block">Percentage</span>
                    <span className={`text-2xl font-black ${testCompletedResult.attempt.passed ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {testCompletedResult.attempt.percentage}%
                    </span>
                  </div>
                  <div className="text-center">
                    <span className="text-slate-500 text-[10px] block">Outcome</span>
                    <span className={`text-sm font-bold uppercase tracking-wider block mt-1 ${testCompletedResult.attempt.passed ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {testCompletedResult.attempt.passed ? 'Passed' : 'Needs Practice'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Explanations & Review Key */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-white">Answer Key & Detailed Explanations</h4>
                {testCompletedResult.test.questions.map((q, idx) => {
                  const studentChoice = testCompletedResult.attempt.userAnswers[q.id];
                  const isCorrect = studentChoice === q.correctOptionIndex;
                  return (
                    <div key={q.id} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-xs">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-white">
                          {idx + 1}. {q.questionText}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                          isCorrect ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                        }`}>
                          {isCorrect ? 'Correct (+5)' : 'Incorrect (0)'}
                        </span>
                      </div>

                      <div className="text-slate-400 text-[11px]">
                        Correct Answer: <span className="font-bold text-emerald-400">{q.options[q.correctOptionIndex]}</span>
                        {studentChoice !== undefined && studentChoice !== q.correctOptionIndex && (
                          <span className="text-rose-400 ml-2">(You chose: {q.options[studentChoice]})</span>
                        )}
                      </div>

                      {q.explanation && (
                        <p className="text-[11px] text-slate-300 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80">
                          <span className="font-semibold text-sky-400">Explanation:</span> {q.explanation}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 flex justify-center">
                <button
                  type="button"
                  onClick={() => setTestCompletedResult(null)}
                  className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs cursor-pointer"
                >
                  Return to Tests Menu
                </button>
              </div>
            </div>
          ) : (
            /* Available Mock Tests List */
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white">Interactive Timed Question Banks</h3>
                <p className="text-xs text-slate-400">
                  Multiple-choice assessments with automatic instant scoring. Answers are kept confidential until test submission.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockTests.map(test => (
                  <div key={test.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-sky-500/20 text-sky-300">
                          {test.category}
                        </span>
                        <h4 className="text-sm font-bold text-white mt-1.5">{test.title}</h4>
                        <p className="text-xs text-slate-400">{test.targetExam}</p>
                      </div>
                      <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/20">
                        {test.durationMinutes} mins
                      </span>
                    </div>

                    <p className="text-xs text-slate-300">{test.instructions}</p>

                    <div className="pt-2 flex items-center justify-between border-t border-slate-800 text-xs">
                      <span className="text-slate-400 font-mono text-[11px]">
                        {test.totalQuestions} Questions &bull; {test.totalMarks} Marks
                      </span>
                      <button
                        type="button"
                        onClick={() => handleStartMockTest(test)}
                        className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Timer className="w-3.5 h-3.5" />
                        <span>Start Test Now</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Past Attempts Table */}
              {testAttempts.length > 0 && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <h4 className="text-sm font-bold text-white">My Past Test Attempts</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                        <tr>
                          <th className="py-2.5 px-3">Test Title</th>
                          <th className="py-2.5 px-3">Date</th>
                          <th className="py-2.5 px-3">Score</th>
                          <th className="py-2.5 px-3">Percentage</th>
                          <th className="py-2.5 px-3">Result</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-slate-300">
                        {testAttempts.map(att => (
                          <tr key={att.id}>
                            <td className="py-2.5 px-3 font-semibold text-white">{att.testTitle}</td>
                            <td className="py-2.5 px-3 font-mono text-slate-400">{new Date(att.completedAt).toLocaleDateString()}</td>
                            <td className="py-2.5 px-3 font-mono">{att.scoreObtained} / {att.totalMarks}</td>
                            <td className="py-2.5 px-3 font-mono">{att.percentage}%</td>
                            <td className="py-2.5 px-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                att.passed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                              }`}>
                                {att.passed ? 'PASS' : 'RETRY'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ================================================================ */}
      {/* 6. GOVERNMENT EXAM PREPARATION */}
      {/* ================================================================ */}
      {subTab === 'govt' && (
        <div className="space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white">Government Exam Question Modules</h3>
            <p className="text-xs text-slate-400">
              Practice sets organized by exam, year, subject, and language (ADRE, Assam Police, APDCL, SSC). Clearly labeled practice materials.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {govtPapers.map(gov => (
              <div key={gov.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                      {gov.examName} ({gov.year})
                    </span>
                    <h4 className="text-sm font-bold text-white mt-1.5">{gov.subject}</h4>
                    <p className="text-xs text-slate-400">Language: {gov.language} &bull; Difficulty: {gov.difficulty}</p>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">{gov.fileSize}</span>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 leading-relaxed italic">
                  &ldquo;{gov.disclaimer}&rdquo;
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-800 text-xs">
                  <span className="text-[11px] text-slate-500">Official QLI Model Paper</span>
                  <button
                    type="button"
                    onClick={() => {
                      alert(`Initiating download for ${gov.examName} (${gov.year}) Question Set.`);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Question Set</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* 7. ACCOUNT & SECURITY */}
      {/* ================================================================ */}
      {subTab === 'account' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl mx-auto space-y-6">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-sky-400" />
              <span>Student Account Security & Password</span>
            </h3>
            <p className="text-xs text-slate-400">
              Manage your confidential portal password and authentication credentials.
            </p>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
            {passSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Password successfully updated. Please use your new password for subsequent logins.</span>
              </div>
            )}

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Current Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={currentPass}
                onChange={e => setCurrentPass(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-400 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">New Confidential Password</label>
              <input
                type="password"
                required
                placeholder="At least 6 characters"
                value={newPass}
                onChange={e => setNewPass(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-400 font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
            >
              Update Password
            </button>
          </form>

          <div className="pt-4 border-t border-slate-800 flex justify-between items-center text-xs">
            <span className="text-slate-400">Need to terminate your session?</span>
            <button
              type="button"
              onClick={logout}
              className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-semibold border border-rose-500/30 transition-colors cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Edit Personal Profile Modal */}
      {isEditProfileOpen && currentStudent && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Update Personal Contact Details</h3>
              <button
                type="button"
                onClick={() => setIsEditProfileOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Students can update their contact details. Academic fields (Name, Roll No., Enrolled Course) are strictly locked to prevent unauthorized alterations.
            </p>

            <form onSubmit={handleSaveProfileUpdates} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Contact Phone</label>
                <input
                  type="text"
                  required
                  value={editPhone}
                  onChange={e => setEditPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Verified Email</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={e => setEditEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-400"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document Preview & Download Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">{previewDoc.certificateNumber}</h3>
                <p className="text-xs text-slate-400">{previewDoc.studentFullName} &bull; {previewDoc.courseName}</p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-950 rounded-2xl p-2 border border-slate-800 flex items-center justify-center min-h-[350px]">
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt={previewDoc.fileName}
                  className="max-h-[500px] w-auto rounded-lg shadow-lg"
                />
              )}
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-400">
                Official Credential Issued by Quantum Learning Institute
              </span>
              <div className="flex gap-2">
                <a
                  href={previewUrl || '#'}
                  download={previewDoc.fileName}
                  className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Verified Document</span>
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewDoc(null)}
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
