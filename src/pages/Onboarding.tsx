import { ClipboardList, UserCheck, PlayCircle } from 'lucide-react';

export function Onboarding() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Employee Onboarding</h1>
          <p className="text-sm text-slate-500 mt-1">Track orientation progress and document submissions.</p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded hover:bg-slate-50">
            <ClipboardList className="w-4 h-4 mr-2" />
            Manage Templates
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <h2 className="font-bold text-slate-700 uppercase text-xs tracking-wider">Recent Hires Setup Progress</h2>
        </div>
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase border-b border-slate-100">
              <tr>
                <th className="px-6 py-3">Employee</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3 border-l border-slate-100">Documents</th>
                <th className="px-6 py-3 border-l border-slate-100">IT Setup</th>
                <th className="px-6 py-3 border-l border-slate-100">Orientation</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-900">Emilio Jacinto</td>
                <td className="px-6 py-4 text-slate-500">UX Designer</td>
                <td className="px-6 py-4 border-l border-slate-100 text-center"><span className="text-green-600 font-bold">4/4</span></td>
                <td className="px-6 py-4 border-l border-slate-100 text-center"><span className="text-orange-500 font-bold">1/3</span></td>
                <td className="px-6 py-4 border-l border-slate-100 text-center"><span className="text-slate-400 font-bold">0%</span></td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-[10px] font-bold uppercase">In Progress</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
