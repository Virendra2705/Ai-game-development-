import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Sparkles,
  Github,
  Download,
  Key,
  Shield,
  Layers,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Cpu,
  Info,
  RefreshCw,
  Terminal,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AIProvider } from '../../types';
import { RepositoryDashboardPanel } from '../coding/RepositoryDashboardPanel';
import { CodingProvidersCard } from '../coding/CodingProvidersCard';

export const SettingsPage: React.FC = () => {
  const { currentProject, addToast, geminiStatus, testGeminiConnection, setActiveTab } = useApp();
  const [isTestingGemini, setIsTestingGemini] = useState(false);
  const [testLatency, setTestLatency] = useState<number | null>(null);

  const [aiProviders] = useState<AIProvider[]>([
    {
      id: 'gemini',
      name: 'Google Gemini API',
      modelName: 'gemini-3.8-flash (Server-Side)',
      status: 'Connected',
      description: 'Powers Game Architect reasoning, dialogue generation, and autonomous task decomposition.',
    },
    {
      id: 'codex',
      name: 'Codex / OpenAI Code Intelligence',
      modelName: 'gpt-4o-code / specialized coding agents',
      status: 'Not Connected',
      description: 'Powers GDScript & C# generation, syntax verification, and shader writing.',
    },
    {
      id: 'local',
      name: 'Local Model (Ollama / vLLM / LM Studio)',
      modelName: 'Llama-3-70B / Qwen-2.5-Coder',
      status: 'Not Connected',
      description: 'Offline local inference running on localhost:11434 with zero cloud latency.',
    },
  ]);

  const handleTestGemini = async () => {
    setIsTestingGemini(true);
    setTestLatency(null);
    try {
      const res = await testGeminiConnection();
      setTestLatency(res.latencyMs || null);
      if (res.success) {
        addToast('Gemini Connected', `${res.message} (${res.latencyMs}ms)`, 'success');
      } else {
        addToast('Connection Note', res.message, 'warning');
      }
    } catch (e: any) {
      addToast('Error', e.message, 'error');
    } finally {
      setIsTestingGemini(false);
    }
  };

  const handleExport = (type: string) => {
    addToast(
      'Export Initiated',
      `Packaging ${currentProject.name} repository as ${type}. Archive will trigger in local download stream.`,
      'info'
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono font-semibold uppercase tracking-wider">
          <SettingsIcon className="w-3.5 h-3.5" />
          <span>SYSTEM CONFIGURATION</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight mt-1">
          Hub Settings & Integrations
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1">
          Manage AI endpoints, version control connections, and game engine export targets.
        </p>
      </div>

      {/* Notice Banner */}
      <div className="p-4 rounded-2xl bg-indigo-950/25 border border-indigo-500/30 flex items-start gap-3">
        <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <h4 className="font-bold font-mono text-indigo-300">Phase 4 Real Coding Agent & Git Workspace Active</h4>
          <p className="text-slate-300 leading-relaxed">
            The Coding Agent operates with strict sandboxed workspace boundaries and branch isolation (<code className="font-mono text-indigo-300">task/branch</code>). Secrets and credentials are automatically excluded. Code commits require automated test passes and explicit operator approval. Direct pushes to <code className="font-mono text-rose-300">main</code> are forbidden.
          </p>
        </div>
      </div>

      {/* Coding Agent Provider Abstraction Card */}
      <CodingProvidersCard />

      {/* Connected Git Repository Dashboard */}
      <RepositoryDashboardPanel />

      {/* 1. AI Providers Section */}
      <div className="rounded-2xl bg-[#0c101a] border border-[#1f2a3e] p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-mono">AI Model Providers</h3>
              <p className="text-xs text-slate-400">
                Orchestrate intelligence backends for the 10 autonomous agents.
              </p>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-full text-[11px] font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            Phase 3 Active
          </span>
        </div>

        <div className="space-y-3">
          {/* Gemini Provider Card */}
          <div className="p-4 rounded-xl bg-[#0f1422] border border-indigo-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-white font-mono">Google Gemini API</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                    geminiStatus.connected
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {geminiStatus.connected ? 'Active (Live)' : 'Configured (Mock Fallback)'}
                </span>
                {testLatency && (
                  <span className="text-[10px] font-mono text-emerald-400">
                    {testLatency}ms
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300">
                Powers Game Architect planning, system dependency mapping, and structured task creation.
              </p>
              <div className="text-[11px] font-mono text-indigo-400 flex items-center gap-3">
                <span>Model: {geminiStatus.model}</span>
                <span>• Server-Side Security Enforced</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTestGemini}
                disabled={isTestingGemini}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#151c2a] hover:bg-[#1f293d] text-slate-200 border border-[#243048] text-xs font-mono font-medium transition-colors shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${isTestingGemini ? 'animate-spin' : ''}`} />
                <span>{isTestingGemini ? 'Testing...' : 'Test Connection'}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('AI Command Center')}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-semibold transition-colors shrink-0"
              >
                Open Command Center
              </button>
            </div>
          </div>

          {/* Other Providers */}
          {aiProviders.filter(p => p.id !== 'gemini').map((provider) => (
            <div
              key={provider.id}
              className="p-4 rounded-xl bg-[#0f1422] border border-[#1d273a] flex flex-col sm:flex-row sm:items-center justify-between gap-4 opacity-75"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-white font-mono">{provider.name}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-500/15 text-slate-300 border border-slate-500/30">
                    {provider.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{provider.description}</p>
                <div className="text-[11px] font-mono text-slate-400">Target: {provider.modelName}</div>
              </div>

              <span className="text-[11px] font-mono text-slate-400 px-3 py-1.5 rounded-lg bg-[#141b2a] border border-[#232e42] self-start sm:self-center">
                Planned for Phase 4
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Export Options Section */}
      <div className="rounded-2xl bg-[#0c101a] border border-[#1f2a3e] p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-mono">Export Options</h3>
            <p className="text-xs text-slate-400">
              Download complete project files or pre-configured engine workspaces.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
          {[
            {
              title: 'Export as Godot Project',
              desc: 'Standard project.godot structure with scenes & GDScript files.',
              badge: 'Godot 4.3',
            },
            {
              title: 'Export as Unity Project',
              desc: 'Assets and C# scripts packaged for Unity 6 LTS.',
              badge: 'Unity 6',
            },
            {
              title: 'Export as Web Project',
              desc: 'HTML5 canvas & Three.js/Phaser game bundle.',
              badge: 'Web/HTML5',
            },
            {
              title: 'Export as ZIP',
              desc: 'Raw source archive containing all generated assets and specs.',
              badge: 'Raw ZIP',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-[#0f1422] border border-[#1d273a] hover:border-indigo-500/40 transition-all flex flex-col justify-between space-y-3"
            >
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#182133] border border-[#232f46] text-indigo-300 font-semibold">
                  {item.badge}
                </span>
                <h4 className="text-xs font-bold text-white font-mono">{item.title}</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">{item.desc}</p>
              </div>

              <button
                onClick={() => handleExport(item.title)}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[#151c2a] hover:bg-indigo-600/20 text-indigo-300 border border-[#243048] hover:border-indigo-500/30 text-xs font-mono font-medium transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Archive</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
