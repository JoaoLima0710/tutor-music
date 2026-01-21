import React, { useEffect, useState } from 'react';
import { useAudio } from '../../hooks/useAudio';
import { Volume2, VolumeX, AlertCircle } from 'lucide-react';

interface AudioInitializerProps {
  children: React.ReactNode;
}

/**
 * Componente que garante inicialização do áudio antes de renderizar children
 */
export function AudioInitializer({ children }: AudioInitializerProps) {
  const { isReady, isInitializing, error, initialize } = useAudio();
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Mostrar prompt se áudio não estiver pronto após 500ms
    const timer = setTimeout(() => {
      if (!isReady) {
        setShowPrompt(true);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [isReady]);

  const handleInitialize = async () => {
    await initialize();
    setShowPrompt(false);
  };

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
            onClick={handleInitialize}
            className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  if (showPrompt && !isReady) {
    return (
      <>
        {children}
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card p-8 rounded-2xl max-w-md text-center shadow-2xl border border-border">
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Volume2 className="w-10 h-10 text-primary animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Ativar Áudio</h2>
            <p className="text-muted-foreground mb-6">
              Para uma experiência completa de aprendizado, precisamos ativar o sistema de áudio.
            </p>
            <button
              onClick={handleInitialize}
              disabled={isInitializing}
              className="w-full px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-xl font-semibold hover:from-violet-600 hover:to-purple-600 transition-all disabled:opacity-50"
            >
              {isInitializing ? 'Inicializando...' : 'Ativar Áudio'}
            </button>
            <button
              onClick={() => setShowPrompt(false)}
              className="mt-3 text-sm text-muted-foreground hover:text-foreground"
            >
              Continuar sem áudio
            </button>
          </div>
        </div>
      </>
    );
  }

  return <>{children}</>;
}

export default AudioInitializer;
