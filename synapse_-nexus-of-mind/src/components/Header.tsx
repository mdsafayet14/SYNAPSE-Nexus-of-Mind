/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppView } from '../types/game';
import { soundEngine } from '../services/soundEngine';
import { Volume2, VolumeX, Sparkles, Wind, Settings, HelpCircle, Maximize2, Minimize2 } from 'lucide-react';

interface HeaderProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
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
  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-white/[0.08] px-4 md:px-8 py-3.5 flex items-center justify-between gap-4 md:gap-8 backdrop-blur-xl">
      {/* Zone 1: Single text wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={() => {
            soundEngine.playClick();
            onNavigate('dashboard');
          }}
          className="text-lg md:text-xl font-bold tracking-tight text-white flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
          <span className="bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            SYNAPSE
          </span>
          <span className="text-xs font-mono text-cyan-400 hidden sm:inline px-1.5 py-0.5 rounded border border-cyan-500/30 bg-cyan-950/40">
            Nexus of Mind
          </span>
          {focusModeEnabled && (
            <span className="text-[10px] font-mono font-bold text-cyan-300 bg-cyan-500/20 border border-cyan-400/40 px-2 py-0.5 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.3)] animate-pulse flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              FOCUS
            </span>
          )}
        </button>
      </div>

      {/* Zone 2: Navigation Links (Laptop/Desktop Viewport) */}
      <nav className="hidden md:flex items-center gap-2 lg:gap-4 text-sm font-medium">
        <button
          onClick={() => {
            soundEngine.playClick();
            onNavigate('dashboard');
          }}
          className={`px-3 py-2 rounded-xl whitespace-nowrap transition-colors ${
            currentView === 'dashboard'
              ? 'text-white bg-white/10 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Dashboard
        </button>

        <button
          onClick={() => {
            soundEngine.playClick();
            onNavigate('play');
          }}
          className={`px-3 py-2 rounded-xl whitespace-nowrap transition-colors ${
            currentView === 'play'
              ? 'text-cyan-300 bg-cyan-500/15 border border-cyan-500/30'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Play #{activeLevelNumber}
        </button>

        <button
          onClick={() => {
            soundEngine.playClick();
            onNavigate('levels');
          }}
          className={`px-3 py-2 rounded-xl whitespace-nowrap transition-colors ${
            currentView === 'levels'
              ? 'text-white bg-white/10'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          1,000 Levels
        </button>

        <button
          onClick={() => {
            soundEngine.playClick();
            onNavigate('blueprint');
          }}
          className={`px-3 py-2 rounded-xl whitespace-nowrap transition-colors ${
            currentView === 'blueprint'
              ? 'text-fuchsia-300 bg-fuchsia-500/15 border border-fuchsia-500/30'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Architecture Spec
        </button>

        <button
          onClick={() => {
            soundEngine.playClick();
            onOpenHowToPlay?.();
          }}
          className="px-3 py-2 rounded-xl whitespace-nowrap text-slate-400 hover:text-cyan-300 hover:bg-white/5 transition-colors"
        >
          Rules
        </button>
      </nav>

      {/* Zone 3: Audio & Mode Actions (Scalable Touch Hitboxes) */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Focus Mode Toggle Button */}
        {onToggleFocusMode && (
          <button
            onClick={onToggleFocusMode}
            title={focusModeEnabled ? 'Exit Focus Mode [F]' : 'Enter Focus Mode [F]'}
            aria-label={focusModeEnabled ? 'Exit Focus Mode' : 'Enter Focus Mode'}
            className={`min-h-[44px] min-w-[44px] p-2.5 rounded-xl transition-all border flex items-center justify-center active:scale-95 ${
              focusModeEnabled
                ? 'bg-cyan-500/25 text-cyan-300 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
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
          className={`min-h-[44px] min-w-[44px] p-2.5 rounded-xl transition-all border flex items-center justify-center active:scale-95 ${
            ambientZenEnabled
              ? 'bg-violet-500/20 text-violet-300 border-violet-500/40 shadow-[0_0_12px_rgba(139,92,246,0.3)]'
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
          className={`min-h-[44px] min-w-[44px] p-2.5 rounded-xl transition-all border flex items-center justify-center active:scale-95 ${
            soundEnabled
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
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
          className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl transition-all border bg-white/5 text-slate-300 border-white/10 hover:text-cyan-300 hover:bg-cyan-950/30 hover:border-cyan-500/40 active:scale-95 flex items-center justify-center"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Settings & Credits Modal Trigger */}
        <button
          onClick={() => {
            soundEngine.playClick();
            onOpenAbout();
          }}
          title="Settings & Credits"
          aria-label="Settings & Credits"
          className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl transition-all border bg-white/5 text-slate-300 border-white/10 hover:text-cyan-300 hover:bg-cyan-950/30 hover:border-cyan-500/40 hover:shadow-[0_0_12px_rgba(6,182,212,0.25)] active:scale-95 group flex items-center justify-center"
        >
          <Settings className="w-4 h-4 text-slate-300 group-hover:text-cyan-300 group-hover:rotate-45 transition-transform duration-300" />
        </button>
      </div>
    </header>
  );
};
