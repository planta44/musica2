import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { authenticateAdmin } from '../middleware/auth.js';
import { uploadFile } from '../utils/storage.js';
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
    let storageWarning = null;
    
    try {
      // Try to upload using the generic upload function (tries Cloudinary, then S3, then local)
      fileUrl = await uploadFile(req.file.path, req.file.filename);
      
      // Delete local file after successful cloud upload
      if (fileUrl.startsWith('http')) {
        await fs.unlink(req.file.path).catch(err => console.error('Failed to delete local file:', err));
      } else {
        // File is stored locally
        const isRenderEnv = process.env.RENDER || process.env.RENDER_SERVICE_NAME;
        if (isRenderEnv) {
          console.warn('⚠️ WARNING: File stored locally on Render - will be lost on restart! Configure Cloudinary or S3.');
          storageWarning = 'WARNING: File stored locally on Render. Configure Cloudinary or S3 to persist uploads after restart.';
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      fileUrl = `/uploads/${req.file.filename}`;
      storageWarning = `Upload failed: ${error.message}. File stored locally.`;
    }
    
    res.json({
      url: fileUrl,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
      warning: storageWarning
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
    
    const isRenderEnv = process.env.RENDER || process.env.RENDER_SERVICE_NAME;
    let hasLocalStorage = false;
    
    const uploadPromises = req.files.map(async (file) => {
      let fileUrl;
      
      try {
        fileUrl = await uploadFile(file.path, file.filename);
        
        // Delete local file after successful cloud upload
        if (fileUrl.startsWith('http')) {
          await fs.unlink(file.path).catch(err => console.error('Failed to delete local file:', err));
        } else {
          hasLocalStorage = true;
        }
      } catch (error) {
        console.error('Upload error for', file.filename, ':', error.message);
        fileUrl = `/uploads/${file.filename}`;
        hasLocalStorage = true;
      }
      
      return {
        url: fileUrl,
        filename: file.filename,
        size: file.size,
        mimetype: file.mimetype
      };
    });
    
    const uploads = await Promise.all(uploadPromises);
    
    const response = { files: uploads };
    
    if (hasLocalStorage && isRenderEnv) {
      console.warn('⚠️ WARNING: Files stored locally on Render - will be lost on restart! Configure Cloudinary or S3.');
      response.warning = 'WARNING: Files stored locally on Render. Configure Cloudinary or S3 to persist uploads after restart.';
    }
    
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
