import React from 'react';
import {
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Hammer,
  Bug,
  Code,
  Layers,
  FileCheck,
} from 'lucide-react';
import { AutonomousRun } from '../../types';

interface DevelopmentLoopVisualizerProps {
  run: AutonomousRun | null;
}

export const DevelopmentLoopVisualizer: React.FC<DevelopmentLoopVisualizerProps> = ({ run }) => {
  const currentStatus = run?.status || 'READY';

  // Map run status to active loop stage
  const getStageIndex = () => {
    switch (currentStatus) {
      case 'PLANNING':
        return 1;
      case 'RUNNING':
      case 'ITERATING':
        return 3;
      case 'BUILDING':
        return 4;
      case 'TESTING':
        return 5;
      case 'DEBUGGING':
        return 6;
      case 'IMPROVING':
        return 8;
      case 'WAITING_HUMAN':
        return 2; // Paused at approval
      default:
        return 3;
    }
  };

  const activeIndex = getStageIndex();

  const stages = [
    { id: 'goal', name: 'User Goal', icon: Sparkles, desc: 'Target requirement' },
    { id: 'plan', name: 'Milestone Graph', icon: Layers, desc: 'Decomposed tasks' },
    { id: 'approval', name: 'Safety / Approval', icon: FileCheck, desc: 'Human gating' },
    { id: 'agent', name: 'Agent Execution', icon: Code, desc: 'Code & asset creation' },
    { id: 'build', name: 'Build & Preview', icon: Hammer, desc: 'Compilation verification' },
    { id: 'qa', name: 'QA & Regression', icon: ShieldCheck, desc: 'Automated test suite' },
    { id: 'debug', name: 'Debug & Patch', icon: Bug, desc: 'Auto-fix cycle' },
    { id: 'gates', name: 'Quality Gates', icon: CheckCircle2, desc: 'Exit criteria' },
    { id: 'improve', name: 'Improvement', icon: RotateCcw, desc: 'Next cycle' },
  ];

  return (
    <div className="bg-[#0b0f19] border border-[#1b2336] rounded-2xl p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
            Continuous Development Loop
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Strict non-infinite autonomous progression with safety gates and automated verification
          </p>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-mono">
          <span className="text-slate-400">Loop Status:</span>
          <span
            className={`px-2 py-0.5 rounded font-bold uppercase ${
              currentStatus === 'RUNNING' || currentStatus === 'ITERATING'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : currentStatus === 'WAITING_HUMAN'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                : currentStatus === 'PAUSED'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                : 'bg-slate-800 text-slate-300'
            }`}
          >
            {currentStatus}
          </span>
        </div>
      </div>

      {/* Pipeline Track */}
      <div className="relative overflow-x-auto pb-2 custom-scrollbar">
        <div className="flex items-center gap-2 min-w-[860px]">
          {stages.map((stage, idx) => {
            const Icon = stage.icon;
            const isActive = idx === activeIndex;
            const isCompleted = idx < activeIndex;

            return (
              <React.Fragment key={stage.id}>
                <div
                  className={`flex-1 min-w-[90px] p-3 rounded-xl border transition-all duration-300 ${
                    isActive
                      ? 'bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                      : isCompleted
                      ? 'bg-[#0f1524] border-[#1f2a42] text-slate-300'
                      : 'bg-[#090d16] border-[#141c2c] text-slate-500 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                        isActive
                          ? 'bg-indigo-500 text-white'
                          : isCompleted
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-[#121827] text-slate-500'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[9px] font-mono text-slate-500">0{idx + 1}</span>
                  </div>
                  <div className={`text-xs font-bold font-mono truncate ${isActive ? 'text-white' : ''}`}>
                    {stage.name}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">{stage.desc}</div>
                </div>

                {idx < stages.length - 1 && (
                  <ArrowRight
                    className={`w-3.5 h-3.5 shrink-0 ${
                      idx < activeIndex ? 'text-emerald-500/70' : 'text-slate-600'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
