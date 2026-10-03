import React from 'react';
import { Plus, FolderGit2, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ProjectOverviewCard } from './ProjectOverviewCard';
import { ProjectOnboardingCard } from './ProjectOnboardingCard';
import { LiveGamePreview } from './LiveGamePreview';
import { QuickCommandArea } from './QuickCommandArea';
import { AgentsOverview } from './AgentsOverview';
import { ActiveTasksWidget } from './ActiveTasksWidget';
import { BuildStatusWidget } from './BuildStatusWidget';
import { ActivityFeedWidget } from './ActivityFeedWidget';
import { Phase2StatusPanel } from './Phase2StatusPanel';
import { CodingAgentDashboardPanel } from '../coding/CodingAgentDashboardPanel';
import { RepositoryDashboardPanel } from '../coding/RepositoryDashboardPanel';

export const DashboardHome: React.FC = () => {
  const { setCreateProjectModalOpen, setActiveTab } = useApp();

  return (
    <div className="space-y-6 pb-12">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono font-semibold tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI GAME BUILDER HUB • PHASE 2 MEMORY & FOUNDATION</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight mt-1">
            Game Development Command Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Build, manage, and monitor your game with structured Project Memory and AI agents.
          </p>
        </div>

        {/* Primary & Secondary Action buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            id="new-project-header-btn"
            onClick={() => setCreateProjectModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-mono font-semibold shadow-[0_0_18px_rgba(99,102,241,0.25)] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Project</span>
          </button>

          <button
            id="open-projects-header-btn"
            onClick={() => setActiveTab('Projects')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#141a27] hover:bg-[#1a2335] text-slate-200 border border-[#222d42] text-xs font-mono font-semibold transition-colors cursor-pointer"
          >
            <FolderGit2 className="w-4 h-4 text-indigo-400" />
            <span>Open Project</span>
          </button>
        </div>
      </div>

      {/* Onboarding State (Section 20) */}
      <ProjectOnboardingCard />

      {/* 1. Project Overview Card */}
      <ProjectOverviewCard />

      {/* 2. Live Game Preview Panel (Prominent Central Card) */}
      <LiveGamePreview />

      {/* 3. Quick Command Area */}
      <QuickCommandArea />

      {/* 4. AI Development Team (10 Agents) */}
      <AgentsOverview />

      {/* 5. Active Tasks Widget */}
      <ActiveTasksWidget />

      {/* Phase 4: Coding Agent & Repository Status (Sections 36 & 37) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CodingAgentDashboardPanel />
        <RepositoryDashboardPanel />
      </div>

      {/* 6. Build Status & Activity Feed Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BuildStatusWidget />
        <ActivityFeedWidget />
      </div>

      {/* Developer Status Panel (Section 33: Finish Phase 2) */}
      <Phase2StatusPanel />
    </div>
  );
};
