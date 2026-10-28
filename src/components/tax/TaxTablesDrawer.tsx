import React from 'react';
import { 
  ANNUAL_TAX_BRACKETS, 
  MONTHLY_TAX_BRACKETS, 
  SEMI_MONTHLY_TAX_BRACKETS, 
  DE_MINIMIS_LIMITS,
  EXEMPT_13TH_MONTH_CAP
} from '../../lib/bir-2316';
import { X, BookOpen, ShieldAlert, Sparkles, Table } from 'lucide-react';

interface TaxTablesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TaxTablesDrawer({ isOpen, onClose }: TaxTablesDrawerProps) {
  const [activeSubTab, setActiveSubTab] = React.useState<'annual' | 'monthly' | 'deminimis'>('annual');

  if (!isOpen) return null;

  const formatPHP = (val: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      maximumFractionDigits: 2,
    }).format(val || 0);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Philippine Statutory Tax Reference Hub</h2>
              <p className="text-xs text-slate-500">
                TRAIN Law (RA 10963) • BIR Revenue Regulations No. 11-2018 • Section 24(A)(2) NIRC
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="px-5 pt-3 border-b border-slate-200 flex gap-4">
          <button
            onClick={() => setActiveSubTab('annual')}
            className={`pb-3 text-xs font-semibold border-b-2 transition-colors ${
              activeSubTab === 'annual'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Annual Tax Table (2023–Present)
          </button>
          <button
            onClick={() => setActiveSubTab('monthly')}
            className={`pb-3 text-xs font-semibold border-b-2 transition-colors ${
              activeSubTab === 'monthly'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Monthly & Semi-Monthly Withholding Tables
          </button>
          <button
            onClick={() => setActiveSubTab('deminimis')}
            className={`pb-3 text-xs font-semibold border-b-2 transition-colors ${
              activeSubTab === 'deminimis'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            De Minimis & 13th Month Exempt Ceilings
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {activeSubTab === 'annual' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 p-3.5 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Effective Jan 1, 2023 onwards: </span>
                  Under the TRAIN Law schedule, tax rates for individual income tax payers in tiers 2 to 5 were reduced by 5% compared to the 2018–2022 transitional brackets. Annual taxable income up to ₱250,000 remains 100% tax-exempt.
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[11px] border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Tier</th>
                      <th className="py-3 px-4">Taxable Compensation Range (Annual)</th>
                      <th className="py-3 px-4">Basic Tax</th>
                      <th className="py-3 px-4">Marginal Tax Rate</th>
                      <th className="py-3 px-4">Prescribed Formula</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {ANNUAL_TAX_BRACKETS.map((b) => (
                      <tr key={b.tier} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-bold text-slate-900">Tier {b.tier}</td>
                        <td className="py-3 px-4 font-mono font-medium">
                          {formatPHP(b.min)} {b.max === Infinity ? 'and above' : `to ${formatPHP(b.max)}`}
                        </td>
                        <td className="py-3 px-4 font-mono">{formatPHP(b.baseTax)}</td>
                        <td className="py-3 px-4 font-bold text-blue-700">{(b.rate * 100).toFixed(0)}%</td>
                        <td className="py-3 px-4 text-slate-600">{b.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSubTab === 'monthly' && (
            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-2">Monthly Revised Withholding Tax Table</h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[11px] border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Tier</th>
                        <th className="py-2.5 px-3">Monthly Taxable Compensation</th>
                        <th className="py-2.5 px-3">Base Tax</th>
                        <th className="py-2.5 px-3">Excess Rate</th>
                        <th className="py-2.5 px-3">Withholding Calculation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {MONTHLY_TAX_BRACKETS.map((b) => (
                        <tr key={b.tier} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-bold text-slate-900">Tier {b.tier}</td>
                          <td className="py-2.5 px-3 font-mono font-medium">
                            {formatPHP(b.min)} {b.max === Infinity ? 'and above' : `to ${formatPHP(b.max)}`}
                          </td>
                          <td className="py-2.5 px-3 font-mono">{formatPHP(b.baseTax)}</td>
                          <td className="py-2.5 px-3 font-bold text-blue-700">{(b.rate * 100).toFixed(0)}%</td>
                          <td className="py-2.5 px-3 text-slate-600">{b.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-2">Semi-Monthly (Bimonthly Cutoff) Table</h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[11px] border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Tier</th>
                        <th className="py-2.5 px-3">Semi-Monthly Taxable Comp</th>
                        <th className="py-2.5 px-3">Base Tax</th>
                        <th className="py-2.5 px-3">Rate</th>
                        <th className="py-2.5 px-3">Prescribed Rule</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {SEMI_MONTHLY_TAX_BRACKETS.map((b) => (
                        <tr key={b.tier} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-bold text-slate-900">Tier {b.tier}</td>
                          <td className="py-2.5 px-3 font-mono font-medium">
                            {formatPHP(b.min)} {b.max === Infinity ? 'and above' : `to ${formatPHP(b.max)}`}
                          </td>
                          <td className="py-2.5 px-3 font-mono">{formatPHP(b.baseTax)}</td>
                          <td className="py-2.5 px-3 font-bold text-blue-700">{(b.rate * 100).toFixed(0)}%</td>
                          <td className="py-2.5 px-3 text-slate-600">{b.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'deminimis' && (
            <div className="space-y-5">
              <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl text-xs text-amber-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-700" />
                  Section 32(B)(7)(e) 13th Month Pay & Other Benefits Cap: ₱90,000.00
                </div>
                <p>
                  Any 13th month pay, Christmas bonus, mid-year bonus, and productivity incentive up to ₱90,000 per calendar year is strictly non-taxable. Any excess amount above ₱90,000 is automatically added to the employee's regular taxable compensation income (Item 48 of BIR Form 2316).
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-2">Statutory De Minimis Benefits Limits (RR 11-2018)</h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[11px] border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">De Minimis Item</th>
                        <th className="py-2.5 px-3">Monthly Ceiling</th>
                        <th className="py-2.5 px-3">Annual Ceiling</th>
                        <th className="py-2.5 px-3">Regulatory Basis & Note</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {DE_MINIMIS_LIMITS.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-semibold text-slate-900">{item.item}</td>
                          <td className="py-2.5 px-3 font-mono">{item.limitMonthly > 0 ? formatPHP(item.limitMonthly) : 'Per Shift'}</td>
                          <td className="py-2.5 px-3 font-mono font-bold text-emerald-700">
                            {item.limitAnnual > 0 ? formatPHP(item.limitAnnual) : 'As incurred'}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">{item.desc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            Close Reference Hub
          </button>
        </div>
      </div>
    </div>
  );
}
