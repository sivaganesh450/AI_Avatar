import React, { useState } from 'react';
import './AnimationController.css';

const AnimationController = ({ onAnimationChange, onExpressionChange, onGestureChange, currentAnimation }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('expressions');

  const expressions = [
    { id: 'neutral', name: 'Neutral', emoji: '😐' },
    { id: 'happy', name: 'Happy', emoji: '😊' },
    { id: 'sad', name: 'Sad', emoji: '😢' },
    { id: 'surprised', name: 'Surprised', emoji: '😲' },
    { id: 'thinking', name: 'Thinking', emoji: '🤔' },
    { id: 'angry', name: 'Angry', emoji: '😠' },
    { id: 'worried', name: 'Worried', emoji: '😰' },
    { id: 'smile', name: 'Smile', emoji: '😄' }
  ];

  const gestures = [
    { id: 'idle', name: 'Idle', emoji: '🧍' },
    { id: 'wave', name: 'Wave', emoji: '👋' },
    { id: 'point', name: 'Point', emoji: '👉' },
    { id: 'thumbsUp', name: 'Thumbs Up', emoji: '👍' },
    { id: 'thumbsDown', name: 'Thumbs Down', emoji: '👎' },
    { id: 'shrug', name: 'Shrug', emoji: '🤷' },
    { id: 'clap', name: 'Clap', emoji: '👏' },
    { id: 'thinking', name: 'Hand on Chin', emoji: '🤔' },
    { id: 'explain', name: 'Explain', emoji: '📖' }
  ];

  const animations = [
    { id: 'idle', name: 'Idle', emoji: '🧍' },
    { id: 'wave', name: 'Wave', emoji: '👋' },
    { id: 'talking', name: 'Talking', emoji: '💬' },
    { id: 'thinking', name: 'Thinking', emoji: '🤔' },
    { id: 'happy', name: 'Happy', emoji: '😊' },
    { id: 'surprised', name: 'Surprised', emoji: '😲' },
    { id: 'nodding', name: 'Nodding', emoji: '👍' },
    { id: 'shaking', name: 'Shake Head', emoji: '👎' }
  ];

  const handleExpressionSelect = (expressionId) => {
    onExpressionChange(expressionId);
  };

  const handleGestureSelect = (gestureId) => {
    onGestureChange(gestureId);
  };

  const handleAnimationSelect = (animationId) => {
    onAnimationChange(animationId);
    setIsOpen(false);
  };

  return (
    <div className="animation-controller">
      <button
        className="animation-toggle"
        onClick={() => setIsOpen(!isOpen)}
        title="Controls"
      >
        <span className="icon">🎭</span>
        <span className="label">Controls</span>
      </button>

      {isOpen && (
        <div className="animation-panel">
          <div className="animation-header">
            <h4>Avatar Controls</h4>
            <button
              className="close-button"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
          </div>

          <div className="tabs">
            <button
              className={`tab ${activeTab === 'expressions' ? 'active' : ''}`}
              onClick={() => setActiveTab('expressions')}
            >
              😊 Expressions
            </button>
            <button
              className={`tab ${activeTab === 'gestures' ? 'active' : ''}`}
              onClick={() => setActiveTab('gestures')}
            >
              👋 Gestures
            </button>
            <button
              className={`tab ${activeTab === 'animations' ? 'active' : ''}`}
              onClick={() => setActiveTab('animations')}
            >
              🎬 Animations
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'expressions' && (
              <div className="animation-grid">
                {expressions.map((exp) => (
                  <button
                    key={exp.id}
                    className="animation-item"
                    onClick={() => handleExpressionSelect(exp.id)}
                  >
                    <span className="animation-emoji">{exp.emoji}</span>
                    <span className="animation-name">{exp.name}</span>
                  </button>
                ))}
              </div>
            )}

            {activeTab === 'gestures' && (
              <div className="animation-grid">
                {gestures.map((gesture) => (
                  <button
                    key={gesture.id}
                    className="animation-item"
                    onClick={() => handleGestureSelect(gesture.id)}
                  >
                    <span className="animation-emoji">{gesture.emoji}</span>
                    <span className="animation-name">{gesture.name}</span>
                  </button>
                ))}
              </div>
            )}

            {activeTab === 'animations' && (
              <div className="animation-grid">
                {animations.map((anim) => (
                  <button
                    key={anim.id}
                    className={`animation-item ${currentAnimation === anim.id ? 'active' : ''}`}
                    onClick={() => handleAnimationSelect(anim.id)}
                  >
                    <span className="animation-emoji">{anim.emoji}</span>
                    <span className="animation-name">{anim.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="animation-info">
            <p>Click any button to test expressions, gestures, or animations!</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnimationController;