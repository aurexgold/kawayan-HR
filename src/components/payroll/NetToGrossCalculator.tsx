import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Calculator, ArrowRight, ArrowLeftRight, DollarSign, ShieldCheck, 
  Download, Printer, Sparkles, User, Building2, CheckCircle2, 
  HelpCircle, ChevronRight, FileCheck, Scale, AlertCircle, Percent,
  Coins, ArrowDownRight, ArrowUpRight, Check, Sliders
} from 'lucide-react';
import { Employee } from '../../types';
import { useEmployees } from '../../lib/employee-store';
import { 
  calculateNetToGross, 
  PHILIPPINE_NET_PRESETS, 
  generateNetToGrossProposalCsv, 
  NetToGrossResult, 
  NetPayPreset 
} from '../../lib/net-to-gross';
import { signatureRepository } from '../../lib/signature-repository';

interface NetToGrossCalculatorProps {
  initialTargetNet?: number;
}

export function NetToGrossCalculator({ initialTargetNet = 60000 }: NetToGrossCalculatorProps) {
  const navigate = useNavigate();
  const { employees } = useEmployees();

  // Input State
  const [targetNet, setTargetNet] = useState<number>(initialTargetNet);
  const [taxableAllowances, setTaxableAllowances] = useState<number>(0);
  const [nonTaxableAllowances, setNonTaxableAllowances] = useState<number>(2500); // Typical de minimis
  const [postTaxDeductions, setPostTaxDeductions] = useState<number>(0);
  const [includeThirteenthMonth, setIncludeThirteenthMonth] = useState<boolean>(true);

  // Selected Employee from Registry
  const [selectedEmpId, setSelectedEmpId] = useState<string>('');
  const [candidateName, setCandidateName] = useState<string>('');

  // Modal / Memo state
  const [showOfferMemoModal, setShowOfferMemoModal] = useState<boolean>(false);

  // Signatory
  const signatory = useMemo(() => {
    return signatureRepository.resolveSignatureForDocument('payroll').signatory;
  }, []);

  // Compute Net-to-Gross Result
  const result: NetToGrossResult = useMemo(() => {
    return calculateNetToGross({
      targetNetPay: targetNet,
      taxableAllowances,
      nonTaxableAllowances,
      postTaxDeductions,
      includeThirteenthMonthInCtc: includeThirteenthMonth,
    });
  }, [targetNet, taxableAllowances, nonTaxableAllowances, postTaxDeductions, includeThirteenthMonth]);

  // Handle preset selection
  const handleApplyPreset = (preset: NetPayPreset) => {
    setTargetNet(preset.targetNet);
    if (!candidateName) {
      setCandidateName(`${preset.typicalRole} Candidate`);
    }
  };

  // Handle employee registry selection
  const handleSelectEmployee = (empId: string) => {
    setSelectedEmpId(empId);
    if (!empId) return;
    const emp = employees.find(e => e.id === empId);
    if (emp) {
      setCandidateName(`${emp.firstName} ${emp.lastName}`);
      // Approximate their current net to start with
      const approxNet = Math.round(emp.basicSalary * 0.82);
      setTargetNet(approxNet);
      if (emp.allowance) {
        setNonTaxableAllowances(emp.allowance);
      }
    }
  };

  // Export CSV handler
  const handleExportCsv = () => {
    const csv = generateNetToGrossProposalCsv(result, candidateName || 'Candidate');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Philippine_Net_to_Gross_Proposal_${Math.round(targetNet)}_Net.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Navigate to contract with calculated gross
  const handleTransferToContract = () => {
    navigate('/contracts');
  };

  return (
    <div className="space-y-6">
      
      {/* Intro Context Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-blue-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-radial from-indigo-500/20 to-transparent pointer-events-none"></div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="max-w-3xl space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-indigo-500/30 text-indigo-300 border border-indigo-400/30">
                Reverse Payroll Engine
              </span>
              <span className="text-xs text-indigo-200">
                TRAIN Law (RA 10963) · SSS Circular 2024 · PhilHealth 5% · Pag-IBIG Cir. 460
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Philippine Net-to-Gross Reverse Calculator
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Calculate the exact Gross Basic Salary to offer an employee so that, after deducting mandatory SSS, PhilHealth, Pag-IBIG, and BIR withholding tax, their take-home equals your exact guaranteed Net target.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowOfferMemoModal(true)}
              className="flex items-center text-xs font-bold px-3.5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5 mr-1.5" />
              Compensation Sheet
            </button>
            <button
              onClick={handleExportCsv}
              className="flex items-center text-xs font-semibold px-3.5 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Export Proposal (CSV)
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Inputs (Left) and Results (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: PARAMETERS & TARGET NET (5 COLS) */}
        <div className="lg:col-span-5 space-y-5">
          
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-5">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                1. Pull Candidate / Employee from Registry (Optional)
              </span>
              <select
                value={selectedEmpId}
                onChange={(e) => handleSelectEmployee(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">-- Manual Calculation / Custom Offer --</option>
                {employees.map(e => (
                  <option key={e.id} value={e.id}>
                    {e.firstName} {e.lastName} — {e.role} (Current: ₱{e.basicSalary.toLocaleString()}/mo)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Candidate / Recipient Name (For memo & proposal)
              </span>
              <input
                type="text"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                placeholder="e.g. Juan Santos (Senior Architect)"
                className="w-full px-3 py-2 text-xs font-medium border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Target Net Pay Input Card */}
            <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-indigo-600" />
                  Target Net Take-Home Pay (Monthly)
                </label>
                <span className="text-[10px] font-bold font-mono text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
                  GUARANTEED
                </span>
              </div>

              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">₱</span>
                <input
                  type="number"
                  step="1000"
                  min="0"
                  value={targetNet}
                  onChange={(e) => setTargetNet(Number(e.target.value))}
                  className="w-full pl-8 pr-4 py-2.5 text-xl font-black text-slate-900 font-mono border border-indigo-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
                />
              </div>

              {/* Slider */}
              <div className="space-y-1 pt-1">
                <input
                  type="range"
                  min="15000"
                  max="250000"
                  step="1000"
                  value={targetNet}
                  onChange={(e) => setTargetNet(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>₱15,000</span>
                  <span>₱100,000</span>
                  <span>₱250,000</span>
                </div>
              </div>

              {/* Quick Stepper Buttons */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[1000, 5000, 10000].map(step => (
                  <button
                    key={step}
                    type="button"
                    onClick={() => setTargetNet(prev => prev + step)}
                    className="px-2 py-1 bg-white border border-indigo-200 hover:bg-indigo-100 text-[11px] font-mono font-semibold text-indigo-800 rounded transition-colors shadow-2xs"
                  >
                    +₱{step.toLocaleString()}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setTargetNet(prev => Math.max(0, prev - 5000))}
                  className="px-2 py-1 bg-white border border-indigo-200 hover:bg-indigo-100 text-[11px] font-mono font-semibold text-slate-600 rounded transition-colors shadow-2xs"
                >
                  -₱5,000
                </button>
              </div>
            </div>

            {/* Standard Philippine Presets */}
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Benchmark Philippine Market Presets:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {PHILIPPINE_NET_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className={`p-2.5 text-left border rounded-xl transition-all shadow-2xs ${
                      targetNet === preset.targetNet
                        ? 'border-indigo-600 bg-indigo-50/80 ring-1 ring-indigo-500'
                        : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 font-mono">{preset.label}</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                        {preset.tier}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 truncate mt-0.5">{preset.typicalRole}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Secondary Allowances & Adjustments */}
            <div className="border-t border-slate-200 pt-4 space-y-3 text-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Additional Allowances & Deductions
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Non-Taxable Allowance (De Minimis)
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">₱</span>
                    <input
                      type="number"
                      step="500"
                      value={nonTaxableAllowances}
                      onChange={(e) => setNonTaxableAllowances(Number(e.target.value))}
                      className="w-full pl-6 pr-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Exempt from tax & statutory</span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Taxable Monthly Allowance
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">₱</span>
                    <input
                      type="number"
                      step="500"
                      value={taxableAllowances}
                      onChange={(e) => setTaxableAllowances(Number(e.target.value))}
                      className="w-full pl-6 pr-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Included in BIR tax base</span>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={includeThirteenthMonth}
                    onChange={(e) => setIncludeThirteenthMonth(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                  />
                  <span className="text-xs font-medium text-slate-700">
                    Include Mandatory 13th-Month Pay Accrual (PD 851) in Employer Cost
                  </span>
                </label>
              </div>
            </div>

          </div>

        </div>

        {/* RIGHT COLUMN: REVERSE CALCULATED RESULTS & BREAKDOWN (7 COLS) */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Top Big KPI Results Deck */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Required Gross Salary Card */}
            <div className="p-5 bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl text-white shadow-md border border-indigo-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider">
                  Required Basic Gross Salary
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Exact Solution
                </span>
              </div>
              <div className="text-3xl font-black font-mono tracking-tight text-white">
                ₱{result.requiredGrossSalary.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="flex items-center justify-between text-xs text-indigo-200 border-t border-indigo-800/80 pt-2 font-mono">
                <span>Semi-Monthly: ₱{result.semiMonthlyGrossSalary.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                <span>Annual: ₱{result.annualGrossSalary.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Total Employer Cost (CTC) Card */}
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Total Monthly Employer Cost (CTC)
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">
                  Full Burden
                </span>
              </div>
              <div className="text-3xl font-black font-mono tracking-tight text-slate-900">
                ₱{result.totalMonthlyEmployerCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-2 font-mono">
                <span>Includes ER SSS, PH, HDMF</span>
                <span>Annual CTC: ₱{result.totalAnnualEmployerCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

          </div>

          {/* Reverse Waterfall Gross-Up Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                  <ArrowLeftRight className="w-4 h-4 text-indigo-600" />
                  Reverse Gross-Up Waterfall
                </h3>
                <p className="text-xs text-slate-500">
                  Shows the exact tax and statutory additions added onto target Net Pay to arrive at Gross Basic.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Variance: ₱{result.varianceDelta.toFixed(2)}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              
              {/* Target Net */}
              <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 flex items-center justify-between">
                <div>
                  <span className="font-bold text-indigo-950 block">Target Net Take-Home Pay</span>
                  <span className="text-[11px] text-indigo-700">Contractual take-home guarantee</span>
                </div>
                <div className="text-right font-mono font-bold text-sm text-indigo-950">
                  ₱{result.targetNetPay.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>

              {/* + BIR Withholding Tax */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <span className="text-rose-500 font-black">+</span>
                    <span>BIR Withholding Tax Gross-Up</span>
                  </div>
                  <span className="text-[11px] text-slate-500">{result.taxBracketDescription}</span>
                </div>
                <div className="text-right font-mono font-bold text-slate-900">
                  +₱{result.withholdingTax.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>

              {/* + SSS Mandatory Share */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <span className="text-blue-500 font-black">+</span>
                    <span>SSS Employee Share (Regular + WISP)</span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    MSC ₱{result.sssMsc.toLocaleString()} • Regular: ₱{result.sssRegularEE.toFixed(2)} {result.sssWispEE > 0 && `• WISP: ₱${result.sssWispEE.toFixed(2)}`}
                  </span>
                </div>
                <div className="text-right font-mono font-bold text-slate-900">
                  +₱{result.sssEE.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>

              {/* + PhilHealth Share */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <span className="text-emerald-500 font-black">+</span>
                    <span>PhilHealth 5.0% Premium (EE 2.5%)</span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    MSC ₱{result.philhealthMsc.toLocaleString()} • 50/50 statutory split
                  </span>
                </div>
                <div className="text-right font-mono font-bold text-slate-900">
                  +₱{result.philhealthEE.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>

              {/* + Pag-IBIG Share */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <span className="text-amber-500 font-black">+</span>
                    <span>Pag-IBIG Contribution (Circular 460)</span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Max Fund Salary ₱10,000 cap • ₱200 mandatory EE
                  </span>
                </div>
                <div className="text-right font-mono font-bold text-slate-900">
                  +₱{result.pagibigEE.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>

              {/* - Non-Taxable Allowances offset */}
              {result.nonTaxableAllowances > 0 && (
                <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200/80 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-emerald-950">
                      <span className="text-emerald-600 font-black">-</span>
                      <span>De Minimis Non-Taxable Allowance Subsidy</span>
                    </div>
                    <span className="text-[11px] text-emerald-700">Subsidizes take-home without triggering income tax</span>
                  </div>
                  <div className="text-right font-mono font-bold text-emerald-800">
                    -₱{result.nonTaxableAllowances.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                </div>
              )}

              {/* = Required Gross Basic */}
              <div className="p-3.5 bg-slate-900 text-white rounded-xl flex items-center justify-between mt-2">
                <div>
                  <span className="font-bold text-sm block">Required Basic Gross Monthly Salary</span>
                  <span className="text-[11px] text-slate-400">Exact contractual salary to insert in contract</span>
                </div>
                <div className="text-right font-mono font-black text-lg text-emerald-400">
                  ₱{result.requiredGrossSalary.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>

            </div>
          </div>

          {/* Forward Audit Proof Matrix */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Forward Payroll Audit Verification
              </h3>
              <span className="text-[11px] text-slate-500 font-mono">
                Centavo Proof
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Gross Base</span>
                <span className="text-sm font-bold font-mono text-slate-900 mt-0.5 block">
                  ₱{result.requiredGrossSalary.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-slate-500">Contractual</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Mandatory EE</span>
                <span className="text-sm font-bold font-mono text-rose-600 mt-0.5 block">
                  -₱{result.totalMandatoryEE.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-slate-500">SSS+PH+HDMF</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">BIR Tax</span>
                <span className="text-sm font-bold font-mono text-rose-600 mt-0.5 block">
                  -₱{result.withholdingTax.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-slate-500">TRAIN Law</span>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Resulting Net</span>
                <span className="text-sm font-bold font-mono text-emerald-800 mt-0.5 block">
                  ₱{result.actualNetPay.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-emerald-600 font-bold">100% Match</span>
              </div>
            </div>

            {/* Semi-Monthly and Employer Cost Summary */}
            <div className="border-t border-slate-100 pt-3 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="text-slate-600">
                <span className="font-bold text-slate-900">Semi-Monthly Payroll: </span>
                <span className="font-mono">₱{result.semiMonthlyNetPay.toLocaleString(undefined, { minimumFractionDigits: 2 })} net</span>
                <span className="text-slate-400"> (from ₱{result.semiMonthlyGrossSalary.toLocaleString(undefined, { minimumFractionDigits: 2 })} gross)</span>
              </div>

              <button
                type="button"
                onClick={handleTransferToContract}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                Use in Contract Generator &rarr;
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* PRINTABLE COMPENSATION OFFER MEMO MODAL */}
      {showOfferMemoModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh] border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
              <div className="flex items-center gap-2.5">
                <Printer className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-base text-white">
                  Philippine Net-to-Gross Compensation Memorandum
                </h3>
              </div>
              <button
                onClick={() => setShowOfferMemoModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-5 text-xs text-slate-800">
              
              {/* Letterhead */}
              <div className="text-center border-b border-slate-200 pb-4 space-y-1">
                <div className="font-black text-sm uppercase tracking-wider text-slate-900">
                  KAWAYAN HUMAN RESOURCES PORTAL (PHILIPPINES)
                </div>
                <div className="text-[11px] text-slate-500">
                  Official Compensation & Benefits Committee Memo • Total Rewards Advisory
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  Date: {new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              </div>

              {/* Offer Summary Box */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Candidate / Personnel:</span>
                  <span className="font-bold text-slate-900">{candidateName || 'Candidate / Offer Recipient'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Guaranteed Net Take-Home:</span>
                  <span className="font-black text-indigo-700 font-mono text-sm">
                    ₱{result.targetNetPay.toLocaleString(undefined, { minimumFractionDigits: 2 })} / month
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2">
                  <span className="text-slate-500 font-semibold">Required Gross Contract Salary:</span>
                  <span className="font-black text-slate-900 font-mono text-sm">
                    ₱{result.requiredGrossSalary.toLocaleString(undefined, { minimumFractionDigits: 2 })} / month
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Total Employer Budget (CTC):</span>
                  <span className="font-bold text-slate-900 font-mono">
                    ₱{result.totalMonthlyEmployerCost.toLocaleString(undefined, { minimumFractionDigits: 2 })} / month
                  </span>
                </div>
              </div>

              {/* Itemized Table */}
              <table className="w-full text-left border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-100 text-[10px] uppercase font-bold text-slate-700">
                  <tr>
                    <th className="p-2.5">Component</th>
                    <th className="p-2.5 text-right">Monthly (PHP)</th>
                    <th className="p-2.5 text-right">Annual (PHP)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  <tr>
                    <td className="p-2.5 font-sans font-semibold">Basic Gross Salary</td>
                    <td className="p-2.5 text-right font-bold text-slate-900">₱{result.requiredGrossSalary.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="p-2.5 text-right">₱{result.annualGrossSalary.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-sans text-slate-600">(-) SSS Contribution (EE)</td>
                    <td className="p-2.5 text-right text-rose-600">-₱{result.sssEE.toFixed(2)}</td>
                    <td className="p-2.5 text-right text-rose-600">-₱{(result.sssEE * 12).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-sans text-slate-600">(-) PhilHealth Premium (EE)</td>
                    <td className="p-2.5 text-right text-rose-600">-₱{result.philhealthEE.toFixed(2)}</td>
                    <td className="p-2.5 text-right text-rose-600">-₱{(result.philhealthEE * 12).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-sans text-slate-600">(-) Pag-IBIG Fund (EE)</td>
                    <td className="p-2.5 text-right text-rose-600">-₱{result.pagibigEE.toFixed(2)}</td>
                    <td className="p-2.5 text-right text-rose-600">-₱{(result.pagibigEE * 12).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-sans text-slate-600">(-) BIR Withholding Tax</td>
                    <td className="p-2.5 text-right text-rose-600 font-bold">-₱{result.withholdingTax.toFixed(2)}</td>
                    <td className="p-2.5 text-right text-rose-600">-₱{(result.withholdingTax * 12).toFixed(2)}</td>
                  </tr>
                  <tr className="bg-indigo-50/60 font-bold font-sans">
                    <td className="p-2.5 text-indigo-950">(=) Net Take-Home Pay</td>
                    <td className="p-2.5 text-right text-indigo-950 font-mono text-xs">₱{result.actualNetPay.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="p-2.5 text-right text-indigo-950 font-mono text-xs">₱{result.annualNetTakeHome.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  </tr>
                </tbody>
              </table>

              {/* Signatory Attestation */}
              <div className="pt-4 border-t border-slate-200 flex justify-end">
                <div className="text-center w-64 space-y-1">
                  <div className="h-10 flex items-end justify-center">
                    {signatory?.signatureDataUrl ? (
                      <img src={signatory.signatureDataUrl} alt="Signature" className="max-h-10 object-contain mx-auto" />
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">Signed Digitally</span>
                    )}
                  </div>
                  <div className="border-t border-slate-800 pt-1 font-sans">
                    <span className="font-bold text-slate-900 block text-xs uppercase">{signatory?.fullName || 'Eduardo Mendoza'}</span>
                    <span className="text-slate-500 text-[10px] block">{signatory?.title || 'Head of Total Rewards & Payroll Operations'}</span>
                  </div>
                </div>
              </div>

            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
              <button
                onClick={() => setShowOfferMemoModal(false)}
                className="px-3.5 py-1.5 border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Memorandum
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

function X(props: any) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
