import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  CalendarCheck,
  CheckSquare,
  Bot,
  Terminal,
  ArrowRight,
  Info,
  Layers,
  ShieldCheck,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const QuickCommandArea: React.FC = () => {
  const {
    sendAICommand,
    currentProject,
    geminiStatus,
    currentAIPlan,
    projectPlans,
    setActiveTab,
    isPlanning,
  } = useApp();
  const [commandText, setCommandText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const quickPrompts = [
    'Add a creature capture system with trajectory physics',
    'Implement turn-based combat action state machine',
    'Create inventory crafting radial wheel for touchscreens',
    'Profile mobile texture memory and decimate LOD1 foliage',
  ];

  const pendingPlans = (projectPlans || []).filter((p) => p.status === 'PENDING_APPROVAL');
  const latestPendingPlan = pendingPlans[0] || (currentAIPlan?.status === 'PENDING_APPROVAL' ? currentAIPlan : null);

  const handleSubmit = async (mode: 'send' | 'plan' | 'task') => {
    if (!commandText.trim()) return;
    setIsSubmitting(true);
    try {
      await sendAICommand(commandText, mode);
      setCommandText('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="quick-command-box"
      className="relative overflow-hidden rounded-2xl bg-[#0e1320] border border-[#222e44] p-6 shadow-xl"
    >
      {/* Glow highlight */}
      <div className="absolute top-0 right-1/4 w-72 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-4">
        {/* Pending Plan Alert Banner if any */}
        {latestPendingPlan && (
          <div
            onClick={() => setActiveTab('AI Command Center')}
            className="flex items-center justify-between p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono cursor-pointer hover:bg-amber-500/15 transition-all"
          >
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>
                <strong className="text-white">Plan #{latestPendingPlan.version}</strong> is awaiting your approval ({latestPendingPlan.response.tasks.length} proposed tasks)
              </span>
            </div>
            <div className="flex items-center gap-1 text-white font-bold hover:underline">
              <span>Review in Command Center</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600/15 border border-indigo-500/30 text-indigo-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono tracking-widest text-indigo-400 uppercase font-bold">
                AI COMMAND CENTER • PHASE 3
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white font-mono">
                Direct your AI development team
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Gemini status pill */}
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#151c2c] border border-[#243048] text-[11px] font-mono text-slate-300">
              <div
                className={`w-2 h-2 rounded-full ${
                  geminiStatus.connected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
              <span>{geminiStatus.model}</span>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('AI Command Center')}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 hover:text-white text-xs font-mono font-semibold transition-colors"
            >
              <span>Open Command Center</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Large Prompt Input */}
        <div className="relative rounded-xl bg-[#090d16] border border-[#202b40] focus-within:border-indigo-500/60 focus-within:ring-1 focus-within:ring-indigo-500/40 transition-all p-3 shadow-inner">
          <textarea
            id="ai-command-input"
            rows={3}
            value={commandText}
            onChange={(e) => setCommandText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                handleSubmit('plan');
              }
            }}
            placeholder="What do you want to build? (e.g. 'Add a creature capture system with trajectory physics and Rift Orb consumption...')"
            className="w-full bg-transparent border-none text-slate-100 placeholder-slate-400 text-sm focus:outline-none resize-none leading-relaxed"
          />

          {/* Quick suggestions */}
          <div className="pt-2 border-t border-[#182133] flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-400" /> Suggestions:
            </span>
            {quickPrompts.map((prompt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCommandText(prompt)}
                className="text-[11px] text-slate-300 hover:text-white bg-[#131a28] hover:bg-[#1a2336] px-2.5 py-1 rounded-md border border-[#232f46] transition-colors truncate max-w-xs"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Actions bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
            <kbd className="px-1.5 py-0.5 rounded bg-[#161e2e] border border-[#26334a] text-slate-300">
              Ctrl + Enter
            </kbd>
            <span>to plan feature with Gemini Architect</span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Plan Feature button */}
            <button
              id="plan-feature-btn"
              type="button"
              disabled={isSubmitting || isPlanning || !commandText.trim()}
              onClick={() => handleSubmit('plan')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white border border-indigo-400/40 text-xs font-semibold font-mono shadow-[0_0_15px_rgba(99,102,241,0.3)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {isPlanning ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Planning...</span>
                </>
              ) : (
                <>
                  <CalendarCheck className="w-3.5 h-3.5 text-indigo-200" />
                  <span>Plan Feature with AI</span>
                </>
              )}
            </button>

            {/* Create Task button */}
            <button
              id="create-task-from-command-btn"
              type="button"
              disabled={isSubmitting || !commandText.trim()}
              onClick={() => handleSubmit('task')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#141b2a] hover:bg-[#1a2438] text-slate-200 border border-[#233048] text-xs font-semibold font-mono disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <CheckSquare className="w-3.5 h-3.5 text-sky-400" />
              <span>Create Task Directly</span>
            </button>
          </div>
        </div>

        {/* Phase 3 note */}
        <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2 bg-[#090d16]/70 p-2.5 rounded-lg border border-[#1a2335]">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span>
            Phase 3 Active: Gemini analyzes commands against project memory & constraints. Every proposed plan requires explicit human approval before any task creation.
          </span>
        </div>
      </div>
    </div>
  );
};
