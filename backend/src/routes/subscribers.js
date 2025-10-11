import express from 'express';
import crypto from 'crypto';
import { authenticateAdmin } from '../middleware/auth.js';
import { sendNewsletter, sendVerificationEmail } from '../utils/email.js';
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

// Join fan club (subscribe + flag) - with email verification
router.post('/fan-club', async (req, res) => {
  try {
    const { email, name } = req.body;
    
    // Check if subscriber already exists
    const existing = await prisma.subscriber.findUnique({
      where: { email: email.toLowerCase() }
    });
    
    if (existing) {
      // Update to fan club member
      const updated = await prisma.subscriber.update({
        where: { email: email.toLowerCase() },
        data: {
          name,
          isFanClub: true,
          emailVerified: true, // Auto-verify for free fan club
          hasAccess: true
        }
      });
      
      return res.json({ 
        message: 'Welcome back to the Fan Club!',
        subscriber: updated
      });
    }
    
    // Create new subscriber - NO EMAIL VERIFICATION (Free instant access)
    const subscriber = await prisma.subscriber.create({
      data: { 
        email: email.toLowerCase(),
        name,
        isFanClub: true,
        hasAccess: true,
        emailVerified: true, // Auto-verify for free fan club
        verificationToken: null,
        verificationExpires: null
      }
    });
    
    res.json({ 
      message: 'Welcome to the Fan Club!',
      subscriber
    });
  } catch (error) {
    console.error('Fan club join error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Login subscriber
router.post('/login', async (req, res) => {
  try {
    const { email } = req.body;
    
    const subscriber = await prisma.subscriber.findUnique({
      where: { email: email.toLowerCase() }
    });
    
    if (!subscriber) {
      return res.status(404).json({ error: 'Email not found. Please sign up first.' });
    }
    
    if (!subscriber.emailVerified) {
      return res.json({ 
        requiresVerification: true, 
        message: 'Please verify your email first. Check your inbox for the verification link.' 
      });
    }
    
    // Return subscriber data (remove sensitive fields)
    const { verificationToken, verificationExpires, ...safeSubscriber } = subscriber;
    
    res.json({ 
      message: 'Login successful!', 
      subscriber: safeSubscriber 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify email
router.get('/verify/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    const subscriber = await prisma.subscriber.findFirst({
      where: {
        verificationToken: token,
        verificationExpires: {
          gt: new Date()
        }
      }
    });
    
    if (!subscriber) {
      return res.status(400).json({ error: 'Invalid or expired verification link.' });
    }
    
    // Mark as verified
    const updated = await prisma.subscriber.update({
      where: { id: subscriber.id },
      data: {
        emailVerified: true,
        verificationToken: null,
        verificationExpires: null
      }
    });
    
    // Return subscriber data (remove sensitive fields)
    const { verificationToken, verificationExpires, ...safeSubscriber } = updated;
    
    res.json({ 
      message: 'Email verified successfully! Welcome to the fan club!', 
      subscriber: safeSubscriber 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Resend verification email (now just auto-verifies for free fan club)
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;
    
    const subscriber = await prisma.subscriber.findUnique({
      where: { email: email.toLowerCase() }
    });
    
    if (!subscriber) {
      return res.status(404).json({ error: 'Email not found.' });
    }
    
    if (subscriber.emailVerified) {
      return res.status(400).json({ error: 'Email already verified. You can login now.' });
    }
    
    // Auto-verify (no email sending for free fan club)
    const updated = await prisma.subscriber.update({
      where: { id: subscriber.id },
      data: {
        emailVerified: true,
        verificationToken: null,
        verificationExpires: null,
        hasAccess: true
      }
    });
    
    const { verificationToken, verificationExpires, ...safeSubscriber } = updated;
    
    res.json({ 
      message: 'Email verified! You can now login.',
      subscriber: safeSubscriber
    });
  } catch (error) {
    console.error('Resend verification error:', error);
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
