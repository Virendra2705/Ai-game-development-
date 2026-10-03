import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Project,
  Agent,
  Task,
  Build,
  Asset,
  TestCase,
  Activity,
  UserProfile,
  AIProvider,
  TaskStatus,
  MemoryEntry,
  DevelopmentDecision,
  ProjectMemorySnapshot,
  AIPlan,
  AIProviderStatus,
  AIUsageInfo,
  AIConversation,
} from '../types';
import { INITIAL_USER } from '../data/mockData';
import {
  projectService,
  taskService,
  agentService,
  buildService,
  assetService,
  testService,
  activityService,
  memoryService,
  decisionService,
  settingsService,
  aiPlanService,
  aiConversationService,
} from '../services';
import { getDatabaseAdapter } from '../adapters';

export type NavigationTab =
  | 'Dashboard'
  | 'Production'
  | 'Releases'
  | 'Deployments'
  | 'Incidents'
  | 'Monitoring'
  | 'Feedback'
  | 'Autonomous Development'
  | 'AI Command Center'
  | 'Projects'
  | 'Knowledge'
  | 'AI Agents'
  | 'Tasks'
  | 'Builds'
  | 'Game Preview'
  | 'QA & Debug'
  | 'Assets'
  | 'Tests'
  | 'Activity'
  | 'Project Memory'
  | 'Settings';

export interface ToastMessage {
  id: string;
  title: string;
  description: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface DashboardStats {
  totalProjects: number;
  activeTasks: number;
  completedTasks: number;
  runningAgents: number;
  failedTests: number;
  latestBuild: string;
  overallProgress: number;
  currentPhase: string;
  phaseProgress: number;
}

interface AppContextType {
  // Navigation & UI state
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Selected entities for modals
  selectedAgent: Agent | null;
  setSelectedAgent: (agent: Agent | null) => void;
  createProjectModalOpen: boolean;
  setCreateProjectModalOpen: (open: boolean) => void;
  createTaskModalOpen: boolean;
  setCreateTaskModalOpen: (open: boolean) => void;
  activeBuildModal: Build | null;
  setActiveBuildModal: (build: Build | null) => void;
  livePreviewExpanded: boolean;
  setLivePreviewExpanded: (expanded: boolean) => void;

  // Database & Adapter status
  adapterName: string;
  isLocalMode: boolean;
  adapterStatusMessage: string;
  isLoading: boolean;
  error: string | null;

  // Domain data
  user: UserProfile;
  projects: Project[];
  currentProject: Project;
  setCurrentProjectId: (id: string) => void;
  agents: Agent[];
  tasks: Task[];
  builds: Build[];
  tests: TestCase[];
  assets: Asset[];
  activities: Activity[];
  aiProviders: AIProvider[];
  memories: MemoryEntry[];
  decisions: DevelopmentDecision[];

  // Dynamic Dashboard Stats (Section 17)
  dashboardStats: DashboardStats;

  // Mutations
  createProject: (projectData: any) => Promise<Project>;
  createTask: (taskData: any) => Promise<Task>;
  updateTaskStatus: (taskId: string, newStatus: TaskStatus) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  isTaskBlocked: (task: Task) => boolean;
  sendAICommand: (commandText: string, mode?: 'send' | 'plan' | 'task') => Promise<void>;
  triggerBuild: () => Promise<void>;
  runTestSuite: () => Promise<void>;
  connectAIProvider: (providerId: string) => Promise<void>;
  saveMemory: (entry: Partial<MemoryEntry> & { category: any; title: string; content: string }) => Promise<void>;
  deleteMemory: (id: string) => Promise<void>;
  createDecision: (decision: { title: string; reason: string; createdBy?: string; category?: string }) => Promise<void>;
  updateDecisionStatus: (id: string, status: 'ACTIVE' | 'SUPERSEDED' | 'REJECTED') => Promise<void>;
  completeOnboarding: (projectId: string) => Promise<void>;
  getMemorySnapshot: () => Promise<ProjectMemorySnapshot>;

  // Toasts
  addToast: (title: string, description: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  toasts: ToastMessage[];
  dismissToast: (id: string) => void;
  resetToDefaults: () => Promise<void>;

  // Phase 3: AI Development Orchestrator & Gemini
  geminiStatus: AIProviderStatus;
  checkGeminiStatus: () => Promise<AIProviderStatus>;
  testGeminiConnection: () => Promise<{ success: boolean; model: string; latencyMs: number; message: string }>;
  currentAIPlan: AIPlan | null;
  setCurrentAIPlan: (plan: AIPlan | null) => void;
  projectPlans: AIPlan[];
  isPlanning: boolean;
  generateAIPlan: (command: string) => Promise<AIPlan>;
  approveCurrentPlan: (selectedTaskIndices?: number[], approvedMemoryIndices?: number[], approvedDecisionIndices?: number[]) => Promise<void>;
  rejectCurrentPlan: (planId?: string) => Promise<void>;
  activeConversation: AIConversation | null;
  sendChatMessage: (message: string) => Promise<void>;
  aiUsage: AIUsageInfo;
  refreshPlans: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const adapter = getDatabaseAdapter();

  // Navigation State
  const [activeTab, setActiveTab] = useState<NavigationTab>('Dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [livePreviewExpanded, setLivePreviewExpanded] = useState<boolean>(false);

  // Modals
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [createProjectModalOpen, setCreateProjectModalOpen] = useState<boolean>(false);
  const [createTaskModalOpen, setCreateTaskModalOpen] = useState<boolean>(false);
  const [activeBuildModal, setActiveBuildModal] = useState<Build | null>(null);

  // Status & Error handling
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Domain state
  const [user] = useState<UserProfile>(INITIAL_USER);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProjectId, setCurrentProjectIdState] = useState<string>('');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [builds, setBuilds] = useState<Build[]>([]);
  const [tests, setTests] = useState<TestCase[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [aiProviders, setAiProviders] = useState<AIProvider[]>([]);
  const [memories, setMemories] = useState<MemoryEntry[]>([]);
  const [decisions, setDecisions] = useState<DevelopmentDecision[]>([]);

  // Phase 3 AI State
  const [geminiStatus, setGeminiStatus] = useState<AIProviderStatus>({
    connected: false,
    provider: 'Google Gemini',
    model: 'gemini-3.8-flash',
  });
  const [currentAIPlan, setCurrentAIPlan] = useState<AIPlan | null>(null);
  const [projectPlans, setProjectPlans] = useState<AIPlan[]>([]);
  const [isPlanning, setIsPlanning] = useState<boolean>(false);
  const [activeConversation, setActiveConversation] = useState<AIConversation | null>(null);
  const [aiUsage, setAiUsage] = useState<AIUsageInfo>(() => aiPlanService.getUsageInfo());

  const addToast = useCallback(
    (title: string, description: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
      setToasts((prev) => [...prev, { id, title, description, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 5000);
    },
    []
  );

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Load all data from repository
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [
        loadedProjects,
        loadedTasks,
        loadedAgents,
        loadedBuilds,
        loadedTests,
        loadedAssets,
        loadedActivities,
        loadedProviders,
      ] = await Promise.all([
        projectService.getProjects(),
        taskService.getTasks(),
        agentService.getAgents(),
        buildService.getBuilds(),
        testService.getTests(),
        assetService.getAssets(),
        activityService.getActivities(),
        settingsService.getAIProviders(),
      ]);

      setProjects(loadedProjects);
      setTasks(loadedTasks);
      setAgents(loadedAgents);
      setBuilds(loadedBuilds);
      setTests(loadedTests);
      setAssets(loadedAssets);
      setActivities(loadedActivities);
      setAiProviders(loadedProviders);

      // Select initial active project
      const initialProjId =
        (typeof window !== 'undefined' && window.localStorage?.getItem('aigb_active_proj_id')) ||
        loadedProjects[0]?.id ||
        'proj-embervale';

      const validProjId = loadedProjects.find((p) => p.id === initialProjId)?.id || loadedProjects[0]?.id || '';
      setCurrentProjectIdState(validProjId);

      if (validProjId) {
        const [projMemories, projDecisions] = await Promise.all([
          memoryService.getMemories(validProjId),
          decisionService.getDecisions(validProjId),
        ]);
        setMemories(projMemories);
        setDecisions(projDecisions);

        // Load AI plans and active conversation
        const plans = aiPlanService.getPlansForProject(validProjId);
        setProjectPlans(plans);
        setCurrentAIPlan(plans.length > 0 ? plans[0] : null);
        const conv = aiConversationService.getActiveConversation(validProjId);
        setActiveConversation(conv);
      }

      // Check Gemini status
      try {
        const status = await aiPlanService.getStatus();
        setGeminiStatus(status);
      } catch (err) {
        console.warn('Could not retrieve Gemini status:', err);
      }
    } catch (err: any) {
      console.error('[AppContext] Failed to load data from repository:', err);
      setError(err?.message || 'Failed to initialize persistent repository');
      addToast('Persistence Warning', 'Operating on in-memory fallback adapter.', 'warning');
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Project Switching (Section 21: Data isolation)
  const setCurrentProjectId = async (id: string) => {
    setCurrentProjectIdState(id);
    if (typeof window !== 'undefined') {
      window.localStorage?.setItem('aigb_active_proj_id', id);
    }
    const targetProj = projects.find((p) => p.id === id);
    if (targetProj) {
      addToast('Project Switched', `Active project set to ${targetProj.name}`, 'info');
      // Load isolated memory and decisions for this project
      const [projMemories, projDecisions] = await Promise.all([
        memoryService.getMemories(id),
        decisionService.getDecisions(id),
      ]);
      setMemories(projMemories);
      setDecisions(projDecisions);

      // Load isolated AI plans & conversation
      const plans = aiPlanService.getPlansForProject(id);
      setProjectPlans(plans);
      setCurrentAIPlan(plans.length > 0 ? plans[0] : null);
      const conv = aiConversationService.getActiveConversation(id);
      setActiveConversation(conv);
    }
  };

  // Active Project Reference
  const currentProject: Project = useMemo(() => {
    const found = projects.find((p) => p.id === currentProjectId);
    if (found) return found;
    if (projects.length > 0) return projects[0];

    // Safe fallback
    return {
      id: 'proj-embervale',
      name: 'Embervale: Rift Tamers',
      slug: 'embervale-rift-tamers',
      description: 'Creature-taming action RPG built with Godot 4.3 and real-time elemental combat.',
      genre: 'Creature-Tamer Action RPG',
      engine: 'Godot',
      platforms: ['Android', 'PC'],
      platform: 'Android / PC',
      status: 'Development',
      progress: 42,
      currentPhase: '4. GAMEPLAY',
      phaseProgress: 42,
      thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
      createdAt: '2026-08-14',
      updatedAt: '2026-09-19',
      lastUpdated: 'Just now',
      ownerId: 'user-lead-producer',
      resolution: '1920x1080 (16:9)',
      devMode: 'Human-in-the-Loop',
    };
  }, [projects, currentProjectId]);

  // Section 15: Task Dependency Checker
  const isTaskBlocked = useCallback(
    (task: Task): boolean => {
      return taskService.isTaskBlocked(task, tasks);
    },
    [tasks]
  );

  // Section 17: DASHBOARD REAL DATA (Dynamically calculated, never hardcoded)
  const dashboardStats: DashboardStats = useMemo(() => {
    const projectTasks = tasks.filter((t) => t.projectId === currentProject.id);
    const activeTasks = projectTasks.filter(
      (t) =>
        t.status === 'IN_PROGRESS' ||
        t.status === 'Working' ||
        t.status === 'PLANNING' ||
        t.status === 'Planning' ||
        t.status === 'TESTING' ||
        t.status === 'Testing'
    ).length;

    const completedTasks = projectTasks.filter(
      (t) => t.status === 'COMPLETED' || t.status === 'Completed'
    ).length;

    const runningAgents = agents.filter(
      (a) => a.status === 'WORKING' || a.status === 'Working' || a.status === 'PLANNING'
    ).length;

    const projectTests = tests.filter((t) => t.projectId === currentProject.id);
    const failedTests = projectTests.filter(
      (t) => t.status === 'FAILED' || t.status === 'Failed'
    ).length;

    const projectBuilds = builds.filter((b) => b.projectId === currentProject.id);
    const latestBuild = projectBuilds[0]?.version || `#${projectBuilds[0]?.buildNumber || 142}`;

    // Calculate real progress based on completed tasks ratio and current phase
    const overallProgress =
      projectTasks.length > 0
        ? Math.round((completedTasks / projectTasks.length) * 100)
        : currentProject.progress || 0;

    return {
      totalProjects: projects.length,
      activeTasks,
      completedTasks,
      runningAgents,
      failedTests,
      latestBuild,
      overallProgress,
      currentPhase: currentProject.currentPhase || '4. GAMEPLAY',
      phaseProgress: currentProject.phaseProgress || overallProgress,
    };
  }, [projects.length, tasks, currentProject, agents, tests, builds]);

  // Keyboard shortcut for Command Palette (Ctrl+K / Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ==========================================
  // MUTATIONS (delegating to Service layer)
  // ==========================================

  const createProject = async (projectData: any): Promise<Project> => {
    try {
      const created = await projectService.createProject(projectData);
      setProjects((prev) => [created, ...prev]);
      await setCurrentProjectId(created.id);
      // Refresh activities
      const updatedActs = await activityService.getActivities(created.id);
      setActivities(updatedActs);
      addToast('Project Created', `${created.name} initialized with Phase 1 Setup.`, 'success');
      return created;
    } catch (err: any) {
      addToast('Creation Error', err.message || 'Failed to create project', 'error');
      throw err;
    }
  };

  const createTask = async (taskData: any): Promise<Task> => {
    try {
      const created = await taskService.createTask({
        ...taskData,
        projectId: taskData.projectId || currentProject.id,
      });
      setTasks((prev) => [created, ...prev]);
      const updatedActs = await activityService.getActivities(currentProject.id);
      setActivities(updatedActs);
      addToast('Task Created', `"${created.title}" added to pipeline.`, 'success');
      return created;
    } catch (err: any) {
      addToast('Error', err.message || 'Failed to create task', 'error');
      throw err;
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: TaskStatus) => {
    try {
      const result = await taskService.updateTaskStatus(taskId, newStatus);
      if (result.blockedReason) {
        addToast('Task Blocked', result.blockedReason, 'warning');
        return;
      }
      setTasks((prev) => prev.map((t) => (t.id === taskId ? result.task : t)));
      const updatedActs = await activityService.getActivities(currentProject.id);
      setActivities(updatedActs);
    } catch (err: any) {
      addToast('Status Error', err.message || 'Failed to update task status', 'error');
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const task = tasks.find((t) => t.id === taskId);
      await taskService.deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      if (task) {
        addToast('Task Deleted', `"${task.title}" removed.`, 'info');
      }
    } catch (err: any) {
      addToast('Error', err.message || 'Failed to delete task', 'error');
    }
  };

  /**
   * Phase 3: AI Development Orchestrator & Gemini Planning
   */
  const checkGeminiStatus = useCallback(async (): Promise<AIProviderStatus> => {
    const status = await aiPlanService.getStatus();
    setGeminiStatus(status);
    return status;
  }, []);

  const testGeminiConnection = useCallback(async () => {
    const res = await aiPlanService.testConnection();
    await checkGeminiStatus();
    return res;
  }, [checkGeminiStatus]);

  const refreshPlans = useCallback(() => {
    if (!currentProject?.id) return;
    const plans = aiPlanService.getPlansForProject(currentProject.id);
    setProjectPlans(plans);
    if (!currentAIPlan && plans.length > 0) {
      setCurrentAIPlan(plans[0]);
    }
    setAiUsage(aiPlanService.getUsageInfo());
  }, [currentProject?.id, currentAIPlan]);

  const generateAIPlan = async (command: string): Promise<AIPlan> => {
    if (!command.trim()) {
      throw new Error('Command cannot be empty');
    }

    setIsPlanning(true);
    addToast('AI Architect Activated', `Analyzing project context and constructing plan for "${command}"...`, 'info');

    try {
      const memorySnapshot = await memoryService.getMemorySnapshot(currentProject.id);

      const plan = await aiPlanService.createPlanRequest({
        projectId: currentProject.id,
        projectName: currentProject.name,
        genre: currentProject.genre,
        engine: currentProject.engine,
        platform: currentProject.platform,
        currentPhase: currentProject.currentPhase,
        userCommand: command,
        constraints: memorySnapshot.constraints,
      });

      setCurrentAIPlan(plan);
      setProjectPlans((prev) => [plan, ...prev.filter((p) => p.planId !== plan.planId)]);
      setAiUsage(aiPlanService.getUsageInfo());

      const updatedActs = await activityService.getActivities(currentProject.id);
      setActivities(updatedActs);

      addToast(
        'Plan Generated',
        `Proposed ${plan.response.tasks.length} tasks for "${command}". Review and approve before execution.`,
        'success'
      );

      return plan;
    } catch (err: any) {
      console.error('[AppContext] Failed to generate AI plan:', err);
      addToast('Planning Error', err.message || 'Failed to generate development plan', 'error');
      throw err;
    } finally {
      setIsPlanning(false);
    }
  };

  const approveCurrentPlan = async (
    selectedTaskIndices?: number[],
    approvedMemoryIndices?: number[],
    approvedDecisionIndices?: number[]
  ) => {
    if (!currentAIPlan) {
      addToast('No Active Plan', 'There is no pending plan to approve.', 'warning');
      return;
    }

    try {
      const { createdTasks } = await aiPlanService.approvePlan({
        plan: currentAIPlan,
        selectedTaskIndices,
        approvedMemoryIndices,
        approvedDecisionIndices,
      });

      // Update state
      setTasks((prev) => [...createdTasks, ...prev]);

      const [updatedActs, updatedMemories, updatedDecisions] = await Promise.all([
        activityService.getActivities(currentProject.id),
        memoryService.getMemories(currentProject.id),
        decisionService.getDecisions(currentProject.id),
      ]);

      setActivities(updatedActs);
      setMemories(updatedMemories);
      setDecisions(updatedDecisions);

      // Refresh plan in state
      setCurrentAIPlan({ ...currentAIPlan, status: 'APPROVED', approvedAt: new Date().toISOString() });
      refreshPlans();

      addToast(
        'Plan Approved',
        `Successfully created ${createdTasks.length} tasks ready in the execution queue.`,
        'success'
      );
    } catch (err: any) {
      addToast('Approval Error', err.message || 'Failed to approve plan', 'error');
    }
  };

  const rejectCurrentPlan = async (planId?: string) => {
    const targetId = planId || currentAIPlan?.planId;
    if (!targetId) return;

    try {
      await aiPlanService.rejectPlan(targetId, currentProject.id);
      if (currentAIPlan && currentAIPlan.planId === targetId) {
        setCurrentAIPlan({ ...currentAIPlan, status: 'REJECTED', rejectedAt: new Date().toISOString() });
      }
      refreshPlans();
      const updatedActs = await activityService.getActivities(currentProject.id);
      setActivities(updatedActs);
      addToast('Plan Rejected', 'Plan was rejected. No files or tasks were modified.', 'info');
    } catch (err: any) {
      addToast('Error', err.message || 'Failed to reject plan', 'error');
    }
  };

  const sendChatMessage = async (message: string) => {
    if (!message.trim() || !activeConversation) return;

    try {
      const result = await aiConversationService.sendMessage({
        projectId: currentProject.id,
        projectName: currentProject.name,
        conversationId: activeConversation.conversationId,
        userMessage: message,
        currentPlan: currentAIPlan?.response,
      });

      // Reload conversation
      const conv = aiConversationService.getActiveConversation(currentProject.id);
      setActiveConversation(conv);

      // If AI proposed an updated plan during chat, update current plan
      if (result.updatedPlan && currentAIPlan) {
        const updatedAIPlan: AIPlan = {
          ...currentAIPlan,
          response: result.updatedPlan,
          version: currentAIPlan.version + 1,
          status: 'PENDING_APPROVAL',
        };
        aiPlanService.savePlan(updatedAIPlan);
        setCurrentAIPlan(updatedAIPlan);
        refreshPlans();
        addToast('Plan Revised', 'The Game Architect revised the development plan based on your feedback.', 'info');
      }
    } catch (err: any) {
      addToast('Chat Error', err.message || 'Failed to send message to Architect', 'error');
    }
  };

  /**
   * Section 29: Quick Command Dispatcher
   * Routes "plan" mode directly to the AI Architect
   */
  const sendAICommand = async (commandText: string, mode: 'send' | 'plan' | 'task' = 'send') => {
    if (mode === 'plan') {
      try {
        await generateAIPlan(commandText);
        setActiveTab('AI Command Center');
      } catch {
        // Handled in generateAIPlan
      }
      return;
    }

    try {
      const taskTitle = commandText.length > 70 ? commandText.substring(0, 67) + '...' : commandText;
      const createdTask = await taskService.createTask(
        {
          projectId: currentProject.id,
          title: taskTitle,
          description: `Generated from Command: "${commandText}"`,
          priority: 'MEDIUM',
          status: 'PLANNING',
          assignedAgentId: 'agent-architect',
          tags: ['AI-Command', mode.toUpperCase()],
        },
        'Game Architect'
      );

      setTasks((prev) => [createdTask, ...prev]);
      const updatedActs = await activityService.getActivities(currentProject.id);
      setActivities(updatedActs);

      addToast(
        'Command Dispatched',
        `Created planning task: "${createdTask.title}" assigned to Game Architect.`,
        'success'
      );
    } catch (err: any) {
      addToast('Command Error', err.message || 'Failed to dispatch command', 'error');
    }
  };

  const triggerBuild = async () => {
    try {
      const build = await buildService.triggerBuild(currentProject.id);
      setBuilds((prev) => [build, ...prev]);
      const updatedActs = await activityService.getActivities(currentProject.id);
      setActivities(updatedActs);
      addToast('Build Triggered', `Compilation #${build.buildNumber} queued.`, 'info');
    } catch (err: any) {
      addToast('Build Error', err.message || 'Failed to trigger build', 'error');
    }
  };

  const runTestSuite = async () => {
    try {
      const updated = await testService.runTestSuite(currentProject.id);
      setTests(updated);
      const updatedActs = await activityService.getActivities(currentProject.id);
      setActivities(updatedActs);
      addToast('Test Suite Executed', 'All QA assertions refreshed.', 'success');
    } catch (err: any) {
      addToast('QA Error', err.message || 'Failed to run test suite', 'error');
    }
  };

  const connectAIProvider = async (providerId: string) => {
    try {
      const updated = await settingsService.toggleAIProvider(providerId);
      setAiProviders(updated);
      addToast(
        'Provider Configured',
        'Updated AI model connection setting. Autonomous dispatch ready for Phase 3.',
        'info'
      );
    } catch (err: any) {
      addToast('Provider Error', err.message || 'Failed to update provider', 'error');
    }
  };

  // Section 12: Project Memory mutations
  const saveMemory = async (entry: Partial<MemoryEntry> & { category: any; title: string; content: string }) => {
    try {
      const saved = await memoryService.saveMemory({
        ...entry,
        projectId: currentProject.id,
      });
      setMemories((prev) => {
        const idx = prev.findIndex((m) => m.id === saved.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = saved;
          return next;
        }
        return [saved, ...prev];
      });
      const updatedActs = await activityService.getActivities(currentProject.id);
      setActivities(updatedActs);
      addToast('Memory Saved', `Updated "${saved.title}" in Project Memory.`, 'success');
    } catch (err: any) {
      addToast('Memory Error', err.message || 'Failed to save memory entry', 'error');
    }
  };

  const deleteMemory = async (id: string) => {
    try {
      await memoryService.deleteMemory(id, currentProject.id);
      setMemories((prev) => prev.filter((m) => m.id !== id));
      addToast('Memory Removed', 'Record deleted from project memory.', 'info');
    } catch (err: any) {
      addToast('Error', err.message || 'Failed to delete memory', 'error');
    }
  };

  // Section 13: Development Decisions mutations
  const createDecision = async (decision: { title: string; reason: string; createdBy?: string; category?: string }) => {
    try {
      const saved = await decisionService.createDecision({
        ...decision,
        createdBy: decision.createdBy || 'Game Architect',
        projectId: currentProject.id,
        status: 'ACTIVE',
      });
      setDecisions((prev) => [saved, ...prev]);
      const updatedActs = await activityService.getActivities(currentProject.id);
      setActivities(updatedActs);
      addToast('Decision Recorded', `Architectural decision saved: "${saved.title}".`, 'success');
    } catch (err: any) {
      addToast('Error', err.message || 'Failed to record decision', 'error');
    }
  };

  const updateDecisionStatus = async (id: string, status: 'ACTIVE' | 'SUPERSEDED' | 'REJECTED') => {
    try {
      const updated = await decisionService.updateDecisionStatus(id, currentProject.id, status);
      if (updated) {
        setDecisions((prev) => prev.map((d) => (d.id === id ? updated : d)));
        addToast('Status Updated', `Decision marked as ${status}.`, 'info');
      }
    } catch (err: any) {
      addToast('Error', err.message || 'Failed to update decision', 'error');
    }
  };

  // Section 20: Complete Onboarding Flow
  const completeOnboarding = async (projectId: string) => {
    try {
      const updated = await projectService.completeOnboarding(projectId);
      if (updated) {
        setProjects((prev) => prev.map((p) => (p.id === projectId ? updated : p)));
        addToast('Setup Complete', `Project initialized into Phase 2 Game Design.`, 'success');
      }
    } catch (err: any) {
      addToast('Error', err.message || 'Failed to complete onboarding', 'error');
    }
  };

  const getMemorySnapshot = async (): Promise<ProjectMemorySnapshot> => {
    return memoryService.getMemorySnapshot(currentProject.id, currentProject.name);
  };

  const resetToDefaults = async () => {
    try {
      await adapter.resetData();
      await loadData();
      addToast('Reset Complete', 'Restored default seed data and persistent records.', 'info');
    } catch (err: any) {
      addToast('Reset Error', err.message || 'Failed to reset repository', 'error');
    }
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        sidebarCollapsed,
        setSidebarCollapsed,
        commandPaletteOpen,
        setCommandPaletteOpen,
        searchQuery,
        setSearchQuery,
        selectedAgent,
        setSelectedAgent,
        createProjectModalOpen,
        setCreateProjectModalOpen,
        createTaskModalOpen,
        setCreateTaskModalOpen,
        activeBuildModal,
        setActiveBuildModal,
        livePreviewExpanded,
        setLivePreviewExpanded,
        adapterName: adapter.name,
        isLocalMode: adapter.isLocal,
        adapterStatusMessage: adapter.statusMessage,
        isLoading,
        error,
        user,
        projects,
        currentProject,
        setCurrentProjectId,
        agents,
        tasks,
        builds,
        tests,
        assets,
        activities,
        aiProviders,
        memories,
        decisions,
        dashboardStats,
        createProject,
        createTask,
        updateTaskStatus,
        deleteTask,
        isTaskBlocked,
        sendAICommand,
        triggerBuild,
        runTestSuite,
        connectAIProvider,
        saveMemory,
        deleteMemory,
        createDecision,
        updateDecisionStatus,
        completeOnboarding,
        getMemorySnapshot,
        addToast,
        toasts,
        dismissToast,
        resetToDefaults,
        geminiStatus,
        checkGeminiStatus,
        testGeminiConnection,
        currentAIPlan,
        setCurrentAIPlan,
        projectPlans,
        isPlanning,
        generateAIPlan,
        approveCurrentPlan,
        rejectCurrentPlan,
        activeConversation,
        sendChatMessage,
        aiUsage,
        refreshPlans,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
