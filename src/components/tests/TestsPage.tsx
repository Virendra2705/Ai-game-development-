import React, { useState } from 'react';
import {
  ShieldCheck,
  Play,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  RotateCcw,
  Bug,
  Activity,
  Layers,
  Sparkles,
  Filter,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TestCase } from '../../types';

export const TestsPage: React.FC = () => {
  const { tests, currentProject, runTestSuite, addToast } = useApp();
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const projectTests = tests.filter((t) => t.projectId === currentProject.id);

  const filteredTests = projectTests.filter((t) => {
    if (filterCategory !== 'all' && t.category !== filterCategory) return false;
    return true;
  });

  const passedCount = projectTests.filter((t) => t.status === 'Passed').length;
  const failedCount = projectTests.filter((t) => t.status === 'Failed').length;
  const passRate = projectTests.length > 0 ? Math.round((passedCount / projectTests.length) * 100) : 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>QA AGENT TELEMETRY</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight mt-1">
            Test Suites & Quality Assurance
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Automated gameplay assertions, collision physics validation, and performance tests for {currentProject.name}.
          </p>
        </div>

        <button
          onClick={() => runTestSuite()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-mono font-semibold text-xs shadow-[0_0_15px_rgba(99,102,241,0.25)] transition-all shrink-0 cursor-pointer"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Run Test Suite</span>
        </button>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#0c101a] border border-[#1f2a3e] space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Pass Rate</span>
          <div className="text-2xl font-bold font-mono text-emerald-400">{passRate}%</div>
          <div className="text-[10px] font-mono text-slate-400">{passedCount} of {projectTests.length} assertions</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0c101a] border border-[#1f2a3e] space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Tests Passed</span>
          <div className="text-2xl font-bold font-mono text-emerald-400">{passedCount}</div>
          <div className="text-[10px] font-mono text-slate-400">Green status</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0c101a] border border-[#1f2a3e] space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Regressions / Failures</span>
          <div className="text-2xl font-bold font-mono text-rose-400">{failedCount}</div>
          <div className="text-[10px] font-mono text-slate-400">Requires triage</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0c101a] border border-[#1f2a3e] space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase">QA Engine</span>
          <div className="text-lg font-bold font-mono text-indigo-300 mt-1">GUT Framework</div>
          <div className="text-[10px] font-mono text-slate-400">Godot Unit Testing</div>
        </div>
      </div>

      {/* Test Suites Table Section */}
      <div className="rounded-2xl bg-[#0c101a] border border-[#1f2a3e] p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white font-mono">Automated Gameplay Checks</h3>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-400">Category:</span>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-[#121827] border border-[#1f293d] text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Categories</option>
              <option value="Physics">Physics</option>
              <option value="Gameplay">Gameplay</option>
              <option value="Input">Input</option>
              <option value="Memory">Memory</option>
              <option value="Performance">Performance</option>
            </select>
          </div>
        </div>

        {/* Test Cases List */}
        <div className="space-y-2.5">
          {filteredTests.map((test) => (
            <div
              key={test.id}
              className="p-4 rounded-xl bg-[#0f1422] hover:bg-[#131929] border border-[#1d273a] hover:border-[#2b3952] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`p-1 rounded-md ${
                      test.status === 'Passed'
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : 'bg-rose-500/15 text-rose-400'
                    }`}
                  >
                    {test.status === 'Passed' ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                  </span>
                  <span className="font-bold text-xs text-white font-mono">{test.name}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#182133] border border-[#243048] text-slate-300">
                    {test.category}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400 pl-7">
                  <span>Duration: {test.duration}</span>
                  <span>•</span>
                  <span>Last run {test.lastRun}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center pl-7 sm:pl-0">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-mono font-semibold ${
                    test.status === 'Passed'
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {test.status}
                </span>

                <button
                  onClick={() => {
                    addToast('Re-running test', `Executing assertion for "${test.name}"`, 'info');
                  }}
                  className="p-2 rounded-lg bg-[#151c2a] hover:bg-[#1f293d] text-slate-300 border border-[#243048] transition-colors"
                  title="Rerun single test"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bug Reports Section */}
      <div className="rounded-2xl bg-[#0c101a] border border-[#1f2a3e] p-5 sm:p-6 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bug className="w-5 h-5 text-rose-400" />
            <h3 className="text-base font-bold text-white font-mono">
              QA Agent Incident Reports (1 Open)
            </h3>
          </div>

          <button
            onClick={() => {
              addToast('Report Filed', 'Ticket auto-assigned to Debug Agent.', 'info');
            }}
            className="text-xs font-mono text-indigo-400 hover:text-indigo-300"
          >
            + File Manual Bug
          </button>
        </div>

        <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/30 text-rose-300 font-bold">
                HIGH SEVERITY
              </span>
              <span className="text-xs font-bold text-white font-mono">
                Memory leak in terrain tile chunk loader
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Assigned: Debug Agent</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            When streaming chunk LOD transitions between Zone 1 and Zone 2, unreferenced MeshInstances retain 24MB VRAM on Android Mali GPUs.
          </p>
        </div>
      </div>
    </div>
  );
};
