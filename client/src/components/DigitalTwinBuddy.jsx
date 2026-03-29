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
  goalCompleted = false,
  className = "" 
}) => {
  const [isGreeting, setIsGreeting] = useState(true);

  // Greeting timer on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsGreeting(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Digital Twin state logic (Refined Priority)
  const avatarState = useMemo(() => {
    if (isGreeting) return 'waving';
    if (isTalking) return 'talking';
    
    // 1. Victory (High Priority)
    if (goalCompleted || productivityScore >= 90) return 'victory';

    // 2. Workout Triggers (High Intensity overrides others)
    if (workoutEnabled && workoutIntensity === 'High') return 'exhausted';
    if (workoutEnabled && workoutIntensity === 'Medium') return 'exercising';

    // 3. Specialized States
    if (studyHours > 2 && productivityScore < 60) return 'thinking';
    if (sleepHours >= 7 && mood >= 4 && !workoutEnabled) return 'meditating';

    // 4. Base Needs / Mood
    if (sleepHours < 5) return 'sleepy';
    if (mood <= 2) return 'tired';
    
    // 5. Workout Low Intensity / Fitness Streak
    if (workoutEnabled) return 'energetic';
    if (fitnessStreak >= 7) return 'energetic';

    // 6. General positive
    if (productivityScore > 70) return 'happy';
    
    return 'neutral';
  }, [sleepHours, productivityScore, isTalking, fitnessStreak, workoutEnabled, workoutIntensity, mood, studyHours, goalCompleted, isGreeting]);

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
          
          <AnimationController avatarState={avatarState} userRole={userRole}>
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

      {/* Surrounding Effects Overlays */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Sleepy ZZZs */}
        {avatarState === 'sleepy' && (
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-32 h-32">
            <span className="absolute top-0 right-0 text-2xl font-bold text-blue-400 animate-zzz" style={{ animationDelay: '0s' }}>Z</span>
            <span className="absolute top-4 right-4 text-xl font-bold text-blue-300 animate-zzz" style={{ animationDelay: '0.5s' }}>Z</span>
            <span className="absolute top-8 right-8 text-lg font-bold text-blue-200 animate-zzz" style={{ animationDelay: '1s' }}>Z</span>
          </div>
        )}

        {/* Exhausted Sweat */}
        {(avatarState === 'exhausted' || avatarState === 'exercising') && (
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-40 h-40">
            <span className="absolute top-0 left-1/4 text-xl animate-sweat" style={{ animationDelay: '0s' }}>💧</span>
            <span className="absolute top-4 right-1/4 text-lg animate-sweat" style={{ animationDelay: '0.7s' }}>💧</span>
          </div>
        )}

        {/* Energetic Aura */}
        {(avatarState === 'energetic' || avatarState === 'victory') && (
          <div className="absolute inset-x-0 bottom-1/4 flex justify-center">
            <div className="w-48 h-48 rounded-full bg-yellow-400/20 blur-3xl animate-fire-pulse" />
          </div>
        )}
      </div>
    </div>
  );
};

export default DigitalTwinBuddy;
