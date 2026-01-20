/**
 * GuitarSet AI Training Service
 * Integra dados treinados do GuitarSet para melhorar detecção de acordes e feedback da IA
 */

export interface ChordFeatures {
  chroma: number[];
  mfcc: number[];
  tonnetz: number[];
  spectral_centroid: number;
  spectral_rolloff: number;
  zero_crossing_rate: number;
  rms: number;
  duration: number;
}

export interface TrainingData {
  chord: string;
  description: string;
  common_errors: string[];
  practice_tips: string[];
  audio_characteristics: {
    typical_duration: number;
    typical_rms: number;
    chroma_profile: number[];
  };
}

export interface ChordProfile {
  chord: string;
  averageFeatures: ChordFeatures;
  sampleCount: number;
  typicalCharacteristics: {
    duration: number;
    rms: number;
    chroma: number[];
  };
}

class GuitarSetAITrainingService {
  private trainingData: Map<string, TrainingData[]> = new Map();
  private chordProfiles: Map<string, ChordProfile> = new Map();
  private featuresByChord: Map<string, ChordFeatures[]> = new Map();
  private isLoaded = false;

  /**
   * Carrega dados de treinamento do GuitarSet
   */
  async loadTrainingData(): Promise<boolean> {
    if (this.isLoaded) return true;

    try {
      // Carregar prompts de treinamento
      const promptsResponse = await fetch('/training_data/metadata/ai_training_prompts.json');
      if (promptsResponse.ok) {
        const promptsData = await promptsResponse.json();
        const examples: TrainingData[] = promptsData.examples || [];

        // Organizar por acorde
        examples.forEach(example => {
          if (!this.trainingData.has(example.chord)) {
            this.trainingData.set(example.chord, []);
          }
          this.trainingData.get(example.chord)!.push(example);
        });
      }

      // Carregar features por acorde
      const featuresResponse = await fetch('/training_data/features/features_by_chord.json');
      if (featuresResponse.ok) {
        const featuresData = await featuresResponse.json();
        
        Object.entries(featuresData).forEach(([chord, features]: [string, any]) => {
          this.featuresByChord.set(chord, features);
          
          // Calcular perfil médio do acorde
          if (features.length > 0) {
            const avgFeatures = this.calculateAverageFeatures(features);
            this.chordProfiles.set(chord, {
              chord,
              averageFeatures: avgFeatures,
              sampleCount: features.length,
              typicalCharacteristics: {
                duration: avgFeatures.duration,
                rms: avgFeatures.rms,
                chroma: avgFeatures.chroma
              }
            });
          }
        });
      }

      this.isLoaded = true;
      console.log('✅ Dados de treinamento do GuitarSet carregados');
      return true;
    } catch (error) {
      console.error('❌ Erro ao carregar dados de treinamento:', error);
      return false;
    }
  }

  /**
   * Calcula features médias de um conjunto de samples
   */
  private calculateAverageFeatures(features: ChordFeatures[]): ChordFeatures {
    if (features.length === 0) {
      return {
        chroma: new Array(12).fill(0),
        mfcc: new Array(13).fill(0),
        tonnetz: new Array(6).fill(0),
        spectral_centroid: 0,
        spectral_rolloff: 0,
        zero_crossing_rate: 0,
        rms: 0,
        duration: 0
      };
    }

    const avg: ChordFeatures = {
      chroma: this.averageArray(features.map(f => f.chroma)),
      mfcc: this.averageArray(features.map(f => f.mfcc)),
      tonnetz: this.averageArray(features.map(f => f.tonnetz)),
      spectral_centroid: features.reduce((sum, f) => sum + f.spectral_centroid, 0) / features.length,
      spectral_rolloff: features.reduce((sum, f) => sum + f.spectral_rolloff, 0) / features.length,
      zero_crossing_rate: features.reduce((sum, f) => sum + f.zero_crossing_rate, 0) / features.length,
      rms: features.reduce((sum, f) => sum + f.rms, 0) / features.length,
      duration: features.reduce((sum, f) => sum + f.duration, 0) / features.length
    };

    return avg;
  }

  /**
   * Calcula média de arrays
   */
  private averageArray(arrays: number[][]): number[] {
    if (arrays.length === 0) return [];
    
    const length = arrays[0].length;
    const result = new Array(length).fill(0);
    
    arrays.forEach(arr => {
      arr.forEach((val, i) => {
        result[i] += val;
      });
    });
    
    return result.map(val => val / arrays.length);
  }

  /**
   * Obtém perfil de um acorde
   */
  getChordProfile(chord: string): ChordProfile | null {
    return this.chordProfiles.get(chord) || null;
  }

  /**
   * Obtém dados de treinamento para um acorde
   */
  getTrainingData(chord: string): TrainingData[] {
    return this.trainingData.get(chord) || [];
  }

  /**
   * Compara features detectadas com perfil esperado do acorde
   */
  compareWithExpectedChord(
    detectedFeatures: Partial<ChordFeatures>,
    expectedChord: string
  ): {
    similarity: number;
    differences: string[];
    suggestions: string[];
  } {
    const profile = this.getChordProfile(expectedChord);
    if (!profile) {
      return {
        similarity: 0.5,
        differences: ['Perfil do acorde não encontrado'],
        suggestions: ['Verifique se está tocando o acorde correto']
      };
    }

    const differences: string[] = [];
    const suggestions: string[] = [];
    let similarity = 1.0;

    // Comparar RMS (volume)
    if (detectedFeatures.rms !== undefined) {
      const rmsDiff = Math.abs(detectedFeatures.rms - profile.averageFeatures.rms);
      if (rmsDiff > 0.1) {
        if (detectedFeatures.rms < profile.averageFeatures.rms) {
          differences.push('Volume muito baixo');
          suggestions.push('Pressione as cordas com mais força');
        } else {
          differences.push('Volume muito alto');
          suggestions.push('Reduza a força para evitar distorção');
        }
        similarity -= 0.2;
      }
    }

    // Comparar chroma (notas)
    if (detectedFeatures.chroma && profile.averageFeatures.chroma) {
      const chromaDiff = this.calculateChromaDifference(
        detectedFeatures.chroma,
        profile.averageFeatures.chroma
      );
      
      if (chromaDiff > 0.3) {
        differences.push('Notas não correspondem ao acorde esperado');
        suggestions.push('Verifique a posição dos dedos');
        similarity -= 0.4;
      }
    }

    // Comparar duração
    if (detectedFeatures.duration !== undefined) {
      const durationDiff = Math.abs(detectedFeatures.duration - profile.averageFeatures.duration);
      if (durationDiff > 1.0) {
        differences.push('Duração do som diferente do esperado');
        similarity -= 0.1;
      }
    }

    similarity = Math.max(0, similarity);

    return {
      similarity,
      differences,
      suggestions
    };
  }

  /**
   * Calcula diferença entre perfis de chroma
   */
  private calculateChromaDifference(chroma1: number[], chroma2: number[]): number {
    if (chroma1.length !== chroma2.length) return 1.0;
    
    let diff = 0;
    for (let i = 0; i < chroma1.length; i++) {
      diff += Math.abs(chroma1[i] - chroma2[i]);
    }
    
    return diff / chroma1.length;
  }

  /**
   * Gera feedback personalizado baseado nos dados de treinamento
   */
  generatePersonalizedFeedback(
    chord: string,
    detectedFeatures: Partial<ChordFeatures>,
    userLevel: number
  ): {
    description: string;
    commonErrors: string[];
    practiceTips: string[];
    specificAdvice: string;
  } {
    const trainingData = this.getTrainingData(chord);
    const comparison = this.compareWithExpectedChord(detectedFeatures, chord);

    // Usar dados de treinamento se disponíveis
    const data = trainingData[0];
    
    const description = data?.description || `Acorde ${chord}`;
    const commonErrors = data?.common_errors || comparison.differences;
    const practiceTips = data?.practice_tips || comparison.suggestions;

    // Gerar conselho específico baseado no nível
    let specificAdvice = '';
    if (userLevel <= 3) {
      specificAdvice = `Para iniciantes: ${practiceTips[0] || 'Pratique lentamente, garantindo que cada corda soe claramente.'}`;
    } else if (userLevel <= 6) {
      specificAdvice = `Foque em: ${practiceTips[0] || 'Consistência e clareza do som.'}`;
    } else {
      specificAdvice = `Para avançar: ${practiceTips[0] || 'Refine a técnica e explore variações.'}`;
    }

    return {
      description,
      commonErrors,
      practiceTips,
      specificAdvice
    };
  }

  /**
   * Obtém características típicas de um acorde
   */
  getTypicalCharacteristics(chord: string): {
    duration: number;
    rms: number;
    chroma: number[];
  } | null {
    const profile = this.getChordProfile(chord);
    return profile?.typicalCharacteristics || null;
  }

  /**
   * Lista todos os acordes disponíveis no treinamento
   */
  getAvailableChords(): string[] {
    return Array.from(this.chordProfiles.keys());
  }

  /**
   * Verifica se um acorde tem dados de treinamento
   */
  hasTrainingData(chord: string): boolean {
    return this.chordProfiles.has(chord);
  }
}

export const guitarSetAITrainingService = new GuitarSetAITrainingService();
