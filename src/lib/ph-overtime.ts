/**
 * Philippine Labor Code Overtime, Holiday Pay, Rest Day, and Night Shift Differential Utility
 * Compliant with:
 * - Book III, Title I of the Labor Code of the Philippines (Presidential Decree No. 442)
 *   - Article 83: Normal hours of work (8 hours/day)
 *   - Article 86: Night Shift Differential (10:00 PM to 6:00 AM, +10% premium)
 *   - Article 87: Overtime Work (+25% on regular day; +30% on rest days/holidays)
 *   - Article 91 & 93: Weekly Rest Day & Sunday/Holiday Work (130% for rest day/special day; 150% special day on rest day)
 *   - Article 94: Right to Holiday Pay (200% for regular holiday, 260% regular holiday on rest day)
 * - DOLE Handbook on Workers' Statutory Monetary Benefits (2024 Edition)
 */

import { Employee } from '../types';

export type PhDayType =
  | 'REGULAR_DAY'
  | 'REST_DAY'
  | 'SPECIAL_HOLIDAY'
  | 'SPECIAL_HOLIDAY_REST_DAY'
  | 'REGULAR_HOLIDAY'
  | 'REGULAR_HOLIDAY_REST_DAY'
  | 'DOUBLE_REGULAR_HOLIDAY';

export interface DayTypeConfig {
  id: PhDayType;
  label: string;
  shortLabel: string;
  description: string;
  laborCodeArticle: string;
  // Multipliers based on regular hourly rate (100% = 1.0)
  first8HoursMultiplier: number;
  otMultiplier: number; // beyond 8 hours
  nightDiffFirst8Multiplier: number; // 10pm-6am within first 8h
  nightDiffOtMultiplier: number; // 10pm-6am beyond 8h
  unworkedPayPercent: number; // e.g. Regular Holiday unworked is 100%
}

export const PH_DAY_TYPES: Record<PhDayType, DayTypeConfig> = {
  REGULAR_DAY: {
    id: 'REGULAR_DAY',
    label: 'Regular Workday',
    shortLabel: 'Regular Day',
    description: 'Standard 8-hour workday. OT is paid at +25% premium.',
    laborCodeArticle: 'Art. 83, 86, 87',
    first8HoursMultiplier: 1.0,
    otMultiplier: 1.25, // 100% + 25%
    nightDiffFirst8Multiplier: 1.10, // 100% + 10%
    nightDiffOtMultiplier: 1.375, // 1.25 * 1.10 = 137.5%
    unworkedPayPercent: 0,
  },
  REST_DAY: {
    id: 'REST_DAY',
    label: 'Scheduled Rest Day',
    shortLabel: 'Rest Day',
    description: 'Mandatory 24-hour rest day. First 8h paid at +30% premium (130%). OT is 169%.',
    laborCodeArticle: 'Art. 91, 93(a)',
    first8HoursMultiplier: 1.30, // +30%
    otMultiplier: 1.69, // 1.30 * 1.30 = 169%
    nightDiffFirst8Multiplier: 1.43, // 1.30 * 1.10 = 143%
    nightDiffOtMultiplier: 1.859, // 1.69 * 1.10 = 185.9%
    unworkedPayPercent: 0,
  },
  SPECIAL_HOLIDAY: {
    id: 'SPECIAL_HOLIDAY',
    label: 'Special Non-Working Holiday',
    shortLabel: 'Special Holiday',
    description: 'No work, no pay unless worked. First 8h paid at 130%. OT is 169%.',
    laborCodeArticle: 'Art. 93(b)',
    first8HoursMultiplier: 1.30,
    otMultiplier: 1.69, // 1.30 * 1.30 = 169%
    nightDiffFirst8Multiplier: 1.43, // 1.30 * 1.10 = 143%
    nightDiffOtMultiplier: 1.859, // 1.69 * 1.10 = 185.9%
    unworkedPayPercent: 0,
  },
  SPECIAL_HOLIDAY_REST_DAY: {
    id: 'SPECIAL_HOLIDAY_REST_DAY',
    label: 'Special Non-Working Holiday falling on Rest Day',
    shortLabel: 'Special Day + Rest Day',
    description: 'First 8 hours paid at 150% premium (+50%). OT beyond 8h is 195%.',
    laborCodeArticle: 'Art. 93(c)',
    first8HoursMultiplier: 1.50, // +50%
    otMultiplier: 1.95, // 1.50 * 1.30 = 195%
    nightDiffFirst8Multiplier: 1.65, // 1.50 * 1.10 = 165%
    nightDiffOtMultiplier: 2.145, // 1.95 * 1.10 = 214.5%
    unworkedPayPercent: 0,
  },
  REGULAR_HOLIDAY: {
    id: 'REGULAR_HOLIDAY',
    label: 'Regular Holiday',
    shortLabel: 'Regular Holiday',
    description: 'Paid 100% even if unworked. If worked, paid 200% (Double Pay). OT is 260%.',
    laborCodeArticle: 'Art. 94',
    first8HoursMultiplier: 2.00, // 200% (Double pay)
    otMultiplier: 2.60, // 2.00 * 1.30 = 260%
    nightDiffFirst8Multiplier: 2.20, // 2.00 * 1.10 = 220%
    nightDiffOtMultiplier: 2.86, // 2.60 * 1.10 = 286%
    unworkedPayPercent: 100,
  },
  REGULAR_HOLIDAY_REST_DAY: {
    id: 'REGULAR_HOLIDAY_REST_DAY',
    label: 'Regular Holiday falling on Scheduled Rest Day',
    shortLabel: 'Regular Holiday + Rest Day',
    description: 'Double holiday + rest day. First 8h paid at 260% (200% + 30%). OT is 338%.',
    laborCodeArticle: 'Art. 94(c) / DOLE Manual',
    first8HoursMultiplier: 2.60, // 200% + 30% of 200% = 260%
    otMultiplier: 3.38, // 2.60 * 1.30 = 338%
    nightDiffFirst8Multiplier: 2.86, // 2.60 * 1.10 = 286%
    nightDiffOtMultiplier: 3.718, // 3.38 * 1.10 = 371.8%
    unworkedPayPercent: 100,
  },
  DOUBLE_REGULAR_HOLIDAY: {
    id: 'DOUBLE_REGULAR_HOLIDAY',
    label: 'Double Regular Holiday (e.g. Maundy Thursday + Araw ng Kagitingan)',
    shortLabel: 'Double Regular Holiday',
    description: 'Two legal holidays falling on the same date. First 8h paid at 300%. OT is 390%.',
    laborCodeArticle: 'DOLE Advisory on Double Holiday',
    first8HoursMultiplier: 3.00, // 300%
    otMultiplier: 3.90, // 3.00 * 1.30 = 390%
    nightDiffFirst8Multiplier: 3.30, // 3.00 * 1.10 = 330%
    nightDiffOtMultiplier: 4.29, // 3.90 * 1.10 = 429%
    unworkedPayPercent: 200,
  },
};

export type DaysFactor = 261 | 313 | 365;

/**
 * Computes official DOLE daily and hourly rates from monthly basic salary.
 * Formula:
 * Daily Rate = (Monthly Salary * 12) / Factor
 * Hourly Rate = Daily Rate / 8
 */
export function calculateRates(monthlySalary: number, factor: DaysFactor = 261) {
  const dailyRate = (monthlySalary * 12) / factor;
  const hourlyRate = dailyRate / 8;
  return {
    dailyRate: Math.round(dailyRate * 100) / 100,
    hourlyRate: Math.round(hourlyRate * 100) / 100,
  };
}

export interface OvertimeCalculationInput {
  monthlySalary: number;
  daysFactor?: DaysFactor;
  dayType: PhDayType;
  first8HoursWorked?: number; // 0 to 8
  regularOtHours?: number; // daytime OT beyond 8h
  nightDiffShiftHours?: number; // 10pm-6am during first 8h
  nightDiffOtHours?: number; // 10pm-6am beyond 8h
}

export interface OvertimeCalculationResult {
  dailyRate: number;
  hourlyRate: number;
  dayTypeConfig: DayTypeConfig;
  
  // Breakdown amounts
  first8HoursAmount: number;
  regularOtAmount: number;
  nightDiffShiftAmount: number;
  nightDiffOtAmount: number;
  
  // Totals
  totalOvertimeOnlyPay: number; // regularOt + nightDiffOt
  totalNightDiffOnlyPay: number; // nightDiffShift + extra night portion
  totalAdditionalPay: number; // total earned above standard regular day
  grossTotalPayForDay: number; // complete pay for that shift
  
  // Hours summary
  totalHoursRendered: number;
  isOverExertion: boolean; // if total OT > 4 hours in shift
}

export function computeOvertimeDetails(input: OvertimeCalculationInput): OvertimeCalculationResult {
  const factor = input.daysFactor || 261;
  const { dailyRate, hourlyRate } = calculateRates(input.monthlySalary, factor);
  const config = PH_DAY_TYPES[input.dayType];

  const first8Hours = Math.min(8, Math.max(0, input.first8HoursWorked ?? 8));
  const regularOt = Math.max(0, input.regularOtHours || 0);
  const nightDiffShift = Math.max(0, input.nightDiffShiftHours || 0);
  const nightDiffOt = Math.max(0, input.nightDiffOtHours || 0);

  // 1. First 8 Hours computation (On regular day, this is basic wage; on holidays/rest days, includes premium)
  const first8HoursAmount = Math.round(first8Hours * hourlyRate * config.first8HoursMultiplier * 100) / 100;

  // 2. Daytime Overtime beyond 8 hours
  const regularOtAmount = Math.round(regularOt * hourlyRate * config.otMultiplier * 100) / 100;

  // 3. Night Shift Differential during first 8 hours (Extra 10% premium on applicable rate)
  // Under DOLE rules, Night Diff adds +10% of the applicable hourly rate for those hours
  const nightDiffShiftRate = hourlyRate * (config.nightDiffFirst8Multiplier - config.first8HoursMultiplier);
  const nightDiffShiftAmount = Math.round(nightDiffShift * nightDiffShiftRate * 100) / 100;

  // 4. Night Shift Differential during Overtime (beyond 8h within 10pm-6am)
  const nightDiffOtAmount = Math.round(nightDiffOt * hourlyRate * config.nightDiffOtMultiplier * 100) / 100;

  // Total additions (OT + Holiday premium + Night diff)
  const totalOvertimeOnlyPay = Math.round((regularOtAmount + nightDiffOtAmount) * 100) / 100;
  const totalNightDiffOnlyPay = Math.round((nightDiffShiftAmount + (nightDiffOt * hourlyRate * (config.nightDiffOtMultiplier - config.otMultiplier))) * 100) / 100;
  
  const standardDailyWage = dailyRate;
  const grossTotalPayForDay = Math.round((first8HoursAmount + regularOtAmount + nightDiffShiftAmount + nightDiffOtAmount) * 100) / 100;
  const totalAdditionalPay = Math.max(0, grossTotalPayForDay - (input.dayType === 'REGULAR_DAY' ? standardDailyWage : 0));

  const totalHoursRendered = first8Hours + regularOt + nightDiffOt;
  const isOverExertion = (regularOt + nightDiffOt) > 4;

  return {
    dailyRate,
    hourlyRate,
    dayTypeConfig: config,
    first8HoursAmount,
    regularOtAmount,
    nightDiffShiftAmount,
    nightDiffOtAmount,
    totalOvertimeOnlyPay,
    totalNightDiffOnlyPay,
    totalAdditionalPay,
    grossTotalPayForDay,
    totalHoursRendered,
    isOverExertion,
  };
}

export interface TimesheetEntry {
  id: string;
  date: string;
  dayType: PhDayType;
  hoursWorkedFirst8: number;
  regularOtHours: number;
  nightDiffHours: number;
  nightDiffOtHours: number;
  notes?: string;
}
