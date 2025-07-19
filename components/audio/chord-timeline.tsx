"use client"

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Chord } from '@/lib/types'
import { getChordColor, formatChordName } from '@/lib/music-theory'

interface ChordTimelineProps {
  chords: Chord[]
  currentTime: number
  duration: number
}

export function ChordTimeline({ chords, currentTime, duration }: ChordTimelineProps) {
  const [view, setView] = useState<'timeline' | 'piano' | 'guitar'>('timeline')
  const timelineRef = useRef<HTMLDivElement>(null)

  const getCurrentChord = () => {
    return chords.find(
      chord => currentTime >= chord.time && currentTime < chord.time + chord.duration
    )
  }

  const currentChord = getCurrentChord()

  // Timeline View
  const TimelineView = () => (
    <div className="relative h-32 bg-muted/20 rounded-lg overflow-hidden">
      <div className="absolute inset-0 flex items-center">
        {chords.map((chord, index) => {
          const width = (chord.duration / duration) * 100
          const left = (chord.time / duration) * 100
          const isActive = currentChord?.name === chord.name && 
                          currentTime >= chord.time && 
                          currentTime < chord.time + chord.duration

          return (
            <motion.div
              key={`${chord.name}-${index}`}
              className="absolute h-20 flex items-center justify-center"
              style={{
                left: `${left}%`,
                width: `${width}%`,
                backgroundColor: getChordColor(chord.name),
                opacity: isActive ? 1 : 0.6,
              }}
              initial={{ scale: 1 }}
              animate={{ scale: isActive ? 1.05 : 1 }}
              transition={{ duration: 0.2 }}
            >
              <span className="text-white font-semibold text-sm">
                {formatChordName(chord.name)}
              </span>
            </motion.div>
          )
        })}
      </div>
      
      {/* Playhead */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-red-500"
        style={{ left: `${(currentTime / duration) * 100}%` }}
      />
    </div>
  )

  // Piano Roll View
  const PianoView = () => {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    
    return (
      <div className="relative h-48 bg-muted/20 rounded-lg overflow-hidden">
        <div className="absolute inset-0 flex flex-col">
          {notes.reverse().map((note) => (
            <div
              key={note}
              className="flex-1 border-b border-muted flex items-center"
            >
              <div className="w-12 px-2 text-xs font-medium">
                {note}
              </div>
              <div className="flex-1 relative">
                {chords.map((chord, index) => {
                  if (!chord.name.startsWith(note)) return null
                  
                  const width = (chord.duration / duration) * 100
                  const left = (chord.time / duration) * 100
                  const isActive = currentChord?.name === chord.name && 
                                  currentTime >= chord.time && 
                                  currentTime < chord.time + chord.duration

                  return (
                    <motion.div
                      key={`${chord.name}-${index}`}
                      className="absolute h-3 rounded"
                      style={{
                        left: `${left}%`,
                        width: `${width}%`,
                        backgroundColor: getChordColor(chord.name),
                        opacity: isActive ? 1 : 0.6,
                        top: '50%',
                        transform: 'translateY(-50%)'
                      }}
                      initial={{ scale: 1 }}
                      animate={{ scale: isActive ? 1.1 : 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  )
                })}
              </div>
            </div>
          ))}
        </div>
        
        {/* Playhead */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-red-500"
          style={{ left: `calc(48px + ${(currentTime / duration) * (100 - 48 / timelineRef.current?.offsetWidth * 100)}%)` }}
        />
      </div>
    )
  }

  // Guitar Tab View (simplified)
  const GuitarView = () => {
    const strings = ['E', 'B', 'G', 'D', 'A', 'E']
    
    return (
      <div className="relative h-48 bg-muted/20 rounded-lg overflow-hidden p-4">
        <div className="absolute inset-4 flex flex-col justify-between">
          {strings.map((string, idx) => (
            <div key={idx} className="h-0.5 bg-muted-foreground/30" />
          ))}
        </div>
        
        <div className="relative h-full flex items-center justify-center">
          {currentChord && (
            <motion.div
              key={currentChord.name}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-4xl font-bold"
              style={{ color: getChordColor(currentChord.name) }}
            >
              {formatChordName(currentChord.name)}
            </motion.div>
          )}
        </div>
      </div>
    )
  }

  return (
    <Card className="p-6 w-full">
      <Tabs value={view} onValueChange={(v) => setView(v as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="piano">Piano Roll</TabsTrigger>
          <TabsTrigger value="guitar">Guitar Tab</TabsTrigger>
        </TabsList>
        
        <TabsContent value="timeline" className="mt-4">
          <div ref={timelineRef}>
            <TimelineView />
          </div>
        </TabsContent>
        
        <TabsContent value="piano" className="mt-4">
          <PianoView />
        </TabsContent>
        
        <TabsContent value="guitar" className="mt-4">
          <GuitarView />
        </TabsContent>
      </Tabs>
      
      {/* Current chord display */}
      <div className="mt-4 text-center">
        <p className="text-sm text-muted-foreground">Current Chord</p>
        <p className="text-2xl font-bold" style={{ color: currentChord ? getChordColor(currentChord.name) : undefined }}>
          {currentChord ? formatChordName(currentChord.name) : '-'}
        </p>
        {currentChord && (
          <p className="text-xs text-muted-foreground mt-1">
            Confidence: {Math.round(currentChord.confidence * 100)}%
          </p>
        )}
      </div>
    </Card>
  )
} 