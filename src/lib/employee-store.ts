import { useState, useEffect } from 'react';
import { Employee } from '../types';
import { mockEmployees as defaultMockEmployees } from '../data/mockData';

const STORAGE_KEY = 'kawayan_hr_employees_v1';
const EVENT_NAME = 'kawayan_employees_changed';

/**
 * Loads employee registry from local storage or seeds with default mock data
 */
export function getStoredEmployees(): Employee[] {
  if (typeof window === 'undefined') {
    return defaultMockEmployees;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultMockEmployees));
      return defaultMockEmployees;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Sync with in-memory defaultMockEmployees so direct imports also see new items
      syncInMemoryMockEmployees(parsed);
      return parsed;
    }
  } catch (err) {
    console.error('Failed to load employees from localStorage:', err);
  }
  return defaultMockEmployees;
}

/**
 * Keeps the in-memory array in sync for modules that import defaultMockEmployees directly
 */
function syncInMemoryMockEmployees(latestList: Employee[]) {
  if (!defaultMockEmployees) return;
  // Clear and push to mutate existing array reference
  defaultMockEmployees.length = 0;
  defaultMockEmployees.push(...latestList);
}

/**
 * Saves employees to localStorage, syncs memory, and emits change event
 */
export function saveEmployeesToStorage(employees: Employee[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
    syncInMemoryMockEmployees(employees);
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: employees }));
  } catch (err) {
    console.error('Failed to save employees to localStorage:', err);
  }
}

/**
 * Subscribes to employee changes across components and browser tabs
 */
export function subscribeToEmployees(callback: (employees: Employee[]) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleCustomEvent = (e: Event) => {
    const customEvent = e as CustomEvent<Employee[]>;
    callback(customEvent.detail || getStoredEmployees());
  };

  const handleStorageEvent = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      callback(getStoredEmployees());
    }
  };

  window.addEventListener(EVENT_NAME, handleCustomEvent);
  window.addEventListener('storage', handleStorageEvent);

  return () => {
    window.removeEventListener(EVENT_NAME, handleCustomEvent);
    window.removeEventListener('storage', handleStorageEvent);
  };
}

/**
 * Adds a new employee or updates an existing one
 */
export function saveEmployee(employeeData: Partial<Employee> & { firstName: string; lastName: string }): Employee {
  const currentList = getStoredEmployees();
  const isExisting = Boolean(employeeData.id && currentList.some(e => e.id === employeeData.id));

  let finalEmployee: Employee;

  if (isExisting) {
    finalEmployee = {
      ...(currentList.find(e => e.id === employeeData.id)!),
      ...employeeData,
    } as Employee;

    const updated = currentList.map(e => (e.id === finalEmployee.id ? finalEmployee : e));
    saveEmployeesToStorage(updated);
  } else {
    // Generate new ID
    const nextNum = currentList.length + 1;
    const generatedId = employeeData.id || `emp-${String(nextNum).padStart(3, '0')}-${Date.now().toString().slice(-4)}`;

    finalEmployee = {
      id: generatedId,
      firstName: employeeData.firstName.trim(),
      lastName: employeeData.lastName.trim(),
      middleName: employeeData.middleName || '',
      email: employeeData.email || `${employeeData.firstName.toLowerCase()}.${employeeData.lastName.toLowerCase()}@kawayanhr.ph`,
      phone: employeeData.phone || '0917-123-4567',
      role: employeeData.role || 'Associate Specialist',
      department: employeeData.department || 'Operations',
      employmentType: employeeData.employmentType || 'Regular',
      status: employeeData.status || 'Active',
      joinDate: employeeData.joinDate || new Date().toISOString().split('T')[0],
      basicSalary: Number(employeeData.basicSalary) || 30000,
      allowance: Number(employeeData.allowance) || 2000,
      tin: employeeData.tin || '000-000-000-000',
      sssNumber: employeeData.sssNumber || '04-0000000-0',
      philhealthNumber: employeeData.philhealthNumber || '12-000000000-0',
      pagibigNumber: employeeData.pagibigNumber || '0000-0000-0000',
      hmoPlan: employeeData.hmoPlan || 'Maxicare Standard Silver',
      hmoEnrolled: employeeData.hmoEnrolled ?? true,
      leaveBalances: employeeData.leaveBalances || {
        sil: 5,
        sick: 10,
        vacation: 12,
        parental: 0,
      },
    };

    const updated = [finalEmployee, ...currentList];
    saveEmployeesToStorage(updated);
  }

  return finalEmployee;
}

/**
 * Removes an employee from registry
 */
export function deleteEmployee(id: string): boolean {
  const currentList = getStoredEmployees();
  const filtered = currentList.filter(e => e.id !== id);
  if (filtered.length !== currentList.length) {
    saveEmployeesToStorage(filtered);
    return true;
  }
  return false;
}

/**
 * Resets the registry back to factory mock employees
 */
export function resetEmployeeRegistry(): Employee[] {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
  saveEmployeesToStorage(defaultMockEmployees);
  return defaultMockEmployees;
}

/**
 * React hook for consuming and updating employee registry
 */
export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>(() => getStoredEmployees());

  useEffect(() => {
    // Initial fetch
    setEmployees(getStoredEmployees());
    // Subscribe to any updates across components
    const unsubscribe = subscribeToEmployees((updated) => {
      setEmployees([...updated]);
    });
    return unsubscribe;
  }, []);

  const handleSave = (emp: Partial<Employee> & { firstName: string; lastName: string }) => {
    const saved = saveEmployee(emp);
    setEmployees(getStoredEmployees());
    return saved;
  };

  const handleDelete = (id: string) => {
    const success = deleteEmployee(id);
    if (success) {
      setEmployees(getStoredEmployees());
    }
    return success;
  };

  const handleReset = () => {
    const defaults = resetEmployeeRegistry();
    setEmployees([...defaults]);
  };

  return {
    employees,
    saveEmployee: handleSave,
    deleteEmployee: handleDelete,
    resetRegistry: handleReset,
  };
}

/**
 * Philippine Onboarding Presets for 1-click rapid data entry
 */
export interface OnboardingPreset {
  title: string;
  badge: string;
  role: string;
  department: string;
  employmentType: 'Regular' | 'Probationary' | 'Project-Based' | 'Executive' | 'Consultant';
  basicSalary: number;
  allowance: number;
  tin: string;
  sssNumber: string;
  philhealthNumber: string;
  pagibigNumber: string;
  hmoPlan: string;
}

export const ONBOARDING_PRESETS: OnboardingPreset[] = [
  {
    title: 'Senior Software Engineer (Regular)',
    badge: 'Tech / Regular',
    role: 'Senior Software Engineer',
    department: 'Engineering',
    employmentType: 'Regular',
    basicSalary: 75000,
    allowance: 3500,
    tin: '321-654-987-000',
    sssNumber: '04-8901234-5',
    philhealthNumber: '12-987654321-5',
    pagibigNumber: '3210-9876-5432',
    hmoPlan: 'Maxicare Comprehensive Platinum',
  },
  {
    title: 'Marketing Specialist (Probationary 6-Mo)',
    badge: 'Marketing / 6-Month',
    role: 'Digital Marketing Specialist',
    department: 'Marketing',
    employmentType: 'Probationary',
    basicSalary: 38000,
    allowance: 2000,
    tin: '456-789-123-000',
    sssNumber: '04-2345678-9',
    philhealthNumber: '12-234567890-1',
    pagibigNumber: '2345-6789-0123',
    hmoPlan: 'Intellicare Silver Core',
  },
  {
    title: 'Project Lead Architect (DO 174 Project)',
    badge: 'Operations / Project',
    role: 'Project Solutions Architect',
    department: 'Operations',
    employmentType: 'Project-Based',
    basicSalary: 62000,
    allowance: 4000,
    tin: '789-123-456-000',
    sssNumber: '04-5678901-2',
    philhealthNumber: '12-567890123-4',
    pagibigNumber: '5678-9012-3456',
    hmoPlan: 'PhilCare Enterprise Gold',
  },
  {
    title: 'VP of Commercial Strategy (Executive)',
    badge: 'Executive / Art. 82',
    role: 'VP of Commercial Strategy',
    department: 'Executive',
    employmentType: 'Executive',
    basicSalary: 135000,
    allowance: 10000,
    tin: '654-321-987-000',
    sssNumber: '04-9012345-6',
    philhealthNumber: '12-901234567-8',
    pagibigNumber: '9012-3456-7890',
    hmoPlan: 'Maxicare Executive Diamond',
  },
  {
    title: 'Senior Tax & Labor Counsel (Consultant)',
    badge: 'Legal / BIR 2307',
    role: 'Statutory Labor & Tax Counsel',
    department: 'Human Resources',
    employmentType: 'Consultant',
    basicSalary: 55000,
    allowance: 0,
    tin: '987-123-456-000',
    sssNumber: '04-3456789-0',
    philhealthNumber: '12-345678901-2',
    pagibigNumber: '3456-7890-1234',
    hmoPlan: 'Non-Enrolled (Direct EWT)',
  },
];

/**
 * Exports current employee registry to downloadable CSV format
 */
export function exportEmployeesToCsv(employees: Employee[]): void {
  const headers = [
    'Employee ID',
    'Full Name',
    'Email',
    'Phone',
    'Department',
    'Role',
    'Employment Type',
    'Status',
    'Join Date',
    'Basic Monthly Salary (PHP)',
    'Allowance (PHP)',
    'TIN',
    'SSS Number',
    'PhilHealth Number',
    'Pag-IBIG Number',
    'HMO Plan',
    'SIL Balance',
    'Sick Leave',
    'Vacation Leave',
    'Parental Leave',
  ];

  const rows = employees.map(e => [
    `"${e.id}"`,
    `"${e.firstName} ${e.middleName ? e.middleName + ' ' : ''}${e.lastName}"`,
    `"${e.email}"`,
    `"${e.phone || 'N/A'}"`,
    `"${e.department}"`,
    `"${e.role}"`,
    `"${e.employmentType || 'Regular'}"`,
    `"${e.status}"`,
    `"${e.joinDate}"`,
    e.basicSalary.toFixed(2),
    (e.allowance || 0).toFixed(2),
    `"${e.tin}"`,
    `"${e.sssNumber}"`,
    `"${e.philhealthNumber}"`,
    `"${e.pagibigNumber}"`,
    `"${e.hmoPlan || 'None'}"`,
    e.leaveBalances?.sil ?? 5,
    e.leaveBalances?.sick ?? 10,
    e.leaveBalances?.vacation ?? 12,
    e.leaveBalances?.parental ?? 0,
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Kawayan_HR_Employee_Registry_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
