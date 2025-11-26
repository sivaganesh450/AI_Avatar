import React, { useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import ChatInterface from './components/ChatInterface';
import VoiceControl from './components/VoiceControl';
import AnimationController from './components/AnimationController';
import LipSyncAvatar from './LipSyncAvatar';
import aiService from './services/aiService';
import speechService from './services/speechService';
import expressionController from './utils/ExpressionController';
import './App.css';

function App() {
  const [messages, setMessages] = useState([
    {
      role: 'avatar',
      content: 'Hello! I\'m your interactive avatar. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [isAvatarSpeaking, setIsAvatarSpeaking] = useState(false);
  const [currentAnimation, setCurrentAnimation] = useState('idle');
  const [mouthValue, setMouthValue] = useState(0);
  const [currentExpression, setCurrentExpression] = useState('neutral');
  const [currentGesture, setCurrentGesture] = useState('none');
  
  const audioRef = useRef(null);

  /**
   * Handle sending messages (from chat or voice)
   */
  const handleSendMessage = async (userMessage) => {
    console.log('User message:', userMessage);
    
    // Add user message to chat
    const userMsg = {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      // Set avatar to thinking
      setCurrentAnimation('idle');
      setCurrentExpression('thinking');
      // Don't set gesture during thinking
      setCurrentGesture('none');

      // Get AI response
      console.log('Getting AI response...');
      const aiResponse = await aiService.getResponse(userMessage);
      console.log('AI response:', aiResponse);

      // Add AI response to chat first
      const avatarMsg = {
        role: 'avatar',
        content: aiResponse,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, avatarMsg]);

      // Small delay to ensure chat message is visible
      await new Promise(resolve => setTimeout(resolve, 300));

      // Analyze response for emotion
      const emotion = expressionController.getEmotionFromText(aiResponse);
      console.log('Detected emotion:', emotion);
      
      setCurrentExpression(emotion.expression);
      // Keep gesture none - no gestures during talking
      setCurrentGesture('none');

      // Now speak the response after message is displayed
      await speakResponse(aiResponse);

    } catch (error) {
      console.error('Error in handleSendMessage:', error);
      
      const errorMsg = {
        role: 'avatar',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
      setCurrentAnimation('idle');
      setCurrentExpression('worried');
      setCurrentGesture('none');
    }
  };

  /**
   * Handle voice input from VoiceControl
   */
  const handleVoiceInput = (transcript) => {
    if (transcript && transcript.trim()) {
      handleSendMessage(transcript);
    }
  };

  /**
   * Speak the avatar response with lip-sync
   */
  const speakResponse = async (text) => {
    console.log('Starting speech:', text);
    setCurrentAnimation('idle');
    setIsAvatarSpeaking(true);
    // Keep gesture none during speaking - no hand movements
    setCurrentGesture('none');

    // Mouth animation during speech - reduced intensity
    const animationInterval = setInterval(() => {
      setMouthValue(() => {
        const random = Math.random();
        const intensity = random > 0.3 ? random * 0.4 : random * 0.15;
        return intensity;
      });
    }, 80);

    try {
      await speechService.speak(
        text,
        () => {
          console.log('Speech started');
          setIsAvatarSpeaking(true);
        },
        () => {
          console.log('Speech ended');
          clearInterval(animationInterval);
          setMouthValue(0);
          setIsAvatarSpeaking(false);
          setCurrentAnimation('idle');
          setCurrentExpression('neutral');
          setCurrentGesture('none');
        },
        (event) => {
          if (event.name === 'word') {
            setMouthValue(0.4);
          }
        }
      );
    } catch (error) {
      console.error('Speech error:', error);
      clearInterval(animationInterval);
      setMouthValue(0);
      setIsAvatarSpeaking(false);
      setCurrentAnimation('idle');
      setCurrentExpression('neutral');
      setCurrentGesture('none');
    }
  };

  /**
   * Handle animation change from AnimationController
   */
  const handleAnimationChange = (animationId) => {
    if (!isAvatarSpeaking) {
      setCurrentAnimation(animationId);
      
      if (animationId !== 'idle') {
        setTimeout(() => {
          setCurrentAnimation('idle');
        }, 3000);
      }
    }
  };

  /**
   * Handle expression change from AnimationController
   */
  const handleExpressionChange = (expressionId) => {
    console.log('Expression changed to:', expressionId);
    setCurrentExpression(expressionId);
    
    // Auto-return to neutral after 5 seconds
    if (expressionId !== 'neutral') {
      setTimeout(() => {
        setCurrentExpression('neutral');
      }, 5000);
    }
  };

  /**
   * Handle gesture change from AnimationController
   * Only allow gestures when avatar is NOT speaking
   */
  const handleGestureChange = (gestureId) => {
    // Block gesture changes while speaking
    if (isAvatarSpeaking) {
      console.log('Gesture blocked - avatar is speaking');
      return;
    }
    
    console.log('Gesture changed to:', gestureId);
    setCurrentGesture(gestureId);
    
    // Auto-return to none after 5 seconds
    if (gestureId !== 'none') {
      setTimeout(() => {
        setCurrentGesture('none');
      }, 5000);
    }
  };

  return (
    <div className="App">
      {/* 3D Canvas with Avatar - Half body visible */}
      <Canvas
        camera={{ position: [0, 0.3, 3], fov: 50 }}
        style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'linear-gradient(to bottom, #1a1a2e, #16213e)'
        }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <spotLight position={[0, 5, 0]} angle={0.3} penumbra={1} intensity={0.5} />
        
        <LipSyncAvatar 
          url="/avatar1.glb"
          animation="idle"
          mouthValue={mouthValue}
          expression={currentExpression}
          gesture={currentGesture}
          position={[0, -0.8, 0]}
        />
        
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minDistance={2}
          maxDistance={5}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2.2}
        />
      </Canvas>

      <AnimationController
        onAnimationChange={handleAnimationChange}
        onExpressionChange={handleExpressionChange}
        onGestureChange={handleGestureChange}
        currentAnimation={currentAnimation}
        isAvatarSpeaking={isAvatarSpeaking}
      />

      <VoiceControl
        onVoiceInput={handleVoiceInput}
        isAvatarSpeaking={isAvatarSpeaking}
      />

      <ChatInterface
        onSendMessage={handleSendMessage}
        messages={messages}
        isAvatarSpeaking={isAvatarSpeaking}
      />

      <audio ref={audioRef} style={{ display: 'none' }} />
    </div>
  );
}

export default App;