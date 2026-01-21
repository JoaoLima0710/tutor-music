import React from 'react';
import { Metronome } from '../components/audio/Metronome';
import { Tuner } from '../components/audio/Tuner';

export function ToolsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Ferramentas</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <Metronome />
        <Tuner />
      </div>
    </div>
  );
}

export default ToolsPage;
