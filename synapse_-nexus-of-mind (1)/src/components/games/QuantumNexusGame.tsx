/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { LevelData } from '../../types/game';
import { soundEngine } from '../../services/soundEngine';
import { Sparkles, Brain, CheckCircle, ArrowRight, RotateCcw } from 'lucide-react';

interface QuantumNexusGameProps {
  level: LevelData;
  onSuccess: () => void;
  onMistake?: () => void;
}

export const QuantumNexusGame: React.FC<QuantumNexusGameProps> = ({ level, onSuccess, onMistake }) => {
  const { config } = level;
  const [currentStage, setCurrentStage] = useState<1 | 2 | 3>(1);
  const [errorFeedback, setErrorFeedback] = useState<string | null>(null);

  // Stage 1: Math state
  const [selectedMathOption, setSelectedMathOption] = useState<number | null>(null);

  // Stage 2: Memory state
  const [memoryInputSeq, setMemoryInputSeq] = useState<number[]>([]);
  const [isShowingSequence, setIsShowingSequence] = useState(false);
  const [activeHighlightIndex, setActiveHighlightIndex] = useState<number | null>(null);

  // Stage 3: Logic gate state
  const [logicSelectedOutput, setLogicSelectedOutput] = useState<boolean | null>(null);

  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  };

  useEffect(() => {
    return () => clearAllTimeouts();
  }, []);

  // Start sequence playback for Stage 2
  const playMemorySequence = () => {
    clearAllTimeouts();
    setIsShowingSequence(true);
    setMemoryInputSeq([]);
    const seq: number[] = config.memorySequence || [0, 4, 8];
    seq.forEach((nodeIdx, idx) => {
      const t1 = setTimeout(() => {
        setActiveHighlightIndex(nodeIdx);
        soundEngine.playNodeChime(nodeIdx);
        const t2 = setTimeout(() => {
          setActiveHighlightIndex(null);
          if (idx === seq.length - 1) {
            setIsShowingSequence(false);
          }
        }, 320);
        timeoutsRef.current.push(t2);
      }, (idx + 1) * 450);
      timeoutsRef.current.push(t1);
    });
  };

  // Math handler
  const handleSelectMath = (opt: number) => {
    soundEngine.playClick();
    setSelectedMathOption(opt);
    setErrorFeedback(null);

    if (opt === config.mathAnswer) {
      soundEngine.playNodeChime(4);
      const t = setTimeout(() => {
        setCurrentStage(2);
        playMemorySequence();
      }, 400);
      timeoutsRef.current.push(t);
    } else {
      soundEngine.playSoftMistake();
      setErrorFeedback('Equation not balanced. Re-evaluate values.');
      onMistake?.();
      const t = setTimeout(() => {
        setSelectedMathOption(null);
        setErrorFeedback(null);
      }, 700);
      timeoutsRef.current.push(t);
    }
  };

  // Memory node tap handler
  const handleMemoryNodeTap = (nodeIdx: number) => {
    if (isShowingSequence) return;
    soundEngine.playNodeChime(nodeIdx);
    soundEngine.triggerHaptic(15);

    const nextInput = [...memoryInputSeq, nodeIdx];
    setMemoryInputSeq(nextInput);

    const expectedSeq: number[] = config.memorySequence || [];
    const currentStep = nextInput.length - 1;

    if (nextInput[currentStep] !== expectedSeq[currentStep]) {
      soundEngine.playSoftMistake();
      setErrorFeedback('Sequence divergence detected. Recalibrating...');
      onMistake?.();
      setTimeout(() => {
        setErrorFeedback(null);
        playMemorySequence();
      }, 800);
      return;
    }

    if (nextInput.length === expectedSeq.length) {
      soundEngine.playNodeChime(6);
      setTimeout(() => {
        setCurrentStage(3);
      }, 450);
    }
  };

  // Logic gate answer handler
  const handleLogicSelect = (val: boolean) => {
    soundEngine.playClick();
    setLogicSelectedOutput(val);

    if (val === config.logicExpected) {
      soundEngine.playSuccess();
      onSuccess();
    } else {
      soundEngine.playSoftMistake();
      setErrorFeedback('Boolean gate logic mismatch. Check input states.');
      onMistake?.();
      setTimeout(() => {
        setLogicSelectedOutput(null);
        setErrorFeedback(null);
      }, 750);
    }
  };

  // Keyboard shortcut listener for laptop/desktop across all 3 phases
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Phase 1: Math options 1-4
      if (currentStage === 1 && config.mathOptions) {
        const num = parseInt(e.key, 10);
        if (!isNaN(num) && num >= 1 && num <= config.mathOptions.length) {
          handleSelectMath(config.mathOptions[num - 1]);
        }
      }
      // Phase 2: Memory sequence 1-9
      else if (currentStage === 2 && !isShowingSequence) {
        const total = (config.gridDimension || 3) * (config.gridDimension || 3);
        const num = parseInt(e.key, 10);
        if (!isNaN(num) && num >= 1 && num <= total) {
          handleMemoryNodeTap(num - 1);
        }
      }
      // Phase 3: Boolean logic (1/T = true, 0/F = false)
      else if (currentStage === 3) {
        if (e.key === '1' || e.key === 't' || e.key === 'T') {
          handleLogicSelect(true);
        } else if (e.key === '0' || e.key === 'f' || e.key === 'F') {
          handleLogicSelect(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStage, config, isShowingSequence, memoryInputSeq]);

  return (
    <div className="flex flex-col items-center justify-center p-2 sm:p-4 md:p-6 w-full max-w-2xl mx-auto">
      {/* Mixed Mode Header Indicator */}
      <div className="w-full flex items-center justify-between mb-4 sm:mb-6 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2 min-w-0">
          <Sparkles className="w-5 h-5 text-fuchsia-400 animate-pulse shrink-0" />
          <span className="text-xs sm:text-sm font-semibold tracking-wide text-fuchsia-400 uppercase truncate">
            Quantum Nexus Fusion
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span className={currentStage === 1 ? 'text-amber-400 font-bold' : ''}>1. Math</span>
          <span>→</span>
          <span className={currentStage === 2 ? 'text-cyan-400 font-bold' : ''}>2. Memory</span>
          <span>→</span>
          <span className={currentStage === 3 ? 'text-rose-400 font-bold' : ''}>3. Logic</span>
        </div>
      </div>

      {/* Stage Container */}
      <div className="w-full glass-panel rounded-2xl p-6 md:p-8 relative overflow-hidden transition-all duration-300">
        {/* Glow ambient background based on stage */}
        <div
          className={`absolute -top-24 -right-24 w-60 h-60 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-500 ${
            currentStage === 1
              ? 'bg-amber-500'
              : currentStage === 2
              ? 'bg-cyan-500'
              : 'bg-rose-500'
          }`}
        />

        {/* STAGE 1: MATH */}
        {currentStage === 1 && (
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="space-y-1">
              <span className="text-xs uppercase tracking-widest text-amber-400 font-mono">
                Phase 1 of 3: Arithmetic Equilibrium
              </span>
              <h3 className="text-2xl font-bold text-white">Solve the Primary Invariant</h3>
            </div>

            <div className="py-6 px-8 rounded-xl bg-black/40 border border-amber-500/30 glow-amber">
              <span className="text-3xl md:text-4xl font-mono font-bold tracking-wider text-amber-300">
                {config.mathPrompt}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-md pt-2">
              {config.mathOptions?.map((opt: number, idx: number) => (
                <button
                  key={idx}
                  onClick={() => handleSelectMath(opt)}
                  className={`py-3.5 px-4 rounded-xl font-mono text-lg font-semibold transition-all duration-150 border ${
                    selectedMathOption === opt
                      ? opt === config.mathAnswer
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 scale-95'
                        : 'bg-rose-500/20 border-rose-500 text-rose-300'
                      : 'bg-white/5 border-white/10 hover:border-amber-400/50 hover:bg-amber-500/10 text-slate-100 hover:scale-[1.02]'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STAGE 2: MEMORY */}
        {currentStage === 2 && (
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="space-y-1">
              <span className="text-xs uppercase tracking-widest text-cyan-400 font-mono">
                Phase 2 of 3: Synaptic Trajectory
              </span>
              <h3 className="text-2xl font-bold text-white">
                {isShowingSequence ? 'Observe the Pulse Sequence...' : 'Replay the Synaptic Path'}
              </h3>
            </div>

            {/* Memory Grid */}
            <div
              className="grid gap-3 p-4 bg-black/40 rounded-2xl border border-cyan-500/30 glow-cyan"
              style={{ gridTemplateColumns: `repeat(${config.gridDimension || 3}, minmax(0, 1fr))` }}
            >
              {Array.from({ length: (config.gridDimension || 3) * (config.gridDimension || 3) }).map((_, idx) => {
                const isLit = activeHighlightIndex === idx;
                const isPressed = memoryInputSeq.includes(idx);
                const isTwo = (config.gridDimension || 3) === 2;
                return (
                  <button
                    key={idx}
                    disabled={isShowingSequence}
                    onClick={() => handleMemoryNodeTap(idx)}
                    className={`rounded-xl flex items-center justify-center transition-all duration-150 border ${
                      isTwo ? 'w-22 h-22 sm:w-26 sm:h-26' : 'w-16 h-16 md:w-20 md:h-20'
                    } ${
                      isLit
                        ? 'bg-cyan-400 border-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.8)] scale-105'
                        : isPressed
                        ? 'bg-cyan-900/60 border-cyan-500/70 text-cyan-200'
                        : 'bg-white/5 border-white/10 hover:border-cyan-400/40 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    <span className="font-mono text-xs text-white/40">{idx + 1}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3">
              <button
                disabled={isShowingSequence}
                onClick={playMemorySequence}
                className="text-xs text-cyan-400 hover:text-cyan-300 hover:underline transition-colors"
              >
                Replay Pulse Sequence
              </button>
              <span className="text-xs text-slate-500">·</span>
              <span className="text-xs font-mono text-slate-400">
                Progress: {memoryInputSeq.length} / {config.memorySequence?.length || 3}
              </span>
            </div>
          </div>
        )}

        {/* STAGE 3: LOGIC */}
        {currentStage === 3 && (
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="space-y-1">
              <span className="text-xs uppercase tracking-widest text-rose-400 font-mono">
                Phase 3 of 3: Boolean Gate Synthesis
              </span>
              <h3 className="text-2xl font-bold text-white">Determine Gate Output</h3>
            </div>

            <div className="flex flex-col items-center gap-4 py-6 px-8 rounded-xl bg-black/40 border border-rose-500/30 glow-magenta w-full max-w-sm">
              <div className="flex items-center justify-center gap-4 text-sm font-mono text-slate-300">
                <span className="px-3 py-1 rounded bg-white/5 border border-white/10">
                  Input A: <strong className={config.logicInputA ? 'text-emerald-400' : 'text-rose-400'}>{config.logicInputA ? '1 (TRUE)' : '0 (FALSE)'}</strong>
                </span>
                <span className="px-3 py-1 rounded bg-white/5 border border-white/10">
                  Input B: <strong className={config.logicInputB ? 'text-emerald-400' : 'text-rose-400'}>{config.logicInputB ? '1 (TRUE)' : '0 (FALSE)'}</strong>
                </span>
              </div>

              <div className="flex items-center gap-3 text-xl font-bold font-mono text-rose-300">
                <span>GATE:</span>
                <span className="px-4 py-1.5 rounded-lg bg-rose-500/20 border border-rose-500/40 tracking-wider">
                  {config.logicGate}
                </span>
              </div>

              <p className="text-xs text-slate-400 max-w-xs">
                {config.logicGate === 'AND' && 'Both inputs must be TRUE for the gate to fire.'}
                {config.logicGate === 'OR' && 'At least one input must be TRUE for the gate to fire.'}
                {config.logicGate === 'XOR' && 'Exactly ONE input must be TRUE (exclusive OR).'}
              </p>
            </div>

            <div className="flex items-center gap-4 w-full max-w-xs">
              <button
                onClick={() => handleLogicSelect(true)}
                className={`flex-1 py-3 px-4 rounded-xl font-mono font-semibold transition-all border ${
                  logicSelectedOutput === true
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                    : 'bg-white/5 border-white/10 hover:border-emerald-400/50 hover:bg-emerald-500/10 text-white'
                }`}
              >
                TRUE (1)
              </button>
              <button
                onClick={() => handleLogicSelect(false)}
                className={`flex-1 py-3 px-4 rounded-xl font-mono font-semibold transition-all border ${
                  logicSelectedOutput === false
                    ? 'bg-rose-500/20 border-rose-400 text-rose-300'
                    : 'bg-white/5 border-white/10 hover:border-rose-400/50 hover:bg-rose-500/10 text-white'
                }`}
              >
                FALSE (0)
              </button>
            </div>
          </div>
        )}

        {/* Error Feedback Banner with explicit Retry option */}
        {errorFeedback && (
          <div className="mt-4 p-3 bg-rose-500/15 border border-rose-500/40 rounded-xl flex items-center justify-between gap-3 text-xs font-mono text-rose-300 animate-in fade-in w-full max-w-md">
            <span className="flex items-center gap-2">
              <span className="text-sm">⚠️</span>
              <span>{errorFeedback}</span>
            </span>
            <button
              onClick={() => {
                setErrorFeedback(null);
                setSelectedMathOption(null);
                setMemoryInputSeq([]);
                setLogicSelectedOutput(null);
                if (currentStage === 2) {
                  playMemorySequence();
                }
              }}
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
