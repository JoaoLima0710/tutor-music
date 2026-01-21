import React from 'react';
import { useTuner } from '../../hooks/useTuner';
import { Mic, MicOff, Check, ArrowUp, ArrowDown } from 'lucide-react';

export function TunerDisplay() {
  const { state, toggle, tuningDirection, tuningAccuracy } = useTuner();

  const getIndicatorColor = () => {
    if (!state.note) return 'bg-muted';
    if (state.isInTune) return 'bg-green-500';
    if (Math.abs(state.cents) < 15) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getDirectionIcon = () => {
    if (!tuningDirection || tuningDirection === 'ok') return null;
    return tuningDirection === 'up' ? (
      <ArrowUp className="w-8 h-8 text-yellow-500 animate-bounce" />
    ) : (
      <ArrowDown className="w-8 h-8 text-yellow-500 animate-bounce" />
    );
  };

  return (
    <div className="bg-card rounded-2xl p-6 border border-border">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        🎸 Afinador
      </h3>

      {/* Tuner Display */}
      <div className="relative">
        {/* Cents Meter */}
        <div className="relative h-3 bg-muted rounded-full mb-6 overflow-hidden">
          {/* Center marker */}
          <div className="absolute left-1/2 top-0 w-0.5 h-full bg-green-500 -translate-x-1/2 z-10" />
          
          {/* Cents indicator */}
          {state.note && (
            <div
              className={`absolute top-0 w-3 h-full rounded-full transition-all duration-100 ${getIndicatorColor()}`}
              style={{
                left: `calc(50% + ${(state.cents / 50) * 50}% - 6px)`,
              }}
            />
          )}
        </div>

        {/* Labels */}
        <div className="flex justify-between text-xs text-muted-foreground mb-6">
          <span>♭ Grave</span>
          <span>Afinado</span>
          <span>Agudo ♯</span>
        </div>

        {/* Note Display */}
        <div className="text-center mb-6">
          {state.note ? (
            <>
              <div className="flex items-center justify-center gap-2">
                {getDirectionIcon()}
                <span className="text-6xl font-bold">{state.note}</span>
                <span className="text-2xl text-muted-foreground">{state.octave}</span>
                {state.isInTune && <Check className="w-8 h-8 text-green-500" />}
              </div>
              <div className={`text-lg mt-2 ${state.isInTune ? 'text-green-500' : 'text-muted-foreground'}`}>
                {state.cents > 0 ? '+' : ''}{state.cents} cents
              </div>
              {state.frequency && (
                <div className="text-sm text-muted-foreground">
                  {state.frequency.toFixed(1)} Hz
                </div>
              )}
            </>
          ) : (
            <div className="text-muted-foreground">
              {state.isListening ? 'Toque uma corda...' : 'Clique para iniciar'}
            </div>
          )}
        </div>

        {/* Accuracy Bar */}
        {state.note && (
          <div className="mb-6">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Precisão</span>
              <span>{tuningAccuracy}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  tuningAccuracy > 80 ? 'bg-green-500' :
                  tuningAccuracy > 50 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${tuningAccuracy}%` }}
              />
            </div>
          </div>
        )}

        {/* String Reference */}
        <div className="grid grid-cols-6 gap-2 mb-6">
          {[6, 5, 4, 3, 2, 1].map((stringNum) => {
            const stringData = {
              6: { note: 'E', freq: '82 Hz' },
              5: { note: 'A', freq: '110 Hz' },
              4: { note: 'D', freq: '147 Hz' },
              3: { note: 'G', freq: '196 Hz' },
              2: { note: 'B', freq: '247 Hz' },
              1: { note: 'E', freq: '330 Hz' },
            }[stringNum]!;

            const isActive = state.note === stringData.note;

            return (
              <div
                key={stringNum}
                className={`text-center p-2 rounded-lg transition-all ${
                  isActive 
                    ? state.isInTune 
                      ? 'bg-green-500/20 border-green-500'
                      : 'bg-primary/20 border-primary'
                    : 'bg-muted'
                } border`}
              >
                <div className="text-xs text-muted-foreground">{stringNum}ª</div>
                <div className={`font-bold ${isActive ? 'text-primary' : ''}`}>
                  {stringData.note}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Toggle Button */}
      <button
        onClick={toggle}
        className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
          state.isListening
            ? 'bg-red-500 hover:bg-red-600 text-white'
            : 'bg-primary hover:bg-primary/90 text-white'
        }`}
      >
        {state.isListening ? (
          <>
            <MicOff className="w-5 h-5" />
            Parar
          </>
        ) : (
          <>
            <Mic className="w-5 h-5" />
            Iniciar Afinador
          </>
        )}
      </button>
    </div>
  );
}

export default TunerDisplay;
