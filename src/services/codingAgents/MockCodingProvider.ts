import {
  CodingTaskContext,
  CodebaseAnalysis,
  Workspace,
  CodingPlan,
  FileChange,
  TestRun,
  ImplementationSummary,
} from '../../types';
import { CodingAgentProvider } from './CodingAgentProvider';

export class MockCodingProvider implements CodingAgentProvider {
  id = 'mock';
  name = 'Sandboxed Local Agent';
  model = 'Deterministic Virtual Code Engine';

  async analyzeTask(context: CodingTaskContext): Promise<CodebaseAnalysis> {
    const isCreatureCapture =
      context.taskTitle.toLowerCase().includes('creature') ||
      context.taskTitle.toLowerCase().includes('capture') ||
      context.taskTitle.toLowerCase().includes('rift');

    if (isCreatureCapture) {
      return {
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
      };
    }

    return {
      detectedTechnology: 'Godot Engine 4.3 / C#',
      relevantFiles: [
        `src/systems/${context.taskTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}.gd`,
        'src/core/GameManager.gd',
      ],
      dependencies: ['GameManager.gd', 'EventBus.gd'],
      existingPatterns: ['Event-driven architecture', 'Node lifecycle hooks'],
      potentialConflicts: ['Check node tree lifecycle timing'],
      requiredChanges: [
        `Implement logic for ${context.taskTitle}`,
        'Bind events to global EventBus',
      ],
    };
  }

  async prepareWorkspace(context: CodingTaskContext): Promise<Workspace> {
    const slug = context.taskTitle
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .substring(0, 30);
    const branchName = `task/${context.taskId.replace('task-', '')}-${slug}`;

    return {
      workspaceId: `ws-${Date.now()}-${context.taskId}`,
      projectId: context.projectId,
      repositoryId: context.repository.id,
      branch: branchName,
      baseBranch: context.repository.developmentBranch || 'ai-development',
      allowedPaths: context.allowedPaths.length > 0 ? context.allowedPaths : ['src/'],
      forbiddenPaths: ['.env', 'credentials/', 'auth/', 'deploy/'],
      createdAt: new Date().toISOString(),
      lastSyncedAt: new Date().toISOString(),
      status: 'ACTIVE',
    };
  }

  async generatePlan(context: CodingTaskContext, analysis: CodebaseAnalysis): Promise<CodingPlan> {
    const isCreatureCapture =
      context.taskTitle.toLowerCase().includes('creature') ||
      context.taskTitle.toLowerCase().includes('capture') ||
      context.taskTitle.toLowerCase().includes('rift');

    if (isCreatureCapture) {
      return {
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
        rationale:
          'Create a dedicated CaptureManager node to decouple orb projectile flight math from creature AI states, and enforce strict server/client capture rates.',
        status: 'PENDING_APPROVAL',
      };
    }

    return {
      filesToModify: analysis.relevantFiles.slice(0, 2),
      filesToCreate: [`src/systems/${context.taskId.replace('task-', '')}_controller.gd`],
      testsToRun: ['test_component_lifecycle', 'test_event_dispatch'],
      rationale: `Implements requirements for ${context.taskTitle} with isolated unit test coverage.`,
      status: 'PENDING_APPROVAL',
    };
  }

  async implementTask(
    context: CodingTaskContext,
    plan: CodingPlan
  ): Promise<{ fileChanges: FileChange[]; diff: string; summary: ImplementationSummary }> {
    const isCreatureCapture =
      context.taskTitle.toLowerCase().includes('creature') ||
      context.taskTitle.toLowerCase().includes('capture') ||
      context.taskTitle.toLowerCase().includes('rift');

    if (isCreatureCapture) {
      const fileChanges: FileChange[] = [
        {
          id: 'fc-1',
          path: 'src/systems/CaptureManager.gd',
          changeType: 'CREATED',
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
          changeType: 'MODIFIED',
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
          changeType: 'MODIFIED',
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
          changeType: 'MODIFIED',
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

      const fullDiff = this.generateDiff(fileChanges);
      const summary = await this.summarizeChanges(context, fileChanges);

      return {
        fileChanges,
        diff: fullDiff,
        summary,
      };
    }

    const fileChanges: FileChange[] = [
      {
        id: 'fc-gen-1',
        path: `src/systems/${context.taskId.replace('task-', '')}.gd`,
        changeType: 'CREATED',
        linesAdded: 35,
        linesRemoved: 0,
        language: 'gdscript',
        diff: `@@ -0,0 +1,35 @@
+class_name TaskImplementation
+extends Node
+
+# Implemented for ${context.taskTitle}
+func _ready() -> void:
+	print("System initialized for ${context.taskTitle}")`,
      },
    ];

    const fullDiff = this.generateDiff(fileChanges);
    const summary = await this.summarizeChanges(context, fileChanges);

    return { fileChanges, diff: fullDiff, summary };
  }

  async runTests(context: CodingTaskContext, changes: FileChange[]): Promise<TestRun> {
    const isCreatureCapture =
      context.taskTitle.toLowerCase().includes('creature') ||
      context.taskTitle.toLowerCase().includes('capture') ||
      context.taskTitle.toLowerCase().includes('rift');

    if (isCreatureCapture) {
      return {
        id: `testrun-${Date.now()}`,
        attemptId: `attempt-${context.attemptNumber}`,
        taskId: context.taskId,
        timestamp: new Date().toISOString(),
        passedCount: 4,
        failedCount: 0,
        warningCount: 0,
        durationMs: 78,
        status: 'PASSED',
        tests: [
          {
            id: 't-1',
            name: 'test_capture_probability_formula',
            durationMs: 14,
            status: 'PASSED',
          },
          {
            id: 't-2',
            name: 'test_capture_success_event',
            durationMs: 22,
            status: 'PASSED',
          },
          {
            id: 't-3',
            name: 'test_capture_failure_breakout',
            durationMs: 18,
            status: 'PASSED',
          },
          {
            id: 't-4',
            name: 'test_rift_orb_inventory_depletion',
            durationMs: 24,
            status: 'PASSED',
          },
        ],
        logs: [
          '[GUT 9.2.1] Initializing Godot Unit Test Runner...',
          '[GUT] Loaded suite res://test/unit/test_capture_manager.gd',
          '✓ test_capture_probability_formula passed (14ms)',
          '✓ test_capture_success_event passed (22ms)',
          '✓ test_capture_failure_breakout passed (18ms)',
          '✓ test_rift_orb_inventory_depletion passed (24ms)',
          '[GUT] All 4 tests PASSED with 0 errors.',
        ],
      };
    }

    return {
      id: `testrun-${Date.now()}`,
      attemptId: `attempt-${context.attemptNumber}`,
      taskId: context.taskId,
      timestamp: new Date().toISOString(),
      passedCount: 2,
      failedCount: 0,
      warningCount: 0,
      durationMs: 45,
      status: 'PASSED',
      tests: [
        { id: 't-gen-1', name: 'test_component_lifecycle', durationMs: 20, status: 'PASSED' },
        { id: 't-gen-2', name: 'test_event_dispatch', durationMs: 25, status: 'PASSED' },
      ],
      logs: [
        'Running unit verification tests...',
        '✓ test_component_lifecycle passed (20ms)',
        '✓ test_event_dispatch passed (25ms)',
      ],
    };
  }

  generateDiff(changes: FileChange[]): string {
    return changes
      .map((c) => {
        const header = `diff --git a/${c.path} b/${c.path}\n--- a/${c.path}\n+++ b/${c.path}\n`;
        return header + c.diff;
      })
      .join('\n\n');
  }

  async summarizeChanges(
    context: CodingTaskContext,
    changes: FileChange[],
    testRun?: TestRun
  ): Promise<ImplementationSummary> {
    return {
      whatChanged:
        'Architected and implemented the core creature capture mechanics with CaptureManager.gd node, projectile velocity arcs for Rift Orbs, health-scaled probability math, and pokedex persistence.',
      why: 'Enables players to capture wild Rift creatures in Embervale using tiered Rift Orbs while adhering to Godot 4.3 Node3D state machine standards.',
      filesChanged: changes.map((c) => `${c.path} (${c.changeType}, +${c.linesAdded}/-${c.linesRemoved})`),
      potentialRisks: [
        'Simultaneous orb throws in dense creature packs could trigger race conditions if target lock is lost mid-flight.',
        'Extremely low creature HP may approach the 95% maximum catch probability cap.',
      ],
      testsAdded: [
        'test_capture_probability_formula',
        'test_capture_success_event',
        'test_capture_failure_breakout',
        'test_rift_orb_inventory_depletion',
      ],
      testsExecuted: testRun
        ? testRun.tests.map((t) => `${t.name}: ${t.status}`)
        : ['All test cases executed in sandboxed Godot environment'],
      knownLimitations: [
        'Tier 2 (Hyper Rift Orb) and Master Astral Orbs will require sprite asset integration in Phase 5.',
        'Audio SFX triggers rely on placeholder bus events.',
      ],
    };
  }
}
