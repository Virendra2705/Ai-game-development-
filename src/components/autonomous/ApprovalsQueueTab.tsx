import React, { useState } from 'react';
import {
  FileCheck,
  ShieldAlert,
  Check,
  X,
  HelpCircle,
  FileCode,
  Layers,
  AlertTriangle,
  Clock,
  UserCheck,
} from 'lucide-react';
import { ApprovalRequest } from '../../types';

interface ApprovalsQueueTabProps {
  approvals: ApprovalRequest[];
  onApprove: (id: string, notes?: string) => void;
  onReject: (id: string, notes?: string) => void;
  onRequestMoreInfo: (id: string, notes: string) => void;
}

export const ApprovalsQueueTab: React.FC<ApprovalsQueueTabProps> = ({
  approvals,
  onApprove,
  onReject,
  onRequestMoreInfo,
}) => {
  const [selectedApproval, setSelectedApproval] = useState<ApprovalRequest | null>(
    approvals[0] || null
  );
  const [decisionNotes, setDecisionNotes] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'DECIDED'>('PENDING');

  const filteredApprovals = approvals.filter((a) => {
    if (filter === 'PENDING') return a.status === 'PENDING';
    if (filter === 'DECIDED') return a.status === 'APPROVED' || a.status === 'REJECTED';
    return true;
  });

  const getRiskBadge = (risk: ApprovalRequest['risk']) => {
    switch (risk) {
      case 'CRITICAL':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'HIGH':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'MEDIUM':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/40';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#0d121f] border border-[#1b2438]">
        <div>
          <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-amber-400" />
            Human Approval Gate Queue
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Strict human oversight for high-impact architecture, scope, code, and security actions.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-[#090d16] p-1 rounded-lg border border-[#182236]">
          {(['PENDING', 'DECIDED', 'ALL'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
                filter === f ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Approvals List & Detailed Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left List */}
        <div className="lg:col-span-5 space-y-2.5 max-h-[640px] overflow-y-auto custom-scrollbar pr-1">
          {filteredApprovals.length === 0 ? (
            <div className="p-8 rounded-xl bg-[#090d16] border border-[#151c2e] text-center text-slate-500 font-mono text-xs">
              No approval requests matching filter.
            </div>
          ) : (
            filteredApprovals.map((item) => {
              const isSelected = selectedApproval?.id === item.id;
              const isPending = item.status === 'PENDING';

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedApproval(item);
                    setDecisionNotes('');
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-amber-950/20 border-amber-500/80 ring-2 ring-amber-500/20 shadow-lg'
                      : 'bg-[#0a0e18] border-[#161f33] hover:border-[#243352]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                      {item.category.replace(/_/g, ' ')}
                    </span>
                    <span
                      className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded border font-bold ${getRiskBadge(
                        item.risk
                      )}`}
                    >
                      {item.risk} RISK
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-white font-mono line-clamp-2">{item.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{item.description}</p>

                  <div className="mt-3 pt-2 border-t border-[#141b2a] flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span>{item.affectedFiles.length} files affected</span>
                    <span
                      className={`font-bold ${
                        item.status === 'APPROVED'
                          ? 'text-emerald-400'
                          : item.status === 'REJECTED'
                          ? 'text-rose-400'
                          : 'text-amber-400 animate-pulse'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Inspector */}
        <div className="lg:col-span-7 bg-[#0c101b] border border-[#1b2438] rounded-xl p-6 flex flex-col h-[640px] overflow-y-auto custom-scrollbar space-y-5">
          {selectedApproval ? (
            <>
              {/* Header */}
              <div className="border-b border-[#1b2438] pb-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                      {selectedApproval.category}
                    </span>
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border font-bold ${getRiskBadge(
                        selectedApproval.risk
                      )}`}
                    >
                      {selectedApproval.risk} RISK
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    ID: {selectedApproval.id}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white font-mono">{selectedApproval.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{selectedApproval.description}</p>
              </div>

              {/* What will happen & Why */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-[#090d16] border border-[#161f33] space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">
                    What will happen:
                  </span>
                  <p className="text-xs text-slate-200">{selectedApproval.whatWillHappen}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#090d16] border border-[#161f33] space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">
                    Why the AI proposes this:
                  </span>
                  <p className="text-xs text-slate-200">{selectedApproval.why}</p>
                </div>
              </div>

              {/* Affected Systems & Files */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                  Affected Systems & Files
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedApproval.affectedSystems.map((sys, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 rounded bg-[#101726] border border-[#1d2942] text-[11px] font-mono text-sky-300 flex items-center gap-1"
                    >
                      <Layers className="w-3 h-3 text-sky-400" />
                      {sys}
                    </span>
                  ))}
                </div>
                <div className="space-y-1 pt-1">
                  {selectedApproval.affectedFiles.map((file, idx) => (
                    <div
                      key={idx}
                      className="p-1.5 rounded bg-[#070a12] border border-[#141b2b] text-[11px] font-mono text-slate-300 flex items-center gap-1.5"
                    >
                      <FileCode className="w-3 h-3 text-indigo-400" />
                      <span>{file}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Evidence & AI Recommendation */}
              {selectedApproval.evidence && (
                <div className="p-3.5 rounded-xl bg-[#090d16] border border-[#161f33] space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">
                    Logged Evidence:
                  </span>
                  <p className="text-xs text-amber-200/90 font-mono">{selectedApproval.evidence}</p>
                </div>
              )}

              <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/30 space-y-1">
                <span className="text-[10px] font-mono text-indigo-300 uppercase font-bold">
                  AI Recommendation:
                </span>
                <p className="text-xs text-indigo-100">{selectedApproval.aiRecommendation}</p>
              </div>

              {/* Decision Action Box */}
              {selectedApproval.status === 'PENDING' ? (
                <div className="pt-2 border-t border-[#1b2438] space-y-3">
                  <input
                    type="text"
                    value={decisionNotes}
                    onChange={(e) => setDecisionNotes(e.target.value)}
                    placeholder="Optional human lead decision notes or architectural stipulations..."
                    className="w-full px-3 py-2 bg-[#090d16] border border-[#1c263b] rounded-lg text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onApprove(selectedApproval.id, decisionNotes)}
                      className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold font-mono flex items-center justify-center gap-1.5 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                    >
                      <Check className="w-4 h-4" />
                      <span>Approve Change</span>
                    </button>
                    <button
                      onClick={() => onReject(selectedApproval.id, decisionNotes)}
                      className="flex-1 py-2.5 rounded-xl bg-rose-600/80 hover:bg-rose-500 text-white text-xs font-bold font-mono flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      <span>Reject Change</span>
                    </button>
                    <button
                      onClick={() => onRequestMoreInfo(selectedApproval.id, decisionNotes || 'Need impact trace')}
                      className="px-3.5 py-2.5 rounded-xl border border-slate-700 hover:bg-[#151c2e] text-slate-300 text-xs font-mono flex items-center gap-1.5 transition-colors"
                    >
                      <HelpCircle className="w-4 h-4 text-sky-400" />
                      <span>Request Info</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-[#090d16] border border-[#161f33] text-xs font-mono text-slate-300 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  <span>
                    Decided: {selectedApproval.status} by {selectedApproval.decidedBy || 'Human Lead'} (
                    {selectedApproval.decisionNotes || 'No notes'})
                  </span>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500 font-mono text-xs">
              Select an approval request to review.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
