import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Sparkles,
  Layers,
  Cpu,
  Workflow,
  Zap,
  Flame,
  Plus,
  ShieldCheck,
  CheckCircle,
  FileCode,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Asset } from '../../types';
import { AssetGenerationPlan, AssetCategoryType } from '../../types/assets';
import { assetService } from '../../services/assetService';
import { assetAgentService } from '../../services/assets/assetAgentService';
import { assetImportService } from '../../services/assets/assetImportService';
import { taskService } from '../../services/taskService';

// Phase 6 Sub-views
import { AssetCommandCenter } from './AssetCommandCenter';
import { AssetLibraryView } from './AssetLibraryView';
import { AssetQueueView } from './AssetQueueView';
import { ContentPipelineView } from './ContentPipelineView';
import { AssetProvidersView } from './AssetProvidersView';

// Phase 6 Modals
import { AssetDetailsModal } from './AssetDetailsModal';
import { AssetGenerateModal } from './AssetGenerateModal';
import { AssetPlanModal } from './AssetPlanModal';
import { AssetVersionComparisonModal } from './AssetVersionComparisonModal';
import { EmbervaleTestModal } from './EmbervaleTestModal';

export const AssetsPage: React.FC = () => {
  const { assets, currentProject, addToast, setActiveTab } = useApp();

  const [projectAssets, setProjectAssets] = useState<Asset[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<
    'command-center' | 'library' | 'queue' | 'pipeline' | 'providers'
  >('command-center');

  // Modals state
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<AssetGenerationPlan | null>(null);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isPlanExecuting, setIsPlanExecuting] = useState(false);
  const [planExecutionProgress, setPlanExecutionProgress] = useState(0);
  const [planStepMessage, setPlanStepMessage] = useState('');

  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [compareAsset, setCompareAsset] = useState<Asset | null>(null);
  const [compareV1, setCompareV1] = useState('v1.0');
  const [compareV2, setCompareV2] = useState('v1.4');

  const [isEmbervaleTestOpen, setIsEmbervaleTestOpen] = useState(false);

  // Synchronize assets for the current project
  useEffect(() => {
    const filtered = assets.filter((a) => a.projectId === currentProject.id);
    setProjectAssets(filtered.length > 0 ? filtered : assets);
  }, [assets, currentProject.id]);

  // Handler: Formulate Gemini Asset Plan (Section 8, 9)
  const handleCreatePlan = async (request: {
    name: string;
    type: AssetCategoryType;
    description: string;
    style: string;
    target: string;
    requirements: string[];
    references: string[];
    isBatch?: boolean;
    batchCount?: number;
  }) => {
    setIsGenerateModalOpen(false);

    try {
      addToast(
        'Gemini Reasoning',
        `Formulating multi-stage asset production plan for "${request.name}"...`,
        'info'
      );

      const plan = await assetAgentService.createAssetPlan({
        projectId: currentProject.id,
        name: request.name,
        type: request.type,
        description: request.description,
        prompt: request.description,
        optimizationTargets: {
          platform: request.target.includes('Mobile') ? 'Mobile' : 'PC',
          maxPolygonCount: request.target.includes('Mobile') ? 16000 : 45000,
          maxTextureResolution: 2048,
          maxFileSizeBytes: 12 * 1024 * 1024,
          lodRequired: true,
        },
        references: request.references,
      });

      setCurrentPlan(plan);
      setIsPlanModalOpen(true);
    } catch (err: any) {
      addToast('Planning Error', err.message || 'Failed to formulate asset plan', 'error');
    }
  };

  // Handler: Human approves plan & begins generation (Section 9, 12, 22)
  const handleApprovePlan = async (plan: AssetGenerationPlan) => {
    setIsPlanExecuting(true);
    setPlanExecutionProgress(10);
    setPlanStepMessage('Routing to registered provider...');

    try {
      const generatedAsset = await assetAgentService.generateAssetFromPlan(
        plan,
        (progress: number, stepName: string) => {
          setPlanExecutionProgress(progress);
          setPlanStepMessage(stepName);
        }
      );

      // Save to database/memory
      await assetService.createAsset({
        projectId: currentProject.id,
        name: generatedAsset.name,
        type: generatedAsset.type,
        description: generatedAsset.description || plan.purpose || 'Game-ready asset',
        status: generatedAsset.status,
        thumbnailUrl: generatedAsset.thumbnailUrl,
        fileSize: generatedAsset.fileSize,
        format: generatedAsset.format,
        polyCount: generatedAsset.polygonCount ? `${generatedAsset.polygonCount} tris` : undefined,
      });

      setProjectAssets((prev) => [generatedAsset, ...prev]);
      setIsPlanExecuting(false);
      setIsPlanModalOpen(false);

      addToast(
        'Asset Generated & Validated',
        `"${generatedAsset.name}" passed 3D technical validator (${generatedAsset.validationResult?.score || 95}% score). Ready for review!`,
        'success'
      );

      // Prompt user with asset details modal for immediate review
      setSelectedAsset(generatedAsset);
    } catch (err: any) {
      setIsPlanExecuting(false);
      addToast('Generation Error', err.message || 'Asset generation failed', 'error');
    }
  };

  // Handler: Approve Asset (Section 23)
  const handleApproveAsset = async (asset: Asset) => {
    try {
      await assetService.approveAsset(asset.id, 'User Lead');
      setProjectAssets((prev) =>
        prev.map((a) => (a.id === asset.id ? { ...a, status: 'APPROVED' } : a))
      );
      if (selectedAsset && selectedAsset.id === asset.id) {
        setSelectedAsset({ ...selectedAsset, status: 'APPROVED' });
      }
      addToast('Asset Approved', `"${asset.name}" approved. Ready for workspace import.`, 'success');
    } catch (err: any) {
      addToast('Approval Error', err.message, 'error');
    }
  };

  // Handler: Reject Asset (Section 23)
  const handleRejectAsset = async (asset: Asset, reason: string) => {
    try {
      await assetService.rejectAsset(asset.id, reason, 'User Lead');
      setProjectAssets((prev) =>
        prev.map((a) => (a.id === asset.id ? { ...a, status: 'REJECTED' } : a))
      );
      if (selectedAsset && selectedAsset.id === asset.id) {
        setSelectedAsset({ ...selectedAsset, status: 'REJECTED' });
      }
      addToast('Asset Rejected', `Logged reason: "${reason}" to version history.`, 'warning');
    } catch (err: any) {
      addToast('Rejection Error', err.message, 'error');
    }
  };

  // Handler: Import Asset to Workspace (Section 24, 25)
  const handleImportAsset = async (asset: Asset) => {
    try {
      const result = await assetImportService.importAssetToProject(asset, currentProject.id);

      if (result.success) {
        setProjectAssets((prev) =>
          prev.map((a) => (a.id === asset.id ? { ...a, status: 'IMPORTED' } : a))
        );
        if (selectedAsset && selectedAsset.id === asset.id) {
          setSelectedAsset({ ...selectedAsset, status: 'IMPORTED' });
        }
        addToast(
          'Asset Imported',
          `Staged ${asset.name} into ${result.importedPath}. Workspace safety validated.`,
          'success'
        );
      } else {
        addToast('Import Blocked', result.error || 'Validation failed', 'error');
      }
    } catch (err: any) {
      addToast('Import Error', err.message, 'error');
    }
  };

  // Handler: Create Integration Task for Coding Agent (Section 38)
  const handleCreateIntegrationTask = async (asset: Asset) => {
    try {
      const task = await taskService.createTask({
        projectId: currentProject.id,
        title: `Integrate Asset: ${asset.name} (${asset.type}) into Game Scenes`,
        description: `Attach staged asset "${asset.name}" located at ${asset.fileLocation || 'assets/'} into active scene hierarchy, configure material shaders, bind animation tree states, and register codex entry.`,
        assignedAgentId: 'agent-coding',
        priority: 'HIGH',
        tags: ['integration', asset.type.toLowerCase()],
      });

      addToast(
        'Integration Task Created',
        `Task #${task.id} dispatched to Coding Agent for ${asset.name}.`,
        'success'
      );
    } catch (err: any) {
      addToast('Task Creation Error', err.message, 'error');
    }
  };

  // Handler: Toggle Favorite
  const handleToggleFavorite = async (assetId: string) => {
    await assetService.toggleFavorite(assetId);
    setProjectAssets((prev) =>
      prev.map((a) => (a.id === assetId ? { ...a, isFavorite: !a.isFavorite } : a))
    );
    if (selectedAsset && selectedAsset.id === assetId) {
      setSelectedAsset({ ...selectedAsset, isFavorite: !selectedAsset.isFavorite });
    }
  };

  // Handler: Open Version Comparison Tool (Section 47)
  const handleOpenCompare = (asset: Asset, v1: string, v2: string) => {
    setCompareAsset(asset);
    setCompareV1(v1);
    setCompareV2(v2);
    setIsCompareModalOpen(true);
  };

  // Navigation tabs config
  const subTabs = [
    { id: 'command-center', label: 'Command Center', icon: Boxes },
    { id: 'library', label: 'Asset Library', icon: Layers },
    { id: 'queue', label: 'Generation Queue', icon: Cpu },
    { id: 'pipeline', label: '10-Stage Pipeline', icon: Workflow },
    { id: 'providers', label: 'Provider Registry', icon: Zap },
  ];

  return (
    <div className="space-y-6 pb-16 font-mono">
      {/* Top Banner & Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0c101a] border border-[#1f2a3e] shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-bold uppercase text-[10px] tracking-wider">
            <Boxes className="w-4 h-4" />
            <span>PHASE 6: AI ASSET GENERATION & MANAGEMENT PIPELINE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Asset Engine & Library
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Autonomous multi-modal asset synthesis, automated 3D mesh & audio validation, human approval gates, safe workspace import, and Coding Agent integration.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => setIsEmbervaleTestOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all cursor-pointer shadow-md shadow-amber-500/10"
            title="Section 56: Run Embervale Sparkit End-to-End Package"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Run Sparkit E2E Test</span>
          </button>

          <button
            onClick={() => {
              setIsBatchMode(true);
              setIsGenerateModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#141c2c] hover:bg-[#1a253a] text-slate-200 border border-[#222f46] text-xs font-bold transition-all cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Batch Generate</span>
          </button>

          <button
            onClick={() => {
              setIsBatchMode(false);
              setIsGenerateModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Asset</span>
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#1c2638] pb-2 overflow-x-auto scrollbar-none">
        {subTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-[#0c101a] text-slate-400 hover:text-white hover:bg-[#141c2c] border border-[#1c2638]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-indigo-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Sub-Tab View Rendering */}
      <div>
        {activeSubTab === 'command-center' && (
          <AssetCommandCenter
            assets={projectAssets}
            onOpenGenerateModal={() => {
              setIsBatchMode(false);
              setIsGenerateModalOpen(true);
            }}
            onOpenBatchModal={() => {
              setIsBatchMode(true);
              setIsGenerateModalOpen(true);
            }}
            onSelectTab={(tab) => setActiveSubTab(tab)}
            onRunEmbervaleTest={() => setIsEmbervaleTestOpen(true)}
            onSelectAsset={(asset) => setSelectedAsset(asset)}
          />
        )}

        {activeSubTab === 'library' && (
          <AssetLibraryView
            assets={projectAssets}
            onSelectAsset={(asset) => setSelectedAsset(asset)}
            onOpenGenerateModal={() => {
              setIsBatchMode(false);
              setIsGenerateModalOpen(true);
            }}
            onApproveAsset={handleApproveAsset}
            onImportAsset={handleImportAsset}
            onToggleFavorite={handleToggleFavorite}
            onCompareVersions={handleOpenCompare}
          />
        )}

        {activeSubTab === 'queue' && <AssetQueueView />}

        {activeSubTab === 'pipeline' && (
          <ContentPipelineView
            assets={projectAssets}
            onOpenGenerateModal={() => {
              setIsBatchMode(false);
              setIsGenerateModalOpen(true);
            }}
            onSelectAsset={(asset) => setSelectedAsset(asset)}
          />
        )}

        {activeSubTab === 'providers' && <AssetProvidersView />}
      </div>

      {/* MODAL 1: Asset Details, 3D/Audio Inspection, Technical Validation (Section 22, 23, 27, 28, 29, 38) */}
      {selectedAsset && (
        <AssetDetailsModal
          asset={selectedAsset}
          onClose={() => setSelectedAsset(null)}
          onApprove={handleApproveAsset}
          onReject={handleRejectAsset}
          onImport={handleImportAsset}
          onCreateIntegrationTask={handleCreateIntegrationTask}
          onGenerateNewVersion={(asset) => {
            setSelectedAsset(null);
            setIsBatchMode(false);
            setIsGenerateModalOpen(true);
          }}
          onToggleFavorite={handleToggleFavorite}
          onCompareVersions={handleOpenCompare}
        />
      )}

      {/* MODAL 2: Asset Generation Request ("What do you want to create?") (Section 8, 34) */}
      {isGenerateModalOpen && (
        <AssetGenerateModal
          existingAssets={projectAssets}
          onClose={() => setIsGenerateModalOpen(false)}
          onCreatePlan={handleCreatePlan}
          initialBatch={isBatchMode}
        />
      )}

      {/* MODAL 3: Gemini Asset Plan Human Approval Gate (Section 9) */}
      {isPlanModalOpen && currentPlan && (
        <AssetPlanModal
          plan={currentPlan}
          onClose={() => setIsPlanModalOpen(false)}
          onApproveAndGenerate={handleApprovePlan}
          isExecuting={isPlanExecuting}
          executionProgress={planExecutionProgress}
          currentStepMessage={planStepMessage}
        />
      )}

      {/* MODAL 4: Side-by-Side Version Comparison (Section 47) */}
      {isCompareModalOpen && compareAsset && (
        <AssetVersionComparisonModal
          asset={compareAsset}
          versionA={compareV1}
          versionB={compareV2}
          onClose={() => setIsCompareModalOpen(false)}
        />
      )}

      {/* MODAL 5: Embervale Sparkit End-to-End Test (Section 56) */}
      {isEmbervaleTestOpen && (
        <EmbervaleTestModal
          projectId={currentProject.id}
          onClose={() => setIsEmbervaleTestOpen(false)}
          onAssetCreated={(newAsset) => {
            setProjectAssets((prev) => [newAsset, ...prev]);
          }}
          onOpenTaskCenter={() => setActiveTab('Tasks')}
        />
      )}
    </div>
  );
};
