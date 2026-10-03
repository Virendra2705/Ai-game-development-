import { ChangeImpactReport } from '../types';

class ChangeImpactService {
  async analyzeChangeImpact(
    projectId: string,
    actionTitle: string,
    affectedFiles: string[],
    proposedChangesDescription: string
  ): Promise<ChangeImpactReport> {
    const affectedSystems: string[] = [];
    const affectedAssets: string[] = [];
    const affectedTests: string[] = [];
    const affectedTasks: string[] = [];
    const mitigations: string[] = [];
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
    let breakingChange = false;
    let requiresApproval = false;

    // Analyze files & systems
    for (const file of affectedFiles) {
      const lower = file.toLowerCase();
      if (lower.includes('combat') || lower.includes('battle')) {
        affectedSystems.push('Combat System', 'Creature AI');
        affectedTests.push('CombatTurnTest', 'CaptureRateTest', 'CreatureHealthTest');
      }
      if (lower.includes('capture') || lower.includes('trap')) {
        affectedSystems.push('Creature Capture', 'Inventory Items');
        affectedTests.push('CaptureSuccessRateTest', 'TrapConsumableTest', 'CaptureAnimationSyncTest');
        affectedAssets.push('vfx_rift_trap_capture.png', 'sfx_trap_clamp.wav');
      }
      if (lower.includes('movement') || lower.includes('player')) {
        affectedSystems.push('Player Controller', 'Physics Collision');
        affectedTests.push('PlayerMovementVectorTest', 'TerrainCollisionTest');
      }
      if (lower.includes('save') || lower.includes('storage') || lower.includes('db')) {
        affectedSystems.push('Save / Load Serialization', 'Player Progression');
        affectedTests.push('SaveStateIntegrityTest', 'BackwardCompatibilityTest');
        riskLevel = 'HIGH';
        requiresApproval = true;
      }
      if (lower.includes('security') || lower.includes('auth') || lower.includes('config') || lower.includes('env')) {
        affectedSystems.push('Core Security & Configuration');
        riskLevel = 'CRITICAL';
        requiresApproval = true;
        breakingChange = true;
      }
    }

    // Deduplicate
    const uniqueSystems = Array.from(new Set(affectedSystems));
    const uniqueAssets = Array.from(new Set(affectedAssets));
    const uniqueTests = Array.from(new Set(affectedTests));

    if (uniqueSystems.length >= 3) {
      if (riskLevel === 'LOW') riskLevel = 'MEDIUM';
    }
    if (uniqueSystems.includes('Combat System') && uniqueSystems.includes('Creature Capture')) {
      riskLevel = 'HIGH';
      requiresApproval = true;
      mitigations.push('Run full regression suite on Combat & Capture flows.');
      mitigations.push('Verify state machine transitions before and after capture encapsulation.');
    }

    if (riskLevel === 'HIGH' || riskLevel === 'CRITICAL') {
      requiresApproval = true;
    }

    if (mitigations.length === 0) {
      mitigations.push('Perform automated build verification before merging changes.');
      mitigations.push('Run affected unit and integration test suites.');
    }

    const report: ChangeImpactReport = {
      id: `cir-${Date.now()}`,
      projectId,
      actionTitle,
      affectedSystems: uniqueSystems.length > 0 ? uniqueSystems : ['General Game Systems'],
      affectedFiles,
      affectedAssets: uniqueAssets,
      affectedTests: uniqueTests.length > 0 ? uniqueTests : ['BuildVerificationTest'],
      affectedTasks,
      riskLevel,
      breakingChange,
      requiresApproval,
      summary: `Impact analysis for "${actionTitle}": ${uniqueSystems.length} systems and ${affectedFiles.length} files affected. Risk rating: ${riskLevel}.`,
      mitigations,
      createdAt: new Date().toISOString(),
    };

    return report;
  }
}

export const changeImpactService = new ChangeImpactService();
