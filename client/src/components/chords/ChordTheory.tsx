import { Card } from '@/components/ui/card';
import { Book, Music, Lightbulb } from 'lucide-react';

export function ChordTheory() {
  return (
    <div className="space-y-6">
      {/* Introdução */}
      <Card className="p-6 bg-gradient-to-br from-[#1a1a2e] to-[#16213e] border-white/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-[#8b5cf6]/20">
            <Book className="w-5 h-5 text-[#8b5cf6]" />
          </div>
          <h3 className="text-xl font-bold text-white">O que são Acordes?</h3>
        </div>
        
        <p className="text-gray-300 leading-relaxed mb-4">
          Acordes são <span className="text-[#06b6d4] font-semibold">conjuntos de notas tocadas simultaneamente</span> que criam harmonia. 
          Eles servem como a "base" da música, dando suporte à melodia e criando diferentes sensações e emoções.
        </p>
        
        <div className="p-4 rounded-lg bg-[#8b5cf6]/10 border border-[#8b5cf6]/30">
          <p className="text-sm text-gray-300">
            <span className="font-semibold text-[#8b5cf6]">💡 Analogia:</span> Se a melodia é a "história" que você conta, 
            os acordes são o "cenário" e a "atmosfera" onde essa história acontece.
          </p>
        </div>
      </Card>

      {/* Tipos de Acordes */}
      <Card className="p-6 bg-gradient-to-br from-[#1a1a2e] to-[#16213e] border-white/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-[#06b6d4]/20">
            <Music className="w-5 h-5 text-[#06b6d4]" />
          </div>
          <h3 className="text-xl font-bold text-white">Tipos Principais de Acordes</h3>
        </div>

        <div className="space-y-4">
          {/* Acorde Maior */}
          <div className="p-4 rounded-lg bg-gradient-to-r from-[#10b981]/20 to-transparent border-l-4 border-[#10b981]">
            <h4 className="text-lg font-bold text-white mb-2">🎵 Acorde Maior</h4>
            <p className="text-gray-300 text-sm mb-3">
              Som <span className="text-[#10b981] font-semibold">alegre, brilhante e positivo</span>. 
              É o acorde mais comum e geralmente transmite felicidade, energia ou esperança.
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="px-2 py-1 rounded bg-[#10b981]/20 text-[#10b981]">Exemplos: C, G, D, A, E</span>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              <span className="font-semibold">Como reconhecer:</span> Se o acorde te faz sorrir ou te anima, provavelmente é maior!
            </p>
          </div>

          {/* Acorde Menor */}
          <div className="p-4 rounded-lg bg-gradient-to-r from-[#3b82f6]/20 to-transparent border-l-4 border-[#3b82f6]">
            <h4 className="text-lg font-bold text-white mb-2">🎵 Acorde Menor</h4>
            <p className="text-gray-300 text-sm mb-3">
              Som <span className="text-[#3b82f6] font-semibold">melancólico, suave e introspectivo</span>. 
              Transmite tristeza, nostalgia ou reflexão.
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="px-2 py-1 rounded bg-[#3b82f6]/20 text-[#3b82f6]">Exemplos: Am, Em, Dm, Bm</span>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              <span className="font-semibold">Como reconhecer:</span> Se o acorde te deixa pensativo ou emocionado, é menor!
            </p>
          </div>

          {/* Acorde Diminuto */}
          <div className="p-4 rounded-lg bg-gradient-to-r from-[#f97316]/20 to-transparent border-l-4 border-[#f97316]">
            <h4 className="text-lg font-bold text-white mb-2">🎵 Acorde Diminuto</h4>
            <p className="text-gray-300 text-sm mb-3">
              Som <span className="text-[#f97316] font-semibold">tenso, instável e misterioso</span>. 
              Cria suspense e geralmente pede "resolução" para outro acorde.
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="px-2 py-1 rounded bg-[#f97316]/20 text-[#f97316]">Exemplos: Cdim, Bdim, F#dim</span>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              <span className="font-semibold">Como reconhecer:</span> Se o acorde te deixa desconfortável ou esperando algo, é diminuto!
            </p>
          </div>

          {/* Acorde Aumentado */}
          <div className="p-4 rounded-lg bg-gradient-to-r from-[#ec4899]/20 to-transparent border-l-4 border-[#ec4899]">
            <h4 className="text-lg font-bold text-white mb-2">🎵 Acorde Aumentado</h4>
            <p className="text-gray-300 text-sm mb-3">
              Som <span className="text-[#ec4899] font-semibold">dramático, expansivo e surreal</span>. 
              Menos comum, usado para criar tensão ou efeitos especiais.
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="px-2 py-1 rounded bg-[#ec4899]/20 text-[#ec4899]">Exemplos: Caug, Gaug, Daug</span>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              <span className="font-semibold">Como reconhecer:</span> Se o acorde soa "estranho" ou "futurista", é aumentado!
            </p>
          </div>
        </div>
      </Card>

      {/* Dicas Práticas */}
      <Card className="p-6 bg-gradient-to-br from-[#1a1a2e] to-[#16213e] border-white/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-[#f59e0b]/20">
            <Lightbulb className="w-5 h-5 text-[#f59e0b]" />
          </div>
          <h3 className="text-xl font-bold text-white">Dicas para Diferenciar</h3>
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#8b5cf6]/20 flex items-center justify-center text-[#8b5cf6] font-bold text-sm">
              1
            </div>
            <div>
              <p className="text-white font-semibold mb-1">Ouça a Emoção</p>
              <p className="text-sm text-gray-400">
                Maior = Feliz | Menor = Triste | Diminuto = Tenso | Aumentado = Estranho
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#06b6d4]/20 flex items-center justify-center text-[#06b6d4] font-bold text-sm">
              2
            </div>
            <div>
              <p className="text-white font-semibold mb-1">Compare com Músicas Conhecidas</p>
              <p className="text-sm text-gray-400">
                "Parabéns pra Você" começa com acorde Maior. "Asa Branca" usa muitos acordes Menores.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#10b981]/20 flex items-center justify-center text-[#10b981] font-bold text-sm">
              3
            </div>
            <div>
              <p className="text-white font-semibold mb-1">Pratique com o Treino de Ouvido</p>
              <p className="text-sm text-gray-400">
                Use a seção "Treino de Ouvido" do app para treinar sua percepção de acordes!
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
