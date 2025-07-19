"use client"

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { Upload, Loader2, Music, CheckCircle } from 'lucide-react'
import { AudioAnalysis } from '@/lib/types'

interface AudioUploadProps {
  onAnalysisComplete: (analysis: AudioAnalysis) => void
}

export function AudioUpload({ onAnalysisComplete }: AudioUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [phase, setPhase] = useState<'idle' | 'uploading' | 'analyzing' | 'complete'>('idle')

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    // Validate file type
    const validTypes = ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/x-wav', 
                       'audio/mp4', 'audio/x-m4a', 'audio/flac', 'audio/ogg']
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid audio file (MP3, WAV, M4A, FLAC, or OGG)')
      return
    }

    // Validate file size (50MB)
    const maxSize = 50 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error('File size must be less than 50MB')
      return
    }

    setUploading(true)
    setPhase('uploading')
    setProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', file)

      // Upload and analyze
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to analyze audio')
      }

      setPhase('analyzing')
      setProgress(50)

      const data = await response.json()
      
      setPhase('complete')
      setProgress(100)
      
      toast.success('Analysis complete!')
      onAnalysisComplete(data.analysis)
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to analyze audio')
      setPhase('idle')
    } finally {
      setUploading(false)
    }
  }, [onAnalysisComplete])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.m4a', '.flac', '.ogg']
    },
    maxFiles: 1,
    disabled: uploading
  })

  return (
    <Card className="p-8">
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
          transition-all duration-200 
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}
          ${uploading ? 'pointer-events-none opacity-60' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        {uploading ? (
          <div className="space-y-4">
            <div className="flex justify-center">
              {phase === 'complete' ? (
                <CheckCircle className="h-16 w-16 text-green-500" />
              ) : (
                <Loader2 className="h-16 w-16 text-primary animate-spin" />
              )}
            </div>
            
            <div className="space-y-2">
              <p className="text-lg font-medium">
                {phase === 'uploading' && 'Uploading...'}
                {phase === 'analyzing' && 'Analyzing audio with AI...'}
                {phase === 'complete' && 'Analysis complete!'}
              </p>
              <p className="text-sm text-muted-foreground">
                {phase === 'uploading' && 'Please wait while we upload your file'}
                {phase === 'analyzing' && 'Detecting chords, key, and tempo'}
                {phase === 'complete' && 'Redirecting to results...'}
              </p>
            </div>
            
            <Progress value={progress} className="max-w-xs mx-auto" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center">
              {isDragActive ? (
                <Upload className="h-16 w-16 text-primary" />
              ) : (
                <Music className="h-16 w-16 text-muted-foreground" />
              )}
            </div>
            
            <div className="space-y-2">
              <p className="text-lg font-medium">
                {isDragActive ? 'Drop your audio file here' : 'Drag & drop your audio file'}
              </p>
              <p className="text-sm text-muted-foreground">
                or click to browse • MP3, WAV, M4A, FLAC, OGG • Max 50MB
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
} 