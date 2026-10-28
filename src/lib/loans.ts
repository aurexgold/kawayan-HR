import { EmployeeLoan, LoanRepaymentScheduleItem, LoanType, DeductionFrequency, LoanStatus } from '../types';

export interface GenerateScheduleParams {
  principal: number;
  annualInterestRate: number;
  termMonths: number;
  startDate: string; // YYYY-MM-DD
  deductionFrequency: DeductionFrequency;
  paidInstallmentsCount?: number;
}

/**
 * Generates Philippine statutory/institutional loan amortization schedule.
 * Standard SSS/HDMF formula: Flat annual interest method commonly applied in payroll disclosure.
 * Total Interest = Principal * (annualRate / 100) * (termMonths / 12)
 * Total Payable = Principal + Total Interest
 * Monthly Amortization = Total Payable / termMonths
 */
export function generateAmortizationSchedule(params: GenerateScheduleParams): {
  schedule: LoanRepaymentScheduleItem[];
  monthlyAmortization: number;
  perCutoffAmortization: number;
  totalInterest: number;
  totalLoanAmount: number;
  endDate: string;
} {
  const {
    principal,
    annualInterestRate,
    termMonths,
    startDate,
    deductionFrequency,
    paidInstallmentsCount = 0,
  } = params;

  const totalInterest = +(principal * (annualInterestRate / 100) * (termMonths / 12)).toFixed(2);
  const totalLoanAmount = +(principal + totalInterest).toFixed(2);
  const rawMonthlyAmortization = totalLoanAmount / termMonths;
  const monthlyAmortization = +rawMonthlyAmortization.toFixed(2);
  const perCutoffAmortization = +(monthlyAmortization / 2).toFixed(2);

  const monthlyPrincipal = +(principal / termMonths).toFixed(2);
  const monthlyInterest = +(totalInterest / termMonths).toFixed(2);

  const start = new Date(startDate);
  const schedule: LoanRepaymentScheduleItem[] = [];

  let currentRemaining = totalLoanAmount;

  for (let i = 1; i <= termMonths; i++) {
    const dueDate = new Date(start.getFullYear(), start.getMonth() + (i - 1), 15);
    const year = dueDate.getFullYear();
    const monthName = dueDate.toLocaleString('default', { month: 'short' });
    const periodLabel = `${monthName} ${year}`;
    const isoDate = dueDate.toISOString().split('T')[0];

    const isPaid = i <= paidInstallmentsCount;
    const itemAmortization = i === termMonths 
      ? +(currentRemaining).toFixed(2) // reconcile last centavo
      : monthlyAmortization;

    currentRemaining = Math.max(0, +(currentRemaining - itemAmortization).toFixed(2));

    schedule.push({
      installmentNumber: i,
      periodLabel,
      dueDate: isoDate,
      principal: i === termMonths ? +(principal - monthlyPrincipal * (termMonths - 1)).toFixed(2) : monthlyPrincipal,
      interest: i === termMonths ? +(totalInterest - monthlyInterest * (termMonths - 1)).toFixed(2) : monthlyInterest,
      totalAmortization: itemAmortization,
      remainingBalance: currentRemaining,
      status: isPaid ? 'Deducted via Payroll' : 'Pending',
      deductedDate: isPaid ? isoDate : undefined,
    });
  }

  // Calculate final maturity date
  const lastDueDate = schedule[schedule.length - 1]?.dueDate || startDate;

  return {
    schedule,
    monthlyAmortization,
    perCutoffAmortization,
    totalInterest,
    totalLoanAmount,
    endDate: lastDueDate,
  };
}

/**
 * Returns human-readable label and agency badge metadata for a LoanType
 */
export function getLoanTypeInfo(type: LoanType): {
  label: string;
  agency: 'SSS' | 'Pag-IBIG' | 'Company';
  badgeColor: string;
  defaultRate: number;
  defaultTerm: number;
} {
  switch (type) {
    case 'SSS_SALARY':
      return {
        label: 'SSS Salary Loan',
        agency: 'SSS',
        badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
        defaultRate: 10,
        defaultTerm: 24,
      };
    case 'SSS_CALAMITY':
      return {
        label: 'SSS Calamity Relief Loan',
        agency: 'SSS',
        badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
        defaultRate: 10,
        defaultTerm: 24,
      };
    case 'PAGIBIG_MPL':
      return {
        label: 'Pag-IBIG Multi-Purpose Loan (MPL)',
        agency: 'Pag-IBIG',
        badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
        defaultRate: 10.5,
        defaultTerm: 24,
      };
    case 'PAGIBIG_CALAMITY':
      return {
        label: 'Pag-IBIG Calamity Loan',
        agency: 'Pag-IBIG',
        badgeColor: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        defaultRate: 5.95,
        defaultTerm: 24,
      };
    case 'COMPANY_EMERGENCY':
      return {
        label: 'Company Emergency Cash Advance',
        agency: 'Company',
        badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        defaultRate: 0,
        defaultTerm: 12,
      };
    case 'COMPANY_EDUCATIONAL':
      return {
        label: 'Company Educational / Tuition Loan',
        agency: 'Company',
        badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
        defaultRate: 0,
        defaultTerm: 12,
      };
  }
}

/**
 * Default Philippine loan records for cooperative employees
 */
export function createInitialMockLoans(): EmployeeLoan[] {
  // 1. Juan Dela Cruz: SSS Salary Loan (₱36,000, 24 mo, 10% rate)
  const juanSchedule = generateAmortizationSchedule({
    principal: 36000,
    annualInterestRate: 10,
    termMonths: 24,
    startDate: '2025-06-15',
    deductionFrequency: 'Semi-Monthly',
    paidInstallmentsCount: 10,
  });
  const juanTotalPaid = juanSchedule.schedule.slice(0, 10).reduce((sum, item) => sum + item.totalAmortization, 0);

  // 2. Jose Rizal: Pag-IBIG Multi-Purpose Loan (₱30,000, 24 mo, 10.5% rate)
  const joseSchedule = generateAmortizationSchedule({
    principal: 30000,
    annualInterestRate: 10.5,
    termMonths: 24,
    startDate: '2025-11-15',
    deductionFrequency: 'Monthly',
    paidInstallmentsCount: 5,
  });
  const joseTotalPaid = joseSchedule.schedule.slice(0, 5).reduce((sum, item) => sum + item.totalAmortization, 0);

  // 3. Andres Bonifacio: Company Emergency Assistance (₱24,000, 12 mo, 0% rate)
  const andresSchedule = generateAmortizationSchedule({
    principal: 24000,
    annualInterestRate: 0,
    termMonths: 12,
    startDate: '2026-01-15',
    deductionFrequency: 'Semi-Monthly',
    paidInstallmentsCount: 6,
  });
  const andresTotalPaid = andresSchedule.schedule.slice(0, 6).reduce((sum, item) => sum + item.totalAmortization, 0);

  // 4. Maria Clara: SSS Calamity Loan (₱20,000, 24 mo, 10% rate)
  const mariaSchedule = generateAmortizationSchedule({
    principal: 20000,
    annualInterestRate: 10,
    termMonths: 24,
    startDate: '2026-02-15',
    deductionFrequency: 'Monthly',
    paidInstallmentsCount: 2,
  });
  const mariaTotalPaid = mariaSchedule.schedule.slice(0, 2).reduce((sum, item) => sum + item.totalAmortization, 0);

  // 5. Juan Dela Cruz: Fully Paid Company Educational Loan
  const juanEduSchedule = generateAmortizationSchedule({
    principal: 15000,
    annualInterestRate: 0,
    termMonths: 6,
    startDate: '2025-01-15',
    deductionFrequency: 'Monthly',
    paidInstallmentsCount: 6,
  });

  // 6. Jose Rizal: Suspended Pag-IBIG Calamity Loan (borrower applied for grace period / temporary relief)
  const joseCalamitySchedule = generateAmortizationSchedule({
    principal: 15000,
    annualInterestRate: 5.95,
    termMonths: 24,
    startDate: '2026-03-15',
    deductionFrequency: 'Monthly',
    paidInstallmentsCount: 1,
  });
  const joseCalamityTotalPaid = joseCalamitySchedule.schedule.slice(0, 1).reduce((sum, item) => sum + item.totalAmortization, 0);

  return [
    {
      id: 'loan-001',
      employeeId: 'emp-001',
      loanType: 'SSS_SALARY',
      loanName: 'SSS 2-Month Salary Loan',
      referenceNo: 'SSS-SLN-2025-0982',
      principalAmount: 36000,
      interestRateAnnual: 10,
      termMonths: 24,
      deductionFrequency: 'Semi-Monthly',
      monthlyAmortization: juanSchedule.monthlyAmortization,
      perCutoffAmortization: juanSchedule.perCutoffAmortization,
      startDate: '2025-06-15',
      endDate: juanSchedule.endDate,
      totalLoanAmount: juanSchedule.totalLoanAmount,
      totalPaid: +juanTotalPaid.toFixed(2),
      remainingBalance: +(juanSchedule.totalLoanAmount - juanTotalPaid).toFixed(2),
      status: 'Active',
      notes: 'Approved via SSS My.SSS Employer Portal. Deducted 50% on 15th and 50% on 30th cutoff.',
      schedule: juanSchedule.schedule,
    },
    {
      id: 'loan-002',
      employeeId: 'emp-003',
      loanType: 'PAGIBIG_MPL',
      loanName: 'Pag-IBIG Multi-Purpose Loan (Short-Term)',
      referenceNo: 'HDMF-MPL-2025-4421',
      principalAmount: 30000,
      interestRateAnnual: 10.5,
      termMonths: 24,
      deductionFrequency: 'Monthly',
      monthlyAmortization: joseSchedule.monthlyAmortization,
      perCutoffAmortization: joseSchedule.perCutoffAmortization,
      startDate: '2025-11-15',
      endDate: joseSchedule.endDate,
      totalLoanAmount: joseSchedule.totalLoanAmount,
      totalPaid: +joseTotalPaid.toFixed(2),
      remainingBalance: +(joseSchedule.totalLoanAmount - joseTotalPaid).toFixed(2),
      status: 'Active',
      notes: 'Standard 24-month Pag-IBIG salary loan for housing improvement.',
      schedule: joseSchedule.schedule,
    },
    {
      id: 'loan-003',
      employeeId: 'emp-004',
      loanType: 'COMPANY_EMERGENCY',
      loanName: 'Kawayan Cooperative Emergency Cash Advance',
      referenceNo: 'KWY-EMP-2026-012',
      principalAmount: 24000,
      interestRateAnnual: 0,
      termMonths: 12,
      deductionFrequency: 'Semi-Monthly',
      monthlyAmortization: andresSchedule.monthlyAmortization,
      perCutoffAmortization: andresSchedule.perCutoffAmortization,
      startDate: '2026-01-15',
      endDate: andresSchedule.endDate,
      totalLoanAmount: andresSchedule.totalLoanAmount,
      totalPaid: +andresTotalPaid.toFixed(2),
      remainingBalance: +(andresSchedule.totalLoanAmount - andresTotalPaid).toFixed(2),
      status: 'Active',
      notes: 'Zero-interest cooperative emergency staff loan.',
      schedule: andresSchedule.schedule,
    },
    {
      id: 'loan-004',
      employeeId: 'emp-002',
      loanType: 'SSS_CALAMITY',
      loanName: 'SSS Calamity Relief Package',
      referenceNo: 'SSS-CLM-2026-7719',
      principalAmount: 20000,
      interestRateAnnual: 10,
      termMonths: 24,
      deductionFrequency: 'Monthly',
      monthlyAmortization: mariaSchedule.monthlyAmortization,
      perCutoffAmortization: mariaSchedule.perCutoffAmortization,
      startDate: '2026-02-15',
      endDate: mariaSchedule.endDate,
      totalLoanAmount: mariaSchedule.totalLoanAmount,
      totalPaid: +mariaTotalPaid.toFixed(2),
      remainingBalance: +(mariaSchedule.totalLoanAmount - mariaTotalPaid).toFixed(2),
      status: 'Active',
      notes: 'State of calamity assistance loan endorsed by HR.',
      schedule: mariaSchedule.schedule,
    },
    {
      id: 'loan-005',
      employeeId: 'emp-001',
      loanType: 'COMPANY_EDUCATIONAL',
      loanName: 'Cooperative Continuing Education Advance',
      referenceNo: 'KWY-EDU-2025-004',
      principalAmount: 15000,
      interestRateAnnual: 0,
      termMonths: 6,
      deductionFrequency: 'Monthly',
      monthlyAmortization: juanEduSchedule.monthlyAmortization,
      perCutoffAmortization: juanEduSchedule.perCutoffAmortization,
      startDate: '2025-01-15',
      endDate: juanEduSchedule.endDate,
      totalLoanAmount: juanEduSchedule.totalLoanAmount,
      totalPaid: juanEduSchedule.totalLoanAmount,
      remainingBalance: 0,
      status: 'Paid',
      notes: 'Successfully paid off in full on June 30, 2025.',
      schedule: juanEduSchedule.schedule,
    },
    {
      id: 'loan-006',
      employeeId: 'emp-003',
      loanType: 'PAGIBIG_CALAMITY',
      loanName: 'Pag-IBIG Calamity Loan Assistance',
      referenceNo: 'HDMF-CLM-2026-3021',
      principalAmount: 15000,
      interestRateAnnual: 5.95,
      termMonths: 24,
      deductionFrequency: 'Monthly',
      monthlyAmortization: joseCalamitySchedule.monthlyAmortization,
      perCutoffAmortization: joseCalamitySchedule.perCutoffAmortization,
      startDate: '2026-03-15',
      endDate: joseCalamitySchedule.endDate,
      totalLoanAmount: joseCalamitySchedule.totalLoanAmount,
      totalPaid: +joseCalamityTotalPaid.toFixed(2),
      remainingBalance: +(joseCalamitySchedule.totalLoanAmount - joseCalamityTotalPaid).toFixed(2),
      status: 'Suspended',
      notes: 'Temporarily suspended upon employee request pending insurance claim.',
      schedule: joseCalamitySchedule.schedule,
    },
  ];
}

const STORAGE_KEY = 'kawayan_hr_employee_loans_v1';

/**
 * Loads loans from LocalStorage or returns the rich default mock loans.
 */
export function getStoredLoans(): EmployeeLoan[] {
  if (typeof window === 'undefined') return createInitialMockLoans();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = createInitialMockLoans();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load loans from storage:', err);
    return createInitialMockLoans();
  }
}

/**
 * Saves loans to LocalStorage and notifies listeners.
 */
export function saveStoredLoans(loans: EmployeeLoan[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(loans));
    window.dispatchEvent(new Event('kawayan_loans_updated'));
  } catch (err) {
    console.error('Failed to save loans to storage:', err);
  }
}

/**
 * Calculates total active monthly loan deductions for an employee,
 * itemized by statutory agency (SSS vs Pag-IBIG vs Company).
 */
export function calculateEmployeeMonthlyLoanDeductions(
  employeeId: string, 
  loansList?: EmployeeLoan[]
): {
  sss: number;
  pagibig: number;
  company: number;
  total: number;
  activeLoansCount: number;
  items: Array<{
    loanId: string;
    loanType: LoanType;
    loanName: string;
    referenceNo: string;
    agency: 'SSS' | 'Pag-IBIG' | 'Company';
    monthlyAmount: number;
    remainingBalance: number;
  }>;
} {
  const allLoans = loansList || getStoredLoans();
  const activeLoans = allLoans.filter(l => l.employeeId === employeeId && l.status === 'Active');

  let sss = 0;
  let pagibig = 0;
  let company = 0;

  const items = activeLoans.map(loan => {
    const info = getLoanTypeInfo(loan.loanType);
    const amount = loan.monthlyAmortization;

    if (info.agency === 'SSS') {
      sss += amount;
    } else if (info.agency === 'Pag-IBIG') {
      pagibig += amount;
    } else {
      company += amount;
    }

    return {
      loanId: loan.id,
      loanType: loan.loanType,
      loanName: loan.loanName,
      referenceNo: loan.referenceNo,
      agency: info.agency,
      monthlyAmount: amount,
      remainingBalance: loan.remainingBalance,
    };
  });

  sss = +sss.toFixed(2);
  pagibig = +pagibig.toFixed(2);
  company = +company.toFixed(2);
  const total = +(sss + pagibig + company).toFixed(2);

  return {
    sss,
    pagibig,
    company,
    total,
    activeLoansCount: activeLoans.length,
    items,
  };
}

/**
 * Generates DOLE / SSS / HDMF Billing Statement Reconciliation CSV
 */
export function generateLoanReconciliationCSV(loans: EmployeeLoan[], employeeLookup: Record<string, { name: string; sss: string; tin: string; hdmf: string }>): string {
  const headers = [
    'Employee ID',
    'Employee Name',
    'TIN',
    'Agency',
    'Loan Type',
    'Reference / PN No.',
    'Principal Amount (PHP)',
    'Total Loan Payable (PHP)',
    'Monthly Amortization (PHP)',
    'Total Deducted to Date (PHP)',
    'Remaining Balance (PHP)',
    'Start Date',
    'Maturity Date',
    'Status',
  ];

  const rows = loans.map(loan => {
    const emp = employeeLookup[loan.employeeId] || { name: 'Unknown', sss: '', tin: '', hdmf: '' };
    const info = getLoanTypeInfo(loan.loanType);
    return [
      loan.employeeId,
      `"${emp.name}"`,
      loan.employeeId,
      info.agency,
      `"${loan.loanName}"`,
      loan.referenceNo,
      loan.principalAmount.toFixed(2),
      loan.totalLoanAmount.toFixed(2),
      loan.monthlyAmortization.toFixed(2),
      loan.totalPaid.toFixed(2),
      loan.remainingBalance.toFixed(2),
      loan.startDate,
      loan.endDate,
      loan.status,
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}
