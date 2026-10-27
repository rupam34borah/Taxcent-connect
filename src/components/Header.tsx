import React, { useState } from 'react';
import { ActiveTab, Language } from '../types';
import { PWAInstallButton } from './PWAInstallButton';
import { Phone, Globe, HelpCircle, Menu, X, ArrowRight, FileText, Monitor, Landmark, MessageSquare, MapPin, Calculator } from 'lucide-react';
import { BUSINESS_CONTACTS } from '../data/content';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  lang: Language;
  setLang: (lang: Language) => void;
  onOpenDeploymentGuide: () => void;
  onOpenQuickCallback: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  lang,
  setLang,
  onOpenDeploymentGuide,
  onOpenQuickCallback,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#0a2540] text-white border-b border-sky-950/60 shadow-md w-full overflow-hidden">
        <div className="max-w-7xl mx-auto px-2.5 sm:px-6 h-16 flex items-center justify-between gap-1.5 sm:gap-4 md:gap-8">
          {/* Zone 1: Brand Wordmark */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2 sm:gap-2.5 text-left focus:outline-hidden group cursor-pointer whitespace-nowrap shrink-0 min-w-0"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center font-black text-white text-base sm:text-lg tracking-wider shadow-inner group-hover:scale-105 transition-transform shrink-0">
              T
            </div>
            <div className="min-w-0">
              <span className="text-sm sm:text-lg font-bold tracking-tight text-white block leading-none truncate">
                Taxcent Connect
              </span>
              <span className="text-[9px] sm:text-[10px] text-sky-200/80 font-medium tracking-wide block mt-0.5 sm:mt-1 truncate max-w-[125px] sm:max-w-none">
                {lang === 'as' ? 'ৰণবাৰী বজাৰ · লখিমপুৰ' : 'Ranabari Market · Lakhimpur'}
              </span>
            </div>
          </button>

          {/* Zone 2: Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-200">
            <button
              onClick={() => handleNavClick('home')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
                activeTab === 'home'
                  ? 'text-sky-300 font-semibold border-b-2 border-sky-400'
                  : 'hover:text-white'
              }`}
            >
              {lang === 'as' ? 'মুখ্যপৃষ্ঠা' : 'Home'}
            </button>
            <button
              onClick={() => handleNavClick('tax')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
                activeTab === 'tax'
                  ? 'text-sky-300 font-semibold border-b-2 border-sky-400'
                  : 'hover:text-white'
              }`}
            >
              {lang === 'as' ? 'কৰ আৰু একাউণ্ট' : 'Tax & Accounting'}
            </button>
            <button
              onClick={() => handleNavClick('estimator')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'estimator'
                  ? 'text-sky-300 font-semibold border-b-2 border-sky-400'
                  : 'hover:text-white'
              }`}
            >
              <Calculator className="w-3.5 h-3.5 text-sky-400" />
              <span>{lang === 'as' ? 'কৰ কেলকুলেটৰ' : 'Quick Tax Estimator'}</span>
            </button>
            <button
              onClick={() => handleNavClick('courses')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
                activeTab === 'courses'
                  ? 'text-sky-300 font-semibold border-b-2 border-sky-400'
                  : 'hover:text-white'
              }`}
            >
              {lang === 'as' ? 'কম্পিউটাৰ পাঠ্যক্ৰম' : 'Computer Courses'}
            </button>
            <button
              onClick={() => handleNavClick('csc')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
                activeTab === 'csc'
                  ? 'text-sky-300 font-semibold border-b-2 border-sky-400'
                  : 'hover:text-white'
              }`}
            >
              {lang === 'as' ? 'চিএছচি সেৱা' : 'CSC Citizen Services'}
            </button>
            <button
              onClick={() => handleNavClick('contact')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
                activeTab === 'contact'
                  ? 'text-sky-300 font-semibold border-b-2 border-sky-400'
                  : 'hover:text-white'
              }`}
            >
              {lang === 'as' ? 'ঠিকনা আৰু যোগাযোগ' : 'Contact & Location'}
            </button>
          </nav>

          {/* Zone 3: Primary Action Zone */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Always Visible Download App Button on Top */}
            <PWAInstallButton lang={lang} />

            {/* Language Switcher (EN | অসমীয়া) */}
            <button
              onClick={() => setLang(lang === 'en' ? 'as' : 'en')}
              className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-sky-950/80 border border-sky-800/60 text-xs font-semibold text-sky-200 hover:bg-sky-900 transition-colors cursor-pointer shrink-0"
              title="Toggle English / Assamese"
            >
              <Globe className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span className="font-bold text-[11px] sm:text-xs">{lang === 'en' ? 'অসমীয়া' : 'EN'}</span>
            </button>

            {/* Primary Enquire CTA (Desktop / Tablet only; mobile has hero + bottom bar + drawer) */}
            <button
              onClick={() => handleNavClick('enquire')}
              className="hidden sm:inline-flex items-center px-3 sm:px-3.5 py-1.5 sm:py-2 text-xs font-bold rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 transition-all shadow-sm active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
            >
              {lang === 'as' ? 'অনুসন্ধান' : 'Enquire'}
            </button>

            {/* Mobile / Tablet Menu Button (☰ Hamburger) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white transition-colors cursor-pointer flex items-center justify-center shrink-0 lg:hidden active:scale-95"
              aria-label="Toggle Menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-sky-300" />
              ) : (
                <Menu className="w-5 h-5 text-white" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Slide-Down Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-x-0 top-16 bottom-0 z-30 bg-slate-950/70 backdrop-blur-md lg:hidden animate-fade-in flex flex-col justify-between">
          <div className="bg-[#0a2540] border-b border-sky-900 p-5 shadow-2xl space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-2">
              {lang === 'as' ? 'নেভিগেচন মেনু' : 'Navigation Menu'}
            </div>

            <div className="space-y-1">
              <button
                onClick={() => handleNavClick('home')}
                className={`w-full flex items-center justify-between p-3 rounded-xl text-left text-sm font-semibold transition-colors ${
                  activeTab === 'home' ? 'bg-sky-500 text-slate-950' : 'text-slate-200 hover:bg-white/10'
                }`}
              >
                <span>{lang === 'as' ? 'মুখ্যপৃষ্ঠা (Home)' : 'Home'}</span>
                <ArrowRight className="w-4 h-4 opacity-70" />
              </button>

              <button
                onClick={() => handleNavClick('tax')}
                className={`w-full flex items-center justify-between p-3 rounded-xl text-left text-sm font-semibold transition-colors ${
                  activeTab === 'tax' ? 'bg-sky-500 text-slate-950' : 'text-slate-200 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-sky-400" />
                  <span>{lang === 'as' ? '১. টেক্সচেণ্ট কনচাল্টিং (কৰ আৰু জিএছটি)' : '1. Taxcent Consulting (Tax & GST)'}</span>
                </div>
                <ArrowRight className="w-4 h-4 opacity-70" />
              </button>

              <button
                onClick={() => handleNavClick('estimator')}
                className={`w-full flex items-center justify-between p-3 rounded-xl text-left text-sm font-semibold transition-colors ${
                  activeTab === 'estimator' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-200 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Calculator className="w-4 h-4 text-emerald-400" />
                  <span>{lang === 'as' ? 'দ্ৰুত আয়কৰ কেলকুলেটৰ (Quick Tax Estimator)' : 'Quick Tax Estimator (AY 2025-26)'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    AY 25-26
                  </span>
                  <ArrowRight className="w-4 h-4 opacity-70" />
                </div>
              </button>

              <button
                onClick={() => handleNavClick('courses')}
                className={`w-full flex items-center justify-between p-3 rounded-xl text-left text-sm font-semibold transition-colors ${
                  activeTab === 'courses' ? 'bg-sky-500 text-slate-950' : 'text-slate-200 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Monitor className="w-4 h-4 text-blue-400" />
                  <span>{lang === 'as' ? '২. কোৱাণ্টাম ইনষ্টিটিউট (কম্পিউটাৰ পাঠ্যক্ৰম)' : '2. Quantum Learning (Courses)'}</span>
                </div>
                <ArrowRight className="w-4 h-4 opacity-70" />
              </button>

              <button
                onClick={() => handleNavClick('csc')}
                className={`w-full flex items-center justify-between p-3 rounded-xl text-left text-sm font-semibold transition-colors ${
                  activeTab === 'csc' ? 'bg-sky-500 text-slate-950' : 'text-slate-200 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Landmark className="w-4 h-4 text-emerald-400" />
                  <span>{lang === 'as' ? '৩. চিএছচি ৰণবাৰী (নাগৰিক সেৱা)' : '3. CSC Ranabari (Citizen Services)'}</span>
                </div>
                <ArrowRight className="w-4 h-4 opacity-70" />
              </button>

              <button
                onClick={() => handleNavClick('contact')}
                className={`w-full flex items-center justify-between p-3 rounded-xl text-left text-sm font-semibold transition-colors ${
                  activeTab === 'contact' ? 'bg-sky-500 text-slate-950' : 'text-slate-200 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-amber-400" />
                  <span>{lang === 'as' ? 'কাৰ্যালয়ৰ ঠিকনা আৰু যোগাযোগ' : 'Office Location & Contact'}</span>
                </div>
                <ArrowRight className="w-4 h-4 opacity-70" />
              </button>

              <button
                onClick={() => handleNavClick('about')}
                className={`w-full flex items-center justify-between p-3 rounded-xl text-left text-sm font-semibold transition-colors ${
                  activeTab === 'about' ? 'bg-sky-500 text-slate-950' : 'text-slate-200 hover:bg-white/10'
                }`}
              >
                <span>{lang === 'as' ? 'আমাৰ বিষয়ে (About Us)' : 'About Us'}</span>
                <ArrowRight className="w-4 h-4 opacity-70" />
              </button>

              <button
                onClick={() => handleNavClick('enquire')}
                className={`w-full flex items-center justify-between p-3 rounded-xl text-left text-sm font-bold transition-colors ${
                  activeTab === 'enquire' ? 'bg-sky-500 text-slate-950' : 'text-sky-300 hover:bg-white/10'
                }`}
              >
                <span>{lang === 'as' ? 'অনলাইন অনুসন্ধান / নামভৰ্তি ফৰ্ম' : 'Online Enquiry & Admission Form'}</span>
                <ArrowRight className="w-4 h-4 opacity-70" />
              </button>
            </div>

            {/* Direct Calling strip inside Menu */}
            <div className="pt-4 border-t border-sky-900/80 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 block uppercase">
                {lang === 'as' ? 'কাৰ্যালয়ত পোনপটীয়াকৈ ফোন কৰক:' : 'Call Our Office Directly:'}
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono font-bold">
                <a
                  href={`tel:${BUSINESS_CONTACTS.phone1}`}
                  className="p-2.5 rounded-xl bg-sky-900/60 border border-sky-800 text-white flex items-center justify-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5 text-sky-400" />
                  <span>{BUSINESS_CONTACTS.phone1}</span>
                </a>
                <a
                  href={`tel:${BUSINESS_CONTACTS.phone2}`}
                  className="p-2.5 rounded-xl bg-blue-900/60 border border-blue-800 text-white flex items-center justify-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5 text-blue-400" />
                  <span>{BUSINESS_CONTACTS.phone2}</span>
                </a>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenDeploymentGuide();
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 flex items-center justify-center gap-2"
              >
                <HelpCircle className="w-4 h-4 text-sky-400" />
                <span>{lang === 'as' ? 'বিনামূলীয়া হোষ্টিং আৰু মোবাইল গাইড' : 'Free Hosting & Android Setup Guide'}</span>
              </button>
            </div>
          </div>

          <div
            onClick={() => setMobileMenuOpen(false)}
            className="flex-1 cursor-pointer"
          />
        </div>
      )}
    </>
  );
};
