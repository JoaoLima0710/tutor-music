import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface PWAInstallPrompt extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop';
  platform: 'ios' | 'android' | 'windows' | 'mac' | 'linux' | 'unknown';
  isPWA: boolean;
  supportsPWA: boolean;
}

export function usePWA() {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<PWAInstallPrompt | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    type: 'desktop',
    platform: 'unknown',
    isPWA: false,
    supportsPWA: false
  });

  useEffect(() => {
    // Detect device information
    const detectDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

      // Detect platform
      let platform: DeviceInfo['platform'] = 'unknown';
      if (userAgent.includes('android')) {
        platform = 'android';
      } else if (userAgent.includes('iphone') || userAgent.includes('ipad') || userAgent.includes('ipod')) {
        platform = 'ios';
      } else if (userAgent.includes('windows')) {
        platform = 'windows';
      } else if (userAgent.includes('mac')) {
        platform = 'mac';
      } else if (userAgent.includes('linux')) {
        platform = 'linux';
      }

      // Detect device type
      let type: DeviceInfo['type'] = 'desktop';
      const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      const isTablet = /ipad|android(?!.*mobile)/i.test(userAgent);

      if (isTablet) {
        type = 'tablet';
      } else if (isMobile) {
        type = 'mobile';
      }

      // Check PWA support
      const supportsPWA = 'serviceWorker' in navigator && 'BeforeInstallPromptEvent' in window;

      setDeviceInfo({
        type,
        platform,
        isPWA: isStandalone,
        supportsPWA
      });

      return isStandalone;
    };

    // Check if already installed
    if (detectDevice()) {
      setIsInstalled(true);
    }

    // Register Service Worker
    if ('serviceWorker' in navigator) {
      registerServiceWorker();
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as PWAInstallPrompt);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for successful installation
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setIsInstallable(false);
      toast.success('MusicTutor instalado com sucesso! 🎸', {
        description: 'Agora você pode acessar o app direto da tela inicial',
      });
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const registerServiceWorker = async () => {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      setRegistration(reg);

      // Check for updates on load
      reg.update();

      // Verificar se já há um service worker waiting (atualização pendente)
      if (reg.waiting) {
        console.log('[PWA] Service worker waiting encontrado - atualização disponível');
        setUpdateAvailable(true);
      }

      // Listen for updates
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // New version available
                console.log('[PWA] Nova versão instalada e disponível');
                setUpdateAvailable(true);
                showUpdateNotification(newWorker);
              } else {
                // First install
                console.log('[PWA] Service worker instalado pela primeira vez');
              }
            }
          });
        }
      });

      // Listen for controller change (new SW activated)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });

      console.log('[PWA] Service Worker registered successfully');
    } catch (error) {
      console.error('[PWA] Service Worker registration failed:', error);
    }
  };

  const showUpdateNotification = (newWorker: ServiceWorker) => {
    // Não mostrar toast, o banner vai cuidar disso
    // O banner é mais visível e persistente
    console.log('[PWA] Nova versão disponível, banner será exibido');
  };

  const installApp = async () => {
    if (!installPrompt) {
      return;
    }

    try {
      await installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;

      if (outcome === 'accepted') {
        console.log('[PWA] User accepted installation');
      } else {
        console.log('[PWA] User dismissed installation');
      }

      setInstallPrompt(null);
      setIsInstallable(false);
    } catch (error) {
      console.error('[PWA] Installation failed:', error);
    }
  };

  const checkForUpdates = async () => {
    if (registration) {
      try {
        console.log('[PWA] Verificando atualizações...');
        await registration.update();
        
        // Verificar se há um service worker waiting
        if (registration.waiting) {
          console.log('[PWA] Atualização encontrada!');
          setUpdateAvailable(true);
          toast.success('Atualização encontrada!', {
            description: 'Uma nova versão está disponível',
          });
        } else {
          console.log('[PWA] Nenhuma atualização disponível');
          // Verificar novamente após um delay
          setTimeout(() => {
            if (!registration.waiting) {
              toast.info('Você está usando a versão mais recente', {
                description: 'Não há atualizações disponíveis',
              });
            }
          }, 1000);
        }
      } catch (error) {
        console.error('[PWA] Update check failed:', error);
        toast.error('Erro ao verificar atualizações', {
          description: 'Tente novamente mais tarde',
        });
      }
    } else {
      // Se não há registration, tentar registrar novamente
      console.log('[PWA] Tentando registrar service worker...');
      await registerServiceWorker();
      toast.info('Verificando atualizações...', {
        description: 'Aguarde um momento',
      });
    }
  };

  return {
    isInstallable,
    isInstalled,
    updateAvailable,
    installApp,
    checkForUpdates,
    deviceInfo,
    registration, // Expor registration para o UpdateBanner
  };
}
