import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Bell, ChevronRight, Sparkles, Play } from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileHeader } from '@/components/layout/MobileHeader';
import { MobileSidebar } from '@/components/layout/MobileSidebar';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { SimplifiedNav } from '@/components/layout/SimplifiedNav';
import { DailyGoalCard } from '@/components/gamification/DailyGoalCard';
import { DailyObjectivesCard } from '@/components/gamification/DailyObjectivesCard';
import { WeeklyChallengeCard } from '@/components/gamification/WeeklyChallengeCard';
import { ChallengeCard } from '@/components/gamification/ChallengeCard';
import { ContinueLearning } from '@/components/gamification/ContinueLearning';
import { AIAssistantCard } from '@/components/ai/AIAssistantCard';
import { DailyTraining, WelcomeTraining } from '@/components/training';
import { ProgressCard } from '@/components/progression/ProgressCard';
import { SongCard } from '@/components/songs/SongCard';
import { Button } from '@/components/ui/button';
import { ThemeCustomizer } from '@/components/ui/ThemeCustomizer';
import { PWAInstallButton } from '@/components/PWAInstallButton';
import { useGamificationStore } from '@/stores/useGamificationStore';
import { useSongUnlockStore, checkAndUnlockSongs } from '@/stores/useSongUnlockStore';
import { useUserStore } from '@/stores/useUserStore';
import { CompleteOnboarding, useCompleteOnboarding } from '@/components/onboarding';
import { AudioQuickToggle } from '@/components/audio/AudioQuickToggle';
import { notificationService } from '@/services/NotificationService';

export default function Home() {
  const { showOnboarding, completeOnboarding, skipOnboarding } = useCompleteOnboarding();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showThemeCustomizer, setShowThemeCustomizer] = useState(false);
  const [, setLocation] = useLocation();
  
  const { xp, level, xpToNextLevel, currentStreak } = useGamificationStore();
  const { getUnlockedSongs, getNextUnlockableSongs } = useSongUnlockStore();
  const { user } = useUserStore();
  
  const userName = user?.name || "Usuário";

  // Verificar notificações ao montar e periodicamente
  useEffect(() => {
    // Verificar imediatamente
    notificationService.checkAndShowNotifications();

    // Verificar a cada 5 minutos
    const interval = setInterval(() => {
      notificationService.checkAndShowNotifications();
    }, 300000); // 5 minutos

    return () => clearInterval(interval);
  }, []);
  
  // Check and unlock songs when component mounts or progress changes
  useEffect(() => {
    checkAndUnlockSongs();
  }, [level, xp]);
  
  const unlockedSongs = getUnlockedSongs();
  const nextUnlockable = getNextUnlockableSongs();
  
  // Saudação baseada na hora do dia
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  return (
    <>
      {showOnboarding && (
        <CompleteOnboarding
          onComplete={completeOnboarding}
          onSkip={skipOnboarding}
        />
      )}
      <WelcomeTraining />
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
          <div className="max-w-5xl mx-auto p-8 space-y-6">
            {/* Header */}
            <header className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">
                  {getGreeting()}, {userName}
                </h1>
                <p className="text-gray-400 text-sm">
                  {unlockedSongs.length} músicas • Nível {level}
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <AudioQuickToggle variant="icon" />
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative p-2.5 rounded-xl bg-[#1a1a2e]/60 border border-white/10 hover:border-[#a855f7]/40 transition-all"
                >
                  <Bell className="w-5 h-5 text-white" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#a855f7] rounded-full"></span>
                </Button>
              </div>
            </header>
            
            {/* Objetivos Diários */}
            <section>
              <DailyObjectivesCard />
            </section>
            
            {/* Desafio Semanal */}
            <section>
              <WeeklyChallengeCard />
            </section>
            
            {/* Seu Progresso */}
            <section>
              <ProgressCard />
            </section>
            
            {/* Meta do Dia - Compacta */}
            <section>
              <DailyGoalCard compact />
            </section>
            
            {/* Treino do Dia - Principal */}
            <section>
              <DailyTraining />
            </section>
            
            {/* Continue Aprendendo */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Continue Aprendendo</h2>
                <button 
                  onClick={() => setLocation('/training')}
                  className="text-sm text-purple-400 font-medium hover:text-purple-300 flex items-center gap-1"
                >
                  Ver tudo <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <ContinueLearning maxItems={3} />
            </section>
            
            {/* Assistente IA - Card Resumido */}
            <section>
              <AIAssistantCard />
            </section>
            
            {/* Próximas Músicas */}
            {nextUnlockable.length > 0 && (
              <section>
                <div className="p-5 rounded-2xl bg-gradient-to-br from-[#8b5cf6]/20 to-transparent border border-[#8b5cf6]/30">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-400" />
                      <h2 className="text-lg font-bold text-white">Prontas para Desbloquear</h2>
                    </div>
                    <Button
                      onClick={() => setLocation('/songs')}
                      size="sm"
                      variant="ghost"
                      className="text-purple-400 hover:text-purple-300"
                    >
                      Ver todas <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    {nextUnlockable.slice(0, 3).map((song) => (
                      <div
                        key={song.id}
                        onClick={() => setLocation(`/songs/${song.id}`)}
                        className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer transition-all"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-white text-sm truncate">{song.title}</h3>
                          <Play className="w-4 h-4 text-purple-400 flex-shrink-0" />
                        </div>
                        <p className="text-xs text-gray-400 truncate">{song.artist}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}
            
            {/* Músicas Desbloqueadas */}
            {unlockedSongs.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">Suas Músicas</h2>
                  <button 
                    onClick={() => setLocation('/songs')}
                    className="text-sm text-cyan-400 font-medium hover:text-cyan-300 flex items-center gap-1"
                  >
                    Ver todas <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  {unlockedSongs.slice(0, 3).map((song) => (
                    <SongCard
                      key={song.id}
                      song={song}
                      onClick={() => setLocation(`/songs/${song.id}`)}
                    />
                  ))}
                </div>
              </section>
            )}
            
            <div className="h-4"></div>
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
          onThemeClick={() => setShowThemeCustomizer(true)}
        />

        {/* PWA Install Banner */}
        <div className="px-4 py-2 bg-purple-500/10 border-b border-purple-400/20">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">Instale o app</span>
            <PWAInstallButton />
          </div>
        </div>

        <main className="px-4 py-4 pb-24 space-y-4">
          {/* Objetivos Diários */}
          <section>
            <DailyObjectivesCard />
          </section>
          
          {/* Desafio Semanal */}
          <section>
            <WeeklyChallengeCard />
          </section>
          
          {/* Seu Progresso */}
          <section>
            <ProgressCard />
          </section>
          
          {/* Meta do Dia - Compacta */}
          <section>
            <DailyGoalCard compact />
          </section>
          
          {/* Treino do Dia */}
          <section>
            <DailyTraining />
          </section>
          
          {/* Continue Aprendendo */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-white">Continue Aprendendo</h2>
              <button 
                onClick={() => setLocation('/training')}
                className="text-xs text-purple-400 font-medium"
              >
                Ver tudo
              </button>
            </div>
            <ContinueLearning maxItems={2} />
          </section>
          
          {/* Assistente IA */}
          <section>
            <AIAssistantCard />
          </section>
          
          {/* Próximas Músicas */}
          {nextUnlockable.length > 0 && (
            <section>
              <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <h2 className="text-base font-bold text-white">Prontas para Tocar</h2>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {nextUnlockable.slice(0, 2).map((song) => (
                    <div
                      key={song.id}
                      onClick={() => setLocation(`/songs/${song.id}`)}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/5 cursor-pointer"
                    >
                      <div className="min-w-0">
                        <h3 className="font-semibold text-white text-sm truncate">{song.title}</h3>
                        <p className="text-xs text-gray-400 truncate">{song.artist}</p>
                      </div>
                      <Play className="w-5 h-5 text-purple-400 flex-shrink-0 ml-2" />
                    </div>
                  ))}
                </div>
                
                <Button
                  onClick={() => setLocation('/songs')}
                  className="mt-3 w-full bg-purple-500 hover:bg-purple-600 text-white text-sm h-9"
                >
                  Ver Todas as Músicas
                </Button>
              </div>
            </section>
          )}
          
          {/* Músicas Desbloqueadas */}
          {unlockedSongs.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-white">Suas Músicas</h2>
                <button 
                  onClick={() => setLocation('/songs')}
                  className="text-xs text-cyan-400 font-medium"
                >
                  Ver todas
                </button>
              </div>
              
              <div className="space-y-2">
                {unlockedSongs.slice(0, 2).map((song) => (
                  <SongCard
                    key={song.id}
                    song={song}
                    onClick={() => setLocation(`/songs/${song.id}`)}
                  />
                ))}
              </div>
            </section>
          )}
        </main>
        
        {level <= 3 ? (
          <SimplifiedNav
            userName={userName}
            userLevel={level}
            currentXP={xp}
            xpToNextLevel={xpToNextLevel}
            streak={currentStreak}
          />
        ) : (
          <MobileBottomNav />
        )}
      </div>

      {/* Theme Customizer */}
      <ThemeCustomizer
        isOpen={showThemeCustomizer}
        onClose={() => setShowThemeCustomizer(false)}
      />
    </>
  );
}
