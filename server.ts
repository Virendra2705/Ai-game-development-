import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import aiRoutes from './server/routes/aiRoutes';
import gitAndCodingRoutes from './server/routes/gitAndCodingRoutes';
import knowledgeRoutes from './server/routes/knowledgeRoutes';

// Load environment variables (such as GEMINI_API_KEY)
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Standard JSON and URL-encoded body parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // API Routes FIRST
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'AI Game Builder Hub API', phase: 8 });
  });

  // Mount AI Orchestrator & Gemini routes
  app.use('/api/ai', aiRoutes);

  // Mount Phase 4 Git & Coding Agent routes
  app.use('/api', gitAndCodingRoutes);

  // Mount Phase 8 Knowledge Base & Research routes
  app.use('/api', knowledgeRoutes);

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[AI Game Builder Hub] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
