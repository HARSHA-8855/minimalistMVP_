import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import authRoutes from './routes/authRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import consultationRoutes from './routes/consultationRoutes.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api', paymentRoutes);
app.use('/api/consultations', consultationRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

const DEFAULT_PORT = Number(process.env.PORT) || 6500;

const startServer = (port, remainingAttempts = 5) => {
  const server = app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
  });

  server.on('error', (err) => {
    if (err && err.code === 'EADDRINUSE' && remainingAttempts > 0) {
      const nextPort = port + 1;
      console.warn(`Port ${port} in use. Retrying on ${nextPort}... (${remainingAttempts - 1} attempts left)`);
      setTimeout(() => startServer(nextPort, remainingAttempts - 1), 500);
    } else {
      console.error('Failed to start server:', err);
      process.exit(1);
    }
  });
};

startServer(DEFAULT_PORT);

