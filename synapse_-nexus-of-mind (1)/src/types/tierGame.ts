/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type DifficultyTierId = 'medium' | 'bute' | 'kute' | 'rute' | 'engineering';

export interface DifficultyTierConfig {
  id: DifficultyTierId;
  index: number; // 1 to 5
  name: 'Medium' | 'BUTE' | 'KUTE' | 'RUTE' | 'Engineering Level';
  tagline: string;
  description: string;
  accentColor: string;
  targetCount: 10;
  maxMistakes: 3;
}

export type TargetChallengeType = 'math' | 'memory' | 'logic' | 'spatial';

export interface TargetOption {
  id: string;
  label: string;
  value: string;
  // For spatial visual tiles (e.g. 2x2 or 3x3 binary/dot pattern or rotation angle)
  glyph?: {
    kind: 'dots' | 'arrow';
    grid?: number[][];
    rotation?: number;
  };
}

export interface TargetChallenge {
  id: string;
  targetNumber: number; // 1 to 10
  type: TargetChallengeType;
  categoryLabel: string;
  prompt: string;
  expression?: string;
  options?: TargetOption[];
  correctValue?: string;
  // Memory specific
  memoryConfig?: {
    gridSize: number;
    sequence: number[];
    pulseMs: number;
  };
  // Logic gate diagram visual
  logicVisual?: {
    gateLabel: string;
    inputs: { name: string; value: boolean }[];
    secondaryGate?: string;
    thirdInput?: { name: string; value: boolean };
  };
  // Spatial pattern grid visual (2x2 or 3x3 where last cell is missing)
  spatialVisual?: {
    ruleHint: string;
    cells: ({
      kind: 'dots' | 'arrow';
      grid?: number[][];
      rotation?: number;
    } | null)[]; // null marks the '?' missing cell
    columns: number;
  };
}

export type TargetOutcome = 'pending' | 'active' | 'correct' | 'mistake';

export interface TierClearRecord {
  bestCorrect: number;
  fewestMistakes: number;
  clears: number;
  lastClearedAt: string;
}

export interface TierProgressState {
  unlockedTierIndex: number; // 1..5
  completedTiers: Partial<Record<DifficultyTierId, TierClearRecord>>;
  totalTargetsSolved: number;
  soundEnabled: boolean;
}
