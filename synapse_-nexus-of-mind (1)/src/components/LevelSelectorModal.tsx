/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ZONES } from '../services/levelEngine';
import { UserProgress, PillarType, ZoneId } from '../types/game';
import { soundEngine } from '../services/soundEngine';
import { X, Search, CheckCircle, Lock, Play, Sparkles } from 'lucide-react';

interface LevelSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  progress: UserProgress;
  onSelectLevel: (levelNum: number) => void;
}

export const LevelSelectorModal: React.FC<LevelSelectorModalProps> = ({
  isOpen,
  onClose,
  progress,
  onSelectLevel
}) => {
  const [selectedZone, setSelectedZone] = useState<ZoneId>('awakening');
  const [pillarFilter, setPillarFilter] = useState<string>('all');
  const [pageOffset, setPageOffset] = useState<number>(0);
  const pageSize = 50;

  if (!isOpen) return null;

  const currentZoneConfig = ZONES.find((z) => z.id === selectedZone) || ZONES[0];
  const startLevel = currentZoneConfig.levelStart + pageOffset * pageSize;
  const endLevel = Math.min(currentZoneConfig.levelEnd, startLevel + pageSize - 1);
  const totalPagesInZone = Math.ceil(
    (currentZoneConfig.levelEnd - currentZoneConfig.levelStart + 1) / pageSize
  );

  // Generate levels for current slice
  const levelsInSlice = [];
  for (let l = startLevel; l <= endLevel; l++) {
    // Determine pillar of level
    let p: PillarType = 'math';
    if (l % 15 === 0) p = 'relaxing';
    else if (l % 5 === 0) p = 'quantum';
    else {
      const pool: PillarType[] = ['math', 'memory', 'logic', 'puzzle'];
      p = pool[l % 4];
    }

    if (pillarFilter === 'all' || pillarFilter === p) {
      const isUnlocked = l <= progress.highestUnlockedLevel;
      levelsInSlice.push({
        num: l,
        pillar: p,
        isCompleted: !!progress.completedLevels[l],
        isUnlocked,
        isCurrent: l === progress.currentLevel
      });
    }
  }

  const getPillarColor = (p: PillarType) => {
    switch (p) {
      case 'math':
        return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
      case 'memory':
        return 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10';
      case 'logic':
        return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
      case 'puzzle':
        return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
      case 'relaxing':
        return 'text-violet-400 border-violet-500/30 bg-violet-500/10';
      case 'quantum':
        return 'text-fuchsia-400 border-fuchsia-500/30 bg-fuchsia-500/10';
    }
  };

  return (
    <div
      onClick={() => {
        soundEngine.playClick();
        onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-modal-backdrop"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl max-h-[90vh] glass-panel rounded-3xl flex flex-col border border-white/10 overflow-hidden shadow-2xl animate-modal-content"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>1,000-Level Synapse Matrix</span>
            </h2>
            <p className="text-xs text-slate-400">
              Solve current levels to unlock higher quantum nodes.
            </p>
          </div>
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Zone Selector Tabs */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-white/10 overflow-x-auto pb-3">
          {ZONES.map((zone) => (
            <button
              key={zone.id}
              onClick={() => {
                soundEngine.playClick();
                setSelectedZone(zone.id);
                setPageOffset(0);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                selectedZone === zone.id
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  : 'bg-white/5 text-slate-400 border-white/5 hover:text-white'
              }`}
            >
              <span>{zone.name}</span>
              <span className="ml-1.5 opacity-60">({zone.levelStart}–{zone.levelEnd})</span>
            </button>
          ))}
        </div>

        {/* Filter Bar & Pagination */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-6 py-3 border-b border-white/10 bg-black/20 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
            {['all', 'math', 'memory', 'logic', 'puzzle', 'relaxing', 'quantum'].map((f) => (
              <button
                key={f}
                onClick={() => {
                  soundEngine.playClick();
                  setPillarFilter(f);
                }}
                className={`min-h-[36px] px-3 py-1.5 rounded-lg capitalize whitespace-nowrap transition-colors flex items-center ${
                  pillarFilter === f ? 'bg-white/15 text-white font-medium' : 'text-slate-400 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Page pagination */}
          <div className="flex items-center justify-between sm:justify-end gap-2 text-slate-400 font-mono text-xs shrink-0">
            <button
              disabled={pageOffset === 0}
              onClick={() => setPageOffset((p) => Math.max(0, p - 1))}
              className="min-h-[36px] min-w-[40px] px-2.5 py-1 rounded bg-white/5 disabled:opacity-30 hover:text-white flex items-center justify-center"
            >
              ← Prev
            </button>
            <span className="px-1 text-[11px] sm:text-xs">
              Page {pageOffset + 1} / {totalPagesInZone}
            </span>
            <button
              disabled={pageOffset >= totalPagesInZone - 1}
              onClick={() => setPageOffset((p) => Math.min(totalPagesInZone - 1, p + 1))}
              className="min-h-[36px] min-w-[40px] px-2.5 py-1 rounded bg-white/5 disabled:opacity-30 hover:text-white flex items-center justify-center"
            >
              Next →
            </button>
          </div>
        </div>

        {/* Level Grid */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 sm:gap-2.5">
          {levelsInSlice.map((lvl) => {
            const colorClass = lvl.isUnlocked ? getPillarColor(lvl.pillar) : 'bg-white/5 border-white/5 text-slate-600 cursor-not-allowed opacity-50';
            return (
              <button
                key={lvl.num}
                disabled={!lvl.isUnlocked}
                onClick={() => {
                  soundEngine.playClick();
                  onSelectLevel(lvl.num);
                  onClose();
                }}
                className={`h-16 rounded-xl border flex flex-col items-center justify-center relative transition-all duration-150 ${colorClass} ${
                  lvl.isCurrent
                    ? 'ring-2 ring-cyan-400 scale-105 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                    : lvl.isUnlocked
                    ? 'hover:scale-105'
                    : ''
                }`}
              >
                <span className="font-mono text-sm font-bold">{lvl.num}</span>
                <span className="text-[9px] uppercase tracking-wider opacity-75">{lvl.pillar}</span>

                {lvl.isCompleted ? (
                  <CheckCircle className="w-3 h-3 text-emerald-400 absolute top-1 right-1" />
                ) : !lvl.isUnlocked ? (
                  <Lock className="w-3 h-3 text-slate-500 absolute top-1 right-1" />
                ) : null}
              </button>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <span>Click any level to jump immediately into active puzzle matrix.</span>
          <button
            onClick={() => {
              soundEngine.playClick();
              onSelectLevel(progress.currentLevel);
              onClose();
            }}
            className="text-cyan-400 hover:underline"
          >
            Resume Current (#{progress.currentLevel})
          </button>
        </div>
      </div>
    </div>
  );
};
