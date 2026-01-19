#!/usr/bin/env python3
"""
Prepara dados de treinamento do GuitarSet para o modelo de detecção de acordes.
Processa os arquivos de áudio e anotações JAMS para criar features e labels.
"""

import librosa
import numpy as np
import jams
from pathlib import Path
import json
from collections import defaultdict
import argparse
from tqdm import tqdm

# Mapeamento de acordes do GuitarSet para nosso vocabulário
CHORD_MAPPING = {
    # Maiores
    'C:maj': 'C', 'C#:maj': 'C#', 'D:maj': 'D', 'D#:maj': 'D#',
    'E:maj': 'E', 'F:maj': 'F', 'F#:maj': 'F#', 'G:maj': 'G',
    'G#:maj': 'G#', 'A:maj': 'A', 'A#:maj': 'A#', 'B:maj': 'B',
    # Menores
    'C:min': 'Cm', 'C#:min': 'C#m', 'D:min': 'Dm', 'D#:min': 'D#m',
    'E:min': 'Em', 'F:min': 'Fm', 'F#:min': 'F#m', 'G:min': 'Gm',
    'G#:min': 'G#m', 'A:min': 'Am', 'A#:min': 'A#m', 'B:min': 'Bm',
    # Sétimas
    'C:7': 'C7', 'C#:7': 'C#7', 'D:7': 'D7', 'D#:7': 'D#7',
    'E:7': 'E7', 'F:7': 'F7', 'F#:7': 'F#7', 'G:7': 'G7',
    'G#:7': 'G#7', 'A:7': 'A7', 'A#:7': 'A#7', 'B:7': 'B7',
}

# Vocabulário de acordes (deve corresponder ao do ChordDetectionAIService)
CHORD_VOCAB = [
    'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B',
    'Cm', 'C#m', 'Dm', 'D#m', 'Em', 'Fm', 'F#m', 'Gm', 'G#m', 'Am', 'A#m', 'Bm',
    'C7', 'C#7', 'D7', 'D#7', 'E7', 'F#7', 'G7', 'A7', 'A#7', 'B7',
    'no_chord'
]

def extract_chromagram(audio, sr=22050, hop_length=512, n_fft=2048):
    """Extrai cromagrama do áudio"""
    # Calcular cromagrama usando librosa
    chroma = librosa.feature.chroma_stft(
        y=audio,
        sr=sr,
        hop_length=hop_length,
        n_fft=n_fft
    )
    
    # Transpor para formato [time_steps, 12]
    return chroma.T

def extract_features(audio, sr=22050):
    """Extrai features completas do áudio"""
    hop_length = 512
    n_fft = 2048
    
    # Cromagrama (12 bins - uma para cada nota)
    chroma = librosa.feature.chroma_stft(
        y=audio,
        sr=sr,
        hop_length=hop_length,
        n_fft=n_fft
    )
    
    # RMS Energy
    rms = librosa.feature.rms(y=audio, hop_length=hop_length)[0]
    
    # Spectral Centroid
    spectral_centroid = librosa.feature.spectral_centroid(y=audio, sr=sr, hop_length=hop_length)[0]
    
    # Spectral Rolloff
    spectral_rolloff = librosa.feature.spectral_rolloff(y=audio, sr=sr, hop_length=hop_length)[0]
    
    # Zero Crossing Rate
    zcr = librosa.feature.zero_crossing_rate(audio, hop_length=hop_length)[0]
    
    # Normalizar features
    def normalize(feature):
        if feature.max() > feature.min():
            return (feature - feature.min()) / (feature.max() - feature.min())
        return feature
    
    # Combinar features: [time_steps, 12 (chroma) + 4 (outras)]
    time_steps = chroma.shape[1]
    features = np.zeros((time_steps, 16))
    
    # Preencher chroma (12 features)
    features[:, :12] = chroma.T
    
    # Preencher outras features (normalizadas e interpoladas)
    features[:, 12] = normalize(rms)[:time_steps] if len(rms) >= time_steps else np.pad(normalize(rms), (0, time_steps - len(rms)), 'constant')[:time_steps]
    features[:, 13] = normalize(spectral_centroid)[:time_steps] if len(spectral_centroid) >= time_steps else np.pad(normalize(spectral_centroid), (0, time_steps - len(spectral_centroid)), 'constant')[:time_steps]
    features[:, 14] = normalize(spectral_rolloff)[:time_steps] if len(spectral_rolloff) >= time_steps else np.pad(normalize(spectral_rolloff), (0, time_steps - len(spectral_rolloff)), 'constant')[:time_steps]
    features[:, 15] = normalize(zcr)[:time_steps] if len(zcr) >= time_steps else np.pad(normalize(zcr), (0, time_steps - len(zcr)), 'constant')[:time_steps]
    
    return features

def process_guitarset_dataset(audio_dir, annot_dir, output_file, min_duration=1.0, max_duration=3.0):
    """Processa dataset GuitarSet e cria arquivo de treinamento"""
    
    audio_dir = Path(audio_dir)
    annot_dir = Path(annot_dir)
    output_file = Path(output_file)
    
    # Criar diretório de saída
    output_file.parent.mkdir(parents=True, exist_ok=True)
    
    print(f"🎸 Processando GuitarSet...")
    print(f"   Áudio: {audio_dir}")
    print(f"   Anotações: {annot_dir}")
    print(f"   Saída: {output_file}")
    
    # Coletar todos os arquivos
    audio_files = list(audio_dir.glob("*.wav"))
    print(f"   Encontrados {len(audio_files)} arquivos de áudio")
    
    # Processar cada arquivo
    all_features = []
    all_labels = []
    all_metadata = []
    
    chord_stats = defaultdict(int)
    skipped = 0
    
    for audio_file in tqdm(audio_files, desc="Processando"):
        try:
            # Carregar anotação JAMS
            stem_name = audio_file.stem.replace('_mic', '')
            jams_path = annot_dir / f"{stem_name}.jams"
            
            if not jams_path.exists():
                skipped += 1
                continue
            
            jam = jams.load(str(jams_path))
            chord_ann = jam.search(namespace='chord')
            
            if not chord_ann:
                skipped += 1
                continue
            
            # Carregar áudio
            audio, sr = librosa.load(audio_file, sr=22050, mono=True)
            
            # Processar cada segmento de acorde
            for ann in chord_ann:
                for obs in ann.data:
                    chord_jams = obs.value
                    
                    # Mapear acorde
                    if chord_jams not in CHORD_MAPPING:
                        continue
                    
                    chord = CHORD_MAPPING[chord_jams]
                    
                    # Verificar duração
                    duration = obs.duration
                    if duration < min_duration or duration > max_duration:
                        continue
                    
                    # Extrair segmento de áudio
                    start_sample = int(obs.time * sr)
                    end_sample = int((obs.time + duration) * sr)
                    
                    if end_sample > len(audio):
                        continue
                    
                    segment = audio[start_sample:end_sample]
                    
                    # Extrair features
                    features = extract_features(segment, sr)
                    
                    # Pad ou truncate para tamanho fixo (100 time steps = ~2.3s)
                    target_time_steps = 100
                    if features.shape[0] < target_time_steps:
                        # Pad com zeros
                        padding = np.zeros((target_time_steps - features.shape[0], features.shape[1]))
                        features = np.vstack([features, padding])
                    elif features.shape[0] > target_time_steps:
                        # Truncate
                        features = features[:target_time_steps]
                    
                    # Obter label (índice do acorde no vocabulário)
                    if chord not in CHORD_VOCAB:
                        continue
                    
                    label = CHORD_VOCAB.index(chord)
                    
                    # Adicionar aos dados
                    all_features.append(features)
                    all_labels.append(label)
                    all_metadata.append({
                        'file': audio_file.name,
                        'chord': chord,
                        'time': obs.time,
                        'duration': duration
                    })
                    
                    chord_stats[chord] += 1
                    
        except Exception as e:
            print(f"⚠️ Erro processando {audio_file.name}: {e}")
            skipped += 1
            continue
    
    # Converter para arrays numpy
    X = np.array(all_features, dtype=np.float32)
    y = np.array(all_labels, dtype=np.int32)
    chord_vocab = np.array(CHORD_VOCAB, dtype=object)
    
    print(f"\n✅ Processamento concluído!")
    print(f"   Total de amostras: {len(X)}")
    print(f"   Shape dos features: {X.shape}")
    print(f"   Acordes processados:")
    for chord, count in sorted(chord_stats.items(), key=lambda x: -x[1])[:20]:
        print(f"      {chord}: {count}")
    
    if skipped > 0:
        print(f"   ⚠️ {skipped} arquivos pulados")
    
    # Salvar dados
    print(f"\n💾 Salvando dados em {output_file}...")
    np.savez_compressed(
        output_file,
        X=X,
        y=y,
        chord_vocab=chord_vocab,
        metadata=all_metadata
    )
    
    print(f"✅ Dados salvos com sucesso!")
    print(f"   Tamanho do arquivo: {output_file.stat().st_size / (1024*1024):.2f} MB")
    
    return X, y, chord_vocab

def main():
    parser = argparse.ArgumentParser(description='Prepara dados de treinamento do GuitarSet')
    parser.add_argument('--audio-dir', default='datasets/audio_mono-mic',
                       help='Diretório com arquivos de áudio')
    parser.add_argument('--annot-dir', default='datasets/annotations',
                       help='Diretório com anotações JAMS')
    parser.add_argument('--output', default='datasets/processed/training_data.npz',
                       help='Arquivo de saída')
    parser.add_argument('--min-duration', type=float, default=1.0,
                       help='Duração mínima do segmento (segundos)')
    parser.add_argument('--max-duration', type=float, default=3.0,
                       help='Duração máxima do segmento (segundos)')
    
    args = parser.parse_args()
    
    print("🎸 MusicTutor - Preparação de Dados de Treinamento")
    print("=" * 50)
    
    try:
        X, y, chord_vocab = process_guitarset_dataset(
            args.audio_dir,
            args.annot_dir,
            args.output,
            args.min_duration,
            args.max_duration
        )
        
        print("\n📊 Estatísticas:")
        print(f"   Features shape: {X.shape}")
        print(f"   Labels shape: {y.shape}")
        print(f"   Vocabulário: {len(chord_vocab)} acordes")
        print(f"   Distribuição de classes:")
        
        unique, counts = np.unique(y, return_counts=True)
        for idx, count in zip(unique, counts):
            chord_name = chord_vocab[idx]
            print(f"      {chord_name}: {count} amostras")
        
        print(f"\n✅ Pronto para treinamento!")
        print(f"   Execute: python train_model.py --data {args.output}")
        
    except Exception as e:
        print(f"❌ Erro: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
