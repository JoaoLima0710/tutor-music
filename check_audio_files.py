from pathlib import Path

base = Path(r"C:\Users\Joao\Desktop\guitarset_extracted")
dirs = ['audio_mono-mic', 'audio_hex-pickup_debleeded', 'audio_hex-pickup_original', 'audio_mono-pickup_mix']

for d in dirs:
    dir_path = base / d
    if dir_path.exists():
        wavs = list(dir_path.rglob("*.wav"))
        print(f"{d}: {len(wavs)} arquivos WAV")
        if wavs:
            print(f"  Exemplo: {wavs[0].name}")
    else:
        print(f"{d}: diretorio nao existe")
