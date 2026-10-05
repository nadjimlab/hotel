import React from 'react';

interface ResortBackgroundProps {
  className?: string;
  showOverlay?: boolean;
  intensity?: 'subtle' | 'medium' | 'vibrant';
  position?: 'absolute' | 'fixed';
  customImageUrl?: string;
}

/**
 * Production resort hero background.
 * The visual is intentionally driven by the supplied /background.jpeg asset
 * instead of the previous illustrated SVG scene.
 */
export const ResortBackground: React.FC<ResortBackgroundProps> = ({
  className = '',
  showOverlay = true,
  intensity = 'vibrant',
  position = 'absolute',
  customImageUrl = '/background.jpeg',
}) => {
  const posClass = position === 'fixed' ? 'fixed inset-0' : 'absolute inset-0';
  const overlayOpacity =
    intensity === 'subtle' ? 'opacity-15' : intensity === 'medium' ? 'opacity-25' : 'opacity-35';

  return (
    <div
      className={`${posClass} pointer-events-none overflow-hidden z-0 select-none ${className}`}
      aria-hidden="true"
    >
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-[1.01]"
        style={{ backgroundImage: `url(${customImageUrl})` }}
      />

      {showOverlay && (
        <>
          <div className={`absolute inset-0 bg-[#140D08] ${overlayOpacity}`} />
          <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-black/55" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-black/10" />
        </>
      )}
    </div>
  );
};
