"""
Cria manifest.json para as notas extraídas.
"""
import json
from pathlib import Path

notes_dir = Path("client/public/samples/notes")
manifest_path = notes_dir / "manifest.json"

notes = {}
for wav_file in notes_dir.glob("*.wav"):
    note_name = wav_file.stem
    notes[note_name] = {
        'file': wav_file.name,
        'duration': 1.5  # Default duration for notes
    }

with open(manifest_path, 'w') as f:
    json.dump(notes, f, indent=2)

print(f"Manifest criado: {len(notes)} notas")
print(f"   Arquivo: {manifest_path}")
