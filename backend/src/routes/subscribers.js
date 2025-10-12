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
      if (existing.emailVerified) {
        // Already verified, just update to fan club
        const updated = await prisma.subscriber.update({
          where: { email: email.toLowerCase() },
          data: {
            name,
            isFanClub: true,
            hasAccess: true
          }
        });
        
        return res.json({ 
          message: 'Welcome back to the Fan Club!',
          subscriber: updated
        });
      }
      
      // Not verified, resend verification email
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      
      await prisma.subscriber.update({
        where: { email: email.toLowerCase() },
        data: {
          name,
          isFanClub: true,
          verificationToken,
          verificationExpires
        }
      });
      
      try {
        await sendVerificationEmail(email, name, verificationToken);
        console.log(`✅ Verification email sent successfully to: ${email}`);
      } catch (emailError) {
        console.error(`❌ Failed to send verification email to ${email}:`, emailError.message);
        // Continue anyway - user can try resend later
      }
      
      return res.json({ 
        message: 'Verification email sent! Please check your inbox.',
        requiresVerification: true 
      });
    }
    
    // Create new subscriber with email verification
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    const subscriber = await prisma.subscriber.create({
      data: { 
        email: email.toLowerCase(),
        name,
        isFanClub: true,
        hasAccess: true,
        emailVerified: false, // Require verification
        verificationToken,
        verificationExpires
      }
    });
    
    // Send verification email
    try {
      await sendVerificationEmail(email, name, verificationToken);
      console.log(`✅ Verification email sent successfully to: ${email}`);
    } catch (emailError) {
      console.error(`❌ Failed to send verification email to ${email}:`, emailError.message);
      // Continue anyway - user can try resend later
    }
    
    res.json({ 
      message: 'Verification email sent! Please check your inbox.',
      requiresVerification: true
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

// Resend verification email
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
    
    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    await prisma.subscriber.update({
      where: { id: subscriber.id },
      data: {
        verificationToken,
        verificationExpires
      }
    });
    
    // Send verification email
    try {
      await sendVerificationEmail(subscriber.email, subscriber.name, verificationToken);
      console.log(`✅ Resend verification email sent successfully to: ${subscriber.email}`);
    } catch (emailError) {
      console.error(`❌ Failed to resend verification email to ${subscriber.email}:`, emailError.message);
      return res.status(500).json({ error: 'Failed to send verification email. Please try again.' });
    }
    
    res.json({ message: 'Verification email resent! Please check your inbox.' });
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
    
    if (!subject || !message) {
      return res.status(400).json({ error: 'Subject and message are required' });
    }
    
    let subscribers;
    if (targetGroup === 'fanclub') {
      subscribers = await prisma.subscriber.findMany({
        where: { 
          isFanClub: true
          // Removed emailVerified requirement - send to all subscribers
        }
      });
    } else {
      subscribers = await prisma.subscriber.findMany({
        // Removed emailVerified requirement - send to all subscribers
      });
    }
    
    console.log(`📧 Sending broadcast to ${subscribers.length} subscribers...`);
    
    // Send emails in batches to avoid overwhelming the server
    let successCount = 0;
    let failCount = 0;
    
    for (const sub of subscribers) {
      try {
        console.log(`📤 Sending newsletter to: ${sub.email}`);
        await sendNewsletter(sub.email, subject, message);
        console.log(`✅ Newsletter sent successfully to: ${sub.email}`);
        successCount++;
      } catch (error) {
        console.error(`❌ Failed to send newsletter to ${sub.email}:`, error.message);
        failCount++;
      }
      
      // Small delay between emails to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`✅ Broadcast complete: ${successCount} sent, ${failCount} failed`);
    
    res.json({ 
      message: `Newsletter sent to ${successCount} recipients`,
      success: successCount,
      failed: failCount,
      total: subscribers.length
    });
  } catch (error) {
    console.error('Broadcast error:', error);
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
