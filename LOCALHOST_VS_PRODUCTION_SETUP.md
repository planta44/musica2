# 🔧 Localhost vs Production - Complete Setup

## ✅ **FIXED: Separate Databases**

Your localhost and production now use **completely separate databases**:

- **Localhost:** Uses separate Neon database (you need to create it)
- **Production (Render):** Uses existing Neon database

**They will NEVER affect each other!** ✅

---

## 🚀 **Setup Localhost Database (2 minutes)**

### **Step 1: Create Second Neon Database**

1. **Go to:** https://neon.tech/
2. **Login** to your Neon account
3. **Click:** "Create Project" (top right)
4. **Fill in:**
   ```
   Project Name: musician-local
   Region: Same as production (EU West 2)
   PostgreSQL version: 16
   ```
5. **Click:** "Create Project"

### **Step 2: Get Connection String**

After creation, you'll see:
```
Connection Details
postgresql://neondb_owner:xxxxx@ep-xxxxx.eu-west-2.aws.neon.tech/neondb?sslmode=require
```

**Copy this entire string!**

### **Step 3: Update Local .env**

1. **Open:** `backend/.env`
2. **Find line 7:**
   ```env
   DATABASE_URL=CREATE_SECOND_NEON_DATABASE_FOR_LOCAL
   ```
3. **Replace with your new connection string:**
   ```env
   DATABASE_URL=postgresql://neondb_owner:xxxxx@ep-xxxxx.eu-west-2.aws.neon.tech/neondb?sslmode=require
   ```
4. **Save!**

### **Step 4: Initialize Local Database**

```bash
cd backend

# Push schema to your new local database
npx prisma db push

# You should see:
# ✔ Database schema created
```

### **Step 5: Test Localhost**

```bash
npm run dev
```

**Go to:** http://localhost:5173/admin
**Login with:** `2025`

**Should work!** ✅

---

## 📊 **How It Works:**

### **Localhost (Development):**
```
backend/.env → DATABASE_URL → Your LOCAL Neon database
```

### **Production (Render):**
```
Render Environment Variables → DATABASE_URL → Your PRODUCTION Neon database
```

**They're completely separate!** 🎉

---

## ✅ **What's Been Fixed:**

### **1. Separate Databases**
- Localhost uses its own Neon database
- Production uses different Neon database
- Changes in localhost DON'T affect production
- Changes in production DON'T affect localhost

### **2. Background Image Now Shows**
- **Problem:** Image was behind black overlay
- **Fixed:** Separated image layer from overlay layer
- **Result:** Image shows behind effects with adjustable opacity

**Z-Index Layers (back to front):**
1. **z-0:** Background images/videos
2. **z-5:** Black overlay (adjustable opacity)
3. **z-10:** Particle effects
4. **z-20:** Text content

---

## 🎨 **Background Image Settings:**

### **In Admin → Settings:**

**Hero Type:** Choose what to display
- **Image:** Static background image
- **Video:** Background video
- **Both:** Image on desktop, video on mobile

**Hero Opacity:** Control overlay darkness
- **0.0** = Image fully visible (no overlay)
- **0.3** = Light overlay (recommended)
- **0.5** = Medium overlay
- **1.0** = Completely dark

**For best results:** Use 0.2 to 0.4 so background is visible but text is readable.

---

## 🧪 **Testing:**

### **Test Localhost:**
1. Upload a background image in localhost admin
2. Set Hero Opacity to 0.3
3. Save and refresh homepage
4. **Background should show behind effects!** ✅

### **Test Production:**
1. Go to live site admin
2. Upload different image
3. **Production image is different from localhost!** ✅

---

## 🆘 **Troubleshooting:**

### **"Can't connect to database" (localhost):**
- Check you created second Neon database
- Verify connection string in `backend/.env` is correct
- Run `npx prisma db push` to initialize database

### **Background image not showing:**
1. Check Hero Type is set correctly (Image, Video, or Both)
2. Verify image uploaded successfully (check Cloudinary)
3. Set Hero Opacity to 0.3 (not 1.0)
4. Clear browser cache and refresh

### **Upload still failing:**
- You need Cloudinary credentials (see `FIX_UPLOAD_ISSUES.md`)
- Get credentials from https://cloudinary.com/console
- Add to both `backend/.env` AND Render environment variables

---

## 📋 **Quick Checklist:**

**Localhost Setup:**
- [ ] Create second Neon database ("musician-local")
- [ ] Copy connection string
- [ ] Update `backend/.env` line 7
- [ ] Run `npx prisma db push`
- [ ] Test login at localhost

**Background Image:**
- [ ] Add Cloudinary credentials (see `FIX_UPLOAD_ISSUES.md`)
- [ ] Upload background image in admin
- [ ] Set Hero Type (Image/Video/Both)
- [ ] Set Hero Opacity (0.2-0.4 recommended)
- [ ] Save and test

---

## 🎉 **Summary:**

**Databases:** ✅ Separated (localhost vs production)
**Background:** ✅ Fixed (shows behind effects with opacity control)
**Settings:** ✅ Working (Particles, Parallax, Auto-open)

**Create your second Neon database and you're done!** 🚀

---

## 💡 **Benefits:**

**Separate Databases:**
- ✅ Safe testing without affecting live site
- ✅ Different content for development
- ✅ No accidental data deletion
- ✅ Both databases are FREE on Neon

**Fixed Background:**
- ✅ Images show properly
- ✅ Adjustable overlay opacity
- ✅ Looks professional
- ✅ Works on desktop and mobile

**Total setup time:** 5 minutes! ⚡
