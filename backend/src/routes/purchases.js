import express from 'express';
import prisma from '../lib/prisma.js';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

const router = express.Router();

// Generate a unique access token
function generateAccessToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Create a new purchase (initiated by PayPal)
router.post('/create', async (req, res) => {
  try {
    const { contentType, contentId, customerEmail, customerName, amount, paymentId, paymentMethod = 'paypal' } = req.body;

    if (!contentType || !contentId || !customerEmail || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify content exists and get price
    let content;
    if (contentType === 'music') {
      content = await prisma.musicItem.findUnique({ where: { id: contentId } });
    } else if (contentType === 'video') {
      content = await prisma.video.findUnique({ where: { id: contentId } });
    } else {
      return res.status(400).json({ error: 'Invalid content type' });
    }

    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    if (!content.isPurchasable) {
      return res.status(400).json({ error: 'Content is not purchasable' });
    }

    // Verify price matches
    if (Math.abs(content.price - amount) > 0.01) {
      return res.status(400).json({ error: 'Price mismatch' });
    }

    // Check if already purchased by this email
    const existingPurchase = await prisma.purchase.findFirst({
      where: {
        contentType,
        ...(contentType === 'music' ? { musicItemId: contentId } : { videoId: contentId }),
        customerEmail,
        paymentStatus: 'completed'
      }
    });

    if (existingPurchase) {
      return res.json({
        success: true,
        purchase: existingPurchase,
        message: 'Already purchased'
      });
    }

    // Create purchase record
    const accessToken = generateAccessToken();
    const purchase = await prisma.purchase.create({
      data: {
        contentType,
        ...(contentType === 'music' ? { musicItemId: contentId } : { videoId: contentId }),
        customerEmail,
        customerName: customerName || null,
        amount,
        paymentMethod,
        paymentId: paymentId || null,
        paymentStatus: 'completed',
        accessToken,
        expiresAt: null // Lifetime access
      },
      include: {
        musicItem: true,
        video: true
      }
    });

    res.json({
      success: true,
      purchase,
      accessToken
    });
  } catch (error) {
    console.error('Create purchase error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Verify purchase access
router.get('/verify/:accessToken', async (req, res) => {
  try {
    const { accessToken } = req.params;

    const purchase = await prisma.purchase.findUnique({
      where: { accessToken },
      include: {
        musicItem: true,
        video: true
      }
    });

    if (!purchase) {
      return res.status(404).json({ error: 'Purchase not found' });
    }

    if (purchase.paymentStatus !== 'completed') {
      return res.status(403).json({ error: 'Purchase not completed' });
    }

    // Check expiration (if set)
    if (purchase.expiresAt && new Date(purchase.expiresAt) < new Date()) {
      return res.status(403).json({ error: 'Access expired' });
    }

    res.json({
      success: true,
      purchase,
      content: purchase.contentType === 'music' ? purchase.musicItem : purchase.video
    });
  } catch (error) {
    console.error('Verify purchase error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Check if user has purchased content
router.get('/check', async (req, res) => {
  try {
    const { contentType, contentId, email } = req.query;

    if (!contentType || !contentId || !email) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const purchase = await prisma.purchase.findFirst({
      where: {
        contentType,
        ...(contentType === 'music' ? { musicItemId: contentId } : { videoId: contentId }),
        customerEmail: email,
        paymentStatus: 'completed'
      }
    });

    if (!purchase) {
      return res.json({ purchased: false });
    }

    // Check expiration
    if (purchase.expiresAt && new Date(purchase.expiresAt) < new Date()) {
      return res.json({ purchased: false, expired: true });
    }

    res.json({
      purchased: true,
      accessToken: purchase.accessToken,
      purchaseDate: purchase.createdAt
    });
  } catch (error) {
    console.error('Check purchase error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user's purchases
router.get('/my-purchases', async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: 'Email required' });
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
    });

    res.json({ purchases });
  } catch (error) {
    console.error('Get purchases error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
