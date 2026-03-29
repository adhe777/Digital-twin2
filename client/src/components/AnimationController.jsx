import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Float, Sparkles, Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

const AnimationController = ({ avatarState = 'neutral', userRole = 'Student', children }) => {
  const groupRef = useRef();
  const vfxRef = useRef();
  const isProfessional = userRole?.toLowerCase() === 'professional';
  
  // Transition states for smoothing
  const transition = useRef({
    headRotationX: 0,
    headRotationY: 0,
    bodyRotationX: 0,
    lArmRotationZ: 0,
    rArmRotationZ: 0,
    mouthScaleY: 1,
    mouthScaleX: 1,
    eyeScaleY: 1,
    bodyScale: 1
  });

  useFrame((state) => {
    if (!groupRef.current) return;
    
    const t = state.clock.getElapsedTime();
    const lerpFactor = 0.08; // Slightly slower for more "weight"
    
    // --- FIND NODES ---
    let headGroup, leftArmGroup, rightArmGroup;
    let eyeLeft, eyeRight, mouth;
    
    groupRef.current.traverse((child) => {
      if (child.name === 'headGroup') headGroup = child;
      if (child.name === 'leftArmGroup') leftArmGroup = child;
      if (child.name === 'rightArmGroup') rightArmGroup = child;
      if (child.name === 'eyeLeft') eyeLeft = child;
      if (child.name === 'eyeRight') eyeRight = child;
      if (child.name === 'mouth') mouth = child;
    });

    // --- TARGET VALUES ---
    let targetHeadX = 0;
    let targetHeadY = 0;
    let targetBodyX = 0;
    let targetLArmZ = 0;
    let targetRArmZ = 0;
    let targetMouthY = 1;
    let targetMouthX = 1;
    let targetEyeY = 1;
    let targetBodyScale = 1;

    // --- ORGANIC BASE MOTION (Idle / Breathing) ---
    // Multiple sine layers for non-repetitive organic feeling
    const breathing = Math.sin(t * 1.5) * 0.005;
    const microSway = Math.sin(t * 0.4) * 0.02;
    const macroSway = Math.cos(t * 0.2) * 0.01;
    
    targetBodyScale = 1 + breathing;
    groupRef.current.position.y = Math.sin(t * (isProfessional ? 0.8 : 1.2)) * 0.03 + macroSway;
    groupRef.current.position.x = microSway;

    // --- STATES LOGIC ---
    switch (avatarState) {
      case 'waving':
        targetLArmZ = 1.6 + Math.sin(t * 12) * 0.8;
        targetRArmZ = -0.2;
        targetHeadY = 0.25;
        targetHeadX = -0.1;
        targetMouthY = 2.2;
        targetMouthX = 1.1;
        break;

      case 'victory':
        const bounce = Math.abs(Math.sin(t * 10));
        groupRef.current.position.y += bounce * 0.3;
        targetLArmZ = 2.8 + Math.sin(t * 15) * 0.3;
        targetRArmZ = -2.8 - Math.sin(t * 15) * 0.3;
        targetHeadX = -0.3 + Math.sin(t * 20) * 0.05;
        targetMouthY = 3.5;
        targetMouthX = 2.2;
        break;

      case 'thinking':
        targetLArmZ = 1.0 + Math.sin(t * 2) * 0.1;
        targetRArmZ = -0.6;
        targetHeadX = -0.15;
        targetHeadY = 0.45;
        targetMouthY = 0.4;
        targetMouthX = 0.6;
        targetEyeY = 0.7; // Squinting
        break;

      case 'meditating':
        const flow = Math.sin(t * 0.8) * 0.15;
        groupRef.current.position.y += flow;
        targetBodyX = -0.1;
        targetLArmZ = 0.8;
        targetRArmZ = -0.8;
        targetEyeY = 0.1; // Eyes closed
        targetBodyScale = 1 + Math.sin(t * 0.5) * 0.02; 
        break;

      case 'happy':
        const joy = Math.abs(Math.sin(t * 12)) * 0.1;
        groupRef.current.position.y += joy;
        targetHeadY = Math.sin(t * 10) * 0.2;
        targetLArmZ = 0.6 + Math.sin(t * 15) * 0.4;
        targetRArmZ = -0.6 - Math.sin(t * 15) * 0.4;
        targetMouthY = 2.8;
        targetMouthX = 1.8;
        break;

      case 'sleepy':
        const heavyHead = 0.5 + Math.sin(t * 0.4) * 0.2;
        targetHeadX = heavyHead;
        groupRef.current.position.y += Math.sin(t * 0.6) * 0.04;
        targetEyeY = 0.15;
        targetMouthY = 1.5 + Math.abs(Math.sin(t * 0.3)) * 2; // Occasional yawning
        targetMouthX = 0.8;
        break;

      case 'tired':
        targetBodyX = 0.3;
        targetHeadX = 0.4;
        targetLArmZ = 0.15;
        targetRArmZ = -0.15;
        targetEyeY = 0.3;
        break;

      case 'focused':
        targetBodyX = -0.15;
        targetHeadX = 0.1;
        targetHeadY = Math.sin(t * 3) * 0.08;
        targetEyeY = 0.8;
        break;

      case 'talking':
        targetMouthY = 0.8 + Math.abs(Math.sin(t * 14)) * 3.8;
        targetMouthX = 1.2 + Math.sin(t * 10) * 0.6;
        targetHeadX = Math.sin(t * 8) * 0.12;
        targetHeadY = Math.cos(t * 6) * 0.08;
        targetLArmZ = 0.4 + Math.sin(t * 12) * 0.3;
        targetRArmZ = -0.4 - Math.cos(t * 12) * 0.3;
        break;

      case 'energetic':
        const vibration = Math.sin(t * 20) * 0.01;
        groupRef.current.position.y += Math.abs(Math.sin(t * 14)) * 0.15;
        groupRef.current.position.x += vibration;
        targetLArmZ = 1.0 + Math.sin(t * 18) * 0.5;
        targetRArmZ = -1.0 - Math.sin(t * 18) * 0.5;
        targetMouthY = 2.2;
        break;

      case 'exercising':
        const jmp = Math.abs(Math.sin(t * 14));
        groupRef.current.position.y += jmp * 0.35;
        targetLArmZ = 0.3 + (1 - jmp) * 2.8; 
        targetRArmZ = -0.3 - (1 - jmp) * 2.8;
        targetBodyX = 0.15;
        targetMouthY = 1.8;
        break;

      case 'exhausted':
        const heave = Math.sin(t * 8) * 0.2; 
        targetBodyX = 0.45 + heave;
        targetHeadX = 0.55 + heave;
        targetBodyScale = 1 + heave * 0.1;
        targetLArmZ = 0.05;
        targetRArmZ = -0.05;
        targetEyeY = 0.2;
        targetMouthY = 2.8; 
        break;

      default:
        // --- NATURAL IDLE (Looking around) ---
        const lookT = t * 0.2;
        const lookup = Math.sin(lookT * 2.1) * Math.cos(lookT * 0.9);
        const lookside = Math.cos(lookT * 1.5) * Math.sin(lookT * 1.1);
        
        // Random intervals of looking around
        const activeLook = Math.sin(t * 0.15) > 0.4;
        targetHeadX = activeLook ? lookup * 0.15 : Math.sin(t * 0.8) * 0.04;
        targetHeadY = activeLook ? lookside * 0.3 : Math.cos(t * 0.5) * 0.05;
        
        targetLArmZ = Math.sin(t * 1.2) * 0.08;
        targetRArmZ = -Math.cos(t * 1.2) * 0.08;
        break;
    }

    // --- APPLY SMOOTHED ANIMATIONS ---
    transition.current.headRotationX = THREE.MathUtils.lerp(transition.current.headRotationX, targetHeadX, lerpFactor);
    transition.current.headRotationY = THREE.MathUtils.lerp(transition.current.headRotationY, targetHeadY, lerpFactor);
    transition.current.bodyRotationX = THREE.MathUtils.lerp(transition.current.bodyRotationX, targetBodyX, lerpFactor);
    transition.current.lArmRotationZ = THREE.MathUtils.lerp(transition.current.lArmRotationZ, targetLArmZ, lerpFactor);
    transition.current.rArmRotationZ = THREE.MathUtils.lerp(transition.current.rArmRotationZ, targetRArmZ, lerpFactor);
    transition.current.mouthScaleY = THREE.MathUtils.lerp(transition.current.mouthScaleY, targetMouthY, lerpFactor);
    transition.current.mouthScaleX = THREE.MathUtils.lerp(transition.current.mouthScaleX, targetMouthX, lerpFactor);
    transition.current.eyeScaleY = THREE.MathUtils.lerp(transition.current.eyeScaleY, targetEyeY, lerpFactor);
    transition.current.bodyScale = THREE.MathUtils.lerp(transition.current.bodyScale, targetBodyScale, lerpFactor);

    if (headGroup) {
      headGroup.rotation.x = transition.current.headRotationX;
      headGroup.rotation.y = transition.current.headRotationY;
    }
    
    groupRef.current.rotation.x = transition.current.bodyRotationX;
    groupRef.current.scale.set(transition.current.bodyScale, transition.current.bodyScale, transition.current.bodyScale);

    if (leftArmGroup) leftArmGroup.rotation.z = transition.current.lArmRotationZ;
    if (rightArmGroup) rightArmGroup.rotation.z = transition.current.rArmRotationZ;
    if (mouth) mouth.scale.set(transition.current.mouthScaleX, transition.current.mouthScaleY, 1);

    // Blinking logic with smoothed eye scale
    const isBlinking = (t % 5.0) < 0.18;
    const currentEyeY = isBlinking ? 0.05 : transition.current.eyeScaleY;
    if (eyeLeft) eyeLeft.scale.y = currentEyeY;
    if (eyeRight) eyeRight.scale.y = currentEyeY;

    // --- VFX ANIMATIONS ---
    if (vfxRef.current) {
        vfxRef.current.rotation.y += 0.015;
    }
  });


  return (
    <group ref={groupRef}>
      {children}
      
      {/* VFX Layer */}
      <group position={[0, 0.8, 0]} ref={vfxRef}>
        {avatarState === 'waving' && (
          <Sparkles count={10} scale={1} size={1} speed={0.5} color="#0ea5e9" />
        )}

        {avatarState === 'victory' && (
          <group>
            <Sparkles count={50} scale={2} size={3} speed={2} color="#facc15" />
            <Sparkles count={30} scale={2} size={2} speed={1.5} color="#d946ef" />
            <Sparkles count={30} scale={2} size={2} speed={1.5} color="#0ea5e9" />
          </group>
        )}

        {avatarState === 'thinking' && (
          <Float speed={3} rotationIntensity={0.5} floatIntensity={1}>
             <Text
              position={[0, 0.5, 0]}
              fontSize={0.4}
              color="#8b5cf6"
              font="https://fonts.gstatic.com/s/pressstart2p/v14/e3t4euO8V-q9o-u0nY96v3OWSszOfQ.woff"
            >
              ?
            </Text>
          </Float>
        )}

        {avatarState === 'meditating' && (
          <group>
            <Sphere scale={[1.5, 0.1, 1.5]} position={[0, -1.2, 0]}>
              <MeshDistortMaterial color="#d946ef" speed={1} distort={0.3} transparent opacity={0.2} />
            </Sphere>
            <Sparkles count={15} scale={1.5} size={1} speed={0.2} color="#d946ef" />
          </group>
        )}

        {avatarState === 'sleepy' && (
          <group>
            <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
              <Text position={[0.4, 0.4, 0.2]} fontSize={0.25} color="#93c5fd" font="https://fonts.gstatic.com/s/pressstart2p/v14/e3t4euO8V-q9o-u0nY96v3OWSszOfQ.woff">Z</Text>
            </Float>
            <Float speed={2} rotationIntensity={0.5} floatIntensity={1.2} position={[0.2, 0.3, 0]}>
              <Text position={[0.5, 0.6, 0.1]} fontSize={0.15} color="#60a5fa" font="https://fonts.gstatic.com/s/pressstart2p/v14/e3t4euO8V-q9o-u0nY96v3OWSszOfQ.woff">z</Text>
            </Float>
          </group>
        )}

        {avatarState === 'happy' && (
          <Sparkles count={20} scale={1.5} size={2} speed={0.5} color="#0ea5e9" />
        )}

        {avatarState === 'focused' && (
          <group>
            <Sphere scale={1.2}>
              <MeshDistortMaterial color="#0284c7" speed={2} distort={0.4} transparent opacity={0.15} />
            </Sphere>
            <Sparkles count={10} scale={1} size={1} speed={0.2} color="#0ea5e9" />
          </group>
        )}

        {avatarState === 'energetic' && (
          <group>
             <Sparkles count={40} scale={1.8} size={4} speed={2} color="#d946ef" />
             <Sphere scale={1.1}>
              <MeshDistortMaterial color="#d946ef" speed={3} distort={0.2} transparent opacity={0.1} />
            </Sphere>
          </group>
        )}

        {avatarState === 'exercising' && (
           <group>
             <Sparkles count={60} scale={[2.5, 1, 2.5]} size={5} speed={5} color="#d946ef" />
             <Sparkles count={40} scale={[2.5, 1, 2.5]} size={3} speed={6} color="#0ea5e9" />
           </group>
        )}

        {avatarState === 'exhausted' && (
          <group position={[0, 0.3, 0.4]}>
            {/* Sweat drops */}
            <Float speed={5} rotationIntensity={0} floatIntensity={2}>
              <Sphere scale={0.04} position={[0.25, -0.1, 0]}>
                <meshStandardMaterial color="#0ea5e9" transparent opacity={0.8} />
              </Sphere>
              <Sphere scale={0.03} position={[-0.2, -0.3, 0]}>
                <meshStandardMaterial color="#0ea5e9" transparent opacity={0.8} />
              </Sphere>
              <Sphere scale={0.035} position={[-0.1, -0.5, 0.1]}>
                <meshStandardMaterial color="#0ea5e9" transparent opacity={0.8} />
              </Sphere>
            </Float>
            <Sparkles count={20} scale={1.5} size={1} speed={0.5} color="#0ea5e9" />
          </group>
        )}

        {avatarState === 'tired' && (
          <group opacity={0.5}>
            <Sphere scale={1.3}>
              <meshStandardMaterial color="#1e293b" transparent opacity={0.1} side={THREE.BackSide} />
            </Sphere>
             <Sparkles count={15} scale={1.5} size={1} speed={0.1} color="#94a3b8" />
          </group>
        )}
      </group>
    </group>
  );
};

export default AnimationController;
