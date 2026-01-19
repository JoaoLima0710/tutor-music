# Extração de Samples do GuitarSet

Este guia explica como extrair samples de áudio de alta qualidade do dataset GuitarSet para uso no aplicativo.

## 📁 Estrutura de Pastas

```
Aprenda-viol-o-com-qualidade/
├── datasets/
│   ├── audio_mono-mic/        # Áudio extraído (360 arquivos .wav)
│   └── annotations/           # Anotações JAMS (360 arquivos .jams)
├── extract_samples.py         # Script para extrair acordes
├── extract_notes.py           # Script para extrair notas individuais
└── client/public/samples/
    ├── chords/                # Samples de acordes (.wav)
    └── notes/                 # Samples de notas (.wav)
```

## 🔧 Pré-requisitos

1. **Python 3.8+** instalado
2. Instalar dependências:

```bash
pip install -r requirements_audio.txt
```

Ou manualmente:

```bash
pip install librosa numpy soundfile jams scipy
```

## 🚀 Como Usar

### 1. Extrair Samples de Acordes

```bash
python extract_samples.py
```

Este script irá:
- Processar todos os 360 arquivos de áudio
- Identificar segmentos de acordes nas anotações JAMS
- Selecionar os melhores samples por qualidade
- Salvar em `client/public/samples/chords/`
- Gerar `manifest.json` com lista de samples

**Acordes extraídos:**
- Maiores: C, D, E, F, G, A, B
- Menores: Cm, Dm, Em, Fm, Gm, Am, Bm
- Sétimas: C7, D7, E7, G7, A7, B7

### 2. Extrair Samples de Notas Individuais

```bash
python extract_notes.py
```

Este script irá:
- Extrair notas individuais usando anotações de pitch
- Mapear notas MIDI para nomes (E2, A2, D3, G3, B3, E4, etc.)
- Salvar em `client/public/samples/notes/`

## 📊 Critérios de Qualidade

Os scripts selecionam samples baseados em:

1. **RMS Energy**: Volume consistente
2. **Clipping**: Evita distorção
3. **Attack**: Prefere samples com ataque claro
4. **Duração**: Mínimo de 2s para acordes, 1.5s para notas

## 🎵 Uso no Frontend

Os samples serão servidos estaticamente pelo Vite em:

```
/samples/chords/C.wav
/samples/chords/D.wav
/samples/notes/E2.wav
/samples/notes/A2.wav
```

O `manifest.json` lista todos os samples disponíveis para carregamento dinâmico.

## ⚠️ Notas Importantes

- O processamento pode levar alguns minutos (360 arquivos)
- Certifique-se de ter espaço em disco (~500MB para samples processados)
- Os samples são normalizados para volume consistente (80% do máximo)
- Fade in/out suave é aplicado para evitar clicks

## 🔍 Troubleshooting

**Erro: "jams not found"**
```bash
pip install jams
```

**Erro: "librosa not found"**
```bash
pip install librosa
```

**Erro: "soundfile not found"**
```bash
# Windows
pip install soundfile

# Se ainda falhar, instale libsndfile:
# https://www.lfd.uci.edu/~gohlke/pythonlibs/#soundfile
```
