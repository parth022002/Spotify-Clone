# Spotify Premium Upgrade - Spotify Clone with Neon DB & AI DJ

A fully functional, premium Spotify Clone upgraded with modern server-side architecture, AI recommendations, real-time audio manipulation tools, and a 16-step grid sequencer.

## Key Features

1. **Neon PostgreSQL Database + Prisma ORM**: Primary relational database transitioned from Supabase to Neon for blazing-fast database queries and fully typed models.
2. **Hybrid Cloud Backend**: 
   - **Neon Database** handles all structured relational data (users, songs, liked songs, prices, products, and subscriptions).
   - **Supabase Auth & Storage** continues to securely handle authentication sessions and high-bandwidth file uploads (mp3s and images).
3. **AI DJ Assistant & Recommendation Engine**: Talk to an AI DJ powered by the Gemini 2.5 Flash model (or local TF-IDF semantic fallback) to dynamically curate custom playlists from your song catalog.
4. **5-Band Graphic Equalizer**: Connects to the Web Audio API to dynamically adjust Bass, Mid-Bass, Mids, High-Mids, and Treble with built-in presets (Bass Booster, Vocal Booster, Electronic, Pop).
5. **Real-Time spectrogram Visualizer**: Interactive canvas drawing pulsing, glowing neon frequency waves synchronized with playing music.
6. **Synth Drum Sequencer (Beat Maker)**: A grid-based composition tool built using Web Audio oscillators allowing users to create their own loops (Kick, Snare, Hi-hat, Synth) with adjustable BPM.
7. **Mobile-First Responsive UI**: Snap-to-bottom layout, glassmorphic floating bottom navigation menu, and responsive layout scaling elegantly from mobile phones up to TVs.

---

## Technical Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS & Glassmorphism
- **Database ORM**: Prisma Client
- **Database Hosting**: Neon Database (PostgreSQL Serverless)
- **Auth & Storage**: Supabase API
- **AI Engine**: Google GenAI SDK (Gemini 2.5 Flash)
- **Billing**: Stripe Checkout & Webhooks
- **Audio Logic**: Web Audio API & Howler.js

---

## Getting Started

### 1. Configure Environment Variables
Create a `.env` or `.env.local` file in the root directory:

```env
DATABASE_URL="postgresql://neondb_owner:npg_Frq17AyuBTja@ep-tiny-darkness-azs76o5z-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# Supabase Configurations
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"

# Stripe configurations
STRIPE_SECRET_KEY="your-stripe-secret-key"
STRIPE_WEBHOOK_SECRET="your-stripe-webhook-signing-secret"

# Gemini AI (Optional, fallbacks to keyword search if not set)
GEMINI_API_KEY="your-gemini-api-key"
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Push Database Schema to Neon
Sync the Prisma schema to create the Neon database tables and generate Prisma Client:
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

- `User`: Manages user profile links, avatar references, and billing details.
- `Song`: Retains tracks uploaded by users, matching title, artist, audio paths, and cover paths.
- `LikedSong`: Many-to-many link matching liked songs to users.
- `Customer`: Syncs user mapping to Stripe billing handles.
- `Product` & `Price`: Direct mirrors of Stripe subscription tiers.
- `Subscription`: Stores subscription validity periods, statuses, and links.
