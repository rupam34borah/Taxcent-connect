import React from 'react';
import { ActiveTab, Language } from '../types';
import { PWAInstallButton } from './PWAInstallButton';
import { Phone, MessageSquare, Globe, HelpCircle } from 'lucide-react';
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
  return (
    <header className="sticky top-0 z-40 bg-[#0a2540] text-white border-b border-sky-950/60 shadow-md">
      {/* Top Bar 3-Zone Contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 md:gap-8">
        {/* Zone 1: Brand Wordmark (Single text/logo element) */}
        <button
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-2.5 text-left focus:outline-hidden group cursor-pointer whitespace-nowrap shrink-0"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center font-black text-white text-lg tracking-wider shadow-inner group-hover:scale-105 transition-transform">
            T
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-white block leading-none">
              Taxcent Connect
            </span>
            <span className="text-[10px] text-sky-200/80 font-medium tracking-wide block mt-1">
              {lang === 'as' ? 'ৰণবাৰী বজাৰ · লখিমপুৰ' : 'Ranabari Market · Lakhimpur'}
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links (4-5 clean single-line links) */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-200">
          <button
            onClick={() => setActiveTab('home')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
              activeTab === 'home'
                ? 'text-sky-300 font-semibold border-b-2 border-sky-400'
                : 'hover:text-white'
            }`}
          >
            {lang === 'as' ? 'মুখ্যপৃষ্ঠা' : 'Home'}
          </button>
          <button
            onClick={() => setActiveTab('tax')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
              activeTab === 'tax'
                ? 'text-sky-300 font-semibold border-b-2 border-sky-400'
                : 'hover:text-white'
            }`}
          >
            {lang === 'as' ? 'কৰ আৰু হিচাপ' : 'Tax & Accounting'}
          </button>
          <button
            onClick={() => setActiveTab('courses')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
              activeTab === 'courses'
                ? 'text-sky-300 font-semibold border-b-2 border-sky-400'
                : 'hover:text-white'
            }`}
          >
            {lang === 'as' ? 'কম্পিউটাৰ পাঠ্যক্ৰম' : 'Computer Courses'}
          </button>
          <button
            onClick={() => setActiveTab('csc')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
              activeTab === 'csc'
                ? 'text-sky-300 font-semibold border-b-2 border-sky-400'
                : 'hover:text-white'
            }`}
          >
            {lang === 'as' ? 'চিএছচি সেৱা' : 'CSC Citizen Services'}
          </button>
          <button
            onClick={() => setActiveTab('contact')}
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
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* PWA Install Button */}
          <PWAInstallButton lang={lang} />

          {/* Language Switcher (EN | অসমীয়া) */}
          <button
            onClick={() => setLang(lang === 'en' ? 'as' : 'en')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-sky-950/80 border border-sky-800/60 text-xs font-medium text-sky-200 hover:bg-sky-900 transition-colors cursor-pointer"
            title="Toggle English / Assamese"
          >
            <Globe className="w-3.5 h-3.5 text-sky-400" />
            <span className="font-semibold">{lang === 'en' ? 'অসমীয়া' : 'English'}</span>
          </button>

          {/* Guide / Deployment modal trigger */}
          <button
            onClick={onOpenDeploymentGuide}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-colors cursor-pointer"
            title="Free Deployment & Mobile Guide"
          >
            <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden xl:inline">{lang === 'as' ? 'মোবাইল গাইড' : 'App Guide'}</span>
          </button>

          {/* Quick Call Button */}
          <a
            href={`tel:${BUSINESS_CONTACTS.phone1}`}
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600/30 border border-sky-500/40 text-xs font-semibold text-sky-100 hover:bg-sky-600/50 transition-colors whitespace-nowrap"
          >
            <Phone className="w-3.5 h-3.5 text-sky-300" />
            <span>{BUSINESS_CONTACTS.phone1}</span>
          </a>

          {/* Primary Enquire CTA */}
          <button
            onClick={() => setActiveTab('enquire')}
            className="px-3.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 transition-all shadow-sm active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
          >
            {lang === 'as' ? 'অনুসন্ধান' : 'Enquire Now'}
          </button>
        </div>
      </div>
    </header>
  );
};
