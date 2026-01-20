import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileHeader } from '@/components/layout/MobileHeader';
import { MobileSidebar } from '@/components/layout/MobileSidebar';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { useGamificationStore } from '@/stores/useGamificationStore';
import { useUserStore } from '@/stores/useUserStore';
import { Trophy, Lock } from 'lucide-react';

export default function Achievements() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  const { xp, level, xpToNextLevel, currentStreak, achievements } = useGamificationStore();
  const { user } = useUserStore();
  
  const userName = user?.name || "Usuário";
  
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  
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
              <h1 className="text-4xl font-bold text-white mb-2">Conquistas</h1>
              <p className="text-gray-400">Desbloqueadas: {unlockedCount}/{achievements.length}</p>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`
                    relative overflow-hidden rounded-3xl p-6 backdrop-blur-xl border transition-all
                    ${achievement.unlocked
                      ? 'bg-gradient-to-br from-[#fbbf24]/20 to-transparent border-[#fbbf24]/40'
                      : 'bg-[#1a1a2e]/60 border-white/10 opacity-60'
                    }
                  `}
                >
                  <div className="text-center">
                    <div className={`
                      w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl
                      ${achievement.unlocked
                        ? 'bg-gradient-to-br from-[#fbbf24] to-[#f59e0b] shadow-[0_0_30px_rgba(251,191,36,0.5)]'
                        : 'bg-[#2a2a3e]'
                      }
                    `}>
                      {achievement.unlocked ? achievement.icon : <Lock className="w-8 h-8 text-gray-500" />}
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-2">{achievement.title}</h3>
                    <p className="text-sm text-gray-400 mb-3">{achievement.description}</p>
                    
                    <div className="flex items-center justify-center gap-1 px-3 py-1 rounded-lg bg-[#a855f7]/30 border border-[#a855f7]/40 inline-flex">
                      <Trophy className="w-4 h-4 text-[#a855f7]" />
                      <span className="text-sm font-bold text-white">+{achievement.xpReward} XP</span>
                    </div>
                    
                    {achievement.unlocked && achievement.unlockedAt && (
                      <div className="mt-3 text-xs text-gray-500">
                        Desbloqueada em {new Date(achievement.unlockedAt).toLocaleDateString('pt-BR')}
                      </div>
                    )}
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
            <h1 className="text-2xl font-bold text-white mb-1">Conquistas</h1>
            <p className="text-sm text-gray-400">{unlockedCount}/{achievements.length} desbloqueadas</p>
          </header>
          
          <div className="grid grid-cols-1 gap-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`
                  relative overflow-hidden rounded-2xl p-5 backdrop-blur-xl border
                  ${achievement.unlocked
                    ? 'bg-gradient-to-br from-[#fbbf24]/20 to-transparent border-[#fbbf24]/40'
                    : 'bg-[#1a1a2e]/60 border-white/10 opacity-60'
                  }
                `}
              >
                <div className="flex items-start gap-4">
                  <div className={`
                    w-16 h-16 rounded-full flex items-center justify-center text-3xl flex-shrink-0
                    ${achievement.unlocked
                      ? 'bg-gradient-to-br from-[#fbbf24] to-[#f59e0b] shadow-[0_0_20px_rgba(251,191,36,0.5)]'
                      : 'bg-[#2a2a3e]'
                    }
                  `}>
                    {achievement.unlocked ? achievement.icon : <Lock className="w-6 h-6 text-gray-500" />}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-bold text-white mb-1">{achievement.title}</h3>
                    <p className="text-sm text-gray-400 mb-2">{achievement.description}</p>
                    
                    <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#a855f7]/30 border border-[#a855f7]/40 inline-flex">
                      <Trophy className="w-3 h-3 text-[#a855f7]" />
                      <span className="text-xs font-bold text-white">+{achievement.xpReward} XP</span>
                    </div>
                  </div>
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
