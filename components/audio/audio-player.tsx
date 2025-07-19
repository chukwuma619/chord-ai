"use client"

import { useEffect, useRef, useState } from 'react'
import WaveSurfer from 'wavesurfer.js'
import { Play, Pause, SkipBack, SkipForward, Volume2, Repeat, Gauge, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

interface AudioPlayerProps {
  audioUrl: string
  onTimeUpdate?: (time: number) => void
  onPlayingChange?: (playing: boolean) => void
  onDurationChange?: (duration: number) => void
  onSeekReady?: (seekFn: (time: number) => void) => void
  loopStart?: number
  loopEnd?: number
  onLoopChange?: (start: number | null, end: number | null) => void
}

export function AudioPlayer({ 
  audioUrl, 
  onTimeUpdate, 
  onPlayingChange,
  onDurationChange,
  onSeekReady,
  loopStart,
  loopEnd,
  onLoopChange
}: AudioPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const wavesurferRef = useRef<WaveSurfer | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.7)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [isLooping, setIsLooping] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const loopIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!containerRef.current || !audioUrl) return

    setIsLoading(true)
    setError(null)

    // Create WaveSurfer instance with enhanced options
    const wavesurfer = WaveSurfer.create({
      container: containerRef.current,
      waveColor: 'rgb(147, 51, 234)',
      progressColor: 'rgb(124, 58, 237)',
      cursorColor: 'rgb(239, 68, 68)',
      barWidth: 2,
      barRadius: 3,
      height: 100,
      normalize: true,
      backend: 'WebAudio',
      interact: true,
      dragToSeek: true,
      autoplay: false,
      hideScrollbar: false,
      // Add CORS configuration
      fetchParams: {
        mode: 'cors',
        credentials: 'omit',
      }
    })

    wavesurferRef.current = wavesurfer

    // Enhanced error handling
    wavesurfer.on('error', (error) => {
      console.error('WaveSurfer error:', error)
      setError(`Audio loading failed: ${error.message || 'Unknown error'}`)
      setIsLoading(false)
      toast.error('Failed to load audio file')
    })

    // Load audio with better error handling
    try {
      console.log('Loading audio from URL:', audioUrl)
      wavesurfer.load(audioUrl)
    } catch (error) {
      console.error('Failed to load audio:', error)
      setError('Failed to load audio file')
      setIsLoading(false)
    }

    // Event listeners
    wavesurfer.on('ready', () => {
      console.log('Audio ready, duration:', wavesurfer.getDuration())
      const dur = wavesurfer.getDuration()
      setDuration(dur)
      onDurationChange?.(dur)
      wavesurfer.setVolume(volume)
      setIsLoading(false)
      setError(null)
    })

    wavesurfer.on('loading', (percent) => {
      console.log('Loading progress:', percent + '%')
    })

    wavesurfer.on('audioprocess', () => {
      const time = wavesurfer.getCurrentTime()
      setCurrentTime(time)
      onTimeUpdate?.(time)
      
      // Handle looping
      if (isLooping && loopEnd && time >= loopEnd && loopStart !== undefined) {
        wavesurfer.seekTo(loopStart / duration)
      }
    })

    wavesurfer.on('play', () => {
      console.log('Audio started playing')
      setIsPlaying(true)
      onPlayingChange?.(true)
    })
    
    wavesurfer.on('pause', () => {
      console.log('Audio paused')
      setIsPlaying(false)
      onPlayingChange?.(false)
    })

    wavesurfer.on('seeking', () => {
      const time = wavesurfer.getCurrentTime()
      setCurrentTime(time)
      onTimeUpdate?.(time)
    })

    // Test audio URL accessibility
    fetch(audioUrl, { 
      method: 'HEAD',
      mode: 'cors',
      credentials: 'omit'
    })
      .then(response => {
        console.log('Audio URL test response:', response.status, response.statusText)
        if (!response.ok) {
          setError(`Audio file not accessible: ${response.status} ${response.statusText}`)
          setIsLoading(false)
        }
      })
      .catch(error => {
        console.error('Audio URL test failed:', error)
        setError(`Cannot access audio file: ${error.message}`)
        setIsLoading(false)
      })

    return () => {
      console.log('Cleaning up WaveSurfer')
      wavesurfer.destroy()
      if (loopIntervalRef.current) {
        clearInterval(loopIntervalRef.current)
      }
    }
  }, [audioUrl, onTimeUpdate, onPlayingChange, onDurationChange])

  // Handle playback rate changes
  useEffect(() => {
    if (wavesurferRef.current) {
      wavesurferRef.current.setPlaybackRate(playbackRate)
    }
  }, [playbackRate])

  // Handle loop changes
  useEffect(() => {
    setIsLooping(!!loopStart && !!loopEnd)
  }, [loopStart, loopEnd])

  // Expose seek function to parent when ready
  useEffect(() => {
    if (onSeekReady && wavesurferRef.current && duration > 0) {
      onSeekReady(handleSeek)
    }
  }, [onSeekReady, duration])

  const togglePlayPause = async () => {
    if (!wavesurferRef.current) return

    try {
      await wavesurferRef.current.playPause()
    } catch (error) {
      console.error('Play/pause error:', error)
      toast.error('Failed to play audio')
    }
  }

  const handleSkipBack = () => {
    const newTime = Math.max(0, currentTime - 10)
    wavesurferRef.current?.seekTo(newTime / duration)
  }

  const handleSkipForward = () => {
    const newTime = Math.min(duration, currentTime + 10)
    wavesurferRef.current?.seekTo(newTime / duration)
  }

  const handleSeek = (time: number) => {
    if (!wavesurferRef.current || duration === 0) return
    const normalizedTime = Math.max(0, Math.min(time, duration))
    wavesurferRef.current.seekTo(normalizedTime / duration)
  }

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0]
    setVolume(newVolume)
    wavesurferRef.current?.setVolume(newVolume)
  }

  const handlePlaybackRateChange = (value: string) => {
    const rate = parseFloat(value)
    setPlaybackRate(rate)
  }

  const toggleLoop = () => {
    if (isLooping) {
      onLoopChange?.(null, null)
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 text-red-500">
          <AlertCircle className="h-5 w-5" />
          <div>
            <p className="font-medium">Audio Error</p>
            <p className="text-sm text-muted-foreground">{error}</p>
            <p className="text-xs text-muted-foreground mt-1">URL: {audioUrl}</p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6 space-y-6">
      {/* Waveform Container */}
      <div className="relative">
        <div 
          ref={containerRef} 
          className={`w-full ${isLoading ? 'opacity-50' : ''}`}
        />
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
              Loading audio...
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSkipBack}
            disabled={isLoading}
          >
            <SkipBack className="h-4 w-4" />
          </Button>
          
          <Button
            onClick={togglePlayPause}
            disabled={isLoading}
            className="h-10 w-10"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleSkipForward}
            disabled={isLoading}
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <span>/</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Advanced Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Volume Control */}
        <div className="space-y-2">
          <Label className="text-sm flex items-center gap-2">
            <Volume2 className="h-4 w-4" />
            Volume
          </Label>
          <Slider
            value={[volume]}
            onValueChange={handleVolumeChange}
            max={1}
            step={0.1}
            className="w-full"
            disabled={isLoading}
          />
        </div>

        {/* Playback Speed */}
        <div className="space-y-2">
          <Label className="text-sm flex items-center gap-2">
            <Gauge className="h-4 w-4" />
            Speed
          </Label>
          <Select value={playbackRate.toString()} onValueChange={handlePlaybackRateChange} disabled={isLoading}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0.5">0.5x</SelectItem>
              <SelectItem value="0.75">0.75x</SelectItem>
              <SelectItem value="1">1x</SelectItem>
              <SelectItem value="1.25">1.25x</SelectItem>
              <SelectItem value="1.5">1.5x</SelectItem>
              <SelectItem value="2">2x</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Loop Control */}
        <div className="space-y-2">
          <Label className="text-sm flex items-center gap-2">
            <Repeat className="h-4 w-4" />
            Loop Section
          </Label>
          <Button
            variant={isLooping ? "default" : "outline"}
            onClick={toggleLoop}
            className="w-full"
            disabled={isLoading || !loopStart || !loopEnd}
          >
            {isLooping ? "Disable Loop" : "Enable Loop"}
          </Button>
        </div>
      </div>

      {/* Debug Info (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <details className="text-xs text-muted-foreground">
          <summary className="cursor-pointer">Debug Info</summary>
          <div className="mt-2 space-y-1">
            <p>Audio URL: {audioUrl}</p>
            <p>Duration: {duration}s</p>
            <p>Current Time: {currentTime}s</p>
            <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
            <p>Playing: {isPlaying ? 'Yes' : 'No'}</p>
          </div>
        </details>
      )}
    </Card>
  )
} 