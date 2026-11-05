import { useState, useMemo, useEffect } from 'react';
import { 
  ThirteenthMonthRecord, 
  ThirteenthMonthSummary,
  generateDoleComplianceCsv,
  generateBir2316ScheduleCsv,
  generateBankDisbursementBatchFile,
  TAX_EXEMPTION_CEILING_TRAIN
} from '../../lib/thirteenth-month';
import { 
  FileText, Download, Printer, CheckCircle2, ShieldCheck, 
  Building2, Landmark, Receipt, ExternalLink, Calendar, 
  CreditCard, Send, PenTool, Check, AlertCircle, Copy
} from 'lucide-react';
import { signatureRepository, AuthorizedSignatory } from '../../lib/signature-repository';
import { SignaturePickerModal } from '../signatures/SignaturePickerModal';
import { SignatureSealBadge } from '../signatures/SignatureSealBadge';

interface ThirteenthMonthReportsHubProps {
  records: ThirteenthMonthRecord[];
  summary: ThirteenthMonthSummary;
  selectedYear: number;
}

export function ThirteenthMonthReportsHub({
  records,
  summary,
  selectedYear,
}: ThirteenthMonthReportsHubProps) {
  const [activeReportType, setActiveReportType] = useState<
    'dole-ers' | 'bir-2316' | 'bank-batch' | 'vouchers'
  >('dole-ers');

  // Selected bank for disbursement file
  const [selectedBank, setSelectedBank] = useState<'UnionBank' | 'BDO' | 'BPI' | 'PESONet'>('UnionBank');
  const [disbursementDate, setDisbursementDate] = useState<string>(`${selectedYear}-12-20`);

  // Selected employee voucher
  const [selectedVoucherEmpId, setSelectedVoucherEmpId] = useState<string>(records[0]?.employeeId || '');

  // Digital Signatory from Central Repository
  const [authorizedSignatory, setAuthorizedSignatory] = useState<AuthorizedSignatory | null>(null);
  const [isSignatoryModalOpen, setIsSignatoryModalOpen] = useState<boolean>(false);

  // DOLE ERS Filing Status
  const [doleFilingStatus, setDoleFilingStatus] = useState<{
    isFiled: boolean;
    referenceNumber: string;
    filedAt: string;
    filedBy: string;
  }>(() => {
    const saved = localStorage.getItem(`dole_ers_13th_filing_${selectedYear}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return {
      isFiled: false,
      referenceNumber: `DOLE-NCR-${selectedYear}-851-09823`,
      filedAt: '',
      filedBy: '',
    };
  });

  // Load default signatory for DOLE reports
  useEffect(() => {
    const defaultSigner = signatureRepository.getDefaultSignatoryForCategory('dole') 
      || signatureRepository.getSignatories().find(s => s.status === 'active') 
      || null;
    setAuthorizedSignatory(defaultSigner);
  }, []);

  // Save DOLE filing state
  const handleMarkDoleAsFiled = () => {
    const newStatus = {
      isFiled: true,
      referenceNumber: `DOLE-NCR-${selectedYear}-851-${Math.floor(10000 + Math.random() * 90000)}`,
      filedAt: new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      filedBy: authorizedSignatory ? `${authorizedSignatory.fullName} (${authorizedSignatory.title})` : 'HR Director',
    };
    setDoleFilingStatus(newStatus);
    localStorage.setItem(`dole_ers_13th_filing_${selectedYear}`, JSON.stringify(newStatus));
  };

  const handleDownloadDoleCsv = () => {
    const csv = generateDoleComplianceCsv(records, selectedYear);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `DOLE_Form_ERS_PD851_Schedule_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadBir2316Csv = () => {
    const csv = generateBir2316ScheduleCsv(records, selectedYear);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `BIR_Form_2316_13th_Month_Schedule_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadBankBatchCsv = () => {
    const csv = generateBankDisbursementBatchFile(records, selectedBank, disbursementDate);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${selectedBank}_Batch_13thMonth_${selectedYear}_${disbursementDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const activeVoucherRecord = useMemo(() => {
    return records.find(r => r.employeeId === selectedVoucherEmpId) || records[0];
  }, [records, selectedVoucherEmpId]);

  return (
    <div className="space-y-6">
      {/* Top Selector Bar for Report Documents */}
      <div className="bg-white rounded-xl border border-slate-200 p-2 shadow-xs flex flex-wrap gap-2">
        <button
          onClick={() => setActiveReportType('dole-ers')}
          className={`flex-1 min-w-[210px] py-2.5 px-3.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
            activeReportType === 'dole-ers'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Building2 className="w-4 h-4" />
          DOLE Form ERS-PD851 (Establishment Report)
        </button>

        <button
          onClick={() => setActiveReportType('bir-2316')}
          className={`flex-1 min-w-[210px] py-2.5 px-3.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
            activeReportType === 'bir-2316'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Receipt className="w-4 h-4" />
          BIR 2316 Alpha-List & Tax Schedule
        </button>

        <button
          onClick={() => setActiveReportType('bank-batch')}
          className={`flex-1 min-w-[210px] py-2.5 px-3.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
            activeReportType === 'bank-batch'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Landmark className="w-4 h-4" />
          Bank Electronic Disbursement Batch
        </button>

        <button
          onClick={() => setActiveReportType('vouchers')}
          className={`flex-1 min-w-[210px] py-2.5 px-3.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
            activeReportType === 'vouchers'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <FileText className="w-4 h-4" />
          Individual Settlement Vouchers
        </button>
      </div>

      {/* REPORT 1: DOLE ESTABLISHMENT COMPLIANCE REPORT */}
      {activeReportType === 'dole-ers' && (
        <div className="space-y-6">
          {/* Header Action Strip */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Official DOLE Form ERS-PD851
                </span>
                <span className="text-xs text-slate-500">
                  Due on or before January 15, {selectedYear + 1}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-1">
                Annual Report of Compliance with Presidential Decree No. 851
              </h3>
              <p className="text-xs text-slate-500">
                Prescribed establishment report for filing via the DOLE Establishment Report System (reports.dole.gov.ph).
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setIsSignatoryModalOpen(true)}
                className="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 shadow-xs"
              >
                <PenTool className="w-3.5 h-3.5 text-blue-600" />
                {authorizedSignatory ? authorizedSignatory.fullName : 'Choose Signatory'}
              </button>

              <button
                onClick={handleDownloadDoleCsv}
                className="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-blue-600" />
                Export Annex CSV
              </button>

              <button
                onClick={() => window.print()}
                className="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 shadow-xs"
              >
                <Printer className="w-3.5 h-3.5 text-slate-600" />
                Print Form
              </button>

              {!doleFilingStatus.isFiled ? (
                <button
                  onClick={handleMarkDoleAsFiled}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Mark as Filed to DOLE
                </button>
              ) : (
                <div className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  Filed: {doleFilingStatus.referenceNumber}
                </div>
              )}
            </div>
          </div>

          {/* DOLE Filing Confirmation Banner if Filed */}
          {doleFilingStatus.isFiled && (
            <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 text-xs text-emerald-950">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-sm block">DOLE Establishment Compliance Report Filed</span>
                  <p className="text-emerald-800 text-[11px] mt-0.5">
                    Filed by {doleFilingStatus.filedBy} on {doleFilingStatus.filedAt}. Confirmation Reference: <span className="font-mono font-bold">{doleFilingStatus.referenceNumber}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setDoleFilingStatus(prev => ({ ...prev, isFiled: false }));
                  localStorage.removeItem(`dole_ers_13th_filing_${selectedYear}`);
                }}
                className="text-xs text-emerald-700 underline hover:text-emerald-900"
              >
                Reset Filing Status
              </button>
            </div>
          )}

          {/* Printable Official DOLE Document Container */}
          <div className="bg-white rounded-2xl border border-slate-300 p-8 shadow-sm print:border-none print:shadow-none space-y-6 font-sans text-xs">
            {/* Republic Header */}
            <div className="text-center space-y-1 border-b-2 border-slate-900 pb-4">
              <p className="font-bold text-slate-800 uppercase tracking-widest text-[10px]">
                Republic of the Philippines
              </p>
              <p className="font-black text-base text-slate-900 uppercase tracking-tight">
                Department of Labor and Employment
              </p>
              <p className="text-[11px] text-slate-600 font-medium">
                National Capital Region (NCR) • Regional Field Office
              </p>
              <div className="pt-2">
                <span className="inline-block bg-slate-900 text-white font-bold text-xs uppercase px-4 py-1 tracking-wider rounded">
                  ESTABLISHMENT REPORT OF COMPLIANCE ON 13TH-MONTH PAY LAW
                </span>
                <p className="text-[11px] text-slate-600 font-mono mt-1">
                  PRESIDENTIAL DECREE NO. 851 • CALENDAR YEAR {selectedYear}
                </p>
              </div>
            </div>

            {/* Establishment Particulars Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="space-y-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">1. Name of Establishment</span>
                  <span className="text-sm font-bold text-slate-900 block">Kawayan Tech Philippines Inc.</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">2. Principal Business Address</span>
                  <span className="text-xs text-slate-700 block">
                    Unit 2401, The Trade & Financial Tower, 7th Ave & 32nd St, BGC, Taguig City 1634
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">3. DOLE Establishment Reg. No. / Tax ID</span>
                  <span className="text-xs font-mono font-semibold text-slate-800">
                    DOLE-NCR-TAG-2023-09812 • TIN: 000-123-456-000
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">4. Principal Nature of Business / PSIC</span>
                  <span className="text-xs text-slate-700 block">Information Technology & Software Engineering Services (PSIC 6201)</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">5. Contact Information</span>
                  <span className="text-xs text-slate-700 block">hr-compliance@kawayanhr.ph • (02) 8888-5926</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">6. DOLE Regional / Field Office</span>
                  <span className="text-xs text-slate-700 block">DOLE NCR - Makati & Pasay Field Office</span>
                </div>
              </div>
            </div>

            {/* Total Workforce Breakdown Matrix */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                7. Employment Workforce Summary:
              </span>
              <table className="w-full border border-slate-300 text-center text-xs">
                <thead className="bg-slate-100 font-bold text-slate-700 border-b border-slate-300">
                  <tr>
                    <th className="py-2 px-3 border-r border-slate-300 text-left">Category</th>
                    <th className="py-2 px-3 border-r border-slate-300">Male</th>
                    <th className="py-2 px-3 border-r border-slate-300">Female</th>
                    <th className="py-2 px-3 border-r border-slate-300">Total Covered</th>
                    <th className="py-2 px-3">Total 13th Month Paid (PHP)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="py-2 px-3 text-left font-medium border-r border-slate-300">Rank-and-File Employees</td>
                    <td className="py-2 px-3 border-r border-slate-300 font-mono">3</td>
                    <td className="py-2 px-3 border-r border-slate-300 font-mono">1</td>
                    <td className="py-2 px-3 border-r border-slate-300 font-mono font-bold">4</td>
                    <td className="py-2 px-3 text-right font-mono font-bold">
                      ₱{(summary.totalGrossThirteenthMonth * 0.65).toLocaleString(undefined, {minimumFractionDigits: 2})}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-left font-medium border-r border-slate-300">Supervisory / Managerial (Voluntary/CBA)</td>
                    <td className="py-2 px-3 border-r border-slate-300 font-mono">1</td>
                    <td className="py-2 px-3 border-r border-slate-300 font-mono">1</td>
                    <td className="py-2 px-3 border-r border-slate-300 font-mono font-bold">2</td>
                    <td className="py-2 px-3 text-right font-mono font-bold">
                      ₱{(summary.totalGrossThirteenthMonth * 0.35).toLocaleString(undefined, {minimumFractionDigits: 2})}
                    </td>
                  </tr>
                </tbody>
                <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-300">
                  <tr>
                    <td className="py-2.5 px-3 text-left border-r border-slate-300 uppercase">Grand Totals</td>
                    <td className="py-2.5 px-3 border-r border-slate-300 font-mono">4</td>
                    <td className="py-2.5 px-3 border-r border-slate-300 font-mono">2</td>
                    <td className="py-2.5 px-3 border-r border-slate-300 font-mono font-black">{summary.totalEmployees}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-black text-blue-900">
                      ₱{summary.totalGrossThirteenthMonth.toLocaleString(undefined, {minimumFractionDigits: 2})}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Compliance Particulars */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
                <span className="font-bold text-slate-800 block">8. Payment Schedule & Mode:</span>
                <p className="text-slate-600">
                  • Statutory Deadline: <strong className="text-slate-900">December 24, {selectedYear}</strong>
                </p>
                <p className="text-slate-600">
                  • Actual Date of Release: <strong className="text-emerald-700">December 20, {selectedYear}</strong>
                </p>
                <p className="text-slate-600">
                  • Mode of Disbursement: <strong className="text-slate-900">Direct Bank Credit (PESONet / UnionBank Corporate)</strong>
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
                <span className="font-bold text-slate-800 block">9. Statutory Formula Applied:</span>
                <p className="text-slate-600 font-mono text-[11px]">
                  13th Month Pay = Total Basic Salary Earned ÷ 12
                </p>
                <p className="text-slate-600 text-[11px]">
                  • Unworked days (LWOP) properly deducted using DOLE 261 working days factor.
                </p>
                <p className="text-slate-600 text-[11px]">
                  • Overtime pay, night differential, and allowances excluded pursuant to PD 851.
                </p>
              </div>
            </div>

            {/* Certification and Signature Box */}
            <div className="pt-4 border-t-2 border-slate-300 space-y-4">
              <p className="text-[11px] text-slate-600 leading-relaxed italic text-justify">
                "I hereby certify under the penalties of perjury that the above information is true, correct, 
                and complete, and that the mandatory 13th-month pay for calendar year {selectedYear} has been 
                fully computed and scheduled for disbursement to all eligible employees in strict compliance with 
                Presidential Decree No. 851, DOLE Labor Advisory No. 25, and Section 32(B)(7)(e) of the National 
                Internal Revenue Code as amended by RA 10963."
              </p>

              <div className="flex flex-col sm:flex-row justify-between items-end gap-6 pt-2">
                <div className="w-full sm:w-1/2">
                  <SignatureSealBadge
                    signatory={authorizedSignatory}
                    signingDate={new Date().toISOString().split('T')[0]}
                    documentName={`DOLE-ERS-PD851-${selectedYear}`}
                    variant="detailed"
                    onManageClick={() => setIsSignatoryModalOpen(true)}
                  />
                </div>

                <div className="w-full sm:w-1/2 text-right space-y-1">
                  <div className="h-16 flex items-center justify-end">
                    {authorizedSignatory ? (
                      <img
                        src={authorizedSignatory.signatureDataUrl}
                        alt="Authorized Signature"
                        className="h-14 max-w-[200px] object-contain"
                      />
                    ) : (
                      <div className="border-b border-dashed border-slate-400 w-48 h-8" />
                    )}
                  </div>
                  <div className="border-t border-slate-800 pt-1">
                    <span className="font-bold text-sm text-slate-900 block">
                      {authorizedSignatory ? authorizedSignatory.fullName : 'Authorized Representative'}
                    </span>
                    <span className="text-[11px] text-slate-600 block">
                      {authorizedSignatory ? authorizedSignatory.title : 'HR / Compliance Director'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono block">
                      TIN: {authorizedSignatory ? authorizedSignatory.tin : '000-123-456-000'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REPORT 2: BIR FORM 2316 / ALPHA-LIST TAX SCHEDULE */}
      {activeReportType === 'bir-2316' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-5">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                BIR Form 2316 Annualization Schedule
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-1">
                13th Month & Other Benefits Statutory Tax Breakdown
              </h3>
              <p className="text-xs text-slate-500">
                Conforming to National Internal Revenue Code (NIRC) Sec. 32(B)(7)(e) and TRAIN Law (RA 10963).
              </p>
            </div>

            <button
              onClick={handleDownloadBir2316Csv}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download BIR 2316 Schedule (CSV)
            </button>
          </div>

          <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl text-xs text-purple-950 flex items-start gap-2.5">
            <Receipt className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
            <div>
              <strong className="block">BIR Form 2316 Tax Classification Guide:</strong>
              <span>
                • <strong>Box 32 (Non-Taxable/Exempt 13th Month Pay):</strong> Amounts up to the statutory ceiling of ₱90,000.00.
                <br />
                • <strong>Box 33 (Taxable 13th Month & Other Benefits):</strong> Excess amounts over ₱90,000.00, which are added to taxable compensation income and subjected to graduated withholding tax.
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Employee Name</th>
                  <th className="py-2.5 px-3">TIN</th>
                  <th className="py-2.5 px-3 text-right">Gross 13th Pay</th>
                  <th className="py-2.5 px-3 text-right text-emerald-800 font-bold">Box 32: Non-Taxable (≤ ₱90k)</th>
                  <th className="py-2.5 px-3 text-right text-amber-800 font-bold">Box 33: Taxable Excess</th>
                  <th className="py-2.5 px-3 text-right text-rose-700">Est. Tax Withheld</th>
                  <th className="py-2.5 px-3 text-right font-black text-slate-900">Net Take-Home</th>
                  <th className="py-2.5 px-3 text-center">Tax Treatment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map(rec => (
                  <tr key={rec.employeeId} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      {rec.employeeName}
                      <span className="block text-[10px] text-slate-400 font-normal">{rec.role}</span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">
                      {rec.employeeId === 'emp-001' ? '123-456-789-000' : rec.employeeId === 'emp-002' ? '987-654-321-000' : '111-222-333-000'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-medium">
                      ₱{rec.payableThirteenthMonth.toLocaleString(undefined, {minimumFractionDigits: 2})}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                      ₱{rec.taxExemptAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-700">
                      {rec.taxableExcess > 0 ? `₱${rec.taxableExcess.toLocaleString(undefined, {minimumFractionDigits: 2})}` : '₱0.00'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-rose-700">
                      {rec.estimatedWithholdingTax > 0 ? `-₱${rec.estimatedWithholdingTax.toLocaleString(undefined, {minimumFractionDigits: 2})}` : '₱0.00'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-black text-slate-900">
                      ₱{rec.netTakeHome.toLocaleString(undefined, {minimumFractionDigits: 2})}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {rec.isTaxable ? (
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                          Taxable Excess
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                          100% Exempt
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-100 border-t-2 border-slate-300 font-bold text-xs">
                <tr>
                  <td colSpan={2} className="py-3 px-3 uppercase text-slate-800">Company Totals</td>
                  <td className="py-3 px-3 text-right font-mono">
                    ₱{summary.totalPayableThirteenthMonth.toLocaleString(undefined, {minimumFractionDigits: 2})}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-emerald-800">
                    ₱{summary.totalTaxExemptDisbursement.toLocaleString(undefined, {minimumFractionDigits: 2})}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-amber-800">
                    ₱{summary.totalTaxableExcess.toLocaleString(undefined, {minimumFractionDigits: 2})}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-rose-800">
                    -₱{summary.totalEstimatedTaxWithheld.toLocaleString(undefined, {minimumFractionDigits: 2})}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-black text-blue-900">
                    ₱{summary.totalNetCashRequired.toLocaleString(undefined, {minimumFractionDigits: 2})}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* REPORT 3: BANK BATCH ELECTRONIC DISBURSEMENT */}
      {activeReportType === 'bank-batch' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                Corporate Electronic Banking Integration
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-1">
                Batch Payout Disbursement File Generator
              </h3>
              <p className="text-xs text-slate-500">
                Export auto-formatted batch payment files ready to upload to Philippine corporate banking portals.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedBank}
                onChange={(e) => setSelectedBank(e.target.value as any)}
                className="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-800"
              >
                <option value="UnionBank">UnionBank (The Portal CSV)</option>
                <option value="BDO">BDO Corporate Banking</option>
                <option value="BPI">BPI BizLink Batch</option>
                <option value="PESONet">Generic PESONet ACH</option>
              </select>

              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span>Value Date:</span>
                <input
                  type="date"
                  value={disbursementDate}
                  onChange={(e) => setDisbursementDate(e.target.value)}
                  className="px-2 py-1.5 text-xs rounded border border-slate-200 bg-white"
                />
              </div>

              <button
                onClick={handleDownloadBankBatchCsv}
                className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Export {selectedBank} File
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-400 block font-bold text-[10px] uppercase">Total Transfer Amount</span>
              <span className="text-base font-black text-slate-900 font-mono mt-0.5 block">
                ₱{summary.totalNetCashRequired.toLocaleString(undefined, {minimumFractionDigits: 2})}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-400 block font-bold text-[10px] uppercase">Recipients Count</span>
              <span className="text-base font-black text-slate-900 font-mono mt-0.5 block">
                {summary.totalEmployees} Accounts
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-400 block font-bold text-[10px] uppercase">Target Credit Date</span>
              <span className="text-base font-bold text-emerald-700 font-mono mt-0.5 block">
                {disbursementDate}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-400 block font-bold text-[10px] uppercase">Status Check</span>
              <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1 mt-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Ready for Upload
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Account No.</th>
                  <th className="py-2.5 px-3">Beneficiary Name</th>
                  <th className="py-2.5 px-3">Bank Code</th>
                  <th className="py-2.5 px-3 text-right">Net Amount</th>
                  <th className="py-2.5 px-3">Reference</th>
                  <th className="py-2.5 px-3">Disbursement Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {records.map((rec, i) => (
                  <tr key={rec.employeeId} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-semibold text-slate-800">
                      1099{(12345678 + i).toString()}
                    </td>
                    <td className="py-2.5 px-3 font-sans font-semibold text-slate-900">
                      {rec.employeeName}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">UBPPHMM1XXX</td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-700">
                      ₱{rec.netTakeHome.toLocaleString(undefined, {minimumFractionDigits: 2})}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">13TH-{rec.employeeId}-2024</td>
                    <td className="py-2.5 px-3 font-sans text-slate-500">
                      PD 851 Mandatory 13th Month Pay
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT 4: INDIVIDUAL EMPLOYEE SETTLEMENT VOUCHERS */}
      {activeReportType === 'vouchers' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-500">Select Employee:</span>
              <select
                value={selectedVoucherEmpId}
                onChange={(e) => setSelectedVoucherEmpId(e.target.value)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-800"
              >
                {records.map(r => (
                  <option key={r.employeeId} value={r.employeeId}>
                    {r.employeeName} ({r.role}) - ₱{r.netTakeHome.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Voucher
              </button>
            </div>
          </div>

          {/* Printable Voucher Paper */}
          {activeVoucherRecord && (
            <div className="bg-white rounded-2xl border border-slate-300 p-8 shadow-sm space-y-6 text-xs font-sans print:border-none print:shadow-none">
              <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">
                    Kawayan Tech Philippines Inc.
                  </span>
                  <h3 className="text-lg font-black text-slate-900 uppercase">
                    OFFICIAL 13TH-MONTH PAY SETTLEMENT VOUCHER
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    Pursuant to Presidential Decree No. 851 & Labor Advisory No. 25 • Tax Year {selectedYear}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Voucher Ref</span>
                  <span className="font-mono font-bold text-sm text-slate-900">
                    VCH-13TH-{activeVoucherRecord.employeeId}-{selectedYear}
                  </span>
                  <span className="text-[10px] text-slate-500 block">Date: {disbursementDate}</span>
                </div>
              </div>

              {/* Employee Header */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Employee Name</span>
                  <span className="font-bold text-slate-900 text-sm block">{activeVoucherRecord.employeeName}</span>
                  <span className="text-[11px] text-slate-500">{activeVoucherRecord.role}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Department</span>
                  <span className="font-semibold text-slate-800 block">{activeVoucherRecord.department}</span>
                  <span className="text-[11px] text-slate-500">Hired: {activeVoucherRecord.joinDate}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Monthly Basic Salary</span>
                  <span className="font-mono font-bold text-slate-900 block">
                    ₱{activeVoucherRecord.currentMonthlySalary.toLocaleString(undefined, {minimumFractionDigits: 2})}
                  </span>
                  <span className="text-[11px] text-slate-500">Daily: ₱{activeVoucherRecord.dailyRate.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Tenure Coverage</span>
                  <span className="font-mono font-bold text-blue-700 block">{activeVoucherRecord.proRatedFraction}</span>
                  <span className="text-[10px] text-slate-500">
                    {activeVoucherRecord.isProRated ? 'Pro-Rated Service' : 'Full 12 Months'}
                  </span>
                </div>
              </div>

              {/* Month-by-month table summary */}
              <div>
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
                  12-Month Computation Basis
                </span>
                <table className="w-full border border-slate-200 text-xs">
                  <thead className="bg-slate-100 font-semibold text-slate-700">
                    <tr>
                      <th className="py-2 px-3 text-left">Month</th>
                      <th className="py-2 px-3 text-right">Scheduled Basic</th>
                      <th className="py-2 px-3 text-center">Unpaid LWOP</th>
                      <th className="py-2 px-3 text-right">Deduction</th>
                      <th className="py-2 px-3 text-right font-bold">Net Basic Earned</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeVoucherRecord.monthlyBreakdown.map(m => (
                      <tr key={m.monthIndex} className={!m.isEmployed ? 'bg-slate-50 text-slate-400' : ''}>
                        <td className="py-1.5 px-3 font-medium">{m.monthName}</td>
                        <td className="py-1.5 px-3 text-right font-mono">
                          {m.isEmployed ? `₱${m.baseSalary.toLocaleString(undefined, {minimumFractionDigits: 2})}` : '—'}
                        </td>
                        <td className="py-1.5 px-3 text-center font-mono">
                          {m.unpaidDays > 0 ? `${m.unpaidDays} d` : '0'}
                        </td>
                        <td className="py-1.5 px-3 text-right font-mono text-rose-600">
                          {m.unpaidDeduction > 0 ? `-₱${m.unpaidDeduction.toLocaleString()}` : '₱0.00'}
                        </td>
                        <td className="py-1.5 px-3 text-right font-mono font-semibold">
                          ₱{m.actualBasicEarned.toLocaleString(undefined, {minimumFractionDigits: 2})}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 border-t font-bold">
                    <tr>
                      <td colSpan={4} className="py-2 px-3 uppercase text-right">Total Basic Salary Earned in {selectedYear}:</td>
                      <td className="py-2 px-3 text-right font-mono font-black text-blue-900">
                        ₱{activeVoucherRecord.totalAnnualBasicEarned.toLocaleString(undefined, {minimumFractionDigits: 2})}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Mathematical Settlement Summary */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-600">1. Gross 13th Month Pay (Total Earned ÷ 12):</span>
                  <span className="font-mono font-bold text-slate-900">
                    ₱{activeVoucherRecord.rawCalculatedAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}
                  </span>
                </div>
                {activeVoucherRecord.midYearAdvanceDeducted > 0 && (
                  <div className="flex justify-between py-1 border-b border-slate-200 text-rose-600">
                    <span>2. Less: Mid-Year Advance (May/June Payout):</span>
                    <span className="font-mono font-bold">
                      -₱{activeVoucherRecord.midYearAdvanceDeducted.toLocaleString(undefined, {minimumFractionDigits: 2})}
                    </span>
                  </div>
                )}
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-600">3. Non-Taxable Portion under TRAIN Law (Cap ₱90k):</span>
                  <span className="font-mono font-bold text-emerald-700">
                    ₱{activeVoucherRecord.taxExemptAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}
                  </span>
                </div>
                {activeVoucherRecord.isTaxable && (
                  <div className="flex justify-between py-1 border-b border-slate-200 text-amber-700">
                    <span>4. Taxable Excess over ₱90,000 Threshold:</span>
                    <span className="font-mono font-bold">
                      ₱{activeVoucherRecord.taxableExcess.toLocaleString(undefined, {minimumFractionDigits: 2})}
                    </span>
                  </div>
                )}
                {activeVoucherRecord.estimatedWithholdingTax > 0 && (
                  <div className="flex justify-between py-1 border-b border-slate-200 text-rose-700">
                    <span>5. Estimated Withholding Tax on Excess:</span>
                    <span className="font-mono font-bold">
                      -₱{activeVoucherRecord.estimatedWithholdingTax.toLocaleString(undefined, {minimumFractionDigits: 2})}
                    </span>
                  </div>
                )}
                <div className="flex justify-between py-2 pt-3 border-t-2 border-slate-400 text-sm">
                  <span className="font-bold text-slate-900 uppercase">Net 13th-Month Pay Disbursed:</span>
                  <span className="font-mono font-black text-blue-900 text-base">
                    ₱{activeVoucherRecord.netTakeHome.toLocaleString(undefined, {minimumFractionDigits: 2})}
                  </span>
                </div>
              </div>

              {/* Dual Signature Section */}
              <div className="pt-4 border-t border-slate-300 grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Employer Certification:</span>
                  <div className="h-14 flex items-center">
                    {authorizedSignatory ? (
                      <img
                        src={authorizedSignatory.signatureDataUrl}
                        alt="Authorized HR Signature"
                        className="h-12 max-w-[180px] object-contain"
                      />
                    ) : (
                      <div className="border-b border-dashed border-slate-400 w-40 h-8" />
                    )}
                  </div>
                  <div className="border-t border-slate-800 pt-1">
                    <span className="font-bold text-slate-900 block">
                      {authorizedSignatory ? authorizedSignatory.fullName : 'Authorized HR Representative'}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {authorizedSignatory ? authorizedSignatory.title : 'HR Director'} • RA 8792 Certified
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Employee Acknowledgment:</span>
                  <div className="h-14 flex items-center justify-center text-slate-300 italic text-[11px]">
                    (Acknowledged via ESS Portal)
                  </div>
                  <div className="border-t border-slate-800 pt-1">
                    <span className="font-bold text-slate-900 block">{activeVoucherRecord.employeeName}</span>
                    <span className="text-[10px] text-slate-500">
                      Signature over Printed Name / Electronic Confirmation
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Signature Picker Modal */}
      <SignaturePickerModal
        isOpen={isSignatoryModalOpen}
        onClose={() => setIsSignatoryModalOpen(false)}
        category="dole"
        currentSignatoryId={authorizedSignatory?.id}
        onSelectSignatory={(signer) => setAuthorizedSignatory(signer)}
      />
    </div>
  );
}
