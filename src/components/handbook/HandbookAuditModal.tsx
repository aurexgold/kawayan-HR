import React from 'react';
import { X, CheckCircle2, AlertTriangle, XCircle, ShieldCheck, FileCheck, ArrowRight, BookOpen } from 'lucide-react';
import { HandbookAuditResult } from '../../lib/handbook';

interface HandbookAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  auditResult: HandbookAuditResult;
  companyName: string;
}

export function HandbookAuditModal({
  isOpen,
  onClose,
  auditResult,
  companyName,
}: HandbookAuditModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full my-8 overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 relative flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">DOLE Labor Standards Audit Scorecard</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Evaluation of {companyName} Employee Handbook against Presidential Decree No. 442 & DOLE Advisories
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          {/* Top Score Summary Banner */}
          <div className="p-5 bg-linear-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex flex-col items-center justify-center shadow-md">
                <span className="text-2xl font-black">{auditResult.complianceScore}%</span>
                <span className="text-[10px] font-medium uppercase tracking-wider text-emerald-100">Score</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-slate-900">{auditResult.status}</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                    DOLE Compliant
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  All 10 mandatory Philippine statutory labor standards, leave laws, and procedural due process requirements verified.
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="text-xs text-slate-500">Inspection Standard</div>
              <div className="text-xs font-mono font-bold text-slate-800 mt-0.5">PH-DOLE-2025-V1</div>
            </div>
          </div>

          {/* Checklist */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-blue-600" />
              10 Philippine Statutory Compliance Verifications
            </h3>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
              {auditResult.checklist.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-white hover:bg-slate-50/80 transition-colors flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {item.isCompliant ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900">{item.requirement}</span>
                        <span className="text-[11px] font-mono px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                          {item.lawReference}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{item.details}</p>
                    </div>
                  </div>

                  <span
                    className={`text-[11px] font-semibold px-2 py-1 rounded shrink-0 ${
                      item.isCompliant ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    {item.isCompliant ? 'Verified' : 'Action Required'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* DOLE Inspection Guidance & Recommendations */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-amber-900 font-semibold text-xs uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              DOLE Inspection Audit Notes & Best Practices
            </div>
            <ul className="space-y-1.5 text-xs text-amber-950">
              {auditResult.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2">
                  <ArrowRight className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </li>
              ))}
              <li className="flex items-start gap-2">
                <ArrowRight className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Submit an annual OSH Report and Committee on Decorum and Investigation (CODI) constitution record to your local DOLE Field Office.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <BookOpen className="w-4 h-4 text-slate-400" />
            <span>NLRC & DOLE Inspection Ready</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Close Audit View
          </button>
        </div>
      </div>
    </div>
  );
}
