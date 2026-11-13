/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TierBandId = 'foundation' | 'intermediate' | 'advanced' | 'elite';

export interface TierBandConfig {
  id: TierBandId;
  name: string;
  academicTag: string;
  levelStart: number;
  levelEnd: number;
  accentColor: string;
  description: string;
}

export type TargetType = 'math' | 'logic' | 'memory' | 'spatial';

export interface TargetChoice {
  id: string;
  label: string;
  value: string;
  glyph?: {
    kind: 'dots' | 'arrow';
    grid?: number[][];
    rotation?: number;
  };
}

export interface LevelTarget {
  id: string;
  targetNumber: number; // 1 to 10
  type: TargetType;
  categoryLabel: string;
  prompt: string;
  expression?: string;
  choices?: TargetChoice[];
  correctValue?: string;
  memoryConfig?: {
    gridSize: number;
    sequence: number[];
    pulseMs: number;
  };
  logicVisual?: {
    gateLabel: string;
    inputs: { name: string; value: boolean }[];
    secondaryGate?: string;
    thirdInput?: { name: string; value: boolean };
  };
  spatialVisual?: {
    ruleHint: string;
    columns: number;
    cells: ({
      kind: 'dots' | 'arrow';
      grid?: number[][];
      rotation?: number;
    } | null)[];
  };
}

export type TargetStatus = 'pending' | 'active' | 'correct' | 'wrong';

export interface LevelClearInfo {
  bestCorrect: number;
  fewestWrong: number;
  clearedAt: string;
}

export interface SynapseProgress {
  currentLevel: number; // 1 to 1000
  highestUnlockedLevel: number; // 1 to 1000
  clearedLevels: Record<number, LevelClearInfo>;
  totalTargetsSolved: number;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  masterVolume: number;
}
