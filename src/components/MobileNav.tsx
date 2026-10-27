import React from 'react';
import { ActiveTab, Language } from '../types';
import { Home, FileText, Monitor, Landmark, MapPin, Phone, MessageCircle } from 'lucide-react';
import { BUSINESS_CONTACTS } from '../data/content';

interface MobileNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  lang: Language;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  setActiveTab,
  lang,
}) => {
  return (
    <>
      {/* Floating Speed Dial on Mobile Right Side (Call + WhatsApp) */}
      <div className="fixed bottom-20 right-4 z-40 flex flex-col gap-2.5 sm:hidden">
        <a
          href={`https://wa.me/91${BUSINESS_CONTACTS.phone1}?text=${encodeURIComponent('Hello Taxcent Connect, I have an enquiry.')}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp Us"
          className="w-11 h-11 rounded-full bg-[#25D366] text-slate-950 flex items-center justify-center shadow-lg active:scale-95 transition-transform"
        >
          <MessageCircle className="w-5 h-5" />
        </a>
        <a
          href={`tel:${BUSINESS_CONTACTS.phone1}`}
          aria-label="Call Now"
          className="w-11 h-11 rounded-full bg-[#0a2540] text-sky-400 flex items-center justify-center shadow-lg border border-sky-800 active:scale-95 transition-transform"
        >
          <Phone className="w-5 h-5" />
        </a>
      </div>

      {/* Fixed Bottom Tab Bar (Navigation Anchor) */}
      <nav aria-label="Mobile Navigation" className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 lg:hidden shadow-lg">
        <div className="grid grid-cols-5 items-center h-16 max-w-lg mx-auto px-1">
          {/* Tab 1: Home */}
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] cursor-pointer transition-colors ${
              activeTab === 'home'
                ? 'text-sky-700 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Home className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">
              {lang === 'as' ? 'মুখ্যপৃষ্ঠা' : 'Home'}
            </span>
          </button>

          {/* Tab 2: Taxcent */}
          <button
            onClick={() => setActiveTab('tax')}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] cursor-pointer transition-colors ${
              activeTab === 'tax'
                ? 'text-sky-700 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">
              {lang === 'as' ? 'কৰ আৰু একাউণ্ট' : 'Tax & Acc'}
            </span>
          </button>

          {/* Tab 3: Quantum Courses */}
          <button
            onClick={() => setActiveTab('courses')}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] cursor-pointer transition-colors ${
              activeTab === 'courses'
                ? 'text-blue-700 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Monitor className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">
              {lang === 'as' ? 'কম্পিউটাৰ' : 'Courses'}
            </span>
          </button>

          {/* Tab 4: CSC */}
          <button
            onClick={() => setActiveTab('csc')}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] cursor-pointer transition-colors ${
              activeTab === 'csc'
                ? 'text-emerald-700 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Landmark className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">
              {lang === 'as' ? 'চিএছচি সেৱা' : 'CSC'}
            </span>
          </button>

          {/* Tab 5: Contact & Location */}
          <button
            onClick={() => setActiveTab('contact')}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] cursor-pointer transition-colors ${
              activeTab === 'contact'
                ? 'text-sky-700 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <MapPin className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">
              {lang === 'as' ? 'ঠিকনা' : 'Contact'}
            </span>
          </button>
        </div>
      </nav>
    </>
  );
};
