#!/bin/bash
# Script para baixar samples do Philharmonia Orchestra
# Executa no Linux/Mac/Git Bash

set -e

# Criar diretório de destino
OUTPUT_DIR="client/public/samples/philharmonia"
mkdir -p "$OUTPUT_DIR"

# URLs dos samples
declare -a SAMPLES=(
    "banjo|http://www.philharmonia.co.uk/assets/audio/samples/banjo/banjo.zip"
    "bass_clarinet|http://www.philharmonia.co.uk/assets/audio/samples/bass%20clarinet/bass%20clarinet.zip"
    "bassoon|http://www.philharmonia.co.uk/assets/audio/samples/bassoon/bassoon.zip"
    "cello|http://www.philharmonia.co.uk/assets/audio/samples/cello/cello.zip"
    "clarinet|http://www.philharmonia.co.uk/assets/audio/samples/clarinet/clarinet.zip"
    "contrabassoon|http://www.philharmonia.co.uk/assets/audio/samples/contrabassoon/contrabassoon.zip"
    "cor_anglais|http://www.philharmonia.co.uk/assets/audio/samples/cor%20anglais/cor%20anglais.zip"
    "double_bass|http://www.philharmonia.co.uk/assets/audio/samples/double%20bass/double%20bass.zip"
    "flute|http://www.philharmonia.co.uk/assets/audio/samples/flute/flute.zip"
    "french_horn|http://www.philharmonia.co.uk/assets/audio/samples/french%20horn/french%20horn.zip"
    "guitar|http://www.philharmonia.co.uk/assets/audio/samples/guitar/guitar.zip"
    "mandolin|http://www.philharmonia.co.uk/assets/audio/samples/mandolin/mandolin.zip"
    "oboe|http://www.philharmonia.co.uk/assets/audio/samples/oboe/oboe.zip"
    "saxophone|http://www.philharmonia.co.uk/assets/audio/samples/saxophone/saxophone.zip"
    "trombone|http://www.philharmonia.co.uk/assets/audio/samples/trombone/trombone.zip"
    "trumpet|http://www.philharmonia.co.uk/assets/audio/samples/trumpet/trumpet.zip"
    "tuba|http://www.philharmonia.co.uk/assets/audio/samples/tuba/tuba.zip"
    "viola|http://www.philharmonia.co.uk/assets/audio/samples/viola/viola.zip"
    "violin|http://www.philharmonia.co.uk/assets/audio/samples/violin/violin.zip"
    "percussion|http://www.philharmonia.co.uk/assets/audio/samples/percussion/percussion.zip"
)

echo "🎵 Baixando samples do Philharmonia Orchestra..."
echo ""

TOTAL=${#SAMPLES[@]}
CURRENT=0

for SAMPLE in "${SAMPLES[@]}"; do
    CURRENT=$((CURRENT + 1))
    NAME=$(echo "$SAMPLE" | cut -d'|' -f1)
    URL=$(echo "$SAMPLE" | cut -d'|' -f2)
    ZIP_PATH="$OUTPUT_DIR/$NAME.zip"
    EXTRACT_PATH="$OUTPUT_DIR/$NAME"
    
    echo "[$CURRENT/$TOTAL] Baixando $NAME..."
    
    # Baixar arquivo
    if wget -q --show-progress -O "$ZIP_PATH" "$URL"; then
        echo "  Extraindo..."
        unzip -q -o "$ZIP_PATH" -d "$EXTRACT_PATH"
        rm "$ZIP_PATH"
        echo "  ✅ $NAME baixado e extraído"
    else
        echo "  ❌ Erro ao baixar $NAME"
    fi
    
    echo ""
done

echo "✅ Download concluído!"
echo "Samples disponíveis em: $OUTPUT_DIR"
