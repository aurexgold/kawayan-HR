import React from 'react';
import { Form2316Result } from '../../lib/bir-2316';
import { Printer, Download, CheckCircle2, AlertCircle, Shield, Building, User } from 'lucide-react';

interface Bir2316DocumentProps {
  result: Form2316Result;
  onPrint?: () => void;
  onDownloadCsv?: () => void;
}

export function Bir2316Document({ result, onPrint, onDownloadCsv }: Bir2316DocumentProps) {
  const { input } = result;

  const formatPHP = (val: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
    }).format(val || 0);
  };

  const formatNumberOnly = (val: number) => {
    return (val || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="space-y-4">
      {/* Top action bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 font-bold">
            2316
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 text-sm">Official BIR Form No. 2316 Preview</h3>
            <p className="text-xs text-slate-500">
              Certificate of Compensation Payment / Tax Withheld • For Tax Year {result.taxYear}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onDownloadCsv && (
            <button
              onClick={onDownloadCsv}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-300 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Alphalist CSV
            </button>
          )}
          <button
            onClick={() => {
              if (onPrint) {
                onPrint();
              } else {
                window.print();
              }
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Form 2316
          </button>
        </div>
      </div>

      {/* Official Form Replica Container */}
      <div 
        id="bir-form-2316-printable"
        className="bg-white border-2 border-slate-800 rounded-lg p-6 sm:p-8 font-sans text-slate-900 text-xs shadow-md print:border-black print:p-2 print:shadow-none"
      >
        {/* Header Section */}
        <div className="border-b-2 border-slate-800 pb-4 mb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full border-2 border-blue-900 flex items-center justify-center bg-blue-50 text-blue-900 font-black text-sm tracking-tighter">
                BIR
              </div>
              <div>
                <div className="text-[10px] uppercase font-semibold text-slate-600 tracking-wider">Republic of the Philippines</div>
                <div className="text-sm font-bold uppercase tracking-tight text-slate-900">Department of Finance • Bureau of Internal Revenue</div>
                <div className="text-[11px] text-slate-700 italic">Certificate of Compensation Payment / Tax Withheld</div>
              </div>
            </div>

            <div className="text-right sm:border-l-2 sm:border-slate-800 sm:pl-6">
              <div className="text-lg font-black tracking-tight text-slate-900">BIR Form No. 2316</div>
              <div className="text-[10px] text-slate-600">Revised January 2018 (ENCS)</div>
              <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 border border-slate-300 rounded font-mono font-bold text-xs">
                Tax Year: <span className="text-blue-700">{result.taxYear}</span>
              </div>
            </div>
          </div>

          <div className="mt-3 text-[10px] text-slate-500 bg-slate-50 p-2 rounded border border-slate-200">
            For Compensation Payment With or Without Tax Withheld under RA 10963 (TRAIN Law). This certificate should be issued to each employee receiving compensation on or before January 31 of the succeeding calendar year.
          </div>
        </div>

        {/* Top Info Grid: Part I & Part II */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Part I: Employee Information */}
          <div className="border border-slate-700 rounded p-3 bg-slate-50/50">
            <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px] border-b border-slate-400 pb-1 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" />
                Part I - Employee Information
              </span>
              {result.isMWE && (
                <span className="bg-amber-100 text-amber-800 border border-amber-300 px-1.5 py-0.2 rounded text-[10px] font-bold">
                  MWE (Exempt)
                </span>
              )}
            </div>

            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between border-b border-dashed border-slate-300 pb-1">
                <span className="text-slate-500">1. Taxpayer ID No. (TIN):</span>
                <span className="font-mono font-bold text-slate-900">{input.tin || '000-000-000-000'}</span>
              </div>
              <div className="flex justify-between border-b border-dashed border-slate-300 pb-1">
                <span className="text-slate-500">2. Employee's Name:</span>
                <span className="font-semibold text-slate-900">{input.employeeName}</span>
              </div>
              <div className="flex justify-between border-b border-dashed border-slate-300 pb-1">
                <span className="text-slate-500">3. Registered Address:</span>
                <span className="font-medium text-slate-800 text-right max-w-[240px] truncate">{input.registeredAddress}</span>
              </div>
              <div className="flex justify-between border-b border-dashed border-slate-300 pb-1">
                <span className="text-slate-500">4. Minimum Wage Earner:</span>
                <span className="font-bold">{result.isMWE ? 'YES (Statutory Exempt)' : 'NO (Regular Taxable)'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Period Covered:</span>
                <span className="font-medium">Jan 1 to Dec 31 ({input.periodMonths} Months)</span>
              </div>
            </div>
          </div>

          {/* Part II: Present Employer Information */}
          <div className="border border-slate-700 rounded p-3 bg-slate-50/50">
            <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px] border-b border-slate-400 pb-1 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-blue-600" />
                Part II - Present Employer Information
              </span>
              <span className="text-[10px] font-mono text-slate-500">RDO Code: 043</span>
            </div>

            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between border-b border-dashed border-slate-300 pb-1">
                <span className="text-slate-500">5. Employer TIN:</span>
                <span className="font-mono font-bold text-slate-900">{input.employerTin || '009-876-543-000'}</span>
              </div>
              <div className="flex justify-between border-b border-dashed border-slate-300 pb-1">
                <span className="text-slate-500">6. Employer Name:</span>
                <span className="font-semibold text-slate-900">{input.employerName || 'Kawayan Cooperative HR Inc.'}</span>
              </div>
              <div className="flex justify-between border-b border-dashed border-slate-300 pb-1">
                <span className="text-slate-500">7. Registered Address:</span>
                <span className="font-medium text-slate-800 text-right max-w-[240px] truncate">
                  {input.employerAddress || 'Ayala Avenue, Makati City, Metro Manila'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">8. Type of Employer:</span>
                <span className="font-medium">Private / Cooperative (Withholding Agent)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Part IV-A: Summary Box */}
        <div className="border-2 border-blue-900 rounded-lg p-4 bg-blue-50/30 mb-6">
          <div className="font-bold text-blue-900 uppercase text-xs border-b border-blue-200 pb-1.5 mb-3 flex items-center justify-between">
            <span>Part IV-A — Summary of Compensation & Tax Withheld (Items 19 - 28)</span>
            <span className="text-[10px] text-blue-700 font-normal">Amounts in Philippine Peso (PHP)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-slate-200">
              <span className="text-slate-700">19. Gross Compensation Present Employer</span>
              <span className="font-bold font-mono text-slate-900">{formatPHP(result.item19_GrossCompensationPresent)}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-200">
              <span className="text-slate-700">24. Tax Due (under TRAIN Law)</span>
              <span className="font-bold font-mono text-blue-800">{formatPHP(result.item24_TaxDue)}</span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-200">
              <span className="text-slate-700">20. Less: Non-Taxable / Exempt Compensation</span>
              <span className="font-mono text-slate-800">({formatPHP(result.item20_TotalNonTaxable)})</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-200">
              <span className="text-slate-700">25A. Taxes Withheld - Present Employer</span>
              <span className="font-mono text-slate-900">{formatPHP(result.item25A_TaxWithheldPresent)}</span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-200 font-semibold bg-white px-1.5 rounded">
              <span className="text-slate-900">21. Taxable Compensation Present Employer</span>
              <span className="font-mono text-slate-900">{formatPHP(result.item21_TaxableCompensationPresent)}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-200">
              <span className="text-slate-700">25B. Taxes Withheld - Previous Employer</span>
              <span className="font-mono text-slate-900">{formatPHP(result.item25B_TaxWithheldPrevious)}</span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-200">
              <span className="text-slate-700">22. Add: Taxable Compensation Previous Employer</span>
              <span className="font-mono text-slate-800">{formatPHP(result.item22_TaxableCompensationPrevious)}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-200 font-semibold bg-white px-1.5 rounded">
              <span className="text-slate-900">26. Total Amount of Taxes Withheld</span>
              <span className="font-mono text-slate-900">{formatPHP(result.item26_TotalTaxWithheld)}</span>
            </div>

            <div className="flex justify-between items-center py-1.5 border-t-2 border-blue-900 font-black text-slate-900 bg-blue-100/60 px-2 rounded">
              <span>23. Total Taxable Compensation Income</span>
              <span className="font-mono text-blue-900 text-sm">{formatPHP(result.item23_TotalTaxableCompensation)}</span>
            </div>

            {/* Reconciliation outcome: Refund vs Payable */}
            <div className="py-1 px-2 rounded border">
              {result.item27_OverwithheldRefund > 0 ? (
                <div className="flex justify-between items-center text-emerald-800 bg-emerald-50 p-1.5 rounded border border-emerald-300 font-bold">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    27. Overwithheld Tax Refunded to Employee
                  </span>
                  <span className="font-mono text-sm">{formatPHP(result.item27_OverwithheldRefund)}</span>
                </div>
              ) : result.item28_TaxPayableAdjusted > 0 ? (
                <div className="flex justify-between items-center text-amber-900 bg-amber-50 p-1.5 rounded border border-amber-300 font-bold">
                  <span className="flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    28. Amount of Tax Withheld as Adjusted (Payable)
                  </span>
                  <span className="font-mono text-sm">{formatPHP(result.item28_TaxPayableAdjusted)}</span>
                </div>
              ) : (
                <div className="flex justify-between items-center text-slate-700 bg-slate-100 p-1.5 rounded font-bold">
                  <span>27/28. Year-End Adjustment (Fully Balanced)</span>
                  <span className="font-mono text-sm">₱0.00</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Part IV-B: Itemized Details (Non-Taxable vs Taxable) */}
        <div className="border border-slate-700 rounded-lg overflow-hidden mb-6">
          <div className="bg-slate-800 text-white font-bold text-xs uppercase px-3 py-2 flex items-center justify-between">
            <span>Part IV-B — Details of Compensation Income</span>
            <span className="text-[10px] text-slate-300 font-normal">Section 32 NIRC & RA 10963</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-300">
            {/* Non-Taxable Column */}
            <div className="p-3 bg-emerald-50/20">
              <div className="font-bold text-emerald-900 text-xs border-b border-emerald-200 pb-1 mb-2">
                A. Non-Taxable / Exempt Compensation Income
              </div>
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-600">29. Basic Salary (MWE)</span>
                  <span className="font-mono">{formatNumberOnly(result.item29_MWEBasic)}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-600">30. Holiday Pay (MWE)</span>
                  <span className="font-mono">{formatNumberOnly(result.item30_MWEHoliday)}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-600">31. Overtime Pay (MWE)</span>
                  <span className="font-mono">{formatNumberOnly(result.item31_MWEOTrigger)}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-600">32. Night Shift Differential (MWE)</span>
                  <span className="font-mono">{formatNumberOnly(result.item32_MWENightDiff)}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-600">33. Hazard Pay (MWE)</span>
                  <span className="font-mono">{formatNumberOnly(result.item33_MWEHazard)}</span>
                </div>
                <div className="flex justify-between py-0.5 bg-white px-1 rounded border border-slate-100">
                  <span className="text-slate-700 font-medium">34. 13th Month Pay & Other (≤₱90k)</span>
                  <span className="font-mono font-semibold text-emerald-700">{formatNumberOnly(result.item34_Exempt13thMonth)}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-600">35. De Minimis Benefits</span>
                  <span className="font-mono">{formatNumberOnly(result.item35_DeMinimis)}</span>
                </div>
                <div className="flex justify-between py-0.5 bg-white px-1 rounded border border-slate-100">
                  <span className="text-slate-700 font-medium">36. SSS, PHIC, HDMF EE Share & Union</span>
                  <span className="font-mono font-semibold text-blue-700">{formatNumberOnly(result.item36_StatutoryDeductions)}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-600">37. Other Non-Taxable Benefits</span>
                  <span className="font-mono">{formatNumberOnly(result.item37_OtherNonTaxable)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-t border-emerald-300 font-bold text-emerald-950 bg-emerald-100/50 px-1.5 rounded mt-2">
                  <span>38. Total Non-Taxable Income</span>
                  <span className="font-mono">{formatPHP(result.item38_TotalNonTaxable)}</span>
                </div>
              </div>
            </div>

            {/* Taxable Column */}
            <div className="p-3 bg-slate-50/50">
              <div className="font-bold text-slate-800 text-xs border-b border-slate-200 pb-1 mb-2">
                B. Taxable Compensation Income (Regular)
              </div>
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-600">39. Basic Salary (Non-MWE)</span>
                  <span className="font-mono">{formatNumberOnly(result.item39_BasicSalary)}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-600">40. Representation</span>
                  <span className="font-mono">{formatNumberOnly(result.item40_Representation)}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-600">41. Transportation</span>
                  <span className="font-mono">{formatNumberOnly(result.item41_Transportation)}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-600">42. Cost of Living Allowance (COLA)</span>
                  <span className="font-mono">{formatNumberOnly(result.item42_COLA)}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-600">44. Other Taxable Allowances</span>
                  <span className="font-mono">{formatNumberOnly(result.item44_OtherAllowances)}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-600">45. Commission</span>
                  <span className="font-mono">{formatNumberOnly(result.item45_Commission)}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-600">46. Profit Sharing</span>
                  <span className="font-mono">{formatNumberOnly(result.item46_ProfitSharing)}</span>
                </div>
                <div className="flex justify-between py-0.5 bg-amber-50/60 px-1 rounded border border-amber-200">
                  <span className="text-amber-900 font-medium">48. Taxable 13th Month (Excess &gt;₱90k)</span>
                  <span className="font-mono font-semibold text-amber-800">{formatNumberOnly(result.item48_Taxable13thMonthExcess)}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-600">49. Hazard Pay (Non-MWE)</span>
                  <span className="font-mono">{formatNumberOnly(result.item49_HazardPay)}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-600">50. Overtime Pay</span>
                  <span className="font-mono">{formatNumberOnly(result.item50_OvertimePay)}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-600">51. Other Taxable (Night Diff/Bonuses)</span>
                  <span className="font-mono">{formatNumberOnly(result.item51_OtherTaxable)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-t border-slate-300 font-bold text-slate-900 bg-slate-200/50 px-1.5 rounded mt-2">
                  <span>52. Total Taxable Income</span>
                  <span className="font-mono">{formatPHP(result.item52_TotalTaxablePresentEmployer)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Declarations & Signatures Section */}
        <div className="border border-slate-400 rounded p-4 text-[10px] space-y-4 bg-slate-50">
          <p className="text-slate-600 text-justify leading-relaxed">
            I declare, under the penalties of perjury, that this certificate has been made in good faith, verified by me, and to the best of my knowledge and belief, is true and correct pursuant to the provisions of the National Internal Revenue Code, as amended, and the regulations issued under authority thereof.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
            <div className="text-center border-t border-slate-700 pt-1">
              <div className="font-bold text-slate-900 uppercase">{input.employerName || 'Kawayan Cooperative HR Inc.'}</div>
              <div className="text-slate-500">Present Employer / Authorized Signatory Representative</div>
              <div className="text-[9px] text-slate-400 font-mono mt-0.5">TIN: {input.employerTin || '009-876-543-000'}</div>
            </div>

            <div className="text-center border-t border-slate-700 pt-1">
              <div className="font-bold text-slate-900 uppercase">{input.employeeName}</div>
              <div className="text-slate-500">Employee / Taxpayer Signature Over Printed Name</div>
              <div className="text-[9px] text-slate-400 font-mono mt-0.5">TIN: {input.tin || '000-000-000-000'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
