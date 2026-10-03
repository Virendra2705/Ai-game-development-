import { TestCase } from '../types';
import { testService } from './testService';
import { activityService } from './activityService';

export interface GeneratedTestDraft {
  name: string;
  category: 'Unit' | 'Integration' | 'Gameplay' | 'Regression' | 'Asset' | 'Build';
  description: string;
  codeSnippet: string;
  authoritative: boolean;
}

class TestGenerationAgent {
  async generateTestsForFeature(
    projectId: string,
    featureName: string,
    specification: string
  ): Promise<TestCase[]> {
    const generated: TestCase[] = [];

    // Draft tests based on specification
    const testsToCreate = [
      {
        name: `${featureName} - Input Validation & Bounds Check`,
        category: 'Unit' as const,
        description: `Ensure all parameters for ${featureName} stay within allowable limits.`,
      },
      {
        name: `${featureName} - State Transition & Event Dispatch`,
        category: 'Integration' as const,
        description: `Verify event bus properly dispatches notification when ${featureName} state changes.`,
      },
      {
        name: `${featureName} - Animation & VFX Sync Verification`,
        category: 'Functional' as const,
        description: `Verify sprite sequence timings align with gameplay tick loops.`,
      },
    ];

    for (const item of testsToCreate) {
      const created = await testService.createTestCase({
        projectId,
        name: item.name,
        category: item.category,
        description: item.description,
      });
      generated.push(created);
    }

    await activityService.logActivity(
      'SYSTEM_EVENT',
      'Test Generation Agent',
      `Generated ${generated.length} automated test suites for "${featureName}".`,
      projectId,
      { featureName, testIds: generated.map((t) => t.id) }
    );

    return generated;
  }
}

export const testGenerationAgent = new TestGenerationAgent();
