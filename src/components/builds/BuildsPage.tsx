import React, { useState } from 'react';
import {
  Hammer,
  Play,
  ShieldAlert,
  Bug,
  Layers,
  Sparkles,
  Sliders,
  Workflow,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DevLoopDashboardHeader } from '../devloop/DevLoopDashboardHeader';
import { BuildCenterPanel } from './BuildCenterPanel';
import { GamePreviewCenter } from '../preview/GamePreviewCenter';
import { QATestingCenter } from '../qa/QATestingCenter';
import { AIDebugCenter } from '../debug/AIDebugCenter';
import { ArtifactsCenter } from '../artifacts/ArtifactsCenter';
import { QAIssue } from '../../types';

type BuildSubTab = 'pipeline' | 'build' | 'preview' | 'qa' | 'debug' | 'artifacts' | 'settings';

export const BuildsPage: React.FC = () => {
  const { currentProject } = useApp();
  const [activeTab, setActiveTab] = useState<BuildSubTab>('pipeline');
  const [targetDebugIssue, setTargetDebugIssue] = useState<QAIssue | null>(null);

  const handleOpenDebugForIssue = (issue: QAIssue) => {
    setTargetDebugIssue(issue);
    setActiveTab('debug');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Section 36: DEVELOPMENT LOOP Header */}
      <DevLoopDashboardHeader
        activeSubTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
      />

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#1c2638]">
        <button
          onClick={() => setActiveTab('pipeline')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
            activeTab === 'pipeline'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
              : 'bg-[#111726] text-slate-400 hover:text-white hover:bg-[#1a2338]'
          }`}
        >
          <Workflow className="w-3.5 h-3.5" />
          <span>Pipeline Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('build')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
            activeTab === 'build'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
              : 'bg-[#111726] text-slate-400 hover:text-white hover:bg-[#1a2338]'
          }`}
        >
          <Hammer className="w-3.5 h-3.5" />
          <span>Build Center</span>
        </button>

        <button
          onClick={() => setActiveTab('preview')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
            activeTab === 'preview'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
              : 'bg-[#111726] text-slate-400 hover:text-white hover:bg-[#1a2338]'
          }`}
        >
          <Play className="w-3.5 h-3.5" />
          <span>Game Preview</span>
        </button>

        <button
          onClick={() => setActiveTab('qa')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
            activeTab === 'qa'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
              : 'bg-[#111726] text-slate-400 hover:text-white hover:bg-[#1a2338]'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          <span>QA Testing</span>
        </button>

        <button
          onClick={() => setActiveTab('debug')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
            activeTab === 'debug'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
              : 'bg-[#111726] text-slate-400 hover:text-white hover:bg-[#1a2338]'
          }`}
        >
          <Bug className="w-3.5 h-3.5 text-rose-400" />
          <span>AI Debug Loop</span>
        </button>

        <button
          onClick={() => setActiveTab('artifacts')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
            activeTab === 'artifacts'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
              : 'bg-[#111726] text-slate-400 hover:text-white hover:bg-[#1a2338]'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-indigo-300" />
          <span>Artifacts Registry</span>
        </button>
      </div>

      {/* View Content */}
      {activeTab === 'pipeline' && (
        <div className="space-y-8">
          <BuildCenterPanel onOpenPreview={() => setActiveTab('preview')} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GamePreviewCenter onRunQA={() => setActiveTab('qa')} />
            <QATestingCenter onOpenDebug={handleOpenDebugForIssue} />
          </div>
        </div>
      )}

      {activeTab === 'build' && (
        <BuildCenterPanel onOpenPreview={() => setActiveTab('preview')} />
      )}

      {activeTab === 'preview' && (
        <GamePreviewCenter onRunQA={() => setActiveTab('qa')} />
      )}

      {activeTab === 'qa' && (
        <QATestingCenter onOpenDebug={handleOpenDebugForIssue} />
      )}

      {activeTab === 'debug' && (
        <AIDebugCenter
          initialIssue={targetDebugIssue}
          onRetestSuccess={() => setActiveTab('qa')}
        />
      )}

      {activeTab === 'artifacts' && (
        <ArtifactsCenter />
      )}

      {activeTab === 'settings' && (
        <div className="p-6 rounded-2xl bg-[#0c101a] border border-[#1f2a3e] space-y-4 font-mono text-xs text-slate-300">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-400" />
            <span>Build Profiles & Engine Configuration</span>
          </h3>
          <p className="text-slate-400">
            Export profiles for Godot 4.3 WebAssembly and Android SDK toolchains.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-[#111726] border border-[#1d273a] space-y-2">
              <div className="text-white font-bold">Development Web (HTML5/WASM)</div>
              <div className="text-[11px] text-slate-400">Target: WebGL 2.0 • Threads: Enabled • GDScript Debug Symbols: Yes</div>
              <div className="text-[11px] text-emerald-400">Default for interactive preview</div>
            </div>
            <div className="p-4 rounded-xl bg-[#111726] border border-[#1d273a] space-y-2">
              <div className="text-white font-bold">Development Android (APK)</div>
              <div className="text-[11px] text-slate-400">Target: ARM64-v8a • Min SDK: 26 • Keystore: Debug Signature</div>
              <div className="text-[11px] text-indigo-300">Packaged for device sideloading</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
