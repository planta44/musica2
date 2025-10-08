import express from 'express';
import { authenticateAdmin } from '../middleware/auth.js';
import prisma from '../lib/prisma.js';

const router = express.Router();

// SSE clients for real-time updates
const sseClients = new Set();

// Get dashboard stats
router.get('/dashboard', authenticateAdmin, async (req, res) => {
  try {
    const [
      subscribersCount,
      fanClubCount,
      musicItemsCount,
      eventsCount,
      paymentsCount,
      recentPayments
    ] = await Promise.all([
      prisma.subscriber.count(),
      prisma.subscriber.count({ where: { isFanClub: true } }),
      prisma.musicItem.count(),
      prisma.event.count(),
      prisma.payment.count(),
      prisma.payment.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { subscriber: true }
      })
    ]);
    
    const totalRevenue = await prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: 'completed' }
    });
    
    res.json({
      stats: {
        subscribers: subscribersCount,
        fanClubMembers: fanClubCount,
        musicItems: musicItemsCount,
        events: eventsCount,
        payments: paymentsCount,
        totalRevenue: totalRevenue._sum.amount || 0
      },
      recentPayments
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all content for admin editing
router.get('/content/all', authenticateAdmin, async (req, res) => {
  try {
    const [
      settings,
      musicItems,
      videos,
      albums,
      events,
      merchItems,
      aboutSections
    ] = await Promise.all([
      prisma.siteSettings.findFirst(),
      prisma.musicItem.findMany({ orderBy: { displayOrder: 'asc' } }),
      prisma.video.findMany({ orderBy: { displayOrder: 'asc' } }),
      prisma.galleryAlbum.findMany({ 
        include: { photos: { orderBy: { displayOrder: 'asc' } } },
        orderBy: { displayOrder: 'asc' }
      }),
      prisma.event.findMany({ orderBy: { eventDate: 'asc' } }),
      prisma.merchItem.findMany({ orderBy: { displayOrder: 'asc' } }),
      prisma.aboutSection.findMany({ orderBy: { displayOrder: 'asc' } })
    ]);
    
    res.json({
      settings,
      musicItems,
      videos,
      albums,
      events,
      merchItems,
      aboutSections
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// SSE endpoint for real-time content updates (public)
router.get('/content/updates', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  // Send initial connection message
  res.write('data: {"type":"connected"}\n\n');
  
  // Add client to set
  sseClients.add(res);
  
  // Remove client on disconnect
  req.on('close', () => {
    sseClients.delete(res);
  });
});

// Helper function to broadcast updates to all SSE clients
export function broadcastContentUpdate(type, data) {
  const message = JSON.stringify({ type, data, timestamp: Date.now() });
  sseClients.forEach(client => {
    try {
      client.write(`data: ${message}\n\n`);
    } catch (error) {
      sseClients.delete(client);
    }
  });
}

export default router;
