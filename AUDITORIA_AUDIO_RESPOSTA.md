# Resposta à Auditoria Técnica de Áudio - MusicTutor

**Data:** Janeiro 2026  
**Status:** 📋 Plano de Ação Criado

## Resumo Executivo

A auditoria técnica identificou **limitações críticas** no sistema de áudio que impactam diretamente a experiência do usuário e a competitividade do MusicTutor. Este documento detalha o plano de ação para evoluir de **Nível 2** (Áudio Funcional com Limitações) para **Nível 4** (Áudio Profissional) em 12 meses.

---

## 🎯 Prioridades Máximas (Implementação Imediata)

### 1. Reduzir Latência para <30ms ✅ IMPLEMENTADO

**Problema:** Latência atual de 50-150ms é inaceitável para performance em tempo real.

**Solução Implementada:**
- ✅ Modo de baixa latência (reduz reverb, chorus, polyphony)
- ✅ Medição de latência real com `LatencyMeasurementService`
- ✅ Configuração em Settings com feedback visual
- ✅ Polyphony reduzido de 32 para 12 em modo de baixa latência
- ✅ Reverb reduzido (decay 0.5s, wet 0.1) em modo de baixa latência
- ✅ Chorus reduzido (depth 0.3, wet 0.05) em modo de baixa latência

**Arquivos Modificados:**
- `client/src/services/AudioService.ts` (modo de baixa latência)
- `client/src/services/UnifiedAudioService.ts` (integração do modo)
- `client/src/services/LatencyMeasurementService.ts` (medição de latência)
- `client/src/stores/useAudioSettingsStore.ts` (configurações de latência)
- `client/src/pages/Settings.tsx` (UI de configuração)

---

### 2. Melhorar Qualidade de Samples ✅ PARCIALMENTE IMPLEMENTADO

**Problema:** Samples MusyngKite são mono, 22 kHz, MP3 64 kbps - qualidade amadora.

**Solução Implementada:**
- ✅ Preload inteligente de samples (C3-C5, ~25 notas mais comuns)
- ✅ Preload em background após inicialização
- ✅ Fallback automático para síntese se samples falharem
- ✅ Timeout de 10s para carregamento de samples
- ✅ Contador de erros para detectar falhas recorrentes
- ✅ **Normalização de volume** - Equaliza volume de cada sample (RMS analysis)
- ✅ Ajuste automático de gain por nota para consistência
- ✅ Cache de ganhos normalizados para performance
- ✅ Configuração em Settings para habilitar/desabilitar
- ⏳ Cachear samples em IndexedDB (próxima etapa)
- 🔄 **Longo Prazo:** Gravar ou licenciar samples profissionais

**Arquivos Modificados:**
- `client/src/services/AudioServiceWithSamples.ts` (preload + fallback)
- `client/src/services/UnifiedAudioService.ts` (fallback automático)

---

### 3. Implementar Feedback Visual em Tempo Real ✅ IMPLEMENTADO

**Problema:** Ausência de visualização de espectro, waveform e histórico de pitch.

**Solução Implementada:**
- ✅ `SpectrumVisualizer.tsx` - Visualização de espectro FFT em tempo real
- ✅ `WaveformVisualizer.tsx` - Visualização de waveform (time-domain)
- ✅ `PitchHistoryChart.tsx` - Gráfico de histórico de pitch (últimos 5 segundos)
- ✅ Integrado no `GuitarTuner` para feedback visual completo
- ✅ Cores dinâmicas baseadas em frequência (azul para graves, vermelho para agudos)
- ✅ Indicador de clipping no waveform

**Arquivos Criados:**
- `client/src/components/audio/SpectrumVisualizer.tsx` ✅
- `client/src/components/audio/WaveformVisualizer.tsx` ✅
- `client/src/components/audio/PitchHistoryChart.tsx` ✅
- `client/src/components/tuner/GuitarTuner.tsx` (integração das visualizações)

---

## 📋 Prioridades Altas (Próximos 3-6 Meses)

### 4. Melhorar Algoritmo de Detecção de Pitch ✅ IMPLEMENTADO

**Solução Implementada:**
- ✅ Algoritmo YIN implementado (mais robusto que autocorrelação básica)
- ✅ Filtro passa-alta a 80 Hz para remover ruído de baixa frequência
- ✅ Thresholds reduzidos (silêncio: 0.002, correlação: 0.75)
- ✅ Fallback para autocorrelação se YIN falhar
- ✅ Validação de range de frequência (80-1000 Hz para violão)
- ✅ Interpolação parabólica para precisão sub-sample

**Arquivos Modificados:**
- `client/src/services/PitchDetectionService.ts` (YIN + filtro + fallback)

---

### 5. Adicionar Cadeia de Efeitos ao AudioServiceWithSamples ✅ IMPLEMENTADO

**Solução Implementada:**
- ✅ Compressor (DynamicsCompressorNode: threshold -20dB, ratio 4:1)
- ✅ EQ paramétrico de 5 bandas (Low Shelf 80Hz, Low Mid 250Hz, Mid 1kHz, High Mid 4kHz, High Shelf 10kHz)
- ✅ Reverb delay-based (2 delays: 30ms e 50ms com feedback)
- ✅ Limiter (DynamicsCompressorNode: threshold -1dB, ratio 20:1)
- ✅ Dry/Wet mix para reverb (80% dry, 20% wet)
- ✅ Master gain control
- ✅ Métodos `setEQ()` e `setReverbAmount()` para controle

**Arquivos Modificados:**
- `client/src/services/AudioServiceWithSamples.ts` (cadeia de efeitos completa)

---

### 6. Implementar Metrônomo Visual ✅ IMPLEMENTADO

**Solução Implementada:**
- ✅ Indicador de pulso (círculo pulsante com animação)
- ✅ Barra de progresso do compasso (atualizada em tempo real)
- ✅ Contador de beats sincronizado (1-4 para 4/4)
- ✅ Indicadores visuais para cada beat do compasso
- ✅ Controle de BPM (40-200)
- ✅ Controle de volume
- ✅ Click sonoro (frequência diferente para downbeat)
- ✅ Suporte a diferentes time signatures (4/4, 3/4, etc.)

**Arquivos Criados:**
- `client/src/components/practice/VisualMetronome.tsx` ✅

---

## 🔄 Prioridades Médias (6-12 Meses)

### 7. Adicionar Backing Tracks

### 8. Implementar Suporte a MIDI

### 9. Detecção Polifônica (Acordes)

### 10. Análise Espectral Avançada

---

## 📊 Métricas de Sucesso

| Métrica | Atual | Meta (12 meses) |
|---------|-------|-----------------|
| **Latência** | 50-150ms | <30ms |
| **Qualidade Samples** | 22 kHz, MP3 64kbps | 44.1 kHz, WAV 24-bit |
| **Precisão Detecção** | ±5-10 cents | ±1-2 cents |
| **Feedback Visual** | Ausente | Espectro + Waveform + Histórico |
| **Nível de Maturidade** | 2/5 | 4/5 |

---

## 🚀 Próximos Passos Imediatos

1. ✅ **Implementar modo de baixa latência** (CONCLUÍDO)
2. ✅ **Adicionar medição de latência** (CONCLUÍDO)
3. ✅ **Melhorar algoritmo de pitch** (CONCLUÍDO - YIN implementado)
4. ✅ **Implementar feedback visual básico** (CONCLUÍDO)
5. ✅ **Cadeia de efeitos no AudioServiceWithSamples** (CONCLUÍDO)
6. ✅ **Metrônomo visual** (CONCLUÍDO)

**Próximas Prioridades:**
- Integrar metrônomo visual nas páginas de prática
- Sincronizar configurações de efeitos entre engines
- Adicionar backing tracks
- Implementar suporte a MIDI

---

**Última Atualização:** Janeiro 2026  
**Status:** Plano de Ação Criado - Aguardando Implementação
