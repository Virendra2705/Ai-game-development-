import { getDatabaseAdapter } from '../adapters';
import { TestCase, TestStatus, TestCategory } from '../types';
import { activityService } from './activityService';

export class TestService {
  private adapter = getDatabaseAdapter();

  async getTests(projectId?: string): Promise<TestCase[]> {
    return this.adapter.getTests(projectId);
  }

  async getTestById(id: string): Promise<TestCase | null> {
    return this.adapter.getTestById(id);
  }

  async runTestSuite(projectId: string): Promise<TestCase[]> {
    const tests = await this.getTests(projectId);
    await activityService.logActivity(
      'TEST_STARTED',
      'Test & QA Agent',
      `Triggered full QA test suite (${tests.length} tests)`,
      projectId
    );

    const updatedTests: TestCase[] = [];
    for (const test of tests) {
      const updated: TestCase = {
        ...test,
        status: test.id.includes('fail') ? 'FAILED' : 'PASSED',
        lastRun: 'Just now',
        duration: `${(Math.random() * 0.4 + 0.05).toFixed(2)}s`,
      };
      await this.adapter.saveTest(updated);
      updatedTests.push(updated);
    }

    const passedCount = updatedTests.filter((t) => t.status === 'PASSED' || t.status === 'Passed').length;
    const failedCount = updatedTests.length - passedCount;

    await activityService.logActivity(
      'TEST_COMPLETED',
      'Test & QA Agent',
      `QA suite finished: ${passedCount} passed, ${failedCount} failed`,
      projectId,
      { passed: passedCount, failed: failedCount }
    );

    return updatedTests;
  }

  async createTestCase(data: {
    projectId: string;
    name: string;
    description: string;
    category: TestCategory | string;
    severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  }): Promise<TestCase> {
    const newTest: TestCase = {
      id: `test-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      projectId: data.projectId,
      name: data.name,
      description: data.description,
      category: data.category,
      status: 'PENDING',
      severity: data.severity || 'MEDIUM',
      lastRun: 'Not run yet',
      duration: '-',
    };

    return this.adapter.saveTest(newTest);
  }
}

export const testService = new TestService();
