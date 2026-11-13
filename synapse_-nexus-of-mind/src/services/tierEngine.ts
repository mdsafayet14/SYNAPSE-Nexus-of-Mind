/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  DifficultyTierConfig,
  DifficultyTierId,
  TargetChallenge,
  TargetChallengeType,
  TargetOption
} from '../types/tierGame';

export const DIFFICULTY_TIERS: DifficultyTierConfig[] = [
  {
    id: 'medium',
    index: 1,
    name: 'Medium',
    tagline: 'Foundational Equilibrium',
    description: 'Two-step arithmetic, 3-node recall sequences, fundamental logic gates, and 90° spatial rotations.',
    accentColor: '#38BDF8',
    targetCount: 10,
    maxMistakes: 3
  },
  {
    id: 'bute',
    index: 2,
    name: 'BUTE',
    tagline: 'Analytical Synthesis',
    description: 'Linear algebraic equations, 4-node memory paths, inverted gates (NAND/NOR), and directional shifts.',
    accentColor: '#22D3EE',
    targetCount: 10,
    maxMistakes: 3
  },
  {
    id: 'kute',
    index: 3,
    name: 'KUTE',
    tagline: 'Multi-Variable Deduction',
    description: 'Dual-variable expressions, 5-node rapid recall, cascaded 2-stage logic circuits, and parity symmetry.',
    accentColor: '#A78BFA',
    targetCount: 10,
    maxMistakes: 3
  },
  {
    id: 'rute',
    index: 4,
    name: 'RUTE',
    tagline: 'High-Order Constraints',
    description: 'Modular arithmetic & quadratic sequences, 4×4 memory matrices, 3-gate networks, and XOR grid overlays.',
    accentColor: '#F59E0B',
    targetCount: 10,
    maxMistakes: 3
  },
  {
    id: 'engineering',
    index: 5,
    name: 'Engineering Level',
    tagline: 'Peak Systems Architecture',
    description: '2×2 determinants & simultaneous systems, 6-node speed recall, bitmask synthesis, and tensor transforms.',
    accentColor: '#10B981',
    targetCount: 10,
    maxMistakes: 3
  }
];

export function getTierById(id: DifficultyTierId): DifficultyTierConfig {
  return DIFFICULTY_TIERS.find((t) => t.id === id) || DIFFICULTY_TIERS[0];
}

export function getTierByIndex(index: number): DifficultyTierConfig | undefined {
  return DIFFICULTY_TIERS.find((t) => t.index === index);
}

// Utility helpers
function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function buildNumericOptions(answer: number, offsets: number[]): TargetOption[] {
  const values = new Set<number>([answer]);
  for (const off of shuffle(offsets)) {
    if (values.size >= 4) break;
    const candidate = answer + off;
    if (candidate !== answer) {
      values.add(candidate);
    }
  }
  let fallbackStep = 1;
  while (values.size < 4) {
    values.add(answer + fallbackStep);
    if (values.size < 4) values.add(answer - fallbackStep);
    fallbackStep++;
  }
  return shuffle(Array.from(values)).map((val, idx) => ({
    id: `opt-${idx}-${val}`,
    label: String(val),
    value: String(val)
  }));
}

// Math Target Generator scaled across all 5 tiers
function generateMathTarget(tier: DifficultyTierId, targetNumber: number): TargetChallenge {
  const id = `math-${tier}-${targetNumber}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  if (tier === 'medium') {
    if (targetNumber % 2 === 1) {
      const a = randInt(6, 18);
      const b = randInt(3, 9);
      const c = randInt(2, 6);
      const ans = a + b * c;
      return {
        id,
        targetNumber,
        type: 'math',
        categoryLabel: 'Numeric Synthesis',
        prompt: 'Evaluate the expression:',
        expression: `${a} + (${b} × ${c}) = ?`,
        options: buildNumericOptions(ans, [-4, -2, 2, 4, 6, -6]),
        correctValue: String(ans)
      };
    } else {
      const start = randInt(3, 12);
      const diff = randInt(4, 9);
      const seq = [start, start + diff, start + diff * 2, start + diff * 3];
      const ans = start + diff * 4;
      return {
        id,
        targetNumber,
        type: 'math',
        categoryLabel: 'Sequence Analysis',
        prompt: 'Determine the next term in the sequence:',
        expression: `${seq.join(' , ')} , ?`,
        options: buildNumericOptions(ans, [-diff, -2, 2, diff, 4, -4]),
        correctValue: String(ans)
      };
    }
  }

  if (tier === 'bute') {
    if (targetNumber % 2 === 1) {
      // Solve for x: a*x + b = c
      const a = randInt(3, 8);
      const x = randInt(4, 14);
      const b = randInt(5, 21);
      const rhs = a * x + b;
      return {
        id,
        targetNumber,
        type: 'math',
        categoryLabel: 'Algebraic Balance',
        prompt: 'Solve for x:',
        expression: `${a}x + ${b} = ${rhs}`,
        options: buildNumericOptions(x, [-3, -1, 1, 2, 3, -2]),
        correctValue: String(x)
      };
    } else {
      // Alternating or multiplicative delta sequence
      const start = randInt(2, 5);
      const mult = randInt(2, 3);
      const add = randInt(1, 5);
      const t1 = start;
      const t2 = t1 * mult + add;
      const t3 = t2 * mult + add;
      const ans = t3 * mult + add;
      return {
        id,
        targetNumber,
        type: 'math',
        categoryLabel: 'Recursive Progression',
        prompt: 'Predict the next value in the recursive series:',
        expression: `${t1} , ${t2} , ${t3} , ?`,
        options: buildNumericOptions(ans, [-add, -mult, add, mult * 2, -6, 6]),
        correctValue: String(ans)
      };
    }
  }

  if (tier === 'kute') {
    if (targetNumber % 2 === 1) {
      // Evaluate 2-variable linear identity
      const x = randInt(4, 11);
      const y = randInt(3, 9);
      const c1 = randInt(2, 5);
      const c2 = randInt(2, 4);
      const ans = c1 * x - c2 * y;
      return {
        id,
        targetNumber,
        type: 'math',
        categoryLabel: 'Dual-Variable Evaluation',
        prompt: `Given x = ${x} and y = ${y}, compute:`,
        expression: `${c1}x − ${c2}y = ?`,
        options: buildNumericOptions(ans, [-5, -3, -2, 2, 3, 5]),
        correctValue: String(ans)
      };
    } else {
      // Second-order polynomial sequence (n^2 + c or cumulative delta)
      const base = randInt(2, 6);
      const k = randInt(1, 4);
      const terms = [0, 1, 2, 3].map((i) => (base + i) * (base + i) + k);
      const ans = (base + 4) * (base + 4) + k;
      return {
        id,
        targetNumber,
        type: 'math',
        categoryLabel: 'Quadratic Series',
        prompt: 'Find the 5th term in the quadratic sequence:',
        expression: `${terms.join(' , ')} , ?`,
        options: buildNumericOptions(ans, [-7, -4, -2, 2, 4, 8]),
        correctValue: String(ans)
      };
    }
  }

  if (tier === 'rute') {
    if (targetNumber % 2 === 1) {
      // Modular arithmetic (guaranteed 4 unique remainders in [0, mod - 1])
      const a = randInt(13, 27);
      const b = randInt(7, 17);
      const mod = randInt(7, 13);
      const ans = (a * b) % mod;
      const modSet = new Set<number>([ans]);
      let step = 1;
      while (modSet.size < 4) {
        modSet.add((ans + step) % mod);
        if (modSet.size < 4) modSet.add((ans - step + mod) % mod);
        step++;
      }
      const modOptions = shuffle(Array.from(modSet)).map((v, i) => ({
        id: `mod-${i}-${v}`,
        label: String(v),
        value: String(v)
      }));
      return {
        id,
        targetNumber,
        type: 'math',
        categoryLabel: 'Modular Congruence',
        prompt: 'Compute the exact remainder:',
        expression: `(${a} × ${b}) mod ${mod} = ?`,
        options: modOptions,
        correctValue: String(ans)
      };
    } else {
      // Algebraic ratio: (a^2 - b^2) / (a - b) + c = a + b + c
      const b = randInt(5, 12);
      const a = b + randInt(3, 8);
      const c = randInt(4, 15);
      const ans = a + b + c;
      return {
        id,
        targetNumber,
        type: 'math',
        categoryLabel: 'Algebraic Simplification',
        prompt: 'Simplify and evaluate:',
        expression: `(${a}² − ${b}²) ÷ (${a} − ${b}) + ${c} = ?`,
        options: buildNumericOptions(ans, [-6, -3, -2, 2, 4, 6]),
        correctValue: String(ans)
      };
    }
  }

  // Engineering Level
  if (targetNumber % 2 === 1) {
    // 2x2 Matrix Determinant: det([[a, b], [c, d]]) = a*d - b*c
    const a = randInt(4, 12);
    const b = randInt(2, 9);
    const c = randInt(2, 8);
    const d = randInt(3, 11);
    const ans = a * d - b * c;
    return {
      id,
      targetNumber,
      type: 'math',
      categoryLabel: 'Matrix Determinant',
      prompt: 'Calculate the determinant det(M) = ad − bc:',
      expression: `det [ ${a} , ${b}  |  ${c} , ${d} ] = ?`,
      options: buildNumericOptions(ans, [-8, -4, -2, 2, 4, 8]),
      correctValue: String(ans)
    };
  } else {
    // Simultaneous system: x + y = S, x - y = D -> find x * y
    const x = randInt(9, 18);
    const y = randInt(3, x - 2);
    const sum = x + y;
    const diff = x - y;
    const ans = x * y;
    return {
      id,
      targetNumber,
      type: 'math',
      categoryLabel: 'Simultaneous System',
      prompt: `If x + y = ${sum} and x − y = ${diff}, compute x × y:`,
      expression: `x · y = ?`,
      options: buildNumericOptions(ans, [-12, -6, -3, 4, 8, 12]),
      correctValue: String(ans)
    };
  }
}

// Memory Target Generator scaled across all 5 tiers
function generateMemoryTarget(tier: DifficultyTierId, targetNumber: number): TargetChallenge {
  const id = `mem-${tier}-${targetNumber}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  let gridSize = 3;
  let length = 3;
  let pulseMs = 540;

  if (tier === 'medium') {
    gridSize = 3;
    length = 3;
    pulseMs = 560;
  } else if (tier === 'bute') {
    gridSize = 3;
    length = 4;
    pulseMs = 470;
  } else if (tier === 'kute') {
    gridSize = 3;
    length = 5;
    pulseMs = 400;
  } else if (tier === 'rute') {
    gridSize = 4;
    length = 5;
    pulseMs = 350;
  } else {
    gridSize = 4;
    length = 6;
    pulseMs = 290;
  }

  const totalTiles = gridSize * gridSize;
  const sequence: number[] = [];
  for (let i = 0; i < length; i++) {
    let nextTile = randInt(0, totalTiles - 1);
    // Avoid immediate triple repeats so patterns feel clear
    if (sequence.length > 0 && nextTile === sequence[sequence.length - 1]) {
      nextTile = (nextTile + randInt(1, totalTiles - 1)) % totalTiles;
    }
    sequence.push(nextTile);
  }

  return {
    id,
    targetNumber,
    type: 'memory',
    categoryLabel: 'Synaptic Recall',
    prompt: `Observe the ${length}-node pulse on the ${gridSize}×${gridSize} matrix, then replicate the exact sequence.`,
    memoryConfig: {
      gridSize,
      sequence,
      pulseMs
    }
  };
}

// Logic Gate Evaluator
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

function generateLogicTarget(tier: DifficultyTierId, targetNumber: number): TargetChallenge {
  const id = `logic-${tier}-${targetNumber}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  const boolOpts: TargetOption[] = [
    { id: 'opt-true', label: 'TRUE (1)', value: '1' },
    { id: 'opt-false', label: 'FALSE (0)', value: '0' }
  ];

  if (tier === 'medium') {
    const gates = ['AND', 'OR', 'XOR'];
    const gate = gates[randInt(0, gates.length - 1)];
    const a = Math.random() > 0.45;
    const b = Math.random() > 0.45;
    const out = evalGate(gate, a, b);
    return {
      id,
      targetNumber,
      type: 'logic',
      categoryLabel: 'Boolean Gate',
      prompt: 'Determine the digital output signal (1 or 0):',
      expression: `${a ? '1' : '0'}  ${gate}  ${b ? '1' : '0'}  →  ?`,
      options: boolOpts,
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

  if (tier === 'bute') {
    const gates = ['NAND', 'NOR', 'XNOR', 'XOR'];
    const gate = gates[randInt(0, gates.length - 1)];
    const a = Math.random() > 0.5;
    const b = Math.random() > 0.5;
    const out = evalGate(gate, a, b);
    return {
      id,
      targetNumber,
      type: 'logic',
      categoryLabel: 'Inverted Gate Logic',
      prompt: 'Evaluate the inverted Boolean gate output:',
      expression: `${a ? '1' : '0'}  ${gate}  ${b ? '1' : '0'}  →  ?`,
      options: boolOpts,
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

  if (tier === 'kute') {
    const g1 = ['AND', 'OR', 'XOR'][randInt(0, 2)];
    const g2 = ['AND', 'XOR', 'NAND'][randInt(0, 2)];
    const a = Math.random() > 0.5;
    const b = Math.random() > 0.5;
    const c = Math.random() > 0.5;
    const stage1 = evalGate(g1, a, b);
    const out = evalGate(g2, stage1, c);
    return {
      id,
      targetNumber,
      type: 'logic',
      categoryLabel: 'Cascaded Circuit',
      prompt: 'Trace the two-stage Boolean circuit output:',
      expression: `(${a ? '1' : '0'} ${g1} ${b ? '1' : '0'})  ${g2}  ${c ? '1' : '0'}  →  ?`,
      options: boolOpts,
      correctValue: out ? '1' : '0',
      logicVisual: {
        gateLabel: g1,
        inputs: [
          { name: 'A', value: a },
          { name: 'B', value: b }
        ],
        secondaryGate: g2,
        thirdInput: { name: 'C', value: c }
      }
    };
  }

  if (tier === 'rute') {
    const g1 = ['NAND', 'NOR', 'XOR'][randInt(0, 2)];
    const g2 = ['XNOR', 'XOR', 'NOR'][randInt(0, 2)];
    const a = Math.random() > 0.5;
    const b = Math.random() > 0.5;
    const c = Math.random() > 0.5;
    const stage1 = evalGate(g1, a, b);
    const out = evalGate(g2, stage1, !c);
    return {
      id,
      targetNumber,
      type: 'logic',
      categoryLabel: 'Combinational Logic',
      prompt: 'Evaluate the inverted cascaded logic expression:',
      expression: `(${a ? '1' : '0'} ${g1} ${b ? '1' : '0'})  ${g2}  (NOT ${c ? '1' : '0'})  →  ?`,
      options: boolOpts,
      correctValue: out ? '1' : '0',
      logicVisual: {
        gateLabel: g1,
        inputs: [
          { name: 'A', value: a },
          { name: 'B', value: b }
        ],
        secondaryGate: g2,
        thirdInput: { name: '¬C', value: !c }
      }
    };
  }

  // Engineering Level: 4-bit bitwise XOR / AND synthesis
  const x = randInt(5, 14);
  const y = randInt(3, 13);
  const useXor = targetNumber % 2 === 1;
  const result = useXor ? x ^ y : (x & y) ^ 0b1010;
  const binX = x.toString(2).padStart(4, '0');
  const binY = y.toString(2).padStart(4, '0');
  const ansBin = result.toString(2).padStart(4, '0');

  const distractors = new Set<string>([ansBin]);
  let guard = 0;
  while (distractors.size < 4 && guard < 30) {
    guard++;
    const flipBit = 1 << randInt(0, 3);
    const cand = (result ^ flipBit).toString(2).padStart(4, '0');
    distractors.add(cand);
  }
  while (distractors.size < 4) {
    distractors.add(randInt(0, 15).toString(2).padStart(4, '0'));
  }

  return {
    id,
    targetNumber,
    type: 'logic',
    categoryLabel: 'Bitwise Register Synthesis',
    prompt: useXor
      ? 'Compute the 4-bit bitwise XOR result:'
      : 'Compute ((A AND B) XOR 1010) in 4-bit binary:',
    expression: useXor ? `${binX}  ⊕  ${binY}  =  ?` : `(${binX}  &  ${binY})  ⊕  1010  =  ?`,
    options: shuffle(Array.from(distractors)).map((b, i) => ({
      id: `bin-${i}-${b}`,
      label: b,
      value: b
    })),
    correctValue: ansBin
  };
}

// Spatial Pattern Generator
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

function randomGrid(size: number, activeCount: number): number[][] {
  const cells = Array(size * size).fill(0);
  for (let i = 0; i < activeCount; i++) cells[i] = 1;
  const shuffled = shuffle(cells);
  const grid: number[][] = [];
  for (let r = 0; r < size; r++) {
    grid.push(shuffled.slice(r * size, (r + 1) * size));
  }
  return grid;
}

function generateSpatialTarget(tier: DifficultyTierId, targetNumber: number): TargetChallenge {
  const id = `spatial-${tier}-${targetNumber}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  if (tier === 'medium') {
    // 90-degree clockwise directional rotation sequence (2x2 layout: 0 -> 90 -> 180 -> ?)
    const startAngle = [0, 90, 180, 270][randInt(0, 3)];
    const step = Math.random() > 0.5 ? 90 : -90;
    const angles = [0, 1, 2, 3].map((k) => (((startAngle + k * step) % 360) + 360) % 360);
    const correctAngle = angles[3];

    return {
      id,
      targetNumber,
      type: 'spatial',
      categoryLabel: 'Spatial Orientation',
      prompt: 'Identify the missing vector orientation that completes the rotational sequence:',
      options: shuffle([0, 90, 180, 270]).map((ang, idx) => ({
        id: `ang-${idx}-${ang}`,
        label: `${ang}°`,
        value: String(ang),
        glyph: { kind: 'arrow', rotation: ang }
      })),
      correctValue: String(correctAngle),
      spatialVisual: {
        ruleHint: 'Rotational Sequence',
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

  if (tier === 'bute' || tier === 'kute') {
    // 2x2 dot-matrix sequential 90° rotation
    let base = randomGrid(2, 2);
    // Ensure asymmetric so 4 rotations produce distinct patterns
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
    const targetGrid = tier === 'kute' ? r3.map((row) => row.map((v) => 1 - v)) : r3;
    const correctKey = serializeGrid(targetGrid);

    const uniqueOptionsMap = new Map<string, number[][]>();
    uniqueOptionsMap.set(correctKey, targetGrid);
    const candidates = [
      base,
      r1,
      r2,
      r3,
      base.map((row) => [...row].reverse()),
      r1.map((row) => row.map((v) => 1 - v)),
      [
        [1, 0],
        [0, 1]
      ],
      [
        [0, 1],
        [1, 0]
      ]
    ];
    for (const cand of shuffle(candidates)) {
      if (uniqueOptionsMap.size >= 4) break;
      const key = serializeGrid(cand);
      if (!uniqueOptionsMap.has(key)) uniqueOptionsMap.set(key, cand);
    }

    return {
      id,
      targetNumber,
      type: 'spatial',
      categoryLabel: tier === 'kute' ? 'Rotation & Inversion' : 'Matrix Rotation',
      prompt:
        tier === 'kute'
          ? 'Determine the 4th tile (each step rotates 90° CW; final state inverts parity):'
          : 'Select the tile that completes the 90° clockwise spatial matrix:',
      options: shuffle(Array.from(uniqueOptionsMap.entries())).map(([key, grid], idx) => ({
        id: `sp-${idx}`,
        label: `Pattern ${idx + 1}`,
        value: key,
        glyph: { kind: 'dots', grid }
      })),
      correctValue: correctKey,
      spatialVisual: {
        ruleHint: tier === 'kute' ? '90° CW + Final Invert' : '90° CW Progression',
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

  // RUTE & Engineering Level: 3x3 Row-wise XOR superposition (Col 1 XOR Col 2 = Col 3)
  const gridDim = tier === 'engineering' ? 3 : 2;
  const activeCount = tier === 'engineering' ? 4 : 2;
  const r1c1 = randomGrid(gridDim, activeCount);
  const r1c2 = randomGrid(gridDim, activeCount);
  const r1c3 = xorGrids(r1c1, r1c2);

  const r2c1 = randomGrid(gridDim, activeCount);
  const r2c2 = randomGrid(gridDim, activeCount);
  const r2c3 = xorGrids(r2c1, r2c2);

  const targetGrid = r2c3;
  const correctKey = serializeGrid(targetGrid);

  const uniqueMap = new Map<string, number[][]>();
  uniqueMap.set(correctKey, targetGrid);
  let guard = 0;
  while (uniqueMap.size < 4 && guard < 40) {
    guard++;
    const mutated = targetGrid.map((row) => [...row]);
    const rr = randInt(0, gridDim - 1);
    const cc = randInt(0, gridDim - 1);
    mutated[rr][cc] = 1 - mutated[rr][cc];
    const key = serializeGrid(mutated);
    if (!uniqueMap.has(key)) uniqueMap.set(key, mutated);
  }

  return {
    id,
    targetNumber,
    type: 'spatial',
    categoryLabel: tier === 'engineering' ? 'Tensor XOR Superposition' : 'Spatial XOR Matrix',
    prompt: 'Deduce the missing cell using the row superposition rule (Left ⊕ Middle = Right):',
    options: shuffle(Array.from(uniqueMap.entries())).map(([key, grid], idx) => ({
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

// Generate exactly 10 balanced challenges for any tier
export function generateTargetsForTier(tierId: DifficultyTierId): TargetChallenge[] {
  // Balanced 10-target cadence rotating smoothly through cognitive modes
  const pattern: TargetChallengeType[] = [
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

  return pattern.map((type, idx) => {
    const targetNumber = idx + 1;
    if (type === 'math') return generateMathTarget(tierId, targetNumber);
    if (type === 'memory') return generateMemoryTarget(tierId, targetNumber);
    if (type === 'logic') return generateLogicTarget(tierId, targetNumber);
    return generateSpatialTarget(tierId, targetNumber);
  });
}
