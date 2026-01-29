import React, { useEffect, useState } from 'react';
import { useTuner } from '@/hooks/useTuner';
import { Button } from '@/components/ui/button';
import { Mic, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface NoteValidatorProps {
    targetNote: string; // e.g., "E2", "A2", "D3"
    onSuccess: () => void;
    tolerance?: number; // Cents tolerance
}

export const NoteValidator: React.FC<NoteValidatorProps> = ({
    targetNote,
    onSuccess,
    tolerance = 15
}) => {
    const { state, toggle } = useTuner();
    const { isListening, note, octave, cents } = state;
    const [success, setSuccess] = useState(false);

    // Mapeamento simples de notas para validação visual (ajustar conforme necessário)
    const isMatching = (detectedNote: string | null, detectedOctave: number | null, target: string) => {
        if (!detectedNote || detectedOctave === null) return false;

        // Construct detected full note, e.g. "E2"
        const fullNote = `${detectedNote}${detectedOctave}`;

        // Check exact match
        if (fullNote === target) return true;

        // Check if target is just note name (implied any octave, though unusual for validation)
        const targetHasOctave = /\d/.test(target);
        if (!targetHasOctave) {
            return detectedNote === target;
        }

        return false;
    };

    useEffect(() => {
        if (isListening && !success && note) {
            if (isMatching(note, octave, targetNote)) {
                // Verificar afinação fina se necessário (cents)
                if (Math.abs(cents) <= tolerance) {
                    handleSuccess();
                }
            }
        }
    }, [note, octave, cents, isListening, targetNote, success, tolerance]);

    const handleSuccess = () => {
        setSuccess(true);
        if (isListening) toggle(); // Stop listening

        toast.success("Nota correta detectada!", {
            description: `Você tocou ${targetNote} perfeitamente.`
        });

        setTimeout(() => {
            onSuccess();
        }, 1500);
    };

    return (
        <div className="flex flex-col items-center justify-center p-6 bg-slate-800/50 rounded-xl border border-slate-700">
            <div className="text-center mb-4">
                <h3 className="text-lg font-medium text-white mb-2">
                    Toque a nota <span className="text-purple-400 font-bold text-2xl">{targetNote}</span>
                </h3>
                <p className="text-sm text-gray-400">
                    Certifique-se de que seu microfone está ligado.
                </p>
            </div>

            <div className="flex items-center gap-4">
                {success ? (
                    <div className="flex flex-col items-center animate-in zoom-in duration-300">
                        <div className="bg-green-500/20 p-4 rounded-full mb-2">
                            <CheckCircle className="w-12 h-12 text-green-500" />
                        </div>
                        <span className="text-green-400 font-bold">Correto!</span>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-4">
                        <Button
                            onClick={toggle}
                            variant={isListening ? "destructive" : "default"}
                            className={`w-32 h-32 rounded-full flex flex-col items-center justify-center gap-2 transition-all duration-300 ${isListening ? 'animate-pulse ring-4 ring-red-500/20' : 'hover:scale-105'
                                }`}
                        >
                            <Mic className={`w-10 h-10 ${isListening ? 'text-white' : 'text-purple-200'}`} />
                            <span className="text-xs uppercase font-bold tracking-wider">
                                {isListening ? 'Ouvindo...' : 'Começar'}
                            </span>
                        </Button>

                        {isListening && (
                            <div className="flex flex-col items-center">
                                <div className="h-8 flex items-center justify-center min-w-[100px]">
                                    {note ? (
                                        <span className="text-2xl font-mono font-bold text-white">
                                            {note}{octave} <span className={`text-xs ${Math.abs(cents) <= 10 ? 'text-green-400' : 'text-red-400'}`}>{cents > 0 ? `+${cents}` : cents}¢</span>
                                        </span>
                                    ) : (
                                        <span className="text-gray-500 italic text-sm">Tocando...</span>
                                    )}
                                </div>
                                {note && Math.abs(cents) > 10 && (
                                    <span className="text-xs font-bold text-yellow-400 mt-1 uppercase tracking-wider">
                                        {cents > 0 ? 'Muito Agudo (Solte ▼)' : 'Muito Grave (Aperte ▲)'}
                                    </span>
                                )}
                                {note && Math.abs(cents) <= 10 && (
                                    <span className="text-xs font-bold text-green-400 mt-1 uppercase tracking-wider">
                                        Perfeito
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
