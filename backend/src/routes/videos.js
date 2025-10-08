import express from 'express';
import { authenticateAdmin } from '../middleware/auth.js';
import { broadcastContentUpdate } from './admin.js';
import prisma from '../lib/prisma.js';

const router = express.Router();

// Get all videos
router.get('/', async (req, res) => {
  try {
    const videos = await prisma.video.findMany({
      orderBy: { displayOrder: 'asc' }
    });
    
    res.json(videos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single video
router.get('/:id', async (req, res) => {
  try {
    const video = await prisma.video.findUnique({
      where: { id: req.params.id }
    });
    
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }
    
    res.json(video);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create video (admin only)
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const video = await prisma.video.create({
      data: req.body
    });
    
    // Broadcast update
    if (req.app.get('io')) {
      req.app.get('io').emit('video-created', video);
    }
    broadcastContentUpdate('video-created', video);
    
    res.json(video);
  } catch (error) {
    console.error('Video create error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update video (admin only)
router.put('/:id', authenticateAdmin, async (req, res) => {
  try {
    const video = await prisma.video.update({
      where: { id: req.params.id },
      data: req.body
    });
    
    // Broadcast update
    if (req.app.get('io')) {
      req.app.get('io').emit('video-updated', video);
    }
    broadcastContentUpdate('video-updated', video);
    
    res.json(video);
  } catch (error) {
    console.error('Video update error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete video (admin only)
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    await prisma.video.delete({
      where: { id: req.params.id }
    });
    
    // Broadcast update
    if (req.app.get('io')) {
      req.app.get('io').emit('video-deleted', { id: req.params.id });
    }
    broadcastContentUpdate('video-deleted', { id: req.params.id });
    
    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Video delete error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
