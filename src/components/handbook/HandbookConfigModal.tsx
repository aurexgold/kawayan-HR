import React, { useState } from 'react';
import { X, Sparkles, Building2, Clock, ShieldCheck, HeartHandshake, Briefcase } from 'lucide-react';
import { HandbookConfig } from '../../lib/handbook';

interface HandbookConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: HandbookConfig;
  onGenerate: (newConfig: HandbookConfig) => Promise<void>;
  isGenerating: boolean;
}

export function HandbookConfigModal({
  isOpen,
  onClose,
  config,
  onGenerate,
  isGenerating,
}: HandbookConfigModalProps) {
  const [formData, setFormData] = useState<HandbookConfig>(config);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onGenerate(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full my-8 overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-linear-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-blue-300" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight">AI Employee Handbook Generator</h2>
                <p className="text-xs text-blue-200 mt-0.5">
                  Powered by Gemini 3.8 Flash • Tailored to Philippine Labor Code & DOLE Regulations
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isGenerating}
              className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          {/* Section 1: Company Profile */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
              <Building2 className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-800">
                1. Company Identification & Industry
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Registered Legal Entity Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="e.g. Kawayan Multi-Purpose Cooperative & Enterprises Inc."
                  className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  SEC or CDA Registration No.
                </label>
                <input
                  type="text"
                  value={formData.secOrCdaNumber || ''}
                  onChange={(e) => setFormData({ ...formData, secOrCdaNumber: e.target.value })}
                  placeholder="e.g. CDA Reg. No. 9520-1002341"
                  className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Industry / Sector *
                </label>
                <select
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
                >
                  <option value="Cooperative, Financial & Enterprise Services">Cooperative & Financial Services</option>
                  <option value="Information Technology, BPO & Software">IT, BPO & Software Services</option>
                  <option value="Manufacturing, Supply Chain & Logistics">Manufacturing & Logistics</option>
                  <option value="Retail, Hospitality & Food Services">Retail & Hospitality</option>
                  <option value="Healthcare, Pharmacy & Wellness">Healthcare & Medical Services</option>
                  <option value="General Professional Services">Professional & Corporate Services</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Work Arrangement Model *
                </label>
                <select
                  value={formData.workSetup}
                  onChange={(e) => setFormData({ ...formData, workSetup: e.target.value as any })}
                  className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
                >
                  <option value="hybrid">Hybrid (Office & Telecommuting RA 11165)</option>
                  <option value="onsite">100% On-Site / Office Facility</option>
                  <option value="remote">100% Remote / Telecommuting Scheme</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Work Schedule & Probation */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
              <Clock className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-800">
                2. Hours of Work, Breaks & Probationary Term
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Standard Work Schedule (Articles 83–85) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.workingSchedule}
                  onChange={(e) => setFormData({ ...formData, workingSchedule: e.target.value })}
                  placeholder="e.g. Monday to Friday, 8:30 AM – 5:30 PM (40 hours/week)"
                  className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Probationary Months (Art. 296)
                </label>
                <select
                  value={formData.probationaryMonths}
                  onChange={(e) => setFormData({ ...formData, probationaryMonths: Number(e.target.value) })}
                  className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
                >
                  <option value={6}>6 Months (DOLE Standard Maximum)</option>
                  <option value={3}>3 Months</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Leave Entitlements */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
              <HeartHandshake className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-800">
                3. Leave Allocations & Social Benefits
              </h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Vacation Leave (VL)
                </label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={formData.vacationDays}
                  onChange={(e) => setFormData({ ...formData, vacationDays: Number(e.target.value) })}
                  className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
                <span className="text-[10px] text-slate-500">Days per year</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Sick Leave (SL)
                </label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={formData.sickDays}
                  onChange={(e) => setFormData({ ...formData, sickDays: Number(e.target.value) })}
                  className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
                <span className="text-[10px] text-slate-500">Days per year</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Service Incentive (SIL)
                </label>
                <input
                  type="number"
                  min="5"
                  max="15"
                  value={formData.silDays}
                  onChange={(e) => setFormData({ ...formData, silDays: Number(e.target.value) })}
                  className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
                <span className="text-[10px] text-emerald-600 font-medium">Min 5 days (Art. 95)</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bereavement Leave
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.bereavementDays}
                  onChange={(e) => setFormData({ ...formData, bereavementDays: Number(e.target.value) })}
                  className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
                <span className="text-[10px] text-slate-500">Immediate family</span>
              </div>
            </div>

            <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3 text-xs text-blue-900 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Automatic Philippine Statutory Protections Enforced:</span>
                <p className="text-slate-600 mt-0.5">
                  105-Day Expanded Maternity (RA 11210), 7-Day Paternity (RA 8187), 7-Day Solo Parent (RA 11861), 10-Day VAWC (RA 9262), and 2-Month Special Leave for Women (RA 9710) will be automatically embedded.
                </p>
              </div>
            </div>
          </div>

          {/* Section 4: Culture, Tone & Custom Directives */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
              <Briefcase className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-800">
                4. Culture Tone & Company-Specific Policies
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Policy Tone & Voice
                </label>
                <select
                  value={formData.cultureTone}
                  onChange={(e) => setFormData({ ...formData, cultureTone: e.target.value as any })}
                  className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
                >
                  <option value="cooperative">Cooperative & People-First (Empowering, community-driven)</option>
                  <option value="formal">Formal Corporate & Strict Legal (Institutional, highly structured)</option>
                  <option value="progressive">Progressive & Modern Tech (Agile, trust-based, collaborative)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  CODI / Safe Spaces Grievance Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.grievanceEmail}
                  onChange={(e) => setFormData({ ...formData, grievanceEmail: e.target.value })}
                  placeholder="e.g. codi-grievance@kawayan.coop"
                  className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Custom Policies & Special Benefits
              </label>
              <textarea
                rows={3}
                value={formData.customPolicies}
                onChange={(e) => setFormData({ ...formData, customPolicies: e.target.value })}
                placeholder="e.g. Mandatory biometric logging with grace periods; staff cooperative emergency loan facility; telecommuting equipment stipend; wellness recharge days."
                className="w-full text-sm border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono text-xs"
              />
              <span className="text-[11px] text-slate-500">
                Gemini will seamlessly weave your company-specific directives into the appropriate Labor Code chapters.
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              disabled={isGenerating}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isGenerating}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg shadow-sm flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Drafting Standard Handbook...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-blue-200" />
                  <span>Generate Standardized Handbook</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
