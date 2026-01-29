/**
 * BadgeAwardModal Component
 * Celebratory modal displayed when user earns a new badge
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Medal, Volume2, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useUserProgressStore } from '@/stores/useUserProgressStore';
import { Badge } from '@/types/pedagogy';

export function BadgeAwardModal() {
    const { justEarnedBadge, clearJustEarnedBadge } = useUserProgressStore();
    const [showContent, setShowContent] = useState(false);

    useEffect(() => {
        if (justEarnedBadge) {
            // Delay content for dramatic effect
            const timer = setTimeout(() => setShowContent(true), 300);

            // Trigger confetti
            const count = 200;
            confetti({
                particleCount: count,
                spread: 120,
                origin: { y: 0.6 },
                colors: ['#FFE55C', '#FFD700', '#F4C430', '#FFFFFF', '#4F46E5'],
                disableForReducedMotion: true,
                zIndex: 9999, // Ensure it's on top of everything
            });

            return () => clearTimeout(timer);
        } else {
            setShowContent(false);
        }
    }, [justEarnedBadge]);

    const handleClose = () => {
        clearJustEarnedBadge();
    };

    if (!justEarnedBadge) return null;

    return (
        <AnimatePresence>
            {justEarnedBadge && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                    onClick={handleClose}
                >
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
                        animate={{ scale: 1, opacity: 1, rotate: 0 }}
                        exit={{ scale: 0.5, opacity: 0, rotate: 10 }}
                        transition={{ type: 'spring', damping: 12, stiffness: 100 }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative max-w-sm w-full"
                    >
                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-3xl blur-2xl opacity-40 animate-pulse" />

                        {/* Content */}
                        <div className="relative bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 rounded-3xl border-2 border-yellow-500/50 overflow-hidden shadow-2xl">
                            {/* Animated rays background */}
                            <div className="absolute inset-0 opacity-20">
                                <motion.div
                                    className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-500 via-transparent to-transparent"
                                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                                    transition={{ duration: 4, repeat: Infinity }}
                                />
                            </div>

                            <div className="relative p-8 text-center">
                                {/* Badge Icon */}
                                <motion.div
                                    initial={{ y: 50, opacity: 0 }}
                                    animate={showContent ? { y: 0, opacity: 1 } : {}}
                                    transition={{ delay: 0.1 }}
                                    className="mb-6 relative"
                                >
                                    {/* Shining effect behind icon */}
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-gradient-to-r from-yellow-500/20 to-transparent rounded-full blur-xl"
                                    />

                                    <div className="relative text-8xl filter drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]">
                                        {justEarnedBadge.icon || '🏅'}
                                    </div>

                                    {/* Sparkles around badge */}
                                    <motion.div
                                        className="absolute -top-4 -right-4"
                                        animate={{ scale: [0, 1, 0], rotate: 45 }}
                                        transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                                    >
                                        <Sparkles className="w-8 h-8 text-yellow-300" fill="currentColor" />
                                    </motion.div>
                                    <motion.div
                                        className="absolute bottom-0 -left-6"
                                        animate={{ scale: [0, 1, 0], rotate: -45 }}
                                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                                    >
                                        <Sparkles className="w-6 h-6 text-amber-300" fill="currentColor" />
                                    </motion.div>
                                </motion.div>

                                {/* Texts */}
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={showContent ? { y: 0, opacity: 1 } : {}}
                                    transition={{ delay: 0.2 }}
                                >
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <Trophy className="w-5 h-5 text-yellow-400" />
                                        <h3 className="text-yellow-400 font-bold uppercase tracking-wider text-sm">
                                            Nova Conquista
                                        </h3>
                                        <Trophy className="w-5 h-5 text-yellow-400" />
                                    </div>

                                    <h2 className="text-3xl font-bold text-white mb-2 leading-tight">
                                        {justEarnedBadge.name}
                                    </h2>

                                    <p className="text-gray-300 mb-6 px-2">
                                        {justEarnedBadge.description}
                                    </p>

                                    {/* Rewards */}
                                    <div className="bg-gray-800/50 rounded-xl p-3 mb-6 border border-gray-700">
                                        <div className="flex items-center justify-center gap-2">
                                            <span className="text-2xl">✨</span>
                                            <span className="text-yellow-400 font-bold text-lg">
                                                +{justEarnedBadge.xpBonus} XP
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Action Button */}
                                <motion.button
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={showContent ? { y: 0, opacity: 1 } : {}}
                                    transition={{ delay: 0.4 }}
                                    onClick={handleClose}
                                    className="w-full py-3.5 px-6 bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold text-lg rounded-xl hover:from-yellow-400 hover:to-amber-500 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)]"
                                >
                                    Incrível! 🤩
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
