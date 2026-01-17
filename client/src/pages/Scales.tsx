import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileHeader } from '@/components/layout/MobileHeader';
import { MobileSidebar } from '@/components/layout/MobileSidebar';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { Button } from '@/components/ui/button';
import { ScaleFretboard } from '@/components/scales/ScaleFretboard';
import { useGamificationStore } from '@/stores/useGamificationStore';
import { Play, Volume2, StopCircle } from 'lucide-react';
import { unifiedAudioService } from '@/services/UnifiedAudioService';
import { useAudioSettingsStore } from '@/stores/useAudioSettingsStore';

const scales = [
  {
    id: 'c-major',
    name: 'Dó Maior',
    root: 'C',
    intervals: [0, 2, 4, 5, 7, 9, 11],
    difficulty: 'beginner',
    description: 'A escala mais fundamental. Base para entender todas as outras escalas.',
  },
  {
    id: 'a-minor',
    name: 'Lá Menor',
    root: 'A',
    intervals: [0, 2, 3, 5, 7, 8, 10],
    difficulty: 'beginner',
    description: 'Relativa menor de Dó Maior. Som melancólico e expressivo.',
  },
  {
    id: 'g-major',
    name: 'Sol Maior',
    root: 'G',
    intervals: [0, 2, 4, 5, 7, 9, 11],
    difficulty: 'beginner',
    description: 'Uma das escalas mais usadas no violão. Tom brilhante e alegre.',
  },
  {
    id: 'e-minor',
    name: 'Mi Menor',
    root: 'E',
    intervals: [0, 2, 3, 5, 7, 8, 10],
    difficulty: 'beginner',
    description: 'Escala menor natural muito popular. Fácil de tocar no violão.',
  },
  {
    id: 'c-pentatonic',
    name: 'Pentatônica de Dó',
    root: 'C',
    intervals: [0, 2, 4, 7, 9],
    difficulty: 'intermediate',
    description: 'Escala de 5 notas. Essencial para improvisação e solos.',
  },
  {
    id: 'a-blues',
    name: 'Blues de Lá',
    root: 'A',
    intervals: [0, 3, 5, 6, 7, 10],
    difficulty: 'intermediate',
    description: 'Pentatônica menor com blue note. Som característico do blues.',
  },
];

export default function Scales() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [selectedScale, setSelectedScale] = useState(scales[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const { xp, level, xpToNextLevel, currentStreak } = useGamificationStore();

  const handlePlayScale = async () => {
    setIsPlaying(true);
    await unifiedAudioService.playScale(selectedScale.name, selectedScale.root, selectedScale.intervals, 0.4);
    // Calculate duration: number of notes * 0.4s per note
    const duration = (selectedScale.intervals.length + 1) * 400;
    setTimeout(() => setIsPlaying(false), duration);
  };

  const handleStopScale = () => {
    unifiedAudioService.stopAll();
    setIsPlaying(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f1a] via-[#1a1a2e] to-[#0f0f1a] text-white">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          userName="João"
          userLevel={level}
          currentXP={xp}
          xpToNextLevel={xpToNextLevel}
          streak={currentStreak}
        />
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden">
        <MobileHeader
          userName="João"
          onMenuClick={() => setIsMobileSidebarOpen(true)}
        />
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        userName="João"
        userLevel={level}
        currentXP={xp}
        xpToNextLevel={xpToNextLevel}
        streak={currentStreak}
      />

      {/* Main Content */}
      <main className="lg:ml-72 pb-20 lg:pb-8">
        <div className="container py-8 space-y-8">
          <header>
            <h1 className="text-4xl font-bold text-white mb-2">Escalas Musicais</h1>
            <p className="text-gray-400">Aprenda e pratique escalas no braço do violão</p>
          </header>

          {/* Scale Selection */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {scales.map((scale) => (
              <Button
                key={scale.id}
                onClick={() => setSelectedScale(scale)}
                variant={selectedScale.id === scale.id ? 'default' : 'outline'}
                className={
                  selectedScale.id === scale.id
                    ? 'bg-gradient-to-r from-[#06b6d4] to-[#0891b2] text-white h-auto py-3'
                    : 'bg-[#1a1a2e]/60 border-white/20 text-gray-300 hover:bg-[#2a2a3e] h-auto py-3'
                }
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="font-bold">{scale.name}</span>
                  <span className="text-xs opacity-70 capitalize">{scale.difficulty}</span>
                </div>
              </Button>
            ))}
          </div>

          {/* Selected Scale Details */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left: Fretboard Diagram */}
            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-[#1a1a2e]/80 to-[#2a2a3e]/60 border border-white/20 shadow-xl">
                <h2 className="text-2xl font-bold text-white mb-4">{selectedScale.name}</h2>
                <p className="text-gray-400 mb-6">{selectedScale.description}</p>
                
                <ScaleFretboard scale={selectedScale} size="md" />
              </div>
            </div>

            {/* Right: Controls and Info */}
            <div className="space-y-4">
              {/* Audio Controls */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-[#1a1a2e]/80 to-[#2a2a3e]/60 border border-white/20 shadow-xl">
                <h3 className="text-xl font-bold text-white mb-4">Controles de Áudio</h3>
                
                <div className="flex gap-3">
                  {!isPlaying ? (
                    <Button
                      onClick={handlePlayScale}
                      className="flex-1 bg-gradient-to-r from-[#06b6d4] to-[#0891b2] hover:from-[#0891b2] hover:to-[#06b6d4] text-white font-semibold py-6 text-lg"
                    >
                      <Play className="mr-2" size={24} />
                      Ouvir Escala
                    </Button>
                  ) : (
                    <Button
                      onClick={handleStopScale}
                      className="flex-1 bg-gradient-to-r from-[#ef4444] to-[#dc2626] hover:from-[#dc2626] hover:to-[#ef4444] text-white font-semibold py-6 text-lg"
                    >
                      <StopCircle className="mr-2" size={24} />
                      Parar
                    </Button>
                  )}
                </div>

                {isPlaying && (
                  <div className="mt-4 flex items-center gap-3 text-cyan-400">
                    <Volume2 className="animate-pulse" size={20} />
                    <span className="text-sm font-semibold">Tocando escala...</span>
                  </div>
                )}
              </div>

              {/* Scale Info */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-[#1a1a2e]/80 to-[#2a2a3e]/60 border border-white/20 shadow-xl">
                <h3 className="text-xl font-bold text-white mb-4">Informações</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-gray-400">Tônica:</span>
                    <span className="text-white font-semibold text-lg">{selectedScale.root}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-gray-400">Número de Notas:</span>
                    <span className="text-white font-semibold">{selectedScale.intervals.length}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-gray-400">Dificuldade:</span>
                    <span className={`font-semibold capitalize ${
                      selectedScale.difficulty === 'beginner' ? 'text-green-400' :
                      selectedScale.difficulty === 'intermediate' ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {selectedScale.difficulty === 'beginner' ? 'Iniciante' :
                       selectedScale.difficulty === 'intermediate' ? 'Intermediário' :
                       'Avançado'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-400">Intervalos:</span>
                    <span className="text-white font-mono text-sm">
                      {selectedScale.intervals.join(' - ')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Practice Tips */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-[#8b5cf6]/20 to-[#6d28d9]/10 border border-[#8b5cf6]/30 shadow-xl">
                <h3 className="text-xl font-bold text-white mb-3">💡 Dicas de Prática</h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">•</span>
                    <span>Comece devagar e aumente a velocidade gradualmente</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">•</span>
                    <span>Pratique subindo e descendo a escala</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">•</span>
                    <span>Use um metrônomo para manter o tempo</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">•</span>
                    <span>Memorize as posições das notas no braço</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden">
        <MobileBottomNav />
      </div>
    </div>
  );
}
