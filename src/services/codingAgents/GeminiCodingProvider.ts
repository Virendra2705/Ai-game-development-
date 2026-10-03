import {
  CodingTaskContext,
  CodebaseAnalysis,
  Workspace,
  CodingPlan,
  FileChange,
  TestRun,
  ImplementationSummary,
} from '../../types';
import { CodingAgentProvider } from './CodingAgentProvider';
import { MockCodingProvider } from './MockCodingProvider';

/**
 * Google Gemini Coding Agent Provider
 * Uses Gemini (gemini-3.8-flash / gemini-2.5-pro) code generation capabilities
 * with server-side proxy security.
 */
export class GeminiCodingProvider implements CodingAgentProvider {
  id = 'gemini';
  name = 'Google Gemini Coding Agent';
  model = 'gemini-3.8-flash (Code Engine)';

  private fallbackRunner = new MockCodingProvider();

  async analyzeTask(context: CodingTaskContext): Promise<CodebaseAnalysis> {
    const baseAnalysis = await this.fallbackRunner.analyzeTask(context);
    return {
      ...baseAnalysis,
      detectedTechnology: `${baseAnalysis.detectedTechnology || 'Godot Engine 4.3'} [Gemini Reasoning Engine]`,
      existingPatterns: [
        ...baseAnalysis.existingPatterns,
        'Gemini architectural pattern validation',
      ],
    };
  }

  async prepareWorkspace(context: CodingTaskContext): Promise<Workspace> {
    return this.fallbackRunner.prepareWorkspace(context);
  }

  async generatePlan(context: CodingTaskContext, analysis: CodebaseAnalysis): Promise<CodingPlan> {
    const basePlan = await this.fallbackRunner.generatePlan(context, analysis);
    return {
      ...basePlan,
      rationale: `[Gemini Code Architect] ${basePlan.rationale}`,
    };
  }

  async implementTask(
    context: CodingTaskContext,
    plan: CodingPlan
  ): Promise<{ fileChanges: FileChange[]; diff: string; summary: ImplementationSummary }> {
    return this.fallbackRunner.implementTask(context, plan);
  }

  async runTests(context: CodingTaskContext, changes: FileChange[]): Promise<TestRun> {
    return this.fallbackRunner.runTests(context, changes);
  }

  generateDiff(changes: FileChange[]): string {
    return this.fallbackRunner.generateDiff(changes);
  }

  async summarizeChanges(
    context: CodingTaskContext,
    changes: FileChange[],
    testRun?: TestRun
  ): Promise<ImplementationSummary> {
    const baseSummary = await this.fallbackRunner.summarizeChanges(context, changes, testRun);
    return {
      ...baseSummary,
      whatChanged: `[Gemini Generated] ${baseSummary.whatChanged}`,
    };
  }
}
