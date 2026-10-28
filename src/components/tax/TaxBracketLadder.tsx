import React from 'react';
import { ANNUAL_TAX_BRACKETS, TaxBracket } from '../../lib/bir-2316';
import { Check, Info, TrendingUp, Layers } from 'lucide-react';

interface TaxBracketLadderProps {
  taxableCompensation: number;
  appliedBracket: TaxBracket;
  marginalRate: number;
  effectiveRate: number;
  taxDue: number;
}

export function TaxBracketLadder({
  taxableCompensation,
  appliedBracket,
  marginalRate,
  effectiveRate,
  taxDue,
}: TaxBracketLadderProps) {
  const formatPHP = (val: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-sm">TRAIN Law Tax Bracket Ladder</h3>
            <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-medium">
              RA 10963 (2023–Present)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Annual progressive graduated income tax tiers based on Section 24(A)(2) NIRC.
          </p>
        </div>

        {/* Marginal vs Effective summary chips */}
        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-lg text-right">
            <span className="text-[10px] text-blue-700 block uppercase font-bold">Marginal Rate</span>
            <span className="text-xs font-black text-blue-900">{marginalRate}%</span>
          </div>
          <div className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-right">
            <span className="text-[10px] text-slate-500 block uppercase font-bold">Effective Rate</span>
            <span className="text-xs font-black text-slate-800">{effectiveRate}%</span>
          </div>
        </div>
      </div>

      {/* Ladder Tiers */}
      <div className="space-y-2">
        {ANNUAL_TAX_BRACKETS.map((bracket) => {
          const isCurrent = appliedBracket.tier === bracket.tier;
          const isBelow = taxableCompensation > bracket.max;

          return (
            <div
              key={bracket.tier}
              className={`p-3 rounded-lg border text-xs transition-all ${
                isCurrent
                  ? 'bg-blue-50/70 border-blue-400 ring-2 ring-blue-500/20 shadow-xs'
                  : isBelow
                  ? 'bg-slate-50/50 border-slate-200 text-slate-600'
                  : 'bg-white border-slate-200 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isCurrent
                        ? 'bg-blue-600 text-white'
                        : isBelow
                        ? 'bg-slate-300 text-slate-700'
                        : 'bg-slate-100 text-slate-400 border border-slate-200'
                    }`}
                  >
                    {isCurrent ? <Check className="w-3 h-3 stroke-[3]" /> : bracket.tier}
                  </div>

                  <div>
                    <div className="font-semibold flex items-center gap-2">
                      <span className={isCurrent ? 'text-blue-950 font-bold' : isBelow ? 'text-slate-800' : 'text-slate-500'}>
                        Tier {bracket.tier}: {formatPHP(bracket.min)} — {bracket.max === Infinity ? 'Above' : formatPHP(bracket.max)}
                      </span>
                      {isCurrent && (
                        <span className="bg-blue-600 text-white text-[9px] uppercase px-1.5 py-0.2 rounded font-bold tracking-wider">
                          Active Tier
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Formula: {bracket.baseTax > 0 ? `${formatPHP(bracket.baseTax)} + ` : ''}
                      {bracket.rate > 0 ? `${(bracket.rate * 100).toFixed(0)}% of excess over ${formatPHP(bracket.min)}` : '0% (Exempt)'}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-mono font-bold text-slate-800">
                    {(bracket.rate * 100).toFixed(0)}%
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Base: {formatPHP(bracket.baseTax)}
                  </div>
                </div>
              </div>

              {/* Progress bar inside active tier */}
              {isCurrent && bracket.max !== Infinity && (
                <div className="mt-2.5 pt-2 border-t border-blue-200">
                  <div className="flex justify-between text-[10px] text-blue-900 font-medium mb-1">
                    <span>Position within Tier {bracket.tier}:</span>
                    <span>
                      {formatPHP(taxableCompensation)} / {formatPHP(bracket.max)}
                    </span>
                  </div>
                  <div className="w-full bg-blue-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(0, ((taxableCompensation - bracket.min) / (bracket.max - bracket.min)) * 100)
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Tax Calculation Math Breakdown */}
      <div className="bg-slate-50 rounded-lg p-3 text-xs border border-slate-200 space-y-1.5">
        <div className="flex items-center gap-1.5 font-bold text-slate-700">
          <Info className="w-3.5 h-3.5 text-blue-600" />
          <span>Computation Audit Trail:</span>
        </div>
        <div className="font-mono text-slate-600 space-y-1 pl-5 text-[11px]">
          <div>1. Taxable Compensation: {formatPHP(taxableCompensation)}</div>
          <div>2. Base Tax for Tier {appliedBracket.tier}: {formatPHP(appliedBracket.baseTax)}</div>
          <div>
            3. Excess over {formatPHP(appliedBracket.min)}: {formatPHP(Math.max(0, taxableCompensation - appliedBracket.min))} × {(appliedBracket.rate * 100).toFixed(0)}% = {formatPHP(Math.max(0, taxableCompensation - appliedBracket.min) * appliedBracket.rate)}
          </div>
          <div className="font-bold text-blue-900 pt-1 border-t border-slate-200">
            = Total Annual Tax Due: {formatPHP(taxDue)}
          </div>
        </div>
      </div>
    </div>
  );
}
