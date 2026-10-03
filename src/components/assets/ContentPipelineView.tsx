import React from 'react';
import {
  Lightbulb,
  FileSpreadsheet,
  FileCheck,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  FolderInput,
  FileCode,
  Hammer,
  Bug,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Asset } from '../../types';

interface ContentPipelineViewProps {
  assets: Asset[];
  onOpenGenerateModal: () => void;
  onSelectAsset: (asset: Asset) => void;
}

export const ContentPipelineView: React.FC<ContentPipelineViewProps> = ({
  assets,
  onOpenGenerateModal,
  onSelectAsset,
}) => {
  // Section 36: 10 Pipeline Stages
  const pipelineStages = [
    {
      step: 1,
      id: 'idea',
      name: 'Idea',
      desc: 'User prompt or game concept in Command Center',
      icon: Lightbulb,
      color: 'text-amber-400',
      activeCount: 1,
    },
    {
      step: 2,
      id: 'spec',
      name: 'Specification',
      desc: 'Project Memory art direction & creature specs',
      icon: FileSpreadsheet,
      color: 'text-sky-400',
      activeCount: 2,
    },
    {
      step: 3,
      id: 'plan',
      name: 'Asset Plan',
      desc: 'Gemini reasoning stages, requirements & outputs',
      icon: FileCheck,
      color: 'text-indigo-400',
      activeCount: 2,
    },
    {
      step: 4,
      id: 'generation',
      name: 'Generation',
      desc: 'Imagen / Meshy / AudioCraft neural synthesis',
      icon: Cpu,
      color: 'text-purple-400',
      activeCount: 3,
    },
    {
      step: 5,
      id: 'validation',
      name: 'Validation',
      desc: 'Automated 3D validator & optimization checks',
      icon: ShieldCheck,
      color: 'text-blue-400',
      activeCount: assets.filter((a) => a.status === 'VALIDATING').length || 1,
    },
    {
      step: 6,
      id: 'approval',
      name: 'Approval',
      desc: 'Human gate (Approve, Reject with feedback, Version)',
      icon: CheckCircle2,
      color: 'text-emerald-400',
      activeCount: assets.filter((a) => a.status === 'REVIEW_REQUIRED' || a.status === 'Review').length || 7,
    },
    {
      step: 7,
      id: 'import',
      name: 'Import',
      desc: 'Safety-gated ingest into workspace folders',
      icon: FolderInput,
      color: 'text-cyan-400',
      activeCount: assets.filter((a) => a.status === 'IMPORTED' || a.status === 'Integrated').length || 219,
    },
    {
      step: 8,
      id: 'integration',
      name: 'Integration',
      desc: 'Coding Agent registers asset into scene code',
      icon: FileCode,
      color: 'text-rose-400',
      activeCount: 5,
    },
    {
      step: 9,
      id: 'build',
      name: 'Build',
      desc: 'Asset Build check verifies paths & texture pools',
      icon: Hammer,
      color: 'text-amber-500',
      activeCount: 1,
    },
    {
      step: 10,
      id: 'qa',
      name: 'QA & Playtest',
      desc: 'Automated playtest asserts 3D LOD & animations',
      icon: Bug,
      color: 'text-emerald-500',
      activeCount: 1,
    },
  ];

  return (
    <div className="space-y-6 font-mono text-xs">
      <div className="p-4 rounded-2xl bg-[#0c101a] border border-[#1f2a3e] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-bold uppercase text-[10px] tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Complete End-to-End Workflow • Section 36</span>
          </div>
          <h3 className="text-base font-bold text-white tracking-tight mt-0.5">
            10-Stage AI Content Pipeline
          </h3>
          <p className="text-[10px] text-slate-400">
            From initial conversational idea to running in the game build with full human safety controls
          </p>
        </div>

        <button
          onClick={onOpenGenerateModal}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-md shadow-indigo-600/20 cursor-pointer shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Launch New Asset</span>
        </button>
      </div>

      {/* 10-Stage Visual Track */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
        {pipelineStages.map((stage) => {
          const Icon = stage.icon;
          return (
            <div
              key={stage.step}
              className="p-3.5 rounded-2xl bg-[#0c101a] border border-[#1c2638] hover:border-indigo-500/40 transition-all flex flex-col justify-between space-y-2 relative group"
            >
              <div className="flex items-center justify-between">
                <span className="w-6 h-6 rounded-lg bg-[#080c14] border border-[#1f2a3e] text-slate-400 font-bold flex items-center justify-center text-[10px]">
                  {stage.step}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-[#121826] text-slate-300 font-bold text-[10px]">
                  {stage.activeCount} items
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${stage.color}`} />
                  <span className="font-bold text-white text-sm group-hover:text-indigo-300 transition-colors">
                    {stage.name}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 leading-snug">{stage.desc}</p>
              </div>

              <div className="pt-2 border-t border-[#1a2334] text-[10px] text-indigo-400 flex items-center justify-between">
                <span>Stage {stage.step} of 10</span>
                <ArrowRight className="w-3 h-3 opacity-60 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Pipeline Explanation Card */}
      <div className="p-4 rounded-2xl bg-[#080c14] border border-[#1a2334] space-y-2">
        <div className="font-bold text-white">Pipeline Security & Quality Guarantees</div>
        <p className="text-slate-400 leading-relaxed text-xs">
          Asset providers are strictly isolated from direct repository writing. Every asset must pass automated 3D geometry and audio checks in <strong>Stage 5</strong>, obtain explicit human review in <strong>Stage 6</strong>, and complete sandbox safety validation in <strong>Stage 7</strong> before the Coding Agent receives integration hooks in <strong>Stage 8</strong>.
        </p>
      </div>
    </div>
  );
};
