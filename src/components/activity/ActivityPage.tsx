import React, { useState } from 'react';
import {
  Activity as ActivityIcon,
  Bot,
  Hammer,
  ShieldCheck,
  User,
  Boxes,
  Terminal,
  Filter,
  Search,
  Clock,
  Sparkles,
  Download,
  GitCommit,
  GitBranch,
  GitPullRequest,
  FileCode,
  Code2,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Activity } from '../../types';

export const ActivityPage: React.FC = () => {
  const { activities, currentProject, addToast } = useApp();
  const [filterType, setFilterType] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  const projectActivities = activities.filter(
    (a) => a.projectId === currentProject.id || !a.projectId
  );

  const filteredActivities = projectActivities.filter((a) => {
    if (filterType !== 'all') {
      if (filterType === 'coding') {
        const isCoding =
          a.type.includes('CODING') ||
          a.type.includes('IMPLEMENTATION') ||
          a.type.includes('FILES') ||
          a.type.includes('TESTS') ||
          a.type.includes('REVIEW');
        if (!isCoding) return false;
      } else if (filterType === 'git') {
        const isGit =
          a.type.includes('COMMIT') ||
          a.type.includes('PULL_REQUEST') ||
          a.type.includes('WORKSPACE');
        if (!isGit) return false;
      } else if (a.type !== filterType) {
        return false;
      }
    }
    if (search.trim()) {
      const matchTitle = (a.title || a.message || '').toLowerCase().includes(search.toLowerCase());
      const matchDesc = (a.description || a.message || '').toLowerCase().includes(search.toLowerCase());
      if (!matchTitle && !matchDesc) return false;
    }
    return true;
  });

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'COMMIT_CREATED':
        return <GitCommit className="w-4 h-4 text-emerald-400" />;
      case 'PULL_REQUEST_CREATED':
        return <GitPullRequest className="w-4 h-4 text-purple-400" />;
      case 'WORKSPACE_CREATED':
        return <GitBranch className="w-4 h-4 text-amber-400" />;
      case 'CODING_TASK_STARTED':
      case 'IMPLEMENTATION_STARTED':
        return <Code2 className="w-4 h-4 text-sky-400" />;
      case 'FILES_MODIFIED':
        return <FileCode className="w-4 h-4 text-indigo-400" />;
      case 'TESTS_PASSED':
      case 'CHANGES_APPROVED':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'TESTS_FAILED':
      case 'test':
      case 'TESTS_STARTED':
        return <ShieldCheck className="w-4 h-4 text-purple-400" />;
      case 'agent':
      case 'REPOSITORY_ANALYZED':
      case 'REVIEW_REQUESTED':
        return <Bot className="w-4 h-4 text-indigo-400" />;
      case 'build':
        return <Hammer className="w-4 h-4 text-sky-400" />;
      case 'asset':
        return <Boxes className="w-4 h-4 text-amber-400" />;
      case 'command':
        return <Terminal className="w-4 h-4 text-emerald-400" />;
      case 'user':
      default:
        return <User className="w-4 h-4 text-pink-400" />;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono font-semibold uppercase tracking-wider">
            <ActivityIcon className="w-3.5 h-3.5" />
            <span>AUDIT LOGS & EVENT STREAM</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight mt-1">
            Activity Timeline ({projectActivities.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Real-time audit log of agent actions, builds, asset generations, and developer commands.
          </p>
        </div>

        <button
          onClick={() => {
            addToast('Audit Log Export', 'Exported JSON timeline to download stream.', 'info');
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#141a27] hover:bg-[#1a2335] text-slate-200 border border-[#222d42] text-xs font-mono font-semibold transition-colors shrink-0"
        >
          <Download className="w-4 h-4 text-indigo-400" />
          <span>Export Audit Log</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-[#0d121c] border border-[#1e283c]">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search activity stream..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#121827] border border-[#1f293d] text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-400">Filter Event:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-[#121827] border border-[#1f293d] text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Events</option>
            <option value="coding">Coding Agent Tasks & Tests</option>
            <option value="git">Git Commits & PRs</option>
            <option value="agent">Agent Actions</option>
            <option value="build">Builds</option>
            <option value="test">QA & Tests</option>
            <option value="asset">Assets</option>
            <option value="command">Commands</option>
          </select>
        </div>
      </div>

      {/* Timeline List */}
      <div className="rounded-2xl bg-[#0c101a] border border-[#1f2a3e] p-6 shadow-xl space-y-4">
        <div className="space-y-4 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-[1px] before:bg-[#1f2a3d]">
          {filteredActivities.map((item) => (
            <div key={item.id} className="relative pl-9 group">
              <div className="absolute left-2 top-1.5 -translate-x-1/2 w-5 h-5 rounded-full bg-[#0c101a] border border-[#2a3852] flex items-center justify-center group-hover:border-indigo-400 transition-colors">
                <div className="w-2 h-2 rounded-full bg-indigo-400" />
              </div>

              <div className="p-4 rounded-xl bg-[#0f1524] hover:bg-[#131b2e] border border-[#1d273a] hover:border-indigo-500/30 transition-all space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {getActivityIcon(item.type)}
                    <span className="text-sm font-bold text-white font-mono">{item.title}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#182133] text-slate-300 border border-[#243048]">
                      {item.type}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-slate-400">{item.timeAgo}</span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
