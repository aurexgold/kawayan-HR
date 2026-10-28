import { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Scale, 
  ShieldAlert, 
  CheckSquare, 
  Bookmark, 
  Sparkles, 
  Copy, 
  Check, 
  PhoneCall, 
  AlertTriangle, 
  BookOpen, 
  RefreshCw, 
  FileText, 
  ChevronRight,
  HelpCircle,
  Building
} from 'lucide-react';

interface LegalCitation {
  ref: string;
}

interface ComplianceResponse {
  answer: string;
  legalReferences: string[];
  actionChecklist: string[];
  riskAssessment: string;
  category: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  text?: string;
  structuredData?: ComplianceResponse;
  source?: 'gemini_ai' | 'knowledge_base' | 'fallback';
}

const PRESET_QUESTIONS = [
  {
    topic: '13th Month Pay',
    query: 'How is 13th month pay computed for an employee resigned mid-year, and what is the deadline?',
    badge: 'PD 851 & DOLE LA 25-23'
  },
  {
    topic: 'Termination & Due Process',
    query: 'What are the exact procedural steps and timelines required for termination under Just Cause (Twin-Notice Rule)?',
    badge: 'Art. 297 & King of Kings'
  },
  {
    topic: 'Holiday Pay Multipliers',
    query: 'What is the exact overtime rate if an employee works 10 hours on a Regular Holiday falling on their scheduled Rest Day?',
    badge: 'Articles 87, 93, 94'
  },
  {
    topic: 'Final Pay 30-Day Rule',
    query: 'Can an employer withhold an employee’s final pay beyond 30 days if company clearance is pending?',
    badge: 'DOLE LA 06-20 & Milan Case'
  },
  {
    topic: 'Service Incentive Leave (SIL)',
    query: 'Is unused Service Incentive Leave (SIL) mandatorily convertible to cash, and who is exempted?',
    badge: 'Labor Code Art. 95'
  },
  {
    topic: 'Contracting & DO 174',
    query: 'What constitutes illegal labor-only contracting under DOLE Department Order No. 174?',
    badge: 'DO 174-17 & Art. 106'
  },
];

export function ComplianceAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: "Mabuhay! I am your **Kawayan HR Labor Compliance & DOLE Regulations Advisor**. I provide instant, authoritative legal guidance grounded in the **Labor Code of the Philippines (PD 442)**, **DOLE Department Orders**, **NLRC Jurisprudence**, and statutory welfare rules (SSS, PhilHealth, Pag-IBIG).\n\nAsk me any question regarding termination due process, wage computations, mandatory leaves, holiday pay, or service contracting below.",
      structuredData: {
        answer: "Ready to assist with Philippine labor compliance. Select a preset topic above or type a specific inquiry below.",
        legalReferences: [
          "Presidential Decree No. 442 (The Labor Code of the Philippines)",
          "DOLE General Labor Standards (GLS) & Occupational Safety Manual",
          "Republic Act No. 10173 (Data Privacy Act of 2012)"
        ],
        actionChecklist: [
          "Review employment contracts for mandatory DOLE general labor standards clauses.",
          "Ensure biometrics and daily time records (DTRs) are kept for at least 3 years.",
          "Maintain statutory health and safety committees per DOLE DO 198-18."
        ],
        riskAssessment: "Statutory Adherence Active (DOLE Inspection Standard)",
        category: "Overview"
      },
      source: 'knowledge_base'
    }
  ]);

  const [inputQuestion, setInputQuestion] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [checkedTasks, setCheckedTasks] = useState<{ [key: string]: boolean }>({});

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const questionText = textToSend || inputQuestion;
    if (!questionText.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: questionText.trim(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuestion('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/compliance/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: questionText.trim(),
          category: selectedCategory,
          conversationHistory: messages.slice(-4).map(m => ({
            role: m.sender === 'user' ? 'user' : 'model',
            parts: [{ text: m.text || m.structuredData?.answer || '' }]
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      const guidance: ComplianceResponse = data.data;

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: guidance.answer,
        structuredData: guidance,
        source: data.source || 'gemini_ai',
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      console.error('Compliance Chat query failed:', err);
      // Fallback message
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: "Under Philippine Labor Law (PD 442), management actions must align with General Labor Standards and statutory due process. Please consult the built-in handbook or contact the DOLE Hotline at 1349.",
        structuredData: {
          answer: "DOLE compliance advisory: Employers must comply with Presidential Decree No. 442 and respect the employee's rights to security of tenure and statutory monetary benefits.",
          legalReferences: ["Labor Code of the Philippines (PD 442)", "DOLE General Labor Standards"],
          actionChecklist: ["Document employee notices in writing", "Consult DOLE Hotline 1349"],
          riskAssessment: "Moderate Legal Risk (Ensure full written documentation)",
          category: "General"
        },
        source: 'fallback'
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = (text: string, msgId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(msgId);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleToggleTask = (taskKey: string) => {
    setCheckedTasks(prev => ({
      ...prev,
      [taskKey]: !prev[taskKey],
    }));
  };

  const handleClearHistory = () => {
    setMessages([messages[0]]);
  };

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-6rem)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <Scale className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              DOLE & Philippine Labor Compliance AI Advisor
            </h1>
            <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-blue-200 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-blue-600" />
              PD 442 & DOLE Grounded
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Instant statutory compliance guidance, case law references, due process procedures, and HR action checklists.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleClearHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 rounded-lg border border-slate-200 shadow-2xs transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset Chat</span>
          </button>
        </div>
      </div>

      {/* Preset Fast-Inquiry Prompt Chips */}
      <div className="shrink-0 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-blue-600" />
          <span>Quick DOLE Compliance Questions:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESET_QUESTIONS.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(item.query)}
              disabled={isLoading}
              className="text-xs text-left bg-slate-50 hover:bg-blue-50/80 hover:border-blue-300 text-slate-700 px-3 py-2 rounded-lg border border-slate-200 transition-all flex items-center gap-2 group"
            >
              <span className="font-semibold text-blue-900 group-hover:text-blue-700">{item.topic}:</span>
              <span className="text-slate-600 truncate max-w-xs">{item.query}</span>
              <span className="text-[10px] bg-slate-200/60 text-slate-500 px-1.5 py-0.5 rounded font-mono">
                {item.badge}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Feed Container */}
      <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
        {/* Messages Feed */}
        <div className="flex-1 p-5 overflow-y-auto space-y-5">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-3xl rounded-2xl ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white px-4 py-3'
                  : 'bg-slate-50 border border-slate-200/90 text-slate-900 p-5'
              }`}>
                {/* User Message */}
                {msg.sender === 'user' && (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                )}

                {/* Assistant Message */}
                {msg.sender === 'assistant' && (
                  <div className="space-y-4 text-sm">
                    {/* Source & Timestamp Header */}
                    <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-200/60">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Scale className="w-3.5 h-3.5 text-blue-600" />
                        <span>DOLE Compliance Advisory</span>
                        {msg.source && (
                          <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-mono">
                            {msg.source === 'gemini_ai' ? 'Gemini 3.8 Flash' : 'Statutory Knowledge Base'}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span>{msg.timestamp}</span>
                        <button
                          onClick={() => handleCopyText(msg.text || msg.structuredData?.answer || '', msg.id)}
                          className="hover:text-slate-800 p-1 rounded transition-colors"
                          title="Copy advice text"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Legal Answer Text */}
                    <div className="text-slate-800 leading-relaxed whitespace-pre-line text-[13.5px]">
                      {msg.structuredData?.answer || msg.text}
                    </div>

                    {/* Legal Citations Box */}
                    {msg.structuredData?.legalReferences && msg.structuredData.legalReferences.length > 0 && (
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                        <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                          <span>Statutory Backing & Labor Code Citations:</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {msg.structuredData.legalReferences.map((ref, i) => (
                            <span 
                              key={i} 
                              className="text-xs font-mono bg-blue-50 text-blue-900 border border-blue-200/70 px-2 py-0.5 rounded-md flex items-center gap-1"
                            >
                              <span className="text-blue-500">§</span> {ref}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Checklist for HR */}
                    {msg.structuredData?.actionChecklist && msg.structuredData.actionChecklist.length > 0 && (
                      <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200 space-y-2">
                        <div className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                          <CheckSquare className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Mandatory HR Execution Checklist:</span>
                        </div>
                        <div className="space-y-1.5 pt-0.5">
                          {msg.structuredData.actionChecklist.map((task, i) => {
                            const taskKey = `${msg.id}-task-${i}`;
                            const isDone = !!checkedTasks[taskKey];
                            return (
                              <label
                                key={i}
                                className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer hover:text-slate-900"
                              >
                                <input
                                  type="checkbox"
                                  checked={isDone}
                                  onChange={() => handleToggleTask(taskKey)}
                                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                                />
                                <span className={isDone ? 'line-through text-slate-400' : 'text-slate-800'}>
                                  {task}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Legal Risk Assessment */}
                    {msg.structuredData?.riskAssessment && (
                      <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        <div>
                          <span className="font-bold">Risk Assessment: </span>
                          <span>{msg.structuredData.riskAssessment}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 font-bold text-xs mt-1">
                  HR
                </div>
              )}
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex gap-3.5 items-start">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Bot className="w-4 h-4 animate-pulse" />
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-500 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                <span>Consulting Philippine Labor Code, DOLE issuances, and legal precedents...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/50">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2.5"
          >
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Ask about DOLE rules, Art. 297/298 dismissal, 13th month, holiday pay, or night differential..."
                value={inputQuestion}
                onChange={(e) => setInputQuestion(e.target.value)}
                disabled={isLoading}
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-2xs"
              />
            </div>
            <button
              type="submit"
              disabled={!inputQuestion.trim() || isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-1.5 transition-colors shadow-xs shrink-0"
            >
              <span>Ask Advisor</span>
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Category Badges */}
          <div className="flex items-center gap-2 mt-2.5 text-xs text-slate-500">
            <span className="font-medium text-slate-600">Scope:</span>
            {['All', 'Dismissals (Art. 297/298)', 'Wages & OT', 'Leaves', 'Contracting (DO 174)'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  selectedCategory === cat 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-200/80 hover:bg-slate-300 text-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Official Government Hotlines Footer */}
      <div className="shrink-0 bg-slate-900 text-slate-300 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <PhoneCall className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-white">Philippine Government Labor Hotlines:</span>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-[11.5px]">
          <div>
            <span className="text-slate-400">DOLE 24/7 Hotline: </span>
            <span className="font-mono font-bold text-white">1349</span>
          </div>
          <div>
            <span className="text-slate-400">SSS Public Assistance: </span>
            <span className="font-mono font-bold text-white">1455</span>
          </div>
          <div>
            <span className="text-slate-400">PhilHealth: </span>
            <span className="font-mono font-bold text-white">(02) 8441-7442</span>
          </div>
          <div>
            <span className="text-slate-400">NLRC Assistance: </span>
            <span className="font-mono font-bold text-white">(02) 8781-7871</span>
          </div>
        </div>
      </div>
    </div>
  );
}
