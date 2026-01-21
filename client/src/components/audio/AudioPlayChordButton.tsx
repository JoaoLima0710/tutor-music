import React, { useState } from 'react';
import { useChordPlayer } from '../../hooks/useChordPlayer';
import { useAudio } from '../../hooks/useAudio';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';

interface ChordPlayButtonProps {
  chordName: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function ChordPlayButton({ 
  chordName, 
  size = 'md', 
  showLabel = true,
  className = '' 
}: ChordPlayButtonProps) {
  const { isReady, initialize } = useAudio();
  const { playChord, isPlaying } = useChordPlayer();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    if (!isReady) {
      setIsLoading(true);
      await initialize();
      setIsLoading(false);
    }
    
    await playChord(chordName);
  };

  const sizeClasses = {
    sm: 'p-2',
    md: 'p-3',
    lg: 'p-4',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`
        ${sizeClasses[size]}
        rounded-full transition-all
        ${isPlaying 
          ? 'bg-primary text-white scale-110' 
          : 'bg-muted hover:bg-muted/80'
        }
        ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      title={`Tocar ${chordName}`}
    >
      {isLoading ? (
        <Loader2 className={`${iconSizes[size]} animate-spin`} />
      ) : isPlaying ? (
        <Volume2 className={`${iconSizes[size]} animate-pulse`} />
      ) : (
        <Volume2 className={iconSizes[size]} />
      )}
      {showLabel && (
        <span className="ml-2 text-sm font-medium">
          {isPlaying ? 'Tocando...' : 'Ouvir'}
        </span>
      )}
    </button>
  );
}

export default ChordPlayButton;
