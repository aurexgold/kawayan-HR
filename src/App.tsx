/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Employees } from './pages/Employees';
import { Payroll } from './pages/Payroll';
import { Leaves } from './pages/Leaves';
import { Recruitment } from './pages/Recruitment';
import { Onboarding } from './pages/Onboarding';
import { Attendance } from './pages/Attendance';
import { Performance } from './pages/Performance';
import { Learning } from './pages/Learning';
import { Holidays } from './pages/Holidays';
import { TaxCalculator2316Page } from './pages/TaxCalculator2316Page';
import { Loans } from './pages/Loans';
import { Handbook } from './pages/Handbook';
import { SelfService } from './pages/SelfService';
import { HmoManagement } from './pages/HmoManagement';
import { ComplianceAssistant } from './pages/ComplianceAssistant';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="self-service" element={<SelfService />} />
          <Route path="registry" element={<Employees />} />
          <Route path="recruitment" element={<Recruitment />} />
          <Route path="onboarding" element={<Onboarding />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="leaves" element={<Leaves />} />
          <Route path="holidays" element={<Holidays />} />
          <Route path="payroll" element={<Payroll />} />
          <Route path="hmo" element={<HmoManagement />} />
          <Route path="loans" element={<Loans />} />
          <Route path="tax-calculator" element={<TaxCalculator2316Page />} />
          <Route path="handbook" element={<Handbook />} />
          <Route path="compliance" element={<ComplianceAssistant />} />
          <Route path="performance" element={<Performance />} />
          <Route path="learning" element={<Learning />} />
        </Route>
      </Routes>
    </Router>
  );
}

