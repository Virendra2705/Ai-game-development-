import React, { useState, useMemo } from 'react';
import {
  Code2,
  GitBranch,
  FileCode,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Play,
  FileText,
  CheckSquare,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Terminal,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { codingAgentService } from '../../services/codingAgents/codingAgentService';
import { CodingTaskWorkspaceModal } from './CodingTaskWorkspaceModal';
import { Task } from '../../types';

export const CodingAgentDashboardPanel: React.FC = () => {
  const { currentProject, tasks } = useApp();

  // Find active or prioritized coding task
  const activeCodingTask = useMemo(() => {
    // 1. Check if any task has an active attempt in progress
    for (const t of tasks) {
      const active = codingAgentService.getActiveAttempt(t.id);
      if (active) return t;
    }
    // 2. Default to task-142 (Creature capture system) or first coding task
    const t142 = tasks.find((t) => t.id === 'task-142');
    if (t142) return t142;

    const anyCoding = tasks.find((t) => t.isCodingTask || t.agentId === 'agent-coding');
    if (anyCoding) return anyCoding;

    return tasks[0] || null;
  }, [tasks]);

  const activeAttempt = activeCodingTask
    ? codingAgentService.getActiveAttempt(activeCodingTask.id)
    : null;

  // Workspace modal controls
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'plan' | 'diff' | 'tests' | 'review' | 'logs'>('plan');

  const handleOpenModal = (tab: 'plan' | 'diff' | 'tests' | 'review' | 'logs') => {
    setModalTab(tab);
    setIsModalOpen(true);
  };

  // Metrics calculation
  const taskTitle = activeCodingTask?.title || 'Create creature capture system';
  const statusDisplay = activeAttempt
    ? activeAttempt.status === 'REVIEW'
      ? 'Review'
      : activeAttempt.status === 'TESTING'
      ? 'Testing'
      : activeAttempt.status === 'IMPLEMENTING'
      ? 'Implementing'
      : activeAttempt.status === 'COMPLETED'
      ? 'Committed'
      : 'Approval Required'
    : 'Ready';

  const workspaceBranch =
    activeAttempt?.workspace.branch || `task/${activeCodingTask?.id?.replace('task-', '') || '142'}-creature-capture`;

  const filesChangedCount = activeAttempt?.fileChanges?.length || 4;
  const testsPassed = activeAttempt?.testRun?.passedCount ?? 8;
  const totalTests = activeAttempt?.testRun?.tests?.length ?? 8;
  const approvalStatus =
    activeAttempt?.status === 'REVIEW' || activeAttempt?.status === 'APPROVAL_REQUIRED'
      ? 'Required'
      : activeAttempt?.status === 'COMPLETED'
      ? 'Approved'
      : 'Pending Plan';

  return (
    <>
      <div
        id="coding-agent-dashboard-panel"
        className="rounded-2xl bg-[#0c101a] border border-[#1f2a3e] p-5 sm:p-6 shadow-xl flex flex-col justify-between space-y-4"
      >
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400">
                <Code2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-mono tracking-widest text-sky-400 uppercase font-bold">
                  AUTONOMOUS DEVELOPER
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white font-mono">
                  CODING AGENT
                </h3>
              </div>
            </div>

            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#151c2c] border border-[#232f46] text-[10px] font-mono text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
              <span>Active Agent</span>
            </span>
          </div>

          {/* Current Task Details (Section 36) */}
          <div className="p-3.5 rounded-xl bg-[#0f1524] border border-[#1d273a] space-y-3">
            <div>
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                Current Task:
              </div>
              <div className="text-sm font-bold text-white font-mono mt-0.5 line-clamp-1">
                {taskTitle}
              </div>
            </div>

            {/* Spec Matrix Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-[#182337]">
              {/* Status */}
              <div>
                <div className="text-[10px] font-mono text-slate-400 uppercase">Status:</div>
                <span className="inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-md text-xs font-mono font-semibold bg-amber-500/15 border border-amber-500/30 text-amber-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                  {statusDisplay}
                </span>
              </div>

              {/* Workspace */}
              <div className="min-w-0">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Workspace:</div>
                <div className="flex items-center gap-1 mt-0.5 text-xs font-mono text-sky-300 truncate" title={workspaceBranch}>
                  <GitBranch className="w-3 h-3 shrink-0" />
                  <span className="truncate">{workspaceBranch}</span>
                </div>
              </div>

              {/* Files Changed */}
              <div>
                <div className="text-[10px] font-mono text-slate-400 uppercase">Files Changed:</div>
                <div className="flex items-center gap-1 mt-0.5 text-xs font-mono font-bold text-emerald-400">
                  <FileCode className="w-3 h-3" />
                  <span>{filesChangedCount}</span>
                </div>
              </div>

              {/* Tests */}
              <div>
                <div className="text-[10px] font-mono text-slate-400 uppercase">Tests:</div>
                <div className="flex items-center gap-1 mt-0.5 text-xs font-mono font-bold text-indigo-400">
                  <ShieldCheck className="w-3 h-3" />
                  <span>{testsPassed} / {totalTests}</span>
                </div>
              </div>
            </div>

            {/* Approval Notice */}
            <div className="flex items-center justify-between pt-2 border-t border-[#182337] text-xs font-mono">
              <span className="text-slate-400">Approval:</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
                <AlertTriangle className="w-3 h-3 text-amber-400" />
                {approvalStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons (Section 36) */}
        <div className="grid grid-cols-3 gap-2 pt-2">
          <button
            id="coding-agent-open-task-btn"
            onClick={() => handleOpenModal('plan')}
            className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-bold shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Open Task</span>
          </button>

          <button
            id="coding-agent-view-diff-btn"
            onClick={() => handleOpenModal('diff')}
            className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-[#141c2c] hover:bg-[#1a253b] text-slate-200 hover:text-white border border-[#223049] text-xs font-mono font-semibold transition-all active:scale-95"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            <span>View Diff</span>
          </button>

          <button
            id="coding-agent-view-tests-btn"
            onClick={() => handleOpenModal('tests')}
            className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-[#141c2c] hover:bg-[#1a253b] text-slate-200 hover:text-white border border-[#223049] text-xs font-mono font-semibold transition-all active:scale-95"
          >
            <CheckSquare className="w-3.5 h-3.5 text-sky-400" />
            <span>View Tests</span>
          </button>
        </div>
      </div>

      {/* Full Task Workspace Modal */}
      {activeCodingTask && (
        <CodingTaskWorkspaceModal
          task={activeCodingTask}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          initialTab={modalTab}
        />
      )}
    </>
  );
};
