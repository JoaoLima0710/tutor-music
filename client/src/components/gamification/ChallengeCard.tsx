import { Trophy, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChallengeCardProps {
  title: string;
  description: string;
  xp: number;
}

export function ChallengeCard({ title, description, xp }: ChallengeCardProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl p-6 backdrop-blur-xl bg-gradient-to-br from-[#a855f7]/20 via-[#8b5cf6]/10 to-transparent border border-[#a855f7]/40 shadow-[0_0_35px_rgba(168,85,247,0.2)]">
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-[#a855f7] via-[#c084fc] to-[#a855f7] opacity-10 blur-3xl"></div>
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="inline-block px-3 py-1 rounded-lg bg-[#a855f7]/30 border border-[#a855f7]/50 mb-3">
              <span className="text-xs uppercase tracking-wider text-[#c084fc] font-bold">Desafio de Hoje</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            <p className="text-sm text-gray-300">{description}</p>
          </div>
          
          <div className="flex items-center gap-1 px-3 py-2 rounded-xl bg-gradient-to-br from-[#fbbf24]/30 to-transparent border border-[#fbbf24]/40">
            <Trophy className="w-5 h-5 text-[#fbbf24]" />
            <span className="text-lg font-bold text-white">+{xp}</span>
          </div>
        </div>
        
        <Button className="w-full bg-gradient-to-r from-[#a855f7] to-[#8b5cf6] hover:from-[#c084fc] hover:to-[#a855f7] text-white font-semibold shadow-[0_0_25px_rgba(168,85,247,0.4)] transition-all">
          <span>Aceitar Desafio</span>
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
