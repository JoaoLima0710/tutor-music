import { motion } from 'framer-motion';

interface ChordSheetProps {
  chordSheet: string;
  highlightChords?: boolean;
}

export function ChordSheet({ chordSheet, highlightChords = true }: ChordSheetProps) {
  // Parse chord sheet to highlight chords
  const parseChordSheet = (text: string) => {
    if (!highlightChords) return text;
    
    // Regex to match chords in brackets like [C], [Am7], etc
    const chordRegex = /\[([^\]]+)\]/g;
    
    const parts: { type: 'chord' | 'text'; content: string }[] = [];
    let lastIndex = 0;
    let match;
    
    while ((match = chordRegex.exec(text)) !== null) {
      // Add text before chord
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: text.slice(lastIndex, match.index),
        });
      }
      
      // Add chord
      parts.push({
        type: 'chord',
        content: match[1],
      });
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.slice(lastIndex),
      });
    }
    
    return parts;
  };
  
  const lines = chordSheet.split('\n');
  
  return (
    <motion.div
      className="rounded-2xl p-6 bg-[#1a1a2e]/60 backdrop-blur-xl border border-white/10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="space-y-4">
        {lines.map((line, lineIndex) => {
          const parts = parseChordSheet(line);
          
          return (
            <div key={lineIndex} className="font-mono text-base leading-relaxed">
              {Array.isArray(parts) ? (
                <span>
                  {parts.map((part, partIndex) => {
                    if (part.type === 'chord') {
                      return (
                        <span
                          key={partIndex}
                          className="inline-block px-2 py-0.5 mx-0.5 rounded-md bg-gradient-to-r from-[#06b6d4] to-[#0891b2] text-white font-bold text-sm"
                        >
                          {part.content}
                        </span>
                      );
                    }
                    return (
                      <span key={partIndex} className="text-gray-300">
                        {part.content}
                      </span>
                    );
                  })}
                </span>
              ) : (
                <span className="text-gray-300">{line}</span>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
