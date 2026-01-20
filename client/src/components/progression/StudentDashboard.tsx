/**
 * Dashboard de Progresso do Aluno
 * Visualização completa do progresso educacional
 * Princípio: Feedback imediato e métricas claras
 */

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Clock,
  Target,
  Award,
  Calendar,
  Music,
  BookOpen,
  Headphones,
  Guitar,
  ChevronRight,
  Flame,
  Star,
  BarChart3,
  CheckCircle2,
  Circle,
  Play,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useProgressionStore, EducationalLevel } from '@/stores/useProgressionStore';
import { useGamificationStore } from '@/stores/useGamificationStore';
import { lessonModules, getAllLessons } from '@/data/lessons';
import { Link } from 'wouter';

const levelConfig: Record<EducationalLevel, { 
  label: string; 
  color: string; 
  gradient: string;
  description: string;
  nextLevel?: string;
}> = {
  beginner: {
    label: 'Iniciante',
    color: 'text-green-400',
    gradient: 'from-green-500 to-emerald-500',
    description: 'Fundamentos, postura e acordes básicos',
    nextLevel: 'Intermediário',
  },
  intermediate: {
    label: 'Intermediário',
    color: 'text-blue-400',
    gradient: 'from-blue-500 to-cyan-500',
    description: 'Pestanas, escalas e campo harmônico',
    nextLevel: 'Avançado',
  },
  advanced: {
    label: 'Avançado',
    color: 'text-purple-400',
    gradient: 'from-purple-500 to-pink-500',
    description: 'Harmonia funcional, improvisação e técnicas avançadas',
  },
};

const categoryIcons: Record<string, typeof Guitar> = {
  technique: Guitar,
  theory: BookOpen,
  ear_training: Headphones,
  repertoire: Music,
};

const categoryLabels: Record<string, string> = {
  technique: 'Técnica',
  theory: 'Teoria',
  ear_training: 'Percepção',
  repertoire: 'Repertório',
};

export function StudentDashboard() {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'skills' | 'lessons'>('overview');
  
  const {
    educationalLevel,
    skills,
    modules,
    totalPracticeMinutes,
    totalSessions,
    weeklyProgress,
    getProgressMetrics,
    getDailyRoutine,
    getRecommendedSkills,
  } = useProgressionStore();
  
  const {
    xp,
    level,
    currentStreak,
    achievements,
  } = useGamificationStore();
  
  const metrics = getProgressMetrics();
  const dailyRoutine = getDailyRoutine();
  const recommendedSkills = getRecommendedSkills();
  const config = levelConfig[educationalLevel];
  
  // Calcular progresso para próximo nível educacional
  const levelProgress = useMemo(() => {
    const levelSkills = skills.filter(s => s.level === educationalLevel);
    const mastered = levelSkills.filter(s => s.mastered).length;
    return levelSkills.length > 0 ? (mastered / levelSkills.length) * 100 : 0;
  }, [skills, educationalLevel]);
  
  // Conquistas recentes
  const recentAchievements = achievements
    .filter(a => a.unlocked)
    .sort((a, b) => (b.unlockedAt || 0) - (a.unlockedAt || 0))
    .slice(0, 3);
  
  // Módulos de lição por nível
  const currentModules = lessonModules.filter(m => m.level === educationalLevel);
  
  // Formatar tempo
  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}min`;
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header do Dashboard */}
      <div className={`p-6 rounded-2xl bg-gradient-to-br ${config.gradient} relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-white/70 text-sm mb-1">Seu Nível</p>
              <h1 className="text-3xl font-bold text-white">{config.label}</h1>
              <p className="text-white/80 text-sm mt-1">{config.description}</p>
            </div>
            <div className="text-right">
              <p className="text-white/70 text-sm">Nível XP</p>
              <p className="text-2xl font-bold text-white">{level}</p>
            </div>
          </div>
          
          {config.nextLevel && (
            <div className="mt-4">
              <div className="flex justify-between text-sm text-white/80 mb-2">
                <span>Progresso para {config.nextLevel}</span>
                <span>{Math.round(levelProgress)}%</span>
              </div>
              <div className="h-3 bg-black/20 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-white/90"
                  initial={{ width: 0 }}
                  animate={{ width: `${levelProgress}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-white/5 border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <Flame className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{currentStreak}</p>
              <p className="text-xs text-gray-400">Dias Seguidos</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-white/5 border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/20 rounded-lg">
              <Clock className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{formatTime(totalPracticeMinutes)}</p>
              <p className="text-xs text-gray-400">Praticado</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-white/5 border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{metrics.skillsMastered}</p>
              <p className="text-xs text-gray-400">Habilidades</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-white/5 border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <Star className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{xp}</p>
              <p className="text-xs text-gray-400">XP Total</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {(['overview', 'skills', 'lessons'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              selectedTab === tab
                ? 'bg-purple-500 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            {tab === 'overview' && 'Visão Geral'}
            {tab === 'skills' && 'Habilidades'}
            {tab === 'lessons' && 'Lições'}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {selectedTab === 'overview' && (
        <div className="space-y-6">
          {/* Rotina do Dia */}
          <Card className="p-5 bg-white/5 border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Target className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Treino de Hoje</h3>
                  <p className="text-xs text-gray-400">{dailyRoutine.totalMinutes} minutos</p>
                </div>
              </div>
              <Link href="/practice">
                <Button size="sm" className="bg-purple-500 hover:bg-purple-600">
                  <Play className="w-4 h-4 mr-1" />
                  Iniciar
                </Button>
              </Link>
            </div>
            
            <div className="space-y-2">
              {dailyRoutine.blocks.map((block, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                  <span className="text-sm font-bold text-purple-400 w-8">{block.minutes}'</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{block.name}</p>
                    <p className="text-xs text-gray-500">{block.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Próximos Passos */}
          {recommendedSkills.length > 0 && (
            <Card className="p-5 bg-white/5 border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Foque Agora</h3>
                  <p className="text-xs text-gray-400">Habilidades recomendadas</p>
                </div>
              </div>
              
              <div className="space-y-3">
                {recommendedSkills.map(skill => {
                  const Icon = categoryIcons[skill.category] || Target;
                  return (
                    <div key={skill.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-colors">
                      <Icon className="w-5 h-5 text-gray-400" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{skill.name}</p>
                        <p className="text-xs text-gray-500">{categoryLabels[skill.category]}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-white">{skill.progress}%</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-500" />
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Atividade Semanal */}
          <Card className="p-5 bg-white/5 border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-cyan-500/20 rounded-lg">
                <BarChart3 className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h3 className="font-bold text-white">Esta Semana</h3>
                <p className="text-xs text-gray-400">Minutos praticados por dia</p>
              </div>
            </div>
            
            <div className="flex items-end justify-between h-24 gap-2">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day, i) => {
                const minutes = weeklyProgress[i] || 0;
                const height = Math.max(4, (minutes / 60) * 100); // Max 60 min = 100%
                const isToday = new Date().getDay() === i;
                
                return (
                  <div key={day} className="flex flex-col items-center flex-1">
                    <motion.div
                      className={`w-full rounded-t-sm ${isToday ? 'bg-cyan-500' : 'bg-cyan-500/50'}`}
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                    />
                    <span className={`text-xs mt-2 ${isToday ? 'text-cyan-400 font-bold' : 'text-gray-500'}`}>
                      {day}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Conquistas Recentes */}
          {recentAchievements.length > 0 && (
            <Card className="p-5 bg-white/5 border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-500/20 rounded-lg">
                    <Award className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Conquistas Recentes</h3>
                  </div>
                </div>
                <Link href="/achievements">
                  <Button variant="ghost" size="sm" className="text-gray-400">
                    Ver todas
                  </Button>
                </Link>
              </div>
              
              <div className="flex gap-4">
                {recentAchievements.map(achievement => (
                  <div key={achievement.id} className="flex-1 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-center">
                    <span className="text-2xl">{achievement.icon}</span>
                    <p className="text-sm font-medium text-white mt-1">{achievement.title}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {selectedTab === 'skills' && (
        <div className="space-y-4">
          {Object.entries(categoryLabels).map(([category, label]) => {
            const Icon = categoryIcons[category];
            const catSkills = skills.filter(s => s.level === educationalLevel && s.category === category);
            const mastered = catSkills.filter(s => s.mastered).length;
            
            return (
              <Card key={category} className="p-5 bg-white/5 border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <Icon className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <h3 className="font-bold text-white">{label}</h3>
                    <p className="text-xs text-gray-400">{mastered}/{catSkills.length} dominadas</p>
                  </div>
                  <Progress value={(mastered / catSkills.length) * 100} className="w-24 h-2" />
                </div>
                
                <div className="space-y-2">
                  {catSkills.map(skill => (
                    <div key={skill.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5">
                      {skill.mastered ? (
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-600" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${skill.mastered ? 'text-green-400' : 'text-gray-300'}`}>
                          {skill.name}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500">{skill.progress}%</span>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {selectedTab === 'lessons' && (
        <div className="space-y-4">
          {currentModules.map(module => (
            <Card key={module.id} className={`p-5 bg-gradient-to-br ${module.color} relative overflow-hidden`}>
              <div className="absolute inset-0 bg-black/40" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{module.icon}</span>
                  <div>
                    <h3 className="text-lg font-bold text-white">{module.title}</h3>
                    <p className="text-sm text-white/70">{module.description}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {module.lessons.map((lesson, i) => (
                    <Link key={lesson.id} href={`/lessons/${lesson.id}`}>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-white/10 hover:bg-white/20 cursor-pointer transition-colors">
                        <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-sm text-white">
                          {i + 1}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">{lesson.title}</p>
                          <p className="text-xs text-white/60">{lesson.estimatedMinutes} min</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-white/60" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
