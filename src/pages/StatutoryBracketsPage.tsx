import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { StatutoryBracketCalculator } from '../components/payroll/StatutoryBracketCalculator';
import { 
  Scale, ShieldCheck, HeartPulse, Home, Calculator, 
  ArrowLeftRight, FileText, ArrowRight
} from 'lucide-react';
import { mockEmployees } from '../data/mockData';

export function StatutoryBracketsPage() {
  const [searchParams] = useSearchParams();
  const initialSalaryParam = searchParams.get('salary');
  const initialEmpIdParam = searchParams.get('employeeId') || '';
  const parsedSalary = initialSalaryParam ? parseFloat(initialSalaryParam) : 48000;

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation Strip */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <Link to="/payroll" className="hover:text-blue-600 transition-colors">Payroll Hub</Link>
          <span>/</span>
          <Link to="/contributions" className="hover:text-blue-600 transition-colors">Government Contributions</Link>
          <span>/</span>
          <span className="font-semibold text-slate-800">Statutory Bracket Calculator</span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/net-to-gross"
            className="flex items-center gap-1.5 text-slate-600 hover:text-emerald-700 font-medium"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-emerald-600" />
            Net-to-Gross Reverse Calc
          </Link>
          <span className="text-slate-300">•</span>
          <Link
            to="/thirteenth-month"
            className="flex items-center gap-1.5 text-slate-600 hover:text-amber-700 font-medium"
          >
            <Scale className="w-3.5 h-3.5 text-amber-600" />
            13th-Month Pay (PD 851)
          </Link>
        </div>
      </div>

      {/* Main Interactive Statutory Bracket Calculator Component */}
      <StatutoryBracketCalculator
        initialSalary={!isNaN(parsedSalary) ? parsedSalary : 48000}
        initialEmployeeId={initialEmpIdParam}
      />
    </div>
  );
}
