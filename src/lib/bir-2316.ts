/**
 * Bureau of Internal Revenue (BIR) Form No. 2316 & TRAIN Law Withholding Tax Engine
 * Compliant with Republic Act No. 10963 (TRAIN Law) - Tax Schedule effective Jan 1, 2023 onwards,
 * Revenue Regulations (RR) No. 11-2018, and Section 24(A)(2) of the National Internal Revenue Code (NIRC).
 */

export interface TaxBracket {
  tier: number;
  min: number;
  max: number; // Infinity for top tier
  baseTax: number;
  rate: number; // e.g. 0.15, 0.20
  description: string;
}

// Official Annual Graduated Income Tax Table (TRAIN Law, effective Jan 1, 2023 onwards)
export const ANNUAL_TAX_BRACKETS: TaxBracket[] = [
  {
    tier: 1,
    min: 0,
    max: 250000,
    baseTax: 0,
    rate: 0,
    description: 'Not over ₱250,000 (0% - Fully Exempt)',
  },
  {
    tier: 2,
    min: 250000,
    max: 400000,
    baseTax: 0,
    rate: 0.15,
    description: 'Over ₱250,000 to ₱400,000 (15% in excess of ₱250,000)',
  },
  {
    tier: 3,
    min: 400000,
    max: 800000,
    baseTax: 22500,
    rate: 0.20,
    description: 'Over ₱400,000 to ₱800,000 (₱22,500 + 20% in excess of ₱400,000)',
  },
  {
    tier: 4,
    min: 800000,
    max: 2000000,
    baseTax: 102500,
    rate: 0.25,
    description: 'Over ₱800,000 to ₱2,000,000 (₱102,500 + 25% in excess of ₱800,000)',
  },
  {
    tier: 5,
    min: 2000000,
    max: 8000000,
    baseTax: 402500,
    rate: 0.30,
    description: 'Over ₱2,000,000 to ₱8,000,000 (₱402,500 + 30% in excess of ₱2,000,000)',
  },
  {
    tier: 6,
    min: 8000000,
    max: Infinity,
    baseTax: 2202500,
    rate: 0.35,
    description: 'Over ₱8,000,000 (₱2,202,500 + 35% in excess of ₱8,000,000)',
  },
];

// Monthly Withholding Tax Table (Annual brackets divided by 12)
export const MONTHLY_TAX_BRACKETS: TaxBracket[] = [
  {
    tier: 1,
    min: 0,
    max: 20833.33,
    baseTax: 0,
    rate: 0,
    description: '₱20,833.33 and below (0% - Minimum Wage / Tax Exempt)',
  },
  {
    tier: 2,
    min: 20833.33,
    max: 33333.33,
    baseTax: 0,
    rate: 0.15,
    description: 'Over ₱20,833.33 to ₱33,333.33 (15% over ₱20,833.33)',
  },
  {
    tier: 3,
    min: 33333.33,
    max: 66666.67,
    baseTax: 1875.0,
    rate: 0.20,
    description: 'Over ₱33,333.33 to ₱66,666.67 (₱1,875.00 + 20% over ₱33,333.33)',
  },
  {
    tier: 4,
    min: 66666.67,
    max: 166666.67,
    baseTax: 8541.67,
    rate: 0.25,
    description: 'Over ₱66,666.67 to ₱166,666.67 (₱8,541.67 + 25% over ₱66,666.67)',
  },
  {
    tier: 5,
    min: 166666.67,
    max: 666666.67,
    baseTax: 33541.67,
    rate: 0.30,
    description: 'Over ₱166,666.67 to ₱666,666.67 (₱33,541.67 + 30% over ₱166,666.67)',
  },
  {
    tier: 6,
    min: 666666.67,
    max: Infinity,
    baseTax: 183541.67,
    rate: 0.35,
    description: 'Over ₱666,666.67 (₱183,541.67 + 35% over ₱666,666.67)',
  },
];

// Semi-Monthly Withholding Tax Table (Annual brackets divided by 24)
export const SEMI_MONTHLY_TAX_BRACKETS: TaxBracket[] = [
  {
    tier: 1,
    min: 0,
    max: 10416.67,
    baseTax: 0,
    rate: 0,
    description: '₱10,416.67 and below (0%)',
  },
  {
    tier: 2,
    min: 10416.67,
    max: 16666.67,
    baseTax: 0,
    rate: 0.15,
    description: '₱10,416.67 to ₱16,666.67 (15% over ₱10,416.67)',
  },
  {
    tier: 3,
    min: 16666.67,
    max: 33333.33,
    baseTax: 937.5,
    rate: 0.20,
    description: '₱16,666.67 to ₱33,333.33 (₱937.50 + 20% over ₱16,666.67)',
  },
  {
    tier: 4,
    min: 33333.33,
    max: 83333.33,
    baseTax: 4270.83,
    rate: 0.25,
    description: '₱33,333.33 to ₱83,333.33 (₱4,270.83 + 25% over ₱33,333.33)',
  },
  {
    tier: 5,
    min: 83333.33,
    max: 333333.33,
    baseTax: 16770.83,
    rate: 0.30,
    description: '₱83,333.33 to ₱333,333.33 (₱16,770.83 + 30% over ₱83,333.33)',
  },
  {
    tier: 6,
    min: 333333.33,
    max: Infinity,
    baseTax: 91770.83,
    rate: 0.35,
    description: 'Over ₱333,333.33 (₱91,770.83 + 35% over ₱333,333.33)',
  },
];

// De Minimis Statutory Ceilings (RR 11-2018 / TRAIN Law)
export const DE_MINIMIS_LIMITS = [
  { item: 'Rice Subsidy', limitMonthly: 2000, limitAnnual: 24000, desc: '₱2,000/mo or 1 sack of 50kg rice' },
  { item: 'Uniform & Clothing Allowance', limitMonthly: 583.33, limitAnnual: 7000, desc: 'Not exceeding ₱7,000 per annum' },
  { item: 'Medical Cash Allowance to Dependents', limitMonthly: 250, limitAnnual: 3000, desc: '₱250/mo (max ₱1,500/semester or ₱3,000/yr)' },
  { item: 'Actual Medical Assistance / Coverage', limitMonthly: 833.33, limitAnnual: 10000, desc: 'Not exceeding ₱10,000 per annum' },
  { item: 'Laundry Allowance', limitMonthly: 300, limitAnnual: 3600, desc: '₱300 per month' },
  { item: 'Employees Achievement Awards', limitMonthly: 833.33, limitAnnual: 10000, desc: 'Tangible personal property max ₱10,000' },
  { item: 'Gifts during Christmas & Major Anniversaries', limitMonthly: 416.67, limitAnnual: 5000, desc: 'Not exceeding ₱5,000 per annum' },
  { item: 'Daily Meal Allowance for Overtime / Night', limitMonthly: 0, limitAnnual: 0, desc: 'Max 25% of the basic minimum wage per OT shift' },
];

export const EXEMPT_13TH_MONTH_CAP = 90000; // Section 32(B)(7)(e) of NIRC

export interface Form2316Input {
  // Employee Info
  employeeName: string;
  tin: string;
  registeredAddress: string;
  zipCode?: string;
  dateOfBirth?: string;
  isMinimumWageEarner: boolean;

  // Employer Info
  employerName?: string;
  employerTin?: string;
  employerAddress?: string;
  employerZipCode?: string;
  taxYear?: number;

  // Compensation Parameters
  periodMonths: number; // Default 12 for full year, or partial (e.g. 8 for mid-year hire)
  monthlyBasicSalary: number;

  // Non-Taxable / Exempt Items
  annualDeMinimis: number;
  statutoryContributionsAnnual: number; // Total SSS + PhilHealth + Pag-IBIG EE share
  thirteenthMonthAndOtherBenefits: number; // 13th month + Christmas bonus + mid-year bonus
  mweHolidayPay?: number;
  mweOvertimePay?: number;
  mweNightDiff?: number;
  mweHazardPay?: number;
  otherNonTaxableCompensation?: number;

  // Taxable Items
  taxableAllowancesAnnual: number; // Representation, Transportation, COLA
  taxableOvertimeAnnual: number;
  taxableNightDiffAnnual: number;
  commissionsAndIncentivesAnnual: number;
  profitSharingAnnual?: number;
  otherTaxableCompensation?: number;

  // Previous Employer (if applicable)
  previousEmployerTaxableCompensation?: number;
  previousEmployerTaxWithheld?: number;

  // Taxes already withheld by Present Employer (Jan - Nov / prior cutoffs)
  presentEmployerTaxWithheldYtd: number;
}

export interface Form2316Result {
  // Identification
  input: Form2316Input;
  taxYear: number;
  isMWE: boolean;

  // Part IV-B Details
  // Non-Taxable / Exempt (Items 29 to 38)
  item29_MWEBasic: number;
  item30_MWEHoliday: number;
  item31_MWEOTrigger: number;
  item32_MWENightDiff: number;
  item33_MWEHazard: number;
  item34_Exempt13thMonth: number;
  item35_DeMinimis: number;
  item36_StatutoryDeductions: number;
  item37_OtherNonTaxable: number;
  item38_TotalNonTaxable: number;

  // Taxable Compensation (Items 39 to 52)
  item39_BasicSalary: number;
  item40_Representation: number;
  item41_Transportation: number;
  item42_COLA: number;
  item43_Housing: number;
  item44_OtherAllowances: number;
  item45_Commission: number;
  item46_ProfitSharing: number;
  item47_Fees: number;
  item48_Taxable13thMonthExcess: number;
  item49_HazardPay: number;
  item50_OvertimePay: number;
  item51_OtherTaxable: number;
  item52_TotalTaxablePresentEmployer: number;

  // Part IV-A Summary (Items 19 to 28)
  item19_GrossCompensationPresent: number;
  item20_TotalNonTaxable: number;
  item21_TaxableCompensationPresent: number;
  item22_TaxableCompensationPrevious: number;
  item23_TotalTaxableCompensation: number;
  item24_TaxDue: number;
  item25A_TaxWithheldPresent: number;
  item25B_TaxWithheldPrevious: number;
  item26_TotalTaxWithheld: number;
  item27_OverwithheldRefund: number; // If Total Withheld > Tax Due
  item28_TaxPayableAdjusted: number; // If Tax Due > Total Withheld

  // Analytics & Bracket Ladder Info
  appliedBracket: TaxBracket;
  marginalRatePercent: number;
  effectiveTaxRatePercent: number;
  monthlyEquivalentTax: number;
  semiMonthlyEquivalentTax: number;
  is13thMonthCapped: boolean;
  thirteenthMonthExcess: number;
}

/**
 * Calculates progressive tax on annual taxable income using TRAIN Law brackets.
 */
export function calculateAnnualTax(taxableIncome: number): {
  taxDue: number;
  bracket: TaxBracket;
  excessOverMin: number;
  rateTax: number;
} {
  const safeIncome = Math.max(0, taxableIncome || 0);

  for (const bracket of ANNUAL_TAX_BRACKETS) {
    if (safeIncome <= bracket.max) {
      const excessOverMin = Math.max(0, safeIncome - bracket.min);
      const rateTax = +(excessOverMin * bracket.rate).toFixed(2);
      const taxDue = +(bracket.baseTax + rateTax).toFixed(2);
      return {
        taxDue,
        bracket,
        excessOverMin,
        rateTax,
      };
    }
  }

  // Fallback to top bracket
  const topBracket = ANNUAL_TAX_BRACKETS[ANNUAL_TAX_BRACKETS.length - 1];
  const excessOverMin = Math.max(0, safeIncome - topBracket.min);
  const rateTax = +(excessOverMin * topBracket.rate).toFixed(2);
  const taxDue = +(topBracket.baseTax + rateTax).toFixed(2);
  return {
    taxDue,
    bracket: topBracket,
    excessOverMin,
    rateTax,
  };
}

/**
 * Calculates progressive withholding tax on monthly taxable income using TRAIN Law monthly table.
 */
export function calculateMonthlyTax(monthlyTaxableIncome: number): {
  taxDue: number;
  bracket: TaxBracket;
  excessOverMin: number;
} {
  const safeIncome = Math.max(0, monthlyTaxableIncome || 0);

  for (const bracket of MONTHLY_TAX_BRACKETS) {
    if (safeIncome <= bracket.max) {
      const excessOverMin = Math.max(0, safeIncome - bracket.min);
      const taxDue = +(bracket.baseTax + excessOverMin * bracket.rate).toFixed(2);
      return { taxDue, bracket, excessOverMin };
    }
  }

  const topBracket = MONTHLY_TAX_BRACKETS[MONTHLY_TAX_BRACKETS.length - 1];
  const excessOverMin = Math.max(0, safeIncome - topBracket.min);
  const taxDue = +(topBracket.baseTax + excessOverMin * topBracket.rate).toFixed(2);
  return { taxDue, bracket: topBracket, excessOverMin };
}

/**
 * Computes full BIR Form 2316 reconciliation and itemization.
 */
export function calculateForm2316(input: Form2316Input): Form2316Result {
  const taxYear = input.taxYear || new Date().getFullYear();
  const months = Math.max(1, Math.min(12, input.periodMonths || 12));
  const isMWE = !!input.isMinimumWageEarner;

  const totalBasic = +(input.monthlyBasicSalary * months).toFixed(2);

  // 13th Month Pay & Other Benefits breakdown (₱90k cap)
  const total13thAndBonuses = Math.max(0, input.thirteenthMonthAndOtherBenefits || 0);
  const exempt13th = Math.min(total13thAndBonuses, EXEMPT_13TH_MONTH_CAP);
  const taxable13thExcess = Math.max(0, total13thAndBonuses - EXEMPT_13TH_MONTH_CAP);

  // Non-taxable items
  const item29_MWEBasic = isMWE ? totalBasic : 0;
  const item30_MWEHoliday = isMWE ? Math.max(0, input.mweHolidayPay || 0) : 0;
  const item31_MWEOTrigger = isMWE ? Math.max(0, input.mweOvertimePay || 0) : 0;
  const item32_MWENightDiff = isMWE ? Math.max(0, input.mweNightDiff || 0) : 0;
  const item33_MWEHazard = isMWE ? Math.max(0, input.mweHazardPay || 0) : 0;
  const item34_Exempt13thMonth = exempt13th;
  const item35_DeMinimis = Math.max(0, input.annualDeMinimis || 0);
  const item36_StatutoryDeductions = Math.max(0, input.statutoryContributionsAnnual || 0);
  const item37_OtherNonTaxable = Math.max(0, input.otherNonTaxableCompensation || 0);

  const item38_TotalNonTaxable = +(
    item29_MWEBasic +
    item30_MWEHoliday +
    item31_MWEOTrigger +
    item32_MWENightDiff +
    item33_MWEHazard +
    item34_Exempt13thMonth +
    item35_DeMinimis +
    item36_StatutoryDeductions +
    item37_OtherNonTaxable
  ).toFixed(2);

  // Taxable items
  const item39_BasicSalary = isMWE ? 0 : totalBasic;
  const item40_Representation = 0;
  const item41_Transportation = 0;
  const item42_COLA = 0;
  const item43_Housing = 0;
  const item44_OtherAllowances = Math.max(0, input.taxableAllowancesAnnual || 0);
  const item45_Commission = Math.max(0, input.commissionsAndIncentivesAnnual || 0);
  const item46_ProfitSharing = Math.max(0, input.profitSharingAnnual || 0);
  const item47_Fees = 0;
  const item48_Taxable13thMonthExcess = isMWE ? 0 : taxable13thExcess;
  const item49_HazardPay = isMWE ? 0 : Math.max(0, input.mweHazardPay || 0);
  const item50_OvertimePay = isMWE ? 0 : Math.max(0, (input.taxableOvertimeAnnual || 0) + (input.mweOvertimePay || 0));
  const item51_OtherTaxable = +(
    (input.taxableNightDiffAnnual || 0) +
    (input.otherTaxableCompensation || 0)
  ).toFixed(2);

  const item52_TotalTaxablePresentEmployer = +(
    item39_BasicSalary +
    item40_Representation +
    item41_Transportation +
    item42_COLA +
    item43_Housing +
    item44_OtherAllowances +
    item45_Commission +
    item46_ProfitSharing +
    item47_Fees +
    item48_Taxable13thMonthExcess +
    item49_HazardPay +
    item50_OvertimePay +
    item51_OtherTaxable
  ).toFixed(2);

  // Summary (Part IV-A)
  const item19_GrossCompensationPresent = +(item38_TotalNonTaxable + item52_TotalTaxablePresentEmployer).toFixed(2);
  const item20_TotalNonTaxable = item38_TotalNonTaxable;
  const item21_TaxableCompensationPresent = item52_TotalTaxablePresentEmployer;
  const item22_TaxableCompensationPrevious = Math.max(0, input.previousEmployerTaxableCompensation || 0);
  const item23_TotalTaxableCompensation = +(item21_TaxableCompensationPresent + item22_TaxableCompensationPrevious).toFixed(2);

  // Tax Due (MWE is completely 0 exempt from income tax)
  let item24_TaxDue = 0;
  let appliedBracket = ANNUAL_TAX_BRACKETS[0];

  if (!isMWE && item23_TotalTaxableCompensation > 0) {
    const calc = calculateAnnualTax(item23_TotalTaxableCompensation);
    item24_TaxDue = calc.taxDue;
    appliedBracket = calc.bracket;
  }

  // Taxes Withheld
  const item25A_TaxWithheldPresent = Math.max(0, input.presentEmployerTaxWithheldYtd || 0);
  const item25B_TaxWithheldPrevious = Math.max(0, input.previousEmployerTaxWithheld || 0);
  const item26_TotalTaxWithheld = +(item25A_TaxWithheldPresent + item25B_TaxWithheldPrevious).toFixed(2);

  // Reconciliation: Refund vs Payable
  let item27_OverwithheldRefund = 0;
  let item28_TaxPayableAdjusted = 0;

  if (item26_TotalTaxWithheld > item24_TaxDue) {
    item27_OverwithheldRefund = +(item26_TotalTaxWithheld - item24_TaxDue).toFixed(2);
  } else if (item24_TaxDue > item26_TotalTaxWithheld) {
    item28_TaxPayableAdjusted = +(item24_TaxDue - item26_TotalTaxWithheld).toFixed(2);
  }

  // Effective Tax Rate
  const effectiveTaxRatePercent = item23_TotalTaxableCompensation > 0
    ? +((item24_TaxDue / item23_TotalTaxableCompensation) * 100).toFixed(2)
    : 0;

  return {
    input,
    taxYear,
    isMWE,
    item29_MWEBasic,
    item30_MWEHoliday,
    item31_MWEOTrigger,
    item32_MWENightDiff,
    item33_MWEHazard,
    item34_Exempt13thMonth,
    item35_DeMinimis,
    item36_StatutoryDeductions,
    item37_OtherNonTaxable,
    item38_TotalNonTaxable,
    item39_BasicSalary,
    item40_Representation,
    item41_Transportation,
    item42_COLA,
    item43_Housing,
    item44_OtherAllowances,
    item45_Commission,
    item46_ProfitSharing,
    item47_Fees,
    item48_Taxable13thMonthExcess,
    item49_HazardPay,
    item50_OvertimePay,
    item51_OtherTaxable,
    item52_TotalTaxablePresentEmployer,
    item19_GrossCompensationPresent,
    item20_TotalNonTaxable,
    item21_TaxableCompensationPresent,
    item22_TaxableCompensationPrevious,
    item23_TotalTaxableCompensation,
    item24_TaxDue,
    item25A_TaxWithheldPresent,
    item25B_TaxWithheldPrevious,
    item26_TotalTaxWithheld,
    item27_OverwithheldRefund,
    item28_TaxPayableAdjusted,
    appliedBracket,
    marginalRatePercent: +(appliedBracket.rate * 100).toFixed(1),
    effectiveTaxRatePercent,
    monthlyEquivalentTax: +(item24_TaxDue / months).toFixed(2),
    semiMonthlyEquivalentTax: +(item24_TaxDue / (months * 2)).toFixed(2),
    is13thMonthCapped: total13thAndBonuses > EXEMPT_13TH_MONTH_CAP,
    thirteenthMonthExcess: taxable13thExcess,
  };
}

/**
 * Generates official CSV export format compliant with BIR Alphalist 2316 specifications.
 */
export function generate2316Csv(result: Form2316Result): string {
  const rows: [string, string | number][] = [
    ['BIR Form No. 2316 Certificate of Compensation Payment / Tax Withheld', ''],
    ['Tax Year', result.taxYear],
    ['Period Covered (Months)', result.input.periodMonths],
    ['', ''],
    ['--- PART I: EMPLOYEE INFORMATION ---', ''],
    ['Employee Name', result.input.employeeName],
    ['Taxpayer Identification No. (TIN)', result.input.tin],
    ['Registered Address', result.input.registeredAddress],
    ['Minimum Wage Earner (MWE)', result.isMWE ? 'Yes' : 'No'],
    ['', ''],
    ['--- PART II: EMPLOYER INFORMATION ---', ''],
    ['Employer Name', result.input.employerName || 'Kawayan Cooperative HR'],
    ['Employer TIN', result.input.employerTin || '009-876-543-000'],
    ['Employer Registered Address', result.input.employerAddress || 'Unit 402 Kawayan Center, Ayala Ave, Makati City, Metro Manila'],
    ['', ''],
    ['--- PART IV-A: SUMMARY ---', ''],
    ['19. Gross Compensation Income from Present Employer', result.item19_GrossCompensationPresent],
    ['20. Less Total Non-Taxable / Exempt Compensation Income', result.item20_TotalNonTaxable],
    ['21. Taxable Compensation Income from Present Employer', result.item21_TaxableCompensationPresent],
    ['22. Add Taxable Compensation Income from Previous Employer', result.item22_TaxableCompensationPrevious],
    ['23. Total Taxable Compensation Income', result.item23_TotalTaxableCompensation],
    ['24. Tax Due', result.item24_TaxDue],
    ['25A. Taxes Withheld - Present Employer', result.item25A_TaxWithheldPresent],
    ['25B. Taxes Withheld - Previous Employer', result.item25B_TaxWithheldPrevious],
    ['26. Total Amount of Taxes Withheld', result.item26_TotalTaxWithheld],
    ['27. Overwithheld Tax Refunded to Employee', result.item27_OverwithheldRefund],
    ['28. Tax Payable / Adjusted Withholding in Final Pay', result.item28_TaxPayableAdjusted],
    ['', ''],
    ['--- PART IV-B: DETAILS OF COMPENSATION (NON-TAXABLE) ---', ''],
    ['29. Basic Salary (MWE)', result.item29_MWEBasic],
    ['30. Holiday Pay (MWE)', result.item30_MWEHoliday],
    ['31. Overtime Pay (MWE)', result.item31_MWEOTrigger],
    ['32. Night Shift Differential (MWE)', result.item32_MWENightDiff],
    ['33. Hazard Pay (MWE)', result.item33_MWEHazard],
    ['34. 13th Month Pay & Other Benefits (Exempt up to ₱90k)', result.item34_Exempt13thMonth],
    ['35. De Minimis Benefits', result.item35_DeMinimis],
    ['36. SSS, GSIS, PHIC, HDMF EE Share & Union Dues', result.item36_StatutoryDeductions],
    ['37. Other Non-Taxable Compensation', result.item37_OtherNonTaxable],
    ['38. Total Non-Taxable Compensation Income', result.item38_TotalNonTaxable],
    ['', ''],
    ['--- PART IV-B: DETAILS OF COMPENSATION (TAXABLE) ---', ''],
    ['39. Basic Salary (Regular Non-MWE)', result.item39_BasicSalary],
    ['44. Taxable Allowances', result.item44_OtherAllowances],
    ['45. Commission', result.item45_Commission],
    ['46. Profit Sharing', result.item46_ProfitSharing],
    ['48. Taxable 13th Month & Benefits (Excess over ₱90k)', result.item48_Taxable13thMonthExcess],
    ['49. Hazard Pay (Non-MWE)', result.item49_HazardPay],
    ['50. Overtime Pay (Non-MWE)', result.item50_OvertimePay],
    ['51. Other Taxable Compensation', result.item51_OtherTaxable],
    ['52. Total Taxable Compensation Income', result.item52_TotalTaxablePresentEmployer],
    ['', ''],
    ['--- TAX ANALYSIS ---', ''],
    ['Applicable Tax Bracket Tier', result.appliedBracket.tier],
    ['Marginal Tax Rate', `${result.marginalRatePercent}%`],
    ['Effective Tax Rate', `${result.effectiveTaxRatePercent}%`],
    ['Monthly Withholding Equivalent', result.monthlyEquivalentTax],
    ['Semi-Monthly Withholding Equivalent', result.semiMonthlyEquivalentTax],
  ];

  return rows
    .map(([key, val]) => {
      const sanitizedKey = `"${String(key).replace(/"/g, '""')}"`;
      const sanitizedVal = typeof val === 'number' ? val.toFixed(2) : `"${String(val).replace(/"/g, '""')}"`;
      return `${sanitizedKey},${sanitizedVal}`;
    })
    .join('\n');
}
