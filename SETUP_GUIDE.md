# Setup Guide - Musician Website with Live Events

## 🎉 Features Implemented

### ✅ Real-Time Updates
- Socket.IO integration for instant content updates
- Admin changes reflect immediately on visitor pages
- No page refresh needed

### ✅ Live Event System
- Admin can schedule, start, and end live streaming events
- Automatic email notifications to subscribers when live starts
- Payment-gated access ($5 default, admin configurable)
- WebRTC video/audio with controls (mic, video, hand raise)
- Real-time participant management

### ✅ Enhanced Admin Dashboard
- **Live Events** - Schedule and manage live streams
- **Settings** - Hero opacity controls (PC/mobile), colors, fees
- **Music, Videos, Gallery** - Full CRUD with inline editing
- **About** - Multiple sections with custom styling
- **Events, Merch** - Complete management
- **Subscribers** - Fan club members, broadcast emails
- **Contacts** - Inquiry management

### ✅ About Page Photos
- Photo albums with upload management
- Album filtering and selection
- Modal lightbox viewer
- Real-time updates when photos added

### ✅ Confirmation & UX
- Toast notifications on all save actions
- Delete confirmation prompts
- Loading states and error handling

## 🚀 Installation & Setup

### Step 1: Install Backend Dependencies

```bash
cd backend
npm install
```

New dependencies added:
- `socket.io@^4.7.2` - Real-time communication

### Step 2: Install Frontend Dependencies

```bash
cd frontend
npm install
```

New dependencies added:
- `socket.io-client@^4.7.2` - WebSocket client
- `simple-peer@^9.11.1` - WebRTC for live video

### Step 3: Database Migration

The database schema has been updated with:
- `LiveEvent` - Live streaming events
- `LiveParticipant` - Participants in live events
- `LiveAccessToken` - Access tokens for paid live events
- Updated `SiteSettings` - Hero opacity fields, live event fee
- Updated `Subscriber` - Relations to live events

Run the migration:

```bash
cd backend
npm run migrate
```

If migration fails or you want to start fresh:

```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Or create new migration
npx prisma migrate dev --name add_live_events
```

### Step 4: Update Environment Variables

**Backend `.env`** - Already created, verify these are set:
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/musician_db?schema=public"
JWT_SECRET=your-secret-key
ADMIN_EMAIL=ruachkol@gmail.com
STRIPE_SECRET_KEY=sk_test_...
SMTP_HOST=smtp.gmail.com
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
FRONTEND_URL=http://localhost:5173
```

**Frontend `.env`** - Already created, verify:
```env
VITE_API_BASE_URL=http://localhost:3001
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_ADMIN_EMAIL=ruachkol@gmail.com
```

### Step 5: Generate Prisma Client

```bash
cd backend
npm run generate
```

### Step 6: Start Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## 🎯 Testing the Features

### Real-Time Updates Test

1. Open admin panel in one browser: `http://localhost:5173/admin`
2. Open the public site in another browser: `http://localhost:5173`
3. Make changes in admin (e.g., update settings, add content)
4. Watch changes appear instantly on the public site ✨

### Live Event Test

1. **Schedule Event** (Admin):
   - Go to Admin → Live Events
   - Click "Schedule Live Event"
   - Fill in title, date, fee, thumbnail
   - Click Save

2. **Start Event** (Admin):
   - Click "Start Live" button
   - Subscribers receive email notifications automatically
   - Event status changes to LIVE 🔴

3. **Join Event** (Fan):
   - Visit `/live/{event-id}`
   - Pay access fee or enter access token
   - Click "Join Live Event Now"
   - Grant camera/mic permissions
   - Use controls to toggle mic, video, raise hand

4. **Manage Event** (Admin):
   - See participant count in real-time
   - Click "End Live" when finished

### About Photos Test

1. **Upload Photos** (Admin):
   - Go to Admin → Gallery
   - Create album or select existing
   - Upload photos (drag & drop or select files)
   - Photos appear immediately

2. **View Photos** (Public):
   - Visit `/about`
   - Scroll to Photos section
   - Filter by album
   - Click photos to view in lightbox

## 🔐 Admin Access

### Method 1: Magic Link (Recommended)
1. Go to `/fan-club`
2. Enter `ruachkol@gmail.com`
3. Choose "Use Magic Link"
4. Check email for login link
5. Click link to access admin panel

### Method 2: Passcode
First set a passcode via API:
```bash
curl -X POST http://localhost:3001/api/auth/set-passcode \
  -H "Content-Type: application/json" \
  -d '{"email":"ruachkol@gmail.com","passcode":"your-password"}'
```

Then:
1. Go to `/fan-club`
2. Enter `ruachkol@gmail.com`
3. Enter passcode
4. Click Login

## 📊 Database Schema

### New Tables

**LiveEvent**
- id, title, description
- scheduledAt, startedAt, endedAt
- status (scheduled, live, ended, cancelled)
- accessFee, maxParticipants
- thumbnailUrl, streamUrl

**LiveParticipant**
- id, liveEventId, subscriberId
- joinedAt, leftAt
- micEnabled, videoEnabled, handRaised

**LiveAccessToken**
- id, liveEventId, subscriberId
- token, paymentId
- expiresAt, used, usedAt

**Updated SiteSettings**
- heroOpacity, heroOpacityMobile
- liveEventFee

## 🎨 Admin Features Reference

### Dashboard
- Total subscribers, fan club members, music items, events
- Total revenue
- Recent payments table

### Settings
- Hero type (video/image)
- Hero media URLs (desktop/mobile)
- Hero opacity (desktop/mobile) ← NEW
- Colors (primary, secondary, accent, background)
- Fan club access fee
- Live event default fee ← NEW
- Feature toggles (parallax, particles, auto-player)

### Live Events ← NEW
- Schedule future events
- Start/end events
- View participants in real-time
- Send notifications to subscribers
- Edit event details
- Delete events with confirmation

### Music
- Add/edit tracks
- Spotify/Apple Music/SoundCloud embeds
- Purchasable tracks with Stripe
- Upload thumbnails
- Display order

### Videos
- YouTube/Vimeo/Direct upload support
- Thumbnails
- Display order

### Gallery
- Create albums
- Upload multiple photos
- Reorder photos
- Delete photos with confirmation
- Album covers

### Events (Tour)
- Add tour dates
- Venue information
- Ticket links
- Past/upcoming filtering

### Merch
- Product catalog
- Prices and inventory
- External checkout URLs
- Image uploads

### About
- Multiple sections
- Custom background colors/opacity
- Rich text content
- Display order

### Subscribers
- View all subscribers
- Fan club members list
- Send broadcast emails ← Enhanced
- Export to CSV
- Delete with confirmation

### Contacts
- View submissions
- Filter by type (general, booking, press)
- Reply via email link
- Delete with confirmation

## 🔄 Real-Time Event List

All these events trigger instant updates on connected clients:

- `settings-updated` - Site settings changed
- `about-created/updated/deleted` - About sections
- `live-event-created/updated/deleted/started/ended` - Live events
- `participant-joined/left/updated` - Live event participants

## 🎥 WebRTC Live Streaming

The live event system uses WebRTC for peer-to-peer video/audio:

**Features:**
- Toggle microphone on/off
- Toggle video on/off  
- Raise hand for attention
- Screen sharing (optional, can be added)
- Real-time participant list
- Admin controls to end event

**Browser Support:**
- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile: ⚠️ Limited (no screen share)

## ⚠️ Important Notes

1. **SMTP Setup Required** for:
   - Magic link authentication
   - Live event notifications
   - Newsletter broadcasts

2. **Stripe Setup Required** for:
   - Music purchases
   - Fan club subscriptions
   - Live event access
   - Donations

3. **PostgreSQL Required**:
   - Install locally or use cloud (Supabase, Railway, etc.)
   - Update `DATABASE_URL` in backend `.env`

4. **Browser Permissions** for Live Events:
   - Users must grant camera/mic permissions
   - HTTPS required in production

## 🚢 Production Deployment

Same as before:
- Backend → Render
- Frontend → Netlify
- Database → PostgreSQL (Render, Supabase, etc.)

**Additional Production Config:**
- Ensure `FRONTEND_URL` points to production domain
- Set up CORS for WebSocket connections
- Use HTTPS for WebRTC (required)
- Configure Stripe webhooks for live production

## 📝 Summary of Changes

### Backend Files Added/Modified:
- ✅ `prisma/schema.prisma` - Live event models
- ✅ `src/routes/live.js` - Live event endpoints
- ✅ `src/routes/content.js` - Real-time emit calls
- ✅ `src/server.js` - Socket.IO integration
- ✅ `src/utils/email.js` - Live event notifications
- ✅ `package.json` - socket.io dependency

### Frontend Files Added/Modified:
- ✅ `src/lib/socket.js` - Socket.IO client service
- ✅ `src/lib/api.js` - Live event API calls
- ✅ `src/store/useStore.js` - Real-time state management
- ✅ `src/App.jsx` - Socket initialization, LiveEvent route
- ✅ `src/pages/LiveEvent.jsx` - Live event viewer with WebRTC
- ✅ `src/pages/About.jsx` - Photos subsection
- ✅ `src/pages/Admin.jsx` - AdminLiveEvents integration
- ✅ `src/components/admin/AdminLiveEvents.jsx` - Live event management
- ✅ `src/components/admin/AdminSettings.jsx` - Hero opacity controls
- ✅ `package.json` - socket.io-client, simple-peer dependencies

## 🎊 You're All Set!

Your musician website now has:
- ✨ Real-time content updates
- 🔴 Live streaming with WebRTC
- 📸 Photo galleries
- 💳 Multiple payment flows
- 📧 Email notifications
- 🎨 Full customization
- 📱 Mobile responsive
- 🔒 Secure admin panel

**Need Help?**
- Check browser console for errors
- Verify all environment variables are set
- Ensure PostgreSQL is running
- Test socket connection at http://localhost:3001/health
