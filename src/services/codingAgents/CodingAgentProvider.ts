import {
  CodingTaskContext,
  CodebaseAnalysis,
  Workspace,
  CodingPlan,
  FileChange,
  TestRun,
  ImplementationSummary,
} from '../../types';

/**
 * Section 3: Standardized Coding Agent Provider Interface
 * Supports multi-provider architectures (Codex, Gemini, Local/Mock, etc.)
 */
export interface CodingAgentProvider {
  id: string;
  name: string;
  model: string;

  /**
   * Analyzes project structure, relevant files, dependencies, and patterns
   */
  analyzeTask(context: CodingTaskContext): Promise<CodebaseAnalysis>;

  /**
   * Prepares the isolated workspace branch and directory boundaries
   */
  prepareWorkspace(context: CodingTaskContext): Promise<Workspace>;

  /**
   * Generates a concrete coding plan detailing files to modify, create, and tests to run
   */
  generatePlan(context: CodingTaskContext, analysis: CodebaseAnalysis): Promise<CodingPlan>;

  /**
   * Writes the actual implementation files within the authorized workspace
   */
  implementTask(
    context: CodingTaskContext,
    plan: CodingPlan
  ): Promise<{
    fileChanges: FileChange[];
    diff: string;
    summary: ImplementationSummary;
  }>;

  /**
   * Runs the automated test suite within the sandbox
   */
  runTests(context: CodingTaskContext, changes: FileChange[]): Promise<TestRun>;

  /**
   * Generates a formatted unified diff for all changed files
   */
  generateDiff(changes: FileChange[]): string;

  /**
   * Summarizes the implemented changes and risks
   */
  summarizeChanges(
    context: CodingTaskContext,
    changes: FileChange[],
    testRun?: TestRun
  ): Promise<ImplementationSummary>;
}
