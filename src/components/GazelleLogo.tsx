import React from 'react';

interface GazelleLogoProps {
  className?: string;
  variant?: 'full' | 'horizontal' | 'mark' | 'text-only';
  theme?: 'gold' | 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

/** Official supplied La Gazelle d'Or logo asset. */
export const GazelleLogo: React.FC<GazelleLogoProps> = ({
  className = '',
  variant = 'full',
  size = 'md',
}) => {
  const sizeMap = {
    sm: 'w-28 sm:w-32',
    md: 'w-36 sm:w-44',
    lg: 'w-48 sm:w-56',
    xl: 'w-64 sm:w-72',
  };

  const variantClass =
    variant === 'mark' ? 'w-16 h-16 object-cover object-center' :
    variant === 'text-only' ? 'w-44 sm:w-52' :
    `${sizeMap[size]} h-auto`;

  return (
    <span
      className={`inline-flex items-center justify-center rounded-xl bg-white p-1.5 shadow-sm ${className}`}
      aria-label="La Gazelle d'Or Resort & Spa"
    >
      <img
        src="/logo.jpeg"
        alt="La Gazelle d'Or Resort & Spa"
        className={`${variantClass} object-contain`}
        loading="eager"
        decoding="async"
      />
    </span>
  );
};
