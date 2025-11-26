// src/services/aiService.js

/**
 * AI Service for handling chat responses
 * Supports multiple AI providers: OpenAI, Mock responses, or custom API
 */

class AIService {
  constructor() {
    this.apiKey = process.env.REACT_APP_OPENAI_API_KEY;
    this.apiUrl = 'https://api.openai.com/v1/chat/completions';
    this.model = 'gpt-3.5-turbo';
    this.conversationHistory = [];
  }

  /**
   * Get AI response using OpenAI API
   */
  async getOpenAIResponse(userMessage) {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not found. Please add REACT_APP_OPENAI_API_KEY to your .env file');
    }

    this.conversationHistory.push({
      role: 'user',
      content: userMessage
    });

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'You are a friendly and helpful AI avatar assistant. Keep responses conversational, warm, and concise (2-3 sentences max unless asked for more detail).'
            },
            ...this.conversationHistory
          ],
          temperature: 0.7,
          max_tokens: 150
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const aiMessage = data.choices[0].message.content;

      this.conversationHistory.push({
        role: 'assistant',
        content: aiMessage
      });

      return aiMessage;
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw error;
    }
  }

  /**
   * Get mock AI response (for testing without API key)
   */
  async getMockResponse(userMessage) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const responses = {
      greetings: [
        "Hello! It's great to meet you! How can I help you today?",
        "Hi there! I'm here to assist you. What would you like to talk about?",
        "Hey! Nice to see you! What's on your mind?"
      ],
      questions: [
        "That's an interesting question! Let me think about that for a moment.",
        "Great question! I'd be happy to help you understand that better.",
        "I appreciate you asking! Here's what I think..."
      ],
      general: [
        "I understand what you're saying. That's a thoughtful perspective!",
        "Thanks for sharing that with me. It's interesting to hear your thoughts.",
        "I see! That makes sense. Would you like to explore this topic more?"
      ],
      farewell: [
        "It was wonderful talking with you! Feel free to come back anytime!",
        "Thanks for the chat! Have a great day!",
        "Goodbye! Looking forward to our next conversation!"
      ]
    };

    const lowerMessage = userMessage.toLowerCase();

    // Simple intent detection
    if (lowerMessage.match(/\b(hi|hello|hey|greetings)\b/)) {
      return this.getRandomResponse(responses.greetings);
    } else if (lowerMessage.match(/\b(bye|goodbye|see you|farewell)\b/)) {
      return this.getRandomResponse(responses.farewell);
    } else if (lowerMessage.includes('?')) {
      return this.getRandomResponse(responses.questions);
    } else {
      return this.getRandomResponse(responses.general);
    }
  }

  /**
   * Main method to get AI response
   * Falls back to mock if API key not available
   */
  async getResponse(userMessage) {
    try {
      if (this.apiKey) {
        return await this.getOpenAIResponse(userMessage);
      } else {
        console.warn('No API key found, using mock responses');
        return await this.getMockResponse(userMessage);
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      // Fallback to mock response on error
      return await this.getMockResponse(userMessage);
    }
  }

  /**
   * Get random response from array
   */
  getRandomResponse(responses) {
    return responses[Math.floor(Math.random() * responses.length)];
  }

  /**
   * Clear conversation history
   */
  clearHistory() {
    this.conversationHistory = [];
  }

  /**
   * Get conversation history
   */
  getHistory() {
    return this.conversationHistory;
  }
}

// Export singleton instance
export default new AIService();