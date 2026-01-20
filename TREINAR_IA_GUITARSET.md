# 🎸 Como Treinar a IA com o Dataset GuitarSet

Este guia explica como processar o dataset GuitarSet e usar os dados para melhorar o sistema de IA de detecção de acordes e feedback.

## 📋 Pré-requisitos

1. **Python 3.8+** instalado
2. **Bibliotecas Python necessárias:**
   ```bash
   pip install librosa numpy jams soundfile
   ```

3. **Dataset GuitarSet** extraído (arquivo ZIP fornecido)

## 🚀 Passo a Passo

### 1. Preparar o Dataset

O arquivo `3371780.zip` já foi extraído em `C:\Users\Joao\Desktop\guitarset_extracted\`

### 2. Executar o Script de Treinamento

```bash
python train_ai_with_guitarset.py
```

O script irá:
- ✅ Extrair todos os arquivos ZIP do GuitarSet
- ✅ Processar áudio e anotações
- ✅ Extrair features de cada sample (chroma, MFCC, tonnetz, etc.)
- ✅ Criar dataset estruturado para treinamento
- ✅ Gerar prompts de treinamento para a IA

### 3. Arquivos Gerados

Após a execução, você terá em `training_data/`:

```
training_data/
├── metadata/
│   ├── training_dataset.json      # Dataset completo com todos os samples
│   └── ai_training_prompts.json   # Prompts para melhorar a IA
├── features/
│   └── features_by_chord.json     # Features agrupadas por acorde
└── models/                         # (Futuro: modelos treinados)
```

### 4. Integrar com o App

#### 4.1. Copiar dados para o projeto

Copie a pasta `training_data` para o diretório `public/` do projeto:

```bash
# Windows PowerShell
Copy-Item -Recurse training_data public/
```

#### 4.2. O serviço já está criado

O arquivo `client/src/services/GuitarSetAITrainingService.ts` já está pronto para usar os dados.

#### 4.3. Usar no sistema de detecção

O serviço pode ser integrado ao `AIAudioTutorService` para melhorar a detecção:

```typescript
import { guitarSetAITrainingService } from '@/services/GuitarSetAITrainingService';

// Carregar dados de treinamento
await guitarSetAITrainingService.loadTrainingData();

// Usar para melhorar feedback
const feedback = guitarSetAITrainingService.generatePersonalizedFeedback(
  'C',
  detectedFeatures,
  userLevel
);
```

## 📊 O que o Treinamento Melhora

### 1. **Detecção de Acordes Mais Precisa**
- Compara features detectadas com perfis esperados de cada acorde
- Identifica quando o usuário está tocando o acorde correto ou não

### 2. **Feedback Personalizado**
- Usa características típicas de cada acorde para dar conselhos específicos
- Identifica erros comuns baseados em padrões do dataset

### 3. **Análise de Qualidade**
- Compara RMS, chroma, duração com valores esperados
- Sugere correções baseadas em diferenças detectadas

### 4. **Dicas de Prática**
- Gera dicas específicas para cada acorde
- Adapta conselhos ao nível do usuário

## 🔧 Estrutura dos Dados

### Training Dataset
```json
{
  "stats": {
    "total_samples": 1000,
    "unique_chords": 20,
    "avg_samples_per_chord": 50
  },
  "samples": [
    {
      "id": "file_id",
      "chord": "C",
      "features": {
        "chroma": [0.1, 0.2, ...],
        "mfcc": [0.3, 0.4, ...],
        "rms": 0.25,
        "duration": 2.5
      }
    }
  ]
}
```

### AI Training Prompts
```json
{
  "examples": [
    {
      "chord": "C",
      "description": "Acorde C: som forte e claro, sustentação longa",
      "common_errors": [
        "Variação de volume - algumas cordas podem estar abafadas"
      ],
      "practice_tips": [
        "Pratique o acorde C lentamente, garantindo que todas as cordas soem claramente"
      ]
    }
  ]
}
```

## 🎯 Próximos Passos

1. **Executar o script** para processar o dataset
2. **Copiar os dados** para `public/training_data/`
3. **Integrar o serviço** no `AIAudioTutorService`
4. **Testar** a detecção melhorada

## 📝 Notas Importantes

- O processamento pode demorar alguns minutos dependendo do tamanho do dataset
- Certifique-se de ter espaço em disco suficiente
- Os arquivos de áudio originais não são copiados, apenas as features extraídas
- O dataset pode ser atualizado executando o script novamente

## 🐛 Troubleshooting

### Erro: "jams not found"
```bash
pip install jams
```

### Erro: "librosa not found"
```bash
pip install librosa
```

### Erro ao processar arquivos
- Verifique se os arquivos ZIP foram extraídos corretamente
- Certifique-se de que há arquivos `.wav` e `.jams` nos diretórios

## 📚 Referências

- [GuitarSet Dataset](https://zenodo.org/record/3371780)
- [JAMS Format](https://jams.readthedocs.io/)
- [Librosa Documentation](https://librosa.org/)
