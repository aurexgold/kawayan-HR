import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { EmployeeLoan } from '../types';
import { mockEmployees } from '../data/mockData';
import { 
  getStoredLoans, saveStoredLoans, generateLoanReconciliationCSV 
} from '../lib/loans';
import { LoanStatsCards } from '../components/loans/LoanStatsCards';
import { LoanListTable } from '../components/loans/LoanListTable';
import { NewLoanModal } from '../components/loans/NewLoanModal';
import { LoanScheduleDrawer } from '../components/loans/LoanScheduleDrawer';
import { 
  Plus, Download, Calculator, ShieldCheck, Home, 
  Building2, Landmark, ArrowRight, HelpCircle, FileCheck, CheckCircle2 
} from 'lucide-react';

export function Loans() {
  const [loans, setLoans] = useState<EmployeeLoan[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Modals state
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedLoanForSchedule, setSelectedLoanForSchedule] = useState<EmployeeLoan | null>(null);
  const [showScheduleDrawer, setShowScheduleDrawer] = useState(false);

  // Load from local storage
  useEffect(() => {
    const loaded = getStoredLoans();
    setLoans(loaded);
    setIsLoaded(true);

    const handleStorageUpdate = () => {
      setLoans(getStoredLoans());
    };
    window.addEventListener('kawayan_loans_updated', handleStorageUpdate);
    return () => window.removeEventListener('kawayan_loans_updated', handleStorageUpdate);
  }, []);

  const handleAddLoan = (newLoan: EmployeeLoan) => {
    const updated = [newLoan, ...loans];
    setLoans(updated);
    saveStoredLoans(updated);
  };

  const handleUpdateLoan = (updatedLoan: EmployeeLoan) => {
    const updated = loans.map(l => l.id === updatedLoan.id ? updatedLoan : l);
    setLoans(updated);
    saveStoredLoans(updated);
    if (selectedLoanForSchedule?.id === updatedLoan.id) {
      setSelectedLoanForSchedule(updatedLoan);
    }
  };

  const handleDeleteLoan = (loanId: string) => {
    const updated = loans.filter(l => l.id !== loanId);
    setLoans(updated);
    saveStoredLoans(updated);
  };

  const handleOpenSchedule = (loan: EmployeeLoan) => {
    setSelectedLoanForSchedule(loan);
    setShowScheduleDrawer(true);
  };

  const handleDownloadReconciliation = () => {
    const employeeLookup: Record<string, { name: string; sss: string; tin: string; hdmf: string }> = {};
    mockEmployees.forEach(emp => {
      employeeLookup[emp.id] = {
        name: `${emp.firstName} ${emp.lastName}`,
        sss: emp.sssNumber,
        tin: emp.tin,
        hdmf: emp.pagibigNumber,
      };
    });

    const csvContent = generateLoanReconciliationCSV(loans, employeeLookup);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Philippine_Salary_Loans_Reconciliation_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const selectedBorrower = selectedLoanForSchedule
    ? mockEmployees.find(e => e.id === selectedLoanForSchedule.employeeId)
    : null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header with Title and Global Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Landmark className="w-6 h-6 text-blue-600" />
              Employee Salary Loans & Amortization Tracker
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
              PH-LOANS-2024
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Track SSS Salary Loans, Pag-IBIG Multi-Purpose Loans (MPL), and Company Advances with automated payroll deductions.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/payroll?tab=register"
            className="flex items-center text-xs font-semibold px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors shadow-xs"
          >
            <Calculator className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
            View Payroll Register
            <ArrowRight className="w-3 h-3 ml-1 text-slate-400" />
          </Link>
          <button
            onClick={handleDownloadReconciliation}
            className="flex items-center text-xs font-semibold px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
            title="Export DOLE / SSS / Pag-IBIG Loan Reconciliation Schedule"
          >
            <Download className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
            Reconciliation CSV
          </button>
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center text-xs font-bold px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Enroll New Loan
          </button>
        </div>
      </div>

      {/* Philippine Loan Compliance Notice / Guide Banner */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50/40 to-slate-50 p-4 rounded-2xl border border-blue-100 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span className="font-bold text-xs uppercase tracking-wider text-blue-900">
              Philippine Labor & Statutory Payroll Rules
            </span>
          </div>
          <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
            Under DOLE Labor Advisory and SSS Circular 2023-010, salary loan amortizations are <strong>post-tax voluntary deductions</strong>. 
            Net compensation automatically reflects these monthly amortizations, preventing loan delinquency and keeping cooperative members in good standing.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 text-xs">
          <div className="px-3 py-1.5 bg-white/80 rounded-lg border border-blue-200/60 shadow-2xs">
            <span className="text-[10px] text-slate-400 block font-bold">SSS SALARY RATE</span>
            <span className="font-bold text-slate-800 font-mono">10.0% p.a. (24 mo)</span>
          </div>
          <div className="px-3 py-1.5 bg-white/80 rounded-lg border border-blue-200/60 shadow-2xs">
            <span className="text-[10px] text-slate-400 block font-bold">PAG-IBIG MPL RATE</span>
            <span className="font-bold text-slate-800 font-mono">10.5% p.a. (24/36 mo)</span>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      {isLoaded && <LoanStatsCards loans={loans} />}

      {/* Main Table */}
      {isLoaded && (
        <LoanListTable
          loans={loans}
          employees={mockEmployees}
          onOpenSchedule={handleOpenSchedule}
          onUpdateLoan={handleUpdateLoan}
          onDeleteLoan={handleDeleteLoan}
        />
      )}

      {/* New Loan Enrollment Modal */}
      <NewLoanModal
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
        employees={mockEmployees}
        onAddLoan={handleAddLoan}
      />

      {/* Repayment Schedule Drawer / Modal */}
      <LoanScheduleDrawer
        isOpen={showScheduleDrawer}
        onClose={() => setShowScheduleDrawer(false)}
        loan={selectedLoanForSchedule}
        employeeName={selectedBorrower ? `${selectedBorrower.firstName} ${selectedBorrower.lastName}` : undefined}
        department={selectedBorrower?.department}
        onUpdateLoan={handleUpdateLoan}
      />
    </div>
  );
}
