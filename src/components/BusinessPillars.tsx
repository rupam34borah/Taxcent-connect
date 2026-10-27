import React from 'react';
import { ActiveTab, Language } from '../types';
import { TRANSLATIONS, BUSINESS_CONTACTS } from '../data/content';
import { ArrowRight, FileText, Monitor, Landmark, CheckCircle2, Phone, MessageSquare } from 'lucide-react';

interface BusinessPillarsProps {
  lang: Language;
  setActiveTab: (tab: ActiveTab) => void;
}

export const BusinessPillars: React.FC<BusinessPillarsProps> = ({
  lang,
  setActiveTab,
}) => {
  const t = TRANSLATIONS[lang];

  return (
    <section className="py-12 lg:py-16 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="max-w-3xl mb-10">
          <p className="text-xs font-bold text-sky-700 tracking-wider uppercase mb-2">
            {t.ourBusinesses}
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight text-balance">
            {lang === 'as'
              ? 'তিনিটা সুকীয়া বিশেষ সেৱা, এটা নিৰ্ভৰযোগ্য ঠিকনা'
              : 'Three Specialized Operations, One Trusted Community Destination'}
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600">
            {lang === 'as'
              ? 'ব্যৱসায়ৰ কৰ আৰু আইনী হিচাপ, যুৱ প্ৰজন্মৰ কেৰিয়াৰ কম্পিউটাৰ প্ৰশিক্ষণ, আৰু চৰকাৰী অনলাইন আবেদনৰ বাবে আমাৰ সৈতে সংযোগ স্থাপন কৰক।'
              : 'Whether you run a local retail shop needing GST filing, a student seeking certified computer skills, or a citizen requiring digital application assistance.'}
          </p>
        </div>

        {/* 3 Prominent Business Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {/* Card 1: Taxcent Consulting Services */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden flex flex-col hover:border-sky-300 hover:shadow-lg transition-all">
            <div className="relative h-48 overflow-hidden bg-slate-900">
              <img
                src="/src/assets/images/hero_tax_consulting_1793034988759.jpg"
                alt="Taxcent Consulting Services Lakhimpur"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-3 left-3 bg-[#0a2540] text-sky-300 text-[11px] font-bold px-3 py-1 rounded-full shadow-md">
                Business 1
              </div>
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center font-bold">
                    <FileText className="w-4 h-4" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {t.taxcentTitle}
                  </h3>
                </div>

                <p className="text-xs font-semibold text-sky-700 mb-3">
                  {t.taxcentSub}
                </p>

                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {lang === 'as'
                    ? 'জিএছটি নতুন পঞ্জীয়ন আৰু মাহেকীয়া ৰিটাৰ্ণ, ইনকাম টেক্স ITR দাখিল, টিডিএছ, ব্যৱসায়িক একাউণ্টিং, উদ্যম MSME পঞ্জীয়ন আৰু ডিজিটেল স্বাক্ষৰ (DSC)।'
                    : 'End-to-end GST return filing, income tax returns (ITR-1/2/3/4), TDS compliance, computerized bookkeeping in Tally, PAN/TAN, and Class-3 DSC tokens.'}
                </p>

                <ul className="space-y-1.5 text-xs text-slate-700 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                    <span>{lang === 'as' ? 'জিএছটি আৰু আইটিআৰ সময়মতে দাখিল' : 'Timely GST & ITR e-Filing'}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                    <span>{lang === 'as' ? 'উদ্যম (MSME) ঋণ সহায় প্ৰমাণপত্ৰ' : 'Udyam Registration for Bank Loans'}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                    <span>{lang === 'as' ? 'প্ৰপ্ৰাইটৰ আৰু পাৰ্টনাৰশ্বিপ ডিড' : 'Partnership & Firm Formalities'}</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4 border-t border-slate-200/80 flex items-center justify-between">
                <button
                  onClick={() => setActiveTab('tax')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-800 hover:text-sky-950 transition-colors cursor-pointer"
                >
                  <span>{t.learnMore}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setActiveTab('enquire')}
                  className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  {lang === 'as' ? 'পৰামৰ্শ লওক' : 'Consult Now'}
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Quantum Learning Institute */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden flex flex-col hover:border-blue-300 hover:shadow-lg transition-all">
            <div className="relative h-48 overflow-hidden bg-slate-900">
              <img
                src="/src/assets/images/quantum_computer_lab_1793034987917.jpg"
                alt="Quantum Learning Institute Computer Training Lakhimpur"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-3 left-3 bg-blue-900 text-blue-200 text-[11px] font-bold px-3 py-1 rounded-full shadow-md">
                Business 2
              </div>
              <div className="absolute top-3 right-3 bg-amber-500 text-slate-950 text-[10px] font-bold px-2.5 py-0.5 rounded-md shadow-xs">
                {lang === 'as' ? 'নামভৰ্তি চলি আছে' : 'New Batches Open'}
              </div>
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                    <Monitor className="w-4 h-4" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {t.quantumTitle}
                  </h3>
                </div>

                <p className="text-xs font-semibold text-blue-700 mb-3">
                  {t.quantumSub}
                </p>

                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {lang === 'as'
                    ? 'ডিচিএ (DCA), এডিচিএ (ADCA), চিচিএ (CCA), টেলি প্ৰাইম আৰু জিএছটি একাউণ্টিং, এম এছ অফিচ, ফটোশ্বপ গ্ৰাফিক্স আৰু ৱেব নিৰ্মাণৰ ব্যৱহাৰিক কম্পিউটাৰ প্ৰশিক্ষণ।'
                    : 'Job-ready practical training in DCA, ADCA, Tally Prime + GST, MS Word/Excel/PowerPoint, Photoshop banner design, and modern web fundamentals.'}
                </p>

                <ul className="space-y-1.5 text-xs text-slate-700 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>{lang === 'as' ? 'প্ৰতিজন শিক্ষাৰ্থীক সুকীয়া কম্পিউটাৰ' : '1 Student Per Dedicated Computer'}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>{lang === 'as' ? 'ব্যৱহাৰিক লেব আৰু স্বীকৃতিপ্ৰাপ্ত চাৰ্টিফিকেট' : 'Hands-on Labs & Valid Certificate'}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>{lang === 'as' ? 'পুৱা আৰু সন্ধিয়াৰ সুবিধাজনক বেচ' : 'Flexible Morning & Evening Batches'}</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4 border-t border-slate-200/80 flex items-center justify-between">
                <button
                  onClick={() => setActiveTab('courses')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-800 hover:text-blue-950 transition-colors cursor-pointer"
                >
                  <span>{t.viewCourses}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setActiveTab('enquire')}
                  className="px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  {lang === 'as' ? 'নামভৰ্তি' : 'Apply'}
                </button>
              </div>
            </div>
          </div>

          {/* Card 3: CSC Ranabari */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden flex flex-col hover:border-sky-300 hover:shadow-lg transition-all">
            <div className="relative h-48 overflow-hidden bg-slate-900">
              <img
                src="/src/assets/images/csc_digital_service_1793034988430.jpg"
                alt="CSC Ranabari Citizen Services Lakhimpur"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-3 left-3 bg-[#0a2540] text-sky-300 text-[11px] font-bold px-3 py-1 rounded-full shadow-md">
                Business 3
              </div>
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    <Landmark className="w-4 h-4" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {t.cscTitle}
                  </h3>
                </div>

                <p className="text-xs font-semibold text-emerald-700 mb-3">
                  {t.cscSub}
                </p>

                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {lang === 'as'
                    ? 'চৰকাৰী পৰীক্ষাৰ অনলাইন আবেদন, সেৱা সেতু (PRC, জাতি প্ৰমাণপত্ৰ, আয়ৰ প্ৰমাণপত্ৰ), ধৰিত্ৰী জমাবন্দী, ৰেচন কাৰ্ড, ভোটাৰ কাৰ্ড, বিদ্যুৎ বিল পৰিশোধ।'
                    : 'Digital assistance with competitive recruitment applications (ADRE/APSC/Police), Assam Sewa Setu certificates, Jamabandi records, and utility bill receipts.'}
                </p>

                <ul className="space-y-1.5 text-xs text-slate-700 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{lang === 'as' ? 'নিৰ্ভুল ফটো আৰু চহী স্কেনিং' : 'Accurate Photo & Document Resizing'}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{lang === 'as' ? 'তৎক্ষণাৎ অফিচিয়েল ৰচিদ প্ৰদান' : 'Instant Official Portal Receipts'}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{lang === 'as' ? 'APDCL বিদ্যুৎ বিল পৰিশোধ' : 'Instant Electricity Bill Clearing'}</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4 border-t border-slate-200/80 flex items-center justify-between">
                <button
                  onClick={() => setActiveTab('csc')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 transition-colors cursor-pointer"
                >
                  <span>{t.viewCSC}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setActiveTab('enquire')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  {lang === 'as' ? 'সহায় বিচাৰক' : 'Assistance'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mandatory Transparency Disclaimer Box */}
        <div className="mt-8 rounded-xl bg-slate-100 p-4 sm:p-5 border border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="p-2 rounded-lg bg-slate-200 text-slate-700 shrink-0">
            <CheckCircle2 className="w-4 h-4 text-sky-700" />
          </div>
          <div className="flex-1">
            <strong className="text-slate-900 block font-semibold mb-0.5">
              {t.safetyNoticeTitle}
            </strong>
            <p className="leading-relaxed">
              {t.safetyNoticeDesc}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
