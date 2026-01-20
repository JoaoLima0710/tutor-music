import { Target, Flame, Clock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useProgressionStore } from '@/stores/useProgressionStore';
import { useGamificationStore } from '@/stores/useGamificationStore';
import { useLocation } from 'wouter';

interface DailyGoalCardProps {
  compact?: boolean;
}

export function DailyGoalCard({ compact = false }: DailyGoalCardProps) {
  const [, setLocation] = useLocation();
  const { dailyGoalMinutes, totalPracticeMinutes, getDailyRoutine } = useProgressionStore();
  const { currentStreak } = useGamificationStore();
  
  // Calcular minutos praticados hoje (simplificado - usar data real depois)
  const todayMinutes = Math.min(totalPracticeMinutes % dailyGoalMinutes, dailyGoalMinutes);
  const routine = getDailyRoutine();
  
  const current = todayMinutes;
  const total = routine.totalMinutes;
  const streak = currentStreak;
  const percentage = total > 0 ? (current / total) * 100 : 0;
  
  // Modo compacto para não poluir a tela
  if (compact) {
    return (
      <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-[#8b5cf6]/20 to-[#a855f7]/10 border border-[#8b5cf6]/30">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 rounded-xl bg-[#8b5cf6]/30 flex items-center justify-center">
            <Target className="w-5 h-5 text-[#c084fc]" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-white">{current}/{total} min</span>
              <span className="text-xs text-gray-400">{Math.round(percentage)}%</span>
            </div>
            <Progress value={percentage} className="h-2 bg-white/10" />
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#f97316]/20 border border-[#f97316]/30">
          <Flame className="w-4 h-4 text-[#fb923c]" />
          <span className="text-sm font-bold text-white">{streak}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-3xl p-6 backdrop-blur-xl bg-gradient-to-br from-[#8b5cf6]/30 via-[#a855f7]/20 to-transparent border border-[#8b5cf6]/40 shadow-[0_0_35px_rgba(139,92,246,0.3)]">
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-[#8b5cf6] via-[#a855f7] to-[#8b5cf6] opacity-10 blur-3xl"></div>
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-6 h-6 text-[#c084fc]" />
              <h3 className="text-xl font-bold text-white">Meta de Hoje</h3>
            </div>
            <p className="text-base text-gray-200 font-medium">
              {current} min de {total} min • {Math.round(percentage)}% completo
            </p>
          </div>
          
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-br from-[#f97316]/30 to-transparent border border-[#f97316]/40">
            <Flame className="w-5 h-5 text-[#fb923c]" />
            <div>
              <p className="text-xs text-gray-300">Streak</p>
              <p className="text-lg font-bold text-white">{streak} dias</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <Progress value={percentage} className="h-4 bg-white/10" />
          <div className="flex items-center justify-between">
            <Button 
              onClick={() => setLocation('/practice')}
              className="bg-gradient-to-r from-[#8b5cf6] to-[#a855f7] text-white font-semibold hover:shadow-lg transition-all"
            >
              <Clock className="w-4 h-4 mr-2" />
              {current > 0 ? 'Continuar Treino' : 'Iniciar Treino'}
            </Button>
            <span className="text-sm text-gray-400">
              {Math.max(0, total - current)} min restantes
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
