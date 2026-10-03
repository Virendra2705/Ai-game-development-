/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { CommandPalette } from './components/layout/CommandPalette';
import { ToastContainer } from './components/common/ToastContainer';

// Page Views
import { DashboardHome } from './components/dashboard/DashboardHome';
import { ProjectsPage } from './components/projects/ProjectsPage';
import { AgentsPage } from './components/agents/AgentsPage';
import { TasksPage } from './components/tasks/TasksPage';
import { AssetsPage } from './components/assets/AssetsPage';
import { TestsPage } from './components/tests/TestsPage';
import { BuildsPage } from './components/builds/BuildsPage';
import { SettingsPage } from './components/settings/SettingsPage';
import { ActivityPage } from './components/activity/ActivityPage';
import { ProjectMemoryPage } from './components/memory/ProjectMemoryPage';
import { AICommandCenterPage } from './components/command/AICommandCenterPage';
import { GamePreviewCenter } from './components/preview/GamePreviewCenter';
import { QATestingCenter } from './components/qa/QATestingCenter';
import { AIDebugCenter } from './components/debug/AIDebugCenter';
import { KnowledgeDashboard } from './components/knowledge/KnowledgeDashboard';
import { AutonomousDashboard } from './components/autonomous/AutonomousDashboard';
import { ProductionHub } from './components/production/ProductionHub';

// Modals
import { CreateProjectModal } from './components/projects/CreateProjectModal';
import { CreateTaskModal } from './components/tasks/CreateTaskModal';
import { AgentDetailModal } from './components/agents/AgentDetailModal';
import { BuildDetailsModal } from './components/builds/BuildDetailsModal';

const MainLayout: React.FC = () => {
  const { activeTab, currentProject } = useApp();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'Dashboard':
        return <DashboardHome />;
      case 'Production':
      case 'Releases':
      case 'Deployments':
      case 'Incidents':
      case 'Monitoring':
      case 'Feedback':
        return <ProductionHub initialSubTab={activeTab} />;
      case 'Autonomous Development':
        return <AutonomousDashboard projectId={currentProject.id} />;
      case 'AI Command Center':
        return <AICommandCenterPage />;
      case 'Projects':
        return <ProjectsPage />;
      case 'Knowledge':
        return <KnowledgeDashboard projectId={currentProject.id} />;
      case 'AI Agents':
        return <AgentsPage />;
      case 'Tasks':
        return <TasksPage />;
      case 'Assets':
        return <AssetsPage />;
      case 'Tests':
        return <TestsPage />;
      case 'Builds':
        return <BuildsPage />;
      case 'Game Preview':
        return <GamePreviewCenter />;
      case 'QA & Debug':
        return (
          <div className="space-y-8 pb-12">
            <QATestingCenter />
            <AIDebugCenter />
          </div>
        );
      case 'Settings':
        return <SettingsPage />;
      case 'Activity':
        return <ActivityPage />;
      case 'Project Memory':
        return <ProjectMemoryPage />;
      default:
        return <DashboardHome />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#07090e] text-slate-100 selection:bg-indigo-600 selection:text-white font-sans antialiased">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Sticky Top Bar */}
        <TopBar />

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {renderActiveView()}
          </div>
        </main>
      </div>

      {/* Global Modals & Overlays */}
      <CreateProjectModal />
      <CreateTaskModal />
      <AgentDetailModal />
      <BuildDetailsModal />
      <CommandPalette />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
