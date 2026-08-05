import React from 'react';

export const Logo = ({ className = "w-24 h-32", iconOnly = false }) => {
  if (iconOnly) {
    return (
      <svg viewBox="0 0 300 300" className={className} xmlns="http://www.w3.org/2000/svg">
        <g stroke="#C6A45C" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <path d="M150 110 C150 70, 190 70, 190 70 C190 110, 150 110, 150 110 Z" fill="#C6A45C" />
          <path d="M115 150 C115 110, 150 110, 150 110 C150 150, 185 140, 185 150" />
          <rect x="95" y="150" width="110" height="24" rx="12" />
          <rect x="75" y="185" width="150" height="24" rx="12" />
          <path d="M90 209 L110 280 L190 280 L210 209" />
        </g>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 300 400" className={className} xmlns="http://www.w3.org/2000/svg">
      <g stroke="#C6A45C" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M150 110 C150 70, 190 70, 190 70 C190 110, 150 110, 150 110 Z" fill="#C6A45C" />
        <path d="M115 150 C115 110, 150 110, 150 110 C150 150, 185 140, 185 150" />
        <rect x="95" y="150" width="110" height="22" rx="11" />
        <rect x="75" y="185" width="150" height="22" rx="11" />
        <path d="M90 207 L110 270 L190 270 L210 207" />
      </g>
      
      <text x="150" y="340" fontFamily="Arial, Helvetica, sans-serif" fontSize="72" fontWeight="900" fill="currentColor" className="text-[#0F4C3A] dark:text-emerald-400" textAnchor="middle" letterSpacing="12">SORA</text>
      
      <text x="150" y="380" fontFamily="Arial, Helvetica, sans-serif" fontSize="22" fontWeight="700" fill="#C6A45C" textAnchor="middle" letterSpacing="5">CAKE &amp; BAKERY</text>
    </svg>
  );
};
