import {
  CodingAttempt,
  CodingPlan,
  CodingTaskContext,
  CodebaseAnalysis,
  FileChange,
  TestRun,
  ImplementationSummary,
  Task,
  Project,
  CodingAgentProviderConfig,
  GitCommit,
  PullRequest,
  CodingLogEntry,
  TaskStatus,
} from '../../types';
import { CodingAgentProvider } from './CodingAgentProvider';
import { CodexProvider } from './CodexProvider';
import { GeminiCodingProvider } from './GeminiCodingProvider';
import { MockCodingProvider } from './MockCodingProvider';
import { sanitizeContextFiles, verifyPathInScope } from './securityUtils';
import { gitService } from '../gitService';
import { activityService } from '../activityService';

/**
 * Phase 4: Coding Agent Orchestrator Service
 * Coordinates coding task lifecycle, workspace isolation, human-in-the-loop approvals,
 * testing, diff generation, and git commit creation.
 */
class CodingAgentService {
  private providers: Map<string, CodingAgentProvider> = new Map();
  private activeProviderId = 'gemini';
  private attempts: Map<string, CodingAttempt[]> = new Map(); // taskId -> CodingAttempt[]
  private activeAttemptByTask: Map<string, string> = new Map(); // taskId -> attemptId
  private maxRetries = 3;

  constructor() {
    this.registerProvider(new MockCodingProvider());
    this.registerProvider(new GeminiCodingProvider());
    this.registerProvider(new CodexProvider());
    this.seedInitialAttempts();
  }

  private seedInitialAttempts() {
    const mock = new MockCodingProvider();
    const taskId = 'task-142';
    const projectId = 'proj-embervale';
    const repo = gitService.getRepositoryForProject(projectId);

    const workspace = {
      workspaceId: 'ws-init-task-142',
      projectId,
      repositoryId: repo.id,
      branch: 'task/142-creature-capture',
      baseBranch: repo.developmentBranch || 'ai-development',
      allowedPaths: ['src/creatures/', 'src/items/', 'src/database/', 'src/systems/'],
      forbiddenPaths: ['.env', 'credentials/', 'auth/'],
      createdAt: '2026-09-19T05:00:00.000Z',
      lastSyncedAt: '2026-09-19T05:05:00.000Z',
      status: 'ACTIVE' as const,
    };

    const plan: CodingPlan = {
      filesToModify: [
        'src/creatures/CreatureCapture.gd',
        'src/items/RiftOrb.gd',
        'src/database/CreatureDatabase.gd',
      ],
      filesToCreate: ['src/systems/CaptureManager.gd'],
      testsToRun: [
        'test_capture_probability_formula',
        'test_capture_success_event',
        'test_capture_failure_breakout',
        'test_rift_orb_inventory_depletion',
      ],
      rationale: 'Create a dedicated CaptureManager node to decouple orb projectile flight math from creature AI states, and enforce strict server/client capture rates.',
      status: 'APPROVED',
    };

    const fileChanges = [
      {
        id: 'fc-1',
        path: 'src/systems/CaptureManager.gd',
        changeType: 'CREATED' as const,
        linesAdded: 62,
        linesRemoved: 0,
        language: 'gdscript',
        diff: `@@ -0,0 +1,62 @@
+class_name CaptureManager
+extends Node
+
+signal capture_started(target_creature_id: String)
+signal capture_resolved(creature_id: String, success: bool, roll_value: float)
+signal capture_failed_breakout(creature_id: String, resistance: float)
+
+@export var base_catch_rate_multiplier: float = 1.25
+@export var rift_resonance_bonus: float = 0.15
+
+func calculate_capture_rate(max_hp: int, current_hp: int, catch_rate: float, orb_potency: float) -> float:
+	var hp_factor: float = (3.0 * float(max_hp) - 2.0 * float(current_hp)) / (3.0 * float(max_hp))
+	var status_bonus: float = 1.0
+	var final_rate: float = (hp_factor * catch_rate * orb_potency * status_bonus) / 255.0
+	return clampf(final_rate, 0.05, 0.95)
+
+func attempt_capture(creature: CreatureNode, orb: RiftOrbItem) -> bool:
+	if not creature or not orb:
+		push_error("Invalid capture parameters")
+		return false
+		
+	capture_started.emit(creature.creature_id)
+	var rate: float = calculate_capture_rate(
+		creature.max_health,
+		creature.current_health,
+		creature.base_catch_rate,
+		orb.potency_multiplier
+	)
+	
+	var roll: float = randf()
+	var success: bool = roll <= rate
+	
+	if success:
+		capture_resolved.emit(creature.creature_id, true, roll)
+		creature.on_captured_stasis()
+	else:
+		capture_failed_breakout.emit(creature.creature_id, 1.0 - rate)
+		creature.on_capture_escaped()
+		
+	return success`,
      },
      {
        id: 'fc-2',
        path: 'src/creatures/CreatureCapture.gd',
        changeType: 'MODIFIED' as const,
        linesAdded: 24,
        linesRemoved: 6,
        language: 'gdscript',
        diff: `@@ -18,6 +18,24 @@
-func handle_capture_hit(_orb_data: Dictionary) -> void:
-	# Placeholder capture logic
-	pass
+func handle_capture_hit(orb: RiftOrbItem) -> void:
+	var capture_mgr = get_node_or_null("/root/CaptureManager")
+	if not capture_mgr:
+		push_error("CaptureManager node missing from scene tree")
+		return
+		
+	is_in_capture_stasis = true
+	play_capture_wobble_animation()
+	
+	var success = capture_mgr.attempt_capture(self, orb)
+	if success:
+		emit_signal("captured", creature_id)
+	else:
+		is_in_capture_stasis = false
+		emit_signal("capture_broke_free")`,
      },
      {
        id: 'fc-3',
        path: 'src/items/RiftOrb.gd',
        changeType: 'MODIFIED' as const,
        linesAdded: 18,
        linesRemoved: 3,
        language: 'gdscript',
        diff: `@@ -8,3 +8,18 @@
-@export var orb_name: String = "Rift Orb"
+@export var orb_name: String = "Rift Orb Tier 1"
+@export var potency_multiplier: float = 1.5
+@export var rift_elemental_affinity: String = "Cosmic"
+
+func throw_orb(target_pos: Vector3) -> void:
+	var projectile = preload("res://scenes/projectiles/RiftOrbProjectile.tscn").instantiate()
+	get_tree().current_scene.add_child(projectile)
+	projectile.global_position = global_position
+	projectile.launch_arc_to(target_pos, 18.0)`,
      },
      {
        id: 'fc-4',
        path: 'src/database/CreatureDatabase.gd',
        changeType: 'MODIFIED' as const,
        linesAdded: 15,
        linesRemoved: 2,
        language: 'gdscript',
        diff: `@@ -34,2 +34,15 @@
+func register_capture_event(creature_id: String, orb_tier: String) -> void:
+	var timestamp = Time.get_datetime_string_from_system()
+	captured_history.append({
+		"creature_id": creature_id,
+		"orb_tier": orb_tier,
+		"timestamp": timestamp
+	})
+	save_pokedex_record(creature_id)`,
      },
    ];

    const testRun = {
      id: 'testrun-seed-142',
      attemptId: 'attempt-seed-142',
      taskId,
      timestamp: '2026-09-19T05:10:00.000Z',
      passedCount: 8,
      failedCount: 0,
      warningCount: 0,
      durationMs: 78,
      status: 'PASSED' as const,
      tests: [
        { id: 't-1', name: 'test_capture_probability_formula', durationMs: 12, status: 'PASSED' as const },
        { id: 't-2', name: 'test_capture_success_event', durationMs: 18, status: 'PASSED' as const },
        { id: 't-3', name: 'test_capture_failure_breakout', durationMs: 15, status: 'PASSED' as const },
        { id: 't-4', name: 'test_rift_orb_inventory_depletion', durationMs: 10, status: 'PASSED' as const },
        { id: 't-5', name: 'test_elemental_affinity_calculation', durationMs: 7, status: 'PASSED' as const },
        { id: 't-6', name: 'test_creature_stasis_state_transition', durationMs: 6, status: 'PASSED' as const },
        { id: 't-7', name: 'test_pokedex_persistence_record', durationMs: 5, status: 'PASSED' as const },
        { id: 't-8', name: 'test_multi_orb_concurrency_lock', durationMs: 5, status: 'PASSED' as const },
      ],
      logs: [
        '[GUT 9.2.1] Initializing Godot Unit Test Runner...',
        '[GUT] Loaded suite res://test/unit/test_capture_manager.gd',
        '✓ test_capture_probability_formula passed (12ms)',
        '✓ test_capture_success_event passed (18ms)',
        '✓ test_capture_failure_breakout passed (15ms)',
        '✓ test_rift_orb_inventory_depletion passed (10ms)',
        '✓ test_elemental_affinity_calculation passed (7ms)',
        '✓ test_creature_stasis_state_transition passed (6ms)',
        '✓ test_pokedex_persistence_record passed (5ms)',
        '✓ test_multi_orb_concurrency_lock passed (5ms)',
        '[GUT] All 8 tests PASSED with 0 errors.',
      ],
    };

    const initialAttempt: CodingAttempt = {
      attemptId: 'attempt-seed-142',
      attemptNumber: 1,
      taskId,
      agentId: 'agent-coding',
      providerId: 'gemini',
      workspace,
      status: 'REVIEW',
      analysis: {
        detectedTechnology: 'Godot 4.3 (GDScript & Scene Tree)',
        relevantFiles: [
          'src/creatures/CreatureCapture.gd',
          'src/items/RiftOrb.gd',
          'src/database/CreatureDatabase.gd',
          'src/player/PlayerInventory.gd',
        ],
        dependencies: [
          'PlayerInventory.gd',
          'BattleState.gd',
          'CreatureNode.gd',
          'RiftResonanceFormula.gd',
        ],
        existingPatterns: [
          'Node3D scene-based state machine',
          'Godot 4 typed signals (signal capture_completed(creature_id: String, success: bool))',
          'Normalized 0.0 - 1.0 probability threshold curve',
        ],
        potentialConflicts: [
          'Ensure player state is stasis-locked during orb throwing animation',
          'Prevent simultaneous capture attempts on single wild entity',
        ],
        requiredChanges: [
          'Implement projectile physics calculation for thrown RiftOrb',
          'Calculate capture rate formula based on creature current HP%, status effects, and rift multiplier',
          'Emit inventory decrement signal and persist captured creature to player roster',
        ],
      },
      plan,
      fileChanges,
      diff: mock.generateDiff(fileChanges),
      testRun,
      summary: {
        whatChanged:
          'Architected and implemented the core creature capture mechanics with CaptureManager.gd node, projectile velocity arcs for Rift Orbs, health-scaled probability math, and pokedex persistence.',
        why: 'Enables players to capture wild Rift creatures in Embervale using tiered Rift Orbs while adhering to Godot 4.3 Node3D state machine standards.',
        filesChanged: fileChanges.map((c) => `${c.path} (${c.changeType}, +${c.linesAdded}/-${c.linesRemoved})`),
        potentialRisks: [
          'Simultaneous orb throws in dense creature packs could trigger race conditions if target lock is lost mid-flight.',
          'Extremely low creature HP may approach the 95% maximum catch probability cap.',
        ],
        testsAdded: [
          'test_capture_probability_formula',
          'test_capture_success_event',
          'test_capture_failure_breakout',
          'test_rift_orb_inventory_depletion',
          'test_elemental_affinity_calculation',
          'test_creature_stasis_state_transition',
          'test_pokedex_persistence_record',
          'test_multi_orb_concurrency_lock',
        ],
        testsExecuted: [
          'test_capture_probability_formula: PASSED',
          'test_capture_success_event: PASSED',
          'test_capture_failure_breakout: PASSED',
          'test_rift_orb_inventory_depletion: PASSED',
          'test_elemental_affinity_calculation: PASSED',
          'test_creature_stasis_state_transition: PASSED',
          'test_pokedex_persistence_record: PASSED',
          'test_multi_orb_concurrency_lock: PASSED',
        ],
        knownLimitations: [
          'Tier 2 (Hyper Rift Orb) and Master Astral Orbs will require sprite asset integration in Phase 5.',
          'Audio SFX triggers rely on placeholder bus events.',
        ],
      },
      logs: [
        { timestamp: '05:00:00 AM', message: 'Task initiated on agent: Google Gemini Coding Agent (gemini-3.8-flash)', level: 'info' },
        { timestamp: '05:00:02 AM', message: 'Isolated workspace created on branch task/142-creature-capture', level: 'success' },
        { timestamp: '05:00:05 AM', message: 'Analyzing codebase AST, scene tree dependencies, and relevant patterns...', level: 'info' },
        { timestamp: '05:00:08 AM', message: 'Generated implementation plan: 3 files to modify, 1 to create. Approval required.', level: 'info' },
        { timestamp: '05:01:00 AM', message: 'Human operator approved implementation plan. Beginning code synthesis...', level: 'success' },
        { timestamp: '05:01:45 AM', message: 'Implementation completed: 4 files synthesized with unified diff.', level: 'success' },
        { timestamp: '05:02:00 AM', message: 'Running sandboxed test suite in Godot GUT runner...', level: 'info' },
        { timestamp: '05:02:05 AM', message: 'All 8 tests passed (78ms). Code review requested.', level: 'success' },
      ],
      retryCount: 0,
      createdAt: '2026-09-19T05:00:00.000Z',
    };

    this.attempts.set(taskId, [initialAttempt]);
    this.activeAttemptByTask.set(taskId, initialAttempt.attemptId);
  }

  registerProvider(provider: CodingAgentProvider) {
    this.providers.set(provider.id, provider);
  }

  setActiveProvider(id: string) {
    if (this.providers.has(id)) {
      this.activeProviderId = id;
    }
  }

  getActiveProvider(): CodingAgentProvider {
    return this.providers.get(this.activeProviderId) || this.providers.get('mock')!;
  }

  getProviderConfigs(): CodingAgentProviderConfig[] {
    return [
      {
        id: 'codex',
        name: 'OpenAI Codex Code Intelligence',
        providerType: 'Codex',
        model: 'gpt-4o-code / specialized coding agents',
        status: 'Architecture Ready',
        workspaceAccess: 'Sandboxed',
        lastUsed: 'Yesterday',
        description: 'Powers GDScript & C# generation, syntax verification, and shader writing.',
        isDefault: this.activeProviderId === 'codex',
      },
      {
        id: 'gemini',
        name: 'Google Gemini Coding Agent',
        providerType: 'Gemini',
        model: 'gemini-3.8-flash (Code Engine)',
        status: 'Connected',
        workspaceAccess: 'Sandboxed',
        lastUsed: 'Just now',
        description: 'Deep game design reasoning, node architecture decomposition, and GDScript implementation.',
        isDefault: this.activeProviderId === 'gemini',
      },
      {
        id: 'mock',
        name: 'Sandboxed Local Agent',
        providerType: 'Other',
        model: 'Deterministic Virtual Code Engine',
        status: 'Connected',
        workspaceAccess: 'Sandboxed',
        lastUsed: 'Active',
        description: 'Deterministic sandboxed local execution for offline development and safety checks.',
        isDefault: this.activeProviderId === 'mock',
      },
    ];
  }

  /**
   * Retrieves all attempts for a task
   */
  getAttemptsForTask(taskId: string): CodingAttempt[] {
    return this.attempts.get(taskId) || [];
  }

  /**
   * Retrieves the active attempt for a task
   */
  getActiveAttempt(taskId: string): CodingAttempt | undefined {
    const attemptId = this.activeAttemptByTask.get(taskId);
    if (!attemptId) {
      const taskAttempts = this.getAttemptsForTask(taskId);
      return taskAttempts[taskAttempts.length - 1];
    }
    return this.getAttemptById(attemptId);
  }

  getAttemptById(attemptId: string): CodingAttempt | undefined {
    for (const list of this.attempts.values()) {
      const found = list.find((a) => a.attemptId === attemptId);
      if (found) return found;
    }
    return undefined;
  }

  /**
   * Starts a coding task:
   * 1. Validates context and excludes secrets
   * 2. Prepares isolated workspace branch (e.g. task/142-creature-capture)
   * 3. Analyzes relevant codebase files
   * 4. Generates initial Coding Plan for human approval
   */
  async startCodingTask(
    task: Task,
    project: Project,
    options?: {
      relevantMemory?: string[];
      relevantDecisions?: string[];
      allowedPaths?: string[];
      forbiddenPaths?: string[];
      expectedBehavior?: string;
      testingRequirements?: string[];
    }
  ): Promise<CodingAttempt> {
    const provider = this.getActiveProvider();
    const repository = gitService.getRepositoryForProject(project.id);
    const existingAttempts = this.getAttemptsForTask(task.id);
    const attemptNumber = existingAttempts.length + 1;

    // Security: sanitize context paths and exclude secrets (.env, tokens, credentials)
    const rawPaths = options?.allowedPaths || ['src/creatures/', 'src/items/', 'src/database/', 'src/systems/'];
    const { safeFiles, excludedFiles } = sanitizeContextFiles(rawPaths);

    const logs: CodingLogEntry[] = [
      {
        timestamp: new Date().toLocaleTimeString(),
        message: `Task initiated on agent: ${provider.name} (${provider.model})`,
        level: 'info',
      },
      {
        timestamp: new Date().toLocaleTimeString(),
        message: `Isolated workspace requested for repository: ${repository.name}`,
        level: 'info',
      },
    ];

    if (excludedFiles.length > 0) {
      logs.push({
        timestamp: new Date().toLocaleTimeString(),
        message: `Sensitive files excluded from AI context: ${excludedFiles.join(', ')}`,
        level: 'warn',
      });
    }

    const context: CodingTaskContext = {
      projectId: project.id,
      taskId: task.id,
      taskTitle: task.title,
      taskDescription: task.description,
      relevantMemory: options?.relevantMemory || [],
      relevantDecisions: options?.relevantDecisions || [],
      constraints: ['Do not modify authentication or main branch', 'Target Godot 4.3 Node3D conventions'],
      dependencies: task.dependencies || [],
      expectedBehavior: options?.expectedBehavior || 'Functional capture flow using Rift Orbs with inventory depletion and probability rolls.',
      testingRequirements: options?.testingRequirements || ['Coverage for formula, success event, breakout event, and item consumption.'],
      allowedPaths: safeFiles,
      forbiddenPaths: options?.forbiddenPaths || ['.env', 'credentials/', 'auth/', 'deploy/'],
      repository,
      workspace: {
        workspaceId: `ws-${Date.now()}-${task.id}`,
        projectId: project.id,
        repositoryId: repository.id,
        branch: `task/${task.id.replace('task-', '')}-${task.title.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 24)}`,
        baseBranch: repository.developmentBranch || 'ai-development',
        allowedPaths: safeFiles,
        forbiddenPaths: ['.env', 'credentials/', 'auth/'],
        createdAt: new Date().toISOString(),
        lastSyncedAt: new Date().toISOString(),
        status: 'ACTIVE',
      },
      attemptNumber,
    };

    // Prepare Workspace
    const workspace = await provider.prepareWorkspace(context);
    logs.push({
      timestamp: new Date().toLocaleTimeString(),
      message: `Workspace created on branch: ${workspace.branch} (isolated from ${workspace.baseBranch})`,
      level: 'success',
    });

    // Analyze Codebase
    logs.push({
      timestamp: new Date().toLocaleTimeString(),
      message: 'Analyzing codebase AST, scene tree dependencies, and relevant patterns...',
      level: 'info',
    });
    const analysis = await provider.analyzeTask(context);
    logs.push({
      timestamp: new Date().toLocaleTimeString(),
      message: `Identified ${analysis.relevantFiles.length} relevant files and ${analysis.dependencies.length} dependencies.`,
      level: 'success',
    });

    // Generate Coding Plan
    logs.push({
      timestamp: new Date().toLocaleTimeString(),
      message: 'Generating structured coding implementation plan...',
      level: 'info',
    });
    const plan = await provider.generatePlan(context, analysis);
    logs.push({
      timestamp: new Date().toLocaleTimeString(),
      message: `Implementation plan ready: ${plan.filesToModify.length} to modify, ${plan.filesToCreate.length} to create. Approval required.`,
      level: 'info',
    });

    const attemptId = `attempt-${Date.now()}-${attemptNumber}`;
    const newAttempt: CodingAttempt = {
      attemptId,
      attemptNumber,
      taskId: task.id,
      agentId: 'agent-coding',
      providerId: provider.id,
      workspace,
      status: 'APPROVAL_REQUIRED',
      analysis,
      plan,
      fileChanges: [],
      diff: '',
      logs,
      retryCount: 0,
      createdAt: new Date().toISOString(),
    };

    const taskAttempts = this.attempts.get(task.id) || [];
    taskAttempts.push(newAttempt);
    this.attempts.set(task.id, taskAttempts);
    this.activeAttemptByTask.set(task.id, attemptId);

    // Telemetry & Activity Feed
    activityService.logActivity(
      'CODING_TASK_STARTED',
      'Coding Agent',
      `Started coding task "${task.title}"`,
      project.id,
      { taskId: task.id, branch: workspace.branch }
    );
    activityService.logActivity(
      'WORKSPACE_CREATED',
      'Workspace Manager',
      `Prepared isolated branch ${workspace.branch} from ${workspace.baseBranch}`,
      project.id,
      { branch: workspace.branch }
    );
    activityService.logActivity(
      'REPOSITORY_ANALYZED',
      'Coding Agent',
      `AST analysis completed: ${analysis.relevantFiles.length} files, ${analysis.dependencies.length} dependencies`,
      project.id,
      { taskId: task.id }
    );

    return newAttempt;
  }

  /**
   * Approves implementation plan and executes code changes and test suite
   */
  async approveImplementation(attemptId: string): Promise<CodingAttempt> {
    const attempt = this.getAttemptById(attemptId);
    if (!attempt || !attempt.plan) {
      throw new Error(`Attempt ${attemptId} not found or missing coding plan`);
    }

    const provider = this.providers.get(attempt.providerId) || this.getActiveProvider();

    // Mark plan approved & update status
    attempt.plan.status = 'APPROVED';
    attempt.status = 'IMPLEMENTING';
    attempt.logs.push({
      timestamp: new Date().toLocaleTimeString(),
      message: 'Human operator approved implementation plan. Beginning code synthesis...',
      level: 'success',
    });

    activityService.logActivity(
      'IMPLEMENTATION_STARTED',
      'Coding Agent',
      `Plan approved. Synthesizing changes for ${attempt.taskId}`,
      attempt.workspace.projectId,
      { attemptNumber: attempt.attemptNumber }
    );

    // Context reconstruction
    const context: CodingTaskContext = {
      projectId: attempt.workspace.projectId,
      taskId: attempt.taskId,
      taskTitle: 'Implementation',
      taskDescription: attempt.plan.rationale,
      relevantMemory: [],
      relevantDecisions: [],
      constraints: [],
      dependencies: [],
      expectedBehavior: '',
      testingRequirements: [],
      allowedPaths: attempt.workspace.allowedPaths,
      forbiddenPaths: attempt.workspace.forbiddenPaths,
      repository: gitService.getRepositoryForProject(attempt.workspace.projectId),
      workspace: attempt.workspace,
      attemptNumber: attempt.attemptNumber,
      previousFeedback: attempt.userFeedback,
    };

    // Perform Implementation
    const { fileChanges, diff, summary } = await provider.implementTask(context, attempt.plan);

    // Verify all file changes comply with security boundary
    for (const fc of fileChanges) {
      const check = verifyPathInScope(fc.path, attempt.workspace.allowedPaths, attempt.workspace.forbiddenPaths);
      if (!check.allowed) {
        attempt.status = 'FAILED';
        attempt.error = `Security Boundary Violation: ${check.reason}`;
        attempt.logs.push({
          timestamp: new Date().toLocaleTimeString(),
          message: `Blocked unauthorized change to ${fc.path}: ${check.reason}`,
          level: 'error',
        });
        return attempt;
      }
    }

    attempt.fileChanges = fileChanges;
    attempt.diff = diff;
    attempt.summary = summary;
    attempt.logs.push({
      timestamp: new Date().toLocaleTimeString(),
      message: `Implementation completed: ${fileChanges.length} files synthesized with unified diff.`,
      level: 'success',
    });

    activityService.logActivity(
      'FILES_MODIFIED',
      'Coding Agent',
      `Synthesized ${fileChanges.length} files for ${attempt.taskId}`,
      attempt.workspace.projectId,
      { files: fileChanges.map((f) => f.path) }
    );

    // Run Automated Tests
    attempt.status = 'TESTING';
    attempt.logs.push({
      timestamp: new Date().toLocaleTimeString(),
      message: 'Running sandboxed test suite and syntax verification...',
      level: 'info',
    });

    activityService.logActivity(
      'TESTS_STARTED',
      'Test Runner',
      `Executing test suite on branch ${attempt.workspace.branch}`,
      attempt.workspace.projectId,
      { branch: attempt.workspace.branch }
    );

    const testRun = await provider.runTests(context, fileChanges);
    attempt.testRun = testRun;

    if (testRun.status === 'PASSED' && testRun.failedCount === 0) {
      attempt.status = 'REVIEW';
      attempt.logs.push({
        timestamp: new Date().toLocaleTimeString(),
        message: `All ${testRun.passedCount} tests passed (${testRun.durationMs}ms). Code review requested.`,
        level: 'success',
      });
      activityService.logActivity(
        'TESTS_PASSED',
        'Test Runner',
        `All ${testRun.passedCount} tests passed (${testRun.durationMs}ms)`,
        attempt.workspace.projectId,
        { passedCount: testRun.passedCount }
      );
      activityService.logActivity(
        'REVIEW_REQUESTED',
        'Coding Agent',
        `Code changes ready for human review on branch ${attempt.workspace.branch}`,
        attempt.workspace.projectId,
        { attemptId: attempt.attemptId }
      );
    } else {
      attempt.status = 'FAILED';
      attempt.error = `${testRun.failedCount} tests failed. Automated debug loop initiated.`;
      attempt.logs.push({
        timestamp: new Date().toLocaleTimeString(),
        message: `Testing failed: ${testRun.failedCount} failed, ${testRun.passedCount} passed.`,
        level: 'error',
      });
      activityService.logActivity(
        'TESTS_FAILED',
        'Test Runner',
        `${testRun.failedCount} tests failed on ${attempt.workspace.branch}`,
        attempt.workspace.projectId,
        { failedCount: testRun.failedCount }
      );
    }

    return attempt;
  }

  /**
   * Request changes from user:
   * Creates a NEW attempt with operator feedback without overwriting previous attempts! (Section 22 & 23)
   */
  async requestChanges(attemptId: string, feedback: string): Promise<CodingAttempt> {
    const prevAttempt = this.getAttemptById(attemptId);
    if (!prevAttempt) {
      throw new Error(`Attempt ${attemptId} not found`);
    }

    const taskAttempts = this.getAttemptsForTask(prevAttempt.taskId);
    const newAttemptNumber = taskAttempts.length + 1;

    // Check debug loop limit (default: 3 retries max)
    if (newAttemptNumber > this.maxRetries + 1) {
      prevAttempt.status = 'FAILED';
      prevAttempt.logs.push({
        timestamp: new Date().toLocaleTimeString(),
        message: `Maximum automated retry limit (${this.maxRetries}) reached. Human review required.`,
        level: 'warn',
      });
      return prevAttempt;
    }

    const provider = this.providers.get(prevAttempt.providerId) || this.getActiveProvider();

    const newAttemptId = `attempt-${Date.now()}-${newAttemptNumber}`;
    const newLogs: CodingLogEntry[] = [
      {
        timestamp: new Date().toLocaleTimeString(),
        message: `Attempt #${newAttemptNumber} created from user review feedback.`,
        level: 'info',
      },
      {
        timestamp: new Date().toLocaleTimeString(),
        message: `Feedback received: "${feedback}"`,
        level: 'info',
      },
    ];

    const context: CodingTaskContext = {
      projectId: prevAttempt.workspace.projectId,
      taskId: prevAttempt.taskId,
      taskTitle: 'Refined Implementation',
      taskDescription: `${prevAttempt.plan?.rationale || ''}\nFeedback: ${feedback}`,
      relevantMemory: [],
      relevantDecisions: [],
      constraints: ['Apply human feedback faithfully'],
      dependencies: [],
      expectedBehavior: feedback,
      testingRequirements: ['Verify requested feedback changes pass unit tests'],
      allowedPaths: prevAttempt.workspace.allowedPaths,
      forbiddenPaths: prevAttempt.workspace.forbiddenPaths,
      repository: gitService.getRepositoryForProject(prevAttempt.workspace.projectId),
      workspace: prevAttempt.workspace,
      attemptNumber: newAttemptNumber,
      previousFeedback: feedback,
    };

    // Re-analyze and generate refined plan
    const analysis = await provider.analyzeTask(context);
    const plan = await provider.generatePlan(context, analysis);
    plan.rationale = `[Attempt #${newAttemptNumber}] Incorporating feedback: ${feedback}`;

    const refinedAttempt: CodingAttempt = {
      attemptId: newAttemptId,
      attemptNumber: newAttemptNumber,
      taskId: prevAttempt.taskId,
      agentId: prevAttempt.agentId,
      providerId: prevAttempt.providerId,
      workspace: prevAttempt.workspace,
      status: 'APPROVAL_REQUIRED',
      analysis,
      plan,
      fileChanges: [],
      diff: '',
      logs: newLogs,
      userFeedback: feedback,
      retryCount: prevAttempt.retryCount + 1,
      createdAt: new Date().toISOString(),
    };

    taskAttempts.push(refinedAttempt);
    this.activeAttemptByTask.set(prevAttempt.taskId, newAttemptId);

    activityService.logActivity(
      'REVIEW_REQUESTED',
      'Operator',
      `Requested revisions on attempt #${prevAttempt.attemptNumber}: "${feedback}"`,
      prevAttempt.workspace.projectId,
      { feedback, attemptNumber: newAttemptNumber }
    );

    return refinedAttempt;
  }

  /**
   * Commits the reviewed code changes to the task branch (Section 25, 26, 27)
   */
  async approveCommit(
    attemptId: string,
    commitMessage: string,
    author: string = 'Alex Vance <alex.vance@studio.dev>'
  ): Promise<{ commit: GitCommit; attempt: CodingAttempt }> {
    const attempt = this.getAttemptById(attemptId);
    if (!attempt) {
      throw new Error(`Attempt ${attemptId} not found`);
    }

    if (!attempt.testRun || attempt.testRun.status !== 'PASSED') {
      throw new Error('Safety Policy: Commits require passing test runs.');
    }

    const commit = gitService.createCommit({
      projectId: attempt.workspace.projectId,
      taskId: attempt.taskId,
      attemptId,
      branch: attempt.workspace.branch,
      message: commitMessage,
      author,
      filesChangedCount: attempt.fileChanges.length,
      testsPassedCount: attempt.testRun.passedCount,
    });

    attempt.status = 'COMPLETED';
    attempt.completedAt = new Date().toISOString();
    attempt.workspace.status = 'COMMITTED';
    attempt.logs.push({
      timestamp: new Date().toLocaleTimeString(),
      message: `Commit created: [${commit.shortHash}] "${commit.message}" on branch ${commit.branch}.`,
      level: 'success',
    });

    activityService.logActivity(
      'CHANGES_APPROVED',
      author,
      `Operator approved code changes for task ${attempt.taskId}`,
      attempt.workspace.projectId,
      { attemptId, filesCount: attempt.fileChanges.length }
    );

    activityService.logActivity(
      'COMMIT_CREATED',
      'Git Service',
      `Created commit [${commit.shortHash}] "${commit.message}" on ${commit.branch}`,
      attempt.workspace.projectId,
      { hash: commit.hash, branch: commit.branch }
    );

    return { commit, attempt };
  }

  /**
   * Creates a structured Pull Request preview for the committed task (Section 28)
   */
  createPullRequest(attemptId: string, prTitle?: string): PullRequest {
    const attempt = this.getAttemptById(attemptId);
    if (!attempt) {
      throw new Error(`Attempt ${attemptId} not found`);
    }

    const title = prTitle || `feat: ${attempt.plan?.rationale?.substring(0, 60) || 'implement coding task'}`;
    const pr = gitService.createPullRequest({
      projectId: attempt.workspace.projectId,
      title,
      sourceBranch: attempt.workspace.branch,
      targetBranch: attempt.workspace.baseBranch,
      summary: attempt.summary?.whatChanged || 'Implemented gameplay subsystem within isolated workspace.',
      changes: attempt.fileChanges.map((f) => `${f.path} (${f.changeType})`),
      tests: attempt.testRun?.tests.map((t) => `${t.name} (${t.status})`) || [],
      knownLimitations: attempt.summary?.knownLimitations || [],
    });

    attempt.logs.push({
      timestamp: new Date().toLocaleTimeString(),
      message: `Pull Request #${pr.prNumber} prepared for ${pr.targetBranch}. Awaiting human review.`,
      level: 'info',
    });

    activityService.logActivity(
      'PULL_REQUEST_CREATED',
      'Git Service',
      `Prepared Pull Request #${pr.prNumber} "${pr.title}" targeting ${pr.targetBranch}`,
      attempt.workspace.projectId,
      { prNumber: pr.prNumber, branch: pr.sourceBranch }
    );

    return pr;
  }
}

export const codingAgentService = new CodingAgentService();
