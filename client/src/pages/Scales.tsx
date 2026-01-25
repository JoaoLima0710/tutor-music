import { useState } from 'react';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileHeader } from '@/components/layout/MobileHeader';
import { MobileSidebar } from '@/components/layout/MobileSidebar';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { Button } from '@/components/ui/button';
import {
  ScalePractice,
  EnhancedScalePractice,
  IntervalTheory,
  ScaleShapes,
  EarTraining,
  ScaleImprovisation,
  FullFretboardView,
} from '@/components/scales';
import { useGamificationStore } from '@/stores/useGamificationStore';
import { useUserStore } from '@/stores/useUserStore';
import { Play, StopCircle, BookOpen, Layers, Mic, Radio, GraduationCap, ChevronDown, Lock, Check } from 'lucide-react';
import { AudioPlayScaleButton } from '@/components/audio/AudioPlayScaleButton';
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
  // Adicionar breadcrumbs no início do componente
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [selectedScale, setSelectedScale] = useState(scales[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState<LearningStep>('fretboard');
  const [showScaleSelector, setShowScaleSelector] = useState(false);
  
  const { xp, level, xpToNextLevel, currentStreak, addXP } = useGamificationStore();
  const { isScaleUnlocked, isScaleMastered, getScaleProgress, getStats } = useScaleProgressionStore();
  const { user } = useUserStore();
  
  const userName = user?.name || "Usuário";
  
  // Filtrar escalas desbloqueadas
  const unlockedScales = scales.filter(scale => isScaleUnlocked(scale.id));
  const lockedScales = scales.filter(scale => !isScaleUnlocked(scale.id));
  
  // Estatísticas de progressão
  const stats = getStats();



  return (
    <>
      {/* DESKTOP VERSION */}
      <div className="hidden lg:flex h-screen bg-[#0f0f1a] text-white overflow-hidden">
        <Sidebar
          userName={userName}
          userLevel={level}
          currentXP={xp}
          xpToNextLevel={xpToNextLevel}
          streak={currentStreak}
        />
        
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto p-8 space-y-6">
            <Breadcrumbs />
            <header>
              <h1 className="text-4xl font-bold text-white mb-2">Escalas Musicais</h1>
              <p className="text-gray-400">Aprenda e pratique escalas no braço do violão</p>
            </header>

          {/* Seletor de Escala */}
          <div className="relative">
            <button
              onClick={() => setShowScaleSelector(!showScaleSelector)}
              className="w-full p-4 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-between hover:border-emerald-400/50 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white font-bold">
                  {selectedScale.root}
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-bold text-white">{selectedScale.name}</h3>
                  <p className="text-sm text-gray-400">{selectedScale.difficulty === 'beginner' ? 'Iniciante' : selectedScale.difficulty === 'intermediate' ? 'Intermediário' : 'Avançado'}</p>
                </div>
              </div>
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showScaleSelector ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Dropdown de Escalas */}
            {showScaleSelector && (
              <div className="absolute z-50 top-full left-0 right-0 mt-2 p-3 rounded-2xl bg-[#1a1a2e] border border-white/20 shadow-xl max-h-80 overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {scales.map((scale) => {
                    const isUnlocked = isScaleUnlocked(scale.id);
                    const isMastered = isScaleMastered(scale.id);
                    const isSelected = selectedScale.id === scale.id;
                    
                    return (
                      <button
                        key={scale.id}
                        onClick={() => {
                          if (isUnlocked) {
                            setSelectedScale(scale);
                            setShowScaleSelector(false);
                          }
                        }}
                        disabled={!isUnlocked}
                        className={`
                          p-3 rounded-xl text-left transition-all flex items-center gap-3
                          ${isSelected ? 'bg-emerald-500/30 border border-emerald-400' : 'hover:bg-white/5'}
                          ${!isUnlocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                        `}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold
                          ${isSelected ? 'bg-emerald-500 text-white' : 'bg-white/10 text-gray-300'}
                        `}>
                          {scale.root}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-white text-sm truncate">{scale.name}</div>
                          <div className="text-xs text-gray-400">{scale.difficulty === 'beginner' ? 'Iniciante' : scale.difficulty === 'intermediate' ? 'Intermediário' : 'Avançado'}</div>
                        </div>
                        {!isUnlocked && <Lock className="w-4 h-4 text-gray-500" />}
                        {isMastered && <Check className="w-4 h-4 text-emerald-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

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
                <h2 className="text-2xl font-bold text-white mb-4">🎸 Treino de Coordenação</h2>
                <p className="text-gray-400 mb-6">Pratique com foco em coordenação e controle, não velocidade</p>
                
                <EnhancedScalePractice 
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
      </div>
    </div>

      {/* MOBILE VERSION */}
      <div className="lg:hidden min-h-screen bg-[#0f0f1a] text-white">
        <MobileHeader
          userName={userName}
          onMenuClick={() => setIsMobileSidebarOpen(true)}
        />
        
        <MobileSidebar
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
          userName={userName}
          userLevel={level}
          currentXP={xp}
          xpToNextLevel={xpToNextLevel}
          streak={currentStreak}
        />
        
        <main className="px-4 py-4 pb-24 space-y-4">
          {/* Breadcrumbs */}
          <Breadcrumbs />
          <header>
            <h1 className="text-2xl font-bold text-white mb-1">Escalas Musicais</h1>
            <p className="text-sm text-gray-400">Aprenda escalas no violão</p>
          </header>

          {/* Seletor de Escala Mobile */}
          <div className="relative">
            <button
              onClick={() => setShowScaleSelector(!showScaleSelector)}
              className="w-full p-3 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-bold text-sm">
                  {selectedScale.root}
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-white text-sm">{selectedScale.name}</h3>
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showScaleSelector ? 'rotate-180' : ''}`} />
            </button>
            
            {showScaleSelector && (
              <div className="absolute z-50 top-full left-0 right-0 mt-2 p-2 rounded-xl bg-[#1a1a2e] border border-white/20 shadow-xl max-h-60 overflow-y-auto">
                {scales.map((scale) => {
                  const isUnlocked = isScaleUnlocked(scale.id);
                  const isMastered = isScaleMastered(scale.id);
                  const isSelected = selectedScale.id === scale.id;
                  
                  return (
                    <button
                      key={scale.id}
                      onClick={() => {
                        if (isUnlocked) {
                          setSelectedScale(scale);
                          setShowScaleSelector(false);
                        }
                      }}
                      disabled={!isUnlocked}
                      className={`w-full p-2 rounded-lg text-left flex items-center gap-2
                        ${isSelected ? 'bg-emerald-500/30' : 'hover:bg-white/5'}
                        ${!isUnlocked ? 'opacity-50' : ''}
                      `}
                    >
                      <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold
                        ${isSelected ? 'bg-emerald-500 text-white' : 'bg-white/10 text-gray-300'}
                      `}>
                        {scale.root}
                      </div>
                      <span className="text-sm text-white flex-1">{scale.name}</span>
                      {!isUnlocked && <Lock className="w-3 h-3 text-gray-500" />}
                      {isMastered && <Check className="w-3 h-3 text-emerald-400" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* FullFretboardView Mobile */}
          <FullFretboardView
            scaleName={selectedScale.name}
            root={selectedScale.root}
            intervals={selectedScale.intervals}
          />

          {/* Play Button Mobile - Novo sistema de áudio */}
          <AudioPlayScaleButton
            scaleName={selectedScale.name}
            root={selectedScale.root}
            intervals={selectedScale.intervals}
            className="w-full"
          />
        </main>
        
        <MobileBottomNav />
      </div>
    </>
  );
}
