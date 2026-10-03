import {
  QARun,
  QATest,
  QAIssue,
  QAReportStatus,
  BuildJob,
  PreviewSession,
} from '../../types';
import { previewService } from '../preview/previewService';

class QAAgentService {
  private runs: Map<string, QARun> = new Map();
  private issues: Map<string, QAIssue> = new Map();
  private listeners: Set<(runs: QARun[]) => void> = new Set();
  private issueListeners: Set<(issues: QAIssue[]) => void> = new Set();

  constructor() {
    this.initSeedData();
  }

  private initSeedData() {
    const seedRun: QARun = {
      id: 'qarun-seed-141',
      runNumber: 1,
      projectId: 'proj-1',
      buildId: 'build-141',
      status: 'PASS',
      totalTests: 6,
      passedTests: 6,
      failedTests: 0,
      warningTests: 0,
      functionalTests: [
        {
          id: 'qa-t1',
          name: 'Launch Game & Engine Init',
          category: 'Functional',
          description: 'Verify Godot 4.3 WebAssembly harness boots correctly without fatal exceptions.',
          status: 'PASS',
          durationMs: 420,
          logs: ['Wasm engine boot OK', 'Audio server initialized', 'Viewport 1280x720 confirmed'],
        },
        {
          id: 'qa-t2',
          name: 'Load Main Menu & Settings',
          category: 'Functional',
          description: 'Verify title UI responds to click and navigation signals.',
          status: 'PASS',
          durationMs: 180,
          logs: ['Title scene loaded', 'Input manager active'],
        },
      ],
      runtimeErrors: [],
      visualChecks: [
        { name: 'UI Alignment', status: 'PASS', details: 'No clipping detected across standard viewports.' },
        { name: 'Textures & Models', status: 'PASS', details: 'All 3D models and materials loaded without placeholder pink checkers.' },
      ],
      performance: {
        fps: 60,
        frameTimeMs: 16.6,
        memoryMB: 135,
        status: 'GOOD',
      },
      assets: [
        { name: 'RiftOrb_Icon.png', status: 'OK' },
        { name: 'Luminafox_Mesh.glb', status: 'OK' },
      ],
      recommendations: ['Enable mipmapping on terrain textures for lower-end GPUs.'],
      knownIssues: [],
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      durationSeconds: 12,
    };
    this.runs.set(seedRun.id, seedRun);
  }

  getRuns(projectId?: string): QARun[] {
    const list = Array.from(this.runs.values());
    if (projectId) {
      return list.filter((r) => r.projectId === projectId).sort((a, b) => b.runNumber - a.runNumber);
    }
    return list.sort((a, b) => b.runNumber - a.runNumber);
  }

  getRunById(id: string): QARun | undefined {
    return this.runs.get(id);
  }

  getIssues(projectId?: string): QAIssue[] {
    const list = Array.from(this.issues.values());
    if (projectId) {
      return list.filter((i) => i.projectId === projectId).sort((a, b) => b.issueNumber - a.issueNumber);
    }
    return list.sort((a, b) => b.issueNumber - a.issueNumber);
  }

  getIssueById(id: string): QAIssue | undefined {
    return this.issues.get(id);
  }

  createIssue(issueData: Partial<QAIssue> & { projectId: string; title: string }): QAIssue {
    const existing = this.getIssues(issueData.projectId);
    const nextIssueNum = existing.length > 0 ? Math.max(...existing.map((i) => i.issueNumber)) + 1 : 1;

    const issue: QAIssue = {
      id: issueData.id || `issue-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      issueNumber: nextIssueNum,
      projectId: issueData.projectId,
      buildId: issueData.buildId || 'build-141',
      qaRunId: issueData.qaRunId || 'qarun-seed-141',
      severity: issueData.severity || 'HIGH',
      title: issueData.title,
      description: issueData.description || '',
      evidence: issueData.evidence || {
        type: 'Runtime error',
        description: issueData.description || 'Reported runtime defect',
      },
      affectedFiles: issueData.affectedFiles || [],
      status: issueData.status || 'OPEN',
      createdAt: issueData.createdAt || new Date().toISOString(),
    };

    this.issues.set(issue.id, issue);
    this.notifyIssues();
    return issue;
  }

  updateIssueStatus(issueId: string, status: QAIssue['status'], resolvedAt?: string): void {
    const issue = this.issues.get(issueId);
    if (!issue) return;
    issue.status = status;
    if (status === 'RESOLVED') {
      issue.resolvedAt = resolvedAt || new Date().toISOString();
    }
    this.notifyIssues();
  }

  // --- Run Automated QA Suite on Build / Preview ---
  async runAutomatedQA(
    projectId: string,
    build: BuildJob,
    session?: PreviewSession | null,
    isAfterFix: boolean = false
  ): Promise<QARun> {
    const runs = this.getRuns(projectId);
    const nextRunNumber = runs.length > 0 ? Math.max(...runs.map((r) => r.runNumber)) + 1 : 2;

    const previewId = session?.id || previewService.getActiveSession()?.id;

    // Define test suite for Embervale Creature Capture system
    const functionalTests: QATest[] = [
      {
        id: `t-launch-${Date.now()}`,
        name: 'Launch Game & Mount Canvas',
        category: 'Functional',
        description: 'Verify web runtime starts, compiles shaders, and renders the first frame within 3 seconds.',
        status: 'PASS',
        durationMs: 310,
        logs: ['Viewport attached', 'Renderer: WebGL 2.0 / Compatibility', 'Main loop running at 60 FPS'],
      },
      {
        id: `t-menu-${Date.now()}`,
        name: 'Load Main Menu & Save Slot',
        category: 'Functional',
        description: 'Check save system loads previous progression without corruption.',
        status: 'PASS',
        durationMs: 220,
        logs: ['Save slot 1 loaded: Level 8 Rift Tamer', 'Inventory populated (5 Rift Orbs)'],
      },
      {
        id: `t-spawn-${Date.now()}`,
        name: 'Encounter Wild Rift Creature',
        category: 'Gameplay',
        description: 'Verify CreatureNode instantiation and state machine transitions to WILD_AGGRO.',
        status: 'PASS',
        durationMs: 450,
        logs: ['Spawned Luminafox (Lvl 5, HP: 48/50)', 'Target lock acquire signal emitted'],
      },
      {
        id: `t-orb-${Date.now()}`,
        name: 'Select & Throw Rift Orb',
        category: 'Functional',
        description: 'Test projectile launch arc, collision detection with wild creature, and inventory decrement.',
        status: 'PASS',
        durationMs: 620,
        logs: [
          'Player consumed 1x Rift Orb Tier 1',
          'RiftOrbProjectile launched with launch_arc_to()',
          'Impact registered at Vector3(12.4, 0.8, -4.2)',
        ],
      },
      {
        id: `t-calc-${Date.now()}`,
        name: 'CaptureManager Probability Math',
        category: 'Functional',
        description: 'Verify calculate_capture_rate() computes valid probability between 0.05 and 0.95.',
        status: 'PASS',
        durationMs: 140,
        logs: [
          'Calculated catch rate: 0.428 (HP factor: 0.72, Orb potency: 1.5)',
          'RNG roll: 0.381 <= 0.428 -> Capture Success',
        ],
      },
    ];

    // IF NOT fixed yet, introduce the realistic bug found in creature database persistence!
    if (!isAfterFix) {
      // Test 6 fails due to uninitialized captured_history in CreatureDatabase.gd!
      functionalTests.push({
        id: `t-persist-${Date.now()}`,
        name: 'Persist Capture to CreatureDatabase',
        category: 'Runtime',
        description: 'Verify register_capture_event() stores caught specimen into persistent Pokedex record.',
        status: 'FAIL',
        durationMs: 190,
        evidence: {
          type: 'Runtime error',
          description: 'Null reference on captured_history array before register_capture_event() invocation.',
          file: 'src/database/CreatureDatabase.gd',
          line: 142,
          rawData: 'Invalid call to method "append" on base null instance "captured_history".',
        },
        logs: [
          'Calling CreatureDatabase.register_capture_event("luminafox_01", "tier_1")',
          'ERROR: Invalid call. Array captured_history is null on uninitialized save state.',
          'Stack backtrace: CreatureDatabase.gd:142 -> CreatureCapture.gd:44',
        ],
      });
    } else {
      // Test 6 PASSES after fix!
      functionalTests.push({
        id: `t-persist-${Date.now()}`,
        name: 'Persist Capture to CreatureDatabase',
        category: 'Runtime',
        description: 'Verify register_capture_event() safely handles uninitialized array and saves Pokedex record.',
        status: 'PASS',
        durationMs: 180,
        logs: [
          'Calling CreatureDatabase.register_capture_event("luminafox_01", "tier_1")',
          'Null safe-guard verified: initialized captured_history = []',
          'Appended specimen record with timestamp 2026-09-20T05:55:00',
          'Pokedex record saved successfully to user://save_data.bin',
        ],
      });
    }

    // Add UI visual check
    functionalTests.push({
      id: `t-ui-${Date.now()}`,
      name: 'Rift Capture HUD & Wobble Animation',
      category: 'Visual',
      description: 'Ensure capture stasis particles and wobble shake animation render properly.',
      status: 'PASS',
      durationMs: 380,
      logs: ['Capture wobble animation frame count: 3 shakes', 'Particle system emit count: 48 particles'],
    });

    const failedCount = functionalTests.filter((t) => t.status === 'FAIL').length;
    const warningCount = functionalTests.filter((t) => t.status === 'WARNING').length;
    const passedCount = functionalTests.filter((t) => t.status === 'PASS').length;

    const overallStatus: QAReportStatus = failedCount > 0 ? 'FAIL' : warningCount > 0 ? 'PASS_WITH_WARNINGS' : 'PASS';

    const qaRun: QARun = {
      id: `qarun-${Date.now()}`,
      runNumber: nextRunNumber,
      projectId,
      buildId: build.id,
      previewId,
      status: overallStatus,
      totalTests: functionalTests.length,
      passedTests: passedCount,
      failedTests: failedCount,
      warningTests: warningCount,
      functionalTests,
      runtimeErrors: failedCount > 0
        ? [
            {
              id: `err-${Date.now()}`,
              projectId,
              previewId: previewId || 'none',
              buildId: build.id,
              severity: 'HIGH',
              message: 'Null reference on captured_history in CreatureDatabase.gd:142',
              stackTrace: 'at src/database/CreatureDatabase.gd:142\n  at src/creatures/CreatureCapture.gd:44\n  at src/systems/CaptureManager.gd:52',
              file: 'src/database/CreatureDatabase.gd',
              line: 142,
              timestamp: new Date().toLocaleTimeString(),
              occurrences: 3,
              firstSeen: '10:43',
              lastSeen: '10:48',
            },
          ]
        : [],
      visualChecks: [
        { name: 'Capture HUD Layout', status: 'PASS', details: 'Orb selection icons and trajectory arc aligned with camera viewport.' },
        { name: 'Entity Mesh & Animation', status: 'PASS', details: 'Creature wobble shake state renders smoothly at 60 FPS.' },
      ],
      performance: {
        fps: 59,
        frameTimeMs: 16.9,
        memoryMB: 142,
        status: 'GOOD',
      },
      assets: [
        { name: 'res://items/RiftOrb.gd', status: 'OK' },
        { name: 'res://systems/CaptureManager.gd', status: 'OK' },
        { name: 'res://database/CreatureDatabase.gd', status: 'OK' },
      ],
      recommendations: failedCount > 0
        ? [
            'Null safe-check must be added to CreatureDatabase.gd before accessing captured_history.',
            'Trigger Debug Agent Root Cause Analysis to generate fix task.',
          ]
        : [
            'Capture loop regression verified. System ready for Tier 2 Orbs content expansion.',
          ],
      knownIssues: failedCount > 0 ? ['CreatureDatabase null reference on initial capture record'] : [],
      createdAt: new Date().toISOString(),
      durationSeconds: 9,
    };

    this.runs.set(qaRun.id, qaRun);

    // If there is a failure and no open issue exists, automatically create a QA Issue!
    if (failedCount > 0) {
      const existingIssues = this.getIssues(projectId);
      const nextIssueNum = existingIssues.length > 0 ? Math.max(...existingIssues.map((i) => i.issueNumber)) + 1 : 1;

      const issue: QAIssue = {
        id: `issue-${Date.now()}`,
        issueNumber: nextIssueNum,
        projectId,
        buildId: build.id,
        previewId,
        qaRunId: qaRun.id,
        severity: 'HIGH',
        title: 'Creature capture crashes when saving Pokedex record',
        description: 'Attempting to capture a creature triggers a null reference exception in CreatureDatabase.gd:142 because captured_history is not initialized on fresh game sessions.',
        evidence: {
          type: 'Runtime error',
          description: 'Null reference on captured_history array before register_capture_event()',
          file: 'src/database/CreatureDatabase.gd',
          line: 142,
          rawData: 'Invalid call to method "append" on base null instance "captured_history".',
        },
        affectedFiles: ['src/database/CreatureDatabase.gd'],
        status: 'OPEN',
        createdAt: new Date().toISOString(),
      };

      this.issues.set(issue.id, issue);
      this.notifyIssues();
    }

    this.notifyRuns();
    return qaRun;
  }

  // --- Subscriptions ---
  subscribeRuns(listener: (runs: QARun[]) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  subscribeIssues(listener: (issues: QAIssue[]) => void): () => void {
    this.issueListeners.add(listener);
    return () => this.issueListeners.delete(listener);
  }

  private notifyRuns() {
    const all = this.getRuns();
    this.listeners.forEach((l) => l(all));
  }

  private notifyIssues() {
    const all = this.getIssues();
    this.issueListeners.forEach((l) => l(all));
  }
}

export const qaAgentService = new QAAgentService();
