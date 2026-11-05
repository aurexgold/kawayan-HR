import React, { useState, useRef, useMemo } from 'react';
import { 
  X, UploadCloud, FileSpreadsheet, Download, CheckCircle2, 
  AlertTriangle, AlertCircle, RefreshCw, Sparkles, Filter, 
  ArrowRight, ShieldCheck, DollarSign, Users, ChevronRight,
  FileCheck, HelpCircle, Check, Eye
} from 'lucide-react';
import { Employee } from '../../types';
import { 
  parseBulkRemittanceCsv, 
  generateRemittanceCsvTemplate, 
  downloadRemittanceTemplate,
  autoCorrectRowsToStatutory,
  generateVarianceAuditCsv,
  BulkRemittanceParseResult,
  BulkRemittanceRowItem,
  RemittanceAgencyType
} from '../../lib/bulk-remittance-parser';

interface BulkRemittanceUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  selectedMonth: string;
  onApplyReconciliation: (result: BulkRemittanceParseResult) => void;
}

export function BulkRemittanceUploadModal({
  isOpen,
  onClose,
  employees,
  selectedMonth,
  onApplyReconciliation,
}: BulkRemittanceUploadModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [inputMode, setInputMode] = useState<'upload' | 'paste'>('upload');
  const [csvText, setCsvText] = useState<string>('');
  const [selectedAgency, setSelectedAgency] = useState<RemittanceAgencyType>('ALL');
  const [parseResult, setParseResult] = useState<BulkRemittanceParseResult | null>(null);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'VARIANCE' | 'MISSING_ID' | 'MATCH'>('ALL');
  const [fileName, setFileName] = useState<string>('');

  // Handle file drop or selection
  const handleFileUpload = (file: File) => {
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setCsvText(text);
      const parsed = parseBulkRemittanceCsv(text, employees, selectedMonth);
      parsed.fileName = file.name;
      setParseResult(parsed);
    };
    reader.readAsText(file);
  };

  // Handle loading sample CSV data (includes realistic discrepancies to demonstrate reconciliation)
  const handleLoadSample = (withVariances: boolean = true) => {
    let sample = generateRemittanceCsvTemplate('ALL');
    if (withVariances) {
      // Modify one employee to have an under-deduction and one to have an invalid SSS ID for demonstration
      sample = sample.replace('1350.00,2880.00', '1100.00,2880.00'); // ₱250 SSS under-deduction
      sample = sample.replace('1234-5678-9012', '1234-5678'); // Invalid Pag-IBIG length
    }
    setFileName('Sample_Remittances_Audit.csv');
    setCsvText(sample);
    const parsed = parseBulkRemittanceCsv(sample, employees, selectedMonth);
    parsed.fileName = 'Sample_Remittances_Audit.csv';
    setParseResult(parsed);
  };

  // Handle manual paste parse
  const handleParsePastedText = () => {
    if (!csvText.trim()) return;
    const parsed = parseBulkRemittanceCsv(csvText, employees, selectedMonth);
    parsed.fileName = fileName || 'Pasted_Remittance_Data.csv';
    setParseResult(parsed);
  };

  // Auto-correct rows
  const handleAutoCorrect = () => {
    if (!parseResult) return;
    const correctedRows = autoCorrectRowsToStatutory(parseResult.rows);
    const newResult: BulkRemittanceParseResult = {
      ...parseResult,
      rows: correctedRows,
      varianceCount: 0,
      matchedCount: correctedRows.filter(r => r.status === 'MATCH').length,
      netVariance: 0,
      totalUploadedRemittance: parseResult.totalExpectedRemittance,
    };
    setParseResult(newResult);
  };

  // Download variance audit report
  const handleDownloadVarianceReport = () => {
    if (!parseResult) return;
    const csv = generateVarianceAuditCsv(parseResult);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Remittance_Variance_Audit_${selectedMonth}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered rows for the review table
  const visibleRows = useMemo(() => {
    if (!parseResult) return [];
    if (filterStatus === 'ALL') return parseResult.rows;
    return parseResult.rows.filter(r => r.status === filterStatus);
  }, [parseResult, filterStatus]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full overflow-hidden flex flex-col max-h-[92vh] border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Bulk Upload Remittances & Statutory Reconciliation
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/30 text-emerald-300 border border-emerald-400/30">
                  SSS · PhilHealth · Pag-IBIG
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Upload monthly payroll remittance CSVs to automatically audit deducted amounts against Republic Act statutory brackets.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Templates Banner Strip */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <Download className="w-4 h-4 text-blue-600" />
              <span>Download Official Remittance CSV Templates:</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => downloadRemittanceTemplate('ALL')}
                className="px-2.5 py-1 text-[11px] font-semibold bg-white border border-blue-200 hover:bg-blue-50 text-blue-700 rounded-md transition-all shadow-2xs flex items-center gap-1"
                title="Unified 3-Agency Master Remittance CSV"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
                Master Remittance CSV
              </button>
              <button
                type="button"
                onClick={() => downloadRemittanceTemplate('SSS')}
                className="px-2.5 py-1 text-[11px] font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-md transition-all shadow-2xs"
                title="SSS Form R-3 Collection Format"
              >
                SSS R-3
              </button>
              <button
                type="button"
                onClick={() => downloadRemittanceTemplate('PHILHEALTH')}
                className="px-2.5 py-1 text-[11px] font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-md transition-all shadow-2xs"
                title="PhilHealth EPRS RF-1 Format"
              >
                PhilHealth EPRS
              </button>
              <button
                type="button"
                onClick={() => downloadRemittanceTemplate('PAGIBIG')}
                className="px-2.5 py-1 text-[11px] font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-md transition-all shadow-2xs"
                title="Pag-IBIG MCRF Remittance Format"
              >
                Pag-IBIG MCRF
              </button>
            </div>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">

          {/* Section 1: Upload or Input */}
          {!parseResult ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Step 1: Select or Paste Monthly Remittance File
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleLoadSample(true)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Load Sample with Discrepancies
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLoadSample(false)}
                    className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Load 100% Compliant Sample
                  </button>
                </div>
              </div>

              {/* Mode Switcher */}
              <div className="flex border-b border-slate-200 text-xs font-semibold text-slate-600 gap-4">
                <button
                  type="button"
                  onClick={() => setInputMode('upload')}
                  className={`pb-2 border-b-2 transition-colors ${
                    inputMode === 'upload' ? 'border-emerald-600 text-emerald-700 font-bold' : 'border-transparent text-slate-500'
                  }`}
                >
                  File Upload (.csv)
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('paste')}
                  className={`pb-2 border-b-2 transition-colors ${
                    inputMode === 'paste' ? 'border-emerald-600 text-emerald-700 font-bold' : 'border-transparent text-slate-500'
                  }`}
                >
                  Paste CSV Raw Content
                </button>
              </div>

              {inputMode === 'upload' ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files?.[0]) {
                      handleFileUpload(e.dataTransfer.files[0]);
                    }
                  }}
                  className="border-2 border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/20 rounded-2xl p-8 text-center cursor-pointer transition-all space-y-3"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,text/csv"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleFileUpload(e.target.files[0]);
                      }
                    }}
                  />
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100/70 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
                    <UploadCloud className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      Click to browse or drag and drop your remittance CSV file
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Supports Master CSV, SSS R-3, PhilHealth EPRS RF-1, and Pag-IBIG MCRF formats.
                    </p>
                  </div>
                  <div className="inline-block text-[11px] font-mono font-semibold px-3 py-1 bg-slate-100 rounded-lg text-slate-600 border border-slate-200">
                    Period Month: {selectedMonth}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <textarea
                    rows={8}
                    value={csvText}
                    onChange={(e) => setCsvText(e.target.value)}
                    placeholder="Paste CSV rows here (including header line)..."
                    className="w-full p-3 font-mono text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleParsePastedText}
                      disabled={!csvText.trim()}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
                    >
                      Audit & Reconcile Pasted CSV
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Section 2: Audit & Reconciliation Ledger */
            <div className="space-y-5">
              
              {/* Top Metrics Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Rows Processed
                  </span>
                  <span className="text-lg font-black text-slate-900 font-mono mt-0.5 block">
                    {parseResult.totalRows}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    File: {parseResult.fileName || 'Uploaded CSV'}
                  </span>
                </div>

                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                    Exact Match
                  </span>
                  <span className="text-lg font-black text-emerald-800 font-mono mt-0.5 block">
                    {parseResult.matchedCount}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-medium">
                    100% Statutory Compliant
                  </span>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
                    Variances Detected
                  </span>
                  <span className="text-lg font-black text-amber-800 font-mono mt-0.5 block">
                    {parseResult.varianceCount}
                  </span>
                  <span className="text-[10px] text-amber-600 font-medium">
                    Rate or Bracket Discrepancy
                  </span>
                </div>

                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
                  <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">
                    Missing / Invalid IDs
                  </span>
                  <span className="text-lg font-black text-rose-800 font-mono mt-0.5 block">
                    {parseResult.missingIdCount}
                  </span>
                  <span className="text-[10px] text-rose-600 font-medium">
                    Format check failed
                  </span>
                </div>

                <div className="p-3 bg-slate-900 border border-slate-800 text-white rounded-xl col-span-2 sm:col-span-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Net Variance Delta
                  </span>
                  <span className={`text-base font-black font-mono mt-0.5 block ${
                    parseResult.netVariance === 0 ? 'text-emerald-400' : parseResult.netVariance > 0 ? 'text-amber-400' : 'text-rose-400'
                  }`}>
                    {parseResult.netVariance > 0 ? `+₱${parseResult.netVariance.toFixed(2)}` : parseResult.netVariance < 0 ? `-₱${Math.abs(parseResult.netVariance).toFixed(2)}` : '₱0.00 (Balanced)'}
                  </span>
                  <span className="text-[9px] text-slate-400 block truncate">
                    Uploaded: ₱{parseResult.totalUploadedRemittance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Table Toolbar & Filters */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setFilterStatus('ALL')}
                    className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                      filterStatus === 'ALL' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600'
                    }`}
                  >
                    All Rows ({parseResult.rows.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterStatus('VARIANCE')}
                    className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                      filterStatus === 'VARIANCE' ? 'bg-amber-100 text-amber-900 font-bold' : 'text-slate-600'
                    }`}
                  >
                    Variances ({parseResult.varianceCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterStatus('MISSING_ID')}
                    className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                      filterStatus === 'MISSING_ID' ? 'bg-rose-100 text-rose-900 font-bold' : 'text-slate-600'
                    }`}
                  >
                    Flagged IDs ({parseResult.missingIdCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterStatus('MATCH')}
                    className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                      filterStatus === 'MATCH' ? 'bg-emerald-100 text-emerald-900 font-bold' : 'text-slate-600'
                    }`}
                  >
                    Compliant ({parseResult.matchedCount})
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {parseResult.varianceCount > 0 && (
                    <button
                      type="button"
                      onClick={handleAutoCorrect}
                      className="px-3 py-1.5 bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-900 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
                      title="Adjust all uploaded deduction values to the official statutory bracket schedules"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      Auto-Correct to Statutory Brackets
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleDownloadVarianceReport}
                    className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-600" />
                    Export Variance Audit (CSV)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setParseResult(null);
                      setCsvText('');
                      setFileName('');
                    }}
                    className="text-xs text-slate-500 hover:text-slate-800 underline px-1"
                  >
                    Upload Another File
                  </button>
                </div>
              </div>

              {/* Reconciliation Rows Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <div className="overflow-x-auto max-h-80">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-[10px] font-bold text-slate-600 uppercase tracking-wider sticky top-0 border-b border-slate-200 z-10">
                      <tr>
                        <th className="px-3.5 py-2.5">Row / Personnel</th>
                        <th className="px-3 py-2.5">Basic Salary</th>
                        <th className="px-3 py-2.5">SSS Uploaded vs Legal</th>
                        <th className="px-3 py-2.5">PhilHealth Uploaded vs Legal</th>
                        <th className="px-3 py-2.5">Pag-IBIG Uploaded vs Legal</th>
                        <th className="px-3 py-2.5 text-right">Uploaded Remittance</th>
                        <th className="px-3 py-2.5 text-right">Variance Delta</th>
                        <th className="px-3.5 py-2.5 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                      {visibleRows.map((r) => {
                        const hasSssVariance = Math.abs(r.sssVarianceEE) > 0.05;
                        const hasPhVariance = Math.abs(r.phVarianceEE) > 0.05;
                        const hasHdmfVariance = Math.abs(r.hdmfVarianceEE) > 0.05;

                        return (
                          <tr key={r.rowNumber} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-3.5 py-2.5 font-sans">
                              <div className="font-bold text-slate-900">{r.employeeName}</div>
                              <div className="text-[10px] text-slate-500 font-mono">
                                {r.employeeId} • {r.department}
                              </div>
                            </td>

                            <td className="px-3 py-2.5 font-bold text-slate-900">
                              ₱{r.basicSalary.toLocaleString()}
                            </td>

                            {/* SSS */}
                            <td className="px-3 py-2.5">
                              <div>
                                <span className={hasSssVariance ? 'font-bold text-rose-600' : 'text-slate-800'}>
                                  ₱{r.uploadedSssEE.toFixed(2)} EE
                                </span>
                                <span className="text-slate-400"> / ₱{r.uploadedSssER.toFixed(2)} ER</span>
                              </div>
                              {hasSssVariance ? (
                                <span className="text-[9px] text-rose-600 block">
                                  Expected: ₱{r.expectedSssEE.toFixed(2)} ({r.sssVarianceEE > 0 ? `+₱${r.sssVarianceEE.toFixed(2)}` : `-₱${Math.abs(r.sssVarianceEE).toFixed(2)}`})
                                </span>
                              ) : (
                                <span className="text-[9px] text-emerald-600 block">Statutory Matched</span>
                              )}
                            </td>

                            {/* PhilHealth */}
                            <td className="px-3 py-2.5">
                              <div>
                                <span className={hasPhVariance ? 'font-bold text-rose-600' : 'text-slate-800'}>
                                  ₱{r.uploadedPhEE.toFixed(2)} EE
                                </span>
                                <span className="text-slate-400"> / ₱{r.uploadedPhER.toFixed(2)} ER</span>
                              </div>
                              {hasPhVariance ? (
                                <span className="text-[9px] text-rose-600 block">
                                  Expected: ₱{r.expectedPhEE.toFixed(2)} ({r.phVarianceEE > 0 ? `+₱${r.phVarianceEE.toFixed(2)}` : `-₱${Math.abs(r.phVarianceEE).toFixed(2)}`})
                                </span>
                              ) : (
                                <span className="text-[9px] text-emerald-600 block">5% Split Matched</span>
                              )}
                            </td>

                            {/* Pag-IBIG */}
                            <td className="px-3 py-2.5">
                              <div>
                                <span className={hasHdmfVariance ? 'font-bold text-rose-600' : 'text-slate-800'}>
                                  ₱{r.uploadedHdmfEE.toFixed(2)} EE
                                </span>
                                <span className="text-slate-400"> / ₱{r.uploadedHdmfER.toFixed(2)} ER</span>
                              </div>
                              {hasHdmfVariance ? (
                                <span className="text-[9px] text-rose-600 block">
                                  Expected: ₱{r.expectedHdmfEE.toFixed(2)} ({r.hdmfVarianceEE > 0 ? `+₱${r.hdmfVarianceEE.toFixed(2)}` : `-₱${Math.abs(r.hdmfVarianceEE).toFixed(2)}`})
                                </span>
                              ) : (
                                <span className="text-[9px] text-emerald-600 block">Cir. 460 Matched</span>
                              )}
                            </td>

                            {/* Uploaded Remittance */}
                            <td className="px-3 py-2.5 text-right font-bold text-slate-900">
                              ₱{r.uploadedTotalRemittance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>

                            {/* Variance Delta */}
                            <td className={`px-3 py-2.5 text-right font-bold ${
                              r.totalVariance === 0 ? 'text-emerald-600' : r.totalVariance > 0 ? 'text-amber-600' : 'text-rose-600'
                            }`}>
                              {r.totalVariance === 0 ? '₱0.00' : r.totalVariance > 0 ? `+₱${r.totalVariance.toFixed(2)}` : `-₱${Math.abs(r.totalVariance).toFixed(2)}`}
                            </td>

                            {/* Status */}
                            <td className="px-3.5 py-2.5 text-center font-sans">
                              {r.status === 'MATCH' && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  Compliant
                                </span>
                              )}
                              {r.status === 'VARIANCE' && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200" title={r.notes.join('; ')}>
                                  Variance
                                </span>
                              )}
                              {r.status === 'MISSING_ID' && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200" title={r.notes.join('; ')}>
                                  Flagged ID
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg transition-colors shadow-2xs"
            >
              Close
            </button>
            {parseResult && (
              <span className="text-xs text-slate-500 hidden sm:inline">
                {parseResult.totalRows} records evaluated for {selectedMonth} remittance cycle.
              </span>
            )}
          </div>

          {parseResult && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onApplyReconciliation(parseResult);
                  onClose();
                }}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Check className="w-4 h-4" />
                Apply Reconciled Remittance to Dashboard
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
