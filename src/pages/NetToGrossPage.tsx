import React from 'react';
import { NetToGrossCalculator } from '../components/payroll/NetToGrossCalculator';

export function NetToGrossPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <NetToGrossCalculator initialTargetNet={60000} />
    </div>
  );
}
