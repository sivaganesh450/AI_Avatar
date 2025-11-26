// src/services/speechService.js

/**
 * Speech Service for Text-to-Speech functionality
 * Uses Web Speech API for browser-based TTS
 */

class SpeechService {
  constructor() {
    this.synthesis = window.speechSynthesis;
    this.currentUtterance = null;
    this.isSpeaking = false;
    this.voices = [];
    this.selectedVoice = null;

    // Load voices when available
    this.loadVoices();
    if (this.synthesis.onvoiceschanged !== undefined) {
      this.synthesis.onvoiceschanged = () => this.loadVoices();
    }
  }

  /**
   * Load available voices
   */
  loadVoices() {
    this.voices = this.synthesis.getVoices();
    
    // Try to select a good English voice
    this.selectedVoice = this.voices.find(voice => 
      voice.lang.startsWith('en') && voice.name.includes('Google')
    ) || this.voices.find(voice => 
      voice.lang.startsWith('en')
    ) || this.voices[0];

    console.log('Available voices:', this.voices.length);
    console.log('Selected voice:', this.selectedVoice?.name);
  }

  /**
   * Speak the given text
   * @param {string} text - Text to speak
   * @param {function} onStart - Callback when speech starts
   * @param {function} onEnd - Callback when speech ends
   * @param {function} onWord - Callback for word boundaries (for lip-sync)
   */
  speak(text, onStart, onEnd, onWord) {
    return new Promise((resolve, reject) => {
      // Stop any ongoing speech
      this.stop();

      if (!text || text.trim() === '') {
        reject(new Error('No text provided'));
        return;
      }

      // Check if speech synthesis is available
      if (!this.synthesis) {
        console.error('Speech synthesis not supported');
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      this.currentUtterance = new SpeechSynthesisUtterance(text);
      
      // Set voice
      if (this.selectedVoice) {
        this.currentUtterance.voice = this.selectedVoice;
      }

      // Configure speech parameters
      this.currentUtterance.rate = 0.9;  // Speech rate (0.1 to 10) - slightly slower for better lip-sync
      this.currentUtterance.pitch = 1.0; // Pitch (0 to 2)
      this.currentUtterance.volume = 1.0; // Volume (0 to 1)
      this.currentUtterance.lang = 'en-US'; // Language

      // Event handlers
      this.currentUtterance.onstart = () => {
        this.isSpeaking = true;
        console.log('Speech started:', text);
        if (onStart) onStart();
      };

      this.currentUtterance.onend = () => {
        this.isSpeaking = false;
        console.log('Speech ended');
        if (onEnd) onEnd();
        resolve();
      };

      this.currentUtterance.onerror = (event) => {
        this.isSpeaking = false;
        console.error('Speech error:', event);
        if (onEnd) onEnd();
        reject(event);
      };

      // Word boundary for lip-sync
      this.currentUtterance.onboundary = (event) => {
        if (event.name === 'word' && onWord) {
          onWord(event);
        }
      };

      // Start speaking
      console.log('Starting speech synthesis...');
      this.synthesis.speak(this.currentUtterance);
    });
  }

  /**
   * Stop current speech
   */
  stop() {
    if (this.synthesis.speaking) {
      this.synthesis.cancel();
      this.isSpeaking = false;
    }
  }

  /**
   * Pause current speech
   */
  pause() {
    if (this.synthesis.speaking && !this.synthesis.paused) {
      this.synthesis.pause();
    }
  }

  /**
   * Resume paused speech
   */
  resume() {
    if (this.synthesis.paused) {
      this.synthesis.resume();
    }
  }

  /**
   * Check if currently speaking
   */
  getSpeakingStatus() {
    return this.isSpeaking;
  }

  /**
   * Get available voices
   */
  getVoices() {
    return this.voices;
  }

  /**
   * Set voice by name
   */
  setVoice(voiceName) {
    const voice = this.voices.find(v => v.name === voiceName);
    if (voice) {
      this.selectedVoice = voice;
      console.log('Voice changed to:', voiceName);
      return true;
    }
    return false;
  }

  /**
   * Set voice by language
   */
  setVoiceByLanguage(lang) {
    const voice = this.voices.find(v => v.lang.startsWith(lang));
    if (voice) {
      this.selectedVoice = voice;
      console.log('Voice changed to:', voice.name);
      return true;
    }
    return false;
  }
}

// Export singleton instance
export default new SpeechService();