interface ChordDiagramProps {
  frets: (number | 'x')[];
  fingers: (number | 0)[];
  name: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ChordDiagram({ frets, fingers, name, size = 'md' }: ChordDiagramProps) {
  const sizeClasses = {
    sm: { container: 'w-32 h-40', dot: 'w-5 h-5', text: 'text-xs' },
    md: { container: 'w-48 h-60', dot: 'w-7 h-7', text: 'text-sm' },
    lg: { container: 'w-64 h-80', dot: 'w-9 h-9', text: 'text-base' },
  };
  
  const classes = sizeClasses[size];
  
  return (
    <div className={`${classes.container} relative`}>
      {/* Chord Name */}
      <div className={`text-center font-bold text-white mb-2 ${classes.text}`}>
        {name}
      </div>
      
      {/* Fretboard */}
      <div className="relative bg-[#1a1a2e] rounded-lg p-4 border border-white/20">
        {/* Strings (vertical lines) */}
        <div className="absolute inset-4 flex justify-between">
          {[0, 1, 2, 3, 4, 5].map((string) => (
            <div key={string} className="w-px bg-gray-400 h-full" />
          ))}
        </div>
        
        {/* Frets (horizontal lines) */}
        <div className="absolute inset-4 flex flex-col justify-between">
          {[0, 1, 2, 3].map((fret) => (
            <div key={fret} className={`h-px ${fret === 0 ? 'bg-white' : 'bg-gray-600'} w-full`} />
          ))}
        </div>
        
        {/* Finger positions */}
        <div className="relative h-full flex justify-between items-start pt-2">
          {frets.map((fret, index) => {
            if (fret === 'x') {
              return (
                <div key={index} className="flex flex-col items-center -mt-6">
                  <span className="text-red-400 font-bold">✕</span>
                </div>
              );
            }
            
            if (fret === 0) {
              return (
                <div key={index} className="flex flex-col items-center -mt-6">
                  <span className="text-green-400 font-bold">○</span>
                </div>
              );
            }
            
            const topPosition = ((fret as number) - 0.5) * 25; // Percentage
            
            return (
              <div key={index} className="relative h-full">
                <div
                  className={`absolute ${classes.dot} rounded-full bg-gradient-to-br from-[#06b6d4] to-[#0891b2] border-2 border-white shadow-lg flex items-center justify-center -translate-x-1/2`}
                  style={{ top: `${topPosition}%` }}
                >
                  {fingers[index] !== 0 && (
                    <span className="text-white font-bold text-xs">{fingers[index]}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Finger numbers legend */}
      <div className={`mt-2 text-center ${classes.text} text-gray-400`}>
        <div className="flex items-center justify-center gap-2">
          <span>1=Indicador</span>
          <span>2=Médio</span>
          <span>3=Anelar</span>
          <span>4=Mindinho</span>
        </div>
      </div>
    </div>
  );
}
