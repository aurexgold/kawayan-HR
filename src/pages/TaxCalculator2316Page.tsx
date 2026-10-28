import React, { useState, useMemo } from 'react';
import { mockEmployees } from '../data/mockData';
import { 
  calculateForm2316, 
  generate2316Csv, 
  Form2316Input, 
  EXEMPT_13TH_MONTH_CAP,
  ANNUAL_TAX_BRACKETS 
} from '../lib/bir-2316';
import { calculateContributions } from '../lib/ph-payroll';
import { Bir2316Document } from '../components/tax/Bir2316Document';
import { TaxBracketLadder } from '../components/tax/TaxBracketLadder';
import { TaxTablesDrawer } from '../components/tax/TaxTablesDrawer';
import { 
  Calculator, 
  FileText, 
  HelpCircle, 
  Download, 
  Copy, 
  Printer, 
  Sparkles, 
  ArrowRight, 
  RefreshCw, 
  ShieldCheck, 
  Users, 
  Building2, 
  Check, 
  TrendingUp, 
  AlertTriangle,
  Scale,
  Receipt,
  FileSpreadsheet
} from 'lucide-react';

export function TaxCalculator2316Page() {
  // Preset or custom employee selection
  const [selectedEmpId, setSelectedEmpId] = useState<string>('emp-001');

  // Calculation parameters state
  const [formData, setFormData] = useState<Form2316Input>({
    employeeName: 'Juan Dela Cruz',
    tin: '123-456-789-000',
    registeredAddress: '124 Legaspi St, Legaspi Village, Makati City',
    isMinimumWageEarner: false,
    periodMonths: 12,
    monthlyBasicSalary: 65000,
    annualDeMinimis: 24000, // ₱2,000/mo rice subsidy
    statutoryContributionsAnnual: 34800, // SSS + PhilHealth + Pag-IBIG
    thirteenthMonthAndOtherBenefits: 65000, // 1 month basic 13th month
    taxableAllowancesAnnual: 36000, // ₱3,000/mo allowance
    taxableOvertimeAnnual: 15000,
    taxableNightDiffAnnual: 0,
    commissionsAndIncentivesAnnual: 10000,
    profitSharingAnnual: 0,
    otherTaxableCompensation: 0,
    previousEmployerTaxableCompensation: 0,
    previousEmployerTaxWithheld: 0,
    presentEmployerTaxWithheldYtd: 82500, // 11 months withholding estimate
    taxYear: 2025,
    employerName: 'Kawayan Cooperative HR Inc.',
    employerTin: '009-876-543-000',
    employerAddress: 'Unit 402 Kawayan Center, Ayala Ave, Makati City',
  });

  // UI state
  const [activeViewTab, setActiveViewTab] = useState<'replica' | 'ladder' | 'monthly'>('replica');
  const [showRefDrawer, setShowRefDrawer] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Auto-fill from existing mock employee
  const handleSelectEmployee = (empId: string) => {
    setSelectedEmpId(empId);
    if (empId === 'custom') {
      return;
    }

    const emp = mockEmployees.find((e) => e.id === empId);
    if (!emp) return;

    // Calculate monthly statutory EE contribution to multiply by months
    const monthlyStats = calculateContributions(emp.basicSalary);
    const months = 12;
    const annualStats = +(monthlyStats.mandatoryDeductionsEE * months).toFixed(2);
    // Estimated 11 months withholding
    const estimated11MonthTax = +(monthlyStats.withholdingTax * 11).toFixed(2);

    setFormData((prev) => ({
      ...prev,
      employeeName: `${emp.firstName} ${emp.lastName}`,
      tin: emp.tin || '000-000-000-000',
      registeredAddress: `${emp.department} Dept, Kawayan Hub, Metro Manila`,
      isMinimumWageEarner: emp.basicSalary <= 15860,
      monthlyBasicSalary: emp.basicSalary,
      periodMonths: 12,
      thirteenthMonthAndOtherBenefits: emp.basicSalary, // 1 month
      statutoryContributionsAnnual: annualStats,
      presentEmployerTaxWithheldYtd: estimated11MonthTax,
    }));
  };

  // Quick salary archetype presets
  const applyPreset = (title: string, basicSalary: number, isMWE: boolean = false) => {
    setSelectedEmpId('custom');
    const monthlyStats = calculateContributions(basicSalary);
    const annualStats = +(monthlyStats.mandatoryDeductionsEE * 12).toFixed(2);
    const estimated11MonthTax = isMWE ? 0 : +(monthlyStats.withholdingTax * 11).toFixed(2);

    setFormData((prev) => ({
      ...prev,
      employeeName: `${title} Sample`,
      tin: '123-456-789-000',
      isMinimumWageEarner: isMWE,
      monthlyBasicSalary: basicSalary,
      periodMonths: 12,
      annualDeMinimis: 24000,
      thirteenthMonthAndOtherBenefits: basicSalary,
      statutoryContributionsAnnual: annualStats,
      presentEmployerTaxWithheldYtd: estimated11MonthTax,
      taxableAllowancesAnnual: 24000,
      taxableOvertimeAnnual: isMWE ? 0 : 10000,
      commissionsAndIncentivesAnnual: 0,
    }));
  };

  // Auto recompute statutory contributions based on basic salary
  const handleAutoComputeStatutory = () => {
    const monthlyStats = calculateContributions(formData.monthlyBasicSalary);
    const annualStats = +(monthlyStats.mandatoryDeductionsEE * formData.periodMonths).toFixed(2);
    setFormData((prev) => ({
      ...prev,
      statutoryContributionsAnnual: annualStats,
    }));
  };

  // Run full BIR 2316 calculation
  const calculationResult = useMemo(() => {
    return calculateForm2316(formData);
  }, [formData]);

  // Download CSV action
  const handleDownloadCsv = () => {
    const csvContent = generate2316Csv(calculationResult);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `BIR_Form_2316_${formData.employeeName.replace(/\s+/g, '_')}_${calculationResult.taxYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy summary to clipboard
  const handleCopySummary = () => {
    const text = `
--- BIR FORM 2316 WITHHOLDING TAX SUMMARY ---
Employee: ${calculationResult.input.employeeName} (TIN: ${calculationResult.input.tin})
Tax Year: ${calculationResult.taxYear} (${calculationResult.input.periodMonths} Months)
Monthly Basic Salary: ₱${calculationResult.input.monthlyBasicSalary.toLocaleString()}

[Part IV-A Summary]
19. Gross Compensation Income: ₱${calculationResult.item19_GrossCompensationPresent.toLocaleString('en-US', { minimumFractionDigits: 2 })}
20. Total Non-Taxable / Exempt: ₱${calculationResult.item20_TotalNonTaxable.toLocaleString('en-US', { minimumFractionDigits: 2 })}
21. Taxable Compensation Income: ₱${calculationResult.item23_TotalTaxableCompensation.toLocaleString('en-US', { minimumFractionDigits: 2 })}
24. Annual Tax Due (TRAIN Law): ₱${calculationResult.item24_TaxDue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
26. Total Taxes Withheld YTD: ₱${calculationResult.item26_TotalTaxWithheld.toLocaleString('en-US', { minimumFractionDigits: 2 })}
${
  calculationResult.item27_OverwithheldRefund > 0
    ? `27. Overwithheld Tax Refunded to Employee: ₱${calculationResult.item27_OverwithheldRefund.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
    : `28. Tax Withheld as Adjusted (Payable): ₱${calculationResult.item28_TaxPayableAdjusted.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
}

Tax Bracket: Tier ${calculationResult.appliedBracket.tier} (Marginal ${calculationResult.marginalRatePercent}%, Effective ${calculationResult.effectiveTaxRatePercent}%)
Monthly Equivalent Tax: ₱${calculationResult.monthlyEquivalentTax.toLocaleString('en-US', { minimumFractionDigits: 2 })}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const formatPHP = (val: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
    }).format(val || 0);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="p-2 bg-blue-600 text-white rounded-xl shadow-xs">
              <Calculator className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              BIR Form 2316 & Withholding Tax Calculator
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
              TRAIN Law (RA 10963)
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              2023–2025 Schedule
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1 max-w-3xl">
            Compute annual compensation tax reconciliation, per-cutoff withholding tax, 13th month ₱90,000 tax-exempt cap, and generate official BIR Form No. 2316 certificates.
          </p>
        </div>

        {/* Global Toolbar buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowRefDrawer(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-xs transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
            Tax Tables Reference
          </button>
          <button
            onClick={handleCopySummary}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-xs transition-colors"
          >
            {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-600" />}
            {copiedSummary ? 'Copied!' : 'Copy Summary'}
          </button>
          <button
            onClick={handleDownloadCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Alphalist CSV
          </button>
        </div>
      </div>

      {/* Quick Archetype Preset Chips */}
      <div className="bg-slate-100/70 p-3 rounded-xl border border-slate-200 flex flex-wrap items-center gap-2 text-xs">
        <span className="font-semibold text-slate-600 flex items-center gap-1.5 pr-2">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          Quick Tax Scenarios:
        </span>
        <button
          onClick={() => applyPreset('Minimum Wage Staff', 15860, true)}
          className="px-2.5 py-1 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-lg text-slate-700 font-medium transition-colors"
        >
          Minimum Wage (₱15.8k - Exempt)
        </button>
        <button
          onClick={() => applyPreset('Junior Dev', 32000, false)}
          className="px-2.5 py-1 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-lg text-slate-700 font-medium transition-colors"
        >
          Tier 2 (₱32k/mo)
        </button>
        <button
          onClick={() => applyPreset('Mid Specialist', 65000, false)}
          className="px-2.5 py-1 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-lg text-slate-700 font-medium transition-colors"
        >
          Tier 3 (₱65k/mo)
        </button>
        <button
          onClick={() => applyPreset('Senior Lead', 110000, false)}
          className="px-2.5 py-1 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-lg text-slate-700 font-medium transition-colors"
        >
          Tier 4 (₱110k/mo)
        </button>
        <button
          onClick={() => applyPreset('VP / Director', 220000, false)}
          className="px-2.5 py-1 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-lg text-slate-700 font-medium transition-colors"
        >
          Tier 5 (₱220k/mo)
        </button>
      </div>

      {/* Main Grid: Left Side Controls & Compensation Inputs / Right Side Outputs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Input Form (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-5">
            {/* Employee Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Select Employee from Registry</span>
                <span className="text-[10px] text-blue-600 font-normal">Auto-fills records</span>
              </label>
              <select
                value={selectedEmpId}
                onChange={(e) => handleSelectEmployee(e.target.value)}
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white"
              >
                <option value="custom">-- Custom Compensation Input --</option>
                {mockEmployees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName} — {emp.role} (₱{emp.basicSalary.toLocaleString()}/mo)
                  </option>
                ))}
              </select>
            </div>

            {/* Basic Info Fields */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Employee Name</label>
                <input
                  type="text"
                  value={formData.employeeName}
                  onChange={(e) => setFormData({ ...formData, employeeName: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-2.5 py-2 text-slate-800 font-medium"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Taxpayer TIN</label>
                <input
                  type="text"
                  value={formData.tin}
                  onChange={(e) => setFormData({ ...formData, tin: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-2.5 py-2 text-slate-800 font-mono"
                />
              </div>
            </div>

            {/* Minimum Wage Earner checkbox */}
            <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-amber-900 block">Minimum Wage Earner (MWE)</span>
                <span className="text-[11px] text-amber-700">Fully tax-exempt under RA 9504 & TRAIN Law</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isMinimumWageEarner}
                  onChange={(e) => setFormData({ ...formData, isMinimumWageEarner: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
              </label>
            </div>

            {/* Basic Salary & Tenure */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                1. Basic Salary & Coverage
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-600 font-medium mb-1">
                    Monthly Basic Salary (₱)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={formData.monthlyBasicSalary || ''}
                    onChange={(e) => setFormData({ ...formData, monthlyBasicSalary: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 font-medium mb-1">
                    Months in Tax Year
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={formData.periodMonths || ''}
                    onChange={(e) => setFormData({ ...formData, periodMonths: parseInt(e.target.value, 10) || 12 })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="text-[11px] text-slate-500 flex justify-between px-1">
                <span>Annual Basic Total:</span>
                <span className="font-mono font-bold text-slate-800">
                  {formatPHP(formData.monthlyBasicSalary * formData.periodMonths)}
                </span>
              </div>
            </div>

            {/* Non-Taxable / Exempt Items */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  2. Non-Taxable / Exempt Items
                </h3>
                <button
                  type="button"
                  onClick={handleAutoComputeStatutory}
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-800"
                >
                  <RefreshCw className="w-3 h-3" />
                  Auto SSS/PH/HDMF
                </button>
              </div>

              {/* 13th Month & Bonus with ₱90k threshold meter */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs text-slate-600 font-medium">
                    13th Month Pay & Bonuses (Annual)
                  </label>
                  <span className={`text-[10px] font-bold ${calculationResult.is13thMonthCapped ? 'text-amber-700' : 'text-emerald-700'}`}>
                    {calculationResult.is13thMonthCapped
                      ? `Exceeds ₱90k cap (+₱${calculationResult.thirteenthMonthExcess.toLocaleString()} taxable)`
                      : `Within ₱90k tax-exempt ceiling`}
                  </span>
                </div>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={formData.thirteenthMonthAndOtherBenefits || ''}
                  onChange={(e) => setFormData({ ...formData, thirteenthMonthAndOtherBenefits: parseFloat(e.target.value) || 0 })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono font-medium"
                />

                {/* Visual bar for ₱90k cap */}
                <div className="mt-1.5 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      calculationResult.is13thMonthCapped ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{
                      width: `${Math.min(100, ((formData.thirteenthMonthAndOtherBenefits || 0) / EXEMPT_13TH_MONTH_CAP) * 100)}%`,
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-600 font-medium mb-1">
                    De Minimis (Annual)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={formData.annualDeMinimis || ''}
                    onChange={(e) => setFormData({ ...formData, annualDeMinimis: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono"
                  />
                  <span className="text-[10px] text-slate-400">e.g. ₱24k rice subsidy</span>
                </div>

                <div>
                  <label className="block text-xs text-slate-600 font-medium mb-1">
                    Statutory Deductions (EE)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={formData.statutoryContributionsAnnual || ''}
                    onChange={(e) => setFormData({ ...formData, statutoryContributionsAnnual: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono"
                  />
                  <span className="text-[10px] text-slate-400">Annual SSS, PHIC, HDMF</span>
                </div>
              </div>
            </div>

            {/* Taxable Additions */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                3. Taxable Additions & Allowances
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-600 font-medium mb-1">
                    Taxable Allowances (Annual)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={formData.taxableAllowancesAnnual || ''}
                    onChange={(e) => setFormData({ ...formData, taxableAllowancesAnnual: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-600 font-medium mb-1">
                    Overtime / Night Diff (Annual)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={formData.taxableOvertimeAnnual || ''}
                    onChange={(e) => setFormData({ ...formData, taxableOvertimeAnnual: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-600 font-medium mb-1">
                  Commissions & Profit Sharing (Annual)
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={formData.commissionsAndIncentivesAnnual || ''}
                  onChange={(e) => setFormData({ ...formData, commissionsAndIncentivesAnnual: parseFloat(e.target.value) || 0 })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono"
                />
              </div>
            </div>

            {/* Withholding YTD for Reconciliation */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
                <span>4. Taxes Withheld Prior to Year-End</span>
                <span className="text-[10px] text-slate-500 font-normal">Jan - Nov Cutoffs</span>
              </h3>

              <div>
                <label className="block text-xs text-slate-600 font-medium mb-1">
                  Present Employer Tax Withheld YTD (₱)
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={formData.presentEmployerTaxWithheldYtd || ''}
                  onChange={(e) => setFormData({ ...formData, presentEmployerTaxWithheldYtd: parseFloat(e.target.value) || 0 })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-900"
                />
                <span className="text-[10px] text-slate-500">
                  Used in Form 2316 to compute whether employee is owed a Tax Refund or owes Tax Payable in final pay.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Computed Outputs & Views (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* KPI Dashboard Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Gross Income</span>
              <span className="text-base font-black text-slate-900 font-mono mt-0.5 block truncate">
                {formatPHP(calculationResult.item19_GrossCompensationPresent)}
              </span>
              <span className="text-[10px] text-slate-500">Present Employer</span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">Exempt Income</span>
              <span className="text-base font-black text-emerald-700 font-mono mt-0.5 block truncate">
                {formatPHP(calculationResult.item20_TotalNonTaxable)}
              </span>
              <span className="text-[10px] text-emerald-600">Non-Taxable Total</span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">Taxable Income</span>
              <span className="text-base font-black text-blue-900 font-mono mt-0.5 block truncate">
                {formatPHP(calculationResult.item23_TotalTaxableCompensation)}
              </span>
              <span className="text-[10px] text-blue-600">Subject to TRAIN</span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">Annual Tax Due</span>
              <span className="text-base font-black text-slate-900 font-mono mt-0.5 block truncate">
                {formatPHP(calculationResult.item24_TaxDue)}
              </span>
              <span className="text-[10px] text-slate-500">Tier {calculationResult.appliedBracket.tier} ({calculationResult.marginalRatePercent}%)</span>
            </div>
          </div>

          {/* Year-End Reconciliation Callout Box */}
          <div className="rounded-xl border p-4 shadow-xs transition-colors bg-white">
            {calculationResult.item27_OverwithheldRefund > 0 ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-emerald-950">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
                    <Check className="w-5 h-5 stroke-[3]" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 block">
                      Year-End Tax Refund (Form 2316 Item 27)
                    </span>
                    <p className="text-xs text-emerald-700">
                      Taxes withheld YTD ({formatPHP(calculationResult.item26_TotalTaxWithheld)}) exceed annual tax due ({formatPHP(calculationResult.item24_TaxDue)}). Refund this amount in December payroll.
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs text-emerald-800 font-medium block">Refund Due to Employee:</span>
                  <span className="text-xl font-black text-emerald-900 font-mono">
                    {formatPHP(calculationResult.item27_OverwithheldRefund)}
                  </span>
                </div>
              </div>
            ) : calculationResult.item28_TaxPayableAdjusted > 0 ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-amber-50 border border-amber-200 p-4 rounded-xl text-amber-950">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold shrink-0">
                    <AlertTriangle className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-800 block">
                      Year-End Tax Payable (Form 2316 Item 28)
                    </span>
                    <p className="text-xs text-amber-700">
                      Annual tax due ({formatPHP(calculationResult.item24_TaxDue)}) exceeds taxes withheld YTD ({formatPHP(calculationResult.item26_TotalTaxWithheld)}). Deduct this remaining balance in final pay.
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs text-amber-800 font-medium block">Deduction in Final Pay:</span>
                  <span className="text-xl font-black text-amber-900 font-mono">
                    {formatPHP(calculationResult.item28_TaxPayableAdjusted)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-slate-50 border border-slate-200 p-4 rounded-xl text-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-700 text-white flex items-center justify-center font-bold shrink-0">
                    <Scale className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                      Taxes Perfectly Reconciled
                    </span>
                    <p className="text-xs text-slate-500">
                      Total tax withheld equals exact annual tax due. No refund or additional tax payable.
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold font-mono text-slate-700">₱0.00</span>
                </div>
              </div>
            )}
          </div>

          {/* View Tab Selector */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <button
              onClick={() => setActiveViewTab('replica')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
                activeViewTab === 'replica'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              Official Form 2316 Replica
            </button>
            <button
              onClick={() => setActiveViewTab('ladder')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
                activeViewTab === 'ladder'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Tax Bracket Ladder & Math
            </button>
            <button
              onClick={() => setActiveViewTab('monthly')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
                activeViewTab === 'monthly'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <Receipt className="w-4 h-4" />
              Monthly / Cutoff Deductions
            </button>
          </div>

          {/* Tab 1: Form 2316 Replica */}
          {activeViewTab === 'replica' && (
            <Bir2316Document
              result={calculationResult}
              onDownloadCsv={handleDownloadCsv}
            />
          )}

          {/* Tab 2: Tax Bracket Ladder */}
          {activeViewTab === 'ladder' && (
            <TaxBracketLadder
              taxableCompensation={calculationResult.item23_TotalTaxableCompensation}
              appliedBracket={calculationResult.appliedBracket}
              marginalRate={calculationResult.marginalRatePercent}
              effectiveRate={calculationResult.effectiveTaxRatePercent}
              taxDue={calculationResult.item24_TaxDue}
            />
          )}

          {/* Tab 3: Monthly & Semi-Monthly Cutoff Deductions */}
          {activeViewTab === 'monthly' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Monthly & Semi-Monthly Pay Schedule Equivalent</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  How the annualized compensation translates into regular payroll withholding deductions.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="text-xs font-bold text-slate-600 uppercase">Monthly Payroll Cycle</div>
                  <div className="text-2xl font-black text-slate-900 font-mono">
                    {formatPHP(calculationResult.monthlyEquivalentTax)}
                    <span className="text-xs font-normal text-slate-500"> / month</span>
                  </div>
                  <div className="text-xs text-slate-500 pt-2 border-t border-slate-200 space-y-1">
                    <div className="flex justify-between">
                      <span>Monthly Basic:</span>
                      <span className="font-mono">{formatPHP(calculationResult.input.monthlyBasicSalary)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-slate-800">
                      <span>Net After Tax:</span>
                      <span className="font-mono">
                        {formatPHP(Math.max(0, calculationResult.input.monthlyBasicSalary - calculationResult.monthlyEquivalentTax))}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-200 space-y-2">
                  <div className="text-xs font-bold text-blue-700 uppercase">Semi-Monthly (Bimonthly 15th/30th)</div>
                  <div className="text-2xl font-black text-blue-900 font-mono">
                    {formatPHP(calculationResult.semiMonthlyEquivalentTax)}
                    <span className="text-xs font-normal text-blue-600"> / cutoff</span>
                  </div>
                  <div className="text-xs text-slate-500 pt-2 border-t border-blue-200 space-y-1">
                    <div className="flex justify-between">
                      <span>Cutoff Basic:</span>
                      <span className="font-mono">{formatPHP(calculationResult.input.monthlyBasicSalary / 2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-blue-950">
                      <span>Net Cutoff Pay:</span>
                      <span className="font-mono">
                        {formatPHP(Math.max(0, (calculationResult.input.monthlyBasicSalary / 2) - calculationResult.semiMonthlyEquivalentTax))}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2">
                <span className="font-bold text-slate-800 block">TRAIN Law Withholding Guidelines:</span>
                <ul className="list-disc list-inside space-y-1 text-slate-600">
                  <li>Minimum Wage Earners are strictly exempt from withholding tax regardless of allowances or OT.</li>
                  <li>Monthly taxable income under ₱20,833.33 (₱250k / 12) incurs 0% withholding tax.</li>
                  <li>Overtime, Night Shift, and Hazard Pay earned by regular (non-MWE) employees are subject to regular withholding.</li>
                  <li>Employers are required to issue BIR Form No. 2316 to employees on or before January 31 of each year.</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tax Tables Reference Drawer Modal */}
      <TaxTablesDrawer
        isOpen={showRefDrawer}
        onClose={() => setShowRefDrawer(false)}
      />
    </div>
  );
}
