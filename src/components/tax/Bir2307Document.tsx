import React from 'react';
import { 
  Printer, Download, ShieldCheck, CheckCircle2, 
  FileText, Building2, User, Award, ExternalLink 
} from 'lucide-react';
import { Bir2307Data, computeLineItemTotals, computeForm2307Totals } from '../../lib/bir-2307';

interface Bir2307DocumentProps {
  data: Bir2307Data;
  onPrint?: () => void;
  onDownloadStandaloneHtml?: () => void;
}

export function Bir2307Document({
  data,
  onPrint,
  onDownloadStandaloneHtml,
}: Bir2307DocumentProps) {
  const totals = computeForm2307Totals(data.lineItems);

  // Helper for currency formatting
  const fmt = (val: number) => {
    return (val || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  const handleDownloadHtml = () => {
    if (onDownloadStandaloneHtml) {
      onDownloadStandaloneHtml();
      return;
    }

    // Generate standalone clean printable HTML
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>BIR Form 2307 - ${data.payeeName} - ${data.taxYear} ${data.periodQuarter}</title>
  <style>
    @page { size: A4 portrait; margin: 12mm; }
    body { font-family: Arial, Helvetica, sans-serif; font-size: 10px; color: #111827; margin: 0; line-height: 1.25; background: #fff; }
    .header-table { width: 100%; border-bottom: 2px solid #000; padding-bottom: 6px; margin-bottom: 8px; }
    .bir-logo-circle { width: 44px; height: 44px; border: 2px solid #1e3a8a; border-radius: 50%; font-weight: 900; font-size: 14px; text-align: center; line-height: 44px; color: #1e3a8a; }
    .box-title { background: #064e3b; color: #fff; font-size: 10px; font-weight: bold; padding: 3px 6px; text-transform: uppercase; margin-top: 6px; }
    .meta-grid { border: 1px solid #000; padding: 6px; margin-bottom: 6px; }
    table.data-table { width: 100%; border-collapse: collapse; margin-top: 6px; font-size: 9.5px; }
    table.data-table th, table.data-table td { border: 1px solid #374151; padding: 4px 6px; }
    table.data-table th { background: #f3f4f6; font-size: 9px; text-transform: uppercase; font-weight: bold; }
    .sig-grid { display: flex; justify-content: space-between; margin-top: 24px; text-align: center; }
    .sig-col { width: 45%; border-top: 1px solid #000; padding-top: 4px; }
    .cert-box { border: 1px solid #10b981; background: #f0fdf4; padding: 6px; margin: 8px 0; font-size: 9px; }
    @media print { .no-print { display: none !important; } body { margin: 0; } }
  </style>
</head>
<body>
  <div style="border: 2px solid #064e3b; padding: 12px;">
    <table class="header-table">
      <tr>
        <td style="width: 50px;"><div class="bir-logo-circle">BIR</div></td>
        <td>
          <div style="font-size: 8.5px; text-transform: uppercase; color: #4b5563;">Republic of the Philippines · Department of Finance</div>
          <div style="font-size: 12px; font-weight: bold; text-transform: uppercase;">Bureau of Internal Revenue</div>
          <div style="font-size: 11px; font-weight: bold; color: #064e3b;">Certificate of Creditable Tax Withheld at Source</div>
          <div style="font-size: 8.5px; color: #4b5563;">(Monthly/Quarterly Withholding under RR 2-98 as amended by RR 11-2018)</div>
        </td>
        <td style="text-align: right; width: 190px;">
          <div style="font-size: 15px; font-weight: 900; color: #064e3b;">BIR Form No. 2307</div>
          <div style="font-size: 8.5px; color: #4b5563;">Revised January 2018 (ENCS)</div>
          <div style="margin-top: 4px; font-size: 9px; font-weight: bold; border: 1px solid #064e3b; padding: 2px 4px; display: inline-block;">
            Period: ${data.periodFrom} to ${data.periodTo}
          </div>
        </td>
      </tr>
    </table>

    <div class="box-title">Part I - Payee Information</div>
    <div class="meta-grid">
      <div><b>1. Payee's TIN:</b> <span style="font-family: monospace; font-size: 11px; font-weight: bold;">${data.payeeTin}</span></div>
      <div style="margin-top: 3px;"><b>2. Payee's Name:</b> <span style="font-size: 11px; font-weight: bold;">${data.payeeName}</span></div>
      <div style="margin-top: 3px;"><b>3. Registered Address:</b> ${data.payeeAddress} (Zip: ${data.payeeZipCode})</div>
    </div>

    <div class="box-title">Part II - Payor Information (Withholding Agent)</div>
    <div class="meta-grid">
      <div><b>4. Payor's TIN:</b> <span style="font-family: monospace; font-size: 11px; font-weight: bold;">${data.payorTin}</span></div>
      <div style="margin-top: 3px;"><b>5. Payor's Name:</b> <span style="font-size: 11px; font-weight: bold;">${data.payorName}</span></div>
      <div style="margin-top: 3px;"><b>6. Registered Address:</b> ${data.payorAddress} (Zip: ${data.payorZipCode})</div>
    </div>

    <div class="box-title">Part III - Details of Monthly Income Payments and Tax Withheld</div>
    <table class="data-table">
      <thead>
        <tr>
          <th>Nature of Income Payment</th>
          <th>ATC</th>
          <th style="text-align: right;">1st Month</th>
          <th style="text-align: right;">2nd Month</th>
          <th style="text-align: right;">3rd Month</th>
          <th style="text-align: right;">Total Gross</th>
          <th style="text-align: center;">Rate</th>
          <th style="text-align: right;">Tax Withheld</th>
        </tr>
      </thead>
      <tbody>
        ${data.lineItems.map(item => {
          const { totalPayment, taxWithheld } = computeLineItemTotals(item);
          return `<tr>
            <td>${item.natureOfPayment}</td>
            <td style="font-family: monospace; font-weight: bold;">${item.atcCode}</td>
            <td style="text-align: right; font-family: monospace;">${item.month1Payment.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
            <td style="text-align: right; font-family: monospace;">${item.month2Payment.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
            <td style="text-align: right; font-family: monospace;">${item.month3Payment.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
            <td style="text-align: right; font-family: monospace; font-weight: bold;">${totalPayment.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
            <td style="text-align: center; font-family: monospace;">${(item.taxRate * 100).toFixed(0)}%</td>
            <td style="text-align: right; font-family: monospace; font-weight: bold; color: #064e3b;">${taxWithheld.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
          </tr>`;
        }).join('')}
      </tbody>
      <tfoot>
        <tr style="background: #f3f4f6; font-weight: bold;">
          <td colspan="2">TOTAL</td>
          <td style="text-align: right; font-family: monospace;">${totals.month1Total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
          <td style="text-align: right; font-family: monospace;">${totals.month2Total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
          <td style="text-align: right; font-family: monospace;">${totals.month3Total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
          <td style="text-align: right; font-family: monospace;">${totals.grandTotalPayment.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
          <td></td>
          <td style="text-align: right; font-family: monospace; font-size: 11px; color: #064e3b;">PHP ${totals.grandTotalTaxWithheld.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
        </tr>
      </tfoot>
    </table>

    <div style="margin-top: 16px; font-size: 8.5px; color: #4b5563; line-height: 1.4;">
      <b>Part IV - Declaration:</b> We declare, under the penalties of perjury, that this certificate has been made in good faith, verified by us, and to the best of our knowledge and belief, is true and correct, pursuant to the provisions of the National Internal Revenue Code, as amended, and the regulations issued under authority thereof.
    </div>

    ${data.verificationHash ? `
    <div class="cert-box">
      <b>✔ STATUTORY ELECTRONIC TAX SEAL (RA 8792):</b> Signed by <b>${data.authorizedSignatory}</b> on ${data.signingDate}<br>
      Digital Verification ID: <span style="font-family: monospace;">${data.verificationHash}</span>
    </div>` : ''}

    <div class="sig-grid">
      <div class="sig-col">
        ${data.digitalSignatureUrl ? `<img src="${data.digitalSignatureUrl}" style="height: 40px; margin: 0 auto; display: block;" />` : `<div style="height: 40px;"></div>`}
        <b>${data.authorizedSignatory}</b><br>
        <span>${data.signatoryTitle}</span><br>
        <small style="color: #6b7280;">TIN: ${data.signatoryTin}</small><br>
        <small>Date Signed: ${data.signingDate}</small>
      </div>
      <div class="sig-col">
        <div style="height: 40px;"></div>
        <b>${data.payeeName}</b><br>
        <span>Payee / Authorized Representative</span><br>
        <small style="color: #6b7280;">TIN: ${data.payeeTin}</small><br>
        <small>Date Received: ____________________</small>
      </div>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BIR_Form_2307_${data.payeeName.replace(/[^a-zA-Z0-9]/g, '_')}_${data.periodQuarter}_${data.taxYear}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Top Action Bar (hidden when printing) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-700/10 border border-emerald-600/30 flex items-center justify-center text-emerald-800 font-black text-sm">
            2307
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-sm">BIR Form No. 2307 Official Document</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 font-mono">
                {data.periodQuarter} · {data.taxYear}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Certificate of Creditable Tax Withheld at Source • Issued to Contractors & Consultants
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadHtml}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-300 transition-colors"
            title="Download standalone printable HTML file"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            Download HTML (Offline)
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm transition-colors"
            title="Open browser Print / Save to PDF dialog"
          >
            <Printer className="w-4 h-4" />
            Automated PDF / Print
          </button>
        </div>
      </div>

      {/* Official Form Replica Container */}
      <div 
        id="bir-form-2307-printable"
        className="bg-white border-2 border-emerald-950 rounded-xl p-6 sm:p-8 font-sans text-slate-900 text-xs shadow-md print:border-black print:p-2 print:shadow-none print:rounded-none max-w-5xl mx-auto"
      >
        {/* Header Section */}
        <div className="border-b-2 border-emerald-950 pb-4 mb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full border-2 border-emerald-900 flex items-center justify-center bg-emerald-50 text-emerald-900 font-black text-sm tracking-tighter shrink-0">
                BIR
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Republic of the Philippines · Department of Finance</div>
                <div className="text-base font-extrabold uppercase tracking-tight text-slate-900">Bureau of Internal Revenue</div>
                <div className="text-xs font-bold text-emerald-900 uppercase">Certificate of Creditable Tax Withheld at Source</div>
                <div className="text-[10px] text-slate-500 italic">Pursuant to RR No. 2-98 as amended by RR No. 11-2018 (TRAIN Law)</div>
              </div>
            </div>

            <div className="text-right sm:border-l-2 sm:border-emerald-950 sm:pl-6">
              <div className="text-lg font-black tracking-tight text-emerald-950">BIR Form No. 2307</div>
              <div className="text-[10px] text-slate-600">Revised January 2018 (ENCS)</div>
              <div className="mt-1.5 inline-flex flex-col items-end">
                <span className="text-[9px] uppercase font-bold text-slate-500">Applicable Quarter</span>
                <span className="px-2.5 py-0.5 bg-emerald-50 border border-emerald-300 rounded font-mono font-bold text-xs text-emerald-900">
                  {data.periodFrom} to {data.periodTo}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Part I: Payee Information */}
        <div className="mb-4">
          <div className="bg-emerald-900 text-white font-bold text-[11px] px-3 py-1 uppercase tracking-wide rounded-t">
            Part I - Payee Information
          </div>
          <div className="border border-slate-300 rounded-b p-3 space-y-2 bg-slate-50/50">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
              <div className="sm:col-span-3 text-[11px] font-bold text-slate-700">1. Payee's Taxpayer Identification No. (TIN):</div>
              <div className="sm:col-span-9 font-mono font-black text-sm tracking-wider text-slate-900 bg-white px-3 py-1 rounded border border-slate-300">
                {data.payeeTin}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
              <div className="sm:col-span-3 text-[11px] font-bold text-slate-700">2. Payee's Name:</div>
              <div className="sm:col-span-9 font-bold text-sm text-slate-900 bg-white px-3 py-1 rounded border border-slate-300">
                {data.payeeName}
                {data.payeeTradeName && (
                  <span className="text-xs text-slate-500 font-normal ml-2">
                    (Trade Name: {data.payeeTradeName})
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
              <div className="sm:col-span-3 text-[11px] font-bold text-slate-700">3. Registered Address:</div>
              <div className="sm:col-span-7 text-xs text-slate-800 bg-white px-3 py-1 rounded border border-slate-300">
                {data.payeeAddress}
              </div>
              <div className="sm:col-span-2 text-right">
                <span className="text-[10px] text-slate-500 uppercase font-bold mr-1">Zip:</span>
                <span className="font-mono font-bold bg-white px-2 py-1 rounded border border-slate-300 text-xs">
                  {data.payeeZipCode}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Part II: Payor Information (Withholding Agent) */}
        <div className="mb-4">
          <div className="bg-emerald-900 text-white font-bold text-[11px] px-3 py-1 uppercase tracking-wide rounded-t">
            Part II - Payor Information (Withholding Agent)
          </div>
          <div className="border border-slate-300 rounded-b p-3 space-y-2 bg-slate-50/50">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
              <div className="sm:col-span-3 text-[11px] font-bold text-slate-700">4. Payor's Taxpayer Identification No. (TIN):</div>
              <div className="sm:col-span-9 font-mono font-black text-sm tracking-wider text-slate-900 bg-white px-3 py-1 rounded border border-slate-300">
                {data.payorTin}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
              <div className="sm:col-span-3 text-[11px] font-bold text-slate-700">5. Payor's Registered Name:</div>
              <div className="sm:col-span-9 font-bold text-sm text-slate-900 bg-white px-3 py-1 rounded border border-slate-300">
                {data.payorName}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
              <div className="sm:col-span-3 text-[11px] font-bold text-slate-700">6. Registered Business Address:</div>
              <div className="sm:col-span-7 text-xs text-slate-800 bg-white px-3 py-1 rounded border border-slate-300">
                {data.payorAddress}
              </div>
              <div className="sm:col-span-2 text-right">
                <span className="text-[10px] text-slate-500 uppercase font-bold mr-1">Zip:</span>
                <span className="font-mono font-bold bg-white px-2 py-1 rounded border border-slate-300 text-xs">
                  {data.payorZipCode}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Part III: Details of Monthly Income Payments and Tax Withheld */}
        <div className="mb-5">
          <div className="bg-emerald-900 text-white font-bold text-[11px] px-3 py-1 uppercase tracking-wide rounded-t flex items-center justify-between">
            <span>Part III - Details of Monthly Income Payments and Tax Withheld</span>
            <span className="text-[10px] font-normal text-emerald-200">Values in Philippine Peso (PHP)</span>
          </div>

          <div className="border border-slate-300 rounded-b overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-slate-800 font-bold uppercase tracking-wider text-[10px] border-b border-slate-300">
                <tr>
                  <th className="px-3 py-2.5 border-r border-slate-300">Nature of Income Payment</th>
                  <th className="px-3 py-2.5 text-center border-r border-slate-300 w-20">ATC</th>
                  <th className="px-3 py-2.5 text-right border-r border-slate-300">1st Month</th>
                  <th className="px-3 py-2.5 text-right border-r border-slate-300">2nd Month</th>
                  <th className="px-3 py-2.5 text-right border-r border-slate-300">3rd Month</th>
                  <th className="px-3 py-2.5 text-right border-r border-slate-300 bg-slate-50">Total Gross</th>
                  <th className="px-3 py-2.5 text-center border-r border-slate-300 w-16">Rate</th>
                  <th className="px-3 py-2.5 text-right bg-emerald-50 text-emerald-950 font-black">Tax Withheld</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                {data.lineItems.map((item) => {
                  const { totalPayment, taxWithheld } = computeLineItemTotals(item);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="px-3 py-2 font-sans font-medium text-slate-900 border-r border-slate-200">
                        {item.natureOfPayment}
                      </td>
                      <td className="px-3 py-2 text-center font-bold text-slate-800 border-r border-slate-200">
                        {item.atcCode}
                      </td>
                      <td className="px-3 py-2 text-right border-r border-slate-200">
                        ₱{fmt(item.month1Payment)}
                      </td>
                      <td className="px-3 py-2 text-right border-r border-slate-200">
                        ₱{fmt(item.month2Payment)}
                      </td>
                      <td className="px-3 py-2 text-right border-r border-slate-200">
                        ₱{fmt(item.month3Payment)}
                      </td>
                      <td className="px-3 py-2 text-right font-bold text-slate-900 bg-slate-50 border-r border-slate-200">
                        ₱{fmt(totalPayment)}
                      </td>
                      <td className="px-3 py-2 text-center font-bold text-slate-700 border-r border-slate-200">
                        {(item.taxRate * 100).toFixed(0)}%
                      </td>
                      <td className="px-3 py-2 text-right font-black text-emerald-900 bg-emerald-50/50">
                        ₱{fmt(taxWithheld)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-400 text-xs">
                <tr>
                  <td colSpan={2} className="px-3 py-2.5 uppercase font-sans text-[10px] tracking-wider border-r border-slate-300">
                    Grand Totals for the Quarter:
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono border-r border-slate-300">
                    ₱{fmt(totals.month1Total)}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono border-r border-slate-300">
                    ₱{fmt(totals.month2Total)}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono border-r border-slate-300">
                    ₱{fmt(totals.month3Total)}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono font-black text-slate-950 bg-slate-200 border-r border-slate-300">
                    ₱{fmt(totals.grandTotalPayment)}
                  </td>
                  <td className="border-r border-slate-300" />
                  <td className="px-3 py-2.5 text-right font-mono font-black text-emerald-950 text-sm bg-emerald-100">
                    ₱{fmt(totals.grandTotalTaxWithheld)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Part IV: Declaration & Official Sworn Statements */}
        <div className="border border-slate-300 rounded-lg p-4 bg-slate-50 space-y-3">
          <div className="text-[10px] text-slate-600 leading-relaxed">
            <span className="font-bold text-slate-900">Part IV - Declaration:</span> We declare, under the penalties of perjury, that this certificate has been made in good faith, verified by us, and to the best of our knowledge and belief, is true and correct, pursuant to the provisions of the National Internal Revenue Code, as amended, and the regulations issued under authority thereof.
          </div>

          {/* Cryptographic Seal if signed */}
          {data.verificationHash && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded-lg flex items-center justify-between text-xs text-emerald-900 font-mono">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Digitally Sealed & Certified: {data.verificationHash}</span>
              </div>
              <span className="text-[10px] text-emerald-700">RA 8792 E-Commerce Valid</span>
            </div>
          )}

          {/* Signatures Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4 border-t border-slate-200 text-xs">
            {/* Payor Signature */}
            <div className="text-center space-y-2">
              <div className="min-h-[50px] flex items-end justify-center pb-1">
                {data.digitalSignatureUrl ? (
                  <img
                    src={data.digitalSignatureUrl}
                    alt="Authorized Signatory"
                    className="max-h-12 object-contain mx-auto"
                  />
                ) : (
                  <div className="text-[11px] text-slate-400 italic">Signature over Printed Name</div>
                )}
              </div>
              <div className="border-b border-slate-400 w-4/5 mx-auto" />
              <div>
                <span className="font-bold text-slate-900 block text-sm">{data.authorizedSignatory}</span>
                <span className="text-slate-600 block">{data.signatoryTitle}</span>
                <span className="text-[10px] text-slate-400 block font-mono">TIN: {data.signatoryTin}</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Date Signed: {data.signingDate}</span>
              </div>
            </div>

            {/* Payee Signature */}
            <div className="text-center space-y-2">
              <div className="min-h-[50px] flex items-end justify-center pb-1">
                <div className="text-[11px] text-slate-400 italic">Payee Signature over Printed Name</div>
              </div>
              <div className="border-b border-slate-400 w-4/5 mx-auto" />
              <div>
                <span className="font-bold text-slate-900 block text-sm">{data.payeeName}</span>
                <span className="text-slate-600 block">Payee / Authorized Representative</span>
                <span className="text-[10px] text-slate-400 block font-mono">TIN: {data.payeeTin}</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Date Received: ____________________</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form Footer Stamp */}
        <div className="mt-4 pt-3 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center text-[10px] text-slate-400 font-mono">
          <span>BIR Form No. 2307 · Certificate of Creditable Tax Withheld at Source</span>
          <span>SAWT (Summary Alphanumeric Withholding Tax) Schedule Compliant</span>
        </div>
      </div>
    </div>
  );
}
