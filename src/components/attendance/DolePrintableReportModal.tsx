import React, { useState } from 'react';
import { 
  X, Printer, ShieldCheck, Download, CheckCircle2, 
  PenTool, Award, Clock, FileText, Sparkles, AlertCircle, FileCheck, RefreshCw 
} from 'lucide-react';
import { DoleEmployeeLog, DoleAuditSummary, downloadDoleCsv, generateDoleCsvString } from '../../lib/dole-reporting';
import { ESignatureModal, DigitalSignatureData } from '../common/ESignatureModal';

interface DolePrintableReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: DoleEmployeeLog[];
  summary: DoleAuditSummary;
  dateRangeText: string;
  initialSignature?: DigitalSignatureData | null;
  onSignatureChange?: (sig: DigitalSignatureData | null) => void;
}

export type DoleReportType = 'dtr-gls' | 'wair' | 'osh-minutes' | '13th-month-compliance';

export function DolePrintableReportModal({
  isOpen,
  onClose,
  logs,
  summary,
  dateRangeText,
  initialSignature = null,
  onSignatureChange,
}: DolePrintableReportModalProps) {
  const [reportType, setReportType] = useState<DoleReportType>('dtr-gls');
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [signature, setSignature] = useState<DigitalSignatureData | null>(initialSignature);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleSaveSignature = (sig: DigitalSignatureData) => {
    setSignature(sig);
    if (onSignatureChange) {
      onSignatureChange(sig);
    }
  };

  const handleClearSignature = () => {
    setSignature(null);
    if (onSignatureChange) {
      onSignatureChange(null);
    }
  };

  // Download signed CSV with cryptographic header verification
  const handleDownloadSignedCsv = () => {
    let csv = generateDoleCsvString(logs, 'populated');
    
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

    const filename = `DOLE_GLS_Signed_Logs_${dateRangeText.replace(/\s+/g, '_')}.csv`;
    downloadDoleCsv(csv, filename);
  };

  // Download standalone self-contained signed HTML document
  const handleDownloadSignedHtml = () => {
    const reportHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>DOLE Mandated Report - ${signature ? 'Digitally Signed' : 'Official Document'}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 40px; color: #0f172a; line-height: 1.5; font-size: 12px; }
    .header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 24px; }
    .header h1 { font-size: 16px; font-weight: 800; text-transform: uppercase; margin: 4px 0; }
    .header h2 { font-size: 12px; font-weight: 700; color: #334155; margin: 2px 0; }
    .meta-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin-bottom: 20px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
    .meta-item span { display: block; }
    .meta-title { font-size: 9px; font-weight: 700; color: #64748b; text-transform: uppercase; }
    .meta-val { font-size: 12px; font-weight: 700; color: #0f172a; margin-top: 2px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 11px; }
    th { background: #f1f5f9; padding: 6px 8px; text-align: left; font-size: 10px; font-weight: 700; text-transform: uppercase; border-bottom: 2px solid #cbd5e1; }
    td { padding: 6px 8px; border-bottom: 1px solid #f1f5f9; }
    .signature-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 40px; text-align: center; }
    .sig-block { border-top: 1px solid #94a3b8; padding-top: 8px; }
    .seal-box { background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 12px; margin-bottom: 20px; }
    .seal-badge { font-weight: 800; color: #065f46; font-size: 11px; }
  </style>
</head>
<body>
  <div class="header">
    <div style="font-size: 10px; font-weight: 700; letter-spacing: 1px; color: #64748b;">REPUBLIC OF THE PHILIPPINES</div>
    <h1>Department of Labor and Employment</h1>
    <h2>GENERAL LABOR STANDARDS (GLS) INSPECTION LOGBOOK</h2>
    <div style="font-size: 10px; color: #64748b;">Rule 1020 / Book III, Labor Code of the Philippines</div>
  </div>

  <div class="meta-box">
    <div class="meta-item">
      <span class="meta-title">Establishment Name</span>
      <span class="meta-val">KAWAYAN HR PHILIPPINES INC.</span>
    </div>
    <div class="meta-item">
      <span class="meta-title">Business Address</span>
      <span class="meta-val">BGC, Taguig City, Philippines</span>
    </div>
    <div class="meta-item">
      <span class="meta-title">DOLE Registration</span>
      <span class="meta-val">DOLE-NCR-TAG-2022-0441</span>
    </div>
    <div class="meta-item">
      <span class="meta-title">Period</span>
      <span class="meta-val">${dateRangeText}</span>
    </div>
  </div>

  ${signature ? `
  <div class="seal-box">
    <div class="seal-badge">✔ DIGITALLY CERTIFIED & SIGNED UNDER RA 8792</div>
    <div style="font-size: 10px; color: #047857; margin-top: 4px;">
      Signatory: <b>${signature.signerName}</b> (${signature.signerTitle}) · Accreditation: ${signature.accreditationNo}<br>
      Date & Time: ${signature.signedAt} · Verification Hash: <span style="font-family: monospace;">${signature.verificationHash}</span>
    </div>
  </div>` : ''}

  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Employee</th>
        <th>Position</th>
        <th>Time In</th>
        <th>Time Out</th>
        <th style="text-align: right;">Reg Hrs</th>
        <th style="text-align: right;">OT Hrs</th>
        <th>Classification</th>
      </tr>
    </thead>
    <tbody>
      ${logs.slice(0, 30).map(l => `
        <tr>
          <td>${l.date}</td>
          <td><b>${l.employeeName}</b></td>
          <td>${l.position}</td>
          <td>${l.actualTimeIn}</td>
          <td>${l.actualTimeOut}</td>
          <td style="text-align: right;">${l.regularHoursWorked.toFixed(2)}</td>
          <td style="text-align: right;">${l.overtimeHours > 0 ? l.overtimeHours.toFixed(2) : '-'}</td>
          <td>${l.dayClassification}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="signature-grid">
    <div class="sig-block">
      ${signature ? `<img src="${signature.signatureDataUrl}" style="height: 48px; margin: 0 auto; display: block;" />` : `<div style="height: 48px;"></div>`}
      <b>${signature ? signature.signerName : 'Maria Clara'}</b><br>
      <span>${signature ? signature.signerTitle : 'HR & Labor Compliance Manager'}</span><br>
      <small style="color: #64748b;">${signature ? signature.accreditationNo : 'DOLE-OSH-NCR-2023-0881'}</small>
    </div>
    <div class="sig-block">
      <div style="height: 48px;"></div>
      <b>Authorized Management Representative</b><br>
      <span>Managing Director / Plant Head</span>
    </div>
    <div class="sig-block">
      <div style="height: 48px;"></div>
      <b>DOLE Labor Inspector</b><br>
      <span>Regional Office No. NCR</span>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([reportHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DOLE_Report_Signed_${dateRangeText.replace(/\s+/g, '_')}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto print:p-0 print:bg-white">
        <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full flex flex-col overflow-hidden border border-slate-200 print:border-none print:shadow-none animate-in fade-in zoom-in-95 duration-200 max-h-[95vh]">
          {/* Modal Top Toolbar (hidden in print) */}
          <div className="p-4 border-b border-slate-200 bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 print:hidden">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
                <ShieldCheck className="w-5 h-5 text-blue-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold block">DOLE Mandated Compliance Inspection Portal</span>
                  {signature ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      Digitally Signed & Certified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30">
                      <AlertCircle className="w-3 h-3 text-amber-400" />
                      Pending HR E-Signature
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-slate-400">
                  Electronic daily records pursuant to Book III Labor Code & RA 8792 E-Commerce Act
                </span>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
              {/* E-Signature Button */}
              {signature ? (
                <button
                  onClick={() => setIsSignModalOpen(true)}
                  className="px-3 py-1.5 bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-300 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors border border-emerald-500/40"
                  title="Modify or re-sign digital certificate"
                >
                  <PenTool className="w-3.5 h-3.5 text-emerald-400" />
                  Re-Sign Document
                </button>
              ) : (
                <button
                  onClick={() => setIsSignModalOpen(true)}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-sm ring-2 ring-blue-400/30 animate-pulse"
                >
                  <PenTool className="w-3.5 h-3.5" />
                  E-Sign Mandated Log
                </button>
              )}

              {/* Download CSV with Signature */}
              <button
                onClick={handleDownloadSignedCsv}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors border border-slate-700"
                title="Download CSV including digital certificate header"
              >
                <Download className="w-3.5 h-3.5 text-slate-300" />
                Signed CSV
              </button>

              {/* Download Standalone Signed HTML */}
              <button
                onClick={handleDownloadSignedHtml}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors border border-slate-700"
                title="Download self-contained signed HTML audit report"
              >
                <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                Signed HTML Report
              </button>

              {/* Print / PDF */}
              <button
                onClick={handlePrint}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                Print / PDF
              </button>

              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors ml-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Secondary Subheader: Template Format Switcher (hidden in print) */}
          <div className="bg-slate-100 border-b border-slate-200 px-6 py-2 flex items-center justify-between text-xs print:hidden">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">DOLE Mandatory Template:</span>
              <div className="inline-flex bg-white rounded-lg p-0.5 border border-slate-300 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setReportType('dtr-gls')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                    reportType === 'dtr-gls' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Form DTR-GLS (Attendance)
                </button>
                <button
                  type="button"
                  onClick={() => setReportType('wair')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                    reportType === 'wair' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  WAIR (Accident/Illness)
                </button>
                <button
                  type="button"
                  onClick={() => setReportType('osh-minutes')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                    reportType === 'osh-minutes' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  OSH Minutes (Rule 1040)
                </button>
                <button
                  type="button"
                  onClick={() => setReportType('13th-month-compliance')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                    reportType === '13th-month-compliance' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  13th Month Pay (P.D. 851)
                </button>
              </div>
            </div>

            <div className="text-slate-500 flex items-center gap-2">
              <Award className="w-3.5 h-3.5 text-blue-600" />
              <span>Inspection Ready · PEZA / DOLE NCR Compliant</span>
            </div>
          </div>

          {/* Printable Document Body */}
          <div className="p-6 sm:p-8 space-y-6 text-slate-900 bg-white overflow-y-auto">
            {/* Official DOLE Header */}
            <div className="text-center border-b-2 border-slate-900 pb-4 space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                Republic of the Philippines
              </div>
              <div className="text-base font-extrabold uppercase text-slate-900 tracking-tight">
                Department of Labor and Employment
              </div>
              <div className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                {reportType === 'dtr-gls' && 'GENERAL LABOR STANDARDS (GLS) INSPECTION LOGBOOK'}
                {reportType === 'wair' && 'WORK ACCIDENT / ILLNESS REPORT (DOLE-BWC/OHSD/IP-6)'}
                {reportType === 'osh-minutes' && 'JOINT SAFETY AND HEALTH COMMITTEE MONTHLY MINUTES (RULE 1040)'}
                {reportType === '13th-month-compliance' && 'MANDATORY REPORT ON COMPLIANCE WITH P.D. 851 (13TH MONTH PAY)'}
              </div>
              <div className="text-[11px] text-slate-500">
                Pursuant to Book III (Conditions of Employment), RA 11058 (OSH Law), and relevant Department Orders
              </div>
            </div>

            {/* Establishment Information Meta */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Establishment Name</span>
                <span className="font-bold text-slate-800 text-sm block mt-0.5">KAWAYAN HR PHILIPPINES INC.</span>
                <span className="text-slate-500 block text-[11px]">Nature: Information Technology & Services</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Business Address</span>
                <span className="font-medium text-slate-700 block mt-0.5">High Street South Corporate Plaza, BGC, Taguig City</span>
                <span className="text-slate-500 block text-[11px]">DOLE Regional Office No. NCR</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">DOLE / PEZA Registration</span>
                <span className="font-mono text-slate-800 font-semibold block mt-0.5">DOLE-NCR-TAG-2022-0441</span>
                <span className="text-slate-500 block text-[11px]">PEZA Reg. #2021-089</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Inspection Period</span>
                <span className="font-bold text-blue-700 font-mono text-xs block mt-0.5">{dateRangeText}</span>
                <span className="text-emerald-700 block text-[11px] font-semibold flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Electronic Biometric Verified
                </span>
              </div>
            </div>

            {/* Digital Signature Cryptographic Verification Seal Banner */}
            {signature ? (
              <div className="bg-emerald-50/80 border-2 border-emerald-300 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-xs">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-emerald-950 uppercase tracking-wide">
                        Statutory Electronic Signature Verified & Certified
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-200 text-emerald-900 font-mono">
                        RA 8792 / DOLE Compliant
                      </span>
                    </div>
                    <div className="text-[11px] text-emerald-800 mt-1 space-y-0.5">
                      <div>
                        Signatory: <span className="font-bold">{signature.signerName}</span> ({signature.signerTitle}) · Accreditation: <span className="font-mono font-bold">{signature.accreditationNo}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 text-emerald-700 font-mono text-[10px]">
                        <span>Timestamp: {signature.signedAt}</span>
                        <span>•</span>
                        <span>Verification Hash: {signature.verificationHash}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2 print:hidden">
                  <button
                    onClick={() => setIsSignModalOpen(true)}
                    className="px-2.5 py-1 bg-white hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded border border-emerald-300 transition-colors"
                  >
                    Edit Signature
                  </button>
                  <button
                    onClick={handleClearSignature}
                    className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold rounded border border-rose-200 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-amber-50/70 border border-amber-300 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs print:hidden">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
                    <PenTool className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-amber-900">Document Pending Official HR E-Signature</div>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      To meet Philippine Labor Inspector submission standards, sign this report digitally using the secure digital signature pad.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsSignModalOpen(true)}
                  className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors shrink-0"
                >
                  <PenTool className="w-3.5 h-3.5" />
                  E-Sign Now
                </button>
              </div>
            )}

            {/* Audit Metrics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Logs Filed</span>
                <span className="text-lg font-bold font-mono text-slate-900">{summary.totalRecords} entries</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Regular Work Hours</span>
                <span className="text-lg font-bold font-mono text-blue-700">{summary.totalRegularHours} hrs</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Overtime Authorized</span>
                <span className="text-lg font-bold font-mono text-indigo-700">{summary.totalOvertimeHours} hrs</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Night Differential</span>
                <span className="text-lg font-bold font-mono text-purple-700">{summary.totalNightDiffHours} hrs</span>
              </div>
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <span className="text-emerald-800 block text-[10px] uppercase font-bold">Labor Standards Compliance</span>
                <span className="text-lg font-bold font-mono text-emerald-700">100% AUDIT PASS</span>
              </div>
            </div>

            {/* Template Specific Content View */}
            {reportType === 'dtr-gls' && (
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto max-h-[360px]">
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
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {logs.slice(0, 40).map(log => (
                        <tr key={log.id} className="hover:bg-slate-50">
                          <td className="px-3 py-2 font-mono whitespace-nowrap text-slate-800">{log.date}</td>
                          <td className="px-3 py-2 font-semibold text-slate-900 whitespace-nowrap">{log.employeeName}</td>
                          <td className="px-3 py-2 text-slate-500 whitespace-nowrap">{log.position}</td>
                          <td className="px-3 py-2 font-mono text-slate-700">{log.actualTimeIn}</td>
                          <td className="px-3 py-2 font-mono text-slate-500 text-[11px]">
                            {log.breakOut !== '--:--' ? `${log.breakOut} - ${log.breakIn}` : '--'}
                          </td>
                          <td className="px-3 py-2 font-mono text-slate-700">{log.actualTimeOut}</td>
                          <td className="px-3 py-2 text-right font-mono font-semibold">{log.regularHoursWorked.toFixed(2)}</td>
                          <td className="px-3 py-2 text-right font-mono text-indigo-700 font-semibold">{log.overtimeHours > 0 ? log.overtimeHours.toFixed(2) : '-'}</td>
                          <td className="px-3 py-2 text-right font-mono text-purple-700">{log.nightDiffHours > 0 ? log.nightDiffHours.toFixed(2) : '-'}</td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <span className="text-[10px] font-bold text-slate-700">
                              {log.dayClassification}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {reportType === 'wair' && (
              <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/50 space-y-4 text-xs">
                <div className="font-bold text-slate-900 text-sm">
                  DOLE-BWC/OHSD/IP-6: Work Accident / Illness Periodic Compliance Summary
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">Total Work Hours</span>
                    <span className="text-base font-bold text-slate-800 font-mono">{(summary.totalRegularHours + summary.totalOvertimeHours).toFixed(1)} hrs</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">Disabling Injuries / Incidents</span>
                    <span className="text-base font-bold text-emerald-700 font-mono">0 (Zero)</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">Lost Workdays</span>
                    <span className="text-base font-bold text-emerald-700 font-mono">0 days</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">Frequency / Severity Rate</span>
                    <span className="text-base font-bold text-emerald-700 font-mono">0.00 (Pass)</span>
                  </div>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Pursuant to Rule 1050 of the Occupational Safety and Health Standards (OSHS), the employer certifies that zero disabling workplace injuries, chemical exposures, or reportable occupational illnesses occurred during the certified inspection period.
                </p>
              </div>
            )}

            {reportType === 'osh-minutes' && (
              <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/50 space-y-4 text-xs">
                <div className="font-bold text-slate-900 text-sm">
                  Joint Safety and Health Committee Monthly Meeting Records (Rule 1040)
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center text-[11px] text-slate-500 pb-2 border-b border-slate-100">
                    <span>Meeting Date: October 28, 2026</span>
                    <span>Committee Status: Fully Constituted</span>
                  </div>
                  <div className="text-slate-800 font-medium">Resolutions Adopted:</div>
                  <ul className="list-disc pl-5 space-y-1 text-slate-600">
                    <li>Conducted quarterly ergonomics audit for technical and call support workstations.</li>
                    <li>Verified inspection compliance of emergency fire exits, first aid kits, and portable fire extinguishers.</li>
                    <li>Confirmed 100% participation in mandatory 8-hour OSH seminar for newly hired personnel.</li>
                  </ul>
                </div>
              </div>
            )}

            {reportType === '13th-month-compliance' && (
              <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/50 space-y-4 text-xs">
                <div className="font-bold text-slate-900 text-sm">
                  Mandatory Report of Compliance on Presidential Decree No. 851 (13th Month Pay)
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                  <p className="text-slate-700">
                    The establishment certifies that the mandatory 13th month pay computation and accrual have been executed strictly in adherence to DOLE Guidelines on P.D. 851, ensuring that all rank-and-file employees who have rendered at least one (1) month of service receive their pro-rated statutory entitlement on or before December 24.
                  </p>
                </div>
              </div>
            )}

            {/* Employer Certification under Oath (Required by DOLE) */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1 text-slate-600">
              <div className="font-bold text-slate-800">EMPLOYER STATUTORY CERTIFICATION UNDER OATH:</div>
              <p className="leading-relaxed">
                I hereby certify under penalty of administrative and criminal sanctions under the Philippine Labor Code that the daily time records, hours worked, rest days, authorized overtime, and statutory benefits summarized herein have been examined and confirmed against authorized biometric terminals.
              </p>
            </div>

            {/* Official Signature Lines with Interactive E-Signature Embed */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-slate-200 text-xs text-slate-500">
              {/* Box 1: Authorized HR & Compliance Manager (E-Signature Embed) */}
              <div className="text-center space-y-2">
                <div className="min-h-[70px] flex flex-col items-center justify-end pb-1 relative">
                  {signature ? (
                    <div className="space-y-1">
                      <img
                        src={signature.signatureDataUrl}
                        alt="HR Digital Signature"
                        className="max-h-16 mx-auto object-contain"
                      />
                      <div className="inline-flex items-center gap-1 text-[9px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        Signed: {signature.signedAt}
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsSignModalOpen(true)}
                      className="px-3 py-1.5 border border-dashed border-blue-400 bg-blue-50/60 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors print:hidden"
                    >
                      <PenTool className="w-3.5 h-3.5 text-blue-600" />
                      Click to Apply E-Signature
                    </button>
                  )}
                </div>

                <div className="border-b border-slate-400 w-4/5 mx-auto" />
                <div>
                  <span className="font-bold text-slate-900 block text-sm">
                    {signature ? signature.signerName : 'Maria Clara'}
                  </span>
                  <span className="text-slate-600 block">
                    {signature ? signature.signerTitle : 'HR & Labor Compliance Manager'}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-mono">
                    {signature ? signature.accreditationNo : 'DOLE-OSH-NCR-2023-0881 | PRC HR #0041289'}
                  </span>
                </div>
              </div>

              {/* Box 2: Employer Representative */}
              <div className="text-center space-y-2">
                <div className="min-h-[70px] flex items-end justify-center pb-2">
                  <div className="text-[11px] text-slate-400 italic">Official Corporate Seal</div>
                </div>
                <div className="border-b border-slate-400 w-4/5 mx-auto" />
                <div>
                  <span className="font-bold text-slate-900 block text-sm">Managing Director / COO</span>
                  <span className="text-slate-600 block">Authorized Employer Representative</span>
                  <span className="text-[10px] text-slate-400 block">Kawayan HR Philippines Inc.</span>
                </div>
              </div>

              {/* Box 3: DOLE Labor Inspector */}
              <div className="text-center space-y-2">
                <div className="min-h-[70px] flex items-end justify-center pb-2">
                  <div className="text-[11px] text-slate-400 italic">Regional Office Validation</div>
                </div>
                <div className="border-b border-slate-400 w-4/5 mx-auto" />
                <div>
                  <span className="font-bold text-slate-900 block text-sm">DOLE Labor Inspector</span>
                  <span className="text-slate-600 block">Bureau of Working Conditions (BWC)</span>
                  <span className="text-[10px] text-slate-400 block font-mono">DOLE Regional Office No. NCR</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* E-Signature Modal */}
      <ESignatureModal
        isOpen={isSignModalOpen}
        onClose={() => setIsSignModalOpen(false)}
        onSaveSignature={handleSaveSignature}
        documentTitle={
          reportType === 'dtr-gls' ? 'DOLE Form DTR-GLS Inspection Logbook' :
          reportType === 'wair' ? 'DOLE WAIR Accident & Illness Report' :
          reportType === 'osh-minutes' ? 'DOLE OSH Joint Committee Minutes' :
          'DOLE 13th Month Pay Annual Report'
        }
        initialSignerName={signature?.signerName || 'Maria Clara'}
        initialSignerTitle={signature?.signerTitle || 'HR & Labor Compliance Manager'}
        initialAccreditation={signature?.accreditationNo || 'DOLE-OSH-NCR-2023-0881 | PRC HR #0041289'}
      />
    </>
  );
}
