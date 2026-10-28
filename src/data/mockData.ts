import { Employee, LeaveRequest, PayrollRecord } from '../types';

export const mockEmployees: Employee[] = [
  {
    id: 'emp-001',
    firstName: 'Juan',
    lastName: 'Dela Cruz',
    email: 'juan.delacruz@kawayanhr.ph',
    role: 'Software Engineer',
    department: 'Engineering',
    status: 'Active',
    joinDate: '2023-01-15',
    basicSalary: 65000,
    tin: '123-456-789-000',
    sssNumber: '04-1234567-8',
    philhealthNumber: '12-345678901-2',
    pagibigNumber: '1234-5678-9012',
    leaveBalances: {
      sil: 5,
      sick: 10,
      vacation: 15,
      parental: 0,
    }
  },
  {
    id: 'emp-002',
    firstName: 'Maria',
    lastName: 'Clara',
    email: 'maria.clara@kawayanhr.ph',
    role: 'HR Manager',
    department: 'Human Resources',
    status: 'Active',
    joinDate: '2022-05-10',
    basicSalary: 85000,
    tin: '987-654-321-000',
    sssNumber: '04-7654321-8',
    philhealthNumber: '12-098765432-1',
    pagibigNumber: '0987-6543-2109',
    leaveBalances: {
      sil: 5,
      sick: 5,
      vacation: 12,
      parental: 0,
    }
  },
  {
    id: 'emp-003',
    firstName: 'Jose',
    lastName: 'Rizal',
    email: 'jose.rizal@kawayanhr.ph',
    role: 'Marketing Specialist',
    department: 'Marketing',
    status: 'On Leave',
    joinDate: '2024-02-01',
    basicSalary: 45000,
    tin: '111-222-333-000',
    sssNumber: '04-1112223-3',
    philhealthNumber: '12-333222111-0',
    pagibigNumber: '1111-2222-3333',
    leaveBalances: {
      sil: 2,
      sick: 8,
      vacation: 5,
      parental: 0,
    }
  },
  {
    id: 'emp-004',
    firstName: 'Andres',
    lastName: 'Bonifacio',
    email: 'andres.bonifacio@kawayanhr.ph',
    role: 'Sales Executive',
    department: 'Sales',
    status: 'Active',
    joinDate: '2023-08-20',
    basicSalary: 55000,
    tin: '444-555-666-000',
    sssNumber: '04-4445556-6',
    philhealthNumber: '12-666555444-0',
    pagibigNumber: '4444-5555-6666',
    leaveBalances: {
      sil: 4,
      sick: 10,
      vacation: 10,
      parental: 7,
    }
  },
  {
    id: 'emp-005',
    firstName: 'Gabriela',
    lastName: 'Silang',
    email: 'gabriela.silang@kawayanhr.ph',
    role: 'VP of Operations',
    department: 'Executive',
    status: 'Active',
    joinDate: '2021-03-01',
    basicSalary: 125000,
    tin: '777-888-999-000',
    sssNumber: '04-7778889-9',
    philhealthNumber: '12-777888999-1',
    pagibigNumber: '7777-8888-9999',
    leaveBalances: {
      sil: 5,
      sick: 15,
      vacation: 20,
      parental: 0,
    }
  },
  {
    id: 'emp-006',
    firstName: 'Emilio',
    lastName: 'Aguinaldo',
    email: 'emilio.aguinaldo@kawayanhr.ph',
    role: 'Junior UI/UX Designer',
    department: 'Product Design',
    status: 'Active',
    joinDate: '2024-07-01',
    basicSalary: 32000,
    tin: '333-444-555-000',
    sssNumber: '04-3334445-5',
    philhealthNumber: '12-333444555-2',
    pagibigNumber: '3333-4444-5555',
    leaveBalances: {
      sil: 2,
      sick: 5,
      vacation: 5,
      parental: 0,
    }
  }
];

export const mockLeaveRequests: LeaveRequest[] = [
  {
    id: 'lr-101',
    employeeId: 'emp-003',
    type: 'SIL',
    startDate: '2026-05-01',
    endDate: '2026-05-05',
    status: 'Approved',
    reason: 'Family vacation to Boracay'
  },
  {
    id: 'lr-102',
    employeeId: 'emp-001',
    type: 'Sick',
    startDate: '2026-04-15',
    endDate: '2026-04-16',
    status: 'Approved',
    reason: 'Flu, medical certificate provided'
  },
  {
    id: 'lr-103',
    employeeId: 'emp-004',
    type: 'SIL',
    startDate: '2026-06-10',
    endDate: '2026-06-12',
    status: 'Pending',
    reason: 'Personal matters'
  }
];

export const mockPayrollRecords: PayrollRecord[] = [
  {
    id: 'pr-2026-04-001',
    employeeId: 'emp-001',
    periodStart: '2026-04-01',
    periodEnd: '2026-04-30',
    basicPay: 65000,
    grossPay: 65000,
    deductions: {
      sss: 1350, // Approx (Employee Share)
      philhealth: 1625, // 5% / 2
      pagibig: 200,
      withholdingTax: 5100, // Simulated tax
      other: 0
    },
    netPay: 56725,
    status: 'Paid'
  },
  {
    id: 'pr-2026-04-002',
    employeeId: 'emp-002',
    periodStart: '2026-04-01',
    periodEnd: '2026-04-30',
    basicPay: 85000,
    grossPay: 85000,
    deductions: {
      sss: 1350,
      philhealth: 2125,
      pagibig: 200,
      withholdingTax: 9100,
      other: 0
    },
    netPay: 72225,
    status: 'Paid'
  }
];

export { createInitialMockLoans } from '../lib/loans';
export const mockLoans = [
  // Provided for backward compatibility and static tests
];

