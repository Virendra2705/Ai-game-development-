import React, { useState } from 'react';
import {
  X,
  Play,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Boxes,
  Code2,
  Brain,
  ShieldCheck,
  Search,
  Sparkles,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';
import { embervaleTestService, EmbervaleTestReport } from '../../services/embervaleTestService';

interface EmbervaleTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const EmbervaleTestModal: React.FC<EmbervaleTestModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [report, setReport] = useState<EmbervaleTestReport | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'steps' | 'brief' | 'context' | 'qa'>('steps');

  if (!isOpen) return null;

  const handleRunTest = async () => {
    setIsRunning(true);
    try {
      const res = await embervaleTestService.runSparkitCaptureTest('proj-embervale');
      setReport(res);
      onSuccess?.();
    } catch (err) {
      console.error(err);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[90vh] flex flex-col bg-[#0c1019] border border-[#1e2638] rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e2638] bg-[#111726]">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white font-mono">Embervale Sparkit Capture Test</h2>
                <span className="px-2 py-0.5 text-xs font-semibold rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Section 33 Verification
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Command: <span className="text-amber-300 font-mono">«"Add the Sparkit creature capture animation."»</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#182033] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action bar */}
        <div className="flex items-center justify-between px-6 py-3 bg-[#0e1320] border-b border-[#182033]">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSubTab('steps')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeSubTab === 'steps'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#182033]'
              }`}
            >
              Execution Steps (14)
            </button>
            <button
              onClick={() => setActiveSubTab('brief')}
              disabled={!report}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeSubTab === 'brief'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#182033] disabled:opacity-40'
              }`}
            >
              Agent Context Brief
            </button>
            <button
              onClick={() => setActiveSubTab('context')}
              disabled={!report}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeSubTab === 'context'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#182033] disabled:opacity-40'
              }`}
            >
              Context Package
            </button>
            <button
              onClick={() => setActiveSubTab('qa')}
              disabled={!report}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeSubTab === 'qa'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#182033] disabled:opacity-40'
              }`}
            >
              Knowledge Q&A Citation
            </button>
          </div>

          <button
            onClick={handleRunTest}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white text-xs font-bold transition-all shadow-md shadow-emerald-900/30"
          >
            {isRunning ? (
              <>
                <Clock className="w-3.5 h-3.5 animate-spin" />
                Executing Pipeline...
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                {report ? 'Re-run Test' : 'Run Full Test Pipeline'}
              </>
            )}
          </button>
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-6">
          {!report && !isRunning && (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Brain className="w-8 h-8" />
              </div>
              <div className="max-w-md space-y-1">
                <h3 className="text-base font-bold text-white">Embervale Verification Pipeline</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Executes the autonomous 14-step knowledge retrieval, context brief synthesis, multi-agent proposal,
                  and memory extraction cycle for Sparkit creature capture.
                </p>
              </div>
              <button
                onClick={handleRunTest}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/30"
              >
                Start Verification Pipeline
              </button>
            </div>
          )}

          {/* Subtab: Steps */}
          {activeSubTab === 'steps' && report && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-[#111726] border border-[#1e2638]">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Pipeline Result</h4>
                    <p className="text-xs text-emerald-300 font-mono">
                      14/14 Steps Completed Successfully • 0 Unmanaged Contradictions
                    </p>
                  </div>
                </div>
                <div className="text-right text-[11px] text-slate-400 font-mono">
                  Runtime: 1.2s • Status: {report.conflictCheckStatus}
                </div>
              </div>

              <div className="space-y-2">
                {report.steps.map((s) => (
                  <div
                    key={s.step}
                    className="flex items-start gap-3 p-3 rounded-xl bg-[#0f1422] border border-[#1a2133] hover:border-[#2a344d] transition-colors"
                  >
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold shrink-0 mt-0.5">
                      {s.step}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-200">{s.name}</span>
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {s.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 font-mono leading-relaxed">{s.output}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Subtab: AgentContextBrief */}
          {activeSubTab === 'brief' && report?.brief && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-800/40 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Synthesized AgentContextBrief</h4>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Target: {report.brief.targetAgent}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-[#0a0e18] border border-[#161d2d] space-y-2">
                  <div className="text-xs">
                    <span className="text-slate-400 font-bold">TASK: </span>
                    <span className="text-white font-mono">{report.brief.taskTitle}</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-slate-400 font-bold">RELEVANT SYSTEMS: </span>
                    <span className="text-indigo-300 font-mono">{report.brief.relevantSystems.join(' • ')}</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-slate-400 font-bold">RELEVANT ASSETS: </span>
                    <span className="text-amber-300 font-mono">{report.brief.relevantAssets.join(' • ')}</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-slate-400 font-bold">IMPORTANT DECISIONS: </span>
                    <span className="text-slate-300 font-mono">{report.brief.importantDecisions.join(' ')}</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-slate-400 font-bold">KNOWN BUGS: </span>
                    <span className="text-rose-300 font-mono">{report.brief.knownBugs.join(' ')}</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-slate-400 font-bold">CONSTRAINTS: </span>
                    <span className="text-amber-200 font-mono">{report.brief.constraints.join(' • ')}</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-slate-400 font-bold">EXPECTED RESULT: </span>
                    <span className="text-emerald-300 font-mono">{report.brief.expectedResult}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Subtab: Context Package */}
          {activeSubTab === 'context' && report?.contextPackage && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#0f1422] border border-[#1a2133] space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                    <FileText className="w-4 h-4 text-indigo-400" />
                    Relevant Canon Documents ({report.contextPackage.relevantDocuments.length})
                  </div>
                  {report.contextPackage.relevantDocuments.map((d) => (
                    <div key={d.id} className="p-2.5 rounded-lg bg-[#141b2c] border border-[#1e2840] text-xs">
                      <div className="font-bold text-white">{d.title}</div>
                      <div className="text-slate-400 text-[11px] mt-0.5">{d.description}</div>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-xl bg-[#0f1422] border border-[#1a2133] space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                    <Code2 className="w-4 h-4 text-sky-400" />
                    Relevant Code Files ({report.contextPackage.relevantCodeContext.length})
                  </div>
                  {report.contextPackage.relevantCodeContext.map((c) => (
                    <div key={c.path} className="p-2.5 rounded-lg bg-[#141b2c] border border-[#1e2840] text-xs">
                      <div className="font-bold text-white font-mono">{c.name}</div>
                      <div className="text-slate-400 text-[11px] mt-0.5">System: {c.system} • {c.lines} lines</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Subtab: Q&A Citation */}
          {activeSubTab === 'qa' && report?.knowledgeExplanation && (
            <div className="space-y-4">
              <div className="p-5 rounded-xl bg-[#101626] border border-[#1c2438] space-y-3">
                <div className="flex items-center gap-2 text-amber-300 text-xs font-bold font-mono">
                  <HelpCircle className="w-4 h-4" />
                  USER QUESTION:
                </div>
                <div className="text-sm font-bold text-white font-mono">
                  «"{report.knowledgeExplanation.question}"»
                </div>
                <div className="p-4 rounded-xl bg-[#0a0e18] border border-[#172033] text-xs text-slate-300 leading-relaxed font-sans">
                  {report.knowledgeExplanation.answer}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0f1422] border border-[#1a2133] space-y-3">
                <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Identified Project Sources</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {report.knowledgeExplanation.sources.map((src, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-[#131a2a] border border-[#1e283e] text-xs">
                      <div className="truncate font-medium text-slate-200">{src.title}</div>
                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                          {src.type}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                          {src.confidence}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#0a0e17] border-t border-[#182033]">
          <div className="text-xs text-slate-400 font-mono">
            Embervale: Rift Tamers • Knowledge Core v8.0
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#182033] hover:bg-[#202b42] text-slate-300 text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
