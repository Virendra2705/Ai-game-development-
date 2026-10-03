import React, { useState, useEffect } from 'react';
import {
  Layers,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  FileText,
  User,
  Clock,
  ArrowRight,
  ShieldCheck,
  Plus,
} from 'lucide-react';
import { DevelopmentDecision } from '../../types';
import { decisionService } from '../../services/decisionService';

interface KnowledgeDecisionsTabProps {
  projectId: string;
}

export const KnowledgeDecisionsTab: React.FC<KnowledgeDecisionsTabProps> = ({ projectId }) => {
  const [decisions, setDecisions] = useState<DevelopmentDecision[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDecision, setSelectedDecision] = useState<DevelopmentDecision | null>(null);

  const loadDecisions = async () => {
    const list = await decisionService.getDecisions(projectId);
    setDecisions(list);
    if (!selectedDecision && list.length > 0) {
      setSelectedDecision(list[0]);
    } else if (selectedDecision) {
      const refreshed = list.find((d) => d.id === selectedDecision.id);
      if (refreshed) setSelectedDecision(refreshed);
    }
  };

  useEffect(() => {
    loadDecisions();
  }, [projectId]);

  const filteredDecisions = decisions.filter((d) => {
    const text = `${d.title} ${d.reason} ${d.decision || ''} ${d.category || ''}`.toLowerCase();
    return text.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-4">
      {/* Search Header */}
      <div className="flex items-center justify-between bg-[#0d121f] p-4 rounded-xl border border-[#1c2438]">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-sky-400" />
          <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
            Authoritative Architecture & Design Decisions
          </h3>
        </div>

        <div className="relative w-64">
          <input
            type="text"
            placeholder="Search decisions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#111726] border border-[#1e2638] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
          />
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
        </div>
      </div>

      {/* Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Decisions List */}
        <div className="lg:col-span-5 space-y-2 max-h-[75vh] overflow-y-auto custom-scrollbar pr-1">
          {filteredDecisions.map((dec) => {
            const isSelected = selectedDecision?.id === dec.id;
            return (
              <div
                key={dec.id}
                onClick={() => setSelectedDecision(dec)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-[#141c30] border-sky-500 ring-1 ring-sky-500/30'
                    : 'bg-[#0d121f] border-[#1c2438] hover:border-[#283552]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-bold text-white font-mono leading-snug">
                    {dec.title}
                  </span>
                  <span
                    className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded ${
                      (dec.status as string) === 'APPROVED' || dec.status === 'ACTIVE'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {dec.status}
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">{dec.reason}</p>

                <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-[#182133] text-[10px] text-slate-500 font-mono">
                  <span>By {dec.createdBy}</span>
                  <span>{dec.date}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Decision Inspector */}
        <div className="lg:col-span-7 bg-[#0d121f] border border-[#1c2438] rounded-xl flex flex-col h-[75vh] overflow-hidden">
          {selectedDecision ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-[#1c2438] bg-[#101626] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-sky-500/20 text-sky-300">
                    {selectedDecision.category || 'ARCHITECTURE'}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    Decision ID: {selectedDecision.id}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white font-mono">{selectedDecision.title}</h3>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-5 bg-[#0a0e17]">
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                    Rationale & Architectural Grounding
                  </h4>
                  <div className="p-3.5 rounded-xl bg-[#0f1422] border border-[#1c2438] text-xs text-slate-200 leading-relaxed font-sans">
                    {selectedDecision.reason}
                  </div>
                </div>

                {selectedDecision.decision && (
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                      Authoritative Policy / Directive
                    </h4>
                    <div className="p-3.5 rounded-xl bg-[#0e1424] border border-[#1d2945] text-xs text-sky-200 leading-relaxed font-mono">
                      {selectedDecision.decision}
                    </div>
                  </div>
                )}

                {selectedDecision.context && (
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                      Historical Context
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      {selectedDecision.context}
                    </p>
                  </div>
                )}

                {((selectedDecision.alternativesConsidered && selectedDecision.alternativesConsidered.length > 0) || (selectedDecision.alternatives && selectedDecision.alternatives.length > 0)) && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                      Alternatives Considered & Rejected
                    </h4>
                    <ul className="space-y-1">
                      {(selectedDecision.alternativesConsidered || selectedDecision.alternatives || []).map((alt: string, i: number) => (
                        <li
                          key={i}
                          className="text-xs text-slate-400 flex items-start gap-2 bg-[#0c101a] p-2.5 rounded-lg border border-[#161f33]"
                        >
                          <span className="text-rose-400 font-mono font-bold">✗</span>
                          <span>{alt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedDecision.relatedTasks && selectedDecision.relatedTasks.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                      Linked Tasks & Workflows
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedDecision.relatedTasks.map((t, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded bg-[#131a29] border border-[#1f2a40] text-xs font-mono text-slate-300"
                        >
                          Task #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-3 bg-[#0e1320] border-t border-[#182033] flex items-center justify-between text-[10px] font-mono text-slate-500">
                <div>Decided by: {selectedDecision.createdBy}</div>
                <div>Effective Date: {selectedDecision.date}</div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
              <Layers className="w-8 h-8 text-slate-600 mb-2" />
              <span className="text-xs font-mono">Select a decision to inspect</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
