/**
 * Quick Toggle de Instrumento
 * Dropdown rápido no header para trocar instrumento sem ir em Settings
 */

import { useState, useRef, useEffect } from 'react';
import { Guitar, Piano, Music, Settings, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAudioSettingsStore, type InstrumentType } from '@/stores/useAudioSettingsStore';
import { motion, AnimatePresence } from 'framer-motion';

const INSTRUMENT_OPTIONS: Array<{
  value: InstrumentType;
  label: string;
  icon: React.ReactNode;
  desc: string;
}> = [
    {
      value: 'nylon-guitar',
      label: 'Violão Nylon',
      icon: <Guitar className="w-4 h-4" />,
      desc: 'Som suave'
    },
    {
      value: 'steel-guitar',
      label: 'Violão Aço',
      icon: <Guitar className="w-4 h-4" />,
      desc: 'Som brilhante'
    },
    {
      value: 'piano',
      label: 'Piano',
      icon: <Piano className="w-4 h-4" />,
      desc: 'Som clássico'
    },
    {
      value: 'guitar',
      label: 'Guitarra',
      icon: <Guitar className="w-4 h-4" />,
      desc: 'Som elétrico'
    }
  ];

interface AudioQuickToggleProps {
  className?: string;
  variant?: 'icon' | 'button';
}

export function AudioQuickToggle({ className = '', variant = 'icon' }: AudioQuickToggleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { instrument, setInstrument } = useAudioSettingsStore();

  const currentInstrument = INSTRUMENT_OPTIONS.find(opt => opt.value === instrument) || INSTRUMENT_OPTIONS[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = async (newInstrument: InstrumentType) => {
    // Atualizar store (para UI rápida)
    setInstrument(newInstrument);

    // Atualizar serviço de áudio (para som real)
    try {
      // Importação dinâmica para evitar ciclos se houver
      const { unifiedAudioService } = await import('@/services/UnifiedAudioService');
      await unifiedAudioService.ensureInitialized();
      await unifiedAudioService.setInstrument(newInstrument);
    } catch (error) {
      console.error('❌ Falha ao mudar instrumento:', error);
    }

    setIsOpen(false);
  };

  if (variant === 'button') {
    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        <Button
          onClick={() => setIsOpen(!isOpen)}
          variant="outline"
          className="border-white/20 text-white hover:bg-white/10 flex items-center gap-2"
        >
          {currentInstrument.icon}
          <span className="hidden sm:inline">{currentInstrument.label}</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </Button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 mt-2 w-56 bg-[#1a1a2e] border border-white/20 rounded-lg shadow-xl z-50 overflow-hidden"
            >
              <div className="p-2 space-y-1">
                {INSTRUMENT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSelect(option.value)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${instrument === option.value
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                      }`}
                  >
                    {option.icon}
                    <div className="flex-1">
                      <div className="text-sm font-medium">{option.label}</div>
                      <div className="text-xs text-white/50">{option.desc}</div>
                    </div>
                    {instrument === option.value && (
                      <div className="w-2 h-2 bg-purple-400 rounded-full" />
                    )}
                  </button>
                ))}
              </div>
              <div className="border-t border-white/10 p-2">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    // Navegar para Settings
                    window.location.href = '/settings';
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Mais opções em Configurações
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Variant 'icon' (padrão)
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="ghost"
        size="icon"
        className="text-white hover:bg-white/10 relative"
        title={`Instrumento: ${currentInstrument.label}`}
      >
        {currentInstrument.icon}
        <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full border border-white" />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 -z-10"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute right-0 mt-2 w-56 bg-[#1a1a2e] border border-white/20 rounded-lg shadow-xl z-50 overflow-hidden"
            >
              <div className="p-2 space-y-1">
                {INSTRUMENT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSelect(option.value)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${instrument === option.value
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                      }`}
                  >
                    {option.icon}
                    <div className="flex-1">
                      <div className="text-sm font-medium">{option.label}</div>
                      <div className="text-xs text-white/50">{option.desc}</div>
                    </div>
                    {instrument === option.value && (
                      <div className="w-2 h-2 bg-purple-400 rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
