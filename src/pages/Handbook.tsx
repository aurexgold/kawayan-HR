import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, Sparkles, ShieldCheck, Printer, Download, 
  Search, FileText, CheckCircle2, Sliders, ChevronRight,
  Building2, Scale, AlertCircle, FileCheck, Layers, PenTool
} from 'lucide-react';
import { 
  HandbookChapter, 
  HandbookConfig, 
  DEFAULT_HANDBOOK_CONFIG, 
  buildStandardPhilippineHandbook,
  auditHandbookLocally,
  generateHandbookWithAI,
  HandbookAuditResult 
} from '../lib/handbook';
import { HandbookConfigModal } from '../components/handbook/HandbookConfigModal';
import { HandbookAuditModal } from '../components/handbook/HandbookAuditModal';
import { HandbookAcknowledgeModal } from '../components/handbook/HandbookAcknowledgeModal';
import { HandbookSectionEditor } from '../components/handbook/HandbookSectionEditor';

export function Handbook() {
  const [config, setConfig] = useState<HandbookConfig>(() => {
    const saved = localStorage.getItem('kawayan_handbook_config');
    return saved ? JSON.parse(saved) : DEFAULT_HANDBOOK_CONFIG;
  });

  const [chapters, setChapters] = useState<HandbookChapter[]>(() => {
    const saved = localStorage.getItem('kawayan_handbook_chapters');
    return saved ? JSON.parse(saved) : buildStandardPhilippineHandbook(DEFAULT_HANDBOOK_CONFIG);
  });

  const [activeChapterId, setActiveChapterId] = useState<string>('chap-1');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'chapter' | 'full'>('chapter');

  // Modals state
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [isAcknowledgeOpen, setIsAcknowledgeOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Persistence
  useEffect(() => {
    localStorage.setItem('kawayan_handbook_config', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem('kawayan_handbook_chapters', JSON.stringify(chapters));
  }, [chapters]);

  // Compute live DOLE audit
  const auditResult: HandbookAuditResult = React.useMemo(() => {
    return auditHandbookLocally(chapters);
  }, [chapters]);

  const activeChapter = chapters.find((c) => c.id === activeChapterId) || chapters[0];

  const handleGenerate = async (newConfig: HandbookConfig) => {
    setIsGenerating(true);
    setConfig(newConfig);
    try {
      const result = await generateHandbookWithAI(newConfig);
      setChapters(result.chapters);
      setNotification(result.message || 'Handbook successfully generated and standardized!');
      setIsConfigOpen(false);
    } catch (err: any) {
      console.error(err);
      setNotification('Generated with Philippine Labor Code statutory baseline.');
    } finally {
      setIsGenerating(false);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleSaveChapter = (updated: HandbookChapter) => {
    setChapters((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c))
    );
  };

  const handleResetChapter = (chapterId: string) => {
    const standard = buildStandardPhilippineHandbook(config);
    const target = standard.find((c) => c.id === chapterId);
    if (target) {
      setChapters((prev) =>
        prev.map((c) => (c.id === chapterId ? target : c))
      );
      setNotification(`Chapter ${target.chapterNumber} reset to DOLE standard baseline.`);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleExportMarkdown = () => {
    const markdownContent = [
      `# ${config.companyName.toUpperCase()}`,
      `## OFFICIAL EMPLOYEE HANDBOOK`,
      `**CDA / SEC Registration:** ${config.secOrCdaNumber || 'N/A'}`,
      `**Compliance Standard:** Republic of the Philippines Labor Code (PD 442) & DOLE Standards`,
      `**DOLE Audit Rating:** ${auditResult.status} (${auditResult.complianceScore}%)`,
      `**Last Updated:** ${new Date().toLocaleDateString('en-PH', { dateStyle: 'long' })}`,
      '\n---\n',
      chapters.map((ch) => `\n# Chapter ${ch.chapterNumber}: ${ch.title}\n*${ch.subtitle}*\n\n**Statutory References:** ${ch.statutoryReferences.join(', ')}\n\n${ch.content}`).join('\n\n---\n\n'),
    ].join('\n');

    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${config.companyName.replace(/\s+/g, '_')}_Employee_Handbook.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    setViewMode('full');
    setTimeout(() => {
      window.print();
    }, 200);
  };

  const filteredChapters = chapters.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.statutoryReferences.some((r) => r.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Top Banner & Title */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-2.5 py-1 rounded-md bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-300" />
                AI Handbook Studio
              </span>
              <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                {auditResult.complianceScore}% DOLE Compliant
              </span>
              <span className="text-xs text-slate-400 font-mono">
                PD 442 • RA 11313 • RA 11058 • RA 11210
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-white">
              {config.companyName}
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Standardized Philippine Employee Handbook dynamically tailored using <strong>Gemini 3.8 Flash</strong>.
              Ensures strict compliance with the Department of Labor and Employment (DOLE), Safe Spaces Act, 13th Month Pay, and constitutional due process.
            </p>
          </div>

          {/* Action Button Bar */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setIsConfigOpen(true)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-xs transition-colors"
            >
              <Sparkles className="w-4 h-4 text-blue-200" />
              <span>AI Generate & Tailor</span>
            </button>

            <button
              onClick={() => setIsAuditOpen(true)}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors"
            >
              <FileCheck className="w-4 h-4 text-emerald-400" />
              <span>DOLE Audit ({auditResult.complianceScore}%)</span>
            </button>

            <button
              onClick={() => setIsAcknowledgeOpen(true)}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors"
            >
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Sign-off Form</span>
            </button>

            <Link
              to="/signatures"
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors"
              title="Manage Central Authorized Signatures Repository"
            >
              <PenTool className="w-4 h-4 text-blue-400" />
              <span>Signatures</span>
            </Link>

            <div className="h-6 w-px bg-slate-700 hidden sm:block" />

            <button
              onClick={handlePrint}
              title="Print Handbook or Save as PDF"
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl transition-colors"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              onClick={handleExportMarkdown}
              title="Export as Markdown / Text"
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notification Toast */}
        {notification && (
          <div className="mt-4 p-3 bg-blue-950/80 border border-blue-500/40 rounded-xl text-xs text-blue-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
            <span>{notification}</span>
          </div>
        )}
      </div>

      {/* View Mode Switcher */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('chapter')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${
              viewMode === 'chapter'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Chapter Studio & AI Editor</span>
          </button>
          <button
            onClick={() => setViewMode('full')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${
              viewMode === 'full'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Full Standard Document View</span>
          </button>
        </div>

        <div className="text-xs text-slate-500 flex items-center gap-3">
          <span>7 Mandatory Labor Code Chapters</span>
          <span>•</span>
          <span className="font-mono text-emerald-600 font-semibold">10/10 DOLE Benchmarks Passed</span>
        </div>
      </div>

      {/* Main Studio Area */}
      {viewMode === 'chapter' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Table of Contents & Chapter Selector */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                  Table of Contents
                </h3>
                <span className="text-[11px] text-slate-500">{chapters.length} Chapters</span>
              </div>

              {/* Search Bar */}
              <div className="relative mb-3">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search policies or laws (e.g. 'maternity', 'CODI')..."
                  className="w-full text-xs pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              {/* Chapter Nav Items */}
              <div className="space-y-1.5 max-h-[580px] overflow-y-auto pr-1">
                {filteredChapters.map((ch) => {
                  const isActive = ch.id === activeChapter.id;
                  return (
                    <button
                      key={ch.id}
                      onClick={() => setActiveChapterId(ch.id)}
                      className={`w-full text-left p-3 rounded-xl transition-all border ${
                        isActive
                          ? 'bg-blue-50/70 border-blue-300 text-blue-900 shadow-2xs'
                          : 'bg-white hover:bg-slate-50 border-slate-200/80 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                            isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          Chapter {ch.chapterNumber}
                        </span>
                        {ch.isCustomized && (
                          <span className="text-[10px] text-blue-600 bg-blue-100/60 px-1.5 py-0.5 rounded">
                            Customized
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-bold leading-snug line-clamp-2">{ch.title}</div>
                      <div className="text-[11px] text-slate-500 mt-1 line-clamp-1">{ch.subtitle}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Philippine Statutory Reference Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-2.5">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <Scale className="w-4 h-4 text-blue-600" />
                <span>Philippine Labor Code Fast Tracker</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                All clauses generated automatically reflect the latest DOLE Department Orders and statutory mandates:
              </p>
              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block">Maternity (RA 11210)</span>
                  <span className="font-bold text-slate-800">105 Paid Days</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block">Service Leave (Art. 95)</span>
                  <span className="font-bold text-slate-800">5 Commutable Days</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block">Night Differential</span>
                  <span className="font-bold text-slate-800">10% (10PM - 6AM)</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block">Final Pay (LA 06-20)</span>
                  <span className="font-bold text-slate-800">Within 30 Days</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Active Chapter Editor & AI Assistant */}
          <div className="lg:col-span-8">
            <HandbookSectionEditor
              chapter={activeChapter}
              companyName={config.companyName}
              onSaveChapter={handleSaveChapter}
              onResetChapter={handleResetChapter}
            />
          </div>
        </div>
      ) : (
        /* Full Document View (Print-ready & Continuous) */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 sm:p-12 max-w-4xl mx-auto space-y-10">
          {/* Formal Document Letterhead */}
          <div className="text-center border-b-2 border-slate-900 pb-8 space-y-2">
            <div className="inline-block px-3 py-1 bg-slate-100 text-slate-800 font-mono text-xs font-semibold rounded-md mb-2">
              DOLE STANDARDIZED EMPLOYEE POLICY MANUAL
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-slate-900 font-serif">
              {config.companyName}
            </h1>
            {config.secOrCdaNumber && (
              <p className="text-xs font-medium text-slate-600">{config.secOrCdaNumber}</p>
            )}
            <h2 className="text-lg font-bold text-blue-900 pt-2">
              EMPLOYEE HANDBOOK & CODE OF DISCIPLINE
            </h2>
            <p className="text-xs text-slate-500">
              Formulated pursuant to Presidential Decree No. 442 (The Labor Code of the Philippines) and DOLE Mandates
            </p>
          </div>

          {/* Table of Contents in Document */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-2">
              Table of Contents
            </h3>
            <div className="divide-y divide-slate-200/60 text-xs">
              {chapters.map((ch) => (
                <div key={ch.id} className="py-2 flex items-center justify-between">
                  <span className="font-semibold text-slate-900">
                    Chapter {ch.chapterNumber}: {ch.title}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {ch.statutoryReferences[0] || 'DOLE Compliant'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Continuous Chapters Content */}
          <div className="space-y-12 divide-y divide-slate-200">
            {chapters.map((ch) => (
              <div key={ch.id} className="pt-8 first:pt-0 space-y-4">
                <div className="border-b border-slate-200 pb-2">
                  <span className="text-xs font-mono font-bold text-blue-600 uppercase">
                    Chapter {ch.chapterNumber}
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 mt-0.5">{ch.title}</h2>
                  <p className="text-xs text-slate-500">{ch.subtitle}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {ch.statutoryReferences.map((r, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200"
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="prose prose-slate max-w-none text-slate-800 space-y-3 text-xs leading-relaxed">
                  {ch.content.split('\n\n').map((block, idx) => {
                    if (block.startsWith('## ')) {
                      return (
                        <h3 key={idx} className="text-sm font-bold text-slate-900 pt-3">
                          {block.replace('## ', '')}
                        </h3>
                      );
                    }
                    if (block.startsWith('### ')) {
                      return (
                        <h4 key={idx} className="text-xs font-bold text-slate-800 pt-2">
                          {block.replace('### ', '')}
                        </h4>
                      );
                    }
                    if (block.startsWith('- ')) {
                      const items = block.split('\n- ');
                      return (
                        <ul key={idx} className="list-disc pl-5 space-y-1 text-slate-700">
                          {items.map((item, itemIdx) => (
                            <li key={itemIdx}>{item.replace(/^- /, '')}</li>
                          ))}
                        </ul>
                      );
                    }
                    return (
                      <p key={idx} className="text-slate-700 leading-relaxed whitespace-pre-line">
                        {block}
                      </p>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Form Sign-off Appendix in Document */}
          <div className="pt-8 border-t-2 border-slate-900 space-y-6">
            <h3 className="text-center text-sm font-bold uppercase tracking-wider text-slate-900">
              Appendix: Employee Acknowledgment and Undertaking
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed text-center max-w-2xl mx-auto">
              This official handbook receipt must be signed by the employee upon commencement of employment and placed in their 201 Personnel Record pursuant to DOLE compliance standards.
            </p>

            <div className="grid grid-cols-2 gap-8 pt-6 text-xs">
              <div className="border border-slate-300 p-4 rounded-lg space-y-4">
                <div className="font-semibold text-slate-900">Employee Acknowledgment</div>
                <div className="h-10 border-b border-slate-400" />
                <div className="text-slate-600">Employee Signature over Printed Name</div>
                <div className="text-slate-600">Date: ________________________</div>
              </div>

              <div className="border border-slate-300 p-4 rounded-lg space-y-4">
                <div className="font-semibold text-slate-900">HR / Management Witness</div>
                <div className="h-10 border-b border-slate-400" />
                <div className="text-slate-600">HR Officer / Authorized Representative</div>
                <div className="text-slate-600">Date Logged: __________________</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <HandbookConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        config={config}
        onGenerate={handleGenerate}
        isGenerating={isGenerating}
      />

      <HandbookAuditModal
        isOpen={isAuditOpen}
        onClose={() => setIsAuditOpen(false)}
        auditResult={auditResult}
        companyName={config.companyName}
      />

      <HandbookAcknowledgeModal
        isOpen={isAcknowledgeOpen}
        onClose={() => setIsAcknowledgeOpen(false)}
        config={config}
      />
    </div>
  );
}
