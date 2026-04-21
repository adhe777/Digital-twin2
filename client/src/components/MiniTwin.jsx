import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, Environment, Float, ContactShadows } from '@react-three/drei';
import AvatarModel from './AvatarModel';
import AnimationController from './AnimationController';

const MiniTwin = ({ 
  avatarState = 'neutral', 
  gender = 'Male', 
  userRole = 'Student',
  className = "" 
}) => {
  return (
    <div className={`relative w-12 h-12 overflow-hidden rounded-full bg-gradient-to-br from-white/10 to-white/5 border border-white/20 shadow-inner ${className}`}>
      <Canvas shadows gl={{ antialias: true, alpha: true }} dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0.7, 1.8]} fov={45} />
        
        <ambientLight intensity={1.5} />
        <pointLight position={[2, 2, 2]} intensity={2} color="#4f8cff" />
        <pointLight position={[-2, 1, -2]} intensity={1} color="#8b5cf6" />
        <spotLight position={[0, 5, 0]} intensity={2} angle={0.5} penumbra={1} castShadow />

        <Suspense fallback={null}>
          <Environment preset="city" />
          
          <AnimationController avatarState={avatarState} userRole={userRole}>
            {/* Focus on the head and torso for the mini preview */}
            <group scale={2.8} position={[0, -2.1, 0]}>
              <AvatarModel avatarState={avatarState} gender={gender} userRole={userRole} />
            </group>
          </AnimationController>
          
          {/* Subtle floor shadow */}
          <ContactShadows 
            position={[0, -2.2, 0]} 
            opacity={0.3} 
            scale={4} 
            blur={2} 
            far={1} 
          />
        </Suspense>
        
        {/* Soft floating motion for the whole button content */}
        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.2}>
           {/* Placeholder for any floating particles if needed */}
        </Float>
      </Canvas>
    </div>
  );
};

export default MiniTwin;
