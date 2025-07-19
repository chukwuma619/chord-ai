-- Create a storage bucket for audio files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('audio-files', 'audio-files', true);

-- Create a table for storing audio analyses
CREATE TABLE IF NOT EXISTS public.analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  key TEXT NOT NULL,
  tempo INTEGER NOT NULL,
  chords JSONB NOT NULL,
  audio_url TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;

-- Create policies for the analyses table
-- Allow users to read all analyses (public access)
CREATE POLICY "Allow public read access on analyses" ON public.analyses
  FOR SELECT
  USING (true);

-- Allow authenticated users to create their own analyses
CREATE POLICY "Allow authenticated users to create analyses" ON public.analyses
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Allow users to update their own analyses
CREATE POLICY "Allow users to update own analyses" ON public.analyses
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Allow users to delete their own analyses
CREATE POLICY "Allow users to delete own analyses" ON public.analyses
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create an index on created_at for better query performance
CREATE INDEX idx_analyses_created_at ON public.analyses(created_at DESC); 