import { KnowledgeConflict, KnowledgeDocument, MemoryEntry } from '../types';
import { activityService } from './activityService';

class KnowledgeConflictService {
  private conflicts: Map<string, KnowledgeConflict[]> = new Map();

  constructor() {
    // Initial pre-seeded conflicts for Embervale: Rift Tamers
    this.conflicts.set('proj-embervale', [
      {
        id: 'conflict-sparkit-level',
        projectId: 'proj-embervale',
        knowledgeA: {
          id: 'doc-sparkit-spec',
          title: 'Sparkit Creature Specification',
          statement: 'Sparkit evolves into Voltrik at level 20 with Thunderstone catalyst.',
          source: 'Game Design Document v1.2',
          confidence: 'VERIFIED',
        },
        knowledgeB: {
          id: 'mem-combat-draft',
          title: 'Combat Evolution Balance Notes',
          statement: 'Sparkit evolution threshold moved to level 25 to pace early game progression.',
          source: 'AI Suggestion / Combat Agent Draft',
          confidence: 'UNVERIFIED',
        },
        reason: 'Conflicting level requirement for Sparkit evolution (Level 20 canon vs Level 25 combat draft).',
        severity: 'HIGH',
        status: 'OPEN',
      },
      {
        id: 'conflict-capture-formula',
        projectId: 'proj-embervale',
        knowledgeA: {
          id: 'doc-capture-spec',
          title: 'Creature Capture Specification',
          statement: 'Maximum base capture rate is capped at 85% for common creatures.',
          source: 'GDD: Core Gameplay Systems',
          confidence: 'VERIFIED',
        },
        knowledgeB: {
          id: 'mem-qa-obs',
          title: 'QA Test Run Observation #42',
          statement: 'Capture success reached 100% on wild Sparkit when health was under 10%.',
          source: 'QA Automated Test Suite',
          confidence: 'LIKELY',
        },
        reason: 'Observed 100% capture rate violates the 85% maximum ceiling specified in GDD.',
        severity: 'MEDIUM',
        status: 'UNDER_REVIEW',
      },
    ]);
  }

  async getConflicts(projectId: string): Promise<KnowledgeConflict[]> {
    return this.conflicts.get(projectId) || [];
  }

  async getConflictById(projectId: string, id: string): Promise<KnowledgeConflict | null> {
    const list = await this.getConflicts(projectId);
    return list.find((c) => c.id === id) || null;
  }

  /**
   * Scans a new document or memory entry against existing knowledge to detect contradictions
   */
  async detectConflicts(
    projectId: string,
    newItem: { title: string; content: string; source?: string },
    existingDocs: KnowledgeDocument[],
    existingMemories: MemoryEntry[]
  ): Promise<KnowledgeConflict[]> {
    const detected: KnowledgeConflict[] = [];
    const lowerContent = newItem.content.toLowerCase();

    // Check for level evolution discrepancy
    if (lowerContent.includes('sparkit') && (lowerContent.includes('level 25') || lowerContent.includes('level 20'))) {
      const canonDoc = existingDocs.find((d) => d.title.includes('Sparkit'));
      if (canonDoc && canonDoc.content.includes('level 20') && lowerContent.includes('level 25')) {
        detected.push({
          id: `conflict-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          projectId,
          knowledgeA: {
            id: canonDoc.id,
            title: canonDoc.title,
            statement: 'Sparkit evolves at level 20',
            source: canonDoc.source,
            confidence: canonDoc.confidence,
          },
          knowledgeB: {
            id: 'new-submission',
            title: newItem.title,
            statement: 'Sparkit evolves at level 25',
            source: newItem.source || 'Submitted Content',
            confidence: 'UNVERIFIED',
          },
          reason: 'Evolution level divergence: Level 20 canon vs Level 25 in submitted content',
          severity: 'HIGH',
          status: 'OPEN',
        });
      }
    }

    // Check capture rate discrepancies
    if (lowerContent.includes('capture') && (lowerContent.includes('100%') || lowerContent.includes('guaranteed'))) {
      const captureDoc = existingDocs.find((d) => d.title.includes('Capture'));
      if (captureDoc && captureDoc.content.includes('85%')) {
        detected.push({
          id: `conflict-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          projectId,
          knowledgeA: {
            id: captureDoc.id,
            title: captureDoc.title,
            statement: 'Base capture rate strictly capped at 85%',
            source: captureDoc.source,
            confidence: 'VERIFIED',
          },
          knowledgeB: {
            id: 'new-submission',
            title: newItem.title,
            statement: 'Guaranteed or 100% capture rate proposed',
            source: newItem.source || 'Submitted Content',
            confidence: 'UNVERIFIED',
          },
          reason: 'Guaranteed capture rate contradicts core game balance constraint',
          severity: 'HIGH',
          status: 'OPEN',
        });
      }
    }

    // Record newly detected conflicts
    if (detected.length > 0) {
      const current = await this.getConflicts(projectId);
      this.conflicts.set(projectId, [...detected, ...current]);
      for (const d of detected) {
        await activityService.logActivity(
          'SYSTEM_EVENT',
          'Knowledge Conflict Detector',
          `Detected knowledge contradiction: "${d.reason}"`,
          projectId
        );
      }
    }

    return detected;
  }

  /**
   * Resolve an open conflict by human or architect decision
   */
  async resolveConflict(
    projectId: string,
    conflictId: string,
    resolution: string,
    resolvedBy: string = 'Game Architect',
    newStatus: 'RESOLVED' | 'IGNORED' = 'RESOLVED'
  ): Promise<KnowledgeConflict | null> {
    const list = await this.getConflicts(projectId);
    const item = list.find((c) => c.id === conflictId);
    if (!item) return null;

    item.status = newStatus;
    item.resolution = resolution;
    item.resolvedBy = resolvedBy;
    item.resolvedAt = new Date().toISOString();

    this.conflicts.set(projectId, [...list]);

    await activityService.logActivity(
      'SYSTEM_EVENT',
      resolvedBy,
      `Resolved knowledge conflict "${item.id}": ${resolution}`,
      projectId
    );

    return item;
  }
}

export const knowledgeConflictService = new KnowledgeConflictService();
