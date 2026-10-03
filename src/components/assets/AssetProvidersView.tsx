import React from 'react';
import {
  Cpu,
  CheckCircle,
  AlertTriangle,
  Clock,
  Coins,
  Sparkles,
  Zap,
  Shield,
  ExternalLink,
} from 'lucide-react';
import { assetProviderRegistry } from '../../services/assets/assetProviders';

export const AssetProvidersView: React.FC = () => {
  const providers = assetProviderRegistry.getAllProviders();

  return (
    <div className="space-y-6 font-mono text-xs">
      <div className="p-4 rounded-2xl bg-[#0c101a] border border-[#1f2a3e] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-bold uppercase text-[10px] tracking-wider">
            <Zap className="w-3.5 h-3.5" />
            <span>Multi-Modal Provider Architecture • Section 11</span>
          </div>
          <h3 className="text-base font-bold text-white tracking-tight mt-0.5">
            Asset Provider Registry
          </h3>
          <p className="text-[10px] text-slate-400">
            Intelligent routing across 2D image diffusion, 3D manifold geometry, procedural audio, neural voice, and cinematic video
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#080c14] border border-[#1a2334] text-slate-300 text-[10px]">
          <Coins className="w-3.5 h-3.5 text-amber-400" />
          <span>Project Credits: <strong className="text-white">450 Credits</strong></span>
        </div>
      </div>

      {/* Provider Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {providers.map((p) => {
          const isConfigured = p.status !== 'NOT_CONFIGURED';

          return (
            <div
              key={p.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                isConfigured
                  ? 'bg-[#0c101a] border-[#1c2638] hover:border-indigo-500/40'
                  : 'bg-[#0c101a]/60 border-[#1c2638] border-dashed opacity-80'
              }`}
            >
              <div className="space-y-3">
                {/* Top header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="px-2 py-0.5 rounded bg-[#162032] text-indigo-300 font-bold text-[10px]">
                      {p.category} PROVIDER
                    </span>
                    <h4 className="font-bold text-white text-sm mt-1">{p.name}</h4>
                    <div className="text-[10px] text-slate-400 mt-0.5">Model: {p.model}</div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                      isConfigured
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {p.status}
                  </span>
                </div>

                {/* Capabilities */}
                <div className="space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Capabilities</div>
                  <div className="flex flex-wrap gap-1">
                    {p.capabilities.map((cap, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-[#080c14] border border-[#1a2334] text-slate-300 text-[10px]"
                      >
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Latency and Cost (Section 41) */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#1a2334] text-[10px]">
                  <div>
                    <span className="text-slate-400">Avg Latency:</span>
                    <div className="font-bold text-slate-200 mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{p.latencyAvgSeconds > 0 ? `${p.latencyAvgSeconds}s` : 'N/A'}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400">Estimated Cost:</span>
                    <div className="font-bold text-slate-200 mt-0.5 truncate">
                      {p.estimatedCostPerUnit || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-2 border-t border-[#1a2334] flex items-center justify-between text-[10px] text-slate-400">
                <span>Last Used: {p.lastUsed || 'Never'}</span>
                {p.isDefault && (
                  <span className="text-indigo-400 font-bold">Default Provider</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Section 54: Unconfigured Provider Guidance */}
      <div className="p-4 rounded-2xl bg-[#080c14] border border-[#1a2334] flex items-start gap-3">
        <Shield className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-white">Provider Sandboxing & Credential Security (Section 52 & 54)</div>
          <p className="text-slate-400 leading-relaxed">
            All AI asset providers run in sandboxed contexts and cannot modify project code or workspace files directly. When an asset provider is unconfigured, the system saves the complete production specification to Project Memory without inventing fake credentials or halting the session.
          </p>
        </div>
      </div>
    </div>
  );
};
