/**
 * Philippine Employment Contracts & Labor Code Template Engine
 * Compliant with:
 * - Presidential Decree No. 442 (Labor Code of the Philippines)
 * - DOLE Department Order No. 174-17 (Legitimate Contracting)
 * - DOLE Department Order No. 147-15 (Due Process in Termination)
 * - Republic Act No. 11165 (Telecommuting Act of 2018)
 * - Republic Act No. 10173 (Data Privacy Act of 2012)
 * - Presidential Decree No. 851 (13th Month Pay Law)
 */

import { Employee } from '../types';

export type ContractTemplateType = 
  | 'regular' 
  | 'probationary' 
  | 'project' 
  | 'executive' 
  | 'consultant';

export interface ContractTemplateDefinition {
  id: ContractTemplateType;
  title: string;
  subtitle: string;
  laborCodeReference: string;
  description: string;
  defaultClauses: ContractClause[];
}

export interface ContractClause {
  id: string;
  clauseNumber: number;
  title: string;
  legalCitation: string;
  content: string;
  isMandatory: boolean;
  category: 
    | 'appointment' 
    | 'probation' 
    | 'compensation' 
    | 'hours' 
    | 'telecommuting' 
    | 'benefits' 
    | 'confidentiality' 
    | 'termination' 
    | 'due_process' 
    | 'general';
}

export interface ContractFormVariables {
  // Employee Info
  employeeId?: string;
  employeeName: string;
  employeeAddress: string;
  employeeEmail: string;
  employeeTin: string;
  employeeSss: string;
  employeePhilhealth: string;
  employeePagibig: string;
  
  // Job & Department
  position: string;
  department: string;
  reportingTo: string;
  startDate: string;
  endDate?: string;
  probationMonths: number;
  
  // Compensation & Working Hours
  basicSalaryMonthly: number;
  deMinimisAllowanceMonthly: number;
  payFrequency: string;
  workingHours: string;
  workArrangement: 'On-site' | 'Hybrid' | 'Remote';
  
  // Employer Details
  companyName: string;
  companyAddress: string;
  secRegistration: string;
  authorizedSignatory: string;
  signatoryTitle: string;
  signDate: string;
}

/**
 * Converts numbers to formal Philippine Pesos currency words for legal contracts
 * (e.g. 65000 -> "SIXTY-FIVE THOUSAND PESOS ONLY")
 */
export function numberToPhilippinePesosWords(amount: number): string {
  if (isNaN(amount) || amount === 0) return 'ZERO PESOS ONLY';

  const ones = [
    '', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE',
    'TEN', 'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN',
    'SEVENTEEN', 'EIGHTEEN', 'NINETEEN'
  ];
  const tens = [
    '', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY'
  ];

  function convertGroup(num: number): string {
    let result = '';
    if (num >= 100) {
      result += ones[Math.floor(num / 100)] + ' HUNDRED ';
      num %= 100;
    }
    if (num >= 20) {
      result += tens[Math.floor(num / 10)] + (num % 10 > 0 ? '-' + ones[num % 10] : '') + ' ';
    } else if (num > 0) {
      result += ones[num] + ' ';
    }
    return result.trim();
  }

  const integerPart = Math.floor(amount);
  const cents = Math.round((amount - integerPart) * 100);

  let words = '';
  const millions = Math.floor(integerPart / 1000000);
  const thousands = Math.floor((integerPart % 1000000) / 1000);
  const remainder = integerPart % 1000;

  if (millions > 0) {
    words += convertGroup(millions) + ' MILLION ';
  }
  if (thousands > 0) {
    words += convertGroup(thousands) + ' THOUSAND ';
  }
  if (remainder > 0) {
    words += convertGroup(remainder) + ' ';
  }

  words = words.trim() + ' PESOS';

  if (cents > 0) {
    words += ` AND ${cents}/100`;
  } else {
    words += ' ONLY';
  }

  return words;
}

/**
 * Default Contract Templates
 */
export const CONTRACT_TEMPLATES: Record<ContractTemplateType, ContractTemplateDefinition> = {
  regular: {
    id: 'regular',
    title: 'Regular Employment Agreement',
    subtitle: 'Standard Permanent Security of Tenure Contract',
    laborCodeReference: 'Labor Code Art. 295 [formerly Art. 280]',
    description: 'For permanent employees entitled to full security of tenure under Philippine law with regular statutory benefits, leaves, and standard due process.',
    defaultClauses: [
      {
        id: 'cl-appointment',
        clauseNumber: 1,
        title: 'Appointment & Scope of Work',
        legalCitation: 'Labor Code Art. 106 & Art. 295',
        category: 'appointment',
        isMandatory: true,
        content: `The EMPLOYER hereby employs the EMPLOYEE, and the EMPLOYEE hereby accepts employment with the EMPLOYER as {{POSITION}} under the {{DEPARTMENT}} Department, reporting directly to {{REPORTING_TO}}. The EMPLOYEE shall perform with utmost diligence and fidelity all duties inherent to this position, as well as such other tasks and responsibilities as the EMPLOYER may reasonably assign in the lawful exercise of its management prerogative.`
      },
      {
        id: 'cl-status',
        clauseNumber: 2,
        title: 'Employment Status & Security of Tenure',
        legalCitation: 'Labor Code Art. 295 (Regular Employment)',
        category: 'appointment',
        isMandatory: true,
        content: `The EMPLOYEE is engaged as a REGULAR EMPLOYEE of the COMPANY, effective {{START_DATE}}. The EMPLOYEE shall enjoy full security of tenure as guaranteed under the Philippine Constitution and the Labor Code of the Philippines, and may only be terminated for just or authorized causes as provided by law and after compliance with procedural due process.`
      },
      {
        id: 'cl-compensation',
        clauseNumber: 3,
        title: 'Compensation & Payment Frequency',
        legalCitation: 'Labor Code Art. 102 & Art. 103',
        category: 'compensation',
        isMandatory: true,
        content: `The EMPLOYER shall pay the EMPLOYEE a Monthly Basic Salary of {{BASIC_SALARY_WORDS}} (₱{{BASIC_SALARY_NUM}}), subject to statutory deductions mandated by Philippine laws (SSS, PhilHealth, Pag-IBIG, and Withholding Tax). Payment shall be disbursed {{PAY_FREQUENCY}}, directly to the EMPLOYEE's nominated corporate payroll bank account.`
      },
      {
        id: 'cl-allowance',
        clauseNumber: 4,
        title: 'De Minimis & Non-Taxable Allowances',
        legalCitation: 'BIR RR No. 11-2018 (TRAIN Law De Minimis Caps)',
        category: 'compensation',
        isMandatory: false,
        content: `In addition to the Monthly Basic Salary, the EMPLOYEE shall receive a monthly non-taxable De Minimis / Subsidy Allowance of ₱{{ALLOWANCE_AMOUNT}}, subject to compliance with the statutory ceiling promulgated by the Bureau of Internal Revenue (BIR).`
      },
      {
        id: 'cl-13th-month',
        clauseNumber: 5,
        title: 'Mandatory 13th Month Pay',
        legalCitation: 'Presidential Decree No. 851',
        category: 'benefits',
        isMandatory: true,
        content: `Pursuant to Presidential Decree No. 851, the EMPLOYEE shall receive a mandatory Thirteenth (13th) Month Pay equivalent to one-twelfth (1/12) of the total basic salary earned during the calendar year, which shall be disbursed to the EMPLOYEE on or before the twenty-fourth (24th) day of December of each calendar year.`
      },
      {
        id: 'cl-statutory',
        clauseNumber: 6,
        title: 'Mandatory Government Contributions & Leaves',
        legalCitation: 'RA 11199 (SSS), RA 11223 (PhilHealth), Pag-IBIG Circular 460 & Labor Code Art. 95',
        category: 'benefits',
        isMandatory: true,
        content: `The EMPLOYEE shall be enrolled in and covered by all mandatory social welfare programs including the Social Security System (SSS), Philippine Health Insurance Corporation (PhilHealth), and Home Development Mutual Fund (Pag-IBIG). Furthermore, after completing one (1) full year of service, the EMPLOYEE shall be entitled to an annual Service Incentive Leave (SIL) of at least five (5) days with full pay pursuant to Article 95 of the Labor Code, in addition to company-granted vacation and sick leave credits.`
      },
      {
        id: 'cl-hours',
        clauseNumber: 7,
        title: 'Hours of Work & Overtime',
        legalCitation: 'Labor Code Art. 83, 85 & 87',
        category: 'hours',
        isMandatory: true,
        content: `The EMPLOYEE shall render normal working hours of {{WORKING_HOURS}}, not exceeding eight (8) hours per day, inclusive of an unpaid mandatory one (1) hour meal interval pursuant to Article 85. Any work rendered in excess of eight (8) hours on a regular workday shall be pre-authorized and compensated with an additional overtime premium of at least twenty-five percent (25%) of the regular hourly rate.`
      },
      {
        id: 'cl-telecommuting',
        clauseNumber: 8,
        title: 'Work Arrangement & Telecommuting Act Compliance',
        legalCitation: 'Republic Act No. 11165 (Telecommuting Act of 2018)',
        category: 'telecommuting',
        isMandatory: true,
        content: `The EMPLOYEE's official work arrangement shall be {{WORK_ARRANGEMENT}}. In accordance with Republic Act No. 11165 (Telecommuting Act), telecommuting / remote personnel shall receive equal treatment, compensation, performance standards, data security safeguards, and career opportunities as employees working at the employer's premises.`
      },
      {
        id: 'cl-confidentiality',
        clauseNumber: 9,
        title: 'Confidentiality & Data Privacy Act of 2012',
        legalCitation: 'Republic Act No. 10173 (Data Privacy Act of 2012)',
        category: 'confidentiality',
        isMandatory: true,
        content: `The EMPLOYEE shall hold in strict confidence all proprietary data, trade secrets, business strategies, source codes, customer records, and employee personal information. The EMPLOYEE explicitly consents to the collection, processing, and retention of personal data necessary for employment administration pursuant to the Data Privacy Act of 2012.`
      },
      {
        id: 'cl-termination',
        clauseNumber: 10,
        title: 'Termination for Cause & Statutory Due Process',
        legalCitation: 'Labor Code Art. 297 & 298; DOLE D.O. 147-15',
        category: 'due_process',
        isMandatory: true,
        content: `The EMPLOYER may terminate this Agreement only upon just causes under Article 297 (serious misconduct, gross neglect of duty, fraud, willful disobedience) or authorized causes under Article 298 (retrenchment, redundancy, closure) of the Labor Code. In all cases, the statutory procedural due process—consisting of the First Written Notice to Explain (NTE), ample opportunity to be heard, and Final Written Notice of Decision—shall be observed.`
      },
      {
        id: 'cl-resignation',
        clauseNumber: 11,
        title: 'Voluntary Resignation Notice',
        legalCitation: 'Labor Code Art. 300',
        category: 'termination',
        isMandatory: true,
        content: `The EMPLOYEE may terminate this employment without cause by serving a written notice of resignation to the EMPLOYER at least thirty (30) days in advance, in accordance with Article 300 of the Labor Code, to ensure an orderly turnover of duties and company assets.`
      }
    ]
  },

  probationary: {
    id: 'probationary',
    title: 'Probationary Employment Agreement',
    subtitle: 'Standard 6-Month Evaluation Contract with Performance Standards',
    laborCodeReference: 'Labor Code Art. 296 [formerly Art. 281]',
    description: 'Mandatory contract for newly hired personnel subject to a trial period not exceeding six (6) months, with reasonable performance criteria explicitly communicated upon engagement.',
    defaultClauses: [
      {
        id: 'cl-prob-app',
        clauseNumber: 1,
        title: 'Probationary Engagement & Standards Communication',
        legalCitation: 'Labor Code Art. 296 [formerly Art. 281]',
        category: 'probation',
        isMandatory: true,
        content: `The EMPLOYER hereby engages the EMPLOYEE as a PROBATIONARY EMPLOYEE for the position of {{POSITION}} under the {{DEPARTMENT}} Department, commencing on {{START_DATE}} for a period of {{PROBATION_PERIOD_MONTHS}} months. The EMPLOYEE acknowledges that the reasonable standards for regularization—consisting of technical job competence, quality of output, adherence to company code of discipline, punctuality, and teamwork—have been made known and explained to the EMPLOYEE at the time of engagement.`
      },
      {
        id: 'cl-prob-eval',
        clauseNumber: 2,
        title: 'Periodic Performance Evaluations',
        legalCitation: 'DOLE Standard Guidelines on Probationary Employment',
        category: 'probation',
        isMandatory: true,
        content: `The EMPLOYEE's performance shall undergo formal evaluations at the end of the third (3rd) and fifth (5th) months of service. If the EMPLOYEE meets or exceeds the prescribed regularization standards, the EMPLOYER shall issue a formal Notice of Regularization prior to the expiration of the probationary period. Failure to meet these established standards shall be lawful ground for termination of probationary employment.`
      },
      {
        id: 'cl-prob-comp',
        clauseNumber: 3,
        title: 'Compensation & Deductions',
        legalCitation: 'Labor Code Art. 102 & P.D. 851',
        category: 'compensation',
        isMandatory: true,
        content: `During the probationary period, the EMPLOYEE shall receive a Monthly Basic Salary of {{BASIC_SALARY_WORDS}} (₱{{BASIC_SALARY_NUM}}), paid {{PAY_FREQUENCY}}, less statutory deductions (SSS, PhilHealth, Pag-IBIG, and withholding taxes). The EMPLOYEE is fully entitled to pro-rated 13th Month Pay under P.D. 851.`
      },
      {
        id: 'cl-prob-benefits',
        clauseNumber: 4,
        title: 'Statutory Coverage from Day One',
        legalCitation: 'Social Security Act & PhilHealth Rules',
        category: 'benefits',
        isMandatory: true,
        content: `The EMPLOYER shall immediately enroll the EMPLOYEE with SSS, PhilHealth, and Pag-IBIG effective on the first day of employment. Probationary status does not waive or delay mandatory social security coverage.`
      },
      {
        id: 'cl-prob-hours',
        clauseNumber: 5,
        title: 'Working Hours & Work Arrangement',
        legalCitation: 'Labor Code Art. 83 & RA 11165',
        category: 'hours',
        isMandatory: true,
        content: `The working schedule shall be {{WORKING_HOURS}} under an official {{WORK_ARRANGEMENT}} setup. Overtime work rendered beyond 8 hours shall be compensated with statutory overtime premiums.`
      },
      {
        id: 'cl-prob-terms',
        clauseNumber: 6,
        title: 'Termination Prior to Regularization',
        legalCitation: 'Labor Code Art. 296 & DOLE Regulations',
        category: 'termination',
        isMandatory: true,
        content: `The probationary employment may be terminated by the EMPLOYER at any time before the end of the probationary period for just cause, authorized cause, or for failure of the EMPLOYEE to qualify as a regular employee in accordance with reasonable standards made known at the time of engagement, upon written notice served to the EMPLOYEE.`
      }
    ]
  },

  project: {
    id: 'project',
    title: 'Project-Based Employment Contract',
    subtitle: 'Fixed Undertaking Contract (DOLE DO 147-15 & Brent Doctrine)',
    laborCodeReference: 'Labor Code Art. 295 & Brent School v. Zamora',
    description: 'For personnel hired for a specific undertaking or project with a predetermined completion date or scope, preventing unintended automatic regularization.',
    defaultClauses: [
      {
        id: 'cl-proj-scope',
        clauseNumber: 1,
        title: 'Specific Project Undertaking & Duration',
        legalCitation: 'Labor Code Art. 295 (Project Employment)',
        category: 'appointment',
        isMandatory: true,
        content: `The EMPLOYER engages the EMPLOYEE as a PROJECT-BASED {{POSITION}} specifically and exclusively for the undertaking designated as "{{DEPARTMENT}} Deliverables and Technical Execution". This contract shall commence on {{START_DATE}} and shall terminate automatically upon the completion of the project, or on {{END_DATE}}, whichever occurs earlier.`
      },
      {
        id: 'cl-proj-nature',
        clauseNumber: 2,
        title: 'Acknowledgment of Non-Regular Status',
        legalCitation: 'Brent School v. Zamora (181 SCRA 702)',
        category: 'appointment',
        isMandatory: true,
        content: `The EMPLOYEE knowingly, willingly, and voluntarily agrees that this employment is strictly project-based and co-terminus with the specific project. Completion of the project shall not entitle the EMPLOYEE to regular employment status or separation pay, unless otherwise mandated by special DOLE issuances.`
      },
      {
        id: 'cl-proj-comp',
        clauseNumber: 3,
        title: 'Project Compensation Package',
        legalCitation: 'Labor Code Art. 102 & P.D. 851',
        category: 'compensation',
        isMandatory: true,
        content: `For the duration of the project, the EMPLOYEE shall receive a Monthly Basic Compensation of {{BASIC_SALARY_WORDS}} (₱{{BASIC_SALARY_NUM}}), paid {{PAY_FREQUENCY}}, subject to statutory deductions (SSS, PhilHealth, Pag-IBIG, and Tax) and pro-rated 13th month pay.`
      },
      {
        id: 'cl-proj-dole-report',
        clauseNumber: 4,
        title: 'DOLE Project Termination Reporting',
        legalCitation: 'DOLE Department Order No. 147-15',
        category: 'termination',
        isMandatory: true,
        content: `Upon the completion of the project, the EMPLOYER shall file the mandatory Termination Report with the appropriate DOLE Regional or Field Office having jurisdiction over the workplace.`
      }
    ]
  },

  executive: {
    id: 'executive',
    title: 'Executive / Managerial Employment Agreement',
    subtitle: 'Managerial Prerogative & Article 82 Exemption Contract',
    laborCodeReference: 'Labor Code Art. 82 & Art. 219(m)',
    description: 'For managerial and executive personnel vested with powers to lay down and execute management policies, exempt from statutory overtime, night differential, and holiday pay.',
    defaultClauses: [
      {
        id: 'cl-exec-app',
        clauseNumber: 1,
        title: 'Executive Appointment & Fiduciary Duty',
        legalCitation: 'Labor Code Art. 219(m) & Revised Corporation Code',
        category: 'appointment',
        isMandatory: true,
        content: `The COMPANY appoints the EMPLOYEE as {{POSITION}}, who shall head the {{DEPARTMENT}} Department, reporting directly to the Board of Directors / Chief Executive Officer. The EMPLOYEE owes the highest fiduciary duty of honesty, loyalty, and diligence to the COMPANY.`
      },
      {
        id: 'cl-exec-art82',
        clauseNumber: 2,
        title: 'Exemption from Conditions of Employment (Article 82)',
        legalCitation: 'Labor Code of the Philippines Article 82',
        category: 'hours',
        isMandatory: true,
        content: `Pursuant to Article 82 of the Labor Code, managerial employees whose primary duty consists of the management of the establishment or a department thereof are EXEMPT from statutory provisions on maximum working hours, overtime premiums, night shift differential, holiday pay, and service incentive leaves. The executive compensation package fully incorporates and supersedes these benefits.`
      },
      {
        id: 'cl-exec-comp',
        clauseNumber: 3,
        title: 'Executive Compensation & Perquisites',
        legalCitation: 'Labor Code Art. 102 & BIR RR 11-2018',
        category: 'compensation',
        isMandatory: true,
        content: `The COMPANY shall pay the EXECUTIVE a Monthly Executive Salary of {{BASIC_SALARY_WORDS}} (₱{{BASIC_SALARY_NUM}}), disbursed {{PAY_FREQUENCY}}, plus discretionary executive allowances and statutory 13th month pay.`
      },
      {
        id: 'cl-exec-noncompete',
        clauseNumber: 4,
        title: 'Non-Compete & Non-Solicitation Covenants',
        legalCitation: 'Philippine Civil Code Art. 1306 & Century Properties Doctrine',
        category: 'confidentiality',
        isMandatory: true,
        content: `During employment and for a period of one (1) year following separation, the EXECUTIVE shall not directly or indirectly engage in, establish, or advise any enterprise that directly competes with the COMPANY within the Republic of the Philippines, nor solicit employees or clients of the COMPANY.`
      }
    ]
  },

  consultant: {
    id: 'consultant',
    title: 'Independent Contractor / Professional Services Agreement',
    subtitle: 'Civil Code Contract of Service (Subject to BIR Form 2307 EWT)',
    laborCodeReference: 'Civil Code Art. 1713 & BIR RR 11-2018',
    description: 'For independent specialists, legal/technical consultants, and professional retainers without employer-employee relationship, subject to creditable expanded withholding tax.',
    defaultClauses: [
      {
        id: 'cl-cons-nature',
        clauseNumber: 1,
        title: 'Independent Contractor Relationship (No Employer-Employee Relationship)',
        legalCitation: 'Philippine Civil Code Art. 1713 & Four-Fold Test',
        category: 'appointment',
        isMandatory: true,
        content: `The relationship between the PRINCIPAL and the CONSULTANT is strictly that of independent contracting pursuant to the Civil Code of the Philippines. Nothing herein shall be construed as creating an employer-employee relationship. The PRINCIPAL exercises no control over the means and methods utilized by the CONSULTANT, but only over the desired end results.`
      },
      {
        id: 'cl-cons-fee',
        clauseNumber: 2,
        title: 'Professional Retainer Fee & Withholding Tax (BIR Form 2307)',
        legalCitation: 'National Internal Revenue Code & BIR RR 11-2018',
        category: 'compensation',
        isMandatory: true,
        content: `The PRINCIPAL shall pay the CONSULTANT a Monthly Professional Retainer Fee of {{BASIC_SALARY_WORDS}} (₱{{BASIC_SALARY_NUM}}), subject to Expanded Withholding Tax (EWT: ATC WI010 / WC010). The PRINCIPAL shall issue the official BIR Form No. 2307 (Certificate of Creditable Tax Withheld at Source) on a quarterly basis.`
      },
      {
        id: 'cl-cons-taxes',
        clauseNumber: 3,
        title: 'Self-Employed Statutory Responsibilities',
        legalCitation: 'NIRC Sec. 24 & Social Security Act Sec. 9-A',
        category: 'compensation',
        isMandatory: true,
        content: `As an independent professional, the CONSULTANT is solely responsible for filing their own quarterly and annual income tax returns (BIR Form 1701/1701A), percentage tax / VAT returns, and remitting self-employed SSS, PhilHealth, and Pag-IBIG contributions.`
      }
    ]
  }
};

/**
 * Builds standard placeholders map for replacement
 */
export function buildPlaceholderMap(
  data: ContractFormVariables
): Record<string, string> {
  const words = numberToPhilippinePesosWords(data.basicSalaryMonthly);
  const numStr = (data.basicSalaryMonthly || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  const allowanceStr = (data.deMinimisAllowanceMonthly || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  return {
    '{{EMPLOYEE_NAME}}': data.employeeName || 'JUAN DELA CRUZ',
    '{{EMPLOYEE_ADDRESS}}': data.employeeAddress || 'Metro Manila, Philippines',
    '{{EMPLOYEE_EMAIL}}': data.employeeEmail || 'employee@kawayanhr.ph',
    '{{EMPLOYEE_TIN}}': data.employeeTin || '000-000-000-000',
    '{{EMPLOYEE_SSS}}': data.employeeSss || '00-0000000-0',
    '{{EMPLOYEE_PHILHEALTH}}': data.employeePhilhealth || '00-000000000-0',
    '{{EMPLOYEE_PAGIBIG}}': data.employeePagibig || '0000-0000-0000',
    
    '{{POSITION}}': data.position || 'Software Engineer',
    '{{DEPARTMENT}}': data.department || 'Engineering',
    '{{REPORTING_TO}}': data.reportingTo || 'Department Head',
    '{{START_DATE}}': data.startDate || new Date().toISOString().split('T')[0],
    '{{END_DATE}}': data.endDate || 'Project Completion',
    '{{PROBATION_PERIOD_MONTHS}}': String(data.probationMonths || 6),

    '{{BASIC_SALARY_NUM}}': numStr,
    '{{BASIC_SALARY_WORDS}}': words,
    '{{ALLOWANCE_AMOUNT}}': allowanceStr,
    '{{PAY_FREQUENCY}}': data.payFrequency || 'semi-monthly on the 15th and 30th/31st of each month',
    '{{WORKING_HOURS}}': data.workingHours || 'Monday through Friday, 8:00 AM to 5:00 PM with a 1-hour unpaid meal interval',
    '{{WORK_ARRANGEMENT}}': data.workArrangement || 'Hybrid Work Arrangement',

    '{{COMPANY_NAME}}': data.companyName || 'KAWAYAN HR PHILIPPINES INC.',
    '{{COMPANY_ADDRESS}}': data.companyAddress || 'Unit 1402, High Street South Corporate Plaza, BGC, Taguig City, Philippines',
    '{{SEC_REGISTRATION}}': data.secRegistration || 'SEC Reg. No. CS2021-08912',
    '{{AUTHORIZED_SIGNATORY}}': data.authorizedSignatory || 'Maria Clara De Los Santos',
    '{{SIGNATORY_TITLE}}': data.signatoryTitle || 'HR & Labor Compliance Director',
    '{{SIGN_DATE}}': data.signDate || new Date().toISOString().split('T')[0],
  };
}

/**
 * Compiles a clause by replacing all placeholders
 */
export function compileClause(
  clauseContent: string, 
  placeholders: Record<string, string>
): string {
  let result = clauseContent;
  for (const [tag, val] of Object.entries(placeholders)) {
    result = result.split(tag).join(val);
  }
  return result;
}

/**
 * Populates initial contract form variables from an Employee in the Registry
 */
export function createVariablesFromEmployee(
  emp: Employee,
  signatoryName: string = 'Maria Clara De Los Santos',
  signatoryTitle: string = 'HR & Labor Compliance Director'
): ContractFormVariables {
  return {
    employeeId: emp.id,
    employeeName: `${emp.firstName} ${emp.lastName}`.trim(),
    employeeAddress: `${emp.department} Division, Metro Manila, Philippines`,
    employeeEmail: emp.email,
    employeeTin: emp.tin || '123-456-789-000',
    employeeSss: emp.sssNumber || '04-1234567-8',
    employeePhilhealth: emp.philhealthNumber || '12-345678901-2',
    employeePagibig: emp.pagibigNumber || '1234-5678-9012',
    
    position: emp.role,
    department: emp.department,
    reportingTo: emp.department === 'Human Resources' ? 'Chief Executive Officer' : 'HR & Department Director',
    startDate: emp.joinDate || new Date().toISOString().split('T')[0],
    probationMonths: 6,
    
    basicSalaryMonthly: emp.basicSalary || 45000,
    deMinimisAllowanceMonthly: 2500, // ₱2,000 rice + ₱500 uniform subsidy
    payFrequency: 'semi-monthly on the 15th and 30th/31st of each month',
    workingHours: '8:00 AM to 5:00 PM, Monday through Friday, with a 1-hour unpaid meal interval',
    workArrangement: 'Hybrid',
    
    companyName: 'KAWAYAN HR PHILIPPINES INC.',
    companyAddress: 'Unit 1402, High Street South Corporate Plaza, BGC, Taguig City, Metro Manila, Philippines',
    secRegistration: 'SEC Reg. No. CS2021-08912 | DOLE Reg. NCR-TAG-2022-0041',
    authorizedSignatory: signatoryName,
    signatoryTitle: signatoryTitle,
    signDate: new Date().toISOString().split('T')[0],
  };
}
