import express from 'express'
import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

const router = express.Router()
const prisma = new PrismaClient()

// Create purchase
router.post('/create', async (req, res) => {
  try {
    const {
      contentType,
      contentId,
      customerEmail,
      customerName,
      amount,
      paymentMethod = 'paypal',
      paymentId,
      paymentStatus = 'completed'
    } = req.body

    // Generate unique access token
    const accessToken = crypto.randomBytes(32).toString('hex')

    // Determine which ID field to use
    const purchaseData = {
      contentType,
      customerEmail,
      customerName,
      amount: parseFloat(amount),
      paymentMethod,
      paymentId,
      paymentStatus,
      accessToken,
      expiresAt: null // Lifetime access
    }

    if (contentType === 'music') {
      purchaseData.musicItemId = contentId
    } else if (contentType === 'video') {
      purchaseData.videoId = contentId
    }

    const purchase = await prisma.purchase.create({
      data: purchaseData,
      include: {
        musicItem: contentType === 'music',
        video: contentType === 'video'
      }
    })

    res.json(purchase)
  } catch (error) {
    console.error('Create purchase error:', error)
    res.status(500).json({ error: 'Failed to create purchase' })
  }
})

// Verify purchase by access token
router.get('/verify/:accessToken', async (req, res) => {
  try {
    const { accessToken } = req.params

    const purchase = await prisma.purchase.findUnique({
      where: { accessToken },
      include: {
        musicItem: true,
        video: true
      }
    })

    if (!purchase) {
      return res.status(404).json({ error: 'Purchase not found' })
    }

    // Check if expired
    if (purchase.expiresAt && new Date(purchase.expiresAt) < new Date()) {
      return res.status(403).json({ error: 'Access expired' })
    }

    res.json({
      valid: true,
      purchase
    })
  } catch (error) {
    console.error('Verify purchase error:', error)
    res.status(500).json({ error: 'Failed to verify purchase' })
  }
})

// Check if user has purchased content
router.get('/check', async (req, res) => {
  try {
    const { contentType, contentId, email } = req.query

    if (!contentType || !contentId || !email) {
      return res.status(400).json({ error: 'Missing required parameters' })
    }

    const whereClause = {
      customerEmail: email,
      contentType,
      paymentStatus: 'completed'
    }

    if (contentType === 'music') {
      whereClause.musicItemId = contentId
    } else if (contentType === 'video') {
      whereClause.videoId = contentId
    }

    const purchase = await prisma.purchase.findFirst({
      where: whereClause
    })

    res.json({
      purchased: !!purchase,
      purchase: purchase || null
    })
  } catch (error) {
    console.error('Check purchase error:', error)
    res.status(500).json({ error: 'Failed to check purchase' })
  }
})

// Get user's purchases
router.get('/my-purchases', async (req, res) => {
  try {
    const { email } = req.query

    if (!email) {
      return res.status(400).json({ error: 'Email required' })
    }

    const purchases = await prisma.purchase.findMany({
      where: {
        customerEmail: email,
        paymentStatus: 'completed'
      },
      include: {
        musicItem: true,
        video: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    res.json(purchases)
  } catch (error) {
    console.error('Get purchases error:', error)
    res.status(500).json({ error: 'Failed to get purchases' })
  }
})

export default router
