import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileHeader } from '@/components/layout/MobileHeader';
import { MobileSidebar } from '@/components/layout/MobileSidebar';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { GuitarTuner } from '@/components/tuner/GuitarTuner';
import { VocalRangeAnalyzer } from '@/components/tuner/VocalRangeAnalyzer';
import { useGamificationStore } from '@/stores/useGamificationStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Guitar, Mic2 } from 'lucide-react';

export default function Tuner() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
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
          <div className="max-w-5xl mx-auto p-8 space-y-8">
            {/* Header */}
            <header>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-[#06b6d4] to-[#0891b2] rounded-xl flex items-center justify-center">
                  <Guitar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white">Afinador</h1>
                  <p className="text-gray-400">Afine seu violão e descubra sua extensão vocal</p>
                </div>
              </div>
            </header>
            
            {/* Tabs */}
            <Tabs defaultValue="guitar" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-white/5 p-1 rounded-xl">
                <TabsTrigger 
                  value="guitar" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#06b6d4] data-[state=active]:to-[#0891b2] data-[state=active]:text-white rounded-lg transition-all"
                >
                  <Guitar className="w-4 h-4 mr-2" />
                  Afinador de Violão
                </TabsTrigger>
                <TabsTrigger 
                  value="vocal"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white rounded-lg transition-all"
                >
                  <Mic2 className="w-4 h-4 mr-2" />
                  Extensão Vocal
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="guitar" className="mt-6">
                <GuitarTuner />
              </TabsContent>
              
              <TabsContent value="vocal" className="mt-6">
                <VocalRangeAnalyzer />
              </TabsContent>
            </Tabs>

            {/* Tips */}
            <div className="rounded-2xl p-6 bg-[#1a1a2e]/60 backdrop-blur-xl border border-white/10">
              <h3 className="text-lg font-bold text-white mb-3">💡 Dicas</h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-1">•</span>
                  <span><strong>Afinador de Violão:</strong> Toque uma corda por vez e ajuste até o indicador ficar verde</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-1">•</span>
                  <span><strong>Controle de Oitavas:</strong> Use os botões + e - para ajustar a oitava de referência</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span><strong>Extensão Vocal:</strong> Cante sua nota mais grave primeiro, depois a mais aguda</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span><strong>Recomendações:</strong> Após o teste, você receberá sugestões de músicas compatíveis com sua voz</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-400 mt-1">•</span>
                  <span><strong>Ambiente:</strong> Use em local silencioso para melhor precisão</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE VERSION */}
      <div className="lg:hidden flex flex-col h-screen bg-[#0f0f1a] text-white">
        <MobileHeader 
          userName={userName}
          onMenuClick={() => setIsMobileSidebarOpen(true)}
        />
        
        <div className="flex-1 overflow-y-auto pb-20 px-4 pt-4">
          {/* Header */}
          <header className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-[#06b6d4] to-[#0891b2] rounded-xl flex items-center justify-center">
                <Guitar className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Afinador</h1>
                <p className="text-sm text-gray-400">Violão e voz</p>
              </div>
            </div>
          </header>

          {/* Tabs */}
          <Tabs defaultValue="guitar" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-white/5 p-1 rounded-xl mb-4">
              <TabsTrigger 
                value="guitar" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#06b6d4] data-[state=active]:to-[#0891b2] data-[state=active]:text-white rounded-lg transition-all text-xs"
              >
                <Guitar className="w-3 h-3 mr-1" />
                Violão
              </TabsTrigger>
              <TabsTrigger 
                value="vocal"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white rounded-lg transition-all text-xs"
              >
                <Mic2 className="w-3 h-3 mr-1" />
                Voz
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="guitar">
              <GuitarTuner />
            </TabsContent>
            
            <TabsContent value="vocal">
              <VocalRangeAnalyzer />
            </TabsContent>
          </Tabs>

          {/* Tips */}
          <div className="mt-6 rounded-2xl p-4 bg-[#1a1a2e]/60 backdrop-blur-xl border border-white/10">
            <h3 className="text-sm font-bold text-white mb-2">💡 Dicas</h3>
            <ul className="space-y-2 text-gray-300 text-xs">
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 mt-0.5">•</span>
                <span>Toque uma corda por vez para afinar</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-0.5">•</span>
                <span>Teste sua extensão vocal cantando grave e agudo</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-400 mt-0.5">•</span>
                <span>Use em local silencioso</span>
              </li>
            </ul>
          </div>
        </div>

        <MobileBottomNav />
        
        <MobileSidebar
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
          userName={userName}
          userLevel={level}
          currentXP={xp}
          xpToNextLevel={xpToNextLevel}
          streak={currentStreak}
        />
      </div>
    </>
  );
}
