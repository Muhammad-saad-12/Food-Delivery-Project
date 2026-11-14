import http from 'http';
import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { initSocket } from './config/socket.js';
import { healthRouter } from './routes/health.js';
import { authRouter } from './routes/auth.js';
import { restaurantRouter } from './routes/restaurants.js';
import { menuRouter } from './routes/menu.js';
import { aiRouter } from './routes/ai.js';
import { seedDatabaseIfEmpty } from './utils/seedData.js';

// Load environment variables
dotenv.config();

const app: Application = express();
const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server);

// Security & Body parsing middlewares
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/restaurants', restaurantRouter);
app.use('/api/menu', menuRouter);
app.use('/api/ai', aiRouter);

// 404 Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global Error Handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Server Error]', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

const PORT = Number(process.env.PORT) || 5000;

// Start server
server.listen(PORT, '0.0.0.0', async () => {
  console.log(`[Server] Restaurant Management API running on http://localhost:${PORT}`);
  console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
  // Asynchronously connect database and seed if required
  connectDB().then(() => {
    seedDatabaseIfEmpty();
  });
});

export { app, server };
