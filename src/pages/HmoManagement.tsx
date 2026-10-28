import { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  HeartHandshake, 
  Users, 
  UserPlus, 
  Download, 
  Search, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  FileSpreadsheet, 
  CreditCard,
  Building2,
  Calendar,
  Sparkles,
  Info
} from 'lucide-react';
import { initialHmoEnrollments, HMO_CATALOG } from '../data/mockHmoData';
import { mockEmployees } from '../data/mockData';
import { HmoEnrollment, HmoDependent, HmoProvider, HmoPlanTier } from '../types/hmo';

export function HmoManagement() {
  const [enrollments, setEnrollments] = useState<HmoEnrollment[]>(initialHmoEnrollments);
  const [searchQuery, setSearchQuery] = useState('');
  const [providerFilter, setProviderFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [departmentFilter, setDepartmentFilter] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<'roster' | 'catalog'>('roster');

  // Modal States
  const [selectedEnrollment, setSelectedEnrollment] = useState<HmoEnrollment | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isNewEnrollModalOpen, setIsNewEnrollModalOpen] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // New Dependent form inside Edit Modal
  const [newDepName, setNewDepName] = useState('');
  const [newDepRel, setNewDepRel] = useState<'Spouse' | 'Child' | 'Parent' | 'Sibling'>('Spouse');
  const [newDepDob, setNewDepDob] = useState('1995-01-01');
  const [newDepGender, setNewDepGender] = useState<'Male' | 'Female'>('Female');
  const [newDepPreExisting, setNewDepPreExisting] = useState(true);

  // New Employee Enrollment Form
  const [newEmpId, setNewEmpId] = useState('');
  const [newEmpProvider, setNewEmpProvider] = useState<HmoProvider>('Maxicare');
  const [newEmpTier, setNewEmpTier] = useState<HmoPlanTier>('Gold');
  const [newEmpCardNo, setNewEmpCardNo] = useState('');
  const [newEmpDate, setNewEmpDate] = useState(new Date().toISOString().split('T')[0]);

  // Show transient toast notification
  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 3500);
  };

  // Toggle Employee Coverage On/Off
  const handleToggleCoverage = (id: string, currentState: boolean) => {
    setEnrollments(prev => prev.map(item => {
      if (item.id === id) {
        const nextState = !currentState;
        return { ...item, isActive: nextState };
      }
      return item;
    }));
    showToast(`HMO coverage for ${enrollments.find(e => e.id === id)?.employeeName} has been turned ${!currentState ? 'ON' : 'OFF'}.`);
  };

  // Filtered List
  const filteredEnrollments = useMemo(() => {
    return enrollments.filter(e => {
      const matchSearch = e.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.cardNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.department.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchProvider = providerFilter === 'All' || e.provider === providerFilter;
      const matchStatus = statusFilter === 'All' || 
        (statusFilter === 'Active' && e.isActive) ||
        (statusFilter === 'Inactive' && !e.isActive);
      const matchDept = departmentFilter === 'All' || e.department === departmentFilter;

      return matchSearch && matchProvider && matchStatus && matchDept;
    });
  }, [enrollments, searchQuery, providerFilter, statusFilter, departmentFilter]);

  // Aggregated KPI Metrics
  const metrics = useMemo(() => {
    const totalEnrolled = enrollments.length;
    const activeStaff = enrollments.filter(e => e.isActive).length;
    
    // Total dependents covered (from active employee plans whose dependents are also marked active)
    let totalActiveDependents = 0;
    let totalEmployerMonthly = 0;
    let totalEmployeePayrollDeductions = 0;

    enrollments.forEach(e => {
      if (e.isActive) {
        totalEmployerMonthly += e.employerShareMonthly;
        totalEmployeePayrollDeductions += e.employeeShareMonthly;

        e.dependents.forEach(d => {
          if (d.isActive) {
            totalActiveDependents += 1;
            totalEmployerMonthly += d.employerSubsidy;
            totalEmployeePayrollDeductions += d.employeePayrollDeduction;
          }
        });
      }
    });

    return {
      totalEnrolled,
      activeStaff,
      totalActiveDependents,
      totalEmployerMonthly,
      totalEmployeePayrollDeductions,
    };
  }, [enrollments]);

  // Handle saving changes in Edit Modal
  const handleSaveEnrollment = (updated: HmoEnrollment) => {
    setEnrollments(prev => prev.map(e => e.id === updated.id ? updated : e));
    setIsEditModalOpen(false);
    setSelectedEnrollment(null);
    showToast(`HMO record for ${updated.employeeName} successfully updated.`);
  };

  // Add Dependent to current modal
  const handleAddDependent = () => {
    if (!selectedEnrollment || !newDepName.trim()) return;

    // Approximate premium calculation based on relationship
    let monthlyPremium = 2200;
    let employerSubsidy = 1100;
    if (newDepRel === 'Parent') {
      monthlyPremium = 3100;
      employerSubsidy = 1000;
    } else if (newDepRel === 'Child') {
      monthlyPremium = 1800;
      employerSubsidy = 900;
    }
    const employeePayrollDeduction = monthlyPremium - employerSubsidy;

    const newDep: HmoDependent = {
      id: `dep-${Date.now()}`,
      name: newDepName.trim(),
      relationship: newDepRel,
      birthDate: newDepDob,
      gender: newDepGender,
      isActive: true,
      monthlyPremium,
      employerSubsidy,
      employeePayrollDeduction,
      preExistingCovered: newDepPreExisting,
      cardNumber: `${selectedEnrollment.cardNumber}-${String(selectedEnrollment.dependents.length + 1).padStart(2, '0')}`,
    };

    const updated: HmoEnrollment = {
      ...selectedEnrollment,
      dependents: [...selectedEnrollment.dependents, newDep],
    };

    setSelectedEnrollment(updated);
    setNewDepName('');
    showToast(`Added dependent ${newDep.name} (${newDep.relationship}).`);
  };

  // Toggle Dependent Active/Inactive inside Modal
  const handleToggleDependent = (depId: string) => {
    if (!selectedEnrollment) return;
    const updatedDependents = selectedEnrollment.dependents.map(d => 
      d.id === depId ? { ...d, isActive: !d.isActive } : d
    );
    setSelectedEnrollment({
      ...selectedEnrollment,
      dependents: updatedDependents,
    });
  };

  // Remove Dependent inside Modal
  const handleRemoveDependent = (depId: string) => {
    if (!selectedEnrollment) return;
    const updatedDependents = selectedEnrollment.dependents.filter(d => d.id !== depId);
    setSelectedEnrollment({
      ...selectedEnrollment,
      dependents: updatedDependents,
    });
  };

  // Handle Enrollment Plan Tier Change inside Modal
  const handlePlanTierChange = (tier: HmoPlanTier) => {
    if (!selectedEnrollment) return;
    const catalogMatch = HMO_CATALOG.find(c => c.provider === selectedEnrollment.provider && c.tier === tier) 
      || HMO_CATALOG.find(c => c.tier === tier);
    
    if (catalogMatch) {
      setSelectedEnrollment({
        ...selectedEnrollment,
        planTier: tier,
        mbl: catalogMatch.mbl,
        employerShareMonthly: catalogMatch.standardEmployerShare,
        employeeShareMonthly: catalogMatch.standardEmployeeShare,
        roomAndBoard: catalogMatch.roomAndBoard,
        dentalCovered: catalogMatch.dentalCovered,
        opticalCovered: catalogMatch.opticalCovered,
      });
    }
  };

  // Enroll New Employee
  const handleCreateEnrollment = () => {
    const emp = mockEmployees.find(e => e.id === newEmpId);
    if (!emp) return;

    const catalogMatch = HMO_CATALOG.find(c => c.provider === newEmpProvider && c.tier === newEmpTier) || HMO_CATALOG[0];

    const newRec: HmoEnrollment = {
      id: `hmo-${Date.now()}`,
      employeeId: emp.id,
      employeeName: `${emp.firstName} ${emp.lastName}`,
      department: emp.department,
      role: emp.role,
      provider: newEmpProvider,
      planTier: newEmpTier,
      mbl: catalogMatch.mbl,
      enrollmentDate: newEmpDate,
      cardEffectiveDate: newEmpDate,
      cardExpiryDate: new Date(new Date(newEmpDate).setFullYear(new Date(newEmpDate).getFullYear() + 1)).toISOString().split('T')[0],
      cardNumber: newEmpCardNo || `${newEmpProvider.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-5)}`,
      isActive: true,
      employerShareMonthly: catalogMatch.standardEmployerShare,
      employeeShareMonthly: catalogMatch.standardEmployeeShare,
      copayPercentage: 0,
      roomAndBoard: catalogMatch.roomAndBoard,
      dentalCovered: catalogMatch.dentalCovered,
      opticalCovered: catalogMatch.opticalCovered,
      emergencyRoomCovered: true,
      notes: 'Newly enrolled employee policy.',
      dependents: [],
    };

    setEnrollments(prev => [newRec, ...prev]);
    setIsNewEnrollModalOpen(false);
    setNewEmpId('');
    setNewEmpCardNo('');
    showToast(`Enrolled ${emp.firstName} ${emp.lastName} into ${newEmpProvider} (${newEmpTier}).`);
  };

  // Export CSV Report
  const handleExportCsv = () => {
    const headers = [
      'Employee ID',
      'Employee Name',
      'Department',
      'Role',
      'HMO Provider',
      'Coverage Status',
      'Plan Tier',
      'MBL (PHP)',
      'Card Number',
      'Effective Date',
      'Employer Share Monthly (PHP)',
      'Employee Deduction Monthly (PHP)',
      'Active Dependents Count',
      'Dependents Names',
      'Total Annualized Premium (PHP)'
    ];

    const rows = enrollments.map(e => {
      const activeDeps = e.dependents.filter(d => d.isActive);
      const depDeductions = activeDeps.reduce((sum, d) => sum + d.employeePayrollDeduction, 0);
      const depEmployer = activeDeps.reduce((sum, d) => sum + d.employerSubsidy, 0);
      const totalMonthly = (e.isActive ? (e.employerShareMonthly + e.employeeShareMonthly) : 0) + depDeductions + depEmployer;

      return [
        `"${e.employeeId}"`,
        `"${e.employeeName}"`,
        `"${e.department}"`,
        `"${e.role}"`,
        `"${e.provider}"`,
        `"${e.isActive ? 'ACTIVE' : 'OPTED_OUT'}"`,
        `"${e.planTier}"`,
        e.mbl,
        `"${e.cardNumber}"`,
        `"${e.cardEffectiveDate}"`,
        e.isActive ? e.employerShareMonthly : 0,
        e.isActive ? (e.employeeShareMonthly + depDeductions) : 0,
        activeDeps.length,
        `"${activeDeps.map(d => `${d.name} (${d.relationship})`).join('; ')}"`,
        totalMonthly * 12
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DOLE_BIR_HMO_Benefits_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('DOLE & BIR Health Benefits CSV Export downloaded successfully.');
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {feedbackToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-emerald-500/40 text-emerald-300 px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 animate-fade-in text-sm font-medium">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">HMO & Healthcare Benefits</h1>
            <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-emerald-200 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              BIR RR 11-2018 Compliant
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Manage employee health maintenance organization plans, coverage on/off status, dependent tiers, and payroll deductions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 px-3.5 py-2 rounded-lg border border-slate-300 text-sm font-medium transition-colors shadow-sm"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export Report (CSV)</span>
          </button>
          <button
            onClick={() => setIsNewEnrollModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            <span>Enroll Employee</span>
          </button>
        </div>
      </div>

      {/* Statutory Tax Compliance Advisory Card */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-900 flex items-start gap-3.5">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-blue-950">
            Philippine Statutory Note: BIR Revenue Regulations No. 11-2018 on HMO Benefits
          </p>
          <p className="text-xs text-blue-800/90 leading-relaxed">
            Employer-paid HMO premiums covering the employee are <strong>tax-exempt</strong>. For employee dependents, employer subsidies up to <strong>₱10,000 per year</strong> qualify as tax-free De Minimis medical cash benefits; any excess is grouped under 'Other Benefits' subject to the annual statutory ₱90,000 tax-exempt threshold.
          </p>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Enrolled Employees</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{metrics.activeStaff}</span>
            <span className="text-xs text-slate-500">/ {metrics.totalEnrolled} active</span>
          </div>
          <div className="mt-2 text-xs text-emerald-600 font-medium flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            {Math.round((metrics.activeStaff / (metrics.totalEnrolled || 1)) * 100)}% active participation
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Covered Dependents</span>
            <HeartHandshake className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{metrics.totalActiveDependents}</span>
            <span className="text-xs text-slate-500">enrolled family</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Spouses, children & parents
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Monthly Employer Subsidy</span>
            <Building2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            ₱{metrics.totalEmployerMonthly.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Company-subsidized healthcare
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Employee Payroll Deduction</span>
            <CreditCard className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            ₱{metrics.totalEmployeePayrollDeductions.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-2 text-xs text-purple-600 font-medium">
            Auto-deducted in semi-monthly cutoff
          </div>
        </div>
      </div>

      {/* Tabs: Coverage Roster vs Plan Catalog */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('roster')}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'roster' 
              ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-xs' 
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Employee Coverage Roster ({filteredEnrollments.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('catalog')}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'catalog' 
              ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-xs' 
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>HMO Plan Catalog & MBL Specs</span>
        </button>
      </div>

      {activeTab === 'roster' ? (
        <>
          {/* Filters & Search */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search employee, card no., or dept..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              {/* Provider Filter */}
              <select
                value={providerFilter}
                onChange={(e) => setProviderFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-700 font-medium"
              >
                <option value="All">All Providers</option>
                <option value="Maxicare">Maxicare</option>
                <option value="Intellicare">Intellicare</option>
                <option value="MediCard">MediCard</option>
                <option value="PhilCare">PhilCare</option>
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-700 font-medium"
              >
                <option value="All">All Status</option>
                <option value="Active">Active Coverage (ON)</option>
                <option value="Inactive">Opted Out (OFF)</option>
              </select>

              {/* Department Filter */}
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-700 font-medium"
              >
                <option value="All">All Departments</option>
                <option value="Engineering">Engineering</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Finance">Finance</option>
                <option value="Marketing">Marketing</option>
                <option value="Operations">Operations</option>
              </select>
            </div>
          </div>

          {/* HMO Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3.5">Employee</th>
                    <th className="px-4 py-3.5 text-center">Benefit Status</th>
                    <th className="px-5 py-3.5">HMO Provider & Card</th>
                    <th className="px-5 py-3.5">Plan Tier & MBL</th>
                    <th className="px-4 py-3.5">Dependents</th>
                    <th className="px-5 py-3.5">Monthly Payroll Deduction</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredEnrollments.map((item) => {
                    const activeDeps = item.dependents.filter(d => d.isActive);
                    const totalEmpDeduction = item.isActive 
                      ? (item.employeeShareMonthly + activeDeps.reduce((sum, d) => sum + d.employeePayrollDeduction, 0))
                      : 0;

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Employee details */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs">
                              {item.employeeName.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900">{item.employeeName}</div>
                              <div className="text-xs text-slate-500">{item.department} • {item.role}</div>
                            </div>
                          </div>
                        </td>

                        {/* On / Off Toggle Switch */}
                        <td className="px-4 py-4 text-center">
                          <div className="flex flex-col items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleToggleCoverage(item.id, item.isActive)}
                              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                                item.isActive ? 'bg-emerald-600' : 'bg-slate-300'
                              }`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                                  item.isActive ? 'translate-x-5' : 'translate-x-0'
                                }`}
                              />
                            </button>
                            <span className={`text-[11px] font-semibold ${item.isActive ? 'text-emerald-700' : 'text-slate-400'}`}>
                              {item.isActive ? 'Active (ON)' : 'Opted Out (OFF)'}
                            </span>
                          </div>
                        </td>

                        {/* Provider & Card */}
                        <td className="px-5 py-4">
                          <div className="space-y-1">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                              item.provider === 'Maxicare' ? 'bg-blue-100 text-blue-800' :
                              item.provider === 'Intellicare' ? 'bg-emerald-100 text-emerald-800' :
                              item.provider === 'MediCard' ? 'bg-red-100 text-red-800' :
                              'bg-amber-100 text-amber-800'
                            }`}>
                              {item.provider}
                            </span>
                            <div className="font-mono text-xs text-slate-700 font-medium">
                              {item.cardNumber}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              Exp: {item.cardExpiryDate}
                            </div>
                          </div>
                        </td>

                        {/* Tier & MBL */}
                        <td className="px-5 py-4">
                          <div className="font-medium text-slate-900 flex items-center gap-1.5">
                            <span>{item.planTier}</span>
                          </div>
                          <div className="text-xs text-slate-600 font-mono">
                            ₱{item.mbl.toLocaleString()} MBL / illness
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {item.roomAndBoard}
                          </div>
                        </td>

                        {/* Dependents count */}
                        <td className="px-4 py-4">
                          <button
                            onClick={() => {
                              setSelectedEnrollment(item);
                              setIsEditModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
                          >
                            <Users className="w-3.5 h-3.5 text-slate-500" />
                            <span>{item.dependents.length} enrolled</span>
                            {item.dependents.some(d => !d.isActive) && (
                              <span className="w-2 h-2 rounded-full bg-amber-400" title="Has inactive dependent"></span>
                            )}
                          </button>
                        </td>

                        {/* Payroll Deduction */}
                        <td className="px-5 py-4">
                          <div className="font-mono font-semibold text-slate-900">
                            ₱{totalEmpDeduction.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                            <span className="text-xs font-normal text-slate-500"> /mo</span>
                          </div>
                          <div className="text-[11px] text-slate-400">
                            Subsidy: ₱{(item.isActive ? item.employerShareMonthly : 0).toLocaleString()}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedEnrollment(item);
                              setIsEditModalOpen(true);
                            }}
                            className="text-xs bg-white hover:bg-blue-50 text-blue-700 hover:text-blue-800 font-medium px-3 py-1.5 rounded-md border border-blue-200 shadow-xs transition-colors"
                          >
                            Manage Coverage
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredEnrollments.length === 0 && (
              <div className="p-8 text-center text-slate-500">
                <AlertCircle className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                <p className="font-medium">No HMO enrollment records found matching your filters.</p>
                <p className="text-xs mt-1">Try resetting the search bar or provider filter.</p>
              </div>
            )}
          </div>
        </>
      ) : (
        /* Plan Catalog Tab */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {HMO_CATALOG.map((plan, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded uppercase ${
                    plan.provider === 'Maxicare' ? 'bg-blue-100 text-blue-800' :
                    plan.provider === 'Intellicare' ? 'bg-emerald-100 text-emerald-800' :
                    plan.provider === 'MediCard' ? 'bg-red-100 text-red-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {plan.provider}
                  </span>
                  <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                    {plan.tier}
                  </span>
                </div>

                <div className="mt-3">
                  <div className="text-xs text-slate-500">Maximum Benefit Limit (MBL)</div>
                  <div className="text-2xl font-bold text-slate-900 font-mono">
                    ₱{plan.mbl.toLocaleString()} <span className="text-xs font-normal text-slate-500">/ illness</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {plan.description}
                </p>

                <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Room & Board:</span>
                    <span className="font-semibold text-slate-800">{plan.roomAndBoard}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Dental Care:</span>
                    <span className="font-semibold text-slate-800">{plan.dentalCovered ? 'Included (Free prophylaxis)' : 'Optional Add-on'}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Optical Benefit:</span>
                    <span className="font-semibold text-slate-800">{plan.opticalCovered ? 'Covered (Frame & Lens subsidy)' : 'Not Included'}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Co-Payment:</span>
                    <span className="font-semibold text-emerald-700">0% (100% cashless)</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1 border border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-500">Company Subsidy:</span>
                  <span className="font-mono font-semibold text-emerald-700">₱{plan.standardEmployerShare.toLocaleString()}/mo</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Employee Payroll Share:</span>
                  <span className="font-mono font-semibold text-purple-700">₱{plan.standardEmployeeShare.toLocaleString()}/mo</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: Manage Employee HMO Coverage & Dependents */}
      {isEditModalOpen && selectedEnrollment && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Manage HMO Coverage & Dependents</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedEnrollment.employeeName} ({selectedEnrollment.employeeId}) • {selectedEnrollment.department}
                </p>
              </div>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedEnrollment(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            {/* Primary Coverage Toggle ("Can be on or off") */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-slate-900">Employee HMO Benefit Status</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Turning this OFF suspends insurance coverage and removes payroll premium deductions.
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-bold ${selectedEnrollment.isActive ? 'text-emerald-700' : 'text-slate-400'}`}>
                  {selectedEnrollment.isActive ? 'ACTIVE (ON)' : 'OPTED OUT (OFF)'}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedEnrollment({ ...selectedEnrollment, isActive: !selectedEnrollment.isActive })}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    selectedEnrollment.isActive ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      selectedEnrollment.isActive ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Plan Tier Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Provider</label>
                <input
                  type="text"
                  disabled
                  value={selectedEnrollment.provider}
                  className="w-full text-xs bg-slate-100 border border-slate-300 rounded-lg p-2.5 text-slate-600 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Plan Tier</label>
                <select
                  value={selectedEnrollment.planTier}
                  onChange={(e) => handlePlanTierChange(e.target.value as HmoPlanTier)}
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 font-medium"
                >
                  <option value="Silver">Silver (₱150,000 MBL)</option>
                  <option value="Gold">Gold (₱200,000 MBL)</option>
                  <option value="Platinum">Platinum (₱300,000 MBL)</option>
                  <option value="VIP Executive">VIP Executive (₱350,000 MBL)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">HMO Card Number</label>
                <input
                  type="text"
                  value={selectedEnrollment.cardNumber}
                  onChange={(e) => setSelectedEnrollment({ ...selectedEnrollment, cardNumber: e.target.value })}
                  className="w-full text-xs font-mono bg-white border border-slate-300 rounded-lg p-2.5"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Card Expiry Date</label>
                <input
                  type="date"
                  value={selectedEnrollment.cardExpiryDate}
                  onChange={(e) => setSelectedEnrollment({ ...selectedEnrollment, cardExpiryDate: e.target.value })}
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5"
                />
              </div>
            </div>

            {/* Dependents Section */}
            <div className="space-y-3 pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Enrolled Dependents ({selectedEnrollment.dependents.length})</h4>
                  <p className="text-xs text-slate-500">Each dependent's coverage can be independently turned On or Off.</p>
                </div>
              </div>

              {selectedEnrollment.dependents.length > 0 ? (
                <div className="space-y-2">
                  {selectedEnrollment.dependents.map((dep) => (
                    <div 
                      key={dep.id} 
                      className={`p-3 rounded-lg border flex items-center justify-between gap-3 text-xs ${
                        dep.isActive ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-200/60 opacity-60'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-slate-900 flex items-center gap-2">
                          <span>{dep.name}</span>
                          <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px] font-medium">
                            {dep.relationship}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          {dep.cardNumber} • Born: {dep.birthDate} ({dep.gender})
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-mono font-medium text-purple-700">
                            ₱{dep.employeePayrollDeduction.toLocaleString()}/mo
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Payroll deduction
                          </div>
                        </div>

                        {/* Dependent on/off switch */}
                        <button
                          type="button"
                          onClick={() => handleToggleDependent(dep.id)}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                            dep.isActive ? 'bg-emerald-600' : 'bg-slate-300'
                          }`}
                          title={`Turn ${dep.isActive ? 'OFF' : 'ON'} dependent coverage`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                              dep.isActive ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>

                        {/* Remove Dependent */}
                        <button
                          type="button"
                          onClick={() => handleRemoveDependent(dep.id)}
                          className="text-slate-400 hover:text-red-600 p-1 transition-colors"
                          title="Remove dependent"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-slate-50 rounded-lg text-center text-xs text-slate-500">
                  No dependents registered for this employee yet.
                </div>
              )}

              {/* Add Dependent Sub-Form */}
              <div className="bg-blue-50/50 p-3.5 rounded-xl border border-blue-200 space-y-3">
                <div className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                  <UserPlus className="w-3.5 h-3.5 text-blue-600" />
                  <span>Add New Dependent</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      placeholder="Full Name (e.g. Maria Clara Jr.)"
                      value={newDepName}
                      onChange={(e) => setNewDepName(e.target.value)}
                      className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2"
                    />
                  </div>
                  <div>
                    <select
                      value={newDepRel}
                      onChange={(e) => setNewDepRel(e.target.value as any)}
                      className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 font-medium"
                    >
                      <option value="Spouse">Spouse</option>
                      <option value="Child">Child</option>
                      <option value="Parent">Parent</option>
                      <option value="Sibling">Sibling</option>
                    </select>
                  </div>
                  <div>
                    <input
                      type="date"
                      value={newDepDob}
                      onChange={(e) => setNewDepDob(e.target.value)}
                      className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                    <input
                      type="checkbox"
                      checked={newDepPreExisting}
                      onChange={(e) => setNewDepPreExisting(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Cover Pre-Existing Conditions (PEC)</span>
                  </label>

                  <button
                    type="button"
                    onClick={handleAddDependent}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Dependent</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Total Monthly Payroll Impact Preview */}
            <div className="bg-slate-900 text-slate-100 p-4 rounded-xl flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-400 uppercase font-semibold">Total Monthly Payroll Deduction</div>
                <div className="text-lg font-bold text-white font-mono mt-0.5">
                  ₱{
                    (
                      (selectedEnrollment.isActive ? selectedEnrollment.employeeShareMonthly : 0) +
                      selectedEnrollment.dependents.filter(d => d.isActive).reduce((s, d) => s + d.employeePayrollDeduction, 0)
                    ).toLocaleString('en-PH', { minimumFractionDigits: 2 })
                  }
                </div>
              </div>
              <div className="text-right text-xs text-slate-400">
                <div>Employer Contribution:</div>
                <div className="font-mono font-semibold text-emerald-400">
                  ₱{
                    (
                      (selectedEnrollment.isActive ? selectedEnrollment.employerShareMonthly : 0) +
                      selectedEnrollment.dependents.filter(d => d.isActive).reduce((s, d) => s + d.employerSubsidy, 0)
                    ).toLocaleString('en-PH', { minimumFractionDigits: 2 })
                  }
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedEnrollment(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveEnrollment(selectedEnrollment)}
                className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Enroll New Employee */}
      {isNewEnrollModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Enroll Employee to HMO</h3>
                <p className="text-xs text-slate-500 mt-0.5">Add a new company-sponsored healthcare insurance enrollment.</p>
              </div>
              <button
                onClick={() => setIsNewEnrollModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Employee</label>
                <select
                  value={newEmpId}
                  onChange={(e) => setNewEmpId(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5 font-medium"
                >
                  <option value="">-- Choose an employee --</option>
                  {mockEmployees
                    .filter(emp => !enrollments.some(en => en.employeeId === emp.id))
                    .map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName} ({emp.department} - {emp.role})
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">HMO Provider</label>
                  <select
                    value={newEmpProvider}
                    onChange={(e) => setNewEmpProvider(e.target.value as HmoProvider)}
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5 font-medium"
                  >
                    <option value="Maxicare">Maxicare</option>
                    <option value="Intellicare">Intellicare</option>
                    <option value="MediCard">MediCard</option>
                    <option value="PhilCare">PhilCare</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Plan Tier</label>
                  <select
                    value={newEmpTier}
                    onChange={(e) => setNewEmpTier(e.target.value as HmoPlanTier)}
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5 font-medium"
                  >
                    <option value="Silver">Silver (₱150,000 MBL)</option>
                    <option value="Gold">Gold (₱200,000 MBL)</option>
                    <option value="Platinum">Platinum (₱300,000 MBL)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">HMO Card Number</label>
                <input
                  type="text"
                  placeholder="e.g. MAX-2024-99120"
                  value={newEmpCardNo}
                  onChange={(e) => setNewEmpCardNo(e.target.value)}
                  className="w-full text-xs font-mono bg-white border border-slate-300 rounded-lg p-2.5"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Effective Enrollment Date</label>
                <input
                  type="date"
                  value={newEmpDate}
                  onChange={(e) => setNewEmpDate(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsNewEnrollModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!newEmpId}
                onClick={handleCreateEnrollment}
                className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 rounded-lg shadow-sm"
              >
                Confirm Enrollment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
