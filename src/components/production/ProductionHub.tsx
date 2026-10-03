import React, { useState, useEffect } from 'react';
import {
  Rocket,
  Tag,
  CloudUpload,
  AlertOctagon,
  LineChart,
  MessageSquare,
  Sparkles,
  Zap,
} from 'lucide-react';
import { ProductionDashboardView } from './ProductionDashboardView';
import { ReleasesView } from './ReleasesView';
import { DeploymentsView } from './DeploymentsView';
import { MonitoringCrashesView } from './MonitoringCrashesView';
import { IncidentsView } from './IncidentsView';
import { FeedbackView } from './FeedbackView';
import { PostReleaseAIView } from './PostReleaseAIView';
import { EmbervaleReleaseTestModal } from './EmbervaleReleaseTestModal';
import { NavigationTab } from '../../context/AppContext';

interface ProductionHubProps {
  initialSubTab?: NavigationTab;
}

type SubTab =
  | 'Overview'
  | 'Releases'
  | 'Deployments'
  | 'Monitoring'
  | 'Incidents'
  | 'Feedback'
  | 'PostReleaseAI';

export const ProductionHub: React.FC<ProductionHubProps> = ({ initialSubTab }) => {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('Overview');
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);

  useEffect(() => {
    if (initialSubTab) {
      if (initialSubTab === 'Releases') setActiveSubTab('Releases');
      else if (initialSubTab === 'Deployments') setActiveSubTab('Deployments');
      else if (initialSubTab === 'Incidents') setActiveSubTab('Incidents');
      else if (initialSubTab === 'Monitoring') setActiveSubTab('Monitoring');
      else if (initialSubTab === 'Feedback') setActiveSubTab('Feedback');
      else setActiveSubTab('Overview');
    }
  }, [initialSubTab]);

  const subTabs = [
    { id: 'Overview', label: 'Production Overview', icon: Rocket },
    { id: 'Releases', label: 'Releases & Approval', icon: Tag },
    { id: 'Deployments', label: 'Environments & Deploy', icon: CloudUpload },
    { id: 'Monitoring', label: 'Monitoring & Crashes', icon: LineChart },
    { id: 'Incidents', label: 'Incidents & Rollback', icon: AlertOctagon },
    { id: 'Feedback', label: 'Player Feedback', icon: MessageSquare },
    { id: 'PostReleaseAI', label: 'Post-Release AI Loop', icon: Sparkles },
  ] as const;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Hub Navigation Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#1c2436]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-400">
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                Production Release & Post-Release AI Operations
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Phase 10
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Release Candidate validation, explicit human authorization, isolated deployment providers, and telemetry feedback loop.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsTestModalOpen(true)}
          className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-500/20 via-indigo-500/20 to-purple-500/20 hover:from-amber-500/30 hover:to-purple-500/30 text-slate-100 border border-indigo-500/40 shadow-sm flex items-center gap-2 transition-all self-start md:self-auto"
        >
          <Zap className="w-4 h-4 text-amber-400" />
          <span>Embervale Release Walkthrough</span>
        </button>
      </div>

      {/* Sub-Tab Navigation Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
        {subTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as SubTab)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                  : 'bg-[#0f1422] text-slate-400 hover:text-slate-200 hover:bg-[#151c2d] border border-[#1a2336]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Sub-Tab View */}
      <div>
        {activeSubTab === 'Overview' && (
          <ProductionDashboardView
            onNavigateTab={(tab) => setActiveSubTab(tab as SubTab)}
            onOpenTestModal={() => setIsTestModalOpen(true)}
          />
        )}
        {activeSubTab === 'Releases' && <ReleasesView />}
        {activeSubTab === 'Deployments' && <DeploymentsView />}
        {activeSubTab === 'Monitoring' && <MonitoringCrashesView />}
        {activeSubTab === 'Incidents' && <IncidentsView />}
        {activeSubTab === 'Feedback' && <FeedbackView />}
        {activeSubTab === 'PostReleaseAI' && <PostReleaseAIView />}
      </div>

      {/* Embervale 16-Step Test Modal */}
      <EmbervaleReleaseTestModal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
      />
    </div>
  );
};
