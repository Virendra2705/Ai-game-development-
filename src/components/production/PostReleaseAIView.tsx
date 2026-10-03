import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  BookOpen,
  Send,
  AlertTriangle,
  Play,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { postReleaseAIService } from '../../services/postReleaseAIService';
import { PostReleaseImprovementPlan } from '../../types';

export const PostReleaseAIView: React.FC = () => {
  const { currentProject, addToast } = useApp();
  const [plans, setPlans] = useState<PostReleaseImprovementPlan[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    loadPlans();
  }, [currentProject.id]);

  const loadPlans = () => {
    const list = postReleaseAIService.getPlans(currentProject.id);
    setPlans(list);
  };

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    const res = await postReleaseAIService.runPostReleaseAnalysis(currentProject.id);
    setIsAnalyzing(false);
    loadPlans();

    addToast(
      'Post-Release AI Analysis Completed',
      `Ingested ${res.analyzedCrashes} crash(es) & ${res.analyzedFeedback} feedback tickets. Project Knowledge updated!`,
      'success'
    );
  };

  const handleApprovePlan = async (plan: PostReleaseImprovementPlan) => {
    const operator = 'Alex Vance (Human Lead Producer)';
    const res = await postReleaseAIService.approveAndLaunchDevelopmentRun(
      currentProject.id,
      plan.id,
      operator
    );

    if (res.success) {
      addToast(
        'Plan Approved & Dispatched',
        `Task #${res.taskId} created and queued into Phase 9 Autonomous Dev Loop.`,
        'success'
      );
      loadPlans();
    } else {
      addToast(
        'Approval Rejected',
        res.error || 'Failed to dispatch development run.',
        'error'
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Closed-Loop AI Maintenance */}
      <div className="p-5 rounded-xl bg-[#0b0e17] border border-[#1a2336] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#182030]">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              Post-Release AI Continuous Maintenance Loop
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Production data continuously informs the next development cycle through Project Knowledge and Phase 9 loop.
            </p>
          </div>

          <button
            onClick={handleRunAnalysis}
            disabled={isAnalyzing}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-sm flex items-center gap-1.5 transition-all self-start sm:self-auto disabled:opacity-50"
          >
            <Zap className="w-3.5 h-3.5 text-yellow-300" />
            {isAnalyzing ? 'Synthesizing Production Signals...' : 'Run Post-Release AI Analysis'}
          </button>
        </div>

        {/* Visual Lifecycle Pipeline Diagram */}
        <div className="p-4 rounded-xl bg-[#080b12] border border-[#172033] overflow-x-auto">
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-2">
            CLOSED-LOOP ARCHITECTURE FLOW
          </div>
          <div className="flex items-center gap-2 text-xs font-mono min-w-max">
            <span className="px-2.5 py-1 rounded bg-[#0f1524] text-slate-300 border border-[#1a243d]">
              Production Fleet
            </span>
            <span className="text-slate-600">&rarr;</span>
            <span className="px-2.5 py-1 rounded bg-[#0f1524] text-indigo-300 border border-indigo-500/30">
              Monitoring & Crash Signals
            </span>
            <span className="text-slate-600">&rarr;</span>
            <span className="px-2.5 py-1 rounded bg-[#0f1524] text-purple-300 border border-purple-500/30">
              Phase 8 Knowledge Base
            </span>
            <span className="text-slate-600">&rarr;</span>
            <span className="px-2.5 py-1 rounded bg-[#0f1524] text-yellow-300 border border-yellow-500/30">
              Improvement Proposal
            </span>
            <span className="text-slate-600">&rarr;</span>
            <span className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 font-bold">
              Human Signoff Gate
            </span>
            <span className="text-slate-600">&rarr;</span>
            <span className="px-2.5 py-1 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold">
              Phase 9 Autonomous Dev Run
            </span>
          </div>
        </div>
      </div>

      {/* Improvement Proposals List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Active Post-Release Improvement Proposals
          </h3>
          <span className="text-xs text-slate-500 font-mono">{plans.length} proposals</span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="p-5 rounded-xl bg-[#0b0e17] border border-[#1a2336] space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#182030]">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-base text-white">{plan.title}</h4>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                      {plan.type}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                        plan.risk === 'LOW'
                          ? 'bg-emerald-500/15 text-emerald-300'
                          : plan.risk === 'MEDIUM'
                          ? 'bg-amber-500/15 text-amber-300'
                          : 'bg-rose-500/15 text-rose-300'
                      }`}
                    >
                      Risk: {plan.risk}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mt-1">{plan.reason}</p>
                </div>

                <div>
                  {plan.status === 'PROPOSED' ? (
                    <button
                      onClick={() => handleApprovePlan(plan)}
                      className="px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm flex items-center gap-1.5 transition-all self-start sm:self-auto"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Approve & Launch Phase 9 Dev Run
                    </button>
                  ) : (
                    <span className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 inline-block">
                      {plan.status} ({plan.linkedTaskId})
                    </span>
                  )}
                </div>
              </div>

              {/* Evidence and Work Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-lg bg-[#07090e] border border-[#161f32] space-y-1.5">
                  <span className="text-slate-400 font-semibold block uppercase text-[10px]">
                    Production Evidence Base:
                  </span>
                  <ul className="list-disc list-inside text-slate-300 space-y-1">
                    {plan.evidence.map((ev, idx) => (
                      <li key={idx} className="line-clamp-2">{ev}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 rounded-lg bg-[#07090e] border border-[#161f32] space-y-1.5">
                  <span className="text-slate-400 font-semibold block uppercase text-[10px]">
                    Required Engineering Tasks:
                  </span>
                  <ul className="list-disc list-inside text-slate-300 space-y-1">
                    {plan.requiredWork.map((rw, idx) => (
                      <li key={idx}>{rw}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-2 border-t border-[#182030]">
                <span>
                  Expected Impact: <strong className="text-slate-200">{plan.expectedImpact}</strong>
                </span>
                <span>
                  Affected Systems: <strong className="text-slate-300">{plan.affectedSystems.join(', ')}</strong>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
