export interface Chord {
  name: string
  time: number // Time in seconds
  duration: number // Duration in seconds
  confidence: number // Confidence level 0-1
}

export interface AudioAnalysis {
  id: string
  filename: string
  key: string
  tempo: number
  chords: Chord[]
  createdAt: Date
  userId?: string
  audioUrl: string
}

export interface UploadedFile {
  id: string
  filename: string
  url: string
  status: 'uploading' | 'processing' | 'completed' | 'error'
  error?: string
  analysis?: AudioAnalysis
} 