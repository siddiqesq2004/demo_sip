import React, { useMemo } from 'react';

/**
 * PlantGrowthAnimation — Dynamic camera zoom SVG.
 *
 * Days 0:     Empty soil — "Invest to plant your first seed"
 * Days 1-3:   Zoomed in tight on seed underground
 * Days 4-7:   Sprout breaking through soil, first leaves
 * Days 8-12:  Full plant with many leaves
 * Days 13-17: PROPER TREE — thick trunk, branching canopy, golden fruits
 * Days 18-21: DENSE FOREST — camera zooms way out, many layered trees
 * Day 22:     OUTER SPACE — realistic Earth covered in green
 */
const PlantGrowthAnimation = ({ day = 0, totalDays = 22 }) => {
  const p = Math.min(day / totalDays, 1);
  const showWorld = day >= 22;

  /* ───── CAMERA ───── */
  const getCamera = (d) => {
    if (d <= 0) return { s: 1.9, tx: -90, ty: -130 };
    if (d <= 3) return { s: 2.2, tx: -120, ty: -155 };
    if (d <= 5) return { s: 1.7, tx: -70, ty: -105 };
    if (d <= 8) return { s: 1.35, tx: -35, ty: -55 };
    if (d <= 12) return { s: 1.1, tx: -10, ty: -18 };
    if (d <= 17) return { s: 0.95, tx: 5, ty: 8 };
    return { s: 0.6, tx: 40, ty: 50 };
  };
  const cam = getCamera(day);

  const GY = 130;

  /* ───── DERIVED ───── */
  const showSeed      = day >= 1 && day <= 6;
  const seedCracked   = day >= 2;
  const seedY         = GY + 22;
  const rootCount     = day >= 2 ? Math.min(day - 1, 7) : 0;
  const rootMaxLen    = Math.min((day - 1) * 8, 45);
  const sproutVisible = day >= 3;
  const stemH         = sproutVisible ? Math.min((day - 2) * 12, 95) : 0;
  const stemBelow     = day >= 2 ? Math.min((day - 1) * 5, 20) : 0;
  const stemW         = 2 + Math.min(p * 5, 5);
  const leafCount     = day >= 4 ? Math.min(day - 3, 12) : 0;
  const showTree      = day >= 11;
  const treeGrowth    = showTree ? Math.min((day - 10) / 7, 1) : 0;
  const fruitCount    = day >= 14 ? Math.min(day - 13, 10) : 0;
  const showForest    = day >= 17;
  const forestGrowth  = showForest ? Math.min((day - 16) / 5, 1) : 0;
  const sunR          = day >= 3 ? 5 + Math.min(day - 2, 12) : 0;
  const stemTopY      = GY - stemH;

  /* ───── ROOTS ───── */
  const roots = useMemo(() => {
    const arr = [];
    for (let i = 0; i < rootCount; i++) {
      const spread = rootCount > 1 ? -35 + (i / (rootCount - 1)) * 70 : 0;
      const len = rootMaxLen * (0.55 + Math.random() * 0.45);
      arr.push({ angle: spread, len, delay: i * 0.12 });
    }
    return arr;
  }, [rootCount, rootMaxLen]);

  /* ───── LEAVES ───── */
  const leaves = useMemo(() => {
    const arr = [];
    for (let i = 0; i < leafCount; i++) {
      const frac = 0.15 + (i / Math.max(leafCount, 1)) * 0.75;
      const y = GY - stemH * frac;
      const side = i % 2 === 0 ? -1 : 1;
      const sz = 5 + Math.min(p * 12, 12);
      arr.push({ y, side, sz, delay: i * 0.1 });
    }
    return arr;
  }, [leafCount, stemH, p]);

  /* ───── SPACE STARS ───── */
  const spaceStars = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 80; i++) {
      arr.push({
        x: Math.random() * 200,
        y: Math.random() * 200,
        r: 0.2 + Math.random() * 1.0,
        delay: Math.random() * 3,
        dur: 1.5 + Math.random() * 2.5,
      });
    }
    return arr;
  }, []);

  /* ═══════ TREE CANOPY — multi-circle organic shape ═══════ */
  const renderTreeCanopy = (cx, baseY, scale, opacity = 1) => {
    const s = scale;
    const trunkH = 55 * s;
    const trunkWBase = 8 * s;
    const trunkWTop = 4 * s;
    const ty = baseY;

    // Canopy blobs — multiple overlapping circles for organic look
    const canopyBlobs = [
      { dx: 0,      dy: -52, r: 22 },  // top center
      { dx: -16,    dy: -42, r: 18 },  // left
      { dx: 16,     dy: -42, r: 18 },  // right
      { dx: -10,    dy: -55, r: 14 },  // top-left
      { dx: 10,     dy: -55, r: 14 },  // top-right
      { dx: 0,      dy: -38, r: 16 },  // bottom center
      { dx: -22,    dy: -48, r: 12 },  // far left
      { dx: 22,     dy: -48, r: 12 },  // far right
    ];

    return (
      <g opacity={opacity}>
        {/* Shadow under tree */}
        <ellipse cx={cx} cy={ty + 2} rx={20 * s} ry={4 * s} fill="#1a3a1a" opacity="0.3" />

        {/* Trunk — tapered trapezoid */}
        <path
          d={`M${cx - trunkWBase},${ty} L${cx - trunkWTop},${ty - trunkH} L${cx + trunkWTop},${ty - trunkH} L${cx + trunkWBase},${ty}Z`}
          fill="#5D4037"
        />
        {/* Trunk texture lines */}
        <line x1={cx - 1} y1={ty} x2={cx - 1} y2={ty - trunkH} stroke="#4E342E" strokeWidth={0.8 * s} opacity="0.4" />
        <line x1={cx + 2} y1={ty - 10 * s} x2={cx + 2} y2={ty - trunkH + 5 * s} stroke="#6D4C41" strokeWidth={0.5 * s} opacity="0.3" />

        {/* Branches extending from trunk */}
        <line x1={cx} y1={ty - trunkH * 0.6} x2={cx - 18 * s} y2={ty - trunkH * 0.8}
          stroke="#5D4037" strokeWidth={2.5 * s} strokeLinecap="round" />
        <line x1={cx} y1={ty - trunkH * 0.7} x2={cx + 16 * s} y2={ty - trunkH * 0.85}
          stroke="#5D4037" strokeWidth={2 * s} strokeLinecap="round" />
        <line x1={cx} y1={ty - trunkH * 0.5} x2={cx - 12 * s} y2={ty - trunkH * 0.65}
          stroke="#5D4037" strokeWidth={2 * s} strokeLinecap="round" />

        {/* Canopy — overlapping green circles */}
        {canopyBlobs.map((b, i) => (
          <circle key={`cb${i}`}
            cx={cx + b.dx * s} cy={ty - trunkH + b.dy * s + 15 * s}
            r={b.r * s}
            fill={['#2E7D32','#388E3C','#43A047','#4CAF50','#2E7D32','#388E3C','#1B5E20','#33691E'][i]}
            opacity={0.9 - i * 0.02}
          />
        ))}

        {/* Canopy highlights */}
        <circle cx={cx - 8 * s} cy={ty - trunkH - 40 * s} r={8 * s} fill="#66BB6A" opacity="0.25" />
        <circle cx={cx + 5 * s} cy={ty - trunkH - 50 * s} r={5 * s} fill="#81C784" opacity="0.2" />
      </g>
    );
  };

  /* ═══════ FOREST TREE (simpler, for background) ═══════ */
  const renderForestTree = (cx, baseY, scale, shade = 0, opacity = 0.85) => {
    const s = scale;
    const h = 40 * s;
    const tw = 3 * s;
    const colors = [
      ['#1B5E20','#2E7D32','#388E3C'],
      ['#2E7D32','#388E3C','#43A047'],
      ['#33691E','#2E7D32','#1B5E20'],
    ][shade % 3];

    return (
      <g opacity={opacity}>
        {/* Trunk */}
        <path d={`M${cx - tw},${baseY} L${cx - tw * 0.5},${baseY - h} L${cx + tw * 0.5},${baseY - h} L${cx + tw},${baseY}Z`}
          fill="#5D4037" />
        {/* Canopy — 3 overlapping circles */}
        <circle cx={cx} cy={baseY - h - 8 * s} r={12 * s} fill={colors[0]} />
        <circle cx={cx - 6 * s} cy={baseY - h - 4 * s} r={10 * s} fill={colors[1]} />
        <circle cx={cx + 6 * s} cy={baseY - h - 4 * s} r={10 * s} fill={colors[2]} />
        <circle cx={cx} cy={baseY - h - 14 * s} r={7 * s} fill={colors[1]} opacity="0.8" />
      </g>
    );
  };

  return (
    <div className="relative w-full flex items-center justify-center overflow-hidden" style={{ minHeight: 240 }}>
      <svg viewBox="0 0 200 200" className="w-full h-auto"
        style={{ maxWidth: 310, maxHeight: 290 }} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="skyG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={day >= 18 ? '#0a1a30' : '#3a9fd8'} />
            <stop offset="100%" stopColor={day >= 18 ? '#163832' : '#87CEEB'} />
          </linearGradient>
          <linearGradient id="soilG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6D4C41" />
            <stop offset="50%" stopColor="#4E342E" />
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
            <stop offset="0%" stopColor="#66BB6A" />
            <stop offset="100%" stopColor="#2E7D32" />
          </linearGradient>
          {/* Earth gradients */}
          <radialGradient id="earthOcean" cx="40%" cy="38%" r="55%">
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
          /* ═══════════════════════════════════════
             DAY 22: OUTER SPACE — GREEN EARTH
             ═══════════════════════════════════════ */
          <g>
            {/* Deep space */}
            <rect x="0" y="0" width="200" height="200" fill="url(#spaceG)" rx="12" />

            {/* Stars */}
            {spaceStars.map((s, i) => (
              <circle key={`ss${i}`} cx={s.x} cy={s.y} r={s.r}
                fill={i%7===0 ? '#ffe0b2' : i%11===0 ? '#bbdefb' : 'white'}
                opacity={0.2 + (i%5)*0.12}
                style={{ animation: `twinkle ${s.dur}s ${s.delay}s ease-in-out infinite` }} />
            ))}

            {/* Distant nebula */}
            <ellipse cx="30" cy="25" rx="18" ry="6" fill="#7C4DFF" opacity="0.04" transform="rotate(-15 30 25)" />
            <ellipse cx="175" cy="170" rx="14" ry="5" fill="#00BCD4" opacity="0.03" transform="rotate(25 175 170)" />

            {/* Earth */}
            <g style={{ animation: 'earthAppear 2s ease-out both' }}>
              {/* Atmosphere outer glow */}
              <circle cx="100" cy="96" r="80" fill="url(#earthAtmo)" />
              <circle cx="100" cy="96" r="74" fill="none" stroke="#4FC3F7" strokeWidth="0.6" opacity="0.1"
                style={{ animation: 'sunPulse 6s infinite' }} />

              {/* Ocean base */}
              <circle cx="100" cy="96" r="68" fill="url(#earthOcean)" />

              {/* Continents — large green landmasses (Earth is MOSTLY green/forest) */}
              {/* North America */}
              <path d="M65,62 Q58,68 60,78 Q62,85 70,88 Q78,86 82,80 Q85,72 80,65 Q75,60 65,62Z"
                fill="#2E7D32" opacity="0.9" />
              {/* South America */}
              <path d="M72,95 Q68,102 70,115 Q73,125 78,128 Q82,125 83,118 Q84,108 80,98 Q76,93 72,95Z"
                fill="#388E3C" opacity="0.85" />
              {/* Europe + Africa */}
              <path d="M100,60 Q96,65 98,72 Q100,78 104,75 Q106,70 105,63 Q103,58 100,60Z"
                fill="#43A047" opacity="0.8" />
              <path d="M98,82 Q94,90 96,105 Q100,118 106,122 Q112,118 113,108 Q112,95 108,88 Q104,82 98,82Z"
                fill="#2E7D32" opacity="0.88" />
              {/* Asia */}
              <path d="M110,55 Q105,58 108,65 Q112,72 120,75 Q130,78 138,74 Q142,68 138,62 Q132,55 124,54 Q116,53 110,55Z"
                fill="#33691E" opacity="0.85" />
              {/* India */}
              <path d="M118,78 Q115,84 116,92 Q118,97 122,95 Q124,90 123,83 Q121,78 118,78Z"
                fill="#4CAF50" opacity="0.8" />
              {/* Australia */}
              <path d="M135,108 Q130,112 132,120 Q136,125 142,123 Q146,118 144,112 Q140,108 135,108Z"
                fill="#388E3C" opacity="0.82" />
              {/* Additional forests everywhere — making it VERY green */}
              <ellipse cx="85" cy="70" rx="6" ry="4" fill="#66BB6A" opacity="0.5" />
              <ellipse cx="115" cy="62" rx="5" ry="3" fill="#81C784" opacity="0.4" />
              <ellipse cx="128" cy="85" rx="4" ry="6" fill="#4CAF50" opacity="0.45" />
              <ellipse cx="90" cy="110" rx="5" ry="4" fill="#A5D6A7" opacity="0.35" />

              {/* Tiny forest texture dots on land */}
              {Array.from({ length: 30 }).map((_, i) => {
                const a = (i / 30) * Math.PI * 2 + 0.3;
                const d = 20 + (i * 13) % 40;
                const tx = 100 + Math.cos(a) * d;
                const ty = 96 + Math.sin(a) * d * 0.9;
                const dist = Math.sqrt((tx-100)**2 + (ty-96)**2);
                if (dist > 63) return null;
                return <circle key={`td${i}`} cx={tx} cy={ty} r={0.8 + (i%3)*0.4}
                  fill={['#1B5E20','#2E7D32','#388E3C','#43A047'][i%4]} opacity={0.5 + (i%3)*0.1} />;
              })}

              {/* Ice caps */}
              <ellipse cx="100" cy="32" rx="18" ry="6" fill="white" opacity="0.3" />
              <ellipse cx="100" cy="161" rx="14" ry="4" fill="white" opacity="0.2" />

              {/* Cloud bands */}
              <ellipse cx="80" cy="72" rx="16" ry="2.5" fill="white" opacity="0.14"
                style={{ animation: 'cloudDrift 22s linear infinite' }} />
              <ellipse cx="120" cy="100" rx="12" ry="2" fill="white" opacity="0.12"
                style={{ animation: 'cloudDrift 28s 6s linear infinite' }} />
              <ellipse cx="95" cy="118" rx="10" ry="1.8" fill="white" opacity="0.1" />

              {/* Surface light reflection (sun glint) */}
              <circle cx="100" cy="96" r="68" fill="url(#earthShine)" />

              {/* Terminator shadow (dark side of planet) */}
              <ellipse cx="140" cy="96" rx="55" ry="68" fill="black" opacity="0.08" />
            </g>

            {/* Orbiting particles */}
            {[0,45,90,135,180,225,270,315].map((a, i) => {
              const rad = (a * Math.PI) / 180;
              return (
                <circle key={`op${i}`}
                  cx={100 + Math.cos(rad) * 78} cy={96 + Math.sin(rad) * 76}
                  r={0.8 + (i%3)*0.5}
                  fill={i%2===0 ? '#FFD54F' : '#69F0AE'}
                  style={{ animation: `twinkle ${0.6+i*0.12}s infinite ease-in-out ${i*0.1}s` }} />
              );
            })}

            {/* Shooting star */}
            <line x1="20" y1="10" x2="42" y2="20" stroke="white" strokeWidth="0.7" opacity="0"
              style={{ animation: 'shootingStar 5s 2s infinite' }} />

            {/* Label */}
            <text x="100" y="186" textAnchor="middle" fill="#69F0AE" fontSize="6" fontWeight="700" opacity="0.5"
              style={{ animation: 'fadeIn 2s 1s both' }}>
              🌍 Evergreen Planet
            </text>
          </g>

        ) : (
          /* ═══════════════════════════════════════
             DAYS 0-21: GROUND SCENE
             ═══════════════════════════════════════ */
          <>
            <rect x="-200" y="-200" width="600" height="600"
              fill={day >= 18 ? '#0a1a30' : '#3a9fd8'} />

            <g style={{
              transform: `scale(${cam.s}) translate(${cam.tx}px, ${cam.ty}px)`,
              transition: 'transform 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
              transformOrigin: '100px 130px',
            }}>

              {/* Sky */}
              <rect x="-150" y="-250" width="500" height={GY + 250} fill="url(#skyG)" />

              {/* Clouds */}
              {day >= 4 && day <= 21 && (
                <g opacity={day >= 18 ? 0.15 : 0.35}>
                  <ellipse cx="40" cy="40" rx="20" ry="6" fill="white"
                    style={{ animation: 'cloudDrift 14s linear infinite' }} />
                  <ellipse cx="46" cy="37" rx="12" ry="5" fill="white" />
                  <ellipse cx="155" cy="28" rx="16" ry="5" fill="white"
                    style={{ animation: 'cloudDrift 18s 4s linear infinite' }} />
                  <ellipse cx="160" cy="25" rx="10" ry="4" fill="white" />
                </g>
              )}

              {/* Sun */}
              {sunR > 0 && (
                <g>
                  <circle cx="168" cy="30" r={sunR + 8} fill="url(#sunG)"
                    style={{ animation: 'sunPulse 4s ease-in-out infinite' }} />
                  <circle cx="168" cy="30" r={sunR * 0.45} fill="#FFF9C4" />
                </g>
              )}

              {/* Stars for night (days 18-21) */}
              {day >= 18 && [
                [15,10],[45,5],[75,18],[125,8],[165,20],[25,35],[180,12],[55,28],[135,32],[95,-5],[-20,15],[210,25]
              ].map(([x,y], i) => (
                <circle key={`ns${i}`} cx={x} cy={y} r={0.5 + (i%3)*0.3} fill="white"
                  style={{ animation: `twinkle ${1+i*0.2}s ease-in-out infinite ${i*0.15}s` }} />
              ))}

              {/* ──── BACKGROUND HILLS (forest stage) ──── */}
              {day >= 16 && (
                <g style={{ animation: 'fadeIn 1s both' }}>
                  {/* Far hills */}
                  <ellipse cx="-20" cy={GY} rx="90" ry="35" fill="#1B5E20" opacity="0.25" />
                  <ellipse cx="100" cy={GY} rx="110" ry="25" fill="#2E7D32" opacity="0.2" />
                  <ellipse cx="220" cy={GY} rx="80" ry="30" fill="#1B5E20" opacity="0.22" />
                </g>
              )}

              {/* ──── FOREST TREES ──── */}
              {showForest && (
                <g>
                  {/* Back row (smaller, darker — depth) */}
                  {[
                    { x: -60, s: 0.5 }, { x: -30, s: 0.55 }, { x: 0, s: 0.5 },
                    { x: 30, s: 0.6 }, { x: 60, s: 0.45 },
                    { x: 140, s: 0.55 }, { x: 170, s: 0.5 }, { x: 200, s: 0.6 },
                    { x: 230, s: 0.45 }, { x: 260, s: 0.5 },
                  ].map((t, i) => (
                    <g key={`bft${i}`} style={{
                      animation: `treeGrow 0.8s ${0.1 + i * 0.1}s both ease-out`,
                      transformOrigin: `${t.x}px ${GY - 8}px`,
                      opacity: Math.min(forestGrowth * 2, 0.55),
                    }}>
                      {renderForestTree(t.x, GY - 8, t.s, i, 0.5)}
                    </g>
                  ))}

                  {/* Mid row */}
                  {[
                    { x: -40, s: 0.7 }, { x: -10, s: 0.75 }, { x: 20, s: 0.65 },
                    { x: 50, s: 0.8 }, { x: 75, s: 0.7 },
                    { x: 125, s: 0.75 }, { x: 155, s: 0.7 }, { x: 185, s: 0.8 },
                    { x: 215, s: 0.65 }, { x: 245, s: 0.75 },
                  ].map((t, i) => (
                    <g key={`mft${i}`} style={{
                      animation: `treeGrow 0.9s ${0.3 + i * 0.12}s both ease-out`,
                      transformOrigin: `${t.x}px ${GY - 3}px`,
                      opacity: Math.min(forestGrowth * 1.5, 0.7),
                    }}>
                      {renderForestTree(t.x, GY - 3, t.s, i + 1, 0.7)}
                    </g>
                  ))}

                  {/* Front row (larger, brighter) */}
                  {[
                    { x: -50, s: 0.9 }, { x: -20, s: 1.0 }, { x: 15, s: 0.85 },
                    { x: 45, s: 0.95 }, { x: 70, s: 0.9 },
                    { x: 130, s: 0.95 }, { x: 160, s: 0.9 }, { x: 190, s: 1.0 },
                    { x: 220, s: 0.85 }, { x: 250, s: 0.95 },
                  ].map((t, i) => (
                    <g key={`fft${i}`} style={{
                      animation: `treeGrow 1s ${0.5 + i * 0.14}s both ease-out`,
                      transformOrigin: `${t.x}px ${GY}px`,
                    }}>
                      {renderForestTree(t.x, GY, t.s, i + 2, 0.85)}
                    </g>
                  ))}
                </g>
              )}

              {/* ──── THE MAIN TREE (days 11-17) ──── */}
              {showTree && !showForest && (
                <g style={{ animation: 'treeGrow 1.2s both ease-out', transformOrigin: `100px ${GY}px` }}>
                  {renderTreeCanopy(100, GY, treeGrowth * 0.9 + 0.3)}

                  {/* Golden fruits on the main tree */}
                  {fruitCount > 0 && (() => {
                    const trunkH = 55 * (treeGrowth * 0.9 + 0.3);
                    const fruitPositions = [
                      { dx: -14, dy: -45 }, { dx: 14, dy: -43 }, { dx: -20, dy: -38 },
                      { dx: 20, dy: -36 }, { dx: 0, dy: -58 }, { dx: -8, dy: -52 },
                      { dx: 10, dy: -50 }, { dx: -18, dy: -50 }, { dx: 22, dy: -48 },
                      { dx: 0, dy: -42 },
                    ];
                    return fruitPositions.slice(0, fruitCount).map((f, i) => {
                      const s = treeGrowth * 0.9 + 0.3;
                      return (
                        <g key={`mf${i}`} style={{ animation: `fruitBounce 0.5s ${i * 0.15}s both ease-out` }}>
                          <circle cx={100 + f.dx * s} cy={GY - trunkH + f.dy * s + 15 * s}
                            r={3.5 * s} fill="#FFD54F" />
                          <circle cx={100 + f.dx * s - 1} cy={GY - trunkH + f.dy * s + 14 * s}
                            r={1.2 * s} fill="#FFF9C4" opacity="0.5" />
                        </g>
                      );
                    });
                  })()}
                </g>
              )}

              {/* Main tree visible even in forest (centered, slightly larger) */}
              {showForest && (
                <g style={{ animation: 'fadeIn 0.5s both' }}>
                  {renderTreeCanopy(100, GY, 1.1)}
                  {/* Fruits on main tree in forest */}
                  {[
                    { dx: -14, dy: -45 }, { dx: 14, dy: -43 }, { dx: -20, dy: -38 },
                    { dx: 20, dy: -36 }, { dx: 0, dy: -58 }, { dx: -8, dy: -52 },
                  ].map((f, i) => (
                    <g key={`ff${i}`} style={{ animation: `fruitBounce 0.4s ${i*0.1}s both ease-out` }}>
                      <circle cx={100 + f.dx * 1.1} cy={GY - 55*1.1 + f.dy*1.1 + 15*1.1}
                        r={3.8} fill="#FFD54F" />
                      <circle cx={100 + f.dx*1.1 - 1} cy={GY - 55*1.1 + f.dy*1.1 + 14*1.1}
                        r={1.2} fill="#FFF9C4" opacity="0.5" />
                    </g>
                  ))}
                </g>
              )}

              {/* ──── GRASS STRIP ──── */}
              <rect x="-150" y={GY - 3} width="500" height="6" fill="url(#grassG)" />
              {day >= 4 && Array.from({ length: 30 }).map((_, i) => {
                const gx = -40 + i * 10;
                const gh = 3 + (i * 7 % 5);
                return (
                  <line key={`gr${i}`} x1={gx} y1={GY - 3} x2={gx + (i%2===0?2:-2)} y2={GY - 3 - gh}
                    stroke="#81C784" strokeWidth="1" strokeLinecap="round"
                    style={{ animation: `grassSway 2.5s ${i*0.08}s ease-in-out infinite` }} />
                );
              })}

              {/* ──── SOIL ──── */}
              <rect x="-150" y={GY} width="500" height="250" fill="url(#soilG)" />
              <line x1="-150" y1={GY + 30} x2="350" y2={GY + 30} stroke="#5D4037" strokeWidth="0.5" opacity="0.3" />
              <line x1="-150" y1={GY + 50} x2="350" y2={GY + 50} stroke="#4E342E" strokeWidth="0.4" opacity="0.2" />
              {[
                [35,145,3.5,2],[70,160,2.5,1.8],[130,148,3,2.2],[160,155,2.8,1.5],[55,170,4,2.5],[140,167,3,1.8]
              ].map(([x,y,rx,ry], i) => (
                <ellipse key={`pb${i}`} cx={x} cy={y} rx={rx} ry={ry}
                  fill={i%2===0 ? '#795548' : '#6D4C41'} opacity="0.35" />
              ))}
              {day >= 2 && day <= 8 && (
                <path d="M60,155 Q63,152 66,155 Q69,158 72,155" fill="none"
                  stroke="#E8B4B8" strokeWidth="1" strokeLinecap="round" opacity="0.4"
                  style={{ animation: 'wormWiggle 3s ease-in-out infinite' }} />
              )}

              {/* ──── SEED ──── */}
              {showSeed && (
                <g style={{ animation: 'seedDrop 0.6s ease-out both' }}>
                  <ellipse cx="100" cy={seedY} rx={seedCracked ? 6.5 : 5.5} ry={seedCracked ? 4.5 : 4}
                    fill="#A1887F" stroke="#795548" strokeWidth="0.7" />
                  <ellipse cx="100" cy={seedY} rx="3" ry={seedCracked ? 4 : 3.5}
                    fill="none" stroke="#8D6E63" strokeWidth="0.6" opacity="0.5" />
                  <ellipse cx="98.5" cy={seedY - 1.5} rx="2.5" ry="1.3" fill="#BCAAA4" opacity="0.5" />
                  {seedCracked && (
                    <path d={`M97,${seedY - 3} L100,${seedY} L103,${seedY - 2}`}
                      fill="none" stroke="#4E342E" strokeWidth="1" strokeLinecap="round"
                      style={{ animation: 'crackDraw 0.4s 0.3s both ease-out' }} />
                  )}
                </g>
              )}

              {/* ──── ROOTS ──── */}
              {roots.map((r, i) => {
                const rad = ((90 + r.angle) * Math.PI) / 180;
                const x2 = 100 + Math.cos(rad) * r.len;
                const y2 = seedY + 4 + Math.sin(rad) * r.len;
                const mx = 100 + Math.cos(rad) * r.len * 0.5 + (i%2===0 ? 4 : -4);
                const my = seedY + 4 + Math.sin(rad) * r.len * 0.5;
                return (
                  <g key={`rt${i}`}>
                    <path d={`M100,${seedY + 4} Q${mx},${my} ${x2},${y2}`}
                      fill="none" stroke="#A1887F" strokeWidth={1.8 - i * 0.12} strokeLinecap="round"
                      style={{ strokeDasharray: r.len * 1.5, strokeDashoffset: r.len * 1.5,
                        animation: `drawLine ${0.7}s ${r.delay}s both ease-out` }} />
                    {r.len > 12 && (
                      <line x1={mx} y1={my} x2={mx + (i%2===0?7:-7)} y2={my + 6}
                        stroke="#BCAAA4" strokeWidth="0.7" strokeLinecap="round"
                        style={{ strokeDasharray: 12, strokeDashoffset: 12,
                          animation: `drawLine 0.4s ${r.delay + 0.4}s both ease-out` }} />
                    )}
                    <circle cx={x2} cy={y2} r="1.2" fill="#D7CCC8" opacity="0"
                      style={{ animation: `fadeIn 0.3s ${r.delay + 0.5}s both` }} />
                  </g>
                );
              })}

              {/* ──── STEM (below + above ground) ──── */}
              {stemBelow > 0 && !showTree && (
                <line x1="100" y1={seedY - 3} x2="100" y2={GY}
                  stroke="#6D8C5E" strokeWidth={Math.min(stemW * 0.7, 3.5)} strokeLinecap="round"
                  style={{ strokeDasharray: 30, strokeDashoffset: 30, animation: 'drawLine 0.8s 0.2s both ease-out' }} />
              )}
              {sproutVisible && !showTree && (
                <line x1="100" y1={GY} x2="100" y2={stemTopY}
                  stroke="url(#stemG)" strokeWidth={stemW} strokeLinecap="round"
                  style={{ strokeDasharray: stemH + 5, strokeDashoffset: stemH + 5, animation: 'drawLine 1.2s both ease-out' }} />
              )}

              {/* ──── LEAVES (pre-tree stage) ──── */}
              {!showTree && leaves.map((l, i) => {
                const tipX = 100 + l.side * l.sz;
                const tipY = l.y - l.sz * 0.35;
                return (
                  <g key={`lf${i}`}
                    style={{ animation: `leafPop 0.45s ${l.delay}s both ease-out`, transformOrigin: `100px ${l.y}px` }}>
                    <path
                      d={`M100,${l.y} Q${100+l.side*l.sz*0.4},${l.y-l.sz*0.65} ${tipX},${tipY} Q${100+l.side*l.sz*0.65},${l.y+l.sz*0.1} 100,${l.y}`}
                      fill={['#81C784','#66BB6A','#4CAF50','#43A047'][i%4]} opacity="0.92" />
                    <line x1="100" y1={l.y} x2={100+l.side*l.sz*0.85} y2={l.y-l.sz*0.28}
                      stroke="#A5D6A7" strokeWidth="0.4" opacity="0.4" />
                  </g>
                );
              })}

              {/* Floating particles */}
              {day >= 6 && day < 18 && Array.from({ length: Math.min(day - 5, 8) }).map((_, i) => (
                <circle key={`fp${i}`} cx={70 + i * 8} cy={GY - 25 - i * 7}
                  r={0.7 + (i%3) * 0.4} fill={['#FFD54F','#A5D6A7','#FFF9C4'][i%3]}
                  style={{ animation: `floatUp ${3.5 + i}s ${i*0.4}s infinite ease-in-out` }} />
              ))}

              {/* Empty state */}
              {day === 0 && (
                <g>
                  <text x="100" y={GY - 20} textAnchor="middle" fill="#A5D6A7" fontSize="6.5" fontWeight="600" opacity="0.45">
                    Invest to plant your first seed
                  </text>
                  <path d="M100,118 L100,125 M96,122 L100,126 L104,122"
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
          0%   { opacity:0; transform:translateY(-10px) scale(0.4); }
          70%  { transform:translateY(2px) scale(1.05); }
          100% { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes crackDraw {
          from { stroke-dasharray:12; stroke-dashoffset:12; opacity:0; }
          to   { stroke-dashoffset:0; opacity:1; }
        }
        @keyframes drawLine { to { stroke-dashoffset: 0; } }
        @keyframes leafPop {
          0%   { opacity:0; transform:scale(0) rotate(20deg); }
          70%  { transform:scale(1.15) rotate(-3deg); }
          100% { opacity:1; transform:scale(1) rotate(0); }
        }
        @keyframes fruitBounce {
          0%   { opacity:0; transform:scale(0) translateY(-6px); }
          50%  { opacity:1; transform:scale(1.3) translateY(1px); }
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
          0%,100% { opacity:0.75; transform:scale(1); }
          50%     { opacity:1; transform:scale(1.08); }
        }
        @keyframes twinkle {
          0%,100% { opacity:0.08; }
          50%     { opacity:0.8; }
        }
        @keyframes floatUp {
          0%   { transform:translateY(0); opacity:0; }
          12%  { opacity:0.55; }
          100% { transform:translateY(-28px) translateX(6px); opacity:0; }
        }
        @keyframes cloudDrift {
          0%   { transform:translateX(-25px); }
          100% { transform:translateX(25px); }
        }
        @keyframes grassSway {
          0%,100% { transform:rotate(0deg); }
          50%     { transform:rotate(6deg); }
        }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes wormWiggle {
          0%,100% { transform:translateX(0); }
          25% { transform:translateX(2px); }
          75% { transform:translateX(-2px); }
        }
        @keyframes arrowBounce {
          0%,100% { transform:translateY(0); opacity:0.3; }
          50% { transform:translateY(4px); opacity:0.6; }
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
