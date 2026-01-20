/**
 * Tooltip de Glossário
 * Mostra definição de termos técnicos ao passar o mouse ou clicar
 */

import { useState } from 'react';
import { HelpCircle, X, BookOpen } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';

interface GlossaryTerm {
  term: string;
  definition: string;
  category: string;
  link?: string;
}

const GLOSSARY: Record<string, GlossaryTerm> = {
  'Pestana': {
    term: 'Pestana',
    definition: 'Técnica onde um dedo (geralmente o indicador) pressiona todas as cordas em um mesmo traste, formando acordes como F, B, Bb.',
    category: 'Técnica',
    link: '/theory'
  },
  'Pentatônica': {
    term: 'Escala Pentatônica',
    definition: 'Escala de 5 notas muito usada em rock, blues e pop. Existem versões maior e menor. É uma das escalas mais versáteis para improvisação.',
    category: 'Escalas',
    link: '/scales'
  },
  'Progressão Harmônica': {
    term: 'Progressão Harmônica',
    definition: 'Sequência de acordes que segue um padrão musical. Exemplo comum: I-V-vi-IV (C-G-Am-F). É a base de muitas músicas populares.',
    category: 'Teoria',
    link: '/theory'
  },
  'Tônica': {
    term: 'Tônica',
    definition: 'A nota fundamental de uma escala ou acorde. É a nota que dá nome à escala (ex: na escala de Dó, a tônica é Dó).',
    category: 'Teoria',
    link: '/theory'
  },
  'Intervalo': {
    term: 'Intervalo',
    definition: 'Distância entre duas notas. Exemplos: 2ª (segunda), 3ª (terça), 5ª (quinta), 8ª (oitava). Intervalos definem a sonoridade de acordes e escalas.',
    category: 'Teoria',
    link: '/theory'
  },
  'CAGED': {
    term: 'Sistema CAGED',
    definition: 'Método de visualizar acordes e escalas no braço do violão usando 5 formas básicas: C, A, G, E, D. Facilita navegação pelo braço.',
    category: 'Técnica',
    link: '/scales'
  },
  'Dedilhado': {
    term: 'Dedilhado',
    definition: 'Técnica de tocar as cordas individualmente com os dedos da mão direita, ao invés de usar palhetada. Cria texturas melódicas e harmônicas.',
    category: 'Técnica',
    link: '/practice'
  },
  'Barré': {
    term: 'Barré',
    definition: 'Sinônimo de pestana. Técnica onde um dedo pressiona múltiplas cordas simultaneamente no mesmo traste.',
    category: 'Técnica',
    link: '/theory'
  }
};

interface GlossaryTooltipProps {
  term: string;
  children?: React.ReactNode;
  className?: string;
}

export function GlossaryTooltip({ term, children, className = '' }: GlossaryTooltipProps) {
  const [open, setOpen] = useState(false);
  const glossaryData = GLOSSARY[term];

  if (!glossaryData) {
    // Se termo não está no glossário, retornar apenas o conteúdo
    return <span className={className}>{children || term}</span>;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={`inline-flex items-center gap-1 hover:text-purple-300 transition-colors ${className}`}
          onClick={(e) => {
            e.stopPropagation();
            setOpen(true);
          }}
        >
          {children || term}
          <HelpCircle className="w-3 h-3 text-purple-400 hover:text-purple-300" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-gradient-to-br from-purple-900/95 to-blue-900/95 border-white/20 text-white">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-bold text-lg text-white mb-1">{glossaryData.term}</h4>
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/40 text-xs">
                {glossaryData.category}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
              className="h-6 w-6 p-0 text-white/60 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <p className="text-white/80 text-sm leading-relaxed">
            {glossaryData.definition}
          </p>
          
          {glossaryData.link && (
            <Link href={glossaryData.link}>
              <Button
                variant="outline"
                size="sm"
                className="w-full border-white/20 text-white hover:bg-white/10"
                onClick={() => setOpen(false)}
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Ver mais em Teoria Musical
              </Button>
            </Link>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Componente para usar termos com glossário inline
export function GlossaryTerm({ term }: { term: string }) {
  return <GlossaryTooltip term={term}>{term}</GlossaryTooltip>;
}

// Hook para verificar se termo existe no glossário
export function useGlossary() {
  return {
    hasTerm: (term: string) => term in GLOSSARY,
    getTerm: (term: string) => GLOSSARY[term],
    getAllTerms: () => Object.values(GLOSSARY)
  };
}
