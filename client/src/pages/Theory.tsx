import { useState, useEffect } from 'react';
import { useAudio } from '@/hooks/useAudio';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUserStore } from '@/stores/useUserStore';
import { Book, Activity, Clock, Lock, AlertCircle, Play, CheckCircle2, ArrowLeft } from 'lucide-react';
import {
  TheoryQuiz,
} from '@/components/theory';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { useTheoryProgressionStore } from '@/stores/useTheoryProgressionStore';
import { usePracticeUnlockStore } from '@/stores/usePracticeUnlockStore';
import { Link } from 'wouter';
import { THEORY_MODULES, TheoryModule, isIntermediateOrAdvanced } from '@/data/theory-modules';

export default function Theory() {
  const [selectedModule, setSelectedModule] = useState<TheoryModule | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const {
    currentLevel,
    advanceLevel: setCurrentLevel,
    isModuleUnlocked,
    completeModule,
    getMissingRequirements
  } = useTheoryProgressionStore();
  const { unlockExercise } = usePracticeUnlockStore();
  const { isReady } = useAudio();

  // Scroll to top when module is selected
  useEffect(() => {
    if (selectedModule) {
      window.scrollTo(0, 0);
    }
  }, [selectedModule]);

  // Filter modules based on level and unlock status
  const availableModules = THEORY_MODULES.filter(module => {
    // Show modules appropriate for current user level or below
    // But maybe we want to show all? 
    // The original code filtered by level matches:
    // basic users see basic
    // intermediate users see basic + intermediate
    // advanced users see all

    // Logic from previous file:
    // if (module.level === 'advanced' && currentLevel !== 'advanced') return false;
    // if (module.level === 'intermediate' && currentLevel === 'basic') return false;

    // Simpler check:
    if (currentLevel === 'basic' && module.level !== 'basic') return false;
    if (currentLevel === 'intermediate' && module.level === 'advanced') return false;

    // And verify unlocked status? 
    // Actually, availableModules usually means "Visible in the main grid". 
    // Locked modules are usually separated or shown with a lock.
    // In previous code:
    // availableModules = unlocked checkboxes
    // lockedModules = locked checkboxes

    return isModuleUnlocked(module.id, module.prerequisites || [], module.minAccuracy);
  });

  const lockedModules = THEORY_MODULES.filter(module => {
    // Filter by level first
    if (currentLevel === 'basic' && module.level !== 'basic') return false;
    if (currentLevel === 'intermediate' && module.level === 'advanced') return false;

    return !isModuleUnlocked(module.id, module.prerequisites || [], module.minAccuracy);
  });

  return (
    <PageLayout>
      <div className="flex-1 w-full p-4 lg:p-8 space-y-6 lg:space-y-8">

        {/* Navigation Breadcrumbs - Always visible */}
        <Breadcrumbs />

        {/* 
          MODULE SELECTION vs MODULE CONTENT 
          If selectedModule is null -> Show List
          If selectedModule is set -> Show Content
        */}

        {!selectedModule ? (
          /* --- MODULE LIST VIEW --- */
          <div className="space-y-6">
            <header>
              <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">Teoria Musical</h1>
              <p className="text-gray-400">Domine a linguagem da música e desbloqueie seu potencial</p>
            </header>

            {/* Introduction Card */}
            <div className="hidden lg:block bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-white/10 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <Book className="w-8 h-8 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white mb-2">Por que estudar teoria?</h2>
                  <p className="text-gray-300">
                    A teoria musical não é um conjunto de regras para te restringir, mas sim
                    ferramentas para te dar liberdade. Entender como a música funciona permite
                    que você aprenda mais rápido, tire músicas de ouvido com facilidade e
                    crie suas próprias composições.
                  </p>
                </div>
              </div>
            </div>

            {/* Level Selection Tabs */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex space-x-1 rounded-xl bg-white/5 p-1">
                {(['basic', 'intermediate', 'advanced'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setCurrentLevel(lvl)}
                    className={`
                          px-4 py-2 rounded-lg text-sm font-medium transition-all
                          ${currentLevel === lvl
                        ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }
                        `}
                  >
                    {lvl === 'basic' ? 'Básico' : lvl === 'intermediate' ? 'Intermediário' : 'Avançado'}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Activity className="w-4 h-4" />
                <span>{availableModules.length} módulos disponíveis</span>
              </div>
            </div>

            {/* Modules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableModules.map((module) => (
                <Card
                  key={module.id}
                  className="relative overflow-hidden bg-[#1a1a2e] border-white/10 hover:border-purple-500/50 hover:shadow-[0_0_20px_rgba(168,85,247,0.15)] transition-all cursor-pointer group"
                  onClick={() => setSelectedModule(module)}
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 text-white flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-300">
                        <module.icon className="w-6 h-6" />
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
                      {module.title}
                    </h3>
                    <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                      {module.description}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Activity className="w-3 h-3" />
                        <span>{module.difficulty === 'beginner' ? 'Iniciante' : module.difficulty === 'intermediate' ? 'Intermediário' : 'Avançado'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{module.duration}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/5">
                      {module.topics.slice(0, 3).map((topic) => (
                        <span
                          key={topic}
                          className="px-2 py-1 rounded bg-white/5 text-xs text-gray-400"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Locked Modules */}
            {lockedModules.length > 0 && (
              <div className="mt-12">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-gray-400" />
                  Módulos Bloqueados
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {lockedModules.map((module) => {
                    const missingReqs = getMissingRequirements
                      ? getMissingRequirements(module.id, module.prerequisites || [], module.minAccuracy)
                      : []; // Fallback if store doesn't have it yet, though it should

                    return (
                      <Card
                        key={module.id}
                        className="p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50 opacity-60 cursor-not-allowed"
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-3 rounded-lg bg-gray-700/50">
                            <module.icon className="w-6 h-6 text-gray-500" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-400">{module.title}</h3>
                            <p className="text-sm text-gray-500">{module.description}</p>
                          </div>
                        </div>
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                          <p className="text-xs text-red-400 flex items-center gap-2 mb-1">
                            <AlertCircle className="w-3 h-3" />
                            Pré-requisitos:
                          </p>
                          <ul className="text-xs text-gray-400 list-disc list-inside">
                            {missingReqs.length > 0 ? (
                              missingReqs.map((req, idx) => <li key={idx}>{req}</li>)
                            ) : (
                              <li>Completar módulos anteriores</li>
                            )}
                          </ul>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* --- MODULE DETAIL VIEW --- */
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            {/* Action Bar */}
            <div className="flex items-center gap-4">
              <Button
                onClick={() => setSelectedModule(null)}
                variant="outline"
                className="bg-transparent border-white/20 text-gray-300 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para Módulos
              </Button>
              <div className="h-6 w-px bg-white/10 hidden sm:block" />
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <selectedModule.icon className="w-5 h-5 text-purple-400" />
                {selectedModule.title}
              </h2>
            </div>

            {/* Main Content Card */}
            <Card className="p-6 lg:p-10 bg-[#1a1a2e] border-white/10 min-h-[600px]">
              {showQuiz && selectedModule.quiz ? (
                <TheoryQuiz
                  moduleId={selectedModule.id}
                  moduleTitle={selectedModule.title}
                  questions={selectedModule.quiz}
                  onComplete={() => {
                    setShowQuiz(false);
                    completeModule(selectedModule.id, 100);
                  }}
                />
              ) : (
                <div className="space-y-8">
                  {/* Dynamic Content Rendering */}
                  {typeof selectedModule.content === 'function'
                    ? selectedModule.content(currentLevel)
                    : selectedModule.content
                  }

                  {/* Practical Application Section */}
                  {selectedModule.practicalApplication && (
                    <div className="mt-8 p-6 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30">
                      <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                        <Play className="w-6 h-6 text-green-400" />
                        Na Prática
                      </h3>
                      <p className="text-gray-300 mb-4">
                        Agora que você entendeu a teoria, veja como aplicar no violão:
                      </p>
                      {typeof selectedModule.practicalApplication === 'function'
                        ? selectedModule.practicalApplication(currentLevel)
                        : selectedModule.practicalApplication}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row gap-4 justify-end">
                    {selectedModule.quiz && (
                      <Button
                        onClick={() => setShowQuiz(true)}
                        className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white min-w-[200px]"
                        size="lg"
                      >
                        <CheckCircle2 className="w-5 h-5 mr-2" />
                        Fazer Quiz
                      </Button>
                    )}

                    {/* Dynamic Practice Button */}
                    {(() => {
                      const practiceRoutes: Record<string, { path: string; label: string }> = {
                        'fundamentals': { path: '/practice', label: 'Treino de Ritmo' },
                        'fretboard-notes': { path: '/scales', label: 'Treino de Escalas' },
                        'chord-formation': { path: '/chords', label: 'Treino de Acordes' },
                        'straight-swing': { path: '/practice', label: 'Treino de Ritmo' },
                        'scales': { path: '/scales', label: 'Treino de Escalas' },
                        'intervals': { path: '/practice', label: 'Treino de Ouvido' },
                        'progressions': { path: '/songs', label: 'Tocar Músicas' },
                        'circle-of-fifths': { path: '/songs', label: 'Explorar Músicas' },
                      };

                      const practice = practiceRoutes[selectedModule.id];

                      return practice ? (
                        <Link href={practice.path}>
                          <Button
                            onClick={() => {
                              completeModule(selectedModule.id, 100);
                            }}
                            className="w-full sm:w-auto bg-gradient-to-r from-[#10b981] to-[#059669] hover:from-[#059669] hover:to-[#047857] text-white py-6 text-lg min-w-[200px]"
                          >
                            <Play className="w-5 h-5 mr-2" />
                            Ir para {practice.label}
                          </Button>
                        </Link>
                      ) : (
                        <Button
                          onClick={() => {
                            completeModule(selectedModule.id, 100);
                          }}
                          className="w-full sm:w-auto bg-gradient-to-r from-[#10b981] to-[#059669] hover:from-[#059669] hover:to-[#047857] text-white py-6 text-lg min-w-[200px]"
                        >
                          <CheckCircle2 className="w-5 h-5 mr-2" />
                          Marcar como Completo
                        </Button>
                      );
                    })()}
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}

      </div>
    </PageLayout>
  );
}
