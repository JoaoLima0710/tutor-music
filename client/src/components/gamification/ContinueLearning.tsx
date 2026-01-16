import { Progress } from '@/components/ui/progress';
import { ChevronRight } from 'lucide-react';
import { useLocation } from 'wouter';

interface Lesson {
  id: number;
  title: string;
  subtitle: string;
  progress: number;
  color: string;
  iconBg: string;
  icon: string;
}

interface ContinueLearningProps {
  lessons: Lesson[];
}

export function ContinueLearning({ lessons }: ContinueLearningProps) {
  const [, setLocation] = useLocation();
  
  const handleLessonClick = (lessonId: number) => {
    // Map lesson IDs to routes
    const routeMap: Record<number, string> = {
      1: '/chords',
      2: '/scales',
      3: '/practice'
    };
    setLocation(routeMap[lessonId] || '/chords');
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {lessons.map((lesson) => (
        <div
          key={lesson.id}
          onClick={() => handleLessonClick(lesson.id)}
          className="group relative overflow-hidden rounded-2xl p-5 backdrop-blur-xl bg-[#1a1a2e]/60 border border-white/10 hover:border-white/20 transition-all cursor-pointer"
        >
          <div className="flex items-start gap-4 mb-4">
            <div className={`w-12 h-12 rounded-xl ${lesson.iconBg} flex items-center justify-center text-2xl`}>
              {lesson.icon}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-white mb-1">{lesson.title}</h4>
              <p className="text-sm text-gray-400">{lesson.subtitle}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Progresso</span>
              <span className={`${lesson.color} font-semibold`}>{lesson.progress}%</span>
            </div>
            <Progress value={lesson.progress} className="h-2 bg-white/10" />
          </div>
        </div>
      ))}
    </div>
  );
}
