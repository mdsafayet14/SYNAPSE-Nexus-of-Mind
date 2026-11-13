/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SynapseProgress } from '../types/synapse';
import { soundEngine } from '../services/soundEngine';
import { X, Volume2, Vibrate, RotateCcw, Check } from 'lucide-react';

interface SettingsCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  progress: SynapseProgress;
  onUpdateProgress: (updater: (prev: SynapseProgress) => SynapseProgress) => void;
  onResetProgress: () => void;
}

export const SettingsCreditsModal: React.FC<SettingsCreditsModalProps> = ({
  isOpen,
  onClose,
  progress,
  onUpdateProgress,
  onResetProgress
}) => {
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  if (!isOpen) return null;

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    soundEngine.setVolume(vol);
    onUpdateProgress((prev) => ({
      ...prev,
      masterVolume: vol,
      soundEnabled: vol > 0
    }));
  };

  const handleToggleHaptics = () => {
    soundEngine.playClick();
    onUpdateProgress((prev) => {
      const next = !prev.hapticsEnabled;
      if (next) soundEngine.triggerHaptic(20);
      return { ...prev, hapticsEnabled: next };
    });
  };

  const handleConfirmReset = () => {
    soundEngine.playSoftMistake();
    onResetProgress();
    setConfirmReset(false);
    setResetDone(true);
    setTimeout(() => setResetDone(false), 2200);
  };

  return (
    <div
      onClick={() => {
        soundEngine.playClick();
        onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-modal-backdrop"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl glass-panel p-6 border border-white/10 space-y-5 shadow-2xl animate-modal-content"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Settings & Credits</h2>
            <p className="text-xs font-mono text-cyan-400">SYNAPSE: Nexus of Mind</p>
          </div>
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            aria-label="Close settings"
            className="min-h-[38px] min-w-[38px] p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Credits Card */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-cyan-500/25 space-y-1.5">
          <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400">
            Architecture & Design
          </span>
          <h3 className="text-lg font-extrabold text-white tracking-tight">
            Developed by Safayet
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            1,000-level exponential cognitive trainer progressing from Beginner to BUET, KUET & RUET engineering aptitude.
          </p>
        </div>

        {/* Audio & Haptics */}
        <div className="space-y-3">
          <div className="p-3.5 rounded-xl bg-white/[0.025] border border-white/[0.07] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-200 flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-cyan-400" />
                Master Volume
              </span>
              <span className="font-mono text-cyan-400 font-semibold tabular-nums">
                {Math.round(progress.masterVolume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={progress.masterVolume}
              onChange={handleVolumeChange}
              className="w-full accent-cyan-400 bg-white/10 rounded-lg cursor-pointer h-1.5"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.025] border border-white/[0.07]">
            <span className="text-xs font-medium text-slate-200 flex items-center gap-2">
              <Vibrate className="w-4 h-4 text-cyan-400" />
              Touch Haptic Feedback
            </span>
            <button
              onClick={handleToggleHaptics}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                progress.hapticsEnabled ? 'bg-cyan-500' : 'bg-white/10'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  progress.hapticsEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Reset Progress */}
        <div className="pt-3 border-t border-white/10 space-y-2">
          {confirmReset ? (
            <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/40 space-y-2.5">
              <p className="text-xs text-rose-200">
                Reset all 1,000 levels and lock progression back to Level 1?
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleConfirmReset}
                  className="px-3.5 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs cursor-pointer"
                >
                  Confirm Reset
                </button>
                <button
                  onClick={() => setConfirmReset(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-slate-300 text-xs cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setConfirmReset(true)}
              className="flex items-center gap-2 text-xs text-rose-400/80 hover:text-rose-400 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Level Progress</span>
            </button>
          )}

          {resetDone && (
            <p className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" />
              <span>Reset to Level 1 complete.</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
