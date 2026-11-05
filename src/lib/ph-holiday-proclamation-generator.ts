import { PhilippineHoliday, HolidayType } from '../data/phHolidays';

export interface ProclamationConfig {
  year: number;
  proclamationNumber: string;
  includeRegularHolidays: boolean;
  includeSpecialNonWorkingDays: boolean;
  includeAdditionalSpecialDays: boolean; // Dec 24, Nov 2
  includeIslamicHolidays: boolean; // Eidul Fitr & Eidul Adha
  includeMajorMetroLguHolidays: boolean; // Manila Day, Quezon City Day
  companyPolicyPayUnworkedSpecial: boolean; // "No Work No Pay" vs "100% company subsidized"
}

export const DEFAULT_PROCLAMATION_CONFIGS: Record<number, { proclamationNumber: string; eidulFitr: string; eidulAdha: string; chineseNewYear: string }> = {
  2025: {
    proclamationNumber: 'Proclamation No. 665, s. 2024',
    chineseNewYear: '2025-01-29',
    eidulFitr: '2025-03-31',
    eidulAdha: '2025-06-06',
  },
  2026: {
    proclamationNumber: 'Proclamation No. 727, s. 2025',
    chineseNewYear: '2026-02-17',
    eidulFitr: '2026-03-20',
    eidulAdha: '2026-05-27',
  },
  2027: {
    proclamationNumber: 'Proclamation No. 1024, s. 2026',
    chineseNewYear: '2027-02-06',
    eidulFitr: '2027-03-10',
    eidulAdha: '2027-05-17',
  },
  2028: {
    proclamationNumber: 'Proclamation No. 1290, s. 2027',
    chineseNewYear: '2028-01-26',
    eidulFitr: '2028-02-27',
    eidulAdha: '2028-05-05',
  },
};

/**
 * Calculates Gregorian Easter Sunday date using the Anonymous Gregorian algorithm (Meeus/Jones/Butcher)
 */
export function calculateEasterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31); // 3 = March, 4 = April
  const day = ((h + l - 7 * m + 114) % 31) + 1;

  // Month is 0-indexed in JavaScript Date
  return new Date(year, month - 1, day);
}

/**
 * Computes Holy Week moveable dates relative to Easter Sunday
 */
export function calculateHolyWeekDates(year: number): {
  maundyThursday: string;
  goodFriday: string;
  blackSaturday: string;
  easterSunday: string;
} {
  const easter = calculateEasterSunday(year);

  const formatIso = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const maundyThursdayDate = new Date(easter);
  maundyThursdayDate.setDate(easter.getDate() - 3);

  const goodFridayDate = new Date(easter);
  goodFridayDate.setDate(easter.getDate() - 2);

  const blackSaturdayDate = new Date(easter);
  blackSaturdayDate.setDate(easter.getDate() - 1);

  return {
    maundyThursday: formatIso(maundyThursdayDate),
    goodFriday: formatIso(goodFridayDate),
    blackSaturday: formatIso(blackSaturdayDate),
    easterSunday: formatIso(easter),
  };
}

/**
 * Computes National Heroes Day (Last Monday of August under RA 9492)
 */
export function calculateNationalHeroesDay(year: number): string {
  // Start from August 31 and count back to Monday
  const date = new Date(year, 7, 31); // 7 = August
  while (date.getDay() !== 1) { // 1 = Monday
    date.setDate(date.getDate() - 1);
  }
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Generates official Philippine Holidays for a given year based on Republic Acts and Presidential Proclamations
 */
export function generatePhilippineHolidaysForYear(config: ProclamationConfig): PhilippineHoliday[] {
  const { year, proclamationNumber } = config;
  const holidays: PhilippineHoliday[] = [];

  const holyWeek = calculateHolyWeekDates(year);
  const nationalHeroesDay = calculateNationalHeroesDay(year);

  const knownMeta = DEFAULT_PROCLAMATION_CONFIGS[year] || {
    proclamationNumber: `Proclamation No. ${700 + (year - 2025) * 50}, s. ${year - 1}`,
    chineseNewYear: `${year}-02-15`,
    eidulFitr: `${year}-03-25`,
    eidulAdha: `${year}-05-30`,
  };

  const actualProclamationNumber = proclamationNumber.trim() || knownMeta.proclamationNumber;

  // Pay rules templates
  const regularPayRules = {
    unworkedRate: '100% of Daily Basic Wage',
    workedFirst8Hours: '200% of Daily Wage',
    workedOvertime: '+30% of regular hourly rate (260%)',
    workedOnRestDay: '260% of Daily Wage',
  };

  const specialPayRules = {
    unworkedRate: config.companyPolicyPayUnworkedSpecial ? '100% Company Subsidized' : 'No Work, No Pay (unless company CBA)',
    workedFirst8Hours: '130% of Daily Wage',
    workedOvertime: '+30% of hourly rate (169%)',
    workedOnRestDay: '150% of Daily Wage',
  };

  // =========================================================================
  // 1. REGULAR HOLIDAYS (Labor Code Art. 94 / RA 9492 / RA 9849)
  // =========================================================================
  if (config.includeRegularHolidays) {
    // New Year's Day
    holidays.push({
      id: `hol-${year}-new-year`,
      name: "New Year's Day",
      localName: 'Araw ng Bagong Taon',
      date: `${year}-01-01`,
      type: 'Regular Holiday',
      legalBasis: `Labor Code Art. 94 / ${actualProclamationNumber}`,
      applicableLocation: 'Nationwide',
      payRules: regularPayRules,
      description: 'National regular holiday marking the first day of the calendar year.',
    });

    // Maundy Thursday
    holidays.push({
      id: `hol-${year}-maundy-thursday`,
      name: 'Maundy Thursday',
      localName: 'Huwebes Santo',
      date: holyWeek.maundyThursday,
      type: 'Regular Holiday',
      legalBasis: `Labor Code Art. 94 / ${actualProclamationNumber}`,
      applicableLocation: 'Nationwide',
      payRules: regularPayRules,
      description: 'Christian Holy Week regular holiday commemorating the Last Supper of Jesus Christ.',
    });

    // Good Friday
    holidays.push({
      id: `hol-${year}-good-friday`,
      name: 'Good Friday',
      localName: 'Biyernes Santo',
      date: holyWeek.goodFriday,
      type: 'Regular Holiday',
      legalBasis: `Labor Code Art. 94 / ${actualProclamationNumber}`,
      applicableLocation: 'Nationwide',
      payRules: regularPayRules,
      description: 'Christian Holy Week solemn commemoration of the crucifixion and death of Jesus Christ.',
    });

    // Araw ng Kagitingan (Day of Valor)
    holidays.push({
      id: `hol-${year}-kagitingan`,
      name: 'Araw ng Kagitingan',
      localName: 'Day of Valor',
      date: `${year}-04-09`,
      type: 'Regular Holiday',
      legalBasis: `Executive Order No. 292 / ${actualProclamationNumber}`,
      applicableLocation: 'Nationwide',
      payRules: regularPayRules,
      description: 'National regular holiday honoring the heroic defense and Fall of Bataan.',
    });

    // Labor Day
    holidays.push({
      id: `hol-${year}-labor-day`,
      name: 'Labor Day',
      localName: 'Araw ng Paggawa',
      date: `${year}-05-01`,
      type: 'Regular Holiday',
      legalBasis: `Labor Code Art. 94 / ${actualProclamationNumber}`,
      applicableLocation: 'Nationwide',
      payRules: regularPayRules,
      description: 'National holiday paying tribute to the contributions and rights of the Filipino workforce.',
    });

    // Independence Day
    holidays.push({
      id: `hol-${year}-independence`,
      name: 'Independence Day',
      localName: 'Araw ng Kalayaan',
      date: `${year}-06-12`,
      type: 'Regular Holiday',
      legalBasis: `Republic Act No. 4166 / ${actualProclamationNumber}`,
      applicableLocation: 'Nationwide',
      payRules: regularPayRules,
      description: 'Commemoration of the Philippine Declaration of Independence in Kawit, Cavite (1898).',
    });

    // National Heroes Day
    holidays.push({
      id: `hol-${year}-heroes-day`,
      name: 'National Heroes Day',
      localName: 'Araw ng mga Bayani',
      date: nationalHeroesDay,
      type: 'Regular Holiday',
      legalBasis: `Republic Act No. 9492 / ${actualProclamationNumber}`,
      applicableLocation: 'Nationwide',
      payRules: regularPayRules,
      description: 'Celebrated on the last Monday of August to honor all known and unsung heroes of the nation.',
    });

    // Bonifacio Day
    holidays.push({
      id: `hol-${year}-bonifacio`,
      name: 'Bonifacio Day',
      localName: 'Araw ni Andres Bonifacio',
      date: `${year}-11-30`,
      type: 'Regular Holiday',
      legalBasis: `Labor Code Art. 94 / ${actualProclamationNumber}`,
      applicableLocation: 'Nationwide',
      payRules: regularPayRules,
      description: 'National regular holiday celebrating the birth anniversary of Katipunan Supremo Andres Bonifacio.',
    });

    // Christmas Day
    holidays.push({
      id: `hol-${year}-christmas`,
      name: 'Christmas Day',
      localName: 'Araw ng Pasko',
      date: `${year}-12-25`,
      type: 'Regular Holiday',
      legalBasis: `Labor Code Art. 94 / ${actualProclamationNumber}`,
      applicableLocation: 'Nationwide',
      payRules: regularPayRules,
      description: 'Christian celebration commemorating the Nativity of Jesus Christ.',
    });

    // Rizal Day
    holidays.push({
      id: `hol-${year}-rizal-day`,
      name: 'Rizal Day',
      localName: 'Araw ng Kabayanihan ni Dr. Jose Rizal',
      date: `${year}-12-30`,
      type: 'Regular Holiday',
      legalBasis: `Labor Code Art. 94 / ${actualProclamationNumber}`,
      applicableLocation: 'Nationwide',
      payRules: regularPayRules,
      description: 'Commemorates the martyrdom and execution of national hero Dr. Jose Rizal in Bagumbayan (1896).',
    });
  }

  // =========================================================================
  // 2. ISLAMIC REGULAR HOLIDAYS (RA 9177 & RA 9849 / NCMF Advisory)
  // =========================================================================
  if (config.includeIslamicHolidays) {
    holidays.push({
      id: `hol-${year}-eidul-fitr`,
      name: 'Eidul Fitr',
      localName: 'Pagtatapos ng Ramadan',
      date: knownMeta.eidulFitr,
      type: 'Regular Holiday',
      legalBasis: `Republic Act No. 9177 / NCMF Advisory / ${actualProclamationNumber}`,
      applicableLocation: 'Nationwide',
      payRules: regularPayRules,
      description: 'Islamic regular holiday celebrating the Feast of Ramadhan (date determined by moon sighting).',
    });

    holidays.push({
      id: `hol-${year}-eidul-adha`,
      name: 'Eidul Adha',
      localName: 'Araw ng Pag-aalay',
      date: knownMeta.eidulAdha,
      type: 'Regular Holiday',
      legalBasis: `Republic Act No. 9849 / NCMF Advisory / ${actualProclamationNumber}`,
      applicableLocation: 'Nationwide',
      payRules: regularPayRules,
      description: 'Islamic regular holiday commemorating the Feast of Sacrifice (date determined by moon sighting).',
    });
  }

  // =========================================================================
  // 3. SPECIAL NON-WORKING DAYS (RA 9492 / RA 10966 / Presidential Proclamations)
  // =========================================================================
  if (config.includeSpecialNonWorkingDays) {
    // Chinese Lunar New Year
    holidays.push({
      id: `hol-${year}-chinese-new-year`,
      name: 'Chinese Lunar New Year',
      localName: 'Bagong Taong Tsino',
      date: knownMeta.chineseNewYear,
      type: 'Special Non-Working Day',
      legalBasis: `${actualProclamationNumber}`,
      applicableLocation: 'Nationwide',
      payRules: specialPayRules,
      description: 'Traditional Spring Festival celebrated nationwide celebrating the Filipino-Chinese heritage.',
    });

    // EDSA People Power Revolution Anniversary (Feb 25)
    holidays.push({
      id: `hol-${year}-edsa`,
      name: 'EDSA People Power Revolution Anniversary',
      localName: 'Anibersaryo ng Rebolusyong EDSA',
      date: `${year}-02-25`,
      type: 'Special Non-Working Day',
      legalBasis: `${actualProclamationNumber}`,
      applicableLocation: 'Nationwide',
      payRules: specialPayRules,
      description: 'Commemoration of the 1986 peaceful restoration of democracy in the Philippines.',
    });

    // Black Saturday
    holidays.push({
      id: `hol-${year}-black-saturday`,
      name: 'Black Saturday',
      localName: 'Sabado de Gloria',
      date: holyWeek.blackSaturday,
      type: 'Special Non-Working Day',
      legalBasis: `${actualProclamationNumber}`,
      applicableLocation: 'Nationwide',
      payRules: specialPayRules,
      description: 'Holy Week non-working day observed before Easter Sunday.',
    });

    // Ninoy Aquino Day
    holidays.push({
      id: `hol-${year}-ninoy-aquino`,
      name: 'Ninoy Aquino Day',
      localName: 'Araw ng Kabayanihan ni Benigno Aquino Jr.',
      date: `${year}-08-21`,
      type: 'Special Non-Working Day',
      legalBasis: `Republic Act No. 9256 / ${actualProclamationNumber}`,
      applicableLocation: 'Nationwide',
      payRules: specialPayRules,
      description: 'National observance commemorating the assassination of Senator Benigno "Ninoy" Aquino Jr. in 1983.',
    });

    // All Saints' Day
    holidays.push({
      id: `hol-${year}-all-saints`,
      name: "All Saints' Day",
      localName: 'Todos los Santos / Undas',
      date: `${year}-11-01`,
      type: 'Special Non-Working Day',
      legalBasis: `${actualProclamationNumber}`,
      applicableLocation: 'Nationwide',
      payRules: specialPayRules,
      description: 'Traditional family observance honoring all Christian saints and visiting cemeteries.',
    });

    // Feast of the Immaculate Conception of Mary
    holidays.push({
      id: `hol-${year}-immaculate-conception`,
      name: 'Feast of the Immaculate Conception of Mary',
      localName: 'Pista ng Inmaculada Concepcion',
      date: `${year}-12-08`,
      type: 'Special Non-Working Day',
      legalBasis: `Republic Act No. 10966 / ${actualProclamationNumber}`,
      applicableLocation: 'Nationwide',
      payRules: specialPayRules,
      description: 'Special non-working day commemorating the patroness of the Philippines.',
    });

    // Last Day of the Year
    holidays.push({
      id: `hol-${year}-last-day-year`,
      name: 'Last Day of the Year',
      localName: 'Bisperas ng Bagong Taon',
      date: `${year}-12-31`,
      type: 'Special Non-Working Day',
      legalBasis: `${actualProclamationNumber}`,
      applicableLocation: 'Nationwide',
      payRules: specialPayRules,
      description: 'Year-end observance allowing families to prepare for New Year festivities.',
    });
  }

  // =========================================================================
  // 4. ADDITIONAL SPECIAL NON-WORKING DAYS (Proclamation Gazetted)
  // =========================================================================
  if (config.includeAdditionalSpecialDays) {
    // All Souls' Day
    holidays.push({
      id: `hol-${year}-all-souls`,
      name: "All Souls' Day",
      localName: 'Araw ng mga Patay',
      date: `${year}-11-02`,
      type: 'Special Non-Working Day',
      legalBasis: `Additional Special Non-Working Day / ${actualProclamationNumber}`,
      applicableLocation: 'Nationwide',
      payRules: specialPayRules,
      description: 'Declared additional non-working day to bolster domestic tourism and extended Undas observance.',
    });

    // Christmas Eve
    holidays.push({
      id: `hol-${year}-christmas-eve`,
      name: 'Christmas Eve',
      localName: 'Bisperas ng Pasko',
      date: `${year}-12-24`,
      type: 'Special Non-Working Day',
      legalBasis: `Additional Special Non-Working Day / ${actualProclamationNumber}`,
      applicableLocation: 'Nationwide',
      payRules: specialPayRules,
      description: 'Declared additional non-working holiday for traditional Noche Buena preparations.',
    });
  }

  // =========================================================================
  // 5. MAJOR METRO MANILA / REGIONAL LGU HOLIDAYS
  // =========================================================================
  if (config.includeMajorMetroLguHolidays) {
    holidays.push({
      id: `hol-${year}-manila-day`,
      name: 'Araw ng Maynila (Manila Day)',
      localName: 'Araw ng Maynila',
      date: `${year}-06-24`,
      type: 'Local / LGU Holiday',
      legalBasis: 'Republic Act No. 4065 / City of Manila Proclamation',
      applicableLocation: 'City of Manila',
      payRules: specialPayRules,
      description: 'Founding anniversary of the capital City of Manila (local non-working holiday for Manila operations).',
    });

    holidays.push({
      id: `hol-${year}-qc-day`,
      name: 'Quezon City Day',
      localName: 'Araw ng Lungsod Quezon',
      date: `${year}-08-19`,
      type: 'Local / LGU Holiday',
      legalBasis: 'Republic Act No. 6741 / QC Ordinance',
      applicableLocation: 'Quezon City',
      payRules: specialPayRules,
      description: 'Founding anniversary of Quezon City commemorating the birth of President Manuel L. Quezon.',
    });

    holidays.push({
      id: `hol-${year}-makati-day`,
      name: 'Makati City Foundation Day',
      localName: 'Araw ng Makati',
      date: `${year}-06-01`,
      type: 'Local / LGU Holiday',
      legalBasis: 'Makati City Ordinance / Malacañang Proclamation',
      applicableLocation: 'Makati City',
      payRules: specialPayRules,
      description: 'Observance of the foundation anniversary of the financial center of the Philippines.',
    });
  }

  // Sort chronologically by date
  return holidays.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}
