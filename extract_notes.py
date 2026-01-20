"""
Extrai samples de notas individuais do GuitarSet.
O GuitarSet tem anotações de pitch por corda, permitindo extrair notas limpas.
"""
import librosa
import numpy as np
import jams
from pathlib import Path
import soundfile as sf
from collections import defaultdict
from scipy import signal

# Mapeamento MIDI -> Nome da nota
MIDI_TO_NOTE = {
    40: 'E2', 41: 'F2', 42: 'F#2', 43: 'G2', 44: 'G#2', 45: 'A2',
    46: 'A#2', 47: 'B2', 48: 'C3', 49: 'C#3', 50: 'D3', 51: 'D#3',
    52: 'E3', 53: 'F3', 54: 'F#3', 55: 'G3', 56: 'G#3', 57: 'A3',
    58: 'A#3', 59: 'B3', 60: 'C4', 61: 'C#4', 62: 'D4', 63: 'D#4',
    64: 'E4', 65: 'F4', 66: 'F#4', 67: 'G4', 68: 'G#4', 69: 'A4',
    70: 'A#4', 71: 'B4', 72: 'C5', 73: 'C#5', 74: 'D5', 75: 'D#5',
    76: 'E5', 77: 'F5', 78: 'F#5', 79: 'G5', 80: 'G#5', 81: 'A5',
}

class NoteExtractor:
    """Extrai samples de notas individuais."""
    
    def __init__(
        self,
        audio_dir: str,
        annot_dir: str,
        output_dir: str,
        sample_rate: int = 44100,
        note_duration: float = 1.5
    ):
        self.audio_dir = Path(audio_dir)
        self.annot_dir = Path(annot_dir)
        self.output_dir = Path(output_dir)
        self.sample_rate = sample_rate
        self.note_duration = note_duration
        
        self.output_dir.mkdir(parents=True, exist_ok=True)
    
    def extract_notes(self):
        """Extrai notas do GuitarSet usando anotações de pitch."""
        
        candidates = defaultdict(list)
        
        audio_files = list(self.audio_dir.glob("*.wav"))
        print(f"Processando {len(audio_files)} arquivos...")
        
        for audio_path in audio_files:
            # Arquivos de áudio têm _mic no final, mas JAMS não têm
            stem_name = audio_path.stem.replace('_mic', '')
            jams_path = self.annot_dir / f"{stem_name}.jams"
            if not jams_path.exists():
                continue
            
            jam = jams.load(str(jams_path))
            
            # GuitarSet tem anotações por corda (string0 a string5)
            # Cada anotação tem pitch MIDI e confidence
            
            audio, sr = librosa.load(audio_path, sr=self.sample_rate)
            
            # Procurar anotações de note_midi (não pitch_contour)
            for ann in jam.annotations:
                if ann.namespace != 'note_midi':
                    continue
                
                for obs in ann.data:
                    # obs.value é o pitch MIDI
                    midi_pitch = int(round(obs.value))
                    
                    if midi_pitch not in MIDI_TO_NOTE:
                        continue
                    
                    if obs.duration < 0.5:  # Notas muito curtas
                        continue
                    
                    # Extrair segmento
                    start = int(obs.time * self.sample_rate)
                    duration = min(obs.duration, self.note_duration)
                    end = int((obs.time + duration) * self.sample_rate)
                    
                    if end > len(audio):
                        continue
                    
                    segment = audio[start:end]
                    
                    # Calcular qualidade (RMS, sem clipping)
                    rms = np.sqrt(np.mean(segment**2))
                    if rms < 0.01:  # Muito silencioso
                        continue
                    
                    # VALIDAÇÃO ESPECÍFICA PARA F2 (MIDI 41): Garantir que é nota individual, não acorde
                    # F2 está na corda 6 (string5), primeira casa
                    is_f2 = (midi_pitch == 41)
                    
                    if is_f2:
                        # VALIDAÇÃO CRÍTICA PARA F2: Verificar se é realmente nota individual, não acorde
                        # Análise espectral: notas individuais têm frequência fundamental clara
                        
                        # Calcular FFT para análise espectral
                        fft = np.fft.rfft(segment)
                        freqs = np.fft.rfftfreq(len(segment), 1/self.sample_rate)
                        magnitude = np.abs(fft)
                        
                        # Encontrar picos de frequência
                        peaks, _ = signal.find_peaks(magnitude, height=np.max(magnitude) * 0.1)
                        
                        if len(peaks) > 0:
                            # Frequência fundamental esperada para F2 (MIDI 41) ≈ 87.31 Hz
                            expected_freq = 440 * (2 ** ((midi_pitch - 69) / 12))
                            
                            # Verificar se há frequência próxima à esperada (tolerância de 10Hz)
                            peak_freqs = freqs[peaks]
                            fundamental_found = any(abs(f - expected_freq) < 10 for f in peak_freqs[:5])
                            
                            # Se não encontrar frequência fundamental clara, rejeitar (pode ser acorde)
                            if not fundamental_found:
                                print(f"  ⚠️ F2 rejeitado de {audio_path.name}: frequência fundamental não encontrada (esperada ~{expected_freq:.1f}Hz)")
                                continue
                            
                            # Verificar se há muitas frequências fortes simultâneas (indica acorde)
                            # Notas individuais têm 1-2 frequências dominantes, acordes têm 3+
                            strong_peaks = peaks[magnitude[peaks] > np.max(magnitude) * 0.3]
                            if len(strong_peaks) > 3:
                                print(f"  ⚠️ F2 rejeitado de {audio_path.name}: muitas frequências fortes ({len(strong_peaks)}), parece acorde")
                                continue
                            
                            # Verificar duração: notas individuais são mais curtas
                            if obs.duration > 3.0:
                                print(f"  ⚠️ F2 rejeitado de {audio_path.name}: duração muito longa ({obs.duration:.2f}s), pode ser acorde")
                                continue
                            
                            print(f"  ✅ F2 validado de {audio_path.name}: frequência fundamental encontrada, duração {obs.duration:.2f}s")
                    
                    note_name = MIDI_TO_NOTE[midi_pitch]
                    candidates[note_name].append({
                        'audio': segment,
                        'rms': rms,
                        'source': audio_path.name,
                        'is_f2': is_f2
                    })
        
        # Salvar melhores samples
        print("Salvando notas...")
        
        for note, samples in candidates.items():
            if not samples:
                continue
            
            # Para F2, priorizar samples que passaram validação de frequência
            # Para outras notas, ordenar por RMS (volume)
            if note == 'F2':
                # Separar F2 validados (que passaram análise espectral)
                f2_validated = [s for s in samples if s.get('is_f2', False)]
                if f2_validated:
                    # Ordenar F2 validados por RMS (volume)
                    f2_validated.sort(key=lambda x: x['rms'], reverse=True)
                    best = f2_validated[0]
                    print(f"  ✅ F2: usando sample VALIDADO de {best['source']} (nota individual limpa)")
                else:
                    # Se não houver F2 validado, NÃO salvar (melhor não ter sample do que ter incorreto)
                    print(f"  ❌ F2: NENHUM sample válido encontrado! Todos foram rejeitados por parecerem acordes.")
                    print(f"  ❌ F2: É necessário reextrair F2 do dataset com critérios mais rigorosos.")
                    continue
            else:
                # Ordenar por RMS (volume)
                samples.sort(key=lambda x: x['rms'], reverse=True)
                best = samples[0]
            
            audio = best['audio']
            
            # Normalizar
            audio = audio / np.max(np.abs(audio)) * 0.8
            
            # Pad para duração fixa
            target_len = int(self.note_duration * self.sample_rate)
            if len(audio) < target_len:
                audio = np.pad(audio, (0, target_len - len(audio)))
            
            # Fade out
            fade_len = int(0.3 * self.sample_rate)
            audio[-fade_len:] *= np.linspace(1, 0, fade_len)
            
            # Salvar
            output_path = self.output_dir / f"{note}.wav"
            sf.write(output_path, audio, self.sample_rate)
            
            print(f"  {note}: saved")
        
        print(f"\nNotas salvas em: {self.output_dir}")


if __name__ == "__main__":
    extractor = NoteExtractor(
        audio_dir="datasets/audio_mono-mic",
        annot_dir="datasets/annotations",
        output_dir="client/public/samples/notes"
    )
    extractor.extract_notes()
