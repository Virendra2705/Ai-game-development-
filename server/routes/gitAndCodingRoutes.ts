import { Router, Request, Response } from 'express';

const router = Router();

/**
 * Section 8: Safe Repository Metadata
 */
router.get('/repo-info', (req: Request, res: Response) => {
  const projectId = (req.query.projectId as string) || 'proj-embervale';

  res.json({
    connected: true,
    provider: 'GitHub',
    repository: 'aistudio/embervale-rift-tamers',
    defaultBranch: 'main',
    developmentBranch: 'ai-development',
    fileCount: 342,
    languages: ['GDScript (78%)', 'C# (18%)', 'GLSL (4%)'],
    latestCommit: {
      hash: 'a19c4e2f89b1c7d0e4f5a6b7c8d9e0f1a2b3c4d5',
      shortHash: 'a19c4e2',
      message: 'refactor: split player state machine into composite sub-nodes',
      author: 'Alex Vance <alex.vance@studio.dev>',
      date: 'Today, 04:30 AM',
    },
    lastUpdated: 'Just now',
  });
});

/**
 * Section 4: Coding Agent Provider Status
 */
router.get('/providers', (req: Request, res: Response) => {
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY);

  res.json({
    providers: [
      {
        id: 'codex',
        name: 'OpenAI Codex Code Intelligence',
        providerType: 'Codex',
        model: 'gpt-4o-code / specialized coding agents',
        status: 'Architecture Ready',
        workspaceAccess: 'Sandboxed',
        lastUsed: 'Yesterday',
        description: 'Powers GDScript & C# generation, syntax verification, and shader writing.',
      },
      {
        id: 'gemini',
        name: 'Google Gemini Coding Agent',
        providerType: 'Gemini',
        model: 'gemini-3.8-flash (Code Engine)',
        status: hasGeminiKey ? 'Connected' : 'Architecture Ready',
        workspaceAccess: 'Sandboxed',
        lastUsed: 'Just now',
        description: 'Deep game design reasoning, node architecture decomposition, and GDScript implementation.',
      },
      {
        id: 'mock',
        name: 'Sandboxed Local Agent',
        providerType: 'Other',
        model: 'Deterministic Virtual Code Engine',
        status: 'Connected',
        workspaceAccess: 'Sandboxed',
        lastUsed: 'Active',
        description: 'Deterministic sandboxed local execution for offline development and safety checks.',
      },
    ],
  });
});

/**
 * Section 27: Commit Endpoint
 */
router.post('/commit', (req: Request, res: Response) => {
  const { branch, message, taskId, attemptId, author } = req.body;

  if (branch === 'main' || branch === 'master') {
    return res.status(403).json({
      error: 'Branch Protection Violation: Direct commits to main are strictly forbidden.',
    });
  }

  const shortHash = Math.random().toString(16).substring(2, 9);
  const hash = `${shortHash}${Math.random().toString(16).substring(2, 10)}`;

  res.json({
    success: true,
    commit: {
      hash,
      shortHash,
      branch,
      message,
      author: author || 'Alex Vance <alex.vance@studio.dev>',
      committedAt: new Date().toISOString(),
    },
  });
});

/**
 * Section 28: Pull Request Preview
 */
router.post('/pull-request', (req: Request, res: Response) => {
  const { title, sourceBranch, targetBranch, summary } = req.body;
  const prNumber = Math.floor(Math.random() * 800) + 100;

  res.json({
    success: true,
    pullRequest: {
      id: `pr-${prNumber}`,
      prNumber,
      title,
      sourceBranch,
      targetBranch: targetBranch || 'ai-development',
      summary,
      status: 'OPEN',
      url: `https://github.com/aistudio/embervale-rift-tamers/pull/${prNumber}`,
      createdAt: new Date().toISOString(),
    },
  });
});

export default router;
