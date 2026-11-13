/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppView } from '../types/game';
import { soundEngine } from '../services/soundEngine';
import {
  Gamepad2,
  Puzzle,
  BarChart3,
  Settings,
  Play,
  Volume2,
  VolumeX,
  Wind,
  HelpCircle,
  Maximize2,
  Minimize2,
  Sparkles
} from 'lucide-react';
import { DashboardTab } from './Dashboard';

interface HeaderProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  activeTab: DashboardTab;
  onSelectTab: (tab: DashboardTab) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  ambientZenEnabled: boolean;
  onToggleAmbient: () => void;
  activeLevelNumber: number;
  onOpenAbout: () => void;
  onOpenHowToPlay?: () => void;
  focusModeEnabled?: boolean;
  onToggleFocusMode?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  activeTab,
  onSelectTab,
  soundEnabled,
  onToggleSound,
  ambientZenEnabled,
  onToggleAmbient,
  activeLevelNumber,
  onOpenAbout,
  onOpenHowToPlay,
  focusModeEnabled = false,
  onToggleFocusMode
}) => {
  const handleTabClick = (tab: DashboardTab) => {
    soundEngine.playClick();
    onSelectTab(tab);
    if (currentView !== 'dashboard') {
      onNavigate('dashboard');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-white/[0.08] backdrop-blur-xl px-3 sm:px-6 py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-2.5 shrink-0">
      {/* Top Row on Mobile / Left Zone on Desktop: Brand & Quick Play */}
      <div className="flex items-center justify-between gap-3 shrink-0">
        <button
          onClick={() => {
            soundEngine.playClick();
            onSelectTab('dashboard');
            onNavigate('dashboard');
          }}
          className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2 hover:opacity-90 transition-opacity cursor-pointer shrink-0"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
          <span className="bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            SYNAPSE
          </span>
          <span className="text-[10px] font-mono text-cyan-400 hidden xl:inline px-1.5 py-0.5 rounded border border-cyan-500/30 bg-cyan-950/40">
            Nexus of Mind
          </span>
          {focusModeEnabled && (
            <span className="text-[9px] font-mono font-bold text-cyan-300 bg-cyan-500/20 border border-cyan-400/40 px-2 py-0.5 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.3)] animate-pulse flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              FOCUS
            </span>
          )}
        </button>

        {/* Mobile quick actions toolbar */}
        <div className="flex md:hidden items-center gap-1.5">
          <button
            onClick={() => {
              soundEngine.playClick();
              onNavigate('play');
            }}
            className={`min-h-[34px] px-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              currentView === 'play'
                ? 'bg-cyan-400 text-slate-950 shadow-[0_0_10px_rgba(34,211,238,0.4)]'
                : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>#{activeLevelNumber}</span>
          </button>

          {onToggleFocusMode && (
            <button
              onClick={onToggleFocusMode}
              aria-label={focusModeEnabled ? 'Exit Focus Mode' : 'Enter Focus Mode'}
              className={`min-h-[34px] min-w-[34px] p-1.5 rounded-lg border flex items-center justify-center ${
                focusModeEnabled
                  ? 'bg-cyan-500/25 text-cyan-300 border-cyan-400'
                  : 'bg-white/5 text-slate-400 border-white/10'
              }`}
            >
              {focusModeEnabled ? <Minimize2 className="w-3.5 h-3.5 text-cyan-300" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>

      {/* Unified Tab Navigation Bar (Single Sleek Top Bar) */}
      <nav
        aria-label="Unified Navigation"
        className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur-md overflow-x-auto no-scrollbar justify-start md:justify-center shrink-0"
      >
        <button
          onClick={() => handleTabClick('dashboard')}
          className={`min-h-[36px] px-3 sm:px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap active:scale-95 cursor-pointer ${
            currentView === 'dashboard' && activeTab === 'dashboard'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.3)] font-bold'
              : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          <Gamepad2 className="w-4 h-4 text-cyan-400" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => handleTabClick('pillars')}
          className={`min-h-[36px] px-3 sm:px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap active:scale-95 cursor-pointer ${
            currentView === 'dashboard' && activeTab === 'pillars'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.3)] font-bold'
              : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          <Puzzle className="w-4 h-4 text-amber-400" />
          <span>Cognitive Pillars</span>
        </button>

        <button
          onClick={() => handleTabClick('telemetry')}
          className={`min-h-[36px] px-3 sm:px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap active:scale-95 cursor-pointer ${
            currentView === 'dashboard' && activeTab === 'telemetry'
              ? 'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/40 shadow-[0_0_12px_rgba(217,70,239,0.3)] font-bold'
              : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-fuchsia-400" />
          <span>Telemetry & Stats</span>
        </button>

        <button
          onClick={() => handleTabClick('settings')}
          className={`min-h-[36px] px-3 sm:px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap active:scale-95 cursor-pointer ${
            currentView === 'dashboard' && activeTab === 'settings'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.3)] font-bold'
              : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          <Settings className="w-4 h-4 text-emerald-400" />
          <span>Settings</span>
        </button>
      </nav>

      {/* Right Zone on Desktop: Play Action, Focus Mode, Audio, Help */}
      <div className="hidden md:flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Play Level Shortcut Button */}
        <button
          onClick={() => {
            soundEngine.playClick();
            onNavigate('play');
          }}
          className={`min-h-[38px] px-3.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 active:scale-95 cursor-pointer ${
            currentView === 'play'
              ? 'bg-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(34,211,238,0.4)]'
              : 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/25'
          }`}
          title={`Play Active Level #${activeLevelNumber}`}
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Play #{activeLevelNumber}</span>
        </button>

        {/* Focus Mode Toggle Button */}
        {onToggleFocusMode && (
          <button
            onClick={onToggleFocusMode}
            title={focusModeEnabled ? 'Exit Focus Mode [F]' : 'Enter Focus Mode [F]'}
            aria-label={focusModeEnabled ? 'Exit Focus Mode' : 'Enter Focus Mode'}
            className={`min-h-[38px] min-w-[38px] p-2 rounded-xl transition-all border flex items-center justify-center active:scale-95 cursor-pointer ${
              focusModeEnabled
                ? 'bg-cyan-500/25 text-cyan-300 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                : 'bg-white/5 text-slate-400 border-white/10 hover:text-white hover:bg-white/10'
            }`}
          >
            {focusModeEnabled ? (
              <Minimize2 className="w-4 h-4 text-cyan-300" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        )}

        {/* Ambient Zen Wave Toggle */}
        <button
          onClick={onToggleAmbient}
          title={ambientZenEnabled ? 'Disable Ambient Drone' : 'Enable Ambient 4Hz Drone'}
          aria-label={ambientZenEnabled ? 'Disable Ambient Drone' : 'Enable Ambient 4Hz Drone'}
          className={`min-h-[38px] min-w-[38px] p-2 rounded-xl transition-all border flex items-center justify-center active:scale-95 cursor-pointer ${
            ambientZenEnabled
              ? 'bg-violet-500/20 text-violet-300 border-violet-500/40 shadow-[0_0_10px_rgba(139,92,246,0.3)]'
              : 'bg-white/5 text-slate-400 border-white/10 hover:text-white hover:bg-white/10'
          }`}
        >
          <Wind className="w-4 h-4" />
        </button>

        {/* Master Sound FX Toggle */}
        <button
          onClick={onToggleSound}
          title={soundEnabled ? 'Mute Sound FX' : 'Unmute Sound FX'}
          aria-label={soundEnabled ? 'Mute Sound FX' : 'Unmute Sound FX'}
          className={`min-h-[38px] min-w-[38px] p-2 rounded-xl transition-all border flex items-center justify-center active:scale-95 cursor-pointer ${
            soundEnabled
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.25)]'
              : 'bg-white/5 text-slate-400 border-white/10 hover:text-white hover:bg-white/10'
          }`}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* How to Play / Rules Trigger */}
        <button
          onClick={() => {
            soundEngine.playClick();
            onOpenHowToPlay?.();
          }}
          title="How to Play & Rules"
          aria-label="How to Play & Rules"
          className="min-h-[38px] min-w-[38px] p-2 rounded-xl transition-all border bg-white/5 text-slate-300 border-white/10 hover:text-cyan-300 hover:bg-cyan-950/30 hover:border-cyan-500/40 active:scale-95 flex items-center justify-center cursor-pointer"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
