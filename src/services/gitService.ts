import { Repository, GitCommit, PullRequest, Project } from '../types';

/**
 * Phase 4: Git Repository & Branching Service
 * Manages GitHub integration, branch protection, commits, and pull requests.
 * Rule: Never push directly to main.
 */
class GitService {
  private repositories: Map<string, Repository> = new Map();
  private commits: GitCommit[] = [];
  private pullRequests: PullRequest[] = [];

  constructor() {
    this.seedInitialRepositories();
  }

  private seedInitialRepositories() {
    // Seed default repository for Embervale
    const embervaleRepo: Repository = {
      id: 'repo-embervale',
      projectId: 'proj-embervale',
      provider: 'GitHub',
      url: 'https://github.com/aistudio/embervale-rift-tamers',
      owner: 'aistudio',
      name: 'embervale-rift-tamers',
      defaultBranch: 'main',
      developmentBranch: 'ai-development',
      connected: true,
      lastUpdated: 'Just now',
      fileCount: 342,
      languages: ['GDScript (78%)', 'C# (18%)', 'GLSL (4%)'],
      description: '3D open-world creature-taming RPG with real-time tactical combat and elemental rifts.',
      createdAt: '2026-08-12',
      latestCommit: {
        hash: 'a19c4e2f89b1c7d0e4f5a6b7c8d9e0f1a2b3c4d5',
        shortHash: 'a19c4e2',
        message: 'refactor: split player state machine into composite sub-nodes',
        author: 'Alex Vance <alex.vance@studio.dev>',
        date: 'Today, 04:30 AM',
      },
    };

    this.repositories.set(embervaleRepo.projectId, embervaleRepo);

    // Initial commit for Embervale
    this.commits.push({
      hash: embervaleRepo.latestCommit!.hash,
      shortHash: embervaleRepo.latestCommit!.shortHash,
      taskId: 'task-141',
      attemptId: 'attempt-0',
      branch: 'ai-development',
      message: embervaleRepo.latestCommit!.message,
      author: embervaleRepo.latestCommit!.author,
      filesChangedCount: 3,
      testsPassedCount: 6,
      committedAt: embervaleRepo.latestCommit!.date,
      status: 'COMMITTED',
    });
  }

  /**
   * Retrieves the repository configured for a project
   */
  getRepositoryForProject(projectId: string): Repository {
    const existing = this.repositories.get(projectId);
    if (existing) return existing;

    // Create a default connected mock repository if not found
    const newRepo: Repository = {
      id: `repo-${projectId}`,
      projectId,
      provider: 'GitHub',
      url: `https://github.com/aistudio/${projectId.replace('proj-', '')}`,
      owner: 'aistudio',
      name: projectId.replace('proj-', ''),
      defaultBranch: 'main',
      developmentBranch: 'ai-development',
      connected: false,
      lastUpdated: 'Not connected',
      createdAt: new Date().toISOString(),
      latestCommit: {
        hash: 'b28d7e1a3c4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b',
        shortHash: 'b28d7e1',
        message: 'chore: initial repository scaffolding',
        author: 'AI Studio Bot <bot@aistudio.internal>',
        date: 'Yesterday',
      },
    };

    this.repositories.set(projectId, newRepo);
    return newRepo;
  }

  /**
   * Updates repository configuration
   */
  updateRepository(projectId: string, updates: Partial<Repository>): Repository {
    const repo = this.getRepositoryForProject(projectId);
    const updated: Repository = {
      ...repo,
      ...updates,
      lastUpdated: 'Just now',
    };
    this.repositories.set(projectId, updated);
    return updated;
  }

  /**
   * Connects a repository to a project
   */
  connectRepository(
    projectId: string,
    url: string,
    provider: 'GitHub' | 'GitLab' | 'Bitbucket' = 'GitHub'
  ): Repository {
    let owner = 'aistudio';
    let name = projectId.replace('proj-', '');

    try {
      const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
      const parts = parsed.pathname.replace(/^\//, '').split('/');
      if (parts.length >= 2) {
        owner = parts[0];
        name = parts[1].replace('.git', '');
      }
    } catch {
      // Fallback parser
      const clean = url.replace(/^(https?:\/\/)?(www\.)?github\.com\//, '');
      const parts = clean.split('/');
      if (parts.length >= 2) {
        owner = parts[0];
        name = parts[1].replace('.git', '');
      }
    }

    const updated = this.updateRepository(projectId, {
      url,
      provider,
      owner,
      name,
      connected: true,
      defaultBranch: 'main',
      developmentBranch: 'ai-development',
      fileCount: 384,
      languages: ['GDScript (72%)', 'C# (24%)', 'GLSL (4%)'],
      description: `Project repository for ${name}`,
      latestCommit: {
        hash: `c${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`,
        shortHash: `c${Math.random().toString(16).substring(2, 8)}`,
        message: 'ci: configure automated Godot 4.3 build action',
        author: `${owner} <developer@${owner}.com>`,
        date: 'Just now',
      },
    });

    return updated;
  }

  /**
   * Disconnects a repository
   */
  disconnectRepository(projectId: string): Repository {
    return this.updateRepository(projectId, {
      connected: false,
    });
  }

  /**
   * Creates a Git commit on the task branch
   * Enforces: Never commit directly to main!
   */
  createCommit(params: {
    projectId: string;
    taskId: string;
    attemptId: string;
    branch: string;
    message: string;
    author: string;
    filesChangedCount: number;
    testsPassedCount: number;
  }): GitCommit {
    if (params.branch === 'main' || params.branch === 'master') {
      throw new Error('Branch Protection Violation: Direct commits to main are strictly forbidden.');
    }

    const shortHash = Math.random().toString(16).substring(2, 9);
    const hash = `${shortHash}${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`;

    const commit: GitCommit = {
      hash,
      shortHash,
      taskId: params.taskId,
      attemptId: params.attemptId,
      branch: params.branch,
      message: params.message,
      author: params.author,
      filesChangedCount: params.filesChangedCount,
      testsPassedCount: params.testsPassedCount,
      committedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'COMMITTED',
    };

    this.commits.unshift(commit);

    // Update repository latest commit
    const repo = this.getRepositoryForProject(params.projectId);
    this.updateRepository(params.projectId, {
      latestCommit: {
        hash: commit.hash,
        shortHash: commit.shortHash,
        message: commit.message,
        author: commit.author,
        date: 'Just now',
      },
    });

    return commit;
  }

  /**
   * Prepares a Pull Request preview (Section 28)
   */
  createPullRequest(params: {
    projectId: string;
    title: string;
    sourceBranch: string;
    targetBranch?: string;
    summary: string;
    changes: string[];
    tests: string[];
    knownLimitations: string[];
  }): PullRequest {
    const prNumber = 100 + this.pullRequests.length + 1;
    const pr: PullRequest = {
      id: `pr-${prNumber}`,
      prNumber,
      title: params.title,
      sourceBranch: params.sourceBranch,
      targetBranch: params.targetBranch || 'ai-development',
      summary: params.summary,
      changes: params.changes,
      tests: params.tests,
      knownLimitations: params.knownLimitations,
      status: 'OPEN',
      url: `https://github.com/aistudio/embervale-rift-tamers/pull/${prNumber}`,
      createdAt: new Date().toISOString(),
    };

    this.pullRequests.unshift(pr);
    return pr;
  }

  getCommitsForTask(taskId: string): GitCommit[] {
    return this.commits.filter((c) => c.taskId === taskId);
  }

  getLatestCommitForProject(projectId: string): GitCommit | undefined {
    const repo = this.getRepositoryForProject(projectId);
    return this.commits[0] || (repo.latestCommit as any);
  }

  getPullRequests(): PullRequest[] {
    return this.pullRequests;
  }
}

export const gitService = new GitService();
