# Spotify Premium Upgrade - Spotify Clone with Neon DB & Local Backend

A fully functional, premium Spotify Clone upgraded with modern server-side architecture, credentials-based authentication, local file storage, AI recommendations, real-time audio manipulation tools, and a 16-step grid sequencer.

---

## Key Features

1. **Neon PostgreSQL Database + Prisma ORM**: Primary relational database transitioned to Neon for blazing-fast database queries and fully typed models.
2. **Custom Credentials Authentication**: Zero external dependencies. Users register and log in via a custom form. Passwords are securely hashed with native SHA-256 and sessions are handled using HMAC-signed HTTP-only cookies.
3. **Local File Storage Backend**: Completely self-contained. Uploaded audio tracks and covers are written directly to the project's static directories (`public/uploads/songs` and `public/uploads/images`), making the app immediately ready to run locally and deploy to servers.
4. **AI DJ Assistant & Recommendation Engine**: Talk to an AI DJ powered by the Gemini 2.5 Flash model (or local TF-IDF semantic fallback) to dynamically curate custom playlists from your song catalog.
5. **5-Band Graphic Equalizer**: Connects to the Web Audio API to dynamically adjust Bass, Mid-Bass, Mids, High-Mids, and Treble with built-in presets (Bass Booster, Vocal Booster, Electronic, Pop).
6. **Real-Time Spectrogram Visualizer**: Interactive canvas drawing pulsing, glowing neon frequency waves synchronized with playing music.
7. **Synth Drum Sequencer (Beat Maker)**: A grid-based composition tool built using Web Audio oscillators allowing users to create their own loops (Kick, Snare, Hi-hat, Synth) with adjustable BPM.
8. **Mobile-First Responsive UI**: Snap-to-bottom layout, glassmorphic floating bottom navigation menu, and responsive layout scaling elegantly from mobile phones up to TVs.

---

## Technical Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS & Glassmorphism
- **Database ORM**: Prisma Client
- **Database Hosting**: Neon Database (PostgreSQL Serverless)
- **Authentication**: Custom SHA-256 Hashed Passwords + HMAC Signed Cookie Sessions
- **Storage Backend**: Local Node File System (`public/uploads`)
- **AI Engine**: Google GenAI SDK (Gemini 2.5 Flash)
- **Billing**: Stripe Checkout & Webhooks
- **Audio Logic**: Web Audio API & Howler.js

---

## Getting Started

### 1. Configure Environment Variables
Create a `.env` or `.env.local` file in the root directory:

```env
# Neon PostgreSQL Database Connection String
DATABASE_URL="your-neon-database-connection-url"

# Session Sign Key (HMAC Signature key)
SESSION_SECRET="your-secure-session-signing-secret"

# Stripe Configurations
STRIPE_SECRET_KEY="your-stripe-secret-key"
STRIPE_WEBHOOK_SECRET="your-stripe-webhook-signing-secret"

# Gemini AI (Optional, fallbacks to keyword search if not set)
GEMINI_API_KEY="your-gemini-api-key"
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Sync Database Schema
Sync the Prisma schema to create the Neon database tables and generate the local Prisma Client:
```bash
npx prisma db push
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## Database Schema (Prisma Models)

- `User`: Manages user credentials (email, SHA-256 hashed password), profiles, and billing details.
- `Song`: Retains tracks uploaded by users, matching title, artist, local audio paths, and cover paths.
- `LikedSong`: Many-to-many link matching liked songs to users.
- `Customer`: Syncs user mapping to Stripe billing handles.
- `Product` & `Price`: Direct mirrors of Stripe subscription tiers.
- `Subscription`: Stores subscription validity periods, statuses, and links.
