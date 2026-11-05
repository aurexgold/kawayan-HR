import { useState, useMemo } from 'react';
import { 
  Calendar, Plus, Calculator, Download, Filter, Search, 
  ShieldCheck, CheckCircle2, AlertCircle, Clock, MapPin, 
  ChevronLeft, ChevronRight, Sparkles, HelpCircle, ArrowUpRight, 
  Scale, FileSpreadsheet, Eye, RotateCcw
} from 'lucide-react';
import { format, parseISO, isSameDay, getMonth, getYear, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek } from 'date-fns';
import { PhilippineHoliday, HolidayType } from '../data/phHolidays';
import { useHolidays } from '../lib/holidays-store';
import { HolidayPayCalculatorModal } from '../components/holidays/HolidayPayCalculatorModal';
import { AddHolidayModal } from '../components/holidays/AddHolidayModal';
import { ProclamationGeneratorModal } from '../components/holidays/ProclamationGeneratorModal';

export function Holidays() {
  const { holidays, addHoliday, mergeHolidays, resetToDefault } = useHolidays();
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [currentCalendarDate, setCurrentCalendarDate] = useState<Date>(new Date(2026, 9, 1)); // October 2026
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [selectedLocationFilter, setSelectedLocationFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modals state
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [selectedHolidayForCalc, setSelectedHolidayForCalc] = useState<PhilippineHoliday | undefined>(undefined);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isGeneratorModalOpen, setIsGeneratorModalOpen] = useState(false);

  // Sync state notification
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  // Filtered holidays
  const filteredHolidays = useMemo(() => {
    return holidays.filter(h => {
      const matchType = selectedTypeFilter === 'all' || h.type === selectedTypeFilter;
      const matchLoc = selectedLocationFilter === 'all' || h.applicableLocation.includes(selectedLocationFilter);
      const matchSearch = searchTerm === '' || 
        h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (h.localName && h.localName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        h.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchType && matchLoc && matchSearch;
    });
  }, [holidays, selectedTypeFilter, selectedLocationFilter, searchTerm]);

  // Aggregate stats
  const regularCount = holidays.filter(h => h.type === 'Regular Holiday').length;
  const specialCount = holidays.filter(h => h.type === 'Special Non-Working Day').length;
  const localCount = holidays.filter(h => h.type === 'Local / LGU Holiday' || h.type === 'Company Declared').length;

  // Next upcoming holiday from late October 2026
  const nextHoliday = useMemo(() => {
    const today = new Date('2026-10-27');
    return holidays
      .filter(h => new Date(h.date) >= today)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
  }, [holidays]);

  // Calendar calculations
  const monthStart = startOfMonth(currentCalendarDate);
  const monthEnd = endOfMonth(currentCalendarDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const handlePrevMonth = () => {
    setCurrentCalendarDate(new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentCalendarDate(new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() + 1, 1));
  };

  const handleAddHoliday = (newHol: PhilippineHoliday) => {
    addHoliday(newHol);
    setSyncStatus(`Added "${newHol.name}" and synced to attendance rules.`);
    setTimeout(() => setSyncStatus(null), 4000);
  };

  const handleApplyGeneratedHolidays = (generated: PhilippineHoliday[], replaceYear?: number) => {
    mergeHolidays(generated, replaceYear);
    const yearToFocus = replaceYear || (generated[0] ? new Date(generated[0].date).getFullYear() : 2026);
    setCurrentCalendarDate(new Date(yearToFocus, 0, 1)); // Jump to January of that target year
    setSyncStatus(`Successfully generated and applied ${generated.length} official holidays for Year ${yearToFocus} to the system calendar.`);
    setTimeout(() => setSyncStatus(null), 5000);
  };

  const handleOpenCalculator = (holiday?: PhilippineHoliday) => {
    setSelectedHolidayForCalc(holiday);
    setIsCalculatorOpen(true);
  };

  const handleSyncAttendance = () => {
    setSyncStatus('Synchronizing holiday calendars with biometric time clocks and payroll cut-offs...');
    setTimeout(() => {
      setSyncStatus(`Success! ${holidays.length} statutory holidays synced with Biometric Terminals & DOLE Timesheet rules.`);
      setTimeout(() => setSyncStatus(null), 4000);
    }, 1200);
  };

  const handleExportCSV = () => {
    const headers = [
      'Holiday ID',
      'Date (YYYY-MM-DD)',
      'Holiday Name',
      'Filipino Name',
      'Statutory Classification',
      'Applicable Location',
      'Legal Basis / Proclamation',
      'Unworked Pay Rate (DOLE)',
      'Worked Pay Rate (First 8h)',
      'Overtime Rate',
      'Rest Day Rate',
      'Description',
    ];

    const rows = holidays.map(h => [
      h.id,
      h.date,
      h.name,
      h.localName || '',
      h.type,
      h.applicableLocation,
      h.legalBasis,
      h.payRules.unworkedRate,
      h.payRules.workedFirst8Hours,
      h.payRules.workedOvertime,
      h.payRules.workedOnRestDay,
      h.description,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + 
      [headers.map(col => `"${col}"`).join(','), 
       ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\r\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Philippines_Holidays_Schedule_${currentCalendarDate.getFullYear()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Philippine Holiday Calendar Tracker</h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
              Proclamations {currentCalendarDate.getFullYear()}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Automated DOLE holiday pay multipliers, presidential proclamations, and regional LGU non-working observances.
          </p>
        </div>

        {/* Global Toolbar buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsGeneratorModalOpen(true)}
            className="flex items-center text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 px-3.5 py-2 rounded-lg transition-colors shadow-xs"
            title="Automatically generate gazetted holidays for current or upcoming year based on Presidential Proclamations"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-300" />
            Auto-Generate Proclamation Schedule
          </button>
          <button
            onClick={() => handleOpenCalculator()}
            className="flex items-center text-xs font-semibold text-slate-700 bg-white border border-slate-200 px-3.5 py-2 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Calculator className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
            Holiday Pay Simulator
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center text-xs font-semibold text-slate-700 bg-white border border-slate-200 px-3.5 py-2 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
            Declare Proclamation
          </button>
          <button
            onClick={handleSyncAttendance}
            className="flex items-center text-xs font-semibold text-white bg-blue-600 px-3.5 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-xs"
          >
            <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
            Sync to Timekeeping
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center text-xs font-semibold text-slate-700 bg-white border border-slate-200 px-3.5 py-2 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
            title="Download CSV schedule for company memo"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Sync Status Banner */}
      {syncStatus && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs font-medium flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{syncStatus}</span>
        </div>
      )}

      {/* Key Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total 2026 Observances</span>
          <span className="text-2xl font-black text-slate-900 font-mono mt-1 block">{holidays.length}</span>
          <span className="text-[10px] text-slate-500">Official Gazetted Days</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 block">Regular Holidays</span>
          <span className="text-2xl font-black text-purple-700 font-mono mt-1 block">{regularCount}</span>
          <span className="text-[10px] text-slate-400">100% Unworked / 200% Worked</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block">Special Non-Working</span>
          <span className="text-2xl font-black text-amber-700 font-mono mt-1 block">{specialCount}</span>
          <span className="text-[10px] text-slate-400">0% Unworked / 130% Worked</span>
        </div>

        {/* Upcoming Holiday Alert Tile */}
        <div className="bg-gradient-to-br from-blue-900 to-indigo-950 text-white p-4 rounded-xl shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300 block flex items-center gap-1">
              <Clock className="w-3 h-3" /> Upcoming Observance
            </span>
            <div className="text-sm font-bold text-white mt-1 truncate">
              {nextHoliday ? nextHoliday.name : 'None in range'}
            </div>
            <div className="text-xs text-blue-200 font-mono mt-0.5">
              {nextHoliday ? format(parseISO(nextHoliday.date), 'MMMM dd, yyyy') : '--'}
            </div>
          </div>
          {nextHoliday && (
            <div className="text-[10px] text-emerald-300 font-semibold pt-1">
              {nextHoliday.type} • {nextHoliday.payRules.workedFirst8Hours}
            </div>
          )}
        </div>
      </div>

      {/* Process Simplification & DOLE Multiplier Matrix Cheat Sheet */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-blue-400 shrink-0" />
            <div>
              <h3 className="font-bold text-sm text-white">DOLE Process Simplification: Official Holiday Pay Formula Matrix</h3>
              <p className="text-xs text-slate-400">Automates statutory payroll adjustments for employee daily time records</p>
            </div>
          </div>
          <button
            onClick={() => handleOpenCalculator()}
            className="text-xs text-blue-300 hover:text-white font-bold flex items-center gap-1 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 transition-colors"
          >
            <span>Launch Pay Simulator</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
          <div className="p-3 bg-white/5 rounded-lg border border-white/10 space-y-1">
            <span className="font-bold text-purple-300 block">1. Regular Holiday (Art. 94)</span>
            <ul className="text-[11px] text-slate-300 space-y-0.5">
              <li>• <strong>Unworked:</strong> 100% of daily wage</li>
              <li>• <strong>Worked (1st 8 hrs):</strong> 200% of daily wage</li>
              <li>• <strong>Overtime:</strong> +30% of hourly rate (260%)</li>
              <li>• <strong>Worked on Rest Day:</strong> 260% daily wage</li>
            </ul>
          </div>

          <div className="p-3 bg-white/5 rounded-lg border border-white/10 space-y-1">
            <span className="font-bold text-amber-300 block">2. Special Non-Working Day</span>
            <ul className="text-[11px] text-slate-300 space-y-0.5">
              <li>• <strong>Unworked:</strong> No work, no pay (0%)</li>
              <li>• <strong>Worked (1st 8 hrs):</strong> 130% of daily wage</li>
              <li>• <strong>Overtime:</strong> +30% of hourly rate (169%)</li>
              <li>• <strong>Worked on Rest Day:</strong> 150% daily wage</li>
            </ul>
          </div>

          <div className="p-3 bg-white/5 rounded-lg border border-white/10 space-y-1">
            <span className="font-bold text-emerald-300 block">3. Statutory Qualification Rules</span>
            <ul className="text-[11px] text-slate-300 space-y-0.5">
              <li>• <strong>Day-Before Rule:</strong> Must be present or on paid leave the day prior to enjoy unworked regular pay.</li>
              <li>• <strong>Double Holiday:</strong> 300% if worked on double holiday (e.g. Kagitingan + Maundy Thursday).</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="text-xs font-bold text-slate-700">Display View:</span>
            <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  viewMode === 'calendar'
                    ? 'bg-white text-blue-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Month Calendar View
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  viewMode === 'list'
                    ? 'bg-white text-blue-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Proclamation List ({filteredHolidays.length})
              </button>
            </div>
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search holiday or observance..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>
        </div>

        {/* Dropdowns */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Holiday Type:</span>
            <select
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value)}
              aria-label="Filter holidays by statutory type"
              className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Statutory Types</option>
              <option value="Regular Holiday">Regular Holiday (200%)</option>
              <option value="Special Non-Working Day">Special Non-Working Day (130%)</option>
              <option value="Local / LGU Holiday">Local / LGU Holiday</option>
              <option value="Company Declared">Company Declared Holiday</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Applicable Location:</span>
            <select
              value={selectedLocationFilter}
              onChange={(e) => setSelectedLocationFilter(e.target.value)}
              aria-label="Filter holidays by site location"
              className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Sites & Locations</option>
              <option value="Nationwide">Nationwide</option>
              <option value="Taguig">Taguig City (BGC)</option>
              <option value="Makati">Makati City</option>
              <option value="Cebu">Cebu IT Park</option>
            </select>
          </div>
        </div>
      </div>

      {/* View 1: Calendar Grid View */}
      {viewMode === 'calendar' && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
          {/* Calendar Month Navigation Header */}
          <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/70">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-slate-900 font-mono">
                {format(currentCalendarDate, 'MMMM yyyy')}
              </h2>
              <span className="text-xs text-slate-500">
                ({holidays.filter(h => h.date.startsWith(format(currentCalendarDate, 'yyyy-MM'))).length} observances this month)
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-white text-slate-600 transition-colors"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentCalendarDate(new Date(2026, 9, 1))}
                className="px-3 py-1 text-xs font-semibold rounded-lg border border-slate-200 hover:bg-white text-slate-700 transition-colors"
              >
                Today
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-white text-slate-600 transition-colors"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-100/70 text-[11px] font-bold text-slate-500 text-center py-2 uppercase">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Calendar Grid Tiles */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 min-h-[500px]">
            {calendarDays.map((day) => {
              const dayStr = format(day, 'yyyy-MM-dd');
              const isCurrentMonth = getMonth(day) === getMonth(currentCalendarDate);
              const dayHolidays = holidays.filter(h => h.date === dayStr);

              return (
                <div
                  key={dayStr}
                  className={`p-2 min-h-[95px] flex flex-col justify-between transition-colors ${
                    isCurrentMonth ? 'bg-white hover:bg-slate-50/50' : 'bg-slate-50/40 text-slate-400'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className={`text-xs font-bold font-mono ${
                      format(day, 'yyyy-MM-dd') === '2026-10-27' 
                        ? 'w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-black' 
                        : isCurrentMonth ? 'text-slate-800' : 'text-slate-400'
                    }`}>
                      {format(day, 'd')}
                    </span>
                  </div>

                  {/* Badges for holidays on this day */}
                  <div className="space-y-1 mt-1 flex-1">
                    {dayHolidays.map(hol => (
                      <button
                        key={hol.id}
                        onClick={() => handleOpenCalculator(hol)}
                        className={`w-full text-left p-1 rounded text-[10px] font-bold leading-tight truncate block transition-transform hover:scale-[1.02] shadow-2xs ${
                          hol.type === 'Regular Holiday' ? 'bg-purple-100 text-purple-900 border border-purple-200' :
                          hol.type === 'Special Non-Working Day' ? 'bg-amber-100 text-amber-900 border border-amber-200' :
                          'bg-blue-100 text-blue-900 border border-blue-200'
                        }`}
                        title={`${hol.name} (${hol.type}) - Click to simulate pay`}
                      >
                        {hol.name}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* View 2: Proclamation List Table View */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-800 uppercase text-xs tracking-wider">
              Official Presidential Proclamations & Declared Days
            </h3>
            <span className="text-xs bg-slate-100 px-2 py-0.5 rounded font-mono font-bold text-slate-600">
              {filteredHolidays.length} Observances Found
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 text-[11px] font-bold text-slate-600 uppercase border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Holiday / Observance Name</th>
                  <th className="px-5 py-3">Statutory Category</th>
                  <th className="px-5 py-3">Applicable Site</th>
                  <th className="px-5 py-3">Unworked Pay</th>
                  <th className="px-5 py-3">Worked Pay (1st 8h)</th>
                  <th className="px-5 py-3">Legal Basis</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredHolidays.map(hol => (
                  <tr key={hol.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 font-mono whitespace-nowrap font-bold text-slate-900">
                      {format(parseISO(hol.date), 'MMM dd, yyyy')}
                      <span className="block text-[10px] text-slate-400 font-normal">{format(parseISO(hol.date), 'EEEE')}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-900">{hol.name}</div>
                      {hol.localName && (
                        <div className="text-[11px] text-slate-500 italic">{hol.localName}</div>
                      )}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        hol.type === 'Regular Holiday' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                        hol.type === 'Special Non-Working Day' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                        'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}>
                        {hol.type}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-slate-600">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {hol.applicableLocation}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-700">
                      {hol.payRules.unworkedRate}
                    </td>
                    <td className="px-5 py-3.5 font-mono font-bold text-emerald-700">
                      {hol.payRules.workedFirst8Hours}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 text-[11px]">
                      {hol.legalBasis}
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleOpenCalculator(hol)}
                        className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded border border-blue-200 transition-colors inline-flex items-center gap-1"
                      >
                        <Calculator className="w-3 h-3" />
                        Simulate Pay
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <HolidayPayCalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
        initialHoliday={selectedHolidayForCalc}
      />

      <AddHolidayModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddHoliday={handleAddHoliday}
      />

      <ProclamationGeneratorModal
        isOpen={isGeneratorModalOpen}
        onClose={() => setIsGeneratorModalOpen(false)}
        onApplyHolidays={handleApplyGeneratedHolidays}
        currentYear={currentCalendarDate.getFullYear()}
      />
    </div>
  );
}
