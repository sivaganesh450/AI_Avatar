// src/utils/audioProcessor.js

/**
 * Audio Processor for analyzing audio and generating mouth values for lip-sync
 */

class AudioProcessor {
  constructor() {
    this.audioContext = null;
    this.analyser = null;
    this.dataArray = null;
    this.source = null;
  }

  /**
   * Initialize audio context and analyser
   */
  initialize() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    }
  }

  /**
   * Analyze audio and return mouth open value (0-1)
   */
  getMouthValue() {
    if (!this.analyser || !this.dataArray) return 0;

    this.analyser.getByteFrequencyData(this.dataArray);

    // Calculate average volume
    let sum = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      sum += this.dataArray[i];
    }
    const average = sum / this.dataArray.length;

    // Normalize to 0-1 range
    const normalized = Math.min(average / 128, 1);

    // Apply smoothing and threshold
    return normalized > 0.1 ? normalized : 0;
  }

  /**
   * Get audio frequency data
   */
  getFrequencyData() {
    if (!this.analyser || !this.dataArray) return [];

    this.analyser.getByteFrequencyData(this.dataArray);
    return Array.from(this.dataArray);
  }

  /**
   * Connect audio source for analysis
   */
  connectSource(audioElement) {
    this.initialize();

    if (this.source) {
      this.source.disconnect();
    }

    try {
      this.source = this.audioContext.createMediaElementSource(audioElement);
      this.source.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);
    } catch (error) {
      console.error('Error connecting audio source:', error);
    }
  }

  /**
   * Process text to generate phoneme-based mouth shapes
   * Simple vowel-based approach
   */
  processTextToMouthShapes(text) {
    const words = text.toLowerCase().split(' ');
    const mouthShapes = [];

    words.forEach((word, index) => {
      const hasVowels = /[aeiou]/.test(word);
      const shape = hasVowels ? 'open' : 'closed';
      
      mouthShapes.push({
        word,
        shape,
        timing: index * 300, // Approximate timing in ms
        duration: word.length * 100
      });
    });

    return mouthShapes;
  }

  /**
   * Generate smooth mouth animation curve
   */
  generateMouthCurve(duration, intensity = 1.0) {
    const frames = [];
    const frameCount = Math.floor(duration / 16); // ~60fps

    for (let i = 0; i < frameCount; i++) {
      const progress = i / frameCount;
      
      // Use sine wave for natural mouth movement
      const value = Math.sin(progress * Math.PI * 2 * 3) * intensity;
      const normalized = (value + 1) / 2; // Normalize to 0-1
      
      frames.push({
        time: i * 16,
        value: normalized
      });
    }

    return frames;
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

// Export singleton instance
export default new AudioProcessor();