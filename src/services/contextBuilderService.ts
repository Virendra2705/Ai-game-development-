import { AgentContextBrief, ContextPackage } from '../types';
import { memoryRetrievalService } from './memoryRetrievalService';

class ContextBuilderService {
  /**
   * Generates a focused AgentContextBrief before an agent performs work
   */
  async buildBriefForTask(
    projectId: string,
    taskTitle: string,
    targetAgent: string = 'Coding Agent (Codex)'
  ): Promise<{ brief: AgentContextBrief; fullContext: ContextPackage }> {
    const fullContext = await memoryRetrievalService.retrieveContext(projectId, taskTitle);

    const relevantSystems = Array.from(
      new Set([
        ...fullContext.relevantCodeContext.map((c) => c.system),
        ...fullContext.relevantDocuments.map((d) => String(d.category)),
      ])
    );

    const relevantAssets = fullContext.relevantAssets.map((a) => a.name);
    const importantDecisions = fullContext.relevantDecisions.map((d) => `${d.title}: ${d.reason}`);
    const knownBugs = fullContext.relevantBugs.map((b) => `${b.title} (${b.note})`);

    const verifiedDocs = fullContext.relevantDocuments.filter((d) => d.confidence === 'VERIFIED').length;
    const verifiedMem = fullContext.relevantMemory.filter((m) => m.confidence === 'VERIFIED').length;
    const verifiedCount = verifiedDocs + verifiedMem;

    const unverifiedDocs = fullContext.relevantDocuments.filter(
      (d) => d.confidence === 'UNVERIFIED' || d.confidence === 'LIKELY'
    ).length;
    const unverifiedMem = fullContext.relevantMemory.filter(
      (m) => m.confidence === 'UNVERIFIED' || m.confidence === 'LIKELY'
    ).length;
    const unverifiedCount = unverifiedDocs + unverifiedMem;

    const warnings: string[] = [];
    if (unverifiedCount > 0) {
      warnings.push(`${unverifiedCount} unverified memory/doc items in context. Use caution before treating as canon.`);
    }

    const brief: AgentContextBrief = {
      taskTitle,
      targetAgent,
      relevantSystems: relevantSystems.length > 0 ? relevantSystems : ['Core Gameplay', 'Animation Controller'],
      relevantAssets: relevantAssets.length > 0 ? relevantAssets : ['Sparkit 3D Model', 'Rift Orb 3D Model'],
      importantDecisions:
        importantDecisions.length > 0
          ? importantDecisions
          : ['Capture animation must support mobile WebAssembly performance (60 FPS).'],
      knownBugs:
        knownBugs.length > 0
          ? knownBugs
          : ['Bug #38: Animation sometimes fails after transition to battle camera cut.'],
      constraints: fullContext.constraints,
      expectedResult: `Implement ${taskTitle} adhering to canon specifications without altering core gameplay mechanics or exceeding the 60 FPS mobile frame budget.`,
      confidenceSummary: {
        verifiedCount,
        unverifiedCount,
        warnings,
      },
    };

    return { brief, fullContext };
  }
}

export const contextBuilderService = new ContextBuilderService();
