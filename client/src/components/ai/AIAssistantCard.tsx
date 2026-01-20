/**
 * Card Resumido do Assistente IA para Home
 * Versão compacta que linka para funcionalidade completa
 */

import { useState } from 'react';
import { Brain, MessageSquare, Sparkles, ChevronRight, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ConversationalTutor } from './ConversationalTutor';
import { useLocation } from 'wouter';

export function AIAssistantCard() {
  const [showTutor, setShowTutor] = useState(false);
  const [, setLocation] = useLocation();

  return (
    <>
      <Card className="p-5 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
        <div className="flex items-center gap-4">
          {/* Ícone */}
          <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <Brain className="w-7 h-7 text-white" />
          </div>
          
          {/* Conteúdo */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Assistente IA
              <Sparkles className="w-4 h-4 text-yellow-400" />
            </h3>
            <p className="text-sm text-gray-300 mt-0.5">
              Tire dúvidas e receba dicas personalizadas
            </p>
          </div>
          
          {/* Ações */}
          <div className="flex gap-2 flex-shrink-0">
            <Button
              onClick={() => setShowTutor(true)}
              size="sm"
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              <MessageSquare className="w-4 h-4 mr-1.5" />
              Chat
            </Button>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setLocation('/practice')}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-gray-300 transition-colors"
          >
            <Zap className="w-4 h-4 text-cyan-400" />
            Exercício Adaptativo
          </button>
          <button
            onClick={() => setLocation('/training')}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-gray-300 transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-purple-400" />
            Ver Análise Completa
          </button>
        </div>
      </Card>

      {/* Modal do Tutor */}
      <ConversationalTutor
        isOpen={showTutor}
        onClose={() => setShowTutor(false)}
      />
    </>
  );
}
