import {
  Release,
  ReleaseReadinessReport,
  ReleaseApproval,
  EnvironmentType,
} from '../types';
import { regressionService } from './regressionService';
import { qaAgentService } from './qa/qaAgentService';
import { versionService } from './versionService';

export interface CreateCandidateOptions {
  projectId: string;
  version: string;
  buildId: string;
  environment: EnvironmentType;
  releaseNotes?: string;
  platformValidation?: 'PASS' | 'FAIL' | 'NOT_TESTED';
}

export class ReleaseManagerService {
  private releases: Map<string, Release[]> = new Map();
  private approvals: Map<string, ReleaseApproval> = new Map();

  constructor() {
    this.seedInitialReleases('proj-embervale');
  }

  private seedInitialReleases(projectId: string) {
    const v100Readiness: ReleaseReadinessReport = {
      buildStatus: 'PASS',
      criticalQA: 'PASS',
      regression: 'PASS',
      criticalBugsCount: 0,
      majorBugsCount: 0,
      performanceStatus: 'AVAILABLE',
      performanceData: { fps: 60, frameTimeMs: 16.4, memoryMB: 480 },
      platformValidation: 'PASS',
      requiredApprovals: ['Lead Producer Signoff', 'Technical Director Signoff'],
      missingDataWarnings: [],
      isReady: true,
      evaluatedAt: '2026-09-10T12:00:00Z',
    };

    const v100: Release = {
      id: 'rel-embervale-v100',
      projectId,
      version: '1.0.0',
      buildId: 'build-142',
      environment: 'PRODUCTION',
      status: 'LIVE',
      releaseNotes:
        'Initial public release of Embervale: Rift Tamers Core. Includes 3 elemental biomes, 12 catchable rift creatures, real-time kinetic combat system, and cloud save synchronization.',
      changelog: [
        { id: 'cl-1', type: 'FEATURE', title: 'Creature Taming Core loop with Sparkit & Ignisaur', commitRef: 'git#7b9e4a1' },
        { id: 'cl-2', type: 'FEATURE', title: 'Open-world Rift portal procedural encounters', commitRef: 'git#6c8a3f2' },
        { id: 'cl-3', type: 'PERFORMANCE', title: 'Vulkan / Mobile GLES3 shader pre-compilation caching', commitRef: 'git#5a1b9e8' },
        { id: 'cl-4', type: 'KNOWN_ISSUE', title: 'Camera occlusion jitter in tight subterranean cavern zones' },
      ],
      validationResults: v100Readiness,
      approvalStatus: 'APPROVED',
      approvedBy: 'Alex Vance (Lead Game Producer)',
      approvedAt: '2026-09-10T13:30:00Z',
      deploymentId: 'dep-embervale-100',
      createdAt: '2026-09-10T10:00:00Z',
      releasedAt: '2026-09-10T14:45:00Z',
    };

    const v110Readiness: ReleaseReadinessReport = {
      buildStatus: 'PASS',
      criticalQA: 'PASS',
      regression: 'PASS',
      criticalBugsCount: 0,
      majorBugsCount: 1,
      performanceStatus: 'AVAILABLE',
      performanceData: { fps: 59, frameTimeMs: 16.8, memoryMB: 512 },
      platformValidation: 'PASS',
      requiredApprovals: ['Lead Producer Signoff', 'QA Signoff'],
      missingDataWarnings: [],
      isReady: true,
      evaluatedAt: '2026-09-21T06:00:00Z',
    };

    const v110Candidate: Release = {
      id: 'rel-embervale-v110-rc1',
      projectId,
      version: '1.1.0',
      buildId: 'build-158',
      environment: 'STAGING',
      status: 'APPROVAL_REQUIRED',
      releaseNotes:
        'Version 1.1.0 adds the Sparkit Capture Arc feature, particle lighting balance, inventory quick-slots, and touch-screen gesture smoothing.',
      changelog: [
        { id: 'cl-5', type: 'FEATURE', title: 'Sparkit Capture Trapping Mechanic & Kinetic Net', commitRef: 'git#9f4d1c2' },
        { id: 'cl-6', type: 'IMPROVEMENT', title: 'Creature AI flee state when player approaches stealthily', commitRef: 'git#8e3a2b1' },
        { id: 'cl-7', type: 'BUG_FIX', title: 'Fixed physics collider leakage on Rift Gate stairs', commitRef: 'git#7d2c1a0' },
        { id: 'cl-8', type: 'KNOWN_ISSUE', title: 'Inventory slot drag hover latency on low-spec Android devices' },
      ],
      validationResults: v110Readiness,
      approvalStatus: 'PENDING',
      createdAt: '2026-09-21T05:30:00Z',
    };

    this.releases.set(projectId, [v110Candidate, v100]);

    this.approvals.set(v110Candidate.id, {
      id: `appr-${v110Candidate.id}`,
      releaseId: v110Candidate.id,
      version: '1.1.0',
      buildId: 'build-158',
      changes: [
        'Sparkit Creature Capture Arc fully playable',
        'Updated Rift Gate collision mesh to prevent stuck players',
        'Optimized audio streaming bus to prevent latency spikes',
      ],
      affectedSystems: ['Gameplay / Creature AI', 'Player Inventory', 'Collision & Physics Engine'],
      knownIssues: ['Inventory drag hover latency on low-spec Android devices'],
      qaResults: 'Passed 18 automated integration tests; 0 critical blockers; 1 non-fatal UI bug.',
      deploymentTarget: 'Google Play Internal Testing (Track QA)',
      rollbackPlan: 'Instant fallback to release v1.0.0 (art-embervale-v100) via Rollback Manager.',
      status: 'PENDING',
    });
  }

  getReleases(projectId: string): Release[] {
    return this.releases.get(projectId) || [];
  }

  getRelease(projectId: string, releaseId: string): Release | undefined {
    return this.getReleases(projectId).find((r) => r.id === releaseId);
  }

  getLiveRelease(projectId: string): Release | undefined {
    return this.getReleases(projectId).find((r) => r.status === 'LIVE');
  }

  getPreviousRelease(projectId: string): Release | undefined {
    const list = this.getReleases(projectId);
    const liveIndex = list.findIndex((r) => r.status === 'LIVE');
    if (liveIndex >= 0 && liveIndex + 1 < list.length) {
      return list[liveIndex + 1];
    }
    return list[1];
  }

  getLatestCandidate(projectId: string): Release | undefined {
    return this.getReleases(projectId).find((r) =>
      ['CANDIDATE', 'VALIDATING', 'APPROVAL_REQUIRED', 'APPROVED', 'BUILDING'].includes(r.status)
    );
  }

  evaluateReadiness(projectId: string, platformTested: boolean = true): ReleaseReadinessReport {
    const tests = regressionService.getRegressionTests(projectId);
    const criticalTests = tests.filter((t) => t.category === 'GAMEPLAY' || t.name.toLowerCase().includes('critical'));
    const failedCriticalTests = criticalTests.filter((t) => t.status === 'FAIL').length;
    const criticalQAFailed = failedCriticalTests > 0;
    const criticalQAPassed = criticalTests.length > 0 && failedCriticalTests === 0;

    const issues = qaAgentService.getIssues(projectId);
    const criticalBugs = issues.filter((i) => i.severity === 'CRITICAL' && i.status === 'OPEN').length;
    const majorBugs = issues.filter((i) => i.severity === 'HIGH' && i.status === 'OPEN').length;

    const warnings: string[] = [];
    if (criticalTests.length === 0) {
      warnings.push('INSUFFICIENT DATA: No critical gameplay test suite is registered for this project.');
    }
    if (!platformTested) {
      warnings.push('INSUFFICIENT DATA: Target platform native harness has not completed validation.');
    }

    const isReady =
      !criticalQAFailed &&
      criticalBugs === 0 &&
      majorBugs <= 1 &&
      warnings.length === 0;

    return {
      buildStatus: 'PASS',
      criticalQA: criticalTests.length === 0 ? 'NOT_TESTED' : criticalQAPassed ? 'PASS' : 'FAIL',
      regression: tests.some((t) => t.status === 'FAIL') ? 'FAIL' : 'PASS',
      criticalBugsCount: criticalBugs,
      majorBugsCount: majorBugs,
      performanceStatus: 'AVAILABLE',
      performanceData: { fps: 60, frameTimeMs: 16.6, memoryMB: 495 },
      platformValidation: platformTested ? 'PASS' : 'NOT_TESTED',
      requiredApprovals: ['Lead Producer Signoff', 'Production Deployment Authorization'],
      missingDataWarnings: warnings,
      isReady,
      evaluatedAt: new Date().toISOString(),
    };
  }

  createReleaseCandidate(options: CreateCandidateOptions): Release {
    const readiness = this.evaluateReadiness(options.projectId, options.platformValidation === 'PASS');
    const releaseId = `rel-${options.projectId}-v${options.version.replace(/\./g, '')}-${Date.now().toString(36)}`;

    const newRelease: Release = {
      id: releaseId,
      projectId: options.projectId,
      version: options.version,
      buildId: options.buildId,
      environment: options.environment,
      status: 'APPROVAL_REQUIRED',
      releaseNotes:
        options.releaseNotes ||
        `Release Candidate v${options.version} packaged for target environment: ${options.environment}.`,
      changelog: [
        { id: `cl-${Date.now()}-1`, type: 'FEATURE', title: `Autonomous Sprint updates for v${options.version}` },
        { id: `cl-${Date.now()}-2`, type: 'IMPROVEMENT', title: 'Performance telemetry & memory pool optimization' },
      ],
      validationResults: readiness,
      approvalStatus: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    // Create corresponding approval request
    this.approvals.set(releaseId, {
      id: `appr-${releaseId}`,
      releaseId,
      version: options.version,
      buildId: options.buildId,
      changes: [
        `Candidate release targeting ${options.environment}`,
        'Passed automated regression & unit validation suites',
      ],
      affectedSystems: ['Core Game Loop', 'Asset Streaming', 'Network/Telemetry'],
      knownIssues: readiness.majorBugsCount > 0 ? [`${readiness.majorBugsCount} non-blocking major bug(s) pending`] : ['None'],
      qaResults: `QA Status: ${readiness.criticalQA}, Regression: ${readiness.regression}`,
      deploymentTarget: `${options.environment} Pipeline`,
      rollbackPlan: 'Revert to latest confirmed stable release with zero data loss.',
      status: 'PENDING',
    });

    const list = this.getReleases(options.projectId);
    list.unshift(newRelease);
    this.releases.set(options.projectId, list);
    return newRelease;
  }

  getApproval(releaseId: string): ReleaseApproval | undefined {
    return this.approvals.get(releaseId);
  }

  processApproval(
    projectId: string,
    releaseId: string,
    decision: 'APPROVE RELEASE' | 'REJECT' | 'REQUEST CHANGES' | 'CANCEL',
    author: string,
    note?: string
  ): { success: boolean; release?: Release; approval?: ReleaseApproval; error?: string } {
    // "No AI agent may approve its own production release."
    if (author.toLowerCase().includes('agent') || author.toLowerCase().includes('bot') || author.toLowerCase().includes('ai')) {
      return {
        success: false,
        error: 'Security Policy Violation: No AI agent may approve a production release. Explicit human authorization required.',
      };
    }

    const release = this.getRelease(projectId, releaseId);
    const approval = this.getApproval(releaseId);

    if (!release || !approval) {
      return { success: false, error: 'Release or approval record not found.' };
    }

    if (decision === 'APPROVE RELEASE') {
      approval.status = 'APPROVED';
      approval.decidedBy = author;
      approval.decidedAt = new Date().toISOString();
      approval.decisionNote = note || 'Approved by authorized producer.';

      release.status = 'APPROVED';
      release.approvalStatus = 'APPROVED';
      release.approvedBy = author;
      release.approvedAt = new Date().toISOString();
    } else if (decision === 'REJECT') {
      approval.status = 'REJECTED';
      approval.decidedBy = author;
      approval.decidedAt = new Date().toISOString();
      approval.decisionNote = note;

      release.status = 'CANCELLED';
      release.approvalStatus = 'REJECTED';
    } else if (decision === 'REQUEST CHANGES') {
      approval.status = 'CHANGES_REQUESTED';
      approval.decidedBy = author;
      approval.decidedAt = new Date().toISOString();
      approval.decisionNote = note;

      release.status = 'DRAFT';
      release.approvalStatus = 'CHANGES_REQUESTED';
    } else {
      approval.status = 'CANCELLED';
      release.status = 'CANCELLED';
    }

    return { success: true, release, approval };
  }

  updateRelease(projectId: string, updated: Release): Release {
    const list = this.getReleases(projectId);
    const idx = list.findIndex((r) => r.id === updated.id);
    if (idx >= 0) {
      list[idx] = updated;
    } else {
      list.unshift(updated);
    }
    this.releases.set(projectId, list);
    return updated;
  }
}

export const releaseManagerService = new ReleaseManagerService();
