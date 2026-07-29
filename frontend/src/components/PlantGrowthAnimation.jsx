import React, { useMemo } from 'react';

/**
 * PlantGrowthAnimation — Dynamic camera zoom SVG.
 *
 * Days 1-3:   Zoomed in tight on seed underground
 * Days 4-7:   Pulls back to show sprout breaking soil
 * Days 8-12:  Zooms out to show full plant
 * Days 13-17: Full tree with canopy & fruits
 * Days 18-21: Wide panorama: forest of trees
 * Day 22:     OUTER SPACE VIEW — planet Earth fully evergreen
 *
 * On Day 22 the ground scene is hidden and replaced with a
 * full outer-space scene: deep space background, stars, nebula,
 * and a large green Earth floating in the center.
 */
const PlantGrowthAnimation = ({ day = 0, totalDays = 22 }) => {
  const p = Math.min(day / totalDays, 1);
  const showWorld = day >= 22;

  /* ───── CAMERA (for ground-scene days 0-21) ───── */
  const getCamera = (d) => {
    if (d <= 0) return { s: 1.9, tx: -90, ty: -130 };
    if (d <= 3) return { s: 2.2, tx: -120, ty: -155 };
    if (d <= 5) return { s: 1.7, tx: -70, ty: -105 };
    if (d <= 8) return { s: 1.35, tx: -35, ty: -55 };
    if (d <= 12) return { s: 1.1, tx: -10, ty: -18 };
    if (d <= 17) return { s: 1.0, tx: 0, ty: 0 };
    return { s: 0.75, tx: 25, ty: 35 };
  };
  const cam = getCamera(day);

  /* ───── SCENE CONSTANTS ───── */
  const GY = 130;

  /* ───── DERIVED VALUES ───── */
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
  const canopyR       = day >= 11 ? Math.min((day - 10) * 6, 40) : 0;
  const fruitCount    = day >= 14 ? Math.min(day - 13, 10) : 0;
  const forestCount   = day >= 17 ? Math.min(day - 16, 10) : 0;
  const sunR          = day >= 3 ? 5 + Math.min(day - 2, 12) : 0;
  const stemTopY      = GY - stemH;
  const canopyCY      = stemTopY - canopyR * 0.15;
  const showHills     = day >= 16;

  /* ───── GENERATE ROOTS ───── */
  const roots = useMemo(() => {
    const arr = [];
    for (let i = 0; i < rootCount; i++) {
      const spread = rootCount > 1 ? -35 + (i / (rootCount - 1)) * 70 : 0;
      const len = rootMaxLen * (0.55 + Math.random() * 0.45);
      arr.push({ angle: spread, len, delay: i * 0.12 });
    }
    return arr;
  }, [rootCount, rootMaxLen]);

  /* ───── GENERATE LEAVES ───── */
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

  /* ───── GENERATE FRUITS ───── */
  const fruits = useMemo(() => {
    const arr = [];
    for (let i = 0; i < fruitCount; i++) {
      const a = (i / fruitCount) * Math.PI * 1.8 + 0.2;
      const r = canopyR * 0.55;
      arr.push({
        cx: 100 + Math.cos(a) * r,
        cy: canopyCY + Math.sin(a) * r * 0.6 + 6,
        delay: i * 0.18,
      });
    }
    return arr;
  }, [fruitCount, canopyR, canopyCY]);

  /* ───── GENERATE FOREST TREES ───── */
  const fTrees = useMemo(() => {
    const positions = [-80, -55, -35, -15, 15, 35, 55, 80, 110, -110];
    const arr = [];
    for (let i = 0; i < forestCount; i++) {
      const x = 100 + positions[i % positions.length];
      const h = 30 + Math.random() * 45;
      const cr = 14 + Math.random() * 12;
      arr.push({ x, h, cr, delay: i * 0.2 });
    }
    return arr;
  }, [forestCount]);

  /* ───── SPACE STARS (for Day 22) ───── */
  const spaceStars = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 60; i++) {
      arr.push({
        x: Math.random() * 200,
        y: Math.random() * 200,
        r: 0.3 + Math.random() * 1.2,
        delay: Math.random() * 3,
        dur: 1.5 + Math.random() * 2,
      });
    }
    return arr;
  }, []);

  return (
    <div className="relative w-full flex items-center justify-center overflow-hidden" style={{ minHeight: 240 }}>
      <svg
        viewBox="0 0 200 200"
        className="w-full h-auto"
        style={{ maxWidth: 310, maxHeight: 290 }}
        xmlns="http://www.w3.org/2000/svg"
      >
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
          <radialGradient id="canG" cx="45%" cy="40%" r="55%">
            <stop offset="0%" stopColor="#81C784" />
            <stop offset="55%" stopColor="#388E3C" />
            <stop offset="100%" stopColor="#1B5E20" />
          </radialGradient>
          <radialGradient id="sunG" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFF9C4" />
            <stop offset="40%" stopColor="#FFD54F" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#FFB300" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="grassG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#66BB6A" />
            <stop offset="100%" stopColor="#2E7D32" />
          </linearGradient>
          {/* Space / Earth defs */}
          <radialGradient id="spaceG" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0a0e1a" />
            <stop offset="100%" stopColor="#020408" />
          </radialGradient>
          <radialGradient id="earthG" cx="38%" cy="35%" r="58%">
            <stop offset="0%" stopColor="#81C784" />
            <stop offset="40%" stopColor="#2E7D32" />
            <stop offset="80%" stopColor="#1B5E20" />
            <stop offset="100%" stopColor="#0a3010" />
          </radialGradient>
          <radialGradient id="atmoGlow" cx="50%" cy="50%" r="50%">
            <stop offset="75%" stopColor="transparent" />
            <stop offset="88%" stopColor="#69F0AE" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#69F0AE" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="oceanG" cx="60%" cy="55%" r="40%">
            <stop offset="0%" stopColor="#29B6F6" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#0D47A1" stopOpacity="0.3" />
          </radialGradient>
          <radialGradient id="nebulaG" cx="30%" cy="70%" r="60%">
            <stop offset="0%" stopColor="#4A148C" stopOpacity="0.08" />
            <stop offset="50%" stopColor="#1A237E" stopOpacity="0.04" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>

        {/* ═══════════════════════════════════════════
            DAY 22: OUTER SPACE VIEW
            ═══════════════════════════════════════════ */}
        {showWorld ? (
          <g>
            {/* Deep space background */}
            <rect x="0" y="0" width="200" height="200" fill="url(#spaceG)" />

            {/* Nebula tint */}
            <rect x="0" y="0" width="200" height="200" fill="url(#nebulaG)" />

            {/* Stars — lots of them, varying sizes, twinkling */}
            {spaceStars.map((s, i) => (
              <circle key={`ss${i}`} cx={s.x} cy={s.y} r={s.r}
                fill={i % 5 === 0 ? '#ffe0b2' : i % 7 === 0 ? '#bbdefb' : 'white'}
                opacity={0.3 + (i % 4) * 0.15}
                style={{ animation: `twinkle ${s.dur}s ${s.delay}s ease-in-out infinite` }} />
            ))}

            {/* Distant galaxy smudge */}
            <ellipse cx="35" cy="30" rx="12" ry="4" fill="#B39DDB" opacity="0.06"
              transform="rotate(-20 35 30)" />
            <ellipse cx="170" cy="160" rx="8" ry="3" fill="#80DEEA" opacity="0.05"
              transform="rotate(30 170 160)" />

            {/* ──── THE EARTH ──── */}
            <g style={{ animation: 'earthAppear 2s ease-out both' }}>
              {/* Atmosphere outer glow */}
              <circle cx="100" cy="95" r="82" fill="url(#atmoGlow)" />
              <circle cx="100" cy="95" r="76" fill="none" stroke="#69F0AE" strokeWidth="0.5" opacity="0.15"
                style={{ animation: 'sunPulse 5s infinite ease-in-out' }} />

              {/* Earth base — mostly green! */}
              <circle cx="100" cy="95" r="68" fill="url(#earthG)" />

              {/* Oceans (smaller patches — Earth is MOSTLY green) */}
              <ellipse cx="125" cy="80" rx="12" ry="18" fill="#1565C0" opacity="0.35" />
              <ellipse cx="72" cy="105" rx="8" ry="14" fill="#0D47A1" opacity="0.3" />
              <ellipse cx="110" cy="115" rx="10" ry="7" fill="#1565C0" opacity="0.25" />

              {/* Continental detail (forest patches of varying green) */}
              <ellipse cx="82" cy="78" rx="18" ry="14" fill="#388E3C" opacity="0.6" />
              <ellipse cx="115" cy="100" rx="14" ry="20" fill="#2E7D32" opacity="0.5" />
              <ellipse cx="90" cy="115" rx="12" ry="6" fill="#43A047" opacity="0.55" />
              <ellipse cx="68" cy="90" rx="9" ry="10" fill="#4CAF50" opacity="0.45" />
              <ellipse cx="130" cy="75" rx="8" ry="12" fill="#66BB6A" opacity="0.4" />
              <ellipse cx="100" cy="68" rx="15" ry="6" fill="#81C784" opacity="0.35" />
              <ellipse cx="75" cy="72" rx="6" ry="8" fill="#A5D6A7" opacity="0.3" />

              {/* Tiny tree textures on surface */}
              {Array.from({ length: 18 }).map((_, i) => {
                const angle = (i / 18) * Math.PI * 2;
                const dist = 25 + (i * 7) % 35;
                const tx = 100 + Math.cos(angle) * dist;
                const ty = 95 + Math.sin(angle) * dist * 0.85;
                // Only render if inside the circle
                const dx = tx - 100, dy = ty - 95;
                if (Math.sqrt(dx*dx + dy*dy) > 62) return null;
                return (
                  <g key={`tt${i}`} opacity={0.4 + (i % 3) * 0.1}>
                    <line x1={tx} y1={ty} x2={tx} y2={ty - 3} stroke="#5D4037" strokeWidth="0.6" />
                    <circle cx={tx} cy={ty - 4} r={1.8 + (i % 3)} fill={['#2E7D32','#388E3C','#43A047'][i%3]} />
                  </g>
                );
              })}

              {/* Ice caps */}
              <ellipse cx="100" cy="30" rx="16" ry="5" fill="white" opacity="0.25" />
              <ellipse cx="100" cy="160" rx="13" ry="4" fill="white" opacity="0.2" />

              {/* Cloud wisps */}
              <ellipse cx="85" cy="82" rx="14" ry="2.5" fill="white" opacity="0.12"
                style={{ animation: 'cloudDrift 20s linear infinite' }} />
              <ellipse cx="120" cy="105" rx="10" ry="2" fill="white" opacity="0.1"
                style={{ animation: 'cloudDrift 25s 5s linear infinite' }} />
              <ellipse cx="95" cy="120" rx="8" ry="1.5" fill="white" opacity="0.08" />

              {/* Planet surface light reflection */}
              <ellipse cx="80" cy="72" rx="20" ry="15" fill="white" opacity="0.04" />
            </g>

            {/* Orbiting golden sparkles — like satellites / golden particles */}
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((a, i) => {
              const rad = (a * Math.PI) / 180;
              const orbitR = 78;
              return (
                <circle key={`orb${i}`}
                  cx={100 + Math.cos(rad) * orbitR}
                  cy={95 + Math.sin(rad) * orbitR * 0.88}
                  r={0.8 + (i % 3) * 0.6}
                  fill={i % 3 === 0 ? '#FFD54F' : i % 3 === 1 ? '#FFF9C4' : '#69F0AE'}
                  style={{ animation: `twinkle ${0.5 + i * 0.1}s infinite ease-in-out ${i * 0.08}s` }} />
              );
            })}

            {/* Label */}
            <text x="100" y="188" textAnchor="middle" fill="#69F0AE" fontSize="6.5" fontWeight="700" opacity="0.55"
              style={{ animation: 'fadeIn 2s 1s both' }}>
              🌍 Evergreen Planet
            </text>

            {/* Shooting star */}
            <line x1="25" y1="12" x2="45" y2="22" stroke="white" strokeWidth="0.7" opacity="0"
              style={{ animation: 'shootingStar 4s 2s infinite' }} />
          </g>

        ) : (
          /* ═══════════════════════════════════════════
             DAYS 0-21: GROUND SCENE WITH CAMERA ZOOM
             ═══════════════════════════════════════════ */
          <>
            {/* Background fill for areas outside camera view */}
            <rect x="-200" y="-200" width="600" height="600"
              fill={day >= 18 ? '#0a1a30' : '#3a9fd8'} />

            <g style={{
              transform: `scale(${cam.s}) translate(${cam.tx}px, ${cam.ty}px)`,
              transition: 'transform 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
              transformOrigin: '100px 130px',
            }}>

              {/* Sky */}
              <rect x="-100" y="-200" width="400" height={GY + 200} fill="url(#skyG)" />

              {/* Clouds */}
              {day >= 4 && (
                <g opacity={day >= 18 ? 0.15 : 0.35}>
                  <ellipse cx="45" cy="40" rx="22" ry="7" fill="white"
                    style={{ animation: 'cloudDrift 14s linear infinite' }} />
                  <ellipse cx="50" cy="37" rx="14" ry="5" fill="white" />
                  <ellipse cx="150" cy="30" rx="18" ry="6" fill="white"
                    style={{ animation: 'cloudDrift 18s 4s linear infinite' }} />
                </g>
              )}

              {/* Sun */}
              {sunR > 0 && (
                <g>
                  <circle cx="165" cy="35" r={sunR + 8} fill="url(#sunG)"
                    style={{ animation: 'sunPulse 4s ease-in-out infinite' }} />
                  <circle cx="165" cy="35" r={sunR * 0.45} fill="#FFF9C4" />
                </g>
              )}

              {/* Night stars (days 18-21) */}
              {day >= 18 && [
                [15,10],[45,5],[75,18],[125,8],[165,20],[25,35],[180,12],[55,28],[135,32],[95,-5]
              ].map(([x,y], i) => (
                <circle key={`ns${i}`} cx={x} cy={y} r={0.6 + (i%3)*0.3} fill="white"
                  style={{ animation: `twinkle ${1 + i*0.2}s ease-in-out infinite ${i*0.15}s` }} />
              ))}

              {/* Hills */}
              {showHills && (
                <g style={{ animation: 'fadeIn 1s both' }}>
                  <ellipse cx="40" cy={GY} rx="70" ry="25" fill="#2E7D32" opacity="0.3" />
                  <ellipse cx="160" cy={GY} rx="55" ry="20" fill="#388E3C" opacity="0.25" />
                  <ellipse cx="100" cy={GY} rx="90" ry="12" fill="#43A047" opacity="0.2" />
                </g>
              )}

              {/* Forest trees */}
              {fTrees.map((t, i) => (
                <g key={`ft${i}`}
                  style={{ animation: `treeGrow 0.9s ${t.delay}s both ease-out`, transformOrigin: `${t.x}px ${GY}px` }}>
                  <rect x={t.x - 3} y={GY - t.h} width="6" height={t.h} fill="#5D4037" rx="2.5" />
                  <circle cx={t.x} cy={GY - t.h - t.cr * 0.2} r={t.cr}
                    fill={['#2E7D32','#388E3C','#1B5E20'][i%3]} opacity="0.75" />
                  {i % 2 === 0 && day >= 19 && (
                    <>
                      <circle cx={t.x - 5} cy={GY - t.h - t.cr*0.1 + 4} r="2" fill="#FFD54F" opacity="0.7" />
                      <circle cx={t.x + 6} cy={GY - t.h - t.cr*0.1 + 2} r="1.5" fill="#FFD54F" opacity="0.6" />
                    </>
                  )}
                </g>
              ))}

              {/* Grass strip */}
              <rect x="-100" y={GY - 3} width="400" height="6" fill="url(#grassG)" />
              {day >= 4 && Array.from({ length: 20 }).map((_, i) => {
                const gx = -20 + i * 12;
                const gh = 3 + (i * 7 % 5);
                return (
                  <line key={`gr${i}`} x1={gx} y1={GY - 3} x2={gx + (i%2===0?2:-2)} y2={GY - 3 - gh}
                    stroke="#81C784" strokeWidth="1" strokeLinecap="round"
                    style={{ animation: `grassSway 2.5s ${i*0.1}s ease-in-out infinite` }} />
                );
              })}

              {/* Soil cross-section */}
              <rect x="-100" y={GY} width="400" height="200" fill="url(#soilG)" />
              <line x1="-100" y1={GY + 30} x2="300" y2={GY + 30} stroke="#5D4037" strokeWidth="0.5" opacity="0.3" />
              <line x1="-100" y1={GY + 50} x2="300" y2={GY + 50} stroke="#4E342E" strokeWidth="0.4" opacity="0.2" />
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

              {/* Seed */}
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

              {/* Roots */}
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
                      style={{
                        strokeDasharray: r.len * 1.5,
                        strokeDashoffset: r.len * 1.5,
                        animation: `drawLine ${0.7}s ${r.delay}s both ease-out`,
                      }} />
                    {r.len > 12 && (
                      <line x1={mx} y1={my} x2={mx + (i%2===0?7:-7)} y2={my + 6}
                        stroke="#BCAAA4" strokeWidth="0.7" strokeLinecap="round"
                        style={{
                          strokeDasharray: 12, strokeDashoffset: 12,
                          animation: `drawLine 0.4s ${r.delay + 0.4}s both ease-out`,
                        }} />
                    )}
                    <circle cx={x2} cy={y2} r="1.2" fill="#D7CCC8" opacity="0"
                      style={{ animation: `fadeIn 0.3s ${r.delay + 0.5}s both` }} />
                  </g>
                );
              })}

              {/* Stem below ground */}
              {stemBelow > 0 && (
                <line x1="100" y1={seedY - 3} x2="100" y2={GY}
                  stroke="#6D8C5E" strokeWidth={Math.min(stemW * 0.7, 3.5)} strokeLinecap="round"
                  style={{ strokeDasharray: 30, strokeDashoffset: 30, animation: 'drawLine 0.8s 0.2s both ease-out' }} />
              )}

              {/* Stem above ground */}
              {sproutVisible && (
                <line x1="100" y1={GY} x2="100" y2={stemTopY}
                  stroke="url(#stemG)" strokeWidth={stemW} strokeLinecap="round"
                  style={{ strokeDasharray: stemH + 5, strokeDashoffset: stemH + 5, animation: 'drawLine 1.2s both ease-out' }} />
              )}

              {/* Leaves */}
              {leaves.map((l, i) => {
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

              {/* Canopy */}
              {canopyR > 3 && (
                <g style={{ animation: 'canopyPop 1s 0.2s both ease-out', transformOrigin: `100px ${canopyCY}px` }}>
                  <ellipse cx="103" cy={canopyCY + 3} rx={canopyR * 0.7} ry={canopyR * 0.5} fill="#1B5E20" opacity="0.5" />
                  <circle cx="100" cy={canopyCY} r={canopyR} fill="url(#canG)" />
                  <ellipse cx="92" cy={canopyCY - canopyR * 0.3} rx={canopyR * 0.35} ry={canopyR * 0.25} fill="#A5D6A7" opacity="0.18" />
                </g>
              )}

              {/* Fruits */}
              {fruits.map((f, i) => (
                <g key={`fr${i}`} style={{ animation: `fruitBounce 0.55s ${f.delay}s both ease-out` }}>
                  <circle cx={f.cx} cy={f.cy} r="3.5" fill="#FFD54F" />
                  <circle cx={f.cx - 1} cy={f.cy - 1} r="1" fill="#FFF9C4" opacity="0.6" />
                  <line x1={f.cx} y1={f.cy - 3.5} x2={f.cx} y2={f.cy - 5} stroke="#5D4037" strokeWidth="0.6" strokeLinecap="round" />
                </g>
              ))}

              {/* Floating particles */}
              {day >= 6 && Array.from({ length: Math.min(day - 5, 10) }).map((_, i) => (
                <circle key={`fp${i}`}
                  cx={70 + i * 8} cy={GY - 25 - i * 7}
                  r={0.7 + (i%3) * 0.4}
                  fill={['#FFD54F','#A5D6A7','#FFF9C4'][i%3]}
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

      {/* ═══════ KEYFRAMES ═══════ */}
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
        @keyframes drawLine {
          to { stroke-dashoffset: 0; }
        }
        @keyframes leafPop {
          0%   { opacity:0; transform:scale(0) rotate(20deg); }
          70%  { transform:scale(1.15) rotate(-3deg); }
          100% { opacity:1; transform:scale(1) rotate(0); }
        }
        @keyframes canopyPop {
          0%   { opacity:0; transform:scale(0.1); }
          60%  { transform:scale(1.08); }
          100% { opacity:1; transform:scale(1); }
        }
        @keyframes fruitBounce {
          0%   { opacity:0; transform:scale(0) translateY(-6px); }
          50%  { opacity:1; transform:scale(1.3) translateY(1px); }
          100% { transform:scale(1) translateY(0); }
        }
        @keyframes treeGrow {
          from { opacity:0; transform:scaleY(0); }
          to   { opacity:0.75; transform:scaleY(1); }
        }
        @keyframes earthAppear {
          0%   { opacity:0; transform:scale(0.08); }
          40%  { opacity:0.6; }
          100% { opacity:1; transform:scale(1); }
        }
        @keyframes sunPulse {
          0%,100% { opacity:0.75; transform:scale(1); }
          50%     { opacity:1;    transform:scale(1.08); }
        }
        @keyframes twinkle {
          0%,100% { opacity:0.1; }
          50%     { opacity:0.85; }
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
        @keyframes fadeIn {
          from { opacity:0; }
          to   { opacity:1; }
        }
        @keyframes wormWiggle {
          0%,100% { transform:translateX(0); }
          25%     { transform:translateX(2px); }
          75%     { transform:translateX(-2px); }
        }
        @keyframes arrowBounce {
          0%,100% { transform:translateY(0); opacity:0.3; }
          50%     { transform:translateY(4px); opacity:0.6; }
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
