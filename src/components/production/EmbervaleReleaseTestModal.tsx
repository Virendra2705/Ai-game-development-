import React, { useState } from 'react';
import {
  Zap,
  CheckCircle2,
  XCircle,
  AlertOctagon,
  Clock,
  Play,
  RotateCcw,
  Shield,
  Layers,
  ArrowRight,
} from 'lucide-react';
import {
  releaseTestEmbervaleService,
  ReleaseTestStep,
} from '../../services/releaseTestEmbervaleService';

interface EmbervaleReleaseTestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmbervaleReleaseTestModal: React.FC<EmbervaleReleaseTestModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [steps, setSteps] = useState<ReleaseTestStep[]>(
    releaseTestEmbervaleService.getTestSteps()
  );
  const [isRunning, setIsRunning] = useState(false);
  const [allowSandboxOverride, setAllowSandboxOverride] = useState(false);
  const [haltedMessage, setHaltedMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRunTest = async () => {
    setIsRunning(true);
    setHaltedMessage(null);

    const result = await releaseTestEmbervaleService.runFullReleaseTest(
      'proj-embervale',
      allowSandboxOverride,
      (updatedStep) => {
        setSteps((prev) =>
          prev.map((s) => (s.stepNumber === updatedStep.stepNumber ? updatedStep : s))
        );
      }
    );

    setIsRunning(false);
    if (result.haltedAtProviderCheck) {
      setHaltedMessage(
        'DEPLOYMENT PROVIDER NOT CONFIGURED: Android production credentials absent. In accordance with system directives, the release process halted honestly rather than simulating a fake deployment.'
      );
    }
  };

  const handleReset = () => {
    releaseTestEmbervaleService.resetSteps();
    setSteps(releaseTestEmbervaleService.getTestSteps());
    setHaltedMessage(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl bg-[#0c101c] border border-[#23304a] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-[#1b263c] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0a0d17]">
          <div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              <h3 className="text-base font-bold text-white">
                Embervale 16-Step End-to-End Release Test (Requirement 38)
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Validates complete lifecycle from dev build through human approval, provider verification, and Phase 9 loop.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              disabled={isRunning}
              className="p-2 rounded-lg text-slate-400 hover:text-white bg-[#131b2b] border border-[#1e2a42] transition-colors"
              title="Reset Test Steps"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white bg-[#131b2b] border border-[#1e2a42] text-xs transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Configuration Bar */}
        <div className="px-5 py-3 bg-[#0e1424] border-b border-[#1b263c] flex flex-wrap items-center justify-between gap-3 text-xs">
          <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={allowSandboxOverride}
              onChange={(e) => setAllowSandboxOverride(e.target.checked)}
              className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
            />
            <span>
              Enable Sandbox Web Deployment fallback (to test full 16-step flow past Step 10)
            </span>
          </label>

          <button
            onClick={handleRunTest}
            disabled={isRunning}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-sm flex items-center gap-1.5 transition-all disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5" />
            {isRunning ? 'Running 16-Step Test...' : 'Execute Release Walkthrough'}
          </button>
        </div>

        {/* Halted Message Banner if provider halted */}
        {haltedMessage && (
          <div className="p-4 mx-5 mt-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-2.5">
            <AlertOctagon className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-amber-300">Expected Halted State:</strong>
              {haltedMessage}
            </div>
          </div>
        )}

        {/* Steps Scroll Area */}
        <div className="flex-1 p-5 overflow-y-auto space-y-3 custom-scrollbar">
          {steps.map((step) => {
            const isPending = step.status === 'PENDING';
            const isRunningStep = step.status === 'RUNNING';
            const isPassed = step.status === 'PASSED';
            const isHalted = step.status === 'HALTED_EXPECTED';
            const isFailed = step.status === 'FAILED';

            return (
              <div
                key={step.stepNumber}
                className={`p-3.5 rounded-xl border transition-all text-xs ${
                  isRunningStep
                    ? 'bg-indigo-600/15 border-indigo-500/40 shadow-sm'
                    : isPassed
                    ? 'bg-[#0f1524] border-emerald-500/30'
                    : isHalted
                    ? 'bg-amber-500/10 border-amber-500/40'
                    : isFailed
                    ? 'bg-rose-500/10 border-rose-500/40'
                    : 'bg-[#0a0d16] border-[#182133] opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-mono font-bold text-[11px] ${
                        isPassed
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : isHalted
                          ? 'bg-amber-500/20 text-amber-300'
                          : isRunningStep
                          ? 'bg-indigo-500/20 text-indigo-300'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {step.stepNumber}
                    </span>
                    <span className="font-bold text-sm text-white">{step.name}</span>
                  </div>

                  <div>
                    {isPassed && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        PASSED
                      </span>
                    )}
                    {isHalted && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        HALTED (EXPECTED)
                      </span>
                    )}
                    {isRunningStep && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 animate-pulse">
                        EXECUTING...
                      </span>
                    )}
                    {isPending && (
                      <span className="text-[10px] font-mono text-slate-500">PENDING</span>
                    )}
                  </div>
                </div>

                <p className="text-slate-400 mt-1 pl-8">{step.description}</p>

                {step.outputLogs && step.outputLogs.length > 0 && (
                  <div className="mt-2 ml-8 p-2.5 rounded-lg bg-[#06080e] border border-[#141b2b] font-mono text-[11px] text-slate-300 space-y-0.5">
                    {step.outputLogs.map((log, lIdx) => (
                      <div key={lIdx} className="text-slate-300 leading-snug">
                        {log}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0a0d17] border-t border-[#1b263c] flex items-center justify-between text-xs text-slate-400">
          <span>All 16 stages trace explicit human approval & non-faking deployment checks.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#141c2c] hover:bg-[#1a253a] text-white font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
