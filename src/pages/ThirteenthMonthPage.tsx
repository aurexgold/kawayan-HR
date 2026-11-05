import { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { mockEmployees } from '../data/mockData';
import { 
  calculateCompanyThirteenthMonthSummary, 
  generateDoleComplianceCsv,
  DOLE_STATUTORY_GUIDELINES,
  TAX_EXEMPTION_CEILING_TRAIN,
  ThirteenthMonthRecord
} from '../lib/thirteenth-month';
import { 
  Gift, Calendar, Download, FileText, Sliders, 
  ShieldCheck, AlertTriangle, Scale, DollarSign, 
  Building2, Printer, CheckCircle2, RefreshCw, Calculator, Table
} from 'lucide-react';
import { AnnualPayrollAggregator } from '../components/payroll/AnnualPayrollAggregator';
import { ThirteenthMonthCalculatorView } from '../components/payroll/ThirteenthMonthCalculatorView';
import { ThirteenthMonthReportsHub } from '../components/payroll/ThirteenthMonthReportsHub';

export function ThirteenthMonthPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as 'aggregator' | 'calculator' | 'reports' | 'compliance') || 'aggregator';
  const [activeTab, setActiveTab] = useState<'aggregator' | 'calculator' | 'reports' | 'compliance'>(initialTab);
  const [selectedYear, setSelectedYear] = useState<number>(2024);

  // Custom adjustments per employee (LWOP unpaid days & mid-year advances)
  const [employeeAdjustments, setEmployeeAdjustments] = useState<
    Record<string, { customUnpaidDays?: Record<number, number>; midYearAdvance?: number }>
  >({
    'emp-003': {
      customUnpaidDays: { 3: 2 }, // Jose Rizal 2 days LWOP in April
      midYearAdvance: 0,
    },
    'emp-005': {
      midYearAdvance: 40000, // Gabriela Silang took ₱40k advance in June
    }
  });

  // Calculate records and summary
  const { records, summary } = useMemo(() => {
    return calculateCompanyThirteenthMonthSummary(mockEmployees, selectedYear, employeeAdjustments);
  }, [selectedYear, employeeAdjustments]);

  // Adjust unpaid days handler
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

  // Adjust mid-year advance handler
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
      {/* Top Banner & Legal Authority */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-400 text-amber-950 flex items-center gap-1">
                <Gift className="w-3.5 h-3.5" /> Mandatory DOLE P.D. 851
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/30 text-blue-200 border border-blue-400/30">
                TRAIN Law ₱90,000 Tax-Free Cap
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Due on or before Dec 24
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight">
              13th-Month Pay Calculator & DOLE Report Generator
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Aggregates month-by-month basic payroll earnings for calendar year {selectedYear}, computes pro-rated 
              statutory 13th-month pay under Presidential Decree No. 851 (<span className="font-mono text-amber-300">Total Basic Earned ÷ 12</span>), 
              deducts unpaid absences (LWOP), applies the ₱90k TRAIN tax exemption ceiling, and generates official DOLE, BIR, and Bank remittance reports.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Statutory Deadline Counter */}
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

            {/* Year Switcher */}
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
              DOLE Master CSV
            </button>
          </div>
        </div>
      </div>

      {/* High-Level Statutory KPI Metric Cards */}
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
            TRAIN graduated tax
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

      {/* Primary Navigation Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-4 pt-2 gap-2 shadow-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('aggregator')}
          className={`py-3 px-4 font-bold text-sm border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'aggregator'
              ? 'border-blue-600 text-blue-700 bg-blue-50/60 rounded-t-lg'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Table className="w-4 h-4 text-blue-600" />
          Annual Payroll Aggregator & 12-Month Matrix
        </button>

        <button
          onClick={() => setActiveTab('calculator')}
          className={`py-3 px-4 font-bold text-sm border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'calculator'
              ? 'border-amber-600 text-amber-700 bg-amber-50/60 rounded-t-lg'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Calculator className="w-4 h-4 text-amber-600" />
          Automated P.D. 851 Simulator & Pro-Ration
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`py-3 px-4 font-bold text-sm border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'reports'
              ? 'border-emerald-600 text-emerald-800 bg-emerald-50/60 rounded-t-lg'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-4 h-4 text-emerald-600" />
          DOLE, BIR & Bank Report Generator
          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded ml-1">Official</span>
        </button>

        <button
          onClick={() => setActiveTab('compliance')}
          className={`py-3 px-4 font-bold text-sm border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'compliance'
              ? 'border-indigo-600 text-indigo-700 bg-indigo-50/60 rounded-t-lg'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Scale className="w-4 h-4 text-indigo-600" />
          Philippine Labor Standards & DOLE Checklist
        </button>
      </div>

      {/* Tab 1: Annual Payroll Aggregator */}
      {activeTab === 'aggregator' && (
        <AnnualPayrollAggregator
          employees={mockEmployees}
          selectedYear={selectedYear}
          records={records}
          employeeAdjustments={employeeAdjustments}
          onUpdateUnpaidDays={handleUpdateUnpaidDays}
          onUpdateMidYearAdvance={handleUpdateMidYearAdvance}
          onSelectEmployeeForInspector={(empId) => {
            setActiveTab('calculator');
          }}
        />
      )}

      {/* Tab 2: Interactive P.D. 851 Calculator */}
      {activeTab === 'calculator' && (
        <ThirteenthMonthCalculatorView
          employees={mockEmployees}
          onSelectEmployeeForInspector={(empId) => {
            setActiveTab('aggregator');
          }}
        />
      )}

      {/* Tab 3: Official Compliance Report Generator */}
      {activeTab === 'reports' && (
        <ThirteenthMonthReportsHub
          records={records}
          summary={summary}
          selectedYear={selectedYear}
        />
      )}

      {/* Tab 4: Philippine Labor Standards & DOLE Legal Hub */}
      {activeTab === 'compliance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Legal Foundation Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <Scale className="w-6 h-6 text-blue-600" />
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Presidential Decree No. 851 & Revised Rules</h3>
                  <span className="text-xs text-slate-500">Philippine Mandatory 13th-Month Pay Law</span>
                </div>
              </div>

              <div className="space-y-3 text-xs leading-relaxed text-slate-700">
                <p>
                  <strong>1. Mandatory Coverage:</strong> Presidential Decree No. 851 requires all employers in the Philippines to pay their rank-and-file employees a 13th-month pay regardless of the nature of their employment, and irrespective of the method by which their wages are paid, provided they have worked for at least one (1) month during a calendar year.
                </p>
                <p>
                  <strong>2. Minimum Service Period:</strong> An employee is entitled to 13th-month pay if they rendered at least one (1) month of service within the calendar year. Mid-year hires or separated employees receive a strictly pro-rated amount (Total Basic Wages Earned / 12).
                </p>
                <p>
                  <strong>3. Strict Disbursal Deadline:</strong> The 13th-month pay must be paid <strong className="text-rose-700">not later than December 24</strong> of every year. Employers may pay one-half (1/2) before the opening of the regular school year (May/June) and the remainder on or before December 24.
                </p>
                <p>
                  <strong>4. Non-Exemption:</strong> No exemptions or deferments are allowed by DOLE under any circumstances, including business losses, financial crises, or calamities.
                </p>
                <p>
                  <strong>5. Mandatory DOLE Reporting:</strong> Every employer must submit an annual report of compliance to the nearest DOLE Regional Office not later than <strong className="text-blue-700">January 15</strong> of the following year through the DOLE Establishment Report System (reports.dole.gov.ph).
                </p>
              </div>
            </div>

            {/* Inclusions vs Exclusions Matrix */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <Building2 className="w-6 h-6 text-emerald-600" />
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Inclusions vs. Exclusions Reference Matrix</h3>
                  <span className="text-xs text-slate-500">Verified against DOLE Labor Advisory No. 25</span>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <span className="font-bold text-emerald-800 block mb-1.5 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> INCLUDED in 13th Month Computation (Basic Salary):
                  </span>
                  <ul className="space-y-1.5 text-slate-600 pl-3">
                    {DOLE_STATUTORY_GUIDELINES.inclusions.map((inc, i) => (
                      <li key={i} className="list-disc">
                        <strong className="text-slate-800">{inc.item}</strong>: {inc.description}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <span className="font-bold text-rose-800 block mb-1.5 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> EXCLUDED from 13th Month Computation:
                  </span>
                  <ul className="space-y-1.5 text-slate-600 pl-3">
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

          {/* TRAIN Law Tax Exemption Section */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-purple-600" />
              <h3 className="font-bold text-slate-900 text-sm">
                Republic Act No. 10963 (TRAIN Law) Section 32(B)(7)(e) Tax Ceiling
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Under the Tax Reform for Acceleration and Inclusion (TRAIN Law), the exclusion from gross income of 13th-month pay 
              and other benefits received by officials and employees of public and private entities has been raised to <strong className="text-slate-900">₱90,000.00</strong>. 
              Any amount in excess of ₱90,000.00 shall form part of the employee's taxable compensation income and is subjected to the graduated withholding tax tables 
              and reported under Box 33 of BIR Form 2316.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
