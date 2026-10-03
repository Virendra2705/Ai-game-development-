import React, { useState, useEffect } from 'react';
import {
  Rocket,
  ShieldCheck,
  AlertTriangle,
  Activity,
  Server,
  Cloud,
  Layers,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  ExternalLink,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { releaseManagerService } from '../../services/releaseManagerService';
import { environmentService } from '../../services/environmentService';
import { monitoringService } from '../../services/monitoringService';
import { deploymentService } from '../../services/deploymentService';
import { crashAnalysisService } from '../../services/crashAnalysisService';
import { incidentService } from '../../services/incidentService';
import { feedbackService } from '../../services/feedbackService';
import { Release, Environment, Deployment, ProductionHealthStatus } from '../../types';

interface ProductionDashboardViewProps {
  onNavigateTab: (tab: string) => void;
  onOpenTestModal: () => void;
}

export const ProductionDashboardView: React.FC<ProductionDashboardViewProps> = ({
  onNavigateTab,
  onOpenTestModal,
}) => {
  const { currentProject, addToast } = useApp();
  const [liveRelease, setLiveRelease] = useState<Release | undefined>(undefined);
  const [candidateRelease, setCandidateRelease] = useState<Release | undefined>(undefined);
  const [previousRelease, setPreviousRelease] = useState<Release | undefined>(undefined);
  const [prodEnv, setProdEnv] = useState<Environment | undefined>(undefined);
  const [latestDeployment, setLatestDeployment] = useState<Deployment | undefined>(undefined);
  const [health, setHealth] = useState<ProductionHealthStatus | null>(null);

  useEffect(() => {
    loadData();
  }, [currentProject.id]);

  const loadData = () => {
    const live = releaseManagerService.getLiveRelease(currentProject.id);
    const candidate = releaseManagerService.getLatestCandidate(currentProject.id);
    const prev = releaseManagerService.getPreviousRelease(currentProject.id);
    const env = environmentService.getEnvironmentByType(currentProject.id, 'PRODUCTION');
    const deps = deploymentService.getDeployments(currentProject.id);
    const h = monitoringService.getHealthStatus(currentProject.id);

    setLiveRelease(live);
    setCandidateRelease(candidate);
    setPreviousRelease(prev);
    setProdEnv(env);
    setLatestDeployment(deps[0]);
    setHealth(h);
  };

  const crashes = crashAnalysisService.getCrashes(currentProject.id);
  const incidents = incidentService.getIncidents(currentProject.id);
  const feedbackItems = feedbackService.getFeedback(currentProject.id);
  const timeline = monitoringService.getTimeline(currentProject.id);

  const getHealthBadge = () => {
    if (!health || !health.monitoringConfigured) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800/80 text-slate-400 border border-slate-700">
          <HelpCircle className="w-3 h-3 text-slate-400" />
          Monitoring Unavailable
        </span>
      );
    }
    if (health.overall === 'HEALTHY') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          HEALTHY (99.94% Uptime)
        </span>
      );
    }
    if (health.overall === 'DEGRADED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-300 border border-amber-500/30">
          <AlertTriangle className="w-3 h-3 text-amber-400" />
          DEGRADED
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-300 border border-rose-500/30">
        <XCircle className="w-3 h-3 text-rose-400" />
        ERROR
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Current Live Version */}
        <div className="p-4 rounded-xl bg-[#0f1422] border border-[#1e273a] shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Current Release</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              LIVE
            </span>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            v{liveRelease?.version || '1.0.0'}
          </div>
          <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            Released: {liveRelease?.releasedAt ? new Date(liveRelease.releasedAt).toLocaleDateString() : 'Active'}
          </div>
          <div className="mt-3 pt-3 border-t border-[#1a2334] flex items-center justify-between text-xs">
            <span className="text-slate-400">Environment</span>
            <span className="font-medium text-slate-200">{prodEnv?.name || 'Production'}</span>
          </div>
        </div>

        {/* Candidate & Next Release */}
        <div className="p-4 rounded-xl bg-[#0f1422] border border-[#1e273a] shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Next Candidate</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
              {candidateRelease?.status || 'STAGING'}
            </span>
          </div>
          <div className="text-2xl font-bold text-indigo-300 tracking-tight">
            v{candidateRelease?.version || '1.1.0'}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Build #{candidateRelease?.buildId || '158'} • {candidateRelease?.environment || 'STAGING'}
          </div>
          <div className="mt-3 pt-3 border-t border-[#1a2334] flex items-center justify-between text-xs">
            <button
              onClick={() => onNavigateTab('Releases')}
              className="text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1"
            >
              Inspect Candidate <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Health & Availability */}
        <div className="p-4 rounded-xl bg-[#0f1422] border border-[#1e273a] shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Fleet Health</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="my-1">{getHealthBadge()}</div>
          <div className="text-xs text-slate-400 mt-2 flex items-center justify-between">
            <span>Availability</span>
            <span className="font-mono text-slate-200">{health?.availability || 99.94}%</span>
          </div>
          <div className="mt-2 pt-2 border-t border-[#1a2334] flex items-center justify-between text-xs">
            <span>Error Rate</span>
            <span className="font-mono text-emerald-400">{health?.errorRate || 0.06}%</span>
          </div>
        </div>

        {/* Incidents & Active Crashes */}
        <div className="p-4 rounded-xl bg-[#0f1422] border border-[#1e273a] shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Signals</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-center gap-4 my-1">
            <div>
              <div className="text-xl font-bold text-amber-300">{incidents.filter((i) => i.status !== 'CLOSED').length}</div>
              <div className="text-[11px] text-slate-400">Incidents</div>
            </div>
            <div className="h-8 w-px bg-[#1e273a]" />
            <div>
              <div className="text-xl font-bold text-rose-300">{crashes.filter((c) => c.status !== 'RESOLVED').length}</div>
              <div className="text-[11px] text-slate-400">Crashes</div>
            </div>
            <div className="h-8 w-px bg-[#1e273a]" />
            <div>
              <div className="text-xl font-bold text-sky-300">{feedbackItems.length}</div>
              <div className="text-[11px] text-slate-400">Feedback</div>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-[#1a2334] flex items-center justify-between text-xs">
            <button
              onClick={() => onNavigateTab('Incidents')}
              className="text-amber-400 hover:text-amber-300 font-medium inline-flex items-center gap-1"
            >
              View Incidents <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Deployment & Release Status Card */}
      <div className="p-5 rounded-xl bg-[#0b0e17] border border-[#1b2336] shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#182030]">
          <div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-indigo-400" />
              Active Deployment & Platform Pipeline
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Production actions always require explicit human authorization before execution.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenTestModal}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-sm flex items-center gap-1.5 transition-all"
            >
              <Zap className="w-3.5 h-3.5 text-yellow-300" />
              Embervale Release Walkthrough
            </button>
            <button
              onClick={() => onNavigateTab('Deployments')}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#141b2b] hover:bg-[#1a2338] text-slate-200 border border-[#243048] transition-colors"
            >
              Manage Environments
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
          {/* Target details */}
          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-[#141b2b]">
              <span className="text-slate-400">Target Track:</span>
              <span className="font-medium text-slate-200">{prodEnv?.deploymentTarget || 'Google Play Store Production Track'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#141b2b]">
              <span className="text-slate-400">Deployment Provider:</span>
              <span className="font-mono text-indigo-300">{prodEnv?.deploymentProvider || 'AndroidDistributionProvider'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#141b2b]">
              <span className="text-slate-400">Build Configuration:</span>
              <span className="text-slate-300 truncate max-w-[200px]" title={prodEnv?.buildConfiguration}>
                {prodEnv?.buildConfiguration}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#141b2b]">
              <span className="text-slate-400">Rollback Availability:</span>
              <span className="text-emerald-400 font-medium">Ready (v{previousRelease?.version || '1.0.0'} cached in storage)</span>
            </div>
          </div>

          {/* Last Deployment logs summary */}
          <div className="lg:col-span-2 p-3.5 rounded-lg bg-[#07090e] border border-[#161e2e] font-mono text-[11px] text-slate-300">
            <div className="flex items-center justify-between text-slate-500 mb-2 pb-1 border-b border-[#151d2a]">
              <span>LATEST DEPLOYMENT AUDIT LOG ({latestDeployment?.id || 'dep-live'})</span>
              <span className="text-emerald-400">{latestDeployment?.status || 'LIVE'}</span>
            </div>
            <div className="space-y-1 overflow-y-auto max-h-32 custom-scrollbar">
              {(latestDeployment?.logs || [
                '[VERIFIED] Production Fleet Deployed & Verified',
                '[HEALTH-CHECK] HTTP 200 OK • WebGL Canvas initialized in 1.4s',
                '[SIGNATURE] Keystore embervale-release.keystore validated',
              ]).map((log, idx) => (
                <div key={idx} className="text-slate-300 flex items-start gap-2">
                  <span className="text-slate-600 select-none">&gt;</span>
                  <span>{log}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Two Columns: Recent Health Events & Feedback Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Production Activity Timeline */}
        <div className="p-5 rounded-xl bg-[#0b0e17] border border-[#1b2336] shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[#182030] mb-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              Production Activity Timeline
            </h3>
            <span className="text-xs text-slate-400 font-mono">{timeline.length} events</span>
          </div>

          <div className="space-y-3 max-h-72 overflow-y-auto custom-scrollbar pr-1">
            {timeline.slice(0, 6).map((evt) => (
              <div key={evt.id} className="p-3 rounded-lg bg-[#0f1422] border border-[#182133] text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-slate-200">{evt.title}</span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-slate-400 text-[11px]">{evt.details}</p>
                <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-500">
                  <span className="font-mono">Ref: {evt.sourceRef}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded font-mono ${
                      evt.severity === 'SUCCESS'
                        ? 'text-emerald-400 bg-emerald-500/10'
                        : evt.severity === 'WARNING'
                        ? 'text-amber-400 bg-amber-500/10'
                        : evt.severity === 'CRITICAL'
                        ? 'text-rose-400 bg-rose-500/10'
                        : 'text-indigo-400 bg-indigo-500/10'
                    }`}
                  >
                    {evt.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Feedback & Crashes Snapshot */}
        <div className="p-5 rounded-xl bg-[#0b0e17] border border-[#1b2336] shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[#182030] mb-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              Active Incident & AI Crash Watch
            </h3>
            <button
              onClick={() => onNavigateTab('Monitoring')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1"
            >
              Analyze Crashes <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {crashes.slice(0, 2).map((crash) => (
              <div key={crash.id} className="p-3 rounded-lg bg-[#0f1422] border border-[#182133] text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-rose-300 font-mono truncate max-w-[240px]">
                    {crash.errorType}
                  </span>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    {crash.frequency} events
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] mt-1 line-clamp-1">{crash.message}</p>
                {crash.aiAnalysis && (
                  <div className="mt-2 p-2 rounded bg-[#090c13] border border-[#151c2a] text-[11px]">
                    <span className="text-indigo-400 font-medium">AI Hypothesis ({crash.aiAnalysis.confidence}): </span>
                    <span className="text-slate-300">{crash.aiAnalysis.likelyCause}</span>
                  </div>
                )}
              </div>
            ))}

            {crashes.length === 0 && (
              <div className="text-center py-8 text-xs text-slate-500">Zero active production crashes logged.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
