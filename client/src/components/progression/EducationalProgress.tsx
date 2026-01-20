/**
 * Painel de Progressão Educacional
 * Mostra o progresso do aluno baseado no sistema pedagógico
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  GraduationCap, 
  Target, 
  TrendingUp, 
  Clock, 
  Award,
  ChevronRight,
  BookOpen,
  Guitar,
  Music,
  Headphones,
  CheckCircle2,
  Circle,
  AlertCircle
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useProgressionStore, EducationalLevel, Skill, LearningModule } from '@/stores/useProgressionStore';

const levelConfig: Record<EducationalLevel, { label: string; color: string; icon: string; description: string }> = {
  beginner: {
    label: 'Iniciante',
    color: 'from-green-500 to-emerald-500',
    icon: '🌱',
    description: 'Fundamentos, postura e acordes básicos',
  },
  intermediate: {
    label: 'Intermediário',
    color: 'from-blue-500 to-cyan-500',
    icon: '🎸',
    description: 'Pestanas, escalas e campo harmônico',
  },
  advanced: {
    label: 'Avançado',
    color: 'from-purple-500 to-pink-500',
    icon: '🎓',
    description: 'Harmonia funcional, improvisação e técnicas avançadas',
  },
};

const categoryConfig: Record<string, { label: string; icon: typeof Guitar; color: string }> = {
  technique: { label: 'Técnica', icon: Guitar, color: 'text-orange-400' },
  theory: { label: 'Teoria', icon: BookOpen, color: 'text-blue-400' },
  ear_training: { label: 'Percepção', icon: Headphones, color: 'text-purple-400' },
  repertoire: { label: 'Repertório', icon: Music, color: 'text-pink-400' },
};

export function EducationalProgress() {
  const {
    educationalLevel,
    skills,
    modules,
    currentModuleId,
    totalPracticeMinutes,
    totalSessions,
    getProgressMetrics,
    getDailyRoutine,
    getRecommendedSkills,
    getNextReviewItems,
  } = useProgressionStore();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const metrics = getProgressMetrics();
  const dailyRoutine = getDailyRoutine();
  const recommendedSkills = getRecommendedSkills();
  const reviewItems = getNextReviewItems();
  
  const config = levelConfig[educationalLevel];
  const currentModule = modules.find(m => m.id === currentModuleId);
  
  // Filtrar habilidades por nível atual e categoria
  const levelSkills = skills.filter(s => s.level === educationalLevel);
  const filteredSkills = selectedCategory 
    ? levelSkills.filter(s => s.category === selectedCategory)
    : levelSkills;
  
  // Calcular progresso por categoria
  const categoryProgress = Object.keys(categoryConfig).map(cat => {
    const catSkills = levelSkills.filter(s => s.category === cat);
    const mastered = catSkills.filter(s => s.mastered).length;
    const total = catSkills.length;
    return {
      category: cat,
      mastered,
      total,
      progress: total > 0 ? (mastered / total) * 100 : 0,
    };
  });

  return (
    <div className="space-y-6">
      {/* Header com Nível Atual */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-6 rounded-2xl bg-gradient-to-br ${config.color} relative overflow-hidden`}
      >
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-5xl">{config.icon}</div>
            <div>
              <p className="text-white/80 text-sm font-medium">Nível Atual</p>
              <h2 className="text-3xl font-bold text-white">{config.label}</h2>
              <p className="text-white/70 text-sm mt-1">{config.description}</p>
            </div>
          </div>
          
          {/* Métricas Rápidas */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{metrics.daysActive}</p>
              <p className="text-xs text-white/70">Dias Ativos</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{metrics.skillsMastered}</p>
              <p className="text-xs text-white/70">Habilidades</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{Math.round(metrics.totalMinutes / 60)}h</p>
              <p className="text-xs text-white/70">Praticadas</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Módulo Atual */}
      {currentModule && (
        <Card className="p-5 bg-white/5 border-white/10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Target className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">Módulo Atual</p>
                <h3 className="text-lg font-bold text-white">{currentModule.title}</h3>
              </div>
            </div>
            <span className="px-3 py-1 text-xs rounded-full bg-purple-500/20 text-purple-400">
              {Math.round(currentModule.progress)}%
            </span>
          </div>
          
          <p className="text-sm text-gray-400 mb-4">{currentModule.description}</p>
          
          <Progress value={currentModule.progress} className="h-2 mb-4" />
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{currentModule.estimatedDuration} min estimados</span>
            <span>{currentModule.skills.length} habilidades</span>
          </div>
        </Card>
      )}

      {/* Rotina Diária */}
      <Card className="p-5 bg-white/5 border-white/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-cyan-500/20 rounded-lg">
            <Clock className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Rotina Diária Recomendada</h3>
            <p className="text-xs text-gray-400">{dailyRoutine.totalMinutes} minutos por dia</p>
          </div>
        </div>
        
        <div className="space-y-2">
          {dailyRoutine.blocks.map((block, index) => (
            <div 
              key={index}
              className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              <div className="w-8 text-center">
                <span className="text-sm font-bold text-cyan-400">{block.minutes}'</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{block.name}</p>
                <p className="text-xs text-gray-500">{block.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Habilidades Recomendadas */}
      {recommendedSkills.length > 0 && (
        <Card className="p-5 bg-white/5 border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Próximos Passos</h3>
              <p className="text-xs text-gray-400">Habilidades recomendadas para praticar</p>
            </div>
          </div>
          
          <div className="space-y-3">
            {recommendedSkills.map((skill) => {
              const catConfig = categoryConfig[skill.category];
              const Icon = catConfig.icon;
              
              return (
                <div 
                  key={skill.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <Icon className={`w-5 h-5 ${catConfig.color}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{skill.name}</p>
                    <p className="text-xs text-gray-500 truncate">{skill.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">{skill.progress}%</p>
                    <p className="text-xs text-gray-500">{skill.practiceCount}x</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Itens para Revisão */}
      {reviewItems.length > 0 && (
        <Card className="p-5 bg-white/5 border-white/10 border-l-4 border-l-orange-500">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <AlertCircle className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Hora de Revisar!</h3>
              <p className="text-xs text-gray-400">{reviewItems.length} itens precisam de revisão</p>
            </div>
          </div>
          
          <div className="space-y-2">
            {reviewItems.map((item) => {
              const skill = skills.find(s => s.id === item.skillId);
              if (!skill) return null;
              
              return (
                <div 
                  key={item.skillId}
                  className="flex items-center justify-between p-3 rounded-lg bg-orange-500/10"
                >
                  <span className="text-sm text-white">{skill.name}</span>
                  <Button size="sm" variant="outline" className="h-7 text-xs">
                    Revisar
                  </Button>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Progresso por Categoria */}
      <Card className="p-5 bg-white/5 border-white/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-pink-500/20 rounded-lg">
            <Award className="w-5 h-5 text-pink-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Progresso por Área</h3>
            <p className="text-xs text-gray-400">Seu desenvolvimento em cada categoria</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {categoryProgress.map(({ category, mastered, total, progress }) => {
            const catConfig = categoryConfig[category];
            const Icon = catConfig.icon;
            
            return (
              <div 
                key={category}
                onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
                className={`p-4 rounded-xl cursor-pointer transition-all ${
                  selectedCategory === category 
                    ? 'bg-white/10 ring-2 ring-white/20' 
                    : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`w-4 h-4 ${catConfig.color}`} />
                  <span className="text-sm font-medium text-white">{catConfig.label}</span>
                </div>
                <Progress value={progress} className="h-1.5 mb-2" />
                <p className="text-xs text-gray-400">{mastered}/{total} dominadas</p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Lista de Habilidades */}
      <Card className="p-5 bg-white/5 border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">
            Habilidades {selectedCategory ? `- ${categoryConfig[selectedCategory]?.label}` : ''}
          </h3>
          {selectedCategory && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setSelectedCategory(null)}
              className="text-xs"
            >
              Ver todas
            </Button>
          )}
        </div>
        
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {filteredSkills.map((skill) => (
            <div 
              key={skill.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-white/5"
            >
              {skill.mastered ? (
                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-gray-500 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${skill.mastered ? 'text-green-400' : 'text-white'}`}>
                  {skill.name}
                </p>
                <p className="text-xs text-gray-500 truncate">{skill.description}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-white">{skill.progress}%</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
