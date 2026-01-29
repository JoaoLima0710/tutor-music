import * as Tone from 'tone';

/**
 * 🎸 Sample-Based Chord Player
 * 
 * Plays chords using real instrument WAV samples from /samples/chords/
 * This replaces the synthesizer-based approach for high-quality, realistic audio.
 * 
 * ESCOPO:
 * - Apenas para ACORDES (não para notas individuais de escalas)
 * - Usa samples WAV gravados de violão real
 */

interface ChordManifestEntry {
    file: string;
    duration: number;
    gain: number;
}

type ChordManifest = Record<string, ChordManifestEntry>;

export class MIDIChordPlayer {
    private player: Tone.Player | null = null;
    private gainNode: Tone.Gain;
    private isInitialized: boolean = false;
    private manifest: ChordManifest | null = null;
    private sampleCache: Map<string, Tone.ToneAudioBuffer> = new Map();
    private currentPlayer: Tone.Player | null = null;

    // Base URL for chord samples
    private readonly BASE_URL = '/samples/chords/';

    // Mapeamento de nomes alternativos para normalização
    private readonly CHORD_NAME_ALIASES: Record<string, string> = {
        // Menores alternativos
        'Amin': 'Am',
        'Bmin': 'Bm',
        'Cmin': 'Cm',
        'Dmin': 'Dm',
        'Emin': 'Em',
        'Fmin': 'Fm',
        'Gmin': 'Gm',
        'A#min': 'A#m',
        'C#min': 'C#m',
        'D#min': 'D#m',
        'F#min': 'F#m',
        'G#min': 'G#m',

        // Maj7 alternativos
        'Amaj7': 'A7+',
        'Bmaj7': 'B7+',
        'Cmaj7': 'C7+',
        'Dmaj7': 'D7+',
        'Emaj7': 'E7+',
        'Fmaj7': 'F7+',
        'Gmaj7': 'G7+',
        'AMaj7': 'A7+',
        'BMaj7': 'B7+',
        'CMaj7': 'C7+',
        'DMaj7': 'D7+',
        'EMaj7': 'E7+',
        'FMaj7': 'F7+',
        'GMaj7': 'G7+',

        // m7 alternativos
        'Am7': 'Amin7',
        'Bm7': 'Bmin7',
        'Cm7': 'Cmin7',
        'Dm7': 'Dmin7',
        'Em7': 'Emin7',
        'Fm7': 'Fmin7',
        'Gm7': 'Gmin7',
    };

    constructor() {
        // Criar nó de ganho para controle de volume
        this.gainNode = new Tone.Gain(0.8).toDestination();
        console.log('🎸 [SampleChordPlayer] Inicializado');
    }

    /**
     * Inicializa o player e carrega o manifesto
     */
    async initialize(): Promise<void> {
        if (this.isInitialized) return;

        try {
            await Tone.start();

            // Carregar manifesto de samples
            const response = await fetch(`${this.BASE_URL}manifest.json`);
            if (response.ok) {
                this.manifest = await response.json();
                console.log(`✅ [SampleChordPlayer] Manifesto carregado: ${Object.keys(this.manifest!).length} acordes`);
            } else {
                console.warn('⚠️ [SampleChordPlayer] Manifesto não encontrado, usando mapeamento padrão');
            }

            this.isInitialized = true;
            console.log('✅ [SampleChordPlayer] Inicializado com sucesso');
        } catch (error) {
            console.error('❌ [SampleChordPlayer] Erro na inicialização:', error);
            throw error;
        }
    }

    /**
     * Normaliza o nome do acorde para corresponder ao manifesto
     */
    private normalizeChordName(chordName: string): string {
        // Tentar alias primeiro
        if (this.CHORD_NAME_ALIASES[chordName]) {
            return this.CHORD_NAME_ALIASES[chordName];
        }
        return chordName;
    }

    /**
     * Obtém o nome do arquivo WAV para um acorde
     */
    private getChordFileName(chordName: string): string | null {
        const normalized = this.normalizeChordName(chordName);

        // Verificar manifesto
        if (this.manifest && this.manifest[normalized]) {
            return this.manifest[normalized].file;
        }

        // Fallback: tentar construir o nome diretamente
        // Ex: "C" -> "C.wav", "Am" -> "Am.wav"
        const possibleNames = [
            `${normalized}.wav`,
            `${chordName}.wav`,
        ];

        // Retornar primeira opção como fallback
        return possibleNames[0];
    }

    /**
     * Carrega um sample de acorde
     */
    private async loadChordSample(chordName: string): Promise<Tone.ToneAudioBuffer | null> {
        // Verificar cache
        if (this.sampleCache.has(chordName)) {
            return this.sampleCache.get(chordName)!;
        }

        const fileName = this.getChordFileName(chordName);
        if (!fileName) {
            console.warn(`⚠️ [SampleChordPlayer] Arquivo não encontrado para: ${chordName}`);
            return null;
        }

        const url = `${this.BASE_URL}${fileName}`;

        try {
            const buffer = await Tone.ToneAudioBuffer.fromUrl(url);
            this.sampleCache.set(chordName, buffer);
            console.log(`✅ [SampleChordPlayer] Sample carregado: ${chordName} (${fileName})`);
            return buffer;
        } catch (error) {
            console.error(`❌ [SampleChordPlayer] Erro ao carregar ${chordName}:`, error);
            return null;
        }
    }

    /**
     * Toca um acorde usando sample WAV
     */
    async playChord(chordName: string, duration: number = 2.5): Promise<void> {
        if (!this.isInitialized) {
            await this.initialize();
        }

        try {
            // Parar sample anterior se estiver tocando
            if (this.currentPlayer) {
                this.currentPlayer.stop();
                this.currentPlayer.dispose();
                this.currentPlayer = null;
            }

            // Carregar sample
            const buffer = await this.loadChordSample(chordName);
            if (!buffer) {
                console.warn(`⚠️ [SampleChordPlayer] Sample não encontrado para: ${chordName}`);
                return;
            }

            // Criar player e tocar
            this.currentPlayer = new Tone.Player(buffer).connect(this.gainNode);
            this.currentPlayer.start();

            console.log(`🎸 [SampleChordPlayer] Tocando: ${chordName}`);

            // Agendar parada se duração for especificada
            if (duration && duration < buffer.duration) {
                setTimeout(() => {
                    if (this.currentPlayer) {
                        this.currentPlayer.stop();
                    }
                }, duration * 1000);
            }
        } catch (error) {
            console.error(`❌ [SampleChordPlayer] Erro ao tocar ${chordName}:`, error);
        }
    }

    /**
     * Para todos os sons
     */
    stopAll(): void {
        if (this.currentPlayer) {
            try {
                this.currentPlayer.stop();
                this.currentPlayer.dispose();
            } catch (e) {
                // Ignorar erros de dispose
            }
            this.currentPlayer = null;
        }
    }

    /**
     * Verifica se um acorde tem sample disponível
     */
    hasMIDI(chordName: string): boolean {
        const normalized = this.normalizeChordName(chordName);
        return this.manifest ? normalized in this.manifest : true; // Assume true if no manifest
    }

    /**
     * Retorna lista de acordes disponíveis
     */
    getAvailableChords(): string[] {
        if (this.manifest) {
            return Object.keys(this.manifest);
        }
        // Lista padrão
        return ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'Am', 'Dm', 'Em'];
    }

    /**
     * Define o volume do player (0.0 - 1.0)
     */
    setVolume(volume: number): void {
        this.gainNode.gain.value = Math.max(0, Math.min(1, volume));
    }
}

// Singleton
export const midiChordPlayer = new MIDIChordPlayer();
