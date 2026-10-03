import { CodeIndexFile, AssetIndexEntry, Asset } from '../types';

/**
 * Service to maintain a clean knowledge index of project codebase and assets
 * Strict security: Never indexes secrets, API keys, credentials, or tokens.
 */
class ProjectIndexService {
  private codeIndexCache: Map<string, CodeIndexFile[]> = new Map();
  private assetIndexCache: Map<string, AssetIndexEntry[]> = new Map();

  // Pre-seeded Embervale: Rift Tamers codebase index
  private defaultEmbervaleCodeFiles: CodeIndexFile[] = [
    {
      path: 'src/scripts/combat/CaptureManager.gd',
      name: 'CaptureManager.gd',
      type: 'GDScript',
      system: 'Creature Capture',
      classes: ['CaptureManager'],
      functions: [
        'initiate_capture(target: Creature, orb: CaptureOrb)',
        'calculate_capture_rate(target: Creature, ball_multiplier: float)',
        'play_capture_animation(target: Creature, orb: CaptureOrb)',
        'finalize_capture(success: bool)',
      ],
      imports: ['res://src/scripts/entities/Creature.gd', 'res://src/scripts/items/CaptureOrb.gd'],
      dependencies: ['Creature.gd', 'CaptureOrb.gd', 'BattleStateMachine.gd'],
      lines: 245,
      lastModified: '2026-09-18T14:30:00Z',
    },
    {
      path: 'src/scripts/entities/creatures/SparkitController.gd',
      name: 'SparkitController.gd',
      type: 'GDScript',
      system: 'Creature Controller',
      classes: ['SparkitController'],
      functions: [
        '_ready()',
        'execute_ability(ability_id: String)',
        'trigger_capture_reaction(capture_state: String)',
        'play_animation(anim_name: String)',
        'get_elemental_affinity()',
      ],
      imports: ['res://src/scripts/entities/CreatureBase.gd', 'res://src/scripts/vfx/LightningVFX.gd'],
      dependencies: ['CreatureBase.gd', 'LightningVFX.gd', 'AnimationPlayer'],
      lines: 312,
      lastModified: '2026-09-19T10:15:00Z',
    },
    {
      path: 'src/scripts/combat/BattleDamageCalculator.gd',
      name: 'BattleDamageCalculator.gd',
      type: 'GDScript',
      system: 'Combat Systems',
      classes: ['BattleDamageCalculator'],
      functions: [
        'calculate_damage(attacker: Creature, defender: Creature, move: Move)',
        'apply_type_effectiveness(move_type: String, defender_types: Array)',
        'calculate_critical_multiplier()',
      ],
      imports: ['res://src/scripts/data/TypeChart.gd'],
      dependencies: ['TypeChart.gd'],
      lines: 188,
      lastModified: '2026-09-17T09:20:00Z',
    },
    {
      path: 'src/scripts/animation/CreatureAnimationBridge.gd',
      name: 'CreatureAnimationBridge.gd',
      type: 'GDScript',
      system: 'Animation Controller',
      classes: ['CreatureAnimationBridge'],
      functions: [
        'bind_skeleton(skeleton: Skeleton3D)',
        'play_capture_wobble(intensity: float)',
        'trigger_electric_burst_particles()',
        'reset_to_idle()',
      ],
      imports: ['res://src/scripts/combat/CaptureManager.gd'],
      dependencies: ['CaptureManager.gd'],
      lines: 154,
      lastModified: '2026-09-18T16:45:00Z',
    },
    {
      path: 'src/scripts/inventory/InventoryManager.gd',
      name: 'InventoryManager.gd',
      type: 'GDScript',
      system: 'Inventory Systems',
      classes: ['InventoryManager'],
      functions: [
        'add_item(item_id: String, quantity: int)',
        'consume_item(item_id: String)',
        'get_capture_orbs_count()',
      ],
      imports: ['res://src/scripts/items/ItemDatabase.gd'],
      dependencies: ['ItemDatabase.gd'],
      lines: 195,
      lastModified: '2026-09-15T11:00:00Z',
    },
    {
      path: 'src/scripts/world/Route1SpawnTable.gd',
      name: 'Route1SpawnTable.gd',
      type: 'GDScript',
      system: 'World Generation',
      classes: ['Route1SpawnTable'],
      functions: ['get_random_wild_encounter(terrain: String, time_of_day: String)', 'get_sparkit_spawn_rate()'],
      imports: ['res://src/scripts/data/CreatureDatabase.gd'],
      dependencies: ['CreatureDatabase.gd'],
      lines: 120,
      lastModified: '2026-09-16T15:10:00Z',
    },
  ];

  /**
   * Returns indexed files for a project, omitting any sensitive files
   */
  async getCodeIndex(projectId: string): Promise<CodeIndexFile[]> {
    if (!this.codeIndexCache.has(projectId)) {
      this.codeIndexCache.set(projectId, [...this.defaultEmbervaleCodeFiles]);
    }
    return this.codeIndexCache.get(projectId) || [];
  }

  /**
   * Search code files by symbol, class, function, or system
   */
  async searchCodeIndex(projectId: string, query: string): Promise<CodeIndexFile[]> {
    const allFiles = await this.getCodeIndex(projectId);
    const q = query.toLowerCase().trim();
    if (!q) return allFiles;

    return allFiles.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.system.toLowerCase().includes(q) ||
        f.path.toLowerCase().includes(q) ||
        f.classes.some((c) => c.toLowerCase().includes(q)) ||
        f.functions.some((fn) => fn.toLowerCase().includes(q))
    );
  }

  /**
   * Build or update asset knowledge index with cross-references
   */
  async getAssetIndex(projectId: string, existingAssets: Asset[] = []): Promise<AssetIndexEntry[]> {
    if (this.assetIndexCache.has(projectId)) {
      return this.assetIndexCache.get(projectId)!;
    }

    const entries: AssetIndexEntry[] = [
      {
        assetId: 'asset-sparkit-model',
        name: 'Sparkit 3D Model',
        type: '3D_MODEL',
        version: 'v2.1',
        prompt: 'Stylized lightning fox creature, low-poly anime aesthetic, emissive yellow fur',
        references: ['Art Direction Document', 'Sparkit Creature Specification'],
        validationStatus: 'PASSED',
        integrationTasks: ['task-142', 'task-144'],
        codeSystems: ['Creature Controller', 'Creature Capture'],
        buildVerified: true,
        qaTested: true,
      },
      {
        assetId: 'asset-capture-orb',
        name: 'Standard Rift Orb 3D Model',
        type: '3D_MODEL',
        version: 'v1.4',
        prompt: 'Futuristic crystalline sphere for creature containment, glowing ether core',
        references: ['Capture Mechanics Specification'],
        validationStatus: 'PASSED',
        integrationTasks: ['task-142'],
        codeSystems: ['Creature Capture', 'Inventory Systems'],
        buildVerified: true,
        qaTested: true,
      },
      {
        assetId: 'asset-sparkit-capture-anim',
        name: 'Sparkit Capture Reaction Animation',
        type: 'ANIMATION',
        version: 'v1.0',
        prompt: 'Sparkit struggling against capture beam before settling into sphere with electric sparkle',
        references: ['Art Direction: VFX & Animation', 'Sparkit Creature Specification'],
        validationStatus: 'PASSED',
        integrationTasks: ['task-142'],
        codeSystems: ['Animation Controller', 'Creature Capture'],
        buildVerified: true,
        qaTested: true,
      },
      {
        assetId: 'asset-route1-tileset',
        name: 'Route 1 Meadow Environment Tileset',
        type: '3D_MODEL',
        version: 'v1.0',
        prompt: 'Verdant grassy plains with gentle rocks and wild ether flowers',
        references: ['World Bible: Route 1'],
        validationStatus: 'PASSED',
        integrationTasks: ['task-108'],
        codeSystems: ['World Generation'],
        buildVerified: true,
        qaTested: false,
      },
      {
        assetId: 'asset-capture-sfx',
        name: 'Creature Capture Click & Whir SFX',
        type: 'AUDIO',
        version: 'v1.2',
        prompt: 'Satisfying mechanical chime with electronic pulse confirmation',
        references: ['Audio Direction Document'],
        validationStatus: 'PASSED',
        integrationTasks: ['task-142'],
        codeSystems: ['Creature Capture', 'Audio Systems'],
        buildVerified: true,
        qaTested: true,
      },
    ];

    // Merge any extra dynamic assets from project
    for (const a of existingAssets) {
      if (!entries.some((e) => e.assetId === a.id)) {
        entries.push({
          assetId: a.id,
          name: a.name,
          type: String(a.type),
          version: a.version || '1.0',
          prompt: a.prompt,
          references: a.references || [],
          validationStatus: a.status === 'Approved' ? 'PASSED' : 'PENDING',
          integrationTasks: [],
          codeSystems: ['Asset Pipeline'],
          buildVerified: false,
          qaTested: false,
        });
      }
    }

    this.assetIndexCache.set(projectId, entries);
    return entries;
  }

  /**
   * Filter sensitive patterns to prevent indexing keys/secrets
   */
  sanitizeKnowledgeContent(raw: string): string {
    return raw
      .replace(/AIza[0-9A-Za-z-_]{35}/g, '[REDACTED_API_KEY]')
      .replace(/sk-[0-9A-Za-z]{20,}/g, '[REDACTED_SECRET_KEY]')
      .replace(/ghp_[0-9A-Za-z]{36}/g, '[REDACTED_GITHUB_TOKEN]')
      .replace(/(?:password|secret|apikey|token)\s*[:=]\s*['"][^'"]+['"]/gi, '[REDACTED_CREDENTIAL]');
  }
}

export const projectIndexService = new ProjectIndexService();
