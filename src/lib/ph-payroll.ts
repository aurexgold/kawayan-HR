/**
 * Philippine Statutory Contributions and Payroll Calculation Utility (2024 / 2025)
 * Compliant with:
 * - RA 11199 (Social Security Act of 2018) + SSS Circular 2023-010 / 2024 rules (14% rate, WISP, EC)
 * - RA 11223 (Universal Health Care Act) - PhilHealth 5.0% Premium Rate (₱10k floor - ₱100k ceiling)
 * - Pag-IBIG Circular No. 460 - HDMF Mandatory Contribution (₱10k MFS cap, ₱200 EE / ₱200 ER)
 * - RA 10963 (TRAIN Law) Revised Withholding Tax Tables (effective Jan 1, 2023 onwards)
 */

export interface SSSBracket {
  minCompensation: number;
  maxCompensation: number;
  msc: number;
  regularEE: number;
  regularER: number;
  wispEE: number;
  wispER: number;
  ec: number;
  totalEE: number;
  totalER: number;
  grandTotal: number;
}

export interface ContributionBreakdown {
  basicSalary: number;
  allowancesTaxable: number;
  allowancesNonTaxable: number;
  overtimePay: number;
  absencesTardiness: number;
  grossPay: number;

  // SSS Details
  sssMsc: number;
  sssRegularEE: number;
  sssRegularER: number;
  sssWispEE: number;
  sssWispER: number;
  sssEcER: number;
  sss: number; // Total SSS Employee Share
  sssER: number; // Total SSS Employer Share
  sssTotal: number; // Combined

  // PhilHealth Details
  philhealthMsc: number;
  philhealth: number; // Employee Share
  philhealthER: number; // Employer Share
  philhealthTotal: number;

  // Pag-IBIG Details
  pagibigMfs: number;
  pagibig: number; // Employee Share
  pagibigER: number; // Employer Share
  pagibigTotal: number;
  pagibigMp2: number; // Optional MP2 voluntary

  // Aggregates
  mandatoryDeductionsEE: number; // SSS + PH + HDMF
  mandatoryContributionsER: number; // SSS ER + PH ER + HDMF ER

  // Tax Details
  taxableIncome: number;
  withholdingTax: number;
  taxBracketDescription: string;

  // Final Net & Cost
  totalDeductions: number; // Mandatory + Tax + MP2 + Loans + Other
  otherDeductions: number;
  netPay: number;
  costToEmployer: number; // Gross + Employer Contributions

  // Employee Salary Loans (Post-Tax Payroll Deductions)
  sssLoanDeduction: number;
  pagibigLoanDeduction: number;
  companyLoanDeduction: number;
  totalLoanDeductions: number;
  loanDetails?: Array<{
    loanId: string;
    loanType: string;
    loanName: string;
    referenceNo: string;
    agency: 'SSS' | 'Pag-IBIG' | 'Company';
    monthlyAmount: number;
  }>;

  // Semi-Monthly estimates
  semiMonthlyGross: number;
  semiMonthlyNet: number;
  semiMonthlyTax: number;
  semiMonthlyMandatoryDeductions: number;
  semiMonthlyLoanDeductions: number;

  // 13th Month Pay & Tax check
  thirteenthMonthPay: number;
  isThirteenthMonthExempt: boolean;
  thirteenthMonthTaxableExcess: number;
}


/**
 * Builds the standard SSS 2024 / 2025 contribution table brackets.
 * Minimum MSC: ₱4,000 (salary < 4,250)
 * Step size: ₱500 MSC increment up to ₱30,000 MSC (salary >= 29,750)
 * Regular MSC cap: ₱20,000 (Regular EE max ₱900, Regular ER max ₱1,900)
 * WISP MSC: ₱20,500 to ₱30,000 (WISP EE max ₱450, WISP ER max ₱950)
 * EC: ₱10 for MSC < 15,000; ₱30 for MSC >= 15,000
 */
export function getSSSTable(): SSSBracket[] {
  const brackets: SSSBracket[] = [];
  const minMsc = 4000;
  const maxMsc = 30000;

  for (let msc = minMsc; msc <= maxMsc; msc += 500) {
    let minCompensation = msc - 250;
    let maxCompensation = msc + 249.99;

    if (msc === minMsc) {
      minCompensation = 0;
      maxCompensation = 4249.99;
    } else if (msc === maxMsc) {
      minCompensation = 29750;
      maxCompensation = Infinity;
    }

    const regMsc = Math.min(msc, 20000);
    const regularEE = +(regMsc * 0.045).toFixed(2);
    const regularER = +(regMsc * 0.095).toFixed(2);

    let wispMsc = 0;
    if (msc > 20000) {
      wispMsc = msc - 20000;
    }
    const wispEE = +(wispMsc * 0.045).toFixed(2);
    const wispER = +(wispMsc * 0.095).toFixed(2);

    const ec = msc >= 15000 ? 30 : 10;
    const totalEE = +(regularEE + wispEE).toFixed(2);
    const totalER = +(regularER + wispER + ec).toFixed(2);
    const grandTotal = +(totalEE + totalER).toFixed(2);

    brackets.push({
      minCompensation,
      maxCompensation,
      msc,
      regularEE,
      regularER,
      wispEE,
      wispER,
      ec,
      totalEE,
      totalER,
      grandTotal,
    });
  }

  return brackets;
}

const cachedSSSTable = getSSSTable();

/**
 * Calculates exact SSS contribution based on basic salary.
 */
export function calculateSSS(salary: number) {
  const table = cachedSSSTable;
  let matchingBracket = table.find(
    (b) => salary >= b.minCompensation && salary <= b.maxCompensation
  );

  if (!matchingBracket) {
    if (salary < table[0].minCompensation) {
      matchingBracket = table[0];
    } else {
      matchingBracket = table[table.length - 1];
    }
  }

  return {
    msc: matchingBracket.msc,
    regularEE: matchingBracket.regularEE,
    regularER: matchingBracket.regularER,
    wispEE: matchingBracket.wispEE,
    wispER: matchingBracket.wispER,
    ec: matchingBracket.ec,
    totalEE: matchingBracket.totalEE,
    totalER: matchingBracket.totalER,
    grandTotal: matchingBracket.grandTotal,
    matchingBracket,
  };
}

/**
 * Calculates PhilHealth contribution.
 * 2024 / 2025: 5% premium rate, ₱10,000 floor (₱500 premium), ₱100,000 ceiling (₱5,000 premium)
 * Split 50/50 between Employee and Employer.
 */
export function calculatePhilHealth(salary: number) {
  const floor = 10000;
  const ceiling = 100000;
  const rate = 0.05;

  let effectiveSalary = salary;
  if (salary <= floor) {
    effectiveSalary = floor;
  } else if (salary >= ceiling) {
    effectiveSalary = ceiling;
  }

  const totalPremium = +(effectiveSalary * rate).toFixed(2);
  const eeShare = +(totalPremium / 2).toFixed(2);
  const erShare = +(totalPremium - eeShare).toFixed(2);

  return {
    msc: effectiveSalary,
    totalPremium,
    eeShare,
    erShare,
    ratePercent: 5.0,
    floor,
    ceiling,
  };
}

/**
 * Calculates Pag-IBIG (HDMF) contribution.
 * Effective Feb 2024 (Circular 460):
 * Max Fund Salary (MFS) is ₱10,000.
 * Salary <= ₱1,500: EE 1%, ER 2%
 * Salary > ₱1,500: EE 2%, ER 2%
 * Capped at ₱200 EE and ₱200 ER (Total: ₱400).
 */
export function calculatePagIBIG(salary: number, optionalMp2: number = 0) {
  const mfsCap = 10000;
  const effectiveSalary = Math.min(salary, mfsCap);

  let eeRate = 0.02;
  let erRate = 0.02;

  if (salary <= 1500) {
    eeRate = 0.01;
    erRate = 0.02;
  }

  const eeShare = +(effectiveSalary * eeRate).toFixed(2);
  const erShare = +(effectiveSalary * erRate).toFixed(2);
  const totalMandatory = +(eeShare + erShare).toFixed(2);
  const mp2 = Math.max(0, optionalMp2 || 0);

  return {
    mfs: effectiveSalary,
    eeShare,
    erShare,
    totalMandatory,
    mp2,
    totalEE: +(eeShare + mp2).toFixed(2),
  };
}

/**
 * Calculates BIR Withholding Tax on compensation under revised TRAIN Law brackets (2023–present).
 */
export function calculateWithholdingTax(taxableIncome: number): {
  tax: number;
  bracketDescription: string;
  marginalRate: number;
  baseTax: number;
  excessOver: number;
} {
  if (taxableIncome <= 20833.33) {
    return {
      tax: 0,
      bracketDescription: '₱20,833.33 and below (0% - Minimum Wage / Tax Exempt)',
      marginalRate: 0,
      baseTax: 0,
      excessOver: 0,
    };
  } else if (taxableIncome <= 33333.33) {
    const excess = taxableIncome - 20833.33;
    const tax = +(excess * 0.15).toFixed(2);
    return {
      tax,
      bracketDescription: '₱20,833.34 to ₱33,333.33 (15% in excess of ₱20,833.33)',
      marginalRate: 0.15,
      baseTax: 0,
      excessOver: 20833.33,
    };
  } else if (taxableIncome <= 66666.67) {
    const excess = taxableIncome - 33333.33;
    const tax = +(1875.0 + excess * 0.20).toFixed(2);
    return {
      tax,
      bracketDescription: '₱33,333.34 to ₱66,666.67 (₱1,875.00 + 20% over ₱33,333.33)',
      marginalRate: 0.20,
      baseTax: 1875.0,
      excessOver: 33333.33,
    };
  } else if (taxableIncome <= 166666.67) {
    const excess = taxableIncome - 66666.67;
    const tax = +(8541.67 + excess * 0.25).toFixed(2);
    return {
      tax,
      bracketDescription: '₱66,666.68 to ₱166,666.67 (₱8,541.67 + 25% over ₱66,666.67)',
      marginalRate: 0.25,
      baseTax: 8541.67,
      excessOver: 66666.67,
    };
  } else if (taxableIncome <= 666666.67) {
    const excess = taxableIncome - 166666.67;
    const tax = +(33541.67 + excess * 0.30).toFixed(2);
    return {
      tax,
      bracketDescription: '₱166,666.68 to ₱666,666.67 (₱33,541.67 + 30% over ₱166,666.67)',
      marginalRate: 0.30,
      baseTax: 33541.67,
      excessOver: 166666.67,
    };
  } else {
    const excess = taxableIncome - 666666.67;
    const tax = +(183541.67 + excess * 0.35).toFixed(2);
    return {
      tax,
      bracketDescription: 'Over ₱666,666.67 (₱183,541.67 + 35% over ₱666,666.67)',
      marginalRate: 0.35,
      baseTax: 183541.67,
      excessOver: 666666.67,
    };
  }
}

import { calculateEmployeeMonthlyLoanDeductions } from './loans';

export interface ContributionOptions {
  allowancesTaxable?: number;
  allowancesNonTaxable?: number;
  overtimePay?: number;
  absencesTardiness?: number;
  pagibigMp2?: number;
  otherDeductions?: number;
  employeeId?: string;
  includeLoans?: boolean;
  sssLoanDeduction?: number;
  pagibigLoanDeduction?: number;
  companyLoanDeduction?: number;
  totalLoanDeductions?: number;
}


/**
 * Computes full payroll and statutory contributions for an employee.
 * Backward compatible signature: calculateContributions(monthlyBasicSalary, options)
 */
export function calculateContributions(
  monthlyBasicSalary: number,
  options: ContributionOptions = {}
): ContributionBreakdown {
  const safeBasic = Math.max(0, monthlyBasicSalary || 0);
  const allowancesTaxable = Math.max(0, options.allowancesTaxable || 0);
  const allowancesNonTaxable = Math.max(0, options.allowancesNonTaxable || 0);
  const overtimePay = Math.max(0, options.overtimePay || 0);
  const absencesTardiness = Math.max(0, options.absencesTardiness || 0);
  const pagibigMp2 = Math.max(0, options.pagibigMp2 || 0);
  const otherDeductions = Math.max(0, options.otherDeductions || 0);

  // 1. SSS Calculation
  const sssRes = calculateSSS(safeBasic);
  const sss = sssRes.totalEE;
  const sssER = sssRes.totalER;
  const sssTotal = sssRes.grandTotal;

  // 2. PhilHealth Calculation
  const phRes = calculatePhilHealth(safeBasic);
  const philhealth = phRes.eeShare;
  const philhealthER = phRes.erShare;
  const philhealthTotal = phRes.totalPremium;

  // 3. Pag-IBIG Calculation
  const hdmfRes = calculatePagIBIG(safeBasic, pagibigMp2);
  const pagibig = hdmfRes.eeShare;
  const pagibigER = hdmfRes.erShare;
  const pagibigTotal = hdmfRes.totalMandatory;

  // Aggregates
  const mandatoryDeductionsEE = +(sss + philhealth + pagibig).toFixed(2);
  const mandatoryContributionsER = +(sssER + philhealthER + pagibigER).toFixed(2);

  // Gross Earnings
  const grossPay = +(safeBasic + allowancesTaxable + allowancesNonTaxable + overtimePay - absencesTardiness).toFixed(2);

  // Taxable Income Calculation:
  // (Basic Salary + Taxable Allowances + Overtime - Absences) - Mandatory Government Deductions (EE)
  const taxableBase = Math.max(
    0,
    safeBasic + allowancesTaxable + overtimePay - absencesTardiness - mandatoryDeductionsEE
  );
  const taxableIncome = +taxableBase.toFixed(2);

  // 4. BIR Withholding Tax Calculation
  const taxRes = calculateWithholdingTax(taxableIncome);
  const withholdingTax = taxRes.tax;

  // 5. Employee Salary Loans (Post-Tax Payroll Deductions)
  let sssLoanDeduction = Math.max(0, options.sssLoanDeduction || 0);
  let pagibigLoanDeduction = Math.max(0, options.pagibigLoanDeduction || 0);
  let companyLoanDeduction = Math.max(0, options.companyLoanDeduction || 0);
  let totalLoanDeductions = Math.max(0, options.totalLoanDeductions || 0);
  let loanDetails: ContributionBreakdown['loanDetails'] = undefined;

  // If employeeId is passed and loans not explicitly disabled, pull employee's actual active loans
  if (options.employeeId && options.includeLoans !== false) {
    const autoLoans = calculateEmployeeMonthlyLoanDeductions(options.employeeId);
    if (options.sssLoanDeduction === undefined) sssLoanDeduction = autoLoans.sss;
    if (options.pagibigLoanDeduction === undefined) pagibigLoanDeduction = autoLoans.pagibig;
    if (options.companyLoanDeduction === undefined) companyLoanDeduction = autoLoans.company;
    if (options.totalLoanDeductions === undefined) totalLoanDeductions = autoLoans.total;
    loanDetails = autoLoans.items.map(item => ({
      loanId: item.loanId,
      loanType: item.loanType,
      loanName: item.loanName,
      referenceNo: item.referenceNo,
      agency: item.agency,
      monthlyAmount: item.monthlyAmount,
    }));
  } else if (totalLoanDeductions === 0 && (sssLoanDeduction > 0 || pagibigLoanDeduction > 0 || companyLoanDeduction > 0)) {
    totalLoanDeductions = +(sssLoanDeduction + pagibigLoanDeduction + companyLoanDeduction).toFixed(2);
  }

  // Total Employee Deductions & Net Pay
  // Mandatory + Tax + MP2 + Salary Loans + Other Authorized Deductions
  const totalDeductions = +(mandatoryDeductionsEE + withholdingTax + pagibigMp2 + totalLoanDeductions + otherDeductions).toFixed(2);
  const netPay = +(grossPay - totalDeductions).toFixed(2);

  // Cost to Employer (CTC - Cost to Company)
  const costToEmployer = +(grossPay + mandatoryContributionsER).toFixed(2);

  // Semi-Monthly Calculations
  const semiMonthlyGross = +(grossPay / 2).toFixed(2);
  const semiMonthlyNet = +(netPay / 2).toFixed(2);
  const semiMonthlyTax = +(withholdingTax / 2).toFixed(2);
  const semiMonthlyMandatoryDeductions = +(mandatoryDeductionsEE / 2).toFixed(2);
  const semiMonthlyLoanDeductions = +(totalLoanDeductions / 2).toFixed(2);

  // 13th Month Pay (Standard 1 full month basic salary) & Tax Exemption check (₱90,000 de minimis cap)
  const thirteenthMonthPay = safeBasic;
  const isThirteenthMonthExempt = thirteenthMonthPay <= 90000;
  const thirteenthMonthTaxableExcess = isThirteenthMonthExempt ? 0 : +(thirteenthMonthPay - 90000).toFixed(2);

  return {
    basicSalary: safeBasic,
    allowancesTaxable,
    allowancesNonTaxable,
    overtimePay,
    absencesTardiness,
    grossPay,

    sssMsc: sssRes.msc,
    sssRegularEE: sssRes.regularEE,
    sssRegularER: sssRes.regularER,
    sssWispEE: sssRes.wispEE,
    sssWispER: sssRes.wispER,
    sssEcER: sssRes.ec,
    sss,
    sssER,
    sssTotal,

    philhealthMsc: phRes.msc,
    philhealth,
    philhealthER,
    philhealthTotal,

    pagibigMfs: hdmfRes.mfs,
    pagibig,
    pagibigER,
    pagibigTotal,
    pagibigMp2,

    mandatoryDeductionsEE,
    mandatoryContributionsER,

    taxableIncome,
    withholdingTax,
    taxBracketDescription: taxRes.bracketDescription,

    totalDeductions,
    otherDeductions,
    netPay,
    costToEmployer,

    sssLoanDeduction,
    pagibigLoanDeduction,
    companyLoanDeduction,
    totalLoanDeductions,
    loanDetails,

    semiMonthlyGross,
    semiMonthlyNet,
    semiMonthlyTax,
    semiMonthlyMandatoryDeductions,
    semiMonthlyLoanDeductions,

    thirteenthMonthPay,
    isThirteenthMonthExempt,
    thirteenthMonthTaxableExcess,
  };
}


/**
 * Standard preset salary brackets for quick HR simulations.
 */
export const SALARY_PRESETS = [
  { label: 'Minimum Wage (NCR)', amount: 15860, description: '₱610/day × 26 days' },
  { label: 'Junior / Associate', amount: 28000, description: 'Fresh grad / 1-2 yrs exp' },
  { label: 'Mid-Level Specialist', amount: 55000, description: '3-5 yrs experience' },
  { label: 'Senior / Lead', amount: 95000, description: '5-8 yrs experience' },
  { label: 'Management / Exec', amount: 160000, description: 'Dept Head / Director' },
];
