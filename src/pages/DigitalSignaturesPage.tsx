import React, { useState, useEffect, useRef } from 'react';
import { 
  PenTool, ShieldCheck, Upload, CheckCircle2, Plus, 
  Trash2, Edit3, Award, Building2, User, Download, 
  RefreshCw, Check, ArrowRight, FileText, Layers,
  Lock, AlertCircle, Sparkles, Filter, Search, RotateCcw,
  Sliders, Eye, Image as ImageIcon, Type, ExternalLink
} from 'lucide-react';
import { 
  AuthorizedSignatory, 
  DocumentCategory, 
  DOCUMENT_CATEGORY_CONFIG,
  SignatureRepositorySettings,
  signatureRepository, 
  removeWhiteBackgroundFromImage 
} from '../lib/signature-repository';

export function DigitalSignaturesPage() {
  const [signatories, setSignatories] = useState<AuthorizedSignatory[]>([]);
  const [settings, setSettings] = useState<SignatureRepositorySettings>(signatureRepository.getSettings());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSignatoryId, setEditingSignatoryId] = useState<string | null>(null);
  
  // Modal Form State
  const [inputMode, setInputMode] = useState<'upload' | 'draw' | 'type'>('upload');
  const [fullName, setFullName] = useState('');
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('People & Culture');
  const [email, setEmail] = useState('');
  const [tin, setTin] = useState('');
  const [prcLicenseNo, setPrcLicenseNo] = useState('');
  const [doleAccreditationNo, setDoleAccreditationNo] = useState('');
  const [ibpRollNo, setIbpRollNo] = useState('');
  const [boardResolutionRef, setBoardResolutionRef] = useState('');
  const [inkColor, setInkColor] = useState<string>('#1e3a8a');
  const [isDefaultGlobal, setIsDefaultGlobal] = useState(false);
  const [assignedCategories, setAssignedCategories] = useState<DocumentCategory[]>([]);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string>('');

  // Canvas Drawing State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [strokeWidth, setStrokeWidth] = useState(2.5);

  // Upload processing state
  const [uploadedRawFile, setUploadedRawFile] = useState<string | null>(null);
  const [autoRemoveBg, setAutoRemoveBg] = useState(true);
  const [bgThreshold, setBgThreshold] = useState(225);
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  // Typed Font style
  const [typedFont, setTypedFont] = useState<'script' | 'cursive' | 'formal' | 'elegant'>('script');

  // Notifications
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Subscribe to central repository updates
  useEffect(() => {
    const loadData = () => {
      setSignatories(signatureRepository.getSignatories());
      setSettings(signatureRepository.getSettings());
    };
    loadData();
    const unsubscribe = signatureRepository.subscribe(loadData);
    return () => unsubscribe();
  }, []);

  // Show temporary toast
  const showToast = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  // Toggle global settings
  const handleToggleAutoApply = () => {
    const updated = { ...settings, autoApplySignatures: !settings.autoApplySignatures };
    setSettings(updated);
    signatureRepository.saveSettings(updated);
    showToast(
      updated.autoApplySignatures
        ? 'Auto-apply enabled: Authorized signatures will now appear automatically on all generated documents'
        : 'Auto-apply disabled: Signatures must now be manually selected per document'
    );
  };

  const handleToggleCryptographicSeal = () => {
    const updated = { ...settings, includeCryptographicSeal: !settings.includeCryptographicSeal };
    setSettings(updated);
    signatureRepository.saveSettings(updated);
    showToast('Cryptographic seal preference updated');
  };

  // Category quick assign handler
  const handleQuickAssignCategory = (cat: DocumentCategory, signatoryId: string) => {
    signatureRepository.setCategoryDefault(cat, signatoryId);
    showToast(`Default for ${DOCUMENT_CATEGORY_CONFIG[cat].label} updated`);
  };

  // Open modal for new
  const handleOpenAddModal = () => {
    setEditingSignatoryId(null);
    setInputMode('upload');
    setFullName('');
    setTitle('');
    setDepartment('People & Culture');
    setEmail('');
    setTin('123-456-789-000');
    setPrcLicenseNo('');
    setDoleAccreditationNo('');
    setIbpRollNo('');
    setBoardResolutionRef('');
    setInkColor('#1e3a8a');
    setIsDefaultGlobal(signatories.length === 0);
    setAssignedCategories([]);
    setSignatureDataUrl('');
    setUploadedRawFile(null);
    setHasDrawn(false);
    setIsModalOpen(true);
  };

  // Open modal for edit
  const handleOpenEditModal = (sig: AuthorizedSignatory) => {
    setEditingSignatoryId(sig.id);
    setInputMode(sig.signatureType === 'uploaded' ? 'upload' : sig.signatureType === 'drawn' ? 'draw' : 'type');
    setFullName(sig.fullName);
    setTitle(sig.title);
    setDepartment(sig.department);
    setEmail(sig.email);
    setTin(sig.tin);
    setPrcLicenseNo(sig.prcLicenseNo || '');
    setDoleAccreditationNo(sig.doleAccreditationNo || '');
    setIbpRollNo(sig.ibpRollNo || '');
    setBoardResolutionRef(sig.boardResolutionRef || '');
    setInkColor(sig.inkColor || '#1e3a8a');
    setIsDefaultGlobal(sig.isDefaultGlobal);
    setAssignedCategories(sig.defaultForCategories || []);
    setSignatureDataUrl(sig.signatureDataUrl);
    setUploadedRawFile(null);
    setHasDrawn(true);
    setIsModalOpen(true);
  };

  // Canvas drawing handlers
  useEffect(() => {
    if (isModalOpen && inputMode === 'draw') {
      const timer = setTimeout(initCanvas, 50);
      return () => clearTimeout(timer);
    }
  }, [isModalOpen, inputMode, inkColor, strokeWidth]);

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = inkColor;
    ctx.lineWidth = strokeWidth;

    // Draw baseline guide
    ctx.save();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(20, rect.height - 30);
    ctx.lineTo(rect.width - 20, rect.height - 30);
    ctx.stroke();
    ctx.restore();
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawn(true);

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.strokeStyle = inkColor;
    ctx.lineWidth = strokeWidth;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      setSignatureDataUrl(canvas.toDataURL('image/png'));
    }
  };

  const clearCanvas = () => {
    setHasDrawn(false);
    setSignatureDataUrl('');
    initCanvas();
  };

  // Upload file handling
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      setUploadedRawFile(dataUrl);

      if (autoRemoveBg) {
        setIsProcessingImage(true);
        try {
          const transparent = await removeWhiteBackgroundFromImage(dataUrl, bgThreshold, inkColor);
          setSignatureDataUrl(transparent);
        } catch (err) {
          console.error('Failed to remove bg', err);
          setSignatureDataUrl(dataUrl);
        } finally {
          setIsProcessingImage(false);
        }
      } else {
        setSignatureDataUrl(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  // Reprocess background removal if threshold/color changes
  const reprocessImage = async (newThreshold: number, color: string) => {
    if (!uploadedRawFile) return;
    setIsProcessingImage(true);
    try {
      const transparent = await removeWhiteBackgroundFromImage(uploadedRawFile, newThreshold, color);
      setSignatureDataUrl(transparent);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessingImage(false);
    }
  };

  // Typed signature generation
  const generateTypedSignatureSvg = (text: string, fontType: string, color: string) => {
    const encoded = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    let fontCSS = "'Brush Script MT', cursive";
    if (fontType === 'cursive') fontCSS = "'Dancing Script', 'Segoe Script', cursive";
    if (fontType === 'formal') fontCSS = "Georgia, serif, italic";
    if (fontType === 'elegant') fontCSS = "'Caveat', cursive";

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 450 140" width="450" height="140">
      <defs>
        <filter id="ink-spread" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="0.4" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <g stroke="${color}" stroke-linecap="round" stroke-linejoin="round" fill="none">
        <path d="M 35 95 C 110 115, 260 120, 395 75 C 330 95, 180 108, 90 92" stroke-width="1.8" opacity="0.65" />
        <path d="M 70 105 Q 210 98 380 68" stroke-width="1.4" opacity="0.8" />
      </g>
      <text x="50" y="85" font-family="${fontCSS}" font-size="36" font-style="italic" font-weight="600" fill="${color}" opacity="0.95" transform="rotate(-2 50 85)">
        ${encoded || 'Authorized Signature'}
      </text>
    </svg>`;

    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  };

  // Generate typed signature on the fly
  useEffect(() => {
    if (inputMode === 'type' && fullName) {
      const generated = generateTypedSignatureSvg(fullName, typedFont, inkColor);
      setSignatureDataUrl(generated);
    }
  }, [inputMode, fullName, typedFont, inkColor]);

  // Save Signatory
  const handleSaveSignatory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      alert('Please enter the full legal name of the authorized signatory.');
      return;
    }
    if (!signatureDataUrl) {
      alert('Please upload, draw, or generate a signature first.');
      return;
    }

    if (editingSignatoryId) {
      signatureRepository.updateSignatory(editingSignatoryId, {
        fullName,
        title,
        department,
        email,
        tin,
        prcLicenseNo,
        doleAccreditationNo,
        ibpRollNo,
        boardResolutionRef,
        signatureDataUrl,
        signatureType: inputMode === 'upload' ? 'uploaded' : inputMode === 'draw' ? 'drawn' : 'typed',
        inkColor,
        isDefaultGlobal,
        defaultForCategories: assignedCategories,
      });
      showToast(`Signatory ${fullName} updated successfully`);
    } else {
      signatureRepository.addSignatory({
        fullName,
        title,
        department,
        email,
        tin,
        prcLicenseNo,
        doleAccreditationNo,
        ibpRollNo,
        boardResolutionRef,
        signatureDataUrl,
        signatureType: inputMode === 'upload' ? 'uploaded' : inputMode === 'draw' ? 'drawn' : 'typed',
        inkColor,
        isDefaultGlobal,
        defaultForCategories: assignedCategories,
        status: 'active',
      });
      showToast(`Authorized signatory ${fullName} registered successfully`);
    }

    setIsModalOpen(false);
  };

  // Delete signatory
  const handleDeleteSignatory = (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove ${name} from the authorized signature repository?`)) {
      signatureRepository.deleteSignatory(id, true);
      showToast(`Signatory ${name} removed`);
    }
  };

  // Set global default
  const handleSetGlobalDefault = (id: string) => {
    signatureRepository.updateSignatory(id, { isDefaultGlobal: true });
    showToast('Global default signatory updated');
  };

  // Export JSON backup
  const handleExportBackup = () => {
    const json = signatureRepository.exportBackup();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Kawayan_Signature_Repository_Backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    showToast('Signature repository backup downloaded');
  };

  // Import JSON backup
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = signatureRepository.importBackup(content);
      if (res.success) {
        showToast(`Imported ${res.count} authorized signatories successfully`);
      } else {
        alert(`Failed to import backup: ${res.error}`);
      }
    };
    reader.readAsText(file);
  };

  // Filtered signatories
  const filteredSignatories = signatories.filter((s) => {
    const matchesSearch = 
      s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.tin.includes(searchQuery);

    const matchesCategory = 
      selectedCategoryFilter === 'all' ||
      s.defaultForCategories?.includes(selectedCategoryFilter as DocumentCategory);

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Feedback Toast */}
      {feedbackMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-2.5 text-xs animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="p-2 bg-blue-600 text-white rounded-xl shadow-xs">
              <PenTool className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Central Digital Signature Repository
            </h1>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200 font-mono">
              RA 8792 E-Commerce Valid
            </span>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 font-mono">
              Auto-Apply Ready
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1 max-w-3xl">
            Upload authorized corporate signatures once to automatically seal and sign BIR tax certificates (Forms 2307 & 2316), DOLE inspection logs, employee payslips, and legal policy promulgations across the portal.
          </p>
        </div>

        {/* Global Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <label className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-xs cursor-pointer transition-colors">
            <Upload className="w-3.5 h-3.5 text-slate-600" />
            Import Backup
            <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
          </label>
          <button
            onClick={handleExportBackup}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            Export Backup
          </button>
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            Register Authorized Signatory
          </button>
        </div>
      </div>

      {/* Auto-Apply Global Control & Document Mapping Strip */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Global Automation Toggle Card */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-sm border border-slate-700 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                Central Automation Engine
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                settings.autoApplySignatures ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-700 text-slate-400'
              }`}>
                {settings.autoApplySignatures ? 'ACTIVE' : 'PAUSED'}
              </span>
            </div>

            <div>
              <h3 className="text-lg font-bold">Auto-Apply Signatures</h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                When enabled, whenever an HR officer generates or views BIR Form 2307, BIR 2316, DOLE inspection logs, or payslips, the system automatically binds the authorized signature and applies a tamper-evident RA 8792 cryptographic seal.
              </p>
            </div>

            {/* Switch Toggle */}
            <div className="pt-2 border-t border-slate-700/80 space-y-3">
              <div 
                onClick={handleToggleAutoApply}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 cursor-pointer transition-colors"
              >
                <div>
                  <span className="font-semibold text-xs text-white block">Auto-Sign Generated Documents</span>
                  <span className="text-[11px] text-slate-400">Apply designated category signatory</span>
                </div>
                <div className={`w-11 h-6 flex items-center rounded-full p-1 duration-200 cursor-pointer ${
                  settings.autoApplySignatures ? 'bg-blue-600' : 'bg-slate-600'
                }`}>
                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-200 ${
                    settings.autoApplySignatures ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </div>
              </div>

              <div 
                onClick={handleToggleCryptographicSeal}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 cursor-pointer transition-colors"
              >
                <div>
                  <span className="font-semibold text-xs text-white block">RA 8792 Verification Hash</span>
                  <span className="text-[11px] text-slate-400">Include tamper-evident cryptographic seal</span>
                </div>
                <div className={`w-11 h-6 flex items-center rounded-full p-1 duration-200 cursor-pointer ${
                  settings.includeCryptographicSeal ? 'bg-blue-600' : 'bg-slate-600'
                }`}>
                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-200 ${
                    settings.includeCryptographicSeal ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-700 text-[11px] text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Complies with Philippine E-Commerce Act (RA 8792) rules on digital signatures.</span>
          </div>
        </div>

        {/* Right: Document Category Binding Matrix (2 columns span) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Document Category Signatory Mapping</h3>
                <p className="text-xs text-slate-500">Designate which authorized officer automatically signs each legal document type.</p>
              </div>
              <span className="text-xs font-mono text-slate-400">6 Form Categories</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
              {(Object.keys(DOCUMENT_CATEGORY_CONFIG) as DocumentCategory[]).map((catKey) => {
                const config = DOCUMENT_CATEGORY_CONFIG[catKey];
                const assigned = signatureRepository.getDefaultSignatoryForCategory(catKey);

                return (
                  <div key={catKey} className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors flex flex-col justify-between gap-2">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{config.label}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{catKey}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{config.description}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {assigned?.signatureDataUrl ? (
                          <div className="w-12 h-6 bg-white border border-slate-200 rounded flex items-center justify-center p-0.5 shrink-0">
                            <img src={assigned.signatureDataUrl} alt="" className="max-h-full max-w-full object-contain" />
                          </div>
                        ) : (
                          <div className="w-12 h-6 bg-slate-200 rounded flex items-center justify-center shrink-0 text-[9px] text-slate-400">
                            None
                          </div>
                        )}
                        <div className="min-w-0">
                          <span className="text-xs font-semibold text-slate-800 block truncate">
                            {assigned ? assigned.fullName : 'No Signatory Assigned'}
                          </span>
                          <span className="text-[10px] text-slate-500 block truncate">
                            {assigned ? assigned.title : config.defaultSignerRole}
                          </span>
                        </div>
                      </div>

                      {/* Select Dropdown to reassign */}
                      <select
                        value={assigned?.id || ''}
                        onChange={(e) => handleQuickAssignCategory(catKey, e.target.value)}
                        className="text-xs bg-white border border-slate-300 rounded-lg px-2 py-1 text-slate-700 font-medium focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                      >
                        {signatories.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.fullName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-2">
            <span>Changes take effect immediately on all open document generators.</span>
            <span className="font-mono text-[11px] text-slate-400">Total Registered Signatories: {signatories.length}</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, title, TIN, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-500">Filter Category:</span>
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 font-medium focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All Document Types</option>
            {Object.entries(DOCUMENT_CATEGORY_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Signatories Roster Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {filteredSignatories.map((sig) => {
          return (
            <div
              key={sig.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between gap-5 relative group"
            >
              {/* Card Header & Badges */}
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-base text-slate-900 tracking-tight">{sig.fullName}</h3>
                      {sig.isDefaultGlobal && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200 font-mono">
                          Global Default
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono">
                        {sig.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium mt-0.5">{sig.title}</p>
                    <p className="text-[11px] text-slate-400">{sig.department} • {sig.email}</p>
                  </div>

                  {/* Actions dropdown/buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(sig)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Signatory Details"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteSignatory(sig.id, sig.fullName)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete Signatory"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Signature Graphic Display Area */}
                <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center relative overflow-hidden">
                  <div className="h-24 w-full flex items-center justify-center">
                    {sig.signatureDataUrl ? (
                      <img
                        src={sig.signatureDataUrl}
                        alt={`${sig.fullName} signature`}
                        className="max-h-20 max-w-full object-contain filter drop-shadow-xs"
                      />
                    ) : (
                      <div className="text-xs text-slate-400 italic">No signature specimen attached</div>
                    )}
                  </div>
                  <div className="w-4/5 border-b border-slate-300 mt-2" />
                  <span className="text-[10px] text-slate-400 font-mono mt-1 uppercase tracking-wider">
                    {sig.signatureType} Specimen Signature • {sig.inkColor}
                  </span>
                </div>

                {/* Credentials & Statutory Meta */}
                <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-50/80 border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">BIR TIN</span>
                    <span className="font-mono font-semibold text-slate-800 text-[11px]">{sig.tin}</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50/80 border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Professional License</span>
                    <span className="font-mono font-semibold text-slate-800 text-[11px] truncate block">
                      {sig.prcLicenseNo || sig.doleAccreditationNo || sig.ibpRollNo || 'Corporate Authorized'}
                    </span>
                  </div>
                </div>

                {sig.boardResolutionRef && (
                  <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1.5">
                    <Lock className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">Authority: {sig.boardResolutionRef}</span>
                  </div>
                )}

                {/* Assigned Categories Badges */}
                <div className="mt-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">
                    Default Auto-Sign Assignments
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {sig.defaultForCategories && sig.defaultForCategories.length > 0 ? (
                      sig.defaultForCategories.map((c) => (
                        <span
                          key={c}
                          className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200"
                        >
                          {DOCUMENT_CATEGORY_CONFIG[c]?.label || c}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">No default document assignment</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Quick Actions */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                {!sig.isDefaultGlobal ? (
                  <button
                    onClick={() => handleSetGlobalDefault(sig.id)}
                    className="text-blue-600 hover:text-blue-800 font-semibold text-xs transition-colors"
                  >
                    Make Global Default
                  </button>
                ) : (
                  <span className="text-xs text-blue-700 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Primary Signatory
                  </span>
                )}

                <a
                  href={sig.signatureDataUrl}
                  download={`${sig.fullName.replace(/\s+/g, '_')}_Signature_Specimen.png`}
                  className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 font-medium transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Specimen PNG
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {filteredSignatories.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
          <PenTool className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">No matching authorized signatories found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try adjusting your search query or filter, or register a new authorized company officer.
          </p>
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            Register New Signatory
          </button>
        </div>
      )}

      {/* ============================================================== */}
      {/* ADD / EDIT SIGNATORY MODAL                                    */}
      {/* ============================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[92vh]">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                  <PenTool className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base tracking-tight">
                    {editingSignatoryId ? 'Edit Authorized Digital Signatory' : 'Register Authorized Digital Signatory'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Compliant with Republic Act 8792 & Philippine Labor Code
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                X
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <form onSubmit={handleSaveSignatory} className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Signature Specimen Capture Method Tabs */}
              <div>
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
                  1. Capture / Upload Signature Specimen
                </label>
                <div className="flex border border-slate-200 rounded-xl p-1 bg-slate-100 gap-1 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setInputMode('upload')}
                    className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                      inputMode === 'upload' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Upload Image (PNG/JPG)
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputMode('draw')}
                    className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                      inputMode === 'draw' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    Draw on Canvas
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputMode('type')}
                    className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                      inputMode === 'type' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Type className="w-3.5 h-3.5" />
                    Type Signature
                  </button>
                </div>

                {/* Mode 1: Upload */}
                {inputMode === 'upload' && (
                  <div className="mt-4 space-y-3">
                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-blue-500 transition-colors bg-slate-50/50">
                      <ImageIcon className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <label className="cursor-pointer">
                        <span className="text-xs font-bold text-blue-600 hover:text-blue-700">Click to browse</span>
                        <span className="text-xs text-slate-500"> or drag and drop signature scan (PNG, JPG, SVG)</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                      <p className="text-[11px] text-slate-400 mt-1">Recommended: clean signature on white paper</p>
                    </div>

                    {/* Background Transparency Filter Controls */}
                    {uploadedRawFile && (
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                            <input
                              type="checkbox"
                              checked={autoRemoveBg}
                              onChange={(e) => {
                                setAutoRemoveBg(e.target.checked);
                                if (e.target.checked) {
                                  reprocessImage(bgThreshold, inkColor);
                                } else if (uploadedRawFile) {
                                  setSignatureDataUrl(uploadedRawFile);
                                }
                              }}
                              className="w-4 h-4 text-blue-600 rounded"
                            />
                            <span>Automatically make white background transparent</span>
                          </label>
                          {isProcessingImage && <span className="text-[10px] text-blue-600 animate-pulse">Processing...</span>}
                        </div>

                        {autoRemoveBg && (
                          <div className="flex items-center gap-3 pt-1">
                            <span className="text-slate-500 text-[11px]">Threshold:</span>
                            <input
                              type="range"
                              min="180"
                              max="250"
                              value={bgThreshold}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setBgThreshold(val);
                                reprocessImage(val, inkColor);
                              }}
                              className="flex-1"
                            />
                            <span className="font-mono text-[11px] text-slate-600">{bgThreshold}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Mode 2: Draw */}
                {inputMode === 'draw' && (
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Draw signature using mouse, touchpad, or stylus pen:</span>
                      <button
                        type="button"
                        onClick={clearCanvas}
                        className="text-rose-600 hover:text-rose-800 text-xs font-semibold flex items-center gap-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Clear Canvas
                      </button>
                    </div>

                    <div className="relative border-2 border-slate-300 rounded-xl bg-white overflow-hidden shadow-inner">
                      <canvas
                        ref={canvasRef}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                        className="w-full h-36 cursor-crosshair touch-none"
                      />
                    </div>
                  </div>
                )}

                {/* Mode 3: Type */}
                {inputMode === 'type' && (
                  <div className="mt-4 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs text-slate-500">Handwriting Style:</span>
                      {(['script', 'cursive', 'formal', 'elegant'] as const).map((font) => (
                        <button
                          key={font}
                          type="button"
                          onClick={() => setTypedFont(font)}
                          className={`px-3 py-1 text-xs rounded-lg border font-medium capitalize transition-colors ${
                            typedFont === font
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {font}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ink Color Picker & Live Preview */}
                <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-600 font-medium">Ink Color:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setInkColor('#1e3a8a');
                        if (uploadedRawFile && autoRemoveBg) reprocessImage(bgThreshold, '#1e3a8a');
                      }}
                      className={`w-6 h-6 rounded-full border-2 bg-blue-900 transition-all ${
                        inkColor === '#1e3a8a' ? 'border-blue-600 scale-110 shadow-xs' : 'border-white'
                      }`}
                      title="Philippine Executive Navy"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setInkColor('#0f172a');
                        if (uploadedRawFile && autoRemoveBg) reprocessImage(bgThreshold, '#0f172a');
                      }}
                      className={`w-6 h-6 rounded-full border-2 bg-slate-900 transition-all ${
                        inkColor === '#0f172a' ? 'border-blue-600 scale-110 shadow-xs' : 'border-white'
                      }`}
                      title="Classic Slate"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setInkColor('#000000');
                        if (uploadedRawFile && autoRemoveBg) reprocessImage(bgThreshold, '#000000');
                      }}
                      className={`w-6 h-6 rounded-full border-2 bg-black transition-all ${
                        inkColor === '#000000' ? 'border-blue-600 scale-110 shadow-xs' : 'border-white'
                      }`}
                      title="Formal Black"
                    />
                  </div>

                  {/* Specimen Preview */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">Preview:</span>
                    <div className="h-10 w-36 bg-white border border-slate-300 rounded p-1 flex items-center justify-center shadow-2xs">
                      {signatureDataUrl ? (
                        <img src={signatureDataUrl} alt="Preview" className="max-h-full max-w-full object-contain" />
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">No specimen</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Signatory Profile Details Form */}
              <div>
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-3">
                  2. Authorized Signatory Profile & Government Credentials
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Full Legal Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Carmela Bautista, CPA"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Official Title / Designation <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Finance Controller / Authorized Signatory"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Department</label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Official Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="carmela.bautista@kawayanhr.ph"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Philippine BIR TIN <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={tin}
                      onChange={(e) => setTin(e.target.value)}
                      placeholder="000-000-000-000"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      PRC License / IBP Roll / DOLE OSH #
                    </label>
                    <input
                      type="text"
                      value={prcLicenseNo || doleAccreditationNo || ibpRollNo}
                      onChange={(e) => setPrcLicenseNo(e.target.value)}
                      placeholder="e.g. PRC CPA #0098231 or DOLE-OSH-2023"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-700 font-semibold mb-1">
                      Corporate Authority Reference (Board Res. / Secretary Certificate)
                    </label>
                    <input
                      type="text"
                      value={boardResolutionRef}
                      onChange={(e) => setBoardResolutionRef(e.target.value)}
                      placeholder="e.g. Board Resolution No. 2024-11 (Authorized Withholding Tax Signatory)"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Category Auto-Sign Defaults */}
              <div>
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
                  3. Automatic Document Category Assignments
                </label>
                <p className="text-xs text-slate-500 mb-3">
                  Check which generated documents should automatically use this signatory:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  {(Object.keys(DOCUMENT_CATEGORY_CONFIG) as DocumentCategory[]).map((catKey) => {
                    const isChecked = assignedCategories.includes(catKey);
                    return (
                      <label
                        key={catKey}
                        className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-colors ${
                          isChecked ? 'bg-blue-50/70 border-blue-400' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setAssignedCategories([...assignedCategories, catKey]);
                            } else {
                              setAssignedCategories(assignedCategories.filter((c) => c !== catKey));
                            }
                          }}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <div>
                          <span className="font-bold text-slate-900 block">{DOCUMENT_CATEGORY_CONFIG[catKey].label}</span>
                          <span className="text-[11px] text-slate-500 line-clamp-1">
                            {DOCUMENT_CATEGORY_CONFIG[catKey].description}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>

                <div className="mt-3 pt-3 border-t border-slate-200">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 font-medium">
                    <input
                      type="checkbox"
                      checked={isDefaultGlobal}
                      onChange={(e) => setIsDefaultGlobal(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span>Set as <strong>Primary Global Default Signatory</strong> for unassigned forms</span>
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
                >
                  {editingSignatoryId ? 'Save Changes' : 'Register Authorized Signatory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
