/**
 * Componente para exibir recomendações de dificuldade adaptativa
 * Mostra conteúdos que precisam revisão ou podem avançar
 */

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAdaptiveDifficultyStore } from '@/stores/useAdaptiveDifficultyStore';
import { AlertCircle, TrendingUp, TrendingDown, BookOpen, Music, Guitar } from 'lucide-react';
import { useLocation } from 'wouter';

export function AdaptiveDifficultyRecommendations() {
  const { getRecommendations } = useAdaptiveDifficultyStore();
  const [, setLocation] = useLocation();
  const { review, advance } = getRecommendations();

  if (review.length === 0 && advance.length === 0) {
    return null;
  }

  const getContentIcon = (contentType: string) => {
    switch (contentType) {
      case 'theory':
        return <BookOpen className="w-4 h-4" />;
      case 'chord':
        return <Guitar className="w-4 h-4" />;
      case 'scale':
        return <Music className="w-4 h-4" />;
      default:
        return <BookOpen className="w-4 h-4" />;
    }
  };

  const getContentName = (contentId: string, contentType: string) => {
    // Simplificado - em produção, buscaria do store apropriado
    return contentId;
  };

  const handleReviewClick = (contentId: string, contentType: string) => {
    if (contentType === 'theory') {
      setLocation(`/theory?module=${contentId}`);
    } else if (contentType === 'chord') {
      setLocation(`/chords?chord=${contentId}`);
    } else if (contentType === 'scale') {
      setLocation(`/scales?scale=${contentId}`);
    }
  };

  const handleAdvanceClick = (contentId: string, contentType: string) => {
    if (contentType === 'theory') {
      setLocation(`/theory?module=${contentId}`);
    } else if (contentType === 'chord') {
      setLocation(`/chords?chord=${contentId}`);
    } else if (contentType === 'scale') {
      setLocation(`/scales?scale=${contentId}`);
    }
  };

  return (
    <div className="space-y-4">
      {/* Revisões Necessárias */}
      {review.length > 0 && (
        <Card className="p-4 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30">
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white">Revisão Recomendada</h3>
            <Badge variant="outline" className="border-amber-500/30 text-amber-400 text-xs">
              {review.length}
            </Badge>
          </div>
          <p className="text-sm text-gray-300 mb-3">
            Você teve dificuldades com estes conteúdos. Recomendamos revisar antes de avançar.
          </p>
          <div className="space-y-2">
            {review.map((item) => (
              <div
                key={`${item.contentType}:${item.contentId}`}
                className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10"
              >
                <div className="flex items-center gap-2">
                  {getContentIcon(item.contentType)}
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {getContentName(item.contentId, item.contentType)}
                    </p>
                    <p className="text-xs text-gray-400">{item.reason}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleReviewClick(item.contentId, item.contentType)}
                  className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30"
                >
                  Revisar
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Avanços Disponíveis */}
      {advance.length > 0 && (
        <Card className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <h3 className="font-bold text-white">Pronto para Avançar</h3>
            <Badge variant="outline" className="border-green-500/30 text-green-400 text-xs">
              {advance.length}
            </Badge>
          </div>
          <p className="text-sm text-gray-300 mb-3">
            Você está dominando estes conteúdos! Pode avançar para dificuldades maiores.
          </p>
          <div className="space-y-2">
            {advance.map((item) => (
              <div
                key={`${item.contentType}:${item.contentId}`}
                className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10"
              >
                <div className="flex items-center gap-2">
                  {getContentIcon(item.contentType)}
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {getContentName(item.contentId, item.contentType)}
                    </p>
                    <p className="text-xs text-gray-400">{item.reason}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleAdvanceClick(item.contentId, item.contentType)}
                  className="bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30"
                >
                  Avançar
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
