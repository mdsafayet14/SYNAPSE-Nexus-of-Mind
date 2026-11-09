/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LevelData, PillarType, ZoneConfig } from '../types/game';

// Seeded Mulberry32 PRNG for deterministic 1,000 level generation
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const ZONES: ZoneConfig[] = [
  {
    id: 'awakening',
    name: 'Awakening',
    tagline: 'Genesis & Elementary Foundations',
    levelStart: 1,
    levelEnd: 250,
    accentColor: '#38BDF8',
    description: 'Elementary Grade 1 starter logic (2x2 entry, single-step operations, gentle sequences), expanding smoothly to foundational problem-solving.'
  },
  {
    id: 'illumination',
    name: 'Illumination',
    tagline: 'Algebraic Flow & Dynamic Recall',
    levelStart: 251,
    levelEnd: 500,
    accentColor: '#F59E0B',
    description: 'Transition to dual algebraic balance, 3x3 and 4x4 matrix sequences, logic constraint gates, and multi-stage cognitive fusion.'
  },
  {
    id: 'mastery',
    name: 'Mastery',
    tagline: 'High-Dimensional Synthesis',
    levelStart: 501,
    levelEnd: 750,
    accentColor: '#10B981',
    description: 'Combinatorial path equations, high-density sequence retention under rapid pulse frequencies, and multi-variable logic lattices.'
  },
  {
    id: 'singularity',
    name: 'Singularity',
    tagline: 'Quantum Engineering Mind Alignment',
    levelStart: 751,
    levelEnd: 1000,
    accentColor: '#EC4899',
    description: 'Elite BUET/KUET/RUET tier cognitive challenge: 5x5 tensor logic, 16-node rapid memory matrices, and high-order constraint systems.'
  }
];

export function getZoneForLevel(level: number): ZoneConfig {
  const boundedLevel = Math.max(1, Math.min(1000, level));
  return ZONES.find((z) => boundedLevel >= z.levelStart && boundedLevel <= z.levelEnd) || ZONES[0];
}

export function generateLevelData(levelNumber: number, forcedPillar?: PillarType): LevelData {
  const level = Math.max(1, Math.min(1000, levelNumber));
  const rng = mulberry32(level * 7919 + 42);
  const zoneConfig = getZoneForLevel(level);

  // Pillar distribution pattern
  let pillar: PillarType;
  if (forcedPillar) {
    pillar = forcedPillar;
  } else if (level % 15 === 0) {
    pillar = 'relaxing';
  } else if (level % 5 === 0) {
    pillar = 'quantum';
  } else {
    const pool: PillarType[] = ['math', 'memory', 'logic', 'puzzle'];
    pillar = pool[(level - 1) % 4];
  }

  // Strict Exponential Difficulty Rating (1.0 at Level 1 to 10.0 at Level 1000)
  // Formula: D(L) = 1.0 + 9.0 * ((e^(2.0 * t) - 1) / (e^2.0 - 1)) where t = (L - 1) / 999
  const t = (level - 1) / 999;
  const alpha = 2.0;
  const expFactor = (Math.exp(alpha * t) - 1) / (Math.exp(alpha) - 1);
  const difficultyRating = parseFloat(Math.min(10.0, Math.max(1.0, 1.0 + 9.0 * expFactor)).toFixed(1));

  let title = '';
  let description = '';
  let targetMetric = 100;
  let config: Record<string, any> = {};

  if (pillar === 'quantum') {
    title = `Quantum Nexus #${level}`;
    description = 'Execute a 3-stage cognitive fusion: Math equation solve, spatial sequence recall, and Boolean gate deduction.';

    // Stage 1: Math equation (scales from Grade 1 simple sum up to multi-operator equation)
    let a: number;
    let b: number;
    let mathPrompt = '';
    let mathAnswer = 0;

    if (level <= 40) {
      a = Math.floor(rng() * 4) + 1; // 1 to 4
      b = Math.floor(rng() * 4) + 1; // 1 to 4
      mathAnswer = a + b;
      mathPrompt = `${a} + ${b} = ?`;
    } else if (level <= 250) {
      a = Math.floor(rng() * 15) + 3;
      b = Math.floor(rng() * 12) + 2;
      mathAnswer = a + b;
      mathPrompt = `${a} + ${b} = ?`;
    } else if (level <= 600) {
      a = Math.floor(rng() * 8) + 3;
      b = Math.floor(rng() * 8) + 2;
      const c = Math.floor(rng() * 10) + 1;
      mathAnswer = a * b + c;
      mathPrompt = `(${a} × ${b}) + ${c} = ?`;
    } else {
      // Elite BUET/RUET tier mental math equation
      const mult1 = Math.floor(rng() * 9) + 4;
      const base1 = Math.floor(rng() * 9) + 4;
      const mult2 = Math.floor(rng() * 6) + 2;
      const sub = Math.floor(rng() * 12) + 1;
      mathAnswer = mult1 * base1 - mult2 * sub;
      mathPrompt = `(${mult1} × ${base1}) - (${mult2} × ${sub}) = ?`;
    }

    // Stage 2: Memory sequence (scales from 2 to 10 nodes)
    const gridDimension = level <= 40 ? 2 : level <= 600 ? 3 : 4;
    const totalTiles = gridDimension * gridDimension;
    const seqLen = Math.min(10, Math.floor(2 + 8 * Math.pow(t, 0.85)));

    const memorySeq: number[] = [];
    for (let i = 0; i < seqLen; i++) {
      memorySeq.push(Math.floor(rng() * totalTiles));
    }

    // Stage 3: Logic gate
    const logicTypes = level <= 40 ? ['AND', 'OR'] : level <= 250 ? ['AND', 'OR', 'XOR'] : ['AND', 'OR', 'XOR', 'NAND', 'NOR'];
    const chosenGate = logicTypes[Math.floor(rng() * logicTypes.length)];
    const inputA = level <= 15 ? true : rng() > 0.4;
    const inputB = level <= 15 ? true : rng() > 0.4;
    let expectedOutput = false;
    if (chosenGate === 'AND') expectedOutput = inputA && inputB;
    if (chosenGate === 'OR') expectedOutput = inputA || inputB;
    if (chosenGate === 'XOR') expectedOutput = inputA !== inputB;
    if (chosenGate === 'NAND') expectedOutput = !(inputA && inputB);
    if (chosenGate === 'NOR') expectedOutput = !(inputA || inputB);

    config = {
      stages: 3,
      mathPrompt,
      mathAnswer,
      mathOptions: generateUniqueOptions(mathAnswer, rng),
      memorySequence: memorySeq,
      gridDimension,
      logicGate: chosenGate,
      logicInputA: inputA,
      logicInputB: inputB,
      logicExpected: expectedOutput
    };
    targetMetric = 3;
  } else if (pillar === 'math' || pillar === 'logic') {
    // Dynamic Grid Size & Exponential Operand Range
    // Level 1-40: 2x2 grid (1-2 missing numbers, max val 3-6) -> Grade 1 elementary entry
    // Level 41-350: 3x3 grid
    // Level 351-800: 4x4 grid
    // Level 801-1000: 5x5 grid (high engineering complexity)
    let gridSize: number;
    if (level <= 40) {
      gridSize = 2;
    } else if (level <= 350) {
      gridSize = 3;
    } else if (level <= 800) {
      gridSize = 4;
    } else {
      gridSize = 5;
    }

    // Exponential scaling of operand values and hidden cells
    const maxVal = Math.floor(3 + 120 * Math.pow(t, 1.4));
    const maxPossibleHide = gridSize * gridSize - 1;
    const cellsToHideCount = Math.min(
      maxPossibleHide,
      Math.max(1, Math.floor(1 + (maxPossibleHide - 1) * Math.pow(t, 0.85)))
    );

    if (level <= 40) {
      title = pillar === 'math' ? `Primary Sum Balance #${level}` : `Logic Pair #${level}`;
      description = 'Elementary Grade 1 level: Find the missing number to balance row and column sums.';
    } else if (level <= 250) {
      title = pillar === 'math' ? `Arithmetic Matrix #${level}` : `Logic Lattice #${level}`;
      description = 'Calculate missing coordinates to satisfy row and column target constraints.';
    } else if (level <= 750) {
      title = pillar === 'math' ? `Algebraic Matrix #${level}` : `Constraint Grid #${level}`;
      description = 'Multi-variable constraint grid. Deduce missing invariant values.';
    } else {
      title = pillar === 'math' ? `Engineering Tensor #${level}` : `High-Order Lattice #${level}`;
      description = 'Elite BUET/RUET tier tensor grid. Deduce intersecting row/column invariants.';
    }

    // Generate valid solution matrix
    const targetRowSums: number[] = [];
    const targetColSums: number[] = [];
    const solution: number[][] = [];

    for (let r = 0; r < gridSize; r++) {
      solution[r] = [];
      let rowSum = 0;
      for (let c = 0; c < gridSize; c++) {
        const val = Math.floor(rng() * maxVal) + 1;
        solution[r][c] = val;
        rowSum += val;
      }
      targetRowSums.push(rowSum);
    }

    for (let c = 0; c < gridSize; c++) {
      let colSum = 0;
      for (let r = 0; r < gridSize; r++) {
        colSum += solution[r][c];
      }
      targetColSums.push(colSum);
    }

    // Hide coordinates
    const allCoords: { r: number; c: number }[] = [];
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        allCoords.push({ r, c });
      }
    }
    const shuffledCoords = shuffleArray(allCoords, rng);
    const hiddenCoordinates = shuffledCoords.slice(0, cellsToHideCount);

    const cellOptions: Record<string, number[]> = {};
    hiddenCoordinates.forEach((h) => {
      const ans = solution[h.r][h.c];
      cellOptions[`${h.r},${h.c}`] = generateUniqueOptions(ans, rng);
    });

    const firstHidden = hiddenCoordinates[0] || { r: 0, c: 0 };
    const firstAns = solution[firstHidden.r]?.[firstHidden.c] ?? 1;

    config = {
      gridSize,
      targetRowSums,
      targetColSums,
      solution,
      hiddenCoordinates,
      cellOptions,
      optionsPool: cellOptions[`${firstHidden.r},${firstHidden.c}`] || generateUniqueOptions(firstAns, rng)
    };
    targetMetric = hiddenCoordinates.length;
  } else if (pillar === 'memory') {
    // Memory Exponential Progression
    // Level 1-40: 2x2 grid (4 tiles), sequence length 2, speed 850ms (Gentle Grade 1 entry)
    // Level 41-350: 3x3 grid (9 tiles), sequence length 3 to 6, speed 750ms -> 500ms
    // Level 351-800: 4x4 grid (16 tiles), sequence length 6 to 11, speed 500ms -> 300ms
    // Level 801-1000: 5x5 grid (25 tiles), sequence length 12 to 16, speed 250ms -> 180ms
    let matrixDimension: number;
    if (level <= 40) {
      matrixDimension = 2;
    } else if (level <= 350) {
      matrixDimension = 3;
    } else if (level <= 800) {
      matrixDimension = 4;
    } else {
      matrixDimension = 5;
    }

    const sequenceLength = Math.min(16, Math.floor(2 + 14 * Math.pow(t, 0.85)));
    const displaySpeedMs = Math.max(180, Math.floor(850 - 670 * Math.pow(t, 0.7)));

    if (level <= 40) {
      title = `Gentle Sequence #${level}`;
      description = `Grade 1 entry: Observe ${sequenceLength} glowing pulses on the 2x2 matrix, then reproduce the path.`;
    } else if (level <= 350) {
      title = `Synaptic Sequence #${level}`;
      description = `Retain the spatial pathway of ${sequenceLength} illuminated nodes across the matrix.`;
    } else if (level <= 750) {
      title = `High-Density Recall #${level}`;
      description = `Absorb ${sequenceLength} rapid synaptic pulses in precise sequential order.`;
    } else {
      title = `Quantum Memory Lattice #${level}`;
      description = `Elite engineering tier: Retain ${sequenceLength} ultra-rapid pulses across a 25-node high-density matrix.`;
    }

    const totalTiles = matrixDimension * matrixDimension;
    const sequence: number[] = [];
    for (let i = 0; i < sequenceLength; i++) {
      sequence.push(Math.floor(rng() * totalTiles));
    }

    config = {
      matrixDimension,
      totalTiles,
      sequence,
      displaySpeedMs
    };
    targetMetric = sequenceLength;
  } else if (pillar === 'puzzle') {
    // Spatial Circuit Puzzle Progression
    // Level 1-50: 2x2 grid (4 tiles, 1 or 2 rotations)
    // Level 51-1000: 3x3 grid (9 tiles, rotations scale from 2 to 8)
    const isBeginner = level <= 50;
    const gridSize = isBeginner ? 2 : 3;
    const rotationsRequired = isBeginner
      ? level <= 20
        ? 1
        : 2
      : Math.min(8, Math.floor(2 + 6 * Math.pow(t, 0.8)));

    title = isBeginner ? `Intro Conduit #${level}` : `Circuit Nexus #${level}`;
    description = isBeginner
      ? `Rotate the shape conduit by 90° to connect the energy pathway from IN to OUT.`
      : `Align the multi-node synaptic conduits to complete the continuous energy circuit.`;

    config = {
      gridSize,
      rotationsRequired
    };
    targetMetric = 1;
  } else {
    // Relaxing Zen Interlude
    title = `Zen Harmonic Interlude #${level}`;
    description = 'Pause cognitive strain. Synchronize your breathing rhythm with the expanding harmonic waveform.';
    config = {
      cycles: level <= 50 ? 2 : 3,
      inhaleSec: 4,
      holdSec: 4,
      exhaleSec: 4,
      baseFreq: 216
    };
    targetMetric = level <= 50 ? 2 : 3;
  }

  return {
    levelNumber: level,
    zone: zoneConfig.id,
    pillar,
    title,
    description,
    difficultyRating,
    seed: level,
    targetMetric,
    config
  };
}

export function generateUniqueOptions(answer: number, rng?: () => number): number[] {
  const options = new Set<number>();
  options.add(answer);

  const localRng = rng || Math.random;
  const offsets = [1, 2, 3, 4, 5, -1, -2, -3, -4];
  const shuffledOffsets = shuffleArray(offsets, localRng);

  for (const offset of shuffledOffsets) {
    const candidate = answer + offset;
    if (candidate > 0 && !options.has(candidate)) {
      options.add(candidate);
    }
    if (options.size === 4) break;
  }

  // Fallback if needed
  let counter = 1;
  while (options.size < 4) {
    if (answer - counter > 0 && !options.has(answer - counter)) {
      options.add(answer - counter);
    }
    if (options.size < 4 && !options.has(answer + counter)) {
      options.add(answer + counter);
    }
    counter++;
  }

  return shuffleArray(Array.from(options), localRng);
}

function shuffleArray<T>(arr: T[], rng: () => number): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function generatePillarLevelData(pillar: PillarType, pillarLevel: number): LevelData {
  const safePillarLevel = Math.max(1, Math.min(1000, pillarLevel));
  // In Free Play mode, pillarLevel K maps directly to level K's exponential difficulty
  const baseData = generateLevelData(safePillarLevel, pillar);

  const pillarNames: Record<PillarType, string> = {
    math: 'Math Equilibrium',
    memory: 'Memory Recall',
    logic: 'Logic Deduction',
    puzzle: 'Spatial Circuit',
    relaxing: 'Zen Resonator',
    quantum: 'Quantum Fusion'
  };

  return {
    ...baseData,
    levelNumber: safePillarLevel,
    title: `${pillarNames[pillar]} · Training Level ${safePillarLevel}`,
    description: `Independent Pillar Free Play Mode. Solve to advance category difficulty rating (${baseData.difficultyRating} / 10).`
  };
}

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getYesterdayDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDailyChallengeData(dateStr?: string) {
  const targetDate = dateStr || getTodayDateString();
  let hash = 0;
  for (let i = 0; i < targetDate.length; i++) {
    hash = (hash << 5) - hash + targetDate.charCodeAt(i);
    hash |= 0;
  }
  const positiveHash = Math.abs(hash) + 1;
  const rng = mulberry32(positiveHash);

  const pillars: PillarType[] = ['math', 'memory', 'logic', 'puzzle', 'quantum'];
  const pillar = pillars[Math.floor(rng() * pillars.length)];

  // Daily challenge level scales between 50 and 450 for a solid engaging challenge
  const levelSeed = 50 + Math.floor(rng() * 400);
  const baseLevelData = generateLevelData(levelSeed, pillar);

  const formattedDate = new Date(targetDate + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const pillarNames: Record<PillarType, string> = {
    math: 'Math Equilibrium',
    memory: 'Memory Recall',
    logic: 'Logic Deduction',
    puzzle: 'Spatial Circuit',
    relaxing: 'Zen Resonator',
    quantum: 'Quantum Nexus'
  };

  return {
    dateString: targetDate,
    formattedDate,
    pillar,
    title: `Daily Challenge (${formattedDate})`,
    subtitle: `${pillarNames[pillar]} Special Trial`,
    levelData: {
      ...baseLevelData,
      title: `Daily Challenge · ${pillarNames[pillar]}`,
      description: `Special Rotating Daily Trial for ${formattedDate}. Complete to extend your Daily Streak counter!`
    }
  };
}

