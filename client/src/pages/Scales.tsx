import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileHeader } from '@/components/layout/MobileHeader';
import { MobileSidebar } from '@/components/layout/MobileSidebar';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { Button } from '@/components/ui/button';
import { useGamificationStore } from '@/stores/useGamificationStore';
import { Music2, Play } from 'lucide-react';

export default function Scales() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  const { xp, level, xpToNextLevel, currentStreak } = useGamificationStore();
  
  const userName = "João";
  
  const scales = [
    { id: 1, name: 'Pentatônica Menor', difficulty: 'Iniciante', color: 'from-[#06b6d4] to-[#0891b2]' },
    { id: 2, name: 'Pentatônica Maior', difficulty: 'Iniciante', color: 'from-[#10b981] to-[#059669]' },
    { id: 3, name: 'Escala Maior', difficulty: 'Intermediário', color: 'from-[#f97316] to-[#ea580c]' },
    { id: 4, name: 'Escala Menor Natural', difficulty: 'Intermediário', color: 'from-[#ec4899] to-[#db2777]' },
    { id: 5, name: 'Blues', difficulty: 'Intermediário', color: 'from-[#a855f7] to-[#8b5cf6]' },
    { id: 6, name: 'Dórico', difficulty: 'Avançado', color: 'from-[#06b6d4] to-[#0891b2]' },
  ];
  
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
            <header>
              <h1 className="text-4xl font-bold text-white mb-2">Biblioteca de Escalas</h1>
              <p className="text-gray-400">Aprenda e pratique escalas musicais</p>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {scales.map((scale) => (
                <div
                  key={scale.id}
                  className="relative overflow-hidden rounded-3xl p-6 backdrop-blur-xl bg-[#1a1a2e]/60 border border-white/10 hover:border-white/20 transition-all group cursor-pointer"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${scale.color} opacity-10 group-hover:opacity-20 transition-opacity`}></div>
                  
                  <div className="relative z-10">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${scale.color} flex items-center justify-center mb-4`}>
                      <Music2 className="w-7 h-7 text-white" />
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-2">{scale.name}</h3>
                    <p className="text-sm text-gray-400 mb-4">{scale.difficulty}</p>
                    
                    <Button className={`w-full bg-gradient-to-r ${scale.color} text-white font-semibold`}>
                      <Play className="w-4 h-4 mr-2" />
                      Praticar
                    </Button>
                  </div>
                </div>
              ))}
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
        
        <main className="px-5 py-5 space-y-6 pb-24">
          <header>
            <h1 className="text-2xl font-bold text-white mb-1">Escalas</h1>
            <p className="text-sm text-gray-400">Biblioteca completa</p>
          </header>
          
          <div className="grid grid-cols-1 gap-4">
            {scales.map((scale) => (
              <div
                key={scale.id}
                className="relative overflow-hidden rounded-2xl p-5 backdrop-blur-xl bg-[#1a1a2e]/60 border border-white/10"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${scale.color} opacity-10`}></div>
                
                <div className="relative z-10 flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${scale.color} flex items-center justify-center flex-shrink-0`}>
                    <Music2 className="w-6 h-6 text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-bold text-white">{scale.name}</h3>
                    <p className="text-sm text-gray-400">{scale.difficulty}</p>
                  </div>
                  
                  <Button size="sm" className={`bg-gradient-to-r ${scale.color} text-white`}>
                    <Play className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </main>
        
        <MobileBottomNav />
      </div>
    </>
  );
}
