import React, { useState, useRef } from 'react';
import { ActiveTab, Language, CSCServiceItem } from '../types';
import { CSC_SERVICES, BUSINESS_CONTACTS } from '../data/content';
import { Landmark, CheckCircle2, ShieldAlert, FileText, ExternalLink, MessageCircle, Phone, ArrowRight, Printer } from 'lucide-react';
import cscImg from '../assets/images/csc_digital_service_1793034988430.jpg';

interface CSCServicesProps {
  lang: Language;
  setActiveTab: (tab: ActiveTab) => void;
  onSelectServiceForEnquiry: (serviceName: string) => void;
}

export const CSCServices: React.FC<CSCServicesProps> = ({
  lang,
  setActiveTab,
  onSelectServiceForEnquiry,
}) => {
  const [selectedService, setSelectedService] = useState<CSCServiceItem>(CSC_SERVICES[0]);
  const [isDetailsHighlighted, setIsDetailsHighlighted] = useState(false);
  const detailsRef = useRef<HTMLDivElement>(null);

  const handleSelectService = (service: CSCServiceItem) => {
    setSelectedService(service);
    setIsDetailsHighlighted(true);

    setTimeout(() => {
      if (detailsRef.current) {
        detailsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);

    setTimeout(() => {
      setIsDetailsHighlighted(false);
    }, 1800);
  };

  const handleWhatsAppCSC = (service: CSCServiceItem) => {
    const serviceName = lang === 'as' ? service.nameAs : service.nameEn;
    const text = encodeURIComponent(
      lang === 'as'
        ? `নমস্কাৰ, মই CSC Ranabari ৰ পৰা "${serviceName}" সেৱাত সহায় বিচাৰোঁ।`
        : `Hello, I would like assistance with "${serviceName}" at CSC Ranabari.`
    );
    window.open(`https://wa.me/91${BUSINESS_CONTACTS.phone1}?text=${text}`, '_blank');
  };

  return (
    <section className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Banner with CSC Service Counter Image */}
        <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white p-6 sm:p-10 mb-8 shadow-xl border border-emerald-950">
          <div className="absolute inset-0">
            <img
              src={cscImg}
              alt="CSC Ranabari Common Service Centre Lakhimpur"
              className="w-full h-full object-cover opacity-20"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-transparent" />
          </div>

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-700/60 border border-emerald-500/40 text-xs font-semibold text-emerald-200 mb-3">
              <Landmark className="w-3.5 h-3.5 text-emerald-300" />
              <span>{lang === 'as' ? 'ডিজিটেল নাগৰিক সেৱা আৰু অনলাইন আবেদন' : 'Digital Citizen Public Facilitation'}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-3 text-balance">
              {lang === 'as' ? 'চি এছ চি ৰণবাৰী (CSC Ranabari)' : 'CSC Ranabari (Common Service Centre)'}
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-6">
              {lang === 'as'
                ? '১৫ নং ৰাষ্ট্ৰীয় ঘাইপথৰ ৰণবাৰী বজাৰত অৱস্থিত। অসম চৰকাৰ আৰু কেন্দ্ৰীয় চৰকাৰৰ বিভিন্ন অনলাইন প’ৰ্টেলৰ জৰিয়তে নাগৰিকসকলক নিৰ্ভুলভাৱে অনলাইন ফৰ্ম পূৰণ আৰু সহায় আগবঢ়োৱা হয়।'
                : 'Assisting citizens of Lakhimpur with online government recruitment forms, Sewa Setu certificates, land records, APDCL electricity bill receipts, and public utility portals.'}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href={`tel:${BUSINESS_CONTACTS.phone1}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-slate-950 font-bold text-xs shadow-md transition-all"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-700" />
                <span>{lang === 'as' ? 'চিএছচিত ফোন কৰক' : 'Call CSC Desk'}</span>
              </a>
              <button
                onClick={() => {
                  onSelectServiceForEnquiry('CSC Citizen Service Assistance');
                  setActiveTab('enquire');
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                <span>{lang === 'as' ? 'অনলাইন সহায়ৰ অনুৰোধ' : 'Request Assistance'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Mandatory Safety, Legitimacy & Anti-Promise Disclaimer */}
        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-5 mb-8 shadow-xs">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 leading-relaxed">
              <strong className="font-bold text-amber-950 block text-sm mb-1">
                {lang === 'as' ? 'প্ৰয়োজনীয় স্পষ্টীকৰণ আৰু সুৰক্ষা জাননী' : 'Official Role & Facilitation Disclaimer'}
              </strong>
              <p>
                {lang === 'as'
                  ? 'চি এছ চি ৰণবাৰী হৈছে এটা ব্যক্তিগত কাৰিকৰী সহায় কেন্দ্ৰ (Authorized CSC VLE)। আমি কোনো চৰকাৰী কাৰ্যালয়, মন্ত্ৰালয় বা আদালত নহয়। আমি কোনো ব্যক্তিৰ চাকৰি, অনুদান বা চৰকাৰী সিদ্ধান্তৰ নিশ্চয়তা প্ৰদান নকৰোঁ। চৰকাৰী প’ৰ্টেলত নিৰ্ধাৰিত মাচুল জমা কৰি আনুষ্ঠানিক কম্পিউটাৰ ৰচিদ গ্ৰাহকৰ হাতত তুলি দিয়া হয়।'
                  : 'CSC Ranabari operates as an authorized Village Level Entrepreneur (VLE) Common Service Centre facilitating citizen access to digital governance portals. We do not represent any government department as an authority, nor do we promise or guarantee government job selections, certificate approvals, or official outcomes. We provide pure technical assistance with online submissions, scanning, and payments.'}
              </p>
            </div>
          </div>
        </div>

        {/* 2-Column Split: Services Directory on Left (7 cols) & Service Inspector on Right (5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Services List */}
          <div className="lg:col-span-7 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 mb-2">
              {lang === 'as' ? 'নাগৰিক সেৱাসমূহৰ তালিকা' : 'Citizen Digital Facilitation Services'}
            </h2>

            <div className="grid grid-cols-1 gap-3.5">
              {CSC_SERVICES.map((service) => {
                const isSelected = selectedService.id === service.id;
                return (
                  <div
                    key={service.id}
                    onClick={() => handleSelectService(service)}
                    className={`rounded-2xl p-5 border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                        : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                          isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
                        }`}>
                          <FileText className="w-4 h-4" />
                        </div>
                        <h3 className="font-bold text-slate-900 text-base">
                          {lang === 'as' ? service.nameAs : service.nameEn}
                        </h3>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full shrink-0">
                        {service.category}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed mb-3">
                      {lang === 'as' ? service.descriptionAs : service.descriptionEn}
                    </p>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500 text-[11px] truncate max-w-[240px]">
                        Portal: {service.officialPortal}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectService(service);
                        }}
                        className="text-emerald-700 font-bold hover:text-emerald-950 py-1 px-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 transition-colors"
                      >
                        {lang === 'as' ? 'নথি আৰু বিৱৰণ' : 'View Requirements'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Service Details & Document Checklist Box */}
          <div ref={detailsRef} id="csc-service-requirements" className="lg:col-span-5 sticky top-20 scroll-mt-20 sm:scroll-mt-24">
            <div className={`rounded-2xl bg-white p-6 border transition-all duration-300 space-y-5 ${
              isDetailsHighlighted
                ? 'border-emerald-500 ring-4 ring-emerald-400/40 shadow-xl scale-[1.01] bg-emerald-50/20'
                : 'border-slate-200 shadow-md'
            }`}>
              <div className="pb-4 border-b border-slate-100">
                <span className="text-xs font-mono font-medium text-emerald-700 uppercase">
                  Service Application Requirements
                </span>
                <h3 className="text-lg font-bold text-slate-900 leading-tight mt-1">
                  {lang === 'as' ? selectedService.nameAs : selectedService.nameEn}
                </h3>
                <p className="text-xs text-slate-600 mt-2">
                  {lang === 'as' ? selectedService.descriptionAs : selectedService.descriptionEn}
                </p>
              </div>

              {/* Required Documents */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
                  {lang === 'as' ? 'কাৰ্যালয়লৈ লগত আনিবলগীয়া প্ৰমাণপত্ৰ:' : 'Required Documents to Bring:'}
                </h4>
                <div className="space-y-2">
                  {(lang === 'as' ? selectedService.documentsAs : selectedService.documentsEn).map((doc, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{doc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Portal transparency */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
                <span className="block font-semibold text-slate-800 mb-0.5">
                  {lang === 'as' ? 'চৰকাৰী প’ৰ্টেল সংযোগ:' : 'Official Service Channel:'}
                </span>
                <span className="text-slate-600 font-mono text-[11px] break-all">
                  {selectedService.officialPortal}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2.5">
                <button
                  onClick={() => {
                    onSelectServiceForEnquiry(
                      lang === 'as' ? selectedService.nameAs : selectedService.nameEn
                    );
                    setActiveTab('enquire');
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <span>{lang === 'as' ? 'এই সেৱাৰ বাবে ফৰ্ম পূৰণ কৰক' : 'Request Assistance Online'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleWhatsAppCSC(selectedService)}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{lang === 'as' ? 'হোৱাটছএপত প্ৰশ্ন সোধক' : 'Ask on WhatsApp'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
