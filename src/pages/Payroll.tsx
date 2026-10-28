import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { mockEmployees } from '../data/mockData';
import { calculateContributions, ContributionBreakdown } from '../lib/ph-payroll';
import { 
  Download, RefreshCw, Send, Building2, CheckCircle2, 
  Calculator, Table, FileSpreadsheet, Eye, ShieldCheck, 
  HeartPulse, Home, Scale, DollarSign, ArrowUpRight, Search, Receipt, Landmark, Gift
} from 'lucide-react';

import { ContributionCalculator } from '../components/payroll/ContributionCalculator';
import { PayslipModal } from '../components/payroll/PayslipModal';
import { StatutoryTablesModal } from '../components/payroll/StatutoryTablesModal';
import { DoleReportingModule } from '../components/attendance/DoleReportingModule';
import { ThirteenthMonthPayEstimator } from '../components/payroll/ThirteenthMonthPayEstimator';

export function Payroll() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlTab = searchParams.get('tab') as 'calculator' | 'register' | 'remittance' | 'dole' | '13th-month' | null;
  const [activeTab, setActiveTab] = useState<'calculator' | 'register' | 'remittance' | 'dole' | '13th-month'>(
    urlTab && ['calculator', 'register', 'remittance', 'dole', '13th-month'].includes(urlTab) ? urlTab : 'calculator'
  );

  useEffect(() => {
    if (urlTab && ['calculator', 'register', 'remittance', 'dole', '13th-month'].includes(urlTab)) {
      setActiveTab(urlTab);
    }
  }, [urlTab]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [showDisburseModal, setShowDisburseModal] = useState(false);
  const [disbursementStep, setDisbursementStep] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Selected employee for inspector & payslip
  const [selectedCalcEmployeeId, setSelectedCalcEmployeeId] = useState<string>('');
  const [selectedPayslipEmp, setSelectedPayslipEmp] = useState<{
    breakdown: ContributionBreakdown;
    name: string;
    role: string;
    department: string;
    tin: string;
    sss: string;
    philhealth: string;
    pagibig: string;
  } | null>(null);

  const [showTablesModal, setShowTablesModal] = useState(false);

  const handleSimulate = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
    }, 600);
  };

  const handleDisbursement = () => {
    setDisbursementStep(1);
    setTimeout(() => {
      setDisbursementStep(2);
    }, 2000);
  };

  // Aggregated calculations for HR Government Remittances and Loans
  const payrollAggregates = mockEmployees.reduce((acc, emp) => {
    const res = calculateContributions(emp.basicSalary, { employeeId: emp.id });
    acc.gross += emp.basicSalary;
    acc.netPay += res.netPay;
    acc.sssEE += res.sss;
    acc.sssER += res.sssER;
    acc.phEE += res.philhealth;
    acc.phER += res.philhealthER;
    acc.hdmfEE += res.pagibig;
    acc.hdmfER += res.pagibigER;
    acc.tax += res.withholdingTax;
    acc.loansTotal += res.totalLoanDeductions;
    acc.sssLoansTotal += res.sssLoanDeduction;
    acc.pagibigLoansTotal += res.pagibigLoanDeduction;
    acc.companyLoansTotal += res.companyLoanDeduction;
    if (res.totalLoanDeductions > 0) acc.activeLoansCount += 1;
    acc.totalEmployerCost += res.costToEmployer;
    return acc;
  }, {
    gross: 0,
    netPay: 0,
    sssEE: 0,
    sssER: 0,
    phEE: 0,
    phER: 0,
    hdmfEE: 0,
    hdmfER: 0,
    tax: 0,
    loansTotal: 0,
    sssLoansTotal: 0,
    pagibigLoansTotal: 0,
    companyLoansTotal: 0,
    activeLoansCount: 0,
    totalEmployerCost: 0,
  });

  const handleInspectInCalculator = (employeeId: string) => {
    setSelectedCalcEmployeeId(employeeId);
    setActiveTab('calculator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenPayslip = (emp: typeof mockEmployees[0]) => {
    const breakdown = calculateContributions(emp.basicSalary, { employeeId: emp.id });
    setSelectedPayslipEmp({
      breakdown,
      name: `${emp.firstName} ${emp.lastName}`,
      role: emp.role,
      department: emp.department,
      tin: emp.tin,
      sss: emp.sssNumber,
      philhealth: emp.philhealthNumber,
      pagibig: emp.pagibigNumber,
    });
  };


  const filteredEmployees = mockEmployees.filter(emp => 
    `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header with Main Navigation Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Philippines Payroll & Statutory Hub</h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
              PH-2024.12
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Mandatory contributions (SSS, PhilHealth, Pag-IBIG), BIR withholding taxes, and batch payroll register.
          </p>
        </div>

        {/* Global Toolbar buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/loans"
            className="flex items-center text-xs font-semibold px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors shadow-xs"
          >
            <Landmark className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
            Salary Loans ({payrollAggregates.activeLoansCount})
          </Link>
          <Link
            to="/tax-calculator"
            className="flex items-center text-xs font-semibold px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors shadow-xs"
          >
            <Receipt className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
            BIR 2316 Calculator
          </Link>
          <button 
            onClick={() => setActiveTab('13th-month')}
            className={`flex items-center text-xs font-semibold px-3.5 py-2 rounded-lg border transition-colors shadow-xs ${
              activeTab === '13th-month'
                ? 'bg-amber-600 text-white border-amber-600'
                : 'bg-amber-50 border-amber-200 text-amber-900 hover:bg-amber-100'
            }`}
          >
            <Gift className={`w-3.5 h-3.5 mr-1.5 ${activeTab === '13th-month' ? 'text-white' : 'text-amber-600'}`} />
            13th Month Pay (PD 851)
          </button>
          <button 
            onClick={() => setActiveTab('dole')}
            className={`flex items-center text-xs font-semibold px-3.5 py-2 rounded-lg border transition-colors shadow-xs ${
              activeTab === 'dole'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-blue-500" />
            DOLE Logs (CSV)
          </button>
          <button 
            onClick={() => setShowTablesModal(true)}
            className="flex items-center text-xs font-semibold text-slate-700 bg-white border border-slate-200 px-3.5 py-2 rounded-lg hover:bg-slate-50 shadow-xs"
          >
            <Scale className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
            Statutory Tables
          </button>
          <button 
            onClick={handleSimulate}
            className="flex items-center text-xs font-semibold text-slate-700 bg-white border border-slate-200 px-3.5 py-2 rounded-lg hover:bg-slate-50 shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isSimulating ? 'animate-spin text-blue-500' : ''}`} />
            Recalculate
          </button>
          <button 
            onClick={() => { setShowDisburseModal(true); setDisbursementStep(0); }}
            className="flex items-center text-xs font-semibold text-white bg-blue-600 px-3.5 py-2 rounded-lg hover:bg-blue-700 shadow-xs"
          >
            <Send className="w-3.5 h-3.5 mr-1.5" />
            Disburse ({mockEmployees.length})
          </button>
        </div>
      </div>

      {/* Aggregated Government Remittance & Salary Loans Summary Banner for HR */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Gross Payroll</span>
          <span className="text-base font-bold text-slate-900 font-mono mt-0.5 block">
            ₱{payrollAggregates.gross.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </span>
          <span className="text-[10px] text-slate-500">{mockEmployees.length} Active Staff</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> SSS Remittance
          </span>
          <span className="text-base font-bold text-blue-700 font-mono mt-0.5 block">
            ₱{(payrollAggregates.sssEE + payrollAggregates.sssER).toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </span>
          <span className="text-[10px] text-slate-400">EE: ₱{payrollAggregates.sssEE.toFixed(0)} | ER: ₱{payrollAggregates.sssER.toFixed(0)}</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1">
            <HeartPulse className="w-3 h-3" /> PhilHealth (5%)
          </span>
          <span className="text-base font-bold text-emerald-700 font-mono mt-0.5 block">
            ₱{(payrollAggregates.phEE + payrollAggregates.phER).toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </span>
          <span className="text-[10px] text-slate-400">50/50 Split (₱{payrollAggregates.phEE.toFixed(0)} each)</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1">
            <Home className="w-3 h-3" /> Pag-IBIG (HDMF)
          </span>
          <span className="text-base font-bold text-amber-700 font-mono mt-0.5 block">
            ₱{(payrollAggregates.hdmfEE + payrollAggregates.hdmfER).toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </span>
          <span className="text-[10px] text-slate-400">Max ₱400 per employee</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 flex items-center gap-1">
            <Scale className="w-3 h-3" /> BIR Withholding
          </span>
          <span className="text-base font-bold text-purple-700 font-mono mt-0.5 block">
            ₱{payrollAggregates.tax.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </span>
          <span className="text-[10px] text-slate-400">TRAIN Law Monthly</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-rose-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1">
            <Landmark className="w-3 h-3" /> Salary Loans
          </span>
          <span className="text-base font-bold text-rose-700 font-mono mt-0.5 block">
            ₱{payrollAggregates.loansTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </span>
          <span className="text-[10px] text-slate-400">{payrollAggregates.activeLoansCount} active borrowers</span>
        </div>

        <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">Total Net Disbursed</span>
          <span className="text-base font-black text-emerald-700 font-mono mt-0.5 block">
            ₱{payrollAggregates.netPay.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </span>
          <span className="text-[10px] text-emerald-600">UnionBank Ready</span>
        </div>
      </div>


      {/* Tabs Switcher */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-4 pt-2 gap-2 shadow-xs">
        <button
          onClick={() => setActiveTab('calculator')}
          className={`py-3 px-4 font-bold text-sm border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'calculator'
              ? 'border-blue-600 text-blue-600 bg-blue-50/40 rounded-t-lg'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Calculator className="w-4 h-4 text-blue-600" />
          Mandatory Contributions Calculator
        </button>

        <button
          onClick={() => setActiveTab('register')}
          className={`py-3 px-4 font-bold text-sm border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'register'
              ? 'border-blue-600 text-blue-600 bg-blue-50/40 rounded-t-lg'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Table className="w-4 h-4 text-slate-600" />
          Payroll Processing Register ({mockEmployees.length})
        </button>

        <button
          onClick={() => setActiveTab('remittance')}
          className={`py-3 px-4 font-bold text-sm border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'remittance'
              ? 'border-blue-600 text-blue-600 bg-blue-50/40 rounded-t-lg'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 text-slate-600" />
          Monthly Gov Remittance Breakdown (SSS R-3 / PhilHealth / HDMF)
        </button>

        <button
          onClick={() => setActiveTab('dole')}
          className={`py-3 px-4 font-bold text-sm border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'dole'
              ? 'border-blue-600 text-blue-600 bg-blue-50/40 rounded-t-lg'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          DOLE Mandated Time Logs & CSV
        </button>

        <button
          onClick={() => setActiveTab('13th-month')}
          className={`py-3 px-4 font-bold text-sm border-b-2 flex items-center gap-2 transition-all ${
            activeTab === '13th-month'
              ? 'border-amber-600 text-amber-700 bg-amber-50/60 rounded-t-lg'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Gift className="w-4 h-4 text-amber-500" />
          13th Month Pay Estimator (DOLE PD 851)
        </button>
      </div>

      {/* Tab 1: Contribution Calculator Utility */}
      {activeTab === 'calculator' && (
        <ContributionCalculator
          initialEmployeeId={selectedCalcEmployeeId}
          initialSalary={
            selectedCalcEmployeeId
              ? mockEmployees.find(e => e.id === selectedCalcEmployeeId)?.basicSalary || 50000
              : 50000
          }
        />
      )}

      {/* Tab 2: Payroll Processing Register */}
      {activeTab === 'register' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-slate-800 uppercase text-xs tracking-wider">Active Employees Payroll Register</h2>
                <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-mono">
                  {filteredEmployees.length} Records
                </span>
              </div>
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search employee, role, or dept..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="p-3 bg-blue-50/60 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-blue-900 gap-2">
              <span className="flex items-center gap-1.5">
                <Landmark className="w-4 h-4 text-blue-600 shrink-0" />
                <span><strong>Automated Salary Loans Deduction:</strong> Active SSS, Pag-IBIG, and Company loan amortizations are automatically deducted from net take-home pay.</span>
              </span>
              <Link to="/loans" className="font-bold text-blue-700 hover:text-blue-900 hover:underline flex items-center gap-1 shrink-0">
                Manage Salary Loans Module &rarr;
              </Link>
            </div>

            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3.5">Employee</th>
                    <th className="px-5 py-3.5 text-right">Basic / Gross</th>
                    <th className="px-5 py-3.5 text-right text-blue-700">SSS (EE)</th>
                    <th className="px-5 py-3.5 text-right text-emerald-700">PhilHealth (EE)</th>
                    <th className="px-5 py-3.5 text-right text-amber-700">Pag-IBIG (EE)</th>
                    <th className="px-5 py-3.5 text-right text-purple-700">BIR Tax W/H</th>
                    <th className="px-5 py-3.5 text-right text-rose-700">Salary Loans</th>
                    <th className="px-5 py-3.5 text-right text-slate-900 font-bold">Net Pay</th>
                    <th className="px-5 py-3.5 text-right text-slate-500 font-medium">ER Cost (CTC)</th>
                    <th className="px-5 py-3.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-slate-100">
                  {filteredEmployees.map(emp => {
                    const payroll = calculateContributions(emp.basicSalary, { employeeId: emp.id });
                    return (
                      <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="font-semibold text-slate-900">{emp.firstName} {emp.lastName}</div>
                          <div className="text-xs text-slate-500">{emp.role} • <span className="text-slate-400">{emp.department}</span></div>
                        </td>
                        <td className="px-5 py-3.5 text-right whitespace-nowrap font-mono font-medium text-slate-800">
                          ₱{emp.basicSalary.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits:2})}
                        </td>
                        <td className="px-5 py-3.5 text-right text-blue-700 font-mono text-xs">
                          ₱{payroll.sss.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits:2})}
                        </td>
                        <td className="px-5 py-3.5 text-right text-emerald-700 font-mono text-xs">
                          ₱{payroll.philhealth.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits:2})}
                        </td>
                        <td className="px-5 py-3.5 text-right text-amber-700 font-mono text-xs">
                          ₱{payroll.pagibig.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits:2})}
                        </td>
                        <td className="px-5 py-3.5 text-right text-purple-700 font-mono text-xs">
                          ₱{payroll.withholdingTax.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits:2})}
                        </td>
                        <td className="px-5 py-3.5 text-right whitespace-nowrap font-mono text-xs">
                          {payroll.totalLoanDeductions > 0 ? (
                            <div>
                              <span className="font-bold text-rose-700">
                                -₱{payroll.totalLoanDeductions.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                              </span>
                              <div className="text-[10px] text-slate-400 font-sans">
                                {payroll.loanDetails && payroll.loanDetails.length > 0
                                  ? payroll.loanDetails.map(d => d.agency).join(' + ')
                                  : 'Active Loan'}
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-300 font-mono">₱0.00</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-right text-slate-900 font-bold font-mono">
                          ₱{payroll.netPay.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits:2})}
                        </td>
                        <td className="px-5 py-3.5 text-right text-slate-500 font-mono text-xs">
                          ₱{payroll.costToEmployer.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits:2})}
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <div className="inline-flex items-center gap-1.5">
                            <button 
                              onClick={() => handleInspectInCalculator(emp.id)}
                              title="Inspect in Calculator Utility"
                              className="text-blue-600 hover:text-blue-800 text-xs font-semibold px-2 py-1 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors flex items-center gap-1"
                            >
                              <Calculator className="w-3.5 h-3.5" />
                              Inspect
                            </button>
                            <button 
                              onClick={() => handleOpenPayslip(emp)}
                              title="View & Print Official Payslip"
                              className="text-slate-700 hover:text-slate-900 text-xs font-semibold px-2 py-1 bg-white hover:bg-slate-100 rounded border border-slate-200 transition-colors flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-500" />
                              Payslip
                            </button>
                            {payroll.totalLoanDeductions > 0 && (
                              <Link
                                to="/loans"
                                title="Manage Employee Salary Loans"
                                className="text-rose-600 hover:text-rose-800 text-xs font-semibold px-2 py-1 bg-rose-50 hover:bg-rose-100 rounded border border-rose-200 transition-colors flex items-center gap-1"
                              >
                                <Landmark className="w-3.5 h-3.5" />
                                Loans
                              </Link>
                            )}
                          </div>
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

      {/* Tab 3: Monthly Gov Remittance Breakdown (For HR Filing) */}
      {activeTab === 'remittance' && (
        <div className="space-y-5">
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Government Mandatory Remittance Summary for HR Filing</h3>
                <p className="text-xs text-slate-500">
                  Total company monthly liabilities ready for SSS Form R-5/R-3, PhilHealth EPRS, Pag-IBIG MCR, and BIR Form 1601-C.
                </p>
              </div>
              <button
                onClick={() => window.print()}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Export Remittance Schedule
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* SSS Remittance Form R-3 Breakdown */}
              <div className="border border-blue-200 rounded-xl p-4 bg-blue-50/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-blue-600" />
                    <span className="font-bold text-sm text-slate-900">SSS Form R-3 / R-5</span>
                  </div>
                  <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded">14% + EC</span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Employee Share (EE):</span>
                    <span className="font-mono font-bold">₱{payrollAggregates.sssEE.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Employer Share (ER + EC):</span>
                    <span className="font-mono font-bold">₱{payrollAggregates.sssER.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  </div>
                  <div className="pt-2 border-t border-blue-200 flex justify-between text-sm font-bold text-blue-900">
                    <span>Total SSS Remittance:</span>
                    <span className="font-mono">₱{(payrollAggregates.sssEE + payrollAggregates.sssER).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  </div>
                </div>
              </div>

              {/* PhilHealth EPRS Breakdown */}
              <div className="border border-emerald-200 rounded-xl p-4 bg-emerald-50/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HeartPulse className="w-5 h-5 text-emerald-600" />
                    <span className="font-bold text-sm text-slate-900">PhilHealth EPRS</span>
                  </div>
                  <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">5.0% Rate</span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Employee Share (EE 2.5%):</span>
                    <span className="font-mono font-bold">₱{payrollAggregates.phEE.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Employer Share (ER 2.5%):</span>
                    <span className="font-mono font-bold">₱{payrollAggregates.phER.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  </div>
                  <div className="pt-2 border-t border-emerald-200 flex justify-between text-sm font-bold text-emerald-900">
                    <span>Total PhilHealth Remittance:</span>
                    <span className="font-mono">₱{(payrollAggregates.phEE + payrollAggregates.phER).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  </div>
                </div>
              </div>

              {/* Pag-IBIG MCR Breakdown */}
              <div className="border border-amber-200 rounded-xl p-4 bg-amber-50/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Home className="w-5 h-5 text-amber-600" />
                    <span className="font-bold text-sm text-slate-900">Pag-IBIG / HDMF MCR</span>
                  </div>
                  <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">Circ. 460</span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Employee Share (EE):</span>
                    <span className="font-mono font-bold">₱{payrollAggregates.hdmfEE.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Employer Share (ER):</span>
                    <span className="font-mono font-bold">₱{payrollAggregates.hdmfER.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  </div>
                  <div className="pt-2 border-t border-amber-200 flex justify-between text-sm font-bold text-amber-900">
                    <span>Total HDMF Remittance:</span>
                    <span className="font-mono">₱{(payrollAggregates.hdmfEE + payrollAggregates.hdmfER).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* BIR Form 1601-C & Total Employer Burden */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 border border-purple-200 rounded-xl bg-purple-50/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-purple-900 flex items-center gap-2">
                    <Scale className="w-4 h-4 text-purple-600" />
                    BIR Form 1601-C (Monthly Remittance Return)
                  </span>
                  <span className="font-mono font-bold text-purple-900 text-sm">
                    ₱{payrollAggregates.tax.toLocaleString(undefined, {minimumFractionDigits: 2})}
                  </span>
                </div>
                <p className="text-xs text-purple-800">
                  Total withholding tax deducted on compensation under RA 10963 to be filed and remitted on or before the 10th of next month.
                </p>
              </div>

              <div className="p-4 border border-blue-200 rounded-xl bg-blue-50/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-blue-900 flex items-center gap-2">
                    <Landmark className="w-4 h-4 text-blue-600" />
                    SSS & HDMF Loan Remittance (ML-2 / MCR)
                  </span>
                  <span className="font-mono font-bold text-blue-900 text-sm">
                    ₱{(payrollAggregates.sssLoansTotal + payrollAggregates.pagibigLoansTotal).toLocaleString(undefined, {minimumFractionDigits: 2})}
                  </span>
                </div>
                <p className="text-xs text-blue-800">
                  Monthly employee loan amortizations collected for SSS ML-2 and Pag-IBIG short-term loan billing schedules.
                </p>
              </div>
            </div>

            <div className="p-4 border border-slate-200 rounded-xl bg-slate-900 text-white">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-slate-200">
                  Total Company Payroll Burden (Cost to Company)
                </span>
                <span className="font-mono font-bold text-blue-300 text-base">
                  ₱{payrollAggregates.totalEmployerCost.toLocaleString(undefined, {minimumFractionDigits: 2})}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Includes Gross Basic Pay + Total Employer Statutory Contributions (SSS ER + PhilHealth ER + Pag-IBIG ER).
              </p>
            </div>

          </div>
        </div>
      )}

      {/* Tab 4: DOLE Mandated Time Logs & CSV Template */}
      {activeTab === 'dole' && (
        <DoleReportingModule />
      )}

      {/* Tab 5: 13th Month Pay Estimator (DOLE PD 851) */}
      {activeTab === '13th-month' && (
        <ThirteenthMonthPayEstimator employees={mockEmployees} />
      )}

      {/* UnionBank Disbursement Modal */}
      {showDisburseModal && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-orange-100 flex items-center justify-center text-orange-600 flex-shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">UnionBank API Integration</h3>
                  <p className="text-xs text-slate-500">Direct deposit to {mockEmployees.length} employees</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {disbursementStep === 0 && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <span className="text-sm font-medium text-slate-500">Source Account</span>
                    <span className="text-sm font-bold text-slate-900">Corporate Checking ****1234</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <span className="text-sm font-medium text-slate-500">Total Net Pay</span>
                    <span className="text-lg font-bold text-slate-900 font-mono">
                      ₱{payrollAggregates.netPay.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits:2})}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <span className="text-sm font-medium text-slate-500">InstaPay/PESONet Fees</span>
                    <span className="text-sm font-bold text-slate-900">₱0.00 <span className="text-xs text-slate-400 font-normal">(Waived)</span></span>
                  </div>
                </div>
              )}

              {disbursementStep === 1 && (
                <div className="py-8 flex flex-col items-center justify-center text-center">
                  <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mb-4" />
                  <p className="text-sm font-bold text-slate-900">Communicating with Bank API...</p>
                  <p className="text-xs text-slate-500 mt-1">Authenticating and pushing individual transfers.</p>
                </div>
              )}

              {disbursementStep === 2 && (
                <div className="py-8 flex flex-col items-center justify-center text-center">
                  <CheckCircle2 className="w-10 h-10 text-green-500 mb-4" />
                  <p className="text-sm font-bold text-slate-900">Disbursement Successful!</p>
                  <p className="text-xs text-slate-500 mt-1">Funds have been pushed to employee accounts.</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3 justify-end">
              {disbursementStep === 0 && (
                <>
                  <button onClick={() => setShowDisburseModal(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900">Cancel</button>
                  <button onClick={handleDisbursement} className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded hover:bg-blue-700">Confirm Transfer</button>
                </>
              )}
              {disbursementStep === 2 && (
                <button onClick={() => setShowDisburseModal(false)} className="px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded hover:bg-slate-800">Close Window</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Global Modals */}
      <StatutoryTablesModal
        isOpen={showTablesModal}
        onClose={() => setShowTablesModal(false)}
      />

      {selectedPayslipEmp && (
        <PayslipModal
          isOpen={!!selectedPayslipEmp}
          onClose={() => setSelectedPayslipEmp(null)}
          breakdown={selectedPayslipEmp.breakdown}
          employeeName={selectedPayslipEmp.name}
          role={selectedPayslipEmp.role}
          department={selectedPayslipEmp.department}
          tin={selectedPayslipEmp.tin}
          sssNumber={selectedPayslipEmp.sss}
          philhealthNumber={selectedPayslipEmp.philhealth}
          pagibigNumber={selectedPayslipEmp.pagibig}
        />
      )}
    </div>
  );
}
