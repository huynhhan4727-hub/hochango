import React from 'react';

interface HangoLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const HangoLogo: React.FC<HangoLogoProps> = ({ size = 'md', showText = true }) => {
  const sizeMap = {
    sm: { icon: 'w-8 h-8', text: 'text-lg', sub: 'text-[10px]' },
    md: { icon: 'w-10 h-10', text: 'text-xl', sub: 'text-xs' },
    lg: { icon: 'w-14 h-14', text: 'text-2xl', sub: 'text-sm' },
  };

  const current = sizeMap[size];

  return (
    <div id="hango-app-logo" className="flex items-center gap-3 select-none">
      {/* Taegeuk + Korean Learning Emblem */}
      <div className={`relative ${current.icon} flex-shrink-0 flex items-center justify-center rounded-2xl bg-white shadow-md border border-slate-100 overflow-hidden`}>
        <svg viewBox="0 0 100 100" className="w-full h-full p-1" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Subtle background glow */}
          <circle cx="50" cy="50" r="44" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="2" />
          
          {/* Taegeuk Yin-Yang Style Wave (Red Top, Blue Bottom) */}
          <path
            d="M 50 14 A 36 36 0 0 1 86 50 C 86 60 78 68 68 68 C 58 68 50 60 50 50 C 50 40 42 32 32 32 C 22 32 14 40 14 50 A 36 36 0 0 1 50 14 Z"
            fill="#DC2626"
          />
          <path
            d="M 50 86 A 36 36 0 0 1 14 50 C 14 40 22 32 32 32 C 42 32 50 40 50 50 C 50 60 58 68 68 68 C 78 68 86 60 86 50 A 36 36 0 0 1 50 86 Z"
            fill="#1D4ED8"
          />
          
          {/* Central Hangul Character "한" in clean white glyph */}
          <text
            x="50"
            y="57"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="30"
            fontWeight="bold"
            fontFamily="'Noto Sans KR', sans-serif"
            className="drop-shadow-sm pointer-events-none"
          >
            한
          </text>

          {/* Small Cherry Blossom (Hoa đào nhỏ) on top */}
          <g id="cherry-blossom-top" transform="translate(68, 17) scale(0.95)" className="drop-shadow-xs">
            {/* White halo so petals stand out crisp over any background */}
            <circle cx="0" cy="0" r="11" fill="#FFFFFF" fillOpacity="0.9" />

            {/* 5 Petals of Cherry Blossom (Hoa đào) */}
            {/* Petal 1 (0 deg - top) */}
            <path
              d="M 0 0 C -4.2 -4.8, -4.6 -9.8, -1.8 -11 C 0 -10.2, 1.8 -11, 4.6 -9.8 C 4.2 -4.8, 0 0, 0 0 Z"
              fill="#FDA4AF"
              stroke="#F43F5E"
              strokeWidth="0.8"
            />
            {/* Petal 2 (72 deg) */}
            <path
              d="M 0 0 C -4.2 -4.8, -4.6 -9.8, -1.8 -11 C 0 -10.2, 1.8 -11, 4.6 -9.8 C 4.2 -4.8, 0 0, 0 0 Z"
              transform="rotate(72)"
              fill="#FDA4AF"
              stroke="#F43F5E"
              strokeWidth="0.8"
            />
            {/* Petal 3 (144 deg) */}
            <path
              d="M 0 0 C -4.2 -4.8, -4.6 -9.8, -1.8 -11 C 0 -10.2, 1.8 -11, 4.6 -9.8 C 4.2 -4.8, 0 0, 0 0 Z"
              transform="rotate(144)"
              fill="#FDA4AF"
              stroke="#F43F5E"
              strokeWidth="0.8"
            />
            {/* Petal 4 (216 deg) */}
            <path
              d="M 0 0 C -4.2 -4.8, -4.6 -9.8, -1.8 -11 C 0 -10.2, 1.8 -11, 4.6 -9.8 C 4.2 -4.8, 0 0, 0 0 Z"
              transform="rotate(216)"
              fill="#FDA4AF"
              stroke="#F43F5E"
              strokeWidth="0.8"
            />
            {/* Petal 5 (288 deg) */}
            <path
              d="M 0 0 C -4.2 -4.8, -4.6 -9.8, -1.8 -11 C 0 -10.2, 1.8 -11, 4.6 -9.8 C 4.2 -4.8, 0 0, 0 0 Z"
              transform="rotate(288)"
              fill="#FDA4AF"
              stroke="#F43F5E"
              strokeWidth="0.8"
            />

            {/* Inner Flower Center & Stamen */}
            <circle cx="0" cy="0" r="3.2" fill="#F43F5E" />
            <circle cx="0" cy="0" r="1.6" fill="#FBBF24" />
          </g>

          {/* Tiny gentle petal drifting */}
          <path
            d="M 83 26 C 81 24, 80 27, 83 29 C 85 28, 85 26, 83 26 Z"
            fill="#FDA4AF"
            opacity="0.8"
          />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className={`font-extrabold tracking-tight ${current.text} text-slate-900 font-sans`}>
              Hango
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 tracking-wider">
              한국어
            </span>
          </div>
          <span className={`${current.sub} text-slate-500 font-medium tracking-tight -mt-0.5 truncate max-w-[140px] xs:max-w-none`}>
            <span className="inline sm:hidden">Học và Tiến lên</span>
            <span className="hidden sm:inline">Học và Tiến lên • Learn & Excel</span>
          </span>
        </div>
      )}
    </div>
  );
};
