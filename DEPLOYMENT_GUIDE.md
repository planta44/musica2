# 🚀 FREE DEPLOYMENT GUIDE
## Deploy Your Musician Website to Render + Cloudinary + Netlify

This comprehensive guide will walk you through deploying your project **completely FREE** using:
- **Render** (Backend + PostgreSQL Database)
- **Cloudinary** (Image/Video Storage)
- **Netlify** (Frontend Hosting)

---

## 📋 Prerequisites

Before starting, ensure you have:
- ✅ GitHub account
- ✅ This project pushed to a GitHub repository
- ✅ All code changes committed

---

## Part 1: Setup Cloudinary (Media Storage) ☁️

### Step 1: Create Cloudinary Account
1. Go to https://cloudinary.com
2. Click **Sign Up** → Choose **Free Plan**
3. Fill in your details and verify email
4. You get **25 GB storage + 25 GB bandwidth FREE per month**

### Step 2: Get Your Credentials
1. After login, go to **Dashboard**
2. Copy these values (you'll need them later):
   - **Cloud Name**: `dxxxxxxxx`
   - **API Key**: `123456789012345`
   - **API Secret**: `abcdefghijklmnop1234567890`

### Step 3: Configure Upload Preset
1. Go to **Settings** → **Upload**
2. Scroll to **Upload presets**
3. Click **Add upload preset**
4. Set:
   - **Preset name**: `musician_uploads`
   - **Signing Mode**: `Unsigned`
   - **Folder**: `musician`
5. Click **Save**

---

## Part 2: Setup PostgreSQL Database (Render) 🗄️

### Step 1: Create Database
1. Go to https://render.com
2. Click **Sign Up** → Use GitHub to sign in
3. Click **New +** → **PostgreSQL**
4. Configure:
   - **Name**: `musician-db`
   - **Database**: `musician`
   - **User**: (auto-generated)
   - **Region**: Choose closest to your location
   - **PostgreSQL Version**: `15` (or latest)
   - **Plan**: **Free** (0.1 GB storage, expires after 90 days but can be recreated)
5. Click **Create Database**
6. Wait 2-3 minutes for database to provision

### Step 2: Get Database Connection String
1. Once created, scroll to **Connections**
2. Copy **Internal Database URL** (starts with `postgresql://...`)
   - Example: `postgresql://user:pass@hostname/database`
3. **IMPORTANT**: Save this - you'll need it for backend deployment

---

## Part 3: Deploy Backend to Render 🖥️

### Step 1: Prepare Your Backend Code

**Create `backend/render.yaml`:**
```yaml
services:
  - type: web
    name: musician-backend
    env: node
    region: oregon
    plan: free
    buildCommand: npm install && npx prisma generate && npx prisma migrate deploy
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
```

**Update `backend/package.json` - Add these scripts:**
```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "build": "npx prisma generate"
  }
}
```

**Commit and push changes:**
```bash
git add .
git commit -m "Add Render deployment config"
git push origin main
```

### Step 2: Deploy to Render
1. Go to Render Dashboard
2. Click **New +** → **Web Service**
3. Click **Connect Repository** → Select your GitHub repo
4. Configure:
   - **Name**: `musician-backend`
   - **Region**: Same as database
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npx prisma generate && npx prisma migrate deploy`
   - **Start Command**: `npm start`
   - **Plan**: **Free**

5. Click **Advanced** → **Add Environment Variables**

**Add these environment variables:**

```
NODE_ENV=production
PORT=10000
DATABASE_URL=<YOUR_INTERNAL_DATABASE_URL_FROM_STEP_2>
JWT_SECRET=<GENERATE_RANDOM_STRING_32_CHARS>
FRONTEND_URL=https://your-site-name.netlify.app
ADMIN_EMAIL=ruachkol@gmail.com

# Cloudinary
CLOUDINARY_CLOUD_NAME=<YOUR_CLOUD_NAME>
CLOUDINARY_API_KEY=<YOUR_API_KEY>
CLOUDINARY_API_SECRET=<YOUR_API_SECRET>

# SMTP (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your.email@gmail.com
SMTP_PASSWORD=<YOUR_GMAIL_APP_PASSWORD>

# Stripe (Optional - Get from https://dashboard.stripe.com)
STRIPE_SECRET_KEY=sk_test_your_stripe_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

**How to get Gmail App Password:**
1. Go to Google Account → Security
2. Enable 2-Factor Authentication
3. Search for "App Passwords"
4. Generate password for "Mail"
5. Use that 16-character password (no spaces)

**Generate JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

6. Click **Create Web Service**
7. Wait 5-10 minutes for deployment
8. Once live, copy your backend URL: `https://musician-backend-xxxx.onrender.com`

---

## Part 4: Update Backend to Use Cloudinary 📦

**Update `backend/src/utils/storage.js`:**

```javascript
import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs/promises'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

export const uploadToCloudinary = async (filePath, filename) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'musician',
      public_id: filename,
      resource_type: 'auto' // Handles images, videos, and audio
    })
    
    // Delete local file after upload
    await fs.unlink(filePath).catch(err => console.error('Failed to delete local file:', err))
    
    return result.secure_url
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    throw error
  }
}
```

**Update `backend/package.json` - Add Cloudinary:**
```bash
npm install cloudinary
```

**Update `backend/src/routes/upload.js` - Replace S3 with Cloudinary:**

```javascript
import { uploadToCloudinary } from '../utils/storage.js'

// In upload routes, replace:
// fileUrl = await uploadToS3(req.file.path, req.file.filename)
// With:
fileUrl = await uploadToCloudinary(req.file.path, req.file.filename)
```

Commit and push these changes - Render will auto-deploy.

---

## Part 5: Deploy Frontend to Netlify 🌐

### Step 1: Prepare Frontend

**Create `frontend/netlify.toml`:**
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

**Update `frontend/.env.production` (create if doesn't exist):**
```env
VITE_API_BASE_URL=https://musician-backend-xxxx.onrender.com
VITE_ADMIN_EMAIL=ruachkol@gmail.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
```

**Commit and push:**
```bash
git add .
git commit -m "Add Netlify deployment config"
git push origin main
```

### Step 2: Deploy to Netlify
1. Go to https://netlify.com
2. Click **Sign Up** → Use GitHub
3. Click **Add new site** → **Import an existing project**
4. Choose **GitHub** → Select your repository
5. Configure:
   - **Branch**: `main`
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
6. Click **Advanced** → **New variable**

**Add environment variables:**
```
VITE_API_BASE_URL=https://musician-backend-xxxx.onrender.com
VITE_ADMIN_EMAIL=ruachkol@gmail.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
```

7. Click **Deploy site**
8. Wait 3-5 minutes
9. Your site will be live at: `https://random-name-12345.netlify.app`

### Step 3: Custom Domain (Optional)
1. In Netlify dashboard, go to **Domain settings**
2. Click **Add custom domain**
3. Enter your domain: `yourartistname.com`
4. Follow instructions to:
   - Add DNS records at your domain registrar
   - Enable HTTPS (automatic with Netlify)

---

## Part 6: Update Backend CORS 🔒

**In `backend/src/server.js`, update CORS configuration:**

```javascript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://your-site-name.netlify.app', // Your Netlify URL
    'https://yourartistname.com' // Your custom domain if you have one
  ],
  credentials: true
}))
```

Commit and push - Render will auto-deploy.

---

## Part 7: Database Migration 📊

### Run Migration on Production Database

**Option 1: Use Render Shell**
1. Go to your backend service on Render
2. Click **Shell** tab
3. Run:
```bash
npx prisma migrate deploy
npx prisma db seed # If you have seed data
```

**Option 2: Use Local Connection**
```bash
cd backend
DATABASE_URL="<YOUR_PRODUCTION_DATABASE_URL>" npx prisma migrate deploy
```

---

## Part 8: Set Admin Passcode 🔐

**Connect to your production database and set the passcode:**

**Option 1: Via Render Shell**
```bash
cd backend
node src/scripts/setAdminPasscode.js
```

**Option 2: Via Local Script**
Create `backend/src/scripts/setProductionPassword.js`:

```javascript
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

// Use production database URL
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: '<YOUR_PRODUCTION_DATABASE_URL>'
    }
  }
})

async function main() {
  const email = 'ruachkol@gmail.com'
  const passcode = '2025'
  
  const hashedPasscode = await bcrypt.hash(passcode, 10)
  
  await prisma.admin.upsert({
    where: { email },
    update: { passcode: hashedPasscode },
    create: { email, passcode: hashedPasscode }
  })
  
  console.log('✅ Admin passcode set for production!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

Run:
```bash
node src/scripts/setProductionPassword.js
```

---

## Part 9: Testing & Verification ✅

### Test Your Deployed Site

1. **Frontend**: Visit `https://your-site-name.netlify.app`
2. **Backend**: Visit `https://musician-backend-xxxx.onrender.com/api/content/settings`
3. **Admin Login**:
   - Go to `https://your-site-name.netlify.app/admin`
   - Email: `ruachkol@gmail.com`
   - Passcode: `2025`

### Common Issues & Solutions

**Issue**: Backend shows "Application failed to respond"
- **Solution**: Check Render logs, ensure DATABASE_URL is correct

**Issue**: Frontend can't connect to backend
- **Solution**: Check VITE_API_BASE_URL in Netlify environment variables

**Issue**: Images not uploading
- **Solution**: Verify Cloudinary credentials, check upload preset is unsigned

**Issue**: Database connection errors
- **Solution**: Ensure you're using the Internal Database URL, not External

**Issue**: CORS errors
- **Solution**: Add your Netlify URL to CORS origins in backend

---

## Part 10: Ongoing Maintenance 🛠️

### Free Tier Limitations

**Render Free Tier:**
- ✅ Automatically sleeps after 15 min inactivity
- ✅ Takes 30-60 seconds to wake up
- ✅ 750 hours/month (enough for one service)
- ❌ Database expires after 90 days (but can be recreated)

**Netlify Free Tier:**
- ✅ 100 GB bandwidth/month
- ✅ 300 build minutes/month
- ✅ Automatic HTTPS
- ✅ Unlimited sites

**Cloudinary Free Tier:**
- ✅ 25 GB storage
- ✅ 25 GB bandwidth/month
- ✅ 25,000 transformations/month

### Keeping Your Site Active

**To prevent backend from sleeping:**
1. Use a free uptime monitor: https://uptimerobot.com
2. Ping your backend every 14 minutes: `https://musician-backend-xxxx.onrender.com/api/content/settings`

### Backup Your Database

**Option 1: Render Dashboard**
1. Go to your database
2. Click **Backups** tab
3. Database dumps available for download

**Option 2: Manual Backup**
```bash
pg_dump "<YOUR_EXTERNAL_DATABASE_URL>" > backup.sql
```

**Restore from backup:**
```bash
psql "<YOUR_DATABASE_URL>" < backup.sql
```

---

## Part 11: Upgrade to Paid Plans (Optional) 💎

### When to Upgrade

Consider upgrading when you have:
- **1000+ monthly visitors** → Upgrade Render to $7/month (no sleep)
- **50+ GB media** → Upgrade Cloudinary to $89/month
- **Heavy traffic** → Upgrade Netlify to $19/month

### Costs Comparison

| Service | Free | Paid |
|---------|------|------|
| Render (Backend) | Free (sleeps) | $7/mo (always on) |
| Render (Database) | Free (90 days) | $7/mo (persistent) |
| Cloudinary | 25 GB | $89/mo (100 GB) |
| Netlify | 100 GB bandwidth | $19/mo (1 TB) |

**Total for paid plan**: ~$33/month (still cheaper than most hosting!)

---

## 🎉 Deployment Complete!

Your site is now live and accessible worldwide! 

### Quick Reference URLs

- **Live Site**: `https://your-site-name.netlify.app`
- **Admin Panel**: `https://your-site-name.netlify.app/admin`
- **Backend API**: `https://musician-backend-xxxx.onrender.com`
- **Database**: Render PostgreSQL Dashboard

### Next Steps

1. ✅ Upload your content (music, videos, photos)
2. ✅ Customize colors and branding in Settings
3. ✅ Add your social media links
4. ✅ Set Fan Club pricing
5. ✅ Share your site with the world!

---

## 📞 Support & Resources

- **Render Docs**: https://render.com/docs
- **Netlify Docs**: https://docs.netlify.com
- **Cloudinary Docs**: https://cloudinary.com/documentation
- **Prisma Docs**: https://www.prisma.io/docs

---

**Congratulations! Your musician website is now deployed and ready to rock! 🎸🎵**
