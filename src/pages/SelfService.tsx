import React, { useState, useMemo } from 'react';
import { 
  User, ShieldCheck, Lock, FileText, Download, Calendar, CalendarCheck, 
  Clock, CreditCard, Building2, AlertCircle, CheckCircle2, XCircle, 
  ChevronRight, Info, DollarSign, Send, HelpCircle, HeartHandshake, 
  Eye, RefreshCw, KeyRound, Phone, MapPin, Briefcase, FileBadge2
} from 'lucide-react';
import { format, differenceInBusinessDays, parseISO } from 'date-fns';
import { mockEmployees, mockLeaveRequests as initialMockLeaveRequests } from '../data/mockData';
import { initialHmoEnrollments } from '../data/mockHmoData';
import { calculateContributions, ContributionBreakdown } from '../lib/ph-payroll';
import { PayslipModal } from '../components/payroll/PayslipModal';
import { Employee, LeaveRequest } from '../types';

interface HistoricalCutoff {
  id: string;
  periodLabel: string;
  periodStart: string;
  periodEnd: string;
  payDate: string;
  status: 'Paid' | 'Processing';
  type: 'Regular Semi-Monthly' | '13th Month Pay' | 'Bonus';
  breakdown: ContributionBreakdown;
}

export function SelfService() {
  // Active Persona / Secure Employee Simulation
  const [selectedEmpId, setSelectedEmpId] = useState<string>(mockEmployees[0]?.id || 'emp-001');
  const [activeTab, setActiveTab] = useState<'profile' | 'payslips' | 'leaves' | 'loans' | 'handbook'>('profile');
  
  // Security simulation states
  const [isSessionLocked, setIsSessionLocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [is2FaVerified, setIs2FaVerified] = useState(true);

  // Leave filing state
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(initialMockLeaveRequests);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveType, setLeaveType] = useState<LeaveRequest['type']>('SIL');
  const [leaveStartDate, setLeaveStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [leaveEndDate, setLeaveEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [leaveDurationType, setLeaveDurationType] = useState<'Full' | 'Half-AM' | 'Half-PM'>('Full');
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveSuccessToast, setLeaveSuccessToast] = useState<string | null>(null);
  const [leaveErrorToast, setLeaveErrorToast] = useState<string | null>(null);

  // Profile Update Request state
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateCategory, setUpdateCategory] = useState<'contact' | 'address' | 'emergency' | 'dependents'>('contact');
  const [updateDetails, setUpdateDetails] = useState('');
  const [updateSuccessToast, setUpdateSuccessToast] = useState<string | null>(null);

  // Payslip Modal state
  const [selectedPayslip, setSelectedPayslip] = useState<HistoricalCutoff | null>(null);
  const [isPayslipModalOpen, setIsPayslipModalOpen] = useState(false);

  // Active Employee lookup
  const currentEmployee = useMemo<Employee>(() => {
    return mockEmployees.find(e => e.id === selectedEmpId) || mockEmployees[0];
  }, [selectedEmpId]);

  // Dynamic leave balances for current employee, factoring in newly filed leaves
  const employeeLeaveBalances = useMemo(() => {
    const baseBalances = { ...(currentEmployee.leaveBalances || { sil: 5, sick: 10, vacation: 15, parental: 0 }) };
    
    // Count days already taken or pending in current state
    const empRequests = leaveRequests.filter(l => l.employeeId === currentEmployee.id && l.status !== 'Rejected');
    
    empRequests.forEach(req => {
      // Calculate business days
      try {
        const start = parseISO(req.startDate);
        const end = parseISO(req.endDate);
        const days = Math.max(1, differenceInBusinessDays(end, start) + 1);

        if (req.type === 'SIL') {
          baseBalances.sil = Math.max(0, baseBalances.sil - days);
        } else if (req.type === 'Sick') {
          baseBalances.sick = Math.max(0, baseBalances.sick - days);
        } else if (req.type === 'Vacation') {
          baseBalances.vacation = Math.max(0, baseBalances.vacation - days);
        } else if (['Maternity', 'Paternity', 'Magna Carta'].includes(req.type)) {
          baseBalances.parental = Math.max(0, baseBalances.parental - days);
        }
      } catch (err) {
        // Fallback
      }
    });

    return baseBalances;
  }, [currentEmployee, leaveRequests]);

  // Real-time payroll calculation for this employee
  const currentPayrollBreakdown = useMemo(() => {
    return calculateContributions(currentEmployee.basicSalary, {
      employeeId: currentEmployee.id,
      includeLoans: true
    });
  }, [currentEmployee]);

  // Historical payslips generated for this employee
  const historicalPayslips = useMemo<HistoricalCutoff[]>(() => {
    const salary = currentEmployee.basicSalary;
    
    // Periods: April 2026, March 2026 2nd half, March 2026 1st half, Feb 2026, Jan 2026
    const periods = [
      {
        id: `pay-${currentEmployee.id}-2026-04-30`,
        periodLabel: 'April 16, 2026 – April 30, 2026',
        periodStart: '2026-04-16',
        periodEnd: '2026-04-30',
        payDate: '2026-04-30',
        status: 'Paid' as const,
        type: 'Regular Semi-Monthly' as const,
        overtime: 1250,
      },
      {
        id: `pay-${currentEmployee.id}-2026-04-15`,
        periodLabel: 'April 01, 2026 – April 15, 2026',
        periodStart: '2026-04-01',
        periodEnd: '2026-04-15',
        payDate: '2026-04-15',
        status: 'Paid' as const,
        type: 'Regular Semi-Monthly' as const,
        overtime: 0,
      },
      {
        id: `pay-${currentEmployee.id}-2026-03-31`,
        periodLabel: 'March 16, 2026 – March 31, 2026',
        periodStart: '2026-03-16',
        periodEnd: '2026-03-31',
        payDate: '2026-03-31',
        status: 'Paid' as const,
        type: 'Regular Semi-Monthly' as const,
        overtime: 800,
      },
      {
        id: `pay-${currentEmployee.id}-2026-03-15`,
        periodLabel: 'March 01, 2026 – March 15, 2026',
        periodStart: '2026-03-01',
        periodEnd: '2026-03-15',
        payDate: '2026-03-15',
        status: 'Paid' as const,
        type: 'Regular Semi-Monthly' as const,
        overtime: 0,
      },
      {
        id: `pay-${currentEmployee.id}-2026-02-28`,
        periodLabel: 'February 16, 2026 – February 28, 2026',
        periodStart: '2026-02-16',
        periodEnd: '2026-02-28',
        payDate: '2026-02-28',
        status: 'Paid' as const,
        type: 'Regular Semi-Monthly' as const,
        overtime: 0,
      }
    ];

    return periods.map(p => {
      const breakdown = calculateContributions(salary, {
        employeeId: currentEmployee.id,
        overtimePay: p.overtime,
        includeLoans: true
      });
      return {
        ...p,
        breakdown
      };
    });
  }, [currentEmployee]);

  // Filtered leave requests for active employee
  const myLeaves = useMemo(() => {
    return leaveRequests.filter(l => l.employeeId === currentEmployee.id);
  }, [leaveRequests, currentEmployee.id]);

  // Handle PIN verification for locking/unlocking ESS
  const handleUnlockSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === '1234' || pinInput.trim() === '0000' || pinInput.length >= 4) {
      setIsSessionLocked(false);
      setPinInput('');
      setPinError('');
    } else {
      setPinError('Invalid Employee PIN. Use 1234 for simulation.');
    }
  };

  // Compute requested days in leave modal
  const computedRequestedDays = useMemo(() => {
    try {
      const start = parseISO(leaveStartDate);
      const end = parseISO(leaveEndDate);
      if (end < start) return 0;
      const busDays = differenceInBusinessDays(end, start) + 1;
      if (leaveDurationType !== 'Full') {
        return 0.5;
      }
      return Math.max(1, busDays);
    } catch {
      return 1;
    }
  }, [leaveStartDate, leaveEndDate, leaveDurationType]);

  // Handle leave application
  const handleFileLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (computedRequestedDays <= 0) {
      setLeaveErrorToast('End date cannot be earlier than start date.');
      return;
    }

    if (!leaveReason.trim()) {
      setLeaveErrorToast('Please provide a brief justification for this request.');
      return;
    }

    // Check balance for SIL/Sick/Vacation
    if (leaveType === 'SIL' && computedRequestedDays > employeeLeaveBalances.sil) {
      setLeaveErrorToast(`Requested ${computedRequestedDays} days exceeds your available SIL balance (${employeeLeaveBalances.sil} days).`);
      return;
    }
    if (leaveType === 'Sick' && computedRequestedDays > employeeLeaveBalances.sick) {
      setLeaveErrorToast(`Requested ${computedRequestedDays} days exceeds your available Sick Leave balance (${employeeLeaveBalances.sick} days).`);
      return;
    }
    if (leaveType === 'Vacation' && computedRequestedDays > employeeLeaveBalances.vacation) {
      setLeaveErrorToast(`Requested ${computedRequestedDays} days exceeds your available Vacation Leave balance (${employeeLeaveBalances.vacation} days).`);
      return;
    }

    const newLeave: LeaveRequest = {
      id: `lr-${Date.now()}`,
      employeeId: currentEmployee.id,
      type: leaveType,
      startDate: leaveStartDate,
      endDate: leaveEndDate,
      status: 'Pending',
      reason: leaveDurationType !== 'Full' ? `[${leaveDurationType}] ${leaveReason.trim()}` : leaveReason.trim()
    };

    setLeaveRequests(prev => [newLeave, ...prev]);
    setShowLeaveModal(false);
    setLeaveReason('');
    setLeaveErrorToast(null);
    setLeaveSuccessToast(`Leave request for ${computedRequestedDays} day(s) filed successfully! Status is Pending review.`);
    setTimeout(() => setLeaveSuccessToast(null), 5000);
  };

  // Cancel a pending leave request
  const handleCancelLeave = (requestId: string) => {
    setLeaveRequests(prev => prev.filter(l => l.id !== requestId));
    setLeaveSuccessToast('Leave application withdrawn.');
    setTimeout(() => setLeaveSuccessToast(null), 4000);
  };

  // Submit profile change request
  const handleProfileUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateDetails.trim()) return;
    setShowUpdateModal(false);
    setUpdateDetails('');
    setUpdateSuccessToast('Profile change request submitted to HR Admin for verification & DOLE compliance audit.');
    setTimeout(() => setUpdateSuccessToast(null), 5000);
  };

  // Open Payslip modal
  const handleViewPayslip = (payslip: HistoricalCutoff) => {
    setSelectedPayslip(payslip);
    setIsPayslipModalOpen(true);
  };

  // Lock Screen View if session is locked
  if (isSessionLocked) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-100">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Secure Employee Session Locked</h2>
          <p className="text-xs text-slate-500 mt-1 mb-6">
            In compliance with the Philippine Data Privacy Act of 2012 (RA 10173), please enter your 4-digit PIN to access your confidential HR profile and payslips.
          </p>

          <form onSubmit={handleUnlockSession} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">Enter Employee PIN</label>
                <span className="text-[11px] text-blue-600 font-medium">Default: 1234</span>
              </div>
              <div className="relative">
                <input
                  type="password"
                  maxLength={6}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="••••"
                  autoFocus
                  className="w-full text-center tracking-widest text-2xl font-mono px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
                <KeyRound className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
              </div>
              {pinError && <p className="text-xs text-rose-600 mt-1.5 font-medium">{pinError}</p>}
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition shadow-sm text-sm"
            >
              Unlock My Portal
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Session: {currentEmployee.firstName} {currentEmployee.lastName}</span>
            <span className="font-mono text-slate-400">ID: {currentEmployee.id}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast Notifications */}
      {leaveSuccessToast && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2 text-sm font-medium">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{leaveSuccessToast}</span>
          </div>
          <button onClick={() => setLeaveSuccessToast(null)} className="text-emerald-600 hover:text-emerald-800 text-xs font-semibold">
            Dismiss
          </button>
        </div>
      )}

      {leaveErrorToast && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2 text-sm font-medium">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{leaveErrorToast}</span>
          </div>
          <button onClick={() => setLeaveErrorToast(null)} className="text-rose-600 hover:text-rose-800 text-xs font-semibold">
            Dismiss
          </button>
        </div>
      )}

      {updateSuccessToast && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2 text-sm font-medium">
            <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
            <span>{updateSuccessToast}</span>
          </div>
          <button onClick={() => setUpdateSuccessToast(null)} className="text-blue-600 hover:text-blue-800 text-xs font-semibold">
            Dismiss
          </button>
        </div>
      )}

      {/* Top Banner / Secure Authentication Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-xl text-white shadow-inner shrink-0 border border-white/20">
              {currentEmployee.firstName[0]}{currentEmployee.lastName[0]}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Self-Service Portal (ESS)
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {currentEmployee.status} Regular
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {currentEmployee.id.toUpperCase()}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                <span>Welcome back, {currentEmployee.firstName} {currentEmployee.lastName}</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300">
                {currentEmployee.role} • {currentEmployee.department} Department
              </p>
            </div>
          </div>

          {/* Secure Identity Switcher / Simulation Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
            <div className="bg-slate-800/80 rounded-xl p-2 border border-slate-700/80 flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 pl-1 shrink-0">
                Persona:
              </span>
              <select
                value={selectedEmpId}
                onChange={(e) => setSelectedEmpId(e.target.value)}
                className="bg-slate-900 text-white text-xs font-medium rounded-lg px-2.5 py-1.5 border border-slate-700 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              >
                {mockEmployees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName} ({emp.role})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setIsSessionLocked(true)}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 transition"
              title="Lock portal screen to protect payroll and statutory information"
            >
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Lock ESS</span>
            </button>
          </div>
        </div>

        {/* Security & Data Privacy Compliance Sub-banner */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>DOLE & NPC Data Privacy Act 2012 Encrypted Session</span>
            <span>•</span>
            <span>Verified 2FA ID: {currentEmployee.email}</span>
          </div>
          <div className="text-slate-400">
            Last Active: Today, {format(new Date(), 'h:mm a')} PHT (Asia/Manila)
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2 bg-white px-4 py-2 rounded-xl shadow-xs">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-lg transition whitespace-nowrap ${
            activeTab === 'profile'
              ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <User className="w-4 h-4" />
          <span>My Profile & Statutory IDs</span>
        </button>

        <button
          onClick={() => setActiveTab('payslips')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-lg transition whitespace-nowrap ${
            activeTab === 'payslips'
              ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>My Payslips & Tax (2316)</span>
          <span className="bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
            {historicalPayslips.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('leaves')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-lg transition whitespace-nowrap ${
            activeTab === 'leaves'
              ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          <span>Leave Filing & Balances</span>
          {myLeaves.filter(l => l.status === 'Pending').length > 0 && (
            <span className="bg-amber-100 text-amber-700 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
              {myLeaves.filter(l => l.status === 'Pending').length} Pending
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('loans')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-lg transition whitespace-nowrap ${
            activeTab === 'loans'
              ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Salary Loans & Deductions</span>
        </button>

        <button
          onClick={() => setActiveTab('handbook')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-lg transition whitespace-nowrap ${
            activeTab === 'handbook'
              ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>DOLE Rights & Policies</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: MY PROFILE & STATUTORY IDS                              */}
      {/* ============================================================== */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          {/* Quick Notice to Request Updates */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-900">
            <div className="flex items-center gap-2.5">
              <Info className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Need to update your home address, emergency contacts, or BIR dependents? Submit an electronic update ticket below without visiting the HR desk.
              </span>
            </div>
            <button
              onClick={() => setShowUpdateModal(true)}
              className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-3 py-1.5 rounded-lg text-xs transition shadow-xs whitespace-nowrap"
            >
              Request Info Update
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Column 1: Employment Details */}
            <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-blue-600" />
                  Employment Profile
                </h3>
                <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200">
                  Regular
                </span>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Full Legal Name</span>
                  <span className="text-slate-900 font-semibold text-sm">
                    {currentEmployee.firstName} {currentEmployee.lastName}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Work Email</span>
                  <span className="text-slate-800 font-mono">{currentEmployee.email}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Position / Role</span>
                  <span className="text-slate-800 font-medium">{currentEmployee.role}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Department</span>
                  <span className="text-slate-800 font-medium">{currentEmployee.department}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Date Hired</span>
                  <span className="text-slate-800 font-medium">
                    {format(parseISO(currentEmployee.joinDate), 'MMMM dd, yyyy')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Work Arrangement</span>
                  <span className="text-slate-800 font-medium">Hybrid Manila Office (Ortigas Center)</span>
                </div>
              </div>
            </div>

            {/* Column 2: Philippine Government Statutory Numbers */}
            <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-5 lg:col-span-2">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-emerald-600" />
                    Mandatory Philippine Statutory Records
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Official IDs linked with government contribution portals for SSS, PhilHealth, Pag-IBIG, and BIR.
                  </p>
                </div>
                <span className="text-emerald-700 bg-emerald-50 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-200">
                  DOLE Verified
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* SSS Card */}
                <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/40">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-blue-900">Social Security System (SSS)</span>
                    <span className="text-[10px] font-semibold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                      WISP Active
                    </span>
                  </div>
                  <div className="font-mono text-sm font-bold text-slate-900 tracking-wider">
                    {currentEmployee.sssNumber || '04-1234567-8'}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Covers SSS Sickness, Maternity, Disability, Retirement & WISP Plus.
                  </p>
                </div>

                {/* PhilHealth Card */}
                <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/40">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-emerald-900">PhilHealth (Universal Health Care)</span>
                    <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                      Direct Contributor
                    </span>
                  </div>
                  <div className="font-mono text-sm font-bold text-slate-900 tracking-wider">
                    {currentEmployee.philhealthNumber || '12-345678901-2'}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    5% Statutory Premium split 50/50 with employer under RA 11223.
                  </p>
                </div>

                {/* Pag-IBIG / HDMF Card */}
                <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/40">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-indigo-900">Pag-IBIG / HDMF MID</span>
                    <span className="text-[10px] font-semibold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">
                      Mandatory & MP2
                    </span>
                  </div>
                  <div className="font-mono text-sm font-bold text-slate-900 tracking-wider">
                    {currentEmployee.pagibigNumber || '1234-5678-9012'}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    ₱200 EE cap (Circular No. 460) with housing loan eligibility.
                  </p>
                </div>

                {/* BIR TIN Card */}
                <div className="p-4 rounded-xl border border-purple-100 bg-purple-50/40">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-purple-900">BIR Tax Identification (TIN)</span>
                    <span className="text-[10px] font-semibold bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                      Form 2316 Active
                    </span>
                  </div>
                  <div className="font-mono text-sm font-bold text-slate-900 tracking-wider">
                    {currentEmployee.tin || '123-456-789-000'}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    TRAIN Law graduated tax table. RDO 039 - South Quezon City.
                  </p>
                </div>

                {/* HMO Healthcare Benefit Card */}
                {(() => {
                  const empHmo = initialHmoEnrollments.find(h => h.employeeId === currentEmployee.id);
                  return (
                    <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/40 md:col-span-2">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-1.5">
                          <HeartHandshake className="w-4 h-4 text-emerald-700" />
                          <span className="text-xs font-bold text-emerald-950">Company HMO Healthcare Plan</span>
                        </div>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          empHmo?.isActive 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-slate-200 text-slate-600'
                        }`}>
                          {empHmo?.isActive ? 'Active Coverage (ON)' : 'Opted Out (OFF)'}
                        </span>
                      </div>
                      {empHmo ? (
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                          <div>
                            <div className="font-mono text-sm font-bold text-slate-900">
                              {empHmo.provider} • {empHmo.planTier} Tier
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                              Card: {empHmo.cardNumber} • MBL: ₱{empHmo.mbl.toLocaleString()} / illness
                            </div>
                          </div>
                          <div className="text-xs text-slate-600 sm:text-right">
                            <div>Dependents: <strong className="text-slate-800">{empHmo.dependents.length} enrolled</strong></div>
                            <div className="text-[11px] text-slate-400">Monthly Payroll Deduction: ₱{empHmo.employeeShareMonthly.toLocaleString()}</div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500">No active HMO card on file. Visit the HR HMO portal to enroll.</p>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Compensation Profile Details */}
              <div className="pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block font-medium">Basic Monthly Pay</span>
                  <span className="text-slate-900 font-bold text-sm">
                    ₱{currentEmployee.basicSalary.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block font-medium">Semi-Monthly Cut-off</span>
                  <span className="text-slate-900 font-bold text-sm">
                    ₱{(currentEmployee.basicSalary / 2).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block font-medium">Daily Rate (261 Days)</span>
                  <span className="text-slate-900 font-bold text-sm">
                    ₱{((currentEmployee.basicSalary * 12) / 261).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block font-medium">Payroll Bank</span>
                  <span className="text-slate-900 font-bold text-sm flex items-center gap-1">
                    BDO •••• 4821
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Contact & Benefits Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Phone className="w-4 h-4 text-indigo-600" />
                Emergency Contact & Address
              </h3>
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 block">Registered Address</span>
                  <span className="text-slate-800 font-medium">
                    Unit 14B Emerald Tower, F. Ortigas Jr. Rd, San Antonio, Pasig City, 1605 Metro Manila
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-400 block">Primary Contact</span>
                    <span className="text-slate-800 font-medium">+63 917 823 4567</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Emergency Person</span>
                    <span className="text-slate-800 font-medium">Corazon Dela Cruz (Spouse)</span>
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 block">Emergency Mobile</span>
                  <span className="text-slate-800 font-medium">+63 918 901 2345</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-rose-600" />
                HMO & Company Benefits Entitlement
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-600 font-medium">HMO Health Card Provider</span>
                  <span className="font-bold text-slate-800">Maxicare Silver Plus (MBL: ₱200,000)</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-600 font-medium">Covered Dependents</span>
                  <span className="font-bold text-slate-800">2 Active (Spouse & 1 Child)</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-600 font-medium">Rice Subsidy / De Minimis</span>
                  <span className="font-bold text-emerald-700">₱2,000 / month (Tax-Exempt)</span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-slate-600 font-medium">Group Life Insurance</span>
                  <span className="font-bold text-slate-800">₱1,500,000 Principal Sum</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: MY PAYSLIPS & TAX CENTER (2316)                         */}
      {/* ============================================================== */}
      {activeTab === 'payslips' && (
        <div className="space-y-6">
          {/* YTD Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Latest Net Take-Home
              </span>
              <div className="text-2xl font-black text-slate-900 mt-2 font-mono">
                ₱{currentPayrollBreakdown.netPay.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[11px] text-emerald-600 font-medium mt-1 inline-flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Direct credited to Bank
              </span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                YTD Gross Salary (2026)
              </span>
              <div className="text-2xl font-black text-slate-900 mt-2 font-mono">
                ₱{(currentEmployee.basicSalary * 4).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Jan - Apr 2026 (4 months accrued)
              </span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                YTD BIR Withholding Tax
              </span>
              <div className="text-2xl font-black text-slate-900 mt-2 font-mono">
                ₱{(currentPayrollBreakdown.withholdingTax * 4).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[11px] text-purple-600 font-medium mt-1 inline-flex items-center gap-1">
                <FileBadge2 className="w-3.5 h-3.5" /> For Annual BIR 2316 Filing
              </span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Accrued 13th Month Pay
              </span>
              <div className="text-2xl font-black text-blue-600 mt-2 font-mono">
                ₱{((currentEmployee.basicSalary / 12) * 4).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[11px] text-blue-600 font-medium mt-1 inline-flex items-center gap-1">
                <Info className="w-3.5 h-3.5" /> Tax-free (Under ₱90k cap)
              </span>
            </div>
          </div>

          {/* Payslip History Table */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Official Payslip Archive
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Click 'View Payslip' to generate a printable copy or save as PDF compliant with DOLE Labor Standards.
                </p>
              </div>
              <div className="text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 self-start sm:self-auto">
                Disbursement: Semi-Monthly (15th & 30th)
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider font-bold">
                    <th className="py-3 px-4">Pay Period</th>
                    <th className="py-3 px-4">Gross Earnings</th>
                    <th className="py-3 px-4">Gov't Statutory</th>
                    <th className="py-3 px-4">Withholding Tax</th>
                    <th className="py-3 px-4">Net Take-Home</th>
                    <th className="py-3 px-4">Disbursed Date</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {historicalPayslips.map((slip) => {
                    const b = slip.breakdown;
                    return (
                      <tr key={slip.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-slate-900">
                          <div>{slip.periodLabel}</div>
                          <span className="text-[10px] text-slate-400 font-normal">{slip.type}</span>
                        </td>
                        <td className="py-3.5 px-4 font-mono">
                          ₱{b.grossPay.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-600">
                          -₱{b.mandatoryDeductionsEE.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                          <span className="block text-[10px] text-slate-400 font-sans">
                            SSS/PHIC/HDMF
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-purple-700">
                          -₱{b.withholdingTax.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-700 text-sm">
                          ₱{b.netPay.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1 text-[11px] text-slate-600">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {format(parseISO(slip.payDate), 'MMM dd, yyyy')}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleViewPayslip(slip)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg text-xs font-semibold transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Payslip</span>
                          </button>
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

      {/* ============================================================== */}
      {/* TAB 3: LEAVE FILING & BALANCES                                 */}
      {/* ============================================================== */}
      {activeTab === 'leaves' && (
        <div className="space-y-6">
          {/* Top Leave Balances Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* SIL (Service Incentive Leave) */}
            <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5">
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
                <span>DOLE SIL</span>
                <span className="bg-blue-50 text-blue-700 text-[10px] px-1.5 py-0.5 rounded font-bold">
                  Art. 95 Mandatory
                </span>
              </div>
              <div className="text-3xl font-black text-blue-600 font-mono">
                {employeeLeaveBalances.sil}
                <span className="text-xs font-normal text-slate-400 ml-1">days left</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                Convertible to cash at year-end if unused.
              </p>
            </div>

            {/* Vacation Leave (VL) */}
            <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5">
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
                <span>Vacation Leave</span>
                <span className="bg-emerald-50 text-emerald-700 text-[10px] px-1.5 py-0.5 rounded font-bold">
                  Company Benefit
                </span>
              </div>
              <div className="text-3xl font-black text-emerald-600 font-mono">
                {employeeLeaveBalances.vacation}
                <span className="text-xs font-normal text-slate-400 ml-1">days left</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                Planned time-off for rest and relaxation.
              </p>
            </div>

            {/* Sick Leave (SL) */}
            <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5">
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
                <span>Sick Leave</span>
                <span className="bg-rose-50 text-rose-700 text-[10px] px-1.5 py-0.5 rounded font-bold">
                  Medical
                </span>
              </div>
              <div className="text-3xl font-black text-rose-600 font-mono">
                {employeeLeaveBalances.sick}
                <span className="text-xs font-normal text-slate-400 ml-1">days left</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                Med cert required for absences exceeding 2 days.
              </p>
            </div>

            {/* Special / Statutory Leaves */}
            <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5">
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
                <span>Special Statutory</span>
                <span className="bg-purple-50 text-purple-700 text-[10px] px-1.5 py-0.5 rounded font-bold">
                  Labor Code
                </span>
              </div>
              <div className="text-3xl font-black text-purple-600 font-mono">
                {employeeLeaveBalances.parental || 7}
                <span className="text-xs font-normal text-slate-400 ml-1">days cap</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                Solo Parent (RA 8972) / Paternity / Magna Carta.
              </p>
            </div>
          </div>

          {/* Action Header & File Leave Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                My Filed Leave Requests
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Track status of time-off applications or apply for new leave without paperwork.
              </p>
            </div>
            <button
              onClick={() => setShowLeaveModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-xs"
            >
              <Send className="w-4 h-4" />
              <span>Apply for Leave</span>
            </button>
          </div>

          {/* Leave History List */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider font-bold">
                    <th className="py-3 px-4">Leave Type</th>
                    <th className="py-3 px-4">Date Range</th>
                    <th className="py-3 px-4">Duration</th>
                    <th className="py-3 px-4">Reason / Notes</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {myLeaves.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                        No leave requests filed yet. Click 'Apply for Leave' to submit your first request.
                      </td>
                    </tr>
                  ) : (
                    myLeaves.map((req) => {
                      const isPending = req.status === 'Pending';
                      const isApproved = req.status === 'Approved';
                      
                      let daysCount = 1;
                      try {
                        daysCount = Math.max(1, differenceInBusinessDays(parseISO(req.endDate), parseISO(req.startDate)) + 1);
                      } catch {}

                      return (
                        <tr key={req.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 px-4 font-semibold text-slate-900">
                            <span className="inline-block px-2.5 py-1 rounded bg-slate-100 font-bold text-slate-800 text-[11px]">
                              {req.type}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-medium text-slate-900">
                              {format(parseISO(req.startDate), 'MMM dd, yyyy')}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              to {format(parseISO(req.endDate), 'MMM dd, yyyy')}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-slate-700">
                            {daysCount} working day{daysCount > 1 ? 's' : ''}
                          </td>
                          <td className="py-3.5 px-4 max-w-xs text-slate-600 truncate" title={req.reason}>
                            "{req.reason}"
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                isApproved
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : isPending
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                  : 'bg-rose-100 text-rose-800 border border-rose-200'
                              }`}
                            >
                              {isApproved && <CheckCircle2 className="w-3 h-3" />}
                              {isPending && <Clock className="w-3 h-3" />}
                              {!isApproved && !isPending && <XCircle className="w-3 h-3" />}
                              {req.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {isPending ? (
                              <button
                                onClick={() => handleCancelLeave(req.id)}
                                className="text-rose-600 hover:text-rose-800 text-xs font-semibold px-2 py-1 rounded hover:bg-rose-50 transition"
                              >
                                Cancel Request
                              </button>
                            ) : (
                              <span className="text-slate-400 text-xs">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: SALARY LOANS & REPAYMENTS                               */}
      {/* ============================================================== */}
      {activeTab === 'loans' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-indigo-600" />
                  My Active Salary Loans & Payroll Deductions
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Institutional loans through SSS, Pag-IBIG Multi-Purpose Loan (MPL), or Company emergency advances.
                </p>
              </div>
              <div className="text-xs font-semibold px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100">
                Auto-Deducted Post-Tax
              </div>
            </div>

            {currentPayrollBreakdown.loanDetails && currentPayrollBreakdown.loanDetails.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentPayrollBreakdown.loanDetails.map((loan) => (
                  <div key={loan.loanId} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">{loan.loanName}</span>
                        <span className="text-[11px] text-slate-500 font-mono">Ref: {loan.referenceNo}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                        {loan.agency}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-200/80 flex justify-between items-center text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                          Monthly Deduction
                        </span>
                        <span className="font-bold text-slate-900 font-mono text-sm">
                          ₱{loan.monthlyAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                          Per Cut-off Share
                        </span>
                        <span className="font-semibold text-slate-700 font-mono">
                          ₱{(loan.monthlyAmount / 2).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-800">No Active Salary Loans</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  You currently have zero active SSS, Pag-IBIG, or Company salary loan deductions on your monthly payroll.
                </p>
              </div>
            )}

            {/* Quick SSS & Pag-IBIG Loan Portal Links */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap gap-4 text-xs">
              <a
                href="https://member.sss.gov.ph"
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1"
              >
                My.SSS Member Portal (File SSS Salary Loan) &rarr;
              </a>
              <a
                href="https://www.pagibigfundservices.com/virtualpagibig/"
                target="_blank"
                rel="noreferrer"
                className="text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center gap-1"
              >
                Virtual Pag-IBIG (File Multi-Purpose Loan / MPL) &rarr;
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 5: DOLE RIGHTS & COMPANY POLICIES                          */}
      {/* ============================================================== */}
      {activeTab === 'handbook' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-blue-600" />
                Your Mandatory Philippine Labor Rights (DOLE Reference)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Summary of key entitlements under the Labor Code of the Philippines and relevant Department Orders.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
                <h4 className="font-bold text-slate-900 text-sm">Service Incentive Leave (Art. 95)</h4>
                <p className="text-slate-600 leading-relaxed">
                  Every employee who has rendered at least 1 year of service is entitled to a yearly Service Incentive Leave (SIL) of 5 days with pay. Unused SIL days must be commuted into their money equivalent at year-end.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
                <h4 className="font-bold text-slate-900 text-sm">13th Month Pay (PD 851)</h4>
                <p className="text-slate-600 leading-relaxed">
                  Mandatory annual benefit equivalent to 1/12 of the total basic salary earned during the calendar year. Must be disbursed no later than December 24 of each year, tax-exempt up to ₱90,000 threshold.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
                <h4 className="font-bold text-slate-900 text-sm">Holiday Pay & Premium Rates</h4>
                <p className="text-slate-600 leading-relaxed">
                  Regular Holidays: 100% pay if unworked; 200% pay for the first 8 hours worked. Special Non-Working Days: "No work, no pay" unless company policy provides otherwise; 130% pay if worked.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
                <h4 className="font-bold text-slate-900 text-sm">Night Shift Differential (Art. 86)</h4>
                <p className="text-slate-600 leading-relaxed">
                  Not less than 10% of the regular wage for each hour of work performed between 10:00 PM and 6:00 AM.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between text-xs text-blue-900">
              <div className="flex items-center gap-3">
                <Info className="w-5 h-5 text-blue-600 shrink-0" />
                <div>
                  <span className="font-bold">Need labor assistance or dispute clarification?</span>
                  <div className="text-blue-700">DOLE Hotline: 1349 (24/7 National Labor Contact Center)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 1: APPLY FOR LEAVE MODAL                                 */}
      {/* ============================================================== */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-base">File Leave Application</h3>
              </div>
              <button
                onClick={() => setShowLeaveModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFileLeaveSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Leave Type
                </label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value as LeaveRequest['type'])}
                  className="w-full text-xs font-semibold p-2.5 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  <option value="SIL">Service Incentive Leave (SIL - {employeeLeaveBalances.sil} days left)</option>
                  <option value="Vacation">Vacation Leave (VL - {employeeLeaveBalances.vacation} days left)</option>
                  <option value="Sick">Sick Leave (SL - {employeeLeaveBalances.sick} days left)</option>
                  <option value="Paternity">Paternity Leave (RA 8187 - 7 days)</option>
                  <option value="Maternity">Maternity Leave (RA 11210 - 105 days)</option>
                  <option value="Magna Carta">Magna Carta for Women (RA 9710 - up to 2 mos)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={leaveStartDate}
                    onChange={(e) => setLeaveStartDate(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={leaveEndDate}
                    onChange={(e) => setLeaveEndDate(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Duration Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Full', 'Half-AM', 'Half-PM'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setLeaveDurationType(type)}
                      className={`py-2 text-xs font-semibold rounded-lg border transition ${
                        leaveDurationType === type
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {type === 'Full' ? 'Full Day' : type === 'Half-AM' ? 'Half Day (AM)' : 'Half Day (PM)'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Computed Days Banner */}
              <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-100 text-xs flex justify-between items-center text-blue-900">
                <span className="font-medium">Total Deductible Days:</span>
                <span className="font-bold text-sm font-mono">{computedRequestedDays} working day(s)</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Reason / Handover Note
                </label>
                <textarea
                  rows={3}
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  placeholder="State the purpose of your leave and any colleague covering urgent tasks..."
                  className="w-full text-xs p-3 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  required
                />
              </div>

              {leaveType === 'Sick' && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    Note: If sick leave duration exceeds 2 days, a fit-to-work medical certificate must be presented to HR upon return to office.
                  </span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowLeaveModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: REQUEST PROFILE UPDATE                                */}
      {/* ============================================================== */}
      {showUpdateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base">Request Profile Information Update</h3>
              </div>
              <button
                onClick={() => setShowUpdateModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleProfileUpdateSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Update Category
                </label>
                <select
                  value={updateCategory}
                  onChange={(e) => setUpdateCategory(e.target.value as any)}
                  className="w-full text-xs font-semibold p-2.5 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  <option value="contact">Contact Number / Work Email</option>
                  <option value="address">Home / Residential Address</option>
                  <option value="emergency">Emergency Contact Person & Phone</option>
                  <option value="dependents">HMO / BIR Dependents & Civil Status</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Details of Requested Change
                </label>
                <textarea
                  rows={4}
                  value={updateDetails}
                  onChange={(e) => setUpdateDetails(e.target.value)}
                  placeholder="Provide your new address, phone number, or updated dependent details for HR records..."
                  className="w-full text-xs p-3 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  required
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600">
                Your request will be forwarded to HR Records for verification before updating the official DOLE registry.
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowUpdateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
                >
                  Send Update Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* PAYSLIP MODAL                                                  */}
      {/* ============================================================== */}
      {selectedPayslip && (
        <PayslipModal
          isOpen={isPayslipModalOpen}
          onClose={() => setIsPayslipModalOpen(false)}
          breakdown={selectedPayslip.breakdown}
          employeeName={`${currentEmployee.firstName} ${currentEmployee.lastName}`}
          role={currentEmployee.role}
          department={currentEmployee.department}
          tin={currentEmployee.tin}
          sssNumber={currentEmployee.sssNumber}
          philhealthNumber={currentEmployee.philhealthNumber}
          pagibigNumber={currentEmployee.pagibigNumber}
          payPeriod={selectedPayslip.periodLabel}
        />
      )}
    </div>
  );
}
