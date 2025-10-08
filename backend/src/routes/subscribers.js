import express from 'express';
import { authenticateAdmin } from '../middleware/auth.js';
import { sendNewsletter } from '../utils/email.js';
import prisma from '../lib/prisma.js';

const router = express.Router();

// Subscribe to newsletter
router.post('/subscribe', async (req, res) => {
  try {
    const { email, name } = req.body;
    const subscriber = await prisma.subscriber.upsert({
      where: { email: email.toLowerCase() },
      update: { name },
      create: { 
        email: email.toLowerCase(),
        name
      }
    });
    
    res.json({ message: 'Successfully subscribed!', subscriber });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Join fan club (subscribe + flag)
router.post('/fan-club', async (req, res) => {
  try {
    const { email, name } = req.body;
    
    const subscriber = await prisma.subscriber.upsert({
      where: { email: email.toLowerCase() },
      update: { name, isFanClub: true },
      create: { 
        email: email.toLowerCase(),
        name,
        isFanClub: true
      }
    });
    
    res.json({ message: 'Welcome to the fan club!', subscriber });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all subscribers (admin only)
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const subscribers = await prisma.subscriber.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(subscribers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get fan club members (admin only)
router.get('/fan-club', authenticateAdmin, async (req, res) => {
  try {
    const members = await prisma.subscriber.findMany({
      where: { isFanClub: true },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update subscriber (admin only)
router.put('/:id', authenticateAdmin, async (req, res) => {
  try {
    const subscriber = await prisma.subscriber.update({
      where: { id: req.params.id },
      data: req.body
    });
    
    res.json(subscriber);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete subscriber (admin only)
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    await prisma.subscriber.delete({
      where: { id: req.params.id }
    });
    
    res.json({ message: 'Subscriber deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send newsletter/broadcast (admin only)
router.post('/broadcast', authenticateAdmin, async (req, res) => {
  try {
    const { subject, message, targetGroup } = req.body; // targetGroup: 'all', 'fanclub'
    
    let subscribers;
    if (targetGroup === 'fanclub') {
      subscribers = await prisma.subscriber.findMany({
        where: { isFanClub: true }
      });
    } else {
      subscribers = await prisma.subscriber.findMany();
    }
    
    // Send emails (in background)
    const emailPromises = subscribers.map(sub => 
      sendNewsletter(sub.email, subject, message)
    );
    
    // Don't wait for all to complete - return immediately
    Promise.all(emailPromises).catch(err => {
      console.error('Error sending newsletter:', err);
    });
    
    res.json({ 
      message: `Newsletter queued for ${subscribers.length} recipients`,
      count: subscribers.length 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export subscribers (admin only)
router.get('/export', authenticateAdmin, async (req, res) => {
  try {
    const subscribers = await prisma.subscriber.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    // Convert to CSV
    const csv = [
      'Email,Name,Fan Club,Has Access,Created At',
      ...subscribers.map(s => 
        `${s.email},${s.name || ''},${s.isFanClub},${s.hasAccess},${s.createdAt.toISOString()}`
      )
    ].join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=subscribers.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
