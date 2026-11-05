import React from 'react';
import { ShieldCheck, Award, Lock, ExternalLink } from 'lucide-react';
import { AuthorizedSignatory } from '../../lib/signature-repository';

interface SignatureSealBadgeProps {
  signatory: AuthorizedSignatory | null;
  verificationHash?: string;
  signingDate?: string;
  documentName?: string;
  className?: string;
  variant?: 'compact' | 'detailed' | 'watermark';
  onManageClick?: () => void;
}

export function SignatureSealBadge({
  signatory,
  verificationHash,
  signingDate,
  documentName,
  className = '',
  variant = 'compact',
  onManageClick,
}: SignatureSealBadgeProps) {
  if (!signatory) return null;

  const date = signingDate || new Date().toISOString().split('T')[0];
  const hash = verificationHash || `PH-DS-${signatory.id.slice(-6).toUpperCase()}-RA8792`;

  if (variant === 'compact') {
    return (
      <div className={`p-2.5 bg-emerald-50 border border-emerald-300 rounded-lg flex flex-wrap items-center justify-between gap-2 text-xs text-emerald-950 font-mono ${className}`}>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="font-semibold">{signatory.fullName}</span>
            <span className="text-emerald-700 text-[11px]">({signatory.title})</span>
            <span className="text-emerald-800 text-[10px] font-bold">[{hash}]</span>
          </div>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-emerald-800">
          <span>RA 8792 Certified</span>
          {onManageClick && (
            <button
              onClick={onManageClick}
              className="underline hover:text-emerald-950 print:hidden text-[11px] font-sans"
            >
              Signatory Settings
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`border border-emerald-300 bg-emerald-50/70 rounded-xl p-3 text-xs text-slate-800 font-sans space-y-2 ${className}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">
              Republic of the Philippines · Electronic Signature Verification
            </div>
            <div className="font-bold text-slate-900 text-sm">{signatory.fullName}</div>
          </div>
        </div>
        <div className="text-right text-[10px] font-mono text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded border border-emerald-200">
          {hash}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] pt-1 border-t border-emerald-200/60">
        <div>
          <span className="text-slate-500 block text-[10px]">Position:</span>
          <span className="font-medium text-slate-900">{signatory.title}</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px]">Accreditation / TIN:</span>
          <span className="font-medium text-slate-900 font-mono">
            {signatory.prcLicenseNo || signatory.doleAccreditationNo || `TIN: ${signatory.tin}`}
          </span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px]">Date Certified:</span>
          <span className="font-medium text-slate-900 font-mono">{date}</span>
        </div>
      </div>

      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-emerald-200/60">
        <span>Statutory Basis: Republic Act 8792 (E-Commerce Act of 2000)</span>
        {onManageClick && (
          <button
            onClick={onManageClick}
            className="text-emerald-700 hover:text-emerald-900 font-medium inline-flex items-center gap-1 print:hidden"
          >
            Change Signatory <ExternalLink className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}
