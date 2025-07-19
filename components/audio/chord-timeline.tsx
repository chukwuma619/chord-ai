"use client"

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Chord } from '@/lib/types'
import { getChordColor, formatChordName, getChordDiagram } from '@/lib/music-theory'
import { Music, Eye, EyeOff, Maximize2, Minimize2 } from 'lucide-react'

interface ChordTimelineProps {
  chords: Chord[]
  currentTime: number
  duration: number
  isPlaying?: boolean
}

export function ChordTimeline({ chords, currentTime, duration, isPlaying = false }: ChordTimelineProps) {
  const [view, setView] = useState<'chords' | 'overview'>('chords')
  const [showDiagrams, setShowDiagrams] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const timelineRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll timeline to keep current chord in view
  useEffect(() => {
    if (scrollRef.current && isPlaying) {
      const currentChordIndex = chords.findIndex(
        chord => currentTime >= chord.time && currentTime < chord.time + chord.duration
      )
      
      if (currentChordIndex !== -1) {
        const chordElement = scrollRef.current.children[currentChordIndex] as HTMLElement
        if (chordElement) {
          chordElement.scrollIntoView({ 
            behavior: 'smooth', 
            inline: 'center',
            block: 'nearest'
          })
        }
      }
    }
  }, [currentTime, chords, isPlaying])

  const getCurrentChord = () => {
    return chords.find(
      chord => currentTime >= chord.time && currentTime < chord.time + chord.duration
    )
  }

  const currentChord = getCurrentChord()

  // Chord Diagrams View (Chordify-style)
  const ChordsView = () => (
    <div className="relative">
      {/* Chord strip with diagrams */}
      <div 
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 px-4"
        style={{ scrollBehavior: 'smooth' }}
      >
        {chords.map((chord, index) => {
          const isActive = currentChord?.name === chord.name && 
                          currentTime >= chord.time && 
                          currentTime < chord.time + chord.duration
          const isPast = currentTime > chord.time + chord.duration
          
          return (
            <motion.div
              key={`${chord.name}-${index}-${chord.time}`}
              className={`flex-shrink-0 transition-all duration-300 ${
                isActive ? 'scale-110' : ''
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card 
                className={`p-4 transition-all duration-300 ${
                  isActive 
                    ? 'ring-2 ring-primary shadow-lg bg-primary/5' 
                    : isPast 
                      ? 'opacity-50' 
                      : 'hover:shadow-md'
                }`}
              >
                {showDiagrams ? (
                  <div className="w-24 h-32 flex flex-col items-center justify-between">
                    {/* Chord diagram placeholder */}
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center">
                        <Music className="h-12 w-12 text-muted-foreground mb-2" />
                        <p className="text-xs text-muted-foreground">Diagram</p>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-lg">{formatChordName(chord.name)}</p>
                      <p className="text-xs text-muted-foreground">
                        {Math.round(chord.confidence * 100)}%
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="w-20 h-20 flex items-center justify-center">
                    <p className="font-bold text-xl">{formatChordName(chord.name)}</p>
                  </div>
                )}
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Timeline progress bar */}
      <div className="relative h-2 bg-muted mt-4 rounded-full overflow-hidden">
        <motion.div
          className="absolute left-0 top-0 h-full bg-primary rounded-full"
          style={{ width: `${(currentTime / duration) * 100}%` }}
          transition={{ duration: 0.1 }}
        />
        
        {/* Chord markers */}
        {chords.map((chord, index) => (
          <div
            key={`marker-${index}`}
            className="absolute top-0 h-full w-px bg-border"
            style={{ left: `${(chord.time / duration) * 100}%` }}
          />
        ))}
      </div>

      {/* Time markers */}
      <div className="flex justify-between mt-1 px-1">
        <span className="text-xs text-muted-foreground">0:00</span>
        <span className="text-xs text-muted-foreground">
          {Math.floor(duration / 60)}:{(Math.floor(duration) % 60).toString().padStart(2, '0')}
        </span>
      </div>
    </div>
  )

  // Overview mode (just chord names in a grid)
  const OverviewMode = () => (
    <div className="grid grid-cols-8 md:grid-cols-12 gap-2 p-4">
      {chords.map((chord, index) => {
        const isActive = currentChord?.name === chord.name && 
                        currentTime >= chord.time && 
                        currentTime < chord.time + chord.duration
        
        return (
          <motion.div
            key={`overview-${index}`}
            className={`
              p-3 rounded-lg text-center font-mono font-semibold transition-all
              ${isActive 
                ? 'bg-primary text-primary-foreground scale-110 shadow-lg' 
                : 'bg-muted hover:bg-muted/80'
              }
            `}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.02 }}
          >
            {formatChordName(chord.name)}
          </motion.div>
        )
      })}
    </div>
  )

  return (
    <Card className={`w-full ${isFullscreen ? 'fixed inset-0 z-50' : ''}`} ref={containerRef}>
      <div className="p-6">
        {/* Header with controls */}
        <div className="flex items-center justify-between mb-4">
          <Tabs value={view} onValueChange={(v) => setView(v as any)} className="w-auto">
            <TabsList>
              <TabsTrigger value="chords">Chord View</TabsTrigger>
              <TabsTrigger value="overview">Overview</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex items-center gap-2">
            {view === 'chords' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDiagrams(!showDiagrams)}
              >
                {showDiagrams ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                <span className="ml-2 hidden sm:inline">
                  {showDiagrams ? 'Hide' : 'Show'} Diagrams
                </span>
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        
        <TabsContent value="chords" className="mt-0">
          <ChordsView />
        </TabsContent>
        
        <TabsContent value="overview" className="mt-0">
          <OverviewMode />
        </TabsContent>
        
        {/* Current chord display */}
        <AnimatePresence mode="wait">
          {currentChord && (
            <motion.div
              key={currentChord.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-6 text-center p-4 bg-muted/30 rounded-lg"
            >
              <p className="text-sm text-muted-foreground mb-1">Now Playing</p>
              <p className="text-3xl font-bold" style={{ color: getChordColor(currentChord.name) }}>
                {formatChordName(currentChord.name)}
              </p>
              <div className="flex items-center justify-center gap-4 mt-2">
                <span className="text-sm text-muted-foreground">
                  Confidence: {Math.round(currentChord.confidence * 100)}%
                </span>
                <span className="text-sm text-muted-foreground">
                  Duration: {currentChord.duration.toFixed(1)}s
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  )
} 