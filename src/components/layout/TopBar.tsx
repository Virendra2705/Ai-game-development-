import React, { useState } from 'react';
import {
  Search,
  Bell,
  HelpCircle,
  Command,
  Plus,
  Layers,
  Sparkles,
  ChevronDown,
  Info,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Menu,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const TopBar: React.FC = () => {
  const {
    currentProject,
    projects,
    setCurrentProjectId,
    searchQuery,
    setSearchQuery,
    setCommandPaletteOpen,
    setCreateProjectModalOpen,
    setCreateTaskModalOpen,
    activities,
    user,
    setSidebarCollapsed,
    sidebarCollapsed,
    setActiveTab,
  } = useApp();

  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const unreadActivities = activities.slice(0, 5);

  return (
    <header
      id="main-topbar"
      className="relative z-10 flex items-center justify-between h-16 px-4 md:px-6 border-b border-[#1e2433] bg-[#0c0f17]/90 backdrop-blur-md shrink-0 gap-4"
    >
      {/* Left: Mobile menu toggle + Project Name & Status */}
      <div className="flex items-center gap-3 md:gap-4 shrink-0">
        <button
          onClick={() => setSidebarCollapsed((prev) => !prev)}
          className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#182030]"
          title="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Project Selector / Indicator */}
        <div className="relative">
          <button
            onClick={() => setProjectDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-[#141a27] hover:bg-[#1a2233] border border-[#232c3f] transition-all group"
            title="Click to switch active project"
          >
            <div className="flex flex-col text-left">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
                <span>PROJECT</span>
                <span className="text-indigo-400 font-semibold">• {currentProject.engine}</span>
              </span>
              <span className="text-xs md:text-sm font-bold text-white font-mono tracking-wide group-hover:text-indigo-300 transition-colors">
                {currentProject.name}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-200 transition-transform duration-200" />
          </button>

          {/* Project dropdown */}
          {projectDropdownOpen && (
            <div
              className="absolute left-0 top-full mt-2 w-72 rounded-xl bg-[#0e131f] border border-[#242f46] shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2"
              onMouseLeave={() => setProjectDropdownOpen(false)}
            >
              <div className="text-[11px] font-mono font-semibold text-slate-400 px-2 py-1.5 border-b border-[#1d2638] flex justify-between items-center">
                <span>SWITCH PROJECT</span>
                <button
                  onClick={() => {
                    setProjectDropdownOpen(false);
                    setCreateProjectModalOpen(true);
                  }}
                  className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 text-[10px]"
                >
                  <Plus className="w-3 h-3" /> New
                </button>
              </div>

              <div className="space-y-1 mt-1 max-h-60 overflow-y-auto custom-scrollbar">
                {projects.map((proj) => (
                  <button
                    key={proj.id}
                    onClick={() => {
                      setCurrentProjectId(proj.id);
                      setProjectDropdownOpen(false);
                    }}
                    className={`w-full flex flex-col text-left px-2.5 py-2 rounded-lg transition-colors text-xs ${
                      proj.id === currentProject.id
                        ? 'bg-indigo-600/20 text-white border border-indigo-500/30'
                        : 'text-slate-300 hover:bg-[#172031]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold truncate">{proj.name}</span>
                      <span className="text-[10px] font-mono text-indigo-400">{proj.progress}%</span>
                    </div>
                    <span className="text-[10px] text-slate-400 truncate">
                      {proj.genre} • {proj.engine}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Project Status Indicator */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-medium">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span>Development</span>
        </div>
      </div>

      {/* Center: Global Search field with keyboard shortcut trigger */}
      <div className="flex-1 max-w-xl mx-2 md:mx-6">
        <div
          onClick={() => setCommandPaletteOpen(true)}
          className="relative flex items-center w-full px-3 py-1.5 rounded-lg bg-[#121824] hover:bg-[#161e2d] border border-[#20293d] hover:border-indigo-500/40 transition-all cursor-pointer group shadow-inner"
        >
          <Search className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 transition-colors shrink-0" />
          <input
            type="text"
            readOnly
            value={searchQuery}
            placeholder="Search projects, tasks, agents... (Ctrl+K)"
            className="w-full bg-transparent border-none text-xs text-slate-200 placeholder-slate-400 focus:outline-none px-2.5 cursor-pointer"
          />
          <kbd className="hidden sm:flex items-center gap-0.5 text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#1c2436] text-slate-400 border border-[#2b364e]">
            <Command className="w-2.5 h-2.5" /> K
          </kbd>
        </div>
      </div>

      {/* Right: Quick actions, Notifications, Help & Avatar */}
      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        {/* Quick New Task */}
        <button
          onClick={() => setCreateTaskModalOpen(true)}
          className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-semibold font-mono transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Task</span>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            id="notifications-btn"
            onClick={() => setNotificationsOpen((prev) => !prev)}
            className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#161e2d] transition-colors border border-transparent hover:border-[#242e42]"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500 ring-2 ring-[#0c0f17]" />
          </button>

          {/* Notifications Dropdown */}
          {notificationsOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-xl bg-[#0e131f] border border-[#242f46] shadow-2xl p-3 z-50 animate-in fade-in"
              onMouseLeave={() => setNotificationsOpen(false)}
            >
              <div className="flex items-center justify-between pb-2 border-b border-[#1d2638]">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold font-mono text-white">SYSTEM NOTIFICATIONS</span>
                </div>
                <button
                  onClick={() => {
                    setActiveTab('Activity');
                    setNotificationsOpen(false);
                  }}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 font-mono"
                >
                  View All
                </button>
              </div>

              <div className="space-y-2 mt-2 max-h-72 overflow-y-auto custom-scrollbar">
                {unreadActivities.map((act) => (
                  <div
                    key={act.id}
                    className="p-2.5 rounded-lg bg-[#141a27] hover:bg-[#182030] border border-[#212a3d] transition-colors text-xs flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200">{act.title}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{act.timeAgo}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2">{act.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Help / Phase 1 Architecture Guide */}
        <div className="relative">
          <button
            onClick={() => setHelpOpen((prev) => !prev)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#161e2d] transition-colors border border-transparent hover:border-[#242e42]"
            title="Phase 1 Architecture Guide"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Help modal popup */}
          {helpOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-xl bg-[#0e131f] border border-[#242f46] shadow-2xl p-4 z-50 animate-in fade-in"
              onMouseLeave={() => setHelpOpen(false)}
            >
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono font-bold mb-2">
                <Info className="w-4 h-4" />
                <span>PHASE 1 COMMAND CENTER</span>
              </div>
              <p className="text-xs text-slate-300 mb-2 leading-relaxed">
                This command center frontend is built with full visual fidelity and simulated status data:
              </p>
              <ul className="text-[11px] text-slate-400 space-y-1.5 list-disc list-inside">
                <li><strong className="text-slate-200">Phase 1:</strong> Frontend dashboard, Kanban board, test dashboard, asset tracker, live preview viewport, and project management.</li>
                <li><strong className="text-slate-200">Phase 2:</strong> Will connect server-side AI orchestration with Gemini & Codex.</li>
                <li><strong className="text-slate-200">Phase 3:</strong> Will connect GitHub repository automation.</li>
                <li><strong className="text-slate-200">Phase 4:</strong> Will connect live game engine builds & streaming preview.</li>
              </ul>
              <div className="mt-3 pt-2 border-t border-[#1e273a] flex justify-end">
                <button
                  onClick={() => setHelpOpen(false)}
                  className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium"
                >
                  Understood
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Avatar */}
        <div
          onClick={() => setActiveTab('Settings')}
          className="flex items-center gap-2 pl-1 cursor-pointer group"
          title="Account Settings"
        >
          <img
            src={user.avatar}
            alt={user.name}
            className="w-8 h-8 rounded-full border border-indigo-500/40 object-cover group-hover:ring-2 group-hover:ring-indigo-500/50 transition-all"
          />
        </div>
      </div>
    </header>
  );
};
