import express from 'express';
import { authenticateAdmin } from '../middleware/auth.js';
import { broadcastContentUpdate } from './admin.js';
import prisma from '../lib/prisma.js';

const router = express.Router();

// Get all albums with photos
router.get('/albums', async (req, res) => {
  try {
    const albums = await prisma.galleryAlbum.findMany({
      include: {
        photos: {
          orderBy: { displayOrder: 'asc' }
        }
      },
      orderBy: { displayOrder: 'asc' }
    });
    
    res.json(albums);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single album with photos
router.get('/albums/:id', async (req, res) => {
  try {
    const album = await prisma.galleryAlbum.findUnique({
      where: { id: req.params.id },
      include: {
        photos: {
          orderBy: { displayOrder: 'asc' }
        }
      }
    });
    
    if (!album) {
      return res.status(404).json({ error: 'Album not found' });
    }
    
    res.json(album);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create album (admin only)
router.post('/albums', authenticateAdmin, async (req, res) => {
  try {
    const album = await prisma.galleryAlbum.create({
      data: req.body,
      include: { photos: true }
    });
    
    // Broadcast update
    if (req.app.get('io')) {
      req.app.get('io').emit('album-created', album);
    }
    broadcastContentUpdate('album-created', album);
    
    res.json(album);
  } catch (error) {
    console.error('Album create error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update album (admin only)
router.put('/albums/:id', authenticateAdmin, async (req, res) => {
  try {
    const album = await prisma.galleryAlbum.update({
      where: { id: req.params.id },
      data: req.body,
      include: { photos: true }
    });
    
    // Broadcast update
    if (req.app.get('io')) {
      req.app.get('io').emit('album-updated', album);
    }
    broadcastContentUpdate('album-updated', album);
    
    res.json(album);
  } catch (error) {
    console.error('Album update error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete album (admin only)
router.delete('/albums/:id', authenticateAdmin, async (req, res) => {
  try {
    await prisma.galleryAlbum.delete({
      where: { id: req.params.id }
    });
    
    res.json({ message: 'Album deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add photo to album (admin only)
router.post('/albums/:id/photos', authenticateAdmin, async (req, res) => {
  try {
    const photo = await prisma.photo.create({
      data: {
        ...req.body,
        albumId: req.params.id
      },
      include: { album: true }
    });
    
    // Broadcast update
    if (req.app.get('io')) {
      req.app.get('io').emit('photo-added', photo);
    }
    broadcastContentUpdate('photo-added', photo);
    
    res.json(photo);
  } catch (error) {
    console.error('Photo add error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update photo (admin only)
router.put('/photos/:id', authenticateAdmin, async (req, res) => {
  try {
    const photo = await prisma.photo.update({
      where: { id: req.params.id },
      data: req.body
    });
    
    res.json(photo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete photo (admin only)
router.delete('/photos/:id', authenticateAdmin, async (req, res) => {
  try {
    await prisma.photo.delete({
      where: { id: req.params.id }
    });
    
    // Broadcast update
    if (req.app.get('io')) {
      req.app.get('io').emit('photo-deleted', { id: req.params.id });
    }
    broadcastContentUpdate('photo-deleted', { id: req.params.id });
    
    res.json({ message: 'Photo deleted successfully' });
  } catch (error) {
    console.error('Photo delete error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
