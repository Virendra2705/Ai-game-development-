import React from 'react';
import {
  LayoutDashboard,
  FolderGit2,
  Bot,
  CheckSquare,
  Hammer,
  Boxes,
  ShieldCheck,
  Activity as ActivityIcon,
  Settings as SettingsIcon,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Gamepad2,
  ExternalLink,
  Brain,
  BookOpen,
  Database,
  Terminal,
  Play,
  ShieldAlert,
  Cpu,
  Rocket,
  Tag,
  CloudUpload,
  AlertOctagon,
  LineChart,
  MessageSquare,
} from 'lucide-react';
import { useApp, NavigationTab } from '../../context/AppContext';

interface NavItem {
  id: NavigationTab;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
}

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    sidebarCollapsed,
    setSidebarCollapsed,
    currentProject,
    user,
    tasks,
    builds,
    tests,
    memories,
    projectPlans,
    adapterName,
    isLocalMode,
    setCreateProjectModalOpen,
  } = useApp();

  const activeTasksCount = tasks.filter(
    (t) => t.projectId === currentProject.id && (t.status === 'Working' || t.status === 'Planning')
  ).length;

  const failedTestsCount = tests.filter(
    (t) => t.projectId === currentProject.id && t.status === 'Failed'
  ).length;

  const pendingPlansCount = (projectPlans || []).filter(
    (p) => p.status === 'PENDING_APPROVAL'
  ).length;

  const navItems: NavItem[] = [
    { id: 'Dashboard', label: 'Dashboard', icon: LayoutDashboard },
    {
      id: 'Production',
      label: 'Production',
      icon: Rocket,
      badge: 'Phase 10',
    },
    { id: 'Releases', label: 'Releases', icon: Tag },
    { id: 'Deployments', label: 'Deployments', icon: CloudUpload },
    { id: 'Incidents', label: 'Incidents', icon: AlertOctagon },
    { id: 'Monitoring', label: 'Monitoring', icon: LineChart },
    { id: 'Feedback', label: 'Feedback', icon: MessageSquare },
    {
      id: 'Autonomous Development',
      label: 'Autonomous Dev',
      icon: Cpu,
      badge: 'Phase 9',
    },
    {
      id: 'AI Command Center',
      label: 'AI Command Center',
      icon: Terminal,
      badge: pendingPlansCount > 0 ? `${pendingPlansCount} pending` : undefined,
    },
    { id: 'Projects', label: 'Projects', icon: FolderGit2 },
    { id: 'Knowledge', label: 'Knowledge', icon: BookOpen, badge: 'Phase 8' },
    { id: 'Project Memory', label: 'Project Memory', icon: Brain, badge: memories.length > 0 ? memories.length : undefined },
    { id: 'AI Agents', label: 'AI Agents', icon: Bot, badge: '10' },
    { id: 'Tasks', label: 'Tasks', icon: CheckSquare, badge: activeTasksCount > 0 ? activeTasksCount : undefined },
    { id: 'Builds', label: 'Builds', icon: Hammer, badge: `#${builds[0]?.buildNumber || 142}` },
    { id: 'Game Preview', label: 'Game Preview', icon: Play, badge: '60 FPS' },
    { id: 'QA & Debug', label: 'QA & Debug', icon: ShieldAlert, badge: 'QA' },
    { id: 'Assets', label: 'Assets', icon: Boxes },
    { id: 'Tests', label: 'Tests', icon: ShieldCheck, badge: failedTestsCount > 0 ? '!' : undefined },
    { id: 'Activity', label: 'Activity', icon: ActivityIcon },
    { id: 'Settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <aside
      id="main-sidebar"
      className={`relative z-20 flex flex-col border-r border-[#1e2433] bg-[#0c0f17] transition-all duration-300 ease-in-out shrink-0 select-none ${
        sidebarCollapsed ? 'w-18' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-[#1e2433]/80">
        <div
          onClick={() => setActiveTab('Dashboard')}
          className="flex items-center gap-3 cursor-pointer group"
          title="AI GAME BUILDER HUB"
        >
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 via-purple-500/15 to-sky-500/10 border border-indigo-500/30 group-hover:border-indigo-400/60 shadow-[0_0_15px_rgba(99,102,241,0.15)] transition-all">
            <Gamepad2 className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
            <Sparkles className="w-2.5 h-2.5 text-purple-300 absolute -top-1 -right-1 animate-pulse" />
          </div>

          {!sidebarCollapsed && (
            <div className="flex flex-col">
              <span className="text-[13px] font-extrabold tracking-wider text-white font-mono leading-tight">
                AI GAME
              </span>
              <span className="text-[11px] font-bold tracking-widest text-indigo-400 font-mono leading-tight">
                BUILDER
              </span>
            </div>
          )}
        </div>

        {/* Collapse toggle button */}
        <button
          id="collapse-sidebar-btn"
          onClick={() => setSidebarCollapsed((prev) => !prev)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#182030] transition-colors"
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-${item.id.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative ${
                isActive
                  ? 'bg-indigo-600/15 text-white border border-indigo-500/30 shadow-[0_0_12px_rgba(99,102,241,0.15)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#151c2a]'
              }`}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'
                }`}
              />

              {!sidebarCollapsed && (
                <span className="truncate flex-1 text-left">{item.label}</span>
              )}

              {!sidebarCollapsed && item.badge && (
                <span
                  className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-md ${
                    item.badge === '!'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : isActive
                      ? 'bg-indigo-500/20 text-indigo-300'
                      : 'bg-[#1b2233] text-slate-400'
                  }`}
                >
                  {item.badge}
                </span>
              )}

              {/* Active indicator dot when collapsed */}
              {sidebarCollapsed && isActive && (
                <div className="absolute right-1 w-1.5 h-1.5 rounded-full bg-indigo-400" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer: Current Project & User Profile */}
      <div className="p-3 border-t border-[#1e2433]/80 space-y-2 bg-[#0a0d14]/70">
        {/* Persistence Indicator (Section 2) */}
        {!sidebarCollapsed ? (
          <div className="px-2.5 py-1.5 rounded-lg bg-[#0e1422] border border-[#1d273a] flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Database className="w-3 h-3 text-emerald-400" />
              <span className="text-[10px] font-mono text-slate-300 font-semibold truncate">
                {adapterName}
              </span>
            </div>
            <span className="text-[9px] font-mono text-emerald-400 font-bold px-1 py-0.5 rounded bg-emerald-500/15">
              PERSISTENT
            </span>
          </div>
        ) : (
          <div
            className="flex items-center justify-center p-1.5 rounded-lg bg-[#0e1422] border border-[#1d273a] text-emerald-400"
            title={`${adapterName} (Persistent Storage Active)`}
          >
            <Database className="w-3.5 h-3.5" />
          </div>
        )}

        {/* Current Project Indicator */}
        {!sidebarCollapsed ? (
          <div className="p-2.5 rounded-lg bg-[#131926] border border-[#222c40] flex flex-col gap-1">
            <div className="flex items-center justify-between text-[11px] text-slate-400 uppercase tracking-wider font-mono">
              <span>Active Project</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="flex items-center justify-between">
              <span
                className="text-xs font-semibold text-slate-200 truncate font-mono"
                title={currentProject.name}
              >
                {currentProject.name}
              </span>
              <button
                onClick={() => setActiveTab('Projects')}
                className="text-indigo-400 hover:text-indigo-300 p-0.5"
                title="Switch Project"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
              <span className="text-indigo-400">{currentProject.engine}</span>
              <span>•</span>
              <span>{currentProject.progress}% complete</span>
            </div>
          </div>
        ) : (
          <div
            onClick={() => setActiveTab('Projects')}
            className="flex items-center justify-center p-2 rounded-lg bg-[#131926] border border-[#222c40] text-indigo-400 cursor-pointer hover:border-indigo-500/40"
            title={`Active: ${currentProject.name}`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          </div>
        )}

        {/* User Profile */}
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-[#151c2a] transition-colors cursor-pointer">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-8 h-8 rounded-full border border-indigo-500/30 object-cover shrink-0"
          />
          {!sidebarCollapsed && (
            <div className="flex flex-col truncate">
              <span className="text-xs font-medium text-slate-200 truncate">{user.name}</span>
              <span className="text-[10px] text-slate-400 truncate">{user.role}</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
