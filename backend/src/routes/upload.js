import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { authenticateAdmin } from '../middleware/auth.js';
import { uploadToS3 } from '../utils/storage.js';
import fs from 'fs/promises';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for local storage (temporary)
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error, null);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB for mp3/mp4 files
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|mp3|mp4|wav|mov|avi|m4a|aac|ogg|webm/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    
    // Check mimetype more flexibly for audio/video
    const isImage = file.mimetype.startsWith('image/');
    const isVideo = file.mimetype.startsWith('video/');
    const isAudio = file.mimetype.startsWith('audio/');
    
    if ((isImage || isVideo || isAudio) && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed: images, audio, video'));
    }
  }
});

// Upload single file (admin only)
router.post('/single', authenticateAdmin, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    let fileUrl;
    
    // Check if S3 is properly configured (not placeholder values)
    const hasValidS3Config = 
      process.env.S3_BUCKET && 
      process.env.S3_BUCKET !== 'musician-uploads' &&
      process.env.S3_ACCESS_KEY_ID && 
      process.env.S3_ACCESS_KEY_ID !== 'your_access_key';
    
    // Try to upload to S3 if configured
    if (hasValidS3Config) {
      try {
        fileUrl = await uploadToS3(req.file.path, req.file.filename);
        // Delete local file after successful upload
        await fs.unlink(req.file.path).catch(err => console.error('Failed to delete local file:', err));
      } catch (s3Error) {
        console.error('S3 upload failed, using local file:', s3Error.message);
        fileUrl = `/uploads/${req.file.filename}`;
      }
    } else {
      // Use local file URL (S3 not configured)
      fileUrl = `/uploads/${req.file.filename}`;
    }
    
    res.json({
      url: fileUrl,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload multiple files (admin only)
router.post('/multiple', authenticateAdmin, upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }
    
    // Check if S3 is properly configured
    const hasValidS3Config = 
      process.env.S3_BUCKET && 
      process.env.S3_BUCKET !== 'musician-uploads' &&
      process.env.S3_ACCESS_KEY_ID && 
      process.env.S3_ACCESS_KEY_ID !== 'your_access_key';
    
    const uploadPromises = req.files.map(async (file) => {
      let fileUrl;
      
      if (hasValidS3Config) {
        try {
          fileUrl = await uploadToS3(file.path, file.filename);
          await fs.unlink(file.path).catch(err => console.error('Failed to delete local file:', err));
        } catch (s3Error) {
          console.error('S3 upload failed for', file.filename, ':', s3Error.message);
          fileUrl = `/uploads/${file.filename}`;
        }
      } else {
        fileUrl = `/uploads/${file.filename}`;
      }
      
      return {
        url: fileUrl,
        filename: file.filename,
        size: file.size,
        mimetype: file.mimetype
      };
    });
    
    const uploads = await Promise.all(uploadPromises);
    
    res.json({ files: uploads });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
