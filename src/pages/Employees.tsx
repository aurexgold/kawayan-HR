import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockEmployees } from '../data/mockData';
import { FileDown, Plus, X, Calendar, User, Briefcase, FileText, Calculator, Landmark } from 'lucide-react';
import { Employee } from '../types';
import { calculateEmployeeMonthlyLoanDeductions } from '../lib/loans';


export function Employees() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const filteredEmployees = mockEmployees.filter(emp => 
    `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Employee Directory</h1>
          <p className="text-sm text-slate-500 mt-1">Manage personnel records and basic information.</p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded hover:bg-slate-50">
            <FileDown className="w-4 h-4 mr-2" />
            Export BIR 2316 Data
          </button>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Employee
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <input
            type="text"
            placeholder="Search by name or department..."
            className="w-full max-w-sm px-3 py-2 text-sm border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase border-b border-slate-100">
              <tr>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3 hidden md:table-cell">Department</th>
                <th className="px-6 py-3 hidden lg:table-cell">Government IDs</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredEmployees.map(emp => (
                <tr key={emp.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{emp.firstName} {emp.lastName}</div>
                    <div className="text-xs text-slate-500">{emp.email}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{emp.role}</td>
                  <td className="px-6 py-4 hidden md:table-cell text-slate-500">{emp.department}</td>
                  <td className="px-6 py-4 hidden lg:table-cell text-xs text-slate-500 space-y-1">
                    <div><span className="font-medium text-slate-400 mr-2">TIN</span>{emp.tin}</div>
                    <div><span className="font-medium text-slate-400 mr-2">SSS</span>{emp.sssNumber}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                      emp.status === 'Active' ? 'bg-green-100 text-green-700' :
                      emp.status === 'On Leave' ? 'bg-amber-100 text-amber-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setSelectedEmployee(emp)}
                      className="text-blue-600 font-semibold text-xs hover:underline"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500 text-sm">
                    No employees found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedEmployee && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl font-bold">
                  {selectedEmployee.firstName[0]}{selectedEmployee.lastName[0]}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">{selectedEmployee.firstName} {selectedEmployee.lastName}</h2>
                  <p className="text-sm text-slate-500">{selectedEmployee.email}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedEmployee(null)}
                className="text-slate-400 hover:text-slate-600 p-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-8">
              {/* Employee Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-slate-700 uppercase text-xs tracking-wider mb-4 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-slate-400" /> Professional Details
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between border-b border-slate-50 pb-2">
                      <span className="text-sm text-slate-500">Role</span>
                      <span className="text-sm font-medium text-slate-900">{selectedEmployee.role}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-50 pb-2">
                      <span className="text-sm text-slate-500">Department</span>
                      <span className="text-sm font-medium text-slate-900">{selectedEmployee.department}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-50 pb-2">
                      <span className="text-sm text-slate-500">Status</span>
                      <span className="text-sm font-medium text-slate-900">{selectedEmployee.status}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-50 pb-2">
                      <span className="text-sm text-slate-500">Join Date</span>
                      <span className="text-sm font-medium text-slate-900">{selectedEmployee.joinDate}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-slate-700 uppercase text-xs tracking-wider mb-4 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-400" /> Government IDs
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between border-b border-slate-50 pb-2">
                      <span className="text-sm text-slate-500">TIN</span>
                      <span className="text-sm font-medium text-slate-900">{selectedEmployee.tin}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-50 pb-2">
                      <span className="text-sm text-slate-500">SSS Provider</span>
                      <span className="text-sm font-medium text-slate-900">{selectedEmployee.sssNumber}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-50 pb-2">
                      <span className="text-sm text-slate-500">PhilHealth</span>
                      <span className="text-sm font-medium text-slate-900">{selectedEmployee.philhealthNumber}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-50 pb-2">
                      <span className="text-sm text-slate-500">Pag-IBIG</span>
                      <span className="text-sm font-medium text-slate-900">{selectedEmployee.pagibigNumber}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Leave Balances */}
              <div>
                <h3 className="font-bold text-slate-700 uppercase text-xs tracking-wider mb-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" /> Leave Balances
                </h3>
                {selectedEmployee.leaveBalances ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex flex-col items-center justify-center text-center">
                      <span className="text-2xl font-bold text-blue-600 mb-1">{selectedEmployee.leaveBalances.sil}</span>
                      <span className="text-[11px] font-bold text-slate-500 uppercase">Service Incentive</span>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex flex-col items-center justify-center text-center">
                      <span className="text-2xl font-bold text-emerald-600 mb-1">{selectedEmployee.leaveBalances.sick}</span>
                      <span className="text-[11px] font-bold text-slate-500 uppercase">Sick Leave</span>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex flex-col items-center justify-center text-center">
                      <span className="text-2xl font-bold text-amber-600 mb-1">{selectedEmployee.leaveBalances.vacation}</span>
                      <span className="text-[11px] font-bold text-slate-500 uppercase">Vacation Leave</span>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex flex-col items-center justify-center text-center">
                      <span className="text-2xl font-bold text-purple-600 mb-1">{selectedEmployee.leaveBalances.parental}</span>
                      <span className="text-[11px] font-bold text-slate-500 uppercase">Parental</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-slate-500 italic p-4 bg-slate-50 rounded-lg">
                    Leave balances have not been tracked yet for this employee.
                  </div>
                )}
              </div>
              {/* Active Salary Loans & Amortizations */}
              {(() => {
                const loanData = calculateEmployeeMonthlyLoanDeductions(selectedEmployee.id);
                return (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-slate-700 uppercase text-xs tracking-wider flex items-center gap-2">
                        <Landmark className="w-4 h-4 text-blue-600" /> Active Salary Loans ({loanData.activeLoansCount})
                      </h3>
                      <button
                        onClick={() => navigate('/loans')}
                        className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                      >
                        Manage Loans &rarr;
                      </button>
                    </div>

                    {loanData.activeLoansCount > 0 ? (
                      <div className="space-y-2">
                        {loanData.items.map(loan => (
                          <div key={loan.loanId} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  loan.agency === 'SSS' ? 'bg-blue-100 text-blue-800' :
                                  loan.agency === 'Pag-IBIG' ? 'bg-amber-100 text-amber-800' :
                                  'bg-emerald-100 text-emerald-800'
                                }`}>
                                  {loan.agency}
                                </span>
                                <span className="font-bold text-slate-800">{loan.loanName}</span>
                              </div>
                              <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">Ref: {loan.referenceNo}</span>
                            </div>
                            <div className="text-right">
                              <span className="font-mono font-bold text-rose-700 block">
                                -₱{loan.monthlyAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}/mo
                              </span>
                              <span className="text-[11px] text-slate-500 font-mono">
                                Bal: ₱{loan.remainingBalance.toLocaleString(undefined, {minimumFractionDigits: 2})}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-slate-500 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                        No active salary loans or pending amortizations recorded for this employee.
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
            
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    navigate('/payroll');
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Calculator className="w-3.5 h-3.5" />
                  Compute Mandatory Contributions
                </button>
                <button 
                  onClick={() => {
                    navigate('/loans');
                  }}
                  className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Landmark className="w-3.5 h-3.5 text-blue-600" />
                  View Salary Loans
                </button>
              </div>
              <button 
                onClick={() => setSelectedEmployee(null)}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
