/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { LevelData } from '../../types/game';
import { soundEngine } from '../../services/soundEngine';
import { generateUniqueOptions } from '../../services/levelEngine';
import { Calculator, Check, RotateCcw } from 'lucide-react';

interface MathLogicGridGameProps {
  level: LevelData;
  onSuccess: () => void;
  onMistake?: () => void;
}

export const MathLogicGridGame: React.FC<MathLogicGridGameProps> = ({ level, onSuccess, onMistake }) => {
  const { config } = level;
  const gridSize: number = config.gridSize || 3;
  const targetRowSums: number[] = config.targetRowSums || [];
  const targetColSums: number[] = config.targetColSums || [];
  const solution: number[][] = config.solution || [];
  const hiddenCoordinates: { r: number; c: number }[] = config.hiddenCoordinates || [];

  // Working grid state (cells either filled with fixed values, empty (null), or user input)
  const [grid, setGrid] = useState<(number | null)[][]>([]);
  const [selectedCell, setSelectedCell] = useState<{ r: number; c: number } | null>(null);
  const [cellOptionsMap, setCellOptionsMap] = useState<Record<string, number[]>>({});
  const [errorFeedback, setErrorFeedback] = useState<string | null>(null);

  // Initialize or reset grid
  const initializeGrid = () => {
    const initialGrid: (number | null)[][] = [];
    for (let r = 0; r < gridSize; r++) {
      initialGrid[r] = [];
      for (let c = 0; c < gridSize; c++) {
        const isHidden = hiddenCoordinates.some((h) => h.r === r && h.c === c);
        initialGrid[r][c] = isHidden ? null : solution[r]?.[c] ?? 1;
      }
    }
    setGrid(initialGrid);

    // Build or recover 4 multiple-choice options per hidden coordinate
    const initialMap: Record<string, number[]> = { ...(config.cellOptions || {}) };
    hiddenCoordinates.forEach((h) => {
      const key = `${h.r},${h.c}`;
      if (!initialMap[key] || initialMap[key].length < 4) {
        const ans = solution[h.r]?.[h.c] ?? 1;
        initialMap[key] = generateUniqueOptions(ans);
      }
    });
    setCellOptionsMap(initialMap);

    setSelectedCell(hiddenCoordinates[0] || null);
    setErrorFeedback(null);
  };

  useEffect(() => {
    initializeGrid();
  }, [level]);

  // Calculate current row sums
  const currentRowSums = grid.map((row) =>
    row.reduce((acc: number, val) => acc + (val !== null ? val : 0), 0)
  );

  // Calculate current column sums
  const currentColSums: number[] = [];
  for (let c = 0; c < gridSize; c++) {
    let sum = 0;
    for (let r = 0; r < gridSize; r++) {
      sum += grid[r]?.[c] !== null && grid[r]?.[c] !== undefined ? (grid[r][c] as number) : 0;
    }
    currentColSums.push(sum);
  }

  // Handle cell click (select or double-tap to return value to pool)
  const handleCellClick = (r: number, c: number) => {
    const isHidden = hiddenCoordinates.some((h) => h.r === r && h.c === c);
    if (!isHidden) return; // Fixed cell cannot be modified
    soundEngine.playClick();
    if (selectedCell?.r === r && selectedCell?.c === c && grid[r]?.[c] !== null) {
      handleClearCell(r, c);
      return;
    }
    setSelectedCell({ r, c });
  };

  // Clear value from a cell
  const handleClearCell = (r: number, c: number) => {
    const isHidden = hiddenCoordinates.some((h) => h.r === r && h.c === c);
    if (!isHidden) return;
    const currentVal = grid[r]?.[c];
    if (currentVal === null || currentVal === undefined) return;

    soundEngine.playClick();
    const newGrid = grid.map((row) => [...row]);
    newGrid[r][c] = null;
    setGrid(newGrid);
    setSelectedCell({ r, c });
  };

  // Active 4 multiple-choice options for the currently selected cell
  const currentCellKey = selectedCell ? `${selectedCell.r},${selectedCell.c}` : '';
  const currentAnswer = selectedCell ? solution[selectedCell.r]?.[selectedCell.c] ?? 1 : 1;
  const activeChoices: number[] = (selectedCell && cellOptionsMap[currentCellKey])
    ? cellOptionsMap[currentCellKey]
    : (config.optionsPool && config.optionsPool.length === 4)
    ? config.optionsPool
    : generateUniqueOptions(currentAnswer);

  // Place number into selected cell from the 4 multiple-choice options
  const handlePlaceNumber = (val: number) => {
    if (!selectedCell) return;
    soundEngine.playNodeChime(val);
    soundEngine.triggerHaptic(12);

    const newGrid = grid.map((row) => [...row]);
    newGrid[selectedCell.r][selectedCell.c] = val;
    setGrid(newGrid);

    // Check completion condition
    let allFilled = true;
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if (newGrid[r][c] === null) {
          allFilled = false;
          break;
        }
      }
    }

    if (allFilled) {
      // Validate all row & col sums
      let valid = true;
      for (let r = 0; r < gridSize; r++) {
        const rowSum = newGrid[r].reduce((a, b) => (a || 0) + (b || 0), 0);
        if (rowSum !== targetRowSums[r]) {
          valid = false;
          break;
        }
      }
      for (let c = 0; c < gridSize; c++) {
        let colSum = 0;
        for (let r = 0; r < gridSize; r++) {
          colSum += newGrid[r][c] || 0;
        }
        if (colSum !== targetColSums[c]) {
          valid = false;
          break;
        }
      }

      if (valid) {
        soundEngine.playSuccess();
        onSuccess();
      } else {
        soundEngine.playSoftMistake();
        setErrorFeedback('Sum disparity detected. Rebalance the values.');
        onMistake?.();
        setTimeout(() => setErrorFeedback(null), 1500);
      }
    } else {
      // Auto-advance selection to next empty cell
      const nextEmpty = hiddenCoordinates.find((h) => newGrid[h.r][h.c] === null);
      if (nextEmpty) {
        setSelectedCell(nextEmpty);
      }
    }
  };

  // Keyboard shortcut listener for grid (Arrow keys, 1-4 for option buttons or direct option number, Backspace)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedCell) return;

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prevR = (selectedCell.r - 1 + gridSize) % gridSize;
        setSelectedCell({ r: prevR, c: selectedCell.c });
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const nextR = (selectedCell.r + 1) % gridSize;
        setSelectedCell({ r: nextR, c: selectedCell.c });
        return;
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const prevC = (selectedCell.c - 1 + gridSize) % gridSize;
        setSelectedCell({ r: selectedCell.r, c: prevC });
        return;
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        const nextC = (selectedCell.c + 1) % gridSize;
        setSelectedCell({ r: selectedCell.r, c: nextC });
        return;
      }

      if (e.key === 'Backspace' || e.key === 'Delete') {
        handleClearCell(selectedCell.r, selectedCell.c);
        return;
      }

      // Check if pressed key selects from options
      const num = parseInt(e.key, 10);
      if (!isNaN(num)) {
        // If pressing 1, 2, 3, 4 -> choose corresponding option button (1-indexed)
        if (num >= 1 && num <= activeChoices.length) {
          handlePlaceNumber(activeChoices[num - 1]);
          return;
        }
        // If typing the actual value present in activeChoices
        if (activeChoices.includes(num)) {
          handlePlaceNumber(num);
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCell, grid, activeChoices, gridSize]);

  return (
    <div className="flex flex-col items-center justify-center p-2 sm:p-4 md:p-6 w-full max-w-2xl mx-auto">
      {/* Header Info */}
      <div className="w-full flex items-center justify-between mb-4 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2 min-w-0">
          <Calculator className="w-5 h-5 text-amber-400 shrink-0" />
          <span className="text-xs sm:text-sm font-semibold tracking-wide text-amber-400 uppercase truncate">
            {level.pillar === 'math' ? 'Arithmetic Equilibrium' : 'Logic Constraint Lattice'}
          </span>
        </div>
        <button
          onClick={initializeGrid}
          className="min-h-[44px] px-2 flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      <div className="w-full glass-panel rounded-2xl p-3 sm:p-6 md:p-8 flex flex-col items-center overflow-hidden">
        <p className="text-xs text-slate-400 mb-5 text-center max-w-md px-2">
          {level.description} Tap an empty cell, then select a value below. (Keypad 1-9 & Arrows supported)
        </p>

        {/* Matrix with Target Sum Headers with horizontal scroll safety */}
        <div className="w-full overflow-x-auto flex justify-center py-1 no-scrollbar">
          <div className="inline-block bg-black/50 p-2.5 sm:p-5 rounded-2xl border border-amber-500/20 glow-amber shrink-0">
            <div className="grid gap-1.5 sm:gap-2" style={{ gridTemplateColumns: `repeat(${gridSize + 1}, minmax(0, 1fr))` }}>
              {/* Top row empty corner + Column target headers */}
              <div
                className={
                  gridSize === 2
                    ? 'w-10 h-8 sm:w-14 sm:h-11 md:w-16 md:h-12'
                    : gridSize === 3
                    ? 'w-9 h-8 sm:w-12 sm:h-10 md:w-14 md:h-11'
                    : gridSize === 4
                    ? 'w-7 h-7 sm:w-10 sm:h-9 md:w-12 md:h-10'
                    : 'w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-9'
                }
              />
              {targetColSums.map((target, c) => {
                const current = currentColSums[c] || 0;
                const isMatch = current === target;
                return (
                  <div
                    key={c}
                    className={`flex flex-col items-center justify-center rounded-lg text-xs font-mono font-bold transition-colors ${
                      gridSize === 2
                        ? 'w-10 h-8 sm:w-14 sm:h-11 md:w-16 md:h-12'
                        : gridSize === 3
                        ? 'w-9 h-8 sm:w-12 sm:h-10 md:w-14 md:h-11'
                        : gridSize === 4
                        ? 'w-7 h-7 sm:w-10 sm:h-9 md:w-12 md:h-10'
                        : 'w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-9'
                    } ${
                      isMatch
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-white/5 text-amber-400/80 border border-white/10'
                    }`}
                  >
                    <span className="text-[7px] sm:text-[9px] text-slate-400">C{c + 1}</span>
                    <span className="text-[10px] sm:text-xs">{target}</span>
                  </div>
                );
              })}

              {/* Matrix rows with Row target headers on left */}
              {grid.map((row, r) => (
                <React.Fragment key={r}>
                  {/* Row Target header */}
                  <div
                    className={`flex flex-col items-center justify-center rounded-lg text-xs font-mono font-bold transition-colors ${
                      gridSize === 2
                        ? 'w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16'
                        : gridSize === 3
                        ? 'w-9 h-9 sm:w-12 sm:h-12 md:w-14 md:h-14'
                        : gridSize === 4
                        ? 'w-7 h-7 sm:w-10 sm:h-10 md:w-12 md:h-12'
                        : 'w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10'
                    } ${
                      currentRowSums[r] === targetRowSums[r]
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-white/5 text-amber-400/80 border border-white/10'
                    }`}
                  >
                    <span className="text-[7px] sm:text-[9px] text-slate-400">R{r + 1}</span>
                    <span className="text-[10px] sm:text-xs">{targetRowSums[r]}</span>
                  </div>

                  {/* Cells */}
                  {row.map((cellVal, c) => {
                    const isHidden = hiddenCoordinates.some((h) => h.r === r && h.c === c);
                    const isSelected = selectedCell?.r === r && selectedCell?.c === c;

                    return (
                      <button
                        key={c}
                        disabled={!isHidden}
                        onClick={() => handleCellClick(r, c)}
                        className={`rounded-xl flex items-center justify-center font-mono font-bold transition-all duration-150 border active:scale-95 ${
                          gridSize === 2
                            ? 'w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 text-sm sm:text-lg md:text-xl'
                            : gridSize === 3
                            ? 'w-9 h-9 sm:w-12 sm:h-12 md:w-14 md:h-14 text-xs sm:text-base md:text-lg'
                            : gridSize === 4
                            ? 'w-7 h-7 sm:w-10 sm:h-10 md:w-12 md:h-12 text-[11px] sm:text-sm md:text-base'
                            : 'w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-[9px] sm:text-xs md:text-sm'
                        } ${
                          isSelected
                            ? 'border-amber-400 bg-amber-500/25 shadow-[0_0_15px_rgba(245,158,11,0.5)] scale-105'
                            : !isHidden
                            ? 'bg-white/10 border-white/15 text-slate-200 cursor-default'
                            : cellVal !== null
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                            : 'bg-white/5 border-dashed border-white/20 text-slate-500 hover:border-amber-400/50'
                        }`}
                      >
                        {cellVal !== null ? cellVal : '?'}
                      </button>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* 4 Multiple-Choice Option Buttons & Clear Control */}
        <div className="mt-6 flex flex-col items-center w-full max-w-md">
          <div className="flex items-center justify-between w-full mb-3 px-1">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <span>Available Values</span>
              <span className="text-[10px] text-amber-400 font-normal lowercase">(choose 1 of 4)</span>
            </span>
            {selectedCell && grid[selectedCell.r]?.[selectedCell.c] !== null && (
              <button
                onClick={() => handleClearCell(selectedCell.r, selectedCell.c)}
                className="min-h-[44px] px-2 text-[11px] font-mono text-rose-400 hover:text-rose-300 hover:underline transition-colors flex items-center"
              >
                Clear Cell [⌫]
              </button>
            )}
          </div>

          {/* 4 Option Buttons Grid */}
          <div className="grid grid-cols-4 gap-2 sm:gap-3 w-full">
            {activeChoices.map((val, idx) => {
              const isSelectedValue = selectedCell && grid[selectedCell.r]?.[selectedCell.c] === val;
              const optionLetters = ['A', 'B', 'C', 'D'];
              return (
                <button
                  key={`${val}-${idx}`}
                  onClick={() => handlePlaceNumber(val)}
                  className={`min-h-[52px] sm:min-h-[58px] rounded-2xl flex flex-col items-center justify-center p-2 transition-all duration-150 border active:scale-95 group relative ${
                    isSelectedValue
                      ? 'bg-amber-500/25 border-amber-400 text-amber-300 shadow-[0_0_16px_rgba(245,158,11,0.4)] scale-[1.02]'
                      : 'bg-white/5 border-white/10 hover:border-amber-400/60 hover:bg-amber-500/15 text-slate-100 hover:text-amber-300'
                  }`}
                >
                  <span className="text-[9px] font-mono text-slate-400 group-hover:text-amber-400/80 mb-0.5">
                    Option {optionLetters[idx]}
                  </span>
                  <span className="font-mono font-bold text-lg sm:text-xl">
                    {val}
                  </span>
                </button>
              );
            })}
          </div>

          {selectedCell && (
            <p className="text-[11px] text-slate-500 font-mono mt-2.5 text-center">
              Target cell: Row {selectedCell.r + 1}, Col {selectedCell.c + 1} · Press 1–4 or tap to select
            </p>
          )}
        </div>

        {errorFeedback && (
          <div className="mt-4 p-3 bg-rose-500/15 border border-rose-500/40 rounded-xl flex items-center justify-between gap-3 text-xs font-mono text-rose-300 animate-in fade-in w-full max-w-md">
            <span className="flex items-center gap-2">
              <span className="text-sm">⚠️</span>
              <span>{errorFeedback}</span>
            </span>
            <button
              onClick={initializeGrid}
              className="px-3 py-1.5 bg-rose-500/25 hover:bg-rose-500/40 border border-rose-400/60 text-rose-200 rounded-lg flex items-center gap-1.5 transition-all active:scale-95 text-xs font-semibold shrink-0 shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry Level</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
