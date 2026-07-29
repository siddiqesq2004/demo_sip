import React, { useMemo } from 'react';

/**
 * PlantGrowthAnimation — Split-scene SVG: sky on top, soil cross-section
 * on bottom. Shows seed underground, roots growing, stem pushing through
 * the soil surface, leaves unfurling, tree canopy, forest, world.
 *
 * day=0 → empty field (no investment yet)
 * day=1 → seed visible in soil
 * day=2 → seed cracks, tiny root
 * day=3-5 → roots spread, tiny sprout breaks surface
 * day=6-10 → stem grows, leaves appear
 * day=11-15 → branches, canopy forming
 * day=16-19 → full tree with golden fruits
 * day=20-21 → forest of trees behind
 * day=22 → world globe rises above forest
 */
const PlantGrowthAnimation = ({ day = 0, totalDays = 22 }) => {
  const p = Math.min(day / totalDays, 1); // 0→1 progress

  // ---- Derived measurements ----
  const GROUND_Y = 130;           // where sky meets soil
  const SKY_H = GROUND_Y;         // sky region height
  const SOIL_H = 200 - GROUND_Y;  // soil region height

  // Seed
  const showSeed = day >= 1 && day <= 5;
  const seedCracked = day >= 2;
  const seedY = GROUND_Y + 22;    // seed sits underground

  // Roots (visible through soil cross-section)
  const rootCount = day >= 2 ? Math.min(day - 1, 6) : 0;
  const rootMaxLen = Math.min((day - 1) * 7, 40);

  // Sprout / Stem above ground
  const sproutVisible = day >= 3;
  const stemAboveGround = sproutVisible ? Math.min((day - 2) * 10, 90) : 0;
  const stemBelowGround = day >= 2 ? Math.min((day - 1) * 4, 18) : 0;
  const stemThickness = 2 + Math.min(p * 4, 4);

  // Leaves
  const leafCount = day >= 4 ? Math.min(day - 3, 10) : 0;

  // Canopy (tree crown)
  const canopyR = day >= 11 ? Math.min((day - 10) * 5, 35) : 0;

  // Fruits
  const fruitCount = day >= 14 ? Math.min(day - 13, 8) : 0;

  // Background forest trees
  const forestTreeCount = day >= 18 ? Math.min(day - 17, 6) : 0;

  // World globe
  const showWorld = day >= 22;

  // Sun visibility and size
  const sunR = day >= 3 ? 6 + Math.min((day - 2) * 0.8, 10) : 0;

  // Colors
  const skyColorTop = showWorld ? '#0a1628' : day >= 18 ? '#0d2137' : '#4da6c9';
  const skyColorBot = showWorld ? '#1a3a2a' : day >= 18 ? '#1a5c3a' : '#87CEEB';
  const soilColorTop = '#5D4037';
  const soilColorBot = '#3E2723';

  // ---- Leaf generation ----
  const leaves = useMemo(() => {
    const arr = [];
    const stemTop = GROUND_Y - stemAboveGround;
    for (let i = 0; i < leafCount; i++) {
      const frac = 0.2 + (i / Math.max(leafCount, 1)) * 0.7;
      const y = GROUND_Y - stemAboveGround * frac;
      const side = i % 2 === 0 ? -1 : 1;
      const sz = 6 + Math.min(p * 10, 10);
      arr.push({ y, side, sz, delay: i * 0.12 });
    }
    return arr;
  }, [leafCount, stemAboveGround, p, GROUND_Y]);

  // ---- Root generation ----
  const roots = useMemo(() => {
    const arr = [];
    for (let i = 0; i < rootCount; i++) {
      const angle = -30 + (i / Math.max(rootCount - 1, 1)) * 60;  // spread -30° to +30°
      const len = rootMaxLen * (0.5 + Math.random() * 0.5);
      arr.push({ angle, len, delay: i * 0.15 });
    }
    return arr;
  }, [rootCount, rootMaxLen]);

  // ---- Fruit positions ----
  const fruits = useMemo(() => {
    const arr = [];
    const canopyCY = GROUND_Y - stemAboveGround - canopyR * 0.1;
    for (let i = 0; i < fruitCount; i++) {
      const a = (i / fruitCount) * Math.PI * 1.6 + 0.3;
      const r = canopyR * 0.55;
      arr.push({
        cx: 100 + Math.cos(a) * r,
        cy: canopyCY + Math.sin(a) * r * 0.65 + 5,
        delay: i * 0.2,
      });
    }
    return arr;
  }, [fruitCount, canopyR, stemAboveGround, GROUND_Y]);

  // ---- Forest trees ----
  const fTrees = useMemo(() => {
    const arr = [];
    const positions = [18, 40, 62, 138, 160, 182];
    for (let i = 0; i < forestTreeCount; i++) {
      const x = positions[i % positions.length];
      const h = 25 + Math.random() * 30;
      const cr = 12 + Math.random() * 8;
      arr.push({ x, h, cr, delay: i * 0.25 });
    }
    return arr;
  }, [forestTreeCount]);

  const stemTopY = GROUND_Y - stemAboveGround;
  const canopyCY = stemTopY - canopyR * 0.1;

  return (
    <div className="relative w-full flex items-center justify-center" style={{ minHeight: 240 }}>
      <svg
        viewBox="0 0 200 200"
        className="w-full h-auto"
        style={{ maxWidth: 300, maxHeight: 280 }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={skyColorTop} />
            <stop offset="100%" stopColor={skyColorBot} />
          </linearGradient>
          <linearGradient id="soilGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={soilColorTop} />
            <stop offset="100%" stopColor={soilColorBot} />
          </linearGradient>
          <linearGradient id="stemGrad" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#5D4037" />
            <stop offset="40%" stopColor="#388E3C" />
            <stop offset="100%" stopColor="#66BB6A" />
          </linearGradient>
          <radialGradient id="canopyGrad" cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#66BB6A" />
            <stop offset="60%" stopColor="#2E7D32" />
            <stop offset="100%" stopColor="#1B5E20" />
          </radialGradient>
          <radialGradient id="sunGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFF176" />
            <stop offset="50%" stopColor="#FFD54F" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#FFB300" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="grassGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4CAF50" />
            <stop offset="100%" stopColor="#388E3C" />
          </linearGradient>
        </defs>

        {/* ====== SKY ====== */}
        <rect x="0" y="0" width="200" height={GROUND_Y} fill="url(#skyGrad)" />

        {/* Clouds */}
        {day >= 4 && (
          <g opacity="0.3">
            <ellipse cx="45" cy="25" rx="20" ry="7" fill="white" style={{ animation: 'cloudDrift 12s linear infinite' }} />
            <ellipse cx="140" cy="18" rx="16" ry="5" fill="white" style={{ animation: 'cloudDrift 15s 3s linear infinite' }} />
          </g>
        )}

        {/* Sun */}
        {sunR > 0 && (
          <g>
            <circle cx="160" cy="28" r={sunR + 6} fill="url(#sunGrad)" style={{ animation: 'sunPulse 4s ease-in-out infinite' }} />
            <circle cx="160" cy="28" r={sunR * 0.5} fill="#FFF176" />
          </g>
        )}

        {/* Stars for night/forest stages */}
        {day >= 18 && [
          [20,15],[50,10],[80,20],[130,12],[170,22],[35,35],[155,8]
        ].map(([x,y], i) => (
          <circle key={`s${i}`} cx={x} cy={y} r="0.8" fill="white"
            style={{ animation: `twinkle ${1.2 + i*0.3}s ease-in-out infinite` }} />
        ))}

        {/* ====== GRASS STRIP on soil surface ====== */}
        <rect x="0" y={GROUND_Y - 3} width="200" height="6" fill="url(#grassGrad)" rx="1" />
        {/* Grass blades */}
        {day >= 4 && Array.from({ length: 12 }).map((_, i) => {
          const gx = 8 + i * 16;
          const gh = 4 + Math.random() * 5;
          return (
            <line key={`g${i}`} x1={gx} y1={GROUND_Y - 3} x2={gx + (i%2===0?2:-2)} y2={GROUND_Y - 3 - gh}
              stroke="#66BB6A" strokeWidth="1.2" strokeLinecap="round"
              style={{ animation: `grassSway 2s ${i*0.15}s ease-in-out infinite` }} />
          );
        })}

        {/* ====== SOIL (cross-section) ====== */}
        <rect x="0" y={GROUND_Y} width="200" height={SOIL_H} fill="url(#soilGrad)" />
        {/* Soil texture dots */}
        {[
          [30,145],[55,155],[80,148],[120,160],[150,142],[170,155],[45,162],[100,168],[135,150],[70,158]
        ].map(([x,y], i) => (
          <circle key={`sd${i}`} cx={x} cy={y} r={1 + Math.random()} fill="#4E342E" opacity="0.4" />
        ))}
        {/* Small rocks */}
        <ellipse cx="55" cy="170" rx="4" ry="2.5" fill="#6D4C41" opacity="0.5" />
        <ellipse cx="145" cy="165" rx="3" ry="2" fill="#5D4037" opacity="0.4" />

        {/* ====== BACKGROUND FOREST TREES ====== */}
        {fTrees.map((t, i) => (
          <g key={`ft${i}`} style={{ animation: `treeGrow 0.8s ${t.delay}s both ease-out`, transformOrigin: `${t.x}px ${GROUND_Y}px` }}>
            <rect x={t.x - 2.5} y={GROUND_Y - t.h} width="5" height={t.h} fill="#5D4037" rx="2" />
            <circle cx={t.x} cy={GROUND_Y - t.h - t.cr * 0.3} r={t.cr} fill={i%2===0 ? '#2E7D32' : '#388E3C'} opacity="0.7" />
          </g>
        ))}

        {/* ====== SEED (underground, visible days 1-5) ====== */}
        {showSeed && (
          <g style={{ animation: 'seedAppear 0.8s ease-out both' }}>
            {/* Seed body */}
            <ellipse cx="100" cy={seedY} rx={seedCracked ? 6 : 5} ry={seedCracked ? 4 : 3.5}
              fill="#8D6E63" stroke="#6D4C41" strokeWidth="0.5" />
            {/* Seed highlight */}
            <ellipse cx="99" cy={seedY - 1} rx="3" ry="1.5" fill="#A1887F" opacity="0.5" />
            {/* Crack line */}
            {seedCracked && (
              <line x1="97" y1={seedY - 2} x2="103" y2={seedY + 1}
                stroke="#4E342E" strokeWidth="0.8" strokeLinecap="round"
                style={{ animation: 'crackOpen 0.5s 0.3s both ease-out' }} />
            )}
          </g>
        )}

        {/* ====== ROOTS (underground, visible from day 2+) ====== */}
        {roots.map((r, i) => {
          const rad = ((90 + r.angle) * Math.PI) / 180;
          const x2 = 100 + Math.cos(rad) * r.len;
          const y2 = seedY + Math.sin(rad) * r.len;
          return (
            <g key={`root${i}`}>
              <line x1="100" y1={seedY + 3} x2={x2} y2={y2}
                stroke="#8D6E63" strokeWidth={1.5 - i * 0.1} strokeLinecap="round"
                style={{
                  strokeDasharray: r.len,
                  animation: `drawRoot ${0.8}s ${r.delay}s both ease-out`,
                }} />
              {/* Root tip */}
              {r.len > 10 && (
                <circle cx={x2} cy={y2} r="1" fill="#A1887F" opacity="0.7"
                  style={{ animation: `fadeIn 0.3s ${r.delay + 0.6}s both` }} />
              )}
              {/* Root hair branches */}
              {r.len > 15 && (
                <line
                  x1={100 + Math.cos(rad) * r.len * 0.6}
                  y1={seedY + 3 + Math.sin(rad) * r.len * 0.6}
                  x2={100 + Math.cos(rad) * r.len * 0.6 + (i%2===0 ? 6 : -6)}
                  y2={seedY + 3 + Math.sin(rad) * r.len * 0.6 + 5}
                  stroke="#A1887F" strokeWidth="0.8" strokeLinecap="round"
                  style={{ animation: `drawRoot 0.5s ${r.delay + 0.4}s both ease-out`, strokeDasharray: 10 }}
                />
              )}
            </g>
          );
        })}

        {/* ====== STEM BELOW GROUND (connecting seed to surface) ====== */}
        {stemBelowGround > 0 && (
          <line x1="100" y1={seedY - 3} x2="100" y2={GROUND_Y}
            stroke="#6D8C5E" strokeWidth={Math.min(stemThickness * 0.7, 3)} strokeLinecap="round"
            style={{ strokeDasharray: stemBelowGround + 20, animation: 'drawStemUp 1s 0.2s both ease-out' }} />
        )}

        {/* ====== STEM ABOVE GROUND ====== */}
        {sproutVisible && (
          <line x1="100" y1={GROUND_Y} x2="100" y2={stemTopY}
            stroke="url(#stemGrad)" strokeWidth={stemThickness} strokeLinecap="round"
            style={{ strokeDasharray: stemAboveGround + 5, animation: 'drawStemUp 1.2s both ease-out' }} />
        )}

        {/* ====== LEAVES ====== */}
        {leaves.map((l, i) => {
          const tipX = 100 + l.side * l.sz;
          const tipY = l.y - l.sz * 0.4;
          return (
            <g key={`lf${i}`} style={{ animation: `leafGrow 0.5s ${l.delay}s both ease-out`, transformOrigin: `100px ${l.y}px` }}>
              {/* Leaf shape via quadratic bezier */}
              <path
                d={`M100,${l.y} Q${100 + l.side * l.sz * 0.5},${l.y - l.sz * 0.7} ${tipX},${tipY} Q${100 + l.side * l.sz * 0.7},${l.y + l.sz * 0.15} 100,${l.y}`}
                fill={i % 3 === 0 ? '#81C784' : i % 3 === 1 ? '#66BB6A' : '#4CAF50'}
                opacity="0.9"
              />
              {/* Leaf vein */}
              <line x1="100" y1={l.y} x2={tipX * 0.95 + 100 * 0.05} y2={tipY * 0.95 + l.y * 0.05}
                stroke="#A5D6A7" strokeWidth="0.4" opacity="0.5" />
            </g>
          );
        })}

        {/* ====== TREE CANOPY ====== */}
        {canopyR > 3 && (
          <g style={{ animation: 'canopyExpand 1s 0.3s both ease-out', transformOrigin: `100px ${canopyCY}px` }}>
            <circle cx="100" cy={canopyCY} r={canopyR} fill="url(#canopyGrad)" />
            {/* Light dapple */}
            <circle cx="94" cy={canopyCY - canopyR * 0.25} r={canopyR * 0.35} fill="#81C784" opacity="0.2" />
          </g>
        )}

        {/* ====== GOLDEN FRUITS ====== */}
        {fruits.map((f, i) => (
          <g key={`fr${i}`} style={{ animation: `fruitPop 0.5s ${f.delay}s both ease-out` }}>
            <circle cx={f.cx} cy={f.cy} r="3.5" fill="#FFD54F" />
            <circle cx={f.cx - 1} cy={f.cy - 1} r="1.2" fill="#FFF9C4" opacity="0.6" />
          </g>
        ))}

        {/* ====== WORLD GLOBE (day 22) ====== */}
        {showWorld && (
          <g style={{ animation: 'worldRise 1.5s both ease-out', transformOrigin: '100px 50px' }}>
            {/* Atmosphere glow */}
            <circle cx="100" cy="50" r="42" fill="none" stroke="#69F0AE" strokeWidth="1.5" opacity="0.2"
              style={{ animation: 'sunPulse 3s infinite' }} />
            {/* Globe */}
            <circle cx="100" cy="50" r="35" fill="#1565C0" opacity="0.7" />
            {/* Continents */}
            <ellipse cx="90" cy="43" rx="12" ry="9" fill="#2E7D32" opacity="0.85" />
            <ellipse cx="112" cy="52" rx="8" ry="11" fill="#388E3C" opacity="0.75" />
            <ellipse cx="96" cy="62" rx="7" ry="4" fill="#43A047" opacity="0.65" />
            <ellipse cx="80" cy="55" rx="5" ry="6" fill="#4CAF50" opacity="0.55" />
            {/* Ice caps */}
            <ellipse cx="100" cy="18" rx="10" ry="3" fill="white" opacity="0.3" />
            <ellipse cx="100" cy="82" rx="8" ry="2.5" fill="white" opacity="0.25" />
            {/* Sparkle ring */}
            {[0,45,90,135,180,225,270,315].map((a, i) => {
              const rad = (a * Math.PI) / 180;
              return (
                <circle key={`gsp${i}`}
                  cx={100 + Math.cos(rad) * 40} cy={50 + Math.sin(rad) * 40}
                  r="1.5" fill="#FFD54F"
                  style={{ animation: `twinkle ${0.8 + i * 0.15}s infinite ease-in-out` }} />
              );
            })}
          </g>
        )}

        {/* ====== FLOATING PARTICLES (pollen / sparkles) ====== */}
        {day >= 6 && Array.from({ length: Math.min(Math.floor(p * 8), 8) }).map((_, i) => (
          <circle key={`pt${i}`}
            cx={60 + i * 12} cy={GROUND_Y - 20 - i * 8}
            r={0.8 + Math.random() * 0.6}
            fill={i % 2 === 0 ? '#FFD54F' : '#A5D6A7'}
            opacity="0.5"
            style={{ animation: `floatUp ${4 + i}s ${i * 0.5}s infinite ease-in-out` }}
          />
        ))}

        {/* ====== EMPTY STATE (day 0 — no investment) ====== */}
        {day === 0 && (
          <text x="100" y={GROUND_Y - 15} textAnchor="middle" fill="#A5D6A7" fontSize="7" fontWeight="600" opacity="0.5">
            Start investing to plant your seed
          </text>
        )}
      </svg>

      {/* ====== CSS KEYFRAMES ====== */}
      <style>{`
        @keyframes seedAppear {
          from { opacity: 0; transform: translateY(5px) scale(0.5); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes crackOpen {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes drawRoot {
          from { stroke-dashoffset: 40; opacity: 0; }
          to   { stroke-dashoffset: 0; opacity: 1; }
        }
        @keyframes drawStemUp {
          from { stroke-dashoffset: 120; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes leafGrow {
          from { opacity: 0; transform: scale(0); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes canopyExpand {
          from { opacity: 0; transform: scale(0.15); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes fruitPop {
          0%   { opacity: 0; transform: scale(0); }
          70%  { opacity: 1; transform: scale(1.3); }
          100% { transform: scale(1); }
        }
        @keyframes treeGrow {
          from { opacity: 0; transform: scaleY(0); }
          to   { opacity: 0.7; transform: scaleY(1); }
        }
        @keyframes worldRise {
          from { opacity: 0; transform: scale(0.2) translateY(40px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes sunPulse {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50%      { opacity: 1;   transform: scale(1.1); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.15; }
          50%      { opacity: 0.85; }
        }
        @keyframes floatUp {
          0%   { transform: translateY(0); opacity: 0; }
          15%  { opacity: 0.6; }
          100% { transform: translateY(-25px) translateX(5px); opacity: 0; }
        }
        @keyframes cloudDrift {
          from { transform: translateX(-20px); }
          to   { transform: translateX(20px); }
        }
        @keyframes grassSway {
          0%, 100% { transform: rotate(0deg); }
          50%      { transform: rotate(5deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
};

export default PlantGrowthAnimation;
