import { useState, useId } from 'react';
import { 
  Calculator, ShieldCheck, HeartPulse, Home, Scale, DollarSign, 
  HelpCircle, Eye, Printer, Download, Sparkles, Building2, 
  CheckCircle2, ArrowRight, TrendingUp, Users, ChevronDown, 
  ChevronUp, RotateCcw, AlertCircle, Percent, Landmark
} from 'lucide-react';
import { 
  calculateContributions, 
  SALARY_PRESETS, 
  ContributionBreakdown 
} from '../../lib/ph-payroll';
import { mockEmployees } from '../../data/mockData';
import { StatutoryTablesModal } from './StatutoryTablesModal';
import { PayslipModal } from './PayslipModal';

interface ContributionCalculatorProps {
  initialSalary?: number;
  initialEmployeeId?: string;
  onApplyToEmployee?: (employeeId: string, salary: number) => void;
}

export function ContributionCalculator({
  initialSalary = 50000,
  initialEmployeeId,
  onApplyToEmployee,
}: ContributionCalculatorProps) {
  const [basicSalary, setBasicSalary] = useState<number>(initialSalary);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(initialEmployeeId || '');
  const [payPeriodMode, setPayPeriodMode] = useState<'monthly' | 'semi-monthly'>('monthly');
  const [showAdvancedInputs, setShowAdvancedInputs] = useState<boolean>(false);
  const [includeLoans, setIncludeLoans] = useState<boolean>(true);
  
  // Advanced inputs
  const [allowancesTaxable, setAllowancesTaxable] = useState<number>(0);
  const [allowancesNonTaxable, setAllowancesNonTaxable] = useState<number>(0);
  const [overtimePay, setOvertimePay] = useState<number>(0);
  const [absencesTardiness, setAbsencesTardiness] = useState<number>(0);
  const [pagibigMp2, setPagibigMp2] = useState<number>(0);
  const [otherDeductions, setOtherDeductions] = useState<number>(0);

  // Modals state
  const [showTablesModal, setShowTablesModal] = useState<boolean>(false);
  const [showPayslipModal, setShowPayslipModal] = useState<boolean>(false);

  // Calculation
  const breakdown: ContributionBreakdown = calculateContributions(basicSalary, {
    allowancesTaxable,
    allowancesNonTaxable,
    overtimePay,
    absencesTardiness,
    pagibigMp2,
    otherDeductions,
    employeeId: selectedEmployeeId || undefined,
    includeLoans,
  });


  const selectedEmployee = mockEmployees.find(e => e.id === selectedEmployeeId);

  const handleSelectEmployee = (empId: string) => {
    setSelectedEmployeeId(empId);
    if (!empId) return;
    const emp = mockEmployees.find(e => e.id === empId);
    if (emp) {
      setBasicSalary(emp.basicSalary);
    }
  };

  const handleReset = () => {
    setBasicSalary(50000);
    setSelectedEmployeeId('');
    setAllowancesTaxable(0);
    setAllowancesNonTaxable(0);
    setOvertimePay(0);
    setAbsencesTardiness(0);
    setPagibigMp2(0);
    setOtherDeductions(0);
  };

  const handleExportCSV = () => {
    const rows = [
      ['PH Mandatory Statutory Contributions & Payroll Computation'],
      ['Generated On', new Date().toLocaleDateString('en-PH')],
      ['Employee Name', selectedEmployee ? `${selectedEmployee.firstName} ${selectedEmployee.lastName}` : 'Custom Simulation'],
      ['Monthly Basic Salary', breakdown.basicSalary],
      ['Taxable Allowances', breakdown.allowancesTaxable],
      ['Non-Taxable Allowances', breakdown.allowancesNonTaxable],
      ['Overtime / Holiday Pay', breakdown.overtimePay],
      ['Tardiness / Absences', -breakdown.absencesTardiness],
      ['Gross Pay', breakdown.grossPay],
      [''],
      ['--- MANDATORY EMPLOYEE DEDUCTIONS ---', 'Amount'],
      ['SSS Monthly Salary Credit (MSC)', breakdown.sssMsc],
      ['SSS Employee Contribution (Regular + WISP)', breakdown.sss],
      ['PhilHealth Employee Contribution (2.5%)', breakdown.philhealth],
      ['Pag-IBIG Mandatory Contribution (EE)', breakdown.pagibig],
      ['Pag-IBIG MP2 Voluntary', breakdown.pagibigMp2],
      ['Total Statutory Deductions (EE)', breakdown.mandatoryDeductionsEE],
      ['Taxable Income Base', breakdown.taxableIncome],
      ['BIR Withholding Tax', breakdown.withholdingTax],
      ['Other Deductions', breakdown.otherDeductions],
      ['TOTAL DEDUCTIONS', breakdown.totalDeductions],
      ['NET TAKE-HOME PAY (Monthly)', breakdown.netPay],
      ['NET TAKE-HOME PAY (Semi-Monthly)', breakdown.semiMonthlyNet],
      [''],
      ['--- EMPLOYER STATUTORY CONTRIBUTIONS (COST TO COMPANY) ---', 'Amount'],
      ['SSS Employer Contribution (Regular + WISP)', breakdown.sssER - breakdown.sssEcER],
      ['SSS Employees Compensation (EC)', breakdown.sssEcER],
      ['Total SSS Employer Share', breakdown.sssER],
      ['PhilHealth Employer Contribution (2.5%)', breakdown.philhealthER],
      ['Pag-IBIG Employer Contribution', breakdown.pagibigER],
      ['Total Employer Statutory Contributions', breakdown.mandatoryContributionsER],
      ['TOTAL COST TO EMPLOYER (CTC)', breakdown.costToEmployer],
      [''],
      ['--- 13TH MONTH PAY ESTIMATE ---', 'Amount'],
      ['Projected 13th Month Pay', breakdown.thirteenthMonthPay],
      ['Tax Status', breakdown.isThirteenthMonthExempt ? 'Tax Exempt (Within ₱90,000 threshold)' : `Taxable excess of ₱${breakdown.thirteenthMonthTaxableExcess}`],
    ];

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `PH_Statutory_Contributions_${basicSalary}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Multipliers for display if semi-monthly
  const displayFactor = payPeriodMode === 'semi-monthly' ? 0.5 : 1;
  const isSemi = payPeriodMode === 'semi-monthly';

  // Percentage of gross
  const netPercent = breakdown.grossPay > 0 ? ((breakdown.netPay / breakdown.grossPay) * 100).toFixed(1) : '0';
  const statutoryPercent = breakdown.grossPay > 0 ? ((breakdown.mandatoryDeductionsEE / breakdown.grossPay) * 100).toFixed(1) : '0';
  const taxPercent = breakdown.grossPay > 0 ? ((breakdown.withholdingTax / breakdown.grossPay) * 100).toFixed(1) : '0';
  const employerBurdenPercent = breakdown.basicSalary > 0 ? (((breakdown.mandatoryContributionsER) / breakdown.basicSalary) * 100).toFixed(1) : '0';

  const basicSalaryInputId = useId();

  return (
    <div className="space-y-6">
      {/* Utility Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-blue-500/10 to-transparent pointer-events-none" />
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 relative z-10">
          <div className="space-y-1 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-semibold border border-blue-400/30">
              <Sparkles className="w-3.5 h-3.5" />
              Philippines Statutory Payroll Calculator (2024 / 2025)
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Government Contributions & Net Pay Utility
            </h2>
            <p className="text-sm text-slate-300">
              Real-time computation of mandatory SSS (14% + WISP + EC), PhilHealth (5%), Pag-IBIG HDMF (₱10k cap), and BIR TRAIN withholding taxes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowTablesModal(true)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-2 transition-colors shadow-xs"
            >
              <Scale className="w-4 h-4 text-blue-400" />
              Statutory Schedules
            </button>
            <button
              onClick={() => setShowPayslipModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors shadow-sm"
            >
              <Eye className="w-4 h-4" />
              Preview Payslip
            </button>
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              CSV Export
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Controls & Inputs, Right Summary & Visuals */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Input Controller (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-5">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">Salary & Inputs</h3>
              </div>
              <button
                onClick={handleReset}
                className="text-xs text-slate-400 hover:text-slate-700 flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            </div>

            {/* Quick Employee Selector */}
            <div className="space-y-1.5">
              <label htmlFor="hr-calculator-employee-select" className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Select Employee from Registry</span>
                <span className="text-[10px] text-slate-400 font-normal">Optional</span>
              </label>
              <select
                id="hr-calculator-employee-select"
                value={selectedEmployeeId}
                onChange={(e) => handleSelectEmployee(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
              >
                <option value="">-- Custom Simulation (Enter Salary Below) --</option>
                {mockEmployees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName} — {emp.role} (₱{emp.basicSalary.toLocaleString()}/mo)
                  </option>
                ))}
              </select>
            </div>

            {/* Monthly Basic Salary Main Input */}
            <div className="space-y-2">
              <label htmlFor={basicSalaryInputId} className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>Monthly Basic Salary (PHP)</span>
                <span className="text-xs font-black text-blue-600 font-mono">
                  ₱{basicSalary.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold text-sm">₱</span>
                <input
                  id={basicSalaryInputId}
                  type="number"
                  step="500"
                  min="0"
                  max="1000000"
                  value={basicSalary || ''}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setBasicSalary(isNaN(val) ? 0 : val);
                  }}
                  className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-base font-bold font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all shadow-inner"
                  placeholder="e.g. 50000"
                />
              </div>

              {/* Slider for quick adjustments */}
              <input
                type="range"
                min="10000"
                max="200000"
                step="1000"
                value={Math.min(Math.max(basicSalary, 10000), 200000)}
                onChange={(e) => setBasicSalary(Number(e.target.value))}
                className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            {/* Standard Presets */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Quick PH Presets</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {SALARY_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => {
                      setBasicSalary(preset.amount);
                      setSelectedEmployeeId('');
                    }}
                    className={`px-2 py-1.5 text-left rounded-lg border text-xs transition-all ${
                      basicSalary === preset.amount
                        ? 'border-blue-600 bg-blue-50 text-blue-800 font-bold shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <div className="font-semibold truncate">{preset.label}</div>
                    <div className="font-mono text-[10px] text-slate-500">₱{preset.amount.toLocaleString()}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Pay Period Toggle */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Display Breakdown As:</span>
              <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
                <button
                  onClick={() => setPayPeriodMode('monthly')}
                  className={`px-3 py-1 rounded-md transition-all ${
                    payPeriodMode === 'monthly'
                      ? 'bg-white text-blue-700 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setPayPeriodMode('semi-monthly')}
                  className={`px-3 py-1 rounded-md transition-all ${
                    payPeriodMode === 'semi-monthly'
                      ? 'bg-white text-blue-700 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Semi-Monthly (15th/30th)
                </button>
              </div>
            </div>

            {/* Expandable Adjustments & Non-Taxable Allowances */}
            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowAdvancedInputs(!showAdvancedInputs)}
                className="w-full flex items-center justify-between text-xs font-bold text-slate-600 hover:text-slate-900 py-1 transition-colors"
              >
                <span>Allowances, Overtime, & Deductions</span>
                {showAdvancedInputs ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showAdvancedInputs && (
                <div className="mt-3 space-y-3 pt-2 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200 animate-in fade-in duration-150">
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label htmlFor="hr-calc-taxable-allowance" className="text-slate-600 block mb-1">Taxable Allowance</label>
                      <input
                        id="hr-calc-taxable-allowance"
                        type="number"
                        min="0"
                        placeholder="₱0.00"
                        value={allowancesTaxable || ''}
                        onChange={(e) => setAllowancesTaxable(parseFloat(e.target.value) || 0)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label htmlFor="hr-calc-nontax-allowance" className="text-slate-600 block mb-1">Non-Taxable (De Minimis)</label>
                      <input
                        id="hr-calc-nontax-allowance"
                        type="number"
                        min="0"
                        placeholder="₱0.00"
                        value={allowancesNonTaxable || ''}
                        onChange={(e) => setAllowancesNonTaxable(parseFloat(e.target.value) || 0)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label htmlFor="hr-calc-overtime-pay" className="text-slate-600 block mb-1">Overtime / Holiday Pay</label>
                      <input
                        id="hr-calc-overtime-pay"
                        type="number"
                        min="0"
                        placeholder="₱0.00"
                        value={overtimePay || ''}
                        onChange={(e) => setOvertimePay(parseFloat(e.target.value) || 0)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label htmlFor="hr-calc-tardiness-undertime" className="text-slate-600 block mb-1">Tardiness / Undertime</label>
                      <input
                        id="hr-calc-tardiness-undertime"
                        type="number"
                        min="0"
                        placeholder="₱0.00"
                        value={absencesTardiness || ''}
                        onChange={(e) => setAbsencesTardiness(parseFloat(e.target.value) || 0)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs font-mono text-rose-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label htmlFor="hr-calc-pagibig-mp2" className="text-slate-600 block mb-1">Pag-IBIG MP2 (Voluntary)</label>
                      <input
                        id="hr-calc-pagibig-mp2"
                        type="number"
                        min="0"
                        placeholder="₱0.00"
                        value={pagibigMp2 || ''}
                        onChange={(e) => setPagibigMp2(parseFloat(e.target.value) || 0)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label htmlFor="hr-calc-other-deductions" className="text-slate-600 block mb-1">Other Deductions (Loan/HMO)</label>
                      <input
                        id="hr-calc-other-deductions"
                        type="number"
                        min="0"
                        placeholder="₱0.00"
                        value={otherDeductions || ''}
                        onChange={(e) => setOtherDeductions(parseFloat(e.target.value) || 0)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs font-mono text-rose-600"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Summary Note */}
            <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-lg text-xs text-blue-900 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Official Government Basis:</span> Calculations strictly follow SSS 14% schedule, PhilHealth 5% table, and Pag-IBIG ₱10,000 MFS cap under Circular 460.
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Results & Contribution Breakdown (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Main Top Result Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Net Take-Home Pay Card */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-500 rounded-xl p-5 shadow-xs flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                    Net Take-Home Pay {isSemi && '(Per Cut-off)'}
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-700 font-mono mt-1">
                    ₱{((isSemi ? breakdown.semiMonthlyNet : breakdown.netPay)).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                </div>
                <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded text-xs font-bold font-mono">
                  {netPercent}% of Gross
                </span>
              </div>
              <div className="mt-4 pt-3 border-t border-emerald-200/60 flex justify-between text-xs text-emerald-900">
                <span>Monthly Equivalent:</span>
                <span className="font-bold font-mono">₱{breakdown.netPay.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Total Employer Cost Card */}
            <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-xl p-5 shadow-xs flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                    Employer Total Cost (CTC)
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-blue-300 font-mono mt-1">
                    ₱{((isSemi ? breakdown.costToEmployer / 2 : breakdown.costToEmployer)).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                </div>
                <span className="px-2 py-1 bg-blue-500/20 border border-blue-400/30 text-blue-200 rounded text-xs font-bold font-mono">
                  +{employerBurdenPercent}% ER Burden
                </span>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-700/60 flex justify-between text-xs text-slate-300">
                <span>Employer Statutory Add-On:</span>
                <span className="font-bold font-mono text-emerald-400">
                  +₱{((isSemi ? breakdown.mandatoryContributionsER / 2 : breakdown.mandatoryContributionsER)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Breakdown Comparison Cards: SSS, PhilHealth, Pag-IBIG, Tax */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* SSS Contribution Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase">SSS Contribution</h4>
                    <span className="text-[10px] text-slate-500">RA 11199 (14% Rate)</span>
                  </div>
                </div>
                <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-mono font-bold">
                  MSC ₱{breakdown.sssMsc.toLocaleString()}
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Employee Share:</span>
                  <span className="font-mono font-bold text-blue-700">
                    ₱{(breakdown.sss * displayFactor).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-500 text-[11px] pl-2 border-l-2 border-blue-200">
                  <span>• Regular SSS (4.5%):</span>
                  <span className="font-mono">₱{(breakdown.sssRegularEE * displayFactor).toFixed(2)}</span>
                </div>
                {breakdown.sssWispEE > 0 && (
                  <div className="flex justify-between items-center text-slate-500 text-[11px] pl-2 border-l-2 border-indigo-200">
                    <span>• WISP Provident (4.5%):</span>
                    <span className="font-mono text-indigo-700 font-semibold">₱{(breakdown.sssWispEE * displayFactor).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                  <span className="text-slate-600">Employer Share:</span>
                  <span className="font-mono font-semibold text-slate-800">
                    ₱{(breakdown.sssER * displayFactor).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px] text-slate-400 pl-2">
                  <span>(Includes EC ₱{breakdown.sssEcER})</span>
                  <span>Total: ₱{(breakdown.sssTotal * displayFactor).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* PhilHealth Contribution Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <HeartPulse className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase">PhilHealth Premium</h4>
                    <span className="text-[10px] text-slate-500">RA 11223 (5.0% Rate)</span>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-mono font-bold">
                  {breakdown.basicSalary >= 100000 ? 'Max Cap' : breakdown.basicSalary <= 10000 ? 'Floor Min' : '5% Direct'}
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Employee Share (2.5%):</span>
                  <span className="font-mono font-bold text-emerald-700">
                    ₱{(breakdown.philhealth * displayFactor).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Employer Share (2.5%):</span>
                  <span className="font-mono font-semibold text-slate-800">
                    ₱{(breakdown.philhealthER * displayFactor).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-100 flex justify-between text-[11px] text-slate-500">
                  <span>Total Monthly Premium:</span>
                  <span className="font-mono font-bold text-slate-900">
                    ₱{(breakdown.philhealthTotal * displayFactor).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400">
                  Basis: ₱{breakdown.philhealthMsc.toLocaleString()} (Min ₱10k, Max ₱100k)
                </div>
              </div>
            </div>

            {/* Pag-IBIG (HDMF) Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                    <Home className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase">Pag-IBIG / HDMF</h4>
                    <span className="text-[10px] text-slate-500">Circular No. 460</span>
                  </div>
                </div>
                <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded font-mono font-bold">
                  MFS ₱{breakdown.pagibigMfs.toLocaleString()}
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Employee Share (2%):</span>
                  <span className="font-mono font-bold text-amber-800">
                    ₱{(breakdown.pagibig * displayFactor).toFixed(2)}
                  </span>
                </div>
                {breakdown.pagibigMp2 > 0 && (
                  <div className="flex justify-between items-center text-slate-500 text-[11px]">
                    <span>+ MP2 Voluntary:</span>
                    <span className="font-mono text-amber-700 font-semibold">₱{(breakdown.pagibigMp2 * displayFactor).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Employer Share (2%):</span>
                  <span className="font-mono font-semibold text-slate-800">
                    ₱{(breakdown.pagibigER * displayFactor).toFixed(2)}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-100 flex justify-between text-[11px] text-slate-500">
                  <span>Mandatory Combined:</span>
                  <span className="font-mono font-bold text-slate-900">₱{(breakdown.pagibigTotal * displayFactor).toFixed(2)}</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  Capped at ₱200/mo (Increased from ₱100 in 2024)
                </div>
              </div>
            </div>

            {/* BIR Withholding Tax Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                    <Scale className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase">BIR Withholding Tax</h4>
                    <span className="text-[10px] text-slate-500">TRAIN Law (RA 10963)</span>
                  </div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                  breakdown.withholdingTax === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-50 text-purple-700'
                }`}>
                  {breakdown.withholdingTax === 0 ? 'Tax Exempt' : `${taxPercent}% Tax`}
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Monthly Tax Withheld:</span>
                  <span className="font-mono font-bold text-rose-600">
                    ₱{(breakdown.withholdingTax * displayFactor).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-500 text-[11px]">
                  <span>Taxable Base Income:</span>
                  <span className="font-mono">₱{(breakdown.taxableIncome * displayFactor).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-500 leading-relaxed">
                  <span className="font-semibold text-slate-700 block">Bracket:</span>
                  {breakdown.taxBracketDescription}
                </div>
              </div>
            </div>

            {/* Salary Loans Deductions Card */}
            {breakdown.totalLoanDeductions > 0 && (
              <div className="bg-white rounded-xl border border-rose-200 p-4 shadow-xs space-y-3 col-span-1 sm:col-span-2">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                      <Landmark className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 uppercase">Employee Salary Loans Amortization</h4>
                      <span className="text-[10px] text-slate-500">Post-Tax Payroll Deductions (SSS, Pag-IBIG, Company)</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIncludeLoans(!includeLoans)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border transition-colors ${
                        includeLoans ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}
                    >
                      {includeLoans ? 'Deductions Active' : 'Excluded from Simulation'}
                    </button>
                    <span className="text-[10px] bg-rose-50 text-rose-700 px-2 py-0.5 rounded font-mono font-bold">
                      -₱{(breakdown.totalLoanDeductions * displayFactor).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  {breakdown.sssLoanDeduction > 0 && (
                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">SSS Salary / Calamity</span>
                      <span className="font-mono font-bold text-slate-800">
                        ₱{(breakdown.sssLoanDeduction * displayFactor).toFixed(2)}
                      </span>
                    </div>
                  )}
                  {breakdown.pagibigLoanDeduction > 0 && (
                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Pag-IBIG MPL</span>
                      <span className="font-mono font-bold text-slate-800">
                        ₱{(breakdown.pagibigLoanDeduction * displayFactor).toFixed(2)}
                      </span>
                    </div>
                  )}
                  {breakdown.companyLoanDeduction > 0 && (
                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Company Emergency</span>
                      <span className="font-mono font-bold text-slate-800">
                        ₱{(breakdown.companyLoanDeduction * displayFactor).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>


          {/* Payroll Composition Bar Chart */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Gross Salary Allocation</h4>
              </div>
              <span className="text-xs text-slate-500">
                Gross: <strong className="text-slate-900 font-mono">₱{breakdown.grossPay.toLocaleString()}</strong>
              </span>
            </div>

            {/* Proportion Bar */}
            <div className="h-5 w-full bg-slate-100 rounded-lg overflow-hidden flex shadow-inner">
              <div
                style={{ width: `${Math.max(Number(netPercent), 5)}%` }}
                className="bg-emerald-500 h-full transition-all duration-300"
                title={`Net Take-Home Pay: ${netPercent}%`}
              />
              <div
                style={{ width: `${(breakdown.sss / breakdown.grossPay) * 100}%` }}
                className="bg-blue-600 h-full transition-all duration-300"
                title={`SSS: ₱${breakdown.sss}`}
              />
              <div
                style={{ width: `${(breakdown.philhealth / breakdown.grossPay) * 100}%` }}
                className="bg-teal-600 h-full transition-all duration-300"
                title={`PhilHealth: ₱${breakdown.philhealth}`}
              />
              <div
                style={{ width: `${(breakdown.pagibig / breakdown.grossPay) * 100}%` }}
                className="bg-amber-500 h-full transition-all duration-300"
                title={`Pag-IBIG: ₱${breakdown.pagibig}`}
              />
              <div
                style={{ width: `${Math.max(Number(taxPercent), 0)}%` }}
                className="bg-rose-500 h-full transition-all duration-300"
                title={`BIR Tax: ${taxPercent}%`}
              />
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] pt-1">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm" />
                Net Pay: <strong>{netPercent}%</strong>
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 bg-blue-600 rounded-sm" />
                SSS: <strong>₱{breakdown.sss.toFixed(0)}</strong>
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 bg-teal-600 rounded-sm" />
                PhilHealth: <strong>₱{breakdown.philhealth.toFixed(0)}</strong>
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 bg-amber-500 rounded-sm" />
                Pag-IBIG: <strong>₱{breakdown.pagibig.toFixed(0)}</strong>
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 bg-rose-500 rounded-sm" />
                Tax: <strong>₱{breakdown.withholdingTax.toFixed(0)}</strong>
              </span>
            </div>
          </div>

          {/* 13th Month Pay & Tax Exemption Box */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-amber-700" />
                Projected 13th Month Pay (Mandatory Presidential Decree No. 851)
              </span>
              <p className="text-xs text-amber-800">
                {breakdown.isThirteenthMonthExempt
                  ? `Fully 100% Tax-Exempt (Below the statutory ₱90,000 threshold under TRAIN Law).`
                  : `Exceeds ₱90,000 statutory cap. ₱90,000 is tax-exempt, excess ₱${breakdown.thirteenthMonthTaxableExcess.toLocaleString()} is subject to withholding tax.`}
              </p>
            </div>
            <div className="text-right">
              <span className="text-sm font-black font-mono text-amber-950">
                ₱{breakdown.thirteenthMonthPay.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <StatutoryTablesModal
        isOpen={showTablesModal}
        onClose={() => setShowTablesModal(false)}
        activeSalary={basicSalary}
      />

      <PayslipModal
        isOpen={showPayslipModal}
        onClose={() => setShowPayslipModal(false)}
        breakdown={breakdown}
        employeeName={selectedEmployee ? `${selectedEmployee.firstName} ${selectedEmployee.lastName}` : 'Candidate / Simulation'}
        role={selectedEmployee ? selectedEmployee.role : 'Specialist'}
        department={selectedEmployee ? selectedEmployee.department : 'Operations'}
        tin={selectedEmployee ? selectedEmployee.tin : '123-456-789-000'}
        sssNumber={selectedEmployee ? selectedEmployee.sssNumber : '04-1234567-8'}
        philhealthNumber={selectedEmployee ? selectedEmployee.philhealthNumber : '12-345678901-2'}
        pagibigNumber={selectedEmployee ? selectedEmployee.pagibigNumber : '1234-5678-9012'}
      />
    </div>
  );
}
