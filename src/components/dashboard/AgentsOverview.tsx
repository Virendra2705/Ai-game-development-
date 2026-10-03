import React from 'react';
import {
  Brain,
  Code,
  Gamepad2,
  Palette,
  Box,
  Map,
  Swords,
  ShieldCheck,
  Wrench,
  Zap,
  ArrowRight,
  Sparkles,
  Bot,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Agent } from '../../types';

const getAgentIcon = (name: string) => {
  switch (name) {
    case 'Brain':
      return Brain;
    case 'Code':
      return Code;
    case 'Gamepad2':
      return Gamepad2;
    case 'Palette':
      return Palette;
    case 'Box':
      return Box;
    case 'Map':
      return Map;
    case 'Swords':
      return Swords;
    case 'ShieldCheck':
      return ShieldCheck;
    case 'Wrench':
      return Wrench;
    case 'Zap':
      return Zap;
    default:
      return Bot;
  }
};

export const AgentsOverview: React.FC = () => {
  const { agents, setSelectedAgent, setActiveTab } = useApp();

  return (
    <div id="ai-agents-section" className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-mono tracking-widest text-indigo-400 uppercase font-bold">
              AUTONOMOUS CREW
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white font-mono">
              AI DEVELOPMENT TEAM
            </h3>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('AI Agents')}
          className="flex items-center gap-1.5 text-xs font-mono text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
        >
          <span>View Team Details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Agents Grid (10 cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
        {agents.map((agent) => {
          const Icon = getAgentIcon(agent.iconName);
          return (
            <div
              key={agent.id}
              id={`agent-card-${agent.id}`}
              onClick={() => setSelectedAgent(agent)}
              className="group relative flex flex-col justify-between p-4 rounded-xl bg-[#0d121c] hover:bg-[#121927] border border-[#1f2a3e] hover:border-indigo-500/40 shadow-lg hover:shadow-indigo-500/5 transition-all duration-200 cursor-pointer"
            >
              <div className="space-y-3">
                {/* Icon & Status */}
                <div className="flex items-center justify-between">
                  <div
                    className="p-2.5 rounded-xl border flex items-center justify-center transition-transform group-hover:scale-105"
                    style={{
                      backgroundColor: `${agent.colorScheme.accent}15`,
                      borderColor: `${agent.colorScheme.accent}35`,
                    }}
                  >
                    <Icon
                      className="w-4 h-4"
                      style={{ color: agent.colorScheme.accent }}
                    />
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold flex items-center gap-1.5 ${
                      agent.status === 'Ready'
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : agent.status === 'Working'
                        ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                        : 'bg-slate-700/25 text-slate-400 border border-slate-700/40'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        agent.status === 'Ready'
                          ? 'bg-emerald-400'
                          : agent.status === 'Working'
                          ? 'bg-sky-400 animate-pulse'
                          : 'bg-slate-500'
                      }`}
                    />
                    {agent.status}
                  </span>
                </div>

                {/* Name & Role */}
                <div>
                  <h4 className="text-sm font-bold text-white font-mono group-hover:text-indigo-300 transition-colors">
                    {agent.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {agent.description}
                  </p>
                </div>
              </div>

              {/* Bottom Meta & Open Button */}
              <div className="pt-3 mt-3 border-t border-[#1a2335] flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-400">Active {agent.lastActive}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedAgent(agent);
                  }}
                  className="text-indigo-400 group-hover:text-indigo-300 font-semibold flex items-center gap-1"
                >
                  <span>Open</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
