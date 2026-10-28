export type HmoProvider = 'Maxicare' | 'Intellicare' | 'MediCard' | 'PhilCare' | 'Etiqa' | 'Avega';

export type HmoPlanTier = 'Silver' | 'Gold' | 'Platinum' | 'VIP Executive';

export interface HmoDependent {
  id: string;
  name: string;
  relationship: 'Spouse' | 'Child' | 'Parent' | 'Sibling';
  birthDate: string;
  gender: 'Male' | 'Female';
  isActive: boolean; // toggleable on/off per dependent
  monthlyPremium: number;
  employerSubsidy: number;
  employeePayrollDeduction: number;
  preExistingCovered: boolean;
  cardNumber: string;
}

export interface HmoEnrollment {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  role: string;
  provider: HmoProvider;
  planTier: HmoPlanTier;
  mbl: number; // Maximum Benefit Limit (PHP)
  enrollmentDate: string;
  cardEffectiveDate: string;
  cardExpiryDate: string;
  cardNumber: string;
  isActive: boolean; // "can be on or off" toggle per employee
  employerShareMonthly: number; // PHP
  employeeShareMonthly: number; // PHP (Deducted from payroll)
  copayPercentage: number; // e.g. 0% or 10%
  roomAndBoard: string; // e.g. "Semi-Private", "Regular Private", "Suite"
  dentalCovered: boolean;
  opticalCovered: boolean;
  emergencyRoomCovered: boolean;
  dependents: HmoDependent[];
  notes?: string;
}

export interface HmoPlanCatalog {
  provider: HmoProvider;
  tier: HmoPlanTier;
  mbl: number;
  totalMonthlyPremium: number;
  standardEmployerShare: number;
  standardEmployeeShare: number;
  roomAndBoard: string;
  dentalCovered: boolean;
  opticalCovered: boolean;
  description: string;
}
