/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { LevelData } from '../../types/game';
import { soundEngine } from '../../services/soundEngine';
import { Puzzle, RotateCw, CheckCircle, Zap, RotateCcw } from 'lucide-react';

interface CircuitNexusGameProps {
  level: LevelData;
  onSuccess: () => void;
}

interface CircuitTile {
  id: number;
  // Type: 'straight' (0 deg: horizontal), 'corner' (0 deg: top-right), 't-junction', 'cross'
  type: 'straight' | 'corner' | 't-junction' | 'cross';
  rotation: number; // 0, 90, 180, 270 degrees
  targetRotation: number;
  fixed?: boolean;
}

export const CircuitNexusGame: React.FC<CircuitNexusGameProps> = ({ level, onSuccess }) => {
  const gridSize: number = level.config.gridSize || 3;
  const [tiles, setTiles] = useState<CircuitTile[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  // Initialize circuit based on level seed
  useEffect(() => {
    const seed = level.levelNumber;
    const isTwoByTwo = gridSize === 2;

    let initialTiles: CircuitTile[];

    if (isTwoByTwo) {
      // 2x2 layout: input top-left, goes across to top-right, turns down to bottom-right, exits OUT
      initialTiles = [
        { id: 0, type: 'straight', rotation: 0, targetRotation: 0 }, // enters from left, goes to right
        { id: 1, type: 'corner', rotation: 90, targetRotation: 90 }, // turns down
        { id: 2, type: 'straight', rotation: 0, targetRotation: 0 }, // decorative/parallel
        { id: 3, type: 'corner', rotation: 270, targetRotation: 270 } // turns out to right
      ];

      // For levels 1-20, only 1 rotation needed (rotate tile 1 or tile 3 by 90)
      const rotationsNeeded = level.config.rotationsRequired || 1;
      if (rotationsNeeded === 1) {
        initialTiles[1].rotation = (initialTiles[1].targetRotation + 90) % 360;
      } else {
        initialTiles[1].rotation = (initialTiles[1].targetRotation + 90) % 360;
        initialTiles[3].rotation = (initialTiles[3].targetRotation + 180) % 360;
      }
    } else {
      // Deterministic 3x3 circuit layout
      initialTiles = [
        { id: 0, type: 'corner', rotation: (seed * 90) % 360, targetRotation: 90 }, // input at left, goes down
        { id: 1, type: 'straight', rotation: (seed * 180) % 360, targetRotation: 0 },
        { id: 2, type: 'corner', rotation: (seed * 270) % 360, targetRotation: 180 },
        { id: 3, type: 'straight', rotation: ((seed + 1) * 90) % 360, targetRotation: 90 },
        { id: 4, type: 't-junction', rotation: ((seed + 2) * 90) % 360, targetRotation: 0 },
        { id: 5, type: 'straight', rotation: ((seed + 3) * 90) % 360, targetRotation: 90 },
        { id: 6, type: 'corner', rotation: ((seed + 4) * 90) % 360, targetRotation: 0 },
        { id: 7, type: 'straight', rotation: ((seed + 5) * 90) % 360, targetRotation: 0 },
        { id: 8, type: 'corner', rotation: ((seed + 6) * 90) % 360, targetRotation: 270 } // output to right
      ];

      // Ensure misaligned tiles according to rotationsRequired
      initialTiles.forEach((tile) => {
        if (tile.rotation === tile.targetRotation) {
          tile.rotation = (tile.rotation + 90) % 360;
        }
      });
    }

    setTiles(initialTiles);
    setIsCompleted(false);
  }, [level, gridSize]);

  const handleRotateTile = (tileId: number) => {
    if (isCompleted) return;
    soundEngine.playClick();
    soundEngine.triggerHaptic(15);

    setTiles((prev) => {
      const next = prev.map((t) => {
        if (t.id === tileId) {
          const newRot = (t.rotation + 90) % 360;
          return { ...t, rotation: newRot };
        }
        return t;
      });

      // Verify connection alignment
      const allAligned = next.every((t) => t.rotation === t.targetRotation);
      if (allAligned) {
        setIsCompleted(true);
        setTimeout(() => {
          soundEngine.playSuccess();
          onSuccess();
        }, 300);
      }
      return next;
    });
  };

  // Keyboard shortcut listener for laptop/desktop (keys 1-9 rotate corresponding tile)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isCompleted) return;
      const num = parseInt(e.key, 10);
      if (!isNaN(num) && num >= 1 && num <= tiles.length) {
        handleRotateTile(num - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tiles, isCompleted]);

  const renderPipeGraphic = (tile: CircuitTile) => {
    const isAligned = tile.rotation === tile.targetRotation;
    const color = isAligned ? '#10B981' : '#64748B';
    const glow = isAligned ? 'drop-shadow(0 0 6px rgba(16,185,129,0.7))' : 'none';

    return (
      <svg
        className="w-10 h-10 md:w-14 md:h-14 transition-transform duration-200"
        style={{ transform: `rotate(${tile.rotation}deg)`, filter: glow }}
        viewBox="0 0 100 100"
      >
        {tile.type === 'straight' && (
          <line x1="0" y1="50" x2="100" y2="50" stroke={color} strokeWidth="16" strokeLinecap="round" />
        )}
        {tile.type === 'corner' && (
          <path d="M 50 100 L 50 50 L 100 50" fill="none" stroke={color} strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
        )}
        {tile.type === 't-junction' && (
          <g>
            <line x1="0" y1="50" x2="100" y2="50" stroke={color} strokeWidth="16" strokeLinecap="round" />
            <line x1="50" y1="50" x2="50" y2="100" stroke={color} strokeWidth="16" strokeLinecap="round" />
          </g>
        )}
        {tile.type === 'cross' && (
          <g>
            <line x1="0" y1="50" x2="100" y2="50" stroke={color} strokeWidth="16" strokeLinecap="round" />
            <line x1="50" y1="0" x2="50" y2="100" stroke={color} strokeWidth="16" strokeLinecap="round" />
          </g>
        )}
        {/* Central quantum node indicator */}
        <circle cx="50" cy="50" r="8" fill={isAligned ? '#34D399' : '#475569'} />
      </svg>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 md:p-6 w-full max-w-xl mx-auto">
      {/* Header */}
      <div className="w-full flex items-center justify-between mb-4 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Puzzle className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-semibold tracking-wide text-emerald-400 uppercase">
            Circuit Nexus Pipeline
          </span>
        </div>
        <button
          onClick={() => {
            soundEngine.playClick();
            setTiles((prev) =>
              prev.map((t) => ({ ...t, rotation: (t.targetRotation + 90) % 360 }))
            );
            setIsCompleted(false);
          }}
          className="min-h-[44px] px-2 flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition-colors shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Retry / Scramble</span>
        </button>
      </div>

      <div className="w-full glass-panel rounded-2xl p-6 md:p-8 flex flex-col items-center relative overflow-hidden">
        <p className="text-xs text-slate-400 mb-6 text-center max-w-md">
          Rotate the synaptic conduit tiles by 90° intervals to align the continuous energy circuit from input to output.
        </p>

        {/* 3x3 Circuit Board */}
        <div className="relative p-5 bg-black/60 rounded-3xl border border-emerald-500/25 glow-emerald">
          {/* Input Indicator */}
          <div className="absolute -left-3 top-8 px-2 py-1 bg-emerald-500/20 border border-emerald-400/40 text-[9px] font-mono text-emerald-300 rounded-md">
            IN
          </div>

          {/* Output Indicator */}
          <div className="absolute -right-3 bottom-8 px-2 py-1 bg-emerald-500/20 border border-emerald-400/40 text-[9px] font-mono text-emerald-300 rounded-md">
            OUT
          </div>

          <div className={`grid gap-3 ${gridSize === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
            {tiles.map((tile) => {
              const isAligned = tile.rotation === tile.targetRotation;
              return (
                <button
                  key={tile.id}
                  disabled={isCompleted}
                  onClick={() => handleRotateTile(tile.id)}
                  className={`rounded-2xl flex items-center justify-center transition-all duration-150 border active:scale-95 ${
                    gridSize === 2 ? 'w-24 h-24 sm:w-28 sm:h-28' : 'w-18 h-18 sm:w-20 sm:h-20 md:w-24 md:h-24'
                  } ${
                    isAligned
                      ? 'bg-emerald-950/30 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                      : 'bg-white/5 border-white/10 hover:border-emerald-400/40 hover:bg-white/10'
                  }`}
                >
                  {renderPipeGraphic(tile)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Alignment Counter */}
        <div className="mt-6 flex items-center gap-3 text-xs font-mono text-slate-400">
          <span>Aligned Conduits:</span>
          <span className="text-emerald-400 font-bold">
            {tiles.filter((t) => t.rotation === t.targetRotation).length} / {tiles.length}
          </span>
        </div>
      </div>
    </div>
  );
};
