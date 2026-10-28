/**
 * Official Philippine Holidays & Statutory Observances Dataset (2026)
 * Based on Presidential Proclamations and the Labor Code of the Philippines.
 */

export type HolidayType = 
  | 'Regular Holiday' 
  | 'Special Non-Working Day' 
  | 'Special Working Day' 
  | 'Local / LGU Holiday' 
  | 'Company Declared';

export interface PhilippineHoliday {
  id: string;
  name: string;
  localName?: string;
  date: string; // YYYY-MM-DD
  type: HolidayType;
  legalBasis: string;
  applicableLocation: string; // "Nationwide" or specific LGU like "Taguig City", "Makati City"
  payRules: {
    unworkedRate: string; // e.g. "100% of Daily Wage" or "No Work, No Pay"
    workedFirst8Hours: string; // e.g. "200% of Daily Wage" or "130%"
    workedOvertime: string; // e.g. "+30% of hourly rate (260%)"
    workedOnRestDay: string; // e.g. "260% of Daily Wage"
  };
  description: string;
  isCustom?: boolean;
}

export const INITIAL_PH_HOLIDAYS_2026: PhilippineHoliday[] = [
  {
    id: 'hol-2026-01',
    name: "New Year's Day",
    localName: 'Araw ng Bagong Taon',
    date: '2026-01-01',
    type: 'Regular Holiday',
    legalBasis: 'Labor Code Art. 94 / Pres. Proclamation',
    applicableLocation: 'Nationwide',
    payRules: {
      unworkedRate: '100% of Daily Wage',
      workedFirst8Hours: '200% of Daily Wage',
      workedOvertime: '+30% of regular hourly rate (260%)',
      workedOnRestDay: '260% of Daily Wage',
    },
    description: 'National celebration marking the first day of the year.',
  },
  {
    id: 'hol-2026-02',
    name: 'Chinese Lunar New Year',
    localName: 'Bagong Taong Tsino',
    date: '2026-02-17',
    type: 'Special Non-Working Day',
    legalBasis: 'Presidential Proclamation',
    applicableLocation: 'Nationwide',
    payRules: {
      unworkedRate: 'No Work, No Pay (unless company CBA)',
      workedFirst8Hours: '130% of Daily Wage',
      workedOvertime: '+30% of hourly rate (169%)',
      workedOnRestDay: '150% of Daily Wage',
    },
    description: 'Celebration of the Spring Festival and Chinese New Year.',
  },
  {
    id: 'hol-2026-03',
    name: 'EDSA People Power Revolution Anniversary',
    localName: 'Anibersaryo ng Rebolusyong EDSA',
    date: '2026-02-25',
    type: 'Special Non-Working Day',
    legalBasis: 'Presidential Proclamation',
    applicableLocation: 'Nationwide',
    payRules: {
      unworkedRate: 'No Work, No Pay',
      workedFirst8Hours: '130% of Daily Wage',
      workedOvertime: '+30% of hourly rate (169%)',
      workedOnRestDay: '150% of Daily Wage',
    },
    description: 'Commemoration of the peaceful 1986 EDSA revolution.',
  },
  {
    id: 'hol-2026-04',
    name: 'Maundy Thursday',
    localName: 'Huwebes Santo',
    date: '2026-04-02',
    type: 'Regular Holiday',
    legalBasis: 'Labor Code Art. 94',
    applicableLocation: 'Nationwide',
    payRules: {
      unworkedRate: '100% of Daily Wage',
      workedFirst8Hours: '200% of Daily Wage',
      workedOvertime: '+30% of regular hourly rate (260%)',
      workedOnRestDay: '260% of Daily Wage',
    },
    description: 'Holy Week religious observance.',
  },
  {
    id: 'hol-2026-05',
    name: 'Good Friday',
    localName: 'Biyernes Santo',
    date: '2026-04-03',
    type: 'Regular Holiday',
    legalBasis: 'Labor Code Art. 94',
    applicableLocation: 'Nationwide',
    payRules: {
      unworkedRate: '100% of Daily Wage',
      workedFirst8Hours: '200% of Daily Wage',
      workedOvertime: '+30% of regular hourly rate (260%)',
      workedOnRestDay: '260% of Daily Wage',
    },
    description: 'Holy Week commemoration of the Passion of Christ.',
  },
  {
    id: 'hol-2026-06',
    name: 'Black Saturday',
    localName: 'Sabado de Gloria',
    date: '2026-04-04',
    type: 'Special Non-Working Day',
    legalBasis: 'Presidential Proclamation',
    applicableLocation: 'Nationwide',
    payRules: {
      unworkedRate: 'No Work, No Pay',
      workedFirst8Hours: '130% of Daily Wage',
      workedOvertime: '+30% of hourly rate (169%)',
      workedOnRestDay: '150% of Daily Wage',
    },
    description: 'Day between Good Friday and Easter Sunday.',
  },
  {
    id: 'hol-2026-07',
    name: 'Araw ng Kagitingan (Day of Valor)',
    localName: 'Araw ng Kagitingan',
    date: '2026-04-09',
    type: 'Regular Holiday',
    legalBasis: 'Labor Code Art. 94',
    applicableLocation: 'Nationwide',
    payRules: {
      unworkedRate: '100% of Daily Wage',
      workedFirst8Hours: '200% of Daily Wage',
      workedOvertime: '+30% of regular hourly rate (260%)',
      workedOnRestDay: '260% of Daily Wage',
    },
    description: 'Honoring Filipino and American soldiers in the Fall of Bataan.',
  },
  {
    id: 'hol-2026-08',
    name: "Eid'l Fitr (Feast of Ramadhan)",
    localName: 'Wakas ng Ramadan',
    date: '2026-04-12',
    type: 'Regular Holiday',
    legalBasis: 'Republic Act No. 9177',
    applicableLocation: 'Nationwide',
    payRules: {
      unworkedRate: '100% of Daily Wage',
      workedFirst8Hours: '200% of Daily Wage',
      workedOvertime: '+30% of regular hourly rate (260%)',
      workedOnRestDay: '260% of Daily Wage',
    },
    description: 'Islamic festival marking the end of the fasting month of Ramadan.',
  },
  {
    id: 'hol-2026-09',
    name: 'Labor Day',
    localName: 'Araw ng Manggagawa',
    date: '2026-05-01',
    type: 'Regular Holiday',
    legalBasis: 'Labor Code Art. 94',
    applicableLocation: 'Nationwide',
    payRules: {
      unworkedRate: '100% of Daily Wage',
      workedFirst8Hours: '200% of Daily Wage',
      workedOvertime: '+30% of regular hourly rate (260%)',
      workedOnRestDay: '260% of Daily Wage',
    },
    description: 'National holiday celebrating the Filipino workforce and labor rights.',
  },
  {
    id: 'hol-2026-10',
    name: 'Independence Day',
    localName: 'Araw ng Kalayaan',
    date: '2026-06-12',
    type: 'Regular Holiday',
    legalBasis: 'Labor Code Art. 94',
    applicableLocation: 'Nationwide',
    payRules: {
      unworkedRate: '100% of Daily Wage',
      workedFirst8Hours: '200% of Daily Wage',
      workedOvertime: '+30% of regular hourly rate (260%)',
      workedOnRestDay: '260% of Daily Wage',
    },
    description: 'Declaration of Philippine independence from Spain in 1898.',
  },
  {
    id: 'hol-2026-11',
    name: "Eid'l Adha (Feast of Sacrifice)",
    localName: 'Araw ng Pagpapakasakit',
    date: '2026-06-17',
    type: 'Regular Holiday',
    legalBasis: 'Republic Act No. 9849',
    applicableLocation: 'Nationwide',
    payRules: {
      unworkedRate: '100% of Daily Wage',
      workedFirst8Hours: '200% of Daily Wage',
      workedOvertime: '+30% of regular hourly rate (260%)',
      workedOnRestDay: '260% of Daily Wage',
    },
    description: 'Islamic holiday commemorating Ibrahim’s obedience to God.',
  },
  {
    id: 'hol-2026-12',
    name: 'Taguig City Foundation Day',
    localName: 'Araw ng Taguig',
    date: '2026-07-26',
    type: 'Local / LGU Holiday',
    legalBasis: 'Republic Act No. 8487 / LGU Taguig',
    applicableLocation: 'Taguig City (BGC Sites)',
    payRules: {
      unworkedRate: 'No Work, No Pay (Local)',
      workedFirst8Hours: '130% of Daily Wage',
      workedOvertime: '+30% of hourly rate (169%)',
      workedOnRestDay: '150% of Daily Wage',
    },
    description: 'Special non-working holiday in the City of Taguig.',
  },
  {
    id: 'hol-2026-13',
    name: 'Ninoy Aquino Day',
    localName: 'Araw ni Ninoy Aquino',
    date: '2026-08-21',
    type: 'Special Non-Working Day',
    legalBasis: 'Republic Act No. 9256',
    applicableLocation: 'Nationwide',
    payRules: {
      unworkedRate: 'No Work, No Pay',
      workedFirst8Hours: '130% of Daily Wage',
      workedOvertime: '+30% of hourly rate (169%)',
      workedOnRestDay: '150% of Daily Wage',
    },
    description: 'Commemorating the assassination of Senator Benigno Aquino Jr.',
  },
  {
    id: 'hol-2026-14',
    name: 'National Heroes Day',
    localName: 'Araw ng mga Bayani',
    date: '2026-08-31',
    type: 'Regular Holiday',
    legalBasis: 'Republic Act No. 9492',
    applicableLocation: 'Nationwide',
    payRules: {
      unworkedRate: '100% of Daily Wage',
      workedFirst8Hours: '200% of Daily Wage',
      workedOvertime: '+30% of regular hourly rate (260%)',
      workedOnRestDay: '260% of Daily Wage',
    },
    description: 'Honoring all Philippine national heroes across history.',
  },
  {
    id: 'hol-2026-15',
    name: "All Saints' Day",
    localName: 'Undas / Todos los Santos',
    date: '2026-11-01',
    type: 'Special Non-Working Day',
    legalBasis: 'Presidential Proclamation',
    applicableLocation: 'Nationwide',
    payRules: {
      unworkedRate: 'No Work, No Pay',
      workedFirst8Hours: '130% of Daily Wage',
      workedOvertime: '+30% of hourly rate (169%)',
      workedOnRestDay: '150% of Daily Wage',
    },
    description: 'Christian feast honoring all the saints.',
  },
  {
    id: 'hol-2026-16',
    name: "All Souls' Day",
    localName: 'Araw ng mga Patay',
    date: '2026-11-02',
    type: 'Special Non-Working Day',
    legalBasis: 'Presidential Proclamation',
    applicableLocation: 'Nationwide',
    payRules: {
      unworkedRate: 'No Work, No Pay',
      workedFirst8Hours: '130% of Daily Wage',
      workedOvertime: '+30% of hourly rate (169%)',
      workedOnRestDay: '150% of Daily Wage',
    },
    description: 'Traditional day for visiting cemeteries and commemorating the faithful departed.',
  },
  {
    id: 'hol-2026-17',
    name: 'Bonifacio Day',
    localName: 'Kaarawan ni Bonifacio',
    date: '2026-11-30',
    type: 'Regular Holiday',
    legalBasis: 'Labor Code Art. 94',
    applicableLocation: 'Nationwide',
    payRules: {
      unworkedRate: '100% of Daily Wage',
      workedFirst8Hours: '200% of Daily Wage',
      workedOvertime: '+30% of regular hourly rate (260%)',
      workedOnRestDay: '260% of Daily Wage',
    },
    description: 'Birth anniversary of Katipunan Supremo Andres Bonifacio.',
  },
  {
    id: 'hol-2026-18',
    name: 'Feast of the Immaculate Conception',
    localName: 'Kapistahan ng Kalinis-linisang Paglilihi',
    date: '2026-12-08',
    type: 'Special Non-Working Day',
    legalBasis: 'Republic Act No. 10966',
    applicableLocation: 'Nationwide',
    payRules: {
      unworkedRate: 'No Work, No Pay',
      workedFirst8Hours: '130% of Daily Wage',
      workedOvertime: '+30% of hourly rate (169%)',
      workedOnRestDay: '150% of Daily Wage',
    },
    description: 'Catholic Marian feast celebrated as a national special non-working holiday.',
  },
  {
    id: 'hol-2026-19',
    name: 'Christmas Eve',
    localName: 'Bisperas ng Pasko',
    date: '2026-12-24',
    type: 'Special Non-Working Day',
    legalBasis: 'Presidential Proclamation',
    applicableLocation: 'Nationwide',
    payRules: {
      unworkedRate: 'No Work, No Pay',
      workedFirst8Hours: '130% of Daily Wage',
      workedOvertime: '+30% of hourly rate (169%)',
      workedOnRestDay: '150% of Daily Wage',
    },
    description: 'Special non-working day for Christmas preparations.',
  },
  {
    id: 'hol-2026-20',
    name: 'Christmas Day',
    localName: 'Araw ng Pasko',
    date: '2026-12-25',
    type: 'Regular Holiday',
    legalBasis: 'Labor Code Art. 94',
    applicableLocation: 'Nationwide',
    payRules: {
      unworkedRate: '100% of Daily Wage',
      workedFirst8Hours: '200% of Daily Wage',
      workedOvertime: '+30% of regular hourly rate (260%)',
      workedOnRestDay: '260% of Daily Wage',
    },
    description: 'Christmas celebration throughout the Philippines.',
  },
  {
    id: 'hol-2026-21',
    name: 'Rizal Day',
    localName: 'Araw ni Rizal',
    date: '2026-12-30',
    type: 'Regular Holiday',
    legalBasis: 'Labor Code Art. 94',
    applicableLocation: 'Nationwide',
    payRules: {
      unworkedRate: '100% of Daily Wage',
      workedFirst8Hours: '200% of Daily Wage',
      workedOvertime: '+30% of regular hourly rate (260%)',
      workedOnRestDay: '260% of Daily Wage',
    },
    description: 'Honoring national hero Dr. Jose Rizal on the anniversary of his martyrdom.',
  },
  {
    id: 'hol-2026-22',
    name: 'Last Day of the Year',
    localName: 'Huling Araw ng Taon',
    date: '2026-12-31',
    type: 'Special Non-Working Day',
    legalBasis: 'Presidential Proclamation',
    applicableLocation: 'Nationwide',
    payRules: {
      unworkedRate: 'No Work, No Pay',
      workedFirst8Hours: '130% of Daily Wage',
      workedOvertime: '+30% of hourly rate (169%)',
      workedOnRestDay: '150% of Daily Wage',
    },
    description: 'New Year’s Eve special non-working holiday.',
  },
];

/**
 * Computes exact DOLE Holiday Pay for an employee based on their basic salary.
 */
export function calculateHolidayPay(
  monthlySalary: number,
  holidayType: HolidayType,
  worked: boolean,
  hoursWorked: number = 8,
  overtimeHours: number = 0,
  isOnRestDay: boolean = false
) {
  // Standard DOLE factor for monthly paid employees: (Monthly Salary * 12) / 313 days
  // Or 261 days for 5-day workweek companies. Let's use 261 days standard for corporate BPO/tech.
  const dailyRate = +((monthlySalary * 12) / 261).toFixed(2);
  const hourlyRate = +(dailyRate / 8).toFixed(2);

  let multiplier = 0;
  let otMultiplier = 0;
  let breakdown = '';

  if (holidayType === 'Regular Holiday') {
    if (!worked) {
      multiplier = 1.0; // 100%
      breakdown = 'Unworked Regular Holiday: 100% Daily Basic Wage';
    } else {
      if (isOnRestDay) {
        multiplier = 2.6; // 260%
        otMultiplier = 2.6 * 1.3; // 338%
        breakdown = 'Worked Regular Holiday on Rest Day: 260% for first 8 hrs';
      } else {
        multiplier = 2.0; // 200%
        otMultiplier = 2.0 * 1.3; // 260%
        breakdown = 'Worked Regular Holiday: 200% for first 8 hrs';
      }
    }
  } else if (holidayType === 'Special Non-Working Day' || holidayType === 'Local / LGU Holiday') {
    if (!worked) {
      multiplier = 0.0; // No work no pay
      breakdown = 'Unworked Special Holiday: No Work, No Pay (0.00)';
    } else {
      if (isOnRestDay) {
        multiplier = 1.5; // 150%
        otMultiplier = 1.5 * 1.3; // 195%
        breakdown = 'Worked Special Holiday on Rest Day: 150% for first 8 hrs';
      } else {
        multiplier = 1.3; // 130%
        otMultiplier = 1.3 * 1.3; // 169%
        breakdown = 'Worked Special Holiday: 130% for first 8 hrs';
      }
    }
  } else {
    // Company declared or Special working
    multiplier = worked ? 1.0 : 1.0;
    otMultiplier = 1.25;
    breakdown = 'Standard Workday Rate';
  }

  const basePay = worked ? (dailyRate * multiplier * (Math.min(hoursWorked, 8) / 8)) : (dailyRate * multiplier);
  const otPay = overtimeHours * (hourlyRate * (otMultiplier || 1.25));
  const totalHolidayPay = +(basePay + otPay).toFixed(2);

  return {
    dailyRate,
    hourlyRate,
    multiplier,
    otMultiplier,
    basePay: +basePay.toFixed(2),
    otPay: +otPay.toFixed(2),
    totalHolidayPay,
    breakdown,
  };
}
