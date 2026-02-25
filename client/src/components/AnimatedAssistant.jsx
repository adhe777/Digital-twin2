import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * AnimatedAssistant Component (Full-Body Upgrade)
 * A premium, full-body digital twin character reacting to user states.
 */
const AnimatedAssistant = ({ mood = 3, isTalking = false, sleep = 8, productivity = 70, className = "" }) => {

    // 1. Logic Mapping
    const getCharacterState = () => {
        if (sleep < 5) return 'sleepy';
        if (productivity < 50 || sleep < 6) return 'tired';
        if (productivity >= 80 && mood >= 4) return 'productive';
        // Idle is a base animation variation of neutral, we'll handle it via continuous animation unless another state overrides
        return 'neutral';
    };

    const state = getCharacterState();

    // Premium Color Palette
    const colors = {
        primary: "#6366f1", // Indigo 500 (Base theme)
        secondary: "#8b5cf6", // Violet 500
        skin: "currentColor", // Adapts to text color (dark/light mode)
        accent: "#10b981", // Emerald 500
        highlight: "#ffffff",
    };

    // 2. State-Driven Animation Variants
    const bodyVariants = {
        neutral: { y: [0, -3, 0], rotate: 0, transition: { repeat: Infinity, duration: 4, ease: "easeInOut" } },
        sleepy: { y: [2, 5, 2], rotate: 2, transition: { repeat: Infinity, duration: 6, ease: "easeInOut" } },
        tired: { y: [4, 6, 4], rotate: 4, transition: { repeat: Infinity, duration: 5, ease: "easeInOut" } },
        productive: { y: [0, -8, 0], rotate: 0, transition: { repeat: Infinity, duration: 2, ease: "easeInOut" } },
    };

    const headVariants = {
        neutral: { rotate: 0, y: 0 },
        sleepy: { rotate: 8, y: 2, transition: { repeat: Infinity, duration: 5, repeatType: "reverse" } },
        tired: { rotate: 12, y: 5 },
        productive: { rotate: [-2, 2, -2], y: -2, transition: { repeat: Infinity, duration: 3 } },
        talking: { rotate: isTalking ? [-3, 3, -3] : 0, transition: { repeat: Infinity, duration: 1.5 } }
    };

    const eyeVariants = {
        neutral: "M 32 35 Q 35 32 38 35 M 62 35 Q 65 32 68 35", // Soft arc
        blink: "M 32 35 L 38 35 M 62 35 L 68 35", // Line
        sleepy: "M 32 36 L 38 36 M 62 36 L 68 36", // Low line
        tired: "M 32 33 L 38 36 M 68 33 L 62 36", // Slanted down
        productive: "M 32 36 Q 35 30 38 36 M 62 36 Q 65 30 68 36" // High arc
    };

    const mouthVariants = {
        neutral: "M 45 50 Q 50 54 55 50",
        sleepy: "M 48 52 A 2 2 0 1 1 52 52 A 2 2 0 1 1 48 52", // Small yawn (circle)
        tired: "M 45 52 Q 50 50 55 52", // Frown
        productive: "M 42 48 Q 50 58 58 48", // Big smile
        talking_1: "M 45 50 Q 50 55 55 50",
        talking_2: "M 48 50 Q 50 58 52 50",
    };

    const armLeftVariants = {
        neutral: { rotate: 0 },
        sleepy: { rotate: -15 }, // Hanging
        tired: { rotate: -10 },
        productive: { rotate: -130 }, // Thumbs up pose
        talking: { rotate: isTalking ? [-10, 20, -10] : 0, transition: { repeat: Infinity, duration: 2 } }
    };

    const armRightVariants = {
        neutral: { rotate: 0 },
        sleepy: { rotate: -140 }, // Rubbing eye
        tired: { rotate: 10 },
        productive: { rotate: 10 },
        talking: { rotate: isTalking ? [10, -20, 10] : 0, transition: { repeat: Infinity, duration: 2.2 } }
    };

    // Derived states for SVG rendering
    const currentEyePath = state === 'sleepy' ? eyeVariants.sleepy : (state === 'tired' ? eyeVariants.tired : (state === 'productive' ? eyeVariants.productive : eyeVariants.neutral));
    const currentMouthPath = isTalking ? mouthVariants.talking_1 : (state === 'sleepy' ? mouthVariants.sleepy : (state === 'tired' ? mouthVariants.tired : (state === 'productive' ? mouthVariants.productive : mouthVariants.neutral)));

    return (
        <div className={`relative flex flex-col items-center justify-center w-full h-full ${className}`}>

            {/* Ambient Aura */}
            <motion.div
                className="absolute w-48 h-48 rounded-full blur-3xl opacity-20 dark:opacity-30 z-0"
                style={{ backgroundColor: state === 'productive' ? colors.accent : (state === 'tired' || state === 'sleepy' ? '#f43f5e' : colors.primary) }}
                animate={{ scale: isTalking ? [1, 1.2, 1] : [1, 1.05, 1], opacity: [0.15, 0.25, 0.15] }}
                transition={{ repeat: Infinity, duration: isTalking ? 2 : 5 }}
            />

            {/* Main Character SVG */}
            <motion.svg
                width="180" height="240" viewBox="0 0 100 140" fill="none"
                className="z-10 text-slate-800 dark:text-slate-100 drop-shadow-2xl"
                animate={bodyVariants[state]}
                style={{ originX: 0.5, originY: 1 }}
            >
                {/* --- Body Group --- */}
                <g id="body">
                    {/* Torso */}
                    <path d="M 35 60 C 35 60, 25 100, 30 110 L 70 110 C 75 100, 65 60, 65 60 Z" fill="currentColor" opacity="0.1" />
                    <rect x="35" y="60" width="30" height="40" rx="10" fill="url(#bodyGradient)" />
                    {/* Screen/Chest detail */}
                    <rect x="42" y="68" width="16" height="6" rx="3" fill="currentColor" opacity="0.3" />
                    <rect x="45" y="78" width="10" height="4" rx="2" fill="currentColor" opacity="0.2" />
                </g>

                {/* --- Legs Group --- */}
                <g id="legs" stroke="currentColor" strokeWidth="6" strokeLinecap="round" opacity="0.8">
                    {/* Left Leg */}
                    <path d="M 40 100 L 40 125" />
                    {/* Right Leg */}
                    <path d="M 60 100 L 60 125" />
                </g>
                <g id="feet" fill="currentColor" opacity="0.9">
                    <rect x="34" y="125" width="12" height="6" rx="3" />
                    <rect x="54" y="125" width="12" height="6" rx="3" />
                </g>

                {/* --- Arms Group --- */}
                {/* Left Arm */}
                <motion.g
                    id="arm-left"
                    style={{ originX: "40px", originY: "65px" }}
                    animate={isTalking ? armLeftVariants.talking : armLeftVariants[state]}
                >
                    <path d="M 35 65 Q 20 80 25 95" stroke="currentColor" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.8" />
                    <circle cx="25" cy="95" r="4" fill="currentColor" />
                </motion.g>

                {/* Right Arm */}
                <motion.g
                    id="arm-right"
                    style={{ originX: "60px", originY: "65px" }}
                    animate={isTalking ? armRightVariants.talking : armRightVariants[state]}
                >
                    <path d="M 65 65 Q 80 80 75 95" stroke="currentColor" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.8" />
                    <circle cx="75" cy="95" r="4" fill="currentColor" />
                    {state === 'productive' && (
                        <path d="M 75 92 L 75 88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /> // Thumb detail
                    )}
                </motion.g>

                {/* --- Head Group --- */}
                <motion.g
                    id="head"
                    style={{ originX: "50px", originY: "55px" }}
                    animate={isTalking ? headVariants.talking : headVariants[state]}
                >
                    {/* Neck */}
                    <rect x="46" y="50" width="8" height="15" rx="4" fill="currentColor" opacity="0.7" />

                    {/* Main Head Shape (Rounded TV/Robot style) */}
                    <rect x="25" y="10" width="50" height="45" rx="16" fill="currentColor" />

                    {/* Face Screen (Glassmorphism look) */}
                    <rect x="29" y="15" width="42" height="35" rx="12" fill={colors.highlight} opacity="0.15" />
                    <rect x="30" y="16" width="40" height="33" rx="10" fill="#0f172a" opacity="0.8" />

                    {/* Eyes */}
                    <motion.path
                        d={currentEyePath}
                        stroke={colors.highlight}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        fill="none"
                        animate={state !== 'sleepy' && state !== 'tired' ? {
                            d: [currentEyePath, eyeVariants.blink, currentEyePath]
                        } : {}}
                        transition={{ repeat: Infinity, duration: 4, times: [0, 0.05, 1], delay: 2 }}
                    />

                    {/* Mouth */}
                    <motion.path
                        d={currentMouthPath}
                        stroke={colors.highlight}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        fill={isTalking || state === 'productive' ? colors.highlight : "none"}
                        animate={isTalking ? {
                            d: [mouthVariants.talking_1, mouthVariants.talking_2, mouthVariants.talking_1]
                        } : {}}
                        transition={{ repeat: Infinity, duration: 0.25 }}
                    />

                    {/* Blush (Happy/Productive only) */}
                    <AnimatePresence>
                        {(state === 'productive' || state === 'neutral') && !isTalking && (
                            <motion.g initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}>
                                <ellipse cx="32" cy="42" rx="3" ry="2" fill="#f43f5e" />
                                <ellipse cx="68" cy="42" rx="3" ry="2" fill="#f43f5e" />
                            </motion.g>
                        )}
                    </AnimatePresence>

                    {/* Antenna (Subtle tech detail) */}
                    <path d="M 50 10 L 50 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="50" cy="3" r="2" fill={state === 'productive' ? colors.accent : colors.primary} />
                </motion.g>

                {/* Drops for sleepy/tired state */}
                <AnimatePresence>
                    {(state === 'sleepy' || state === 'tired') && (
                        <motion.path
                            d="M 68 20 Q 72 25 68 30 Q 64 25 68 20"
                            fill="#3b82f6"
                            opacity="0.6"
                            initial={{ y: -5, opacity: 0 }}
                            animate={{ y: [0, 5, 10], opacity: [0, 0.6, 0] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                        />
                    )}
                </AnimatePresence>

                {/* Zzz for sleepy state */}
                <AnimatePresence>
                    {state === 'sleepy' && (
                        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 0.8 }} exit={{ opacity: 0 }}>
                            <motion.text x="75" y="15" fill={colors.highlight} fontSize="10" fontWeight="bold"
                                animate={{ y: [0, -10], x: [0, 5], opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 3 }}>Z</motion.text>
                            <motion.text x="82" y="5" fill={colors.highlight} fontSize="8" fontWeight="bold"
                                animate={{ y: [0, -10], x: [0, 5], opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 3, delay: 0.5 }}>z</motion.text>
                        </motion.g>
                    )}
                </AnimatePresence>

                {/* Gradients */}
                <defs>
                    <linearGradient id="bodyGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="currentColor" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="currentColor" stopOpacity="1" />
                    </linearGradient>
                </defs>
            </motion.svg>
        </div>
    );
};

export default AnimatedAssistant;
