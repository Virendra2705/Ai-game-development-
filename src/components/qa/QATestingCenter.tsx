import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  RotateCcw,
  Bug,
  Sparkles,
  FileText,
  Activity,
  Layers,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Clock,
  Terminal,
  Camera,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { qaAgentService } from '../../services/qa/qaAgentService';
import { buildPipelineService } from '../../services/build/buildPipelineService';
import { previewService } from '../../services/preview/previewService';
import { QARun, QATest, QAIssue } from '../../types';

interface QATestingCenterProps {
  onOpenDebug?: (issue: QAIssue) => void;
}

export const QATestingCenter: React.FC<QATestingCenterProps> = ({ onOpenDebug }) => {
  const { currentProject, addToast } = useApp();
  const [runs, setRuns] = useState<QARun[]>(qaAgentService.getRuns(currentProject.id));
  const [issues, setIssues] = useState<QAIssue[]>(qaAgentService.getIssues(currentProject.id));
  const [activeRunId, setActiveRunId] = useState<string | null>(runs[0]?.id || null);
  const [isRunningQA, setIsRunningQA] = useState(false);
  const [expandedTestId, setExpandedTestId] = useState<string | null>(null);

  useEffect(() => {
    const unsubRuns = qaAgentService.subscribeRuns((allRuns) => {
      const filtered = allRuns.filter((r) => r.projectId === currentProject.id);
      setRuns(filtered);
      if (!activeRunId && filtered.length > 0) {
        setActiveRunId(filtered[0].id);
      }
    });

    const unsubIssues = qaAgentService.subscribeIssues((allIssues) => {
      setIssues(allIssues.filter((i) => i.projectId === currentProject.id));
    });

    return () => {
      unsubRuns();
      unsubIssues();
    };
  }, [currentProject.id, activeRunId]);

  const activeRun = runs.find((r) => r.id === activeRunId) || runs[0];

  const handleRunQA = async () => {
    setIsRunningQA(true);
    addToast('Automated QA Started', 'Executing test suite on active build and preview session...', 'info');

    const latestBuild = buildPipelineService.getJobs(currentProject.id)[0];
    const session = previewService.getActiveSession();

    if (!latestBuild) {
      addToast('No Build Available', 'Please trigger a build first.', 'warning');
      setIsRunningQA(false);
      return;
    }

    try {
      const newRun = await qaAgentService.runAutomatedQA(currentProject.id, latestBuild, session, false);
      setActiveRunId(newRun.id);
      setIsRunningQA(false);

      if (newRun.status === 'FAIL') {
        addToast('QA Run Completed', 'QA detected 1 functional bug in CreatureDatabase.gd.', 'warning');
      } else {
        addToast('QA Passed', 'All automated verification tests passed!', 'success');
      }
    } catch (err: any) {
      setIsRunningQA(false);
      addToast('QA Execution Error', err.message, 'error');
    }
  };

  const getStatusBadge = (status: QARun['status']) => {
    switch (status) {
      case 'PASS':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'PASS_WITH_WARNINGS':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'FAIL':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      default:
        return 'bg-slate-500/15 text-slate-300 border-slate-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#0c101a] border border-[#1f2a3e]">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono font-bold uppercase tracking-wider">
            <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" />
            <span>AUTOMATED QA & EVIDENCE REGISTRY</span>
          </div>
          <h2 className="text-xl font-black text-white font-mono tracking-tight mt-0.5">
            QA Report & Quality Gate
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Autonomous test execution, runtime log assertions, visual regression checks, and performance benchmarks.
          </p>
        </div>

        <button
          onClick={handleRunQA}
          disabled={isRunningQA}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-mono text-xs font-bold transition-all shadow-lg shadow-amber-600/25 cursor-pointer disabled:opacity-50 shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isRunningQA ? 'Running QA Tests...' : 'Run Automated QA Suite'}</span>
        </button>
      </div>

      {/* Main Grid: QA Report Details (8 Cols) vs Issues & History (4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Comprehensive QA Report (Section 24) */}
        <div className="lg:col-span-8 space-y-5">
          {activeRun ? (
            <div className="p-5 rounded-2xl bg-[#0a0e18] border border-[#1c2638] shadow-xl space-y-6">
              {/* Report Title & Status Badge */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#1c2638] gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white font-mono">
                      QA Run #{activeRun.runNumber}
                    </h3>
                    <span className={`px-3 py-0.5 rounded-full text-xs font-mono font-bold border ${getStatusBadge(activeRun.status)}`}>
                      OVERALL: {activeRun.status}
                    </span>
                  </div>
                  <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
                    <span>Build: #{activeRun.buildId.replace('build-', '')}</span>
                    <span>•</span>
                    <span>Duration: {activeRun.durationSeconds}s</span>
                    <span>•</span>
                    <span>{new Date(activeRun.createdAt).toLocaleTimeString()}</span>
                  </div>
                </div>

                {/* Score Pills */}
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold">
                    ✓ {activeRun.passedTests} Passed
                  </span>
                  {activeRun.failedTests > 0 && (
                    <span className="px-2.5 py-1 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-mono font-bold">
                      ✕ {activeRun.failedTests} Failed
                    </span>
                  )}
                </div>
              </div>

              {/* Section 25: Automated QA Tasks Checklist with Evidence */}
              <div className="space-y-3">
                <span className="text-xs font-mono text-indigo-400 font-bold uppercase tracking-wider">
                  FUNCTIONAL TEST RESULTS ({activeRun.functionalTests.length})
                </span>

                <div className="space-y-2">
                  {activeRun.functionalTests.map((test) => (
                    <div
                      key={test.id}
                      className={`p-3.5 rounded-xl border transition-all ${
                        test.status === 'FAIL'
                          ? 'bg-rose-950/25 border-rose-500/40'
                          : 'bg-[#111726] border-[#1d273a]'
                      }`}
                    >
                      <div
                        onClick={() => setExpandedTestId(expandedTestId === test.id ? null : test.id)}
                        className="flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          {test.status === 'PASS' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                          )}
                          <div>
                            <div className="text-xs font-bold text-white font-mono">
                              {test.name}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              {test.description}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-[11px] font-mono text-slate-400">{test.durationMs}ms</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                            test.status === 'PASS' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                          }`}>
                            {test.status}
                          </span>
                          {expandedTestId === test.id ? (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                      </div>

                      {/* Evidence Drawer (Section 26) */}
                      {expandedTestId === test.id && (
                        <div className="mt-3 pt-3 border-t border-[#232f48] space-y-2 text-xs font-mono">
                          {test.evidence && (
                            <div className="p-3 rounded-lg bg-[#0c101a] border border-rose-500/30 text-rose-200 space-y-1">
                              <div className="flex items-center gap-1.5 font-bold text-rose-300">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                <span>EVIDENCE: {test.evidence.type}</span>
                              </div>
                              <div className="text-slate-300">{test.evidence.description}</div>
                              {test.evidence.file && (
                                <div className="text-indigo-300 font-bold">
                                  File: {test.evidence.file}:{test.evidence.line}
                                </div>
                              )}
                              {test.evidence.rawData && (
                                <pre className="p-2 rounded bg-black/50 text-[10px] text-rose-300 overflow-x-auto">
                                  {test.evidence.rawData}
                                </pre>
                              )}
                            </div>
                          )}

                          {/* Test Logs */}
                          <div className="space-y-1 text-slate-400 text-[11px]">
                            <strong className="text-slate-300">Execution Logs:</strong>
                            {test.logs.map((log, i) => (
                              <div key={i} className="pl-2 border-l border-slate-700">
                                {log}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Visual Checks & Performance Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Visual Checks (Section 28) */}
                <div className="p-4 rounded-xl bg-[#0f1524] border border-[#1e293c] space-y-2">
                  <span className="text-xs font-mono text-slate-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-indigo-400" />
                    <span>VISUAL & RENDERING CHECKS</span>
                  </span>
                  <div className="space-y-1.5 text-xs font-mono">
                    {activeRun.visualChecks.map((v, i) => (
                      <div key={i} className="flex items-start justify-between text-[11px]">
                        <span className="text-slate-300 font-medium">{v.name}:</span>
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> {v.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Performance Benchmarks (Section 29) */}
                <div className="p-4 rounded-xl bg-[#0f1524] border border-[#1e293c] space-y-2">
                  <span className="text-xs font-mono text-slate-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>PERFORMANCE METRICS</span>
                  </span>
                  {activeRun.performance ? (
                    <div className="space-y-1 text-xs font-mono text-slate-300 text-[11px]">
                      <div className="flex justify-between">
                        <span>Average Framerate:</span>
                        <strong className="text-emerald-400">{activeRun.performance.fps} FPS</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Frame Timing:</span>
                        <strong className="text-white">{activeRun.performance.frameTimeMs} ms</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>VRAM & Engine Heap:</span>
                        <strong className="text-indigo-300">{activeRun.performance.memoryMB} MB</strong>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs font-mono text-slate-500">Performance metrics unavailable.</div>
                  )}
                </div>
              </div>

              {/* Recommendations & Actionable Next Steps */}
              {activeRun.recommendations.length > 0 && (
                <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/30 space-y-2 text-xs font-mono">
                  <div className="flex items-center gap-2 text-indigo-300 font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>QA RECOMMENDATIONS</span>
                  </div>
                  <ul className="space-y-1 text-slate-300 text-[11px] list-disc list-inside">
                    {activeRun.recommendations.map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 font-mono">
              No QA reports available yet. Run the QA suite above.
            </div>
          )}
        </div>

        {/* Right Column: QA Issues Tracker (Section 30) & Run History */}
        <div className="lg:col-span-4 space-y-5">
          {/* QA Issues System */}
          <div className="p-5 rounded-2xl bg-[#0a0e18] border border-[#1c2638] shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-300 font-bold uppercase tracking-wider flex items-center gap-2">
                <Bug className="w-4 h-4 text-rose-400" />
                <span>QA ISSUES ({issues.length})</span>
              </span>
            </div>

            {issues.length === 0 ? (
              <div className="p-6 text-center text-xs font-mono text-slate-500">
                No active QA issues detected. Clean pass!
              </div>
            ) : (
              <div className="space-y-3">
                {issues.map((issue) => (
                  <div
                    key={issue.id}
                    className="p-3.5 rounded-xl bg-[#111726] border border-[#1e293c] hover:border-rose-500/40 transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-rose-300">
                        Issue #{issue.issueNumber}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        issue.status === 'RESOLVED'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}>
                        {issue.status}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-white font-mono leading-snug">
                      {issue.title}
                    </div>

                    <div className="text-[11px] text-slate-400 font-mono line-clamp-2">
                      {issue.description}
                    </div>

                    <div className="text-[10px] text-indigo-300 font-mono">
                      File: {issue.affectedFiles[0]}
                    </div>

                    <div className="pt-2 border-t border-[#1e293c]">
                      <button
                        onClick={() => onOpenDebug?.(issue)}
                        className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold transition-all cursor-pointer shadow-md shadow-indigo-600/20"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Inspect with AI Debug Agent</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* QA Run History (Section 39) */}
          <div className="p-5 rounded-2xl bg-[#0a0e18] border border-[#1c2638] shadow-xl space-y-3">
            <span className="text-xs font-mono text-slate-400 font-bold uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>QA RUN HISTORY ({runs.length})</span>
            </span>

            <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
              {runs.map((r) => (
                <div
                  key={r.id}
                  onClick={() => setActiveRunId(r.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    activeRunId === r.id
                      ? 'bg-indigo-950/40 border-indigo-500/50'
                      : 'bg-[#121724] border-[#1e273a] hover:border-[#2a3752]'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-white font-mono">
                      QA Run #{r.runNumber}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">
                      Build #{r.buildId.replace('build-', '')} • {r.passedTests}/{r.totalTests} Passed
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getStatusBadge(r.status)}`}>
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
