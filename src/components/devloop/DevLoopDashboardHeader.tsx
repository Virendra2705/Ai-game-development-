import React, { useEffect, useState } from 'react';
import {
  Code2,
  Hammer,
  Play,
  ShieldAlert,
  Bug,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Sliders,
  Layers,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { devLoopService } from '../../services/devLoopService';
import { DevLoopPipelineStatus } from '../../types';

interface DevLoopDashboardHeaderProps {
  onSelectTab?: (tab: 'pipeline' | 'build' | 'preview' | 'qa' | 'debug' | 'artifacts' | 'settings') => void;
  activeSubTab?: string;
}

export const DevLoopDashboardHeader: React.FC<DevLoopDashboardHeaderProps> = ({
  onSelectTab,
  activeSubTab = 'pipeline',
}) => {
  const { currentProject, addToast } = useApp();
  const [status, setStatus] = useState<DevLoopPipelineStatus>(devLoopService.getStatus());
  const [runningStep, setRunningStep] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = devLoopService.subscribe((newStatus) => {
      setStatus(newStatus);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const handleRunFullPipeline = async () => {
    if (status.isPipelineRunning) return;
    addToast('Pipeline Started', 'Executing automated Code → Build → Preview → QA loop...', 'info');

    const result = await devLoopService.runFullPipeline(currentProject, (stage, msg) => {
      setRunningStep(`[${stage}] ${msg}`);
    });

    setRunningStep(null);
    if (result.success) {
      addToast('Pipeline Complete', result.message, 'success');
    } else {
      addToast('Pipeline Paused for QA', result.message, 'warning');
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-[#0d121f] border border-[#1e293b] shadow-xl relative overflow-hidden">
      {/* Background ambient gradient */}
      <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 relative z-10">
        {/* Left: Title and Stage indicator */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
            <span>PHASE 5 CONTROLLED DEVELOPMENT LOOP</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight flex items-center gap-3">
            <span>DEVELOPMENT LOOP</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-semibold font-sans">
              Stage: {status.currentStage}
            </span>
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Autonomous execution with human approval gates: CODE → BUILD → PREVIEW → QA → DEBUG → RETEST.
          </p>
        </div>

        {/* Right: Pipeline runner button */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleRunFullPipeline}
            disabled={status.isPipelineRunning}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all shadow-lg cursor-pointer ${
              status.isPipelineRunning
                ? 'bg-indigo-900/50 text-indigo-300 border border-indigo-700/50 cursor-not-allowed'
                : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-indigo-500/25 hover:shadow-indigo-500/40'
            }`}
          >
            {status.isPipelineRunning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-indigo-300" />
                <span>Running Pipeline...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-purple-200" />
                <span>Run Full Pipeline (Build → QA)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Progress banner when running */}
      {runningStep && (
        <div className="mt-4 px-4 py-2 rounded-xl bg-indigo-950/60 border border-indigo-500/30 text-indigo-200 text-xs font-mono flex items-center gap-2 animate-pulse">
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
          <span>{runningStep}</span>
        </div>
      )}

      {/* Stage Cards Grid (Section 36) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-5">
        {/* 1. Code */}
        <div
          onClick={() => onSelectTab?.('pipeline')}
          className="p-3.5 rounded-xl bg-[#131a29] border border-[#232f48] hover:border-indigo-500/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Code</span>
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-sm font-bold text-white font-mono">Approved</div>
          <div className="text-[11px] text-slate-400 font-mono">Branch: task/142</div>
        </div>

        {/* 2. Build */}
        <div
          onClick={() => onSelectTab?.('build')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer group ${
            activeSubTab === 'build'
              ? 'bg-indigo-950/40 border-indigo-500/60'
              : 'bg-[#131a29] border-[#232f48] hover:border-indigo-500/40'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <Hammer className="w-3.5 h-3.5 text-indigo-400" />
              <span>Build</span>
            </span>
            {status.buildStatus === 'BUILDING' ? (
              <RefreshCw className="w-3.5 h-3.5 text-sky-400 animate-spin" />
            ) : status.buildStatus === 'FAILED' ? (
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            )}
          </div>
          <div className="mt-2 text-sm font-bold text-white font-mono flex items-center gap-1.5">
            <span>{status.buildStatus === 'BUILDING' ? 'Building' : 'Build #142'}</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">Godot 4.3 Web</div>
        </div>

        {/* 3. Preview */}
        <div
          onClick={() => onSelectTab?.('preview')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer group ${
            activeSubTab === 'preview'
              ? 'bg-indigo-950/40 border-indigo-500/60'
              : 'bg-[#131a29] border-[#232f48] hover:border-indigo-500/40'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <Play className="w-3.5 h-3.5 text-indigo-400" />
              <span>Preview</span>
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <div className="mt-2 text-sm font-bold text-white font-mono">Running</div>
          <div className="text-[11px] text-slate-400 font-mono">60 FPS • Canvas</div>
        </div>

        {/* 4. QA */}
        <div
          onClick={() => onSelectTab?.('qa')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer group ${
            activeSubTab === 'qa'
              ? 'bg-indigo-950/40 border-indigo-500/60'
              : 'bg-[#131a29] border-[#232f48] hover:border-indigo-500/40'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>QA Status</span>
            </span>
            {status.qaStatus === 'PASS' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold">
                ⚠
              </span>
            )}
          </div>
          <div className="mt-2 text-sm font-bold text-amber-300 font-mono">
            {status.qaStatus === 'PASS' ? 'Passed' : 'Issues Found'}
          </div>
          <div className="text-[11px] text-slate-400 font-mono">6/7 Tests Passed</div>
        </div>

        {/* 5. Issues */}
        <div
          onClick={() => onSelectTab?.('debug')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer group ${
            activeSubTab === 'debug'
              ? 'bg-indigo-950/40 border-indigo-500/60'
              : 'bg-[#131a29] border-[#232f48] hover:border-indigo-500/40'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <Bug className="w-3.5 h-3.5 text-rose-400" />
              <span>Issues</span>
            </span>
            <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-mono text-[10px] font-bold">
              {status.issuesCount}
            </span>
          </div>
          <div className="mt-2 text-sm font-bold text-rose-400 font-mono">
            {status.issuesCount > 0 ? `${status.issuesCount} Open` : 'Clean'}
          </div>
          <div className="text-[11px] text-slate-400 font-mono">CreatureDatabase</div>
        </div>

        {/* 6. Fixes */}
        <div
          onClick={() => onSelectTab?.('debug')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer group ${
            activeSubTab === 'debug'
              ? 'bg-indigo-950/40 border-indigo-500/60'
              : 'bg-[#131a29] border-[#232f48] hover:border-indigo-500/40'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Fixes</span>
            </span>
            <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
              {status.fixesCount}
            </span>
          </div>
          <div className="mt-2 text-sm font-bold text-emerald-400 font-mono">
            {status.fixesCount > 0 ? `${status.fixesCount} Verified` : '1 Ready'}
          </div>
          <div className="text-[11px] text-slate-400 font-mono">Root Cause Ready</div>
        </div>
      </div>

      {/* Navigation Buttons Row per Section 36 */}
      <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-[#1e293b]/60 mt-4">
        <button
          onClick={() => onSelectTab?.('build')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === 'build'
              ? 'bg-indigo-600 text-white'
              : 'bg-[#161f30] text-slate-300 hover:text-white hover:bg-[#1f2c45]'
          }`}
        >
          <Hammer className="w-3.5 h-3.5" />
          <span>Open Build Center</span>
        </button>

        <button
          onClick={() => onSelectTab?.('preview')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === 'preview'
              ? 'bg-indigo-600 text-white'
              : 'bg-[#161f30] text-slate-300 hover:text-white hover:bg-[#1f2c45]'
          }`}
        >
          <Play className="w-3.5 h-3.5" />
          <span>Open Preview</span>
        </button>

        <button
          onClick={() => onSelectTab?.('qa')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === 'qa'
              ? 'bg-indigo-600 text-white'
              : 'bg-[#161f30] text-slate-300 hover:text-white hover:bg-[#1f2c45]'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          <span>Open QA Center</span>
        </button>

        <button
          onClick={() => onSelectTab?.('debug')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === 'debug'
              ? 'bg-indigo-600 text-white'
              : 'bg-[#161f30] text-slate-300 hover:text-white hover:bg-[#1f2c45]'
          }`}
        >
          <Bug className="w-3.5 h-3.5 text-rose-400" />
          <span>Open Issues & Debug ({status.issuesCount})</span>
        </button>

        <button
          onClick={() => onSelectTab?.('artifacts')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === 'artifacts'
              ? 'bg-indigo-600 text-white'
              : 'bg-[#161f30] text-slate-300 hover:text-white hover:bg-[#1f2c45]'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-indigo-300" />
          <span>Artifacts Center</span>
        </button>

        <button
          onClick={() => onSelectTab?.('settings')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === 'settings'
              ? 'bg-indigo-600 text-white'
              : 'bg-[#161f30] text-slate-300 hover:text-white hover:bg-[#1f2c45]'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Build Profiles</span>
        </button>
      </div>
    </div>
  );
};
