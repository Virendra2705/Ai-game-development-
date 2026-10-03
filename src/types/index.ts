export type ProjectStatus = 'Development' | 'Alpha' | 'Beta' | 'Shipped' | 'Paused';
export type EngineType = 'Godot' | 'Unity' | 'Unreal' | 'Web/HTML5' | 'Custom';
export type PlatformType = 'Android / PC' | 'Web' | 'Android' | 'PC' | 'Cross Platform';
export type DevMode = 'Standard' | 'Autonomous Loop' | 'Human-in-the-Loop' | 'Prototype';

export type ProjectPhase =
  | '1. PROJECT_SETUP'
  | '2. GAME_DESIGN'
  | '3. CORE_SYSTEMS'
  | '4. GAMEPLAY'
  | '5. WORLD_BUILDING'
  | '6. CONTENT'
  | '7. UI'
  | '8. TESTING'
  | '9. OPTIMIZATION'
  | '10. RELEASE';

export interface Project {
  id: string;
  name: string;
  slug?: string;
  description: string;
  genre: string;
  engine: EngineType;
  platforms?: string[];
  platform?: PlatformType; // For backward compatibility with Phase 1 components
  status: ProjectStatus;
  progress: number;
  currentPhase: ProjectPhase | string;
  phaseProgress?: number;
  thumbnail?: string;
  thumbnailUrl?: string; // Phase 1 compatibility
  createdAt: string;
  updatedAt?: string;
  lastUpdated?: string; // Phase 1 compatibility
  ownerId?: string;
  repositoryUrl?: string;
  repoUrl?: string; // Phase 1 compatibility
  previewUrl?: string;
  currentBuildId?: string;
  resolution?: string;
  devMode?: DevMode;
  isOnboarding?: boolean; // Section 20: newly created project onboarding state
  // Phase 4: Git Repository Integration
  repositoryProvider?: 'GitHub' | 'GitLab' | 'Bitbucket' | string;
  repositoryOwner?: string;
  repositoryName?: string;
  defaultBranch?: string;
  developmentBranch?: string;
  repositoryStatus?: 'Connected' | 'Not Connected' | 'Configuring';
}

export type AgentStatus =
  | 'IDLE'
  | 'READY'
  | 'PLANNING'
  | 'WORKING'
  | 'TESTING'
  | 'ERROR'
  | 'OFFLINE'
  | 'Ready'
  | 'Working'
  | 'Idle'
  | 'Testing'
  | 'Offline'; // Case compatibility

export interface Agent {
  id: string;
  projectId?: string;
  name: string;
  role: string;
  description: string;
  status: AgentStatus;
  currentTaskId?: string;
  currentTask?: string;
  provider?: 'Gemini' | 'Codex' | 'Claude' | 'Local' | 'Not Connected' | string;
  model?: string;
  capabilities?: string[];
  lastActive: string;
  createdAt?: string;
  // UI Presentation helpers
  iconName: string;
  completedTasksCount: number;
  successRate: number;
  responsibilities: string[];
  specialty?: string;
  futureAIProvider?: 'Gemini' | 'Codex' | 'Claude' | 'Not Connected';
  providerStatus?: string;
  colorScheme: {
    accent: string;
    border: string;
    bg: string;
  };
}

export type TaskStatus =
  | 'BACKLOG'
  | 'QUEUED'
  | 'PREPARING'
  | 'ANALYZING'
  | 'IMPLEMENTING'
  | 'TESTING'
  | 'REVIEW'
  | 'APPROVAL_REQUIRED'
  | 'IN_PROGRESS'
  | 'PLANNING'
  | 'BLOCKED'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED'
  | 'Queued'
  | 'Planning'
  | 'Working'
  | 'Testing'
  | 'Completed'
  | 'Failed'; // Phase 1 & 2 compatibility

export type TaskPriority =
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'CRITICAL'
  | 'Low'
  | 'Medium'
  | 'High'
  | 'Critical';

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedAgentId?: string;
  agentId?: string; // Phase 1 compatibility
  category?: string;
  createdBy?: string;
  progress: number;
  dependencies?: string[]; // List of task IDs this task depends on (Section 15)
  tags: string[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  // Phase 4: Coding Agent & Workspace Integration
  isCodingTask?: boolean;
  codingStatus?: TaskStatus;
  workspaceId?: string;
  branchName?: string;
  activeAttemptId?: string;
  commitHash?: string;
  pullRequestId?: string;
  filesChangedCount?: number;
  testsPassedCount?: number;
}

export type BuildStatus =
  | 'QUEUED'
  | 'BUILDING'
  | 'SUCCESS'
  | 'FAILED'
  | 'CANCELLED'
  | 'Ready'
  | 'Successful'
  | 'Success'
  | 'Building'
  | 'Failed';

export interface BuildCheck {
  name: string;
  passed: boolean;
  duration?: string;
}

export interface Build {
  id: string;
  projectId: string;
  version: string;
  status: BuildStatus;
  branch?: string;
  commit: string;
  startedAt?: string;
  completedAt?: string;
  duration: string;
  testsPassed?: number;
  testsFailed?: number;
  logs: string[];
  // Phase 1 compatibility
  buildNumber?: number;
  commitMsg?: string;
  date?: string;
  tests?: string;
  platform?: string;
  checks?: BuildCheck[];
}

export * from './assets';

export type AssetCategory =
  | 'CHARACTER'
  | 'CREATURE'
  | 'ENVIRONMENT'
  | 'BUILDING'
  | 'WEAPON'
  | 'ITEM'
  | 'UI'
  | 'AUDIO'
  | 'VFX'
  | 'ANIMATION'
  | 'OTHER'
  | 'IMAGE'
  | '3D_MODEL'
  | 'TEXTURE'
  | 'MATERIAL'
  | 'NPC'
  | 'ICON'
  | 'UI_ASSET'
  | 'PROP'
  | 'MUSIC'
  | 'SOUND_EFFECT'
  | 'VOICE'
  | 'VIDEO'
  | 'CINEMATIC'
  // Phase 1 compatibility
  | 'Characters'
  | 'Creatures'
  | '2D Sprites'
  | '3D Models'
  | 'Environment'
  | 'Audio'
  | 'Textures'
  | 'Items'
  | 'UI Components'
  | 'Scripts'
  | 'Scenes';

export type AssetType = AssetCategory;

export type AssetStatus =
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
  | 'ARCHIVED'
  | 'READY'
  | 'REVIEW'
  | 'INTEGRATED'
  | 'Ready'
  | 'Generating'
  | 'Review'
  | 'Approved'
  | 'Integrated'
  | 'Requested';

export interface Asset {
  id: string;
  assetId?: string;
  projectId: string;
  name: string;
  type: AssetCategory | string;
  subtype?: string;
  description?: string;
  status: AssetStatus;
  provider?: string;
  model?: string;
  version: string;
  prompt?: string;
  negativePrompt?: string;
  references?: string[];
  referenceAssetIds?: string[];
  sourceAssetIds?: string[];
  fileLocation?: string;
  thumbnail?: string;
  thumbnailUrl?: string;
  fileUrl?: string;
  format?: string;
  dimensions?: string;
  polygonCount?: number;
  polyCount?: string;
  textureResolution?: string;
  duration?: string;
  fileSize?: string;
  size?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
  approvedAt?: string;
  importedAt?: string;
  isFavorite?: boolean;
  isArchived?: boolean;
  createdByAgentId?: string;
  agentResponsibleId?: string; // Phase 1 compatibility
  usedIn?: string;
  previewType?: '3d' | 'image' | 'audio' | 'ui' | 'video';
  previewColor?: string;
  lastModified?: string;
  createdBy?: string;
  dependencies?: any[];
  rejectionHistory?: any[];
  versionHistory?: any[];
  validationResult?: any;
  usageLocations?: any[];
}

export type TestCategory =
  | 'STARTUP'
  | 'GAMEPLAY'
  | 'UI'
  | 'COMBAT'
  | 'SAVE'
  | 'NETWORK'
  | 'PERFORMANCE'
  | 'ASSET'
  | 'MOBILE'
  | 'OTHER';

export type TestStatus =
  | 'PENDING'
  | 'RUNNING'
  | 'PASSED'
  | 'FAILED'
  | 'WARNING'
  | 'Passed'
  | 'Failed'
  | 'Warning'
  | 'Pending';

export interface TestCase {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  category: TestCategory | string;
  status: TestStatus;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  lastRun: string;
  duration: string;
  errorMessage?: string;
  errorSnippet?: string;
  details?: string;
  buildId?: string;
}

export type ActivityType =
  | 'PROJECT_CREATED'
  | 'TASK_CREATED'
  | 'TASK_UPDATED'
  | 'TASK_COMPLETED'
  | 'AGENT_STARTED'
  | 'AGENT_FINISHED'
  | 'BUILD_STARTED'
  | 'BUILD_COMPLETED'
  | 'BUILD_FAILED'
  | 'TEST_STARTED'
  | 'TEST_COMPLETED'
  | 'ASSET_CREATED'
  | 'ASSET_UPDATED'
  | 'ASSET_PLAN_CREATED'
  | 'ASSET_APPROVED'
  | 'ASSET_REJECTED'
  | 'ASSET_IMPORTED'
  | 'CODING_TASK_STARTED'
  | 'WORKSPACE_CREATED'
  | 'REPOSITORY_ANALYZED'
  | 'IMPLEMENTATION_STARTED'
  | 'FILES_MODIFIED'
  | 'TESTS_STARTED'
  | 'TESTS_PASSED'
  | 'TESTS_FAILED'
  | 'REVIEW_REQUESTED'
  | 'CHANGES_APPROVED'
  | 'COMMIT_CREATED'
  | 'PULL_REQUEST_CREATED'
  | 'SYSTEM_EVENT'
  | 'agent'
  | 'build'
  | 'user'
  | 'test'
  | 'asset'
  | 'command';

export interface Activity {
  id: string;
  projectId: string;
  type: ActivityType;
  actor?: string;
  actorId?: string;
  message?: string;
  metadata?: Record<string, any>;
  createdAt?: string;
  // UI Presentation helpers
  title?: string;
  description?: string;
  timestamp?: string;
  timeAgo?: string;
  agentId?: string;
}

// ==========================================
// SECTION 12: PROJECT MEMORY SYSTEM
// ==========================================
export type MemoryCategory =
  | 'GAME_VISION'
  | 'GAME_DESIGN'
  | 'TECHNICAL_ARCHITECTURE'
  | 'GAMEPLAY_SYSTEMS'
  | 'CHARACTERS'
  | 'CREATURES'
  | 'WORLD'
  | 'REGIONS'
  | 'LEVELS'
  | 'QUESTS'
  | 'ITEMS'
  | 'COMBAT'
  | 'UI'
  | 'AUDIO'
  | 'ASSETS'
  | 'CODE_ARCHITECTURE'
  | 'BUILD_CONFIGURATION'
  | 'QA'
  | 'BUGS'
  | 'PERFORMANCE'
  | 'RESEARCH'
  | 'DESIGN_DECISIONS'
  | 'DEVELOPMENT_HISTORY'
  | 'AGENT_LEARNINGS'
  | 'KNOWN_LIMITATIONS'
  | 'IMPORTANT_CONSTRAINTS'
  | 'FUTURE_FEATURES'
  | 'CURRENT_DEVELOPMENT_STATUS'
  | 'KNOWN_BUGS'
  | 'DECISIONS';

export type KnowledgeConfidence =
  | 'VERIFIED'
  | 'HIGH_CONFIDENCE'
  | 'LIKELY'
  | 'UNVERIFIED'
  | 'CONFLICTING'
  | 'OUTDATED';

export type MemoryPriority = 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW';

export interface MemoryVersionRecord {
  version: number;
  title: string;
  content: string;
  changedBy: string;
  changeReason: string;
  timestamp: string;
}

export interface MemoryEntry {
  id: string;
  projectId: string;
  category: MemoryCategory;
  title: string;
  content: string;
  tags: string[];
  authorAgent: string;
  updatedAt: string;
  version: number;
  confidence?: KnowledgeConfidence;
  priority?: MemoryPriority;
  status?: 'ACTIVE' | 'SUPERSEDED' | 'ARCHIVED';
  supersededBy?: string;
  lastVerifiedAt?: string;
  history?: MemoryVersionRecord[];
}

export interface ProjectMemorySnapshot {
  projectId: string;
  projectName: string;
  gameVision?: string;
  technicalArchitecture?: string;
  gameplaySystems?: string[];
  constraints?: string[];
  decisions?: DevelopmentDecision[];
  knownBugs?: string[];
  entries: MemoryEntry[];
}

// ==========================================
// SECTION 13: DEVELOPMENT DECISIONS
// ==========================================
export interface DevelopmentDecision {
  id: string;
  projectId: string;
  title: string;
  reason: string;
  decision?: string;
  context?: string;
  alternatives?: string[];
  alternativesConsidered?: string[];
  impact?: string;
  relatedTasks?: string[];
  relatedFiles?: string[];
  relatedAssets?: string[];
  createdBy: string;
  date: string;
  createdAt?: string;
  status: 'ACTIVE' | 'SUPERSEDED' | 'REJECTED' | 'APPROVED';
  category?: string;
}

// ==========================================
// PHASE 8: KNOWLEDGE BASE & LONG-TERM MEMORY
// ==========================================
export type KnowledgeDocumentSourceType =
  | 'USER'
  | 'AI'
  | 'RESEARCH'
  | 'CODE'
  | 'ASSET'
  | 'TASK'
  | 'QA'
  | 'BUILD'
  | 'DOCUMENT'
  | 'AGENT'
  | 'SYSTEM';

export interface KnowledgeDocument {
  id: string;
  projectId: string;
  title: string;
  description: string;
  category: MemoryCategory | string;
  content: string;
  source: string;
  sourceType: KnowledgeDocumentSourceType;
  tags: string[];
  version: number;
  status: 'ACTIVE' | 'SUPERSEDED' | 'ARCHIVED' | 'DRAFT';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastVerifiedAt?: string;
  confidence: KnowledgeConfidence;
  history?: MemoryVersionRecord[];
}

export type ResearchFactType =
  | 'PROJECT_FACT'
  | 'RESEARCH_FACT'
  | 'AI_INFERENCE'
  | 'USER_DECISION'
  | 'UNVERIFIED_INFORMATION';

export interface ResearchFinding {
  text: string;
  factType: ResearchFactType;
  sourceIndex?: number;
}

export interface ResearchRecord {
  id: string;
  projectId: string;
  query: string;
  summary: string;
  findings: ResearchFinding[];
  sources: string[];
  sourceUrls?: string[];
  publishedDates?: string[];
  retrievedAt: string;
  retrievedBy?: string;
  agentId: string;
  confidence: KnowledgeConfidence;
  status: 'VERIFIED' | 'UNVERIFIED' | 'UNAVAILABLE' | 'OUTDATED';
  relatedKnowledgeIds?: string[];
  relatedTasks?: string[];
}

export interface KnowledgeConflictSource {
  id?: string;
  title?: string;
  statement: string;
  source?: string;
  type?: string;
  confidence?: KnowledgeConfidence;
}

export interface KnowledgeConflict {
  id: string;
  projectId: string;
  title?: string;
  knowledgeA?: KnowledgeConflictSource;
  knowledgeB?: KnowledgeConflictSource;
  sourceA?: KnowledgeConflictSource;
  sourceB?: KnowledgeConflictSource;
  reason: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'IGNORED';
  resolution?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  detectedAt?: string;
}

export interface AgentLearning {
  id: string;
  projectId: string;
  agentId: string;
  title: string;
  learning: string;
  evidence: string;
  confidence: KnowledgeConfidence;
  relatedTasks?: string[];
  relatedRuns?: string[];
  createdAt: string;
  status?: 'APPROVED' | 'PENDING_REVIEW' | 'REJECTED';
}

export interface DevelopmentHistoryEvent {
  id: string;
  projectId: string;
  eventType:
    | 'PROJECT_CREATED'
    | 'GAME_DESIGN_UPDATED'
    | 'CREATURE_ADDED'
    | 'ARCHITECTURE_CHANGED'
    | 'ASSET_GENERATED'
    | 'TASK_COMPLETED'
    | 'BUG_DISCOVERED'
    | 'BUG_FIXED'
    | 'BUILD_CREATED'
    | 'QA_FAILED'
    | 'QA_PASSED'
    | 'RESEARCH_ADDED'
    | 'DECISION_MADE'
    | 'AGENT_LEARNED';
  title: string;
  description: string;
  timestamp: string;
  sourceId?: string;
  sourceType?: string;
  actor: string;
  metadata?: Record<string, any>;
}

export interface CodeIndexFile {
  path: string;
  name: string;
  type: string;
  system: string;
  classes: string[];
  functions: string[];
  imports: string[];
  dependencies: string[];
  lines: number;
  lastModified: string;
}

export interface AssetIndexEntry {
  assetId: string;
  name: string;
  type: string;
  version: string;
  prompt?: string;
  references?: string[];
  validationStatus: string;
  integrationTasks: string[];
  codeSystems: string[];
  buildVerified: boolean;
  qaTested: boolean;
}

export interface ContextBudget {
  maxTokens?: number;
  maxMemories?: number;
  maxDocuments?: number;
  maxResearch?: number;
  maxCodeFiles?: number;
  maxAssets?: number;
  maxTasks?: number;
  maxHistoryEvents?: number;
}

export interface ContextPackage {
  id: string;
  projectId: string;
  request: string;
  relevantMemory: MemoryEntry[];
  relevantDocuments: KnowledgeDocument[];
  relevantCodeContext: CodeIndexFile[];
  relevantAssets: Asset[];
  relevantTasks: Task[];
  relevantResearch: ResearchRecord[];
  relevantDecisions: DevelopmentDecision[];
  relevantBugs: any[];
  constraints: string[];
  dependencies: string[];
  previousAttempts: any[];
  generatedAt: string;
  expiresAt?: string;
}

export interface AgentContextBrief {
  taskId?: string;
  taskTitle: string;
  targetAgent?: string;
  relevantSystems: string[];
  relevantAssets: string[];
  importantDecisions: string[];
  knownBugs: string[];
  constraints: string[];
  expectedResult: string;
  confidenceSummary: {
    verifiedCount: number;
    unverifiedCount: number;
    warnings: string[];
  };
}

export type GraphEntityType =
  | 'Creature'
  | 'Character'
  | 'NPC'
  | 'Region'
  | 'Quest'
  | 'Item'
  | 'Weapon'
  | 'Ability'
  | 'System'
  | 'CodeFile'
  | 'Asset'
  | 'Task'
  | 'Bug'
  | 'Decision'
  | 'Research'
  | 'Document'
  | 'Agent';

export type GraphRelationshipType =
  | 'HAS_TYPE'
  | 'EVOLVES_TO'
  | 'USES'
  | 'APPEARS_IN'
  | 'REQUIRES'
  | 'INVOLVES'
  | 'IMPLEMENTS'
  | 'AFFECTS'
  | 'MODIFIES'
  | 'DEPENDS_ON'
  | 'RESEARCHED_BY'
  | 'LEARNED_FROM';

export interface GraphNode {
  id: string;
  name: string;
  type: GraphEntityType;
  description?: string;
  category?: string;
  confidence?: KnowledgeConfidence;
  metadata?: Record<string, any>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  relationship: GraphRelationshipType;
  label: string;
}

export interface KnowledgeGraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface KnowledgeHealthReport {
  verifiedKnowledgeCount: number;
  unverifiedKnowledgeCount: number;
  conflictsCount: number;
  outdatedKnowledgeCount: number;
  missingDocsCount: number;
  orphanedAssetsCount: number;
  undocumentedSystemsCount: number;
  undocumentedDecisionsCount: number;
  healthScore: number;
  warnings: {
    severity: 'WARNING' | 'CRITICAL' | 'INFO';
    message: string;
    entityId?: string;
    entityType?: string;
  }[];
}

export interface KnowledgeQuestion {
  id: string;
  projectId: string;
  question: string;
  reason: string;
  blocking: boolean;
  status: 'UNANSWERED' | 'ANSWERED' | 'RESEARCHING';
  suggestedAnswers?: string[];
  userAnswer?: string;
  createdAt: string;
  answeredAt?: string;
}

// ==========================================
// SECTION 28: FUTURE AI AGENT & CODEX INTERFACE
// ==========================================
export interface AIAgentRequest {
  projectId: string;
  taskId: string;
  projectMemory: ProjectMemorySnapshot;
  taskDescription: string;
  constraints: string[];
  targetEngine?: EngineType;
}

export interface AIAgentResponse {
  status: 'SUCCESS' | 'ERROR' | 'PARTIAL';
  summary: string;
  changes: string[];
  filesChanged: string[];
  tests: string[];
  errors: string[];
  nextActions: string[];
  executionTimeMs?: number;
}

/**
 * Section 32: Generic AgentExecutionRequest for future Coding Agent (Codex) compatibility
 */
export interface AgentExecutionRequest {
  projectId: string;
  taskId: string;
  agentId: string;
  taskDescription: string;
  projectContext: any;
  constraints: string[];
  dependencies: string[];
}

/**
 * Section 32: Generic AgentExecutionResult for future Coding Agent (Codex) compatibility
 */
export interface AgentExecutionResult {
  status: 'SUCCESS' | 'ERROR' | 'PARTIAL' | 'QUEUED';
  summary: string;
  filesChanged: string[];
  tests: string[];
  errors: string[];
  logs: string[];
  nextActions: string[];
}

// ==========================================
// PHASE 3: AI ORCHESTRATOR & GEMINI PLANNING
// ==========================================
export type AIPlanStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'EXECUTED'
  | 'FAILED';

export interface ProposedTask {
  id?: string;
  title: string;
  description: string;
  priority: TaskPriority;
  dependencies: string[];
  recommendedAgent: string;
  approved?: boolean;
}

export interface ProposedMemoryUpdate {
  id?: string;
  category: MemoryCategory | string;
  title: string;
  content: string;
  rationale?: string;
  approved?: boolean;
}

export interface ProposedDecision {
  id?: string;
  title: string;
  reason: string;
  approved?: boolean;
}

export interface AIPlanResponse {
  summary: string;
  understanding: string;
  assumptions: string[];
  questions: string[];
  risks: string[];
  recommendedPhase?: string;
  tasks: ProposedTask[];
  projectMemoryUpdates?: ProposedMemoryUpdate[];
  decisions?: ProposedDecision[];
  nextAction: 'APPROVAL_REQUIRED';
}

export interface AIPlan {
  planId: string;
  projectId: string;
  conversationId?: string;
  version: number;
  request: string;
  response: AIPlanResponse;
  status: AIPlanStatus;
  createdAt: string;
  approvedAt?: string;
  rejectedAt?: string;
}

export type MessageRole = 'USER' | 'ASSISTANT' | 'SYSTEM';

export interface AIMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  planId?: string;
  plan?: AIPlanResponse;
}

export interface AIConversation {
  conversationId: string;
  projectId: string;
  title?: string;
  messages: AIMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface AIUsageInfo {
  sessionRequests: number;
  todayRequests: number;
  estimatedTokens?: number | string;
  lastRequestTime?: string;
  provider: string;
  model: string;
}

export interface AIProviderStatus {
  connected: boolean;
  provider: string;
  model: string;
  lastTested?: string;
  message?: string;
  hasKey?: boolean;
}

export interface AIOrchestratorContext {
  projectId: string;
  projectName: string;
  genre: string;
  engine: string;
  platform?: string;
  currentPhase: string;
  relevantSystems: string[];
  knownConstraints: string[];
  existingTasks: Array<{ id: string; title: string; status: string; priority: string }>;
  importantDecisions: Array<{ title: string; reason: string }>;
  availableAgents: Array<{ name: string; role: string; specialty?: string }>;
}

// User & Settings
export interface UserProfile {
  name: string;
  email: string;
  role: string;
  avatar: string;
}

export interface AIProvider {
  id: string;
  name: string;
  description: string;
  category?: string;
  modelName?: string;
  status: 'Not Connected' | 'Connected' | 'Configuring';
  capabilities?: string[];
  docsUrl?: string;
}

export interface ProjectSettings {
  projectId: string;
  targetEngine: EngineType;
  resolution: string;
  devMode: DevMode;
  autoBuildOnTaskComplete: boolean;
  requireTestPassForMerge: boolean;
  gitIntegrationEnabled: boolean;
  repoUrl?: string;
  defaultAgentProvider: string;
}

// ==========================================
// PHASE 4: REAL CODING AGENT & GIT WORKSPACE
// ==========================================

export type RepositoryProviderType = 'GitHub' | 'GitLab' | 'Bitbucket' | 'Local';

export interface RepositoryCommitInfo {
  hash: string;
  shortHash: string;
  message: string;
  author: string;
  date: string;
}

export interface Repository {
  id: string;
  projectId: string;
  provider: RepositoryProviderType;
  url: string;
  owner: string;
  name: string;
  defaultBranch: string;
  developmentBranch: string;
  connected: boolean;
  latestCommit?: RepositoryCommitInfo;
  lastUpdated: string;
  fileCount?: number;
  languages?: string[];
  description?: string;
  createdAt: string;
}

export type WorkspaceStatus = 'INITIALIZING' | 'ACTIVE' | 'COMMITTED' | 'DISCARDED' | 'ISOLATED';

export interface Workspace {
  workspaceId: string;
  projectId: string;
  repositoryId: string;
  branch: string;
  baseBranch: string;
  allowedPaths: string[];
  forbiddenPaths: string[];
  createdAt: string;
  lastSyncedAt: string;
  status: WorkspaceStatus;
}

export type FileChangeType = 'CREATED' | 'MODIFIED' | 'DELETED';

export interface FileChange {
  id: string;
  path: string;
  changeType: FileChangeType;
  linesAdded: number;
  linesRemoved: number;
  diff: string; // Unified diff string
  originalContent?: string;
  newContent?: string;
  language?: string;
}

export type TestResultStatus = 'PASSED' | 'FAILED' | 'WARNING' | 'NOT_RUN';

export interface TestResultItem {
  id: string;
  name: string;
  durationMs: number;
  status: TestResultStatus;
  errorMessage?: string;
  stackTrace?: string;
}

export interface TestRun {
  id: string;
  attemptId: string;
  taskId: string;
  timestamp: string;
  passedCount: number;
  failedCount: number;
  warningCount: number;
  durationMs: number;
  tests: TestResultItem[];
  logs: string[];
  status: 'PASSED' | 'FAILED';
}

export interface CodebaseAnalysis {
  relevantFiles: string[];
  dependencies: string[];
  existingPatterns: string[];
  potentialConflicts: string[];
  requiredChanges: string[];
  detectedTechnology?: string;
}

export interface CodingPlan {
  filesToModify: string[];
  filesToCreate: string[];
  filesToDelete?: string[];
  testsToRun: string[];
  rationale: string;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'CANCELLED';
}

export interface ImplementationSummary {
  whatChanged: string;
  why: string;
  filesChanged: string[];
  potentialRisks: string[];
  testsAdded: string[];
  testsExecuted: string[];
  knownLimitations: string[];
}

export interface CodingLogEntry {
  timestamp: string;
  message: string;
  level: 'info' | 'warn' | 'error' | 'success';
}

export interface CodingAttempt {
  attemptId: string;
  attemptNumber: number;
  taskId: string;
  agentId: string;
  providerId: 'codex' | 'gemini' | 'mock' | string;
  workspace: Workspace;
  status: TaskStatus;
  analysis?: CodebaseAnalysis;
  plan?: CodingPlan;
  fileChanges: FileChange[];
  diff: string;
  testRun?: TestRun;
  summary?: ImplementationSummary;
  logs: CodingLogEntry[];
  error?: string;
  userFeedback?: string;
  retryCount: number;
  createdAt: string;
  completedAt?: string;
}

export type CodeReviewStatus = 'PENDING' | 'APPROVED' | 'CHANGES_REQUESTED' | 'REJECTED';

export interface CodeReview {
  id: string;
  attemptId: string;
  taskId: string;
  status: CodeReviewStatus;
  reviewer: string;
  comments: string;
  reviewedAt: string;
}

export interface GitCommit {
  hash: string;
  shortHash: string;
  taskId: string;
  attemptId: string;
  branch: string;
  message: string;
  author: string;
  filesChangedCount: number;
  testsPassedCount: number;
  committedAt: string;
  status: 'COMMITTED';
}

export interface PullRequest {
  id: string;
  prNumber: number;
  title: string;
  sourceBranch: string;
  targetBranch: string;
  summary: string;
  changes: string[];
  tests: string[];
  knownLimitations: string[];
  status: 'OPEN' | 'DRAFT' | 'READY_FOR_REVIEW';
  url?: string;
  createdAt: string;
}

export interface CodingTaskContext {
  projectId: string;
  taskId: string;
  taskTitle: string;
  taskDescription: string;
  planSummary?: string;
  relevantMemory: string[];
  relevantDecisions: string[];
  constraints: string[];
  dependencies: string[];
  expectedBehavior: string;
  testingRequirements: string[];
  allowedPaths: string[];
  forbiddenPaths: string[];
  repository: Repository;
  workspace: Workspace;
  attemptNumber: number;
  previousFeedback?: string;
}

export interface CodingAgentProviderConfig {
  id: string;
  name: string;
  providerType: 'Codex' | 'Gemini' | 'Other';
  model: string;
  status: 'Configured' | 'Architecture Ready' | 'Connected' | 'Not configured';
  workspaceAccess: 'Sandboxed' | 'Restricted' | 'Virtual';
  lastUsed?: string;
  description: string;
  isDefault?: boolean;
}

export type SecurityCommandPolicy = 'SAFE' | 'REQUIRES_APPROVAL' | 'BLOCKED';

export interface AllowlistedCommand {
  command: string;
  description: string;
  policy: SecurityCommandPolicy;
  category: 'build' | 'test' | 'lint' | 'git' | 'system';
}

export interface CodingExecutionResult {
  status: 'REVIEW_REQUIRED' | 'APPROVAL_REQUIRED' | 'COMPLETED' | 'FAILED';
  summary: string;
  filesChanged: FileChange[];
  tests: TestResultItem[];
  diff: string;
  warnings: string[];
  errors: string[];
  nextActions: string[];
}

// ===================================================
// PHASE 5: Automated Build, Game Preview, QA & Debug Loop
// ===================================================

export type BuildEngineProvider = 'Web' | 'Godot' | 'Unity' | 'Unreal' | 'Android' | 'Other';
export type BuildProfileConfiguration = 'Development' | 'Debug' | 'Release Candidate' | 'Production';

export interface BuildProfile {
  id: string;
  name: string;
  platform: 'Web' | 'Android' | 'PC' | 'iOS' | 'Cross Platform';
  configuration: BuildProfileConfiguration;
  buildProvider: BuildEngineProvider;
  outputFormat: string;
  environment: 'development' | 'staging' | 'production';
  timeoutSeconds: number;
  artifactDestination: string;
  isDefault?: boolean;
}

export interface ProjectDetectionResult {
  detectedType: 'Godot' | 'Web/React Game' | 'HTML5 Canvas' | 'Unity' | 'Unreal' | 'Android' | 'Unknown';
  confidence: 'High' | 'Medium' | 'Low' | 'Uncertain';
  buildProvider: BuildEngineProvider;
  detectedFiles: string[];
  recommendations: string[];
  isConfiguredManually?: boolean;
}

export type BuildJobStatus =
  | 'QUEUED'
  | 'PREPARING'
  | 'BUILDING'
  | 'PACKAGING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export interface BuildLogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'STEP';
  message: string;
  step?: string;
}

export interface BuildErrorDetails {
  error: string;
  failedStep: string;
  relevantLog: string;
  likelyCause: string;
  suggestedNextAction: string;
}

export interface BuildArtifact {
  id: string;
  buildId: string;
  projectId: string;
  name: string;
  filename?: string;
  platform: string;
  format: string;
  sizeBytes: number;
  sizeFormatted: string;
  checksum?: string;
  location: string;
  storagePath?: string;
  createdAt: string;
  status: 'Ready' | 'Corrupt' | 'Archived';
  isDownloadable: boolean;
}

export interface BuildJob {
  id: string;
  buildNumber: number;
  projectId: string;
  taskId?: string;
  workspaceId?: string;
  branch: string;
  profile: BuildProfile;
  status: BuildJobStatus;
  progress: number;
  currentStep: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  durationSeconds?: number;
  logs: BuildLogEntry[];
  warnings: string[];
  errors: string[];
  artifactId?: string;
  artifact?: BuildArtifact;
  errorDetails?: BuildErrorDetails;
}

export type PreviewProviderType =
  | 'InternalWebPreview'
  | 'RemotePreview'
  | 'GoogleAIStudioCompatiblePreview'
  | 'AndroidEmulator'
  | 'NativeDownloadOnly';

export type PreviewSessionStatus =
  | 'STARTING'
  | 'RUNNING'
  | 'ERROR'
  | 'STOPPING'
  | 'STOPPED';

export interface RuntimeLogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARNING' | 'ERROR';
  category: string;
  message: string;
  file?: string;
  line?: number;
}

export interface RuntimeError {
  id: string;
  projectId: string;
  previewId: string;
  buildId: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  stackTrace: string;
  file: string;
  line: number;
  timestamp: string;
  occurrences: number;
  firstSeen: string;
  lastSeen: string;
}

export interface PreviewScreenshot {
  id: string;
  previewId: string;
  timestamp: string;
  resolution: string;
  dataUrl: string;
  label?: string;
}

export interface PreviewSession {
  id: string;
  projectId: string;
  buildId: string;
  artifactId?: string;
  platform: string;
  status: PreviewSessionStatus;
  provider: PreviewProviderType;
  previewUrl?: string;
  startedAt: string;
  stoppedAt?: string;
  runtimeDurationSeconds: number;
  runtimeLogs: RuntimeLogEntry[];
  errorCount: number;
  warningCount: number;
  fps?: number;
  frameTimeMs?: number;
  memoryMB?: number;
  screenshots: PreviewScreenshot[];
}

export type QATestStatus = 'PASS' | 'FAIL' | 'WARNING' | 'SKIPPED' | 'RUNNING';

export interface QAEvidence {
  type: 'Runtime error' | 'Console log' | 'Screenshot' | 'Test result' | 'Build log';
  description: string;
  file?: string;
  line?: number;
  screenshotUrl?: string;
  rawData?: string;
}

export interface QATest {
  id: string;
  name: string;
  category: 'Functional' | 'Runtime' | 'Visual' | 'Performance' | 'Asset' | 'Gameplay';
  description: string;
  status: QATestStatus;
  durationMs: number;
  evidence?: QAEvidence;
  logs: string[];
}

export type QAReportStatus = 'PASS' | 'PASS_WITH_WARNINGS' | 'FAIL' | 'NOT ENOUGH DATA';

export interface QARun {
  id: string;
  runNumber: number;
  projectId: string;
  buildId: string;
  previewId?: string;
  status: QAReportStatus;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  warningTests: number;
  functionalTests: QATest[];
  runtimeErrors: RuntimeError[];
  visualChecks: { name: string; status: 'PASS' | 'ISSUE'; details: string }[];
  performance: {
    fps: number;
    frameTimeMs: number;
    memoryMB: number;
    status: 'GOOD' | 'WARNING';
  } | null;
  assets: { name: string; status: 'OK' | 'MISSING' }[];
  recommendations: string[];
  knownIssues: string[];
  createdAt: string;
  durationSeconds: number;
}

export type QAIssueStatus = 'OPEN' | 'TRIAGED' | 'FIXING' | 'RETEST' | 'RESOLVED' | 'WONT_FIX';

export interface QAIssue {
  id: string;
  issueNumber: number;
  projectId: string;
  buildId: string;
  previewId?: string;
  qaRunId: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  evidence: QAEvidence;
  affectedFiles: string[];
  status: QAIssueStatus;
  createdAt: string;
  resolvedAt?: string;
  linkedFixTaskId?: string;
  debugAnalysisId?: string;
}

export interface DebugAnalysis {
  id: string;
  issueId: string;
  qaRunId: string;
  projectId: string;
  title: string;
  likelyCause: string;
  evidence: string;
  affectedFiles: string[];
  confidence: 'High' | 'Medium' | 'Low';
  potentialFixes: string[];
  recommendedAction: string;
  generatedAt: string;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'APPLIED';
}

export interface DebugCycle {
  cycleNumber: number;
  maxCycles: number;
  issueId: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'LIMIT_REACHED';
  attempts: {
    cycle: number;
    buildId: string;
    fixApplied: string;
    qaStatus: QAReportStatus;
    timestamp: string;
  }[];
  currentStage:
    | 'BUG_DETECTED'
    | 'DEBUG_ANALYSIS'
    | 'AWAITING_APPROVAL'
    | 'CODING_FIX'
    | 'REBUILDING'
    | 'RETESTING'
    | 'RESOLVED';
}

export type DevLoopStage = 'CODE' | 'BUILD' | 'PREVIEW' | 'QA' | 'DEBUG' | 'RETEST' | 'RESOLVED';

export interface DevLoopPipelineStatus {
  currentStage: DevLoopStage;
  codeStatus: 'DONE' | 'WORKING';
  buildStatus: 'DONE' | 'BUILDING' | 'FAILED' | 'IDLE';
  previewStatus: 'RUNNING' | 'STOPPED' | 'IDLE';
  qaStatus: 'PASS' | 'PASS_WITH_WARNINGS' | 'FAIL' | 'IDLE';
  issuesCount: number;
  fixesCount: number;
  isPipelineRunning: boolean;
}

// ==========================================
// SECTION 14: PHASE 9 AUTONOMOUS DEVELOPMENT
// ==========================================

export type AutonomousMode =
  | 'MANUAL'
  | 'ASSISTED'
  | 'SUPERVISED_AUTONOMOUS'
  | 'AUTONOMOUS_SANDBOX';

export type AutonomousRunStatus =
  | 'PLANNING'
  | 'WAITING_APPROVAL'
  | 'READY'
  | 'RUNNING'
  | 'PAUSED'
  | 'WAITING_HUMAN'
  | 'ITERATING'
  | 'BUILDING'
  | 'TESTING'
  | 'DEBUGGING'
  | 'IMPROVING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED'
  | 'LIMIT_REACHED';

export interface DevelopmentGoal {
  id: string;
  projectId: string;
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'CANCELLED';
  milestoneIds: string[];
  createdAt: string;
  completedAt?: string;
  estimatedMilestonesCount: number;
  targetOutcome: string;
}

export type MilestoneStatus =
  | 'PLANNED'
  | 'READY'
  | 'IN_PROGRESS'
  | 'BLOCKED'
  | 'TESTING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export type QualityGateType =
  | 'CODE_QUALITY'
  | 'BUILD_SUCCESS'
  | 'RUNTIME_STARTUP'
  | 'GAMEPLAY_FUNCTIONALITY'
  | 'VISUAL_QA'
  | 'PERFORMANCE'
  | 'ASSET_VALIDATION'
  | 'MOBILE_COMPATIBILITY'
  | 'REGRESSION_TESTS';

export interface QualityGate {
  id: string;
  type: QualityGateType;
  name: string;
  description: string;
  passed: boolean;
  status: 'PENDING' | 'PASSED' | 'FAILED' | 'SKIPPED' | 'INSUFFICIENT_DATA';
  evidence?: string;
  evaluatedAt?: string;
  score?: number;
  threshold?: number;
}

export interface Milestone {
  id: string;
  projectId: string;
  goalId?: string;
  orderIndex: number;
  name: string;
  description: string;
  goal?: string;
  tasks: string[];
  dependencies: string[];
  acceptanceCriteria: string[];
  qualityGates: QualityGate[];
  status: MilestoneStatus;
  progress: number;
  startedAt?: string;
  completedAt?: string;
}

export interface RegressionTest {
  id: string;
  projectId: string;
  featureName: string;
  name: string;
  category: 'UNIT' | 'INTEGRATION' | 'GAMEPLAY' | 'ANIMATION' | 'SAVE_LOAD' | 'STATE';
  description: string;
  status: 'PASS' | 'FAIL' | 'PENDING' | 'SKIPPED';
  lastRunAt?: string;
  durationMs?: number;
  failureReason?: string;
  autoGenerated?: boolean;
}

export interface GameplayTest {
  id: string;
  projectId: string;
  action: string;
  expectedOutcome: string;
  actualOutcome?: string;
  status: 'PASS' | 'FAIL' | 'NOT_SUPPORTED' | 'PENDING';
  testedEnvironment: 'HEADLESS_CANVAS' | 'DOM_SIMULATION' | 'WEBGL_MOCK' | 'PREVIEW_BRIDGE';
  timestamp: string;
  details: string;
}

export interface ChangeImpactReport {
  id: string;
  projectId: string;
  actionTitle: string;
  affectedSystems: string[];
  affectedFiles: string[];
  affectedAssets: string[];
  affectedTests: string[];
  affectedTasks: string[];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  breakingChange: boolean;
  requiresApproval: boolean;
  summary: string;
  mitigations: string[];
  createdAt: string;
}

export type ApprovalCategory =
  | 'CODE_CHANGE'
  | 'ARCHITECTURE_CHANGE'
  | 'ASSET_CHANGE'
  | 'SECURITY_CHANGE'
  | 'SCOPE_CHANGE'
  | 'PROVIDER_CHANGE'
  | 'BUILD'
  | 'MERGE'
  | 'DEPLOYMENT';

export interface ApprovalRequest {
  id: string;
  projectId: string;
  runId?: string;
  category: ApprovalCategory;
  title: string;
  description: string;
  whatWillHappen: string;
  why: string;
  affectedFiles: string[];
  affectedSystems: string[];
  risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  evidence?: string;
  aiRecommendation: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'MORE_INFO_REQUESTED';
  createdAt: string;
  decidedAt?: string;
  decidedBy?: string;
  decisionNotes?: string;
}

export interface RunTimelineEvent {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  stage: string;
  actor: string;
  severity?: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  data?: Record<string, any>;
}

export interface RunIteration {
  iterationNumber: number;
  startedAt: string;
  completedAt?: string;
  agentName: string;
  taskTitle: string;
  status: 'SUCCESS' | 'FAILURE' | 'BLOCKED' | 'DEBUG_NEEDED';
  buildStatus?: string;
  qaStatus?: string;
  notes?: string;
}

export interface AutonomousRun {
  id: string;
  projectId: string;
  goal: string;
  goalId?: string;
  mode: AutonomousMode;
  maxIterations: number;
  currentIteration: number;
  maxRuntime: number; // in minutes
  elapsedSeconds: number;
  budgetLimit: number;
  budgetUsed: number;
  scope: string[];
  allowedAgents: string[];
  allowedTools: string[];
  stopConditions: string[];
  qualityThreshold: number;
  autoFixEnabled: boolean;
  autoBuildEnabled: boolean;
  autoQAEnabled: boolean;
  startedAt: string;
  completedAt?: string;
  status: AutonomousRunStatus;
  currentAgent?: string;
  currentTask?: string;
  currentMilestoneId?: string;
  currentBuildId?: string;
  currentQARunId?: string;
  timeline: RunTimelineEvent[];
  iterations: RunIteration[];
  pauseReason?: {
    reason: string;
    requestedAction: string;
    risk: string;
    recommendedDecision: string;
    approvalId?: string;
  };
  consecutiveFailures: number;
  totalBuildAttempts: number;
  totalDebugCycles: number;
}

export interface FailureLearning {
  id: string;
  projectId: string;
  runId?: string;
  issueSummary: string;
  whatHappened: string;
  whyItFailed: string;
  whatWasAttempted: string;
  whatShouldNotBeRepeated: string;
  whatWorked?: string;
  relevantLogs: string[];
  relatedFiles: string[];
  relatedAgents: string[];
  createdAt: string;
}

export interface AutonomousRunReport {
  id: string;
  runId: string;
  projectId: string;
  goal: string;
  completedMilestones: string[];
  failedItems: string[];
  changesSummary: string;
  buildCount: number;
  buildsPassed: number;
  qaRunsCount: number;
  qaPassedCount: number;
  bugsDetected: number;
  bugsResolved: number;
  performanceStatus: string;
  newKnowledgeCount: number;
  decisionsCount: number;
  remainingWork: string[];
  humanApprovalsNeeded: string[];
  createdAt: string;
}

export interface ProjectHealthSnapshot {
  projectId: string;
  buildStability: number;
  qaStability: number;
  openCriticalBugs: number;
  openMajorBugs: number;
  criticalBlockers: number;
  performanceStatus: 'GOOD' | 'WARNING' | 'CRITICAL' | 'DATA_UNAVAILABLE';
  fps?: number;
  frameTimeMs?: number;
  memoryMB?: number;
  assetCompleteness: number;
  documentationCompleteness: number;
  testCoverage?: number;
  testCoverageAvailable: boolean;
  developmentVelocity: string;
  failedAutonomousRuns: number;
  qualityGatesPassed: number;
  totalQualityGates: number;
  evaluatedAt: string;
}

export interface AutonomousSafetyPolicy {
  projectId: string;
  maxRuntimeMinutes: number;
  maxIterations: number;
  maxRetries: number;
  maxConcurrentAgents: number;
  maxBuilds: number;
  allowedAgentTypes: string[];
  allowedProjectDirectories: string[];
  allowedCommandClasses: string[];
  autoBuild: boolean;
  autoQA: boolean;
  autoDebug: boolean;
  autoFix: boolean;
  requireApprovalForArchitecture: boolean;
  requireApprovalForScope: boolean;
  requireApprovalForProvider: boolean;
}

export interface ImprovementTask {
  id: string;
  projectId: string;
  type: 'OPTIMIZATION' | 'BUG_FIX' | 'REFACTOR' | 'UX' | 'ASSET' | 'TEST' | 'DOCUMENTATION';
  title: string;
  description: string;
  evidence: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'PROPOSED' | 'APPROVED' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';
  source: string;
  suggestedAgent: string;
  createdAt: string;
}

// ==========================================
// PHASE 10: PRODUCTION, RELEASE & DEPLOYMENT
// ==========================================

export type EnvironmentType = 'LOCAL' | 'DEVELOPMENT' | 'STAGING' | 'PRODUCTION';
export type EnvironmentStatus = 'ACTIVE' | 'INACTIVE' | 'DEPLOYING' | 'ERROR' | 'MAINTENANCE';

export interface Environment {
  id: string;
  projectId: string;
  name: string;
  type: EnvironmentType;
  status: EnvironmentStatus;
  platform: 'Web' | 'Android' | 'PC' | 'Custom';
  buildConfiguration: string;
  deploymentProvider: 'WebDeploymentProvider' | 'AndroidDistributionProvider' | 'PCDistributionProvider' | 'CustomProvider' | 'None';
  deploymentTarget: string;
  configurationVersion: string;
  createdAt: string;
  updatedAt: string;
}

export type ReleaseStatus =
  | 'DRAFT'
  | 'CANDIDATE'
  | 'VALIDATING'
  | 'APPROVAL_REQUIRED'
  | 'APPROVED'
  | 'BUILDING'
  | 'DEPLOYING'
  | 'LIVE'
  | 'FAILED'
  | 'ROLLED_BACK'
  | 'CANCELLED';

export interface ReleaseChangelogItem {
  id: string;
  type: 'FEATURE' | 'IMPROVEMENT' | 'BUG_FIX' | 'PERFORMANCE' | 'KNOWN_ISSUE' | 'PLATFORM';
  title: string;
  description?: string;
  commitRef?: string;
  taskId?: string;
  issueId?: string;
}

export interface ReleaseReadinessReport {
  buildStatus: 'PASS' | 'FAIL';
  criticalQA: 'PASS' | 'FAIL' | 'NOT_TESTED';
  regression: 'PASS' | 'FAIL' | 'NOT_TESTED';
  criticalBugsCount: number;
  majorBugsCount: number;
  performanceStatus: 'AVAILABLE' | 'UNAVAILABLE';
  performanceData?: {
    fps?: number;
    frameTimeMs?: number;
    memoryMB?: number;
  };
  platformValidation: 'PASS' | 'FAIL' | 'NOT_TESTED';
  requiredApprovals: string[];
  missingDataWarnings: string[];
  isReady: boolean;
  evaluatedAt: string;
}

export interface ReleaseApproval {
  id: string;
  releaseId: string;
  version: string;
  buildId: string;
  changes: string[];
  affectedSystems: string[];
  knownIssues: string[];
  qaResults: string;
  deploymentTarget: string;
  rollbackPlan: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED' | 'CANCELLED';
  decisionNote?: string;
  decidedBy?: string;
  decidedAt?: string;
}

export interface Release {
  id: string;
  projectId: string;
  version: string;
  buildId: string;
  environment: EnvironmentType;
  status: ReleaseStatus;
  releaseNotes: string;
  changelog: ReleaseChangelogItem[];
  validationResults?: ReleaseReadinessReport;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED' | 'NOT_REQUIRED';
  approvedBy?: string;
  approvedAt?: string;
  deploymentId?: string;
  createdAt: string;
  releasedAt?: string;
}

export interface ProductionArtifact {
  id: string;
  releaseId: string;
  buildId: string;
  version: string;
  platform: 'Web' | 'Android' | 'PC' | 'Custom';
  commitRef: string;
  buildConfiguration: string;
  fileSize: string;
  checksum: string;
  buildLogs: string[];
  validationResults: {
    testsPassed: number;
    assetsValidated: number;
    dependenciesClean: boolean;
  };
  createdAt: string;
}

export type DeploymentStatus =
  | 'QUEUED'
  | 'VALIDATING'
  | 'DEPLOYING'
  | 'VERIFYING'
  | 'LIVE'
  | 'FAILED'
  | 'ROLLED_BACK'
  | 'CANCELLED';

export interface Deployment {
  id: string;
  releaseId: string;
  environmentId: string;
  provider: string;
  target: string;
  artifactId: string;
  status: DeploymentStatus;
  logs: string[];
  startedAt: string;
  completedAt?: string;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'FAILED';
  rollbackAvailable: boolean;
}

export interface AICrashAnalysis {
  likelyCause: string;
  evidence: string[];
  affectedSystem: string;
  suggestedInvestigation: string;
  potentialFix: string;
  confidence: 'LIKELY' | 'POSSIBLE' | 'UNKNOWN';
  analyzedAt: string;
}

export interface CrashReport {
  id: string;
  projectId: string;
  releaseId: string;
  platform: string;
  version: string;
  errorType: string;
  message: string;
  stackTrace: string;
  timestamp: string;
  frequency: number;
  affectedUsers?: number;
  source: 'Runtime Client' | 'QA Sandbox' | 'Server Logs' | 'Crashlytics Test';
  status: 'NEW' | 'ANALYZING' | 'KNOWN' | 'FIXING' | 'RESOLVED' | 'IGNORED';
  relatedIssueId?: string;
  aiAnalysis?: AICrashAnalysis;
}

export interface IncidentTimelineEvent {
  timestamp: string;
  event: string;
  actor: string;
}

export interface Incident {
  id: string;
  projectId: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  affectedRelease: string;
  affectedEnvironment: EnvironmentType;
  status: 'OPEN' | 'INVESTIGATING' | 'MITIGATING' | 'RESOLVED' | 'CLOSED';
  detectedAt: string;
  resolvedAt?: string;
  relatedCrashes: string[];
  relatedTasks: string[];
  timeline: IncidentTimelineEvent[];
}

export interface PlayerFeedback {
  id: string;
  projectId: string;
  source: 'In-game feedback' | 'Support message' | 'Community reviews' | 'Alpha Discord';
  version: string;
  platform: string;
  message: string;
  category:
    | 'Gameplay'
    | 'Difficulty'
    | 'Controls'
    | 'Performance'
    | 'UI'
    | 'Bugs'
    | 'Visuals'
    | 'Audio'
    | 'Features'
    | 'Requests'
    | 'Other';
  sentiment: 'Positive' | 'Neutral' | 'Negative'; // Display disclaimer: "AI classification"
  status: 'NEW' | 'PROCESSED' | 'CONVERTED_TO_ISSUE' | 'DISMISSED';
  relatedFeature?: string;
  relatedBug?: string;
  createdAt: string;
}

export interface FeedbackCluster {
  id: string;
  theme: string;
  category: string;
  count: number;
  sentimentDistribution: { positive: number; neutral: number; negative: number };
  sampleQuotes: string[];
  suggestedAction?: string;
}

export interface PostReleaseImprovementPlan {
  id: string;
  projectId: string;
  title: string;
  type:
    | 'Bug Fix'
    | 'Performance Optimization'
    | 'UX Improvement'
    | 'Feature Improvement'
    | 'Content Update'
    | 'Documentation'
    | 'Testing Improvement';
  reason: string;
  evidence: string[];
  expectedImpact: string;
  affectedSystems: string[];
  risk: 'LOW' | 'MEDIUM' | 'HIGH';
  requiredWork: string[];
  status: 'PROPOSED' | 'APPROVED' | 'IN_DEVELOPMENT' | 'RESOLVED' | 'REJECTED';
  linkedIssueId?: string;
  linkedTaskId?: string;
  createdAt: string;
}

export interface ProductionApprovalPolicy {
  requireApprovalBeforeProductionBuild: boolean;
  requireApprovalBeforeDeployment: boolean;
  requireApprovalBeforeRollback: boolean;
  requireApprovalBeforeDatabaseMigration: boolean;
  requireApprovalBeforeConfigChange: boolean;
}

export interface ProductionHealthStatus {
  overall: 'HEALTHY' | 'DEGRADED' | 'ERROR' | 'UNKNOWN';
  availability: number;
  errorRate: number;
  activeIncidents: number;
  openCrashes: number;
  recentFeedbackCount: number;
  monitoringConfigured: boolean;
  lastCheckedAt: string;
}

export interface ProductionTimelineEvent {
  id: string;
  projectId: string;
  timestamp: string;
  type:
    | 'RELEASE_CREATED'
    | 'APPROVAL_GRANTED'
    | 'PRODUCTION_BUILD_STARTED'
    | 'PRODUCTION_BUILD_COMPLETED'
    | 'DEPLOYMENT_STARTED'
    | 'DEPLOYMENT_VERIFIED'
    | 'CRASH_DETECTED'
    | 'INCIDENT_CREATED'
    | 'ROLLBACK'
    | 'NEW_RELEASE';
  title: string;
  details: string;
  sourceRef: string;
  severity?: 'INFO' | 'SUCCESS' | 'WARNING' | 'CRITICAL';
}

export interface RollbackRecord {
  id: string;
  projectId: string;
  fromReleaseId: string;
  toReleaseId: string;
  fromVersion: string;
  toVersion: string;
  reason: string;
  approvedBy: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  startedAt: string;
  completedAt?: string;
  logs: string[];
}


