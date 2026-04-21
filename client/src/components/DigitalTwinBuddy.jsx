import React, { Suspense, useMemo, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows, Float } from '@react-three/drei';
import AvatarModel from './AvatarModel';
import AnimationController from './AnimationController';

const DigitalTwinBuddy = ({ 
  sleepHours = 8, 
  productivityScore = 70, 
  focusScore = 65, 
  mood = 3,
  studyHours = 0,
  workoutEnabled = false,
  workoutIntensity = 'Medium',
  isTalking = false,
  userRole = 'Student',
  gender = 'Male',
  fitnessStreak = 0,
  streak = 0,
  goalCompleted = false,
  className = "" 
}) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isGreeting, setIsGreeting] = useState(true);

  // Mouse tracking logic
  useEffect(() => {
    const handleMouseMove = (e) => {
      // Normalize mouse coordinates (-1 to 1)
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      setMousePos({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Greeting timer on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsGreeting(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Digital Twin state logic (Refined Priority)
  const avatarState = useMemo(() => {
    if (isTalking) return 'talking';
    if (isGreeting) return 'waving';
    
    // 1. Victory (High Priority)
    if (goalCompleted || productivityScore >= 90 || streak >= 3) return 'victory';

    // 2. Critical Needs (Burnout/Exhaustion)
    if (workoutEnabled && workoutIntensity === 'High') return 'exhausted';
    if (sleepHours < 5) return 'sleepy';
    if (mood <= 2) return 'tired';

    // 3. Activity Based
    if (workoutEnabled) return 'energetic';
    if (studyHours > 2 && productivityScore < 60) return 'thinking';
    if (sleepHours >= 7 && mood >= 4 && !workoutEnabled) return 'meditating';

    // 4. General Positive
    if (productivityScore > 70 || streak > 0) return 'happy';
    if (fitnessStreak >= 7) return 'energetic';
    
    return 'neutral';
  }, [sleepHours, productivityScore, isTalking, fitnessStreak, streak, workoutEnabled, workoutIntensity, mood, studyHours, goalCompleted, isGreeting]);

  return (
    <div className={`relative w-full h-[320px] ${className}`}>
      {/* Background Glow */}
      <div 
        className="absolute inset-0 blur-3xl opacity-20 pointer-events-none transition-colors duration-1000"
        style={{ 
          backgroundColor: 
            avatarState === 'waving' ? '#6366f1' :
            avatarState === 'victory' ? '#facc15' :
            avatarState === 'meditating' ? '#ec4899' :
            avatarState === 'thinking' ? '#8b5cf6' :
            avatarState === 'energetic' ? '#10b981' :
            avatarState === 'exercising' ? '#f59e0b' :
            avatarState === 'exhausted' ? '#ef4444' :
            avatarState === 'happy' ? '#38bdf8' : 
            avatarState === 'sleepy' ? '#93c5fd' : 
            avatarState === 'tired' ? '#94a3b8' : 
            avatarState === 'focused' ? '#4338ca' : '#6366f1'
        }}
      />

      <Canvas shadows gl={{ antialias: true }} dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={38} />
        
        <ambientLight intensity={0.8} />
        {/* Dynamic Key Light */}
        <directionalLight 
          position={[5, 5, 5]} 
          intensity={1.8} 
          color="#ffffff" 
          castShadow 
          shadow-mapSize={[1024, 1024]}
        />
        {/* Rim Light for depth */}
        <pointLight position={[-5, 2, -5]} intensity={1.2} color="#8b5cf6" />
        {/* Dynamic Orbing Light */}
        <Float speed={2} rotationIntensity={1} floatIntensity={0.5}>
           <pointLight position={[2, 1, 2]} intensity={0.5} color="#4f8cff" />
        </Float>

        <Suspense fallback={null}>
          <Environment preset="city" />
          
          <AnimationController 
            avatarState={avatarState} 
            userRole={userRole}
            mousePos={mousePos}
          >
            <group scale={1.75} position={[0, -0.7, 0]}>
              <AvatarModel avatarState={avatarState} gender={gender} userRole={userRole} />
            </group>
          </AnimationController>

          <ContactShadows 
            position={[0, -1.6, 0]} 
            opacity={0.4} 
            scale={10} 
            blur={2.5} 
            far={4} 
          />
        </Suspense>
        
        <OrbitControls 
          enableRotate={true}
          autoRotate={avatarState === 'neutral' || avatarState === 'meditating'}
          autoRotateSpeed={0.5}
          enableZoom={false} 
          enablePan={false} 
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </div>
  );
};

export default DigitalTwinBuddy;
