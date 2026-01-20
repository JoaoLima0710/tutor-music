import { useState } from 'react';
import { useLocation } from 'wouter';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileHeader } from '@/components/layout/MobileHeader';
import { MobileSidebar } from '@/components/layout/MobileSidebar';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useGamificationStore } from '@/stores/useGamificationStore';
import { useUserStore } from '@/stores/useUserStore';
import { Target, Trophy, Clock, CheckCircle2, Lock, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface Mission {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'special';
  xpReward: number;
  progress: number;
  target: number;
  completed: boolean;
  locked: boolean;
  icon: string;
}

export default function Missions() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [, setLocation] = useLocation();
  
  const { xp, level, xpToNextLevel, currentStreak, addXP } = useGamificationStore();
  const { user } = useUserStore();
  const userName = user?.name || "Usuário";
  
  const [missions, setMissions] = useState<Mission[]>([
    {
      id: 'daily-1',
      title: 'Prática Diária',
      description: 'Complete 30 minutos de prática hoje',
      type: 'daily',
      xpReward: 50,
      progress: 15,
      target: 30,
      completed: false,
      locked: false,
      icon: '🎯'
    },
    {
      id: 'daily-2',
      title: 'Dominar 3 Acordes',
      description: 'Pratique 3 acordes diferentes com 80% de acurácia',
      type: 'daily',
      xpReward: 80,
      progress: 1,
      target: 3,
      completed: false,
      locked: false,
      icon: '🎸'
    },
    {
      id: 'daily-3',
      title: 'Tocar uma Música',
      description: 'Complete uma música inteira do início ao fim',
      type: 'daily',
      xpReward: 100,
      progress: 0,
      target: 1,
      completed: false,
      locked: false,
      icon: '🎵'
    },
    {
      id: 'weekly-1',
      title: 'Sequência de 7 Dias',
      description: 'Pratique todos os dias da semana',
      type: 'weekly',
      xpReward: 500,
      progress: currentStreak,
      target: 7,
      completed: false,
      locked: false,
      icon: '🔥'
    },
    {
      id: 'weekly-2',
      title: 'Mestre das Escalas',
      description: 'Complete 5 escalas diferentes',
      type: 'weekly',
      xpReward: 300,
      progress: 2,
      target: 5,
      completed: false,
      locked: false,
      icon: '🎼'
    },
    {
      id: 'weekly-3',
      title: 'Repertório Brasileiro',
      description: 'Aprenda 3 músicas brasileiras',
      type: 'weekly',
      xpReward: 400,
      progress: 0,
      target: 3,
      completed: false,
      locked: false,
      icon: '🇧🇷'
    },
    {
      id: 'special-1',
      title: 'Desafio do Metrônomo',
      description: 'Pratique 1 hora com o metrônomo',
      type: 'special',
      xpReward: 1000,
      progress: 0,
      target: 60,
      completed: false,
      locked: true,
      icon: '⏱️'
    },
    {
      id: 'special-2',
      title: 'Afinação Perfeita',
      description: 'Toque 10 notas com menos de 5 cents de desvio',
      type: 'special',
      xpReward: 800,
      progress: 0,
      target: 10,
      completed: false,
      locked: true,
      icon: '🎯'
    }
  ]);
  
  const handleClaimReward = (mission: Mission) => {
    if (mission.progress >= mission.target && !mission.completed) {
      addXP(mission.xpReward);
      setMissions(prev => prev.map(m => 
        m.id === mission.id ? { ...m, completed: true } : m
      ));
      toast.success(`+${mission.xpReward} XP! Missão concluída!`, {
        description: mission.title,
      });
    }
  };
  
  const dailyMissions = missions.filter(m => m.type === 'daily');
  const weeklyMissions = missions.filter(m => m.type === 'weekly');
  const specialMissions = missions.filter(m => m.type === 'special');
  
  const getMissionTypeColor = (type: Mission['type']) => {
    switch (type) {
      case 'daily': return 'from-[#06b6d4] to-[#0891b2]';
      case 'weekly': return 'from-[#a855f7] to-[#8b5cf6]';
      case 'special': return 'from-[#f97316] to-[#ea580c]';
    }
  };
  
  const MissionCard = ({ mission }: { mission: Mission }) => {
    const progressPercent = (mission.progress / mission.target) * 100;
    const isComplete = mission.progress >= mission.target;
    
    return (
      <motion.div
        className={`
          rounded-3xl p-6 border
          ${mission.locked 
            ? 'bg-white/5 border-white/10 opacity-50' 
            : mission.completed
            ? 'bg-gradient-to-br from-[#10b981]/20 to-[#059669]/20 border-[#10b981]/50'
            : 'bg-[#1a1a2e]/60 backdrop-blur-xl border-white/10 hover:border-white/20'
          }
          transition-all duration-300
        `}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: mission.locked ? 1 : 1.02 }}
      >
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={`
            w-16 h-16 rounded-2xl flex items-center justify-center text-3xl
            ${mission.locked 
              ? 'bg-white/5' 
              : `bg-gradient-to-br ${getMissionTypeColor(mission.type)}`
            }
          `}>
            {mission.locked ? <Lock className="w-8 h-8 text-gray-500" /> : mission.icon}
          </div>
          
          {/* Content */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">{mission.title}</h3>
                <p className="text-sm text-gray-400">{mission.description}</p>
              </div>
              
              {mission.completed && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#10b981]/20 border border-[#10b981]/50">
                  <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
                  <span className="text-sm font-semibold text-[#10b981]">Concluída</span>
                </div>
              )}
            </div>
            
            {/* Progress */}
            {!mission.locked && !mission.completed && (
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-400">Progresso</span>
                  <span className="font-bold text-white">
                    {mission.progress}/{mission.target}
                  </span>
                </div>
                <Progress value={progressPercent} className="h-2" />
              </div>
            )}
            
            {/* Reward & Action */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-[#f59e0b]" />
                <span className="font-bold text-[#f59e0b]">+{mission.xpReward} XP</span>
              </div>
              
              {!mission.locked && !mission.completed && isComplete && (
                <Button
                  onClick={() => handleClaimReward(mission)}
                  size="sm"
                  className="bg-gradient-to-r from-[#10b981] to-[#059669] hover:from-[#34d399] hover:to-[#10b981] text-white font-bold"
                >
                  Resgatar
                </Button>
              )}
              
              {mission.locked && (
                <span className="text-sm text-gray-500">
                  Desbloqueie no nível {level + 5}
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };
  
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
        
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-8 space-y-8">
            {/* Header */}
            <header className="mb-8">
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <Target className="w-10 h-10 text-[#a855f7]" />
                Missões
              </h1>
              <p className="text-gray-400">Complete missões para ganhar XP e desbloquear conquistas</p>
            </header>
            
            {/* Daily Missions */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-6 h-6 text-[#06b6d4]" />
                <h2 className="text-2xl font-bold text-white">Missões Diárias</h2>
                <span className="px-3 py-1 rounded-full bg-[#06b6d4]/20 text-[#06b6d4] text-sm font-semibold">
                  Renovam em 12h
                </span>
              </div>
              <div className="grid gap-4">
                {dailyMissions.map(mission => (
                  <MissionCard key={mission.id} mission={mission} />
                ))}
              </div>
            </div>
            
            {/* Weekly Missions */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Zap className="w-6 h-6 text-[#a855f7]" />
                <h2 className="text-2xl font-bold text-white">Missões Semanais</h2>
                <span className="px-3 py-1 rounded-full bg-[#a855f7]/20 text-[#a855f7] text-sm font-semibold">
                  Renovam em 5 dias
                </span>
              </div>
              <div className="grid gap-4">
                {weeklyMissions.map(mission => (
                  <MissionCard key={mission.id} mission={mission} />
                ))}
              </div>
            </div>
            
            {/* Special Missions */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Trophy className="w-6 h-6 text-[#f97316]" />
                <h2 className="text-2xl font-bold text-white">Missões Especiais</h2>
                <span className="px-3 py-1 rounded-full bg-[#f97316]/20 text-[#f97316] text-sm font-semibold">
                  Desafios Avançados
                </span>
              </div>
              <div className="grid gap-4">
                {specialMissions.map(mission => (
                  <MissionCard key={mission.id} mission={mission} />
                ))}
              </div>
            </div>
          </div>
        </main>
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
        
        <main className="px-4 py-4 pb-24 space-y-6">
          {/* Header */}
          <header>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
              <Target className="w-8 h-8 text-[#a855f7]" />
              Missões
            </h1>
            <p className="text-gray-400 text-sm">Complete para ganhar XP</p>
          </header>
          
          {/* Daily Missions */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-[#06b6d4]" />
              <h2 className="text-xl font-bold text-white">Diárias</h2>
            </div>
            <div className="space-y-3">
              {dailyMissions.map(mission => (
                <MissionCard key={mission.id} mission={mission} />
              ))}
            </div>
          </div>
          
          {/* Weekly Missions */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5 text-[#a855f7]" />
              <h2 className="text-xl font-bold text-white">Semanais</h2>
            </div>
            <div className="space-y-3">
              {weeklyMissions.map(mission => (
                <MissionCard key={mission.id} mission={mission} />
              ))}
            </div>
          </div>
          
          {/* Special Missions */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-5 h-5 text-[#f97316]" />
              <h2 className="text-xl font-bold text-white">Especiais</h2>
            </div>
            <div className="space-y-3">
              {specialMissions.map(mission => (
                <MissionCard key={mission.id} mission={mission} />
              ))}
            </div>
          </div>
        </main>
        
        <MobileBottomNav />
      </div>
    </>
  );
}
