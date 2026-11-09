/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { LevelData } from '../../types/game';
import { soundEngine } from '../../services/soundEngine';
import { Wind, Volume2, Sparkles, CheckCircle } from 'lucide-react';

interface ZenResonatorGameProps {
  level: LevelData;
  onSuccess: () => void;
}

export const ZenResonatorGame: React.FC<ZenResonatorGameProps> = ({ level, onSuccess }) => {
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [secondsRemaining, setSecondsRemaining] = useState(4);
  const [completedCycles, setCompletedCycles] = useState(0);
  const targetCycles = level.config.cycles || 3;

  useEffect(() => {
    // Enable ambient drone automatically for Zen interlude
    soundEngine.toggleAmbient(true);

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev > 1) {
          return prev - 1;
        }

        // Phase transition
        setPhase((currentPhase) => {
          if (currentPhase === 'inhale') {
            soundEngine.playNodeChime(2);
            return 'hold';
          }
          if (currentPhase === 'hold') {
            soundEngine.playNodeChime(1);
            return 'exhale';
          }
          if (currentPhase === 'exhale') {
            soundEngine.playNodeChime(4);
            setCompletedCycles((c) => {
              const nextC = c + 1;
              if (nextC >= targetCycles) {
                setTimeout(() => {
                  soundEngine.playSuccess();
                  onSuccess();
                }, 500);
              }
              return nextC;
            });
            return 'inhale';
          }
          return 'inhale';
        });

        return 4;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [targetCycles, onSuccess]);

  return (
    <div className="flex flex-col items-center justify-center p-4 md:p-6 w-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="w-full flex items-center justify-between mb-4 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Wind className="w-5 h-5 text-violet-400" />
          <span className="text-sm font-semibold tracking-wide text-violet-400 uppercase">
            Zen Waveform Synchronizer
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Volume2 className="w-4 h-4 text-violet-400 animate-pulse" />
          <span>Binaural 4Hz Resonance</span>
        </div>
      </div>

      <div className="w-full glass-panel rounded-2xl p-4 sm:p-8 md:p-12 flex flex-col items-center text-center relative overflow-hidden">
        <p className="text-xs text-slate-400 mb-6 max-w-sm px-2">
          Cognitive interlude. Synchronize your inhalation and exhalation to relieve neural fatigue and restore fluid focus.
        </p>

        {/* Breathing Orb */}
        <div className="relative flex items-center justify-center my-4 sm:my-6">
          {/* Outer glow ring */}
          <div
            className={`w-40 h-40 sm:w-48 sm:h-48 md:w-60 md:h-60 rounded-full border border-violet-400/30 transition-all duration-1000 ease-in-out flex items-center justify-center ${
              phase === 'inhale'
                ? 'scale-110 sm:scale-125 bg-violet-600/20 shadow-[0_0_50px_rgba(139,92,246,0.4)]'
                : phase === 'hold'
                ? 'scale-110 sm:scale-125 bg-teal-500/20 shadow-[0_0_50px_rgba(20,184,166,0.4)]'
                : 'scale-90 bg-violet-900/10 shadow-[0_0_20px_rgba(139,92,246,0.2)]'
            }`}
          >
            {/* Core Orb */}
            <div
              className={`w-24 h-24 sm:w-28 sm:h-28 md:w-36 md:h-36 rounded-full flex flex-col items-center justify-center transition-all duration-1000 ease-in-out border ${
                phase === 'inhale'
                  ? 'border-violet-300 bg-violet-500/30'
                  : phase === 'hold'
                  ? 'border-teal-300 bg-teal-500/30'
                  : 'border-violet-400/40 bg-violet-900/30'
              }`}
            >
              <span className="text-xs sm:text-sm md:text-base font-bold uppercase tracking-widest text-white">
                {phase}
              </span>
              <span className="font-mono text-xl sm:text-2xl font-bold text-violet-200 mt-0.5 sm:mt-1">
                {secondsRemaining}s
              </span>
            </div>
          </div>
        </div>

        {/* Cycle indicators */}
        <div className="flex items-center gap-3 mt-6 sm:mt-8">
          {Array.from({ length: targetCycles }).map((_, idx) => (
            <div
              key={idx}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                idx < completedCycles
                  ? 'bg-violet-400 shadow-[0_0_10px_rgba(139,92,246,0.8)]'
                  : 'bg-white/10 border border-white/20'
              }`}
            />
          ))}
        </div>

        {/* Quick Skip Button */}
        <button
          onClick={() => {
            soundEngine.playSuccess();
            onSuccess();
          }}
          className="min-h-[44px] px-3 mt-6 sm:mt-8 text-xs text-slate-500 hover:text-slate-300 transition-colors flex items-center justify-center"
        >
          Skip Interlude & Continue Synapse →
        </button>
      </div>
    </div>
  );
};
