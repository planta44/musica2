import express from 'express';
import { authenticateAdmin } from '../middleware/auth.js';
import { broadcastContentUpdate } from './admin.js';
import prisma from '../lib/prisma.js';

const router = express.Router();

// Get site settings
router.get('/settings', async (req, res) => {
  try {
    let settings = await prisma.siteSettings.findFirst();
    
    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: {}
      });
    }
    
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update site settings (admin only)
router.put('/settings', authenticateAdmin, async (req, res) => {
  try {
    const data = req.body;
    
    let existing = await prisma.siteSettings.findFirst();
    let settings;
    
    if (!existing) {
      settings = await prisma.siteSettings.create({ data });
    } else {
      settings = await prisma.siteSettings.update({
        where: { id: existing.id },
        data: data
      });
    }
    
    // Emit real-time update via WebSocket
    if (req.app.get('io')) {
      req.app.get('io').emit('settings-updated', settings);
    }
    
    // Broadcast via SSE
    broadcastContentUpdate('settings-updated', settings);
    
    res.json(settings);
  } catch (error) {
    console.error('Settings update error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get about sections
router.get('/about', async (req, res) => {
  try {
    const sections = await prisma.aboutSection.findMany({
      orderBy: { displayOrder: 'asc' }
    });
    
    res.json(sections);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create about section (admin only)
router.post('/about', authenticateAdmin, async (req, res) => {
  try {
    const section = await prisma.aboutSection.create({
      data: req.body
    });
    
    // Emit real-time update
    if (req.app.get('io')) {
      req.app.get('io').emit('about-created', section);
    }
    broadcastContentUpdate('about-created', section);
    
    res.json(section);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update about section (admin only)
router.put('/about/:id', authenticateAdmin, async (req, res) => {
  try {
    const section = await prisma.aboutSection.update({
      where: { id: req.params.id },
      data: req.body
    });
    
    // Emit real-time update
    if (req.app.get('io')) {
      req.app.get('io').emit('about-updated', section);
    }
    broadcastContentUpdate('about-updated', section);
    
    res.json(section);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete about section (admin only)
router.delete('/about/:id', authenticateAdmin, async (req, res) => {
  try {
    await prisma.aboutSection.delete({
      where: { id: req.params.id }
    });
    
    // Emit real-time update
    if (req.app.get('io')) {
      req.app.get('io').emit('about-deleted', { id: req.params.id });
    }
    broadcastContentUpdate('about-deleted', { id: req.params.id });
    
    res.json({ message: 'Section deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
