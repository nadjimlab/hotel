import React from 'react';

interface ResortBackgroundProps {
  className?: string;
  showOverlay?: boolean;
  intensity?: 'subtle' | 'medium' | 'vibrant';
  position?: 'absolute' | 'fixed';
  customImageUrl?: string;
}

/**
 * High-fidelity Resort Oasis Aerial Background recreating images.jfif
 * Shows the stunning dusk aerial view of La Gazelle d'Or:
 * - Glowing turquoise & cyan lagoon pool with central circular island
 * - Lush green date palm oasis canopy (palmeraie) spanning across the desert
 * - Traditional white domes (Mille Coupoles) and warm lantern terrace
 * - Warm Saharan dunes horizon at twilight
 */
export const ResortBackground: React.FC<ResortBackgroundProps> = ({
  className = '',
  showOverlay = true,
  intensity = 'vibrant',
  position = 'absolute',
  customImageUrl,
}) => {
  const posClass = position === 'fixed' ? 'fixed inset-0' : 'absolute inset-0';
  const opacityVal = intensity === 'subtle' ? 'opacity-75' : intensity === 'medium' ? 'opacity-90' : 'opacity-100';

  return (
    <div
      className={`${posClass} pointer-events-none overflow-hidden z-0 select-none ${className}`}
      aria-hidden="true"
    >
      {customImageUrl ? (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
          style={{ backgroundImage: `url(${customImageUrl})` }}
        />
      ) : (
        /* Aerial Panorama directly recreating images.jfif */
        <div className={`absolute inset-0 w-full h-full transition-opacity duration-700 ${opacityVal}`}>
          {/* Base Twilight Sky */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0F141C] via-[#1A181C] to-[#251A14]" />

          {/* SVG Canvas for the Aerial Resort Pool and Oasis */}
          <svg
            className="absolute inset-0 w-full h-full object-cover"
            viewBox="0 0 1920 1080"
            preserveAspectRatio="xMidYMid slice"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Turquoise Lagoon Pool Glow */}
              <radialGradient id="poolLuminescentCyan" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#00F0D0" stopOpacity="1" />
                <stop offset="30%" stopColor="#06D6A6" stopOpacity="0.95" />
                <stop offset="65%" stopColor="#0EA5E9" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#0369A1" stopOpacity="0.6" />
              </radialGradient>

              {/* Pool Emerald Green Glow (Left-Center) */}
              <radialGradient id="poolEmeraldGlow" cx="35%" cy="45%" r="45%">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#059669" stopOpacity="0.75" />
                <stop offset="100%" stopColor="transparent" stopOpacity="0" />
              </radialGradient>

              {/* Central Island Jacuzzi Warm Core */}
              <radialGradient id="islandCoreAmber" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FDE68A" stopOpacity="1" />
                <stop offset="45%" stopColor="#F59E0B" stopOpacity="0.85" />
                <stop offset="85%" stopColor="#047857" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#064E3B" stopOpacity="0.2" />
              </radialGradient>

              {/* Water Glow Diffuse Filter */}
              <filter id="waterGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>

              {/* Ambient Terrace Lanterns */}
              <radialGradient id="warmSpotlight" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FBBF24" stopOpacity="0.9" />
                <stop offset="40%" stopColor="#D97706" stopOpacity="0.45" />
                <stop offset="100%" stopColor="transparent" stopOpacity="0" />
              </radialGradient>

              {/* Saharan Dunes Horizon */}
              <linearGradient id="duneSunset" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#2D1F17" />
                <stop offset="100%" stopColor="#1F1611" />
              </linearGradient>

              {/* Palm Canopy Dark Emerald */}
              <linearGradient id="palmeraieCanopy" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#132415" />
                <stop offset="50%" stopColor="#0E1B10" />
                <stop offset="100%" stopColor="#18130E" />
              </linearGradient>
            </defs>

            {/* 1. Distant Golden Desert Dunes Horizon (El Oued) */}
            <path
              d="M0,200 Q480,160 960,190 T1920,180 L1920,380 L0,380 Z"
              fill="url(#duneSunset)"
            />
            <path
              d="M0,240 Q640,210 1280,250 T1920,230 L1920,440 L0,440 Z"
              fill="#221710"
            />

            {/* 2. Distant White Domes Palace Pavilion under Twilight */}
            <g opacity="0.85">
              <ellipse cx="960" cy="180" rx="35" ry="22" fill="#EAE0D0" />
              <rect x="930" y="185" width="60" height="20" fill="#DDD0BC" />
              <circle cx="960" cy="182" r="10" fill="#FEF08A" opacity="0.85" />
            </g>

            {/* 3. Date Palm Oasis Forest (Palmeraie stretching across midground) */}
            <path
              d="M0,320 C180,300 360,310 540,300 C720,290 900,310 1080,295 C1260,285 1440,305 1620,295 C1780,290 1920,305 1920,305 L1920,680 L0,680 Z"
              fill="url(#palmeraieCanopy)"
            />
            
            {/* Palm tops textures */}
            {[60, 140, 220, 310, 420, 530, 640, 750, 860, 970, 1080, 1190, 1300, 1410, 1520, 1630, 1740, 1850].map(
              (x, i) => (
                <g key={i}>
                  <circle cx={x} cy={340 + (i % 4) * 20} r={38 + (i % 3) * 6} fill="#142617" opacity="0.7" />
                  <circle cx={x + 20} cy={390 + (i % 3) * 25} r={44} fill="#0F1C11" opacity="0.8" />
                  <circle cx={x - 15} cy={440 + (i % 2) * 20} r={46} fill="#122214" opacity="0.85" />
                </g>
              )
            )}

            {/* 4. Surrounding Resort Sandy Esplanade */}
            <path
              d="M0,580 Q960,530 1920,580 L1920,1080 L0,1080 Z"
              fill="#261C14"
            />

            {/* 5. Traditional White Domes Villas (Mille Coupoles from images.jfif) */}
            <g opacity="0.9">
              {/* Left chalets with white domes */}
              <ellipse cx="260" cy="900" rx="55" ry="38" fill="#F4ECE1" />
              <ellipse cx="360" cy="910" rx="46" ry="32" fill="#E8DEC8" />
              <ellipse cx="300" cy="950" rx="42" ry="28" fill="#DECFA8" />

              {/* Right chalets with white domes */}
              <ellipse cx="1660" cy="900" rx="58" ry="40" fill="#F4ECE1" />
              <ellipse cx="1760" cy="910" rx="48" ry="34" fill="#E8DEC8" />
              <ellipse cx="1710" cy="950" rx="44" ry="30" fill="#DECFA8" />

              {/* Upper terrace pavilions */}
              <ellipse cx="780" cy="560" rx="34" ry="24" fill="#EFE5D4" />
              <ellipse cx="830" cy="565" rx="28" ry="20" fill="#E2D4BC" />
              <ellipse cx="1340" cy="575" rx="32" ry="22" fill="#EFE5D4" />
            </g>

            {/* 6. Thatched Tiki Umbrella Cabana by the pool (Right side in images.jfif) */}
            <g opacity="0.95">
              <ellipse cx="1460" cy="710" rx="85" ry="46" fill="#B45309" />
              <ellipse cx="1460" cy="706" rx="76" ry="40" fill="#D97706" />
              <ellipse cx="1460" cy="702" rx="60" ry="32" fill="#FBBF24" />
              <circle cx="1460" cy="698" r="9" fill="#78350F" />
            </g>

            {/* 7. GLOWING TURQUOISE & CYAN LAGOON POOL (THE CENTERPIECE OF images.jfif) */}
            {/* Outer Radiant Emerald Glow */}
            <ellipse
              cx="960"
              cy="740"
              rx="560"
              ry="240"
              fill="#059669"
              opacity="0.55"
              filter="url(#waterGlow)"
            />
            <ellipse
              cx="960"
              cy="740"
              rx="520"
              ry="215"
              fill="#06B6D4"
              opacity="0.65"
              filter="url(#waterGlow)"
            />

            {/* Main Curved Pool Basin */}
            <ellipse
              cx="960"
              cy="740"
              rx="490"
              ry="195"
              fill="#0E7490"
              stroke="#22D3EE"
              strokeWidth="4"
            />
            {/* Luminous Turquoise Water Layer */}
            <ellipse
              cx="960"
              cy="740"
              rx="480"
              ry="188"
              fill="url(#poolLuminescentCyan)"
              filter="url(#waterGlow)"
            />
            {/* Emerald Accent Left Half (from images.jfif) */}
            <ellipse
              cx="820"
              cy="735"
              rx="320"
              ry="165"
              fill="url(#poolEmeraldGlow)"
            />

            {/* Central Circular Island Jacuzzi (from images.jfif) */}
            <g>
              {/* Outer Island Basin */}
              <ellipse cx="1120" cy="720" rx="80" ry="42" fill="#042F2E" stroke="#5EEAD4" strokeWidth="3" />
              {/* Glowing Island Water */}
              <ellipse cx="1120" cy="720" rx="70" ry="36" fill="url(#islandCoreAmber)" />
              {/* Inner Island Ring */}
              <ellipse cx="1120" cy="720" rx="45" ry="24" fill="#0F766E" />
              <ellipse cx="1120" cy="720" rx="26" ry="14" fill="#FDE68A" opacity="0.9" />
            </g>

            {/* Underwater Glow Points (Lamp posts under water seen in images.jfif) */}
            {[
              { cx: 680, cy: 700, r: 16, fill: '#6EE7B7' },
              { cx: 780, cy: 660, r: 14, fill: '#A7F3D0' },
              { cx: 920, cy: 640, r: 15, fill: '#67E8F9' },
              { cx: 1240, cy: 670, r: 14, fill: '#38BDF8' },
              { cx: 1350, cy: 720, r: 16, fill: '#2DD4BF' },
              { cx: 1250, cy: 790, r: 15, fill: '#34D399' },
              { cx: 1040, cy: 820, r: 16, fill: '#5EEAD4' },
              { cx: 820, cy: 800, r: 15, fill: '#6EE7B7' },
              { cx: 620, cy: 740, r: 16, fill: '#A7F3D0' },
            ].map((light, idx) => (
              <circle
                key={idx}
                cx={light.cx}
                cy={light.cy}
                r={light.r}
                fill={light.fill}
                opacity="0.9"
                filter="url(#waterGlow)"
              />
            ))}

            {/* 8. Poolside Tables & Lounge Furniture */}
            <g fill="#E5DEC9" opacity="0.85">
              {/* Bottom Dining Tables (Arranged as seen in images.jfif) */}
              <rect x="660" y="910" width="85" height="30" rx="4" />
              <rect x="770" y="920" width="95" height="32" rx="4" />
              <rect x="1140" y="920" width="95" height="32" rx="4" />
              <rect x="1255" y="910" width="85" height="30" rx="4" />

              {/* Sunbed row on upper pool deck */}
              {[620, 680, 740, 800, 860, 1060, 1120, 1180, 1240].map((x, i) => (
                <rect key={i} x={x} y={580} width="18" height="32" rx="2" fill="#F4EFE6" />
              ))}
            </g>

            {/* 9. Warm Amber Terrace Lanterns & Evening Atmosphere */}
            {[
              { cx: 580, cy: 600, r: 55 },
              { cx: 960, cy: 560, r: 60 },
              { cx: 1400, cy: 620, r: 55 },
              { cx: 1540, cy: 760, r: 65 },
              { cx: 480, cy: 760, r: 65 },
              { cx: 960, cy: 950, r: 75 },
            ].map((lantern, idx) => (
              <circle
                key={idx}
                cx={lantern.cx}
                cy={lantern.cy}
                r={lantern.r}
                fill="url(#warmSpotlight)"
              />
            ))}

            {/* 10. Foreground Palm Trees Framing */}
            <g fill="#140E0A">
              <circle cx="120" cy="740" r="110" opacity="0.95" />
              <circle cx="1820" cy="720" r="115" opacity="0.95" />
            </g>
          </svg>
        </div>
      )}

      {/* Gentle, balanced vignette overlay for text clarity (NOT pitch black) */}
      {showOverlay && (
        <div className="absolute inset-0 bg-gradient-to-b from-[#18120E]/40 via-transparent to-[#18120E]/75 pointer-events-none" />
      )}
    </div>
  );
};
