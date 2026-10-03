import React, { useState, useEffect } from 'react';
import {
  Tag,
  ShieldCheck,
  AlertOctagon,
  CheckCircle2,
  XCircle,
  FileText,
  GitCompare,
  Plus,
  ArrowRight,
  HelpCircle,
  Clock,
  UserCheck,
  Sparkles,
  AlertTriangle,
  Send,
  Eye,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { releaseManagerService } from '../../services/releaseManagerService';
import { versionService } from '../../services/versionService';
import { releaseNotesService } from '../../services/releaseNotesService';
import { Release, ReleaseApproval, ReleaseReadinessReport } from '../../types';

export const ReleasesView: React.FC = () => {
  const { currentProject, addToast } = useApp();
  const [releases, setReleases] = useState<Release[]>([]);
  const [selectedRelease, setSelectedRelease] = useState<Release | null>(null);
  const [approval, setApproval] = useState<ReleaseApproval | null>(null);

  // Release Candidate creation modal state
  const [isCreatingCandidate, setIsCreatingCandidate] = useState(false);
  const [bumpType, setBumpType] = useState<'patch' | 'minor' | 'major'>('minor');
  const [customVersion, setCustomVersion] = useState('1.2.0');
  const [targetEnv, setTargetEnv] = useState<'STAGING' | 'PRODUCTION'>('STAGING');
  const [candidateNotes, setCandidateNotes] = useState('');

  // Comparison view
  const [isComparing, setIsComparing] = useState(false);

  // Approval action
  const [approvalNote, setApprovalNote] = useState('');

  useEffect(() => {
    loadReleases();
  }, [currentProject.id]);

  const loadReleases = () => {
    const list = releaseManagerService.getReleases(currentProject.id);
    setReleases(list);
    if (list.length > 0 && !selectedRelease) {
      selectRelease(list[0]);
    } else if (selectedRelease) {
      const updated = list.find((r) => r.id === selectedRelease.id) || list[0];
      selectRelease(updated);
    }
  };

  const selectRelease = (rel: Release) => {
    setSelectedRelease(rel);
    const appr = releaseManagerService.getApproval(rel.id);
    setApproval(appr || null);
  };

  const handleCreateCandidate = () => {
    if (!customVersion) {
      addToast(
        'Validation Error',
        'Please specify a valid semantic release version.',
        'error'
      );
      return;
    }

    const newRel = releaseManagerService.createReleaseCandidate({
      projectId: currentProject.id,
      version: customVersion,
      buildId: `build-${Math.floor(150 + Math.random() * 20)}`,
      environment: targetEnv,
      releaseNotes: candidateNotes,
      platformValidation: 'PASS',
    });

    addToast(
      'Release Candidate Created',
      `Release Candidate v${newRel.version} registered. Evidence readiness report generated.`,
      'success'
    );

    setIsCreatingCandidate(false);
    loadReleases();
    selectRelease(newRel);
  };

  const handleApprovalAction = (action: 'APPROVE RELEASE' | 'REJECT' | 'REQUEST CHANGES' | 'CANCEL') => {
    if (!selectedRelease) return;

    // Human operator Alex Vance (explicit human authorization)
    const operator = 'Alex Vance (Lead Game Producer)';
    const res = releaseManagerService.processApproval(
      currentProject.id,
      selectedRelease.id,
      action,
      operator,
      approvalNote
    );

    if (!res.success) {
      addToast(
        'Action Rejected',
        res.error || 'Failed to process approval',
        'error'
      );
      return;
    }

    addToast(
      `Release ${action}`,
      `Release ${selectedRelease.version} status updated by ${operator}.`,
      'success'
    );

    setApprovalNote('');
    loadReleases();
  };

  const currentLive = releases.find((r) => r.status === 'LIVE');
  const previousRel = releases.find((r) => r.status === 'ROLLED_BACK') || releases[1];

  return (
    <div className="space-y-6">
      {/* Header & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-[#0b0e17] border border-[#1a2336]">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Tag className="w-5 h-5 text-indigo-400" />
            Release Manager & Version Governance
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Governs Release Candidates, evidence-based readiness reports, and mandatory human authorization.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsComparing(!isComparing)}
            className={`px-3.5 py-2 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors ${
              isComparing
                ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40'
                : 'bg-[#121927] hover:bg-[#182133] text-slate-200 border-[#232f46]'
            }`}
          >
            <GitCompare className="w-3.5 h-3.5" />
            {isComparing ? 'Close Comparison' : 'Compare Releases (v1.0.0 vs v1.1.0)'}
          </button>
          <button
            onClick={() => {
              const next = versionService.calculateNextVersion(currentLive?.version || '1.0.0', 'minor');
              setCustomVersion(next);
              setIsCreatingCandidate(true);
            }}
            className="px-4 py-2 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            New Release Candidate
          </button>
        </div>
      </div>

      {/* Comparison Drawer/Modal if active */}
      {isComparing && (
        <div className="p-5 rounded-xl bg-[#0e1422] border border-indigo-500/40 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1b2538]">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <GitCompare className="w-4 h-4 text-indigo-400" />
              Release Comparison: v1.0.0 (LIVE) vs v1.1.0 (CANDIDATE)
            </h3>
            <span className="text-xs font-mono text-slate-400">Differential Analysis</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3 rounded-lg bg-[#07090e] border border-[#172032] space-y-2">
              <span className="text-slate-400 font-semibold uppercase text-[10px]">Scope & Tasks</span>
              <div className="text-slate-200 font-medium">3 Completed Sprints, 18 Automated Tests</div>
              <p className="text-slate-400 text-[11px]">
                Added Kinetic Net trapping system, creature flee states, and inventory crystal filtering.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-[#07090e] border border-[#172032] space-y-2">
              <span className="text-slate-400 font-semibold uppercase text-[10px]">Binary & Performance</span>
              <div className="flex justify-between text-slate-200">
                <span>Build Size:</span>
                <span className="font-mono">412.8 MB → 418.2 MB (+5.4 MB)</span>
              </div>
              <div className="flex justify-between text-slate-200">
                <span>FPS (Adreno 610):</span>
                <span className="font-mono text-emerald-400">59 FPS (Stable)</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-[#07090e] border border-[#172032] space-y-2">
              <span className="text-slate-400 font-semibold uppercase text-[10px]">Resolved Bugs & Issues</span>
              <div className="text-emerald-400 font-medium">1 Critical Crash Fix included</div>
              <p className="text-slate-400 text-[11px]">
                Resolved NullReferenceException in KineticNet.cs during entity despawn ticks.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Left = Release List, Right = Selected Release & Readiness Report */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Release History */}
        <div className="p-4 rounded-xl bg-[#0b0e17] border border-[#1a2336] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#182134]">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Release Archive</span>
            <span className="text-xs font-mono text-slate-500">{releases.length} records</span>
          </div>

          <div className="space-y-2">
            {releases.map((rel) => {
              const isSelected = selectedRelease?.id === rel.id;
              return (
                <button
                  key={rel.id}
                  onClick={() => selectRelease(rel)}
                  className={`w-full text-left p-3 rounded-lg transition-all border ${
                    isSelected
                      ? 'bg-indigo-600/15 border-indigo-500/40 text-white shadow-sm'
                      : 'bg-[#0f1422] hover:bg-[#141a2a] border-[#182236] text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm tracking-tight">v{rel.version}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        rel.status === 'LIVE'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : rel.status === 'APPROVAL_REQUIRED'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : rel.status === 'APPROVED'
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {rel.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-400 mt-1 flex items-center justify-between">
                    <span>{rel.environment}</span>
                    <span className="font-mono text-[10px]">Build #{rel.buildId}</span>
                  </div>

                  <p className="text-[11px] text-slate-400 mt-1.5 line-clamp-1">{rel.releaseNotes}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Release Detail & Readiness Evidence */}
        <div className="lg:col-span-2 space-y-6">
          {selectedRelease && (
            <>
              {/* Release Header Details */}
              <div className="p-5 rounded-xl bg-[#0b0e17] border border-[#1a2336] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#182134]">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-white">Release v{selectedRelease.version}</h3>
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                        {selectedRelease.environment}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Created: {new Date(selectedRelease.createdAt).toLocaleString()} • Build #{selectedRelease.buildId}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        selectedRelease.approvalStatus === 'APPROVED'
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          : selectedRelease.approvalStatus === 'PENDING'
                          ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      Approval: {selectedRelease.approvalStatus}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-300 leading-relaxed bg-[#07090e] p-3 rounded-lg border border-[#161f30]">
                  <span className="font-semibold text-slate-400 block mb-1">Release Notes:</span>
                  {selectedRelease.releaseNotes}
                </div>

                {/* Evidence-Based Release Readiness Report */}
                {selectedRelease.validationResults && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-indigo-400" />
                        Evidence-Based Release Readiness Report
                      </h4>
                      <span className="text-[11px] text-slate-500">No arbitrary score. Evidence only.</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      {/* Build */}
                      <div className="p-2.5 rounded-lg bg-[#0f1422] border border-[#1a2336]">
                        <span className="text-slate-400 text-[10px] block">Build Verification</span>
                        <span className="font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {selectedRelease.validationResults.buildStatus}
                        </span>
                      </div>

                      {/* Critical QA */}
                      <div className="p-2.5 rounded-lg bg-[#0f1422] border border-[#1a2336]">
                        <span className="text-slate-400 text-[10px] block">Critical QA</span>
                        <span
                          className={`font-bold flex items-center gap-1 mt-0.5 ${
                            selectedRelease.validationResults.criticalQA === 'PASS'
                              ? 'text-emerald-400'
                              : 'text-amber-400'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {selectedRelease.validationResults.criticalQA}
                        </span>
                      </div>

                      {/* Regression */}
                      <div className="p-2.5 rounded-lg bg-[#0f1422] border border-[#1a2336]">
                        <span className="text-slate-400 text-[10px] block">Regression Suite</span>
                        <span className="font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {selectedRelease.validationResults.regression}
                        </span>
                      </div>

                      {/* Critical & Major Bugs */}
                      <div className="p-2.5 rounded-lg bg-[#0f1422] border border-[#1a2336]">
                        <span className="text-slate-400 text-[10px] block">Critical / Major Bugs</span>
                        <span className="font-bold text-slate-200 mt-0.5 block font-mono">
                          {selectedRelease.validationResults.criticalBugsCount} Critical / {selectedRelease.validationResults.majorBugsCount} Major
                        </span>
                      </div>
                    </div>

                    {/* Platform & Performance Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-2.5 rounded-lg bg-[#0f1422] border border-[#1a2336] flex items-center justify-between">
                        <span className="text-slate-400">Platform Native Validation:</span>
                        <span className="font-bold text-emerald-400">
                          {selectedRelease.validationResults.platformValidation}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-[#0f1422] border border-[#1a2336] flex items-center justify-between">
                        <span className="text-slate-400">Performance Telemetry:</span>
                        <span className="font-mono text-slate-200">
                          {selectedRelease.validationResults.performanceData?.fps} FPS (
                          {selectedRelease.validationResults.performanceData?.frameTimeMs}ms)
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Human Release Approval Card */}
              {approval && (
                <div className="p-5 rounded-xl bg-[#0c101c] border border-[#1f2942] space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#1b253c]">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-purple-400" />
                      <h4 className="text-sm font-semibold text-white">
                        Production Release Authorization Card
                      </h4>
                    </div>
                    <span className="text-[11px] text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      Rule: No AI agent may approve its own release
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 font-semibold block mb-1">Affected Systems:</span>
                      <ul className="list-disc list-inside text-slate-300 space-y-0.5">
                        {approval.affectedSystems.map((s, idx) => (
                          <li key={idx}>{s}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <span className="text-slate-400 font-semibold block mb-1">Rollback Plan:</span>
                      <p className="text-slate-300 text-[11px] leading-relaxed">{approval.rollbackPlan}</p>
                    </div>
                  </div>

                  {approval.status === 'PENDING' ? (
                    <div className="pt-3 border-t border-[#1a243b] space-y-3">
                      <input
                        type="text"
                        placeholder="Optional decision note or signoff remark..."
                        value={approvalNote}
                        onChange={(e) => setApprovalNote(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-[#07090e] border border-[#1a2336] text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                      />

                      <div className="flex flex-wrap items-center gap-2 justify-end">
                        <button
                          onClick={() => handleApprovalAction('REQUEST CHANGES')}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#131a28] hover:bg-[#1a2336] text-amber-300 border border-amber-500/30 transition-colors"
                        >
                          Request Changes
                        </button>
                        <button
                          onClick={() => handleApprovalAction('REJECT')}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#131a28] hover:bg-[#1a2336] text-rose-300 border border-rose-500/30 transition-colors"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleApprovalAction('APPROVE RELEASE')}
                          className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all"
                        >
                          Approve Release (Alex Vance)
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="pt-2 border-t border-[#1a243b] text-xs text-slate-400 flex items-center justify-between">
                      <span>Status: <strong className="text-slate-200">{approval.status}</strong></span>
                      <span>Decided by: <strong className="text-indigo-300">{approval.decidedBy || 'Producer'}</strong> ({new Date(approval.decidedAt || '').toLocaleDateString()})</span>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Candidate Creation Modal */}
      {isCreatingCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg p-6 rounded-2xl bg-[#0e1422] border border-[#222e48] shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1a2338]">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-400" />
                Create Release Candidate
              </h3>
              <button
                onClick={() => setIsCreatingCandidate(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Version Increment Rule</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['patch', 'minor', 'major'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        setBumpType(type);
                        setCustomVersion(
                          versionService.calculateNextVersion(currentLive?.version || '1.0.0', type)
                        );
                      }}
                      className={`py-1.5 px-2 rounded-lg font-mono text-center uppercase border transition-colors ${
                        bumpType === type
                          ? 'bg-indigo-600 text-white border-indigo-500'
                          : 'bg-[#121927] text-slate-300 border-[#1f2b42]'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Semantic Version</label>
                <input
                  type="text"
                  value={customVersion}
                  onChange={(e) => setCustomVersion(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#07090e] border border-[#1f2b42] text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Target Environment</label>
                <select
                  value={targetEnv}
                  onChange={(e) => setTargetEnv(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-[#07090e] border border-[#1f2b42] text-white"
                >
                  <option value="STAGING">STAGING (Pre-Release QA)</option>
                  <option value="PRODUCTION">PRODUCTION (Requires Strict Approvals)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Release Notes & Scope</label>
                <textarea
                  rows={3}
                  value={candidateNotes}
                  onChange={(e) => setCandidateNotes(e.target.value)}
                  placeholder="Outline new features, performance gains, and known limitations..."
                  className="w-full px-3 py-2 rounded-lg bg-[#07090e] border border-[#1f2b42] text-white placeholder:text-slate-500 resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#1a2338]">
              <button
                onClick={() => setIsCreatingCandidate(false)}
                className="px-3.5 py-1.5 rounded-lg text-xs text-slate-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCandidate}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm"
              >
                Package Candidate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
