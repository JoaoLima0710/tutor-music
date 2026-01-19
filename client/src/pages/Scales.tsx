import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileHeader } from '@/components/layout/MobileHeader';
import { MobileSidebar } from '@/components/layout/MobileSidebar';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { Button } from '@/components/ui/button';
import { ScalePractice } from '@/components/scales/ScalePractice';
import { IntervalTheory } from '@/components/scales/IntervalTheory';
import { ScaleShapes } from '@/components/scales/ScaleShapes';
import { EarTraining } from '@/components/scales/EarTraining';
import { ScaleImprovisation } from '@/components/scales/ScaleImprovisation';
import { FullFretboardView } from '@/components/scales/FullFretboardView';
import { useGamificationStore } from '@/stores/useGamificationStore';
import { Play, Volume2, StopCircle, BookOpen, Layers, Mic, Radio, GraduationCap } from 'lucide-react';
import { unifiedAudioService } from '@/services/UnifiedAudioService';
import { useAudioSettingsStore } from '@/stores/useAudioSettingsStore';
import { useScaleProgressionStore } from '@/stores/useScaleProgressionStore';

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
  // Modos Gregos
  {
    id: 'd-dorian',
    name: 'Dórico de Ré',
    root: 'D',
    intervals: [0, 2, 3, 5, 7, 9, 10],
    difficulty: 'intermediate',
    description: 'Modo menor com 6ª maior. Som jazzy e sofisticado. Muito usado em jazz e fusion.',
  },
  {
    id: 'e-phrygian',
    name: 'Frígio de Mi',
    root: 'E',
    intervals: [0, 1, 3, 5, 7, 8, 10],
    difficulty: 'intermediate',
    description: 'Modo menor com 2ª menor. Som espanhol e exótico. Usado em flamenco.',
  },
  {
    id: 'f-lydian',
    name: 'Lídio de Fá',
    root: 'F',
    intervals: [0, 2, 4, 6, 7, 9, 11],
    difficulty: 'intermediate',
    description: 'Modo maior com 4ª aumentada. Som sonhador e etéreo. Usado em trilhas sonoras.',
  },
  {
    id: 'g-mixolydian',
    name: 'Mixolídio de Sol',
    root: 'G',
    intervals: [0, 2, 4, 5, 7, 9, 10],
    difficulty: 'intermediate',
    description: 'Modo maior com 7ª menor. Som de blues e rock. Usado em improvisação.',
  },
  {
    id: 'a-aeolian',
    name: 'Eólio de Lá',
    root: 'A',
    intervals: [0, 2, 3, 5, 7, 8, 10],
    difficulty: 'beginner',
    description: 'Escala menor natural. Idêntico à escala menor, base de toda música menor.',
  },
  {
    id: 'b-locrian',
    name: 'Lócrio de Si',
    root: 'B',
    intervals: [0, 1, 3, 5, 6, 8, 10],
    difficulty: 'advanced',
    description: 'Modo diminuto. Som tenso e instável. Usado em metal e música experimental.',
  },
  // Escalas Exóticas
  {
    id: 'a-harmonic-minor',
    name: 'Harmônica Menor de Lá',
    root: 'A',
    intervals: [0, 2, 3, 5, 7, 8, 11],
    difficulty: 'advanced',
    description: 'Menor com 7ª maior. Som dramático e oriental. Usada em metal e clássico.',
  },
  {
    id: 'a-melodic-minor',
    name: 'Melódica Menor de Lá',
    root: 'A',
    intervals: [0, 2, 3, 5, 7, 9, 11],
    difficulty: 'advanced',
    description: 'Menor com 6ª e 7ª maiores. Som jazzy e sofisticado. Essencial para jazz.',
  },
  {
    id: 'c-gypsy',
    name: 'Cigana de Dó',
    root: 'C',
    intervals: [0, 2, 3, 6, 7, 8, 11],
    difficulty: 'advanced',
    description: 'Escala húngara/cigana. Som exótico e apaixonado. Usada em música cigana.',
  },
  {
    id: 'e-phrygian-dominant',
    name: 'Frígio Dominante de Mi',
    root: 'E',
    intervals: [0, 1, 4, 5, 7, 8, 10],
    difficulty: 'advanced',
    description: 'Escala espanhola/flamenco. Som intenso e apaixonado. Essencial para flamenco.',
  },
];

type LearningStep = 'intervals' | 'theory' | 'shapes' | 'fretboard' | 'practice' | 'ear' | 'improvisation';

const LEARNING_STEPS: { id: LearningStep; name: string; icon: any; description: string }[] = [
  { id: 'intervals', name: 'Intervalos', icon: BookOpen, description: 'Fundação: aprenda intervalos primeiro' },
  { id: 'theory', name: 'Teoria', icon: GraduationCap, description: 'Entenda como a escala é construída' },
  { id: 'shapes', name: 'Formas', icon: Layers, description: 'CAGED, 3NPS e diferentes posições' },
  { id: 'fretboard', name: 'Braço Completo', icon: Play, description: 'Visualize todas as notas no braço do violão' },
  { id: 'practice', name: 'Prática', icon: Play, description: 'Treine com padrões multidirecionais' },
  { id: 'ear', name: 'Ear Training', icon: Mic, description: 'Cante e reconheça graus da escala' },
  { id: 'improvisation', name: 'Improvisação', icon: Radio, description: 'Aplique em contexto musical' },
];

export default function Scales() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [selectedScale, setSelectedScale] = useState(scales[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState<LearningStep>('fretboard');
  
  const { xp, level, xpToNextLevel, currentStreak, addXP } = useGamificationStore();
  const { isScaleUnlocked, isScaleMastered, getScaleProgress, getStats } = useScaleProgressionStore();
  
  // Filtrar escalas desbloqueadas
  const unlockedScales = scales.filter(scale => isScaleUnlocked(scale.id));
  const lockedScales = scales.filter(scale => !isScaleUnlocked(scale.id));
  
  // Estatísticas de progressão
  const stats = getStats();

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
        <div className="container py-6 space-y-6">
          <header className="mb-4">
            <h1 className="text-4xl font-bold text-white mb-2">Escalas Musicais</h1>
            <p className="text-gray-400">Aprenda e pratique escalas no braço do violão</p>
          </header>

          {/* Learning Path Navigation */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#1a1a2e]/80 to-[#2a2a3e]/60 border border-white/20 shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-cyan-400" />
              <span>Caminho de Aprendizado</span>
            </h2>
            <p className="text-gray-400 mb-6">
              Siga esta sequência pedagógica baseada em r/guitarlessons para aprender escalas de forma eficaz
            </p>
            
            <div className="flex flex-wrap gap-3">
              {LEARNING_STEPS.map((step) => {
                const Icon = step.icon;
                return (
                  <Button
                    key={step.id}
                    onClick={() => setCurrentStep(step.id)}
                    variant={currentStep === step.id ? 'default' : 'outline'}
                    className={currentStep === step.id
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500'
                      : 'bg-white/5 border-white/10 hover:border-cyan-400/50'
                    }
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {step.name}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Selected Scale Details - Baseado no Step Atual */}
          <div className="space-y-8">
            {/* Step 1: Intervalos */}
            {currentStep === 'intervals' && (
              <IntervalTheory rootNote={selectedScale.root} />
            )}

            {/* Step 2: Teoria */}
            {currentStep === 'theory' && (
              <div className="p-6 rounded-2xl bg-gradient-to-br from-[#1a1a2e]/80 to-[#2a2a3e]/60 border border-white/20">
                <h2 className="text-2xl font-bold text-white mb-4">{selectedScale.name}</h2>
                <p className="text-gray-400 mb-6">{selectedScale.description}</p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-4 rounded-xl bg-white/5">
                    <h3 className="text-lg font-bold text-white mb-3">Fórmula de Intervalos</h3>
                    <div className="space-y-2">
                      {selectedScale.intervals.map((interval, i) => {
                        const intervalNames = ['Tônica', '2ª', '3ª', '4ª', '5ª', '6ª', '7ª'];
                        return (
                          <div key={i} className="flex items-center justify-between">
                            <span className="text-gray-300">Grau {i + 1}: {intervalNames[i] || `${interval} semitons`}</span>
                            <span className="text-cyan-400 font-mono">{interval} semitons</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-white/5">
                    <h3 className="text-lg font-bold text-white mb-3">Notas da Escala</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedScale.intervals.map((interval, i) => {
                        const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
                        const rootIndex = NOTES.indexOf(selectedScale.root);
                        const noteIndex = (rootIndex + interval) % 12;
                        const note = NOTES[noteIndex];
                        return (
                          <span key={i} className="px-3 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 font-bold">
                            {note}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Formas */}
            {currentStep === 'shapes' && (
              <ScaleShapes
                scaleName={selectedScale.name}
                root={selectedScale.root}
                intervals={selectedScale.intervals}
              />
            )}

            {/* Step 4: Diagrama do Braço */}
            {currentStep === 'fretboard' && (
              <div className="space-y-6">
                {/* Visualização Completa do Braço (inspirado em f2k.mjgibson.com) */}
                <FullFretboardView
                  scaleName={selectedScale.name}
                  root={selectedScale.root}
                  intervals={selectedScale.intervals}
                />
                
              </div>
            )}

            {/* Step 5: Prática */}
            {currentStep === 'practice' && (
              <div className="p-6 rounded-2xl bg-gradient-to-br from-[#1a1a2e]/80 to-[#2a2a3e]/60 border border-white/20">
                <h2 className="text-2xl font-bold text-white mb-4">🎸 Treino Interativo</h2>
                <p className="text-gray-400 mb-6">Pratique a escala com feedback em tempo real usando seu violão</p>
                
                <ScalePractice 
                  scale={{
                    id: selectedScale.id,
                    name: selectedScale.name,
                    notes: selectedScale.intervals.map((interval, i) => {
                      const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
                      const rootIndex = notes.indexOf(selectedScale.root);
                      const noteIndex = (rootIndex + interval) % 12;
                      return notes[noteIndex];
                    }),
                    intervals: selectedScale.intervals.map(i => i.toString()),
                    fretPositions: [],
                  }}
                  onComplete={() => {
                    addXP(50);
                  }}
                />
              </div>
            )}

            {/* Step 6: Ear Training */}
            {currentStep === 'ear' && (
              <EarTraining
                scaleName={selectedScale.name}
                root={selectedScale.root}
                intervals={selectedScale.intervals}
              />
            )}

            {/* Step 7: Improvisação */}
            {currentStep === 'improvisation' && (
              <ScaleImprovisation
                scaleName={selectedScale.name}
                root={selectedScale.root}
                intervals={selectedScale.intervals}
              />
            )}
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
