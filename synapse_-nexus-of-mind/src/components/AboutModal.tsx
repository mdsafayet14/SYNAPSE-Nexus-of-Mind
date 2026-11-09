/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserProgress } from '../types/game';
import { soundEngine } from '../services/soundEngine';
import {
  X,
  Sparkles,
  Sliders,
  RotateCcw,
  Volume2,
  Wind,
  Vibrate,
  ShieldCheck,
  Check,
  Info,
  BookOpen
} from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  progress: UserProgress;
  onUpdateProgress: (updater: (prev: UserProgress) => UserProgress) => void;
  onResetProgress: () => void;
  onOpenHowToPlay?: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({
  isOpen,
  onClose,
  progress,
  onUpdateProgress,
  onResetProgress,
  onOpenHowToPlay
}) => {
  const [activeTab, setActiveTab] = useState<'about' | 'settings'>('about');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  if (!isOpen) return null;

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    soundEngine.setVolume(val);
    onUpdateProgress((prev) => ({ ...prev, masterVolume: val }));
  };

  const handleToggleHaptics = () => {
    soundEngine.playClick();
    onUpdateProgress((prev) => {
      const next = !prev.hapticsEnabled;
      if (next) soundEngine.triggerHaptic(20);
      return { ...prev, hapticsEnabled: next };
    });
  };

  const handleToggleAmbient = () => {
    const next = !progress.ambientZenEnabled;
    soundEngine.toggleAmbient(next);
    onUpdateProgress((prev) => ({ ...prev, ambientZenEnabled: next }));
  };

  const handleConfirmReset = () => {
    soundEngine.playSoftMistake();
    onResetProgress();
    setShowResetConfirm(false);
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 2500);
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
        className="w-full max-w-xl glass-panel rounded-3xl border border-white/10 flex flex-col overflow-hidden shadow-2xl relative animate-modal-content"
      >
        {/* Glow backdrop */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
              <Sparkles className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">SYNAPSE: Nexus of Mind</h2>
              <p className="text-xs font-mono text-cyan-400">Settings & Credits</p>
            </div>
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

        {/* Sub Navigation */}
        <div className="flex items-center gap-2 px-4 sm:px-6 pt-4 border-b border-white/10 pb-3 overflow-x-auto no-scrollbar">
          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('about');
            }}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
              activeTab === 'about'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'bg-white/5 text-slate-400 border-white/5 hover:text-white'
            }`}
          >
            About & Credits
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('settings');
            }}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
              activeTab === 'settings'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'bg-white/5 text-slate-400 border-white/5 hover:text-white'
            }`}
          >
            Game Audio & Controls
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
              onOpenHowToPlay?.();
            }}
            className="ml-auto min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-semibold text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 hover:bg-cyan-500/20 flex items-center gap-1.5 whitespace-nowrap transition-colors shrink-0"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Rules &</span> How to Play →
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto max-h-[65vh] space-y-6">
          {activeTab === 'about' && (
            <div className="space-y-6 text-xs text-slate-300 leading-relaxed">
              {/* Creator Credit Spotlight */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-white/[0.04] to-transparent border border-white/10 space-y-2 glow-cyan">
                <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400">
                  Engineering & Game Design
                </span>
                <h3 className="text-xl font-extrabold text-white tracking-tight">
                  Developed by Safayet
                </h3>
                <p className="text-slate-400 text-xs">
                  Lead Game Architect, Senior UI/UX Designer & Full-Stack Systems Engineer.
                </p>
                <div className="pt-2 flex items-center gap-2 text-[11px] font-mono text-slate-500">
                  <span>Cross-Platform Web & Android</span>
                  <span aria-hidden="true">·</span>
                  <span>Version 1.0.0 Production</span>
                </div>
              </div>

              {/* Game Philosophy */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  The SYNAPSE Philosophy
                </h4>
                <p className="text-slate-300">
                  SYNAPSE is an intentional departure from conventional cognitive training applications that stress users with loud countdown klaxons and intrusive ads. By synthesizing high-IQ challenges (Math, Memory, Puzzle, Logic) with gentle ambient audio waves and haptic grounding, it facilitates a sustained cognitive flow state.
                </p>
              </div>

              {/* Core Pillars */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Cognitive Framework
                </h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono text-slate-300">
                  <li className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>Math Equilibrium</span>
                  </li>
                  <li className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    <span>Memory Recall</span>
                  </li>
                  <li className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-400" />
                    <span>Logic Deduction</span>
                  </li>
                  <li className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Spatial Puzzle</span>
                  </li>
                  <li className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-2 sm:col-span-2">
                    <span className="w-2 h-2 rounded-full bg-violet-400" />
                    <span>Zen Waveform Resonator</span>
                  </li>
                </ul>
              </div>

              {/* Sound Engine Note */}
              <div className="p-4 rounded-xl bg-violet-950/20 border border-violet-500/20 text-slate-300 space-y-1">
                <span className="text-[11px] font-mono font-bold text-violet-300">
                  Procedural Web Audio Engine
                </span>
                <p className="text-[11px]">
                  All auditory frequencies, harmonic chords, and theta-wave relaxation pulses are synthesized algorithmically in-browser via the Web Audio API with zero external media files.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* Volume Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-white flex items-center gap-1.5">
                    <Volume2 className="w-4 h-4 text-cyan-400" />
                    Master Volume
                  </span>
                  <span className="font-mono text-cyan-400">
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

              {/* Toggles */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <Wind className="w-4 h-4 text-violet-400" />
                      Ambient Theta Wave (4Hz)
                    </span>
                    <p className="text-[11px] text-slate-400">
                      Plays low-frequency binaural drone for neural relaxation.
                    </p>
                  </div>
                  <button
                    onClick={handleToggleAmbient}
                    className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                      progress.ambientZenEnabled ? 'bg-violet-500' : 'bg-white/10'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        progress.ambientZenEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <Vibrate className="w-4 h-4 text-cyan-400" />
                      Tactile Haptic Feedback
                    </span>
                    <p className="text-[11px] text-slate-400">
                      Physical vibration impulses on mobile touch devices.
                    </p>
                  </div>
                  <button
                    onClick={handleToggleHaptics}
                    className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
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

              {/* Sound Test Playground */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                  Audio Feedback Tester
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => soundEngine.playClick()}
                    className="py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 font-mono"
                  >
                    Tactile Pop
                  </button>
                  <button
                    onClick={() => soundEngine.playNodeChime(4)}
                    className="py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 font-mono"
                  >
                    Node Chime
                  </button>
                  <button
                    onClick={() => soundEngine.playSuccess()}
                    className="py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-emerald-300 font-mono"
                  >
                    Victory Chord
                  </button>
                </div>
              </div>

              {/* Reset Section */}
              <div className="pt-4 border-t border-white/10 space-y-3">
                {showResetConfirm ? (
                  <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/40 space-y-3">
                    <p className="text-xs text-rose-300 font-medium">
                      Are you sure you want to reset all 1,000 level progress and cognitive stats?
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleConfirmReset}
                        className="py-1.5 px-3 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs"
                      >
                        Yes, Reset Progress
                      </button>
                      <button
                        onClick={() => setShowResetConfirm(false)}
                        className="py-1.5 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowResetConfirm(true)}
                    className="flex items-center gap-1.5 text-xs text-rose-400/80 hover:text-rose-400 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Cognitive Save Data</span>
                  </button>
                )}

                {resetSuccess && (
                  <p className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>Progress successfully reset to Level 1.</span>
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 border-t border-white/10 bg-black/30 flex items-center justify-between text-xs font-mono text-slate-500">
          <span>SYNAPSE: Nexus of Mind</span>
          <span className="text-slate-400">Shafayet © 2026</span>
        </div>
      </div>
    </div>
  );
};
