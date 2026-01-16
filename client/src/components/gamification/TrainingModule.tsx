import { LucideIcon, ChevronRight } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

interface TrainingModuleProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  duration: string;
  progress: number;
  total: number;
  color: 'cyan' | 'orange' | 'pink' | 'green';
}

const colorMap = {
  cyan: {
    bg: 'from-[#06b6d4]/20 via-[#0891b2]/10',
    border: 'border-[#06b6d4]/40',
    shadow: 'shadow-[0_0_30px_rgba(6,182,212,0.2)]',
    iconBg: 'bg-gradient-to-br from-[#06b6d4] to-[#0891b2]',
    text: 'text-[#22d3ee]',
    button: 'from-[#06b6d4] to-[#0891b2] hover:from-[#22d3ee] hover:to-[#06b6d4]',
  },
  orange: {
    bg: 'from-[#f97316]/20 via-[#ea580c]/10',
    border: 'border-[#f97316]/40',
    shadow: 'shadow-[0_0_30px_rgba(249,115,22,0.2)]',
    iconBg: 'bg-gradient-to-br from-[#f97316] to-[#ea580c]',
    text: 'text-[#fb923c]',
    button: 'from-[#f97316] to-[#ea580c] hover:from-[#fb923c] hover:to-[#f97316]',
  },
  pink: {
    bg: 'from-[#ec4899]/20 via-[#db2777]/10',
    border: 'border-[#ec4899]/40',
    shadow: 'shadow-[0_0_30px_rgba(236,72,153,0.2)]',
    iconBg: 'bg-gradient-to-br from-[#ec4899] to-[#db2777]',
    text: 'text-[#f472b6]',
    button: 'from-[#ec4899] to-[#db2777] hover:from-[#f472b6] hover:to-[#ec4899]',
  },
  green: {
    bg: 'from-[#10b981]/20 via-[#059669]/10',
    border: 'border-[#10b981]/40',
    shadow: 'shadow-[0_0_30px_rgba(16,185,129,0.2)]',
    iconBg: 'bg-gradient-to-br from-[#10b981] to-[#059669]',
    text: 'text-[#34d399]',
    button: 'from-[#10b981] to-[#059669] hover:from-[#34d399] hover:to-[#10b981]',
  },
};

export function TrainingModule({
  icon: Icon,
  title,
  subtitle,
  duration,
  progress,
  total,
  color,
}: TrainingModuleProps) {
  const colors = colorMap[color];
  const percentage = (progress / total) * 100;
  
  return (
    <div className={`relative overflow-hidden rounded-3xl p-6 backdrop-blur-xl bg-gradient-to-br ${colors.bg} to-transparent border ${colors.border} ${colors.shadow}`}>
      <div className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${colors.iconBg} opacity-5 blur-3xl`}></div>
      
      <div className="relative z-10">
        <div className="flex items-start gap-4 mb-6">
          <div className={`w-14 h-14 rounded-2xl ${colors.iconBg} flex items-center justify-center shadow-lg`}>
            <Icon className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-white mb-1 tracking-wider">{title}</h3>
            <p className="text-sm text-gray-300 mb-2">{subtitle}</p>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>{duration}</span>
              <span>•</span>
              <span>{progress}/{total} exercícios</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-300">Progresso</span>
            <span className={`${colors.text} font-bold`}>{Math.round(percentage)}%</span>
          </div>
          <Progress value={percentage} className="h-2 bg-white/10" />
        </div>
        
        <Button className={`w-full bg-gradient-to-r ${colors.button} text-white font-semibold shadow-lg transition-all`}>
          <span>Continuar</span>
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
