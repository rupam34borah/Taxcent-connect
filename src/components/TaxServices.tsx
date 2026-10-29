import React, { useState, useRef } from 'react';
import { ActiveTab, Language, ServiceItem } from '../types';
import { TAXCENT_SERVICES, BUSINESS_CONTACTS } from '../data/content';
import { calculateQuickTax } from '../utils/taxCalculator';
import { FileText, CheckCircle2, ChevronRight, Phone, MessageSquare, Clock, FileCheck, Calculator, ArrowRight } from 'lucide-react';

interface TaxServicesProps {
  lang: Language;
  setActiveTab: (tab: ActiveTab) => void;
  onSelectServiceForEnquiry: (serviceName: string) => void;
}

export const TaxServices: React.FC<TaxServicesProps> = ({
  lang,
  setActiveTab,
  onSelectServiceForEnquiry,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeChecklistService, setActiveChecklistService] = useState<ServiceItem | null>(TAXCENT_SERVICES[0]);
  const [isChecklistHighlighted, setIsChecklistHighlighted] = useState(false);
  const checklistRef = useRef<HTMLDivElement>(null);

  const handleViewChecklist = (service: ServiceItem) => {
    setActiveChecklistService(service);
    setIsChecklistHighlighted(true);

    // Smooth scroll down to required documents checklist section
    setTimeout(() => {
      if (checklistRef.current) {
        checklistRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);

    setTimeout(() => {
      setIsChecklistHighlighted(false);
    }, 1800);
  };
  
  // Quick Income Tax Estimator helper state
  const [incomeInput, setIncomeInput] = useState<string>('750000');
  const [showTaxTool, setShowTaxTool] = useState(false);

  const filteredServices = selectedCategory === 'all'
    ? TAXCENT_SERVICES
    : TAXCENT_SERVICES.filter(s => s.category === selectedCategory);

  const handleWhatsAppEnquiry = (service: ServiceItem) => {
    const serviceName = lang === 'as' ? service.titleAs : service.titleEn;
    const text = encodeURIComponent(
      lang === 'as'
        ? `নমস্কাৰ, মই Taxcent Consulting Services ৰ পৰা "${serviceName}" সেৱাৰ বিষয়ে পৰামৰ্শ বিচাৰোঁ।`
        : `Hello, I would like to consult with Taxcent Consulting regarding: "${serviceName}".`
    );
    window.open(`https://wa.me/91${BUSINESS_CONTACTS.phone1}?text=${text}`, '_blank');
  };

  // Simple New Regime vs Old Regime comparison calculation for salaried taxpayers
  const incomeVal = Math.max(0, Number(incomeInput) || 0);
  const serviceTaxResult = calculateQuickTax({
    assessmentYear: '2027-28',
    ageGroup: 'under_60',
    residentialStatus: 'resident',
    isSalaried: true,
    annualIncome: incomeVal,
    deduction80C: 0,
    deduction80D: 0,
    homeLoanInterest24b: 0,
    otherDeductions: 0,
  });
  const taxableNew = serviceTaxResult.newRegime.netTaxableIncome;
  const taxNew = serviceTaxResult.newRegime.totalTaxPayable;

  return (
    <section className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="text-xs font-bold text-sky-700 tracking-wider uppercase block mb-1">
                {lang === 'as' ? 'ব্যৱসায় ১ · কৰ আৰু একাউণ্টিং' : 'Business 1 · Professional Practice'}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {lang === 'as' ? 'টেক্সচেণ্ট কনচাল্টিং চাৰ্ভিচেচ' : 'Taxcent Consulting Services'}
              </h1>
              <p className="mt-2 text-sm text-slate-600 max-w-3xl leading-relaxed">
                {lang === 'as'
                  ? 'জিএছটি পঞ্জীয়ন আৰু ৰিটাৰ্ণ, ইনকাম টেক্স ITR দাখিল, টিডিএছ ৰিটাৰ্ণ, ব্যৱসায়িক বহী ৰক্ষণাবেক্ষণ (Tally), উদ্যম MSME পঞ্জীয়ন আৰু ডিজিটেল স্বাক্ষৰ (DSC) ৰ সম্পূৰ্ণ সহায়।'
                  : 'Reliable taxation, GST compliance, bookkeeping, corporate registrations, and accounting services in Ranabari Market, NH-15, Lakhimpur, Assam.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <a
                href={`tel:${BUSINESS_CONTACTS.phone1}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-sky-400" />
                <span>{lang === 'as' ? 'পোনপটীয়াকৈ ফোন কৰক' : 'Direct Call'}</span>
              </a>
              <button
                onClick={() => {
                  onSelectServiceForEnquiry('GST / Income Tax Consultation');
                  setActiveTab('enquire');
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <span>{lang === 'as' ? 'অনলাইন আবেদন ফৰ্ম' : 'Enquire Online'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Interactive Filter Controls (Segmented buttons) */}
          <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap items-center gap-2">
            {[
              { id: 'all', labelEn: 'All Services', labelAs: 'সকলো সেৱা' },
              { id: 'gst', labelEn: 'GST Filing & Reg', labelAs: 'জিএছটি সেৱা' },
              { id: 'itr', labelEn: 'Income Tax (ITR)', labelAs: 'ইনকাম টেক্স' },
              { id: 'tds', labelEn: 'TDS Compliance', labelAs: 'টিডিএছ' },
              { id: 'accounting', labelEn: 'Bookkeeping / Tally', labelAs: 'হিচাপ ৰক্ষণ' },
              { id: 'registration', labelEn: 'Udyam / PAN / TAN', labelAs: 'পঞ্জীয়ন' },
              { id: 'digital', labelEn: 'Digital Signature (DSC)', labelAs: 'ডিজিটেল স্বাক্ষৰ' },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-sky-900 text-white shadow-xs font-semibold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {lang === 'as' ? cat.labelAs : cat.labelEn}
              </button>
            ))}

            <button
              onClick={() => setActiveTab('estimator')}
              className="ml-auto flex items-center gap-1.5 text-xs font-bold text-sky-900 hover:text-white bg-sky-100 hover:bg-sky-700 border border-sky-300 px-3.5 py-1.5 rounded-xl cursor-pointer transition-all shadow-xs"
            >
              <Calculator className="w-3.5 h-3.5 text-sky-600 group-hover:text-white" />
              <span>{lang === 'as' ? 'দ্ৰুত কৰ কেলকুলেটৰ' : 'Quick Tax Estimator'}</span>
              <ArrowRight className="w-3 h-3 ml-0.5" />
            </button>
          </div>
        </div>

        {/* Optional Collapsible Tax Calculator Tool */}
        {showTaxTool && (
          <div className="mb-8 rounded-2xl bg-white p-6 border border-sky-200 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-sky-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  {lang === 'as' ? 'বেতনভোগী কৰ্মচাৰীৰ আনুমানিক কৰ গণনা (New Tax Regime)' : 'Salaried Employee Indicative Tax Estimator (New Regime)'}
                </h3>
              </div>
              <button
                onClick={() => setShowTaxTool(false)}
                className="text-xs text-slate-400 hover:text-slate-600 font-semibold"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {lang === 'as' ? 'বাৰ্ষিক স্থূল দৰমহা (Gross Annual Salary in ₹)' : 'Annual Gross Salary (₹)'}
                </label>
                <input
                  type="number"
                  value={incomeInput}
                  onChange={(e) => setIncomeInput(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                  placeholder="e.g. 750000"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Includes Standard Deduction of ₹75,000
                </span>
              </div>

              <div className="bg-sky-50 p-4 rounded-xl border border-sky-100">
                <span className="text-xs text-slate-600 block">
                  {lang === 'as' ? 'আনুমানিক কৰ (Cess সহ)' : 'Estimated Tax Payable'}
                </span>
                <span className="text-2xl font-bold text-sky-950 font-mono">
                  {taxNew === 0 ? '₹0 estimated tax' : `₹${taxNew.toLocaleString('en-IN')}`}
                </span>
                <span className="text-[11px] text-sky-700 block mt-1">
                  {taxableNew <= 1200000 ? 'Resident individuals may qualify for a Section 87A rebate up to this taxable income.' : 'Estimate uses the AY 2027-28 new-regime slabs and standard deduction.'}
                </span>
              </div>

              <div>
                <button
                  onClick={() => {
                    onSelectServiceForEnquiry('Income Tax Return Filing Consultation');
                    setActiveTab('enquire');
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  {lang === 'as' ? 'আমাৰ সৈতে ITR দাখিল কৰক' : 'File ITR with Taxcent'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2-Column Split: Services Grid on Left (8 cols) & Document Checklist Inspector on Right (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Services Cards */}
          <div className="lg:col-span-8 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredServices.map((service) => {
                const isSelected = activeChecklistService?.id === service.id;
                return (
                  <div
                    key={service.id}
                    onClick={() => handleViewChecklist(service)}
                    className={`rounded-2xl p-5 border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-white border-sky-500 shadow-md ring-2 ring-sky-500/20'
                        : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-[11px] font-mono font-medium text-sky-700 uppercase tracking-wide">
                          {service.category}
                        </span>
                        {service.highlight && (
                          <span className="text-[10px] font-bold text-sky-900 bg-sky-100 px-2 py-0.5 rounded-full">
                            Key Service
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-slate-900 text-base leading-snug mb-2">
                        {lang === 'as' ? service.titleAs : service.titleEn}
                      </h3>

                      <p className="text-xs text-slate-600 leading-relaxed mb-4">
                        {lang === 'as' ? service.shortDescAs : service.shortDescEn}
                      </p>

                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-4">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{lang === 'as' ? service.turnaroundAs : service.turnaroundEn}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewChecklist(service);
                        }}
                        className="text-xs font-semibold text-sky-800 hover:text-sky-950 flex items-center gap-1.5 group/btn cursor-pointer py-1 px-2 rounded-lg bg-sky-50 hover:bg-sky-100 transition-colors"
                        title={lang === 'as' ? 'প্ৰয়োজনীয় নথিপত্ৰৰ তালিকালৈ যাওক' : 'Scroll down to required document checklist'}
                      >
                        <FileCheck className="w-3.5 h-3.5 text-sky-600 group-hover/btn:scale-110 transition-transform" />
                        <span className="font-bold">{lang === 'as' ? 'নথি চাওক' : 'View Checklist'}</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleWhatsAppEnquiry(service);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#20ba59] text-slate-950 font-bold text-xs flex items-center gap-1 transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Active Document Checklist & Contact Card */}
          <div ref={checklistRef} id="required-documents-checklist" className="lg:col-span-4 sticky top-20 space-y-6 scroll-mt-20 sm:scroll-mt-24">
            {activeChecklistService && (
              <div className={`rounded-2xl bg-white p-6 border transition-all duration-300 ${
                isChecklistHighlighted
                  ? 'border-sky-500 ring-4 ring-sky-400/40 shadow-xl scale-[1.01] bg-sky-50/20'
                  : 'border-slate-200 shadow-md'
              }`}>
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
                  <FileCheck className="w-5 h-5 text-sky-600" />
                  <h3 className="font-bold text-slate-900 text-sm">
                    {lang === 'as' ? 'প্ৰয়োজনীয় নথিপত্ৰৰ তালিকা' : 'Required Document Checklist'}
                  </h3>
                </div>

                <div className="mb-4">
                  <h4 className="font-bold text-slate-900 text-sm leading-snug">
                    {lang === 'as' ? activeChecklistService.titleAs : activeChecklistService.titleEn}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1">
                    {lang === 'as' ? activeChecklistService.fullDescAs : activeChecklistService.fullDescEn}
                  </p>
                </div>

                <div className="space-y-2 mb-6">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    {lang === 'as' ? 'কাৰ্যালয়লৈ আনিবলগীয়া প্ৰমাণপত্ৰ:' : 'Please bring the following to our office:'}
                  </span>
                  {(lang === 'as' ? activeChecklistService.documentsAs : activeChecklistService.documentsEn).map((doc, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{doc}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2.5 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => {
                      onSelectServiceForEnquiry(
                        lang === 'as' ? activeChecklistService.titleAs : activeChecklistService.titleEn
                      );
                      setActiveTab('enquire');
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>{lang === 'as' ? 'এই সেৱাৰ বাবে ফৰ্ম পূৰণ কৰক' : 'Fill Enquiry for this Service'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleWhatsAppEnquiry(activeChecklistService)}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>{lang === 'as' ? 'হোৱাটছএপত পোনপটীয়াকৈ সোধক' : 'Chat on WhatsApp'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Quick Consultation Call Card */}
            <div className="rounded-2xl bg-[#0a2540] text-white p-6 border border-sky-900 shadow-md">
              <h4 className="font-bold text-sm text-white mb-1">
                {lang === 'as' ? 'জৰুৰী কৰ পৰামৰ্শৰ প্ৰয়োজন?' : 'Need Urgent Tax Assistance?'}
              </h4>
              <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                {lang === 'as'
                  ? 'জিএছটি জাননী, পলম ফাইলিং বা নতুন উদ্যোগৰ বাবে আমাৰ কৰ পৰামৰ্শদাতাৰ সৈতে কথা পাতক।'
                  : 'Notice reply, delayed returns, or new business compliance. Speak to our consultant at Ranabari Market.'}
              </p>

              <div className="space-y-2">
                <a
                  href={`tel:${BUSINESS_CONTACTS.phone1}`}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-semibold text-white transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-sky-400" />
                    <span>{BUSINESS_CONTACTS.phone1Formatted}</span>
                  </span>
                  <span className="text-[10px] text-sky-300 font-mono">Call</span>
                </a>

                <a
                  href={`tel:${BUSINESS_CONTACTS.phone2}`}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-semibold text-white transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-sky-400" />
                    <span>{BUSINESS_CONTACTS.phone2Formatted}</span>
                  </span>
                  <span className="text-[10px] text-sky-300 font-mono">Call</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
