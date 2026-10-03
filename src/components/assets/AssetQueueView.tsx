import React, { useEffect, useState } from 'react';
import {
  Cpu,
  Play,
  Pause,
  RotateCcw,
  XCircle,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { assetQueueService } from '../../services/assets/assetQueueService';
import { AssetGenerationJob } from '../../types/assets';

export const AssetQueueView: React.FC = () => {
  const [jobs, setJobs] = useState<AssetGenerationJob[]>([]);

  useEffect(() => {
    setJobs(assetQueueService.getJobs());
    const unsub = assetQueueService.subscribe((updated) => {
      setJobs([...updated]);
    });
    return () => unsub();
  }, []);

  const handleCancel = (jobId: string) => {
    assetQueueService.cancelJob(jobId);
  };

  const handleRetry = (jobId: string) => {
    assetQueueService.retryJob(jobId);
  };

  const handlePause = (jobId: string) => {
    assetQueueService.pauseJob(jobId);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'GENERATING':
      case 'PROCESSING':
        return {
          label: 'GENERATING',
          classes: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
        };
      case 'COMPLETED':
        return {
          label: 'COMPLETED',
          classes: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        };
      case 'FAILED':
        return {
          label: 'FAILED',
          classes: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        };
      case 'CANCELLED':
        return {
          label: 'CANCELLED',
          classes: 'bg-slate-500/20 text-slate-400 border-slate-500/40',
        };
      default:
        return {
          label: 'QUEUED',
          classes: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        };
    }
  };

  return (
    <div className="space-y-4 font-mono text-xs">
      <div className="p-4 rounded-2xl bg-[#0c101a] border border-[#1f2a3e] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white uppercase tracking-wider">
              Asset Generation Queue (Section 13)
            </h3>
            <p className="text-[10px] text-slate-400">
              Live background GPU pipeline tracking synthesis, PBR baking, and rigging jobs
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-xl bg-[#080c14] border border-[#1a2334] text-slate-300 text-[10px]">
            Active Jobs: <span className="text-sky-400 font-bold">{jobs.filter((j) => j.status === 'GENERATING' || j.status === 'QUEUED').length}</span>
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {jobs.map((job) => {
          const badge = getStatusBadge(job.status);
          const isRunning = job.status === 'GENERATING';
          const isFailed = job.status === 'FAILED';

          return (
            <div
              key={job.jobId}
              className="p-4 rounded-2xl bg-[#0c101a] border border-[#1c2638] hover:border-sky-500/40 transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="px-2 py-0.5 rounded bg-[#162032] text-slate-400 font-bold text-[10px]">
                    {job.jobId}
                  </span>
                  <span className="font-bold text-white text-sm">{job.prompt.slice(0, 50)}...</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${badge.classes}`}>
                    {badge.label}
                  </span>
                  <span className="text-[10px] text-slate-400">Provider: {job.provider}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-400">Synthesis Progress</span>
                  <span className="font-bold text-sky-400">{job.progress}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#080c14] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isFailed ? 'bg-rose-500' : 'bg-gradient-to-r from-indigo-500 to-sky-400'
                    }`}
                    style={{ width: `${job.progress}%` }}
                  />
                </div>
              </div>

              {/* Error snippet if failed */}
              {job.error && (
                <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px] flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{job.error}</span>
                </div>
              )}

              {/* Controls */}
              <div className="flex items-center justify-between pt-1 border-t border-[#1a2334] text-[10px] text-slate-400">
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3" />
                  <span>Started: {new Date(job.startedAt).toLocaleTimeString()}</span>
                  {job.costCredits && (
                    <span className="text-indigo-400">({job.costCredits} credits)</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {isRunning && (
                    <button
                      onClick={() => handlePause(job.jobId)}
                      className="px-2.5 py-1 rounded-lg bg-[#141c2c] hover:bg-[#1a253a] text-slate-200 border border-[#222f46] font-bold cursor-pointer"
                    >
                      Pause
                    </button>
                  )}

                  {isFailed && (
                    <button
                      onClick={() => handleRetry(job.jobId)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 font-bold cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Retry</span>
                    </button>
                  )}

                  {job.status !== 'COMPLETED' && job.status !== 'CANCELLED' && (
                    <button
                      onClick={() => handleCancel(job.jobId)}
                      className="px-2.5 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 font-bold cursor-pointer"
                    >
                      Cancel Job
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
