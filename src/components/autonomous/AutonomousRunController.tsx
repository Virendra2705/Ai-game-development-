import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Square,
  FastForward,
  AlertTriangle,
  Clock,
  Coins,
  Cpu,
  Shield,
  ArrowRight,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { AutonomousRun, AutonomousMode } from '../../types';

interface AutonomousRunControllerProps {
  run: AutonomousRun | null;
  onStart: (goal: string, mode: AutonomousMode) => void;
  onPause: () => void;
  onResume: () => void;
  onStep: () => void;
  onCancel: () => void;
  onSwitchMode: (mode: AutonomousMode) => void;
  onOpenApprovals: () => void;
  onOpenEmbervaleModal: () => void;
}

export const AutonomousRunController: React.FC<AutonomousRunControllerProps> = ({
  run,
  onStart,
  onPause,
  onResume,
  onStep,
  onCancel,
  onSwitchMode,
  onOpenApprovals,
  onOpenEmbervaleModal,
}) => {
  const currentMode: AutonomousMode = run?.mode || 'SUPERVISED_AUTONOMOUS';
  const isRunning = run?.status === 'RUNNING' || run?.status === 'ITERATING';
  const isWaitingHuman = run?.status === 'WAITING_HUMAN';
  const isPaused = run?.status === 'PAUSED';
  const isCompleted = run?.status === 'COMPLETED';

  const modes: { id: AutonomousMode; label: string; desc: string; color: string }[] = [
    {
      id: 'MANUAL',
      label: 'MANUAL',
      desc: 'Human plans & triggers each step directly',
      color: 'slate',
    },
    {
      id: 'ASSISTED',
      label: 'ASSISTED',
      desc: 'AI plans and asks confirmation before each action',
      color: 'sky',
    },
    {
      id: 'SUPERVISED_AUTONOMOUS',
      label: 'SUPERVISED AUTONOMOUS',
      desc: 'Runs continuously until a quality gate or high-impact approval is hit',
      color: 'indigo',
    },
    {
      id: 'AUTONOMOUS_SANDBOX',
      label: 'AUTONOMOUS SANDBOX',
      desc: 'Isolated environment for unconstrained exploration',
      color: 'purple',
    },
  ];

  return (
    <div className="bg-[#0c101b] border border-[#1b2438] rounded-2xl p-6 shadow-xl space-y-6">
      {/* Top: Active Goal & Mode Selection */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-5 border-b border-[#1b2438]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Active Development Goal
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              Run ID: {run?.id || 'No Active Run'}
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-white font-mono flex items-center gap-2">
            «{run?.goal || 'No goal loaded. Select or launch an autonomous objective.'}»
          </h2>
        </div>

        {/* Quick Embervale Action Button */}
        <button
          onClick={onOpenEmbervaleModal}
          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/40 text-amber-300 font-mono text-xs font-bold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(245,158,11,0.15)] shrink-0"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Embervale Autonomous Test Goal</span>
        </button>
      </div>

      {/* Mode Selector */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
          Autonomous Operating Mode
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {modes.map((m) => {
            const isSelected = currentMode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => onSwitchMode(m.id)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/30 shadow-lg'
                    : 'bg-[#090d16] border-[#161f33] hover:border-[#24314f] text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-mono font-bold ${
                      isSelected ? 'text-white' : 'text-slate-300'
                    }`}
                  >
                    {m.label}
                  </span>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{m.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Critical Stop Condition / Pause Alert */}
      {isWaitingHuman && run?.pauseReason && (
        <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/40 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-300 font-mono font-bold text-xs uppercase">
              <AlertTriangle className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>AUTONOMOUS RUN PAUSED — Human Approval Required</span>
            </div>
            <button
              onClick={onOpenApprovals}
              className="px-3 py-1 rounded-lg bg-amber-500 text-slate-950 text-xs font-bold font-mono hover:bg-amber-400 flex items-center gap-1.5 transition-colors"
            >
              <span>Review in Approvals Queue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs font-mono text-slate-300">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Reason:</span>
              <p className="text-amber-200">{run.pauseReason.reason}</p>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Requested Action:</span>
              <p className="text-slate-300">{run.pauseReason.requestedAction}</p>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Risk & Recommendation:</span>
              <p className="text-slate-300">
                <span className="text-rose-400 font-bold">[{run.pauseReason.risk} RISK]</span>{' '}
                {run.pauseReason.recommendedDecision}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Telemetry & Metrics Strip */}
      {run && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-[#090d16] border border-[#161f33]">
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 uppercase">
              <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
              <span>Iterations</span>
            </div>
            <div className="text-lg font-bold font-mono text-white mt-1">
              {run.currentIteration}{' '}
              <span className="text-xs text-slate-500 font-normal">/ {run.maxIterations}</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-indigo-500 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, (run.currentIteration / run.maxIterations) * 100)}%` }}
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#090d16] border border-[#161f33]">
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 uppercase">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              <span>Elapsed Runtime</span>
            </div>
            <div className="text-lg font-bold font-mono text-white mt-1">
              {Math.floor(run.elapsedSeconds / 60)}m{' '}
              <span className="text-xs text-slate-500 font-normal">/ {run.maxRuntime}m</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-sky-500 h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(100, (run.elapsedSeconds / (run.maxRuntime * 60)) * 100)}%`,
                }}
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#090d16] border border-[#161f33]">
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 uppercase">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>Budget Usage</span>
            </div>
            <div className="text-lg font-bold font-mono text-white mt-1">
              ${run.budgetUsed.toFixed(2)}{' '}
              <span className="text-xs text-slate-500 font-normal">/ ${run.budgetLimit.toFixed(2)}</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, (run.budgetUsed / run.budgetLimit) * 100)}%` }}
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#090d16] border border-[#161f33]">
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 uppercase">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <span>Active Agent</span>
            </div>
            <div className="text-xs font-bold font-mono text-white mt-1 truncate">
              {run.currentAgent || 'Idle'}
            </div>
            <div className="text-[10px] text-slate-400 truncate mt-1">
              {run.currentTask || 'Awaiting instruction'}
            </div>
          </div>
        </div>
      )}

      {/* Run Action Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          {isRunning ? (
            <button
              onClick={onPause}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-xs font-bold flex items-center gap-2 transition-colors"
            >
              <Pause className="w-4 h-4" />
              <span>Pause Run</span>
            </button>
          ) : (
            <button
              onClick={onResume}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold flex items-center gap-2 transition-colors shadow-[0_0_15px_rgba(99,102,241,0.2)]"
            >
              <Play className="w-4 h-4" />
              <span>{isPaused || isWaitingHuman ? 'Resume Autonomous Loop' : 'Start Autonomous Run'}</span>
            </button>
          )}

          <button
            onClick={onStep}
            disabled={isRunning}
            className={`px-3.5 py-2 rounded-xl border border-[#24304c] text-slate-300 font-mono text-xs font-bold flex items-center gap-1.5 transition-colors ${
              isRunning ? 'opacity-40 cursor-not-allowed' : 'hover:bg-[#151c2e] hover:text-white'
            }`}
          >
            <FastForward className="w-4 h-4 text-indigo-400" />
            <span>Step Single Iteration</span>
          </button>

          <button
            onClick={onCancel}
            className="px-3.5 py-2 rounded-xl border border-rose-500/30 text-rose-300 hover:bg-rose-500/10 font-mono text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Square className="w-3.5 h-3.5 text-rose-400" />
            <span>Cancel Run</span>
          </button>
        </div>

        <div className="text-[11px] font-mono text-slate-500 flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>Safety Policy: Non-infinite Loop Guarantees Active</span>
        </div>
      </div>
    </div>
  );
};
