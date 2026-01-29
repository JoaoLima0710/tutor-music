import { useState } from 'react';
import { CheckCircle2, RotateCcw, XCircle } from 'lucide-react';

interface SimpleFixationExerciseProps {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
}

export function SimpleFixationExercise({
    question,
    options,
    correctAnswer,
    explanation
}: SimpleFixationExerciseProps) {
    const [selected, setSelected] = useState<number | null>(null);
    const [showResult, setShowResult] = useState(false);

    const handleSelect = (index: number) => {
        if (showResult) return;
        setSelected(index);
        setShowResult(true);
    };

    const reset = () => {
        setSelected(null);
        setShowResult(false);
    };

    const isCorrect = selected === correctAnswer;

    return (
        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
            <p className="text-sm font-semibold text-white mb-3">{question}</p>
            <div className="space-y-2 mb-3">
                {options.map((option, index) => {
                    let bgColor = 'bg-white/5 hover:bg-white/10';
                    let borderColor = 'border-white/10';

                    if (showResult && selected === index) {
                        bgColor = isCorrect ? 'bg-green-500/20' : 'bg-red-500/20';
                        borderColor = isCorrect ? 'border-green-500/50' : 'border-red-500/50';
                    }

                    return (
                        <button
                            key={index}
                            onClick={() => handleSelect(index)}
                            disabled={showResult}
                            className={`w-full text-left p-3 rounded border ${bgColor} ${borderColor} transition-colors ${showResult ? 'cursor-default' : 'cursor-pointer'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-gray-400 w-6">{String.fromCharCode(65 + index)}.</span>
                                <span className="text-sm text-gray-300">{option}</span>
                                {showResult && selected === index && (
                                    isCorrect ? (
                                        <CheckCircle2 className="w-4 h-4 text-green-400 ml-auto" />
                                    ) : (
                                        <XCircle className="w-4 h-4 text-red-400 ml-auto" />
                                    )
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>

            {showResult && (
                <div className={`p-3 rounded mb-3 ${isCorrect ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'
                    }`}>
                    <p className={`text-sm font-semibold mb-1 ${isCorrect ? 'text-green-400' : 'text-red-400'
                        }`}>
                        {isCorrect ? '✅ Correto!' : '❌ Revise isso:'}
                    </p>
                    <p className="text-xs text-gray-300">{explanation}</p>
                </div>
            )}

            {showResult && (
                <button
                    onClick={reset}
                    className="text-xs text-gray-400 hover:text-gray-300 flex items-center gap-1"
                >
                    <RotateCcw className="w-3 h-3" />
                    Tentar novamente
                </button>
            )}
        </div>
    );
}
