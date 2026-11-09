/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { LevelData } from '../../types/game';
import { soundEngine } from '../../services/soundEngine';
import { BrainCircuit, Play, RotateCcw } from 'lucide-react';

interface SynapticSequenceGameProps {
  level: LevelData;
  onSuccess: () => void;
  onMistake?: () => void;
}

export const SynapticSequenceGame: React.FC<SynapticSequenceGameProps> = ({ level, onSuccess, onMistake }) => {
  const { config } = level;
  const matrixDimension: number = config.matrixDimension || 3;
  const totalTiles: number = config.totalTiles || matrixDimension * matrixDimension;
  const sequence: number[] = config.sequence || [0, 2, 4, 7];
  const displaySpeedMs: number = config.displaySpeedMs || 500;

  const [activeLitIndex, setActiveLitIndex] = useState<number | null>(null);
  const [isPlayingSequence, setIsPlayingSequence] = useState(false);
  const [userInputs, setUserInputs] = useState<number[]>([]);
  const [errorPrompt, setErrorPrompt] = useState<string | null>(null);
  const timeoutRefs = useRef<NodeJS.Timeout[]>([]);

  const clearTimeouts = () => {
    timeoutRefs.current.forEach(clearTimeout);
    timeoutRefs.current = [];
  };

  const playSequence = () => {
    clearTimeouts();
    setIsPlayingSequence(true);
    setUserInputs([]);
    setActiveLitIndex(null);
    setErrorPrompt(null);

    sequence.forEach((nodeIdx, stepIdx) => {
      const delay = (stepIdx + 1) * displaySpeedMs;
      const t = setTimeout(() => {
        setActiveLitIndex(nodeIdx);
        soundEngine.playNodeChime(nodeIdx);
        soundEngine.triggerHaptic(12);

        const offT = setTimeout(() => {
          setActiveLitIndex(null);
          if (stepIdx === sequence.length - 1) {
            setIsPlayingSequence(false);
          }
        }, Math.max(180, displaySpeedMs * 0.7));
        timeoutRefs.current.push(offT);
      }, delay);
      timeoutRefs.current.push(t);
    });
  };

  useEffect(() => {
    const startTimer = setTimeout(() => {
      playSequence();
    }, 400);

    return () => {
      clearTimeout(startTimer);
      clearTimeouts();
    };
  }, [level]);

  const handleTileTap = (idx: number) => {
    if (isPlayingSequence) return;
    soundEngine.playNodeChime(idx);
    soundEngine.triggerHaptic(15);

    setActiveLitIndex(idx);
    setTimeout(() => setActiveLitIndex(null), 200);

    const nextInputs = [...userInputs, idx];
    setUserInputs(nextInputs);

    const currentStep = nextInputs.length - 1;

    // Check validity of current step
    if (nextInputs[currentStep] !== sequence[currentStep]) {
      soundEngine.playSoftMistake();
      setErrorPrompt('Synaptic pathway deviated. Recalibrating sequence...');
      onMistake?.();
      setTimeout(() => {
        playSequence();
      }, 700);
      return;
    }

    // Check if entire sequence completed
    if (nextInputs.length === sequence.length) {
      soundEngine.playSuccess();
      onSuccess();
    }
  };

  // Keyboard shortcut listener for laptop/desktop (keys 1-9 tap corresponding node)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPlayingSequence) return;
      const num = parseInt(e.key, 10);
      if (!isNaN(num) && num >= 1 && num <= totalTiles) {
        handleTileTap(num - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlayingSequence, totalTiles, userInputs, sequence]);

  return (
    <div className="flex flex-col items-center justify-center p-2 sm:p-4 md:p-6 w-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="w-full flex items-center justify-between mb-4 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2 min-w-0">
          <BrainCircuit className="w-5 h-5 text-cyan-400 shrink-0" />
          <span className="text-xs sm:text-sm font-semibold tracking-wide text-cyan-400 uppercase truncate">
            Synaptic Trajectory Recall
          </span>
        </div>
        <button
          disabled={isPlayingSequence}
          onClick={playSequence}
          className="min-h-[44px] px-2 flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 disabled:opacity-50 transition-colors shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Replay</span>
        </button>
      </div>

      <div className="w-full glass-panel rounded-2xl p-4 sm:p-6 md:p-8 flex flex-col items-center">
        <p className="text-xs text-slate-400 mb-6 text-center max-w-md px-2">
          {isPlayingSequence
            ? 'Observe the glowing neural pulse sequence...'
            : `Replicate the ${sequence.length}-step synaptic sequence in exact order (Tap or press 1-${totalTiles}).`}
        </p>

        {/* Matrix Grid */}
        <div
          className="grid gap-3 p-4 bg-black/60 rounded-2xl border border-cyan-500/20 glow-cyan"
          style={{ gridTemplateColumns: `repeat(${matrixDimension}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: totalTiles }).map((_, idx) => {
            const isLit = activeLitIndex === idx;
            return (
              <button
                key={idx}
                disabled={isPlayingSequence}
                onClick={() => handleTileTap(idx)}
                className={`rounded-2xl flex items-center justify-center font-mono transition-all duration-150 border active:scale-95 ${
                  matrixDimension === 2
                    ? 'w-24 h-24 sm:w-28 sm:h-28 text-base font-bold'
                    : matrixDimension === 3
                    ? 'w-16 h-16 sm:w-20 sm:h-20 text-xs'
                    : matrixDimension === 4
                    ? 'w-12 h-12 sm:w-14 sm:h-14 text-xs'
                    : 'w-9 h-9 sm:w-11 sm:h-11 text-[10px]'
                } ${
                  isLit
                    ? 'bg-cyan-400 border-cyan-300 shadow-[0_0_25px_rgba(6,182,212,0.9)] scale-105 text-black font-bold'
                    : 'bg-white/5 border-white/10 hover:border-cyan-400/50 hover:bg-cyan-500/10 text-slate-300'
                }`}
              >
                <span>{idx + 1}</span>
              </button>
            );
          })}
        </div>

        {/* Progress Tracker Bar */}
        <div className="mt-8 flex flex-col items-center gap-2 w-full max-w-xs">
          <div className="flex items-center justify-between w-full text-xs font-mono text-slate-400">
            <span>Accuracy Track</span>
            <span className="text-cyan-400">
              {userInputs.length} / {sequence.length}
            </span>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-cyan-400 transition-all duration-200"
              style={{ width: `${(userInputs.length / sequence.length) * 100}%` }}
            />
          </div>
        </div>

        {errorPrompt && (
          <div className="mt-6 p-3 bg-rose-500/15 border border-rose-500/40 rounded-xl flex items-center justify-between gap-3 text-xs font-mono text-rose-300 animate-in fade-in w-full max-w-sm">
            <span className="flex items-center gap-2">
              <span className="text-sm">⚠️</span>
              <span>{errorPrompt}</span>
            </span>
            <button
              onClick={playSequence}
              className="px-3 py-1.5 bg-rose-500/25 hover:bg-rose-500/40 border border-rose-400/60 text-rose-200 rounded-lg flex items-center gap-1.5 transition-all active:scale-95 text-xs font-semibold shrink-0 shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
