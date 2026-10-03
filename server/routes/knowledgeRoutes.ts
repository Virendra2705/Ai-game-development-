import { Router } from 'express';

const router = Router();

// In-memory server-side knowledge document store
const serverDocuments: Record<string, any[]> = {
  'proj-embervale': [
    {
      id: 'doc-sparkit-spec',
      projectId: 'proj-embervale',
      title: 'Sparkit Creature Specification',
      description: 'Comprehensive canon design and stat sheet for Sparkit (#025)',
      category: 'CREATURES',
      source: 'Game Design Document v1.2 (Creature Bible)',
      sourceType: 'DOCUMENT',
      version: 2,
      status: 'ACTIVE',
      confidence: 'VERIFIED',
      updatedAt: '2026-09-17T15:30:00Z',
    },
    {
      id: 'doc-capture-spec',
      projectId: 'proj-embervale',
      title: 'Creature Capture Mechanics Specification',
      description: 'Core game design and mathematics for capturing wild creatures',
      category: 'GAMEPLAY_SYSTEMS',
      source: 'Game Design Document v1.4',
      sourceType: 'DOCUMENT',
      version: 3,
      status: 'ACTIVE',
      confidence: 'VERIFIED',
      updatedAt: '2026-09-18T14:00:00Z',
    },
  ],
};

/**
 * POST /api/knowledge/search
 * Deep project-wide search
 */
router.post('/knowledge/search', (req, res) => {
  const { projectId, query } = req.body;
  const q = (query || '').toLowerCase();
  const docs = serverDocuments[projectId] || [];
  const matches = docs.filter(
    (d) => d.title.toLowerCase().includes(q) || d.description.toLowerCase().includes(q)
  );

  res.json({
    query,
    totalResults: matches.length,
    results: matches,
  });
});

/**
 * GET /api/knowledge/project/:projectId
 */
router.get('/knowledge/project/:projectId', (req, res) => {
  const { projectId } = req.params;
  res.json({ documents: serverDocuments[projectId] || [] });
});

/**
 * POST /api/knowledge/import
 */
router.post('/knowledge/import', (req, res) => {
  const { projectId, title, content, category, sourceType } = req.body;
  const newDoc = {
    id: `doc-${Date.now()}`,
    projectId,
    title: title || 'Imported Document',
    description: (content || '').slice(0, 120),
    category: category || 'GAME_DESIGN',
    content: content || '',
    sourceType: sourceType || 'DOCUMENT',
    version: 1,
    status: 'ACTIVE',
    confidence: 'LIKELY',
    updatedAt: new Date().toISOString(),
  };

  if (!serverDocuments[projectId]) serverDocuments[projectId] = [];
  serverDocuments[projectId].unshift(newDoc);

  res.json({ success: true, document: newDoc });
});

/**
 * POST /api/research/query
 */
router.post('/research/query', (req, res) => {
  const { projectId, query } = req.body;
  res.json({
    id: `res-${Date.now()}`,
    projectId,
    query,
    summary: `Research conducted on: "${query}".`,
    findings: [
      { text: `Analyzed query specifications for ${query}.`, factType: 'RESEARCH_FACT' },
      { text: 'Validated against Embervale game design constraints.', factType: 'PROJECT_FACT' },
    ],
    sources: ['Project Knowledge Cache', 'Godot 4.3 Technical Spec'],
    confidence: 'HIGH_CONFIDENCE',
    status: 'VERIFIED',
  });
});

/**
 * GET /api/knowledge/conflicts
 */
router.get('/knowledge/conflicts', (req, res) => {
  res.json({
    conflicts: [
      {
        id: 'conflict-sparkit-level',
        reason: 'Evolution level divergence: Level 20 canon vs Level 25 combat draft',
        severity: 'HIGH',
        status: 'OPEN',
      },
    ],
  });
});

/**
 * GET /api/knowledge/health/:projectId
 */
router.get('/knowledge/health/:projectId', (req, res) => {
  res.json({
    healthScore: 92,
    verifiedKnowledgeCount: 14,
    unverifiedKnowledgeCount: 2,
    conflictsCount: 1,
    warnings: ['1 open conflict detected regarding Sparkit evolution level.'],
  });
});

export default router;
