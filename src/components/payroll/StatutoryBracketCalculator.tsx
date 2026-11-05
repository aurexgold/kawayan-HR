import React, { useState, useMemo } from 'react';
import { 
  Calculator, ShieldCheck, HeartPulse, Home, Scale, 
  Search, Download, RefreshCw, CheckCircle2, ChevronRight, 
  Building2, Users, ArrowUpRight, DollarSign, FileSpreadsheet,
  AlertCircle, HelpCircle, Filter, Sparkles, TrendingUp
} from 'lucide-react';
import { getSSSTable, calculateContributions, SSSBracket, ContributionBreakdown } from '../../lib/ph-payroll';
import { mockEmployees } from '../../data/mockData';

interface StatutoryBracketCalculatorProps {
  initialSalary?: number;
  initialEmployeeId?: string;
  onSelectEmployee?: (empId: string) => void;
}

export function StatutoryBracketCalculator({
  initialSalary = 48000,
  initialEmployeeId = '',
  onSelectEmployee,
}: StatutoryBracketCalculatorProps) {
  const [salaryInput, setSalaryInput] = useState<number>(initialSalary);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(initialEmployeeId);
  const [activeAgencyTab, setActiveAgencyTab] = useState<'all' | 'sss' | 'philhealth' | 'pagibig'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [voluntaryMp2, setVoluntaryMp2] = useState<number>(500);
  const [viewBatchRegister, setViewBatchRegister] = useState<boolean>(false);

  // Load SSS master bracket table
  const sssBrackets = useMemo(() => getSSSTable(), []);

  // Compute live breakdown for currently entered salary
  const liveBreakdown: ContributionBreakdown = useMemo(() => {
    return calculateContributions(salaryInput, {
      pagibigMp2: voluntaryMp2,
      employeeId: selectedEmployeeId || undefined,
    });
  }, [salaryInput, voluntaryMp2, selectedEmployeeId]);

  // Handle employee selector
  const handleSelectEmployee = (empId: string) => {
    setSelectedEmployeeId(empId);
    if (onSelectEmployee) onSelectEmployee(empId);
    if (!empId) return;
    const emp = mockEmployees.find(e => e.id === empId);
    if (emp) {
      setSalaryInput(emp.basicSalary);
    }
  };

  // Preset salary quick-select buttons
  const SALARY_PRESETS = [
    { label: 'NCR Minimum Wage (₱645/day)', amount: 16834.50 },
    { label: 'Junior Specialist (₱25,000)', amount: 25000 },
    { label: 'Mid Specialist (₱48,000)', amount: 48000 },
    { label: 'Senior Lead (₱80,000)', amount: 80000 },
    { label: 'Executive (₱125,000)', amount: 125000 },
  ];

  // PhilHealth progressive tiered calculation reference table
  const philhealthTiers = [
    { range: '₱10,000.00 and below (Floor)', salary: 10000, rate: '5.0%', total: 500, ee: 250, er: 250 },
    { range: '₱15,000.00', salary: 15000, rate: '5.0%', total: 750, ee: 375, er: 375 },
    { range: '₱20,000.00', salary: 20000, rate: '5.0%', total: 1000, ee: 500, er: 500 },
    { range: '₱30,000.00', salary: 30000, rate: '5.0%', total: 1500, ee: 750, er: 750 },
    { range: '₱40,000.00', salary: 40000, rate: '5.0%', total: 2000, ee: 1000, er: 1000 },
    { range: '₱50,000.00', salary: 50000, rate: '5.0%', total: 2500, ee: 1250, er: 1250 },
    { range: '₱60,000.00', salary: 60000, rate: '5.0%', total: 3000, ee: 1500, er: 1500 },
    { range: '₱75,000.00', salary: 75000, rate: '5.0%', total: 3750, ee: 1875, er: 1875 },
    { range: '₱90,000.00', salary: 90000, rate: '5.0%', total: 4500, ee: 2250, er: 2250 },
    { range: '₱100,000.00 and above (Ceiling)', salary: 100000, rate: '5.0%', total: 5000, ee: 2500, er: 2500 },
  ];

  // Filter SSS brackets
  const filteredSssBrackets = useMemo(() => {
    if (!searchTerm) return sssBrackets;
    const num = parseFloat(searchTerm);
    if (!isNaN(num)) {
      return sssBrackets.filter(b => num >= b.minCompensation && num <= b.maxCompensation);
    }
    return sssBrackets;
  }, [sssBrackets, searchTerm]);

  // Batch summary for all employees in system
  const batchSummaries = useMemo(() => {
    return mockEmployees.map(emp => {
      const calc = calculateContributions(emp.basicSalary, { employeeId: emp.id });
      return {
        id: emp.id,
        name: `${emp.firstName} ${emp.lastName}`,
        role: emp.role,
        department: emp.department,
        salary: emp.basicSalary,
        tin: emp.tin,
        sssNo: emp.sssNumber,
        phNo: emp.philhealthNumber,
        hdmfNo: emp.pagibigNumber,
        sssEE: calc.sss,
        sssER: calc.sssER,
        phEE: calc.philhealth,
        phER: calc.philhealthER,
        hdmfEE: calc.pagibig,
        hdmfER: calc.pagibigER,
        totalEE: calc.mandatoryDeductionsEE,
        totalER: calc.mandatoryContributionsER,
        grandTotal: calc.mandatoryDeductionsEE + calc.mandatoryContributionsER,
      };
    });
  }, []);

  // Batch totals
  const batchTotals = useMemo(() => {
    return batchSummaries.reduce((acc, row) => {
      acc.salary += row.salary;
      acc.sssEE += row.sssEE;
      acc.sssER += row.sssER;
      acc.phEE += row.phEE;
      acc.phER += row.phER;
      acc.hdmfEE += row.hdmfEE;
      acc.hdmfER += row.hdmfER;
      acc.totalEE += row.totalEE;
      acc.totalER += row.totalER;
      acc.grandTotal += row.grandTotal;
      return acc;
    }, {
      salary: 0, sssEE: 0, sssER: 0, phEE: 0, phER: 0, hdmfEE: 0, hdmfER: 0,
      totalEE: 0, totalER: 0, grandTotal: 0
    });
  }, [batchSummaries]);

  // Export handlers
  const handleExportBatchCsv = (format: 'consolidated' | 'sss-r3' | 'ph-eprs' | 'hdmf-mcr') => {
    let rows: string[][] = [];
    let filename = '';

    if (format === 'sss-r3') {
      filename = `SSS_Form_R3_Monthly_Collection_List_2026.csv`;
      rows.push([
        'SSS Form R-3 (Monthly Collection List)',
        'Employer: KAWAYAN HR PHILIPPINES INC.',
        'SSS SBR/ER No: 03-9182746-1',
        `Generated: ${new Date().toLocaleDateString('en-PH')}`,
      ]);
      rows.push(['SSS Number', 'Employee Name', 'Monthly Basic Salary', 'Regular SS EE', 'WISP EE', 'Total EE Share', 'Regular SS ER', 'WISP ER', 'EC ER', 'Total ER Share', 'Total Remittance']);
      batchSummaries.forEach(b => {
        const calc = calculateContributions(b.salary);
        rows.push([
          b.sssNo,
          b.name,
          b.salary.toFixed(2),
          calc.sssRegularEE.toFixed(2),
          calc.sssWispEE.toFixed(2),
          calc.sss.toFixed(2),
          calc.sssRegularER.toFixed(2),
          calc.sssWispER.toFixed(2),
          calc.sssEcER.toFixed(2),
          calc.sssER.toFixed(2),
          (calc.sss + calc.sssER).toFixed(2),
        ]);
      });
    } else if (format === 'ph-eprs') {
      filename = `PhilHealth_EPRS_Monthly_Remittance_2026.csv`;
      rows.push([
        'PhilHealth Electronic Premium Remittance System (EPRS)',
        'Employer: KAWAYAN HR PHILIPPINES INC.',
        'PhilHealth PEN: 19-029482910-4',
        `Generated: ${new Date().toLocaleDateString('en-PH')}`,
      ]);
      rows.push(['PhilHealth Number', 'Employee Name', 'Basic Monthly Salary', 'Premium Rate', 'Employee Share (2.5%)', 'Employer Share (2.5%)', 'Total Remittance (5.0%)']);
      batchSummaries.forEach(b => {
        rows.push([
          b.phNo,
          b.name,
          b.salary.toFixed(2),
          '5.0%',
          b.phEE.toFixed(2),
          b.phER.toFixed(2),
          (b.phEE + b.phER).toFixed(2),
        ]);
      });
    } else if (format === 'hdmf-mcr') {
      filename = `PagIBIG_MCR_Monthly_Remittance_2026.csv`;
      rows.push([
        'Pag-IBIG Monthly Coverage Remittance (MCR)',
        'Employer: KAWAYAN HR PHILIPPINES INC.',
        'Pag-IBIG Employer ID: 204918274619',
        `Mandate: Circular No. 460 (Max ₱200/₱200)`,
      ]);
      rows.push(['Pag-IBIG MID', 'Employee Name', 'Basic Salary', 'Mandatory EE Share', 'Mandatory ER Share', 'Voluntary MP2', 'Total HDMF Remittance']);
      batchSummaries.forEach(b => {
        rows.push([
          b.hdmfNo,
          b.name,
          b.salary.toFixed(2),
          b.hdmfEE.toFixed(2),
          b.hdmfER.toFixed(2),
          '0.00',
          (b.hdmfEE + b.hdmfER).toFixed(2),
        ]);
      });
    } else {
      filename = `Philippine_Statutory_Contributions_Master_Schedule_2026.csv`;
      rows.push([
        'Philippine Government Statutory Contributions Master Schedule (2024-2026)',
        'Employer: KAWAYAN HR PHILIPPINES INC.',
        `Generated: ${new Date().toLocaleDateString('en-PH')}`,
      ]);
      rows.push([
        'Employee ID', 'Name', 'Department', 'Basic Salary',
        'SSS EE', 'SSS ER', 'PhilHealth EE', 'PhilHealth ER', 'Pag-IBIG EE', 'Pag-IBIG ER',
        'Total Employee Deductions', 'Total Employer Burden', 'Grand Total Remittance'
      ]);
      batchSummaries.forEach(b => {
        rows.push([
          b.id,
          b.name,
          b.department,
          b.salary.toFixed(2),
          b.sssEE.toFixed(2),
          b.sssER.toFixed(2),
          b.phEE.toFixed(2),
          b.phER.toFixed(2),
          b.hdmfEE.toFixed(2),
          b.hdmfER.toFixed(2),
          b.totalEE.toFixed(2),
          b.totalER.toFixed(2),
          b.grandTotal.toFixed(2),
        ]);
      });
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Hero & Control Deck */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-lg border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-indigo-500/10 to-transparent pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 relative z-10">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-semibold border border-indigo-400/30">
                <Calculator className="w-3.5 h-3.5 text-indigo-400" />
                Philippine Statutory Bracket Engine (2024–2026)
              </span>
              <span className="text-[11px] text-slate-300 font-mono">
                RA 11199 · RA 11223 · HDMF Circular 460
              </span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Automated SSS, PhilHealth & Pag-IBIG Bracket Calculator
            </h2>
            <p className="text-sm text-slate-300">
              Real-time calculation and official bracket matrix lookups for mandatory Philippine employee deductions and employer contributions, with instant employee roster syncing and government remittance export.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setViewBatchRegister(!viewBatchRegister)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg border flex items-center gap-2 transition-all ${
                viewBatchRegister 
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                  : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <Users className="w-4 h-4 text-indigo-400" />
              {viewBatchRegister ? 'View Bracket Explorer' : `Batch Roster Summary (${mockEmployees.length})`}
            </button>
            <button
              onClick={() => handleExportBatchCsv('consolidated')}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" />
              Export Statutory CSV
            </button>
          </div>
        </div>

        {/* Live Interactive Salary Input & Employee Quick Selector */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Employee Selector */}
          <div className="md:col-span-4">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              Select Active Employee:
            </label>
            <select
              value={selectedEmployeeId}
              onChange={(e) => handleSelectEmployee(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">-- Custom Simulation (Enter Salary Below) --</option>
              {mockEmployees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.lastName} — ₱{emp.basicSalary.toLocaleString()} ({emp.role})
                </option>
              ))}
            </select>
          </div>

          {/* Basic Monthly Salary Input & Slider */}
          <div className="md:col-span-5">
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Monthly Basic Salary:
              </label>
              <span className="text-sm font-bold font-mono text-emerald-400">
                ₱{salaryInput.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">₱</span>
                <input
                  type="number"
                  min="4000"
                  max="200000"
                  step="500"
                  value={salaryInput}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    setSalaryInput(val);
                    setSelectedEmployeeId('');
                  }}
                  className="w-full pl-7 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <input
                type="range"
                min="4000"
                max="120000"
                step="500"
                value={salaryInput}
                onChange={(e) => {
                  setSalaryInput(parseFloat(e.target.value));
                  setSelectedEmployeeId('');
                }}
                className="w-36 accent-indigo-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Quick Salary Presets */}
          <div className="md:col-span-3 flex flex-wrap gap-1.5 items-center">
            {SALARY_PRESETS.map((preset) => (
              <button
                key={preset.amount}
                onClick={() => {
                  setSalaryInput(preset.amount);
                  setSelectedEmployeeId('');
                }}
                className={`px-2 py-1 rounded text-[10px] font-medium transition-colors border ${
                  salaryInput === preset.amount
                    ? 'bg-indigo-600 text-white border-indigo-500'
                    : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700'
                }`}
              >
                {preset.label.split('(')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Live Calculated Metric Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* SSS Card */}
        <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              SSS Contribution
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-800 font-bold border border-blue-200">
              MSC: ₱{liveBreakdown.sssMsc.toLocaleString()}
            </span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="bg-blue-50/50 p-2.5 rounded-lg border border-blue-100">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Employee (EE)</span>
              <span className="text-base font-bold text-blue-900 font-mono mt-0.5 block">
                ₱{liveBreakdown.sss.toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-500">Reg: ₱{liveBreakdown.sssRegularEE.toFixed(0)} | WISP: ₱{liveBreakdown.sssWispEE.toFixed(0)}</span>
            </div>
            <div className="bg-blue-50/50 p-2.5 rounded-lg border border-blue-100">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Employer (ER)</span>
              <span className="text-base font-bold text-blue-900 font-mono mt-0.5 block">
                ₱{liveBreakdown.sssER.toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-500">Reg: ₱{liveBreakdown.sssRegularER.toFixed(0)} | EC: ₱{liveBreakdown.sssEcER}</span>
            </div>
          </div>

          <div className="mt-2 text-[11px] text-slate-600 flex justify-between pt-2 border-t border-slate-100">
            <span>Total Monthly SSS Remittance:</span>
            <span className="font-bold font-mono text-slate-900">₱{liveBreakdown.sssTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* PhilHealth Card */}
        <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
              <HeartPulse className="w-4 h-4 text-emerald-600" />
              PhilHealth (5.0%)
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
              Floor ₱10k / Cap ₱100k
            </span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Employee (2.5%)</span>
              <span className="text-base font-bold text-emerald-900 font-mono mt-0.5 block">
                ₱{liveBreakdown.philhealth.toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-500">50% shared deduction</span>
            </div>
            <div className="bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Employer (2.5%)</span>
              <span className="text-base font-bold text-emerald-900 font-mono mt-0.5 block">
                ₱{liveBreakdown.philhealthER.toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-500">50% employer counterpart</span>
            </div>
          </div>

          <div className="mt-2 text-[11px] text-slate-600 flex justify-between pt-2 border-t border-slate-100">
            <span>Total PhilHealth Premium:</span>
            <span className="font-bold font-mono text-slate-900">₱{liveBreakdown.philhealthTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Pag-IBIG Card */}
        <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
              <Home className="w-4 h-4 text-amber-600" />
              Pag-IBIG / HDMF
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-800 font-bold border border-amber-200">
              Circular 460 (Max ₱200/₱200)
            </span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="bg-amber-50/50 p-2.5 rounded-lg border border-amber-100">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Employee (2.0%)</span>
              <span className="text-base font-bold text-amber-900 font-mono mt-0.5 block">
                ₱{liveBreakdown.pagibig.toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-500">Mandatory Cap: ₱200.00</span>
            </div>
            <div className="bg-amber-50/50 p-2.5 rounded-lg border border-amber-100">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Employer (2.0%)</span>
              <span className="text-base font-bold text-amber-900 font-mono mt-0.5 block">
                ₱{liveBreakdown.pagibigER.toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-500">Mandatory Cap: ₱200.00</span>
            </div>
          </div>

          <div className="mt-2 text-[11px] text-slate-600 flex justify-between pt-2 border-t border-slate-100">
            <span>Total Pag-IBIG Remittance:</span>
            <span className="font-bold font-mono text-slate-900">₱{liveBreakdown.pagibigTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Consolidated Total Statutory Card */}
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50/60 p-4 rounded-xl border border-indigo-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-indigo-700" />
              Consolidated Statutory
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-600 text-white">
              All 3 Agencies
            </span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white p-2.5 rounded-lg border border-indigo-100 shadow-2xs">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Total EE Deductions</span>
              <span className="text-base font-black text-rose-700 font-mono mt-0.5 block">
                ₱{liveBreakdown.mandatoryDeductionsEE.toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-500">
                {((liveBreakdown.mandatoryDeductionsEE / salaryInput) * 100).toFixed(1)}% of salary
              </span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-indigo-100 shadow-2xs">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Total ER Burden</span>
              <span className="text-base font-black text-blue-900 font-mono mt-0.5 block">
                ₱{liveBreakdown.mandatoryContributionsER.toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-500">
                {((liveBreakdown.mandatoryContributionsER / salaryInput) * 100).toFixed(1)}% employer cost
              </span>
            </div>
          </div>

          <div className="mt-2 text-[11px] text-slate-700 flex justify-between pt-2 border-t border-indigo-200 font-bold">
            <span>Combined Total Remittance:</span>
            <span className="font-mono text-indigo-950">
              ₱{(liveBreakdown.mandatoryDeductionsEE + liveBreakdown.mandatoryContributionsER).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Main Mode View: Batch Register vs Interactive Bracket Explorer */}
      {viewBatchRegister ? (
        /* BATCH SUMMARY FOR ALL ACTIVE EMPLOYEES */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">Company-Wide Statutory Contributions Register</h3>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                  {batchSummaries.length} Active Personnel
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Exact statutory contributions computed across active payroll master records.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleExportBatchCsv('sss-r3')}
                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-semibold rounded-lg border border-blue-200 flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                SSS Form R-3
              </button>
              <button
                onClick={() => handleExportBatchCsv('ph-eprs')}
                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-lg border border-emerald-200 flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                PhilHealth EPRS
              </button>
              <button
                onClick={() => handleExportBatchCsv('hdmf-mcr')}
                className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold rounded-lg border border-amber-200 flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Pag-IBIG MCR
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-3 py-3">Department</th>
                  <th className="px-3 py-3 text-right">Basic Salary</th>
                  <th className="px-3 py-3 text-right bg-blue-50/50 text-blue-900">SSS (EE)</th>
                  <th className="px-3 py-3 text-right bg-blue-50/50 text-blue-900">SSS (ER)</th>
                  <th className="px-3 py-3 text-right bg-emerald-50/50 text-emerald-900">PhilHealth (EE)</th>
                  <th className="px-3 py-3 text-right bg-emerald-50/50 text-emerald-900">PhilHealth (ER)</th>
                  <th className="px-3 py-3 text-right bg-amber-50/50 text-amber-900">HDMF (EE)</th>
                  <th className="px-3 py-3 text-right bg-amber-50/50 text-amber-900">HDMF (ER)</th>
                  <th className="px-3 py-3 text-right font-black text-rose-700">Total EE</th>
                  <th className="px-3 py-3 text-right font-black text-blue-900">Total ER</th>
                  <th className="px-4 py-3 text-right font-black text-slate-900">Grand Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {batchSummaries.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-2.5">
                      <div className="font-semibold text-slate-900">{emp.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">SSS: {emp.sssNo}</div>
                    </td>
                    <td className="px-3 py-2.5 text-slate-600">{emp.department}</td>
                    <td className="px-3 py-2.5 text-right font-mono font-medium text-slate-800">
                      ₱{emp.salary.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono text-blue-800 bg-blue-50/20">
                      ₱{emp.sssEE.toFixed(2)}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono text-blue-800 bg-blue-50/20">
                      ₱{emp.sssER.toFixed(2)}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono text-emerald-800 bg-emerald-50/20">
                      ₱{emp.phEE.toFixed(2)}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono text-emerald-800 bg-emerald-50/20">
                      ₱{emp.phER.toFixed(2)}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono text-amber-800 bg-amber-50/20">
                      ₱{emp.hdmfEE.toFixed(2)}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono text-amber-800 bg-amber-50/20">
                      ₱{emp.hdmfER.toFixed(2)}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono font-bold text-rose-700">
                      ₱{emp.totalEE.toFixed(2)}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono font-bold text-blue-900">
                      ₱{emp.totalER.toFixed(2)}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono font-extrabold text-slate-900">
                      ₱{emp.grandTotal.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-100 text-slate-900 font-bold border-t-2 border-slate-300">
                <tr>
                  <td colSpan={2} className="px-4 py-3 uppercase text-[11px] tracking-wider">
                    Total Monthly Remittance ({batchSummaries.length} Staff)
                  </td>
                  <td className="px-3 py-3 text-right font-mono">
                    ₱{batchTotals.salary.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </td>
                  <td className="px-3 py-3 text-right font-mono text-blue-900">
                    ₱{batchTotals.sssEE.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-3 py-3 text-right font-mono text-blue-900">
                    ₱{batchTotals.sssER.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-3 py-3 text-right font-mono text-emerald-900">
                    ₱{batchTotals.phEE.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-3 py-3 text-right font-mono text-emerald-900">
                    ₱{batchTotals.phER.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-3 py-3 text-right font-mono text-amber-900">
                    ₱{batchTotals.hdmfEE.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-3 py-3 text-right font-mono text-amber-900">
                    ₱{batchTotals.hdmfER.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-3 py-3 text-right font-mono font-black text-rose-700">
                    ₱{batchTotals.totalEE.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-3 py-3 text-right font-mono font-black text-blue-950">
                    ₱{batchTotals.totalER.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-black text-slate-950">
                    ₱{batchTotals.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      ) : (
        /* INTERACTIVE BRACKET EXPLORER & SCHEDULE MATRIX */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Navigation Bar for Agencies */}
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex border-b sm:border-b-0 border-slate-200 gap-2">
              <button
                onClick={() => setActiveAgencyTab('all')}
                className={`py-2 px-3 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeAgencyTab === 'all'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Scale className="w-3.5 h-3.5" />
                Consolidated Comparison
              </button>
              <button
                onClick={() => setActiveAgencyTab('sss')}
                className={`py-2 px-3 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeAgencyTab === 'sss'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                SSS Bracket Table (14% + WISP)
              </button>
              <button
                onClick={() => setActiveAgencyTab('philhealth')}
                className={`py-2 px-3 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeAgencyTab === 'philhealth'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <HeartPulse className="w-3.5 h-3.5" />
                PhilHealth (5.0%)
              </button>
              <button
                onClick={() => setActiveAgencyTab('pagibig')}
                className={`py-2 px-3 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeAgencyTab === 'pagibig'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Home className="w-3.5 h-3.5" />
                Pag-IBIG Circular 460
              </button>
            </div>

            {/* Filter / Search input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Find salary range in brackets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* TAB 1: CONSOLIDATED BREAKDOWN */}
          {activeAgencyTab === 'all' && (
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3">
                  <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    Social Security System (SSS)
                  </div>
                  <div className="text-xs text-slate-600 space-y-1">
                    <div className="flex justify-between">
                      <span>Monthly Salary Credit:</span>
                      <strong className="font-mono text-slate-900">₱{liveBreakdown.sssMsc.toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Regular SS (EE 4.5%):</span>
                      <span className="font-mono">₱{liveBreakdown.sssRegularEE.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>WISP Provident (EE 4.5%):</span>
                      <span className="font-mono">₱{liveBreakdown.sssWispEE.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-200 font-bold text-blue-950">
                      <span>Total SSS Employee Share:</span>
                      <span className="font-mono">₱{liveBreakdown.sss.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between pt-1 text-slate-500">
                      <span>Total SSS Employer Share (inc. EC):</span>
                      <span className="font-mono">₱{liveBreakdown.sssER.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                    <HeartPulse className="w-4 h-4 text-emerald-600" />
                    PhilHealth (National Health)
                  </div>
                  <div className="text-xs text-slate-600 space-y-1">
                    <div className="flex justify-between">
                      <span>Applicable Monthly Salary Base:</span>
                      <strong className="font-mono text-slate-900">₱{liveBreakdown.philhealthMsc.toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Premium Rate:</span>
                      <span className="font-mono font-semibold">5.0% of basic</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shared Split:</span>
                      <span className="font-mono">50% EE / 50% ER</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-200 font-bold text-emerald-950">
                      <span>PhilHealth Employee Share (2.5%):</span>
                      <span className="font-mono">₱{liveBreakdown.philhealth.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between pt-1 text-slate-500">
                      <span>PhilHealth Employer Share (2.5%):</span>
                      <span className="font-mono">₱{liveBreakdown.philhealthER.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                    <Home className="w-4 h-4 text-amber-600" />
                    Pag-IBIG / HDMF Fund
                  </div>
                  <div className="text-xs text-slate-600 space-y-1">
                    <div className="flex justify-between">
                      <span>Monthly Compensation Cap (MMC):</span>
                      <strong className="font-mono text-slate-900">₱{liveBreakdown.pagibigMfs.toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Governing Mandate:</span>
                      <span className="font-mono">Circular No. 460</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Contribution Rate:</span>
                      <span className="font-mono">2% EE / 2% ER</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-200 font-bold text-amber-950">
                      <span>Pag-IBIG Mandatory EE Share:</span>
                      <span className="font-mono">₱{liveBreakdown.pagibig.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between pt-1 text-slate-500">
                      <span>Pag-IBIG Employer Share:</span>
                      <span className="font-mono">₱{liveBreakdown.pagibigER.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Legal Reference & Explanatory Footnotes */}
              <div className="p-4 bg-indigo-50/50 border border-indigo-200 rounded-xl text-xs space-y-2 text-indigo-950">
                <div className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  Philippine Statutory Legal Framework & Rules (2024–2026):
                </div>
                <ul className="list-disc pl-5 space-y-1 text-slate-700">
                  <li>
                    <strong>Social Security Act of 2018 (RA 11199):</strong> Contribution rate is 14% (4.5% EE / 9.5% ER). Regular MSC is capped at ₱20,000. Any salary credit above ₱20,000 up to ₱30,000 is automatically credited into the Workers' Investment and Savings Program (WISP) provident fund.
                  </li>
                  <li>
                    <strong>Universal Health Care Act (RA 11223):</strong> Directs PhilHealth premium rate to 5.0% with a minimum salary base of ₱10,000 (minimum ₱500 premium) and a statutory ceiling of ₱100,000 (maximum ₱5,000 premium), equally split 50/50 between employer and employee.
                  </li>
                  <li>
                    <strong>Pag-IBIG Circular No. 460:</strong> The maximum monthly compensation (MMC) used for HDMF calculations was doubled from ₱5,000 to ₱10,000, setting the standard statutory employee and employer contributions at ₱200.00 each (Total ₱400.00/month).
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 2: FULL SSS BRACKET SCHEDULE */}
          {activeAgencyTab === 'sss' && (
            <div>
              <div className="p-4 bg-blue-50/70 border-b border-blue-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs text-blue-900">
                <div>
                  <span className="font-bold">Official SSS Contribution Schedule (14% + WISP + EC):</span> Minimum MSC ₱4,000 to Maximum MSC ₱30,000 in increments of ₱500.
                </div>
                <div className="font-mono text-[11px] bg-white px-2.5 py-1 rounded border border-blue-200 font-bold">
                  Highlighted Row: Your Salary ₱{salaryInput.toLocaleString()}
                </div>
              </div>

              <div className="overflow-x-auto max-h-[520px]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0 uppercase tracking-wider text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-3">Compensation Range</th>
                      <th className="px-3 py-3 text-right">MSC</th>
                      <th className="px-3 py-3 text-right bg-blue-50/60 text-blue-800">Regular EE (4.5%)</th>
                      <th className="px-3 py-3 text-right bg-blue-50/60 text-blue-800">WISP EE (4.5%)</th>
                      <th className="px-3 py-3 text-right font-black bg-blue-100 text-blue-900">Total EE</th>
                      <th className="px-3 py-3 text-right bg-amber-50/60 text-amber-900">Regular ER (9.5%)</th>
                      <th className="px-3 py-3 text-right bg-amber-50/60 text-amber-900">WISP ER (9.5%)</th>
                      <th className="px-3 py-3 text-right text-slate-600">EC (ER)</th>
                      <th className="px-3 py-3 text-right font-black bg-amber-100 text-amber-900">Total ER</th>
                      <th className="px-3 py-3 text-right font-black text-slate-900">Grand Total</th>
                      <th className="px-3 py-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSssBrackets.map((bracket) => {
                      const isMatch = salaryInput >= bracket.minCompensation && salaryInput <= bracket.maxCompensation;
                      return (
                        <tr
                          key={bracket.msc}
                          className={`transition-colors ${
                            isMatch
                              ? 'bg-blue-100/70 font-semibold ring-2 ring-blue-500/40 text-blue-950'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <td className="px-3 py-2.5 font-mono">
                            {bracket.msc === 4000
                              ? 'Below ₱4,250.00'
                              : bracket.msc === 30000
                              ? '₱29,750.00 and above'
                              : `₱${bracket.minCompensation.toLocaleString(undefined, { minimumFractionDigits: 2 })} - ₱${bracket.maxCompensation.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                          </td>
                          <td className="px-3 py-2.5 text-right font-mono font-bold">
                            ₱{bracket.msc.toLocaleString()}
                          </td>
                          <td className="px-3 py-2.5 text-right font-mono text-blue-900">
                            ₱{bracket.regularEE.toFixed(2)}
                          </td>
                          <td className="px-3 py-2.5 text-right font-mono text-blue-700">
                            {bracket.wispEE > 0 ? `₱${bracket.wispEE.toFixed(2)}` : '-'}
                          </td>
                          <td className="px-3 py-2.5 text-right font-mono font-black text-blue-900 bg-blue-50/30">
                            ₱{bracket.totalEE.toFixed(2)}
                          </td>
                          <td className="px-3 py-2.5 text-right font-mono text-amber-900">
                            ₱{bracket.regularER.toFixed(2)}
                          </td>
                          <td className="px-3 py-2.5 text-right font-mono text-amber-700">
                            {bracket.wispER > 0 ? `₱${bracket.wispER.toFixed(2)}` : '-'}
                          </td>
                          <td className="px-3 py-2.5 text-right font-mono text-slate-600">
                            ₱{bracket.ec.toFixed(2)}
                          </td>
                          <td className="px-3 py-2.5 text-right font-mono font-black text-amber-950 bg-amber-50/30">
                            ₱{bracket.totalER.toFixed(2)}
                          </td>
                          <td className="px-3 py-2.5 text-right font-mono font-extrabold text-slate-900">
                            ₱{bracket.grandTotal.toFixed(2)}
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            {isMatch ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600 text-white animate-pulse">
                                <CheckCircle2 className="w-3 h-3" />
                                Current
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400">--</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: PHILHEALTH TIER MATRIX */}
          {activeAgencyTab === 'philhealth' && (
            <div className="p-6 space-y-5">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-emerald-950 text-xs">
                <div>
                  <span className="font-bold text-sm block">PhilHealth Premium Rate: 5.0% (RA 11223)</span>
                  <span>Direct computation: <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-emerald-300">Monthly Basic × 5.0% ÷ 2</code> for each share.</span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-emerald-200 text-right font-mono">
                  <div className="text-[10px] text-slate-500 uppercase">Your PhilHealth Split</div>
                  <div className="text-base font-bold text-emerald-800">
                    EE: ₱{liveBreakdown.philhealth.toFixed(2)} | ER: ₱{liveBreakdown.philhealthER.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Basic Salary Benchmark Tier</th>
                      <th className="px-4 py-3 text-right">Applicable Base</th>
                      <th className="px-4 py-3 text-center">Total Rate</th>
                      <th className="px-4 py-3 text-right bg-emerald-50 text-emerald-900">Total Premium (5%)</th>
                      <th className="px-4 py-3 text-right bg-emerald-100 text-emerald-950 font-black">Employee Share (2.5%)</th>
                      <th className="px-4 py-3 text-right bg-emerald-100 text-emerald-950 font-black">Employer Share (2.5%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {philhealthTiers.map((tier) => {
                      const isClosest = Math.abs(salaryInput - tier.salary) < 5000;
                      return (
                        <tr
                          key={tier.range}
                          className={isClosest ? 'bg-emerald-50/60 font-semibold' : 'hover:bg-slate-50'}
                        >
                          <td className="px-4 py-2.5 text-slate-800 font-medium">
                            {tier.range}
                          </td>
                          <td className="px-4 py-2.5 text-right font-mono text-slate-700">
                            ₱{tier.salary.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-4 py-2.5 text-center font-mono font-bold text-slate-600">
                            {tier.rate}
                          </td>
                          <td className="px-4 py-2.5 text-right font-mono font-bold text-emerald-900 bg-emerald-50/30">
                            ₱{tier.total.toFixed(2)}
                          </td>
                          <td className="px-4 py-2.5 text-right font-mono font-black text-emerald-800">
                            ₱{tier.ee.toFixed(2)}
                          </td>
                          <td className="px-4 py-2.5 text-right font-mono font-black text-emerald-800">
                            ₱{tier.er.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: PAG-IBIG CIRCULAR 460 & MP2 */}
          {activeAgencyTab === 'pagibig' && (
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3 text-xs">
                  <div className="font-bold text-amber-950 text-sm flex items-center gap-2">
                    <Home className="w-4 h-4 text-amber-600" />
                    Mandatory Regular Pag-IBIG (Circular No. 460)
                  </div>
                  <p className="text-amber-900 leading-relaxed">
                    Under Pag-IBIG Fund Circular No. 460, the Maximum Monthly Compensation (MMC) was adjusted to <strong>₱10,000.00</strong>. At the statutory rate of 2% each:
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-center pt-1">
                    <div className="bg-white p-3 rounded-lg border border-amber-200">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">EE Share (2%)</span>
                      <span className="text-lg font-bold text-amber-900 font-mono">₱200.00</span>
                      <span className="text-[10px] text-slate-500">Max monthly cap</span>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-amber-200">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">ER Share (2%)</span>
                      <span className="text-lg font-bold text-amber-900 font-mono">₱200.00</span>
                      <span className="text-[10px] text-slate-500">Max monthly cap</span>
                    </div>
                  </div>
                  <div className="text-[11px] text-amber-800 pt-1">
                    Total combined statutory mandatory monthly remittance = <strong>₱400.00</strong> per covered employee.
                  </div>
                </div>

                <div className="p-4 bg-indigo-50/60 border border-indigo-200 rounded-xl space-y-3 text-xs">
                  <div className="font-bold text-indigo-950 text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    Modified Pag-IBIG 2 (MP2) Voluntary Savings
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Government-backed voluntary savings program with tax-free dividends (2023–2025 dividend yield ~7.05% p.a.). Employees can request monthly payroll deduction.
                  </p>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Simulate Employee MP2 Monthly Deduction:
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-500">₱</span>
                      <input
                        type="number"
                        min="500"
                        step="500"
                        value={voluntaryMp2}
                        onChange={(e) => setVoluntaryMp2(parseFloat(e.target.value) || 0)}
                        className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold w-36"
                      />
                      <span className="text-[11px] text-slate-500 font-mono">
                        Estimated 5-Year Maturity: ₱{((voluntaryMp2 * 60) * 1.2).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
