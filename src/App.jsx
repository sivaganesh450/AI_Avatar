import React from 'react';
import { Scene } from './components/Scene';

function App() {
  return (
    <div className="App">
      <Scene />
      {/* Interaction UI will go on top of the Scene */}
      <div 
        style={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          padding: '20px', 
          backgroundColor: 'rgba(0,0,0,0.5)',
          color: 'white',
        }}
      >
        <p>Your Interactive Avatar is Ready!</p>
        <p>Next Steps: Add Animation and Conversational AI.</p>
      </div>
    </div>
  );
}

export default App;