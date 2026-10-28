import { useState, useId, FormEvent } from 'react';

import { Employee, EmployeeLoan, LoanType, DeductionFrequency } from '../../types';
import { generateAmortizationSchedule, getLoanTypeInfo } from '../../lib/loans';
import { 
  X, Plus, Calculator, Calendar, ShieldCheck, Home, 
  Building2, CheckCircle2, AlertCircle, Info, Sparkles 
} from 'lucide-react';

interface NewLoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  onAddLoan: (newLoan: EmployeeLoan) => void;
  initialEmployeeId?: string;
}

export function NewLoanModal({
  isOpen,
  onClose,
  employees,
  onAddLoan,
  initialEmployeeId,
}: NewLoanModalProps) {
  const defaultEmpId = initialEmployeeId || (employees[0]?.id ?? '');
  const [employeeId, setEmployeeId] = useState(defaultEmpId);
  const [loanType, setLoanType] = useState<LoanType>('SSS_SALARY');
  const [referenceNo, setReferenceNo] = useState(`SSS-SLN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
  
  const selectedEmp = employees.find(e => e.id === employeeId);
  const typeInfo = getLoanTypeInfo(loanType);

  const [principalAmount, setPrincipalAmount] = useState<number>(30000);
  const [interestRateAnnual, setInterestRateAnnual] = useState<number>(typeInfo.defaultRate);
  const [termMonths, setTermMonths] = useState<number>(typeInfo.defaultTerm);
  const [deductionFrequency, setDeductionFrequency] = useState<DeductionFrequency>('Semi-Monthly');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  // Handle loan type change and auto-populate standard Philippine agency defaults
  const handleLoanTypeChange = (newType: LoanType) => {
    setLoanType(newType);
    const info = getLoanTypeInfo(newType);
    setInterestRateAnnual(info.defaultRate);
    setTermMonths(info.defaultTerm);

    const prefix = info.agency === 'SSS' ? 'SSS-SLN' : info.agency === 'Pag-IBIG' ? 'HDMF-MPL' : 'KWY-CO';
    setReferenceNo(`${prefix}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
  };

  // Quick preset principal calculation
  const setQuickPrincipal = (amount: number) => {
    setPrincipalAmount(amount);
  };

  const setSalaryMultiple = (months: number) => {
    if (selectedEmp) {
      setPrincipalAmount(selectedEmp.basicSalary * months);
    }
  };

  // Compute live amortization estimate
  const calculation = generateAmortizationSchedule({
    principal: principalAmount || 0,
    annualInterestRate: interestRateAnnual || 0,
    termMonths: termMonths || 1,
    startDate: startDate || new Date().toISOString().split('T')[0],
    deductionFrequency,
    paidInstallmentsCount: 0,
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();


    if (!employeeId || principalAmount <= 0 || termMonths <= 0) return;

    const newLoan: EmployeeLoan = {
      id: `loan-${Date.now()}`,
      employeeId,
      loanType,
      loanName: typeInfo.label,
      referenceNo: referenceNo.trim() || `REF-${Date.now()}`,
      principalAmount: +principalAmount.toFixed(2),
      interestRateAnnual: +interestRateAnnual.toFixed(2),
      termMonths,
      deductionFrequency,
      monthlyAmortization: calculation.monthlyAmortization,
      perCutoffAmortization: calculation.perCutoffAmortization,
      startDate,
      endDate: calculation.endDate,
      totalLoanAmount: calculation.totalLoanAmount,
      totalPaid: 0,
      remainingBalance: calculation.totalLoanAmount,
      status: 'Active',
      notes: notes.trim() || undefined,
      schedule: calculation.schedule,
    };

    onAddLoan(newLoan);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full flex flex-col max-h-[92vh] overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-white tracking-tight">Enroll Employee Salary Loan</h2>
              <p className="text-xs text-slate-400">Set up SSS, Pag-IBIG, or Company loan with automatic payroll deduction</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Employee Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              Borrower / Employee
            </label>
            <select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-900"
              required
            >
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.lastName} — {emp.role} ({emp.department}) • Basic: ₱{emp.basicSalary.toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          {/* Loan Type Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              Loan Type & Government Program
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { type: 'SSS_SALARY' as const, name: 'SSS Salary Loan', desc: '10% p.a. • Up to 2x basic pay • 24 mo', icon: ShieldCheck, color: 'text-blue-600' },
                { type: 'PAGIBIG_MPL' as const, name: 'Pag-IBIG MPL', desc: '10.5% p.a. • Multi-Purpose Loan • 24/36 mo', icon: Home, color: 'text-amber-600' },
                { type: 'SSS_CALAMITY' as const, name: 'SSS Calamity Relief', desc: '10% p.a. • Calamity assistance package', icon: ShieldCheck, color: 'text-indigo-600' },
                { type: 'PAGIBIG_CALAMITY' as const, name: 'Pag-IBIG Calamity Loan', desc: '5.95% p.a. • Low-rate emergency relief', icon: Home, color: 'text-yellow-600' },
                { type: 'COMPANY_EMERGENCY' as const, name: 'Company Emergency Advance', desc: '0% rate • Cooperative staff assistance', icon: Building2, color: 'text-emerald-600' },
                { type: 'COMPANY_EDUCATIONAL' as const, name: 'Educational / Tuition Loan', desc: '0% rate • Up to 12 monthly cutoffs', icon: Building2, color: 'text-purple-600' },
              ].map(opt => {
                const Icon = opt.icon;
                const isSelected = loanType === opt.type;
                return (
                  <button
                    key={opt.type}
                    type="button"
                    onClick={() => handleLoanTypeChange(opt.type)}
                    className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 mt-0.5 ${opt.color}`} />
                    <div>
                      <span className="font-bold text-xs text-slate-900 block">{opt.name}</span>
                      <span className="text-[11px] text-slate-500">{opt.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reference Number & Start Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                Reference / Promissory Note No.
              </label>
              <input
                type="text"
                value={referenceNo}
                onChange={(e) => setReferenceNo(e.target.value)}
                placeholder="e.g. SSS-SLN-2026-8812"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                First Deduction Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Principal Amount & Quick Chips */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-700">
                Principal Loan Amount (₱)
              </label>
              {selectedEmp && (
                <div className="flex items-center gap-1.5 text-[11px]">
                  <span className="text-slate-500">Quick set:</span>
                  <button
                    type="button"
                    onClick={() => setSalaryMultiple(1)}
                    className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors"
                  >
                    1-Mo Basic (₱{selectedEmp.basicSalary.toLocaleString()})
                  </button>
                  <button
                    type="button"
                    onClick={() => setSalaryMultiple(2)}
                    className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors"
                  >
                    2-Mo Basic (₱{(selectedEmp.basicSalary * 2).toLocaleString()})
                  </button>
                </div>
              )}
            </div>

            <div className="relative">
              <span className="absolute left-3 top-2.5 font-bold text-slate-400 font-mono">₱</span>
              <input
                type="number"
                min="1000"
                step="500"
                value={principalAmount}
                onChange={(e) => setPrincipalAmount(Number(e.target.value))}
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {[15000, 20000, 30000, 40000, 50000, 60000].map(amt => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setQuickPrincipal(amt)}
                  className={`text-[11px] px-2 py-0.5 rounded border transition-colors ${
                    principalAmount === amt 
                      ? 'bg-blue-600 text-white border-blue-600 font-bold' 
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  ₱{amt.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Interest Rate, Term & Frequency Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                Annual Interest Rate (% p.a.)
              </label>
              <input
                type="number"
                min="0"
                max="36"
                step="0.05"
                value={interestRateAnnual}
                onChange={(e) => setInterestRateAnnual(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <span className="text-[10px] text-slate-400 block">SSS: 10% • HDMF: 10.5%</span>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                Repayment Term (Months)
              </label>
              <select
                value={termMonths}
                onChange={(e) => setTermMonths(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={6}>6 Months (Half year)</option>
                <option value={10}>10 Months</option>
                <option value={12}>12 Months (1 Year)</option>
                <option value={18}>18 Months (1.5 Years)</option>
                <option value={24}>24 Months (Standard 2 Yrs)</option>
                <option value={36}>36 Months (3 Years)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                Deduction Cutoff Frequency
              </label>
              <select
                value={deductionFrequency}
                onChange={(e) => setDeductionFrequency(e.target.value as DeductionFrequency)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Semi-Monthly">Semi-Monthly (15th & 30th)</option>
                <option value="Monthly">Once a Month (End of Month)</option>
              </select>
            </div>
          </div>

          {/* Live Amortization Calculator Output Card */}
          <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5 uppercase tracking-wider">
                <Calculator className="w-4 h-4 text-blue-600" />
                Computed Payroll Amortization Breakdown
              </span>
              <span className="text-[11px] font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded font-mono">
                Matures: {calculation.endDate}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Total Interest</span>
                <span className="font-mono font-bold text-slate-800 text-sm">
                  ₱{calculation.totalInterest.toLocaleString(undefined, {minimumFractionDigits: 2})}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Total Loan Payable</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  ₱{calculation.totalLoanAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Monthly Deduction</span>
                <span className="font-mono font-black text-rose-700 text-base">
                  ₱{calculation.monthlyAmortization.toLocaleString(undefined, {minimumFractionDigits: 2})}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Per Cutoff (15th / 30th)</span>
                <span className="font-mono font-bold text-blue-700 text-sm">
                  ₱{calculation.perCutoffAmortization.toLocaleString(undefined, {minimumFractionDigits: 2})}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-blue-800 flex items-center gap-1.5 pt-1 border-t border-blue-200">
              <Info className="w-3.5 h-3.5 shrink-0 text-blue-600" />
              <span>
                This monthly amortization will automatically be deducted from the employee&apos;s payroll register and itemized on their official payslip.
              </span>
            </p>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">
              Internal Loan Notes & Approval Reference (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. SSS Disclosure Statement ref #88129; verified active contribution status."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              Enroll & Activate Deductions
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
