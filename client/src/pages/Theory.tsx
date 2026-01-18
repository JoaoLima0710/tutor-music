import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileHeader } from '@/components/layout/MobileHeader';
import { MobileSidebar } from '@/components/layout/MobileSidebar';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGamificationStore } from '@/stores/useGamificationStore';
import { Book, Music, Activity, Target, Waves, TrendingUp, Play, CheckCircle2 } from 'lucide-react';

interface TheoryModule {
  id: string;
  title: string;
  icon: any;
  description: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  topics: string[];
  content: React.ReactNode;
}

const THEORY_MODULES: TheoryModule[] = [
  {
    id: 'fundamentals',
    title: 'Fundamentos da Música',
    icon: Book,
    description: 'Entenda os 3 elementos essenciais: Ritmo, Melodia e Harmonia',
    duration: '10 min',
    difficulty: 'beginner',
    topics: ['Ritmo', 'Melodia', 'Harmonia', 'Função dos elementos'],
    content: (
      <div className="space-y-6">
        <div className="p-6 rounded-xl bg-gradient-to-br from-[#1a1a2e] to-[#16213e] border border-white/10">
          <h3 className="text-2xl font-bold text-white mb-4">Os 3 Elementos da Música</h3>
          <p className="text-gray-300 mb-6">
            Toda música é composta por três elementos fundamentais que trabalham juntos para criar a experiência musical completa.
          </p>

          <div className="space-y-4">
            <div className="p-5 rounded-lg bg-gradient-to-r from-[#06b6d4]/20 to-transparent border-l-4 border-[#06b6d4]">
              <div className="flex items-center gap-3 mb-3">
                <Activity className="w-6 h-6 text-[#06b6d4]" />
                <h4 className="text-xl font-bold text-white">1. Ritmo</h4>
              </div>
              <p className="text-gray-300 mb-3">
                O <span className="text-[#06b6d4] font-semibold">ritmo</span> é a pulsação da música - o que faz você bater o pé ou balançar a cabeça. 
                É o elemento temporal que organiza os sons no tempo.
              </p>
              <div className="p-3 rounded bg-[#06b6d4]/10">
                <p className="text-sm text-gray-300">
                  <span className="font-semibold text-[#06b6d4]">💡 Exemplo:</span> Bateria, percussão, palmas - instrumentos que marcam o tempo.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-lg bg-gradient-to-r from-[#8b5cf6]/20 to-transparent border-l-4 border-[#8b5cf6]">
              <div className="flex items-center gap-3 mb-3">
                <Music className="w-6 h-6 text-[#8b5cf6]" />
                <h4 className="text-xl font-bold text-white">2. Melodia</h4>
              </div>
              <p className="text-gray-300 mb-3">
                A <span className="text-[#8b5cf6] font-semibold">melodia</span> é a "história" da música - o que você canta ou assobia. 
                É uma sequência de notas que geralmente toca uma de cada vez.
              </p>
              <div className="p-3 rounded bg-[#8b5cf6]/10">
                <p className="text-sm text-gray-300">
                  <span className="font-semibold text-[#8b5cf6]">💡 Exemplo:</span> A voz do cantor, um solo de guitarra, a linha principal de uma música.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-lg bg-gradient-to-r from-[#10b981]/20 to-transparent border-l-4 border-[#10b981]">
              <div className="flex items-center gap-3 mb-3">
                <Target className="w-6 h-6 text-[#10b981]" />
                <h4 className="text-xl font-bold text-white">3. Harmonia</h4>
              </div>
              <p className="text-gray-300 mb-3">
                A <span className="text-[#10b981] font-semibold">harmonia</span> é a "base" da música - os acordes que dão suporte à melodia. 
                São várias notas tocadas ao mesmo tempo que criam o "clima" da música.
              </p>
              <div className="p-3 rounded bg-[#10b981]/10">
                <p className="text-sm text-gray-300">
                  <span className="font-semibold text-[#10b981]">💡 Exemplo:</span> Acordes do violão, base do piano, progressões harmônicas.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-5 rounded-lg bg-[#f59e0b]/10 border border-[#f59e0b]/30">
            <h4 className="text-lg font-bold text-white mb-3">🎯 Ordem de Percepção de Erros</h4>
            <p className="text-gray-300 mb-3">
              Nosso cérebro detecta erros musicais nesta ordem de prioridade:
            </p>
            <div className="flex items-center gap-3">
              <div className="flex-1 p-3 rounded bg-[#ef4444]/20 border border-[#ef4444]/50">
                <p className="text-sm font-bold text-white">1º Ritmo</p>
                <p className="text-xs text-gray-400">Mais perceptível</p>
              </div>
              <span className="text-gray-500">→</span>
              <div className="flex-1 p-3 rounded bg-[#f97316]/20 border border-[#f97316]/50">
                <p className="text-sm font-bold text-white">2º Melodia</p>
                <p className="text-xs text-gray-400">Intermediário</p>
              </div>
              <span className="text-gray-500">→</span>
              <div className="flex-1 p-3 rounded bg-[#eab308]/20 border border-[#eab308]/50">
                <p className="text-sm font-bold text-white">3º Harmonia</p>
                <p className="text-xs text-gray-400">Menos perceptível</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  
  {
    id: 'straight-swing',
    title: 'Straight vs Swing',
    icon: Waves,
    description: 'Aprenda a diferenciar os dois principais tipos de pulsação musical',
    duration: '15 min',
    difficulty: 'beginner',
    topics: ['Straight', 'Swing', 'Identificação', 'Exemplos práticos'],
    content: (
      <div className="space-y-6">
        <div className="p-6 rounded-xl bg-gradient-to-br from-[#1a1a2e] to-[#16213e] border border-white/10">
          <h3 className="text-2xl font-bold text-white mb-4">Straight vs Swing</h3>
          
          <div className="space-y-4">
            <div className="p-5 rounded-lg bg-gradient-to-r from-[#06b6d4]/20 to-transparent border-l-4 border-[#06b6d4]">
              <h4 className="text-xl font-bold text-white mb-3">📏 Straight (Reto)</h4>
              <p className="text-gray-300 mb-3">
                Pulsação <span className="text-[#06b6d4] font-semibold">matemática e simétrica</span>. 
                Os pulsos e subdivisões são perfeitamente regulares, como um relógio.
              </p>
              <div className="p-3 rounded bg-[#06b6d4]/10 mb-3">
                <p className="text-sm text-gray-300">
                  <span className="font-semibold text-[#06b6d4]">Como identificar:</span> Imagine tocando um chocalho na música. 
                  Se sua mão se move em intervalos perfeitamente regulares → <span className="font-bold">STRAIGHT</span>
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full bg-[#06b6d4]/20 text-[#06b6d4] text-sm">Samba</span>
                <span className="px-3 py-1 rounded-full bg-[#06b6d4]/20 text-[#06b6d4] text-sm">Rock</span>
                <span className="px-3 py-1 rounded-full bg-[#06b6d4]/20 text-[#06b6d4] text-sm">Pop</span>
                <span className="px-3 py-1 rounded-full bg-[#06b6d4]/20 text-[#06b6d4] text-sm">Funk</span>
              </div>
            </div>

            <div className="p-5 rounded-lg bg-gradient-to-r from-[#8b5cf6]/20 to-transparent border-l-4 border-[#8b5cf6]">
              <h4 className="text-xl font-bold text-white mb-3">🎵 Swing</h4>
              <p className="text-gray-300 mb-3">
                Pulsação <span className="text-[#8b5cf6] font-semibold">orgânica e assimétrica</span>. 
                Tem um "balanço" natural, como se estivesse "atrasando" levemente alguns pulsos.
              </p>
              <div className="p-3 rounded bg-[#8b5cf6]/10 mb-3">
                <p className="text-sm text-gray-300">
                  <span className="font-semibold text-[#8b5cf6]">Como identificar:</span> Se sua mão se move como "de 2 em 2" 
                  com um balanço natural → <span className="font-bold">SWING</span>
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full bg-[#8b5cf6]/20 text-[#8b5cf6] text-sm">Jazz</span>
                <span className="px-3 py-1 rounded-full bg-[#8b5cf6]/20 text-[#8b5cf6] text-sm">Blues</span>
                <span className="px-3 py-1 rounded-full bg-[#8b5cf6]/20 text-[#8b5cf6] text-sm">Bossa Nova (algumas)</span>
              </div>
            </div>
          </div>

          <div className="mt-6 p-5 rounded-lg bg-[#f59e0b]/10 border border-[#f59e0b]/30">
            <h4 className="text-lg font-bold text-white mb-3">💡 Curiosidade</h4>
            <p className="text-gray-300">
              Algumas músicas <span className="font-semibold">mudam de feeling</span> durante a execução! 
              Podem começar em Straight e depois ir para Swing, ou vice-versa.
            </p>
          </div>
        </div>
      </div>
    ),
  },
];

export default function Theory() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<TheoryModule | null>(null);
  const { xp, level, xpToNextLevel, currentStreak } = useGamificationStore();
  
  const userName = "João";

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
          <div className="max-w-7xl mx-auto p-8 space-y-8">
            {/* Header */}
            <header>
              <h1 className="text-4xl font-bold text-white mb-2">📚 Teoria Musical</h1>
              <p className="text-gray-400">Aprenda os fundamentos da música de forma prática e visual</p>
            </header>

            {selectedModule ? (
              <div className="space-y-6">
                <Button
                  onClick={() => setSelectedModule(null)}
                  variant="outline"
                  className="bg-transparent border-white/20 text-gray-300 hover:bg-white/5"
                >
                  ← Voltar aos Módulos
                </Button>

                <Card className="p-8 bg-gradient-to-br from-[#1a1a2e] to-[#16213e] border-white/10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#a855f7]">
                      <selectedModule.icon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-white">{selectedModule.title}</h2>
                      <p className="text-gray-400">{selectedModule.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 mb-8 pb-6 border-b border-white/10">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Activity className="w-4 h-4" />
                      <span>{selectedModule.duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        selectedModule.difficulty === 'beginner' ? 'bg-[#10b981]/20 text-[#10b981]' :
                        selectedModule.difficulty === 'intermediate' ? 'bg-[#f59e0b]/20 text-[#f59e0b]' :
                        'bg-[#ef4444]/20 text-[#ef4444]'
                      }`}>
                        {selectedModule.difficulty === 'beginner' ? 'Iniciante' :
                         selectedModule.difficulty === 'intermediate' ? 'Intermediário' : 'Avançado'}
                      </span>
                    </div>
                  </div>

                  {selectedModule.content}
                </Card>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {THEORY_MODULES.map((module) => (
                  <Card
                    key={module.id}
                    className="p-6 bg-gradient-to-br from-[#1a1a2e] to-[#16213e] border-white/10 hover:border-[#8b5cf6]/50 transition-all cursor-pointer group"
                    onClick={() => setSelectedModule(module)}
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="p-3 rounded-lg bg-gradient-to-br from-[#8b5cf6] to-[#a855f7] group-hover:scale-110 transition-transform">
                        <module.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-2">{module.title}</h3>
                        <p className="text-sm text-gray-400 mb-3">{module.description}</p>
                        
                        <div className="flex items-center gap-4 mb-3">
                          <span className="text-xs text-gray-500">{module.duration}</span>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            module.difficulty === 'beginner' ? 'bg-[#10b981]/20 text-[#10b981]' :
                            module.difficulty === 'intermediate' ? 'bg-[#f59e0b]/20 text-[#f59e0b]' :
                            'bg-[#ef4444]/20 text-[#ef4444]'
                          }`}>
                            {module.difficulty === 'beginner' ? 'Iniciante' :
                             module.difficulty === 'intermediate' ? 'Intermediário' : 'Avançado'}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {module.topics.map((topic) => (
                            <span
                              key={topic}
                              className="px-2 py-1 rounded bg-white/5 text-xs text-gray-400"
                            >
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <Button
                      className="w-full bg-gradient-to-r from-[#8b5cf6] to-[#a855f7] hover:from-[#7c3aed] hover:to-[#9333ea] text-white"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Começar Módulo
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MOBILE VERSION */}
      <div className="lg:hidden min-h-screen bg-[#0f0f1a] text-white pb-20">
        <MobileSidebar 
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
          userName={userName}
          userLevel={level}
          currentXP={xp}
          xpToNextLevel={xpToNextLevel}
          streak={currentStreak}
        />
        
        <MobileHeader 
          userName={userName}
          onMenuClick={() => setIsMobileSidebarOpen(true)}
        />

        <div className="p-4 space-y-6">
          {selectedModule ? (
            <div className="space-y-4">
              <Button
                onClick={() => setSelectedModule(null)}
                variant="outline"
                className="bg-transparent border-white/20 text-gray-300"
              >
                ← Voltar
              </Button>

              <Card className="p-6 bg-gradient-to-br from-[#1a1a2e] to-[#16213e] border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-[#8b5cf6] to-[#a855f7]">
                    <selectedModule.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{selectedModule.title}</h2>
                  </div>
                </div>

                {selectedModule.content}
              </Card>
            </div>
          ) : (
            <div className="space-y-4">
              {THEORY_MODULES.map((module) => (
                <Card
                  key={module.id}
                  className="p-4 bg-gradient-to-br from-[#1a1a2e] to-[#16213e] border-white/10"
                  onClick={() => setSelectedModule(module)}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-[#8b5cf6] to-[#a855f7]">
                      <module.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-1">{module.title}</h3>
                      <p className="text-sm text-gray-400 mb-2">{module.description}</p>
                      
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs text-gray-500">{module.duration}</span>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          module.difficulty === 'beginner' ? 'bg-[#10b981]/20 text-[#10b981]' :
                          module.difficulty === 'intermediate' ? 'bg-[#f59e0b]/20 text-[#f59e0b]' :
                          'bg-[#ef4444]/20 text-[#ef4444]'
                        }`}>
                          {module.difficulty === 'beginner' ? 'Iniciante' :
                           module.difficulty === 'intermediate' ? 'Intermediário' : 'Avançado'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    className="w-full bg-gradient-to-r from-[#8b5cf6] to-[#a855f7] text-white text-sm"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Começar
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </div>

        <MobileBottomNav />
      </div>
    </>
  );
}
