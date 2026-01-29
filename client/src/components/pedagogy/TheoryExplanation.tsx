/**
 * TheoryExplanation Component
 * Renders rich educational content with various block types
 * Supports: text, heading, list, quote, tip, warning, example
 */

import { motion } from 'framer-motion';
import {
    Lightbulb,
    AlertTriangle,
    Quote,
    CheckCircle2,
    BookOpen,
    Info,
    Music
} from 'lucide-react';
import { LessonContent, LessonImage, DiagramReference } from '@/types/pedagogy';
import { cn } from '@/lib/utils';

interface TheoryExplanationProps {
    title: string;
    content: LessonContent[];
    images?: LessonImage[];
    diagrams?: DiagramReference[];
    className?: string;
}

// Block type icons and styles
const blockStyles = {
    tip: {
        icon: Lightbulb,
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/30',
        iconColor: 'text-blue-400',
        titleColor: 'text-blue-400',
        title: '💡 Dica',
    },
    warning: {
        icon: AlertTriangle,
        bg: 'bg-yellow-500/10',
        border: 'border-yellow-500/30',
        iconColor: 'text-yellow-400',
        titleColor: 'text-yellow-400',
        title: '⚠️ Atenção',
    },
    example: {
        icon: CheckCircle2,
        bg: 'bg-green-500/10',
        border: 'border-green-500/30',
        iconColor: 'text-green-400',
        titleColor: 'text-green-400',
        title: '✅ Exemplo',
    },
    quote: {
        icon: Quote,
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/30',
        iconColor: 'text-purple-400',
        titleColor: 'text-purple-400',
        title: '',
    },
};

function ContentBlock({ block, index }: { block: LessonContent; index: number }) {
    const variants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { delay: index * 0.1 }
        },
    };

    switch (block.type) {
        case 'heading':
            const headingLevel = block.metadata?.level || 2;
            const headingClass = cn(
                'font-bold text-white mb-4',
                headingLevel === 2 && 'text-2xl mt-8',
                headingLevel === 3 && 'text-xl mt-6',
                headingLevel === 4 && 'text-lg mt-4',
            );

            if (headingLevel === 2) {
                return (
                    <motion.div variants={variants}>
                        <h2 className={headingClass}>{block.content}</h2>
                    </motion.div>
                );
            } else if (headingLevel === 3) {
                return (
                    <motion.div variants={variants}>
                        <h3 className={headingClass}>{block.content}</h3>
                    </motion.div>
                );
            } else {
                return (
                    <motion.div variants={variants}>
                        <h4 className={headingClass}>{block.content}</h4>
                    </motion.div>
                );
            }

        case 'text':
            return (
                <motion.p
                    variants={variants}
                    className="text-gray-300 leading-relaxed mb-4"
                    dangerouslySetInnerHTML={{
                        __html: formatText(block.content)
                    }}
                />
            );

        case 'list':
            const items = block.metadata?.items || block.content.split('\n');
            const isOrdered = block.content.startsWith('1.');
            const ListTag = isOrdered ? 'ol' : 'ul';

            return (
                <motion.div variants={variants}>
                    <ListTag className={cn(
                        'mb-4 space-y-2 pl-6',
                        isOrdered ? 'list-decimal' : 'list-disc'
                    )}>
                        {items.map((item: string, i: number) => (
                            <li key={i} className="text-gray-300">
                                {item.replace(/^\d+\.\s*/, '').replace(/^-\s*/, '')}
                            </li>
                        ))}
                    </ListTag>
                </motion.div>
            );

        case 'quote':
            return (
                <motion.blockquote
                    variants={variants}
                    className={cn(
                        'relative pl-6 py-4 my-6 rounded-r-lg',
                        blockStyles.quote.bg,
                        'border-l-4',
                        blockStyles.quote.border,
                    )}
                >
                    <Quote className={cn(
                        'absolute -left-3 -top-3 w-6 h-6 bg-gray-900 rounded-full p-1',
                        blockStyles.quote.iconColor
                    )} />
                    <p className="text-gray-300 italic text-lg">
                        {block.content}
                    </p>
                </motion.blockquote>
            );

        case 'tip':
        case 'warning':
        case 'example':
            const style = blockStyles[block.type];
            const Icon = style.icon;

            return (
                <motion.div
                    variants={variants}
                    className={cn(
                        'rounded-lg p-4 my-4 border',
                        style.bg,
                        style.border,
                    )}
                >
                    <div className="flex items-start gap-3">
                        <Icon className={cn('w-5 h-5 mt-0.5 flex-shrink-0', style.iconColor)} />
                        <div>
                            {style.title && (
                                <p className={cn('font-semibold mb-1', style.titleColor)}>
                                    {style.title}
                                </p>
                            )}
                            <p className="text-gray-300">
                                {block.content}
                            </p>
                        </div>
                    </div>
                </motion.div>
            );

        default:
            return (
                <motion.p variants={variants} className="text-gray-300 mb-4">
                    {block.content}
                </motion.p>
            );
    }
}

function ImageBlock({ image }: { image: LessonImage }) {
    return (
        <figure className={cn(
            'my-6',
            image.position === 'full-width' && 'w-full',
            image.position === 'side' && 'float-right ml-4 w-1/3',
            image.position === 'inline' && 'mx-auto max-w-md',
        )}>
            <img
                src={image.url}
                alt={image.alt}
                className="rounded-lg shadow-lg border border-gray-700"
            />
            {image.caption && (
                <figcaption className="text-center text-sm text-gray-400 mt-2">
                    {image.caption}
                </figcaption>
            )}
        </figure>
    );
}

function DiagramBlock({ diagram }: { diagram: DiagramReference }) {
    if (diagram.type === 'chord') {
        // Simple chord display card - links to full chord page
        return (
            <div className="my-6 inline-block">
                <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl p-6 border border-cyan-500/30 text-center min-w-[120px]">
                    <Music className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white mb-1">{diagram.id}</p>
                    <p className="text-xs text-cyan-300">Acorde</p>
                    {diagram.caption && (
                        <p className="text-sm text-gray-400 mt-2">
                            {diagram.caption}
                        </p>
                    )}
                </div>
            </div>
        );
    }

    // Placeholder for other diagram types
    return (
        <div className="my-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700 text-center">
            <Info className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-400">Diagrama: {diagram.id}</p>
        </div>
    );
}

// Helper function to format inline text (bold, italic, code)
function formatText(text: string): string {
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code class="bg-gray-700 px-1.5 py-0.5 rounded text-sm font-mono text-blue-300">$1</code>');
}

export function TheoryExplanation({
    title,
    content,
    images = [],
    diagrams = [],
    className,
}: TheoryExplanationProps) {
    return (
        <motion.article
            initial="hidden"
            animate="visible"
            className={cn('max-w-3xl mx-auto', className)}
        >
            {/* Title */}
            <motion.header
                variants={{
                    hidden: { opacity: 0, y: -20 },
                    visible: { opacity: 1, y: 0 },
                }}
                className="mb-8"
            >
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                        <BookOpen className="w-6 h-6 text-blue-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-white">
                        {title}
                    </h1>
                </div>
                <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
            </motion.header>

            {/* Content Blocks */}
            <div className="prose prose-invert max-w-none">
                {content.map((block, index) => (
                    <ContentBlock key={index} block={block} index={index} />
                ))}
            </div>

            {/* Images */}
            {images.length > 0 && (
                <div className="my-8">
                    {images.map((image, index) => (
                        <ImageBlock key={index} image={image} />
                    ))}
                </div>
            )}

            {/* Diagrams */}
            {diagrams.length > 0 && (
                <div className="my-8 flex flex-wrap gap-4 justify-center">
                    {diagrams.map((diagram, index) => (
                        <DiagramBlock key={index} diagram={diagram} />
                    ))}
                </div>
            )}
        </motion.article>
    );
}

export default TheoryExplanation;
