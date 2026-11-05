import { Employee } from '../types';
import { calculateSSS, calculatePhilHealth, calculatePagIBIG } from './ph-payroll';
import { validateGovernmentId } from './statutory-compliance';

export type RemittanceAgencyType = 'ALL' | 'SSS' | 'PHILHEALTH' | 'PAGIBIG';

export interface BulkRemittanceRowItem {
  rowNumber: number;
  employeeId: string;
  employeeName: string;
  department: string;
  role: string;
  basicSalary: number;
  periodMonth: string;

  // Government IDs
  tin: string;
  sssNumber: string;
  philhealthNumber: string;
  pagibigNumber: string;

  // SSS
  uploadedSssEE: number;
  uploadedSssER: number;
  expectedSssEE: number;
  expectedSssER: number;
  sssVarianceEE: number; // uploaded - expected
  sssVarianceER: number;
  sssStatus: 'MATCH' | 'VARIANCE' | 'MISSING_ID';

  // PhilHealth
  uploadedPhEE: number;
  uploadedPhER: number;
  expectedPhEE: number;
  expectedPhER: number;
  phVarianceEE: number;
  phVarianceER: number;
  phStatus: 'MATCH' | 'VARIANCE' | 'MISSING_ID';

  // Pag-IBIG
  uploadedHdmfEE: number;
  uploadedHdmfER: number;
  expectedHdmfEE: number;
  expectedHdmfER: number;
  hdmfVarianceEE: number;
  hdmfVarianceER: number;
  hdmfStatus: 'MATCH' | 'VARIANCE' | 'MISSING_ID';

  // Aggregated
  uploadedTotalRemittance: number;
  expectedTotalRemittance: number;
  totalVariance: number;
  status: 'MATCH' | 'VARIANCE' | 'MISSING_ID' | 'ERROR';
  notes: string[];
}

export interface BulkRemittanceParseResult {
  fileName?: string;
  agencyType: RemittanceAgencyType;
  periodMonth: string;
  totalRows: number;
  matchedCount: number;
  varianceCount: number;
  missingIdCount: number;
  totalUploadedRemittance: number;
  totalExpectedRemittance: number;
  netVariance: number;
  rows: BulkRemittanceRowItem[];
  errors: string[];
}

/**
 * Standard CSV Template Generator
 */
export function generateRemittanceCsvTemplate(agency: RemittanceAgencyType = 'ALL'): string {
  if (agency === 'SSS') {
    const headers = [
      'SS Number',
      'Employee Name',
      'Basic Salary',
      'SS Employee Share (EE)',
      'SS Employer Share (ER)',
      'EC ER',
      'WISP EE',
      'WISP ER',
      'Period Month'
    ];
    const sampleRows = [
      ['"04-1234567-8"', '"Juan Dela Cruz"', '65000.00', '1350.00', '2880.00', '30.00', '450.00', '950.00', '"2026-11"'],
      ['"04-7654321-8"', '"Maria Clara"', '85000.00', '1350.00', '2880.00', '30.00', '450.00', '950.00', '"2026-11"'],
      ['"04-1112223-3"', '"Jose Rizal"', '45000.00', '1350.00', '2880.00', '30.00', '450.00', '950.00', '"2026-11"']
    ];
    return [headers.join(','), ...sampleRows.map(r => r.join(','))].join('\r\n');
  }

  if (agency === 'PHILHEALTH') {
    const headers = [
      'PhilHealth PIN',
      'Employee Name',
      'Basic Salary',
      'PhilHealth EE (2.5%)',
      'PhilHealth ER (2.5%)',
      'Total Premium',
      'Period Month'
    ];
    const sampleRows = [
      ['"12-345678901-2"', '"Juan Dela Cruz"', '65000.00', '1625.00', '1625.00', '3250.00', '"2026-11"'],
      ['"12-098765432-1"', '"Maria Clara"', '85000.00', '2125.00', '2125.00', '4250.00', '"2026-11"'],
      ['"12-333222111-0"', '"Jose Rizal"', '45000.00', '1125.00', '1125.00', '2250.00', '"2026-11"']
    ];
    return [headers.join(','), ...sampleRows.map(r => r.join(','))].join('\r\n');
  }

  if (agency === 'PAGIBIG') {
    const headers = [
      'Pag-IBIG MID',
      'Employee Name',
      'Monthly Compensation',
      'Pag-IBIG EE (Circular 460)',
      'Pag-IBIG ER (Circular 460)',
      'Total Remittance',
      'Period Month'
    ];
    const sampleRows = [
      ['"1234-5678-9012"', '"Juan Dela Cruz"', '65000.00', '200.00', '200.00', '400.00', '"2026-11"'],
      ['"0987-6543-2109"', '"Maria Clara"', '85000.00', '200.00', '200.00', '400.00', '"2026-11"'],
      ['"1111-2222-3333"', '"Jose Rizal"', '45000.00', '200.00', '200.00', '400.00', '"2026-11"']
    ];
    return [headers.join(','), ...sampleRows.map(r => r.join(','))].join('\r\n');
  }

  // Unified All-In-One Remittance Template (Recommended)
  const headers = [
    'Employee ID',
    'Employee Name',
    'Department',
    'Basic Salary',
    'Period Month',
    'SSS Number',
    'PhilHealth PIN',
    'Pag-IBIG MID',
    'TIN',
    'SSS EE Deducted',
    'SSS ER Remitted',
    'PhilHealth EE Deducted',
    'PhilHealth ER Remitted',
    'Pag-IBIG EE Deducted',
    'Pag-IBIG ER Remitted'
  ];

  const sampleRows = [
    ['"emp-001"', '"Juan Dela Cruz"', '"Engineering"', '65000.00', '"2026-11"', '"04-1234567-8"', '"12-345678901-2"', '"1234-5678-9012"', '"123-456-789-000"', '1350.00', '2880.00', '1625.00', '1625.00', '200.00', '200.00'],
    ['"emp-002"', '"Maria Clara"', '"Human Resources"', '85000.00', '"2026-11"', '"04-7654321-8"', '"12-098765432-1"', '"0987-6543-2109"', '"987-654-321-000"', '1350.00', '2880.00', '2125.00', '2125.00', '200.00', '200.00'],
    ['"emp-003"', '"Jose Rizal"', '"Marketing"', '45000.00', '"2026-11"', '"04-1112223-3"', '"12-333222111-0"', '"1111-2222-3333"', '"111-222-333-000"', '1350.00', '2880.00', '1125.00', '1125.00', '200.00', '200.00'],
    ['"emp-004"', '"Andres Bonifacio"', '"Sales"', '55000.00', '"2026-11"', '"04-4445556-6"', '"12-666555444-0"', '"4444-5555-6666"', '"444-555-666-000"', '1350.00', '2880.00', '1375.00', '1375.00', '200.00', '200.00'],
    ['"emp-005"', '"Gabriela Silang"', '"Executive"', '125000.00', '"2026-11"', '"04-7778889-9"', '"12-777888999-1"', '"7777-8888-9999"', '"777-888-999-000"', '1350.00', '2880.00', '2500.00', '2500.00', '200.00', '200.00'],
  ];

  return [headers.join(','), ...sampleRows.map(r => r.join(','))].join('\r\n');
}

/**
 * Downloads standard remittance template directly
 */
export function downloadRemittanceTemplate(agency: RemittanceAgencyType = 'ALL'): void {
  const content = generateRemittanceCsvTemplate(agency);
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Philippine_Govt_Remittance_Template_${agency}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Parses raw CSV string handling quoted cells and commas
 */
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Sanitizes numeric amounts from currency strings like "₱1,250.00" -> 1250
 */
function cleanNumeric(val: any): number {
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (!val) return 0;
  const str = String(val).replace(/[^0-9.-]/g, '');
  const num = parseFloat(str);
  return isNaN(num) ? 0 : +(num.toFixed(2));
}

/**
 * Main parser that parses and audits uploaded CSV records
 */
export function parseBulkRemittanceCsv(
  rawContent: string,
  employees: Employee[],
  defaultMonth: string = '2026-11'
): BulkRemittanceParseResult {
  const lines = rawContent.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  const errors: string[] = [];

  if (lines.length < 2) {
    return {
      agencyType: 'ALL',
      periodMonth: defaultMonth,
      totalRows: 0,
      matchedCount: 0,
      varianceCount: 0,
      missingIdCount: 0,
      totalUploadedRemittance: 0,
      totalExpectedRemittance: 0,
      netVariance: 0,
      rows: [],
      errors: ['The uploaded CSV file is empty or missing data rows.'],
    };
  }

  const rawHeaders = parseCsvLine(lines[0]);
  const headers = rawHeaders.map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));

  // Detect agency type from headers
  let agencyType: RemittanceAgencyType = 'ALL';
  const headerStr = headers.join(' ');
  if (headerStr.includes('wisp') || (headerStr.includes('ss') && !headerStr.includes('philhealth') && !headerStr.includes('pagibig'))) {
    agencyType = 'SSS';
  } else if (headerStr.includes('philhealth') && !headerStr.includes('sss') && !headerStr.includes('pagibig')) {
    agencyType = 'PHILHEALTH';
  } else if ((headerStr.includes('pagibig') || headerStr.includes('hdmf')) && !headerStr.includes('sss') && !headerStr.includes('philhealth')) {
    agencyType = 'PAGIBIG';
  }

  // Column Index Resolvers
  const findCol = (keywords: string[]): number => {
    return headers.findIndex(h => keywords.some(k => h.includes(k)));
  };

  const colEmpId = findCol(['employeeid', 'empid', 'id']);
  const colName = findCol(['name', 'employeename', 'fullname']);
  const colDept = findCol(['department', 'dept']);
  const colSalary = findCol(['salary', 'basicsalary', 'monthlycompensation', 'msc', 'compensation']);
  const colMonth = findCol(['period', 'month', 'periodmonth']);

  const colSssNumber = findCol(['sssnumber', 'ssnumber', 'sssid', 'sssno']);
  const colPhNumber = findCol(['philhealthnumber', 'philhealthpin', 'phnumber', 'pin']);
  const colHdmfNumber = findCol(['pagibignumber', 'pagibigmid', 'hdmfnumber', 'mid']);
  const colTin = findCol(['tin', 'taxpayerid']);

  const colSssEE = findCol(['sssee', 'ssemployee', 'socialsecurityee', 'ssseededucted']);
  const colSssER = findCol(['ssser', 'ssemployer', 'socialsecurityer', 'ssserremitted']);
  const colPhEE = findCol(['philhealthee', 'phee', 'philhealtheededucted', 'employeeshare25']);
  const colPhER = findCol(['philhealther', 'pher', 'philhealtherremitted', 'employershare25']);
  const colHdmfEE = findCol(['pagibigee', 'hdmfee', 'pagibigeededucted', 'pagibigcircular460']);
  const colHdmfER = findCol(['pagibiger', 'hdmfer', 'pagibigerremitted']);

  const rows: BulkRemittanceRowItem[] = [];
  let totalUploaded = 0;
  let totalExpected = 0;
  let matchedCount = 0;
  let varianceCount = 0;
  let missingIdCount = 0;

  for (let i = 1; i < lines.length; i++) {
    const rawCols = parseCsvLine(lines[i]);
    if (rawCols.length < 2 || rawCols.every(c => c === '')) continue;

    const rowNumber = i;
    const employeeId = colEmpId >= 0 ? rawCols[colEmpId] : `EMP-${i}`;
    const employeeName = colName >= 0 ? rawCols[colName] : `Employee #${i}`;
    const department = colDept >= 0 ? rawCols[colDept] : 'General';
    const periodMonth = colMonth >= 0 && rawCols[colMonth] ? rawCols[colMonth] : defaultMonth;

    // Match with existing registry
    const matchedEmployee = employees.find(e => {
      if (employeeId && e.id.toLowerCase() === employeeId.toLowerCase()) return true;
      const fullName = `${e.firstName} ${e.lastName}`.toLowerCase();
      if (employeeName && fullName.includes(employeeName.toLowerCase())) return true;
      if (colSssNumber >= 0 && rawCols[colSssNumber] && e.sssNumber.replace(/[^0-9]/g, '') === rawCols[colSssNumber].replace(/[^0-9]/g, '')) return true;
      if (colPhNumber >= 0 && rawCols[colPhNumber] && e.philhealthNumber.replace(/[^0-9]/g, '') === rawCols[colPhNumber].replace(/[^0-9]/g, '')) return true;
      if (colHdmfNumber >= 0 && rawCols[colHdmfNumber] && e.pagibigNumber.replace(/[^0-9]/g, '') === rawCols[colHdmfNumber].replace(/[^0-9]/g, '')) return true;
      return false;
    });

    const basicSalary = cleanNumeric(
      colSalary >= 0 && rawCols[colSalary] ? rawCols[colSalary] : matchedEmployee?.basicSalary || 30000
    );

    const sssNumber = colSssNumber >= 0 && rawCols[colSssNumber] ? rawCols[colSssNumber] : matchedEmployee?.sssNumber || '04-0000000-0';
    const philhealthNumber = colPhNumber >= 0 && rawCols[colPhNumber] ? rawCols[colPhNumber] : matchedEmployee?.philhealthNumber || '12-000000000-0';
    const pagibigNumber = colHdmfNumber >= 0 && rawCols[colHdmfNumber] ? rawCols[colHdmfNumber] : matchedEmployee?.pagibigNumber || '0000-0000-0000';
    const tin = colTin >= 0 && rawCols[colTin] ? rawCols[colTin] : matchedEmployee?.tin || '000-000-000-000';

    // Calculate Statutory Mandatory Figures based on basicSalary
    const sssCalc = calculateSSS(basicSalary);
    const phCalc = calculatePhilHealth(basicSalary);
    const hdmfCalc = calculatePagIBIG(basicSalary);

    // Parse Uploaded Remittance Values (default to expected if agency file didn't include other agencies)
    let uploadedSssEE = colSssEE >= 0 ? cleanNumeric(rawCols[colSssEE]) : (agencyType === 'ALL' || agencyType === 'SSS' ? 0 : sssCalc.totalEE);
    let uploadedSssER = colSssER >= 0 ? cleanNumeric(rawCols[colSssER]) : (agencyType === 'ALL' || agencyType === 'SSS' ? 0 : sssCalc.totalER);

    let uploadedPhEE = colPhEE >= 0 ? cleanNumeric(rawCols[colPhEE]) : (agencyType === 'ALL' || agencyType === 'PHILHEALTH' ? 0 : phCalc.eeShare);
    let uploadedPhER = colPhER >= 0 ? cleanNumeric(rawCols[colPhER]) : (agencyType === 'ALL' || agencyType === 'PHILHEALTH' ? 0 : phCalc.erShare);

    let uploadedHdmfEE = colHdmfEE >= 0 ? cleanNumeric(rawCols[colHdmfEE]) : (agencyType === 'ALL' || agencyType === 'PAGIBIG' ? 0 : hdmfCalc.eeShare);
    let uploadedHdmfER = colHdmfER >= 0 ? cleanNumeric(rawCols[colHdmfER]) : (agencyType === 'ALL' || agencyType === 'PAGIBIG' ? 0 : hdmfCalc.erShare);

    // If single agency was uploaded, keep other agency expectations aligned
    if (agencyType === 'SSS') {
      uploadedPhEE = phCalc.eeShare;
      uploadedPhER = phCalc.erShare;
      uploadedHdmfEE = hdmfCalc.eeShare;
      uploadedHdmfER = hdmfCalc.erShare;
    } else if (agencyType === 'PHILHEALTH') {
      uploadedSssEE = sssCalc.totalEE;
      uploadedSssER = sssCalc.totalER;
      uploadedHdmfEE = hdmfCalc.eeShare;
      uploadedHdmfER = hdmfCalc.erShare;
    } else if (agencyType === 'PAGIBIG') {
      uploadedSssEE = sssCalc.totalEE;
      uploadedSssER = sssCalc.totalER;
      uploadedPhEE = phCalc.eeShare;
      uploadedPhER = phCalc.erShare;
    }

    // Variances against statutory rules
    const sssVarianceEE = +(uploadedSssEE - sssCalc.totalEE).toFixed(2);
    const sssVarianceER = +(uploadedSssER - sssCalc.totalER).toFixed(2);
    const phVarianceEE = +(uploadedPhEE - phCalc.eeShare).toFixed(2);
    const phVarianceER = +(uploadedPhER - phCalc.erShare).toFixed(2);
    const hdmfVarianceEE = +(uploadedHdmfEE - hdmfCalc.eeShare).toFixed(2);
    const hdmfVarianceER = +(uploadedHdmfER - hdmfCalc.erShare).toFixed(2);

    // Check government ID validity
    const sssVal = validateGovernmentId(sssNumber, 'SSS');
    const phVal = validateGovernmentId(philhealthNumber, 'PHILHEALTH');
    const hdmfVal = validateGovernmentId(pagibigNumber, 'PAGIBIG');

    const notes: string[] = [];
    let sssStatus: 'MATCH' | 'VARIANCE' | 'MISSING_ID' = 'MATCH';
    let phStatus: 'MATCH' | 'VARIANCE' | 'MISSING_ID' = 'MATCH';
    let hdmfStatus: 'MATCH' | 'VARIANCE' | 'MISSING_ID' = 'MATCH';

    // Audit SSS
    if (!sssVal.isValid) {
      sssStatus = 'MISSING_ID';
      notes.push(`SSS ID invalid: ${sssVal.issue}`);
    } else if (Math.abs(sssVarianceEE) > 0.05 || Math.abs(sssVarianceER) > 0.05) {
      sssStatus = 'VARIANCE';
      const dir = sssVarianceEE > 0 ? 'Over' : 'Under';
      notes.push(`SSS Variance: ${dir}-deducted by ₱${Math.abs(sssVarianceEE).toFixed(2)} EE`);
    }

    // Audit PhilHealth
    if (!phVal.isValid) {
      phStatus = 'MISSING_ID';
      notes.push(`PhilHealth PIN invalid: ${phVal.issue}`);
    } else if (Math.abs(phVarianceEE) > 0.05 || Math.abs(phVarianceER) > 0.05) {
      phStatus = 'VARIANCE';
      const dir = phVarianceEE > 0 ? 'Over' : 'Under';
      notes.push(`PhilHealth Variance: ${dir}-deducted by ₱${Math.abs(phVarianceEE).toFixed(2)} EE`);
    }

    // Audit Pag-IBIG
    if (!hdmfVal.isValid) {
      hdmfStatus = 'MISSING_ID';
      notes.push(`Pag-IBIG MID invalid: ${hdmfVal.issue}`);
    } else if (Math.abs(hdmfVarianceEE) > 0.05 || Math.abs(hdmfVarianceER) > 0.05) {
      hdmfStatus = 'VARIANCE';
      const dir = hdmfVarianceEE > 0 ? 'Over' : 'Under';
      notes.push(`Pag-IBIG Variance: ${dir}-deducted by ₱${Math.abs(hdmfVarianceEE).toFixed(2)} EE`);
    }

    const rowUploadedTotal = uploadedSssEE + uploadedSssER + uploadedPhEE + uploadedPhER + uploadedHdmfEE + uploadedHdmfER;
    const rowExpectedTotal = sssCalc.totalEE + sssCalc.totalER + phCalc.eeShare + phCalc.erShare + hdmfCalc.eeShare + hdmfCalc.erShare;
    const totalVariance = +(rowUploadedTotal - rowExpectedTotal).toFixed(2);

    let status: 'MATCH' | 'VARIANCE' | 'MISSING_ID' | 'ERROR' = 'MATCH';
    if (!sssVal.isValid || !phVal.isValid || !hdmfVal.isValid) {
      status = 'MISSING_ID';
      missingIdCount++;
    } else if (Math.abs(totalVariance) > 0.05) {
      status = 'VARIANCE';
      varianceCount++;
    } else {
      matchedCount++;
    }

    totalUploaded += rowUploadedTotal;
    totalExpected += rowExpectedTotal;

    rows.push({
      rowNumber,
      employeeId: matchedEmployee?.id || employeeId,
      employeeName: matchedEmployee ? `${matchedEmployee.firstName} ${matchedEmployee.lastName}` : employeeName,
      department: matchedEmployee?.department || department,
      role: matchedEmployee?.role || 'Staff Member',
      basicSalary,
      periodMonth,
      tin,
      sssNumber,
      philhealthNumber,
      pagibigNumber,

      uploadedSssEE,
      uploadedSssER,
      expectedSssEE: sssCalc.totalEE,
      expectedSssER: sssCalc.totalER,
      sssVarianceEE,
      sssVarianceER,
      sssStatus,

      uploadedPhEE,
      uploadedPhER,
      expectedPhEE: phCalc.eeShare,
      expectedPhER: phCalc.erShare,
      phVarianceEE,
      phVarianceER,
      phStatus,

      uploadedHdmfEE,
      uploadedHdmfER,
      expectedHdmfEE: hdmfCalc.eeShare,
      expectedHdmfER: hdmfCalc.erShare,
      hdmfVarianceEE,
      hdmfVarianceER,
      hdmfStatus,

      uploadedTotalRemittance: rowUploadedTotal,
      expectedTotalRemittance: rowExpectedTotal,
      totalVariance,
      status,
      notes,
    });
  }

  const netVariance = +(totalUploaded - totalExpected).toFixed(2);

  return {
    agencyType,
    periodMonth: defaultMonth,
    totalRows: rows.length,
    matchedCount,
    varianceCount,
    missingIdCount,
    totalUploadedRemittance: totalUploaded,
    totalExpectedRemittance: totalExpected,
    netVariance,
    rows,
    errors,
  };
}

/**
 * Automatically corrects all uploaded row amounts to the exact statutory bracket amounts
 */
export function autoCorrectRowsToStatutory(rows: BulkRemittanceRowItem[]): BulkRemittanceRowItem[] {
  return rows.map(r => ({
    ...r,
    uploadedSssEE: r.expectedSssEE,
    uploadedSssER: r.expectedSssER,
    sssVarianceEE: 0,
    sssVarianceER: 0,
    sssStatus: r.sssStatus === 'MISSING_ID' ? 'MISSING_ID' : 'MATCH',

    uploadedPhEE: r.expectedPhEE,
    uploadedPhER: r.expectedPhER,
    phVarianceEE: 0,
    phVarianceER: 0,
    phStatus: r.phStatus === 'MISSING_ID' ? 'MISSING_ID' : 'MATCH',

    uploadedHdmfEE: r.expectedHdmfEE,
    uploadedHdmfER: r.expectedHdmfER,
    hdmfVarianceEE: 0,
    hdmfVarianceER: 0,
    hdmfStatus: r.hdmfStatus === 'MISSING_ID' ? 'MISSING_ID' : 'MATCH',

    uploadedTotalRemittance: r.expectedTotalRemittance,
    totalVariance: 0,
    status: r.status === 'MISSING_ID' ? 'MISSING_ID' : 'MATCH',
    notes: r.notes.filter(n => !n.includes('Variance')).concat(['Auto-corrected to official statutory bracket schedule']),
  }));
}

/**
 * Exports discrepancy & variance audit report
 */
export function generateVarianceAuditCsv(result: BulkRemittanceParseResult): string {
  const headers = [
    'Row',
    'Employee ID',
    'Employee Name',
    'Basic Salary',
    'Uploaded Remittance (PHP)',
    'Statutory Expected (PHP)',
    'Variance Delta (PHP)',
    'Status',
    'SSS Variance (EE/ER)',
    'PhilHealth Variance (EE/ER)',
    'Pag-IBIG Variance (EE/ER)',
    'Audit Notes'
  ];

  const rows = result.rows.map(r => [
    r.rowNumber,
    `"${r.employeeId}"`,
    `"${r.employeeName}"`,
    r.basicSalary.toFixed(2),
    r.uploadedTotalRemittance.toFixed(2),
    r.expectedTotalRemittance.toFixed(2),
    r.totalVariance.toFixed(2),
    `"${r.status}"`,
    `"EE: ${r.sssVarianceEE >= 0 ? '+' : ''}${r.sssVarianceEE.toFixed(2)} / ER: ${r.sssVarianceER >= 0 ? '+' : ''}${r.sssVarianceER.toFixed(2)}"`,
    `"EE: ${r.phVarianceEE >= 0 ? '+' : ''}${r.phVarianceEE.toFixed(2)} / ER: ${r.phVarianceER >= 0 ? '+' : ''}${r.phVarianceER.toFixed(2)}"`,
    `"EE: ${r.hdmfVarianceEE >= 0 ? '+' : ''}${r.hdmfVarianceEE.toFixed(2)} / ER: ${r.hdmfVarianceER >= 0 ? '+' : ''}${r.hdmfVarianceER.toFixed(2)}"`,
    `"${r.notes.join('; ') || 'No discrepancies found'}"`
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
}

/**
 * Merges uploaded reconciled remittance items into an OverallStatutoryAuditReport
 */
export function applyBulkRemittanceToAuditReport(
  baseReport: any,
  uploadResult: BulkRemittanceParseResult
): any {
  // Map rows into EmployeeComplianceRecord format
  const updatedRecords = baseReport.records.map((origRec: any) => {
    const uploaded = uploadResult.rows.find(
      r => r.employeeId === origRec.employeeId || r.employeeName.toLowerCase() === origRec.employeeName.toLowerCase()
    );
    if (!uploaded) return origRec;

    const issues = [...uploaded.notes];
    let overallStatus = 'COMPLIANT';
    if (uploaded.status === 'MISSING_ID') {
      overallStatus = 'MISSING_ID';
    } else if (uploaded.status === 'VARIANCE') {
      overallStatus = 'WARNING';
    }

    const sssStatus = uploaded.sssStatus === 'MISSING_ID' ? 'MISSING_ID' : uploaded.sssStatus === 'VARIANCE' ? 'WARNING' : 'COMPLIANT';
    const phStatus = uploaded.phStatus === 'MISSING_ID' ? 'MISSING_ID' : uploaded.phStatus === 'VARIANCE' ? 'WARNING' : 'COMPLIANT';
    const hdmfStatus = uploaded.hdmfStatus === 'MISSING_ID' ? 'MISSING_ID' : uploaded.hdmfStatus === 'VARIANCE' ? 'WARNING' : 'COMPLIANT';

    const sssTotalEE = uploaded.uploadedSssEE;
    const sssTotalER = uploaded.uploadedSssER;
    const phEE = uploaded.uploadedPhEE;
    const phER = uploaded.uploadedPhER;
    const hdmfEE = uploaded.uploadedHdmfEE;
    const hdmfER = uploaded.uploadedHdmfER;

    const totalEE = sssTotalEE + phEE + hdmfEE;
    const totalER = sssTotalER + phER + hdmfER;
    const totalDue = totalEE + totalER;

    return {
      ...origRec,
      sssTotalEE,
      sssTotalER,
      sssGrandTotal: sssTotalEE + sssTotalER,
      sssStatus,
      sssNotes: uploaded.sssVarianceEE !== 0 ? `Uploaded ₱${sssTotalEE.toFixed(2)} EE (Variance: ${uploaded.sssVarianceEE > 0 ? '+' : ''}₱${uploaded.sssVarianceEE.toFixed(2)})` : origRec.sssNotes,

      philhealthEE: phEE,
      philhealthER: phER,
      philhealthTotal: phEE + phER,
      philhealthStatus: phStatus,
      philhealthNotes: uploaded.phVarianceEE !== 0 ? `Uploaded ₱${phEE.toFixed(2)} EE (Variance: ${uploaded.phVarianceEE > 0 ? '+' : ''}₱${uploaded.phVarianceEE.toFixed(2)})` : origRec.philhealthNotes,

      pagibigEE: hdmfEE,
      pagibigER: hdmfER,
      pagibigTotal: hdmfEE + hdmfER,
      pagibigStatus: hdmfStatus,
      pagibigNotes: uploaded.hdmfVarianceEE !== 0 ? `Uploaded ₱${hdmfEE.toFixed(2)} EE (Variance: ${uploaded.hdmfVarianceEE > 0 ? '+' : ''}₱${uploaded.hdmfVarianceEE.toFixed(2)})` : origRec.pagibigNotes,

      totalEmployeeDeductions: totalEE,
      totalEmployerContributions: totalER,
      totalRemittanceDue: totalDue,
      overallStatus,
      complianceIssues: issues,
    };
  });

  const compliantCount = updatedRecords.filter((r: any) => r.overallStatus === 'COMPLIANT').length;
  const warningCount = updatedRecords.filter((r: any) => r.overallStatus === 'WARNING').length;
  const missingIdCount = updatedRecords.filter((r: any) => r.overallStatus === 'MISSING_ID').length;
  const complianceScorePercent = updatedRecords.length > 0 ? Math.round((compliantCount / updatedRecords.length) * 100) : 100;

  const totalEmployeeDeductions = updatedRecords.reduce((acc: number, r: any) => acc + r.totalEmployeeDeductions, 0);
  const totalEmployerContributions = updatedRecords.reduce((acc: number, r: any) => acc + r.totalEmployerContributions, 0);
  const totalGovernmentRemittanceDue = totalEmployeeDeductions + totalEmployerContributions;

  // Recompute agency summaries
  const sssTotalEE = updatedRecords.reduce((acc: number, r: any) => acc + r.sssTotalEE, 0);
  const sssTotalER = updatedRecords.reduce((acc: number, r: any) => acc + r.sssTotalER, 0);
  const phTotalEE = updatedRecords.reduce((acc: number, r: any) => acc + r.philhealthEE, 0);
  const phTotalER = updatedRecords.reduce((acc: number, r: any) => acc + r.philhealthER, 0);
  const hdmfTotalEE = updatedRecords.reduce((acc: number, r: any) => acc + r.pagibigEE, 0);
  const hdmfTotalER = updatedRecords.reduce((acc: number, r: any) => acc + r.pagibigER, 0);

  const agencySummaries = baseReport.agencySummaries.map((s: any) => {
    if (s.agency === 'SSS') {
      return {
        ...s,
        totalEE: sssTotalEE,
        totalER: sssTotalER,
        grandTotal: sssTotalEE + sssTotalER,
        compliantCount: updatedRecords.filter((r: any) => r.sssStatus === 'COMPLIANT').length,
        flaggedCount: updatedRecords.filter((r: any) => r.sssStatus !== 'COMPLIANT').length,
      };
    }
    if (s.agency === 'PHILHEALTH') {
      return {
        ...s,
        totalEE: phTotalEE,
        totalER: phTotalER,
        grandTotal: phTotalEE + phTotalER,
        compliantCount: updatedRecords.filter((r: any) => r.philhealthStatus === 'COMPLIANT').length,
        flaggedCount: updatedRecords.filter((r: any) => r.philhealthStatus !== 'COMPLIANT').length,
      };
    }
    if (s.agency === 'PAGIBIG') {
      return {
        ...s,
        totalEE: hdmfTotalEE,
        totalER: hdmfTotalER,
        grandTotal: hdmfTotalEE + hdmfTotalER,
        compliantCount: updatedRecords.filter((r: any) => r.pagibigStatus === 'COMPLIANT').length,
        flaggedCount: updatedRecords.filter((r: any) => r.pagibigStatus !== 'COMPLIANT').length,
      };
    }
    return s;
  });

  return {
    ...baseReport,
    compliantCount,
    warningCount,
    missingIdCount,
    complianceScorePercent,
    totalEmployeeDeductions,
    totalEmployerContributions,
    totalGovernmentRemittanceDue,
    agencySummaries,
    records: updatedRecords,
  };
}
