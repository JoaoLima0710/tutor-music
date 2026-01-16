import { Target, Flame } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface DailyGoalCardProps {
  current: number;
  total: number;
  streak: number;
}

export function DailyGoalCard({ current, total, streak }: DailyGoalCardProps) {
  const percentage = (current / total) * 100;
  
  return (
    <div className="relative overflow-hidden rounded-3xl p-6 backdrop-blur-xl bg-gradient-to-br from-[#06b6d4]/20 via-[#0891b2]/10 to-transparent border border-[#06b6d4]/40 shadow-[0_0_35px_rgba(6,182,212,0.2)]">
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-[#06b6d4] via-[#22d3ee] to-[#06b6d4] opacity-10 blur-3xl"></div>
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-[#22d3ee]" />
              <h3 className="text-lg font-bold text-white">Meta Diária</h3>
            </div>
            <p className="text-sm text-gray-300">Complete {total} minutos de prática hoje</p>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-br from-[#f97316]/30 to-transparent border border-[#f97316]/40">
            <Flame className="w-5 h-5 text-[#fb923c]" />
            <div>
              <p className="text-xs text-gray-300">Streak</p>
              <p className="text-lg font-bold text-white">{streak}</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-300">{current} de {total} minutos</span>
            <span className="text-[#22d3ee] font-bold">{Math.round(percentage)}%</span>
          </div>
          <Progress value={percentage} className="h-3 bg-white/10" />
        </div>
      </div>
    </div>
  );
}
