/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { soundEngine } from '../services/soundEngine';
import {
  X,
  BookOpen,
  Calculator,
  BrainCircuit,
  Puzzle,
  GitBranch,
  Wind,
  Sparkles,
  Smartphone,
  Laptop,
  CheckCircle,
  TrendingUp,
  HelpCircle,
  ArrowRight
} from 'lucide-react';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartPlaying?: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({
  isOpen,
  onClose,
  onStartPlaying
}) => {
  const [activeTab, setActiveTab] = useState<'pillars' | 'controls' | 'progression'>('pillars');

  if (!isOpen) return null;

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
        className="w-full max-w-2xl max-h-[88vh] glass-panel rounded-3xl border border-white/10 flex flex-col overflow-hidden shadow-2xl relative animate-modal-content"
      >
        {/* Glow ambient background */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-fuchsia-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
              <BookOpen className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">How to Play SYNAPSE</h2>
              <p className="text-xs font-mono text-cyan-400">Rules & Cognitive Systems</p>
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

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-4 sm:px-6 pt-4 border-b border-white/10 pb-3 overflow-x-auto no-scrollbar">
          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('pillars');
            }}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
              activeTab === 'pillars'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'bg-white/5 text-slate-400 border-white/5 hover:text-white'
            }`}
          >
            5 Cognitive Pillars
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('controls');
            }}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
              activeTab === 'controls'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'bg-white/5 text-slate-400 border-white/5 hover:text-white'
            }`}
          >
            Controls (Mobile & Laptop)
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('progression');
            }}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
              activeTab === 'progression'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'bg-white/5 text-slate-400 border-white/5 hover:text-white'
            }`}
          >
            1,000-Level Roadmap
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto max-h-[62vh] space-y-6">
          {/* TAB 1: 5 COGNITIVE PILLARS */}
          {activeTab === 'pillars' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed">
                SYNAPSE develops holistic mental agility across five core cognitive domains. There are no aggressive timers—focus on equilibrium and pattern mastery.
              </p>

              <div className="p-3.5 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/30 flex items-center gap-3 text-xs text-slate-200">
                <Sparkles className="w-4 h-4 text-fuchsia-400 shrink-0" />
                <span>
                  <strong>Independent Pillar Training:</strong> Select any category directly on the dashboard to train freely without advancing or altering your main 1–1000 level campaign. Category difficulty scales dynamically the more you play!
                </span>
              </div>

              <div className="space-y-3">
                {/* Math */}
                <div className="p-4 rounded-2xl bg-black/40 border border-amber-500/30 flex items-start gap-3.5 glow-amber">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0">
                    <Calculator className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">Math Equilibrium</h4>
                      <span className="text-[10px] font-mono text-amber-400">Amber</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      <strong>How it works:</strong> Fill empty grid cells <code className="text-amber-300 font-mono">?</code> by choosing values from your reserve pool. The numbers in each row and column must add up exactly to the target header sums.
                    </p>
                    <p className="text-[11px] text-slate-400 italic">
                      Tip: Double-tap or press [⌫] on a filled cell to return that number to your pool!
                    </p>
                  </div>
                </div>

                {/* Memory */}
                <div className="p-4 rounded-2xl bg-black/40 border border-cyan-500/30 flex items-start gap-3.5 glow-cyan">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shrink-0">
                    <BrainCircuit className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">Memory Recall</h4>
                      <span className="text-[10px] font-mono text-cyan-400">Cyan</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      <strong>How it works:</strong> Watch the sequence of glowing neural tiles. Once the pulse ends, tap the tiles in the exact same chronological order to rebuild the synaptic pathway.
                    </p>
                    <p className="text-[11px] text-slate-400 italic">
                      Tip: You can press 'Replay Sequence' if you need another glance at the trajectory.
                    </p>
                  </div>
                </div>

                {/* Spatial Puzzle */}
                <div className="p-4 rounded-2xl bg-black/40 border border-emerald-500/30 flex items-start gap-3.5 glow-emerald">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 shrink-0">
                    <Puzzle className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">Circuit Nexus (Spatial Puzzle)</h4>
                      <span className="text-[10px] font-mono text-emerald-400">Emerald</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      <strong>How it works:</strong> Tap or click conduit tiles to rotate them by 90°. Form an uninterrupted, continuous power pathway from the <span className="text-emerald-400 font-mono font-bold">IN</span> transmitter to the <span className="text-emerald-400 font-mono font-bold">OUT</span> receptor.
                    </p>
                  </div>
                </div>

                {/* Logic */}
                <div className="p-4 rounded-2xl bg-black/40 border border-rose-500/30 flex items-start gap-3.5 glow-magenta">
                  <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-300 shrink-0">
                    <GitBranch className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">Logic Deduction</h4>
                      <span className="text-[10px] font-mono text-rose-400">Magenta</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      <strong>How it works:</strong> Apply Boolean truth rules (AND requires both true; OR requires at least one; XOR requires exactly one) to deduce correct output states and matrix invariants.
                    </p>
                  </div>
                </div>

                {/* Relaxing */}
                <div className="p-4 rounded-2xl bg-black/40 border border-violet-500/30 flex items-start gap-3.5 glow-violet">
                  <div className="w-9 h-9 rounded-xl bg-violet-500/20 border border-violet-500/40 flex items-center justify-center text-violet-300 shrink-0">
                    <Wind className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">Zen Resonator (Relaxing)</h4>
                      <span className="text-[10px] font-mono text-violet-400">Violet</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      <strong>How it works:</strong> Synchronize your breathing with the expanding geometric waveform (4s Inhale, 4s Hold, 4s Exhale) while soaking in a soothing 4Hz theta-wave binaural drone.
                    </p>
                  </div>
                </div>

                {/* Quantum Nexus */}
                <div className="p-4 rounded-2xl bg-fuchsia-950/20 border border-fuchsia-500/40 flex items-start gap-3.5 glow-quantum">
                  <div className="w-9 h-9 rounded-xl bg-fuchsia-500/20 border border-fuchsia-500/50 flex items-center justify-center text-fuchsia-300 shrink-0">
                    <Sparkles className="w-5 h-5 text-fuchsia-400 animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">Quantum Nexus (Mixed Mode)</h4>
                      <span className="text-[10px] font-mono text-fuchsia-400">Prismatic Fusion</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Fuses Math, Memory, and Logic into a seamless 3-phase speed run. Solves multi-threaded cognitive dexterity in rapid succession!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CONTROLS GUIDE */}
          {activeTab === 'controls' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed">
                SYNAPSE is built with dedicated cross-platform adaptability for both touchscreens and desktop workstations.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Android / Mobile Touch */}
                <div className="p-5 rounded-2xl bg-black/40 border border-cyan-500/25 space-y-3">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                    <Smartphone className="w-5 h-5" />
                    <span>Android & Mobile Touch</span>
                  </div>
                  <ul className="text-xs text-slate-300 space-y-2 list-disc pl-4 leading-relaxed">
                    <li>
                      <strong>Single Tap:</strong> Selects an empty cell, taps a memory node, or rotates a circuit conduit by 90°.
                    </li>
                    <li>
                      <strong>Double Tap:</strong> Double-tapping an already-filled cell returns its value back to the reserve pool.
                    </li>
                    <li>
                      <strong>Touch Ergonomics:</strong> All interactive buttons feature 44px or larger touch targets positioned within thumb reach.
                    </li>
                    <li>
                      <strong>Haptics:</strong> Subtle 15ms physical vibrations confirm node taps (toggleable in Settings).
                    </li>
                  </ul>
                </div>

                {/* Laptop / Desktop Web */}
                <div className="p-5 rounded-2xl bg-black/40 border border-amber-500/25 space-y-3">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                    <Laptop className="w-5 h-5" />
                    <span>Laptop & Desktop Controls</span>
                  </div>
                  <ul className="text-xs text-slate-300 space-y-2 list-disc pl-4 leading-relaxed">
                    <li>
                      <strong className="text-white font-mono">[1]–[9]:</strong> Enters numbers from the reserve pool or selects nodes directly.
                    </li>
                    <li>
                      <strong className="text-white font-mono">[⌫] / [Delete]:</strong> Clears the selected cell value back to the reserve pool.
                    </li>
                    <li>
                      <strong className="text-white font-mono">[Spacebar]:</strong> Confirms victory and advances immediately to the next level.
                    </li>
                    <li>
                      <strong className="text-white font-mono">[R]:</strong> Resets the active puzzle grid to its starting state.
                    </li>
                    <li>
                      <strong className="text-white font-mono">[Esc]:</strong> Closes open dialogs or returns to the dashboard hub.
                    </li>
                  </ul>
                </div>
              </div>

              {/* Zero-stress note */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 flex items-center gap-3 text-xs text-slate-300">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>
                  <strong>Flow State First:</strong> No countdown clocks, no penalty deductions. Take your time to calculate and observe patterns.
                </span>
              </div>
            </div>
          )}

          {/* TAB 3: 1,000-LEVEL ROADMAP */}
          {activeTab === 'progression' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed">
                SYNAPSE features a calibrated mathematical progression curve, guiding players from absolute beginners to quantum-level mental athletes.
              </p>

              <div className="space-y-3">
                {/* Tier 1: Genesis */}
                <div className="p-4 rounded-xl bg-black/40 border border-sky-500/30 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-sky-400">Levels 1–50: Genesis Awakening (Absolute Beginner)</span>
                    <span className="font-mono text-slate-400 text-[10px]">Difficulty 1.0 – 1.5</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Gentle 2x2 grids, basic single-digit addition, 2-step memory sequences, and simple 1-rotation conduit connections. Zero cognitive intimidation.
                  </p>
                </div>

                {/* Tier 2: Foundations */}
                <div className="p-4 rounded-xl bg-black/40 border border-cyan-500/30 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-cyan-400">Levels 51–250: Foundational Synthesis</span>
                    <span className="font-mono text-slate-400 text-[10px]">Difficulty 1.6 – 4.0</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Expansion to 3x3 matrices, 3 to 4 hidden cells, 3 to 5 sequence lengths, and early Quantum Nexus combinations.
                  </p>
                </div>

                {/* Tier 3: Illumination */}
                <div className="p-4 rounded-xl bg-black/40 border border-amber-500/30 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-400">Levels 251–500: Illumination & Algebraic Flow</span>
                    <span className="font-mono text-slate-400 text-[10px]">Difficulty 4.1 – 6.5</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Dual algebraic balance equations, multi-stage deductions, Boolean gates, and sequence retention under distractor pulses.
                  </p>
                </div>

                {/* Tier 4: Mastery */}
                <div className="p-4 rounded-xl bg-black/40 border border-emerald-500/30 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-400">Levels 501–750: High-Dimensional Mastery</span>
                    <span className="font-mono text-slate-400 text-[10px]">Difficulty 6.6 – 8.5</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    4x4 multi-variable lattices, 6 to 8-step memory recall, and complex multi-junction energy networks.
                  </p>
                </div>

                {/* Tier 5: Singularity */}
                <div className="p-4 rounded-xl bg-black/40 border border-rose-500/30 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-rose-400">Levels 751–1000: Quantum Mind Singularity</span>
                    <span className="font-mono text-slate-400 text-[10px]">Difficulty 8.6 – 10.0</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Peak cognitive agility, multi-operator quantum tensors, high-speed memory retention, and master flow agility.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 border-t border-white/10 bg-black/30 flex items-center justify-between">
          <span className="text-xs font-mono text-slate-500">
            Press [Esc] or click anywhere outside to close
          </span>

          <button
            onClick={() => {
              soundEngine.playSuccess();
              onClose();
              onStartPlaying?.();
            }}
            className="py-2.5 px-5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-transform active:scale-95 shadow-lg shadow-cyan-400/20"
          >
            <span>Start Training</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
