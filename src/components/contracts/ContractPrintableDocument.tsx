import React from 'react';
import { 
  Printer, Download, ShieldCheck, Scale, FileText, CheckCircle2, 
  Building2, User, Award, ExternalLink 
} from 'lucide-react';
import { 
  ContractTemplateDefinition, 
  ContractClause, 
  ContractFormVariables, 
  compileClause, 
  buildPlaceholderMap 
} from '../../lib/contracts';
import { AuthorizedSignatory } from '../../lib/signature-repository';

interface ContractPrintableDocumentProps {
  template: ContractTemplateDefinition;
  clauses: ContractClause[];
  variables: ContractFormVariables;
  signatory: AuthorizedSignatory | null;
  verificationHash?: string;
  onPrint?: () => void;
  onSelectSignatoryClick?: () => void;
}

export function ContractPrintableDocument({
  template,
  clauses,
  variables,
  signatory,
  verificationHash,
  onPrint,
  onSelectSignatoryClick,
}: ContractPrintableDocumentProps) {
  const placeholders = buildPlaceholderMap(variables);
  const hash = verificationHash || (signatory ? `PH-DS-${signatory.id.slice(-6).toUpperCase()}-CONTRACT` : '');

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  const handleDownloadHtml = () => {
    const docElement = document.getElementById('philippine-employment-contract-printable');
    if (!docElement) return;

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Employment Agreement - ${variables.employeeName}</title>
  <style>
    body { font-family: "Georgia", "Times New Roman", serif; margin: 40px; color: #0f172a; line-height: 1.6; font-size: 13px; background: #fff; }
    h1 { font-size: 18px; text-align: center; text-transform: uppercase; margin: 2px 0; letter-spacing: 1px; font-weight: 800; }
    h2 { font-size: 13px; text-align: center; text-transform: uppercase; margin: 2px 0 16px 0; color: #334155; }
    .preamble { text-align: justify; margin-bottom: 20px; text-indent: 30px; }
    .clause-item { margin-bottom: 16px; text-align: justify; }
    .clause-title { font-weight: bold; text-transform: uppercase; font-size: 12px; margin-bottom: 4px; }
    .clause-cite { font-size: 10px; color: #475569; font-style: italic; margin-bottom: 4px; }
    .signatures-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 50px; page-break-inside: avoid; }
    .sig-col { text-align: center; }
    .sig-img { max-height: 50px; margin: 0 auto; display: block; }
    .sig-line { border-top: 1px solid #000; margin-top: 8px; padding-top: 6px; }
    .ack-box { margin-top: 50px; border-top: 2px solid #000; padding-top: 20px; page-break-inside: avoid; }
    @media print {
      body { margin: 15mm 20mm; font-size: 12px; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  ${docElement.innerHTML}
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Employment_Contract_${variables.employeeName.replace(/\s+/g, '_')}_${template.id}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Top Document Action Bar (Hidden in Print) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 font-bold">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-sm">{template.title}</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-mono">
                {template.laborCodeReference}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Drafted for <span className="font-semibold text-slate-800">{variables.employeeName}</span> ({variables.position})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onSelectSignatoryClick && (
            <button
              onClick={onSelectSignatoryClick}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors"
              title="Change authorized employer signatory"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Signatory: {signatory ? signatory.fullName.split(' ')[0] : 'Auto'}
            </button>
          )}

          <button
            onClick={handleDownloadHtml}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-300 transition-colors"
            title="Download standalone HTML contract file"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            Download HTML
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
            title="Print or Save Contract to PDF"
          >
            <Printer className="w-4 h-4" />
            Automated PDF / Print
          </button>
        </div>
      </div>

      {/* Official Legal Agreement Body (Printable Container) */}
      <div
        id="philippine-employment-contract-printable"
        className="bg-white border-2 border-slate-300 rounded-2xl p-8 sm:p-14 font-serif text-slate-900 shadow-md print:border-none print:p-2 print:shadow-none print:rounded-none max-w-4xl mx-auto leading-relaxed"
      >
        {/* Letterhead Header */}
        <div className="text-center border-b-2 border-slate-900 pb-6 mb-8 space-y-1">
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-slate-950 font-serif">
            {variables.companyName}
          </h1>
          <p className="text-xs text-slate-600 font-sans">{variables.companyAddress}</p>
          <p className="text-[11px] text-slate-500 font-mono">{variables.secRegistration}</p>
          <div className="pt-4">
            <h2 className="text-base sm:text-lg font-bold uppercase tracking-widest text-slate-900 underline underline-offset-4">
              {template.title}
            </h2>
            <p className="text-xs text-slate-500 italic mt-1 font-sans">
              Pursuant to the Labor Code of the Philippines and DOLE Department Orders
            </p>
          </div>
        </div>

        {/* Preamble / Parties */}
        <div className="space-y-4 text-xs sm:text-sm text-justify mb-8 leading-relaxed font-serif">
          <p className="font-bold uppercase tracking-wider text-slate-950">
            KNOW ALL MEN BY THESE PRESENTS:
          </p>
          <p className="indent-8 text-slate-800">
            This Employment Agreement (the <strong>"Agreement"</strong>) is entered into and executed this <strong>{variables.signDate}</strong> at Taguig City, Metro Manila, Philippines, by and between:
          </p>
          <div className="pl-6 space-y-3 text-slate-800 border-l-2 border-slate-300 my-4">
            <p>
              <strong>{variables.companyName}</strong>, a corporation duly organized and existing under and by virtue of the laws of the Republic of the Philippines, with principal office address at {variables.companyAddress}, represented herein by its authorized representative, <strong>{variables.authorizedSignatory}</strong>, in their capacity as <strong>{variables.signatoryTitle}</strong> (hereinafter referred to as the <strong>"EMPLOYER"</strong>);
            </p>
            <p className="text-center italic font-sans text-xs text-slate-500">- and -</p>
            <p>
              <strong>{variables.employeeName}</strong>, of legal age, Filipino citizen, residing at {variables.employeeAddress}, holder of Taxpayer Identification No. {variables.employeeTin} and SSS No. {variables.employeeSss} (hereinafter referred to as the <strong>"EMPLOYEE"</strong>);
            </p>
          </div>
          <p className="text-center font-bold tracking-widest text-xs uppercase py-2">
            WITNESSETH, THAT:
          </p>
          <p className="indent-8 text-slate-800">
            WHEREAS, the EMPLOYER desires to engage the services of the EMPLOYEE, and the EMPLOYEE is willing and ready to accept such engagement under the terms, conditions, and stipulations set forth hereunder:
          </p>
          <p className="indent-8 text-slate-800">
            NOW, THEREFORE, for and in consideration of the mutual covenants and agreements herein contained, the parties hereby agree as follows:
          </p>
        </div>

        {/* Contract Clauses */}
        <div className="space-y-6 text-xs sm:text-sm text-justify font-serif text-slate-900">
          {clauses.map((clause, idx) => {
            const compiledContent = compileClause(clause.content, placeholders);

            return (
              <div key={clause.id} className="space-y-1 page-break-inside-avoid">
                <div className="flex items-baseline justify-between border-b border-slate-200 pb-1 mb-1.5">
                  <span className="font-bold uppercase tracking-wide text-xs sm:text-sm text-slate-950">
                    Section {idx + 1}. {clause.title}
                  </span>
                  <span className="text-[10px] text-slate-500 italic font-sans">
                    {clause.legalCitation}
                  </span>
                </div>
                <p className="indent-6 text-slate-800 leading-relaxed font-serif">
                  {compiledContent}
                </p>
              </div>
            );
          })}
        </div>

        {/* In Witness Whereof Block */}
        <div className="mt-12 pt-6 border-t border-slate-300 text-xs sm:text-sm text-justify font-serif">
          <p className="indent-8">
            IN WITNESS WHEREOF, the parties hereto have voluntarily affixed their respective signatures this <strong>{variables.signDate}</strong> at Taguig City, Metro Manila, Republic of the Philippines.
          </p>

          {/* Cryptographic Verification Seal (If present) */}
          {hash && (
            <div className="mt-6 p-2.5 bg-slate-50 border border-slate-300 rounded flex items-center justify-between text-[11px] font-mono text-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Digitally Sealed & Certified: {hash}</span>
              </div>
              <span className="text-[10px] text-slate-600">RA 8792 E-Commerce Enforceable</span>
            </div>
          )}

          {/* Signatures Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 mt-10 text-center font-sans page-break-inside-avoid">
            {/* Employer Signature Block */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                FOR AND ON BEHALF OF EMPLOYER:
              </span>
              <div className="min-h-[55px] flex items-end justify-center pb-1">
                {signatory?.signatureDataUrl ? (
                  <img
                    src={signatory.signatureDataUrl}
                    alt="Employer Authorized Signatory"
                    className="max-h-14 object-contain mx-auto"
                  />
                ) : (
                  <span className="text-[11px] text-slate-400 italic">Authorized Signature</span>
                )}
              </div>
              <div className="border-t border-slate-800 w-4/5 mx-auto pt-1.5">
                <span className="font-bold text-slate-900 block text-xs sm:text-sm uppercase">
                  {variables.authorizedSignatory}
                </span>
                <span className="text-slate-600 text-xs block">
                  {variables.signatoryTitle}
                </span>
                <span className="text-[10px] text-slate-400 block font-mono">
                  {variables.companyName}
                </span>
              </div>
            </div>

            {/* Employee Signature Block */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                CONFORME & ACCEPTED BY EMPLOYEE:
              </span>
              <div className="min-h-[55px] flex items-end justify-center pb-1">
                <span className="text-[11px] text-slate-400 italic">Employee Signature</span>
              </div>
              <div className="border-t border-slate-800 w-4/5 mx-auto pt-1.5">
                <span className="font-bold text-slate-900 block text-xs sm:text-sm uppercase">
                  {variables.employeeName}
                </span>
                <span className="text-slate-600 text-xs block">
                  Employee / Appointee
                </span>
                <span className="text-[10px] text-slate-400 block font-mono">
                  TIN: {variables.employeeTin} • SSS: {variables.employeeSss}
                </span>
              </div>
            </div>
          </div>

          {/* Signed in the Presence of (Witnesses) */}
          <div className="mt-12 pt-4 border-t border-slate-200">
            <p className="text-xs uppercase font-bold text-center tracking-widest text-slate-600 mb-6 font-sans">
              SIGNED IN THE PRESENCE OF:
            </p>
            <div className="grid grid-cols-2 gap-8 text-center text-xs text-slate-600 font-sans">
              <div>
                <div className="border-b border-slate-400 w-4/5 mx-auto mb-1" />
                <span>Witness 1 (HR Representative)</span>
              </div>
              <div>
                <div className="border-b border-slate-400 w-4/5 mx-auto mb-1" />
                <span>Witness 2 (Department Head)</span>
              </div>
            </div>
          </div>

          {/* Formal Philippine Notarial Acknowledgment */}
          <div className="mt-12 pt-6 border-t-2 border-slate-800 space-y-3 text-[11px] text-slate-700 leading-relaxed font-serif page-break-inside-avoid">
            <p className="font-bold uppercase tracking-wider text-center text-xs text-slate-900 font-sans">
              REPUBLIC OF THE PHILIPPINES &nbsp;)&nbsp; S.S.<br />
              CITY OF TAGUIG &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;)
            </p>
            <p className="indent-6">
              BEFORE ME, a Notary Public in and for the City of Taguig, Metro Manila, Philippines, this {variables.signDate}, personally appeared the above-named parties with their respective competent evidence of identities, known to me to be the same persons who executed the foregoing Employment Agreement consisting of multiple pages including this page on which this acknowledgment is written, and they acknowledged to me that the same is their free and voluntary act and deed, as well as the free and voluntary act and deed of the corporation herein represented.
            </p>
            <p className="indent-6">
              WITNESS MY HAND AND NOTARIAL SEAL on the date and at the place first above-written.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-6 text-[10px] font-sans">
              <div>
                Doc. No. _______;<br />
                Page No. _______;<br />
                Book No. _______;<br />
                Series of 2026.
              </div>
              <div className="text-right">
                <span className="font-bold">NOTARY PUBLIC</span><br />
                Commission expires on Dec 31, 2026<br />
                Roll of Attorneys No. / IBP Lifetime No.<br />
                PTR No. / MCLE Compliance No.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
