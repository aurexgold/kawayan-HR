import React, { useState, useMemo } from 'react';
import { 
  Calculator, Gift, Calendar, DollarSign, ShieldCheck, 
  AlertCircle, CheckCircle2, Download, Printer, User, 
  Info, TrendingUp, Scale, Clock, Sparkles, ArrowRight, RotateCcw
} from 'lucide-react';
import { Employee } from '../../types';
import { calculateDailyRate, TAX_EXEMPTION_CEILING_TRAIN, MONTH_NAMES } from '../../lib/thirteenth-month';

interface ThirteenthMonthCalculatorViewProps {
  employees: Employee[];
  onSelectEmployeeForInspector?: (empId: string) => void;
}

export function ThirteenthMonthCalculatorView({
  employees,
  onSelectEmployeeForInspector,
}: ThirteenthMonthCalculatorViewProps) {
  // Mode: custom simulation or employee sync
  const [selectedEmpId, setSelectedEmpId] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [basicSalary, setBasicSalary] = useState<number>(45000);
  const [workingDaysFactor, setWorkingDaysFactor] = useState<261 | 313>(261); // 261 = 5-day week, 313 = 6-day week
  
  // Employment timeline in year
  const [monthsRendered, setMonthsRendered] = useState<number>(12);
  const [joinMonthIndex, setJoinMonthIndex] = useState<number>(0); // 0 = Jan
  const [unpaidLwopDays, setUnpaidLwopDays] = useState<number>(0);
  const [midYearAdvance, setMidYearAdvance] = useState<number>(0);
  
  // Mid-year salary increment toggle
  const [hasSalaryIncrease, setHasSalaryIncrease] = useState<boolean>(false);
  const [promotionMonth, setPromotionMonth] = useState<number>(6); // July
  const [increasedSalary, setIncreasedSalary] = useState<number>(55000);

  // Voucher preview modal
  const [showVoucherModal, setShowVoucherModal] = useState<boolean>(false);

  // When an employee is chosen from roster
  const handleSelectEmployee = (empId: string) => {
    setSelectedEmpId(empId);
    if (!empId) {
      setBasicSalary(45000);
      setMonthsRendered(12);
      setJoinMonthIndex(0);
      setUnpaidLwopDays(0);
      setMidYearAdvance(0);
      setHasSalaryIncrease(false);
      return;
    }
    const emp = employees.find(e => e.id === empId);
    if (emp) {
      setBasicSalary(emp.basicSalary);
      const hireDate = new Date(emp.joinDate);
      const hireYear = hireDate.getFullYear();
      const hireMonth = hireDate.getMonth();
      
      if (hireYear === selectedYear) {
        setJoinMonthIndex(hireMonth);
        const activeMonths = 12 - hireMonth;
        setMonthsRendered(activeMonths);
      } else if (hireYear > selectedYear) {
        setJoinMonthIndex(11);
        setMonthsRendered(0);
      } else {
        setJoinMonthIndex(0);
        setMonthsRendered(12);
      }

      // Preload custom preset samples if Jose Rizal or Gabriela Silang
      if (emp.id === 'emp-003') {
        setUnpaidLwopDays(2);
      } else {
        setUnpaidLwopDays(0);
      }

      if (emp.id === 'emp-005') {
        setMidYearAdvance(40000);
      } else {
        setMidYearAdvance(0);
      }

      setHasSalaryIncrease(false);
    }
  };

  // Preset scenarios
  const applyScenario = (type: 'full' | 'mid-year-hire' | 'lwop' | 'taxable-exec' | 'promoted' | 'advance') => {
    setSelectedEmpId('');
    if (type === 'full') {
      setBasicSalary(42000);
      setMonthsRendered(12);
      setJoinMonthIndex(0);
      setUnpaidLwopDays(0);
      setMidYearAdvance(0);
      setHasSalaryIncrease(false);
    } else if (type === 'mid-year-hire') {
      setBasicSalary(35000);
      setJoinMonthIndex(6); // July
      setMonthsRendered(6);
      setUnpaidLwopDays(0);
      setMidYearAdvance(0);
      setHasSalaryIncrease(false);
    } else if (type === 'lwop') {
      setBasicSalary(38000);
      setMonthsRendered(12);
      setJoinMonthIndex(0);
      setUnpaidLwopDays(8);
      setMidYearAdvance(0);
      setHasSalaryIncrease(false);
    } else if (type === 'taxable-exec') {
      setBasicSalary(125000);
      setMonthsRendered(12);
      setJoinMonthIndex(0);
      setUnpaidLwopDays(0);
      setMidYearAdvance(0);
      setHasSalaryIncrease(false);
    } else if (type === 'promoted') {
      setBasicSalary(40000);
      setMonthsRendered(12);
      setJoinMonthIndex(0);
      setUnpaidLwopDays(0);
      setMidYearAdvance(0);
      setHasSalaryIncrease(true);
      setPromotionMonth(6); // July
      setIncreasedSalary(52000);
    } else if (type === 'advance') {
      setBasicSalary(50000);
      setMonthsRendered(12);
      setJoinMonthIndex(0);
      setUnpaidLwopDays(0);
      setMidYearAdvance(25000); // 50% paid in June
      setHasSalaryIncrease(false);
    }
  };

  // Daily rate calculation per DOLE standards
  const dailyRate = useMemo(() => {
    return (basicSalary * 12) / workingDaysFactor;
  }, [basicSalary, workingDaysFactor]);

  // Month-by-month calculation
  const calculation = useMemo(() => {
    let totalGrossBasic = 0;
    const monthlyList: Array<{
      monthIndex: number;
      monthName: string;
      isActive: boolean;
      salary: number;
      lwopDays: number;
      lwopDeduction: number;
      netBasic: number;
    }> = [];

    // Distribute LWOP evenly or apply to active months
    const activeMonthCount = Math.min(12, Math.max(0, monthsRendered));
    const startM = Math.max(0, 12 - activeMonthCount);

    for (let m = 0; m < 12; m++) {
      const monthName = MONTH_NAMES[m];
      const isActive = m >= startM;

      let monthSalary = 0;
      let monthLwop = 0;
      let monthLwopDed = 0;
      let netBasic = 0;

      if (isActive) {
        if (hasSalaryIncrease && m >= promotionMonth) {
          monthSalary = increasedSalary;
        } else {
          monthSalary = basicSalary;
        }

        const effDaily = (monthSalary * 12) / workingDaysFactor;
        // Distribute total unpaid days
        if (unpaidLwopDays > 0) {
          // allocate fractional or integer to this month
          const alloc = unpaidLwopDays / Math.max(1, activeMonthCount);
          monthLwop = Math.round(alloc * 10) / 10;
          monthLwopDed = Math.round(alloc * effDaily);
        }

        netBasic = Math.max(0, monthSalary - monthLwopDed);
        totalGrossBasic += netBasic;
      }

      monthlyList.push({
        monthIndex: m,
        monthName,
        isActive,
        salary: monthSalary,
        lwopDays: monthLwop,
        lwopDeduction: monthLwopDed,
        netBasic,
      });
    }

    // P.D. 851 Formula: Total Basic Salary Earned within Calendar Year / 12
    const grossThirteenthMonth = Math.round((totalGrossBasic / 12) * 100) / 100;
    const netPayableAfterAdvance = Math.max(0, grossThirteenthMonth - midYearAdvance);

    // TRAIN Law Tax assessment
    const taxExemptAmount = Math.min(grossThirteenthMonth, TAX_EXEMPTION_CEILING_TRAIN);
    const taxableExcess = Math.max(0, grossThirteenthMonth - TAX_EXEMPTION_CEILING_TRAIN);
    const isTaxable = taxableExcess > 0;
    
    // Graduated withholding tax estimate on taxable excess (approx 20%)
    const estimatedTax = isTaxable ? Math.round(taxableExcess * 0.20) : 0;
    const netTakeHome = Math.max(0, netPayableAfterAdvance - estimatedTax);

    // Eligibility check under P.D. 851 (Must have at least 1 month service)
    const isEligible = activeMonthCount >= 1;

    return {
      activeMonthCount,
      totalGrossBasic: Math.round(totalGrossBasic),
      grossThirteenthMonth,
      netPayableAfterAdvance,
      taxExemptAmount,
      taxableExcess,
      isTaxable,
      estimatedTax,
      netTakeHome,
      isEligible,
      monthlyList,
      proRatedRatio: `${activeMonthCount}/12`,
      proRatedPercent: ((activeMonthCount / 12) * 100).toFixed(1),
    };
  }, [
    basicSalary, workingDaysFactor, monthsRendered, 
    unpaidLwopDays, midYearAdvance, hasSalaryIncrease, 
    promotionMonth, increasedSalary
  ]);

  const selectedEmp = employees.find(e => e.id === selectedEmpId);

  return (
    <div className="space-y-6">
      {/* Top Banner & P.D. 851 Header */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 rounded-2xl p-6 text-white shadow-lg border border-amber-900/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-amber-500/10 to-transparent pointer-events-none" />
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 relative z-10">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/20 text-amber-300 rounded-full text-xs font-semibold border border-amber-400/30">
                <Gift className="w-3.5 h-3.5 text-amber-400" />
                Presidential Decree No. 851 Statutory Calculator
              </span>
              <span className="text-xs text-slate-300 font-mono">
                Formula: Total Basic Salary Earned ÷ 12
              </span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Automated 13th-Month Pay Computation Engine
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Computes pro-rated statutory 13th-month compensation compliant with DOLE P.D. 851 guidelines, 
              subtracts Leave Without Pay (LWOP) deductions, accounts for mid-year cash advances, and applies the 
              ₱90,000 tax-exemption threshold under the TRAIN Law.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowVoucherModal(true)}
              className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors shadow-sm"
            >
              <Printer className="w-4 h-4" />
              Print P.D. 851 Voucher
            </button>
          </div>
        </div>

        {/* Quick Scenario Buttons */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mr-1">
            Quick Scenarios:
          </span>
          <button
            onClick={() => applyScenario('full')}
            className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            Full-Year Regular (12/12)
          </button>
          <button
            onClick={() => applyScenario('mid-year-hire')}
            className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            Mid-Year Hire (6 Months)
          </button>
          <button
            onClick={() => applyScenario('lwop')}
            className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            With LWOP Absences (8 Days)
          </button>
          <button
            onClick={() => applyScenario('promoted')}
            className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            Promoted with Mid-Year Raise
          </button>
          <button
            onClick={() => applyScenario('advance')}
            className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            With 50% Mid-Year Advance
          </button>
          <button
            onClick={() => applyScenario('taxable-exec')}
            className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            Executive (&gt; ₱90k Taxable Cap)
          </button>
        </div>
      </div>

      {/* Main Calculator Deck: Left Inputs, Right Live Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Input Deck (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-5">
            {/* Header / Select Employee */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Target Employee</span>
                <h3 className="font-bold text-slate-900 text-base">Select Employee or Simulate</h3>
              </div>

              <select
                value={selectedEmpId}
                onChange={(e) => handleSelectEmployee(e.target.value)}
                className="w-full sm:w-64 px-3 py-1.5 text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">-- Custom Simulation (Enter Inputs Below) --</option>
                {employees.map(e => (
                  <option key={e.id} value={e.id}>
                    {e.firstName} {e.lastName} ({e.role} - ₱{e.basicSalary.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            {/* Input 1: Basic Monthly Salary */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-amber-600" />
                  Monthly Basic Salary (PHP):
                </label>
                <span className="text-base font-bold font-mono text-amber-700">
                  ₱{basicSalary.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">₱</span>
                  <input
                    type="number"
                    min="10000"
                    max="500000"
                    step="1000"
                    value={basicSalary}
                    onChange={(e) => {
                      setBasicSalary(parseFloat(e.target.value) || 0);
                      setSelectedEmpId('');
                    }}
                    className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <input
                  type="range"
                  min="15000"
                  max="150000"
                  step="1000"
                  value={Math.min(Math.max(basicSalary, 15000), 150000)}
                  onChange={(e) => {
                    setBasicSalary(parseFloat(e.target.value));
                    setSelectedEmpId('');
                  }}
                  className="w-44 accent-amber-600 cursor-pointer"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                P.D. 851 Rule: Strictly includes basic salary; excludes overtime, night shift diff, allowances, and bonuses.
              </p>
            </div>

            {/* Input 2: Working Days Factor & Daily Rate */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <label className="text-[11px] font-bold text-slate-600 block">
                  DOLE Working Days Factor:
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setWorkingDaysFactor(261)}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold border transition-colors ${
                      workingDaysFactor === 261
                        ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    261 Days (5-day week)
                  </button>
                  <button
                    type="button"
                    onClick={() => setWorkingDaysFactor(313)}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold border transition-colors ${
                      workingDaysFactor === 313
                        ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    313 Days (6-day week)
                  </button>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5">
                <span className="text-[11px] font-bold text-slate-400 block uppercase">Calculated Daily Rate</span>
                <span className="text-base font-bold font-mono text-slate-900 block">
                  ₱{dailyRate.toFixed(2)} / day
                </span>
                <span className="text-[10px] text-slate-500">
                  (₱{basicSalary.toLocaleString()} × 12) ÷ {workingDaysFactor} days
                </span>
              </div>
            </div>

            {/* Input 3: Active Months Rendered (Pro-Ration) */}
            <div className="pt-2">
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  Active Months Rendered in {selectedYear}:
                </label>
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                  monthsRendered >= 12 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {calculation.proRatedRatio} ({calculation.proRatedPercent}%)
                </span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="12"
                  step="1"
                  value={monthsRendered}
                  onChange={(e) => {
                    setMonthsRendered(parseInt(e.target.value));
                    setSelectedEmpId('');
                  }}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <span className="text-sm font-bold font-mono w-16 text-right text-slate-900">
                  {monthsRendered} mos
                </span>
              </div>
              {!calculation.isEligible && (
                <div className="mt-2 p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>
                    <strong>P.D. 851 Ineligible:</strong> Employee has rendered less than 1 full month of service within {selectedYear}. At least one (1) month of service is required by law.
                  </span>
                </div>
              )}
            </div>

            {/* Input 4: Leave Without Pay (LWOP) Absences */}
            <div className="pt-2">
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-purple-600" />
                  Leave Without Pay (LWOP) / Unpaid Days:
                </label>
                <span className="text-xs font-bold font-mono text-purple-700">
                  {unpaidLwopDays} day(s) = -₱{(unpaidLwopDays * dailyRate).toFixed(0)}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={unpaidLwopDays}
                  onChange={(e) => {
                    setUnpaidLwopDays(Math.max(0, parseInt(e.target.value) || 0));
                    setSelectedEmpId('');
                  }}
                  className="w-24 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold font-mono"
                />
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={Math.min(unpaidLwopDays, 30)}
                  onChange={(e) => {
                    setUnpaidLwopDays(parseInt(e.target.value));
                    setSelectedEmpId('');
                  }}
                  className="w-full accent-purple-600 cursor-pointer"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Absences without pay reduce the basic salary earned, which proportionally reduces 13th month liability.
              </p>
            </div>

            {/* Input 5: Mid-Year Cash Advance (Optional) */}
            <div className="pt-2">
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-rose-600" />
                  Mid-Year 13th Month Advance Already Paid:
                </label>
                <span className="text-xs font-bold font-mono text-rose-700">
                  ₱{midYearAdvance.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">₱</span>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={midYearAdvance}
                    onChange={(e) => {
                      setMidYearAdvance(Math.max(0, parseFloat(e.target.value) || 0));
                      setSelectedEmpId('');
                    }}
                    className="w-full pl-7 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold font-mono"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setMidYearAdvance(Math.round(basicSalary * 0.5))}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors"
                >
                  Set to 50% (₱{(basicSalary * 0.5).toLocaleString()})
                </button>
                <button
                  type="button"
                  onClick={() => setMidYearAdvance(0)}
                  className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-lg text-xs transition-colors"
                >
                  Clear
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                If the employer released an advance in May/June, it is deducted from the mandatory December 24 balance.
              </p>
            </div>

            {/* Optional Promotion / Salary Raise Toggle */}
            <div className="pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasSalaryIncrease}
                  onChange={(e) => setHasSalaryIncrease(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span>Account for Mid-Year Salary Increase / Promotion</span>
              </label>

              {hasSalaryIncrease && (
                <div className="mt-3 grid grid-cols-2 gap-3 p-3 bg-amber-50/60 border border-amber-200 rounded-xl text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-amber-900 block mb-1">Effective Month:</label>
                    <select
                      value={promotionMonth}
                      onChange={(e) => setPromotionMonth(parseInt(e.target.value))}
                      className="w-full px-2 py-1 bg-white border border-amber-300 rounded text-xs font-medium"
                    >
                      {MONTH_NAMES.map((name, i) => (
                        <option key={name} value={i}>
                          Starting {name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-amber-900 block mb-1">New Basic Salary:</label>
                    <input
                      type="number"
                      value={increasedSalary}
                      onChange={(e) => setIncreasedSalary(parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1 bg-white border border-amber-300 rounded text-xs font-bold font-mono"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Automated Results & P.D. 851 Breakdown (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Main Result Card */}
          <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-6 text-white shadow-lg border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Gift className="w-4 h-4 text-amber-400" />
                Mandatory P.D. 851 Entitlement
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30">
                Due: Dec 24, {selectedYear}
              </span>
            </div>

            <div>
              <span className="text-xs text-slate-400 block uppercase font-medium">
                Gross 13th-Month Pay:
              </span>
              <span className="text-3xl sm:text-4xl font-black font-mono text-white mt-1 block">
                ₱{calculation.grossThirteenthMonth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-xs text-amber-300 font-mono mt-1 block">
                = (₱{calculation.totalGrossBasic.toLocaleString()} Total Basic) ÷ 12
              </span>
            </div>

            {/* If mid-year advance exists */}
            {midYearAdvance > 0 && (
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 text-xs space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>Gross Entitlement:</span>
                  <span className="font-mono">₱{calculation.grossThirteenthMonth.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-rose-400">
                  <span>Less: Mid-Year Advance:</span>
                  <span className="font-mono">-₱{midYearAdvance.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-white font-bold pt-1 border-t border-slate-700">
                  <span>Remaining Dec 24 Balance:</span>
                  <span className="font-mono text-emerald-400">₱{calculation.netPayableAfterAdvance.toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* TRAIN Law Tax Exemption Card */}
            <div className="p-3.5 bg-slate-800/60 rounded-xl border border-slate-700 text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-200 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  TRAIN Law Exemption Status:
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  calculation.isTaxable
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                }`}>
                  {calculation.isTaxable ? 'Subject to Withholding' : '100% Tax-Exempt'}
                </span>
              </div>

              <div className="space-y-1 text-[11px] text-slate-300 font-mono">
                <div className="flex justify-between">
                  <span>Statutory Tax-Free Ceiling:</span>
                  <span>₱90,000.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax-Exempt Portion:</span>
                  <span className="text-emerald-400">₱{calculation.taxExemptAmount.toFixed(2)}</span>
                </div>
                {calculation.isTaxable && (
                  <>
                    <div className="flex justify-between text-amber-300">
                      <span>Taxable Excess (&gt; ₱90k):</span>
                      <span>₱{calculation.taxableExcess.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-rose-300">
                      <span>Est. Withholding Tax (~20%):</span>
                      <span>-₱{calculation.estimatedTax.toFixed(2)}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between text-white font-bold pt-1 border-t border-slate-700">
                  <span>Estimated Net Take-Home:</span>
                  <span className="text-base text-emerald-300">₱{calculation.netTakeHome.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Statutory Compliance Checklist Badges */}
            <div className="p-3 bg-emerald-950/40 border border-emerald-800/40 rounded-xl text-xs space-y-1.5 text-emerald-300">
              <div className="font-bold text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                DOLE P.D. 851 Statutory Checklist
              </div>
              <div className="text-[11px] text-emerald-200/90 space-y-0.5">
                <div>✔ Minimum 1-month service requirement: {calculation.isEligible ? 'PASSED' : 'FAILED'}</div>
                <div>✔ Wage components: Basic wage only (Excludes OT/Allowances)</div>
                <div>✔ Mandatory payment date: On or before December 24</div>
                <div>✔ Mandatory DOLE regional filing: On or before January 15</div>
              </div>
            </div>
          </div>

          {/* Month-by-month earnings accordion table */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-2">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              Monthly Basic Earned Schedule ({selectedYear})
            </span>
            <div className="overflow-x-auto max-h-56 border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold text-[10px] uppercase border-b border-slate-200">
                  <tr>
                    <th className="px-2.5 py-1.5">Month</th>
                    <th className="px-2.5 py-1.5 text-right">Base</th>
                    <th className="px-2.5 py-1.5 text-right">LWOP</th>
                    <th className="px-2.5 py-1.5 text-right">Net Basic</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {calculation.monthlyList.map(m => (
                    <tr key={m.monthIndex} className={m.isActive ? 'hover:bg-slate-50' : 'text-slate-400 bg-slate-50/50'}>
                      <td className="px-2.5 py-1 font-sans">{m.monthName}</td>
                      <td className="px-2.5 py-1 text-right">{m.isActive ? `₱${m.salary.toLocaleString()}` : '-'}</td>
                      <td className="px-2.5 py-1 text-right text-rose-600">{m.lwopDeduction > 0 ? `-₱${m.lwopDeduction}` : '-'}</td>
                      <td className="px-2.5 py-1 text-right font-bold text-slate-900">{m.isActive ? `₱${m.netBasic.toLocaleString()}` : '0.00'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Official DOLE P.D. 851 Computation Voucher Modal */}
      {showVoucherModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-bold text-sm">Official 13th-Month Pay Computation Voucher</h3>
                  <span className="text-[11px] text-slate-400">Pursuant to Presidential Decree No. 851</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Voucher
                </button>
                <button
                  onClick={() => setShowVoucherModal(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Voucher Body */}
            <div className="p-6 space-y-5 text-xs text-slate-800 bg-white">
              <div className="text-center border-b-2 border-slate-900 pb-3 space-y-0.5">
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Republic of the Philippines · DOLE P.D. 851</div>
                <div className="text-base font-extrabold uppercase text-slate-900">KAWAYAN HR PHILIPPINES INC.</div>
                <div className="text-xs font-bold text-slate-700">13TH-MONTH PAY DISBURSEMENT & STATUTORY CERTIFICATION</div>
                <div className="text-[11px] text-slate-500">Applicable Calendar Year: {selectedYear} (Mandatory Deadline: Dec 24, {selectedYear})</div>
              </div>

              {/* Employee Meta Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Employee Name</span>
                  <span className="font-bold text-slate-900">{selectedEmp ? `${selectedEmp.firstName} ${selectedEmp.lastName}` : 'Custom Simulation'}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Department / Role</span>
                  <span className="font-medium text-slate-700">{selectedEmp ? `${selectedEmp.role} (${selectedEmp.department})` : 'Rank & File Staff'}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Service Tenure</span>
                  <span className="font-bold text-amber-700">{calculation.proRatedRatio} Months ({calculation.proRatedPercent}%)</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Daily Rate Factor</span>
                  <span className="font-mono font-bold text-slate-800">{workingDaysFactor} Days</span>
                </div>
              </div>

              {/* Formula & Financial Breakdown */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-2">Computation Parameter</th>
                      <th className="px-3 py-2 text-right">Amount (PHP)</th>
                      <th className="px-3 py-2">Statutory Basis / Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="px-3 py-2 font-medium">Standard Basic Monthly Salary</td>
                      <td className="px-3 py-2 text-right font-mono font-bold">₱{basicSalary.toFixed(2)}</td>
                      <td className="px-3 py-2 text-slate-500">Excludes OT, allowances, and bonuses</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 font-medium">Total Basic Salary Earned in Year</td>
                      <td className="px-3 py-2 text-right font-mono font-bold text-slate-900">₱{calculation.totalGrossBasic.toFixed(2)}</td>
                      <td className="px-3 py-2 text-slate-500">Sum of {calculation.activeMonthCount} active months minus LWOP</td>
                    </tr>
                    <tr className="bg-amber-50/50">
                      <td className="px-3 py-2 font-bold text-amber-950">
                        Gross 13th-Month Pay (P.D. 851)
                      </td>
                      <td className="px-3 py-2 text-right font-mono font-black text-amber-900 text-sm">
                        ₱{calculation.grossThirteenthMonth.toFixed(2)}
                      </td>
                      <td className="px-3 py-2 text-amber-800 font-medium">Total Basic Earned ÷ 12</td>
                    </tr>
                    {midYearAdvance > 0 && (
                      <tr>
                        <td className="px-3 py-2 text-rose-700">Less: Mid-Year Advance Paid</td>
                        <td className="px-3 py-2 text-right font-mono font-bold text-rose-700">-₱{midYearAdvance.toFixed(2)}</td>
                        <td className="px-3 py-2 text-slate-500">Released in May/June installment</td>
                      </tr>
                    )}
                    <tr>
                      <td className="px-3 py-2">TRAIN Law Tax-Exempt Portion (≤ ₱90k)</td>
                      <td className="px-3 py-2 text-right font-mono text-emerald-700 font-bold">₱{calculation.taxExemptAmount.toFixed(2)}</td>
                      <td className="px-3 py-2 text-emerald-700">RA 10963 Sec. 32(B)(7)(e)</td>
                    </tr>
                    {calculation.isTaxable && (
                      <tr>
                        <td className="px-3 py-2 text-amber-700">Taxable Excess (&gt; ₱90,000 threshold)</td>
                        <td className="px-3 py-2 text-right font-mono font-bold text-amber-700">₱{calculation.taxableExcess.toFixed(2)}</td>
                        <td className="px-3 py-2 text-amber-700">Subject to withholding tax (~20%)</td>
                      </tr>
                    )}
                    <tr className="bg-slate-900 text-white font-bold">
                      <td className="px-3 py-2.5">NET CASH DISBURSEMENT PAYABLE:</td>
                      <td className="px-3 py-2.5 text-right font-mono text-base text-emerald-400">
                        ₱{calculation.netTakeHome.toFixed(2)}
                      </td>
                      <td className="px-3 py-2.5 text-[11px] text-slate-300">Mandatory by Dec 24, {selectedYear}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 pt-4 border-t border-slate-200 text-xs text-slate-500">
                <div className="text-center space-y-4">
                  <div className="border-b border-slate-400 w-4/5 mx-auto" />
                  <div>
                    <span className="font-bold text-slate-800 block">Maria Clara</span>
                    <span>HR & Payroll Compliance Director</span>
                  </div>
                </div>
                <div className="text-center space-y-4">
                  <div className="border-b border-slate-400 w-4/5 mx-auto" />
                  <div>
                    <span className="font-bold text-slate-800 block">
                      {selectedEmp ? `${selectedEmp.firstName} ${selectedEmp.lastName}` : 'Employee Acknowledgement'}
                    </span>
                    <span>Employee Signature over Printed Name</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
