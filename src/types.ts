export type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department: string;
  status: 'Active' | 'On Leave' | 'Terminated';
  joinDate: string;
  basicSalary: number; // in PHP
  tin: string;
  sssNumber: string;
  philhealthNumber: string;
  pagibigNumber: string;
  leaveBalances: {
    sil: number;
    sick: number;
    vacation: number;
    parental: number;
  };
};

export type LeaveRequest = {
  id: string;
  employeeId: string;
  type: 'SIL' | 'Sick' | 'Vacation' | 'Maternity' | 'Paternity' | 'Magna Carta';
  startDate: string;
  endDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  reason: string;
};

export type LoanType = 
  | 'SSS_SALARY' 
  | 'SSS_CALAMITY' 
  | 'PAGIBIG_MPL' 
  | 'PAGIBIG_CALAMITY' 
  | 'COMPANY_EMERGENCY' 
  | 'COMPANY_EDUCATIONAL';

export type LoanStatus = 'Active' | 'Paid' | 'Suspended';

export type DeductionFrequency = 'Monthly' | 'Semi-Monthly';

export interface LoanRepaymentScheduleItem {
  installmentNumber: number;
  periodLabel: string;
  dueDate: string;
  principal: number;
  interest: number;
  totalAmortization: number;
  remainingBalance: number;
  status: 'Deducted via Payroll' | 'Pending' | 'Paid in Advance' | 'Skipped';
  deductedDate?: string;
  payrollRefId?: string;
}

export interface EmployeeLoan {
  id: string;
  employeeId: string;
  loanType: LoanType;
  loanName: string;
  referenceNo: string;
  principalAmount: number;
  interestRateAnnual: number;
  termMonths: number;
  deductionFrequency: DeductionFrequency;
  monthlyAmortization: number;
  perCutoffAmortization: number;
  startDate: string;
  endDate: string;
  totalLoanAmount: number;
  totalPaid: number;
  remainingBalance: number;
  status: LoanStatus;
  notes?: string;
  schedule: LoanRepaymentScheduleItem[];
}

export type PayrollRecord = {
  id: string;
  employeeId: string;
  periodStart: string;
  periodEnd: string;
  basicPay: number;
  grossPay: number;
  deductions: {
    sss: number;
    philhealth: number;
    pagibig: number;
    withholdingTax: number;
    loans?: {
      sss: number;
      pagibig: number;
      company: number;
      total: number;
    };
    other: number;
  };
  netPay: number;
  status: 'Draft' | 'Approved' | 'Paid';
};

