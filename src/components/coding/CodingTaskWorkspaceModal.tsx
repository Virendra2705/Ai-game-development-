import React, { useState, useEffect } from 'react';
import {
  X,
  Play,
  CheckCircle2,
  AlertCircle,
  Clock,
  FileCode,
  GitBranch,
  GitCommit as GitCommitIcon,
  GitPullRequest,
  Terminal,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  RotateCcw,
  Send,
  Sparkles,
  Layers,
  AlertTriangle,
  Cpu,
  FileCheck2,
  Eye,
  Check,
  ExternalLink,
} from 'lucide-react';
import {
  Task,
  CodingAttempt,
  GitCommit,
  PullRequest,
  TaskStatus,
} from '../../types';
import { useApp } from '../../context/AppContext';
import { codingAgentService } from '../../services/codingAgents/codingAgentService';
import { gitService } from '../../services/gitService';
import { DiffViewer } from './DiffViewer';

interface CodingTaskWorkspaceModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'review' | 'diff' | 'tests' | 'plan' | 'logs' | 'attempts';
}

export const CodingTaskWorkspaceModal: React.FC<CodingTaskWorkspaceModalProps> = ({
  task,
  isOpen,
  onClose,
  initialTab,
}) => {
  const { currentProject, addToast, updateTaskStatus } = useApp();

  // Confirmation step before starting
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [activeAttempt, setActiveAttempt] = useState<CodingAttempt | null>(null);
  const [allAttempts, setAllAttempts] = useState<CodingAttempt[]>([]);
  const [activeTab, setActiveTab] = useState<'review' | 'diff' | 'tests' | 'plan' | 'logs' | 'attempts'>(
    initialTab || 'plan'
  );

  // Execution and loading states
  const [isProcessing, setIsProcessing] = useState(false);

  // Request changes feedback state
  const [isRequestingChanges, setIsRequestingChanges] = useState(false);
  const [changeFeedback, setChangeFeedback] = useState('');

  // Ready for Commit state
  const [showCommitModal, setShowCommitModal] = useState(false);
  const [commitMessage, setCommitMessage] = useState('');
  const [latestCommit, setLatestCommit] = useState<GitCommit | null>(null);

  // Pull request state
  const [latestPullRequest, setLatestPullRequest] = useState<PullRequest | null>(null);
  const [showPrPreview, setShowPrPreview] = useState(false);

  // Load existing attempts when task opens
  useEffect(() => {
    if (task && isOpen) {
      const attempts = codingAgentService.getAttemptsForTask(task.id);
      setAllAttempts(attempts);
      const active = codingAgentService.getActiveAttempt(task.id);

      if (active) {
        setActiveAttempt(active);
        setShowConfirmation(false);
        if (initialTab) {
          setActiveTab(initialTab);
        } else if (active.status === 'REVIEW' || active.status === 'APPROVAL_REQUIRED') {
          setActiveTab('review');
        } else if (active.fileChanges.length > 0) {
          setActiveTab('diff');
        } else {
          setActiveTab('plan');
        }
      } else {
        // First time opening task: prompt confirmation
        setShowConfirmation(true);
        setActiveAttempt(null);
        if (initialTab) {
          setActiveTab(initialTab);
        }
      }

      setCommitMessage(`feat: ${task.title.toLowerCase()}`);
    }
  }, [task, isOpen, initialTab]);

  if (!isOpen || !task) return null;

  const repo = gitService.getRepositoryForProject(currentProject.id);

  // 1. User confirms "START CODING TASK?" (Section 10)
  const handleStartCoding = async () => {
    setIsProcessing(true);
    try {
      const attempt = await codingAgentService.startCodingTask(task, currentProject);
      setActiveAttempt(attempt);
      setAllAttempts(codingAgentService.getAttemptsForTask(task.id));
      setShowConfirmation(false);
      setActiveTab('plan');

      // Update task status in board
      await updateTaskStatus(task.id, 'Planning');

      addToast(
        'Workspace Initialized',
        `Isolated branch ${attempt.workspace.branch} prepared. Coding plan ready for review.`,
        'info'
      );
    } catch (err: any) {
      addToast('Execution Error', err.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // 2. User approves implementation plan (Section 14)
  const handleApproveImplementation = async () => {
    if (!activeAttempt) return;
    setIsProcessing(true);
    try {
      const updated = await codingAgentService.approveImplementation(activeAttempt.attemptId);
      setActiveAttempt({ ...updated });
      setAllAttempts(codingAgentService.getAttemptsForTask(task.id));

      if (updated.status === 'REVIEW') {
        setActiveTab('review');
        await updateTaskStatus(task.id, 'Testing');
        addToast(
          'Implementation Ready',
          `Synthesized ${updated.fileChanges.length} files. All ${updated.testRun?.passedCount} tests passed.`,
          'success'
        );
      } else if (updated.status === 'FAILED') {
        setActiveTab('tests');
        addToast('Tests Failed', updated.error || 'Review failed tests', 'error');
      }
    } catch (err: any) {
      addToast('Implementation Error', err.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // 3. User requests changes (Section 22)
  const handleSubmitFeedback = async () => {
    if (!activeAttempt || !changeFeedback.trim()) return;
    setIsProcessing(true);
    try {
      const newAttempt = await codingAgentService.requestChanges(
        activeAttempt.attemptId,
        changeFeedback.trim()
      );
      setActiveAttempt(newAttempt);
      setAllAttempts(codingAgentService.getAttemptsForTask(task.id));
      setIsRequestingChanges(false);
      setChangeFeedback('');
      setActiveTab('plan');

      addToast(
        'Attempt Created',
        `Attempt #${newAttempt.attemptNumber} generated with your feedback.`,
        'info'
      );
    } catch (err: any) {
      addToast('Feedback Error', err.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // 4. User approves commit (Section 25, 26, 27)
  const handleCommitChanges = async () => {
    if (!activeAttempt || !commitMessage.trim()) return;
    setIsProcessing(true);
    try {
      const { commit, attempt } = await codingAgentService.approveCommit(
        activeAttempt.attemptId,
        commitMessage.trim()
      );
      setActiveAttempt({ ...attempt });
      setLatestCommit(commit);
      setShowCommitModal(false);
      await updateTaskStatus(task.id, 'Completed');

      addToast(
        'Commit Successful',
        `Committed [${commit.shortHash}] "${commit.message}" to ${commit.branch}.`,
        'success'
      );
    } catch (err: any) {
      addToast('Commit Failed', err.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // 5. Prepare Pull Request (Section 28)
  const handleCreatePullRequest = () => {
    if (!activeAttempt) return;
    try {
      const pr = codingAgentService.createPullRequest(activeAttempt.attemptId, commitMessage);
      setLatestPullRequest(pr);
      setShowPrPreview(true);
      addToast(
        'Pull Request Prepared',
        `PR #${pr.prNumber} created for ${pr.targetBranch}. Direct merge disabled.`,
        'info'
      );
    } catch (err: any) {
      addToast('PR Error', err.message, 'error');
    }
  };

  const getStatusBadge = (status?: TaskStatus | string) => {
    const s = status?.toUpperCase();
    switch (s) {
      case 'COMPLETED':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'REVIEW':
      case 'APPROVAL_REQUIRED':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'TESTING':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      case 'IMPLEMENTING':
      case 'WORKING':
        return 'bg-sky-500/15 text-sky-300 border-sky-500/30 animate-pulse';
      case 'FAILED':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      case 'PLANNING':
      case 'ANALYZING':
        return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30';
      default:
        return 'bg-slate-700/20 text-slate-300 border-slate-600/30';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-2xl bg-[#090d16] border border-[#1e293d] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#182133] bg-[#0c121e]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-indigo-400">
                  CODING WORKSPACE • {task.id.toUpperCase()}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getStatusBadge(
                    activeAttempt?.status || task.status
                  )}`}
                >
                  {activeAttempt?.status || task.status}
                </span>
                {activeAttempt && (
                  <span className="text-[10px] font-mono text-slate-400">
                    Attempt #{activeAttempt.attemptNumber}
                  </span>
                )}
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white font-mono truncate max-w-xl">
                {task.title}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#182133] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
          {/* Section 10: Confirmation Screen ("START CODING TASK?") */}
          {showConfirmation ? (
            <div className="max-w-xl mx-auto py-8 space-y-6 text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-[0_0_25px_rgba(99,102,241,0.2)]">
                <Play className="w-8 h-8 ml-1" />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-mono text-indigo-400 font-bold uppercase tracking-wider">
                  PRE-FLIGHT CONFIRMATION
                </span>
                <h2 className="text-2xl font-extrabold text-white font-mono">
                  START CODING TASK?
                </h2>
                <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                  The Coding Agent will construct an isolated branch, inspect relevant scene scripts, and produce a reviewable implementation plan.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#0d1320] border border-[#1c263b] text-left space-y-2.5 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Task:</span>
                  <span className="text-white font-semibold">{task.title}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Agent:</span>
                  <span className="text-sky-300 font-semibold">Coding Agent (Architecture Ready)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Repository:</span>
                  <span className="text-slate-200">{repo.owner}/{repo.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Target Branch:</span>
                  <span className="text-indigo-300">task/{task.id.replace('task-', '')}-creature-capture</span>
                </div>
                <div className="pt-2 border-t border-[#1a2335] text-[11px] text-amber-300 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>Files: Read-only until implementation plan is approved. Direct commit to main is blocked.</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-[#141b2a] hover:bg-[#1a2337] text-slate-300 font-mono text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleStartCoding}
                  disabled={isProcessing}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-mono text-xs font-bold shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Play className="w-4 h-4" />
                  <span>{isProcessing ? 'Preparing Workspace...' : 'Start Coding'}</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Workspace Status Bar */}
              <div className="p-3.5 rounded-xl bg-[#0c121e] border border-[#1b2538] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <GitBranch className="w-4 h-4 text-indigo-400" />
                    <span>Branch:</span>
                    <span className="text-white font-bold">{activeAttempt?.workspace.branch || 'task/branch'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <span>Base:</span>
                    <span className="text-slate-300">{repo.developmentBranch}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Workspace:</span>
                    <span className="text-emerald-300 font-semibold">Sandboxed & Isolated</span>
                  </div>
                </div>

                {/* Attempt Switcher if multiple attempts exist */}
                {allAttempts.length > 1 && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">Attempts:</span>
                    {allAttempts.map((att) => (
                      <button
                        key={att.attemptId}
                        type="button"
                        onClick={() => setActiveAttempt(att)}
                        className={`px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold border ${
                          activeAttempt?.attemptId === att.attemptId
                            ? 'bg-indigo-600 text-white border-indigo-500'
                            : 'bg-[#141b2a] text-slate-400 border-[#232e42] hover:text-white'
                        }`}
                      >
                        #{att.attemptNumber}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Navigation Tabs */}
              <div className="flex items-center gap-2 border-b border-[#182133] pb-2 text-xs font-mono overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setActiveTab('plan')}
                  className={`px-3.5 py-2 rounded-xl transition-colors font-semibold flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'plan'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-[#121827]'
                  }`}
                >
                  <FileCheck2 className="w-3.5 h-3.5" />
                  <span>Coding Plan</span>
                </button>

                {activeAttempt?.fileChanges && activeAttempt.fileChanges.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('diff')}
                    className={`px-3.5 py-2 rounded-xl transition-colors font-semibold flex items-center gap-1.5 cursor-pointer ${
                      activeTab === 'diff'
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:text-white hover:bg-[#121827]'
                    }`}
                  >
                    <FileCode className="w-3.5 h-3.5" />
                    <span>Diff Viewer ({activeAttempt.fileChanges.length})</span>
                  </button>
                )}

                {activeAttempt?.testRun && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('tests')}
                    className={`px-3.5 py-2 rounded-xl transition-colors font-semibold flex items-center gap-1.5 cursor-pointer ${
                      activeTab === 'tests'
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:text-white hover:bg-[#121827]'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Tests ({activeAttempt.testRun.passedCount}/{activeAttempt.testRun.tests.length})</span>
                  </button>
                )}

                {activeAttempt?.summary && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('review')}
                    className={`px-3.5 py-2 rounded-xl transition-colors font-semibold flex items-center gap-1.5 cursor-pointer ${
                      activeTab === 'review'
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:text-white hover:bg-[#121827]'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Code Review</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setActiveTab('logs')}
                  className={`px-3.5 py-2 rounded-xl transition-colors font-semibold flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'logs'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-[#121827]'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Logs ({activeAttempt?.logs.length || 0})</span>
                </button>
              </div>

              {/* Tab 1: Coding Plan & Codebase Analysis (Section 13 & 14) */}
              {activeTab === 'plan' && (
                <div className="space-y-5">
                  {/* Codebase Analysis Card */}
                  {activeAttempt?.analysis && (
                    <div className="p-4 rounded-xl bg-[#0d1320] border border-[#1d273a] space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-mono font-bold text-indigo-300 flex items-center gap-2">
                          <Cpu className="w-4 h-4" />
                          <span>CODEBASE AST ANALYSIS</span>
                        </h4>
                        <span className="text-[11px] font-mono text-slate-400">
                          {activeAttempt.analysis.detectedTechnology}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                        <div>
                          <span className="text-slate-400 block mb-1">Relevant Files:</span>
                          <ul className="space-y-1">
                            {activeAttempt.analysis.relevantFiles.map((f, i) => (
                              <li key={i} className="text-sky-300 bg-[#121826] px-2 py-0.5 rounded border border-[#1b2538] truncate">
                                {f}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <span className="text-slate-400 block mb-1">Dependencies & Patterns:</span>
                          <ul className="space-y-1">
                            {activeAttempt.analysis.dependencies.map((d, i) => (
                              <li key={i} className="text-purple-300 bg-[#121826] px-2 py-0.5 rounded border border-[#1b2538] truncate">
                                {d}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {activeAttempt.analysis.potentialConflicts.length > 0 && (
                        <div className="pt-2 border-t border-[#182236] text-[11px] font-mono text-amber-300">
                          <span className="font-bold">Potential Conflicts Identified: </span>
                          {activeAttempt.analysis.potentialConflicts.join('; ')}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Implementation Plan Card */}
                  {activeAttempt?.plan && (
                    <div className="p-5 rounded-xl bg-[#0c121e] border border-indigo-500/40 space-y-4 shadow-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-wider">
                            CODING PLAN
                          </span>
                          <h4 className="text-sm font-bold text-white font-mono mt-0.5">
                            Proposed Implementation
                          </h4>
                        </div>

                        <span
                          className={`px-2.5 py-0.5 rounded text-[11px] font-mono font-bold border ${
                            activeAttempt.plan.status === 'APPROVED'
                              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                              : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                          }`}
                        >
                          {activeAttempt.plan.status === 'APPROVED' ? 'Approved' : 'Approval Required'}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 font-mono leading-relaxed bg-[#111726] p-3 rounded-lg border border-[#1d273a]">
                        {activeAttempt.plan.rationale}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
                        <div className="p-3 rounded-lg bg-[#0e1422] border border-[#1d273a]">
                          <span className="text-slate-400 block mb-1 font-bold">Files to Create ({activeAttempt.plan.filesToCreate.length})</span>
                          <ul className="space-y-1">
                            {activeAttempt.plan.filesToCreate.map((f, i) => (
                              <li key={i} className="text-emerald-400 truncate">
                                + {f}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="p-3 rounded-lg bg-[#0e1422] border border-[#1d273a]">
                          <span className="text-slate-400 block mb-1 font-bold">Files to Modify ({activeAttempt.plan.filesToModify.length})</span>
                          <ul className="space-y-1">
                            {activeAttempt.plan.filesToModify.map((f, i) => (
                              <li key={i} className="text-amber-400 truncate">
                                ~ {f}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="p-3 rounded-lg bg-[#0e1422] border border-[#1d273a]">
                          <span className="text-slate-400 block mb-1 font-bold">Tests to Run ({activeAttempt.plan.testsToRun.length})</span>
                          <ul className="space-y-1">
                            {activeAttempt.plan.testsToRun.map((t, i) => (
                              <li key={i} className="text-purple-300 truncate">
                                • {t}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Approval Buttons */}
                      {activeAttempt.plan.status !== 'APPROVED' ? (
                        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#182133]">
                          <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-xl bg-[#141b2a] hover:bg-[#1a2337] text-slate-300 font-mono text-xs transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleApproveImplementation}
                            disabled={isProcessing}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-mono text-xs font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all cursor-pointer disabled:opacity-50"
                          >
                            <Check className="w-4 h-4" />
                            <span>{isProcessing ? 'Synthesizing Code...' : 'Approve Implementation'}</span>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between pt-3 border-t border-[#182133] text-xs font-mono">
                          <span className="text-emerald-400 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Plan approved. Code implemented and verified in isolated workspace.</span>
                          </span>

                          <button
                            type="button"
                            onClick={() => setActiveTab('review')}
                            className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors"
                          >
                            Go to Code Review →
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Diff Viewer (Section 15 & 16) */}
              {activeTab === 'diff' && activeAttempt?.fileChanges && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-300 font-bold">
                      Code Changes inside {activeAttempt.workspace.branch}
                    </span>
                    <span className="text-indigo-400">
                      Target Engine: Godot 4.3 GDScript
                    </span>
                  </div>
                  <DiffViewer fileChanges={activeAttempt.fileChanges} />
                </div>
              )}

              {/* Tab 3: Test Results (Section 18 & 19) */}
              {activeTab === 'tests' && activeAttempt?.testRun && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-[#0d1320] border border-[#1b2538] flex items-center justify-between">
                    <div>
                      <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider">
                        TEST RUNNER SUMMARY
                      </span>
                      <h4 className="text-base font-bold text-white font-mono mt-0.5">
                        {activeAttempt.testRun.status === 'PASSED' ? 'All Tests Passed' : 'Tests Failed'}
                      </h4>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-mono">
                      <span className="px-2.5 py-1 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold">
                        ✓ {activeAttempt.testRun.passedCount} Passed
                      </span>
                      {activeAttempt.testRun.failedCount > 0 && (
                        <span className="px-2.5 py-1 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30 font-bold">
                          ✗ {activeAttempt.testRun.failedCount} Failed
                        </span>
                      )}
                      <span className="text-slate-400">{activeAttempt.testRun.durationMs}ms</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {activeAttempt.testRun.tests.map((test) => (
                      <div
                        key={test.id}
                        className="p-3 rounded-xl bg-[#0a0e17] border border-[#192233] flex items-center justify-between text-xs font-mono"
                      >
                        <div className="flex items-center gap-2.5">
                          {test.status === 'PASSED' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                          )}
                          <span className="text-white font-semibold">{test.name}</span>
                        </div>
                        <span className="text-slate-400">{test.durationMs}ms</span>
                      </div>
                    ))}
                  </div>

                  {/* Test Logs */}
                  <div className="p-4 rounded-xl bg-[#060910] border border-[#141b2b] space-y-1.5 font-mono text-xs text-slate-300 max-h-48 overflow-y-auto custom-scrollbar">
                    {activeAttempt.testRun.logs.map((log, i) => (
                      <div key={i} className="leading-relaxed">
                        {log}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 4: Code Review (Section 17 & 21) */}
              {activeTab === 'review' && activeAttempt?.summary && (
                <div className="space-y-5">
                  {/* Implementation Summary */}
                  <div className="p-5 rounded-xl bg-[#0c121e] border border-indigo-500/30 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">
                        IMPLEMENTATION SUMMARY
                      </span>
                      <span className="text-xs font-mono text-emerald-400">
                        ✓ {activeAttempt.testRun?.passedCount || 4} Tests Verified
                      </span>
                    </div>

                    <div className="space-y-3 text-xs font-mono">
                      <div>
                        <span className="text-slate-400 block font-bold mb-1">What changed:</span>
                        <p className="text-slate-200 leading-relaxed bg-[#101624] p-3 rounded-lg border border-[#1b2538]">
                          {activeAttempt.summary.whatChanged}
                        </p>
                      </div>

                      <div>
                        <span className="text-slate-400 block font-bold mb-1">Why:</span>
                        <p className="text-slate-300 leading-relaxed bg-[#101624] p-3 rounded-lg border border-[#1b2538]">
                          {activeAttempt.summary.why}
                        </p>
                      </div>

                      {activeAttempt.summary.potentialRisks.length > 0 && (
                        <div>
                          <span className="text-amber-400 block font-bold mb-1">Potential Risks:</span>
                          <ul className="list-disc list-inside space-y-1 text-slate-300 bg-amber-950/20 p-3 rounded-lg border border-amber-500/30">
                            {activeAttempt.summary.potentialRisks.map((risk, i) => (
                              <li key={i}>{risk}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {activeAttempt.summary.knownLimitations.length > 0 && (
                        <div>
                          <span className="text-slate-400 block font-bold mb-1">Known Limitations:</span>
                          <ul className="list-disc list-inside space-y-1 text-slate-400">
                            {activeAttempt.summary.knownLimitations.map((lim, i) => (
                              <li key={i}>{lim}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Compact Diff Preview */}
                  <div className="space-y-2">
                    <span className="text-xs font-mono font-bold text-white">Files Modified</span>
                    <DiffViewer fileChanges={activeAttempt.fileChanges} defaultExpanded={false} />
                  </div>

                  {/* Request Changes feedback box */}
                  {isRequestingChanges ? (
                    <div className="p-4 rounded-xl bg-[#131a29] border border-indigo-500/40 space-y-3">
                      <span className="text-xs font-mono font-bold text-indigo-300">
                        What should be changed? (Attempt #{activeAttempt.attemptNumber + 1})
                      </span>
                      <textarea
                        value={changeFeedback}
                        onChange={(e) => setChangeFeedback(e.target.value)}
                        placeholder="e.g. Do not modify existing battle system; cap capture rate at 90%..."
                        className="w-full h-24 p-3 rounded-lg bg-[#0b0f17] border border-[#1e283c] text-xs font-mono text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setIsRequestingChanges(false)}
                          className="px-3 py-1.5 rounded-lg bg-[#192336] text-slate-300 text-xs font-mono hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSubmitFeedback}
                          disabled={!changeFeedback.trim() || isProcessing}
                          className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-bold transition-colors disabled:opacity-40"
                        >
                          Submit Feedback & Re-implement
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Review Action Buttons (Section 21) */
                    <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-[#0d1320] border border-[#1c263b]">
                      <div className="text-xs font-mono text-slate-400">
                        Review Status: <span className="text-amber-300 font-bold">Operator Approval Required</span>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => setIsRequestingChanges(true)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#151c2a] hover:bg-[#1d273a] text-slate-200 border border-[#232e42] text-xs font-mono font-medium transition-colors"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                          <span>Request Changes</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setShowCommitModal(true)}
                          className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-xs font-mono font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all cursor-pointer"
                        >
                          <GitCommitIcon className="w-4 h-4" />
                          <span>Approve & Commit Changes</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 5: Execution Logs (Section 29) */}
              {activeTab === 'logs' && (
                <div className="p-4 rounded-xl bg-[#060910] border border-[#161f30] space-y-2 font-mono text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-[#131b2b] text-[11px] text-slate-400">
                    <span>EXECUTION LOGS (SANITIZED)</span>
                    <span className="text-emerald-400">Credentials & API Keys Protected</span>
                  </div>
                  <div className="space-y-1.5 max-h-96 overflow-y-auto custom-scrollbar">
                    {(activeAttempt?.logs || []).map((log, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <span className="text-slate-400 select-none text-[10px] shrink-0 mt-0.5">
                          {log.timestamp}
                        </span>
                        <span
                          className={`leading-relaxed ${
                            log.level === 'error'
                              ? 'text-rose-400'
                              : log.level === 'warn'
                              ? 'text-amber-300'
                              : log.level === 'success'
                              ? 'text-emerald-300'
                              : 'text-slate-300'
                          }`}
                        >
                          {log.message}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Section 25 & 26: Ready for Commit Dialog Modal */}
        {showCommitModal && (
          <div className="absolute inset-0 z-20 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <div className="w-full max-w-lg p-6 rounded-2xl bg-[#0d1320] border border-emerald-500/40 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GitCommitIcon className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-base font-bold text-white font-mono">READY FOR COMMIT</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCommitModal(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-[#080c14] border border-[#1b2538] text-xs font-mono space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Task:</span>
                  <span className="text-white font-semibold">{task.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Branch:</span>
                  <span className="text-indigo-400">{activeAttempt?.workspace.branch}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tests:</span>
                  <span className="text-emerald-400 font-bold">
                    {activeAttempt?.testRun?.passedCount || 4} passed, 0 failed
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Files:</span>
                  <span className="text-slate-200">{activeAttempt?.fileChanges.length || 4} changed</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-300 font-semibold block">
                  Commit Message (Editable):
                </label>
                <input
                  type="text"
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#070b12] border border-[#1f293d] text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCommitModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#141b2a] text-slate-300 text-xs font-mono hover:text-white"
                >
                  Discard
                </button>
                <button
                  type="button"
                  onClick={handleCommitChanges}
                  disabled={isProcessing || !commitMessage.trim()}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold transition-colors cursor-pointer disabled:opacity-40"
                >
                  {isProcessing ? 'Committing...' : 'Commit Changes'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Section 27: Commit Successful Banner & Section 28: Pull Request Preview */}
        {latestCommit && !showCommitModal && (
          <div className="p-4 bg-emerald-950/40 border-t border-emerald-500/40 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <span className="font-bold text-white">COMMIT SUCCESSFUL: </span>
                <span className="text-emerald-300">
                  [{latestCommit.shortHash}] {latestCommit.message}
                </span>
                <span className="text-slate-400 block text-[11px]">
                  Branch: {latestCommit.branch} • {latestCommit.filesChangedCount} files • {latestCommit.testsPassedCount} tests passed
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCreatePullRequest}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors cursor-pointer shrink-0"
            >
              <GitPullRequest className="w-4 h-4" />
              <span>Create Pull Request</span>
            </button>
          </div>
        )}

        {/* Pull Request Modal Preview (Section 28) */}
        {showPrPreview && latestPullRequest && (
          <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <div className="w-full max-w-xl p-6 rounded-2xl bg-[#0d1320] border border-indigo-500/40 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GitPullRequest className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-base font-bold text-white font-mono">
                    PULL REQUEST PREVIEW #{latestPullRequest.prNumber}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPrPreview(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-[#080c14] border border-[#1b2538] flex items-center justify-between">
                  <span className="text-slate-400">Branches:</span>
                  <span className="text-indigo-300">
                    {latestPullRequest.sourceBranch} → {latestPullRequest.targetBranch}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-[#080c14] border border-[#1b2538] space-y-1.5">
                  <span className="text-slate-400 block font-bold">Summary:</span>
                  <p className="text-slate-200 leading-relaxed">{latestPullRequest.summary}</p>
                </div>

                <div className="p-3 rounded-lg bg-[#080c14] border border-[#1b2538] space-y-1">
                  <span className="text-slate-400 block font-bold">Verified Tests:</span>
                  <ul className="text-emerald-400 space-y-0.5">
                    {latestPullRequest.tests.map((t, idx) => (
                      <li key={idx}>✓ {t}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-2.5 rounded-lg bg-indigo-950/30 border border-indigo-500/30 text-[11px] text-indigo-300">
                  ⚠️ Note: Automatic merging is strictly disabled. Human review required on GitHub before merging to main.
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPrPreview(false)}
                  className="px-4 py-2 rounded-xl bg-[#141b2a] text-slate-300 text-xs font-mono hover:text-white"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
