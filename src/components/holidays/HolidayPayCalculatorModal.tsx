import { useState, useId } from 'react';
import { X, Calculator } from 'lucide-react';
import { mockEmployees } from '../../data/mockData';
import { PhilippineHoliday, HolidayType, calculateHolidayPay } from '../../data/phHolidays';

interface HolidayPayCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialHoliday?: PhilippineHoliday;
}

export function HolidayPayCalculatorModal({
  isOpen,
  onClose,
  initialHoliday,
}: HolidayPayCalculatorModalProps) {
  const [selectedEmpId, setSelectedEmpId] = useState<string>(mockEmployees[0]?.id || '');
  const [customSalary, setCustomSalary] = useState<number>(50000);
  const [useEmployeeSalary, setUseEmployeeSalary] = useState<boolean>(true);
  
  const [holidayType, setHolidayType] = useState<HolidayType>(initialHoliday?.type || 'Regular Holiday');
  const [holidayName, setHolidayName] = useState<string>(initialHoliday?.name || "Araw ng Kagitingan");
  
  const [worked, setWorked] = useState<boolean>(true);
  const [hoursWorked, setHoursWorked] = useState<number>(8);
  const [overtimeHours, setOvertimeHours] = useState<number>(0);
  const [isOnRestDay, setIsOnRestDay] = useState<boolean>(false);

  const customSalaryInputId = useId();
  const hoursWorkedInputId = useId();
  const otHoursInputId = useId();

  if (!isOpen) return null;

  const currentEmp = mockEmployees.find(e => e.id === selectedEmpId);
  const effectiveSalary = useEmployeeSalary ? (currentEmp?.basicSalary || 50000) : customSalary;

  const result = calculateHolidayPay(
    effectiveSalary,
    holidayType,
    worked,
    hoursWorked,
    overtimeHours,
    isOnRestDay
  );

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
              <Calculator className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <h2 className="text-base font-bold">DOLE Holiday Pay Rate Simulator</h2>
              <p className="text-xs text-slate-400">Calculates statutory gross pay for unworked & worked Philippine holidays</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5 text-xs text-slate-700 bg-slate-50/50">
          {/* Employee & Salary Selection */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block">
              1. Employee & Base Wage Rate
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="holiday-pay-emp-select" className="text-slate-500 block mb-1">Select Employee</label>
                <select
                  id="holiday-pay-emp-select"
                  value={selectedEmpId}
                  onChange={(e) => {
                    setSelectedEmpId(e.target.value);
                    setUseEmployeeSalary(true);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800"
                >
                  {mockEmployees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} (₱{emp.basicSalary.toLocaleString()}/mo)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor={customSalaryInputId} className="text-slate-500 block mb-1">Monthly Basic Salary (PHP)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400 font-bold">₱</span>
                  <input
                    id={customSalaryInputId}
                    type="number"
                    value={effectiveSalary}
                    onChange={(e) => {
                      setCustomSalary(parseFloat(e.target.value) || 0);
                      setUseEmployeeSalary(false);
                    }}
                    className="w-full pl-7 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-900"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 text-[11px]">
              <div>Daily Rate (261-day factor): <strong className="font-mono text-slate-900">₱{result.dailyRate.toLocaleString()}</strong></div>
              <div>Hourly Rate (8h normal): <strong className="font-mono text-slate-900">₱{result.hourlyRate.toFixed(2)}/hr</strong></div>
            </div>
          </div>

          {/* Holiday Classification */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block">
              2. Holiday Classification & Multipliers
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="holiday-pay-category-select" className="text-slate-500 block mb-1">Holiday Statutory Category</label>
                <select
                  id="holiday-pay-category-select"
                  value={holidayType}
                  onChange={(e) => setHolidayType(e.target.value as HolidayType)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800"
                >
                  <option value="Regular Holiday">Regular Holiday (100% unworked / 200% worked)</option>
                  <option value="Special Non-Working Day">Special Non-Working Day (No work no pay / 130% worked)</option>
                  <option value="Local / LGU Holiday">Local / LGU Holiday (130% worked)</option>
                  <option value="Company Declared">Company Declared Holiday (100% standard)</option>
                </select>
              </div>

              <div>
                <label htmlFor="holiday-pay-name-input" className="text-slate-500 block mb-1">Holiday / Observance Name</label>
                <input
                  id="holiday-pay-name-input"
                  type="text"
                  value={holidayName}
                  onChange={(e) => setHolidayName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Work Hours & Rest Day Checkbox */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block">
              3. Attendance On Holiday
            </span>
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={worked}
                  onChange={(e) => setWorked(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="font-bold text-slate-800">Employee Worked on Holiday</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isOnRestDay}
                  onChange={(e) => setIsOnRestDay(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="font-bold text-slate-800">Holiday Falls on Employee Rest Day (+Premium)</span>
              </label>
            </div>

            {worked && (
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                <div>
                  <label htmlFor={hoursWorkedInputId} className="text-slate-500 block mb-1">Regular Hours Worked (Max 8)</label>
                  <input
                    id={hoursWorkedInputId}
                    type="number"
                    min="1"
                    max="8"
                    value={hoursWorked}
                    onChange={(e) => setHoursWorked(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label htmlFor={otHoursInputId} className="text-slate-500 block mb-1">Overtime Hours Worked (&gt;8h)</label>
                  <input
                    id={otHoursInputId}
                    type="number"
                    min="0"
                    max="12"
                    value={overtimeHours}
                    onChange={(e) => setOvertimeHours(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-indigo-700"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Computed Statutory Pay Result */}
          <div className="p-4 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-2 border-emerald-500 rounded-xl space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                  Total DOLE Holiday Compensation
                </span>
                <div className="text-2xl sm:text-3xl font-black text-emerald-700 font-mono mt-0.5">
                  ₱{result.totalHolidayPay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded text-xs font-bold font-mono">
                {(result.multiplier * 100).toFixed(0)}% Multiplier
              </span>
            </div>

            <div className="pt-2 border-t border-emerald-200/60 text-xs text-emerald-900 space-y-1">
              <div><strong>DOLE Rule Applied:</strong> {result.breakdown}</div>
              <div className="text-[11px] text-emerald-800 font-mono">
                Regular Pay: ₱{result.basePay.toFixed(2)} {overtimeHours > 0 && `+ OT Pay: ₱${result.otPay.toFixed(2)}`}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-between items-center text-xs">
          <span className="text-slate-500">Compliant with DOLE Book III & Labor Advisory Rules</span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
