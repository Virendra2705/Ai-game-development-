import { CrashReport, AICrashAnalysis } from '../types';
import { taskService } from './taskService';
import { qaAgentService } from './qa/qaAgentService';

export class CrashAnalysisService {
  private crashReports: Map<string, CrashReport[]> = new Map();

  constructor() {
    this.seedCrashes('proj-embervale');
  }

  private seedCrashes(projectId: string) {
    const analysis1: AICrashAnalysis = {
      likelyCause:
        'Null reference access during Sparkit entity capture resolution when entity is despawned in same tick as kinetic net collision.',
      evidence: [
        'Stack trace points to KineticNet.cs:line 84 inside OnTargetCaptured(Creature target)',
        'Recent commit 9f4d1c2 added fast-escape despawn timer (3.0s) to wild creature AI',
        'Frame timing profile indicates 16ms race condition between net trigger and despawn cleanup callback',
      ],
      affectedSystem: 'Creature Capture Subsystem & Kinematics',
      suggestedInvestigation:
        'Inspect CreatureCaptureController.cs and check if IsInstanceValid(target) or weak reference guard is missing before accessing target.ElementalAffinity.',
      potentialFix:
        'Add safe entity existence validation guard in KineticNet.cs: `if (!GodotObject.IsInstanceValid(target) || target.IsQueuedForDeletion()) return;`',
      confidence: 'LIKELY',
      analyzedAt: '2026-09-18T03:45:00Z',
    };

    const c1: CrashReport = {
      id: 'crash-001',
      projectId,
      releaseId: 'rel-embervale-v100',
      platform: 'Android',
      version: '1.0.0',
      errorType: 'System.NullReferenceException',
      message: 'Object reference not set to an instance of an object at KineticNet.OnTargetCaptured()',
      stackTrace: `System.NullReferenceException: Object reference not set to an instance of an object
   at Embervale.Combat.KineticNet.OnTargetCaptured(Creature target) in /src/game/combat/KineticNet.cs:line 84
   at Embervale.Creatures.CreatureAI.HandleTrapCollision(Area3D overlap) in /src/game/creatures/CreatureAI.cs:line 122
   at Godot.NativeInterop.GodotNativeBridge.CallAreaSignal(IntPtr instance, IntPtr arg) in /engine/native/GodotNativeBridge.cs:line 412`,
      timestamp: '2026-09-18T03:12:00Z',
      frequency: 14,
      affectedUsers: 9, // explicitly reported by crashlytics telemetry
      source: 'Runtime Client',
      status: 'KNOWN',
      relatedIssueId: 'qa-issue-c1',
      aiAnalysis: analysis1,
    };

    const analysis2: AICrashAnalysis = {
      likelyCause:
        'Vulkan buffer reallocation timeout on Adreno 610 GPUs when dynamic water reflections cascade beyond 4 shadow cascades.',
      evidence: [
        'Adreno 610 driver log: VK_ERROR_DEVICE_LOST during RenderPassBegin',
        'Device telemetry correlates exclusively with Android 11 budget chipsets in Sunken Mire biome',
      ],
      affectedSystem: 'Graphics & Shader Pipeline',
      suggestedInvestigation:
        'Check WaterReflectionPass.gd and verify fallback to static planar reflection when GPU memory budget is under 2GB.',
      potentialFix:
        'Clamp shadow cascades to 2 and disable water subsurface scattering when device tier is categorized as Low/Medium.',
      confidence: 'POSSIBLE',
      analyzedAt: '2026-09-19T14:10:00Z',
    };

    const c2: CrashReport = {
      id: 'crash-002',
      projectId,
      releaseId: 'rel-embervale-v100',
      platform: 'Android',
      version: '1.0.0',
      errorType: 'VK_ERROR_DEVICE_LOST',
      message: 'Vulkan device lost during WaterReflectionPass.Render() on Adreno 610',
      stackTrace: `VK_ERROR_DEVICE_LOST in Drivers/Vulkan/vulkan_context.cpp:line 1842
   at Godot.RenderingDeviceVulkan.DrawListBegin(...)
   at Embervale.Shaders.WaterReflectionPass.Render() in /src/shaders/water_reflection.glsl:line 42`,
      timestamp: '2026-09-19T13:45:00Z',
      frequency: 6,
      affectedUsers: 4,
      source: 'Runtime Client',
      status: 'NEW',
      aiAnalysis: analysis2,
    };

    this.crashReports.set(projectId, [c1, c2]);
  }

  getCrashes(projectId: string): CrashReport[] {
    return this.crashReports.get(projectId) || [];
  }

  getCrash(projectId: string, id: string): CrashReport | undefined {
    return this.getCrashes(projectId).find((c) => c.id === id);
  }

  updateCrashStatus(projectId: string, id: string, status: CrashReport['status'], relatedTaskId?: string): void {
    const crash = this.getCrash(projectId, id);
    if (crash) {
      crash.status = status;
      if (relatedTaskId) {
        crash.relatedIssueId = relatedTaskId;
      }
    }
  }

  ingestCrash(crashData: Omit<CrashReport, 'id' | 'timestamp' | 'status'>): CrashReport {
    const report: CrashReport = {
      id: `crash-${Date.now().toString(36)}`,
      timestamp: new Date().toISOString(),
      status: 'NEW',
      ...crashData,
    };

    // Run AI crash analysis
    report.aiAnalysis = this.analyzeCrash(report);

    const list = this.getCrashes(report.projectId);
    list.unshift(report);
    this.crashReports.set(report.projectId, list);
    return report;
  }

  analyzeCrash(crash: CrashReport): AICrashAnalysis {
    const isNullRef = crash.message.toLowerCase().includes('nullreference') || crash.stackTrace.includes('NullReference');
    const isVulkan = crash.message.toLowerCase().includes('vulkan') || crash.message.includes('VK_');

    if (isNullRef) {
      return {
        likelyCause: 'Unchecked entity lifecycle reference in collision/event handler callback.',
        evidence: [
          `Stack trace line: ${crash.stackTrace.split('\n')[1] || 'Unknown frame'}`,
          `Observed frequency: ${crash.frequency} event(s) captured`,
        ],
        affectedSystem: 'Entity Management / Event Dispatch',
        suggestedInvestigation: 'Audit null checks and weak reference handles in calling code.',
        potentialFix: 'Wrap receiver object access in null guard or defensive early return.',
        confidence: 'LIKELY',
        analyzedAt: new Date().toISOString(),
      };
    }

    if (isVulkan) {
      return {
        likelyCause: 'Graphics driver buffer exhaustion or unsupported shader extension on target hardware.',
        evidence: [
          `Error type: ${crash.errorType}`,
          `Platform: ${crash.platform}`,
        ],
        affectedSystem: 'Rendering Engine / Vulkan Backend',
        suggestedInvestigation: 'Profile VRAM allocations and check GPU driver capabilities on low-tier mobile profiles.',
        potentialFix: 'Add fallback rendering path or decrease texture/shadow resolution.',
        confidence: 'POSSIBLE',
        analyzedAt: new Date().toISOString(),
      };
    }

    return {
      likelyCause: 'Unclassified runtime exception in application logic.',
      evidence: [`Error message: ${crash.message}`],
      affectedSystem: 'General Runtime',
      suggestedInvestigation: 'Replicate issue in local debugger with verbose logging enabled.',
      potentialFix: 'Apply defensive bounds checking and structured exception logging.',
      confidence: 'UNKNOWN',
      analyzedAt: new Date().toISOString(),
    };
  }

  async createIssueAndTaskFromCrash(projectId: string, crashId: string): Promise<{ issueId: string; taskId: string } | undefined> {
    const crash = this.getCrash(projectId, crashId);
    if (!crash) return undefined;

    // 1. Create QA Issue
    const issue = qaAgentService.createIssue({
      projectId,
      title: `[Crash Fix] ${crash.errorType}: ${crash.message.substring(0, 60)}...`,
      description: `Production crash reported in v${crash.version} (${crash.platform}).\nStack Trace:\n${crash.stackTrace}\n\nAI Analysis Hypothesis (${crash.aiAnalysis?.confidence || 'POSSIBLE'}):\n${crash.aiAnalysis?.likelyCause || 'N/A'}\n\nEvidence:\n${crash.aiAnalysis?.evidence.join('\n') || 'N/A'}`,
      severity: crash.frequency > 10 ? 'CRITICAL' : 'HIGH',
      status: 'OPEN',
    });

    // 2. Create Task for Phase 9 Autonomous Dev Loop
    const task = await taskService.createTask({
      projectId,
      title: `Fix Production Crash: ${crash.errorType}`,
      description: `Resolve verified production crash:\n${crash.message}\nSuggested fix: ${crash.aiAnalysis?.potentialFix}`,
      category: 'Bugfix',
      priority: crash.frequency > 10 ? 'CRITICAL' : 'HIGH',
      assignedAgentId: 'agent-debug-01',
      tags: ['production-fix', 'crash', crash.platform],
    });

    crash.status = 'FIXING';
    crash.relatedIssueId = issue.id;

    return { issueId: issue.id, taskId: task.id };
  }
}

export const crashAnalysisService = new CrashAnalysisService();
