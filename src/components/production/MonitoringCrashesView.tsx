import React, { useState, useEffect } from 'react';
import {
  Activity,
  AlertOctagon,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  Filter,
  CheckCircle2,
  HelpCircle,
  Clock,
  Terminal,
  Layers,
  Send,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { monitoringService } from '../../services/monitoringService';
import { crashAnalysisService } from '../../services/crashAnalysisService';
import { taskService } from '../../services/taskService';
import { autonomousDevelopmentService } from '../../services/autonomousDevelopmentService';
import { CrashReport, ProductionHealthStatus } from '../../types';

export const MonitoringCrashesView: React.FC = () => {
  const { currentProject, addToast } = useApp();
  const [health, setHealth] = useState<ProductionHealthStatus | null>(null);
  const [crashes, setCrashes] = useState<CrashReport[]>([]);
  const [selectedCrash, setSelectedCrash] = useState<CrashReport | null>(null);
  const [isSimulatingTestCrash, setIsSimulatingTestCrash] = useState(false);

  useEffect(() => {
    loadData();
  }, [currentProject.id]);

  const loadData = () => {
    const h = monitoringService.getHealthStatus(currentProject.id);
    const cr = crashAnalysisService.getCrashes(currentProject.id);
    setHealth(h);
    setCrashes(cr);
    if (cr.length > 0 && !selectedCrash) {
      setSelectedCrash(cr[0]);
    }
  };

  const handleSimulateTestCrash = () => {
    setIsSimulatingTestCrash(true);
    const newCrash = crashAnalysisService.ingestCrash({
      projectId: currentProject.id,
      releaseId: 'rel-embervale-v100',
      platform: 'Android Test Sandbox',
      version: '1.0.0',
      errorType: 'AdrenoGPUBufferExhaustion',
      message: 'Out of VRAM allocating shadow cascade atlas in Sunken Mire biome [Simulated Test Ingestion]',
      stackTrace: 'at VulkanDevice.AllocateImageMemory() in VulkanDevice.cpp:412\nat GodotShadowCascade.Render()',
      frequency: 3,
      affectedUsers: 2,
      deviceInfo: 'Snapdragon 680 / Adreno 610 (Budget Android)',
      source: 'QA Sandbox',
    });

    setIsSimulatingTestCrash(false);
    loadData();
    setSelectedCrash(newCrash);

    addToast(
      'Test Crash Ingested',
      'Isolated test crash ingested & analyzed by AI Crash Service.',
      'info'
    );
  };

  const handleCreateTaskFromCrash = async (crash: CrashReport) => {
    const res = await crashAnalysisService.createIssueAndTaskFromCrash(currentProject.id, crash.id);
    if (res) {
      addToast(
        'Dispatched to Phase 9 Loop',
        `Task #${res.taskId} generated and queued into Autonomous Dev Loop.`,
        'success'
      );
      loadData();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Fleet Telemetry & Monitoring */}
      <div className="p-5 rounded-xl bg-[#0b0e17] border border-[#1a2336] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#182030]">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-400" />
              Live Fleet Telemetry & AI Crash Analysis
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Real telemetry only. If monitoring is disconnected, real status is explicitly stated without fabrication.
            </p>
          </div>

          <button
            onClick={handleSimulateTestCrash}
            disabled={isSimulatingTestCrash}
            className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#131b2d] hover:bg-[#19243d] text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5 transition-colors"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            Simulate QA Sandbox Test Crash
          </button>
        </div>

        {health && health.monitoringConfigured ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-[#0f1422] border border-[#182236]">
              <span className="text-slate-400 block text-[10px] uppercase">Service Uptime</span>
              <span className="text-xl font-bold text-emerald-400 mt-0.5 block font-mono">
                {health.availability}%
              </span>
            </div>
            <div className="p-3 rounded-lg bg-[#0f1422] border border-[#182236]">
              <span className="text-slate-400 block text-[10px] uppercase">Error Rate</span>
              <span className="text-xl font-bold text-slate-200 mt-0.5 block font-mono">
                {health.errorRate}%
              </span>
            </div>
            <div className="p-3 rounded-lg bg-[#0f1422] border border-[#182236]">
              <span className="text-slate-400 block text-[10px] uppercase">Active Incidents</span>
              <span className="text-xl font-bold text-amber-300 mt-0.5 block font-mono">
                {health.activeIncidents}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-[#0f1422] border border-[#182236]">
              <span className="text-slate-400 block text-[10px] uppercase">Open Crashes</span>
              <span className="text-xl font-bold text-rose-300 mt-0.5 block font-mono">
                {health.openCrashes}
              </span>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-lg bg-[#0f1422] border border-[#182236] text-xs text-slate-400 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-slate-500" />
            <span>Monitoring unavailable. Connect telemetry or deployment provider to view real-time data.</span>
          </div>
        )}
      </div>

      {/* Main Grid: Crash Reports List & AI Diagnostics Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Crash List */}
        <div className="p-4 rounded-xl bg-[#0b0e17] border border-[#1a2336] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#182134]">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Ingested Crash Reports</span>
            <span className="text-xs font-mono text-slate-500">{crashes.length} total</span>
          </div>

          <div className="space-y-2">
            {crashes.map((crash) => {
              const isSelected = selectedCrash?.id === crash.id;
              return (
                <button
                  key={crash.id}
                  onClick={() => setSelectedCrash(crash)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    isSelected
                      ? 'bg-rose-500/10 border-rose-500/40 text-white'
                      : 'bg-[#0f1422] hover:bg-[#141b2a] border-[#182236] text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs font-mono text-rose-300 truncate max-w-[180px]">
                      {crash.errorType}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300">
                      {crash.frequency} hits
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                    <span>{crash.platform}</span>
                    <span className="font-mono">v{crash.version}</span>
                  </div>

                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{crash.message}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Crash AI Diagnostics */}
        <div className="lg:col-span-2 space-y-5">
          {selectedCrash && (
            <div className="p-5 rounded-xl bg-[#0b0e17] border border-[#1a2336] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#182134]">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-rose-300 font-mono">{selectedCrash.errorType}</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300">
                      v{selectedCrash.version}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Affected Users: {selectedCrash.affectedUsers} • Platform: {selectedCrash.platform} • Source: {selectedCrash.source || 'Telemetry'}
                  </div>
                </div>

                <button
                  onClick={() => handleCreateTaskFromCrash(selectedCrash)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm flex items-center gap-1.5 transition-all self-start sm:self-auto"
                >
                  <Send className="w-3.5 h-3.5" />
                  Dispatch Fix Task to Phase 9 Loop
                </button>
              </div>

              {/* Stack Trace Box */}
              <div className="p-3 rounded-lg bg-[#07090e] border border-[#161f30] font-mono text-[11px] text-rose-200/90 overflow-x-auto">
                <span className="text-slate-500 block mb-1 text-[10px]">STACK TRACE:</span>
                {selectedCrash.stackTrace}
              </div>

              {/* AI Crash Analysis Box */}
              {selectedCrash.aiAnalysis && (
                <div className="p-4 rounded-xl bg-[#0e1422] border border-indigo-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      AI Crash Diagnostic Hypothesis
                    </h4>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase font-mono ${
                        selectedCrash.aiAnalysis.confidence === 'LIKELY'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : selectedCrash.aiAnalysis.confidence === 'POSSIBLE'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      Confidence: {selectedCrash.aiAnalysis.confidence}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-slate-400 font-semibold block">Likely Root Cause:</span>
                      <p className="text-slate-200 mt-0.5">{selectedCrash.aiAnalysis.likelyCause}</p>
                    </div>

                    <div>
                      <span className="text-slate-400 font-semibold block">Evidence from Code/Build:</span>
                      <p className="text-slate-300 mt-0.5 font-mono text-[11px] bg-[#07090e] p-2 rounded border border-[#161e2e]">
                        {selectedCrash.aiAnalysis.evidence}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <span className="text-slate-400 font-semibold block">Affected System:</span>
                        <span className="text-slate-300">{selectedCrash.aiAnalysis.affectedSystem}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-semibold block">Suggested Investigation:</span>
                        <span className="text-slate-300">{selectedCrash.aiAnalysis.suggestedInvestigation}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#1a253a]">
                      <span className="text-emerald-400 font-semibold block">Potential Fix:</span>
                      <p className="text-slate-200 mt-0.5">{selectedCrash.aiAnalysis.potentialFix}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
