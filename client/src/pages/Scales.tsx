import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { ScaleClock } from '@/components/scales/ScaleClock';
import { MobileHeader } from '@/components/layout/MobileHeader';
import { MobileSidebar } from '@/components/layout/MobileSidebar';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { Button } from '@/components/ui/button';
import { useGamificationStore } from '@/stores/useGamificationStore';

export default function Scales() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  const { xp, level, xpToNextLevel, currentStreak } = useGamificationStore();
  
  const userName = "João";
  
  const scalesData = [
    {
      name: 'Escala Maior',
      intervals: [0, 2, 4, 5, 7, 9, 11, 12],
      description: 'A escala mais comum na música ocidental, com som alegre e brilhante',
    },
    {
      name: 'Escala Menor Natural',
      intervals: [0, 2, 3, 5, 7, 8, 10, 12],
      description: 'Escala menor com som melancólico e expressivo',
    },
    {
      name: 'Pentatônica Menor',
      intervals: [0, 3, 5, 7, 10, 12],
      description: 'Escala de 5 notas, muito usada em blues e rock',
    },
    {
      name: 'Pentatônica Maior',
      intervals: [0, 2, 4, 7, 9, 12],
      description: 'Versão maior da pentatônica, som alegre e versátil',
    },
    {
      name: 'Blues',
      intervals: [0, 3, 5, 6, 7, 10, 12],
      description: 'Escala blues com blue note característica',
    },
    {
      name: 'Dórico',
      intervals: [0, 2, 3, 5, 7, 9, 10, 12],
      description: 'Modo grego com som jazzy e sofisticado',
    },
  ];
  
  const [selectedScale, setSelectedScale] = useState(scalesData[0]);
  
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
          <div className="max-w-6xl mx-auto p-8 space-y-8">
            <header>
              <h1 className="text-4xl font-bold text-white mb-2">Escalas Musicais</h1>
              <p className="text-gray-400">Visualize e aprenda escalas com o ScaleClock interativo</p>
            </header>
            
            {/* Scale Selector */}
            <div className="flex flex-wrap gap-3">
              {scalesData.map((scale) => (
                <Button
                  key={scale.name}
                  onClick={() => setSelectedScale(scale)}
                  variant={selectedScale.name === scale.name ? 'default' : 'outline'}
                  className={
                    selectedScale.name === scale.name
                      ? 'bg-gradient-to-r from-[#a855f7] to-[#8b5cf6] text-white'
                      : 'bg-transparent border-white/20 text-gray-300 hover:bg-white/5'
                  }
                >
                  {scale.name}
                </Button>
              ))}
            </div>
            
            {/* Scale Description */}
            <div className="rounded-2xl p-6 bg-[#1a1a2e]/60 backdrop-blur-xl border border-white/10">
              <p className="text-gray-300 text-center text-lg">{selectedScale.description}</p>
            </div>
            
            {/* ScaleClock */}
            <div className="rounded-3xl p-10 bg-gradient-to-br from-[#1a1a2e] to-[#16162a] border border-white/10">
              <ScaleClock
                scaleName={selectedScale.name}
                intervals={selectedScale.intervals}
                root="C"
                size={500}
              />
            </div>
            
            {/* Instructions */}
            <div className="rounded-2xl p-6 bg-[#1a1a2e]/60 backdrop-blur-xl border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4">💡 Como Usar o ScaleClock</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-[#06b6d4] to-[#0891b2] flex items-center justify-center text-white text-sm font-bold">
                    1
                  </span>
                  <span>
                    <strong className="text-white">Arraste para girar:</strong> Clique e arraste o relógio para mudar a nota fundamental da escala.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-[#06b6d4] to-[#0891b2] flex items-center justify-center text-white text-sm font-bold">
                    2
                  </span>
                  <span>
                    <strong className="text-white">Cores dos intervalos:</strong> Cada cor representa um intervalo diferente na escala (tônica, 2ª, 3ª, etc).
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-[#06b6d4] to-[#0891b2] flex items-center justify-center text-white text-sm font-bold">
                    3
                  </span>
                  <span>
                    <strong className="text-white">Passe o mouse:</strong> Passe o mouse sobre as notas para ver o nome do intervalo.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-[#06b6d4] to-[#0891b2] flex items-center justify-center text-white text-sm font-bold">
                    4
                  </span>
                  <span>
                    <strong className="text-white">Linhas conectoras:</strong> As linhas mostram a sequência das notas na escala.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      {/* MOBILE VERSION */}
      <div className="lg:hidden min-h-screen bg-[#0f0f1a] text-white">
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
        
        <main className="px-5 py-5 space-y-5 pb-24">
          <header>
            <h1 className="text-2xl font-bold text-white mb-1">Escalas</h1>
            <p className="text-sm text-gray-400">ScaleClock interativo</p>
          </header>
          
          {/* Scale Selector */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {scalesData.map((scale) => (
              <Button
                key={scale.name}
                size="sm"
                onClick={() => setSelectedScale(scale)}
                variant={selectedScale.name === scale.name ? 'default' : 'outline'}
                className={
                  selectedScale.name === scale.name
                    ? 'bg-gradient-to-r from-[#a855f7] to-[#8b5cf6] text-white whitespace-nowrap'
                    : 'bg-transparent border-white/20 text-gray-300 whitespace-nowrap'
                }
              >
                {scale.name}
              </Button>
            ))}
          </div>
          
          {/* Description */}
          <div className="rounded-2xl p-4 bg-[#1a1a2e]/60 backdrop-blur-xl border border-white/10">
            <p className="text-gray-300 text-sm text-center">{selectedScale.description}</p>
          </div>
          
          {/* ScaleClock */}
          <div className="rounded-2xl p-5 bg-gradient-to-br from-[#1a1a2e] to-[#16162a] border border-white/10">
            <ScaleClock
              scaleName={selectedScale.name}
              intervals={selectedScale.intervals}
              root="C"
              size={320}
            />
          </div>
          
          {/* Instructions */}
          <div className="rounded-2xl p-5 bg-[#1a1a2e]/60 backdrop-blur-xl border border-white/10">
            <h3 className="text-base font-bold text-white mb-3">💡 Como Usar</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• Arraste para mudar a fundamental</li>
              <li>• Cores = intervalos diferentes</li>
              <li>• Toque nas notas para ver intervalos</li>
              <li>• Linhas mostram a sequência</li>
            </ul>
          </div>
        </main>
        
        <MobileBottomNav />
      </div>
    </>
  );
}
