/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type PillarType = 'math' | 'memory' | 'puzzle' | 'logic' | 'relaxing' | 'quantum';

export type ZoneId = 'awakening' | 'illumination' | 'mastery' | 'singularity';

export interface ZoneConfig {
  id: ZoneId;
  name: string;
  tagline: string;
  levelStart: number;
  levelEnd: number;
  accentColor: string;
  description: string;
}

export interface LevelData {
  levelNumber: number;
  zone: ZoneId;
  pillar: PillarType;
  title: string;
  description: string;
  difficultyRating: number; // 1 to 10
  seed: number;
  targetMetric: number;
  config: Record<string, any>;
}

export interface PillarMastery {
  math: number;
  memory: number;
  puzzle: number;
  logic: number;
  relaxing: number;
  quantum: number;
}

export interface DailyRecord {
  pillar: PillarType;
  score: number;
  completed: boolean;
  difficultyRating: number;
  completedAt: string;
}

export interface UserProgress {
  currentLevel: number;
  highestUnlockedLevel: number;
  completedLevels: Record<number, { stars: number; bestTimeSeconds: number; completedAt: string }>;
  mastery: PillarMastery;
  pillarTrainingLevels: Record<PillarType, number>;
  streakDays: number;
  dailyStreak: number;
  lastDailyCompletedDate: string | null;
  dailyHistory?: Record<string, DailyRecord>;
  lastPlayedDate: string;
  soundEnabled: boolean;
  ambientZenEnabled: boolean;
  hapticsEnabled: boolean;
  masterVolume: number;
}

export type AppView = 'dashboard' | 'play' | 'levels' | 'blueprint';
