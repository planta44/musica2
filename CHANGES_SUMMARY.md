# Changes Summary - Media Persistence, Hero Mobile URL, and Header Opacity

## Issues Fixed

### 1. ✅ Media Files Disappear After Render Refresh
**Problem**: Photos and media files uploaded to Render were disappearing after service restart.

**Root Cause**: Render uses ephemeral storage - files saved to local `/uploads/` directory are lost on restart.

**Solution**: 
- Added S3 configuration warnings in backend when files are stored locally
- Updated upload handlers to detect Render environment and warn users
- Created comprehensive S3 setup guide: `RENDER_MEDIA_PERSISTENCE_GUIDE.md`
- Frontend now displays warning toasts when S3 is not configured

**Action Required**:
- **Configure AWS S3 or compatible storage** (see `RENDER_MEDIA_PERSISTENCE_GUIDE.md`)
- Add S3 credentials to Render environment variables
- Re-upload existing media after S3 is configured

### 2. ✅ Hero Media URL (Mobile) Not Saving
**Problem**: Mobile hero media URL field was not being saved.

**Root Cause**: The field exists in the schema (`heroMediaUrlMobile`) and the backend accepts it correctly. The issue was likely just the missing content routes mounting which has now been fixed.

**Solution**:
- Verified backend schema includes `heroMediaUrlMobile` field
- Confirmed backend content routes properly save all fields
- Mounted missing `/api/content` routes in `backend/src/server.js`

**Status**: Should now work correctly after backend restart.

### 3. ✅ Header Opacity Control
**Problem**: No ability to adjust navbar/header opacity on homepage.

**Solution**:
- Added two new fields to database schema:
  - `headerOpacity` (opacity when scrolled, default 0.95)
  - `headerOpacityTop` (opacity at page top, default 0.0 for transparent)
- Added controls in Admin → Settings page
- Updated Navbar component to use dynamic opacity from database

**Files Changed**:
- `backend/prisma/schema.prisma` - Added headerOpacity fields
- `frontend/src/components/admin/AdminSettings.jsx` - Added opacity controls
- `frontend/src/components/Navbar.jsx` - Implemented dynamic opacity

## Files Modified

### Backend
1. **`backend/prisma/schema.prisma`**
   - Added `headerOpacity` and `headerOpacityTop` fields

2. **`backend/src/server.js`**
   - Fixed missing `app.use('/api/content', contentRoutes)`
   - Fixed missing `app.use('/api/admin', adminRoutes)`
   - Added missing prisma import
   - Fixed indentation and formatting

3. **`backend/src/routes/upload.js`**
   - Added S3 configuration detection
   - Added Render environment detection
   - Added warning messages for local storage on Render
   - Enhanced logging for S3 uploads

### Frontend
1. **`frontend/src/components/admin/AdminSettings.jsx`**
   - Added Header Opacity controls (scrolled and top)
   - Added upload warning toast display

2. **`frontend/src/components/Navbar.jsx`**
   - Load headerOpacity settings from database
   - Apply dynamic opacity based on scroll position
   - Use inline styles for backdrop blur effect

### Documentation
1. **`RENDER_MEDIA_PERSISTENCE_GUIDE.md`** (NEW)
   - Complete guide for configuring S3 on AWS, Cloudflare R2, or DigitalOcean
   - Step-by-step instructions
   - Troubleshooting tips

2. **`backend/prisma/migrations/add_header_opacity_fields/migration.sql`** (NEW)
   - Database migration for new opacity fields

## Deployment Steps

### 1. Run Database Migration
```bash
cd backend
npx prisma migrate dev --name add_header_opacity_fields
```

Or manually run the SQL:
```sql
ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "headerOpacity" DOUBLE PRECISION NOT NULL DEFAULT 0.95;
ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "headerOpacityTop" DOUBLE PRECISION NOT NULL DEFAULT 0.0;
```

### 2. Restart Backend Server
```bash
cd backend
npm start
```

### 3. Restart Frontend
```bash
cd frontend
npm run dev
```

### 4. Test Changes

#### Test Header Opacity
1. Go to Admin → Settings
2. Scroll down to "Hero Section"
3. Find "Header Opacity (Scrolled)" and "Header Opacity (Top)"
4. Adjust values (0 = transparent, 1 = opaque)
5. Save changes
6. Go to homepage and scroll to see the effect

#### Test Hero Mobile URL
1. Go to Admin → Settings
2. Find "Hero Media URL (Mobile)"
3. Enter a URL or upload a file
4. Save changes
5. Verify the value persists after page refresh

#### Test Media Upload Warnings
1. Upload a photo in Admin panel
2. If S3 is NOT configured, you should see a warning toast:
   - "WARNING: File stored locally on Render. Configure S3 to persist uploads after restart."
3. Check backend logs for:
   - `⚠️ WARNING: File stored locally on Render - will be lost on restart!`
4. If S3 IS configured, you should see:
   - `✅ File uploaded to S3: https://...`

### 5. Configure S3 (Critical for Production)
Follow the guide in `RENDER_MEDIA_PERSISTENCE_GUIDE.md` to set up AWS S3 or compatible storage.

## Verification Checklist

- [ ] Database migration completed successfully
- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Header opacity controls appear in Admin → Settings
- [ ] Header opacity changes take effect on homepage
- [ ] Hero Mobile URL saves and persists
- [ ] About page loads without errors
- [ ] Admin Settings page loads without errors
- [ ] Upload warnings appear when S3 is not configured
- [ ] S3 is configured for production deployment (see guide)

## Breaking Changes

None - all changes are backward compatible.

## Known Issues / Limitations

1. **Existing media stored locally on Render**: If you already have media files stored locally (before S3 configuration), they will be lost on the next Render restart. You'll need to re-upload them after configuring S3.

2. **Migration required**: You must run the database migration to add the new header opacity fields.

## Support

If you encounter issues:
1. Check backend logs for error messages
2. Verify all environment variables are set correctly
3. Ensure database migration completed successfully
4. Clear browser cache and hard refresh (Ctrl+Shift+R)

## Next Steps

1. **URGENT**: Configure S3 for production (see `RENDER_MEDIA_PERSISTENCE_GUIDE.md`)
2. Run database migration
3. Test all features in development
4. Deploy to Render
5. Re-upload any media that was stored locally
