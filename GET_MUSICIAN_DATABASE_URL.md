# 🔗 Get Your "Musician" Database Connection String

## ⚡ **Quick Steps (1 minute):**

### **Step 1: Go to Neon Dashboard**
```
https://console.neon.tech/
```

### **Step 2: Find Your "Musician" Project**

You'll see a list of projects. Click on: **"Musician"**

### **Step 3: Get Connection String**

On the project page, you'll see:

```
Connection Details
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Connection string:
postgresql://neondb_owner:npg_xxxxxxxxxxxx@ep-xxxxx-xxxxx.eu-west-2.aws.neon.tech/neondb?sslmode=require

[Copy]
```

**Click the [Copy] button!**

### **Step 4: Paste in .env**

1. Open: `backend/.env`
2. Find line 5 (currently says: `DATABASE_URL=PASTE_YOUR_MUSICIAN_DATABASE_CONNECTION_STRING_HERE`)
3. Replace ENTIRE line with:
   ```env
   DATABASE_URL=postgresql://neondb_owner:npg_xxxxxxxxxxxx@ep-xxxxx-xxxxx.eu-west-2.aws.neon.tech/neondb?sslmode=require
   ```
4. **Save file!**

### **Step 5: Restart Backend**

```bash
cd backend
npm run dev
```

**Should see:**
```
✅ Connected to database
🚀 Server running on port 3001
```

---

## 🆘 **If You Don't Have "Musician" Project:**

If you don't see a "Musician" project in Neon, that's okay! You have two options:

### **Option 1: Use Production Database (Temporary)**

For testing only, use your production database:

```env
DATABASE_URL=postgresql://neondb_owner:npg_xMGgaFt08SIb@ep-mute-heart-ab6xnc3q-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require
```

⚠️ **Warning:** Changes in localhost will affect production!

### **Option 2: Create New "Musician-Local" Database**

1. Go to https://neon.tech/
2. Click "Create Project"
3. Name: "Musician-Local"
4. Copy connection string
5. Paste in `.env`

---

## ✅ **That's It!**

Once you paste the correct connection string, localhost will work! 🚀
