#!/usr/bin/env python3
"""
Script para processar samples do Philharmonia Orchestra
Gera manifestos JSON para cada instrumento
"""

import os
import json
import wave
from pathlib import Path
from typing import Dict, List

# Diretório base
BASE_DIR = Path(__file__).parent
SAMPLES_DIR = BASE_DIR / "client" / "public" / "samples" / "philharmonia"
OUTPUT_DIR = SAMPLES_DIR

# Mapeamento de nomes de arquivos para notas
# Os samples do Philharmonia seguem padrões como:
# - "violin_A4_15_forte_normal.wav" = Violin, A4, 15s, forte, normal
# - "cello_C3_15_mezzo-forte_normal.wav" = Cello, C3, 15s, mezzo-forte, normal
NOTE_PATTERNS = [
    r'([A-G][#b]?)(\d+)',  # Padrão: C4, A#3, etc.
    r'note_([A-G][#b]?)(\d+)',  # Padrão: note_C4
    r'([A-G][#b]?)(\d+)_',  # Padrão: C4_15_forte
]

def get_audio_duration(file_path: Path) -> float:
    """Obtém a duração de um arquivo de áudio WAV"""
    try:
        with wave.open(str(file_path), 'rb') as wav_file:
            frames = wav_file.getnframes()
            sample_rate = wav_file.getframerate()
            duration = frames / float(sample_rate)
            return round(duration, 2)
    except Exception as e:
        print(f"⚠️ Erro ao ler {file_path}: {e}")
        return 2.0  # Duração padrão

def parse_note_from_filename(filename: str) -> str | None:
    """Extrai o nome da nota do nome do arquivo"""
    import re
    
    # Remover extensão
    name = filename.replace('.wav', '').replace('.WAV', '')
    
    # Tentar diferentes padrões
    patterns = [
        r'([A-G][#b]?)(\d+)',  # C4, A#3, Bb2
        r'note_([A-G][#b]?)(\d+)',  # note_C4
        r'_([A-G][#b]?)(\d+)_',  # _C4_15_forte
    ]
    
    for pattern in patterns:
        match = re.search(pattern, name)
        if match:
            note = match.group(1)
            octave = match.group(2)
            # Normalizar sustenidos/bemóis
            note = note.replace('b', '#').replace('Bb', 'A#').replace('Db', 'C#').replace('Eb', 'D#').replace('Gb', 'F#').replace('Ab', 'G#')
            return f"{note}{octave}"
    
    return None

def process_instrument(instrument_dir: Path) -> Dict[str, Dict]:
    """Processa um diretório de instrumento e retorna o manifesto"""
    manifest = {}
    
    if not instrument_dir.exists():
        print(f"⚠️ Diretório não encontrado: {instrument_dir}")
        return manifest
    
    # Listar todos os arquivos WAV
    wav_files = list(instrument_dir.glob("*.wav")) + list(instrument_dir.glob("*.WAV"))
    
    if not wav_files:
        print(f"⚠️ Nenhum arquivo WAV encontrado em {instrument_dir}")
        return manifest
    
    print(f"📁 Processando {instrument_dir.name}: {len(wav_files)} arquivos")
    
    for wav_file in wav_files:
        # Tentar extrair nota do nome do arquivo
        note_name = parse_note_from_filename(wav_file.name)
        
        if not note_name:
            # Se não conseguir extrair, usar o nome do arquivo sem extensão
            note_name = wav_file.stem
        
        # Obter duração
        duration = get_audio_duration(wav_file)
        
        # Adicionar ao manifesto
        manifest[note_name] = {
            "file": wav_file.name,
            "duration": duration
        }
    
    return manifest

def main():
    """Processa todos os instrumentos do Philharmonia"""
    print("🎼 Processando samples do Philharmonia Orchestra...")
    print("")
    
    if not SAMPLES_DIR.exists():
        print(f"❌ Diretório não encontrado: {SAMPLES_DIR}")
        print("💡 Execute primeiro o script de download!")
        return
    
    # Listar todos os diretórios de instrumentos
    instrument_dirs = [d for d in SAMPLES_DIR.iterdir() if d.is_dir()]
    
    if not instrument_dirs:
        print(f"❌ Nenhum instrumento encontrado em {SAMPLES_DIR}")
        print("💡 Execute primeiro o script de download!")
        return
    
    print(f"📦 Encontrados {len(instrument_dirs)} instrumentos")
    print("")
    
    # Processar cada instrumento
    all_manifests = {}
    
    for instrument_dir in sorted(instrument_dirs):
        manifest = process_instrument(instrument_dir)
        
        if manifest:
            # Salvar manifesto individual
            manifest_path = instrument_dir / "manifest.json"
            with open(manifest_path, 'w', encoding='utf-8') as f:
                json.dump(manifest, f, indent=2, ensure_ascii=False)
            
            all_manifests[instrument_dir.name] = {
                "count": len(manifest),
                "notes": list(manifest.keys())[:10]  # Primeiras 10 notas como exemplo
            }
            
            print(f"  ✅ {instrument_dir.name}: {len(manifest)} notas processadas")
        else:
            print(f"  ⚠️ {instrument_dir.name}: Nenhuma nota encontrada")
        print("")
    
    # Salvar manifesto geral
    general_manifest_path = SAMPLES_DIR / "manifest.json"
    with open(general_manifest_path, 'w', encoding='utf-8') as f:
        json.dump(all_manifests, f, indent=2, ensure_ascii=False)
    
    print("✅ Processamento concluído!")
    print(f"📄 Manifesto geral salvo em: {general_manifest_path}")
    print(f"📊 Total de instrumentos processados: {len(all_manifests)}")

if __name__ == "__main__":
    main()
