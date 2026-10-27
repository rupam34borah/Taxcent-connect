import React, { useState, useRef } from 'react';
import { ActiveTab, Language, CourseItem } from '../types';
import { QUANTUM_COURSES, BUSINESS_CONTACTS } from '../data/content';
import { Monitor, CheckCircle2, Clock, Award, BookOpen, MessageCircle, ArrowRight, Sparkles, Users, Calendar } from 'lucide-react';
import labImg from '../assets/images/quantum_computer_lab_1793034987917.jpg';

interface QuantumCoursesProps {
  lang: Language;
  setActiveTab: (tab: ActiveTab) => void;
  onSelectCourseForAdmission: (courseName: string) => void;
}

export const QuantumCourses: React.FC<QuantumCoursesProps> = ({
  lang,
  setActiveTab,
  onSelectCourseForAdmission,
}) => {
  const [selectedCourse, setSelectedCourse] = useState<CourseItem>(QUANTUM_COURSES[0]);
  const [isSyllabusHighlighted, setIsSyllabusHighlighted] = useState(false);
  const syllabusRef = useRef<HTMLDivElement>(null);

  const handleSelectCourse = (course: CourseItem) => {
    setSelectedCourse(course);
    setIsSyllabusHighlighted(true);

    setTimeout(() => {
      if (syllabusRef.current) {
        syllabusRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);

    setTimeout(() => {
      setIsSyllabusHighlighted(false);
    }, 1800);
  };

  const handleWhatsAppCourseInquiry = (course: CourseItem) => {
    const courseTitle = lang === 'as' ? course.titleAs : course.titleEn;
    const text = encodeURIComponent(
      lang === 'as'
        ? `নমস্কাৰ, মই Quantum Learning Institute ৰ "${courseTitle}" পাঠ্যক্ৰমত নামভৰ্তি আৰু মাচুলৰ বিষয়ে জানিব বিচাৰোঁ।`
        : `Hello, I would like to enquire about admission and fee structure for "${courseTitle}" at Quantum Learning Institute.`
    );
    window.open(`https://wa.me/91${BUSINESS_CONTACTS.phone1}?text=${text}`, '_blank');
  };

  return (
    <section className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header Banner with Classroom Image */}
        <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white p-6 sm:p-10 mb-10 shadow-xl border border-sky-950">
          <div className="absolute inset-0">
            <img
              src={labImg}
              alt="Quantum Learning Institute Computer Training Lab"
              className="w-full h-full object-cover opacity-25"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
          </div>

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/60 border border-blue-400/40 text-xs font-semibold text-blue-200 mb-3">
              <Award className="w-3.5 h-3.5 text-blue-300" />
              <span>{lang === 'as' ? 'ব্যৱহাৰিক কম্পিউটাৰ প্ৰশিক্ষণ প্ৰতিষ্ঠান' : 'Job-Oriented Computer Training'}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-3 text-balance">
              {lang === 'as' ? 'কোৱাণ্টাম লাৰ্নিং ইনষ্টিটিউট, ৰণবাৰী' : 'Quantum Learning Institute'}
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-6">
              {lang === 'as'
                ? 'লখিমপুৰৰ ৰণবাৰীত ছাত্ৰ-ছাত্ৰী আৰু চাকৰিপ্ৰাৰ্থীসকলৰ বাবে অত্যাধুনিক কম্পিউটাৰ লেব, প্ৰতিজন শিক্ষাৰ্থীৰ বাবে সুকীয়া পিচি আৰু স্বীকৃতিপ্ৰাপ্ত প্ৰমাণপত্ৰ।'
                : 'Empowering youth with certified digital, office productivity, accounting (Tally Prime with GST), graphic design, and web development skills at Ranabari Market, NH-15.'}
            </p>

            {/* Quick Highlights Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs border-t border-white/10 pt-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-sky-400 shrink-0" />
                <span>{lang === 'as' ? '১ ছাত্ৰ = ১ কম্পিউটাৰ' : '1:1 PC Ratio'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-sky-400 shrink-0" />
                <span>{lang === 'as' ? 'স্বীকৃতিপ্ৰাপ্ত চাৰ্টিফিকেট' : 'Valid Certificate'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-sky-400 shrink-0" />
                <span>{lang === 'as' ? 'পুৱা-সন্ধিয়াৰ বেচ' : 'Morning & Eve Slots'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-400 shrink-0" />
                <span>{lang === 'as' ? 'অসমীয়া DTP টাইপিং' : 'Assamese DTP Typing'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Split: Courses List (left 7 cols) & Selected Course Deep Dive (right 5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Courses List */}
          <div className="lg:col-span-7 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 mb-2 flex items-center justify-between">
              <span>{lang === 'as' ? 'উপলব্ধ পাঠ্যক্ৰমসমূহ' : 'Available Programs & Certifications'}</span>
              <span className="text-xs font-normal text-slate-500">
                {lang === 'as' ? 'বিৱৰণ চাবলৈ পাঠ্যক্ৰমত ক্লিক কৰক' : 'Tap to inspect syllabus'}
              </span>
            </h2>

            <div className="space-y-3">
              {QUANTUM_COURSES.map((course) => {
                const isSelected = selectedCourse.id === course.id;
                return (
                  <div
                    key={course.id}
                    onClick={() => handleSelectCourse(course)}
                    className={`rounded-2xl p-5 border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white border-blue-600 shadow-md ring-2 ring-blue-500/20'
                        : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                          isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                        }`}>
                          <Monitor className="w-4 h-4" />
                        </div>
                        <h3 className="font-bold text-slate-900 text-base">
                          {lang === 'as' ? course.titleAs : course.titleEn}
                        </h3>
                      </div>

                      {course.badge && (
                        <span className="text-[10px] font-bold text-blue-900 bg-blue-100 px-2 py-0.5 rounded-full shrink-0">
                          {course.badge}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed mb-3">
                      {lang === 'as' ? course.overviewAs : course.overviewEn}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 font-semibold text-slate-700">
                          <Clock className="w-3.5 h-3.5 text-blue-600" />
                          <span>{course.duration}</span>
                        </span>
                        <span aria-hidden="true" className="text-slate-300">·</span>
                        <span>{course.level}</span>
                      </div>
                      <span className="text-blue-700 font-bold hover:text-blue-950 py-0.5 px-2 rounded-md bg-blue-50 text-[11px]">
                        {lang === 'as' ? 'পাঠ্যক্ৰম চাওক' : 'View Syllabus'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Course Deep Dive Inspector */}
          <div ref={syllabusRef} id="course-syllabus-details" className="lg:col-span-5 sticky top-20 scroll-mt-20 sm:scroll-mt-24">
            <div className={`rounded-2xl bg-white p-6 border transition-all duration-300 space-y-6 ${
              isSyllabusHighlighted
                ? 'border-blue-500 ring-4 ring-blue-400/40 shadow-xl scale-[1.01] bg-blue-50/20'
                : 'border-slate-200 shadow-md'
            }`}>
              {/* Card Title & Badge */}
              <div className="pb-4 border-b border-slate-100">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono font-medium text-blue-700 uppercase">
                    Course Syllabus & Schedule
                  </span>
                  {selectedCourse.badge && (
                    <span className="text-[10px] font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                      {selectedCourse.badge}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-slate-900 leading-tight">
                  {lang === 'as' ? selectedCourse.titleAs : selectedCourse.titleEn}
                </h3>
                <p className="text-xs text-slate-600 mt-2">
                  {lang === 'as' ? selectedCourse.overviewAs : selectedCourse.overviewEn}
                </p>
              </div>

              {/* Course Meta Info Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-500 block text-[11px] font-medium">
                    {lang === 'as' ? 'সময়সীমা' : 'Course Duration'}
                  </span>
                  <span className="font-bold text-slate-900 font-mono mt-0.5 block">
                    {selectedCourse.duration}
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-500 block text-[11px] font-medium">
                    {lang === 'as' ? 'প্ৰায়োগিক লেব' : 'Lab Practical'}
                  </span>
                  <span className="font-bold text-emerald-700 mt-0.5 block">
                    {selectedCourse.practicalLabs ? '100% Guaranteed Daily' : 'Theory & Practical'}
                  </span>
                </div>
              </div>

              {/* Batch Timings */}
              <div className="bg-blue-50/70 p-3.5 rounded-xl border border-blue-100 text-xs">
                <div className="flex items-center gap-2 font-bold text-blue-950 mb-1">
                  <Clock className="w-3.5 h-3.5 text-blue-700" />
                  <span>{lang === 'as' ? 'উপলব্ধ বেচৰ সময়সূচী:' : 'Daily Batch Timings:'}</span>
                </div>
                <p className="text-blue-900 font-medium">
                  {lang === 'as' ? selectedCourse.timingAs : selectedCourse.timingEn}
                </p>
              </div>

              {/* Syllabus Breakdown */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
                  {lang === 'as' ? 'পাঠ্যক্ৰমৰ মূল বিষয়সমূহ (Syllabus):' : 'Key Curriculum Modules:'}
                </h4>
                <div className="space-y-2">
                  {(lang === 'as' ? selectedCourse.syllabusAs : selectedCourse.syllabusEn).map((mod, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-800 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{mod}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTAs */}
              <div className="pt-4 border-t border-slate-100 space-y-2.5">
                <button
                  onClick={() => {
                    onSelectCourseForAdmission(
                      lang === 'as' ? selectedCourse.titleAs : selectedCourse.titleEn
                    );
                    setActiveTab('enquire');
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <span>{lang === 'as' ? 'এই পাঠ্যক্ৰমত নামভৰ্তিৰ আবেদন কৰক' : 'Apply for Admission in this Course'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleWhatsAppCourseInquiry(selectedCourse)}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{lang === 'as' ? 'হোৱাটছএপত মাচুল আৰু আসন সোধক' : 'Ask Fees & Seats on WhatsApp'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
