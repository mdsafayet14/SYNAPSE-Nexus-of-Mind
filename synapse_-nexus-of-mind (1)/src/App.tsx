/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { SynapseProgress } from './types/synapse';
import { getBandForLevel } from './services/thousandLevelEngine';
import { soundEngine } from './services/soundEngine';
import { CompactDashboard } from './components/CompactDashboard';
import { LevelArena } from './components/LevelArena';
import { ThousandLevelModal } from './components/ThousandLevelModal';
import { SettingsCreditsModal } from './components/SettingsCreditsModal';
import { ParticleCanvas } from './components/ParticleCanvas';
import { Volume2, VolumeX, LayoutGrid, Settings } from 'lucide-react';

const STORAGE_KEY = 'synapse_thousand_levels_v3';

const DEFAULT_PROGRESS: SynapseProgress = {
  currentLevel: 1,
  highestUnlockedLevel: 1,
  clearedLevels: {},
  totalTargetsSolved: 0,
  soundEnabled: true,
  hapticsEnabled: true,
  masterVolume: 0.55
};

export default function App() {
  const [progress, setProgress] = useState<SynapseProgress>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_PROGRESS, ...JSON.parse(saved) };
      }
    } catch {
      // Fallback to default
    }
    return DEFAULT_PROGRESS;
  });

  const [view, setView] = useState<'dashboard' | 'play'>('dashboard');
  const [activeLevelNumber, setActiveLevelNumber] = useState<number>(() =>
    Math.min(progress.currentLevel, progress.highestUnlockedLevel)
  );
  const [isLevelGridOpen, setIsLevelGridOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [triggerParticles, setTriggerParticles] = useState(false);
  const [particleColor, setParticleColor] = useState('#38BDF8');

  // Sync Web Audio volume
  useEffect(() => {
    soundEngine.setVolume(progress.soundEnabled ? progress.masterVolume : 0);
  }, [progress.soundEnabled, progress.masterVolume]);

  // Persist progress
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // Ignore storage errors
    }
  }, [progress]);

  const handleToggleSound = useCallback(() => {
    setProgress((prev) => {
      const nextSound = !prev.soundEnabled;
      soundEngine.setVolume(nextSound ? prev.masterVolume : 0);
      if (nextSound) soundEngine.playClick();
      return { ...prev, soundEnabled: nextSound };
    });
  }, []);

  const handleLaunchLevel = useCallback(
    (levelNum: number) => {
      const bounded = Math.max(1, Math.min(progress.highestUnlockedLevel, levelNum));
      setActiveLevelNumber(bounded);
      setProgress((prev) => ({ ...prev, currentLevel: bounded }));
      setView('play');
    },
    [progress.highestUnlockedLevel]
  );

  const handleLevelCleared = useCallback(
    (levelNum: number, correctCount: number, wrongCount: number) => {
      const band = getBandForLevel(levelNum);
      setParticleColor(band.accentColor);
      setTriggerParticles(true);

      setProgress((prev) => {
        const prevRecord = prev.clearedLevels[levelNum];
        const nextUnlocked = Math.min(
          1000,
          Math.max(prev.highestUnlockedLevel, levelNum + 1)
        );
        const nextCurrent = Math.min(1000, Math.max(prev.currentLevel, nextUnlocked));

        return {
          ...prev,
          currentLevel: nextCurrent,
          highestUnlockedLevel: nextUnlocked,
          totalTargetsSolved: prev.totalTargetsSolved + correctCount,
          clearedLevels: {
            ...prev.clearedLevels,
            [levelNum]: {
              bestCorrect: prevRecord
                ? Math.max(prevRecord.bestCorrect, correctCount)
                : correctCount,
              fewestWrong: prevRecord
                ? Math.min(prevRecord.fewestWrong, wrongCount)
                : wrongCount,
              clearedAt: new Date().toISOString()
            }
          }
        };
      });
    },
    []
  );

  const handleAdvanceLevel = useCallback((nextLevel: number) => {
    const bounded = Math.max(1, Math.min(1000, nextLevel));
    setActiveLevelNumber(bounded);
    setProgress((prev) => ({ ...prev, currentLevel: bounded }));
  }, []);

  const handleResetProgress = useCallback(() => {
    setProgress((prev) => ({
      ...DEFAULT_PROGRESS,
      soundEnabled: prev.soundEnabled,
      hapticsEnabled: prev.hapticsEnabled,
      masterVolume: prev.masterVolume
    }));
    setActiveLevelNumber(1);
    setView('dashboard');
  }, []);

  return (
    <div className="h-dvh w-full overflow-hidden bg-[#03060c] text-slate-100 flex flex-col font-sans relative selection:bg-cyan-500/30 selection:text-white">
      {/* Subtle Ambient Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(6,182,212,0.09),transparent_55%)]"
      />

      {/* Victory Particle Canvas */}
      <ParticleCanvas
        triggerBurst={triggerParticles}
        color={particleColor}
        onComplete={() => setTriggerParticles(false)}
      />

      {/* Compact Top Bar */}
      <header className="h-14 shrink-0 border-b border-white/[0.06] bg-[#03060c]/90 backdrop-blur-xl relative z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between gap-4">
          {/* Brand Wordmark */}
          <button
            onClick={() => {
              soundEngine.playClick();
              setView('dashboard');
            }}
            className="text-base sm:text-lg font-extrabold tracking-tight text-white whitespace-nowrap shrink-0 flex items-center gap-2 hover:opacity-90 transition-opacity cursor-pointer"
          >
            <span>SYNAPSE</span>
            <span className="hidden sm:inline text-xs font-mono font-normal text-slate-400">
              Nexus of Mind
            </span>
          </button>

          {/* Top-Right Controls: Audio, 1000 Levels, Settings/Credits */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleToggleSound}
              aria-label={progress.soundEnabled ? 'Mute sound' : 'Unmute sound'}
              title={progress.soundEnabled ? 'Mute sound' : 'Unmute sound'}
              className="min-h-[38px] min-w-[38px] p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/[0.08] text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              {progress.soundEnabled ? (
                <Volume2 className="w-4 h-4 text-cyan-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-500" />
              )}
            </button>

            <button
              onClick={() => {
                soundEngine.playClick();
                setIsLevelGridOpen(true);
              }}
              aria-label="Browse 1,000 levels"
              className="min-h-[38px] px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/[0.08] text-xs font-medium text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
            >
              <LayoutGrid className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">Levels</span>
            </button>

            <button
              onClick={() => {
                soundEngine.playClick();
                setIsSettingsOpen(true);
              }}
              aria-label="Settings and Credits"
              className="min-h-[38px] px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/[0.08] text-xs font-medium text-slate-200 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Settings className="w-4 h-4 text-slate-300" />
              <span className="hidden sm:inline">Settings & Credits</span>
            </button>
          </div>
        </div>
      </header>

      {/* Scroll-Free Main Viewport */}
      <main className="flex-1 min-h-0 overflow-hidden relative z-10">
        {view === 'dashboard' ? (
          <CompactDashboard
            progress={progress}
            onPlayLevel={handleLaunchLevel}
            onOpenLevelGrid={() => setIsLevelGridOpen(true)}
          />
        ) : (
          <LevelArena
            key={activeLevelNumber}
            levelNumber={activeLevelNumber}
            hapticsEnabled={progress.hapticsEnabled}
            onLevelCleared={handleLevelCleared}
            onAdvanceLevel={handleAdvanceLevel}
            onReturnHub={() => setView('dashboard')}
          />
        )}
      </main>

      {/* 1,000-Level Selector Modal */}
      <ThousandLevelModal
        isOpen={isLevelGridOpen}
        onClose={() => setIsLevelGridOpen(false)}
        progress={progress}
        onSelectLevel={handleLaunchLevel}
      />

      {/* Top-Right Settings & Credits Modal ("Developed by Shafayet") */}
      <SettingsCreditsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        progress={progress}
        onUpdateProgress={setProgress}
        onResetProgress={handleResetProgress}
      />
    </div>
  );
}
