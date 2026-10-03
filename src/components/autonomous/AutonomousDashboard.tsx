import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Layers,
  FileCheck,
  ShieldCheck,
  TrendingUp,
  Shield,
  Brain,
  Cpu,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Play,
} from 'lucide-react';
import {
  AutonomousRun,
  AutonomousMode,
  DevelopmentGoal,
  Milestone,
  ApprovalRequest,
  RegressionTest,
  GameplayTest,
  ImprovementTask,
  AutonomousSafetyPolicy,
  FailureLearning,
  AutonomousRunReport,
  ProjectHealthSnapshot,
} from '../../types';
import {
  autonomousDevelopmentService,
  goalMilestoneService,
  approvalService,
  regressionService,
  gameplayTestAgent,
  improvementAgentService,
  projectHealthService,
} from '../../services';
import { DevelopmentLoopVisualizer } from './DevelopmentLoopVisualizer';
import { AutonomousRunController } from './AutonomousRunController';
import { GoalMilestonesTab } from './GoalMilestonesTab';
import { ApprovalsQueueTab } from './ApprovalsQueueTab';
import { QualityRegressionTab } from './QualityRegressionTab';
import { ImprovementBacklogTab } from './ImprovementBacklogTab';
import { SafetyPolicyTab } from './SafetyPolicyTab';
import { FailureLearningsTab } from './FailureLearningsTab';
import { EmbervaleCaptureActionModal } from './EmbervaleCaptureActionModal';

interface AutonomousDashboardProps {
  projectId: string;
}

type TabKey =
  | 'GOALS_MILESTONES'
  | 'APPROVALS'
  | 'QUALITY_REGRESSION'
  | 'IMPROVEMENTS'
  | 'SAFETY_POLICY'
  | 'FAILURE_LEARNINGS';

export const AutonomousDashboard: React.FC<AutonomousDashboardProps> = ({ projectId }) => {
  const [activeTab, setActiveTab] = useState<TabKey>('GOALS_MILESTONES');
  const [activeRun, setActiveRun] = useState<AutonomousRun | null>(null);
  const [goals, setGoals] = useState<DevelopmentGoal[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [regressionTests, setRegressionTests] = useState<RegressionTest[]>([]);
  const [gameplayTests, setGameplayTests] = useState<GameplayTest[]>([]);
  const [improvements, setImprovements] = useState<ImprovementTask[]>([]);
  const [safetyPolicy, setSafetyPolicy] = useState<AutonomousSafetyPolicy | null>(null);
  const [failureLearnings, setFailureLearnings] = useState<FailureLearning[]>([]);
  const [report, setReport] = useState<AutonomousRunReport | null>(null);
  const [health, setHealth] = useState<ProjectHealthSnapshot | null>(null);
  const [isEmbervaleModalOpen, setIsEmbervaleModalOpen] = useState(false);

  // Load all initial state
  const loadState = async () => {
    const run = await autonomousDevelopmentService.getActiveRun(projectId);
    setActiveRun(run);

    const g = await goalMilestoneService.getGoals(projectId);
    setGoals(g);

    const m = await goalMilestoneService.getMilestones(projectId);
    setMilestones(m);

    const a = await approvalService.getApprovals(projectId);
    setApprovals(a);

    const r = await regressionService.getRegressionTests(projectId);
    setRegressionTests(r);

    const imp = await improvementAgentService.getImprovementTasks(projectId);
    setImprovements(imp);

    const pol = await autonomousDevelopmentService.getSafetyPolicy(projectId);
    setSafetyPolicy(pol);

    const fl = await autonomousDevelopmentService.getFailureLearnings(projectId);
    setFailureLearnings(fl);

    if (run) {
      const rep = await autonomousDevelopmentService.getRunReport(run.id);
      setReport(rep);
    }

    const h = await projectHealthService.getHealthSnapshot(projectId);
    setHealth(h);
  };

  useEffect(() => {
    loadState();
  }, [projectId]);

  // Run controller handlers
  const handleStartRun = async (goal: string, mode: AutonomousMode) => {
    const run = await autonomousDevelopmentService.startRun(projectId, goal, mode);
    setActiveRun(run);
    loadState();
  };

  const handlePauseRun = async () => {
    if (!activeRun) return;
    const run = await autonomousDevelopmentService.pauseRun(activeRun.id, 'User manually paused execution');
    setActiveRun(run);
    loadState();
  };

  const handleResumeRun = async () => {
    if (!activeRun) return;
    const run = await autonomousDevelopmentService.resumeRun(activeRun.id);
    setActiveRun(run);
    loadState();
  };

  const handleStepRun = async () => {
    if (!activeRun) return;
    const run = await autonomousDevelopmentService.stepRun(activeRun.id);
    setActiveRun(run);
    loadState();
  };

  const handleCancelRun = async () => {
    if (!activeRun) return;
    const run = await autonomousDevelopmentService.cancelRun(activeRun.id);
    setActiveRun(run);
    loadState();
  };

  const handleSwitchMode = async (mode: AutonomousMode) => {
    if (activeRun) {
      activeRun.mode = mode;
      setActiveRun({ ...activeRun });
    }
  };

  const handleCreateGoal = async (title: string, description: string, targetOutcome: string) => {
    await goalMilestoneService.createGoalWithMilestones(projectId, title, description, targetOutcome);
    loadState();
  };

  const handleApproveRequest = async (id: string, notes?: string) => {
    await approvalService.approve(id, projectId, notes);
    loadState();
  };

  const handleRejectRequest = async (id: string, notes?: string) => {
    await approvalService.reject(id, projectId, notes);
    loadState();
  };

  const handleRequestMoreInfo = async (id: string, notes: string) => {
    await approvalService.requestMoreInfo(id, projectId, notes);
    loadState();
  };

  const handleRunRegression = async () => {
    const res = await regressionService.runRegressionSuite(projectId);
    setRegressionTests([...res.tests]);
    loadState();
  };

  const handleRunGameplayTests = async () => {
    const res = await gameplayTestAgent.executeGameplayTestSuite(projectId);
    setGameplayTests(res);
  };

  const handleApproveImprovement = async (id: string) => {
    await improvementAgentService.approveImprovement(id, projectId);
    loadState();
  };

  const handleUpdatePolicy = async (updated: Partial<AutonomousSafetyPolicy>) => {
    const pol = await autonomousDevelopmentService.updateSafetyPolicy(projectId, updated);
    setSafetyPolicy(pol);
  };

  const pendingApprovalsCount = approvals.filter((a) => a.status === 'PENDING').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Project Health Snapshot */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white font-mono flex items-center gap-2.5">
              <Cpu className="w-6 h-6 text-indigo-400" />
              <span>Autonomous Development Hub</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              PHASE 9
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Controlled continuous game-development engine with strict quality gates and human oversight.
          </p>
        </div>

        {/* Health Pills */}
        {health && (
          <div className="flex flex-wrap items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-[#0b0f19] border border-[#1b2438] text-xs font-mono flex items-center gap-2">
              <span className="text-slate-500">Build Stability:</span>
              <span className="text-emerald-400 font-bold">{health.buildStability}%</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-[#0b0f19] border border-[#1b2438] text-xs font-mono flex items-center gap-2">
              <span className="text-slate-500">QA Pass:</span>
              <span className="text-emerald-400 font-bold">{health.qaStability}%</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-[#0b0f19] border border-[#1b2438] text-xs font-mono flex items-center gap-2">
              <span className="text-slate-500">Performance:</span>
              <span className="text-sky-400 font-bold">
                {health.fps ? `${health.fps} FPS` : health.performanceStatus}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Development Loop Visualizer */}
      <DevelopmentLoopVisualizer run={activeRun} />

      {/* Active Run Controller */}
      <AutonomousRunController
        run={activeRun}
        onStart={(goal, mode) => handleStartRun(goal, mode)}
        onPause={handlePauseRun}
        onResume={handleResumeRun}
        onStep={handleStepRun}
        onCancel={handleCancelRun}
        onSwitchMode={handleSwitchMode}
        onOpenApprovals={() => setActiveTab('APPROVALS')}
        onOpenEmbervaleModal={() => setIsEmbervaleModalOpen(true)}
      />

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-[#1b2438] custom-scrollbar">
        <button
          onClick={() => setActiveTab('GOALS_MILESTONES')}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-mono font-bold flex items-center gap-2 border-b-2 transition-all shrink-0 ${
            activeTab === 'GOALS_MILESTONES'
              ? 'border-indigo-500 text-white bg-[#0e1424]'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#090d16]'
          }`}
        >
          <Layers className="w-4 h-4 text-indigo-400" />
          <span>Goals & Milestones ({milestones.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('APPROVALS')}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-mono font-bold flex items-center gap-2 border-b-2 transition-all shrink-0 ${
            activeTab === 'APPROVALS'
              ? 'border-amber-500 text-white bg-[#0e1424]'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#090d16]'
          }`}
        >
          <FileCheck className="w-4 h-4 text-amber-400" />
          <span>Approvals Queue</span>
          {pendingApprovalsCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[10px] font-bold">
              {pendingApprovalsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('QUALITY_REGRESSION')}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-mono font-bold flex items-center gap-2 border-b-2 transition-all shrink-0 ${
            activeTab === 'QUALITY_REGRESSION'
              ? 'border-emerald-500 text-white bg-[#0e1424]'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#090d16]'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>QA & Regression ({regressionTests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('IMPROVEMENTS')}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-mono font-bold flex items-center gap-2 border-b-2 transition-all shrink-0 ${
            activeTab === 'IMPROVEMENTS'
              ? 'border-purple-500 text-white bg-[#0e1424]'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#090d16]'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-purple-400" />
          <span>Improvement Backlog ({improvements.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('SAFETY_POLICY')}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-mono font-bold flex items-center gap-2 border-b-2 transition-all shrink-0 ${
            activeTab === 'SAFETY_POLICY'
              ? 'border-sky-500 text-white bg-[#0e1424]'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#090d16]'
          }`}
        >
          <Shield className="w-4 h-4 text-sky-400" />
          <span>Safety Policy</span>
        </button>

        <button
          onClick={() => setActiveTab('FAILURE_LEARNINGS')}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-mono font-bold flex items-center gap-2 border-b-2 transition-all shrink-0 ${
            activeTab === 'FAILURE_LEARNINGS'
              ? 'border-rose-500 text-white bg-[#0e1424]'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#090d16]'
          }`}
        >
          <Brain className="w-4 h-4 text-rose-400" />
          <span>Learnings & Report</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === 'GOALS_MILESTONES' && (
          <GoalMilestonesTab
            goals={goals}
            milestones={milestones}
            onCreateGoal={handleCreateGoal}
          />
        )}

        {activeTab === 'APPROVALS' && (
          <ApprovalsQueueTab
            approvals={approvals}
            onApprove={handleApproveRequest}
            onReject={handleRejectRequest}
            onRequestMoreInfo={handleRequestMoreInfo}
          />
        )}

        {activeTab === 'QUALITY_REGRESSION' && (
          <QualityRegressionTab
            regressionTests={regressionTests}
            gameplayTests={gameplayTests}
            onRunRegression={handleRunRegression}
            onRunGameplayTests={handleRunGameplayTests}
          />
        )}

        {activeTab === 'IMPROVEMENTS' && (
          <ImprovementBacklogTab
            tasks={improvements}
            onApproveTask={handleApproveImprovement}
          />
        )}

        {activeTab === 'SAFETY_POLICY' && safetyPolicy && (
          <SafetyPolicyTab
            policy={safetyPolicy}
            onUpdatePolicy={handleUpdatePolicy}
          />
        )}

        {activeTab === 'FAILURE_LEARNINGS' && (
          <FailureLearningsTab
            learnings={failureLearnings}
            report={report}
          />
        )}
      </div>

      {/* Embervale Capture Action Modal */}
      <EmbervaleCaptureActionModal
        isOpen={isEmbervaleModalOpen}
        onClose={() => setIsEmbervaleModalOpen(false)}
        onRunGoal={loadState}
      />
    </div>
  );
};
