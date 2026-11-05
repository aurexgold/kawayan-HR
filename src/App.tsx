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
import { Bir2307Page } from './pages/Bir2307Page';
import { DigitalSignaturesPage } from './pages/DigitalSignaturesPage';
import { ContractsPage } from './pages/ContractsPage';
import { ContributionsCompliancePage } from './pages/ContributionsCompliancePage';
import { NetToGrossPage } from './pages/NetToGrossPage';
import { ThirteenthMonthPage } from './pages/ThirteenthMonthPage';
import { StatutoryBracketsPage } from './pages/StatutoryBracketsPage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="self-service" element={<SelfService />} />
          <Route path="registry" element={<Employees />} />
          <Route path="contracts" element={<ContractsPage />} />
          <Route path="recruitment" element={<Recruitment />} />
          <Route path="onboarding" element={<Onboarding />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="leaves" element={<Leaves />} />
          <Route path="holidays" element={<Holidays />} />
          <Route path="payroll" element={<Payroll />} />
          <Route path="net-to-gross" element={<NetToGrossPage />} />
          <Route path="thirteenth-month" element={<ThirteenthMonthPage />} />
          <Route path="13th-month" element={<ThirteenthMonthPage />} />
          <Route path="statutory-brackets" element={<StatutoryBracketsPage />} />
          <Route path="contribution-brackets" element={<StatutoryBracketsPage />} />
          <Route path="contributions" element={<ContributionsCompliancePage />} />
          <Route path="hmo" element={<HmoManagement />} />
          <Route path="loans" element={<Loans />} />
          <Route path="tax-calculator" element={<TaxCalculator2316Page />} />
          <Route path="tax-2307" element={<Bir2307Page />} />
          <Route path="signatures" element={<DigitalSignaturesPage />} />
          <Route path="handbook" element={<Handbook />} />
          <Route path="compliance" element={<ComplianceAssistant />} />
          <Route path="performance" element={<Performance />} />
          <Route path="learning" element={<Learning />} />
        </Route>
      </Routes>
    </Router>
  );
}

