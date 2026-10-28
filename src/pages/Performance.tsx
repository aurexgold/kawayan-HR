import { Star, TrendingUp, Target } from 'lucide-react';

export function Performance() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Performance Management</h1>
          <p className="text-sm text-slate-500 mt-1">Appraisals, goals, and continuous feedback.</p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded hover:bg-blue-700">
            <Target className="w-4 h-4 mr-2" />
            Create Review Cycle
          </button>
        </div>
      </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 hover:cursor-default">
         <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-medium uppercase mb-1">Active Cycle</div>
          <div className="text-xl font-bold text-slate-900">Q2 2026 Appraisal</div>
          <div className="text-xs mt-2 text-blue-600 font-semibold">Ends in 14 days</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-medium uppercase mb-1">Completion Rate</div>
          <div className="text-3xl font-bold text-slate-900">45%</div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3">
             <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '45%' }}></div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <h2 className="font-bold text-slate-700 uppercase text-xs tracking-wider">Department Overview</h2>
        </div>
        <div className="p-8 text-center text-slate-500 text-sm">
          Performance matrix loading...
        </div>
      </div>

    </div>
  );
}
