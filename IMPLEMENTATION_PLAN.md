# 🎸 Plano de Implementação - MusicTutor Completo

## 📋 Funcionalidades a Implementar

### ✅ Fase 1: Sistema de Áudio (Prioridade ALTA)
**Objetivo:** Permitir que usuários ouçam acordes e escalas

#### 1.1 Instalação de Dependências
- [ ] Instalar Tone.js (`pnpm add tone`)
- [ ] Criar service de áudio (`AudioService.ts`)

#### 1.2 Síntese de Acordes
- [ ] Criar função para gerar notas de acordes
- [ ] Implementar player de acordes com Tone.js
- [ ] Adicionar controles (play, stop, volume)
- [ ] Integrar com página de Acordes

#### 1.3 Síntese de Escalas
- [ ] Criar função para gerar sequências de escalas
- [ ] Implementar player de escalas
- [ ] Adicionar padrões (ascendente, descendente, terças)
- [ ] Integrar com página de Escalas

---

### ✅ Fase 2: Módulo de Músicas (Prioridade ALTA)
**Objetivo:** Biblioteca de 50+ músicas brasileiras com cifras

#### 2.1 Banco de Dados de Músicas
- [ ] Criar `songs.ts` com 50+ músicas brasileiras
- [ ] Estrutura: título, artista, gênero, dificuldade, cifra, letra, acordes
- [ ] Categorias: MPB, Bossa Nova, Samba, Rock Nacional, Sertanejo

#### 2.2 Componentes de Músicas
- [ ] `SongCard.tsx` - Card de música
- [ ] `SongDetail.tsx` - Página de detalhes
- [ ] `ChordSheet.tsx` - Cifra com letra sincronizada
- [ ] `SongPlayer.tsx` - Player com controles

#### 2.3 Página de Músicas
- [ ] Layout com grid de músicas
- [ ] Filtros (gênero, dificuldade, artista)
- [ ] Busca por nome/artista
- [ ] Sistema de favoritos
- [ ] Integração com gamificação

---

### ✅ Fase 3: Metrônomo e Ferramentas (Prioridade MÉDIA)
**Objetivo:** Ferramentas essenciais para prática

#### 3.1 Metrônomo
- [ ] Criar `Metronome.tsx`
- [ ] Controles: BPM (40-240), time signature (4/4, 3/4, 6/8)
- [ ] Som de clique (Tone.js)
- [ ] Feedback visual (animação de pulso)
- [ ] Tap tempo
- [ ] Presets (Lento, Moderado, Rápido)

#### 3.2 Afinador (Futuro)
- [ ] Pitch detection com Web Audio API
- [ ] Visualização de frequência
- [ ] Indicador de afinação

---

### ✅ Fase 4: ScaleClock e Escalas Avançadas (Prioridade MÉDIA)
**Objetivo:** Visualização avançada de escalas

#### 4.1 ScaleClock
- [ ] Implementar componente `ScaleClock.tsx` (código já criado)
- [ ] Visualização circular interativa
- [ ] Rotação para mudar fundamental
- [ ] Destacar intervalos
- [ ] Integrar com página de Escalas

#### 4.2 ScaleFretboard
- [ ] Criar `ScaleFretboard.tsx`
- [ ] Visualização no braço do violão
- [ ] Posições CAGED
- [ ] Múltiplas posições por escala
- [ ] Navegação entre posições

#### 4.3 Padrões de Prática
- [ ] Implementar padrões (ascendente, descendente, terças, quartas, sequências)
- [ ] Player de padrões
- [ ] Controle de velocidade
- [ ] Loop

---

### ✅ Fase 5: Prática Interativa (Prioridade BAIXA)
**Objetivo:** Sessões guiadas e feedback

#### 5.1 Sessões de Prática
- [ ] Criar `PracticeSession.tsx`
- [ ] Timer de sessão
- [ ] Rotina guiada (aquecimento, técnica, repertório)
- [ ] Histórico de sessões
- [ ] Estatísticas

#### 5.2 Exercícios de Técnica
- [ ] Banco de exercícios técnicos
- [ ] Exercícios de dedilhado
- [ ] Exercícios de ritmo
- [ ] Progressão de dificuldade

#### 5.3 Feedback Visual
- [ ] Indicador de tempo (em sincronia com metrônomo)
- [ ] Barra de progresso de exercício
- [ ] Feedback de acurácia (futuro: pitch detection)

---

### ✅ Fase 6: Features Avançadas (Prioridade BAIXA)
**Objetivo:** Funcionalidades extras

#### 6.1 Progressões de Acordes
- [ ] Criar `ChordProgressions.tsx`
- [ ] Progressões comuns (I-IV-V, ii-V-I, etc)
- [ ] Player de progressões
- [ ] Análise harmônica

#### 6.2 Teoria Musical
- [ ] Página de teoria
- [ ] Lições sobre intervalos, escalas, harmonia
- [ ] Quizzes interativos

#### 6.3 Compartilhamento
- [ ] Compartilhar progresso
- [ ] Exportar estatísticas
- [ ] Leaderboard (requer backend)

---

## 🎯 Ordem de Implementação

### Sprint 1: Áudio (2-3 dias)
1. Instalar Tone.js
2. Criar AudioService
3. Implementar player de acordes
4. Implementar player de escalas
5. Integrar com UI

### Sprint 2: Músicas (3-4 dias)
1. Criar banco de dados de 50+ músicas
2. Criar componentes de músicas
3. Implementar página de músicas
4. Adicionar filtros e busca
5. Sistema de favoritos

### Sprint 3: Metrônomo (1-2 dias)
1. Criar componente Metronome
2. Implementar lógica de BPM
3. Adicionar controles e presets
4. Feedback visual

### Sprint 4: Escalas Avançadas (2-3 dias)
1. Implementar ScaleClock
2. Criar ScaleFretboard
3. Adicionar posições CAGED
4. Padrões de prática

### Sprint 5: Prática Interativa (2-3 dias)
1. Sessões de prática
2. Exercícios técnicos
3. Histórico e estatísticas

### Sprint 6: Features Avançadas (2-3 dias)
1. Progressões de acordes
2. Teoria musical
3. Polimento geral

---

## 📊 Estimativa Total

- **Tempo total:** 12-18 dias de desenvolvimento
- **Linhas de código:** ~5000-7000 linhas adicionais
- **Novos arquivos:** ~30-40 arquivos
- **Dependências:** Tone.js, possivelmente Web Audio API helpers

---

## 🚀 Começar Agora

Vou começar pela **Fase 1: Sistema de Áudio**, pois é a funcionalidade mais crítica e desbloqueia várias outras features.
