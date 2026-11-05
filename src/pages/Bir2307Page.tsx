import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, Download, Printer, User, Building2, 
  Search, ShieldCheck, CheckCircle2, Plus, Trash2, 
  RotateCcw, Sparkles, Scale, Receipt, ArrowLeft,
  Users, Calendar, DollarSign, PenTool, ExternalLink
} from 'lucide-react';
import { 
  MOCK_CONTRACTORS, DEFAULT_PAYOR, ATC_CODES, 
  Bir2307Data, Form2307LineItem, ContractorPayee,
  getQuarterDates, computeForm2307Totals, generateSawtCsv 
} from '../lib/bir-2307';
import { Bir2307Document } from '../components/tax/Bir2307Document';
import { ESignatureModal, DigitalSignatureData } from '../components/common/ESignatureModal';
import { 
  AuthorizedSignatory, 
  signatureRepository 
} from '../lib/signature-repository';
import { SignaturePickerModal } from '../components/signatures/SignaturePickerModal';

export function Bir2307Page() {
  const [selectedPayeeId, setSelectedPayeeId] = useState<string>('cont-001');
  const [taxYear, setTaxYear] = useState<number>(2026);
  const [quarter, setQuarter] = useState<'Q1' | 'Q2' | 'Q3' | 'Q4'>('Q3');
  const [activeTab, setActiveTab] = useState<'editor' | 'batch' | 'atc-matrix'>('editor');
  
  // Custom payee input state
  const [payeeTin, setPayeeTin] = useState<string>(MOCK_CONTRACTORS[0].tin);
  const [payeeName, setPayeeName] = useState<string>(MOCK_CONTRACTORS[0].name);
  const [payeeTradeName, setPayeeTradeName] = useState<string>(MOCK_CONTRACTORS[0].tradeName || '');
  const [payeeAddress, setPayeeAddress] = useState<string>(MOCK_CONTRACTORS[0].registeredAddress);
  const [payeeZip, setPayeeZip] = useState<string>(MOCK_CONTRACTORS[0].zipCode);
  const [payeeType, setPayeeType] = useState<'Individual' | 'Non-Individual'>('Individual');

  // Line items state
  const [lineItems, setLineItems] = useState<Form2307LineItem[]>([
    {
      id: 'item-1',
      natureOfPayment: 'Professional / Talent fees - Individual (<= ₱3M)',
      atcCode: 'WI010',
      month1Payment: 45000,
      month2Payment: 45000,
      month3Payment: 45000,
      taxRate: 0.05,
    }
  ]);

  // Central Repository & E-Signature state
  const [isSignModalOpen, setIsSignModalOpen] = useState<boolean>(false);
  const [isPickerModalOpen, setIsPickerModalOpen] = useState<boolean>(false);
  const [selectedSignatory, setSelectedSignatory] = useState<AuthorizedSignatory | null>(() => {
    return signatureRepository.resolveSignatureForDocument('tax-2307').signatory;
  });
  const [signature, setSignature] = useState<DigitalSignatureData | null>(null);

  // Auto-sync with repository updates
  useEffect(() => {
    const syncRepo = () => {
      const resolved = signatureRepository.resolveSignatureForDocument('tax-2307');
      if (!signature) {
        setSelectedSignatory(resolved.signatory);
      }
    };
    return signatureRepository.subscribe(syncRepo);
  }, [signature]);

  // Quarter date ranges
  const quarterDates = useMemo(() => {
    return getQuarterDates(quarter, taxYear);
  }, [quarter, taxYear]);

  // Handle Contractor Selection
  const handleSelectContractor = (contId: string) => {
    setSelectedPayeeId(contId);
    if (!contId) return;

    const cont = MOCK_CONTRACTORS.find(c => c.id === contId);
    if (cont) {
      setPayeeTin(cont.tin);
      setPayeeName(cont.name);
      setPayeeTradeName(cont.tradeName || '');
      setPayeeAddress(cont.registeredAddress);
      setPayeeZip(cont.zipCode);
      setPayeeType(cont.type);

      const atc = ATC_CODES.find(a => a.code === cont.defaultAtc) || ATC_CODES[0];
      setLineItems([
        {
          id: `item-${Date.now()}`,
          natureOfPayment: atc.description,
          atcCode: atc.code,
          month1Payment: cont.defaultMonthlyRetainer,
          month2Payment: cont.defaultMonthlyRetainer,
          month3Payment: cont.defaultMonthlyRetainer,
          taxRate: atc.defaultRate,
        }
      ]);
    }
  };

  // Add line item
  const handleAddLineItem = () => {
    const defaultAtc = ATC_CODES[0];
    const newItem: Form2307LineItem = {
      id: `item-${Date.now()}`,
      natureOfPayment: defaultAtc.description,
      atcCode: defaultAtc.code,
      month1Payment: 25000,
      month2Payment: 25000,
      month3Payment: 25000,
      taxRate: defaultAtc.defaultRate,
    };
    setLineItems(prev => [...prev, newItem]);
  };

  // Remove line item
  const handleRemoveLineItem = (id: string) => {
    if (lineItems.length <= 1) return;
    setLineItems(prev => prev.filter(item => item.id !== id));
  };

  // Update line item ATC
  const handleUpdateAtc = (itemId: string, atcCode: string) => {
    const atc = ATC_CODES.find(a => a.code === atcCode);
    if (!atc) return;

    setLineItems(prev => prev.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          atcCode: atc.code,
          natureOfPayment: atc.description,
          taxRate: atc.defaultRate,
        };
      }
      return item;
    }));
  };

  // Update line item payment amount
  const handleUpdatePayment = (itemId: string, monthIdx: 1 | 2 | 3, amount: number) => {
    setLineItems(prev => prev.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          [`month${monthIdx}Payment`]: Math.max(0, amount),
        };
      }
      return item;
    }));
  };

  // Assembled 2307 Document Data
  const form2307Data: Bir2307Data = useMemo(() => {
    return {
      formVersion: 'Revised January 2018 (ENCS)',
      taxYear,
      periodQuarter: quarter,
      periodFrom: quarterDates.from,
      periodTo: quarterDates.to,
      payeeTin,
      payeeType,
      payeeName,
      payeeTradeName: payeeTradeName || undefined,
      payeeAddress,
      payeeZipCode: payeeZip,
      payorTin: DEFAULT_PAYOR.tin,
      payorName: DEFAULT_PAYOR.name,
      payorAddress: DEFAULT_PAYOR.address,
      payorZipCode: DEFAULT_PAYOR.zipCode,
      lineItems,
      authorizedSignatory: selectedSignatory?.fullName || signature?.signerName || DEFAULT_PAYOR.signatory,
      signatoryTitle: selectedSignatory?.title || signature?.signerTitle || DEFAULT_PAYOR.signatoryTitle,
      signatoryTin: selectedSignatory?.tin || DEFAULT_PAYOR.signatoryTin,
      signingDate: signature?.signedAt || new Date().toISOString().split('T')[0],
      digitalSignatureUrl: signature?.signatureDataUrl || selectedSignatory?.signatureDataUrl,
      verificationHash: signature?.verificationHash || (selectedSignatory ? signatureRepository.generateTamperEvidentHash(selectedSignatory, 'BIR-2307') : ''),
    };
  }, [
    taxYear, quarter, quarterDates, payeeTin, payeeType, payeeName, 
    payeeTradeName, payeeAddress, payeeZip, lineItems, signature, selectedSignatory
  ]);

  // Aggregate totals
  const totals = useMemo(() => {
    return computeForm2307Totals(lineItems);
  }, [lineItems]);

  // Batch 2307 list for all mock contractors
  const batchDataList: Bir2307Data[] = useMemo(() => {
    return MOCK_CONTRACTORS.map(cont => {
      const atc = ATC_CODES.find(a => a.code === cont.defaultAtc) || ATC_CODES[0];
      return {
        formVersion: 'Revised January 2018 (ENCS)',
        taxYear,
        periodQuarter: quarter,
        periodFrom: quarterDates.from,
        periodTo: quarterDates.to,
        payeeTin: cont.tin,
        payeeType: cont.type,
        payeeName: cont.name,
        payeeTradeName: cont.tradeName,
        payeeAddress: cont.registeredAddress,
        payeeZipCode: cont.zipCode,
        payorTin: DEFAULT_PAYOR.tin,
        payorName: DEFAULT_PAYOR.name,
        payorAddress: DEFAULT_PAYOR.address,
        payorZipCode: DEFAULT_PAYOR.zipCode,
        lineItems: [
          {
            id: `batch-${cont.id}`,
            natureOfPayment: atc.description,
            atcCode: atc.code,
            month1Payment: cont.defaultMonthlyRetainer,
            month2Payment: cont.defaultMonthlyRetainer,
            month3Payment: cont.defaultMonthlyRetainer,
            taxRate: atc.defaultRate,
          }
        ],
        authorizedSignatory: DEFAULT_PAYOR.signatory,
        signatoryTitle: DEFAULT_PAYOR.signatoryTitle,
        signatoryTin: DEFAULT_PAYOR.signatoryTin,
        signingDate: new Date().toLocaleDateString('en-PH'),
      };
    });
  }, [taxYear, quarter, quarterDates]);

  // Download SAWT CSV
  const handleExportSawt = () => {
    const csvContent = generateSawtCsv(batchDataList);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BIR_SAWT_Schedule_${quarter}_${taxYear}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Context Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              BIR Form 2307 Generator & Tax Withholding Module
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              EWT RR 11-2018
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Certificate of Creditable Tax Withheld at Source for contractors, consultants, professionals, and corporate suppliers with automated PDF export.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/tax-calculator"
            className="flex items-center text-xs font-semibold px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors shadow-xs"
          >
            <Receipt className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
            Switch to BIR 2316 (Employees)
          </Link>
          <Link
            to="/payroll"
            className="flex items-center text-xs font-semibold px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
            Back to Payroll
          </Link>
          <button
            onClick={() => setIsSignModalOpen(true)}
            className="flex items-center text-xs font-bold px-3.5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition-colors"
          >
            <PenTool className="w-3.5 h-3.5 mr-1.5" />
            {signature ? 'Re-Sign Form 2307' : 'Apply Digital E-Sign'}
          </button>
        </div>
      </div>

      {/* Main Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-4 pt-2 gap-2 shadow-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('editor')}
          className={`py-3 px-4 font-bold text-sm border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'editor'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/60 rounded-t-lg'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4 text-emerald-600" />
          Interactive 2307 Form Generator & PDF Preview
        </button>

        <button
          onClick={() => setActiveTab('batch')}
          className={`py-3 px-4 font-bold text-sm border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'batch'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/60 rounded-t-lg'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4 text-slate-600" />
          Contractors Master Withholding Schedule ({MOCK_CONTRACTORS.length})
        </button>

        <button
          onClick={() => setActiveTab('atc-matrix')}
          className={`py-3 px-4 font-bold text-sm border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'atc-matrix'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/60 rounded-t-lg'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Scale className="w-4 h-4 text-slate-600" />
          BIR Withholding Tax Rates & ATC Code Matrix
        </button>
      </div>

      {/* TAB 1: INTERACTIVE 2307 GENERATOR & PDF PREVIEW */}
      {activeTab === 'editor' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Deck (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-5">
              {/* Payee Selection / Presets */}
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  1. Select Contractor / Payee:
                </span>
                <select
                  value={selectedPayeeId}
                  onChange={(e) => handleSelectContractor(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- Custom Payee (Enter Manually) --</option>
                  {MOCK_CONTRACTORS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.category} - ₱{c.defaultMonthlyRetainer.toLocaleString()}/mo)
                    </option>
                  ))}
                </select>
              </div>

              {/* Tax Period / Quarter Selector */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Tax Year:</label>
                  <select
                    value={taxYear}
                    onChange={(e) => setTaxYear(parseInt(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold"
                  >
                    <option value={2024}>2024</option>
                    <option value={2025}>2025</option>
                    <option value={2026}>2026</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Applicable Quarter:</label>
                  <select
                    value={quarter}
                    onChange={(e) => setQuarter(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-emerald-800"
                  >
                    <option value="Q1">1st Quarter (Jan - Mar)</option>
                    <option value="Q2">2nd Quarter (Apr - Jun)</option>
                    <option value="Q3">3rd Quarter (Jul - Sep)</option>
                    <option value="Q4">4th Quarter (Oct - Dec)</option>
                  </select>
                </div>
                <div className="col-span-2 text-[11px] text-slate-500 font-mono pt-1 border-t border-slate-200">
                  Covered Dates: <strong>{quarterDates.from}</strong> to <strong>{quarterDates.to}</strong>
                </div>
              </div>

              {/* Payee Metadata Details */}
              <div className="space-y-3 pt-2 border-t border-slate-100 text-xs">
                <span className="font-bold text-slate-800 uppercase tracking-wider block text-[11px]">
                  2. Payee Identification Details:
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">Payee TIN:</label>
                    <input
                      type="text"
                      value={payeeTin}
                      onChange={(e) => setPayeeTin(e.target.value)}
                      placeholder="000-000-000-000"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">Payee Type:</label>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => setPayeeType('Individual')}
                        className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-bold border ${
                          payeeType === 'Individual' ? 'bg-emerald-700 text-white border-emerald-700' : 'bg-white text-slate-600 border-slate-300'
                        }`}
                      >
                        Individual
                      </button>
                      <button
                        type="button"
                        onClick={() => setPayeeType('Non-Individual')}
                        className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-bold border ${
                          payeeType === 'Non-Individual' ? 'bg-emerald-700 text-white border-emerald-700' : 'bg-white text-slate-600 border-slate-300'
                        }`}
                      >
                        Corporate
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">Registered Full Name:</label>
                  <input
                    type="text"
                    value={payeeName}
                    onChange={(e) => setPayeeName(e.target.value)}
                    placeholder="e.g. Reyes, Danica S. or TECHCRAFT INC."
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">Registered Address:</label>
                    <input
                      type="text"
                      value={payeeAddress}
                      onChange={(e) => setPayeeAddress(e.target.value)}
                      placeholder="e.g. Makati City"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">Zip Code:</label>
                    <input
                      type="text"
                      value={payeeZip}
                      onChange={(e) => setPayeeZip(e.target.value)}
                      placeholder="1227"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Line Items & Monthly Amounts Editor */}
              <div className="space-y-3 pt-2 border-t border-slate-100 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 uppercase tracking-wider block text-[11px]">
                    3. Income Payments & ATC Schedule:
                  </span>
                  <button
                    type="button"
                    onClick={handleAddLineItem}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add ATC Row
                  </button>
                </div>

                {lineItems.map((item, idx) => (
                  <div key={item.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 relative">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase text-slate-500">Row #{idx + 1}</span>
                      {lineItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveLineItem(item.id)}
                          className="text-slate-400 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">Select ATC Code:</label>
                      <select
                        value={item.atcCode}
                        onChange={(e) => handleUpdateAtc(item.id, e.target.value)}
                        className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs font-bold font-mono"
                      >
                        {ATC_CODES.map((atc) => (
                          <option key={atc.code} value={atc.code}>
                            {atc.code} — {(atc.defaultRate * 100).toFixed(0)}% ({atc.nature})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 3 Monthly Payments in the Quarter */}
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">
                          {quarterDates.months[0]}:
                        </label>
                        <input
                          type="number"
                          value={item.month1Payment}
                          onChange={(e) => handleUpdatePayment(item.id, 1, parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">
                          {quarterDates.months[1]}:
                        </label>
                        <input
                          type="number"
                          value={item.month2Payment}
                          onChange={(e) => handleUpdatePayment(item.id, 2, parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">
                          {quarterDates.months[2]}:
                        </label>
                        <input
                          type="number"
                          value={item.month3Payment}
                          onChange={(e) => handleUpdatePayment(item.id, 3, parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs font-mono font-bold"
                        />
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[11px] pt-1 border-t border-slate-200">
                      <span className="text-slate-500">Gross: ₱{(item.month1Payment + item.month2Payment + item.month3Payment).toLocaleString()}</span>
                      <span className="font-bold text-emerald-800 font-mono">
                        Tax: ₱{((item.month1Payment + item.month2Payment + item.month3Payment) * item.taxRate).toFixed(2)} ({(item.taxRate * 100).toFixed(0)}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary Totals Banner */}
              <div className="p-3.5 bg-emerald-950 text-white rounded-xl space-y-1 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Total Gross Income Payment:</span>
                  <span className="font-mono font-bold text-slate-200">₱{totals.grandTotalPayment.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-bold pt-1 border-t border-slate-800">
                  <span className="text-emerald-300">Total Tax Withheld (Creditable):</span>
                  <span className="font-mono text-emerald-400">₱{totals.grandTotalTaxWithheld.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Document Preview & Printable Output (7 cols) */}
          <div className="lg:col-span-7 space-y-3">
            {/* Auto-Applied Signature Repository Status Card */}
            <div className="p-3 bg-emerald-50/80 border border-emerald-300 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs print:hidden">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">
                      {selectedSignatory ? selectedSignatory.fullName : (signature ? signature.signerName : 'Default Company Payor')}
                    </span>
                    <span className="text-[10px] bg-emerald-200/80 text-emerald-900 px-1.5 py-0.5 rounded font-mono font-bold">
                      {selectedSignatory ? 'Auto-Applied Signatory' : 'Digital E-Signature'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    {selectedSignatory ? selectedSignatory.title : (signature?.signerTitle || 'Authorized Payor Representative')} • RA 8792 E-Commerce Seal Applied
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsPickerModalOpen(true)}
                  className="px-2.5 py-1.5 bg-white border border-emerald-300 hover:bg-emerald-100/50 text-emerald-900 font-semibold rounded-lg text-xs transition-colors"
                >
                  Change Signatory
                </button>
                <Link
                  to="/signatures"
                  target="_blank"
                  className="p-1.5 text-emerald-800 hover:text-emerald-950 hover:bg-emerald-100 rounded-lg transition-colors"
                  title="Manage Central Signature Repository"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <Bir2307Document
              data={form2307Data}
              onPrint={() => window.print()}
            />
          </div>
        </div>
      )}

      {/* TAB 2: BATCH ROSTER & WITHHOLDING REGISTER */}
      {activeTab === 'batch' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Contractors & Suppliers Quarterly Withholding Register ({quarter} {taxYear})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Summary of all creditable withholding taxes at source ready for SAWT BIR e-filing.
              </p>
            </div>

            <button
              onClick={handleExportSawt}
              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg flex items-center gap-2 shadow-xs transition-colors"
            >
              <Download className="w-4 h-4" />
              Export SAWT Schedule (CSV)
            </button>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Payee Registered Name</th>
                  <th className="px-3 py-3">Payee TIN</th>
                  <th className="px-3 py-3">Category</th>
                  <th className="px-3 py-3 text-center">ATC</th>
                  <th className="px-3 py-3 text-right">Quarter Gross</th>
                  <th className="px-3 py-3 text-center">Rate</th>
                  <th className="px-4 py-3 text-right font-black text-emerald-950">Tax Withheld</th>
                  <th className="px-3 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {batchDataList.map((entry) => {
                  const bTotals = computeForm2307Totals(entry.lineItems);
                  return (
                    <tr key={entry.payeeTin} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        {entry.payeeName}
                      </td>
                      <td className="px-3 py-3 font-mono text-[11px] text-slate-600">
                        {entry.payeeTin}
                      </td>
                      <td className="px-3 py-3 text-slate-600">
                        {entry.payeeType}
                      </td>
                      <td className="px-3 py-3 text-center font-mono font-bold text-slate-800">
                        {entry.lineItems[0].atcCode}
                      </td>
                      <td className="px-3 py-3 text-right font-mono font-bold text-slate-900">
                        ₱{bTotals.grandTotalPayment.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-3 py-3 text-center font-mono font-bold text-slate-600">
                        {(entry.lineItems[0].taxRate * 100).toFixed(0)}%
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-black text-emerald-800">
                        ₱{bTotals.grandTotalTaxWithheld.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <button
                          onClick={() => {
                            const cont = MOCK_CONTRACTORS.find(c => c.tin === entry.payeeTin);
                            if (cont) handleSelectContractor(cont.id);
                            setActiveTab('editor');
                          }}
                          className="px-2.5 py-1 rounded bg-slate-100 hover:bg-emerald-50 text-emerald-800 hover:text-emerald-900 font-semibold text-[11px] transition-colors"
                        >
                          View 2307
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ATC CODE & TAX RATE REFERENCE MATRIX */}
      {activeTab === 'atc-matrix' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-6">
          <div className="space-y-1">
            <h3 className="font-bold text-slate-900 text-base">
              BIR Expanded Withholding Tax (EWT) Alphanumeric Tax Code (ATC) Table
            </h3>
            <p className="text-xs text-slate-500">
              Reference schedule under Revenue Regulations No. 11-2018 implementing the Tax Reform for Acceleration and Inclusion (TRAIN Law).
            </p>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="px-3 py-3 text-center w-24">ATC Code</th>
                  <th className="px-3 py-3 text-center w-24">Classification</th>
                  <th className="px-4 py-3">Nature of Payment & Description</th>
                  <th className="px-3 py-3 text-center w-28 bg-emerald-50 text-emerald-950">Statutory Tax Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ATC_CODES.map((atc) => (
                  <tr key={atc.code} className="hover:bg-slate-50 transition-colors">
                    <td className="px-3 py-3 text-center font-mono font-black text-slate-900">
                      {atc.code}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        atc.category === 'Individual' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {atc.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-800">
                      <span className="font-semibold block">{atc.nature}</span>
                      <span className="text-[11px] text-slate-500">{atc.description}</span>
                    </td>
                    <td className="px-3 py-3 text-center font-mono font-black text-sm text-emerald-900 bg-emerald-50/40">
                      {(atc.defaultRate * 100).toFixed(0)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Digital E-Signature Modal (for custom one-off draw/type) */}
      <ESignatureModal
        isOpen={isSignModalOpen}
        onClose={() => setIsSignModalOpen(false)}
        onSaveSignature={(sig) => {
          setSignature(sig);
          setSelectedSignatory(null);
        }}
        documentTitle={`BIR Form 2307 - ${payeeName} (${quarter} ${taxYear})`}
        initialSignerName={signature?.signerName || selectedSignatory?.fullName || DEFAULT_PAYOR.signatory}
        initialSignerTitle={signature?.signerTitle || selectedSignatory?.title || DEFAULT_PAYOR.signatoryTitle}
        initialAccreditation={selectedSignatory?.prcLicenseNo || selectedSignatory?.boardResolutionRef || "BIR-TIN: 421-889-012-00000 | Authorized Tax Agent"}
      />

      {/* Central Repository Signature Picker Modal */}
      <SignaturePickerModal
        isOpen={isPickerModalOpen}
        onClose={() => setIsPickerModalOpen(false)}
        category="tax-2307"
        currentSignatoryId={selectedSignatory?.id}
        onSelectSignatory={(sig) => {
          setSelectedSignatory(sig);
          if (sig) setSignature(null);
        }}
      />
    </div>
  );
}
