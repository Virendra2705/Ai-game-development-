import { getDatabaseAdapter } from '../adapters';
import { Activity, ActivityType } from '../types';

export class ActivityService {
  private adapter = getDatabaseAdapter();

  async getActivities(projectId?: string, limit: number = 50): Promise<Activity[]> {
    return this.adapter.getActivities(projectId, limit);
  }

  async logActivity(
    type: ActivityType,
    actor: string,
    message: string,
    projectId: string,
    metadata?: Record<string, any>,
    actorId: string = 'system'
  ): Promise<Activity> {
    const activity: Activity = {
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      projectId,
      type,
      actor,
      actorId,
      message,
      title: `${actor}: ${message}`,
      description: message,
      timestamp: new Date().toISOString(),
      timeAgo: 'Just now',
      createdAt: new Date().toISOString(),
      metadata,
    };

    return this.adapter.saveActivity(activity);
  }
}

export const activityService = new ActivityService();
