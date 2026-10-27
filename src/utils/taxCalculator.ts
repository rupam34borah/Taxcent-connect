export type AssessmentYear = '2027-28' | '2026-27' | '2025-26' | '2024-25';
export type TaxpayerAgeGroup = 'under_60' | 'senior' | 'super_senior';

export interface QuickTaxInputs {
  assessmentYear: AssessmentYear;
  ageGroup: TaxpayerAgeGroup;
  isSalaried: boolean;
  annualIncome: number;
  // Quick deductions (for Old Regime)
  deduction80C: number;
  deduction80D: number;
  homeLoanInterest24b: number;
  otherDeductions: number;
}

export interface AdvancedTaxInputs {
  assessmentYear: AssessmentYear;
  ageGroup: TaxpayerAgeGroup;
  residentialStatus: 'resident' | 'non_resident';

  // 1. Income from Salary
  grossSalary: number;
  hraReceived: number;
  rentPaid: number;
  isMetroCity: boolean;
  specialAllowance: number;
  ltaExemption: number;
  professionalTax: number;
  isSalaried: boolean;

  // 2. Income from House Property
  selfOccupiedInterest24b: number; // max 2,00,000 under old
  letOutRentalIncome: number;
  municipalTaxesPaid: number;
  letOutInterestPaid: number;

  // 3. Profits from Business & Profession
  businessIncomeType: 'none' | 'presumptive_44ad' | 'presumptive_44ada' | 'regular_books';
  businessTurnover: number;
  presumptiveProfitPercent: number; // e.g. 6% or 8% for 44AD, 50% for 44ADA
  regularNetProfit: number;

  // 4. Capital Gains
  stcg111A: number; // Equity / equity mutual funds
  stcgNormal: number; // Short term at slab rate
  ltcg112A: number; // Listed equity / equity mutual funds (exemption 1.25L in AY 25-26, 1L in AY 24-25)
  ltcgOther: number; // Real estate / debt / other

  // 5. Income from Other Sources
  savingsBankInterest: number;
  fdInterest: number;
  dividendIncome: number;
  otherIncome: number;

  // Chapter VI-A Deductions (Old Regime)
  deduction80C: number; // max 1,50,000
  deduction80CCD1B: number; // NPS self max 50,000
  deduction80CCD2: number; // Employer NPS (allowed in BOTH Old & New)
  deduction80D_self: number; // Mediclaim Self & family (max 25k or 50k for senior)
  deduction80D_parents: number; // Mediclaim Parents (max 25k or 50k for senior)
  deduction80E: number; // Education loan interest
  deduction80G: number; // Donations
  deduction80TTA_TTB: number; // Savings interest (10k for non-senior, 50k 80TTB for senior)
  otherChapterVIA: number;
}

export interface RegimeTaxBreakdown {
  regime: 'New Regime (u/s 115BAC)' | 'Old Regime';
  grossTotalIncome: number;
  standardDeduction: number;
  exemptions: number; // HRA, LTA, PT
  chapterVIADeductions: number;
  totalDeductions: number;
  netTaxableIncome: number;
  slabTax: number;
  specialRateTax: number; // Capital gains
  taxBeforeRebate: number;
  rebate87A: number;
  marginalRelief: number;
  taxAfterRebate: number;
  surcharge: number;
  cess: number; // 4%
  totalTaxPayable: number;
  effectiveTaxRate: number; // %
}

export interface TaxCalculationResult {
  assessmentYear: AssessmentYear;
  financialYear: string;
  newRegime: RegimeTaxBreakdown;
  oldRegime: RegimeTaxBreakdown;
  recommendedRegime: 'new' | 'old' | 'equal';
  taxSaved: number;
}

// Format currency in Indian Lakhs/Thousands (e.g., ₹7,50,000)
export function formatINR(val: number): string {
  if (isNaN(val) || val === 0) return '₹0';
  return '₹' + Math.round(val).toLocaleString('en-IN');
}

// Compute HRA Exemption for Old Regime
export function calculateHRAExemption(
  basicSalary: number,
  hraReceived: number,
  rentPaid: number,
  isMetro: boolean
): number {
  if (hraReceived <= 0 || rentPaid <= 0) return 0;
  const rentExcess = Math.max(0, rentPaid - 0.1 * basicSalary);
  const metroLimit = (isMetro ? 0.5 : 0.4) * basicSalary;
  return Math.min(hraReceived, rentExcess, metroLimit);
}

// Slab Calculator for New Regime
function calculateNewRegimeSlabTax(taxableIncome: number, ay: AssessmentYear): number {
  if (taxableIncome <= 0) return 0;

  let tax = 0;
  if (ay === '2024-25') {
    // AY 2024-25 (FY 2023-24)
    // 0-3L: Nil
    // 3L-6L: 5%
    // 6L-9L: 10%
    // 9L-12L: 15%
    // 12L-15L: 20%
    // >15L: 30%
    if (taxableIncome > 300000) {
      tax += Math.min(taxableIncome - 300000, 300000) * 0.05;
    }
    if (taxableIncome > 600000) {
      tax += Math.min(taxableIncome - 600000, 300000) * 0.10;
    }
    if (taxableIncome > 900000) {
      tax += Math.min(taxableIncome - 900000, 300000) * 0.15;
    }
    if (taxableIncome > 1200000) {
      tax += Math.min(taxableIncome - 1200000, 300000) * 0.20;
    }
    if (taxableIncome > 1500000) {
      tax += (taxableIncome - 1500000) * 0.30;
    }
  } else {
    // AY 2025-26 & AY 2026-27 (Budget 2024 revised slabs)
    // 0-3L: Nil
    // 3L-7L: 5% (₹20,000 max)
    // 7L-10L: 10% (₹30,000 max)
    // 10L-12L: 15% (₹30,000 max)
    // 12L-15L: 20% (₹60,000 max)
    // >15L: 30%
    if (taxableIncome > 300000) {
      tax += Math.min(taxableIncome - 300000, 400000) * 0.05;
    }
    if (taxableIncome > 700000) {
      tax += Math.min(taxableIncome - 700000, 300000) * 0.10;
    }
    if (taxableIncome > 1000000) {
      tax += Math.min(taxableIncome - 1000000, 200000) * 0.15;
    }
    if (taxableIncome > 1200000) {
      tax += Math.min(taxableIncome - 1200000, 300000) * 0.20;
    }
    if (taxableIncome > 1500000) {
      tax += (taxableIncome - 1500000) * 0.30;
    }
  }

  return tax;
}

// Slab Calculator for Old Regime
function calculateOldRegimeSlabTax(taxableIncome: number, ageGroup: TaxpayerAgeGroup): number {
  if (taxableIncome <= 0) return 0;

  let exemptionLimit = 250000;
  if (ageGroup === 'senior') {
    exemptionLimit = 300000;
  } else if (ageGroup === 'super_senior') {
    exemptionLimit = 500000;
  }

  let tax = 0;
  if (ageGroup === 'super_senior') {
    // 0 - 5L: Nil
    // 5L - 10L: 20%
    // >10L: 30%
    if (taxableIncome > 500000) {
      tax += Math.min(taxableIncome - 500000, 500000) * 0.20;
    }
    if (taxableIncome > 1000000) {
      tax += (taxableIncome - 1000000) * 0.30;
    }
  } else if (ageGroup === 'senior') {
    // 0 - 3L: Nil
    // 3L - 5L: 5% (₹10,000 max)
    // 5L - 10L: 20% (₹1,00,000 max)
    // >10L: 30%
    if (taxableIncome > 300000) {
      tax += Math.min(taxableIncome - 300000, 200000) * 0.05;
    }
    if (taxableIncome > 500000) {
      tax += Math.min(taxableIncome - 500000, 500000) * 0.20;
    }
    if (taxableIncome > 1000000) {
      tax += (taxableIncome - 1000000) * 0.30;
    }
  } else {
    // Individual under 60
    // 0 - 2.5L: Nil
    // 2.5L - 5L: 5% (₹12,500 max)
    // 5L - 10L: 20% (₹1,00,000 max)
    // >10L: 30%
    if (taxableIncome > 250000) {
      tax += Math.min(taxableIncome - 250000, 250000) * 0.05;
    }
    if (taxableIncome > 500000) {
      tax += Math.min(taxableIncome - 500000, 500000) * 0.20;
    }
    if (taxableIncome > 1000000) {
      tax += (taxableIncome - 1000000) * 0.30;
    }
  }

  return tax;
}

// Compute Surcharge
function calculateSurcharge(taxableIncome: number, computedTax: number, isNewRegime: boolean): number {
  if (taxableIncome <= 5000000 || computedTax <= 0) return 0;

  let rate = 0;
  if (taxableIncome > 5000000 && taxableIncome <= 10000000) {
    rate = 0.10;
  } else if (taxableIncome > 10000000 && taxableIncome <= 20000000) {
    rate = 0.15;
  } else if (taxableIncome > 20000000) {
    // Under New Regime, surcharge is capped at 25% (previously 37% in old regime for > 5 Cr)
    if (isNewRegime) {
      rate = 0.25;
    } else {
      rate = taxableIncome > 50000000 ? 0.37 : 0.25;
    }
  }

  return Math.round(computedTax * rate);
}

/**
 * Quick Tax Estimator Calculation
 */
export function calculateQuickTax(inputs: QuickTaxInputs): TaxCalculationResult {
  const { assessmentYear, ageGroup, isSalaried, annualIncome } = inputs;
  const grossTotal = Math.max(0, annualIncome);

  // New Regime Standard Deduction:
  // AY 25-26 & AY 26-27: ₹75,000 for salaried
  // AY 24-25: ₹50,000 for salaried
  const newRegimeStdDeduction = isSalaried
    ? (assessmentYear === '2024-25' ? 50000 : 75000)
    : 0;

  const oldRegimeStdDeduction = isSalaried ? 50000 : 0;

  // New Regime calculation
  const newTaxable = Math.max(0, grossTotal - newRegimeStdDeduction);
  let newSlabTax = calculateNewRegimeSlabTax(newTaxable, assessmentYear);
  let newRebate87A = 0;
  let newMarginalRelief = 0;

  // Section 87A rebate for New Regime:
  // Threshold is ₹7,00,000
  if (newTaxable <= 700000) {
    newRebate87A = newSlabTax;
    newSlabTax = 0;
  } else {
    // Marginal relief under Section 87A:
    // If taxable income slightly exceeds ₹7,00,000, tax cannot exceed income in excess of ₹7,00,000
    const excessIncome = newTaxable - 700000;
    if (newSlabTax > excessIncome) {
      newMarginalRelief = newSlabTax - excessIncome;
      newSlabTax = excessIncome;
    }
  }

  const newSurcharge = calculateSurcharge(newTaxable, newSlabTax, true);
  const newTaxBeforeCess = newSlabTax + newSurcharge;
  const newCess = Math.round(newTaxBeforeCess * 0.04);
  const newTotalTax = newTaxBeforeCess + newCess;

  // Old Regime calculation
  const capped80C = Math.min(150000, Math.max(0, inputs.deduction80C || 0));
  const capped80D = Math.min(
    ageGroup === 'under_60' ? 25000 : 50000,
    Math.max(0, inputs.deduction80D || 0)
  );
  const capped24b = Math.min(200000, Math.max(0, inputs.homeLoanInterest24b || 0));
  const otherDed = Math.max(0, inputs.otherDeductions || 0);

  const oldTotalDeductions = oldRegimeStdDeduction + capped80C + capped80D + capped24b + otherDed;
  const oldTaxable = Math.max(0, grossTotal - oldTotalDeductions);

  let oldSlabTax = calculateOldRegimeSlabTax(oldTaxable, ageGroup);
  let oldRebate87A = 0;
  // Sec 87A Old Regime: Taxable income <= ₹5,00,000 receives up to ₹12,500 rebate
  if (oldTaxable <= 500000) {
    oldRebate87A = Math.min(oldSlabTax, 12500);
    oldSlabTax = Math.max(0, oldSlabTax - oldRebate87A);
  }

  const oldSurcharge = calculateSurcharge(oldTaxable, oldSlabTax, false);
  const oldTaxBeforeCess = oldSlabTax + oldSurcharge;
  const oldCess = Math.round(oldTaxBeforeCess * 0.04);
  const oldTotalTax = oldTaxBeforeCess + oldCess;

  const taxDiff = Math.abs(oldTotalTax - newTotalTax);
  let recommended: 'new' | 'old' | 'equal' = 'equal';
  if (newTotalTax < oldTotalTax) {
    recommended = 'new';
  } else if (oldTotalTax < newTotalTax) {
    recommended = 'old';
  }

  const fyMap: Record<AssessmentYear, string> = {
    '2027-28': 'FY 2026-27 (Current Year)',
    '2026-27': 'FY 2025-26 (Previous Year)',
    '2025-26': 'FY 2024-25 (Prior Year)',
    '2024-25': 'FY 2023-24 (Belated/Revised)',
  };

  return {
    assessmentYear,
    financialYear: fyMap[assessmentYear],
    newRegime: {
      regime: 'New Regime (u/s 115BAC)',
      grossTotalIncome: grossTotal,
      standardDeduction: newRegimeStdDeduction,
      exemptions: 0,
      chapterVIADeductions: 0,
      totalDeductions: newRegimeStdDeduction,
      netTaxableIncome: newTaxable,
      slabTax: calculateNewRegimeSlabTax(newTaxable, assessmentYear),
      specialRateTax: 0,
      taxBeforeRebate: calculateNewRegimeSlabTax(newTaxable, assessmentYear),
      rebate87A: newRebate87A,
      marginalRelief: newMarginalRelief,
      taxAfterRebate: newSlabTax,
      surcharge: newSurcharge,
      cess: newCess,
      totalTaxPayable: newTotalTax,
      effectiveTaxRate: grossTotal > 0 ? Number(((newTotalTax / grossTotal) * 100).toFixed(2)) : 0,
    },
    oldRegime: {
      regime: 'Old Regime',
      grossTotalIncome: grossTotal,
      standardDeduction: oldRegimeStdDeduction,
      exemptions: 0,
      chapterVIADeductions: capped80C + capped80D + capped24b + otherDed,
      totalDeductions: oldTotalDeductions,
      netTaxableIncome: oldTaxable,
      slabTax: calculateOldRegimeSlabTax(oldTaxable, ageGroup),
      specialRateTax: 0,
      taxBeforeRebate: calculateOldRegimeSlabTax(oldTaxable, ageGroup),
      rebate87A: oldRebate87A,
      marginalRelief: 0,
      taxAfterRebate: oldSlabTax,
      surcharge: oldSurcharge,
      cess: oldCess,
      totalTaxPayable: oldTotalTax,
      effectiveTaxRate: grossTotal > 0 ? Number(((oldTotalTax / grossTotal) * 100).toFixed(2)) : 0,
    },
    recommendedRegime: recommended,
    taxSaved: taxDiff,
  };
}

/**
 * Full Advanced Tax Calculation across all 5 Income Heads
 */
export function calculateAdvancedTax(inputs: AdvancedTaxInputs): TaxCalculationResult {
  const { assessmentYear, ageGroup } = inputs;

  // 1. Salary Head
  const grossSalary = Math.max(0, inputs.grossSalary || 0);
  const hraExemption = inputs.isSalaried
    ? calculateHRAExemption(grossSalary * 0.5, inputs.hraReceived || 0, inputs.rentPaid || 0, inputs.isMetroCity)
    : 0;
  const lta = Math.max(0, inputs.ltaExemption || 0);
  const profTax = Math.max(0, inputs.professionalTax || 0);
  const oldSalaryExemptions = hraExemption + lta + profTax;

  const newRegimeStdDeduction = inputs.isSalaried
    ? (assessmentYear === '2024-25' ? 50000 : 75000)
    : 0;
  const oldRegimeStdDeduction = inputs.isSalaried ? 50000 : 0;

  // 2. House Property Head
  // Self Occupied: interest loss
  const selfOccInterest = Math.max(0, inputs.selfOccupiedInterest24b || 0);
  const oldSelfOccLoss = -Math.min(200000, selfOccInterest);
  // Under New Regime: Set-off of loss from house property against other heads is NOT permitted, but let-out can have net income
  const letOutRent = Math.max(0, inputs.letOutRentalIncome || 0);
  const letOutMuniTax = Math.max(0, inputs.municipalTaxesPaid || 0);
  const netAnnualVal = Math.max(0, letOutRent - letOutMuniTax);
  const statutory30Percent = netAnnualVal * 0.30;
  const letOutInterest = Math.max(0, inputs.letOutInterestPaid || 0);
  const letOutNet = netAnnualVal - statutory30Percent - letOutInterest;

  const totalOldHouseProp = oldSelfOccLoss + letOutNet;
  const totalNewHouseProp = Math.max(0, letOutNet); // losses cannot reduce salary/business under new regime

  // 3. Business & Profession
  let businessIncome = 0;
  if (inputs.businessIncomeType === 'presumptive_44ad') {
    const rate = (inputs.presumptiveProfitPercent || 8) / 100;
    businessIncome = Math.max(0, (inputs.businessTurnover || 0) * rate);
  } else if (inputs.businessIncomeType === 'presumptive_44ada') {
    const rate = Math.max(50, inputs.presumptiveProfitPercent || 50) / 100;
    businessIncome = Math.max(0, (inputs.businessTurnover || 0) * rate);
  } else if (inputs.businessIncomeType === 'regular_books') {
    businessIncome = Math.max(0, inputs.regularNetProfit || 0);
  }

  // 4. Other Sources
  const otherSources =
    Math.max(0, inputs.savingsBankInterest || 0) +
    Math.max(0, inputs.fdInterest || 0) +
    Math.max(0, inputs.dividendIncome || 0) +
    Math.max(0, inputs.otherIncome || 0);

  // Normal Slab Income (without special rate capital gains)
  const grossNormalOld = Math.max(0, grossSalary + totalOldHouseProp + businessIncome + otherSources);
  const grossNormalNew = Math.max(0, grossSalary + totalNewHouseProp + businessIncome + otherSources);

  // Capital Gains
  const stcg111A = Math.max(0, inputs.stcg111A || 0);
  const stcgNormal = Math.max(0, inputs.stcgNormal || 0);
  const ltcg112A = Math.max(0, inputs.ltcg112A || 0);
  const ltcgOther = Math.max(0, inputs.ltcgOther || 0);

  // Budget 2024 LTCG exemption under 112A is 1.25 Lakh (1.0 Lakh for AY 2024-25)
  const ltcg112AExemption = assessmentYear === '2024-25' ? 100000 : 125000;
  const taxableLtcg112A = Math.max(0, ltcg112A - ltcg112AExemption);

  // Special capital gains tax rates:
  // Post Budget 2024 (AY 25-26+): STCG 111A = 20%, LTCG 112A = 12.5%, LTCG 112 = 12.5%
  // AY 24-25: STCG 111A = 15%, LTCG 112A = 10%, LTCG 112 = 20%
  const stcg111ARate = assessmentYear === '2024-25' ? 0.15 : 0.20;
  const ltcg112ARate = assessmentYear === '2024-25' ? 0.10 : 0.125;
  const ltcgOtherRate = assessmentYear === '2024-25' ? 0.20 : 0.125;

  const specialCapGainTax =
    (stcg111A * stcg111ARate) +
    (taxableLtcg112A * ltcg112ARate) +
    (ltcgOther * ltcgOtherRate);

  // --- Chapter VI-A Deductions ---
  // Allowed under Old Regime:
  const capped80C = Math.min(150000, Math.max(0, inputs.deduction80C || 0));
  const capped80CCD1B = Math.min(50000, Math.max(0, inputs.deduction80CCD1B || 0));
  const ded80CCD2 = Math.max(0, inputs.deduction80CCD2 || 0); // Employer NPS (allowed in BOTH!)
  const capped80D_self = Math.min(ageGroup === 'under_60' ? 25000 : 50000, Math.max(0, inputs.deduction80D_self || 0));
  const capped80D_parents = Math.min(50000, Math.max(0, inputs.deduction80D_parents || 0));
  const total80D = capped80D_self + capped80D_parents;
  const ded80E = Math.max(0, inputs.deduction80E || 0);
  const ded80G = Math.max(0, inputs.deduction80G || 0);

  // 80TTA/80TTB
  let ded80TTA_TTB = 0;
  if (ageGroup === 'under_60') {
    ded80TTA_TTB = Math.min(10000, Math.max(0, inputs.savingsBankInterest || 0));
  } else {
    // Senior citizen 80TTB up to 50,000 on all interest
    ded80TTA_TTB = Math.min(50000, Math.max(0, (inputs.savingsBankInterest || 0) + (inputs.fdInterest || 0)));
  }
  const otherVI_A = Math.max(0, inputs.otherChapterVIA || 0);

  const oldTotalChapterVIA = capped80C + capped80CCD1B + ded80CCD2 + total80D + ded80E + ded80G + ded80TTA_TTB + otherVI_A;

  // Old Regime Taxable Calculation
  const oldTotalGross = grossNormalOld + stcgNormal + stcg111A + ltcg112A + ltcgOther;
  const oldNormalTaxable = Math.max(0, (grossNormalOld + stcgNormal) - oldSalaryExemptions - oldRegimeStdDeduction - oldTotalChapterVIA);
  const oldTotalTaxable = oldNormalTaxable + stcg111A + taxableLtcg112A + ltcgOther;

  let oldSlabTax = calculateOldRegimeSlabTax(oldNormalTaxable, ageGroup);
  let oldPreRebateTax = oldSlabTax + specialCapGainTax;
  let oldRebate87A = 0;

  if (oldTotalTaxable <= 500000) {
    oldRebate87A = Math.min(oldPreRebateTax, 12500);
    oldPreRebateTax = Math.max(0, oldPreRebateTax - oldRebate87A);
  }

  const oldSurcharge = calculateSurcharge(oldTotalTaxable, oldPreRebateTax, false);
  const oldTaxBeforeCess = oldPreRebateTax + oldSurcharge;
  const oldCess = Math.round(oldTaxBeforeCess * 0.04);
  const oldTotalTax = oldTaxBeforeCess + oldCess;

  // New Regime Taxable Calculation
  // In New Regime, Section 80CCD(2) employer NPS is allowed!
  const newTotalGross = grossNormalNew + stcgNormal + stcg111A + ltcg112A + ltcgOther;
  const newNormalTaxable = Math.max(0, (grossNormalNew + stcgNormal) - newRegimeStdDeduction - ded80CCD2);
  const newTotalTaxable = newNormalTaxable + stcg111A + taxableLtcg112A + ltcgOther;

  let newSlabTax = calculateNewRegimeSlabTax(newNormalTaxable, assessmentYear);
  let newPreRebateTax = newSlabTax + specialCapGainTax;
  let newRebate87A = 0;
  let newMarginalRelief = 0;

  if (newTotalTaxable <= 700000) {
    newRebate87A = newPreRebateTax;
    newPreRebateTax = 0;
  } else {
    // Marginal relief under Section 87A
    const excessIncome = newTotalTaxable - 700000;
    if (newPreRebateTax > excessIncome && newTotalTaxable < 730000) {
      newMarginalRelief = newPreRebateTax - excessIncome;
      newPreRebateTax = excessIncome;
    }
  }

  const newSurcharge = calculateSurcharge(newTotalTaxable, newPreRebateTax, true);
  const newTaxBeforeCess = newPreRebateTax + newSurcharge;
  const newCess = Math.round(newTaxBeforeCess * 0.04);
  const newTotalTax = newTaxBeforeCess + newCess;

  const taxDiff = Math.abs(oldTotalTax - newTotalTax);
  let recommended: 'new' | 'old' | 'equal' = 'equal';
  if (newTotalTax < oldTotalTax) {
    recommended = 'new';
  } else if (oldTotalTax < newTotalTax) {
    recommended = 'old';
  }

  const fyMap: Record<AssessmentYear, string> = {
    '2027-28': 'FY 2026-27 (Current Year)',
    '2026-27': 'FY 2025-26 (Previous Year)',
    '2025-26': 'FY 2024-25 (Prior Year)',
    '2024-25': 'FY 2023-24 (Belated/Revised)',
  };

  return {
    assessmentYear,
    financialYear: fyMap[assessmentYear],
    newRegime: {
      regime: 'New Regime (u/s 115BAC)',
      grossTotalIncome: newTotalGross,
      standardDeduction: newRegimeStdDeduction,
      exemptions: 0,
      chapterVIADeductions: ded80CCD2,
      totalDeductions: newRegimeStdDeduction + ded80CCD2,
      netTaxableIncome: newTotalTaxable,
      slabTax: newSlabTax,
      specialRateTax: specialCapGainTax,
      taxBeforeRebate: calculateNewRegimeSlabTax(newNormalTaxable, assessmentYear) + specialCapGainTax,
      rebate87A: newRebate87A,
      marginalRelief: newMarginalRelief,
      taxAfterRebate: newPreRebateTax,
      surcharge: newSurcharge,
      cess: newCess,
      totalTaxPayable: newTotalTax,
      effectiveTaxRate: newTotalGross > 0 ? Number(((newTotalTax / newTotalGross) * 100).toFixed(2)) : 0,
    },
    oldRegime: {
      regime: 'Old Regime',
      grossTotalIncome: oldTotalGross,
      standardDeduction: oldRegimeStdDeduction,
      exemptions: oldSalaryExemptions,
      chapterVIADeductions: oldTotalChapterVIA,
      totalDeductions: oldSalaryExemptions + oldRegimeStdDeduction + oldTotalChapterVIA,
      netTaxableIncome: oldTotalTaxable,
      slabTax: oldSlabTax,
      specialRateTax: specialCapGainTax,
      taxBeforeRebate: calculateOldRegimeSlabTax(oldNormalTaxable, ageGroup) + specialCapGainTax,
      rebate87A: oldRebate87A,
      marginalRelief: 0,
      taxAfterRebate: oldPreRebateTax,
      surcharge: oldSurcharge,
      cess: oldCess,
      totalTaxPayable: oldTotalTax,
      effectiveTaxRate: oldTotalGross > 0 ? Number(((oldTotalTax / oldTotalGross) * 100).toFixed(2)) : 0,
    },
    recommendedRegime: recommended,
    taxSaved: taxDiff,
  };
}
