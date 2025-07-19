// Music theory utilities for chord processing

export const CHORD_COLORS: Record<string, string> = {
  'C': '#FF6B6B',
  'C#': '#CC5252',
  'D': '#FFA06B',
  'D#': '#CC8052',
  'E': '#FFD56B',
  'F': '#6BFF6B',
  'F#': '#52CC52',
  'G': '#6BFFD5',
  'G#': '#52CCAA',
  'A': '#6B9FFF',
  'A#': '#527FCC',
  'B': '#D56BFF',
}

export const CHORD_PATTERNS = {
  major: [0, 4, 7],
  minor: [0, 3, 7],
  dim: [0, 3, 6],
  aug: [0, 4, 8],
  maj7: [0, 4, 7, 11],
  min7: [0, 3, 7, 10],
  dom7: [0, 4, 7, 10],
}

export function getChordColor(chord: string): string {
  const root = chord.replace(/[^A-G#]/g, '')
  return CHORD_COLORS[root] || '#808080'
}

export function formatChordName(chord: string): string {
  // Format chord names for display (e.g., "Cmaj7" -> "C maj7")
  return chord
    .replace(/maj/g, ' maj')
    .replace(/min/g, ' min')
    .replace(/dim/g, ' dim')
    .replace(/aug/g, ' aug')
    .replace(/dom/g, ' dom')
    .trim()
}

export function transposeChord(chord: string, semitones: number): string {
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  const root = chord.match(/^[A-G]#?/)?.[0] || 'C'
  const suffix = chord.slice(root.length)
  
  const currentIndex = notes.indexOf(root)
  const newIndex = (currentIndex + semitones + 12) % 12
  
  return notes[newIndex] + suffix
}

// Chord diagram data structure
export interface ChordDiagram {
  name: string
  frets: number[] // -1 for muted, 0 for open, 1-n for fret positions
  fingers?: number[] // Optional finger positions
  baseFret?: number // Starting fret if not 1
}

// Piano chord diagram data structure
export interface PianoChordDiagram {
  name: string
  keys: number[] // Array of key indices (0 = C, 1 = C#, 2 = D, etc.)
  octave?: number // Base octave (default 4)
}

// Common guitar chord diagrams
export const GUITAR_CHORDS: Record<string, ChordDiagram> = {
  'C': { name: 'C', frets: [-1, 3, 2, 0, 1, 0] },
  'C#': { name: 'C#', frets: [-1, -1, 3, 1, 2, 1], baseFret: 1 },
  'D': { name: 'D', frets: [-1, -1, 0, 2, 3, 2] },
  'D#': { name: 'D#', frets: [-1, -1, 1, 3, 4, 3], baseFret: 1 },
  'E': { name: 'E', frets: [0, 2, 2, 1, 0, 0] },
  'F': { name: 'F', frets: [1, 3, 3, 2, 1, 1], baseFret: 1 },
  'F#': { name: 'F#', frets: [2, 4, 4, 3, 2, 2], baseFret: 1 },
  'G': { name: 'G', frets: [3, 2, 0, 0, 3, 3] },
  'G#': { name: 'G#', frets: [4, 6, 6, 5, 4, 4], baseFret: 1 },
  'A': { name: 'A', frets: [-1, 0, 2, 2, 2, 0] },
  'A#': { name: 'A#', frets: [-1, 1, 3, 3, 3, 1], baseFret: 1 },
  'B': { name: 'B', frets: [-1, 2, 4, 4, 4, 2], baseFret: 1 },
  'Am': { name: 'Am', frets: [-1, 0, 2, 2, 1, 0] },
  'A#m': { name: 'A#m', frets: [-1, 1, 3, 3, 2, 1], baseFret: 1 },
  'Bm': { name: 'Bm', frets: [-1, 2, 4, 4, 3, 2], baseFret: 1 },
  'Cm': { name: 'Cm', frets: [-1, 3, 5, 5, 4, 3], baseFret: 1 },
  'C#m': { name: 'C#m', frets: [-1, -1, 2, 1, 2, 0], baseFret: 1 },
  'Dm': { name: 'Dm', frets: [-1, -1, 0, 2, 3, 1] },
  'D#m': { name: 'D#m', frets: [-1, -1, 1, 3, 4, 2], baseFret: 1 },
  'Em': { name: 'Em', frets: [0, 2, 2, 0, 0, 0] },
  'Fm': { name: 'Fm', frets: [1, 3, 3, 1, 1, 1], baseFret: 1 },
  'F#m': { name: 'F#m', frets: [2, 4, 4, 2, 2, 2], baseFret: 1 },
  'Gm': { name: 'Gm', frets: [3, 5, 5, 3, 3, 3], baseFret: 1 },
  'G#m': { name: 'G#m', frets: [4, 6, 6, 4, 4, 4], baseFret: 1 },
}

// Common piano chord diagrams
export const PIANO_CHORDS: Record<string, PianoChordDiagram> = {
  'C': { name: 'C', keys: [0, 4, 7] }, // C, E, G
  'C#': { name: 'C#', keys: [1, 5, 8] }, // C#, F, G#
  'D': { name: 'D', keys: [2, 6, 9] }, // D, F#, A
  'D#': { name: 'D#', keys: [3, 7, 10] }, // D#, G, A#
  'E': { name: 'E', keys: [4, 8, 11] }, // E, G#, B
  'F': { name: 'F', keys: [5, 9, 0] }, // F, A, C
  'F#': { name: 'F#', keys: [6, 10, 1] }, // F#, A#, C#
  'G': { name: 'G', keys: [7, 11, 2] }, // G, B, D
  'G#': { name: 'G#', keys: [8, 0, 3] }, // G#, C, D#
  'A': { name: 'A', keys: [9, 1, 4] }, // A, C#, E
  'A#': { name: 'A#', keys: [10, 2, 5] }, // A#, D, F
  'B': { name: 'B', keys: [11, 3, 6] }, // B, D#, F#
  'Am': { name: 'Am', keys: [9, 0, 4] }, // A, C, E
  'A#m': { name: 'A#m', keys: [10, 1, 5] }, // A#, C#, F
  'Bm': { name: 'Bm', keys: [11, 2, 6] }, // B, D, F#
  'Cm': { name: 'Cm', keys: [0, 3, 7] }, // C, D#, G
  'C#m': { name: 'C#m', keys: [1, 4, 8] }, // C#, E, G#
  'Dm': { name: 'Dm', keys: [2, 5, 9] }, // D, F, A
  'D#m': { name: 'D#m', keys: [3, 6, 10] }, // D#, F#, A#
  'Em': { name: 'Em', keys: [4, 7, 11] }, // E, G, B
  'Fm': { name: 'Fm', keys: [5, 8, 0] }, // F, G#, C
  'F#m': { name: 'F#m', keys: [6, 9, 1] }, // F#, A, C#
  'Gm': { name: 'Gm', keys: [7, 10, 2] }, // G, A#, D
  'G#m': { name: 'G#m', keys: [8, 11, 3] }, // G#, B, D#
}

export function getChordDiagram(chordName: string): ChordDiagram | null {
  // Normalize chord name to match our diagram keys
  const normalized = chordName.replace(/\s+/g, '').replace(/maj/, '').replace(/min/, 'm')
  return GUITAR_CHORDS[normalized] || null
}

export function getPianoChordDiagram(chordName: string): PianoChordDiagram | null {
  // Normalize chord name to match our diagram keys
  const normalized = chordName.replace(/\s+/g, '').replace(/maj/, '').replace(/min/, 'm')
  return PIANO_CHORDS[normalized] || null
}

// Simplify chord to basic major/minor form
export function simplifyChord(chord: string): string {
  // Extract the root note
  const rootMatch = chord.match(/^[A-G]#?/)
  if (!rootMatch) return chord
  
  const root = rootMatch[0]
  const suffix = chord.slice(root.length).toLowerCase()
  
  // Check if it's a minor chord (any variation)
  if (suffix.includes('m') && !suffix.includes('maj')) {
    // Special case: 'm' alone or 'min'
    if (suffix === 'm' || suffix === 'min' || suffix.startsWith('m7') || suffix.startsWith('min')) {
      return root + 'm'
    }
  }
  
  // For major chords and all other variations, return just the root
  return root
}

// Get chord type for categorization
export function getChordType(chord: string): 'major' | 'minor' | 'diminished' | 'augmented' | 'other' {
  const suffix = chord.replace(/^[A-G]#?/, '').toLowerCase()
  
  if (suffix.includes('dim')) return 'diminished'
  if (suffix.includes('aug')) return 'augmented'
  if (suffix.includes('m') && !suffix.includes('maj')) return 'minor'
  if (!suffix || suffix.includes('maj')) return 'major'
  
  return 'other'
}

// Check if a chord is complex (not just major/minor)
export function isComplexChord(chord: string): boolean {
  const suffix = chord.replace(/^[A-G]#?/, '')
  return suffix !== '' && suffix !== 'm'
} 