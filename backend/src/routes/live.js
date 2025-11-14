import express from 'express';
import { authenticateAdmin } from '../middleware/auth.js';
import prisma from '../lib/prisma.js';
import fetch from 'node-fetch';

const router = express.Router();

// Brevo Email API configuration  
const sendBrevoEmail = async (to, subject, htmlContent) => {
  if (!process.env.BREVO_API_KEY) {
    console.log('❌ BREVO_API_KEY not configured, skipping email')
    return false
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY
      },
      body: JSON.stringify({
        sender: {
          name: process.env.SENDER_NAME || 'Live Events',
          email: process.env.SENDER_EMAIL
        },
        to: [{ email: to }],
        subject: subject,
        htmlContent: htmlContent
      })
    })

    if (response.ok) {
      return true
    } else {
      const error = await response.text()
      console.error('❌ Brevo API error:', error)
      return false
    }
  } catch (error) {
    console.error('❌ Email send error:', error)
    return false
  }
}

// Helper to extract embed URL from various platforms
const getEmbedUrl = (url, platform) => {
  if (!url) return null

  try {
    // YouTube - Full embedding support
    if (platform === 'youtube' || url.includes('youtube.com') || url.includes('youtu.be')) {
      let videoId = null
      
      if (url.includes('youtube.com/watch?v=')) {
        videoId = url.split('v=')[1]?.split('&')[0]
      } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1]?.split('?')[0]
      } else if (url.includes('youtube.com/embed/')) {
        return url
      }
      
      return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1` : null
    }

    // Facebook - Full embedding support
    if (platform === 'facebook' || url.includes('facebook.com')) {
      const encodedUrl = encodeURIComponent(url)
      return `https://www.facebook.com/plugins/video.php?href=${encodedUrl}&show_text=false&autoplay=false&width=100%&height=100%`
    }

    // Twitch - Full embedding support
    if (platform === 'twitch' || url.includes('twitch.tv')) {
      const channel = url.split('twitch.tv/')[1]?.split('/')[0]
      const domain = process.env.FRONTEND_DOMAIN || 'localhost'
      return channel ? `https://player.twitch.tv/?channel=${channel}&parent=${domain}&autoplay=false` : null
    }

    // Instagram Live - Limited embedding
    if (platform === 'instagram' || url.includes('instagram.com')) {
      // Instagram doesn't allow direct embedding, but we can create a custom player
      return null // Will be handled by custom player
    }

    // LinkedIn Live - Limited embedding  
    if (platform === 'linkedin' || url.includes('linkedin.com')) {
      // LinkedIn has limited embedding support
      return null // Will be handled by custom player
    }

    // TikTok Live - Embedding support
    if (platform === 'tiktok' || url.includes('tiktok.com')) {
      const videoId = url.split('/video/')[1]?.split('?')[0]
      return videoId ? `https://www.tiktok.com/embed/v2/${videoId}` : null
    }

    // Vimeo - Full embedding support
    if (platform === 'vimeo' || url.includes('vimeo.com')) {
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0]
      return videoId ? `https://player.vimeo.com/video/${videoId}?autoplay=0&title=0&byline=0&portrait=0` : null
    }

    // For platforms like Google Meet, Zoom, WhatsApp - Create custom embedded experience
    if (platform === 'meet' || url.includes('meet.google.com')) {
      return null // Will be handled by custom Meet player
    }

    if (platform === 'zoom' || url.includes('zoom.us')) {
      return null // Will be handled by custom Zoom player
    }

    if (platform === 'whatsapp' || url.includes('whatsapp.com')) {
      return null // Will be handled by custom WhatsApp player
    }

    // Generic URL - try to create iframe-friendly version
    return null // Will be handled by custom player
  } catch (error) {
    console.error('Error processing embed URL:', error)
    return null
  }
}

// Send "Event Scheduled" notifications when a live event is created
const sendEventScheduledNotifications = async (liveEvent) => {
  if (!process.env.BREVO_API_KEY) {
    console.log('❌ BREVO_API_KEY not configured, skipping notifications')
    return false
  }

  try {
    const subscribers = await prisma.subscriber.findMany({
      where: { isActive: true }
    })

    if (subscribers.length === 0) {
      console.log('📧 No active subscribers found')
      return true
    }

    // Create beautiful HTML email template for scheduled event
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #000; color: #fff; padding: 20px; border-radius: 10px;">
        <h2 style="color: #9333ea; text-align: center; margin-bottom: 30px;">📅 New Live Event Scheduled!</h2>
        
        ${liveEvent.thumbnailUrl ? `
          <div style="text-align: center; margin: 20px 0;">
            <img src="${liveEvent.thumbnailUrl}" alt="${liveEvent.title}" style="max-width: 100%; height: 200px; object-fit: cover; border-radius: 8px;">
          </div>
        ` : ''}
        
        <h3 style="color: #fff; text-align: center; margin: 20px 0;">${liveEvent.title}</h3>
        
        ${liveEvent.description ? `<p style="color: #ccc; text-align: center; margin-bottom: 30px;">${liveEvent.description}</p>` : ''}
        
        <div style="background: #1a1a1a; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 10px 0;"><strong style="color: #9333ea;">📅 Date & Time:</strong> ${new Date(liveEvent.scheduledDate).toLocaleString()}</p>
          <p style="margin: 10px 0;"><strong style="color: #9333ea;">🎥 Platform:</strong> ${liveEvent.platform.toUpperCase()}</p>
          <p style="margin: 10px 0;"><strong style="color: #a855f7;">⏰ Status:</strong> Upcoming - Mark your calendar!</p>
        </div>
        
        <div style="text-align: center; margin: 40px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/live-events" 
             style="background: linear-gradient(135deg, #9333ea, #a855f7); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
            📅 View Event Details
          </a>
        </div>
        
        <hr style="border: 1px solid #333; margin: 30px 0;">
        
        <p style="color: #888; font-size: 14px; text-align: center; margin: 0;">
          Get ready! We'll send another notification when this event goes live.<br>
          Sent by ${process.env.SENDER_NAME || 'Live Events'}
        </p>
      </div>
    `

    // Send emails using Brevo API
    let successCount = 0
    const emailPromises = subscribers.map(async (subscriber) => {
      const success = await sendBrevoEmail(
        subscriber.email,
        `📅 New Live Event: ${liveEvent.title}`,
        htmlContent
      )
      if (success) successCount++
      return success
    })

    await Promise.all(emailPromises)
    console.log(`📅 Sent event scheduled notifications to ${successCount}/${subscribers.length} subscribers`)
    return successCount > 0
  } catch (error) {
    console.error('❌ Failed to send event scheduled notifications:', error)
    return false
  }
}

// Send "Going Live" notifications when a live event is activated
const sendLiveEventNotifications = async (liveEvent) => {
  if (!process.env.BREVO_API_KEY) {
    console.log('❌ BREVO_API_KEY not configured, skipping notifications')
    return false
  }

  try {
    const subscribers = await prisma.subscriber.findMany({
      where: { isActive: true }
    })

    if (subscribers.length === 0) {
      console.log('📧 No active subscribers found')
      return true
    }

    // Create beautiful HTML email template for going live
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #000; color: #fff; padding: 20px; border-radius: 10px;">
        <div style="background: linear-gradient(135deg, #ef4444, #f97316); padding: 15px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
          <h2 style="color: #fff; margin: 0; font-size: 24px;">🔴 LIVE NOW!</h2>
        </div>
        
        ${liveEvent.thumbnailUrl ? `
          <div style="text-align: center; margin: 20px 0;">
            <img src="${liveEvent.thumbnailUrl}" alt="${liveEvent.title}" style="max-width: 100%; height: 200px; object-fit: cover; border-radius: 8px;">
          </div>
        ` : ''}
        
        <h3 style="color: #fff; text-align: center; margin: 20px 0;">${liveEvent.title}</h3>
        
        ${liveEvent.description ? `<p style="color: #ccc; text-align: center; margin-bottom: 30px;">${liveEvent.description}</p>` : ''}
        
        <div style="background: #1a1a1a; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 10px 0;"><strong style="color: #ef4444;">🔴 Status:</strong> LIVE NOW!</p>
          <p style="margin: 10px 0;"><strong style="color: #9333ea;">📅 Started:</strong> ${new Date(liveEvent.scheduledDate).toLocaleString()}</p>
          <p style="margin: 10px 0;"><strong style="color: #9333ea;">🎥 Platform:</strong> ${liveEvent.platform.toUpperCase()}</p>
        </div>
        
        <div style="text-align: center; margin: 40px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/live-events" 
             style="background: linear-gradient(135deg, #ef4444, #f97316); color: white; padding: 20px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 18px; animation: pulse 2s infinite;">
            🔴 JOIN LIVE NOW!
          </a>
        </div>
        
        <hr style="border: 1px solid #333; margin: 30px 0;">
        
        <p style="color: #888; font-size: 14px; text-align: center; margin: 0;">
          You're receiving this because you subscribed to live event notifications.<br>
          Sent by ${process.env.SENDER_NAME || 'Live Events'}
        </p>
      </div>
    `

    // Send emails using Brevo API
    let successCount = 0
    const emailPromises = subscribers.map(async (subscriber) => {
      const success = await sendBrevoEmail(
        subscriber.email,
        `🔴 LIVE NOW: ${liveEvent.title}`,
        htmlContent
      )
      if (success) successCount++
      return success
    })

    await Promise.all(emailPromises)
    console.log(`📧 Sent live event notifications to ${successCount}/${subscribers.length} subscribers`)
    return successCount > 0
  } catch (error) {
    console.error('❌ Failed to send notifications:', error)
    return false
  }
}

// Get all live events (public)
router.get('/', async (req, res) => {
  try {
    const events = await prisma.liveEvent.findMany({
      orderBy: { scheduledDate: 'desc' }
    });

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
        isActive: true
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

// Create live event (admin only)
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const liveEvent = await prisma.liveEvent.create({
      data: req.body
    });

    // Send "Event Scheduled" notifications to all subscribers
    console.log('📅 Sending event scheduled notifications...');
    const notificationsSent = await sendEventScheduledNotifications(liveEvent);

    // Broadcast update
    if (req.app.get('io')) {
      req.app.get('io').emit('live-event-created', liveEvent);
    }

    res.status(201).json({
      ...liveEvent,
      scheduledNotificationResult: notificationsSent ? 'sent' : 'failed'
    });
  } catch (error) {
    console.error('Live event creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update live event (admin only)
router.put('/:id', authenticateAdmin, async (req, res) => {
  try {
    const liveEvent = await prisma.liveEvent.update({
      where: { id: req.params.id },
      data: req.body
    });

    // Broadcast update
    if (req.app.get('io')) {
      req.app.get('io').emit('live-event-updated', liveEvent);
    }

    res.json(liveEvent);
  } catch (error) {
    console.error('Live event update error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Activate live event and send notifications (admin only)
router.post('/:id/activate', authenticateAdmin, async (req, res) => {
  try {
    const liveEvent = await prisma.liveEvent.update({
      where: { id: req.params.id },
      data: { 
        isActive: true,
        notificationsSent: true
      }
    });

    // Send email notifications
    const notificationsSent = await sendLiveEventNotifications(liveEvent);

    // Broadcast live event activation
    if (req.app.get('io')) {
      req.app.get('io').emit('live-event-activated', liveEvent);
    }

    res.json({ 
      ...liveEvent, 
      notificationResult: notificationsSent ? 'sent' : 'failed' 
    });
  } catch (error) {
    console.error('Live event activation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Deactivate live event (admin only)
router.post('/:id/deactivate', authenticateAdmin, async (req, res) => {
  try {
    const liveEvent = await prisma.liveEvent.update({
      where: { id: req.params.id },
      data: { isActive: false }
    });

    // Broadcast deactivation
    if (req.app.get('io')) {
      req.app.get('io').emit('live-event-deactivated', liveEvent);
    }

    res.json(liveEvent);
  } catch (error) {
    console.error('Live event deactivation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete live event (admin only)
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    await prisma.liveEvent.delete({
      where: { id: req.params.id }
    });

    // Broadcast deletion
    if (req.app.get('io')) {
      req.app.get('io').emit('live-event-deleted', { id: req.params.id });
    }

    res.json({ message: 'Live event deleted successfully' });
  } catch (error) {
    console.error('Live event deletion error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
