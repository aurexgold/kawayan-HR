import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Employee } from '../../types';
import { 
  calculateCompanyThirteenthMonthSummary, 
  calculateEmployeeThirteenthMonth,
  generateDoleComplianceCsv, 
  DOLE_STATUTORY_GUIDELINES, 
  TAX_EXEMPTION_CEILING_TRAIN,
  ThirteenthMonthRecord,
  MONTH_NAMES
} from '../../lib/thirteenth-month';
import { 
  Gift, Calendar, Download, Printer, Search, 
  Info, AlertTriangle, Scale, DollarSign, 
  Building2, Sliders, ChevronRight, X, FileText,
  ShieldCheck, Calculator, CheckCircle2, ExternalLink
} from 'lucide-react';
import { ThirteenthMonthCalculatorView } from './ThirteenthMonthCalculatorView';

interface ThirteenthMonthPayEstimatorProps {
  employees: Employee[];
}

export function ThirteenthMonthPayEstimator({ employees }: ThirteenthMonthPayEstimatorProps) {
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [viewMode, setViewMode] = useState<'calculator' | 'ledger' | 'inspector' | 'compliance'>('calculator');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState<string>('ALL');
  const [filterProRated, setFilterProRated] = useState<'ALL' | 'PRORATED' | 'FULL_YEAR'>('ALL');
  const [filterTaxable, setFilterTaxable] = useState<'ALL' | 'TAXABLE' | 'EXEMPT'>('ALL');

  // Custom adjustments per employee
  const [employeeAdjustments, setEmployeeAdjustments] = useState<
    Record<string, { customUnpaidDays?: Record<number, number>; midYearAdvance?: number }>
  >({
    'emp-003': {
      customUnpaidDays: { 3: 2 }, // Jose Rizal 2 days LWOP in April
      midYearAdvance: 0,
    },
    'emp-005': {
      midYearAdvance: 40000, // Gabriela Silang took ₱40,000 mid-year advance in June
    }
  });

  // Selected employee for deep-dive inspector
  const [selectedEmpId, setSelectedEmpId] = useState<string>(employees[0]?.id || 'emp-001');

  // Modal voucher state
  const [voucherModalRecord, setVoucherModalRecord] = useState<ThirteenthMonthRecord | null>(null);
  const [showDoleSubmittedToast, setShowDoleSubmittedToast] = useState(false);

  // Compute records and summary
  const { records, summary } = useMemo(() => {
    return calculateCompanyThirteenthMonthSummary(employees, selectedYear, employeeAdjustments);
  }, [employees, selectedYear, employeeAdjustments]);

  // Filtered ledger records
  const filteredRecords = useMemo(() => {
    return records.filter(rec => {
      const matchesSearch = 
        rec.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.department.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDept = filterDepartment === 'ALL' || rec.department === filterDepartment;
      const matchesProRated = 
        filterProRated === 'ALL' || 
        (filterProRated === 'PRORATED' && rec.isProRated) || 
        (filterProRated === 'FULL_YEAR' && !rec.isProRated);
      const matchesTaxable = 
        filterTaxable === 'ALL' || 
        (filterTaxable === 'TAXABLE' && rec.isTaxable) || 
        (filterTaxable === 'EXEMPT' && !rec.isTaxable);

      return matchesSearch && matchesDept && matchesProRated && matchesTaxable;
    });
  }, [records, searchTerm, filterDepartment, filterProRated, filterTaxable]);

  // Current selected employee record for inspector
  const activeInspectorRecord = useMemo(() => {
    const current = records.find(r => r.employeeId === selectedEmpId);
    return current || records[0];
  }, [records, selectedEmpId]);

  // Departments list for filter
  const departments = useMemo(() => {
    return Array.from(new Set(employees.map(e => e.department)));
  }, [employees]);

  // Handler to adjust unpaid days for an employee month
  const handleUpdateUnpaidDays = (empId: string, monthIdx: number, days: number) => {
    setEmployeeAdjustments(prev => {
      const empAdj = prev[empId] || {};
      const currentDays = { ...(empAdj.customUnpaidDays || {}) };
      if (days <= 0) {
        delete currentDays[monthIdx];
      } else {
        currentDays[monthIdx] = Math.min(22, days);
      }
      return {
        ...prev,
        [empId]: {
          ...empAdj,
          customUnpaidDays: currentDays,
        }
      };
    });
  };

  // Handler to adjust mid-year advance
  const handleUpdateMidYearAdvance = (empId: string, amount: number) => {
    setEmployeeAdjustments(prev => {
      const empAdj = prev[empId] || {};
      return {
        ...prev,
        [empId]: {
          ...empAdj,
          midYearAdvance: Math.max(0, amount),
        }
      };
    });
  };

  // Download CSV
  const handleDownloadCsv = () => {
    const csvData = generateDoleComplianceCsv(records, selectedYear);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `DOLE_13th_Month_Pay_Schedule_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Statutory Context */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-blue-500/10 to-transparent pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-400 text-amber-950 flex items-center gap-1">
                <Gift className="w-3.5 h-3.5" /> Mandatory DOLE PD 851
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/30 text-blue-200 border border-blue-400/30">
                TRAIN Law ₱90,000 Tax-Free Cap
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Due on or before Dec 24
              </span>
            </div>
            
            <h2 className="text-2xl font-bold tracking-tight">13th Month Pay Estimator & Statutory Ledger</h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Computes pro-rated 13th month compensation pursuant to Presidential Decree No. 851 
              (<span className="font-mono text-amber-300">Total Basic Salary Earned ÷ 12</span>), excludes non-basic pay, 
              applies the ₱90,000 tax exemption threshold under the TRAIN Law, and prepares mandatory DOLE compliance schedules.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/15 flex items-center gap-3">
              <div className="text-right">
                <span className="text-[11px] text-slate-300 block uppercase font-medium">Statutory Deadline</span>
                <span className="text-sm font-bold text-white">Dec 24, {selectedYear}</span>
              </div>
              <div className="bg-amber-400 text-amber-950 font-black text-xs px-2.5 py-1.5 rounded-lg text-center shadow-xs">
                {summary.daysRemainingToDeadline > 0 ? (
                  <span>{summary.daysRemainingToDeadline}d left</span>
                ) : (
                  <span>Dec 24</span>
                )}
              </div>
            </div>

            <div className="flex items-center bg-white/10 backdrop-blur-md rounded-xl p-1 border border-white/15">
              <button
                onClick={() => setSelectedYear(2024)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedYear === 2024 ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                2024
              </button>
              <button
                onClick={() => setSelectedYear(2025)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedYear === 2025 ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                2025
              </button>
            </div>

            <button
              onClick={handleDownloadCsv}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-colors"
            >
              <Download className="w-4 h-4" />
              DOLE CSV Report
            </button>

            <Link
              to="/thirteenth-month"
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-amber-950 text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Open Full 13th-Month Module
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total 13th Mo. Liability</span>
          <span className="text-lg font-black text-slate-900 font-mono mt-1 block">
            ₱{summary.totalGrossThirteenthMonth.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </span>
          <span className="text-[10px] text-slate-500 mt-1 block">
            Across {summary.totalEmployees} employees
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Tax-Exempt (≤ ₱90k)
          </span>
          <span className="text-lg font-black text-emerald-700 font-mono mt-1 block">
            ₱{summary.totalTaxExemptDisbursement.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </span>
          <span className="text-[10px] text-emerald-600 mt-1 block">
            {summary.totalEmployees - summary.employeesExceedingTaxCap} 100% tax-free
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            Taxable Excess (&gt; ₱90k)
          </span>
          <span className="text-lg font-black text-amber-700 font-mono mt-1 block">
            ₱{summary.totalTaxableExcess.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </span>
          <span className="text-[10px] text-amber-600 mt-1 block">
            {summary.employeesExceedingTaxCap} employee(s) over cap
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-purple-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 block">
            Est. Withholding Tax
          </span>
          <span className="text-lg font-black text-purple-700 font-mono mt-1 block">
            ₱{summary.totalEstimatedTaxWithheld.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </span>
          <span className="text-[10px] text-purple-600 mt-1 block">
            TRAIN withholding deduction
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 block">
            Total Net Payout
          </span>
          <span className="text-lg font-black text-blue-700 font-mono mt-1 block">
            ₱{summary.totalNetCashRequired.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </span>
          <span className="text-[10px] text-blue-600 mt-1 block">
            Direct bank deposit total
          </span>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
            Pro-Rated Staff
          </span>
          <span className="text-lg font-black text-slate-800 font-mono mt-1 block">
            {summary.proRatedEmployees} / {summary.totalEmployees}
          </span>
          <span className="text-[10px] text-slate-500 mt-1 block">
            Hired mid-year or had LWOP
          </span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-xl p-1 gap-1 shadow-xs overflow-x-auto">
        <button
          onClick={() => setViewMode('calculator')}
          className={`flex-1 min-w-[200px] py-2.5 px-4 rounded-lg font-semibold text-xs flex items-center justify-center gap-2 transition-all ${
            viewMode === 'calculator'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Calculator className="w-4 h-4" />
          Automated P.D. 851 Calculator & Voucher
        </button>

        <button
          onClick={() => setViewMode('ledger')}
          className={`flex-1 min-w-[200px] py-2.5 px-4 rounded-lg font-semibold text-xs flex items-center justify-center gap-2 transition-all ${
            viewMode === 'ledger'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          Company 13th Month Payroll Ledger ({records.length})
        </button>

        <button
          onClick={() => setViewMode('inspector')}
          className={`flex-1 min-w-[200px] py-2.5 px-4 rounded-lg font-semibold text-xs flex items-center justify-center gap-2 transition-all ${
            viewMode === 'inspector'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Sliders className="w-4 h-4" />
          Individual Pro-Ration Inspector
        </button>

        <button
          onClick={() => setViewMode('compliance')}
          className={`flex-1 min-w-[200px] py-2.5 px-4 rounded-lg font-semibold text-xs flex items-center justify-center gap-2 transition-all ${
            viewMode === 'compliance'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Scale className="w-4 h-4" />
          DOLE PD 851 Guidelines & Regional Report
        </button>
      </div>

      {/* VIEW 0: AUTOMATED P.D. 851 CALCULATOR */}
      {viewMode === 'calculator' && (
        <ThirteenthMonthCalculatorView
          employees={employees}
          onSelectEmployeeForInspector={(empId) => {
            setSelectedEmpId(empId);
            setViewMode('inspector');
          }}
        />
      )}

      {/* VIEW 1: COMPANY-WIDE BATCH LEDGER */}
      {viewMode === 'ledger' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Controls Bar */}
          <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
            <div className="flex flex-1 items-center gap-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search employee, role, department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-medium"
              >
                <option value="ALL">All Departments</option>
                {departments.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>

              <select
                value={filterProRated}
                onChange={(e) => setFilterProRated(e.target.value as any)}
                className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-medium"
              >
                <option value="ALL">All Tenures</option>
                <option value="FULL_YEAR">Full Year (12/12)</option>
                <option value="PRORATED">Pro-Rated (&lt;12 mos / LWOP)</option>
              </select>

              <select
                value={filterTaxable}
                onChange={(e) => setFilterTaxable(e.target.value as any)}
                className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-medium"
              >
                <option value="ALL">All Tax Tiers</option>
                <option value="EXEMPT">100% Tax Exempt (≤ ₱90k)</option>
                <option value="TAXABLE">With Taxable Excess (&gt; ₱90k)</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadCsv}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-blue-600" />
                Export CSV
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-3">Hire Date</th>
                  <th className="py-3 px-3">Tenure (In Year)</th>
                  <th className="py-3 px-3 text-right">Monthly Basic</th>
                  <th className="py-3 px-3 text-right">Total Basic Earned</th>
                  <th className="py-3 px-3 text-right">13th Month Gross</th>
                  <th className="py-3 px-3 text-right">Advance Paid</th>
                  <th className="py-3 px-3 text-right">Tax-Exempt (≤90k)</th>
                  <th className="py-3 px-3 text-right">Taxable Excess</th>
                  <th className="py-3 px-3 text-right">Net Payable</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map((rec) => (
                  <tr key={rec.employeeId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-bold text-slate-900">{rec.employeeName}</div>
                        <div className="text-[11px] text-slate-500">{rec.role} • {rec.department}</div>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600 whitespace-nowrap">
                      {rec.joinDate}
                    </td>
                    <td className="py-3 px-3">
                      {rec.isProRated ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          Pro-rated ({rec.proRatedFraction})
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Full Year (12/12)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-medium text-slate-700">
                      ₱{rec.currentMonthlySalary.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-600">
                      ₱{rec.totalAnnualBasicEarned.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                      ₱{rec.rawCalculatedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-500">
                      {rec.midYearAdvanceDeducted > 0 ? (
                        <span className="text-rose-600">-₱{rec.midYearAdvanceDeducted.toLocaleString()}</span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-emerald-700 font-semibold">
                      ₱{rec.taxExemptAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3 text-right font-mono">
                      {rec.taxableExcess > 0 ? (
                        <span className="text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          +₱{rec.taxableExcess.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-slate-400">₱0.00</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-black text-blue-700 bg-blue-50/30">
                      ₱{rec.netTakeHome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-800">
                        {rec.disbursementStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedEmpId(rec.employeeId);
                            setViewMode('inspector');
                          }}
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-[11px] transition-colors"
                          title="Inspect month-by-month calculation"
                        >
                          Inspect
                        </button>
                        <button
                          onClick={() => setVoucherModalRecord(rec)}
                          className="px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium text-[11px] flex items-center gap-1 transition-colors"
                          title="Generate DOLE 13th Month Payslip Voucher"
                        >
                          <FileText className="w-3 h-3" />
                          Voucher
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 font-bold text-xs border-t-2 border-slate-200 text-slate-800">
                <tr>
                  <td colSpan={3} className="py-3 px-4 text-slate-900 font-black">
                    Company Total ({filteredRecords.length} Employees)
                  </td>
                  <td className="py-3 px-3 text-right font-mono">
                    ₱{filteredRecords.reduce((s, r) => s + r.currentMonthlySalary, 0).toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-right font-mono">
                    ₱{filteredRecords.reduce((s, r) => s + r.totalAnnualBasicEarned, 0).toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-900 font-black">
                    ₱{filteredRecords.reduce((s, r) => s + r.rawCalculatedAmount, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-rose-600">
                    -₱{filteredRecords.reduce((s, r) => s + r.midYearAdvanceDeducted, 0).toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-emerald-700">
                    ₱{filteredRecords.reduce((s, r) => s + r.taxExemptAmount, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-amber-700">
                    ₱{filteredRecords.reduce((s, r) => s + r.taxableExcess, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-blue-700 font-black">
                    ₱{filteredRecords.reduce((s, r) => s + r.netTakeHome, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="p-3 bg-slate-50/50 border-t border-slate-200 text-[11px] text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-2">
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-blue-500" />
              Per DOLE guidelines, 13th month computation strictly includes basic wage and excludes overtime, night shift differential, allowances, and unworked days.
            </span>
            <span className="font-medium text-slate-700">
              Tax Threshold: ₱90,000 TRAIN Exemption Cap
            </span>
          </div>
        </div>
      )}

      {/* VIEW 2: INDIVIDUAL PRO-RATION INSPECTOR & INTERACTIVE SIMULATOR */}
      {viewMode === 'inspector' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Employee Selector & Month-by-Month Breakdown */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4 mb-4">
                <div>
                  <h3 className="font-bold text-base text-slate-900">Month-by-Month Statutory Earnings Ledger</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Adjust Leave Without Pay (LWOP) or review hire date pro-ration for {selectedYear}.
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <label className="text-xs font-semibold text-slate-600 whitespace-nowrap">Employee:</label>
                  <select
                    value={selectedEmpId}
                    onChange={(e) => setSelectedEmpId(e.target.value)}
                    className="w-full sm:w-64 text-xs px-3 py-2 rounded-lg border border-slate-200 font-medium text-slate-800 bg-white shadow-xs focus:ring-2 focus:ring-blue-500"
                  >
                    {employees.map(e => (
                      <option key={e.id} value={e.id}>
                        {e.firstName} {e.lastName} ({e.role} - ₱{e.basicSalary.toLocaleString()}/mo)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Employee Quick Profile Card */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Hire Date</span>
                  <span className="font-semibold text-slate-800">{activeInspectorRecord.joinDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Standard Monthly</span>
                  <span className="font-semibold font-mono text-slate-800">₱{activeInspectorRecord.currentMonthlySalary.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Estimated Daily Rate</span>
                  <span className="font-semibold font-mono text-slate-800">₱{activeInspectorRecord.dailyRate.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">(261 factor)</span></span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Year Tenure</span>
                  <span className={`font-bold ${activeInspectorRecord.isProRated ? 'text-amber-700' : 'text-emerald-700'}`}>
                    {activeInspectorRecord.proRatedFraction} Months {activeInspectorRecord.isProRated ? '(Pro-Rated)' : '(Full)'}
                  </span>
                </div>
              </div>

              {/* Month by month interactive table */}
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold text-[10px] uppercase">
                    <tr>
                      <th className="py-2.5 px-3">Month</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Base Salary</th>
                      <th className="py-2.5 px-3 text-center">Unpaid Days (LWOP)</th>
                      <th className="py-2.5 px-3 text-right">Deduction</th>
                      <th className="py-2.5 px-3 text-right">Actual Basic Earned</th>
                      <th className="py-2.5 px-3">DOLE Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeInspectorRecord.monthlyBreakdown.map((m) => (
                      <tr key={m.monthIndex} className={m.isEmployed ? 'hover:bg-slate-50' : 'bg-slate-50/50 text-slate-400'}>
                        <td className="py-2 px-3 font-semibold text-slate-800">
                          {m.monthName}
                        </td>
                        <td className="py-2 px-3">
                          {m.isEmployed ? (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                              Active
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-200 text-slate-600">
                              Not Hired
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-right font-mono">
                          {m.isEmployed ? `₱${m.baseSalary.toLocaleString()}` : '-'}
                        </td>
                        <td className="py-2 px-3 text-center">
                          {m.isEmployed ? (
                            <div className="inline-flex items-center gap-1">
                              <input
                                type="number"
                                min={0}
                                max={22}
                                value={m.unpaidDays}
                                onChange={(e) => handleUpdateUnpaidDays(activeInspectorRecord.employeeId, m.monthIndex, parseInt(e.target.value) || 0)}
                                className="w-14 text-center font-mono py-1 px-1 text-xs border border-slate-200 rounded focus:ring-1 focus:ring-blue-500"
                              />
                              <span className="text-[10px] text-slate-400">days</span>
                            </div>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-rose-600">
                          {m.unpaidDeduction > 0 ? `-₱${m.unpaidDeduction.toLocaleString()}` : '-'}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                          ₱{m.actualBasicEarned.toLocaleString()}
                        </td>
                        <td className="py-2 px-3 text-[11px] text-slate-500">
                          {m.notes}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-100 font-bold text-xs border-t border-slate-200">
                    <tr>
                      <td colSpan={5} className="py-2.5 px-3 text-slate-900">
                        Total Annual Basic Salary Earned (Jan - Dec {selectedYear})
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-blue-700 font-black">
                        ₱{activeInspectorRecord.totalAnnualBasicEarned.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-[11px] text-slate-600">
                        Sum for DOLE 1/12th divisor
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Formula Callout */}
              <div className="mt-4 p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 flex items-start gap-3">
                <Calculator className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold block text-sm">DOLE Presidential Decree 851 Formula Execution:</span>
                  <div className="font-mono text-slate-800 bg-white/80 p-2.5 rounded-lg border border-blue-200/80 inline-block">
                    13th Month Pay = ₱{activeInspectorRecord.totalAnnualBasicEarned.toLocaleString()} (Total Basic Earned) ÷ 12 
                    = <span className="font-bold text-blue-700">₱{activeInspectorRecord.rawCalculatedAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <p className="text-[11px] text-blue-800 mt-1">
                    Notice: Deductions for Leave Without Pay (LWOP) or mid-year join date are already mathematically adjusted in the annual total numerator.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Tax Breakdown, Advance Settings, and Voucher Trigger */}
          <div className="space-y-5">
            {/* 13th Month Summary Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <Gift className="w-4 h-4 text-blue-600" />
                  Calculation Summary
                </h4>
                <button
                  onClick={() => setVoucherModalRecord(activeInspectorRecord)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Voucher
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Gross Calculated 13th Month</span>
                  <span className="font-mono font-bold text-slate-900">
                    ₱{activeInspectorRecord.rawCalculatedAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {/* Mid Year Advance Input */}
                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <div>
                    <span className="text-slate-600 block">Less: Mid-Year Payout Advance</span>
                    <span className="text-[10px] text-slate-400">Optional 1st installment (May/June)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">₱</span>
                    <input
                      type="number"
                      min={0}
                      step={1000}
                      value={activeInspectorRecord.midYearAdvanceDeducted}
                      onChange={(e) => handleUpdateMidYearAdvance(activeInspectorRecord.employeeId, parseFloat(e.target.value) || 0)}
                      className="w-24 text-right font-mono py-1 px-2 text-xs border border-slate-200 rounded focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-100 font-semibold text-slate-800">
                  <span>Payable 13th Month Pay</span>
                  <span className="font-mono text-slate-900">
                    ₱{activeInspectorRecord.payableThirteenthMonth.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {/* TRAIN Law Tax Section */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-700 flex items-center gap-1">
                      <Scale className="w-3.5 h-3.5 text-blue-600" />
                      TRAIN Law (RA 10963) Tax Cap
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 font-bold">₱90,000.00 Limit</span>
                  </div>

                  {/* Progress bar to 90k */}
                  <div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-2 rounded-full transition-all ${
                          activeInspectorRecord.isTaxable ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{
                          width: `${Math.min(100, (activeInspectorRecord.payableThirteenthMonth / TAX_EXEMPTION_CEILING_TRAIN) * 100)}%`
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                      <span>₱0</span>
                      <span>₱90,000 Tax Ceiling</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 space-y-1.5">
                    <div className="flex justify-between text-emerald-700">
                      <span>Tax-Exempt Portion:</span>
                      <span className="font-mono font-bold">
                        ₱{activeInspectorRecord.taxExemptAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="flex justify-between text-amber-800">
                      <span>Taxable Excess (over ₱90k):</span>
                      <span className="font-mono font-bold">
                        ₱{activeInspectorRecord.taxableExcess.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    {activeInspectorRecord.isTaxable && (
                      <div className="flex justify-between text-purple-700">
                        <span>Est. Withholding Tax (20%):</span>
                        <span className="font-mono font-bold">
                          -₱{activeInspectorRecord.estimatedWithholdingTax.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Final Net Pay */}
                <div className="bg-blue-50 p-3.5 rounded-xl border border-blue-200 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-blue-800 block">Take-Home 13th Month</span>
                    <span className="text-[11px] text-blue-600">Disbursed on or before Dec 24</span>
                  </div>
                  <span className="text-xl font-black text-blue-900 font-mono">
                    ₱{activeInspectorRecord.netTakeHome.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <button
                  onClick={() => setVoucherModalRecord(activeInspectorRecord)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  View & Print Statutory Voucher
                </button>
              </div>
            </div>

            {/* Inclusions vs Exclusions Rule Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs text-xs space-y-3">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-blue-500" />
                DOLE PD 851 Checklist for HR
              </span>

              <div className="space-y-1.5 text-[11px]">
                <div className="p-2 rounded bg-emerald-50 border border-emerald-100 text-emerald-900">
                  <span className="font-bold block">✓ Mandatory Inclusions:</span>
                  Basic salary for actual rendered service, paid vacation/sick leaves, and paid regular holidays.
                </div>
                <div className="p-2 rounded bg-rose-50 border border-rose-100 text-rose-900">
                  <span className="font-bold block">✗ Mandatory Exclusions:</span>
                  Overtime pay, Night Shift Differential (NSD), holiday premium, COLA, unused leave cash conversions, and Christmas bonuses.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: DOLE PD 851 GUIDELINES & REGIONAL COMPLIANCE REPORT */}
      {viewMode === 'compliance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* DOLE Guidelines Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Scale className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Presidential Decree No. 851 Legal Framework</h3>
                  <span className="text-xs text-slate-500">Revised Guidelines on 13th-Month Pay Law</span>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <h4 className="font-bold text-slate-800 mb-1">1. Who is Covered?</h4>
                  <p className="text-slate-600 leading-relaxed">
                    All rank-and-file employees who have worked for at least one (1) month during a calendar year, 
                    regardless of their position, designation, or employment status (regular, probationary, casual, fixed-term).
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-800 mb-1">2. Minimum Service Requirement</h4>
                  <p className="text-slate-600 leading-relaxed">
                    At least one (1) month of service within the calendar year. Employees resigning or separated prior to December 
                    are entitled to pro-rated 13th month pay upon separation.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-800 mb-1">3. Strict Deadline</h4>
                  <p className="text-slate-600 leading-relaxed">
                    Must be paid <span className="font-bold text-rose-700">not later than December 24</span> of each year. 
                    No exemptions or deferments are allowed by DOLE under any circumstances.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-800 mb-1">4. DOLE Establishment Compliance Reporting</h4>
                  <p className="text-slate-600 leading-relaxed">
                    Employers must submit a report of compliance to the nearest DOLE Regional Office 
                    not later than <span className="font-bold text-blue-700">January 15</span> of the following year via the DOLE Establishment Report System (ERS).
                  </p>
                </div>
              </div>
            </div>

            {/* Inclusions / Exclusions Detailed Matrix */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Building2 className="w-5 h-5 text-indigo-600" />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Components Matrix for Payroll Audit</h3>
                  <span className="text-xs text-slate-500">Verified against Labor Advisory No. 25</span>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <span className="font-bold text-emerald-800 block mb-1.5 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> INCLUDED in 13th Month Computation:
                  </span>
                  <ul className="space-y-1 text-slate-600 pl-3">
                    {DOLE_STATUTORY_GUIDELINES.inclusions.map((inc, i) => (
                      <li key={i} className="list-disc">
                        <strong className="text-slate-800">{inc.item}</strong>: {inc.description}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <span className="font-bold text-rose-800 block mb-1.5 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-rose-500" /> EXCLUDED from 13th Month Computation:
                  </span>
                  <ul className="space-y-1 text-slate-600 pl-3">
                    {DOLE_STATUTORY_GUIDELINES.exclusions.map((exc, i) => (
                      <li key={i} className="list-disc">
                        <strong className="text-slate-800">{exc.item}</strong>: {exc.description}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Official DOLE Compliance Report Preview (Prescribed Form) */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">
                  Official DOLE Form ERS-PD851
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  Report on Compliance with 13th-Month Pay Law (P.D. 851)
                </h3>
                <span className="text-xs text-slate-500">
                  Prescribed format for submission to DOLE Regional Office / Field Office on or before January 15, {selectedYear + 1}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadCsv}
                  className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5 text-blue-600" />
                  Export Annex Schedule (CSV)
                </button>
                <button
                  onClick={() => {
                    setShowDoleSubmittedToast(true);
                    setTimeout(() => setShowDoleSubmittedToast(false), 4000);
                  }}
                  className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Mark as Submitted to DOLE
                </button>
              </div>
            </div>

            {showDoleSubmittedToast && (
              <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-xl text-xs flex items-center justify-between">
                <span>DOLE Establishment Compliance Report marked as filed for {selectedYear} (Confirmation ref: DOLE-NCR-{selectedYear}-851-992).</span>
                <button onClick={() => setShowDoleSubmittedToast(false)} className="text-emerald-700 font-bold">×</button>
              </div>
            )}

            {/* Prescribed DOLE Form Document Container */}
            <div className="p-6 bg-slate-50/70 border border-slate-200 rounded-xl space-y-6 font-sans text-xs">
              <div className="text-center space-y-1 border-b border-slate-200 pb-4">
                <p className="font-bold text-slate-800 uppercase tracking-wide">Republic of the Philippines</p>
                <p className="font-black text-sm text-slate-900 uppercase">Department of Labor and Employment</p>
                <p className="text-[11px] text-slate-500">National Capital Region (NCR) - Regional Office</p>
                <p className="font-bold text-xs text-blue-800 uppercase pt-2">
                  ANNUAL REPORT OF COMPLIANCE WITH PRESIDENTIAL DECREE NO. 851
                </p>
                <p className="text-[11px] text-slate-500">For Calendar Year {selectedYear}</p>
              </div>

              {/* Establishment Particulars */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-2">
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[10px] block">1. Name of Establishment:</span>
                    <span className="font-semibold text-slate-800 text-sm">Kawayan Tech Philippines Inc.</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[10px] block">2. Principal Business Address:</span>
                    <span className="text-slate-700">Level 24, Cyberpark Tower 1, Cubao, Quezon City, Metro Manila</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[10px] block">3. Nature of Business / Industry:</span>
                    <span className="text-slate-700">Information Technology & Software Services</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[10px] block">4. Total Workforce / Employment:</span>
                    <span className="font-semibold text-slate-800">{summary.totalEmployees} Regular & Probationary Employees</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[10px] block">5. Total Covered Employees Benefited:</span>
                    <span className="font-semibold text-emerald-700">{summary.totalEmployees} Employees (100% Coverage)</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[10px] block">6. Total Amount of 13th-Month Pay Disbursed:</span>
                    <span className="font-black text-sm font-mono text-blue-800">
                      ₱{summary.totalPayableThirteenthMonth.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[10px] block">7. Date of Actual Payment / Disbursal:</span>
                    <span className="text-slate-700 font-medium">December 20, {selectedYear} (Prior to Dec 24 statutory deadline)</span>
                  </div>
                </div>
              </div>

              {/* Signatures block */}
              <div className="pt-6 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-8 text-center text-xs">
                <div className="space-y-8">
                  <div className="border-b border-slate-400 w-3/4 mx-auto pb-1">
                    <span className="font-bold text-slate-900 block">Maria Clara</span>
                    <span className="text-[11px] text-slate-500">Head of People & Human Resources</span>
                  </div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Prepared & Certified By</span>
                </div>

                <div className="space-y-8">
                  <div className="border-b border-slate-400 w-3/4 mx-auto pb-1">
                    <span className="font-bold text-slate-900 block">Juan Dela Cruz</span>
                    <span className="text-[11px] text-slate-500">Managing Director / Authorized Representative</span>
                  </div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Approved & Attested By</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: FORMAL 13TH MONTH PAYSLIP / PAYMENT VOUCHER */}
      {voucherModalRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
                  <Gift className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base">DOLE 13th Month Pay Voucher</h3>
                  <span className="text-xs text-slate-300">Statutory Certificate of Disbursal (P.D. 851)</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" /> Print
                </button>
                <button
                  onClick={() => setVoucherModalRecord(null)}
                  className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Voucher Body (Printable Formal Layout) */}
            <div className="p-6 space-y-5 text-xs text-slate-800">
              {/* Company & Employee Identity Banner */}
              <div className="border-b border-slate-200 pb-4 flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Employer</span>
                  <h4 className="font-black text-sm text-slate-900">KAWAYAN TECH PHILIPPINES INC.</h4>
                  <p className="text-[11px] text-slate-500">TIN: 009-876-543-000 • Quezon City, Philippines</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Voucher Ref</span>
                  <p className="font-mono font-bold text-slate-800">13TH-{selectedYear}-{voucherModalRecord.employeeId}</p>
                  <p className="text-[11px] text-slate-500">Date: Dec 20, {selectedYear}</p>
                </div>
              </div>

              {/* Employee Particulars Grid */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Employee Name</span>
                  <span className="font-bold text-slate-900 text-xs">{voucherModalRecord.employeeName}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Position & Dept</span>
                  <span className="text-slate-700 text-xs">{voucherModalRecord.role}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Date of Hire</span>
                  <span className="font-mono text-slate-700 text-xs">{voucherModalRecord.joinDate}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Active Service</span>
                  <span className="font-bold text-blue-700 text-xs">{voucherModalRecord.proRatedFraction} Months</span>
                </div>
              </div>

              {/* DOLE PD 851 Computation Breakdown */}
              <div className="space-y-2">
                <span className="font-bold text-slate-900 block">Statutory Computation Breakdown:</span>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="flex justify-between py-2 px-3 bg-slate-50 border-b border-slate-200">
                    <span className="text-slate-600">Total Basic Salary Earned (Jan - Dec {selectedYear})</span>
                    <span className="font-mono font-semibold text-slate-900">
                      ₱{voucherModalRecord.totalAnnualBasicEarned.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 px-3 border-b border-slate-100">
                    <span className="text-slate-600">Statutory Divisor (DOLE PD 851)</span>
                    <span className="font-mono font-semibold text-slate-900">÷ 12</span>
                  </div>
                  <div className="flex justify-between py-2.5 px-3 bg-blue-50/50 border-b border-slate-200 font-bold">
                    <span className="text-blue-900">Gross Calculated 13th Month Pay</span>
                    <span className="font-mono text-blue-900">
                      ₱{voucherModalRecord.rawCalculatedAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  {voucherModalRecord.midYearAdvanceDeducted > 0 && (
                    <div className="flex justify-between py-2 px-3 border-b border-slate-100 text-rose-600">
                      <span>Less: Mid-Year Payout Advance (June)</span>
                      <span className="font-mono font-semibold">
                        -₱{voucherModalRecord.midYearAdvanceDeducted.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between py-2 px-3 border-b border-slate-100 text-emerald-700">
                    <span>Tax-Exempt Portion (TRAIN Law Section 32(B)(7)(e) ≤ ₱90,000)</span>
                    <span className="font-mono font-semibold">
                      ₱{voucherModalRecord.taxExemptAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  {voucherModalRecord.taxableExcess > 0 && (
                    <>
                      <div className="flex justify-between py-2 px-3 border-b border-slate-100 text-amber-800">
                        <span>Taxable Excess (Amount over ₱90,000 cap)</span>
                        <span className="font-mono font-semibold">
                          ₱{voucherModalRecord.taxableExcess.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 px-3 border-b border-slate-100 text-purple-700">
                        <span>Less: BIR Withholding Tax on Excess</span>
                        <span className="font-mono font-semibold">
                          -₱{voucherModalRecord.estimatedWithholdingTax.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between py-3 px-3 bg-slate-900 text-white font-black text-sm">
                    <span>NET 13TH MONTH PAYOUT</span>
                    <span className="font-mono text-amber-400">
                      ₱{voucherModalRecord.netTakeHome.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Employee Acknowledgment */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-4 pt-4">
                <p className="text-[11px] text-slate-600 italic leading-relaxed">
                  "I hereby acknowledge receipt of the sum stated above as full and complete satisfaction of my 13th-month pay 
                  for the calendar year {selectedYear} in accordance with Presidential Decree No. 851 and its implementing rules."
                </p>

                <div className="flex justify-between items-end pt-3">
                  <div className="text-left">
                    <span className="text-[10px] text-slate-400 block uppercase">Disbursed Via</span>
                    <span className="font-bold text-slate-800">UnionBank Direct Payroll Credit</span>
                  </div>
                  <div className="text-center w-52">
                    <div className="border-b border-slate-400 pb-1 mb-1 font-bold text-slate-900">
                      {voucherModalRecord.employeeName}
                    </div>
                    <span className="text-[10px] text-slate-500 block uppercase tracking-wider">
                      Employee Signature & Date
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-between items-center">
              <span className="text-[11px] text-slate-500">
                DOLE Regional Office Form Annex • TRAIN Law Compliant
              </span>
              <button
                onClick={() => setVoucherModalRecord(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold transition-colors"
              >
                Close Voucher
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
