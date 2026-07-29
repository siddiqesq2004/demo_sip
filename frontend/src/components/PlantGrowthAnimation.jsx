import React, { useMemo } from 'react';

/**
 * PlantGrowthAnimation
 *
 * ALWAYS shows half sky / half soil split.
 * Ground line at Y=100 (exact center of 200×200 viewBox).
 * Camera starts at 1:1 showing the full scene, then zooms OUT for tree/forest/world.
 * Roots use organic cubic bezier curves with natural branching.
 */
const PlantGrowthAnimation = ({ day = 0, totalDays = 22 }) => {
  const p = Math.min(day / totalDays, 1);
  const showWorld = day >= 22;

  /* ───── CAMERA ─────
     Early days: no zoom (scale=1), showing full half-sky / half-soil.
     Tree/Forest: zoom OUT to show more scene.
  */
  const getCamera = (d) => {
    if (d <= 12) return { s: 1.0, tx: 0, ty: 0 };       // full view, seed→plant
    if (d <= 17) return { s: 0.85, tx: 15, ty: 15 };     // slight zoom out for tree
    return { s: 0.55, tx: 45, ty: 48 };                   // wide zoom for forest
  };
  const cam = getCamera(day);

  /* ───── CONSTANTS ───── */
  const GY = 100; // ground line — exact center = half sky, half soil

  /* ───── DERIVED ───── */
  const showSeed      = day >= 1 && day <= 7;
  const seedCracked   = day >= 2;
  const seedY         = GY + 28;  // seed 28px underground
  const showRoots     = day >= 2 && day <= 17;
  const rootProgress  = day >= 2 ? Math.min((day - 1) / 8, 1) : 0;
  const sproutVisible = day >= 3;
  const stemH         = sproutVisible ? Math.min((day - 2) * 9, 65) : 0;
  const stemBelow     = day >= 2 ? Math.min((day - 1) * 5, 20) : 0;
  const stemW         = 2 + Math.min(p * 4, 4);
  const leafCount     = day >= 5 ? Math.min(day - 4, 10) : 0;
  const showTree      = day >= 12;
  const treeScale     = showTree ? Math.min((day - 11) / 5, 1) * 0.7 + 0.4 : 0;
  const fruitCount    = day >= 14 ? Math.min(day - 13, 8) : 0;
  const showForest    = day >= 18;
  const sunR          = day >= 1 ? 4 + Math.min(day * 0.6, 10) : 0;
  const stemTopY      = GY - stemH;

  /* ───── ORGANIC ROOTS (cubic beziers) ─────
     Origin point changes based on stage:
     - Seed stage (day 1-2): roots grow FROM the seed underground
     - Sprout/Plant/Tree (day 3+): roots grow FROM ground level (trunk base)
  */
  const rootOriginY = sproutVisible ? GY : seedY + 4;
  const rootThicknessScale = showTree ? 1.6 : 1.0; // thicker roots for tree

  const rootPaths = useMemo(() => {
    const SY = sproutVisible ? GY : seedY + 4;

    // Seed stage: small roots from seed
    const seedRoots = [
      { d: `M100,${SY} C100,${SY+10} 98,${SY+18} 96,${SY+28}`, w: 1.8, delay: 0 },
      { d: `M100,${SY} C97,${SY+7} 92,${SY+12} 86,${SY+18}`, w: 1.4, delay: 0.1 },
      { d: `M100,${SY} C103,${SY+7} 108,${SY+12} 114,${SY+18}`, w: 1.4, delay: 0.15 },
      { d: `M100,${SY} C96,${SY+5} 90,${SY+9} 82,${SY+14}`, w: 1.0, delay: 0.25 },
      { d: `M100,${SY} C104,${SY+5} 110,${SY+9} 118,${SY+14}`, w: 1.0, delay: 0.3 },
    ];

    // Plant/Tree stage: deeper, wider roots from trunk base
    const treeRoots = [
      // Main taproot — deep center
      { d: `M100,${SY} C100,${SY+14} 98,${SY+28} 96,${SY+42} C94,${SY+52} 92,${SY+60} 88,${SY+68}`, w: 2.8, delay: 0 },
      // Left primary — curves left and down
      { d: `M100,${SY} C96,${SY+5} 90,${SY+12} 82,${SY+20} C74,${SY+28} 66,${SY+34} 58,${SY+40}`, w: 2.2, delay: 0.08 },
      // Right primary — curves right and down
      { d: `M100,${SY} C104,${SY+5} 110,${SY+12} 118,${SY+20} C126,${SY+28} 134,${SY+34} 142,${SY+40}`, w: 2.2, delay: 0.12 },
      // Left secondary — shallower spread
      { d: `M100,${SY} C95,${SY+4} 88,${SY+8} 78,${SY+12} C68,${SY+16} 60,${SY+20} 52,${SY+24}`, w: 1.6, delay: 0.2 },
      // Right secondary
      { d: `M100,${SY} C105,${SY+4} 112,${SY+8} 122,${SY+12} C132,${SY+16} 140,${SY+20} 148,${SY+24}`, w: 1.6, delay: 0.24 },
      // Left branch off taproot
      { d: `M96,${SY+42} C88,${SY+46} 80,${SY+48} 72,${SY+52}`, w: 1.2, delay: 0.35 },
      // Right branch off taproot
      { d: `M96,${SY+42} C102,${SY+48} 110,${SY+50} 118,${SY+54}`, w: 1.2, delay: 0.38 },
      // Deep left fine root
      { d: `M82,${SY+20} C76,${SY+28} 70,${SY+34} 62,${SY+42}`, w: 0.9, delay: 0.45 },
      // Deep right fine root
      { d: `M118,${SY+20} C124,${SY+28} 130,${SY+34} 138,${SY+42}`, w: 0.9, delay: 0.48 },
      // Hair roots
      { d: `M58,${SY+40} C52,${SY+44} 46,${SY+48} 40,${SY+52}`, w: 0.6, delay: 0.55 },
      { d: `M142,${SY+40} C148,${SY+44} 154,${SY+48} 160,${SY+52}`, w: 0.6, delay: 0.58 },
    ];

    const allRoots = sproutVisible ? treeRoots : seedRoots;
    const count = Math.ceil(rootProgress * allRoots.length);

    return allRoots.slice(0, count).map(r => ({
      ...r,
      w: r.w * (showTree ? 1.5 : 1.0),
    }));
  }, [rootProgress, seedY, sproutVisible, showTree, GY]);

  /* ───── LEAVES ───── */
  const leaves = useMemo(() => {
    const arr = [];
    for (let i = 0; i < leafCount; i++) {
      const frac = 0.2 + (i / Math.max(leafCount, 1)) * 0.7;
      const y = GY - stemH * frac;
      const side = i % 2 === 0 ? -1 : 1;
      const sz = 5 + Math.min(p * 10, 10);
      arr.push({ y, side, sz, delay: i * 0.1 });
    }
    return arr;
  }, [leafCount, stemH, p, GY]);

  /* ───── SPACE STARS ───── */
  const spaceStars = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 80; i++) {
      arr.push({
        x: Math.random() * 200, y: Math.random() * 200,
        r: 0.2 + Math.random() * 1.0,
        delay: Math.random() * 3, dur: 1.5 + Math.random() * 2.5,
      });
    }
    return arr;
  }, []);

  /* ═══════ TREE CANOPY RENDERER ═══════ */
  const renderTree = (cx, baseY, s, showFruits = false, fCount = 0) => {
    const trunkH = 50 * s;
    const tw = 6 * s; // trunk half-width at base
    const ttw = 2.5 * s; // trunk half-width at top

    const canopy = [
      { dx: 0, dy: -8, r: 20 },
      { dx: -14, dy: 0, r: 16 },
      { dx: 14, dy: 0, r: 16 },
      { dx: -8, dy: -14, r: 13 },
      { dx: 8, dy: -14, r: 13 },
      { dx: 0, dy: 2, r: 14 },
      { dx: -20, dy: -4, r: 10 },
      { dx: 20, dy: -4, r: 10 },
    ];

    const fruitPos = [
      { dx: -12, dy: 2 }, { dx: 12, dy: 0 }, { dx: -18, dy: -2 },
      { dx: 18, dy: -4 }, { dx: -5, dy: -14 }, { dx: 8, dy: -12 },
      { dx: 0, dy: 4 }, { dx: -8, dy: 6 },
    ];

    const canopyCY = baseY - trunkH - 6 * s;

    return (
      <g>
        {/* Ground shadow */}
        <ellipse cx={cx} cy={baseY + 1} rx={18 * s} ry={3 * s} fill="#1a3a1a" opacity="0.25" />
        {/* Trunk */}
        <path d={`M${cx - tw},${baseY} L${cx - ttw},${baseY - trunkH} L${cx + ttw},${baseY - trunkH} L${cx + tw},${baseY}Z`}
          fill="#5D4037" />
        <line x1={cx - 1} y1={baseY} x2={cx - 0.5} y2={baseY - trunkH} stroke="#4E342E" strokeWidth={0.7 * s} opacity="0.3" />
        <line x1={cx + 1.5} y1={baseY - 5*s} x2={cx + 1} y2={baseY - trunkH + 3*s} stroke="#6D4C41" strokeWidth={0.4 * s} opacity="0.25" />
        {/* Branches */}
        <line x1={cx} y1={baseY - trunkH * 0.55} x2={cx - 16*s} y2={baseY - trunkH * 0.75}
          stroke="#5D4037" strokeWidth={2.5*s} strokeLinecap="round" />
        <line x1={cx} y1={baseY - trunkH * 0.65} x2={cx + 14*s} y2={baseY - trunkH * 0.82}
          stroke="#5D4037" strokeWidth={2*s} strokeLinecap="round" />
        {/* Canopy */}
        {canopy.map((b, i) => (
          <circle key={`c${i}`} cx={cx + b.dx * s} cy={canopyCY + b.dy * s} r={b.r * s}
            fill={['#2E7D32','#388E3C','#43A047','#4CAF50','#2E7D32','#33691E','#1B5E20','#388E3C'][i]}
            opacity={0.92 - i * 0.01} />
        ))}
        {/* Highlights */}
        <circle cx={cx - 6*s} cy={canopyCY - 10*s} r={6*s} fill="#66BB6A" opacity="0.2" />
        <circle cx={cx + 4*s} cy={canopyCY - 14*s} r={4*s} fill="#81C784" opacity="0.15" />
        {/* Fruits */}
        {showFruits && fruitPos.slice(0, fCount).map((f, i) => (
          <g key={`f${i}`} style={{ animation: `fruitBounce 0.5s ${i*0.12}s both ease-out` }}>
            <circle cx={cx + f.dx * s} cy={canopyCY + f.dy * s} r={3 * s} fill="#FFD54F" />
            <circle cx={cx + f.dx * s - 0.8*s} cy={canopyCY + f.dy * s - 0.8*s} r={1 * s} fill="#FFF9C4" opacity="0.5" />
          </g>
        ))}
      </g>
    );
  };

  /* ═══════ SMALL FOREST TREE ═══════ */
  const renderSmallTree = (cx, baseY, s, shade = 0, op = 0.85) => {
    const h = 35 * s;
    const tw = 2.5 * s;
    const cs = ['#1B5E20','#2E7D32','#388E3C'][shade % 3];
    const cl = ['#2E7D32','#388E3C','#43A047'][shade % 3];
    const cd = ['#33691E','#1B5E20','#2E7D32'][shade % 3];
    return (
      <g opacity={op}>
        <path d={`M${cx-tw},${baseY} L${cx-tw*0.4},${baseY-h} L${cx+tw*0.4},${baseY-h} L${cx+tw},${baseY}Z`} fill="#5D4037" />
        <circle cx={cx} cy={baseY - h - 6*s} r={10*s} fill={cs} />
        <circle cx={cx - 5*s} cy={baseY - h - 3*s} r={8*s} fill={cl} />
        <circle cx={cx + 5*s} cy={baseY - h - 3*s} r={8*s} fill={cd} />
        <circle cx={cx} cy={baseY - h - 12*s} r={6*s} fill={cl} opacity="0.85" />
      </g>
    );
  };

  return (
    <div className="relative w-full flex items-center justify-center overflow-hidden" style={{ minHeight: 240 }}>
      <svg viewBox="0 0 200 200" className="w-full h-auto"
        style={{ maxWidth: 310, maxHeight: 290 }} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="skyG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={day >= 18 ? '#0a1a30' : '#4ab0d8'} />
            <stop offset="100%" stopColor={day >= 18 ? '#163832' : '#87CEEB'} />
          </linearGradient>
          <linearGradient id="soilG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7B5B3A" />
            <stop offset="30%" stopColor="#5D4037" />
            <stop offset="100%" stopColor="#3E2723" />
          </linearGradient>
          <linearGradient id="stemG" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#5D4037" />
            <stop offset="30%" stopColor="#33691E" />
            <stop offset="100%" stopColor="#66BB6A" />
          </linearGradient>
          <radialGradient id="sunG" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFF9C4" />
            <stop offset="40%" stopColor="#FFD54F" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#FFB300" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="grassG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7CB342" />
            <stop offset="100%" stopColor="#558B2F" />
          </linearGradient>
          {/* Earth */}
          <radialGradient id="earthOcean" cx="38%" cy="35%" r="58%">
            <stop offset="0%" stopColor="#42A5F5" />
            <stop offset="50%" stopColor="#1E88E5" />
            <stop offset="100%" stopColor="#0D47A1" />
          </radialGradient>
          <radialGradient id="earthAtmo" cx="50%" cy="50%" r="50%">
            <stop offset="82%" stopColor="transparent" />
            <stop offset="92%" stopColor="#4FC3F7" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#81D4FA" stopOpacity="0.05" />
          </radialGradient>
          <radialGradient id="earthShine" cx="30%" cy="30%" r="60%">
            <stop offset="0%" stopColor="white" stopOpacity="0.08" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <radialGradient id="spaceG" cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor="#0a0e1a" />
            <stop offset="100%" stopColor="#020408" />
          </radialGradient>
        </defs>

        {showWorld ? (
          /* ═══════ DAY 22: OUTER SPACE ═══════ */
          <g>
            <rect x="0" y="0" width="200" height="200" fill="url(#spaceG)" rx="12" />
            {spaceStars.map((s, i) => (
              <circle key={`ss${i}`} cx={s.x} cy={s.y} r={s.r}
                fill={i%7===0 ? '#ffe0b2' : i%11===0 ? '#bbdefb' : 'white'}
                opacity={0.2 + (i%5)*0.12}
                style={{ animation: `twinkle ${s.dur}s ${s.delay}s ease-in-out infinite` }} />
            ))}
            <ellipse cx="30" cy="25" rx="18" ry="6" fill="#7C4DFF" opacity="0.04" transform="rotate(-15 30 25)" />

            <g style={{ animation: 'earthAppear 2s ease-out both' }}>
              <circle cx="100" cy="96" r="80" fill="url(#earthAtmo)" />
              <circle cx="100" cy="96" r="68" fill="url(#earthOcean)" />
              {/* Continents */}
              <path d="M65,62 Q58,68 60,78 Q62,85 70,88 Q78,86 82,80 Q85,72 80,65 Q75,60 65,62Z" fill="#2E7D32" opacity="0.9" />
              <path d="M72,95 Q68,102 70,115 Q73,125 78,128 Q82,125 83,118 Q84,108 80,98 Q76,93 72,95Z" fill="#388E3C" opacity="0.85" />
              <path d="M100,60 Q96,65 98,72 Q100,78 104,75 Q106,70 105,63 Q103,58 100,60Z" fill="#43A047" opacity="0.8" />
              <path d="M98,82 Q94,90 96,105 Q100,118 106,122 Q112,118 113,108 Q112,95 108,88 Q104,82 98,82Z" fill="#2E7D32" opacity="0.88" />
              <path d="M110,55 Q105,58 108,65 Q112,72 120,75 Q130,78 138,74 Q142,68 138,62 Q132,55 124,54 Q116,53 110,55Z" fill="#33691E" opacity="0.85" />
              <path d="M118,78 Q115,84 116,92 Q118,97 122,95 Q124,90 123,83 Q121,78 118,78Z" fill="#4CAF50" opacity="0.8" />
              <path d="M135,108 Q130,112 132,120 Q136,125 142,123 Q146,118 144,112 Q140,108 135,108Z" fill="#388E3C" opacity="0.82" />
              <ellipse cx="85" cy="70" rx="6" ry="4" fill="#66BB6A" opacity="0.5" />
              <ellipse cx="128" cy="85" rx="4" ry="6" fill="#4CAF50" opacity="0.45" />
              {/* Tree dots */}
              {Array.from({ length: 30 }).map((_, i) => {
                const a = (i / 30) * Math.PI * 2 + 0.3;
                const d = 20 + (i * 13) % 40;
                const tx = 100 + Math.cos(a) * d;
                const ty = 96 + Math.sin(a) * d * 0.9;
                if (Math.sqrt((tx-100)**2 + (ty-96)**2) > 63) return null;
                return <circle key={`td${i}`} cx={tx} cy={ty} r={0.8 + (i%3)*0.4}
                  fill={['#1B5E20','#2E7D32','#388E3C','#43A047'][i%4]} opacity={0.5 + (i%3)*0.1} />;
              })}
              <ellipse cx="100" cy="32" rx="18" ry="6" fill="white" opacity="0.3" />
              <ellipse cx="100" cy="161" rx="14" ry="4" fill="white" opacity="0.2" />
              <ellipse cx="80" cy="72" rx="16" ry="2.5" fill="white" opacity="0.14"
                style={{ animation: 'cloudDrift 22s linear infinite' }} />
              <ellipse cx="120" cy="100" rx="12" ry="2" fill="white" opacity="0.12"
                style={{ animation: 'cloudDrift 28s 6s linear infinite' }} />
              <circle cx="100" cy="96" r="68" fill="url(#earthShine)" />
              <ellipse cx="140" cy="96" rx="55" ry="68" fill="black" opacity="0.08" />
            </g>

            {[0,45,90,135,180,225,270,315].map((a, i) => {
              const rad = (a * Math.PI) / 180;
              return <circle key={`op${i}`} cx={100 + Math.cos(rad) * 78} cy={96 + Math.sin(rad) * 76}
                r={0.8 + (i%3)*0.5} fill={i%2===0 ? '#FFD54F' : '#69F0AE'}
                style={{ animation: `twinkle ${0.6+i*0.12}s infinite ease-in-out ${i*0.1}s` }} />;
            })}
            <line x1="20" y1="10" x2="42" y2="20" stroke="white" strokeWidth="0.7" opacity="0"
              style={{ animation: 'shootingStar 5s 2s infinite' }} />
            <text x="100" y="186" textAnchor="middle" fill="#69F0AE" fontSize="6" fontWeight="700" opacity="0.5"
              style={{ animation: 'fadeIn 2s 1s both' }}>🌍 Evergreen Planet</text>
          </g>
        ) : (
          /* ═══════ DAYS 0-21: GROUND SCENE ═══════ */
          <>
            <rect x="-200" y="-200" width="600" height="600"
              fill={day >= 18 ? '#0a1a30' : '#4ab0d8'} />

            <g style={{
              transform: `scale(${cam.s}) translate(${cam.tx}px, ${cam.ty}px)`,
              transition: 'transform 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
              transformOrigin: '100px 100px',
            }}>

              {/* ── SKY ── */}
              <rect x="-150" y="-250" width="500" height={GY + 250} fill="url(#skyG)" />

              {/* Clouds */}
              {day >= 3 && (
                <g opacity={day >= 18 ? 0.15 : 0.3}>
                  <ellipse cx="35" cy="30" rx="18" ry="6" fill="white"
                    style={{ animation: 'cloudDrift 14s linear infinite' }} />
                  <ellipse cx="40" cy="27" rx="12" ry="4.5" fill="white" />
                  <ellipse cx="145" cy="22" rx="14" ry="5" fill="white"
                    style={{ animation: 'cloudDrift 18s 4s linear infinite' }} />
                  <ellipse cx="150" cy="19" rx="9" ry="3.5" fill="white" />
                </g>
              )}

              {/* Sun */}
              {sunR > 0 && (
                <g>
                  <circle cx="170" cy="22" r={sunR + 7} fill="url(#sunG)"
                    style={{ animation: 'sunPulse 4s ease-in-out infinite' }} />
                  <circle cx="170" cy="22" r={sunR * 0.4} fill="#FFF9C4" />
                </g>
              )}

              {/* Night stars */}
              {day >= 18 && [
                [15,10],[45,5],[75,18],[125,8],[165,20],[25,35],[180,12],[55,28],[135,32],[95,-5],[-20,15],[210,25]
              ].map(([x,y], i) => (
                <circle key={`ns${i}`} cx={x} cy={y} r={0.5+(i%3)*0.3} fill="white"
                  style={{ animation: `twinkle ${1+i*0.2}s ease-in-out infinite ${i*0.15}s` }} />
              ))}

              {/* Hills for forest */}
              {day >= 16 && (
                <g style={{ animation: 'fadeIn 1s both' }}>
                  <ellipse cx="-20" cy={GY} rx="90" ry="30" fill="#1B5E20" opacity="0.2" />
                  <ellipse cx="100" cy={GY} rx="110" ry="18" fill="#2E7D32" opacity="0.15" />
                  <ellipse cx="220" cy={GY} rx="80" ry="25" fill="#1B5E20" opacity="0.18" />
                </g>
              )}

              {/* ── FOREST TREES (3 layers) ── */}
              {showForest && (
                <g>
                  {/* Back */}
                  {[-60,-30,0,30,60,140,170,200,230,260].map((x, i) => (
                    <g key={`bf${i}`} style={{ animation: `treeGrow 0.8s ${0.1+i*0.08}s both ease-out`, transformOrigin: `${x}px ${GY-6}px` }}>
                      {renderSmallTree(x, GY - 6, 0.5, i, 0.45)}
                    </g>
                  ))}
                  {/* Mid */}
                  {[-40,-10,20,50,75,125,155,185,215,245].map((x, i) => (
                    <g key={`mf${i}`} style={{ animation: `treeGrow 0.9s ${0.25+i*0.1}s both ease-out`, transformOrigin: `${x}px ${GY-2}px` }}>
                      {renderSmallTree(x, GY - 2, 0.7, i + 1, 0.65)}
                    </g>
                  ))}
                  {/* Front */}
                  {[-50,-20,15,45,70,130,160,190,220,250].map((x, i) => (
                    <g key={`ff${i}`} style={{ animation: `treeGrow 1s ${0.4+i*0.12}s both ease-out`, transformOrigin: `${x}px ${GY}px` }}>
                      {renderSmallTree(x, GY, 0.9, i + 2, 0.85)}
                    </g>
                  ))}
                </g>
              )}

              {/* ── MAIN TREE (days 12+) ── */}
              {showTree && (
                <g style={{ animation: 'treeGrow 1.2s both ease-out', transformOrigin: `100px ${GY}px` }}>
                  {renderTree(100, GY, treeScale, fruitCount > 0, fruitCount)}
                </g>
              )}

              {/* ── GRASS ── */}
              <rect x="-150" y={GY - 2} width="500" height="5" fill="url(#grassG)" />
              {day >= 3 && Array.from({ length: 30 }).map((_, i) => {
                const gx = -40 + i * 10;
                const gh = 3 + (i * 7 % 5);
                return (
                  <line key={`gr${i}`} x1={gx} y1={GY - 2} x2={gx + (i%2===0?1.5:-1.5)} y2={GY - 2 - gh}
                    stroke="#8BC34A" strokeWidth="0.8" strokeLinecap="round"
                    style={{ animation: `grassSway 2.5s ${i*0.08}s ease-in-out infinite` }} />
                );
              })}

              {/* ── SOIL ── */}
              <rect x="-150" y={GY} width="500" height="250" fill="url(#soilG)" />
              {/* Soil texture */}
              {[
                [30,120,3,1.5],[65,140,2,1.3],[130,125,2.5,1.5],[160,135,2,1.2],
                [50,155,3.5,2],[140,150,2.5,1.5],[80,165,2,1.8],[110,170,3,1.5]
              ].map(([x,y,rx,ry], i) => (
                <ellipse key={`pb${i}`} cx={x} cy={y} rx={rx} ry={ry}
                  fill={i%2===0 ? '#795548' : '#6D4C41'} opacity="0.3" />
              ))}
              {/* Earthworm */}
              {day >= 2 && day <= 10 && (
                <path d="M55,140 C58,137 62,139 65,137 C68,135 72,137 75,136" fill="none"
                  stroke="#E8B4B8" strokeWidth="1.2" strokeLinecap="round" opacity="0.35"
                  style={{ animation: 'wormWiggle 3s ease-in-out infinite' }} />
              )}

              {/* ── SEED ── */}
              {showSeed && (
                <g style={{ animation: 'seedDrop 0.6s ease-out both' }}>
                  {/* Seed body — visible brown oval in soil */}
                  <ellipse cx="100" cy={seedY} rx={seedCracked ? 7 : 6} ry={seedCracked ? 5 : 4.5}
                    fill="#A1887F" stroke="#795548" strokeWidth="0.8" />
                  {/* Inner stripe */}
                  <ellipse cx="100" cy={seedY} rx="3.5" ry={seedCracked ? 4.5 : 4}
                    fill="none" stroke="#8D6E63" strokeWidth="0.5" opacity="0.5" />
                  {/* Highlight */}
                  <ellipse cx="98" cy={seedY - 1.5} rx="3" ry="1.5" fill="#BCAAA4" opacity="0.5" />
                  {/* Crack */}
                  {seedCracked && (
                    <path d={`M97,${seedY - 4} C99,${seedY - 2} 100,${seedY + 1} 103,${seedY - 1}`}
                      fill="none" stroke="#4E342E" strokeWidth="1" strokeLinecap="round"
                      style={{ animation: 'crackDraw 0.5s 0.3s both ease-out' }} />
                  )}
                </g>
              )}

              {/* ── ORGANIC ROOTS ── */}
              {showRoots && rootPaths.map((r, i) => (
                <path key={`rt${i}`} d={r.d}
                  fill="none" stroke="#A1887F" strokeWidth={r.w} strokeLinecap="round"
                  style={{
                    strokeDasharray: 120,
                    strokeDashoffset: 120,
                    animation: `drawLine 1s ${r.delay}s both ease-out`,
                  }} />
              ))}

              {/* ── STEM BELOW GROUND ── */}
              {stemBelow > 0 && !showTree && (
                <line x1="100" y1={seedY - 4} x2="100" y2={GY}
                  stroke="#6D8C5E" strokeWidth={Math.min(stemW * 0.7, 3)} strokeLinecap="round"
                  style={{ strokeDasharray: 40, strokeDashoffset: 40, animation: 'drawLine 0.8s 0.2s both ease-out' }} />
              )}

              {/* ── STEM ABOVE GROUND ── */}
              {sproutVisible && !showTree && (
                <line x1="100" y1={GY} x2="100" y2={stemTopY}
                  stroke="url(#stemG)" strokeWidth={stemW} strokeLinecap="round"
                  style={{ strokeDasharray: stemH + 5, strokeDashoffset: stemH + 5, animation: 'drawLine 1.2s both ease-out' }} />
              )}

              {/* ── LEAVES ── */}
              {!showTree && leaves.map((l, i) => {
                const tipX = 100 + l.side * l.sz;
                const tipY = l.y - l.sz * 0.35;
                return (
                  <g key={`lf${i}`}
                    style={{ animation: `leafPop 0.45s ${l.delay}s both ease-out`, transformOrigin: `100px ${l.y}px` }}>
                    <path d={`M100,${l.y} Q${100+l.side*l.sz*0.4},${l.y-l.sz*0.65} ${tipX},${tipY} Q${100+l.side*l.sz*0.65},${l.y+l.sz*0.1} 100,${l.y}`}
                      fill={['#81C784','#66BB6A','#4CAF50','#43A047'][i%4]} opacity="0.92" />
                    <line x1="100" y1={l.y} x2={100+l.side*l.sz*0.85} y2={l.y-l.sz*0.28}
                      stroke="#A5D6A7" strokeWidth="0.4" opacity="0.4" />
                  </g>
                );
              })}

              {/* Particles */}
              {day >= 6 && day < 18 && Array.from({ length: Math.min(day - 5, 8) }).map((_, i) => (
                <circle key={`fp${i}`} cx={70 + i * 8} cy={GY - 20 - i * 6}
                  r={0.7 + (i%3)*0.4} fill={['#FFD54F','#A5D6A7','#FFF9C4'][i%3]}
                  style={{ animation: `floatUp ${3.5+i}s ${i*0.4}s infinite ease-in-out` }} />
              ))}

              {/* Empty state */}
              {day === 0 && (
                <g>
                  <text x="100" y={GY - 18} textAnchor="middle" fill="#A5D6A7" fontSize="6" fontWeight="600" opacity="0.4">
                    Invest to plant your first seed
                  </text>
                  <path d="M100,88 L100,95 M96,92 L100,96 L104,92"
                    fill="none" stroke="#A5D6A7" strokeWidth="1" opacity="0.3"
                    style={{ animation: 'arrowBounce 1.5s infinite ease-in-out' }} />
                </g>
              )}
            </g>
          </>
        )}
      </svg>

      <style>{`
        @keyframes seedDrop {
          0%   { opacity:0; transform:translateY(-8px) scale(0.4); }
          70%  { transform:translateY(1px) scale(1.05); }
          100% { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes crackDraw {
          from { stroke-dasharray:20; stroke-dashoffset:20; opacity:0; }
          to   { stroke-dashoffset:0; opacity:1; }
        }
        @keyframes drawLine { to { stroke-dashoffset: 0; } }
        @keyframes leafPop {
          0%   { opacity:0; transform:scale(0) rotate(20deg); }
          70%  { transform:scale(1.12) rotate(-2deg); }
          100% { opacity:1; transform:scale(1) rotate(0); }
        }
        @keyframes fruitBounce {
          0%   { opacity:0; transform:scale(0) translateY(-5px); }
          50%  { opacity:1; transform:scale(1.25) translateY(1px); }
          100% { transform:scale(1) translateY(0); }
        }
        @keyframes treeGrow {
          from { opacity:0; transform:scaleY(0); }
          to   { opacity:1; transform:scaleY(1); }
        }
        @keyframes earthAppear {
          0%   { opacity:0; transform:scale(0.05); }
          40%  { opacity:0.5; }
          100% { opacity:1; transform:scale(1); }
        }
        @keyframes sunPulse {
          0%,100% { opacity:0.7; transform:scale(1); }
          50%     { opacity:1;   transform:scale(1.06); }
        }
        @keyframes twinkle {
          0%,100% { opacity:0.08; }
          50%     { opacity:0.8; }
        }
        @keyframes floatUp {
          0%   { transform:translateY(0); opacity:0; }
          12%  { opacity:0.5; }
          100% { transform:translateY(-25px) translateX(5px); opacity:0; }
        }
        @keyframes cloudDrift {
          0%   { transform:translateX(-20px); }
          100% { transform:translateX(20px); }
        }
        @keyframes grassSway {
          0%,100% { transform:rotate(0deg); }
          50%     { transform:rotate(5deg); }
        }
        @keyframes fadeIn { from{opacity:0}to{opacity:1} }
        @keyframes wormWiggle {
          0%,100% { transform:translateX(0); }
          25%     { transform:translateX(2px); }
          75%     { transform:translateX(-2px); }
        }
        @keyframes arrowBounce {
          0%,100% { transform:translateY(0); opacity:0.3; }
          50%     { transform:translateY(3px); opacity:0.6; }
        }
        @keyframes shootingStar {
          0%   { opacity:0; transform:translate(0,0); }
          5%   { opacity:0.9; }
          15%  { opacity:0; transform:translate(30px,15px); }
          100% { opacity:0; }
        }
      `}</style>
    </div>
  );
};

export default PlantGrowthAnimation;
