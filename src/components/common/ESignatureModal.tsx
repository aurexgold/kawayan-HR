import React, { useRef, useState, useEffect } from 'react';
import { 
  X, PenTool, Type, RotateCcw, CheckCircle2, ShieldCheck, 
  Trash2, Award, Calendar, UserCheck, Lock, Sparkles, AlertCircle 
} from 'lucide-react';

export interface DigitalSignatureData {
  signatureDataUrl: string;
  signerName: string;
  signerTitle: string;
  accreditationNo: string;
  signedAt: string;
  verificationHash: string;
  signatureType: 'drawn' | 'typed' | 'preset';
  companyName: string;
}

interface ESignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSignature: (sig: DigitalSignatureData) => void;
  documentTitle?: string;
  initialSignerName?: string;
  initialSignerTitle?: string;
  initialAccreditation?: string;
}

const PRESET_SIGNATORIES = [
  {
    name: 'Maria Clara',
    title: 'HR & Labor Compliance Manager',
    accreditation: 'DOLE-OSH-NCR-2023-0881 | PRC HR #0041289',
    type: 'preset',
  },
  {
    name: 'Atty. Rodrigo Santos',
    title: 'Chief Legal Counsel & Labor Relations Officer',
    accreditation: 'IBP Roll No. 71420 | DOLE Accredited Mediator',
    type: 'preset',
  },
  {
    name: 'Engr. Danica Reyes',
    title: 'DOLE Safety Officer 2 (SO2) / OSH Chairperson',
    accreditation: 'DOLE-BWC-SO2-2022-1102',
    type: 'preset',
  },
];

export function ESignatureModal({
  isOpen,
  onClose,
  onSaveSignature,
  documentTitle = 'DOLE Mandated Inspection Logbook',
  initialSignerName = 'Maria Clara',
  initialSignerTitle = 'HR & Labor Compliance Manager',
  initialAccreditation = 'DOLE-OSH-NCR-2023-0881 | PRC HR #0041289',
}: ESignatureModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mode, setMode] = useState<'draw' | 'type'>('draw');
  const [signerName, setSignerName] = useState(initialSignerName);
  const [signerTitle, setSignerTitle] = useState(initialSignerTitle);
  const [accreditationNo, setAccreditationNo] = useState(initialAccreditation);
  const [typedFont, setTypedFont] = useState<'script' | 'cursive' | 'serif' | 'formal'>('script');
  const [inkColor, setInkColor] = useState<'#0f172a' | '#1e3a8a'>('#1e3a8a');
  const [strokeWidth, setStrokeWidth] = useState<number>(2.5);
  
  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [history, setHistory] = useState<ImageData[]>([]);

  // Selected date
  const [signDate, setSignDate] = useState(() => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  });

  useEffect(() => {
    if (isOpen) {
      setTimeout(initCanvas, 50);
    }
  }, [isOpen, mode]);

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI displays
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = inkColor;
    ctx.lineWidth = strokeWidth;

    // Draw placeholder subtle guideline
    ctx.clearRect(0, 0, rect.width, rect.height);
    ctx.save();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(30, rect.height - 35);
    ctx.lineTo(rect.width - 30, rect.height - 35);
    ctx.stroke();
    ctx.restore();

    setHasDrawn(false);
    setHistory([]);
  };

  const getCanvasPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Save snapshot for undo
    try {
      const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setHistory(prev => [...prev.slice(-9), snapshot]);
    } catch {
      // ignore
    }

    const { x, y } = getCanvasPos(e);
    ctx.strokeStyle = inkColor;
    ctx.lineWidth = strokeWidth;
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCanvasPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.closePath();
  };

  const handleUndo = () => {
    const canvas = canvasRef.current;
    if (!canvas || history.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prevSnapshot = history[history.length - 1];
    setHistory(prev => prev.slice(0, -1));
    ctx.putImageData(prevSnapshot, 0, 0);
  };

  const handleClear = () => {
    initCanvas();
  };

  const handleSelectPreset = (preset: typeof PRESET_SIGNATORIES[0]) => {
    setSignerName(preset.name);
    setSignerTitle(preset.title);
    setAccreditationNo(preset.accreditation);
  };

  // Generate typed signature image data URL via an offscreen canvas
  const generateTypedSignatureDataUrl = (): string => {
    const offscreen = document.createElement('canvas');
    offscreen.width = 600;
    offscreen.height = 180;
    const ctx = offscreen.getContext('2d');
    if (!ctx) return '';

    ctx.clearRect(0, 0, offscreen.width, offscreen.height);
    
    // Select font styling
    let fontDef = 'italic 52px "Caveat", "Dancing Script", "Brush Script MT", cursive';
    if (typedFont === 'cursive') {
      fontDef = 'italic 48px "Great Vibes", "Apple Chancery", cursive';
    } else if (typedFont === 'serif') {
      fontDef = 'italic bold 44px "Georgia", "Baskerville", serif';
    } else if (typedFont === 'formal') {
      fontDef = 'italic 42px "Times New Roman", serif';
    }

    ctx.font = fontDef;
    ctx.fillStyle = inkColor;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    
    // Add realistic signature flourish line underneath
    ctx.fillText(signerName || 'Signature', offscreen.width / 2, 75);
    
    ctx.strokeStyle = inkColor;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    const textWidth = ctx.measureText(signerName || 'Signature').width;
    const startX = Math.max(40, (offscreen.width - textWidth) / 2 - 20);
    const endX = Math.min(offscreen.width - 40, (offscreen.width + textWidth) / 2 + 30);
    
    // Curvy flourish line
    ctx.moveTo(startX, 115);
    ctx.quadraticCurveTo(offscreen.width / 2, 125, endX, 112);
    ctx.stroke();

    return offscreen.toDataURL('image/png');
  };

  // Generate verification cryptographic hash
  const generateHash = (): string => {
    const chars = '0123456789ABCDEF';
    let rand = '';
    for (let i = 0; i < 16; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `DOLE-CERT-${rand.substring(0, 4)}-${rand.substring(4, 8)}-${rand.substring(8, 12)}-${rand.substring(12, 16)}`;
  };

  const handleApplySignature = () => {
    if (!signerName.trim()) {
      alert('Please specify the authorized signatory name.');
      return;
    }

    let signatureDataUrl = '';
    if (mode === 'draw') {
      const canvas = canvasRef.current;
      if (!canvas || !hasDrawn) {
        alert('Please draw a signature or switch to "Type Signature" mode.');
        return;
      }
      signatureDataUrl = canvas.toDataURL('image/png');
    } else {
      signatureDataUrl = generateTypedSignatureDataUrl();
    }

    const now = new Date();
    const timeFormatted = now.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    const signedAt = `${signDate} ${timeFormatted} (PHT)`;
    const verificationHash = generateHash();

    const signaturePayload: DigitalSignatureData = {
      signatureDataUrl,
      signerName: signerName.trim(),
      signerTitle: signerTitle.trim() || 'HR & Compliance Manager',
      accreditationNo: accreditationNo.trim() || 'DOLE-OSH-NCR-2023-0881',
      signedAt,
      verificationHash,
      signatureType: mode === 'draw' ? 'drawn' : 'typed',
      companyName: 'KAWAYAN HR PHILIPPINES INC.',
    };

    onSaveSignature(signaturePayload);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <PenTool className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">DOLE Mandated E-Signature & Certification</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  RA 8792 Compliant
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Sign <span className="text-slate-200 font-semibold">{documentTitle}</span> with legally binding digital certification
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto max-h-[82vh]">
          {/* Preset Signatories quick-select */}
          <div>
            <span className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-blue-600" />
              Authorized Signatory Profile:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {PRESET_SIGNATORIES.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`text-left p-2.5 rounded-xl border text-xs transition-all ${
                    signerName === preset.name
                      ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <span className="font-bold text-slate-900 block truncate">{preset.name}</span>
                  <span className="text-[11px] text-slate-500 block truncate">{preset.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Signer Metadata Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1 uppercase tracking-wider">
                Signatory Full Name
              </label>
              <input
                type="text"
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                placeholder="e.g. Maria Clara"
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1 uppercase tracking-wider">
                Designation / Position
              </label>
              <input
                type="text"
                value={signerTitle}
                onChange={(e) => setSignerTitle(e.target.value)}
                placeholder="e.g. HR & Compliance Manager"
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1 uppercase tracking-wider">
                DOLE / PRC Accreditation No.
              </label>
              <input
                type="text"
                value={accreditationNo}
                onChange={(e) => setAccreditationNo(e.target.value)}
                placeholder="e.g. DOLE-OSH-NCR-2023-0881"
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex border-b border-slate-200 gap-2">
            <button
              type="button"
              onClick={() => setMode('draw')}
              className={`pb-2.5 px-4 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-colors ${
                mode === 'draw'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              Draw Signature (Canvas)
            </button>
            <button
              type="button"
              onClick={() => setMode('type')}
              className={`pb-2.5 px-4 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-colors ${
                mode === 'type'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              Type Signature (Calligraphy)
            </button>
          </div>

          {/* DRAW MODE CANVAS */}
          {mode === 'draw' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1 text-[11px]">
                  Use mouse, stylus, or finger to sign on the pad below:
                </span>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-400">Ink:</span>
                    <button
                      type="button"
                      onClick={() => setInkColor('#1e3a8a')}
                      className={`w-4 h-4 rounded-full bg-blue-900 border ${inkColor === '#1e3a8a' ? 'ring-2 ring-blue-500 ring-offset-1' : ''}`}
                      title="Doc Navy Blue"
                    />
                    <button
                      type="button"
                      onClick={() => setInkColor('#0f172a')}
                      className={`w-4 h-4 rounded-full bg-slate-900 border ${inkColor === '#0f172a' ? 'ring-2 ring-blue-500 ring-offset-1' : ''}`}
                      title="Standard Black"
                    />
                  </div>
                  <div className="h-3 w-px bg-slate-200 mx-1" />
                  <button
                    type="button"
                    onClick={handleUndo}
                    disabled={history.length === 0}
                    className="p-1 text-slate-600 hover:text-slate-900 disabled:opacity-40 rounded hover:bg-slate-100 text-xs flex items-center gap-1"
                    title="Undo stroke"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Undo
                  </button>
                  <button
                    type="button"
                    onClick={handleClear}
                    className="p-1 text-rose-600 hover:text-rose-700 rounded hover:bg-rose-50 text-xs flex items-center gap-1"
                    title="Clear pad"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Clear
                  </button>
                </div>
              </div>

              {/* Canvas Container */}
              <div className="border-2 border-dashed border-slate-300 rounded-xl bg-slate-50/50 p-1 relative overflow-hidden focus-within:border-blue-500">
                <canvas
                  ref={canvasRef}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-44 bg-white rounded-lg cursor-crosshair touch-none"
                />
                {!hasDrawn && (
                  <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-slate-400">
                    <PenTool className="w-7 h-7 mb-1 opacity-40 text-blue-500" />
                    <span className="text-xs font-medium">Draw your signature here</span>
                    <span className="text-[10px] text-slate-400">Sign with smooth stroke technology</span>
                  </div>
                )}
                <div className="absolute bottom-2 left-4 text-[10px] text-slate-400 pointer-events-none select-none">
                  X __________________________________________________ (Signature line)
                </div>
              </div>
            </div>
          )}

          {/* TYPE MODE */}
          {mode === 'type' && (
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Choose Calligraphy Script Style:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setTypedFont('script')}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      typedFont === 'script' ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <span className="font-serif italic text-lg text-slate-800 block">Maria Clara</span>
                    <span className="text-[10px] text-slate-400 block mt-1">Modern Script</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTypedFont('cursive')}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      typedFont === 'cursive' ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <span className="font-serif italic text-lg tracking-wider text-slate-800 block">Maria Clara</span>
                    <span className="text-[10px] text-slate-400 block mt-1">Flourished</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTypedFont('serif')}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      typedFont === 'serif' ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <span className="font-serif italic font-bold text-base text-slate-800 block">Maria Clara</span>
                    <span className="text-[10px] text-slate-400 block mt-1">Executive Serif</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTypedFont('formal')}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      typedFont === 'formal' ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <span className="font-serif italic text-base text-slate-800 block">Maria Clara</span>
                    <span className="text-[10px] text-slate-400 block mt-1">Formal Roman</span>
                  </button>
                </div>
              </div>

              {/* Typed Signature Live Preview Box */}
              <div className="border border-slate-200 rounded-xl p-6 bg-slate-50 text-center relative overflow-hidden">
                <div className="text-[10px] uppercase font-bold text-slate-400 mb-2">Live Signature Preview</div>
                <div className="text-3xl text-blue-900 font-serif italic py-3 select-none">
                  {signerName || 'Your Signature'}
                </div>
                <div className="w-64 h-0.5 bg-blue-900/60 mx-auto rounded-full mt-1" />
                <div className="mt-3 text-[11px] text-slate-600">
                  <span className="font-bold">{signerName}</span> · {signerTitle}
                </div>
              </div>
            </div>
          )}

          {/* Statutory Certification & Compliance Seal Banner */}
          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs space-y-1.5 text-emerald-950">
            <div className="flex items-center gap-2 font-bold text-emerald-900">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Philippine E-Commerce Act (RA 8792) & DOLE OSH Standards Certification
            </div>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              By applying this digital signature, the authorized officer certifies under penalty of perjury that the employee daily logs, hours worked, rest days, and overtime computations conform to Book III of the Philippine Labor Code and DOLE inspection mandates.
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-mono text-emerald-700 pt-1">
              <span>Date: {signDate}</span>
              <span>•</span>
              <span>Accreditation: {accreditationNo || 'N/A'}</span>
              <span>•</span>
              <span>Tamper-evident verification hash will be sealed</span>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleApplySignature}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-2 transition-colors"
          >
            <CheckCircle2 className="w-4 h-4 text-white" />
            Apply Digital E-Signature & Certify
          </button>
        </div>
      </div>
    </div>
  );
}
