import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  ShieldCheck, Calculator, Download, Printer, CheckCircle2, 
  AlertTriangle, AlertCircle, Search, Filter, RefreshCw, 
  Building2, Users, FileSpreadsheet, Eye, HelpCircle, 
  ArrowRight, ExternalLink, Calendar, PenTool, Check, 
  FileText, Landmark, HeartPulse, Home, UploadCloud, Sparkles, X,
  Scale
} from 'lucide-react';
import { useEmployees } from '../lib/employee-store';
import { 
  generateMonthlyComplianceRecords, 
  generateMasterContributionsCsv, 
  generateSssR3Csv, 
  generatePhilhealthEprsCsv, 
  generatePagibigMcrfCsv,
  EmployeeComplianceRecord, 
  OverallStatutoryAuditReport,
  StatutoryAgency,
  ComplianceStatus
} from '../lib/statutory-compliance';
import { 
  AuthorizedSignatory, 
  signatureRepository 
} from '../lib/signature-repository';
import { SignaturePickerModal } from '../components/signatures/SignaturePickerModal';
import { BulkRemittanceUploadModal } from '../components/contributions/BulkRemittanceUploadModal';
import { BulkRemittanceParseResult, applyBulkRemittanceToAuditReport } from '../lib/bulk-remittance-parser';
import { StatutoryBracketCalculator } from '../components/payroll/StatutoryBracketCalculator';

export function ContributionsCompliancePage() {
  const { employees } = useEmployees();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlTab = searchParams.get('tab') || searchParams.get('view');
  const [activeMainView, setActiveMainView] = useState<'audit' | 'calculator'>(
    urlTab === 'calculator' || urlTab === 'brackets' ? 'calculator' : 'audit'
  );
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-11');
  const [selectedAgencyFilter, setSelectedAgencyFilter] = useState<StatutoryAgency>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Bulk upload modal & reconciliation state
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState<boolean>(false);
  const [reconciledUpload, setReconciledUpload] = useState<BulkRemittanceParseResult | null>(null);

  // Inspector modal state
  const [inspectedRecord, setInspectedRecord] = useState<EmployeeComplianceRecord | null>(null);
  const [showCertificateModal, setShowCertificateModal] = useState<boolean>(false);
  const [isPickerModalOpen, setIsPickerModalOpen] = useState<boolean>(false);

  // Signatory from Central Signature Repository
  const [signatory, setSignatory] = useState<AuthorizedSignatory | null>(() => {
    return signatureRepository.resolveSignatureForDocument('payroll').signatory;
  });

  // Subscribe to central signature repository
  useEffect(() => {
    const sync = () => {
      setSignatory(signatureRepository.resolveSignatureForDocument('payroll').signatory);
    };
    return signatureRepository.subscribe(sync);
  }, []);

  // Compute base statutory compliance audit report from registry
  const baseAuditReport: OverallStatutoryAuditReport = useMemo(() => {
    return generateMonthlyComplianceRecords(employees, selectedMonth);
  }, [employees, selectedMonth]);

  // If a bulk remittance CSV was uploaded and applied, reconcile and merge actual values
  const auditReport: OverallStatutoryAuditReport = useMemo(() => {
    if (reconciledUpload) {
      return applyBulkRemittanceToAuditReport(baseAuditReport, reconciledUpload);
    }
    return baseAuditReport;
  }, [baseAuditReport, reconciledUpload]);

  // Filtered records
  const filteredRecords = useMemo(() => {
    return auditReport.records.filter((rec) => {
      const matchSearch = 
        rec.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.sssNumber.includes(searchQuery) ||
        rec.philhealthNumber.includes(searchQuery) ||
        rec.pagibigNumber.includes(searchQuery);

      const matchStatus = 
        selectedStatusFilter === 'ALL' ||
        rec.overallStatus === selectedStatusFilter;

      return matchSearch && matchStatus;
    });
  }, [auditReport.records, searchQuery, selectedStatusFilter]);

  // CSV download handlers
  const handleDownloadMasterCsv = () => {
    const csv = generateMasterContributionsCsv(auditReport);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Statutory_Contributions_Audit_Master_${selectedMonth}.csv`;
    link.click();
  };

  const handleDownloadSssCsv = () => {
    const csv = generateSssR3Csv(auditReport);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SSS_Form_R3_Collection_List_${selectedMonth}.csv`;
    link.click();
  };

  const handleDownloadPhilhealthCsv = () => {
    const csv = generatePhilhealthEprsCsv(auditReport);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `PhilHealth_EPRS_RF1_${selectedMonth}.csv`;
    link.click();
  };

  const handleDownloadPagibigCsv = () => {
    const csv = generatePagibigMcrfCsv(auditReport);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `PagIBIG_MCRF_Remittance_${selectedMonth}.csv`;
    link.click();
  };

  const verificationHash = signatory
    ? signatureRepository.generateTamperEvidentHash(signatory, `STATUTORY-COMPLIANCE-${selectedMonth}`)
    : '';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header & Context Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Government Contributions Tracking & Compliance
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 font-mono">
              RA 11199 · RA 11223 · Cir. 460
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200 font-mono">
              {auditReport.complianceScorePercent}% Compliant
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1 max-w-3xl">
            Audit and validate monthly statutory deductions (SSS, PhilHealth, Pag-IBIG) for each employee against official government bracket schedules to prevent penalties and ensure Philippine payroll compliance.
          </p>
        </div>

        {/* Global Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/payroll"
            className="flex items-center text-xs font-semibold px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors shadow-xs"
          >
            <Calculator className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
            Payroll Hub
          </Link>

          <button
            onClick={() => setIsBulkUploadModalOpen(true)}
            className="flex items-center text-xs font-bold px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
          >
            <UploadCloud className="w-3.5 h-3.5 mr-1.5" />
            Bulk Upload Remittances (CSV)
          </button>

          <button
            onClick={() => setShowCertificateModal(true)}
            className="flex items-center text-xs font-bold px-3.5 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5 mr-1.5" />
            Print Statutory Certificate
          </button>

          <button
            onClick={handleDownloadMasterCsv}
            className="flex items-center text-xs font-semibold px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Master Audit CSV
          </button>
        </div>
      </div>

      {/* Primary View Switcher */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-4 pt-2 gap-2 shadow-xs overflow-x-auto">
        <button
          onClick={() => setActiveMainView('audit')}
          className={`py-3 px-4 font-bold text-xs border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
            activeMainView === 'audit'
              ? 'border-emerald-600 text-emerald-800 bg-emerald-50/70 rounded-t-lg'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Statutory Compliance Audit & Remittances ({employees.length} Staff)
        </button>

        <button
          onClick={() => setActiveMainView('calculator')}
          className={`py-3 px-4 font-bold text-xs border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
            activeMainView === 'calculator'
              ? 'border-indigo-600 text-indigo-700 bg-indigo-50/70 rounded-t-lg'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Calculator className="w-4 h-4 text-indigo-600" />
          Interactive SSS, PhilHealth & Pag-IBIG Bracket Calculator
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 ml-1">Real-Time</span>
        </button>
      </div>

      {activeMainView === 'calculator' && (
        <StatutoryBracketCalculator />
      )}

      {activeMainView === 'audit' && (
        <>
          {/* Reconciled Upload Active Notification Banner */}
      {reconciledUpload && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-900 shadow-2xs">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold flex flex-wrap items-center gap-2">
                <span className="text-sm text-emerald-950">Remittance File Reconciled: {reconciledUpload.fileName || 'Uploaded CSV'}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-200 text-emerald-900">
                  {reconciledUpload.totalRows} Records Audited
                </span>
                {reconciledUpload.varianceCount > 0 ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    {reconciledUpload.varianceCount} Variances Flagged
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    100% Statutory Matched
                  </span>
                )}
              </div>
              <p className="text-xs text-emerald-700 mt-0.5">
                The dashboard, agency breakdowns, and compliance certificate below are now auditing your uploaded payment records for cycle {selectedMonth}.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              onClick={() => setIsBulkUploadModalOpen(true)}
              className="px-3 py-1.5 bg-white border border-emerald-300 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-lg transition-colors shadow-2xs"
            >
              Inspect Reconciliation
            </button>
            <button
              onClick={() => setReconciledUpload(null)}
              className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg transition-colors shadow-2xs"
            >
              Revert to Registry Base
            </button>
          </div>
        </div>
      )}

      {/* KPI Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Compliance Score Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Compliance Health
            </span>
            <span className="text-2xl font-black text-slate-900 font-mono mt-0.5 block">
              {auditReport.complianceScorePercent}%
            </span>
            <span className="text-xs text-slate-500 mt-1 block">
              {auditReport.compliantCount} of {auditReport.totalEmployees} employees verified
            </span>
          </div>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm ${
            auditReport.complianceScorePercent >= 90 
              ? 'bg-emerald-100 text-emerald-800 border-2 border-emerald-300' 
              : 'bg-amber-100 text-amber-800 border-2 border-amber-300'
          }`}>
            <ShieldCheck className="w-6 h-6 text-emerald-700" />
          </div>
        </div>

        {/* Total Remittance Due Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Combined Remittance Due
          </span>
          <span className="text-2xl font-black text-emerald-700 font-mono mt-0.5 block">
            ₱{auditReport.totalGovernmentRemittanceDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
          <span className="text-xs text-slate-500 mt-1 block">
            SSS + PhilHealth + Pag-IBIG total
          </span>
        </div>

        {/* Total Employee Share Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Employee Deductions (EE)
          </span>
          <span className="text-2xl font-black text-blue-700 font-mono mt-0.5 block">
            ₱{auditReport.totalEmployeeDeductions.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
          <span className="text-xs text-slate-500 mt-1 block">
            Withheld from monthly employee payroll
          </span>
        </div>

        {/* Total Employer Burden Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Employer Mandated Cost (ER)
          </span>
          <span className="text-2xl font-black text-slate-800 font-mono mt-0.5 block">
            ₱{auditReport.totalEmployerContributions.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
          <span className="text-xs text-slate-500 mt-1 block">
            Company statutory burden (non-deductible)
          </span>
        </div>
      </div>

      {/* Agency Remittance Breakdown Strip (3 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {auditReport.agencySummaries.map((agency) => {
          const isSss = agency.agency === 'SSS';
          const isPh = agency.agency === 'PHILHEALTH';
          const isHdmf = agency.agency === 'PAGIBIG';

          return (
            <div
              key={agency.agency}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${
                      isSss ? 'bg-blue-100 text-blue-800' :
                      isPh ? 'bg-emerald-100 text-emerald-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {agency.agency}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">{agency.name}</h3>
                      <p className="text-[10px] text-slate-400 font-mono">{agency.governingLaw}</p>
                    </div>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1.5 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Employee Share (EE):</span>
                    <span className="font-mono font-bold text-slate-800">
                      ₱{agency.totalEE.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Employer Share (ER):</span>
                    <span className="font-mono font-bold text-slate-800">
                      ₱{agency.totalER.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-1.5 border-t border-slate-200 font-bold">
                    <span className="text-slate-900">Total Remittance:</span>
                    <span className="font-mono text-emerald-700 text-sm">
                      ₱{agency.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Due: <strong className="text-slate-800">{agency.remittanceDueDate}</strong></span>
                  <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded">
                    {agency.compliantCount}/{auditReport.totalEmployees} Verified
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono truncate">{agency.reportingForm}</span>
                <button
                  onClick={isSss ? handleDownloadSssCsv : isPh ? handleDownloadPhilhealthCsv : handleDownloadPagibigCsv}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> CSV Export
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Period Month Selector */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="text-xs font-bold text-slate-700">Audit Period:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            >
              <option value="2026-11">November 2026 (Active Payroll)</option>
              <option value="2026-10">October 2026</option>
              <option value="2026-09">September 2026</option>
              <option value="2026-08">August 2026</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-500">Status:</span>
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700"
            >
              <option value="ALL">All Employees ({auditReport.totalEmployees})</option>
              <option value="COMPLIANT">Fully Compliant ({auditReport.compliantCount})</option>
              <option value="MISSING_ID">Missing / Incomplete ID ({auditReport.missingIdCount})</option>
              <option value="WARNING">Audit Warnings ({auditReport.warningCount})</option>
            </select>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search employee, ID, role, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Master Contributions Validation Roster */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              Monthly Statutory Deductions & Validation Schedule ({selectedMonth})
            </h3>
            <p className="text-xs text-slate-500">
              Verified against current 2024/2026 statutory bracket tables. Click any employee row to inspect bracket calculations.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
            {filteredRecords.length} Records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Employee Name</th>
                <th className="px-3 py-3">Basic Salary</th>
                <th className="px-3 py-3">Government Registration IDs</th>
                <th className="px-3 py-3 text-right">SSS (EE / ER / WISP)</th>
                <th className="px-3 py-3 text-right">PhilHealth (5%)</th>
                <th className="px-3 py-3 text-right">Pag-IBIG (Cap ₱200)</th>
                <th className="px-3 py-3 text-right font-black text-slate-900">Total EE Deducted</th>
                <th className="px-3 py-3 text-right font-bold text-emerald-800">Employer Burden</th>
                <th className="px-3 py-3 text-center">Audit Status</th>
                <th className="px-3 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.map((rec) => {
                const hasMissingId = rec.overallStatus === 'MISSING_ID';

                return (
                  <tr key={rec.employeeId} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {rec.employeeName}
                      <span className="block text-[11px] text-slate-400 font-medium">
                        {rec.role} • {rec.department}
                      </span>
                    </td>

                    <td className="px-3 py-3 font-mono font-bold text-slate-800">
                      ₱{rec.basicSalary.toLocaleString()}
                    </td>

                    <td className="px-3 py-3 text-[11px] font-mono space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400 text-[9px] w-8">SSS:</span>
                        <span className={rec.sssStatus === 'MISSING_ID' ? 'text-rose-600 font-bold' : 'text-slate-700'}>
                          {rec.sssNumber}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400 text-[9px] w-8">PHIC:</span>
                        <span className={rec.philhealthStatus === 'MISSING_ID' ? 'text-rose-600 font-bold' : 'text-slate-700'}>
                          {rec.philhealthNumber}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400 text-[9px] w-8">HDMF:</span>
                        <span className={rec.pagibigStatus === 'MISSING_ID' ? 'text-rose-600 font-bold' : 'text-slate-700'}>
                          {rec.pagibigNumber}
                        </span>
                      </div>
                    </td>

                    <td className="px-3 py-3 text-right font-mono">
                      <span className="font-bold text-slate-900 block">₱{rec.sssTotalEE.toFixed(2)}</span>
                      <span className="text-[10px] text-slate-500 block">ER: ₱{rec.sssTotalER.toFixed(2)}</span>
                      {rec.sssWispEE > 0 && (
                        <span className="text-[9px] text-blue-600 block">WISP: ₱{rec.sssWispEE}</span>
                      )}
                    </td>

                    <td className="px-3 py-3 text-right font-mono">
                      <span className="font-bold text-slate-900 block">₱{rec.philhealthEE.toFixed(2)}</span>
                      <span className="text-[10px] text-slate-500 block">ER: ₱{rec.philhealthER.toFixed(2)}</span>
                    </td>

                    <td className="px-3 py-3 text-right font-mono">
                      <span className="font-bold text-slate-900 block">₱{rec.pagibigEE.toFixed(2)}</span>
                      <span className="text-[10px] text-slate-500 block">ER: ₱{rec.pagibigER.toFixed(2)}</span>
                    </td>

                    <td className="px-3 py-3 text-right font-mono font-black text-slate-900">
                      ₱{rec.totalEmployeeDeductions.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>

                    <td className="px-3 py-3 text-right font-mono font-bold text-emerald-800">
                      ₱{rec.totalEmployerContributions.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>

                    <td className="px-3 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        rec.overallStatus === 'COMPLIANT'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : rec.overallStatus === 'MISSING_ID'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {rec.overallStatus === 'COMPLIANT' ? 'COMPLIANT' : rec.overallStatus === 'MISSING_ID' ? 'MISSING ID' : 'FLAGGED'}
                      </span>
                    </td>

                    <td className="px-3 py-3 text-center">
                      <button
                        onClick={() => setInspectedRecord(rec)}
                        className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      </>
      )}

      {/* ============================================================== */}
      {/* EMPLOYEE CONTRIBUTION INSPECTOR MODAL                          */}
      {/* ============================================================== */}
      {inspectedRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full flex flex-col max-h-[90vh] overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-white text-sm">
                  {inspectedRecord.employeeName[0]}
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-tight">{inspectedRecord.employeeName}</h3>
                  <p className="text-xs text-slate-400">{inspectedRecord.role} • {inspectedRecord.department}</p>
                </div>
              </div>
              <button
                onClick={() => setInspectedRecord(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Monthly Basic:</span>
                  <span className="font-bold text-slate-900 font-mono text-sm">₱{inspectedRecord.basicSalary.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Total EE Deducted:</span>
                  <span className="font-bold text-blue-700 font-mono text-sm">₱{inspectedRecord.totalEmployeeDeductions.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Total ER Burden:</span>
                  <span className="font-bold text-emerald-700 font-mono text-sm">₱{inspectedRecord.totalEmployerContributions.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Remittance:</span>
                  <span className="font-bold text-slate-900 font-mono text-sm">₱{inspectedRecord.totalRemittanceDue.toFixed(2)}</span>
                </div>
              </div>

              {/* SSS Statutory Card */}
              <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    Social Security System (RA 11199 & SSS Circular 2024)
                  </span>
                  <span className="font-mono text-xs text-blue-700">SSS ID: {inspectedRecord.sssNumber}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-slate-700 pt-1">
                  <div>MSC: <strong className="font-mono">₱{inspectedRecord.sssMsc.toLocaleString()}</strong></div>
                  <div>Regular EE: <strong className="font-mono">₱{inspectedRecord.sssRegularEE.toFixed(2)}</strong></div>
                  <div>Regular ER: <strong className="font-mono">₱{inspectedRecord.sssRegularER.toFixed(2)}</strong></div>
                  {inspectedRecord.sssWispEE > 0 && (
                    <>
                      <div>WISP EE: <strong className="font-mono">₱{inspectedRecord.sssWispEE.toFixed(2)}</strong></div>
                      <div>WISP ER: <strong className="font-mono">₱{inspectedRecord.sssWispER.toFixed(2)}</strong></div>
                      <div>EC ER: <strong className="font-mono">₱{inspectedRecord.sssEcER.toFixed(2)}</strong></div>
                    </>
                  )}
                </div>
                <p className="text-[11px] text-blue-800 italic pt-1 border-t border-blue-200/60">{inspectedRecord.sssNotes}</p>
              </div>

              {/* PhilHealth Statutory Card */}
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <HeartPulse className="w-4 h-4 text-emerald-600" />
                    PhilHealth Universal Health Care (RA 11223)
                  </span>
                  <span className="font-mono text-xs text-emerald-700">PIN: {inspectedRecord.philhealthNumber}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-slate-700 pt-1">
                  <div>MSC: <strong className="font-mono">₱{inspectedRecord.philhealthMsc.toLocaleString()}</strong></div>
                  <div>Employee (2.5%): <strong className="font-mono">₱{inspectedRecord.philhealthEE.toFixed(2)}</strong></div>
                  <div>Employer (2.5%): <strong className="font-mono">₱{inspectedRecord.philhealthER.toFixed(2)}</strong></div>
                </div>
                <p className="text-[11px] text-emerald-800 italic pt-1 border-t border-emerald-200/60">{inspectedRecord.philhealthNotes}</p>
              </div>

              {/* Pag-IBIG Statutory Card */}
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-900 flex items-center gap-1.5">
                    <Home className="w-4 h-4 text-amber-600" />
                    Pag-IBIG Fund (Circular No. 460)
                  </span>
                  <span className="font-mono text-xs text-amber-700">MID: {inspectedRecord.pagibigNumber}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-slate-700 pt-1">
                  <div>MFS: <strong className="font-mono">₱{inspectedRecord.pagibigMfs.toLocaleString()}</strong></div>
                  <div>Employee Share: <strong className="font-mono">₱{inspectedRecord.pagibigEE.toFixed(2)}</strong></div>
                  <div>Employer Share: <strong className="font-mono">₱{inspectedRecord.pagibigER.toFixed(2)}</strong></div>
                </div>
                <p className="text-[11px] text-amber-800 italic pt-1 border-t border-amber-200/60">{inspectedRecord.pagibigNotes}</p>
              </div>

              {/* Compliance Notes & Issues */}
              {inspectedRecord.complianceIssues.length > 0 && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1 text-rose-800">
                  <span className="font-bold block">Compliance Flags / Missing Information:</span>
                  <ul className="list-disc pl-5 space-y-0.5 text-[11px]">
                    {inspectedRecord.complianceIssues.map((issue, idx) => (
                      <li key={idx}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setInspectedRecord(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg font-bold text-xs hover:bg-slate-800"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* PRINTABLE STATUTORY COMPLIANCE CERTIFICATE MODAL               */}
      {/* ============================================================== */}
      {showCertificateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full flex flex-col overflow-hidden border border-slate-200 my-8">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between print:hidden">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span className="font-bold text-sm">Official Certificate of Statutory Compliance</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPickerModalOpen(true)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
                >
                  Signatory: {signatory ? signatory.fullName.split(' ')[0] : 'Auto'}
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" /> Print / Save PDF
                </button>
                <button
                  onClick={() => setShowCertificateModal(false)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Printable Certificate Document */}
            <div className="p-8 sm:p-12 font-serif text-slate-900 space-y-6 bg-white">
              <div className="text-center border-b-2 border-slate-900 pb-5 space-y-1">
                <h1 className="text-xl font-black uppercase tracking-wider text-slate-950 font-sans">
                  KAWAYAN HR PHILIPPINES INC.
                </h1>
                <p className="text-xs text-slate-600 font-sans">Unit 1402, High Street South Corporate Plaza, BGC, Taguig City</p>
                <p className="text-[11px] text-slate-400 font-mono">SEC Reg. CS2021-08912 | DOLE Reg. NCR-TAG-2022-0041</p>
                <h2 className="text-base font-bold uppercase tracking-widest text-slate-900 underline pt-4 font-sans">
                  Certificate of Statutory Payroll Compliance
                </h2>
                <p className="text-xs text-slate-500 italic font-sans">
                  For Payroll Period: {selectedMonth}
                </p>
              </div>

              <div className="text-xs leading-relaxed text-justify space-y-3 font-serif">
                <p className="indent-8">
                  THIS IS TO CERTIFY that <strong>KAWAYAN HR PHILIPPINES INC.</strong> has strictly deducted, computed, and allocated all mandatory Philippine government social welfare contributions for the month of <strong>{selectedMonth}</strong> covering its <strong>{auditReport.totalEmployees}</strong> registered employees, in full compliance with:
                </p>
                <ul className="list-disc pl-8 space-y-1 text-slate-800">
                  <li><strong>Republic Act No. 11199</strong> (Social Security Act of 2018) and SSS Circular 2023-010 covering Regular SSS, WISP, and EC contributions;</li>
                  <li><strong>Republic Act No. 11223</strong> (Universal Health Care Act) covering the mandatory 5.0% PhilHealth premium rate; and</li>
                  <li><strong>Pag-IBIG Fund Circular No. 460</strong> covering the enhanced mandatory Home Development Mutual Fund contributions.</li>
                </ul>

                <div className="p-4 bg-slate-50 border border-slate-300 rounded-lg font-sans text-xs my-4 space-y-2">
                  <div className="font-bold text-slate-900 uppercase text-[11px] border-b border-slate-200 pb-1">
                    Statutory Remittance Reconciliation Summary
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-1 font-mono">
                    <div>SSS Total: <strong>₱{auditReport.agencySummaries[0].grandTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</strong></div>
                    <div>PhilHealth Total: <strong>₱{auditReport.agencySummaries[1].grandTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</strong></div>
                    <div>Pag-IBIG Total: <strong>₱{auditReport.agencySummaries[2].grandTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</strong></div>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-emerald-950 font-mono">
                    <span>Grand Total Statutory Remittance:</span>
                    <span>₱{auditReport.totalGovernmentRemittanceDue.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  </div>
                </div>

                <p className="indent-8">
                  This certification is issued upon the request of the interested parties for legal, auditing, and Department of Labor and Employment (DOLE) inspection compliance purposes.
                </p>
              </div>

              {/* Cryptographic Verification Seal */}
              {verificationHash && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded flex items-center justify-between text-xs font-mono text-emerald-900 font-sans">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>Digitally Certified & Sealed: {verificationHash}</span>
                  </div>
                  <span className="text-[10px] text-emerald-700">RA 8792 E-Commerce Valid</span>
                </div>
              )}

              {/* Signatures */}
              <div className="pt-8 border-t border-slate-300 flex justify-end font-sans">
                <div className="text-center w-72 space-y-2">
                  <div className="min-h-[46px] flex items-end justify-center pb-1">
                    {signatory?.signatureDataUrl ? (
                      <img
                        src={signatory.signatureDataUrl}
                        alt="Authorized Signatory"
                        className="max-h-12 object-contain mx-auto"
                      />
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">Signature over Printed Name</span>
                    )}
                  </div>
                  <div className="border-t border-slate-800 pt-1">
                    <span className="font-bold text-slate-900 block text-xs uppercase">
                      {signatory ? signatory.fullName : 'Eduardo Mendoza'}
                    </span>
                    <span className="text-slate-600 text-[11px] block">
                      {signatory ? signatory.title : 'Head of Total Rewards & Payroll Operations'}
                    </span>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      TIN: {signatory?.tin || '009-881-224-000'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Central Repository Picker */}
      <SignaturePickerModal
        isOpen={isPickerModalOpen}
        onClose={() => setIsPickerModalOpen(false)}
        category="payroll"
        currentSignatoryId={signatory?.id}
        onSelectSignatory={(s) => setSignatory(s)}
      />

      {/* Bulk Remittance Upload & Reconciliation Modal */}
      <BulkRemittanceUploadModal
        isOpen={isBulkUploadModalOpen}
        onClose={() => setIsBulkUploadModalOpen(false)}
        employees={employees}
        selectedMonth={selectedMonth}
        onApplyReconciliation={(result) => setReconciledUpload(result)}
      />
    </div>
  );
}
