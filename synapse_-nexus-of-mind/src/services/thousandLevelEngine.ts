/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  LevelTarget,
  PatternToken,
  ShapeGlyphConfig,
  ShapeKind,
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
    description: 'Linear equations, percentages, multi-step arithmetic, pattern & logic sequences, and 90° spatial logic.'
  },
  {
    id: 'intermediate',
    name: 'BUTE Synthesis',
    academicTag: 'Medium',
    levelStart: 151,
    levelEnd: 400,
    accentColor: '#22D3EE',
    description: 'Two-variable systems, geometric & quadratic progressions, multi-step odd-one-out deduction, and matrix parity.'
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
    description: 'Matrix determinants, simultaneous systems, logarithms, algebraic series deduction, and tensor lattices.'
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

function buildStringChoices(
  answer: string,
  distractors: string[],
  rng: () => number
): TargetChoice[] {
  const set = new Set<string>([answer]);
  for (const item of shuffle(distractors, rng)) {
    if (set.size >= 4) break;
    if (item && item !== answer) set.add(item);
  }
  let idx = 1;
  while (set.size < 4) {
    set.add(`${answer} (${idx++})`);
  }
  return shuffle(Array.from(set), rng).map((val, i) => ({
    id: `str-${i}-${val}`,
    label: val,
    value: val
  }));
}

function shapeKey(shape: ShapeGlyphConfig): string {
  return `${shape.kind}-${shape.fill || 'solid'}-${shape.rotation || 0}-${shape.count || 0}`;
}

const SHAPE_NAMES: Record<ShapeKind, string> = {
  circle: 'Circle',
  triangle: 'Triangle',
  square: 'Square',
  pentagon: 'Pentagon',
  hexagon: 'Hexagon',
  diamond: 'Diamond',
  star: 'Star',
  cross: 'Cross'
};

function buildShapeChoices(
  correct: { label: string; shape: ShapeGlyphConfig },
  distractors: { label: string; shape: ShapeGlyphConfig }[],
  rng: () => number
): { choices: TargetChoice[]; correctValue: string } {
  const correctKey = shapeKey(correct.shape);
  const map = new Map<string, { label: string; shape: ShapeGlyphConfig }>();
  map.set(correctKey, correct);

  for (const d of shuffle(distractors, rng)) {
    if (map.size >= 4) break;
    const k = shapeKey(d.shape);
    if (!map.has(k)) map.set(k, d);
  }

  const fallbackKinds: ShapeKind[] = [
    'circle',
    'triangle',
    'square',
    'pentagon',
    'hexagon',
    'diamond',
    'star',
    'cross'
  ];
  for (const fk of fallbackKinds) {
    if (map.size >= 4) break;
    const shape: ShapeGlyphConfig = { kind: fk, fill: 'solid' };
    const k = shapeKey(shape);
    if (!map.has(k)) {
      map.set(k, { label: SHAPE_NAMES[fk], shape });
    }
  }

  const choices = shuffle(Array.from(map.entries()), rng).map(([val, item], idx) => ({
    id: `shp-${idx}-${val}`,
    label: item.label,
    value: val,
    shape: item.shape
  }));

  return { choices, correctValue: correctKey };
}

function generateSeriesTarget(
  level: number,
  targetNumber: number,
  rng: () => number,
  id: string
): LevelTarget {
  // BAND 1 (Levels 1 - 150): Beginner / Class 7-8
  if (level <= 150) {
    const variant = randInt(rng, 0, 3);

    if (variant === 0) {
      if (level <= 50 && rng() < 0.55) {
        // Simple arithmetic progression
        const start = randInt(rng, 2, 18);
        const step = randInt(rng, 2, 9);
        const seq = [0, 1, 2, 3].map((i) => start + i * step);
        const ans = start + 4 * step;
        return {
          id,
          targetNumber,
          type: 'logic',
          categoryLabel: 'Pattern & Logic Sequence',
          prompt: 'Find the missing number in the sequence:',
          choices: buildNumericChoices(ans, [-step, step, -2, 2, 4, -4], rng),
          correctValue: String(ans),
          patternVisual: {
            subLabel: 'Number Series',
            mode: 'series',
            tokens: [
              ...seq.map((n) => ({ text: String(n) })),
              { text: '?', isMissing: true }
            ]
          }
        };
      } else {
        // Increasing-difference series (e.g., 2, 6, 12, 20, ?)
        const a0 = randInt(rng, 1, 8);
        const d0 = randInt(rng, 2, 5);
        const stepInc = randInt(rng, 1, 3);
        const seq = [a0];
        for (let i = 0; i < 3; i++) {
          seq.push(seq[seq.length - 1] + d0 + i * stepInc);
        }
        const ans = seq[seq.length - 1] + d0 + 3 * stepInc;
        return {
          id,
          targetNumber,
          type: 'logic',
          categoryLabel: 'Pattern & Logic Sequence',
          prompt: 'Study how the gap grows and find the missing number:',
          choices: buildNumericChoices(ans, [-stepInc, stepInc, -2, 2, -4, 4], rng),
          correctValue: String(ans),
          patternVisual: {
            subLabel: 'Number Series',
            mode: 'series',
            tokens: [
              ...seq.map((n) => ({ text: String(n) })),
              { text: '?', isMissing: true }
            ]
          }
        };
      }
    }

    if (variant === 1) {
      // Geometric doubling / tripling series
      const ratio = level <= 80 ? 2 : randInt(rng, 2, 3);
      const start = randInt(rng, 1, ratio === 2 ? 6 : 3);
      const seq = [0, 1, 2, 3].map((i) => start * Math.pow(ratio, i));
      const ans = start * Math.pow(ratio, 4);
      return {
        id,
        targetNumber,
        type: 'logic',
        categoryLabel: 'Pattern & Logic Sequence',
        prompt: 'Find the next number in the multiplying pattern:',
        choices: buildNumericChoices(
          ans,
          [-start * 2, start * 2, -4, 4, -8, 8],
          rng
        ),
        correctValue: String(ans),
        patternVisual: {
          subLabel: 'Number Series',
          mode: 'series',
          tokens: [
            ...seq.map((n) => ({ text: String(n) })),
            { text: '?', isMissing: true }
          ]
        }
      };
    }

    if (variant === 2) {
      // Visual Symbol / Shape Pattern Series
      const useSidesRule = rng() < 0.5;
      if (useSidesRule) {
        // Increasing polygon sides with alternating solid/outline
        const ordered: ShapeKind[] = ['triangle', 'square', 'pentagon', 'hexagon'];
        const startSolid = rng() < 0.5;
        const seqShapes: ShapeGlyphConfig[] = ordered.slice(0, 3).map((kind, idx) => ({
          kind,
          fill: (idx % 2 === 0) === startSolid ? 'solid' : 'outline'
        }));
        const ansFill: 'solid' | 'outline' = (3 % 2 === 0) === startSolid ? 'solid' : 'outline';
        const ansShape: ShapeGlyphConfig = { kind: 'hexagon', fill: ansFill };
        const { choices, correctValue } = buildShapeChoices(
          { label: `${ansFill === 'solid' ? 'Solid' : 'Outline'} Hexagon`, shape: ansShape },
          [
            {
              label: `${ansFill === 'solid' ? 'Outline' : 'Solid'} Hexagon`,
              shape: { kind: 'hexagon', fill: ansFill === 'solid' ? 'outline' : 'solid' }
            },
            { label: `${ansFill === 'solid' ? 'Solid' : 'Outline'} Pentagon`, shape: { kind: 'pentagon', fill: ansFill } },
            { label: `${ansFill === 'solid' ? 'Solid' : 'Outline'} Circle`, shape: { kind: 'circle', fill: ansFill } }
          ],
          rng
        );
        return {
          id,
          targetNumber,
          type: 'logic',
          categoryLabel: 'Pattern & Logic Sequence',
          prompt: 'Follow the shape sides and fill pattern to complete the series:',
          choices,
          correctValue,
          patternVisual: {
            subLabel: 'Symbol Series',
            mode: 'series',
            tokens: [
              ...seqShapes.map((shape) => ({ shape })),
              { isMissing: true }
            ]
          }
        };
      } else {
        // 3-shape repeating cycle: A, B, C, A, B, ?
        const pool = shuffle<ShapeKind>(
          ['circle', 'triangle', 'square', 'diamond', 'star', 'hexagon'],
          rng
        );
        const [s1, s2, s3, s4] = pool;
        const cycle = [s1, s2, s3, s1, s2];
        const ansShape: ShapeGlyphConfig = { kind: s3, fill: 'solid' };
        const { choices, correctValue } = buildShapeChoices(
          { label: SHAPE_NAMES[s3], shape: ansShape },
          [
            { label: SHAPE_NAMES[s1], shape: { kind: s1, fill: 'solid' } },
            { label: SHAPE_NAMES[s2], shape: { kind: s2, fill: 'solid' } },
            { label: SHAPE_NAMES[s4], shape: { kind: s4, fill: 'solid' } }
          ],
          rng
        );
        return {
          id,
          targetNumber,
          type: 'logic',
          categoryLabel: 'Pattern & Logic Sequence',
          prompt: 'Which symbol completes the repeating sequence?',
          choices,
          correctValue,
          patternVisual: {
            subLabel: 'Symbol Series',
            mode: 'series',
            tokens: [
              ...cycle.map((kind) => ({ shape: { kind, fill: 'solid' as const } })),
              { isMissing: true }
            ]
          }
        };
      }
    }

    // Variant 3: Squares + offset or increasing dot-count shape series
    const offset = level <= 60 ? 0 : randInt(rng, 1, 3);
    const baseN = randInt(rng, 1, 4);
    const seq = [0, 1, 2, 3].map((i) => (baseN + i) * (baseN + i) + offset);
    const ans = (baseN + 4) * (baseN + 4) + offset;
    return {
      id,
      targetNumber,
      type: 'logic',
      categoryLabel: 'Pattern & Logic Sequence',
      prompt: 'Deduce the square-number pattern and find the next term:',
      choices: buildNumericChoices(ans, [-4, 4, -6, 6, -2, 2], rng),
      correctValue: String(ans),
      patternVisual: {
        subLabel: 'Number Series',
        mode: 'series',
        tokens: [
          ...seq.map((n) => ({ text: String(n) })),
          { text: '?', isMissing: true }
        ]
      }
    };
  }

  // BAND 2 (Levels 151 - 400): Medium
  if (level <= 400) {
    const variant = randInt(rng, 0, 3);

    if (variant === 0) {
      // Quadratic series: a*n^2 + b
      const a = randInt(rng, 1, 3);
      const b = randInt(rng, -2, 5);
      const startN = randInt(rng, 1, 3);
      const seq = [0, 1, 2, 3].map((i) => a * (startN + i) * (startN + i) + b);
      const ans = a * (startN + 4) * (startN + 4) + b;
      return {
        id,
        targetNumber,
        type: 'logic',
        categoryLabel: 'Pattern & Logic Sequence',
        prompt: 'Find the missing value in the quadratic number series:',
        choices: buildNumericChoices(ans, [-5, 5, -3, 3, -8, 8], rng),
        correctValue: String(ans),
        patternVisual: {
          subLabel: 'Number Series',
          mode: 'series',
          tokens: [
            ...seq.map((n) => ({ text: String(n) })),
            { text: '?', isMissing: true }
          ]
        }
      };
    }

    if (variant === 1) {
      // Fibonacci-like additive recurrence
      const t1 = randInt(rng, 1, 6);
      const t2 = randInt(rng, t1 + 1, t1 + 7);
      const t3 = t1 + t2;
      const t4 = t2 + t3;
      const t5 = t3 + t4;
      const ans = t4 + t5;
      return {
        id,
        targetNumber,
        type: 'logic',
        categoryLabel: 'Pattern & Logic Sequence',
        prompt: 'Each term combines the two before it. Find the next number:',
        choices: buildNumericChoices(ans, [-3, 3, -5, 5, -2, 2], rng),
        correctValue: String(ans),
        patternVisual: {
          subLabel: 'Number Series',
          mode: 'series',
          tokens: [
            ...[t1, t2, t3, t4, t5].map((n) => ({ text: String(n) })),
            { text: '?', isMissing: true }
          ]
        }
      };
    }

    if (variant === 2) {
      // Alternating interleaved dual series: odd indices +d1, even indices +d2
      const a = randInt(rng, 4, 15);
      const b = randInt(rng, 20, 40);
      const d1 = randInt(rng, 3, 8);
      const d2 = -randInt(rng, 2, 6);
      const seq = [a, b, a + d1, b + d2, a + 2 * d1];
      const ans = b + 2 * d2;
      return {
        id,
        targetNumber,
        type: 'logic',
        categoryLabel: 'Pattern & Logic Sequence',
        prompt: 'Trace the alternating pattern to find the missing term:',
        choices: buildNumericChoices(ans, [d2, -d2, 2, -2, 4, -4], rng),
        correctValue: String(ans),
        patternVisual: {
          subLabel: 'Alternating Series',
          mode: 'series',
          tokens: [
            ...seq.map((n) => ({ text: String(n) })),
            { text: '?', isMissing: true }
          ]
        }
      };
    }

    // Variant 3: Dual-rule symbol series (rotation +90 deg & dot count 1->2->3->4)
    const kindPool: ShapeKind[] = ['triangle', 'pentagon'];
    const baseKind = kindPool[randInt(rng, 0, kindPool.length - 1)];
    const startRot = randInt(rng, 0, 3) * 90;
    const seqShapes: ShapeGlyphConfig[] = [0, 1, 2].map((i) => ({
      kind: baseKind,
      fill: 'outline',
      rotation: (startRot + i * 90) % 360,
      count: i + 1
    }));
    const ansRot = (startRot + 3 * 90) % 360;
    const ansShape: ShapeGlyphConfig = {
      kind: baseKind,
      fill: 'outline',
      rotation: ansRot,
      count: 4
    };
    const { choices, correctValue } = buildShapeChoices(
      { label: `${ansRot}° · 4 dots`, shape: ansShape },
      [
        {
          label: `${(ansRot + 90) % 360}° · 4 dots`,
          shape: { kind: baseKind, fill: 'outline', rotation: (ansRot + 90) % 360, count: 4 }
        },
        {
          label: `${ansRot}° · 3 dots`,
          shape: { kind: baseKind, fill: 'outline', rotation: ansRot, count: 3 }
        },
        {
          label: `${(ansRot + 180) % 360}° · 5 dots`,
          shape: { kind: baseKind, fill: 'outline', rotation: (ansRot + 180) % 360, count: 5 }
        }
      ],
      rng
    );
    return {
      id,
      targetNumber,
      type: 'logic',
      categoryLabel: 'Pattern & Logic Sequence',
      prompt: 'Track both the rotation and dot count to predict the 4th symbol:',
      choices,
      correctValue,
      patternVisual: {
        subLabel: 'Symbol Series',
        mode: 'series',
        tokens: [
          ...seqShapes.map((shape) => ({ shape })),
          { isMissing: true }
        ]
      }
    };
  }

  // BAND 3 (Levels 401 - 700): Advanced / KUET-RUET Aptitude
  if (level <= 700) {
    const variant = randInt(rng, 0, 3);

    if (variant === 0) {
      // Multiply-and-add recurrence: x_{n+1} = k*x_n + c
      const k = randInt(rng, 2, 3);
      const c = randInt(rng, 1, 5) * (rng() < 0.35 ? -1 : 1);
      const x0 = randInt(rng, 2, 6);
      const seq = [x0];
      for (let i = 0; i < 3; i++) {
        seq.push(seq[seq.length - 1] * k + c);
      }
      const ans = seq[seq.length - 1] * k + c;
      return {
        id,
        targetNumber,
        type: 'logic',
        categoryLabel: 'Pattern & Logic Sequence',
        prompt: 'Identify the multiply-and-shift rule to find the next term:',
        choices: buildNumericChoices(ans, [-2, 2, -4, 4, -c * 2 || 6, c * 2 || -6], rng),
        correctValue: String(ans),
        patternVisual: {
          subLabel: 'Recurrence Series',
          mode: 'series',
          tokens: [
            ...seq.map((n) => ({ text: String(n) })),
            { text: '?', isMissing: true }
          ]
        }
      };
    }

    if (variant === 1) {
      // Prime-difference series: gaps are consecutive primes (2, 3, 5, 7, 11)
      const primes = [2, 3, 5, 7, 11, 13];
      const offset = randInt(rng, 0, 1);
      const start = randInt(rng, 3, 19);
      const seq = [start];
      for (let i = 0; i < 4; i++) {
        seq.push(seq[seq.length - 1] + primes[i + offset]);
      }
      const ans = seq[seq.length - 1] + primes[4 + offset];
      return {
        id,
        targetNumber,
        type: 'logic',
        categoryLabel: 'Pattern & Logic Sequence',
        prompt: 'Examine the prime-number gaps to continue the series:',
        choices: buildNumericChoices(ans, [-2, 2, -4, 4, -1, 1], rng),
        correctValue: String(ans),
        patternVisual: {
          subLabel: 'Prime-Gap Series',
          mode: 'series',
          tokens: [
            ...seq.map((n) => ({ text: String(n) })),
            { text: '?', isMissing: true }
          ]
        }
      };
    }

    if (variant === 2) {
      // Alphanumeric Symbol + Number Series: e.g. A2, C6, F12, J20, ?
      const startCode = randInt(rng, 0, 4); // A..E
      const stepBase = randInt(rng, 1, 2);
      const letterPositions = [startCode];
      for (let i = 0; i < 4; i++) {
        letterPositions.push(letterPositions[letterPositions.length - 1] + stepBase + i);
      }
      const numBase = randInt(rng, 1, 3);
      const tokens: PatternToken[] = [];
      for (let i = 0; i < 4; i++) {
        const ch = String.fromCharCode(65 + (letterPositions[i] % 26));
        const val = (numBase + i) * (numBase + i + 1);
        tokens.push({ text: `${ch}${val}` });
      }
      tokens.push({ text: '?', isMissing: true });

      const ansChar = String.fromCharCode(65 + (letterPositions[4] % 26));
      const prevChar = String.fromCharCode(65 + ((letterPositions[4] - 1) % 26));
      const nextChar = String.fromCharCode(65 + ((letterPositions[4] + 1) % 26));
      const ansNum = (numBase + 4) * (numBase + 5);
      const ansStr = `${ansChar}${ansNum}`;

      return {
        id,
        targetNumber,
        type: 'logic',
        categoryLabel: 'Pattern & Logic Sequence',
        prompt: 'Decode both the letter jump and numeric rule:',
        choices: buildStringChoices(
          ansStr,
          [
            `${prevChar}${ansNum}`,
            `${ansChar}${ansNum - 2}`,
            `${nextChar}${ansNum + 2}`,
            `${ansChar}${ansNum + 4}`
          ],
          rng
        ),
        correctValue: ansStr,
        patternVisual: {
          subLabel: 'Alphanumeric Series',
          mode: 'series',
          tokens
        }
      };
    }

    // Variant 3: Cubic sequence n^3 - n + c or n^3 + n + c
    const sign = rng() < 0.5 ? -1 : 1;
    const c = randInt(rng, 0, 4);
    const nStart = randInt(rng, 1, 3);
    const seq = [0, 1, 2, 3].map((i) => {
      const n = nStart + i;
      return n * n * n + sign * n + c;
    });
    const nf = nStart + 4;
    const ans = nf * nf * nf + sign * nf + c;
    return {
      id,
      targetNumber,
      type: 'logic',
      categoryLabel: 'Pattern & Logic Sequence',
      prompt: 'Find the 5th term in this higher-order sequence:',
      choices: buildNumericChoices(ans, [-6, 6, -10, 10, -4, 4], rng),
      correctValue: String(ans),
      patternVisual: {
        subLabel: 'Cubic Series',
        mode: 'series',
        tokens: [
          ...seq.map((n) => ({ text: String(n) })),
          { text: '?', isMissing: true }
        ]
      }
    };
  }

  // BAND 4 (Levels 701 - 1000): Very Advanced / BUET Engineering Elite
  const variant = randInt(rng, 0, 3);

  if (variant === 0) {
    // Index-weighted recurrence: x_n = (n + 1)*x_{n-1} + c
    const c = randInt(rng, 1, 3) * (rng() < 0.4 ? -1 : 1);
    const x1 = randInt(rng, 2, 4);
    const seq = [x1];
    for (let step = 2; step <= 4; step++) {
      seq.push(seq[seq.length - 1] * step + c);
    }
    const ans = seq[seq.length - 1] * 5 + c;
    return {
      id,
      targetNumber,
      type: 'logic',
      categoryLabel: 'Pattern & Logic Sequence',
      prompt: 'Solve the index-weighted recurrence sequence:',
      choices: buildNumericChoices(ans, [-5, 5, -10, 10, -2, 2], rng),
      correctValue: String(ans),
      patternVisual: {
        subLabel: 'Recurrence Series',
        mode: 'series',
        tokens: [
          ...seq.map((n) => ({ text: String(n) })),
          { text: '?', isMissing: true }
        ]
      }
    };
  }

  if (variant === 1) {
    // 3rd-order polynomial: a*n^3 + b*n^2 + c*n
    const a = randInt(rng, 1, 2);
    const b = randInt(rng, 1, 3);
    const c = randInt(rng, -2, 3);
    const seq = [1, 2, 3, 4].map((n) => a * n * n * n + b * n * n + c * n);
    const ans = a * 125 + b * 25 + c * 5;
    return {
      id,
      targetNumber,
      type: 'logic',
      categoryLabel: 'Pattern & Logic Sequence',
      prompt: 'Analyze the 3rd-order differences to find the 5th term:',
      choices: buildNumericChoices(ans, [-6, 6, -12, 12, -4, 4], rng),
      correctValue: String(ans),
      patternVisual: {
        subLabel: 'Polynomial Series',
        mode: 'series',
        tokens: [
          ...seq.map((n) => ({ text: String(n) })),
          { text: '?', isMissing: true }
        ]
      }
    };
  }

  if (variant === 2) {
    // Algebraic expression series
    if (rng() < 0.5) {
      // Doubling algebraic linear series: k*2^i x + (2^i - 1)*c
      const k = randInt(rng, 1, 2);
      const c = randInt(rng, 1, 3);
      const formatExpr = (coeff: number, constant: number) =>
        `${coeff === 1 ? '' : coeff}x + ${constant}`;
      const tokens: PatternToken[] = [0, 1, 2, 3].map((i) => ({
        text: formatExpr(k * Math.pow(2, i), Math.pow(2, i) * c - c + 1)
      }));
      tokens.push({ text: '?', isMissing: true });
      const ansCoeff = k * 16;
      const ansConst = 16 * c - c + 1;
      const ans = formatExpr(ansCoeff, ansConst);
      return {
        id,
        targetNumber,
        type: 'logic',
        categoryLabel: 'Pattern & Logic Sequence',
        prompt: 'Identify the algebraic scaling rule for the next term:',
        choices: buildStringChoices(
          ans,
          [
            formatExpr(ansCoeff, ansConst - 2),
            formatExpr(ansCoeff / 2 + k * 4, ansConst),
            formatExpr(ansCoeff, ansConst + 2),
            formatExpr(ansCoeff + k * 2, ansConst + 1)
          ],
          rng
        ),
        correctValue: ans,
        patternVisual: {
          subLabel: 'Algebraic Series',
          mode: 'series',
          tokens
        }
      };
    } else {
      // Fibonacci coefficient algebraic series: (a+b), (2a+3b), (3a+5b), (5a+8b), ? -> (8a+13b)
      const shift = randInt(rng, 0, 2);
      const fibA = [1, 2, 3, 5, 8, 13, 21];
      const fibB = [1, 3, 5, 8, 13, 21, 34];
      const formatAB = (ca: number, cb: number) =>
        `${ca === 1 ? '' : ca}a + ${cb === 1 ? '' : cb}b`;
      const tokens: PatternToken[] = [0, 1, 2, 3].map((i) => ({
        text: formatAB(fibA[i + shift], fibB[i + shift])
      }));
      tokens.push({ text: '?', isMissing: true });
      const ca = fibA[4 + shift];
      const cb = fibB[4 + shift];
      const ans = formatAB(ca, cb);
      return {
        id,
        targetNumber,
        type: 'logic',
        categoryLabel: 'Pattern & Logic Sequence',
        prompt: 'Follow the coefficient recurrence to find the next expression:',
        choices: buildStringChoices(
          ans,
          [
            formatAB(ca - 1, cb),
            formatAB(ca, cb - 2),
            formatAB(ca + 1, cb + 2),
            formatAB(ca, cb + 3)
          ],
          rng
        ),
        correctValue: ans,
        patternVisual: {
          subLabel: 'Algebraic Series',
          mode: 'series',
          tokens
        }
      };
    }
  }

  // Variant 3: Engineering fraction series: (n^2 + k) / base^n
  const k = randInt(rng, 1, 3);
  const base = randInt(rng, 2, 3);
  const tokens: PatternToken[] = [1, 2, 3, 4].map((n) => ({
    text: `${n * n + k}/${Math.pow(base, n)}`
  }));
  tokens.push({ text: '?', isMissing: true });
  const ansNum = 25 + k;
  const ansDen = Math.pow(base, 5);
  const ans = `${ansNum}/${ansDen}`;
  return {
    id,
    targetNumber,
    type: 'logic',
    categoryLabel: 'Pattern & Logic Sequence',
    prompt: 'Deduce both the numerator and denominator rules:',
    choices: buildStringChoices(
      ans,
      [
        `${ansNum - 2}/${ansDen}`,
        `${ansNum + 2}/${ansDen}`,
        `${ansNum}/${ansDen / base}`,
        `${ansNum - 1}/${ansDen * base}`
      ],
      rng
    ),
    correctValue: ans,
    patternVisual: {
      subLabel: 'Fractional Series',
      mode: 'series',
      tokens
    }
  };
}

function generateOddOneOutTarget(
  level: number,
  targetNumber: number,
  rng: () => number,
  id: string
): LevelTarget {
  // BAND 1 (Levels 1 - 150): Beginner / Class 7-8
  if (level <= 150) {
    const variant = randInt(rng, 0, 3);

    if (variant === 0) {
      // Visual Odd One Out: 3 straight polygons vs 1 circle, OR 3 solid vs 1 outline
      if (rng() < 0.5) {
        const polyPool = shuffle<ShapeKind>(
          ['triangle', 'square', 'pentagon', 'hexagon', 'diamond'],
          rng
        );
        const { choices, correctValue } = buildShapeChoices(
          { label: 'Circle', shape: { kind: 'circle', fill: 'solid' } },
          [
            { label: SHAPE_NAMES[polyPool[0]], shape: { kind: polyPool[0], fill: 'solid' } },
            { label: SHAPE_NAMES[polyPool[1]], shape: { kind: polyPool[1], fill: 'solid' } },
            { label: SHAPE_NAMES[polyPool[2]], shape: { kind: polyPool[2], fill: 'solid' } }
          ],
          rng
        );
        return {
          id,
          targetNumber,
          type: 'logic',
          categoryLabel: 'Pattern & Logic Sequence',
          prompt: 'Odd One Out: Which shape does NOT belong with the others?',
          choices,
          correctValue,
          patternVisual: {
            subLabel: 'Visual Deduction',
            mode: 'odd_one_out'
          }
        };
      } else {
        const kinds = shuffle<ShapeKind>(
          ['circle', 'triangle', 'square', 'pentagon', 'hexagon', 'diamond'],
          rng
        );
        const { choices, correctValue } = buildShapeChoices(
          { label: SHAPE_NAMES[kinds[0]], shape: { kind: kinds[0], fill: 'outline' } },
          [
            { label: SHAPE_NAMES[kinds[1]], shape: { kind: kinds[1], fill: 'solid' } },
            { label: SHAPE_NAMES[kinds[2]], shape: { kind: kinds[2], fill: 'solid' } },
            { label: SHAPE_NAMES[kinds[3]], shape: { kind: kinds[3], fill: 'solid' } }
          ],
          rng
        );
        return {
          id,
          targetNumber,
          type: 'logic',
          categoryLabel: 'Pattern & Logic Sequence',
          prompt: 'Odd One Out: Select the shape that breaks the visual rule:',
          choices,
          correctValue,
          patternVisual: {
            subLabel: 'Visual Deduction',
            mode: 'odd_one_out'
          }
        };
      }
    }

    if (variant === 1) {
      // Multiples of k (all 4 even so no parity ambiguity!)
      const k = [3, 5, 7][randInt(rng, 0, 2)];
      const evenMults = shuffle([2, 4, 6, 8, 10], rng).slice(0, 3).map((m) => m * k);
      let outlier = evenMults[0] + 2;
      while (outlier % k === 0 || evenMults.includes(outlier)) {
        outlier += 2;
      }
      return {
        id,
        targetNumber,
        type: 'logic',
        categoryLabel: 'Pattern & Logic Sequence',
        prompt: 'Odd One Out: Three numbers share a factor rule. Pick the outlier:',
        choices: buildStringChoices(
          String(outlier),
          evenMults.map(String),
          rng
        ),
        correctValue: String(outlier),
        patternVisual: {
          subLabel: 'Odd One Out',
          mode: 'odd_one_out'
        }
      };
    }

    if (variant === 2) {
      if (level <= 75) {
        // 3 even numbers vs 1 odd number
        const evens = shuffle([12, 14, 18, 22, 26, 30, 34], rng).slice(0, 3);
        const oddOutlier = [15, 21, 25, 27][randInt(rng, 0, 3)];
        return {
          id,
          targetNumber,
          type: 'logic',
          categoryLabel: 'Pattern & Logic Sequence',
          prompt: 'Odd One Out: Which number does not fit the group?',
          choices: buildStringChoices(String(oddOutlier), evens.map(String), rng),
          correctValue: String(oddOutlier),
          patternVisual: {
            subLabel: 'Odd One Out',
            mode: 'odd_one_out'
          }
        };
      } else {
        // L76-150: 3 perfect squares vs 1 non-square (or 3 primes vs 1 odd composite)
        if (rng() < 0.5) {
          const squares = shuffle([9, 16, 25, 36, 49, 64, 81], rng).slice(0, 3);
          const nonSquare = [18, 28, 32, 42, 50][randInt(rng, 0, 4)];
          return {
            id,
            targetNumber,
            type: 'logic',
            categoryLabel: 'Pattern & Logic Sequence',
            prompt: 'Odd One Out: Which number does not share the property of the others?',
            choices: buildStringChoices(String(nonSquare), squares.map(String), rng),
            correctValue: String(nonSquare),
            patternVisual: {
              subLabel: 'Odd One Out',
              mode: 'odd_one_out'
            }
          };
        } else {
          const primes = shuffle([11, 13, 17, 19, 23, 29, 31], rng).slice(0, 3);
          const composite = [15, 21, 25, 27, 33, 35][randInt(rng, 0, 5)];
          return {
            id,
            targetNumber,
            type: 'logic',
            categoryLabel: 'Pattern & Logic Sequence',
            prompt: 'Odd One Out: Three numbers are prime. Pick the composite outlier:',
            choices: buildStringChoices(String(composite), primes.map(String), rng),
            correctValue: String(composite),
            patternVisual: {
              subLabel: 'Odd One Out',
              mode: 'odd_one_out'
            }
          };
        }
      }
    }

    // Variant 3: Visual Side-to-Dot Rule (Triangle=3, Square=4, Pentagon=5, Hexagon=6 vs mismatch)
    const validPairs: { kind: ShapeKind; sides: number }[] = [
      { kind: 'triangle', sides: 3 },
      { kind: 'square', sides: 4 },
      { kind: 'pentagon', sides: 5 },
      { kind: 'hexagon', sides: 6 }
    ];
    const picked = shuffle(validPairs, rng);
    const broken = picked[0];
    const wrongDots = broken.sides === 6 ? 4 : broken.sides + 1;
    const { choices, correctValue } = buildShapeChoices(
      {
        label: `${SHAPE_NAMES[broken.kind]} · ${wrongDots}`,
        shape: { kind: broken.kind, fill: 'outline', count: wrongDots }
      },
      picked.slice(1).map((p) => ({
        label: `${SHAPE_NAMES[p.kind]} · ${p.sides}`,
        shape: { kind: p.kind, fill: 'outline', count: p.sides }
      })),
      rng
    );
    return {
      id,
      targetNumber,
      type: 'logic',
      categoryLabel: 'Pattern & Logic Sequence',
      prompt: 'Odd One Out: Match each polygon to its dot count and find the mismatch:',
      choices,
      correctValue,
      patternVisual: {
        subLabel: 'Visual Deduction',
        mode: 'odd_one_out'
      }
    };
  }

  // BAND 2 (Levels 151 - 400): Medium
  if (level <= 400) {
    const variant = randInt(rng, 0, 3);

    if (variant === 0) {
      // Perfect Cubes vs non-cube
      const cubes = shuffle([8, 27, 64, 125, 216], rng).slice(0, 3);
      const nonCube = [18, 36, 48, 81, 100][randInt(rng, 0, 4)];
      return {
        id,
        targetNumber,
        type: 'logic',
        categoryLabel: 'Pattern & Logic Sequence',
        prompt: 'Odd One Out: Which number does not follow the power rule?',
        choices: buildStringChoices(String(nonCube), cubes.map(String), rng),
        correctValue: String(nonCube),
        patternVisual: {
          subLabel: 'Odd One Out',
          mode: 'odd_one_out'
        }
      };
    }

    if (variant === 1) {
      // Digit-sum invariant (3 numbers have same digit sum S, 1 outlier has S+2)
      const groups: { sum: number; nums: number[]; outlier: number }[] = [
        { sum: 9, nums: [18, 27, 45, 63, 72], outlier: 52 },
        { sum: 10, nums: [19, 28, 37, 46, 64, 73], outlier: 44 },
        { sum: 11, nums: [29, 38, 47, 56, 74, 83], outlier: 54 }
      ];
      const g = groups[randInt(rng, 0, groups.length - 1)];
      const picked = shuffle(g.nums, rng).slice(0, 3);
      return {
        id,
        targetNumber,
        type: 'logic',
        categoryLabel: 'Pattern & Logic Sequence',
        prompt: 'Odd One Out: Look at the digits of each number to spot the outlier:',
        choices: buildStringChoices(String(g.outlier), picked.map(String), rng),
        correctValue: String(g.outlier),
        patternVisual: {
          subLabel: 'Digit-Rule Deduction',
          mode: 'odd_one_out'
        }
      };
    }

    if (variant === 2) {
      // Number Pair Rule: (x → m*x + c)
      const m = randInt(rng, 2, 4);
      const c = randInt(rng, 1, 6);
      const xs = shuffle([2, 3, 4, 5, 6, 7, 8], rng).slice(0, 4);
      const validPairs = xs.slice(0, 3).map((x) => `${x} → ${m * x + c}`);
      const brokenPair = `${xs[3]} → ${m * xs[3] + c + (rng() < 0.5 ? 2 : -2)}`;
      return {
        id,
        targetNumber,
        type: 'logic',
        categoryLabel: 'Pattern & Logic Sequence',
        prompt: 'Odd One Out: Three pairs follow the same rule. Which pair breaks it?',
        choices: buildStringChoices(brokenPair, validPairs, rng),
        correctValue: brokenPair,
        patternVisual: {
          subLabel: 'Rule Deduction',
          mode: 'odd_one_out'
        }
      };
    }

    // Variant 3: Visual orientation consistency (3 triangles upright vs 1 rotated 180°)
    const targetRot = rng() < 0.5 ? 0 : 90;
    const wrongRot = (targetRot + 180) % 360;
    const counts = shuffle([1, 2, 3, 4], rng);
    const { choices, correctValue } = buildShapeChoices(
      {
        label: `Triangle · ${counts[0]}`,
        shape: { kind: 'triangle', fill: 'outline', rotation: wrongRot, count: counts[0] }
      },
      [1, 2, 3].map((i) => ({
        label: `Triangle · ${counts[i]}`,
        shape: { kind: 'triangle', fill: 'outline', rotation: targetRot, count: counts[i] }
      })),
      rng
    );
    return {
      id,
      targetNumber,
      type: 'logic',
      categoryLabel: 'Pattern & Logic Sequence',
      prompt: 'Odd One Out: Three triangles point the same way. Pick the outlier:',
      choices,
      correctValue,
      patternVisual: {
        subLabel: 'Visual Deduction',
        mode: 'odd_one_out'
      }
    };
  }

  // BAND 3 (Levels 401 - 700): Advanced / KUET-RUET Aptitude
  if (level <= 700) {
    const variant = randInt(rng, 0, 3);

    if (variant === 0) {
      // (n^2 - 1) numbers vs outlier
      const valid = shuffle([8, 15, 24, 35, 48, 63], rng).slice(0, 3);
      const outlier = [12, 20, 26, 30, 42][randInt(rng, 0, 4)];
      return {
        id,
        targetNumber,
        type: 'logic',
        categoryLabel: 'Pattern & Logic Sequence',
        prompt: 'Odd One Out: Three numbers are one less than a square. Find the outlier:',
        choices: buildStringChoices(String(outlier), valid.map(String), rng),
        correctValue: String(outlier),
        patternVisual: {
          subLabel: 'Odd One Out',
          mode: 'odd_one_out'
        }
      };
    }

    if (variant === 1) {
      // Quadratic Pair Rule: (x → x^2 + x)
      const xs = shuffle([3, 4, 5, 6, 7, 8], rng).slice(0, 4);
      const validPairs = xs.slice(0, 3).map((x) => `${x} → ${x * x + x}`);
      const bx = xs[3];
      const brokenPair = `${bx} → ${bx * bx + bx + (rng() < 0.5 ? 2 : -2)}`;
      return {
        id,
        targetNumber,
        type: 'logic',
        categoryLabel: 'Pattern & Logic Sequence',
        prompt: 'Odd One Out: Identify the pair that violates the mapping rule:',
        choices: buildStringChoices(brokenPair, validPairs, rng),
        correctValue: brokenPair,
        patternVisual: {
          subLabel: 'Algebraic Deduction',
          mode: 'odd_one_out'
        }
      };
    }

    if (variant === 2) {
      // Divisibility by m (mixed parity)
      const m = [7, 9, 11][randInt(rng, 0, 2)];
      const mults = shuffle([2, 3, 4, 5, 6, 7], rng).slice(0, 3).map((k) => k * m);
      let outlier = mults[0] + 3;
      while (outlier % m === 0 || mults.includes(outlier)) {
        outlier += 2;
      }
      return {
        id,
        targetNumber,
        type: 'logic',
        categoryLabel: 'Pattern & Logic Sequence',
        prompt: 'Odd One Out: Three numbers share a common divisor. Find the exception:',
        choices: buildStringChoices(String(outlier), mults.map(String), rng),
        correctValue: String(outlier),
        patternVisual: {
          subLabel: 'Factor Deduction',
          mode: 'odd_one_out'
        }
      };
    }

    // Variant 3: Visual Polygon Triangulation Rule (dots = sides - 2)
    const items: { kind: ShapeKind; dots: number }[] = [
      { kind: 'triangle', dots: 1 },
      { kind: 'square', dots: 2 },
      { kind: 'pentagon', dots: 3 },
      { kind: 'hexagon', dots: 4 }
    ];
    const ordered = shuffle(items, rng);
    const broken = ordered[0];
    const wrongDots = broken.dots <= 2 ? broken.dots + 2 : broken.dots - 2;
    const { choices, correctValue } = buildShapeChoices(
      {
        label: `${SHAPE_NAMES[broken.kind]} · ${wrongDots}`,
        shape: { kind: broken.kind, fill: 'outline', count: wrongDots }
      },
      ordered.slice(1).map((p) => ({
        label: `${SHAPE_NAMES[p.kind]} · ${p.dots}`,
        shape: { kind: p.kind, fill: 'outline', count: p.dots }
      })),
      rng
    );
    return {
      id,
      targetNumber,
      type: 'logic',
      categoryLabel: 'Pattern & Logic Sequence',
      prompt: 'Odd One Out: Three shapes follow a (sides − 2) dot rule. Pick the mismatch:',
      choices,
      correctValue,
      patternVisual: {
        subLabel: 'Visual Deduction',
        mode: 'odd_one_out'
      }
    };
  }

  // BAND 4 (Levels 701 - 1000): Very Advanced / BUET Engineering Elite
  const variant = randInt(rng, 0, 3);

  if (variant === 0) {
    // Cubic Pair Rule: (x → x^3 - x)
    const xs = shuffle([2, 3, 4, 5, 6], rng).slice(0, 4);
    const validPairs = xs.slice(0, 3).map((x) => `${x} → ${x * x * x - x}`);
    const bx = xs[3];
    const brokenPair = `${bx} → ${bx * bx * bx - bx - 4}`;
    return {
      id,
      targetNumber,
      type: 'logic',
      categoryLabel: 'Pattern & Logic Sequence',
      prompt: 'Odd One Out: Find the pair that breaks the cubic relation:',
      choices: buildStringChoices(brokenPair, validPairs, rng),
      correctValue: brokenPair,
      patternVisual: {
        subLabel: 'Engineering Deduction',
        mode: 'odd_one_out'
      }
    };
  }

  if (variant === 1) {
    // Sum-of-Squares Triples: (a, b → a^2 + b^2)
    const pairs: [number, number][] = shuffle(
      [
        [2, 3],
        [3, 4],
        [1, 5],
        [2, 5],
        [4, 5],
        [3, 5]
      ] as [number, number][],
      rng
    ).slice(0, 4);
    const valid = pairs.slice(0, 3).map(([a, b]) => `(${a}, ${b}) → ${a * a + b * b}`);
    const [ba, bb] = pairs[3];
    const broken = `(${ba}, ${bb}) → ${ba * ba + bb * bb - 2}`;
    return {
      id,
      targetNumber,
      type: 'logic',
      categoryLabel: 'Pattern & Logic Sequence',
      prompt: 'Odd One Out: Three coordinate mappings follow one quadratic invariant:',
      choices: buildStringChoices(broken, valid, rng),
      correctValue: broken,
      patternVisual: {
        subLabel: 'Engineering Deduction',
        mode: 'odd_one_out'
      }
    };
  }

  if (variant === 2) {
    // 2^k + 1 numbers vs non-(2^k + 1)
    const valid = shuffle([5, 9, 17, 33, 65], rng).slice(0, 3);
    const outlier = [13, 25, 41, 49][randInt(rng, 0, 3)];
    return {
      id,
      targetNumber,
      type: 'logic',
      categoryLabel: 'Pattern & Logic Sequence',
      prompt: 'Odd One Out: Three values follow (2ⁿ + 1). Spot the exception:',
      choices: buildStringChoices(String(outlier), valid.map(String), rng),
      correctValue: String(outlier),
      patternVisual: {
        subLabel: 'Exponential Deduction',
        mode: 'odd_one_out'
      }
    };
  }

  // Variant 3: Symmetric algebraic operation (a, b → a*b + a + b)
  const pairs: [number, number][] = shuffle(
    [
      [2, 3],
      [3, 4],
      [2, 5],
      [4, 5],
      [3, 5],
      [2, 6]
    ] as [number, number][],
    rng
  ).slice(0, 4);
  const valid = pairs.slice(0, 3).map(([a, b]) => `(${a}, ${b}) → ${a * b + a + b}`);
  const [ba, bb] = pairs[3];
  const broken = `(${ba}, ${bb}) → ${ba * bb + ba + bb + 2}`;
  return {
    id,
    targetNumber,
    type: 'logic',
    categoryLabel: 'Pattern & Logic Sequence',
    prompt: 'Odd One Out: Deduce the hidden binary operation and find the invalid result:',
    choices: buildStringChoices(broken, valid, rng),
    correctValue: broken,
    patternVisual: {
      subLabel: 'Algebraic Deduction',
      mode: 'odd_one_out'
    }
  };
}

function generateLogicTarget(
  level: number,
  targetNumber: number,
  rng: () => number
): LevelTarget {
  const id = `l-${level}-${targetNumber}-${Math.floor(rng() * 1e6)}`;

  // Every level includes both Series and Odd One Out across Targets #2, #6, and #10
  const useOddOneOut =
    targetNumber === 6 || (targetNumber === 10 && level % 2 === 0);

  if (useOddOneOut) {
    return generateOddOneOutTarget(level, targetNumber, rng, id);
  }
  return generateSeriesTarget(level, targetNumber, rng, id);
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
