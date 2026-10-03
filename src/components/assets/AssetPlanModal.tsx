import React, { useState } from 'react';
import {
  CheckCircle,
  Clock,
  Sparkles,
  Layers,
  ShieldAlert,
  ArrowRight,
  X,
  FileCheck,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { AssetGenerationPlan } from '../../types/assets';

interface AssetPlanModalProps {
  plan: AssetGenerationPlan;
  onClose: () => void;
  onApproveAndGenerate: (plan: AssetGenerationPlan) => void;
  isExecuting?: boolean;
  executionProgress?: number;
  currentStepMessage?: string;
}

export const AssetPlanModal: React.FC<AssetPlanModalProps> = ({
  plan,
  onClose,
  onApproveAndGenerate,
  isExecuting = false,
  executionProgress = 0,
  currentStepMessage = '',
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPurpose, setEditedPurpose] = useState(plan.purpose);

  const handleApprove = () => {
    onApproveAndGenerate({
      ...plan,
      purpose: editedPurpose,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md font-mono text-xs">
      <div className="relative w-full max-w-3xl max-h-[92vh] bg-[#0c101a] border border-[#1f2a3e] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[#1c2638] bg-[#080c14] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Gemini Asset Generation Plan
                </h3>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-bold">
                  APPROVAL REQUIRED (SECTION 9)
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Multi-stage orchestration plan formulated for {plan.assetName} ({plan.assetType})
              </p>
            </div>
          </div>

          {!isExecuting && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-[#121826] text-slate-400 hover:text-white border border-[#1d273a] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Plan Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Active Generation Progress Feedback (if executing) */}
          {isExecuting && (
            <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/40 space-y-2.5 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="font-bold text-indigo-300 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                  <span>Executing Plan Stages...</span>
                </div>
                <span className="text-sm font-bold text-white">{executionProgress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#080c14] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-sky-400 rounded-full transition-all duration-300"
                  style={{ width: `${executionProgress}%` }}
                />
              </div>
              <div className="text-[11px] text-indigo-200">{currentStepMessage || 'Synthesizing output...'}</div>
            </div>
          )}

          {/* Section 9 Spec Card */}
          <div className="p-4 rounded-xl bg-[#080c14] border border-[#1a2334] space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
              <div>
                <span className="text-slate-400">Target Asset:</span>
                <div className="font-bold text-white text-xs mt-0.5">{plan.assetName}</div>
              </div>
              <div>
                <span className="text-slate-400">Category:</span>
                <div className="font-bold text-indigo-300 text-xs mt-0.5">{plan.assetType}</div>
              </div>
              <div>
                <span className="text-slate-400">Platform Target:</span>
                <div className="font-bold text-emerald-300 text-xs mt-0.5">
                  {plan.targetOptimization.platform} (Max {plan.targetOptimization.maxPolygonCount.toLocaleString()} tris)
                </div>
              </div>
              <div>
                <span className="text-slate-400">Est. Total Time:</span>
                <div className="font-bold text-sky-300 text-xs mt-0.5">
                  ~{plan.stages.reduce((acc, s) => acc + s.estimatedSeconds, 0)} seconds
                </div>
              </div>
            </div>

            {isEditing ? (
              <div>
                <label className="text-slate-400 text-[10px] uppercase font-bold">Edit Purpose / Prompt:</label>
                <textarea
                  value={editedPurpose}
                  onChange={(e) => setEditedPurpose(e.target.value)}
                  className="w-full h-20 mt-1 p-2 rounded-lg bg-[#0c101a] border border-indigo-500/50 text-white text-xs"
                />
              </div>
            ) : (
              <div className="pt-2 border-t border-[#1a2334]">
                <div className="text-slate-400 text-[10px] uppercase font-bold">Purpose & Creative Directive</div>
                <p className="text-slate-200 mt-1 leading-relaxed text-xs">{editedPurpose}</p>
              </div>
            )}
          </div>

          {/* Section 9: Required Outputs */}
          <div className="space-y-2">
            <div className="text-slate-300 font-bold uppercase text-[10px] tracking-wider">
              Required Deliverable Outputs
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {plan.requiredOutputs.map((out, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 p-2 rounded-lg bg-[#080c14] border border-[#1a2334] text-slate-200 text-xs"
                >
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">{out}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 9: Multi-Stage Production Sequence */}
          <div className="space-y-2">
            <div className="text-slate-300 font-bold uppercase text-[10px] tracking-wider">
              Staged Generation Sequence ({plan.stages.length} Stages)
            </div>
            <div className="space-y-2">
              {plan.stages.map((stage) => (
                <div
                  key={stage.step}
                  className="p-3 rounded-xl bg-[#080c14] border border-[#1a2334] flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 font-bold flex items-center justify-center shrink-0">
                      {stage.step}
                    </span>
                    <div>
                      <div className="font-bold text-white text-xs flex items-center gap-2">
                        <span>{stage.name}</span>
                        <span className="px-1.5 py-0.2 rounded bg-[#162032] text-slate-400 text-[10px]">
                          {stage.providerCategory}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{stage.description}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-[10px] text-slate-400 shrink-0">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>~{stage.estimatedSeconds}s</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Safety Notice */}
          <div className="p-3 rounded-xl bg-[#111726] border border-[#1c2638] flex items-center gap-2.5 text-[11px] text-slate-300">
            <ShieldAlert className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>
              Generation must not begin before human approval. Once approved, the job will be routed to the registered provider and audited by the 3D Technical Validator.
            </span>
          </div>
        </div>

        {/* Actions */}
        {!isExecuting && (
          <div className="p-4 border-t border-[#1c2638] bg-[#080c14] flex items-center justify-between gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#141c2c] hover:bg-[#1a253a] text-slate-300 font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 rounded-xl bg-[#141c2c] hover:bg-[#1a253a] text-slate-200 border border-[#222f46] font-bold transition-all cursor-pointer"
              >
                {isEditing ? 'Save Edits' : 'Edit Plan'}
              </button>

              <button
                onClick={handleApprove}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Approve Plan & Begin Generation</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
