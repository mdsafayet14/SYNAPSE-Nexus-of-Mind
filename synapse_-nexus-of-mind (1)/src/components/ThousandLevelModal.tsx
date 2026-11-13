/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { SynapseProgress } from '../types/synapse';
import { TIER_BANDS, getBandForLevel } from '../services/thousandLevelEngine';
import { soundEngine } from '../services/soundEngine';
import { X, Lock, Check, ChevronLeft, ChevronRight } from 'lucide-react';

interface ThousandLevelModalProps {
  isOpen: boolean;
  onClose: () => void;
  progress: SynapseProgress;
  onSelectLevel: (levelNum: number) => void;
}

const PAGE_SIZE = 50;

export const ThousandLevelModal: React.FC<ThousandLevelModalProps> = ({
  isOpen,
  onClose,
  progress,
  onSelectLevel
}) => {
  const initialPage = Math.floor((progress.currentLevel - 1) / PAGE_SIZE);
  const [page, setPage] = useState(initialPage);

  const totalPages = 1000 / PAGE_SIZE; // 20 pages

  const levelsInPage = useMemo(() => {
    const start = page * PAGE_SIZE + 1;
    return Array.from({ length: PAGE_SIZE }, (_, idx) => start + idx);
  }, [page]);

  if (!isOpen) return null;

  const pageStart = page * PAGE_SIZE + 1;
  const pageEnd = (page + 1) * PAGE_SIZE;
  const pageBand = getBandForLevel(pageStart);

  return (
    <div
      onClick={() => {
        soundEngine.playClick();
        onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-modal-backdrop"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl rounded-3xl glass-panel p-5 sm:p-6 border border-white/10 flex flex-col gap-4 shadow-2xl max-h-[88dvh] animate-modal-content"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              1,000-Level Progression Matrix
            </h2>
            <p className="text-xs font-mono text-cyan-400">
              {pageBand.name} · Levels {pageStart}–{pageEnd}
            </p>
          </div>
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            aria-label="Close level selector"
            className="min-h-[38px] min-w-[38px] p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Band Quick Jump */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {TIER_BANDS.map((band) => {
            const bandPage = Math.floor((band.levelStart - 1) / PAGE_SIZE);
            const isActiveBand = pageStart >= band.levelStart && pageStart <= band.levelEnd;
            return (
              <button
                key={band.id}
                onClick={() => {
                  soundEngine.playClick();
                  setPage(bandPage);
                }}
                className={`px-2.5 py-2 rounded-xl border text-left transition-all cursor-pointer ${
                  isActiveBand
                    ? 'bg-cyan-500/15 border-cyan-400/50 text-white'
                    : 'bg-white/[0.03] border-white/[0.07] text-slate-400 hover:text-white'
                }`}
              >
                <div className="text-[10px] font-mono tabular-nums text-cyan-400">
                  {band.levelStart}–{band.levelEnd}
                </div>
                <div className="text-xs font-semibold truncate">
                  {band.id === 'foundation'
                    ? 'Beginner Baseline'
                    : band.id === 'elite'
                    ? 'Very Advanced'
                    : band.academicTag}
                </div>
              </button>
            );
          })}
        </div>

        {/* 50-Node Grid */}
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 overflow-y-auto pr-1 py-1">
          {levelsInPage.map((lvl) => {
            const isUnlocked = lvl <= progress.highestUnlockedLevel;
            const cleared = progress.clearedLevels[lvl];
            const isCurrent = lvl === progress.currentLevel;

            return (
              <button
                key={lvl}
                disabled={!isUnlocked}
                onClick={() => {
                  if (!isUnlocked) return;
                  soundEngine.playClick();
                  onSelectLevel(lvl);
                  onClose();
                }}
                title={
                  !isUnlocked
                    ? `Level ${lvl} (Locked)`
                    : cleared
                    ? `Level ${lvl} · Best ${cleared.bestCorrect}/10`
                    : `Level ${lvl} (Unlocked)`
                }
                className={`h-11 rounded-xl border font-mono text-xs font-semibold flex flex-col items-center justify-center relative transition-all tabular-nums ${
                  !isUnlocked
                    ? 'bg-white/[0.015] border-white/[0.04] text-slate-600 cursor-not-allowed'
                    : isCurrent
                    ? 'bg-cyan-400 text-slate-950 border-cyan-300 font-bold shadow-[0_0_12px_rgba(34,211,238,0.45)] cursor-pointer'
                    : cleared
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25 cursor-pointer'
                    : 'bg-white/[0.05] border-white/15 text-white hover:border-cyan-400/50 cursor-pointer'
                }`}
              >
                <span>{lvl}</span>
                {!isUnlocked && <Lock className="w-2.5 h-2.5 text-slate-600 mt-0.5" />}
                {cleared && !isCurrent && (
                  <Check className="w-2.5 h-2.5 text-emerald-400 absolute top-1 right-1" />
                )}
              </button>
            );
          })}
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs font-mono">
          <button
            disabled={page === 0}
            onClick={() => {
              soundEngine.playClick();
              setPage((p) => Math.max(0, p - 1));
            }}
            className="min-h-[38px] px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-35 border border-white/10 text-slate-200 flex items-center gap-1 cursor-pointer disabled:pointer-events-none"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Prev 50</span>
          </button>

          <span className="text-slate-400 tabular-nums">
            Page {page + 1} / {totalPages}
          </span>

          <button
            disabled={page >= totalPages - 1}
            onClick={() => {
              soundEngine.playClick();
              setPage((p) => Math.min(totalPages - 1, p + 1));
            }}
            className="min-h-[38px] px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-35 border border-white/10 text-slate-200 flex items-center gap-1 cursor-pointer disabled:pointer-events-none"
          >
            <span>Next 50</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
