/**
 * BIR Form No. 2307 (Certificate of Creditable Tax Withheld at Source)
 * Compliant with:
 * - National Internal Revenue Code (NIRC) of 1997, as amended by RA 10963 (TRAIN Law)
 * - Revenue Regulations (RR) No. 2-98 as amended by RR No. 11-2018 (Expanded Withholding Tax)
 * - BIR Form No. 2307 (Revised January 2018 - ENCS)
 */

export interface AtcDefinition {
  code: string;
  category: 'Individual' | 'Corporate';
  description: string;
  defaultRate: number; // e.g. 0.05 for 5%
  nature: string;
}

export const ATC_CODES: AtcDefinition[] = [
  {
    code: 'WI010',
    category: 'Individual',
    description: 'Professional / Talent fees paid to individual professionals (gross <= ₱3M with sworn declaration)',
    defaultRate: 0.05,
    nature: 'Professional Fees - Individual (5%)',
  },
  {
    code: 'WI011',
    category: 'Individual',
    description: 'Professional / Talent fees paid to individual professionals (gross > ₱3M or without sworn declaration)',
    defaultRate: 0.10,
    nature: 'Professional Fees - Individual (10%)',
  },
  {
    code: 'WC010',
    category: 'Corporate',
    description: 'Professional fees paid to juridical persons / corporations (gross <= ₱720k)',
    defaultRate: 0.10,
    nature: 'Professional Fees - Juridical (10%)',
  },
  {
    code: 'WC011',
    category: 'Corporate',
    description: 'Professional fees paid to juridical persons / corporations (gross > ₱720k)',
    defaultRate: 0.15,
    nature: 'Professional Fees - Juridical (15%)',
  },
  {
    code: 'WI157',
    category: 'Individual',
    description: 'Income payments to contractors / sub-contractors (Individual service providers)',
    defaultRate: 0.02,
    nature: 'Contractors / Subcontractors - Individual (2%)',
  },
  {
    code: 'WC157',
    category: 'Corporate',
    description: 'Income payments to contractors / sub-contractors (Corporate entities)',
    defaultRate: 0.02,
    nature: 'Contractors / Subcontractors - Corporate (2%)',
  },
  {
    code: 'WI158',
    category: 'Individual',
    description: 'Rental of real or personal property (Individual lessor)',
    defaultRate: 0.05,
    nature: 'Rental of Real/Personal Property - Individual (5%)',
  },
  {
    code: 'WC158',
    category: 'Corporate',
    description: 'Rental of real or personal property (Corporate lessor)',
    defaultRate: 0.05,
    nature: 'Rental of Real/Personal Property - Corporate (5%)',
  },
  {
    code: 'WI050',
    category: 'Individual',
    description: 'Director\'s fees paid to individuals not acting as regular employees',
    defaultRate: 0.10,
    nature: 'Director\'s Fees / Allowances (10%)',
  },
  {
    code: 'WI640',
    category: 'Individual',
    description: 'Income payments made by Top Withholding Agents (TWA) to local suppliers of services (Individual)',
    defaultRate: 0.02,
    nature: 'TWA - Local Supplier of Services (2%)',
  },
  {
    code: 'WC640',
    category: 'Corporate',
    description: 'Income payments made by Top Withholding Agents (TWA) to local suppliers of services (Corporate)',
    defaultRate: 0.02,
    nature: 'TWA - Local Supplier of Services - Corporate (2%)',
  },
];

export interface Form2307LineItem {
  id: string;
  natureOfPayment: string;
  atcCode: string;
  month1Payment: number;
  month2Payment: number;
  month3Payment: number;
  taxRate: number; // e.g. 0.02, 0.05, 0.10
}

export interface ContractorPayee {
  id: string;
  tin: string; // 9 digits + 3 or 5 digit branch code
  type: 'Individual' | 'Non-Individual';
  name: string; // For corporate, full registered business name; for individual, Last, First Middle
  tradeName?: string;
  registeredAddress: string;
  zipCode: string;
  category: 'Professional Consultant' | 'Independent Contractor' | 'Corporate Supplier' | 'Property Lessor';
  defaultAtc: string;
  defaultMonthlyRetainer: number;
}

export interface Bir2307Data {
  formVersion: string;
  taxYear: number;
  periodQuarter: 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'Custom';
  periodFrom: string; // MM/DD/YYYY
  periodTo: string;   // MM/DD/YYYY

  // Payee Information (Part I)
  payeeTin: string;
  payeeType: 'Individual' | 'Non-Individual';
  payeeName: string;
  payeeTradeName?: string;
  payeeAddress: string;
  payeeZipCode: string;

  // Payor / Withholding Agent Information (Part II)
  payorTin: string;
  payorName: string;
  payorAddress: string;
  payorZipCode: string;

  // Line items (Part III)
  lineItems: Form2307LineItem[];

  // Signatory (Part IV)
  authorizedSignatory: string;
  signatoryTitle: string;
  signatoryTin: string;
  signingDate: string;
  digitalSignatureUrl?: string;
  verificationHash?: string;
}

export const DEFAULT_PAYOR = {
  tin: '009-876-543-00000',
  name: 'KAWAYAN HR PHILIPPINES INC.',
  address: 'High Street South Corporate Plaza, 26th St. cor. 11th Ave., BGC, Taguig City, Philippines',
  zipCode: '1634',
  signatory: 'Maria Clara',
  signatoryTitle: 'Finance & Tax Compliance Director',
  signatoryTin: '421-889-012-00000',
};

export const MOCK_CONTRACTORS: ContractorPayee[] = [
  {
    id: 'cont-001',
    tin: '245-819-304-00000',
    type: 'Individual',
    name: 'Reyes, Danica S.',
    tradeName: 'D.S. Reyes OSH Consulting Services',
    registeredAddress: 'Unit 402 Cityland 10 Tower 1, H.V. Dela Costa, Salcedo Village, Makati City',
    zipCode: '1227',
    category: 'Professional Consultant',
    defaultAtc: 'WI010',
    defaultMonthlyRetainer: 45000,
  },
  {
    id: 'cont-002',
    tin: '189-472-831-00000',
    type: 'Individual',
    name: 'Santos, Rodrigo P.',
    tradeName: 'Atty. Rodrigo Santos Legal Retainer',
    registeredAddress: '15th Floor Ayala Life-FGU Center, Ayala Avenue, Makati City',
    zipCode: '1226',
    category: 'Professional Consultant',
    defaultAtc: 'WI011',
    defaultMonthlyRetainer: 75000,
  },
  {
    id: 'cont-003',
    tin: '008-912-456-00000',
    type: 'Non-Individual',
    name: 'TECHCRAFT CLOUD IT SOLUTIONS INC.',
    tradeName: 'TechCraft Philippines',
    registeredAddress: '8th Floor Cyberpark Tower 1, Araneta City, Cubao, Quezon City',
    zipCode: '1109',
    category: 'Independent Contractor',
    defaultAtc: 'WC157',
    defaultMonthlyRetainer: 120000,
  },
  {
    id: 'cont-004',
    tin: '004-321-987-00000',
    type: 'Non-Individual',
    name: 'APEX INTEGRATED FACILITIES & JANITORIAL SERVICES CORP.',
    tradeName: 'Apex Facilities',
    registeredAddress: 'Km. 19 West Service Road, Sun Valley, Parañaque City',
    zipCode: '1700',
    category: 'Independent Contractor',
    defaultAtc: 'WC157',
    defaultMonthlyRetainer: 68000,
  },
  {
    id: 'cont-005',
    tin: '001-765-432-00000',
    type: 'Non-Individual',
    name: 'FORT BONIFACIO COMMERCIAL PROPERTIES INC.',
    tradeName: 'High Street South Plaza Leasing',
    registeredAddress: '28th Street cor. 4th Ave, Bonifacio Global City, Taguig City',
    zipCode: '1634',
    category: 'Property Lessor',
    defaultAtc: 'WC158',
    defaultMonthlyRetainer: 185000,
  },
];

export function getQuarterDates(quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4', year: number) {
  switch (quarter) {
    case 'Q1':
      return { from: `01/01/${year}`, to: `03/31/${year}`, months: ['January', 'February', 'March'] };
    case 'Q2':
      return { from: `04/01/${year}`, to: `06/30/${year}`, months: ['April', 'May', 'June'] };
    case 'Q3':
      return { from: `07/01/${year}`, to: `09/30/${year}`, months: ['July', 'August', 'September'] };
    case 'Q4':
      return { from: `10/01/${year}`, to: `12/31/${year}`, months: ['October', 'November', 'December'] };
  }
}

export function computeLineItemTotals(item: Form2307LineItem) {
  const totalPayment = item.month1Payment + item.month2Payment + item.month3Payment;
  const taxWithheld = Math.round(totalPayment * item.taxRate * 100) / 100;
  return {
    totalPayment,
    taxWithheld,
  };
}

export function computeForm2307Totals(items: Form2307LineItem[]) {
  return items.reduce((acc, item) => {
    const { totalPayment, taxWithheld } = computeLineItemTotals(item);
    acc.month1Total += item.month1Payment;
    acc.month2Total += item.month2Payment;
    acc.month3Total += item.month3Payment;
    acc.grandTotalPayment += totalPayment;
    acc.grandTotalTaxWithheld += taxWithheld;
    return acc;
  }, {
    month1Total: 0,
    month2Total: 0,
    month3Total: 0,
    grandTotalPayment: 0,
    grandTotalTaxWithheld: 0,
  });
}

/**
 * Generates SAWT (Summary Alphanumeric Withholding Tax) CSV format for BIR submission
 */
export function generateSawtCsv(dataList: Bir2307Data[]): string {
  const headers = [
    'Sequence Number',
    'Taxpayer Identification Number (TIN)',
    'Payee Registered Name',
    'ATC Code',
    'Nature of Income Payment',
    'Tax Rate (%)',
    '1st Month Gross Payment',
    '2nd Month Gross Payment',
    '3rd Month Gross Payment',
    'Total Gross Income Payment',
    'Total Tax Withheld',
    'Quarter Period',
    'Tax Year',
    'Withholding Agent TIN'
  ];

  let seq = 1;
  const rows: string[][] = [];

  dataList.forEach(data => {
    data.lineItems.forEach(item => {
      const { totalPayment, taxWithheld } = computeLineItemTotals(item);
      rows.push([
        seq.toString(),
        data.payeeTin,
        data.payeeName,
        item.atcCode,
        item.natureOfPayment,
        (item.taxRate * 100).toFixed(1) + '%',
        item.month1Payment.toFixed(2),
        item.month2Payment.toFixed(2),
        item.month3Payment.toFixed(2),
        totalPayment.toFixed(2),
        taxWithheld.toFixed(2),
        data.periodQuarter,
        data.taxYear.toString(),
        data.payorTin,
      ]);
      seq++;
    });
  });

  const lines = [
    `"# BIR FORM 2307 - SAWT (Summary Alphanumeric Withholding Tax Schedule)"`,
    `"# Generated by KAWAYAN HR Compliance Engine"`,
    `"# Withholding Agent: ${DEFAULT_PAYOR.name} (TIN: ${DEFAULT_PAYOR.tin})"`,
    `"# Date Exported: ${new Date().toISOString()}"`,
    '',
    headers.map(h => `"${h}"`).join(','),
    ...rows.map(r => r.map(c => `"${c}"`).join(','))
  ];

  return lines.join('\r\n');
}
