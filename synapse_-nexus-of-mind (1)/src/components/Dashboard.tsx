/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserProgress, PillarType } from '../types/game';
import { ZONES, getDailyChallengeData, getTodayDateString } from '../services/levelEngine';
import { soundEngine } from '../services/soundEngine';
import { DailyPerformanceChart } from './DailyPerformanceChart';
import { CognitiveHeatmap } from './CognitiveHeatmap';
import {
  Gamepad2,
  Puzzle,
  BarChart3,
  Settings,
  Play,
  Sparkles,
  Calculator,
  BrainCircuit,
  GitBranch,
  Wind,
  Flame,
  CheckCircle,
  FileCode2,
  BookOpen,
  Calendar,
  Zap,
  Volume2,
  Vibrate,
  RotateCcw,
  Check,
  Compass,
  ArrowRight,
  TrendingUp,
  Activity,
  Shield,
  Layers
} from 'lucide-react';

export type DashboardTab = 'dashboard' | 'pillars' | 'telemetry' | 'settings';

interface DashboardProps {
  progress: UserProgress;
  activeTab: DashboardTab;
  onSelectTab: (tab: DashboardTab) => void;
  onPlayLevel: (levelNum: number) => void;
  onPlayPillar: (pillar: PillarType) => void;
  onPlayDaily: () => void;
  onOpenLevelSelector: () => void;
  onOpenBlueprint: () => void;
  onOpenAbout: () => void;
  onOpenHowToPlay: () => void;
  onUpdateProgress?: (updater: (prev: UserProgress) => UserProgress) => void;
  onResetProgress?: () => void;
  focusModeEnabled?: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({
  progress,
  activeTab = 'dashboard',
  onSelectTab,
  onPlayLevel,
  onPlayPillar,
  onPlayDaily,
  onOpenLevelSelector,
  onOpenBlueprint,
  onOpenAbout,
  onOpenHowToPlay,
  onUpdateProgress,
  onResetProgress,
  focusModeEnabled = false
}) => {
  const [telemetrySubTab, setTelemetrySubTab] = useState<'trends' | 'radar'>('trends');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const completedCount = Object.keys(progress.completedLevels).length;
  const currentLevel = progress.currentLevel;
  const activeZone = ZONES.find(
    (z) => currentLevel >= z.levelStart && currentLevel <= z.levelEnd
  ) || ZONES[0];

  const dailyInfo = getDailyChallengeData();
  const todayStr = getTodayDateString();
  const isCompletedToday = progress.lastDailyCompletedDate === todayStr;
  const dailyStreak = progress.dailyStreak || 0;

  // Audio handlers for Settings tab
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    soundEngine.setVolume(val);
    onUpdateProgress?.((prev) => ({ ...prev, masterVolume: val }));
  };

  const handleToggleAmbient = () => {
    const next = !progress.ambientZenEnabled;
    soundEngine.toggleAmbient(next);
    onUpdateProgress?.((prev) => ({ ...prev, ambientZenEnabled: next }));
  };

  const handleToggleHaptics = () => {
    soundEngine.playClick();
    onUpdateProgress?.((prev) => {
      const next = !prev.hapticsEnabled;
      if (next) soundEngine.triggerHaptic(20);
      return { ...prev, hapticsEnabled: next };
    });
  };

  const handleConfirmReset = () => {
    soundEngine.playSoftMistake();
    onResetProgress?.();
    setShowResetConfirm(false);
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 2500);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-3 flex flex-col h-full flex-1 min-h-0 justify-between">
      {/* Active Tab Content Area (Zero-Scroll on Desktop/Laptop) */}
      <div className="flex-1 min-h-0 flex flex-col justify-between overflow-y-auto lg:overflow-hidden pb-1">
        {/* ========================================================
            TAB 1: 🎮 DASHBOARD (Dynamic 2-Column Symmetrical Layout)
           ======================================================== */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 sm:gap-4 h-full min-h-0 items-stretch">
            {/* ----------------- LEFT COLUMN: Quick Launch & Neural Balance ----------------- */}
            <div className="flex flex-col gap-3 sm:gap-3.5 h-full min-h-0 justify-between">
              {/* Quick Launch Hero Card */}
              <div className="relative overflow-hidden rounded-2xl glass-panel p-4 sm:p-5 border border-cyan-500/25 bg-gradient-to-br from-[#070e1c] via-[#050b16] to-[#02050b] glow-cyan flex flex-col justify-between gap-3 flex-1 min-h-0">
                <div className="space-y-2">
                  {/* Clean unboxed metadata */}
                  <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-cyan-400">
                    <span className="font-semibold text-cyan-300">Zone: {activeZone.name}</span>
                    <span className="text-slate-600">·</span>
                    <span>Lvl {activeZone.levelStart}–{activeZone.levelEnd}</span>
                    <span className="text-slate-600">·</span>
                    <span className="text-emerald-400 font-semibold">{completedCount} Mastered</span>
                  </div>

                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-tight">
                    SYNAPSE: Nexus of Mind
                  </h1>

                  <p className="text-xs sm:text-sm text-slate-300 leading-snug line-clamp-2">
                    Cognitive equilibrium through seamless puzzle synthesis. Zero-friction flow states and 1,000 deterministic brain trials.
                  </p>
                </div>

                {/* Primary Launch Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    onClick={() => {
                      soundEngine.playSuccess();
                      onPlayLevel(currentLevel);
                    }}
                    className="flex-1 min-w-[150px] min-h-[42px] py-2.5 px-4 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2 transition-all shadow-md shadow-cyan-400/25 active:scale-95 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-slate-950" />
                    <span>Instant Play #{currentLevel}</span>
                  </button>

                  <button
                    onClick={() => {
                      soundEngine.playNodeChime(4);
                      onPlayPillar('quantum');
                    }}
                    className="min-h-[42px] py-2.5 px-3.5 rounded-xl bg-fuchsia-500/15 hover:bg-fuchsia-500/25 text-fuchsia-300 border border-fuchsia-500/40 font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-[0_0_12px_rgba(217,70,239,0.2)]"
                  >
                    <Sparkles className="w-4 h-4 text-fuchsia-400" />
                    <span>Quantum Nexus</span>
                  </button>

                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      onOpenHowToPlay();
                    }}
                    className="min-h-[42px] py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 hover:border-cyan-400/40 font-medium text-xs flex items-center justify-center gap-1.5 transition-all hover:text-white active:scale-95 cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Rules</span>
                  </button>
                </div>

                {/* Unboxed Stats Strip */}
                <div className="pt-3 border-t border-white/10 grid grid-cols-3 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono uppercase tracking-wider">Milestone</span>
                    <span className="text-base sm:text-lg font-mono font-bold text-white tabular-nums block mt-0.5">
                      Lvl {currentLevel} <span className="text-[10px] text-slate-500 font-sans">/ 1,000</span>
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono uppercase tracking-wider">Flawless Streak</span>
                    <span className="text-base sm:text-lg font-mono font-bold text-amber-400 tabular-nums flex items-center gap-1 mt-0.5">
                      <Flame className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
                      <span>{progress.streakDays} Days</span>
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono uppercase tracking-wider">Mastered Nodes</span>
                    <span className="text-base sm:text-lg font-mono font-bold text-emerald-400 tabular-nums block mt-0.5">
                      {completedCount}
                    </span>
                  </div>
                </div>
              </div>

              {/* Neural Mastery Balance Snapshot Card */}
              {!focusModeEnabled && (
                <div className="rounded-2xl glass-panel p-3.5 sm:p-4 border border-white/10 bg-[#060a14]/90 flex flex-col justify-between gap-2.5 shrink-0 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-cyan-400" />
                      <h2 className="text-xs sm:text-sm font-bold text-white">Neural Mastery Balance</h2>
                    </div>
                    <button
                      onClick={() => onSelectTab('pillars')}
                      className="text-xs font-mono text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Train Pillars →</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-0.5">
                    {/* Math */}
                    <div className="space-y-1 p-2 rounded-xl bg-white/[0.02] border border-white/5">
                      <div className="flex justify-between text-[11px] font-mono">
                        <span className="text-amber-400 font-semibold truncate flex items-center gap-1">
                          <Calculator className="w-3 h-3" />
                          Math
                        </span>
                        <span className="text-white font-bold">{progress.mastery.math}%</span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-1.5 border border-white/10 overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full"
                          style={{ width: `${progress.mastery.math}%` }}
                        />
                      </div>
                    </div>

                    {/* Memory */}
                    <div className="space-y-1 p-2 rounded-xl bg-white/[0.02] border border-white/5">
                      <div className="flex justify-between text-[11px] font-mono">
                        <span className="text-cyan-400 font-semibold truncate flex items-center gap-1">
                          <BrainCircuit className="w-3 h-3" />
                          Memory
                        </span>
                        <span className="text-white font-bold">{progress.mastery.memory}%</span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-1.5 border border-white/10 overflow-hidden">
                        <div
                          className="h-full bg-cyan-400 rounded-full"
                          style={{ width: `${progress.mastery.memory}%` }}
                        />
                      </div>
                    </div>

                    {/* Logic */}
                    <div className="space-y-1 p-2 rounded-xl bg-white/[0.02] border border-white/5">
                      <div className="flex justify-between text-[11px] font-mono">
                        <span className="text-rose-400 font-semibold truncate flex items-center gap-1">
                          <GitBranch className="w-3 h-3" />
                          Logic
                        </span>
                        <span className="text-white font-bold">{progress.mastery.logic}%</span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-1.5 border border-white/10 overflow-hidden">
                        <div
                          className="h-full bg-rose-400 rounded-full"
                          style={{ width: `${progress.mastery.logic}%` }}
                        />
                      </div>
                    </div>

                    {/* Spatial */}
                    <div className="space-y-1 p-2 rounded-xl bg-white/[0.02] border border-white/5">
                      <div className="flex justify-between text-[11px] font-mono">
                        <span className="text-emerald-400 font-semibold truncate flex items-center gap-1">
                          <Puzzle className="w-3 h-3" />
                          Spatial
                        </span>
                        <span className="text-white font-bold">{progress.mastery.puzzle}%</span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-1.5 border border-white/10 overflow-hidden">
                        <div
                          className="h-full bg-emerald-400 rounded-full"
                          style={{ width: `${progress.mastery.puzzle}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ----------------- RIGHT COLUMN: Daily Challenge & 1,000 Nodes ----------------- */}
            <div className="flex flex-col gap-3 sm:gap-3.5 h-full min-h-0 justify-between">
              {/* Daily Challenge Card */}
              <div className="rounded-2xl glass-panel p-4 sm:p-5 border border-amber-500/35 bg-gradient-to-br from-amber-950/20 via-purple-950/15 to-cyan-950/20 glow-amber flex flex-col justify-between gap-3 flex-1 min-h-0">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                    <span className="bg-amber-500/15 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/30 font-semibold flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{dailyInfo.formattedDate}</span>
                    </span>
                    <span className="text-amber-300 font-bold flex items-center gap-1 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/40 shadow-[0_0_8px_rgba(245,158,11,0.3)]">
                      <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span>Daily Streak: {dailyStreak}d</span>
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-amber-300/80 block font-semibold">
                      Daily Rotating Trial
                    </span>
                    <h2 className="text-lg sm:text-xl font-bold text-white flex items-center justify-between gap-2 mt-0.5">
                      <span className="truncate">{dailyInfo.subtitle}</span>
                      <span className="text-[11px] font-mono text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30 font-bold shrink-0">
                        Diff {dailyInfo.levelData.difficultyRating}/10
                      </span>
                    </h2>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300 leading-snug line-clamp-2">
                    {isCompletedToday
                      ? `Mastered today! Your ${dailyStreak}-day streak is secured. Replay anytime to hone telemetry.`
                      : `Solve today's rotating ${dailyInfo.pillar.toUpperCase()} trial to extend your exclusive Daily Streak counter!`}
                  </p>
                </div>

                {/* Daily Challenge Action Button */}
                <div className="pt-1">
                  {isCompletedToday ? (
                    <button
                      onClick={() => {
                        soundEngine.playClick();
                        onPlayDaily();
                      }}
                      className="w-full min-h-[42px] py-2.5 px-4 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2 transition-all active:scale-95 shadow-[0_0_12px_rgba(16,185,129,0.25)] cursor-pointer"
                    >
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span>Replay Daily Challenge</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        soundEngine.playSuccess();
                        onPlayDaily();
                      }}
                      className="w-full min-h-[42px] py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-orange-400 hover:brightness-110 text-slate-950 font-extrabold text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(245,158,11,0.35)] active:scale-95 cursor-pointer"
                    >
                      <Zap className="w-4 h-4 fill-slate-950" />
                      <span>Start Today's Challenge</span>
                    </button>
                  )}
                </div>
              </div>

              {/* 1,000-Level Architecture Tracker */}
              <div className="rounded-2xl glass-panel p-3.5 sm:p-4 border border-white/10 bg-[#060a14]/90 flex flex-col justify-between gap-2.5 shrink-0 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    <h2 className="text-xs sm:text-sm font-bold text-white tracking-tight">
                      1,000-Level Architecture
                    </h2>
                  </div>
                  <button
                    onClick={onOpenLevelSelector}
                    className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <span>Browse All 1,000 Nodes</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Overall Progression Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono text-slate-400">
                    <span>Awakening (Lvl 1)</span>
                    <span className="text-cyan-300 font-bold">
                      Singularity ({((completedCount / 1000) * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-900/90 rounded-full h-2 p-0.5 border border-white/10 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-emerald-400 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(2, (completedCount / 1000) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* 4 Zones Grid */}
                <div className="grid grid-cols-4 gap-2 pt-0.5">
                  {ZONES.map((zone) => {
                    const isCurrent = activeZone.id === zone.id;
                    const isCompleted = currentLevel > zone.levelEnd;

                    return (
                      <div
                        key={zone.id}
                        onClick={onOpenLevelSelector}
                        className={`p-2 rounded-xl border cursor-pointer transition-all text-center space-y-0.5 ${
                          isCurrent
                            ? 'border-cyan-400/60 bg-cyan-950/40 shadow-[0_0_10px_rgba(6,182,212,0.3)] ring-1 ring-cyan-400/30'
                            : isCompleted
                            ? 'border-emerald-500/30 bg-emerald-950/20'
                            : 'border-white/5 bg-white/[0.02] opacity-75 hover:opacity-100 hover:border-white/20'
                        }`}
                      >
                        <span className="text-[10px] font-mono text-slate-400 block truncate">
                          {zone.levelStart}–{zone.levelEnd}
                        </span>
                        <span className="text-xs font-bold text-white block truncate">
                          {zone.name}
                        </span>
                        <span
                          className="text-[10px] font-mono block font-semibold"
                          style={{
                            color: isCurrent ? '#38BDF8' : isCompleted ? '#34D399' : '#64748B'
                          }}
                        >
                          {isCurrent ? 'Active' : isCompleted ? 'Mastered' : 'Locked'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 2: 🧩 COGNITIVE PILLARS (Free Play Training Mode)
           ======================================================== */}
        {activeTab === 'pillars' && (
          <div className="flex flex-col gap-3 h-full min-h-0 justify-between">
            <div className="shrink-0">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Cognitive Pillars Training</span>
                <span className="text-[11px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                  Independent Free Play
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Play any domain directly without increasing main 1-1000 level progression. Difficulty scales dynamically per pillar.
              </p>
            </div>

            {/* 6-Card Compact Responsive Grid (fits without vertical scroll) */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3 flex-1 min-h-0">
              {/* Pillar 1: Math Equilibrium */}
              <div
                onClick={() => {
                  soundEngine.playClick();
                  onPlayPillar('math');
                }}
                className="group cursor-pointer rounded-2xl glass-card p-3 sm:p-4 border border-amber-500/25 hover:border-amber-400 hover:bg-amber-500/10 transition-all duration-200 glow-amber flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300">
                      <Calculator className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 font-bold">
                      Training #{progress.pillarTrainingLevels?.math || 1}
                    </span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                    Math Equilibrium
                  </h3>
                  <p className="text-[11px] text-slate-300 leading-snug line-clamp-2">
                    Arithmetic balance, matrix sum invariants, and combinatorial target solutions.
                  </p>
                </div>
                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-amber-400 font-semibold">
                  <span>Mastery: {progress.mastery.math}%</span>
                  <span className="group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                    Launch →
                  </span>
                </div>
              </div>

              {/* Pillar 2: Memory Recall */}
              <div
                onClick={() => {
                  soundEngine.playClick();
                  onPlayPillar('memory');
                }}
                className="group cursor-pointer rounded-2xl glass-card p-3 sm:p-4 border border-cyan-500/25 hover:border-cyan-400 hover:bg-cyan-500/10 transition-all duration-200 glow-cyan flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
                      <BrainCircuit className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20 font-bold">
                      Training #{progress.pillarTrainingLevels?.memory || 1}
                    </span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                    Memory Recall
                  </h3>
                  <p className="text-[11px] text-slate-300 leading-snug line-clamp-2">
                    Spatial pathway illumination, matrix flash patterns, and progressive retention recall.
                  </p>
                </div>
                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-cyan-400 font-semibold">
                  <span>Mastery: {progress.mastery.memory}%</span>
                  <span className="group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                    Launch →
                  </span>
                </div>
              </div>

              {/* Pillar 3: Logic Deduction */}
              <div
                onClick={() => {
                  soundEngine.playClick();
                  onPlayPillar('logic');
                }}
                className="group cursor-pointer rounded-2xl glass-card p-3 sm:p-4 border border-rose-500/25 hover:border-rose-400 hover:bg-rose-500/10 transition-all duration-200 glow-magenta flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-300">
                      <GitBranch className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20 font-bold">
                      Training #{progress.pillarTrainingLevels?.logic || 1}
                    </span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-rose-300 transition-colors">
                    Logic Deduction
                  </h3>
                  <p className="text-[11px] text-slate-300 leading-snug line-clamp-2">
                    Boolean logic gates, Latin square truth matrices, and constraint satisfaction lattices.
                  </p>
                </div>
                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-rose-400 font-semibold">
                  <span>Mastery: {progress.mastery.logic}%</span>
                  <span className="group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                    Launch →
                  </span>
                </div>
              </div>

              {/* Pillar 4: Spatial Circuit */}
              <div
                onClick={() => {
                  soundEngine.playClick();
                  onPlayPillar('puzzle');
                }}
                className="group cursor-pointer rounded-2xl glass-card p-3 sm:p-4 border border-emerald-500/25 hover:border-emerald-400 hover:bg-emerald-500/10 transition-all duration-200 glow-emerald flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300">
                      <Puzzle className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-bold">
                      Training #{progress.pillarTrainingLevels?.puzzle || 1}
                    </span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                    Spatial Circuit
                  </h3>
                  <p className="text-[11px] text-slate-300 leading-snug line-clamp-2">
                    Rotational circuit alignment, geometric packing, and topological graph connections.
                  </p>
                </div>
                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-emerald-400 font-semibold">
                  <span>Mastery: {progress.mastery.puzzle}%</span>
                  <span className="group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                    Launch →
                  </span>
                </div>
              </div>

              {/* Pillar 5: Zen Resonator */}
              <div
                onClick={() => {
                  soundEngine.playClick();
                  onPlayPillar('relaxing');
                }}
                className="group cursor-pointer rounded-2xl glass-card p-3 sm:p-4 border border-violet-500/25 hover:border-violet-400 hover:bg-violet-500/10 transition-all duration-200 glow-violet flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-violet-300">
                      <Wind className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-mono text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-full border border-violet-500/20 font-bold">
                      Decompress
                    </span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-violet-300 transition-colors">
                    Zen Resonator
                  </h3>
                  <p className="text-[11px] text-slate-300 leading-snug line-clamp-2">
                    Harmonic wave synchronization, binaural frequency breathing, and fatigue alleviation.
                  </p>
                </div>
                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-violet-400 font-semibold">
                  <span>Stress Relief</span>
                  <span className="group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                    Enter Zen →
                  </span>
                </div>
              </div>

              {/* Pillar 6: Quantum Nexus Fusion Mode */}
              <div
                onClick={() => {
                  soundEngine.playNodeChime(4);
                  onPlayPillar('quantum');
                }}
                className="group cursor-pointer rounded-2xl glass-card p-3 sm:p-4 border border-fuchsia-500/35 hover:border-fuchsia-400 hover:bg-fuchsia-500/10 transition-all duration-200 glow-magenta flex flex-col justify-between bg-gradient-to-br from-fuchsia-950/20 to-transparent shadow-[0_0_15px_rgba(217,70,239,0.15)]"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-xl bg-fuchsia-500/20 border border-fuchsia-500/30 flex items-center justify-center text-fuchsia-300">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-mono text-fuchsia-400 bg-fuchsia-500/10 px-2 py-0.5 rounded-full border border-fuchsia-500/20 font-bold">
                      Cognitive Fusion
                    </span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-fuchsia-300 transition-colors">
                    Quantum Nexus
                  </h3>
                  <p className="text-[11px] text-slate-300 leading-snug line-clamp-2">
                    Multi-stage cognitive fusion: Mental math equation + sequence recall + Boolean gates.
                  </p>
                </div>
                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-fuchsia-400 font-bold">
                  <span>Mastery: {progress.mastery.quantum}%</span>
                  <span className="group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                    Fusion Trial →
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 3: 📊 TELEMETRY & STATS (Recharts & D3.js Radar)
           ======================================================== */}
        {activeTab === 'telemetry' && (
          <div className="flex flex-col gap-3 h-full min-h-0 justify-between">
            {/* Telemetry Sub-Navigation Switcher */}
            <div className="flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                <h2 className="text-xs sm:text-sm font-bold text-white">Neural Telemetry Suite</h2>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-1 flex items-center gap-1">
                <button
                  onClick={() => {
                    soundEngine.playClick();
                    setTelemetrySubTab('trends');
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                    telemetrySubTab === 'trends'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-white border border-transparent'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>30-Day Trends</span>
                </button>

                <button
                  onClick={() => {
                    soundEngine.playClick();
                    setTelemetrySubTab('radar');
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                    telemetrySubTab === 'radar'
                      ? 'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-white border border-transparent'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Cognitive Radar</span>
                </button>
              </div>
            </div>

            {/* Sub-view rendering (Compact Screen-Fitted) */}
            <div className="flex-1 min-h-0 overflow-hidden flex flex-col justify-center">
              {telemetrySubTab === 'trends' ? (
                <DailyPerformanceChart progress={progress} compact={true} />
              ) : (
                <CognitiveHeatmap progress={progress} compact={true} />
              )}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 4: ⚙️ SETTINGS & CREDITS (Developed by Shafayet & Config)
           ======================================================== */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 h-full min-h-0 items-stretch">
            {/* Column 1: Developed by Shafayet Spotlight Card */}
            <div className="rounded-2xl glass-panel p-4 sm:p-5 border border-cyan-500/30 flex flex-col justify-between glow-cyan gap-3 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
              <div className="space-y-2.5">
                <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 block font-semibold">
                  Lead Game Architect & UI/UX
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  Developed by Shafayet
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Engineered with deterministic mulberry32 PRNG, procedural Web Audio synthesizer, and an exponential 1,000-level cognitive difficulty curve ranging from primary school Grade 1 logic to elite BUET/KUET/RUET engineering complexity.
                </p>

                <div className="pt-1 flex flex-wrap items-center gap-1.5 text-[11px] font-mono text-slate-300">
                  <span className="px-2.5 py-0.5 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 font-bold">
                    v1.0.0 Production
                  </span>
                  <span className="px-2.5 py-0.5 rounded-lg bg-white/5 border border-white/10">
                    OLED Dark UI
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
                <button
                  onClick={() => {
                    soundEngine.playClick();
                    onOpenBlueprint();
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-200 hover:text-white flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <FileCode2 className="w-3.5 h-3.5 text-fuchsia-400" />
                    <span>Architecture Spec & GDD</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => {
                    soundEngine.playClick();
                    onOpenHowToPlay();
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-200 hover:text-white flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                    <span>How to Play & Rules Guide</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Column 2: Game Audio & Tactile Engine Controls */}
            <div className="rounded-2xl glass-panel p-4 sm:p-5 border border-white/10 flex flex-col justify-between gap-3 shadow-lg">
              <div className="space-y-3">
                <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2 font-mono uppercase tracking-wider">
                  <Volume2 className="w-4 h-4 text-cyan-400" />
                  <span>Audio & Tactile Controls</span>
                </h3>

                {/* Volume Slider */}
                <div className="space-y-1.5 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-300">Master Volume</span>
                    <span className="font-mono text-cyan-400 font-bold">
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

                {/* Ambient Drone Toggle */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <Wind className="w-3.5 h-3.5 text-violet-400" />
                      Ambient Theta Wave (4Hz)
                    </span>
                    <p className="text-[10px] text-slate-400">Low-frequency binaural drone</p>
                  </div>
                  <button
                    onClick={handleToggleAmbient}
                    className={`w-10 h-5 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                      progress.ambientZenEnabled ? 'bg-violet-500' : 'bg-white/10'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        progress.ambientZenEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Tactile Haptics Toggle */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <Vibrate className="w-3.5 h-3.5 text-cyan-400" />
                      Haptic Feedback
                    </span>
                    <p className="text-[10px] text-slate-400">Touch vibration impulses</p>
                  </div>
                  <button
                    onClick={handleToggleHaptics}
                    className={`w-10 h-5 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                      progress.hapticsEnabled ? 'bg-cyan-500' : 'bg-white/10'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        progress.hapticsEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Audio Tester Buttons */}
              <div className="space-y-1.5 pt-1.5 border-t border-white/10">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-semibold">
                  Web Audio Feedback Tester
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => soundEngine.playClick()}
                    className="py-1.5 px-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-slate-300 font-mono transition-colors cursor-pointer"
                  >
                    Pop
                  </button>
                  <button
                    onClick={() => soundEngine.playNodeChime(4)}
                    className="py-1.5 px-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-slate-300 font-mono transition-colors cursor-pointer"
                  >
                    Chime
                  </button>
                  <button
                    onClick={() => soundEngine.playSuccess()}
                    className="py-1.5 px-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-emerald-300 font-mono transition-colors cursor-pointer"
                  >
                    Victory
                  </button>
                </div>
              </div>
            </div>

            {/* Column 3: Session State & Save Data Management */}
            <div className="rounded-2xl glass-panel p-4 sm:p-5 border border-white/10 flex flex-col justify-between gap-3 shadow-lg">
              <div className="space-y-2.5">
                <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2 font-mono uppercase tracking-wider">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span>Session & Save Data</span>
                </h3>

                <div className="space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between items-center p-2 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-slate-400">Total Solved Nodes:</span>
                    <span className="text-emerald-400 font-bold">{completedCount} / 1000</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-slate-400">Flawless Streak:</span>
                    <span className="text-amber-400 font-bold">{progress.streakDays} Days</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-slate-400">Daily Challenge Streak:</span>
                    <span className="text-amber-400 font-bold">{progress.dailyStreak || 0} Days</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-slate-400">Active Zone:</span>
                    <span className="text-cyan-300 font-bold">{activeZone.name}</span>
                  </div>
                </div>
              </div>

              {/* Reset Section */}
              <div className="pt-2 border-t border-white/10 space-y-2">
                {showResetConfirm ? (
                  <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/50 space-y-2">
                    <p className="text-[11px] text-rose-300 font-medium">
                      Confirm reset of all progress? This cannot be undone.
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleConfirmReset}
                        className="py-1 px-3 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs cursor-pointer"
                      >
                        Yes, Reset
                      </button>
                      <button
                        onClick={() => setShowResetConfirm(false)}
                        className="py-1 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 text-xs cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowResetConfirm(true)}
                    className="flex items-center gap-1.5 text-xs text-rose-400/80 hover:text-rose-400 transition-colors cursor-pointer py-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Cognitive Save Data</span>
                  </button>
                )}

                {resetSuccess && (
                  <p className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>Progress reset to Level 1.</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sleek Minimalist Single-Line Footer (Hidden in Focus Mode) */}
      {!focusModeEnabled && (
        <footer className="pt-2 border-t border-white/[0.08] flex items-center justify-between text-[11px] font-mono text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-semibold">SYNAPSE</span>
            <span aria-hidden="true" className="text-slate-700">·</span>
            <span className="text-cyan-300 font-medium">Developed by Shafayet</span>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-sans">
            <button
              onClick={() => {
                soundEngine.playClick();
                onOpenHowToPlay();
              }}
              className="text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
            >
              Rules
            </button>
            <span aria-hidden="true" className="text-slate-700">·</span>
            <button
              onClick={() => {
                soundEngine.playClick();
                onOpenAbout();
              }}
              className="text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
            >
              About
            </button>
            <span aria-hidden="true" className="text-slate-700">·</span>
            <button
              onClick={() => {
                soundEngine.playClick();
                onOpenBlueprint();
              }}
              className="text-slate-400 hover:text-fuchsia-400 transition-colors cursor-pointer"
            >
              Spec
            </button>
          </div>
        </footer>
      )}
    </div>
  );
};
