# Modern Musician Website

A highly modern, stylish, and fully responsive musician website with separate frontend and backend architecture. Features a mobile-first React SPA and a Node.js backend with PostgreSQL.

## 🎵 Features

### Frontend (React + Vite)
- **Mobile-First Design** - Optimized for all devices
- **Modern UI/UX** - Tailwind CSS with neon purple/black theme
- **Performance Optimized** - Code splitting, lazy loading, reduced motion support
- **Animations** - Framer Motion for smooth transitions
- **Payment Integration** - Stripe, PayPal, M-Pesa support

### Pages
- **Home** - Animated hero with video/image, featured content
- **Music** - Embedded players (Spotify, Apple Music, SoundCloud), purchasable tracks
- **Videos** - Gallery with YouTube/Vimeo embeds, custom uploads
- **About** - Animated biography with customizable sections
- **Tour/Events** - Interactive calendar with ticket links
- **Merch** - E-commerce store with Stripe/Shopify checkout
- **Support/Donate** - Multiple payment methods (Stripe, PayPal, M-Pesa)
- **Fan Club** - Paid membership with exclusive access
- **Contact** - Booking and press inquiry forms
- **Admin Panel** - Full content management system

### Backend (Node.js + Express)
- **RESTful API** - Complete CRUD operations
- **PostgreSQL + Prisma** - Type-safe database access
- **Authentication** - Magic link and passcode support
- **Payment Processing** - Stripe webhooks, PayPal, M-Pesa
- **File Uploads** - S3-compatible storage
- **Email Integration** - Newsletter broadcasts, magic links
- **Security** - Helmet, rate limiting, CORS

## 📋 Tech Stack

### Frontend
- React 18
- Vite
- React Router DOM
- Tailwind CSS
- Framer Motion
- Axios
- Stripe React
- Zustand (state management)
- React Hot Toast
- Date-fns

### Backend
- Node.js
- Express
- Prisma ORM
- PostgreSQL
- JWT
- Stripe
- Nodemailer
- AWS S3 SDK
- Multer
- Helmet

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 14+
- Stripe account (for payments)
- SMTP server (for emails)
- AWS S3 or compatible storage (optional)

### Backend Setup

1. **Navigate to backend directory**
```bash
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create .env file**
```bash
cp .env.example .env
```

4. **Configure environment variables**
Edit `.env` with your credentials:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/musician_db?schema=public"
PORT=3001
JWT_SECRET=your-super-secret-jwt-key
ADMIN_EMAIL=ruachkol@gmail.com
STRIPE_SECRET_KEY=sk_test_...
SMTP_HOST=smtp.gmail.com
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
# Add other credentials as needed
```

5. **Setup database**
```bash
# Generate Prisma client
npm run generate

# Run migrations
npm run migrate

# Or for production
npm run migrate:deploy
```

6. **Start development server**
```bash
npm run dev
```

Backend will be running at `http://localhost:3001`

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create .env file**
```bash
cp .env.example .env
```

4. **Configure environment variables**
Edit `.env`:
```env
VITE_API_BASE_URL=http://localhost:3001
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_ADMIN_EMAIL=ruachkol@gmail.com
```

5. **Start development server**
```bash
npm run dev
```

Frontend will be running at `http://localhost:5173`

## 🌐 Deployment

### Backend → Render

1. **Create New Web Service** on Render
2. **Connect your repository**
3. **Configure build settings:**
   - Build Command: `cd backend && npm install && npx prisma generate`
   - Start Command: `cd backend && npm start`
4. **Add environment variables:**
   - All variables from `.env.example`
   - Set `NODE_ENV=production`
   - Set `DATABASE_URL` to your PostgreSQL connection string
5. **Deploy!**

### Frontend → Netlify

1. **Build the frontend locally:**
```bash
cd frontend
npm run build
```

2. **Deploy via Netlify CLI:**
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

Or use Netlify's web interface:
- Drag and drop the `dist` folder
- Configure environment variables in Netlify dashboard

3. **Set environment variables in Netlify:**
   - `VITE_API_BASE_URL` - Your backend URL (e.g., https://your-api.onrender.com)
   - `VITE_STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key
   - `VITE_ADMIN_EMAIL` - Admin email (ruachkol@gmail.com)

4. **Configure build settings (if using Git):**
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`

## 🔐 Admin Access

### Initial Setup

1. **Access the Fan Club page** at `/fan-club`
2. **Enter the admin email:** `ruachkol@gmail.com`
3. **Choose authentication method:**
   - **Magic Link:** Check your email for login link
   - **Passcode:** Set via API first or use magic link

### Setting a Passcode (Optional)

Use the API endpoint:
```bash
POST /api/auth/set-passcode
{
  "email": "ruachkol@gmail.com",
  "passcode": "your-secure-passcode"
}
```

### Admin Features

- **Dashboard** - Analytics and recent payments
- **Settings** - Site colors, hero media, fan club fee
- **Music** - Add/edit tracks, embeddings, purchasable items
- **Videos** - Manage video gallery
- **Gallery** - Create albums, upload photos
- **Events** - Tour dates and ticket links
- **Merch** - Product catalog
- **About** - Biography sections with custom styling
- **Subscribers** - Email list, fan club members, broadcasts
- **Contacts** - Inquiry management

## 💳 Payment Integration

### Stripe Setup

1. Create a Stripe account at https://stripe.com
2. Get your API keys from the Dashboard
3. Add webhook endpoint: `https://your-api.com/api/payments/stripe/webhook`
4. Subscribe to events: `checkout.session.completed`
5. Copy webhook secret to `.env`

### PayPal Setup

1. Create PayPal developer account
2. Create REST API app
3. Get Client ID and Secret
4. Update `.env` with credentials

### M-Pesa Setup (Optional)

1. Register for Safaricom Daraja API
2. Get Consumer Key and Secret
3. Configure shortcode and passkey
4. Update `.env` with credentials

## 📧 Email Configuration

### Gmail Setup

1. Enable 2-factor authentication
2. Generate App Password
3. Use in `SMTP_PASSWORD`

### Other Providers

Update `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, and `SMTP_PASSWORD` accordingly.

## 🗄️ Database Management

### Prisma Studio (Database GUI)

```bash
cd backend
npm run studio
```

Access at `http://localhost:5555`

### Create Migration

```bash
cd backend
npx prisma migrate dev --name your_migration_name
```

### Reset Database (Development)

```bash
npx prisma migrate reset
```

## 📁 Project Structure

```
Musica2/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── admin.js
│   │   │   ├── content.js
│   │   │   ├── music.js
│   │   │   ├── videos.js
│   │   │   ├── gallery.js
│   │   │   ├── events.js
│   │   │   ├── merch.js
│   │   │   ├── subscribers.js
│   │   │   ├── payments.js
│   │   │   ├── contact.js
│   │   │   └── upload.js
│   │   ├── utils/
│   │   │   ├── email.js
│   │   │   └── storage.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/
│   │   │   │   ├── AdminDashboard.jsx
│   │   │   │   ├── AdminSettings.jsx
│   │   │   │   ├── AdminMusic.jsx
│   │   │   │   ├── AdminVideos.jsx
│   │   │   │   ├── AdminGallery.jsx
│   │   │   │   ├── AdminEvents.jsx
│   │   │   │   ├── AdminMerch.jsx
│   │   │   │   ├── AdminAbout.jsx
│   │   │   │   ├── AdminSubscribers.jsx
│   │   │   │   └── AdminContacts.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── MusicPlayer.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Music.jsx
│   │   │   ├── Videos.jsx
│   │   │   ├── About.jsx
│   │   │   ├── Tour.jsx
│   │   │   ├── Merch.jsx
│   │   │   ├── Support.jsx
│   │   │   ├── FanClub.jsx
│   │   │   ├── Contact.jsx
│   │   │   ├── Admin.jsx
│   │   │   ├── AuthVerify.jsx
│   │   │   ├── PurchaseSuccess.jsx
│   │   │   └── FanClubSuccess.jsx
│   │   ├── lib/
│   │   │   └── api.js
│   │   ├── store/
│   │   │   └── useStore.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env.example
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
└── README.md
```

## 🎨 Customization

### Theme Colors

Edit `frontend/tailwind.config.js`:
```js
colors: {
  primary: {
    DEFAULT: '#9333ea',  // Neon purple
    dark: '#7e22ce',
    light: '#a855f7'
  },
  // Add more colors
}
```

Or use the Admin Settings panel to change colors dynamically.

### Hero Section

Admin can configure:
- Video or image background
- Desktop and mobile versions
- Title and subtitle
- Particle effects
- Parallax scrolling

### Fan Club Fee

Change via Admin Settings or directly in database:
```sql
UPDATE "SiteSettings" SET "fanClubAccessFee" = 10.0;
```

## 🔧 Troubleshooting

### Database Connection Issues

- Ensure PostgreSQL is running
- Check `DATABASE_URL` format
- Verify user permissions

### CORS Errors

- Set `FRONTEND_URL` in backend `.env`
- Check allowed origins in `server.js`

### Payment Webhooks Not Working

- Use ngrok for local testing: `ngrok http 3001`
- Update webhook URLs in Stripe/PayPal dashboards
- Verify webhook secrets in `.env`

### File Uploads Failing

- Check S3 credentials
- Verify bucket permissions
- For development, files save to `backend/uploads/`

## 📝 API Documentation

### Public Endpoints

- `GET /api/content/settings` - Site settings
- `GET /api/music` - All music items
- `GET /api/videos` - All videos
- `GET /api/events` - All events
- `GET /api/events/upcoming` - Upcoming events only
- `GET /api/merch` - Merchandise items
- `GET /api/gallery/albums` - Gallery albums with photos
- `POST /api/subscribers/subscribe` - Newsletter signup
- `POST /api/contact` - Contact form submission

### Payment Endpoints

- `POST /api/payments/stripe/create-music-session` - Purchase music
- `POST /api/payments/stripe/create-fanclub-session` - Join fan club
- `POST /api/payments/stripe/create-donation-session` - Make donation
- `POST /api/payments/stripe/webhook` - Stripe webhook handler

### Admin Endpoints (Require Authentication)

All admin endpoints require `Authorization: Bearer <token>` header.

- `GET /api/admin/dashboard` - Dashboard stats
- `PUT /api/content/settings` - Update site settings
- `POST /api/music` - Create music item
- `PUT /api/music/:id` - Update music item
- `DELETE /api/music/:id` - Delete music item
- Similar CRUD for videos, events, merch, gallery, etc.

## 🛡️ Security

- JWT-based authentication
- Rate limiting (100 requests per 15 min)
- Helmet.js security headers
- CORS configuration
- Input validation
- SQL injection protection (Prisma)
- XSS protection

## 📊 Performance

- Code splitting
- Lazy loading for media
- Image optimization
- Database indexing
- Compression middleware
- CDN-ready static assets

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Support

For issues and questions:
- Email: ruachkol@gmail.com
- Create an issue on GitHub

## 🎉 Acknowledgments

- Built with modern web technologies
- Designed for musicians and artists
- Mobile-first approach
- Accessible and performant

---

**Happy Music Making! 🎵**
