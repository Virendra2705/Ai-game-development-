import React, { useState, useEffect } from 'react';
import {
  Bug,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  ArrowRight,
  RotateCcw,
  Loader2,
  Play,
  Layers,
  ThumbsUp,
  Cpu,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { debugAgentService } from '../../services/debug/debugAgentService';
import { qaAgentService } from '../../services/qa/qaAgentService';
import { DebugAnalysis, DebugCycle, QAIssue, QARun } from '../../types';

interface AIDebugCenterProps {
  initialIssue?: QAIssue | null;
  onRetestSuccess?: () => void;
}

export const AIDebugCenter: React.FC<AIDebugCenterProps> = ({
  initialIssue,
  onRetestSuccess,
}) => {
  const { currentProject, addToast } = useApp();
  const [issues, setIssues] = useState<QAIssue[]>(qaAgentService.getIssues(currentProject.id));
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(
    initialIssue?.id || issues[0]?.id || null
  );
  const [analysis, setAnalysis] = useState<DebugAnalysis | null>(null);
  const [cycle, setCycle] = useState<DebugCycle | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExecutingLoop, setIsExecutingLoop] = useState(false);
  const [loopStep, setLoopStep] = useState<string | null>(null);

  useEffect(() => {
    const unsubIssues = qaAgentService.subscribeIssues((all) => {
      const filtered = all.filter((i) => i.projectId === currentProject.id);
      setIssues(filtered);
      if (!selectedIssueId && filtered.length > 0) {
        setSelectedIssueId(filtered[0].id);
      }
    });

    const unsubAnalyses = debugAgentService.subscribeAnalyses(() => {
      if (selectedIssueId) {
        setAnalysis(debugAgentService.getAnalysisForIssue(selectedIssueId) || null);
      }
    });

    const unsubCycles = debugAgentService.subscribeCycles(() => {
      if (selectedIssueId) {
        setCycle(debugAgentService.getCycleForIssue(selectedIssueId) || null);
      }
    });

    return () => {
      unsubIssues();
      unsubAnalyses();
      unsubCycles();
    };
  }, [currentProject.id, selectedIssueId]);

  useEffect(() => {
    if (selectedIssueId) {
      setAnalysis(debugAgentService.getAnalysisForIssue(selectedIssueId) || null);
      setCycle(debugAgentService.getCycleForIssue(selectedIssueId) || null);
    }
  }, [selectedIssueId]);

  const selectedIssue = issues.find((i) => i.id === selectedIssueId) || issues[0];

  const handleGenerateAnalysis = async () => {
    if (!selectedIssue) return;
    setIsAnalyzing(true);
    addToast('Debug Agent Active', 'Gemini Debug Agent analyzing runtime logs and stack traces...', 'info');

    const qaRuns = qaAgentService.getRuns(currentProject.id);
    const relevantRun = qaRuns.find((r) => r.id === selectedIssue.qaRunId) || qaRuns[0];

    try {
      const result = await debugAgentService.analyzeIssue(selectedIssue, relevantRun);
      setAnalysis(result);
      setIsAnalyzing(false);
      addToast('Analysis Ready', 'Root cause identified with 3 proposed fixes.', 'success');
    } catch (err: any) {
      setIsAnalyzing(false);
      addToast('Analysis Error', err.message, 'error');
    }
  };

  const handleApproveFix = async () => {
    if (!analysis) return;
    addToast('Fix Approved', 'Operator approved recommended fix. Creating Coding Agent task...', 'info');

    try {
      const res = await debugAgentService.approveFixAndCreateTask(analysis.id);
      addToast('Task Created', res.message, 'success');
    } catch (err: any) {
      addToast('Approval Error', err.message, 'error');
    }
  };

  const handleExecuteFixAndRetest = async () => {
    if (!selectedIssue) return;
    setIsExecutingLoop(true);
    addToast('Retest Loop Triggered', 'Applying fix, rebuilding engine, and running QA assertions...', 'info');

    try {
      const res = await debugAgentService.executeFixAndRetest(selectedIssue.id, (step) => {
        setLoopStep(step);
      });

      setIsExecutingLoop(false);
      setLoopStep(null);

      if (res.success) {
        addToast('Bug Resolved!', res.message, 'success');
        onRetestSuccess?.();
      } else {
        addToast('Retest Warning', res.message, 'warning');
      }
    } catch (err: any) {
      setIsExecutingLoop(false);
      setLoopStep(null);
      addToast('Loop Error', err.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-4 rounded-2xl bg-[#0c101a] border border-[#1f2a3e] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono font-bold uppercase tracking-wider">
            <Cpu className="w-3.5 h-3.5" />
            <span>AI DEBUG AGENT & ROOT CAUSE ANALYSIS</span>
          </div>
          <h2 className="text-xl font-black text-white font-mono tracking-tight mt-0.5">
            Root Cause Analysis & Fix Loop
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Autonomous error analysis with strict human approval gates: QA Issue → Analysis → Operator Approval → Fix → Retest.
          </p>
        </div>

        {/* Action button if no analysis generated yet */}
        {!analysis && selectedIssue && (
          <button
            onClick={handleGenerateAnalysis}
            disabled={isAnalyzing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-mono text-xs font-bold transition-all shadow-lg shadow-indigo-600/25 cursor-pointer disabled:opacity-50"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-purple-200" />
                <span>Analyzing Runtime Stack...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Run Root Cause Analysis</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Main Grid: Analysis Details (8 Cols) vs Issues & Cycle History (4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Root Cause Analysis & Approval Card (8 Cols) */}
        <div className="lg:col-span-8 space-y-5">
          {analysis ? (
            <div className="p-5 rounded-2xl bg-[#0a0e18] border border-[#1c2638] shadow-xl space-y-5">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#1c2638] gap-3">
                <div>
                  <span className="text-xs font-mono text-indigo-400 font-bold uppercase">
                    ANALYSIS CARD #{analysis.id.substring(4, 10)}
                  </span>
                  <h3 className="text-base font-bold text-white font-mono mt-0.5">
                    {analysis.title}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                    Confidence: {analysis.confidence}
                  </span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold border ${
                    analysis.status === 'APPLIED'
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      : analysis.status === 'APPROVED'
                      ? 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                      : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  }`}>
                    {analysis.status}
                  </span>
                </div>
              </div>

              {/* Likely Cause (Section 32) */}
              <div className="p-4 rounded-xl bg-[#0f1524] border border-[#1e293c] space-y-1.5">
                <span className="text-xs font-mono text-indigo-400 font-bold uppercase tracking-wider">
                  LIKELY ROOT CAUSE
                </span>
                <p className="text-xs text-slate-200 font-mono leading-relaxed">
                  {analysis.likelyCause}
                </p>
              </div>

              {/* Evidence Inspector */}
              <div className="p-4 rounded-xl bg-[#0f1524] border border-[#1e293c] space-y-1.5">
                <span className="text-xs font-mono text-rose-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>RUNTIME EVIDENCE</span>
                </span>
                <pre className="p-2.5 rounded bg-black/50 text-[11px] font-mono text-rose-300 overflow-x-auto">
                  {analysis.evidence}
                </pre>
                <div className="text-[11px] font-mono text-slate-400 pt-1">
                  Target File: <strong className="text-indigo-300">{analysis.affectedFiles.join(', ')}</strong>
                </div>
              </div>

              {/* Potential Fixes Option List */}
              <div className="space-y-2">
                <span className="text-xs font-mono text-slate-300 font-bold uppercase tracking-wider">
                  POTENTIAL FIXES EVALUATED BY GEMINI
                </span>
                <div className="space-y-2">
                  {analysis.potentialFixes.map((fix, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-[#111726] border border-[#1d273a] text-xs font-mono text-slate-300"
                    >
                      {fix}
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Action & Operator Approval Gate (Section 33) */}
              <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/40 space-y-3">
                <div className="flex items-center gap-2 text-indigo-300 text-xs font-mono font-bold">
                  <Sparkles className="w-4 h-4 text-purple-300" />
                  <span>RECOMMENDED ACTION</span>
                </div>
                <p className="text-xs text-slate-200 font-mono leading-relaxed">
                  {analysis.recommendedAction}
                </p>

                {/* Operator Approval Buttons */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-indigo-500/20">
                  <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Operator safety boundary: Code changes require explicit approval.</span>
                  </div>

                  {analysis.status === 'PENDING_APPROVAL' ? (
                    <button
                      onClick={handleApproveFix}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition-all shadow-md shadow-emerald-600/25 cursor-pointer"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>Approve Fix & Create Task</span>
                    </button>
                  ) : analysis.status === 'APPROVED' ? (
                    <button
                      onClick={handleExecuteFixAndRetest}
                      disabled={isExecutingLoop}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-500 hover:from-indigo-500 hover:to-purple-500 text-white font-mono text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 cursor-pointer disabled:opacity-50"
                    >
                      {isExecutingLoop ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-purple-200" />
                          <span>{loopStep || 'Executing Fix & Retest Loop...'}</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-white" />
                          <span>Execute Fix, Rebuild & Retest</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <span className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Fix Applied & Verified Resolved</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 font-mono rounded-2xl bg-[#0a0e18] border border-[#1c2638]">
              Select a QA Issue on the right to inspect or generate Root Cause Analysis.
            </div>
          )}
        </div>

        {/* Right Column: QA Issues List & Debug Retry Loop Tracker (4 Cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Debug Retry Loop Monitor (Section 34) */}
          {cycle && (
            <div className="p-5 rounded-2xl bg-[#0a0e18] border border-[#1c2638] shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
                  <span>DEBUG RETRY LOOP</span>
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Cycle {cycle.cycleNumber} of {cycle.maxCycles}
                </span>
              </div>

              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Current Stage:</span>
                  <strong className="text-white">{cycle.currentStage}</strong>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Loop Status:</span>
                  <strong className={cycle.status === 'COMPLETED' ? 'text-emerald-400' : 'text-amber-300'}>
                    {cycle.status}
                  </strong>
                </div>
              </div>

              {/* Attempts history */}
              {cycle.attempts.length > 0 && (
                <div className="pt-2 border-t border-[#1c2638] space-y-2">
                  <span className="text-[11px] font-mono text-slate-400 font-bold">
                    PREVIOUS ATTEMPTS
                  </span>
                  {cycle.attempts.map((att, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-[#111726] border border-[#1d273a] text-[11px] font-mono space-y-1">
                      <div className="flex justify-between text-white font-bold">
                        <span>Cycle #{att.cycle}</span>
                        <span className={att.qaStatus === 'PASS' ? 'text-emerald-400' : 'text-rose-400'}>
                          QA: {att.qaStatus}
                        </span>
                      </div>
                      <div className="text-slate-400">{att.fixApplied}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Issue Selector */}
          <div className="p-5 rounded-2xl bg-[#0a0e18] border border-[#1c2638] shadow-xl space-y-3">
            <span className="text-xs font-mono text-slate-400 font-bold uppercase tracking-wider flex items-center gap-2">
              <Bug className="w-3.5 h-3.5 text-rose-400" />
              <span>SELECT ISSUE ({issues.length})</span>
            </span>

            <div className="space-y-2">
              {issues.map((issue) => (
                <div
                  key={issue.id}
                  onClick={() => setSelectedIssueId(issue.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer space-y-1 ${
                    selectedIssueId === issue.id
                      ? 'bg-indigo-950/40 border-indigo-500/60'
                      : 'bg-[#111726] border-[#1d273a] hover:border-[#2a3752]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-white">Issue #{issue.issueNumber}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase ${
                      issue.status === 'RESOLVED' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                    }`}>
                      {issue.status}
                    </span>
                  </div>
                  <div className="text-xs font-mono text-slate-300 line-clamp-1">
                    {issue.title}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
