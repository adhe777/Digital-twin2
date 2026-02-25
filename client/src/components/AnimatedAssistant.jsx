import React from 'react';
import { motion } from 'framer-motion';

/**
 * AnimatedAssistant Component
 * An original animated character that reacts to mood and talking states.
 * 
 * @param {number} mood - Mood level from 1 to 5
 * @param {boolean} isTalking - Whether the AI is currently "speaking" or processing
 * @param {string} className - Optional tailwind classes
 */
const AnimatedAssistant = ({ mood = 3, isTalking = false, sleep = 8, productivity = 70, className = "" }) => {

    // Determine overall state based on props
    const getCharacterState = () => {
        if (sleep < 5) return 'sleepy';
        if (productivity < 50 || sleep < 6) return 'tired';
        if (mood <= 2) return 'sad';
        if (productivity >= 80 && mood >= 4) return 'happy';
        return 'neutral';
    };

    const state = getCharacterState();

    const colors = {
        happy: { body: '#94A3B8', accent: '#6366F1', glow: 'rgba(99, 102, 241, 0.2)' },
        tired: { body: '#64748B', accent: '#F59E0B', glow: 'rgba(245, 158, 11, 0.15)' },
        sleepy: { body: '#475569', accent: '#8B5CF6', glow: 'rgba(139, 92, 246, 0.15)' },
        sad: { body: '#64748B', accent: '#3B82F6', glow: 'rgba(59, 130, 246, 0.15)' },
        neutral: { body: '#94A3B8', accent: '#10B981', glow: 'rgba(16, 185, 129, 0.15)' }
    }[state];

    const eyeVariants = {
        happy: "M 0,2 Q 5,6 10,2",
        tired: "M 0,2 L 10,2",
        sleepy: "M 0,4 Q 5,2 10,4",
        sad: "M 0,3 Q 5,0 10,3",
        neutral: "M 2,0 A 3.5,3.5 0 1 1 8,0 A 3.5,3.5 0 1 1 2,0"
    };

    return (
        <div className={`relative flex items-center justify-center ${className}`}>
            <motion.div
                className="absolute w-40 h-40 rounded-full blur-3xl opacity-20"
                style={{ backgroundColor: colors.accent }}
                animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
                transition={{ repeat: Infinity, duration: 4 }}
            />

            <motion.svg width="150" height="150" viewBox="0 0 100 100" fill="none"
                animate={{ y: [0, -5, 0], rotate: isTalking ? [-2, 2, -2] : 0 }}
                transition={{ y: { repeat: Infinity, duration: 3 }, rotate: { repeat: Infinity, duration: 0.5 } }}
            >
                {/* Tail */}
                <motion.path d="M 30,80 Q 20,95 10,85" stroke={colors.body} strokeWidth="6" strokeLinecap="round"
                    animate={{ rotate: [-10, 20, -10] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                />

                {/* Ears */}
                <motion.path d="M 25,25 L 15,5 L 40,20 Z" fill={colors.body} stroke={colors.accent} strokeWidth="1"
                    animate={{ rotate: isTalking ? [-5, 5, -5] : [0, 5, 0] }} />
                <motion.path d="M 75,25 L 85,5 L 60,20 Z" fill={colors.body} stroke={colors.accent} strokeWidth="1"
                    animate={{ rotate: isTalking ? [5, -5, 5] : [0, -5, 0] }} />

                {/* Body/Head */}
                <motion.circle cx="50" cy="55" r="35" fill={colors.body} stroke={colors.accent} strokeWidth="1" />

                {/* Muzzle Area */}
                <circle cx="50" cy="65" r="12" fill="white" opacity="0.1" />

                {/* Whiskers */}
                <g stroke="white" strokeWidth="0.5" opacity="0.4">
                    <line x1="30" y1="65" x2="15" y2="60" /><line x1="30" y1="68" x2="15" y2="72" />
                    <line x1="70" y1="65" x2="85" y2="60" /><line x1="70" y1="68" x2="85" y2="72" />
                </g>

                {/* Eyes */}
                <g transform="translate(30, 45)">
                    <motion.path d={eyeVariants[state]} stroke="white" strokeWidth="4" strokeLinecap="round"
                        animate={state !== 'sleepy' ? { scaleY: [1, 0.1, 1] } : {}}
                        transition={{ repeat: Infinity, duration: 4, times: [0, 0.05, 1], delay: 1 }} />
                </g>
                <g transform="translate(60, 45)">
                    <motion.path d={eyeVariants[state]} stroke="white" strokeWidth="4" strokeLinecap="round"
                        animate={state !== 'sleepy' ? { scaleY: [1, 0.1, 1] } : {}}
                        transition={{ repeat: Infinity, duration: 4, times: [0, 0.05, 1], delay: 1.1 }} />
                </g>

                {/* Nose & Mouth */}
                <path d="M 47,65 L 53,65 L 50,68 Z" fill={colors.accent} />
                <motion.path
                    d={isTalking || state === 'happy' ? "M 42,72 Q 50,82 58,72" : "M 45,75 L 55,75"}
                    stroke="white" strokeWidth="3" strokeLinecap="round" fill="none"
                    animate={isTalking ? { d: ["M 42,75 Q 50,85 58,75", "M 45,75 L 55,75"] } : {}}
                    transition={{ repeat: Infinity, duration: 0.3 }}
                />

                {/* Paws */}
                <circle cx="35" cy="85" r="6" fill={colors.body} opacity="0.8" />
                <circle cx="65" cy="85" r="6" fill={colors.body} opacity="0.8" />
            </motion.svg>
        </div>
    );
};

export default AnimatedAssistant;
