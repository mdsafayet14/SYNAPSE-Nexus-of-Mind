/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, CheckCircle2, ShieldAlert, Layers } from 'lucide-react';
import { soundEngine } from '../services/soundEngine';

interface MinimalRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MinimalRulesModal: React.FC<MinimalRulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

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
        className="w-full max-w-lg rounded-3xl glass-panel p-6 sm:p-7 border border-white/10 space-y-5 shadow-2xl animate-modal-content"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Game Rules & Progression</h2>
            <p className="text-xs font-mono text-cyan-400">SYNAPSE: Nexus of Mind</p>
          </div>
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            aria-label="Close rules"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 text-sm text-slate-300">
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07] flex items-start gap-3">
            <Layers className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-white text-sm">5 Progressive Difficulty Tiers</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Advance sequentially from <strong>Medium</strong> → <strong>BUTE</strong> → <strong>KUTE</strong> → <strong>RUTE</strong> → <strong>Engineering Level</strong>.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07] flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-white text-sm">10 Targets Per Level</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Each level presents 10 mixed cognitive challenges (Numeric Synthesis, Synaptic Memory, Boolean Logic, and Spatial Matrices). Complete all 10 to unlock the next tier.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07] flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-white text-sm">3-Mistake Limit</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Making more than 3 mistakes (4 or more errors) causes the level to fail immediately. You must replay that same level from Target 1 to progress.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 text-xs font-mono text-slate-500">
          <span>Keys [1–4] or Tap to Answer</span>
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs cursor-pointer"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
