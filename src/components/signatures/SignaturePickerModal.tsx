import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  X, Check, ShieldCheck, PenTool, ExternalLink, 
  Award, Building2, User, AlertCircle, CheckCircle2 
} from 'lucide-react';
import { 
  AuthorizedSignatory, 
  DocumentCategory, 
  DOCUMENT_CATEGORY_CONFIG,
  signatureRepository 
} from '../../lib/signature-repository';

interface SignaturePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: DocumentCategory;
  currentSignatoryId?: string;
  onSelectSignatory: (signatory: AuthorizedSignatory | null) => void;
}

export function SignaturePickerModal({
  isOpen,
  onClose,
  category,
  currentSignatoryId,
  onSelectSignatory,
}: SignaturePickerModalProps) {
  const [signatories, setSignatories] = useState<AuthorizedSignatory[]>([]);
  const [selectedId, setSelectedId] = useState<string>(currentSignatoryId || '');
  const [setAsCategoryDefault, setSetAsCategoryDefault] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      const list = signatureRepository.getSignatories().filter(s => s.status === 'active');
      setSignatories(list);
      setSelectedId(currentSignatoryId || '');
    }
  }, [isOpen, currentSignatoryId]);

  if (!isOpen) return null;

  const categoryMeta = DOCUMENT_CATEGORY_CONFIG[category];
  const defaultSigner = signatureRepository.getDefaultSignatoryForCategory(category);

  const handleConfirm = () => {
    if (!selectedId) {
      onSelectSignatory(null);
      onClose();
      return;
    }

    const chosen = signatories.find(s => s.id === selectedId) || null;
    if (chosen && setAsCategoryDefault) {
      signatureRepository.setCategoryDefault(category, chosen.id);
    }
    onSelectSignatory(chosen);
    onClose();
  };

  const handleClear = () => {
    setSelectedId('');
    onSelectSignatory(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full flex flex-col max-h-[90vh] overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <PenTool className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight">Select Authorized Digital Signatory</h3>
              <p className="text-xs text-slate-400">
                Central Repository • Applying to <span className="text-blue-300 font-medium">{categoryMeta?.label || category}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
            <span>Choose from registered company signatories:</span>
            <Link
              to="/signatures"
              target="_blank"
              className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1 hover:underline"
            >
              Open Signature Repository <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          {/* Signatory List */}
          <div className="space-y-2.5">
            {signatories.map((sig) => {
              const isSelected = selectedId === sig.id;
              const isDefault = defaultSigner?.id === sig.id;

              return (
                <div
                  key={sig.id}
                  onClick={() => setSelectedId(sig.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/50 shadow-xs ring-1 ring-blue-600'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{sig.fullName}</span>
                        {isDefault && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono">
                            Category Default
                          </span>
                        )}
                        {sig.isDefaultGlobal && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono">
                            Global
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">{sig.title} • {sig.department}</p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-400 font-mono mt-1">
                        <span>TIN: {sig.tin}</span>
                        {sig.prcLicenseNo && <span>{sig.prcLicenseNo}</span>}
                        {sig.doleAccreditationNo && <span>{sig.doleAccreditationNo}</span>}
                        {sig.ibpRollNo && <span>{sig.ibpRollNo}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Signature preview stamp */}
                  <div className="sm:text-right shrink-0">
                    <div className="h-10 w-28 bg-white border border-slate-200 rounded p-1 flex items-center justify-center shadow-2xs">
                      {sig.signatureDataUrl ? (
                        <img
                          src={sig.signatureDataUrl}
                          alt="Signature Preview"
                          className="max-h-8 max-w-full object-contain"
                        />
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">No image</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Option to set as category default */}
          <div className="pt-3 border-t border-slate-200">
            <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={setAsCategoryDefault}
                onChange={(e) => setSetAsCategoryDefault(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <span>Remember as default authorized signatory for <strong>{categoryMeta?.label || category}</strong></span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-slate-500 hover:text-rose-600 transition-colors"
          >
            Clear / Unsign Document
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
            >
              Apply Selected Signature
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
