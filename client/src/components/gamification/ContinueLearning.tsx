import { Progress } from '@/components/ui/progress';
import { ChevronRight, Play } from 'lucide-react';
import { useLocation } from 'wouter';
import { useProgressionStore } from '@/stores/useProgressionStore';
import { lessonModules, LessonModule } from '@/data/lessons';

interface ContinueLearningProps {
  maxItems?: number;
}

export function ContinueLearning({ maxItems = 3 }: ContinueLearningProps) {
  const [, setLocation] = useLocation();
  const { modules, skills, educationalLevel } = useProgressionStore();
  
  // Pegar módulos do nível atual com progresso
  const currentLevelModules = lessonModules.filter(m => m.level === educationalLevel);
  
  // Criar lista de itens baseada no progresso real
  const learningItems = currentLevelModules.slice(0, maxItems).map((module, index) => {
    // Calcular progresso baseado nas habilidades do módulo
    const moduleSkills = skills.filter(s => 
      module.lessons.some(l => l.skillsToUnlock.includes(s.id))
    );
    const avgProgress = moduleSkills.length > 0
      ? Math.round(moduleSkills.reduce((sum, s) => sum + s.progress, 0) / moduleSkills.length)
      : 0;
    
    // Contar lições completadas
    const totalLessons = module.lessons.length;
    const completedLessons = Math.floor((avgProgress / 100) * totalLessons);
    
    return {
      id: module.id,
      title: module.title,
      subtitle: `Lição ${completedLessons + 1} de ${totalLessons}`,
      progress: avgProgress,
      icon: module.icon,
      color: module.color,
      route: getModuleRoute(module.id),
    };
  });
  
  function getModuleRoute(moduleId: string): string {
    const routeMap: Record<string, string> = {
      'module-1-fundamentals': '/tuner',
      'module-2-first-chords': '/chords',
      'module-3-rhythm': '/practice',
      'module-4-first-song': '/songs',
    };
    return routeMap[moduleId] || '/chords';
  }
  
  if (learningItems.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-[#1a1a2e]/60 border border-white/10 text-center">
        <p className="text-gray-400">Comece sua jornada musical!</p>
        <button 
          onClick={() => setLocation('/chords')}
          className="mt-3 px-4 py-2 rounded-lg bg-purple-500 text-white text-sm font-medium"
        >
          Começar Agora
        </button>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {learningItems.map((item) => (
        <div
          key={item.id}
          onClick={() => setLocation(item.route)}
          className="group relative overflow-hidden rounded-2xl p-5 backdrop-blur-xl bg-[#1a1a2e]/60 border border-white/10 hover:border-purple-500/50 transition-all cursor-pointer"
        >
          <div className="flex items-start gap-4 mb-4">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-2xl`}>
              {item.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-white mb-1 truncate">{item.title}</h4>
              <p className="text-sm text-gray-400">{item.subtitle}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500 transition-colors">
              <Play className="w-4 h-4 text-purple-400 group-hover:text-white transition-colors" />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Progresso</span>
              <span className="text-purple-400 font-semibold">{item.progress}%</span>
            </div>
            <Progress value={item.progress} className="h-2 bg-white/10" />
          </div>
        </div>
      ))}
    </div>
  );
}
