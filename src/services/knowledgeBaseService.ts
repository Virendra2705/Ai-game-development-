import {
  KnowledgeDocument,
  KnowledgeConfidence,
  KnowledgeHealthReport,
  KnowledgeQuestion,
  MemoryVersionRecord,
  MemoryCategory,
} from '../types';
import { memoryService } from './memoryService';
import { decisionService } from './decisionService';
import { knowledgeConflictService } from './knowledgeConflictService';
import { projectIndexService } from './projectIndexService';
import { activityService } from './activityService';

class KnowledgeBaseService {
  private documents: Map<string, KnowledgeDocument[]> = new Map();
  private questions: Map<string, KnowledgeQuestion[]> = new Map();

  constructor() {
    this.seedEmbervaleDocuments();
  }

  private seedEmbervaleDocuments() {
    const embervaleDocs: KnowledgeDocument[] = [
      {
        id: 'doc-sparkit-spec',
        projectId: 'proj-embervale',
        title: 'Sparkit Creature Specification',
        description: 'Comprehensive canon design and stat sheet for Sparkit (#025)',
        category: 'CREATURES',
        content: `# Sparkit — The Static Fox (#025)

## Overview
Sparkit is an agile, electric-elemental wild creature inhabiting the high-altitude meadows and energized storm plains of Route 1 and the Thunderhead Peaks.

- **Element / Type**: Electric
- **Base HP**: 48
- **Base Attack**: 62
- **Base Defense**: 44
- **Base Speed**: 85
- **Catch Rate**: 45 (Base standard scale out of 255)
- **Evolution**: Evolves into **Voltrik** at **Level 20** when exposed to a charged Rift Shard.

## Signature Abilities
1. **Spark Dart** (Electric, Power 40, Accuracy 100%): Fires a concentrated dart of static energy. Has a 10% chance to induce Paralysis.
2. **Volt Dash** (Electric, Power 60, Accuracy 95%): Dashes forward with electrifying speed. Always strikes first if the opponent has lower agility.
3. **Static Field** (Passive): Physical contact with Sparkit has a 20% chance of paralyzing the attacker.

## Visual & Animation Direction
Sparkit features bright yellow fur with deep obsidian markings on its ears and lightning-shaped tail. During capture encounters, its fur stands on end with electric sparks before it is encased in the rift sphere.`,
        source: 'Game Design Document v1.2 (Creature Bible)',
        sourceType: 'DOCUMENT',
        tags: ['Creature', 'Sparkit', 'Electric', 'Route 1', 'Canon'],
        version: 2,
        status: 'ACTIVE',
        createdAt: '2026-09-12T10:00:00Z',
        updatedAt: '2026-09-17T15:30:00Z',
        createdBy: 'Lead Creature Designer',
        lastVerifiedAt: '2026-09-19T09:00:00Z',
        confidence: 'VERIFIED',
        history: [
          {
            version: 1,
            title: 'Sparkit Draft Spec',
            content: 'Initial creature proposal with tentative 70 base speed and electric abilities.',
            changedBy: 'Game Designer',
            changeReason: 'Initial creature design draft',
            timestamp: '2026-09-12T10:00:00Z',
          },
        ],
      },
      {
        id: 'doc-capture-spec',
        projectId: 'proj-embervale',
        title: 'Creature Capture Mechanics Specification',
        description: 'Core game design and mathematics for capturing wild creatures',
        category: 'GAMEPLAY_SYSTEMS',
        content: `# Creature Capture Mechanics Specification

## Core Rule
Any wild creature in an active battle encounter can be captured using a **Rift Orb**, provided the player is not in a restricted Trainer Battle.

## Probability Equation
Capture probability $P$ is determined by:
$$P = \\left(\\frac{3 \\times \\text{MaxHP} - 2 \\times \\text{CurrentHP}}{3 \\times \\text{MaxHP}}\\right) \\times \\text{BaseCatchRate} \\times \\text{OrbMultiplier} \\times \\text{StatusBonus}$$

- **Status Bonuses**:
  - Sleep / Frozen: 2.0x
  - Paralyzed / Burned / Poisoned: 1.5x
  - None: 1.0x
- **Ceiling**: Maximum base capture rate is strictly capped at **85%** on common encounters and **35%** on Rift Bosses to retain progression tension.

## Capture Animation Sequence
1. **Throw Phase (0.4s)**: Player flings the Rift Orb towards the targeted creature with arc physics.
2. **Encasement Beam (0.6s)**: Orb opens in midair, firing an ether containment beam that pulls the creature inside and converts its form into glowing data particles.
3. **Wobble Cycle (1.5s)**: Orb lands on the battlefield and wobbles up to 3 times (each shake lasts ~450ms).
4. **Resolution**:
   - **Success**: Click chime plays, orb locks with an energetic starburst, and creature data syncs to the Rift Codex.
   - **Failure**: Orb shatters, creature bursts free with a battle cry and increased aggression.

## Mobile Performance Constraints
- Maximum 120 frames (2.0s) duration for standard encounters.
- Particle effects must be batched into a single draw call.
- Must run cleanly at 60 FPS on mobile browsers without frame drops.`,
        source: 'Game Design Document v1.4 (Core Mechanics)',
        sourceType: 'DOCUMENT',
        tags: ['Combat', 'Capture', 'Mechanics', 'Rift Orb', 'Animation'],
        version: 3,
        status: 'ACTIVE',
        createdAt: '2026-09-14T11:00:00Z',
        updatedAt: '2026-09-18T14:00:00Z',
        createdBy: 'Game Architect',
        lastVerifiedAt: '2026-09-19T11:30:00Z',
        confidence: 'VERIFIED',
      },
      {
        id: 'doc-tech-architecture',
        projectId: 'proj-embervale',
        title: 'Godot 4.3 Web & Mobile Technical Architecture',
        description: 'Target export specifications, WebAssembly configurations, and performance budgets',
        category: 'TECHNICAL_ARCHITECTURE',
        content: `# Godot 4.3 Web & Mobile Technical Architecture

## Engine & Target
- **Engine**: Godot Engine 4.3 (Compatibility renderer / WebGL2 / GLES3 fallback)
- **Export Target**: HTML5 / WebAssembly with Multi-threading (COOP/COEP headers enabled)
- **Target Frame Rate**: 60 FPS (16.6ms maximum frame budget)

## Hardware & Asset Limits
- **Draw Calls**: Maximum 45 draw calls per battle scene
- **Texture Resolutions**: Max 1024x1024 for creature models; 2048x2048 for world terrain atlas
- **Polygon Budget**: 3,000 to 5,000 triangles per 3D creature model
- **Bone Influences**: Capped at 4 bone weights per vertex for WebGL2 compatibility

## Code Architecture
- Combat logic runs via Godot StateMachine (\`BattleStateMachine.gd\`).
- UI triggers events via decoupled Signals (\`Signals.gd\`).
- Save system uses local IndexedDB via Godot JavaScriptObject bridge.`,
        source: 'Technical Design Document (TDD v2.0)',
        sourceType: 'DOCUMENT',
        tags: ['Godot', 'WebGL', 'WebAssembly', 'Performance', 'Mobile'],
        version: 2,
        status: 'ACTIVE',
        createdAt: '2026-09-10T09:00:00Z',
        updatedAt: '2026-09-18T16:20:00Z',
        createdBy: 'Lead Engine Programmer',
        lastVerifiedAt: '2026-09-19T08:00:00Z',
        confidence: 'VERIFIED',
      },
      {
        id: 'doc-route1-spec',
        projectId: 'proj-embervale',
        title: 'Route 1: Verdant Meadow World Bible',
        description: 'Environment layout, wild spawn tables, and progression boundaries',
        category: 'WORLD',
        content: `# Route 1: Verdant Meadow World Bible

## Setting
The introductory wilderness route connecting Oakhaven Village with the Rift Observatory. Characterized by lush rolling hills, ancient stone waymarkers, and scattered Rift Crystals.

## Wild Creature Encounters
- **Sparkit** (Electric): 15% encounter rate in tall brush, 25% during thunderstorms. Levels 3-6.
- **Leaflet** (Grass): 40% encounter rate. Levels 2-5.
- **Pebbler** (Rock/Ground): 25% encounter rate near rocky outcrops. Levels 3-5.
- **Breezeling** (Wind): 20% encounter rate. Levels 3-6.`,
        source: 'World & Narrative Design Bible v1.0',
        sourceType: 'DOCUMENT',
        tags: ['World', 'Route 1', 'Encounters', 'Spawns', 'Sparkit'],
        version: 1,
        status: 'ACTIVE',
        createdAt: '2026-09-11T14:00:00Z',
        updatedAt: '2026-09-16T12:00:00Z',
        createdBy: 'Lead World Builder',
        lastVerifiedAt: '2026-09-18T10:00:00Z',
        confidence: 'VERIFIED',
      },
      {
        id: 'doc-art-direction',
        projectId: 'proj-embervale',
        title: 'Art Direction: Rift Tamer Aesthetic & Shaders',
        description: 'Styling guidelines, color palettes, and shader requirements',
        category: 'ASSETS',
        content: `# Art Direction: Rift Tamer Visual Aesthetic

## Aesthetic Philosophy
Clean, modern anime-inspired cel-shading with vibrant elemental contrasts. Creatures must look expressive, friendly yet formidable when battle ready.

## Material & Shader Guidelines
- Two-band cel shading with smooth ramp transitions.
- Outer ink outlines: Inverted hull method with 1.2px constant screen-space thickness.
- Emissive highlights: Pulsing vertex color channels for elemental creature parts (e.g. Sparkit cheek pouches and tail tip).`,
        source: 'Art Direction Specification v1.5',
        sourceType: 'DOCUMENT',
        tags: ['Art', 'Shaders', 'Cel-Shading', 'Style'],
        version: 1,
        status: 'ACTIVE',
        createdAt: '2026-09-13T16:00:00Z',
        updatedAt: '2026-09-15T18:00:00Z',
        createdBy: 'Art Director',
        lastVerifiedAt: '2026-09-18T12:00:00Z',
        confidence: 'VERIFIED',
      },
    ];

    this.documents.set('proj-embervale', embervaleDocs);

    // Seed knowledge questions / missing knowledge detection
    this.questions.set('proj-embervale', [
      {
        id: 'q-wild-level',
        projectId: 'proj-embervale',
        question: 'Should captured creatures retain their wild level or scale down to player team average?',
        reason: 'No authoritative rule exists in Game Design Document Section 4.2 for wild scaling.',
        blocking: false,
        status: 'UNANSWERED',
        suggestedAnswers: [
          'Retain original wild level exactly as encountered (Classic Standard).',
          'Scale down if higher than the player\'s highest active badge cap.',
          'Always normalize to lowest party member level.',
        ],
        createdAt: '2026-09-18T17:00:00Z',
      },
      {
        id: 'q-critical-capture',
        projectId: 'proj-embervale',
        question: 'Should critical capture (1-shake instant catch) be enabled in early prototype?',
        reason: 'Formula is drafted in research but not formally approved for Phase 8 build.',
        blocking: false,
        status: 'ANSWERED',
        userAnswer: 'Deferred to Phase 9. Keep standard 3-shake tension cycle for now.',
        createdAt: '2026-09-17T12:00:00Z',
        answeredAt: '2026-09-18T09:30:00Z',
      },
    ]);
  }

  async getDocuments(projectId: string, category?: string): Promise<KnowledgeDocument[]> {
    const list = this.documents.get(projectId) || [];
    if (category && category !== 'ALL') {
      return list.filter((d) => d.category === category);
    }
    return list;
  }

  async getDocumentById(projectId: string, id: string): Promise<KnowledgeDocument | null> {
    const list = await this.getDocuments(projectId);
    return list.find((d) => d.id === id) || null;
  }

  async saveDocument(
    doc: Partial<KnowledgeDocument> & {
      projectId: string;
      title: string;
      content: string;
      category?: MemoryCategory | string;
    }
  ): Promise<KnowledgeDocument> {
    const existing = await this.getDocumentById(doc.projectId, doc.id || '');
    const cleanContent = projectIndexService.sanitizeKnowledgeContent(doc.content);

    let finalDoc: KnowledgeDocument;

    if (existing) {
      const historyItem: MemoryVersionRecord = {
        version: existing.version,
        title: existing.title,
        content: existing.content,
        changedBy: doc.createdBy || 'Game Architect',
        changeReason: 'Updated document content',
        timestamp: new Date().toISOString(),
      };

      finalDoc = {
        ...existing,
        ...doc,
        content: cleanContent,
        version: existing.version + 1,
        updatedAt: new Date().toISOString(),
        history: [...(existing.history || []), historyItem],
      };
    } else {
      finalDoc = {
        id: doc.id || `doc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        projectId: doc.projectId,
        title: doc.title,
        description: doc.description || 'Knowledge Document',
        category: doc.category || 'GAME_DESIGN',
        content: cleanContent,
        source: doc.source || 'Project Workspace',
        sourceType: doc.sourceType || 'USER',
        tags: doc.tags || ['Document'],
        version: 1,
        status: doc.status || 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: doc.createdBy || 'Game Architect',
        lastVerifiedAt: doc.confidence === 'VERIFIED' ? new Date().toISOString() : undefined,
        confidence: doc.confidence || 'VERIFIED',
        history: [],
      };
    }

    const current = await this.getDocuments(doc.projectId);
    const updatedList = existing
      ? current.map((d) => (d.id === finalDoc.id ? finalDoc : d))
      : [finalDoc, ...current];

    this.documents.set(doc.projectId, updatedList);

    await activityService.logActivity(
      'SYSTEM_EVENT',
      finalDoc.createdBy,
      `Saved knowledge document [${finalDoc.category}]: "${finalDoc.title}" (v${finalDoc.version})`,
      doc.projectId
    );

    return finalDoc;
  }

  async verifyDocument(projectId: string, id: string, verifiedBy: string = 'Game Architect'): Promise<KnowledgeDocument | null> {
    const doc = await this.getDocumentById(projectId, id);
    if (!doc) return null;

    doc.confidence = 'VERIFIED';
    doc.lastVerifiedAt = new Date().toISOString();
    doc.updatedAt = new Date().toISOString();

    await activityService.logActivity(
      'SYSTEM_EVENT',
      verifiedBy,
      `Verified knowledge document: "${doc.title}"`,
      projectId
    );

    return doc;
  }

  async archiveDocument(projectId: string, id: string): Promise<boolean> {
    const doc = await this.getDocumentById(projectId, id);
    if (!doc) return false;

    doc.status = 'ARCHIVED';
    doc.updatedAt = new Date().toISOString();

    await activityService.logActivity(
      'SYSTEM_EVENT',
      'Game Architect',
      `Archived knowledge document: "${doc.title}"`,
      projectId
    );

    return true;
  }

  /**
   * Ingestion pipeline: IMPORT -> PARSE -> CLASSIFY -> EXTRACT -> VALIDATE -> DETECT DUPLICATES -> DETECT CONFLICTS -> STORE
   */
  async importKnowledge(params: {
    projectId: string;
    rawText: string;
    filename?: string;
    sourceType?: KnowledgeDocument['sourceType'];
    author?: string;
  }): Promise<{
    document: KnowledgeDocument;
    conflictsDetected: number;
    warnings: string[];
  }> {
    const sanitized = projectIndexService.sanitizeKnowledgeContent(params.rawText);
    const lines = sanitized.split('\n');
    const firstHeader = lines.find((l) => l.startsWith('#')) || lines[0] || 'Imported Knowledge Document';
    const cleanTitle = firstHeader.replace(/^#+\s*/, '').trim() || (params.filename || 'Imported Document');

    // Classification
    let category: MemoryCategory = 'GAME_DESIGN';
    const lower = sanitized.toLowerCase();
    if (lower.includes('shader') || lower.includes('mesh') || lower.includes('texture') || lower.includes('asset')) {
      category = 'ASSETS';
    } else if (lower.includes('godot') || lower.includes('engine') || lower.includes('wasm') || lower.includes('code')) {
      category = 'TECHNICAL_ARCHITECTURE';
    } else if (lower.includes('sparkit') || lower.includes('creature') || lower.includes('monster')) {
      category = 'CREATURES';
    } else if (lower.includes('combat') || lower.includes('capture') || lower.includes('damage') || lower.includes('battle')) {
      category = 'GAMEPLAY_SYSTEMS';
    }

    const existingDocs = await this.getDocuments(params.projectId);
    const existingMemories = await memoryService.getMemories(params.projectId);

    // Duplicate detection
    const duplicate = existingDocs.find((d) => d.title.toLowerCase() === cleanTitle.toLowerCase());
    const warnings: string[] = [];
    if (duplicate) {
      warnings.push(`Existing document "${duplicate.title}" already exists. Creating as updated version.`);
    }

    // Conflict detection
    const conflicts = await knowledgeConflictService.detectConflicts(
      params.projectId,
      { title: cleanTitle, content: sanitized, source: params.filename || 'Import Pipeline' },
      existingDocs,
      existingMemories
    );

    // Persist as new or updated document
    const doc = await this.saveDocument({
      id: duplicate ? duplicate.id : undefined,
      projectId: params.projectId,
      title: cleanTitle,
      description: `Imported from ${params.filename || 'Direct Text Input'}`,
      category,
      content: sanitized,
      source: params.filename || 'Manual Import',
      sourceType: params.sourceType || 'DOCUMENT',
      tags: ['Imported', category],
      createdBy: params.author || 'User',
      confidence: conflicts.length > 0 ? 'CONFLICTING' : 'LIKELY',
    });

    return {
      document: doc,
      conflictsDetected: conflicts.length,
      warnings,
    };
  }

  /**
   * Health computation: verified knowledge, conflicts, missing documentation, orphaned assets, etc.
   */
  async getKnowledgeHealth(projectId: string): Promise<KnowledgeHealthReport> {
    const docs = await this.getDocuments(projectId);
    const memories = await memoryService.getMemories(projectId);
    const conflicts = await knowledgeConflictService.getConflicts(projectId);
    const decisions = await decisionService.getDecisions(projectId);
    const codeIndex = await projectIndexService.getCodeIndex(projectId);
    const assetIndex = await projectIndexService.getAssetIndex(projectId);

    const verifiedDocs = docs.filter((d) => d.confidence === 'VERIFIED').length;
    const verifiedMems = memories.filter((m) => m.confidence === 'VERIFIED').length;
    const verifiedKnowledgeCount = verifiedDocs + verifiedMems;

    const unverifiedDocs = docs.filter((d) => d.confidence === 'UNVERIFIED' || d.confidence === 'LIKELY').length;
    const unverifiedMems = memories.filter((m) => m.confidence === 'UNVERIFIED' || m.confidence === 'LIKELY').length;
    const unverifiedKnowledgeCount = unverifiedDocs + unverifiedMems;

    const openConflicts = conflicts.filter((c) => c.status === 'OPEN' || c.status === 'UNDER_REVIEW').length;
    const outdatedKnowledgeCount = docs.filter((d) => d.status === 'SUPERSEDED' || d.confidence === 'OUTDATED').length;

    // Detect missing systems documentation
    const coveredSystems = new Set(docs.map((d) => String(d.category)));
    const codeSystems = new Set(codeIndex.map((c) => c.system));
    let undocumentedSystemsCount = 0;
    const warnings: KnowledgeHealthReport['warnings'] = [];

    for (const sys of codeSystems) {
      if (!coveredSystems.has('GAMEPLAY_SYSTEMS') && !coveredSystems.has('TECHNICAL_ARCHITECTURE')) {
        undocumentedSystemsCount++;
        warnings.push({
          severity: 'WARNING',
          message: `Code system "${sys}" has incomplete technical documentation in knowledge base.`,
        });
      }
    }

    // Check for orphaned assets
    const orphanedAssets = assetIndex.filter((a) => a.codeSystems.length === 0 || a.integrationTasks.length === 0);
    const orphanedAssetsCount = orphanedAssets.length;
    if (orphanedAssetsCount > 0) {
      warnings.push({
        severity: 'INFO',
        message: `${orphanedAssetsCount} assets currently have no active code system references.`,
      });
    }

    if (openConflicts > 0) {
      warnings.push({
        severity: 'CRITICAL',
        message: `${openConflicts} unresolved knowledge contradiction(s) detected in canon specifications.`,
      });
    }

    // Undocumented decisions
    const undocumentedDecisionsCount = decisions.filter((d) => !d.reason || d.reason.length < 10).length;

    // Overall Health Score calculation (0-100)
    let score = 95;
    score -= openConflicts * 15;
    score -= unverifiedKnowledgeCount * 3;
    score -= undocumentedSystemsCount * 5;
    score -= orphanedAssetsCount * 2;
    score = Math.max(20, Math.min(100, score));

    return {
      verifiedKnowledgeCount,
      unverifiedKnowledgeCount,
      conflictsCount: openConflicts,
      outdatedKnowledgeCount,
      missingDocsCount: Math.max(0, 3 - docs.length),
      orphanedAssetsCount,
      undocumentedSystemsCount,
      undocumentedDecisionsCount,
      healthScore: score,
      warnings,
    };
  }

  // Questions / Ambiguity handling
  async getQuestions(projectId: string): Promise<KnowledgeQuestion[]> {
    return this.questions.get(projectId) || [];
  }

  async answerQuestion(projectId: string, id: string, answer: string): Promise<KnowledgeQuestion | null> {
    const list = await this.getQuestions(projectId);
    const q = list.find((item) => item.id === id);
    if (!q) return null;

    q.status = 'ANSWERED';
    q.userAnswer = answer;
    q.answeredAt = new Date().toISOString();

    // Turn user answer into verified project memory
    await memoryService.saveMemory({
      projectId,
      category: 'DESIGN_DECISIONS',
      title: `Clarification: ${q.question}`,
      content: answer,
      tags: ['User Clarification', 'Canon Rule'],
    });

    await activityService.logActivity(
      'SYSTEM_EVENT',
      'Game Architect',
      `Answered knowledge question: "${q.question}" -> "${answer}"`,
      projectId
    );

    return q;
  }
}

export const knowledgeBaseService = new KnowledgeBaseService();
