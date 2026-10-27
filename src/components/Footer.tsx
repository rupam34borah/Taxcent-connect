import React from 'react';
import { ActiveTab, Language } from '../types';
import { BUSINESS_CONTACTS } from '../data/content';
import { Phone, MapPin, MessageCircle, HelpCircle, ShieldAlert } from 'lucide-react';

interface FooterProps {
  setActiveTab: (tab: ActiveTab) => void;
  lang: Language;
  onOpenDeploymentGuide: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  setActiveTab,
  lang,
  onOpenDeploymentGuide,
}) => {
  return (
    <footer className="bg-[#0a2540] text-slate-300 border-t border-sky-950 pb-20 lg:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 pb-8 border-b border-sky-900/60">
          {/* Col 1: Wordmark & About */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-sky-500 text-slate-950 font-black flex items-center justify-center text-base">
                T
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                Taxcent Connect
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {lang === 'as'
                ? 'টেক্সচেণ্ট কনচাল্টিং, কোৱাণ্টাম লাৰ্নিং ইনষ্টিটিউট আৰু চিএছচি ৰণবাৰীৰ একত্ৰিত ডিজিটেল সেৱা কেন্দ্ৰ।'
                : 'Unified digital services platform representing Taxcent Consulting Services, Quantum Learning Institute, and CSC Ranabari.'}
            </p>
            <div className="text-xs text-slate-400 font-medium">
              Ranabari Market, NH-15, Lakhimpur, Assam
            </div>
          </div>

          {/* Col 2: Three Businesses Links */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
              Our 3 Businesses
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button
                  onClick={() => setActiveTab('tax')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  1. Taxcent Consulting (GST & ITR)
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('courses')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  2. Quantum Learning Institute (Courses)
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('csc')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  3. CSC Ranabari (Citizen Facilitation)
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('estimator')}
                  className="hover:text-white transition-colors cursor-pointer text-left text-sky-300 font-semibold flex items-center gap-1.5"
                >
                  <span>Quick Tax Estimator (AY 2027-28 / FY 2026-27)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('enquire')}
                  className="hover:text-white transition-colors cursor-pointer text-left text-sky-400 font-semibold"
                >
                  Online Enquiry & Admission Form
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Direct Phone & Help */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
              Direct Contact
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <a href={`tel:${BUSINESS_CONTACTS.phone1}`} className="hover:text-white font-mono">
                  {BUSINESS_CONTACTS.phone1Formatted}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <a href={`tel:${BUSINESS_CONTACTS.phone2}`} className="hover:text-white font-mono">
                  {BUSINESS_CONTACTS.phone2Formatted}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-3.5 h-3.5 text-[#25D366] shrink-0" />
                <a
                  href={`https://wa.me/91${BUSINESS_CONTACTS.phone1}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white"
                >
                  WhatsApp Helpdesk
                </a>
              </div>
              <div className="pt-2">
                <button
                  onClick={onOpenDeploymentGuide}
                  className="inline-flex items-center gap-1.5 text-xs text-sky-300 hover:text-white bg-sky-950/60 border border-sky-800/60 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
                  <span>Free Hosting & Android Guide</span>
                </button>
              </div>
            </div>
          </div>

          {/* Col 4: Statutory Disclaimer */}
          <div className="space-y-2 text-xs text-slate-400">
            <div className="flex items-center gap-1.5 text-amber-300 font-bold uppercase text-[11px] tracking-wide">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Public Notice</span>
            </div>
            <p className="leading-relaxed text-[11px]">
              Taxcent Consulting Services & CSC Ranabari provide independent professional facilitation. We do not represent government ministries, departments, or taxation tribunals. No refunds or government results are guaranteed.
            </p>
          </div>
        </div>

        {/* Bottom copyright row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Taxcent Connect. Ranabari Market, NH-15, Lakhimpur, Assam, India.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>GST & Tax Compliance</span>
            <span>·</span>
            <span>Computer Education</span>
            <span>·</span>
            <span>Digital India Facilitation</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
