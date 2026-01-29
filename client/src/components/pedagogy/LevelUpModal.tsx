/**
 * LevelUpModal Component
 * Celebratory modal displayed when user levels up
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Sparkles, Trophy, ChevronUp } from 'lucide-react';
import { getLevelTitle } from '@/types/pedagogy';
import confetti from 'canvas-confetti';

interface LevelUpModalProps {
    isOpen: boolean;
    onClose: () => void;
    newLevel: number;
    previousLevel: number;
    xpEarned?: number;
}

export function LevelUpModal({
    isOpen,
    onClose,
    newLevel,
    previousLevel,
    xpEarned,
}: LevelUpModalProps) {
    const [showContent, setShowContent] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // Delay content for dramatic effect
            const timer = setTimeout(() => setShowContent(true), 300);

            // Trigger confetti
            const count = 200;
            confetti({
                particleCount: count,
                spread: 100,
                origin: { y: 0.6 },
                colors: ['#a855f7', '#8b5cf6', '#fbbf24', '#22d3ee'],
            });

            return () => clearTimeout(timer);
        } else {
            setShowContent(false);
        }
    }, [isOpen]);

    const newTitle = getLevelTitle(newLevel);
    const prevTitle = getLevelTitle(previousLevel);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                        transition={{ type: 'spring', damping: 15 }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative max-w-sm w-full"
                    >
                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-3xl blur-xl opacity-50" />

                        {/* Content */}
                        <div className="relative bg-gradient-to-br from-gray-900 via-purple-900/50 to-gray-900 rounded-3xl border border-purple-500/30 overflow-hidden">
                            {/* Animated stars background */}
                            <div className="absolute inset-0 overflow-hidden">
                                {[...Array(20)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        className="absolute"
                                        initial={{
                                            x: Math.random() * 300,
                                            y: Math.random() * 400,
                                            scale: 0,
                                            opacity: 0,
                                        }}
                                        animate={{
                                            scale: [0, 1, 0],
                                            opacity: [0, 1, 0],
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            delay: Math.random() * 2,
                                        }}
                                    >
                                        <Sparkles className="w-4 h-4 text-yellow-400" />
                                    </motion.div>
                                ))}
                            </div>

                            <div className="relative p-8 text-center">
                                {/* Level up icon */}
                                <motion.div
                                    initial={{ y: 50, opacity: 0 }}
                                    animate={showContent ? { y: 0, opacity: 1 } : {}}
                                    transition={{ delay: 0.1 }}
                                    className="mb-6"
                                >
                                    <div className="relative inline-block">
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                                            className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full blur-lg opacity-50"
                                        />
                                        <div className="relative w-24 h-24 mx-auto bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl">
                                            <ChevronUp className="w-12 h-12 text-white" />
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Text */}
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={showContent ? { y: 0, opacity: 1 } : {}}
                                    transition={{ delay: 0.2 }}
                                >
                                    <h2 className="text-2xl font-bold text-yellow-400 mb-1">
                                        LEVEL UP!
                                    </h2>
                                    <p className="text-gray-400 text-sm mb-4">
                                        Você subiu de nível!
                                    </p>
                                </motion.div>

                                {/* Level display */}
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={showContent ? { scale: 1 } : {}}
                                    transition={{ delay: 0.3, type: 'spring' }}
                                    className="mb-6"
                                >
                                    <div className="flex items-center justify-center gap-4">
                                        <div className="text-center opacity-50">
                                            <p className="text-3xl font-bold text-gray-400">{previousLevel}</p>
                                            <p className="text-xs text-gray-500">{prevTitle}</p>
                                        </div>
                                        <motion.div
                                            animate={{ x: [0, 5, 0] }}
                                            transition={{ duration: 0.5, repeat: Infinity }}
                                        >
                                            <ChevronUp className="w-6 h-6 text-yellow-400 rotate-90" />
                                        </motion.div>
                                        <div className="text-center">
                                            <motion.p
                                                className="text-5xl font-bold text-white"
                                                animate={{ scale: [1, 1.1, 1] }}
                                                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                                            >
                                                {newLevel}
                                            </motion.p>
                                            <p className="text-sm text-purple-400 font-medium">{newTitle}</p>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* XP earned */}
                                {xpEarned && (
                                    <motion.div
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={showContent ? { y: 0, opacity: 1 } : {}}
                                        transition={{ delay: 0.4 }}
                                        className="flex items-center justify-center gap-2 mb-6"
                                    >
                                        <Star className="w-5 h-5 text-yellow-400" />
                                        <span className="text-yellow-400 font-semibold">+{xpEarned} XP</span>
                                    </motion.div>
                                )}

                                {/* Continue button */}
                                <motion.button
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={showContent ? { y: 0, opacity: 1 } : {}}
                                    transition={{ delay: 0.5 }}
                                    onClick={onClose}
                                    className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg"
                                >
                                    Continuar 🎉
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default LevelUpModal;
