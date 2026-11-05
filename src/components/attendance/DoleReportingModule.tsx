import { useState, useMemo, useEffect } from 'react';
import { 
  FileSpreadsheet, Download, ShieldCheck, Printer, CheckCircle2, 
  Search, Calendar, Clock, AlertCircle, FileText, Filter, 
  ExternalLink, ChevronDown, ChevronUp, Sparkles, Building2, User,
  PenTool, Award
} from 'lucide-react';
import { mockEmployees } from '../../data/mockData';
import { 
  generateDoleMandatedLogs, 
  calculateDoleAuditSummary, 
  generateDoleCsvString, 
  downloadDoleCsv, 
  DoleEmployeeLog, 
  DayClassification 
} from '../../lib/dole-reporting';
import { DolePrintableReportModal } from './DolePrintableReportModal';
import { ESignatureModal, DigitalSignatureData } from '../common/ESignatureModal';
import { signatureRepository, AuthorizedSignatory } from '../../lib/signature-repository';
import { SignaturePickerModal } from '../signatures/SignaturePickerModal';

export function DoleReportingModule() {
  const [selectedPeriod, setSelectedPeriod] = useState<'current' | 'previous'>('current');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('all');
  const [selectedClassification, setSelectedClassification] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [showSignModal, setShowSignModal] = useState<boolean>(false);
  const [showPickerModal, setShowPickerModal] = useState<boolean>(false);
  
  // Resolve default DOLE signatory from repository
  const resolveRepoDoleSignature = (): DigitalSignatureData | null => {
    const res = signatureRepository.resolveSignatureForDocument('dole');
    if (!res.signatory) return null;
    return {
      signatureDataUrl: res.signatory.signatureDataUrl,
      signerName: res.signatory.fullName,
      signerTitle: res.signatory.title,
      accreditationNo: res.signatory.doleAccreditationNo || res.signatory.prcLicenseNo || 'DOLE-OSH-NCR-2023-0881',
      signedAt: res.signingDate,
      verificationHash: res.verificationHash,
      signatureType: res.signatory.signatureType === 'drawn' ? 'drawn' : 'typed',
      companyName: 'Kawayan HR Philippines Inc.',
    };
  };

  const [signature, setSignature] = useState<DigitalSignatureData | null>(() => resolveRepoDoleSignature());
  const [showGuidance, setShowGuidance] = useState<boolean>(false);

  // Sync with repository changes
  useEffect(() => {
    const sync = () => {
      setSignature(resolveRepoDoleSignature());
    };
    return signatureRepository.subscribe(sync);
  }, []);

  // Date range
  const periodDates = selectedPeriod === 'current' 
    ? { start: '2026-10-16', end: '2026-10-31', text: 'October 16 - October 31, 2026 (2nd Half Cut-off)' }
    : { start: '2026-10-01', end: '2026-10-15', text: 'October 1 - October 15, 2026 (1st Half Cut-off)' };

  // Generate logs
  const allLogs = useMemo(() => {
    return generateDoleMandatedLogs(mockEmployees, periodDates.start, periodDates.end);
  }, [periodDates.start, periodDates.end]);

  // Filter logs
  const filteredLogs = useMemo(() => {
    return allLogs.filter(log => {
      const matchEmp = selectedEmployeeId === 'all' || log.employeeId === selectedEmployeeId;
      const matchClass = selectedClassification === 'all' || 
        (selectedClassification === 'overtime' ? log.overtimeHours > 0 : log.dayClassification === selectedClassification);
      const matchSearch = searchTerm === '' || 
        log.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.date.includes(searchTerm);
      return matchEmp && matchClass && matchSearch;
    });
  }, [allLogs, selectedEmployeeId, selectedClassification, searchTerm]);

  // Audit summary
  const summary = useMemo(() => {
    return calculateDoleAuditSummary(filteredLogs);
  }, [filteredLogs]);

  // CSV Downloads
  const handleDownloadPopulatedCsv = () => {
    let csv = generateDoleCsvString(filteredLogs, 'populated');
    if (signature) {
      const signatureBanner = [
        `"# --- DOLE MANDATED DIGITAL E-SIGNATURE VERIFICATION SEAL ---"`,
        `"# Signatory: ${signature.signerName} (${signature.signerTitle})"`,
        `"# Accreditation: ${signature.accreditationNo}"`,
        `"# Signed At: ${signature.signedAt}"`,
        `"# Tamper-Evident Hash: ${signature.verificationHash}"`,
        `"# Statutory Basis: Republic Act 8792 (E-Commerce Act) / DOLE D.O. 198-18 (OSH Standards)"`,
        `"# -----------------------------------------------------------"`,
        ``
      ].join('\r\n');
      csv = signatureBanner + csv;
    }
    const filename = `DOLE_Mandated_Employee_Logs_${periodDates.start}_to_${periodDates.end}.csv`;
    downloadDoleCsv(csv, filename);
  };

  const handleDownloadTemplateCsv = () => {
    const csv = generateDoleCsvString([], 'blankTemplate');
    const filename = `DOLE_Compliant_Employee_Logs_Template_Specification.csv`;
    downloadDoleCsv(csv, filename);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-6 text-white shadow-lg border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-blue-500/10 to-transparent pointer-events-none" />
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 relative z-10">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-semibold border border-blue-400/30">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                DOLE General Labor Standards (GLS) Rule 1020 / Book III
              </div>
              {signature ? (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-semibold border border-emerald-400/30">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  E-Signed by {signature.signerName}
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/20 text-amber-300 rounded-full text-xs font-semibold border border-amber-400/30">
                  <PenTool className="w-3.5 h-3.5 text-amber-400" />
                  Pending HR E-Sign
                </div>
              )}
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              DOLE Mandated Employee Logs & Timesheet Reporting
            </h2>
            <p className="text-sm text-slate-300">
              Generates labor-inspected, audit-ready daily time records compliant with Philippine Labor Code provisions on the 8-hour workday, mandatory 60-minute meal intervals, overtime authorization, night shift differentials, and weekly rest days.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowPickerModal(true)}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors shadow-xs"
              title="Select or change authorized signatory from Central Signature Repository"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Signatory: {signature ? signature.signerName.split(' ')[0] : 'Auto'}</span>
            </button>
            <button
              onClick={() => setShowSignModal(true)}
              className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-lg flex items-center gap-2 transition-all shadow-md ring-2 ring-blue-400/20"
              title="Sign mandated logs digitally with official DOLE accreditation"
            >
              <PenTool className="w-4 h-4 text-white" />
              {signature ? 'Custom Draw / E-Sign' : 'E-Sign Mandated Logs'}
            </button>
            <button
              onClick={handleDownloadTemplateCsv}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-2 transition-colors shadow-xs"
              title="Download standardized empty CSV template with field definitions and sample rows"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              Blank Template (CSV)
            </button>
            <button
              onClick={handleDownloadPopulatedCsv}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors shadow-sm"
              title="Download current period mandated logs with all employee entries formatted for DOLE inspection"
            >
              <Download className="w-4 h-4" />
              {signature ? 'Download Signed CSV' : 'Download Logs (CSV)'}
            </button>
            <button
              onClick={() => setShowPrintModal(true)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors shadow-sm"
            >
              <Printer className="w-4 h-4" />
              Inspect & Print Form DTR-GLS
            </button>
          </div>
        </div>
      </div>

      {/* Statutory Audit KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Logs Filed</span>
          <span className="text-xl font-black text-slate-900 font-mono mt-1 block">{summary.totalRecords}</span>
          <span className="text-[10px] text-slate-500">{mockEmployees.length} registered staff</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">Regular Work Hours</span>
          <span className="text-xl font-black text-blue-700 font-mono mt-1 block">{summary.totalRegularHours} hrs</span>
          <span className="text-[10px] text-slate-400">Max 8 hrs/day (Art. 83)</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block">Authorized Overtime</span>
          <span className="text-xl font-black text-indigo-700 font-mono mt-1 block">{summary.totalOvertimeHours} hrs</span>
          <span className="text-[10px] text-slate-400">+25% OT rate (Art. 87)</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 block">Night Differential</span>
          <span className="text-xl font-black text-purple-700 font-mono mt-1 block">{summary.totalNightDiffHours} hrs</span>
          <span className="text-[10px] text-slate-400">10PM - 6AM (Art. 86)</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block">Rest Day / Holiday</span>
          <span className="text-xl font-black text-amber-700 font-mono mt-1 block">{(summary.totalRestDayHours + summary.totalHolidayHours).toFixed(1)} hrs</span>
          <span className="text-[10px] text-slate-400">130% / 200% rate</span>
        </div>

        <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">DOLE GLS Status</span>
          <span className="text-base font-black text-emerald-700 mt-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            100% Audit Ready
          </span>
          <span className="text-[10px] text-emerald-600">All rules verified</span>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
          {/* Pay Period & Cut-Off Selector */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="text-xs font-bold text-slate-700">Payroll Cut-Off:</span>
            <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
              <button
                onClick={() => setSelectedPeriod('current')}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  selectedPeriod === 'current'
                    ? 'bg-white text-blue-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Oct 16 - 31, 2026 (2nd Half)
              </button>
              <button
                onClick={() => setSelectedPeriod('previous')}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  selectedPeriod === 'previous'
                    ? 'bg-white text-blue-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Oct 1 - 15, 2026 (1st Half)
              </button>
            </div>
          </div>

          {/* Quick Search */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search employee, role, date..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>
        </div>

        {/* Dropdown Filters */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Employee:</span>
            <select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              aria-label="Filter logs by employee"
              className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Employees ({mockEmployees.length})</option>
              {mockEmployees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.lastName} ({emp.role})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Classification:</span>
            <select
              value={selectedClassification}
              onChange={(e) => setSelectedClassification(e.target.value)}
              aria-label="Filter logs by day classification"
              className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Classifications</option>
              <option value="Regular Workday">Regular Workday</option>
              <option value="overtime">With Overtime Hours</option>
              <option value="Weekly Rest Day">Weekly Rest Day</option>
              <option value="Approved Leave (With Pay)">Leave With Pay (SIL)</option>
            </select>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setShowGuidance(!showGuidance)}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
            >
              <span>DOLE Statutory Rules</span>
              {showGuidance ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Expandable DOLE Guidance & Legal References */}
        {showGuidance && (
          <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl text-xs space-y-2 text-blue-900 animate-in fade-in duration-150">
            <div className="font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              DOLE General Labor Standards (GLS) Audit Mandates:
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-slate-700 pt-1">
              <div className="bg-white p-3 rounded-lg border border-blue-100 shadow-2xs space-y-1">
                <span className="font-bold text-blue-900 block">Art. 83 & 85: 8-Hour Rule & Meals</span>
                <p className="text-[11px] text-slate-600">
                  Normal hours of work shall not exceed 8 hours per day. Employees must be granted not less than 60 minutes off-duty time-off for regular meals.
                </p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-blue-100 shadow-2xs space-y-1">
                <span className="font-bold text-blue-900 block">Art. 86 & 87: Overtime & Night Diff</span>
                <p className="text-[11px] text-slate-600">
                  Work beyond 8 hours is compensated at +25% of regular hourly rate. Work performed between 10:00 PM and 6:00 AM earns an additional 10% night differential.
                </p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-blue-100 shadow-2xs space-y-1">
                <span className="font-bold text-blue-900 block">Art. 91 & 93: Weekly Rest Day</span>
                <p className="text-[11px] text-slate-600">
                  Every employee is entitled to a rest period of not less than 24 consecutive hours after 6 consecutive normal work days. Rest day work earns a 130% premium.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Mandated Logs Table */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-800 uppercase text-xs tracking-wider">
              Mandated Daily Time Records (DTR)
            </h3>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-mono font-bold">
              {filteredLogs.length} Records Shown
            </span>
          </div>
          <div className="text-xs text-slate-500 font-mono">
            Period: <strong>{periodDates.text}</strong>
          </div>
        </div>

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left">
            <thead className="bg-slate-100/80 text-[11px] font-bold text-slate-600 uppercase border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Date / Day</th>
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Scheduled Shift</th>
                <th className="px-4 py-3 font-mono text-center">Time In</th>
                <th className="px-4 py-3 font-mono text-center">Meal Break</th>
                <th className="px-4 py-3 font-mono text-center">Time Out</th>
                <th className="px-4 py-3 text-right">Reg Hrs</th>
                <th className="px-4 py-3 text-right text-indigo-700">OT Hrs</th>
                <th className="px-4 py-3 text-right text-purple-700">Night Diff</th>
                <th className="px-4 py-3">Classification</th>
                <th className="px-4 py-3">Terminal / Source</th>
                <th className="px-4 py-3">DOLE Compliance Remarks</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3 font-mono whitespace-nowrap">
                    <div className="font-semibold text-slate-900">{log.date}</div>
                    <div className="text-[10px] text-slate-400">{log.dayOfWeek}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="font-semibold text-slate-900">{log.employeeName}</div>
                    <div className="text-[10px] text-slate-500">{log.position} • {log.department}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 text-[11px] whitespace-nowrap">
                    {log.scheduledShift}
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-800 text-center whitespace-nowrap">
                    {log.actualTimeIn}
                    {log.tardinessMinutes > 0 && (
                      <span className="block text-[10px] font-bold text-amber-600">+{log.tardinessMinutes}m Late</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-500 text-center whitespace-nowrap text-[11px]">
                    {log.breakOut !== '--:--' ? `${log.breakOut} - ${log.breakIn}` : '--'}
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-800 text-center whitespace-nowrap">
                    {log.actualTimeOut}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-slate-800">
                    {log.regularHoursWorked.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-indigo-700">
                    {log.overtimeHours > 0 ? (
                      <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded">
                        +{log.overtimeHours.toFixed(2)}
                      </span>
                    ) : '-'}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-purple-700">
                    {log.nightDiffHours > 0 ? (
                      <span className="px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded">
                        +{log.nightDiffHours.toFixed(2)}
                      </span>
                    ) : '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      log.dayClassification === 'Regular Workday' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                      log.dayClassification === 'Weekly Rest Day' ? 'bg-slate-100 text-slate-600' :
                      log.dayClassification.includes('Leave') ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      'bg-purple-50 text-purple-700 border border-purple-200'
                    }`}>
                      {log.dayClassification}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-[11px] whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{log.biometricTerminalId}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                      <span className="truncate max-w-xs">{log.doleComplianceNotes}</span>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={12} className="px-6 py-8 text-center text-slate-500 text-sm">
                    No time logs match your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Summary Bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-4">
            <span>Total Regular: <strong className="text-slate-900 font-mono">{summary.totalRegularHours} hrs</strong></span>
            <span>Total Overtime: <strong className="text-indigo-700 font-mono">+{summary.totalOvertimeHours} hrs</strong></span>
            <span>Total Night Diff: <strong className="text-purple-700 font-mono">+{summary.totalNightDiffHours} hrs</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400">DOLE Compliant Electronic Timesheet</span>
            <button
              onClick={handleDownloadPopulatedCsv}
              className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              Export Filtered CSV ({filteredLogs.length})
            </button>
          </div>
        </div>
      </div>

      {/* Printable Inspection Modal */}
      <DolePrintableReportModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        logs={filteredLogs}
        summary={summary}
        dateRangeText={periodDates.text}
        initialSignature={signature}
        onSignatureChange={setSignature}
      />

      {/* Standalone E-Signature Modal */}
      <ESignatureModal
        isOpen={showSignModal}
        onClose={() => setShowSignModal(false)}
        onSaveSignature={(sig) => setSignature(sig)}
        documentTitle={`DOLE Mandated Logs (${periodDates.text})`}
        initialSignerName={signature?.signerName || 'Maria Clara'}
        initialSignerTitle={signature?.signerTitle || 'HR & Labor Compliance Manager'}
        initialAccreditation={signature?.accreditationNo || 'DOLE-OSH-NCR-2023-0881 | PRC HR #0041289'}
      />

      {/* Central Repository Signature Picker */}
      <SignaturePickerModal
        isOpen={showPickerModal}
        onClose={() => setShowPickerModal(false)}
        category="dole"
        onSelectSignatory={(sig) => {
          if (sig) {
            setSignature({
              signatureDataUrl: sig.signatureDataUrl,
              signerName: sig.fullName,
              signerTitle: sig.title,
              accreditationNo: sig.doleAccreditationNo || sig.prcLicenseNo || 'DOLE-OSH-NCR-2023-0881',
              signedAt: new Date().toISOString().split('T')[0],
              verificationHash: signatureRepository.generateTamperEvidentHash(sig, 'DOLE-GLS'),
              signatureType: 'drawn',
              companyName: 'Kawayan HR Philippines Inc.',
            });
          } else {
            setSignature(null);
          }
        }}
      />
    </div>
  );
}
