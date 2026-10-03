// Phase 6: AI Asset Generation & Management Pipeline Types

export type AssetCategoryType =
  | 'IMAGE'
  | '3D_MODEL'
  | 'TEXTURE'
  | 'MATERIAL'
  | 'CHARACTER'
  | 'CREATURE'
  | 'NPC'
  | 'ANIMATION'
  | 'VFX'
  | 'ICON'
  | 'UI_ASSET'
  | 'ENVIRONMENT'
  | 'PROP'
  | 'WEAPON'
  | 'ITEM'
  | 'AUDIO'
  | 'MUSIC'
  | 'SOUND_EFFECT'
  | 'VOICE'
  | 'VIDEO'
  | 'CINEMATIC'
  | 'OTHER';

export type AssetLifecycleStatus =
  | 'REQUESTED'
  | 'PLANNING'
  | 'GENERATING'
  | 'PROCESSING'
  | 'VALIDATING'
  | 'REVIEW_REQUIRED'
  | 'APPROVED'
  | 'REJECTED'
  | 'IMPORTING'
  | 'IMPORTED'
  | 'FAILED'
  | 'ARCHIVED';

export type GenerationJobStatus =
  | 'QUEUED'
  | 'STARTING'
  | 'GENERATING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export interface AssetOptimizationTargets {
  platform: 'Mobile' | 'PC' | 'Console';
  maxPolygonCount: number;
  maxTextureResolution: number;
  maxFileSizeBytes: number;
  lodRequired: boolean;
  targetDrawCalls?: number;
}

export interface AssetValidationCheck {
  id: string;
  name: string;
  category: 'Integrity' | 'Geometry' | 'Textures' | 'Rigging' | 'Audio' | 'Performance';
  status: 'PASS' | 'WARNING' | 'FAIL';
  details: string;
  metric?: string;
}

export interface AssetValidationResult {
  assetId: string;
  timestamp: string;
  verdict: 'APPROVED' | 'REVIEW_REQUIRED' | 'REJECTED';
  checks: AssetValidationCheck[];
  warningsCount: number;
  failuresCount: number;
  score: number; // 0 - 100
  recommendations: string[];
}

export interface AssetVersionRecord {
  version: string;
  createdAt: string;
  thumbnailUrl?: string;
  fileLocation?: string;
  fileSize?: string;
  polygonCount?: number;
  changeNotes: string;
  provider: string;
  model: string;
  prompt: string;
}

export interface AssetDependency {
  id: string;
  name: string;
  type: AssetCategoryType;
  required: boolean;
  status: 'RESOLVED' | 'MISSING' | 'OPTIONAL';
  targetAssetId?: string;
}

export interface AssetRejectionRecord {
  id: string;
  rejectedAt: string;
  rejectedBy: string;
  version: string;
  reason: string;
  suggestedAdjustments?: string;
}

export interface AssetGenerationPlanStage {
  step: number;
  name: string;
  description: string;
  providerCategory: 'IMAGE' | '3D' | 'AUDIO' | 'VOICE' | 'VIDEO' | 'INTERNAL';
  estimatedSeconds: number;
}

export interface AssetGenerationPlan {
  id: string;
  assetName: string;
  assetType: AssetCategoryType;
  purpose: string;
  requirements: string[];
  requiredOutputs: string[];
  stages: AssetGenerationPlanStage[];
  targetOptimization: AssetOptimizationTargets;
  status: 'AWAITING_APPROVAL' | 'APPROVED' | 'EDITING' | 'CANCELLED';
  createdAt: string;
}

export interface AssetGenerationJob {
  jobId: string;
  assetId: string;
  projectId: string;
  provider: string;
  model: string;
  status: GenerationJobStatus;
  progress: number; // 0 - 100
  prompt: string;
  negativePrompt?: string;
  references: string[];
  startedAt: string;
  completedAt?: string;
  error?: string;
  outputIds: string[];
  costCredits?: number;
}

export interface AssetProviderInfo {
  id: string;
  name: string;
  category: 'IMAGE' | '3D' | 'AUDIO' | 'VOICE' | 'VIDEO';
  model: string;
  status: 'CONFIGURED' | 'READY' | 'RATE_LIMITED' | 'NOT_CONFIGURED';
  capabilities: string[];
  lastUsed?: string;
  estimatedCostPerUnit?: string;
  latencyAvgSeconds: number;
  isDefault: boolean;
}

export interface CreatureSpecification {
  name: string;
  speciesCategory: string;
  elementalType: 'Fire' | 'Water' | 'Grass' | 'Electric' | 'Earth' | 'Air' | 'Psychic' | 'Shadow';
  evolutionStage: 1 | 2 | 3;
  sizeCategory: 'Tiny' | 'Small' | 'Medium' | 'Large' | 'Behemoth';
  battleRole: 'Fast Striker' | 'Tank' | 'Support' | 'Special Attacker';
  personality: string;
  colorPalette: string[];
  signatureAbilities: string[];
  requestedAnimations: (
    | 'Idle'
    | 'Walk'
    | 'Run'
    | 'Attack'
    | 'Hit'
    | 'Capture'
    | 'Victory'
    | 'Defeat'
  )[];
}

export interface ProjectArtDirection {
  visualStyle: string;
  colorPalette: { name: string; hex: string; role: string }[];
  lightingMood: string;
  materialsPbr: string;
  characterProportions: string;
  creatureDesignLanguage: string;
  environmentStyle: string;
  uiStyle: string;
  vfxStyle: string;
  cameraStyle: string;
  animationStyle: string;
  assetQualityTarget: 'Stylized PBR' | 'Toon Shaded' | 'Photoreal';
  platformOptimizationTarget: 'Mobile (Godot Forward+ / Mobile Vulkan)' | 'PC High' | 'WebAssembly';
}

export interface AssetUsageReference {
  location: string;
  sceneName: string;
  system: string;
  type: 'Hard Reference' | 'Spawn Table' | 'UI Skin' | 'Audio Trigger';
}

export interface AssetIntegrationTaskSuggestion {
  title: string;
  description: string;
  suggestedFiles: string[];
  category: string;
}
