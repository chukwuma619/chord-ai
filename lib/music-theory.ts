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