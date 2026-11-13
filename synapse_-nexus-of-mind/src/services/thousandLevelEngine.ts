/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  LevelTarget,
  TargetChoice,
  TargetType,
  TierBandConfig
} from '../types/synapse';

export const TIER_BANDS: TierBandConfig[] = [
  {
    id: 'foundation',
    name: 'Class 7/8 Foundation',
    academicTag: 'Medium Baseline',
    levelStart: 1,
    levelEnd: 150,
    accentColor: '#38BDF8',
    description: 'Linear equations, percentages, multi-step arithmetic, basic Boolean gates, and 90° spatial logic.'
  },
  {
    id: 'intermediate',
    name: 'BUTE Synthesis',
    academicTag: 'Medium',
    levelStart: 151,
    levelEnd: 400,
    accentColor: '#22D3EE',
    description: 'Two-variable systems, geometric & quadratic progressions, cascaded gates, and matrix parity.'
  },
  {
    id: 'advanced',
    name: 'KUTE / RUET Aptitude',
    academicTag: 'Advanced',
    levelStart: 401,
    levelEnd: 700,
    accentColor: '#A78BFA',
    description: 'Modular congruence, algebraic identities, combinatorics, 4×4 recall, and XOR grid superposition.'
  },
  {
    id: 'elite',
    name: 'Very Advanced',
    academicTag: 'Singularity',
    levelStart: 701,
    levelEnd: 1000,
    accentColor: '#10B981',
    description: 'Matrix determinants, simultaneous systems, logarithms, 4-bit bitwise synthesis, and tensor lattices.'
  }
];

export function getBandForLevel(level: number): TierBandConfig {
  const bounded = Math.max(1, Math.min(1000, level));
  return (
    TIER_BANDS.find((b) => bounded >= b.levelStart && bounded <= b.levelEnd) || TIER_BANDS[0]
  );
}

/**
 * Exponential difficulty rating from 1.0 (Level 1) to 10.0 (Level 1000)
 */
export function getLevelDifficultyRating(level: number): number {
  const bounded = Math.max(1, Math.min(1000, level));
  const t = (bounded - 1) / 999;
  const alpha = 2.4;
  const expFactor = (Math.exp(alpha * t) - 1) / (Math.exp(alpha) - 1);
  return parseFloat(Math.min(10.0, Math.max(1.0, 1.0 + 9.0 * expFactor)).toFixed(1));
}

// Seeded Mulberry32 PRNG + runtime attempt variation
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randInt(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function shuffle<T>(items: T[], rng: () => number): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function buildNumericChoices(
  answer: number,
  offsets: number[],
  rng: () => number
): TargetChoice[] {
  const set = new Set<number>([answer]);
  for (const off of shuffle(offsets, rng)) {
    if (set.size >= 4) break;
    const candidate = answer + off;
    if (candidate !== answer) set.add(candidate);
  }
  let step = 1;
  while (set.size < 4) {
    set.add(answer + step);
    if (set.size < 4) set.add(answer - step);
    step++;
  }
  return shuffle(Array.from(set), rng).map((val, idx) => ({
    id: `num-${idx}-${val}`,
    label: String(val),
    value: String(val)
  }));
}

function generateMathTarget(
  level: number,
  targetNumber: number,
  rng: () => number
): LevelTarget {
  const id = `m-${level}-${targetNumber}-${Math.floor(rng() * 1e6)}`;
  const t = (level - 1) / 999;

  // BAND 1: Levels 1 - 150 (Class 7/8 Foundation - Medium Baseline)
  if (level <= 150) {
    const variant = targetNumber % 4;
    if (variant === 1) {
      // Class 7/8 Linear Equation: ax + b = c (or ax - b = c)
      const a = randInt(rng, 2, 4 + Math.floor(t * 20));
      const x = randInt(rng, 3, 12 + Math.floor(t * 25));
      const b = randInt(rng, 4, 24);
      const isSub = rng() > 0.5;
      const rhs = isSub ? a * x - b : a * x + b;
      return {
        id,
        targetNumber,
        type: 'math',
        categoryLabel: 'Linear Equation',
        prompt: 'Solve for x:',
        expression: `${a}x ${isSub ? '−' : '+'} ${b} = ${rhs}`,
        choices: buildNumericChoices(x, [-3, -2, -1, 1, 2, 3, 4], rng),
        correctValue: String(x)
      };
    }
    if (variant === 2) {
      // Percentage & Ratio Mental Math
      const pctChoices = [15, 20, 25, 30, 40, 60, 75];
      const pct = pctChoices[randInt(rng, 0, pctChoices.length - 1)];
      const baseMult = randInt(rng, 2, 8);
      const base = baseMult * 20;
      const extra = randInt(rng, 5, 25);
      const ans = Math.round((pct / 100) * base) + extra;
      return {
        id,
        targetNumber,
        type: 'math',
        categoryLabel: 'Percentage & Ratio',
        prompt: 'Compute the exact value:',
        expression: `${pct}% of ${base} + ${extra} = ?`,
        choices: buildNumericChoices(ans, [-10, -5, -2, 2, 5, 10], rng),
        correctValue: String(ans)
      };
    }
    if (variant === 3) {
      // Arithmetic or progressive difference sequence
      const start = randInt(rng, 4, 15);
      const d1 = randInt(rng, 3, 8);
      const stepDelta = level <= 50 ? 0 : randInt(rng, 1, 3);
      const t1 = start;
      const t2 = t1 + d1;
      const t3 = t2 + d1 + stepDelta;
      const t4 = t3 + d1 + stepDelta * 2;
      const ans = t4 + d1 + stepDelta * 3;
      return {
        id,
        targetNumber,
        type: 'math',
        categoryLabel: 'Pattern Sequence',
        prompt: 'Find the next number in the sequence:',
        expression: `${t1} , ${t2} , ${t3} , ${t4} , ?`,
        choices: buildNumericChoices(ans, [-4, -2, -1, 2, 4, 6], rng),
        correctValue: String(ans)
      };
    }
    // Order of operations
    const a = randInt(rng, 8, 22);
    const b = randInt(rng, 3, 9);
    const c = randInt(rng, 2, 8);
    const d = randInt(rng, 3, 14);
    const ans = a + b * c - d;
    return {
      id,
      targetNumber,
      type: 'math',
      categoryLabel: 'Arithmetic Synthesis',
      prompt: 'Evaluate using order of operations:',
      expression: `${a} + ${b} × ${c} − ${d} = ?`,
      choices: buildNumericChoices(ans, [-6, -3, -2, 2, 4, 6], rng),
      correctValue: String(ans)
    };
  }

  // BAND 2: Levels 151 - 400 (BUTE Synthesis)
  if (level <= 400) {
    const variant = targetNumber % 3;
    if (variant === 1) {
      // Bracketed equation: a(x - k) + b = rhs
      const a = randInt(rng, 3, 7);
      const k = randInt(rng, 2, 6);
      const x = randInt(rng, k + 2, k + 14);
      const b = randInt(rng, 4, 18);
      const rhs = a * (x - k) + b;
      return {
        id,
        targetNumber,
        type: 'math',
        categoryLabel: 'Algebraic Manipulation',
        prompt: 'Solve for x:',
        expression: `${a}(x − ${k}) + ${b} = ${rhs}`,
        choices: buildNumericChoices(x, [-4, -2, -1, 1, 2, 4], rng),
        correctValue: String(x)
      };
    }
    if (variant === 2) {
      // Powers & square roots
      const basePow = randInt(rng, 2, 4);
      const exp = basePow === 2 ? randInt(rng, 4, 6) : randInt(rng, 2, 3);
      const rootBase = randInt(rng, 5, 13);
      const sq = rootBase * rootBase;
      const sub = randInt(rng, 3, 12);
      const ans = Math.pow(basePow, exp) + rootBase - sub;
      return {
        id,
        targetNumber,
        type: 'math',
        categoryLabel: 'Exponents & Roots',
        prompt: 'Calculate the exact numeric result:',
        expression: `${basePow}^${exp} + √${sq} − ${sub} = ?`,
        choices: buildNumericChoices(ans, [-8, -4, -2, 2, 4, 8], rng),
        correctValue: String(ans)
      };
    }
    // Recursive geometric-shift series: x_{n+1} = m * x_n + c
    const mult = randInt(rng, 2, 3);
    const add = randInt(rng, 2, 7);
    const t1 = randInt(rng, 2, 5);
    const t2 = t1 * mult + add;
    const t3 = t2 * mult + add;
    const ans = t3 * mult + add;
    return {
      id,
      targetNumber,
      type: 'math',
      categoryLabel: 'Recursive Progression',
      prompt: 'Identify the missing term in the series:',
      expression: `${t1} , ${t2} , ${t3} , ?`,
      choices: buildNumericChoices(ans, [-6, -3, -2, 2, 4, 8], rng),
      correctValue: String(ans)
    };
  }

  // BAND 3: Levels 401 - 700 (KUTE / RUET Aptitude)
  if (level <= 700) {
    const variant = targetNumber % 4;
    if (variant === 1) {
      // Modular Arithmetic
      const a = randInt(rng, 17, 37);
      const b = randInt(rng, 11, 23);
      const mod = randInt(rng, 7, 13);
      const ans = (a * b) % mod;
      const modSet = new Set<number>([ans]);
      let step = 1;
      while (modSet.size < 4) {
        modSet.add((ans + step) % mod);
        if (modSet.size < 4) modSet.add((ans - step + mod) % mod);
        step++;
      }
      return {
        id,
        targetNumber,
        type: 'math',
        categoryLabel: 'Modular Congruence',
        prompt: 'Compute the exact modular remainder:',
        expression: `(${a} × ${b}) mod ${mod} = ?`,
        choices: shuffle(Array.from(modSet), rng).map((v, i) => ({
          id: `mod-${i}-${v}`,
          label: String(v),
          value: String(v)
        })),
        correctValue: String(ans)
      };
    }
    if (variant === 2) {
      // Difference of squares identity: (a^2 - b^2) / (a - b) + c
      const b = randInt(rng, 7, 19);
      const a = b + randInt(rng, 4, 11);
      const c = randInt(rng, 5, 22);
      const ans = a + b + c;
      return {
        id,
        targetNumber,
        type: 'math',
        categoryLabel: 'Algebraic Identity',
        prompt: 'Simplify and compute:',
        expression: `(${a}² − ${b}²) ÷ (${a} − ${b}) + ${c} = ?`,
        choices: buildNumericChoices(ans, [-6, -4, -2, 2, 4, 6], rng),
        correctValue: String(ans)
      };
    }
    if (variant === 3) {
      // Combinatorics: C(n, 2) or C(n, 3)
      const useThree = level > 550;
      const n = useThree ? randInt(rng, 6, 10) : randInt(rng, 7, 14);
      const ans = useThree ? (n * (n - 1) * (n - 2)) / 6 : (n * (n - 1)) / 2;
      return {
        id,
        targetNumber,
        type: 'math',
        categoryLabel: 'Combinatorial Count',
        prompt: 'Evaluate the binomial combination:',
        expression: `C(${n}, ${useThree ? 3 : 2}) = ?`,
        choices: buildNumericChoices(ans, [-10, -5, -3, 3, 5, 10], rng),
        correctValue: String(ans)
      };
    }
    // Second-order polynomial series
    const k = randInt(rng, 2, 8);
    const terms = [1, 2, 3, 4].map((n) => n * n + n + k);
    const ans = 25 + 5 + k;
    return {
      id,
      targetNumber,
      type: 'math',
      categoryLabel: 'Quadratic Sequence',
      prompt: 'Find the 5th term of the series:',
      expression: `${terms.join(' , ')} , ?`,
      choices: buildNumericChoices(ans, [-6, -3, -2, 2, 4, 6], rng),
      correctValue: String(ans)
    };
  }

  // BAND 4: Levels 701 - 1000 (BUET / Engineering Elite)
  const variant = targetNumber % 4;
  if (variant === 1) {
    // 2x2 Matrix Determinant
    const a = randInt(rng, 5, 14);
    const b = randInt(rng, 3, 11);
    const c = randInt(rng, 3, 10);
    const d = randInt(rng, 4, 13);
    const ans = a * d - b * c;
    return {
      id,
      targetNumber,
      type: 'math',
      categoryLabel: 'Matrix Determinant',
      prompt: 'Compute det(M) = ad − bc:',
      expression: `det [ ${a} , ${b}  |  ${c} , ${d} ] = ?`,
      choices: buildNumericChoices(ans, [-10, -5, -2, 2, 5, 10], rng),
      correctValue: String(ans)
    };
  }
  if (variant === 2) {
    // Simultaneous System: x + y = S, x - y = D -> find x^2 + y^2
    const x = randInt(rng, 8, 16);
    const y = randInt(rng, 2, x - 2);
    const S = x + y;
    const D = x - y;
    const ans = x * x + y * y;
    return {
      id,
      targetNumber,
      type: 'math',
      categoryLabel: 'Engineering System',
      prompt: `Given x + y = ${S} and x − y = ${D}, find x² + y²:`,
      expression: `x² + y² = ?`,
      choices: buildNumericChoices(ans, [-18, -8, -4, 4, 8, 18], rng),
      correctValue: String(ans)
    };
  }
  if (variant === 3) {
    // Logarithm + Power + Modular synthesis
    const logExp = randInt(rng, 4, 7); // 2^4=16 .. 2^7=128
    const arg = Math.pow(2, logExp);
    const mult = randInt(rng, 3, 7);
    const remBase = randInt(rng, 11, 19);
    const ans = logExp * mult + (remBase % 5);
    return {
      id,
      targetNumber,
      type: 'math',
      categoryLabel: 'Log-Modular Evaluation',
      prompt: 'Compute the exact expression:',
      expression: `log₂(${arg}) × ${mult} + (${remBase} mod 5) = ?`,
      choices: buildNumericChoices(ans, [-5, -3, -1, 1, 3, 5], rng),
      correctValue: String(ans)
    };
  }
  // Modular Exponentiation: (a^3 + b) mod m
  const base = randInt(rng, 3, 7);
  const offset = randInt(rng, 4, 15);
  const mod = randInt(rng, 7, 13);
  const ans = (Math.pow(base, 3) + offset) % mod;
  const modSet = new Set<number>([ans]);
  let step = 1;
  while (modSet.size < 4) {
    modSet.add((ans + step) % mod);
    if (modSet.size < 4) modSet.add((ans - step + mod) % mod);
    step++;
  }
  return {
    id,
    targetNumber,
    type: 'math',
    categoryLabel: 'Modular Power',
    prompt: 'Evaluate the modular power congruence:',
    expression: `(${base}³ + ${offset}) mod ${mod} = ?`,
    choices: shuffle(Array.from(modSet), rng).map((v, i) => ({
      id: `modp-${i}-${v}`,
      label: String(v),
      value: String(v)
    })),
    correctValue: String(ans)
  };
}

function evalGate(gate: string, a: boolean, b: boolean): boolean {
  switch (gate) {
    case 'AND':
      return a && b;
    case 'OR':
      return a || b;
    case 'XOR':
      return a !== b;
    case 'NAND':
      return !(a && b);
    case 'NOR':
      return !(a || b);
    case 'XNOR':
      return a === b;
    default:
      return a && b;
  }
}

function generateLogicTarget(
  level: number,
  targetNumber: number,
  rng: () => number
): LevelTarget {
  const id = `l-${level}-${targetNumber}-${Math.floor(rng() * 1e6)}`;
  const boolChoices: TargetChoice[] = [
    { id: 'c-true', label: 'TRUE (1)', value: '1' },
    { id: 'c-false', label: 'FALSE (0)', value: '0' }
  ];

  // Levels 1 - 150: Class 7/8 Single Gate & Basic Compound Logic
  if (level <= 150) {
    const gates = level <= 60 ? ['AND', 'OR', 'XOR'] : ['AND', 'OR', 'XOR', 'NAND', 'NOR'];
    const gate = gates[randInt(rng, 0, gates.length - 1)];
    const a = rng() > 0.45;
    const b = rng() > 0.45;
    const out = evalGate(gate, a, b);
    return {
      id,
      targetNumber,
      type: 'logic',
      categoryLabel: 'Boolean Gate',
      prompt: 'Evaluate the digital gate output:',
      expression: `${a ? '1' : '0'}  ${gate}  ${b ? '1' : '0'}  →  ?`,
      choices: boolChoices,
      correctValue: out ? '1' : '0',
      logicVisual: {
        gateLabel: gate,
        inputs: [
          { name: 'A', value: a },
          { name: 'B', value: b }
        ]
      }
    };
  }

  // Levels 151 - 700: 2-Stage & Inverted Cascaded Circuits
  if (level <= 700) {
    const isAdv = level > 400;
    const g1List = isAdv ? ['NAND', 'NOR', 'XOR', 'XNOR'] : ['AND', 'OR', 'XOR'];
    const g2List = isAdv ? ['XNOR', 'XOR', 'NAND', 'NOR'] : ['AND', 'XOR', 'NAND'];
    const g1 = g1List[randInt(rng, 0, g1List.length - 1)];
    const g2 = g2List[randInt(rng, 0, g2List.length - 1)];
    const a = rng() > 0.5;
    const b = rng() > 0.5;
    const c = rng() > 0.5;
    const thirdVal = isAdv ? !c : c;
    const stage1 = evalGate(g1, a, b);
    const out = evalGate(g2, stage1, thirdVal);
    return {
      id,
      targetNumber,
      type: 'logic',
      categoryLabel: isAdv ? 'Inverted Circuit Cascade' : 'Two-Stage Logic',
      prompt: 'Trace the signal through both logic gates:',
      expression: `(${a ? '1' : '0'} ${g1} ${b ? '1' : '0'})  ${g2}  ${
        isAdv ? `NOT(${c ? '1' : '0'})` : c ? '1' : '0'
      }  →  ?`,
      choices: boolChoices,
      correctValue: out ? '1' : '0',
      logicVisual: {
        gateLabel: g1,
        inputs: [
          { name: 'A', value: a },
          { name: 'B', value: b }
        ],
        secondaryGate: g2,
        thirdInput: { name: isAdv ? '¬C' : 'C', value: thirdVal }
      }
    };
  }

  // Levels 701 - 1000: Engineering 4-bit Bitwise Register Synthesis
  const x = randInt(rng, 5, 15);
  const y = randInt(rng, 3, 14);
  const mask = randInt(rng, 5, 13);
  const mode = targetNumber % 2;
  const result = mode === 0 ? (x & y) ^ mask : (x | y) ^ mask;
  const bx = x.toString(2).padStart(4, '0');
  const by = y.toString(2).padStart(4, '0');
  const bm = mask.toString(2).padStart(4, '0');
  const ansBin = result.toString(2).padStart(4, '0');

  const distractors = new Set<string>([ansBin]);
  let guard = 0;
  while (distractors.size < 4 && guard < 40) {
    guard++;
    const bit = 1 << randInt(rng, 0, 3);
    distractors.add((result ^ bit).toString(2).padStart(4, '0'));
  }
  while (distractors.size < 4) {
    distractors.add(randInt(rng, 0, 15).toString(2).padStart(4, '0'));
  }

  return {
    id,
    targetNumber,
    type: 'logic',
    categoryLabel: 'Bitwise Register Logic',
    prompt: 'Compute the 4-bit binary register output:',
    expression: `(${bx} ${mode === 0 ? '&' : '|'} ${by}) ⊕ ${bm} = ?`,
    choices: shuffle(Array.from(distractors), rng).map((bin, idx) => ({
      id: `bin-${idx}-${bin}`,
      label: bin,
      value: bin
    })),
    correctValue: ansBin
  };
}

function generateMemoryTarget(
  level: number,
  targetNumber: number,
  rng: () => number
): LevelTarget {
  const id = `mem-${level}-${targetNumber}-${Math.floor(rng() * 1e6)}`;
  const t = (level - 1) / 999;

  // Scale grid from 3x3 (Levels 1-400) to 4x4 (Levels 401-1000)
  const gridSize = level <= 400 ? 3 : 4;
  // Scale sequence length exponentially from 3 (Level 1) to 8 (Level 1000)
  const seqLength = Math.min(8, Math.max(3, Math.floor(3 + 5 * Math.pow(t, 0.78))));
  // Scale pulse interval from 520ms (Level 1) down to 220ms (Level 1000)
  const pulseMs = Math.max(220, Math.round(520 - 300 * Math.pow(t, 0.85)));

  const totalTiles = gridSize * gridSize;
  const sequence: number[] = [];
  for (let i = 0; i < seqLength; i++) {
    let nextTile = randInt(rng, 0, totalTiles - 1);
    if (sequence.length > 0 && nextTile === sequence[sequence.length - 1]) {
      nextTile = (nextTile + randInt(rng, 1, totalTiles - 1)) % totalTiles;
    }
    sequence.push(nextTile);
  }

  return {
    id,
    targetNumber,
    type: 'memory',
    categoryLabel: 'Synaptic Recall',
    prompt: `Observe the ${seqLength}-node pulse on the ${gridSize}×${gridSize} grid, then repeat it.`,
    memoryConfig: {
      gridSize,
      sequence,
      pulseMs
    }
  };
}

function serializeGrid(grid: number[][]): string {
  return grid.map((r) => r.join('')).join('|');
}

function xorGrids(g1: number[][], g2: number[][]): number[][] {
  return g1.map((row, r) => row.map((v, c) => (v !== g2[r][c] ? 1 : 0)));
}

function rotateGrid90(grid: number[][]): number[][] {
  const n = grid.length;
  const out = Array.from({ length: n }, () => Array(n).fill(0));
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      out[c][n - 1 - r] = grid[r][c];
    }
  }
  return out;
}

function randomGrid(size: number, activeCount: number, rng: () => number): number[][] {
  const cells = Array(size * size).fill(0);
  for (let i = 0; i < activeCount; i++) cells[i] = 1;
  const shuffled = shuffle(cells, rng);
  const grid: number[][] = [];
  for (let r = 0; r < size; r++) {
    grid.push(shuffled.slice(r * size, (r + 1) * size));
  }
  return grid;
}

function generateSpatialTarget(
  level: number,
  targetNumber: number,
  rng: () => number
): LevelTarget {
  const id = `sp-${level}-${targetNumber}-${Math.floor(rng() * 1e6)}`;

  // Levels 1 - 150: Rotational Orientation & Basic 2x2 Matrix Rotation
  if (level <= 150) {
    if (targetNumber % 2 === 1) {
      const start = [0, 90, 180, 270][randInt(rng, 0, 3)];
      const step = rng() > 0.5 ? 90 : -90;
      const angles = [0, 1, 2, 3].map((k) => (((start + k * step) % 360) + 360) % 360);
      const ans = String(angles[3]);
      return {
        id,
        targetNumber,
        type: 'spatial',
        categoryLabel: 'Spatial Rotation',
        prompt: 'Select the vector orientation that completes the sequence:',
        choices: shuffle([0, 90, 180, 270], rng).map((ang, i) => ({
          id: `ang-${i}`,
          label: `${ang}°`,
          value: String(ang),
          glyph: { kind: 'arrow', rotation: ang }
        })),
        correctValue: ans,
        spatialVisual: {
          ruleHint: 'Rotational Step',
          columns: 2,
          cells: [
            { kind: 'arrow', rotation: angles[0] },
            { kind: 'arrow', rotation: angles[1] },
            { kind: 'arrow', rotation: angles[2] },
            null
          ]
        }
      };
    }
  }

  // Levels 1 - 400 (alternate) or 151 - 400: 2x2 Dot Matrix Rotation (+ Inversion for >200)
  if (level <= 400) {
    let base = randomGrid(2, 2, rng);
    if (
      serializeGrid(base) === serializeGrid(rotateGrid90(base)) ||
      serializeGrid(base) === serializeGrid(rotateGrid90(rotateGrid90(base)))
    ) {
      base = [
        [1, 1],
        [0, 0]
      ];
    }
    const r1 = rotateGrid90(base);
    const r2 = rotateGrid90(r1);
    const r3 = rotateGrid90(r2);
    const invertFinal = level > 200;
    const ansGrid = invertFinal ? r3.map((row) => row.map((v) => 1 - v)) : r3;
    const correctKey = serializeGrid(ansGrid);

    const unique = new Map<string, number[][]>();
    unique.set(correctKey, ansGrid);
    const pool = [
      base,
      r1,
      r2,
      r3,
      base.map((r) => [...r].reverse()),
      r1.map((r) => r.map((v) => 1 - v)),
      [
        [1, 0],
        [0, 1]
      ],
      [
        [0, 1],
        [1, 0]
      ]
    ];
    for (const cand of shuffle(pool, rng)) {
      if (unique.size >= 4) break;
      const key = serializeGrid(cand);
      if (!unique.has(key)) unique.set(key, cand);
    }

    return {
      id,
      targetNumber,
      type: 'spatial',
      categoryLabel: invertFinal ? 'Rotation & Inversion' : 'Matrix Rotation',
      prompt: invertFinal
        ? 'Select the 4th tile (each step rotates 90° CW; final tile inverts):'
        : 'Select the tile that completes the 90° clockwise progression:',
      choices: shuffle(Array.from(unique.entries()), rng).map(([key, grid], idx) => ({
        id: `sp-${idx}`,
        label: `Tile ${idx + 1}`,
        value: key,
        glyph: { kind: 'dots', grid }
      })),
      correctValue: correctKey,
      spatialVisual: {
        ruleHint: invertFinal ? '90° CW + Final Invert' : '90° CW Matrix',
        columns: 2,
        cells: [
          { kind: 'dots', grid: base },
          { kind: 'dots', grid: r1 },
          { kind: 'dots', grid: r2 },
          null
        ]
      }
    };
  }

  // Levels 401 - 1000: 2x2 or 3x3 Row-Wise XOR Matrix Superposition
  const dim = level > 700 ? 3 : 2;
  const activeCount = level > 700 ? 4 : 2;
  const r1c1 = randomGrid(dim, activeCount, rng);
  const r1c2 = randomGrid(dim, activeCount, rng);
  const r1c3 = xorGrids(r1c1, r1c2);

  const r2c1 = randomGrid(dim, activeCount, rng);
  const r2c2 = randomGrid(dim, activeCount, rng);
  const r2c3 = xorGrids(r2c1, r2c2);

  const correctKey = serializeGrid(r2c3);
  const unique = new Map<string, number[][]>();
  unique.set(correctKey, r2c3);
  let guard = 0;
  while (unique.size < 4 && guard < 40) {
    guard++;
    const mutated = r2c3.map((row) => [...row]);
    const rr = randInt(rng, 0, dim - 1);
    const cc = randInt(rng, 0, dim - 1);
    mutated[rr][cc] = 1 - mutated[rr][cc];
    const key = serializeGrid(mutated);
    if (!unique.has(key)) unique.set(key, mutated);
  }

  return {
    id,
    targetNumber,
    type: 'spatial',
    categoryLabel: dim === 3 ? 'Tensor XOR Matrix' : 'Spatial XOR Superposition',
    prompt: 'Deduce the missing cell (Left ⊕ Middle = Right):',
    choices: shuffle(Array.from(unique.entries()), rng).map(([key, grid], idx) => ({
      id: `xor-${idx}`,
      label: `Matrix ${idx + 1}`,
      value: key,
      glyph: { kind: 'dots', grid }
    })),
    correctValue: correctKey,
    spatialVisual: {
      ruleHint: 'Left ⊕ Middle = Right',
      columns: 3,
      cells: [
        { kind: 'dots', grid: r1c1 },
        { kind: 'dots', grid: r1c2 },
        { kind: 'dots', grid: r1c3 },
        { kind: 'dots', grid: r2c1 },
        { kind: 'dots', grid: r2c2 },
        null
      ]
    }
  };
}

/**
 * Generates exactly 10 sequential targets for any level (1..1000).
 * Passing an attemptNonce ensures retries generate fresh variations at the same calibrated difficulty.
 */
export function generateTenTargetsForLevel(
  levelNumber: number,
  attemptNonce = 0
): LevelTarget[] {
  const boundedLevel = Math.max(1, Math.min(1000, levelNumber));
  const seed = boundedLevel * 104729 + attemptNonce * 7919 + 1337;
  const rng = mulberry32(seed);

  const cadence: TargetType[] = [
    'math',
    'logic',
    'memory',
    'spatial',
    'math',
    'logic',
    'spatial',
    'memory',
    'math',
    'logic'
  ];

  return cadence.map((type, idx) => {
    const targetNumber = idx + 1;
    if (type === 'math') return generateMathTarget(boundedLevel, targetNumber, rng);
    if (type === 'logic') return generateLogicTarget(boundedLevel, targetNumber, rng);
    if (type === 'memory') return generateMemoryTarget(boundedLevel, targetNumber, rng);
    return generateSpatialTarget(boundedLevel, targetNumber, rng);
  });
}
