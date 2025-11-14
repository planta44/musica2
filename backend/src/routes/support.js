import express from 'express';
import { authenticateAdmin } from '../middleware/auth.js';
import prisma from '../lib/prisma.js';

const router = express.Router();

// Get support settings (public)
router.get('/', async (req, res) => {
  try {
    const settings = await prisma.supportSettings.findFirst({
      where: { isActive: true }
    });

    if (!settings) {
      return res.json({
        mpesaNumber: null,
        mpesaName: null,
        bankCardNumber: null,
        bankName: null,
        bankAccountName: null,
        paypalEmail: null
      });
    }

    res.json({
      mpesaNumber: settings.mpesaNumber,
      mpesaName: settings.mpesaName,
      bankCardNumber: settings.bankCardNumber,
      bankName: settings.bankName,
      bankAccountName: settings.bankAccountName,
      paypalEmail: settings.paypalEmail
    });
  } catch (error) {
    console.error('Support settings fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get support settings for admin (includes all fields)
router.get('/admin', authenticateAdmin, async (req, res) => {
  try {
    const settings = await prisma.supportSettings.findFirst({
      where: { isActive: true }
    });

    res.json(settings || {
      mpesaNumber: '',
      mpesaName: '',
      bankCardNumber: '',
      bankName: '',
      bankAccountName: '',
      paypalEmail: ''
    });
  } catch (error) {
    console.error('Admin support settings fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update support settings (admin only)
router.post('/admin', authenticateAdmin, async (req, res) => {
  try {
    const {
      mpesaNumber,
      mpesaName,
      bankCardNumber,
      bankName,
      bankAccountName,
      paypalEmail
    } = req.body;

    // First, deactivate any existing settings
    await prisma.supportSettings.updateMany({
      where: { isActive: true },
      data: { isActive: false }
    });

    // Create new settings
    const settings = await prisma.supportSettings.create({
      data: {
        mpesaNumber,
        mpesaName,
        bankCardNumber,
        bankName,
        bankAccountName,
        paypalEmail,
        isActive: true
      }
    });

    res.json(settings);
  } catch (error) {
    console.error('Support settings update error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
