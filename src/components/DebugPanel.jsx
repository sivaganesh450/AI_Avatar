import React, { useState } from 'react';
import './DebugPanel.css';

const DebugPanel = ({ currentExpression, currentGesture, currentAnimation }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="debug-panel">
      <button 
        className="debug-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        🔍 Debug
      </button>

      {isOpen && (
        <div className="debug-content">
          <h4>Current States</h4>
          <div className="debug-info">
            <div className="debug-item">
              <strong>Expression:</strong> 
              <span className="debug-value">{currentExpression}</span>
            </div>
            <div className="debug-item">
              <strong>Gesture:</strong> 
              <span className="debug-value">{currentGesture}</span>
            </div>
            <div className="debug-item">
              <strong>Animation:</strong> 
              <span className="debug-value">{currentAnimation}</span>
            </div>
          </div>
          <div className="debug-instructions">
            <p>📋 Check browser console (F12) for detailed logs:</p>
            <ul>
              <li>✓ Morph target names</li>
              <li>✓ Bone names found</li>
              <li>✓ Applied expressions</li>
              <li>✓ Gesture animations</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default DebugPanel;