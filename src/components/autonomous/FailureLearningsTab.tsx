import React, { useState } from 'react';
import {
  Brain,
  FileText,
  AlertOctagon,
  CheckCircle2,
  FileCode,
  ListOrdered,
  Layers,
} from 'lucide-react';
import { FailureLearning, AutonomousRunReport } from '../../types';

interface FailureLearningsTabProps {
  learnings: FailureLearning[];
  report: AutonomousRunReport | null;
}

export const FailureLearningsTab: React.FC<FailureLearningsTabProps> = ({
  learnings,
  report,
}) => {
  const [activeView, setActiveView] = useState<'LEARNINGS' | 'REPORT'>('LEARNINGS');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#0d121f] border border-[#1b2438]">
        <div>
          <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
            <Brain className="w-4 h-4 text-indigo-400" />
            Failure Learnings & Autonomous Run Reports
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Post-mortem records feeding project memory so autonomous agents never repeat prior mistakes.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-[#090d16] p-1 rounded-lg border border-[#182236]">
          <button
            onClick={() => setActiveView('LEARNINGS')}
            className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
              activeView === 'LEARNINGS'
                ? 'bg-indigo-600 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Failure Learnings ({learnings.length})
          </button>
          <button
            onClick={() => setActiveView('REPORT')}
            className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
              activeView === 'REPORT'
                ? 'bg-indigo-600 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Run Report
          </button>
        </div>
      </div>

      {activeView === 'LEARNINGS' ? (
        <div className="space-y-4">
          {learnings.map((fl) => (
            <div
              key={fl.id}
              className="p-5 rounded-xl bg-[#090d16] border border-[#161f33] space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    <AlertOctagon className="w-4 h-4" />
                  </span>
                  <h4 className="text-sm font-bold text-white font-mono">{fl.issueSummary}</h4>
                </div>
                <span className="text-[10px] font-mono text-slate-500">ID: {fl.id}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-[#0c101a] border border-[#141c2c] space-y-1">
                  <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">
                    What Happened:
                  </span>
                  <p className="text-slate-300">{fl.whatHappened}</p>
                </div>
                <div className="p-3 rounded-lg bg-[#0c101a] border border-[#141c2c] space-y-1">
                  <span className="text-[10px] font-mono text-rose-400 uppercase font-bold">
                    Why It Failed:
                  </span>
                  <p className="text-slate-300">{fl.whyItFailed}</p>
                </div>
                <div className="p-3 rounded-lg bg-[#0c101a] border border-[#141c2c] space-y-1">
                  <span className="text-[10px] font-mono text-amber-400 uppercase font-bold">
                    What Was Attempted:
                  </span>
                  <p className="text-slate-300">{fl.whatWasAttempted}</p>
                </div>
                <div className="p-3 rounded-lg bg-[#140b10] border border-rose-500/30 space-y-1">
                  <span className="text-[10px] font-mono text-rose-300 uppercase font-bold">
                    What Should NEVER Be Repeated:
                  </span>
                  <p className="text-rose-200 font-mono">{fl.whatShouldNotBeRepeated}</p>
                </div>
              </div>

              {fl.whatWorked && (
                <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-xs">
                  <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold block">
                    What Worked & Authoritative Resolution:
                  </span>
                  <p className="text-emerald-200 mt-0.5">{fl.whatWorked}</p>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#141b2a] text-[10px] font-mono text-slate-500">
                <span>Related Files:</span>
                {fl.relatedFiles.map((rf, idx) => (
                  <span key={idx} className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                    {rf}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#090d16] border border-[#161f33] rounded-xl p-6 space-y-5">
          {report ? (
            <>
              <div className="border-b border-[#161f33] pb-4">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                  Comprehensive Autonomous Run Report
                </span>
                <h3 className="text-base font-bold text-white font-mono mt-1">«{report.goal}»</h3>
                <p className="text-xs text-slate-400 mt-1">{report.changesSummary}</p>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-[#0c101a] border border-[#141c2c]">
                  <div className="text-[10px] font-mono text-slate-500 uppercase">Build Success</div>
                  <div className="text-lg font-bold font-mono text-emerald-400 mt-1">
                    {report.buildsPassed} / {report.buildCount}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[#0c101a] border border-[#141c2c]">
                  <div className="text-[10px] font-mono text-slate-500 uppercase">QA Passes</div>
                  <div className="text-lg font-bold font-mono text-emerald-400 mt-1">
                    {report.qaPassedCount} / {report.qaRunsCount}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[#0c101a] border border-[#141c2c]">
                  <div className="text-[10px] font-mono text-slate-500 uppercase">Bugs Resolved</div>
                  <div className="text-lg font-bold font-mono text-sky-400 mt-1">
                    {report.bugsResolved} / {report.bugsDetected}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[#0c101a] border border-[#141c2c]">
                  <div className="text-[10px] font-mono text-slate-500 uppercase">Performance</div>
                  <div className="text-xs font-bold font-mono text-white mt-2">
                    {report.performanceStatus}
                  </div>
                </div>
              </div>

              {/* Completed Milestones */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                  Completed Milestones
                </h4>
                <ul className="space-y-1">
                  {report.completedMilestones.map((cm, idx) => (
                    <li
                      key={idx}
                      className="p-2 rounded bg-[#0c101a] border border-[#141c2c] text-xs text-slate-200 flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{cm}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Remaining Work */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                  Remaining Work for Next Run
                </h4>
                <ul className="space-y-1">
                  {report.remainingWork.map((rw, idx) => (
                    <li
                      key={idx}
                      className="p-2 rounded bg-[#0c101a] border border-[#141c2c] text-xs text-slate-400 flex items-center gap-2"
                    >
                      <span className="text-slate-600 font-mono">•</span>
                      <span>{rw}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-slate-500 font-mono text-xs">
              No report generated yet. Complete an autonomous run to view summary report.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
