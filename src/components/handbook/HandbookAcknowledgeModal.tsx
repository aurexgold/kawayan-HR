import React, { useRef, useState, useEffect } from 'react';
import { X, Printer, Download, CheckSquare, ShieldCheck, FileText, PenTool } from 'lucide-react';
import { HandbookConfig } from '../../lib/handbook';
import { AuthorizedSignatory, signatureRepository } from '../../lib/signature-repository';
import { SignaturePickerModal } from '../signatures/SignaturePickerModal';

interface HandbookAcknowledgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: HandbookConfig;
}

export function HandbookAcknowledgeModal({
  isOpen,
  onClose,
  config,
}: HandbookAcknowledgeModalProps) {
  const printAreaRef = useRef<HTMLDivElement>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [signatory, setSignatory] = useState<AuthorizedSignatory | null>(() => {
    return signatureRepository.resolveSignatureForDocument('handbook').signatory;
  });

  useEffect(() => {
    const sync = () => {
      setSignatory(signatureRepository.resolveSignatureForDocument('handbook').signatory);
    };
    return signatureRepository.subscribe(sync);
  }, []);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full my-8 overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">Employee Handbook Acknowledgment & Undertaking</h2>
              <p className="text-xs text-slate-400">
                Mandatory Legal Receipt for Onboarding Personnel (DOLE / NLRC Enforceability)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Document Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          <div
            ref={printAreaRef}
            className="p-8 border border-slate-300 rounded-xl bg-white text-slate-900 shadow-xs space-y-6 font-serif"
          >
            {/* Form Letterhead */}
            <div className="text-center border-b border-slate-300 pb-4">
              <h1 className="text-lg font-bold uppercase tracking-wide text-slate-900">
                {config.companyName}
              </h1>
              {config.secOrCdaNumber && (
                <p className="text-xs text-slate-600 mt-0.5">{config.secOrCdaNumber}</p>
              )}
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-800 mt-3">
                Employee Handbook Receipt, Acknowledgment & Undertaking Form
              </h2>
            </div>

            {/* Declaration Text */}
            <div className="text-xs leading-relaxed text-slate-800 space-y-3 font-sans">
              <p>
                I, the undersigned employee, hereby formally acknowledge that I have received a copy of the official
                <strong> {config.companyName} Employee Handbook</strong> (incorporating Philippine Labor Code standards,
                Republic Act No. 11313 Safe Spaces Act, Republic Act No. 11058 Occupational Safety and Health Standards,
                and company-specific policies).
              </p>

              <div className="space-y-2 pl-4 border-l-2 border-blue-600 my-4 text-xs">
                <p className="flex items-start gap-2">
                  <CheckSquare className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Understanding of Policies:</strong> I declare that I have read, understood, and agreed to abide
                    by all the rules, compensation terms, leave guidelines, attendance logging procedures, and the Code of Discipline stated herein.
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <CheckSquare className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Due Process & Disciplinary Code:</strong> I understand that violations of company policies and just causes under Article 297 of the Labor Code of the Philippines shall be subject to progressive discipline, with procedural due process guaranteed via the Twin-Notice Rule (Notice to Explain and Notice of Decision).
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <CheckSquare className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Safe Spaces & Anti-Harassment:</strong> I acknowledge the company’s zero-tolerance policy against sexual harassment (RA 7877 / RA 11313) and know that the Committee on Decorum and Investigation (CODI) may be contacted at <code>{config.grievanceEmail}</code>.
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <CheckSquare className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Confidentiality & Data Privacy:</strong> I undertake to maintain strict confidentiality of all cooperative, member, client, and company data in compliance with Republic Act No. 10173 (Data Privacy Act of 2012).
                  </span>
                </p>
              </div>

              <p>
                I acknowledge that this Handbook does not constitute an immutable contract of permanent employment and that the management reserves the right to amend policies to conform to new DOLE statutory issuances upon prior notice to staff.
              </p>
            </div>

            {/* Signature Blocks */}
            <div className="pt-8 border-t border-slate-300 grid grid-cols-2 gap-8 font-sans text-xs">
              <div>
                <div className="border-b border-slate-900 pb-1 mb-1 h-10 flex items-end">
                  <span className="text-slate-400 italic">Signature over printed name</span>
                </div>
                <div className="font-semibold text-slate-800">Employee Name: _______________________</div>
                <div className="text-slate-600 mt-1">Designation / Role: _______________________</div>
                <div className="text-slate-600 mt-1">Employee ID No.: _______________________</div>
                <div className="text-slate-600 mt-1">Date Signed: _______________________</div>
              </div>

              <div>
                <div className="border-b border-slate-900 pb-1 mb-1 min-h-[46px] flex items-end justify-center">
                  {signatory?.signatureDataUrl ? (
                    <img
                      src={signatory.signatureDataUrl}
                      alt="HR Representative Signature"
                      className="max-h-12 object-contain"
                    />
                  ) : (
                    <span className="text-slate-400 italic text-[11px]">HR / Management Representative Signature</span>
                  )}
                </div>
                <div className="font-semibold text-slate-800">
                  Received By: {signatory ? signatory.fullName : 'Maria Clara'}
                </div>
                <div className="text-slate-600 mt-0.5 text-xs">
                  Designation: {signatory ? signatory.title : 'HR & Labor Compliance Manager'}
                </div>
                <div className="text-slate-600 mt-0.5 text-xs font-mono">
                  DOLE Accr / TIN: {signatory?.doleAccreditationNo || signatory?.tin || 'DOLE-OSH-NCR-2023-0881'}
                </div>
                {signatory && (
                  <div className="text-[10px] text-emerald-800 font-mono mt-1">
                    Seal: {signatureRepository.generateTamperEvidentHash(signatory, 'HANDBOOK-RECEIPT')}
                  </div>
                )}
                <div className="text-[10px] text-slate-500 mt-2 italic">
                  * Official acknowledgment recorded in company 201 file.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Compliant with DOLE 201-File Requirements</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPickerOpen(true)}
              className="px-3 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <PenTool className="w-3.5 h-3.5 text-blue-600" />
              <span>Signatory: {signatory ? signatory.fullName.split(' ')[0] : 'Auto'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Print Form</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Central Repository Picker */}
      <SignaturePickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        category="handbook"
        currentSignatoryId={signatory?.id}
        onSelectSignatory={(s) => setSignatory(s)}
      />
    </div>
  );
}
