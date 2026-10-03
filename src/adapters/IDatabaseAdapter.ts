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

export interface IDatabaseAdapter {
  // Adapter metadata
  name: string;
  isLocal: boolean;
  statusMessage: string;

  // Projects
  getProjects(): Promise<Project[]>;
  getProjectById(id: string): Promise<Project | null>;
  saveProject(project: Project): Promise<Project>;
  deleteProject(id: string): Promise<boolean>;

  // Tasks
  getTasks(projectId?: string): Promise<Task[]>;
  getTaskById(id: string): Promise<Task | null>;
  saveTask(task: Task): Promise<Task>;
  deleteTask(id: string): Promise<boolean>;

  // Agents
  getAgents(projectId?: string): Promise<Agent[]>;
  getAgentById(id: string): Promise<Agent | null>;
  saveAgent(agent: Agent): Promise<Agent>;

  // Builds
  getBuilds(projectId?: string): Promise<Build[]>;
  getBuildById(id: string): Promise<Build | null>;
  saveBuild(build: Build): Promise<Build>;

  // Assets
  getAssets(projectId?: string): Promise<Asset[]>;
  getAssetById(id: string): Promise<Asset | null>;
  saveAsset(asset: Asset): Promise<Asset>;
  deleteAsset(id: string): Promise<boolean>;

  // Tests
  getTests(projectId?: string): Promise<TestCase[]>;
  getTestById(id: string): Promise<TestCase | null>;
  saveTest(test: TestCase): Promise<TestCase>;

  // Activities
  getActivities(projectId?: string, limit?: number): Promise<Activity[]>;
  saveActivity(activity: Activity): Promise<Activity>;

  // Project Memory
  getMemoryEntries(projectId: string, category?: string): Promise<MemoryEntry[]>;
  saveMemoryEntry(entry: MemoryEntry): Promise<MemoryEntry>;
  deleteMemoryEntry(id: string): Promise<boolean>;

  // Development Decisions
  getDecisions(projectId: string): Promise<DevelopmentDecision[]>;
  saveDecision(decision: DevelopmentDecision): Promise<DevelopmentDecision>;

  // Project Settings
  getProjectSettings(projectId: string): Promise<ProjectSettings | null>;
  saveProjectSettings(settings: ProjectSettings): Promise<ProjectSettings>;

  // AI Providers
  getAIProviders(): Promise<AIProvider[]>;
  saveAIProvider(provider: AIProvider): Promise<AIProvider>;

  // Reset to initial seed
  resetData(): Promise<void>;
}
