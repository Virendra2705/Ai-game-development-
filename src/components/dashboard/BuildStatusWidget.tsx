import React from 'react';
import {
  Hammer,
  CheckCircle2,
  Play,
  FileText,
  Clock,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const BuildStatusWidget: React.FC = () => {
  const { builds, currentProject, triggerBuild, setActiveBuildModal, setActiveTab } = useApp();

  const currentBuild = builds[0] || {
    buildNumber: 142,
    status: 'Ready',
    checks: [
      { name: 'Project files', passed: true },
      { name: 'Dependencies', passed: true },
      { name: 'Code validation', passed: true },
      { name: 'Asset validation', passed: true },
      { name: 'Configuration', passed: true },
    ],
  };

  return (
    <div
      id="build-status-card"
      className="rounded-2xl bg-[#0c101a] border border-[#1f2a3e] p-5 sm:p-6 shadow-xl space-y-4 flex flex-col justify-between"
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">
              <Hammer className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono tracking-widest text-indigo-400 uppercase font-bold">
                CONTINUOUS INTEGRATION
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white font-mono">
                BUILD STATUS
              </h3>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            {currentBuild.status}
          </span>
        </div>

        {/* Current Build Info */}
        <div className="p-3.5 rounded-xl bg-[#111726] border border-[#1f293d] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">Current Build</span>
            <span className="text-sm font-bold text-white font-mono">
              Build #{currentBuild.buildNumber}
            </span>
          </div>

          <div className="text-[11px] text-slate-300 font-mono flex items-center justify-between">
            <span>Target: {currentProject.platform} ({currentProject.engine})</span>
            <span className="text-indigo-400">Validated</span>
          </div>
        </div>

        {/* Pipeline Checks List */}
        <div className="space-y-2">
          <div className="text-[11px] font-mono font-semibold text-slate-400 uppercase">
            Validation Checks
          </div>
          <div className="space-y-1.5">
            {(currentBuild.checks || []).map((check, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#0e1422] border border-[#1b2538] text-xs font-mono"
              >
                <span className="text-slate-300">{check.name}</span>
                <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Passed</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-2 border-t border-[#1a2335] space-y-2">
        <div className="flex gap-2">
          <button
            id="start-build-btn"
            onClick={() => triggerBuild()}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-mono font-semibold shadow-[0_0_15px_rgba(99,102,241,0.25)] transition-all cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Start Build</span>
          </button>

          <button
            id="view-logs-btn"
            onClick={() => setActiveBuildModal(currentBuild)}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#141b2a] hover:bg-[#1a2438] text-slate-200 border border-[#233048] text-xs font-mono font-semibold transition-colors cursor-pointer"
            title="View Compiler Logs"
          >
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
            <span>View Logs</span>
          </button>
        </div>

        <button
          onClick={() => setActiveTab('Builds')}
          className="w-full text-center text-[11px] font-mono text-slate-400 hover:text-indigo-300 py-1 transition-colors flex items-center justify-center gap-1"
        >
          <span>View all builds history</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
