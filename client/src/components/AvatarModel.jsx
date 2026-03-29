import React, { useMemo } from 'react';
import * as THREE from 'three';

const AvatarModel = ({ avatarState = 'neutral', gender = 'Male', userRole = 'Student' }) => {
  const isFemale = gender === 'Female';
  const isProfessional = userRole?.toLowerCase() === 'professional';

  // --- SHARED COLORS ---
  const skinColor = "#f3d9b1";
  const pantsColor = "#1e293b";
  const shoeColor = "#ffffff";

  // Role-based colors and items
  const hairColor = isFemale ? "#2a1b0a" : "#1a1a1a";
  const tshirtColor = isFemale ? "#d946ef" : "#0ea5e9";
  const accessoryColor = isFemale ? "#f472b6" : "#475569";

  // Mood-based lighting glow
  const moodGlow = useMemo(() => {
    switch (avatarState) {
      case 'happy': return { color: "#0ea5e9", intensity: 1.2 };
      case 'victory': return { color: "#facc15", intensity: 2.0 };
      case 'sleepy': return { color: "#60a5fa", intensity: 0.6 };
      case 'tired': return { color: "#94a3b8", intensity: 0.4 };
      case 'focused': return { color: "#8b5cf6", intensity: 1.2 };
      case 'energetic': return { color: "#10b981", intensity: 1.5 };
      default: return { color: "#ffffff", intensity: 0.2 };
    }
  }, [avatarState]);

  return (
    <group>
      {/* --- BODY (Torso) --- */}
      <group position={[0, 0, 0]}>
        <mesh castShadow receiveShadow>
          <capsuleGeometry args={[isFemale ? 0.21 : 0.23, isFemale ? 0.46 : 0.49, 32, 32]} />
          <meshPhysicalMaterial 
            color={tshirtColor} 
            roughness={0.6} 
            metalness={0.1}
            clearcoat={0.1}
            clearcoatRoughness={0.2}
          />
        </mesh>
        
        <mesh position={[0, 0.32, 0]}>
          <cylinderGeometry args={[0.07, 0.08, 0.1, 16]} />
          <meshStandardMaterial color={skinColor} roughness={0.4} />
        </mesh>

        {/* --- ACCESSORY: Headphones for Student (Idle) --- */}
        {!isProfessional && (
          <group position={[0, 0.35, 0]} rotation={[0.2, 0, 0]}>
            <mesh>
              <torusGeometry args={[0.18, 0.02, 16, 32, Math.PI]} />
              <meshStandardMaterial color="#1e293b" />
            </mesh>
            <mesh position={[-0.18, -0.05, 0]}>
              <cylinderGeometry args={[0.05, 0.05, 0.08, 16]} />
              <meshStandardMaterial color="#1e293b" />
            </mesh>
            <mesh position={[0.18, -0.05, 0]}>
              <cylinderGeometry args={[0.05, 0.05, 0.08, 16]} />
              <meshStandardMaterial color="#1e293b" />
            </mesh>
          </group>
        )}
      </group>

      {/* --- HEAD --- */}
      <group position={[0, 0.72, 0]} name="headGroup">
        <mesh castShadow name="head">
          <sphereGeometry args={[isFemale ? 0.245 : 0.255, 32, 32]} />
          <meshStandardMaterial color={skinColor} roughness={0.3} />
        </mesh>

        {/* --- HAIR --- */}
        {isFemale ? (
          <group>
            <mesh position={[0, 0.1, -0.05]} rotation={[0.1, 0, 0]}>
              <sphereGeometry args={[0.27, 32, 32, 0, Math.PI * 2, 0, Math.PI / 1.6]} />
              <meshStandardMaterial color={hairColor} roughness={0.4} />
            </mesh>
            <mesh position={[-0.2, -0.1, -0.05]} rotation={[0.1, 0, 0.2]}>
              <capsuleGeometry args={[0.085, 0.38, 16, 16]} />
              <meshStandardMaterial color={hairColor} />
            </mesh>
            <mesh position={[0.2, -0.1, -0.05]} rotation={[0.1, 0, -0.2]}>
              <capsuleGeometry args={[0.085, 0.38, 16, 16]} />
              <meshStandardMaterial color={hairColor} />
            </mesh>
          </group>
        ) : (
          <group>
            <mesh position={[0, 0.12, 0]}>
              <sphereGeometry args={[0.27, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <meshStandardMaterial color={hairColor} />
            </mesh>
            <group position={[0, 0.2, 0.1]}>
               {/* Messy spikes */}
               {[0, 1, 2].map((i) => (
                 <mesh key={i} position={[i * 0.1 - 0.1, 0.05, 0]} rotation={[0.5, 0, i * 0.2 - 0.2]}>
                   <coneGeometry args={[0.08, 0.15, 8]} />
                   <meshStandardMaterial color={hairColor} />
                 </mesh>
               ))}
            </group>
          </group>
        )}

        {/* --- FACE --- */}
        <group position={[0, -0.02, 0.22]}>
          <group position={[0, 0.02, 0]}>
            {/* Eyes */}
            <mesh position={[-0.09, 0, 0]} name="eyeLeft">
              <sphereGeometry args={[0.045, 24, 24]} />
              <meshBasicMaterial color="#ffffff" />
              <mesh position={[0, 0, 0.03]}>
                <sphereGeometry args={[0.025, 12, 12]} />
                <meshBasicMaterial color="#000000" />
                {/* Glint */}
                <mesh position={[0.01, 0.01, 0.01]}>
                   <sphereGeometry args={[0.008, 8, 8]} />
                   <meshBasicMaterial color="#ffffff" />
                </mesh>
              </mesh>
            </mesh>
            <mesh position={[0.09, 0, 0]} name="eyeRight">
              <sphereGeometry args={[0.045, 24, 24]} />
              <meshBasicMaterial color="#ffffff" />
              <mesh position={[0, 0, 0.03]}>
                <sphereGeometry args={[0.025, 12, 12]} />
                <meshBasicMaterial color="#000000" />
                {/* Glint */}
                <mesh position={[0.01, 0.01, 0.01]}>
                   <sphereGeometry args={[0.008, 8, 8]} />
                   <meshBasicMaterial color="#ffffff" />
                </mesh>
              </mesh>
            </mesh>
          </group>

          {/* Eyebrows */}
          <mesh position={[-0.09, 0.1, 0]} rotation={[0, 0, isFemale ? 0.15 : 0.08]} name="eyebrowLeft">
            <boxGeometry args={[0.08, 0.015, 0.01]} />
            <meshStandardMaterial color={hairColor} />
          </mesh>
          <mesh position={[0.09, 0.1, 0]} rotation={[0, 0, isFemale ? -0.15 : -0.08]} name="eyebrowRight">
            <boxGeometry args={[0.08, 0.015, 0.01]} />
            <meshStandardMaterial color={hairColor} />
          </mesh>

          {/* Mouth */}
          <mesh position={[0, -0.1, 0]} name="mouth" rotation={[0, 0.2, 0]}>
            <capsuleGeometry args={[0.028, 0.018, 12, 12]} />
            <meshStandardMaterial color="#3f1f00" roughness={0.8} />
          </mesh>
        </group>
      </group>

      {/* --- ARMS --- */}
      <group position={[-0.32, 0.15, 0]} name="leftArmGroup">
          <mesh castShadow>
              <capsuleGeometry args={[0.06, 0.38, 16, 16]} />
              <meshStandardMaterial color={skinColor} />
          </mesh>
          {/* Smartwatch for Pro */}
          {isProfessional && (
            <mesh position={[0, -0.12, 0.05]} rotation={[0, 0, 0]}>
               <torusGeometry args={[0.065, 0.012, 8, 16]} />
               <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.2} />
            </mesh>
          )}
      </group>

      <group position={[0.32, 0.15, 0]} name="rightArmGroup">
          <mesh castShadow>
              <capsuleGeometry args={[0.06, 0.38, 16, 16]} />
              <meshStandardMaterial color={skinColor} />
          </mesh>
      </group>

      {/* --- LEGS --- */}
      <group position={[0, -0.42, 0]}>
        <mesh castShadow position={[-0.11, -0.25, 0]}>
          <capsuleGeometry args={[0.08, 0.45, 16, 16]} />
          <meshStandardMaterial color={pantsColor} roughness={0.7} />
        </mesh>
        <mesh castShadow position={[0.11, -0.25, 0]}>
          <capsuleGeometry args={[0.08, 0.45, 16, 16]} />
          <meshStandardMaterial color={pantsColor} roughness={0.7} />
        </mesh>

        {/* Shoes */}
        <mesh position={[-0.11, -0.55, 0.06]} castShadow>
          <boxGeometry args={[0.12, 0.08, 0.2]} />
          <meshPhysicalMaterial color={shoeColor} roughness={0.2} metalness={0.1} />
        </mesh>
        <mesh position={[0.11, -0.55, 0.06]} castShadow>
          <boxGeometry args={[0.12, 0.08, 0.2]} />
          <meshPhysicalMaterial color={shoeColor} roughness={0.2} metalness={0.1} />
        </mesh>
      </group>

      {/* --- AMBIENT GLOW SPHERE --- */}
      <mesh position={[0, 0.1, 0]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshPhysicalMaterial 
            color={moodGlow.color} 
            transparent 
            opacity={0.08} 
            emissive={moodGlow.color}
            emissiveIntensity={moodGlow.intensity * 0.5}
            transmission={0.8}
            thickness={2}
        />
      </mesh>
    </group>
  );
};

export default AvatarModel;
