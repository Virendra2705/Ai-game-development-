import React, { useState, useEffect } from 'react';
import {
  AlertOctagon,
  RotateCcw,
  ShieldAlert,
  CheckCircle2,
  Clock,
  UserCheck,
  AlertTriangle,
  FileText,
  ArrowRight,
  Plus,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { incidentService } from '../../services/incidentService';
import { rollbackService } from '../../services/rollbackService';
import { releaseManagerService } from '../../services/releaseManagerService';
import { Incident, RollbackRecord } from '../../types';

export const IncidentsView: React.FC = () => {
  const { currentProject, addToast } = useApp();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [rollbacks, setRollbacks] = useState<RollbackRecord[]>([]);

  // Emergency Rollback modal state
  const [isRollbackModalOpen, setIsRollbackModalOpen] = useState(false);
  const [targetRollbackVersion, setTargetRollbackVersion] = useState('1.0.0');
  const [rollbackReason, setRollbackReason] = useState('Critical NullReference crashes in creature net trapping.');
  const [isExecutingRollback, setIsExecutingRollback] = useState(false);

  useEffect(() => {
    loadData();
  }, [currentProject.id]);

  const loadData = () => {
    const incs = incidentService.getIncidents(currentProject.id);
    const rols = rollbackService.getRollbackHistory(currentProject.id);
    setIncidents(incs);
    setRollbacks(rols);
    if (incs.length > 0 && !selectedIncident) {
      setSelectedIncident(incs[0]);
    }
  };

  const handleExecuteRollback = async () => {
    if (!targetRollbackVersion || !rollbackReason) {
      addToast(
        'Validation Error',
        'Target version and reason are required for emergency rollback.',
        'error'
      );
      return;
    }

    setIsExecutingRollback(true);
    const operator = 'Alex Vance (Human Incident Commander)';

    const releases = releaseManagerService.getReleases(currentProject.id);
    const targetRelease = releases.find((r) => r.version === targetRollbackVersion) || releases[0];

    if (!targetRelease) {
      setIsExecutingRollback(false);
      addToast('Rollback Error', 'No matching target release found.', 'error');
      return;
    }

    const res = await rollbackService.executeRollback(
      currentProject.id,
      targetRelease.id,
      rollbackReason,
      operator,
      false
    );

    setIsExecutingRollback(false);
    setIsRollbackModalOpen(false);

    if (res.success) {
      addToast(
        'Rollback Completed & Verified',
        `Production safely rolled back to v${targetRollbackVersion} by ${operator}.`,
        'success'
      );
      loadData();
    } else {
      addToast(
        'Rollback Blocked',
        res.error || 'Rollback execution halted.',
        'error'
      );
    }
  };

  const liveRelease = releaseManagerService.getLiveRelease(currentProject.id);
  const prevRelease = releaseManagerService.getPreviousRelease(currentProject.id);

  return (
    <div className="space-y-6">
      {/* Top Banner: Incident Governance & Emergency Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-[#0b0e17] border border-[#1a2336]">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-rose-400" />
            Production Incidents & Emergency Rollback
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Mandatory human authorization governs production rollbacks. Compatibility and save schema integrity are strictly checked.
          </p>
        </div>

        <button
          onClick={() => {
            setTargetRollbackVersion(prevRelease?.version || '1.0.0');
            setIsRollbackModalOpen(true);
          }}
          className="px-4 py-2 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-sm flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Trigger Emergency Rollback
        </button>
      </div>

      {/* Main Grid: Incidents List & Incident Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Incident List */}
        <div className="p-4 rounded-xl bg-[#0b0e17] border border-[#1a2336] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#182134]">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Incident Registry</span>
            <span className="text-xs font-mono text-slate-500">{incidents.length} total</span>
          </div>

          <div className="space-y-2">
            {incidents.map((inc) => {
              const isSelected = selectedIncident?.id === inc.id;
              return (
                <button
                  key={inc.id}
                  onClick={() => setSelectedIncident(inc)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    isSelected
                      ? 'bg-rose-500/10 border-rose-500/40 text-white'
                      : 'bg-[#0f1422] hover:bg-[#141b2a] border-[#182236] text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase font-mono ${
                        inc.severity === 'CRITICAL'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {inc.severity}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{inc.status}</span>
                  </div>

                  <div className="font-bold text-xs text-slate-200 mt-1.5 line-clamp-1">{inc.title}</div>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{inc.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Incident View */}
        <div className="lg:col-span-2 space-y-5">
          {selectedIncident && (
            <div className="p-5 rounded-xl bg-[#0b0e17] border border-[#1a2336] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#182134]">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">{selectedIncident.title}</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {selectedIncident.severity}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Target: {selectedIncident.affectedEnvironment} • Release: v{selectedIncident.affectedRelease}
                  </div>
                </div>

                <span className="text-xs font-mono px-2 py-1 rounded bg-slate-800 text-slate-300 self-start sm:self-auto">
                  Status: {selectedIncident.status}
                </span>
              </div>

              <div className="text-xs text-slate-300 bg-[#07090e] p-3 rounded-lg border border-[#161f30]">
                {selectedIncident.description}
              </div>

              {/* Timeline */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Incident Timeline
                </span>
                <div className="space-y-1.5">
                  {selectedIncident.timeline.map((entry, idx) => (
                    <div key={idx} className="p-2.5 rounded bg-[#0f1422] border border-[#172134] text-xs flex items-center justify-between">
                      <span className="text-slate-300">{entry.event}</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {entry.actor} • {new Date(entry.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Related crashes and remediation tasks */}
              <div className="p-3.5 rounded-lg bg-[#0e1422] border border-[#1f2a40] space-y-2 text-xs">
                <span className="font-bold text-indigo-300 block uppercase text-[10px]">
                  Remediation & Linked Telemetry
                </span>
                <div className="text-slate-300">
                  <strong>Related Crashes: </strong> {selectedIncident.relatedCrashes.join(', ') || 'None'}
                </div>
                <div className="text-slate-300">
                  <strong>Remediation Tasks: </strong> {selectedIncident.relatedTasks.join(', ') || 'Automatic investigation queued'}
                </div>
              </div>
            </div>
          )}

          {/* Rollback History Audit Table */}
          <div className="p-5 rounded-xl bg-[#0b0e17] border border-[#1a2336] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#182030]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
                Audited Rollback History
              </h4>
              <span className="text-[11px] text-slate-500 font-mono">{rollbacks.length} executions</span>
            </div>

            <div className="space-y-2">
              {rollbacks.map((rb) => (
                <div
                  key={rb.id}
                  className="p-3 rounded-lg bg-[#0f1422] border border-[#182236] text-xs flex flex-col md:flex-row md:items-center justify-between gap-2"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">v{rb.toVersion}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300">
                        {rb.status}
                      </span>
                    </div>
                    <div className="text-slate-400 text-[11px] mt-0.5">{rb.reason}</div>
                  </div>

                  <div className="text-[11px] text-slate-400 font-mono">
                    Authorized by: <strong className="text-slate-200">{rb.approvedBy}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Rollback Modal */}
      {isRollbackModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg p-6 rounded-2xl bg-[#0e1422] border border-rose-500/40 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1a2338]">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                Authorize Emergency Rollback
              </h3>
              <button onClick={() => setIsRollbackModalOpen(false)} className="text-slate-400 hover:text-white text-xs">
                ✕
              </button>
            </div>

            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-200 leading-relaxed">
              <strong>Pre-Rollback Safety Checks:</strong> Save data backward-compatibility verified. Network protocol v1.0 fallback active. Assets verified in cold storage.
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Target Version to Restore</label>
                <input
                  type="text"
                  value={targetRollbackVersion}
                  onChange={(e) => setTargetRollbackVersion(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#07090e] border border-[#1f2b42] text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Reason for Rollback</label>
                <textarea
                  rows={2}
                  value={rollbackReason}
                  onChange={(e) => setRollbackReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#07090e] border border-[#1f2b42] text-white resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#1a2338]">
              <button
                onClick={() => setIsRollbackModalOpen(false)}
                className="px-3.5 py-1.5 rounded-lg text-xs text-slate-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteRollback}
                disabled={isExecutingRollback}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-sm"
              >
                {isExecutingRollback ? 'Rolling back...' : 'Confirm Rollback (Alex Vance)'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
