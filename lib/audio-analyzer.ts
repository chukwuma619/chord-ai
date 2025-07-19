// Real-world audio analysis utilities for chord and key detection

export class AudioAnalyzer {
  private audioContext: AudioContext
  private analyser: AnalyserNode
  private dataArray: Uint8Array
  private sampleRate: number

  constructor() {
    // Handle both standard and webkit audio context
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    this.audioContext = new AudioContextClass()
    this.analyser = this.audioContext.createAnalyser()
    this.analyser.fftSize = 8192 // Higher resolution for better frequency analysis
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount)
    this.sampleRate = this.audioContext.sampleRate
  }

  // Real-world audio analysis using chroma features and harmonic analysis
  async analyzeAudioBuffer(audioBuffer: AudioBuffer): Promise<Array<{
    name: string
    time: number
    duration: number
    confidence: number
  }>> {
    const channelData = audioBuffer.getChannelData(0)
    const sampleRate = audioBuffer.sampleRate
    const duration = audioBuffer.duration
    
    // Analysis parameters
    const windowSize = 4096
    const hopSize = 2048
    const analysisWindowDuration = 2.0 // Analyze 2-second windows
    const analysisHopDuration = 1.0 // Move forward 1 second each time
    
    const chords: Array<{
      name: string
      time: number
      duration: number
      confidence: number
    }> = []

    // Analyze audio in overlapping windows
    for (let time = 0; time < duration - analysisWindowDuration; time += analysisHopDuration) {
      const startSample = Math.floor(time * sampleRate)
      const endSample = Math.floor((time + analysisWindowDuration) * sampleRate)
      const windowData = channelData.slice(startSample, endSample)
      
      // Extract chroma features
      const chromaVector = this.extractChromaFeatures(windowData, sampleRate)
      
      // Detect chord from chroma features
      const chordResult = this.detectChordFromChroma(chromaVector)
      
      if (chordResult.confidence > 0.3) { // Only include confident detections
        chords.push({
          name: chordResult.chord,
          time: time,
          duration: analysisWindowDuration,
          confidence: chordResult.confidence
        })
      }
    }

    // Post-process to merge similar consecutive chords
    return this.mergeConsecutiveChords(chords)
  }

  // Extract chroma features (12-dimensional pitch class profile)
  private extractChromaFeatures(audioData: Float32Array, sampleRate: number): number[] {
    const chroma = new Array(12).fill(0)
    const windowSize = 4096
    const numWindows = Math.floor(audioData.length / windowSize)
    
    for (let w = 0; w < numWindows; w++) {
      const windowStart = w * windowSize
      const window = audioData.slice(windowStart, windowStart + windowSize)
      
      // Apply Hamming window
      const hammingWindow = this.applyHammingWindow(window)
      
      // Compute FFT magnitudes
      const fftMagnitudes = this.computeFFTMagnitudes(hammingWindow)
      
      // Convert to chroma
      for (let bin = 0; bin < fftMagnitudes.length; bin++) {
        const frequency = (bin * sampleRate) / (2 * fftMagnitudes.length)
        if (frequency > 80 && frequency < 2000) { // Focus on musical range
          const pitchClass = this.frequencyToPitchClass(frequency)
          chroma[pitchClass] += fftMagnitudes[bin]
        }
      }
    }
    
    // Normalize chroma vector
    const maxChroma = Math.max(...chroma)
    if (maxChroma > 0) {
      for (let i = 0; i < 12; i++) {
        chroma[i] /= maxChroma
      }
    }
    
    return chroma
  }

  // Apply Hamming window to reduce spectral leakage
  private applyHammingWindow(buffer: Float32Array): Float32Array {
    const windowed = new Float32Array(buffer.length)
    for (let i = 0; i < buffer.length; i++) {
      const windowValue = 0.54 - 0.46 * Math.cos(2 * Math.PI * i / (buffer.length - 1))
      windowed[i] = buffer[i] * windowValue
    }
    return windowed
  }

  // Compute FFT magnitudes using a simplified DFT for demonstration
  // In production, use a proper FFT library like KissFFT or FFTW
  private computeFFTMagnitudes(buffer: Float32Array): number[] {
    const N = buffer.length
    const magnitudes: number[] = []
    
    // Only compute up to Nyquist frequency
    for (let k = 0; k < N / 2; k++) {
      let real = 0
      let imag = 0
      
      for (let n = 0; n < N; n++) {
        const angle = -2 * Math.PI * k * n / N
        real += buffer[n] * Math.cos(angle)
        imag += buffer[n] * Math.sin(angle)
      }
      
      magnitudes.push(Math.sqrt(real * real + imag * imag))
    }
    
    return magnitudes
  }

  // Convert frequency to pitch class (0-11, where 0=C, 1=C#, etc.)
  private frequencyToPitchClass(frequency: number): number {
    const A4 = 440
    const semitones = 12 * Math.log2(frequency / A4) + 57 // A4 is MIDI note 69, C4 is 60
    return Math.round(semitones) % 12
  }

  // Detect chord from chroma vector using template matching
  private detectChordFromChroma(chroma: number[]): { chord: string, confidence: number } {
    // Chord templates (chroma patterns for common chords)
    const chordTemplates: { [key: string]: number[] } = {
      'C': [1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0],      // C major: C, E, G
      'C#': [0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0],     // C# major: C#, F, G#
      'D': [0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0],      // D major: D, F#, A
      'D#': [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0],     // D# major: D#, G, A#
      'E': [0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1],      // E major: E, G#, B
      'F': [1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0],      // F major: F, A, C
      'F#': [0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0],     // F# major: F#, A#, C#
      'G': [0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1],      // G major: G, B, D
      'G#': [1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0],     // G# major: G#, C, D#
      'A': [0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0],      // A major: A, C#, E
      'A#': [0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0],     // A# major: A#, D, F
      'B': [0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1],      // B major: B, D#, F#
      
      // Minor chords
      'Am': [1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0],     // A minor: A, C, E
      'A#m': [0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],    // A# minor: A#, C#, F
      'Bm': [0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0],     // B minor: B, D, F#
      'Cm': [1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0],     // C minor: C, D#, G
      'C#m': [0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],    // C# minor: C#, E, G#
      'Dm': [0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0],     // D minor: D, F, A
      'D#m': [0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0],    // D# minor: D#, F#, A#
      'Em': [0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1],     // E minor: E, G, B
      'Fm': [1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0],     // F minor: F, G#, C
      'F#m': [0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0],    // F# minor: F#, A, C#
      'Gm': [0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0],     // G minor: G, A#, D
      'G#m': [0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1],    // G# minor: G#, B, D#
    }

    let bestChord = 'C'
    let bestCorrelation = 0

    // Find best matching chord template
    for (const [chordName, template] of Object.entries(chordTemplates)) {
      const correlation = this.calculateCorrelation(chroma, template)
      if (correlation > bestCorrelation) {
        bestCorrelation = correlation
        bestChord = chordName
      }
    }

    return {
      chord: bestChord,
      confidence: Math.min(bestCorrelation, 1.0)
    }
  }

  // Calculate correlation between chroma vector and chord template
  private calculateCorrelation(chroma: number[], template: number[]): number {
    let dotProduct = 0
    let chromaMagnitude = 0
    let templateMagnitude = 0

    for (let i = 0; i < 12; i++) {
      dotProduct += chroma[i] * template[i]
      chromaMagnitude += chroma[i] * chroma[i]
      templateMagnitude += template[i] * template[i]
    }

    if (chromaMagnitude === 0 || templateMagnitude === 0) {
      return 0
    }

    return dotProduct / (Math.sqrt(chromaMagnitude) * Math.sqrt(templateMagnitude))
  }

  // Merge consecutive similar chords to reduce noise
  private mergeConsecutiveChords(chords: Array<{
    name: string
    time: number
    duration: number
    confidence: number
  }>): Array<{
    name: string
    time: number
    duration: number
    confidence: number
  }> {
    if (chords.length === 0) return []

    const merged: Array<{
      name: string
      time: number
      duration: number
      confidence: number
    }> = []

    let currentChord = chords[0]

    for (let i = 1; i < chords.length; i++) {
      if (chords[i].name === currentChord.name) {
        // Extend current chord duration
        currentChord.duration = chords[i].time + chords[i].duration - currentChord.time
        currentChord.confidence = Math.max(currentChord.confidence, chords[i].confidence)
      } else {
        // Start new chord
        merged.push(currentChord)
        currentChord = chords[i]
      }
    }

    merged.push(currentChord)
    return merged
  }

  // Auto-correlation based pitch detection (enhanced)
  private autoCorrelate(buffer: Float32Array, sampleRate: number): number {
    const SIZE = buffer.length
    const MAX_SAMPLES = Math.floor(SIZE / 2)
    let bestOffset = -1
    let bestCorrelation = 0
    let rms = 0
    let foundGoodCorrelation = false
    const correlations = new Array(MAX_SAMPLES)

    // Calculate RMS (root mean square) for volume detection
    for (let i = 0; i < SIZE; i++) {
      const val = buffer[i]
      rms += val * val
    }
    rms = Math.sqrt(rms / SIZE)

    // Not enough signal
    if (rms < 0.01) return -1

    let lastCorrelation = 1
    for (let offset = 0; offset < MAX_SAMPLES; offset++) {
      let correlation = 0

      for (let i = 0; i < MAX_SAMPLES; i++) {
        correlation += Math.abs((buffer[i]) - (buffer[i + offset]))
      }
      correlation = 1 - (correlation / MAX_SAMPLES)
      correlations[offset] = correlation

      if ((correlation > 0.9) && (correlation > lastCorrelation)) {
        foundGoodCorrelation = true
        if (correlation > bestCorrelation) {
          bestCorrelation = correlation
          bestOffset = offset
        }
      } else if (foundGoodCorrelation) {
        const shift = (correlations[bestOffset + 1] || 0) - (correlations[bestOffset - 1] || 0)
        return sampleRate / (bestOffset + (8 * shift))
      }
      lastCorrelation = correlation
    }
    if (bestCorrelation > 0.01) {
      return sampleRate / bestOffset
    }
    return -1
  }

  // Get pitch from microphone input
  getPitch(): number {
    this.analyser.getFloatTimeDomainData(this.dataArray as unknown as Float32Array)
    const pitch = this.autoCorrelate(this.dataArray as unknown as Float32Array, this.sampleRate)
    return pitch
  }

  // Get frequency spectrum for chord detection
  getFrequencyData(): Uint8Array {
    this.analyser.getByteFrequencyData(this.dataArray)
    return this.dataArray
  }

  // Connect to audio source
  connectAudioSource(source: MediaStreamAudioSourceNode | AudioBufferSourceNode): void {
    source.connect(this.analyser)
  }

  // Disconnect audio source
  disconnect(): void {
    this.analyser.disconnect()
  }

  // Get audio context
  getAudioContext(): AudioContext {
    return this.audioContext
  }

  // Resume audio context (needed for user interaction requirements)
  async resumeContext(): Promise<void> {
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume()
    }
  }

  // Close audio context
  close(): void {
    this.audioContext.close()
  }
}

// Real-world key detection from chord progression
export function detectKey(chords: string[]): string {
  if (chords.length === 0) return 'C'

  // Key profiles based on chord frequency in major/minor keys
  const keyProfiles: { [key: string]: { [chord: string]: number } } = {
    'C': { 'C': 3, 'Dm': 2, 'Em': 2, 'F': 3, 'G': 3, 'Am': 2, 'Bdim': 1 },
    'G': { 'G': 3, 'Am': 2, 'Bm': 2, 'C': 3, 'D': 3, 'Em': 2, 'F#dim': 1 },
    'D': { 'D': 3, 'Em': 2, 'F#m': 2, 'G': 3, 'A': 3, 'Bm': 2, 'C#dim': 1 },
    'A': { 'A': 3, 'Bm': 2, 'C#m': 2, 'D': 3, 'E': 3, 'F#m': 2, 'G#dim': 1 },
    'E': { 'E': 3, 'F#m': 2, 'G#m': 2, 'A': 3, 'B': 3, 'C#m': 2, 'D#dim': 1 },
    'B': { 'B': 3, 'C#m': 2, 'D#m': 2, 'E': 3, 'F#': 3, 'G#m': 2, 'A#dim': 1 },
    'F#': { 'F#': 3, 'G#m': 2, 'A#m': 2, 'B': 3, 'C#': 3, 'D#m': 2, 'E#dim': 1 },
    'F': { 'F': 3, 'Gm': 2, 'Am': 2, 'A#': 3, 'C': 3, 'Dm': 2, 'Edim': 1 },
    'A#': { 'A#': 3, 'Cm': 2, 'Dm': 2, 'D#': 3, 'F': 3, 'Gm': 2, 'Adim': 1 },
    'D#': { 'D#': 3, 'Fm': 2, 'Gm': 2, 'G#': 3, 'A#': 3, 'Cm': 2, 'Ddim': 1 },
    'G#': { 'G#': 3, 'A#m': 2, 'Cm': 2, 'C#': 3, 'D#': 3, 'Fm': 2, 'Gdim': 1 },
    'C#': { 'C#': 3, 'D#m': 2, 'Fm': 2, 'F#': 3, 'G#': 3, 'A#m': 2, 'Cdim': 1 },
    
    // Minor keys
    'Am': { 'Am': 3, 'Bdim': 1, 'C': 3, 'Dm': 2, 'Em': 2, 'F': 3, 'G': 3 },
    'Em': { 'Em': 3, 'F#dim': 1, 'G': 3, 'Am': 2, 'Bm': 2, 'C': 3, 'D': 3 },
    'Bm': { 'Bm': 3, 'C#dim': 1, 'D': 3, 'Em': 2, 'F#m': 2, 'G': 3, 'A': 3 },
    'F#m': { 'F#m': 3, 'G#dim': 1, 'A': 3, 'Bm': 2, 'C#m': 2, 'D': 3, 'E': 3 },
    'C#m': { 'C#m': 3, 'D#dim': 1, 'E': 3, 'F#m': 2, 'G#m': 2, 'A': 3, 'B': 3 },
    'G#m': { 'G#m': 3, 'A#dim': 1, 'B': 3, 'C#m': 2, 'D#m': 2, 'E': 3, 'F#': 3 },
    'D#m': { 'D#m': 3, 'E#dim': 1, 'F#': 3, 'G#m': 2, 'A#m': 2, 'B': 3, 'C#': 3 },
    'Dm': { 'Dm': 3, 'Edim': 1, 'F': 3, 'Gm': 2, 'Am': 2, 'A#': 3, 'C': 3 },
    'Gm': { 'Gm': 3, 'Adim': 1, 'A#': 3, 'Cm': 2, 'Dm': 2, 'D#': 3, 'F': 3 },
    'Cm': { 'Cm': 3, 'Ddim': 1, 'D#': 3, 'Fm': 2, 'Gm': 2, 'G#': 3, 'A#': 3 },
    'Fm': { 'Fm': 3, 'Gdim': 1, 'G#': 3, 'A#m': 2, 'Cm': 2, 'C#': 3, 'D#': 3 },
    'A#m': { 'A#m': 3, 'Cdim': 1, 'C#': 3, 'D#m': 2, 'Fm': 2, 'F#': 3, 'G#': 3 },
  }

  let bestKey = 'C'
  let bestScore = 0

  // Calculate score for each key based on chord occurrences
  for (const [key, profile] of Object.entries(keyProfiles)) {
    let score = 0
    const chordCounts: { [chord: string]: number } = {}
    
    // Count chord occurrences
    chords.forEach(chord => {
      chordCounts[chord] = (chordCounts[chord] || 0) + 1
    })

    // Calculate weighted score
    for (const [chord, count] of Object.entries(chordCounts)) {
      const weight = profile[chord] || 0
      score += count * weight
    }

    if (score > bestScore) {
      bestScore = score
      bestKey = key
    }
  }

  return bestKey
}

// Enhanced tempo estimation using onset detection
export function estimateTempo(chords: Array<{ time: number; duration: number }>): number {
  if (chords.length < 3) return 120

  // Calculate inter-onset intervals
  const intervals: number[] = []
  for (let i = 1; i < chords.length; i++) {
    intervals.push(chords[i].time - chords[i - 1].time)
  }

  // Remove outliers (values more than 2 standard deviations from mean)
  const mean = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length
  const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - mean, 2), 0) / intervals.length
  const stdDev = Math.sqrt(variance)
  
  const filteredIntervals = intervals.filter(interval => 
    Math.abs(interval - mean) <= 2 * stdDev
  )

  if (filteredIntervals.length === 0) return 120

  // Use median instead of mean for robustness
  const sortedIntervals = filteredIntervals.sort((a, b) => a - b)
  const medianInterval = sortedIntervals[Math.floor(sortedIntervals.length / 2)]

  // Convert to BPM (assuming 4/4 time, one chord per beat)
  let bpm = 60 / medianInterval

  // Handle common tempo relationships (half-time, double-time)
  if (bpm < 60) bpm *= 2
  if (bpm > 200) bpm /= 2

  // Round to nearest common BPM
  const commonBPMs = [60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 110, 115, 120, 125, 130, 135, 140, 145, 150, 160, 170, 180]
  return commonBPMs.reduce((prev, curr) => 
    Math.abs(curr - bpm) < Math.abs(prev - bpm) ? curr : prev
  )
}

// Utility functions for music theory

// Convert MIDI note number to frequency
export function midiToFrequency(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12)
}

// Convert frequency to MIDI note number
export function frequencyToMidi(frequency: number): number {
  return 69 + 12 * Math.log2(frequency / 440)
}

// Get note name from MIDI number
export function midiToNoteName(midi: number): string {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  const octave = Math.floor(midi / 12) - 1
  const note = noteNames[midi % 12]
  return `${note}${octave}`
}

// Generate comprehensive chord progression analysis
export function analyzeChordProgression(chords: Array<{
  name: string
  time: number
  duration: number
  confidence: number
}>): {
  key: string
  tempo: number
  totalDuration: number
  uniqueChords: string[]
  progression: string[]
} {
  const key = detectKey(chords.map(c => c.name))
  const tempo = estimateTempo(chords)
  const totalDuration = chords.length > 0 ? 
    Math.max(...chords.map(c => c.time + c.duration)) : 0
  const uniqueChords = [...new Set(chords.map(c => c.name))]
  const progression = chords.map(c => c.name)
  
  return {
    key,
    tempo,
    totalDuration,
    uniqueChords,
    progression
  }
} 