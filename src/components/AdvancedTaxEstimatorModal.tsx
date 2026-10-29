import React, { useState, useMemo } from 'react';
import { Language } from '../types';
import { 
  AssessmentYear, 
  TaxpayerAgeGroup, 
  AdvancedTaxInputs, 
  calculateAdvancedTax, 
  formatINR 
} from '../utils/taxCalculator';
import { BUSINESS_CONTACTS } from '../data/content';
import { 
  X, 
  Calculator, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  TrendingDown, 
  Building2, 
  Briefcase, 
  Home, 
  Coins, 
  HelpCircle,
  FileCheck,
  Send,
  Check,
  ChevronDown,
  Layers
} from 'lucide-react';

interface AdvancedTaxEstimatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  initialAY?: AssessmentYear;
  initialIncome?: number;
  initialIsSalaried?: boolean;
}

export const AdvancedTaxEstimatorModal: React.FC<AdvancedTaxEstimatorModalProps> = ({
  isOpen,
  onClose,
  lang,
  initialAY = '2027-28',
  initialIncome = 750000,
  initialIsSalaried = true,
}) => {
  const [activeTab, setActiveTab] = useState<'salary' | 'house' | 'business' | 'capital_gains' | 'other' | 'deductions'>('salary');

  // Form State
  const [assessmentYear, setAssessmentYear] = useState<AssessmentYear>(initialAY);
  const [ageGroup, setAgeGroup] = useState<TaxpayerAgeGroup>('under_60');
  const [residentialStatus, setResidentialStatus] = useState<'resident' | 'non_resident'>('resident');
  const [isSalaried, setIsSalaried] = useState<boolean>(initialIsSalaried);

  // 1. Salary
  const [grossSalary, setGrossSalary] = useState<number>(initialIncome);
  const [hraReceived, setHraReceived] = useState<number>(0);
  const [rentPaid, setRentPaid] = useState<number>(0);
  const [isMetroCity, setIsMetroCity] = useState<boolean>(false);
  const [specialAllowance, setSpecialAllowance] = useState<number>(0);
  const [ltaExemption, setLtaExemption] = useState<number>(0);
  const [professionalTax, setProfessionalTax] = useState<number>(2400);

  // 2. House Property
  const [selfOccupiedInterest24b, setSelfOccupiedInterest24b] = useState<number>(0);
  const [letOutRentalIncome, setLetOutRentalIncome] = useState<number>(0);
  const [municipalTaxesPaid, setMunicipalTaxesPaid] = useState<number>(0);
  const [letOutInterestPaid, setLetOutInterestPaid] = useState<number>(0);

  // 3. Business & Profession
  const [businessIncomeType, setBusinessIncomeType] = useState<'none' | 'presumptive_44ad' | 'presumptive_44ada' | 'regular_books'>('none');
  const [businessTurnover, setBusinessTurnover] = useState<number>(0);
  const [presumptiveProfitPercent, setPresumptiveProfitPercent] = useState<number>(8);
  const [regularNetProfit, setRegularNetProfit] = useState<number>(0);

  // 4. Capital Gains
  const [stcg111A, setStcg111A] = useState<number>(0);
  const [stcgNormal, setStcgNormal] = useState<number>(0);
  const [ltcg112A, setLtcg112A] = useState<number>(0);
  const [ltcgOther, setLtcgOther] = useState<number>(0);

  // 5. Other Sources
  const [savingsBankInterest, setSavingsBankInterest] = useState<number>(0);
  const [fdInterest, setFdInterest] = useState<number>(0);
  const [dividendIncome, setDividendIncome] = useState<number>(0);
  const [otherIncome, setOtherIncome] = useState<number>(0);

  // Chapter VI-A Deductions
  const [deduction80C, setDeduction80C] = useState<number>(150000);
  const [deduction80CCD1B, setDeduction80CCD1B] = useState<number>(0);
  const [deduction80CCD2, setDeduction80CCD2] = useState<number>(0);
  const [deduction80D_self, setDeduction80D_self] = useState<number>(25000);
  const [deduction80D_parents, setDeduction80D_parents] = useState<number>(0);
  const [deduction80E, setDeduction80E] = useState<number>(0);
  const [deduction80G, setDeduction80G] = useState<number>(0);
  const [otherChapterVIA, setOtherChapterVIA] = useState<number>(0);

  // Modal State for Filing Ticket
  const [showFilingSuccess, setShowFilingSuccess] = useState<boolean>(false);
  const [filingTicketId, setFilingTicketId] = useState<string>('');
  const [clientName, setClientName] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('');

  // Prepare input payload
  const inputs: AdvancedTaxInputs = useMemo(() => ({
    assessmentYear,
    ageGroup,
    residentialStatus,
    grossSalary: isSalaried ? grossSalary : 0,
    hraReceived,
    rentPaid,
    isMetroCity,
    specialAllowance,
    ltaExemption,
    professionalTax,
    isSalaried,
    selfOccupiedInterest24b,
    letOutRentalIncome,
    municipalTaxesPaid,
    letOutInterestPaid,
    businessIncomeType,
    businessTurnover,
    presumptiveProfitPercent,
    regularNetProfit,
    stcg111A,
    stcgNormal,
    ltcg112A,
    ltcgOther,
    savingsBankInterest,
    fdInterest,
    dividendIncome,
    otherIncome,
    deduction80C,
    deduction80CCD1B,
    deduction80CCD2,
    deduction80D_self,
    deduction80D_parents,
    deduction80E,
    deduction80G,
    deduction80TTA_TTB: 0,
    otherChapterVIA,
  }), [
    assessmentYear,
    ageGroup,
    residentialStatus,
    grossSalary,
    hraReceived,
    rentPaid,
    isMetroCity,
    specialAllowance,
    ltaExemption,
    professionalTax,
    isSalaried,
    selfOccupiedInterest24b,
    letOutRentalIncome,
    municipalTaxesPaid,
    letOutInterestPaid,
    businessIncomeType,
    businessTurnover,
    presumptiveProfitPercent,
    regularNetProfit,
    stcg111A,
    stcgNormal,
    ltcg112A,
    ltcgOther,
    savingsBankInterest,
    fdInterest,
    dividendIncome,
    otherIncome,
    deduction80C,
    deduction80CCD1B,
    deduction80CCD2,
    deduction80D_self,
    deduction80D_parents,
    deduction80E,
    deduction80G,
    otherChapterVIA,
  ]);

  const result = useMemo(() => calculateAdvancedTax(inputs), [inputs]);

  if (!isOpen) return null;

  const handleFileITRWithTaxcent = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = clientPhone.replace(/\D/g, '');
    if (!clientName.trim() || cleanPhone.length !== 10) {
      alert(lang === 'as' ? 'অনুগ্ৰহ কৰি আপোনাৰ নাম আৰু ১০ টা সংখ্যাৰ ফোন নম্বৰ দিয়ক' : 'Please provide your name and 10-digit phone number');
      return;
    }

    const ticketId = `ITR-${assessmentYear.replace('-', '')}-${Date.now().toString().slice(-5)}`;
    setFilingTicketId(ticketId);

    const recommendedRegimeName = result.recommendedRegime === 'new'
      ? 'New Tax Regime (u/s 115BAC)'
      : result.recommendedRegime === 'old'
      ? 'Old Tax Regime'
      : 'Any (Both Equal)';

    const bestTax = result.recommendedRegime === 'new'
      ? result.newRegime.totalTaxPayable
      : result.oldRegime.totalTaxPayable;

    const message = `*Taxcent Connect - ITR Filing Request*\n` +
      `------------------------------------\n` +
      `🎫 *Ticket ID:* ${ticketId}\n` +
      `📅 *Assessment Year:* AY ${assessmentYear} (${result.financialYear})\n` +
      `👤 *Client Name:* ${clientName.trim()}\n` +
      `📱 *Mobile No:* +91 ${cleanPhone}\n` +
      `💼 *Filing Type:* Individual ITR Filing\n` +
      `💰 *Gross Income:* ${formatINR(result.newRegime.grossTotalIncome)}\n` +
      `🏆 *Recommended Regime:* ${recommendedRegimeName}\n` +
      `💸 *Est. Tax Payable:* ${formatINR(bestTax)}\n` +
      (result.taxSaved > 0 ? `✨ *Tax Saved vs Other Regime:* ${formatINR(result.taxSaved)}\n` : '') +
      `------------------------------------\n` +
      `_I computed my tax using Taxcent Advanced Estimator and request ITR filing assistance._`;

    // Directly dispatch to WhatsApp
    window.open(`https://wa.me/91${BUSINESS_CONTACTS.phone1}?text=${encodeURIComponent(message)}`, '_blank');
    setShowFilingSuccess(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-4 sm:my-8 flex flex-col max-h-[92vh]">
        
        {/* Modal Top Bar */}
        <div className="bg-[#0a2540] text-white px-5 sm:px-8 py-4 sm:py-5 flex items-center justify-between border-b border-sky-900 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-xl font-extrabold tracking-tight text-white">
                  {lang === 'as' ? 'টেক্সচেণ্ট এডভান্সড ইনকাম টেক্স কেলকুলেটৰ' : 'Taxcent Advanced Tax Estimator'}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-sky-500 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                  Full Feature
                </span>
              </div>
              <p className="text-xs text-sky-200/80 mt-0.5">
                {lang === 'as'
                  ? 'সকলো উপাৰ্জন, অধ্যায় VI-A ৰেহাই, আৰু পুৰণি বনাম নতুন ৰেজিমে তুলনা'
                  : 'Comprehensive calculation across all 5 Income Heads, Exemptions & Regime Comparison'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Controls Bar: Assessment Year & Taxpayer Profile */}
        <div className="bg-slate-100/90 border-b border-slate-200 px-5 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          {/* Assessment Year Selector */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
              {lang === 'as' ? 'কৰ নিৰ্ধাৰণ বৰ্ষ (AY):' : 'Assessment Year:'}
            </span>
            <div className="inline-flex rounded-xl p-0.5 bg-white border border-slate-300 shadow-xs">
              {(['2027-28', '2026-27', '2025-26', '2024-25'] as AssessmentYear[]).map((ay) => (
                <button
                  key={ay}
                  onClick={() => setAssessmentYear(ay)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    assessmentYear === ay
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  AY {ay} {ay === '2027-28' && <span className="ml-1 text-[10px] opacity-90">(Current FY 2026-27)</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Age Group */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
              {lang === 'as' ? 'বয়সৰ শ্ৰেণী:' : 'Age Category:'}
            </span>
            <select
              value={ageGroup}
              onChange={(e) => setAgeGroup(e.target.value as TaxpayerAgeGroup)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
            >
              <option value="under_60">Individual (&lt; 60 yrs)</option>
              <option value="senior">Senior Citizen (60 - 80 yrs)</option>
              <option value="super_senior">Super Senior (&gt; 80 yrs)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
              {lang === 'as' ? 'বাসিন্দাৰ অৱস্থা:' : 'Residential Status:'}
            </span>
            <select
              value={residentialStatus}
              onChange={(e) => setResidentialStatus(e.target.value as 'resident' | 'non_resident')}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
            >
              <option value="resident">Resident</option>
              <option value="non_resident">Non-resident (NRI)</option>
            </select>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Head-wise inputs (7 cols on desktop) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Input Navigation Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200">
              <button
                onClick={() => setActiveTab('salary')}
                className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'salary'
                    ? 'bg-sky-100 text-sky-900 border border-sky-300'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5 text-sky-600" />
                <span>Salary Income</span>
              </button>

              <button
                onClick={() => setActiveTab('house')}
                className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'house'
                    ? 'bg-sky-100 text-sky-900 border border-sky-300'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Home className="w-3.5 h-3.5 text-sky-600" />
                <span>House Property</span>
              </button>

              <button
                onClick={() => setActiveTab('business')}
                className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'business'
                    ? 'bg-sky-100 text-sky-900 border border-sky-300'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Building2 className="w-3.5 h-3.5 text-sky-600" />
                <span>Business / 44AD</span>
              </button>

              <button
                onClick={() => setActiveTab('capital_gains')}
                className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'capital_gains'
                    ? 'bg-sky-100 text-sky-900 border border-sky-300'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Coins className="w-3.5 h-3.5 text-sky-600" />
                <span>Capital Gains</span>
              </button>

              <button
                onClick={() => setActiveTab('other')}
                className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'other'
                    ? 'bg-sky-100 text-sky-900 border border-sky-300'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-sky-600" />
                <span>Other Sources</span>
              </button>

              <button
                onClick={() => setActiveTab('deductions')}
                className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'deductions'
                    ? 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Deductions (80C/80D)</span>
              </button>
            </div>

            {/* Tab 1: Salary Income */}
            {activeTab === 'salary' && (
              <div className="space-y-4 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-sky-600" />
                    <span>Income from Salary (Form 16)</span>
                  </h3>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isSalaried}
                      onChange={(e) => setIsSalaried(e.target.checked)}
                      className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
                    />
                    <span>Salaried Employee</span>
                  </label>
                </div>

                {isSalaried ? (
                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Gross Annual Salary (CTC / Gross Salary u/s 17(1))
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">₹</span>
                        <input
                          type="number"
                          value={grossSalary || ''}
                          onChange={(e) => setGrossSalary(Number(e.target.value))}
                          placeholder="e.g. 1000000"
                          className="w-full pl-8 pr-4 py-2 bg-white rounded-xl border border-slate-300 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                        />
                      </div>
                    </div>

                    {/* Standard deduction notification */}
                    <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 text-xs text-sky-900 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Standard Deduction Automatically Applied:</span>{' '}
                        {assessmentYear === '2024-25' ? '₹50,000' : '₹75,000'} in New Regime & ₹50,000 in Old Regime.
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          HRA Received per year (Old Regime)
                        </label>
                        <input
                          type="number"
                          value={hraReceived || ''}
                          onChange={(e) => setHraReceived(Number(e.target.value))}
                          placeholder="0"
                          className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Actual Rent Paid per year
                        </label>
                        <input
                          type="number"
                          value={rentPaid || ''}
                          onChange={(e) => setRentPaid(Number(e.target.value))}
                          placeholder="0"
                          className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Professional Tax Paid (Max ₹2,500)
                        </label>
                        <input
                          type="number"
                          value={professionalTax || ''}
                          onChange={(e) => setProfessionalTax(Number(e.target.value))}
                          placeholder="2400"
                          className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          LTA Exemption Claimed
                        </label>
                        <input
                          type="number"
                          value={ltaExemption || ''}
                          onChange={(e) => setLtaExemption(Number(e.target.value))}
                          placeholder="0"
                          className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 text-center text-xs text-slate-500 bg-white rounded-xl border border-slate-200">
                    You have toggled off Salaried employee status. Check Business or Capital Gains tabs to declare income.
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: House Property */}
            {activeTab === 'house' && (
              <div className="space-y-4 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Home className="w-4 h-4 text-sky-600" />
                  <span>Income / Loss from House Property</span>
                </h3>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Interest on Self-Occupied Home Loan (Section 24b - Max ₹2,00,000 in Old Regime)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">₹</span>
                    <input
                      type="number"
                      value={selfOccupiedInterest24b || ''}
                      onChange={(e) => setSelfOccupiedInterest24b(Number(e.target.value))}
                      placeholder="e.g. 180000"
                      className="w-full pl-8 pr-4 py-2 bg-white rounded-xl border border-slate-300 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    *Note: Under New Regime u/s 115BAC, interest on self-occupied house cannot be set off against salary or other heads.
                  </span>
                </div>

                <div className="pt-3 border-t border-slate-200 space-y-3">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                    Let-Out (Rented) Property (Optional)
                  </span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-700 mb-1 font-semibold">Annual Rent Received</label>
                      <input
                        type="number"
                        value={letOutRentalIncome || ''}
                        onChange={(e) => setLetOutRentalIncome(Number(e.target.value))}
                        placeholder="0"
                        className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-700 mb-1 font-semibold">Municipal Taxes Paid</label>
                      <input
                        type="number"
                        value={municipalTaxesPaid || ''}
                        onChange={(e) => setMunicipalTaxesPaid(Number(e.target.value))}
                        placeholder="0"
                        className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-700 mb-1 font-semibold">Interest on Let-Out Property Loan</label>
                    <input
                      type="number"
                      value={letOutInterestPaid || ''}
                      onChange={(e) => setLetOutInterestPaid(Number(e.target.value))}
                      placeholder="0"
                      className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Business & Profession */}
            {activeTab === 'business' && (
              <div className="space-y-4 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-sky-600" />
                  <span>Profits from Business & Profession</span>
                </h3>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Taxation Method for Business
                  </label>
                  <select
                    value={businessIncomeType}
                    onChange={(e) => setBusinessIncomeType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="none">No Business Income</option>
                    <option value="presumptive_44ad">Presumptive Business 44AD (Traders, Retailers, Contractors - Min 6% or 8%)</option>
                    <option value="presumptive_44ada">Presumptive Professionals 44ADA (Engineers, Lawyers, Doctors, Consultants - Min 50%)</option>
                    <option value="regular_books">Regular Books of Accounts (Audit / Non-audit Net Profit)</option>
                  </select>
                </div>

                {businessIncomeType === 'presumptive_44ad' && (
                  <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Gross Annual Turnover / Receipts</label>
                      <input
                        type="number"
                        value={businessTurnover || ''}
                        onChange={(e) => setBusinessTurnover(Number(e.target.value))}
                        placeholder="e.g. 2500000"
                        className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Presumed Profit Margin % (8% for cash receipts, 6% for digital transactions)
                      </label>
                      <input
                        type="number"
                        value={presumptiveProfitPercent || ''}
                        onChange={(e) => setPresumptiveProfitPercent(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-semibold"
                      />
                    </div>
                  </div>
                )}

                {businessIncomeType === 'presumptive_44ada' && (
                  <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Total Professional Gross Receipts</label>
                      <input
                        type="number"
                        value={businessTurnover || ''}
                        onChange={(e) => setBusinessTurnover(Number(e.target.value))}
                        placeholder="e.g. 1500000"
                        className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-semibold"
                      />
                    </div>
                    <span className="text-xs text-sky-700 font-semibold block">
                      *Section 44ADA presumes 50% of gross receipts as taxable net profit without maintaining detailed books.
                    </span>
                  </div>
                )}

                {businessIncomeType === 'regular_books' && (
                  <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Net Taxable Profit from P&L Account</label>
                      <input
                        type="number"
                        value={regularNetProfit || ''}
                        onChange={(e) => setRegularNetProfit(Number(e.target.value))}
                        placeholder="e.g. 500000"
                        className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-semibold"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 4: Capital Gains */}
            {activeTab === 'capital_gains' && (
              <div className="space-y-4 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Coins className="w-4 h-4 text-sky-600" />
                  <span>Capital Gains (Shares, Mutual Funds, Real Estate)</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      STCG u/s 111A (Equity / MF - {assessmentYear === '2024-25' ? '15%' : '20%'})
                    </label>
                    <input
                      type="number"
                      value={stcg111A || ''}
                      onChange={(e) => setStcg111A(Number(e.target.value))}
                      placeholder="0"
                      className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      STCG at Normal Slab Rate
                    </label>
                    <input
                      type="number"
                      value={stcgNormal || ''}
                      onChange={(e) => setStcgNormal(Number(e.target.value))}
                      placeholder="0"
                      className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      LTCG u/s 112A (Equity / MF - {assessmentYear === '2024-25' ? '10% above 1L' : '12.5% above 1.25L'})
                    </label>
                    <input
                      type="number"
                      value={ltcg112A || ''}
                      onChange={(e) => setLtcg112A(Number(e.target.value))}
                      placeholder="0"
                      className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      LTCG on Other Assets / Land (12.5% / 20%)
                    </label>
                    <input
                      type="number"
                      value={ltcgOther || ''}
                      onChange={(e) => setLtcgOther(Number(e.target.value))}
                      placeholder="0"
                      className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-semibold"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Tab 5: Other Sources */}
            {activeTab === 'other' && (
              <div className="space-y-4 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-sky-600" />
                  <span>Income from Other Sources</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Savings Bank Interest</label>
                    <input
                      type="number"
                      value={savingsBankInterest || ''}
                      onChange={(e) => setSavingsBankInterest(Number(e.target.value))}
                      placeholder="0"
                      className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Fixed Deposit (FD) / Term Interest</label>
                    <input
                      type="number"
                      value={fdInterest || ''}
                      onChange={(e) => setFdInterest(Number(e.target.value))}
                      placeholder="0"
                      className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Dividend Income</label>
                    <input
                      type="number"
                      value={dividendIncome || ''}
                      onChange={(e) => setDividendIncome(Number(e.target.value))}
                      placeholder="0"
                      className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Any Other Taxable Receipts</label>
                    <input
                      type="number"
                      value={otherIncome || ''}
                      onChange={(e) => setOtherIncome(Number(e.target.value))}
                      placeholder="0"
                      className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-semibold"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Tab 6: Deductions */}
            {activeTab === 'deductions' && (
              <div className="space-y-4 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>Chapter VI-A Deductions</span>
                  </h3>
                  <span className="text-[11px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-md">
                    Reduces Old Regime Tax
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Section 80C (EPF, PPF, ELSS, Life Insurance, Tuition Fees, Home Loan Principal - Max ₹1,50,000)
                    </label>
                    <input
                      type="number"
                      value={deduction80C || ''}
                      onChange={(e) => setDeduction80C(Number(e.target.value))}
                      placeholder="150000"
                      className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Section 80D (Health Insurance Self/Family)
                      </label>
                      <input
                        type="number"
                        value={deduction80D_self || ''}
                        onChange={(e) => setDeduction80D_self(Number(e.target.value))}
                        placeholder="25000"
                        className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Section 80D (Health Insurance Parents)
                      </label>
                      <input
                        type="number"
                        value={deduction80D_parents || ''}
                        onChange={(e) => setDeduction80D_parents(Number(e.target.value))}
                        placeholder="25000"
                        className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-semibold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Section 80CCD(1B) (Additional NPS - Max ₹50,000)
                      </label>
                      <input
                        type="number"
                        value={deduction80CCD1B || ''}
                        onChange={(e) => setDeduction80CCD1B(Number(e.target.value))}
                        placeholder="0"
                        className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Section 80CCD(2) (Employer NPS - Both Regimes!)
                      </label>
                      <input
                        type="number"
                        value={deduction80CCD2 || ''}
                        onChange={(e) => setDeduction80CCD2(Number(e.target.value))}
                        placeholder="0"
                        className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-semibold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Section 80E (Education Loan Interest)
                      </label>
                      <input
                        type="number"
                        value={deduction80E || ''}
                        onChange={(e) => setDeduction80E(Number(e.target.value))}
                        placeholder="0"
                        className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Section 80G (Eligible Donations)
                      </label>
                      <input
                        type="number"
                        value={deduction80G || ''}
                        onChange={(e) => setDeduction80G(Number(e.target.value))}
                        placeholder="0"
                        className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-semibold"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Comparative Tax Summary Card (5 cols on desktop) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            
            {/* Live Recommendation Banner */}
            <div className={`p-4 rounded-2xl border ${
              result.recommendedRegime === 'new'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                : result.recommendedRegime === 'old'
                ? 'bg-blue-50 border-blue-300 text-blue-950'
                : 'bg-slate-100 border-slate-300 text-slate-900'
            }`}>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="font-extrabold text-sm uppercase tracking-wide">
                  {result.recommendedRegime === 'new'
                    ? 'New Tax Regime is Better!'
                    : result.recommendedRegime === 'old'
                    ? 'Old Tax Regime is Better!'
                    : 'Both Regimes Result in Equal Tax'}
                </span>
              </div>
              <p className="text-xs mt-1.5 leading-relaxed">
                {result.taxSaved > 0 ? (
                  <>
                    You save <strong className="text-sm font-black">{formatINR(result.taxSaved)}</strong> by choosing the{' '}
                    <span className="font-bold underline">{result.recommendedRegime === 'new' ? 'New Regime (u/s 115BAC)' : 'Old Regime'}</span>!
                  </>
                ) : (
                  'Both tax regimes calculate the identical liability.'
                )}
              </p>
            </div>

            {/* Side-by-Side Detailed Breakdown Table */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-3 text-xs">
              <div className="grid grid-cols-3 font-bold text-slate-800 pb-2 border-b border-slate-200">
                <span>Tax Breakdown</span>
                <span className="text-right text-sky-800">New Regime</span>
                <span className="text-right text-slate-800">Old Regime</span>
              </div>

              <div className="grid grid-cols-3 text-slate-600">
                <span>Gross Income</span>
                <span className="text-right font-medium">{formatINR(result.newRegime.grossTotalIncome)}</span>
                <span className="text-right font-medium">{formatINR(result.oldRegime.grossTotalIncome)}</span>
              </div>

              <div className="grid grid-cols-3 text-slate-600">
                <span>Standard Ded.</span>
                <span className="text-right text-emerald-700">-{formatINR(result.newRegime.standardDeduction)}</span>
                <span className="text-right text-emerald-700">-{formatINR(result.oldRegime.standardDeduction)}</span>
              </div>

              <div className="grid grid-cols-3 text-slate-600">
                <span>Other Deductions</span>
                <span className="text-right text-emerald-700">-{formatINR(result.newRegime.chapterVIADeductions)}</span>
                <span className="text-right text-emerald-700">-{formatINR(result.oldRegime.chapterVIADeductions + result.oldRegime.exemptions)}</span>
              </div>

              <div className="grid grid-cols-3 font-bold text-slate-800 pt-1 border-t border-slate-200">
                <span>Net Taxable</span>
                <span className="text-right">{formatINR(result.newRegime.netTaxableIncome)}</span>
                <span className="text-right">{formatINR(result.oldRegime.netTaxableIncome)}</span>
              </div>

              <div className="grid grid-cols-3 text-slate-600">
                <span>Slab Tax</span>
                <span className="text-right">{formatINR(result.newRegime.slabTax)}</span>
                <span className="text-right">{formatINR(result.oldRegime.slabTax)}</span>
              </div>

              <div className="grid grid-cols-3 text-slate-600">
                <span>Sec 87A Rebate</span>
                <span className="text-right text-emerald-700">-{formatINR(result.newRegime.rebate87A)}</span>
                <span className="text-right text-emerald-700">-{formatINR(result.oldRegime.rebate87A)}</span>
              </div>

              <div className="grid grid-cols-3 text-slate-600">
                <span>Cess (4%)</span>
                <span className="text-right">{formatINR(result.newRegime.cess)}</span>
                <span className="text-right">{formatINR(result.oldRegime.cess)}</span>
              </div>

              <div className="grid grid-cols-3 font-extrabold text-sm pt-2 border-t-2 border-slate-300">
                <span>Total Tax</span>
                <span className={`text-right ${result.recommendedRegime === 'new' ? 'text-emerald-700 text-base font-black' : 'text-slate-800'}`}>
                  {formatINR(result.newRegime.totalTaxPayable)}
                </span>
                <span className={`text-right ${result.recommendedRegime === 'old' ? 'text-emerald-700 text-base font-black' : 'text-slate-800'}`}>
                  {formatINR(result.oldRegime.totalTaxPayable)}
                </span>
              </div>
            </div>

            {/* Direct "File ITR with Taxcent" Filing Form / CTA */}
            <div className="bg-[#0a2540] text-white p-5 rounded-2xl border border-sky-900 shadow-md">
              <div className="flex items-center gap-2 mb-2">
                <FileCheck className="w-4 h-4 text-sky-400" />
                <h4 className="font-extrabold text-sm text-white">
                  {lang === 'as' ? 'Taxcent ৰ সৈতে ITR ফাইল কৰক' : 'File ITR with Taxcent'}
                </h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                {lang === 'as'
                  ? 'উপৰোক্ত কৰ গণনাৰ ভিত্তিত আমাৰ কৰ পৰামৰ্শদাতাই আপোনাৰ আয়কৰ ৰিটাৰ্ণ (ITR-1, ITR-2, ITR-3, ITR-4) সম্পূৰ্ণ কৰিব।'
                  : 'Get your return prepared and filed securely by Taxcent consulting professionals in Ranabari Market.'}
              </p>

              <form onSubmit={handleFileITRWithTaxcent} className="space-y-2.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder={lang === 'as' ? 'আপোনাৰ সম্পূৰ্ণ নাম' : 'Your Full Name'}
                    className="px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-400 font-semibold"
                  />
                  <input
                    type="tel"
                    required
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder={lang === 'as' ? '১০ টা সংখ্যাৰ মোবাইল নম্বৰ' : '10-digit Mobile No'}
                    className="px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-400 font-mono font-semibold"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{lang === 'as' ? 'Taxcent লৈ হোৱাটছএপত প্ৰেৰণ কৰক' : 'File ITR with Taxcent on WhatsApp'}</span>
                </button>
              </form>

              {showFilingSuccess && (
                <div className="mt-3 p-3 rounded-xl bg-emerald-500/20 border border-emerald-400 text-xs text-emerald-200">
                  <span className="font-bold">✓ Ticket Generated: {filingTicketId}</span>
                  <p className="mt-0.5 text-[11px] text-emerald-300">
                    Dispatched to WhatsApp (+91 {BUSINESS_CONTACTS.phone1}). Our tax expert will review your computation shortly.
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 sm:px-8 py-3.5 flex items-center justify-between gap-4 text-xs shrink-0">
          <span className="text-slate-500 text-[11px]">
            *Estimate based on selected tax year and Indian Income-tax Act rules. Special cases and final liability may differ.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
          >
            {lang === 'as' ? 'বন্ধ কৰক' : 'Close Estimator'}
          </button>
        </div>

      </div>
    </div>
  );
};
