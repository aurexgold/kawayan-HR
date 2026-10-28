import { useRef } from 'react';
import { X, Printer, Download, Building, CheckCircle2, ShieldCheck, HeartPulse, Home, Scale } from 'lucide-react';
import { ContributionBreakdown } from '../../lib/ph-payroll';

interface PayslipModalProps {
  isOpen: boolean;
  onClose: () => void;
  breakdown: ContributionBreakdown;
  employeeName?: string;
  role?: string;
  department?: string;
  tin?: string;
  sssNumber?: string;
  philhealthNumber?: string;
  pagibigNumber?: string;
  payPeriod?: string;
}

export function PayslipModal({
  isOpen,
  onClose,
  breakdown,
  employeeName = 'Juan Dela Cruz',
  role = 'Software Engineer',
  department = 'Engineering',
  tin = '123-456-789-000',
  sssNumber = '04-1234567-8',
  philhealthNumber = '12-345678901-2',
  pagibigNumber = '1234-5678-9012',
  payPeriod = 'October 1 - October 31, 2026',
}: PayslipModalProps) {
  const payslipRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full flex flex-col overflow-hidden border border-slate-200 print:border-none print:shadow-none animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Toolbar (hidden in print) */}
        <div className="p-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold">Philippine Payslip & Contribution Breakdown</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Payslip Body */}
        <div ref={payslipRef} className="p-6 sm:p-8 space-y-6 text-slate-900 bg-white">
          {/* Header */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-sm">
                  K
                </div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900">KAWAYAN HR PHILIPPINES INC.</h1>
              </div>
              <p className="text-xs text-slate-500">Unit 1402, High Street South Corporate Plaza, BGC, Taguig City, Philippines</p>
              <p className="text-[11px] text-slate-400 font-mono">BIR TIN: 009-881-224-00000 | PEZA Reg. 2021-089</p>
            </div>
            <div className="text-right">
              <span className="inline-block px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold rounded">
                OFFICIAL PAYSLIP
              </span>
              <p className="text-xs text-slate-500 mt-1">Period: <span className="font-semibold text-slate-800">{payPeriod}</span></p>
            </div>
          </div>

          {/* Employee & Statutory IDs Meta */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Employee</span>
              <span className="font-bold text-slate-800 text-sm">{employeeName}</span>
              <span className="text-slate-500 block text-[11px]">{role}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Department</span>
              <span className="font-semibold text-slate-700">{department}</span>
              <span className="text-slate-400 block text-[11px]">Status: Regular</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">BIR TIN</span>
              <span className="font-mono text-slate-700">{tin}</span>
              <span className="text-slate-400 block text-[10px] uppercase font-bold mt-1">SSS No.</span>
              <span className="font-mono text-slate-700">{sssNumber}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">PhilHealth No.</span>
              <span className="font-mono text-slate-700">{philhealthNumber}</span>
              <span className="text-slate-400 block text-[10px] uppercase font-bold mt-1">Pag-IBIG No.</span>
              <span className="font-mono text-slate-700">{pagibigNumber}</span>
            </div>
          </div>

          {/* Dual Columns: Earnings vs Deductions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Left: Earnings */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1 flex justify-between">
                <span>Earnings & Additions</span>
                <span>Amount (₱)</span>
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-700">Monthly Basic Salary</span>
                  <span className="font-mono font-semibold">₱{breakdown.basicSalary.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                </div>
                {breakdown.allowancesTaxable > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Taxable Allowances</span>
                    <span className="font-mono">₱{breakdown.allowancesTaxable.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  </div>
                )}
                {breakdown.allowancesNonTaxable > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Non-Taxable Allowances (De Minimis)</span>
                    <span className="font-mono">₱{breakdown.allowancesNonTaxable.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  </div>
                )}
                {breakdown.overtimePay > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Overtime & Holiday Pay</span>
                    <span className="font-mono">₱{breakdown.overtimePay.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  </div>
                )}
                {breakdown.absencesTardiness > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>Less: Tardiness / Undertime</span>
                    <span className="font-mono">-₱{breakdown.absencesTardiness.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  </div>
                )}
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between text-xs font-bold bg-slate-50 p-2 rounded">
                <span>Total Gross Compensation</span>
                <span className="font-mono text-blue-700">₱{breakdown.grossPay.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
              </div>
            </div>

            {/* Right: Deductions */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1 flex justify-between">
                <span>Statutory & Tax Deductions</span>
                <span>Amount (₱)</span>
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1 text-slate-700">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    SSS Contribution (EE)
                  </span>
                  <span className="font-mono font-semibold">₱{breakdown.sss.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1 text-slate-700">
                    <HeartPulse className="w-3.5 h-3.5 text-emerald-600" />
                    PhilHealth Premium (EE 2.5%)
                  </span>
                  <span className="font-mono font-semibold">₱{breakdown.philhealth.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1 text-slate-700">
                    <Home className="w-3.5 h-3.5 text-amber-600" />
                    Pag-IBIG Fund (EE Max ₱200)
                  </span>
                  <span className="font-mono font-semibold">₱{breakdown.pagibig.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                </div>
                {breakdown.pagibigMp2 > 0 && (
                  <div className="flex justify-between text-slate-600 pl-4">
                    <span>Pag-IBIG MP2 Voluntary</span>
                    <span className="font-mono">₱{breakdown.pagibigMp2.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-1 border-t border-dashed border-slate-200">
                  <span className="flex items-center gap-1 text-slate-700">
                    <Scale className="w-3.5 h-3.5 text-purple-600" />
                    BIR Withholding Tax
                  </span>
                  <span className="font-mono font-semibold text-rose-600">₱{breakdown.withholdingTax.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                </div>

                {/* Salary Loans Deductions */}
                {breakdown.totalLoanDeductions > 0 && (
                  <div className="pt-2 border-t border-dashed border-slate-200 space-y-1">
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Salary Loan Amortizations
                    </div>
                    {breakdown.loanDetails && breakdown.loanDetails.length > 0 ? (
                      breakdown.loanDetails.map(loan => (
                        <div key={loan.loanId} className="flex justify-between items-center text-slate-700">
                          <span className="flex items-center gap-1.5 truncate max-w-[210px]" title={loan.loanName}>
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                            <span className="truncate">{loan.loanName}</span>
                          </span>
                          <span className="font-mono font-semibold text-rose-600">
                            -₱{loan.monthlyAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}
                          </span>
                        </div>
                      ))
                    ) : (
                      <>
                        {breakdown.sssLoanDeduction > 0 && (
                          <div className="flex justify-between text-slate-700">
                            <span>SSS Salary/Calamity Loan</span>
                            <span className="font-mono font-semibold text-rose-600">-₱{breakdown.sssLoanDeduction.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                          </div>
                        )}
                        {breakdown.pagibigLoanDeduction > 0 && (
                          <div className="flex justify-between text-slate-700">
                            <span>Pag-IBIG MPL Loan</span>
                            <span className="font-mono font-semibold text-rose-600">-₱{breakdown.pagibigLoanDeduction.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                          </div>
                        )}
                        {breakdown.companyLoanDeduction > 0 && (
                          <div className="flex justify-between text-slate-700">
                            <span>Company Loan Advance</span>
                            <span className="font-mono font-semibold text-rose-600">-₱{breakdown.companyLoanDeduction.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {breakdown.otherDeductions > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Other Authorized Deductions</span>
                    <span className="font-mono">₱{breakdown.otherDeductions.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  </div>
                )}
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between text-xs font-bold bg-rose-50/70 p-2 rounded text-rose-900">
                <span>Total Deductions</span>
                <span className="font-mono">-₱{breakdown.totalDeductions.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
              </div>

            </div>
          </div>

          {/* Net Take-Home Highlight */}
          <div className="p-4 bg-emerald-50 border-2 border-emerald-500 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-2">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Net Take-Home Pay (Monthly)</span>
              <p className="text-xs text-emerald-600">Credited to employee payroll account</p>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-700 font-mono">
              ₱{breakdown.netPay.toLocaleString(undefined, {minimumFractionDigits: 2})}
            </div>
          </div>

          {/* Employer Statutory Contributions Notice (For Transparency / HR Records) */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1.5">
            <div className="font-bold text-slate-700 flex items-center justify-between">
              <span>Employer Statutory Share (Company Burden / Non-Deductible from Employee):</span>
              <span className="font-mono text-slate-900 font-bold">₱{breakdown.mandatoryContributionsER.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-slate-500 text-[11px]">
              <div>SSS ER (Reg + WISP + EC): ₱{breakdown.sssER.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
              <div>PhilHealth ER (2.5%): ₱{breakdown.philhealthER.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
              <div>Pag-IBIG ER: ₱{breakdown.pagibigER.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
            </div>
          </div>

          {/* Signature lines */}
          <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-200 text-xs text-slate-500">
            <div className="text-center space-y-8">
              <div className="border-b border-slate-300 w-3/4 mx-auto" />
              <span>Prepared By: HR & Payroll Department</span>
            </div>
            <div className="text-center space-y-8">
              <div className="border-b border-slate-300 w-3/4 mx-auto" />
              <span>Employee Acknowledgment</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
