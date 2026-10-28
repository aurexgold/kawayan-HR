import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  AlertTriangle, ShieldCheck, HeartPulse, Home, Scale, 
  Calendar, Clock, CheckCircle2, ChevronRight, Info, 
  Download, ArrowUpRight, HelpCircle, AlertCircle, FileText,
  ExternalLink, Check, RefreshCw
} from 'lucide-react';
import { mockEmployees } from '../../data/mockData';
import { calculateContributions } from '../../lib/ph-payroll';

export type FilingStatus = 'pending' | 'generated' | 'remitted';

export interface GovDeadline {
  id: string;
  agency: 'SSS' | 'PhilHealth' | 'Pag-IBIG' | 'BIR';
  title: string;
  formNumber: string;
  legalBasis: string;
  dueDate: string; // e.g. "2026-11-10"
  formattedDueDate: string; // e.g. "Nov 10, 2026"
  daysRemaining: number;
  statutoryRule: string;
  eeAmount: number;
  erAmount: number;
  totalAmount: number;
  status: FilingStatus;
  prnNumber?: string;
  portalUrl: string;
  portalName: string;
  penaltyNotice: string;
}

export function GovDeadlinesAlertWidget() {
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [selectedAgencyGuide, setSelectedAgencyGuide] = useState<GovDeadline | null>(null);

  // Compute live statutory liabilities across all active employees
  const totals = useMemo(() => {
    return mockEmployees.reduce((acc, emp) => {
      const res = calculateContributions(emp.basicSalary);
      acc.sssEE += res.sss;
      acc.sssER += res.sssER;
      acc.phEE += res.philhealth;
      acc.phER += res.philhealthER;
      acc.hdmfEE += res.pagibig;
      acc.hdmfER += res.pagibigER;
      acc.birTax += res.withholdingTax;
      acc.grossTotal += emp.basicSalary;
      return acc;
    }, {
      sssEE: 0,
      sssER: 0,
      phEE: 0,
      phER: 0,
      hdmfEE: 0,
      hdmfER: 0,
      birTax: 0,
      grossTotal: 0
    });
  }, []);

  // Track interactive status of each agency filing for this cycle
  const [filingStatuses, setFilingStatuses] = useState<Record<string, FilingStatus>>({
    'bir-1601c': 'pending',
    'philhealth-eprs': 'pending',
    'pagibig-mcrf': 'generated',
    'sss-r3': 'pending'
  });

  const [prnInputs, setPrnInputs] = useState<Record<string, string>>({
    'bir-1601c': 'BIR-EFPS-202610-891',
    'philhealth-eprs': 'EPRS-SPA-9941203',
    'pagibig-mcrf': 'PAGIBIG-PBR-771239',
    'sss-r3': 'PRN-2610-4491-0021'
  });

  const toggleStatus = (id: string) => {
    setFilingStatuses(prev => {
      const current = prev[id] || 'pending';
      const next: FilingStatus = current === 'pending' ? 'generated' : current === 'generated' ? 'remitted' : 'pending';
      return { ...prev, [id]: next };
    });
  };

  // Philippine Statutory Deadlines definition
  const deadlines: GovDeadline[] = [
    {
      id: 'bir-1601c',
      agency: 'BIR',
      title: 'Monthly Withholding Tax on Compensation',
      formNumber: 'BIR Form 1601-C',
      legalBasis: 'National Internal Revenue Code (NIRC) / RA 10963 TRAIN Law',
      dueDate: '2026-11-10',
      formattedDueDate: 'Nov 10, 2026',
      daysRemaining: 14,
      statutoryRule: 'Due on or before the 10th day of the month following compensation month (eFPS Group E: Nov 11–15)',
      eeAmount: totals.birTax,
      erAmount: 0,
      totalAmount: totals.birTax,
      status: filingStatuses['bir-1601c'],
      prnNumber: prnInputs['bir-1601c'],
      portalUrl: 'https://efps.bir.gov.ph',
      portalName: 'BIR eFPS / eBIRForms Portal',
      penaltyNotice: '25% surcharge + 12% interest per annum + compromise penalties for late remittance.'
    },
    {
      id: 'philhealth-eprs',
      agency: 'PhilHealth',
      title: 'Electronic Premium Reporting System (EPRS)',
      formNumber: 'PhilHealth Form RF-1 / SPA',
      legalBasis: 'Universal Health Care Act (RA 11223) - 5.0% Premium Contribution',
      dueDate: '2026-11-15',
      formattedDueDate: 'Nov 15, 2026',
      daysRemaining: 19,
      statutoryRule: 'Regular private employers must remit between the 10th and 15th calendar day of the following month',
      eeAmount: totals.phEE,
      erAmount: totals.phER,
      totalAmount: totals.phEE + totals.phER,
      status: filingStatuses['philhealth-eprs'],
      prnNumber: prnInputs['philhealth-eprs'],
      portalUrl: 'https://eprs01.philhealth.gov.ph',
      portalName: 'PhilHealth EPRS Portal',
      penaltyNotice: '1.5% interest per month for each month of delay under RA 11223.'
    },
    {
      id: 'pagibig-mcrf',
      agency: 'Pag-IBIG',
      title: 'Monthly Contribution Remittance (MCR)',
      formNumber: 'Pag-IBIG Form H1-1 / e-SRS',
      legalBasis: 'Pag-IBIG Circular No. 460 - Mandatory Remittance (₱10k MFS)',
      dueDate: '2026-11-15',
      formattedDueDate: 'Nov 15, 2026',
      daysRemaining: 19,
      statutoryRule: 'Grouped alphabetically by employer registered name: "Kawayan HR" begins with K (Group E–L) = 15th of the month',
      eeAmount: totals.hdmfEE,
      erAmount: totals.hdmfER,
      totalAmount: totals.hdmfEE + totals.hdmfER,
      status: filingStatuses['pagibig-mcrf'],
      prnNumber: prnInputs['pagibig-mcrf'],
      portalUrl: 'https://www.pagibigfundservices.com',
      portalName: 'Virtual Pag-IBIG for Employers',
      penaltyNotice: 'Penalty of 1/10th of 1% per day of delay (3% per month) under RA 9679.'
    },
    {
      id: 'sss-r3',
      agency: 'SSS',
      title: 'Monthly Contributions & Collection List',
      formNumber: 'SSS Form R-3 / R-5 (PRN)',
      legalBasis: 'Social Security Act of 2018 (RA 11199) - 14% Contribution + WISP + EC',
      dueDate: '2026-11-30',
      formattedDueDate: 'Nov 30, 2026',
      daysRemaining: 34,
      statutoryRule: 'Due on the last calendar day of the month following the applicable month (or based on 10th digit of SSS ID)',
      eeAmount: totals.sssEE,
      erAmount: totals.sssER,
      totalAmount: totals.sssEE + totals.sssER,
      status: filingStatuses['sss-r3'],
      prnNumber: prnInputs['sss-r3'],
      portalUrl: 'https://member.sss.gov.ph',
      portalName: 'My.SSS Employer Portal',
      penaltyNotice: '2% penalty per month plus potential criminal liability under Section 28 of RA 11199.'
    }
  ];

  const totalLiability = deadlines.reduce((sum, d) => sum + d.totalAmount, 0);
  const remittedCount = deadlines.filter(d => d.status === 'remitted').length;
  const pendingCount = deadlines.filter(d => d.status === 'pending').length;
  const generatedCount = deadlines.filter(d => d.status === 'generated').length;

  const exportScheduleCSV = () => {
    const headers = [
      'Agency',
      'Filing Name',
      'Form Number',
      'Statutory Due Date',
      'Days Remaining',
      'Employee Share (PHP)',
      'Employer Share (PHP)',
      'Total Remittance (PHP)',
      'Filing Status',
      'Reference Number / PRN',
      'Statutory Rule'
    ];

    const rows = deadlines.map(d => [
      `"${d.agency}"`,
      `"${d.title}"`,
      `"${d.formNumber}"`,
      `"${d.formattedDueDate}"`,
      d.daysRemaining,
      d.eeAmount.toFixed(2),
      d.erAmount.toFixed(2),
      d.totalAmount.toFixed(2),
      `"${d.status.toUpperCase()}"`,
      `"${d.prnNumber || 'N/A'}"`,
      `"${d.statutoryRule}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `PH_Government_Remittance_Deadlines_October_2026.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8">
      {/* Alert Banner / Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg">
                <AlertTriangle className="w-5 h-5 animate-pulse" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-white tracking-tight">
                    PH Statutory Filing & Remittance Deadlines
                  </h2>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-red-500/90 text-white px-2 py-0.5 rounded-full shadow-xs">
                    Action Required
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Philippine Statutory Calendar • Cycle: <span className="font-semibold text-amber-300">October 2026 Payroll</span> (Due in November)
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setShowGuideModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all backdrop-blur-xs"
            >
              <HelpCircle className="w-3.5 h-3.5 text-blue-300" />
              Statutory Rules Guide
            </button>
            <button
              onClick={exportScheduleCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all backdrop-blur-xs"
            >
              <Download className="w-3.5 h-3.5 text-emerald-300" />
              Export Schedule (CSV)
            </button>
            <Link
              to="/payroll?tab=remittance"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-all"
            >
              Open Remittance Register
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Company Remittance Aggregate Metric Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-700/60">
          <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-2.5">
            <div className="text-[11px] text-slate-400 font-medium">Total Statutory Due</div>
            <div className="text-lg font-bold font-mono text-emerald-400">
              ₱{totalLiability.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Across 4 Government Agencies</div>
          </div>

          <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-2.5">
            <div className="text-[11px] text-slate-400 font-medium">Nearest Deadline</div>
            <div className="text-lg font-bold font-mono text-amber-300">
              Nov 10, 2026
            </div>
            <div className="text-[10px] text-amber-200/80 mt-0.5">BIR Form 1601-C (14 days)</div>
          </div>

          <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-2.5">
            <div className="text-[11px] text-slate-400 font-medium">Filing Progress</div>
            <div className="text-lg font-bold font-mono text-white flex items-center gap-1.5">
              <span>{remittedCount} of 4</span>
              <span className="text-xs font-normal text-slate-400">({Math.round((remittedCount / 4) * 100)}%)</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {remittedCount === 4 ? 'All Remitted' : `${pendingCount} Pending • ${generatedCount} Drafted`}
            </div>
          </div>

          <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-2.5">
            <div className="text-[11px] text-slate-400 font-medium">Holiday Rollover Alert</div>
            <div className="text-xs font-bold text-blue-300 mt-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 shrink-0 text-blue-400" />
              <span>Nov 30 (Bonifacio Day)</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              SSS rolls to Dec 1 if banking holiday
            </div>
          </div>
        </div>
      </div>

      {/* Deadline Cards Grid */}
      <div className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {deadlines.map(deadline => {
            const isBir = deadline.agency === 'BIR';
            const isPh = deadline.agency === 'PhilHealth';
            const isHdmf = deadline.agency === 'Pag-IBIG';
            const isSss = deadline.agency === 'SSS';

            const agencyTheme = isBir
              ? { border: 'border-purple-200', bg: 'bg-purple-50/40', badge: 'bg-purple-100 text-purple-800', icon: Scale, color: 'text-purple-600' }
              : isPh
              ? { border: 'border-emerald-200', bg: 'bg-emerald-50/40', badge: 'bg-emerald-100 text-emerald-800', icon: HeartPulse, color: 'text-emerald-600' }
              : isHdmf
              ? { border: 'border-amber-200', bg: 'bg-amber-50/40', badge: 'bg-amber-100 text-amber-800', icon: Home, color: 'text-amber-600' }
              : { border: 'border-blue-200', bg: 'bg-blue-50/40', badge: 'bg-blue-100 text-blue-800', icon: ShieldCheck, color: 'text-blue-600' };

            const Icon = agencyTheme.icon;

            return (
              <div 
                key={deadline.id}
                className={`rounded-xl border ${agencyTheme.border} ${agencyTheme.bg} p-4 flex flex-col justify-between transition-all hover:shadow-md relative`}
              >
                <div>
                  {/* Agency Header & Days Badge */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg bg-white border ${agencyTheme.border} shadow-xs`}>
                        <Icon className={`w-5 h-5 ${agencyTheme.color}`} />
                      </div>
                      <div>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${agencyTheme.badge}`}>
                          {deadline.agency}
                        </span>
                        <h3 className="font-bold text-sm text-slate-900 leading-tight mt-0.5">
                          {deadline.formNumber}
                        </h3>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md ${
                        deadline.status === 'remitted'
                          ? 'bg-emerald-100 text-emerald-800'
                          : deadline.daysRemaining <= 14
                          ? 'bg-rose-100 text-rose-800 animate-pulse'
                          : deadline.daysRemaining <= 20
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        <Clock className="w-3 h-3" />
                        {deadline.status === 'remitted' ? 'Remitted' : `Due in ${deadline.daysRemaining}d`}
                      </span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div className="text-xs font-medium text-slate-700 line-clamp-1 mb-1">
                    {deadline.title}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed mb-3 line-clamp-2" title={deadline.statutoryRule}>
                    {deadline.statutoryRule}
                  </p>

                  {/* Financial Breakdown Card */}
                  <div className="bg-white/90 rounded-lg p-3 border border-slate-200/80 mb-3 space-y-1.5 text-xs shadow-2xs">
                    <div className="flex justify-between items-center text-slate-500">
                      <span>Statutory Due Date:</span>
                      <span className="font-bold text-slate-900 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {deadline.formattedDueDate}
                      </span>
                    </div>

                    {deadline.erAmount > 0 ? (
                      <>
                        <div className="flex justify-between items-center text-slate-600 text-[11px]">
                          <span>Employee Share (EE):</span>
                          <span className="font-mono">₱{deadline.eeAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-600 text-[11px]">
                          <span>Employer Share (ER):</span>
                          <span className="font-mono">₱{deadline.erAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex justify-between items-center text-slate-600 text-[11px]">
                        <span>Total Tax Withheld (EE):</span>
                        <span className="font-mono">₱{deadline.eeAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    )}

                    <div className="pt-1.5 border-t border-slate-100 flex justify-between items-center font-bold text-slate-900 text-xs">
                      <span>Total Remittance:</span>
                      <span className="font-mono text-emerald-700 text-sm">
                        ₱{deadline.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  {/* Reference / PRN Number Box */}
                  <div className="mb-3">
                    <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center justify-between mb-1">
                      <span>Reference / PRN Number</span>
                      <span className="text-[9px] text-slate-400 lowercase">e-gov tracking</span>
                    </label>
                    <input
                      type="text"
                      value={prnInputs[deadline.id] || ''}
                      onChange={(e) => setPrnInputs(prev => ({ ...prev, [deadline.id]: e.target.value }))}
                      placeholder="Enter PRN / SPA / Form Ref"
                      className="w-full text-xs font-mono px-2.5 py-1.5 bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800"
                    />
                  </div>
                </div>

                {/* Status Toggle & Actions */}
                <div className="space-y-2 pt-2 border-t border-slate-200/60">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 text-[11px]">Filing Status:</span>
                    <button
                      onClick={() => toggleStatus(deadline.id)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                        deadline.status === 'remitted'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : deadline.status === 'generated'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                      }`}
                      title="Click to cycle status: Pending -> Generated -> Remitted"
                    >
                      {deadline.status === 'remitted' ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-white" />
                          Remitted & Cleared
                        </>
                      ) : deadline.status === 'generated' ? (
                        <>
                          <RefreshCw className="w-3 h-3 text-white" />
                          PRN Ready for Payment
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3 text-slate-500" />
                          Pending Generation
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5 pt-1">
                    <button
                      onClick={() => setSelectedAgencyGuide(deadline)}
                      className="flex-1 text-center py-1.5 px-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs rounded-md shadow-2xs transition-colors flex items-center justify-center gap-1"
                    >
                      <Info className="w-3.5 h-3.5 text-blue-600" />
                      Filing Steps
                    </button>
                    <Link
                      to="/payroll?tab=remittance"
                      className="py-1.5 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-md transition-colors flex items-center justify-center"
                      title="View in Payroll Remittance Breakdown"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Proactive Philippine Labor & Banking Advisory Note */}
        <div className="mt-4 p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Philippine Statutory Banking Rule (Art. 13 PH Civil Code):</span>{' '}
              When a statutory filing deadline falls on a Saturday, Sunday, or official Non-Working Holiday, payment and submission may be remitted on the next regular banking business day without penalty.
            </div>
          </div>
          <Link
            to="/holidays"
            className="shrink-0 text-amber-800 hover:text-amber-950 font-bold underline text-xs flex items-center gap-1"
          >
            Check 2026 Holiday Calendar
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Statutory Rules & Calendar Guide Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Philippine Statutory Remittance Calendar Rules</h3>
                  <p className="text-xs text-slate-500">Official guidelines and formulas for employer filing schedules</p>
                </div>
              </div>
              <button 
                onClick={() => setShowGuideModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700 leading-relaxed">
              {/* SSS Rule */}
              <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/30 space-y-1.5">
                <div className="font-bold text-sm text-blue-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  Social Security System (SSS) — RA 11199
                </div>
                <p>
                  <strong>Regular Remittance Schedule:</strong> Contributions for the applicable month must be remitted on or before the <strong>last day of the month following the applicable month</strong>.
                </p>
                <p className="text-slate-600">
                  <em>Staggered Schedule Alternative:</em> For employers with high volume, SSS permits remittance based on the 10th digit of the employer ID (ending in 1-2: 10th day, 3-4: 15th day, 5-6: 20th day, 7-8: 25th day, 9-0: end of month). For Kawayan HR, standard monthly cycle is scheduled for the last calendar day.
                </p>
                <p className="text-red-700 font-medium">
                  <strong>Late SSS Penalty:</strong> 2% penalty per month or fraction thereof from date due until paid.
                </p>
              </div>

              {/* PhilHealth Rule */}
              <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/30 space-y-1.5">
                <div className="font-bold text-sm text-emerald-900 flex items-center gap-2">
                  <HeartPulse className="w-4 h-4 text-emerald-600" />
                  Philippine Health Insurance Corp (PhilHealth) — RA 11223
                </div>
                <p>
                  <strong>EPRS Filing Window:</strong> Contributions are due between the <strong>10th and 15th calendar day</strong> of the month following the applicable payroll month.
                </p>
                <p className="text-slate-600">
                  Employers submit the Statement of Premium Account (SPA) through the electronic EPRS portal and remit payment through accredited collection agents or online bank gateways.
                </p>
                <p className="text-red-700 font-medium">
                  <strong>Late PhilHealth Penalty:</strong> 1.5% interest per month for each month of delay.
                </p>
              </div>

              {/* Pag-IBIG Rule */}
              <div className="p-4 rounded-xl border border-amber-100 bg-amber-50/30 space-y-1.5">
                <div className="font-bold text-sm text-amber-900 flex items-center gap-2">
                  <Home className="w-4 h-4 text-amber-600" />
                  Pag-IBIG / HDMF — Circular No. 460 & RA 9679
                </div>
                <p>
                  <strong>Alphabetical Employer Schedule:</strong> Pag-IBIG sets remittance due dates based on the first letter of the employer's registered name:
                </p>
                <div className="grid grid-cols-2 gap-2 my-2 font-mono text-[11px] bg-white p-2.5 rounded-lg border border-amber-200">
                  <div>• Letters A to D: 10th day</div>
                  <div className="font-bold text-amber-900">• Letters E to L: 15th day (Kawayan HR)</div>
                  <div>• Letters M to Q: 20th day</div>
                  <div>• Letters R to Z / 0-9: 25th day</div>
                </div>
                <p className="text-red-700 font-medium">
                  <strong>Late Pag-IBIG Penalty:</strong> 1/10th of 1% per day of delay (equivalent to 3% per month).
                </p>
              </div>

              {/* BIR Rule */}
              <div className="p-4 rounded-xl border border-purple-100 bg-purple-50/30 space-y-1.5">
                <div className="font-bold text-sm text-purple-900 flex items-center gap-2">
                  <Scale className="w-4 h-4 text-purple-600" />
                  Bureau of Internal Revenue (BIR) — Form 1601-C
                </div>
                <p>
                  <strong>Monthly Remittance Return of Income Taxes:</strong>
                </p>
                <ul className="list-disc pl-4 space-y-1 text-slate-600">
                  <li><strong>Manual Filing / Non-eFPS:</strong> On or before the <strong>10th day</strong> of the month following the month of withholding.</li>
                  <li><strong>eFPS Staggered Filing:</strong> Group E: 11th day; Group D: 12th day; Group C: 13th day; Group B: 14th day; Group A: 15th day.</li>
                </ul>
                <p className="text-red-700 font-medium">
                  <strong>Late BIR Penalty:</strong> 25% surcharge + 12% annual interest + compromise penalty.
                </p>
              </div>

              {/* Civil Code Holiday Rule */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                <div className="font-bold text-slate-800">Legal Precedent on Weekends and Holidays</div>
                <p className="text-slate-600">
                  Pursuant to Article 13 of the Civil Code of the Philippines and standard administrative regulations, if a mandatory deadline falls on a Saturday, Sunday, or official Philippine national holiday, the filing and remittance may be validly performed on the next regular business day without incurring surcharge or interest.
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setShowGuideModal(false)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg font-bold text-xs hover:bg-slate-800 transition-colors"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Individual Agency Filing Steps Modal */}
      {selectedAgencyGuide && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-slate-900">{selectedAgencyGuide.agency} Filing Instructions</span>
              </div>
              <button 
                onClick={() => setSelectedAgencyGuide(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="text-[11px] text-slate-500">Official Form & Legal Basis</div>
                <div className="font-bold text-sm text-slate-900">{selectedAgencyGuide.formNumber}</div>
                <div className="text-slate-600 text-[11px] mt-0.5">{selectedAgencyGuide.legalBasis}</div>
              </div>

              <div className="space-y-2">
                <div className="font-bold text-slate-900">Step-by-Step Remittance Procedure:</div>
                <ol className="list-decimal pl-4 space-y-2 text-slate-600">
                  <li>
                    <strong>Verify Payroll Aggregates:</strong> Ensure all employee contributions match the current payroll cycle (Total: <span className="font-mono font-bold text-slate-900">₱{selectedAgencyGuide.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>).
                  </li>
                  <li>
                    <strong>Access Online Portal:</strong> Visit the official portal ({selectedAgencyGuide.portalName}).
                  </li>
                  <li>
                    <strong>Generate Billing / PRN:</strong> Upload or input the employee contribution list to generate the official Payment Reference Number (PRN / SPA).
                  </li>
                  <li>
                    <strong>Remit via Authorized Agent Bank:</strong> Pay via BancNet, Landbank, GCash, or designated partner bank before the deadline (<span className="font-bold text-slate-900">{selectedAgencyGuide.formattedDueDate}</span>).
                  </li>
                  <li>
                    <strong>Save & Archive Confirmation:</strong> Record the official receipt / validation number in Kawayan HR for audit compliance.
                  </li>
                </ol>
              </div>

              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800">
                <div className="font-bold text-[11px]">Statutory Penalty Warning</div>
                <div className="text-[11px] mt-0.5">{selectedAgencyGuide.penaltyNotice}</div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <a
                href={selectedAgencyGuide.portalUrl}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:text-blue-800 font-bold text-xs inline-flex items-center gap-1"
              >
                Go to {selectedAgencyGuide.agency} Portal
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => setSelectedAgencyGuide(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg font-bold text-xs hover:bg-slate-800 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
