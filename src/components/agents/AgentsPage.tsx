import React, { useState } from 'react';
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
  Bot,
  Sparkles,
  Settings,
  Activity,
  CheckCircle2,
  TrendingUp,
  Cpu,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Agent, AgentStatus } from '../../types';

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

export const AgentsPage: React.FC = () => {
  const { agents, setSelectedAgent, currentProject } = useApp();
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredAgents = agents.filter((a) => {
    if (statusFilter !== 'all' && a.status !== statusFilter) return false;
    return true;
  });

  const readyCount = agents.filter((a) => a.status === 'Ready').length;
  const workingCount = agents.filter((a) => a.status === 'Working').length;
  const idleCount = agents.filter((a) => a.status === 'Idle').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono font-semibold uppercase tracking-wider">
            <Bot className="w-3.5 h-3.5" />
            <span>AGENT ORCHESTRATION FLEET</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight mt-1">
            AI Development Team ({agents.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Configured autonomous roles for {currentProject.name}. Click any agent to inspect duties, model target, and tasks.
          </p>
        </div>

        {/* Quick Fleet Metrics */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <div className="px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>{readyCount} Ready</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-sky-950/40 border border-sky-500/30 text-sky-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            <span>{workingCount} Working</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-[#141a27] border border-[#232d40] text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-500" />
            <span>{idleCount} Idle</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between p-2 rounded-xl bg-[#0d121c] border border-[#1e283c]">
        <div className="flex items-center gap-1 overflow-x-auto text-xs font-mono">
          {['all', 'Ready', 'Working', 'Idle'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg transition-colors capitalize ${
                statusFilter === status
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#141b29]'
              }`}
            >
              {status === 'all' ? 'All Agents' : status}
            </button>
          ))}
        </div>

        <span className="text-[11px] font-mono text-slate-400 pr-2">
          Architecture: Phase 1 UI Mock
        </span>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredAgents.map((agent) => {
          const Icon = getAgentIcon(agent.iconName);
          return (
            <div
              key={agent.id}
              className="rounded-2xl bg-[#0c101a] border border-[#1f2a3e] hover:border-indigo-500/40 transition-all duration-200 p-5 shadow-xl flex flex-col justify-between group"
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="p-3 rounded-xl border flex items-center justify-center transition-transform group-hover:scale-105"
                      style={{
                        backgroundColor: `${agent.colorScheme.accent}15`,
                        borderColor: `${agent.colorScheme.accent}35`,
                      }}
                    >
                      <Icon
                        className="w-5 h-5"
                        style={{ color: agent.colorScheme.accent }}
                      />
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-white font-mono group-hover:text-indigo-300 transition-colors">
                        {agent.name}
                      </h3>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">{agent.role}</p>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold flex items-center gap-1.5 ${
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

                {/* Description */}
                <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                  {agent.description}
                </p>

                {/* Current Task if any */}
                <div className="p-3 rounded-xl bg-[#111726] border border-[#1f293d] space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Current Task</span>
                  <p className="text-xs text-slate-200 font-mono truncate">
                    {agent.currentTask || 'Idle (Waiting for task assignment)'}
                  </p>
                </div>

                {/* Metrics Stats */}
                <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono">
                  <div className="p-2 rounded-lg bg-[#0e1422] border border-[#1a2335]">
                    <span className="text-[9px] text-slate-400 uppercase">Completed</span>
                    <div className="text-sm font-bold text-white">{agent.completedTasksCount}</div>
                  </div>

                  <div className="p-2 rounded-lg bg-[#0e1422] border border-[#1a2335]">
                    <span className="text-[9px] text-slate-400 uppercase">Success Rate</span>
                    <div className="text-sm font-bold text-emerald-400">{agent.successRate}%</div>
                  </div>

                  <div className="p-2 rounded-lg bg-[#0e1422] border border-[#1a2335]">
                    <span className="text-[9px] text-slate-400 uppercase">Last Active</span>
                    <div className="text-xs font-bold text-slate-200 truncate mt-0.5">
                      {agent.lastActive}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer: Future AI Provider & Configure Button */}
              <div className="pt-4 mt-4 border-t border-[#1a2335] flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  <span>AI: {agent.futureAIProvider}</span>
                </div>

                <button
                  onClick={() => setSelectedAgent(agent)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#151c2a] hover:bg-indigo-600/20 text-indigo-300 border border-[#243048] hover:border-indigo-500/30 text-xs font-mono font-semibold transition-all cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Configure</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
