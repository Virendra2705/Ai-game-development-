import React from 'react';
import {
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Compass,
  Cpu,
  CalendarCheck,
  Bot,
  GitBranch,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ProjectOnboardingCard: React.FC = () => {
  const { currentProject, completeOnboarding, setActiveTab } = useApp();

  if (!currentProject.isOnboarding) {
    return null;
  }

  const steps = [
    {
      id: 1,
      title: 'Define Game Vision',
      desc: 'Set core mechanics, pillars, target genre, and gameplay fantasy.',
      icon: Compass,
      done: true,
    },
    {
      id: 2,
      title: 'Define Technical Architecture',
      desc: `Configure ${currentProject.engine} engine components and scene node patterns.`,
      icon: Cpu,
      done: true,
    },
    {
      id: 3,
      title: 'Create Development Plan',
      desc: 'Break project phases into initial backlog and planning sprint tasks.',
      icon: CalendarCheck,
      done: false,
    },
    {
      id: 4,
      title: 'Configure AI Providers',
      desc: 'Connect Gemini or local LLM runtimes for autonomous agent assignments.',
      icon: Bot,
      done: false,
    },
    {
      id: 5,
      title: 'Connect Repository',
      desc: 'Link remote GitHub repository for automated CI builds and asset sync.',
      icon: GitBranch,
      done: false,
    },
  ];

  return (
    <div
      id="project-onboarding-banner"
      className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-950/60 via-[#0f1626] to-[#0a101d] border-2 border-indigo-500/40 p-6 shadow-2xl space-y-5 animate-in fade-in slide-in-from-top-4"
    >
      <div className="absolute top-0 right-0 w-96 h-full bg-indigo-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-mono font-bold tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>PROJECT CREATED • INITIALIZATION PHASE</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
            Welcome to {currentProject.name}
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Your project repository and 10 autonomous AI agent profiles have been initialized. Complete the recommended onboarding steps below to launch your sprint planning pipeline.
          </p>
        </div>

        <button
          id="start-project-setup-btn"
          onClick={() => completeOnboarding(currentProject.id)}
          className="shrink-0 flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white font-bold text-xs font-mono shadow-[0_0_25px_rgba(99,102,241,0.35)] transition-all cursor-pointer"
        >
          <span>Start Project Setup</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Recommended Steps Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.id}
              className={`p-3.5 rounded-xl border transition-all ${
                step.done
                  ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-200'
                  : 'bg-[#121827]/80 border-[#222c42] text-slate-300 hover:border-indigo-500/40'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`p-1.5 rounded-lg ${
                    step.done ? 'bg-emerald-500/20 text-emerald-400' : 'bg-indigo-500/15 text-indigo-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono text-slate-400 font-semibold">
                  Step {step.id}
                </span>
              </div>

              <h4 className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                {step.done && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                <span className="truncate">{step.title}</span>
              </h4>

              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                {step.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
