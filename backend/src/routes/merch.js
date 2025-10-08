import express from 'express';
import { authenticateAdmin } from '../middleware/auth.js';
import { broadcastContentUpdate } from './admin.js';
import prisma from '../lib/prisma.js';

const router = express.Router();

// Get all merch items
router.get('/', async (req, res) => {
  try {
    const items = await prisma.merchItem.findMany({
      orderBy: { displayOrder: 'asc' }
    });
    
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single merch item
router.get('/:id', async (req, res) => {
  try {
    const item = await prisma.merchItem.findUnique({
      where: { id: req.params.id }
    });
    
    if (!item) {
      return res.status(404).json({ error: 'Merch item not found' });
    }
    
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create merch item (admin only)
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const item = await prisma.merchItem.create({
      data: req.body
    });
    
    // Broadcast update
    if (req.app.get('io')) {
      req.app.get('io').emit('merch-created', item);
    }
    broadcastContentUpdate('merch-created', item);
    
    res.json(item);
  } catch (error) {
    console.error('Merch create error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update merch item (admin only)
router.put('/:id', authenticateAdmin, async (req, res) => {
  try {
    const item = await prisma.merchItem.update({
      where: { id: req.params.id },
      data: req.body
    });
    
    // Broadcast update
    if (req.app.get('io')) {
      req.app.get('io').emit('merch-updated', item);
    }
    broadcastContentUpdate('merch-updated', item);
    
    res.json(item);
  } catch (error) {
    console.error('Merch update error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete merch item (admin only)
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    await prisma.merchItem.delete({
      where: { id: req.params.id }
    });
    
    // Broadcast update
    if (req.app.get('io')) {
      req.app.get('io').emit('merch-deleted', { id: req.params.id });
    }
    broadcastContentUpdate('merch-deleted', { id: req.params.id });
    
    res.json({ message: 'Merch item deleted successfully' });
  } catch (error) {
    console.error('Merch delete error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
