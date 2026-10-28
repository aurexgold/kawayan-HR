import React, { useState } from 'react';
import { 
  Sparkles, Save, Edit3, Eye, RotateCcw, 
  Check, Copy, Shield, BookOpen, AlertCircle
} from 'lucide-react';
import { HandbookChapter, refineSectionWithAI } from '../../lib/handbook';

interface HandbookSectionEditorProps {
  chapter: HandbookChapter;
  companyName: string;
  onSaveChapter: (updatedChapter: HandbookChapter) => void;
  onResetChapter: (chapterId: string) => void;
}

export function HandbookSectionEditor({
  chapter,
  companyName,
  onSaveChapter,
  onResetChapter,
}: HandbookSectionEditorProps) {
  const [content, setContent] = useState(chapter.content);
  const [title, setTitle] = useState(chapter.title);
  const [subtitle, setSubtitle] = useState(chapter.subtitle);
  const [mode, setMode] = useState<'preview' | 'edit'>('preview');
  const [isRefining, setIsRefining] = useState(false);
  const [refinePrompt, setRefinePrompt] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync state if active chapter prop changes
  React.useEffect(() => {
    setContent(chapter.content);
    setTitle(chapter.title);
    setSubtitle(chapter.subtitle);
    setSavedSuccess(false);
    setErrorMsg(null);
  }, [chapter.id]);

  const handleSave = () => {
    onSaveChapter({
      ...chapter,
      title,
      subtitle,
      content,
      isCustomized: true,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`# ${title}\n## ${subtitle}\n\n${content}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleQuickRefine = async (instruction: string) => {
    setIsRefining(true);
    setErrorMsg(null);
    try {
      const refined = await refineSectionWithAI(title, content, instruction, companyName);
      setContent(refined);
      setSavedSuccess(false);
      setMode('preview');
    } catch (err: any) {
      setErrorMsg('AI refinement temporarily unavailable. You can edit directly in the text editor.');
    } finally {
      setIsRefining(false);
      setRefinePrompt('');
    }
  };

  // Quick action templates
  const quickActions = [
    { label: '🛡️ Strengthen DOLE Citations', prompt: 'Strengthen all legal citations to Philippine Labor Code, DOLE advisories, and relevant Supreme Court jurisprudence.' },
    { label: '⚖️ Clarify Procedural Due Process', prompt: 'Add precise steps for the Twin-Notice Rule (Notice to Explain with 5-day response, hearing, and Notice of Decision).' },
    { label: '🤝 People-First / Cooperative Tone', prompt: 'Rephrase to reflect a cooperative, supportive, and employee-centered culture while retaining full legal enforceability.' },
    { label: '⏱️ Biometrics & Attendance Clarity', prompt: 'Include clear policies on biometric logging, allowable grace periods, and excessive tardiness corrective actions.' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-full overflow-hidden">
      {/* Editor Header Bar */}
      <div className="p-4 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-xs font-mono font-bold border border-blue-400/30">
              Chapter {chapter.chapterNumber}
            </span>
            <span className="text-xs text-slate-400">Statutory Standard PD 442</span>
          </div>
          <h2 className="text-base font-bold text-white mt-1">{title}</h2>
          <p className="text-xs text-slate-400">{subtitle}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="bg-slate-800 p-0.5 rounded-lg flex items-center border border-slate-700">
            <button
              onClick={() => setMode('preview')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors ${
                mode === 'preview' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
            <button
              onClick={() => setMode('edit')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors ${
                mode === 'edit' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Clause</span>
            </button>
          </div>

          <button
            onClick={handleCopy}
            title="Copy Markdown"
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            onClick={handleSave}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{savedSuccess ? 'Saved!' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* AI Refinement Toolbar */}
      <div className="bg-slate-50 border-b border-slate-200 p-3 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-slate-800">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>AI Clause Assistant (Gemini 3.8 Flash)</span>
          </div>
          <span className="text-[11px] text-slate-500">Refine or tailor this specific chapter</span>
        </div>

        {/* Quick action badges */}
        <div className="flex flex-wrap gap-1.5">
          {quickActions.map((action, idx) => (
            <button
              key={idx}
              disabled={isRefining}
              onClick={() => handleQuickRefine(action.prompt)}
              className="text-xs bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-300 rounded-lg px-2.5 py-1 transition-colors disabled:opacity-50"
            >
              {action.label}
            </button>
          ))}
        </div>

        {/* Custom refinement input */}
        <div className="flex items-center gap-2 pt-1">
          <input
            type="text"
            disabled={isRefining}
            value={refinePrompt}
            onChange={(e) => setRefinePrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && refinePrompt.trim()) {
                handleQuickRefine(refinePrompt.trim());
              }
            }}
            placeholder="Type custom instruction (e.g. 'Add DOLE rules for pregnant employees in graveyard shifts')..."
            className="flex-1 text-xs bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          />
          <button
            disabled={isRefining || !refinePrompt.trim()}
            onClick={() => handleQuickRefine(refinePrompt.trim())}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors disabled:opacity-40 shrink-0"
          >
            {isRefining ? (
              <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Sparkles className="w-3 h-3" />
            )}
            <span>Refine</span>
          </button>
        </div>

        {errorMsg && (
          <div className="text-xs text-amber-700 bg-amber-50 p-2 rounded-lg flex items-center gap-2 border border-amber-200">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 overflow-y-auto">
        {mode === 'edit' ? (
          <div className="space-y-4 h-full flex flex-col">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Chapter Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs font-semibold border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Subtitle</label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex-1 flex flex-col">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Clause Markdown Content
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={18}
                className="w-full flex-1 p-4 font-mono text-xs text-slate-800 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden leading-relaxed"
              />
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Philippine Legal Framework Badge Banner */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 mb-1.5">
                <Shield className="w-3.5 h-3.5 text-blue-600" />
                <span>Cited Statutory Authorities:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {chapter.statutoryReferences.map((ref, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center text-[11px] font-mono bg-white border border-slate-200 px-2.5 py-0.5 rounded-md text-slate-700 shadow-2xs"
                  >
                    {ref}
                  </span>
                ))}
              </div>
            </div>

            {/* Markdown rendered view */}
            <div className="prose prose-slate max-w-none text-slate-800 space-y-4 text-sm leading-relaxed">
              {content.split('\n\n').map((block, idx) => {
                if (block.startsWith('## ')) {
                  return (
                    <h3
                      key={idx}
                      className="text-base font-bold text-slate-900 border-b border-slate-200 pb-1.5 mt-6 first:mt-0"
                    >
                      {block.replace('## ', '')}
                    </h3>
                  );
                }
                if (block.startsWith('### ')) {
                  return (
                    <h4 key={idx} className="text-sm font-bold text-slate-800 mt-4">
                      {block.replace('### ', '')}
                    </h4>
                  );
                }
                if (block.startsWith('- ')) {
                  const items = block.split('\n- ');
                  return (
                    <ul key={idx} className="list-disc pl-5 space-y-1 text-slate-700 text-xs">
                      {items.map((item, itemIdx) => (
                        <li key={itemIdx}>{item.replace(/^- /, '')}</li>
                      ))}
                    </ul>
                  );
                }
                return (
                  <p key={idx} className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                    {block}
                  </p>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Editor Footer */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <BookOpen className="w-3.5 h-3.5 text-slate-400" />
          <span>Philippine Labor Code Compliant Standard</span>
        </div>

        <button
          onClick={() => onResetChapter(chapter.id)}
          className="text-slate-500 hover:text-slate-800 text-xs flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset to Baseline</span>
        </button>
      </div>
    </div>
  );
}
