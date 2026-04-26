'use client';

// components/avatars/AvatarSilhouet.tsx — vier vriendelijke dier-avatars als
// vervanging voor de geslacht-keuze. Cute, stylized, kindvriendelijk.
// Eén component met variant-switch zodat we niet 4× dezelfde wrapper hoeven.

import type { Avatar } from '@/types';

interface AvatarSilhouetProps {
  avatar: Avatar;
  // Hoofdkleur. Bij ongeselecteerd geven we een neutrale grijs-tint mee.
  hoofdkleur: string;
  // Donkerdere accent-kleur voor neus, mond, contouren.
  accentDonker: string;
  // Lichtere accent-kleur voor binnen-oren, snuit, gezicht-achtergrond.
  accentLicht: string;
  grootte?: number;
}

export function AvatarSilhouet({
  avatar,
  hoofdkleur,
  accentDonker,
  accentLicht,
  grootte = 110,
}: AvatarSilhouetProps) {
  switch (avatar) {
    case 'kat':
      return <KatSvg grootte={grootte} hoofd={hoofdkleur} donker={accentDonker} licht={accentLicht} />;
    case 'hond':
      return <HondSvg grootte={grootte} hoofd={hoofdkleur} donker={accentDonker} licht={accentLicht} />;
    case 'aap':
      return <AapSvg grootte={grootte} hoofd={hoofdkleur} donker={accentDonker} licht={accentLicht} />;
    case 'vlinder':
      return <VlinderSvg grootte={grootte} hoofd={hoofdkleur} donker={accentDonker} licht={accentLicht} />;
  }
}

interface SvgProps {
  grootte: number;
  hoofd: string;
  donker: string;
  licht: string;
}

function KatSvg({ grootte, hoofd, donker, licht }: SvgProps) {
  return (
    <svg width={grootte} height={grootte} viewBox="0 0 100 100" fill="none" aria-hidden="true">
      {/* Oren — driehoeken die boven het hoofd uitsteken */}
      <polygon points="22,30 30,10 40,38" fill={hoofd} />
      <polygon points="78,30 70,10 60,38" fill={hoofd} />
      {/* Binnenste oren — lichter */}
      <polygon points="26,30 30,18 36,36" fill={licht} />
      <polygon points="74,30 70,18 64,36" fill={licht} />
      {/* Hoofd — grote ronde cirkel */}
      <circle cx="50" cy="58" r="34" fill={hoofd} />
      {/* Ogen */}
      <ellipse cx="38" cy="55" rx="3.2" ry="4.5" fill={donker} />
      <ellipse cx="62" cy="55" rx="3.2" ry="4.5" fill={donker} />
      <circle cx="39" cy="53" r="1.2" fill="white" />
      <circle cx="63" cy="53" r="1.2" fill="white" />
      {/* Neus — kleine driehoek */}
      <path d="M 47 64 L 53 64 L 50 68 Z" fill={donker} />
      {/* Mond — twee zachte krullen */}
      <path d="M 50 68 Q 46 73 41 71" stroke={donker} strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <path d="M 50 68 Q 54 73 59 71" stroke={donker} strokeWidth="1.6" strokeLinecap="round" fill="none" />
      {/* Snorharen */}
      <line x1="33" y1="63" x2="22" y2="61" stroke={donker} strokeWidth="1.2" strokeLinecap="round" />
      <line x1="33" y1="67" x2="22" y2="68" stroke={donker} strokeWidth="1.2" strokeLinecap="round" />
      <line x1="67" y1="63" x2="78" y2="61" stroke={donker} strokeWidth="1.2" strokeLinecap="round" />
      <line x1="67" y1="67" x2="78" y2="68" stroke={donker} strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function HondSvg({ grootte, hoofd, donker, licht }: SvgProps) {
  return (
    <svg width={grootte} height={grootte} viewBox="0 0 100 100" fill="none" aria-hidden="true">
      {/* Floppy oren — achter het hoofd, hangen langs zijkant */}
      <ellipse cx="22" cy="50" rx="13" ry="22" fill={donker} />
      <ellipse cx="78" cy="50" rx="13" ry="22" fill={donker} />
      <ellipse cx="22" cy="50" rx="8" ry="16" fill={hoofd} opacity="0.55" />
      <ellipse cx="78" cy="50" rx="8" ry="16" fill={hoofd} opacity="0.55" />
      {/* Hoofd */}
      <circle cx="50" cy="55" r="32" fill={hoofd} />
      {/* Ogen */}
      <ellipse cx="40" cy="50" rx="3.2" ry="4" fill={donker} />
      <ellipse cx="60" cy="50" rx="3.2" ry="4" fill={donker} />
      <circle cx="41" cy="48" r="1.1" fill="white" />
      <circle cx="61" cy="48" r="1.1" fill="white" />
      {/* Snuit — lichter ovaal */}
      <ellipse cx="50" cy="68" rx="13" ry="9" fill={licht} />
      {/* Neus */}
      <ellipse cx="50" cy="64" rx="4.5" ry="3.5" fill={donker} />
      {/* Mond — middenlijn + twee curven */}
      <path d="M 50 67 L 50 73" stroke={donker} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M 50 73 Q 45 78 41 76" stroke={donker} strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <path d="M 50 73 Q 55 78 59 76" stroke={donker} strokeWidth="1.6" strokeLinecap="round" fill="none" />
      {/* Tongetje */}
      <path d="M 47 76 Q 50 82 53 76 Z" fill="#F472B6" />
    </svg>
  );
}

function AapSvg({ grootte, hoofd, donker, licht }: SvgProps) {
  return (
    <svg width={grootte} height={grootte} viewBox="0 0 100 100" fill="none" aria-hidden="true">
      {/* Oren — grote ronde cirkels aan zijkant */}
      <circle cx="14" cy="50" r="11" fill={hoofd} />
      <circle cx="86" cy="50" r="11" fill={hoofd} />
      <circle cx="14" cy="50" r="6" fill={licht} />
      <circle cx="86" cy="50" r="6" fill={licht} />
      {/* Hoofd — buitencirkel */}
      <circle cx="50" cy="55" r="34" fill={hoofd} />
      {/* Gezichts-binnenkant — lichter ovaal */}
      <ellipse cx="50" cy="62" rx="22" ry="20" fill={licht} />
      {/* Voorhoofd-haar suggestie — donker boogje boven gezicht */}
      <path d="M 30 48 Q 50 38 70 48" stroke={donker} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.4" />
      {/* Ogen */}
      <circle cx="42" cy="56" r="3.5" fill={donker} />
      <circle cx="58" cy="56" r="3.5" fill={donker} />
      <circle cx="43" cy="54.5" r="1.2" fill="white" />
      <circle cx="59" cy="54.5" r="1.2" fill="white" />
      {/* Neusgaten — twee kleine puntjes */}
      <circle cx="46" cy="65" r="1.3" fill={donker} />
      <circle cx="54" cy="65" r="1.3" fill={donker} />
      {/* Mond — brede glimlach */}
      <path d="M 40 72 Q 50 80 60 72" stroke={donker} strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function VlinderSvg({ grootte, hoofd, donker, licht }: SvgProps) {
  return (
    <svg width={grootte} height={grootte} viewBox="0 0 100 100" fill="none" aria-hidden="true">
      {/* Bovenste vleugels — groot, schuin omhoog */}
      <ellipse cx="28" cy="36" rx="22" ry="26" fill={hoofd} transform="rotate(-18 28 36)" />
      <ellipse cx="72" cy="36" rx="22" ry="26" fill={hoofd} transform="rotate(18 72 36)" />
      {/* Onderste vleugels — kleiner, naar buiten/onderen */}
      <ellipse cx="32" cy="68" rx="16" ry="18" fill={licht} transform="rotate(-28 32 68)" />
      <ellipse cx="68" cy="68" rx="16" ry="18" fill={licht} transform="rotate(28 68 68)" />
      {/* Stippen op vleugels — visueel detail */}
      <circle cx="22" cy="32" r="4.5" fill={donker} opacity="0.7" />
      <circle cx="78" cy="32" r="4.5" fill={donker} opacity="0.7" />
      <circle cx="32" cy="50" r="2.8" fill={donker} opacity="0.7" />
      <circle cx="68" cy="50" r="2.8" fill={donker} opacity="0.7" />
      <circle cx="34" cy="68" r="2.5" fill="white" opacity="0.55" />
      <circle cx="66" cy="68" r="2.5" fill="white" opacity="0.55" />
      {/* Lichaam — lange dunne ovaal in midden */}
      <ellipse cx="50" cy="56" rx="4" ry="24" fill={donker} />
      {/* Hoofdje */}
      <circle cx="50" cy="32" r="6.5" fill={donker} />
      {/* Antennes */}
      <path d="M 47 28 Q 40 18 38 14" stroke={donker} strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M 53 28 Q 60 18 62 14" stroke={donker} strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="38" cy="14" r="2.2" fill={donker} />
      <circle cx="62" cy="14" r="2.2" fill={donker} />
      {/* Oogjes */}
      <circle cx="47.5" cy="31" r="1.2" fill="white" />
      <circle cx="52.5" cy="31" r="1.2" fill="white" />
    </svg>
  );
}

// Kleurpaletten per avatar — gebruikt door zowel profiel-wizard als ouder-dashboard.
export const AVATAR_KLEUREN: Record<Avatar, { hoofd: string; donker: string; licht: string; achtergrond: string; rand: string }> = {
  kat: {
    hoofd: '#FB923C',
    donker: '#9A3412',
    licht: '#FED7AA',
    achtergrond: '#FFEDD5',
    rand: '#EA580C',
  },
  hond: {
    hoofd: '#A16207',
    donker: '#451A03',
    licht: '#FDE68A',
    achtergrond: '#FEF3C7',
    rand: '#92400E',
  },
  aap: {
    hoofd: '#92400E',
    donker: '#451A03',
    licht: '#FED7AA',
    achtergrond: '#FFE4D6',
    rand: '#7C2D12',
  },
  vlinder: {
    hoofd: '#EC4899',
    donker: '#831843',
    licht: '#FBCFE8',
    achtergrond: '#FCE7F3',
    rand: '#BE185D',
  },
};

export const ALLE_AVATARS: Avatar[] = ['kat', 'hond', 'aap', 'vlinder'];
