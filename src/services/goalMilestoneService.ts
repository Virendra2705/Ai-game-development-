import { DevelopmentGoal, Milestone, QualityGate, QualityGateType } from '../types';
import { activityService } from './activityService';

class GoalMilestoneService {
  private goals: Map<string, DevelopmentGoal[]> = new Map();
  private milestones: Map<string, Milestone[]> = new Map();

  constructor() {
    // Initial pre-seeded goals and milestones for Embervale: Rift Tamers
    const embervaleGoals: DevelopmentGoal[] = [
      {
        id: 'goal-sparkit-capture',
        projectId: 'proj-embervale',
        title: 'Make the Sparkit capture feature fully playable',
        description: 'End-to-end implementation of Sparkit wild encounter, weakening battle loop, Rift Trap throwing, capture formula calculation, animation sequence, and party roster persistence.',
        priority: 'CRITICAL',
        status: 'ACTIVE',
        milestoneIds: [
          'ms-sparkit-spec',
          'ms-sparkit-art',
          'ms-capture-formula',
          'ms-trap-vfx',
          'ms-capture-integration',
          'ms-qa-regression',
        ],
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        estimatedMilestonesCount: 6,
        targetOutcome: 'Player can encounter wild Sparkit on Route 1, weaken with combat moves, deploy Rift Trap, capture successfully, and summon in next battle.',
      },
      {
        id: 'goal-route1-playable',
        projectId: 'proj-embervale',
        title: 'Make the first Embervale region (Route 1) playable',
        description: 'Create playable vertical slice of Route 1 from Rift Verge village to Stormcreek Outpost.',
        priority: 'HIGH',
        status: 'ACTIVE',
        milestoneIds: [
          'ms-route1-tilemap',
          'ms-route1-collision',
          'ms-route1-spawning',
          'ms-route1-npcs',
        ],
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        estimatedMilestonesCount: 4,
        targetOutcome: 'Full navigational path with wild creature spawners and tutorial NPC dialogue.',
      },
    ];

    this.goals.set('proj-embervale', embervaleGoals);

    const embervaleMilestones: Milestone[] = [
      {
        id: 'ms-sparkit-spec',
        projectId: 'proj-embervale',
        goalId: 'goal-sparkit-capture',
        orderIndex: 1,
        name: 'Sparkit & Capture System Specification',
        description: 'Establish authoritative creature stats, capture rate curves, and state machine transitions in project memory.',
        goal: 'Make the Sparkit capture feature fully playable',
        tasks: ['task-gdd-sparkit-spec', 'task-capture-rate-formula'],
        dependencies: [],
        acceptanceCriteria: [
          'Sparkit base stats documented: HP 45, Attack 52, Defense 43, Speed 65',
          'Capture formula calculates HP ratio and status effect multiplier',
          'Maximum base capture rate capped at 85% for common species',
        ],
        qualityGates: this.createStandardQualityGates(true),
        status: 'COMPLETED',
        progress: 100,
        startedAt: new Date(Date.now() - 72000000).toISOString(),
        completedAt: new Date(Date.now() - 60000000).toISOString(),
      },
      {
        id: 'ms-sparkit-art',
        projectId: 'proj-embervale',
        goalId: 'goal-sparkit-capture',
        orderIndex: 2,
        name: 'Sparkit Sprites, Audio & Trap Assets',
        description: 'Generate pixel art idle/attack/capture sprites, trap clamp SFX, and Sparkit electric cry.',
        goal: 'Make the Sparkit capture feature fully playable',
        tasks: ['task-sparkit-sprites', 'task-trap-sfx'],
        dependencies: ['ms-sparkit-spec'],
        acceptanceCriteria: [
          'Sparkit 32x32 animated sprite sheet with 4 frames per animation',
          'Rift Trap throw, clamp, and success burst sound effects',
          'Visual assets validated against 16-bit color palette',
        ],
        qualityGates: this.createStandardQualityGates(true),
        status: 'COMPLETED',
        progress: 100,
        startedAt: new Date(Date.now() - 58000000).toISOString(),
        completedAt: new Date(Date.now() - 40000000).toISOString(),
      },
      {
        id: 'ms-capture-formula',
        projectId: 'proj-embervale',
        goalId: 'goal-sparkit-capture',
        orderIndex: 3,
        name: 'Capture Controller Implementation & State Machine',
        description: 'Implement Rift Trap inventory deduction, RNG rate calculation, and battle turn hold.',
        goal: 'Make the Sparkit capture feature fully playable',
        tasks: ['task-capture-controller', 'task-state-machine-sync'],
        dependencies: ['ms-sparkit-spec', 'ms-sparkit-art'],
        acceptanceCriteria: [
          'Capture chances adhere to Math.min(0.85, baseRate * hpModifier * statusModifier)',
          'Consumable trap decreases by 1 in player inventory upon throw',
          'Battle UI switches to capture animation camera view',
        ],
        qualityGates: this.createStandardQualityGates(true),
        status: 'COMPLETED',
        progress: 100,
        startedAt: new Date(Date.now() - 38000000).toISOString(),
        completedAt: new Date(Date.now() - 20000000).toISOString(),
      },
      {
        id: 'ms-trap-vfx',
        projectId: 'proj-embervale',
        goalId: 'goal-sparkit-capture',
        orderIndex: 4,
        name: 'Capture VFX & Animation Sequence',
        description: 'Implement particle emitter for Rift energy sparks and 3-shake capture suspense loop.',
        goal: 'Make the Sparkit capture feature fully playable',
        tasks: ['task-trap-vfx-particles', 'task-capture-shake-loop'],
        dependencies: ['ms-capture-formula'],
        acceptanceCriteria: [
          'Rift trap shakes up to 3 times before final lock click',
          'Breakout particle burst triggers if capture roll fails',
          'Golden rift ring VFX flares on capture success',
        ],
        qualityGates: this.createStandardQualityGates(true),
        status: 'IN_PROGRESS',
        progress: 80,
        startedAt: new Date(Date.now() - 18000000).toISOString(),
      },
      {
        id: 'ms-capture-integration',
        projectId: 'proj-embervale',
        goalId: 'goal-sparkit-capture',
        orderIndex: 5,
        name: 'Party Roster & Save System Integration',
        description: 'Auto-add captured Sparkit to active player party or storage box with serialization.',
        goal: 'Make the Sparkit capture feature fully playable',
        tasks: ['task-roster-add', 'task-save-serialization'],
        dependencies: ['ms-trap-vfx'],
        acceptanceCriteria: [
          'Captured Sparkit assigned unique UUID, current HP, and moveset',
          'Party HUD reflects newly acquired Sparkit',
          'Save file persists captured creature across browser reload',
        ],
        qualityGates: this.createStandardQualityGates(false),
        status: 'READY',
        progress: 0,
      },
      {
        id: 'ms-qa-regression',
        projectId: 'proj-embervale',
        goalId: 'goal-sparkit-capture',
        orderIndex: 6,
        name: 'QA Playtest & Full Regression Suite',
        description: 'Run automated gameplay test agent and 5 regression tests for edge cases.',
        goal: 'Make the Sparkit capture feature fully playable',
        tasks: ['task-qa-capture-suite'],
        dependencies: ['ms-capture-integration'],
        acceptanceCriteria: [
          'All 5 capture regression tests pass',
          'No critical or major bugs open',
          '60 FPS maintained during capture sequence particle burst',
        ],
        qualityGates: this.createStandardQualityGates(false),
        status: 'PLANNED',
        progress: 0,
      },
    ];

    this.milestones.set('proj-embervale', embervaleMilestones);
  }

  private createStandardQualityGates(allPassed = false): QualityGate[] {
    const types: QualityGateType[] = [
      'CODE_QUALITY',
      'BUILD_SUCCESS',
      'RUNTIME_STARTUP',
      'GAMEPLAY_FUNCTIONALITY',
      'VISUAL_QA',
      'PERFORMANCE',
      'ASSET_VALIDATION',
      'REGRESSION_TESTS',
    ];

    return types.map((type, idx) => ({
      id: `qg-${type}-${idx}`,
      type,
      name: type.replace(/_/g, ' '),
      description: `Mandatory quality verification for ${type.replace(/_/g, ' ')}.`,
      passed: allPassed,
      status: allPassed ? 'PASSED' : 'PENDING',
      evaluatedAt: allPassed ? new Date(Date.now() - 3600000).toISOString() : undefined,
    }));
  }

  async getGoals(projectId: string): Promise<DevelopmentGoal[]> {
    return this.goals.get(projectId) || [];
  }

  async getMilestones(projectId: string): Promise<Milestone[]> {
    return this.milestones.get(projectId) || [];
  }

  async createGoalWithMilestones(
    projectId: string,
    title: string,
    description: string,
    targetOutcome: string
  ): Promise<{ goal: DevelopmentGoal; milestones: Milestone[] }> {
    const goalId = `goal-${Date.now()}`;
    const milestoneDrafts = [
      {
        name: 'Core System & Logic Foundation',
        description: `Implement core mechanics and data models for "${title}".`,
      },
      {
        name: 'Asset Generation & Visual Tuning',
        description: `Create and integrate sprites, UI components, and sound effects for "${title}".`,
      },
      {
        name: 'Gameplay Integration & Player Interaction',
        description: `Wire mechanics into world loop, controls, and scene transitions for "${title}".`,
      },
      {
        name: 'Quality Assurance & Regression Testing',
        description: `Execute comprehensive test suite and verify all quality gates pass for "${title}".`,
      },
    ];

    const createdMilestones: Milestone[] = milestoneDrafts.map((d, index) => ({
      id: `ms-${goalId}-${index + 1}`,
      projectId,
      goalId,
      orderIndex: index + 1,
      name: d.name,
      description: d.description,
      goal: title,
      tasks: [],
      dependencies: index > 0 ? [`ms-${goalId}-${index}`] : [],
      acceptanceCriteria: [
        `All requirements of ${d.name} verified against design specification`,
        'Build completes cleanly with zero fatal compilation errors',
      ],
      qualityGates: this.createStandardQualityGates(false),
      status: index === 0 ? 'READY' : 'PLANNED',
      progress: 0,
    }));

    const newGoal: DevelopmentGoal = {
      id: goalId,
      projectId,
      title,
      description,
      priority: 'HIGH',
      status: 'ACTIVE',
      milestoneIds: createdMilestones.map((m) => m.id),
      createdAt: new Date().toISOString(),
      estimatedMilestonesCount: createdMilestones.length,
      targetOutcome,
    };

    const goalsList = await this.getGoals(projectId);
    goalsList.unshift(newGoal);
    this.goals.set(projectId, goalsList);

    const msList = await this.getMilestones(projectId);
    this.milestones.set(projectId, [...msList, ...createdMilestones]);

    await activityService.logActivity(
      'SYSTEM_EVENT',
      'Master Orchestrator',
      `Created Development Goal: "${title}" with ${createdMilestones.length} milestones.`,
      projectId,
      { goalId, milestoneCount: createdMilestones.length }
    );

    return { goal: newGoal, milestones: createdMilestones };
  }

  async updateMilestoneStatus(
    projectId: string,
    milestoneId: string,
    status: Milestone['status'],
    progress?: number
  ): Promise<Milestone | null> {
    const list = await this.getMilestones(projectId);
    const ms = list.find((m) => m.id === milestoneId);
    if (!ms) return null;

    ms.status = status;
    if (progress !== undefined) ms.progress = progress;
    if (status === 'COMPLETED') {
      ms.completedAt = new Date().toISOString();
      ms.progress = 100;
      // Mark quality gates as passed
      ms.qualityGates.forEach((qg) => {
        qg.passed = true;
        qg.status = 'PASSED';
        qg.evaluatedAt = new Date().toISOString();
      });
    }

    return ms;
  }
}

export const goalMilestoneService = new GoalMilestoneService();
