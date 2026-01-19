import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, RefreshCw, Download } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';
import { motion, AnimatePresence } from 'framer-motion';

const DISMISSED_UPDATE_KEY = 'musictutor_update_dismissed';

export function UpdateBanner() {
  const { updateAvailable, checkForUpdates, registration } = usePWA();
  const [isVisible, setIsVisible] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [dismissedVersion, setDismissedVersion] = useState<string | null>(null);

  useEffect(() => {
    // Verificar se o usuário já dispensou esta atualização
    const dismissed = localStorage.getItem(DISMISSED_UPDATE_KEY);
    setDismissedVersion(dismissed);

    // Mostrar banner se houver atualização e não foi dispensada
    if (updateAvailable && dismissed !== 'true') {
      console.log('[UpdateBanner] Mostrando banner de atualização');
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [updateAvailable]);

  // Verificar atualizações periodicamente (a cada 5 minutos)
  useEffect(() => {
    const interval = setInterval(() => {
      if (registration) {
        registration.update().catch(console.error);
      }
    }, 5 * 60 * 1000); // 5 minutos

    return () => clearInterval(interval);
  }, [registration]);

  const handleUpdate = async () => {
    setIsUpdating(true);
    
    try {
      // Enviar mensagem para o service worker para ativar a nova versão
      if (registration?.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }

      // Aguardar um pouco para o service worker processar
      await new Promise(resolve => setTimeout(resolve, 500));

      // Recarregar a página para aplicar a atualização
      window.location.reload();
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      setIsUpdating(false);
      // Fallback: recarregar mesmo assim
      window.location.reload();
    }
  };

  const handleDismiss = () => {
    // Salvar no localStorage que o usuário dispensou
    localStorage.setItem(DISMISSED_UPDATE_KEY, 'true');
    setIsVisible(false);
    
    // Limpar após 24 horas (opcional)
    setTimeout(() => {
      localStorage.removeItem(DISMISSED_UPDATE_KEY);
    }, 24 * 60 * 60 * 1000);
  };

  const handleCheckForUpdates = async () => {
    await checkForUpdates();
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 shadow-lg border-b border-white/20"
        >
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              {/* Conteúdo */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Download className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm sm:text-base">
                    Nova versão disponível! 🎉
                  </p>
                  <p className="text-white/80 text-xs sm:text-sm truncate">
                    Atualize para ter acesso às últimas melhorias e correções
                  </p>
                </div>
              </div>

              {/* Botões */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  onClick={handleCheckForUpdates}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 hidden sm:flex"
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Verificar
                </Button>
                <Button
                  onClick={handleUpdate}
                  disabled={isUpdating}
                  size="sm"
                  className="bg-white text-purple-600 hover:bg-white/90 font-semibold shadow-lg"
                >
                  {isUpdating ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                      Atualizando...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-1" />
                      Atualizar Agora
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleDismiss}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 p-2"
                  aria-label="Fechar"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
