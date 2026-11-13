/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SynapseProgress } from '../types/synapse';
import {
  TIER_BANDS,
  getBandForLevel,
  getLevelDifficultyRating
} from '../services/thousandLevelEngine';
import { soundEngine } from '../services/soundEngine';
import { Play, LayoutGrid, ArrowRight, Lock, CheckCircle2 } from 'lucide-react';

interface CompactDashboardProps {
  progress: SynapseProgress;
  onPlayLevel: (levelNum: number) => void;
  onOpenLevelGrid: () => void;
}

export const CompactDashboard: React.FC<CompactDashboardProps> = ({
  progress,
  onPlayLevel,
  onOpenLevelGrid
}) => {
  const activeLevel = Math.min(progress.currentLevel, progress.highestUnlockedLevel);
  const currentBand = getBandForLevel(activeLevel);
  const diffRating = getLevelDifficultyRating(activeLevel);
  const clearedCount = Object.keys(progress.clearedLevels).length;
  const pctComplete = ((clearedCount / 1000) * 100).toFixed(1);

  return (
    <div className="w-full max-w-6xl mx-auto h-full min-h-0 px-4 sm:px-6 py-3 sm:py-5 flex flex-col justify-between gap-3 sm:gap-5 overflow-hidden">
      {/* Main Widescreen Split / Mobile Portrait Stack */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-5 items-stretch">
        {/* Left Column: Primary Launch & Active Level */}
        <section className="lg:col-span-7 rounded-2xl sm:rounded-3xl glass-panel p-5 sm:p-7 border border-white/[0.08] flex flex-col justify-between gap-4 min-h-0">
          <div className="space-y-2 sm:space-y-3">
            {/* Unboxed metadata row */}
            <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-xs font-mono text-cyan-400">
              <span className="font-semibold">Level {activeLevel} / 1,000</span>
              <span className="text-slate-600" aria-hidden="true">·</span>
              <span className="text-slate-300">
                {currentBand.id === 'foundation'
                  ? 'Beginner'
                  : currentBand.id === 'intermediate'
                  ? 'Medium'
                  : currentBand.id === 'advanced'
                  ? 'Advanced'
                  : currentBand.name}
              </span>
              <span className="text-slate-600" aria-hidden="true">·</span>
              <span className="text-slate-400">Difficulty {diffRating}/10</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight [text-wrap:balance]">
              SYNAPSE: Nexus of Mind
            </h1>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-xl">
              1,000 exponentially scaled cognitive levels from Beginner to BUET engineering aptitude. Clear 10 targets per level with 3 or fewer mistakes to unlock the next.
            </p>
          </div>

          {/* Touch-Friendly Primary Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
            <button
              onClick={() => {
                soundEngine.playSuccess();
                onPlayLevel(activeLevel);
              }}
              className="flex-1 min-h-[48px] px-6 py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all duration-150 shadow-[0_0_24px_-4px_rgba(34,211,238,0.45)] active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>Play Level {activeLevel}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                soundEngine.playClick();
                onOpenLevelGrid();
              }}
              className="min-h-[48px] px-5 py-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/10 text-slate-200 hover:text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <LayoutGrid className="w-4 h-4 text-cyan-400" />
              <span>Levels 1–1,000</span>
            </button>
          </div>

          {/* Unboxed Tabular Stats Strip */}
          <div className="pt-3 sm:pt-4 border-t border-white/[0.08] grid grid-cols-3 gap-3 tabular-nums">
            <div>
              <span className="text-[10px] sm:text-xs font-mono text-slate-400 block">
                Unlocked
              </span>
              <span className="text-lg sm:text-2xl font-mono font-bold text-white">
                {progress.highestUnlockedLevel}
                <span className="text-[11px] text-slate-500 font-normal"> / 1000</span>
              </span>
            </div>

            <div>
              <span className="text-[10px] sm:text-xs font-mono text-slate-400 block">
                Levels Cleared
              </span>
              <span className="text-lg sm:text-2xl font-mono font-bold text-emerald-400">
                {clearedCount}
              </span>
            </div>

            <div>
              <span className="text-[10px] sm:text-xs font-mono text-slate-400 block">
                Targets Solved
              </span>
              <span className="text-lg sm:text-2xl font-mono font-bold text-cyan-300">
                {progress.totalTargetsSolved}
              </span>
            </div>
          </div>
        </section>

        {/* Right Column: Exponential 1,000-Level Tier Curve */}
        <section className="lg:col-span-5 rounded-2xl sm:rounded-3xl glass-panel p-4 sm:p-6 border border-white/[0.08] flex flex-col justify-between gap-3 min-h-0">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-xs sm:text-sm font-bold text-white tracking-tight">
              Exponential Difficulty Curve
            </h2>
            <span className="text-[11px] font-mono text-cyan-400 tabular-nums">
              {pctComplete}% Cleared
            </span>
          </div>

          {/* Overall 1-1000 Progress Bar */}
          <div className="w-full h-1.5 rounded-full bg-white/[0.07] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-violet-400 to-emerald-400 transition-all duration-300"
              style={{ width: `${Math.max(2, (progress.highestUnlockedLevel / 1000) * 100)}%` }}
            />
          </div>

          {/* 4 Progressive Difficulty Bands (2x2 compact grid on mobile & desktop) */}
          <div className="grid grid-cols-2 gap-2.5 flex-1 min-h-0">
            {TIER_BANDS.map((band) => {
              const isBandUnlocked = progress.highestUnlockedLevel >= band.levelStart;
              const isBandActive =
                activeLevel >= band.levelStart && activeLevel <= band.levelEnd;
              const isBandCleared = progress.highestUnlockedLevel > band.levelEnd;
              const launchTarget = Math.min(
                progress.highestUnlockedLevel,
                Math.max(band.levelStart, activeLevel <= band.levelEnd ? activeLevel : band.levelStart)
              );

              return (
                <button
                  key={band.id}
                  type="button"
                  disabled={!isBandUnlocked}
                  onClick={() => {
                    if (!isBandUnlocked) return;
                    soundEngine.playClick();
                    onPlayLevel(launchTarget);
                  }}
                  className={`text-left rounded-xl p-3 sm:p-3.5 border transition-all flex flex-col justify-between gap-1.5 ${
                    !isBandUnlocked
                      ? 'bg-white/[0.015] border-white/[0.05] opacity-55 cursor-not-allowed'
                      : isBandActive
                      ? 'bg-cyan-950/35 border-cyan-400/60 shadow-[0_0_16px_-6px_rgba(34,211,238,0.4)] cursor-pointer'
                      : 'bg-white/[0.03] border-white/[0.07] hover:border-white/20 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-mono text-slate-400 tabular-nums">
                      {band.levelStart}–{band.levelEnd}
                    </span>
                    {!isBandUnlocked ? (
                      <Lock className="w-3 h-3 text-slate-500 shrink-0" />
                    ) : isBandCleared ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <span
                        className="text-[10px] font-mono font-semibold"
                        style={{ color: band.accentColor }}
                      >
                        Active
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="text-xs sm:text-sm font-bold text-white leading-snug truncate">
                      {band.id === 'foundation'
                        ? 'Beginner'
                        : band.id === 'intermediate'
                        ? 'Medium'
                        : band.id === 'advanced'
                        ? 'Advanced'
                        : band.name}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 truncate">
                      {band.id === 'foundation' ? 'Beginner Baseline' : band.academicTag}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </div>

      {/* Minimalist Single-Line Footer */}
      <footer className="shrink-0 pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-slate-500">
        <span>10 Targets / Level · Max 3 Mistakes</span>
        <span className="text-slate-400">Developed by Safayet</span>
      </footer>
    </div>
  );
};
