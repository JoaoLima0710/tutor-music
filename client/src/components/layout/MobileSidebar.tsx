import { X, Home, Guitar, Music2, Trophy, Target, User, Flame, Music, Clock, Mic2, BookOpen, Settings, RefreshCw, Download } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { usePWA } from '@/hooks/usePWA';
import { useState } from 'react';
import { toast } from 'sonner';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  userLevel: number;
  currentXP: number;
  xpToNextLevel: number;
  streak: number;
}

export function MobileSidebar({
  isOpen,
  onClose,
  userName,
  userLevel,
  currentXP,
  xpToNextLevel,
  streak
}: MobileSidebarProps) {
  const [location] = useLocation();
  const { updateAvailable, checkForUpdates, registration } = usePWA();
  const [isChecking, setIsChecking] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const navItems = [
    { path: '/', label: 'Início', icon: Home },
    { path: '/chords', label: 'Acordes', icon: Guitar },
    { path: '/scales', label: 'Escalas', icon: Music2 },
    { path: '/songs', label: 'Músicas', icon: Music },
    { path: '/tuner', label: 'Afinador', icon: Mic2 },
    { path: '/practice', label: 'Prática', icon: Clock },
    { path: '/theory', label: 'Teoria Musical', icon: BookOpen },
    { path: '/missions', label: 'Missões', icon: Target },
    { path: '/achievements', label: 'Conquistas', icon: Trophy },
    { path: '/profile', label: 'Perfil', icon: User },
    { path: '/settings', label: 'Configurações', icon: Settings },
  ];
  
  const xpPercentage = (currentXP / xpToNextLevel) * 100;

  const handleCheckForUpdates = async () => {
    setIsChecking(true);
    try {
      await checkForUpdates();
      
      // Aguardar um pouco para o service worker verificar atualizações
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Verificar novamente se há atualização disponível
      // O estado updateAvailable será atualizado pelo hook usePWA
      if (registration?.waiting) {
        toast.success('Atualização encontrada!', {
          description: 'Clique em "Atualizar Agora" para aplicar',
          duration: 5000,
        });
      } else {
        toast.info('Você está usando a versão mais recente', {
          description: 'Não há atualizações disponíveis no momento',
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Erro ao verificar atualizações:', error);
      toast.error('Erro ao verificar atualizações', {
        description: 'Tente novamente mais tarde',
      });
    } finally {
      setIsChecking(false);
    }
  };

  const handleForceUpdate = async () => {
    setIsUpdating(true);
    
    try {
      // Enviar mensagem para o service worker para ativar a nova versão
      if (registration?.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        toast.info('Atualizando aplicativo...', {
          description: 'Aguarde um momento',
        });
        
        // Aguardar um pouco para o service worker processar
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Recarregar a página para aplicar a atualização
        window.location.reload();
      } else {
        // Se não há service worker waiting, forçar recarregamento
        toast.info('Recarregando aplicativo...', {
          description: 'Isso pode buscar atualizações',
        });
        
        // Limpar cache e recarregar
        if ('caches' in window) {
          const cacheNames = await caches.keys();
          await Promise.all(
            cacheNames.map(cacheName => caches.delete(cacheName))
          );
        }
        
        await new Promise(resolve => setTimeout(resolve, 500));
        window.location.reload();
      }
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      toast.error('Erro ao atualizar', {
        description: 'Tente recarregar a página manualmente',
      });
      setIsUpdating(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-80 bg-[#0f0f1a] border-r border-white/10 z-50 lg:hidden overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#a855f7] to-[#8b5cf6] flex items-center justify-center">
              <Guitar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">MusicTutor</h1>
              <p className="text-xs text-gray-400">Aprenda Violão</p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/10"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>
        
        {/* User Info */}
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#06b6d4] to-[#0891b2] flex items-center justify-center">
              <span className="text-lg font-bold text-white">{userName.charAt(0)}</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white">{userName}</h3>
              <p className="text-sm text-gray-400">Nível {userLevel}</p>
            </div>
          </div>
          
          {/* XP Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">XP</span>
              <span className="text-white font-semibold">{currentXP}/{xpToNextLevel}</span>
            </div>
            <Progress value={xpPercentage} className="h-2" />
          </div>
          
          {/* Streak */}
          <div className="mt-4 flex items-center gap-2 p-3 rounded-xl bg-gradient-to-br from-[#f97316]/20 to-transparent border border-[#f97316]/30">
            <Flame className="w-5 h-5 text-[#f97316]" />
            <div className="flex-1">
              <p className="text-xs text-gray-400">Streak</p>
              <p className="text-sm font-bold text-white">{streak} dias</p>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            
            return (
              <Link key={item.path} href={item.path}>
                <div
                  onClick={onClose}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer
                    ${isActive 
                      ? 'bg-gradient-to-r from-[#a855f7] to-[#8b5cf6] text-white shadow-[0_0_20px_rgba(168,85,247,0.3)]' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>
        
        {/* Botão de Atualização - Fixo no final, sempre visível */}
        <div className="p-4 pt-2 border-t border-white/10 bg-[#0f0f1a]">
          {/* Botão Verificar Atualizações - Sempre visível */}
          <div
            onClick={handleCheckForUpdates}
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer text-gray-400 hover:text-white hover:bg-white/5 active:scale-95"
          >
            <RefreshCw className={`w-5 h-5 ${isChecking ? 'animate-spin' : ''}`} />
            <span className="font-medium">
              {isChecking ? 'Verificando...' : 'Verificar Atualizações'}
            </span>
          </div>
          
          {/* Botão Atualizar Agora - Aparece quando há atualização */}
          {(updateAvailable || registration?.waiting) && (
            <div
              onClick={handleForceUpdate}
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer bg-gradient-to-r from-[#10b981] to-[#059669] text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] mt-2 active:scale-95"
            >
              <Download className={`w-5 h-5 ${isUpdating ? 'animate-pulse' : ''}`} />
              <span className="font-medium">
                {isUpdating ? 'Atualizando...' : 'Atualizar Agora'}
              </span>
            </div>
          )}
          
          {/* Botão Forçar Recarregamento - Sempre disponível */}
          <div
            onClick={handleForceUpdate}
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer text-gray-400 hover:text-white hover:bg-white/5 mt-2 active:scale-95"
          >
            <RefreshCw className="w-5 h-5" />
            <span className="font-medium text-sm">Forçar Recarregamento</span>
          </div>
        </div>
      </aside>
    </>
  );
}
