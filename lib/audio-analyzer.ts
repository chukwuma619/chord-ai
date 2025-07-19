import { Chord } from './types'

// Real-time audio analysis using Web Audio API and music theory
export class AudioAnalyzer {
  private audioContext: AudioContext
  private analyser: AnalyserNode
  private dataArray: Uint8Array
  private sampleRate: number

  constructor() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    this.analyser = this.audioContext.createAnalyser()
    this.analyser.fftSize = 4096
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount)
    this.sampleRate = this.audioContext.sampleRate
  }

  // Convert frequency to nearest musical note
  private frequencyToNote(frequency: number): string {
    const A4 = 440
    const C0 = A4 * Math.pow(2, -4.75)
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    
    if (frequency === 0) return ''
    
    const h = 12 * (Math.log(frequency / C0) / Math.log(2))
    const octave = Math.floor(h) / 12
    const n = h % 12
    const note = noteNames[Math.round(n)]
    
    return `${note}${Math.floor(octave)}`
  }

  // Detect pitch using autocorrelation
  private detectPitch(buffer: Float32Array): number {
    const SIZE = buffer.length
    const MAX_SAMPLES = Math.floor(SIZE / 2)
    let best_offset = -1
    let best_correlation = 0
    let rms = 0
    let foundGoodCorrelation = false
    let correlations = new Array(MAX_SAMPLES)

    // Calculate RMS (root mean square) for volume detection
    for (let i = 0; i < SIZE; i++) {
      const val = buffer[i]
      rms += val * val
    }
    rms = Math.sqrt(rms / SIZE)

    // Not enough signal
    if (rms < 0.01) return -1

    // Autocorrelation
    let lastCorrelation = 1
    for (let offset = 0; offset < MAX_SAMPLES; offset++) {
      let correlation = 0

      for (let i = 0; i < SIZE - offset; i++) {
        correlation += Math.abs(buffer[i] - buffer[i + offset])
      }

      correlation = 1 - (correlation / SIZE)
      correlations[offset] = correlation

      if ((correlation > 0.9) && (correlation > lastCorrelation)) {
        foundGoodCorrelation = true
        if (correlation > best_correlation) {
          best_correlation = correlation
          best_offset = offset
        }
      } else if (foundGoodCorrelation) {
        // Short-circuit - we found a good correlation, then a bad one, so we'd just be seeing copies from here.
        const shift = (correlations[best_offset + 1] - correlations[best_offset - 1]) / correlations[best_offset]
        return this.sampleRate / (best_offset + (8 * shift))
      }
      lastCorrelation = correlation
    }

    if (best_correlation > 0.01) {
      return this.sampleRate / best_offset
    }

    return -1
  }

  // Detect chords based on frequency spectrum
  private detectChord(frequencies: number[]): string {
    // Common chord patterns (intervals in semitones)
    const chordPatterns: { [key: string]: number[] } = {
      'major': [0, 4, 7],
      'minor': [0, 3, 7],
      '7': [0, 4, 7, 10],
      'maj7': [0, 4, 7, 11],
      'm7': [0, 3, 7, 10],
      'dim': [0, 3, 6],
      'aug': [0, 4, 8],
      'sus2': [0, 2, 7],
      'sus4': [0, 5, 7]
    }

    // Get the strongest frequencies and convert to notes
    const notes = frequencies
      .filter(f => f > 0)
      .map(f => this.frequencyToNote(f))
      .filter(n => n !== '')

    if (notes.length === 0) return 'N/A'

    // Simple chord detection - in production, use more sophisticated algorithms
    const rootNote = notes[0].replace(/\d+/, '') // Remove octave number
    
    // Check for common patterns
    if (notes.length >= 3) {
      // Detect major/minor based on third interval
      const hasMinorThird = notes.some(n => {
        const noteWithoutOctave = n.replace(/\d+/, '')
        return this.getSemitoneDistance(rootNote, noteWithoutOctave) === 3
      })
      
      const hasMajorThird = notes.some(n => {
        const noteWithoutOctave = n.replace(/\d+/, '')
        return this.getSemitoneDistance(rootNote, noteWithoutOctave) === 4
      })

      if (hasMinorThird) return `${rootNote}m`
      if (hasMajorThird) return rootNote
    }

    return rootNote
  }

  // Calculate semitone distance between two notes
  private getSemitoneDistance(note1: string, note2: string): number {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    const index1 = noteNames.indexOf(note1)
    const index2 = noteNames.indexOf(note2)
    
    if (index1 === -1 || index2 === -1) return 0
    
    let distance = index2 - index1
    if (distance < 0) distance += 12
    
    return distance
  }

  // Analyze audio buffer and extract chords
  async analyzeAudioBuffer(audioBuffer: AudioBuffer): Promise<{
    tempo: number
    key: string
    chords: Chord[]
  }> {
    // Get audio data
    const channelData = audioBuffer.getChannelData(0)
    const sampleRate = audioBuffer.sampleRate
    const duration = audioBuffer.duration

    // Detect tempo using onset detection
    const tempo = this.detectTempo(channelData, sampleRate)

    // Analyze in chunks to detect chords over time
    const chunkSize = sampleRate * 0.5 // 0.5 second chunks
    const chunks = Math.floor(channelData.length / chunkSize)
    const chords: Chord[] = []
    
    let currentChord = ''
    let chordStartTime = 0

    for (let i = 0; i < chunks; i++) {
      const start = i * chunkSize
      const end = Math.min(start + chunkSize, channelData.length)
      const chunk = channelData.slice(start, end)

      // Apply window function to reduce spectral leakage
      const windowedChunk = this.applyWindow(chunk)

      // Perform FFT
      const frequencies = this.performFFT(windowedChunk, sampleRate)

      // Detect chord
      const detectedChord = this.detectChord(frequencies)
      const currentTime = (i * chunkSize) / sampleRate

      if (detectedChord !== currentChord && detectedChord !== 'N/A') {
        if (currentChord !== '') {
          chords.push({
            name: currentChord,
            time: chordStartTime,
            duration: currentTime - chordStartTime,
            confidence: 0.8
          })
        }
        currentChord = detectedChord
        chordStartTime = currentTime
      }
    }

    // Add last chord
    if (currentChord !== '') {
      chords.push({
        name: currentChord,
        time: chordStartTime,
        duration: duration - chordStartTime,
        confidence: 0.8
      })
    }

    // Detect key based on chord progression
    const key = this.detectKey(chords)

    return { tempo, key, chords }
  }

  // Simple tempo detection using onset detection
  private detectTempo(audioData: Float32Array, sampleRate: number): number {
    // Energy-based onset detection
    const windowSize = 2048
    const hopSize = 512
    const onsets: number[] = []

    for (let i = windowSize; i < audioData.length - windowSize; i += hopSize) {
      let energy = 0
      let previousEnergy = 0

      // Calculate energy in current window
      for (let j = 0; j < windowSize; j++) {
        energy += Math.pow(audioData[i + j], 2)
        previousEnergy += Math.pow(audioData[i - windowSize + j], 2)
      }

      // Detect onset if energy increases significantly
      if (energy > previousEnergy * 1.5) {
        onsets.push(i / sampleRate)
      }
    }

    // Calculate intervals between onsets
    const intervals: number[] = []
    for (let i = 1; i < onsets.length; i++) {
      intervals.push(onsets[i] - onsets[i - 1])
    }

    // Find most common interval (mode)
    if (intervals.length === 0) return 120 // Default tempo

    const sortedIntervals = intervals.sort((a, b) => a - b)
    const beatInterval = sortedIntervals[Math.floor(sortedIntervals.length / 2)]

    // Convert to BPM
    const bpm = Math.round(60 / beatInterval)
    
    // Clamp to reasonable range
    return Math.max(60, Math.min(200, bpm))
  }

  // Apply Hanning window to reduce spectral leakage
  private applyWindow(buffer: Float32Array): Float32Array {
    const windowed = new Float32Array(buffer.length)
    for (let i = 0; i < buffer.length; i++) {
      windowed[i] = buffer[i] * (0.5 - 0.5 * Math.cos(2 * Math.PI * i / (buffer.length - 1)))
    }
    return windowed
  }

  // Perform FFT and extract dominant frequencies
  private performFFT(buffer: Float32Array, sampleRate: number): number[] {
    // In production, use a proper FFT library like KissFFT or FFTW
    // For now, we'll use a simple DFT for demonstration
    const frequencies: number[] = []
    const N = buffer.length
    const freqResolution = sampleRate / N

    // We only need to check up to Nyquist frequency
    const maxBin = Math.floor(N / 2)
    
    // Focus on musical frequency range (80Hz to 2000Hz)
    const minBin = Math.floor(80 / freqResolution)
    const maxMusicalBin = Math.floor(2000 / freqResolution)

    const magnitudes: Array<{ freq: number, mag: number }> = []

    for (let k = minBin; k < Math.min(maxMusicalBin, maxBin); k++) {
      let real = 0
      let imag = 0

      for (let n = 0; n < N; n++) {
        const angle = -2 * Math.PI * k * n / N
        real += buffer[n] * Math.cos(angle)
        imag += buffer[n] * Math.sin(angle)
      }

      const magnitude = Math.sqrt(real * real + imag * imag)
      const frequency = k * freqResolution

      magnitudes.push({ freq: frequency, mag: magnitude })
    }

    // Sort by magnitude and get top frequencies
    magnitudes.sort((a, b) => b.mag - a.mag)
    
    // Get top 5 frequencies
    for (let i = 0; i < Math.min(5, magnitudes.length); i++) {
      if (magnitudes[i].mag > magnitudes[0].mag * 0.1) { // Threshold
        frequencies.push(magnitudes[i].freq)
      }
    }

    return frequencies
  }

  // Detect key based on chord progression
  private detectKey(chords: Chord[]): string {
    // Count occurrences of each chord
    const chordCounts: { [key: string]: number } = {}
    chords.forEach(chord => {
      const baseChord = chord.name.replace(/m|7|maj7|dim|aug|sus2|sus4/, '')
      chordCounts[baseChord] = (chordCounts[baseChord] || 0) + chord.duration
    })

    // Find most common chord (likely tonic)
    let mostCommon = ''
    let maxDuration = 0
    for (const [chord, duration] of Object.entries(chordCounts)) {
      if (duration > maxDuration) {
        maxDuration = duration
        mostCommon = chord
      }
    }

    // Check if minor or major based on chord types
    const minorChords = chords.filter(c => c.name.includes('m')).length
    const majorChords = chords.filter(c => !c.name.includes('m')).length

    if (minorChords > majorChords) {
      return `${mostCommon} minor`
    } else {
      return `${mostCommon} major`
    }
  }

  // Clean up resources
  dispose() {
    if (this.audioContext.state !== 'closed') {
      this.audioContext.close()
    }
  }
} 