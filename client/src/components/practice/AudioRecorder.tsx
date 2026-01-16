import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square, Play, Pause, Download, Trash2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { audioRecorderService, Recording } from '@/services/AudioRecorderService';
import { useRecordingStore } from '@/stores/useRecordingStore';
import { toast } from 'sonner';

interface AudioRecorderProps {
  songId?: string;
  songName?: string;
  onRecordingComplete?: (recording: Recording) => void;
}

export function AudioRecorder({ songId, songName, onRecordingComplete }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentRecording, setCurrentRecording] = useState<Recording | null>(null);
  
  const { recordings, addRecording, removeRecording } = useRecordingStore();
  const songRecordings = songId ? recordings.filter(r => r.songId === songId) : recordings;
  
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setDuration(audioRecorderService.getDuration());
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording, isPaused]);
  
  const handleStartRecording = async () => {
    if (!isInitialized) {
      const initialized = await audioRecorderService.initialize();
      if (!initialized) {
        toast.error('Não foi possível acessar o microfone');
        return;
      }
      setIsInitialized(true);
    }
    
    const started = await audioRecorderService.startRecording();
    if (started) {
      setIsRecording(true);
      setIsPaused(false);
      setDuration(0);
      setCurrentRecording(null);
      toast.success('Gravação iniciada');
    } else {
      toast.error('Erro ao iniciar gravação');
    }
  };
  
  const handleStopRecording = async () => {
    const recording = await audioRecorderService.stopRecording();
    
    if (recording) {
      // Add metadata
      const enrichedRecording: Recording = {
        ...recording,
        songId,
        name: songName 
          ? `${songName} - ${new Date().toLocaleDateString('pt-BR')}`
          : recording.name,
      };
      
      addRecording(enrichedRecording);
      setCurrentRecording(enrichedRecording);
      setIsRecording(false);
      setIsPaused(false);
      setDuration(0);
      
      toast.success('Gravação salva com sucesso!');
      
      if (onRecordingComplete) {
        onRecordingComplete(enrichedRecording);
      }
    }
  };
  
  const handlePauseResume = () => {
    if (isPaused) {
      audioRecorderService.resumeRecording();
      setIsPaused(false);
      toast.info('Gravação retomada');
    } else {
      audioRecorderService.pauseRecording();
      setIsPaused(true);
      toast.info('Gravação pausada');
    }
  };
  
  const handleDownload = (recording: Recording) => {
    audioRecorderService.downloadRecording(recording);
    toast.success('Download iniciado');
  };
  
  const handleDelete = (id: string) => {
    removeRecording(id);
    toast.success('Gravação excluída');
  };
  
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  return (
    <div className="space-y-6">
      {/* Recording Controls */}
      <div className="rounded-3xl p-8 bg-gradient-to-br from-[#1a1a2e] to-[#16162a] border border-white/10 shadow-2xl">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-white mb-2">Gravação de Áudio</h3>
          <p className="text-gray-400">Grave sua sessão de prática para revisar depois</p>
        </div>
        
        {/* Recording Status */}
        <AnimatePresence>
          {isRecording && (
            <motion.div
              className="mb-6"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <div className="flex items-center justify-center gap-4 p-6 rounded-2xl bg-gradient-to-r from-[#ef4444]/20 to-[#dc2626]/20 border border-[#ef4444]/50">
                <motion.div
                  className="w-4 h-4 rounded-full bg-[#ef4444]"
                  animate={{
                    scale: isPaused ? 1 : [1, 1.2, 1],
                    opacity: isPaused ? 0.5 : [1, 0.5, 1],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-white" />
                  <span className="text-3xl font-mono font-bold text-white">
                    {formatDuration(duration)}
                  </span>
                </div>
                {isPaused && (
                  <span className="px-3 py-1 rounded-full bg-[#f97316] text-white text-sm font-semibold">
                    PAUSADO
                  </span>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Current Recording Preview */}
        {currentRecording && (
          <motion.div
            className="mb-6 p-4 rounded-2xl bg-[#10b981]/20 border border-[#10b981]/50"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <p className="text-sm text-gray-400">Última gravação</p>
                <p className="font-semibold text-white">{currentRecording.name}</p>
              </div>
              <audio
                src={currentRecording.url}
                controls
                className="h-10"
              />
            </div>
          </motion.div>
        )}
        
        {/* Control Buttons */}
        <div className="flex gap-3">
          {!isRecording ? (
            <Button
              onClick={handleStartRecording}
              size="lg"
              className="flex-1 bg-gradient-to-r from-[#ef4444] to-[#dc2626] hover:from-[#f87171] hover:to-[#ef4444] text-white font-bold h-14"
            >
              <Mic className="w-5 h-5 mr-2" />
              Iniciar Gravação
            </Button>
          ) : (
            <>
              <Button
                onClick={handlePauseResume}
                size="lg"
                variant="outline"
                className="flex-1 bg-transparent border-white/20 text-gray-300 hover:bg-white/5 h-14"
              >
                {isPaused ? (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    Retomar
                  </>
                ) : (
                  <>
                    <Pause className="w-5 h-5 mr-2" />
                    Pausar
                  </>
                )}
              </Button>
              <Button
                onClick={handleStopRecording}
                size="lg"
                className="flex-1 bg-gradient-to-r from-[#10b981] to-[#059669] hover:from-[#34d399] hover:to-[#10b981] text-white font-bold h-14"
              >
                <Square className="w-5 h-5 mr-2" />
                Parar e Salvar
              </Button>
            </>
          )}
        </div>
      </div>
      
      {/* Recordings List */}
      {songRecordings.length > 0 && (
        <div className="rounded-3xl p-6 bg-[#1a1a2e]/60 backdrop-blur-xl border border-white/10">
          <h4 className="text-xl font-bold text-white mb-4">
            Gravações Salvas ({songRecordings.length})
          </h4>
          
          <div className="space-y-3">
            {songRecordings.map((recording) => (
              <motion.div
                key={recording.id}
                className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-1">
                    <p className="font-semibold text-white">{recording.name}</p>
                    <div className="flex items-center gap-3 text-sm text-gray-400">
                      <span>{formatDate(recording.date)}</span>
                      <span>•</span>
                      <span>{formatDuration(recording.duration)}</span>
                      {recording.accuracy && (
                        <>
                          <span>•</span>
                          <span className="text-[#06b6d4]">{recording.accuracy}% acurácia</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleDownload(recording)}
                      size="sm"
                      variant="outline"
                      className="bg-transparent border-white/20 text-gray-300 hover:bg-white/5"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleDelete(recording.id)}
                      size="sm"
                      variant="outline"
                      className="bg-transparent border-[#ef4444]/50 text-[#ef4444] hover:bg-[#ef4444]/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {recording.url && (
                  <audio
                    src={recording.url}
                    controls
                    className="w-full h-10"
                  />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
