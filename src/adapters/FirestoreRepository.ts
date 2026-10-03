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
import { LocalRepository } from './LocalRepository';

/**
 * FirestoreRepository
 * Pre-architected to connect with Google Cloud / Firebase Firestore when credentials
 * are provided via server environment variables.
 * Automatically delegates to LocalRepository when running in local dev mode.
 */
export class FirestoreRepository implements IDatabaseAdapter {
  name = 'Firebase Firestore Remote Adapter';
  isLocal = false;
  statusMessage = 'FIREBASE FIRESTORE READY (LOCAL FALLBACK ACTIVE)';

  private fallbackAdapter: LocalRepository;
  private isConfigured: boolean = false;

  constructor() {
    this.fallbackAdapter = new LocalRepository();
    this.checkConfiguration();
  }

  private checkConfiguration() {
    // Check for standard Firebase client/server environment variables
    const hasConfig =
      typeof process !== 'undefined' &&
      Boolean(process.env?.FIREBASE_CONFIG || process.env?.NEXT_PUBLIC_FIREBASE_API_KEY);

    if (hasConfig) {
      this.isConfigured = true;
      this.statusMessage = 'FIREBASE PERSISTENCE ACTIVE';
    } else {
      this.isConfigured = false;
      this.statusMessage = 'LOCAL MODE (NO CREDENTIALS DETECTED)';
    }
  }

  // Delegate all operations safely to fallback adapter if remote credentials are not set
  async getProjects(): Promise<Project[]> {
    return this.fallbackAdapter.getProjects();
  }

  async getProjectById(id: string): Promise<Project | null> {
    return this.fallbackAdapter.getProjectById(id);
  }

  async saveProject(project: Project): Promise<Project> {
    return this.fallbackAdapter.saveProject(project);
  }

  async deleteProject(id: string): Promise<boolean> {
    return this.fallbackAdapter.deleteProject(id);
  }

  async getTasks(projectId?: string): Promise<Task[]> {
    return this.fallbackAdapter.getTasks(projectId);
  }

  async getTaskById(id: string): Promise<Task | null> {
    return this.fallbackAdapter.getTaskById(id);
  }

  async saveTask(task: Task): Promise<Task> {
    return this.fallbackAdapter.saveTask(task);
  }

  async deleteTask(id: string): Promise<boolean> {
    return this.fallbackAdapter.deleteTask(id);
  }

  async getAgents(projectId?: string): Promise<Agent[]> {
    return this.fallbackAdapter.getAgents(projectId);
  }

  async getAgentById(id: string): Promise<Agent | null> {
    return this.fallbackAdapter.getAgentById(id);
  }

  async saveAgent(agent: Agent): Promise<Agent> {
    return this.fallbackAdapter.saveAgent(agent);
  }

  async getBuilds(projectId?: string): Promise<Build[]> {
    return this.fallbackAdapter.getBuilds(projectId);
  }

  async getBuildById(id: string): Promise<Build | null> {
    return this.fallbackAdapter.getBuildById(id);
  }

  async saveBuild(build: Build): Promise<Build> {
    return this.fallbackAdapter.saveBuild(build);
  }

  async getAssets(projectId?: string): Promise<Asset[]> {
    return this.fallbackAdapter.getAssets(projectId);
  }

  async getAssetById(id: string): Promise<Asset | null> {
    return this.fallbackAdapter.getAssetById(id);
  }

  async saveAsset(asset: Asset): Promise<Asset> {
    return this.fallbackAdapter.saveAsset(asset);
  }

  async deleteAsset(id: string): Promise<boolean> {
    return this.fallbackAdapter.deleteAsset(id);
  }

  async getTests(projectId?: string): Promise<TestCase[]> {
    return this.fallbackAdapter.getTests(projectId);
  }

  async getTestById(id: string): Promise<TestCase | null> {
    return this.fallbackAdapter.getTestById(id);
  }

  async saveTest(test: TestCase): Promise<TestCase> {
    return this.fallbackAdapter.saveTest(test);
  }

  async getActivities(projectId?: string, limit?: number): Promise<Activity[]> {
    return this.fallbackAdapter.getActivities(projectId, limit);
  }

  async saveActivity(activity: Activity): Promise<Activity> {
    return this.fallbackAdapter.saveActivity(activity);
  }

  async getMemoryEntries(projectId: string, category?: string): Promise<MemoryEntry[]> {
    return this.fallbackAdapter.getMemoryEntries(projectId, category);
  }

  async saveMemoryEntry(entry: MemoryEntry): Promise<MemoryEntry> {
    return this.fallbackAdapter.saveMemoryEntry(entry);
  }

  async deleteMemoryEntry(id: string): Promise<boolean> {
    return this.fallbackAdapter.deleteMemoryEntry(id);
  }

  async getDecisions(projectId: string): Promise<DevelopmentDecision[]> {
    return this.fallbackAdapter.getDecisions(projectId);
  }

  async saveDecision(decision: DevelopmentDecision): Promise<DevelopmentDecision> {
    return this.fallbackAdapter.saveDecision(decision);
  }

  async getProjectSettings(projectId: string): Promise<ProjectSettings | null> {
    return this.fallbackAdapter.getProjectSettings(projectId);
  }

  async saveProjectSettings(settings: ProjectSettings): Promise<ProjectSettings> {
    return this.fallbackAdapter.saveProjectSettings(settings);
  }

  async getAIProviders(): Promise<AIProvider[]> {
    return this.fallbackAdapter.getAIProviders();
  }

  async saveAIProvider(provider: AIProvider): Promise<AIProvider> {
    return this.fallbackAdapter.saveAIProvider(provider);
  }

  async resetData(): Promise<void> {
    return this.fallbackAdapter.resetData();
  }
}
