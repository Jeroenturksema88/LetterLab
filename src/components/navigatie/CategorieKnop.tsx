'use client';

import { motion } from 'framer-motion';
import type { Categorie } from '@/types';

interface CategorieKnopProps {
  categorie: Categorie;
  onClick: () => void;
}

// SVG-iconen per categorie — visuele voorbeelden in plaats van tekst
function LettersIcoon({ kleur }: { kleur: string }) {
  return (
    <svg width="120" height="100" viewBox="0 0 120 100" fill="none">
      {/* Letter A */}
      <path
        d="M10 80L25 25L40 80M16 60H34"
        stroke={kleur}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Letter B */}
      <path
        d="M50 25V80M50 25H65C72 25 77 30 77 37.5C77 45 72 50 65 50H50M50 50H67C74 50 80 55 80 62.5C80 70 74 80 67 80H50"
        stroke={kleur}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.75"
      />
      {/* Letter C */}
      <path
        d="M112 32C108 27 102 24 95 24C83 24 74 35 74 52C74 69 83 80 95 80C102 80 108 77 112 72"
        stroke={kleur}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.55"
      />
    </svg>
  );
}

function CijfersIcoon({ kleur }: { kleur: string }) {
  return (
    <svg width="120" height="100" viewBox="0 0 120 100" fill="none">
      {/* Cijfer 1 */}
      <path
        d="M20 30L28 25V80M20 80H36"
        stroke={kleur}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Cijfer 2 */}
      <path
        d="M48 32C48 28 52 23 60 23C68 23 73 28 73 35C73 45 48 60 48 80H73"
        stroke={kleur}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.75"
      />
      {/* Cijfer 3 */}
      <path
        d="M82 30C82 26 86 23 93 23C100 23 105 27 105 33C105 40 99 44 93 44M93 44C100 44 107 48 107 56C107 67 100 80 93 80C86 80 82 76 82 72"
        stroke={kleur}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.55"
      />
    </svg>
  );
}

function VormenIcoon({ kleur }: { kleur: string }) {
  return (
    <svg width="120" height="100" viewBox="0 0 120 100" fill="none">
      {/* Driehoek */}
      <polygon
        points="25,75 5,75 15,35"
        stroke={kleur}
        strokeWidth="4.5"
        strokeLinejoin="round"
        fill={kleur}
        fillOpacity="0.15"
      />
      {/* Cirkel */}
      <circle
        cx="55"
        cy="55"
        r="22"
        stroke={kleur}
        strokeWidth="4.5"
        fill={kleur}
        fillOpacity="0.12"
        opacity="0.8"
      />
      {/* Vierkant */}
      <rect
        x="85"
        y="35"
        width="30"
        height="40"
        rx="3"
        stroke={kleur}
        strokeWidth="4.5"
        fill={kleur}
        fillOpacity="0.1"
        opacity="0.6"
      />
    </svg>
  );
}

// Configuratie per categorie — kleuren en gradient-stops
interface CategorieVisueel {
  kleur: string;
  gradientVan: string;
  gradientNaar: string;
  glans: string;
}

const CATEGORIE_CONFIG: Record<Categorie, CategorieVisueel> = {
  letters: {
    kleur: '#6366F1',
    gradientVan: '#EEF2FF',
    gradientNaar: '#C7D2FE',
    glans: '#A5B4FC',
  },
  cijfers: {
    kleur: '#F59E0B',
    gradientVan: '#FFFBEB',
    gradientNaar: '#FDE68A',
    glans: '#FCD34D',
  },
  vormen: {
    kleur: '#10B981',
    gradientVan: '#ECFDF5',
    gradientNaar: '#A7F3D0',
    glans: '#6EE7B7',
  },
};

// Icoon-component op basis van categorie
function CategorieIcoon({ categorie, kleur }: { categorie: Categorie; kleur: string }) {
  switch (categorie) {
    case 'letters':
      return <LettersIcoon kleur={kleur} />;
    case 'cijfers':
      return <CijfersIcoon kleur={kleur} />;
    case 'vormen':
      return <VormenIcoon kleur={kleur} />;
  }
}

// Vertraging per categorie zodat ze niet synchroon bewegen
const ZWEEF_VERTRAGING: Record<Categorie, number> = {
  letters: 0,
  cijfers: 0.8,
  vormen: 1.6,
};

export default function CategorieKnop({ categorie, onClick }: CategorieKnopProps) {
  const config = CATEGORIE_CONFIG[categorie];

  return (
    <motion.button
      onClick={onClick}
      animate={{ y: [0, -6, 0, 4, 0] }}
      transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: ZWEEF_VERTRAGING[categorie] }}
      // Indruk-animatie bij tappen: snel inkrimpen, dan terugveren
      whileTap={{
        scale: 0.88,
        transition: { type: 'spring', stiffness: 500, damping: 15 },
      }}
      className="relative flex items-center justify-center rounded-[2rem] cursor-pointer outline-none focus:outline-none"
      style={{
        // Grote knoppen, minimaal 240x240
        width: 260,
        height: 260,
        // Zachte radiale gradient als achtergrond
        background: `radial-gradient(circle at 40% 35%, ${config.gradientVan} 0%, ${config.gradientNaar} 100%)`,
        // Zachte schaduw
        boxShadow: `
          0 8px 30px -4px ${config.kleur}25,
          0 4px 12px -2px ${config.kleur}15,
          inset 0 2px 4px 0 rgba(255,255,255,0.7)
        `,
        // Witte binnenrand voor kaart-effect
        border: `3.5px solid rgba(255,255,255,0.75)`,
      }}
    >
      {/* Subtiele glans-ovaal bovenaan de knop */}
      <div
        className="absolute top-3 left-1/2 -translate-x-1/2 rounded-full pointer-events-none"
        style={{
          width: '60%',
          height: 40,
          background: `radial-gradient(ellipse at center, rgba(255,255,255,0.65) 0%, transparent 70%)`,
        }}
      />

      {/* Decoratieve ring op de achtergrond */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 200,
          height: 200,
          border: `2px solid ${config.glans}40`,
        }}
      />

      {/* SVG-icoon */}
      <div className="relative z-10">
        <CategorieIcoon categorie={categorie} kleur={config.kleur} />
      </div>
    </motion.button>
  );
}
