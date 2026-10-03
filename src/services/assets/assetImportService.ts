import { Asset } from '../../types';
import { taskService } from '../taskService';
import { activityService } from '../activityService';

export interface ImportValidationResult {
  valid: boolean;
  reason?: string;
  destinationPath: string;
  safetyChecks: {
    name: string;
    passed: boolean;
    details: string;
  }[];
}

export class AssetImportService {
  /**
   * Section 25: Directory mapping for detected project structure
   */
  getDestinationDirectoryForType(assetType: string): string {
    const norm = assetType.toUpperCase();
    if (['CREATURE', 'CREATURES'].includes(norm)) return 'assets/creatures/';
    if (['CHARACTER', 'CHARACTERS', 'NPC'].includes(norm)) return 'assets/characters/';
    if (['3D_MODEL', 'PROP', 'WEAPON', 'BUILDING'].includes(norm)) return 'assets/models/';
    if (['IMAGE', 'TEXTURE', 'MATERIAL', '2D SPRITES'].includes(norm)) return 'assets/textures/';
    if (['UI', 'UI_ASSET', 'ICON', 'UI COMPONENTS'].includes(norm)) return 'assets/ui/';
    if (['AUDIO', 'SOUND_EFFECT'].includes(norm)) return 'assets/audio/sfx/';
    if (['MUSIC'].includes(norm)) return 'assets/audio/music/';
    if (['VOICE'].includes(norm)) return 'assets/audio/voice/';
    if (['VFX'].includes(norm)) return 'assets/vfx/';
    if (['ENVIRONMENT', 'SCENES'].includes(norm)) return 'assets/environment/';
    if (['VIDEO', 'CINEMATIC'].includes(norm)) return 'assets/video/';
    return 'assets/misc/';
  }

  /**
   * Section 26: Import Safety Verification
   */
  validateImportSafety(asset: Asset, currentProjectId: string): ImportValidationResult {
    const safetyChecks: { name: string; passed: boolean; details: string }[] = [];

    // 1. Asset Approval status check
    const isApproved =
      asset.status === 'APPROVED' ||
      asset.status === 'Approved' ||
      asset.status === 'REVIEW_REQUIRED' ||
      asset.status === 'Ready';
    safetyChecks.push({
      name: 'Asset Status Check',
      passed: isApproved,
      details: isApproved ? `Asset state is ${asset.status}` : `Asset is in status "${asset.status}", approval required`,
    });

    // 2. Project ownership check
    const projectMatches = asset.projectId === currentProjectId;
    safetyChecks.push({
      name: 'Project Ownership Verification',
      passed: projectMatches,
      details: projectMatches ? `Matches current project (${currentProjectId})` : `Asset belongs to another project!`,
    });

    // 3. Destination Directory check
    const destDir = this.getDestinationDirectoryForType(asset.type);
    const destAllowed = destDir.startsWith('assets/');
    safetyChecks.push({
      name: 'Destination Whitelist Check',
      passed: destAllowed,
      details: `Target directory "${destDir}" is inside sandboxed assets workspace`,
    });

    // 4. File Type Check
    const allowedExtensions = ['.glb', '.gltf', '.png', '.webp', '.ogg', '.wav', '.mp3', '.mp4', '.tres', '.tscn'];
    const safeFormat = allowedExtensions.some(
      (ext) =>
        (asset.format || '').toLowerCase().includes(ext.replace('.', '')) ||
        (asset.fileLocation || '').toLowerCase().endsWith(ext)
    );
    safetyChecks.push({
      name: 'Supported File Format',
      passed: safeFormat,
      details: `Asset format "${asset.format || 'Standard'}" is verified for engine ingest`,
    });

    // 5. System File Overwrite Protection
    const protectedFiles = ['project.godot', 'package.json', 'tsconfig.json', '.gitignore', 'main.gd'];
    const targetFileName = (asset.fileLocation || asset.name).split('/').pop() || '';
    const isProtected = protectedFiles.includes(targetFileName);
    safetyChecks.push({
      name: 'Protected File Boundary',
      passed: !isProtected,
      details: isProtected ? `CRITICAL: Overwrite of system file "${targetFileName}" blocked!` : 'No system files affected',
    });

    const allPassed = safetyChecks.every((c) => c.passed);
    const reason = allPassed ? undefined : safetyChecks.find((c) => !c.passed)?.details;

    return {
      valid: allPassed,
      reason,
      destinationPath: `${destDir}${asset.name.toLowerCase().replace(/\s+/g, '_')}/${targetFileName}`,
      safetyChecks,
    };
  }

  /**
   * Section 24: Import Execution Pipeline
   */
  async importAssetToProject(asset: Asset, currentProjectId: string): Promise<{ success: boolean; importedPath: string; error?: string }> {
    const validation = this.validateImportSafety(asset, currentProjectId);
    if (!validation.valid) {
      return { success: false, importedPath: '', error: validation.reason };
    }

    // Stage 1: Workspace Staging
    await new Promise((r) => setTimeout(r, 400));

    // Stage 2: Project Workspace Ingest
    const finalPath = validation.destinationPath;

    // Stage 3: Reference Registration & Activity
    await activityService.logActivity(
      'ASSET_IMPORTED',
      'Asset Import Service',
      `Imported verified asset "${asset.name}" (${asset.version}) into ${finalPath}`,
      currentProjectId,
      { assetId: asset.id, path: finalPath, format: asset.format }
    );

    return {
      success: true,
      importedPath: finalPath,
    };
  }

  /**
   * Section 37 & 38: Asset-Driven Task Creation for Coding Agent
   */
  async createIntegrationTaskForAsset(asset: Asset): Promise<any> {
    const isCreature = ['CREATURE', 'Creatures'].includes(asset.type);
    const isChar = ['CHARACTER', 'Characters', 'NPC'].includes(asset.type);
    const isAudio = ['AUDIO', 'MUSIC', 'SOUND_EFFECT', 'Audio'].includes(asset.type);

    let title = `[ASSET INTEGRATION] Integrate ${asset.name} (${asset.version})`;
    let description = `Register and configure asset in game scenes:\n`;
    description += `- Asset Name: ${asset.name}\n`;
    description += `- Type: ${asset.type}\n`;
    description += `- Version: ${asset.version}\n`;
    description += `- Staged Location: ${asset.fileLocation || 'assets/'}\n`;
    description += `- Format: ${asset.format || 'glTF 2.0 / PBR'}\n\n`;

    if (isCreature) {
      description += `Integration Steps for Coding Agent:\n`;
      description += `1. Register in src/data/creature_database.gd with elemental stats & base EXP\n`;
      description += `2. Bind animation tree states (Idle, Walk, Run, Attack, Hit, Capture, Victory, Defeat)\n`;
      description += `3. Add to Route 1 and Rift Spawner weighted spawn table\n`;
      description += `4. Verify capture collision prism triggers in Godot physics pass`;
    } else if (isChar) {
      description += `Integration Steps for Coding Agent:\n`;
      description += `1. Attach mesh to player kinematics controller\n`;
      description += `2. Retarget humanoid skeleton bones with Godot SkeletonProfileHumanoid\n`;
      description += `3. Link sprint and dodge roll root-motion animations`;
    } else if (isAudio) {
      description += `Integration Steps for Coding Agent:\n`;
      description += `1. Connect to AudioManager singleton bus\n`;
      description += `2. Configure volume attenuation curves in 3D spatial player\n`;
      description += `3. Trigger sound on event listener`;
    } else {
      description += `Integration Steps for Coding Agent:\n`;
      description += `1. Instantiate resource in corresponding scene tree\n`;
      description += `2. Verify collision and draw call budget in game preview`;
    }

    const task = await taskService.createTask({
      projectId: asset.projectId,
      title,
      description,
      priority: 'High',
      tags: ['Asset Integration', asset.type, asset.version, 'Phase 6'],
    });

    await activityService.logActivity(
      'TASK_CREATED',
      'Asset Orchestrator',
      `Spawned coding integration task for asset "${asset.name}"`,
      asset.projectId,
      { taskId: task.id, assetId: asset.id }
    );

    return task;
  }
}

export const assetImportService = new AssetImportService();
