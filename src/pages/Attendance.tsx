import { 
  Clock, Fingerprint, RefreshCw, ScanFace, Wifi, CheckCircle2, 
  X, FileSpreadsheet, ShieldCheck, Download 
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { mockEmployees } from '../data/mockData';
import { DoleReportingModule } from '../components/attendance/DoleReportingModule';
import { generateDoleCsvString, downloadDoleCsv, generateDoleMandatedLogs } from '../lib/dole-reporting';

export function Attendance() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'dole' ? 'dole' : 'live';
  const [activeTab, setActiveTab] = useState<'live' | 'dole'>(initialTab);

  const [isSyncing, setIsSyncing] = useState(false);
  const [showKioskModal, setShowKioskModal] = useState(false);
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'success'>('idle');

  useEffect(() => {
    if (searchParams.get('tab') === 'dole') {
      setActiveTab('dole');
    }
  }, [searchParams]);

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
    }, 2000);
  };

  const simulateBiometricScan = () => {
    setScanState('scanning');
    setTimeout(() => {
      setScanState('success');
      setTimeout(() => {
        setScanState('idle');
        setShowKioskModal(false);
      }, 1500);
    }, 2000);
  };

  const handleQuickDoleCsvDownload = () => {
    const logs = generateDoleMandatedLogs(mockEmployees, '2026-10-16', '2026-10-31');
    const csv = generateDoleCsvString(logs, 'populated');
    downloadDoleCsv(csv, `DOLE_Mandated_Employee_Logs_Oct16_Oct31_2026.csv`);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Attendance & Mandated Time Logs</h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
              DOLE GLS Compliant
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Biometric terminal tracking, employee shifts, and Department of Labor and Employment (DOLE) mandated logs.
          </p>
        </div>

        {/* Global Toolbar buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button 
            onClick={() => {
              setActiveTab('dole');
              setSearchParams({ tab: 'dole' });
            }}
            className={`flex items-center px-3.5 py-2 text-xs font-semibold rounded-lg border transition-colors shadow-xs ${
              activeTab === 'dole'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <ShieldCheck className="w-4 h-4 mr-1.5 text-blue-400" />
            DOLE Mandated Logs
          </button>
          <button 
            onClick={handleQuickDoleCsvDownload}
            className="flex items-center px-3.5 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-lg hover:bg-emerald-100 transition-colors shadow-xs"
            title="Download DOLE-compliant CSV timesheet"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Export DOLE CSV
          </button>
          <button 
            onClick={() => setShowKioskModal(true)}
            className="flex items-center px-3.5 py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold rounded-lg hover:bg-indigo-100 transition-colors shadow-xs"
          >
            <ScanFace className="w-4 h-4 mr-1.5" />
            Kiosk Mode
          </button>
          <button 
            onClick={handleSync}
            className="flex items-center px-3.5 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isSyncing ? 'animate-spin text-blue-500' : ''}`} />
            Sync Devices
          </button>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-4 pt-2 gap-2 shadow-xs">
        <button
          onClick={() => {
            setActiveTab('live');
            setSearchParams({});
          }}
          className={`py-3 px-4 font-bold text-sm border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'live'
              ? 'border-blue-600 text-blue-600 bg-blue-50/40 rounded-t-lg'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Clock className="w-4 h-4 text-slate-600" />
          Live Attendance & Biometric Terminals
        </button>

        <button
          onClick={() => {
            setActiveTab('dole');
            setSearchParams({ tab: 'dole' });
          }}
          className={`py-3 px-4 font-bold text-sm border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'dole'
              ? 'border-blue-600 text-blue-600 bg-blue-50/40 rounded-t-lg'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          DOLE Mandated Logs & CSV Reporting Module
          <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-bold">
            Rule 1020
          </span>
        </button>
      </div>

      {/* Tab 1: Live Attendance & Terminals */}
      {activeTab === 'live' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 hover:cursor-default">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs col-span-1 lg:col-span-1">
              <div className="text-slate-500 text-xs font-medium uppercase mb-4 flex items-center gap-2">
                <Fingerprint className="w-4 h-4 text-blue-600" /> Device Status
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Wifi className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm font-medium text-slate-700">Entrance K300</span>
                  </div>
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-bold uppercase">Online</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Wifi className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm font-medium text-slate-700">Back Door ZT10</span>
                  </div>
                  <span className="text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded font-bold uppercase">Offline</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Wifi className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm font-medium text-slate-700">Kiosk Tablet A</span>
                  </div>
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-bold uppercase">Online</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500">
                Last synced: {isSyncing ? 'Syncing...' : 'Just now'}
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs col-span-1 lg:col-span-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
                <div>
                  <div className="text-slate-500 text-xs font-medium uppercase mb-1">Present Today</div>
                  <div className="text-3xl font-bold text-slate-900">142</div>
                  <div className="text-xs mt-2 text-slate-400">92% attendance rate</div>
                </div>
                <div>
                  <div className="text-slate-500 text-xs font-medium uppercase mb-1">Late In</div>
                  <div className="text-3xl font-bold text-amber-500">5</div>
                  <div className="text-xs mt-2 text-slate-400">Past 10 minutes grace period</div>
                </div>
                <div>
                  <div className="text-slate-500 text-xs font-medium uppercase mb-1">Missing Logs</div>
                  <div className="text-3xl font-bold text-rose-500">2</div>
                  <div className="text-xs mt-2 text-slate-400">Needs resolution</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="font-bold text-slate-700 uppercase text-xs tracking-wider">Today's Activity</h2>
              <button 
                onClick={() => {
                  setActiveTab('dole');
                  setSearchParams({ tab: 'dole' });
                }}
                className="text-blue-600 text-xs font-semibold hover:underline flex items-center gap-1"
              >
                View Full DOLE Mandated Logbook →
              </button>
            </div>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3">Employee</th>
                    <th className="px-6 py-3">Source</th>
                    <th className="px-6 py-3">Time In</th>
                    <th className="px-6 py-3">Time Out</th>
                    <th className="px-6 py-3">Total Hours</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {mockEmployees.slice(0,4).map((emp, i) => (
                    <tr key={emp.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{emp.firstName} {emp.lastName}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-slate-500">
                          <Fingerprint className="w-3.5 h-3.5 text-blue-500" />
                          <span className="text-xs">Main Ent</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-mono text-xs">{i === 1 ? '09:15 AM' : '08:50 AM'}</td>
                      <td className="px-6 py-4 text-slate-500 font-mono text-xs">--:--</td>
                      <td className="px-6 py-4 font-medium font-mono text-xs">Ongoing</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                          i === 1 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {i === 1 ? 'LATE' : 'ON TIME'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="font-bold text-slate-700 uppercase text-xs tracking-wider">Biometric Terminals</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3">Device Name</th>
                    <th className="px-6 py-3">Location</th>
                    <th className="px-6 py-3">IP Address</th>
                    <th className="px-6 py-3">Last Sync Time</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-2">
                      <Fingerprint className="w-4 h-4 text-blue-500" />
                      Entrance K300
                    </td>
                    <td className="px-6 py-4 text-slate-500">Lobby Main</td>
                    <td className="px-6 py-4 text-slate-500 font-mono text-xs">192.168.1.101</td>
                    <td className="px-6 py-4 text-slate-500">2 mins ago</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold uppercase">Online</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-blue-600 font-semibold text-xs hover:underline">Ping</button>
                    </td>
                  </tr>
                  <tr className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-2">
                      <Fingerprint className="w-4 h-4 text-slate-400" />
                      Backdoor ZT10
                    </td>
                    <td className="px-6 py-4 text-slate-500">Warehouse Exit</td>
                    <td className="px-6 py-4 text-slate-500 font-mono text-xs">192.168.1.102</td>
                    <td className="px-6 py-4 text-slate-500">4 hours ago</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-rose-100 text-rose-700 rounded text-[10px] font-bold uppercase">Offline</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-blue-600 font-semibold text-xs hover:underline">Restart</button>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-2">
                      <ScanFace className="w-4 h-4 text-indigo-500" />
                      Kiosk Tablet A
                    </td>
                    <td className="px-6 py-4 text-slate-500">HR Office</td>
                    <td className="px-6 py-4 text-slate-500 font-mono text-xs">192.168.1.105</td>
                    <td className="px-6 py-4 text-slate-500">10 secs ago</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold uppercase">Online</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-blue-600 font-semibold text-xs hover:underline">Ping</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: DOLE Mandated Logs & CSV Reporting Module */}
      {activeTab === 'dole' && (
        <DoleReportingModule />
      )}

      {/* Kiosk Mode Modal */}
      {showKioskModal && (
        <div className="fixed inset-0 bg-slate-900/90 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col relative">
            <button 
              onClick={() => setShowKioskModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="p-8 text-center bg-slate-50 border-b border-slate-100">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Kawayan HR Time Clock</h2>
              <p className="text-sm text-slate-500 mt-1">{new Date().toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <div className="text-4xl font-mono font-bold text-blue-600 mt-4">
                {new Date().toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            
            <div className="p-12 flex flex-col items-center justify-center min-h-[300px]">
              {scanState === 'idle' && (
                <>
                  <div 
                    onClick={simulateBiometricScan}
                    className="w-32 h-32 rounded-full bg-blue-50 border-4 border-blue-100 flex items-center justify-center text-blue-500 cursor-pointer hover:bg-blue-100 hover:border-blue-200 transition-all shadow-inner relative group"
                  >
                    <Fingerprint className="w-16 h-16 group-hover:scale-110 transition-transform" />
                    <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-blue-400"></div>
                  </div>
                  <p className="mt-8 text-slate-600 font-medium">Place finger on scanner or look at camera</p>
                </>
              )}

              {scanState === 'scanning' && (
                <>
                  <div className="w-32 h-32 rounded-full border-4 border-slate-100 border-t-blue-500 animate-spin flex items-center justify-center relative">
                    <div className="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center">
                      <ScanFace className="w-10 h-10 text-blue-400 animate-pulse" />
                    </div>
                  </div>
                  <p className="mt-8 text-blue-600 font-medium animate-pulse">Authenticating...</p>
                </>
              )}

              {scanState === 'success' && (
                <>
                  <div className="w-32 h-32 rounded-full bg-green-50 border-4 border-green-100 flex items-center justify-center text-green-500">
                    <CheckCircle2 className="w-16 h-16" />
                  </div>
                  <div className="mt-6 text-center">
                    <p className="text-lg font-bold text-slate-900">Juan Dela Cruz</p>
                    <p className="text-green-600 font-bold mt-1">Time In Recorded</p>
                    <p className="text-xs text-slate-500 mt-1">{new Date().toLocaleTimeString('en-PH')}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
