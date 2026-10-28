import { useNavigate } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { mockLeaveRequests, mockEmployees } from '../data/mockData';
import { format } from 'date-fns';

export function Leaves() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Time-off & SIL</h1>
          <p className="text-sm text-slate-500 mt-1">Manage Service Incentive Leaves and general absences.</p>
        </div>
        <button
          onClick={() => navigate('/holidays')}
          className="flex items-center px-4 py-2 bg-purple-50 border border-purple-200 text-purple-700 text-xs font-semibold rounded-lg hover:bg-purple-100 transition-colors shadow-xs"
        >
          <Calendar className="w-4 h-4 mr-2 text-purple-600" />
          View Philippine Holiday Calendar
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 space-y-8">
        <div>
          <h2 className="font-bold text-slate-700 uppercase text-xs tracking-wider mb-4">Pending Requests</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockLeaveRequests.filter(l => l.status === 'Pending').map(req => {
              const emp = mockEmployees.find(e => e.id === req.employeeId);
              return (
                <div key={req.id} className="border border-slate-200 p-5 rounded-xl shadow-sm bg-white">
                  <div className="flex justify-between items-start mb-3">
                    <span className="font-bold text-slate-900">{emp?.firstName} {emp?.lastName}</span>
                    <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-[10px] font-bold uppercase">{req.type}</span>
                  </div>
                  <div className="text-sm text-slate-600 space-y-1 mb-5">
                    <p><span className="font-medium text-slate-400">From:</span> {format(new Date(req.startDate), 'MMM dd, yyyy')}</p>
                    <p><span className="font-medium text-slate-400">To:</span> {format(new Date(req.endDate), 'MMM dd, yyyy')}</p>
                    <p className="mt-3 text-slate-700 italic border-l-2 border-slate-200 pl-3">"{req.reason}"</p>
                  </div>
                  <div className="flex gap-3">
                    <button className="flex-1 bg-white border border-slate-200 text-slate-900 py-2 rounded text-xs font-bold hover:bg-slate-50 transition-colors shadow-sm">Deny</button>
                    <button className="flex-1 bg-blue-600 text-white py-2 rounded text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm">Approve</button>
                  </div>
                </div>
              );
            })}
          </div>
          {mockLeaveRequests.filter(l => l.status === 'Pending').length === 0 && (
            <p className="text-sm text-slate-500">No pending requests at this time.</p>
          )}
        </div>

        <div className="pt-8 border-t border-slate-100">
           <h2 className="font-bold text-slate-700 uppercase text-xs tracking-wider mb-4">Recent History</h2>
           <div className="space-y-3">
             {mockLeaveRequests.filter(l => l.status !== 'Pending').map(req => {
                const emp = mockEmployees.find(e => e.id === req.employeeId);
                const isApproved = req.status === 'Approved';
                return (
                  <div key={req.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-slate-100 rounded-xl bg-slate-50">
                    <div>
                      <div className="font-medium text-slate-900">{emp?.firstName} {emp?.lastName} <span className="text-slate-500 font-normal">requested {req.type}</span></div>
                      <div className="text-[13px] text-slate-500 mt-1">
                        {format(new Date(req.startDate), 'MMM dd')} - {format(new Date(req.endDate), 'MMM dd, yyyy')}
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-0">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                        isApproved ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {req.status}
                      </span>
                    </div>
                  </div>
                );
             })}
           </div>
        </div>
      </div>
    </div>
  );
}
