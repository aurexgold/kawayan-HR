import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FileDown, Plus, X, Calendar, User, Briefcase, FileText, 
  Calculator, Landmark, FileCheck, ShieldCheck, HeartPulse, 
  Search, Filter, Trash2, Edit3, Eye, CheckCircle2, AlertTriangle, 
  RotateCcw, DollarSign, Users, Award, Building2, ChevronRight, Phone, Mail
} from 'lucide-react';
import { Employee } from '../types';
import { useEmployees, exportEmployeesToCsv } from '../lib/employee-store';
import { calculateEmployeeMonthlyLoanDeductions } from '../lib/loans';
import { validateGovernmentId } from '../lib/statutory-compliance';
import { calculateSSS, calculatePhilHealth, calculatePagIBIG, calculateWithholdingTax } from '../lib/ph-payroll';
import { AddEditEmployeeModal } from '../components/employees/AddEditEmployeeModal';

export function Employees() {
  const navigate = useNavigate();
  const { employees, saveEmployee, deleteEmployee, resetRegistry } = useEmployees();

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [complianceFilter, setComplianceFilter] = useState('ALL');

  // View Mode: Roster, Statutory Matrix, or Leave Balances
  const [viewMode, setViewMode] = useState<'roster' | 'statutory' | 'leaves'>('roster');

  // Modals & Drawers
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);

  // Departments list for filter
  const departments = useMemo(() => {
    const set = new Set(employees.map(e => e.department));
    return Array.from(set).sort();
  }, [employees]);

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
      const role = emp.role.toLowerCase();
      const dept = emp.department.toLowerCase();
      const email = emp.email.toLowerCase();
      const search = searchTerm.toLowerCase();

      const matchesSearch = fullName.includes(search) || role.includes(search) || dept.includes(search) || email.includes(search);
      const matchesDept = departmentFilter === 'ALL' || emp.department === departmentFilter;
      const matchesStatus = statusFilter === 'ALL' || emp.status === statusFilter;

      let matchesCompliance = true;
      if (complianceFilter === 'COMPLIANT') {
        const sss = validateGovernmentId(emp.sssNumber, 'SSS').isValid;
        const ph = validateGovernmentId(emp.philhealthNumber, 'PHILHEALTH').isValid;
        const hdmf = validateGovernmentId(emp.pagibigNumber, 'PAGIBIG').isValid;
        matchesCompliance = sss && ph && hdmf;
      } else if (complianceFilter === 'FLAGGED') {
        const sss = validateGovernmentId(emp.sssNumber, 'SSS').isValid;
        const ph = validateGovernmentId(emp.philhealthNumber, 'PHILHEALTH').isValid;
        const hdmf = validateGovernmentId(emp.pagibigNumber, 'PAGIBIG').isValid;
        matchesCompliance = !sss || !ph || !hdmf;
      }

      return matchesSearch && matchesDept && matchesStatus && matchesCompliance;
    });
  }, [employees, searchTerm, departmentFilter, statusFilter, complianceFilter]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const totalStaff = employees.length;
    const activeStaff = employees.filter(e => e.status === 'Active').length;
    const totalMonthlyPayroll = employees.reduce((sum, e) => sum + e.basicSalary, 0);

    let fullyCompliantCount = 0;
    employees.forEach(emp => {
      const sss = validateGovernmentId(emp.sssNumber, 'SSS').isValid;
      const ph = validateGovernmentId(emp.philhealthNumber, 'PHILHEALTH').isValid;
      const hdmf = validateGovernmentId(emp.pagibigNumber, 'PAGIBIG').isValid;
      if (sss && ph && hdmf) fullyCompliantCount++;
    });

    const complianceRate = totalStaff > 0 ? Math.round((fullyCompliantCount / totalStaff) * 100) : 100;
    const hmoCount = employees.filter(e => e.hmoEnrolled !== false).length;

    return {
      totalStaff,
      activeStaff,
      totalMonthlyPayroll,
      complianceRate,
      hmoCount,
    };
  }, [employees]);

  // Handlers
  const handleOpenAdd = () => {
    setEmployeeToEdit(null);
    setIsAddEditModalOpen(true);
  };

  const handleOpenEdit = (emp: Employee) => {
    setEmployeeToEdit(emp);
    setIsAddEditModalOpen(true);
  };

  const handleDeleteEmployee = (emp: Employee) => {
    const confirmed = window.confirm(`Are you sure you want to remove ${emp.firstName} ${emp.lastName} from the personnel registry?`);
    if (confirmed) {
      deleteEmployee(emp.id);
      if (selectedEmployee?.id === emp.id) {
        setSelectedEmployee(null);
      }
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Personnel Registry & Directory</h1>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
              {metrics.totalStaff} Staff Records
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Central Philippine employee database integrating statutory registrations, employment agreements, compensation, and benefits.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/contracts"
            className="flex items-center px-3.5 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 hover:text-blue-600 transition-colors shadow-2xs"
          >
            <FileCheck className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
            Contracts Generator
          </Link>
          <Link
            to="/contributions"
            className="flex items-center px-3.5 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 hover:text-emerald-600 transition-colors shadow-2xs"
          >
            <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
            Contributions Audit
          </Link>
          <button
            onClick={() => exportEmployeesToCsv(employees)}
            className="flex items-center px-3.5 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
            title="Download full registry in CSV format"
          >
            <FileDown className="w-3.5 h-3.5 mr-1.5 text-slate-600" />
            Export CSV
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Employee
          </button>
        </div>
      </div>

      {/* Aggregate KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Workforce</div>
            <div className="text-xl font-bold text-slate-900 mt-1">
              {metrics.activeStaff} <span className="text-xs font-normal text-slate-500">/ {metrics.totalStaff} total</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Base Payroll Burden</div>
            <div className="text-xl font-bold text-slate-900 mt-1 font-mono">
              ₱{metrics.totalMonthlyPayroll.toLocaleString()}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Statutory Compliance</div>
            <div className="text-xl font-bold text-emerald-700 mt-1">
              {metrics.complianceRate}% <span className="text-xs font-normal text-slate-500">verified</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">HMO Enrolled Staff</div>
            <div className="text-xl font-bold text-slate-900 mt-1">
              {metrics.hmoCount} <span className="text-xs font-normal text-slate-500">covered</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
            <HeartPulse className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Combined Registry Card */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden flex flex-col">
        
        {/* Navigation Tabs & Toolbar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 bg-slate-200/60 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('roster')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                viewMode === 'roster'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Personnel Roster ({filteredEmployees.length})
            </button>
            <button
              onClick={() => setViewMode('statutory')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                viewMode === 'statutory'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Statutory & Compensation Matrix
            </button>
            <button
              onClick={() => setViewMode('leaves')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                viewMode === 'leaves'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Leave Balances & Benefits
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, role, email..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Filter Bar */}
        <div className="px-4 py-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs bg-white">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-400 font-semibold flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filters:
            </span>

            {/* Department Filter */}
            <select
              value={departmentFilter}
              onChange={e => setDepartmentFilter(e.target.value)}
              className="px-2.5 py-1 text-xs border border-slate-200 rounded-md bg-white text-slate-700 font-medium"
            >
              <option value="ALL">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-2.5 py-1 text-xs border border-slate-200 rounded-md bg-white text-slate-700 font-medium"
            >
              <option value="ALL">All Statuses</option>
              <option value="Active">Active Duty</option>
              <option value="On Leave">On Leave</option>
              <option value="Terminated">Separated</option>
            </select>

            {/* Statutory Compliance Filter */}
            <select
              value={complianceFilter}
              onChange={e => setComplianceFilter(e.target.value)}
              className="px-2.5 py-1 text-xs border border-slate-200 rounded-md bg-white text-slate-700 font-medium"
            >
              <option value="ALL">All Compliance</option>
              <option value="COMPLIANT">Fully Compliant IDs</option>
              <option value="FLAGGED">Flagged / Incomplete IDs</option>
            </select>

            {(departmentFilter !== 'ALL' || statusFilter !== 'ALL' || complianceFilter !== 'ALL' || searchTerm !== '') && (
              <button
                onClick={() => {
                  setDepartmentFilter('ALL');
                  setStatusFilter('ALL');
                  setComplianceFilter('ALL');
                  setSearchTerm('');
                }}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold px-2 py-1"
              >
                Clear Filters
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (window.confirm('Reset all employee records to default factory seed data? Any new additions will be replaced.')) {
                  resetRegistry();
                }
              }}
              className="text-[11px] text-slate-400 hover:text-slate-600 flex items-center gap-1 transition-colors"
              title="Reset data back to initial mock records"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Defaults
            </button>
          </div>
        </div>

        {/* TAB 1: PERSONNEL ROSTER VIEW */}
        {viewMode === 'roster' && (
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left">
              <thead className="bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3">Employee Details</th>
                  <th className="px-5 py-3">Role & Dept</th>
                  <th className="px-5 py-3">Tenure / Archetype</th>
                  <th className="px-5 py-3">Base Compensation</th>
                  <th className="px-5 py-3">Statutory IDs</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-slate-100">
                {filteredEmployees.map(emp => {
                  const sssVal = validateGovernmentId(emp.sssNumber, 'SSS');
                  const phVal = validateGovernmentId(emp.philhealthNumber, 'PHILHEALTH');
                  const hdmfVal = validateGovernmentId(emp.pagibigNumber, 'PAGIBIG');
                  const tinVal = validateGovernmentId(emp.tin, 'TIN');
                  const allValid = sssVal.isValid && phVal.isValid && hdmfVal.isValid && tinVal.isValid;

                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Name & Contact */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                            {emp.firstName[0]}{emp.lastName[0]}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 hover:text-blue-600 cursor-pointer" onClick={() => setSelectedEmployee(emp)}>
                              {emp.firstName} {emp.middleName ? `${emp.middleName} ` : ''}{emp.lastName}
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                              <span>{emp.email}</span>
                              {emp.phone && <span className="text-slate-400">• {emp.phone}</span>}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role & Dept */}
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-800">{emp.role}</div>
                        <div className="text-[11px] text-slate-500">{emp.department}</div>
                      </td>

                      {/* Tenure / Archetype */}
                      <td className="px-5 py-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          emp.employmentType === 'Executive' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                          emp.employmentType === 'Probationary' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                          emp.employmentType === 'Project-Based' ? 'bg-cyan-100 text-cyan-800 border border-cyan-200' :
                          emp.employmentType === 'Consultant' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                          'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}>
                          {emp.employmentType || 'Regular'}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">Joined {emp.joinDate}</div>
                      </td>

                      {/* Base Compensation */}
                      <td className="px-5 py-3.5 font-mono">
                        <div className="font-bold text-slate-900">₱{emp.basicSalary.toLocaleString()}</div>
                        {emp.allowance ? (
                          <div className="text-[10px] text-slate-500">+₱{emp.allowance.toLocaleString()} allowance</div>
                        ) : null}
                      </td>

                      {/* Statutory IDs */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <span 
                            title={`SSS: ${emp.sssNumber} (${sssVal.isValid ? 'Valid' : sssVal.issue})`}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                              sssVal.isValid ? 'bg-slate-100 text-slate-700' : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}
                          >
                            SSS
                          </span>
                          <span 
                            title={`PhilHealth: ${emp.philhealthNumber} (${phVal.isValid ? 'Valid' : phVal.issue})`}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                              phVal.isValid ? 'bg-slate-100 text-slate-700' : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}
                          >
                            PH
                          </span>
                          <span 
                            title={`Pag-IBIG: ${emp.pagibigNumber} (${hdmfVal.isValid ? 'Valid' : hdmfVal.issue})`}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                              hdmfVal.isValid ? 'bg-slate-100 text-slate-700' : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}
                          >
                            HDMF
                          </span>
                          <span 
                            title={`TIN: ${emp.tin} (${tinVal.isValid ? 'Valid' : tinVal.issue})`}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                              tinVal.isValid ? 'bg-slate-100 text-slate-700' : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}
                          >
                            TIN
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          emp.status === 'Active' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                          emp.status === 'On Leave' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                          'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {emp.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right space-x-1">
                        <button
                          onClick={() => setSelectedEmployee(emp)}
                          className="px-2.5 py-1 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded text-xs font-semibold transition-colors"
                          title="View 360° Employee Dossier"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleOpenEdit(emp)}
                          className="px-2.5 py-1 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded text-xs font-semibold transition-colors"
                          title="Edit Employee Information"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => navigate(`/contracts?empId=${emp.id}`)}
                          className="px-2.5 py-1 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded text-xs font-semibold transition-colors"
                          title="Generate Labor Code Employment Agreement"
                        >
                          Contract
                        </button>
                        <button
                          onClick={() => handleDeleteEmployee(emp)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors inline-flex items-center"
                          title="Delete Employee"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {filteredEmployees.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                      <div className="max-w-sm mx-auto space-y-2">
                        <Users className="w-8 h-8 text-slate-300 mx-auto" />
                        <div className="font-semibold text-slate-700">No employees match criteria</div>
                        <p className="text-xs text-slate-400">Try broadening your search term or clearing active filters.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: STATUTORY & COMPENSATION MATRIX VIEW */}
        {viewMode === 'statutory' && (
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left">
              <thead className="bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3">Employee</th>
                  <th className="px-5 py-3">Basic Salary</th>
                  <th className="px-5 py-3">SSS (Regular + WISP)</th>
                  <th className="px-5 py-3">PhilHealth (5%)</th>
                  <th className="px-5 py-3">Pag-IBIG (Circular 460)</th>
                  <th className="px-5 py-3">Est. BIR Tax</th>
                  <th className="px-5 py-3">Take-Home Pay</th>
                  <th className="px-5 py-3 text-right">Audit</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-slate-100">
                {filteredEmployees.map(emp => {
                  const sss = calculateSSS(emp.basicSalary);
                  const ph = calculatePhilHealth(emp.basicSalary);
                  const hdmf = calculatePagIBIG(emp.basicSalary);
                  const taxableSalary = Math.max(0, emp.basicSalary - (sss.totalEE + ph.eeShare + hdmf.eeShare));
                  const taxResult = calculateWithholdingTax(taxableSalary);
                  const tax = taxResult.tax;
                  const allowance = emp.allowance || 0;
                  const netTakeHome = emp.basicSalary + allowance - (sss.totalEE + ph.eeShare + hdmf.eeShare + tax);

                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-slate-900">{emp.firstName} {emp.lastName}</div>
                        <div className="text-[11px] text-slate-500">{emp.role}</div>
                      </td>
                      <td className="px-5 py-3.5 font-mono font-bold text-slate-900">
                        ₱{emp.basicSalary.toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-[11px]">
                        <span className="font-semibold text-blue-700">₱{sss.totalEE.toFixed(2)} EE</span>
                        <span className="text-slate-400"> / ₱{sss.totalER.toFixed(2)} ER</span>
                        {sss.wispEE > 0 && <span className="text-[10px] text-indigo-600 block">WISP Mandated</span>}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-[11px]">
                        <span className="font-semibold text-emerald-700">₱{ph.eeShare.toFixed(2)} EE</span>
                        <span className="text-slate-400"> / ₱{ph.erShare.toFixed(2)} ER</span>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-[11px]">
                        <span className="font-semibold text-amber-700">₱{hdmf.eeShare.toFixed(2)} EE</span>
                        <span className="text-slate-400"> / ₱{hdmf.erShare.toFixed(2)} ER</span>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-[11px] font-bold text-slate-700">
                        ₱{tax.toFixed(2)}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-xs font-bold text-emerald-700">
                        ₱{netTakeHome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => navigate('/contributions')}
                          className="px-2.5 py-1 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded text-xs font-semibold transition-colors"
                        >
                          Verify Audit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: LEAVE BALANCES & BENEFITS */}
        {viewMode === 'leaves' && (
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left">
              <thead className="bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3">Employee</th>
                  <th className="px-5 py-3 text-center">SIL (Art. 95)</th>
                  <th className="px-5 py-3 text-center">Sick Leave</th>
                  <th className="px-5 py-3 text-center">Vacation Leave</th>
                  <th className="px-5 py-3 text-center">Parental</th>
                  <th className="px-5 py-3">Assigned HMO Plan</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-slate-100">
                {filteredEmployees.map(emp => (
                  <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-900">{emp.firstName} {emp.lastName}</div>
                      <div className="text-[11px] text-slate-500">{emp.department}</div>
                    </td>
                    <td className="px-5 py-3.5 text-center font-bold text-blue-700 font-mono">
                      {emp.leaveBalances?.sil ?? 5}d
                    </td>
                    <td className="px-5 py-3.5 text-center font-bold text-emerald-700 font-mono">
                      {emp.leaveBalances?.sick ?? 10}d
                    </td>
                    <td className="px-5 py-3.5 text-center font-bold text-amber-700 font-mono">
                      {emp.leaveBalances?.vacation ?? 12}d
                    </td>
                    <td className="px-5 py-3.5 text-center font-bold text-purple-700 font-mono">
                      {emp.leaveBalances?.parental ?? 0}d
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                        <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
                        <span>{emp.hmoPlan || 'Maxicare Standard Silver'}</span>
                      </div>
                      <span className="text-[10px] text-emerald-600 font-bold">100% Employer Subsidized</span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => handleOpenEdit(emp)}
                        className="px-2.5 py-1 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded text-xs font-semibold"
                      >
                        Adjust Credits
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* 360° EMPLOYEE DOSSIER DRAWER */}
      {selectedEmployee && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh] border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-slate-900 text-white z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 text-xl font-bold">
                  {selectedEmployee.firstName[0]}{selectedEmployee.lastName[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-white tracking-tight">
                      {selectedEmployee.firstName} {selectedEmployee.middleName ? `${selectedEmployee.middleName} ` : ''}{selectedEmployee.lastName}
                    </h2>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-500/30 text-blue-300 border border-blue-400/30">
                      {selectedEmployee.employmentType || 'Regular'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{selectedEmployee.email} • {selectedEmployee.role}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedEmployee(null)}
                className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              
              {/* Professional & Contact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                  <h3 className="font-bold text-slate-800 uppercase text-[11px] tracking-wider flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-blue-600" /> Employment Details
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                      <span className="text-slate-500">Department</span>
                      <span className="font-semibold text-slate-900">{selectedEmployee.department}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                      <span className="text-slate-500">Job Role</span>
                      <span className="font-semibold text-slate-900">{selectedEmployee.role}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                      <span className="text-slate-500">Tenure Status</span>
                      <span className="font-semibold text-slate-900">{selectedEmployee.status}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                      <span className="text-slate-500">Join Date</span>
                      <span className="font-semibold text-slate-900">{selectedEmployee.joinDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Base Salary</span>
                      <span className="font-bold text-slate-900 font-mono">₱{selectedEmployee.basicSalary.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                  <h3 className="font-bold text-slate-800 uppercase text-[11px] tracking-wider flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" /> Statutory Registrations
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                      <span className="text-slate-500">BIR TIN</span>
                      <span className="font-mono font-semibold text-slate-900">{selectedEmployee.tin}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                      <span className="text-slate-500">SSS Number</span>
                      <span className="font-mono font-semibold text-slate-900">{selectedEmployee.sssNumber}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                      <span className="text-slate-500">PhilHealth PIN</span>
                      <span className="font-mono font-semibold text-slate-900">{selectedEmployee.philhealthNumber}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                      <span className="text-slate-500">Pag-IBIG MID</span>
                      <span className="font-mono font-semibold text-slate-900">{selectedEmployee.pagibigNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">HMO Plan</span>
                      <span className="font-semibold text-slate-900">{selectedEmployee.hmoPlan || 'Maxicare Standard'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Leave Balances Grid */}
              <div>
                <h3 className="font-bold text-slate-800 uppercase text-[11px] tracking-wider mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" /> Leave Balances & Entitlements
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                    <span className="text-xl font-bold text-blue-600 block">{selectedEmployee.leaveBalances?.sil ?? 5}</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Service Incentive</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                    <span className="text-xl font-bold text-emerald-600 block">{selectedEmployee.leaveBalances?.sick ?? 10}</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Sick Leave</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                    <span className="text-xl font-bold text-amber-600 block">{selectedEmployee.leaveBalances?.vacation ?? 12}</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Vacation Leave</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                    <span className="text-xl font-bold text-purple-600 block">{selectedEmployee.leaveBalances?.parental ?? 0}</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Parental</span>
                  </div>
                </div>
              </div>

              {/* Active Salary Loans & Amortizations */}
              {(() => {
                const loanData = calculateEmployeeMonthlyLoanDeductions(selectedEmployee.id);
                return (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-bold text-slate-800 uppercase text-[11px] tracking-wider flex items-center gap-2">
                        <Landmark className="w-4 h-4 text-blue-600" /> Active Salary Loans ({loanData.activeLoansCount})
                      </h3>
                      <button
                        onClick={() => {
                          setSelectedEmployee(null);
                          navigate('/loans');
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                      >
                        Manage in Loans &rarr;
                      </button>
                    </div>

                    {loanData.activeLoansCount > 0 ? (
                      <div className="space-y-2">
                        {loanData.items.map(loan => (
                          <div key={loan.loanId} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  loan.agency === 'SSS' ? 'bg-blue-100 text-blue-800' :
                                  loan.agency === 'Pag-IBIG' ? 'bg-amber-100 text-amber-800' :
                                  'bg-emerald-100 text-emerald-800'
                                }`}>
                                  {loan.agency}
                                </span>
                                <span className="font-semibold text-slate-800">{loan.loanName}</span>
                              </div>
                              <div className="text-[11px] text-slate-500 font-mono mt-0.5">Ref: {loan.referenceNo}</div>
                            </div>
                            <div className="text-right">
                              <span className="font-bold text-rose-600 font-mono block">
                                -₱{loan.monthlyAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}/mo
                              </span>
                              <span className="text-[11px] text-slate-500 font-mono">
                                Bal: ₱{loan.remainingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-slate-500 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                        No active salary loans or pending amortizations recorded for this employee.
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
            
            {/* Drawer Action Bar */}
            <div className="p-5 border-t border-slate-100 bg-slate-50 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => {
                    const emp = selectedEmployee;
                    setSelectedEmployee(null);
                    handleOpenEdit(emp);
                  }}
                  className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                  Edit Record
                </button>
                <button 
                  onClick={() => {
                    navigate(`/contracts?empId=${selectedEmployee.id}`);
                  }}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <FileCheck className="w-3.5 h-3.5" />
                  Generate Contract
                </button>
                <button 
                  onClick={() => {
                    navigate('/contributions');
                  }}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Audit Contributions
                </button>
              </div>

              <button 
                onClick={() => setSelectedEmployee(null)}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT EMPLOYEE MODAL */}
      <AddEditEmployeeModal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        initialEmployee={employeeToEdit}
        onSave={(empData) => {
          const saved = saveEmployee(empData);
          if (selectedEmployee?.id === saved.id) {
            setSelectedEmployee(saved);
          }
          return saved;
        }}
      />

    </div>
  );
}
