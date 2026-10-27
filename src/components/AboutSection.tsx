import React from 'react';
import { ActiveTab, Language } from '../types';
import { BUSINESS_CONTACTS } from '../data/content';
import { ShieldCheck, HeartHandshake, MapPin, Award, CheckCircle2, ArrowRight } from 'lucide-react';

interface AboutSectionProps {
  lang: Language;
  setActiveTab: (tab: ActiveTab) => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({
  lang,
  setActiveTab,
}) => {
  return (
    <section className="py-12 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <span className="text-xs font-bold text-sky-700 tracking-wider uppercase block mb-1">
            {lang === 'as' ? 'আমাৰ বিষয়ে · পৰিচয়' : 'About Taxcent Connect'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight text-balance">
            {lang === 'as'
              ? 'লখিমপুৰৰ ৰণবাৰী বজাৰত বিত্তীয় আৰু ডিজিটেল সমৰ্থনৰ এক যুগান্তকাৰী কেন্দ্ৰ'
              : 'Empowering Businesses, Students & Citizens in Lakhimpur, Assam'}
          </h2>
          <p className="mt-3 text-sm text-slate-600 leading-relaxed">
            {lang === 'as'
              ? 'তিনিটা প্ৰতিষ্ঠানক একত্ৰিত কৰি আমি গ্ৰাহকসকলক কোনো মধ্যভোগী অবিহনে, স্বচ্ছ আৰু সুলভ মূল্যত উচ্চমানৰ সেৱা প্ৰদান কৰিবলৈ বদ্ধপৰিকৰ।'
              : 'Founded at Ranabari Market along NH-15, Taxcent Connect brings taxation expertise, modern vocational computer education, and essential public digital facilitation under a single, transparent community umbrella.'}
          </p>
        </div>

        {/* 3 Value Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="rounded-2xl bg-white p-6 border border-slate-200 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center font-bold mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              {lang === 'as' ? '১০০% নিকা আৰু নিৰ্ভুল' : '100% Genuine & Transparent'}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {lang === 'as'
                ? 'আমি কোনো ভুৱা প্ৰতিশ্ৰুতি নিদিওঁ। চৰকাৰী অনলাইন প’ৰ্টেলৰ প্ৰকৃত মাচুল আৰু ৰচিদ পোনপটীয়াকৈ গ্ৰাহকক প্ৰদান কৰা হয়।'
                : 'Zero fake guarantees or misleading claims. All tax filings and government portal submissions receive legitimate system-generated acknowledgment receipts.'}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 border border-slate-200 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold mb-4">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              {lang === 'as' ? 'ব্যৱহাৰিক কৰ্মসংস্থাপনমুখী শিক্ষা' : 'Skill-First Career Education'}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {lang === 'as'
                ? 'কোৱাণ্টাম লাৰ্নিং ইনষ্টিটিউটত কেৱল তত্ত্ব নহয়, প্ৰতিজন ছাত্ৰ-ছাত্ৰীক কম্পিউটাৰত প্ৰেকটিকেল কাম আৰু একাউণ্টিং চফ্টৱেৰ হাতৰ মুঠিত তুলি দিয়া হয়।'
                : 'At Quantum Learning Institute, our priority is practical computer proficiency. Students master Tally Prime with GST, MS Office, and DTP to secure office jobs with confidence.'}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 border border-slate-200 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold mb-4">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              {lang === 'as' ? 'স্থানীয় ভাষা আৰু আন্তৰিকতা' : 'Local Assamese Support'}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {lang === 'as'
                ? 'অসমীয়া, হিন্দী আৰু ইংৰাজীত সকলো পৰামৰ্শ উপলব্ধ। জ্যেষ্ঠ নাগৰিক আৰু গ্ৰাম্য অঞ্চলৰ ৰাইজক সৰ্বাধিক মৰম আৰু ধৈৰ্য্যৰে সহায় কৰা হয়।'
                : 'Fluent assistance in Assamese, Hindi, and English. We guide rural citizens, senior citizens, and first-time digital applicants patiently without any technical intimidation.'}
            </p>
          </div>
        </div>

        {/* Community Banner */}
        <div className="rounded-2xl bg-[#0a2540] text-white p-8 border border-sky-900 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
              {lang === 'as' ? 'আপোনাৰ ব্যৱসায় বা কেৰিয়াৰৰ অগ্ৰগতিত সহায় বিচাৰে নেকি?' : 'Ready to streamline your business taxes or enroll in computer training?'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              {lang === 'as'
                ? 'আজিই ৰণবাৰী বজাৰৰ আমাৰ কাৰ্যালয়লৈ আহক বা আমাৰ সৈতে হোৱাটছএপত সংযোগ কৰক।'
                : 'Visit us today at Ranabari Market, NH-15, Lakhimpur, or send a quick WhatsApp message.'}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('enquire')}
              className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-sm transition-all cursor-pointer"
            >
              {lang === 'as' ? 'অনুসন্ধান পঠিয়াওক' : 'Send Enquiry'}
            </button>
            <a
              href={`tel:${BUSINESS_CONTACTS.phone1}`}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs border border-white/20 transition-all"
            >
              Call {BUSINESS_CONTACTS.phone1}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
