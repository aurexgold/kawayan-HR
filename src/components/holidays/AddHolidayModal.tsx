import { useState, useId, FormEvent } from 'react';
import { X, Calendar, Plus, ShieldCheck, Check } from 'lucide-react';
import { PhilippineHoliday, HolidayType } from '../../data/phHolidays';

interface AddHolidayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddHoliday: (newHoliday: PhilippineHoliday) => void;
}

export function AddHolidayModal({
  isOpen,
  onClose,
  onAddHoliday,
}: AddHolidayModalProps) {
  const [name, setName] = useState('');
  const [localName, setLocalName] = useState('');
  const [date, setDate] = useState('2026-11-20');
  const [type, setType] = useState<HolidayType>('Special Non-Working Day');
  const [legalBasis, setLegalBasis] = useState('Presidential Proclamation No.');
  const [applicableLocation, setApplicableLocation] = useState('Nationwide');
  const [description, setDescription] = useState('');

  const holidayNameInputId = useId();
  const localNameInputId = useId();
  const proclamationDateInputId = useId();
  const legalBasisInputId = useId();
  const descriptionInputId = useId();

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name || !date) return;

    let unworkedRate = '100% of Daily Wage';
    let workedFirst8Hours = '200% of Daily Wage';
    let workedOvertime = '+30% (260%)';
    let workedOnRestDay = '260% of Daily Wage';

    if (type === 'Special Non-Working Day' || type === 'Local / LGU Holiday') {
      unworkedRate = 'No Work, No Pay';
      workedFirst8Hours = '130% of Daily Wage';
      workedOvertime = '+30% (169%)';
      workedOnRestDay = '150% of Daily Wage';
    } else if (type === 'Special Working Day') {
      unworkedRate = 'Regular Pay (No Premium)';
      workedFirst8Hours = '100% of Daily Wage';
      workedOvertime = '+25% standard OT';
      workedOnRestDay = '130% on Rest Day';
    }

    const newHoliday: PhilippineHoliday = {
      id: `hol-custom-${Date.now()}`,
      name,
      localName: localName || undefined,
      date,
      type,
      legalBasis: legalBasis || 'Presidential Proclamation',
      applicableLocation: applicableLocation || 'Nationwide',
      payRules: {
        unworkedRate,
        workedFirst8Hours,
        workedOvertime,
        workedOnRestDay,
      },
      description: description || 'Special observance declared by company / proclamation.',
      isCustom: true,
    };

    onAddHoliday(newHoliday);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
              <Calendar className="w-4 h-4 text-blue-300" />
            </div>
            <div>
              <h2 className="text-sm font-bold">Declare Holiday or Proclamation</h2>
              <p className="text-[11px] text-slate-400">Add dynamic Presidential Proclamation or local non-working day</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label htmlFor={holidayNameInputId} className="block font-bold text-slate-700 mb-1">Holiday / Observance Name *</label>
            <input
              id={holidayNameInputId}
              type="text"
              required
              placeholder="e.g. Special Day of National Mourning / Wellness Day"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor={localNameInputId} className="block text-slate-500 mb-1">Filipino Name (Optional)</label>
              <input
                id={localNameInputId}
                type="text"
                placeholder="e.g. Araw ng Paggunita"
                value={localName}
                onChange={(e) => setLocalName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor={proclamationDateInputId} className="block font-bold text-slate-700 mb-1">Date *</label>
              <input
                id={proclamationDateInputId}
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="add-holiday-statutory-type" className="block font-bold text-slate-700 mb-1">Statutory Type</label>
              <select
                id="add-holiday-statutory-type"
                value={type}
                onChange={(e) => setType(e.target.value as HolidayType)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800 focus:bg-white focus:outline-none"
              >
                <option value="Regular Holiday">Regular Holiday (200%)</option>
                <option value="Special Non-Working Day">Special Non-Working Day (130%)</option>
                <option value="Local / LGU Holiday">Local / LGU Holiday (130%)</option>
                <option value="Special Working Day">Special Working Day (100%)</option>
                <option value="Company Declared">Company Declared Holiday</option>
              </select>
            </div>
            <div>
              <label htmlFor="add-holiday-location" className="block font-bold text-slate-700 mb-1">Applicable Site</label>
              <select
                id="add-holiday-location"
                value={applicableLocation}
                onChange={(e) => setApplicableLocation(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800 focus:bg-white focus:outline-none"
              >
                <option value="Nationwide">Nationwide (All Branches)</option>
                <option value="Taguig City (BGC Sites)">Taguig City (BGC Sites)</option>
                <option value="Makati City Sites">Makati City Sites</option>
                <option value="Quezon City Sites">Quezon City Sites</option>
                <option value="Cebu IT Park Site">Cebu IT Park Site</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor={legalBasisInputId} className="block text-slate-500 mb-1">Legal Basis / Proclamation Reference</label>
            <input
              id={legalBasisInputId}
              type="text"
              placeholder="e.g. Presidential Proclamation No. 729 / LGU Ordinance"
              value={legalBasis}
              onChange={(e) => setLegalBasis(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor={descriptionInputId} className="block text-slate-500 mb-1">Description & Operational Notes</label>
            <textarea
              id={descriptionInputId}
              rows={2}
              placeholder="Notes for payroll and attendance automation..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-[11px] text-blue-900 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span>
              Once declared, this holiday will automatically sync into the Attendance DTR engine and apply the statutory DOLE holiday multiplier to affected payroll cut-offs.
            </span>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Add to Calendar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
