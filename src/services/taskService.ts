import { getDatabaseAdapter } from '../adapters';
import { Task, TaskStatus, TaskPriority } from '../types';
import { activityService } from './activityService';

export class TaskService {
  private adapter = getDatabaseAdapter();

  async getTasks(projectId?: string): Promise<Task[]> {
    return this.adapter.getTasks(projectId);
  }

  async getTaskById(id: string): Promise<Task | null> {
    return this.adapter.getTaskById(id);
  }

  /**
   * Section 15: Task Dependencies Logic
   * Checks if any of the task's dependencies are incomplete.
   * If any dependency is not COMPLETED/Completed, this task is BLOCKED.
   */
  isTaskBlocked(task: Task, allTasks: Task[]): boolean {
    if (!task.dependencies || task.dependencies.length === 0) {
      return false;
    }

    // Check if any required prerequisite task is not completed
    for (const depId of task.dependencies) {
      const depTask = allTasks.find((t) => t.id === depId);
      if (!depTask) continue;
      const status = depTask.status;
      if (status !== 'COMPLETED' && status !== 'Completed') {
        return true;
      }
    }
    return false;
  }

  /**
   * Get effective display status of a task taking dependencies into account
   */
  getEffectiveTaskStatus(task: Task, allTasks: Task[]): TaskStatus {
    if (task.status !== 'COMPLETED' && task.status !== 'Completed' && this.isTaskBlocked(task, allTasks)) {
      return 'BLOCKED';
    }
    return task.status;
  }

  async createTask(
    data: {
      projectId: string;
      title: string;
      description: string;
      priority?: TaskPriority;
      assignedAgentId?: string;
      category?: string;
      dependencies?: string[];
      status?: TaskStatus;
      tags?: string[];
    },
    actorName: string = 'Game Architect'
  ): Promise<Task> {
    const newTask: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      projectId: data.projectId,
      title: data.title,
      description: data.description,
      status: data.status || 'PLANNING',
      priority: data.priority || 'MEDIUM',
      assignedAgentId: data.assignedAgentId || 'agent-architect',
      agentId: data.assignedAgentId || 'agent-architect',
      category: data.category,
      createdBy: actorName,
      progress: 0,
      dependencies: data.dependencies || [],
      tags: data.tags || ['Game Systems'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = await this.adapter.saveTask(newTask);

    await activityService.logActivity(
      'TASK_CREATED',
      actorName,
      `Created task: "${newTask.title}" (Priority: ${newTask.priority})`,
      newTask.projectId,
      { taskId: newTask.id, priority: newTask.priority }
    );

    return saved;
  }

  async updateTaskStatus(
    taskId: string,
    newStatus: TaskStatus,
    actorName: string = 'Autonomous Coordinator'
  ): Promise<{ task: Task; blockedReason?: string }> {
    const allTasks = await this.adapter.getTasks();
    const task = allTasks.find((t) => t.id === taskId);

    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    // Check if moving to active work while dependencies are blocked
    const isBlocked = this.isTaskBlocked(task, allTasks);
    if (isBlocked && (newStatus === 'IN_PROGRESS' || newStatus === 'Working' || newStatus === 'COMPLETED' || newStatus === 'Completed')) {
      const blockedDeps = (task.dependencies || [])
        .map((depId) => allTasks.find((t) => t.id === depId)?.title || depId)
        .join(', ');

      return {
        task,
        blockedReason: `Cannot advance task. Blocked by incomplete dependencies: ${blockedDeps}`,
      };
    }

    const previousStatus = task.status;
    task.status = newStatus;
    task.updatedAt = new Date().toISOString();

    if (newStatus === 'COMPLETED' || newStatus === 'Completed') {
      task.progress = 100;
      task.completedAt = new Date().toISOString();
    } else if (newStatus === 'IN_PROGRESS' || newStatus === 'Working') {
      if (task.progress === 0) task.progress = 25;
    }

    const saved = await this.adapter.saveTask(task);

    await activityService.logActivity(
      newStatus === 'COMPLETED' || newStatus === 'Completed' ? 'TASK_COMPLETED' : 'TASK_UPDATED',
      actorName,
      `Moved task "${task.title}" from ${previousStatus} to ${newStatus}`,
      task.projectId,
      { taskId: task.id, oldStatus: previousStatus, newStatus }
    );

    return { task: saved };
  }

  async updateTask(task: Task): Promise<Task> {
    return this.adapter.saveTask(task);
  }

  async deleteTask(id: string): Promise<boolean> {
    const task = await this.adapter.getTaskById(id);
    const result = await this.adapter.deleteTask(id);
    if (task && result) {
      await activityService.logActivity(
        'TASK_UPDATED',
        'Lead Producer',
        `Deleted task: "${task.title}"`,
        task.projectId
      );
    }
    return result;
  }
}

export const taskService = new TaskService();
