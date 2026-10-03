import { Router } from 'express';
import { aiOrchestratorService } from '../services/aiOrchestrator';

const router = Router();

/**
 * GET /api/ai/status
 * Returns current Gemini connection status and configured model
 */
router.get('/status', (req, res) => {
  try {
    const status = aiOrchestratorService.isConnected();
    res.json(status);
  } catch (error: any) {
    res.status(500).json({
      connected: false,
      provider: 'Google Gemini',
      model: 'gemini-3.8-flash',
      message: error.message || 'Error checking AI status',
    });
  }
});

/**
 * POST /api/ai/test
 * Tests the connection to Gemini with a safe, minimal ping
 */
router.post('/test', async (req, res) => {
  try {
    const result = await aiOrchestratorService.testConnection();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to ping Gemini API',
    });
  }
});

/**
 * POST /api/ai/plan
 * Receives project context and user command, returns structured development plan
 */
router.post('/plan', async (req, res) => {
  try {
    const {
      projectId,
      projectName,
      genre,
      engine,
      platform,
      currentPhase,
      userCommand,
      projectMemorySummary,
      existingTasks,
      decisions,
      constraints,
      conversationHistory,
    } = req.body;

    if (!userCommand || typeof userCommand !== 'string' || !userCommand.trim()) {
      return res.status(400).json({
        error: 'Missing or empty userCommand in request body.',
      });
    }

    const plan = await aiOrchestratorService.generatePlan({
      projectId: projectId || 'default',
      projectName: projectName || 'Current Project',
      genre,
      engine,
      platform,
      currentPhase,
      userCommand,
      projectMemorySummary,
      existingTasks,
      decisions,
      constraints,
      conversationHistory,
    });

    res.json(plan);
  } catch (error: any) {
    console.error('[API /api/ai/plan] Error:', error);
    res.status(500).json({
      error: error.message || 'Internal server error during plan generation',
    });
  }
});

/**
 * POST /api/ai/chat
 * Multi-turn discussion to refine plan or answer architect questions
 */
router.post('/chat', async (req, res) => {
  try {
    const { projectId, projectName, userMessage, currentPlan, history } = req.body;

    if (!userMessage || typeof userMessage !== 'string' || !userMessage.trim()) {
      return res.status(400).json({
        error: 'Missing or empty userMessage in request body.',
      });
    }

    const result = await aiOrchestratorService.chatRefinePlan({
      projectId: projectId || 'default',
      projectName: projectName || 'Current Project',
      userMessage,
      currentPlan,
      history: Array.isArray(history) ? history : [],
    });

    res.json(result);
  } catch (error: any) {
    console.error('[API /api/ai/chat] Error:', error);
    res.status(500).json({
      error: error.message || 'Internal server error during AI chat',
    });
  }
});

export default router;
