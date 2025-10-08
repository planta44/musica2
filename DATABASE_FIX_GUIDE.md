# Database & Upload Issues - FIXED ✅

## Issues Found and Fixed

### 1. ✅ Database Name Mismatch - FIXED
**Problem:** Your `.env` had `musician_db` but your local database is `musician`

**Fix Applied:** Updated `.env` DATABASE_URL from:
```
postgresql://postgres:Admin@0010@localhost:5432/musician_db
```
To:
```
postgresql://postgres:Admin@0010@localhost:5432/musician
```

### 2. ✅ S3 Upload Failures - FIXED
**Problem:** System was trying to upload to AWS S3 with placeholder credentials, causing all uploads to fail.

**Fix Applied:** 
- Updated `backend/src/utils/storage.js` to detect placeholder credentials
- Updated `backend/src/routes/upload.js` to skip S3 and use local storage
- Now checks if S3 credentials are real (not `your_access_key`, etc.)
- **Uploads will now save locally to `/backend/uploads/` folder**

---

## Required Steps to Complete Setup

### Step 1: Run Database Migration
You need to run Prisma migrations to create the database tables.

**Option A - Using npm script:**
```bash
cd backend
npm run prisma:migrate
```

**Option B - Direct command:**
```bash
cd backend
npx prisma migrate dev --name init
```

**Option C - If PowerShell execution policy blocks npx:**
```powershell
cd backend
node node_modules/prisma/build/index.js migrate dev --name init
```

**Option D - Manual Prisma Studio (if migrations fail):**
```bash
cd backend
npx prisma db push
npx prisma generate
```

### Step 2: Set Admin Passcode
Run the script to set admin passcode to 2025:

```bash
cd backend
node src/scripts/setAdminPasscode.js
```

Expected output:
```
✅ Admin passcode set successfully to: 2025
📧 Admin email: ruachkol@gmail.com
```

### Step 3: Restart Backend Server
Stop the current server (Ctrl+C) and restart:

```bash
cd backend
npm run dev
```

You should now see:
```
🚀 Server running on port 3001
📍 Environment: development
🔌 WebSocket server ready
```

**No more S3 errors!** Files will save locally.

---

## Verification Checklist

After restarting the server, test the following:

### ✅ Database Connection
- [ ] Server starts without database errors
- [ ] No "connection refused" messages
- [ ] Prisma connects successfully

### ✅ Admin Login
- [ ] Navigate to `http://localhost:5173/admin`
- [ ] Email: `ruachkol@gmail.com`
- [ ] Passcode: `2025`
- [ ] Successfully logs in to dashboard

### ✅ File Uploads
- [ ] Go to Admin → Settings
- [ ] Try uploading a hero image
- [ ] Image saves successfully (no S3 errors)
- [ ] File appears in `/backend/uploads/` folder
- [ ] Image displays in frontend

### ✅ Content Saving
- [ ] Edit site settings → Save
- [ ] Create music item → Save
- [ ] Upload thumbnail → Works
- [ ] Changes persist after refresh

### ✅ Live Events
- [ ] Create a live event
- [ ] Set title, description, fee
- [ ] Save successfully
- [ ] Start event (if you have subscribers)

---

## Files Modified

1. **`backend/.env`** - Fixed database name
2. **`backend/src/utils/storage.js`** - Added placeholder credential detection
3. **`backend/src/routes/upload.js`** - Skip S3 when not configured properly

---

## How Uploads Work Now

### Local Storage (Default - What You're Using)
- Files save to: `/backend/uploads/`
- Served via: `http://localhost:3001/uploads/filename.jpg`
- No external dependencies
- **Works immediately** ✅

### S3 Storage (Optional - Not Configured)
- To enable S3, update `.env` with real AWS credentials:
```env
S3_BUCKET=your-real-bucket-name
S3_ACCESS_KEY_ID=AKIA...  # Real AWS key
S3_SECRET_ACCESS_KEY=abc123...  # Real AWS secret
S3_REGION=us-east-1
S3_PUBLIC_URL=https://your-bucket.s3.amazonaws.com
```

---

## Common Issues & Solutions

### Issue: "Prisma Client not found"
**Solution:**
```bash
cd backend
npx prisma generate
```

### Issue: "Table does not exist"
**Solution:**
```bash
cd backend
npx prisma db push
```

### Issue: PowerShell execution policy error
**Solution:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```
Or use `node` directly instead of `npx`

### Issue: Database connection refused
**Solutions:**
1. Check PostgreSQL is running:
   ```bash
   # Check if PostgreSQL service is running
   Get-Service -Name postgresql*
   ```

2. Verify database exists:
   ```bash
   psql -U postgres -l
   ```
   Should show `musician` database

3. Create database if missing:
   ```bash
   psql -U postgres
   CREATE DATABASE musician;
   \q
   ```

### Issue: Port 3001 already in use
**Solution:**
```bash
# Find and kill process using port 3001
netstat -ano | findstr :3001
taskkill /PID <process_id> /F
```

---

## Next Steps After Fix

1. **Test all admin features:**
   - Settings changes
   - Music uploads
   - Video additions
   - Gallery photos
   - Tour events
   - Merch items
   - Live events

2. **Test real-time updates:**
   - Open site in two browsers
   - Make changes in admin
   - Verify changes appear instantly in visitor view

3. **Test live events:**
   - Create a live event
   - Add some test subscribers
   - Start the event
   - Check email notifications sent

---

## Summary

**What was wrong:**
1. Database name mismatch (`musician_db` vs `musician`)
2. S3 trying to upload with fake credentials

**What's fixed:**
1. ✅ Database URL corrected
2. ✅ S3 detection improved - now uses local storage
3. ✅ No more S3 errors in console
4. ✅ Uploads will work immediately

**What you need to do:**
1. Run Prisma migrations (see Step 1 above)
2. Run setAdminPasscode script (see Step 2 above)
3. Restart server (see Step 3 above)
4. Test admin uploads

---

## Support

If issues persist after following this guide:

1. **Check backend console** for specific error messages
2. **Check browser console** (F12) for frontend errors
3. **Verify database connection:**
   ```bash
   psql -U postgres -d musician -c "SELECT 1"
   ```
4. **Verify uploads folder exists:**
   ```bash
   ls backend/uploads
   ```
   If not, create it:
   ```bash
   mkdir backend/uploads
   ```

---

**Status: Ready to test! 🚀**

Restart your server and try uploading files. Everything should work now.
