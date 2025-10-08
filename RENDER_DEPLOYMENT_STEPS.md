# 🚀 RENDER DEPLOYMENT - Step by Step

Your GitHub repo: https://github.com/planta44/musica2.git

## Part 1: Create PostgreSQL Database (5 minutes)

### Step 1: Go to Render
1. Visit: https://dashboard.render.com
2. Click **New +** → **PostgreSQL**

### Step 2: Configure Database
```
Name: musician-db
Database: musician
User: (auto-generated)
Region: Oregon (or closest to you)
PostgreSQL Version: 15
Instance Type: Free
```

### Step 3: Create & Copy URL
1. Click **Create Database**
2. Wait 2-3 minutes
3. Scroll to **Connections** section
4. Copy **Internal Database URL** (starts with `postgresql://`)
   Example: `postgresql://musician_db_user:abc123@dpg-xyz.oregon-postgres.render.com/musician_db`
5. **SAVE THIS URL** - you'll need it next!

---

## Part 2: Deploy Backend (10 minutes)

### Step 1: Create Web Service
1. Click **New +** → **Web Service**
2. Click **Connect a repository**
3. Select: `planta44/musica2`
4. Click **Connect**

### Step 2: Configure Service
```
Name: musician-backend
Region: Oregon (same as database!)
Branch: main
Root Directory: backend
Runtime: Node
Build Command: npm install && npx prisma generate && npx prisma migrate deploy
Start Command: npm start
Instance Type: Free
```

### Step 3: Add Environment Variables
Click **Advanced** → **Add Environment Variable**

**REQUIRED VARIABLES:**

```bash
# System
NODE_ENV=production
PORT=10000

# Database (paste your Internal Database URL from Step 1)
DATABASE_URL=postgresql://musician_db_user:abc123@dpg-xyz.oregon-postgres.render.com/musician_db

# JWT (generate random string)
JWT_SECRET=your_generated_secret_here

# CORS (you'll update this after deploying frontend)
FRONTEND_URL=https://your-site.netlify.app

# Admin
ADMIN_EMAIL=ruachkol@gmail.com

# Email (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=ruachkol@gmail.com
SMTP_PASSWORD=your_gmail_app_password_here

# Cloudinary (get from cloudinary.com dashboard)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Stripe (optional - from stripe.com dashboard)
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret
```

### Step 4: Generate JWT Secret
Run this in your local terminal:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Copy the output and use it as `JWT_SECRET`

### Step 5: Get Gmail App Password
1. Go to: https://myaccount.google.com/security
2. Enable **2-Step Verification** (if not already)
3. Search for **App Passwords**
4. Select **Mail** app
5. Copy the 16-character password
6. Use it as `SMTP_PASSWORD` (remove spaces)

### Step 6: Deploy!
1. Click **Create Web Service**
2. Wait 5-10 minutes for deployment
3. Once deployed, copy your backend URL:
   `https://musician-backend-xxxx.onrender.com`

---

## Part 3: Configure Cloudinary (3 minutes)

### Step 1: Get Credentials
1. Go to: https://cloudinary.com/console
2. You should see:
   - **Cloud Name**: (like `dxxxxxxxx`)
   - **API Key**: (like `123456789012345`)
   - **API Secret**: Click "Show" to reveal

### Step 2: Create Upload Preset
1. Click **Settings** (gear icon)
2. Go to **Upload** tab
3. Scroll to **Upload presets**
4. Click **Add upload preset**
5. Configure:
   ```
   Preset name: musician_uploads
   Signing Mode: Unsigned
   Folder: musician
   ```
6. Click **Save**

### Step 3: Update Backend Environment Variables
1. Go back to Render → Your backend service
2. Go to **Environment** tab
3. Add these variables (use values from Step 1):
   ```
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```
4. Click **Save Changes**
5. Service will auto-redeploy

---

## Part 4: Deploy Frontend to Netlify (5 minutes)

### Step 1: Go to Netlify
1. Visit: https://app.netlify.com
2. Click **Add new site** → **Import an existing project**

### Step 2: Connect GitHub
1. Click **GitHub**
2. Authorize Netlify
3. Select: `planta44/musica2`
4. Click **Deploy**

### Step 3: Configure Build
```
Branch: main
Base directory: frontend
Build command: npm run build
Publish directory: frontend/dist
```

### Step 4: Add Environment Variables
Click **Site settings** → **Environment variables** → **Add a variable**

```bash
VITE_API_BASE_URL=https://musician-backend-xxxx.onrender.com
VITE_ADMIN_EMAIL=ruachkol@gmail.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
```

**IMPORTANT**: Replace `musician-backend-xxxx` with YOUR actual backend URL from Part 2!

### Step 5: Deploy!
1. Click **Deploy site**
2. Wait 3-5 minutes
3. Your site will be live at: `https://random-name-12345.netlify.app`
4. Copy this URL!

---

## Part 5: Update Backend CORS (2 minutes)

### Step 1: Update Frontend URL in Render
1. Go to Render → Your backend service
2. Go to **Environment** tab
3. Find `FRONTEND_URL` variable
4. Update value to your Netlify URL: `https://random-name-12345.netlify.app`
5. Click **Save Changes**
6. Backend will auto-redeploy (2-3 minutes)

---

## Part 6: Set Admin Password (3 minutes)

### Option 1: Via Render Shell
1. Go to your backend service in Render
2. Click **Shell** tab (top menu)
3. Wait for shell to open
4. Run:
```bash
cd /opt/render/project/src
node <<EOF
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function main() {
  const hashedPasscode = await bcrypt.hash('2025', 10)
  await prisma.admin.upsert({
    where: { email: 'ruachkol@gmail.com' },
    update: { passcode: hashedPasscode },
    create: { email: 'ruachkol@gmail.com', passcode: hashedPasscode }
  })
  console.log('✅ Admin password set!')
}

main().finally(() => prisma.\$disconnect())
EOF
```

### Option 2: Via Local Script
Create `backend/scripts/setProductionPassword.js`:
```javascript
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPasscode = await bcrypt.hash('2025', 10)
  await prisma.admin.upsert({
    where: { email: 'ruachkol@gmail.com' },
    update: { passcode: hashedPasscode },
    create: { email: 'ruachkol@gmail.com', passcode: hashedPasscode }
  })
  console.log('✅ Admin password set!')
}

main().finally(() => prisma.$disconnect())
```

Run locally with production DATABASE_URL:
```bash
DATABASE_URL="your_production_database_url" node scripts/setProductionPassword.js
```

---

## Part 7: Test Everything! ✅

### Test Backend
1. Visit: `https://musician-backend-xxxx.onrender.com/api/content/settings`
2. Should see JSON response (settings data)

### Test Frontend
1. Visit: `https://random-name-12345.netlify.app`
2. Should see your homepage

### Test Admin Login
1. Visit: `https://random-name-12345.netlify.app/admin`
2. Email: `ruachkol@gmail.com`
3. Password: `2025`
4. Should login successfully

### Test File Upload
1. Login to admin
2. Go to Music section
3. Try uploading a thumbnail
4. Should upload to Cloudinary successfully

---

## 🎉 DEPLOYMENT COMPLETE!

Your site is now live at:
- **Frontend**: `https://random-name-12345.netlify.app`
- **Backend**: `https://musician-backend-xxxx.onrender.com`
- **Database**: Render PostgreSQL

### Important Notes:

**Free Tier Limitations:**
- Backend sleeps after 15 min inactivity (wakes in 30-60 seconds)
- Database expires after 90 days (can be recreated for free)
- 750 hours/month backend uptime (enough for one service)

**Keep Backend Awake:**
Use UptimeRobot (free): https://uptimerobot.com
- Ping: `https://musician-backend-xxxx.onrender.com/api/content/settings`
- Interval: Every 14 minutes

### Your Live URLs:
- **Admin Panel**: `https://your-site.netlify.app/admin`
- **Email**: ruachkol@gmail.com
- **Password**: 2025

---

## Troubleshooting

**Backend shows "Application failed to respond":**
- Check Render logs for errors
- Verify DATABASE_URL is correct (Internal URL, not External)
- Check all required environment variables are set

**Frontend can't connect to backend:**
- Verify VITE_API_BASE_URL points to your backend
- Check FRONTEND_URL is set in backend environment
- Check CORS configuration in backend

**Images not uploading:**
- Verify Cloudinary credentials
- Check upload preset is set to "Unsigned"
- Check Cloudinary API limits

**Database connection errors:**
- Use Internal Database URL, not External
- Check database is running (not suspended)

---

**Need help? Check the Render logs and Netlify deploy logs for specific errors!**
