import React, { useState, useCallback } from 'react';
import { Volume2, VolumeX, Volume1 } from 'lucide-react';
import { getAudioMixer } from '../../audio';

interface VolumeControlProps {
  className?: string;
}

export function VolumeControl({ className = '' }: VolumeControlProps) {
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [showSlider, setShowSlider] = useState(false);

  const handleVolumeChange = useCallback((newVolume: number) => {
    setVolume(newVolume);
    const mixer = getAudioMixer();
    if (mixer) {
      mixer.setMasterVolume(newVolume / 100);
    }
  }, []);

  const handleMuteToggle = useCallback(() => {
    const mixer = getAudioMixer();
    if (mixer) {
      mixer.toggleMute();
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return <VolumeX className="w-5 h-5" />;
    if (volume < 50) return <Volume1 className="w-5 h-5" />;
    return <Volume2 className="w-5 h-5" />;
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={handleMuteToggle}
        onMouseEnter={() => setShowSlider(true)}
        onMouseLeave={() => setShowSlider(false)}
        className="p-2 rounded-lg hover:bg-muted transition"
      >
        {getVolumeIcon()}
      </button>

      {/* Volume Slider Popup */}
      {showSlider && (
        <div
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-3 bg-card rounded-xl border border-border shadow-lg"
          onMouseEnter={() => setShowSlider(true)}
          onMouseLeave={() => setShowSlider(false)}
        >
          <div className="w-32">
            <div className="text-xs text-muted-foreground text-center mb-2">
              Volume: {volume}%
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={volume}
              onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default VolumeControl;
