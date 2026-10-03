import React, { useState } from 'react';
import {
  BookOpen,
  FileText,
  Brain,
  Layers,
  Share2,
  History,
  Sparkles,
  Search,
} from 'lucide-react';
import { KnowledgeOverviewTab } from './KnowledgeOverviewTab';
import { KnowledgeDocumentsTab } from './KnowledgeDocumentsTab';
import { KnowledgeMemoryTab } from './KnowledgeMemoryTab';
import { KnowledgeResearchTab } from './KnowledgeResearchTab';
import { KnowledgeDecisionsTab } from './KnowledgeDecisionsTab';
import { KnowledgeGraphTab } from './KnowledgeGraphTab';
import { KnowledgeHistoryTab } from './KnowledgeHistoryTab';
import { KnowledgeImportModal } from './KnowledgeImportModal';
import { ConflictResolverModal } from './ConflictResolverModal';
import { EmbervaleTestModal } from './EmbervaleTestModal';
import { KnowledgeConflict } from '../../types';

interface KnowledgeDashboardProps {
  projectId: string;
}

export const KnowledgeDashboard: React.FC<KnowledgeDashboardProps> = ({ projectId }) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'documents' | 'memory' | 'research' | 'decisions' | 'graph' | 'history'
  >('overview');

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [activeConflict, setActiveConflict] = useState<KnowledgeConflict | null>(null);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'memory', label: 'Memory', icon: Brain },
    { id: 'research', label: 'Research', icon: Sparkles },
    { id: 'decisions', label: 'Decisions', icon: Layers },
    { id: 'graph', label: 'Knowledge Graph', icon: Share2 },
    { id: 'history', label: 'History', icon: History },
  ] as const;

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Tab Navigation Header */}
      <div className="flex items-center justify-between border-b border-[#1c2438] pb-1">
        <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all shrink-0 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#121828]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Body */}
      <div>
        {activeTab === 'overview' && (
          <KnowledgeOverviewTab
            projectId={projectId}
            onOpenTestModal={() => setIsTestModalOpen(true)}
            onOpenImportModal={() => setIsImportModalOpen(true)}
            onOpenConflictModal={(conflict) => setActiveConflict(conflict)}
            onNavigateTab={(tab) => setActiveTab(tab as any)}
          />
        )}

        {activeTab === 'documents' && (
          <KnowledgeDocumentsTab
            projectId={projectId}
            onOpenImportModal={() => setIsImportModalOpen(true)}
          />
        )}

        {activeTab === 'memory' && <KnowledgeMemoryTab projectId={projectId} />}

        {activeTab === 'research' && <KnowledgeResearchTab projectId={projectId} />}

        {activeTab === 'decisions' && <KnowledgeDecisionsTab projectId={projectId} />}

        {activeTab === 'graph' && <KnowledgeGraphTab projectId={projectId} />}

        {activeTab === 'history' && <KnowledgeHistoryTab projectId={projectId} />}
      </div>

      {/* Modals */}
      <KnowledgeImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        projectId={projectId}
        onImportComplete={() => {
          setIsImportModalOpen(false);
        }}
      />

      <ConflictResolverModal
        isOpen={!!activeConflict}
        conflict={activeConflict}
        onClose={() => setActiveConflict(null)}
        onResolved={() => {
          setActiveConflict(null);
        }}
      />

      <EmbervaleTestModal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
      />
    </div>
  );
};
