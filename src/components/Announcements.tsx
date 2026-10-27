import React from 'react';
import { ActiveTab, Language } from '../types';
import { ANNOUNCEMENTS, BUSINESS_CONTACTS } from '../data/content';
import { Bell, AlertCircle, Calendar, ArrowRight, MessageCircle } from 'lucide-react';

interface AnnouncementsProps {
  lang: Language;
  setActiveTab: (tab: ActiveTab) => void;
}

export const Announcements: React.FC<AnnouncementsProps> = ({
  lang,
  setActiveTab,
}) => {
  return (
    <section className="py-12 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-sky-700 tracking-wider uppercase mb-1">
              <Bell className="w-3.5 h-3.5 text-sky-600 animate-bounce" />
              <span>{lang === 'as' ? 'গুৰুত্বপূৰ্ণ জাননী আৰু শেহতীয়া তাৰিখ' : 'Important Alerts & Deadlines'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {lang === 'as' ? 'কৰ, নামভৰ্তি আৰু সেৱাৰ শেহতীয়া খবৰ' : 'Latest Announcements & Statutory Deadlines'}
            </h2>
          </div>

          <button
            onClick={() => setActiveTab('enquire')}
            className="self-start sm:self-auto text-xs font-bold text-sky-800 hover:text-sky-950 flex items-center gap-1 cursor-pointer"
          >
            <span>{lang === 'as' ? 'আমাক প্ৰশ্ন সোধক' : 'Have a Question?'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ANNOUNCEMENTS.map((item) => (
            <div
              key={item.id}
              className={`rounded-2xl p-6 border flex flex-col justify-between ${
                item.urgent
                  ? 'bg-amber-50/50 border-amber-200 shadow-xs'
                  : 'bg-slate-50 border-slate-200 shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                    item.urgent
                      ? 'bg-amber-100 text-amber-900'
                      : 'bg-sky-100 text-sky-900'
                  }`}>
                    {item.tag}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>{item.date}</span>
                  </div>
                </div>

                <h3 className="font-bold text-slate-900 text-base mb-2 leading-snug">
                  {lang === 'as' ? item.titleAs : item.titleEn}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {lang === 'as' ? item.contentAs : item.contentEn}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-200/60 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  {lang === 'as' ? 'ৰণবাৰী বজাৰ কাৰ্যালয়' : 'Ranabari Market Desk'}
                </span>
                <a
                  href={`https://wa.me/91${BUSINESS_CONTACTS.phone1}?text=${encodeURIComponent(`Hi, enquiring about: ${item.titleEn}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-sky-700 hover:text-sky-900 flex items-center gap-1"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
