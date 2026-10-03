import {
  AgentLearning,
  DevelopmentHistoryEvent,
  MemoryCategory,
} from '../types';
import { memoryService } from './memoryService';
import { decisionService } from './decisionService';
import { knowledgeConflictService } from './knowledgeConflictService';
import { activityService } from './activityService';

class MemoryExtractionService {
  private learnings: Map<string, AgentLearning[]> = new Map();
  private historyEvents: Map<string, DevelopmentHistoryEvent[]> = new Map();

  constructor() {
    // Seed initial development history events for Embervale
    this.historyEvents.set('proj-embervale', [
      {
        id: 'hist-1',
        projectId: 'proj-embervale',
        eventType: 'PROJECT_CREATED',
        title: 'Project Initialized: Embervale: Rift Tamers',
        description: 'Initialized 3D monster-taming RPG with Godot 4.3 WebAssembly target.',
        timestamp: '2026-09-10T08:00:00Z',
        sourceId: 'proj-embervale',
        sourceType: 'PROJECT',
        actor: 'Lead Game Architect',
      },
      {
        id: 'hist-2',
        projectId: 'proj-embervale',
        eventType: 'CREATURE_ADDED',
        title: 'Creature Specification Added: Sparkit (#025)',
        description: 'Canon GDD specification established for Sparkit with Electric typing and Level 20 evolution.',
        timestamp: '2026-09-12T10:00:00Z',
        sourceId: 'doc-sparkit-spec',
        sourceType: 'DOCUMENT',
        actor: 'Creature Designer',
      },
      {
        id: 'hist-3',
        projectId: 'proj-embervale',
        eventType: 'ARCHITECTURE_CHANGED',
        title: 'Adopted Godot 4.3 WebGL2 Target',
        description: 'Configured COOP/COEP headers for multi-threaded WebAssembly mobile execution.',
        timestamp: '2026-09-14T11:00:00Z',
        sourceId: 'doc-tech-architecture',
        sourceType: 'DECISION',
        actor: 'Engine Programmer',
      },
      {
        id: 'hist-4',
        projectId: 'proj-embervale',
        eventType: 'ASSET_GENERATED',
        title: 'Sparkit 3D Model Generated & Rigged',
        description: 'Synthesized 3,400 polygon mesh with two-band cel shader and emissive cheeks.',
        timestamp: '2026-09-16T14:30:00Z',
        sourceId: 'asset-sparkit-model',
        sourceType: 'ASSET',
        actor: 'Asset Generation Agent',
      },
      {
        id: 'hist-5',
        projectId: 'proj-embervale',
        eventType: 'RESEARCH_ADDED',
        title: 'Researched Mobile Bone Blending Performance',
        description: 'Documented 4-bone influence ceiling to ensure 60 FPS in WebGL2.',
        timestamp: '2026-09-18T11:20:00Z',
        sourceId: 'res-godot-wasm-opt',
        sourceType: 'RESEARCH',
        actor: 'Research Agent',
      },
      {
        id: 'hist-6',
        projectId: 'proj-embervale',
        eventType: 'AGENT_LEARNED',
        title: 'Learned Texture Overdraw Limit in Capture Shaders',
        description: 'Transparent billboard particles during capture cause 8ms GPU spikes on mobile devices.',
        timestamp: '2026-09-18T16:00:00Z',
        sourceId: 'learn-1',
        sourceType: 'LEARNING',
        actor: 'QA Agent',
      },
      {
        id: 'hist-7',
        projectId: 'proj-embervale',
        eventType: 'QA_PASSED',
        title: 'Automated QA Suite Passed for Creature Movement',
        description: '14 test cases passed with 60 FPS locked in preview environment.',
        timestamp: '2026-09-19T10:00:00Z',
        sourceId: 'qa-run-140',
        sourceType: 'QA',
        actor: 'QA Agent',
      },
    ]);

    // Seed agent learnings
    this.learnings.set('proj-embervale', [
      {
        id: 'learn-1',
        projectId: 'proj-embervale',
        agentId: 'agent-qa',
        title: 'Mobile WebGL2 Particle Overdraw Bottleneck',
        learning: 'Transparent capture particle billboards cause frame time to spike from 14ms to 24ms on mobile Safari unless batched into CPUParticles3D.',
        evidence: 'QA Test Run #138 frame telemetry logs',
        confidence: 'VERIFIED',
        relatedTasks: ['task-142'],
        relatedRuns: ['run-qa-138'],
        createdAt: '2026-09-18T16:00:00Z',
        status: 'APPROVED',
      },
      {
        id: 'learn-2',
        projectId: 'proj-embervale',
        agentId: 'agent-coder',
        title: 'Godot 4.3 AnimationTree Node Cache Invalidation',
        learning: 'Switching battle camera cuts can drop animation callbacks if state machine is not queried inside _physics_process.',
        evidence: 'Bug #38 reproduction in task/142-creature-capture',
        confidence: 'HIGH_CONFIDENCE',
        relatedTasks: ['task-142'],
        relatedRuns: ['coding-run-91'],
        createdAt: '2026-09-19T09:30:00Z',
        status: 'APPROVED',
      },
    ]);
  }

  async getLearnings(projectId: string): Promise<AgentLearning[]> {
    return this.learnings.get(projectId) || [];
  }

  async getHistoryEvents(projectId: string): Promise<DevelopmentHistoryEvent[]> {
    return this.historyEvents.get(projectId) || [];
  }

  async addHistoryEvent(event: Omit<DevelopmentHistoryEvent, 'id' | 'timestamp'> & { id?: string; timestamp?: string }): Promise<DevelopmentHistoryEvent> {
    const fullEvent: DevelopmentHistoryEvent = {
      id: event.id || `hist-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      projectId: event.projectId,
      eventType: event.eventType,
      title: event.title,
      description: event.description,
      timestamp: event.timestamp || new Date().toISOString(),
      sourceId: event.sourceId,
      sourceType: event.sourceType,
      actor: event.actor,
      metadata: event.metadata,
    };

    const current = await this.getHistoryEvents(event.projectId);
    this.historyEvents.set(event.projectId, [fullEvent, ...current]);
    return fullEvent;
  }

  /**
   * Automatic extraction pipeline triggered post task completion
   */
  async extractMemoryFromRun(params: {
    projectId: string;
    agentId: string;
    taskTitle: string;
    executionSummary: string;
    filesModified: string[];
    learningsProposed?: string[];
  }): Promise<{
    learnings: AgentLearning[];
    historyEvent: DevelopmentHistoryEvent;
    detectedConflictsCount: number;
  }> {
    const createdLearnings: AgentLearning[] = [];

    // Extract structured learnings
    const proposed = params.learningsProposed || [
      `Completed ${params.taskTitle}. Verified isolated execution in ${params.filesModified.join(', ')}.`,
    ];

    for (const text of proposed) {
      const learning: AgentLearning = {
        id: `learn-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        projectId: params.projectId,
        agentId: params.agentId,
        title: `Learning from ${params.taskTitle}`,
        learning: text,
        evidence: `Files modified: ${params.filesModified.join(', ')}`,
        confidence: 'HIGH_CONFIDENCE',
        createdAt: new Date().toISOString(),
        status: 'APPROVED',
      };
      createdLearnings.push(learning);

      // Save as AGENT_LEARNINGS memory entry
      await memoryService.saveMemory({
        projectId: params.projectId,
        category: 'AGENT_LEARNINGS' as MemoryCategory,
        title: learning.title,
        content: learning.learning,
        tags: ['Agent Learning', params.taskTitle],
        authorAgent: params.agentId,
      });
    }

    const currentLearnings = await this.getLearnings(params.projectId);
    this.learnings.set(params.projectId, [...createdLearnings, ...currentLearnings]);

    // Record history event
    const historyEvent = await this.addHistoryEvent({
      projectId: params.projectId,
      eventType: 'TASK_COMPLETED',
      title: `Task Completed: ${params.taskTitle}`,
      description: params.executionSummary,
      sourceType: 'TASK',
      actor: params.agentId,
      metadata: { filesModified: params.filesModified },
    });

    // Check for any conflicts against existing memory
    const existingMems = await memoryService.getMemories(params.projectId);
    const conflicts = await knowledgeConflictService.detectConflicts(
      params.projectId,
      {
        title: params.taskTitle,
        content: params.executionSummary,
        source: params.agentId,
      },
      [],
      existingMems
    );

    await activityService.logActivity(
      'SYSTEM_EVENT',
      params.agentId,
      `Extracted ${createdLearnings.length} project learning(s) from "${params.taskTitle}"`,
      params.projectId
    );

    return {
      learnings: createdLearnings,
      historyEvent,
      detectedConflictsCount: conflicts.length,
    };
  }
}

export const memoryExtractionService = new MemoryExtractionService();
