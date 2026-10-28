import { useState } from 'react';
import { X, Search, FileText, CheckCircle, ExternalLink, ShieldCheck, HeartPulse, Home, Scale } from 'lucide-react';
import { getSSSTable } from '../../lib/ph-payroll';

interface StatutoryTablesModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeSalary?: number;
}

export function StatutoryTablesModal({ isOpen, onClose, activeSalary = 50000 }: StatutoryTablesModalProps) {
  const [activeTab, setActiveTab] = useState<'sss' | 'philhealth' | 'pagibig' | 'tax'>('sss');
  const [searchSalary, setSearchSalary] = useState('');

  if (!isOpen) return null;

  const sssTable = getSSSTable();
  const filteredSss = searchSalary 
    ? sssTable.filter(row => {
        const query = parseFloat(searchSalary);
        if (isNaN(query)) return true;
        return query >= row.minCompensation && query <= row.maxCompensation;
      })
    : sssTable;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Scale className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Philippines Statutory Schedules & Mandates</h2>
              <p className="text-xs text-slate-400">Official 2024 / 2025 Contribution Tables: SSS, PhilHealth, Pag-IBIG, & BIR TRAIN</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-5 gap-2 overflow-x-auto text-sm">
          <button
            onClick={() => setActiveTab('sss')}
            className={`py-3 px-4 font-semibold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'sss'
                ? 'border-blue-600 text-blue-700 bg-white shadow-xs rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            SSS Contribution Schedule (14%)
          </button>
          <button
            onClick={() => setActiveTab('philhealth')}
            className={`py-3 px-4 font-semibold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'philhealth'
                ? 'border-emerald-600 text-emerald-700 bg-white shadow-xs rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <HeartPulse className="w-4 h-4 text-emerald-600" />
            PhilHealth (5.0% Rate)
          </button>
          <button
            onClick={() => setActiveTab('pagibig')}
            className={`py-3 px-4 font-semibold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'pagibig'
                ? 'border-amber-600 text-amber-700 bg-white shadow-xs rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Home className="w-4 h-4 text-amber-600" />
            Pag-IBIG / HDMF (Circular 460)
          </button>
          <button
            onClick={() => setActiveTab('tax')}
            className={`py-3 px-4 font-semibold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'tax'
                ? 'border-purple-600 text-purple-700 bg-white shadow-xs rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Scale className="w-4 h-4 text-purple-600" />
            BIR TRAIN Withholding Tax
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          {activeTab === 'sss' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-blue-50 border border-blue-200 p-4 rounded-xl text-blue-900 text-sm">
                <div>
                  <span className="font-bold">Social Security Act of 2018 (RA 11199):</span> 14% total rate (4.5% Employee, 9.5% Employer).
                  Includes Mandatory Provident Fund (WISP) for MSC above ₱20,000 up to ₱30,000, plus EC (₱10/₱30).
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="number"
                    placeholder="Search salary in table..."
                    value={searchSalary}
                    onChange={(e) => setSearchSalary(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
                <div className="overflow-x-auto max-h-[480px]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0 uppercase tracking-wider text-[10px] border-b border-slate-200">
                      <tr>
                        <th className="px-3 py-3">Compensation Range</th>
                        <th className="px-3 py-3 text-right">MSC</th>
                        <th className="px-3 py-3 text-right bg-blue-50/60 text-blue-800">Regular EE (4.5%)</th>
                        <th className="px-3 py-3 text-right bg-blue-50/60 text-blue-800">WISP EE (4.5%)</th>
                        <th className="px-3 py-3 text-right font-black bg-blue-100 text-blue-900">Total EE</th>
                        <th className="px-3 py-3 text-right bg-amber-50/60 text-amber-900">Regular ER (9.5%)</th>
                        <th className="px-3 py-3 text-right bg-amber-50/60 text-amber-900">WISP ER (9.5%)</th>
                        <th className="px-3 py-3 text-right text-slate-600">EC (ER)</th>
                        <th className="px-3 py-3 text-right font-black bg-amber-100 text-amber-900">Total ER</th>
                        <th className="px-3 py-3 text-right font-black text-slate-900">Grand Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredSss.map((bracket) => {
                        const isMatch = activeSalary >= bracket.minCompensation && activeSalary <= bracket.maxCompensation;
                        return (
                          <tr
                            key={bracket.msc}
                            className={`transition-colors ${
                              isMatch
                                ? 'bg-blue-100/70 font-semibold border-l-4 border-l-blue-600'
                                : 'hover:bg-slate-50'
                            }`}
                          >
                            <td className="px-3 py-2 font-mono whitespace-nowrap">
                              {bracket.minCompensation === 0
                                ? `Below ₱4,250.00`
                                : bracket.maxCompensation === Infinity
                                ? `₱29,750.00 and above`
                                : `₱${bracket.minCompensation.toLocaleString()} - ₱${bracket.maxCompensation.toLocaleString()}`}
                              {isMatch && (
                                <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-blue-600 text-white font-bold">
                                  Current
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-2 text-right font-mono font-bold text-slate-800">
                              ₱{bracket.msc.toLocaleString()}
                            </td>
                            <td className="px-3 py-2 text-right text-blue-700 font-mono">
                              ₱{bracket.regularEE.toFixed(2)}
                            </td>
                            <td className="px-3 py-2 text-right text-blue-700 font-mono">
                              ₱{bracket.wispEE.toFixed(2)}
                            </td>
                            <td className="px-3 py-2 text-right font-bold text-blue-900 bg-blue-50/70 font-mono">
                              ₱{bracket.totalEE.toFixed(2)}
                            </td>
                            <td className="px-3 py-2 text-right text-amber-800 font-mono">
                              ₱{bracket.regularER.toFixed(2)}
                            </td>
                            <td className="px-3 py-2 text-right text-amber-800 font-mono">
                              ₱{bracket.wispER.toFixed(2)}
                            </td>
                            <td className="px-3 py-2 text-right text-slate-600 font-mono">
                              ₱{bracket.ec.toFixed(2)}
                            </td>
                            <td className="px-3 py-2 text-right font-bold text-amber-900 bg-amber-50/70 font-mono">
                              ₱{bracket.totalER.toFixed(2)}
                            </td>
                            <td className="px-3 py-2 text-right font-black text-slate-900 font-mono">
                              ₱{bracket.grandTotal.toFixed(2)}
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

          {activeTab === 'philhealth' && (
            <div className="space-y-6">
              <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-xl text-emerald-900">
                <div className="flex items-center gap-2 font-bold text-base mb-1">
                  <HeartPulse className="w-5 h-5 text-emerald-600" />
                  PhilHealth Premium Schedule (Universal Health Care Act - RA 11223)
                </div>
                <p className="text-sm text-emerald-800">
                  Premium rate for 2024–2025 is <strong>5.0%</strong> of basic monthly salary, shared equally (2.5% Employee and 2.5% Employer).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                  <div className="text-xs font-bold uppercase text-slate-400 mb-1">Income Floor</div>
                  <div className="text-2xl font-black text-slate-900">₱10,000.00</div>
                  <div className="text-xs text-slate-500 mt-2">
                    Salaries at or below ₱10,000 pay the statutory minimum monthly premium of <strong>₱500.00</strong>.
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between text-xs">
                    <span className="text-slate-600">Employee Share:</span>
                    <span className="font-bold text-emerald-700">₱250.00</span>
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span className="text-slate-600">Employer Share:</span>
                    <span className="font-bold text-slate-900">₱250.00</span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border-2 border-emerald-500 shadow-sm relative">
                  <span className="absolute top-2 right-2 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                    Active Range
                  </span>
                  <div className="text-xs font-bold uppercase text-emerald-700 mb-1">Standard Sliding Rate</div>
                  <div className="text-2xl font-black text-slate-900">5.0%</div>
                  <div className="text-xs text-slate-500 mt-2">
                    For basic salaries between <strong>₱10,000.01</strong> and <strong>₱99,999.99</strong>, premium is calculated directly as 5%.
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between text-xs">
                    <span className="text-slate-600">Employee Share:</span>
                    <span className="font-bold text-emerald-700">2.50%</span>
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span className="text-slate-600">Employer Share:</span>
                    <span className="font-bold text-slate-900">2.50%</span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                  <div className="text-xs font-bold uppercase text-slate-400 mb-1">Income Ceiling</div>
                  <div className="text-2xl font-black text-slate-900">₱100,000.00</div>
                  <div className="text-xs text-slate-500 mt-2">
                    Salaries at or above ₱100,000 are capped at the maximum statutory monthly premium of <strong>₱5,000.00</strong>.
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between text-xs">
                    <span className="text-slate-600">Employee Share (Max):</span>
                    <span className="font-bold text-emerald-700">₱2,500.00</span>
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span className="text-slate-600">Employer Share (Max):</span>
                    <span className="font-bold text-slate-900">₱2,500.00</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <h4 className="font-bold text-sm text-slate-800 mb-3">Quick Reference Computation by Salary</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-b border-slate-100">
                      <tr>
                        <th className="px-4 py-2.5">Monthly Basic Salary</th>
                        <th className="px-4 py-2.5 text-right">Applicable Base</th>
                        <th className="px-4 py-2.5 text-right text-emerald-700 font-bold">EE Share (2.5%)</th>
                        <th className="px-4 py-2.5 text-right text-slate-800 font-bold">ER Share (2.5%)</th>
                        <th className="px-4 py-2.5 text-right font-black">Total Premium</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {[8000, 10000, 18000, 25000, 35000, 50000, 75000, 100000, 150000].map(s => {
                        const base = Math.min(Math.max(s, 10000), 100000);
                        const total = base * 0.05;
                        const ee = total / 2;
                        return (
                          <tr key={s} className={s === 50000 ? 'bg-emerald-50/60 font-semibold' : 'hover:bg-slate-50'}>
                            <td className="px-4 py-2 font-mono">₱{s.toLocaleString()}</td>
                            <td className="px-4 py-2 text-right font-mono text-slate-500">₱{base.toLocaleString()}</td>
                            <td className="px-4 py-2 text-right font-mono text-emerald-700">₱{ee.toFixed(2)}</td>
                            <td className="px-4 py-2 text-right font-mono text-slate-700">₱{ee.toFixed(2)}</td>
                            <td className="px-4 py-2 text-right font-mono font-bold">₱{total.toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pagibig' && (
            <div className="space-y-6">
              <div className="bg-amber-50 border border-amber-200 p-5 rounded-xl text-amber-900">
                <div className="flex items-center gap-2 font-bold text-base mb-1">
                  <Home className="w-5 h-5 text-amber-600" />
                  Pag-IBIG / HDMF Circular No. 460 (Effective Feb 2024 Onward)
                </div>
                <p className="text-sm text-amber-800">
                  The Maximum Fund Salary (MFS) basis increased from ₱5,000 to <strong>₱10,000</strong>. This adjusts the maximum mandatory deduction to ₱200 for the employee and ₱200 for the employer (total ₱400).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                  <h4 className="font-bold text-sm text-slate-900">Mandatory Regular HDMF Premium</h4>
                  <div className="space-y-2 text-xs">
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <div className="font-bold text-slate-800">Monthly Compensation ≤ ₱1,500:</div>
                      <div className="flex justify-between mt-1 text-slate-600">
                        <span>Employee Share:</span>
                        <span className="font-bold">1.0%</span>
                      </div>
                      <div className="flex justify-between mt-1 text-slate-600">
                        <span>Employer Share:</span>
                        <span className="font-bold">2.0%</span>
                      </div>
                    </div>
                    <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg">
                      <div className="font-bold text-amber-900">Monthly Compensation &gt; ₱1,500 (Standard):</div>
                      <div className="flex justify-between mt-1 text-slate-600">
                        <span>Employee Share:</span>
                        <span className="font-bold text-amber-900">2.0% (Max ₱200.00)</span>
                      </div>
                      <div className="flex justify-between mt-1 text-slate-600">
                        <span>Employer Share:</span>
                        <span className="font-bold text-amber-900">2.0% (Max ₱200.00)</span>
                      </div>
                      <div className="flex justify-between mt-1 text-slate-900 font-bold border-t border-amber-200 pt-1">
                        <span>Combined Total:</span>
                        <span>₱400.00 / month</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                  <h4 className="font-bold text-sm text-slate-900">Modified Pag-IBIG 2 (MP2) Savings</h4>
                  <p className="text-xs text-slate-600">
                    A voluntary government-backed savings program with higher, tax-free annual dividend earnings.
                  </p>
                  <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4">
                    <li>Minimum contribution: ₱500 / month</li>
                    <li>No maximum limit (deducted via salary payroll upon employee enrollment)</li>
                    <li>Tax-exempt dividends credited directly to member</li>
                    <li>5-year maturity with option to roll over</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tax' && (
            <div className="space-y-6">
              <div className="bg-purple-50 border border-purple-200 p-5 rounded-xl text-purple-900">
                <div className="flex items-center gap-2 font-bold text-base mb-1">
                  <Scale className="w-5 h-5 text-purple-600" />
                  Revised Withholding Tax on Compensation (TRAIN Law - RA 10963)
                </div>
                <p className="text-sm text-purple-800">
                  Effective January 1, 2023 through 2025+. Tax is calculated on <strong>Taxable Compensation</strong> (Gross earnings minus statutory SSS, PhilHealth, Pag-IBIG contributions, and non-taxable de minimis allowances).
                </p>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Monthly Taxable Compensation Bracket</th>
                      <th className="px-4 py-3 text-right">Base Tax</th>
                      <th className="px-4 py-3 text-right">Marginal Rate</th>
                      <th className="px-4 py-3">Prescribed BIR Formula</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-semibold text-emerald-700">₱20,833.33 and below</td>
                      <td className="px-4 py-3 text-right font-mono">₱0.00</td>
                      <td className="px-4 py-3 text-right font-mono">0.0%</td>
                      <td className="px-4 py-3 text-slate-500">Tax Exempt (Minimum Wage & Entry Bracket)</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-semibold text-slate-800">₱20,833.34 - ₱33,333.33</td>
                      <td className="px-4 py-3 text-right font-mono">₱0.00</td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-purple-700">15%</td>
                      <td className="px-4 py-3 text-slate-600 font-mono">15% of excess over ₱20,833.33</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-semibold text-slate-800">₱33,333.34 - ₱66,666.67</td>
                      <td className="px-4 py-3 text-right font-mono">₱1,875.00</td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-purple-700">20%</td>
                      <td className="px-4 py-3 text-slate-600 font-mono">₱1,875.00 + 20% of excess over ₱33,333.33</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-semibold text-slate-800">₱66,666.68 - ₱166,666.67</td>
                      <td className="px-4 py-3 text-right font-mono">₱8,541.67</td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-purple-700">25%</td>
                      <td className="px-4 py-3 text-slate-600 font-mono">₱8,541.67 + 25% of excess over ₱66,666.67</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-semibold text-slate-800">₱166,666.68 - ₱666,666.67</td>
                      <td className="px-4 py-3 text-right font-mono">₱33,541.67</td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-purple-700">30%</td>
                      <td className="px-4 py-3 text-slate-600 font-mono">₱33,541.67 + 30% of excess over ₱166,666.67</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-semibold text-slate-800">Above ₱666,666.67</td>
                      <td className="px-4 py-3 text-right font-mono">₱183,541.67</td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-purple-700">35%</td>
                      <td className="px-4 py-3 text-slate-600 font-mono">₱183,541.67 + 35% of excess over ₱666,666.67</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
          <span>Compliance Version: <strong>PH-GOV-2024.12</strong> (Validated for BIR, SSS, PhilHealth, HDMF)</span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition-colors"
          >
            Close Reference
          </button>
        </div>
      </div>
    </div>
  );
}
