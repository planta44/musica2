import express from 'express';
import { authenticateAdmin } from '../middleware/auth.js';
import { broadcastContentUpdate } from './admin.js';
import prisma from '../lib/prisma.js';
import crypto from 'crypto';

const router = express.Router();

// Get all music items
router.get('/', async (req, res) => {
  try {
    const items = await prisma.musicItem.findMany({
      orderBy: { displayOrder: 'asc' }
    });
    
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single music item
router.get('/:id', async (req, res) => {
  try {
    const item = await prisma.musicItem.findUnique({
      where: { id: req.params.id }
    });
    
    if (!item) {
      return res.status(404).json({ error: 'Music item not found' });
    }
    
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create music item (admin only)
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const item = await prisma.musicItem.create({
      data: req.body
    });
    
    // Broadcast update
    if (req.app.get('io')) {
      req.app.get('io').emit('music-created', item);
    }
    broadcastContentUpdate('music-created', item);
    
    res.json(item);
  } catch (error) {
    console.error('Music create error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update music item (admin only)
router.put('/:id', authenticateAdmin, async (req, res) => {
  try {
    const item = await prisma.musicItem.update({
      where: { id: req.params.id },
      data: req.body
    });
    
    // Broadcast update
    if (req.app.get('io')) {
      req.app.get('io').emit('music-updated', item);
    }
    broadcastContentUpdate('music-updated', item);
    
    res.json(item);
  } catch (error) {
    console.error('Music update error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete music item (admin only)
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    await prisma.musicItem.delete({
      where: { id: req.params.id }
    });
    
    // Broadcast update
    if (req.app.get('io')) {
      req.app.get('io').emit('music-deleted', { id: req.params.id });
    }
    broadcastContentUpdate('music-deleted', { id: req.params.id });
    
    res.json({ message: 'Music item deleted successfully' });
  } catch (error) {
    console.error('Music delete error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Purchase music item
router.post('/:id/purchase', async (req, res) => {
  try {
    const { customerEmail } = req.body;
    const musicItem = await prisma.musicItem.findUnique({
      where: { id: req.params.id }
    });
    
    if (!musicItem || !musicItem.isPurchasable) {
      return res.status(400).json({ error: 'Item not available for purchase' });
    }
    
    // Generate access token
    const accessToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    
    const purchase = await prisma.purchase.create({
      data: {
        musicItemId: musicItem.id,
        customerEmail,
        accessToken,
        expiresAt
      }
    });
    
    res.json({ 
      accessToken, 
      downloadUrl: `/api/music/${musicItem.id}/download?token=${accessToken}`,
      expiresAt 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Download purchased music
router.get('/:id/download', async (req, res) => {
  try {
    const { token } = req.query;
    
    const purchase = await prisma.purchase.findUnique({
      where: { accessToken: token },
      include: { musicItem: true }
    });
    
    if (!purchase || purchase.expiresAt < new Date()) {
      return res.status(403).json({ error: 'Invalid or expired access token' });
    }
    
    if (purchase.musicItemId !== req.params.id) {
      return res.status(403).json({ error: 'Token does not match music item' });
    }
    
    // Return download URL or redirect
    res.json({ 
      downloadUrl: purchase.musicItem.downloadUrl,
      title: purchase.musicItem.title,
      artist: purchase.musicItem.artist
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
