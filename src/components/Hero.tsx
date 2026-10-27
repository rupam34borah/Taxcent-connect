import React from 'react';
import { ActiveTab, Language } from '../types';
import { BUSINESS_CONTACTS, TRANSLATIONS } from '../data/content';
import { Phone, MessageCircle, MapPin, ArrowRight, ShieldCheck, Award, Users, BookOpen } from 'lucide-react';

interface HeroProps {
  lang: Language;
  setActiveTab: (tab: ActiveTab) => void;
  onSelectServiceForEnquiry: (serviceName: string) => void;
}

export const Hero: React.FC<HeroProps> = ({
  lang,
  setActiveTab,
  onSelectServiceForEnquiry,
}) => {
  const t = TRANSLATIONS[lang];

  const handleWhatsAppChat = () => {
    const text = encodeURIComponent(
      lang === 'as'
        ? `নমস্কাৰ, মই ৰণবাৰীৰ Taxcent Connect ৰ সেৱাৰ বিষয়ে জানিব বিচাৰোঁ।`
        : `Hello, I would like to enquire about your services at Taxcent Connect (Ranabari Market, Lakhimpur).`
    );
    window.open(`https://wa.me/91${BUSINESS_CONTACTS.phone1}?text=${text}`, '_blank');
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#0a2540] via-[#0f2e4d] to-slate-900 text-white pt-8 pb-16 lg:pt-14 lg:pb-20 border-b border-sky-900/50">
      {/* Subtle background ambient mesh */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.12),transparent_50%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Core Value Proposition & CTAs */}
          <div className="lg:col-span-7 space-y-6">
            {/* Location & Trust Tag */}
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-sky-300 bg-sky-950/70 border border-sky-800/60 rounded-full px-3.5 py-1.5">
              <MapPin className="w-3.5 h-3.5 text-sky-400" />
              <span>{t.heroTag}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white text-balance">
              {t.heroTitle}
            </h1>

            {/* Sub-headline */}
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
              {t.heroSub}
            </p>

            {/* 4 Action Buttons Cluster */}
            <div className="pt-2 flex flex-wrap gap-3 sm:gap-4">
              {/* Primary: Enquire Now */}
              <button
                onClick={() => setActiveTab('enquire')}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm shadow-md hover:shadow-sky-500/20 transition-all cursor-pointer min-h-[48px]"
              >
                <span>{t.enquireNow}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Secondary: WhatsApp */}
              <button
                onClick={handleWhatsAppChat}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-slate-950 font-bold text-sm shadow-md transition-all cursor-pointer min-h-[48px]"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{t.whatsappUs}</span>
              </button>

              {/* Tertiary: Call Now */}
              <a
                href={`tel:${BUSINESS_CONTACTS.phone1}`}
                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm border border-white/20 transition-all min-h-[48px]"
              >
                <Phone className="w-4 h-4 text-sky-300" />
                <span>{BUSINESS_CONTACTS.phone1}</span>
              </a>

              {/* Find Location */}
              <button
                onClick={() => setActiveTab('contact')}
                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-sky-200 text-sm font-semibold border border-sky-900/60 transition-all min-h-[48px] cursor-pointer"
              >
                <MapPin className="w-4 h-4 text-sky-400" />
                <span>{t.getDirections}</span>
              </button>
            </div>

            {/* Quantitative & Editorial Proof Points */}
            <div className="pt-4 grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-sky-950/80 text-xs text-slate-300">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-sky-400 shrink-0" />
                <span>
                  <strong className="block text-white font-semibold">100% Verified</strong>
                  {lang === 'as' ? 'বৈধ চৰকাৰী ৰচিদ' : 'Authorized Receipts'}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Users className="w-5 h-5 text-sky-400 shrink-0" />
                <span>
                  <strong className="block text-white font-semibold">2,500+ Clients</strong>
                  {lang === 'as' ? 'লখিমপুৰৰ স্থানীয় গ্ৰাহক' : 'Served in Lakhimpur'}
                </span>
              </div>
              <div className="flex items-center gap-2.5 col-span-2 sm:col-span-1">
                <BookOpen className="w-5 h-5 text-sky-400 shrink-0" />
                <span>
                  <strong className="block text-white font-semibold">1-on-1 Labs</strong>
                  {lang === 'as' ? 'ব্যক্তিগত কম্পিউটাৰ' : 'Individual PC Training'}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Asset with Featured Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-sky-900/60 bg-slate-900 group">
              <img
                src="/src/assets/images/hero_tax_consulting_1793034988759.jpg"
                alt="Taxcent Consulting & Technology Centre in Lakhimpur, Assam"
                className="w-full h-[320px] sm:h-[400px] object-cover group-hover:scale-102 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a2540] via-[#0a2540]/30 to-transparent" />

              {/* Floating Overlay Badge on Hero Image */}
              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-slate-950/85 backdrop-blur-md border border-white/10 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-white text-sm">
                    {lang === 'as' ? 'ৰণবাৰী বজাৰৰ একমাত্ৰ সমাধান' : 'Ranabari Market Integrated Hub'}
                  </span>
                  <span className="text-sky-400 font-mono font-medium">NH-15</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {lang === 'as' 
                    ? 'ব্যৱসায়ৰ কৰ ফাইলিং, কম্পিউটাৰ শিক্ষা আৰু চৰকাৰী অনলাইন আবেদন — সকলো একে স্থানতে।' 
                    : 'Tax consulting, certified computer courses, and online citizen services — all under one roof.'}
                </p>
                <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
                  <span className="text-sky-300 font-medium">
                    {lang === 'as' ? 'কাৰ্যালয় খোলাৰ সময়: পুৱা ৮:৩০' : 'Open Daily: 8:30 AM'}
                  </span>
                  <a
                    href={`tel:${BUSINESS_CONTACTS.phone2}`}
                    className="text-white hover:text-sky-300 font-semibold flex items-center gap-1"
                  >
                    <Phone className="w-3 h-3 text-sky-400" />
                    <span>{BUSINESS_CONTACTS.phone2}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
