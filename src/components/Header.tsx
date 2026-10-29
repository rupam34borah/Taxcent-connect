import React, { useState, useEffect, useRef } from 'react';
import { ActiveTab, Language } from '../types';
import { PWAInstallButton } from './PWAInstallButton';
import { 
  Phone, 
  Globe, 
  HelpCircle, 
  Menu, 
  X, 
  ArrowRight, 
  FileText, 
  Monitor, 
  Landmark, 
  MessageSquare, 
  MapPin, 
  Calculator, 
  ShieldCheck, 
  GraduationCap,
  LogIn,
  LogOut,
  User,
  Lock,
  ChevronDown
} from 'lucide-react';
import { BUSINESS_CONTACTS } from '../data/content';
import { useAuth } from '../context/AuthContext';

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
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMoreDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    setMoreDropdownOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isMoreActive = ['tax', 'estimator', 'academic', 'verify', 'contact', 'about'].includes(activeTab);

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#0a2540] text-white border-b border-sky-950/60 shadow-md w-full">
        <div className="max-w-7xl mx-auto px-2.5 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4 lg:gap-6">
          {/* Zone 1: Brand Wordmark (Navigates to Home) */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2 sm:gap-2.5 text-left focus:outline-hidden group cursor-pointer whitespace-nowrap shrink-0 min-w-0"
            title="Taxcent Connect - Return to Home"
            aria-label="Taxcent Connect Home"
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

          {/* Zone 2: Navigation Links (Desktop: CSC, Computer Courses + Dropdown for other items) */}
          <nav className="hidden lg:flex items-center gap-5 xl:gap-7 text-sm font-medium text-slate-200 shrink-0">

            {/* 2. CSC Citizen Services */}
            <button
              onClick={() => handleNavClick('csc')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'csc'
                  ? 'text-sky-300 font-semibold border-b-2 border-sky-400'
                  : 'hover:text-white'
              }`}
            >
              <Landmark className="w-4 h-4 text-emerald-400" />
              <span>{lang === 'as' ? 'চিএছচি সেৱা' : 'CSC Citizen Services'}</span>
            </button>

            {/* 3. Computer Courses */}
            <button
              onClick={() => handleNavClick('courses')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'courses'
                  ? 'text-sky-300 font-semibold border-b-2 border-sky-400'
                  : 'hover:text-white'
              }`}
            >
              <Monitor className="w-4 h-4 text-sky-400" />
              <span>{lang === 'as' ? 'কম্পিউটাৰ পাঠ্যক্ৰম' : 'Computer Courses'}</span>
            </button>

            {/* 4. Drop-down Menu for other items */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap text-xs font-bold ${
                  isMoreActive
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-400/40 shadow-sm'
                    : moreDropdownOpen
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60'
                }`}
                aria-expanded={moreDropdownOpen}
                aria-haspopup="true"
              >
                <span>{lang === 'as' ? 'অধিক সেৱা' : 'More Services'}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${moreDropdownOpen ? 'rotate-180 text-sky-400' : 'text-slate-400'}`} />
              </button>

              {/* Floating Dropdown Panel */}
              {moreDropdownOpen && (
                <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-sky-800/80 shadow-2xl p-2 z-50 animate-fade-in space-y-1">
                  {/* Tax & Accounting */}
                  <button
                    onClick={() => handleNavClick('tax')}
                    className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                      activeTab === 'tax'
                        ? 'bg-sky-500/20 text-white border border-sky-500/30'
                        : 'hover:bg-slate-800/80 text-slate-200'
                    }`}
                  >
                    <FileText className="w-4 h-4 text-sky-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-white">
                        {lang === 'as' ? 'কৰ আৰু একাউণ্ট' : 'Tax & Accounting'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {lang === 'as' ? 'আইটিআৰ, জিএছটি আৰু পঞ্জীয়ন' : 'ITR, GST, TDS & Consulting'}
                      </div>
                    </div>
                  </button>

                  {/* Quick Tax Estimator */}
                  <button
                    onClick={() => handleNavClick('estimator')}
                    className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                      activeTab === 'estimator'
                        ? 'bg-sky-500/20 text-white border border-sky-500/30'
                        : 'hover:bg-slate-800/80 text-slate-200'
                    }`}
                  >
                    <Calculator className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>{lang === 'as' ? 'দ্ৰুত কৰ কেলকুলেটৰ' : 'Quick Tax Estimator'}</span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-500/20 text-emerald-300 font-mono">AY 27-28</span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {lang === 'as' ? 'নতুন আৰু পুৰণি কৰ তুলনা' : 'New vs Old tax regime comparison'}
                      </div>
                    </div>
                  </button>

                  {/* Student & Staff Academic Portal */}
                  <button
                    onClick={() => handleNavClick('academic')}
                    className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                      activeTab === 'academic'
                        ? 'bg-sky-500/20 text-white border border-sky-500/30'
                        : 'hover:bg-slate-800/80 text-slate-200'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4 text-sky-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-white">
                        {user?.role === 'admin'
                          ? (lang === 'as' ? 'প্ৰশাসন কন্স’ল (Admin Console)' : 'Admin Console (Academic)')
                          : user?.role === 'staff'
                          ? (lang === 'as' ? 'কৰ্মচাৰী কন্স’ল (Staff Console)' : 'Staff Console (Data Entry)')
                          : user?.role === 'student'
                          ? (lang === 'as' ? 'মোৰ শৈক্ষিক পৰ্টেল' : 'My Student Portal')
                          : (lang === 'as' ? 'শৈক্ষিক পৰ্টেল' : 'Quantum Academic Portal')}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {user?.role === 'admin'
                          ? 'Executive dashboard, rosters & approvals'
                          : user?.role === 'staff'
                          ? 'Admissions, batch attendance & marks entry'
                          : user?.role === 'student'
                          ? 'My profile, results, certificates & mock tests'
                          : 'Student marksheets & staff console'}
                      </div>
                    </div>
                  </button>

                  {/* Verify Certificate */}
                  <button
                    onClick={() => handleNavClick('verify')}
                    className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                      activeTab === 'verify'
                        ? 'bg-sky-500/20 text-white border border-sky-500/30'
                        : 'hover:bg-slate-800/80 text-slate-200'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-white">
                        {lang === 'as' ? 'প্ৰমাণপত্ৰ পৰীক্ষণ' : 'Verify Certificate'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {lang === 'as' ? 'প্ৰমাণপত্ৰৰ নিৰীক্ষণ (ৰাজহুৱা)' : 'Public credential verification'}
                      </div>
                    </div>
                  </button>

                  {/* Contact & Location */}
                  <button
                    onClick={() => handleNavClick('contact')}
                    className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                      activeTab === 'contact'
                        ? 'bg-sky-500/20 text-white border border-sky-500/30'
                        : 'hover:bg-slate-800/80 text-slate-200'
                    }`}
                  >
                    <MapPin className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-white">
                        {lang === 'as' ? 'ঠিকনা আৰু যোগাযোগ' : 'Contact & Location'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {lang === 'as' ? 'ৰণবাৰী বজাৰ, এন.এইচ-১৫' : 'Ranabari Market, NH-15'}
                      </div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </nav>

          {/* Zone 3: Primary Action Zone */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
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

            {/* Desktop Only Login / Authenticated User Pill (Header only for desktop version) */}
            {!isAuthenticated ? (
              <button
                onClick={() => openAuthModal('student')}
                className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 text-xs font-bold rounded-xl bg-slate-800/90 hover:bg-slate-700 text-sky-200 border border-sky-600/60 transition-all shadow-sm active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
                title="Login as Student, Staff, or Admin"
              >
                <LogIn className="w-3.5 h-3.5 text-sky-400" />
                <span>{lang === 'as' ? 'লগইন' : 'Login'}</span>
              </button>
            ) : (
              <div className="hidden lg:flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => handleNavClick('academic')}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-sky-950/90 border border-sky-600 text-xs font-bold text-white hover:bg-sky-900 transition-colors cursor-pointer"
                  title={`${user?.name} (${user?.role}) - Open Portal`}
                >
                  <span className={`w-2 h-2 rounded-full ${user?.role === 'admin' ? 'bg-amber-400' : user?.role === 'staff' ? 'bg-sky-400' : 'bg-emerald-400'}`} />
                  <span className="max-w-[100px] truncate">{user?.name.split(' ')[0]}</span>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-sky-900 text-sky-300 border border-sky-700">
                    {user?.role}
                  </span>
                </button>
                <button
                  onClick={logout}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/80 hover:text-rose-300 hover:border-rose-700/60 border border-slate-700 text-slate-300 transition-all cursor-pointer"
                  title="Log Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Primary Enquire CTA (Desktop / Tablet only) */}
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

      {/* Slide-Down Mobile Navigation Menu (Login button is in the menu for mobile) */}
      {mobileMenuOpen && (
        <div className="fixed inset-x-0 top-16 bottom-0 z-30 bg-slate-950/70 backdrop-blur-md lg:hidden animate-fade-in flex flex-col justify-between">
          <div className="bg-[#0a2540] border-b border-sky-900 p-5 shadow-2xl space-y-4 max-h-[80vh] overflow-y-auto">
            {/* Mobile Menu Top: Login Button / Authenticated Session Card */}
            {!isAuthenticated ? (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-sky-950 via-slate-900 to-[#0a2540] border border-sky-800/80 flex items-center justify-between gap-3 shadow-md">
                <div>
                  <div className="flex items-center gap-1.5 text-sky-300 text-xs font-bold">
                    <Lock className="w-3.5 h-3.5 text-sky-400" />
                    <span>{lang === 'as' ? 'ছাত্ৰ আৰু কৰ্মচাৰী লগইন' : 'Academic Portal Login'}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {lang === 'as' ? 'মাৰ্কশ্বীট চাবলৈ বা তথ্য নথিভুক্ত কৰিবলৈ' : 'Student marksheets & staff data input'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal('student');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-extrabold transition-all shadow-sm active:scale-95 cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{lang === 'as' ? 'লগইন' : 'Login'}</span>
                </button>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-sky-950/90 border border-sky-700/80 flex items-center justify-between gap-3 shadow-md">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white truncate block">{user?.name}</span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40">
                      {user?.role}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block truncate font-mono mt-0.5">
                    {user?.studentIdCode || user?.email}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleNavClick('academic')}
                    className="px-2.5 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition-all cursor-pointer"
                  >
                    Portal
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="p-1.5 rounded-xl bg-slate-800 text-rose-300 hover:bg-rose-950 border border-rose-800/80 text-xs font-bold transition-all cursor-pointer"
                    title="Logout"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

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
                  <span>{lang === 'as' ? 'দ্ৰুত আয়কৰ কেলকুলেটৰ (Quick Tax Estimator)' : 'Quick Tax Estimator (AY 2027-28)'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    AY 27-28
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
                onClick={() => handleNavClick('verify')}
                className={`w-full flex items-center justify-between p-3 rounded-xl text-left text-sm font-semibold transition-colors ${
                  activeTab === 'verify' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-200 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>{lang === 'as' ? 'প্ৰমাণপত্ৰ পৰীক্ষা (Verify Certificate)' : 'Verify Certificate (Authoritative Registry)'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Live
                  </span>
                  <ArrowRight className="w-4 h-4 opacity-70" />
                </div>
              </button>

              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    setMobileMenuOpen(false);
                    openAuthModal('student');
                  } else {
                    handleNavClick('academic');
                  }
                }}
                className={`w-full flex items-center justify-between p-3 rounded-xl text-left text-sm font-semibold transition-colors ${
                  activeTab === 'academic' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-200 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <GraduationCap className="w-4 h-4 text-sky-400" />
                  <span>{lang === 'as' ? 'শৈক্ষিক পৰ্টেল (ছাত্ৰ আৰু কৰ্মচাৰী)' : 'Student & Staff Academic Portal'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {!isAuthenticated && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-amber-400" />
                      Login
                    </span>
                  )}
                  <ArrowRight className="w-4 h-4 opacity-70" />
                </div>
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
