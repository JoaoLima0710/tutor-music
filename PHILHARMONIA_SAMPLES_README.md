# 🎼 Samples do Philharmonia Orchestra

Este guia explica como baixar e integrar os samples de instrumentos orquestrais do Philharmonia Orchestra.

## 📥 Download dos Samples

### Windows (PowerShell)
```powershell
.\download_philharmonia_samples.ps1
```

### Linux/Mac/Git Bash
```bash
chmod +x download_philharmonia_samples.sh
./download_philharmonia_samples.sh
```

### Manual (wget/curl)
```bash
# Baixar todos os samples
wget http://www.philharmonia.co.uk/assets/audio/samples/banjo/banjo.zip
wget http://www.philharmonia.co.uk/assets/audio/samples/bass%20clarinet/bass%20clarinet.zip
wget http://www.philharmonia.co.uk/assets/audio/samples/bassoon/bassoon.zip
wget http://www.philharmonia.co.uk/assets/audio/samples/cello/cello.zip
wget http://www.philharmonia.co.uk/assets/audio/samples/clarinet/clarinet.zip
wget http://www.philharmonia.co.uk/assets/audio/samples/contrabassoon/contrabassoon.zip
wget http://www.philharmonia.co.uk/assets/audio/samples/cor%20anglais/cor%20anglais.zip
wget http://www.philharmonia.co.uk/assets/audio/samples/double%20bass/double%20bass.zip
wget http://www.philharmonia.co.uk/assets/audio/samples/flute/flute.zip
wget http://www.philharmonia.co.uk/assets/audio/samples/french%20horn/french%20horn.zip
wget http://www.philharmonia.co.uk/assets/audio/samples/guitar/guitar.zip
wget http://www.philharmonia.co.uk/assets/audio/samples/mandolin/mandolin.zip
wget http://www.philharmonia.co.uk/assets/audio/samples/oboe/oboe.zip
wget http://www.philharmonia.co.uk/assets/audio/samples/saxophone/saxophone.zip
wget http://www.philharmonia.co.uk/assets/audio/samples/trombone/trombone.zip
wget http://www.philharmonia.co.uk/assets/audio/samples/trumpet/trumpet.zip
wget http://www.philharmonia.co.uk/assets/audio/samples/tuba/tuba.zip
wget http://www.philharmonia.co.uk/assets/audio/samples/viola/viola.zip
wget http://www.philharmonia.co.uk/assets/audio/samples/violin/violin.zip
wget http://www.philharmonia.co.uk/assets/audio/samples/percussion/percussion.zip
```

## 📁 Estrutura de Pastas

Após o download, os samples serão organizados em:

```
client/public/samples/philharmonia/
├── banjo/
├── bass_clarinet/
├── bassoon/
├── cello/
├── clarinet/
├── contrabassoon/
├── cor_anglais/
├── double_bass/
├── flute/
├── french_horn/
├── guitar/
├── mandolin/
├── oboe/
├── saxophone/
├── trombone/
├── trumpet/
├── tuba/
├── viola/
├── violin/
└── percussion/
```

## 🎵 Instrumentos Disponíveis

- **Cordas**: Violin, Viola, Cello, Double Bass
- **Madeiras**: Flute, Oboe, Clarinet, Bass Clarinet, Saxophone, Bassoon, Contrabassoon, Cor Anglais
- **Metais**: Trumpet, French Horn, Trombone, Tuba
- **Outros**: Guitar, Mandolin, Banjo, Percussion

## 🔧 Próximos Passos

1. Processar os samples para criar manifestos JSON
2. Integrar com o sistema de áudio existente
3. Adicionar opções de instrumentos nas configurações

## 📝 Notas

- Os samples são fornecidos gratuitamente pelo Philharmonia Orchestra
- Formato: WAV de alta qualidade
- Cada instrumento contém múltiplas notas e dinâmicas
- Total estimado: ~500MB+ de samples
