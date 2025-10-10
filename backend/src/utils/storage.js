import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs/promises';
import path from 'path';

let s3Client = null;
let cloudinaryConfigured = false;

// Configure Cloudinary if credentials are present
function configureCloudinary() {
  if (cloudinaryConfigured) return true;
  
  const hasCloudinaryConfig = 
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET;
  
  if (hasCloudinaryConfig) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });
    cloudinaryConfigured = true;
    return true;
  }
  return false;
}

function getS3Client() {
  // Check if S3 is properly configured (not placeholder values)
  const hasValidCredentials = 
    process.env.S3_ACCESS_KEY_ID && 
    process.env.S3_ACCESS_KEY_ID !== 'your_access_key' &&
    process.env.S3_SECRET_ACCESS_KEY &&
    process.env.S3_SECRET_ACCESS_KEY !== 'your_secret_key' &&
    process.env.S3_BUCKET &&
    process.env.S3_BUCKET !== 'musician-uploads';
  
  if (!s3Client && hasValidCredentials) {
    s3Client = new S3Client({
      endpoint: process.env.S3_ENDPOINT,
      region: process.env.S3_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY
      }
    });
  }
  return s3Client;
}

// Upload to Cloudinary
export async function uploadToCloudinary(filePath, filename) {
  if (!configureCloudinary()) {
    throw new Error('Cloudinary not configured');
  }
  
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'musician-uploads',
      resource_type: 'auto', // auto-detect file type (image/video/audio)
      public_id: `${Date.now()}-${path.parse(filename).name}`,
      overwrite: false
    });
    
    console.log('✅ File uploaded to Cloudinary:', result.secure_url);
    return result.secure_url;
  } catch (error) {
    console.error('❌ Cloudinary upload failed:', error.message);
    throw error;
  }
}

export async function uploadToS3(filePath, filename) {
  const client = getS3Client();
  
  if (!client) {
    throw new Error('S3 client not configured');
  }
  
  const fileContent = await fs.readFile(filePath);
  const key = `uploads/${Date.now()}-${filename}`;
  
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
    Body: fileContent,
    ACL: 'public-read',
    ContentType: getMimeType(filename)
  });
  
  await client.send(command);
  
  // Return public URL
  const publicUrl = process.env.S3_PUBLIC_URL || `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET}`;
  return `${publicUrl}/${key}`;
}

// Generic upload function that tries Cloudinary first, then S3, then local
export async function uploadFile(filePath, filename) {
  // Try Cloudinary first
  if (configureCloudinary()) {
    try {
      return await uploadToCloudinary(filePath, filename);
    } catch (error) {
      console.error('Cloudinary upload failed, trying S3...', error.message);
    }
  }
  
  // Try S3 if Cloudinary failed or not configured
  if (getS3Client()) {
    try {
      return await uploadToS3(filePath, filename);
    } catch (error) {
      console.error('S3 upload failed, using local storage...', error.message);
    }
  }
  
  // Fall back to local storage
  return `/uploads/${filename}`;
}

export async function generateSignedUrl(key, expiresIn = 3600) {
  const client = getS3Client();
  
  if (!client) {
    throw new Error('S3 client not configured');
  }
  
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key
  });
  
  return await getSignedUrl(client, command, { expiresIn });
}

function getMimeType(filename) {
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.mp3': 'audio/mpeg',
    '.mp4': 'video/mp4',
    '.wav': 'audio/wav',
    '.mov': 'video/quicktime',
    '.avi': 'video/x-msvideo'
  };
  
  return mimeTypes[ext] || 'application/octet-stream';
}
