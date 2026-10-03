import {
  AutonomousRun,
  AutonomousMode,
  AutonomousSafetyPolicy,
  AutonomousRunReport,
  FailureLearning,
  RunTimelineEvent,
  RunIteration,
} from '../types';
import { goalMilestoneService } from './goalMilestoneService';
import { approvalService } from './approvalService';
import { regressionService } from './regressionService';
import { gameplayTestAgent } from './gameplayTestAgent';
import { improvementAgentService } from './improvementAgentService';
import { developmentDecisionEngine } from './developmentDecisionEngine';
import { activityService } from './activityService';

class AutonomousDevelopmentService {
  private runs: Map<string, AutonomousRun[]> = new Map();
  private reports: Map<string, AutonomousRunReport> = new Map();
  private failureLearnings: Map<string, FailureLearning[]> = new Map();
  private safetyPolicies: Map<string, AutonomousSafetyPolicy> = new Map();

  constructor() {
    // Default Safety Policy for Embervale
    this.safetyPolicies.set('proj-embervale', {
      projectId: 'proj-embervale',
      maxRuntimeMinutes: 60,
      maxIterations: 15,
      maxRetries: 3,
      maxConcurrentAgents: 4,
      maxBuilds: 10,
      allowedAgentTypes: [
        'Master Orchestrator',
        'Lead Game Designer',
        'Lead Engine Programmer',
        'Pixel Artist Agent',
        'Audio Agent',
        'QA Agent',
        'AI Debug Agent',
        'Improvement Agent',
      ],
      allowedProjectDirectories: ['src/game', 'src/data', 'src/assets', 'src/tests'],
      allowedCommandClasses: ['lint', 'test', 'build', 'typecheck', 'format'],
      autoBuild: true,
      autoQA: true,
      autoDebug: true,
      autoFix: true,
      requireApprovalForArchitecture: true,
      requireApprovalForScope: true,
      requireApprovalForProvider: true,
    });

    // Seed Embervale Autonomous Run: "Make the Sparkit capture feature fully playable"
    const embervaleRun: AutonomousRun = {
      id: 'run-sparkit-capture-01',
      projectId: 'proj-embervale',
      goal: 'Make the Sparkit capture feature fully playable.',
      goalId: 'goal-sparkit-capture',
      mode: 'SUPERVISED_AUTONOMOUS',
      maxIterations: 12,
      currentIteration: 4,
      maxRuntime: 45,
      elapsedSeconds: 1420,
      budgetLimit: 10.0,
      budgetUsed: 2.85,
      scope: [
        'Sparkit Encounter & Wild AI',
        'Capture Rate Math & Curve',
        'Rift Trap Throw & Lock Animation',
        'VFX Energy Rings & SFX Clamp',
        'Party Roster Transfer & Save Slot',
      ],
      allowedAgents: [
        'Master Orchestrator',
        'Lead Game Designer',
        'Lead Engine Programmer',
        'Pixel Artist Agent',
        'Audio Agent',
        'QA Agent',
        'AI Debug Agent',
      ],
      allowedTools: ['Code Editor', 'Asset Generator', 'Build Runner', 'QA Simulator', 'Knowledge Graph'],
      stopConditions: [
        'High-impact Architecture Refactor (Creature State Machine)',
        'Scope expansion beyond Route 1 encounter',
        '3 consecutive failed debug cycles',
        'Budget exceeds $10.00',
        'Runtime exceeds 45 minutes',
      ],
      qualityThreshold: 90,
      autoFixEnabled: true,
      autoBuildEnabled: true,
      autoQAEnabled: true,
      startedAt: new Date(Date.now() - 1420000).toISOString(),
      status: 'WAITING_HUMAN',
      currentAgent: 'Lead Engine Programmer',
      currentTask: 'Refactor Creature State Machine for Dynamic Capture Interrupts',
      currentMilestoneId: 'ms-trap-vfx',
      timeline: [
        {
          id: 'tl-1',
          timestamp: new Date(Date.now() - 1400000).toISOString(),
          title: 'Goal Ingestion & Milestone Graph Created',
          description: 'Master Orchestrator decomposed goal into 6 sequential milestones with strict quality gates.',
          stage: 'PLANNING',
          actor: 'Master Orchestrator',
          severity: 'INFO',
        },
        {
          id: 'tl-2',
          timestamp: new Date(Date.now() - 1100000).toISOString(),
          title: 'Milestone 1 Completed: Specs Verified',
          description: 'Creature stats (Sparkit HP:45, Spd:65) and capture formula verified against GDD.',
          stage: 'AGENT EXECUTION',
          actor: 'Lead Game Designer',
          severity: 'SUCCESS',
        },
        {
          id: 'tl-3',
          timestamp: new Date(Date.now() - 850000).toISOString(),
          title: 'Milestone 2 Completed: Sprites & SFX Validated',
          description: 'Sparkit 32x32 spritesheet and Rift Trap audio assets generated and passed palette check.',
          stage: 'ASSET GENERATION',
          actor: 'Pixel Artist Agent',
          severity: 'SUCCESS',
        },
        {
          id: 'tl-4',
          timestamp: new Date(Date.now() - 500000).toISOString(),
          title: 'Milestone 3 Completed: Capture Formula & Logic',
          description: 'Engine controller wired with status multipliers and inventory trap count deductions.',
          stage: 'CODE IMPLEMENTATION',
          actor: 'Lead Engine Programmer',
          severity: 'SUCCESS',
        },
        {
          id: 'tl-5',
          timestamp: new Date(Date.now() - 250000).toISOString(),
          title: 'Build Succeeded & QA Playtest Run',
          description: 'Build #104 passed. Interactive gameplay test executed. Visual glitch detected in state sync.',
          stage: 'QA & TESTING',
          actor: 'QA Agent',
          severity: 'WARNING',
        },
        {
          id: 'tl-6',
          timestamp: new Date(Date.now() - 60000).toISOString(),
          title: 'Autonomous Run Paused: High-Impact Architecture Approval Needed',
          description: 'Creature State Machine refactor requires human approval to ensure battle system stability.',
          stage: 'HUMAN APPROVAL GATE',
          actor: 'Development Decision Engine',
          severity: 'WARNING',
        },
      ],
      iterations: [
        {
          iterationNumber: 1,
          startedAt: new Date(Date.now() - 1400000).toISOString(),
          completedAt: new Date(Date.now() - 1100000).toISOString(),
          agentName: 'Lead Game Designer',
          taskTitle: 'Sparkit Base Stats & Capture Formula Curve',
          status: 'SUCCESS',
          buildStatus: 'SUCCESS',
          qaStatus: 'PASS',
          notes: 'Specification recorded into Project Memory.',
        },
        {
          iterationNumber: 2,
          startedAt: new Date(Date.now() - 1100000).toISOString(),
          completedAt: new Date(Date.now() - 850000).toISOString(),
          agentName: 'Pixel Artist Agent',
          taskTitle: 'Generate Sparkit Sprite Sheet & Trap VFX Assets',
          status: 'SUCCESS',
          buildStatus: 'SUCCESS',
          qaStatus: 'PASS',
          notes: 'Validated against 16-bit palette guidelines.',
        },
        {
          iterationNumber: 3,
          startedAt: new Date(Date.now() - 850000).toISOString(),
          completedAt: new Date(Date.now() - 500000).toISOString(),
          agentName: 'Lead Engine Programmer',
          taskTitle: 'Implement CaptureController.ts and RNG roll',
          status: 'SUCCESS',
          buildStatus: 'SUCCESS',
          qaStatus: 'PASS',
          notes: 'Logic and unit tests passed in 42ms.',
        },
        {
          iterationNumber: 4,
          startedAt: new Date(Date.now() - 500000).toISOString(),
          agentName: 'Lead Engine Programmer',
          taskTitle: 'Refactor Creature State Machine for Dynamic Capture Interrupts',
          status: 'BLOCKED',
          buildStatus: 'SUCCESS',
          qaStatus: 'PASS_WITH_WARNINGS',
          notes: 'Paused at iteration 4 awaiting human architectural approval.',
        },
      ],
      pauseReason: {
        reason: 'Human approval required.',
        requestedAction: 'Refactor CreatureStateMachine to introduce INTERRUPT_CAPTURE state.',
        risk: 'HIGH',
        recommendedDecision: 'Approve refactor. Proposed design follows verified GDD State Transition specs.',
        approvalId: 'appr-arch-combat-sync',
      },
      consecutiveFailures: 0,
      totalBuildAttempts: 4,
      totalDebugCycles: 1,
    };

    this.runs.set('proj-embervale', [embervaleRun]);

    // Initial Failure Learning record
    this.failureLearnings.set('proj-embervale', [
      {
        id: 'fl-sparkit-cast-glitch',
        projectId: 'proj-embervale',
        runId: 'run-sparkit-capture-01',
        issueSummary: 'Creature continues attack cast animation during trap containment',
        whatHappened: 'In QA test, Sparkit fired Spark Orb while enclosed in Rift Trap mesh.',
        whyItFailed: 'CombatEngine tick loop was not listening to capture state machine hold signal.',
        whatWasAttempted: 'Tried checking isCaptured boolean flag inside spell render loop.',
        whatShouldNotBeRepeated: 'Do not poll boolean flags in render loops; use explicit state transitions.',
        whatWorked: 'Event-driven interrupt state machine.',
        relevantLogs: ['CombatEngine: tick 482 -> creature state=CASTING, trap state=CAPTURING'],
        relatedFiles: ['src/game/CombatEngine.ts', 'src/game/CreatureStateMachine.ts'],
        relatedAgents: ['AI Debug Agent', 'Lead Engine Programmer'],
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
    ]);
  }

  async getRuns(projectId: string): Promise<AutonomousRun[]> {
    return this.runs.get(projectId) || [];
  }

  async getActiveRun(projectId: string): Promise<AutonomousRun | null> {
    const list = await this.getRuns(projectId);
    return list.find((r) => r.status === 'RUNNING' || r.status === 'WAITING_HUMAN' || r.status === 'ITERATING') || null;
  }

  async getSafetyPolicy(projectId: string): Promise<AutonomousSafetyPolicy> {
    return (
      this.safetyPolicies.get(projectId) || {
        projectId,
        maxRuntimeMinutes: 60,
        maxIterations: 15,
        maxRetries: 3,
        maxConcurrentAgents: 4,
        maxBuilds: 10,
        allowedAgentTypes: ['Master Orchestrator', 'Lead Engine Programmer', 'QA Agent'],
        allowedProjectDirectories: ['src'],
        allowedCommandClasses: ['test', 'build', 'lint'],
        autoBuild: true,
        autoQA: true,
        autoDebug: true,
        autoFix: true,
        requireApprovalForArchitecture: true,
        requireApprovalForScope: true,
        requireApprovalForProvider: true,
      }
    );
  }

  async updateSafetyPolicy(projectId: string, policy: Partial<AutonomousSafetyPolicy>): Promise<AutonomousSafetyPolicy> {
    const current = await this.getSafetyPolicy(projectId);
    const updated = { ...current, ...policy };
    this.safetyPolicies.set(projectId, updated);
    return updated;
  }

  async getFailureLearnings(projectId: string): Promise<FailureLearning[]> {
    return this.failureLearnings.get(projectId) || [];
  }

  async startRun(
    projectId: string,
    goal: string,
    mode: AutonomousMode,
    maxIterations = 10,
    maxRuntime = 60,
    budgetLimit = 10.0
  ): Promise<AutonomousRun> {
    const runId = `run-${Date.now()}`;
    const newRun: AutonomousRun = {
      id: runId,
      projectId,
      goal,
      mode,
      maxIterations,
      currentIteration: 0,
      maxRuntime,
      elapsedSeconds: 0,
      budgetLimit,
      budgetUsed: 0.15,
      scope: ['Target Feature Logic', 'Asset Integration', 'Unit & Regression Tests'],
      allowedAgents: [
        'Master Orchestrator',
        'Lead Game Designer',
        'Lead Engine Programmer',
        'QA Agent',
        'AI Debug Agent',
      ],
      allowedTools: ['Code Editor', 'Build Runner', 'QA Simulator', 'Knowledge Graph'],
      stopConditions: [
        'Budget limit reached',
        'Runtime limit reached',
        '3 consecutive failed debug cycles',
        'High-impact human approval gate',
      ],
      qualityThreshold: 90,
      autoFixEnabled: true,
      autoBuildEnabled: true,
      autoQAEnabled: true,
      startedAt: new Date().toISOString(),
      status: 'PLANNING',
      currentAgent: 'Master Orchestrator',
      currentTask: 'Decomposing goal into Milestone Task Graph',
      timeline: [
        {
          id: `tl-${Date.now()}`,
          timestamp: new Date().toISOString(),
          title: 'Autonomous Run Initialized',
          description: `Goal: "${goal}" launched in ${mode} mode.`,
          stage: 'PLANNING',
          actor: 'Master Orchestrator',
          severity: 'INFO',
        },
      ],
      iterations: [],
      consecutiveFailures: 0,
      totalBuildAttempts: 0,
      totalDebugCycles: 0,
    };

    const list = await this.getRuns(projectId);
    list.unshift(newRun);
    this.runs.set(projectId, list);

    await activityService.logActivity(
      'SYSTEM_EVENT',
      'Autonomous Loop Controller',
      `Launched Autonomous Run: "${goal}" (${mode})`,
      projectId,
      { runId, mode, maxIterations }
    );

    return newRun;
  }

  async pauseRun(runId: string, reason: string): Promise<AutonomousRun | null> {
    for (const [, runList] of this.runs) {
      const run = runList.find((r) => r.id === runId);
      if (run) {
        run.status = 'PAUSED';
        run.pauseReason = {
          reason,
          requestedAction: 'Halt autonomous loop',
          risk: 'LOW',
          recommendedDecision: 'Resume when ready',
        };
        run.timeline.unshift({
          id: `tl-${Date.now()}`,
          timestamp: new Date().toISOString(),
          title: 'Autonomous Run Paused by User',
          description: reason,
          stage: 'USER INTERVENTION',
          actor: 'Human User',
          severity: 'WARNING',
        });
        return run;
      }
    }
    return null;
  }

  async resumeRun(runId: string): Promise<AutonomousRun | null> {
    for (const [, runList] of this.runs) {
      const run = runList.find((r) => r.id === runId);
      if (run) {
        run.status = 'RUNNING';
        run.pauseReason = undefined;
        run.timeline.unshift({
          id: `tl-${Date.now()}`,
          timestamp: new Date().toISOString(),
          title: 'Autonomous Run Resumed',
          description: 'Loop execution resumed.',
          stage: 'EXECUTION',
          actor: 'Human User',
          severity: 'INFO',
        });
        return run;
      }
    }
    return null;
  }

  async cancelRun(runId: string): Promise<AutonomousRun | null> {
    for (const [, runList] of this.runs) {
      const run = runList.find((r) => r.id === runId);
      if (run) {
        run.status = 'CANCELLED';
        run.completedAt = new Date().toISOString();
        run.timeline.unshift({
          id: `tl-${Date.now()}`,
          timestamp: new Date().toISOString(),
          title: 'Autonomous Run Cancelled',
          description: 'Loop permanently terminated.',
          stage: 'TERMINATION',
          actor: 'Human User',
          severity: 'ERROR',
        });
        return run;
      }
    }
    return null;
  }

  async stepRun(runId: string): Promise<AutonomousRun | null> {
    for (const [projectId, runList] of this.runs) {
      const run = runList.find((r) => r.id === runId);
      if (!run) continue;

      // Check Decision Engine
      const pendingApprovals = await approvalService.getPendingApprovals(projectId);
      const decision = developmentDecisionEngine.evaluateNextStep(run, {
        lastBuildStatus: 'SUCCESS',
        lastQAStatus: 'PASS',
        consecutiveFailures: run.consecutiveFailures,
        pendingApprovalsCount: pendingApprovals.length,
      });

      if (decision.isStopCondition || decision.action === 'WAIT_FOR_HUMAN') {
        run.status = 'WAITING_HUMAN';
        run.pauseReason = {
          reason: decision.reason,
          requestedAction: decision.requestedAction || 'Action requires approval',
          risk: decision.risk,
          recommendedDecision: decision.recommendedDecision || 'Review carefully before continuing',
          approvalId: pendingApprovals[0]?.id,
        };
        run.timeline.unshift({
          id: `tl-${Date.now()}`,
          timestamp: new Date().toISOString(),
          title: `Autonomous Run Paused: ${decision.reason}`,
          description: decision.recommendedDecision || decision.reason,
          stage: 'HUMAN APPROVAL GATE',
          actor: 'Development Decision Engine',
          severity: 'WARNING',
        });
        return run;
      }

      // Execute next iteration
      run.currentIteration++;
      run.elapsedSeconds += 180;
      run.budgetUsed = Number((run.budgetUsed + 0.45).toFixed(2));
      run.status = 'RUNNING';

      const iterNum = run.currentIteration;
      const agents = ['Lead Engine Programmer', 'Pixel Artist Agent', 'QA Agent', 'AI Improvement Agent'];
      const assignedAgent = agents[iterNum % agents.length];
      const taskTitle = `Iteration ${iterNum}: Milestone Execution & Verification`;

      run.currentAgent = assignedAgent;
      run.currentTask = taskTitle;

      const newIteration: RunIteration = {
        iterationNumber: iterNum,
        startedAt: new Date(Date.now() - 180000).toISOString(),
        completedAt: new Date().toISOString(),
        agentName: assignedAgent,
        taskTitle,
        status: 'SUCCESS',
        buildStatus: 'SUCCESS',
        qaStatus: 'PASS',
        notes: 'Task passed compilation and regression checks.',
      };

      run.iterations.unshift(newIteration);
      run.timeline.unshift({
        id: `tl-${Date.now()}`,
        timestamp: new Date().toISOString(),
        title: `Iteration #${iterNum} Completed Successfully`,
        description: `${assignedAgent} executed "${taskTitle}". Build and QA passed.`,
        stage: 'ITERATION STEP',
        actor: assignedAgent,
        severity: 'SUCCESS',
      });

      // If finished all iterations or milestone completed
      if (run.currentIteration >= run.maxIterations) {
        run.status = 'COMPLETED';
        run.completedAt = new Date().toISOString();
        run.timeline.unshift({
          id: `tl-${Date.now()}`,
          timestamp: new Date().toISOString(),
          title: 'Autonomous Run Completed Goal',
          description: `Successfully reached iteration target with all quality gates satisfied.`,
          stage: 'COMPLETION',
          actor: 'Master Orchestrator',
          severity: 'SUCCESS',
        });

        // Generate report
        await this.generateRunReport(run.id, projectId);
      }

      return run;
    }
    return null;
  }

  async generateRunReport(runId: string, projectId: string): Promise<AutonomousRunReport> {
    const report: AutonomousRunReport = {
      id: `rep-${Date.now()}`,
      runId,
      projectId,
      goal: 'Make the Sparkit capture feature fully playable.',
      completedMilestones: [
        'Sparkit & Capture System Specification',
        'Sparkit Sprites, Audio & Trap Assets',
        'Capture Controller Implementation & State Machine',
        'Capture VFX & Animation Sequence',
      ],
      failedItems: [],
      changesSummary: 'Implemented 14 files across combat, capture, VFX particle system, and save slot persistence.',
      buildCount: 6,
      buildsPassed: 6,
      qaRunsCount: 8,
      qaPassedCount: 8,
      bugsDetected: 1,
      bugsResolved: 1,
      performanceStatus: '60 FPS stable (16.4ms frame time on Route 1)',
      newKnowledgeCount: 4,
      decisionsCount: 3,
      remainingWork: [
        'Route 1 NPC dialogue triggers',
        'Boss encounter Weakening Sigil mechanics',
      ],
      humanApprovalsNeeded: [],
      createdAt: new Date().toISOString(),
    };

    this.reports.set(runId, report);
    return report;
  }

  async getRunReport(runId: string): Promise<AutonomousRunReport | null> {
    return this.reports.get(runId) || null;
  }
}

export const autonomousDevelopmentService = new AutonomousDevelopmentService();
