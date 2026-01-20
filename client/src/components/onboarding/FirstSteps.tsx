/**
 * Seção "Primeiros Passos" - Conteúdo pré-violão
 * Para iniciantes absolutos que ainda não têm violão ou não sabem o básico
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Guitar, 
  Settings, 
  User, 
  Music, 
  Wrench, 
  CheckCircle2, 
  ChevronRight,
  Play,
  Info
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface FirstStepsSection {
  id: string;
  title: string;
  icon: any;
  description: string;
  content: React.ReactNode;
  optional?: boolean;
}

export function FirstSteps() {
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());

  const sections: FirstStepsSection[] = [
    {
      id: 'choosing-guitar',
      title: 'Escolhendo seu Violão',
      icon: Guitar,
      description: 'Guia completo para escolher seu primeiro instrumento',
      optional: false,
      content: (
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
            <h4 className="text-lg font-bold text-white mb-3">🎸 Tipos de Violão</h4>
            <div className="space-y-3 text-gray-300">
              <div>
                <strong className="text-blue-400">Violão Clássico (Nylon):</strong>
                <p className="text-sm mt-1">Cordas de nylon, mais macias para iniciantes. Ideal para música clássica, MPB, samba.</p>
              </div>
              <div>
                <strong className="text-blue-400">Violão Folk (Aço):</strong>
                <p className="text-sm mt-1">Cordas de aço, som mais brilhante. Ideal para rock, pop, country. Pode ser mais difícil no início.</p>
              </div>
              <div>
                <strong className="text-blue-400">Violão Elétrico:</strong>
                <p className="text-sm mt-1">Precisa de amplificador. Cordas mais finas, mais fácil de tocar. Ideal para rock, blues, jazz.</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
            <h4 className="text-lg font-bold text-white mb-3">✅ Dicas para Iniciantes</h4>
            <ul className="space-y-2 text-gray-300 text-sm list-disc list-inside">
              <li>Comece com violão clássico (nylon) - cordas mais macias</li>
              <li>Tamanho adequado: violão 4/4 para adultos, 3/4 para crianças</li>
              <li>Orçamento: R$ 300-600 para um violão iniciante decente</li>
              <li>Teste antes de comprar: verifique se as cordas estão próximas do braço (action baixa)</li>
              <li>Evite violões muito baratos (menos de R$ 200) - podem ter problemas estruturais</li>
            </ul>
          </div>

          <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <h4 className="text-lg font-bold text-white mb-3">⚠️ O que Evitar</h4>
            <ul className="space-y-2 text-gray-300 text-sm list-disc list-inside">
              <li>Violões com trastes soltos ou braço empenado</li>
              <li>Cordas muito altas do braço (action alta) - dificulta tocar</li>
              <li>Violões com rachaduras ou danos estruturais</li>
              <li>Comprar online sem testar (se possível)</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'guitar-parts',
      title: 'Partes do Violão',
      icon: Settings,
      description: 'Conheça as partes do seu instrumento',
      optional: false,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <h4 className="font-bold text-white mb-2">🎸 Corpo</h4>
              <p className="text-sm text-gray-300">Caixa de ressonância que amplifica o som</p>
            </div>
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <h4 className="font-bold text-white mb-2">🎯 Braço</h4>
              <p className="text-sm text-gray-300">Onde você pressiona as cordas</p>
            </div>
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <h4 className="font-bold text-white mb-2">🎵 Trastes</h4>
              <p className="text-sm text-gray-300">Barras de metal que dividem o braço</p>
            </div>
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <h4 className="font-bold text-white mb-2">🎹 Tarraxas</h4>
              <p className="text-sm text-gray-300">Ajustam a afinação das cordas</p>
            </div>
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <h4 className="font-bold text-white mb-2">🎪 Rastilho</h4>
              <p className="text-sm text-gray-300">Pequena peça que eleva as cordas</p>
            </div>
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <h4 className="font-bold text-white mb-2">🎼 Cordas</h4>
              <p className="text-sm text-gray-300">6 cordas (E-A-D-G-B-E da mais grave à mais aguda)</p>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
            <h4 className="text-lg font-bold text-white mb-3">💡 Nomenclatura das Cordas</h4>
            <div className="space-y-2 text-gray-300 text-sm">
              <p><strong className="text-purple-400">Corda 6 (E grave):</strong> Corda mais grossa, mais grave</p>
              <p><strong className="text-purple-400">Corda 5 (A):</strong> Segunda mais grave</p>
              <p><strong className="text-purple-400">Corda 4 (D):</strong> Corda do meio</p>
              <p><strong className="text-purple-400">Corda 3 (G):</strong> Segunda mais aguda</p>
              <p><strong className="text-purple-400">Corda 2 (B):</strong> Segunda mais aguda</p>
              <p><strong className="text-purple-400">Corda 1 (E agudo):</strong> Corda mais fina, mais aguda</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'posture',
      title: 'Postura Correta',
      icon: User,
      description: 'Aprenda a posição correta para tocar',
      optional: false,
      content: (
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
            <h4 className="text-lg font-bold text-white mb-3">✅ Postura Sentada (Recomendada para Iniciantes)</h4>
            <ul className="space-y-2 text-gray-300 text-sm list-disc list-inside">
              <li>Sente-se na ponta da cadeira, costas retas</li>
              <li>Violão apoiado na perna direita (destro) ou esquerda (canhoto)</li>
              <li>Braço do violão levemente inclinado para cima</li>
              <li>Pé esquerdo em um apoio (banquinho) para elevar a perna</li>
              <li>Braço esquerdo relaxado, não tensionado</li>
              <li>Punho esquerdo não deve dobrar excessivamente</li>
            </ul>
          </div>

          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
            <h4 className="text-lg font-bold text-white mb-3">🎯 Posição das Mãos</h4>
            <div className="space-y-3 text-gray-300 text-sm">
              <div>
                <strong className="text-blue-400">Mão Esquerda (Braço):</strong>
                <p className="mt-1">Polegar atrás do braço, dedos curvados, ponta dos dedos pressionando as cordas</p>
              </div>
              <div>
                <strong className="text-blue-400">Mão Direita (Cordas):</strong>
                <p className="mt-1">Punho relaxado, dedos ou palheta tocam as cordas próximo à boca do violão</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <h4 className="text-lg font-bold text-white mb-3">⚠️ Erros Comuns</h4>
            <ul className="space-y-2 text-gray-300 text-sm list-disc list-inside">
              <li>Encolher os ombros - mantenha relaxado</li>
              <li>Dobrar o punho excessivamente - causa lesão</li>
              <li>Pressionar cordas com muita força - use apenas força necessária</li>
              <li>Violão muito baixo ou muito alto - ajuste para conforto</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'tuning',
      title: 'Afinação Básica',
      icon: Music,
      description: 'Aprenda a afinar seu violão',
      optional: false,
      content: (
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
            <h4 className="text-lg font-bold text-white mb-3">🎵 Afinação Padrão (E-A-D-G-B-E)</h4>
            <div className="space-y-2 text-gray-300 text-sm">
              <p><strong className="text-blue-400">Corda 6 (E grave):</strong> Mi</p>
              <p><strong className="text-blue-400">Corda 5 (A):</strong> Lá</p>
              <p><strong className="text-blue-400">Corda 4 (D):</strong> Ré</p>
              <p><strong className="text-blue-400">Corda 3 (G):</strong> Sol</p>
              <p><strong className="text-blue-400">Corda 2 (B):</strong> Si</p>
              <p><strong className="text-blue-400">Corda 1 (E agudo):</strong> Mi</p>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
            <h4 className="text-lg font-bold text-white mb-3">✅ Métodos de Afinação</h4>
            <div className="space-y-3 text-gray-300 text-sm">
              <div>
                <strong className="text-green-400">1. Afinador Digital (Recomendado):</strong>
                <p className="mt-1">Use o afinador do app MusicTutor ou qualquer afinador digital. Mais preciso para iniciantes.</p>
              </div>
              <div>
                <strong className="text-green-400">2. Afinação Relativa:</strong>
                <p className="mt-1">Afine a 5ª corda (A) com um diapasão ou app, depois afine as outras em relação a ela.</p>
              </div>
              <div>
                <strong className="text-green-400">3. Afinação por Harmônicos:</strong>
                <p className="mt-1">Método avançado usando harmônicos naturais. Aprenda depois de dominar o básico.</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
            <h4 className="text-lg font-bold text-white mb-3">💡 Dicas</h4>
            <ul className="space-y-2 text-gray-300 text-sm list-disc list-inside">
              <li>Afine sempre antes de tocar - violão desafina com temperatura e uso</li>
              <li>Gire as tarraxas devagar - ajustes pequenos fazem grande diferença</li>
              <li>Se a corda está muito baixa, suba até passar do tom e depois desça</li>
              <li>Cordas novas desafinam mais - afine frequentemente nas primeiras semanas</li>
            </ul>
          </div>

          <Button
            onClick={() => {
              // Navegar para afinador
              window.location.href = '/tuner';
            }}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
          >
            <Music className="w-4 h-4 mr-2" />
            Abrir Afinador do App
          </Button>
        </div>
      ),
    },
    {
      id: 'changing-strings',
      title: 'Trocar Cordas',
      icon: Wrench,
      description: 'Aprenda a trocar as cordas do seu violão',
      optional: true,
      content: (
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
            <h4 className="text-lg font-bold text-white mb-3">🔄 Quando Trocar Cordas?</h4>
            <ul className="space-y-2 text-gray-300 text-sm list-disc list-inside">
              <li>Cordas ficam escuras ou enferrujadas</li>
              <li>Som perde brilho e clareza</li>
              <li>Cordas quebram</li>
              <li>Dificuldade para manter afinação</li>
              <li>Geralmente: a cada 2-3 meses de uso regular</li>
            </ul>
          </div>

          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
            <h4 className="text-lg font-bold text-white mb-3">✅ Passo a Passo</h4>
            <div className="space-y-3 text-gray-300 text-sm">
              <div>
                <strong className="text-green-400">1. Remover cordas antigas:</strong>
                <p className="mt-1">Solte as tarraxas e remova as cordas. Se necessário, corte com alicate.</p>
              </div>
              <div>
                <strong className="text-green-400">2. Limpar o violão:</strong>
                <p className="mt-1">Aproveite para limpar o braço e corpo do violão com pano macio.</p>
              </div>
              <div>
                <strong className="text-green-400">3. Instalar novas cordas:</strong>
                <p className="mt-1">Passe a corda pelo rastilho, depois pela tarraxa. Dê 2-3 voltas na tarraxa.</p>
              </div>
              <div>
                <strong className="text-green-400">4. Afinar gradualmente:</strong>
                <p className="mt-1">Afine as cordas até a tensão correta. Cordas novas precisam de alguns ajustes.</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <h4 className="text-lg font-bold text-white mb-3">⚠️ Cuidados</h4>
            <ul className="space-y-2 text-gray-300 text-sm list-disc list-inside">
              <li>Não remova todas as cordas de uma vez - pode afetar a tensão do braço</li>
              <li>Troque uma corda por vez ou no máximo 3 de cada vez</li>
              <li>Use cordas do calibre correto para seu violão</li>
              <li>Primeira vez? Peça ajuda de alguém experiente ou veja tutoriais</li>
            </ul>
          </div>
        </div>
      ),
    },
  ];

  const handleCompleteSection = (sectionId: string) => {
    setCompletedSections(prev => new Set(prev).add(sectionId));
    setSelectedSection(null);
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
          <Guitar className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Primeiros Passos</h2>
          <p className="text-sm text-gray-400">Conteúdo essencial antes de começar a tocar</p>
        </div>
      </div>

      <div className="mb-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
        <div className="flex items-start gap-2">
          <Info className="w-5 h-5 text-blue-400 mt-0.5" />
          <p className="text-sm text-gray-300">
            Esta seção é <strong className="text-blue-400">recomendada para iniciantes absolutos</strong>. 
            Se você já tem violão e conhece o básico, pode pular para as lições práticas.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {sections.map((section, index) => {
          const isCompleted = completedSections.has(section.id);
          const isSelected = selectedSection === section.id;

          return (
            <div key={section.id}>
              <motion.button
                onClick={() => setSelectedSection(isSelected ? null : section.id)}
                className={`w-full p-4 rounded-lg text-left transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30'
                    : 'bg-white/5 hover:bg-white/10 border border-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isCompleted 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-white/10 text-gray-400'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <section.icon className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white">{section.title}</h3>
                        {section.optional && (
                          <Badge variant="outline" className="text-xs">Opcional</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-400">{section.description}</p>
                    </div>
                  </div>
                  <ChevronRight 
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      isSelected ? 'rotate-90' : ''
                    }`} 
                  />
                </div>
              </motion.button>

              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 p-4 rounded-lg bg-white/5 border border-white/10"
                  >
                    {section.content}
                    <Button
                      onClick={() => handleCompleteSection(section.id)}
                      className="mt-4 w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Marcar como Concluído
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {completedSections.size === sections.filter(s => !s.optional).length && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 rounded-lg bg-green-500/20 border border-green-500/30"
        >
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            <h3 className="font-bold text-white">Parabéns! Você completou os Primeiros Passos</h3>
          </div>
          <p className="text-sm text-gray-300">
            Agora você está pronto para começar a tocar! Continue para as lições práticas de acordes.
          </p>
        </motion.div>
      )}
    </Card>
  );
}
