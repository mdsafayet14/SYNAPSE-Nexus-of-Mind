/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { LevelTarget, ShapeGlyphConfig, TargetStatus } from '../types/synapse';
import {
  generateTenTargetsForLevel,
  getBandForLevel,
  getLevelDifficultyRating
} from '../services/thousandLevelEngine';
import { soundEngine } from '../services/soundEngine';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ShieldAlert,
  Trophy,
  Play
} from 'lucide-react';

interface LevelArenaProps {
  levelNumber: number;
  hapticsEnabled: boolean;
  onLevelCleared: (levelNumber: number, correctCount: number, wrongCount: number) => void;
  onAdvanceLevel: (nextLevel: number) => void;
  onReturnHub: () => void;
}

type ArenaPhase = 'PLAYING' | 'PASSED' | 'FAILED';

const SpatialGlyph: React.FC<{
  glyph: { kind: 'dots' | 'arrow'; grid?: number[][]; rotation?: number } | null;
  size?: 'sm' | 'md';
  accentColor?: string;
}> = ({ glyph, size = 'md', accentColor = '#38BDF8' }) => {
  if (!glyph) {
    return (
      <div
        className={`flex items-center justify-center rounded-xl border border-dashed border-cyan-400/50 bg-cyan-500/5 text-cyan-300 font-mono font-bold ${
          size === 'sm' ? 'w-11 h-11 text-sm' : 'w-14 h-14 sm:w-16 sm:h-16 text-lg'
        }`}
      >
        ?
      </div>
    );
  }

  if (glyph.kind === 'arrow') {
    return (
      <div
        className={`flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] ${
          size === 'sm' ? 'w-11 h-11' : 'w-14 h-14 sm:w-16 sm:h-16'
        }`}
      >
        <ArrowUp
          className={size === 'sm' ? 'w-5 h-5' : 'w-7 h-7'}
          style={{
            color: accentColor,
            transform: `rotate(${glyph.rotation || 0}deg)`,
            transition: 'transform 180ms ease'
          }}
        />
      </div>
    );
  }

  const grid = glyph.grid || [
    [0, 0],
    [0, 0]
  ];
  const dim = grid.length;

  return (
    <div
      className={`grid gap-1 p-1.5 rounded-xl border border-white/10 bg-white/[0.03] ${
        size === 'sm' ? 'w-11 h-11' : 'w-14 h-14 sm:w-16 sm:h-16'
      }`}
      style={{ gridTemplateColumns: `repeat(${dim}, minmax(0, 1fr))` }}
    >
      {grid.flatMap((row, r) =>
        row.map((val, c) => (
          <span
            key={`${r}-${c}`}
            className={`rounded-full ${
              val === 1
                ? 'bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.7)]'
                : 'bg-white/10'
            }`}
          />
        ))
      )}
    </div>
  );
};

const PIP_POSITIONS: Record<number, [number, number][]> = {
  1: [[24, 24]],
  2: [
    [19, 19],
    [29, 29]
  ],
  3: [
    [24, 17],
    [18, 28],
    [30, 28]
  ],
  4: [
    [19, 19],
    [29, 19],
    [19, 29],
    [29, 29]
  ],
  5: [
    [18, 18],
    [30, 18],
    [24, 24],
    [18, 30],
    [30, 30]
  ],
  6: [
    [19, 17],
    [29, 17],
    [19, 24],
    [29, 24],
    [19, 31],
    [29, 31]
  ]
};

const PatternShapeGlyph: React.FC<{
  shape: ShapeGlyphConfig;
  size?: 'sm' | 'md';
  accentColor?: string;
}> = ({ shape, size = 'md', accentColor = '#38BDF8' }) => {
  const color = shape.color || accentColor;
  const isSolid = shape.fill !== 'outline';
  const fillVal = isSolid ? color : 'transparent';
  const fillOpacity = isSolid ? 0.88 : 1;
  const rot = shape.rotation || 0;
  const pips = shape.count ? PIP_POSITIONS[Math.min(6, Math.max(1, shape.count))] : null;

  const renderShapePath = () => {
    switch (shape.kind) {
      case 'circle':
        return <circle cx="24" cy="24" r="16" />;
      case 'triangle':
        return <polygon points="24,6 42,39 6,39" />;
      case 'square':
        return <rect x="8" y="8" width="32" height="32" rx="3" />;
      case 'diamond':
        return <polygon points="24,6 42,24 24,42 6,24" />;
      case 'pentagon':
        return <polygon points="24,6 41,18 35,39 13,39 7,18" />;
      case 'hexagon':
        return <polygon points="24,6 40,15 40,33 24,42 8,33 8,15" />;
      case 'star':
        return (
          <polygon points="24,5 29.2,16.5 42,18 32.5,26.8 35,39.5 24,33.2 13,39.5 15.5,26.8 6,18 18.8,16.5" />
        );
      case 'cross':
        return (
          <polygon points="19,7 29,7 29,19 41,19 41,29 29,29 29,41 19,41 19,29 7,29 7,19 19,19" />
        );
    }
  };

  return (
    <svg
      viewBox="0 0 48 48"
      className={size === 'sm' ? 'w-9 h-9' : 'w-11 h-11 sm:w-12 sm:h-12'}
      aria-hidden="true"
    >
      <g
        transform={`rotate(${rot} 24 24)`}
        fill={fillVal}
        fillOpacity={fillOpacity}
        stroke={color}
        strokeWidth="2.5"
        strokeLinejoin="round"
      >
        {renderShapePath()}
      </g>
      {pips &&
        pips.map(([cx, cy], idx) => (
          <circle
            key={idx}
            cx={cx}
            cy={cy}
            r="2.2"
            fill={isSolid ? '#03060c' : '#F8FAFC'}
          />
        ))}
    </svg>
  );
};

export const LevelArena: React.FC<LevelArenaProps> = ({
  levelNumber,
  hapticsEnabled,
  onLevelCleared,
  onAdvanceLevel,
  onReturnHub
}) => {
  const band = getBandForLevel(levelNumber);
  const difficultyRating = getLevelDifficultyRating(levelNumber);

  const [attemptNonce, setAttemptNonce] = useState(0);
  const [targets, setTargets] = useState<LevelTarget[]>(() =>
    generateTenTargetsForLevel(levelNumber, 0)
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [statuses, setStatuses] = useState<TargetStatus[]>(() =>
    Array.from({ length: 10 }, (_, idx) => (idx === 0 ? 'active' : 'pending'))
  );
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [phase, setPhase] = useState<ArenaPhase>('PLAYING');
  const [feedback, setFeedback] = useState<{
    isCorrect: boolean;
    selectedValue?: string;
    message: string;
  } | null>(null);

  // Memory state
  const [isPlayingSequence, setIsPlayingSequence] = useState(false);
  const [activeMemNode, setActiveMemNode] = useState<number | null>(null);
  const [memInputs, setMemInputs] = useState<number[]>([]);
  const [errorMemNode, setErrorMemNode] = useState<number | null>(null);

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const schedule = useCallback((fn: () => void, ms: number) => {
    const t = setTimeout(fn, ms);
    timersRef.current.push(t);
    return t;
  }, []);

  const resetLevelSession = useCallback(
    (nextNonce: number) => {
      clearTimers();
      setAttemptNonce(nextNonce);
      setTargets(generateTenTargetsForLevel(levelNumber, nextNonce));
      setCurrentIndex(0);
      setStatuses(Array.from({ length: 10 }, (_, idx) => (idx === 0 ? 'active' : 'pending')));
      setCorrectCount(0);
      setWrongCount(0);
      setPhase('PLAYING');
      setFeedback(null);
      setIsPlayingSequence(false);
      setActiveMemNode(null);
      setMemInputs([]);
      setErrorMemNode(null);
    },
    [clearTimers, levelNumber]
  );

  useEffect(() => {
    resetLevelSession(0);
    return () => clearTimers();
  }, [levelNumber, resetLevelSession, clearTimers]);

  const currentTarget = targets[currentIndex];

  const playMemorySequence = useCallback(
    (target: LevelTarget) => {
      if (!target.memoryConfig) return;
      clearTimers();
      setIsPlayingSequence(true);
      setMemInputs([]);
      setActiveMemNode(null);
      setErrorMemNode(null);

      const { sequence, pulseMs } = target.memoryConfig;
      sequence.forEach((nodeIdx, step) => {
        schedule(() => {
          setActiveMemNode(nodeIdx);
          soundEngine.playNodeChime(nodeIdx);
          if (hapticsEnabled) soundEngine.triggerHaptic(10);

          schedule(() => {
            setActiveMemNode(null);
            if (step === sequence.length - 1) {
              setIsPlayingSequence(false);
            }
          }, Math.max(140, pulseMs * 0.65));
        }, (step + 1) * pulseMs);
      });
    },
    [clearTimers, schedule, hapticsEnabled]
  );

  useEffect(() => {
    if (phase === 'PLAYING' && currentTarget?.type === 'memory' && !feedback) {
      const t = schedule(() => {
        playMemorySequence(currentTarget);
      }, 280);
      return () => clearTimeout(t);
    }
  }, [phase, currentIndex, currentTarget, feedback, playMemorySequence, schedule]);

  const resolveTarget = useCallback(
    (isCorrect: boolean, selectedValue?: string, customMsg?: string) => {
      if (feedback || phase !== 'PLAYING') return;

      setStatuses((prev) =>
        prev.map((s, idx) => (idx === currentIndex ? (isCorrect ? 'correct' : 'wrong') : s))
      );

      if (isCorrect) {
        soundEngine.playNodeChime(4);
        if (hapticsEnabled) soundEngine.triggerHaptic(15);
        const nextCorrect = correctCount + 1;
        setCorrectCount(nextCorrect);
        setFeedback({
          isCorrect: true,
          selectedValue,
          message: customMsg || 'Correct'
        });

        schedule(() => {
          setFeedback(null);
          if (currentIndex >= 9) {
            soundEngine.playSuccess();
            setPhase('PASSED');
            onLevelCleared(levelNumber, nextCorrect, wrongCount);
          } else {
            const nextIdx = currentIndex + 1;
            setStatuses((prev) => prev.map((s, idx) => (idx === nextIdx ? 'active' : s)));
            setCurrentIndex(nextIdx);
          }
        }, 460);
      } else {
        soundEngine.playSoftMistake();
        if (hapticsEnabled) soundEngine.triggerHaptic(30);
        const nextWrong = wrongCount + 1;
        setWrongCount(nextWrong);
        setFeedback({
          isCorrect: false,
          selectedValue,
          message:
            nextWrong >= 4
              ? `4 Mistakes — Limit Exceeded`
              : customMsg || `Wrong (${nextWrong}/3 max)`
        });

        schedule(() => {
          setFeedback(null);
          setErrorMemNode(null);
          if (nextWrong >= 4) {
            setPhase('FAILED');
          } else if (currentIndex >= 9) {
            soundEngine.playSuccess();
            setPhase('PASSED');
            onLevelCleared(levelNumber, correctCount, nextWrong);
          } else {
            const nextIdx = currentIndex + 1;
            setStatuses((prev) => prev.map((s, idx) => (idx === nextIdx ? 'active' : s)));
            setCurrentIndex(nextIdx);
          }
        }, 700);
      }
    },
    [
      feedback,
      phase,
      currentIndex,
      hapticsEnabled,
      correctCount,
      wrongCount,
      levelNumber,
      schedule,
      onLevelCleared
    ]
  );

  const handleSelectChoice = useCallback(
    (value: string) => {
      if (!currentTarget || feedback || phase !== 'PLAYING') return;
      resolveTarget(value === currentTarget.correctValue, value);
    },
    [currentTarget, feedback, phase, resolveTarget]
  );

  const handleTapMemoryTile = useCallback(
    (idx: number) => {
      if (!currentTarget?.memoryConfig || isPlayingSequence || feedback || phase !== 'PLAYING') {
        return;
      }
      const { sequence } = currentTarget.memoryConfig;
      const step = memInputs.length;

      soundEngine.playNodeChime(idx);
      if (hapticsEnabled) soundEngine.triggerHaptic(12);
      setActiveMemNode(idx);
      schedule(() => setActiveMemNode(null), 160);

      if (idx !== sequence[step]) {
        setErrorMemNode(idx);
        resolveTarget(false, String(idx), 'Sequence mismatch');
        return;
      }

      const nextInputs = [...memInputs, idx];
      setMemInputs(nextInputs);

      if (nextInputs.length === sequence.length) {
        resolveTarget(true, 'seq-ok', 'Sequence Complete');
      }
    },
    [currentTarget, isPlayingSequence, feedback, phase, memInputs, hapticsEnabled, schedule, resolveTarget]
  );

  // Keyboard support
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onReturnHub();
        return;
      }
      if (phase === 'PASSED' && (e.key === ' ' || e.key === 'Enter')) {
        e.preventDefault();
        if (levelNumber < 1000) onAdvanceLevel(levelNumber + 1);
        else onReturnHub();
        return;
      }
      if (phase === 'FAILED' && (e.key === ' ' || e.key === 'Enter')) {
        e.preventDefault();
        resetLevelSession(attemptNonce + 1);
        return;
      }
      if (phase !== 'PLAYING' || feedback || !currentTarget) return;

      const num = parseInt(e.key, 10);
      if (isNaN(num)) return;

      if (currentTarget.type === 'memory' && currentTarget.memoryConfig) {
        const total = currentTarget.memoryConfig.gridSize * currentTarget.memoryConfig.gridSize;
        if (num >= 1 && num <= total && !isPlayingSequence) {
          handleTapMemoryTile(num - 1);
        }
      } else if (currentTarget.choices && num >= 1 && num <= currentTarget.choices.length) {
        handleSelectChoice(currentTarget.choices[num - 1].value);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    phase,
    feedback,
    currentTarget,
    levelNumber,
    attemptNonce,
    isPlayingSequence,
    handleTapMemoryTile,
    handleSelectChoice,
    onAdvanceLevel,
    onReturnHub,
    resetLevelSession
  ]);

  const attempted = correctCount + wrongCount;
  const accuracy = attempted > 0 ? Math.round((correctCount / attempted) * 100) : 0;

  // ========================================================
  // SUMMARY OVERLAY (PASSED / FAILED)
  // ========================================================
  if (phase === 'PASSED' || phase === 'FAILED') {
    const passed = phase === 'PASSED';

    return (
      <div className="w-full max-w-lg mx-auto h-full min-h-0 px-4 py-4 flex flex-col justify-center overflow-hidden">
        <div
          className={`rounded-3xl glass-panel p-6 sm:p-7 border space-y-5 animate-modal-content ${
            passed
              ? 'border-emerald-500/35 shadow-[0_0_35px_-10px_rgba(16,185,129,0.35)]'
              : 'border-rose-500/40 shadow-[0_0_35px_-10px_rgba(244,63,94,0.35)]'
          }`}
        >
          <div className="flex flex-col items-center text-center space-y-2">
            <div
              className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${
                passed
                  ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-300'
                  : 'bg-rose-500/15 border-rose-400/40 text-rose-300'
              }`}
            >
              {passed ? <Trophy className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
            </div>

            <span
              className={`text-[11px] font-mono uppercase tracking-widest font-semibold ${
                passed ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {passed ? `Level ${levelNumber} Cleared` : `Level ${levelNumber} Failed`}
            </span>

            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {passed
                ? levelNumber < 1000
                  ? `Level ${levelNumber + 1} Unlocked`
                  : '1,000th Level Mastered!'
                : 'Retry / Replay Level Required'}
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-sm">
              {passed
                ? `Completed all 10 targets within the 3-mistake limit.`
                : `You made ${wrongCount} wrong answers out of 10 (max 3 mistakes allowed). Level ${levelNumber + 1} remains locked until you pass.`}
            </p>
          </div>

          {/* Real-time Score Summary */}
          <div className="grid grid-cols-3 gap-2.5 tabular-nums">
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.07] text-center">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Correct</span>
              <span className="text-xl font-mono font-bold text-emerald-400">
                {correctCount}
                <span className="text-xs text-slate-500">/10</span>
              </span>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.07] text-center">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Wrong</span>
              <span
                className={`text-xl font-mono font-bold ${
                  wrongCount >= 4 ? 'text-rose-400' : 'text-amber-400'
                }`}
              >
                {wrongCount}
                <span className="text-xs text-slate-500">/10</span>
              </span>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.07] text-center">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Accuracy</span>
              <span className="text-xl font-mono font-bold text-cyan-300">{accuracy}%</span>
            </div>
          </div>

          {/* 10-Target Outcome Strip */}
          <div className="grid grid-cols-10 gap-1.5">
            {statuses.map((s, i) => (
              <div
                key={i}
                className={`h-2 rounded-full ${
                  s === 'correct'
                    ? 'bg-emerald-400'
                    : s === 'wrong'
                    ? 'bg-rose-500'
                    : 'bg-white/10'
                }`}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
            {passed && levelNumber < 1000 ? (
              <button
                onClick={() => {
                  soundEngine.playClick();
                  onAdvanceLevel(levelNumber + 1);
                }}
                className="flex-1 min-h-[48px] px-5 py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
              >
                <span>Next: Level {levelNumber + 1}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => {
                  soundEngine.playClick();
                  resetLevelSession(attemptNonce + 1);
                }}
                className={`flex-1 min-h-[48px] px-5 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer ${
                  passed
                    ? 'bg-emerald-400 hover:bg-emerald-300 text-slate-950'
                    : 'bg-rose-500 hover:bg-rose-400 text-white shadow-lg shadow-rose-500/25'
                }`}
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retry / Replay Level {levelNumber}</span>
              </button>
            )}

            {passed && levelNumber < 1000 && (
              <button
                onClick={() => {
                  soundEngine.playClick();
                  resetLevelSession(attemptNonce + 1);
                }}
                className="min-h-[48px] px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Replay</span>
              </button>
            )}

            <button
              onClick={() => {
                soundEngine.playClick();
                onReturnHub();
              }}
              className="min-h-[48px] px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white font-semibold text-xs sm:text-sm flex items-center justify-center cursor-pointer"
            >
              Hub
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ========================================================
  // COMPACT SCROLL-FREE ACTIVE ARENA
  // ========================================================
  return (
    <div className="w-full max-w-2xl mx-auto h-full min-h-0 px-4 py-3 sm:py-5 flex flex-col justify-between gap-3 overflow-hidden">
      {/* Real-time Level & Target Tracker HUD */}
      <div className="shrink-0 rounded-2xl glass-panel p-3.5 sm:p-4 border border-white/[0.08] space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={() => {
                soundEngine.playClick();
                onReturnHub();
              }}
              className="min-h-[36px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Hub</span>
            </button>

            <div className="truncate">
              <span className="text-xs sm:text-sm font-mono font-bold text-white">
                Lvl {levelNumber}
              </span>
              <span className="text-[11px] font-mono text-slate-400 ml-2 hidden sm:inline">
                {band.academicTag} · {difficultyRating}/10
              </span>
            </div>
          </div>

          {/* Correct vs Wrong Real-time Counters */}
          <div className="flex items-center gap-3 text-xs font-mono tabular-nums shrink-0">
            <span className="text-emerald-400 font-semibold">
              Correct: <strong className="text-white">{correctCount}</strong>/10
            </span>
            <span className="text-slate-700">·</span>
            <span
              className={`font-semibold ${
                wrongCount >= 3 ? 'text-rose-400' : wrongCount >= 1 ? 'text-amber-400' : 'text-slate-300'
              }`}
            >
              Wrong: <strong>{wrongCount}</strong>/3 max
            </span>
          </div>
        </div>

        {/* 10-Target Progress Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-slate-400">
            <span>Target {currentIndex + 1} / 10</span>
            <span>{currentTarget?.categoryLabel}</span>
          </div>
          <div className="grid grid-cols-10 gap-1">
            {statuses.map((st, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-colors ${
                  st === 'correct'
                    ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]'
                    : st === 'wrong'
                    ? 'bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.5)]'
                    : st === 'active'
                    ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.7)]'
                    : 'bg-white/10'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main Target Interaction Card (Scroll-Free Fit) */}
      {currentTarget && (
        <div
          key={currentTarget.id}
          className="flex-1 min-h-0 rounded-2xl sm:rounded-3xl glass-panel p-4 sm:p-6 border border-white/10 flex flex-col justify-center gap-4 overflow-hidden animate-modal-content"
        >
          <div className="text-center space-y-1">
            <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-400 font-semibold">
              Target {currentIndex + 1} · {currentTarget.categoryLabel}
            </span>
            <h3 className="text-sm sm:text-base font-medium text-slate-200 max-w-md mx-auto leading-snug">
              {currentTarget.prompt}
            </h3>
          </div>

          {/* MATH & PATTERN LOGIC */}
          {(currentTarget.type === 'math' || currentTarget.type === 'logic') && (
            <div className="flex flex-col items-center gap-3 sm:gap-4">
              {currentTarget.patternVisual && (
                <div className="w-full flex flex-col items-center gap-2">
                  <span className="text-[11px] font-mono text-slate-400">
                    {currentTarget.patternVisual.subLabel}
                  </span>

                  {currentTarget.patternVisual.mode === 'series' &&
                    currentTarget.patternVisual.tokens && (
                      <div className="w-full py-3 sm:py-4 px-2.5 sm:px-4 rounded-2xl bg-[#04070f] border border-white/[0.08] flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
                        {currentTarget.patternVisual.tokens.map((tok, idx) => (
                          <React.Fragment key={idx}>
                            {idx > 0 && (
                              <span
                                className="text-slate-600 font-mono text-xs sm:text-sm select-none"
                                aria-hidden="true"
                              >
                                →
                              </span>
                            )}
                            <div
                              className={`min-w-[44px] sm:min-w-[54px] min-h-[44px] sm:min-h-[54px] px-2.5 py-1.5 rounded-xl border flex items-center justify-center ${
                                tok.isMissing
                                  ? 'border-dashed border-cyan-400/60 bg-cyan-500/10 text-cyan-300'
                                  : 'border-white/10 bg-white/[0.04] text-white'
                              }`}
                            >
                              {tok.shape ? (
                                <PatternShapeGlyph
                                  shape={tok.shape}
                                  accentColor={band.accentColor}
                                />
                              ) : (
                                <span className="font-mono font-bold text-sm sm:text-lg tabular-nums whitespace-nowrap">
                                  {tok.text || '?'}
                                </span>
                              )}
                            </div>
                          </React.Fragment>
                        ))}
                      </div>
                    )}
                </div>
              )}

              {currentTarget.expression && (
                <div className="w-full py-3.5 sm:py-4 px-3 rounded-2xl bg-[#04070f] border border-white/[0.08] text-center">
                  <span className="text-xl sm:text-2xl font-mono font-bold text-white tracking-wider tabular-nums">
                    {currentTarget.expression}
                  </span>
                </div>
              )}

              {(() => {
                const hasShapeChoices = currentTarget.choices?.some((c) => Boolean(c.shape));
                const hasLongLabels = currentTarget.choices?.some((c) => c.label.length > 7);
                const gridCols =
                  currentTarget.choices && currentTarget.choices.length === 2
                    ? 'grid-cols-2'
                    : hasLongLabels && !hasShapeChoices
                    ? 'grid-cols-2'
                    : 'grid-cols-2 sm:grid-cols-4';

                return (
                  <div className={`w-full grid gap-2.5 ${gridCols}`}>
                    {currentTarget.choices?.map((opt, idx) => {
                      const isSel = feedback?.selectedValue === opt.value;
                      const isRight = opt.value === currentTarget.correctValue;

                      let cls =
                        'bg-white/[0.04] hover:bg-cyan-500/15 border-white/10 hover:border-cyan-400/50 text-white';
                      if (feedback) {
                        if (isRight) {
                          cls = 'bg-emerald-500/20 border-emerald-400 text-emerald-300';
                        } else if (isSel && !feedback.isCorrect) {
                          cls = 'bg-rose-500/20 border-rose-400 text-rose-300';
                        } else {
                          cls = 'bg-white/[0.02] border-white/5 text-slate-500 opacity-50';
                        }
                      }

                      return (
                        <button
                          key={opt.id}
                          disabled={Boolean(feedback)}
                          onClick={() => handleSelectChoice(opt.value)}
                          className={`min-h-[48px] py-2.5 px-3 rounded-xl border font-mono font-bold text-sm sm:text-base transition-all flex ${
                            opt.shape ? 'flex-col gap-1.5' : 'flex-row gap-1.5'
                          } items-center justify-center cursor-pointer active:scale-95 ${cls}`}
                        >
                          {opt.shape && (
                            <PatternShapeGlyph
                              shape={opt.shape}
                              size="sm"
                              accentColor={band.accentColor}
                            />
                          )}
                          <span className="flex items-center gap-1.5">
                            <span className="text-[10px] text-slate-500 font-normal hidden sm:inline">
                              [{idx + 1}]
                            </span>
                            <span className={opt.shape ? 'text-xs font-semibold' : ''}>
                              {opt.label}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}

          {/* MEMORY SEQUENCE */}
          {currentTarget.type === 'memory' && currentTarget.memoryConfig && (
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center justify-between w-full max-w-[260px] text-xs font-mono">
                <span className={isPlayingSequence ? 'text-cyan-400 font-semibold' : 'text-slate-300'}>
                  {isPlayingSequence
                    ? 'Watch Pulse...'
                    : `Tap (${memInputs.length}/${currentTarget.memoryConfig.sequence.length})`}
                </span>
                <button
                  disabled={isPlayingSequence || Boolean(feedback) || memInputs.length > 0}
                  onClick={() => playMemorySequence(currentTarget)}
                  className="text-cyan-400 hover:text-cyan-300 disabled:opacity-40 flex items-center gap-1 cursor-pointer"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Replay</span>
                </button>
              </div>

              <div
                className="grid gap-2"
                style={{
                  gridTemplateColumns: `repeat(${currentTarget.memoryConfig.gridSize}, minmax(0, 1fr))`
                }}
              >
                {Array.from(
                  {
                    length:
                      currentTarget.memoryConfig.gridSize * currentTarget.memoryConfig.gridSize
                  },
                  (_, idx) => {
                    const lit = activeMemNode === idx;
                    const err = errorMemNode === idx;
                    const picked = memInputs.includes(idx);
                    const tileDim =
                      currentTarget.memoryConfig!.gridSize === 4
                        ? 'w-12 h-12 sm:w-14 sm:h-14'
                        : 'w-14 h-14 sm:w-16 sm:h-16';

                    return (
                      <button
                        key={idx}
                        disabled={isPlayingSequence || Boolean(feedback)}
                        onClick={() => handleTapMemoryTile(idx)}
                        className={`${tileDim} rounded-xl border transition-all flex items-center justify-center font-mono text-xs cursor-pointer active:scale-95 ${
                          err
                            ? 'bg-rose-500/40 border-rose-400 text-white'
                            : lit
                            ? 'bg-cyan-400 border-cyan-200 shadow-[0_0_20px_rgba(34,211,238,0.85)] text-slate-950 font-bold'
                            : picked
                            ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-200'
                            : 'bg-white/[0.04] hover:bg-white/[0.09] border-white/10 text-slate-600'
                        }`}
                      >
                        {currentTarget.memoryConfig!.gridSize === 3 ? idx + 1 : ''}
                      </button>
                    );
                  }
                )}
              </div>
            </div>
          )}

          {/* SPATIAL MATRIX */}
          {currentTarget.type === 'spatial' && currentTarget.spatialVisual && (
            <div className="flex flex-col items-center gap-3">
              <div className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-[#04070f] border border-white/[0.08]">
                <span className="text-[10px] font-mono text-slate-400">
                  {currentTarget.spatialVisual.ruleHint}
                </span>
                <div
                  className="grid gap-2"
                  style={{
                    gridTemplateColumns: `repeat(${currentTarget.spatialVisual.columns}, minmax(0, 1fr))`
                  }}
                >
                  {currentTarget.spatialVisual.cells.map((cell, idx) => (
                    <SpatialGlyph key={idx} glyph={cell} accentColor={band.accentColor} />
                  ))}
                </div>
              </div>

              <div className="w-full grid grid-cols-4 gap-2">
                {currentTarget.choices?.map((opt, idx) => {
                  const isSel = feedback?.selectedValue === opt.value;
                  const isRight = opt.value === currentTarget.correctValue;

                  let cls =
                    'bg-white/[0.03] hover:bg-cyan-500/10 border-white/10 hover:border-cyan-400/50';
                  if (feedback) {
                    if (isRight) cls = 'bg-emerald-500/20 border-emerald-400';
                    else if (isSel && !feedback.isCorrect) cls = 'bg-rose-500/20 border-rose-400';
                    else cls = 'bg-white/[0.02] border-white/5 opacity-45';
                  }

                  return (
                    <button
                      key={opt.id}
                      disabled={Boolean(feedback)}
                      onClick={() => handleSelectChoice(opt.value)}
                      className={`py-2 px-1 rounded-xl border transition-all flex flex-col items-center justify-center gap-1 cursor-pointer active:scale-95 ${cls}`}
                    >
                      <SpatialGlyph
                        glyph={opt.glyph || null}
                        size="sm"
                        accentColor={band.accentColor}
                      />
                      <span className="text-[10px] font-mono text-slate-400">[{idx + 1}]</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Feedback Pill */}
          <div className="h-6 flex items-center justify-center shrink-0">
            {feedback && (
              <div
                className={`flex items-center gap-1.5 text-xs font-mono font-semibold px-3 py-0.5 rounded-full border ${
                  feedback.isCorrect
                    ? 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30'
                    : 'text-rose-300 bg-rose-500/15 border-rose-500/30'
                }`}
              >
                {feedback.isCorrect ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <XCircle className="w-3.5 h-3.5" />
                )}
                <span>{feedback.message}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
