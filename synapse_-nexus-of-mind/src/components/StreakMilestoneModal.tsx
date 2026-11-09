/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { soundEngine } from '../services/soundEngine';
import { Flame, Trophy, Zap, ArrowRight, ShieldCheck, Star, Award, Sparkles } from 'lucide-react';

interface StreakMilestoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  streakCount: 5 | 10;
  onProceed: () => void;
}

export const StreakMilestoneModal: React.FC<StreakMilestoneModalProps> = ({
  isOpen,
  onClose,
  streakCount,
  onProceed
}) => {
  useEffect(() => {
    if (isOpen) {
      soundEngine.playSuccess();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isTen = streakCount === 10;
  const bonusPoints = isTen ? 1000 : 250;
  const multiplier = isTen ? '2.5x' : '1.5x';
  const badgeTitle = isTen ? '10-LEVEL QUANTUM FLAWLESS MASTER' : '5-LEVEL FLAWLESS STREAK';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="streak-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-250"
    >
      <div
        className={`relative w-full max-w-lg p-6 sm:p-8 rounded-3xl glass-panel border transition-all transform duration-300 scale-100 ${
          isTen
            ? 'border-amber-400/50 shadow-[0_0_50px_rgba(245,158,11,0.35)] bg-gradient-to-b from-[#130e22]/95 via-[#0c0d1c]/95 to-[#060812]/95'
            : 'border-cyan-400/50 shadow-[0_0_40px_rgba(6,182,212,0.3)] bg-gradient-to-b from-[#0a1628]/95 via-[#08101f]/95 to-[#040812]/95'
        }`}
      >
        {/* Ambient Top Radial Background Glow */}
        <div
          className={`absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-30 ${
            isTen ? 'bg-amber-400' : 'bg-cyan-400'
          }`}
        />

        {/* Header Badge */}
        <div className="flex flex-col items-center text-center space-y-4 relative z-10">
          <div
            className={`w-20 h-20 sm:w-24 sm:h-24 rounded-3xl flex items-center justify-center relative shadow-2xl ${
              isTen
                ? 'bg-amber-500/20 border-2 border-amber-400/60 text-amber-300 shadow-amber-500/30'
                : 'bg-cyan-500/20 border-2 border-cyan-400/60 text-cyan-300 shadow-cyan-500/30'
            }`}
          >
            {isTen ? (
              <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-amber-300 animate-bounce" />
            ) : (
              <Flame className="w-10 h-10 sm:w-12 sm:h-12 text-cyan-300 animate-pulse" />
            )}

            {/* Sparkle decorative icons */}
            <Sparkles
              className={`absolute -top-2 -right-2 w-6 h-6 ${
                isTen ? 'text-amber-300' : 'text-cyan-300'
              }`}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-center gap-2 text-xs font-mono font-bold tracking-widest uppercase">
              <span className={isTen ? 'text-amber-400' : 'text-cyan-400'}>
                {badgeTitle}
              </span>
            </div>
            <h2 id="streak-modal-title" className="text-2xl sm:text-3xl font-extrabold text-white">
              {isTen ? 'Quantum Perfection Achieved!' : 'Flawless Cognitive Flow!'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-sm mx-auto leading-relaxed">
              {isTen
                ? 'You solved 10 consecutive levels without a single mistake. Your cognitive precision has reached peak Singularity tier.'
                : '5 consecutive levels solved with zero errors. Your neural focus and speed are operating in ideal alignment.'}
            </p>
          </div>

          {/* Performance Rewards Grid */}
          <div className="grid grid-cols-2 gap-3 w-full my-4">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center text-center">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                Milestone Bonus
              </span>
              <span className={`text-xl sm:text-2xl font-mono font-extrabold ${isTen ? 'text-amber-400' : 'text-cyan-400'}`}>
                +{bonusPoints} PTS
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center text-center">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                Mastery Multiplier
              </span>
              <span className={`text-xl sm:text-2xl font-mono font-extrabold ${isTen ? 'text-amber-300' : 'text-cyan-300'}`}>
                {multiplier}
              </span>
            </div>
          </div>

          {/* Unboxed Metadata Stats */}
          <div className="flex items-center justify-center gap-3 text-xs text-slate-400 font-mono py-1">
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" /> 100% Accuracy
            </span>
            <span aria-hidden="true">·</span>
            <span>0 Mistakes</span>
            <span aria-hidden="true">·</span>
            <span className="text-amber-400">Streak: {streakCount} Lvl</span>
          </div>

          {/* Action Button */}
          <button
            onClick={() => {
              onProceed();
              onClose();
            }}
            className={`w-full py-4 px-6 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg mt-2 ${
              isTen
                ? 'bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 shadow-amber-500/25'
                : 'bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 shadow-cyan-500/25'
            }`}
          >
            <span>Claim Rewards & Next Level</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
