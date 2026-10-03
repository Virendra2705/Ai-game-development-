import { getDatabaseAdapter } from '../adapters';
import { Agent, AgentStatus } from '../types';
import { activityService } from './activityService';

export class AgentService {
  private adapter = getDatabaseAdapter();

  async getAgents(projectId?: string): Promise<Agent[]> {
    return this.adapter.getAgents(projectId);
  }

  async getAgentById(id: string): Promise<Agent | null> {
    return this.adapter.getAgentById(id);
  }

  async updateAgentStatus(id: string, status: AgentStatus, projectId?: string): Promise<Agent | null> {
    const agent = await this.adapter.getAgentById(id);
    if (!agent) return null;

    agent.status = status;
    agent.lastActive = 'Just now';
    const saved = await this.adapter.saveAgent(agent);

    if (projectId) {
      await activityService.logActivity(
        status === 'WORKING' || status === 'Working' ? 'AGENT_STARTED' : 'AGENT_FINISHED',
        agent.name,
        `Status updated to ${status}`,
        projectId,
        { agentId: agent.id, status }
      );
    }

    return saved;
  }

  async assignTaskToAgent(agentId: string, taskId: string, taskTitle: string, projectId: string): Promise<Agent | null> {
    const agent = await this.adapter.getAgentById(agentId);
    if (!agent) return null;

    agent.currentTaskId = taskId;
    agent.currentTask = taskTitle;
    agent.status = 'WORKING';
    agent.lastActive = 'Just now';

    const saved = await this.adapter.saveAgent(agent);
    await activityService.logActivity(
      'AGENT_STARTED',
      agent.name,
      `Assigned to task: "${taskTitle}"`,
      projectId,
      { agentId, taskId }
    );

    return saved;
  }
}

export const agentService = new AgentService();
