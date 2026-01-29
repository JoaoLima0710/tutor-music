/**
 * 🧭 Guidance Audio Service
 * 
 * Responsible for "First Contact" sounds and Rhythmic Guidance.
 * ESTABLISHES TRUST immediately upon user interaction.
 */

import { getAudioBus } from '@/audio';
import { audioPriorityManager } from './AudioPriorityManager';

class GuidanceAudioService {
    private isEnabled = true;

    /**
     * Plays the "App Ready" symbolic sound (C Major Arpeggio).
     * Signals to the user: "The audio engine is active, high-quality, and ready."
     */
    async playIntro(): Promise<void> {
        if (!this.isEnabled) return;
        const audioBus = getAudioBus();
        if (!audioBus) return;

        console.log('✨ Playing Intro Sound (Ritual de Ativação)...');

        // C Major Arpeggio: C4 -> E4 -> G4 -> C5
        // Smooth, inviting, and professional.
        const notes = [
            { freq: 261.63, time: 0, dur: 0.4 },    // C4
            { freq: 329.63, time: 0.1, dur: 0.4 },  // E4
            { freq: 392.00, time: 0.2, dur: 0.4 },  // G4
            { freq: 523.25, time: 0.3, dur: 0.8 }   // C5 (Hold)
        ];

        notes.forEach(note => {
            audioBus.playOscillator({
                frequency: note.freq,
                type: 'sine', // Soft sine wave
                duration: note.dur,
                channel: 'effects',
                volume: 0.15,
                when: audioBus['audioEngine'].getContext().currentTime + note.time,
                useClearEnvelope: false // Soft attack
            });
        });
    }

    /**
     * Plays a rhythmic countdown (4 beats) to prep the user before an exercise.
     * Removes ambiguity of "When do I start?".
     */
    async playCountdown(bpm: number = 60, beats: number = 4): Promise<void> {
        if (!this.isEnabled) return;
        const audioBus = getAudioBus();
        if (!audioBus) return;

        // Prioritize this over everything else
        if (!audioPriorityManager.canPlaySound('training')) return;

        const interval = 60 / bpm;
        const now = audioBus['audioEngine'].getContext().currentTime;

        console.log(`⏱️ Playing Countdown: ${bpm} BPM, ${beats} beats`);

        for (let i = 0; i < beats; i++) {
            // Higher pitch for the last beat (Go!)? Or First beat? 
            // Standard: High, Low, Low, Low (if 4/4) or Low, Low, Low, High (Lead-in)
            // Let's do: 3 Low Clicks, 1 High Click (GO signal)
            const isLast = i === beats - 1;
            const freq = isLast ? 880 : 440; // A5 vs A4

            audioBus.playOscillator({
                frequency: freq,
                type: 'triangle', // Sharper for timing
                duration: 0.05,
                channel: 'metronome',
                volume: 0.3,
                when: now + (i * interval),
                useClearEnvelope: true // Sharp attack
            });
        }
    }
}

export const guidanceAudioService = new GuidanceAudioService();
