import {
  AIPlan,
  AIPlanResponse,
  AIPlanStatus,
  AIProviderStatus,
  AIUsageInfo,
  Task,
  Activity,
  ProposedTask,
  ProposedMemoryUpdate,
  ProposedDecision,
} from '../types';
import { taskService } from './taskService';
import { activityService } from './activityService';
import { memoryService } from './memoryService';
import { decisionService } from './decisionService';
import { agentService } from './agentService';
import { memoryExtractionService } from './memoryExtractionService';

const USAGE_STORAGE_KEY = 'ai_builder_usage_stats';

class AIPlanService {
  /**
   * Check Gemini Connection status from server API
   */
  async getStatus(): Promise<AIProviderStatus> {
    try {
      const res = await fetch('/api/ai/status');
      if (!res.ok) {
        return {
          connected: false,
          provider: 'Google Gemini',
          model: 'gemini-3.8-flash',
          message: 'Server returned error checking status',
        };
      }
      return await res.json();
    } catch (err: any) {
      return {
        connected: false,
        provider: 'Google Gemini',
        model: 'gemini-3.8-flash',
        message: 'Network error communicating with AI server endpoint',
      };
    }
  }

  /**
   * Test Gemini API connection
   */
  async testConnection(): Promise<{ success: boolean; model: string; latencyMs: number; message: string }> {
    try {
      const res = await fetch('/api/ai/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      return data;
    } catch (err: any) {
      return {
        success: false,
        model: 'gemini-3.8-flash',
        latencyMs: 0,
        message: err.message || 'Connection test failed',
      };
    }
  }

  /**
   * Requests a structured development plan from the AI Orchestrator
   */
  async createPlanRequest(params: {
    projectId: string;
    projectName: string;
    genre?: string;
    engine?: string;
    platform?: string;
    currentPhase?: string;
    userCommand: string;
    constraints?: string[];
  }): Promise<AIPlan> {
    // 1. Gather relevant project context to send to orchestrator
    const [memories, tasks, decisions] = await Promise.all([
      memoryService.getMemories(params.projectId),
      taskService.getTasks(params.projectId),
      decisionService.getDecisions(params.projectId),
    ]);

    const memorySummary = memories.map((m) => ({
      category: m.category,
      title: m.title,
      content: m.content,
    }));

    const taskSummary = tasks.map((t) => ({
      id: t.id,
      title: t.title,
      status: t.status,
      priority: t.priority,
    }));

    const decisionSummary = decisions.map((d) => ({
      title: d.title,
      reason: d.reason,
    }));

    // Record AI interaction activity
    await activityService.logActivity(
      'SYSTEM_EVENT',
      'Gemini Orchestrator',
      `Planning command received: "${params.userCommand}"`,
      params.projectId,
      { userCommand: params.userCommand }
    );

    // Call server API
    const response = await fetch('/api/ai/plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId: params.projectId,
        projectName: params.projectName,
        genre: params.genre,
        engine: params.engine,
        platform: params.platform,
        currentPhase: params.currentPhase,
        userCommand: params.userCommand,
        projectMemorySummary: memorySummary,
        existingTasks: taskSummary,
        decisions: decisionSummary,
        constraints: params.constraints,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Plan generation failed with HTTP ${response.status}`);
    }

    const planData: AIPlanResponse = await response.json();

    // Increment usage counter
    this.recordUsage(1, 'Google Gemini', 'gemini-3.8-flash');

    // Generate persistent plan record
    const existingPlans = this.getPlansForProject(params.projectId);
    const newVersion = existingPlans.length + 1;

    const newPlan: AIPlan = {
      planId: `plan-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      projectId: params.projectId,
      version: newVersion,
      request: params.userCommand,
      response: planData,
      status: 'PENDING_APPROVAL',
      createdAt: new Date().toISOString(),
    };

    this.savePlan(newPlan);

    // Record completion activity
    await activityService.logActivity(
      'SYSTEM_EVENT',
      'Game Architect',
      `Gemini proposed ${planData.tasks.length} tasks and ${planData.projectMemoryUpdates?.length || 0} memory updates for "${params.userCommand}" (Plan #${newVersion})`,
      params.projectId,
      { planId: newPlan.planId, version: newVersion }
    );

    return newPlan;
  }

  /**
   * Approves a plan and creates real Task, Memory, and Decision records
   */
  async approvePlan(params: {
    plan: AIPlan;
    selectedTaskIndices?: number[];
    approvedMemoryIndices?: number[];
    approvedDecisionIndices?: number[];
  }): Promise<{ createdTasks: Task[]; createdActivities: Activity[] }> {
    const { plan, selectedTaskIndices, approvedMemoryIndices, approvedDecisionIndices } = params;

    const allAgents = await agentService.getAgents();
    const createdTasks: Task[] = [];
    const createdActivities: Activity[] = [];

    // 1. Process tasks
    const tasksToCreate = plan.response.tasks.filter((_, idx) =>
      selectedTaskIndices ? selectedTaskIndices.includes(idx) : true
    );

    // Map task title to newly created ID for resolving dependencies
    const titleToIdMap = new Map<string, string>();

    for (const proposed of tasksToCreate) {
      // Find matching agent
      const matchedAgent = allAgents.find(
        (a) =>
          a.name.toLowerCase() === proposed.recommendedAgent.toLowerCase() ||
          a.role.toLowerCase().includes(proposed.recommendedAgent.toLowerCase())
      );

      const newTask = await taskService.createTask({
        projectId: plan.projectId,
        title: proposed.title,
        description: proposed.description,
        priority: proposed.priority,
        status: 'PLANNING',
        assignedAgentId: matchedAgent?.id || 'agent-architect',
        tags: ['AI-Planned', proposed.recommendedAgent.replace(/\s+/g, '-'), `Plan-#${plan.version}`],
        dependencies: [], // Will wire up in step 2
      });

      titleToIdMap.set(proposed.title.toLowerCase(), newTask.id);
      createdTasks.push(newTask);
    }

    // Resolve task dependencies
    for (let i = 0; i < tasksToCreate.length; i++) {
      const proposed = tasksToCreate[i];
      const createdTask = createdTasks[i];
      if (proposed.dependencies && proposed.dependencies.length > 0) {
        const resolvedDepIds: string[] = [];
        for (const depTitle of proposed.dependencies) {
          const id = titleToIdMap.get(depTitle.toLowerCase());
          if (id) {
            resolvedDepIds.push(id);
          }
        }
        if (resolvedDepIds.length > 0) {
          createdTask.dependencies = resolvedDepIds;
        }
      }
    }

    // 2. Process approved memory updates (only if approved)
    const proposedMemories = plan.response.projectMemoryUpdates || [];
    for (let i = 0; i < proposedMemories.length; i++) {
      const shouldApprove = approvedMemoryIndices ? approvedMemoryIndices.includes(i) : true;
      if (shouldApprove) {
        const pMem = proposedMemories[i];
        await memoryService.saveMemory({
          projectId: plan.projectId,
          category: pMem.category as any,
          title: pMem.title,
          content: pMem.content,
          tags: ['AI-Proposal', 'Approved-Plan'],
          authorAgent: 'Game Architect',
        });
      }
    }

    // 3. Process approved decisions (only if approved)
    const proposedDecisions = plan.response.decisions || [];
    for (let i = 0; i < proposedDecisions.length; i++) {
      const shouldApprove = approvedDecisionIndices ? approvedDecisionIndices.includes(i) : true;
      if (shouldApprove) {
        const pDec = proposedDecisions[i];
        await decisionService.createDecision({
          projectId: plan.projectId,
          title: pDec.title,
          reason: pDec.reason,
          createdBy: 'Game Architect (Approved)',
          status: 'ACTIVE',
        });
      }
    }

    // 4. Update plan status to APPROVED
    plan.status = 'APPROVED';
    plan.approvedAt = new Date().toISOString();
    this.savePlan(plan);

    // 5. Log plan approval activity & record development history
    await memoryExtractionService.addHistoryEvent({
      projectId: plan.projectId,
      eventType: 'TASK_COMPLETED',
      title: `Plan #${plan.version} Approved & Queued`,
      description: `Approved ${createdTasks.length} tasks and ${proposedDecisions.length} decisions for request: "${plan.request}".`,
      sourceId: plan.planId,
      sourceType: 'PLAN',
      actor: 'Human Lead',
    });

    const approvalAct = await activityService.logActivity(
      'SYSTEM_EVENT',
      'Human Lead',
      `Plan #${plan.version} approved: Created ${createdTasks.length} tasks ready in the execution queue.`,
      plan.projectId,
      { planId: plan.planId, tasksCreated: createdTasks.length }
    );
    createdActivities.push(approvalAct);

    return { createdTasks, createdActivities };
  }

  /**
   * Rejects a plan
   */
  async rejectPlan(planId: string, projectId: string): Promise<void> {
    const plans = this.getPlansForProject(projectId);
    const plan = plans.find((p) => p.planId === planId);
    if (plan) {
      plan.status = 'REJECTED';
      plan.rejectedAt = new Date().toISOString();
      this.savePlan(plan);

      await activityService.logActivity(
        'SYSTEM_EVENT',
        'Human Lead',
        `Development plan #${plan.version} was rejected by human operator. No project files or tasks were altered.`,
        projectId,
        { planId: plan.planId }
      );
    }
  }

  /**
   * Local storage persistence for plans per project
   */
  getPlansForProject(projectId: string): AIPlan[] {
    try {
      const raw = localStorage.getItem(`ai_plans_${projectId}`);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  getPlanById(projectId: string, planId: string): AIPlan | undefined {
    return this.getPlansForProject(projectId).find((p) => p.planId === planId);
  }

  savePlan(plan: AIPlan): void {
    try {
      const plans = this.getPlansForProject(plan.projectId);
      const index = plans.findIndex((p) => p.planId === plan.planId);
      if (index >= 0) {
        plans[index] = plan;
      } else {
        plans.unshift(plan);
      }
      localStorage.setItem(`ai_plans_${plan.projectId}`, JSON.stringify(plans));
    } catch (e) {
      console.warn('Could not persist plan to local storage', e);
    }
  }

  /**
   * Usage Information Tracking
   */
  getUsageInfo(): AIUsageInfo {
    try {
      const raw = localStorage.getItem(USAGE_STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {}

    return {
      sessionRequests: 0,
      todayRequests: 0,
      estimatedTokens: 'Usage information unavailable.',
      provider: 'Google Gemini',
      model: 'gemini-3.8-flash',
    };
  }

  recordUsage(requestsCount = 1, provider = 'Google Gemini', model = 'gemini-3.8-flash'): AIUsageInfo {
    const current = this.getUsageInfo();
    const updated: AIUsageInfo = {
      sessionRequests: (current.sessionRequests || 0) + requestsCount,
      todayRequests: (current.todayRequests || 0) + requestsCount,
      estimatedTokens: 'Usage information unavailable.',
      lastRequestTime: new Date().toLocaleTimeString(),
      provider,
      model,
    };
    try {
      localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
    return updated;
  }
}

export const aiPlanService = new AIPlanService();
