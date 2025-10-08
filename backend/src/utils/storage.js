import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import fs from 'fs/promises';
import path from 'path';

let s3Client = null;

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
