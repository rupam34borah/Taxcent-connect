import React, { useState, useMemo } from 'react';
import { ActiveTab, Language } from '../types';
import { 
  AssessmentYear, 
  TaxpayerAgeGroup, 
  QuickTaxInputs, 
  calculateQuickTax, 
  formatINR 
} from '../utils/taxCalculator';
import { AdvancedTaxEstimatorModal } from './AdvancedTaxEstimatorModal';
import { BUSINESS_CONTACTS } from '../data/content';
import { 
  Calculator, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Sliders, 
  Send, 
  FileCheck, 
  Building2, 
  ShieldCheck, 
  ChevronRight,
  TrendingDown,
  Info
} from 'lucide-react';

interface QuickTaxEstimatorProps {
  lang: Language;
  setActiveTab: (tab: ActiveTab) => void;
  onSelectServiceForEnquiry?: (serviceName: string) => void;
}

export const QuickTaxEstimator: React.FC<QuickTaxEstimatorProps> = ({
  lang,
  setActiveTab,
  onSelectServiceForEnquiry,
}) => {
  // Assessment Year state (Default Base Year is AY 2027-28 / FY 2026-27)
  const [assessmentYear, setAssessmentYear] = useState<AssessmentYear>('2027-28');
  const [ageGroup, setAgeGroup] = useState<TaxpayerAgeGroup>('under_60');
  const [isSalaried, setIsSalaried] = useState<boolean>(true);
  const [annualIncome, setAnnualIncome] = useState<number>(850000);

  // Quick deductions for Old Regime
  const [deduction80C, setDeduction80C] = useState<number>(150000);
  const [deduction80D, setDeduction80D] = useState<number>(25000);
  const [homeLoanInterest24b, setHomeLoanInterest24b] = useState<number>(0);
  const [otherDeductions, setOtherDeductions] = useState<number>(0);

  // Advanced Estimator Modal state
  const [isAdvancedModalOpen, setIsAdvancedModalOpen] = useState<boolean>(false);

  // Filing with Taxcent State
  const [showFilingForm, setShowFilingForm] = useState<boolean>(false);
  const [clientName, setClientName] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('');
  const [submittedTicketId, setSubmittedTicketId] = useState<string>('');

  const quickInputs: QuickTaxInputs = useMemo(() => ({
    assessmentYear,
    ageGroup,
    isSalaried,
    annualIncome,
    deduction80C,
    deduction80D,
    homeLoanInterest24b,
    otherDeductions,
  }), [
    assessmentYear,
    ageGroup,
    isSalaried,
    annualIncome,
    deduction80C,
    deduction80D,
    homeLoanInterest24b,
    otherDeductions,
  ]);

  const calculation = useMemo(() => calculateQuickTax(quickInputs), [quickInputs]);

  const handleIncomePreset = (amount: number) => {
    setAnnualIncome(amount);
  };

  const handleFileITR = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = clientPhone.replace(/\D/g, '');
    if (!clientName.trim() || cleanPhone.length !== 10) {
      alert(lang === 'as' ? 'অনুগ্ৰহ কৰি আপোনাৰ নাম আৰু ১০ টা সংখ্যাৰ ফোন নম্বৰ দিয়ক' : 'Please enter your name and valid 10-digit phone number');
      return;
    }

    const ticketId = `ITR-${assessmentYear.replace('-', '')}-${Date.now().toString().slice(-5)}`;
    setSubmittedTicketId(ticketId);

    const recommendedRegimeName = calculation.recommendedRegime === 'new'
      ? 'New Tax Regime (u/s 115BAC)'
      : calculation.recommendedRegime === 'old'
      ? 'Old Tax Regime'
      : 'Equal Tax Liability';

    const bestTaxPayable = calculation.recommendedRegime === 'new'
      ? calculation.newRegime.totalTaxPayable
      : calculation.oldRegime.totalTaxPayable;

    const message = `*Taxcent Connect - ITR Filing Request*\n` +
      `------------------------------------\n` +
      `🎫 *Ticket ID:* ${ticketId}\n` +
      `📅 *Assessment Year:* AY ${assessmentYear} (${calculation.financialYear})\n` +
      `👤 *Client Name:* ${clientName.trim()}\n` +
      `📱 *Mobile No:* +91 ${cleanPhone}\n` +
      `💼 *Category:* ${isSalaried ? 'Salaried Employee' : 'Business / Self-Employed'}\n` +
      `💰 *Estimated Annual Income:* ${formatINR(annualIncome)}\n` +
      `🏆 *Recommended Regime:* ${recommendedRegimeName}\n` +
      `💸 *Estimated Tax Payable:* ${formatINR(bestTaxPayable)}\n` +
      (calculation.taxSaved > 0 ? `✨ *Tax Saved:* ${formatINR(calculation.taxSaved)}\n` : '') +
      `------------------------------------\n` +
      `_I estimated my tax on Taxcent Connect and want Taxcent to file my Income Tax Return._`;

    // Directly open WhatsApp
    window.open(`https://wa.me/91${BUSINESS_CONTACTS.phone1}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <section id="tax-estimator" className="py-10 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Header Breadcrumb & Introduction */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-1 rounded-lg bg-sky-100 text-sky-800 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Calculator className="w-3.5 h-3.5 text-sky-600" />
                  <span>{lang === 'as' ? 'দ্ৰুত আয়কৰ গণনা' : 'Taxcent Tax Tools'}</span>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
                  {lang === 'as' ? 'বাজেট ২০২৪ সংশোধিত' : 'Budget 2024 Updated'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {lang === 'as' ? 'দ্ৰুত আয়কৰ কেলকুলেটৰ (Quick Tax Estimator)' : 'Quick Tax Estimator'}
              </h1>
              <p className="mt-2 text-sm text-slate-600 max-w-3xl leading-relaxed">
                {lang === 'as'
                  ? 'নিমিষতে আপোনাৰ বাৰ্ষিক আয়ৰ ওপৰত পুৰণি আৰু নতুন কৰ ব্যৱস্থাৰ তুলনা কৰক। কাৰ্যালয়লৈ নহাকৈয়ে জনা লওক কোনটো কৰ ব্যৱস্থাত আপোনাৰ ধন বাচিব।'
                  : 'Compare the Old vs New Tax Regime instantly with updated standard deduction, Section 87A rebate, and rebate thresholds. File your return seamlessly with Taxcent.'}
              </p>
            </div>

            {/* Ranabari Office Badge */}
            <div className="shrink-0 bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold">
                TC
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase block">
                  {lang === 'as' ? 'পৰামৰ্শদাতা কেন্দ্ৰ' : 'Authorized Practice'}
                </span>
                <span className="text-xs font-bold text-slate-900 block">
                  Taxcent Consulting Services
                </span>
                <span className="text-[11px] text-sky-700 block">
                  Ranabari Market, Lakhimpur
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Ordered Sequential Flow: 1. Select Year -> 2. Annual Income & Profile -> 3. Tax Liability Comparison -> 4. Advanced Estimator -> 5. Taxcent Recommendation */}
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* 1. Assessment Year (AY) Selector */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-800 text-xs flex items-center justify-center font-black">1</span>
                  <span>{lang === 'as' ? 'কৰ নিৰ্ধাৰণ বৰ্ষ বাছক (Select Assessment Year)' : 'Select Assessment Year (AY)'}</span>
                </h3>
                <span className="text-xs text-slate-500 block mt-1 ml-8">
                  {lang === 'as' ? 'আপুনি যি বিত্তীয় বৰ্ষৰ ৰিটাৰ্ণ দাখিল কৰিব বিচাৰে' : 'Choose the fiscal assessment cycle for your income tax return'}
                </span>
              </div>
              <Info className="w-4 h-4 text-sky-600" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              {/* AY 2027-28 (Current FY 2026-27 Base Year) */}
              <button
                type="button"
                onClick={() => setAssessmentYear('2027-28')}
                className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                  assessmentYear === '2027-28'
                    ? 'bg-sky-50 border-sky-600 ring-2 ring-sky-500/30 text-sky-950 font-bold shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 font-medium'
                }`}
              >
                <div className="text-xs sm:text-sm font-black">AY 2027-28</div>
                <div className="text-[10px] text-sky-700 font-semibold mt-0.5">FY 2026-27</div>
                <span className="inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-bold bg-sky-200/80 text-sky-900">
                  Current Year
                </span>
              </button>

              {/* AY 2026-27 */}
              <button
                type="button"
                onClick={() => setAssessmentYear('2026-27')}
                className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                  assessmentYear === '2026-27'
                    ? 'bg-sky-50 border-sky-600 ring-2 ring-sky-500/30 text-sky-950 font-bold shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 font-medium'
                }`}
              >
                <div className="text-xs sm:text-sm font-black">AY 2026-27</div>
                <div className="text-[10px] text-slate-500 mt-0.5">FY 2025-26</div>
                <span className="inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-bold bg-slate-200 text-slate-700">
                  Previous
                </span>
              </button>

              {/* AY 2025-26 */}
              <button
                type="button"
                onClick={() => setAssessmentYear('2025-26')}
                className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                  assessmentYear === '2025-26'
                    ? 'bg-sky-50 border-sky-600 ring-2 ring-sky-500/30 text-sky-950 font-bold shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 font-medium'
                }`}
              >
                <div className="text-xs sm:text-sm font-black">AY 2025-26</div>
                <div className="text-[10px] text-slate-500 mt-0.5">FY 2024-25</div>
                <span className="inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-bold bg-slate-200 text-slate-700">
                  Prior Year
                </span>
              </button>

              {/* AY 2024-25 */}
              <button
                type="button"
                onClick={() => setAssessmentYear('2024-25')}
                className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                  assessmentYear === '2024-25'
                    ? 'bg-sky-50 border-sky-600 ring-2 ring-sky-500/30 text-sky-950 font-bold shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 font-medium'
                }`}
              >
                <div className="text-xs sm:text-sm font-black">AY 2024-25</div>
                <div className="text-[10px] text-slate-500 mt-0.5">FY 2023-24</div>
                <span className="inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-bold bg-slate-200 text-slate-700">
                  Belated / Rev
                </span>
              </button>
            </div>

            {assessmentYear !== '2024-25' && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Budget 2024 Revised Slabs Active:</span> Standard deduction for salaried is{' '}
                  <strong className="underline">₹75,000</strong>. Income up to <strong className="underline">₹7.75 Lakhs</strong> is 100% tax-free for salaried taxpayers under the New Tax Regime!
                </div>
              </div>
            )}
          </div>

          {/* 2. Taxpayer Profile & Annual Income */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
            <h3 className="font-extrabold text-base sm:text-lg text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-800 text-xs flex items-center justify-center font-black">2</span>
              <span>{lang === 'as' ? 'বাৰ্ষিক আয় আৰু কৰদাতাৰ শ্ৰেণী' : 'Annual Income & Profile'}</span>
            </h3>

            {/* Age Category & Salaried Toggle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {lang === 'as' ? 'বয়সৰ শ্ৰেণী' : 'Taxpayer Age Category'}
                </label>
                <select
                  value={ageGroup}
                  onChange={(e) => setAgeGroup(e.target.value as TaxpayerAgeGroup)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                >
                  <option value="under_60">Individual (&lt; 60 Years)</option>
                  <option value="senior">Senior Citizen (60 - 80 Years)</option>
                  <option value="super_senior">Super Senior Citizen (&gt; 80 Years)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {lang === 'as' ? 'নিয়োগৰ ধৰণ' : 'Employment Status'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setIsSalaried(true)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      isSalaried
                        ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    Salaried / Pension
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsSalaried(false)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      !isSalaried
                        ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    Business / Other
                  </button>
                </div>
              </div>
            </div>

            {/* Annual Gross Income Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">
                  {lang === 'as' ? 'বাৰ্ষিক সৰ্বমুঠ আয় (Annual Gross Total Income)' : 'Annual Gross Income (CTC / Net Receipts)'}
                </label>
                <span className="text-base font-extrabold text-sky-800 font-mono">
                  {formatINR(annualIncome)}
                </span>
              </div>

              <div className="relative">
                <span className="absolute left-3.5 top-3 text-slate-400 font-bold text-base">₹</span>
                <input
                  type="number"
                  value={annualIncome || ''}
                  onChange={(e) => setAnnualIncome(Math.max(0, Number(e.target.value)))}
                  placeholder="e.g. 850000"
                  className="w-full pl-8 pr-4 py-2.5 bg-slate-50 rounded-xl border border-slate-300 text-base font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500 font-mono"
                />
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase mr-1">Presets:</span>
                {[500000, 750000, 850000, 1000000, 1200000, 1500000, 2000000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handleIncomePreset(amt)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      annualIncome === amt
                        ? 'bg-sky-800 text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                    }`}
                  >
                    ₹{(amt / 100000).toFixed(amt % 100000 === 0 ? 0 : 1)}L
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Deductions for Old Regime */}
            <div className="pt-4 border-t border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  {lang === 'as' ? 'পুৰণি ৰেজিমেৰ ৰেহাই (Deductions for Old Regime)' : 'Deductions (For Old Regime Comparison)'}
                </span>
                <span className="text-[11px] text-slate-500">
                  Section 80C, 80D, 24b
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Sec 80C (EPF/PPF/ELSS - Max 1.5L)
                  </label>
                  <input
                    type="number"
                    value={deduction80C || ''}
                    onChange={(e) => setDeduction80C(Number(e.target.value))}
                    placeholder="150000"
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-sky-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Sec 80D (Health Insurance)
                  </label>
                  <input
                    type="number"
                    value={deduction80D || ''}
                    onChange={(e) => setDeduction80D(Number(e.target.value))}
                    placeholder="25000"
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-sky-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Home Loan Interest (Sec 24b)
                  </label>
                  <input
                    type="number"
                    value={homeLoanInterest24b || ''}
                    onChange={(e) => setHomeLoanInterest24b(Number(e.target.value))}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-sky-500 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 3. Tax Liability Comparison */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200">
              <div>
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-800 text-xs flex items-center justify-center font-black">3</span>
                  <span>{lang === 'as' ? 'কৰৰ তুলনা তালিকা' : 'Tax Liability Comparison'}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1 ml-8">
                  {lang === 'as' ? 'বাজেট অনুসৰি দুয়োটা কৰ ব্যৱস্থাৰ তুলনামূলক খতিয়ান' : 'Detailed breakdown comparing New Tax Regime vs Old Tax Regime'}
                </p>
              </div>
              <span className="self-start sm:self-center px-3 py-1 bg-sky-50 border border-sky-200 rounded-xl text-xs font-mono font-extrabold text-sky-800">
                AY {assessmentYear} ({calculation.financialYear})
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold">
                    <th className="py-2.5 px-3">Particulars</th>
                    <th className="py-2.5 px-3 text-right bg-sky-50/50 text-sky-900 rounded-t-xl">
                      New Regime (u/s 115BAC)
                    </th>
                    <th className="py-2.5 px-3 text-right text-slate-700">
                      Old Regime
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {/* Gross Income */}
                  <tr className="hover:bg-slate-50/80">
                    <td className="py-3 px-3 font-semibold text-slate-700">Gross Total Income</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 bg-sky-50/30">
                      {formatINR(calculation.newRegime.grossTotalIncome)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                      {formatINR(calculation.oldRegime.grossTotalIncome)}
                    </td>
                  </tr>

                  {/* Deductions */}
                  <tr className="hover:bg-slate-50/80">
                    <td className="py-3 px-3 text-slate-700">
                      <div className="font-semibold">Total Deductions & Exemptions</div>
                      <div className="text-[11px] text-slate-400">
                        {isSalaried ? 'Std Deduction (₹75k/₹50k)' : 'Nil under New'} + 80C/80D/24b
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700 bg-sky-50/30">
                      -{formatINR(calculation.newRegime.totalDeductions)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700">
                      -{formatINR(calculation.oldRegime.totalDeductions)}
                    </td>
                  </tr>

                  {/* Net Taxable Income */}
                  <tr className="bg-slate-50/50 font-bold">
                    <td className="py-3 px-3 text-slate-900">Net Taxable Income</td>
                    <td className="py-3 px-3 text-right font-mono text-slate-900 bg-sky-50/40">
                      {formatINR(calculation.newRegime.netTaxableIncome)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-900">
                      {formatINR(calculation.oldRegime.netTaxableIncome)}
                    </td>
                  </tr>

                  {/* Slab Tax */}
                  <tr className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-3 text-slate-600">Tax Computed at Slab Rates</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700 bg-sky-50/30">
                      {formatINR(calculation.newRegime.slabTax)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                      {formatINR(calculation.oldRegime.slabTax)}
                    </td>
                  </tr>

                  {/* Section 87A Rebate */}
                  <tr className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-3 text-slate-600">
                      <div>Section 87A Tax Rebate</div>
                      <div className="text-[11px] text-slate-400">
                        {assessmentYear !== '2024-25' ? 'Up to ₹25,000 (New) / ₹12,500 (Old)' : 'Up to ₹25,000 (New) / ₹12,500 (Old)'}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-emerald-700 bg-sky-50/30">
                      -{formatINR(calculation.newRegime.rebate87A)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-emerald-700">
                      -{formatINR(calculation.oldRegime.rebate87A)}
                    </td>
                  </tr>

                  {/* Health & Education Cess */}
                  <tr className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-3 text-slate-600">Health & Education Cess (4%)</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700 bg-sky-50/30">
                      {formatINR(calculation.newRegime.cess)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                      {formatINR(calculation.oldRegime.cess)}
                    </td>
                  </tr>

                  {/* Total Tax Payable */}
                  <tr className="border-t-2 border-slate-300 bg-slate-100/60 font-black text-sm sm:text-base">
                    <td className="py-4 px-3 text-slate-900">Total Tax Payable</td>
                    <td className={`py-4 px-3 text-right font-mono ${
                      calculation.recommendedRegime === 'new'
                        ? 'text-emerald-700 bg-emerald-50/60 text-lg sm:text-xl font-black'
                        : 'text-slate-900 bg-sky-50/50'
                    }`}>
                      {formatINR(calculation.newRegime.totalTaxPayable)}
                      {calculation.recommendedRegime === 'new' && (
                        <span className="block text-[10px] font-bold text-emerald-800 uppercase tracking-wider mt-0.5">
                          ✓ Lowest Tax
                        </span>
                      )}
                    </td>
                    <td className={`py-4 px-3 text-right font-mono ${
                      calculation.recommendedRegime === 'old'
                        ? 'text-emerald-700 bg-emerald-50/60 text-lg sm:text-xl font-black'
                        : 'text-slate-900'
                    }`}>
                      {formatINR(calculation.oldRegime.totalTaxPayable)}
                      {calculation.recommendedRegime === 'old' && (
                        <span className="block text-[10px] font-bold text-emerald-800 uppercase tracking-wider mt-0.5">
                          ✓ Lowest Tax
                        </span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. Advanced Estimator */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-[#0a2540] text-white p-6 sm:p-7 rounded-3xl border border-sky-900 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-sky-500/30 text-sky-300 text-xs flex items-center justify-center font-black">4</span>
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
                    {lang === 'as' ? 'বিশদ কৰ পৰিকল্পনা' : 'Comprehensive Tax Calculator'}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white">
                  {lang === 'as' ? 'এডভান্সড এষ্টিমেটৰ (Advanced Estimator)' : 'Advanced Estimator'}
                </h3>
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  {lang === 'as'
                    ? 'সকলো ৫ টা শিতানৰ উপাৰ্জন (দৰমহা, ঘৰৰ ঋণ/ভাড়া, কেপিটেল গেইন, ব্যৱসায়িক ৪৪এডি/এডিএ) আৰু ৮০চি, ৮০ডি, ৮০ই, ৮০জি বিশদ ৰেহাই অন্তৰ্ভুক্ত কৰি নিখুঁত গণনা কৰক।'
                    : 'Calculate with detailed salary heads (HRA, LTA), House Property rental & interest, Capital Gains (STCG/LTCG with indexation), Business 44AD/44ADA, and all Chapter VI-A deductions.'}
                </p>
              </div>

              {/* Requirement: button below should: Advanced Estimator */}
              <div className="shrink-0">
                <button
                  type="button"
                  onClick={() => setIsAdvancedModalOpen(true)}
                  className="w-full sm:w-auto py-3.5 px-6 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-sm uppercase tracking-wider transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <Sliders className="w-4 h-4 text-slate-950" />
                  <span>{lang === 'as' ? 'এডভান্সড এষ্টিমেটৰ খোলক' : 'Advanced Estimator'}</span>
                  <ArrowRight className="w-4 h-4 text-slate-950" />
                </button>
              </div>
            </div>
          </div>

          {/* 5. Taxcent Recommendation & File ITR with Taxcent */}
          <div className="space-y-6">
            
            {/* Recommendation Result Banner */}
            <div className={`p-6 sm:p-7 rounded-3xl border shadow-md space-y-3 ${
              calculation.recommendedRegime === 'new'
                ? 'bg-gradient-to-br from-emerald-600 to-emerald-800 text-white border-emerald-400'
                : calculation.recommendedRegime === 'old'
                ? 'bg-gradient-to-br from-blue-700 to-indigo-900 text-white border-blue-400'
                : 'bg-gradient-to-br from-slate-800 to-slate-950 text-white border-slate-700'
            }`}>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-white/20 text-white text-xs flex items-center justify-center font-black">5</span>
                <Sparkles className="w-5 h-5 text-amber-300" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-100">
                  {lang === 'as' ? 'অনুকূল পৰামৰ্শ' : 'Taxcent Recommendation'}
                </span>
              </div>
              
              <div className="text-xl sm:text-2xl font-black tracking-tight">
                {calculation.recommendedRegime === 'new'
                  ? 'New Tax Regime (u/s 115BAC) is Better for You'
                  : calculation.recommendedRegime === 'old'
                  ? 'Old Tax Regime is Better for You'
                  : 'Both Regimes Result in Equal Tax Liability'}
              </div>

              {calculation.taxSaved > 0 ? (
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-sm text-white/90 font-medium">Estimated Tax Savings:</span>
                  <span className="text-2xl sm:text-3xl font-black text-amber-300">
                    {formatINR(calculation.taxSaved)}
                  </span>
                </div>
              ) : (
                <p className="text-xs text-white/80">
                  Zero difference between both regimes for this income level.
                </p>
              )}

              <p className="text-xs text-white/90 pt-1 leading-relaxed">
                {calculation.recommendedRegime === 'new'
                  ? 'The New Regime provides lower slab tax rates with ₹75,000 standard deduction and Section 87A rebate.'
                  : 'Your Chapter VI-A deductions and home loan interest bring your taxable income down significantly under the Old Regime.'}
              </p>
            </div>

            {/* File ITR with Taxcent Box */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
                <div>
                  <h4 className="font-extrabold text-base sm:text-lg text-slate-900 flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-emerald-600" />
                    <span>{lang === 'as' ? 'Taxcent ৰ সৈতে ITR ফাইল কৰক' : 'File ITR with Taxcent'}</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {lang === 'as'
                      ? 'কাৰ্যালয়লৈ আহক বা ঘৰতে বহি হোৱাটছএপত কাগজ-পত্ৰ প্ৰেৰণ কৰি ফাইল কৰক'
                      : 'File your tax return accurately with our Lakhimpur office or submit details via WhatsApp for remote filing'}
                  </p>
                </div>
                <span className="self-start sm:self-center px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-xs font-bold text-emerald-800">
                  Direct WhatsApp 8876824424
                </span>
              </div>

              {!showFilingForm ? (
                <button
                  type="button"
                  onClick={() => setShowFilingForm(true)}
                  className="w-full py-4 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm uppercase tracking-wider transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <FileCheck className="w-5 h-5" />
                  <span>{lang === 'as' ? 'Taxcent ৰ সৈতে ITR ফাইল কৰক' : 'File ITR with Taxcent'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <form onSubmit={handleFileITR} className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      {lang === 'as' ? 'ITR দাখিলৰ বাবে যোগাযোগ বিৱৰণ' : 'Direct Taxcent ITR Filing Request'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowFilingForm(false)}
                      className="text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        {lang === 'as' ? 'আপোনাৰ সম্পূৰ্ণ নাম' : 'Full Name'}
                      </label>
                      <input
                        type="text"
                        required
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-sky-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        {lang === 'as' ? '১০ টা সংখ্যাৰ মোবাইল নম্বৰ' : '10-digit WhatsApp Phone Number'}
                      </label>
                      <input
                        type="tel"
                        required
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        placeholder="e.g. 9876543210"
                        className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-slate-300 text-xs font-mono font-semibold focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-slate-950 font-black text-sm uppercase tracking-wider transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>{lang === 'as' ? 'হোৱাটছএপত ফাইল কৰিবলৈ পঠাওক' : 'Send to Taxcent WhatsApp (8876824424)'}</span>
                  </button>

                  <p className="text-[11px] text-center text-slate-500">
                    Immediately opens WhatsApp to <strong>+91 {BUSINESS_CONTACTS.phone1}</strong> with your estimation summary and ticket details.
                  </p>
                </form>
              )}

              {submittedTicketId && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-900 space-y-1">
                  <div className="font-extrabold flex items-center gap-2 text-sm text-emerald-950">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>ITR Filing Ticket Generated: {submittedTicketId}</span>
                  </div>
                  <p className="text-xs text-emerald-800">
                    Directly sent to Taxcent Consulting WhatsApp. Our certified tax professional at Ranabari Market will verify your documents and initiate filing.
                  </p>
                </div>
              )}

              {/* Taxcent Trust & Guarantee Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-900 block mb-0.5">Maximum Tax Savings</span>
                  <span className="text-[11px] text-slate-500">100% compliant claim of eligible allowances</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-900 block mb-0.5">Ranabari Office</span>
                  <span className="text-[11px] text-slate-500">Physical hub at NH-15, Lakhimpur, Assam</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-900 block mb-0.5">Verified Ack</span>
                  <span className="text-[11px] text-slate-500">ITR-V acknowledgment with official receipt</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Advanced Tax Estimator Full Feature Modal */}
      <AdvancedTaxEstimatorModal
        isOpen={isAdvancedModalOpen}
        onClose={() => setIsAdvancedModalOpen(false)}
        lang={lang}
        initialAY={assessmentYear}
        initialIncome={annualIncome}
        initialIsSalaried={isSalaried}
      />
    </section>
  );
};
