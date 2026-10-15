import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

import authRoutes from './server/routes/auth';
import palmRoutes from './server/routes/palm';
import tarotRoutes from './server/routes/tarot';
import guidanceRoutes from './server/routes/guidance';
import userRoutes from './server/routes/user';
import datasetRoutes from './server/routes/datasets';
import databaseRoutes from './server/routes/database';
import intelligenceRoutes from './server/routes/intelligence';
import adminRoutes from './server/routes/admin';
import callRoutes from './server/routes/calls';
import appointmentRoutes from './server/routes/appointments';
import { initPostgres } from './server/db/sql';
import { initMongo } from './server/db/mongodb';

dotenv.config();

const app = express();
const PORT = 3000;

// CORS & Preflight headers for cross-origin and iframe preview access
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    environment: 'development',
    version: '1.3.0',
    structure: 'Cleanly decoupled Backend (Express/TypeScript) & Frontend (React/Vite)',
    milestones: {
      auth: 'JWT & OAuth2 with Multi-Role RBAC (User, Tarot Reader, Spiritual Consultant, Admin)',
      palmistry: 'Biometric Hand Verification + 5 Fingers & Chiromancy Mounts Engine',
      tarot: 'Symbolic Spread Engine with Gemini AI Synthesis',
      insights: 'Personality Radar, Growth Trends & Archetypes',
      dashboards: 'Role-Specific Views with Left Vertical Navigation'
    },
    timestamp: new Date().toISOString()
  });
});

// Mount Modular API Routes
app.use('/api/auth', authRoutes);
app.use('/api/palm', palmRoutes);
app.use('/api/tarot', tarotRoutes);
app.use('/api/guidance', guidanceRoutes);
app.use('/api/ai', guidanceRoutes);
app.use('/api/user', userRoutes);
app.use('/api', userRoutes); // For /api/readings/history and /api/readings/save
app.use('/api/datasets', datasetRoutes);
app.use('/api', datasetRoutes); // For /api/admin/system-status
app.use('/api/db', databaseRoutes);
app.use('/api/intelligence', intelligenceRoutes);
app.use('/api/tests', intelligenceRoutes); // For /api/tests/run-validation
app.use('/api/admin', adminRoutes);
app.use('/api/calls', callRoutes);
app.use('/api/appointments', appointmentRoutes);

// Setup Vite middleware / Static serving
async function startServer() {
  // Initialize Database Connectors (PostgreSQL & MongoDB)
  await initPostgres();
  await initMongo();
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
    console.log(`\n======================================================`);
    console.log(`🔮 Palmistry & Tarot Intelligence Platform`);
    console.log(`⚡ Dev Server ready:`);
    console.log(`   ➜ Local:    http://localhost:${PORT}`);
    console.log(`   ➜ Network:  http://0.0.0.0:${PORT}`);
    console.log(`   ➜ Stack:    OpenCV • YOLO • MediaPipe • TensorFlow • PyTorch`);
    console.log(`   ➜ NLP/LLM:  LangChain • Transformers • Sentence Transformers • Gemini/OpenAI`);
    console.log(`======================================================\n`);
  });
}

startServer();
