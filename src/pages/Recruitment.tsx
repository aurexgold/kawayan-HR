import { Briefcase, UserPlus, FileText, CheckCircle2 } from 'lucide-react';

export function Recruitment() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Recruitment & ATS</h1>
          <p className="text-sm text-slate-500 mt-1">Manage job postings, candidates, and interview pipelines.</p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded hover:bg-blue-700">
            <Briefcase className="w-4 h-4 mr-2" />
            Create Job Post
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 hover:cursor-default">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-medium uppercase mb-1">Open Positions</div>
          <div className="text-3xl font-bold text-slate-900">4</div>
          <div className="text-xs mt-2 text-slate-400">Across 3 departments</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-medium uppercase mb-1">Total Applicants</div>
          <div className="text-3xl font-bold text-blue-600">42</div>
          <div className="text-xs mt-2 text-slate-400">Past 30 days</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-medium uppercase mb-1">Interviews Scheduled</div>
          <div className="text-3xl font-bold text-orange-500">8</div>
          <div className="text-xs mt-2 text-slate-400">Next 7 days</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <h2 className="font-bold text-slate-700 uppercase text-xs tracking-wider">Active Candidates pipeline</h2>
        </div>
        <div className="p-8 text-center text-slate-500 text-sm">
          Applicant tracking system interface loading...
        </div>
      </div>
    </div>
  );
}
