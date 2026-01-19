"""
Extrai samples limpos de acordes do GuitarSet para uso no app.
"""
import librosa
import numpy as np
import jams
from pathlib import Path
import soundfile as sf
from collections import defaultdict

class SampleExtractor:
    """Extrai os melhores samples de cada acorde do GuitarSet."""
    
    def __init__(
        self,
        audio_dir: str,
        annot_dir: str,
        output_dir: str,
        sample_rate: int = 44100,  # Qualidade alta para playback
        sample_duration: float = 2.0  # 2 segundos por sample
    ):
        self.audio_dir = Path(audio_dir)
        self.annot_dir = Path(annot_dir)
        self.output_dir = Path(output_dir)
        self.sample_rate = sample_rate
        self.sample_duration = sample_duration
        
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Acordes que queremos extrair (mapeamento GuitarSet -> Nome simples)
        self.target_chords = {
            # Maiores naturais
            'C:maj': 'C',
            'D:maj': 'D', 
            'E:maj': 'E',
            'F:maj': 'F',
            'G:maj': 'G',
            'A:maj': 'A',
            'B:maj': 'B',
            # Maiores com sustenidos
            'C#:maj': 'C#',
            'D#:maj': 'D#',
            'F#:maj': 'F#',
            'G#:maj': 'G#',
            'A#:maj': 'A#',
            # Menores naturais
            'C:min': 'Cm',
            'D:min': 'Dm',
            'E:min': 'Em',
            'F:min': 'Fm',
            'G:min': 'Gm',
            'A:min': 'Am',
            'B:min': 'Bm',
            # Menores com sustenidos
            'C#:min': 'C#m',
            'D#:min': 'D#m',
            'F#:min': 'F#m',
            'G#:min': 'G#m',
            'A#:min': 'A#m',
            # Sétimas naturais
            'C:7': 'C7',
            'D:7': 'D7',
            'E:7': 'E7',
            'G:7': 'G7',
            'A:7': 'A7',
            'B:7': 'B7',
            # Sétimas com sustenidos
            'C#:7': 'C#7',
            'D#:7': 'D#7',
            'F#:7': 'F#7',
            'A#:7': 'A#7',
        }
    
    def calculate_quality_score(self, audio: np.ndarray) -> float:
        """
        Calcula score de qualidade do sample.
        Prefere: volume consistente, sem clipping, ataque claro.
        """
        # RMS energy
        rms = np.sqrt(np.mean(audio**2))
        
        # Verifica clipping
        clipping = np.sum(np.abs(audio) > 0.99) / len(audio)
        
        # Verifica se tem ataque (início mais forte)
        attack_window = int(0.1 * self.sample_rate)
        attack_energy = np.sqrt(np.mean(audio[:attack_window]**2))
        
        # Score: queremos RMS bom, sem clipping, com ataque
        score = rms * (1 - clipping * 10) * (1 + attack_energy)
        
        return score
    
    def extract_samples(self):
        """Extrai melhores samples de cada acorde."""
        
        # Armazena candidatos por acorde
        candidates = defaultdict(list)
        
        audio_files = list(self.audio_dir.glob("*.wav"))
        print(f"Processando {len(audio_files)} arquivos...")
        
        total_chords_found = 0
        chords_processed = 0
        
        for idx, audio_path in enumerate(audio_files):
            if (idx + 1) % 50 == 0:
                print(f"  Processado {idx + 1}/{len(audio_files)} arquivos...")
            
            # Carregar anotação
            # Arquivos de áudio têm _mic no final, mas JAMS não têm
            stem_name = audio_path.stem.replace('_mic', '')
            jams_path = self.annot_dir / f"{stem_name}.jams"
            if not jams_path.exists():
                continue
            
            jam = jams.load(str(jams_path))
            chord_ann = jam.search(namespace='chord')[0]
            
            # Carregar áudio
            audio, sr = librosa.load(audio_path, sr=self.sample_rate)
            
            for obs in chord_ann.data:
                chord = obs.value
                total_chords_found += 1
                
                if chord not in self.target_chords:
                    continue
                
                chords_processed += 1
                
                # Verificar duração suficiente (mínimo 1.5s)
                if obs.duration < 1.5:
                    continue
                
                # Usar duração real do acorde (ou máximo de sample_duration)
                actual_duration = min(obs.duration, self.sample_duration)
                
                # Extrair segmento
                start_sample = int(obs.time * self.sample_rate)
                end_sample = int((obs.time + actual_duration) * self.sample_rate)
                
                if end_sample > len(audio):
                    continue
                
                segment = audio[start_sample:end_sample]
                
                # Calcular qualidade
                score = self.calculate_quality_score(segment)
                
                simple_chord = self.target_chords[chord]
                candidates[simple_chord].append({
                    'audio': segment,
                    'score': score,
                    'source': audio_path.name,
                    'time': obs.time
                })
        
        # Selecionar e salvar melhores samples
        print(f"\nTotal de acordes encontrados: {total_chords_found}")
        print(f"Acordes processados (nos target_chords): {chords_processed}")
        print(f"Candidatos por acorde: {len(candidates)}")
        print("\nSelecionando melhores samples...")
        
        for chord, samples in candidates.items():
            if not samples:
                print(f"  {chord}: Nenhum sample encontrado!")
                continue
            
            # Ordenar por qualidade
            samples.sort(key=lambda x: x['score'], reverse=True)
            
            # Pegar o melhor
            best = samples[0]
            
            # Normalizar volume
            audio = best['audio']
            audio = audio / np.max(np.abs(audio)) * 0.8
            
            # Aplicar fade in/out suave
            fade_samples = int(0.01 * self.sample_rate)
            audio[:fade_samples] *= np.linspace(0, 1, fade_samples)
            audio[-fade_samples:] *= np.linspace(1, 0, fade_samples)
            
            # Salvar
            output_path = self.output_dir / f"{chord}.wav"
            sf.write(output_path, audio, self.sample_rate)
            
            print(f"  {chord}: score={best['score']:.3f} from {best['source']}")
        
        print(f"\nSamples salvos em: {self.output_dir}")
        
        # Gerar lista de arquivos para o frontend
        self.generate_manifest()
    
    def generate_manifest(self):
        """Gera JSON com lista de samples disponíveis."""
        import json
        
        samples = {}
        for wav_file in self.output_dir.glob("*.wav"):
            chord_name = wav_file.stem
            samples[chord_name] = {
                'file': wav_file.name,
                'duration': self.sample_duration
            }
        
        manifest_path = self.output_dir / 'manifest.json'
        with open(manifest_path, 'w') as f:
            json.dump(samples, f, indent=2)
        
        print(f"Manifest salvo: {manifest_path}")


if __name__ == "__main__":
    extractor = SampleExtractor(
        audio_dir="datasets/audio_mono-mic",
        annot_dir="datasets/annotations",
        output_dir="client/public/samples/chords"
    )
    extractor.extract_samples()
