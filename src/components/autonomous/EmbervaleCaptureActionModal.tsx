import React, { useState } from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert,
  Play,
  Hammer,
  Bug,
  RotateCcw,
  Zap,
} from 'lucide-react';

interface EmbervaleCaptureActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRunGoal: () => void;
}

export const EmbervaleCaptureActionModal: React.FC<EmbervaleCaptureActionModalProps> = ({
  isOpen,
  onClose,
  onRunGoal,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isRunning, setIsRunning] = useState(false);

  if (!isOpen) return null;

  const steps = [
    { num: 1, title: 'Ingest Goal', desc: '«Make the Sparkit capture feature fully playable.» ingested into Master Orchestrator.' },
    { num: 2, title: 'Query Knowledge Base', desc: 'Retrieved Sparkit species sheet, Rift Trap capture formula, and Route 1 encounter tables.' },
    { num: 3, title: 'Generate Milestones', desc: 'Created 6 milestones with 8 mandatory quality gates and dependency checks.' },
    { num: 4, title: 'Assign Tasks to Agents', desc: 'Lead Designer -> Stats; Pixel Artist -> Sprites; Lead Programmer -> Engine Controller.' },
    { num: 5, title: 'Produce Code & Assets', desc: 'Generated 32x32 sprite sheet, trap SFX, CaptureManager.ts, and capture rate curve.' },
    { num: 6, title: 'Trigger Build', desc: 'Executed Vite build & bundle. Dist bundle compiled with zero fatal type errors.' },
    { num: 7, title: 'Launch Preview', desc: 'WebGL Canvas initialized at 60 FPS in Route 1 tall grass test arena.' },
    { num: 8, title: 'Run QA & Gameplay Tests', desc: 'Interactive Gameplay Agent executed 9 tests. Encounter & trap throw succeeded.' },
    { num: 9, title: 'Detect Bug', desc: 'Visual bug: Sparkit continues lightning orb cast while inside locked Rift Trap.' },
    { num: 10, title: 'AI Debug Agent Fix', desc: 'Diagnosed race condition: CombatEngine tick loop was not listening to capture state.' },
    { num: 11, title: 'Rebuild', desc: 'Targeted patch applied to CreatureStateMachine.ts. Build #105 passed.' },
    { num: 12, title: 'Re-test', desc: 'Regression test #reg-cap-03 passed. Attack cast cleanly interrupted on trap trigger.' },
    { num: 13, title: 'Quality Gates Satisfied', desc: 'All 8 quality gates passed (Code Quality, Startup, Visual QA, Regression).' },
    { num: 14, title: 'Propose Next Improvement', desc: 'Improvement Agent proposed: "Batch Sprite Draw Calls for Tall Grass Blades".' },
    { num: 15, title: 'Human Approval Gate', desc: 'Autonomous loop paused at high-impact architecture boundary for lead review.' },
  ];

  const handleStepSimulation = () => {
    setIsRunning(true);
    let step = 1;
    const interval = setInterval(() => {
      step++;
      if (step > 15) {
        clearInterval(interval);
        setIsRunning(false);
      } else {
        setCurrentStep(step);
      }
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-[#0c101a] border border-[#1e2638] rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e2638] bg-[#111726]">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white font-mono">
                  Embervale Autonomous Test Execution
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-amber-500/20 text-amber-300 uppercase border border-amber-500/30">
                  Phase 9 Mandate
                </span>
              </div>
              <p className="text-xs text-slate-400">«Make the Sparkit capture feature fully playable.»</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#182033] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content: 15-step Continuous Loop Journey */}
        <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
          <div className="flex items-center justify-between pb-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
              15-Step Continuous Autonomous Pipeline
            </div>
            <button
              onClick={handleStepSimulation}
              disabled={isRunning}
              className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{isRunning ? 'Executing Steps...' : 'Simulate 15 Steps'}</span>
            </button>
          </div>

          <div className="space-y-2">
            {steps.map((s) => {
              const isDone = s.num <= currentStep;
              const isCurrent = s.num === currentStep;

              return (
                <div
                  key={s.num}
                  className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                    isCurrent
                      ? 'bg-amber-950/30 border-amber-500 ring-2 ring-amber-500/20'
                      : isDone
                      ? 'bg-[#0e1424] border-[#1a2640] text-slate-300'
                      : 'bg-[#080b12] border-[#131b2b] text-slate-600 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold ${
                        isDone ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : s.num}
                    </div>
                    <div>
                      <div className="text-xs font-bold font-mono text-white flex items-center gap-2">
                        <span>{s.title}</span>
                        {isCurrent && (
                          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{s.desc}</p>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-slate-500">
                    Step {s.num}/15
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#1e2638] bg-[#0c101a] flex items-center justify-between">
          <div className="text-[11px] font-mono text-slate-400">
            Current Status:{' '}
            <span className="text-amber-300 font-bold">
              {currentStep === 15 ? 'PAUSED AT HUMAN APPROVAL GATE' : 'ACTIVE IN RUN'}
            </span>
          </div>
          <button
            onClick={() => {
              onRunGoal();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold transition-colors"
          >
            Load into Active Run Controller
          </button>
        </div>
      </div>
    </div>
  );
};
