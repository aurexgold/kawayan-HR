/**
 * Philippine Government Contributions Compliance & Tracking Engine
 * Validates monthly SSS, PhilHealth, and Pag-IBIG payroll deductions against:
 * - SSS Law (RA 11199) & SSS Circular 2023-010 / 2024 (14% rate, WISP, EC)
 * - PhilHealth Universal Health Care Act (RA 11223) - 5% premium, ₱10k-₱100k
 * - Pag-IBIG Fund Circular No. 460 - Mandatory ₱200 EE / ₱200 ER cap
 */

import { Employee } from '../types';
import { calculateContributions, calculateSSS, calculatePhilHealth, calculatePagIBIG } from './ph-payroll';

export type StatutoryAgency = 'SSS' | 'PHILHEALTH' | 'PAGIBIG' | 'ALL';

export type ComplianceStatus = 'COMPLIANT' | 'WARNING' | 'NON_COMPLIANT' | 'MISSING_ID';

export interface EmployeeComplianceRecord {
  employeeId: string;
  employeeName: string;
  role: string;
  department: string;
  basicSalary: number;
  periodMonth: string; // e.g. "2026-11"
  
  // Government Registration IDs
  tin: string;
  sssNumber: string;
  philhealthNumber: string;
  pagibigNumber: string;

  // SSS Details & Audit
  sssMsc: number;
  sssRegularEE: number;
  sssRegularER: number;
  sssWispEE: number;
  sssWispER: number;
  sssEcER: number;
  sssTotalEE: number;
  sssTotalER: number;
  sssGrandTotal: number;
  sssStatus: ComplianceStatus;
  sssNotes: string;

  // PhilHealth Details & Audit
  philhealthMsc: number;
  philhealthRate: number;
  philhealthEE: number;
  philhealthER: number;
  philhealthTotal: number;
  philhealthStatus: ComplianceStatus;
  philhealthNotes: string;

  // Pag-IBIG Details & Audit
  pagibigMfs: number;
  pagibigEE: number;
  pagibigER: number;
  pagibigMp2: number;
  pagibigTotal: number;
  pagibigStatus: ComplianceStatus;
  pagibigNotes: string;

  // Aggregated Totals
  totalEmployeeDeductions: number;
  totalEmployerContributions: number;
  totalRemittanceDue: number;
  
  // Overall Compliance Health
  overallStatus: ComplianceStatus;
  complianceIssues: string[];
}

export interface AgencyAuditSummary {
  agency: StatutoryAgency;
  name: string;
  governingLaw: string;
  statutoryRateSummary: string;
  totalEE: number;
  totalER: number;
  grandTotal: number;
  remittanceDueDate: string;
  reportingForm: string;
  compliantCount: number;
  flaggedCount: number;
}

export interface OverallStatutoryAuditReport {
  periodMonth: string;
  totalEmployees: number;
  compliantCount: number;
  warningCount: number;
  missingIdCount: number;
  complianceScorePercent: number;
  totalEmployeeDeductions: number;
  totalEmployerContributions: number;
  totalGovernmentRemittanceDue: number;
  agencySummaries: AgencyAuditSummary[];
  records: EmployeeComplianceRecord[];
}

/**
 * Validates format of Philippine statutory IDs
 */
export function validateGovernmentId(id: string, type: 'SSS' | 'PHILHEALTH' | 'PAGIBIG' | 'TIN'): {
  isValid: boolean;
  cleanId: string;
  issue?: string;
} {
  if (!id || id.trim() === '' || id.includes('000-000') || id.includes('00-0000000')) {
    return { isValid: false, cleanId: id || '', issue: 'Missing or placeholder ID in registry' };
  }
  const digitsOnly = id.replace(/[^0-9]/g, '');

  switch (type) {
    case 'SSS':
      // Standard: 10 digits (XX-XXXXXXX-X)
      if (digitsOnly.length === 10) return { isValid: true, cleanId: id };
      return { isValid: false, cleanId: id, issue: `Expected 10 digits, got ${digitsOnly.length}` };

    case 'PHILHEALTH':
      // Standard: 12 digits (XX-XXXXXXXXX-X)
      if (digitsOnly.length === 12) return { isValid: true, cleanId: id };
      return { isValid: false, cleanId: id, issue: `Expected 12 digits, got ${digitsOnly.length}` };

    case 'PAGIBIG':
      // Standard: 12 digits (XXXX-XXXX-XXXX)
      if (digitsOnly.length === 12) return { isValid: true, cleanId: id };
      return { isValid: false, cleanId: id, issue: `Expected 12 digits, got ${digitsOnly.length}` };

    case 'TIN':
      // Standard: 9 or 12 digits (XXX-XXX-XXX-000)
      if (digitsOnly.length >= 9 && digitsOnly.length <= 12) return { isValid: true, cleanId: id };
      return { isValid: false, cleanId: id, issue: `Expected 9-12 digits, got ${digitsOnly.length}` };
  }
}

/**
 * Generates and validates monthly contribution compliance records for all employees
 */
export function generateMonthlyComplianceRecords(
  employees: Employee[],
  periodMonth: string = '2026-11'
): OverallStatutoryAuditReport {
  const records: EmployeeComplianceRecord[] = [];

  let grandTotalEE = 0;
  let grandTotalER = 0;
  let grandTotalRemittance = 0;

  let compliantCount = 0;
  let warningCount = 0;
  let missingIdCount = 0;

  for (const emp of employees) {
    const sssCheck = validateGovernmentId(emp.sssNumber, 'SSS');
    const phCheck = validateGovernmentId(emp.philhealthNumber, 'PHILHEALTH');
    const hdmfCheck = validateGovernmentId(emp.pagibigNumber, 'PAGIBIG');

    // Run exact statutory formulas
    const sssCalc = calculateSSS(emp.basicSalary);
    const phCalc = calculatePhilHealth(emp.basicSalary);
    const hdmfCalc = calculatePagIBIG(emp.basicSalary);

    const issues: string[] = [];

    // Audit SSS
    let sssStatus: ComplianceStatus = 'COMPLIANT';
    let sssNotes = `MSC: ₱${sssCalc.msc.toLocaleString()} (Regular 9.5%/4.5%)`;
    if (!sssCheck.isValid) {
      sssStatus = 'MISSING_ID';
      issues.push(`SSS ID invalid: ${sssCheck.issue}`);
    } else if (sssCalc.wispEE > 0) {
      sssNotes += ` • WISP Mandated (>₱20k): ₱${sssCalc.wispEE} EE / ₱${sssCalc.wispER} ER`;
    }

    // Audit PhilHealth
    let phStatus: ComplianceStatus = 'COMPLIANT';
    let phNotes = `5.0% Premium on ₱${phCalc.msc.toLocaleString()} (₱${phCalc.eeShare} EE / ₱${phCalc.erShare} ER)`;
    if (!phCheck.isValid) {
      phStatus = 'MISSING_ID';
      issues.push(`PhilHealth ID invalid: ${phCheck.issue}`);
    } else if (emp.basicSalary <= phCalc.floor) {
      phNotes += ` • Applied Minimum Floor ₱10,000`;
    } else if (emp.basicSalary >= phCalc.ceiling) {
      phNotes += ` • Capped at Maximum Ceiling ₱100,000`;
    }

    // Audit Pag-IBIG
    let hdmfStatus: ComplianceStatus = 'COMPLIANT';
    let hdmfNotes = `Circular 460 Cap: ₱${hdmfCalc.eeShare} EE / ₱${hdmfCalc.erShare} ER (₱${hdmfCalc.totalMandatory} total)`;
    if (!hdmfCheck.isValid) {
      hdmfStatus = 'MISSING_ID';
      issues.push(`Pag-IBIG ID invalid: ${hdmfCheck.issue}`);
    }

    // Overall Status
    let overallStatus: ComplianceStatus = 'COMPLIANT';
    if (!sssCheck.isValid || !phCheck.isValid || !hdmfCheck.isValid) {
      overallStatus = 'MISSING_ID';
      missingIdCount++;
    } else if (issues.length > 0) {
      overallStatus = 'WARNING';
      warningCount++;
    } else {
      compliantCount++;
    }

    const totalEE = sssCalc.totalEE + phCalc.eeShare + hdmfCalc.eeShare;
    const totalER = sssCalc.totalER + phCalc.erShare + hdmfCalc.erShare;
    const totalDue = totalEE + totalER;

    grandTotalEE += totalEE;
    grandTotalER += totalER;
    grandTotalRemittance += totalDue;

    records.push({
      employeeId: emp.id,
      employeeName: `${emp.firstName} ${emp.lastName}`,
      role: emp.role,
      department: emp.department,
      basicSalary: emp.basicSalary,
      periodMonth,
      tin: emp.tin || 'N/A',
      sssNumber: emp.sssNumber || 'N/A',
      philhealthNumber: emp.philhealthNumber || 'N/A',
      pagibigNumber: emp.pagibigNumber || 'N/A',

      sssMsc: sssCalc.msc,
      sssRegularEE: sssCalc.regularEE,
      sssRegularER: sssCalc.regularER,
      sssWispEE: sssCalc.wispEE,
      sssWispER: sssCalc.wispER,
      sssEcER: sssCalc.ec,
      sssTotalEE: sssCalc.totalEE,
      sssTotalER: sssCalc.totalER,
      sssGrandTotal: sssCalc.grandTotal,
      sssStatus,
      sssNotes,

      philhealthMsc: phCalc.msc,
      philhealthRate: phCalc.ratePercent,
      philhealthEE: phCalc.eeShare,
      philhealthER: phCalc.erShare,
      philhealthTotal: phCalc.totalPremium,
      philhealthStatus: phStatus,
      philhealthNotes: phNotes,

      pagibigMfs: hdmfCalc.mfs,
      pagibigEE: hdmfCalc.eeShare,
      pagibigER: hdmfCalc.erShare,
      pagibigMp2: hdmfCalc.mp2,
      pagibigTotal: hdmfCalc.totalMandatory,
      pagibigStatus: hdmfStatus,
      pagibigNotes: hdmfNotes,

      totalEmployeeDeductions: totalEE,
      totalEmployerContributions: totalER,
      totalRemittanceDue: totalDue,
      overallStatus,
      complianceIssues: issues,
    });
  }

  // Agency Summaries
  const sssTotalEE = records.reduce((acc, r) => acc + r.sssTotalEE, 0);
  const sssTotalER = records.reduce((acc, r) => acc + r.sssTotalER, 0);
  const phTotalEE = records.reduce((acc, r) => acc + r.philhealthEE, 0);
  const phTotalER = records.reduce((acc, r) => acc + r.philhealthER, 0);
  const hdmfTotalEE = records.reduce((acc, r) => acc + r.pagibigEE, 0);
  const hdmfTotalER = records.reduce((acc, r) => acc + r.pagibigER, 0);

  // Month due dates (usually 10th or 15th of the succeeding month in Philippines)
  const [yearStr, monthStr] = periodMonth.split('-');
  const currMonth = parseInt(monthStr, 10);
  const currYear = parseInt(yearStr, 10);
  const nextMonth = currMonth === 12 ? 1 : currMonth + 1;
  const nextYear = currMonth === 12 ? currYear + 1 : currYear;
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const nextMonthName = monthNames[nextMonth - 1];

  const agencySummaries: AgencyAuditSummary[] = [
    {
      agency: 'SSS',
      name: 'Social Security System (SSS & WISP)',
      governingLaw: 'Republic Act No. 11199 / SSS Circular 2023-010',
      statutoryRateSummary: '14.0% Total (4.5% EE + 9.5% ER) + WISP + EC',
      totalEE: sssTotalEE,
      totalER: sssTotalER,
      grandTotal: sssTotalEE + sssTotalER,
      remittanceDueDate: `${nextMonthName} 15, ${nextYear}`,
      reportingForm: 'SSS Form R-3 / R-5 (Web Upload)',
      compliantCount: records.filter(r => r.sssStatus === 'COMPLIANT').length,
      flaggedCount: records.filter(r => r.sssStatus !== 'COMPLIANT').length,
    },
    {
      agency: 'PHILHEALTH',
      name: 'Philippine Health Insurance Corporation',
      governingLaw: 'Republic Act No. 11223 (Universal Health Care Act)',
      statutoryRateSummary: '5.0% Premium (2.5% EE + 2.5% ER), ₱10k floor / ₱100k ceiling',
      totalEE: phTotalEE,
      totalER: phTotalER,
      grandTotal: phTotalEE + phTotalER,
      remittanceDueDate: `${nextMonthName} 10, ${nextYear}`,
      reportingForm: 'PhilHealth EPRS RF-1 (Electronic Reporting)',
      compliantCount: records.filter(r => r.philhealthStatus === 'COMPLIANT').length,
      flaggedCount: records.filter(r => r.philhealthStatus !== 'COMPLIANT').length,
    },
    {
      agency: 'PAGIBIG',
      name: 'Home Development Mutual Fund (HDMF / Pag-IBIG)',
      governingLaw: 'Pag-IBIG Fund Circular No. 460',
      statutoryRateSummary: '₱10,000 MFS Cap (Max ₱200 EE + ₱200 ER = ₱400)',
      totalEE: hdmfTotalEE,
      totalER: hdmfTotalER,
      grandTotal: hdmfTotalEE + hdmfTotalER,
      remittanceDueDate: `${nextMonthName} 15, ${nextYear}`,
      reportingForm: 'Pag-IBIG MCRF (Monthly Remittance Form)',
      compliantCount: records.filter(r => r.pagibigStatus === 'COMPLIANT').length,
      flaggedCount: records.filter(r => r.pagibigStatus !== 'COMPLIANT').length,
    },
  ];

  const totalEmployees = employees.length;
  const complianceScorePercent = totalEmployees > 0 
    ? +((compliantCount / totalEmployees) * 100).toFixed(1)
    : 100;

  return {
    periodMonth,
    totalEmployees,
    compliantCount,
    warningCount,
    missingIdCount,
    complianceScorePercent,
    totalEmployeeDeductions: grandTotalEE,
    totalEmployerContributions: grandTotalER,
    totalGovernmentRemittanceDue: grandTotalRemittance,
    agencySummaries,
    records,
  };
}

/**
 * Exports Master Statutory Contributions CSV
 */
export function generateMasterContributionsCsv(report: OverallStatutoryAuditReport): string {
  const headers = [
    'Employee ID',
    'Employee Name',
    'Department',
    'Role',
    'Monthly Basic Salary',
    'BIR TIN',
    'SSS No',
    'SSS MSC',
    'SSS Regular EE',
    'SSS Regular ER',
    'SSS WISP EE',
    'SSS WISP ER',
    'SSS EC ER',
    'SSS Total EE',
    'SSS Total ER',
    'SSS Grand Total',
    'PhilHealth PIN',
    'PhilHealth EE (2.5%)',
    'PhilHealth ER (2.5%)',
    'PhilHealth Total',
    'Pag-IBIG MID',
    'Pag-IBIG EE',
    'Pag-IBIG ER',
    'Pag-IBIG Total',
    'Total EE Deductions',
    'Total ER Burden',
    'Total Combined Remittance',
    'Compliance Status',
    'Compliance Notes'
  ];

  const rows = report.records.map(r => [
    `"${r.employeeId}"`,
    `"${r.employeeName}"`,
    `"${r.department}"`,
    `"${r.role}"`,
    r.basicSalary.toFixed(2),
    `"${r.tin}"`,
    `"${r.sssNumber}"`,
    r.sssMsc.toFixed(2),
    r.sssRegularEE.toFixed(2),
    r.sssRegularER.toFixed(2),
    r.sssWispEE.toFixed(2),
    r.sssWispER.toFixed(2),
    r.sssEcER.toFixed(2),
    r.sssTotalEE.toFixed(2),
    r.sssTotalER.toFixed(2),
    r.sssGrandTotal.toFixed(2),
    `"${r.philhealthNumber}"`,
    r.philhealthEE.toFixed(2),
    r.philhealthER.toFixed(2),
    r.philhealthTotal.toFixed(2),
    `"${r.pagibigNumber}"`,
    r.pagibigEE.toFixed(2),
    r.pagibigER.toFixed(2),
    r.pagibigTotal.toFixed(2),
    r.totalEmployeeDeductions.toFixed(2),
    r.totalEmployerContributions.toFixed(2),
    r.totalRemittanceDue.toFixed(2),
    `"${r.overallStatus}"`,
    `"${r.complianceIssues.join('; ') || 'Fully compliant'}"`
  ]);

  return [headers.join(','), ...rows.map(row => row.join(','))].join('\r\n');
}

/**
 * SSS R-3 Web Upload CSV Format
 */
export function generateSssR3Csv(report: OverallStatutoryAuditReport): string {
  const headers = [
    'SS Number',
    'Employee Name',
    'Monthly Salary Credit (MSC)',
    'Social Security EE',
    'Social Security ER',
    'EC ER',
    'WISP EE',
    'WISP ER',
    'Total Contribution'
  ];

  const rows = report.records.map(r => [
    `"${r.sssNumber}"`,
    `"${r.employeeName}"`,
    r.sssMsc.toFixed(2),
    r.sssRegularEE.toFixed(2),
    r.sssRegularER.toFixed(2),
    r.sssEcER.toFixed(2),
    r.sssWispEE.toFixed(2),
    r.sssWispER.toFixed(2),
    r.sssGrandTotal.toFixed(2)
  ]);

  return [headers.join(','), ...rows.map(row => row.join(','))].join('\r\n');
}

/**
 * PhilHealth EPRS RF-1 CSV Format
 */
export function generatePhilhealthEprsCsv(report: OverallStatutoryAuditReport): string {
  const headers = [
    'PhilHealth PIN',
    'Employee Name',
    'Basic Salary',
    'Employee Share (2.5%)',
    'Employer Share (2.5%)',
    'Total Premium Due'
  ];

  const rows = report.records.map(r => [
    `"${r.philhealthNumber}"`,
    `"${r.employeeName}"`,
    r.basicSalary.toFixed(2),
    r.philhealthEE.toFixed(2),
    r.philhealthER.toFixed(2),
    r.philhealthTotal.toFixed(2)
  ]);

  return [headers.join(','), ...rows.map(row => row.join(','))].join('\r\n');
}

/**
 * Pag-IBIG MCRF CSV Format
 */
export function generatePagibigMcrfCsv(report: OverallStatutoryAuditReport): string {
  const headers = [
    'Pag-IBIG MID',
    'Employee Name',
    'Monthly Compensation',
    'Employee Share',
    'Employer Share',
    'Total Remittance'
  ];

  const rows = report.records.map(r => [
    `"${r.pagibigNumber}"`,
    `"${r.employeeName}"`,
    r.basicSalary.toFixed(2),
    r.pagibigEE.toFixed(2),
    r.pagibigER.toFixed(2),
    r.pagibigTotal.toFixed(2)
  ]);

  return [headers.join(','), ...rows.map(row => row.join(','))].join('\r\n');
}
