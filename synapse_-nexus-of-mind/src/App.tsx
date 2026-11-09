/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { AppView, LevelData, UserProgress, PillarType } from './types/game';
import {
  generateLevelData,
  generatePillarLevelData,
  getZoneForLevel,
  getDailyChallengeData,
  getTodayDateString,
  getYesterdayDateString
} from './services/levelEngine';
import { soundEngine } from './services/soundEngine';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { LevelSelectorModal } from './components/LevelSelectorModal';
import { AboutModal } from './components/AboutModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { StreakMilestoneModal } from './components/StreakMilestoneModal';
import { BlueprintViewer } from './components/BlueprintViewer';
import { QuantumNexusGame } from './components/games/QuantumNexusGame';
import { MathLogicGridGame } from './components/games/MathLogicGridGame';
import { SynapticSequenceGame } from './components/games/SynapticSequenceGame';
import { CircuitNexusGame } from './components/games/CircuitNexusGame';
import { ZenResonatorGame } from './components/games/ZenResonatorGame';
import { ParticleCanvas } from './components/ParticleCanvas';
import {
  Sparkles,
  Flame,
  ArrowRight,
  RotateCcw,
  LayoutGrid,
  Volume2,
  VolumeX,
  Compass,
  CheckCircle,
  FileCode,
  Home,
  Play,
  BookOpen,
  Layers,
  HelpCircle,
  Maximize2,
  Minimize2
} from 'lucide-react';

const STORAGE_KEY = 'synapse_nexus_progress_v1';

const defaultProgress: UserProgress = {
  currentLevel: 1,
  highestUnlockedLevel: 1,
  completedLevels: {},
  mastery: {
    math: 15,
    memory: 12,
    puzzle: 10,
    logic: 18,
    relaxing: 25,
    quantum: 20
  },
  pillarTrainingLevels: {
    math: 1,
    memory: 1,
    puzzle: 1,
    logic: 1,
    relaxing: 1,
    quantum: 1
  },
  streakDays: 4,
  dailyStreak: 1,
  lastDailyCompletedDate: null,
  lastPlayedDate: new Date().toISOString(),
  soundEnabled: true,
  ambientZenEnabled: false,
  hapticsEnabled: true,
  masterVolume: 0.6
};

export default function App() {
  const [progress, setProgress] = useState<UserProgress>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return { ...defaultProgress, ...JSON.parse(saved) };
    } catch {
      // Fallback
    }
    return defaultProgress;
  });

  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [activeMode, setActiveMode] = useState<'campaign' | 'pillar' | 'daily'>('campaign');
  const [activePillar, setActivePillar] = useState<PillarType>('math');
  const [activeLevelNumber, setActiveLevelNumber] = useState<number>(() => progress.currentLevel || 1);
  const [isLevelSelectorOpen, setIsLevelSelectorOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
  const [levelCompleted, setLevelCompleted] = useState(false);
  const [triggerParticles, setTriggerParticles] = useState(false);
  const [particleColor, setParticleColor] = useState('#06B6D4');

  // Flawless Streak & Retry Lock state
  const [flawlessStreak, setFlawlessStreak] = useState<number>(0);
  const [hasMistakeInCurrentLevel, setHasMistakeInCurrentLevel] = useState<boolean>(false);
  const [streakMilestoneModal, setStreakMilestoneModal] = useState<{
    isOpen: boolean;
    streakCount: 5 | 10;
  }>({ isOpen: false, streakCount: 5 });

  // Focus Mode state (Fullscreen screen-filling immersion)
  const [isFocusMode, setIsFocusMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('synapse_focus_mode') === 'true';
    } catch {
      return false;
    }
  });

  const handleToggleFocusMode = useCallback(() => {
    soundEngine.playClick();
    setIsFocusMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('synapse_focus_mode', String(next));
      } catch {
        // Fallback
      }
      return next;
    });
  }, []);

  // Save progress changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // Local storage full or unavailable
    }
  }, [progress]);

  // Check Daily Streak reset if player missed yesterday's challenge
  useEffect(() => {
    const today = getTodayDateString();
    const yesterday = getYesterdayDateString();
    if (
      progress.lastDailyCompletedDate &&
      progress.lastDailyCompletedDate !== today &&
      progress.lastDailyCompletedDate !== yesterday
    ) {
      if (progress.dailyStreak > 0) {
        setProgress((prev) => ({ ...prev, dailyStreak: 0 }));
      }
    }
  }, [progress.lastDailyCompletedDate, progress.dailyStreak]);

  // Daily Challenge data
  const dailyChallengeData = getDailyChallengeData();

  // Current level data (campaign vs independent pillar training vs daily challenge)
  const activePillarTrainingLevel = progress.pillarTrainingLevels?.[activePillar] || 1;

  const currentLevelData: LevelData =
    activeMode === 'daily'
      ? dailyChallengeData.levelData
      : activeMode === 'pillar'
      ? generatePillarLevelData(activePillar, activePillarTrainingLevel)
      : generateLevelData(activeLevelNumber);

  // Handle mistake during level execution
  const handleLevelMistake = useCallback(() => {
    setHasMistakeInCurrentLevel(true);
    setFlawlessStreak(0);
  }, []);

  // Handle level completion
  const handleLevelSuccess = useCallback(() => {
    setLevelCompleted(true);
    setTriggerParticles(true);

    // Color based on pillar
    const colorMap: Record<PillarType, string> = {
      math: '#F59E0B',
      memory: '#06B6D4',
      logic: '#EC4899',
      puzzle: '#10B981',
      relaxing: '#8B5CF6',
      quantum: '#A855F7'
    };
    setParticleColor(colorMap[currentLevelData.pillar] || '#06B6D4');

    // Update streak tracking
    setFlawlessStreak((prev) => {
      if (hasMistakeInCurrentLevel) {
        return 0;
      }
      const newStreak = prev + 1;
      if (newStreak === 5) {
        setStreakMilestoneModal({ isOpen: true, streakCount: 5 });
      } else if (newStreak === 10) {
        setStreakMilestoneModal({ isOpen: true, streakCount: 10 });
      }
      return newStreak;
    });

    if (activeMode === 'daily') {
      // Daily challenge completion logic
      setProgress((prev) => {
        const todayStr = getTodayDateString();
        const yesterdayStr = getYesterdayDateString();
        const isAlreadyCompletedToday = prev.lastDailyCompletedDate === todayStr;

        let nextDailyStreak = prev.dailyStreak || 0;
        if (!isAlreadyCompletedToday) {
          if (prev.lastDailyCompletedDate === yesterdayStr || nextDailyStreak === 0) {
            nextDailyStreak += 1;
          } else {
            nextDailyStreak = 1;
          }
        }

        const updatedMastery = { ...prev.mastery };
        const currentPillar = currentLevelData.pillar;
        updatedMastery[currentPillar] = Math.min(100, (updatedMastery[currentPillar] || 0) + 5);

        const updatedHistory = { ...(prev.dailyHistory || {}) };
        updatedHistory[todayStr] = {
          pillar: currentPillar,
          score: hasMistakeInCurrentLevel ? 85 : 98,
          completed: true,
          difficultyRating: currentLevelData.difficultyRating,
          completedAt: new Date().toISOString()
        };

        return {
          ...prev,
          dailyStreak: nextDailyStreak,
          lastDailyCompletedDate: todayStr,
          dailyHistory: updatedHistory,
          mastery: updatedMastery
        };
      });
    } else if (activeMode === 'pillar') {
      // Free play mode: increment pillar training level independently without affecting main campaign level
      setProgress((prev) => {
        const currentPillarLevels = prev.pillarTrainingLevels || {
          math: 1,
          memory: 1,
          puzzle: 1,
          logic: 1,
          relaxing: 1,
          quantum: 1
        };
        const currentPillarLvl = currentPillarLevels[activePillar] || 1;
        const updatedPillarLevels = {
          ...currentPillarLevels,
          [activePillar]: currentPillarLvl + 1
        };

        const updatedMastery = { ...prev.mastery };
        updatedMastery[activePillar] = Math.min(100, (updatedMastery[activePillar] || 0) + 4);

        return {
          ...prev,
          pillarTrainingLevels: updatedPillarLevels,
          mastery: updatedMastery
        };
      });
    } else {
      // Main campaign level completion
      setProgress((prev) => {
        const nextUnlocked = Math.max(prev.highestUnlockedLevel, activeLevelNumber + 1);
        const updatedMastery = { ...prev.mastery };
        const currentPillar = currentLevelData.pillar;
        updatedMastery[currentPillar] = Math.min(100, (updatedMastery[currentPillar] || 0) + 3);

        return {
          ...prev,
          highestUnlockedLevel: nextUnlocked,
          completedLevels: {
            ...prev.completedLevels,
            [activeLevelNumber]: {
              stars: 3,
              bestTimeSeconds: 42,
              completedAt: new Date().toISOString()
            }
          },
          mastery: updatedMastery
        };
      });
    }
  }, [activeLevelNumber, currentLevelData.pillar, hasMistakeInCurrentLevel, activeMode, activePillar]);

  // Advance to next level
  const handleNextLevel = () => {
    soundEngine.playClick();
    setLevelCompleted(false);
    setHasMistakeInCurrentLevel(false);
    setTriggerParticles(false);

    if (activeMode === 'campaign') {
      const nextLevel = Math.min(1000, activeLevelNumber + 1);
      setActiveLevelNumber(nextLevel);
      setProgress((prev) => ({ ...prev, currentLevel: nextLevel }));
    }
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isHowToPlayOpen) {
          setIsHowToPlayOpen(false);
        } else if (isAboutModalOpen) {
          setIsAboutModalOpen(false);
        } else if (isLevelSelectorOpen) {
          setIsLevelSelectorOpen(false);
        } else if (currentView === 'play') {
          setCurrentView('dashboard');
        }
      } else if (e.key === '?' || e.key === 'h' || e.key === 'H') {
        // Toggle How to Play if not typing in an input
        const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
        if (tag !== 'input' && tag !== 'textarea') {
          setIsHowToPlayOpen((prev) => !prev);
        }
      } else if ((e.key === 'f' || e.key === 'F') && !e.ctrlKey && !e.metaKey && !e.altKey) {
        // Toggle Focus Mode if not typing in an input
        const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
        if (tag !== 'input' && tag !== 'textarea') {
          handleToggleFocusMode();
        }
      } else if (e.key === ' ' && levelCompleted) {
        e.preventDefault();
        handleNextLevel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isHowToPlayOpen, isAboutModalOpen, isLevelSelectorOpen, currentView, levelCompleted, activeLevelNumber, handleToggleFocusMode]);

  const handleResetProgress = () => {
    setProgress(defaultProgress);
    setActiveLevelNumber(1);
    setLevelCompleted(false);
    localStorage.removeItem(STORAGE_KEY);
  };

  // Toggle master sound
  const handleToggleSound = () => {
    const nextState = !progress.soundEnabled;
    soundEngine.setVolume(nextState ? 0.6 : 0);
    setProgress((p) => ({ ...p, soundEnabled: nextState }));
    if (nextState) soundEngine.playClick();
  };

  // Toggle ambient zen drone
  const handleToggleAmbient = () => {
    const nextState = !progress.ambientZenEnabled;
    soundEngine.toggleAmbient(nextState);
    setProgress((p) => ({ ...p, ambientZenEnabled: nextState }));
  };

  // Daily Challenge launcher helper
  const handleLaunchDaily = () => {
    soundEngine.playClick();
    setActiveMode('daily');
    setLevelCompleted(false);
    setHasMistakeInCurrentLevel(false);
    setCurrentView('play');
  };

  // Pillar launcher helper for Independent Pillar Training
  const handleLaunchPillar = (pillar: PillarType) => {
    soundEngine.playClick();
    setActiveMode('pillar');
    setActivePillar(pillar);
    setLevelCompleted(false);
    setHasMistakeInCurrentLevel(false);
    setCurrentView('play');
  };

  const currentZone = getZoneForLevel(activeLevelNumber);

  return (
    <div className="min-h-screen bg-[#020408] text-slate-100 flex flex-col font-sans relative selection:bg-cyan-500/30 selection:text-white">
      {/* Celebration Particle Canvas */}
      <ParticleCanvas
        triggerBurst={triggerParticles}
        color={particleColor}
        onComplete={() => setTriggerParticles(false)}
      />

      {/* Navigation Header */}
      <Header
        currentView={currentView}
        onNavigate={(v) => {
          if (v === 'levels') {
            setIsLevelSelectorOpen(true);
          } else {
            setCurrentView(v);
            setLevelCompleted(false);
          }
        }}
        soundEnabled={progress.soundEnabled}
        onToggleSound={handleToggleSound}
        ambientZenEnabled={progress.ambientZenEnabled}
        onToggleAmbient={handleToggleAmbient}
        activeLevelNumber={activeLevelNumber}
        onOpenAbout={() => setIsAboutModalOpen(true)}
        onOpenHowToPlay={() => setIsHowToPlayOpen(true)}
        focusModeEnabled={isFocusMode}
        onToggleFocusMode={handleToggleFocusMode}
      />

      {/* Main View Container */}
      <main className={`flex-1 flex flex-col ${isFocusMode ? 'pb-0' : 'pb-24 md:pb-12'}`}>
        {/* VIEW 1: DASHBOARD */}
        {currentView === 'dashboard' && (
          <Dashboard
            progress={progress}
            onPlayLevel={(num) => {
              setActiveMode('campaign');
              setActiveLevelNumber(num);
              setLevelCompleted(false);
              setHasMistakeInCurrentLevel(false);
              setCurrentView('play');
            }}
            onPlayPillar={handleLaunchPillar}
            onPlayDaily={handleLaunchDaily}
            onOpenLevelSelector={() => setIsLevelSelectorOpen(true)}
            onOpenBlueprint={() => setCurrentView('blueprint')}
            onOpenAbout={() => setIsAboutModalOpen(true)}
            onOpenHowToPlay={() => setIsHowToPlayOpen(true)}
            onUpdateProgress={setProgress}
            onResetProgress={handleResetProgress}
            focusModeEnabled={isFocusMode}
          />
        )}

        {/* VIEW 2: ACTIVE PLAY ARENA */}
        {currentView === 'play' && (
          <div className={`flex-1 flex flex-col items-center justify-center px-4 ${isFocusMode ? 'py-2 sm:py-3 max-w-5xl' : 'py-6 max-w-4xl'} w-full mx-auto`}>
            {/* Level HUD Bar */}
            <div className="w-full flex items-center justify-between mb-4 glass-card p-4 rounded-2xl border border-white/10">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    soundEngine.playClick();
                    setCurrentView('dashboard');
                  }}
                  className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1"
                >
                  ← Hub
                </button>
                <span className="text-slate-600">·</span>
                <div>
                  {activeMode === 'daily' ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wide">
                        Daily Challenge
                      </span>
                      <span className="text-xs text-slate-300 font-mono hidden sm:inline">
                        ({dailyChallengeData.formattedDate})
                      </span>
                    </div>
                  ) : activeMode === 'pillar' ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-fuchsia-400 font-bold uppercase tracking-wide">
                        {activePillar} Free Play
                      </span>
                      <span className="text-xs text-slate-300 font-mono">
                        (Training #{activePillarTrainingLevel})
                      </span>
                    </div>
                  ) : (
                    <div>
                      <span className="text-xs font-mono text-cyan-400 font-bold">
                        LEVEL {activeLevelNumber}
                      </span>
                      <span className="text-xs text-slate-400 ml-2 hidden sm:inline">
                        ({currentZone.name} Zone)
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                {flawlessStreak > 0 && (
                  <span className="text-xs font-mono text-amber-400 font-bold flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full animate-pulse">
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    <span>Streak: {flawlessStreak}</span>
                  </span>
                )}
                <span className="text-xs font-mono text-slate-400 hidden sm:inline">
                  Difficulty: {currentLevelData.difficultyRating} / 10
                </span>
                {activeMode === 'campaign' ? (
                  <button
                    onClick={() => setIsLevelSelectorOpen(true)}
                    className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>Levels</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      setActiveMode('campaign');
                    }}
                    className="text-xs text-fuchsia-400 hover:underline flex items-center gap-1"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Campaign</span>
                  </button>
                )}
              </div>
            </div>

            {/* Victory Overlay if Completed */}
            {levelCompleted ? (
              <div className="glass-panel p-8 md:p-12 rounded-3xl border border-emerald-500/40 glow-emerald flex flex-col items-center text-center space-y-6 max-w-md w-full animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.5)]">
                  <CheckCircle className="w-8 h-8" />
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-mono uppercase tracking-widest text-emerald-400">
                    Synaptic Synthesis Achieved
                  </span>
                  <h2 className="text-2xl font-bold text-white">
                    {activeMode === 'daily'
                      ? `Daily Challenge Mastered!`
                      : activeMode === 'pillar'
                      ? `${activePillar.toUpperCase()} Training #${activePillarTrainingLevel - 1} Mastered`
                      : `Level ${activeLevelNumber} Mastered`}
                  </h2>
                  <p className="text-xs text-slate-300">
                    {activeMode === 'daily'
                      ? `Your ${progress.dailyStreak || 1}-day streak is secured! Bonus pillar mastery awarded.`
                      : activeMode === 'pillar'
                      ? 'Free play training round complete. Pillar difficulty Rating increased for the next trial!'
                      : 'Neural equilibrium sustained. Cognitive mastery index increased.'}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
                  <button
                    onClick={() => {
                      if (activeMode === 'daily') {
                        soundEngine.playClick();
                        setCurrentView('dashboard');
                      } else {
                        handleNextLevel();
                      }
                    }}
                    className="w-full py-3 px-5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg shadow-emerald-400/25"
                  >
                    <span>
                      {activeMode === 'daily'
                        ? 'Return to Dashboard'
                        : activeMode === 'pillar'
                        ? `Proceed to Training #${activePillarTrainingLevel}`
                        : `Proceed to #${activeLevelNumber + 1}`}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      setLevelCompleted(false);
                      setHasMistakeInCurrentLevel(false);
                    }}
                    className="w-full sm:w-auto py-3 px-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs text-slate-300 transition-colors"
                  >
                    Replay
                  </button>
                </div>
              </div>
            ) : (
              /* Puzzle Game Switcher */
              <div className="w-full flex justify-center">
                {currentLevelData.pillar === 'quantum' && (
                  <QuantumNexusGame
                    key={`${activeMode}-${currentLevelData.pillar}-${currentLevelData.levelNumber}`}
                    level={currentLevelData}
                    onSuccess={handleLevelSuccess}
                    onMistake={handleLevelMistake}
                  />
                )}

                {(currentLevelData.pillar === 'math' || currentLevelData.pillar === 'logic') && (
                  <MathLogicGridGame
                    key={`${activeMode}-${currentLevelData.pillar}-${currentLevelData.levelNumber}`}
                    level={currentLevelData}
                    onSuccess={handleLevelSuccess}
                    onMistake={handleLevelMistake}
                  />
                )}

                {currentLevelData.pillar === 'memory' && (
                  <SynapticSequenceGame
                    key={`${activeMode}-${currentLevelData.pillar}-${currentLevelData.levelNumber}`}
                    level={currentLevelData}
                    onSuccess={handleLevelSuccess}
                    onMistake={handleLevelMistake}
                  />
                )}

                {currentLevelData.pillar === 'puzzle' && (
                  <CircuitNexusGame
                    key={`${activeMode}-${currentLevelData.pillar}-${currentLevelData.levelNumber}`}
                    level={currentLevelData}
                    onSuccess={handleLevelSuccess}
                  />
                )}

                {currentLevelData.pillar === 'relaxing' && (
                  <ZenResonatorGame
                    key={`${activeMode}-${currentLevelData.pillar}-${currentLevelData.levelNumber}`}
                    level={currentLevelData}
                    onSuccess={handleLevelSuccess}
                  />
                )}
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: GDD & ARCHITECTURAL BLUEPRINT */}
        {currentView === 'blueprint' && <BlueprintViewer />}
      </main>

      {/* Desktop Keyboard Helper Ribbon (Hidden on Touch/Mobile and in Focus Mode) */}
      {!isFocusMode && (
        <aside aria-label="Desktop Keyboard Shortcuts" className="hidden lg:flex fixed bottom-3 left-6 z-40 items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#070b14]/85 backdrop-blur-md border border-white/10 text-[11px] font-mono text-slate-400 shadow-xl pointer-events-none">
          <span className="text-cyan-400 font-semibold">Controls:</span>
          <span className="bg-white/10 text-slate-200 px-1.5 py-0.5 rounded text-[10px]">[Space]</span> Next
          <span className="text-slate-600">·</span>
          <span className="bg-white/10 text-slate-200 px-1.5 py-0.5 rounded text-[10px]">[Esc]</span> Hub
          <span className="text-slate-600">·</span>
          <span className="bg-white/10 text-slate-200 px-1.5 py-0.5 rounded text-[10px]">[F]</span> Focus
          <span className="text-slate-600">·</span>
          <span className="bg-white/10 text-slate-200 px-1.5 py-0.5 rounded text-[10px]">[?]</span> Rules
          <span className="text-slate-600">·</span>
          <span className="bg-white/10 text-slate-200 px-1.5 py-0.5 rounded text-[10px]">[1-9]</span> Keypad
          <span className="text-slate-600">·</span>
          <span className="bg-white/10 text-slate-200 px-1.5 py-0.5 rounded text-[10px]">[⌫]</span> Clear
        </aside>
      )}

      {/* Floating Focus Mode Exit Pill (Visible during active gameplay in Focus Mode) */}
      {isFocusMode && currentView === 'play' && (
        <aside aria-label="Focus Mode Controls" className="fixed bottom-3 right-4 z-40 animate-in fade-in zoom-in duration-300">
          <button
            onClick={handleToggleFocusMode}
            className="px-3.5 py-1.5 rounded-full bg-[#070b14]/90 backdrop-blur-md border border-cyan-500/40 text-[11px] font-mono text-cyan-300 hover:text-white hover:border-cyan-400 hover:bg-cyan-950/50 flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.25)] transition-all active:scale-95"
            title="Exit Focus Mode [F]"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span>Exit Focus Mode [F]</span>
          </button>
        </aside>
      )}

      {/* Mobile Touch-First Fixed Bottom Navigation Bar (Hidden in Focus Mode for Screen-Filling Immersion) */}
      {!isFocusMode && (
        <nav aria-label="Mobile Navigation" className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#070b14]/95 backdrop-blur-xl border-t border-white/10 pb-safe shadow-[0_-8px_30px_rgba(0,0,0,0.85)]">
          <div className="grid grid-cols-4 items-center h-16 sm:h-18 px-3 gap-1">
            {/* Destination 1: Dashboard */}
            <button
              onClick={() => {
                soundEngine.playClick();
                setCurrentView('dashboard');
                setLevelCompleted(false);
              }}
              className={`min-h-[50px] py-1.5 px-2 rounded-xl flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${
                currentView === 'dashboard'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              <Home className="w-5 h-5 text-cyan-400" />
              <span className="text-[11px] font-semibold tracking-tight">Hub</span>
            </button>

            {/* Destination 2: Play Active Level */}
            <button
              onClick={() => {
                soundEngine.playClick();
                setCurrentView('play');
                setLevelCompleted(false);
              }}
              className={`min-h-[50px] py-1.5 px-2 rounded-xl flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${
                currentView === 'play'
                  ? 'bg-cyan-400 text-slate-950 font-bold shadow-[0_0_15px_rgba(34,211,238,0.4)]'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              <div className="relative">
                <Play className={`w-5 h-5 ${currentView === 'play' ? 'fill-slate-950' : 'fill-current'}`} />
                <span className="absolute -top-1.5 -right-3 text-[9px] font-mono px-1 rounded-full bg-cyan-500 text-slate-950 font-bold">
                  {activeLevelNumber}
                </span>
              </div>
              <span className="text-[11px] font-semibold tracking-tight">Play</span>
            </button>

            {/* Destination 3: 1,000 Levels Matrix */}
            <button
              onClick={() => {
                soundEngine.playClick();
                setIsLevelSelectorOpen(true);
              }}
              className="min-h-[50px] py-1.5 px-2 rounded-xl flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-white active:scale-95 transition-all border border-transparent hover:bg-white/5"
            >
              <LayoutGrid className="w-5 h-5" />
              <span className="text-[11px] font-semibold tracking-tight">1,000 Nodes</span>
            </button>

            {/* Destination 4: Rules & GDD */}
            <button
              onClick={() => {
                soundEngine.playClick();
                setIsHowToPlayOpen(true);
              }}
              className="min-h-[50px] py-1.5 px-2 rounded-xl flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-cyan-300 active:scale-95 transition-all border border-transparent hover:bg-white/5"
            >
              <BookOpen className="w-5 h-5" />
              <span className="text-[11px] font-semibold tracking-tight">Guide</span>
            </button>
          </div>
        </nav>
      )}

      {/* 1,000-Level Selector Modal */}
      <LevelSelectorModal
        isOpen={isLevelSelectorOpen}
        onClose={() => setIsLevelSelectorOpen(false)}
        progress={progress}
        onSelectLevel={(num) => {
          setActiveLevelNumber(num);
          setLevelCompleted(false);
          setCurrentView('play');
        }}
      />

      {/* Sleek About & Credits Settings Modal */}
      <AboutModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
        progress={progress}
        onUpdateProgress={setProgress}
        onResetProgress={handleResetProgress}
        onOpenHowToPlay={() => {
          setIsAboutModalOpen(false);
          setIsHowToPlayOpen(true);
        }}
      />

      {/* Sleek How to Play & Rules Guide Modal */}
      <HowToPlayModal
        isOpen={isHowToPlayOpen}
        onClose={() => setIsHowToPlayOpen(false)}
        onStartPlaying={() => {
          setIsHowToPlayOpen(false);
          setCurrentView('play');
        }}
      />

      {/* Streak Milestone Celebration Modal (5-Streak & 10-Streak) */}
      <StreakMilestoneModal
        isOpen={streakMilestoneModal.isOpen}
        onClose={() => setStreakMilestoneModal((prev) => ({ ...prev, isOpen: false }))}
        streakCount={streakMilestoneModal.streakCount}
        onProceed={handleNextLevel}
      />
    </div>
  );
}
