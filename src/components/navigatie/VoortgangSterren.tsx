'use client';

interface VoortgangSterrenProps {
  aantal: number; // 0-3
  grootte?: 'sm' | 'md' | 'lg';
}

const GROOTTE_MAP = {
  sm: { w: 14, h: 14 },
  md: { w: 20, h: 20 },
  lg: { w: 28, h: 28 },
};

const KLEUREN = ['#CD7F32', '#C0C0C0', '#FFD700']; // brons, zilver, goud

function SterSvg({ gevuld, kleur, grootte }: { gevuld: boolean; kleur: string; grootte: { w: number; h: number } }) {
  return (
    <svg width={grootte.w} height={grootte.h} viewBox="0 0 24 24">
      <path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        fill={gevuld ? kleur : 'none'}
        stroke={gevuld ? kleur : '#D1D5DB'}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function VoortgangSterren({ aantal, grootte = 'md' }: VoortgangSterrenProps) {
  const maten = GROOTTE_MAP[grootte];

  return (
    <div className="flex gap-0.5 items-center">
      {[0, 1, 2].map((i) => (
        <SterSvg
          key={i}
          gevuld={i < aantal}
          kleur={KLEUREN[i]}
          grootte={maten}
        />
      ))}
    </div>
  );
}
