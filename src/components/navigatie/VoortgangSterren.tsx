'use client';

interface VoortgangSterrenProps {
  aantal: number; // 0-3
  grootte?: 'sm' | 'md' | 'lg';
}

const GROOTTE_MAP = {
  sm: 'text-xs',
  md: 'text-base',
  lg: 'text-xl',
};

const KLEUREN = ['#CD7F32', '#C0C0C0', '#FFD700']; // brons, zilver, goud

export default function VoortgangSterren({ aantal, grootte = 'md' }: VoortgangSterrenProps) {
  return (
    <div className={`flex gap-0.5 ${GROOTTE_MAP[grootte]}`}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{ color: i < aantal ? KLEUREN[i] : '#E2E8F0' }}
        >
          ★
        </span>
      ))}
    </div>
  );
}
