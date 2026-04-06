'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import CategorieKnop from '@/components/navigatie/CategorieKnop';
import { useProfielStore } from '@/stores/profiel-store';
import type { Categorie } from '@/types';

// Letters van de titel met individuele kleuren en kleine rotaties
const TITEL_LETTERS = [
  { letter: 'L', kleur: '#6366F1', rotatie: -4 },
  { letter: 'e', kleur: '#8B5CF6', rotatie: 2 },
  { letter: 't', kleur: '#F59E0B', rotatie: -2 },
  { letter: 't', kleur: '#F97316', rotatie: 3 },
  { letter: 'e', kleur: '#10B981', rotatie: -3 },
  { letter: 'r', kleur: '#14B8A6', rotatie: 2 },
  { letter: 'L', kleur: '#EC4899', rotatie: -3 },
  { letter: 'a', kleur: '#6366F1', rotatie: 3 },
  { letter: 'b', kleur: '#F59E0B', rotatie: -2 },
];

// Configuratie voor zwevende achtergrond-decoraties
interface ZweefVorm {
  // Positie in viewport-percentage
  x: string;
  y: string;
  // Grootte
  grootte: number;
  // Kleur
  kleur: string;
  // Bewegingsrichting
  driftX: number;
  driftY: number;
  // Animatieduur
  duur: number;
  // Type vorm
  type: 'cirkel' | 'driehoek' | 'ster' | 'vierkant';
  // Starttransparantie
  opacity: number;
}

const ACHTERGROND_VORMEN: ZweefVorm[] = [
  { x: '8%', y: '15%', grootte: 28, kleur: '#C7D2FE', driftX: 20, driftY: -15, duur: 12, type: 'cirkel', opacity: 0.45 },
  { x: '85%', y: '10%', grootte: 22, kleur: '#FDE68A', driftX: -15, driftY: 20, duur: 14, type: 'ster', opacity: 0.4 },
  { x: '75%', y: '75%', grootte: 32, kleur: '#A7F3D0', driftX: 15, driftY: -25, duur: 16, type: 'driehoek', opacity: 0.35 },
  { x: '15%', y: '80%', grootte: 20, kleur: '#FCA5A5', driftX: 25, driftY: 15, duur: 13, type: 'vierkant', opacity: 0.3 },
  { x: '50%', y: '8%', grootte: 18, kleur: '#DDD6FE', driftX: -10, driftY: 18, duur: 15, type: 'ster', opacity: 0.35 },
  { x: '92%', y: '45%', grootte: 24, kleur: '#FBCFE8', driftX: -20, driftY: -10, duur: 11, type: 'cirkel', opacity: 0.3 },
  { x: '5%', y: '50%', grootte: 16, kleur: '#BAE6FD', driftX: 15, driftY: -20, duur: 17, type: 'driehoek', opacity: 0.25 },
  { x: '40%', y: '85%', grootte: 14, kleur: '#FDE68A', driftX: -12, driftY: -18, duur: 14, type: 'cirkel', opacity: 0.3 },
  { x: '65%', y: '20%', grootte: 20, kleur: '#BBF7D0', driftX: 10, driftY: 25, duur: 18, type: 'vierkant', opacity: 0.25 },
];

// Individuele zwevende vorm-component
function ZweefDecoratie({ vorm }: { vorm: ZweefVorm }) {
  const svgInhoud = () => {
    switch (vorm.type) {
      case 'cirkel':
        return (
          <circle
            cx={vorm.grootte / 2}
            cy={vorm.grootte / 2}
            r={vorm.grootte / 2 - 1}
            fill={vorm.kleur}
          />
        );
      case 'driehoek': {
        const h = vorm.grootte;
        return (
          <polygon
            points={`${h / 2},2 ${h - 2},${h - 2} 2,${h - 2}`}
            fill={vorm.kleur}
          />
        );
      }
      case 'vierkant':
        return (
          <rect
            x="2"
            y="2"
            width={vorm.grootte - 4}
            height={vorm.grootte - 4}
            rx="3"
            fill={vorm.kleur}
          />
        );
      case 'ster': {
        // Eenvoudige 4-puntige ster
        const c = vorm.grootte / 2;
        const r1 = vorm.grootte / 2 - 1;
        const r2 = r1 * 0.4;
        const punten = [];
        for (let i = 0; i < 8; i++) {
          const hoek = (Math.PI / 4) * i - Math.PI / 2;
          const r = i % 2 === 0 ? r1 : r2;
          punten.push(`${c + r * Math.cos(hoek)},${c + r * Math.sin(hoek)}`);
        }
        return <polygon points={punten.join(' ')} fill={vorm.kleur} />;
      }
    }
  };

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: vorm.x,
        top: vorm.y,
      }}
      animate={{
        x: [0, vorm.driftX, -vorm.driftX * 0.5, vorm.driftX * 0.3, 0],
        y: [0, vorm.driftY, -vorm.driftY * 0.6, vorm.driftY * 0.4, 0],
        opacity: [vorm.opacity, vorm.opacity * 1.3, vorm.opacity * 0.7, vorm.opacity * 1.1, vorm.opacity],
        rotate: [0, 15, -10, 5, 0],
      }}
      transition={{
        duration: vorm.duur,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <svg
        width={vorm.grootte}
        height={vorm.grootte}
        viewBox={`0 0 ${vorm.grootte} ${vorm.grootte}`}
      >
        {svgInhoud()}
      </svg>
    </motion.div>
  );
}

export default function Startscherm() {
  const router = useRouter();
  const { profielIngesteld, naam } = useProfielStore();

  const handleCategorieKlik = (categorie: Categorie) => {
    router.push(`/${categorie}`);
  };

  // Als het profiel nog niet is ingesteld, toon een vriendelijke startknop
  if (!profielIngesteld) {
    return (
      <div className="h-full relative overflow-hidden flex flex-col items-center justify-center gap-12 p-8">
        {/* Achtergrond — zachte warme gradient */}
        <div
          className="absolute inset-0 -z-10"
          style={{
            background: 'radial-gradient(ellipse at 50% 40%, #FFF8F0 0%, #FFF0E0 50%, #FFE8D0 100%)',
          }}
        />

        {/* Zwevende decoratieve vormen op de achtergrond */}
        {ACHTERGROND_VORMEN.map((vorm, i) => (
          <ZweefDecoratie key={i} vorm={vorm} />
        ))}

        {/* Titel */}
        <motion.div
          className="text-center relative z-10"
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, type: 'spring', stiffness: 120 }}
        >
          <h1 className="text-6xl md:text-7xl font-extrabold font-kind select-none flex items-baseline justify-center">
            {TITEL_LETTERS.map((item, i) => (
              <motion.span
                key={i}
                style={{
                  color: item.kleur,
                  display: 'inline-block',
                }}
                initial={{ rotate: 0, y: 10, opacity: 0 }}
                animate={{
                  rotate: item.rotatie,
                  y: 0,
                  opacity: 1,
                }}
                transition={{
                  delay: 0.1 + i * 0.06,
                  type: 'spring',
                  stiffness: 200,
                  damping: 12,
                }}
              >
                {item.letter}
              </motion.span>
            ))}
          </h1>
        </motion.div>

        {/* Grote start-knop die naar profielinstelling navigeert */}
        <motion.button
          onClick={() => router.push('/profiel')}
          className="relative z-10 flex items-center justify-center rounded-full cursor-pointer outline-none focus:outline-none"
          style={{
            width: 140,
            height: 140,
            background: 'linear-gradient(135deg, #34D399 0%, #10B981 50%, #059669 100%)',
            border: '5px solid rgba(255,255,255,0.7)',
            boxShadow: '0 12px 40px -6px rgba(16, 185, 129, 0.45), inset 0 3px 6px rgba(255,255,255,0.4)',
          }}
          whileTap={{ scale: 0.88 }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.6, type: 'spring', stiffness: 180, damping: 14 }}
        >
          {/* Grote speelknop (driehoek / play) */}
          <svg width="52" height="52" viewBox="0 0 24 24" fill="white" stroke="none">
            <path d="M8 5v14l11-7z" />
          </svg>
        </motion.button>
      </div>
    );
  }

  return (
    <div className="h-full relative overflow-hidden flex flex-col items-center justify-center gap-12 p-8">
      {/* Achtergrond — zachte warme gradient */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: 'radial-gradient(ellipse at 50% 40%, #FFF8F0 0%, #FFF0E0 50%, #FFE8D0 100%)',
        }}
      />

      {/* Zwevende decoratieve vormen op de achtergrond */}
      {ACHTERGROND_VORMEN.map((vorm, i) => (
        <ZweefDecoratie key={i} vorm={vorm} />
      ))}

      {/* Naam van het kind — decoratief in de linkerbovenhoek */}
      {naam && (
        <motion.div
          className="absolute top-5 left-6 z-20 text-lg font-semibold select-none"
          style={{
            color: '#C4A46B',
            textShadow: '0 1px 2px rgba(0,0,0,0.05)',
          }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          {naam}
        </motion.div>
      )}

      {/* Titel — speelse gekleurde letters met individuele rotatie */}
      <motion.div
        className="text-center relative z-10"
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, type: 'spring', stiffness: 120 }}
      >
        <h1 className="text-6xl md:text-7xl font-extrabold font-kind select-none flex items-baseline justify-center">
          {TITEL_LETTERS.map((item, i) => (
            <motion.span
              key={i}
              style={{
                color: item.kleur,
                display: 'inline-block',
              }}
              initial={{ rotate: 0, y: 10, opacity: 0 }}
              animate={{
                rotate: item.rotatie,
                y: 0,
                opacity: 1,
              }}
              transition={{
                delay: 0.1 + i * 0.06,
                type: 'spring',
                stiffness: 200,
                damping: 12,
              }}
            >
              {item.letter}
            </motion.span>
          ))}
        </h1>
      </motion.div>

      {/* Drie categorie-knoppen — horizontaal met ruime tussenruimte */}
      <motion.div
        className="flex gap-10 md:gap-14 flex-wrap justify-center items-center relative z-10"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.3, type: 'spring', stiffness: 100 }}
      >
        {(['letters', 'cijfers', 'vormen'] as Categorie[]).map((cat, i) => (
          <motion.div
            key={cat}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              delay: 0.5 + i * 0.15,
              type: 'spring',
              stiffness: 180,
              damping: 14,
            }}
          >
            <CategorieKnop
              categorie={cat}
              onClick={() => handleCategorieKlik(cat)}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Ouder-knop — subtiel rechtsonder */}
      <motion.button
        onClick={() => router.push('/ouder')}
        className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-white/50 backdrop-blur-sm flex items-center justify-center text-gray-300 shadow-sm z-20"
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="8" r="4" />
          <path d="M20 21a8 8 0 0 0-16 0" />
        </svg>
      </motion.button>
    </div>
  );
}
