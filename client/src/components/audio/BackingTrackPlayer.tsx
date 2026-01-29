import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Volume2, Music, Settings2 } from 'lucide-react';
import { unifiedAudioService } from '@/services/UnifiedAudioService';
import * as Tone from 'tone';

interface BackingTrack {
    id: string;
    name: string;
    description: string;
    bpm: number;
    timeSignature: [number, number];
    chords: {
        name: string;
        duration: number; // in beats
    }[];
    style: 'blues' | 'rock' | 'jazz' | 'pop';
}

const TRACKS: BackingTrack[] = [
    {
        id: 'blues-am',
        name: 'Slow Blues in Am',
        description: 'Progressão clássica de Blues 12 compassos em Lá Menor.',
        bpm: 60,
        timeSignature: [4, 4],
        chords: [
            { name: 'Am7', duration: 4 }, { name: 'Am7', duration: 4 }, { name: 'Am7', duration: 4 }, { name: 'Am7', duration: 4 },
            { name: 'Dm7', duration: 4 }, { name: 'Dm7', duration: 4 }, { name: 'Am7', duration: 4 }, { name: 'Am7', duration: 4 },
            { name: 'Em7', duration: 4 }, { name: 'Dm7', duration: 4 }, { name: 'Am7', duration: 4 }, { name: 'E7', duration: 4 },
        ],
        style: 'blues'
    },
    {
        id: 'rock-em',
        name: 'Rock Ballad in Em',
        description: 'Base emotiva estilo Rock Ballad.',
        bpm: 75,
        timeSignature: [4, 4],
        chords: [
            { name: 'Em', duration: 4 }, { name: 'C', duration: 4 }, { name: 'G', duration: 4 }, { name: 'D', duration: 4 },
        ],
        style: 'rock'
    },
    {
        id: 'pop-c',
        name: 'Pop Groove in C',
        description: 'A famosa progressão 1-5-6-4.',
        bpm: 90,
        timeSignature: [4, 4],
        chords: [
            { name: 'C', duration: 4 }, { name: 'G', duration: 4 }, { name: 'Am', duration: 4 }, { name: 'F', duration: 4 },
        ],
        style: 'pop'
    }
];

export function BackingTrackPlayer() {
    const [selectedTrackId, setSelectedTrackId] = useState<string>(TRACKS[0].id);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentChordIndex, setCurrentChordIndex] = useState(-1);
    const [volume, setVolume] = useState(-10); // dB

    // Refs for Tone.js scheduling
    const sequenceRef = useRef<Tone.Sequence | null>(null);
    const synthsRef = useRef<Tone.PolySynth | null>(null);

    const selectedTrack = TRACKS.find(t => t.id === selectedTrackId) || TRACKS[0];

    useEffect(() => {
        // Init synths
        synthsRef.current = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: "triangle" },
            envelope: { attack: 0.1, decay: 0.3, sustain: 0.4, release: 0.8 }
        }).toDestination();

        synthsRef.current.volume.value = volume;

        return () => {
            stopTrack();
            synthsRef.current?.dispose();
        };
    }, []);

    useEffect(() => {
        if (synthsRef.current) {
            synthsRef.current.volume.rampTo(volume, 0.1);
        }
    }, [volume]);

    const startTrack = async () => {
        if (isPlaying) return;

        try {
            await unifiedAudioService.ensureInitialized();
            await Tone.start();
            Tone.Transport.bpm.value = selectedTrack.bpm;

            // Create sequence
            let accumulatedBeats = 0;
            const events = selectedTrack.chords.map((chord, index) => {
                const time = accumulatedBeats * (60 / selectedTrack.bpm); // approximate for visual, but sequence uses beats
                const event = { chord: chord.name, duration: chord.duration, index };
                accumulatedBeats += chord.duration;
                return event;
            });

            // We need a more complex scheduling for variable durations if we use Sequence
            // Instead, let's use Tone.Part or just schedule directly on Transport

            // Scheduling logic
            let currentTime = 0;
            const measureLength = selectedTrack.chords.reduce((acc, c) => acc + c.duration, 0);

            sequenceRef.current = new Tone.Sequence((time, event) => {
                // Play chord
                setCurrentChordIndex(event.index);

                // Use unified service for chords if possible, or local synth
                // unifiedAudioService.playChord(event.chord); // This might overlap too much if strums are long

                // Simple block chords for backing
                // We'd need to convert Chord Name to Notes -> simplistic approach for now:
                // Let's use the UnifiedService for sound quality!
                unifiedAudioService.playChord(event.chord, event.duration / 4 * (60 / selectedTrack.bpm)); // Duration in seconds

            }, events, "4n").start(0);
            // Note: Sequence expects constant interval if 3rd arg is string. 
            // For variable chords, we need Tone.Part.

            // Let's switch to Tone.Part for variable durations
            sequenceRef.current?.dispose(); // Clear simplistic sequence

            const partEvents = [];
            let currentBeat = 0;

            selectedTrack.chords.forEach((chord, index) => {
                partEvents.push({ time: `0:${currentBeat}:0`, chord: chord.name, duration: chord.duration, index });
                currentBeat += chord.duration; // Assuming 4/4 and duration in quarternotes
            });

            const part = new Tone.Part((time, value) => {
                setCurrentChordIndex(value.index);
                // Trigger chord via unified service
                // We add a tiny delay to ensure visual sync? No, keep it tight.
                unifiedAudioService.playChord(value.chord, 2); // default strum

                // Visualize safe notes or updates here if needed
            }, partEvents);

            part.loop = true;
            part.loopEnd = `0:${currentBeat}:0`;

            part.start(0);

            Tone.Transport.start();
            setIsPlaying(true);

            // Store ref to stop later (Sequence type is wrong for Part, but we store it in any)
            sequenceRef.current = part as any;

        } catch (e) {
            console.error("Failed to start backing track", e);
        }
    };

    const stopTrack = () => {
        Tone.Transport.stop();
        Tone.Transport.cancel(); // Clear all events
        if (sequenceRef.current) {
            sequenceRef.current.dispose();
            sequenceRef.current = null;
        }
        setIsPlaying(false);
        setCurrentChordIndex(-1);
    };

    return (
        <div className="bg-gray-800/80 rounded-2xl p-6 border border-gray-700 shadow-xl backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-500/20 rounded-xl">
                        <Music className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">Backing Tracks</h3>
                        <p className="text-sm text-gray-400">Pratique improvisação com bases reais</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-gray-900/50 rounded-lg p-1">
                    {TRACKS.map(track => (
                        <button
                            key={track.id}
                            onClick={() => {
                                if (isPlaying) stopTrack();
                                setSelectedTrackId(track.id);
                            }}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${selectedTrackId === track.id
                                    ? 'bg-indigo-600 text-white shadow-lg'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                }`}
                        >
                            {track.style.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex flex-col gap-6">
                {/* Visualizer / Progress */}
                <div className="flex items-center gap-1 h-24 bg-gray-900/50 rounded-xl p-4 overflow-x-auto relative">
                    {selectedTrack.chords.map((chord, i) => (
                        <div
                            key={i}
                            className={`
                                flex-shrink-0 flex items-center justify-center rounded-lg border-b-4 transition-all duration-300
                                ${currentChordIndex === i
                                    ? 'bg-indigo-500/20 border-indigo-500 w-24 h-16 scale-110 z-10'
                                    : 'bg-gray-800/30 border-gray-700 w-16 h-12 opacity-50'}
                            `}
                        >
                            <span className={`font-bold ${currentChordIndex === i ? 'text-white text-xl' : 'text-gray-500'}`}>
                                {chord.name}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={isPlaying ? stopTrack : startTrack}
                            className={`
                                w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg
                                ${isPlaying
                                    ? 'bg-red-500 hover:bg-red-600 text-white'
                                    : 'bg-green-500 hover:bg-green-600 text-white'}
                            `}
                        >
                            {isPlaying ? <Square className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
                        </button>

                        <div>
                            <h4 className="font-bold text-white">{selectedTrack.name}</h4>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                <span>{selectedTrack.bpm} BPM</span>
                                <span>•</span>
                                <span>{selectedTrack.description}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Volume2 className="w-5 h-5 text-gray-400" />
                        <input
                            type="range"
                            min="-30"
                            max="0"
                            value={volume}
                            onChange={(e) => setVolume(Number(e.target.value))}
                            className="w-24 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-indigo-500 [&::-webkit-slider-thumb]:rounded-full"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
