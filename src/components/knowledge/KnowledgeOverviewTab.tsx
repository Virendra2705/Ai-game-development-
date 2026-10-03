import React, { useState, useEffect } from 'react';
import {
  FileText,
  Brain,
  Clock,
  Sparkles,
  AlertTriangle,
  HelpCircle,
  Search,
  CheckCircle2,
  Layers,
  ArrowRight,
  ShieldAlert,
  Send,
  BookOpen,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import {
  KnowledgeHealthReport,
  KnowledgeQuestion,
  KnowledgeConflict,
} from '../../types';
import { knowledgeBaseService } from '../../services/knowledgeBaseService';
import { memoryService } from '../../services/memoryService';
import { decisionService } from '../../services/decisionService';
import { researchService } from '../../services/researchService';
import { memoryExtractionService } from '../../services/memoryExtractionService';
import { knowledgeSearchService, KnowledgeSearchResponse } from '../../services/knowledgeSearchService';

interface KnowledgeOverviewTabProps {
  projectId: string;
  onOpenTestModal: () => void;
  onOpenImportModal: () => void;
  onOpenConflictModal: (conflict: KnowledgeConflict) => void;
  onNavigateTab: (tab: string) => void;
}

export const KnowledgeOverviewTab: React.FC<KnowledgeOverviewTabProps> = ({
  projectId,
  onOpenTestModal,
  onOpenImportModal,
  onOpenConflictModal,
  onNavigateTab,
}) => {
  const [health, setHealth] = useState<KnowledgeHealthReport | null>(null);
  const [docCount, setDocCount] = useState(0);
  const [memCount, setMemCount] = useState(0);
  const [decCount, setDecCount] = useState(0);
  const [resCount, setResCount] = useState(0);
  const [learnedCount, setLearnedCount] = useState(0);
  const [conflicts, setConflicts] = useState<KnowledgeConflict[]>([]);
  const [questions, setQuestions] = useState<KnowledgeQuestion[]>([]);
  const [answeringId, setAnsweringId] = useState<string | null>(null);
  const [answerInput, setAnswerInput] = useState('');

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<KnowledgeSearchResponse | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const sampleQueries = [
    'How does creature capture work?',
    'What abilities does Sparkit have?',
    'Which files control battle damage?',
    'Why was the capture system changed?',
    'What bugs currently affect inventory?',
    'What assets are missing for Route 1?',
  ];

  const loadData = async () => {
    try {
      const [h, docs, mems, decs, res, learns, qs] = await Promise.all([
        knowledgeBaseService.getKnowledgeHealth(projectId),
        knowledgeBaseService.getDocuments(projectId),
        memoryService.getMemories(projectId),
        decisionService.getDecisions(projectId),
        researchService.getResearchRecords(projectId),
        memoryExtractionService.getLearnings(projectId),
        knowledgeBaseService.getQuestions(projectId),
      ]);
      setHealth(h);
      setDocCount(docs.length);
      setMemCount(mems.length);
      setDecCount(decs.length);
      setResCount(res.length);
      setLearnedCount(learns.length);
      setQuestions(qs);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, [projectId]);

  const handleSearch = async (queryToRun?: string) => {
    const q = queryToRun !== undefined ? queryToRun : searchQuery;
    if (!q.trim()) {
      setSearchResult(null);
      return;
    }
    setIsSearching(true);
    try {
      const res = await knowledgeSearchService.searchKnowledge(projectId, q);
      setSearchResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAnswerQuestion = async (qId: string) => {
    if (!answerInput.trim()) return;
    await knowledgeBaseService.answerQuestion(projectId, qId, answerInput);
    setAnsweringId(null);
    setAnswerInput('');
    loadData();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Knowledge Health Dashboard */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#111726] via-[#141d33] to-[#0f172a] border border-[#1e2942] relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Phase 8 Knowledge Core
              </span>
              <span className="text-xs text-slate-400 font-mono">Project Memory & Semantic Retrieval</span>
            </div>
            <h2 className="text-xl font-bold text-white font-mono">
              Embervale: Rift Tamers — Knowledge Base
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Long-term design specifications, technical architecture, validated research, and agent learnings.
              Autonomous context retrieval guarantees every coding and asset agent acts on authoritative canon.
            </p>
          </div>

          {/* Health Score Box */}
          <div className="flex items-center gap-4 bg-[#0a0e18]/80 backdrop-blur-md p-4 rounded-xl border border-[#1b2438] shrink-0">
            <div className="flex flex-col items-center justify-center w-16 h-16 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <span className="text-2xl font-black font-mono">{health?.healthScore || 92}</span>
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Health</span>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{health?.verifiedKnowledgeCount || 16} Verified Elements</span>
              </div>
              <div className="flex items-center gap-2 text-amber-400 font-mono">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{health?.unverifiedKnowledgeCount || 2} Unverified Elements</span>
              </div>
              <div className="flex items-center gap-2 text-rose-400 font-mono">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>{health?.conflictsCount || 1} Open Conflict</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Action Bar */}
        <div className="mt-5 pt-4 border-t border-[#1e2942]/60 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenTestModal}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold transition-all shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Run Embervale Sparkit Test
            </button>
            <button
              onClick={onOpenImportModal}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#1a233a] hover:bg-[#222e4c] border border-[#2b3a5d] text-slate-200 text-xs font-medium transition-all"
            >
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              Import Knowledge Document
            </button>
            <button
              onClick={() => onNavigateTab('research')}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#1a233a] hover:bg-[#222e4c] border border-[#2b3a5d] text-slate-200 text-xs font-medium transition-all"
            >
              <BookOpen className="w-3.5 h-3.5 text-sky-400" />
              Research Query
            </button>
          </div>

          <div className="text-[11px] text-slate-400 font-mono">
            Provider: <span className="text-slate-200">Gemini 2.5 Pro / Flash Grounded</span>
          </div>
        </div>
      </div>

      {/* 8 Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div
          onClick={() => onNavigateTab('documents')}
          className="p-4 rounded-xl bg-[#0d121f] border border-[#1c2438] hover:border-indigo-500/40 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Total Documents</span>
            <FileText className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white">{docCount}</div>
          <div className="text-[10px] text-slate-500 mt-1 font-mono">Creatures, Systems, Tech</div>
        </div>

        <div
          onClick={() => onNavigateTab('memory')}
          className="p-4 rounded-xl bg-[#0d121f] border border-[#1c2438] hover:border-indigo-500/40 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Knowledge Entries</span>
            <Brain className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white">{memCount}</div>
          <div className="text-[10px] text-slate-500 mt-1 font-mono">Project Memory Store</div>
        </div>

        <div
          onClick={() => onNavigateTab('history')}
          className="p-4 rounded-xl bg-[#0d121f] border border-[#1c2438] hover:border-indigo-500/40 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Recently Learned</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white">{learnedCount}</div>
          <div className="text-[10px] text-slate-500 mt-1 font-mono">Extracted Agent Learnings</div>
        </div>

        <div
          onClick={() => onNavigateTab('decisions')}
          className="p-4 rounded-xl bg-[#0d121f] border border-[#1c2438] hover:border-indigo-500/40 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Project Decisions</span>
            <Layers className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white">{decCount}</div>
          <div className="text-[10px] text-slate-500 mt-1 font-mono">Architecture & Design</div>
        </div>

        <div
          onClick={() => onNavigateTab('research')}
          className="p-4 rounded-xl bg-[#0d121f] border border-[#1c2438] hover:border-indigo-500/40 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Research Sources</span>
            <BookOpen className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white">{resCount}</div>
          <div className="text-[10px] text-slate-500 mt-1 font-mono">Grounded Findings</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0d121f] border border-[#1c2438]">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Unverified Info</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-300">
            {health?.unverifiedKnowledgeCount || 2}
          </div>
          <div className="text-[10px] text-slate-500 mt-1 font-mono">Requires Verification</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0d121f] border border-[#1c2438]">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Conflicting Info</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl font-bold font-mono text-rose-300">
            {health?.conflictsCount || 1}
          </div>
          <div className="text-[10px] text-slate-500 mt-1 font-mono">Contradictions Detected</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0d121f] border border-[#1c2438]">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Orphaned Assets</span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-300">
            {health?.orphanedAssetsCount || 0}
          </div>
          <div className="text-[10px] text-slate-500 mt-1 font-mono">Unreferenced in Code</div>
        </div>
      </div>

      {/* Deep Knowledge Search */}
      <div className="p-5 rounded-2xl bg-[#0d121f] border border-[#1c2438] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white font-mono">Project-Wide Knowledge Search</h3>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">13 Facets Indexed</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search specifications, code systems, decisions, bugs, or assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#111726] border border-[#1e2638] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          </div>
          <button
            onClick={() => handleSearch()}
            disabled={isSearching}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30 font-mono"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* Suggested Queries */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-slate-500 font-medium">Try asking:</span>
          {sampleQueries.map((q, i) => (
            <button
              key={i}
              onClick={() => {
                setSearchQuery(q);
                handleSearch(q);
              }}
              className="px-2.5 py-1 rounded-lg bg-[#141b2c] hover:bg-[#1b253d] border border-[#1f2940] text-[11px] text-slate-300 font-mono transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Search Results */}
        {searchResult && (
          <div className="pt-4 border-t border-[#1c2438] space-y-3 animate-in fade-in duration-150">
            {searchResult.answerSummary && (
              <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-800/40 space-y-1.5">
                <div className="text-[11px] font-bold text-indigo-300 font-mono flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  GROUNDED ANSWER SUMMARY
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-sans">
                  {searchResult.answerSummary}
                </p>
              </div>
            )}

            <div className="text-xs text-slate-400 font-mono">
              Found {searchResult.totalResults} matching results for «{searchResult.query}»:
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar pr-1">
              {searchResult.results.map((res) => (
                <div
                  key={res.id}
                  className="p-3 rounded-xl bg-[#111726] border border-[#1a2336] hover:border-[#283652] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white font-mono">{res.title}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#182133] text-slate-300 font-mono">
                        {res.projectSection}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono">
                        {res.confidence}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">{res.snippet}</p>
                  <div className="text-[10px] text-slate-500 mt-1.5 font-mono">
                    Source: {res.source} • Date: {res.date}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Warnings & Missing Knowledge Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Knowledge Questions & Ambiguities */}
        <div className="p-5 rounded-2xl bg-[#0d121f] border border-[#1c2438] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white font-mono">Missing Information & Questions</h3>
            </div>
            <span className="text-[11px] font-mono text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
              {questions.filter((q) => q.status === 'UNANSWERED').length} Unanswered
            </span>
          </div>

          <div className="space-y-3">
            {questions.map((q) => (
              <div
                key={q.id}
                className="p-3.5 rounded-xl bg-[#111726] border border-[#1a2336] space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="text-xs font-bold text-white leading-snug">{q.question}</div>
                  <span
                    className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded shrink-0 ${
                      q.status === 'ANSWERED'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-amber-500/10 text-amber-400'
                    }`}
                  >
                    {q.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">{q.reason}</p>

                {q.status === 'ANSWERED' && q.userAnswer && (
                  <div className="p-2 rounded-lg bg-[#090d16] border border-[#161f33] text-[11px] text-emerald-300 font-mono">
                    <strong>Resolution:</strong> {q.userAnswer}
                  </div>
                )}

                {q.status === 'UNANSWERED' && answeringId === q.id && (
                  <div className="space-y-2 pt-2 border-t border-[#1a2336]">
                    <textarea
                      rows={2}
                      placeholder="Type authoritative design decision or canon rule..."
                      value={answerInput}
                      onChange={(e) => setAnswerInput(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#090d16] border border-[#1f2b45] text-xs text-white focus:outline-none focus:border-indigo-500 font-mono resize-none"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setAnsweringId(null)}
                        className="px-2.5 py-1 text-xs text-slate-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleAnswerQuestion(q.id)}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold font-mono"
                      >
                        <Send className="w-3 h-3" />
                        Save as Canon
                      </button>
                    </div>
                  </div>
                )}

                {q.status === 'UNANSWERED' && answeringId !== q.id && (
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-slate-500 font-mono">Options: Ask User, Research, Inspect Code</span>
                    <button
                      onClick={() => {
                        setAnsweringId(q.id);
                        setAnswerInput(q.suggestedAnswers?.[0] || '');
                      }}
                      className="text-xs font-bold text-indigo-400 hover:text-indigo-300 font-mono"
                    >
                      Answer / Decide →
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Health Warnings & Contradictions */}
        <div className="p-5 rounded-2xl bg-[#0d121f] border border-[#1c2438] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <h3 className="text-sm font-bold text-white font-mono">Knowledge System Alerts</h3>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              {health?.warnings.length || 0} active notices
            </span>
          </div>

          <div className="space-y-3">
            {health?.warnings.map((w, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3.5 rounded-xl bg-[#111726] border border-[#1a2336]"
              >
                <div
                  className={`flex items-center justify-center w-6 h-6 rounded-full shrink-0 mt-0.5 ${
                    w.severity === 'CRITICAL'
                      ? 'bg-rose-500/20 text-rose-400'
                      : w.severity === 'WARNING'
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-indigo-500/20 text-indigo-400'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                      {w.severity} ALERT
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 mt-0.5 leading-relaxed">{w.message}</p>
                </div>
              </div>
            ))}

            <div className="p-3.5 rounded-xl bg-[#10172a] border border-[#1e2942] flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white font-mono">Sparkit Evolution Level Contradiction</div>
                <div className="text-[11px] text-slate-400">GDD specifies Lv 20; Combat draft specifies Lv 25.</div>
              </div>
              <button
                onClick={() =>
                  onOpenConflictModal({
                    id: 'conflict-sparkit-level',
                    projectId,
                    title: 'Sparkit Evolution Level Discrepancy',
                    reason: 'Two documents provide differing evolution levels for Sparkit -> Voltrik.',
                    sourceA: {
                      id: 'doc-sparkit-spec',
                      title: 'Sparkit Creature Specification',
                      type: 'DOCUMENT',
                      statement: 'Evolves into Voltrik at Level 20 when exposed to Charged Rift Shard.',
                    },
                    sourceB: {
                      id: 'draft-combat-notes',
                      title: 'Combat Level Progression Draft',
                      type: 'DOCUMENT',
                      statement: 'Sparkit evolves at Level 25 during high-altitude lightning storms.',
                    },
                    severity: 'HIGH',
                    status: 'OPEN',
                    detectedAt: '2026-09-19T10:00:00Z',
                  })
                }
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold font-mono transition-colors"
              >
                Resolve
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
