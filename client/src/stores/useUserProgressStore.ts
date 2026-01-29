/**
 * User Progress Store
 * Unified progress tracking for the pedagogical system
 * Manages modules, lessons, exercises, quizzes, and XP
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
    UserProgress,
    QuizAnswer,
    QuizResult,
    ExerciseAttempt,
    XP_REWARDS,
    Badge,
    calculateXPForLevel,
    getLevelFromXP
} from '@/types/pedagogy';
import { analyticsService } from '@/services/AnalyticsService';

interface UserProgressStore {
    progress: UserProgress;

    // XP Actions
    addXP: (amount: number, source?: string) => void;

    // Module Actions
    unlockModule: (moduleId: string) => void;
    setCurrentModule: (moduleId: string) => void;
    completeModule: (moduleId: string) => void;

    // Lesson Actions
    completeLesson: (lessonId: string) => void;
    isLessonCompleted: (lessonId: string) => boolean;

    // Exercise Actions
    completeExercise: (exerciseId: string, success: boolean, timeSpent?: number) => void;
    getExerciseAttempts: (exerciseId: string) => ExerciseAttempt[];
    isExerciseCompleted: (exerciseId: string) => boolean;

    // Quiz Actions
    submitQuiz: (quizId: string, answers: QuizAnswer[], correctAnswers: Record<string, string>, explanations: Record<string, string>, passingScore: number) => QuizResult;
    getQuizBestScore: (quizId: string) => number;
    hasPassedQuiz: (quizId: string) => boolean;

    // Streak Actions
    updateStreak: () => void;

    // Badge Actions
    earnBadge: (badge: Badge) => void;
    hasBadge: (badgeId: string) => boolean;
    justEarnedBadge: Badge | null;
    clearJustEarnedBadge: () => void;

    // Skill Actions
    masterSkill: (skillId: string) => void;

    // Song Actions
    learnSong: (songId: string) => void;

    // Utility
    canUnlockModule: (moduleId: string, prerequisites: string[], requiredXP: number) => boolean;
    resetProgress: () => void;
}

const initialProgress: UserProgress = {
    userId: 'local-user',
    currentLevel: 1,
    currentXP: 0,
    xpToNextLevel: 100,
    totalXP: 0,
    completedModules: [],
    currentModuleId: null,
    unlockedModules: ['module-1-1'], // First module always unlocked
    completedLessons: [],
    completedExercises: [],
    exerciseAttempts: [],
    quizResults: [],
    currentStreak: 0,
    longestStreak: 0,
    totalPracticeTime: 0,
    lastPracticeDate: null,
    earnedBadges: [],
    masteredSkills: [],
    learnedSongs: [],
};

export const useUserProgressStore = create<UserProgressStore>()(
    persist(
        (set, get) => ({
            progress: initialProgress,

            // =======================================================================
            // XP ACTIONS
            // =======================================================================

            addXP: (amount: number, source?: string) => {
                set((state) => {
                    const newTotalXP = state.progress.totalXP + amount;
                    const newLevel = getLevelFromXP(newTotalXP);
                    const oldLevel = state.progress.currentLevel;
                    const xpForNextLevel = calculateXPForLevel(newLevel);

                    // Track XP gain
                    // analyticsService.track('xp_gained', { amount, source, total: newTotalXP }); // Maybe too noisy?

                    // Track Level Up
                    if (newLevel > oldLevel) {
                        analyticsService.track('level_up', {
                            newLevel,
                            oldLevel,
                            totalXP: newTotalXP
                        });
                    }

                    // Calculate XP within current level
                    let xpInCurrentLevel = newTotalXP;
                    for (let i = 1; i < newLevel; i++) {
                        xpInCurrentLevel -= calculateXPForLevel(i);
                    }

                    console.log(`🎮 +${amount} XP${source ? ` (${source})` : ''} | Total: ${newTotalXP} | Level: ${newLevel}`);

                    return {
                        progress: {
                            ...state.progress,
                            totalXP: newTotalXP,
                            currentXP: xpInCurrentLevel,
                            currentLevel: newLevel,
                            xpToNextLevel: xpForNextLevel,
                        },
                    };
                });
            },

            // =======================================================================
            // MODULE ACTIONS
            // =======================================================================

            unlockModule: (moduleId: string) => {
                set((state) => {
                    if (state.progress.unlockedModules.includes(moduleId)) {
                        return state;
                    }
                    console.log(`🔓 Module unlocked: ${moduleId}`);
                    return {
                        progress: {
                            ...state.progress,
                            unlockedModules: [...state.progress.unlockedModules, moduleId],
                        },
                    };
                });
            },

            setCurrentModule: (moduleId: string) => {
                set((state) => ({
                    progress: {
                        ...state.progress,
                        currentModuleId: moduleId,
                    },
                }));
            },

            completeModule: (moduleId: string) => {
                set((state) => {
                    if (state.progress.completedModules.includes(moduleId)) {
                        return state;
                    }
                    console.log(`✅ Module completed: ${moduleId}`);
                    return {
                        progress: {
                            ...state.progress,
                            completedModules: [...state.progress.completedModules, moduleId],
                        },
                    };
                });

                // Award XP for module completion
                get().addXP(XP_REWARDS.moduleComplete, 'module-complete');

                // Check for Module Badge defined in data
                // We need to fetch this dynamically to avoid circular dependencies in some setups,
                // but since the store is central, we can try importing relevant modules or passing them.
                // However, for simplicity and robustness, we'll try to find the module from the ID if possible,
                // OR relying on the caller to handle badge awards.
                // BETTER APPROACH: The component completing the module (QuizPlayer?) usually has the module data.
                // But `completeModule` is often called by `Learn.tsx` or similar.

                // Let's assume modulesById is available via dynamic import or we assume the caller handles it?
                // Actually, let's make earnBadge robust and let the logic live there.

                // For now, we will NOT auto-award inside completeModule to avoid circular dependency hell 
                // if modules import store. Instead, we call earnBadge from the UI where we have the data.
            },

            // =======================================================================
            // LESSON ACTIONS
            // =======================================================================

            completeLesson: (lessonId: string) => {
                const { progress } = get();
                if (progress.completedLessons.includes(lessonId)) {
                    return; // Already completed, no XP
                }

                set((state) => ({
                    progress: {
                        ...state.progress,
                        completedLessons: [...state.progress.completedLessons, lessonId],
                    },
                }));

                get().addXP(XP_REWARDS.lesson, 'lesson-complete');
                analyticsService.track('lesson_completed', { lessonId });
                console.log(`📖 Lesson completed: ${lessonId}`);
            },

            isLessonCompleted: (lessonId: string) => {
                return get().progress.completedLessons.includes(lessonId);
            },

            // =======================================================================
            // EXERCISE ACTIONS
            // =======================================================================

            completeExercise: (exerciseId: string, success: boolean, timeSpent = 0) => {
                const attempt: ExerciseAttempt = {
                    exerciseId,
                    attemptedAt: new Date(),
                    success,
                    timeSpent,
                };

                set((state) => ({
                    progress: {
                        ...state.progress,
                        exerciseAttempts: [...state.progress.exerciseAttempts, attempt],
                        totalPracticeTime: state.progress.totalPracticeTime + Math.floor(timeSpent / 60),
                    },
                }));

                // Award XP only on first successful completion
                const { progress } = get();
                if (success && !progress.completedExercises.includes(exerciseId)) {
                    set((state) => ({
                        progress: {
                            ...state.progress,
                            completedExercises: [...state.progress.completedExercises, exerciseId],
                        },
                    }));
                    get().addXP(XP_REWARDS.exercise, 'exercise-complete');
                    console.log(`🎯 Exercise completed: ${exerciseId}`);
                }
            },

            getExerciseAttempts: (exerciseId: string) => {
                return get().progress.exerciseAttempts.filter(a => a.exerciseId === exerciseId);
            },

            isExerciseCompleted: (exerciseId: string) => {
                return get().progress.completedExercises.includes(exerciseId);
            },

            // =======================================================================
            // QUIZ ACTIONS
            // =======================================================================

            submitQuiz: (quizId, answers, correctAnswers, explanations, passingScore) => {
                const { progress } = get();

                // Calculate score
                let correctCount = 0;
                const detailedAnswers = answers.map((answer) => {
                    const isCorrect = answer.selectedOptionId === correctAnswers[answer.questionId];
                    if (isCorrect) correctCount++;

                    return {
                        questionId: answer.questionId,
                        selectedOptionId: answer.selectedOptionId,
                        correctOptionId: correctAnswers[answer.questionId],
                        isCorrect,
                        explanation: explanations[answer.questionId] || '',
                    };
                });

                const score = Math.round((correctCount / answers.length) * 100);
                const passed = score >= passingScore;

                const result: QuizResult = {
                    quizId,
                    attemptedAt: new Date(),
                    score,
                    passed,
                    correctCount,
                    totalQuestions: answers.length,
                    answers: detailedAnswers,
                    timeSpent: 0, // Would need to track this separately
                };

                set((state) => ({
                    progress: {
                        ...state.progress,
                        quizResults: [...state.progress.quizResults, result],
                    },
                }));

                // Award XP on first pass
                const previouslyPassed = progress.quizResults.some(
                    r => r.quizId === quizId && r.passed
                );

                if (passed && !previouslyPassed) {
                    if (score === 100) {
                        get().addXP(XP_REWARDS.quizPerfect, 'quiz-perfect');
                    } else {
                        get().addXP(XP_REWARDS.quiz, 'quiz-pass');
                    }
                }

                console.log(`📝 Quiz submitted: ${quizId} | Score: ${score}% | Passed: ${passed}`);
                analyticsService.track('exercise_completed', {
                    type: 'quiz',
                    id: quizId,
                    score,
                    passed
                });

                return result;
            },

            getQuizBestScore: (quizId: string) => {
                const results = get().progress.quizResults.filter(r => r.quizId === quizId);
                if (results.length === 0) return 0;
                return Math.max(...results.map(r => r.score));
            },

            hasPassedQuiz: (quizId: string) => {
                return get().progress.quizResults.some(r => r.quizId === quizId && r.passed);
            },

            // =======================================================================
            // STREAK ACTIONS
            // =======================================================================

            updateStreak: () => {
                const { progress } = get();
                const now = new Date();
                const today = now.toISOString().split('T')[0];

                if (!progress.lastPracticeDate) {
                    // First practice ever
                    set((state) => ({
                        progress: {
                            ...state.progress,
                            currentStreak: 1,
                            lastPracticeDate: today,
                        },
                    }));
                    return;
                }

                const lastDate = new Date(progress.lastPracticeDate);
                const daysDiff = Math.floor(
                    (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
                );

                if (daysDiff === 0) {
                    // Same day, no change
                    return;
                } else if (daysDiff === 1) {
                    // Consecutive day
                    const newStreak = progress.currentStreak + 1;
                    set((state) => ({
                        progress: {
                            ...state.progress,
                            currentStreak: newStreak,
                            longestStreak: Math.max(newStreak, state.progress.longestStreak),
                            lastPracticeDate: today,
                        },
                    }));

                    // Daily streak bonus
                    get().addXP(XP_REWARDS.dailyStreak, 'daily-streak');

                    // Weekly streak bonus
                    if (newStreak % 7 === 0) {
                        get().addXP(XP_REWARDS.weeklyStreak, 'weekly-streak');
                    }
                } else {
                    // Streak broken
                    set((state) => ({
                        progress: {
                            ...state.progress,
                            currentStreak: 1,
                            lastPracticeDate: today,
                        },
                    }));
                }
            },

            // =======================================================================
            // BADGE ACTIONS
            // =======================================================================

            justEarnedBadge: null,

            clearJustEarnedBadge: () => set({ justEarnedBadge: null }),

            earnBadge: (badge: Badge) => {
                const { progress } = get();
                if (progress.earnedBadges.includes(badge.id)) {
                    return;
                }

                set((state) => ({
                    justEarnedBadge: badge,
                    progress: {
                        ...state.progress,
                        earnedBadges: [...state.progress.earnedBadges, badge.id],
                    },
                }));

                console.log(`🏆 Badge earned: ${badge.name}`);
                analyticsService.track('badge_unlocked', { badgeId: badge.id, badgeName: badge.name });
            },

            hasBadge: (badgeId: string) => {
                return get().progress.earnedBadges.includes(badgeId);
            },

            // =======================================================================
            // SKILL ACTIONS
            // =======================================================================

            masterSkill: (skillId: string) => {
                const { progress } = get();
                if (progress.masteredSkills.includes(skillId)) {
                    return;
                }

                set((state) => ({
                    progress: {
                        ...state.progress,
                        masteredSkills: [...state.progress.masteredSkills, skillId],
                    },
                }));

                console.log(`⭐ Skill mastered: ${skillId}`);
            },

            // =======================================================================
            // SONG ACTIONS
            // =======================================================================

            learnSong: (songId: string) => {
                const { progress } = get();
                if (progress.learnedSongs.includes(songId)) {
                    return;
                }

                set((state) => ({
                    progress: {
                        ...state.progress,
                        learnedSongs: [...state.progress.learnedSongs, songId],
                    },
                }));

                console.log(`🎵 Song learned: ${songId}`);
            },

            // =======================================================================
            // UTILITY
            // =======================================================================

            canUnlockModule: (moduleId: string, prerequisites: string[], requiredXP: number) => {
                const { progress } = get();

                // Check if already unlocked
                if (progress.unlockedModules.includes(moduleId)) {
                    return true;
                }

                // Check prerequisites
                const prerequisitesMet = prerequisites.every(
                    prereqId => progress.completedModules.includes(prereqId)
                );

                // Check XP requirement
                const hasRequiredXP = progress.totalXP >= requiredXP;

                return prerequisitesMet && hasRequiredXP;
            },

            resetProgress: () => {
                set({ progress: initialProgress });
                console.log('🔄 Progress reset');
            },
        }),
        {
            name: 'musictutor-user-progress',
            version: 1,
        }
    )
);
