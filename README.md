# ChordAI - AI-Powered Chord Progression Detection

A modern web application for detecting chord progressions in audio files and YouTube videos using AI, built with Next.js, Supabase, and Shadcn UI.

## Features

- 🎵 **Real-time Chord Detection**: Upload audio files or analyze YouTube videos to get accurate chord progressions
- 📺 **YouTube Integration**: Analyze chord progressions directly from YouTube videos using yt-dlp
- 🔐 **User Authentication**: Secure login with email/password or Google OAuth
- 🎼 **Interactive Audio Player**: Enhanced player with waveform visualization, tempo control, and looping
- 🎹 **Chord Timeline**: Visual chord progression timeline with interactive playback synchronization
- 🔍 **Search Library**: Browse and search analyzed songs
- 📊 **Chord Visualization**: See chord progressions with timeline and detailed views
- 🎛️ **Advanced Controls**: Transpose, capo, tempo adjustment, and chord simplification
- 💾 **Cloud Storage**: All analyses saved to your account with Supabase Storage
- 🆓 **Completely Free**: No payment plans, subscriptions, or feature restrictions

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **UI**: Shadcn UI, Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes, Supabase
- **Database**: PostgreSQL (via Supabase)
- **Storage**: Supabase Storage
- **Audio Processing**: Web Audio API, WaveSurfer.js, Music Theory algorithms
- **YouTube Processing**: yt-dlp, FFmpeg
- **Authentication**: Supabase Auth

## Prerequisites

- Node.js 18+ and npm
- Supabase account
- **yt-dlp** (for YouTube functionality)
- **FFmpeg** (for audio conversion)
- (Optional) Replicate API token for advanced AI models

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/chord-ai.git
cd chord-ai
```

### 2. Install system dependencies

**On macOS:**
```bash
brew install yt-dlp ffmpeg
```

**On Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install yt-dlp ffmpeg
```

**On Windows:**
```bash
# Install using Chocolatey
choco install yt-dlp ffmpeg

# Or install using Scoop
scoop install yt-dlp ffmpeg
```

### 3. Install Node.js dependencies

```bash
npm install
```

### 4. Set up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to Settings → API and copy your project URL and anon key
3. Run the SQL commands from `supabase/schema.sql` in the Supabase SQL editor

### 5. Configure environment variables

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

### 6. Set up authentication

In your Supabase dashboard:
1. Go to Authentication → Providers
2. Enable Email provider
3. Enable Google provider (optional)
4. Add your site URL to the redirect URLs

### 7. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## YouTube Functionality

ChordAI can analyze chord progressions directly from YouTube videos:

### How it works:
1. **Download**: Uses yt-dlp to download audio from YouTube videos
2. **Convert**: Converts audio to MP3 format using FFmpeg
3. **Upload**: Stores the audio file in Supabase Storage
4. **Analyze**: Runs AI-powered chord detection on the audio
5. **Display**: Shows interactive chord timeline with playback

### Supported YouTube URLs:
- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://www.youtube.com/embed/VIDEO_ID`

### Usage:
1. Go to the Upload page
2. Click the "YouTube Analysis" tab
3. Paste any YouTube URL
4. Click "Analyze YouTube Video"
5. Wait for processing (30-60 seconds depending on video length)
6. View the interactive chord timeline

## Project Structure

```
chord-ai/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Protected dashboard pages
│   ├── api/               # API routes
│   │   └── analyze/       # Audio/YouTube analysis endpoint
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── audio/            # Audio-related components
│   │   ├── audio-player.tsx    # Enhanced audio player
│   │   ├── audio-upload.tsx    # File upload component
│   │   └── chord-timeline.tsx  # Interactive chord timeline
│   └── ui/               # Shadcn UI components
├── lib/                   # Utilities and helpers
│   ├── supabase/         # Supabase clients
│   ├── hooks/            # React hooks
│   ├── music-theory.ts   # Music theory utilities
│   └── audio-analyzer.ts # Audio analysis logic
├── supabase/             # Database schema
└── public/               # Static assets
```

## Troubleshooting Audio Playback

If audio files are not playing, here are the most common issues and solutions:

### 1. **Storage Bucket Permissions**

Make sure your Supabase storage bucket has the correct policies. Run this SQL in your Supabase SQL editor:

```sql
-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create policies for the audio-files bucket
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'audio-files');
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'audio-files' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update own files" ON storage.objects FOR UPDATE USING (bucket_id = 'audio-files' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own files" ON storage.objects FOR DELETE USING (bucket_id = 'audio-files' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### 2. **CORS Configuration**

In your Supabase dashboard, go to Settings → API → CORS Configuration and make sure these origins are allowed:
- `http://localhost:3000` (for development)
- Your production domain

### 3. **Storage Bucket Setup**

Ensure the `audio-files` bucket exists and is public:

1. Go to Storage in your Supabase dashboard
2. Create a bucket named `audio-files` if it doesn't exist
3. Make sure it's set to "Public bucket"
4. Check that the bucket policies are correctly applied

### 4. **Browser Console Debugging**

Open your browser's developer tools and check the console for:
- Network errors when loading audio files
- CORS errors
- WaveSurfer.js errors
- Any failed fetch requests

The audio player includes debug information in development mode that will show:
- Audio URL being loaded
- Loading progress
- Error messages
- Accessibility test results

### 5. **Audio File Format**

Ensure your audio files are in supported formats:
- MP3 (.mp3)
- WAV (.wav)
- M4A (.m4a)
- FLAC (.flac)
- OGG (.ogg)

### 6. **File Size Limits**

The current limit is 50MB per file. Larger files may fail to upload or play properly.

### 7. **Network Issues**

Check if you can access the audio URL directly in your browser. The URL should look like:
`https://[your-project-id].supabase.co/storage/v1/object/public/audio-files/[filename]`

If you can't access it directly, there's likely a storage configuration issue.

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
