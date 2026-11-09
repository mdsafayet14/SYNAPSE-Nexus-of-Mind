/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { soundEngine } from '../services/soundEngine';
import {
  FileText,
  Layers,
  Palette,
  Cpu,
  Code2,
  Copy,
  Check,
  Smartphone,
  Laptop,
  Sparkles,
  Zap
} from 'lucide-react';

export const BlueprintViewer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<number>(1);
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  const handleCopy = (code: string, id: string) => {
    soundEngine.playClick();
    navigator.clipboard.writeText(code);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  const tabs = [
    { id: 1, label: '1. Core Concept & Theme', icon: FileText },
    { id: 2, label: '2. 1,000-Level Architecture', icon: Layers },
    { id: 3, label: '3. UI/UX Design System', icon: Palette },
    { id: 4, label: '4. Tech Stack & State', icon: Cpu },
    { id: 5, label: '5. Production Code Blueprint', icon: Code2 }
  ];

  const codeSnippet = `/**
 * SYNAPSE Core Engine Architecture Blueprint
 * Cross-platform TypeScript / React / Flutter equivalent
 */

export interface LevelConfig {
  levelNumber: number;
  zone: 'awakening' | 'illumination' | 'mastery' | 'singularity';
  pillar: 'math' | 'memory' | 'puzzle' | 'logic' | 'relaxing' | 'quantum';
  difficulty: number; // 1.0 - 10.0
  seed: number;
}

// Deterministic Mulberry32 Seeded Generator
export function createLevelRNG(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Dynamic Difficulty Scaling Formula
export function calculateLevelDifficulty(level: number): number {
  // S-curve logistic smoothing across 1000 levels
  const k = 0.006;
  const x0 = 500;
  const rawDifficulty = 10 / (1 + Math.exp(-k * (level - x0)));
  return Math.max(1.0, Math.min(10.0, parseFloat(rawDifficulty.toFixed(2))));
}

// Sample Math-Logic Quantum Invariant Solver
export function generateQuantumGrid(level: number, size = 3) {
  const rng = createLevelRNG(level * 31337);
  const maxOperand = Math.min(30, 4 + Math.floor(level / 35));
  
  const grid: number[][] = [];
  const rowSums: number[] = [];
  const colSums: number[] = new Array(size).fill(0);

  for (let r = 0; r < size; r++) {
    grid[r] = [];
    let rSum = 0;
    for (let c = 0; c < size; c++) {
      const val = Math.floor(rng() * maxOperand) + 1;
      grid[r][c] = val;
      rSum += val;
      colSums[c] += val;
    }
    rowSums.push(rSum);
  }

  // Hide cells dynamically based on level difficulty
  const hiddenCount = Math.min(size * size - 2, 2 + Math.floor(level / 120));
  return { grid, rowSums, colSums, hiddenCount };
}`;

  return (
    <div className="flex flex-col w-full max-w-5xl mx-auto px-4 md:px-8 py-6 space-y-6">
      {/* Blueprint Header */}
      <div className="glass-panel rounded-3xl p-6 md:p-8 border border-white/10 glow-quantum">
        <div className="flex items-center gap-2 text-xs font-mono text-fuchsia-400 mb-2">
          <Zap className="w-4 h-4" />
          <span>Game Design Document & Architectural Blueprint · Release v1.0</span>
        </div>
        <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">
          SYNAPSE: Nexus of Mind
        </h1>
        <p className="text-sm text-slate-300 mt-2 max-w-3xl leading-relaxed">
          Comprehensive production engineering blueprint for a modern, cross-platform cognitive puzzle suite blending high-IQ challenges with ambient flow-state ergonomics.
        </p>
      </div>

      {/* Navigation Tab Bar */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 border-b border-white/10">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                soundEngine.playClick();
                setActiveTab(tab.id);
              }}
              className={`min-h-[44px] flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-semibold whitespace-nowrap transition-all border ${
                isActive
                  ? 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40 glow-magenta'
                  : 'bg-white/5 text-slate-400 border-white/5 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Core Concept & Theme */}
      {activeTab === 1 && (
        <div className="glass-panel rounded-3xl p-6 md:p-8 space-y-6 border border-white/10">
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-white">1. Core Concept & Thematic Foundation</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              <strong>SYNAPSE: Nexus of Mind</strong> is engineered as a cognitive sanctuary. Traditional brain-training games enforce aggressive, punitive countdown clocks, anxiety-inducing alarms, and cluttered monetization popups. SYNAPSE inverts this paradigm by combining <em>maximum cognitive depth</em> with <em>minimalist sensory serenity</em>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm">
                <Smartphone className="w-4 h-4" />
                <span>Mobile (Android) Adaptability</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4 leading-relaxed">
                <li>Touch-first ergonomics: Interactive tiles feature 44px or larger touch zones positioned within the thumb reach arc.</li>
                <li>Haptic integration: Subtle 15ms vibratory impulses trigger upon node activation and level clearance.</li>
                <li>Zero pinch/zoom disruption: Fixed viewport with fluid CSS clamp scaling.</li>
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
                <Laptop className="w-4 h-4" />
                <span>Laptop / Desktop Ergonomics</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4 leading-relaxed">
                <li>Keyboard shortcuts: Number keys (1–9) for value input, Spacebar for immediate stage progression, 'R' to reset.</li>
                <li>High-resolution split layout: Interactive puzzle canvas adjacent to cognitive performance telemetry.</li>
                <li>Fluid mouse hover states with dynamic radial glow cursor spotlights.</li>
              </ul>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-violet-950/20 border border-violet-500/20 space-y-2">
            <h3 className="text-sm font-bold text-violet-300">Ambient Soundscape Philosophy</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              The auditory environment relies entirely on real-time Web Audio API synthesis. Low-frequency binaural drones (108Hz carrier with a 4Hz beat frequency) stimulate theta-wave relaxation. Positive actions trigger pentatonic sine chimes tuned to the golden ratio harmonic scale.
            </p>
          </div>
        </div>
      )}

      {/* Tab 2: 1,000-Level Progression Architecture */}
      {activeTab === 2 && (
        <div className="glass-panel rounded-3xl p-6 md:p-8 space-y-6 border border-white/10">
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-white">2. 1,000-Level Progression Architecture</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              The progression engine is deterministically seeded, ensuring every player encounters identical mathematical configurations without storing millions of lines of pre-baked JSON.
            </p>
          </div>

          {/* Zones Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-white/10 rounded-xl overflow-hidden">
              <thead className="bg-white/5 text-slate-300 font-mono">
                <tr>
                  <th className="p-3">Zone</th>
                  <th className="p-3">Levels</th>
                  <th className="p-3">Cognitive Focus</th>
                  <th className="p-3">Fatigue Safeguard</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300 font-mono">
                <tr className="hover:bg-white/[0.02]">
                  <td className="p-3 font-bold text-cyan-400">1. Awakening</td>
                  <td className="p-3">1–250</td>
                  <td className="p-3 font-sans">Levels 1–50: Gentle 2x2 entry with basic addition/subtraction, 2-step memory sequences, and simple shape puzzles. Levels 51–250: 3x3 expansion and foundational logic.</td>
                  <td className="p-3 font-sans">30-second harmonic breath interlude every 15 levels.</td>
                </tr>
                <tr className="hover:bg-white/[0.02]">
                  <td className="p-3 font-bold text-amber-400">2. Illumination</td>
                  <td className="p-3">251–500</td>
                  <td className="p-3 font-sans">2-variable algebraic balance, 4x4 sequence recall, Boolean logic gates.</td>
                  <td className="p-3 font-sans">Automatic background binaural tone transition.</td>
                </tr>
                <tr className="hover:bg-white/[0.02]">
                  <td className="p-3 font-bold text-emerald-400">3. Mastery</td>
                  <td className="p-3">501–750</td>
                  <td className="p-3 font-sans">Combinatorial path sums, sequence recall under distractor pulses.</td>
                  <td className="p-3 font-sans">Dynamic pacing with zero punitive timer penalties.</td>
                </tr>
                <tr className="hover:bg-white/[0.02]">
                  <td className="p-3 font-bold text-fuchsia-400">4. Singularity</td>
                  <td className="p-3">751–1000</td>
                  <td className="p-3 font-sans">Multi-operator quantum grids, Quantum Nexus fusions, flow agility.</td>
                  <td className="p-3 font-sans">Master ambient resonance mode with customizable soundscapes.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
            <h3 className="text-sm font-bold text-white">Dynamic Difficulty Curve (The S-Curve Model)</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Difficulty does not scale linearly; it follows a smooth sigmoid curve:
              <br />
              <code className="text-cyan-400 font-mono mt-1 inline-block">
                D(L) = 1.0 + 9.0 / (1.0 + e^(-0.006 * (L - 500)))
              </code>
              <br />
              This ensures beginners experience gentle, rewarding onboarding during Awakening, followed by a steep mastery gradient in Illumination, and asymptotic refinement in Singularity.
            </p>
          </div>
        </div>
      )}

      {/* Tab 3: UI/UX Design System */}
      {activeTab === 3 && (
        <div className="glass-panel rounded-3xl p-6 md:p-8 space-y-6 border border-white/10">
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-white">3. UI/UX Design System & Visual Identity</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Strict OLED dark-mode palette utilizing genuine deep blacks (`#020408`) to reduce device power consumption and prevent eye strain during extended night sessions.
            </p>
          </div>

          {/* Color Tokens Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-black/40 border border-amber-500/30 glow-amber space-y-1">
              <span className="text-xs font-mono text-amber-400">Math Accent</span>
              <p className="text-sm font-bold text-white">Golden Amber (#F59E0B)</p>
              <p className="text-[11px] text-slate-400">Represents calculation clarity and numerical balance.</p>
            </div>

            <div className="p-4 rounded-xl bg-black/40 border border-cyan-500/30 glow-cyan space-y-1">
              <span className="text-xs font-mono text-cyan-400">Memory Accent</span>
              <p className="text-sm font-bold text-white">Cyber Cyan (#06B6D4)</p>
              <p className="text-[11px] text-slate-400">Evokes neural synaptic pulses and spatial retention.</p>
            </div>

            <div className="p-4 rounded-xl bg-black/40 border border-emerald-500/30 glow-emerald space-y-1">
              <span className="text-xs font-mono text-emerald-400">Puzzle Accent</span>
              <p className="text-sm font-bold text-white">Emerald Green (#10B981)</p>
              <p className="text-[11px] text-slate-400">Signifies completed spatial circuit pathways.</p>
            </div>

            <div className="p-4 rounded-xl bg-black/40 border border-rose-500/30 glow-magenta space-y-1">
              <span className="text-xs font-mono text-rose-400">Logic Accent</span>
              <p className="text-sm font-bold text-white">Neon Magenta (#EC4899)</p>
              <p className="text-[11px] text-slate-400">Denotes Boolean truth verification and gates.</p>
            </div>

            <div className="p-4 rounded-xl bg-black/40 border border-violet-500/30 glow-violet space-y-1">
              <span className="text-xs font-mono text-violet-400">Relaxing Accent</span>
              <p className="text-sm font-bold text-white">Soft Violet (#8B5CF6)</p>
              <p className="text-[11px] text-slate-400">Calming wavelength for harmonic breath pacing.</p>
            </div>

            <div className="p-4 rounded-xl bg-black/40 border border-fuchsia-500/30 glow-quantum space-y-1">
              <span className="text-xs font-mono text-fuchsia-400">Quantum Nexus</span>
              <p className="text-sm font-bold text-white">Prismatic Fusion (#A855F7)</p>
              <p className="text-[11px] text-slate-400">Dynamic multi-stage synergy combining all 4 pillars.</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
            <h3 className="text-sm font-bold text-white">Micro-Interaction & Motion Latency Budgets</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              All UI feedback respects a strict 150ms or less latency budget using GPU compositor properties (transform: scale, opacity). The victory sequence spawns 45 radial canvas particles and sounds an arpeggiated Major 7th chord without frame drops.
            </p>
          </div>
        </div>
      )}

      {/* Tab 4: Tech Stack Proposal */}
      {activeTab === 4 && (
        <div className="glass-panel rounded-3xl p-6 md:p-8 space-y-6 border border-white/10">
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-white">4. Technical Stack & State Persistence Strategy</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Evaluation of cross-platform deployment options to reach both Google Play (Android) and Web/Desktop:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
              <span className="text-xs font-mono text-emerald-400 font-bold uppercase">
                Recommendation A: Web Core + PWA / Capacitor
              </span>
              <h3 className="text-base font-bold text-white">React 19 + Tailwind v4 + Canvas / Web Audio</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                <strong>Why:</strong> Single unified codebase running seamlessly in modern web browsers, packaged for Google Play Store with zero overhead using Capacitor or TWA (Trusted Web Activity). 100% offline support via service workers, Web Audio API support on all hardware.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
              <span className="text-xs font-mono text-cyan-400 font-bold uppercase">
                Recommendation B: Pure Mobile Native
              </span>
              <h3 className="text-base font-bold text-white">Flutter 3.x + Flame Game Engine</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                <strong>Why:</strong> High performance 120Hz canvas rendering on mobile devices, unified Dart codebase across iOS, Android, and Web. Ideal if complex physics or 2D skeletal animations are introduced in later expansions.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
            <h3 className="text-sm font-bold text-white">State Management: 1,000 Levels Local & Cloud Sync</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Instead of saving 1,000 discrete objects, user progress is stored as a compressed bitmask:
              <br />
              <code className="text-cyan-400 font-mono mt-1 inline-block">
                LevelBitmask: Uint8Array(125 bytes) &rarr; Represents 1,000 completion flags!
              </code>
              <br />
              This compact data footprint (under 1KB) allows instant writes to local storage and painless background synchronization with Firebase Firestore, Supabase, or PostgreSQL.
            </p>
          </div>
        </div>
      )}

      {/* Tab 5: Prototype Code Blueprint */}
      {activeTab === 5 && (
        <div className="glass-panel rounded-3xl p-6 md:p-8 space-y-4 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">5. Production Code Blueprint</h2>
              <p className="text-xs text-slate-400">
                Deterministic mathematical scaling and level generator ready for pipeline export.
              </p>
            </div>
            <button
              onClick={() => handleCopy(codeSnippet, 'blueprint-code')}
              className="flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-semibold text-cyan-400 transition-colors"
            >
              {copiedSnippet === 'blueprint-code' ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          <div className="relative rounded-2xl bg-black/70 border border-white/10 overflow-hidden">
            <div className="p-3 bg-white/5 border-b border-white/10 flex items-center justify-between text-xs font-mono text-slate-400">
              <span>synapse_core_engine.ts</span>
              <span>TypeScript · Deterministic Mulberry32</span>
            </div>
            <pre className="p-4 text-xs font-mono text-cyan-200/90 overflow-x-auto leading-relaxed max-h-[500px]">
              {codeSnippet}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
