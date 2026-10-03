import { getDatabaseAdapter } from '../adapters';
import { DevelopmentDecision } from '../types';
import { activityService } from './activityService';

export class DecisionService {
  private adapter = getDatabaseAdapter();

  async getDecisions(projectId: string): Promise<DevelopmentDecision[]> {
    return this.adapter.getDecisions(projectId);
  }

  async createDecision(
    decision: Omit<DevelopmentDecision, 'id' | 'date'> & { id?: string; date?: string }
  ): Promise<DevelopmentDecision> {
    const fullDecision: DevelopmentDecision = {
      id: decision.id || `dec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      projectId: decision.projectId,
      title: decision.title,
      reason: decision.reason,
      createdBy: decision.createdBy || 'Game Architect',
      date: decision.date || new Date().toISOString().split('T')[0],
      status: decision.status || 'ACTIVE',
      category: decision.category || 'Architecture & Design',
    };

    const saved = await this.adapter.saveDecision(fullDecision);
    await activityService.logActivity(
      'SYSTEM_EVENT',
      fullDecision.createdBy,
      `Recorded architectural decision: "${fullDecision.title}"`,
      fullDecision.projectId
    );
    return saved;
  }

  async updateDecisionStatus(
    id: string,
    projectId: string,
    status: 'ACTIVE' | 'SUPERSEDED' | 'REJECTED'
  ): Promise<DevelopmentDecision | null> {
    const decisions = await this.getDecisions(projectId);
    const existing = decisions.find((d) => d.id === id);
    if (!existing) return null;

    const updated = { ...existing, status };
    const saved = await this.adapter.saveDecision(updated);
    await activityService.logActivity(
      'SYSTEM_EVENT',
      'Game Architect',
      `Updated decision status to ${status}: "${existing.title}"`,
      projectId
    );
    return saved;
  }
}

export const decisionService = new DecisionService();
