import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, Sparkles, Calendar, CheckCircle2, ShieldCheck, 
  Scale, FileSpreadsheet, Download, Info, Check, Filter, 
  ChevronRight, Building2, AlertTriangle, ArrowRight
} from 'lucide-react';
import { PhilippineHoliday } from '../../data/phHolidays';
import { 
  generatePhilippineHolidaysForYear, 
  ProclamationConfig, 
  DEFAULT_PROCLAMATION_CONFIGS 
} from '../../lib/ph-holiday-proclamation-generator';

interface ProclamationGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyHolidays: (holidays: PhilippineHoliday[], replaceYear?: number) => void;
  currentYear?: number;
}

export function ProclamationGeneratorModal({
  isOpen,
  onClose,
  onApplyHolidays,
  currentYear = 2026,
}: ProclamationGeneratorModalProps) {
  const [targetYear, setTargetYear] = useState<number>(currentYear);
  const [proclamationNumber, setProclamationNumber] = useState<string>(
    DEFAULT_PROCLAMATION_CONFIGS[currentYear]?.proclamationNumber || 'Proclamation No. 727, s. 2025'
  );

  const [includeRegular, setIncludeRegular] = useState<boolean>(true);
  const [includeSpecial, setIncludeSpecial] = useState<boolean>(true);
  const [includeAdditional, setIncludeAdditional] = useState<boolean>(true);
  const [includeIslamic, setIncludeIslamic] = useState<boolean>(true);
  const [includeLgu, setIncludeLgu] = useState<boolean>(true);
  const [companySubsidizeSpecial, setCompanySubsidizeSpecial] = useState<boolean>(false);
  const [replaceExistingYear, setReplaceExistingYear] = useState<boolean>(true);

  // Individual selection checklist
  const [deselectedIds, setDeselectedIds] = useState<Set<string>>(new Set());

  // Update proclamation number when target year changes
  useEffect(() => {
    const defaultMeta = DEFAULT_PROCLAMATION_CONFIGS[targetYear];
    if (defaultMeta) {
      setProclamationNumber(defaultMeta.proclamationNumber);
    } else {
      setProclamationNumber(`Proclamation No. ${750 + (targetYear - 2026) * 40}, s. ${targetYear - 1}`);
    }
    setDeselectedIds(new Set());
  }, [targetYear]);

  // Generate candidate holidays
  const generatedHolidays = useMemo(() => {
    const config: ProclamationConfig = {
      year: targetYear,
      proclamationNumber,
      includeRegularHolidays: includeRegular,
      includeSpecialNonWorkingDays: includeSpecial,
      includeAdditionalSpecialDays: includeAdditional,
      includeIslamicHolidays: includeIslamic,
      includeMajorMetroLguHolidays: includeLgu,
      companyPolicyPayUnworkedSpecial: companySubsidizeSpecial,
    };
    return generatePhilippineHolidaysForYear(config);
  }, [
    targetYear, 
    proclamationNumber, 
    includeRegular, 
    includeSpecial, 
    includeAdditional, 
    includeIslamic, 
    includeLgu, 
    companySubsidizeSpecial
  ]);

  // Active selected holidays
  const activeSelectedHolidays = useMemo(() => {
    return generatedHolidays.filter(h => !deselectedIds.has(h.id));
  }, [generatedHolidays, deselectedIds]);

  const regularCount = activeSelectedHolidays.filter(h => h.type === 'Regular Holiday').length;
  const specialCount = activeSelectedHolidays.filter(h => h.type === 'Special Non-Working Day').length;
  const lguCount = activeSelectedHolidays.filter(h => h.type === 'Local / LGU Holiday').length;

  // Toggle individual holiday
  const handleToggleHoliday = (id: string) => {
    setDeselectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    setDeselectedIds(new Set());
  };

  const handleDeselectAll = () => {
    setDeselectedIds(new Set(generatedHolidays.map(h => h.id)));
  };

  const handleApply = () => {
    if (activeSelectedHolidays.length === 0) return;
    onApplyHolidays(activeSelectedHolidays, replaceExistingYear ? targetYear : undefined);
    onClose();
  };

  const handleExportPreviewCsv = () => {
    const headers = [
      'Date (YYYY-MM-DD)',
      'Holiday Name',
      'Filipino Local Name',
      'Statutory Type',
      'Applicable Location',
      'Legal Basis / Proclamation',
      'Unworked Pay Rate',
      'Worked Pay Rate (8h)',
      'Overtime Rate',
      'Rest Day Rate',
      'Description'
    ];

    const rows = activeSelectedHolidays.map(h => [
      `"${h.date}"`,
      `"${h.name}"`,
      `"${h.localName || ''}"`,
      `"${h.type}"`,
      `"${h.applicableLocation}"`,
      `"${h.legalBasis}"`,
      `"${h.payRules.unworkedRate}"`,
      `"${h.payRules.workedFirst8Hours}"`,
      `"${h.payRules.workedOvertime}"`,
      `"${h.payRules.workedOnRestDay}"`,
      `"${h.description}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Philippine_Proclamation_Holidays_${targetYear}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full overflow-hidden flex flex-col max-h-[92vh] border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Generate Philippine Proclamation Holiday Schedule
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-500/30 text-purple-300 border border-purple-400/30">
                  Labor Code Art. 94 & RA 9492
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Automatically calculates moveable Holy Week, Islamic feasts, and gazetted national non-working observances for your system calendar.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Configuration Toolbar Strip */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 sm:p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            
            {/* Year Selector */}
            <div className="sm:col-span-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Target Year
              </label>
              <select
                value={targetYear}
                onChange={(e) => setTargetYear(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm font-bold text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 shadow-2xs"
              >
                <option value={2026}>2026 (Current Year)</option>
                <option value={2025}>2025 (Previous Year)</option>
                <option value={2027}>2027 (Upcoming Year)</option>
                <option value={2028}>2028 (Planning Year)</option>
              </select>
            </div>

            {/* Official Proclamation Number */}
            <div className="sm:col-span-6">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Official Presidential Proclamation Reference
              </label>
              <input
                type="text"
                value={proclamationNumber}
                onChange={(e) => setProclamationNumber(e.target.value)}
                placeholder="e.g. Proclamation No. 727, s. 2025"
                className="w-full px-3 py-2 text-sm font-medium text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 shadow-2xs"
              />
            </div>

            {/* Mode: Replace vs Merge */}
            <div className="sm:col-span-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Calendar Injection Mode
              </label>
              <select
                value={replaceExistingYear ? 'replace' : 'merge'}
                onChange={(e) => setReplaceExistingYear(e.target.value === 'replace')}
                className="w-full px-3 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 shadow-2xs"
              >
                <option value="replace">Replace {targetYear} Schedule</option>
                <option value="merge">Merge with Existing</option>
              </select>
            </div>

          </div>

          {/* Scope Checkbox Chips */}
          <div className="pt-2 border-t border-slate-200/80">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Proclamation Observance Scope:
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <label className="flex items-center gap-1.5 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-slate-200 hover:border-purple-300 shadow-2xs">
                <input
                  type="checkbox"
                  checked={includeRegular}
                  onChange={(e) => setIncludeRegular(e.target.checked)}
                  className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-slate-300"
                />
                <span className="font-semibold text-slate-800">Regular Holidays (Art. 94)</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-slate-200 hover:border-purple-300 shadow-2xs">
                <input
                  type="checkbox"
                  checked={includeSpecial}
                  onChange={(e) => setIncludeSpecial(e.target.checked)}
                  className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-slate-300"
                />
                <span className="font-semibold text-slate-800">Special Non-Working Days</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-slate-200 hover:border-purple-300 shadow-2xs">
                <input
                  type="checkbox"
                  checked={includeAdditional}
                  onChange={(e) => setIncludeAdditional(e.target.checked)}
                  className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-slate-300"
                />
                <span className="font-semibold text-slate-800">Additional Special Days (Dec 24, Nov 2)</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-slate-200 hover:border-purple-300 shadow-2xs">
                <input
                  type="checkbox"
                  checked={includeIslamic}
                  onChange={(e) => setIncludeIslamic(e.target.checked)}
                  className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-slate-300"
                />
                <span className="font-semibold text-slate-800">Islamic Observances (Eidul Fitr & Adha)</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-slate-200 hover:border-purple-300 shadow-2xs">
                <input
                  type="checkbox"
                  checked={includeLgu}
                  onChange={(e) => setIncludeLgu(e.target.checked)}
                  className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-slate-300"
                />
                <span className="font-semibold text-slate-800">Major Metro LGU Days (Manila, QC, Makati)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Schedule Preview Section */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* Summary Metric Strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-purple-50/70 border border-purple-200 rounded-xl p-3.5 text-xs text-purple-950">
            <div className="flex flex-wrap items-center gap-4">
              <span className="font-bold text-sm">
                Generated {targetYear} Schedule: <span className="font-mono">{activeSelectedHolidays.length}</span> Observances
              </span>
              <span className="px-2.5 py-0.5 rounded-md font-bold bg-purple-200/80 text-purple-900 font-mono">
                {regularCount} Regular Holidays (200%)
              </span>
              <span className="px-2.5 py-0.5 rounded-md font-bold bg-blue-100 text-blue-900 font-mono">
                {specialCount} Special Non-Working (130%)
              </span>
              {lguCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-md font-bold bg-slate-200 text-slate-800 font-mono">
                  {lguCount} LGU / Local
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-[11px] font-semibold text-purple-700 hover:underline"
              >
                Select All
              </button>
              <span className="text-purple-300">•</span>
              <button
                type="button"
                onClick={handleDeselectAll}
                className="text-[11px] font-semibold text-slate-500 hover:underline"
              >
                Deselect All
              </button>
            </div>
          </div>

          {/* Table of Generated Holidays */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[10px] font-bold text-slate-600 uppercase tracking-wider sticky top-0 border-b border-slate-200 z-10">
                  <tr>
                    <th className="px-3.5 py-2.5 w-10 text-center">Include</th>
                    <th className="px-4 py-2.5">Date & Day</th>
                    <th className="px-4 py-2.5">Holiday / Observance Name</th>
                    <th className="px-3.5 py-2.5">Statutory Classification</th>
                    <th className="px-3.5 py-2.5">DOLE Pay Rule</th>
                    <th className="px-3.5 py-2.5">Applicable Scope</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  {generatedHolidays.map((hol) => {
                    const isSelected = !deselectedIds.has(hol.id);
                    const holidayDate = new Date(hol.date);
                    const dayOfWeek = holidayDate.toLocaleDateString('en-PH', { weekday: 'long' });

                    return (
                      <tr 
                        key={hol.id}
                        className={`transition-colors ${isSelected ? 'hover:bg-slate-50/80' : 'bg-slate-50/40 opacity-50'}`}
                      >
                        <td className="px-3.5 py-2.5 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleHoliday(hol.id)}
                            className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-slate-300 cursor-pointer"
                          />
                        </td>

                        <td className="px-4 py-2.5 font-mono font-semibold text-slate-900 whitespace-nowrap">
                          {hol.date}
                          <span className="block text-[10px] text-slate-500 font-sans">{dayOfWeek}</span>
                        </td>

                        <td className="px-4 py-2.5">
                          <div className="font-bold text-slate-900">{hol.name}</div>
                          {hol.localName && (
                            <div className="text-[10px] text-slate-500 italic">{hol.localName}</div>
                          )}
                          <div className="text-[10px] text-slate-400 truncate max-w-xs">{hol.description}</div>
                        </td>

                        <td className="px-3.5 py-2.5 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            hol.type === 'Regular Holiday'
                              ? 'bg-purple-100 text-purple-800 border border-purple-200'
                              : hol.type === 'Special Non-Working Day'
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : 'bg-slate-100 text-slate-800 border border-slate-200'
                          }`}>
                            {hol.type}
                          </span>
                        </td>

                        <td className="px-3.5 py-2.5 whitespace-nowrap">
                          <span className="font-semibold text-slate-800 font-mono block">
                            {hol.payRules.workedFirst8Hours}
                          </span>
                          <span className="text-[10px] text-slate-500 block">
                            Unworked: {hol.payRules.unworkedRate}
                          </span>
                        </td>

                        <td className="px-3.5 py-2.5 text-slate-600 whitespace-nowrap">
                          <span className="font-medium">{hol.applicableLocation}</span>
                          <span className="text-[10px] text-slate-400 block truncate max-w-[140px] font-mono">
                            {hol.legalBasis}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg transition-colors shadow-2xs"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleExportPreviewCsv}
              className="px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg transition-colors shadow-2xs flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              Export Schedule (CSV)
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleApply}
              disabled={activeSelectedHolidays.length === 0}
              className="px-5 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              Generate & Apply {activeSelectedHolidays.length} Holidays to System Calendar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
