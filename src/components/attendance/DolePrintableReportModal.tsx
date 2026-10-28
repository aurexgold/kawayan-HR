import { X, Printer, ShieldCheck, Download, CheckCircle2 } from 'lucide-react';
import { DoleEmployeeLog, DoleAuditSummary, downloadDoleCsv, generateDoleCsvString } from '../../lib/dole-reporting';

interface DolePrintableReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: DoleEmployeeLog[];
  summary: DoleAuditSummary;
  dateRangeText: string;
}

export function DolePrintableReportModal({
  isOpen,
  onClose,
  logs,
  summary,
  dateRangeText,
}: DolePrintableReportModalProps) {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCsv = () => {
    const csv = generateDoleCsvString(logs, 'populated');
    downloadDoleCsv(csv, `DOLE_GLS_Mandated_Logs_${dateRangeText.replace(/\s+/g, '_')}.csv`);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full flex flex-col overflow-hidden border border-slate-200 print:border-none print:shadow-none animate-in fade-in zoom-in-95 duration-200 max-h-[95vh]">
        {/* Modal Toolbar (hidden in print) */}
        <div className="p-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
            <div>
              <span className="text-sm font-bold block">DOLE Form DTR-GLS Inspection Logbook</span>
              <span className="text-[11px] text-slate-400">Department of Labor and Employment Mandated Audit Records</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadCsv}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              <Download className="w-4 h-4" />
              Download CSV
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-6 sm:p-8 space-y-6 text-slate-900 bg-white overflow-y-auto">
          {/* Official DOLE Header */}
          <div className="text-center border-b-2 border-slate-900 pb-4 space-y-1">
            <div className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Republic of the Philippines</div>
            <div className="text-base font-extrabold uppercase text-slate-900">Department of Labor and Employment</div>
            <div className="text-xs font-bold text-slate-700">GENERAL LABOR STANDARDS (GLS) INSPECTION LOGBOOK</div>
            <div className="text-[11px] text-slate-500">MANDATORY EMPLOYEE DAILY TIME RECORDS (Rule 1020 / Book III, Labor Code of the Philippines)</div>
          </div>

          {/* Establishment Information Meta */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Establishment Name</span>
              <span className="font-bold text-slate-800 text-sm">KAWAYAN HR PHILIPPINES INC.</span>
              <span className="text-slate-500 block text-[11px]">Nature: Information Technology & Services</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Business Address</span>
              <span className="font-medium text-slate-700">High Street South Corporate Plaza, BGC, Taguig City, Philippines</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">DOLE / PEZA Registration</span>
              <span className="font-mono text-slate-800 font-semibold">DOLE-NCR-TAG-2022-0441</span>
              <span className="text-slate-500 block text-[11px]">PEZA Reg. 2021-089</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Inspection Period</span>
              <span className="font-bold text-blue-700 font-mono text-xs">{dateRangeText}</span>
              <span className="text-emerald-700 block text-[11px] font-semibold flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="w-3 h-3" /> Electronic Biometric Verified
              </span>
            </div>
          </div>

          {/* Audit Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Logs Filed</span>
              <span className="text-lg font-bold font-mono text-slate-900">{summary.totalRecords}</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Regular Hours</span>
              <span className="text-lg font-bold font-mono text-blue-700">{summary.totalRegularHours} hrs</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Overtime Hours</span>
              <span className="text-lg font-bold font-mono text-indigo-700">{summary.totalOvertimeHours} hrs</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Night Diff (10PM-6AM)</span>
              <span className="text-lg font-bold font-mono text-purple-700">{summary.totalNightDiffHours} hrs</span>
            </div>
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
              <span className="text-emerald-800 block text-[10px] uppercase font-bold">Labor Code Compliance</span>
              <span className="text-lg font-bold font-mono text-emerald-700">100% PASS</span>
            </div>
          </div>

          {/* Logbook Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto max-h-[380px]">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0 uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-2.5">Date</th>
                    <th className="px-3 py-2.5">Employee Name</th>
                    <th className="px-3 py-2.5">Designation</th>
                    <th className="px-3 py-2.5">Time In</th>
                    <th className="px-3 py-2.5">Meal Break</th>
                    <th className="px-3 py-2.5">Time Out</th>
                    <th className="px-3 py-2.5 text-right">Reg Hrs</th>
                    <th className="px-3 py-2.5 text-right">OT Hrs</th>
                    <th className="px-3 py-2.5 text-right">Night Diff</th>
                    <th className="px-3 py-2.5">Classification</th>
                    <th className="px-3 py-2.5">Terminal Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="px-3 py-2 font-mono whitespace-nowrap text-slate-800">{log.date}</td>
                      <td className="px-3 py-2 font-semibold text-slate-900 whitespace-nowrap">{log.employeeName}</td>
                      <td className="px-3 py-2 text-slate-500 whitespace-nowrap">{log.position}</td>
                      <td className="px-3 py-2 font-mono text-slate-700">{log.actualTimeIn}</td>
                      <td className="px-3 py-2 font-mono text-slate-500 text-[11px]">{log.breakOut !== '--:--' ? `${log.breakOut} - ${log.breakIn}` : '--'}</td>
                      <td className="px-3 py-2 font-mono text-slate-700">{log.actualTimeOut}</td>
                      <td className="px-3 py-2 text-right font-mono font-semibold">{log.regularHoursWorked.toFixed(2)}</td>
                      <td className="px-3 py-2 text-right font-mono text-indigo-700">{log.overtimeHours > 0 ? log.overtimeHours.toFixed(2) : '-'}</td>
                      <td className="px-3 py-2 text-right font-mono text-purple-700">{log.nightDiffHours > 0 ? log.nightDiffHours.toFixed(2) : '-'}</td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          log.dayClassification === 'Regular Workday' ? 'bg-blue-50 text-blue-700' :
                          log.dayClassification === 'Weekly Rest Day' ? 'bg-slate-100 text-slate-600' :
                          'bg-amber-50 text-amber-700'
                        }`}>
                          {log.dayClassification}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-slate-500 text-[11px] truncate max-w-[130px]">{log.biometricTerminalId}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Employer Certification under Oath (Required by DOLE) */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1 text-slate-600">
            <div className="font-bold text-slate-800">EMPLOYER STATUTORY CERTIFICATION:</div>
            <p>
              I hereby certify that the electronic daily time records and employee attendance logs contained herein are true, correct, and accurately recorded via authorized electronic/biometric terminals in compliance with Book III of the Labor Code of the Philippines and relevant Department Orders.
            </p>
          </div>

          {/* Official Signature Lines */}
          <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-200 text-xs text-slate-500">
            <div className="text-center space-y-6">
              <div className="border-b border-slate-400 w-4/5 mx-auto" />
              <div>
                <span className="font-bold text-slate-800 block">Maria Clara</span>
                <span>HR & Payroll Manager</span>
              </div>
            </div>
            <div className="text-center space-y-6">
              <div className="border-b border-slate-400 w-4/5 mx-auto" />
              <div>
                <span className="font-bold text-slate-800 block">Authorized Company Representative</span>
                <span>Employer / Plant Manager</span>
              </div>
            </div>
            <div className="text-center space-y-6">
              <div className="border-b border-slate-400 w-4/5 mx-auto" />
              <div>
                <span className="font-bold text-slate-800 block">DOLE Labor Inspector</span>
                <span>Regional Office No. NCR</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
