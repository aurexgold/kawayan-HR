/**
 * DOLE Presidential Decree No. 851 (13th Month Pay Law) Calculation Engine
 * Compliant with:
 * - Presidential Decree No. 851 & Revised Guidelines on the Implementation of the 13th Month Pay Law
 * - DOLE Labor Advisory No. 25 (Payment of Thirteenth Month Pay)
 * - Republic Act No. 10963 (TRAIN Law) Section 32(B)(7)(e) - ₱90,000 Non-Taxable Ceiling
 */

import { Employee } from '../types';

export interface MonthEarnings {
  monthIndex: number; // 0 = Jan, 11 = Dec
  monthName: string;
  isEmployed: boolean;
  baseSalary: number;
  unpaidDays: number; // Leave Without Pay (LWOP) or unauthorized absence
  unpaidDeduction: number;
  actualBasicEarned: number;
  notes?: string;
}

export interface ThirteenthMonthRecord {
  employeeId: string;
  employeeName: string;
  role: string;
  department: string;
  joinDate: string;
  currentMonthlySalary: number;
  dailyRate: number; // Based on 261 working days/year (DOLE standard for 5-day work week)
  monthsEmployedInYear: number;
  isProRated: boolean;
  proRatedFraction: string; // e.g. "12/12" or "6/12"
  totalAnnualBasicEarned: number;
  rawCalculatedAmount: number; // totalAnnualBasicEarned / 12
  midYearAdvanceDeducted: number; // If employer paid 50% in May/June
  payableThirteenthMonth: number;
  
  // Tax Status under TRAIN Law (₱90,000 threshold)
  taxExemptionCap: number; // ₱90,000
  taxExemptAmount: number;
  taxableExcess: number;
  isTaxable: boolean;
  estimatedWithholdingTax: number;
  netTakeHome: number;

  monthlyBreakdown: MonthEarnings[];
  complianceNotes: string;
  disbursementStatus: 'Scheduled (Dec 20)' | 'Ready for Approval' | 'Disbursed' | 'Pro-Rated Clearance';
}

export interface ThirteenthMonthSummary {
  calendarYear: number;
  totalEmployees: number;
  fullYearEmployees: number;
  proRatedEmployees: number;
  employeesExceedingTaxCap: number;
  totalAnnualBasicPayroll: number;
  totalGrossThirteenthMonth: number;
  totalMidYearAdvanceDeducted: number;
  totalPayableThirteenthMonth: number;
  totalTaxExemptDisbursement: number;
  totalTaxableExcess: number;
  totalEstimatedTaxWithheld: number;
  totalNetCashRequired: number;
  statutoryDeadline: string; // "December 24, 2024"
  daysRemainingToDeadline: number;
  doleReportDeadline: string; // "January 15, 2025"
}

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const TAX_EXEMPTION_CEILING_TRAIN = 90000;

/**
 * Calculates working daily rate using DOLE standard multiplier.
 * Formula for 5-day work week: (Monthly Salary × 12) / 261 days
 */
export function calculateDailyRate(monthlySalary: number): number {
  return (monthlySalary * 12) / 261;
}

/**
 * Computes 13th month pay for an employee for a specific calendar year (default 2024).
 * Adheres strictly to DOLE PD 851:
 * Total Basic Salary Earned within Calendar Year / 12
 */
export function calculateEmployeeThirteenthMonth(
  employee: Employee,
  calendarYear: number = 2024,
  options?: {
    customUnpaidDays?: Record<number, number>; // monthIndex -> days
    customMonthlySalary?: Record<number, number>; // monthIndex -> salary
    midYearAdvance?: number;
    disbursementStatus?: ThirteenthMonthRecord['disbursementStatus'];
  }
): ThirteenthMonthRecord {
  const joinDate = new Date(employee.joinDate);
  const joinYear = joinDate.getFullYear();
  const joinMonth = joinDate.getMonth(); // 0-indexed
  const joinDay = joinDate.getDate();

  const dailyRate = calculateDailyRate(employee.basicSalary);
  const monthlyBreakdown: MonthEarnings[] = [];
  let totalAnnualBasicEarned = 0;
  let activeMonthCount = 0;

  for (let m = 0; m < 12; m++) {
    const monthName = MONTH_NAMES[m];
    // Determine employment status for this month
    let isEmployed = true;
    let notes = '';

    if (joinYear > calendarYear) {
      isEmployed = false;
      notes = `Joined after ${calendarYear}`;
    } else if (joinYear === calendarYear) {
      if (m < joinMonth) {
        isEmployed = false;
        notes = 'Not yet hired';
      } else if (m === joinMonth) {
        isEmployed = true;
        // Check partial month pro-ration if joined mid-month
        if (joinDay > 1) {
          notes = `Joined ${monthName} ${joinDay} (First month pro-rated)`;
        } else {
          notes = `Joined ${monthName} 1st`;
        }
      } else {
        isEmployed = true;
      }
    }

    const baseSalary = options?.customMonthlySalary?.[m] ?? employee.basicSalary;
    let unpaidDays = 0;
    let unpaidDeduction = 0;
    let actualBasicEarned = 0;

    if (isEmployed) {
      activeMonthCount++;
      // Custom unpaid days or sample defaults for demonstration
      if (options?.customUnpaidDays?.[m] !== undefined) {
        unpaidDays = options.customUnpaidDays[m];
      } else if (employee.id === 'emp-003' && m === 3) {
        // Jose Rizal took 2 days LWOP in April
        unpaidDays = 2;
        notes = notes ? `${notes}; 2 days LWOP` : '2 days unpaid leave (LWOP)';
      }

      // If joined mid-month, deduct unworked days before hire date
      if (joinYear === calendarYear && m === joinMonth && joinDay > 1) {
        // Approximate working days missed before hire date
        const estimatedPreHireDays = Math.min(22, Math.floor((joinDay - 1) * (22 / 30)));
        unpaidDays += estimatedPreHireDays;
      }

      const effectiveDaily = calculateDailyRate(baseSalary);
      unpaidDeduction = Math.round(unpaidDays * effectiveDaily);
      actualBasicEarned = Math.max(0, baseSalary - unpaidDeduction);
      totalAnnualBasicEarned += actualBasicEarned;
    } else {
      actualBasicEarned = 0;
    }

    monthlyBreakdown.push({
      monthIndex: m,
      monthName,
      isEmployed,
      baseSalary: isEmployed ? baseSalary : 0,
      unpaidDays,
      unpaidDeduction,
      actualBasicEarned,
      notes: notes || (unpaidDays > 0 ? `${unpaidDays}d LWOP deducted` : 'Full basic rendered'),
    });
  }

  // DOLE Formula: Total Basic Salary Earned / 12
  const rawCalculatedAmount = Math.round((totalAnnualBasicEarned / 12) * 100) / 100;
  const isProRated = activeMonthCount < 12 || monthlyBreakdown.some(m => m.unpaidDays > 0);
  const proRatedFraction = `${activeMonthCount}/12`;

  const midYearAdvanceDeducted = options?.midYearAdvance ?? 0;
  const payableThirteenthMonth = Math.max(0, rawCalculatedAmount - midYearAdvanceDeducted);

  // Tax treatment under TRAIN Law (₱90,000 threshold)
  const taxExemptionCap = TAX_EXEMPTION_CEILING_TRAIN;
  const taxExemptAmount = Math.min(payableThirteenthMonth, taxExemptionCap);
  const taxableExcess = Math.max(0, payableThirteenthMonth - taxExemptionCap);
  const isTaxable = taxableExcess > 0;

  // Approximate withholding tax on taxable excess based on typical marginal bracket (20% - 25%)
  const estimatedWithholdingTax = isTaxable ? Math.round(taxableExcess * 0.20) : 0;
  const netTakeHome = payableThirteenthMonth - estimatedWithholdingTax;

  let complianceNotes = 'Fully eligible under DOLE PD 851.';
  if (activeMonthCount === 0) {
    complianceNotes = 'Ineligible: Not yet employed in this calendar year.';
  } else if (activeMonthCount < 1) {
    complianceNotes = 'Less than 1 month service. DOLE requires minimum of 1 month service.';
  } else if (isProRated) {
    complianceNotes = `Pro-rated calculation for ${activeMonthCount} months of active service in ${calendarYear}.`;
  }

  return {
    employeeId: employee.id,
    employeeName: `${employee.firstName} ${employee.lastName}`,
    role: employee.role,
    department: employee.department,
    joinDate: employee.joinDate,
    currentMonthlySalary: employee.basicSalary,
    dailyRate: Math.round(dailyRate * 100) / 100,
    monthsEmployedInYear: activeMonthCount,
    isProRated,
    proRatedFraction,
    totalAnnualBasicEarned: Math.round(totalAnnualBasicEarned),
    rawCalculatedAmount,
    midYearAdvanceDeducted,
    payableThirteenthMonth,
    taxExemptionCap,
    taxExemptAmount,
    taxableExcess,
    isTaxable,
    estimatedWithholdingTax,
    netTakeHome,
    monthlyBreakdown,
    complianceNotes,
    disbursementStatus: options?.disbursementStatus || 'Scheduled (Dec 20)',
  };
}

/**
 * Computes company-wide summary for all active employees.
 */
export function calculateCompanyThirteenthMonthSummary(
  employees: Employee[],
  calendarYear: number = 2024,
  overrides?: Record<string, { customUnpaidDays?: Record<number, number>; midYearAdvance?: number }>
): { records: ThirteenthMonthRecord[]; summary: ThirteenthMonthSummary } {
  const records = employees.map(emp => {
    const override = overrides?.[emp.id];
    return calculateEmployeeThirteenthMonth(emp, calendarYear, {
      customUnpaidDays: override?.customUnpaidDays,
      midYearAdvance: override?.midYearAdvance,
    });
  });

  const totalEmployees = records.length;
  const fullYearEmployees = records.filter(r => !r.isProRated).length;
  const proRatedEmployees = records.filter(r => r.isProRated).length;
  const employeesExceedingTaxCap = records.filter(r => r.isTaxable).length;

  const totalAnnualBasicPayroll = records.reduce((sum, r) => sum + r.totalAnnualBasicEarned, 0);
  const totalGrossThirteenthMonth = records.reduce((sum, r) => sum + r.rawCalculatedAmount, 0);
  const totalMidYearAdvanceDeducted = records.reduce((sum, r) => sum + r.midYearAdvanceDeducted, 0);
  const totalPayableThirteenthMonth = records.reduce((sum, r) => sum + r.payableThirteenthMonth, 0);
  const totalTaxExemptDisbursement = records.reduce((sum, r) => sum + r.taxExemptAmount, 0);
  const totalTaxableExcess = records.reduce((sum, r) => sum + r.taxableExcess, 0);
  const totalEstimatedTaxWithheld = records.reduce((sum, r) => sum + r.estimatedWithholdingTax, 0);
  const totalNetCashRequired = records.reduce((sum, r) => sum + r.netTakeHome, 0);

  // Target deadline is Dec 24 of calendarYear
  const deadlineDate = new Date(calendarYear, 11, 24); // Dec 24
  const today = new Date();
  const diffTime = deadlineDate.getTime() - today.getTime();
  const daysRemainingToDeadline = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const summary: ThirteenthMonthSummary = {
    calendarYear,
    totalEmployees,
    fullYearEmployees,
    proRatedEmployees,
    employeesExceedingTaxCap,
    totalAnnualBasicPayroll,
    totalGrossThirteenthMonth,
    totalMidYearAdvanceDeducted,
    totalPayableThirteenthMonth,
    totalTaxExemptDisbursement,
    totalTaxableExcess,
    totalEstimatedTaxWithheld,
    totalNetCashRequired,
    statutoryDeadline: `December 24, ${calendarYear}`,
    daysRemainingToDeadline,
    doleReportDeadline: `January 15, ${calendarYear + 1}`,
  };

  return { records, summary };
}

/**
 * Generates DOLE Compliance Report CSV conforming to the DOLE Establishment Report format
 */
export function generateDoleComplianceCsv(
  records: ThirteenthMonthRecord[],
  calendarYear: number = 2024,
  companyName: string = 'Kawayan Tech Philippines Inc.'
): string {
  const headers = [
    'Employee ID',
    'Employee Name',
    'Position / Designation',
    'Department',
    'Date Hired',
    'Tenure in Year (Months)',
    'Monthly Basic Salary (PHP)',
    'Total Basic Salary Earned (PHP)',
    '13th Month Pay Gross (PHP)',
    'Mid-Year Advance (PHP)',
    'Net 13th Month Pay (PHP)',
    'Tax-Exempt Portion (PHP)',
    'Taxable Excess (PHP)',
    'Tax Withheld (PHP)',
    'Net Payout (PHP)',
    'Compliance Status',
    'Statutory Authority'
  ];

  const rows = records.map(r => [
    `"${r.employeeId}"`,
    `"${r.employeeName}"`,
    `"${r.role}"`,
    `"${r.department}"`,
    `"${r.joinDate}"`,
    `"${r.proRatedFraction}"`,
    r.currentMonthlySalary.toFixed(2),
    r.totalAnnualBasicEarned.toFixed(2),
    r.rawCalculatedAmount.toFixed(2),
    r.midYearAdvanceDeducted.toFixed(2),
    r.payableThirteenthMonth.toFixed(2),
    r.taxExemptAmount.toFixed(2),
    r.taxableExcess.toFixed(2),
    r.estimatedWithholdingTax.toFixed(2),
    r.netTakeHome.toFixed(2),
    `"${r.complianceNotes}"`,
    '"DOLE PD 851 / RA 10963"'
  ]);

  const metadataHeader = [
    `# DOLE MANDATORY 13TH MONTH PAY COMPLIANCE SCHEDULE`,
    `# Company: ${companyName}`,
    `# Calendar Year: ${calendarYear}`,
    `# Legal Basis: Presidential Decree No. 851 & Labor Advisory No. 25`,
    `# Statutory Payment Deadline: On or before December 24, ${calendarYear}`,
    `# DOLE Compliance Report Due Date: On or before January 15, ${calendarYear + 1}`,
    `# Generated On: ${new Date().toISOString()}`,
    ''
  ].join('\n');

  return metadataHeader + [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}

/**
 * Statutory Inclusions vs Exclusions reference list for HR managers
 */
export const DOLE_STATUTORY_GUIDELINES = {
  inclusions: [
    { item: 'Basic Salary', description: 'Regular rate earned for actual services rendered.' },
    { item: 'Paid Sick / Vacation Leave', description: 'Leaves taken with basic pay during the calendar year.' },
    { item: 'Service Incentive Leave (SIL)', description: '5 days mandated paid leave if taken as paid time off.' },
    { item: 'Paid Regular Holidays', description: 'Unworked or worked regular holidays paid at standard basic rate.' },
    { item: 'Paid Rest Days', description: 'Regular pay allocated during designated rest days.' },
  ],
  exclusions: [
    { item: 'Overtime Pay (OT)', description: 'Work rendered beyond 8 hours/day is excluded from basic salary.' },
    { item: 'Night Shift Differential (NSD)', description: 'Additional 10% premium for work between 10PM - 6AM is excluded.' },
    { item: 'Holiday Premium Pay', description: 'Additional 30% / 100% / 200% premium portion is excluded.' },
    { item: 'Cost of Living Allowance (COLA)', description: 'Unless integrated into basic pay by CBA or employment contract.' },
    { item: 'Unused Leave Cash Conversion', description: 'Cash monetization of unused vacation/sick leaves is excluded.' },
    { item: 'Discretionary / Christmas Bonuses', description: '14th month pay, performance bonuses, or gratuity gifts.' },
    { item: 'Unworked Days / LWOP', description: 'Leaves Without Pay, unauthorized absences, and tardiness deductions.' },
  ],
  taxRules: [
    'Section 32(B)(7)(e) of the National Internal Revenue Code (NIRC) as amended by the TRAIN Law (RA 10963).',
    'Total 13th month pay and other benefits up to ₱90,000 are strictly EXEMPT from income and withholding tax.',
    'Any amount in excess of ₱90,000 shall be added to taxable compensation and subjected to graduated withholding tax tables.',
    'Employers must report the tax-exempt and taxable portions in BIR Form 2316 (Certificate of Compensation Payment / Tax Withheld).'
  ],
  complianceSchedule: [
    { milestone: 'Computation & HR Audit', deadline: 'First week of December', note: 'Verify attendance logs, LWOP deductions, and hire dates.' },
    { milestone: 'Statutory Disbursal Deadline', deadline: 'On or before December 24', note: 'Strict deadline under PD 851. Late payment incurs DOLE penalties.' },
    { milestone: 'DOLE Compliance Report', deadline: 'On or before January 15', note: 'File through the DOLE Establishment Report System (reports.dole.gov.ph).' }
  ]
};
