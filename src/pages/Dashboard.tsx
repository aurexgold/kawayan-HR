import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { mockEmployees, mockLeaveRequests, mockPayrollRecords } from '../data/mockData';
import { cn } from '../lib/utils';
import { GovDeadlinesAlertWidget } from '../components/dashboard/GovDeadlinesAlertWidget';
import { Receipt, BookOpen, Gift, UserCheck, Sparkles, HeartHandshake } from 'lucide-react';

export function Dashboard() {
  const activeEmployeesCount = mockEmployees.filter(e => e.status === 'Active' || e.status === 'On Leave').length;
  const pendingLeavesCount = mockLeaveRequests.filter(l => l.status === 'Pending').length;
  
  const totalPayroll = mockPayrollRecords.reduce((acc, curr) => acc + curr.grossPay, 0);

  const stats = [
    { title: 'Total Employees', value: activeEmployeesCount, sub: 'Active in directory', valueColor: 'text-slate-900', subColor: 'text-slate-400' },
    { title: 'Gross Payroll', value: `₱${(totalPayroll/1000000).toFixed(2)}M`, sub: 'Monthly disbursement', valueColor: 'text-slate-900', subColor: 'text-slate-400' },
    { title: 'Pending Leave Requests', value: pendingLeavesCount, sub: 'Requires approval', valueColor: 'text-orange-500', subColor: 'text-slate-400' },
    { title: 'Compliance Score', value: '100%', sub: 'PH Statutory standards', valueColor: 'text-emerald-600', subColor: 'text-slate-400' },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Dashboard Overview</h1>
          <p className="text-sm text-slate-500 mt-1">Snapshot of company operations, compliance deadlines, and HR metrics.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/compliance"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
            AI Compliance Advisor
          </Link>
          <Link
            to="/hmo"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors shadow-xs"
          >
            <HeartHandshake className="w-3.5 h-3.5 text-emerald-600" />
            HMO & Healthcare
          </Link>
          <Link
            to="/self-service"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-xs"
          >
            <UserCheck className="w-3.5 h-3.5" />
            Employee ESS
          </Link>
          <Link
            to="/payroll?tab=13th-month"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors shadow-xs"
          >
            <Gift className="w-3.5 h-3.5 text-amber-600" />
            13th Month Pay
          </Link>
          <Link
            to="/handbook"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors shadow-xs"
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-600" />
            Handbook (AI)
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 hover:cursor-default">
        {stats.map((stat, i) => (
          <motion.div 
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm"
          >
            <div className="text-slate-500 text-xs font-medium uppercase mb-1">{stat.title}</div>
            <div className={cn("text-3xl font-bold", stat.valueColor)}>{stat.value}</div>
            <div className={cn("text-xs mt-2", stat.subColor)}>{stat.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* Philippine Mandatory Government Filing Deadlines Alert Widget */}
      <GovDeadlinesAlertWidget />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <h2 className="font-bold text-slate-700 uppercase text-xs tracking-wider">Recent Employee Onboarding</h2>
            <Link to="/registry" className="text-blue-600 text-xs font-semibold hover:underline">View Registry</Link>
          </div>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase border-b border-slate-100">
                  <th className="px-6 py-3">Employee</th>
                  <th className="px-6 py-3">Position</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {mockEmployees.slice(0,4).map(emp => (
                  <tr key={emp.id} className="border-b border-slate-50 last:border-none">
                    <td className="px-6 py-4 font-medium text-slate-900">{emp.firstName} {emp.lastName}</td>
                    <td className="px-6 py-4 text-slate-500">{emp.role}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-[10px] font-bold">ACTIVE</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <h2 className="font-bold text-slate-700 uppercase text-xs tracking-wider">Pending Approvals</h2>
            <Link to="/leaves" className="text-blue-600 text-xs font-semibold hover:underline">View All</Link>
          </div>
          <div className="p-4 space-y-4">
             {mockLeaveRequests.filter(l => l.status === 'Pending').map(req => {
               const emp = mockEmployees.find(e => e.id === req.employeeId);
               return (
                  <div key={req.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900">{emp?.firstName} {emp?.lastName}</span>
                      <span className="text-xs text-orange-600 font-medium">Requesting {req.type} Leave</span>
                    </div>
                    <button className="text-xs font-bold text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded hover:bg-slate-50 shadow-sm">Review</button>
                  </div>
               )
             })}
             {mockLeaveRequests.filter(l => l.status === 'Pending').length === 0 && (
               <p className="text-sm text-slate-500">No pending requests at this time.</p>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
