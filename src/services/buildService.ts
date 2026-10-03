import { getDatabaseAdapter } from '../adapters';
import { Build, BuildStatus } from '../types';
import { activityService } from './activityService';

export class BuildService {
  private adapter = getDatabaseAdapter();

  async getBuilds(projectId?: string): Promise<Build[]> {
    return this.adapter.getBuilds(projectId);
  }

  async getBuildById(id: string): Promise<Build | null> {
    return this.adapter.getBuildById(id);
  }

  async triggerBuild(
    projectId: string,
    version: string = 'v0.4.3',
    branch: string = 'main'
  ): Promise<Build> {
    const existing = await this.getBuilds(projectId);
    const buildNumber = existing.length + 1;

    const newBuild: Build = {
      id: `build-${Date.now()}`,
      projectId,
      version: `${version}-dev.${buildNumber}`,
      buildNumber,
      status: 'BUILDING',
      branch,
      commit: Math.random().toString(36).substring(2, 9),
      commitMsg: 'Triggered from Autonomous Pipeline',
      startedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      duration: '45s',
      testsPassed: 30,
      testsFailed: 0,
      platform: 'Cross Platform (PC + Android)',
      logs: [
        'Fetching submodules and asset bundles...',
        'Running static asset linter and texture mipmap generator...',
        'Packaging Godot/Unity export template for Android arm64...',
        'Building shader precache pipeline...',
        'Build artifacts generated successfully in dist/bin.',
      ],
      checks: [
        { name: 'GDScript Compiler', passed: true, duration: '4.2s' },
        { name: 'Asset Texture Atlases', passed: true, duration: '12.1s' },
        { name: 'Unit Physics Sanity Test', passed: true, duration: '6.4s' },
        { name: 'Package Signature Check', passed: true, duration: '1.8s' },
      ],
    };

    await this.adapter.saveBuild(newBuild);
    await activityService.logActivity(
      'BUILD_STARTED',
      'Continuous Integration',
      `Triggered build #${newBuild.buildNumber} (${newBuild.version}) on ${branch}`,
      projectId,
      { buildId: newBuild.id }
    );

    // Simulate async build completion
    setTimeout(async () => {
      newBuild.status = 'SUCCESS';
      newBuild.completedAt = new Date().toISOString();
      await this.adapter.saveBuild(newBuild);
      await activityService.logActivity(
        'BUILD_COMPLETED',
        'Continuous Integration',
        `Build #${newBuild.buildNumber} (${newBuild.version}) completed successfully. All checks passed.`,
        projectId,
        { buildId: newBuild.id }
      );
    }, 2500);

    return newBuild;
  }
}

export const buildService = new BuildService();
