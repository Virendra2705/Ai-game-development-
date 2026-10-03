import { getDatabaseAdapter } from '../adapters';
import {
  Project,
  ProjectPhase,
  ProjectSettings,
  EngineType,
  PlatformType,
  DevMode,
  Agent,
} from '../types';
import { activityService } from './activityService';
import { INITIAL_AGENTS } from '../data/mockData';

export const PROJECT_PHASES: ProjectPhase[] = [
  '1. PROJECT_SETUP',
  '2. GAME_DESIGN',
  '3. CORE_SYSTEMS',
  '4. GAMEPLAY',
  '5. WORLD_BUILDING',
  '6. CONTENT',
  '7. UI',
  '8. TESTING',
  '9. OPTIMIZATION',
  '10. RELEASE',
];

export class ProjectService {
  private adapter = getDatabaseAdapter();

  async getProjects(): Promise<Project[]> {
    return this.adapter.getProjects();
  }

  async getProjectById(id: string): Promise<Project | null> {
    return this.adapter.getProjectById(id);
  }

  /**
   * Section 19: Full Project Creation Flow
   * When a project is created, initialize:
   * 1. Project record with initial phase and onboarding flag
   * 2. Default project settings
   * 3. Default AI agents associated with this project
   * 4. Initial structured memory records
   * 5. Initial activity event
   */
  async createProject(params: {
    name: string;
    description: string;
    genre: string;
    engine: EngineType;
    platform?: PlatformType;
    devMode?: DevMode;
  }): Promise<Project> {
    const slug = params.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const projectId = `proj-${slug || Date.now()}`;

    const newProject: Project = {
      id: projectId,
      name: params.name,
      slug,
      description: params.description,
      genre: params.genre,
      engine: params.engine,
      platforms: params.platform ? [params.platform] : ['PC', 'Android'],
      platform: params.platform || 'Cross Platform',
      status: 'Development',
      progress: 5,
      currentPhase: '1. PROJECT_SETUP',
      phaseProgress: 20,
      thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastUpdated: 'Just created',
      ownerId: 'user-lead-producer',
      devMode: params.devMode || 'Human-in-the-Loop',
      resolution: '1920x1080 (16:9)',
      isOnboarding: true, // Triggers Section 20 Onboarding Guide
    };

    // 1. Save Project
    const savedProject = await this.adapter.saveProject(newProject);

    // 2. Initialize Project Settings
    const settings: ProjectSettings = {
      projectId,
      targetEngine: params.engine,
      resolution: '1920x1080 (16:9)',
      devMode: params.devMode || 'Human-in-the-Loop',
      autoBuildOnTaskComplete: false,
      requireTestPassForMerge: true,
      gitIntegrationEnabled: true,
      defaultAgentProvider: 'Gemini',
    };
    await this.adapter.saveProjectSettings(settings);

    // 3. Initialize Default AI Agents for the Project
    for (const agentTemplate of INITIAL_AGENTS) {
      const projectAgent: Agent = {
        ...agentTemplate,
        id: `${agentTemplate.id}-${projectId}`,
        projectId,
        status: 'READY',
        createdAt: new Date().toISOString(),
      };
      await this.adapter.saveAgent(projectAgent);
    }

    // 4. Initialize Initial Structured Memory
    await this.adapter.saveMemoryEntry({
      id: `mem-vision-${projectId}`,
      projectId,
      category: 'GAME_VISION',
      title: `${params.name} Vision & Core Pillars`,
      content: params.description,
      tags: ['Vision', params.genre],
      authorAgent: 'Game Architect',
      updatedAt: new Date().toISOString(),
      version: 1,
    });

    await this.adapter.saveMemoryEntry({
      id: `mem-arch-${projectId}`,
      projectId,
      category: 'TECHNICAL_ARCHITECTURE',
      title: `${params.engine} Technical Stack`,
      content: `Target engine: ${params.engine}. Primary platform: ${params.platform || 'Cross Platform'}. Architecture decoupled into component nodes with state-machine isolation.`,
      tags: ['Architecture', params.engine],
      authorAgent: 'Game Architect',
      updatedAt: new Date().toISOString(),
      version: 1,
    });

    // 5. Initial Activity Event
    await activityService.logActivity(
      'PROJECT_CREATED',
      'Lead Producer',
      `Initialized project: "${newProject.name}" with ${params.engine} engine`,
      projectId
    );

    return savedProject;
  }

  async updateProject(project: Project): Promise<Project> {
    return this.adapter.saveProject(project);
  }

  async advanceProjectPhase(projectId: string, nextPhase: ProjectPhase): Promise<Project | null> {
    const project = await this.adapter.getProjectById(projectId);
    if (!project) return null;

    project.currentPhase = nextPhase;
    project.phaseProgress = 10;
    project.updatedAt = new Date().toISOString();

    const saved = await this.adapter.saveProject(project);
    await activityService.logActivity(
      'SYSTEM_EVENT',
      'Game Architect',
      `Advanced project phase to: ${nextPhase}`,
      projectId
    );
    return saved;
  }

  async completeOnboarding(projectId: string): Promise<Project | null> {
    const project = await this.adapter.getProjectById(projectId);
    if (!project) return null;

    project.isOnboarding = false;
    project.currentPhase = '2. GAME_DESIGN';
    project.phaseProgress = 25;
    project.progress = 15;
    project.updatedAt = new Date().toISOString();

    const saved = await this.adapter.saveProject(project);
    await activityService.logActivity(
      'SYSTEM_EVENT',
      'Game Architect',
      `Completed initial project setup for "${project.name}"`,
      projectId
    );
    return saved;
  }

  async deleteProject(id: string): Promise<boolean> {
    return this.adapter.deleteProject(id);
  }
}

export const projectService = new ProjectService();
