"use client"

import { useEffect, useRef, useState } from 'react'
import WaveSurfer from 'wavesurfer.js'
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Card } from '@/components/ui/card'

interface AudioPlayerProps {
  audioUrl: string
  onTimeUpdate?: (time: number) => void
}

export function AudioPlayer({ audioUrl, onTimeUpdate }: AudioPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const wavesurferRef = useRef<WaveSurfer | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.5)

  useEffect(() => {
    if (!containerRef.current) return

    // Create WaveSurfer instance
    const wavesurfer = WaveSurfer.create({
      container: containerRef.current,
      waveColor: 'rgb(147, 51, 234)',
      progressColor: 'rgb(124, 58, 237)',
      cursorColor: 'rgb(239, 68, 68)',
      barWidth: 2,
      barRadius: 3,
      height: 80,
      normalize: true,
      backend: 'WebAudio',
    })

    wavesurferRef.current = wavesurfer

    // Load audio
    wavesurfer.load(audioUrl)

    // Event listeners
    wavesurfer.on('ready', () => {
      setDuration(wavesurfer.getDuration())
    })

    wavesurfer.on('audioprocess', () => {
      const time = wavesurfer.getCurrentTime()
      setCurrentTime(time)
      onTimeUpdate?.(time)
    })

    wavesurfer.on('play', () => setIsPlaying(true))
    wavesurfer.on('pause', () => setIsPlaying(false))

    return () => {
      wavesurfer.destroy()
    }
  }, [audioUrl, onTimeUpdate])

  const togglePlayPause = () => {
    wavesurferRef.current?.playPause()
  }

  const handleSkipBack = () => {
    const newTime = Math.max(0, currentTime - 10)
    wavesurferRef.current?.seekTo(newTime / duration)
  }

  const handleSkipForward = () => {
    const newTime = Math.min(duration, currentTime + 10)
    wavesurferRef.current?.seekTo(newTime / duration)
  }

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0]
    setVolume(newVolume)
    wavesurferRef.current?.setVolume(newVolume)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <Card className="p-6 w-full">
      <div className="space-y-4">
        {/* Waveform */}
        <div ref={containerRef} className="w-full" />

        {/* Time display */}
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={handleSkipBack}
            className="h-8 w-8"
          >
            <SkipBack className="h-4 w-4" />
          </Button>
          
          <Button
            size="icon"
            onClick={togglePlayPause}
            className="h-10 w-10"
          >
            {isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5 ml-0.5" />
            )}
          </Button>
          
          <Button
            size="icon"
            variant="ghost"
            onClick={handleSkipForward}
            className="h-8 w-8"
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>

        {/* Volume control */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Volume</span>
          <Slider
            value={[volume]}
            onValueChange={handleVolumeChange}
            max={1}
            step={0.01}
            className="flex-1"
          />
        </div>
      </div>
    </Card>
  )
} 