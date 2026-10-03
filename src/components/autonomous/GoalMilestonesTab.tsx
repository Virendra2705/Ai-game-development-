import React, { useState } from 'react';
import {
  Layers,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  ListTodo,
} from 'lucide-react';
import { DevelopmentGoal, Milestone, QualityGate } from '../../types';

interface GoalMilestonesTabProps {
  goals: DevelopmentGoal[];
  milestones: Milestone[];
  onCreateGoal: (title: string, description: string, targetOutcome: string) => void;
}

export const GoalMilestonesTab: React.FC<GoalMilestonesTabProps> = ({
  goals,
  milestones,
  onCreateGoal,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newTargetOutcome, setNewTargetOutcome] = useState('');
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(
    milestones[2] || milestones[0] || null
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onCreateGoal(newTitle, newDescription, newTargetOutcome);
    setNewTitle('');
    setNewDescription('');
    setNewTargetOutcome('');
    setIsCreating(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Goal Summary & Create Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#0d121f] border border-[#1b2438]">
        <div>
          <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            Development Goals & Measurable Milestones
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            High-level objectives automatically decomposed into sequential milestones with verified quality gates.
          </p>
        </div>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Goal</span>
        </button>
      </div>

      {/* Goal Creator Form */}
      {isCreating && (
        <form
          onSubmit={handleSubmit}
          className="p-5 rounded-xl bg-[#0e1424] border border-indigo-500/40 space-y-4 animate-in fade-in duration-200"
        >
          <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider font-mono">
            Define New High-Level Goal
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-mono">Goal Title / Prompt</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Make the first Embervale region playable"
                className="w-full px-3 py-2 bg-[#090d16] border border-[#1d273d] rounded-lg text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-mono">Target Measurable Outcome</label>
              <input
                type="text"
                value={newTargetOutcome}
                onChange={(e) => setNewTargetOutcome(e.target.value)}
                placeholder="e.g. Player traverses Route 1, encounters wild creatures, and initiates battle."
                className="w-full px-3 py-2 bg-[#090d16] border border-[#1d273d] rounded-lg text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-slate-400 font-mono">Detailed Requirements & Context</label>
            <textarea
              rows={2}
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Specify scope boundaries, assets required, and constraints."
              className="w-full px-3 py-2 bg-[#090d16] border border-[#1d273d] rounded-lg text-xs text-white font-mono focus:outline-none focus:border-indigo-500 custom-scrollbar"
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white text-xs font-mono"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold font-mono transition-colors"
            >
              Decompose into Milestones
            </button>
          </div>
        </form>
      )}

      {/* Main Grid: Milestones list & Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Milestones List */}
        <div className="lg:col-span-6 space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
            Milestone Sequence ({milestones.length})
          </div>
          <div className="space-y-2.5 max-h-[600px] overflow-y-auto custom-scrollbar pr-1">
            {milestones.map((ms) => {
              const isSelected = selectedMilestone?.id === ms.id;
              const isCompleted = ms.status === 'COMPLETED';
              const isInProgress = ms.status === 'IN_PROGRESS';

              return (
                <div
                  key={ms.id}
                  onClick={() => setSelectedMilestone(ms)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/20'
                      : 'bg-[#0a0e18] border-[#161f33] hover:border-[#22304e]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-mono text-slate-300 font-bold">
                        {ms.orderIndex}
                      </span>
                      <span className="text-xs font-bold font-mono text-white truncate max-w-[220px]">
                        {ms.name}
                      </span>
                    </div>
                    <span
                      className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                        isCompleted
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : isInProgress
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 animate-pulse'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {ms.status}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 mt-1.5 line-clamp-2">{ms.description}</p>

                  <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <div className="flex items-center gap-2">
                      <span>{ms.qualityGates.filter((g) => g.passed).length}/{ms.qualityGates.length} Gates</span>
                    </div>
                    <span>{ms.progress}% Complete</span>
                  </div>

                  <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isCompleted ? 'bg-emerald-500' : 'bg-indigo-500'
                      }`}
                      style={{ width: `${ms.progress}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Milestone Inspector */}
        <div className="lg:col-span-6 bg-[#0c101b] border border-[#1b2438] rounded-xl p-5 flex flex-col h-[640px] overflow-y-auto custom-scrollbar space-y-5">
          {selectedMilestone ? (
            <>
              <div className="border-b border-[#1b2438] pb-4 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                    Milestone #{selectedMilestone.orderIndex}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    ID: {selectedMilestone.id}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white font-mono">{selectedMilestone.name}</h3>
                <p className="text-xs text-slate-300">{selectedMilestone.description}</p>
              </div>

              {/* Acceptance Criteria */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                  Acceptance Criteria
                </h4>
                <ul className="space-y-1.5">
                  {selectedMilestone.acceptanceCriteria.map((crit, idx) => (
                    <li
                      key={idx}
                      className="p-2 rounded-lg bg-[#090d16] border border-[#151d30] text-xs text-slate-300 flex items-start gap-2"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{crit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Quality Gates Checklist */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Mandatory Quality Gates ({selectedMilestone.qualityGates.length})</span>
                  </h4>
                  <span className="text-[10px] font-mono text-slate-500">Must pass to complete</span>
                </div>
                <div className="space-y-1.5">
                  {selectedMilestone.qualityGates.map((gate) => (
                    <div
                      key={gate.id}
                      className="p-2.5 rounded-lg bg-[#090d16] border border-[#161f33] flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs font-bold font-mono text-slate-200">{gate.name}</div>
                        <div className="text-[10px] text-slate-400">{gate.description}</div>
                      </div>
                      <span
                        className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                          gate.passed
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {gate.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500 text-xs font-mono">
              Select a milestone to inspect details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
