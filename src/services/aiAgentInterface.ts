import {
  AIAgentRequest,
  AIAgentResponse,
  ProjectMemorySnapshot,
} from '../types';
import { memoryService } from './memoryService';
import { taskService } from './taskService';

/**
 * Standardized AI Agent Dispatcher Contract (Phase 2 Interface)
 * Prepared for Phase 3 Gemini / Codex multi-agent orchestration.
 * In Phase 2, this provides strict typing, request construction with project memory snapshots,
 * and deterministic mock execution contracts.
 */
export interface IAIAgentRunner {
  dispatchTask(request: AIAgentRequest): Promise<AIAgentResponse>;
}

export class MockAIAgentRunner implements IAIAgentRunner {
  async dispatchTask(request: AIAgentRequest): Promise<AIAgentResponse> {
    const startTime = Date.now();

    // Simulated task execution contract
    return {
      status: 'SUCCESS',
      summary: `[Future AI Contract] Analyzed task "${request.taskDescription}" against ${request.projectMemory.entries.length} Project Memory records. Prepared architecture schema and code modifications.`,
      changes: [
        'Created isolated component controller class',
        'Injected physics collision raycaster with terrain delta compensation',
        'Registered state machine transitions in player action tree',
      ],
      filesChanged: [
        'scripts/player/player_controller.gd',
        'scripts/systems/capture_tether.gd',
        'scenes/characters/player.tscn',
      ],
      tests: [
        'test_capture_tether_stasis_duration',
        'test_player_controller_slope_descent',
        'test_radial_menu_input_mapping',
      ],
      errors: [],
      nextActions: [
        'Run test suite to verify physics tunneling patch',
        'Trigger automated CI artifact compilation in Godot 4.3',
      ],
      executionTimeMs: Date.now() - startTime,
    };
  }
}

export class AIAgentCoordinator {
  private runner: IAIAgentRunner;

  constructor(runner?: IAIAgentRunner) {
    this.runner = runner || new MockAIAgentRunner();
  }

  /**
   * Builds an AIAgentRequest from stored database records including a fresh Project Memory snapshot
   */
  async prepareAgentRequest(projectId: string, taskId: string): Promise<AIAgentRequest | null> {
    const task = await taskService.getTaskById(taskId);
    if (!task) return null;

    const memorySnapshot = await memoryService.getMemorySnapshot(projectId);

    return {
      projectId,
      taskId,
      projectMemory: memorySnapshot,
      taskDescription: task.description || task.title,
      constraints: memorySnapshot.constraints || ['Keep mobile draw calls under 120 per frame'],
    };
  }

  /**
   * Dispatches task to the AI runner interface
   */
  async executeTask(projectId: string, taskId: string): Promise<AIAgentResponse> {
    const request = await this.prepareAgentRequest(projectId, taskId);
    if (!request) {
      throw new Error(`Cannot prepare agent request: Task ${taskId} not found`);
    }

    return this.runner.dispatchTask(request);
  }
}

export const aiAgentCoordinator = new AIAgentCoordinator();
