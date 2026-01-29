import React, { useEffect, useState } from 'react';
import { useAudio } from '../../hooks/useAudio';
import { Volume2, VolumeX, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AudioInitializerProps {
  children: React.ReactNode;
}

/**
 * Botão simples para inicializar o sistema de áudio
 */
export function AudioInitButton() {
  const { isReady, isInitializing, error, initialize } = useAudio();

  const handleClick = async () => {
    if (!isReady && !isInitializing) {
      await initialize();
    }
  };

  if (isReady) {
    // Mostrar indicador visual quando áudio está pronto (para testes)
    return (
      <div data-testid="audio-playing" className="fixed top-4 left-4 z-50">
        <div className="bg-green-500/20 border border-green-500/50 rounded-lg px-3 py-1 text-xs text-green-400">
          🔊 Áudio Ativo
        </div>
      </div>
    );
  }

  return (
    <Button
      onClick={handleClick}
      disabled={isInitializing}
      variant="outline"
      size="sm"
      className="bg-background/80 backdrop-blur-sm border-white/20 hover:bg-background/90"
      title={isInitializing ? 'Inicializando áudio...' : 'Inicializar sistema de áudio'}
    >
      {isInitializing ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          <span>Inicializando...</span>
        </>
      ) : error ? (
        <>
          <AlertCircle className="w-4 h-4 mr-2 text-red-400" />
          <span>Erro de Áudio</span>
        </>
      ) : (
        <>
          <Volume2 className="w-4 h-4 mr-2" />
          <span>Ativar Áudio</span>
        </>
      )}
    </Button>
  );
}

/**
 * Componente que garante inicialização do áudio antes de renderizar children
 */
export function AudioInitializer({ children }: AudioInitializerProps) {
  const { isReady, isInitializing, error, initialize } = useAudio();
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Tentar inicializar silenciosamente em qualquer interação do usuário
    const handleGlobalInteraction = async () => {
      if (!isReady && !isInitializing) {
        try {
          // Tentar retomar/inicializar o contexto
          await initialize();
        } catch (e) {
          // Falha silenciosa, tentará novamente na próxima interação
          console.debug('Silent audio init failed, waiting for next interaction');
        }
      }
    };

    // Registrar listeners globais para "destravar" o áudio na primeira interação
    window.addEventListener('click', handleGlobalInteraction, { capture: true, once: true });
    window.addEventListener('keydown', handleGlobalInteraction, { capture: true, once: true });
    window.addEventListener('touchstart', handleGlobalInteraction, { capture: true, once: true });

    return () => {
      window.removeEventListener('click', handleGlobalInteraction, { capture: true });
      window.removeEventListener('keydown', handleGlobalInteraction, { capture: true });
      window.removeEventListener('touchstart', handleGlobalInteraction, { capture: true });
    };
  }, [isReady, isInitializing, initialize]);

  // Se houver erro crítico, mostrar
  if (error) {
    return (
      <div className="fixed inset-0 bg-background/90 flex items-center justify-center z-50">
        <div className="bg-card p-6 rounded-xl max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Erro de Áudio</h2>
          <p className="text-muted-foreground mb-4">
            Não foi possível inicializar o sistema de áudio.
            Verifique se seu navegador suporta Web Audio API.
          </p>
          <p className="text-sm text-red-400">{error.message}</p>
          <button
            onClick={() => initialize()}
            className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  // Renderizar children normalmente - o áudio inicializará no primeiro clique
  return <>{children}</>;
}

export default AudioInitializer;
