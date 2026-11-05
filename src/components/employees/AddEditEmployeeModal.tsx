import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, UserPlus, Briefcase, DollarSign, ShieldCheck, HeartPulse, 
  Calendar, CheckCircle2, AlertTriangle, Sparkles, FileCheck, ArrowRight,
  Info, CreditCard, Building2, User
} from 'lucide-react';
import { Employee } from '../../types';
import { ONBOARDING_PRESETS, OnboardingPreset } from '../../lib/employee-store';
import { calculateSSS, calculatePhilHealth, calculatePagIBIG, calculateWithholdingTax } from '../../lib/ph-payroll';
import { validateGovernmentId } from '../../lib/statutory-compliance';

interface AddEditEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (employee: Partial<Employee> & { firstName: string; lastName: string }) => Employee;
  initialEmployee?: Employee | null;
}

export function AddEditEmployeeModal({
  isOpen,
  onClose,
  onSave,
  initialEmployee,
}: AddEditEmployeeModalProps) {
  const navigate = useNavigate();

  // Form State
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('0917-000-0000');
  const [role, setRole] = useState('Operations Specialist');
  const [department, setDepartment] = useState('Operations');
  const [employmentType, setEmploymentType] = useState<'Regular' | 'Probationary' | 'Project-Based' | 'Executive' | 'Consultant'>('Regular');
  const [status, setStatus] = useState<'Active' | 'On Leave' | 'Terminated'>('Active');
  const [joinDate, setJoinDate] = useState(new Date().toISOString().split('T')[0]);
  const [basicSalary, setBasicSalary] = useState<number>(35000);
  const [allowance, setAllowance] = useState<number>(2000);

  // Government IDs
  const [tin, setTin] = useState('123-456-789-000');
  const [sssNumber, setSssNumber] = useState('04-1234567-8');
  const [philhealthNumber, setPhilhealthNumber] = useState('12-345678901-2');
  const [pagibigNumber, setPagibigNumber] = useState('1234-5678-9012');

  // Benefits & Leaves
  const [hmoPlan, setHmoPlan] = useState('Maxicare Comprehensive Silver');
  const [hmoEnrolled, setHmoEnrolled] = useState(true);
  const [silLeave, setSilLeave] = useState(5);
  const [sickLeave, setSickLeave] = useState(10);
  const [vacationLeave, setVacationLeave] = useState(12);
  const [parentalLeave, setParentalLeave] = useState(0);

  const [activeTab, setActiveTab] = useState<'details' | 'compensation' | 'statutory' | 'leaves'>('details');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Populate from initial employee if editing
  useEffect(() => {
    if (initialEmployee) {
      setFirstName(initialEmployee.firstName || '');
      setMiddleName(initialEmployee.middleName || '');
      setLastName(initialEmployee.lastName || '');
      setEmail(initialEmployee.email || '');
      setPhone(initialEmployee.phone || '0917-123-4567');
      setRole(initialEmployee.role || '');
      setDepartment(initialEmployee.department || 'Operations');
      setEmploymentType(initialEmployee.employmentType || 'Regular');
      setStatus(initialEmployee.status || 'Active');
      setJoinDate(initialEmployee.joinDate || new Date().toISOString().split('T')[0]);
      setBasicSalary(initialEmployee.basicSalary || 30000);
      setAllowance(initialEmployee.allowance || 2000);
      setTin(initialEmployee.tin || '');
      setSssNumber(initialEmployee.sssNumber || '');
      setPhilhealthNumber(initialEmployee.philhealthNumber || '');
      setPagibigNumber(initialEmployee.pagibigNumber || '');
      setHmoPlan(initialEmployee.hmoPlan || 'Maxicare Standard Silver');
      setHmoEnrolled(initialEmployee.hmoEnrolled ?? true);
      setSilLeave(initialEmployee.leaveBalances?.sil ?? 5);
      setSickLeave(initialEmployee.leaveBalances?.sick ?? 10);
      setVacationLeave(initialEmployee.leaveBalances?.vacation ?? 12);
      setParentalLeave(initialEmployee.leaveBalances?.parental ?? 0);
    } else {
      // Default new employee
      setFirstName('');
      setMiddleName('');
      setLastName('');
      setEmail('');
      setPhone('0917-123-4567');
      setRole('Software Engineer');
      setDepartment('Engineering');
      setEmploymentType('Regular');
      setStatus('Active');
      setJoinDate(new Date().toISOString().split('T')[0]);
      setBasicSalary(45000);
      setAllowance(2500);
      setTin('123-456-789-000');
      setSssNumber('04-1234567-8');
      setPhilhealthNumber('12-345678901-2');
      setPagibigNumber('1234-5678-9012');
      setHmoPlan('Maxicare Comprehensive Silver');
      setHmoEnrolled(true);
      setSilLeave(5);
      setSickLeave(10);
      setVacationLeave(12);
      setParentalLeave(0);
    }
  }, [initialEmployee, isOpen]);

  // Real-time validations
  const sssValidation = useMemo(() => validateGovernmentId(sssNumber, 'SSS'), [sssNumber]);
  const phValidation = useMemo(() => validateGovernmentId(philhealthNumber, 'PHILHEALTH'), [philhealthNumber]);
  const hdmfValidation = useMemo(() => validateGovernmentId(pagibigNumber, 'PAGIBIG'), [pagibigNumber]);
  const tinValidation = useMemo(() => validateGovernmentId(tin, 'TIN'), [tin]);

  // Real-time Statutory Computation
  const statutoryPreview = useMemo(() => {
    const sss = calculateSSS(basicSalary);
    const ph = calculatePhilHealth(basicSalary);
    const hdmf = calculatePagIBIG(basicSalary);
    const taxableSalary = Math.max(0, basicSalary - (sss.totalEE + ph.eeShare + hdmf.eeShare));
    const taxResult = calculateWithholdingTax(taxableSalary);
    const tax = taxResult.tax;
    const netTakeHome = basicSalary + allowance - (sss.totalEE + ph.eeShare + hdmf.eeShare + tax);

    return {
      sssEE: sss.totalEE,
      sssER: sss.totalER,
      wispEE: sss.wispEE,
      wispER: sss.wispER,
      phEE: ph.eeShare,
      phER: ph.erShare,
      hdmfEE: hdmf.eeShare,
      hdmfER: hdmf.erShare,
      tax,
      netTakeHome,
      totalEE: sss.totalEE + ph.eeShare + hdmf.eeShare,
      totalER: sss.totalER + ph.erShare + hdmf.erShare,
    };
  }, [basicSalary, allowance]);

  // Fast preset applier
  const applyPreset = (preset: OnboardingPreset) => {
    setRole(preset.role);
    setDepartment(preset.department);
    setEmploymentType(preset.employmentType);
    setBasicSalary(preset.basicSalary);
    setAllowance(preset.allowance);
    setTin(preset.tin);
    setSssNumber(preset.sssNumber);
    setPhilhealthNumber(preset.philhealthNumber);
    setPagibigNumber(preset.pagibigNumber);
    setHmoPlan(preset.hmoPlan);
    if (!firstName) setFirstName('Juan');
    if (!lastName) setLastName('Santos');
    if (!email) setEmail('juan.santos@kawayanhr.ph');
  };

  const handleSave = (redirectOption?: 'contract' | 'contributions') => {
    if (!firstName.trim() || !lastName.trim()) {
      setValidationError('First name and last name are required.');
      setActiveTab('details');
      return;
    }

    if (basicSalary < 10000) {
      setValidationError('Basic salary must be at least ₱10,000 for standard compensation compliance.');
      setActiveTab('compensation');
      return;
    }

    setValidationError(null);

    const employeePayload: Partial<Employee> & { firstName: string; lastName: string } = {
      ...(initialEmployee ? { id: initialEmployee.id } : {}),
      firstName: firstName.trim(),
      middleName: middleName.trim(),
      lastName: lastName.trim(),
      email: email.trim() || `${firstName.toLowerCase()}.${lastName.toLowerCase()}@kawayanhr.ph`,
      phone: phone.trim(),
      role: role.trim(),
      department: department.trim(),
      employmentType,
      status,
      joinDate,
      basicSalary: Number(basicSalary),
      allowance: Number(allowance),
      tin: tin.trim(),
      sssNumber: sssNumber.trim(),
      philhealthNumber: philhealthNumber.trim(),
      pagibigNumber: pagibigNumber.trim(),
      hmoPlan: hmoPlan.trim(),
      hmoEnrolled,
      leaveBalances: {
        sil: Number(silLeave),
        sick: Number(sickLeave),
        vacation: Number(vacationLeave),
        parental: Number(parentalLeave),
      },
    };

    const saved = onSave(employeePayload);
    onClose();

    if (redirectOption === 'contract') {
      navigate(`/contracts?empId=${saved.id}`);
    } else if (redirectOption === 'contributions') {
      navigate('/contributions');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col max-h-[92vh] border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  {initialEmployee ? 'Edit Employee Record' : 'Onboard New Employee'}
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-500/30 text-blue-300 border border-blue-400/30">
                  PH Registry
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Complete official personnel record with Philippine statutory deductions, IDs, and leave credits.
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

        {/* 1-Click Fast Presets (Only when onboarding new employee) */}
        {!initialEmployee && (
          <div className="bg-slate-50 border-b border-slate-200 px-5 py-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>1-Click Philippine Onboarding Presets:</span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {ONBOARDING_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-white border border-slate-200 hover:border-blue-400 hover:text-blue-600 rounded-md text-slate-600 transition-all shadow-2xs"
                    title={`Fill as ${preset.role} (₱${preset.basicSalary.toLocaleString()})`}
                  >
                    {preset.badge}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50/50 px-5 pt-2 gap-1 overflow-x-auto text-xs font-semibold text-slate-600">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-4 py-2.5 rounded-t-lg border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'details'
                ? 'border-blue-600 text-blue-600 bg-white font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            1. Identity & Role
          </button>
          <button
            onClick={() => setActiveTab('compensation')}
            className={`px-4 py-2.5 rounded-t-lg border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'compensation'
                ? 'border-blue-600 text-blue-600 bg-white font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            2. Compensation & Net Pay
          </button>
          <button
            onClick={() => setActiveTab('statutory')}
            className={`px-4 py-2.5 rounded-t-lg border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'statutory'
                ? 'border-blue-600 text-blue-600 bg-white font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            3. Government IDs & Formats
            {(!sssValidation.isValid || !phValidation.isValid || !hdmfValidation.isValid) && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block ml-0.5"></span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('leaves')}
            className={`px-4 py-2.5 rounded-t-lg border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'leaves'
                ? 'border-blue-600 text-blue-600 bg-white font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <HeartPulse className="w-3.5 h-3.5" />
            4. Benefits & Leave Balances
          </button>
        </div>

        {/* Validation Error Banner */}
        {validationError && (
          <div className="bg-rose-50 border-b border-rose-200 px-5 py-2.5 flex items-center gap-2 text-xs font-semibold text-rose-800">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Body Form */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* TAB 1: IDENTITY & ROLE */}
          {activeTab === 'details' && (
            <div className="space-y-5 animate-in fade-in duration-100">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    First Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maria"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Middle Name / Initial
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Santos"
                    value={middleName}
                    onChange={(e) => setMiddleName(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Last Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Clara"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Company Email
                  </label>
                  <input
                    type="email"
                    placeholder="first.last@kawayanhr.ph"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Mobile Phone (PH)
                  </label>
                  <input
                    type="text"
                    placeholder="0917-123-4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="border-t border-slate-200 pt-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                  Philippine Employment Classification & Tenure
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Department
                    </label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white"
                    >
                      <option value="Engineering">Engineering & IT</option>
                      <option value="Human Resources">Human Resources</option>
                      <option value="Operations">Operations & Logistics</option>
                      <option value="Marketing">Marketing & Comms</option>
                      <option value="Sales">Sales & Business Dev</option>
                      <option value="Finance">Finance & Accounting</option>
                      <option value="Product Design">Product & Design</option>
                      <option value="Executive">Executive Leadership</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Job Position / Role
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Senior Software Engineer"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Employment Archetype
                    </label>
                    <select
                      value={employmentType}
                      onChange={(e) => setEmploymentType(e.target.value as any)}
                      className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white font-medium"
                    >
                      <option value="Regular">Regular (Security of Tenure - Art. 294)</option>
                      <option value="Probationary">Probationary (6-Month Max - Art. 296)</option>
                      <option value="Project-Based">Project-Based (DOLE DO 174-17)</option>
                      <option value="Executive">Executive (Art. 82 OT Exempt)</option>
                      <option value="Consultant">Independent Consultant (Civil Code / 2307)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Date of Engagement / Join Date
                    </label>
                    <input
                      type="date"
                      value={joinDate}
                      onChange={(e) => setJoinDate(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Employment Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white"
                    >
                      <option value="Active">Active Duty</option>
                      <option value="On Leave">On Official Leave</option>
                      <option value="Terminated">Separated / Terminated</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: COMPENSATION & NET PAY PREVIEW */}
          {activeTab === 'compensation' && (
            <div className="space-y-6 animate-in fade-in duration-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Basic Monthly Salary (PHP) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-base">₱</span>
                    <input
                      type="number"
                      step="500"
                      min="10000"
                      value={basicSalary}
                      onChange={(e) => setBasicSalary(Number(e.target.value))}
                      className="w-full pl-8 pr-3.5 py-2.5 text-base font-bold text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Mandated statutory deductions (SSS, PhilHealth, Pag-IBIG) and 13th-month accrual will automatically bind to this base.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Fixed De Minimis / Monthly Allowance (PHP)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-base">₱</span>
                    <input
                      type="number"
                      step="500"
                      min="0"
                      value={allowance}
                      onChange={(e) => setAllowance(Number(e.target.value))}
                      className="w-full pl-8 pr-3.5 py-2.5 text-base font-bold text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Non-taxable up to statutory thresholds (rice subsidy, uniform, laundry, medical cash assistance).
                  </p>
                </div>
              </div>

              {/* Live Statutory & Net Pay Calculation Card */}
              <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl text-white shadow-md space-y-4">
                <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                      Live Philippine Statutory & Net Pay Projection
                    </span>
                  </div>
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded border border-emerald-800">
                    Estimated Take-Home: ₱{statutoryPreview.netTakeHome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-2.5 bg-slate-800/80 rounded-lg border border-slate-700/60">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">SSS Total EE</div>
                    <div className="text-sm font-bold text-white font-mono mt-0.5">₱{statutoryPreview.sssEE.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                    <div className="text-[9px] text-slate-400">ER: ₱{statutoryPreview.sssER.toLocaleString(undefined, { minimumFractionDigits: 2 })} {statutoryPreview.wispEE > 0 && '(inc. WISP)'}</div>
                  </div>

                  <div className="p-2.5 bg-slate-800/80 rounded-lg border border-slate-700/60">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">PhilHealth 5% EE</div>
                    <div className="text-sm font-bold text-white font-mono mt-0.5">₱{statutoryPreview.phEE.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                    <div className="text-[9px] text-slate-400">ER: ₱{statutoryPreview.phER.toLocaleString(undefined, { minimumFractionDigits: 2 })} (50/50 split)</div>
                  </div>

                  <div className="p-2.5 bg-slate-800/80 rounded-lg border border-slate-700/60">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Pag-IBIG EE</div>
                    <div className="text-sm font-bold text-white font-mono mt-0.5">₱{statutoryPreview.hdmfEE.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                    <div className="text-[9px] text-slate-400">ER: ₱{statutoryPreview.hdmfER.toLocaleString(undefined, { minimumFractionDigits: 2 })} (Circular 460)</div>
                  </div>

                  <div className="p-2.5 bg-slate-800/80 rounded-lg border border-slate-700/60">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Est. BIR Withholding</div>
                    <div className="text-sm font-bold text-white font-mono mt-0.5">₱{statutoryPreview.tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                    <div className="text-[9px] text-slate-400">TRAIN Law Revised Brackets</div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-300 pt-2 border-t border-slate-700/50">
                  <span>Gross Compensation: ₱{(basicSalary + allowance).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  <span>Total Employee Deductions: ₱{(statutoryPreview.totalEE + statutoryPreview.tax).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  <span>Employer Statutory Burden: ₱{statutoryPreview.totalER.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: GOVERNMENT IDS & VALIDATION */}
          {activeTab === 'statutory' && (
            <div className="space-y-5 animate-in fade-in duration-100">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 text-xs text-blue-900 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Official Statutory Identifier Requirements</div>
                  <div>
                    Philippine statutory filings (SSS R-3, PhilHealth EPRS RF-1, Pag-IBIG MCRF, and BIR 2316/2307) require verified formats to avoid agency submission rejection.
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* SSS */}
                <div className="p-4 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span>Social Security System (SSS)</span>
                    </label>
                    {sssValidation.isValid ? (
                      <span className="flex items-center text-[10px] font-bold text-emerald-600 gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> Valid 10-Digit
                      </span>
                    ) : (
                      <span className="flex items-center text-[10px] font-bold text-amber-600 gap-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        <AlertTriangle className="w-3 h-3" /> {sssValidation.issue}
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="04-1234567-8"
                    value={sssNumber}
                    onChange={(e) => setSssNumber(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                  <p className="text-[11px] text-slate-500">Format: XX-XXXXXXX-X (10 numerical digits)</p>
                </div>

                {/* PhilHealth */}
                <div className="p-4 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span>PhilHealth PIN</span>
                    </label>
                    {phValidation.isValid ? (
                      <span className="flex items-center text-[10px] font-bold text-emerald-600 gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> Valid 12-Digit
                      </span>
                    ) : (
                      <span className="flex items-center text-[10px] font-bold text-amber-600 gap-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        <AlertTriangle className="w-3 h-3" /> {phValidation.issue}
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="12-345678901-2"
                    value={philhealthNumber}
                    onChange={(e) => setPhilhealthNumber(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                  <p className="text-[11px] text-slate-500">Format: XX-XXXXXXXXX-X (12 numerical digits)</p>
                </div>

                {/* Pag-IBIG */}
                <div className="p-4 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span>Pag-IBIG MID (HDMF)</span>
                    </label>
                    {hdmfValidation.isValid ? (
                      <span className="flex items-center text-[10px] font-bold text-emerald-600 gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> Valid 12-Digit
                      </span>
                    ) : (
                      <span className="flex items-center text-[10px] font-bold text-amber-600 gap-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        <AlertTriangle className="w-3 h-3" /> {hdmfValidation.issue}
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="1234-5678-9012"
                    value={pagibigNumber}
                    onChange={(e) => setPagibigNumber(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                  <p className="text-[11px] text-slate-500">Format: XXXX-XXXX-XXXX (12 numerical digits)</p>
                </div>

                {/* BIR TIN */}
                <div className="p-4 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span>BIR TIN (Taxpayer ID)</span>
                    </label>
                    {tinValidation.isValid ? (
                      <span className="flex items-center text-[10px] font-bold text-emerald-600 gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> Valid TIN
                      </span>
                    ) : (
                      <span className="flex items-center text-[10px] font-bold text-amber-600 gap-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        <AlertTriangle className="w-3 h-3" /> {tinValidation.issue}
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="123-456-789-000"
                    value={tin}
                    onChange={(e) => setTin(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                  <p className="text-[11px] text-slate-500">Format: XXX-XXX-XXX-000 (9 to 12 digits with RDO code)</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: BENEFITS & LEAVES */}
          {activeTab === 'leaves' && (
            <div className="space-y-6 animate-in fade-in duration-100">
              {/* HMO Enrollment */}
              <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <HeartPulse className="w-4 h-4 text-rose-500" />
                      Health Maintenance Organization (HMO) Coverage
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Enterprise group medical healthcare policy with dependent coverage.
                    </p>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hmoEnrolled}
                      onChange={(e) => setHmoEnrolled(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    <span className="text-xs font-semibold text-slate-700">Enrolled</span>
                  </label>
                </div>

                {hmoEnrolled && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Assigned HMO Healthcare Plan
                      </label>
                      <select
                        value={hmoPlan}
                        onChange={(e) => setHmoPlan(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
                      >
                        <option value="Maxicare Comprehensive Silver">Maxicare Comprehensive Silver (₱150k MBL)</option>
                        <option value="Maxicare Comprehensive Platinum">Maxicare Comprehensive Platinum (₱250k MBL)</option>
                        <option value="Intellicare Silver Core">Intellicare Silver Core (₱120k MBL)</option>
                        <option value="PhilCare Enterprise Gold">PhilCare Enterprise Gold (₱200k MBL)</option>
                        <option value="Medicard Executive Suite">Medicard Executive Suite (₱300k MBL)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Corporate Premium Subsidy
                      </label>
                      <input
                        type="text"
                        disabled
                        value="100% Employer Subsidized"
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-100 text-slate-600"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Leave Balances */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  Statutory & Company Leave Credits (Annual)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase">
                      SIL (Art. 95)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={silLeave}
                      onChange={(e) => setSilLeave(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 text-base font-bold text-blue-600 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <span className="text-[10px] text-slate-500 block">Min. 5 days statutory</span>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase">
                      Sick Leave
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={sickLeave}
                      onChange={(e) => setSickLeave(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 text-base font-bold text-emerald-600 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <span className="text-[10px] text-slate-500 block">Company policy days</span>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase">
                      Vacation Leave
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={vacationLeave}
                      onChange={(e) => setVacationLeave(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 text-base font-bold text-amber-600 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                    <span className="text-[10px] text-slate-500 block">Convertible or carried</span>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase">
                      Parental Leave
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={parentalLeave}
                      onChange={(e) => setParentalLeave(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 text-base font-bold text-purple-600 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                    <span className="text-[10px] text-slate-500 block">Paternity / Solo parent</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg transition-colors shadow-2xs"
            >
              Cancel
            </button>
            <span className="text-xs text-slate-400 hidden sm:inline">|</span>
            <span className="text-[11px] text-slate-500 hidden sm:inline">
              Data auto-syncs with Contracts, Payroll & Contributions modules.
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleSave('contract')}
              className="px-3.5 py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
              title="Save employee record and immediately jump to contract generator"
            >
              <FileCheck className="w-3.5 h-3.5 text-indigo-600" />
              Save & Generate Contract
            </button>
            <button
              type="button"
              onClick={() => handleSave()}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4" />
              {initialEmployee ? 'Update Employee' : 'Save to Registry'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
