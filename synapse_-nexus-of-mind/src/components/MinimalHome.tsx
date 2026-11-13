/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { DifficultyTierConfig, DifficultyTierId, TierProgressState } from '../types/tierGame';
import { DIFFICULTY_TIERS } from '../services/tierEngine';
import { soundEngine } from '../services/soundEngine';
import { Play, Lock, CheckCircle2, ArrowRight, RotateCcw } from 'lucide-react';

interface MinimalHomeProps {
  progress: TierProgressState;
  selectedTierId: DifficultyTierId;
  onSelectTier: (tierId: DifficultyTierId) => void;
  onStartTier: (tierId: DifficultyTierId) => void;
  onResetProgress: () => void;
}

export const MinimalHome: React.FC<MinimalHomeProps> = ({
  progress,
  selectedTierId,
  onSelectTier,
  onStartTier,
  onResetProgress
}) => {
  const selectedTier: DifficultyTierConfig =
    DIFFICULTY_TIERS.find((t) => t.id === selectedTierId) || DIFFICULTY_TIERS[0];
  const clearedCount = Object.keys(progress.completedTiers).length;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col gap-10">
      {/* Minimalist Hero Header */}
      <section className="flex flex-col items-center text-center gap-4 max-w-2xl mx-auto">
        <span className="text-xs font-mono uppercase tracking-[0.22em] text-cyan-400">
          Cognitive Progression System
        </span>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight [text-wrap:balance]">
          SYNAPSE: Nexus of Mind
        </h1>

        <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-xl">
          Master five escalating neural tiers. Clear all 10 targets per level with at most 3 mistakes to unlock the next challenge.
        </p>

        {/* Primary Launch CTA */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => {
              soundEngine.playSuccess();
              onStartTier(selectedTier.id);
            }}
            className="min-h-[50px] px-7 py-3.5 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-sm sm:text-base flex items-center gap-2.5 transition-all duration-150 shadow-[0_0_28px_-4px_rgba(34,211,238,0.45)] active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>Start {selectedTier.name}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* 5-Tier Difficulty Progression Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
          <span>Progression Tiers ({clearedCount} / 5 Cleared)</span>
          <span>10 Targets · Max 3 Mistakes</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 items-stretch">
          {DIFFICULTY_TIERS.map((tier) => {
            const isUnlocked = tier.index <= progress.unlockedTierIndex;
            const clearRecord = progress.completedTiers[tier.id];
            const isCleared = Boolean(clearRecord);
            const isSelected = selectedTierId === tier.id;

            return (
              <button
                key={tier.id}
                type="button"
                disabled={!isUnlocked}
                onClick={() => {
                  if (!isUnlocked) return;
                  soundEngine.playClick();
                  onSelectTier(tier.id);
                }}
                onDoubleClick={() => {
                  if (!isUnlocked) return;
                  soundEngine.playSuccess();
                  onStartTier(tier.id);
                }}
                className={`group text-left rounded-2xl p-5 border transition-all duration-150 flex flex-col justify-between gap-4 relative ${
                  !isUnlocked
                    ? 'bg-white/[0.015] border-white/[0.05] opacity-55 cursor-not-allowed'
                    : isSelected
                    ? 'bg-cyan-950/35 border-cyan-400/70 shadow-[0_0_24px_-6px_rgba(34,211,238,0.35)] cursor-pointer'
                    : 'bg-white/[0.025] border-white/[0.08] hover:border-white/20 hover:bg-white/[0.045] cursor-pointer'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-400">
                      0{tier.index}
                    </span>

                    {!isUnlocked ? (
                      <Lock className="w-4 h-4 text-slate-500" />
                    ) : isCleared ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <span
                        className="text-[11px] font-mono font-semibold"
                        style={{ color: tier.accentColor }}
                      >
                        Active
                      </span>
                    )}
                  </div>

                  <div>
                    <h2 className="text-base font-bold text-white tracking-tight">
                      {tier.name}
                    </h2>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {tier.tagline}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono tabular-nums">
                  {isCleared && clearRecord ? (
                    <span className="text-emerald-400 font-semibold">
                      Best {clearRecord.bestCorrect}/10
                    </span>
                  ) : isUnlocked ? (
                    <span className="text-slate-300">10 Targets</span>
                  ) : (
                    <span className="text-slate-500">Locked</span>
                  )}

                  {isUnlocked && (
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        soundEngine.playSuccess();
                        onStartTier(tier.id);
                      }}
                      className="text-cyan-400 hover:text-cyan-300 font-semibold"
                    >
                      Play →
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Tier Preview Strip */}
        <div className="rounded-2xl glass-panel p-5 border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <span className="text-white font-semibold">{selectedTier.name}</span>
              <span aria-hidden="true">·</span>
              <span>10 Sequential Targets</span>
              <span aria-hidden="true">·</span>
              <span>Max 3 Mistakes</span>
            </div>
            <p className="text-sm text-slate-300">{selectedTier.description}</p>
          </div>

          <button
            onClick={() => {
              soundEngine.playSuccess();
              onStartTier(selectedTier.id);
            }}
            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-white/10 hover:bg-cyan-400 text-white hover:text-slate-950 font-semibold text-xs sm:text-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Launch {selectedTier.name}
          </button>
        </div>
      </section>

      {/* Quiet Unboxed Footer */}
      <footer className="pt-4 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-slate-500">
        <div className="flex items-center gap-2.5">
          <span>Targets Solved: {progress.totalTargetsSolved}</span>
          <span aria-hidden="true">·</span>
          <span>Developed by Safayet</span>
        </div>

        {clearedCount > 0 || progress.unlockedTierIndex > 1 ? (
          <button
            onClick={() => {
              soundEngine.playClick();
              onResetProgress();
            }}
            className="text-slate-500 hover:text-rose-400 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Progress</span>
          </button>
        ) : (
          <span>Select an unlocked tier to begin</span>
        )}
      </footer>
    </div>
  );
};
