import React from 'react';
import {
  Activity as ActivityIcon,
  Bot,
  Hammer,
  ShieldCheck,
  User,
  Boxes,
  Terminal,
  Clock,
  ArrowRight,
  GitCommit,
  GitBranch,
  GitPullRequest,
  FileCode,
  Code2,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Activity } from '../../types';

export const ActivityFeedWidget: React.FC = () => {
  const { activities, currentProject, setActiveTab } = useApp();

  const projectActivities = activities.filter(
    (a) => a.projectId === currentProject.id || !a.projectId
  );

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'COMMIT_CREATED':
        return <GitCommit className="w-3.5 h-3.5 text-emerald-400" />;
      case 'PULL_REQUEST_CREATED':
        return <GitPullRequest className="w-3.5 h-3.5 text-purple-400" />;
      case 'WORKSPACE_CREATED':
        return <GitBranch className="w-3.5 h-3.5 text-amber-400" />;
      case 'CODING_TASK_STARTED':
      case 'IMPLEMENTATION_STARTED':
        return <Code2 className="w-3.5 h-3.5 text-sky-400" />;
      case 'FILES_MODIFIED':
        return <FileCode className="w-3.5 h-3.5 text-indigo-400" />;
      case 'TESTS_PASSED':
      case 'CHANGES_APPROVED':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
      case 'TESTS_FAILED':
      case 'test':
      case 'TESTS_STARTED':
        return <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />;
      case 'agent':
      case 'REPOSITORY_ANALYZED':
      case 'REVIEW_REQUESTED':
        return <Bot className="w-3.5 h-3.5 text-indigo-400" />;
      case 'build':
        return <Hammer className="w-3.5 h-3.5 text-sky-400" />;
      case 'asset':
        return <Boxes className="w-3.5 h-3.5 text-amber-400" />;
      case 'command':
        return <Terminal className="w-3.5 h-3.5 text-emerald-400" />;
      case 'user':
      default:
        return <User className="w-3.5 h-3.5 text-pink-400" />;
    }
  };

  return (
    <div
      id="activity-timeline-card"
      className="rounded-2xl bg-[#0c101a] border border-[#1f2a3e] p-5 sm:p-6 shadow-xl space-y-4 flex flex-col justify-between"
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">
              <ActivityIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono tracking-widest text-indigo-400 uppercase font-bold">
                TELEMETRY & LOGS
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white font-mono">
                ACTIVITY FEED
              </h3>
            </div>
          </div>

          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#151c2c] border border-[#232f46] text-[10px] font-mono text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Live Stream</span>
          </span>
        </div>

        {/* Timeline Items */}
        <div className="space-y-3 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-[1px] before:bg-[#1f2a3d]">
          {projectActivities.slice(0, 6).map((activity) => (
            <div key={activity.id} className="relative pl-7 group">
              {/* Bullet Node */}
              <div className="absolute left-1.5 top-1 -translate-x-1/2 w-4 h-4 rounded-full bg-[#0c101a] border border-[#2a3852] flex items-center justify-center group-hover:border-indigo-400 transition-colors">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              </div>

              {/* Item Card */}
              <div className="p-2.5 rounded-xl bg-[#0f1524] hover:bg-[#131b2e] border border-[#1d273a] hover:border-indigo-500/30 transition-all space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {getActivityIcon(activity.type)}
                    <span className="text-xs font-semibold text-white font-mono truncate">
                      {activity.title}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0 whitespace-nowrap">
                    {activity.timeAgo}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                  {activity.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-[#1a2335]">
        <button
          onClick={() => setActiveTab('Activity')}
          className="w-full text-center text-xs font-mono text-indigo-400 hover:text-indigo-300 py-1 transition-colors flex items-center justify-center gap-1.5"
        >
          <span>Open Full Activity Stream</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
