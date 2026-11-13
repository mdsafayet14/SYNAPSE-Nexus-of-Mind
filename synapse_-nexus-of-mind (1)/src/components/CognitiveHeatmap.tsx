/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { UserProgress, PillarType } from '../types/game';
import { getDailyChallengeData } from '../services/levelEngine';
import { Sparkles, Compass, Flame, Shield, Activity, RefreshCw } from 'lucide-react';

interface CognitiveHeatmapProps {
  progress: UserProgress;
  compact?: boolean;
}

interface PillarMetric {
  key: PillarType;
  name: string;
  color: string;
  currentMastery: number; // 0 - 100
  avg30DayScore: number;  // 0 - 100
  trendChange: number;    // e.g. +12%
  trialsCount: number;
}

const PILLARS_CONFIG: { key: PillarType; name: string; color: string }[] = [
  { key: 'math', name: 'Math Equilibrium', color: '#F59E0B' },
  { key: 'memory', name: 'Memory Recall', color: '#06B6D4' },
  { key: 'logic', name: 'Logic Deduction', color: '#EC4899' },
  { key: 'puzzle', name: 'Spatial Circuit', color: '#10B981' },
  { key: 'quantum', name: 'Quantum Nexus', color: '#A855F7' }
];

export const CognitiveHeatmap: React.FC<CognitiveHeatmapProps> = ({ progress, compact = false }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [activeOverlayMode, setActiveOverlayMode] = useState<'heatmap' | 'radar' | 'combined'>('combined');
  const [hoveredPillar, setHoveredPillar] = useState<PillarMetric | null>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 500, height: 420 });

  // Calculate 30-day metrics per pillar
  const metrics = useMemo<PillarMetric[]>(() => {
    // 30 day history aggregation
    const today = new Date();
    const pillarScores: Record<PillarType, number[]> = {
      math: [],
      memory: [],
      logic: [],
      puzzle: [],
      relaxing: [],
      quantum: []
    };

    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);

      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      const rec = progress.dailyHistory?.[dateStr];
      const dailyInfo = getDailyChallengeData(dateStr);
      const pillar = dailyInfo.pillar;

      if (rec) {
        pillarScores[pillar].push(rec.score);
      } else {
        // Baseline derived calculation
        let seed = 0;
        for (let c = 0; c < dateStr.length; c++) {
          seed = (seed * 31 + dateStr.charCodeAt(c)) % 1000;
        }
        pillarScores[pillar].push(75 + (seed % 20));
      }
    }

    return PILLARS_CONFIG.map((p) => {
      const currentMastery = Math.min(100, Math.max(10, progress.mastery[p.key] || 25));
      const scores = pillarScores[p.key];
      const avg30 = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : currentMastery;
      const prev7Avg = scores.length >= 7 ? Math.round(scores.slice(0, 7).reduce((a, b) => a + b, 0) / 7) : avg30;
      const trendChange = Math.max(-15, Math.min(25, prev7Avg - (avg30 - 5)));

      return {
        key: p.key,
        name: p.name,
        color: p.color,
        currentMastery,
        avg30DayScore: avg30,
        trendChange,
        trialsCount: scores.length + Math.floor(currentMastery / 5)
      };
    });
  }, [progress]);

  // Handle Resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth;
        const maxH = compact ? 280 : 460;
        const minH = compact ? 220 : 340;
        const ratio = compact ? 0.55 : 0.75;
        const h = Math.min(maxH, Math.max(minH, w * ratio));
        setDimensions({ width: w, height: h });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [compact]);

  // D3 Radar & Heatmap Rendering Effect
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const { width, height } = dimensions;
    const margin = compact ? 32 : 40;
    const radius = Math.min(width, height) / 2 - margin;
    const centerX = width / 2;
    const centerY = height / 2;

    const numAxes = metrics.length;
    const angleSlice = (Math.PI * 2) / numAxes;

    // Radius scale (0 - 100%)
    const rScale = d3.scaleLinear().domain([0, 100]).range([0, radius]);

    const mainG = svg
      .append('g')
      .attr('transform', `translate(${centerX}, ${centerY})`);

    // SVG Defs for Glows & Radial Heatmap Gradients
    const defs = svg.append('defs');

    // Radar Poly Glow Filter
    const filter = defs.append('filter').attr('id', 'd3GlowFilter').attr('x', '-20%').attr('y', '-20%').attr('width', '140%').attr('height', '140%');
    filter.append('feGaussianBlur').attr('stdDeviation', '6').attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Radial Fill Gradient
    const polyGrad = defs.append('radialGradient').attr('id', 'radarPolyGrad').attr('cx', '50%').attr('cy', '50%').attr('r', '50%');
    polyGrad.append('stop').attr('offset', '0%').attr('stop-color', '#06B6D4').attr('stop-opacity', '0.55');
    polyGrad.append('stop').attr('offset', '70%').attr('stop-color', '#A855F7').attr('stop-opacity', '0.35');
    polyGrad.append('stop').attr('offset', '100%').attr('stop-color', '#EC4899').attr('stop-opacity', '0.15');

    // Draw Concentric Reference Webs (Levels 20%, 40%, 60%, 80%, 100%)
    const levels = [20, 40, 60, 80, 100];
    levels.forEach((lvl) => {
      const levelRadius = rScale(lvl);

      // Polygon points for level ring
      const points: [number, number][] = metrics.map((_, i) => {
        const angle = i * angleSlice - Math.PI / 2;
        return [levelRadius * Math.cos(angle), levelRadius * Math.sin(angle)];
      });

      // Polygon web line
      mainG
        .append('polygon')
        .attr('points', points.map((p) => p.join(',')).join(' '))
        .attr('fill', 'none')
        .attr('stroke', '#ffffff15')
        .attr('stroke-dasharray', lvl === 100 ? 'none' : '3 3')
        .attr('stroke-width', lvl === 100 ? '1.5' : '1');

      // Level Ring Percentage Tag
      if (width > 380) {
        mainG
          .append('text')
          .attr('x', 5)
          .attr('y', -levelRadius + 4)
          .attr('fill', '#64748B')
          .attr('font-size', '9px')
          .attr('font-family', 'monospace')
          .text(`${lvl}%`);
      }
    });

    // Draw Axis Spoke Lines
    metrics.forEach((m, i) => {
      const angle = i * angleSlice - Math.PI / 2;
      const x2 = radius * Math.cos(angle);
      const y2 = radius * Math.sin(angle);

      // Spoke Line
      mainG
        .append('line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', x2)
        .attr('y2', y2)
        .attr('stroke', `${m.color}40`)
        .attr('stroke-width', '1.5');

      // Outer Axis Anchor Glow Node
      mainG
        .append('circle')
        .attr('cx', x2)
        .attr('cy', y2)
        .attr('r', 4)
        .attr('fill', m.color)
        .attr('filter', 'url(#d3GlowFilter)');

      // Pillar Label Badge position
      const labelDist = radius + 22;
      const lx = labelDist * Math.cos(angle);
      const ly = labelDist * Math.sin(angle);

      const labelG = mainG
        .append('g')
        .attr('transform', `translate(${lx}, ${ly})`)
        .attr('class', 'cursor-pointer')
        .on('mouseenter', () => setHoveredPillar(m))
        .on('mouseleave', () => setHoveredPillar(null));

      // Label background pill
      labelG
        .append('rect')
        .attr('x', -45)
        .attr('y', -12)
        .attr('width', 90)
        .attr('height', 24)
        .attr('rx', 12)
        .attr('fill', '#070b14e6')
        .attr('stroke', m.color)
        .attr('stroke-width', '1');

      // Label text
      labelG
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '3')
        .attr('fill', '#FFFFFF')
        .attr('font-size', '10px')
        .attr('font-weight', 'bold')
        .attr('font-family', 'sans-serif')
        .text(`${m.name.split(' ')[0]} ${m.currentMastery}%`);
    });

    // MODE 1 & 3: 30-Day Concentric Heatmap Density Circles
    if (activeOverlayMode === 'heatmap' || activeOverlayMode === 'combined') {
      metrics.forEach((m, axisIdx) => {
        const angle = axisIdx * angleSlice - Math.PI / 2;

        // Render 10 concentric heatmap pulse nodes representing 30-day trial distribution
        for (let step = 1; step <= 8; step++) {
          const stepVal = step * 12.5; // 12.5% to 100%
          const dist = rScale(stepVal);
          const px = dist * Math.cos(angle);
          const py = dist * Math.sin(angle);

          // Heatmap node intensity color gradient based on mastery vs average
          const intensity = Math.min(1, stepVal / Math.max(1, m.currentMastery));
          const colorScale = d3.scaleSequential(d3.interpolateTurbo).domain([0, 1]);
          const nodeColor = stepVal <= m.currentMastery ? m.color : '#334155';
          const nodeRadius = stepVal <= m.currentMastery ? 3 + (stepVal / 25) : 2;

          mainG
            .append('circle')
            .attr('cx', px)
            .attr('cy', py)
            .attr('r', nodeRadius)
            .attr('fill', nodeColor)
            .attr('opacity', stepVal <= m.currentMastery ? 0.8 : 0.25)
            .attr('stroke', stepVal <= m.currentMastery ? '#ffffff40' : 'none')
            .attr('stroke-width', '0.5');
        }
      });
    }

    // MODE 2 & 3: Radar Polygon Overlay for Current Mastery Shape
    if (activeOverlayMode === 'radar' || activeOverlayMode === 'combined') {
      const polyCoords: [number, number][] = metrics.map((m, i) => {
        const angle = i * angleSlice - Math.PI / 2;
        const val = rScale(m.currentMastery);
        return [val * Math.cos(angle), val * Math.sin(angle)];
      });

      // 30-Day Avg Baseline Polygon (dashed background shape)
      const avgCoords: [number, number][] = metrics.map((m, i) => {
        const angle = i * angleSlice - Math.PI / 2;
        const val = rScale(m.avg30DayScore);
        return [val * Math.cos(angle), val * Math.sin(angle)];
      });

      // Render 30-day average comparison outline
      mainG
        .append('polygon')
        .attr('points', avgCoords.map((p) => p.join(',')).join(' '))
        .attr('fill', 'none')
        .attr('stroke', '#38BDF880')
        .attr('stroke-dasharray', '4 4')
        .attr('stroke-width', '1.5');

      // Mastery Polygon Area
      const radarPolygon = mainG
        .append('polygon')
        .attr('points', polyCoords.map((p) => p.join(',')).join(' '))
        .attr('fill', 'url(#radarPolyGrad)')
        .attr('stroke', '#38BDF8')
        .attr('stroke-width', '2.5')
        .attr('filter', 'url(#d3GlowFilter)')
        .attr('opacity', 0);

      // Smooth Animated Entrance
      radarPolygon.transition().duration(800).attr('opacity', 0.9);

      // Vertex Nodes
      polyCoords.forEach((pt, i) => {
        const m = metrics[i];
        mainG
          .append('circle')
          .attr('cx', pt[0])
          .attr('cy', pt[1])
          .attr('r', 5)
          .attr('fill', m.color)
          .attr('stroke', '#FFFFFF')
          .attr('stroke-width', '2')
          .attr('class', 'cursor-pointer')
          .on('mouseenter', () => setHoveredPillar(m))
          .on('mouseleave', () => setHoveredPillar(null));
      });
    }
  }, [dimensions, metrics, activeOverlayMode]);

  return (
    <div className={`rounded-2xl glass-panel ${compact ? 'p-4 sm:p-5 space-y-3' : 'p-6 space-y-6'} border border-white/10 glow-cyan`}>
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
            <Compass className="w-4 h-4 text-cyan-400" />
            <span>D3.js Spatial Heatmap</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400">5 Cognitive Pillars</span>
          </div>
          <h2 className={`${compact ? 'text-lg sm:text-xl' : 'text-xl md:text-2xl'} font-extrabold text-white tracking-tight`}>
            Cognitive Heatmap Radar
          </h2>
          <p className="text-xs text-slate-300">
            Multi-axis spatial visualization mapping your 30-day mastery trends and neural equilibrium.
          </p>
        </div>

        {/* Overlay Mode Switcher Buttons */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-1 flex items-center gap-1">
          <button
            onClick={() => setActiveOverlayMode('combined')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeOverlayMode === 'combined'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Combined View
          </button>
          <button
            onClick={() => setActiveOverlayMode('radar')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeOverlayMode === 'radar'
                ? 'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Mastery Polygon
          </button>
          <button
            onClick={() => setActiveOverlayMode('heatmap')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeOverlayMode === 'heatmap'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Density Heatmap
          </button>
        </div>
      </div>

      {/* SVG Canvas Container */}
      <div ref={containerRef} className={`w-full flex justify-center relative ${compact ? 'min-h-[220px]' : 'min-h-[350px]'}`}>
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          className="overflow-visible"
        />

        {/* Hovered Pillar Details Card overlay */}
        {hoveredPillar && (
          <div
            className="absolute bottom-2 left-1/2 -translate-x-1/2 glass-panel p-3.5 rounded-2xl border shadow-2xl flex items-center gap-4 text-xs font-mono animate-in fade-in zoom-in duration-200 pointer-events-none"
            style={{
              borderColor: `${hoveredPillar.color}60`,
              backgroundColor: '#070b14f0'
            }}
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: hoveredPillar.color }}
            />
            <div>
              <span className="text-white font-bold block">{hoveredPillar.name}</span>
              <span className="text-slate-400 text-[11px]">
                Mastery: <strong className="text-cyan-300">{hoveredPillar.currentMastery}%</strong> | 30d Avg:{' '}
                <strong className="text-amber-300">{hoveredPillar.avg30DayScore}%</strong>
              </span>
            </div>
            <div className="pl-3 border-l border-white/10 text-[11px]">
              <span className="text-emerald-400 font-bold block">
                {hoveredPillar.trendChange >= 0 ? `+${hoveredPillar.trendChange}%` : `${hoveredPillar.trendChange}%`}{' '}
                Trend
              </span>
              <span className="text-slate-400">{hoveredPillar.trialsCount} Trials</span>
            </div>
          </div>
        )}
      </div>

      {/* Pillar Breakdown Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
        {metrics.map((m) => (
          <div
            key={m.key}
            onMouseEnter={() => setHoveredPillar(m)}
            onMouseLeave={() => setHoveredPillar(null)}
            className="glass-card p-3 rounded-2xl border border-white/5 hover:border-white/20 transition-all cursor-pointer space-y-1.5"
          >
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-white capitalize">{m.key}</span>
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: m.color }}
              />
            </div>

            <div className="flex items-baseline justify-between font-mono">
              <span className="text-lg font-bold text-white">{m.currentMastery}%</span>
              <span className="text-[10px] text-emerald-400 font-semibold">
                {m.trendChange >= 0 ? `+${m.trendChange}%` : `${m.trendChange}%`}
              </span>
            </div>

            <div className="w-full bg-white/10 rounded-full h-1 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${m.currentMastery}%`, backgroundColor: m.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
