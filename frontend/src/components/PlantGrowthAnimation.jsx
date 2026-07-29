import React, { useMemo } from 'react';

/**
 * PlantGrowthAnimation — High-fidelity, artistic dynamic SVG renderer.
 * Features 4 distinct visual phases with cinematic camera transitions:
 *
 * Phase 1 (Days 1-5): Underground seed & sprout breaking topsoil with organic roots.
 * Phase 2 (Days 6-15): Thick wooden trunk tree growing layered canopy & golden fruits.
 * Phase 3 (Days 16-21): Panoramic lush forest landscape with depth, hills, and pine layers.
 * Phase 4 (Day 22): Majestic 3D Evergreen Planet floating in deep outer space with atmosphere & clouds.
 */
const PlantGrowthAnimation = ({ day = 0, totalDays = 22 }) => {
  const p = Math.min(Math.max(day, 0) / totalDays, 1); // 0 -> 1

  // Determine active visual mode based on day
  const isSeedPhase = day <= 5;
  const isTreePhase = day >= 6 && day <= 15;
  const isForestPhase = day >= 16 && day <= 21;
  const isWorldPhase = day >= 22;

  // Camera scale and position for smooth zoom effect across stages
  const getCamTransform = () => {
    if (day <= 0) return 'scale(2.2) translate(0px, -20px)';
    if (day <= 3) return 'scale(2.4) translate(0px, -25px)';
    if (day <= 5) return 'scale(1.8) translate(0px, -15px)';
    if (day <= 10) return 'scale(1.2) translate(0px, -5px)';
    if (day <= 15) return 'scale(1.0) translate(0px, 0px)';
    if (day <= 21) return 'scale(0.85) translate(0px, 10px)';
    return 'scale(1.0) translate(0px, 0px)'; // World mode fills viewport
  };

  return (
    <div className="relative w-full flex items-center justify-center overflow-hidden rounded-2xl" style={{ minHeight: 260 }}>
      <svg
        viewBox="0 0 400 320"
        className="w-full h-auto select-none"
        style={{ maxWidth: 360, maxHeight: 310 }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Sky Gradients */}
          <linearGradient id="skyDay" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3897d8" />
            <stop offset="60%" stopColor="#76c4ef" />
            <stop offset="100%" stopColor="#bce3f7" />
          </linearGradient>

          <linearGradient id="skySunset" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1a3b5d" />
            <stop offset="40%" stopColor="#2e6b72" />
            <stop offset="80%" stopColor="#4a8f6d" />
            <stop offset="100%" stopColor="#68ad77" />
          </linearGradient>

          <radialGradient id="spaceBg" cx="50%" cy="50%" r="75%">
            <stop offset="0%" stopColor="#0b1329" />
            <stop offset="60%" stopColor="#050914" />
            <stop offset="100%" stopColor="#020307" />
          </radialGradient>

          {/* Soil Gradients */}
          <linearGradient id="topSoil" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4d8c3f" />
            <stop offset="15%" stopColor="#5c3a21" />
            <stop offset="100%" stopColor="#382112" />
          </linearGradient>

          <linearGradient id="deepSoil" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5a3820" />
            <stop offset="50%" stopColor="#3d2313" />
            <stop offset="100%" stopColor="#241309" />
          </linearGradient>

          {/* Trunk & Bark Gradient */}
          <linearGradient id="barkGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#3e2415" />
            <stop offset="35%" stopColor="#6e452a" />
            <stop offset="70%" stopColor="#8a5735" />
            <stop offset="100%" stopColor="#3a2012" />
          </linearGradient>

          <linearGradient id="barkBranch" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7a4a2b" />
            <stop offset="100%" stopColor="#422614" />
          </linearGradient>

          {/* Foliage Gradients */}
          <radialGradient id="foliageDark" cx="40%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#47ad54" />
            <stop offset="50%" stopColor="#1e7328" />
            <stop offset="100%" stopColor="#0d4013" />
          </radialGradient>

          <radialGradient id="foliageBright" cx="35%" cy="25%" r="65%">
            <stop offset="0%" stopColor="#7ee388" />
            <stop offset="55%" stopColor="#2ebb40" />
            <stop offset="100%" stopColor="#13661f" />
          </radialGradient>

          {/* Golden Fruit / Coin Gradient */}
          <radialGradient id="goldFruit" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#fff7a6" />
            <stop offset="45%" stopColor="#ffd23c" />
            <stop offset="85%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#b45309" />
          </radialGradient>

          {/* 3D Planet Earth Gradients */}
          <radialGradient id="planetOcean" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#2575fc" />
            <stop offset="50%" stopColor="#1a4b9c" />
            <stop offset="85%" stopColor="#0d2b68" />
            <stop offset="100%" stopColor="#051336" />
          </radialGradient>

          <radialGradient id="planetLand" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#52d66b" />
            <stop offset="40%" stopColor="#1b9e3a" />
            <stop offset="80%" stopColor="#0e5e21" />
            <stop offset="100%" stopColor="#063812" />
          </radialGradient>

          <radialGradient id="atmoHalo" cx="50%" cy="50%" r="50%">
            <stop offset="70%" stopColor="transparent" />
            <stop offset="88%" stopColor="#38ef7d" stopOpacity="0.35" />
            <stop offset="97%" stopColor="#11998e" stopOpacity="0.6" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>

          {/* Glow Filters */}
          <filter id="glowGold" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <filter id="planetGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* ========================================================================= */}
        {/* MODE 4: PLANET EARTH IN OUTER SPACE (DAY 22+)                             */}
        {/* ========================================================================= */}
        {isWorldPhase ? (
          <g className="animate-fadeIn">
            {/* Deep Space Background */}
            <rect width="400" height="320" fill="url(#spaceBg)" />

            {/* Nebula Dust Clouds */}
            <path d="M 20 50 Q 120 10 220 70 T 380 40" fill="none" stroke="#6366f1" strokeWidth="40" opacity="0.08" filter="blur(20px)" />
            <path d="M 50 240 Q 180 290 310 220 T 390 280" fill="none" stroke="#10b981" strokeWidth="50" opacity="0.1" filter="blur(25px)" />

            {/* Twinkling Stars */}
            {[
              [30,40,1.5],[80,20,2],[140,50,1],[190,25,2.5],[260,35,1.2],[310,15,2],[370,50,1],
              [20,130,1],[60,170,2],[350,140,1.8],[380,210,1],[40,260,2.2],[110,290,1],[300,280,2],
              [150,270,1.5],[230,300,1],[340,90,2.5],[90,110,1.2]
            ].map(([cx, cy, r], i) => (
              <circle
                key={`star-${i}`}
                cx={cx} cy={cy} r={r}
                fill={i % 3 === 0 ? '#fde047' : i % 2 === 0 ? '#67e8f9' : '#ffffff'}
                opacity={0.4 + (i % 5) * 0.12}
                className="animate-pulse"
                style={{ animationDuration: `${1.5 + (i % 4) * 0.7}s` }}
              />
            ))}

            {/* Shooting Star */}
            <line x1="280" y1="30" x2="340" y2="60" stroke="url(#goldFruit)" strokeWidth="1.5" strokeLinecap="round" opacity="0.7">
              <animate attributeName="opacity" values="0;1;0" dur="3s" repeatCount="indefinite" />
            </line>

            {/* Atmosphere Halo Glow */}
            <circle cx="200" cy="155" r="105" fill="url(#atmoHalo)" filter="url(#planetGlow)" />

            {/* Main Planet Earth Sphere */}
            <circle cx="200" cy="155" r="92" fill="url(#planetOcean)" />

            {/* Evergreen Continents (Rich Green Landmasses) */}
            <g>
              {/* North America / Europe Continent */}
              <path d="M 140 110 C 150 90, 180 85, 210 95 C 230 105, 250 90, 260 110 C 270 130, 240 145, 210 140 C 180 135, 160 150, 140 130 Z" fill="url(#planetLand)" />
              {/* South America / Africa Continent */}
              <path d="M 160 150 C 180 145, 210 155, 225 175 C 235 195, 215 220, 195 225 C 175 220, 165 195, 155 175 Z" fill="url(#planetLand)" />
              {/* Asia / Islands */}
              <path d="M 220 120 C 240 115, 265 125, 275 145 C 280 160, 260 170, 245 160 Z" fill="url(#planetLand)" />
              <circle cx="145" cy="175" r="7" fill="url(#planetLand)" />
              <circle cx="265" cy="175" r="9" fill="url(#planetLand)" />
            </g>

            {/* Micro Evergreen Forest Textures on Continents */}
            {[
              [175,105],[195,100],[215,110],[235,115],[180,125],[200,120],[220,130],
              [175,165],[190,180],[205,195],[185,210],[240,135],[255,145]
            ].map(([x,y], i) => (
              <g key={`tree-micro-${i}`} transform={`translate(${x}, ${y}) scale(0.4)`}>
                <polygon points="0,-12 -7,0 7,0" fill="#145222" />
                <polygon points="0,-8 -5,3 5,3" fill="#228b3c" />
              </g>
            ))}

            {/* Atmospheric Cloud Swirls */}
            <path d="M 130 125 Q 160 115 190 130 T 250 120" fill="none" stroke="#ffffff" strokeWidth="4" opacity="0.35" strokeLinecap="round" />
            <path d="M 150 170 Q 180 185 210 175 T 260 185" fill="none" stroke="#ffffff" strokeWidth="5" opacity="0.3" strokeLinecap="round" />
            <ellipse cx="200" cy="72" rx="40" ry="8" fill="#ffffff" opacity="0.4" />

            {/* Orbiting Golden Wealth Ring / Satellites */}
            <ellipse cx="200" cy="155" rx="125" ry="35" fill="none" stroke="url(#goldFruit)" strokeWidth="1.5" strokeDasharray="6 8" opacity="0.8" transform="rotate(-12 200 155)" />
            <circle cx="95" cy="140" r="4" fill="url(#goldFruit)" filter="url(#glowGold)" />
            <circle cx="290" cy="170" r="5" fill="url(#goldFruit)" filter="url(#glowGold)" />

            {/* Center Celebration Banner Text */}
            <g transform="translate(200, 290)">
              <rect x="-95" y="-14" width="190" height="24" rx="12" fill="#062e23" stroke="#10b981" strokeWidth="1" opacity="0.9" />
              <text textAnchor="middle" y="2" fill="#34d399" fontSize="11" fontWeight="800" letterSpacing="0.5">
                🌍 EVERGREEN EMPIRE COMPLETE
              </text>
            </g>
          </g>
        ) : (
          /* ========================================================================= */
          /* MODES 1, 2, 3: GROUND & SKY WITH DYNAMIC CAMERA ZOOM                      */
          /* ========================================================================= */
          <g>
            {/* Dynamic Sky Background */}
            <rect width="400" height="320" fill={isForestPhase ? 'url(#skySunset)' : 'url(#skyDay)'} />

            {/* Sun with Rays */}
            <g transform="translate(320, 60)">
              <circle r="35" fill="#fde047" opacity="0.25" />
              <circle r="22" fill="#facc15" opacity="0.6" filter="url(#glowGold)" />
              <circle r="14" fill="#ffffff" />
            </g>

            {/* Clouds drifting */}
            <g opacity="0.7">
              <path d="M 40 60 Q 55 45 75 55 Q 90 40 110 55 Q 125 60 110 75 Q 40 80 40 60 Z" fill="#ffffff" opacity="0.85" />
              <path d="M 220 85 Q 235 70 255 80 Q 270 65 290 80 Q 305 85 290 100 Q 220 105 220 85 Z" fill="#ffffff" opacity="0.65" />
            </g>

            {/* Distant Mountains (Forest Phase) */}
            {isForestPhase && (
              <g opacity="0.6">
                <polygon points="-20,200 60,110 140,200" fill="#1e4d3b" />
                <polygon points="80,200 170,90 260,200" fill="#163e30" />
                <polygon points="200,200 290,105 380,200" fill="#1a4636" />
                <polygon points="290,200 360,120 430,200" fill="#0f3024" />
              </g>
            )}

            {/* Midground Rolling Hills (Forest & Tree Phase) */}
            {(isTreePhase || isForestPhase) && (
              <g>
                <path d="M -20 210 Q 90 165 200 195 T 420 180 L 420 240 L -20 240 Z" fill="#2d7a46" opacity="0.7" />
                <path d="M -20 220 Q 120 185 240 210 T 420 195 L 420 250 L -20 250 Z" fill="#236638" />
              </g>
            )}

            {/* Background Forest Trees Array (Forest Phase) */}
            {isForestPhase && (
              <g>
                {[
                  [20,185,0.7],[50,175,0.9],[80,180,0.8],[120,170,1.1],[150,175,0.85],
                  [250,170,1.0],[280,180,0.75],[320,165,1.2],[350,175,0.9],[380,185,0.7]
                ].map(([x, y, scale], i) => (
                  <g key={`bg-pine-${i}`} transform={`translate(${x}, ${y}) scale(${scale})`}>
                    <rect x="-3" y="0" width="6" height="25" fill="#3a2012" rx="1" />
                    <polygon points="0,-45 -18,-15 18,-15" fill="#145222" />
                    <polygon points="0,-35 -15,-8 15,-8" fill="#1e7328" />
                    <polygon points="0,-25 -12,0 12,0" fill="#2ebb40" />
                  </g>
                ))}
              </g>
            )}

            {/* GROUND & SOIL CROSS-SECTION */}
            <g transform="translate(0, 195)">
              {/* Grass surface line */}
              <rect x="-10" y="0" width="420" height="12" fill="#47ad54" rx="3" />

              {/* Grass Tufts */}
              {[15, 45, 85, 135, 175, 225, 275, 315, 365].map((gx, i) => (
                <path key={`grass-${i}`} d={`M ${gx} 2 Q ${gx - 4} -8 ${gx - 8} -12 M ${gx} 2 Q ${gx + 2} -10 ${gx + 5} -14 M ${gx} 2 Q ${gx + 6} -6 ${gx + 10} -10`} stroke="#7ee388" strokeWidth="1.8" strokeLinecap="round" />
              ))}

              {/* Underground Soil Layer */}
              <rect x="-10" y="10" width="420" height="125" fill="url(#topSoil)" />

              {/* Soil Strata Texture */}
              <path d="M -10 40 Q 100 55 200 35 T 410 45" fill="none" stroke="#331c0e" strokeWidth="3" opacity="0.4" />
              <path d="M -10 75 Q 120 60 250 80 T 410 70" fill="none" stroke="#241309" strokeWidth="4" opacity="0.5" />

              {/* Underground Pebbles & Earth Details */}
              <ellipse cx="60" cy="50" rx="6" ry="3.5" fill="#241309" opacity="0.6" />
              <ellipse cx="140" cy="80" rx="8" ry="4" fill="#241309" opacity="0.6" />
              <ellipse cx="280" cy="45" rx="5" ry="3" fill="#241309" opacity="0.6" />
              <ellipse cx="340" cy="75" rx="7" ry="4" fill="#241309" opacity="0.6" />
            </g>

            {/* ========================================================================= */}
            {/* MAIN GROWING PLANT / TREE (TRANSFORMED BY CAMERA ZOOM)                   */}
            {/* ========================================================================= */}
            <g style={{ transform: getCamTransform(), transformOrigin: '200px 195px', transition: 'transform 1.2s ease-out' }}>

              {/* --------------------------------------------------------------------- */}
              {/* PHASE 1: UNDERGROUND SEED & ROOT SYSTEM (DAYS 1 - 5)                   */}
              {/* --------------------------------------------------------------------- */}
              {isSeedPhase && (
                <g transform="translate(200, 195)">
                  {/* Underground Taproot & Fine Lateral Roots */}
                  <g className="animate-fadeIn">
                    <path d="M 0 10 Q -5 30 -12 55 Q -18 75 -25 90" fill="none" stroke="#a37549" strokeWidth="3" strokeLinecap="round" />
                    <path d="M 0 10 Q 6 35 15 60 Q 22 80 30 95" fill="none" stroke="#a37549" strokeWidth="2.8" strokeLinecap="round" />
                    <path d="M 0 10 Q 0 45 2 75 Q 4 95 0 110" fill="none" stroke="#c4905d" strokeWidth="2.2" strokeLinecap="round" />
                    {/* Lateral Hair Roots */}
                    <path d="M -8 40 Q -20 48 -30 52" fill="none" stroke="#d4a373" strokeWidth="1.2" />
                    <path d="M 10 45 Q 24 52 35 58" fill="none" stroke="#d4a373" strokeWidth="1.2" />
                    <path d="M -15 68 Q -28 75 -35 82" fill="none" stroke="#d4a373" strokeWidth="1" />
                  </g>

                  {/* The Acorn / Seed Underground */}
                  <g transform="translate(0, 15)">
                    {/* Seed Shell */}
                    <ellipse cx="0" cy="0" rx="9" ry="7" fill="#8a5229" stroke="#4a2a12" strokeWidth="1.5" />
                    <path d="M -6 -2 Q 0 -7 6 -2" fill="#5c3418" />

                    {/* Seed Crack Opening on Day 2+ */}
                    {day >= 2 && (
                      <path d="M -2 -4 L 1 0 L -1 4" fill="none" stroke="#fef08a" strokeWidth="1.5" strokeLinecap="round" />
                    )}
                  </g>

                  {/* Emerging Sprout Stem breaking topsoil (Day 3+) */}
                  {day >= 3 && (
                    <g>
                      <path d="M 0 15 Q -2 -5 0 -25 Q 2 -45 0 -60" fill="none" stroke="#47ad54" strokeWidth="4" strokeLinecap="round" />
                      {/* Broken Dirt Bits at Surface */}
                      <circle cx="-6" cy="0" r="2.5" fill="#5c3a21" />
                      <circle cx="5" cy="-2" r="3" fill="#5c3a21" />

                      {/* First Sprout Leaves (Day 4+) */}
                      {day >= 4 && (
                        <g transform="translate(0, -60)">
                          <path d="M 0 0 C -15 -10, -20 -25, -5 -25 C 0 -15, 0 0, 0 0 Z" fill="#7ee388" stroke="#1e7328" strokeWidth="1" />
                          <path d="M 0 0 C 15 -10, 20 -25, 5 -25 C 0 -15, 0 0, 0 0 Z" fill="#47ad54" stroke="#1e7328" strokeWidth="1" />
                        </g>
                      )}
                    </g>
                  )}
                </g>
              )}

              {/* --------------------------------------------------------------------- */}
              {/* PHASE 2 & 3: REAL WOODEN TRUNK TREE & CANOPY (DAYS 6 - 21)             */}
              {/* --------------------------------------------------------------------- */}
              {(isTreePhase || isForestPhase) && (
                <g transform="translate(200, 195)">
                  {/* Underground Roots Anchoring Tree */}
                  <g opacity="0.8">
                    <path d="M -8 5 Q -25 25 -45 45" fill="none" stroke="#422614" strokeWidth="6" strokeLinecap="round" />
                    <path d="M 8 5 Q 30 30 50 50" fill="none" stroke="#422614" strokeWidth="5.5" strokeLinecap="round" />
                    <path d="M 0 10 Q -5 45 -10 80" fill="none" stroke="#3a2012" strokeWidth="4" strokeLinecap="round" />
                  </g>

                  {/* Thick Wooden Tree Trunk with Bark Texture */}
                  <g>
                    {/* Flared Base Roots above ground */}
                    <path d="M -22 5 C -15 -15, -12 -40, -10 -70 L 10 -70 C 12 -40, 15 -15, 22 5 Z" fill="url(#barkGrad)" />

                    {/* Bark Line Detail */}
                    <path d="M -6 -10 Q -3 -35 -4 -65" fill="none" stroke="#2b160a" strokeWidth="1.5" opacity="0.6" />
                    <path d="M 4 -5 Q 2 -30 5 -60" fill="none" stroke="#2b160a" strokeWidth="1.5" opacity="0.6" />

                    {/* Thick Branching Limbs */}
                    {/* Left Primary Branch */}
                    <path d="M -9 -55 Q -25 -75 -45 -90 L -35 -98 Q -18 -82 -6 -68 Z" fill="url(#barkBranch)" />
                    {/* Right Primary Branch */}
                    <path d="M 8 -55 Q 28 -78 50 -95 L 40 -102 Q 20 -83 5 -68 Z" fill="url(#barkBranch)" />
                    {/* Center Branch Extension */}
                    <path d="M -5 -65 Q 0 -90 -5 -115 L 5 -115 Q 6 -90 5 -65 Z" fill="url(#barkBranch)" />
                  </g>

                  {/* Organic Layered Foliage Canopy */}
                  <g transform="translate(0, -115)" className="animate-fadeIn">
                    {/* Layer 1: Dark Back Shadow Leaves */}
                    <circle cx="-35" cy="-20" r="38" fill="url(#foliageDark)" />
                    <circle cx="35" cy="-20" r="38" fill="url(#foliageDark)" />
                    <circle cx="0" cy="-45" r="45" fill="url(#foliageDark)" />

                    {/* Layer 2: Main Middle Canopy Spheres */}
                    <circle cx="-25" cy="-10" r="34" fill="url(#foliageBright)" />
                    <circle cx="25" cy="-10" r="34" fill="url(#foliageBright)" />
                    <circle cx="0" cy="-35" r="40" fill="url(#foliageBright)" />

                    {/* Layer 3: Top Highlight Leaves */}
                    <circle cx="-15" cy="-45" r="26" fill="#47ad54" />
                    <circle cx="15" cy="-45" r="26" fill="#47ad54" />
                    <circle cx="0" cy="-55" r="28" fill="#7ee388" opacity="0.9" />

                    {/* Individual Leaf Detail Clusters on Canopy Outer Edge */}
                    {[
                      [-55,-10],[55,-10],[-40,-45],[40,-45],[0,-75],[-20,-65],[20,-65]
                    ].map(([lx, ly], idx) => (
                      <path key={`leaf-cluster-${idx}`} d={`M ${lx} ${ly} C ${lx-10} ${ly-10}, ${lx-5} ${ly-20}, ${lx} ${ly-12} C ${lx+5} ${ly-20}, ${lx+10} ${ly-10}, ${lx} ${ly} Z`} fill="#7ee388" />
                    ))}

                    {/* Golden Yield Fruits / Coins (Days 12+) */}
                    {day >= 12 && (
                      <g className="animate-fadeIn">
                        {[
                          [-30,-15], [30,-15], [0,-40], [-20,-45], [20,-45], [-40,-30], [40,-30]
                        ].map(([fx, fy], fidx) => (
                          <g key={`fruit-gold-${fidx}`} transform={`translate(${fx}, ${fy})`} filter="url(#glowGold)">
                            <circle r="7" fill="url(#goldFruit)" stroke="#b45309" strokeWidth="0.8" />
                            <circle cx="-2" cy="-2" r="2" fill="#ffffff" opacity="0.6" />
                            {/* ₹ Currency Symbol on Golden Fruits */}
                            <text textAnchor="middle" y="3" fill="#78350f" fontSize="8" fontWeight="900">₹</text>
                          </g>
                        ))}
                      </g>
                    )}
                  </g>
                </g>
              )}
            </g>
          </g>
        )}
      </svg>
    </div>
  );
};

export default PlantGrowthAnimation;
