import React, { useState } from 'react';
import {
  Brain,
  Code,
  Gamepad2,
  Palette,
  Box,
  Map,
  Swords,
  ShieldCheck,
  Wrench,
  Zap,
  X,
  Sparkles,
  CheckCircle2,
  Clock,
  Activity as ActivityIcon,
  Settings2,
  ExternalLink,
  ChevronRight,
  Shield,
  Layers,
} from 'lucide-react';
import { Agent } from '../../types';
import { useApp } from '../../context/AppContext';

const getAgentIcon = (name: string) => {
  switch (name) {
    case 'Brain':
      return Brain;
    case 'Code':
      return Code;
    case 'Gamepad2':
      return Gamepad2;
    case 'Palette':
      return Palette;
    case 'Box':
      return Box;
    case 'Map':
      return Map;
    case 'Swords':
      return Swords;
    case 'ShieldCheck':
      return ShieldCheck;
    case 'Wrench':
      return Wrench;
    case 'Zap':
      return Zap;
    default:
      return Sparkles;
  }
};

export const AgentDetailModal: React.FC = () => {
  const { selectedAgent, setSelectedAgent, tasks, currentProject, addToast } = useApp();
  const [activeSection, setActiveSection] = useState<'overview' | 'responsibilities' | 'tasks' | 'config'>(
    'overview'
  );

  if (!selectedAgent) return null;

  const IconComponent = getAgentIcon(selectedAgent.iconName);

  const agentTasks = tasks.filter((t) => t.agentId === selectedAgent.id);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
      onClick={() => setSelectedAgent(null)}
    >
      <div
        className="w-full max-w-3xl rounded-2xl bg-[#0d121c] border border-[#232f48] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 sm:p-6 border-b border-[#1d273a] bg-[#111726]">
          <div className="flex items-center gap-4">
            <div
              className="p-3.5 rounded-2xl border flex items-center justify-center shadow-lg"
              style={{
                backgroundColor: `${selectedAgent.colorScheme.accent}15`,
                borderColor: `${selectedAgent.colorScheme.accent}40`,
              }}
            >
              <IconComponent
                className="w-7 h-7"
                style={{ color: selectedAgent.colorScheme.accent }}
              />
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-xl font-bold text-white font-mono">{selectedAgent.name}</h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold flex items-center gap-1.5 ${
                    selectedAgent.status === 'Ready'
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      : selectedAgent.status === 'Working'
                      ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                      : 'bg-slate-700/30 text-slate-300 border border-slate-600/30'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      selectedAgent.status === 'Ready'
                        ? 'bg-emerald-400'
                        : selectedAgent.status === 'Working'
                        ? 'bg-sky-400 animate-pulse'
                        : 'bg-slate-400'
                    }`}
                  />
                  {selectedAgent.status}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono mt-0.5">{selectedAgent.role}</p>
            </div>
          </div>

          <button
            onClick={() => setSelectedAgent(null)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#182133] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section Tabs */}
        <div className="flex border-b border-[#1d273a] bg-[#0c101a] px-5 sm:px-6 gap-2 sm:gap-4 overflow-x-auto text-xs font-mono">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'responsibilities', label: 'Responsibilities' },
            { id: 'tasks', label: `Current Tasks (${agentTasks.length})` },
            { id: 'config', label: 'Configuration & AI Provider' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as any)}
              className={`py-3 px-2 border-b-2 font-medium whitespace-nowrap transition-colors ${
                activeSection === tab.id
                  ? 'border-indigo-400 text-indigo-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto custom-scrollbar space-y-5 text-xs text-slate-300">
          {activeSection === 'overview' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider mb-1">
                  AGENT SUMMARY
                </h4>
                <p className="text-slate-200 text-sm leading-relaxed">
                  {selectedAgent.description}
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-[#131926] border border-[#222c40]">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Tasks Done</span>
                  <div className="text-lg font-bold text-white font-mono mt-0.5">
                    {selectedAgent.completedTasksCount}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#131926] border border-[#222c40]">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Success Rate</span>
                  <div className="text-lg font-bold text-emerald-400 font-mono mt-0.5">
                    {selectedAgent.successRate}%
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#131926] border border-[#222c40]">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Last Active</span>
                  <div className="text-sm font-bold text-slate-200 font-mono mt-1">
                    {selectedAgent.lastActive}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#131926] border border-[#222c40]">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Target Project</span>
                  <div className="text-xs font-bold text-indigo-300 font-mono mt-1 truncate">
                    {currentProject.name}
                  </div>
                </div>
              </div>

              {/* Current active task banner */}
              {selectedAgent.currentTask ? (
                <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/30 space-y-1">
                  <div className="flex items-center gap-2 text-[10px] font-mono text-indigo-400 uppercase font-semibold">
                    <ActivityIcon className="w-3.5 h-3.5 animate-pulse" />
                    <span>CURRENT ACTIVITY</span>
                  </div>
                  <p className="text-xs text-white font-medium">{selectedAgent.currentTask}</p>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-[#131926] border border-[#212b3e] text-slate-400 font-mono text-xs">
                  Agent currently waiting in idle pool. Queue a new task to engage.
                </div>
              )}
            </div>
          )}

          {activeSection === 'responsibilities' && (
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">
                CORE RESPONSIBILITIES & DOMAIN BOUNDARIES
              </h4>
              <div className="space-y-2.5">
                {selectedAgent.responsibilities.map((resp, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 rounded-xl bg-[#131926] border border-[#212b3e]"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                    <span className="text-slate-200 leading-relaxed text-xs">{resp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'tasks' && (
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">
                ASSIGNED SPRINT TASKS ({agentTasks.length})
              </h4>
              {agentTasks.length === 0 ? (
                <div className="p-6 text-center text-slate-400 font-mono bg-[#131926] rounded-xl border border-[#212b3e]">
                  No active tasks assigned to this agent yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {agentTasks.map((t) => (
                    <div
                      key={t.id}
                      className="p-3.5 rounded-xl bg-[#131926] border border-[#212b3e] flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">{t.title}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#1c2436] text-slate-300">
                            {t.priority}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{t.description}</p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[11px] font-mono text-indigo-300 font-bold">
                          {t.status} ({t.progress}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeSection === 'config' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider mb-2">
                  AI PROVIDER INTEGRATION (PHASE 2)
                </h4>
                <div className="p-4 rounded-xl bg-[#131926] border border-[#232f48] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-300 font-mono">Current AI Provider:</span>
                    <span className="px-2.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-mono">
                      Not Connected (Phase 1 Simulated)
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-300 font-mono">Future Provider Target:</span>
                    <span className="text-xs font-semibold text-indigo-400 font-mono">
                      {selectedAgent.futureAIProvider}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400 leading-relaxed border-t border-[#1d273a] pt-2">
                    {selectedAgent.providerStatus}. In Phase 2, this agent will authenticate through your Google Gemini or Codex enterprise endpoint to perform autonomous reasoning.
                  </div>

                  <button
                    onClick={() => {
                      addToast(
                        'Future Provider Routing',
                        `Provider ${selectedAgent.futureAIProvider} will be wired in Phase 2 via server API proxy.`,
                        'info'
                      );
                    }}
                    className="w-full py-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-mono font-medium transition-colors"
                  >
                    Configure Provider Credentials (Phase 2 Preview)
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#1d273a] bg-[#0c101a] flex justify-between items-center text-xs font-mono">
          <span className="text-slate-400">Agent ID: {selectedAgent.id}</span>
          <button
            onClick={() => setSelectedAgent(null)}
            className="px-4 py-1.5 rounded-lg bg-[#182133] hover:bg-[#202c42] text-slate-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
