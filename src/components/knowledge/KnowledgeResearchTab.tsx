import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Search,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Tag,
  Clock,
  Sparkles,
  AlertCircle,
  Cpu,
} from 'lucide-react';
import { ResearchRecord } from '../../types';
import { researchService } from '../../services/researchService';

interface KnowledgeResearchTabProps {
  projectId: string;
}

export const KnowledgeResearchTab: React.FC<KnowledgeResearchTabProps> = ({ projectId }) => {
  const [researchList, setResearchList] = useState<ResearchRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<ResearchRecord | null>(null);
  const [queryInput, setQueryInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const loadResearch = async () => {
    const list = await researchService.getResearchRecords(projectId);
    setResearchList(list);
    if (!selectedRecord && list.length > 0) {
      setSelectedRecord(list[0]);
    } else if (selectedRecord) {
      const refreshed = list.find((r) => r.id === selectedRecord.id);
      if (refreshed) setSelectedRecord(refreshed);
    }
  };

  useEffect(() => {
    loadResearch();
  }, [projectId]);

  const handleRunQuery = async () => {
    if (!queryInput.trim()) return;
    setIsSearching(true);
    try {
      const rec = await researchService.conductResearch(
        projectId,
        queryInput,
        'Research Agent (Gemini 2.5 Grounded)'
      );
      setQueryInput('');
      loadResearch();
      setSelectedRecord(rec);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Research Search & Query Bar */}
      <div className="bg-[#0d121f] p-4 rounded-xl border border-[#1c2438] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-purple-400" />
            <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
              Autonomous Game Development Research
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            Provider: Grounded Research Engine (Strict Source Verification)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Ask a technical or design research question (e.g. 'Godot 4.3 WebAssembly bone limits')..."
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRunQuery()}
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#111726] border border-[#1e2638] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono"
          />
          <button
            onClick={handleRunQuery}
            disabled={isSearching || !queryInput.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white text-xs font-bold font-mono transition-all shadow-md shadow-purple-600/30"
          >
            {isSearching ? (
              <>
                <Clock className="w-3.5 h-3.5 animate-spin" />
                Researching...
              </>
            ) : (
              <>
                <Search className="w-3.5 h-3.5" />
                Conduct Research
              </>
            )}
          </button>
        </div>
      </div>

      {/* Split Layout: Research Records List vs Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Records List */}
        <div className="lg:col-span-5 space-y-2 max-h-[75vh] overflow-y-auto custom-scrollbar pr-1">
          {researchList.map((rec) => {
            const isSelected = selectedRecord?.id === rec.id;
            return (
              <div
                key={rec.id}
                onClick={() => setSelectedRecord(rec)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-[#141c30] border-purple-500 ring-1 ring-purple-500/30'
                    : 'bg-[#0d121f] border-[#1c2438] hover:border-[#283552]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="text-xs font-bold text-white font-mono leading-snug">
                    {rec.query}
                  </div>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 shrink-0">
                    {rec.confidence}
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">{rec.summary}</p>

                <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-[#182133] text-[10px] text-slate-500 font-mono">
                  <span>{rec.sources.length} sources grounded</span>
                  <span>{rec.retrievedAt.split('T')[0]}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Record Inspector */}
        <div className="lg:col-span-7 bg-[#0d121f] border border-[#1c2438] rounded-xl flex flex-col h-[75vh] overflow-hidden">
          {selectedRecord ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-[#1c2438] bg-[#101626] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                    {selectedRecord.status} RESEARCH
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    Agent: {selectedRecord.retrievedBy}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white font-mono">
                  «{selectedRecord.query}»
                </h3>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-5 bg-[#0a0e17]">
                {/* Synthesis Summary */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                    Synthesis & Executive Summary
                  </h4>
                  <div className="p-3.5 rounded-xl bg-[#0f1422] border border-[#1c2438] text-xs text-slate-200 leading-relaxed">
                    {selectedRecord.summary}
                  </div>
                </div>

                {/* Grounded Findings with Fact Types */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                    Grounded Findings & Fact Classification
                  </h4>
                  <div className="space-y-2">
                    {selectedRecord.findings.map((f, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl bg-[#0e1320] border border-[#182033] space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded ${
                              f.factType === 'PROJECT_FACT'
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : f.factType === 'RESEARCH_FACT'
                                ? 'bg-sky-500/10 text-sky-400'
                                : f.factType === 'USER_DECISION'
                                ? 'bg-amber-500/10 text-amber-400'
                                : 'bg-purple-500/10 text-purple-400'
                            }`}
                          >
                            {f.factType.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed font-sans">{f.text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sources & Citations */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                    Verified Sources & References
                  </h4>
                  <div className="space-y-1.5">
                    {selectedRecord.sources.map((src, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-[#0d121f] border border-[#1a2336] text-xs font-mono text-slate-300"
                      >
                        <span className="truncate">{src}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-500 shrink-0 ml-2" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-3 bg-[#0e1320] border-t border-[#182033] flex items-center justify-between text-[10px] font-mono text-slate-500">
                <div>Confidence: {selectedRecord.confidence}</div>
                <div>Retrieved: {selectedRecord.retrievedAt}</div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
              <BookOpen className="w-8 h-8 text-slate-600 mb-2" />
              <span className="text-xs font-mono">Select a research record to inspect findings</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
