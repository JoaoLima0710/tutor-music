import { Target, Flame } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

interface DailyGoalCardProps {
  current: number;
  total: number;
  streak: number;
}

export function DailyGoalCard({ current, total, streak }: DailyGoalCardProps) {
  const percentage = (current / total) * 100;
  
  return (
    <div className="relative overflow-hidden rounded-3xl p-6 backdrop-blur-xl bg-gradient-to-br from-[#8b5cf6]/30 via-[#a855f7]/20 to-transparent border border-[#8b5cf6]/40 shadow-[0_0_35px_rgba(139,92,246,0.3)]">
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-[#8b5cf6] via-[#a855f7] to-[#8b5cf6] opacity-10 blur-3xl"></div>
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-6 h-6 text-[#c084fc]" />
              <h3 className="text-xl font-bold text-white">🎯 Foco de Hoje</h3>
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
        
        {/* Barra de Progresso Mais Grossa */}
        <div className="space-y-3">
          <Progress value={percentage} className="h-4 bg-white/10" />
          <div className="flex items-center justify-between">
            <Button className="bg-gradient-to-r from-[#8b5cf6] to-[#a855f7] text-white font-semibold hover:shadow-lg transition-all">
              Continuar Treino
            </Button>
            <span className="text-sm text-gray-400">
              {total - current} min restantes
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
