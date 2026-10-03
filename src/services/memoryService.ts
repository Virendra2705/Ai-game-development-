import { getDatabaseAdapter } from '../adapters';
import { MemoryEntry, MemoryCategory, ProjectMemorySnapshot } from '../types';
import { activityService } from './activityService';

export class MemoryService {
  private adapter = getDatabaseAdapter();

  async getMemories(projectId: string, category?: MemoryCategory): Promise<MemoryEntry[]> {
    return this.adapter.getMemoryEntries(projectId, category);
  }

  async saveMemory(entry: Partial<MemoryEntry> & { projectId: string; category: MemoryCategory; title: string; content: string }): Promise<MemoryEntry> {
    const fullEntry: MemoryEntry = {
      id: entry.id || `mem-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      projectId: entry.projectId,
      category: entry.category,
      title: entry.title,
      content: entry.content,
      tags: entry.tags || [entry.category],
      authorAgent: entry.authorAgent || 'Game Architect',
      updatedAt: new Date().toISOString(),
      version: entry.version ? entry.version + 1 : 1,
    };

    const saved = await this.adapter.saveMemoryEntry(fullEntry);
    await activityService.logActivity(
      'SYSTEM_EVENT',
      fullEntry.authorAgent,
      `Updated project memory in ${fullEntry.category}: "${fullEntry.title}"`,
      fullEntry.projectId
    );
    return saved;
  }

  async deleteMemory(id: string, projectId: string): Promise<boolean> {
    return this.adapter.deleteMemoryEntry(id);
  }

  async getMemorySnapshot(projectId: string, projectName: string = 'Active Project'): Promise<ProjectMemorySnapshot> {
    const entries = await this.getMemories(projectId);
    const decisions = await this.adapter.getDecisions(projectId);

    const visionEntry = entries.find((e) => e.category === 'GAME_VISION');
    const archEntry = entries.find((e) => e.category === 'TECHNICAL_ARCHITECTURE');
    const systems = entries
      .filter((e) => e.category === 'GAMEPLAY_SYSTEMS')
      .map((e) => `${e.title}: ${e.content}`);
    const constraints = entries
      .filter((e) => e.category === 'IMPORTANT_CONSTRAINTS')
      .map((e) => `${e.title}: ${e.content}`);
    const bugs = entries
      .filter((e) => e.category === 'KNOWN_BUGS')
      .map((e) => `${e.title}: ${e.content}`);

    return {
      projectId,
      projectName,
      gameVision: visionEntry?.content,
      technicalArchitecture: archEntry?.content,
      gameplaySystems: systems,
      constraints,
      decisions,
      knownBugs: bugs,
      entries,
    };
  }
}

export const memoryService = new MemoryService();
