import express from 'express';
import cors from 'cors';
import { connectDB } from './db.js';

import sseRoutes from './sse.js';
import authRoutes from './routes/authRoutes.js';
import roleRoutes from './routes/roleRoutes.js';
import branchRoutes from './routes/branchRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import ratingRoutes from './routes/ratingRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import logRoutes from './routes/logRoutes.js';

const PORT = process.env.PORT || 4000;

async function startServer() {
  await connectDB();

  const app = express();
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));

  app.use('/api', sseRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/branches', branchRoutes);
  app.use('/api/employees', employeeRoutes);
  app.use('/api/ratings', ratingRoutes);
  app.use('/api/stats', statsRoutes);
  app.use('/api', roleRoutes);
  app.use('/api', logRoutes);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server "Filiallar Xodimlarini Baholash Tizimi" port ${PORT} da muvaffaqiyatli ishga tushdi.`);
  });
}

startServer();
