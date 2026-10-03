import { IDatabaseAdapter } from './IDatabaseAdapter';
import {
  Project,
  Task,
  Agent,
  Build,
  Asset,
  TestCase,
  Activity,
  MemoryEntry,
  DevelopmentDecision,
  ProjectSettings,
  AIProvider,
} from '../types';
import {
  INITIAL_PROJECTS,
  INITIAL_AGENTS,
  INITIAL_TASKS,
  INITIAL_BUILDS,
  INITIAL_TESTS,
  INITIAL_ASSETS,
  INITIAL_ACTIVITIES,
  INITIAL_AI_PROVIDERS,
} from '../data/mockData';
import { INITIAL_MEMORIES, INITIAL_DECISIONS } from '../data/initialMemoryData';

const STORAGE_PREFIX = 'aigb_phase2_';

const KEYS = {
  PROJECTS: `${STORAGE_PREFIX}projects`,
  TASKS: `${STORAGE_PREFIX}tasks`,
  AGENTS: `${STORAGE_PREFIX}agents`,
  BUILDS: `${STORAGE_PREFIX}builds`,
  ASSETS: `${STORAGE_PREFIX}assets`,
  TESTS: `${STORAGE_PREFIX}tests`,
  ACTIVITIES: `${STORAGE_PREFIX}activities`,
  MEMORIES: `${STORAGE_PREFIX}memories`,
  DECISIONS: `${STORAGE_PREFIX}decisions`,
  SETTINGS: `${STORAGE_PREFIX}settings`,
  PROVIDERS: `${STORAGE_PREFIX}providers`,
};

export class LocalRepository implements IDatabaseAdapter {
  name = 'Local Dev Repository (LocalStorage & In-Memory)';
  isLocal = true;
  statusMessage = 'LOCAL MODE • PERSISTENT REPOSITORY ACTIVE';

  // In-memory fallback if localStorage is disabled or throws
  private memoryCache: Record<string, any> = {};

  constructor() {
    this.ensureInitialized();
  }

  private getItem<T>(key: string, defaultValue: T): T {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = window.localStorage.getItem(key);
        if (stored) {
          return JSON.parse(stored);
        }
      }
    } catch (err) {
      console.warn(`[LocalRepository] Storage read warning for ${key}:`, err);
    }
    if (this.memoryCache[key]) {
      return this.memoryCache[key];
    }
    this.setItem(key, defaultValue);
    return defaultValue;
  }

  private setItem<T>(key: string, value: T): void {
    this.memoryCache[key] = value;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (err) {
      console.warn(`[LocalRepository] Storage write warning for ${key}:`, err);
    }
  }

  private ensureInitialized(): void {
    // Projects with Phase 2 fields (slug, platforms, currentPhase, phaseProgress, ownerId)
    const storedProjects = this.getItem<Project[]>(KEYS.PROJECTS, []);
    if (!storedProjects || storedProjects.length === 0) {
      const enrichedProjects: Project[] = INITIAL_PROJECTS.map((p) => ({
        ...p,
        slug: p.id.replace('proj-', ''),
        platforms: p.platform ? [p.platform] : ['PC', 'Android'],
        ownerId: 'user-lead-producer',
        phaseProgress: p.progress,
        thumbnail: p.thumbnailUrl,
        updatedAt: p.lastUpdated || 'Just now',
      }));
      this.setItem(KEYS.PROJECTS, enrichedProjects);
    }

    // Tasks with Phase 2 fields (dependencies, createdBy, assignedAgentId)
    const storedTasks = this.getItem<Task[]>(KEYS.TASKS, []);
    if (!storedTasks || storedTasks.length === 0) {
      const enrichedTasks: Task[] = INITIAL_TASKS.map((t, idx) => ({
        ...t,
        assignedAgentId: t.agentId || 'agent-coding',
        createdBy: 'Game Architect',
        // Example dependencies: task-capture depends on player controller (task-1)
        dependencies: idx === 2 ? ['task-1'] : [],
      }));
      this.setItem(KEYS.TASKS, enrichedTasks);
    }

    // Agents
    const storedAgents = this.getItem<Agent[]>(KEYS.AGENTS, []);
    if (!storedAgents || storedAgents.length === 0) {
      const enrichedAgents: Agent[] = INITIAL_AGENTS.map((a) => ({
        ...a,
        provider: a.futureAIProvider || 'Gemini',
        model: a.providerStatus || 'gemini-2.5-pro',
        capabilities: a.responsibilities || [],
        createdAt: '2026-08-01',
      }));
      this.setItem(KEYS.AGENTS, enrichedAgents);
    }

    // Builds
    const storedBuilds = this.getItem<Build[]>(KEYS.BUILDS, []);
    if (!storedBuilds || storedBuilds.length === 0) {
      const enrichedBuilds: Build[] = INITIAL_BUILDS.map((b) => ({
        ...b,
        branch: 'main',
        startedAt: b.date || 'Today, 04:30 AM',
        testsPassed: 29,
        testsFailed: 0,
      }));
      this.setItem(KEYS.BUILDS, enrichedBuilds);
    }

    // Assets
    const storedAssets = this.getItem<Asset[]>(KEYS.ASSETS, []);
    if (!storedAssets || storedAssets.length === 0) {
      this.setItem(KEYS.ASSETS, INITIAL_ASSETS);
    }

    // Tests
    const storedTests = this.getItem<TestCase[]>(KEYS.TESTS, []);
    if (!storedTests || storedTests.length === 0) {
      const enrichedTests: TestCase[] = INITIAL_TESTS.map((t) => ({
        ...t,
        description: t.details || 'Automated validation assertion',
        severity: 'MEDIUM',
      }));
      this.setItem(KEYS.TESTS, enrichedTests);
    }

    // Activities
    const storedActivities = this.getItem<Activity[]>(KEYS.ACTIVITIES, []);
    if (!storedActivities || storedActivities.length === 0) {
      const enrichedActivities: Activity[] = INITIAL_ACTIVITIES.map((act) => ({
        ...act,
        actor: act.title || 'System',
        actorId: act.agentId || 'system',
        message: act.description || act.title,
        createdAt: act.timestamp || new Date().toISOString(),
      }));
      this.setItem(KEYS.ACTIVITIES, enrichedActivities);
    }

    // Memories
    const storedMemories = this.getItem<MemoryEntry[]>(KEYS.MEMORIES, []);
    if (!storedMemories || storedMemories.length === 0) {
      this.setItem(KEYS.MEMORIES, INITIAL_MEMORIES);
    }

    // Decisions
    const storedDecisions = this.getItem<DevelopmentDecision[]>(KEYS.DECISIONS, []);
    if (!storedDecisions || storedDecisions.length === 0) {
      this.setItem(KEYS.DECISIONS, INITIAL_DECISIONS);
    }

    // AI Providers
    const storedProviders = this.getItem<AIProvider[]>(KEYS.PROVIDERS, []);
    if (!storedProviders || storedProviders.length === 0) {
      this.setItem(KEYS.PROVIDERS, INITIAL_AI_PROVIDERS);
    }
  }

  // Projects
  async getProjects(): Promise<Project[]> {
    return this.getItem<Project[]>(KEYS.PROJECTS, []);
  }

  async getProjectById(id: string): Promise<Project | null> {
    const list = await this.getProjects();
    return list.find((p) => p.id === id) || null;
  }

  async saveProject(project: Project): Promise<Project> {
    const list = await this.getProjects();
    const index = list.findIndex((p) => p.id === project.id);
    let updated: Project[];
    if (index >= 0) {
      updated = [...list];
      updated[index] = { ...project, updatedAt: new Date().toISOString() };
    } else {
      updated = [project, ...list];
    }
    this.setItem(KEYS.PROJECTS, updated);
    return project;
  }

  async deleteProject(id: string): Promise<boolean> {
    const list = await this.getProjects();
    const filtered = list.filter((p) => p.id !== id);
    this.setItem(KEYS.PROJECTS, filtered);
    return true;
  }

  // Tasks
  async getTasks(projectId?: string): Promise<Task[]> {
    const list = this.getItem<Task[]>(KEYS.TASKS, []);
    if (projectId) {
      return list.filter((t) => t.projectId === projectId);
    }
    return list;
  }

  async getTaskById(id: string): Promise<Task | null> {
    const list = await this.getTasks();
    return list.find((t) => t.id === id) || null;
  }

  async saveTask(task: Task): Promise<Task> {
    const list = this.getItem<Task[]>(KEYS.TASKS, []);
    const index = list.findIndex((t) => t.id === task.id);
    let updated: Task[];
    if (index >= 0) {
      updated = [...list];
      updated[index] = { ...task, updatedAt: new Date().toISOString() };
    } else {
      updated = [task, ...list];
    }
    this.setItem(KEYS.TASKS, updated);
    return task;
  }

  async deleteTask(id: string): Promise<boolean> {
    const list = this.getItem<Task[]>(KEYS.TASKS, []);
    this.setItem(KEYS.TASKS, list.filter((t) => t.id !== id));
    return true;
  }

  // Agents
  async getAgents(projectId?: string): Promise<Agent[]> {
    const list = this.getItem<Agent[]>(KEYS.AGENTS, []);
    if (projectId) {
      return list.filter((a) => !a.projectId || a.projectId === projectId);
    }
    return list;
  }

  async getAgentById(id: string): Promise<Agent | null> {
    const list = await this.getAgents();
    return list.find((a) => a.id === id) || null;
  }

  async saveAgent(agent: Agent): Promise<Agent> {
    const list = this.getItem<Agent[]>(KEYS.AGENTS, []);
    const index = list.findIndex((a) => a.id === agent.id);
    let updated: Agent[];
    if (index >= 0) {
      updated = [...list];
      updated[index] = agent;
    } else {
      updated = [...list, agent];
    }
    this.setItem(KEYS.AGENTS, updated);
    return agent;
  }

  // Builds
  async getBuilds(projectId?: string): Promise<Build[]> {
    const list = this.getItem<Build[]>(KEYS.BUILDS, []);
    if (projectId) {
      return list.filter((b) => b.projectId === projectId);
    }
    return list;
  }

  async getBuildById(id: string): Promise<Build | null> {
    const list = await this.getBuilds();
    return list.find((b) => b.id === id) || null;
  }

  async saveBuild(build: Build): Promise<Build> {
    const list = this.getItem<Build[]>(KEYS.BUILDS, []);
    const index = list.findIndex((b) => b.id === build.id);
    let updated: Build[];
    if (index >= 0) {
      updated = [...list];
      updated[index] = build;
    } else {
      updated = [build, ...list];
    }
    this.setItem(KEYS.BUILDS, updated);
    return build;
  }

  // Assets
  async getAssets(projectId?: string): Promise<Asset[]> {
    const list = this.getItem<Asset[]>(KEYS.ASSETS, []);
    if (projectId) {
      return list.filter((a) => a.projectId === projectId);
    }
    return list;
  }

  async getAssetById(id: string): Promise<Asset | null> {
    const list = await this.getAssets();
    return list.find((a) => a.id === id) || null;
  }

  async saveAsset(asset: Asset): Promise<Asset> {
    const list = this.getItem<Asset[]>(KEYS.ASSETS, []);
    const index = list.findIndex((a) => a.id === asset.id);
    let updated: Asset[];
    if (index >= 0) {
      updated = [...list];
      updated[index] = asset;
    } else {
      updated = [asset, ...list];
    }
    this.setItem(KEYS.ASSETS, updated);
    return asset;
  }

  async deleteAsset(id: string): Promise<boolean> {
    const list = this.getItem<Asset[]>(KEYS.ASSETS, []);
    this.setItem(KEYS.ASSETS, list.filter((a) => a.id !== id));
    return true;
  }

  // Tests
  async getTests(projectId?: string): Promise<TestCase[]> {
    const list = this.getItem<TestCase[]>(KEYS.TESTS, []);
    if (projectId) {
      return list.filter((t) => t.projectId === projectId);
    }
    return list;
  }

  async getTestById(id: string): Promise<TestCase | null> {
    const list = await this.getTests();
    return list.find((t) => t.id === id) || null;
  }

  async saveTest(test: TestCase): Promise<TestCase> {
    const list = this.getItem<TestCase[]>(KEYS.TESTS, []);
    const index = list.findIndex((t) => t.id === test.id);
    let updated: TestCase[];
    if (index >= 0) {
      updated = [...list];
      updated[index] = test;
    } else {
      updated = [test, ...list];
    }
    this.setItem(KEYS.TESTS, updated);
    return test;
  }

  // Activities
  async getActivities(projectId?: string, limit: number = 50): Promise<Activity[]> {
    const list = this.getItem<Activity[]>(KEYS.ACTIVITIES, []);
    const filtered = projectId ? list.filter((a) => !a.projectId || a.projectId === projectId) : list;
    return filtered.slice(0, limit);
  }

  async saveActivity(activity: Activity): Promise<Activity> {
    const list = this.getItem<Activity[]>(KEYS.ACTIVITIES, []);
    const updated = [activity, ...list].slice(0, 200); // Keep last 200 events
    this.setItem(KEYS.ACTIVITIES, updated);
    return activity;
  }

  // Project Memory
  async getMemoryEntries(projectId: string, category?: string): Promise<MemoryEntry[]> {
    const list = this.getItem<MemoryEntry[]>(KEYS.MEMORIES, []);
    const projectMemories = list.filter((m) => m.projectId === projectId);
    if (category) {
      return projectMemories.filter((m) => m.category === category);
    }
    return projectMemories;
  }

  async saveMemoryEntry(entry: MemoryEntry): Promise<MemoryEntry> {
    const list = this.getItem<MemoryEntry[]>(KEYS.MEMORIES, []);
    const index = list.findIndex((m) => m.id === entry.id);
    let updated: MemoryEntry[];
    if (index >= 0) {
      updated = [...list];
      updated[index] = { ...entry, version: (entry.version || 1) + 1, updatedAt: new Date().toISOString() };
    } else {
      updated = [entry, ...list];
    }
    this.setItem(KEYS.MEMORIES, updated);
    return entry;
  }

  async deleteMemoryEntry(id: string): Promise<boolean> {
    const list = this.getItem<MemoryEntry[]>(KEYS.MEMORIES, []);
    this.setItem(KEYS.MEMORIES, list.filter((m) => m.id !== id));
    return true;
  }

  // Development Decisions
  async getDecisions(projectId: string): Promise<DevelopmentDecision[]> {
    const list = this.getItem<DevelopmentDecision[]>(KEYS.DECISIONS, []);
    return list.filter((d) => d.projectId === projectId);
  }

  async saveDecision(decision: DevelopmentDecision): Promise<DevelopmentDecision> {
    const list = this.getItem<DevelopmentDecision[]>(KEYS.DECISIONS, []);
    const index = list.findIndex((d) => d.id === decision.id);
    let updated: DevelopmentDecision[];
    if (index >= 0) {
      updated = [...list];
      updated[index] = decision;
    } else {
      updated = [decision, ...list];
    }
    this.setItem(KEYS.DECISIONS, updated);
    return decision;
  }

  // Project Settings
  async getProjectSettings(projectId: string): Promise<ProjectSettings | null> {
    const allSettings = this.getItem<Record<string, ProjectSettings>>(KEYS.SETTINGS, {});
    return allSettings[projectId] || null;
  }

  async saveProjectSettings(settings: ProjectSettings): Promise<ProjectSettings> {
    const allSettings = this.getItem<Record<string, ProjectSettings>>(KEYS.SETTINGS, {});
    allSettings[settings.projectId] = settings;
    this.setItem(KEYS.SETTINGS, allSettings);
    return settings;
  }

  // AI Providers
  async getAIProviders(): Promise<AIProvider[]> {
    return this.getItem<AIProvider[]>(KEYS.PROVIDERS, INITIAL_AI_PROVIDERS);
  }

  async saveAIProvider(provider: AIProvider): Promise<AIProvider> {
    const list = await this.getAIProviders();
    const index = list.findIndex((p) => p.id === provider.id);
    let updated: AIProvider[];
    if (index >= 0) {
      updated = [...list];
      updated[index] = provider;
    } else {
      updated = [...list, provider];
    }
    this.setItem(KEYS.PROVIDERS, updated);
    return provider;
  }

  // Reset Data
  async resetData(): Promise<void> {
    if (typeof window !== 'undefined' && window.localStorage) {
      Object.values(KEYS).forEach((k) => window.localStorage.removeItem(k));
    }
    this.memoryCache = {};
    this.ensureInitialized();
  }
}
