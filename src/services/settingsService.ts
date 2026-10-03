import { getDatabaseAdapter } from '../adapters';
import { ProjectSettings, AIProvider } from '../types';

export class SettingsService {
  private adapter = getDatabaseAdapter();

  async getProjectSettings(projectId: string): Promise<ProjectSettings> {
    const existing = await this.adapter.getProjectSettings(projectId);
    if (existing) return existing;

    const defaultSettings: ProjectSettings = {
      projectId,
      targetEngine: 'Godot',
      resolution: '1920x1080 (16:9)',
      devMode: 'Human-in-the-Loop',
      autoBuildOnTaskComplete: false,
      requireTestPassForMerge: true,
      gitIntegrationEnabled: true,
      defaultAgentProvider: 'Gemini',
    };
    await this.adapter.saveProjectSettings(defaultSettings);
    return defaultSettings;
  }

  async updateProjectSettings(settings: ProjectSettings): Promise<ProjectSettings> {
    return this.adapter.saveProjectSettings(settings);
  }

  async getAIProviders(): Promise<AIProvider[]> {
    return this.adapter.getAIProviders();
  }

  async toggleAIProvider(providerId: string): Promise<AIProvider[]> {
    const providers = await this.getAIProviders();
    const target = providers.find((p) => p.id === providerId);
    if (target) {
      target.status = target.status === 'Connected' ? 'Not Connected' : 'Connected';
      await this.adapter.saveAIProvider(target);
    }
    return providers;
  }
}

export const settingsService = new SettingsService();
