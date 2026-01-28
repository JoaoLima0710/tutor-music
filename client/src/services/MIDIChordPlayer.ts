import * as Tone from 'tone';
import { Midi } from '@tonejs/midi';

/**
 * 🎹 MIDI Chord Player
 * 
 * Toca acordes usando arquivos MIDI profissionais da pasta "Gimme All Your Chords".
 * 
 * ESCOPO:
 * - Apenas para ACORDES (não para notas individuais de escalas)
 * - Notas do braço continuam usando WAV samples
 */

interface MIDIChordMapping {
    [key: string]: string; // Nome do acorde → nome do arquivo MIDI
}

export class MIDIChordPlayer {
    private synth: Tone.PolySynth;
    private midiCache: Map<string, Midi> = new Map();
    private isInitialized: boolean = false;

    // Mapeamento de nomes de acordes para arquivos MIDI
    private readonly chordMapping: MIDIChordMapping = {
        // Acordes maiores
        'C': 'C .mid',
        'D': 'D .mid',
        'E': 'E .mid',
        'F': 'F .mid',
        'G': 'G .mid',
        'A': 'A .mid',
        'B': 'B .mid',

        // Acordes menores
        'Cm': 'Cmin.mid',
        'Dm': 'Dmin.mid',
        'Em': 'Emin.mid',
        'Fm': 'Fmin.mid',
        'Gm': 'Gmin.mid',
        'Am': 'Amin.mid',
        'Bm': 'Bmin.mid',

        // Acordes dominantes (7)
        'C7': 'C7.mid',
        'D7': 'D7.mid',
        'E7': 'E7.mid',
        'F7': 'F7.mid',
        'G7': 'G7.mid',
        'A7': 'A7.mid',
        'B7': 'B7.mid',

        // Acordes maiores com sétima (Maj7)
        'CMaj7': 'CMaj7.mid',
        'DMaj7': 'DMaj7.mid',
        'EMaj7': 'EMaj7.mid',
        'FMaj7': 'FMaj7.mid',
        'GMaj7': 'GMaj7.mid',
        'AMaj7': 'AMaj7.mid',
        'BMaj7': 'BMaj7.mid',

        // Outros acordes (se disponíveis)
        'C6': 'C6.mid',
        'C9': 'C9.mid',
        'Caug': 'Caug.mid',
        'Cdim': 'Cdim.mid',
    };

    constructor() {
        // Criar sintetizador polifônico com timbre de violão
        this.synth = new Tone.PolySynth(Tone.Synth, {
            oscillator: {
                type: 'triangle', // Som mais suave, similar a violão
            },
            envelope: {
                attack: 0.01,
                decay: 0.3,
                sustain: 0.4,
                release: 1.5,
            },
        }).toDestination();
    }

    /**
     * Inicializa o player MIDI
     */
    async initialize(): Promise<void> {
        if (this.isInitialized) return;

        try {
            await Tone.start();
            this.isInitialized = true;
            console.log('✅ [MIDIChordPlayer] Inicializado com sucesso');
        } catch (error) {
            console.error('❌ [MIDIChordPlayer] Erro na inicialização:', error);
            throw error;
        }
    }

    /**
     * Carrega um arquivo MIDI
     */
    private async loadMIDI(chordName: string): Promise<Midi> {
        // Verificar cache
        if (this.midiCache.has(chordName)) {
            return this.midiCache.get(chordName)!;
        }

        // Obter nome do arquivo MIDI
        const fileName = this.chordMapping[chordName];
        if (!fileName) {
            throw new Error(`Acorde "${chordName}" não tem mapeamento MIDI`);
        }

        const url = `/midi/chords/${fileName}`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const arrayBuffer = await response.arrayBuffer();
            const midi = new Midi(arrayBuffer);

            // Adicionar ao cache
            this.midiCache.set(chordName, midi);

            console.log(`✅ [MIDIChordPlayer] MIDI carregado: ${chordName} (${fileName})`);
            return midi;
        } catch (error) {
            console.error(`❌ [MIDIChordPlayer] Erro ao carregar ${chordName}:`, error);
            throw error;
        }
    }

    /**
     * Toca um acorde usando MIDI
     */
    async playChord(chordName: string, duration: number = 2.5): Promise<void> {
        if (!this.isInitialized) {
            await this.initialize();
        }

        try {
            const midi = await this.loadMIDI(chordName);
            const now = Tone.now();

            // Tocar todas as notas do MIDI
            midi.tracks.forEach(track => {
                track.notes.forEach(note => {
                    this.synth.triggerAttackRelease(
                        note.name,
                        Math.min(note.duration, duration), // Limitar duração
                        now + note.time
                    );
                });
            });

            console.log(`🎹 [MIDIChordPlayer] Tocando: ${chordName}`);
        } catch (error) {
            console.error(`❌ [MIDIChordPlayer] Erro ao tocar ${chordName}:`, error);
            throw error;
        }
    }

    /**
     * Para todos os sons
     */
    stopAll(): void {
        this.synth.releaseAll();
    }

    /**
     * Verifica se um acorde tem MIDI disponível
     */
    hasMIDI(chordName: string): boolean {
        return chordName in this.chordMapping;
    }

    /**
     * Retorna lista de acordes com MIDI disponível
     */
    getAvailableChords(): string[] {
        return Object.keys(this.chordMapping);
    }
}

// Singleton
export const midiChordPlayer = new MIDIChordPlayer();
