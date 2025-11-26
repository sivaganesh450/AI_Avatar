// src/utils/ExpressionController.js

/**
 * Manages facial expressions and hand gestures based on context
 */

class ExpressionController {
  constructor() {
    this.currentExpression = 'neutral';
    this.currentGesture = 'idle';
  }

  /**
   * Analyze text sentiment and return appropriate expression
   */
  getExpressionFromText(text) {
    if (!text) return 'neutral';
    
    const lowerText = text.toLowerCase();

    // Positive expressions
    if (this.matchesPatterns(lowerText, [
      'happy', 'great', 'awesome', 'excellent', 'wonderful', 'fantastic',
      'love', 'enjoy', 'amazing', 'perfect', 'glad', 'smile'
    ])) {
      return 'happy';
    }

    // Sad expressions
    if (this.matchesPatterns(lowerText, [
      'sad', 'sorry', 'unfortunately', 'disappointed', 'upset',
      'regret', 'terrible', 'bad news'
    ])) {
      return 'sad';
    }

    // Surprised expressions
    if (this.matchesPatterns(lowerText, [
      'wow', 'amazing', 'incredible', 'unbelievable', 'surprising',
      'shocked', 'omg'
    ])) {
      return 'surprised';
    }

    // Angry expressions
    if (this.matchesPatterns(lowerText, [
      'angry', 'furious', 'mad', 'annoyed', 'frustrated',
      'irritated'
    ])) {
      return 'angry';
    }

    // Thinking expressions
    if (this.matchesPatterns(lowerText, [
      'think', 'maybe', 'perhaps', 'consider', 'let me',
      'hmm', 'well', 'actually'
    ])) {
      return 'thinking';
    }

    // Fear/worried expressions
    if (this.matchesPatterns(lowerText, [
      'worried', 'scared', 'afraid', 'nervous', 'anxious',
      'concern', 'fear'
    ])) {
      return 'worried';
    }

    return 'neutral';
  }

  /**
   * Get appropriate hand gesture based on context
   */
  getGestureFromText(text) {
    if (!text) return 'idle';
    
    const lowerText = text.toLowerCase();

    // Wave gesture
    if (this.matchesPatterns(lowerText, [
      'hello', 'hi', 'hey', 'greetings', 'welcome', 'bye', 'goodbye'
    ])) {
      return 'wave';
    }

    // Pointing gesture
    if (this.matchesPatterns(lowerText, [
      'look', 'see', 'check', 'that', 'there', 'this', 'point'
    ])) {
      return 'point';
    }

    // Thumbs up gesture
    if (this.matchesPatterns(lowerText, [
      'good', 'great', 'perfect', 'correct', 'right', 'yes',
      'agree', 'okay', 'ok'
    ])) {
      return 'thumbsUp';
    }

    // Thumbs down gesture
    if (this.matchesPatterns(lowerText, [
      'no', 'wrong', 'bad', 'incorrect', 'disagree', 'nope'
    ])) {
      return 'thumbsDown';
    }

    // Shrug gesture
    if (this.matchesPatterns(lowerText, [
      'dont know', 'not sure', 'maybe', 'dunno', 'shrug'
    ])) {
      return 'shrug';
    }

    // Clapping gesture
    if (this.matchesPatterns(lowerText, [
      'congratulations', 'congrats', 'well done', 'bravo',
      'applause', 'amazing job'
    ])) {
      return 'clap';
    }

    // Thinking gesture (hand on chin)
    if (this.matchesPatterns(lowerText, [
      'think', 'consider', 'hmm', 'let me think', 'analyzing'
    ])) {
      return 'thinking';
    }

    // Explaining gesture (open hands)
    if (this.matchesPatterns(lowerText, [
      'explain', 'tell you', 'let me', 'heres', 'so',
      'basically', 'essentially', 'means that'
    ])) {
      return 'explain';
    }

    return 'idle';
  }

  /**
   * Get combined expression and gesture
   */
  getEmotionFromText(text) {
    return {
      expression: this.getExpressionFromText(text),
      gesture: this.getGestureFromText(text)
    };
  }

  /**
   * Helper to match patterns
   */
  matchesPatterns(text, patterns) {
    return patterns.some(pattern => text.includes(pattern));
  }
}

export default new ExpressionController();