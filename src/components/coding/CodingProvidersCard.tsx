import React, { useState } from 'react';
import {
  Cpu,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Radio,
  ExternalLink,
  Shield,
  Layers,
} from 'lucide-react';
import { codingAgentService } from '../../services/codingAgents/codingAgentService';
import { CodingAgentProviderConfig } from '../../types';
import { useApp } from '../../context/AppContext';

export const CodingProvidersCard: React.FC = () => {
  const { addToast } = useApp();
  const [providers, setProviders] = useState<CodingAgentProviderConfig[]>(() =>
    codingAgentService.getProviderConfigs()
  );
  const [activeProviderId, setActiveProviderId] = useState<string>(() =>
    codingAgentService.getActiveProvider().id
  );

  const handleSelectProvider = (id: string) => {
    codingAgentService.setActiveProvider(id);
    setActiveProviderId(id);
    setProviders(codingAgentService.getProviderConfigs());
    const selected = providers.find((p) => p.id === id);
    addToast(
      'Active Provider Updated',
      `Switched to ${selected?.name} for coding execution.`,
      'info'
    );
  };

  return (
    <div className="p-5 rounded-2xl bg-[#0b0f19] border border-[#1b2538] shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-mono font-bold text-white">
              CODING AGENT PROVIDERS
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Provider-agnostic code synthesis & sandbox execution (Section 4 & 35)
            </p>
          </div>
        </div>

        <span className="text-xs font-mono text-indigo-400 font-semibold">
          Active: {providers.find((p) => p.id === activeProviderId)?.name || 'Default'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {providers.map((provider) => {
          const isSelected = activeProviderId === provider.id;

          return (
            <div
              key={provider.id}
              onClick={() => handleSelectProvider(provider.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                isSelected
                  ? 'bg-[#101728] border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.15)]'
                  : 'bg-[#0e1422] border-[#1b2538] hover:border-[#2b3a55]'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-indigo-400 bg-indigo-500' : 'border-slate-600'
                      }`}
                    >
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <span className="text-xs font-mono font-bold text-white">
                      {provider.name}
                    </span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                      provider.status === 'Connected'
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                        : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                    }`}
                  >
                    {provider.status}
                  </span>
                </div>

                <div className="text-[11px] font-mono text-slate-400">
                  <span className="text-slate-400">Model: </span>
                  <span className="text-indigo-300">{provider.model}</span>
                </div>

                <p className="text-xs text-slate-300 font-mono leading-relaxed line-clamp-2">
                  {provider.description}
                </p>
              </div>

              <div className="pt-2 border-t border-[#182338] flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span className="flex items-center gap-1 text-emerald-400">
                  <Shield className="w-3 h-3" />
                  <span>{provider.workspaceAccess}</span>
                </span>
                <span>Used: {provider.lastUsed || 'Never'}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
