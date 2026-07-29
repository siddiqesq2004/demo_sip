import React, { useMemo } from 'react';

/**
 * PlantGrowthAnimation — A pure SVG + CSS animated plant that
 * dynamically grows from a tiny seed to a world‑spanning forest.
 *
 * Props:
 *   day        – current growth day (1‑22+)
 *   totalDays  – total cycle length (default 22)
 */
const PlantGrowthAnimation = ({ day = 1, totalDays = 22 }) => {
  const progress = Math.min(day / totalDays, 1); // 0 → 1

  // Derived visual parameters
  const stemHeight    = Math.min(progress * 120, 120);
  const stemWidth     = 2 + progress * 4;
  const leafCount     = Math.floor(progress * 8);
  const branchCount   = Math.floor(Math.max(0, (progress - 0.3) * 6));
  const fruitCount    = Math.floor(Math.max(0, (progress - 0.55) * 10));
  const treeCount     = Math.floor(Math.max(0, (progress - 0.7) * 8));
  const showForest    = progress >= 0.8;
  const showWorld     = progress >= 0.95;
  const canopyRadius  = Math.min(Math.max(0, (progress - 0.4) * 80), 50);

  // Color transitions
  const stemColor     = progress < 0.3 ? '#8B5E3C' : '#2D6A3F';
  const leafGreen     = progress < 0.5 ? '#66BB6A' : '#2E7D32';
  const darkGreen     = '#1B5E20';
  const gold          = '#FFD54F';
  const skyTop        = showWorld ? '#0D1B2A' : showForest ? '#0B3B2F' : '#1A3A2A';
  const skyBot        = showWorld ? '#1B2838' : showForest ? '#062E23' : '#0F2318';

  // Generate leaf positions along the stem
  const leaves = useMemo(() => {
    const arr = [];
    for (let i = 0; i < leafCount; i++) {
      const t = 0.25 + (i / Math.max(leafCount, 1)) * 0.7;
      const y = 180 - stemHeight * t;
      const side = i % 2 === 0 ? -1 : 1;
      const size = 8 + progress * 10 - i * 0.5;
      const angle = side * (25 + i * 5);
      arr.push({ y, side, size: Math.max(size, 5), angle, delay: i * 0.15 });
    }
    return arr;
  }, [leafCount, stemHeight, progress]);

  // Generate branch positions
  const branches = useMemo(() => {
    const arr = [];
    for (let i = 0; i < branchCount; i++) {
      const t = 0.35 + (i / Math.max(branchCount, 1)) * 0.55;
      const y = 180 - stemHeight * t;
      const side = i % 2 === 0 ? -1 : 1;
      const len = 15 + progress * 20;
      arr.push({ y, side, len, delay: i * 0.2 });
    }
    return arr;
  }, [branchCount, stemHeight, progress]);

  // Generate fruit positions
  const fruits = useMemo(() => {
    const arr = [];
    for (let i = 0; i < fruitCount; i++) {
      const angle = (i / fruitCount) * Math.PI * 2;
      const r = canopyRadius * 0.6 + Math.random() * 10;
      const cx = 100 + Math.cos(angle) * r;
      const cy = (180 - stemHeight * 0.85) + Math.sin(angle) * r * 0.6;
      arr.push({ cx, cy, delay: i * 0.25 });
    }
    return arr;
  }, [fruitCount, canopyRadius, stemHeight]);

  // Background forest trees
  const bgTrees = useMemo(() => {
    const arr = [];
    for (let i = 0; i < treeCount; i++) {
      const x = 15 + (i / treeCount) * 170;
      const h = 30 + Math.random() * 40;
      const w = 18 + Math.random() * 15;
      arr.push({ x, h, w, delay: i * 0.3 });
    }
    return arr;
  }, [treeCount]);

  return (
    <div className="relative w-full flex items-center justify-center" style={{ minHeight: 220 }}>
      <svg
        viewBox="0 0 200 200"
        className="w-full h-auto"
        style={{ maxWidth: 280, maxHeight: 260 }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradients */}
          <radialGradient id="skyGlow" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor={showWorld ? '#1a6b3c' : '#0e4429'} stopOpacity="0.4" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFD54F" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#FFB300" stopOpacity="0.3" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <linearGradient id="stemGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={leafGreen} />
            <stop offset="100%" stopColor={stemColor} />
          </linearGradient>
          <radialGradient id="canopyGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#43A047" />
            <stop offset="70%" stopColor={darkGreen} />
            <stop offset="100%" stopColor="#145A1E" stopOpacity="0.8" />
          </radialGradient>
          <linearGradient id="soilGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5D4037" />
            <stop offset="100%" stopColor="#3E2723" />
          </linearGradient>

          {/* Leaf shape */}
          <path id="leafShape" d="M0,0 C3,-6 10,-8 12,-2 C13,1 8,4 0,0Z" />

          {/* Glow filter */}
          <filter id="glow">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
          </filter>

          {/* Particle sparkle */}
          <circle id="sparkle" r="1.2" fill="#FFD54F" opacity="0.8" />
        </defs>

        {/* === Sky Background === */}
        <rect x="0" y="0" width="200" height="200" rx="20" fill={skyBot} />
        <ellipse cx="100" cy="90" rx="90" ry="70" fill="url(#skyGlow)" />

        {/* === Sun / Moon (appears after day 5) === */}
        {progress > 0.2 && (
          <g>
            <circle
              cx="155" cy="30" r={6 + progress * 6}
              fill="url(#sunGlow)"
              style={{ animation: 'pulse 3s ease-in-out infinite' }}
            />
            <circle cx="155" cy="30" r={3 + progress * 3} fill="#FFD54F" opacity="0.9" />
          </g>
        )}

        {/* === Stars (forest / world stages) === */}
        {showForest && [
          [25,18],[50,12],[140,20],[170,35],[30,40],[160,10]
        ].map(([x,y], i) => (
          <circle key={`star-${i}`} cx={x} cy={y} r="0.8" fill="white" opacity="0.5"
            style={{ animation: `twinkle ${1.5 + i*0.3}s ease-in-out infinite` }} />
        ))}

        {/* === Background Forest Trees === */}
        {bgTrees.map((t, i) => (
          <g key={`bgtree-${i}`} style={{ animation: `growUp 0.8s ${t.delay}s both ease-out` }}>
            {/* Trunk */}
            <rect
              x={t.x - 2} y={185 - t.h} width="4" height={t.h - 5}
              fill="#5D4037" rx="2"
            />
            {/* Canopy */}
            <ellipse
              cx={t.x} cy={185 - t.h}
              rx={t.w / 2} ry={t.w / 2.5}
              fill={i % 2 === 0 ? '#2E7D32' : '#388E3C'}
              opacity="0.75"
            />
          </g>
        ))}

        {/* === Soil / Ground === */}
        <ellipse cx="100" cy="185" rx={showForest ? 95 : 45 + progress * 30} ry="12" fill="url(#soilGrad)" />

        {/* === Main Stem (grows upward dynamically) === */}
        {progress > 0.02 && (
          <line
            x1="100" y1="180"
            x2="100" y2={180 - stemHeight}
            stroke="url(#stemGrad)"
            strokeWidth={stemWidth}
            strokeLinecap="round"
            style={{
              strokeDasharray: stemHeight,
              strokeDashoffset: 0,
              animation: `drawStem 1.5s ease-out both`,
            }}
          />
        )}

        {/* === Branches === */}
        {branches.map((b, i) => (
          <line
            key={`branch-${i}`}
            x1="100" y1={b.y}
            x2={100 + b.side * b.len} y2={b.y - 8}
            stroke={stemColor}
            strokeWidth={2}
            strokeLinecap="round"
            style={{ animation: `growBranch 0.6s ${b.delay}s both ease-out` }}
          />
        ))}

        {/* === Leaves (grow along stem) === */}
        {leaves.map((l, i) => (
          <g
            key={`leaf-${i}`}
            transform={`translate(${100 + l.side * 3}, ${l.y}) rotate(${l.angle})`}
            style={{
              animation: `leafAppear 0.5s ${l.delay}s both ease-out`,
              transformOrigin: '0 0',
            }}
          >
            <ellipse
              cx={l.side * l.size * 0.6}
              cy={-l.size * 0.2}
              rx={l.size * 0.7}
              ry={l.size * 0.35}
              fill={i % 3 === 0 ? '#81C784' : leafGreen}
              opacity="0.9"
            />
            {/* Leaf vein */}
            <line
              x1="0" y1="0"
              x2={l.side * l.size * 0.5} y2={-l.size * 0.15}
              stroke="#A5D6A7"
              strokeWidth="0.5"
              opacity="0.6"
            />
          </g>
        ))}

        {/* === Tree Canopy (appears mid-growth) === */}
        {canopyRadius > 5 && (
          <g style={{ animation: 'canopyGrow 1s 0.5s both ease-out' }}>
            <ellipse
              cx="100"
              cy={180 - stemHeight * 0.85}
              rx={canopyRadius}
              ry={canopyRadius * 0.75}
              fill="url(#canopyGrad)"
              opacity="0.9"
            />
            {/* Canopy highlight */}
            <ellipse
              cx="95"
              cy={180 - stemHeight * 0.88}
              rx={canopyRadius * 0.5}
              ry={canopyRadius * 0.35}
              fill="#66BB6A"
              opacity="0.25"
            />
          </g>
        )}

        {/* === Golden Fruits === */}
        {fruits.map((f, i) => (
          <g key={`fruit-${i}`} style={{ animation: `fruitDrop 0.6s ${f.delay}s both ease-out` }}>
            <circle cx={f.cx} cy={f.cy} r="3" fill={gold} opacity="0.9" />
            <circle cx={f.cx - 0.8} cy={f.cy - 0.8} r="1" fill="white" opacity="0.4" />
          </g>
        ))}

        {/* === Seed (visible on day 1-2) === */}
        {progress < 0.15 && (
          <g style={{ animation: 'pulse 2s infinite ease-in-out' }}>
            <ellipse cx="100" cy="178" rx="5" ry="3.5" fill="#8D6E63" />
            <ellipse cx="100" cy="177" rx="3" ry="2" fill="#A1887F" opacity="0.5" />
          </g>
        )}

        {/* === World Globe (Stage 6) === */}
        {showWorld && (
          <g style={{ animation: 'worldAppear 1.5s ease-out both' }}>
            {/* Atmosphere glow */}
            <circle cx="100" cy="75" r="52" fill="none" stroke="#4CAF50" strokeWidth="1" opacity="0.3"
              style={{ animation: 'pulse 3s infinite' }} />
            <circle cx="100" cy="75" r="45" fill="#1B5E20" opacity="0.7" />
            {/* Ocean */}
            <circle cx="100" cy="75" r="45" fill="#0D47A1" opacity="0.4" />
            {/* Continents */}
            <ellipse cx="88" cy="68" rx="14" ry="10" fill="#2E7D32" opacity="0.8" />
            <ellipse cx="115" cy="78" rx="10" ry="12" fill="#388E3C" opacity="0.7" />
            <ellipse cx="97" cy="90" rx="8" ry="5" fill="#43A047" opacity="0.6" />
            {/* Sparkle crown */}
            {[0,60,120,180,240,300].map((a, i) => {
              const rad = (a * Math.PI) / 180;
              return (
                <circle key={`ws-${i}`}
                  cx={100 + Math.cos(rad) * 50} cy={75 + Math.sin(rad) * 50}
                  r="1.5" fill="#FFD54F"
                  style={{ animation: `twinkle ${1 + i * 0.2}s infinite ease-in-out` }}
                />
              );
            })}
            {/* Globe text */}
            <text x="100" y="110" textAnchor="middle" fill="#A5D6A7" fontSize="5" fontWeight="bold" opacity="0.8">
              🌍 Growth Empire Complete
            </text>
          </g>
        )}

        {/* === Floating Particles / Sparkles === */}
        {progress > 0.3 && (
          <g>
            {Array.from({ length: Math.floor(progress * 6) }).map((_, i) => (
              <circle
                key={`p-${i}`}
                cx={70 + Math.random() * 60}
                cy={40 + Math.random() * 100}
                r={0.8 + Math.random()}
                fill={i % 2 === 0 ? gold : '#A5D6A7'}
                opacity={0.3 + Math.random() * 0.4}
                style={{
                  animation: `floatUp ${3 + i * 0.5}s ${i * 0.4}s infinite ease-in-out`,
                }}
              />
            ))}
          </g>
        )}
      </svg>

      {/* Inject keyframe animations */}
      <style>{`
        @keyframes drawStem {
          from { stroke-dashoffset: ${stemHeight}; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes leafAppear {
          from { opacity: 0; transform: scale(0) rotate(0deg); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes growBranch {
          from { opacity: 0; stroke-dashoffset: 30; stroke-dasharray: 30; }
          to   { opacity: 1; stroke-dashoffset: 0; stroke-dasharray: 30; }
        }
        @keyframes canopyGrow {
          from { opacity: 0; transform: scale(0.1); }
          to   { opacity: 0.9; transform: scale(1); }
        }
        @keyframes fruitDrop {
          0%   { opacity: 0; transform: translateY(-8px) scale(0); }
          60%  { opacity: 1; transform: translateY(2px) scale(1.2); }
          100% { opacity: 0.9; transform: translateY(0) scale(1); }
        }
        @keyframes growUp {
          from { opacity: 0; transform: scaleY(0); transform-origin: bottom; }
          to   { opacity: 0.75; transform: scaleY(1); transform-origin: bottom; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50%      { opacity: 1;   transform: scale(1.08); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; }
          50%      { opacity: 0.9; }
        }
        @keyframes floatUp {
          0%   { transform: translateY(0) translateX(0); opacity: 0; }
          20%  { opacity: 0.6; }
          100% { transform: translateY(-30px) translateX(8px); opacity: 0; }
        }
        @keyframes worldAppear {
          from { opacity: 0; transform: scale(0.3) rotate(-20deg); }
          to   { opacity: 1; transform: scale(1) rotate(0deg); }
        }
      `}</style>
    </div>
  );
};

export default PlantGrowthAnimation;
