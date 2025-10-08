import express from 'express';
import { authenticateAdmin } from '../middleware/auth.js';
import { sendContactNotification } from '../utils/email.js';
import prisma from '../lib/prisma.js';

const router = express.Router();

// Submit contact form
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message, type } = req.body;
    const submission = await prisma.contactSubmission.create({
      data: {
        name,
        email,
        subject,
        message,
        type: type || 'general'
      }
    });
    
    // Send notification to admin
    await sendContactNotification({
      name,
      email,
      subject,
      message,
      type
    }).catch(err => console.error('Email notification error:', err));
    
    res.json({ message: 'Message sent successfully!', submission });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all contact submissions (admin only)
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const submissions = await prisma.contactSubmission.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete contact submission (admin only)
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    await prisma.contactSubmission.delete({
      where: { id: req.params.id }
    });
    
    res.json({ message: 'Submission deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
