import React, { useEffect, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { gestureAnimations, findArmBones } from './utils/GestureAnimations';

const LipSyncAvatar = ({ 
  url, 
  animation, 
  mouthValue, 
  expression = 'neutral', 
  gesture = 'idle', 
  position = [0, 0, 0] 
}) => {
  const group = useRef();
  const { scene, animations } = useGLTF(url);
  const mixer = useRef();
  const actions = useRef({});
  const currentAction = useRef();
  const morphTargetMeshes = useRef([]);
  const expressionMeshes = useRef([]);
  const armBones = useRef({});
  const skeleton = useRef(null);
  const gestureTime = useRef(0);

  // Initialize animations
  useEffect(() => {
    if (animations && animations.length > 0) {
      mixer.current = new THREE.AnimationMixer(scene);
      
      animations.forEach((clip) => {
        const action = mixer.current.clipAction(clip);
        actions.current[clip.name] = action;
      });

      console.log('Available animations:', Object.keys(actions.current));
    }

    // Find meshes with morph targets and skeleton
    scene.traverse((child) => {
      if (child.isMesh && child.morphTargetInfluences) {
        morphTargetMeshes.current.push(child);
        expressionMeshes.current.push(child);
        console.log('Found morph target mesh:', child.name);
        if (child.morphTargetDictionary) {
          console.log('=== ALL AVAILABLE MORPH TARGETS ===');
          const morphNames = Object.keys(child.morphTargetDictionary);
          morphNames.forEach(name => {
            console.log(`  - ${name}`);
          });
          console.log('===================================');
        }
      }
      
      // Find skeleton for hand gestures
      if (child.isSkinnedMesh && child.skeleton) {
        skeleton.current = child.skeleton;
        armBones.current = findArmBones(child.skeleton);
      }
    });

    return () => {
      if (mixer.current) {
        mixer.current.stopAllAction();
      }
    };
  }, [scene, animations]);

  // Handle animation changes
  useEffect(() => {
    if (!mixer.current || !actions.current) return;

    const animationMap = {
      'idle': 'Idle',
      'wave': 'Wave',
      'talking': 'Talking',
      'thinking': 'Thinking',
      'happy': 'Happy',
      'surprised': 'Surprised',
      'nodding': 'Nodding',
      'shaking': 'Shaking'
    };

    const animationName = animationMap[animation] || 'Idle';
    const action = actions.current[animationName];

    if (action) {
      if (currentAction.current && currentAction.current !== action) {
        currentAction.current.fadeOut(0.5);
      }
      action.reset().fadeIn(0.5).play();
      currentAction.current = action;
    }
  }, [animation]);

  // Update mouth morph targets
  useEffect(() => {
    if (morphTargetMeshes.current.length > 0) {
      morphTargetMeshes.current.forEach((mesh) => {
        if (mesh.morphTargetDictionary && mesh.morphTargetInfluences) {
          // Use Ready Player Me viseme morphs for lip-sync
          const visemes = [
            'viseme_aa', 'viseme_E', 'viseme_I', 'viseme_O', 'viseme_U',
            'viseme_PP', 'viseme_FF', 'viseme_TH', 'viseme_DD', 
            'viseme_kk', 'viseme_CH', 'viseme_SS', 'viseme_nn', 'viseme_RR'
          ];

          // Apply mouth value to all visemes with variation
          visemes.forEach((viseme, index) => {
            const morphIndex = mesh.morphTargetDictionary[viseme];
            if (morphIndex !== undefined) {
              // Vary the intensity based on viseme type for natural movement
              const variation = 0.7 + (Math.sin(index) * 0.3);
              mesh.morphTargetInfluences[morphIndex] = Math.min(mouthValue * variation, 1.0);
            }
          });

          // Also use jawOpen for more pronounced mouth opening
          const jawIndex = mesh.morphTargetDictionary['jawOpen'];
          if (jawIndex !== undefined) {
            mesh.morphTargetInfluences[jawIndex] = mouthValue * 0.5;
          }
        }
      });
    }
  }, [mouthValue]);

  // Update facial expressions
  useEffect(() => {
    if (expressionMeshes.current.length > 0) {
      expressionMeshes.current.forEach((mesh) => {
        if (mesh.morphTargetDictionary && mesh.morphTargetInfluences) {
          
          // Get all available morphs
          const availableMorphs = Object.keys(mesh.morphTargetDictionary);
          console.log('=== EXPRESSION DEBUG ===');
          console.log('Target expression:', expression);
          
          // Reset ALL morph targets to 0 first (except viseme for speech)
          availableMorphs.forEach(key => {
            if (!key.startsWith('viseme_')) {
              const index = mesh.morphTargetDictionary[key];
              if (index !== undefined) {
                mesh.morphTargetInfluences[index] = 0;
              }
            }
          });

          // Helper to set morph value
          const setMorph = (morphName, value) => {
            const index = mesh.morphTargetDictionary[morphName];
            if (index !== undefined) {
              mesh.morphTargetInfluences[index] = value;
              console.log(`  ✓ ${morphName} = ${value}`);
              return true;
            }
            return false;
          };

          // Create rich expressions using Ready Player Me morph targets
          switch(expression) {
            case 'happy':
            case 'smile':
              // Big genuine smile with squinted eyes
              setMorph('mouthSmileLeft', 0.8);
              setMorph('mouthSmileRight', 0.8);
              setMorph('eyeSquintLeft', 0.4);
              setMorph('eyeSquintRight', 0.4);
              setMorph('cheekSquintLeft', 0.5);
              setMorph('cheekSquintRight', 0.5);
              setMorph('mouthDimpleLeft', 0.3);
              setMorph('mouthDimpleRight', 0.3);
              console.log('  😊 Happy: Smile + squinted eyes + raised cheeks');
              break;

            case 'sad':
              // Sad with frown and inner brows up
              setMorph('mouthFrownLeft', 0.7);
              setMorph('mouthFrownRight', 0.7);
              setMorph('mouthLowerDownLeft', 0.6);
              setMorph('mouthLowerDownRight', 0.6);
              setMorph('browInnerUp', 0.7);
              setMorph('eyeSquintLeft', 0.2);
              setMorph('eyeSquintRight', 0.2);
              setMorph('mouthShrugLower', 0.3);
              console.log('  😢 Sad: Frown + lowered mouth + sad brows');
              break;

            case 'surprised':
              // Wide eyes, raised brows, open mouth
              setMorph('eyeWideLeft', 1.0);
              setMorph('eyeWideRight', 1.0);
              setMorph('browOuterUpLeft', 0.9);
              setMorph('browOuterUpRight', 0.9);
              setMorph('browInnerUp', 0.8);
              setMorph('jawOpen', 0.6);
              setMorph('mouthFunnel', 0.4);
              console.log('  😲 Surprised: Wide eyes + raised brows + open mouth');
              break;

            case 'thinking':
              // STRONG thinking look - very visible
              setMorph('browInnerUp', 0.7);
              setMorph('browOuterUpLeft', 0.8);
              setMorph('browOuterUpRight', 0.3);
              setMorph('mouthPucker', 0.7);
              setMorph('mouthFunnel', 0.3);
              setMorph('jawLeft', 0.4);
              setMorph('mouthLeft', 0.5);
              setMorph('eyeSquintRight', 0.4);
              setMorph('mouthRollLower', 0.4);
              setMorph('mouthUpperUpLeft', 0.2);
              console.log('  🤔 Thinking: STRONG - Asymmetric brows + pursed lips + jaw left');
              break;

            case 'angry':
              // Angry frown with furrowed brows
              setMorph('mouthFrownLeft', 0.9);
              setMorph('mouthFrownRight', 0.9);
              setMorph('eyeSquintLeft', 0.8);
              setMorph('eyeSquintRight', 0.8);
              setMorph('browDownLeft', 0.9);
              setMorph('browDownRight', 0.9);
              setMorph('noseSneerLeft', 0.6);
              setMorph('noseSneerRight', 0.6);
              setMorph('mouthPressLeft', 0.5);
              setMorph('mouthPressRight', 0.5);
              setMorph('jawForward', 0.3);
              console.log('  😠 Angry: Frown + squint + furrowed brows + nose sneer');
              break;

            case 'worried':
              // Worried with raised inner brows
              setMorph('browInnerUp', 0.9);
              setMorph('browOuterUpLeft', 0.4);
              setMorph('browOuterUpRight', 0.4);
              setMorph('eyeWideLeft', 0.6);
              setMorph('eyeWideRight', 0.6);
              setMorph('mouthFrownLeft', 0.5);
              setMorph('mouthFrownRight', 0.5);
              setMorph('mouthLowerDownLeft', 0.4);
              setMorph('mouthLowerDownRight', 0.4);
              setMorph('mouthStretchLeft', 0.2);
              setMorph('mouthStretchRight', 0.2);
              console.log('  😰 Worried: Raised inner brows + wide eyes + slight frown');
              break;

            case 'neutral':
            default:
              console.log('  😐 Neutral: All morphs reset');
              break;
          }
          
          console.log('=======================');
        }
      });
    }
  }, [expression]);

  // Animation loop with gestures
  useFrame((state, delta) => {
    if (mixer.current) {
      mixer.current.update(delta);
    }

    // Update gesture time
    gestureTime.current += delta;

    // Apply hand gestures if bones are available
    if (Object.keys(armBones.current).length > 0 && gesture && gesture !== 'idle') {
      const gestureFunc = gestureAnimations[gesture];
      if (gestureFunc) {
        // Reset first
        gestureAnimations.reset(armBones.current);
        // Apply gesture
        try {
          gestureFunc(armBones.current, gestureTime.current);
        } catch (error) {
          console.error('Error applying gesture:', error);
        }
      } else {
        console.warn('Gesture function not found:', gesture);
      }
    } else if (gesture === 'idle') {
      // Apply idle gesture
      gestureAnimations.idle(armBones.current, gestureTime.current);
    }

    // Idle animation with breathing
    if (group.current && animation === 'idle') {
      group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.05;
      const breatheOffset = Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
      group.current.position.set(position[0], position[1] + breatheOffset, position[2]);
    } else if (group.current) {
      group.current.position.set(position[0], position[1], position[2]);
    }
  });

  return (
    <group ref={group} position={position}>
      <primitive object={scene} />
    </group>
  );
};

export default LipSyncAvatar;