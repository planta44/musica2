import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendMagicLink } from '../utils/email.js';
import prisma from '../lib/prisma.js';

const router = express.Router();

// Check if email is admin
router.post('/check-admin', async (req, res) => {
  try {
    const { email } = req.body;
    const isAdmin = email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase();
    
    res.json({ isAdmin });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Request magic link
router.post('/magic-link', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (email.toLowerCase() !== process.env.ADMIN_EMAIL.toLowerCase()) {
      return res.status(403).json({ error: 'Unauthorized email' });
    }
    
    const magicToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    
    await prisma.admin.upsert({
      where: { email: email.toLowerCase() },
      update: { magicToken, tokenExpiry },
      create: { 
        email: email.toLowerCase(),
        magicToken,
        tokenExpiry
      }
    });
    
    await sendMagicLink(email, magicToken);
    
    res.json({ message: 'Magic link sent to your email' });
  } catch (error) {
    console.error('Magic link error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Verify magic link
router.post('/verify-magic', async (req, res) => {
  try {
    const { token } = req.body;
    
    const admin = await prisma.admin.findFirst({
      where: { 
        magicToken: token,
        tokenExpiry: { gte: new Date() }
      }
    });
    
    if (!admin) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    // Clear the magic token
    await prisma.admin.update({
      where: { id: admin.id },
      data: { magicToken: null, tokenExpiry: null }
    });
    
    // Generate JWT
    const jwtToken = jwt.sign(
      { email: admin.email, id: admin.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({ token: jwtToken, email: admin.email });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Passcode login
router.post('/login', async (req, res) => {
  try {
    const { email, passcode } = req.body;
    
    if (email.toLowerCase() !== process.env.ADMIN_EMAIL.toLowerCase()) {
      return res.status(403).json({ error: 'Unauthorized email' });
    }
    
    const admin = await prisma.admin.findUnique({
      where: { email: email.toLowerCase() }
    });
    
    if (!admin || !admin.passcode) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const isValid = await bcrypt.compare(passcode, admin.passcode);
    
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { email: admin.email, id: admin.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({ token, email: admin.email });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Set passcode (admin only)
router.post('/set-passcode', async (req, res) => {
  try {
    const { email, passcode } = req.body;
    
    if (email.toLowerCase() !== process.env.ADMIN_EMAIL.toLowerCase()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const hashedPasscode = await bcrypt.hash(passcode, 10);
    
    await prisma.admin.upsert({
      where: { email: email.toLowerCase() },
      update: { passcode: hashedPasscode },
      create: { 
        email: email.toLowerCase(),
        passcode: hashedPasscode
      }
    });
    
    res.json({ message: 'Passcode set successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
