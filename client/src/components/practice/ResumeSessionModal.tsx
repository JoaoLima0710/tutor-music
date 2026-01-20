/**
 * Modal para Retomar Sessão Salva
 * Aparece quando há uma sessão salva para retomar
 */

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Clock, Play, X, RotateCcw } from 'lucide-react';
import { autoSaveService } from '@/services/AutoSaveService';
import { useLocation } from 'wouter';

interface SavedSession {
  id: string;
  session: any;
  timestamp: number;
  page: string;
  lastSaved: number;
}

interface ResumeSessionModalProps {
  session: SavedSession;
  onResume: () => void;
  onDismiss: () => void;
}

export function ResumeSessionModal({ session, onResume, onDismiss }: ResumeSessionModalProps) {
  const [, setLocation] = useLocation();

  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'agora mesmo';
    if (diffMins < 60) return `há ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `há ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    
    return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  const handleResume = () => {
    autoSaveService.resumeSession(session);
    setLocation(session.page);
    onResume();
  };

  const handleStartNew = () => {
    autoSaveService.clearSessions();
    onDismiss();
  };

  return (
    <Dialog open={true} onOpenChange={onDismiss}>
      <DialogContent className="bg-[#1a1a2e] border-white/20 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-purple-400" />
            Retomar Sessão?
          </DialogTitle>
          <DialogDescription className="text-white/70">
            Você tem uma sessão de prática salva que pode ser retomada.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Info da Sessão */}
          <div className="p-4 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Clock className="w-5 h-5 text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white">
                  {session.session.type === 'chord' ? 'Prática de Acordes' :
                   session.session.type === 'scale' ? 'Prática de Escalas' :
                   session.session.type === 'ear-training' ? 'Treino Auditivo' :
                   'Sessão de Prática'}
                </p>
                <p className="text-sm text-white/60">
                  Salva {formatTime(session.lastSaved)}
                </p>
              </div>
            </div>

            {session.session.accuracy && (
              <div className="mt-3 pt-3 border-t border-white/10">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/70">Precisão:</span>
                  <span className="font-semibold text-white">{Math.round(session.session.accuracy)}%</span>
                </div>
                {session.session.duration && (
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-white/70">Duração:</span>
                    <span className="font-semibold text-white">
                      {Math.floor(session.session.duration / 60)} min
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Ações */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleResume}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
            >
              <Play className="w-4 h-4 mr-2" />
              Retomar Sessão
            </Button>
            <Button
              onClick={handleStartNew}
              variant="outline"
              className="flex-1 border-white/20 text-white hover:bg-white/10"
            >
              <X className="w-4 h-4 mr-2" />
              Começar Nova
            </Button>
          </div>

          <p className="text-xs text-white/50 text-center">
            A sessão será salva automaticamente a cada 30 segundos
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
