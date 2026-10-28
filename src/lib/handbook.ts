export interface HandbookChapter {
  id: string;
  chapterNumber: number;
  title: string;
  subtitle: string;
  statutoryReferences: string[];
  content: string;
  isCustomized?: boolean;
}

export interface HandbookConfig {
  companyName: string;
  tradeName?: string;
  secOrCdaNumber?: string;
  industry: string;
  workSetup: 'onsite' | 'hybrid' | 'remote';
  workingSchedule: string;
  mealBreakMinutes: number;
  probationaryMonths: number;
  silDays: number;
  vacationDays: number;
  sickDays: number;
  soloParentDays: number;
  paternityDays: number;
  bereavementDays: number;
  cultureTone: 'formal' | 'progressive' | 'cooperative';
  customPolicies: string;
  emergencyContact: string;
  grievanceEmail: string;
}

export interface AuditChecklistItem {
  requirement: string;
  lawReference: string;
  isCompliant: boolean;
  details: string;
}

export interface HandbookAuditResult {
  complianceScore: number;
  status: 'DOLE Compliant' | 'Minor Gaps' | 'High Risk';
  checklist: AuditChecklistItem[];
  recommendations: string[];
}

export const DEFAULT_HANDBOOK_CONFIG: HandbookConfig = {
  companyName: 'Kawayan Multi-Purpose Cooperative & Enterprises Inc.',
  tradeName: 'Kawayan HR & Financial Services',
  secOrCdaNumber: 'CDA Reg. No. 9520-1002341 / SEC CS201804911',
  industry: 'Cooperative, Financial & Enterprise Services',
  workSetup: 'hybrid',
  workingSchedule: 'Monday to Friday, 8:30 AM – 5:30 PM (40 hours/week)',
  mealBreakMinutes: 60,
  probationaryMonths: 6,
  silDays: 5,
  vacationDays: 12,
  sickDays: 10,
  soloParentDays: 7,
  paternityDays: 7,
  bereavementDays: 3,
  cultureTone: 'cooperative',
  customPolicies: 'Biometric time logging is mandatory; strict Safe Spaces Act CODI desk; telecommuting allowance provided; salary loan facility available to regular staff.',
  emergencyContact: '+63 (02) 8891-2345 / hr-helpdesk@kawayan.coop',
  grievanceEmail: 'codi-grievance@kawayan.coop',
};

// Standard Philippine Labor Code Template Builder
export function buildStandardPhilippineHandbook(config: HandbookConfig = DEFAULT_HANDBOOK_CONFIG): HandbookChapter[] {
  const comp = config.companyName || 'The Company';

  return [
    {
      id: 'chap-1',
      chapterNumber: 1,
      title: 'Company Overview, Code of Ethics & Safe Spaces Policy',
      subtitle: 'Institutional Profile, Core Values, Anti-Sexual Harassment & Data Privacy Standards',
      statutoryReferences: [
        'Republic Act No. 11313 (Safe Spaces Act)',
        'Republic Act No. 7877 (Anti-Sexual Harassment Act of 1995)',
        'Republic Act No. 10173 (Data Privacy Act of 2012)',
        'Presidential Decree No. 442 (The Labor Code of the Philippines)',
      ],
      content: `## 1.1 Welcome Message & Purpose of Handbook
Welcome to **${comp}**. This Employee Handbook serves as the official compilation of company policies, employee rights, responsibilities, and procedural standards. It is drafted in strict adherence to the **Philippine Labor Code (Presidential Decree No. 442)** and mandatory Department of Labor and Employment (DOLE) statutory rules.

## 1.2 Equal Employment Opportunity & Non-Discrimination
${comp} strictly adheres to meritocracy and non-discrimination. No applicant or employee shall be discriminated against on account of gender, age, civil status, religious affiliation, sexual orientation, disability, ethnicity, political opinion, or union affiliation pursuant to Philippine Constitution and labor statutes.

## 1.3 Safe Spaces Act (RA 11313) & Anti-Sexual Harassment (RA 7877)
${comp} maintains a **Zero-Tolerance Policy** against any form of sexual harassment, whether verbal, physical, psychological, or electronic (gender-based online sexual harassment).

### Committee on Decorum and Investigation (CODI)
In accordance with Republic Act No. 11313 and DOLE regulations, a dedicated **CODI** is constituted:
1. **Composition**: Chaired by an HR/Management Representative, with equal representation from supervisory and rank-and-file employees, ensuring female worker representation.
2. **Grievance Desk**: Any employee may file a confidential complaint directly with the CODI at \`${config.grievanceEmail}\`.
3. **Investigation Timeline**: The CODI must initiate investigation within **forty-eight (48) hours** of receipt of complaint and conclude findings within **ten (10) working days**.
4. **Interim Protection**: Preventive measures, including temporary reassignment or paid administrative leave of the respondent, may be ordered to safeguard the complainant without prejudice.

## 1.4 Data Privacy & Confidentiality (RA 10173)
All employees are bound to protect personal and sensitive information gathered during operations. Unauthorized reproduction, dissemination, or disclosure of customer, member, financial, or personnel records constitutes gross misconduct and is punishable under the **Data Privacy Act of 2012** and company disciplinary rules.

## 1.5 Conflict of Interest & Anti-Bribery
Employees shall not accept gifts, kickbacks, or favors from suppliers, borrowers, or third parties that compromise independent professional judgment. Any personal business interest related to company affairs must be declared in writing.`,
    },
    {
      id: 'chap-2',
      chapterNumber: 2,
      title: 'Employment Classifications, Working Hours & Overtime Rules',
      subtitle: 'Probationary Terms, Biometric Timekeeping, Night Shift Differential & Rest Days',
      statutoryReferences: [
        'Articles 83, 85, 86, 87, 88, 89, 90 (Labor Code of the Philippines)',
        'Article 296 [281] (Probationary Employment)',
        'DOLE Department Advisory No. 02-04 (Compressed Workweek Scheme)',
        'Republic Act No. 11165 (Telecommuting Act)',
      ],
      content: `## 2.1 Classifications of Employment
- **Probationary Employee**: Hired for a maximum trial period of **six (6) months** pursuant to Article 296 of the Labor Code. Evaluation standards for regular status are communicated upon onboarding.
- **Regular Employee**: An employee who has successfully completed the probationary period and met reasonable performance criteria.
- **Project / Fixed-Term Employee**: Engaged for a specific undertaking or predetermined duration governed by a distinct employment contract.

## 2.2 Standard Working Hours & Schedule
- **Standard Workweek**: ${config.workingSchedule}.
- **Work Setup**: ${config.workSetup.toUpperCase()} arrangement. In hybrid or telecommuting arrangements, work is governed by Republic Act No. 11165 ensuring equal protection and compensation.
- **Meal Periods (Article 85)**: Every employee is entitled to **${config.mealBreakMinutes} minutes of uncompensated meal break**.
- **Short Rest Intervals**: Short rest periods of fifteen (15) to twenty (20) minutes are treated as compensable working time.

## 2.3 Biometric Attendance & Timekeeping
1. All staff are required to record their daily ingress and egress using the official **Biometric Time & Attendance System** or authorized mobile HR portal.
2. **Failure to Log**: Failure to record attendance without prior written notice from immediate head will be marked as undocumented attendance.
3. **Grace Period**: A 15-minute grace period is provided for arrival; chronic tardiness (exceeding 3 occurrences in a single pay period) is subject to progressive disciplinary warnings.

## 2.4 Overtime Pay & Authorized Rates (Article 87)
Overtime work requires prior written approval from the Department Manager.
- **Ordinary Day Overtime**: Additional 25% over the regular hourly rate (125% total).
- **Scheduled Rest Day or Special Non-Working Holiday**: Additional 30% over the daily rate (130% total for the first 8 hours; 169% for work beyond 8 hours).
- **Regular Holiday**: Additional 100% over the regular rate (200% total for first 8 hours; 260% for work beyond 8 hours).

## 2.5 Night Shift Differential (Article 86)
Any employee performing work between **10:00 PM and 6:00 AM** is entitled to a **Night Shift Differential (NSD)** of not less than ten percent (10%) of their regular wage for each hour of work performed.`,
    },
    {
      id: 'chap-3',
      chapterNumber: 3,
      title: 'Compensation, Statutory Deductions, 13th Month Pay & Salary Loans',
      subtitle: 'Payroll Frequencies, Mandatory Gov Deductions (SSS, PhilHealth, Pag-IBIG), BIR Tax & PD 851',
      statutoryReferences: [
        'Presidential Decree No. 851 (13th Month Pay Law)',
        'Republic Act No. 11199 (Social Security Act of 2018)',
        'Republic Act No. 11223 (Universal Health Care Act - PhilHealth)',
        'Republic Act No. 9679 (Home Development Mutual Fund / Pag-IBIG Law)',
        'National Internal Revenue Code (TRAIN Law / BIR Form 2316)',
        'Article 113 Labor Code (Authorized Deductions)',
      ],
      content: `## 3.1 Payroll Frequencies & Cut-Off Cycles
Wages are disbursed on a **semi-monthly basis** (every 15th and 30th / last calendar day of each month) via authorized corporate bank direct deposit or payroll cash cards. Electronic itemized payslips are generated and accessible through the Kawayan HR portal.

## 3.2 Mandatory Statutory Deductions
Pursuant to Philippine laws, ${comp} automatically withholds and remits required statutory contributions:
1. **Social Security System (SSS)**: Remitted under Republic Act No. 11199 (includes SSS Retirement, Disability, and Mandatory WISP contributions).
2. **Philippine Health Insurance Corporation (PhilHealth)**: Standard statutory premium share under the Universal Health Care Law (RA 11223).
3. **Home Development Mutual Fund (Pag-IBIG)**: Standard employee and employer counterpart contributions under RA 9679.
4. **BIR Withholding Tax**: Computed using the graduated income tax table under the TRAIN Law (RA 10963). Every employee receives their annualized **BIR Form 2316** on or before January 31 of each year.

## 3.3 Protection of Wages (Article 113)
No deductions from employee wages shall be made except for:
- Statutory government contributions and withholding taxes;
- Cooperative membership dues or company loans with signed voluntary payroll deduction authorizations;
- Court-ordered support payments.

## 3.4 13th Month Pay (Presidential Decree No. 851)
All rank-and-file employees who have worked for at least one (1) month in the calendar year are entitled to 13th Month Pay.
- **Computation**: Total Basic Salary earned within the calendar year divided by 12 months.
- **Disbursement Deadline**: Released on or before **December 24** of each year in full compliance with DOLE regulations.
- Resigning or separated employees receive their pro-rated 13th month pay as part of their final pay.

## 3.5 Institutional & Government Salary Loans
${comp} supports employee financial wellness through government and institutional loan facilities:
1. **SSS Salary Loan**: Monthly amortizations are deducted directly from salary based on SSS billing statements.
2. **Pag-IBIG Multi-Purpose & Calamity Loan**: Automated payroll deduction upon employee submission of loan voucher.
3. **Company / Cooperative Staff Assistance Loan**: Available to regular employees with at least 1 year of tenure, amortized across 6 to 24 payroll cycles upon mutual written agreement.`,
    },
    {
      id: 'chap-4',
      chapterNumber: 4,
      title: 'Statutory & Discretionary Leaves of Absence',
      subtitle: 'Service Incentive Leave, Maternity (RA 11210), Paternity, Solo Parent, VAWC & Company Leaves',
      statutoryReferences: [
        'Article 95 (Service Incentive Leave)',
        'Republic Act No. 11210 (105-Day Expanded Maternity Leave Law)',
        'Republic Act No. 8187 (Paternity Leave Act of 1996)',
        'Republic Act No. 11861 (Expanded Solo Parents Welfare Act)',
        'Republic Act No. 9262 (Anti-Violence Against Women and Their Children Act)',
        'Republic Act No. 9710 (Magna Carta of Women - Special Leave)',
      ],
      content: `## 4.1 Statutory Leaves Mandated by Philippine Law

### 1. Service Incentive Leave (SIL - Article 95)
Every employee who has rendered at least one (1) year of continuous service is entitled to **${config.silDays} days of Service Incentive Leave with pay**. Unused statutory SIL is fully commutable to cash at the end of the year or upon separation.

### 2. 105-Day Expanded Maternity Leave (RA 11210)
Female employees, regardless of civil status or legitimacy of child, are entitled to:
- **105 calendar days of paid maternity leave** for live birth.
- **Additional 15 days paid leave** (total 120 days) if qualifying as a Solo Parent under RA 11861.
- **60 calendar days of paid leave** for miscarriage or emergency termination of pregnancy.
- **Option to Allocate**: The mother may elect to allocate up to **seven (7) days** of maternity leave to the child's father.

### 3. Paternity Leave (RA 8187)
Married male employees are entitled to **seven (7) working days of paid leave** for the first four (4) deliveries of their legitimate spouse with whom they are cohabiting.

### 4. Expanded Solo Parent Leave (RA 11861)
Solo parent employees with at least six (6) months of service and holding a valid **Solo Parent Identification Card (SPIC)** are entitled to **seven (7) working days of paid parental leave** annually.

### 5. VAWC Leave (RA 9262)
Female employees victimized by physical, sexual, psychological, or economic violence are entitled to **ten (10) days of paid leave**, extendible upon recommendation of a court or Barangay Protection Order (BPO).

### 6. Special Leave for Women (Magna Carta - RA 9710)
A female employee who has rendered continuous aggregate service of at least six (6) months for the last 12 months is entitled to a special leave of up to **two (2) months with full pay** following surgery caused by gynecological disorders.

## 4.2 Company Discretionary Leaves
In addition to statutory mandates, ${comp} grants the following benefits to regular staff:
- **Vacation Leave (VL)**: **${config.vacationDays} working days per annum**, accrued monthly, designed for rest and recreation.
- **Sick Leave (SL)**: **${config.sickDays} working days per annum**, supported by a certified medical certificate if exceeding two (2) consecutive days.
- **Bereavement Leave**: **${config.bereavementDays} consecutive working days with full pay** upon the demise of an immediate family member (spouse, child, parent, or sibling).

## 4.3 Filing Procedure
All leave applications must be submitted via the Kawayan HR portal at least five (5) working days in advance for planned vacation leaves, and within 24 hours of return for emergency or sick leaves.`,
    },
    {
      id: 'chap-5',
      chapterNumber: 5,
      title: 'Occupational Safety, Health & Workplace Wellness (RA 11058)',
      subtitle: 'Safety Officers, OSH Committee, Drug-Free Policy (RA 9165) & Mental Health (RA 11036)',
      statutoryReferences: [
        'Republic Act No. 11058 (Strengthening Compliance with OSH Standards)',
        'DOLE Department Order No. 198-18 (Implementing Rules of RA 11058)',
        'Republic Act No. 9165 & DOLE D.O. 53-03 (Drug-Free Workplace)',
        'Republic Act No. 11036 & DOLE D.O. 208-20 (Mental Health in the Workplace)',
        'DOLE Guidelines on Tuberculosis (D.O. 73-05) and Hepatitis B (D.A. 05-2010)',
      ],
      content: `## 5.1 Occupational Safety and Health Policy (RA 11058)
${comp} is committed to providing a safe, healthy, and hazard-free work environment for all employees, visitors, and contractors.
1. **Joint OSH Committee**: A safety committee consisting of management representatives, certified **Safety Officers (SO2/SO3)**, and workers' representatives convenes monthly.
2. **Right to Know**: Employees have the absolute right to be informed of all physical, ergonomic, chemical, and biological hazards associated with their duties.
3. **Right to Refuse Unsafe Work**: Workers have the statutory right to withdraw from work situations without penalty if there is imminent danger to life or health, subject to immediate notification to the Safety Officer.
4. **Personal Protective Equipment (PPE)**: Necessary PPE is provided by the company **at zero cost** to employees.

## 5.2 Drug-Free Workplace Policy (RA 9165 & DOLE D.O. 53-03)
${comp} strictly enforces a drug-free environment:
- Mandatory random drug testing may be conducted by an accredited DOH laboratory.
- Possession, use, or trafficking of illegal dangerous drugs within premises or during company events results in immediate dismissal following due process.
- Employees seeking voluntary rehabilitation are offered assistance and confidentiality in accordance with DOLE standards.

## 5.3 Mental Health Policy in the Workplace (RA 11036 & DOLE D.O. 208-20)
Recognizing that mental health is as essential as physical health:
- The company provides access to confidential counseling and employee assistance resources.
- Awareness campaigns against stigma and discrimination are conducted bi-annually.
- Reasonable workplace accommodations and stress-management leaves are supported.

## 5.4 Infectious Disease & Health Programs
Programs on Tuberculosis prevention (DOLE D.O. 73-05), Hepatitis B non-discrimination (D.A. 05-2010), and HIV/AIDS prevention (RA 11166) are implemented with strict confidentiality of medical records.`,
    },
    {
      id: 'chap-6',
      chapterNumber: 6,
      title: 'Code of Discipline, Disciplinary Sanctions & Procedural Due Process',
      subtitle: 'Schedule of Penalties, Just & Authorized Causes (Art. 297/298), and the Twin-Notice Rule',
      statutoryReferences: [
        'Articles 297 [282], 298 [283], 299 [284] (Labor Code of the Philippines)',
        'King of Kings Transport vs. Mamac (G.R. No. 166208 - Twin-Notice Doctrine)',
        'DOLE Department Order No. 147-15 (Due Process in Termination of Employment)',
      ],
      content: `## 6.1 Principles of Progressive Discipline
Discipline in ${comp} is corrective, educational, and fair. Penalties follow a graduated matrix:
1. **Verbal Warning** (with documented HR notation)
2. **Written Reprimand / First Written Warning**
3. **Final Written Warning & Suspension** (1 to 15 working days without pay)
4. **Dismissal from Employment** (for grave just causes or repeated severe infractions)

## 6.2 The Mandatory Twin-Notice Rule (Constitutional Due Process)
No regular employee shall be dismissed or suspended without strict compliance with procedural due process:

### Step 1: First Written Notice (Notice to Explain - NTE)
The employee must be served a formal written Notice to Explain stating:
1. The exact infractions, acts, or omissions charged;
2. The specific company policy or Labor Code provision violated;
3. A mandatory period of **at least five (5) calendar days** from receipt to submit a written explanation;
4. Notice of the employee's right to be assisted by legal counsel or an employee representative.

### Step 2: Administrative Hearing / Conference
If requested by the employee or deemed necessary by management, an administrative conference is held to give the employee ample opportunity to present evidence, call witnesses, and clarify facts.

### Step 3: Second Written Notice (Notice of Decision)
Upon objective evaluation of all evidence, a formal written Notice of Decision is served indicating:
1. Whether the employee is exonerated or found culpable;
2. The specific penalty imposed;
3. The factual and legal basis for the determination.

## 6.3 Just Causes for Termination (Article 297)
An employer may terminate employment for any of the following just causes:
- Serious misconduct or willful disobedience to lawful orders;
- Gross and habitual neglect of duty;
- Fraud or willful breach of trust (loss of confidence);
- Commission of a crime or offense against the employer, immediate family, or authorized representative;
- Other analogous causes.

## 6.4 Authorized Causes for Separation (Articles 298 & 299)
Separation due to business installations, redundancy, retrenchment to prevent losses, or closure of establishment requires:
- Written notice served to both the employee and the DOLE Regional Office **at least thirty (30) days** prior to effective date;
- Payment of statutory separation pay (one-half to one month salary per year of service, depending on cause).`,
    },
    {
      id: 'chap-7',
      chapterNumber: 7,
      title: 'Resignation, Clearance, Final Pay & Certificate of Employment',
      subtitle: '30-Day Notice Rule, DOLE Labor Advisory No. 06-20 Compliance, and Exit Protocols',
      statutoryReferences: [
        'Article 300 [285] (Termination by Employee / Resignation)',
        'DOLE Labor Advisory No. 06-20 (Guidelines on Payment of Final Pay and Issuance of COE)',
        'Article 106 to 109 (Protection of Wages and Mechanics)',
      ],
      content: `## 7.1 Voluntary Resignation (Article 300)
An employee may terminate the employment relationship without just cause by serving a formal written notice to the company **at least thirty (30) days in advance**.
- The 30-day notice is intended to facilitate seamless turnover of accountabilities, keys, and operational files.
- Resignation without 30-day notice is allowable only under just causes stipulated in Art. 300 (serious insult, inhuman treatment, or crime committed against the employee).

## 7.2 Exit Clearance & Turnover
Upon submission of resignation or notice of separation, the employee must complete the **Kawayan Clearance Form**:
1. Turnover of company-issued laptop, mobile devices, security badges, access tokens, and documents;
2. Settlement of outstanding company or cooperative cash advances and loan balances;
3. Transition of pending tasks to the designated successor.

## 7.3 Mandatory Final Pay Release (DOLE Labor Advisory No. 06-20)
In strict compliance with **DOLE Labor Advisory No. 06, Series of 2020**:
- **30-Day Release Mandate**: The final pay of any separated employee shall be released **within thirty (30) days from the date of separation or termination**, unless a more favorable company policy applies.
- **Components of Final Pay**:
  1. Unpaid earned basic salary up to the last day of work;
  2. Pro-rated 13th month pay (Total basic earnings in current calendar year ÷ 12);
  3. Cash conversion of unused Service Incentive Leave (SIL) or commutable company leaves;
  4. Separation pay (if separated under authorized causes);
  5. Tax refund or withholding tax adjustment.

## 7.4 Certificate of Employment (COE)
Pursuant to DOLE Labor Advisory No. 06-20, the company shall issue the official **Certificate of Employment (COE)** to the separated employee **within three (3) days from the date of request**, stating the employee's position, tenure, and dates of service.

## 7.5 Post-Employment Non-Disclosure
Separated employees remain permanently bound by their non-disclosure obligations regarding proprietary cooperative databases, client lists, trade secrets, and non-public financial models.`,
    },
  ];
}

// Audit scanner logic to verify compliance against 10 Philippine statutory benchmarks
export function auditHandbookLocally(chapters: HandbookChapter[]): HandbookAuditResult {
  const fullText = chapters.map((c) => `${c.title} ${c.content}`).join('\n').toLowerCase();

  const checklist: AuditChecklistItem[] = [
    {
      requirement: 'Safe Spaces Act & CODI Committee',
      lawReference: 'RA 11313 & RA 7877',
      isCompliant: fullText.includes('safe spaces') && (fullText.includes('codi') || fullText.includes('committee on decorum')),
      details: 'Must specify a formal Committee on Decorum and Investigation (CODI) and complaint procedures.',
    },
    {
      requirement: 'Occupational Safety & Health (OSH) Policy',
      lawReference: 'RA 11058 & DOLE D.O. 198-18',
      isCompliant: (fullText.includes('ra 11058') || fullText.includes('11058')) && (fullText.includes('safety officer') || fullText.includes('osh')),
      details: 'Must include designated safety officer, right to know hazards, and right to refuse imminent danger.',
    },
    {
      requirement: '105-Day Expanded Maternity Leave',
      lawReference: 'RA 11210',
      isCompliant: fullText.includes('105') && (fullText.includes('maternity') || fullText.includes('ra 11210')),
      details: 'Must provide 105 days paid maternity leave for live birth plus 15 days for solo parents.',
    },
    {
      requirement: '13th Month Pay & Service Incentive Leave',
      lawReference: 'PD 851 & Art. 95 Labor Code',
      isCompliant: (fullText.includes('13th month') || fullText.includes('pd 851')) && (fullText.includes('service incentive') || fullText.includes('sil')),
      details: 'Must guarantee 13th month pay on or before Dec 24 and 5 days commutable SIL after 1 year.',
    },
    {
      requirement: 'Paternity & Solo Parent Leaves',
      lawReference: 'RA 8187 & RA 11861',
      isCompliant: fullText.includes('paternity') && (fullText.includes('solo parent') || fullText.includes('ra 11861')),
      details: 'Must grant 7 days paternity leave for married men and 7 days parental leave for solo parents.',
    },
    {
      requirement: 'VAWC Leave & Magna Carta of Women',
      lawReference: 'RA 9262 & RA 9710',
      isCompliant: (fullText.includes('vawc') || fullText.includes('ra 9262')) && (fullText.includes('magna carta') || fullText.includes('ra 9710')),
      details: 'Must include 10 days VAWC leave with protection order and 2 months gynecological surgery leave.',
    },
    {
      requirement: 'Twin-Notice Due Process Rule',
      lawReference: 'Art. 297 & King of Kings Transport Doctrine',
      isCompliant: (fullText.includes('twin-notice') || (fullText.includes('notice to explain') && fullText.includes('notice of decision'))) && fullText.includes('5'),
      details: 'Must guarantee Notice to Explain (min 5 calendar days to respond), hearing, and Notice of Decision.',
    },
    {
      requirement: 'Final Pay Release Within 30 Days',
      lawReference: 'DOLE Labor Advisory No. 06-20',
      isCompliant: (fullText.includes('30 day') || fullText.includes('thirty (30) days')) && (fullText.includes('final pay') || fullText.includes('labor advisory 06-20')),
      details: 'Mandates release of final pay within 30 days from date of separation and COE within 3 days.',
    },
    {
      requirement: 'Night Shift Differential & Overtime Rates',
      lawReference: 'Arts. 86 & 87 Labor Code',
      isCompliant: (fullText.includes('night shift') || fullText.includes('10%')) && (fullText.includes('overtime') || fullText.includes('125%')),
      details: 'Must stipulate 10% premium for work 10PM-6AM and statutory overtime rates (125%, 130%, 200%).',
    },
    {
      requirement: 'Drug-Free Workplace & Mental Health Policy',
      lawReference: 'RA 9165 & RA 11036',
      isCompliant: (fullText.includes('drug-free') || fullText.includes('ra 9165')) && (fullText.includes('mental health') || fullText.includes('ra 11036')),
      details: 'Must establish drug-free workplace policy with DOLE D.O. 53-03 and mental health support under RA 11036.',
    },
  ];

  const compliantCount = checklist.filter((i) => i.isCompliant).length;
  const score = Math.round((compliantCount / checklist.length) * 100);

  let status: 'DOLE Compliant' | 'Minor Gaps' | 'High Risk' = 'High Risk';
  if (score >= 90) status = 'DOLE Compliant';
  else if (score >= 70) status = 'Minor Gaps';

  const recommendations: string[] = [];
  checklist.forEach((item) => {
    if (!item.isCompliant) {
      recommendations.push(`Add mandatory clause for "${item.requirement}" citing ${item.lawReference}.`);
    }
  });

  if (recommendations.length === 0) {
    recommendations.push('Handbook complies with all core Philippine Labor Code and DOLE statutory standards.');
    recommendations.push('Ensure the handbook receipt acknowledgment sheet is signed by all on-boarding employees.');
  }

  return {
    complianceScore: score,
    status,
    checklist,
    recommendations,
  };
}

// Client API caller for handbook generation
export async function generateHandbookWithAI(config: HandbookConfig): Promise<{
  chapters: HandbookChapter[];
  source: 'ai' | 'template';
  message?: string;
}> {
  try {
    const res = await fetch('/api/handbook/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    const data = await res.json();
    if (!data.fallback && data.data?.chapters && Array.isArray(data.data.chapters) && data.data.chapters.length > 0) {
      return {
        chapters: data.data.chapters.map((ch: any, idx: number) => ({
          id: ch.id || `chap-${idx + 1}`,
          chapterNumber: ch.chapterNumber || idx + 1,
          title: ch.title || `Chapter ${idx + 1}`,
          subtitle: ch.subtitle || '',
          statutoryReferences: ch.statutoryReferences || [],
          content: ch.content || '',
          isCustomized: true,
        })),
        source: 'ai',
        message: 'Successfully generated with Gemini 3.8 Flash & Philippine Labor Standards engine.',
      };
    }

    // Graceful fallback to verified Philippine Labor Code template
    const defaultChapters = buildStandardPhilippineHandbook(config);
    return {
      chapters: defaultChapters,
      source: 'template',
      message: data.message || 'Built with Philippine Labor Code statutory baseline template.',
    };
  } catch (err: any) {
    console.warn('AI generation fetch error, using built-in DOLE template:', err);
    return {
      chapters: buildStandardPhilippineHandbook(config),
      source: 'template',
      message: 'Utilizing built-in DOLE Standard Philippine Labor Code Template.',
    };
  }
}

// Refine section with AI
export async function refineSectionWithAI(
  sectionTitle: string,
  currentContent: string,
  userInstruction: string,
  companyName: string
): Promise<string> {
  try {
    const res = await fetch('/api/handbook/refine', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sectionTitle,
        currentContent,
        userInstruction,
        companyName,
      }),
    });

    if (!res.ok) {
      throw new Error(`Refine API error ${res.status}`);
    }

    const data = await res.json();
    if (data.refinedContent) {
      return data.refinedContent;
    }
    return currentContent;
  } catch (err) {
    console.error('Refine call failed:', err);
    throw err;
  }
}
