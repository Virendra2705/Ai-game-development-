import React, { useState, useEffect, useRef } from 'react';
import {
  Hammer,
  Play,
  RotateCcw,
  XCircle,
  Clock,
  Terminal,
  Search,
  Download,
  AlertTriangle,
  CheckCircle2,
  Filter,
  ShieldCheck,
  ChevronDown,
  Layers,
  Sparkles,
  Sliders,
  FileCode,
  Lock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { buildPipelineService } from '../../services/build/buildPipelineService';
import { BuildJob, BuildProfile, ProjectDetectionResult } from '../../types';

interface BuildCenterPanelProps {
  onBuildComplete?: (job: BuildJob) => void;
  onOpenPreview?: () => void;
}

export const BuildCenterPanel: React.FC<BuildCenterPanelProps> = ({
  onBuildComplete,
  onOpenPreview,
}) => {
  const { currentProject, addToast } = useApp();
  const [jobs, setJobs] = useState<BuildJob[]>(buildPipelineService.getJobs(currentProject.id));
  const [activeJobId, setActiveJobId] = useState<string | null>(jobs[0]?.id || null);
  const [profiles, setProfiles] = useState<BuildProfile[]>(buildPipelineService.getProfilesForProject(currentProject.id));
  const [selectedProfileId, setSelectedProfileId] = useState<string>(profiles[0]?.id || '');
  const [searchLogQuery, setSearchLogQuery] = useState('');
  const [pauseAutoScroll, setPauseAutoScroll] = useState(false);
  const [selectedLogLevel, setSelectedLogLevel] = useState<'ALL' | 'INFO' | 'WARN' | 'ERROR' | 'STEP'>('ALL');
  const [detection, setDetection] = useState<ProjectDetectionResult>(
    buildPipelineService.detectProjectType(currentProject)
  );

  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = buildPipelineService.subscribe((allJobs) => {
      const filtered = allJobs.filter((j) => j.projectId === currentProject.id);
      setJobs(filtered);
      if (!activeJobId && filtered.length > 0) {
        setActiveJobId(filtered[0].id);
      }
    });
    return () => unsubscribe();
  }, [currentProject.id, activeJobId]);

  const activeJob = jobs.find((j) => j.id === activeJobId) || jobs[0];

  useEffect(() => {
    if (!pauseAutoScroll && logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeJob?.logs, pauseAutoScroll]);

  const handleStartBuild = async () => {
    const profile = profiles.find((p) => p.id === selectedProfileId);
    addToast('Build Queued', `Starting build on profile "${profile?.name}"...`, 'info');

    const newJob = await buildPipelineService.queueBuild(
      currentProject.id,
      selectedProfileId,
      'task-142',
      'task/142-creature-capture'
    );
    setActiveJobId(newJob.id);
  };

  const handleCancelBuild = async (jobId: string) => {
    await buildPipelineService.cancelBuild(jobId);
    addToast('Build Cancelled', 'Cancellation signal transmitted.', 'warning');
  };

  const filteredLogs = (activeJob?.logs || []).filter((l) => {
    const matchesSearch =
      searchLogQuery === '' ||
      l.message.toLowerCase().includes(searchLogQuery.toLowerCase()) ||
      (l.step && l.step.toLowerCase().includes(searchLogQuery.toLowerCase()));
    const matchesLevel = selectedLogLevel === 'ALL' || l.level === selectedLogLevel;
    return matchesSearch && matchesLevel;
  });

  const getStatusBadge = (status: BuildJob['status']) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'BUILDING':
      case 'PREPARING':
      case 'PACKAGING':
        return 'bg-sky-500/15 text-sky-300 border-sky-500/30 animate-pulse';
      case 'QUEUED':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'FAILED':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      case 'CANCELLED':
      default:
        return 'bg-slate-500/15 text-slate-300 border-slate-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Project Type Detection Banner (Section 5) */}
      <div className="p-4 rounded-xl bg-[#0f1422] border border-[#1f293d] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <FileCode className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-slate-400">PROJECT TYPE DETECTED:</span>
              <span className="text-white font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                {detection.detectedType}
              </span>
              <span className="text-slate-400">• Confidence:</span>
              <span className="text-emerald-400 font-bold">{detection.confidence}</span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Active Build Provider: <strong className="text-white">{detection.buildProvider}</strong> (Godot 4.3 Export Engine)
            </p>
          </div>
        </div>

        {/* Action button to launch build */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={selectedProfileId}
              onChange={(e) => setSelectedProfileId(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#141b2c] border border-[#232f48] text-xs font-mono text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.platform})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleStartBuild}
            disabled={activeJob?.status === 'BUILDING'}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold transition-all shadow-lg shadow-indigo-600/25 cursor-pointer disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Start Build</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Active Build & Queue (Left) vs Log Viewer (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Current Build & Queue (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Section 9: CURRENT BUILD CARD */}
          {activeJob && (
            <div className="p-5 rounded-2xl bg-[#0c101a] border border-[#1f2a3e] shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-indigo-400 font-semibold uppercase tracking-wider">
                  CURRENT BUILD
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${getStatusBadge(activeJob.status)}`}>
                  {activeJob.status}
                </span>
              </div>

              <div>
                <div className="flex items-baseline justify-between">
                  <h3 className="text-xl font-extrabold text-white font-mono">
                    Build #{activeJob.buildNumber}
                  </h3>
                  <span className="text-xs font-mono text-slate-400">
                    Elapsed: {activeJob.durationSeconds ? `00:${activeJob.durationSeconds.toString().padStart(2, '0')}` : '00:42'}
                  </span>
                </div>
                <div className="text-xs font-mono text-slate-400 mt-1 space-y-0.5">
                  <div>Project: <span className="text-slate-200">{currentProject.name}</span></div>
                  <div>Branch: <span className="text-indigo-300">{activeJob.branch}</span></div>
                  <div>Profile: <span className="text-slate-200">{activeJob.profile.name}</span></div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">{activeJob.currentStep}</span>
                  <span className="text-indigo-400 font-bold">{activeJob.progress}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#161d2d] overflow-hidden border border-[#232f48]">
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${
                      activeJob.status === 'FAILED'
                        ? 'bg-rose-500'
                        : activeJob.status === 'COMPLETED'
                        ? 'bg-emerald-500'
                        : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                    }`}
                    style={{ width: `${activeJob.progress}%` }}
                  />
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between pt-2 border-t border-[#1f2a3e]">
                {activeJob.status === 'BUILDING' || activeJob.status === 'PREPARING' ? (
                  <button
                    onClick={() => handleCancelBuild(activeJob.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-mono font-semibold transition-all cursor-pointer"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Cancel Build</span>
                  </button>
                ) : activeJob.status === 'COMPLETED' ? (
                  <button
                    onClick={onOpenPreview}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold transition-all shadow-md shadow-emerald-600/25 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Launch in Game Preview</span>
                  </button>
                ) : (
                  <button
                    onClick={handleStartBuild}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-semibold transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Retry Build</span>
                  </button>
                )}

                {activeJob.artifact && (
                  <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Artifact Ready ({activeJob.artifact.sizeFormatted})</span>
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Section 8: BUILD QUEUE */}
          <div className="p-5 rounded-2xl bg-[#0c101a] border border-[#1f2a3e] shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-300 font-semibold uppercase tracking-wider flex items-center gap-2">
                <Hammer className="w-3.5 h-3.5 text-indigo-400" />
                <span>BUILD QUEUE ({jobs.length})</span>
              </span>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar pr-1">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  onClick={() => setActiveJobId(job.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    activeJobId === job.id
                      ? 'bg-indigo-950/40 border-indigo-500/50'
                      : 'bg-[#121724] border-[#1e273a] hover:border-[#2a3752]'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-white">
                        #{job.buildNumber}
                      </span>
                      <span className="text-xs font-mono text-slate-300 font-medium">
                        {job.taskId === 'task-142' ? 'Creature Capture System' : job.profile.name}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2">
                      <span>{job.profile.platform}</span>
                      <span>•</span>
                      <span>{new Date(job.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold border ${getStatusBadge(job.status)}`}>
                    {job.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Build Log Viewer (7 Cols) */}
        <div className="lg:col-span-7">
          <div className="p-5 rounded-2xl bg-[#090d16] border border-[#1a2334] shadow-2xl flex flex-col h-[540px]">
            {/* Header & Controls (Section 10) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1a2334]">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  REAL-TIME BUILD LOGS {activeJob ? `(#${activeJob.buildNumber})` : ''}
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#141b2c] border border-[#232f48] text-slate-400 flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5 text-amber-400" />
                  <span>Sanitized</span>
                </span>
              </div>

              {/* Log filter and pause controls */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Search */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search logs..."
                    value={searchLogQuery}
                    onChange={(e) => setSearchLogQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 rounded-lg bg-[#141b2c] border border-[#232f48] text-xs font-mono text-white focus:outline-none focus:border-indigo-500 w-36 sm:w-44"
                  />
                </div>

                {/* Level filter */}
                <select
                  value={selectedLogLevel}
                  onChange={(e) => setSelectedLogLevel(e.target.value as any)}
                  className="px-2 py-1.5 rounded-lg bg-[#141b2c] border border-[#232f48] text-xs font-mono text-slate-300 focus:outline-none"
                >
                  <option value="ALL">All</option>
                  <option value="STEP">Steps</option>
                  <option value="INFO">Info</option>
                  <option value="WARN">Warnings</option>
                  <option value="ERROR">Errors</option>
                </select>

                {/* Pause scroll button */}
                <button
                  onClick={() => setPauseAutoScroll((prev) => !prev)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer ${
                    pauseAutoScroll
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-[#141b2c] text-slate-400 hover:text-white border border-[#232f48]'
                  }`}
                  title={pauseAutoScroll ? 'Auto-scroll paused' : 'Auto-scroll active'}
                >
                  {pauseAutoScroll ? 'Paused' : 'Live'}
                </button>
              </div>
            </div>

            {/* Terminal Body */}
            <div className="flex-1 overflow-y-auto custom-scrollbar font-mono text-xs p-3 space-y-1.5 select-text">
              {filteredLogs.length === 0 ? (
                <div className="flex items-center justify-center h-full text-slate-500">
                  No log entries matched current filter.
                </div>
              ) : (
                filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className={`flex items-start gap-2.5 leading-relaxed ${
                      log.level === 'ERROR'
                        ? 'text-rose-400 bg-rose-500/10 p-1.5 rounded border border-rose-500/20'
                        : log.level === 'WARN'
                        ? 'text-amber-300'
                        : log.level === 'STEP'
                        ? 'text-sky-300 font-bold border-l-2 border-sky-400 pl-2'
                        : 'text-slate-300'
                    }`}
                  >
                    <span className="text-slate-500 shrink-0 text-[11px] select-none">
                      {log.timestamp}
                    </span>
                    <span className="break-all">{log.message}</span>
                  </div>
                ))
              )}
              <div ref={logEndRef} />
            </div>

            {/* Error Diagnostics Box (Section 11) */}
            {activeJob?.status === 'FAILED' && activeJob.errorDetails && (
              <div className="mt-3 p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs font-mono space-y-2">
                <div className="flex items-center gap-2 text-rose-300 font-bold">
                  <AlertTriangle className="w-4 h-4" />
                  <span>BUILD FAILED: {activeJob.errorDetails.error}</span>
                </div>
                <div className="text-slate-300 space-y-1 text-[11px]">
                  <div><strong className="text-slate-400">Failed Step:</strong> {activeJob.errorDetails.failedStep}</div>
                  <div><strong className="text-slate-400">Likely Cause:</strong> {activeJob.errorDetails.likelyCause}</div>
                  <div><strong className="text-slate-400">Suggested Action:</strong> {activeJob.errorDetails.suggestedNextAction}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
