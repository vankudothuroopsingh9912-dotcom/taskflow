import express from 'express';
import cors from 'cors';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { connectDB, dbStatus } from './server/config/db.ts';
import authRoutes from './server/routes/authRoutes.ts';
import taskRoutes from './server/routes/taskRoutes.ts';
import dashboardRoutes from './server/routes/dashboardRoutes.ts';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Middleware
app.use(cors());
app.use(express.json());

// REST API Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);

// System Status & DB Information Endpoint
app.get('/api/system/status', (_req, res) => {
  res.json({
    status: 'operational',
    service: 'TaskFlow MERN Stack Engine',
    timestamp: new Date().toISOString(),
    database: {
      type: dbStatus.type,
      connected: dbStatus.connected,
      databaseName: dbStatus.databaseName,
      uri: dbStatus.uri,
      notice: dbStatus.error || 'Database operating nominally',
    },
  });
});

async function startServer() {
  try {
    await connectDB();

    if (process.env.NODE_ENV !== 'production') {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.resolve(process.cwd(), 'dist');
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`[TaskFlow] Server started successfully on http://0.0.0.0:${PORT}`);
    });
  } catch (error) {
    console.error('[TaskFlow] Critical startup error:', error);
    process.exit(1);
  }
}

startServer();
