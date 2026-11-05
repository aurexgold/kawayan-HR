import { useState, useMemo } from 'react';
import { Employee } from '../../types';
import { 
  ThirteenthMonthRecord, 
  MONTH_NAMES, 
  calculateDailyRate, 
  TAX_EXEMPTION_CEILING_TRAIN,
  generate12MonthPayrollTemplateCsv
} from '../../lib/thirteenth-month';
import { 
  Calendar, DollarSign, Upload, Download, RefreshCw, 
  Sliders, User, CheckCircle2, AlertTriangle, Scale, Clock, 
  ArrowRight, ShieldCheck, FileSpreadsheet, Eye
} from 'lucide-react';

interface AnnualPayrollAggregatorProps {
  employees: Employee[];
  selectedYear: number;
  records: ThirteenthMonthRecord[];
  employeeAdjustments: Record<string, { customUnpaidDays?: Record<number, number>; midYearAdvance?: number }>;
  onUpdateUnpaidDays: (empId: string, monthIdx: number, days: number) => void;
  onUpdateMidYearAdvance: (empId: string, amount: number) => void;
  onSelectEmployeeForInspector: (empId: string) => void;
}

export function AnnualPayrollAggregator({
  employees,
  selectedYear,
  records,
  employeeAdjustments,
  onUpdateUnpaidDays,
  onUpdateMidYearAdvance,
  onSelectEmployeeForInspector,
}: AnnualPayrollAggregatorProps) {
  const [activeEmpId, setActiveEmpId] = useState<string>(employees[0]?.id || 'emp-001');
  const [activeTab, setActiveTab] = useState<'matrix' | 'batch-summary' | 'upload'>('matrix');
  const [workingDaysDivisor, setWorkingDaysDivisor] = useState<261 | 313>(261);
  const [isSimulatingUpload, setIsSimulatingUpload] = useState<boolean>(false);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<string | null>(null);

  // Selected employee record
  const selectedRecord = useMemo(() => {
    return records.find(r => r.employeeId === activeEmpId) || records[0];
  }, [records, activeEmpId]);

  const selectedEmployeeObj = useMemo(() => {
    return employees.find(e => e.id === activeEmpId);
  }, [employees, activeEmpId]);

  // Handle batch template download
  const handleDownloadTemplate = () => {
    const csvContent = generate12MonthPayrollTemplateCsv(records, selectedYear);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `12_Month_Payroll_Aggregator_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Mock upload simulator
  const handleSimulateUpload = () => {
    setIsSimulatingUpload(true);
    setTimeout(() => {
      setIsSimulatingUpload(false);
      setUploadSuccessMessage(`Successfully aggregated 12-month payroll actuals for ${employees.length} employees for calendar year ${selectedYear}.`);
      setTimeout(() => setUploadSuccessMessage(null), 5000);
    }, 1000);
  };

  // Preset scenarios to apply to current active employee
  const handleApplyPreset = (scenario: 'clean' | 'lwop-sample' | 'advance-sample' | 'mid-year-hire') => {
    if (scenario === 'clean') {
      for (let m = 0; m < 12; m++) {
        onUpdateUnpaidDays(activeEmpId, m, 0);
      }
      onUpdateMidYearAdvance(activeEmpId, 0);
    } else if (scenario === 'lwop-sample') {
      onUpdateUnpaidDays(activeEmpId, 3, 2); // 2 days in April
      onUpdateUnpaidDays(activeEmpId, 7, 3); // 3 days in August
    } else if (scenario === 'advance-sample') {
      const halfMonth = Math.round(selectedRecord.currentMonthlySalary * 0.5);
      onUpdateMidYearAdvance(activeEmpId, halfMonth);
    }
  };

  return (
    <div className="space-y-6">
      {/* Aggregator Header & Mode Switcher */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              P.D. 851 Annual Aggregator
            </span>
            <span className="text-xs text-slate-500">
              Year {selectedYear} Payroll Ledger
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            12-Month Basic Salary & LWOP Aggregation Engine
          </h3>
          <p className="text-xs text-slate-500 max-w-2xl mt-0.5">
            Under Philippine labor standards, 13th-month pay equals the sum of basic salaries earned in 12 months divided by 12. 
            Adjust monthly unpaid absences (LWOP), inspect inclusions, and deduct mid-year advances.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={handleDownloadTemplate}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-xs"
            title="Download CSV template of all 12 months for bulk payroll import"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            CSV Template
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition-colors shadow-xs ${
              activeTab === 'upload' 
                ? 'bg-blue-600 text-white border-blue-600' 
                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Bulk Import CSV
          </button>
        </div>
      </div>

      {/* Upload Banner Modal/Section if activeTab === 'upload' */}
      {activeTab === 'upload' && (
        <div className="bg-slate-50 border border-blue-200 rounded-xl p-5 space-y-4">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-blue-600" />
              <div>
                <h4 className="text-sm font-bold text-slate-900">Import 12-Month Payroll Actuals (CSV)</h4>
                <p className="text-xs text-slate-500">
                  Upload actual monthly payroll register containing monthly basic pay, LWOP days, and mid-year advances.
                </p>
              </div>
            </div>
            <button 
              onClick={() => setActiveTab('matrix')}
              className="text-xs text-slate-500 hover:text-slate-800 font-medium"
            >
              Close
            </button>
          </div>

          <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center bg-white hover:bg-slate-50 transition-colors cursor-pointer">
            <Upload className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-800">
              Drag & drop your 12-month payroll export file here or click to browse
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Supports CSV exported from SAP, Oracle, Sprout, Salarium, or UnionBank Payroll
            </p>
          </div>

          <div className="flex justify-between items-center pt-2">
            <span className="text-[11px] text-slate-500">
              Format conforms to DOLE Labor Advisory No. 25 & PD 851 standards.
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleDownloadTemplate}
                className="px-3 py-1.5 text-xs text-slate-600 border border-slate-200 rounded-lg hover:bg-white"
              >
                Download Sample Template
              </button>
              <button
                onClick={handleSimulateUpload}
                disabled={isSimulatingUpload}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSimulatingUpload ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Validating CSV & Recalculating...
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    Process & Update All 12 Months
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {uploadSuccessMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold">{uploadSuccessMessage}</span>
          </div>
          <button onClick={() => setUploadSuccessMessage(null)} className="text-emerald-700 font-bold">×</button>
        </div>
      )}

      {/* Main Aggregator Grid: Left Column Employee Selector, Right Column 12-Month Breakdown Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Employee Roster Sidebar */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Select Employee</span>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono font-bold">
              {employees.length} Staff
            </span>
          </div>

          <div className="space-y-1 max-h-[580px] overflow-y-auto pr-1">
            {records.map(rec => {
              const isSelected = rec.employeeId === activeEmpId;
              const hasAdjustment = (employeeAdjustments[rec.employeeId]?.midYearAdvance || 0) > 0 ||
                Object.keys(employeeAdjustments[rec.employeeId]?.customUnpaidDays || {}).length > 0;

              return (
                <button
                  key={rec.employeeId}
                  onClick={() => setActiveEmpId(rec.employeeId)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-start justify-between ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50/70 shadow-xs'
                      : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-900 block">{rec.employeeName}</span>
                    <span className="text-[11px] text-slate-500 block truncate max-w-[130px]">{rec.role}</span>
                    <div className="flex items-center gap-1 pt-1">
                      <span className="text-[10px] font-mono text-slate-600 bg-white border border-slate-200 px-1 rounded">
                        {rec.proRatedFraction}
                      </span>
                      {rec.isTaxable && (
                        <span className="text-[9px] font-bold text-amber-700 bg-amber-100 px-1 rounded">
                          &gt;₱90k
                        </span>
                      )}
                      {hasAdjustment && (
                        <span className="text-[9px] font-bold text-indigo-700 bg-indigo-100 px-1 rounded">
                          Adj
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-black text-slate-900 font-mono block">
                      ₱{rec.payableThirteenthMonth.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                    <span className="text-[10px] text-slate-400">13th Pay</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick Stats Callout */}
          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
            <div className="flex justify-between">
              <span>Standard Daily Divisor:</span>
              <span className="font-bold font-mono text-slate-800">{workingDaysDivisor} days (5-day)</span>
            </div>
            <div className="flex justify-between">
              <span>Tax Exemption Cap:</span>
              <span className="font-bold font-mono text-emerald-700">₱{TAX_EXEMPTION_CEILING_TRAIN.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* 12-Month Matrix & Calculation Inspector */}
        <div className="lg:col-span-3 space-y-5">
          {/* Active Employee Banner */}
          {selectedRecord && (
            <div className="bg-slate-900 text-white rounded-xl p-5 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold bg-blue-500/30 text-blue-300 px-2.5 py-0.5 rounded-full border border-blue-400/30">
                    {selectedRecord.department}
                  </span>
                  <span className="text-xs text-slate-400">
                    Hired: <span className="text-slate-200 font-medium">{selectedRecord.joinDate}</span>
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    selectedRecord.isProRated 
                      ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40' 
                      : 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/40'
                  }`}>
                    {selectedRecord.isProRated ? `Pro-Rated (${selectedRecord.proRatedFraction})` : 'Full 12 Months'}
                  </span>
                </div>
                <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  {selectedRecord.employeeName}
                  <span className="text-sm font-normal text-slate-400 font-sans">({selectedRecord.role})</span>
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Monthly Basic Salary: <span className="font-mono font-bold text-amber-300">₱{selectedRecord.currentMonthlySalary.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  <span className="mx-2 text-slate-600">•</span>
                  Daily Rate Factor: <span className="font-mono text-slate-300">₱{selectedRecord.dailyRate.toFixed(2)}/day</span>
                </p>
              </div>

              <div className="bg-slate-800/90 rounded-xl p-3 border border-slate-700 text-right min-w-[200px]">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Computed 13th Month Pay</span>
                <span className="text-2xl font-black text-emerald-400 font-mono block mt-0.5">
                  ₱{selectedRecord.payableThirteenthMonth.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </span>
                <span className="text-[10px] text-slate-400">
                  {selectedRecord.isTaxable ? `₱${selectedRecord.taxableExcess.toLocaleString()} taxable excess` : '100% Tax-Exempt under TRAIN'}
                </span>
              </div>
            </div>
          )}

          {/* Quick Scenario Preset Adjuster Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-white rounded-xl border border-slate-200 shadow-xs text-xs">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-blue-600" />
              Quick Adjustments:
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => handleApplyPreset('clean')}
                className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs"
              >
                Reset to Full Earnings
              </button>
              <button
                onClick={() => handleApplyPreset('lwop-sample')}
                className="px-2.5 py-1 rounded-lg border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100 text-xs font-medium"
              >
                + Add Sample LWOP Absences
              </button>
              <button
                onClick={() => handleApplyPreset('advance-sample')}
                className="px-2.5 py-1 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-800 hover:bg-indigo-100 text-xs font-medium"
              >
                + Add Mid-Year 50% Advance
              </button>
            </div>
          </div>

          {/* 12-Month Table Matrix */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <div>
                <h4 className="font-bold text-sm text-slate-800">
                  Calendar Year {selectedYear} Monthly Basic Wages Schedule
                </h4>
                <p className="text-xs text-slate-500">
                  DOLE PD 851 formula: Sum of actual basic salaries earned divided by 12.
                </p>
              </div>

              {/* Working Days Standard Selector */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500 font-medium">Daily Divisor:</span>
                <select
                  value={workingDaysDivisor}
                  onChange={(e) => setWorkingDaysDivisor(Number(e.target.value) as 261 | 313)}
                  className="px-2 py-1 text-xs rounded border border-slate-200 bg-white font-medium text-slate-700"
                >
                  <option value={261}>261 Days (5-Day Workweek)</option>
                  <option value={313}>313 Days (6-Day Workweek)</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Month</th>
                    <th className="py-2.5 px-3">Employment Status</th>
                    <th className="py-2.5 px-3 text-right">Scheduled Basic</th>
                    <th className="py-2.5 px-3 text-center">Unpaid Days (LWOP)</th>
                    <th className="py-2.5 px-3 text-right">LWOP Deduction</th>
                    <th className="py-2.5 px-3 text-right font-bold text-blue-900">Net Basic Earned</th>
                    <th className="py-2.5 px-3">Statutory Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedRecord.monthlyBreakdown.map((m, idx) => {
                    const dailyRate = (m.baseSalary * 12) / workingDaysDivisor;
                    const calculatedDeduction = Math.round(m.unpaidDays * dailyRate);
                    const netBasic = m.isEmployed ? Math.max(0, m.baseSalary - calculatedDeduction) : 0;

                    return (
                      <tr 
                        key={idx}
                        className={`transition-colors ${
                          !m.isEmployed 
                            ? 'bg-slate-50/60 text-slate-400' 
                            : m.unpaidDays > 0 
                              ? 'bg-amber-50/40' 
                              : 'hover:bg-slate-50/50'
                        }`}
                      >
                        <td className="py-2.5 px-3 font-semibold text-slate-800">
                          {m.monthName}
                        </td>
                        <td className="py-2.5 px-3">
                          {m.isEmployed ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Active Service
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                              Not Yet Hired
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono">
                          ₱{m.baseSalary.toLocaleString(undefined, {minimumFractionDigits: 2})}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {m.isEmployed ? (
                            <div className="inline-flex items-center gap-1 justify-center">
                              <input
                                type="number"
                                min={0}
                                max={22}
                                value={m.unpaidDays}
                                onChange={(e) => onUpdateUnpaidDays(selectedRecord.employeeId, idx, Number(e.target.value))}
                                className={`w-14 text-center py-1 text-xs rounded border font-mono ${
                                  m.unpaidDays > 0 
                                    ? 'border-amber-400 bg-amber-50 text-amber-900 font-bold' 
                                    : 'border-slate-200 bg-white text-slate-700'
                                }`}
                              />
                              <span className="text-[10px] text-slate-400">days</span>
                            </div>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-rose-600">
                          {calculatedDeduction > 0 ? `-₱${calculatedDeduction.toLocaleString()}` : '₱0.00'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                          ₱{netBasic.toLocaleString(undefined, {minimumFractionDigits: 2})}
                        </td>
                        <td className="py-2.5 px-3 text-[11px] text-slate-500 max-w-[200px] truncate">
                          {m.notes}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-slate-50 border-t-2 border-slate-200 font-semibold text-slate-900 text-xs">
                  <tr>
                    <td colSpan={2} className="py-3 px-3 uppercase tracking-wider text-[11px] font-bold">
                      Annual Aggregated Totals ({selectedYear})
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-600">
                      ₱{(selectedRecord.currentMonthlySalary * selectedRecord.monthsEmployedInYear).toLocaleString(undefined, {minimumFractionDigits: 2})}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-amber-700">
                      {selectedRecord.monthlyBreakdown.reduce((sum, m) => sum + m.unpaidDays, 0)} days
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-rose-700">
                      -₱{selectedRecord.monthlyBreakdown.reduce((sum, m) => sum + m.unpaidDeduction, 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-black text-blue-900 text-sm">
                      ₱{selectedRecord.totalAnnualBasicEarned.toLocaleString(undefined, {minimumFractionDigits: 2})}
                    </td>
                    <td className="py-3 px-3 text-[11px] text-slate-500">
                      Divided by 12 = ₱{selectedRecord.rawCalculatedAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Mathematical Computation Breakdown Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Scale className="w-4 h-4 text-indigo-600" />
              Presidential Decree No. 851 Mathematical Formula Execution
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Step 1: Total Basic Earned</span>
                <span className="text-base font-black text-slate-800 font-mono mt-1 block">
                  ₱{selectedRecord.totalAnnualBasicEarned.toLocaleString(undefined, {minimumFractionDigits: 2})}
                </span>
                <span className="text-[10px] text-slate-500">
                  Aggregated over {selectedRecord.monthsEmployedInYear} active month(s)
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/50">
                <span className="text-[10px] uppercase font-bold text-blue-600 block">Step 2: Statutory 1/12 Divisor</span>
                <span className="text-base font-black text-blue-900 font-mono mt-1 block">
                  ₱{selectedRecord.rawCalculatedAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}
                </span>
                <span className="text-[10px] text-blue-700">
                  Formula: Total Basic Earned ÷ 12
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50">
                <span className="text-[10px] uppercase font-bold text-emerald-700 block">Step 3: Mid-Year Advance Deduction</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-slate-500">Deduct ₱</span>
                  <input
                    type="number"
                    min={0}
                    value={selectedRecord.midYearAdvanceDeducted}
                    onChange={(e) => onUpdateMidYearAdvance(selectedRecord.employeeId, Number(e.target.value))}
                    className="w-28 py-1 px-2 text-xs font-mono font-bold rounded border border-emerald-300 bg-white"
                  />
                </div>
                <span className="text-[10px] text-emerald-800 block mt-1">
                  If released in May/June (Back-to-school)
                </span>
              </div>
            </div>

            {/* TRAIN Law Tax Exemption Assessment */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Republic Act No. 10963 (TRAIN Law) Section 32(B)(7)(e) Assessment:
                </span>
                <p className="text-xs text-slate-600">
                  Total 13th month and other benefits up to <strong className="text-slate-900">₱90,000.00</strong> are 100% tax-exempt. 
                  Any excess is subject to graduated income tax withholding.
                </p>
              </div>

              <div className="flex items-center gap-4 text-right">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Tax-Exempt Share</span>
                  <span className="text-sm font-bold text-emerald-700 font-mono">
                    ₱{selectedRecord.taxExemptAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Taxable Excess</span>
                  <span className={`text-sm font-bold font-mono ${selectedRecord.isTaxable ? 'text-amber-700' : 'text-slate-400'}`}>
                    ₱{selectedRecord.taxableExcess.toLocaleString(undefined, {minimumFractionDigits: 2})}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
