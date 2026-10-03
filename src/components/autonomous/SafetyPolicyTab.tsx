import React, { useState } from 'react';
import {
  Shield,
  Sliders,
  Check,
  AlertTriangle,
  Lock,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { AutonomousSafetyPolicy } from '../../types';

interface SafetyPolicyTabProps {
  policy: AutonomousSafetyPolicy;
  onUpdatePolicy: (updated: Partial<AutonomousSafetyPolicy>) => void;
}

export const SafetyPolicyTab: React.FC<SafetyPolicyTabProps> = ({
  policy,
  onUpdatePolicy,
}) => {
  const [maxRuntime, setMaxRuntime] = useState(policy.maxRuntimeMinutes);
  const [maxIterations, setMaxIterations] = useState(policy.maxIterations);
  const [maxRetries, setMaxRetries] = useState(policy.maxRetries);
  const [autoBuild, setAutoBuild] = useState(policy.autoBuild);
  const [autoQA, setAutoQA] = useState(policy.autoQA);
  const [autoFix, setAutoFix] = useState(policy.autoFix);
  const [requireArch, setRequireArch] = useState(policy.requireApprovalForArchitecture);
  const [requireScope, setRequireScope] = useState(policy.requireApprovalForScope);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePolicy({
      maxRuntimeMinutes: Number(maxRuntime),
      maxIterations: Number(maxIterations),
      maxRetries: Number(maxRetries),
      autoBuild,
      autoQA,
      autoFix,
      requireApprovalForArchitecture: requireArch,
      requireApprovalForScope: requireScope,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#0d121f] border border-[#1b2438]">
        <div>
          <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            Autonomous Safety Policy & Guardrails
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Hard system constraints guaranteeing non-infinite autonomous loops and human-gated control.
          </p>
        </div>
        <button
          type="submit"
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold flex items-center gap-2 transition-colors shadow-sm"
        >
          {isSaved ? <Check className="w-4 h-4 text-emerald-300" /> : <Lock className="w-4 h-4" />}
          <span>{isSaved ? 'Policy Saved' : 'Save Safety Policy'}</span>
        </button>
      </div>

      {/* Ceiling Knobs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[#090d16] border border-[#161f33] space-y-2">
          <label className="text-xs font-mono text-slate-400 block uppercase font-bold">
            Max Autonomous Runtime (Minutes)
          </label>
          <input
            type="number"
            min={5}
            max={180}
            value={maxRuntime}
            onChange={(e) => setMaxRuntime(Number(e.target.value))}
            className="w-full px-3 py-2 bg-[#0c101a] border border-[#1c263b] rounded-lg text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
          />
          <p className="text-[10px] text-slate-500 font-mono">
            Autonomous loop strictly halts when runtime expires.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#090d16] border border-[#161f33] space-y-2">
          <label className="text-xs font-mono text-slate-400 block uppercase font-bold">
            Max Iterations Limit
          </label>
          <input
            type="number"
            min={1}
            max={50}
            value={maxIterations}
            onChange={(e) => setMaxIterations(Number(e.target.value))}
            className="w-full px-3 py-2 bg-[#0c101a] border border-[#1c263b] rounded-lg text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
          />
          <p className="text-[10px] text-slate-500 font-mono">
            Maximum agent loop turns before mandatory evaluation.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#090d16] border border-[#161f33] space-y-2">
          <label className="text-xs font-mono text-slate-400 block uppercase font-bold">
            Max Consecutive Debug Retries
          </label>
          <input
            type="number"
            min={1}
            max={5}
            value={maxRetries}
            onChange={(e) => setMaxRetries(Number(e.target.value))}
            className="w-full px-3 py-2 bg-[#0c101a] border border-[#1c263b] rounded-lg text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
          />
          <p className="text-[10px] text-slate-500 font-mono">
            Prevents infinite loop thrashing on unresolvable bugs.
          </p>
        </div>
      </div>

      {/* Autonomous Automation Toggles */}
      <div className="p-5 rounded-xl bg-[#090d16] border border-[#161f33] space-y-4">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
          Automated Pipeline Permissions
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex items-start gap-3 p-3 rounded-lg bg-[#0c101b] border border-[#162035] cursor-pointer hover:border-[#223152] transition-colors">
            <input
              type="checkbox"
              checked={autoBuild}
              onChange={(e) => setAutoBuild(e.target.checked)}
              className="mt-1 accent-indigo-600 rounded"
            />
            <div>
              <div className="text-xs font-bold font-mono text-white">Automated Build Compilation</div>
              <p className="text-[11px] text-slate-400">
                Trigger build and bundling pipeline after code changes.
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3 rounded-lg bg-[#0c101b] border border-[#162035] cursor-pointer hover:border-[#223152] transition-colors">
            <input
              type="checkbox"
              checked={autoQA}
              onChange={(e) => setAutoQA(e.target.checked)}
              className="mt-1 accent-indigo-600 rounded"
            />
            <div>
              <div className="text-xs font-bold font-mono text-white">Automated QA & Playtest Verification</div>
              <p className="text-[11px] text-slate-400">
                Run regression test suites and gameplay test agents automatically.
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3 rounded-lg bg-[#0c101b] border border-[#162035] cursor-pointer hover:border-[#223152] transition-colors">
            <input
              type="checkbox"
              checked={autoFix}
              onChange={(e) => setAutoFix(e.target.checked)}
              className="mt-1 accent-indigo-600 rounded"
            />
            <div>
              <div className="text-xs font-bold font-mono text-white">Automated Debug Agent Self-Healing</div>
              <p className="text-[11px] text-slate-400">
                Allow AI Debug Agent to fix compilation/QA syntax errors (capped at max retries).
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3 rounded-lg bg-[#0c101b] border border-[#162035] cursor-pointer hover:border-[#223152] transition-colors">
            <input
              type="checkbox"
              checked={requireArch}
              onChange={(e) => setRequireArch(e.target.checked)}
              className="mt-1 accent-indigo-600 rounded"
            />
            <div>
              <div className="text-xs font-bold font-mono text-white">Mandatory Architecture Approval Gate</div>
              <p className="text-[11px] text-slate-400">
                Always pause for human lead signoff before modifying core engine state machines.
              </p>
            </div>
          </label>
        </div>
      </div>
    </form>
  );
};
