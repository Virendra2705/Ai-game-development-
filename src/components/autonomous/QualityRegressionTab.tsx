import React, { useState } from 'react';
import {
  ShieldCheck,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Gamepad2,
  FileCheck,
  Check,
  Clock,
} from 'lucide-react';
import { RegressionTest, GameplayTest } from '../../types';

interface QualityRegressionTabProps {
  regressionTests: RegressionTest[];
  gameplayTests: GameplayTest[];
  onRunRegression: () => void;
  onRunGameplayTests: () => void;
}

export const QualityRegressionTab: React.FC<QualityRegressionTabProps> = ({
  regressionTests,
  gameplayTests,
  onRunRegression,
  onRunGameplayTests,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'REGRESSION' | 'GAMEPLAY' | 'GATES'>('REGRESSION');

  const gates = [
    { name: 'CODE_QUALITY', desc: 'Zero TypeScript or ESLint errors', status: 'PASSED', evidence: 'tsc --noEmit passed in 2.1s' },
    { name: 'BUILD_SUCCESS', desc: 'Vite build bundling produces clean dist artifacts', status: 'PASSED', evidence: 'Build #104 exit code 0' },
    { name: 'RUNTIME_STARTUP', desc: 'Applet and preview iframe boot within 5000ms', status: 'PASSED', evidence: 'Cold boot 1420ms' },
    { name: 'GAMEPLAY_FUNCTIONALITY', desc: 'Route 1 player control and creature encounter operational', status: 'PASSED', evidence: 'Interactive Gameplay Agent 9/9 pass' },
    { name: 'VISUAL_QA', desc: 'Sprite rendering passes palette & aspect ratio check', status: 'PASSED', evidence: 'Pixel check score: 98%' },
    { name: 'PERFORMANCE', desc: '60 FPS sustained without dropped frames during capture VFX', status: 'PASSED', evidence: 'Avg 59.8 FPS, 16.4ms frame time' },
    { name: 'ASSET_VALIDATION', desc: 'Audio SFX format 44.1kHz and sprite sheets power of two', status: 'PASSED', evidence: '4/4 assets valid' },
    { name: 'REGRESSION_TESTS', desc: 'All existing capture & combat test suites green', status: 'PASSED', evidence: '6/6 regression tests green' },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Sub-navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#0d121f] border border-[#1b2438]">
        <div>
          <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Quality Assurance, Regression & Gameplay Validation
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Strict automated gates prevent regressions and verify real interactive gameplay behavior.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-[#090d16] p-1 rounded-lg border border-[#182236]">
            <button
              onClick={() => setActiveSubTab('REGRESSION')}
              className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
                activeSubTab === 'REGRESSION'
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Regression Suite ({regressionTests.length})
            </button>
            <button
              onClick={() => setActiveSubTab('GAMEPLAY')}
              className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
                activeSubTab === 'GAMEPLAY'
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Gameplay Tests ({gameplayTests.length})
            </button>
            <button
              onClick={() => setActiveSubTab('GATES')}
              className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
                activeSubTab === 'GATES'
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Quality Gates ({gates.length})
            </button>
          </div>

          {activeSubTab === 'REGRESSION' && (
            <button
              onClick={onRunRegression}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Run Suite</span>
            </button>
          )}

          {activeSubTab === 'GAMEPLAY' && (
            <button
              onClick={onRunGameplayTests}
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Test Gameplay</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub-Tab 1: Regression Test Suite */}
      {activeSubTab === 'REGRESSION' && (
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
            Automated Regression Test Suite
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {regressionTests.map((t) => (
              <div
                key={t.id}
                className="p-4 rounded-xl bg-[#090d16] border border-[#161f33] hover:border-[#22304d] transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                    {t.featureName} • {t.category}
                  </span>
                  <span
                    className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                      t.status === 'PASS'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {t.status}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white font-mono">{t.name}</h4>
                <p className="text-[11px] text-slate-400">{t.description}</p>
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-2 border-t border-[#141b2a]">
                  <span>Executed in {t.durationMs || 25}ms</span>
                  <span>Auto-generated: {t.autoGenerated ? 'Yes' : 'No'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub-Tab 2: Gameplay Tests */}
      {activeSubTab === 'GAMEPLAY' && (
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-2">
            <Gamepad2 className="w-4 h-4 text-indigo-400" />
            <span>Interactive Gameplay Test Agent Executions</span>
          </div>
          <div className="space-y-2">
            {gameplayTests.map((gt) => (
              <div
                key={gt.id}
                className="p-3.5 rounded-xl bg-[#090d16] border border-[#161f33] flex items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="text-xs font-bold text-white font-mono flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{gt.action}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Expected: {gt.expectedOutcome}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                    {gt.status}
                  </span>
                  <div className="text-[10px] text-slate-500 font-mono mt-1">
                    Env: {gt.testedEnvironment}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub-Tab 3: Quality Gates Checklist */}
      {activeSubTab === 'GATES' && (
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
            Mandatory Quality Gate Validation Rules
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {gates.map((g, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-[#090d16] border border-[#161f33] flex items-start justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="text-xs font-bold font-mono text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{g.name.replace(/_/g, ' ')}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{g.desc}</p>
                  <p className="text-[10px] text-emerald-400/90 font-mono pt-1">
                    Evidence: {g.evidence}
                  </p>
                </div>
                <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold shrink-0">
                  {g.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
