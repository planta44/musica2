# Media Persistence on Render - S3 Configuration Guide

## The Problem

**Render uses ephemeral storage** - any files uploaded to the local `/uploads/` directory will be **lost when your service restarts or redeploys**. This is why your photos disappear after refreshing Render.

## The Solution: Configure AWS S3 Storage

To persist media files (photos, videos, audio), you need to configure **AWS S3** or an S3-compatible storage service.

### Option 1: AWS S3 (Recommended)

1. **Create an AWS Account**: Go to [aws.amazon.com](https://aws.amazon.com)

2. **Create an S3 Bucket**:
   - Go to S3 in AWS Console
   - Click "Create bucket"
   - Choose a unique name (e.g., `your-artist-name-media`)
   - Select a region close to your users
   - **Uncheck "Block all public access"** (your media needs to be publicly accessible)
   - Click "Create bucket"

3. **Configure Bucket for Public Access**:
   - Go to your bucket → Permissions tab
   - Under "Bucket policy", add this policy (replace `YOUR-BUCKET-NAME`):
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
       }
     ]
   }
   ```

4. **Create IAM User for Backend**:
   - Go to IAM in AWS Console
   - Click "Users" → "Add user"
   - User name: `musician-backend`
   - Select "Access key - Programmatic access"
   - Attach policy: `AmazonS3FullAccess`
   - **Save the Access Key ID and Secret Access Key** (you'll need these!)

5. **Configure Render Environment Variables**:
   - Go to your Render dashboard
   - Select your backend service
   - Go to "Environment" tab
   - Add/update these variables:
   ```
   S3_ENDPOINT=https://s3.amazonaws.com
   S3_REGION=us-east-1  (or your bucket's region)
   S3_BUCKET=your-bucket-name
   S3_ACCESS_KEY_ID=your-access-key-id
   S3_SECRET_ACCESS_KEY=your-secret-access-key
   S3_PUBLIC_URL=https://your-bucket-name.s3.amazonaws.com
   ```

6. **Redeploy** your Render service for changes to take effect

### Option 2: Cloudflare R2 (Free 10GB/month)

1. Sign up at [cloudflare.com](https://cloudflare.com)
2. Go to R2 → Create bucket
3. Get R2 credentials
4. Configure Render environment variables:
   ```
   S3_ENDPOINT=https://[account-id].r2.cloudflarestorage.com
   S3_REGION=auto
   S3_BUCKET=your-bucket-name
   S3_ACCESS_KEY_ID=your-r2-access-key
   S3_SECRET_ACCESS_KEY=your-r2-secret-key
   S3_PUBLIC_URL=https://your-custom-domain.com (or R2 public URL)
   ```

### Option 3: DigitalOcean Spaces

1. Sign up at [digitalocean.com](https://digitalocean.com)
2. Create a Space (similar to S3)
3. Get Spaces access keys
4. Configure environment variables similar to S3

## Testing the Configuration

1. After configuring S3, upload a new photo in Admin panel
2. Check your backend logs - you should see: `✅ File uploaded to S3: https://...`
3. The URL should start with your S3 bucket URL, not `/uploads/`
4. Restart Render service - photos should remain

## Migration: Moving Existing Local Files to S3

If you already have photos stored locally (before S3 was configured), you need to:

1. Download them from Render (if still available)
2. Manually upload to S3
3. Update the database URLs from `/uploads/filename` to full S3 URLs

Or simply re-upload them through the admin panel after S3 is configured.

## Verification

When S3 is properly configured:
- ✅ Upload warnings will disappear
- ✅ Photo URLs will be full HTTPS URLs (not `/uploads/...`)
- ✅ Photos persist across Render restarts
- ✅ Backend logs show "File uploaded to S3"

When S3 is NOT configured:
- ⚠️ You'll see warning toasts when uploading
- ⚠️ Backend logs show "WARNING: File stored locally on Render"
- ❌ Photos disappear after Render restart
