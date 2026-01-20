"""
Script para treinar a IA com o dataset GuitarSet
Processa áudio e anotações para melhorar detecção de acordes e feedback
"""

import os
import json
import zipfile
import librosa
import numpy as np
from pathlib import Path
from typing import Dict, List, Tuple
from collections import defaultdict
import jams  # Para ler anotações JAMS do GuitarSet

class GuitarSetTrainer:
    """Treina modelo de IA com dados do GuitarSet"""
    
    def __init__(self, guitarset_path: str, output_dir: str = "training_data"):
        self.guitarset_path = Path(guitarset_path)
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Diretórios de saída
        self.audio_output = self.output_dir / "audio_samples"
        self.features_output = self.output_dir / "features"
        self.model_output = self.output_dir / "models"
        self.metadata_output = self.output_dir / "metadata"
        
        for dir_path in [self.audio_output, self.features_output, self.model_output, self.metadata_output]:
            dir_path.mkdir(parents=True, exist_ok=True)
    
    def extract_zip_files(self):
        """Encontra diretórios extraídos do GuitarSet (sem extrair novamente)"""
        print("[PROCURANDO] Procurando diretorios extraidos do GuitarSet...")
        
        zip_files = [
            "annotation.zip",
            "audio_hex-pickup_debleeded.zip",
            "audio_hex-pickup_original.zip",
            "audio_mono-mic.zip",
            "audio_mono-pickup_mix.zip"
        ]
        
        extracted_dirs = {}
        
        for zip_file in zip_files:
            zip_path = self.guitarset_path / zip_file
            extract_dir = self.guitarset_path / zip_file.replace('.zip', '')
            
            # Verificar se já foi extraído
            if extract_dir.exists() and any(extract_dir.iterdir()):
                print(f"  [OK] Usando diretorio ja extraido: {extract_dir.name}")
                extracted_dirs[zip_file] = extract_dir
            elif zip_path.exists():
                # Tentar extrair apenas se necessário
                try:
                    print(f"  Extraindo {zip_file}...")
                    extract_dir.mkdir(exist_ok=True)
                    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                        zip_ref.extractall(extract_dir)
                    extracted_dirs[zip_file] = extract_dir
                    print(f"  [OK] Extraido com sucesso")
                except Exception as e:
                    print(f"  [AVISO] Erro ao extrair {zip_file}: {e}")
                    print(f"  [INFO] Tentando usar diretorio existente se disponivel...")
            else:
                print(f"  [AVISO] {zip_file} nao encontrado")
        
        return extracted_dirs
    
    def load_annotations(self, annotation_dir: Path) -> Dict:
        """Carrega anotações JAMS do GuitarSet"""
        print("[CARREGANDO] Carregando anotações...")
        
        annotations = {}
        jams_files = list(annotation_dir.glob("*.jams"))
        
        for jams_file in jams_files:
            try:
                jam = jams.load(str(jams_file))
                file_id = jams_file.stem
                annotations[file_id] = jam
            except Exception as e:
                print(f"  [AVISO] Erro ao carregar {jams_file}: {e}")
        
        print(f"  [OK] {len(annotations)} anotações carregadas")
        return annotations
    
    def extract_audio_features(self, audio_path: Path) -> Dict:
        """Extrai features de áudio para treinamento"""
        try:
            # Carregar áudio
            y, sr = librosa.load(str(audio_path), sr=22050, mono=True)
            
            # Features para detecção de acordes
            features = {
                # Chroma (importante para acordes)
                'chroma': librosa.feature.chroma_stft(y=y, sr=sr).mean(axis=1).tolist(),
                
                # MFCC (características timbrais)
                'mfcc': librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13).mean(axis=1).tolist(),
                
                # Tonnetz (relações harmônicas)
                'tonnetz': librosa.feature.tonnetz(y=y, sr=sr).mean(axis=1).tolist(),
                
                # Spectral features
                'spectral_centroid': float(librosa.feature.spectral_centroid(y=y, sr=sr).mean()),
                'spectral_rolloff': float(librosa.feature.spectral_rolloff(y=y, sr=sr).mean()),
                'zero_crossing_rate': float(librosa.feature.zero_crossing_rate(y).mean()),
                
                # RMS energy
                'rms': float(librosa.feature.rms(y=y).mean()),
                
                # Duração
                'duration': len(y) / sr,
                
                # Sample rate
                'sample_rate': sr
            }
            
            return features
        except Exception as e:
            print(f"  [AVISO] Erro ao extrair features de {audio_path}: {e}")
            return None
    
    def process_guitarset(self, audio_dir: Path, annotation_dir: Path):
        """Processa todo o dataset GuitarSet"""
        print("[PROCESSANDO] Processando GuitarSet para treinamento...")
        
        # Carregar anotações
        annotations = self.load_annotations(annotation_dir)
        
        # Processar cada arquivo de áudio
        training_data = []
        audio_files = list(audio_dir.rglob("*.wav"))
        
        print(f"  Encontrados {len(audio_files)} arquivos de áudio")
        
        for audio_file in audio_files:
            # Extrair ID base do arquivo (remover sufixos como _hex_cln, _mic, etc)
            file_stem = audio_file.stem
            # Remover sufixos comuns do GuitarSet
            file_id = file_stem.replace('_hex_cln', '').replace('_hex', '').replace('_mic', '').replace('_mix', '')
            
            # Buscar anotação correspondente
            if file_id not in annotations:
                # Tentar variações do nome
                # Ex: 00_BN1-147-Gb_solo_hex_cln -> 00_BN1-147-Gb_solo
                for ann_id in annotations.keys():
                    if ann_id in file_id or file_id in ann_id:
                        file_id = ann_id
                        break
                else:
                    continue
            
            jam = annotations[file_id]
            
            # Extrair informações do acorde
            chord_annotations = jam.search(namespace='chord')
            
            if not chord_annotations:
                continue
            
            # Pegar o acorde mais frequente na gravação
            chord_counts = defaultdict(int)
            for ann in chord_annotations:
                for obs in ann.data:
                    chord = obs.value
                    chord_counts[chord] += 1
            
            if not chord_counts:
                continue
            
            # Acorde principal
            main_chord = max(chord_counts.items(), key=lambda x: x[1])[0]
            
            # Normalizar nome do acorde (ex: C:maj -> C)
            chord_name = self.normalize_chord_name(main_chord)
            
            # Extrair features
            features = self.extract_audio_features(audio_file)
            if not features:
                continue
            
            # Criar sample de treinamento
            training_sample = {
                'id': file_id,
                'chord': chord_name,
                'chord_original': main_chord,
                'audio_file': str(audio_file),
                'features': features,
                'metadata': {
                    'duration': features['duration'],
                    'sample_rate': features['sample_rate'],
                    'all_chords': list(chord_counts.keys()),
                    'chord_distribution': dict(chord_counts)
                }
            }
            
            training_data.append(training_sample)
            
            if len(training_data) % 50 == 0:
                print(f"  Processados: {len(training_data)} samples")
        
        print(f"[OK] Total: {len(training_data)} samples processados")
        return training_data
    
    def normalize_chord_name(self, chord: str) -> str:
        """Normaliza nome do acorde do GuitarSet para formato simples"""
        # Mapeamento GuitarSet -> Nome simples
        chord_map = {
            'C:maj': 'C', 'D:maj': 'D', 'E:maj': 'E', 'F:maj': 'F',
            'G:maj': 'G', 'A:maj': 'A', 'B:maj': 'B',
            'C#:maj': 'C#', 'D#:maj': 'D#', 'F#:maj': 'F#',
            'G#:maj': 'G#', 'A#:maj': 'A#',
            'C:min': 'Cm', 'D:min': 'Dm', 'E:min': 'Em', 'F:min': 'Fm',
            'G:min': 'Gm', 'A:min': 'Am', 'B:min': 'Bm',
            'C#:min': 'C#m', 'D#:min': 'D#m', 'F#:min': 'F#m',
            'G#:min': 'G#m', 'A#:min': 'A#m',
            'C:7': 'C7', 'D:7': 'D7', 'E:7': 'E7', 'G:7': 'G7',
            'A:7': 'A7', 'B:7': 'B7',
            'C#:7': 'C#7', 'D#:7': 'D#7', 'F#:7': 'F#7', 'A#:7': 'A#7',
            'C:maj7': 'Cmaj7', 'D:maj7': 'Dmaj7', 'E:maj7': 'Emaj7',
            'C:min7': 'Cm7', 'D:min7': 'Dm7', 'E:min7': 'Em7',
        }
        
        return chord_map.get(chord, chord.split(':')[0])
    
    def create_training_dataset(self, training_data: List[Dict]):
        """Cria dataset de treinamento estruturado"""
        print("[CRIANDO] Criando dataset de treinamento...")
        
        # Agrupar por acorde
        chord_groups = defaultdict(list)
        for sample in training_data:
            chord_groups[sample['chord']].append(sample)
        
        # Estatísticas
        stats = {
            'total_samples': len(training_data),
            'unique_chords': len(chord_groups),
            'chord_distribution': {chord: len(samples) for chord, samples in chord_groups.items()},
            'avg_samples_per_chord': len(training_data) / len(chord_groups) if chord_groups else 0
        }
        
        print(f"  [OK] {stats['unique_chords']} acordes únicos")
        print(f"  [OK] Média de {stats['avg_samples_per_chord']:.1f} samples por acorde")
        
        # Salvar dataset completo
        dataset_file = self.metadata_output / "training_dataset.json"
        with open(dataset_file, 'w', encoding='utf-8') as f:
            json.dump({
                'stats': stats,
                'samples': training_data
            }, f, indent=2, ensure_ascii=False)
        
        print(f"  [SALVO] Dataset salvo em: {dataset_file}")
        
        # Salvar features para cada acorde (para uso rápido)
        features_by_chord = {}
        for chord, samples in chord_groups.items():
            features_by_chord[chord] = [s['features'] for s in samples]
        
        features_file = self.features_output / "features_by_chord.json"
        with open(features_file, 'w', encoding='utf-8') as f:
            json.dump(features_by_chord, f, indent=2)
        
        print(f"  [SALVO] Features salvas em: {features_file}")
        
        return stats, features_by_chord
    
    def generate_ai_training_prompts(self, training_data: List[Dict]):
        """Gera prompts de treinamento para a IA baseados nos dados"""
        print("[GERANDO] Gerando prompts de treinamento para IA...")
        
        # Agrupar por acorde
        chord_groups = defaultdict(list)
        for sample in training_data:
            chord_groups[sample['chord']].append(sample)
        
        # Criar exemplos de treinamento
        training_examples = []
        
        for chord, samples in chord_groups.items():
            # Pegar características médias do acorde
            avg_features = self.calculate_average_features(samples)
            
            example = {
                'chord': chord,
                'description': self.generate_chord_description(chord, avg_features),
                'common_errors': self.identify_common_errors(chord, samples),
                'practice_tips': self.generate_practice_tips(chord, avg_features),
                'audio_characteristics': {
                    'typical_duration': np.mean([s['features']['duration'] for s in samples]),
                    'typical_rms': np.mean([s['features']['rms'] for s in samples]),
                    'chroma_profile': avg_features['chroma']
                }
            }
            
            training_examples.append(example)
        
        # Salvar prompts
        prompts_file = self.metadata_output / "ai_training_prompts.json"
        with open(prompts_file, 'w', encoding='utf-8') as f:
            json.dump({
                'examples': training_examples,
                'usage': 'Use estes exemplos para melhorar o sistema de detecção e feedback da IA'
            }, f, indent=2, ensure_ascii=False)
        
        print(f"  [SALVO] Prompts salvos em: {prompts_file}")
        
        return training_examples
    
    def calculate_average_features(self, samples: List[Dict]) -> Dict:
        """Calcula features médias de um grupo de samples"""
        if not samples:
            return {}
        
        features_list = [s['features'] for s in samples]
        
        avg = {
            'chroma': np.mean([f['chroma'] for f in features_list], axis=0).tolist(),
            'mfcc': np.mean([f['mfcc'] for f in features_list], axis=0).tolist(),
            'tonnetz': np.mean([f['tonnetz'] for f in features_list], axis=0).tolist(),
            'spectral_centroid': np.mean([f['spectral_centroid'] for f in features_list]),
            'spectral_rolloff': np.mean([f['spectral_rolloff'] for f in features_list]),
            'zero_crossing_rate': np.mean([f['zero_crossing_rate'] for f in features_list]),
            'rms': np.mean([f['rms'] for f in features_list]),
            'duration': np.mean([f['duration'] for f in features_list])
        }
        
        return avg
    
    def generate_chord_description(self, chord: str, features: Dict) -> str:
        """Gera descrição do acorde baseada nas features"""
        rms = features.get('rms', 0)
        duration = features.get('duration', 0)
        
        description = f"Acorde {chord}: "
        
        if rms > 0.3:
            description += "som forte e claro, "
        elif rms > 0.15:
            description += "som moderado, "
        else:
            description += "som suave, "
        
        if duration > 2.0:
            description += "sustentação longa"
        else:
            description += "ataque rápido"
        
        return description
    
    def identify_common_errors(self, chord: str, samples: List[Dict]) -> List[str]:
        """Identifica erros comuns baseado na variação das features"""
        # Análise de variação pode indicar erros comuns
        errors = []
        
        if len(samples) < 3:
            return errors
        
        # Verificar variação de RMS (pode indicar cordas abafadas)
        rms_values = [s['features']['rms'] for s in samples]
        rms_std = np.std(rms_values)
        
        if rms_std > 0.1:
            errors.append("Variação de volume - algumas cordas podem estar abafadas")
        
        # Verificar variação de chroma (pode indicar notas erradas)
        chroma_values = [s['features']['chroma'] for s in samples]
        chroma_std = np.std(chroma_values, axis=0)
        
        if np.max(chroma_std) > 0.2:
            errors.append("Variação nas notas - verificar posição dos dedos")
        
        return errors
    
    def generate_practice_tips(self, chord: str, features: Dict) -> List[str]:
        """Gera dicas de prática baseadas nas características do acorde"""
        tips = []
        
        rms = features.get('rms', 0)
        
        if rms < 0.15:
            tips.append("Pressione as cordas com mais força para obter som mais claro")
        
        if chord in ['F', 'B', 'Bm']:
            tips.append("Este acorde requer pestana - pratique a técnica de pestana separadamente")
        
        tips.append(f"Pratique o acorde {chord} lentamente, garantindo que todas as cordas soem claramente")
        
        return tips
    
    def run(self):
        """Executa todo o processo de treinamento"""
        print("Iniciando treinamento da IA com GuitarSet...\n")
        
        # 1. Extrair arquivos ZIP
        extracted_dirs = self.extract_zip_files()
        
        # 2. Encontrar diretórios de áudio e anotações
        annotation_dir = None
        audio_dir = None
        
        print(f"[DEBUG] Diretorios encontrados: {list(extracted_dirs.keys())}")
        
        # Buscar anotações
        for zip_name, extract_dir in extracted_dirs.items():
            if 'annotation' in zip_name:
                print(f"[DEBUG] Procurando JAMS em: {extract_dir}")
                jams_files = list(extract_dir.rglob("*.jams"))
                print(f"[DEBUG] Encontrados {len(jams_files)} arquivos JAMS")
                if jams_files:
                    annotation_dir = jams_files[0].parent
                    print(f"[DEBUG] Diretorio de anotacoes: {annotation_dir}")
                    break
        
        # Procurar diretório de áudio (preferir hex-pickup_debleeded que tem mais arquivos)
        audio_priorities = ['audio_hex-pickup_debleeded', 'audio_hex-pickup_original', 'audio_mono-mic']
        for priority in audio_priorities:
            for zip_name, extract_dir in extracted_dirs.items():
                if priority in zip_name:
                    print(f"[DEBUG] Procurando WAV em: {extract_dir}")
                    wav_files = list(extract_dir.rglob("*.wav"))
                    print(f"[DEBUG] Encontrados {len(wav_files)} arquivos WAV")
                    if wav_files:
                        audio_dir = wav_files[0].parent
                        print(f"[DEBUG] Diretorio de audio: {audio_dir}")
                        break
            if audio_dir:
                break
        
        if not annotation_dir:
            print("[ERRO] Nao foi possivel encontrar diretorio de anotacoes")
            print("[DEBUG] Tentando buscar diretamente...")
            annotation_path = self.guitarset_path / "annotation"
            if annotation_path.exists():
                jams_files = list(annotation_path.glob("*.jams"))
                if jams_files:
                    annotation_dir = annotation_path
                    print(f"[OK] Encontrado diretorio de anotacoes: {annotation_dir}")
        
        if not audio_dir:
            print("[ERRO] Nao foi possivel encontrar diretorio de audio")
            print("[DEBUG] Tentando buscar diretamente...")
            # Tentar outros diretórios de áudio
            for audio_subdir in ['audio_mono-mic', 'audio_hex-pickup_debleeded', 'audio_hex-pickup_original']:
                audio_path = self.guitarset_path / audio_subdir
                if audio_path.exists():
                    wav_files = list(audio_path.glob("*.wav"))
                    if wav_files:
                        audio_dir = audio_path
                        print(f"[OK] Encontrado diretorio de audio: {audio_dir}")
                        break
        
        if not annotation_dir or not audio_dir:
            print("[ERRO] Nao foi possivel encontrar diretorios de anotacoes ou audio")
            print(f"[DEBUG] Annotation dir: {annotation_dir}")
            print(f"[DEBUG] Audio dir: {audio_dir}")
            return
        
        print(f"[DIR] Audio: {audio_dir}")
        print(f"[DIR] Anotacoes: {annotation_dir}\n")
        
        # 3. Processar dataset
        training_data = self.process_guitarset(audio_dir, annotation_dir)
        
        if not training_data:
            print("[ERRO] Nenhum dado de treinamento foi gerado")
            return
        
        # 4. Criar dataset estruturado
        stats, features = self.create_training_dataset(training_data)
        
        # 5. Gerar prompts de treinamento para IA
        training_examples = self.generate_ai_training_prompts(training_data)
        
        print("\n[OK] Treinamento concluido!")
        print(f"\n[STATS] Estatisticas:")
        print(f"  - Total de samples: {stats['total_samples']}")
        print(f"  - Acordes unicos: {stats['unique_chords']}")
        print(f"  - Media por acorde: {stats['avg_samples_per_chord']:.1f}")
        print(f"\n[ARQUIVOS] Arquivos gerados em: {self.output_dir}")
        print(f"  - Dataset: {self.metadata_output / 'training_dataset.json'}")
        print(f"  - Features: {self.features_output / 'features_by_chord.json'}")
        print(f"  - Prompts IA: {self.metadata_output / 'ai_training_prompts.json'}")

if __name__ == "__main__":
    # Caminho para o diretório com os ZIPs do GuitarSet
    guitarset_path = r"C:\Users\Joao\Desktop\guitarset_extracted"
    
    trainer = GuitarSetTrainer(guitarset_path)
    trainer.run()
