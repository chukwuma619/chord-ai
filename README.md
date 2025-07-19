# ChordAI - AI-Powered Chord Progression Detection

A modern web application for detecting chord progressions in audio files using AI, built with Next.js, Supabase, and Shadcn UI.

## Features

- 🎵 **Real-time Chord Detection**: Upload audio files and get accurate chord progressions
- 🔐 **User Authentication**: Secure login with email/password or Google OAuth
- 🎼 **Audio Player**: Interactive player with timeline visualization
- 🔍 **Search Library**: Browse and search analyzed songs
- 📊 **Chord Visualization**: See chord progressions with timeline and detailed views
- 💾 **Cloud Storage**: All analyses saved to your account

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **UI**: Shadcn UI, Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes, Supabase
- **Database**: PostgreSQL (via Supabase)
- **Storage**: Supabase Storage
- **Audio Processing**: Web Audio API, Music Theory algorithms
- **Authentication**: Supabase Auth

## Prerequisites

- Node.js 18+ and npm
- Supabase account
- (Optional) Replicate API token for advanced AI models

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/chord-ai.git
cd chord-ai
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to Settings → API and copy your project URL and anon key
3. Run the SQL commands from `supabase/schema.sql` in the Supabase SQL editor

### 4. Configure environment variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: For production AI chord detection
# REPLICATE_API_TOKEN=your_replicate_api_token

# Optional: Base URL for production
# NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

### 5. Set up authentication

In your Supabase dashboard:
1. Go to Authentication → Providers
2. Enable Email provider
3. Enable Google provider (optional)
4. Add your site URL to the redirect URLs

### 6. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
chord-ai/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Protected dashboard pages
│   ├── api/               # API routes
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── audio/            # Audio-related components
│   └── ui/               # Shadcn UI components
├── lib/                   # Utilities and helpers
│   ├── supabase/         # Supabase clients
│   ├── hooks/            # React hooks
│   └── audio-analyzer.ts # Audio analysis logic
├── supabase/             # Database schema
└── public/               # Static assets
```

## Features in Detail

### Audio Analysis
The application uses Web Audio API for real-time audio processing:
- FFT (Fast Fourier Transform) for frequency analysis
- Pitch detection using autocorrelation
- Tempo detection using onset detection
- Chord recognition based on harmonic analysis

### Database Schema
- `analyses` table stores all chord detection results
- Row Level Security (RLS) policies for data protection
- Indexed for fast queries

### Authentication Flow
- Email/password registration with confirmation
- Google OAuth integration
- Protected routes with middleware
- Persistent sessions

## Production Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the project to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### For Production AI Integration

Replace the chord detection simulation with real AI services:
1. **Replicate**: Use models like `mtg/chord-detection`
2. **Essentia.js**: Client-side audio analysis
3. **Sonic API**: Commercial chord detection service

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details
