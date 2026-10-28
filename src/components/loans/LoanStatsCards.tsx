import { EmployeeLoan } from '../../types';
import { getLoanTypeInfo } from '../../lib/loans';
import { Landmark, TrendingUp, ShieldCheck, Home, Building2, CheckCircle2 } from 'lucide-react';

interface LoanStatsCardsProps {
  loans: EmployeeLoan[];
}

export function LoanStatsCards({ loans }: LoanStatsCardsProps) {
  const activeLoans = loans.filter(l => l.status === 'Active');
  const paidLoans = loans.filter(l => l.status === 'Paid');

  const totalActivePrincipal = activeLoans.reduce((sum, l) => sum + l.principalAmount, 0);
  const totalActivePayable = activeLoans.reduce((sum, l) => sum + l.totalLoanAmount, 0);
  const totalPaidAmount = loans.reduce((sum, l) => sum + l.totalPaid, 0);
  const totalRemainingBalance = activeLoans.reduce((sum, l) => sum + l.remainingBalance, 0);
  const totalMonthlyAmortization = activeLoans.reduce((sum, l) => sum + l.monthlyAmortization, 0);

  // Breakdown by provider
  const sssLoans = activeLoans.filter(l => getLoanTypeInfo(l.loanType).agency === 'SSS');
  const sssMonthly = sssLoans.reduce((sum, l) => sum + l.monthlyAmortization, 0);

  const pagibigLoans = activeLoans.filter(l => getLoanTypeInfo(l.loanType).agency === 'Pag-IBIG');
  const pagibigMonthly = pagibigLoans.reduce((sum, l) => sum + l.monthlyAmortization, 0);

  const companyLoans = activeLoans.filter(l => getLoanTypeInfo(l.loanType).agency === 'Company');
  const companyMonthly = companyLoans.reduce((sum, l) => sum + l.monthlyAmortization, 0);

  // Overall collection percentage
  const totalPortfolioValue = loans.reduce((sum, l) => sum + l.totalLoanAmount, 0);
  const repaymentPercentage = totalPortfolioValue > 0 ? (totalPaidAmount / totalPortfolioValue) * 100 : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Active Portfolio */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Active Loan Portfolio
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Landmark className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 font-mono">
              ₱{totalRemainingBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
            <span className="text-xs text-slate-400">bal.</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>{activeLoans.length} active loans</span>
            <span className="font-mono text-slate-400">Orig: ₱{totalActivePayable.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          </div>
        </div>

        {/* Card 2: Total Monthly Payroll Deductions */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600">
              Monthly Payroll Deductions
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-700 font-mono">
              ₱{totalMonthlyAmortization.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
            <span className="text-xs text-rose-500">/ mo</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>Semi-Monthly Cutoff:</span>
            <span className="font-mono font-semibold text-slate-700">
              ₱{(totalMonthlyAmortization / 2).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>

        {/* Card 3: Agency Breakdown */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
            Agency Monthly Amortizations
          </span>
          <div className="mt-2 space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-600">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                SSS ({sssLoans.length})
              </span>
              <span className="font-mono font-bold text-blue-700">
                ₱{sssMonthly.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-600">
                <Home className="w-3.5 h-3.5 text-amber-600" />
                Pag-IBIG ({pagibigLoans.length})
              </span>
              <span className="font-mono font-bold text-amber-700">
                ₱{pagibigMonthly.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-600">
                <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                Company ({companyLoans.length})
              </span>
              <span className="font-mono font-bold text-emerald-700">
                ₱{companyMonthly.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Repayment Progress */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Repayment Collection
              </span>
              <span className="text-xs font-bold font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {repaymentPercentage.toFixed(1)}% Collected
              </span>
            </div>
            <div className="mt-2 w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div 
                className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, repaymentPercentage)}%` }}
              />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>Collected: <strong className="font-mono text-slate-800">₱{totalPaidAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong></span>
            <span>{paidLoans.length} Paid Off</span>
          </div>
        </div>
      </div>
    </div>
  );
}
