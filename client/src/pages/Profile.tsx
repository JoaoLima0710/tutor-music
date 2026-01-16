import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileHeader } from '@/components/layout/MobileHeader';
import { MobileSidebar } from '@/components/layout/MobileSidebar';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { useGamificationStore } from '@/stores/useGamificationStore';
import { useChordStore } from '@/stores/useChordStore';
import { Trophy, Target, Flame, Guitar, Music2, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function Profile() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  const { xp, level, xpToNextLevel, currentStreak, maxStreak, achievements } = useGamificationStore();
  const { getPracticedCount } = useChordStore();
  
  const userName = "João";
  const xpPercentage = (xp / xpToNextLevel) * 100;
  const unlockedAchievements = achievements.filter(a => a.unlocked).length;
  const practicedChords = getPracticedCount();
  
  const stats = [
    { icon: Trophy, label: 'Conquistas', value: `${unlockedAchievements}/${achievements.length}`, color: 'from-[#fbbf24] to-[#f59e0b]' },
    { icon: Guitar, label: 'Acordes Praticados', value: practicedChords, color: 'from-[#06b6d4] to-[#0891b2]' },
    { icon: Music2, label: 'Escalas Praticadas', value: 0, color: 'from-[#f97316] to-[#ea580c]' },
    { icon: Flame, label: 'Streak Máximo', value: `${maxStreak} dias`, color: 'from-[#ec4899] to-[#db2777]' },
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
          <div className="max-w-5xl mx-auto p-8 space-y-8">
            <header>
              <h1 className="text-4xl font-bold text-white mb-2">Meu Perfil</h1>
              <p className="text-gray-400">Acompanhe seu progresso e estatísticas</p>
            </header>
            
            {/* Profile Card */}
            <div className="relative overflow-hidden rounded-3xl p-8 backdrop-blur-xl bg-gradient-to-br from-[#a855f7]/20 via-[#8b5cf6]/10 to-transparent border border-[#a855f7]/40 shadow-[0_0_35px_rgba(168,85,247,0.2)]">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-[#a855f7] via-[#c084fc] to-[#a855f7] opacity-10 blur-3xl"></div>
              
              <div className="relative z-10 flex items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#06b6d4] to-[#0891b2] flex items-center justify-center text-4xl font-bold shadow-lg">
                  {userName.charAt(0)}
                </div>
                
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-white mb-2">{userName}</h2>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-br from-[#a855f7]/30 to-transparent border border-[#a855f7]/40">
                      <TrendingUp className="w-5 h-5 text-[#c084fc]" />
                      <span className="font-bold text-white">Nível {level}</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-br from-[#f97316]/30 to-transparent border border-[#f97316]/40">
                      <Flame className="w-5 h-5 text-[#fb923c]" />
                      <span className="font-bold text-white">{currentStreak} dias</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-300">Progresso para Nível {level + 1}</span>
                      <span className="text-[#c084fc] font-bold">{xp}/{xpToNextLevel} XP</span>
                    </div>
                    <Progress value={xpPercentage} className="h-3 bg-white/10" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                
                return (
                  <div
                    key={index}
                    className="relative overflow-hidden rounded-2xl p-6 backdrop-blur-xl bg-[#1a1a2e]/60 border border-white/10"
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    
                    <p className="text-sm text-gray-400 mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                  </div>
                );
              })}
            </div>
            
            {/* Recent Activity */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Atividade Recente</h2>
              <div className="rounded-3xl p-6 backdrop-blur-xl bg-[#1a1a2e]/60 border border-white/10">
                <p className="text-gray-400 text-center py-8">Nenhuma atividade recente</p>
              </div>
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
          {/* Profile Card */}
          <div className="relative overflow-hidden rounded-3xl p-6 backdrop-blur-xl bg-gradient-to-br from-[#a855f7]/20 via-[#8b5cf6]/10 to-transparent border border-[#a855f7]/40">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#06b6d4] to-[#0891b2] flex items-center justify-center text-3xl font-bold mb-4">
                {userName.charAt(0)}
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-2">{userName}</h2>
              
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1 px-3 py-1 rounded-lg bg-[#a855f7]/30 border border-[#a855f7]/40">
                  <TrendingUp className="w-4 h-4 text-[#c084fc]" />
                  <span className="text-sm font-bold text-white">Nível {level}</span>
                </div>
                <div className="flex items-center gap-1 px-3 py-1 rounded-lg bg-[#f97316]/30 border border-[#f97316]/40">
                  <Flame className="w-4 h-4 text-[#fb923c]" />
                  <span className="text-sm font-bold text-white">{currentStreak} dias</span>
                </div>
              </div>
              
              <div className="w-full space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-300">Nível {level + 1}</span>
                  <span className="text-[#c084fc] font-bold">{xp}/{xpToNextLevel}</span>
                </div>
                <Progress value={xpPercentage} className="h-2 bg-white/10" />
              </div>
            </div>
          </div>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              
              return (
                <div
                  key={index}
                  className="relative overflow-hidden rounded-2xl p-4 backdrop-blur-xl bg-[#1a1a2e]/60 border border-white/10"
                >
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  
                  <p className="text-xs text-gray-400 mb-1">{stat.label}</p>
                  <p className="text-lg font-bold text-white">{stat.value}</p>
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
