import React, { useState } from 'react';
import {
  Brain,
  Plus,
  Search,
  Filter,
  Layers,
  Sparkles,
  BookOpen,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Tag,
  Clock,
  Bot,
  ExternalLink,
  ChevronRight,
  Shield,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MemoryCategory, MemoryEntry, DevelopmentDecision } from '../../types';

const CATEGORIES: { id: MemoryCategory; label: string; count?: number }[] = [
  { id: 'GAME_VISION', label: 'Game Vision' },
  { id: 'GAME_DESIGN', label: 'Game Design' },
  { id: 'TECHNICAL_ARCHITECTURE', label: 'Technical Architecture' },
  { id: 'GAMEPLAY_SYSTEMS', label: 'Gameplay Systems' },
  { id: 'CHARACTERS', label: 'Characters' },
  { id: 'CREATURES', label: 'Creatures' },
  { id: 'WORLD', label: 'World' },
  { id: 'LEVELS', label: 'Levels' },
  { id: 'QUESTS', label: 'Quests' },
  { id: 'ITEMS', label: 'Items' },
  { id: 'COMBAT', label: 'Combat' },
  { id: 'UI', label: 'UI' },
  { id: 'AUDIO', label: 'Audio' },
  { id: 'ASSETS', label: 'Assets' },
  { id: 'CURRENT_DEVELOPMENT_STATUS', label: 'Development Status' },
  { id: 'KNOWN_BUGS', label: 'Known Bugs' },
  { id: 'DECISIONS', label: 'Decisions' },
  { id: 'IMPORTANT_CONSTRAINTS', label: 'Important Constraints' },
  { id: 'FUTURE_FEATURES', label: 'Future Features' },
];

export const ProjectMemoryPage: React.FC = () => {
  const {
    currentProject,
    memories,
    decisions,
    saveMemory,
    deleteMemory,
    createDecision,
    updateDecisionStatus,
    getMemorySnapshot,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'memories' | 'decisions' | 'json'>('memories');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal / Form state for new memory entry
  const [isAddingMemory, setIsAddingMemory] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<MemoryCategory>('GAMEPLAY_SYSTEMS');
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState('');

  // Modal / Form state for new decision
  const [isAddingDecision, setIsAddingDecision] = useState(false);
  const [decisionTitle, setDecisionTitle] = useState('');
  const [decisionReason, setDecisionReason] = useState('');
  const [decisionCategory, setDecisionCategory] = useState('Core Architecture');

  // JSON Snapshot viewer
  const [snapshotJson, setSnapshotJson] = useState<string>('');
  const [loadingSnapshot, setLoadingSnapshot] = useState(false);

  // Filter memories
  const filteredMemories = memories.filter((mem) => {
    if (selectedCategory !== 'all' && mem.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = mem.title.toLowerCase().includes(q);
      const matchContent = mem.content.toLowerCase().includes(q);
      const matchTag = mem.tags?.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchContent && !matchTag) return false;
    }
    return true;
  });

  const handleSaveMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    await saveMemory({
      category: newCategory,
      title: newTitle,
      content: newContent,
      tags: newTags ? newTags.split(',').map((t) => t.trim()) : [newCategory],
      authorAgent: 'Game Architect',
    });

    setNewTitle('');
    setNewContent('');
    setNewTags('');
    setIsAddingMemory(false);
  };

  const handleSaveDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!decisionTitle.trim() || !decisionReason.trim()) return;

    await createDecision({
      title: decisionTitle,
      reason: decisionReason,
      category: decisionCategory,
      createdBy: 'Game Architect',
    });

    setDecisionTitle('');
    setDecisionReason('');
    setIsAddingDecision(false);
  };

  const handleLoadSnapshot = async () => {
    setLoadingSnapshot(true);
    try {
      const snap = await getMemorySnapshot();
      setSnapshotJson(JSON.stringify(snap, null, 2));
    } finally {
      setLoadingSnapshot(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono font-semibold tracking-wider uppercase">
            <Brain className="w-3.5 h-3.5" />
            <span>PROJECT MEMORY & KNOWLEDGE REPOSITORY</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight mt-1">
            Project Memory ({memories.length} Records)
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Structured game vision, design pillars, architecture constraints, and decisions for {currentProject.name}.
          </p>
        </div>

        {/* Tab Controls & Add Action */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex rounded-xl bg-[#111726] border border-[#202b40] p-1 text-xs font-mono">
            <button
              onClick={() => setActiveTab('memories')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'memories'
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              18 Categories ({memories.length})
            </button>
            <button
              onClick={() => setActiveTab('decisions')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'decisions'
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Decisions ({decisions.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('json');
                handleLoadSnapshot();
              }}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'json'
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              AI Snapshot
            </button>
          </div>

          {activeTab === 'memories' ? (
            <button
              onClick={() => setIsAddingMemory(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-mono text-xs font-semibold shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Memory</span>
            </button>
          ) : activeTab === 'decisions' ? (
            <button
              onClick={() => setIsAddingDecision(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-mono text-xs font-semibold shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Decision</span>
            </button>
          ) : null}
        </div>
      </div>

      {/* MODAL: Add Memory Entry */}
      {isAddingMemory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-2xl bg-[#0e1320] border border-[#26344d] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1b2538]">
              <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                <Brain className="w-4 h-4 text-indigo-400" />
                Add Project Memory Record
              </h3>
              <button
                onClick={() => setIsAddingMemory(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMemory} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  Category (Section 12)
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as MemoryCategory)}
                  className="w-full px-3 py-2 rounded-xl bg-[#141b2b] border border-[#233048] text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label} ({c.id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Kinetic Elemental Affinities"
                  className="w-full px-3 py-2 rounded-xl bg-[#141b2b] border border-[#233048] text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  Structured Content / Specifications
                </label>
                <textarea
                  rows={4}
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Detailed architectural requirements, formulas, design constraints..."
                  className="w-full px-3 py-2 rounded-xl bg-[#141b2b] border border-[#233048] text-xs text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="Combat, Physics, Mobile, Kinematics"
                  className="w-full px-3 py-2 rounded-xl bg-[#141b2b] border border-[#233048] text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingMemory(false)}
                  className="px-4 py-2 rounded-xl bg-[#141b2b] text-slate-300 border border-[#233048] text-xs font-mono hover:bg-[#1a2336]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-bold shadow-md"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Record Development Decision */}
      {isAddingDecision && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-2xl bg-[#0e1320] border border-[#26344d] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1b2538]">
              <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                Record Architectural Decision
              </h3>
              <button
                onClick={() => setIsAddingDecision(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveDecision} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  Decision Statement
                </label>
                <input
                  type="text"
                  required
                  value={decisionTitle}
                  onChange={(e) => setDecisionTitle(e.target.value)}
                  placeholder="e.g. Combat system uses real-time 3D combat instead of turn-based menus"
                  className="w-full px-3 py-2 rounded-xl bg-[#141b2b] border border-[#233048] text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  Reason & Architectural Rationale
                </label>
                <textarea
                  rows={3}
                  required
                  value={decisionReason}
                  onChange={(e) => setDecisionReason(e.target.value)}
                  placeholder="e.g. Designed for mobile-friendly action gameplay and satisfying physical feedback."
                  className="w-full px-3 py-2 rounded-xl bg-[#141b2b] border border-[#233048] text-xs text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Category</label>
                <input
                  type="text"
                  value={decisionCategory}
                  onChange={(e) => setDecisionCategory(e.target.value)}
                  placeholder="Combat, Physics, Engine, Networking"
                  className="w-full px-3 py-2 rounded-xl bg-[#141b2b] border border-[#233048] text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingDecision(false)}
                  className="px-4 py-2 rounded-xl bg-[#141b2b] text-slate-300 border border-[#233048] text-xs font-mono hover:bg-[#1a2336]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold shadow-md"
                >
                  Save Decision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW 1: 18 Categories Memory Explorer */}
      {activeTab === 'memories' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-[#0d121c] border border-[#1e283c]">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search vision, systems, characters, bugs..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#121827] border border-[#1f293d] text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-slate-400 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Category:
              </span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-[#121827] border border-[#1f293d] text-slate-300 focus:outline-none focus:border-indigo-500 max-w-xs"
              >
                <option value="all">All Categories ({memories.length})</option>
                {CATEGORIES.map((cat) => {
                  const catCount = memories.filter((m) => m.category === cat.id).length;
                  return (
                    <option key={cat.id} value={cat.id}>
                      {cat.label} ({catCount})
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Memory Records Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMemories.length === 0 ? (
              <div className="col-span-full py-16 text-center rounded-2xl border border-dashed border-[#202b3e] bg-[#0c101a] p-8 space-y-3">
                <Brain className="w-8 h-8 text-indigo-400/60 mx-auto" />
                <h3 className="text-sm font-mono font-bold text-white">No memory entries found</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  No records match the current filter. Add a new record or reset the search query.
                </p>
                <button
                  onClick={() => setIsAddingMemory(true)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-semibold transition-all"
                >
                  + Add First Entry
                </button>
              </div>
            ) : (
              filteredMemories.map((mem) => (
                <div
                  key={mem.id}
                  className="group flex flex-col justify-between p-4 rounded-2xl bg-[#0c101a] hover:bg-[#101624] border border-[#1e283c] hover:border-indigo-500/40 shadow-lg transition-all space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                        {mem.category.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        v{mem.version || 1}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white font-mono group-hover:text-indigo-300 transition-colors">
                      {mem.title}
                    </h4>

                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-4 whitespace-pre-line">
                      {mem.content}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#182133] space-y-2">
                    {/* Tags */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {mem.tags?.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-1.5 py-0.5 rounded bg-[#141b2a] border border-[#212c40] text-[10px] font-mono text-slate-400 flex items-center gap-1"
                        >
                          <Tag className="w-2.5 h-2.5 text-indigo-400" />
                          <span>{tag}</span>
                        </span>
                      ))}
                    </div>

                    {/* Footer meta & actions */}
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1">
                      <span className="flex items-center gap-1">
                        <Bot className="w-3 h-3 text-indigo-400" />
                        <span>{mem.authorAgent || 'Game Architect'}</span>
                      </span>

                      <div className="flex items-center gap-2">
                        <span>{mem.updatedAt?.split('T')[0] || 'Recently'}</span>
                        <button
                          onClick={() => deleteMemory(mem.id)}
                          className="text-slate-400 hover:text-rose-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Delete memory"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: Development Decisions System (Section 13) */}
      {activeTab === 'decisions' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-[#0c101a] border border-[#1e283c] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Shield className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  ARCHITECTURAL DECISION RECORDS (ADR)
                </h3>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Explicit technical and design choices tracked so future AI agents respect project constraints.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsAddingDecision(true)}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-semibold transition-all"
            >
              + Record Decision
            </button>
          </div>

          <div className="space-y-3">
            {decisions.map((dec) => (
              <div
                key={dec.id}
                className="p-4 rounded-2xl bg-[#0c101a] border border-[#1e283c] hover:border-emerald-500/40 shadow-lg transition-all space-y-2.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border ${
                        dec.status === 'ACTIVE'
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          : dec.status === 'SUPERSEDED'
                          ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                          : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                      }`}
                    >
                      {dec.status}
                    </span>
                    <span className="text-[10px] font-mono text-indigo-400 font-semibold">
                      {dec.category || 'Architecture'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                    <span className="flex items-center gap-1">
                      <Bot className="w-3 h-3 text-indigo-400" />
                      <span>{dec.createdBy}</span>
                    </span>
                    <span>•</span>
                    <span>{dec.date}</span>
                    <div className="flex items-center gap-1 ml-2">
                      <button
                        onClick={() =>
                          updateDecisionStatus(
                            dec.id,
                            dec.status === 'ACTIVE' ? 'SUPERSEDED' : 'ACTIVE'
                          )
                        }
                        className="px-2 py-0.5 rounded bg-[#161f30] hover:bg-[#1d293f] text-slate-300 text-[10px]"
                      >
                        {dec.status === 'ACTIVE' ? 'Mark Superseded' : 'Reactivate'}
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white font-mono leading-snug">
                    "{dec.title}"
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed bg-[#101522] p-2.5 rounded-lg border border-[#192233]">
                    <span className="text-indigo-400 font-semibold font-mono">Rationale: </span>
                    {dec.reason}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 3: AI Agent Snapshot (Section 28) */}
      {activeTab === 'json' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-[#0c101a] border border-[#1e283c] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <FileCode className="w-5 h-5 text-indigo-400 shrink-0" />
              <div>
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  STRUCTURED PROJECT MEMORY SNAPSHOT (SECTION 28)
                </h3>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Standardized JSON schema payload that will be provided to autonomous AI models in Phase 3.
                </p>
              </div>
            </div>

            <button
              onClick={handleLoadSnapshot}
              disabled={loadingSnapshot}
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-semibold transition-all disabled:opacity-50"
            >
              {loadingSnapshot ? 'Refreshing...' : 'Refresh Snapshot'}
            </button>
          </div>

          <div className="relative rounded-2xl bg-[#080b12] border border-[#1e283c] p-4 font-mono text-xs text-slate-300 overflow-x-auto custom-scrollbar max-h-[600px]">
            <pre>{snapshotJson || 'Loading memory snapshot...'}</pre>
          </div>
        </div>
      )}
    </div>
  );
};
