import React, { useState, useEffect } from 'react';
import {
  Brain,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  History,
  Tag,
  ShieldCheck,
  Edit2,
  Trash2,
} from 'lucide-react';
import { MemoryEntry, MemoryCategory } from '../../types';
import { memoryService } from '../../services/memoryService';

interface KnowledgeMemoryTabProps {
  projectId: string;
}

export const KnowledgeMemoryTab: React.FC<KnowledgeMemoryTabProps> = ({ projectId }) => {
  const [memories, setMemories] = useState<MemoryEntry[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<MemoryCategory>('GAME_DESIGN');

  const loadMemories = async () => {
    const list = await memoryService.getMemories(
      projectId,
      selectedCategory === 'ALL' ? undefined : (selectedCategory as MemoryCategory)
    );
    setMemories(list);
  };

  useEffect(() => {
    loadMemories();
  }, [projectId, selectedCategory]);

  const handleSaveNew = async () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    await memoryService.saveMemory({
      projectId,
      title: newTitle,
      content: newContent,
      category: newCategory,
      tags: [newCategory, 'Project Memory'],
      priority: 'HIGH',
      confidence: 'VERIFIED',
    });
    setIsAdding(false);
    setNewTitle('');
    setNewContent('');
    loadMemories();
  };

  const categories = [
    'ALL',
    'PROJECT_GOALS',
    'GAMEPLAY_SYSTEMS',
    'CREATURES',
    'COMBAT',
    'TECHNICAL_ARCHITECTURE',
    'CONSTRAINTS',
    'DESIGN_DECISIONS',
    'AGENT_LEARNINGS',
  ];

  const filteredMemories = memories.filter((m) => {
    const text = `${m.title} ${m.content} ${m.tags.join(' ')}`.toLowerCase();
    return text.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-4">
      {/* Action and Filter Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#0d121f] p-4 rounded-xl border border-[#1c2438]">
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-[#151c2e]'
              }`}
            >
              {cat.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-60">
            <input
              type="text"
              placeholder="Search memories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#111726] border border-[#1e2638] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
            />
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
          </div>
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold font-mono transition-all shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Memory
          </button>
        </div>
      </div>

      {/* New Memory Drawer / Box */}
      {isAdding && (
        <div className="p-4 rounded-xl bg-[#101726] border border-emerald-500/40 space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
              Add New Authoritative Memory
            </h4>
            <button
              onClick={() => setIsAdding(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Memory Title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="sm:col-span-2 px-3 py-1.5 rounded-lg bg-[#090d16] border border-[#1b253b] text-xs text-white font-mono focus:border-emerald-500"
            />
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as MemoryCategory)}
              className="px-3 py-1.5 rounded-lg bg-[#090d16] border border-[#1b253b] text-xs text-white font-mono focus:border-emerald-500"
            >
              {categories.filter((c) => c !== 'ALL').map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <textarea
            rows={3}
            placeholder="Authoritative memory statements and canon facts..."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-[#090d16] border border-[#1b253b] text-xs text-white font-mono focus:border-emerald-500 resize-none"
          />
          <div className="flex justify-end">
            <button
              onClick={handleSaveNew}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold font-mono transition-colors"
            >
              Save Memory
            </button>
          </div>
        </div>
      )}

      {/* Memory Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMemories.map((mem) => (
          <div
            key={mem.id}
            className="p-4 rounded-xl bg-[#0d121f] border border-[#1c2438] hover:border-[#273552] transition-all space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-bold text-white font-mono">{mem.title}</span>
                <span
                  className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded ${
                    mem.confidence === 'VERIFIED'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}
                >
                  {mem.confidence || 'VERIFIED'}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-sans leading-relaxed">{mem.content}</p>
            </div>

            <div className="pt-3 border-t border-[#182133] flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-slate-500">
              <div className="flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                  {mem.category}
                </span>
                {mem.priority && (
                  <span className="px-1.5 py-0.5 rounded bg-indigo-950/40 text-indigo-300">
                    {mem.priority}
                  </span>
                )}
              </div>
              <div>Updated {mem.updatedAt.split('T')[0]}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
