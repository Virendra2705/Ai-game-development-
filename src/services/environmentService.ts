import { Environment, EnvironmentType } from '../types';

export class EnvironmentService {
  private environments: Map<string, Environment[]> = new Map();

  constructor() {
    this.seedDefaultEnvironments('proj-embervale');
    this.seedDefaultEnvironments('proj-survival');
    this.seedDefaultEnvironments('proj-merge');
  }

  private seedDefaultEnvironments(projectId: string) {
    const isEmbervale = projectId === 'proj-embervale';
    const envs: Environment[] = [
      {
        id: `env-${projectId}-local`,
        projectId,
        name: 'Local Developer Sandbox',
        type: 'LOCAL',
        status: 'ACTIVE',
        platform: isEmbervale ? 'PC' : 'Web',
        buildConfiguration: 'Debug (Symbols Included, No Strip, Localhost Mock APIs)',
        deploymentProvider: 'None',
        deploymentTarget: 'http://localhost:3000',
        configurationVersion: 'v1.4.0-local',
        createdAt: '2026-08-15T08:00:00Z',
        updatedAt: '2026-09-20T10:00:00Z',
      },
      {
        id: `env-${projectId}-dev`,
        projectId,
        name: 'Internal Dev Cluster',
        type: 'DEVELOPMENT',
        status: 'ACTIVE',
        platform: isEmbervale ? 'Android' : 'Web',
        buildConfiguration: 'Development (Profiling Hooks, Diagnostic Telemetry)',
        deploymentProvider: isEmbervale ? 'AndroidDistributionProvider' : 'WebDeploymentProvider',
        deploymentTarget: isEmbervale ? 'Firebase App Distribution (Alpha Track)' : 'https://dev-preview.embervale.internal',
        configurationVersion: 'v1.4.2-dev',
        createdAt: '2026-08-18T12:00:00Z',
        updatedAt: '2026-09-21T02:30:00Z',
      },
      {
        id: `env-${projectId}-staging`,
        projectId,
        name: 'Staging & Pre-Release QA',
        type: 'STAGING',
        status: 'ACTIVE',
        platform: isEmbervale ? 'Android' : 'Web',
        buildConfiguration: 'Release-Candidate (Stripped Symbols, Signed APK/AAB, Isolated Staging DB)',
        deploymentProvider: isEmbervale ? 'AndroidDistributionProvider' : 'WebDeploymentProvider',
        deploymentTarget: isEmbervale ? 'Google Play Internal Testing (Track QA)' : 'https://staging.embervale.game',
        configurationVersion: 'v1.5.0-rc',
        createdAt: '2026-09-01T09:00:00Z',
        updatedAt: '2026-09-21T07:15:00Z',
      },
      {
        id: `env-${projectId}-prod`,
        projectId,
        name: 'Production Live Fleet',
        type: 'PRODUCTION',
        status: 'ACTIVE',
        platform: isEmbervale ? 'Android' : 'Web',
        buildConfiguration: 'Production Release (O3 Optimization, ProGuard/R8, Edge CDN)',
        deploymentProvider: isEmbervale ? 'AndroidDistributionProvider' : 'WebDeploymentProvider',
        deploymentTarget: isEmbervale ? 'Google Play Store Production Track' : 'https://play.embervale.com',
        configurationVersion: 'v1.0.0-live',
        createdAt: '2026-09-10T14:00:00Z',
        updatedAt: '2026-09-21T08:00:00Z',
      },
    ];

    this.environments.set(projectId, envs);
  }

  getEnvironments(projectId: string): Environment[] {
    if (!this.environments.has(projectId)) {
      this.seedDefaultEnvironments(projectId);
    }
    return this.environments.get(projectId) || [];
  }

  getEnvironment(projectId: string, envId: string): Environment | undefined {
    return this.getEnvironments(projectId).find((e) => e.id === envId);
  }

  getEnvironmentByType(projectId: string, type: EnvironmentType): Environment | undefined {
    return this.getEnvironments(projectId).find((e) => e.type === type);
  }

  updateEnvironment(projectId: string, updated: Environment): Environment {
    const list = this.getEnvironments(projectId);
    const index = list.findIndex((e) => e.id === updated.id);
    if (index >= 0) {
      list[index] = { ...updated, updatedAt: new Date().toISOString() };
    } else {
      list.push(updated);
    }
    this.environments.set(projectId, list);
    return updated;
  }
}

export const environmentService = new EnvironmentService();
