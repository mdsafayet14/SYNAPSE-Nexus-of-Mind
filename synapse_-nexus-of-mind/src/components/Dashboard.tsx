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
  Layers,
  Award
} from 'lucide-react';

export type DashboardTab = 'dashboard' | 'pillars' | 'telemetry' | 'settings';

interface DashboardProps {
  progress: UserProgress;
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
  const [activeTab, setActiveTab] = useState<DashboardTab>('dashboard');
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
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7 flex flex-col gap-6">
      {/* 4-Tab Navigation Header Ribbon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/[0.08] gap-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 sm:gap-2 p-1.5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md overflow-x-auto no-scrollbar shadow-inner">
          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('dashboard');
            }}
            className={`min-h-[44px] px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold tracking-wide transition-all flex items-center gap-2.5 whitespace-nowrap active:scale-95 ${
              activeTab === 'dashboard'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <Gamepad2 className="w-4 h-4 text-cyan-400" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('pillars');
            }}
            className={`min-h-[44px] px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold tracking-wide transition-all flex items-center gap-2.5 whitespace-nowrap active:scale-95 ${
              activeTab === 'pillars'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <Puzzle className="w-4 h-4 text-amber-400" />
            <span>Cognitive Pillars</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('telemetry');
            }}
            className={`min-h-[44px] px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold tracking-wide transition-all flex items-center gap-2.5 whitespace-nowrap active:scale-95 ${
              activeTab === 'telemetry'
                ? 'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/40 shadow-[0_0_15px_rgba(217,70,239,0.3)]'
                : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-fuchsia-400" />
            <span>Telemetry & Stats</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('settings');
            }}
            className={`min-h-[44px] px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold tracking-wide transition-all flex items-center gap-2.5 whitespace-nowrap active:scale-95 ${
              activeTab === 'settings'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <Settings className="w-4 h-4 text-emerald-400" />
            <span>Settings & Credits</span>
          </button>
        </div>

        {/* Developer Credit Tag */}
        <div className="flex items-center gap-3 self-end sm:self-center">
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-500 uppercase tracking-widest text-[10px]">Architecture</span>
            <span className="text-slate-700">·</span>
            <span className="text-cyan-300 font-bold bg-cyan-500/10 border border-cyan-500/30 px-3 py-1.5 rounded-xl shadow-[0_0_12px_rgba(6,182,212,0.25)] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Developed by Safayet</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Tab Content Viewport */}
      <div className="w-full">
        {/* ========================================================
            TAB 1: 🎮 DASHBOARD (Quick Launch, Level 1-1000, Daily Challenge)
           ======================================================== */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Quick Launch & 1,000 Levels Progression */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              {/* Quick Launch Hero Card */}
              <div className="relative overflow-hidden rounded-2xl glass-panel p-6 sm:p-7 border border-cyan-500/25 bg-gradient-to-br from-[#070e1c] via-[#050b16] to-[#02050b] shadow-[0_0_25px_rgba(6,182,212,0.12)] flex flex-col justify-between gap-5">
                <div className="space-y-3">
                  {/* Clean unboxed metadata with typographic separators */}
                  <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-cyan-400/90">
                    <span className="text-cyan-300 font-semibold">Zone: {activeZone.name}</span>
                    <span className="text-slate-600">·</span>
                    <span>Levels {activeZone.levelStart}–{activeZone.levelEnd}</span>
                    <span className="text-slate-600">·</span>
                    <span className="text-emerald-400 font-semibold">{completedCount} Mastered</span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                    SYNAPSE: Nexus of Mind
                  </h1>

                  <p className="text-sm sm:text-[15px] text-slate-300 leading-relaxed max-w-xl">
                    Cognitive equilibrium through seamless puzzle synthesis. Zero-friction flow states, no punitive timers, and 1,000 deterministic brain trials.
                  </p>
                </div>

                {/* Primary Launch Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    onClick={() => {
                      soundEngine.playSuccess();
                      onPlayLevel(currentLevel);
                    }}
                    className="flex-1 min-w-[180px] min-h-[48px] py-3.5 px-6 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-sm tracking-wide flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-cyan-400/25 active:scale-95 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-slate-950" />
                    <span>Instant Play #{currentLevel}</span>
                  </button>

                  <button
                    onClick={() => {
                      soundEngine.playNodeChime(4);
                      onPlayPillar('quantum');
                    }}
                    className="min-h-[48px] py-3.5 px-5 rounded-xl bg-fuchsia-500/15 hover:bg-fuchsia-500/25 text-fuchsia-300 border border-fuchsia-500/40 font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer shadow-[0_0_15px_rgba(217,70,239,0.2)]"
                  >
                    <Sparkles className="w-4 h-4 text-fuchsia-400" />
                    <span>Quantum Nexus</span>
                  </button>

                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      onOpenHowToPlay();
                    }}
                    className="min-h-[48px] py-3.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 hover:border-cyan-400/40 font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:text-white active:scale-95 cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4 text-cyan-400" />
                    <span className="hidden sm:inline">Rules</span>
                  </button>
                </div>

                {/* Unboxed Stats Strip */}
                <div className="pt-5 mt-1 border-t border-white/10 grid grid-cols-3 gap-4">
                  <div>
                    <span className="text-xs text-slate-400 block font-mono uppercase tracking-wider">Current Milestone</span>
                    <span className="text-xl sm:text-2xl font-mono font-bold text-white tabular-nums mt-0.5 block">
                      Lvl {currentLevel} <span className="text-xs text-slate-500 font-sans font-normal">/ 1,000</span>
                    </span>
                  </div>

                  <div>
                    <span className="text-xs text-slate-400 block font-mono uppercase tracking-wider">Cognitive Streak</span>
                    <span className="text-xl sm:text-2xl font-mono font-bold text-amber-400 tabular-nums flex items-center gap-1.5 mt-0.5">
                      <Flame className="w-5 h-5 text-amber-400 fill-amber-400 shrink-0" />
                      <span>{progress.streakDays} Days</span>
                    </span>
                  </div>

                  <div>
                    <span className="text-xs text-slate-400 block font-mono uppercase tracking-wider">Mastered Nodes</span>
                    <span className="text-xl sm:text-2xl font-mono font-bold text-emerald-400 tabular-nums mt-0.5 block">
                      {completedCount}
                    </span>
                  </div>
                </div>
              </div>

              {/* 1,000-Level Progression Architecture Tracker */}
              <div className="rounded-2xl glass-panel p-6 sm:p-7 border border-white/10 bg-[#060a14]/90 shadow-[0_0_20px_rgba(0,0,0,0.5)] flex flex-col justify-between gap-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Layers className="w-5 h-5 text-cyan-400" />
                    <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                      1,000-Level Architecture
                    </h2>
                  </div>
                  <button
                    onClick={onOpenLevelSelector}
                    className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 hover:underline cursor-pointer"
                  >
                    <span>Browse All 1,000 Nodes</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Overall Progression Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono text-slate-400">
                    <span>Awakening (Lvl 1)</span>
                    <span className="text-cyan-300 font-bold">
                      Singularity ({((completedCount / 1000) * 100).toFixed(1)}% Mastered)
                    </span>
                  </div>
                  <div className="w-full bg-slate-900/90 rounded-full h-2.5 p-0.5 border border-white/10 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-emerald-400 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                      style={{ width: `${Math.max(2, (completedCount / 1000) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* 4 Zones Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-1">
                  {ZONES.map((zone) => {
                    const isCurrent = activeZone.id === zone.id;
                    const isCompleted = currentLevel > zone.levelEnd;

                    return (
                      <div
                        key={zone.id}
                        onClick={onOpenLevelSelector}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all text-center space-y-1 ${
                          isCurrent
                            ? 'border-cyan-400/60 bg-cyan-950/40 shadow-[0_0_12px_rgba(6,182,212,0.3)] ring-1 ring-cyan-400/30'
                            : isCompleted
                            ? 'border-emerald-500/35 bg-emerald-950/20 hover:border-emerald-500/50'
                            : 'border-white/5 bg-white/[0.02] opacity-75 hover:opacity-100 hover:border-white/20'
                        }`}
                      >
                        <span className="text-xs font-mono text-slate-400 block truncate">
                          {zone.levelStart}–{zone.levelEnd}
                        </span>
                        <span className="text-sm font-bold text-white block truncate">
                          {zone.name}
                        </span>
                        <span
                          className="text-xs font-mono block font-semibold mt-0.5"
                          style={{
                            color: isCurrent ? '#38BDF8' : isCompleted ? '#34D399' : '#64748B'
                          }}
                        >
                          {isCurrent ? 'Active Zone' : isCompleted ? 'Mastered' : 'Locked'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column: Daily Challenge Card & Neural Balance Snapshot */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              {/* Daily Challenge Card */}
              <div className="rounded-2xl glass-panel p-6 sm:p-7 border border-amber-500/35 bg-gradient-to-br from-amber-950/20 via-purple-950/15 to-cyan-950/20 shadow-[0_0_25px_rgba(245,158,11,0.18)] flex flex-col justify-between gap-5">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                    <span className="bg-amber-500/15 text-amber-300 px-3 py-1 rounded-full border border-amber-500/30 font-semibold flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{dailyInfo.formattedDate}</span>
                    </span>
                    <span className="text-amber-300 font-bold flex items-center gap-1.5 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.3)]">
                      <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span>Daily Streak: {dailyStreak}d</span>
                    </span>
                  </div>

                  <div>
                    <span className="text-xs font-mono uppercase tracking-wider text-amber-300/80 block font-semibold">
                      Daily Rotating Trial
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center justify-between gap-2 mt-1">
                      <span>{dailyInfo.subtitle}</span>
                      <span className="text-xs font-mono text-amber-300 bg-amber-500/20 px-2.5 py-1 rounded-md border border-amber-500/30 font-bold shrink-0">
                        Diff {dailyInfo.levelData.difficultyRating}/10
                      </span>
                    </h2>
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed">
                    {isCompletedToday
                      ? `Mastered today! Your ${dailyStreak}-day streak is secured. Replay anytime to hone precision and telemetry.`
                      : `Solve today's rotating ${dailyInfo.pillar.toUpperCase()} trial to extend your exclusive Daily Streak counter!`}
                  </p>
                </div>

                {/* Daily Challenge Button */}
                <div className="pt-2">
                  {isCompletedToday ? (
                    <button
                      onClick={() => {
                        soundEngine.playClick();
                        onPlayDaily();
                      }}
                      className="w-full min-h-[48px] py-3.5 px-5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold text-sm tracking-wide flex items-center justify-center gap-2 transition-all active:scale-95 shadow-[0_0_15px_rgba(16,185,129,0.25)] cursor-pointer"
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
                      className="w-full min-h-[48px] py-3.5 px-5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-orange-400 hover:brightness-110 text-slate-950 font-extrabold text-sm tracking-wide flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(245,158,11,0.35)] active:scale-95 cursor-pointer"
                    >
                      <Zap className="w-4 h-4 fill-slate-950" />
                      <span>Start Today's Challenge</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Cognitive Balance Snapshot Card (Hidden in Focus Mode) */}
              {!focusModeEnabled && (
                <div className="rounded-2xl glass-panel p-6 sm:p-7 border border-white/10 bg-[#060a14]/90 shadow-[0_0_20px_rgba(0,0,0,0.5)] flex flex-col justify-between gap-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-cyan-400" />
                      <h3 className="text-sm sm:text-base font-bold text-white">Neural Mastery Balance</h3>
                    </div>
                    <button
                      onClick={() => {
                        soundEngine.playClick();
                        setActiveTab('pillars');
                      }}
                      className="text-xs font-mono text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Train Pillars →</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* Math Meter */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-amber-400 font-semibold flex items-center gap-1.5">
                          <Calculator className="w-3.5 h-3.5" />
                          Math Equilibrium
                        </span>
                        <span className="text-white font-bold">{progress.mastery.math}%</span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-2 border border-white/10 overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                          style={{ width: `${progress.mastery.math}%` }}
                        />
                      </div>
                    </div>

                    {/* Memory Meter */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-cyan-400 font-semibold flex items-center gap-1.5">
                          <BrainCircuit className="w-3.5 h-3.5" />
                          Memory Recall
                        </span>
                        <span className="text-white font-bold">{progress.mastery.memory}%</span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-2 border border-white/10 overflow-hidden">
                        <div
                          className="h-full bg-cyan-400 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]"
                          style={{ width: `${progress.mastery.memory}%` }}
                        />
                      </div>
                    </div>

                    {/* Logic Meter */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-rose-400 font-semibold flex items-center gap-1.5">
                          <GitBranch className="w-3.5 h-3.5" />
                          Logic Deduction
                        </span>
                        <span className="text-white font-bold">{progress.mastery.logic}%</span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-2 border border-white/10 overflow-hidden">
                        <div
                          className="h-full bg-rose-400 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"
                          style={{ width: `${progress.mastery.logic}%` }}
                        />
                      </div>
                    </div>

                    {/* Spatial Meter */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                          <Puzzle className="w-3.5 h-3.5" />
                          Spatial Circuit
                        </span>
                        <span className="text-white font-bold">{progress.mastery.puzzle}%</span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-2 border border-white/10 overflow-hidden">
                        <div
                          className="h-full bg-emerald-400 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                          style={{ width: `${progress.mastery.puzzle}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 2: 🧩 COGNITIVE PILLARS (Free Play Training Mode)
           ======================================================== */}
        {activeTab === 'pillars' && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-3">
                  <span>Cognitive Pillars Training</span>
                  <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/25">
                    Independent Free Play
                  </span>
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  Select any domain directly without altering main campaign progression. Difficulty scales dynamically per pillar.
                </p>
              </div>
            </div>

            {/* 6-Card Spacious Responsive Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Pillar 1: Math Equilibrium */}
              <div
                onClick={() => {
                  soundEngine.playClick();
                  onPlayPillar('math');
                }}
                className="group cursor-pointer rounded-2xl glass-card p-6 border border-amber-500/25 hover:border-amber-400 hover:bg-amber-500/10 transition-all duration-200 glow-amber flex flex-col justify-between gap-5"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300">
                      <Calculator className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20 font-bold">
                      Training #{progress.pillarTrainingLevels?.math || 1}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                    Math Equilibrium
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Arithmetic balance, matrix sum invariants, and combinatorial target solutions.
                  </p>
                </div>
                <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-amber-400 font-semibold">
                  <span>Mastery: {progress.mastery.math}%</span>
                  <span className="group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    Launch Free Play <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>

              {/* Pillar 2: Memory Recall */}
              <div
                onClick={() => {
                  soundEngine.playClick();
                  onPlayPillar('memory');
                }}
                className="group cursor-pointer rounded-2xl glass-card p-6 border border-cyan-500/25 hover:border-cyan-400 hover:bg-cyan-500/10 transition-all duration-200 glow-cyan flex flex-col justify-between gap-5"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
                      <BrainCircuit className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20 font-bold">
                      Training #{progress.pillarTrainingLevels?.memory || 1}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                    Memory Recall
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Spatial pathway illumination, matrix flash patterns, and progressive retention recall.
                  </p>
                </div>
                <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-cyan-400 font-semibold">
                  <span>Mastery: {progress.mastery.memory}%</span>
                  <span className="group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    Launch Free Play <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>

              {/* Pillar 3: Logic Deduction */}
              <div
                onClick={() => {
                  soundEngine.playClick();
                  onPlayPillar('logic');
                }}
                className="group cursor-pointer rounded-2xl glass-card p-6 border border-rose-500/25 hover:border-rose-400 hover:bg-rose-500/10 transition-all duration-200 glow-magenta flex flex-col justify-between gap-5"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-300">
                      <GitBranch className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-mono text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20 font-bold">
                      Training #{progress.pillarTrainingLevels?.logic || 1}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-rose-300 transition-colors">
                    Logic Deduction
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Boolean logic gates, Latin square truth matrices, and constraint satisfaction lattices.
                  </p>
                </div>
                <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-rose-400 font-semibold">
                  <span>Mastery: {progress.mastery.logic}%</span>
                  <span className="group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    Launch Free Play <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>

              {/* Pillar 4: Spatial Circuit */}
              <div
                onClick={() => {
                  soundEngine.playClick();
                  onPlayPillar('puzzle');
                }}
                className="group cursor-pointer rounded-2xl glass-card p-6 border border-emerald-500/25 hover:border-emerald-400 hover:bg-emerald-500/10 transition-all duration-200 glow-emerald flex flex-col justify-between gap-5"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300">
                      <Puzzle className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 font-bold">
                      Training #{progress.pillarTrainingLevels?.puzzle || 1}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                    Spatial Circuit
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Rotational circuit alignment, geometric packing, and topological graph connections.
                  </p>
                </div>
                <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-emerald-400 font-semibold">
                  <span>Mastery: {progress.mastery.puzzle}%</span>
                  <span className="group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    Launch Free Play <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>

              {/* Pillar 5: Zen Resonator */}
              <div
                onClick={() => {
                  soundEngine.playClick();
                  onPlayPillar('relaxing');
                }}
                className="group cursor-pointer rounded-2xl glass-card p-6 border border-violet-500/25 hover:border-violet-400 hover:bg-violet-500/10 transition-all duration-200 glow-violet flex flex-col justify-between gap-5"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-violet-300">
                      <Wind className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-mono text-violet-400 bg-violet-500/10 px-2.5 py-1 rounded-full border border-violet-500/20 font-bold">
                      Decompress
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-violet-300 transition-colors">
                    Zen Resonator
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Harmonic wave synchronization, binaural frequency breathing, and fatigue alleviation.
                  </p>
                </div>
                <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-violet-400 font-semibold">
                  <span>Stress Alleviation</span>
                  <span className="group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    Enter Zen <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>

              {/* Pillar 6: Quantum Nexus Fusion Mode */}
              <div
                onClick={() => {
                  soundEngine.playNodeChime(4);
                  onPlayPillar('quantum');
                }}
                className="group cursor-pointer rounded-2xl glass-card p-6 border border-fuchsia-500/35 hover:border-fuchsia-400 hover:bg-fuchsia-500/10 transition-all duration-200 glow-magenta flex flex-col justify-between gap-5 bg-gradient-to-br from-fuchsia-950/20 to-transparent shadow-[0_0_20px_rgba(217,70,239,0.15)]"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-fuchsia-500/20 border border-fuchsia-500/30 flex items-center justify-center text-fuchsia-300">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-mono text-fuchsia-400 bg-fuchsia-500/10 px-2.5 py-1 rounded-full border border-fuchsia-500/20 font-bold">
                      Cognitive Fusion
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-fuchsia-300 transition-colors">
                    Quantum Nexus
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Multi-stage cognitive fusion: Mental math equation + sequence recall + Boolean gates.
                  </p>
                </div>
                <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-fuchsia-400 font-bold">
                  <span>Mastery: {progress.mastery.quantum}%</span>
                  <span className="group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    Launch Fusion Trial <ArrowRight className="w-3.5 h-3.5" />
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
          <div className="flex flex-col gap-6">
            {/* Telemetry Sub-Navigation Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.08]">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-5 h-5 text-cyan-400" />
                <div>
                  <h2 className="text-lg font-bold text-white">Neural Telemetry Suite</h2>
                  <p className="text-xs text-slate-400">30-day cognitive performance analytics and multi-pillar radar</p>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-1.5 flex items-center gap-1.5 self-start sm:self-auto">
                <button
                  onClick={() => {
                    soundEngine.playClick();
                    setTelemetrySubTab('trends');
                  }}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                    telemetrySubTab === 'trends'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                      : 'text-slate-400 hover:text-white border border-transparent'
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>30-Day Trends (Recharts)</span>
                </button>

                <button
                  onClick={() => {
                    soundEngine.playClick();
                    setTelemetrySubTab('radar');
                  }}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                    telemetrySubTab === 'radar'
                      ? 'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/40 shadow-[0_0_10px_rgba(217,70,239,0.3)]'
                      : 'text-slate-400 hover:text-white border border-transparent'
                  }`}
                >
                  <Compass className="w-4 h-4" />
                  <span>Cognitive Radar (D3.js)</span>
                </button>
              </div>
            </div>

            {/* Sub-view rendering */}
            <div className="w-full">
              {telemetrySubTab === 'trends' ? (
                <DailyPerformanceChart progress={progress} compact={false} />
              ) : (
                <CognitiveHeatmap progress={progress} compact={false} />
              )}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 4: ⚙️ SETTINGS & CREDITS (Developed by Safayet & Config)
           ======================================================== */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Column 1: Developed by Safayet Spotlight Card */}
            <div className="rounded-2xl glass-panel p-6 sm:p-7 border border-cyan-500/30 flex flex-col justify-between glow-cyan gap-6 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
              <div className="space-y-4">
                <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 block font-semibold">
                  Lead Game Architect & UI/UX
                </span>
                <h3 className="text-2xl font-extrabold text-white tracking-tight">
                  Developed by Safayet
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Engineered with deterministic mulberry32 PRNG, procedural Web Audio synthesizer, and an exponential 1,000-level cognitive difficulty curve ranging from primary school Grade 1 logic to elite BUET/KUET/RUET engineering complexity.
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-2 text-xs font-mono text-slate-300">
                  <span className="px-3 py-1 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 font-bold">
                    v1.0.0 Production
                  </span>
                  <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10">
                    OLED Dark UI
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-4 border-t border-white/10">
                <button
                  onClick={() => {
                    soundEngine.playClick();
                    onOpenBlueprint();
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm text-slate-200 hover:text-white flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2.5">
                    <FileCode2 className="w-4 h-4 text-fuchsia-400" />
                    <span>Architecture Spec & GDD</span>
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    soundEngine.playClick();
                    onOpenHowToPlay();
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm text-slate-200 hover:text-white flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2.5">
                    <BookOpen className="w-4 h-4 text-cyan-400" />
                    <span>How to Play & Rules Guide</span>
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Column 2: Game Audio & Tactile Engine Controls */}
            <div className="rounded-2xl glass-panel p-6 sm:p-7 border border-white/10 flex flex-col justify-between gap-6 shadow-[0_0_20px_rgba(0,0,0,0.4)]">
              <div className="space-y-5">
                <h3 className="text-sm font-bold text-white flex items-center gap-2.5 font-mono uppercase tracking-wider">
                  <Volume2 className="w-5 h-5 text-cyan-400" />
                  <span>Audio & Tactile Controls</span>
                </h3>

                {/* Volume Slider */}
                <div className="space-y-2 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="flex items-center justify-between text-sm">
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
                    className="w-full accent-cyan-400 bg-white/10 rounded-lg cursor-pointer h-2"
                  />
                </div>

                {/* Ambient Drone Toggle */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="space-y-0.5">
                    <span className="text-sm font-semibold text-white flex items-center gap-2">
                      <Wind className="w-4 h-4 text-violet-400" />
                      Ambient Theta Wave (4Hz)
                    </span>
                    <p className="text-xs text-slate-400">Low-frequency binaural drone</p>
                  </div>
                  <button
                    onClick={handleToggleAmbient}
                    className={`w-12 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                      progress.ambientZenEnabled ? 'bg-violet-500' : 'bg-white/10'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        progress.ambientZenEnabled ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Tactile Haptics Toggle */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="space-y-0.5">
                    <span className="text-sm font-semibold text-white flex items-center gap-2">
                      <Vibrate className="w-4 h-4 text-cyan-400" />
                      Haptic Feedback
                    </span>
                    <p className="text-xs text-slate-400">Touch vibration impulses</p>
                  </div>
                  <button
                    onClick={handleToggleHaptics}
                    className={`w-12 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                      progress.hapticsEnabled ? 'bg-cyan-500' : 'bg-white/10'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        progress.hapticsEnabled ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Audio Tester Buttons */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block font-semibold">
                  Web Audio Feedback Tester
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => soundEngine.playClick()}
                    className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 font-mono transition-colors cursor-pointer"
                  >
                    Pop
                  </button>
                  <button
                    onClick={() => soundEngine.playNodeChime(4)}
                    className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 font-mono transition-colors cursor-pointer"
                  >
                    Chime
                  </button>
                  <button
                    onClick={() => soundEngine.playSuccess()}
                    className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-emerald-300 font-mono transition-colors cursor-pointer"
                  >
                    Victory
                  </button>
                </div>
              </div>
            </div>

            {/* Column 3: Session State & Save Data Management */}
            <div className="rounded-2xl glass-panel p-6 sm:p-7 border border-white/10 flex flex-col justify-between gap-6 shadow-[0_0_20px_rgba(0,0,0,0.4)]">
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2.5 font-mono uppercase tracking-wider">
                  <Shield className="w-5 h-5 text-emerald-400" />
                  <span>Session & Save Data</span>
                </h3>

                <div className="space-y-2.5 text-xs font-mono">
                  <div className="flex justify-between items-center p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-slate-400">Total Solved Nodes:</span>
                    <span className="text-emerald-400 font-bold text-sm">{completedCount} / 1000</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-slate-400">Flawless Streak:</span>
                    <span className="text-amber-400 font-bold text-sm">{progress.streakDays} Days</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-slate-400">Daily Challenge Streak:</span>
                    <span className="text-amber-400 font-bold text-sm">{progress.dailyStreak || 0} Days</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-slate-400">Active Zone:</span>
                    <span className="text-cyan-300 font-bold text-sm">{activeZone.name}</span>
                  </div>
                </div>
              </div>

              {/* Reset Section */}
              <div className="pt-4 border-t border-white/10 space-y-3">
                {showResetConfirm ? (
                  <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/50 space-y-3">
                    <p className="text-xs text-rose-300 font-medium leading-relaxed">
                      Confirm reset of all 1,000 level progress & stats? This cannot be undone.
                    </p>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleConfirmReset}
                        className="py-2 px-4 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs cursor-pointer"
                      >
                        Yes, Reset
                      </button>
                      <button
                        onClick={() => setShowResetConfirm(false)}
                        className="py-2 px-4 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 text-xs cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowResetConfirm(true)}
                    className="flex items-center gap-2 text-xs text-rose-400/80 hover:text-rose-400 transition-colors cursor-pointer py-1"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reset Cognitive Save Data</span>
                  </button>
                )}

                {resetSuccess && (
                  <p className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                    <Check className="w-4 h-4" />
                    <span>Progress successfully reset to Level 1.</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sleek Minimalist Footer Ribbon (Hidden in Focus Mode) */}
      {!focusModeEnabled && (
        <footer className="pt-6 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2.5">
            <span className="text-slate-400 font-semibold">SYNAPSE</span>
            <span aria-hidden="true" className="text-slate-700">·</span>
            <span className="text-cyan-300 font-medium">Developed by Safayet</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-sans">
            <button
              onClick={() => {
                soundEngine.playClick();
                onOpenHowToPlay();
              }}
              className="text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
            >
              How to Play
            </button>
            <span aria-hidden="true" className="text-slate-700">·</span>
            <button
              onClick={() => {
                soundEngine.playClick();
                onOpenAbout();
              }}
              className="text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
            >
              About & Credits
            </button>
            <span aria-hidden="true" className="text-slate-700">·</span>
            <button
              onClick={() => {
                soundEngine.playClick();
                onOpenBlueprint();
              }}
              className="text-slate-400 hover:text-fuchsia-400 transition-colors cursor-pointer"
            >
              Architecture Spec
            </button>
          </div>
        </footer>
      )}
    </div>
  );
};
