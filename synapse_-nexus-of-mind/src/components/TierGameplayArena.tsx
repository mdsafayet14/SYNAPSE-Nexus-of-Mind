/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  DifficultyTierConfig,
  DifficultyTierId,
  TargetChallenge,
  TargetOutcome
} from '../types/tierGame';
import { generateTargetsForTier } from '../services/tierEngine';
import { soundEngine } from '../services/soundEngine';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ShieldAlert,
  Trophy,
  Play,
  ArrowUp
} from 'lucide-react';

interface TierGameplayArenaProps {
  tier: DifficultyTierConfig;
  nextTier?: DifficultyTierConfig;
  onTierPassed: (tierId: DifficultyTierId, correctCount: number, mistakeCount: number) => void;
  onAdvanceToTier: (tierId: DifficultyTierId) => void;
  onReturnHome: () => void;
}

type SessionPhase = 'PLAYING' | 'SUMMARY_PASSED' | 'SUMMARY_FAILED';

const SpatialGlyph: React.FC<{
  glyph: { kind: 'dots' | 'arrow'; grid?: number[][]; rotation?: number } | null;
  size?: 'sm' | 'md';
  accentColor?: string;
}> = ({ glyph, size = 'md', accentColor = '#38BDF8' }) => {
  if (!glyph) {
    return (
      <div
        className={`flex items-center justify-center rounded-xl border border-dashed border-cyan-400/50 bg-cyan-500/5 text-cyan-300 font-mono font-bold ${
          size === 'sm' ? 'w-12 h-12 text-base' : 'w-16 h-16 sm:w-20 sm:h-20 text-xl'
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
          size === 'sm' ? 'w-12 h-12' : 'w-16 h-16 sm:w-20 sm:h-20'
        }`}
      >
        <ArrowUp
          className={size === 'sm' ? 'w-6 h-6' : 'w-8 h-8'}
          style={{
            color: accentColor,
            transform: `rotate(${glyph.rotation || 0}deg)`,
            transition: 'transform 200ms ease'
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
      className={`grid gap-1.5 p-2 rounded-xl border border-white/10 bg-white/[0.03] ${
        size === 'sm' ? 'w-12 h-12' : 'w-16 h-16 sm:w-20 sm:h-20'
      }`}
      style={{ gridTemplateColumns: `repeat(${dim}, minmax(0, 1fr))` }}
    >
      {grid.flatMap((row, r) =>
        row.map((val, c) => (
          <span
            key={`${r}-${c}`}
            className={`rounded-full transition-colors ${
              val === 1
                ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.7)]'
                : 'bg-white/10'
            }`}
          />
        ))
      )}
    </div>
  );
};

export const TierGameplayArena: React.FC<TierGameplayArenaProps> = ({
  tier,
  nextTier,
  onTierPassed,
  onAdvanceToTier,
  onReturnHome
}) => {
  const [targets, setTargets] = useState<TargetChallenge[]>(() => generateTargetsForTier(tier.id));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [outcomes, setOutcomes] = useState<TargetOutcome[]>(() =>
    Array.from({ length: 10 }, (_, idx) => (idx === 0 ? 'active' : 'pending'))
  );
  const [correctCount, setCorrectCount] = useState(0);
  const [mistakeCount, setMistakeCount] = useState(0);
  const [phase, setPhase] = useState<SessionPhase>('PLAYING');
  const [feedback, setFeedback] = useState<{
    isCorrect: boolean;
    selectedValue?: string;
    message: string;
  } | null>(null);

  // Memory challenge local state
  const [isPlayingSequence, setIsPlayingSequence] = useState(false);
  const [activeMemoryNode, setActiveMemoryNode] = useState<number | null>(null);
  const [memoryInputs, setMemoryInputs] = useState<number[]>([]);
  const [errorMemoryNode, setErrorMemoryNode] = useState<number | null>(null);

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const scheduleTimer = useCallback((fn: () => void, ms: number) => {
    const t = setTimeout(fn, ms);
    timersRef.current.push(t);
    return t;
  }, []);

  // Reset level completely (for Replay or switching tiers)
  const startFreshSession = useCallback(() => {
    clearAllTimers();
    setTargets(generateTargetsForTier(tier.id));
    setCurrentIndex(0);
    setOutcomes(Array.from({ length: 10 }, (_, idx) => (idx === 0 ? 'active' : 'pending')));
    setCorrectCount(0);
    setMistakeCount(0);
    setPhase('PLAYING');
    setFeedback(null);
    setIsPlayingSequence(false);
    setActiveMemoryNode(null);
    setMemoryInputs([]);
    setErrorMemoryNode(null);
  }, [clearAllTimers, tier.id]);

  // Re-initialize when tier changes
  useEffect(() => {
    startFreshSession();
    return () => clearAllTimers();
  }, [tier.id, startFreshSession, clearAllTimers]);

  const currentTarget = targets[currentIndex];

  // Play synaptic memory sequence
  const playMemorySequence = useCallback(
    (target: TargetChallenge) => {
      if (!target.memoryConfig) return;
      clearAllTimers();
      setIsPlayingSequence(true);
      setMemoryInputs([]);
      setActiveMemoryNode(null);
      setErrorMemoryNode(null);

      const { sequence, pulseMs } = target.memoryConfig;
      sequence.forEach((nodeIdx, step) => {
        scheduleTimer(() => {
          setActiveMemoryNode(nodeIdx);
          soundEngine.playNodeChime(nodeIdx);
          soundEngine.triggerHaptic(10);

          scheduleTimer(() => {
            setActiveMemoryNode(null);
            if (step === sequence.length - 1) {
              setIsPlayingSequence(false);
            }
          }, Math.max(160, pulseMs * 0.65));
        }, (step + 1) * pulseMs);
      });
    },
    [clearAllTimers, scheduleTimer]
  );

  // Trigger sequence automatically whenever active target is memory
  useEffect(() => {
    if (phase === 'PLAYING' && currentTarget?.type === 'memory' && !feedback) {
      const t = scheduleTimer(() => {
        playMemorySequence(currentTarget);
      }, 320);
      return () => clearTimeout(t);
    }
  }, [phase, currentIndex, currentTarget, feedback, playMemorySequence, scheduleTimer]);

  // Resolve current target as either Correct or Mistake
  const resolveTarget = useCallback(
    (isCorrect: boolean, selectedValue?: string, feedbackMessage?: string) => {
      if (feedback || phase !== 'PLAYING') return;

      const updatedOutcomes = [...outcomes];
      updatedOutcomes[currentIndex] = isCorrect ? 'correct' : 'mistake';
      setOutcomes(updatedOutcomes);

      if (isCorrect) {
        soundEngine.playNodeChime(4);
        soundEngine.triggerHaptic(15);
        const nextCorrect = correctCount + 1;
        setCorrectCount(nextCorrect);
        setFeedback({
          isCorrect: true,
          selectedValue,
          message: feedbackMessage || 'Target Verified'
        });

        scheduleTimer(() => {
          setFeedback(null);
          if (currentIndex >= 9) {
            soundEngine.playSuccess();
            setPhase('SUMMARY_PASSED');
            onTierPassed(tier.id, nextCorrect, mistakeCount);
          } else {
            const nextIdx = currentIndex + 1;
            setOutcomes((prev) => prev.map((o, idx) => (idx === nextIdx ? 'active' : o)));
            setCurrentIndex(nextIdx);
          }
        }, 520);
      } else {
        soundEngine.playSoftMistake();
        soundEngine.triggerHaptic(30);
        const nextMistakes = mistakeCount + 1;
        setMistakeCount(nextMistakes);
        setFeedback({
          isCorrect: false,
          selectedValue,
          message:
            nextMistakes > tier.maxMistakes
              ? 'Mistake limit exceeded (4/3 max)'
              : feedbackMessage || `Incorrect (${nextMistakes}/${tier.maxMistakes} mistakes)`
        });

        scheduleTimer(() => {
          setFeedback(null);
          setErrorMemoryNode(null);
          if (nextMistakes > tier.maxMistakes) {
            setPhase('SUMMARY_FAILED');
          } else if (currentIndex >= 9) {
            soundEngine.playSuccess();
            setPhase('SUMMARY_PASSED');
            onTierPassed(tier.id, correctCount, nextMistakes);
          } else {
            const nextIdx = currentIndex + 1;
            setOutcomes((prev) => prev.map((o, idx) => (idx === nextIdx ? 'active' : o)));
            setCurrentIndex(nextIdx);
          }
        }, 760);
      }
    },
    [
      feedback,
      phase,
      outcomes,
      currentIndex,
      correctCount,
      mistakeCount,
      tier.id,
      tier.maxMistakes,
      scheduleTimer,
      onTierPassed
    ]
  );

  const handleOptionSelect = useCallback(
    (value: string) => {
      if (!currentTarget || feedback || phase !== 'PLAYING') return;
      const isCorrect = value === currentTarget.correctValue;
      resolveTarget(isCorrect, value);
    },
    [currentTarget, feedback, phase, resolveTarget]
  );

  const handleMemoryTileTap = useCallback(
    (nodeIdx: number) => {
      if (!currentTarget?.memoryConfig || isPlayingSequence || feedback || phase !== 'PLAYING') {
        return;
      }
      const { sequence } = currentTarget.memoryConfig;
      const stepIndex = memoryInputs.length;

      soundEngine.playNodeChime(nodeIdx);
      soundEngine.triggerHaptic(12);
      setActiveMemoryNode(nodeIdx);
      scheduleTimer(() => setActiveMemoryNode(null), 180);

      if (nodeIdx !== sequence[stepIndex]) {
        setErrorMemoryNode(nodeIdx);
        resolveTarget(false, String(nodeIdx), 'Sequence mismatch');
        return;
      }

      const nextInputs = [...memoryInputs, nodeIdx];
      setMemoryInputs(nextInputs);

      if (nextInputs.length === sequence.length) {
        resolveTarget(true, 'seq-ok', 'Pathway Synchronized');
      }
    },
    [currentTarget, isPlayingSequence, feedback, phase, memoryInputs, scheduleTimer, resolveTarget]
  );

  // Keyboard shortcuts (1-4 for options, 1-9 for 3x3 memory)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (phase !== 'PLAYING' || feedback || !currentTarget) return;
      if (e.key === 'Escape') {
        onReturnHome();
        return;
      }
      const num = parseInt(e.key, 10);
      if (isNaN(num)) return;

      if (currentTarget.type === 'memory' && currentTarget.memoryConfig) {
        const total = currentTarget.memoryConfig.gridSize * currentTarget.memoryConfig.gridSize;
        if (num >= 1 && num <= total && !isPlayingSequence) {
          handleMemoryTileTap(num - 1);
        }
      } else if (currentTarget.options && num >= 1 && num <= currentTarget.options.length) {
        handleOptionSelect(currentTarget.options[num - 1].value);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    phase,
    feedback,
    currentTarget,
    isPlayingSequence,
    handleMemoryTileTap,
    handleOptionSelect,
    onReturnHome
  ]);

  const attemptedCount = correctCount + mistakeCount;
  const accuracyPct = attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0;

  // ========================================================
  // SUMMARY SCREENS (PASSED OR FAILED)
  // ========================================================
  if (phase === 'SUMMARY_PASSED' || phase === 'SUMMARY_FAILED') {
    const isPassed = phase === 'SUMMARY_PASSED';

    return (
      <div className="w-full max-w-xl mx-auto px-4 py-8 flex flex-col items-center justify-center animate-modal-content">
        <div
          className={`w-full rounded-3xl glass-panel p-6 sm:p-8 border space-y-6 ${
            isPassed
              ? 'border-emerald-500/35 shadow-[0_0_40px_-10px_rgba(16,185,129,0.3)]'
              : 'border-rose-500/40 shadow-[0_0_40px_-10px_rgba(244,63,94,0.3)]'
          }`}
        >
          {/* Icon & Headline */}
          <div className="flex flex-col items-center text-center space-y-3">
            <div
              className={`w-14 h-14 rounded-2xl border flex items-center justify-center ${
                isPassed
                  ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-300'
                  : 'bg-rose-500/15 border-rose-400/40 text-rose-300'
              }`}
            >
              {isPassed ? <Trophy className="w-7 h-7" /> : <ShieldAlert className="w-7 h-7" />}
            </div>

            <div className="space-y-1">
              <span
                className={`text-xs font-mono uppercase tracking-widest font-semibold ${
                  isPassed ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {isPassed ? `Tier 0${tier.index} Cleared` : `Tier 0${tier.index} Failed`}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {isPassed ? `${tier.name} Mastered` : `${tier.name} Incomplete`}
              </h2>
              <p className="text-sm text-slate-300 max-w-md leading-relaxed">
                {isPassed
                  ? nextTier
                    ? `All 10 targets completed within limit. ${nextTier.name} is now unlocked.`
                    : 'All 10 targets completed. You have conquered the pinnacle Engineering Level.'
                  : `You made ${mistakeCount} mistakes (more than 3 allowed). Replay ${tier.name} from Target 1 to unlock the next tier.`}
              </p>
            </div>
          </div>

          {/* Score Breakdown out of 10 */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07] text-center">
              <span className="text-[11px] font-mono text-slate-400 block uppercase">Correct</span>
              <span className="text-2xl font-mono font-bold text-emerald-400 tabular-nums mt-1 block">
                {correctCount}
                <span className="text-xs text-slate-500 font-normal"> / 10</span>
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07] text-center">
              <span className="text-[11px] font-mono text-slate-400 block uppercase">Mistakes</span>
              <span
                className={`text-2xl font-mono font-bold tabular-nums mt-1 block ${
                  mistakeCount > 3 ? 'text-rose-400' : 'text-amber-400'
                }`}
              >
                {mistakeCount}
                <span className="text-xs text-slate-500 font-normal"> / 10</span>
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07] text-center">
              <span className="text-[11px] font-mono text-slate-400 block uppercase">Accuracy</span>
              <span className="text-2xl font-mono font-bold text-cyan-300 tabular-nums mt-1 block">
                {accuracyPct}%
              </span>
            </div>
          </div>

          {/* 10-Target Outcome Strip */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>10-Target Session Log</span>
              <span>Max Mistakes Allowed: 3</span>
            </div>
            <div className="grid grid-cols-10 gap-1.5">
              {outcomes.map((status, idx) => (
                <div
                  key={idx}
                  className={`h-2.5 rounded-full transition-colors ${
                    status === 'correct'
                      ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]'
                      : status === 'mistake'
                      ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'
                      : 'bg-white/10'
                  }`}
                  title={`Target ${idx + 1}: ${status}`}
                />
              ))}
            </div>
          </div>

          {/* Summary Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            {isPassed && nextTier ? (
              <button
                onClick={() => {
                  soundEngine.playClick();
                  onAdvanceToTier(nextTier.id);
                }}
                className="w-full flex-1 min-h-[48px] py-3.5 px-6 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-lg shadow-cyan-400/20"
              >
                <span>Next: {nextTier.name}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => {
                  soundEngine.playClick();
                  startFreshSession();
                }}
                className={`w-full flex-1 min-h-[48px] py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-lg ${
                  isPassed
                    ? 'bg-emerald-400 hover:bg-emerald-300 text-slate-950 shadow-emerald-400/20'
                    : 'bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/25'
                }`}
              >
                <RotateCcw className="w-4 h-4" />
                <span>Replay {tier.name}</span>
              </button>
            )}

            {isPassed && nextTier && (
              <button
                onClick={() => {
                  soundEngine.playClick();
                  startFreshSession();
                }}
                className="w-full sm:w-auto min-h-[48px] py-3.5 px-5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Replay</span>
              </button>
            )}

            <button
              onClick={() => {
                soundEngine.playClick();
                onReturnHome();
              }}
              className="w-full sm:w-auto min-h-[48px] py-3.5 px-5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>Home</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ========================================================
  // ACTIVE 10-TARGET SESSION VIEW
  // ========================================================
  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-4 sm:py-8 flex flex-col gap-5">
      {/* Real-Time Tracking HUD */}
      <div className="rounded-2xl glass-panel p-4 sm:p-5 border border-white/[0.08] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                soundEngine.playClick();
                onReturnHome();
              }}
              className="min-h-[38px] px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Home</span>
            </button>

            <div className="flex items-center gap-2 text-sm">
              <span className="font-mono text-xs text-slate-400">0{tier.index}</span>
              <span className="text-slate-600">/</span>
              <span className="font-bold text-white tracking-tight">{tier.name}</span>
            </div>
          </div>

          {/* Live Correct & Mistakes Counter */}
          <div className="flex items-center gap-4 text-xs font-mono tabular-nums">
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <span>Correct</span>
              <span className="text-white font-bold">{correctCount}</span>
              <span className="text-slate-500">/ 10</span>
            </div>

            <span className="text-slate-700">·</span>

            <div
              className={`flex items-center gap-1.5 font-semibold ${
                mistakeCount >= 3 ? 'text-rose-400' : mistakeCount >= 1 ? 'text-amber-400' : 'text-slate-300'
              }`}
            >
              <span>Mistakes</span>
              <span className="font-bold">{mistakeCount}</span>
              <span className="text-slate-500">/ 3 max</span>
            </div>
          </div>
        </div>

        {/* 10-Target Visual Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Target {currentIndex + 1} of 10</span>
            <span>{currentTarget?.categoryLabel}</span>
          </div>

          <div className="grid grid-cols-10 gap-1.5">
            {outcomes.map((status, idx) => (
              <div
                key={idx}
                className={`h-2 rounded-full transition-all duration-200 ${
                  status === 'correct'
                    ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.45)]'
                    : status === 'mistake'
                    ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.45)]'
                    : status === 'active'
                    ? 'bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.7)]'
                    : 'bg-white/10'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Target Challenge Card */}
      {currentTarget && (
        <div
          key={currentTarget.id}
          className="rounded-3xl glass-panel p-6 sm:p-8 border border-white/10 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.75)] flex flex-col gap-6 animate-modal-content"
        >
          {/* Challenge Prompt */}
          <div className="space-y-2 text-center">
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold">
              Target {currentIndex + 1} · {currentTarget.categoryLabel}
            </span>
            <h3 className="text-base sm:text-lg font-medium text-slate-200 leading-relaxed max-w-lg mx-auto">
              {currentTarget.prompt}
            </h3>
          </div>

          {/* MATH / LOGIC EXPRESSION DISPLAY */}
          {(currentTarget.type === 'math' || currentTarget.type === 'logic') && (
            <div className="flex flex-col items-center gap-4">
              {currentTarget.logicVisual && (
                <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 p-3.5 rounded-2xl bg-black/35 border border-white/[0.06] font-mono text-xs">
                  {currentTarget.logicVisual.inputs.map((inp) => (
                    <span
                      key={inp.name}
                      className={`px-2.5 py-1 rounded-lg border ${
                        inp.value
                          ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                          : 'border-white/10 bg-white/5 text-slate-400'
                      }`}
                    >
                      {inp.name}: {inp.value ? '1' : '0'}
                    </span>
                  ))}
                  <span className="px-3 py-1 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-bold">
                    {currentTarget.logicVisual.gateLabel}
                  </span>
                  {currentTarget.logicVisual.secondaryGate && currentTarget.logicVisual.thirdInput && (
                    <>
                      <span className="text-slate-500">→</span>
                      <span
                        className={`px-2.5 py-1 rounded-lg border ${
                          currentTarget.logicVisual.thirdInput.value
                            ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                            : 'border-white/10 bg-white/5 text-slate-400'
                        }`}
                      >
                        {currentTarget.logicVisual.thirdInput.name}:{' '}
                        {currentTarget.logicVisual.thirdInput.value ? '1' : '0'}
                      </span>
                      <span className="px-3 py-1 rounded-lg bg-fuchsia-500/15 border border-fuchsia-500/30 text-fuchsia-300 font-bold">
                        {currentTarget.logicVisual.secondaryGate}
                      </span>
                    </>
                  )}
                </div>
              )}

              {currentTarget.expression && (
                <div className="w-full py-5 px-4 rounded-2xl bg-[#04070f] border border-white/[0.08] text-center">
                  <span className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-wider tabular-nums">
                    {currentTarget.expression}
                  </span>
                </div>
              )}

              {/* Answer Options */}
              <div
                className={`w-full grid gap-3 pt-1 ${
                  currentTarget.options && currentTarget.options.length === 2
                    ? 'grid-cols-2'
                    : 'grid-cols-2 sm:grid-cols-4'
                }`}
              >
                {currentTarget.options?.map((opt, idx) => {
                  const isSelected = feedback?.selectedValue === opt.value;
                  const isCorrectOpt = opt.value === currentTarget.correctValue;

                  let btnStyle =
                    'bg-white/[0.04] hover:bg-cyan-500/15 border-white/10 hover:border-cyan-400/50 text-white';
                  if (feedback) {
                    if (isCorrectOpt) {
                      btnStyle =
                        'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]';
                    } else if (isSelected && !feedback.isCorrect) {
                      btnStyle =
                        'bg-rose-500/20 border-rose-400 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.3)]';
                    } else {
                      btnStyle = 'bg-white/[0.02] border-white/5 text-slate-500 opacity-50';
                    }
                  }

                  return (
                    <button
                      key={opt.id}
                      disabled={Boolean(feedback)}
                      onClick={() => handleOptionSelect(opt.value)}
                      className={`min-h-[54px] py-3.5 px-4 rounded-xl border font-mono font-bold text-base sm:text-lg transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${btnStyle}`}
                    >
                      <span className="text-[10px] text-slate-500 font-normal hidden sm:inline">
                        [{idx + 1}]
                      </span>
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* MEMORY SEQUENCE MATRIX */}
          {currentTarget.type === 'memory' && currentTarget.memoryConfig && (
            <div className="flex flex-col items-center gap-5">
              <div className="flex items-center justify-between w-full max-w-xs text-xs font-mono">
                <span className={isPlayingSequence ? 'text-cyan-400 font-semibold' : 'text-slate-300'}>
                  {isPlayingSequence
                    ? 'Observing Pulse...'
                    : `Tap Sequence (${memoryInputs.length}/${currentTarget.memoryConfig.sequence.length})`}
                </span>
                <button
                  disabled={isPlayingSequence || Boolean(feedback) || memoryInputs.length > 0}
                  onClick={() => playMemorySequence(currentTarget)}
                  className="text-cyan-400 hover:text-cyan-300 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1 cursor-pointer"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Replay</span>
                </button>
              </div>

              <div
                className="grid gap-2.5 sm:gap-3"
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
                    const isLit = activeMemoryNode === idx;
                    const isErr = errorMemoryNode === idx;
                    const isPicked = memoryInputs.includes(idx);

                    return (
                      <button
                        key={idx}
                        disabled={isPlayingSequence || Boolean(feedback)}
                        onClick={() => handleMemoryTileTap(idx)}
                        className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border transition-all duration-150 flex items-center justify-center font-mono text-xs cursor-pointer active:scale-95 ${
                          isErr
                            ? 'bg-rose-500/40 border-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.6)] text-white'
                            : isLit
                            ? 'bg-cyan-400 border-cyan-200 shadow-[0_0_24px_rgba(34,211,238,0.85)] scale-[1.03] text-slate-950 font-bold'
                            : isPicked
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

          {/* SPATIAL MATRIX PATTERN */}
          {currentTarget.type === 'spatial' && currentTarget.spatialVisual && (
            <div className="flex flex-col items-center gap-5">
              <div className="flex flex-col items-center gap-2 p-4 sm:p-5 rounded-2xl bg-[#04070f] border border-white/[0.08]">
                <span className="text-[11px] font-mono text-slate-400">
                  {currentTarget.spatialVisual.ruleHint}
                </span>
                <div
                  className="grid gap-3 pt-1"
                  style={{
                    gridTemplateColumns: `repeat(${currentTarget.spatialVisual.columns}, minmax(0, 1fr))`
                  }}
                >
                  {currentTarget.spatialVisual.cells.map((cell, idx) => (
                    <SpatialGlyph key={idx} glyph={cell} accentColor={tier.accentColor} />
                  ))}
                </div>
              </div>

              <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-3">
                {currentTarget.options?.map((opt, idx) => {
                  const isSelected = feedback?.selectedValue === opt.value;
                  const isCorrectOpt = opt.value === currentTarget.correctValue;

                  let tileBorder =
                    'bg-white/[0.03] hover:bg-cyan-500/10 border-white/10 hover:border-cyan-400/50';
                  if (feedback) {
                    if (isCorrectOpt) {
                      tileBorder =
                        'bg-emerald-500/20 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]';
                    } else if (isSelected && !feedback.isCorrect) {
                      tileBorder =
                        'bg-rose-500/20 border-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.3)]';
                    } else {
                      tileBorder = 'bg-white/[0.02] border-white/5 opacity-45';
                    }
                  }

                  return (
                    <button
                      key={opt.id}
                      disabled={Boolean(feedback)}
                      onClick={() => handleOptionSelect(opt.value)}
                      className={`py-3 px-2 rounded-2xl border transition-all duration-150 flex flex-col items-center justify-center gap-2 cursor-pointer active:scale-95 ${tileBorder}`}
                    >
                      <SpatialGlyph
                        glyph={opt.glyph || null}
                        size="sm"
                        accentColor={tier.accentColor}
                      />
                      <span className="text-[11px] font-mono text-slate-400">
                        [{idx + 1}]
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Feedback Banner */}
          <div className="min-h-[28px] flex items-center justify-center">
            {feedback && (
              <div
                className={`flex items-center gap-2 text-xs font-mono font-semibold px-3 py-1 rounded-full border ${
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
