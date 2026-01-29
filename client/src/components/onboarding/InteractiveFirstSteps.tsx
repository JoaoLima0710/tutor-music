
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Guitar, Music, CheckCircle2, ArrowRight, Sparkles, Volume2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useUserStore } from '@/stores/useUserStore';
import { useUserProgressStore } from '@/stores/useUserProgressStore';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

// Simple mocked functionality for the "Interactive" part if real audio service is too heavy for this specific component
// In a real scenario, we would import the Tuner hook.

const STEPS = [
    { id: 'welcome', title: 'Bem-vindo' },
    { id: 'instrument', title: 'Seu Instumento' },
    { id: 'sound-check', title: 'Primeiro Som' },
    { id: 'goal', title: 'Objetivo' },
];

export function InteractiveFirstSteps() {
    const [currentStep, setCurrentStep] = useState(0);
    const { user } = useUserStore();
    const { addXP } = useUserProgressStore();
    const [hasGuitar, setHasGuitar] = useState<boolean | null>(null);

    const nextStep = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(c => c + 1);
        } else {
            // Completed
            handleComplete();
        }
    };

    const handleComplete = () => {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
        addXP(100, 'onboarding-complete');
        toast.success("Parabéns! Você ganhou 100 XP por completar a introdução!");

        // In a real app, this would trigger a callback to hide this component
        // For now we might set a flag to "done" in local storage or store
        setTimeout(() => {
            // Reload or redirect to module 1
            window.location.reload();
        }, 3000);
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 0:
                return (
                    <div className="space-y-6 text-center">
                        <div className="mx-auto w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center animate-pulse">
                            <Sparkles className="w-10 h-10 text-purple-400" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-2">Olá, {user?.name || 'Musico'}!</h3>
                            <p className="text-gray-300">
                                Estamos muito felizes em começar essa jornada com você.
                                Vamos configurar seu perfil em menos de 1 minuto.
                            </p>
                        </div>
                        <Button size="lg" onClick={nextStep} className="w-full bg-purple-600 hover:bg-purple-700">
                            Vamos lá! <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                    </div>
                );

            case 1:
                return (
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold text-white text-center">Você já está com o violão?</h3>
                        <div className="grid grid-cols-1 gap-4">
                            <button
                                onClick={() => { setHasGuitar(true); nextStep(); }}
                                className="p-6 rounded-xl bg-slate-800 border-2 border-slate-700 hover:border-green-500 hover:bg-slate-700 transition-all group text-left"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Guitar className="w-6 h-6 text-green-400" />
                                    </div>
                                    <div>
                                        <span className="block font-bold text-white text-lg">Sim, estou com ele</span>
                                        <span className="text-sm text-gray-400">Vamos afinar e tocar agora!</span>
                                    </div>
                                </div>
                            </button>

                            <button
                                onClick={() => { setHasGuitar(false); nextStep(); }}
                                className="p-6 rounded-xl bg-slate-800 border-2 border-slate-700 hover:border-blue-500 hover:bg-slate-700 transition-all group text-left"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Music className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <div>
                                        <span className="block font-bold text-white text-lg">Não, só quero olhar</span>
                                        <span className="text-sm text-gray-400">Vamos aprender um pouco de teoria.</span>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>
                );

            case 2:
                return hasGuitar ? (
                    <div className="space-y-6 text-center">
                        <div className="mx-auto w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center">
                            <Volume2 className="w-8 h-8 text-blue-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white">Desafio Rápido: Toque a Corda E</h3>
                        <p className="text-gray-300">
                            A corda mais grossa do violão (a de cima) é o <strong>Mi (E)</strong>.
                            Toque ela solta (sem apertar nada).
                        </p>

                        {/* Simulação de Tuner */}
                        <div className="p-4 bg-slate-900 rounded-lg border border-slate-700">
                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: "0%" }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="h-full bg-green-500"
                                />
                            </div>
                            <p className="text-xs text-green-400 mt-2 font-mono">Ouvindo...</p>
                        </div>

                        <Button size="lg" onClick={() => { addXP(10, 'first-note'); nextStep(); }} className="w-full bg-green-600 hover:bg-green-700">
                            <CheckCircle2 className="mr-2 w-4 h-4" />
                            Toquei e soou bem!
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-6 text-center">
                        <h3 className="text-xl font-bold text-white">Sem problemas!</h3>
                        <p className="text-gray-300">
                            Você pode aprender as posições dos acordes e ritmos mesmo sem o violão.
                            O app vai adaptar os exercícios para modo "Quiz".
                        </p>
                        <Button size="lg" onClick={nextStep} className="w-full">
                            Continuar
                        </Button>
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold text-white text-center">O que você quer tocar?</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {['Rock', 'Pop', 'Sertanejo', 'MPB', 'Gospel', 'Blues'].map(genre => (
                                <button
                                    key={genre}
                                    onClick={nextStep}
                                    className="p-4 rounded-lg bg-slate-800 hover:bg-purple-600/20 hover:border-purple-500 border border-transparent transition-all text-center"
                                >
                                    <span className="font-semibold text-white">{genre}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <Card className="max-w-md mx-auto p-6 bg-slate-900/90 border-slate-800 backdrop-blur-sm">
            {/* Progress Bar */}
            <div className="mb-8">
                <Progress value={(currentStep / (STEPS.length - 1)) * 100} className="h-1" />
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                    {STEPS.map((s, i) => (
                        <span key={s.id} className={i <= currentStep ? 'text-purple-400 font-bold' : ''}>
                            {s.title}
                        </span>
                    ))}
                </div>
            </div>

            <div className="min-h-[300px] flex flex-col justify-center">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        {renderStepContent()}
                    </motion.div>
                </AnimatePresence>
            </div>
        </Card>
    );
}
