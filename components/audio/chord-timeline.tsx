"use client"

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

import { Badge } from '@/components/ui/badge'
import { Chord } from '@/lib/types'
import { formatChordName, getChordDiagram, getPianoChordDiagram, simplifyChord } from '@/lib/music-theory'
import type { ChordDiagram, PianoChordDiagram } from '@/lib/music-theory'
import { Music, Guitar, Piano, RotateCcw, Settings, Zap } from 'lucide-react'

interface ChordTimelineProps {
  chords: Chord[]
  currentTime: number
  isPlaying?: boolean
}

// Guitar Chord Diagram Component
function GuitarChordDiagram({ chord, isActive = false }: { chord: ChordDiagram; isActive?: boolean }) {
  const strings = 6
  const frets = 5
  const baseFret = chord.baseFret || 1

  return (
    <div className={`relative w-16 h-20 ${isActive ? 'scale-110' : ''} transition-transform duration-200`}>
      {/* Fret markers */}
      <div className="absolute inset-0">
        {/* Strings (vertical lines) */}
        {Array.from({ length: strings }, (_, i) => (
          <div
            key={`string-${i}`}
            className="absolute bg-gray-400"
            style={{
              left: `${(i * 100) / (strings - 1)}%`,
              top: '10px',
              bottom: '15px',
              width: '1px',
              transform: 'translateX(-0.5px)'
            }}
          />
        ))}
        
        {/* Frets (horizontal lines) */}
        {Array.from({ length: frets }, (_, i) => (
          <div
            key={`fret-${i}`}
            className="absolute bg-gray-400"
            style={{
              top: `${10 + (i * 50) / frets}px`,
              left: '0',
              right: '0',
              height: '1px'
            }}
          />
        ))}
        
        {/* Nut (top thick line) */}
        <div className="absolute bg-gray-600 h-0.5 left-0 right-0 top-2.5" />
      </div>

      {/* Finger positions */}
      {chord.frets.map((fret, stringIndex) => {
        if (fret === -1) {
          // Muted string (X)
          return (
            <div
              key={`muted-${stringIndex}`}
              className="absolute text-xs font-bold text-gray-500 flex items-center justify-center"
              style={{
                left: `${(stringIndex * 100) / (strings - 1)}%`,
                top: '-5px',
                width: '8px',
                height: '8px',
                transform: 'translateX(-4px)'
              }}
            >
              ×
            </div>
          )
        } else if (fret === 0) {
          // Open string (O)
          return (
            <div
              key={`open-${stringIndex}`}
              className="absolute text-xs font-bold text-gray-600 flex items-center justify-center"
              style={{
                left: `${(stringIndex * 100) / (strings - 1)}%`,
                top: '-5px',
                width: '8px',
                height: '8px',
                transform: 'translateX(-4px)'
              }}
            >
              ○
            </div>
          )
        } else {
          // Fretted note
          const fretPosition = fret - baseFret + 1
          return (
            <div
              key={`fret-${stringIndex}`}
              className="absolute w-3 h-3 bg-gray-800 rounded-full border-2 border-white"
              style={{
                left: `${(stringIndex * 100) / (strings - 1)}%`,
                top: `${10 + ((fretPosition - 0.5) * 50) / frets}px`,
                transform: 'translate(-6px, -6px)'
              }}
            />
          )
        }
      })}

      {/* Base fret indicator */}
      {baseFret > 1 && (
        <div className="absolute -left-3 top-4 text-xs text-gray-600 font-semibold">
          {baseFret}
        </div>
      )}
    </div>
  )
}

// Piano Chord Diagram Component
function PianoChordDiagram({ chord, isActive = false }: { chord: PianoChordDiagram; isActive?: boolean }) {
  const whiteKeys = [0, 2, 4, 5, 7, 9, 11] // C, D, E, F, G, A, B
  
  const isKeyPressed = (keyIndex: number) => chord.keys.includes(keyIndex)
  
  return (
    <div className={`relative w-32 h-20 ${isActive ? 'scale-110' : ''} transition-transform duration-200`}>
      {/* White keys */}
      <div className="flex absolute bottom-0 left-0 right-0">
        {whiteKeys.map((keyIndex) => (
          <div
            key={`white-${keyIndex}`}
            className={`flex-1 h-16 border border-gray-400 ${
              isKeyPressed(keyIndex) 
                ? 'bg-blue-500 border-blue-600' 
                : 'bg-white'
            } flex items-end justify-center pb-1`}
            style={{ 
              borderRadius: '0 0 3px 3px',
              minWidth: '18px'
            }}
          >
            {isKeyPressed(keyIndex) && (
              <div className="w-2 h-2 bg-white rounded-full opacity-80"></div>
            )}
          </div>
        ))}
      </div>
      
      {/* Black keys */}
      <div className="absolute top-0 left-0 right-0 flex">
        {/* C# */}
        <div 
          className={`absolute h-10 w-3 ${
            isKeyPressed(1) ? 'bg-blue-600' : 'bg-gray-800'
          } border border-gray-900`}
          style={{ 
            left: '12px',
            borderRadius: '0 0 2px 2px'
          }}
        >
          {isKeyPressed(1) && (
            <div className="w-1 h-1 bg-white rounded-full mx-auto mt-7"></div>
          )}
        </div>
        
        {/* D# */}
        <div 
          className={`absolute h-10 w-3 ${
            isKeyPressed(3) ? 'bg-blue-600' : 'bg-gray-800'
          } border border-gray-900`}
          style={{ 
            left: '30px',
            borderRadius: '0 0 2px 2px'
          }}
        >
          {isKeyPressed(3) && (
            <div className="w-1 h-1 bg-white rounded-full mx-auto mt-7"></div>
          )}
        </div>
        
        {/* F# */}
        <div 
          className={`absolute h-10 w-3 ${
            isKeyPressed(6) ? 'bg-blue-600' : 'bg-gray-800'
          } border border-gray-900`}
          style={{ 
            left: '66px',
            borderRadius: '0 0 2px 2px'
          }}
        >
          {isKeyPressed(6) && (
            <div className="w-1 h-1 bg-white rounded-full mx-auto mt-7"></div>
          )}
        </div>
        
        {/* G# */}
        <div 
          className={`absolute h-10 w-3 ${
            isKeyPressed(8) ? 'bg-blue-600' : 'bg-gray-800'
          } border border-gray-900`}
          style={{ 
            left: '84px',
            borderRadius: '0 0 2px 2px'
          }}
        >
          {isKeyPressed(8) && (
            <div className="w-1 h-1 bg-white rounded-full mx-auto mt-7"></div>
          )}
        </div>
        
        {/* A# */}
        <div 
          className={`absolute h-10 w-3 ${
            isKeyPressed(10) ? 'bg-blue-600' : 'bg-gray-800'
          } border border-gray-900`}
          style={{ 
            left: '102px',
            borderRadius: '0 0 2px 2px'
          }}
        >
          {isKeyPressed(10) && (
            <div className="w-1 h-1 bg-white rounded-full mx-auto mt-7"></div>
          )}
        </div>
      </div>
    </div>
  )
}

export function ChordTimeline({ chords, currentTime, isPlaying = false }: ChordTimelineProps) {
  const [selectedInstrument, setSelectedInstrument] = useState<'guitar' | 'piano'>('guitar')
  const [showAnimated, setShowAnimated] = useState(true)
  const [showSummary, setShowSummary] = useState(false)
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

  // Get unique chords for summary view
  const uniqueChords = Array.from(new Set(chords.map(c => simplifyChord(c.name))))
    .map(chordName => {
      const firstOccurrence = chords.find(c => simplifyChord(c.name) === chordName)
      return firstOccurrence ? { ...firstOccurrence, name: chordName } : null
    })
    .filter(Boolean) as Chord[]

  return (
    <div className="w-full">
      {/* Header Controls */}
      <div className="flex items-center justify-between mb-6 px-4">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold">Chords</h3>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            <Zap className="h-3 w-3" />
            100% 
          </Badge>
          <Badge variant="outline">
            111 BPM
          </Badge>
        </div>
      </div>

      {/* Instrument Tabs */}
      <div className="flex items-center gap-1 mb-4 px-4">
        {[
          { id: 'guitar', label: 'Guitar', icon: Guitar },
          { id: 'piano', label: 'Piano', icon: Piano }
        ].map(({ id, label, icon: Icon }) => (
          <Button
            key={id}
            variant={selectedInstrument === id ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSelectedInstrument(id as 'guitar' | 'piano')}
            className="gap-2"
          >
            <Icon className="h-4 w-4" />
            {label}
          </Button>
        ))}
        
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant={showAnimated ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setShowAnimated(!showAnimated)}
          >
            Animated
          </Button>
          <Button
            variant={showSummary ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setShowSummary(!showSummary)}
          >
            Summary
          </Button>
        </div>
      </div>

            {/* Main Chord Display */}
      <Card className="bg-gray-50 overflow-visible">
        <div className="p-6">
          {showSummary ? (
            // Summary View - All unique chords
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
              {uniqueChords.map((chord, index) => {
                const guitarDiagram = getChordDiagram(chord.name)
                const pianoDiagram = getPianoChordDiagram(chord.name)
                return (
                  <div key={`summary-${chord.name}-${index}`} className="text-center">
                    <div className="mb-4 flex justify-center min-h-[5rem]">
                      {selectedInstrument === 'guitar' && guitarDiagram ? (
                        <GuitarChordDiagram chord={guitarDiagram} />
                      ) : selectedInstrument === 'piano' && pianoDiagram ? (
                        <PianoChordDiagram chord={pianoDiagram} />
                      ) : (
                        <div className="w-16 h-20 bg-gray-200 rounded border-2 flex items-center justify-center">
                          <Music className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="font-bold text-lg">{formatChordName(chord.name)}</div>
                  </div>
                )
              })}
            </div>
          ) : (
            // Timeline View - Scrolling chords
            <div className="py-4">
              {/* Chord Timeline */}
              <div 
                ref={scrollRef}
                className="flex gap-8 overflow-x-auto scrollbar-hide py-6 px-4"
                style={{ scrollBehavior: 'smooth' }}
              >
                {chords.map((chord, index) => {
                  const isActive = currentChord?.name === chord.name && 
                                  currentTime >= chord.time && 
                                  currentTime < chord.time + chord.duration
                  const isPast = currentTime > chord.time + chord.duration
                  const guitarDiagram = getChordDiagram(simplifyChord(chord.name))
                  const pianoDiagram = getPianoChordDiagram(simplifyChord(chord.name))
                  
                  return (
                    <motion.div
                      key={`chord-${index}-${chord.time}`}
                      className={`flex-shrink-0 text-center transition-all duration-300 ${
                        isActive ? 'scale-110' : isPast ? 'opacity-60' : ''
                      }`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      style={{ minWidth: '120px' }}
                    >
                      {/* Chord Diagram */}
                      <div className={`mb-4 flex justify-center min-h-[5rem] ${isActive ? 'ring-2 ring-blue-500 ring-offset-4 rounded-lg p-2' : ''}`}>
                        {selectedInstrument === 'guitar' && guitarDiagram ? (
                          <GuitarChordDiagram chord={guitarDiagram} isActive={isActive} />
                        ) : selectedInstrument === 'piano' && pianoDiagram ? (
                          <PianoChordDiagram chord={pianoDiagram} isActive={isActive} />
                        ) : (
                          <div className="w-16 h-20 bg-white border-2 border-gray-300 rounded flex items-center justify-center">
                            <Music className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      {/* Chord Name */}
                      <div className={`font-bold text-lg ${isActive ? 'text-blue-600' : 'text-gray-800'}`}>
                        {formatChordName(simplifyChord(chord.name))}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Current Chord Indicator */}
      <AnimatePresence mode="wait">
        {currentChord && !showSummary && (
          <motion.div
            key={currentChord.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 text-center"
          >
            <div className="text-sm text-gray-600 mb-1">Now Playing</div>
            <div className="text-2xl font-bold text-blue-600">
              {formatChordName(simplifyChord(currentChord.name))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 