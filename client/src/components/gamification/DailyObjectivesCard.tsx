/**
 * Card de Objetivos Diários
 * Substitui meta genérica por 3 tarefas específicas com checkboxes
 */

import { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Target, Music, Ear, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useLocation } from 'wouter';
import { useProgressionStore } from '@/stores/useProgressionStore';
import { useGamificationStore } from '@/stores/useGamificationStore';

interface DailyObjectiveData {
  id: string;
  title: string;
  description: string;
  iconType: 'target' | 'music' | 'ear';
  completed: boolean;
  link?: string;
  priority: 'essential' | 'recommended' | 'optional';
}

interface DailyObjective extends DailyObjectiveData {
  icon: React.ReactNode;
}

export function DailyObjectivesCard() {
  const [, setLocation] = useLocation();
  const { getDailyRoutine } = useProgressionStore();
  const { currentStreak } = useGamificationStore();
  
  const [objectives, setObjectives] = useState<DailyObjective[]>([]);

  const getIcon = (iconType: 'target' | 'music' | 'ear'): React.ReactNode => {
    switch (iconType) {
      case 'target':
        return <Target className="w-5 h-5" />;
      case 'music':
        return <Music className="w-5 h-5" />;
      case 'ear':
        return <Ear className="w-5 h-5" />;
      default:
        return <Target className="w-5 h-5" />;
    }
  };

  useEffect(() => {
    // Carregar objetivos do localStorage ou gerar novos
    const today = new Date().toDateString();
    const saved = localStorage.getItem(`daily_objectives_${today}`);
    
    if (saved) {
      const savedData: DailyObjectiveData[] = JSON.parse(saved);
      // Regenerar ícones JSX a partir dos dados salvos
      const objectivesWithIcons: DailyObjective[] = savedData.map(obj => ({
        ...obj,
        icon: getIcon(obj.iconType)
      }));
      setObjectives(objectivesWithIcons);
    } else {
      // Gerar novos objetivos baseados na rotina diária
      const routine = getDailyRoutine();
      const newObjectivesData: DailyObjectiveData[] = [
        {
          id: 'complete_training',
          title: 'Completar Treino do Dia',
          description: `${routine.totalMinutes} minutos de prática guiada`,
          iconType: 'target',
          completed: false,
          link: '/',
          priority: 'essential'
        },
        {
          id: 'chord_transitions',
          title: 'Praticar 3 Transições de Acordes',
          description: 'Melhore sua fluidez entre acordes',
          iconType: 'music',
          completed: false,
          link: '/chords',
          priority: 'recommended'
        },
        {
          id: 'ear_training',
          title: 'Identificar 5 Intervalos',
          description: 'Desenvolva seu ouvido musical',
          iconType: 'ear',
          completed: false,
          link: '/practice',
          priority: 'optional'
        }
      ];
      
      // Criar objetivos com ícones JSX
      const newObjectives: DailyObjective[] = newObjectivesData.map(obj => ({
        ...obj,
        icon: getIcon(obj.iconType)
      }));
      
      setObjectives(newObjectives);
      // Salvar apenas os dados (sem ícones JSX)
      localStorage.setItem(`daily_objectives_${today}`, JSON.stringify(newObjectivesData));
    }
  }, []);

  const toggleObjective = (id: string) => {
    setObjectives(prev => {
      const updated = prev.map(obj => 
        obj.id === id ? { ...obj, completed: !obj.completed } : obj
      );
      
      // Salvar apenas os dados (sem ícones JSX)
      const today = new Date().toDateString();
      const dataToSave: DailyObjectiveData[] = updated.map(({ icon, ...data }) => data);
      localStorage.setItem(`daily_objectives_${today}`, JSON.stringify(dataToSave));
      
      return updated;
    });
  };

  const completedCount = objectives.filter(obj => obj.completed).length;
  const totalCount = objectives.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'essential':
        return <Badge className="bg-red-500/20 text-red-300 border-red-500/40">🔥 Essencial</Badge>;
      case 'recommended':
        return <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/40">⭐ Recomendado</Badge>;
      case 'optional':
        return <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/40">💡 Opcional</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-white/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="w-5 h-5" />
            Objetivos de Hoje
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-white/70">
              {completedCount}/{totalCount}
            </span>
            {completedCount === totalCount && (
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            )}
          </div>
        </div>
        <Progress value={progress} className="h-2 mt-2" />
      </CardHeader>
      
      <CardContent className="space-y-3">
        {objectives.map((objective) => (
          <div
            key={objective.id}
            className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
              objective.completed
                ? 'bg-green-500/10 border-green-500/40'
                : 'bg-white/5 border-white/10 hover:border-white/20'
            }`}
            onClick={() => !objective.completed && toggleObjective(objective.id)}
          >
            <div className="flex items-start gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleObjective(objective.id);
                }}
                className="mt-0.5 flex-shrink-0"
              >
                {objective.completed ? (
                  <CheckCircle2 className="w-6 h-6 text-green-400" />
                ) : (
                  <Circle className="w-6 h-6 text-white/40" />
                )}
              </button>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className={`${objective.completed ? 'text-green-400' : 'text-white/60'}`}>
                    {objective.icon}
                  </div>
                  <h4 className={`font-semibold ${
                    objective.completed ? 'text-green-300 line-through' : 'text-white'
                  }`}>
                    {objective.title}
                  </h4>
                </div>
                
                <p className="text-sm text-white/60 mb-2">
                  {objective.description}
                </p>
                
                <div className="flex items-center gap-2">
                  {getPriorityBadge(objective.priority)}
                  {objective.link && !objective.completed && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLocation(objective.link!);
                      }}
                      className="h-6 px-2 text-xs text-white/70 hover:text-white"
                    >
                      Ir <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {completedCount === totalCount && (
          <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/40">
            <div className="flex items-center gap-2 text-green-300">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-semibold">Parabéns! Você completou todos os objetivos de hoje! 🎉</span>
            </div>
            <p className="text-sm text-green-200/80 mt-1">
              Continue praticando para manter seu streak de {currentStreak} dias!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
