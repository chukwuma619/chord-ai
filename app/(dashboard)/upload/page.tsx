"use client"

import { useState } from 'react'
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Toaster } from 'sonner'
import { toast } from 'sonner'
import { AudioUpload } from '@/components/audio/audio-upload'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Music, ArrowLeft, FileMusic, Sparkles, Upload, Youtube, Link as LinkIcon, Loader2 } from 'lucide-react'
import { AudioAnalysis } from '@/lib/types'

export default function UploadPage() {
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const router = useRouter()

  const handleAnalysisComplete = (newAnalysis: AudioAnalysis) => {
    // Redirect to preview page after successful analysis
    router.push(`/preview/${newAnalysis.id}`)
  }

  const handleYoutubeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!youtubeUrl.trim()) {
      toast.error('Please enter a YouTube URL')
      return
    }

    // Basic YouTube URL validation
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/)|youtu\.be\/)[\w-]+/
    if (!youtubeRegex.test(youtubeUrl)) {
      toast.error('Please enter a valid YouTube URL')
      return
    }

    setAnalyzing(true)

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ youtubeUrl }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to analyze YouTube video')
      }

      const data = await response.json()
      toast.success('YouTube analysis complete!')
      handleAnalysisComplete(data.analysis)
    } catch (error) {
      console.error('YouTube analysis error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to analyze YouTube video')
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Toaster position="top-center" richColors />
      
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <ArrowLeft className="h-5 w-5" />
            <Music className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">ChordAI</span>
          </Link>
        </nav>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Page Title */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Upload & Analyze</h1>
            <p className="text-muted-foreground">
              Upload an audio file or paste a YouTube link to get chord progressions
            </p>
          </div>

          {/* Upload Section with Tabs */}
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload" className="gap-2">
                <Upload className="h-4 w-4" />
                Upload File
              </TabsTrigger>
              <TabsTrigger value="youtube" className="gap-2">
                <Youtube className="h-4 w-4" />
                YouTube Link
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload" className="mt-6">
              <AudioUpload onAnalysisComplete={handleAnalysisComplete} />
            </TabsContent>
            
            <TabsContent value="youtube" className="space-y-6">
              <Card className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-primary">
                    <Youtube className="h-5 w-5" />
                    <h3 className="font-medium">YouTube Analysis</h3>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    Analyze chord progressions directly from YouTube videos. Just paste any YouTube URL and we&apos;ll extract the audio for analysis.
                  </p>
                  
                  <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-sm font-medium mb-2 text-blue-900 dark:text-blue-100">How it works:</p>
                    <ol className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-decimal list-inside">
                      <li>We download the audio from the YouTube video</li>
                      <li>Convert it to MP3 format for analysis</li>
                      <li>Run AI-powered chord detection on the audio</li>
                      <li>Generate an interactive chord timeline</li>
                    </ol>
                  </div>
                  
                  <form onSubmit={handleYoutubeSubmit} className="space-y-4">
                    <div className="flex items-center gap-2">
                      <LinkIcon className="h-4 w-4 text-muted-foreground" />
                      <Input
                        type="url"
                        placeholder="https://www.youtube.com/watch?v=..."
                        value={youtubeUrl}
                        onChange={(e) => setYoutubeUrl(e.target.value)}
                        disabled={analyzing}
                        className="flex-1"
                      />
                    </div>
                    
                    <Button 
                      type="submit"
                      disabled={analyzing || !youtubeUrl.trim()}
                      className="w-full"
                    >
                      {analyzing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing YouTube video...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Analyze YouTube Video
                        </>
                      )}
                    </Button>
                  </form>

                  {analyzing && (
                    <div className="text-xs text-muted-foreground text-center space-y-1">
                      <p>⏳ Downloading audio from YouTube...</p>
                      <p>🎵 This may take 30-60 seconds depending on video length</p>
                      <p>🔄 Converting to MP3 and uploading to storage...</p>
                    </div>
                  )}
                </div>
              </Card>
            </TabsContent>
          </Tabs>
          
          {/* Info Cards */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="p-6">
              <FileMusic className="h-10 w-10 text-primary mb-3" />
              <h3 className="font-semibold mb-2">Multiple Sources</h3>
              <p className="text-sm text-muted-foreground">
                Upload files or analyze directly from YouTube videos
              </p>
            </Card>
            
            <Card className="p-6">
              <Sparkles className="h-10 w-10 text-primary mb-3" />
              <h3 className="font-semibold mb-2">AI Processing</h3>
              <p className="text-sm text-muted-foreground">
                Advanced neural networks analyze harmony and rhythm
              </p>
            </Card>
            
            <Card className="p-6">
              <Upload className="h-10 w-10 text-primary mb-3" />
              <h3 className="font-semibold mb-2">Quick Results</h3>
              <p className="text-sm text-muted-foreground">
                Get chord progressions in under 60 seconds
              </p>
            </Card>
          </div>

          {/* Tips Section */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Tips for Best Results</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Use high-quality audio files or HD YouTube videos for better accuracy</li>
              <li>• Songs with clear harmonic content work best</li>
              <li>• Avoid heavily distorted or low-quality recordings</li>
              <li>• For YouTube videos, shorter clips (under 5 minutes) process faster</li>
              <li>• Instrumental versions may provide cleaner chord detection</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
} 