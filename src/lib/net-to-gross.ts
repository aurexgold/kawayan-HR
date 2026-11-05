/**
 * Philippine Net-to-Gross (Reverse Gross-Up) Payroll Engine
 * 
 * Computes the exact Gross Basic Salary and Employer Cost required to yield
 * a targeted Net Take-Home Pay for an employee in the Philippines.
 * 
 * Incorporates:
 * - RA 11199 (Social Security Act) & SSS MSC tables (Regular 4.5% EE / 9.5% ER, WISP, EC)
 * - RA 11223 (Universal Health Care Act) - PhilHealth 5.0% Premium Rate (₱10k floor - ₱100k ceiling)
 * - Pag-IBIG Circular No. 460 - Mandatory ₱200 EE / ₱200 ER cap
 * - RA 10963 (TRAIN Law) Revised BIR Withholding Tax Brackets (effective 2023-present)
 * - PD 851 (13th Month Pay) employer accrual provisions
 */

import { calculateSSS, calculatePhilHealth, calculatePagIBIG, calculateWithholdingTax } from './ph-payroll';

export interface NetToGrossInput {
  targetNetPay: number; // in PHP
  taxableAllowances?: number;
  nonTaxableAllowances?: number;
  postTaxDeductions?: number; // e.g. company loans, voluntary contributions
  includeThirteenthMonthInCtc?: boolean;
}

export interface NetToGrossResult {
  targetNetPay: number;
  requiredGrossSalary: number;
  totalGrossPay: number; // Gross Salary + Taxable Allowances
  actualNetPay: number; // Verified forward calculation
  varianceDelta: number; // actualNetPay - targetNetPay (must be 0.00)

  // Allowances & Other
  taxableAllowances: number;
  nonTaxableAllowances: number;
  postTaxDeductions: number;

  // Statutory EE Deductions
  sssEE: number;
  sssRegularEE: number;
  sssWispEE: number;
  sssMsc: number;
  philhealthEE: number;
  philhealthMsc: number;
  pagibigEE: number;
  totalMandatoryEE: number;

  // Tax Details
  taxableIncome: number;
  withholdingTax: number;
  taxBracketDescription: string;
  marginalTaxRate: number;

  // Gross-Up Breakdown
  totalGrossUpAdditions: number; // Tax + Mandatory Deductions
  taxGrossUpPortion: number;
  statutoryGrossUpPortion: number;

  // Statutory ER Contributions
  sssER: number;
  sssRegularER: number;
  sssWispER: number;
  sssEcER: number;
  philhealthER: number;
  pagibigER: number;
  totalMandatoryER: number;

  // Employer Cost & Budgeting
  monthlyThirteenthMonthAccrual: number;
  totalMonthlyEmployerCost: number; // Gross + Allowances + Mandatory ER + 13th month
  totalAnnualEmployerCost: number;

  // Semi-Monthly Payroll Cut-Offs (15th and 30th)
  semiMonthlyGrossSalary: number;
  semiMonthlyTax: number;
  semiMonthlyMandatoryEE: number;
  semiMonthlyNetPay: number;

  // Annualized Figures
  annualGrossSalary: number;
  annualTax: number;
  annualMandatoryEE: number;
  annualNetTakeHome: number;
  annualThirteenthMonthPay: number;
}

/**
 * Forward calculator to compute actual Net Take-Home Pay given a Gross Basic Salary
 */
export function calculateNetFromGross(
  grossSalary: number,
  taxableAllowances: number = 0,
  nonTaxableAllowances: number = 0,
  postTaxDeductions: number = 0
): {
  netPay: number;
  sssEE: number;
  philhealthEE: number;
  pagibigEE: number;
  totalMandatoryEE: number;
  taxableIncome: number;
  tax: number;
  taxBracketDescription: string;
  marginalRate: number;
  sssER: number;
  philhealthER: number;
  pagibigER: number;
  totalMandatoryER: number;
  sssMsc: number;
  sssRegularEE: number;
  sssWispEE: number;
  sssRegularER: number;
  sssWispER: number;
  sssEcER: number;
  philhealthMsc: number;
} {
  const sss = calculateSSS(grossSalary);
  const ph = calculatePhilHealth(grossSalary);
  const hdmf = calculatePagIBIG(grossSalary);

  const totalMandatoryEE = sss.totalEE + ph.eeShare + hdmf.eeShare;
  const totalMandatoryER = sss.totalER + ph.erShare + hdmf.erShare;

  // Taxable Income = Gross + Taxable Allowances - Statutory Contributions
  const grossWithTaxableAllowances = grossSalary + taxableAllowances;
  const taxableIncome = Math.max(0, grossWithTaxableAllowances - totalMandatoryEE);

  const taxResult = calculateWithholdingTax(taxableIncome);
  const tax = taxResult.tax;

  // Net Pay = Gross + All Allowances - Mandatory Contributions - Tax - Post-Tax Deductions
  const totalInflows = grossSalary + taxableAllowances + nonTaxableAllowances;
  const totalOutflows = totalMandatoryEE + tax + postTaxDeductions;
  const netPay = +(totalInflows - totalOutflows).toFixed(2);

  return {
    netPay,
    sssEE: sss.totalEE,
    philhealthEE: ph.eeShare,
    pagibigEE: hdmf.eeShare,
    totalMandatoryEE,
    taxableIncome,
    tax,
    taxBracketDescription: taxResult.bracketDescription,
    marginalRate: taxResult.marginalRate,
    sssER: sss.totalER,
    philhealthER: ph.erShare,
    pagibigER: hdmf.erShare,
    totalMandatoryER,
    sssMsc: sss.msc,
    sssRegularEE: sss.regularEE,
    sssWispEE: sss.wispEE,
    sssRegularER: sss.regularER,
    sssWispER: sss.wispER,
    sssEcER: sss.ec,
    philhealthMsc: ph.msc,
  };
}

/**
 * Reverse Net-to-Gross Engine
 * Uses binary search + centavo resolution to find the exact Gross Basic Salary
 * that produces the target Net Pay to ₱0.00 variance.
 */
export function calculateNetToGross(input: NetToGrossInput): NetToGrossResult {
  const targetNet = Math.max(0, input.targetNetPay);
  const taxAllow = Math.max(0, input.taxableAllowances || 0);
  const nonTaxAllow = Math.max(0, input.nonTaxableAllowances || 0);
  const postTaxDed = Math.max(0, input.postTaxDeductions || 0);
  const include13th = input.includeThirteenthMonthInCtc ?? true;

  if (targetNet === 0) {
    return createZeroResult(input);
  }

  // Lower bound: Gross cannot be less than targetNet - nonTaxAllowances
  let low = Math.max(0, targetNet - nonTaxAllow - taxAllow);
  // Upper bound: Even at highest 35% marginal tax rate + statutory, gross is < targetNet * 2.5 + 50000
  let high = Math.max(100000, targetNet * 2.5 + 100000);

  // Binary search for continuous convergence (tolerance 0.005)
  for (let iter = 0; iter < 45; iter++) {
    const mid = (low + high) / 2;
    const forward = calculateNetFromGross(mid, taxAllow, nonTaxAllow, postTaxDed);

    if (Math.abs(forward.netPay - targetNet) < 0.005) {
      low = mid;
      high = mid;
      break;
    }

    if (forward.netPay < targetNet) {
      low = mid;
    } else {
      high = mid;
    }
  }

  // Exact centavo boundary scan around the converged value
  let candidateGross = Math.round(((low + high) / 2) * 100) / 100;
  let bestGross = candidateGross;
  let bestForward = calculateNetFromGross(candidateGross, taxAllow, nonTaxAllow, postTaxDed);
  let minDiff = Math.abs(bestForward.netPay - targetNet);

  // Check 20 centavos below and above to lock exact match
  for (let delta = -20; delta <= 20; delta++) {
    const testGross = Math.round((candidateGross + delta * 0.01) * 100) / 100;
    if (testGross < 0) continue;
    const fwd = calculateNetFromGross(testGross, taxAllow, nonTaxAllow, postTaxDed);
    const diff = Math.abs(fwd.netPay - targetNet);
    if (diff < minDiff) {
      minDiff = diff;
      bestGross = testGross;
      bestForward = fwd;
      if (diff === 0) break;
    }
  }

  const requiredGrossSalary = bestGross;
  const forward = bestForward;
  const actualNetPay = forward.netPay;
  const varianceDelta = +(actualNetPay - targetNet).toFixed(2);

  const totalGrossPay = +(requiredGrossSalary + taxAllow).toFixed(2);
  const totalGrossUpAdditions = +(requiredGrossSalary - targetNet).toFixed(2);
  const taxGrossUpPortion = forward.tax;
  const statutoryGrossUpPortion = forward.totalMandatoryEE;

  // 13th month accrual (standard basic salary / 12)
  const monthlyThirteenthMonthAccrual = +(requiredGrossSalary / 12).toFixed(2);
  const totalMonthlyEmployerCost = +(
    requiredGrossSalary +
    taxAllow +
    nonTaxAllow +
    forward.totalMandatoryER +
    (include13th ? monthlyThirteenthMonthAccrual : 0)
  ).toFixed(2);

  const totalAnnualEmployerCost = +(totalMonthlyEmployerCost * 12).toFixed(2);

  // Semi-Monthly Cut-offs
  const semiMonthlyGrossSalary = +(requiredGrossSalary / 2).toFixed(2);
  const semiMonthlyTax = +(forward.tax / 2).toFixed(2);
  const semiMonthlyMandatoryEE = +(forward.totalMandatoryEE / 2).toFixed(2);
  const semiMonthlyNetPay = +(actualNetPay / 2).toFixed(2);

  // Annualized Figures
  const annualGrossSalary = +(requiredGrossSalary * 12).toFixed(2);
  const annualTax = +(forward.tax * 12).toFixed(2);
  const annualMandatoryEE = +(forward.totalMandatoryEE * 12).toFixed(2);
  const annualNetTakeHome = +(actualNetPay * 12).toFixed(2);
  const annualThirteenthMonthPay = +(requiredGrossSalary).toFixed(2);

  return {
    targetNetPay: targetNet,
    requiredGrossSalary,
    totalGrossPay,
    actualNetPay,
    varianceDelta,

    taxableAllowances: taxAllow,
    nonTaxableAllowances: nonTaxAllow,
    postTaxDeductions: postTaxDed,

    sssEE: forward.sssEE,
    sssRegularEE: forward.sssRegularEE,
    sssWispEE: forward.sssWispEE,
    sssMsc: forward.sssMsc,
    philhealthEE: forward.philhealthEE,
    philhealthMsc: forward.philhealthMsc,
    pagibigEE: forward.pagibigEE,
    totalMandatoryEE: forward.totalMandatoryEE,

    taxableIncome: forward.taxableIncome,
    withholdingTax: forward.tax,
    taxBracketDescription: forward.taxBracketDescription,
    marginalTaxRate: forward.marginalRate,

    totalGrossUpAdditions,
    taxGrossUpPortion,
    statutoryGrossUpPortion,

    sssER: forward.sssER,
    sssRegularER: forward.sssRegularER,
    sssWispER: forward.sssWispER,
    sssEcER: forward.sssEcER,
    philhealthER: forward.philhealthER,
    pagibigER: forward.pagibigER,
    totalMandatoryER: forward.totalMandatoryER,

    monthlyThirteenthMonthAccrual,
    totalMonthlyEmployerCost,
    totalAnnualEmployerCost,

    semiMonthlyGrossSalary,
    semiMonthlyTax,
    semiMonthlyMandatoryEE,
    semiMonthlyNetPay,

    annualGrossSalary,
    annualTax,
    annualMandatoryEE,
    annualNetTakeHome,
    annualThirteenthMonthPay,
  };
}

function createZeroResult(input: NetToGrossInput): NetToGrossResult {
  return {
    targetNetPay: 0,
    requiredGrossSalary: 0,
    totalGrossPay: 0,
    actualNetPay: 0,
    varianceDelta: 0,
    taxableAllowances: input.taxableAllowances || 0,
    nonTaxableAllowances: input.nonTaxableAllowances || 0,
    postTaxDeductions: input.postTaxDeductions || 0,
    sssEE: 0,
    sssRegularEE: 0,
    sssWispEE: 0,
    sssMsc: 0,
    philhealthEE: 0,
    philhealthMsc: 0,
    pagibigEE: 0,
    totalMandatoryEE: 0,
    taxableIncome: 0,
    withholdingTax: 0,
    taxBracketDescription: 'No taxable compensation',
    marginalTaxRate: 0,
    totalGrossUpAdditions: 0,
    taxGrossUpPortion: 0,
    statutoryGrossUpPortion: 0,
    sssER: 0,
    sssRegularER: 0,
    sssWispER: 0,
    sssEcER: 0,
    philhealthER: 0,
    pagibigER: 0,
    totalMandatoryER: 0,
    monthlyThirteenthMonthAccrual: 0,
    totalMonthlyEmployerCost: 0,
    totalAnnualEmployerCost: 0,
    semiMonthlyGrossSalary: 0,
    semiMonthlyTax: 0,
    semiMonthlyMandatoryEE: 0,
    semiMonthlyNetPay: 0,
    annualGrossSalary: 0,
    annualTax: 0,
    annualMandatoryEE: 0,
    annualNetTakeHome: 0,
    annualThirteenthMonthPay: 0,
  };
}

/**
 * Standard Net Pay Benchmark Presets for Philippine Corporate Roles
 */
export interface NetPayPreset {
  label: string;
  targetNet: number;
  typicalRole: string;
  tier: string;
}

export const PHILIPPINE_NET_PRESETS: NetPayPreset[] = [
  { label: '₱25,000 Net', targetNet: 25000, typicalRole: 'Junior Associate / Tech Support', tier: 'Entry Level' },
  { label: '₱40,000 Net', targetNet: 40000, typicalRole: 'Mid-Level Specialist / Engineer', tier: 'Professional' },
  { label: '₱60,000 Net', targetNet: 60000, typicalRole: 'Senior Software Engineer / Team Lead', tier: 'Senior' },
  { label: '₱85,000 Net', targetNet: 85000, typicalRole: 'Engineering Manager / Lead Architect', tier: 'Management' },
  { label: '₱120,000 Net', targetNet: 120000, typicalRole: 'Department Director / Head of Operations', tier: 'Director' },
  { label: '₱180,000 Net', targetNet: 180000, typicalRole: 'VP / Executive / C-Suite Expat', tier: 'Executive' },
];

/**
 * Generates an official Compensation Proposal & Net-to-Gross Breakdown CSV
 */
export function generateNetToGrossProposalCsv(result: NetToGrossResult, candidateName?: string): string {
  const lines: string[] = [];
  lines.push(`"Philippine Net-to-Gross Reverse Compensation Proposal"`);
  lines.push(`"Candidate / Personnel","${candidateName || 'Candidate / Offer Recipient'}"`);
  lines.push(`"Generated Date","${new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}"`);
  lines.push(`"Statutory Framework","RA 11199 (SSS) · RA 11223 (PhilHealth 5%) · HDMF Circular 460 · TRAIN Law (RA 10963)"`);
  lines.push('');

  lines.push(`"Metric","Monthly (PHP)","Semi-Monthly (PHP)","Annualized (PHP)"`);
  lines.push(`"Target Net Take-Home Pay",${result.targetNetPay.toFixed(2)},${result.semiMonthlyNetPay.toFixed(2)},${result.annualNetTakeHome.toFixed(2)}`);
  lines.push(`"Required Basic Gross Salary",${result.requiredGrossSalary.toFixed(2)},${result.semiMonthlyGrossSalary.toFixed(2)},${result.annualGrossSalary.toFixed(2)}`);
  lines.push(`"Taxable Allowances",${result.taxableAllowances.toFixed(2)},${(result.taxableAllowances / 2).toFixed(2)},${(result.taxableAllowances * 12).toFixed(2)}`);
  lines.push(`"Non-Taxable Allowances (De Minimis)",${result.nonTaxableAllowances.toFixed(2)},${(result.nonTaxableAllowances / 2).toFixed(2)},${(result.nonTaxableAllowances * 12).toFixed(2)}`);
  lines.push(`"Total Gross Compensation",${(result.requiredGrossSalary + result.taxableAllowances + result.nonTaxableAllowances).toFixed(2)},${((result.requiredGrossSalary + result.taxableAllowances + result.nonTaxableAllowances) / 2).toFixed(2)},${((result.requiredGrossSalary + result.taxableAllowances + result.nonTaxableAllowances) * 12).toFixed(2)}`);
  lines.push('');

  lines.push(`"Statutory Employee Deductions & Taxes","Monthly (PHP)","Rate / Basis"`);
  lines.push(`"SSS Employee Contribution (Regular + WISP)",${result.sssEE.toFixed(2)},"Regular 4.5% + WISP 4.5% (MSC ₱${result.sssMsc.toLocaleString()})"`);
  lines.push(`"PhilHealth Premium (5% Employee Share)",${result.philhealthEE.toFixed(2)},"2.5% of salary (MSC ₱${result.philhealthMsc.toLocaleString()})"`);
  lines.push(`"Pag-IBIG Contribution (HDMF)",${result.pagibigEE.toFixed(2)},"2% capped at ₱200 (Circular 460)"`);
  lines.push(`"Total Mandatory Statutory Deductions",${result.totalMandatoryEE.toFixed(2)},"Exempt from withholding tax"`);
  lines.push(`"Taxable Base Income",${result.taxableIncome.toFixed(2)},"Gross - Statutory Deductions"`);
  lines.push(`"BIR Withholding Tax",${result.withholdingTax.toFixed(2)},"${result.taxBracketDescription}"`);
  lines.push(`"Total Employee Deductions",${(result.totalMandatoryEE + result.withholdingTax + result.postTaxDeductions).toFixed(2)},"Mandatory + Tax + Other"`);
  lines.push(`"Net Take-Home Pay (Verified)",${result.actualNetPay.toFixed(2)},"Variance: ₱${result.varianceDelta.toFixed(2)}"`);
  lines.push('');

  lines.push(`"Employer Statutory Burden & Total Cost-to-Company (CTC)","Monthly (PHP)","Annualized (PHP)"`);
  lines.push(`"SSS Employer Share (Regular 9.5% + WISP + EC)",${result.sssER.toFixed(2)},${(result.sssER * 12).toFixed(2)}`);
  lines.push(`"PhilHealth Employer Share (2.5%)",${result.philhealthER.toFixed(2)},${(result.philhealthER * 12).toFixed(2)}`);
  lines.push(`"Pag-IBIG Employer Share (Circular 460)",${result.pagibigER.toFixed(2)},${(result.pagibigER * 12).toFixed(2)}`);
  lines.push(`"13th-Month Pay Accrual (PD 851)",${result.monthlyThirteenthMonthAccrual.toFixed(2)},${result.annualThirteenthMonthPay.toFixed(2)}`);
  lines.push(`"Total Monthly Cost to Employer",${result.totalMonthlyEmployerCost.toFixed(2)},${result.totalAnnualEmployerCost.toFixed(2)}`);

  return lines.join('\r\n');
}
