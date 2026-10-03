import { ImprovementTask } from '../types';
import { activityService } from './activityService';

class ImprovementAgentService {
  private improvementTasks: Map<string, ImprovementTask[]> = new Map();

  constructor() {
    this.improvementTasks.set('proj-embervale', [
      {
        id: 'imp-opt-01',
        projectId: 'proj-embervale',
        type: 'OPTIMIZATION',
        title: 'Batch Sprite Draw Calls for Tall Grass Blades in Route 1',
        description: 'Profile evidence shows 42 individual draw calls for grass tufts. Instanced batching will reduce to 1 draw call, saving ~2.4ms frame time.',
        evidence: 'Canvas Performance Profiler: 42 draw calls logged during Route 1 panning test.',
        priority: 'MEDIUM',
        status: 'PROPOSED',
        source: 'Performance Profiler Loop',
        suggestedAgent: 'Lead Engine Programmer',
        createdAt: new Date(Date.now() - 5400000).toISOString(),
      },
      {
        id: 'imp-ux-02',
        projectId: 'proj-embervale',
        type: 'UX',
        title: 'Add Visual Trajectory Arc to Rift Trap Throwing',
        description: 'Simulate arc trajectory with dotted guide line when player aims Rift Trap.',
        evidence: 'Player-flow QA: 35% of trap throws in first encounter fell short of creature hitbox.',
        priority: 'LOW',
        status: 'PROPOSED',
        source: 'Gameplay QA Playtest',
        suggestedAgent: 'Lead Game Designer',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'imp-refactor-03',
        projectId: 'proj-embervale',
        type: 'REFACTOR',
        title: 'Extract Creature Evolution Rules into Data-Driven JSON Table',
        description: 'Hardcoded level thresholds in Creature.ts should be decoupled into src/data/creatureEvolution.json to prevent canonical conflict recurrence.',
        evidence: 'Knowledge Conflict #conflict-sparkit-level resolved; decoupling prevents code/spec drift.',
        priority: 'HIGH',
        status: 'APPROVED',
        source: 'Knowledge Conflict Post-Mortem',
        suggestedAgent: 'Lead Engine Programmer',
        createdAt: new Date(Date.now() - 1800000).toISOString(),
      },
    ]);
  }

  async getImprovementTasks(projectId: string): Promise<ImprovementTask[]> {
    return this.improvementTasks.get(projectId) || [];
  }

  async proposeImprovement(task: Omit<ImprovementTask, 'id' | 'createdAt'>): Promise<ImprovementTask> {
    const newTask: ImprovementTask = {
      ...task,
      id: `imp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };

    const list = await this.getImprovementTasks(task.projectId);
    list.unshift(newTask);
    this.improvementTasks.set(task.projectId, list);

    await activityService.logActivity(
      'SYSTEM_EVENT',
      'AI Improvement Agent',
      `Proposed ${newTask.type} Improvement: "${newTask.title}"`,
      task.projectId,
      { taskId: newTask.id, type: newTask.type, priority: newTask.priority }
    );

    return newTask;
  }

  async approveImprovement(id: string, projectId: string): Promise<ImprovementTask | null> {
    const list = await this.getImprovementTasks(projectId);
    const item = list.find((t) => t.id === id);
    if (!item) return null;
    item.status = 'APPROVED';
    return item;
  }
}

export const improvementAgentService = new ImprovementAgentService();
