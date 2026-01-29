/**
 * QuizQuestion Component
 * Interactive quiz question with multiple choice and feedback
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle2,
    XCircle,
    HelpCircle,
    Lightbulb
} from 'lucide-react';
import { QuizQuestion as QuizQuestionType, QuizOption } from '@/types/pedagogy';
import { cn } from '@/lib/utils';
import { ChordDiagram } from '@/components/chords/ChordDiagram';

interface QuizQuestionProps {
    question: QuizQuestionType;
    questionNumber: number;
    totalQuestions: number;
    selectedOptionId?: string;
    showFeedback: boolean;
    onSelectOption: (optionId: string) => void;
    onConfirm: () => void;
    onNext: () => void;
}

export function QuizQuestionComponent({
    question,
    questionNumber,
    totalQuestions,
    selectedOptionId,
    showFeedback,
    onSelectOption,
    onConfirm,
    onNext,
}: QuizQuestionProps) {
    const [showHint, setShowHint] = useState(false);
    const isCorrect = selectedOptionId === question.correctOptionId;

    // Reset hint when question changes
    useEffect(() => {
        setShowHint(false);
    }, [question.id]);

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-2xl mx-auto"
        >
            {/* Progress */}
            <div className="mb-6">
                <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                    <span>Questão {questionNumber} de {totalQuestions}</span>
                    <span>{Math.round((questionNumber / totalQuestions) * 100)}%</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
                        className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                    />
                </div>
            </div>

            {/* Question */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 mb-6">
                {/* Question Image */}
                {question.image && (
                    <img
                        src={question.image}
                        alt="Imagem da questão"
                        className="w-full max-w-md mx-auto rounded-lg mb-4"
                    />
                )}

                {/* Question Diagram */}
                {question.diagram && question.diagram.type === 'chord' && (
                    <div className="flex justify-center mb-4">
                        <ChordDiagram chord={question.diagram.id} size="lg" />
                    </div>
                )}

                {/* Question Text */}
                <h3 className="text-xl font-semibold text-white mb-6">
                    {question.question}
                </h3>

                {/* Options */}
                <div className="space-y-3">
                    {question.options.map((option, index) => (
                        <OptionButton
                            key={option.id}
                            option={option}
                            index={index}
                            isSelected={selectedOptionId === option.id}
                            isCorrect={showFeedback && option.id === question.correctOptionId}
                            isWrong={showFeedback && selectedOptionId === option.id && option.id !== question.correctOptionId}
                            showFeedback={showFeedback}
                            onClick={() => !showFeedback && onSelectOption(option.id)}
                        />
                    ))}
                </div>

                {/* Hint */}
                {question.hint && !showFeedback && (
                    <div className="mt-4">
                        <button
                            onClick={() => setShowHint(!showHint)}
                            className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                        >
                            <HelpCircle className="w-4 h-4" />
                            {showHint ? 'Esconder dica' : 'Preciso de uma dica'}
                        </button>
                        <AnimatePresence>
                            {showHint && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mt-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg"
                                >
                                    <div className="flex items-start gap-2">
                                        <Lightbulb className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                                        <p className="text-sm text-blue-300">{question.hint}</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Feedback */}
            <AnimatePresence>
                {showFeedback && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                            'p-4 rounded-lg border mb-6',
                            isCorrect
                                ? 'bg-green-500/10 border-green-500/30'
                                : 'bg-red-500/10 border-red-500/30'
                        )}
                    >
                        <div className="flex items-start gap-3">
                            {isCorrect ? (
                                <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0" />
                            ) : (
                                <XCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
                            )}
                            <div>
                                <p className={cn(
                                    'font-semibold mb-1',
                                    isCorrect ? 'text-green-400' : 'text-red-400'
                                )}>
                                    {isCorrect ? '✅ Correto!' : '❌ Incorreto'}
                                </p>
                                <p className="text-gray-300 text-sm">
                                    {question.explanation}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Actions */}
            <div className="flex justify-end gap-3">
                {!showFeedback ? (
                    <button
                        onClick={onConfirm}
                        disabled={!selectedOptionId}
                        className={cn(
                            'px-6 py-2.5 rounded-lg font-medium transition-all',
                            selectedOptionId
                                ? 'bg-purple-600 text-white hover:bg-purple-700'
                                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        )}
                    >
                        Confirmar Resposta
                    </button>
                ) : (
                    <button
                        onClick={onNext}
                        className="px-6 py-2.5 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                    >
                        {questionNumber === totalQuestions ? 'Ver Resultado' : 'Próxima Questão'}
                    </button>
                )}
            </div>
        </motion.div>
    );
}

// Option Button Component
interface OptionButtonProps {
    option: QuizOption;
    index: number;
    isSelected: boolean;
    isCorrect: boolean;
    isWrong: boolean;
    showFeedback: boolean;
    onClick: () => void;
}

function OptionButton({
    option,
    index,
    isSelected,
    isCorrect,
    isWrong,
    showFeedback,
    onClick,
}: OptionButtonProps) {
    const letters = ['A', 'B', 'C', 'D', 'E'];

    return (
        <motion.button
            whileHover={!showFeedback ? { scale: 1.01 } : undefined}
            whileTap={!showFeedback ? { scale: 0.99 } : undefined}
            onClick={onClick}
            disabled={showFeedback}
            className={cn(
                'w-full flex items-center gap-4 p-4 rounded-lg border transition-all text-left',
                !showFeedback && !isSelected && 'bg-gray-800/30 border-gray-700 hover:bg-gray-800/50 hover:border-gray-600',
                !showFeedback && isSelected && 'bg-purple-500/20 border-purple-500/50',
                isCorrect && 'bg-green-500/20 border-green-500/50',
                isWrong && 'bg-red-500/20 border-red-500/50',
                showFeedback && !isCorrect && !isWrong && 'opacity-50',
            )}
        >
            {/* Letter Badge */}
            <span className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0',
                !showFeedback && !isSelected && 'bg-gray-700 text-gray-300',
                !showFeedback && isSelected && 'bg-purple-500 text-white',
                isCorrect && 'bg-green-500 text-white',
                isWrong && 'bg-red-500 text-white',
            )}>
                {isCorrect ? (
                    <CheckCircle2 className="w-4 h-4" />
                ) : isWrong ? (
                    <XCircle className="w-4 h-4" />
                ) : (
                    letters[index]
                )}
            </span>

            {/* Option Content */}
            <div className="flex-1">
                {option.image && (
                    <img
                        src={option.image}
                        alt={option.text}
                        className="w-24 h-24 object-cover rounded-lg mb-2"
                    />
                )}
                <span className={cn(
                    'text-sm',
                    isCorrect ? 'text-green-400' : isWrong ? 'text-red-400' : 'text-gray-200'
                )}>
                    {option.text}
                </span>
            </div>
        </motion.button>
    );
}

export default QuizQuestionComponent;
