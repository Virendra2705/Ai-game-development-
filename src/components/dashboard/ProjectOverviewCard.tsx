import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  FolderGit2,
  Cpu,
  Monitor,
  Calendar,
  Layers,
  Sparkles,
  ArrowUpRight,
  Play,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

export const ProjectOverviewCard: React.FC = () => {
  const { currentProject, setActiveTab, setLivePreviewExpanded, addToast } = useApp();

  return (
    <div
      id="project-overview-card"
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#101624] via-[#0d121c] to-[#090d14] border border-[#202b40] p-6 shadow-xl"
    >
      {/* Subtle background glow effect */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Left side: Project Info & Meta */}
        <div className="flex-1 space-y-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-2.5 py-1 rounded-md bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-mono font-semibold">
              {currentProject.engine} Engine
            </span>
            <span className="px-2.5 py-1 rounded-md bg-[#182133] border border-[#25324d] text-slate-300 text-xs font-mono">
              {currentProject.platform}
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {currentProject.status}
            </span>
          </div>

          <div>
            <div className="text-[11px] font-mono tracking-widest text-indigo-400 uppercase font-bold">
              PROJECT OVERVIEW
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight mt-0.5">
              {currentProject.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
              {currentProject.description}
            </p>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-[#141a27]/80 border border-[#212b3e]">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Type / Genre</span>
              <p className="text-xs font-bold text-slate-100 mt-0.5 truncate">{currentProject.genre}</p>
            </div>

            <div className="p-3 rounded-xl bg-[#141a27]/80 border border-[#212b3e]">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Current Phase</span>
              <p className="text-xs font-bold text-indigo-300 mt-0.5 truncate">{currentProject.currentPhase}</p>
            </div>

            <div className="p-3 rounded-xl bg-[#141a27]/80 border border-[#212b3e]">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Resolution</span>
              <p className="text-xs font-bold text-slate-100 mt-0.5 truncate">{currentProject.resolution}</p>
            </div>

            <div className="p-3 rounded-xl bg-[#141a27]/80 border border-[#212b3e]">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Last Updated</span>
              <p className="text-xs font-bold text-slate-100 mt-0.5 truncate">{currentProject.lastUpdated}</p>
            </div>
          </div>

          {/* Development Progress Bar */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300 font-medium">Development Progress</span>
              <span className="text-indigo-400 font-bold">{currentProject.progress}%</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-[#161f30] overflow-hidden border border-[#223048]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-sky-400 to-purple-500 transition-all duration-500 relative"
                style={{ width: `${currentProject.progress}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-[pulse_2s_infinite]" />
              </div>
            </div>
          </div>
        </div>

        {/* Right side: Action buttons and quick snapshot */}
        <div className="flex flex-row lg:flex-col gap-3 justify-end shrink-0 pt-2 lg:pt-0">
          <button
            id="continue-dev-btn"
            onClick={() => {
              setActiveTab('Tasks');
              addToast('Opening Task Board', 'Navigating to active sprint tasks.', 'info');
            }}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-xs font-mono shadow-[0_0_20px_rgba(99,102,241,0.25)] transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Continue Development</span>
          </button>

          <button
            id="open-project-btn"
            onClick={() => setActiveTab('Projects')}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#161e2e] hover:bg-[#1d273c] text-slate-200 border border-[#26344d] font-semibold text-xs font-mono transition-colors cursor-pointer"
          >
            <FolderGit2 className="w-4 h-4 text-indigo-400" />
            <span>Open Project</span>
          </button>
        </div>
      </div>
    </div>
  );
};
