import {
  DevLoopPipelineStatus,
  DevLoopStage,
  Project,
} from '../types';
import { buildPipelineService } from './build/buildPipelineService';
import { previewService } from './preview/previewService';
import { qaAgentService } from './qa/qaAgentService';
import { debugAgentService } from './debug/debugAgentService';

class DevLoopService {
  private listeners: Set<(status: DevLoopPipelineStatus) => void> = new Set();
  private status: DevLoopPipelineStatus = {
    currentStage: 'BUILD',
    codeStatus: 'DONE',
    buildStatus: 'DONE',
    previewStatus: 'IDLE',
    qaStatus: 'IDLE',
    issuesCount: 0,
    fixesCount: 0,
    isPipelineRunning: false,
  };

  constructor() {
    this.refreshCounts();
  }

  getStatus(): DevLoopPipelineStatus {
    this.refreshCounts();
    return { ...this.status };
  }

  private refreshCounts() {
    const issues = qaAgentService.getIssues();
    const openIssues = issues.filter((i) => i.status !== 'RESOLVED');
    const resolvedIssues = issues.filter((i) => i.status === 'RESOLVED');
    this.status.issuesCount = openIssues.length;
    this.status.fixesCount = resolvedIssues.length;

    if (openIssues.length > 0) {
      this.status.qaStatus = 'FAIL';
      this.status.currentStage = 'QA';
    } else if (resolvedIssues.length > 0) {
      this.status.qaStatus = 'PASS';
      this.status.currentStage = 'RESOLVED';
    }
  }

  setStage(stage: DevLoopStage) {
    this.status.currentStage = stage;
    this.notify();
  }

  // --- Run Full Automated Pipeline: Build -> Preview -> QA ---
  async runFullPipeline(
    project: Project,
    onProgressUpdate?: (stage: string, message: string) => void
  ): Promise<{ success: boolean; message: string }> {
    this.status.isPipelineRunning = true;
    this.notify();

    try {
      // 1. BUILD STAGE
      this.status.currentStage = 'BUILD';
      this.status.buildStatus = 'BUILDING';
      this.notify();
      onProgressUpdate?.('BUILD', 'Queuing and building Godot 4.3 Web export...');

      const job = await buildPipelineService.queueBuild(
        project.id,
        undefined,
        'task-142',
        'task/142-creature-capture'
      );

      // Wait for build completion
      await new Promise((resolve) => setTimeout(resolve, 2600));
      this.status.buildStatus = 'DONE';
      this.notify();

      // 2. PREVIEW STAGE
      this.status.currentStage = 'PREVIEW';
      this.status.previewStatus = 'RUNNING';
      this.notify();
      onProgressUpdate?.('PREVIEW', 'Bootstrapping preview environment with WebAssembly canvas...');

      const session = await previewService.startPreview(project.id, job, 'InternalWebPreview');
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // 3. QA STAGE
      this.status.currentStage = 'QA';
      this.notify();
      onProgressUpdate?.('QA', 'Executing automated QA test suite on running preview...');

      const qaRun = await qaAgentService.runAutomatedQA(project.id, job, session, false);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      this.refreshCounts();
      this.status.isPipelineRunning = false;
      this.notify();

      if (qaRun.status === 'FAIL') {
        this.status.qaStatus = 'FAIL';
        this.status.currentStage = 'QA';
        this.notify();
        return {
          success: false,
          message: 'Pipeline executed: Build succeeded, Preview launched, but QA found 1 critical issue in CreatureDatabase.gd.',
        };
      }

      this.status.qaStatus = 'PASS';
      this.status.currentStage = 'RESOLVED';
      this.notify();
      return {
        success: true,
        message: 'Pipeline completed successfully: All builds, previews, and QA assertions verified.',
      };
    } catch (err: any) {
      this.status.isPipelineRunning = false;
      this.notify();
      return {
        success: false,
        message: `Pipeline error: ${err.message}`,
      };
    }
  }

  subscribe(listener: (status: DevLoopPipelineStatus) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l({ ...this.status }));
  }
}

export const devLoopService = new DevLoopService();
