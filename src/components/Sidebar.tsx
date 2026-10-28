import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Calculator, CalendarOff, Settings,
  Briefcase, UserPlus, Clock, Target, BookOpen, FileText, CheckCircle2, Calendar, Receipt, Landmark, Gift, UserCheck, ShieldCheck, HeartHandshake, Sparkles
} from 'lucide-react';
import { cn } from '../lib/utils';

export function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const essRoutes = [
    { name: 'Self-Service (ESS)', path: '/self-service', icon: UserCheck, badge: 'Employee' },
  ];

  const hrCoreRoutes = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Add Employee', path: '/registry?action=add', icon: UserPlus },
    { name: 'Registry', path: '/registry', icon: Users },
    { name: 'Recruitment', path: '/recruitment', icon: Briefcase },
    { name: 'Onboarding', path: '/onboarding', icon: CheckCircle2 },
    { name: 'Performance', path: '/performance', icon: Target },
    { name: 'L&D', path: '/learning', icon: BookOpen },
  ];

  const timePayRoutes = [
    { name: 'Attendance', path: '/attendance', icon: Clock },
    { name: 'Leaves', path: '/leaves', icon: CalendarOff },
    { name: 'Holiday Tracker', path: '/holidays', icon: Calendar },
    { name: 'Payroll', path: '/payroll', icon: Calculator },
    { name: '13th Month Pay', path: '/payroll?tab=13th-month', icon: Gift },
    { name: 'HMO & Benefits', path: '/hmo', icon: HeartHandshake },
    { name: 'Salary Loans', path: '/loans', icon: Landmark },
    { name: 'Tax (BIR 2316)', path: '/tax-calculator', icon: Receipt },
  ];

  const complianceRoutes = [
    { name: 'AI Compliance Advisor', path: '/compliance', icon: Sparkles },
    { name: 'Employee Handbook', path: '/handbook', icon: FileText },
  ];


  return (
    <aside className={cn(
      "bg-slate-900 text-slate-300 h-screen fixed top-0 left-0 flex flex-col transition-transform duration-300 z-20 w-64",
      isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
    )}>
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-white">
          K
        </div>
        <span className="font-bold text-white text-lg tracking-tight">Kawayan HR</span>
      </div>

      <nav className="mt-4 flex-1 overflow-y-auto pb-4">
        {/* Employee Self-Service Section */}
        <div className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase flex items-center justify-between">
          <span>Employee Portal</span>
          <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded font-mono font-bold">ESS</span>
        </div>
        <div className="mt-1 space-y-1">
          {essRoutes.map((route) => (
            <NavLink
              key={route.path}
              to={route.path}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  "flex items-center justify-between px-6 py-3 transition-colors",
                  isActive 
                    ? "bg-blue-600/20 text-blue-400 border-r-4 border-blue-500 font-medium" 
                    : "hover:bg-slate-800 hover:text-white border-r-4 border-transparent text-slate-300"
                )
              }
            >
              <div className="flex items-center gap-3">
                <route.icon className="w-5 h-5 shrink-0 text-blue-400" />
                <span className="text-sm">{route.name}</span>
              </div>
              <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700">
                {route.badge}
              </span>
            </NavLink>
          ))}
        </div>

        <div className="mt-6 px-4 py-2 text-xs font-semibold text-slate-500 uppercase">HR Core</div>
        <div className="mt-2 space-y-1">
          {hrCoreRoutes.map((route) => (
            <NavLink
              key={route.path}
              to={route.path}
              onClick={onClose}
              end={route.path === '/'}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-6 py-3 transition-colors",
                  isActive 
                    ? "bg-slate-800 text-white border-r-4 border-blue-500" 
                    : "hover:bg-slate-800 hover:text-white border-r-4 border-transparent"
                )
              }
            >
              <route.icon className="w-5 h-5 shrink-0" />
              <span className="text-sm">{route.name}</span>
            </NavLink>
          ))}
        </div>

        <div className="mt-6 px-4 py-2 text-xs font-semibold text-slate-500 uppercase">Time & Pay</div>
        <div className="mt-2 space-y-1">
          {timePayRoutes.map((route) => (
            <NavLink
              key={route.path}
              to={route.path}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-6 py-3 transition-colors",
                  isActive 
                    ? "bg-slate-800 text-white border-r-4 border-blue-500" 
                    : "hover:bg-slate-800 hover:text-white border-r-4 border-transparent"
                )
              }
            >
              <route.icon className="w-5 h-5 shrink-0" />
              <span className="text-sm">{route.name}</span>
            </NavLink>
          ))}
        </div>

        <div className="mt-6 px-4 py-2 text-xs font-semibold text-slate-500 uppercase">Compliance & Legal</div>
        <div className="mt-2 space-y-1">
          {complianceRoutes.map((route) => (
            <NavLink
              key={route.path}
              to={route.path}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-6 py-3 transition-colors",
                  isActive 
                    ? "bg-slate-800 text-white border-r-4 border-blue-500" 
                    : "hover:bg-slate-800 hover:text-white border-r-4 border-transparent"
                )
              }
            >
              <route.icon className="w-5 h-5 shrink-0" />
              <span className="text-sm">{route.name}</span>
            </NavLink>
          ))}
        </div>
      </nav>
      
      <div className="p-6 bg-slate-950">
        <div className="text-xs text-slate-500">Compliance Version</div>
        <div className="text-sm font-mono text-blue-400">PH-GOV-2024.12</div>
      </div>
    </aside>
  );
}
