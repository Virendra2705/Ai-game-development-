import React, { useState } from 'react';
import {
  Terminal,
  Sparkles,
  Bot,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  HelpCircle,
  Brain,
  ShieldCheck,
  Send,
  RefreshCw,
  Zap,
  Layers,
  ArrowRight,
  ListOrdered,
  FileCode2,
  Copy,
  ChevronRight,
  Download,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ProposedTask, ProposedMemoryUpdate, ProposedDecision } from '../../types';

export const AICommandCenterPage: React.FC = () => {
  const {
    currentProject,
    geminiStatus,
    testGeminiConnection,
    currentAIPlan,
    projectPlans,
    setCurrentAIPlan,
    isPlanning,
    generateAIPlan,
    approveCurrentPlan,
    rejectCurrentPlan,
    activeConversation,
    sendChatMessage,
    aiUsage,
    setActiveTab,
    addToast,
  } = useApp();

  const [prompt, setPrompt] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [isSendingChat, setIsSendingChat] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  // Checkbox selections for approval
  const [selectedTaskIndices, setSelectedTaskIndices] = useState<number[]>([]);
  const [selectedMemoryIndices, setSelectedMemoryIndices] = useState<number[]>([]);
  const [selectedDecisionIndices, setSelectedDecisionIndices] = useState<number[]>([]);
  const [isApproving, setIsApproving] = useState(false);

  // Sync selected indices when plan changes
  React.useEffect(() => {
    if (currentAIPlan?.response) {
      setSelectedTaskIndices(currentAIPlan.response.tasks.map((_, i) => i));
      setSelectedMemoryIndices(
        (currentAIPlan.response.projectMemoryUpdates || []).map((_, i) => i)
      );
      setSelectedDecisionIndices(
        (currentAIPlan.response.decisions || []).map((_, i) => i)
      );
    }
  }, [currentAIPlan]);

  const quickPrompts = [
    'Add a creature capture system with trajectory physics',
    'Implement turn-based combat action state machine',
    'Create inventory crafting radial wheel for touchscreens',
    'Optimize mobile draw calls and decimate foliage LOD1',
  ];

  const handleCreatePlan = async (cmd: string) => {
    if (!cmd.trim() || isPlanning) return;
    try {
      await generateAIPlan(cmd);
      setPrompt('');
    } catch (e) {
      // Error toasted in AppContext
    }
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setTestResult(null);
    try {
      const res = await testGeminiConnection();
      if (res.success) {
        setTestResult(`Online (${res.latencyMs}ms)`);
        addToast('Gemini Verified', res.message, 'success');
      } else {
        setTestResult('Offline / Key Missing');
        addToast('Connection Failed', res.message, 'warning');
      }
    } catch (err: any) {
      setTestResult('Test Error');
      addToast('Error', err.message, 'error');
    } finally {
      setTestingConnection(false);
    }
  };

  const handleApprove = async (all = false) => {
    if (!currentAIPlan) return;
    setIsApproving(true);
    try {
      const taskIndices = all
        ? currentAIPlan.response.tasks.map((_, i) => i)
        : selectedTaskIndices;
      const memIndices = all
        ? (currentAIPlan.response.projectMemoryUpdates || []).map((_, i) => i)
        : selectedMemoryIndices;
      const decIndices = all
        ? (currentAIPlan.response.decisions || []).map((_, i) => i)
        : selectedDecisionIndices;

      await approveCurrentPlan(taskIndices, memIndices, decIndices);
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!currentAIPlan) return;
    await rejectCurrentPlan();
  };

  const handleSendChat = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || isSendingChat) return;
    const msg = chatInput;
    setChatInput('');
    setIsSendingChat(true);
    try {
      await sendChatMessage(msg);
    } finally {
      setIsSendingChat(false);
    }
  };

  const copyPlanJson = () => {
    if (!currentAIPlan) return;
    navigator.clipboard.writeText(JSON.stringify(currentAIPlan, null, 2));
    addToast('Plan Copied', 'Full AI plan JSON copied to clipboard.', 'info');
  };

  const toggleTaskSelection = (index: number) => {
    setSelectedTaskIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const toggleMemorySelection = (index: number) => {
    setSelectedMemoryIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const toggleDecisionSelection = (index: number) => {
    setSelectedDecisionIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const pendingPlans = projectPlans.filter((p) => p.status === 'PENDING_APPROVAL');

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1e2433] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-widest text-indigo-400 uppercase font-bold px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
              PHASE 3 ACTIVE
            </span>
            <span className="text-xs font-mono text-slate-400">
              Project: <span className="text-white font-semibold">{currentProject.name}</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-mono tracking-tight mt-1 flex items-center gap-2.5">
            <Terminal className="w-7 h-7 text-indigo-400" />
            AI Development Command Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
            Direct your autonomous development team. The Gemini Game Architect interprets commands, analyzes project memory, identifies dependencies, and builds structured execution plans requiring human approval before task creation.
          </p>
        </div>

        {/* Gemini Provider Status Pill */}
        <div className="flex flex-wrap items-center gap-3">
          <div
            id="gemini-status-badge"
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#0e1320] border border-[#222e44] text-xs font-mono shadow-sm"
          >
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                geminiStatus.connected
                  ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)] animate-pulse'
                  : 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]'
              }`}
            />
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-semibold leading-tight">
                AI ORCHESTRATOR
              </span>
              <span className="text-slate-200 font-bold">
                {geminiStatus.model} {geminiStatus.connected ? '(Connected)' : '(Mock Fallback)'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleTestConnection}
            disabled={testingConnection}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#141b2a] hover:bg-[#1a2336] border border-[#232f46] text-xs font-mono text-slate-300 hover:text-white transition-colors disabled:opacity-50"
            title="Ping Gemini model server-side"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${testingConnection ? 'animate-spin' : ''}`} />
            <span>{testingConnection ? 'Pinging...' : testResult || 'Test Ping'}</span>
          </button>
        </div>
      </div>

      {/* Primary Command Input Area */}
      <div
        id="orchestrator-command-box"
        className="relative overflow-hidden rounded-2xl bg-[#0e1320] border border-[#222e44] p-5 sm:p-6 shadow-xl"
      >
        <div className="absolute top-0 right-1/3 w-96 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <label htmlFor="feature-plan-input" className="text-xs font-mono font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Plan New Game Feature
            </label>
            <span className="text-[11px] font-mono text-slate-400">
              Safe Planning Mode (Zero Autonomous Code Modifications)
            </span>
          </div>

          <div className="relative rounded-xl bg-[#090d16] border border-[#202b40] focus-within:border-indigo-500/60 focus-within:ring-1 focus-within:ring-indigo-500/40 transition-all p-3 shadow-inner">
            <textarea
              id="feature-plan-input"
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  handleCreatePlan(prompt);
                }
              }}
              placeholder="Describe the feature or system you want to develop... (e.g. 'Add a creature capture system with trajectory physics, Rift Orb consumption, catch rate calculations, and save data integration')"
              className="w-full bg-transparent border-none text-slate-100 placeholder-slate-400 text-sm focus:outline-none resize-none leading-relaxed"
            />

            {/* Suggestions */}
            <div className="pt-2 border-t border-[#182133] flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-400" /> Quick Prompts:
              </span>
              {quickPrompts.map((q, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setPrompt(q)}
                  className="text-[11px] text-slate-300 hover:text-white bg-[#131a28] hover:bg-[#1a2336] px-2.5 py-1 rounded-md border border-[#232f46] transition-colors truncate max-w-xs"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
              <kbd className="px-1.5 py-0.5 rounded bg-[#161e2e] border border-[#26334a] text-slate-300">
                Ctrl + Enter
              </kbd>
              <span>to send command to Game Architect</span>
            </div>

            <button
              id="generate-plan-submit-btn"
              type="button"
              disabled={isPlanning || !prompt.trim()}
              onClick={() => handleCreatePlan(prompt)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-xs font-mono shadow-[0_0_20px_rgba(99,102,241,0.3)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {isPlanning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Analyzing Project & Building Plan...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Development Plan</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Plan Review (Left/Center) + History & Chat (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Plan Review (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {currentAIPlan ? (
            <div
              id="ai-plan-review-card"
              className="rounded-2xl bg-[#0c101a] border border-[#1e2738] p-5 sm:p-6 space-y-6 shadow-xl"
            >
              {/* Plan Header Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1b2333] pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase font-bold text-indigo-400 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                      PLAN #{currentAIPlan.version}
                    </span>
                    <span
                      className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded ${
                        currentAIPlan.status === 'APPROVED'
                          ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                          : currentAIPlan.status === 'REJECTED'
                          ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                          : 'bg-amber-500/10 border border-amber-500/20 text-amber-300 animate-pulse'
                      }`}
                    >
                      {currentAIPlan.status.replace('_', ' ')}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      Phase: <span className="text-slate-200">{currentAIPlan.response.recommendedPhase || '4. GAMEPLAY'}</span>
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-white font-mono">
                    {currentAIPlan.request}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={copyPlanJson}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141b2a] hover:bg-[#1a2336] border border-[#232f46] text-xs font-mono text-slate-300 hover:text-white transition-colors"
                    title="Copy full JSON"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy JSON</span>
                  </button>
                </div>
              </div>

              {/* AI Understanding & Summary */}
              <div className="space-y-3 bg-[#080c14] p-4 rounded-xl border border-[#1b2333]">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-indigo-300 uppercase">
                  <Bot className="w-4 h-4 text-indigo-400" />
                  Architect Summary & Intent Breakdown
                </div>
                <p className="text-sm text-slate-200 leading-relaxed font-sans">
                  {currentAIPlan.response.summary}
                </p>
                <div className="text-xs text-slate-400 font-sans border-t border-[#182132] pt-2">
                  <span className="font-semibold text-slate-300">Technical Context: </span>
                  {currentAIPlan.response.understanding}
                </div>
              </div>

              {/* Assumptions, Risks & Questions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Assumptions */}
                <div className="bg-[#080c14] p-3.5 rounded-xl border border-[#1b2333] space-y-2">
                  <div className="text-xs font-mono font-bold text-sky-400 uppercase flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Assumptions ({currentAIPlan.response.assumptions?.length || 0})
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {(currentAIPlan.response.assumptions || []).map((a, i) => (
                      <li key={i} className="flex items-start gap-1.5 leading-snug">
                        <span className="text-sky-400 select-none">•</span>
                        <span>{a}</span>
                      </li>
                    ))}
                    {(!currentAIPlan.response.assumptions || currentAIPlan.response.assumptions.length === 0) && (
                      <li className="text-slate-400 italic">No assumptions recorded</li>
                    )}
                  </ul>
                </div>

                {/* Risks */}
                <div className="bg-[#080c14] p-3.5 rounded-xl border border-[#1b2333] space-y-2">
                  <div className="text-xs font-mono font-bold text-amber-400 uppercase flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Risks ({currentAIPlan.response.risks?.length || 0})
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {(currentAIPlan.response.risks || []).map((r, i) => (
                      <li key={i} className="flex items-start gap-1.5 leading-snug">
                        <span className="text-amber-400 select-none">•</span>
                        <span>{r}</span>
                      </li>
                    ))}
                    {(!currentAIPlan.response.risks || currentAIPlan.response.risks.length === 0) && (
                      <li className="text-slate-400 italic">No critical risks flagged</li>
                    )}
                  </ul>
                </div>

                {/* Questions */}
                <div className="bg-[#080c14] p-3.5 rounded-xl border border-[#1b2333] space-y-2">
                  <div className="text-xs font-mono font-bold text-purple-400 uppercase flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5" />
                    Open Questions ({currentAIPlan.response.questions?.length || 0})
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {(currentAIPlan.response.questions || []).map((q, i) => (
                      <li key={i} className="flex items-start gap-1.5 leading-snug">
                        <span className="text-purple-400 select-none">•</span>
                        <span>{q}</span>
                      </li>
                    ))}
                    {(!currentAIPlan.response.questions || currentAIPlan.response.questions.length === 0) && (
                      <li className="text-slate-400 italic">No ambiguities detected</li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Proposed Tasks List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-mono font-bold text-white uppercase flex items-center gap-2">
                    <ListOrdered className="w-4 h-4 text-indigo-400" />
                    Proposed Execution Tasks ({currentAIPlan.response.tasks.length})
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedTaskIndices(
                          selectedTaskIndices.length === currentAIPlan.response.tasks.length
                            ? []
                            : currentAIPlan.response.tasks.map((_, i) => i)
                        )
                      }
                      className="text-indigo-400 hover:text-indigo-300 underline text-[11px]"
                    >
                      {selectedTaskIndices.length === currentAIPlan.response.tasks.length
                        ? 'Deselect All'
                        : 'Select All'}
                    </button>
                    <span className="text-slate-400">
                      ({selectedTaskIndices.length}/{currentAIPlan.response.tasks.length} selected)
                    </span>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {currentAIPlan.response.tasks.map((task: ProposedTask, idx: number) => {
                    const isSelected = selectedTaskIndices.includes(idx);
                    return (
                      <div
                        key={idx}
                        onClick={() => toggleTaskSelection(idx)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#111724] border-indigo-500/40 shadow-sm'
                            : 'bg-[#080c14]/80 border-[#1c2436] opacity-60'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleTaskSelection(idx)}
                            onClick={(e) => e.stopPropagation()}
                            className="mt-1 rounded bg-[#161f30] border-[#293750] text-indigo-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                          />

                          <div className="flex-1 min-w-0 space-y-1.5">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <h4 className="text-sm font-semibold text-white font-mono truncate">
                                {task.title}
                              </h4>
                              <div className="flex items-center gap-2">
                                {/* Agent Badge */}
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-semibold">
                                  {task.recommendedAgent}
                                </span>
                                {/* Priority Badge */}
                                <span
                                  className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded ${
                                    task.priority === 'CRITICAL'
                                      ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                                      : task.priority === 'HIGH'
                                      ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                      : 'bg-slate-500/15 text-slate-300 border border-slate-500/30'
                                  }`}
                                >
                                  {task.priority}
                                </span>
                              </div>
                            </div>

                            <p className="text-xs text-slate-300 leading-relaxed font-sans">
                              {task.description}
                            </p>

                            {/* Dependencies visual */}
                            {task.dependencies && task.dependencies.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] font-mono text-slate-400">
                                <span className="text-slate-400">Depends on:</span>
                                {task.dependencies.map((dep, dIdx) => (
                                  <span
                                    key={dIdx}
                                    className="px-2 py-0.5 rounded bg-[#161d2c] border border-[#263248] text-indigo-300"
                                  >
                                    {dep}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Proposed Project Memory & Decisions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-[#1b2333] pt-4">
                {/* Proposed Memory Updates */}
                <div className="space-y-2">
                  <div className="text-xs font-mono font-bold text-purple-300 uppercase flex items-center gap-1.5">
                    <Brain className="w-4 h-4 text-purple-400" />
                    Proposed Memory Updates ({currentAIPlan.response.projectMemoryUpdates?.length || 0})
                  </div>
                  {(currentAIPlan.response.projectMemoryUpdates || []).map((m: ProposedMemoryUpdate, mIdx: number) => {
                    const isSelected = selectedMemoryIndices.includes(mIdx);
                    return (
                      <div
                        key={mIdx}
                        onClick={() => toggleMemorySelection(mIdx)}
                        className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#121122] border-purple-500/40'
                            : 'bg-[#080c14]/60 border-[#1c2436] opacity-60'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleMemorySelection(mIdx)}
                            onClick={(e) => e.stopPropagation()}
                            className="mt-0.5 rounded bg-[#161f30] border-[#293750] text-purple-600 focus:ring-0 cursor-pointer"
                          />
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-mono px-1.5 py-0.2 bg-purple-500/20 text-purple-300 rounded font-semibold">
                                {m.category}
                              </span>
                              <span className="font-semibold text-white font-mono">{m.title}</span>
                            </div>
                            <p className="text-slate-300 text-[11px] leading-relaxed">{m.content}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {(!currentAIPlan.response.projectMemoryUpdates || currentAIPlan.response.projectMemoryUpdates.length === 0) && (
                    <div className="text-xs text-slate-400 italic p-3 bg-[#080c14] rounded-lg border border-[#1b2333]">
                      No memory changes suggested.
                    </div>
                  )}
                </div>

                {/* Proposed Architectural Decisions */}
                <div className="space-y-2">
                  <div className="text-xs font-mono font-bold text-sky-300 uppercase flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-sky-400" />
                    Proposed Decisions ({currentAIPlan.response.decisions?.length || 0})
                  </div>
                  {(currentAIPlan.response.decisions || []).map((d: ProposedDecision, dIdx: number) => {
                    const isSelected = selectedDecisionIndices.includes(dIdx);
                    return (
                      <div
                        key={dIdx}
                        onClick={() => toggleDecisionSelection(dIdx)}
                        className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#0e1724] border-sky-500/40'
                            : 'bg-[#080c14]/60 border-[#1c2436] opacity-60'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleDecisionSelection(dIdx)}
                            onClick={(e) => e.stopPropagation()}
                            className="mt-0.5 rounded bg-[#161f30] border-[#293750] text-sky-600 focus:ring-0 cursor-pointer"
                          />
                          <div className="space-y-1">
                            <span className="font-semibold text-white font-mono">{d.title}</span>
                            <p className="text-slate-300 text-[11px] leading-relaxed">{d.reason}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {(!currentAIPlan.response.decisions || currentAIPlan.response.decisions.length === 0) && (
                    <div className="text-xs text-slate-400 italic p-3 bg-[#080c14] rounded-lg border border-[#1b2333]">
                      No new architectural decisions proposed.
                    </div>
                  )}
                </div>
              </div>

              {/* Human Approval Bar */}
              <div
                id="human-approval-action-bar"
                className="flex flex-wrap items-center justify-between gap-3 bg-[#080c14] p-4 rounded-xl border border-indigo-500/30"
              >
                <div className="space-y-0.5">
                  <div className="text-xs font-mono font-bold text-white uppercase flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Human Verification Required
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Approving will convert selected items into real Tasks and persist approved Memory entries.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  {currentAIPlan.status === 'PENDING_APPROVAL' && (
                    <>
                      <button
                        type="button"
                        onClick={handleReject}
                        className="px-4 py-2 rounded-xl bg-[#171217] hover:bg-[#20151c] text-rose-300 border border-rose-900/40 hover:border-rose-800 text-xs font-mono font-semibold transition-colors"
                      >
                        Reject Plan
                      </button>

                      <button
                        type="button"
                        disabled={isApproving || selectedTaskIndices.length === 0}
                        onClick={() => handleApprove(false)}
                        className="px-4 py-2 rounded-xl bg-[#14231b] hover:bg-[#1b3024] text-emerald-300 border border-emerald-800/40 hover:border-emerald-700 text-xs font-mono font-semibold disabled:opacity-40 transition-colors"
                      >
                        Approve Selected ({selectedTaskIndices.length})
                      </button>

                      <button
                        type="button"
                        disabled={isApproving}
                        onClick={() => handleApprove(true)}
                        className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-mono font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-40 transition-all flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve All Tasks</span>
                      </button>
                    </>
                  )}

                  {currentAIPlan.status === 'APPROVED' && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5 font-bold">
                        <CheckCircle2 className="w-4 h-4" />
                        Plan Approved & Dispatched
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveTab('Tasks')}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-semibold transition-colors"
                      >
                        View Tasks Board →
                      </button>
                    </div>
                  )}

                  {currentAIPlan.status === 'REJECTED' && (
                    <span className="text-xs font-mono text-rose-400 flex items-center gap-1.5 font-bold">
                      <XCircle className="w-4 h-4" />
                      Plan Rejected (No files modified)
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-[#0c101a] border border-[#1e2738] p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
                <Terminal className="w-8 h-8" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="text-lg font-bold text-white font-mono">No Active Development Plan</h3>
                <p className="text-xs text-slate-400">
                  Enter a command above (e.g. &quot;Add creature capture system&quot;) or pick one of the quick prompts to generate an architectural plan with Gemini.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: History, Multi-Turn Discussion & Usage (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Plan History */}
          <div className="rounded-2xl bg-[#0c101a] border border-[#1e2738] p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                Plan History ({projectPlans.length})
              </h3>
              {pendingPlans.length > 0 && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {pendingPlans.length} Pending
                </span>
              )}
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto custom-scrollbar pr-1">
              {projectPlans.map((p) => (
                <div
                  key={p.planId}
                  onClick={() => setCurrentAIPlan(p)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    currentAIPlan?.planId === p.planId
                      ? 'bg-[#151c2c] border-indigo-500/50 shadow-sm'
                      : 'bg-[#080c14] border-[#1b2333] hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-mono font-bold text-indigo-400">
                      PLAN #{p.version}
                    </span>
                    <span
                      className={`text-[9px] font-mono uppercase font-bold px-1.5 py-0.2 rounded ${
                        p.status === 'APPROVED'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : p.status === 'REJECTED'
                          ? 'bg-rose-500/10 text-rose-400'
                          : 'bg-amber-500/10 text-amber-300'
                      }`}
                    >
                      {p.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-xs text-slate-200 font-mono truncate">{p.request}</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-1">
                    {new Date(p.createdAt).toLocaleDateString()} {new Date(p.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              ))}
              {projectPlans.length === 0 && (
                <div className="text-xs text-slate-400 italic p-3 text-center">
                  No previous plans generated yet.
                </div>
              )}
            </div>
          </div>

          {/* Multi-Turn Architect Chat Panel */}
          <div
            id="ai-architect-discussion"
            className="rounded-2xl bg-[#0c101a] border border-[#1e2738] p-4 sm:p-5 flex flex-col h-[480px] shadow-xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#1b2333]">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
                  Architect Discussion
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Multi-Turn</span>
            </div>

            {/* Message Feed */}
            <div className="flex-1 overflow-y-auto custom-scrollbar py-3 space-y-3 pr-1 text-xs">
              {(activeConversation?.messages || []).map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-xl max-w-[90%] ${
                    msg.role === 'USER'
                      ? 'ml-auto bg-indigo-600/20 border border-indigo-500/30 text-slate-200'
                      : msg.role === 'SYSTEM'
                      ? 'mx-auto bg-[#080c14] border border-[#1c2436] text-slate-400 text-center font-mono text-[11px]'
                      : 'mr-auto bg-[#090d16] border border-[#1d273a] text-slate-200'
                  }`}
                >
                  <div className="text-[10px] font-mono text-slate-400 mb-1 font-semibold">
                    {msg.role === 'USER' ? 'You (Human Lead)' : msg.role === 'SYSTEM' ? 'System' : 'Game Architect'}
                  </div>
                  <div className="leading-relaxed whitespace-pre-wrap">{msg.content}</div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendChat} className="pt-2 border-t border-[#1b2333] flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask architect or refine plan (e.g. 'Add a cooldown')..."
                className="flex-1 bg-[#090d16] border border-[#1f2a3e] focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-400 focus:outline-none"
              />
              <button
                type="submit"
                disabled={isSendingChat || !chatInput.trim()}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono disabled:opacity-40 transition-colors shrink-0 flex items-center justify-center"
              >
                {isSendingChat ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              </button>
            </form>
          </div>

          {/* AI Usage & Token Widget */}
          <div className="rounded-2xl bg-[#0c101a] border border-[#1e2738] p-4 space-y-2.5 text-xs font-mono">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Usage & Telemetry</span>
              <span className="text-indigo-400 font-normal">{aiUsage.model}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 rounded-lg bg-[#080c14] border border-[#192234]">
                <div className="text-slate-400">Session Plans</div>
                <div className="text-white font-bold text-sm mt-0.5">{aiUsage.sessionRequests}</div>
              </div>
              <div className="p-2 rounded-lg bg-[#080c14] border border-[#192234]">
                <div className="text-slate-400">Today Plans</div>
                <div className="text-white font-bold text-sm mt-0.5">{aiUsage.todayRequests}</div>
              </div>
            </div>
            <div className="text-[10px] text-slate-400 flex items-center justify-between border-t border-[#182132] pt-2">
              <span>Token Estimate:</span>
              <span className="text-slate-300">{aiUsage.estimatedTokens}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
