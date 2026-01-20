/**
 * Navegação Contextual
 * Adiciona botão "Praticar Agora" em seções de teoria que leva diretamente ao exercício correspondente
 */

import { Button } from '@/components/ui/button';
import { Play, ArrowRight, Music, Target, Ear } from 'lucide-react';
import { Link } from 'wouter';

interface ContextualNavigationProps {
  type: 'interval' | 'chord' | 'scale' | 'rhythm' | 'ear-training';
  title: string;
  description?: string;
  practicePath: string;
  className?: string;
}

export function ContextualNavigation({
  type,
  title,
  description,
  practicePath,
  className = ''
}: ContextualNavigationProps) {
  const getIcon = () => {
    switch (type) {
      case 'interval':
      case 'chord':
        return <Music className="w-4 h-4" />;
      case 'scale':
        return <Target className="w-4 h-4" />;
      case 'ear-training':
        return <Ear className="w-4 h-4" />;
      default:
        return <Play className="w-4 h-4" />;
    }
  };

  return (
    <div className={`p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 ${className}`}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <h4 className="text-white font-semibold mb-1 flex items-center gap-2">
            {getIcon()}
            {title}
          </h4>
          {description && (
            <p className="text-sm text-white/70">{description}</p>
          )}
        </div>
        <Link href={practicePath}>
          <Button
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white whitespace-nowrap"
            size="sm"
          >
            <Play className="w-4 h-4 mr-2" />
            Praticar Agora
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

/**
 * Componente "O que fazer agora?" - Aparece ao completar módulo
 */
interface NextStepsProps {
  completedModule: string;
  suggestions: Array<{
    title: string;
    description: string;
    path: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  onSelect?: (path: string) => void;
}

export function NextSteps({ completedModule, suggestions, onSelect }: NextStepsProps) {
  return (
    <div className="p-6 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <Target className="w-5 h-5 text-green-400" />
        O que fazer agora?
      </h3>
      
      <p className="text-white/70 text-sm mb-4">
        Você completou: <strong className="text-white">{completedModule}</strong>
      </p>

      <div className="space-y-3">
        {suggestions.map((suggestion, index) => (
          <Link key={index} href={suggestion.path}>
            <button
              onClick={() => onSelect?.(suggestion.path)}
              className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                suggestion.priority === 'high'
                  ? 'bg-purple-500/20 border-purple-500/40 hover:border-purple-500/60'
                  : suggestion.priority === 'medium'
                  ? 'bg-blue-500/20 border-blue-500/40 hover:border-blue-500/60'
                  : 'bg-white/5 border-white/20 hover:border-white/30'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-white mb-1">{suggestion.title}</h4>
                  <p className="text-sm text-white/70">{suggestion.description}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-white/60 flex-shrink-0" />
              </div>
            </button>
          </Link>
        ))}
      </div>
    </div>
  );
}
