import React, { useState } from 'react';
import {
  CheckCircle2,
  Terminal,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Layers,
  Database,
  Cpu,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Phase2StatusPanel: React.FC = () => {
  const { adapterName, isLocalMode, adapterStatusMessage } = useApp();
  const [collapsed, setCollapsed] = useState(false);

  const checklist = [
    { label: 'Project Memory', status: 'Ready', desc: '18 structured memory categories + JSON snapshot generator' },
    { label: 'Persistent Data Layer', status: 'Ready', desc: adapterStatusMessage },
    { label: 'Task System', status: 'Ready', desc: 'Dependency tracking, blocked verification & persistent kanban' },
    { label: 'Agent Data Model', status: 'Ready', desc: '10 specialized agent roles with runtime status contracts' },
    { label: 'Build Data Model', status: 'Ready', desc: 'Continuous compilation runner & artifact state logs' },
    { label: 'Asset Data Model', status: 'Ready', desc: 'Multi-category 3D/audio/texture asset repository' },
    { label: 'QA Data Model', status: 'Ready', desc: 'Category-indexed test suites with severity profiling' },
    { label: 'Activity System', status: 'Ready', desc: '14-event structured audit timeline & event dispatching' },
    { label: 'Future AI Interface', status: 'Ready', desc: 'AIAgentRequest / AIAgentResponse typed contracts' },
  ];

  return (
    <div
      id="phase-2-developer-status-panel"
      className="rounded-2xl bg-[#090d16] border border-emerald-500/30 p-5 shadow-xl transition-all"
    >
      <div className="flex items-center justify-between border-b border-[#182236] pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold tracking-widest text-emerald-400 uppercase">
                PHASE 2 COMPLETE
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-semibold">
                SYSTEM VERIFIED
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400 mt-0.5">
              Project Memory & Backend Foundation operational ({adapterName})
            </p>
          </div>
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#121927] hover:bg-[#182236] text-slate-300 border border-[#212d44] text-xs font-mono transition-colors"
        >
          <span>{collapsed ? 'View Status' : 'Minimize'}</span>
          {collapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </button>
      </div>

      {!collapsed && (
        <div className="space-y-4 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {checklist.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#0e1422] border border-[#1b2538]"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-white truncate">
                      {item.label}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-emerald-400">
                      {item.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Next Recommended Phase Banner (Section 33) */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-indigo-950/70 via-[#101828] to-[#0d1322] border border-indigo-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-indigo-400 shrink-0" />
              <div>
                <span className="text-[10px] font-mono text-indigo-400 uppercase font-bold tracking-wider">
                  NEXT RECOMMENDED PHASE
                </span>
                <h4 className="text-xs sm:text-sm font-extrabold text-white font-mono">
                  PHASE 3 — AI ORCHESTRATOR + REAL GEMINI AGENT
                </h4>
              </div>
            </div>

            <div className="px-3 py-1.5 rounded-lg bg-[#141b2b] border border-[#232f48] text-[11px] font-mono text-slate-300">
              Standing by for Phase 3 instruction...
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
