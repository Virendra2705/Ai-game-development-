import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  FolderGit2,
  PlusCircle,
  CheckSquare,
  Bot,
  Hammer,
  Boxes,
  ShieldCheck,
  Settings,
  Terminal,
  Sparkles,
  ArrowRight,
  Play,
  RotateCcw,
  Brain,
  FileCode,
} from 'lucide-react';
import { useApp, NavigationTab } from '../../context/AppContext';

export const CommandPalette: React.FC = () => {
  const {
    commandPaletteOpen,
    setCommandPaletteOpen,
    setActiveTab,
    setCreateProjectModalOpen,
    setCreateTaskModalOpen,
    triggerBuild,
    runTestSuite,
    resetToDefaults,
    projects,
    tasks,
    agents,
    assets,
    builds,
    tests,
    memories,
    setCurrentProjectId,
  } = useApp();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [commandPaletteOpen]);

  interface SearchResultItem {
    id: string;
    title: string;
    subtitle?: string;
    category: 'Projects' | 'Tasks' | 'Agents' | 'Assets' | 'Builds' | 'Tests' | 'Memory' | 'Actions';
    icon: React.ElementType;
    badge?: string;
    action: () => void;
  }

  // Generate categorized results (Section 22)
  const results: SearchResultItem[] = useMemo(() => {
    const q = query.trim().toLowerCase();

    // Default actions if query is empty
    if (!q) {
      return [
        {
          id: 'action-dashboard',
          title: 'Open Dashboard',
          subtitle: 'Go to main development command center',
          category: 'Actions',
          icon: Terminal,
          badge: 'G D',
          action: () => setActiveTab('Dashboard'),
        },
        {
          id: 'action-create-proj',
          title: 'Create New Project',
          subtitle: 'Initialize game project repository',
          category: 'Actions',
          icon: PlusCircle,
          badge: 'C P',
          action: () => setCreateProjectModalOpen(true),
        },
        {
          id: 'action-create-task',
          title: 'Create Sprint Task',
          subtitle: 'Queue task for AI development agent',
          category: 'Actions',
          icon: CheckSquare,
          badge: 'C T',
          action: () => setCreateTaskModalOpen(true),
        },
        {
          id: 'action-memory',
          title: 'Open Project Memory',
          subtitle: 'Browse 18 design and architecture categories',
          category: 'Actions',
          icon: Brain,
          badge: 'G M',
          action: () => setActiveTab('Project Memory'),
        },
        {
          id: 'action-trigger-build',
          title: 'Trigger CI Build Pipeline',
          subtitle: 'Run headless compilation and asset packing',
          category: 'Actions',
          icon: Play,
          badge: 'BUILD',
          action: () => triggerBuild(),
        },
        {
          id: 'action-run-tests',
          title: 'Run QA Test Suite',
          subtitle: 'Execute full assertion matrix',
          category: 'Actions',
          icon: ShieldCheck,
          badge: 'TEST',
          action: () => runTestSuite(),
        },
      ];
    }

    const matched: SearchResultItem[] = [];

    // 1. Projects
    projects.forEach((p) => {
      if (p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.engine.toLowerCase().includes(q)) {
        matched.push({
          id: `proj-${p.id}`,
          title: p.name,
          subtitle: `${p.engine} • ${p.platform} • ${p.progress}% progress`,
          category: 'Projects',
          icon: FolderGit2,
          badge: p.engine,
          action: () => {
            setCurrentProjectId(p.id);
            setActiveTab('Dashboard');
          },
        });
      }
    });

    // 2. Tasks
    tasks.forEach((t) => {
      if (t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.status.toLowerCase().includes(q)) {
        matched.push({
          id: `task-${t.id}`,
          title: t.title,
          subtitle: `${t.status} • Priority: ${t.priority} • ${t.progress}%`,
          category: 'Tasks',
          icon: CheckSquare,
          badge: t.status,
          action: () => setActiveTab('Tasks'),
        });
      }
    });

    // 3. Agents
    agents.forEach((a) => {
      if (a.name.toLowerCase().includes(q) || a.role.toLowerCase().includes(q) || (a.specialty && a.specialty.toLowerCase().includes(q))) {
        matched.push({
          id: `agent-${a.id}`,
          title: a.name,
          subtitle: `${a.role} • ${a.status} • ${a.specialty || a.description.slice(0, 40)}`,
          category: 'Agents',
          icon: Bot,
          badge: a.role,
          action: () => setActiveTab('AI Agents'),
        });
      }
    });

    // 4. Assets
    assets.forEach((ast) => {
      const format = ast.format || '';
      const size = ast.size || ast.fileSize || '';
      if (ast.name.toLowerCase().includes(q) || String(ast.type).toLowerCase().includes(q) || format.toLowerCase().includes(q)) {
        matched.push({
          id: `asset-${ast.id}`,
          title: ast.name,
          subtitle: `${ast.type} • ${format} • ${size}`,
          category: 'Assets',
          icon: Boxes,
          badge: String(ast.type),
          action: () => setActiveTab('Assets'),
        });
      }
    });

    // 5. Builds
    builds.forEach((b) => {
      const bText = `#${b.buildNumber} ${b.version} ${b.commitMsg || ''}`.toLowerCase();
      if (bText.includes(q)) {
        matched.push({
          id: `build-${b.id}`,
          title: `Build #${b.buildNumber} (${b.version})`,
          subtitle: `${b.status} • ${b.commitMsg || 'pipeline artifact'}`,
          category: 'Builds',
          icon: Hammer,
          badge: b.status,
          action: () => setActiveTab('Builds'),
        });
      }
    });

    // 6. Tests
    tests.forEach((t) => {
      if (t.name.toLowerCase().includes(q) || t.category.toLowerCase().includes(q) || t.status.toLowerCase().includes(q)) {
        matched.push({
          id: `test-${t.id}`,
          title: t.name,
          subtitle: `${t.category} • Status: ${t.status} • ${t.duration}`,
          category: 'Tests',
          icon: ShieldCheck,
          badge: t.status,
          action: () => setActiveTab('Tests'),
        });
      }
    });

    // 7. Memory
    memories.forEach((m) => {
      if (m.title.toLowerCase().includes(q) || m.content.toLowerCase().includes(q) || m.category.toLowerCase().includes(q)) {
        matched.push({
          id: `mem-${m.id}`,
          title: m.title,
          subtitle: `${m.category.replace(/_/g, ' ')}: ${m.content.slice(0, 60)}...`,
          category: 'Memory',
          icon: Brain,
          badge: m.category,
          action: () => setActiveTab('Project Memory'),
        });
      }
    });

    return matched;
  }, [
    query,
    projects,
    tasks,
    agents,
    assets,
    builds,
    tests,
    memories,
    setActiveTab,
    setCurrentProjectId,
    setCreateProjectModalOpen,
    setCreateTaskModalOpen,
    triggerBuild,
    runTestSuite,
  ]);

  if (!commandPaletteOpen) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (results.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + results.length) % (results.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        results[selectedIndex].action();
        setCommandPaletteOpen(false);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setCommandPaletteOpen(false);
    }
  };

  // Group results by category
  const categories = Array.from(new Set(results.map((r) => r.category)));

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/75 backdrop-blur-sm animate-in fade-in"
      onClick={() => setCommandPaletteOpen(false)}
    >
      <div
        className="w-full max-w-2xl rounded-2xl bg-[#0d121c] border border-[#232f48] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search header */}
        <div className="flex items-center px-4 py-3.5 border-b border-[#1d273a] gap-3">
          <Search className="w-5 h-5 text-indigo-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search projects, tasks, agents, assets, builds, tests, memory..."
            className="w-full bg-transparent border-none text-slate-100 placeholder-slate-400 text-sm focus:outline-none"
          />
          <kbd className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#182133] text-slate-400 border border-[#243048]">
            ESC
          </kbd>
        </div>

        {/* Categorized results list (Section 22) */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-3 custom-scrollbar">
          {results.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 font-mono">
              No matching records found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            categories.map((cat) => {
              const catItems = results.filter((r) => r.category === cat);
              return (
                <div key={cat} className="space-y-1">
                  <div className="px-3 py-1 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    <span>{cat}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#141b2b] text-slate-400">
                      {catItems.length}
                    </span>
                  </div>

                  {catItems.map((item) => {
                    const globalIdx = results.findIndex((r) => r.id === item.id);
                    const isSelected = globalIdx === selectedIndex;
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          item.action();
                          setCommandPaletteOpen(false);
                        }}
                        onMouseEnter={() => setSelectedIndex(globalIdx)}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer text-xs transition-colors ${
                          isSelected
                            ? 'bg-indigo-600/20 text-white border border-indigo-500/40'
                            : 'text-slate-300 hover:bg-[#151c2a]'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`p-1.5 rounded-lg shrink-0 ${
                              isSelected ? 'bg-indigo-500/30 text-indigo-300' : 'bg-[#151d2c] text-slate-400'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex flex-col truncate">
                            <span className="font-semibold truncate text-white">{item.title}</span>
                            {item.subtitle && (
                              <span className="text-[10px] text-slate-400 truncate mt-0.5">
                                {item.subtitle}
                              </span>
                            )}
                          </div>
                        </div>

                        {item.badge && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#141b2a] text-slate-300 border border-[#232f48] shrink-0 ml-2">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>

        {/* Palette Footer */}
        <div className="px-4 py-2 border-t border-[#1a2335] bg-[#090d15] flex items-center justify-between text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <span>Use</span>
            <kbd className="px-1.5 py-0.5 rounded bg-[#151d2c] border border-[#232f46] text-slate-300">↑</kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-[#151d2c] border border-[#232f46] text-slate-300">↓</kbd>
            <span>to navigate</span>
            <kbd className="px-1.5 py-0.5 rounded bg-[#151d2c] border border-[#232f46] text-slate-300">↵</kbd>
            <span>to select</span>
          </div>

          <span className="text-[10px] text-indigo-400 font-semibold">
            {results.length} results indexed
          </span>
        </div>
      </div>
    </div>
  );
};
