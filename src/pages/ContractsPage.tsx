import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  FileCheck, Scale, Download, Printer, User, Building2, 
  Search, ShieldCheck, CheckCircle2, Plus, Trash2, 
  RotateCcw, Sparkles, Receipt, ArrowLeft, Users, 
  Calendar, DollarSign, PenTool, ExternalLink, Sliders,
  BookOpen, Eye, HelpCircle, AlertCircle
} from 'lucide-react';
import { useEmployees } from '../lib/employee-store';
import { 
  ContractTemplateType, 
  CONTRACT_TEMPLATES, 
  ContractFormVariables, 
  ContractClause,
  createVariablesFromEmployee, 
  numberToPhilippinePesosWords 
} from '../lib/contracts';
import { ContractPrintableDocument } from '../components/contracts/ContractPrintableDocument';
import { 
  AuthorizedSignatory, 
  signatureRepository 
} from '../lib/signature-repository';
import { SignaturePickerModal } from '../components/signatures/SignaturePickerModal';

export function ContractsPage() {
  const { employees } = useEmployees();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialEmpId = searchParams.get('empId') || 'emp-001';

  // Selection state
  const [selectedEmpId, setSelectedEmpId] = useState<string>(initialEmpId);
  const [templateType, setTemplateType] = useState<ContractTemplateType>('regular');
  const [activeTab, setActiveTab] = useState<'editor' | 'roster' | 'clauses'>('editor');

  // Signatory from Central Repository
  const [selectedSignatory, setSelectedSignatory] = useState<AuthorizedSignatory | null>(() => {
    return signatureRepository.resolveSignatureForDocument('general').signatory;
  });
  const [isPickerModalOpen, setIsPickerModalOpen] = useState(false);

  // Form Variables State
  const initialEmployee = useMemo(() => {
    return employees.find(e => e.id === selectedEmpId) || employees[0];
  }, [selectedEmpId, employees]);

  const [variables, setVariables] = useState<ContractFormVariables>(() => {
    return createVariablesFromEmployee(
      initialEmployee,
      selectedSignatory?.fullName || 'Maria Clara De Los Santos',
      selectedSignatory?.title || 'HR & Labor Compliance Director'
    );
  });

  // Active Clauses State (allows customized wording)
  const [clauses, setClauses] = useState<ContractClause[]>(() => {
    return CONTRACT_TEMPLATES[templateType].defaultClauses;
  });

  // Subscribe to Central Signature Repository
  useEffect(() => {
    const syncRepo = () => {
      const res = signatureRepository.resolveSignatureForDocument('general');
      setSelectedSignatory(res.signatory);
      if (res.signatory) {
        setVariables(prev => ({
          ...prev,
          authorizedSignatory: res.signatory?.fullName || prev.authorizedSignatory,
          signatoryTitle: res.signatory?.title || prev.signatoryTitle,
        }));
      }
    };
    return signatureRepository.subscribe(syncRepo);
  }, []);

  // Update clauses when template type changes
  useEffect(() => {
    setClauses(CONTRACT_TEMPLATES[templateType].defaultClauses);
  }, [templateType]);

  // Handle switching employee from registry
  const handleSelectEmployee = (empId: string) => {
    setSelectedEmpId(empId);
    const emp = employees.find(e => e.id === empId);
    if (!emp) return;

    setVariables(createVariablesFromEmployee(
      emp,
      selectedSignatory?.fullName || 'Maria Clara De Los Santos',
      selectedSignatory?.title || 'HR & Labor Compliance Director'
    ));

    // Recommend template based on tenure or role
    if (emp.role.toLowerCase().includes('manager') || emp.role.toLowerCase().includes('director') || emp.role.toLowerCase().includes('lead')) {
      setTemplateType('executive');
    } else if (emp.status === 'Active' && emp.basicSalary >= 60000) {
      setTemplateType('regular');
    } else {
      setTemplateType('probationary');
    }
  };

  // Helper to update specific variable
  const updateVariable = <K extends keyof ContractFormVariables>(
    key: K, 
    value: ContractFormVariables[K]
  ) => {
    setVariables(prev => ({ ...prev, [key]: value }));
  };

  // Handle clause content edit
  const handleUpdateClause = (clauseId: string, newContent: string) => {
    setClauses(prev => prev.map(c => c.id === clauseId ? { ...c, content: newContent } : c));
  };

  // Reset clauses to template defaults
  const handleResetClauses = () => {
    setClauses(CONTRACT_TEMPLATES[templateType].defaultClauses);
  };

  const currentTemplate = CONTRACT_TEMPLATES[templateType];
  const salaryWords = useMemo(() => {
    return numberToPhilippinePesosWords(variables.basicSalaryMonthly);
  }, [variables.basicSalaryMonthly]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header & Context Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="p-2 bg-blue-600 text-white rounded-xl shadow-xs">
              <FileCheck className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Employment Contract Generator
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200 font-mono">
              Labor Code PD 442
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 font-mono">
              RA 11165 Telecommuting
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1 max-w-3xl">
            Pulls employee details from the registry and generates legally compliant Philippine employment agreements with statutory clauses, probationary evaluations, 13th month pay, and automated PDF export.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/registry"
            className="flex items-center text-xs font-semibold px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors shadow-xs"
          >
            <Users className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
            Employee Registry
          </Link>
          <Link
            to="/signatures"
            className="flex items-center text-xs font-semibold px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors shadow-xs"
          >
            <PenTool className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
            Signatures Repository
          </Link>
        </div>
      </div>

      {/* Main Sub-Navigation Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-4 pt-2 gap-2 shadow-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('editor')}
          className={`py-3 px-4 font-bold text-sm border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'editor'
              ? 'border-blue-600 text-blue-700 bg-blue-50/60 rounded-t-lg'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileCheck className="w-4 h-4 text-blue-600" />
          Interactive Contract Builder & Live Preview
        </button>

        <button
          onClick={() => setActiveTab('roster')}
          className={`py-3 px-4 font-bold text-sm border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'roster'
              ? 'border-blue-600 text-blue-700 bg-blue-50/60 rounded-t-lg'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4 text-slate-600" />
          Registry Personnel Contracts ({employees.length})
        </button>

        <button
          onClick={() => setActiveTab('clauses')}
          className={`py-3 px-4 font-bold text-sm border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'clauses'
              ? 'border-blue-600 text-blue-700 bg-blue-50/60 rounded-t-lg'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Scale className="w-4 h-4 text-slate-600" />
          Labor Code Statutory Clauses Library
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: INTERACTIVE CONTRACT BUILDER                            */}
      {/* ============================================================== */}
      {activeTab === 'editor' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Deck (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-5">
              {/* Registry Employee Picker */}
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  1. Pull Employee from Registry:
                </span>
                <select
                  value={selectedEmpId}
                  onChange={(e) => handleSelectEmployee(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.firstName} {e.lastName} — {e.role} ({e.department} · ₱{e.basicSalary.toLocaleString()}/mo)
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Automatically pulls salary, position, start date, and statutory IDs (TIN, SSS, PhilHealth, Pag-IBIG).
                </p>
              </div>

              {/* Contract Template Archetype Selector */}
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  2. Contract Template Archetype:
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                  {(Object.keys(CONTRACT_TEMPLATES) as ContractTemplateType[]).map((tKey) => {
                    const tmpl = CONTRACT_TEMPLATES[tKey];
                    const isSelected = templateType === tKey;
                    return (
                      <button
                        key={tKey}
                        type="button"
                        onClick={() => setTemplateType(tKey)}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-blue-50 border-blue-600 text-blue-900 ring-1 ring-blue-600 shadow-2xs'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100/70'
                        }`}
                      >
                        <span className="font-bold block text-xs truncate">{tmpl.title.split(' ')[0]} {tmpl.title.split(' ')[1]}</span>
                        <span className="text-[10px] text-slate-500 block truncate">{tmpl.laborCodeReference}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Placeholders & Form Inputs */}
              <div className="border-t border-slate-200 pt-4 space-y-4">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  3. Dynamic Labor Code Placeholders:
                </span>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-slate-700 font-semibold block mb-1">Position / Role Title:</label>
                    <input
                      type="text"
                      value={variables.position}
                      onChange={(e) => updateVariable('position', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-medium text-xs focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-700 font-semibold block mb-1">Department:</label>
                    <input
                      type="text"
                      value={variables.department}
                      onChange={(e) => updateVariable('department', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-medium text-xs focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-700 font-semibold block mb-1">
                      Monthly Basic Salary (PHP):
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-mono font-bold text-slate-400">₱</span>
                      <input
                        type="number"
                        min="0"
                        step="500"
                        value={variables.basicSalaryMonthly}
                        onChange={(e) => updateVariable('basicSalaryMonthly', parseFloat(e.target.value) || 0)}
                        className="w-full pl-6 pr-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold text-xs text-slate-900 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-700 font-semibold block mb-1">
                      De Minimis / Allowance:
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-mono font-bold text-slate-400">₱</span>
                      <input
                        type="number"
                        min="0"
                        step="100"
                        value={variables.deMinimisAllowanceMonthly}
                        onChange={(e) => updateVariable('deMinimisAllowanceMonthly', parseFloat(e.target.value) || 0)}
                        className="w-full pl-6 pr-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold text-xs text-slate-900 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-700 font-semibold block mb-1">Official Start Date:</label>
                    <input
                      type="date"
                      value={variables.startDate}
                      onChange={(e) => updateVariable('startDate', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono text-xs focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-700 font-semibold block mb-1">Work Arrangement:</label>
                    <select
                      value={variables.workArrangement}
                      onChange={(e) => updateVariable('workArrangement', e.target.value as any)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-medium text-xs focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="Hybrid">Hybrid (RA 11165)</option>
                      <option value="On-site">100% On-site</option>
                      <option value="Remote">100% Telecommuting</option>
                    </select>
                  </div>
                </div>

                {/* Salary in Words Badge */}
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px]">
                  <span className="text-slate-500 block uppercase text-[10px] font-bold">Auto-Generated Currency in Words:</span>
                  <span className="font-serif font-bold text-slate-900">{salaryWords}</span>
                </div>

                {/* Government IDs from Registry */}
                <div className="p-3 bg-blue-50/50 border border-blue-200 rounded-xl space-y-2 text-xs">
                  <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wider block">
                    Statutory IDs Pulled from Registry:
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                    <div>
                      <span className="text-slate-500 block text-[10px]">BIR TIN:</span>
                      <span className="font-semibold text-slate-900">{variables.employeeTin}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">SSS No.:</span>
                      <span className="font-semibold text-slate-900">{variables.employeeSss}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">PhilHealth PIN:</span>
                      <span className="font-semibold text-slate-900">{variables.employeePhilhealth}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Pag-IBIG MID:</span>
                      <span className="font-semibold text-slate-900">{variables.employeePagibig}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Clauses Customization Preview Drawer */}
              <div className="border-t border-slate-200 pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Contract Clauses ({clauses.length} Sections)
                  </span>
                  <button
                    type="button"
                    onClick={handleResetClauses}
                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset
                  </button>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {clauses.map((c, i) => (
                    <div key={c.id} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-800">Sec {i + 1}. {c.title}</span>
                        <span className="text-[10px] text-slate-500 italic font-mono">{c.legalCitation}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 line-clamp-2">{c.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Document Preview & Printable Output (7 cols) */}
          <div className="lg:col-span-7 space-y-3">
            {/* Auto-Applied Signature Repository Status Card */}
            <div className="p-3 bg-blue-50/80 border border-blue-300 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs print:hidden">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-700 text-white flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">
                      {selectedSignatory ? selectedSignatory.fullName : 'Maria Clara De Los Santos'}
                    </span>
                    <span className="text-[10px] bg-blue-200/80 text-blue-900 px-1.5 py-0.5 rounded font-mono font-bold">
                      {selectedSignatory ? 'Central Repository Signatory' : 'Default Signatory'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    {selectedSignatory ? selectedSignatory.title : 'HR & Labor Compliance Director'} • RA 8792 E-Commerce Seal Applied
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsPickerModalOpen(true)}
                  className="px-2.5 py-1.5 bg-white border border-blue-300 hover:bg-blue-100/50 text-blue-900 font-semibold rounded-lg text-xs transition-colors"
                >
                  Change Signatory
                </button>
                <Link
                  to="/signatures"
                  target="_blank"
                  className="p-1.5 text-blue-800 hover:text-blue-950 hover:bg-blue-100 rounded-lg transition-colors"
                  title="Manage Central Signature Repository"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <ContractPrintableDocument
              template={currentTemplate}
              clauses={clauses}
              variables={variables}
              signatory={selectedSignatory}
              onPrint={() => window.print()}
              onSelectSignatoryClick={() => setIsPickerModalOpen(true)}
            />
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: REGISTRY PERSONNEL CONTRACTS ROSTER                     */}
      {/* ============================================================== */}
      {activeTab === 'roster' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Registry Employees Employment Contracts Masterlist
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Generate or update standardized labor contracts for all company personnel.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
              Total Staff: {employees.length}
            </span>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Employee Name</th>
                  <th className="px-3 py-3">Position & Dept</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Start Date</th>
                  <th className="px-3 py-3 text-right">Basic Monthly Salary</th>
                  <th className="px-3 py-3">Recommended Contract</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employees.map((emp) => {
                  const isManager = emp.role.toLowerCase().includes('manager') || emp.role.toLowerCase().includes('director');
                  const recType = isManager ? 'executive' : emp.basicSalary >= 60000 ? 'regular' : 'probationary';

                  return (
                    <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        {emp.firstName} {emp.lastName}
                        <span className="block text-[11px] text-slate-400 font-mono">{emp.email}</span>
                      </td>
                      <td className="px-3 py-3">
                        <span className="font-medium text-slate-800 block">{emp.role}</span>
                        <span className="text-slate-500 text-[11px]">{emp.department}</span>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          emp.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {emp.status}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-mono text-slate-600">
                        {emp.joinDate}
                      </td>
                      <td className="px-3 py-3 text-right font-mono font-bold text-slate-900">
                        ₱{emp.basicSalary.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-3 py-3">
                        <span className="text-[11px] font-bold text-blue-700 uppercase">
                          {CONTRACT_TEMPLATES[recType].title.split(' ')[0]} Contract
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => {
                            handleSelectEmployee(emp.id);
                            setActiveTab('editor');
                          }}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs shadow-xs transition-colors"
                        >
                          Generate Contract
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: LABOR CODE CLAUSES LIBRARY                              */}
      {/* ============================================================== */}
      {activeTab === 'clauses' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Philippine Labor Code Statutory Clauses Matrix
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Legal citations, enforceability principles, and DOLE Department Orders referenced in company contracts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <span className="font-bold text-sm text-slate-900 block">1. Security of Tenure & Regularization</span>
              <span className="text-[11px] font-mono font-bold text-blue-700 block">Labor Code Art. 295 & 296 [formerly Art. 280 & 281]</span>
              <p className="text-slate-600 leading-relaxed">
                Employees engaged for activities usually necessary or desirable in the usual business of the employer are deemed regular. Probationary employment cannot exceed six (6) months, and performance criteria must be communicated at engagement.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <span className="font-bold text-sm text-slate-900 block">2. Mandatory 13th Month Pay</span>
              <span className="text-[11px] font-mono font-bold text-blue-700 block">Presidential Decree No. 851</span>
              <p className="text-slate-600 leading-relaxed">
                Mandatory statutory benefit equivalent to 1/12 of total basic salary earned within calendar year, payable not later than December 24 regardless of employment status (probationary, regular, or project-based).
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <span className="font-bold text-sm text-slate-900 block">3. Telecommuting & Remote Work Rights</span>
              <span className="text-[11px] font-mono font-bold text-blue-700 block">Republic Act No. 11165 (Telecommuting Act of 2018)</span>
              <p className="text-slate-600 leading-relaxed">
                Ensures fair treatment for remote/telecommuting personnel: equal pay, statutory benefits, overtime rates, leaves, privacy protections, and promotion opportunities equal to on-site employees.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <span className="font-bold text-sm text-slate-900 block">4. Two-Notice Rule for Termination</span>
              <span className="text-[11px] font-mono font-bold text-blue-700 block">Labor Code Art. 297 & DOLE D.O. 147-15</span>
              <p className="text-slate-600 leading-relaxed">
                Constitutional and statutory procedural due process mandates: First Written Notice to Explain (NTE) granting at least five (5) calendar days, followed by administrative hearing, and Final Notice of Decision.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <span className="font-bold text-sm text-slate-900 block">5. Employee Data Privacy & Consent</span>
              <span className="text-[11px] font-mono font-bold text-blue-700 block">Republic Act No. 10173 (Data Privacy Act of 2012)</span>
              <p className="text-slate-600 leading-relaxed">
                Express employee consent for processing, storage, and transfer of personal and sensitive personal information strictly for legitimate employment and statutory reporting purposes.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <span className="font-bold text-sm text-slate-900 block">6. Service Incentive Leave (SIL)</span>
              <span className="text-[11px] font-mono font-bold text-blue-700 block">Labor Code Art. 95 & Omnibus Rules</span>
              <p className="text-slate-600 leading-relaxed">
                Mandatory five (5) days paid leave after one (1) year of service, commutable to cash if unused at the end of the year.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Central Repository Signature Picker Modal */}
      <SignaturePickerModal
        isOpen={isPickerModalOpen}
        onClose={() => setIsPickerModalOpen(false)}
        category="general"
        currentSignatoryId={selectedSignatory?.id}
        onSelectSignatory={(sig) => {
          setSelectedSignatory(sig);
          if (sig) {
            setVariables(prev => ({
              ...prev,
              authorizedSignatory: sig.fullName,
              signatoryTitle: sig.title,
            }));
          }
        }}
      />
    </div>
  );
}
