import { useState } from 'react';
import { Employee, EmployeeLoan, LoanType, LoanStatus } from '../../types';
import { getLoanTypeInfo } from '../../lib/loans';
import { 
  Search, Filter, Calendar, ShieldCheck, Home, Building2, 
  CheckCircle2, Clock, Eye, PauseCircle, PlayCircle, Trash2, ChevronRight, FileSpreadsheet
} from 'lucide-react';

interface LoanListTableProps {
  loans: EmployeeLoan[];
  employees: Employee[];
  onOpenSchedule: (loan: EmployeeLoan) => void;
  onUpdateLoan: (updatedLoan: EmployeeLoan) => void;
  onDeleteLoan: (loanId: string) => void;
}

export function LoanListTable({
  loans,
  employees,
  onOpenSchedule,
  onUpdateLoan,
  onDeleteLoan,
}: LoanListTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | LoanStatus>('ALL');
  const [agencyFilter, setAgencyFilter] = useState<'ALL' | 'SSS' | 'Pag-IBIG' | 'Company'>('ALL');

  const employeeMap = employees.reduce<Record<string, Employee>>((acc, emp) => {
    acc[emp.id] = emp;
    return acc;
  }, {});

  const filteredLoans = loans.filter(loan => {
    const emp = employeeMap[loan.employeeId];
    const empName = emp ? `${emp.firstName} ${emp.lastName}`.toLowerCase() : '';
    const searchLower = searchTerm.toLowerCase();

    const matchesSearch = 
      empName.includes(searchLower) ||
      loan.referenceNo.toLowerCase().includes(searchLower) ||
      loan.loanName.toLowerCase().includes(searchLower) ||
      (emp?.department.toLowerCase().includes(searchLower) ?? false);

    const matchesStatus = statusFilter === 'ALL' || loan.status === statusFilter;

    const info = getLoanTypeInfo(loan.loanType);
    const matchesAgency = agencyFilter === 'ALL' || info.agency === agencyFilter;

    return matchesSearch && matchesStatus && matchesAgency;
  });

  const handleToggleStatus = (loan: EmployeeLoan) => {
    const newStatus: LoanStatus = loan.status === 'Active' ? 'Suspended' : 'Active';
    onUpdateLoan({
      ...loan,
      status: newStatus,
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden flex flex-col">
      {/* Controls Bar */}
      <div className="p-4 border-b border-slate-200 space-y-3 bg-slate-50/50">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'ALL' as const, label: 'All Loans', count: loans.length },
              { id: 'Active' as const, label: 'Active', count: loans.filter(l => l.status === 'Active').length },
              { id: 'Paid' as const, label: 'Fully Paid', count: loans.filter(l => l.status === 'Paid').length },
              { id: 'Suspended' as const, label: 'Suspended', count: loans.filter(l => l.status === 'Suspended').length },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  statusFilter === tab.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  statusFilter === tab.id ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search borrower or ref no..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
            />
          </div>
        </div>

        {/* Agency Filter Chips */}
        <div className="flex items-center gap-2 pt-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Agency:</span>
          {(['ALL', 'SSS', 'Pag-IBIG', 'Company'] as const).map(agency => (
            <button
              key={agency}
              onClick={() => setAgencyFilter(agency)}
              className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full transition-colors ${
                agencyFilter === agency
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-200/70 text-slate-600 hover:bg-slate-300'
              }`}
            >
              {agency === 'ALL' ? 'All Providers' : agency}
            </button>
          ))}
          <span className="ml-auto text-xs text-slate-400 font-mono">
            Showing {filteredLoans.length} of {loans.length}
          </span>
        </div>
      </div>

      {/* Loans Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase border-b border-slate-200">
            <tr>
              <th className="px-5 py-3.5">Borrower</th>
              <th className="px-5 py-3.5">Loan Type & Ref No</th>
              <th className="px-5 py-3.5 text-right">Principal</th>
              <th className="px-5 py-3.5 text-right text-rose-700">Monthly Amort.</th>
              <th className="px-5 py-3.5 text-center">Repayment Progress</th>
              <th className="px-5 py-3.5 text-right text-emerald-700">Remaining Balance</th>
              <th className="px-5 py-3.5 text-center">Status</th>
              <th className="px-5 py-3.5 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-slate-100">
            {filteredLoans.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-12 text-center text-slate-400 text-xs">
                  No employee loans found matching the selected filter criteria.
                </td>
              </tr>
            ) : (
              filteredLoans.map(loan => {
                const emp = employeeMap[loan.employeeId];
                const info = getLoanTypeInfo(loan.loanType);
                const paidCount = loan.schedule.filter(s => s.status === 'Deducted via Payroll' || s.status === 'Paid in Advance').length;
                const progressPercent = Math.min(100, (loan.totalPaid / loan.totalLoanAmount) * 100);

                return (
                  <tr key={loan.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Employee */}
                    <td className="px-5 py-3.5">
                      {emp ? (
                        <div>
                          <div className="font-semibold text-slate-900">{emp.firstName} {emp.lastName}</div>
                          <div className="text-xs text-slate-500">{emp.role} • <span className="text-slate-400">{emp.department}</span></div>
                        </div>
                      ) : (
                        <div className="text-slate-500 text-xs">{loan.employeeId}</div>
                      )}
                    </td>

                    {/* Loan Type & Ref */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${info.badgeColor}`}>
                          {info.agency}
                        </span>
                        <span className="font-semibold text-slate-800 text-xs">{loan.loanName}</span>
                      </div>
                      <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                        Ref: <span className="font-medium text-slate-700">{loan.referenceNo}</span>
                      </div>
                    </td>

                    {/* Principal */}
                    <td className="px-5 py-3.5 text-right whitespace-nowrap font-mono text-slate-800 text-xs">
                      <div className="font-bold">₱{loan.principalAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                      <div className="text-[10px] text-slate-400 font-sans">{loan.interestRateAnnual}% p.a. • {loan.termMonths} mo</div>
                    </td>

                    {/* Monthly Amortization */}
                    <td className="px-5 py-3.5 text-right whitespace-nowrap font-mono text-rose-700">
                      <div className="font-bold text-sm">₱{loan.monthlyAmortization.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                      <div className="text-[10px] text-slate-400 font-sans">
                        {loan.deductionFrequency === 'Semi-Monthly' ? `₱${loan.perCutoffAmortization.toLocaleString()}/cutoff` : 'Monthly'}
                      </div>
                    </td>

                    {/* Repayment Progress */}
                    <td className="px-5 py-3.5">
                      <div className="w-36 mx-auto space-y-1">
                        <div className="flex justify-between text-[10px] text-slate-500">
                          <span>{paidCount}/{loan.termMonths} Paid</span>
                          <span className="font-mono font-semibold">{progressPercent.toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className={`h-1.5 rounded-full ${loan.status === 'Paid' ? 'bg-blue-500' : 'bg-emerald-500'}`}
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Remaining Balance */}
                    <td className="px-5 py-3.5 text-right whitespace-nowrap font-mono">
                      <span className={`font-bold text-sm ${loan.remainingBalance > 0 ? 'text-emerald-700' : 'text-slate-400'}`}>
                        ₱{loan.remainingBalance.toLocaleString(undefined, {minimumFractionDigits: 2})}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="px-5 py-3.5 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                        loan.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : loan.status === 'Paid'
                          ? 'bg-blue-50 text-blue-800 border-blue-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}>
                        {loan.status === 'Active' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                        {loan.status === 'Paid' && <CheckCircle2 className="w-3 h-3 text-blue-600" />}
                        {loan.status === 'Suspended' && <Clock className="w-3 h-3 text-amber-600" />}
                        <span>{loan.status}</span>
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 text-center">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => onOpenSchedule(loan)}
                          className="px-2.5 py-1 text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
                          title="View Repayment Schedule"
                        >
                          <Eye className="w-3.5 h-3.5 text-blue-600" />
                          <span>Schedule</span>
                        </button>

                        <button
                          onClick={() => handleToggleStatus(loan)}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            loan.status === 'Active'
                              ? 'text-amber-600 border-slate-200 hover:bg-amber-50'
                              : 'text-emerald-600 border-slate-200 hover:bg-emerald-50'
                          }`}
                          title={loan.status === 'Active' ? 'Pause deductions' : 'Resume deductions'}
                        >
                          {loan.status === 'Active' ? (
                            <PauseCircle className="w-4 h-4" />
                          ) : (
                            <PlayCircle className="w-4 h-4" />
                          )}
                        </button>

                        <button
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to remove this loan record (${loan.referenceNo})?`)) {
                              onDeleteLoan(loan.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg border border-transparent hover:border-rose-100 hover:bg-rose-50 transition-colors"
                          title="Delete loan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
