import React from 'react';

interface GazelleLogoProps {
  className?: string;
  variant?: 'full' | 'horizontal' | 'mark' | 'text-only';
  theme?: 'gold' | 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Official vector representation of La Gazelle d'Or Resort & Spa logo (images.png)
 * Features the signature golden gazelle silhouette with luxury serif typography.
 */
export const GazelleLogo: React.FC<GazelleLogoProps> = ({
  className = '',
  variant = 'full',
  theme = 'gold',
  size = 'md',
}) => {
  // Theme color definitions
  const goldColor = '#D4A359';
  const lightGold = '#E6BF7A';
  const textColor = theme === 'dark' ? '#18120E' : theme === 'light' ? '#FFFFFF' : '#FAF6F0';
  const accentGold = '#C58F3B';

  // Sizing styles
  const sizeMap = {
    sm: { markSize: 'w-7 h-7', textClass: 'text-sm', subClass: 'text-[9px]' },
    md: { markSize: 'w-10 h-10', textClass: 'text-base sm:text-lg', subClass: 'text-[10px]' },
    lg: { markSize: 'w-16 h-16', textClass: 'text-xl sm:text-2xl', subClass: 'text-xs' },
    xl: { markSize: 'w-24 h-24', textClass: 'text-2xl sm:text-3xl', subClass: 'text-sm' },
  };

  const { markSize, textClass, subClass } = sizeMap[size];

  // The Gazelle Emblem SVG (Recreated accurately from images.png)
  const GazelleMark = (
    <svg
      viewBox="0 0 160 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${markSize} shrink-0 transition-transform duration-300 group-hover:scale-105`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="gazelleGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E6BF7A" />
          <stop offset="50%" stopColor="#D4A359" />
          <stop offset="100%" stopColor="#B88432" />
        </linearGradient>
        <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Slender Long Curved Horns */}
      <path
        d="M86 12 C96 22 108 26 122 28 C115 30 102 28 92 20 Z"
        fill="url(#gazelleGold)"
      />
      <path
        d="M80 16 C90 26 102 32 116 35 C108 37 98 33 88 26 Z"
        fill="url(#gazelleGold)"
      />

      {/* Alert Ears */}
      <path
        d="M98 32 C104 36 107 42 106 46 C102 44 98 39 96 34 Z"
        fill="url(#gazelleGold)"
      />

      {/* Head and Slender Muzzle with Eye Contour */}
      <path
        d="M82 28 C85 30 92 34 94 38 C94 42 90 45 84 46 C77 47 72 45 70 42 C68 40 70 36 74 32 C78 30 80 28 82 28 Z"
        fill="url(#gazelleGold)"
      />
      {/* Eye dot highlight */}
      <circle cx="84" cy="38" r="1.6" fill="#18120E" />

      {/* Graceful Long Arched Neck */}
      <path
        d="M86 46 C87 56 89 68 88 78 C86 86 82 92 78 98 C74 94 77 82 78 70 C79 58 78 50 77 44 Z"
        fill="url(#gazelleGold)"
      />

      {/* Reclining Torso & Shoulder */}
      <path
        d="M88 78 C98 80 114 86 122 96 C124 99 122 104 116 106 C106 106 94 100 86 98 C82 97 80 94 78 92 Z"
        fill="url(#gazelleGold)"
      />

      {/* Folded Front Leg (Classic royal gazelle pose from images.png) */}
      <path
        d="M78 96 C72 98 62 104 54 105 C46 106 42 104 40 102 C42 100 48 98 58 96 C68 94 76 94 78 96 Z"
        fill="url(#gazelleGold)"
      />
      {/* Second folded hoof accent */}
      <path
        d="M74 98 C66 102 56 108 48 110 C44 111 41 109 43 107 C49 104 58 100 68 98 Z"
        fill="url(#gazelleGold)"
      />

      {/* Back and Flank Line */}
      <path
        d="M120 98 C128 102 134 108 136 112 C132 113 124 110 118 106 Z"
        fill="url(#gazelleGold)"
      />

      {/* Ground Horizon / Sand Shimmer Line */}
      <ellipse cx="88" cy="116" rx="55" ry="3" fill="url(#gazelleGold)" opacity="0.35" />
    </svg>
  );

  // Variant: Just the mark
  if (variant === 'mark') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        {GazelleMark}
      </div>
    );
  }

  // Variant: Text only
  if (variant === 'text-only') {
    return (
      <div className={`inline-flex flex-col items-center text-center ${className}`}>
        <span
          className="font-serif tracking-[0.25em] text-[10px] sm:text-xs uppercase"
          style={{ color: lightGold }}
        >
          LA
        </span>
        <span
          className={`font-serif font-bold tracking-[0.18em] uppercase ${textClass}`}
          style={{ color: textColor }}
        >
          GAZELLE D'OR
        </span>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="w-5 sm:w-8 h-[1px] bg-gradient-to-r from-transparent to-[#D4A359]" />
          <span
            className={`font-serif tracking-[0.22em] uppercase font-medium ${subClass}`}
            style={{ color: lightGold }}
          >
            RESORT & SPA
          </span>
          <span className="w-5 sm:w-8 h-[1px] bg-gradient-to-l from-transparent to-[#D4A359]" />
        </div>
      </div>
    );
  }

  // Variant: Horizontal (Gazelle mark on side, text beside it)
  if (variant === 'horizontal') {
    return (
      <div className={`inline-flex items-center gap-3 group ${className}`}>
        {GazelleMark}
        <div className="flex flex-col text-left">
          <div className="flex items-baseline gap-1.5">
            <span
              className="font-serif tracking-[0.2em] text-[10px] sm:text-[11px] uppercase font-light"
              style={{ color: lightGold }}
            >
              LA
            </span>
            <span
              className={`font-serif font-bold tracking-[0.12em] uppercase ${textClass} leading-tight`}
              style={{ color: textColor }}
            >
              GAZELLE D'OR
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-3 sm:w-5 h-[1px] bg-[#D4A359]/70" />
            <span
              className={`font-serif tracking-[0.2em] uppercase font-semibold ${subClass} leading-none`}
              style={{ color: lightGold }}
            >
              RESORT & SPA
            </span>
            <span className="w-3 sm:w-5 h-[1px] bg-[#D4A359]/70" />
          </div>
        </div>
      </div>
    );
  }

  // Variant: Full (Stacked like in images.png)
  return (
    <div className={`inline-flex flex-col items-center text-center group ${className}`}>
      {GazelleMark}
      <div className="flex flex-col items-center mt-1">
        <span
          className="font-serif tracking-[0.28em] text-[10px] sm:text-xs uppercase font-light"
          style={{ color: lightGold }}
        >
          LA
        </span>
        <span
          className={`font-serif font-bold tracking-[0.16em] uppercase ${textClass} leading-tight`}
          style={{ color: textColor }}
        >
          GAZELLE D'OR
        </span>
        <div className="flex items-center gap-2 mt-1">
          <span className="w-6 sm:w-10 h-[1.5px] bg-gradient-to-r from-transparent to-[#D4A359]" />
          <span
            className={`font-serif tracking-[0.22em] uppercase font-semibold ${subClass} leading-none`}
            style={{ color: lightGold }}
          >
            RESORT & SPA
          </span>
          <span className="w-6 sm:w-10 h-[1.5px] bg-gradient-to-l from-transparent to-[#D4A359]" />
        </div>
      </div>
    </div>
  );
};
