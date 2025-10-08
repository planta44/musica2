# Admin Dashboard Quick Fix Guide

## 🔥 IMMEDIATE FIXES - Do These First

### Step 1: Run Diagnostic Tool
This will tell us exactly what's wrong:

```bash
cd backend
node diagnose-and-fix.js
```

**Read the output carefully!** It will tell you:
- ✅ What's working
- ❌ What's broken
- 💡 Exact commands to fix issues

---

### Step 2: Common Issue - Database Tables Missing

If the diagnostic shows **"Tables missing"**, run:

```bash
cd backend
node node_modules/prisma/build/index.js db push
```

Then:

```bash
node node_modules/prisma/build/index.js generate
```

---

### Step 3: Set Admin Passcode

```bash
cd backend
node src/scripts/setAdminPasscode.js
```

Should output:
```
✅ Admin passcode set successfully to: 2025
📧 Admin email: ruachkol@gmail.com
```

---

### Step 4: Create Uploads Directory

```bash
cd backend
mkdir uploads
```

Or on PowerShell:
```powershell
cd backend
New-Item -ItemType Directory -Path "uploads" -Force
```

---

### Step 5: Restart Backend

Stop the server (Ctrl+C) and restart:

```bash
cd backend
npm run dev
```

**Check console for errors!** Should see:
```
🚀 Server running on port 3001
📍 Environment: development
🔌 WebSocket server ready
```

**NO S3 errors!** (We fixed this earlier)

---

## 🐛 Troubleshooting Specific Issues

### Issue: "Merch fails to save"

**Possible Causes:**
1. Database table doesn't exist
2. Admin not authenticated
3. Invalid data being sent

**Debug Steps:**

1. **Check backend console** when you click Save - look for error messages like:
   ```
   Merch create error: ...
   ```

2. **Check browser console** (F12 → Console tab) - look for:
   ```
   Failed to save
   401 Unauthorized
   500 Internal Server Error
   ```

3. **Test authentication:**
   - Open browser console (F12)
   - Type: `localStorage.getItem('adminToken')`
   - Should return a long token string
   - If null → **You're not logged in!** Go to `/admin` and login again

4. **Check data format:**
   - Merch requires: `name` (string), `price` (number), `stock` (number)
   - Check that price is a NUMBER, not a string
   - Check that all required fields are filled

---

### Issue: "Settings saved but no changes on live site"

**Possible Causes:**
1. Frontend not fetching latest data
2. Cache issue
3. Real-time updates not working

**Debug Steps:**

1. **Hard refresh the live site:**
   - Windows: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`

2. **Check if settings actually saved:**
   - Open: `http://localhost:3001/api/content/settings`
   - Should show current settings in JSON
   - Verify your changes are there

3. **Check real-time connection:**
   - Open browser console on live site
   - Should see WebSocket connection or SSE connection
   - If no connection → refresh page

4. **Verify frontend is fetching settings:**
   - Browser console → Network tab
   - Look for request to `/api/content/settings`
   - Check the response data

---

### Issue: "Videos/Music won't save"

**Same as Merch issue** - follow debug steps above.

**Additional checks for Music:**
- `embedUrl` must be valid Spotify/Apple/SoundCloud URL
- `embedType` must be one of: `spotify`, `apple`, `soundcloud`
- `isPurchasable` must be boolean (true/false)
- `price` must be number if purchasable

**Additional checks for Videos:**
- `videoUrl` must be valid YouTube/Vimeo URL or direct link
- `videoType` must be: `youtube`, `vimeo`, or `upload`

---

### Issue: "Gallery shows placeholder icons instead of photos"

**Possible Causes:**
1. Photo URLs are wrong
2. Uploads directory not accessible
3. Images didn't actually upload

**Debug Steps:**

1. **Check uploaded files exist:**
   ```bash
   cd backend
   dir uploads
   ```
   Should list your uploaded files

2. **Check photo URLs in database:**
   - Open: `http://localhost:3001/api/gallery/albums`
   - Look at photo URLs in response
   - Should be like: `/uploads/1234567890-filename.jpg`

3. **Test direct file access:**
   - Copy a photo URL from step 2
   - Open in browser: `http://localhost:3001/uploads/filename.jpg`
   - If 404 → uploads not being served correctly
   - If shows image → frontend URL mapping issue

4. **Check frontend API base URL:**
   - File: `frontend/.env`
   - Should have: `VITE_API_BASE_URL=http://localhost:3001`
   - If missing, add it and restart frontend

5. **Fix placeholder issue:**
   - In AdminGallery component, photos should use:
     ```javascript
     src={`${API_BASE_URL}${photo.url}`}
     ```
   - Or if photo.url is absolute, just use it directly

---

## 🔍 Advanced Debugging

### Check if backend is actually receiving requests:

Add this temporarily to any route (e.g., in `merch.js`):

```javascript
router.post('/', authenticateAdmin, async (req, res) => {
  console.log('📝 MERCH CREATE REQUEST:', req.body);  // ADD THIS
  try {
    // ... rest of code
```

Then try to save merch - check backend console for the log.

---

### Check database connection:

```bash
cd backend
node -e "import('./node_modules/@prisma/client/index.js').then(p => { const prisma = new p.PrismaClient(); prisma.\$connect().then(() => console.log('✅ DB Connected')).catch(e => console.log('❌ DB Error:', e.message)); })"
```

---

### Check if admin middleware is working:

Open browser console, run:

```javascript
fetch('http://localhost:3001/api/admin/dashboard', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
  }
}).then(r => r.json()).then(console.log)
```

Should return dashboard data. If 401 → token invalid.

---

## ✅ Verification Checklist

After fixes, verify:

### Backend:
- [ ] Server starts without errors
- [ ] No S3 errors in console
- [ ] Uploads directory exists
- [ ] Can access `http://localhost:3001/health` (should return `{"status":"ok"}`)
- [ ] Can access `http://localhost:3001/api/content/settings`

### Admin Login:
- [ ] Can login with email: `ruachkol@gmail.com` and passcode: `2025`
- [ ] `localStorage.adminToken` exists after login
- [ ] Dashboard loads

### Saving Content:
- [ ] Settings → Make change → Save → See success toast
- [ ] Music → Add item → Save → See in list
- [ ] Videos → Add item → Save → See in list
- [ ] Merch → Add item → Save → See in list
- [ ] Gallery → Upload photo → See in grid (not placeholder)

### Live Site Updates:
- [ ] Open live site in another browser tab
- [ ] Make change in admin
- [ ] See change on live site (may need refresh)
- [ ] Settings changes visible immediately

---

## 🆘 Still Not Working?

### Collect Debug Info:

1. **Backend console output** when you try to save
2. **Browser console errors** (F12 → Console)
3. **Network tab** showing the failing request (F12 → Network)
4. **Diagnostic script output** (`node diagnose-and-fix.js`)

### Check These Files:

1. **backend/.env** - Database URL correct? `musician` not `musician_db`?
2. **frontend/.env** - API_BASE_URL set?
3. **backend/uploads/** - Directory exists? Has files?

### Nuclear Option - Fresh Start:

```bash
# Stop all servers
# Then:

cd backend
rm -rf node_modules
npm install
node node_modules/prisma/build/index.js db push
node node_modules/prisma/build/index.js generate
node src/scripts/setAdminPasscode.js
mkdir uploads
npm run dev
```

In another terminal:

```bash
cd frontend
rm -rf node_modules
npm install
npm run dev
```

---

## 📋 Quick Reference

**Backend Commands:**
```bash
cd backend
npm run dev              # Start server
node diagnose-and-fix.js # Diagnose issues
npx prisma db push       # Create database tables
npx prisma generate      # Generate Prisma client
npx prisma studio        # Open database GUI
```

**Frontend Commands:**
```bash
cd frontend
npm run dev              # Start dev server
```

**Test URLs:**
- Backend health: `http://localhost:3001/health`
- Settings API: `http://localhost:3001/api/content/settings`
- Uploaded file: `http://localhost:3001/uploads/filename.jpg`
- Admin login: `http://localhost:5173/admin`
- Live site: `http://localhost:5173/`

---

## 🎯 Most Common Fix

90% of issues are solved by:

```bash
cd backend
node diagnose-and-fix.js
# Read the output
# Follow the commands it suggests
npm run dev
```

Then login to admin again and try saving.

**Good luck!** 🚀
