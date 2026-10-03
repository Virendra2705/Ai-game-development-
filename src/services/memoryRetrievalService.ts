import {
  ContextPackage,
  ContextBudget,
  MemoryEntry,
  KnowledgeDocument,
  CodeIndexFile,
  Asset,
  Task,
  ResearchRecord,
  DevelopmentDecision,
} from '../types';
import { memoryService } from './memoryService';
import { knowledgeBaseService } from './knowledgeBaseService';
import { projectIndexService } from './projectIndexService';
import { researchService } from './researchService';
import { decisionService } from './decisionService';
import { taskService } from './taskService';
import { assetService } from './assetService';

class MemoryRetrievalService {
  private defaultBudget: ContextBudget = {
    maxTokens: 4000,
    maxMemories: 6,
    maxDocuments: 4,
    maxResearch: 3,
    maxCodeFiles: 4,
    maxAssets: 4,
    maxTasks: 3,
    maxHistoryEvents: 5,
  };

  /**
   * Main retrieval method that scans all project knowledge facets
   * and assembles a compact, high-relevance ContextPackage
   */
  async retrieveContext(
    projectId: string,
    userRequest: string,
    customBudget?: Partial<ContextBudget>
  ): Promise<ContextPackage> {
    const budget = { ...this.defaultBudget, ...customBudget };
    const qLower = userRequest.toLowerCase();
    const keywords = qLower
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 2);

    // 1. Retrieve & Rank Memories
    const allMemories = await memoryService.getMemories(projectId);
    const scoredMemories = allMemories.map((m) => {
      let score = 0;
      const text = `${m.title} ${m.content} ${m.tags.join(' ')}`.toLowerCase();
      keywords.forEach((kw) => {
        if (text.includes(kw)) score += 3;
      });
      if (m.priority === 'CRITICAL') score += 5;
      if (m.priority === 'HIGH') score += 3;
      if (m.confidence === 'VERIFIED') score += 2;
      return { item: m, score };
    });
    scoredMemories.sort((a, b) => b.score - a.score);
    const relevantMemory: MemoryEntry[] = scoredMemories
      .filter((s) => s.score > 0 || scoredMemories.length <= 2)
      .slice(0, budget.maxMemories)
      .map((s) => s.item);

    // 2. Retrieve & Rank Knowledge Documents
    const allDocs = await knowledgeBaseService.getDocuments(projectId);
    const scoredDocs = allDocs.map((doc) => {
      let score = 0;
      const text = `${doc.title} ${doc.description} ${doc.tags.join(' ')} ${doc.content}`.toLowerCase();
      keywords.forEach((kw) => {
        if (text.includes(kw)) score += 4;
      });
      if (doc.confidence === 'VERIFIED') score += 2;
      if (doc.status === 'ACTIVE') score += 1;
      return { item: doc, score };
    });
    scoredDocs.sort((a, b) => b.score - a.score);
    const relevantDocuments: KnowledgeDocument[] = scoredDocs
      .filter((s) => s.score > 0)
      .slice(0, budget.maxDocuments)
      .map((s) => s.item);

    // 3. Retrieve & Filter Code Context
    const codeFiles = await projectIndexService.getCodeIndex(projectId);
    const relevantCodeContext: CodeIndexFile[] = codeFiles
      .filter((f) => {
        const text = `${f.name} ${f.system} ${f.classes.join(' ')} ${f.functions.join(' ')}`.toLowerCase();
        return keywords.some((kw) => text.includes(kw));
      })
      .slice(0, budget.maxCodeFiles);

    // 4. Retrieve & Filter Relevant Assets
    const allAssets = await assetService.getAssets(projectId);
    const relevantAssets: Asset[] = allAssets
      .filter((a) => {
        const text = `${a.name} ${a.type} ${a.description || ''} ${(a.tags || []).join(' ')}`.toLowerCase();
        return keywords.some((kw) => text.includes(kw));
      })
      .slice(0, budget.maxAssets);

    // 5. Retrieve & Filter Tasks
    const allTasks = await taskService.getTasks(projectId);
    const relevantTasks: Task[] = allTasks
      .filter((t) => {
        const text = `${t.title} ${t.description} ${t.category}`.toLowerCase();
        return keywords.some((kw) => text.includes(kw));
      })
      .slice(0, budget.maxTasks);

    // 6. Retrieve Relevant Research
    const allResearch = await researchService.getResearchRecords(projectId);
    const relevantResearch: ResearchRecord[] = allResearch
      .filter((r) => {
        const text = `${r.query} ${r.summary} ${r.sources.join(' ')}`.toLowerCase();
        return keywords.some((kw) => text.includes(kw));
      })
      .slice(0, budget.maxResearch);

    // 7. Retrieve Decisions
    const allDecisions = await decisionService.getDecisions(projectId);
    const relevantDecisions: DevelopmentDecision[] = allDecisions.filter((d) => {
      const text = `${d.title} ${d.reason} ${d.category || ''} ${d.decision || ''}`.toLowerCase();
      return keywords.some((kw) => text.includes(kw));
    });

    // 8. Relevant Bugs & Constraints
    const relevantBugs = [
      {
        id: 'bug-38',
        title: 'Capture Anim Desync on Camera Cut',
        severity: 'MEDIUM',
        status: 'OPEN',
        affectedSystem: 'Creature Capture / Animation Controller',
        note: 'Animation sometimes fails after transition to battle camera cut.',
      },
    ].filter((b) => {
      const text = `${b.title} ${b.affectedSystem} ${b.note}`.toLowerCase();
      return keywords.some((kw) => text.includes(kw));
    });

    const constraints = [
      'Maximum 60 FPS mobile WebAssembly frame budget (16.6ms).',
      'Creature capture animation must not change existing capture math or logic.',
      'Batch particle systems to prevent shader overdraw on WebGL2 mobile browsers.',
    ];

    const dependencies = [
      'CaptureManager.gd',
      'SparkitController.gd',
      'CreatureAnimationBridge.gd',
      'Rift Orb 3D Model',
      'Sparkit 3D Model',
    ];

    const previousAttempts = [
      {
        attempt: 1,
        summary: 'Initial capture script integration in Task #142',
        result: 'Captured calculations work, pending dedicated creature reaction animation.',
      },
    ];

    const contextPackage: ContextPackage = {
      id: `ctx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      projectId,
      request: userRequest,
      relevantMemory,
      relevantDocuments,
      relevantCodeContext,
      relevantAssets,
      relevantTasks,
      relevantResearch,
      relevantDecisions,
      relevantBugs,
      constraints,
      dependencies,
      previousAttempts,
      generatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
    };

    return contextPackage;
  }
}

export const memoryRetrievalService = new MemoryRetrievalService();
