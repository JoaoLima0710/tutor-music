import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileHeader } from '@/components/layout/MobileHeader';
import { MobileSidebar } from '@/components/layout/MobileSidebar';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { useGamificationStore } from '@/stores/useGamificationStore';
import { Target, Trophy } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function Missions() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  const { xp, level, xpToNextLevel, currentStreak, dailyMissions } = useGamificationStore();
  
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
            <header>
              <h1 className="text-4xl font-bold text-white mb-2">Missões Diárias</h1>
              <p className="text-gray-400">Complete missões para ganhar XP e recompensas</p>
            </header>
            
            <div className="space-y-4">
              {dailyMissions.map((mission) => {
                const percentage = (mission.current / mission.target) * 100;
                
                return (
                  <div
                    key={mission.id}
                    className={`
                      relative overflow-hidden rounded-3xl p-6 backdrop-blur-xl border transition-all
                      ${mission.completed
                        ? 'bg-gradient-to-br from-green-500/20 to-transparent border-green-500/40'
                        : 'bg-[#1a1a2e]/60 border-white/10'
                      }
                    `}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`
                        w-14 h-14 rounded-2xl flex items-center justify-center
                        ${mission.completed
                          ? 'bg-gradient-to-br from-green-500 to-green-600'
                          : 'bg-gradient-to-br from-[#a855f7] to-[#8b5cf6]'
                        }
                      `}>
                        {mission.completed ? (
                          <Trophy className="w-7 h-7 text-white" />
                        ) : (
                          <Target className="w-7 h-7 text-white" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-xl font-bold text-white">{mission.title}</h3>
                            <p className="text-sm text-gray-400">{mission.description}</p>
                          </div>
                          <div className="flex items-center gap-1 px-3 py-1 rounded-lg bg-[#fbbf24]/30 border border-[#fbbf24]/40">
                            <Trophy className="w-4 h-4 text-[#fbbf24]" />
                            <span className="text-sm font-bold text-white">+{mission.xpReward}</span>
                          </div>
                        </div>
                        
                        {!mission.completed && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-300">Progresso</span>
                              <span className="text-[#a855f7] font-bold">{mission.current}/{mission.target}</span>
                            </div>
                            <Progress value={percentage} className="h-2 bg-white/10" />
                          </div>
                        )}
                        
                        {mission.completed && (
                          <div className="text-green-400 font-semibold">✓ Missão Completa!</div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
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
            <h1 className="text-2xl font-bold text-white mb-1">Missões Diárias</h1>
            <p className="text-sm text-gray-400">Complete e ganhe XP</p>
          </header>
          
          <div className="space-y-4">
            {dailyMissions.map((mission) => {
              const percentage = (mission.current / mission.target) * 100;
              
              return (
                <div
                  key={mission.id}
                  className={`
                    relative overflow-hidden rounded-2xl p-5 backdrop-blur-xl border
                    ${mission.completed
                      ? 'bg-gradient-to-br from-green-500/20 to-transparent border-green-500/40'
                      : 'bg-[#1a1a2e]/60 border-white/10'
                    }
                  `}
                >
                  <div className="flex items-start gap-3">
                    <div className={`
                      w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
                      ${mission.completed
                        ? 'bg-gradient-to-br from-green-500 to-green-600'
                        : 'bg-gradient-to-br from-[#a855f7] to-[#8b5cf6]'
                      }
                    `}>
                      {mission.completed ? (
                        <Trophy className="w-6 h-6 text-white" />
                      ) : (
                        <Target className="w-6 h-6 text-white" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-bold text-white">{mission.title}</h3>
                          <p className="text-xs text-gray-400">{mission.description}</p>
                        </div>
                        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#fbbf24]/30 border border-[#fbbf24]/40">
                          <Trophy className="w-3 h-3 text-[#fbbf24]" />
                          <span className="text-xs font-bold text-white">+{mission.xpReward}</span>
                        </div>
                      </div>
                      
                      {!mission.completed && (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-300">Progresso</span>
                            <span className="text-[#a855f7] font-bold">{mission.current}/{mission.target}</span>
                          </div>
                          <Progress value={percentage} className="h-1.5 bg-white/10" />
                        </div>
                      )}
                      
                      {mission.completed && (
                        <div className="text-sm text-green-400 font-semibold">✓ Completa!</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
        
        <MobileBottomNav />
      </div>
    </>
  );
}
