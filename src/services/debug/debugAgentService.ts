import {
  DebugAnalysis,
  DebugCycle,
  QAIssue,
  QARun,
} from '../../types';
import { qaAgentService } from '../qa/qaAgentService';
import { buildPipelineService } from '../build/buildPipelineService';
import { taskService } from '../taskService';

class DebugAgentService {
  private analyses: Map<string, DebugAnalysis> = new Map();
  private debugCycles: Map<string, DebugCycle> = new Map();
  private listeners: Set<(analyses: DebugAnalysis[]) => void> = new Set();
  private cycleListeners: Set<(cycles: DebugCycle[]) => void> = new Set();

  constructor() {
    this.initSeed();
  }

  private initSeed() {
    // Seed analysis for the creature capture null reference issue
  }

  getAnalyses(projectId?: string): DebugAnalysis[] {
    const list = Array.from(this.analyses.values());
    if (projectId) {
      return list.filter((a) => a.projectId === projectId).sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime());
    }
    return list.sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime());
  }

  getAnalysisById(id: string): DebugAnalysis | undefined {
    return this.analyses.get(id);
  }

  getAnalysisForIssue(issueId: string): DebugAnalysis | undefined {
    return Array.from(this.analyses.values()).find((a) => a.issueId === issueId);
  }

  getCycleForIssue(issueId: string): DebugCycle | undefined {
    return this.debugCycles.get(issueId);
  }

  // --- Generate Root Cause Analysis ---
  async analyzeIssue(issue: QAIssue, qaRun: QARun): Promise<DebugAnalysis> {
    const analysis: DebugAnalysis = {
      id: `dbg-${Date.now()}`,
      issueId: issue.id,
      qaRunId: qaRun.id,
      projectId: issue.projectId,
      title: `Root Cause Analysis for #${issue.issueNumber}: ${issue.title}`,
      likelyCause:
        'In CreatureDatabase.gd, register_capture_event() directly invokes captured_history.append() without initializing the Array when the player starts a fresh session or loads a save without prior captures.',
      evidence: `Runtime error reported at CreatureDatabase.gd:142: "Invalid call to method 'append' on base null instance 'captured_history'". Occurred during register_capture_event("luminafox_01", "tier_1").`,
      affectedFiles: ['src/database/CreatureDatabase.gd'],
      confidence: 'High',
      potentialFixes: [
        '1. Initialize var captured_history: Array[Dictionary] = [] inline at class declaration.',
        '2. Add guard check in register_capture_event: if captured_history == null: captured_history = [].',
        '3. Add save/load deserialization null coalescing fallback.',
      ],
      recommendedAction:
        'Apply fix #2 with null guard and auto-initialization in CreatureDatabase.gd to safely protect against uninitialized arrays across both cold starts and corrupted saves.',
      generatedAt: new Date().toISOString(),
      status: 'PENDING_APPROVAL',
    };

    this.analyses.set(analysis.id, analysis);
    issue.debugAnalysisId = analysis.id;
    this.notifyAnalyses();

    // Initialize or advance debug cycle
    let cycle = this.debugCycles.get(issue.id);
    if (!cycle) {
      cycle = {
        cycleNumber: 1,
        maxCycles: 3,
        issueId: issue.id,
        status: 'IN_PROGRESS',
        attempts: [],
        currentStage: 'AWAITING_APPROVAL',
      };
      this.debugCycles.set(issue.id, cycle);
      this.notifyCycles();
    }

    return analysis;
  }

  // --- Human Operator Approves Fix & Creates Fix Task ---
  async approveFixAndCreateTask(analysisId: string): Promise<{ taskId: string; message: string }> {
    const analysis = this.analyses.get(analysisId);
    if (!analysis) throw new Error('Analysis not found');

    analysis.status = 'APPROVED';
    this.notifyAnalyses();

    const issue = qaAgentService.getIssueById(analysis.issueId);
    if (issue) {
      issue.status = 'FIXING';
      qaAgentService.updateIssueStatus(issue.id, 'FIXING');
    }

    const cycle = this.debugCycles.get(analysis.issueId);
    if (cycle) {
      cycle.currentStage = 'CODING_FIX';
      this.notifyCycles();
    }

    // Create formal task in project task list
    const fixTask = await taskService.createTask({
      projectId: analysis.projectId,
      title: `[BUG FIX] Fix null reference in CreatureDatabase.gd:142`,
      description: `Resolve crash during creature capture: Initialize captured_history array and add null safety guard in register_capture_event(). Evidence: ${analysis.evidence}. Recommended action: ${analysis.recommendedAction}\nTarget Files: ${analysis.affectedFiles.join(', ')}`,
      priority: 'Critical',
      tags: ['Bug Fix', 'QA Issue', 'CreatureDatabase', 'Phase 5'],
    });

    if (issue) {
      issue.linkedFixTaskId = fixTask.id;
    }

    return {
      taskId: fixTask.id,
      message: 'Fix task created and queued for Coding Agent execution.',
    };
  }

  // --- Execute Automated Fix, Rebuild, and Retest Loop ---
  async executeFixAndRetest(
    issueId: string,
    onStepUpdate?: (step: string) => void
  ): Promise<{ success: boolean; qaRun: QARun; message: string }> {
    const issue = qaAgentService.getIssueById(issueId);
    if (!issue) throw new Error('Issue not found');

    const cycle = this.debugCycles.get(issueId) || {
      cycleNumber: 1,
      maxCycles: 3,
      issueId,
      status: 'IN_PROGRESS',
      attempts: [],
      currentStage: 'CODING_FIX',
    };

    if (cycle.cycleNumber > cycle.maxCycles) {
      cycle.status = 'LIMIT_REACHED';
      this.notifyCycles();
      return {
        success: false,
        qaRun: null as any,
        message: 'Maximum automated debugging cycles reached (3/3). Human review required.',
      };
    }

    onStepUpdate?.('Step 1/3: Coding Agent applying approved fix to CreatureDatabase.gd...');
    cycle.currentStage = 'CODING_FIX';
    this.notifyCycles();
    await new Promise((resolve) => setTimeout(resolve, 600));

    onStepUpdate?.('Step 2/3: Triggering automated rebuild with fixed bytecode...');
    cycle.currentStage = 'REBUILDING';
    this.notifyCycles();

    // Rebuild project
    const newBuild = await buildPipelineService.queueBuild(
      issue.projectId,
      undefined,
      issue.linkedFixTaskId,
      'task/142-fix-creature-db'
    );

    // Wait for build to complete
    await new Promise((resolve) => setTimeout(resolve, 2500));

    onStepUpdate?.('Step 3/3: Running automated QA verification suite on new build...');
    cycle.currentStage = 'RETESTING';
    this.notifyCycles();

    // Re-run QA with isAfterFix = true
    const retestRun = await qaAgentService.runAutomatedQA(issue.projectId, newBuild, null, true);

    const isResolved = retestRun.status === 'PASS';

    cycle.attempts.push({
      cycle: cycle.cycleNumber,
      buildId: newBuild.id,
      fixApplied: 'Initialized captured_history array with null guard in CreatureDatabase.gd',
      qaStatus: retestRun.status,
      timestamp: new Date().toISOString(),
    });

    if (isResolved) {
      cycle.currentStage = 'RESOLVED';
      cycle.status = 'COMPLETED';
      qaAgentService.updateIssueStatus(issue.id, 'RESOLVED');
      if (issue.debugAnalysisId) {
        const analysis = this.analyses.get(issue.debugAnalysisId);
        if (analysis) analysis.status = 'APPLIED';
      }
    } else {
      cycle.cycleNumber++;
      if (cycle.cycleNumber > cycle.maxCycles) {
        cycle.status = 'LIMIT_REACHED';
      } else {
        cycle.currentStage = 'BUG_DETECTED';
      }
    }

    this.notifyCycles();

    return {
      success: isResolved,
      qaRun: retestRun,
      message: isResolved
        ? 'QA tests passed successfully! Bug verified resolved.'
        : 'Regression still present. Further debugging required.',
    };
  }

  // --- Subscriptions ---
  subscribeAnalyses(listener: (analyses: DebugAnalysis[]) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  subscribeCycles(listener: (cycles: DebugCycle[]) => void): () => void {
    this.cycleListeners.add(listener);
    return () => this.cycleListeners.delete(listener);
  }

  private notifyAnalyses() {
    const all = this.getAnalyses();
    this.listeners.forEach((l) => l(all));
  }

  private notifyCycles() {
    const all = Array.from(this.debugCycles.values());
    this.cycleListeners.forEach((l) => l(all));
  }
}

export const debugAgentService = new DebugAgentService();
