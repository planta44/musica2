import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

// Routes
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import contentRoutes from './routes/content.js';
import musicRoutes from './routes/music.js';
import videoRoutes from './routes/videos.js';
import galleryRoutes from './routes/gallery.js';
import eventRoutes from './routes/events.js';
import merchRoutes from './routes/merch.js';
import subscriberRoutes from './routes/subscribers.js';
import paymentRoutes from './routes/payments.js';
import contactRoutes from './routes/contact.js';
import uploadRoutes from './routes/upload.js';
import liveRoutes from './routes/live.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  }
});
const PORT = process.env.PORT || 3001;

// Make io available to routes
app.set('io', io);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use('/api/', limiter);

// Static uploads folder (for development)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Keep alive endpoint with database check
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      database: 'connected'
    })
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message
    })
  }
})

// Extended timeout for long-running requests
app.use((req, res, next) => {
  req.setTimeout(300000) // 5 minutes
  res.setTimeout(300000)
  next()
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/music', musicRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/merch', merchRoutes);
app.use('/api/subscribers', subscriberRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/live', liveRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Join live event room
  socket.on('join-live-event', (eventId) => {
    socket.join(eventId);
    console.log(`Socket ${socket.id} joined live event: ${eventId}`);
  });

  // Leave live event room
  socket.on('leave-live-event', (eventId) => {
    socket.leave(eventId);
    console.log(`Socket ${socket.id} left live event: ${eventId}`);
  });

  // WebRTC signaling for peer connections
  socket.on('webrtc-offer', ({ eventId, offer, targetSocketId }) => {
    socket.to(targetSocketId).emit('webrtc-offer', { offer, fromSocketId: socket.id });
  });

  socket.on('webrtc-answer', ({ eventId, answer, targetSocketId }) => {
    socket.to(targetSocketId).emit('webrtc-answer', { answer, fromSocketId: socket.id });
  });

  socket.on('webrtc-ice-candidate', ({ eventId, candidate, targetSocketId }) => {
    socket.to(targetSocketId).emit('webrtc-ice-candidate', { candidate, fromSocketId: socket.id });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔌 WebSocket server ready`);
});
