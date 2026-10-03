import { ApprovalRequest, ApprovalCategory } from '../types';
import { activityService } from './activityService';

class ApprovalService {
  private approvals: Map<string, ApprovalRequest[]> = new Map();

  constructor() {
    // Initial pre-seeded approval items for Embervale: Rift Tamers
    this.approvals.set('proj-embervale', [
      {
        id: 'appr-arch-combat-sync',
        projectId: 'proj-embervale',
        category: 'ARCHITECTURE_CHANGE',
        title: 'Refactor Creature State Machine for Dynamic Capture Interrupts',
        description: 'Autonomous engine detected need to refactor CreatureStateMachine to support high-priority capture interrupt frames.',
        whatWillHappen: 'Modify src/game/CreatureStateMachine.ts to add INTERRUPT_CAPTURE state and unbind locked battle tick cycles.',
        why: 'Prevents wild creatures from firing combat spells while capture trap animation plays.',
        affectedFiles: [
          'src/game/CreatureStateMachine.ts',
          'src/game/CombatEngine.ts',
          'src/game/CaptureManager.ts'
        ],
        affectedSystems: ['Combat System', 'Creature AI', 'Animation State Sync'],
        risk: 'HIGH',
        evidence: 'QA Run #42 showed visual glitch: Sparkit continues lightning orb cast while encapsulated in Rift Trap.',
        aiRecommendation: 'Approve refactor. Proposed design follows verified GDD State Transition specs.',
        status: 'PENDING',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'appr-scope-route1-npcs',
        projectId: 'proj-embervale',
        category: 'SCOPE_CHANGE',
        title: 'Add 2 Ambient Tamer NPCs to Route 1 Clearing',
        description: 'AI Improvement Agent proposes populating Route 1 with tutorial dialogue NPCs.',
        whatWillHappen: 'Generate 2 NPC interaction triggers and spawn profiles for Tamer Jax and Scout Lyra.',
        why: 'Enriches gameplay flow and explains capture mechanics organically before Rift Verge.',
        affectedFiles: ['src/data/npcs/route1.json', 'src/game/DialogueManager.ts'],
        affectedSystems: ['World Dialogue', 'Quest Progression'],
        risk: 'MEDIUM',
        evidence: 'Player-flow QA test: 60% of test runs missed Rift Trap keybinding hint.',
        aiRecommendation: 'Recommend approval if Route 1 milestone timeline permits.',
        status: 'PENDING',
        createdAt: new Date(Date.now() - 7200000).toISOString(),
      }
    ]);
  }

  async getApprovals(projectId: string): Promise<ApprovalRequest[]> {
    return this.approvals.get(projectId) || [];
  }

  async getPendingApprovals(projectId: string): Promise<ApprovalRequest[]> {
    const list = await this.getApprovals(projectId);
    return list.filter((a) => a.status === 'PENDING');
  }

  async requestApproval(data: Omit<ApprovalRequest, 'id' | 'status' | 'createdAt'>): Promise<ApprovalRequest> {
    const newApproval: ApprovalRequest = {
      ...data,
      id: `appr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    const list = await this.getApprovals(data.projectId);
    list.unshift(newApproval);
    this.approvals.set(data.projectId, list);

    await activityService.logActivity(
      'SYSTEM_EVENT',
      'Autonomous Loop Controller',
      `Approval Requested: ${newApproval.title} (${newApproval.category} - ${newApproval.risk} Risk)`,
      data.projectId,
      { approvalId: newApproval.id, category: newApproval.category, risk: newApproval.risk }
    );

    return newApproval;
  }

  async approve(id: string, projectId: string, notes?: string, actor = 'Human Lead'): Promise<ApprovalRequest | null> {
    const list = await this.getApprovals(projectId);
    const item = list.find((a) => a.id === id);
    if (!item) return null;

    item.status = 'APPROVED';
    item.decidedAt = new Date().toISOString();
    item.decidedBy = actor;
    item.decisionNotes = notes;

    await activityService.logActivity(
      'SYSTEM_EVENT',
      actor,
      `Approved: ${item.title}`,
      projectId,
      { approvalId: item.id, category: item.category }
    );

    return item;
  }

  async reject(id: string, projectId: string, notes?: string, actor = 'Human Lead'): Promise<ApprovalRequest | null> {
    const list = await this.getApprovals(projectId);
    const item = list.find((a) => a.id === id);
    if (!item) return null;

    item.status = 'REJECTED';
    item.decidedAt = new Date().toISOString();
    item.decidedBy = actor;
    item.decisionNotes = notes;

    await activityService.logActivity(
      'SYSTEM_EVENT',
      actor,
      `Rejected Approval Request: ${item.title}`,
      projectId,
      { approvalId: item.id, category: item.category, notes }
    );

    return item;
  }

  async requestMoreInfo(id: string, projectId: string, notes: string, actor = 'Human Lead'): Promise<ApprovalRequest | null> {
    const list = await this.getApprovals(projectId);
    const item = list.find((a) => a.id === id);
    if (!item) return null;

    item.status = 'MORE_INFO_REQUESTED';
    item.decisionNotes = notes;

    return item;
  }
}

export const approvalService = new ApprovalService();
