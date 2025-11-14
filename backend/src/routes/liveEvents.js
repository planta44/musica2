const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const { authenticateAdmin } = require('../middleware/auth')
const { broadcastContentUpdate } = require('../utils/websocket')
const nodemailer = require('nodemailer')

const prisma = new PrismaClient()

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

// Get all live events (public)
router.get('/', async (req, res) => {
  try {
    const liveEvents = await prisma.liveEvent.findMany({
      orderBy: [
        { scheduledDate: 'desc' }
      ]
    })

    // Add embed URLs
    const eventsWithEmbeds = liveEvents.map(event => ({
      ...event,
      embedUrl: getEmbedUrl(event.streamUrl, event.platform)
    }))

    res.json(eventsWithEmbeds)
  } catch (error) {
    console.error('Live events fetch error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Get upcoming live events (public)
router.get('/upcoming', async (req, res) => {
  try {
    const upcomingEvents = await prisma.liveEvent.findMany({
      where: {
        scheduledDate: {
          gte: new Date()
        }
      },
      orderBy: [
        { scheduledDate: 'asc' }
      ]
    })

    const eventsWithEmbeds = upcomingEvents.map(event => ({
      ...event,
      embedUrl: getEmbedUrl(event.streamUrl, event.platform)
    }))

    res.json(eventsWithEmbeds)
  } catch (error) {
    console.error('Upcoming live events fetch error:', error)
    res.status(500).json({ error: error.message })
  }
})

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
      orderBy: [
        { scheduledDate: 'asc' }
      ]
    })

    const eventsWithEmbeds = activeEvents.map(event => ({
      ...event,
      embedUrl: getEmbedUrl(event.streamUrl, event.platform)
    }))

    res.json(eventsWithEmbeds)
  } catch (error) {
    console.error('Active live events fetch error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Create live event (admin only)
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const liveEvent = await prisma.liveEvent.create({
      data: req.body
    })

    // Broadcast update
    if (req.app.get('io')) {
      req.app.get('io').emit('live-event-created', liveEvent)
    }
    broadcastContentUpdate('live-event-created', liveEvent)

    res.status(201).json(liveEvent)
  } catch (error) {
    console.error('Live event creation error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Update live event (admin only)
router.put('/:id', authenticateAdmin, async (req, res) => {
  try {
    const liveEvent = await prisma.liveEvent.update({
      where: { id: req.params.id },
      data: req.body
    })

    // Broadcast update
    if (req.app.get('io')) {
      req.app.get('io').emit('live-event-updated', liveEvent)
    }
    broadcastContentUpdate('live-event-updated', liveEvent)

    res.json(liveEvent)
  } catch (error) {
    console.error('Live event update error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Activate live event and send notifications (admin only)
router.post('/:id/activate', authenticateAdmin, async (req, res) => {
  try {
    const liveEvent = await prisma.liveEvent.update({
      where: { id: req.params.id },
      data: { 
        isActive: true,
        notificationsSent: true
      }
    })

    // Send email notifications
    const notificationsSent = await sendLiveEventNotifications(liveEvent)

    // Broadcast live event activation
    if (req.app.get('io')) {
      req.app.get('io').emit('live-event-activated', liveEvent)
    }
    broadcastContentUpdate('live-event-activated', liveEvent)

    res.json({ 
      ...liveEvent, 
      notificationResult: notificationsSent ? 'sent' : 'failed' 
    })
  } catch (error) {
    console.error('Live event activation error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Deactivate live event (admin only)
router.post('/:id/deactivate', authenticateAdmin, async (req, res) => {
  try {
    const liveEvent = await prisma.liveEvent.update({
      where: { id: req.params.id },
      data: { isActive: false }
    })

    // Broadcast deactivation
    if (req.app.get('io')) {
      req.app.get('io').emit('live-event-deactivated', liveEvent)
    }
    broadcastContentUpdate('live-event-deactivated', liveEvent)

    res.json(liveEvent)
  } catch (error) {
    console.error('Live event deactivation error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Delete live event (admin only)
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    await prisma.liveEvent.delete({
      where: { id: req.params.id }
    })

    // Broadcast deletion
    if (req.app.get('io')) {
      req.app.get('io').emit('live-event-deleted', { id: req.params.id })
    }
    broadcastContentUpdate('live-event-deleted', { id: req.params.id })

    res.json({ message: 'Live event deleted successfully' })
  } catch (error) {
    console.error('Live event deletion error:', error)
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
