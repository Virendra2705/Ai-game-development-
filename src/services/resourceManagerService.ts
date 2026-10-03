export interface ResourceUsageMetrics {
  activeAgents: number;
  maxConcurrentAgents: number;
  activeBuildWorkers: number;
  maxBuildWorkers: number;
  activeQAWorkers: number;
  maxQAWorkers: number;
  activeAssetJobs: number;
  maxAssetJobs: number;
  currentMemoryMB: number;
  storageUsageMB: number;
  activeTokensCount: number;
  providerRateLimitRemaining: number;
}

class ResourceManagerService {
  private activeAgentsCount = 0;
  private maxConcurrentAgents = 4;
  private activeBuildWorkers = 0;
  private maxBuildWorkers = 2;
  private activeQAWorkers = 0;
  private maxQAWorkers = 2;
  private activeAssetJobs = 0;
  private maxAssetJobs = 2;

  getResourceUsage(): ResourceUsageMetrics {
    return {
      activeAgents: this.activeAgentsCount,
      maxConcurrentAgents: this.maxConcurrentAgents,
      activeBuildWorkers: this.activeBuildWorkers,
      maxBuildWorkers: this.maxBuildWorkers,
      activeQAWorkers: this.activeQAWorkers,
      maxQAWorkers: this.maxQAWorkers,
      activeAssetJobs: this.activeAssetJobs,
      maxAssetJobs: this.maxAssetJobs,
      currentMemoryMB: 284,
      storageUsageMB: 1420,
      activeTokensCount: 42350,
      providerRateLimitRemaining: 94,
    };
  }

  canAcquireAgentWorker(): boolean {
    return this.activeAgentsCount < this.maxConcurrentAgents;
  }

  acquireAgentWorker(): boolean {
    if (this.canAcquireAgentWorker()) {
      this.activeAgentsCount++;
      return true;
    }
    return false;
  }

  releaseAgentWorker(): void {
    if (this.activeAgentsCount > 0) {
      this.activeAgentsCount--;
    }
  }

  canAcquireBuildWorker(): boolean {
    return this.activeBuildWorkers < this.maxBuildWorkers;
  }

  acquireBuildWorker(): boolean {
    if (this.canAcquireBuildWorker()) {
      this.activeBuildWorkers++;
      return true;
    }
    return false;
  }

  releaseBuildWorker(): void {
    if (this.activeBuildWorkers > 0) {
      this.activeBuildWorkers--;
    }
  }

  canAcquireQAWorker(): boolean {
    return this.activeQAWorkers < this.maxQAWorkers;
  }

  acquireQAWorker(): boolean {
    if (this.canAcquireQAWorker()) {
      this.activeQAWorkers++;
      return true;
    }
    return false;
  }

  releaseQAWorker(): void {
    if (this.activeQAWorkers > 0) {
      this.activeQAWorkers--;
    }
  }

  setLimits(limits: { maxAgents?: number; maxBuilds?: number; maxQA?: number }): void {
    if (limits.maxAgents) this.maxConcurrentAgents = limits.maxAgents;
    if (limits.maxBuilds) this.maxBuildWorkers = limits.maxBuilds;
    if (limits.maxQA) this.maxQAWorkers = limits.maxQA;
  }
}

export const resourceManagerService = new ResourceManagerService();
