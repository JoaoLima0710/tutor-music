import { useEffect, useState } from 'react';

/**
 * Hook for mobile-specific audio optimizations
 * Handles audio context management and mobile PWA issues
 */
export function useMobileAudio() {
  const [isMobile, setIsMobile] = useState(false);
  const [audioContextReady, setAudioContextReady] = useState(false);

  useEffect(() => {
    // Detect mobile device
    const detectMobile = () => {
      if (typeof navigator === 'undefined') return false;

      const userAgent = navigator.userAgent.toLowerCase();
      return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent) ||
             (typeof window !== 'undefined' && window.innerWidth <= 768);
    };

    const mobile = detectMobile();
    setIsMobile(mobile);

    if (mobile) {
      console.log('📱 Mobile device detected, enabling audio optimizations');

      // Handle audio context for mobile browsers
      const handleUserInteraction = async () => {
        try {
          // Resume any suspended audio contexts
          if (typeof AudioContext !== 'undefined') {
            const contexts = [];

            // Try to find and resume audio contexts
            // This helps with mobile browsers that suspend audio contexts
            if (window.AudioContext) {
              try {
                const ctx = new AudioContext();
                if (ctx.state === 'suspended') {
                  await ctx.resume();
                  contexts.push(ctx);
                }
              } catch (e) {
                // Ignore errors
              }
            }

            if (contexts.length > 0) {
              console.log('🔊 Resumed', contexts.length, 'audio contexts');
              setAudioContextReady(true);
            }
          }
        } catch (error) {
          console.warn('⚠️ Could not resume audio contexts:', error);
        }
      };

      // Mobile browsers require user interaction to start audio
      const events = ['touchstart', 'touchend', 'click', 'keydown'];
      let initialized = false;

      const initAudio = () => {
        if (!initialized) {
          initialized = true;
          handleUserInteraction();

          // Remove listeners after first interaction
          events.forEach(event => {
            document.removeEventListener(event, initAudio, true);
          });
        }
      };

      // Add event listeners
      events.forEach(event => {
        document.addEventListener(event, initAudio, { once: false, passive: true });
      });

      // Handle app visibility changes
      const handleVisibilityChange = () => {
        if (document.hidden) {
          console.log('📱 App backgrounded - audio may be suspended');
        } else {
          console.log('📱 App foregrounded - attempting audio resume');
          handleUserInteraction();
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);

      // Cleanup
      return () => {
        events.forEach(event => {
          document.removeEventListener(event, initAudio, true);
        });
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, []);

  /**
   * Force audio context resume (useful for manual triggers)
   */
  const forceAudioResume = async () => {
    if (!isMobile) return true;

    try {
      if (typeof AudioContext !== 'undefined') {
        const ctx = new AudioContext();
        if (ctx.state === 'suspended') {
          await ctx.resume();
          console.log('🔊 Audio context forcibly resumed');
          setAudioContextReady(true);
          return true;
        }
      }
      setAudioContextReady(true);
      return true;
    } catch (error) {
      console.error('❌ Could not force audio resume:', error);
      return false;
    }
  };

  /**
   * Check if audio should work on this device
   */
  const shouldUseAudio = () => {
    if (!isMobile) return true; // Desktop is fine
    return audioContextReady; // Mobile needs context ready
  };

  return {
    isMobile,
    audioContextReady,
    shouldUseAudio,
    forceAudioResume
  };
}