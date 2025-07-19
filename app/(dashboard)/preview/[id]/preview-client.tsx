"use client"

import { useState } from 'react'
import { AudioPlayer } from '@/components/audio/audio-player'
import { ChordTimeline } from '@/components/audio/chord-timeline'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Download, Share2, Music2, ChevronLeft, ChevronRight, Youtube } from 'lucide-react'
import Link from 'next/link'
import { transposeChord, simplifyChord } from '@/lib/music-theory'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

interface Analysis {
  id: string
  filename: string
  key: string
  tempo: number
  chords: Array<{
    name: string
    time: number
    duration: number
    confidence: number
  }>
  audio_url: string
  youtube_url?: string
  created_at: string
}

interface PreviewClientProps {
  analysis: Analysis
}

export function PreviewClient({ analysis }: PreviewClientProps) {
  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(180) // Default duration
  const [loopStart, setLoopStart] = useState<number | null>(null)
  const [loopEnd, setLoopEnd] = useState<number | null>(null)
  const [transpose, setTranspose] = useState(0)
  const [capoPosition, setCapoPosition] = useState(0)
  const [showSimplified, setShowSimplified] = useState(false)

  // Transpose chords based on current settings
  const getTransposedChords = () => {
    const totalTranspose = transpose - capoPosition
    if (totalTranspose === 0 && !showSimplified) return analysis.chords
    
    return analysis.chords.map((chord) => {
      let chordName = chord.name
      
      // Apply transposition if needed
      if (totalTranspose !== 0) {
        chordName = transposeChord(chordName, totalTranspose)
      }
      
      // Apply simplification if enabled
      if (showSimplified) {
        chordName = simplifyChord(chordName)
      }
      
      return {
        ...chord,
        name: chordName
      }
    })
  }

  const transposedChords = getTransposedChords()

  const handleChordClick = (chordTime: number) => {
    // Seek to chord position when clicked
    // This would need to be connected to the audio player's seek function
    console.log('Seeking to:', chordTime)
  }

  const handleLoopSelection = () => {
    // Find current chord boundaries for loop points
    const currentChord = transposedChords.find(
      (chord) => currentTime >= chord.time && currentTime < chord.time + chord.duration
    )
    
    if (currentChord && !loopStart) {
      setLoopStart(currentChord.time)
    } else if (currentChord && loopStart && !loopEnd) {
      setLoopEnd(currentChord.time + currentChord.duration)
    } else {
      setLoopStart(null)
      setLoopEnd(null)
    }
  }

  const handleExport = (format: 'txt' | 'pdf') => {
    // Generate chord sheet content
    const content = generateChordSheet()
    
    if (format === 'txt') {
      // Create and download text file
      const blob = new Blob([content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${analysis.filename.replace(/\.[^/.]+$/, '')}_chords.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } else {
      // For PDF, we would need a library like jsPDF
      // For now, we'll use print functionality
      handlePrint()
    }
  }

  const generateChordSheet = () => {
    let content = `${analysis.filename}\n`
    content += `Key: ${analysis.key} | Tempo: ${analysis.tempo} BPM\n`
    
    if (transpose !== 0 || capoPosition !== 0) {
      const currentKey = transposeChord(analysis.key.split(' ')[0], transpose - capoPosition)
      content += `Transposed to: ${currentKey}${analysis.key.includes('minor') ? ' minor' : ' major'}`
      if (capoPosition > 0) content += ` | Capo: ${capoPosition}`
      content += '\n'
    }
    
    content += '\n--- Chord Progression ---\n\n'
    
    // Group chords by measures (approximate 4 chords per line)
    let line = ''
    let chordCount = 0
    
    transposedChords.forEach((chord, index: number) => {
      line += chord.name.padEnd(8)
      chordCount++
      
      if (chordCount === 8 || index === transposedChords.length - 1) {
        content += line.trim() + '\n'
        line = ''
        chordCount = 0
      }
    })
    
    content += '\n--- Detailed Timeline ---\n\n'
    transposedChords.forEach((chord) => {
      const startTime = `${Math.floor(chord.time / 60)}:${(Math.floor(chord.time) % 60).toString().padStart(2, '0')}`
      const endTime = `${Math.floor((chord.time + chord.duration) / 60)}:${(Math.floor(chord.time + chord.duration) % 60).toString().padStart(2, '0')}`
      content += `${chord.name.padEnd(8)} ${startTime} - ${endTime}\n`
    })
    
    return content
  }

  const handlePrint = () => {
    // Create a printable version of the chord sheet
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    
    const styles = `
      <style>
        body { font-family: monospace; padding: 20px; }
        h1 { font-size: 24px; margin-bottom: 10px; }
        .info { font-size: 14px; margin-bottom: 20px; }
        .chords { font-size: 16px; line-height: 2; }
        .timeline { font-size: 12px; margin-top: 30px; }
        @media print { body { padding: 10px; } }
      </style>
    `
    
    const content = generateChordSheet()
    const lines = content.split('\n')
    const title = lines[0]
    const info = lines.slice(1, lines.indexOf('--- Chord Progression ---')).join('<br>')
    const chordsStart = lines.indexOf('--- Chord Progression ---') + 2
    const timelineStart = lines.indexOf('--- Detailed Timeline ---')
    const chords = lines.slice(chordsStart, timelineStart - 1).join('<br>')
    const timeline = lines.slice(timelineStart + 2).join('<br>')
    
    printWindow.document.write(`
      <html>
        <head>
          <title>${title} - Chord Sheet</title>
          ${styles}
        </head>
        <body>
          <h1>${title}</h1>
          <div class="info">${info}</div>
          <div class="chords">${chords}</div>
          <div class="timeline">
            <h3>Detailed Timeline</h3>
            ${timeline}
          </div>
        </body>
      </html>
    `)
    
    printWindow.document.close()
    printWindow.print()
  }

  const handleShare = async () => {
    const shareData = {
      title: analysis.filename,
      text: `Check out the chords for ${analysis.filename} - Key: ${analysis.key}, Tempo: ${analysis.tempo} BPM`,
      url: window.location.href
    }
    
    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData)
      } catch {
        console.log('Share cancelled')
      }
    } else {
      // Fallback: copy link to clipboard
      navigator.clipboard.writeText(window.location.href)
      // You could show a toast notification here
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with song info and actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">{analysis.filename}</h2>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <span>Key: {analysis.key}</span>
            <span>•</span>
            <span>Tempo: {analysis.tempo} BPM</span>
            <span>•</span>
            <span>{transposedChords.length} chords</span>
            {analysis.youtube_url && (
              <>
                <span>•</span>
                <Link 
                  href={analysis.youtube_url} 
                  target="_blank" 
                  className="flex items-center gap-1 hover:text-foreground"
                >
                  <Youtube className="h-4 w-4" />
                  Source
                </Link>
              </>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('txt')}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="player" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="player">Player</TabsTrigger>
          <TabsTrigger value="practice">Practice</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>
        
        <TabsContent value="player" className="space-y-6">
          {/* Chord Timeline - Always visible at top */}
          <ChordTimeline 
            chords={transposedChords}
            currentTime={currentTime}
            isPlaying={isPlaying}
          />
          
          {/* Audio Player */}
          <AudioPlayer 
            audioUrl={analysis.audio_url} 
            onTimeUpdate={setCurrentTime}
            onPlayingChange={setIsPlaying}
            onDurationChange={setDuration}

            loopStart={loopStart || undefined}
            loopEnd={loopEnd || undefined}
            onLoopChange={(start, end) => {
              setLoopStart(start)
              setLoopEnd(end)
            }}
          />
        </TabsContent>
        
        <TabsContent value="practice" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Practice Tools</h3>
            <p className="text-sm text-muted-foreground mb-6">All features are completely free - no limitations!</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Transpose controls */}
              <div className="space-y-4">
                <div>
                  <Label>Transpose</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTranspose(transpose - 1)}
                      disabled={transpose <= -6}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex-1 text-center">
                      <span className="font-mono text-lg">
                        {transpose > 0 ? '+' : ''}{transpose}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTranspose(transpose + 1)}
                      disabled={transpose >= 6}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-2"
                    onClick={() => setTranspose(0)}
                  >
                    Reset
                  </Button>
                </div>

                {/* Capo position */}
                <div>
                  <Label>Capo Position</Label>
                  <Select 
                    value={capoPosition.toString()} 
                    onValueChange={(v) => setCapoPosition(parseInt(v))}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">No Capo</SelectItem>
                      {[1, 2, 3, 4, 5, 6, 7].map(fret => (
                        <SelectItem key={fret} value={fret.toString()}>
                          Fret {fret}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Loop controls */}
              <div className="space-y-4">
                <div>
                  <Label>Loop Section</Label>
                  <Button
                    variant="outline"
                    className="w-full mt-2"
                    onClick={handleLoopSelection}
                  >
                    {!loopStart ? 'Set Loop Start' : !loopEnd ? 'Set Loop End' : 'Clear Loop'}
                  </Button>
                  {loopStart && loopEnd && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Looping: {loopStart.toFixed(1)}s - {loopEnd.toFixed(1)}s
                    </p>
                  )}
                </div>

                {/* Chord simplification */}
                <div>
                  <Label>Chord Display</Label>
                  <Button
                    variant={showSimplified ? "default" : "outline"}
                    className="w-full mt-2"
                    onClick={() => setShowSimplified(!showSimplified)}
                  >
                    <Music2 className="h-4 w-4 mr-2" />
                    {showSimplified ? 'Simplified' : 'Full'} Chords
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Current key info */}
          {(transpose !== 0 || capoPosition !== 0) && (
            <Card className="p-4 bg-muted/50">
              <p className="text-sm text-center">
                Original Key: <span className="font-semibold">{analysis.key}</span>
                {' → '}
                Current Key: <span className="font-semibold">
                  {transposeChord(analysis.key.split(' ')[0], transpose - capoPosition)} 
                  {analysis.key.includes('minor') ? ' minor' : ' major'}
                </span>
              </p>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="details">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Chord Progression Details</h3>
            <div className="space-y-2">
              {transposedChords.map((chord, index: number) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                  onClick={() => handleChordClick(chord.time)}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: `${chord.name.includes('#') ? '#CC5252' : '#FF6B6B'}` }}
                    />
                    <span className="font-medium font-mono">{chord.name}</span>
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
            
            {/* Song statistics */}
            <div className="mt-6 pt-6 border-t">
              <h4 className="font-medium mb-3">Song Statistics</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Total Duration:</span>
                  <span className="ml-2 font-medium">
                    {Math.floor(duration / 60)}:{(Math.floor(duration) % 60).toString().padStart(2, '0')}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Unique Chords:</span>
                  <span className="ml-2 font-medium">
                    {new Set(transposedChords.map((c) => c.name)).size}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Average Confidence:</span>
                  <span className="ml-2 font-medium">
                    {Math.round(
                      transposedChords.reduce((acc: number, c) => acc + c.confidence, 0) / 
                      transposedChords.length * 100
                    )}%
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Changes per Minute:</span>
                  <span className="ml-2 font-medium">
                    {Math.round(transposedChords.length / (duration / 60))}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 