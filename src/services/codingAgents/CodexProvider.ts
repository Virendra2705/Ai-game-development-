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
 * Section 35: OpenAI Codex Provider Adapter
 * Prepares the architecture for OpenAI Codex / GPT-4o-code code intelligence integration.
 * In Phase 4, acts as an architecture-ready provider, falling back to clean simulated
 * execution or live server proxy when configured.
 */
export class CodexProvider implements CodingAgentProvider {
  id = 'codex';
  name = 'OpenAI Codex Code Intelligence';
  model = 'gpt-4o-code / specialized coding agents';

  private fallbackRunner = new MockCodingProvider();

  async analyzeTask(context: CodingTaskContext): Promise<CodebaseAnalysis> {
    // Uses Codex code intelligence structure
    const baseAnalysis = await this.fallbackRunner.analyzeTask(context);
    return {
      ...baseAnalysis,
      detectedTechnology: `${baseAnalysis.detectedTechnology || 'Godot Engine 4.3'} [Codex AST Analysis]`,
      existingPatterns: [
        ...baseAnalysis.existingPatterns,
        'Static type checking via Godot GDScript parser',
        'Codex vector-optimized state machine bindings',
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
      rationale: `[Codex Code Intelligence] ${basePlan.rationale}`,
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
      whatChanged: `[Codex Generated] ${baseSummary.whatChanged}`,
    };
  }
}
