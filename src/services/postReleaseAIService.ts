import {
  PostReleaseImprovementPlan,
  CrashReport,
  PlayerFeedback,
} from '../types';
import { crashAnalysisService } from './crashAnalysisService';
import { feedbackService } from './feedbackService';
import { monitoringService } from './monitoringService';
import { knowledgeBaseService } from './knowledgeBaseService';
import { memoryService } from './memoryService';
import { taskService } from './taskService';
import { improvementAgentService } from './improvementAgentService';

export class PostReleaseAIService {
  private plans: Map<string, PostReleaseImprovementPlan[]> = new Map();

  constructor() {
    this.seedDefaultPlans('proj-embervale');
  }

  private seedDefaultPlans(projectId: string) {
    const p1: PostReleaseImprovementPlan = {
      id: 'plan-pr-01',
      projectId,
      title: 'Fix Sparkit Kinetic Net Despawn Race Condition (Crash Fix)',
      type: 'Bug Fix',
      reason:
        '14 production crashes logged in v1.0.0 due to NullReferenceException in KineticNet.cs when target despawns on collision tick.',
      evidence: [
        'Crash Report #crash-001 with verified stack trace in KineticNet.cs:84',
        '9 confirmed affected Android players logged via client telemetry',
        'Direct player complaint in support ticket #fb-03 reporting game crash on net throw',
      ],
      expectedImpact: 'Eliminate 100% of NullReference crashes in creature capture loop and restore 99.99% runtime stability.',
      affectedSystems: ['Combat / Kinetic Net', 'Creature AI State Machine', 'Lifecycle Garbage Collection'],
      risk: 'LOW',
      requiredWork: [
        'Add IsInstanceValid(target) defensive check in KineticNet.cs',
        'Cancel despawn timer if creature has entered CAPTURE_PENDING state',
        'Add automated regression test in CreatureCaptureTests.cs',
      ],
      status: 'PROPOSED',
      linkedIssueId: 'qa-issue-c1',
      createdAt: '2026-09-18T04:00:00Z',
    };

    const p2: PostReleaseImprovementPlan = {
      id: 'plan-pr-02',
      projectId,
      title: 'Optimize Mobile Touch Joystick & Low-Spec Battery Consumption',
      type: 'Performance Optimization',
      reason:
        'Player feedback clusters indicate sluggish touch control response on Android (Galaxy S22) and thermal throttling from Vulkan shadow cascades.',
      evidence: [
        'Player feedback #fb-02: "touch controls feel sluggish on my Galaxy S22"',
        'Player feedback #fb-05: "Battery drains really fast after 20 minutes... Phone gets warm"',
        'Crash report #crash-002: Adreno 610 GPU buffer exhaustion in Sunken Mire biome',
      ],
      expectedImpact: 'Improve touch latency by 45% and decrease GPU temperature by 3.5°C on mobile devices.',
      affectedSystems: ['Touch Input Adapter', 'Vulkan Renderer / Water Reflection Shader', 'Frame Pacer'],
      risk: 'MEDIUM',
      requiredWork: [
        'Decouple touch input polling from rendering frame rate using immediate input buffer',
        'Add dynamic shadow cascade scaler (2 cascades on battery saver mode)',
        'Expose manual 30/60 FPS toggle in game graphics settings menu',
      ],
      status: 'PROPOSED',
      createdAt: '2026-09-19T20:00:00Z',
    };

    this.plans.set(projectId, [p1, p2]);
  }

  getPlans(projectId: string): PostReleaseImprovementPlan[] {
    return this.plans.get(projectId) || [];
  }

  getPlan(projectId: string, id: string): PostReleaseImprovementPlan | undefined {
    return this.getPlans(projectId).find((p) => p.id === id);
  }

  async runPostReleaseAnalysis(projectId: string): Promise<{
    analyzedCrashes: number;
    analyzedFeedback: number;
    newProposals: PostReleaseImprovementPlan[];
    knowledgeUpdated: boolean;
  }> {
    const crashes = crashAnalysisService.getCrashes(projectId);
    const feedback = feedbackService.getFeedback(projectId);
    const clusters = feedbackService.getThematicClusters(projectId);

    // Update Project Knowledge with production learnings
    await knowledgeBaseService.saveDocument({
      projectId,
      title: 'Production Post-Release Telemetry & Crash Learnings (v1.0.0)',
      description: 'Living record of verified production crashes, root cause hypotheses, and hardware edge cases.',
      category: 'TECHNICAL_ARCHITECTURE',
      content: `# Production Post-Release Telemetry & Crash Learnings (v1.0.0)

## Verified Production Bugs
- **Kinetic Net Entity Lifecycle**: \`System.NullReferenceException\` occurs when an electric creature despawns during the identical tick that a kinetic trap collision signal triggers.
- **Vulkan Mobile Buffer Exhaustion**: Budget chipsets (Adreno 610) fail on dynamic water cascades exceeding 4 splits.

## Player Feedback Synthesis
- **Capture Difficulty**: Capture wind-up of 2.5s is perceived as frustratingly long. Recommended rebalance to 1.6s.
- **Inventory Ergonomics**: Community requests auto-sort for elemental crystal inventory.

## Confidence & Source
- Telemetry Source: Production Monitoring Fleet (99.94% availability)
- Confidence: VERIFIED by live runtime traces.`,
      source: 'Production Telemetry Listener',
      sourceType: 'USER',
      tags: ['Production', 'Learnings', 'PostRelease', 'v1.0.0'],
      status: 'ACTIVE',
      confidence: 'VERIFIED',
    });

    // Add Memory
    await memoryService.saveMemory({
      projectId,
      category: 'TECHNICAL_ARCHITECTURE',
      title: 'Production Guard: Entity Existence Before Collision Processing',
      content:
        'All area collision signals must verify GodotObject.IsInstanceValid(target) and !target.IsQueuedForDeletion() to prevent runtime crashes during simultaneous despawn ticks.',
      priority: 'CRITICAL',
    });

    const newProposals: PostReleaseImprovementPlan[] = [];

    // Check if we need an inventory proposal
    const hasInventoryProposal = this.getPlans(projectId).some((p) => p.title.includes('Inventory'));
    const inventoryFeedback = feedback.filter((f) => f.message.toLowerCase().includes('inventory'));

    if (!hasInventoryProposal && inventoryFeedback.length > 0) {
      const p: PostReleaseImprovementPlan = {
        id: `plan-pr-${Date.now().toString(36)}`,
        projectId,
        title: 'Implement Inventory Auto-Sort & Elemental Crystal Filtering',
        type: 'UX Improvement',
        reason: 'Community feedback requests inventory quality-of-life sorting for elemental materials.',
        evidence: inventoryFeedback.map((f) => `"${f.message}" (${f.source})`),
        expectedImpact: 'Reduce inventory management time by 65% for mid-game players.',
        affectedSystems: ['UI / Inventory Screen', 'Player Storage Data Model'],
        risk: 'LOW',
        requiredWork: [
          'Add sort button in InventoryPanel.gd',
          'Implement sorting comparator by element, rarity, and quantity',
          'Add sound cue on sort completion',
        ],
        status: 'PROPOSED',
        createdAt: new Date().toISOString(),
      };
      newProposals.push(p);
      const list = this.getPlans(projectId);
      list.push(p);
      this.plans.set(projectId, list);
    }

    return {
      analyzedCrashes: crashes.length,
      analyzedFeedback: feedback.length,
      newProposals,
      knowledgeUpdated: true,
    };
  }

  async approveAndLaunchDevelopmentRun(
    projectId: string,
    planId: string,
    authorizer: string
  ): Promise<{ success: boolean; taskId?: string; error?: string }> {
    // Human approval required for scope-changing work
    if (!authorizer || authorizer.toLowerCase().includes('agent') || authorizer.toLowerCase().includes('bot') || authorizer.toLowerCase().includes('ai')) {
      return {
        success: false,
        error: 'Authorization Error: Human approval is strictly required before launching development runs for post-release proposals.',
      };
    }

    const plan = this.getPlan(projectId, planId);
    if (!plan) return { success: false, error: 'Improvement plan not found' };

    // 1. Create development task
    const task = await taskService.createTask({
      projectId,
      title: `[Post-Release AI Run] ${plan.title}`,
      description: `${plan.reason}\n\nRequired Work:\n${plan.requiredWork.map((w) => `- ${w}`).join('\n')}\n\nEvidence:\n${plan.evidence.map((e) => `• ${e}`).join('\n')}`,
      category: plan.type === 'Bug Fix' ? 'Bugfix' : plan.type === 'Performance Optimization' ? 'Optimization' : 'Feature',
      priority: plan.risk === 'HIGH' ? 'CRITICAL' : 'HIGH',
      tags: ['post-release', 'phase-10-to-phase-9-loop', plan.type.toLowerCase().replace(/\s+/g, '-')],
    });

    plan.status = 'IN_DEVELOPMENT';
    plan.linkedTaskId = task.id;

    // 2. Queue into Phase 9 Improvement Loop
    await improvementAgentService.proposeImprovement({
      projectId,
      type: plan.type === 'Bug Fix' ? 'BUG_FIX' : plan.type === 'Performance Optimization' ? 'OPTIMIZATION' : 'UX',
      title: plan.title,
      description: plan.reason,
      evidence: plan.evidence.join('; '),
      priority: plan.risk === 'HIGH' ? 'CRITICAL' : 'HIGH',
      status: 'APPROVED',
      source: 'Post-Release AI Production Analysis',
      suggestedAgent: 'Lead Engine Programmer',
    });

    monitoringService.recordEvent({
      projectId,
      type: 'APPROVAL_GRANTED',
      title: `Post-Release Plan Approved: ${plan.title}`,
      details: `Approved by ${authorizer}. Dispatched into Phase 9 Autonomous Dev Loop (Task ID: ${task.id}).`,
      sourceRef: plan.id,
      severity: 'SUCCESS',
    });

    return { success: true, taskId: task.id };
  }
}

export const postReleaseAIService = new PostReleaseAIService();
