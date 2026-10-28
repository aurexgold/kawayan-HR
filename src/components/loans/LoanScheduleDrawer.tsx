import { useState } from 'react';
import { EmployeeLoan, LoanRepaymentScheduleItem } from '../../types';
import { getLoanTypeInfo } from '../../lib/loans';
import { 
  X, Calendar, ShieldCheck, Home, Building2, CheckCircle2, 
  Clock, AlertCircle, Download, FileSpreadsheet, PauseCircle, PlayCircle, DollarSign
} from 'lucide-react';

interface LoanScheduleDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  loan: EmployeeLoan | null;
  employeeName?: string;
  department?: string;
  onUpdateLoan: (updatedLoan: EmployeeLoan) => void;
}

export function LoanScheduleDrawer({
  isOpen,
  onClose,
  loan,
  employeeName = 'Employee',
  department = 'General',
  onUpdateLoan,
}: LoanScheduleDrawerProps) {
  if (!isOpen || !loan) return null;

  const info = getLoanTypeInfo(loan.loanType);

  const handleToggleInstallmentStatus = (installmentNum: number) => {
    const updatedSchedule = loan.schedule.map(item => {
      if (item.installmentNumber === installmentNum) {
        const isPaid = item.status === 'Deducted via Payroll' || item.status === 'Paid in Advance';
        const newStatus: LoanRepaymentScheduleItem['status'] = isPaid ? 'Pending' : 'Deducted via Payroll';
        return {
          ...item,
          status: newStatus,
          deductedDate: !isPaid ? new Date().toISOString().split('T')[0] : undefined,
        };
      }
      return item;
    });

    const newTotalPaid = updatedSchedule
      .filter(item => item.status === 'Deducted via Payroll' || item.status === 'Paid in Advance')
      .reduce((sum, item) => sum + item.totalAmortization, 0);

    const newRemaining = Math.max(0, +(loan.totalLoanAmount - newTotalPaid).toFixed(2));
    const isNowPaidOff = newRemaining <= 0;

    const updatedLoan: EmployeeLoan = {
      ...loan,
      schedule: updatedSchedule,
      totalPaid: +newTotalPaid.toFixed(2),
      remainingBalance: newRemaining,
      status: isNowPaidOff ? 'Paid' : (loan.status === 'Paid' ? 'Active' : loan.status),
    };

    onUpdateLoan(updatedLoan);
  };

  const handleToggleSuspension = () => {
    const newStatus = loan.status === 'Suspended' ? 'Active' : 'Suspended';
    onUpdateLoan({
      ...loan,
      status: newStatus,
    });
  };

  const handleMarkAllPaid = () => {
    const today = new Date().toISOString().split('T')[0];
    const updatedSchedule = loan.schedule.map(item => ({
      ...item,
      status: 'Paid in Advance' as const,
      deductedDate: item.deductedDate || today,
    }));

    onUpdateLoan({
      ...loan,
      schedule: updatedSchedule,
      totalPaid: loan.totalLoanAmount,
      remainingBalance: 0,
      status: 'Paid',
    });
  };

  const handleExportScheduleCSV = () => {
    const headers = [
      'Installment No',
      'Period Label',
      'Due Date',
      'Principal Portion (PHP)',
      'Interest Portion (PHP)',
      'Total Amortization (PHP)',
      'Ending Balance (PHP)',
      'Status',
      'Deduction Date',
    ];

    const rows = loan.schedule.map(item => [
      item.installmentNumber,
      `"${item.periodLabel}"`,
      item.dueDate,
      item.principal.toFixed(2),
      item.interest.toFixed(2),
      item.totalAmortization.toFixed(2),
      item.remainingBalance.toFixed(2),
      item.status,
      item.deductedDate || '',
    ].join(','));

    const csvContent = [
      `"Employee: ${employeeName} | Department: ${department}"`,
      `"Loan: ${loan.loanName} | Ref No: ${loan.referenceNo}"`,
      `"Principal: PHP ${loan.principalAmount} | Total Payable: PHP ${loan.totalLoanAmount}"`,
      '',
      headers.join(','),
      ...rows,
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${loan.referenceNo}_repayment_schedule.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const paidCount = loan.schedule.filter(s => s.status === 'Deducted via Payroll' || s.status === 'Paid in Advance').length;
  const progressPercent = Math.min(100, (loan.totalPaid / loan.totalLoanAmount) * 100);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full flex flex-col max-h-[92vh] overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-xs">
              {info.agency === 'SSS' ? (
                <ShieldCheck className="w-5 h-5" />
              ) : info.agency === 'Pag-IBIG' ? (
                <Home className="w-5 h-5" />
              ) : (
                <Building2 className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base sm:text-lg text-white tracking-tight">{loan.loanName}</h2>
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${info.badgeColor}`}>
                  {info.agency}
                </span>
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  loan.status === 'Active' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                  loan.status === 'Paid' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                  'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {loan.status}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 font-mono">
                Promissory Note / Billing Ref: <span className="text-blue-300 font-semibold">{loan.referenceNo}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportScheduleCSV}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 border border-slate-700 transition-colors"
              title="Download Schedule CSV"
            >
              <Download className="w-4 h-4 text-slate-300" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Borrower & Loan Financial Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Borrower / Employee</span>
              <span className="font-bold text-slate-900 text-sm block">{employeeName}</span>
              <span className="text-slate-500 block text-[11px]">{department}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Principal & Interest</span>
              <span className="font-mono font-bold text-slate-900 text-sm block">₱{loan.principalAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
              <span className="text-slate-500 block text-[11px] font-mono">{loan.interestRateAnnual}% p.a. • Total ₱{loan.totalLoanAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Monthly Amortization</span>
              <span className="font-mono font-bold text-rose-700 text-sm block">
                ₱{loan.monthlyAmortization.toLocaleString(undefined, {minimumFractionDigits: 2})}
              </span>
              <span className="text-slate-500 block text-[11px] font-mono">
                {loan.deductionFrequency === 'Semi-Monthly' ? `₱${loan.perCutoffAmortization.toLocaleString()} / cutoff (15th & 30th)` : 'Monthly Cutoff'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Remaining Balance</span>
              <span className="font-mono font-black text-emerald-700 text-base block">
                ₱{loan.remainingBalance.toLocaleString(undefined, {minimumFractionDigits: 2})}
              </span>
              <span className="text-slate-500 block text-[11px]">
                {paidCount} of {loan.termMonths} payments completed
              </span>
            </div>
          </div>

          {/* Progress Bar & Quick Actions Toolbar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div className="space-y-1 w-full sm:w-1/2">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-slate-700">Amortization Repayment Progress</span>
                  <span className="font-mono font-semibold text-emerald-700">{progressPercent.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleToggleSuspension}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition-colors ${
                    loan.status === 'Suspended'
                      ? 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {loan.status === 'Suspended' ? (
                    <>
                      <PlayCircle className="w-3.5 h-3.5 text-emerald-600" />
                      Resume Payroll Deduction
                    </>
                  ) : (
                    <>
                      <PauseCircle className="w-3.5 h-3.5 text-amber-600" />
                      Suspend Deductions
                    </>
                  )}
                </button>

                {loan.status !== 'Paid' && (
                  <button
                    onClick={handleMarkAllPaid}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100 flex items-center gap-1.5 transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Record Full Early Settlement
                  </button>
                )}
              </div>
            </div>

            {loan.notes && (
              <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <strong className="text-slate-700">Loan Notes:</strong> {loan.notes}
              </p>
            )}
          </div>

          {/* Repayment Schedule Table */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                Amortization & Payroll Deduction Ledger ({loan.schedule.length} Installments)
              </h3>
              <span className="text-[11px] text-slate-500">
                Click status pill to toggle payment state
              </span>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase sticky top-0 z-10 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">#</th>
                      <th className="px-4 py-3">Period / Cutoff</th>
                      <th className="px-4 py-3">Due Date</th>
                      <th className="px-4 py-3 text-right">Principal</th>
                      <th className="px-4 py-3 text-right">Interest</th>
                      <th className="px-4 py-3 text-right">Total Amortization</th>
                      <th className="px-4 py-3 text-right">Balance</th>
                      <th className="px-4 py-3 text-center">Status / Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs divide-y divide-slate-100 font-mono">
                    {loan.schedule.map(item => {
                      const isPaid = item.status === 'Deducted via Payroll' || item.status === 'Paid in Advance';
                      return (
                        <tr 
                          key={item.installmentNumber}
                          className={`transition-colors hover:bg-slate-50 ${isPaid ? 'bg-emerald-50/20' : ''}`}
                        >
                          <td className="px-4 py-2.5 font-bold text-slate-700">
                            {item.installmentNumber}
                          </td>
                          <td className="px-4 py-2.5 font-sans font-medium text-slate-900">
                            {item.periodLabel}
                          </td>
                          <td className="px-4 py-2.5 text-slate-600">
                            {item.dueDate}
                          </td>
                          <td className="px-4 py-2.5 text-right text-slate-700">
                            ₱{item.principal.toLocaleString(undefined, {minimumFractionDigits: 2})}
                          </td>
                          <td className="px-4 py-2.5 text-right text-slate-500">
                            ₱{item.interest.toLocaleString(undefined, {minimumFractionDigits: 2})}
                          </td>
                          <td className="px-4 py-2.5 text-right font-bold text-rose-700">
                            ₱{item.totalAmortization.toLocaleString(undefined, {minimumFractionDigits: 2})}
                          </td>
                          <td className="px-4 py-2.5 text-right font-semibold text-slate-800">
                            ₱{item.remainingBalance.toLocaleString(undefined, {minimumFractionDigits: 2})}
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            <button
                              onClick={() => handleToggleInstallmentStatus(item.installmentNumber)}
                              className={`px-2.5 py-1 rounded-full text-[11px] font-sans font-bold inline-flex items-center gap-1 transition-all shadow-xs ${
                                item.status === 'Deducted via Payroll'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
                                  : item.status === 'Paid in Advance'
                                  ? 'bg-blue-100 text-blue-800 border border-blue-300 hover:bg-blue-200'
                                  : 'bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200'
                              }`}
                              title="Click to toggle payment state"
                            >
                              {isPaid ? (
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Clock className="w-3 h-3 text-slate-400" />
                              )}
                              <span>{item.status}</span>
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
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Philippine Statutory Compliance:</span>
            <span>SSS Circular 2023-010 • Pag-IBIG Circular 460 • DOLE Post-Tax Deduction Standards</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-colors"
          >
            Close Schedule
          </button>
        </div>
      </div>
    </div>
  );
}
