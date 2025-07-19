"use client"

import { useState } from 'react'
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Toaster } from 'sonner'
import { AudioUpload } from '@/components/audio/audio-upload'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Music, ArrowLeft, FileMusic, Sparkles, Upload } from 'lucide-react'
import { AudioAnalysis } from '@/lib/types'

export default function UploadPage() {
  const [analysis, setAnalysis] = useState<AudioAnalysis | null>(null)
  const router = useRouter()

  const handleAnalysisComplete = (newAnalysis: AudioAnalysis) => {
    setAnalysis(newAnalysis)
    // Redirect to preview page after successful analysis
    router.push(`/preview/${newAnalysis.id}`)
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
              Upload your audio file and let AI detect the chord progressions
            </p>
          </div>

          {/* Upload Section */}
          <AudioUpload onAnalysisComplete={handleAnalysisComplete} />
          
          {/* Info Cards */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="p-6">
              <FileMusic className="h-10 w-10 text-primary mb-3" />
              <h3 className="font-semibold mb-2">Supported Formats</h3>
              <p className="text-sm text-muted-foreground">
                MP3, WAV, M4A, FLAC, and OGG files up to 50MB
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
                Get chord progressions in under 30 seconds
              </p>
            </Card>
          </div>

          {/* Tips Section */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Tips for Best Results</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Use high-quality audio files for better accuracy</li>
              <li>• Songs with clear harmonic content work best</li>
              <li>• Avoid heavily distorted or low-quality recordings</li>
              <li>• Instrumental versions may provide cleaner results</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
} 