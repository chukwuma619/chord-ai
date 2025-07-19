"use client"

import { useState } from 'react'
import { AudioPlayer } from '@/components/audio/audio-player'
import { ChordTimeline } from '@/components/audio/chord-timeline'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface PreviewClientProps {
  analysis: any // Using any for now, should match database schema
}

export function PreviewClient({ analysis }: PreviewClientProps) {
  const [currentTime, setCurrentTime] = useState(0)

  return (
    <Tabs defaultValue="player" className="space-y-6">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="player">Player & Timeline</TabsTrigger>
        <TabsTrigger value="details">Chord Details</TabsTrigger>
      </TabsList>
      
      <TabsContent value="player" className="space-y-6">
        {/* Audio Player */}
        <AudioPlayer 
          audioUrl={analysis.audio_url} 
          onTimeUpdate={setCurrentTime}
        />
        
        {/* Chord Timeline */}
        <ChordTimeline 
          chords={analysis.chords}
          currentTime={currentTime}
          duration={180} // Should be calculated from audio
        />
      </TabsContent>
      
      <TabsContent value="details">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Chord Progression</h3>
          <div className="space-y-2">
            {analysis.chords.map((chord: any, index: number) => (
              <div 
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: `${chord.name.includes('#') ? '#CC5252' : '#FF6B6B'}` }}
                  />
                  <span className="font-medium">{chord.name}</span>
                  {chord.confidence && (
                    <span className="text-xs text-muted-foreground">
                      {Math.round(chord.confidence * 100)}% confidence
                    </span>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  {chord.time.toFixed(1)}s - {(chord.time + chord.duration).toFixed(1)}s
                </div>
              </div>
            ))}
          </div>
        </Card>
      </TabsContent>
    </Tabs>
  )
} 