import React, { useState, useMemo } from 'react';
import { 
  Clock, Calculator, Calendar, ShieldCheck, DollarSign, 
  AlertTriangle, CheckCircle2, Download, Printer, User, 
  HelpCircle, Sparkles, Scale, ArrowRight, RotateCcw, 
  Table, Info, Moon, Sun, Flame, Plus, Trash2, FileText
} from 'lucide-react';
import { Employee } from '../../types';
import { 
  PhDayType, PH_DAY_TYPES, DaysFactor, 
  calculateRates, computeOvertimeDetails, TimesheetEntry 
} from '../../lib/ph-overtime';

interface OvertimeCalculatorProps {
  employees: Employee[];
  initialEmployeeId?: string;
}

export function OvertimeCalculator({
  employees,
  initialEmployeeId = '',
}: OvertimeCalculatorProps) {
  // Navigation sub-tab
  const [activeSubTab, setActiveSubTab] = useState<'single' | 'timesheet' | 'rates-table'>('single');
  
  // Single shift calculator state
  const [selectedEmpId, setSelectedEmpId] = useState<string>(initialEmployeeId);
  const [basicSalary, setBasicSalary] = useState<number>(45000);
  const [daysFactor, setDaysFactor] = useState<DaysFactor>(261);
  const [dayType, setDayType] = useState<PhDayType>('REGULAR_DAY');
  
  // Hours inputs
  const [first8HoursWorked, setFirst8HoursWorked] = useState<number>(8);
  const [regularOtHours, setRegularOtHours] = useState<number>(2.5);
  const [nightDiffShiftHours, setNightDiffShiftHours] = useState<number>(0);
  const [nightDiffOtHours, setNightDiffOtHours] = useState<number>(1.0);

  // Modal for printable authorization slip
  const [showSlipModal, setShowSlipModal] = useState<boolean>(false);

  // Multi-day timesheet simulator state
  const [timesheetEntries, setTimesheetEntries] = useState<TimesheetEntry[]>([
    { id: 'ts-1', date: '2026-10-19', dayType: 'REGULAR_DAY', hoursWorkedFirst8: 8, regularOtHours: 2.0, nightDiffHours: 0, nightDiffOtHours: 0, notes: 'System deployment sprint' },
    { id: 'ts-2', date: '2026-10-21', dayType: 'REGULAR_DAY', hoursWorkedFirst8: 8, regularOtHours: 1.5, nightDiffHours: 1.0, nightDiffOtHours: 1.0, notes: 'Night cut-over maintenance' },
    { id: 'ts-3', date: '2026-10-24', dayType: 'REST_DAY', hoursWorkedFirst8: 8, regularOtHours: 3.0, nightDiffHours: 0, nightDiffOtHours: 0, notes: 'Urgent weekend client support' },
    { id: 'ts-4', date: '2026-10-31', dayType: 'SPECIAL_HOLIDAY', hoursWorkedFirst8: 8, regularOtHours: 2.0, nightDiffHours: 2.0, nightDiffOtHours: 0, notes: 'Special Non-Working Holiday' },
  ]);

  // Handle employee roster selection
  const handleSelectEmployee = (empId: string) => {
    setSelectedEmpId(empId);
    if (!empId) {
      setBasicSalary(45000);
      return;
    }
    const emp = employees.find(e => e.id === empId);
    if (emp) {
      setBasicSalary(emp.basicSalary);
    }
  };

  // Base rates calculation
  const { dailyRate, hourlyRate } = useMemo(() => {
    return calculateRates(basicSalary, daysFactor);
  }, [basicSalary, daysFactor]);

  // Live single shift calculation
  const singleResult = useMemo(() => {
    return computeOvertimeDetails({
      monthlySalary: basicSalary,
      daysFactor,
      dayType,
      first8HoursWorked,
      regularOtHours,
      nightDiffShiftHours,
      nightDiffOtHours,
    });
  }, [basicSalary, daysFactor, dayType, first8HoursWorked, regularOtHours, nightDiffShiftHours, nightDiffOtHours]);

  // Timesheet multi-day aggregates
  const timesheetTotals = useMemo(() => {
    return timesheetEntries.reduce((acc, entry) => {
      const res = computeOvertimeDetails({
        monthlySalary: basicSalary,
        daysFactor,
        dayType: entry.dayType,
        first8HoursWorked: entry.hoursWorkedFirst8,
        regularOtHours: entry.regularOtHours,
        nightDiffShiftHours: entry.nightDiffHours,
        nightDiffOtHours: entry.nightDiffOtHours,
      });

      acc.totalHours += res.totalHoursRendered;
      acc.totalFirst8Amount += res.first8HoursAmount;
      acc.totalOtOnly += res.totalOvertimeOnlyPay;
      acc.totalNightDiffOnly += res.totalNightDiffOnlyPay;
      acc.totalGross += res.grossTotalPayForDay;
      return acc;
    }, {
      totalHours: 0,
      totalFirst8Amount: 0,
      totalOtOnly: 0,
      totalNightDiffOnly: 0,
      totalGross: 0,
    });
  }, [timesheetEntries, basicSalary, daysFactor]);

  // Add new timesheet row
  const handleAddTimesheetRow = () => {
    const newEntry: TimesheetEntry = {
      id: `ts-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      dayType: 'REGULAR_DAY',
      hoursWorkedFirst8: 8,
      regularOtHours: 2,
      nightDiffHours: 0,
      nightDiffOtHours: 0,
      notes: 'Authorized overtime work',
    };
    setTimesheetEntries(prev => [...prev, newEntry]);
  };

  // Remove timesheet row
  const handleRemoveTimesheetRow = (id: string) => {
    setTimesheetEntries(prev => prev.filter(e => e.id !== id));
  };

  // Export Timesheet CSV
  const handleExportTimesheetCsv = () => {
    const headers = [
      'Date', 'Day Classification', 'Labor Code Article', 'First 8 Hours', 
      'Regular OT Hours', 'Night Diff Hours', 'Night Diff OT Hours', 
      'First 8 Hours Pay (PHP)', 'Overtime Pay (PHP)', 'Night Diff Pay (PHP)', 
      'Total Shift Compensation (PHP)', 'Notes'
    ];

    const rows = timesheetEntries.map(entry => {
      const res = computeOvertimeDetails({
        monthlySalary: basicSalary,
        daysFactor,
        dayType: entry.dayType,
        first8HoursWorked: entry.hoursWorkedFirst8,
        regularOtHours: entry.regularOtHours,
        nightDiffShiftHours: entry.nightDiffHours,
        nightDiffOtHours: entry.nightDiffOtHours,
      });

      return [
        entry.date,
        res.dayTypeConfig.label,
        res.dayTypeConfig.laborCodeArticle,
        entry.hoursWorkedFirst8.toString(),
        entry.regularOtHours.toString(),
        entry.nightDiffHours.toString(),
        entry.nightDiffOtHours.toString(),
        res.first8HoursAmount.toFixed(2),
        res.totalOvertimeOnlyPay.toFixed(2),
        res.totalNightDiffOnlyPay.toFixed(2),
        res.grossTotalPayForDay.toFixed(2),
        entry.notes || ''
      ];
    });

    const csvContent = [
      `"DOLE Overtime and Holiday Payroll Timesheet"`,
      `"Employee: ${selectedEmpId ? employees.find(e => e.id === selectedEmpId)?.firstName + ' ' + employees.find(e => e.id === selectedEmpId)?.lastName : 'Custom Simulation'}"`,
      `"Basic Salary: ₱${basicSalary.toLocaleString()} | Daily: ₱${dailyRate.toFixed(2)} | Hourly: ₱${hourlyRate.toFixed(2)}"`,
      `"Working Days Factor: ${daysFactor} Days"`,
      '',
      headers.map(h => `"${h}"`).join(','),
      ...rows.map(r => r.map(c => `"${c}"`).join(','))
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DOLE_Overtime_Timesheet_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const selectedEmp = employees.find(e => e.id === selectedEmpId);

  return (
    <div className="space-y-6">
      {/* Top Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-lg border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-indigo-500/10 to-transparent pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 relative z-10">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-semibold border border-indigo-400/30">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                Philippine Labor Code Book III, Title I (Articles 83, 86, 87, 91, 93, 94)
              </span>
              <span className="text-xs text-slate-300 font-mono">
                Standard: 8h/day · +25% OT · +10% Night Diff
              </span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Automated Overtime & Holiday Pay Calculator
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Computes compliant statutory compensation for regular workdays, weekly rest days, special non-working days, 
              and regular double-pay holidays with automated night shift differentials (10:00 PM – 6:00 AM) and working day factor derivations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowSlipModal(true)}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg flex items-center gap-2 transition-colors shadow-sm"
            >
              <Printer className="w-4 h-4" />
              Overtime Slip Voucher
            </button>
            <button
              onClick={handleExportTimesheetCsv}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-2 transition-colors shadow-xs"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              Export OT Timesheet
            </button>
          </div>
        </div>

        {/* Quick Rate Indicator Strip */}
        <div className="mt-5 pt-4 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Base Monthly Basic</span>
            <span className="text-base font-bold text-white font-mono">₱{basicSalary.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-bold block">DOLE Daily Rate ({daysFactor}d factor)</span>
            <span className="text-base font-bold text-emerald-400 font-mono">₱{dailyRate.toFixed(2)} / day</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Hourly Rate (÷ 8 hours)</span>
            <span className="text-base font-bold text-indigo-300 font-mono">₱{hourlyRate.toFixed(2)} / hr</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Regular OT Rate (+25%)</span>
            <span className="text-base font-bold text-amber-300 font-mono">₱{(hourlyRate * 1.25).toFixed(2)} / hr</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-xl p-1 gap-1 shadow-xs overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('single')}
          className={`flex-1 min-w-[200px] py-2.5 px-4 rounded-lg font-semibold text-xs flex items-center justify-center gap-2 transition-all ${
            activeSubTab === 'single'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Clock className="w-4 h-4" />
          Single Shift Interactive Calculator
        </button>

        <button
          onClick={() => setActiveSubTab('timesheet')}
          className={`flex-1 min-w-[200px] py-2.5 px-4 rounded-lg font-semibold text-xs flex items-center justify-center gap-2 transition-all ${
            activeSubTab === 'timesheet'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Pay Period Multi-Day Timesheet Simulator ({timesheetEntries.length})
        </button>

        <button
          onClick={() => setActiveSubTab('rates-table')}
          className={`flex-1 min-w-[200px] py-2.5 px-4 rounded-lg font-semibold text-xs flex items-center justify-center gap-2 transition-all ${
            activeSubTab === 'rates-table'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Scale className="w-4 h-4" />
          Official Labor Code Premium Rate Matrix
        </button>
      </div>

      {/* VIEW 1: SINGLE SHIFT INTERACTIVE CALCULATOR */}
      {activeSubTab === 'single' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Shift Inputs (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-5">
              {/* Employee selector */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-100">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Employee Profile</span>
                  <h3 className="font-bold text-slate-900 text-base">Select Employee or Simulate</h3>
                </div>

                <select
                  value={selectedEmpId}
                  onChange={(e) => handleSelectEmployee(e.target.value)}
                  className="w-full sm:w-64 px-3 py-1.5 text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Custom Simulation (Enter Below) --</option>
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.firstName} {e.lastName} ({e.role} - ₱{e.basicSalary.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              {/* Monthly Salary & Days Factor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Basic Monthly Salary:
                    </label>
                    <span className="text-xs font-bold font-mono text-indigo-700">
                      ₱{basicSalary.toLocaleString()}
                    </span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">₱</span>
                    <input
                      type="number"
                      min="10000"
                      max="300000"
                      step="1000"
                      value={basicSalary}
                      onChange={(e) => {
                        setBasicSalary(parseFloat(e.target.value) || 0);
                        setSelectedEmpId('');
                      }}
                      className="w-full pl-7 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Working Days Factor:
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setDaysFactor(261)}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-bold border transition-colors ${
                        daysFactor === 261 ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 border-slate-300 text-slate-700'
                      }`}
                    >
                      261 Days (5d)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDaysFactor(313)}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-bold border transition-colors ${
                        daysFactor === 313 ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 border-slate-300 text-slate-700'
                      }`}
                    >
                      313 Days (6d)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDaysFactor(365)}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-bold border transition-colors ${
                        daysFactor === 365 ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 border-slate-300 text-slate-700'
                      }`}
                    >
                      365 Days
                    </button>
                  </div>
                </div>
              </div>

              {/* Day Classification Selector */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5 flex items-center justify-between">
                  <span>Day Classification & Statutory Multiplier:</span>
                  <span className="text-[11px] font-mono text-indigo-700 font-bold">
                    {singleResult.dayTypeConfig.laborCodeArticle}
                  </span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Object.values(PH_DAY_TYPES).map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setDayType(type.id)}
                      className={`p-3 rounded-xl border text-left text-xs transition-all ${
                        dayType === type.id
                          ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20 text-indigo-950 font-medium'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold block truncate">{type.label}</span>
                        <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                          type.id.includes('HOLIDAY') ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-700'
                        }`}>
                          OT: {(type.otMultiplier * 100).toFixed(0)}%
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">{type.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Hours Rendered Sliders */}
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Hours Rendered During Shift:
                </span>

                {/* 1. First 8 Hours */}
                <div>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="font-medium text-slate-700 flex items-center gap-1.5">
                      <Sun className="w-3.5 h-3.5 text-amber-500" />
                      First 8 Hours Worked:
                    </span>
                    <span className="font-mono font-bold text-slate-900">
                      {first8HoursWorked} hrs (Rate: {(singleResult.dayTypeConfig.first8HoursMultiplier * 100).toFixed(0)}%)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="8"
                    step="0.5"
                    value={first8HoursWorked}
                    onChange={(e) => setFirst8HoursWorked(parseFloat(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>0h (Unworked)</span>
                    <span>4h (Half Day)</span>
                    <span>8h (Full Shift)</span>
                  </div>
                </div>

                {/* 2. Daytime Overtime (Beyond 8h) */}
                <div>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="font-medium text-slate-700 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                      Daytime Overtime (Beyond 8 Hours):
                    </span>
                    <span className="font-mono font-bold text-blue-700">
                      {regularOtHours} hrs (Rate: {(singleResult.dayTypeConfig.otMultiplier * 100).toFixed(0)}%)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="8"
                    step="0.5"
                    value={regularOtHours}
                    onChange={(e) => setRegularOtHours(parseFloat(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>

                {/* 3. Night Shift Differential during first 8h */}
                <div>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="font-medium text-slate-700 flex items-center gap-1.5">
                      <Moon className="w-3.5 h-3.5 text-purple-600" />
                      Night Shift Diff (10:00 PM – 6:00 AM) within First 8h:
                    </span>
                    <span className="font-mono font-bold text-purple-700">
                      {nightDiffShiftHours} hrs (+10% Premium)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="8"
                    step="0.5"
                    value={nightDiffShiftHours}
                    onChange={(e) => setNightDiffShiftHours(parseFloat(e.target.value))}
                    className="w-full accent-purple-600 cursor-pointer"
                  />
                </div>

                {/* 4. Night Shift Overtime (Beyond 8h within 10pm-6am) */}
                <div>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="font-medium text-slate-700 flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-rose-600" />
                      Night Shift Overtime (Beyond 8h in 10:00 PM – 6:00 AM):
                    </span>
                    <span className="font-mono font-bold text-rose-700">
                      {nightDiffOtHours} hrs (Rate: {(singleResult.dayTypeConfig.nightDiffOtMultiplier * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="6"
                    step="0.5"
                    value={nightDiffOtHours}
                    onChange={(e) => setNightDiffOtHours(parseFloat(e.target.value))}
                    className="w-full accent-rose-600 cursor-pointer"
                  />
                </div>
              </div>

              {/* Health Warning */}
              {singleResult.isOverExertion && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">DOLE OSH Working Hours Advisory:</span>
                    <span>Total overtime rendered exceeds 4 hours in a single shift. Ensure mandatory meal intervals and employee fatigue mitigation pursuant to DOLE Rule 1020.</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Live Computation Output (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Grand Total Shift Pay Card */}
            <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-lg border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                  Total Shift Compensation
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                  {singleResult.totalHoursRendered} Total Hours Rendered
                </span>
              </div>

              <div>
                <span className="text-xs text-slate-400 block uppercase font-medium">
                  Total Payable For This Shift:
                </span>
                <span className="text-3xl sm:text-4xl font-black font-mono text-emerald-400 mt-1 block">
                  ₱{singleResult.grossTotalPayForDay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-xs text-slate-300 mt-1 block">
                  Includes ₱{singleResult.totalAdditionalPay.toFixed(2)} statutory premium & overtime addition
                </span>
              </div>

              {/* Granular Mathematical Breakdown */}
              <div className="bg-slate-800/80 rounded-xl p-3.5 border border-slate-700 text-xs space-y-2">
                <div className="font-bold text-slate-200 border-b border-slate-700 pb-1.5 flex justify-between">
                  <span>Component</span>
                  <span>Computation</span>
                  <span className="text-right">Payable</span>
                </div>

                <div className="flex justify-between items-center text-slate-300">
                  <span>First 8h ({singleResult.dayTypeConfig.first8HoursMultiplier * 100}%):</span>
                  <span className="font-mono text-[11px] text-slate-400">
                    {first8HoursWorked}h × ₱{hourlyRate.toFixed(2)} × {singleResult.dayTypeConfig.first8HoursMultiplier}
                  </span>
                  <span className="font-mono font-bold text-white">₱{singleResult.first8HoursAmount.toFixed(2)}</span>
                </div>

                {regularOtHours > 0 && (
                  <div className="flex justify-between items-center text-blue-300">
                    <span>Daytime OT ({(singleResult.dayTypeConfig.otMultiplier * 100).toFixed(0)}%):</span>
                    <span className="font-mono text-[11px] text-blue-400/80">
                      {regularOtHours}h × ₱{hourlyRate.toFixed(2)} × {singleResult.dayTypeConfig.otMultiplier}
                    </span>
                    <span className="font-mono font-bold text-blue-300">₱{singleResult.regularOtAmount.toFixed(2)}</span>
                  </div>
                )}

                {nightDiffShiftHours > 0 && (
                  <div className="flex justify-between items-center text-purple-300">
                    <span>Night Shift Diff (+10%):</span>
                    <span className="font-mono text-[11px] text-purple-400/80">
                      {nightDiffShiftHours}h × ₱{(hourlyRate * (singleResult.dayTypeConfig.nightDiffFirst8Multiplier - singleResult.dayTypeConfig.first8HoursMultiplier)).toFixed(2)}
                    </span>
                    <span className="font-mono font-bold text-purple-300">₱{singleResult.nightDiffShiftAmount.toFixed(2)}</span>
                  </div>
                )}

                {nightDiffOtHours > 0 && (
                  <div className="flex justify-between items-center text-rose-300">
                    <span>Night Diff OT ({(singleResult.dayTypeConfig.nightDiffOtMultiplier * 100).toFixed(1)}%):</span>
                    <span className="font-mono text-[11px] text-rose-400/80">
                      {nightDiffOtHours}h × ₱{hourlyRate.toFixed(2)} × {singleResult.dayTypeConfig.nightDiffOtMultiplier}
                    </span>
                    <span className="font-mono font-bold text-rose-300">₱{singleResult.nightDiffOtAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>

              {/* Legal Reference Note */}
              <div className="p-3 bg-indigo-950/40 border border-indigo-800/40 rounded-xl text-xs space-y-1 text-indigo-200">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  Labor Code Compliance Certification
                </div>
                <p className="text-[11px] leading-relaxed">
                  Under Philippine Labor Code {singleResult.dayTypeConfig.laborCodeArticle}, overtime compensation 
                  is non-waivable and must be released alongside regular semi-monthly payroll.
                </p>
              </div>
            </div>

            {/* Quick Multiplier Comparison Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                Selected Day Multipliers ({singleResult.dayTypeConfig.shortLabel})
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">First 8 Hours</span>
                  <span className="text-base font-bold text-slate-900 font-mono mt-0.5 block">
                    {(singleResult.dayTypeConfig.first8HoursMultiplier * 100).toFixed(0)}%
                  </span>
                  <span className="text-[10px] text-slate-500">₱{(hourlyRate * singleResult.dayTypeConfig.first8HoursMultiplier).toFixed(2)} / hr</span>
                </div>
                <div className="p-2.5 bg-blue-50/60 rounded-lg border border-blue-200">
                  <span className="text-[10px] text-blue-800 uppercase font-bold block">Overtime Rate</span>
                  <span className="text-base font-bold text-blue-900 font-mono mt-0.5 block">
                    {(singleResult.dayTypeConfig.otMultiplier * 100).toFixed(0)}%
                  </span>
                  <span className="text-[10px] text-blue-700">₱{(hourlyRate * singleResult.dayTypeConfig.otMultiplier).toFixed(2)} / hr</span>
                </div>
                <div className="p-2.5 bg-purple-50/60 rounded-lg border border-purple-200">
                  <span className="text-[10px] text-purple-800 uppercase font-bold block">Night Diff First 8</span>
                  <span className="text-base font-bold text-purple-900 font-mono mt-0.5 block">
                    {(singleResult.dayTypeConfig.nightDiffFirst8Multiplier * 100).toFixed(0)}%
                  </span>
                  <span className="text-[10px] text-purple-700">10PM - 6AM Shift</span>
                </div>
                <div className="p-2.5 bg-rose-50/60 rounded-lg border border-rose-200">
                  <span className="text-[10px] text-rose-800 uppercase font-bold block">Night Diff OT</span>
                  <span className="text-base font-bold text-rose-900 font-mono mt-0.5 block">
                    {(singleResult.dayTypeConfig.nightDiffOtMultiplier * 100).toFixed(1)}%
                  </span>
                  <span className="text-[10px] text-rose-700">OT during Night Shift</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: MULTI-DAY CUT-OFF TIMESHEET SIMULATOR */}
      {activeSubTab === 'timesheet' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">Cut-Off Overtime & Holiday Work Timesheet</h3>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-mono">
                  {timesheetEntries.length} Shifts Recorded
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Simulate multiple overtime and holiday entries for an active cut-off period.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleAddTimesheetRow}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Shift Row
              </button>
              <button
                onClick={handleExportTimesheetCsv}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                Export Timesheet CSV
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="px-3 py-3">Date</th>
                  <th className="px-3 py-3">Day Classification</th>
                  <th className="px-3 py-3 text-center">First 8h</th>
                  <th className="px-3 py-3 text-center text-blue-900">Day OT</th>
                  <th className="px-3 py-3 text-center text-purple-900">Night Diff</th>
                  <th className="px-3 py-3 text-center text-rose-900">Night OT</th>
                  <th className="px-3 py-3 text-right">Base / Prem Pay</th>
                  <th className="px-3 py-3 text-right text-blue-900">OT Pay</th>
                  <th className="px-3 py-3 text-right text-purple-900">Night Pay</th>
                  <th className="px-3 py-3 text-right font-black text-slate-900">Total Shift Pay</th>
                  <th className="px-3 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {timesheetEntries.map((entry, idx) => {
                  const res = computeOvertimeDetails({
                    monthlySalary: basicSalary,
                    daysFactor,
                    dayType: entry.dayType,
                    first8HoursWorked: entry.hoursWorkedFirst8,
                    regularOtHours: entry.regularOtHours,
                    nightDiffShiftHours: entry.nightDiffHours,
                    nightDiffOtHours: entry.nightDiffOtHours,
                  });

                  return (
                    <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-3 py-2.5">
                        <input
                          type="date"
                          value={entry.date}
                          onChange={(e) => {
                            const val = e.target.value;
                            setTimesheetEntries(prev => prev.map((t, i) => i === idx ? { ...t, date: val } : t));
                          }}
                          className="px-2 py-1 bg-white border border-slate-300 rounded text-xs font-mono font-medium"
                        />
                      </td>

                      <td className="px-3 py-2.5">
                        <select
                          value={entry.dayType}
                          onChange={(e) => {
                            const val = e.target.value as PhDayType;
                            setTimesheetEntries(prev => prev.map((t, i) => i === idx ? { ...t, dayType: val } : t));
                          }}
                          className="px-2 py-1 bg-white border border-slate-300 rounded text-xs font-medium max-w-[170px]"
                        >
                          {Object.values(PH_DAY_TYPES).map(dt => (
                            <option key={dt.id} value={dt.id}>
                              {dt.shortLabel}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="px-3 py-2.5 text-center">
                        <input
                          type="number"
                          min="0"
                          max="8"
                          step="0.5"
                          value={entry.hoursWorkedFirst8}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setTimesheetEntries(prev => prev.map((t, i) => i === idx ? { ...t, hoursWorkedFirst8: val } : t));
                          }}
                          className="w-14 text-center px-1.5 py-1 bg-white border border-slate-300 rounded text-xs font-mono font-bold"
                        />
                      </td>

                      <td className="px-3 py-2.5 text-center">
                        <input
                          type="number"
                          min="0"
                          max="8"
                          step="0.5"
                          value={entry.regularOtHours}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setTimesheetEntries(prev => prev.map((t, i) => i === idx ? { ...t, regularOtHours: val } : t));
                          }}
                          className="w-14 text-center px-1.5 py-1 bg-white border border-slate-300 rounded text-xs font-mono font-bold text-blue-700"
                        />
                      </td>

                      <td className="px-3 py-2.5 text-center">
                        <input
                          type="number"
                          min="0"
                          max="8"
                          step="0.5"
                          value={entry.nightDiffHours}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setTimesheetEntries(prev => prev.map((t, i) => i === idx ? { ...t, nightDiffHours: val } : t));
                          }}
                          className="w-14 text-center px-1.5 py-1 bg-white border border-slate-300 rounded text-xs font-mono font-bold text-purple-700"
                        />
                      </td>

                      <td className="px-3 py-2.5 text-center">
                        <input
                          type="number"
                          min="0"
                          max="6"
                          step="0.5"
                          value={entry.nightDiffOtHours}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setTimesheetEntries(prev => prev.map((t, i) => i === idx ? { ...t, nightDiffOtHours: val } : t));
                          }}
                          className="w-14 text-center px-1.5 py-1 bg-white border border-slate-300 rounded text-xs font-mono font-bold text-rose-700"
                        />
                      </td>

                      <td className="px-3 py-2.5 text-right font-mono text-slate-700">
                        ₱{res.first8HoursAmount.toFixed(2)}
                      </td>

                      <td className="px-3 py-2.5 text-right font-mono text-blue-700 font-bold">
                        ₱{res.totalOvertimeOnlyPay.toFixed(2)}
                      </td>

                      <td className="px-3 py-2.5 text-right font-mono text-purple-700">
                        ₱{res.totalNightDiffOnlyPay.toFixed(2)}
                      </td>

                      <td className="px-3 py-2.5 text-right font-mono font-extrabold text-slate-900">
                        ₱{res.grossTotalPayForDay.toFixed(2)}
                      </td>

                      <td className="px-3 py-2.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveTimesheetRow(entry.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 transition-colors"
                          title="Delete row"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              <tfoot className="bg-slate-100 text-slate-900 font-bold border-t-2 border-slate-300 text-xs">
                <tr>
                  <td colSpan={2} className="px-3 py-3 uppercase tracking-wider text-[11px]">
                    Period Totals ({timesheetEntries.length} Shifts, {timesheetTotals.totalHours} hrs rendered):
                  </td>
                  <td colSpan={4} />
                  <td className="px-3 py-3 text-right font-mono">
                    ₱{timesheetTotals.totalFirst8Amount.toFixed(2)}
                  </td>
                  <td className="px-3 py-3 text-right font-mono text-blue-900">
                    ₱{timesheetTotals.totalOtOnly.toFixed(2)}
                  </td>
                  <td className="px-3 py-3 text-right font-mono text-purple-900">
                    ₱{timesheetTotals.totalNightDiffOnly.toFixed(2)}
                  </td>
                  <td className="px-3 py-3 text-right font-mono font-black text-emerald-700 text-sm">
                    ₱{timesheetTotals.totalGross.toFixed(2)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: OFFICIAL LABOR CODE PREMIUM RATE MATRIX */}
      {activeSubTab === 'rates-table' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-6">
          <div className="space-y-1">
            <h3 className="font-bold text-slate-900 text-base">
              Philippine Labor Code Statutory Overtime & Premium Matrix (Book III)
            </h3>
            <p className="text-xs text-slate-500">
              Official DOLE statutory multipliers derived from the Labor Code and DOLE Handbook on Workers' Statutory Monetary Benefits.
            </p>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Day Classification</th>
                  <th className="px-3 py-3">Statutory Basis</th>
                  <th className="px-3 py-3 text-right bg-slate-50">First 8 Hours Rate</th>
                  <th className="px-3 py-3 text-right bg-blue-50/60 text-blue-900 font-bold">Overtime Rate (Beyond 8h)</th>
                  <th className="px-3 py-3 text-right bg-purple-50/60 text-purple-900">Night Diff (10PM-6AM)</th>
                  <th className="px-3 py-3 text-right bg-rose-50/60 text-rose-900 font-black">OT on Night Diff</th>
                  <th className="px-3 py-3 text-center">Unworked Pay</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Object.values(PH_DAY_TYPES).map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {row.label}
                    </td>
                    <td className="px-3 py-3 font-mono text-[11px] text-slate-500">
                      {row.laborCodeArticle}
                    </td>
                    <td className="px-3 py-3 text-right font-mono font-bold bg-slate-50 text-slate-800">
                      {(row.first8HoursMultiplier * 100).toFixed(0)}%
                    </td>
                    <td className="px-3 py-3 text-right font-mono font-black text-blue-900 bg-blue-50/20">
                      {(row.otMultiplier * 100).toFixed(0)}%
                    </td>
                    <td className="px-3 py-3 text-right font-mono font-bold text-purple-900 bg-purple-50/20">
                      {(row.nightDiffFirst8Multiplier * 100).toFixed(0)}%
                    </td>
                    <td className="px-3 py-3 text-right font-mono font-extrabold text-rose-900 bg-rose-50/20">
                      {(row.nightDiffOtMultiplier * 100).toFixed(1)}%
                    </td>
                    <td className="px-3 py-3 text-center font-mono">
                      {row.unworkedPayPercent > 0 ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          {row.unworkedPayPercent}% Paid
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">No work, no pay</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5 text-slate-600">
            <span className="font-bold text-slate-900 block">DOLE Statutory Rules Summary:</span>
            <ul className="list-disc pl-5 space-y-1 text-[11px]">
              <li><strong>Article 83 (Normal Hours of Work):</strong> The normal hours of work of any employee shall not exceed eight (8) hours a day.</li>
              <li><strong>Article 86 (Night Shift Differential):</strong> Every employee shall be paid a night shift differential of not less than ten percent (10%) of his regular wage for each hour of work performed between ten o’clock in the evening and six o’clock in the morning.</li>
              <li><strong>Article 87 (Overtime Work):</strong> Work may be performed beyond eight (8) hours a day provided that the employee is paid for the overtime work an additional compensation equivalent to his regular wage plus at least twenty-five percent (25%) thereof.</li>
              <li><strong>Article 93 & 94 (Rest Days & Holidays):</strong> Work performed on rest days and special non-working holidays earns an additional 30% premium. Work performed on regular holidays earns 200% (double pay).</li>
            </ul>
          </div>
        </div>
      )}

      {/* PRINTABLE OVERTIME AUTHORIZATION SLIP MODAL */}
      {showSlipModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="font-bold text-sm">Official Overtime & Holiday Work Authorization Slip</h3>
                  <span className="text-[11px] text-slate-400">DOLE General Labor Standards (GLS) Form OT-1</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Slip
                </button>
                <button
                  onClick={() => setShowSlipModal(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Slip Content */}
            <div className="p-6 space-y-5 text-xs text-slate-800 bg-white">
              <div className="text-center border-b-2 border-slate-900 pb-3 space-y-0.5">
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Republic of the Philippines · DOLE Labor Code Book III</div>
                <div className="text-base font-extrabold uppercase text-slate-900">KAWAYAN HR PHILIPPINES INC.</div>
                <div className="text-xs font-bold text-slate-700">STATUTORY OVERTIME & HOLIDAY WORK AUTHORIZATION VOUCHER</div>
                <div className="text-[11px] text-slate-500">Date Issued: {new Date().toLocaleDateString('en-PH')} · Control No. OT-{Date.now().toString().slice(-6)}</div>
              </div>

              {/* Meta Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Employee Name</span>
                  <span className="font-bold text-slate-900">{selectedEmp ? `${selectedEmp.firstName} ${selectedEmp.lastName}` : 'Custom Simulation'}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Designation</span>
                  <span className="font-medium text-slate-700">{selectedEmp ? selectedEmp.role : 'Regular Staff'}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Hourly Rate Base</span>
                  <span className="font-mono font-bold text-indigo-700">₱{hourlyRate.toFixed(2)} / hr</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Working Days Factor</span>
                  <span className="font-mono font-bold text-slate-800">{daysFactor} Days / Year</span>
                </div>
              </div>

              {/* Calculation Breakdown Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-2">Overtime Item / Rate Multiplier</th>
                      <th className="px-3 py-2 text-center">Hours</th>
                      <th className="px-3 py-2 text-right">Applicable Rate (PHP)</th>
                      <th className="px-3 py-2 text-right">Payable Amount (PHP)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    <tr>
                      <td className="px-3 py-2 font-sans font-medium text-slate-800">
                        {singleResult.dayTypeConfig.label} (First 8h - {(singleResult.dayTypeConfig.first8HoursMultiplier * 100).toFixed(0)}%)
                      </td>
                      <td className="px-3 py-2 text-center">{first8HoursWorked} hrs</td>
                      <td className="px-3 py-2 text-right">₱{(hourlyRate * singleResult.dayTypeConfig.first8HoursMultiplier).toFixed(2)}</td>
                      <td className="px-3 py-2 text-right font-bold text-slate-900">₱{singleResult.first8HoursAmount.toFixed(2)}</td>
                    </tr>
                    {regularOtHours > 0 && (
                      <tr>
                        <td className="px-3 py-2 font-sans font-medium text-blue-900">
                          Daytime Overtime (Beyond 8h - {(singleResult.dayTypeConfig.otMultiplier * 100).toFixed(0)}%)
                        </td>
                        <td className="px-3 py-2 text-center text-blue-800">{regularOtHours} hrs</td>
                        <td className="px-3 py-2 text-right text-blue-800">₱{(hourlyRate * singleResult.dayTypeConfig.otMultiplier).toFixed(2)}</td>
                        <td className="px-3 py-2 text-right font-bold text-blue-900">₱{singleResult.regularOtAmount.toFixed(2)}</td>
                      </tr>
                    )}
                    {nightDiffShiftHours > 0 && (
                      <tr>
                        <td className="px-3 py-2 font-sans font-medium text-purple-900">
                          Night Shift Diff (10PM - 6AM Shift - +10%)
                        </td>
                        <td className="px-3 py-2 text-center text-purple-800">{nightDiffShiftHours} hrs</td>
                        <td className="px-3 py-2 text-right text-purple-800">₱{(hourlyRate * (singleResult.dayTypeConfig.nightDiffFirst8Multiplier - singleResult.dayTypeConfig.first8HoursMultiplier)).toFixed(2)}</td>
                        <td className="px-3 py-2 text-right font-bold text-purple-900">₱{singleResult.nightDiffShiftAmount.toFixed(2)}</td>
                      </tr>
                    )}
                    {nightDiffOtHours > 0 && (
                      <tr>
                        <td className="px-3 py-2 font-sans font-medium text-rose-900">
                          Night Shift Overtime (10PM - 6AM Beyond 8h - {(singleResult.dayTypeConfig.nightDiffOtMultiplier * 100).toFixed(1)}%)
                        </td>
                        <td className="px-3 py-2 text-center text-rose-800">{nightDiffOtHours} hrs</td>
                        <td className="px-3 py-2 text-right text-rose-800">₱{(hourlyRate * singleResult.dayTypeConfig.nightDiffOtMultiplier).toFixed(2)}</td>
                        <td className="px-3 py-2 text-right font-bold text-rose-900">₱{singleResult.nightDiffOtAmount.toFixed(2)}</td>
                      </tr>
                    )}
                    <tr className="bg-slate-900 text-white font-bold">
                      <td colSpan={3} className="px-3 py-2.5 font-sans">TOTAL AUTHORIZED SHIFT OVERTIME PAYABLE:</td>
                      <td className="px-3 py-2.5 text-right font-mono text-base text-emerald-400">
                        ₱{singleResult.grossTotalPayForDay.toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 pt-4 border-t border-slate-200 text-xs text-slate-500">
                <div className="text-center space-y-4">
                  <div className="border-b border-slate-400 w-4/5 mx-auto" />
                  <div>
                    <span className="font-bold text-slate-800 block">Department Supervisor</span>
                    <span>Overtime Work Authorization</span>
                  </div>
                </div>
                <div className="text-center space-y-4">
                  <div className="border-b border-slate-400 w-4/5 mx-auto" />
                  <div>
                    <span className="font-bold text-slate-800 block">Maria Clara</span>
                    <span>HR & Payroll Compliance Director</span>
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
