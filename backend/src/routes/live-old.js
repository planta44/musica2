import express from 'express';
import { authenticateAdmin } from '../middleware/auth.js';
import { sendLiveEventNotification } from '../utils/email.js';
import prisma from '../lib/prisma.js';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

const router = express.Router();

// Email configuration
const createEmailTransporter = () => {
  if (process.env.EMAIL_SERVICE && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransporter({
      service: process.env.EMAIL_SERVICE, // 'gmail', 'outlook', etc.
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    })
  }
  return null
}

// Helper to extract embed URL from various platforms
const getEmbedUrl = (url, platform) => {
  if (!url) return null

  try {
    // YouTube
    if (platform === 'youtube' || url.includes('youtube.com') || url.includes('youtu.be')) {
      let videoId = null
      
      if (url.includes('youtube.com/watch?v=')) {
        videoId = url.split('v=')[1]?.split('&')[0]
      } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1]?.split('?')[0]
      } else if (url.includes('youtube.com/embed/')) {
        return url // Already embed format
      }
      
      return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1` : null
    }

    // Facebook
    if (platform === 'facebook' || url.includes('facebook.com')) {
      return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&autoplay=true`
    }

    // Twitch
    if (platform === 'twitch' || url.includes('twitch.tv')) {
      const channel = url.split('twitch.tv/')[1]?.split('/')[0]
      return channel ? `https://player.twitch.tv/?channel=${channel}&parent=${process.env.FRONTEND_DOMAIN || 'localhost'}` : null
    }

    // For other platforms (Meet, Zoom, etc.), return original URL
    return url
  } catch (error) {
    console.error('Error processing embed URL:', error)
    return url
  }
}

// Send email notifications to all subscribers
const sendLiveEventNotifications = async (liveEvent) => {
  const transporter = createEmailTransporter()
  if (!transporter) {
    console.log('❌ Email not configured, skipping notifications')
    return false
  }

  try {
    // Get all subscribers
    const subscribers = await prisma.subscriber.findMany({
      where: { isActive: true }
    })

    if (subscribers.length === 0) {
      console.log('📧 No active subscribers found')
      return true
    }

    const emailPromises = subscribers.map(subscriber => {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: subscriber.email,
        subject: `🎬 Live Event Starting Soon: ${liveEvent.title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #000; color: #fff; padding: 20px;">
            <h2 style="color: #9333ea; text-align: center;">🎬 Live Event Notification</h2>
            
            ${liveEvent.thumbnailUrl ? `
              <div style="text-align: center; margin: 20px 0;">
                <img src="${liveEvent.thumbnailUrl}" alt="${liveEvent.title}" style="max-width: 100%; height: 200px; object-fit: cover; border-radius: 8px;">
              </div>
            ` : ''}
            
            <h3 style="color: #fff;">${liveEvent.title}</h3>
            
            ${liveEvent.description ? `<p style="color: #ccc;">${liveEvent.description}</p>` : ''}
            
            <div style="background: #1a1a1a; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p><strong style="color: #9333ea;">📅 Scheduled:</strong> ${new Date(liveEvent.scheduledDate).toLocaleString()}</p>
              <p><strong style="color: #9333ea;">🎥 Platform:</strong> ${liveEvent.platform.toUpperCase()}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/live-events" 
                 style="background: linear-gradient(135deg, #9333ea, #a855f7); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                🎬 Watch Live Now
              </a>
            </div>
            
            <hr style="border: 1px solid #333; margin: 30px 0;">
            
            <p style="color: #888; font-size: 14px; text-align: center;">
              You're receiving this because you subscribed to live event notifications.<br>
              Visit your profile to manage notification preferences.
            </p>
          </div>
        `
      }

      return transporter.sendMail(mailOptions)
    })

    await Promise.all(emailPromises)
    console.log(`📧 Sent live event notifications to ${subscribers.length} subscribers`)
    return true
  } catch (error) {
    console.error('❌ Failed to send notifications:', error)
    return false
  }
}

// Get all live events (updated for simple embedding)
router.get('/', async (req, res) => {
  try {
    const events = await prisma.liveEvent.findMany({
      orderBy: { scheduledDate: 'desc' }
    });

    // Add embed URLs
    const eventsWithEmbeds = events.map(event => ({
      ...event,
      embedUrl: getEmbedUrl(event.streamUrl, event.platform)
    }));

    res.json(eventsWithEmbeds);
  } catch (error) {
    console.error('Live events fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get upcoming live events (public)
router.get('/upcoming', async (req, res) => {
  try {
    const upcomingEvents = await prisma.liveEvent.findMany({
      where: {
        scheduledDate: {
          gte: new Date()
        }
      },
      orderBy: { scheduledDate: 'asc' }
    });

    const eventsWithEmbeds = upcomingEvents.map(event => ({
      ...event,
      embedUrl: getEmbedUrl(event.streamUrl, event.platform)
    }));

    res.json(eventsWithEmbeds);
  } catch (error) {
    console.error('Upcoming live events fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get active live events (public)
router.get('/active', async (req, res) => {
  try {
    const activeEvents = await prisma.liveEvent.findMany({
      where: {
        isActive: true,
        scheduledDate: {
          lte: new Date(Date.now() + 30 * 60 * 1000) // Include events starting within 30 minutes
        }
      },
      orderBy: { scheduledDate: 'asc' }
    });

    const eventsWithEmbeds = activeEvents.map(event => ({
      ...event,
      embedUrl: getEmbedUrl(event.streamUrl, event.platform)
    }));

    res.json(eventsWithEmbeds);
  } catch (error) {
    console.error('Active live events fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single live event
router.get('/:id', async (req, res) => {
  try {
    const event = await prisma.liveEvent.findUnique({
      where: { id: req.params.id },
      include: {
        participants: {
          include: {
            subscriber: { select: { name: true, email: true } }
          }
        }
      }
    });
    
    if (!event) {
      return res.status(404).json({ error: 'Live event not found' });
    }
    
    res.json(event);
  } catch (error) {
    console.error('Error fetching live event:', error);
    res.status(500).json({ error: 'Failed to fetch live event' });
  }
});

// Create live event (admin only)
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const { title, description, scheduledAt, accessFee, maxParticipants, thumbnailUrl } = req.body;
    
    const event = await prisma.liveEvent.create({
      data: {
        title,
        description,
        scheduledAt: new Date(scheduledAt),
        accessFee: accessFee || 5.0,
        maxParticipants,
        thumbnailUrl,
        streamUrl: crypto.randomBytes(16).toString('hex') // Generate unique room ID
      }
    });
    
    // Emit real-time update
    if (req.app.get('io')) {
      req.app.get('io').emit('live-event-created', event);
    }
    
    res.json(event);
  } catch (error) {
    console.error('Error creating live event:', error);
    res.status(500).json({ error: 'Failed to create live event' });
  }
});

// Update live event (admin only)
router.put('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { title, description, scheduledAt, accessFee, maxParticipants, thumbnailUrl, status } = req.body;
    
    const event = await prisma.liveEvent.update({
      where: { id: req.params.id },
      data: {
        title,
        description,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
        accessFee,
        maxParticipants,
        thumbnailUrl,
        status
      }
    });
    
    // Emit real-time update
    if (req.app.get('io')) {
      req.app.get('io').emit('live-event-updated', event);
    }
    
    res.json(event);
  } catch (error) {
    console.error('Error updating live event:', error);
    res.status(500).json({ error: 'Failed to update live event' });
  }
});

// Delete live event (admin only)
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    await prisma.liveEvent.delete({
      where: { id: req.params.id }
    });
    
    // Emit real-time update
    if (req.app.get('io')) {
      req.app.get('io').emit('live-event-deleted', { id: req.params.id });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting live event:', error);
    res.status(500).json({ error: 'Failed to delete live event' });
  }
});

// Start live event (admin only)
router.post('/:id/start', authenticateAdmin, async (req, res) => {
  try {
    const event = await prisma.liveEvent.update({
      where: { id: req.params.id },
      data: {
        status: 'live',
        startedAt: new Date()
      }
    });
    
    // Send notifications to ALL subscribers (not just fan club)
    const subscribers = await prisma.subscriber.findMany();
    
    // Send email notifications asynchronously to all subscribers
    const emailPromises = subscribers.map(subscriber => 
      sendLiveEventNotification(subscriber.email, event)
        .catch(error => console.error(`Failed to send notification to ${subscriber.email}:`, error))
    );
    
    // Don't wait for all emails to complete
    Promise.all(emailPromises).catch(err => console.error('Email batch error:', err));
    
    // Emit real-time update
    if (req.app.get('io')) {
      req.app.get('io').emit('live-event-started', event);
    }
    
    res.json({ event, notificationsSent: subscribers.length });
  } catch (error) {
    console.error('Error starting live event:', error);
    res.status(500).json({ error: 'Failed to start live event' });
  }
});

// End live event (admin only)
router.post('/:id/end', authenticateAdmin, async (req, res) => {
  try {
    const event = await prisma.liveEvent.update({
      where: { id: req.params.id },
      data: {
        status: 'ended',
        endedAt: new Date()
      }
    });
    
    // Emit real-time update
    if (req.app.get('io')) {
      req.app.get('io').emit('live-event-ended', event);
    }
    
    res.json(event);
  } catch (error) {
    console.error('Error ending live event:', error);
    res.status(500).json({ error: 'Failed to end live event' });
  }
});

// Request access token (after payment)
router.post('/:id/access', async (req, res) => {
  try {
    const { subscriberId, paymentId } = req.body;
    
    const event = await prisma.liveEvent.findUnique({
      where: { id: req.params.id }
    });
    
    if (!event) {
      return res.status(404).json({ error: 'Live event not found' });
    }
    
    if (event.status !== 'live' && event.status !== 'scheduled') {
      return res.status(400).json({ error: 'Event is not active' });
    }
    
    // Verify payment if required
    if (event.accessFee > 0 && paymentId) {
      const payment = await prisma.payment.findFirst({
        where: {
          id: paymentId,
          subscriberId,
          status: 'completed'
        }
      });
      
      if (!payment) {
        return res.status(403).json({ error: 'Payment verification failed' });
      }
    }
    
    // Generate access token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(event.scheduledAt);
    expiresAt.setHours(expiresAt.getHours() + 4); // Token valid for 4 hours after event start
    
    const accessToken = await prisma.liveAccessToken.create({
      data: {
        liveEventId: req.params.id,
        subscriberId,
        token,
        paymentId,
        expiresAt
      }
    });
    
    res.json({ token: accessToken.token, expiresAt });
  } catch (error) {
    console.error('Error creating access token:', error);
    res.status(500).json({ error: 'Failed to create access token' });
  }
});

// Verify access token
router.post('/:id/verify-access', async (req, res) => {
  try {
    const { token } = req.body;
    
    const accessToken = await prisma.liveAccessToken.findUnique({
      where: { token },
      include: {
        liveEvent: true,
        subscriber: true
      }
    });
    
    if (!accessToken) {
      return res.status(404).json({ error: 'Invalid access token' });
    }
    
    if (accessToken.expiresAt < new Date()) {
      return res.status(403).json({ error: 'Access token expired' });
    }
    
    if (accessToken.liveEventId !== req.params.id) {
      return res.status(403).json({ error: 'Token not valid for this event' });
    }
    
    // Mark token as used
    await prisma.liveAccessToken.update({
      where: { id: accessToken.id },
      data: { used: true, usedAt: new Date() }
    });
    
    res.json({
      valid: true,
      event: accessToken.liveEvent,
      subscriber: {
        id: accessToken.subscriber.id,
        name: accessToken.subscriber.name,
        email: accessToken.subscriber.email
      }
    });
  } catch (error) {
    console.error('Error verifying access token:', error);
    res.status(500).json({ error: 'Failed to verify access token' });
  }
});

// Join live event
router.post('/:id/join', async (req, res) => {
  try {
    const { subscriberId, token } = req.body;
    
    // Verify access token
    const accessToken = await prisma.liveAccessToken.findFirst({
      where: {
        token,
        liveEventId: req.params.id,
        subscriberId,
        expiresAt: { gte: new Date() }
      }
    });
    
    if (!accessToken) {
      return res.status(403).json({ error: 'Invalid or expired access token' });
    }
    
    // Create or update participant
    const participant = await prisma.liveParticipant.upsert({
      where: {
        liveEventId_subscriberId: {
          liveEventId: req.params.id,
          subscriberId
        }
      },
      update: {
        leftAt: null
      },
      create: {
        liveEventId: req.params.id,
        subscriberId
      },
      include: {
        subscriber: true
      }
    });
    
    // Emit real-time update
    if (req.app.get('io')) {
      req.app.get('io').to(req.params.id).emit('participant-joined', participant);
    }
    
    res.json(participant);
  } catch (error) {
    console.error('Error joining live event:', error);
    res.status(500).json({ error: 'Failed to join live event' });
  }
});

// Update participant status (mic, video, hand)
router.put('/:id/participant', async (req, res) => {
  try {
    const { subscriberId, micEnabled, videoEnabled, handRaised } = req.body;
    
    const participant = await prisma.liveParticipant.update({
      where: {
        liveEventId_subscriberId: {
          liveEventId: req.params.id,
          subscriberId
        }
      },
      data: {
        micEnabled,
        videoEnabled,
        handRaised
      }
    });
    
    // Emit real-time update
    if (req.app.get('io')) {
      req.app.get('io').to(req.params.id).emit('participant-updated', participant);
    }
    
    res.json(participant);
  } catch (error) {
    console.error('Error updating participant:', error);
    res.status(500).json({ error: 'Failed to update participant' });
  }
});

// Leave live event
router.post('/:id/leave', async (req, res) => {
  try {
    const { subscriberId } = req.body;
    
    const participant = await prisma.liveParticipant.update({
      where: {
        liveEventId_subscriberId: {
          liveEventId: req.params.id,
          subscriberId
        }
      },
      data: {
        leftAt: new Date()
      }
    });
    
    // Emit real-time update
    if (req.app.get('io')) {
      req.app.get('io').to(req.params.id).emit('participant-left', participant);
    }
    
    res.json(participant);
  } catch (error) {
    console.error('Error leaving live event:', error);
    res.status(500).json({ error: 'Failed to leave live event' });
  }
});

export default router;
