'use client';

// app/profiel/page.tsx — Profielinstelling als 3-stap wizard.
//
// Stap 1: avatar (verplicht). Vier dieren — gender-neutraal, leuker dan een
//          jongen/meisje silhouet, en een 3,5-jarige snapt eerder "kies een
//          dier" dan "kies je geslacht".
// Stap 2: hand (verplicht). Twee handjes voor links/rechts.
// Stap 3: naam (optioneel — fallback "Vriendje") + bevestig.
//
// Eén keuze per scherm met progress-dots bovenaan. Voorkomt overweldiging
// van een 3,5-jarige die voorheen 5 keuzes tegelijk te zien kreeg
// (zie [[Lessons]] § persona-driven panel-simulatie).

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useProfielStore } from '@/stores/profiel-store';
import { useInstellingenStore } from '@/stores/instellingen-store';
import { AvatarSilhouet, AVATAR_KLEUREN, ALLE_AVATARS } from '@/components/avatars/AvatarSilhouet';
import type { Avatar, DominanteHand } from '@/types';

type Stap = 1 | 2 | 3;

export default function ProfielPagina() {
  const router = useRouter();
  const { setNaam, setAvatar, markeerProfielIngesteld, avatar: opgeslagenAvatar, naam } = useProfielStore();
  const huidigeHand = useInstellingenStore((s) => s.dominanteHand);
  const updateInstellingen = useInstellingenStore((s) => s.updateInstellingen);

  const [stap, setStap] = useState<Stap>(1);
  const [gekozenAvatar, setGekozenAvatar] = useState<Avatar | null>(opgeslagenAvatar);
  const [gekozenHand, setGekozenHand] = useState<DominanteHand>(huidigeHand);
  const [invoerNaam, setInvoerNaam] = useState(naam || '');

  const handleVolgende = () => {
    if (stap === 1 && !gekozenAvatar) return;
    if (stap < 3) setStap((stap + 1) as Stap);
  };

  const handleVorige = () => {
    if (stap > 1) setStap((stap - 1) as Stap);
  };

  const handleBevestig = () => {
    if (!gekozenAvatar) return;
    const naamOmTeOpslaan = invoerNaam.trim() || 'Vriendje';
    setAvatar(gekozenAvatar);
    setNaam(naamOmTeOpslaan);
    updateInstellingen({ dominanteHand: gekozenHand });
    markeerProfielIngesteld();
    router.push('/');
  };

  const kanVolgende = stap === 1 ? gekozenAvatar !== null : true;

  return (
    <div className="h-full relative overflow-hidden flex flex-col items-center justify-center p-8">
      {/* Achtergrond */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: 'radial-gradient(ellipse at 50% 40%, #FFF8F0 0%, #FFF0E0 50%, #FFE8D0 100%)',
        }}
      />

      {/* Decoratieve zwevende vormpjes — subtiel om de aandacht niet te trekken */}
      <Decoraties />

      {/* Progress-dots bovenaan */}
      <div className="flex gap-3 mb-10 relative z-10">
        {([1, 2, 3] as Stap[]).map((s) => (
          <motion.div
            key={s}
            className="rounded-full"
            style={{
              width: stap === s ? 28 : 12,
              height: 12,
              background: stap === s ? '#10B981' : s < stap ? '#A7F3D0' : '#E5E7EB',
            }}
            animate={{ width: stap === s ? 28 : 12 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          />
        ))}
      </div>

      {/* Inhoud per stap met cross-fade */}
      <AnimatePresence mode="wait">
        {stap === 1 && (
          <motion.div
            key="stap1"
            className="flex flex-col items-center gap-6 relative z-10"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
          >
            <div className="grid grid-cols-2 gap-4 md:gap-5">
              {ALLE_AVATARS.map((avatarKeuze) => (
                <AvatarKnop
                  key={avatarKeuze}
                  avatar={avatarKeuze}
                  gekozen={gekozenAvatar === avatarKeuze}
                  onClick={() => setGekozenAvatar(avatarKeuze)}
                />
              ))}
            </div>
          </motion.div>
        )}

        {stap === 2 && (
          <motion.div
            key="stap2"
            className="flex flex-col items-center gap-6 relative z-10"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
          >
            <div className="flex gap-5 md:gap-7">
              <HandKnop hand="links" gekozen={gekozenHand === 'links'} onClick={() => setGekozenHand('links')} />
              <HandKnop hand="rechts" gekozen={gekozenHand === 'rechts'} onClick={() => setGekozenHand('rechts')} />
            </div>
          </motion.div>
        )}

        {stap === 3 && (
          <motion.div
            key="stap3"
            className="flex flex-col items-center gap-6 relative z-10 w-full max-w-sm"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
          >
            <input
              type="text"
              value={invoerNaam}
              onChange={(e) => setInvoerNaam(e.target.value)}
              placeholder="Naam..."
              maxLength={20}
              autoComplete="off"
              className="w-full text-center text-2xl md:text-3xl font-bold rounded-2xl py-3 px-6 outline-none"
              style={{
                background: 'rgba(255, 255, 255, 0.8)',
                border: '3px solid rgba(255, 255, 255, 0.9)',
                boxShadow: '0 4px 20px -4px rgba(0,0,0,0.08), inset 0 2px 4px rgba(255,255,255,0.5)',
                color: '#4B3A2A',
                caretColor: '#F59E0B',
              }}
            />
            <p className="text-sm text-gray-500 text-center">Mag ook leeg blijven</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigatie-balk: vorige + volgende/bevestig */}
      <div className="flex items-center gap-6 mt-12 relative z-10">
        {/* Vorige-knop — alleen zichtbaar vanaf stap 2 */}
        <motion.button
          onClick={handleVorige}
          className="flex items-center justify-center rounded-full"
          style={{
            width: 56,
            height: 56,
            background: stap > 1 ? 'rgba(255,255,255,0.85)' : 'transparent',
            border: stap > 1 ? '3px solid rgba(255,255,255,0.7)' : '3px solid transparent',
            boxShadow: stap > 1 ? '0 4px 14px -4px rgba(0,0,0,0.1)' : 'none',
            opacity: stap > 1 ? 1 : 0,
            pointerEvents: stap > 1 ? 'auto' : 'none',
          }}
          whileTap={stap > 1 ? { scale: 0.9 } : undefined}
          aria-label="Vorige"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4A3728" strokeWidth="3" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </motion.button>

        {/* Volgende of bevestig */}
        {stap < 3 ? (
          <motion.button
            onClick={handleVolgende}
            disabled={!kanVolgende}
            className="flex items-center justify-center rounded-full disabled:cursor-not-allowed"
            style={{
              width: 72,
              height: 72,
              background: kanVolgende
                ? 'linear-gradient(135deg, #34D399 0%, #10B981 50%, #059669 100%)'
                : 'linear-gradient(135deg, #D1D5DB 0%, #9CA3AF 100%)',
              border: '4px solid rgba(255,255,255,0.7)',
              boxShadow: kanVolgende
                ? '0 8px 30px -4px rgba(16, 185, 129, 0.4), inset 0 2px 4px rgba(255,255,255,0.4)'
                : '0 4px 12px -4px rgba(0,0,0,0.1)',
            }}
            whileTap={kanVolgende ? { scale: 0.85 } : undefined}
            animate={kanVolgende ? { y: [0, -3, 0] } : {}}
            transition={kanVolgende ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' } : undefined}
            aria-label="Volgende"
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </motion.button>
        ) : (
          <motion.button
            onClick={handleBevestig}
            className="flex items-center justify-center rounded-full"
            style={{
              width: 72,
              height: 72,
              background: 'linear-gradient(135deg, #34D399 0%, #10B981 50%, #059669 100%)',
              border: '4px solid rgba(255,255,255,0.7)',
              boxShadow: '0 8px 30px -4px rgba(16, 185, 129, 0.4), inset 0 2px 4px rgba(255,255,255,0.4)',
            }}
            whileTap={{ scale: 0.85 }}
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            aria-label="Klaar"
          >
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </motion.button>
        )}
      </div>
    </div>
  );
}

// Eén grote knop per avatar — past in 2×2 grid.
function AvatarKnop({
  avatar,
  gekozen,
  onClick,
}: {
  avatar: Avatar;
  gekozen: boolean;
  onClick: () => void;
}) {
  const kleuren = AVATAR_KLEUREN[avatar];
  const inactiefKleur = '#CBD5E1';
  const inactiefDonker = '#94A3B8';
  const inactiefLicht = '#E2E8F0';

  return (
    <motion.button
      onClick={onClick}
      className="relative flex items-center justify-center rounded-[1.5rem] outline-none"
      style={{
        width: 130,
        height: 130,
        background: gekozen
          ? `linear-gradient(135deg, ${kleuren.achtergrond} 0%, ${kleuren.licht}AA 100%)`
          : 'linear-gradient(135deg, #F8FAFC 0%, #FFFFFF 100%)',
        border: gekozen
          ? `4px solid ${kleuren.rand}`
          : '3px solid rgba(255,255,255,0.85)',
        boxShadow: gekozen
          ? `0 8px 24px -4px ${kleuren.hoofd}40, inset 0 2px 4px rgba(255,255,255,0.6)`
          : '0 4px 14px -4px rgba(0,0,0,0.08), inset 0 2px 4px rgba(255,255,255,0.7)',
        transition: 'border 0.2s, box-shadow 0.2s',
      }}
      whileTap={{ scale: 0.92 }}
      aria-label={`Avatar ${avatar}`}
      aria-pressed={gekozen}
    >
      <AvatarSilhouet
        avatar={avatar}
        hoofdkleur={gekozen ? kleuren.hoofd : inactiefKleur}
        accentDonker={gekozen ? kleuren.donker : inactiefDonker}
        accentLicht={gekozen ? kleuren.licht : inactiefLicht}
        grootte={96}
      />
      {gekozen && (
        <motion.div
          className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full flex items-center justify-center"
          style={{ backgroundColor: kleuren.rand }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400 }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </motion.div>
      )}
    </motion.button>
  );
}

// Hand-knop — hergebruikt het ontwerp uit de vorige iteratie (organische
// vingers, gekromde duim) maar nu als losse component voor wizard-stap 2.
function HandKnop({
  hand,
  gekozen,
  onClick,
}: {
  hand: DominanteHand;
  gekozen: boolean;
  onClick: () => void;
}) {
  const accent = hand === 'links' ? '#7C3AED' : '#059669';
  const accentDonker = hand === 'links' ? '#5B21B6' : '#047857';
  const accentLicht = hand === 'links' ? '#DDD6FE' : '#A7F3D0';
  const accentZacht = hand === 'links' ? '#F5F3FF' : '#ECFDF5';
  const inactiefKleur = '#CBD5E1';
  const inactiefDonker = '#94A3B8';

  const handKleur = gekozen ? accent : inactiefKleur;
  const cuffKleur = gekozen ? accentDonker : inactiefDonker;

  return (
    <motion.button
      onClick={onClick}
      className="relative flex items-center justify-center rounded-[1.5rem] outline-none"
      style={{
        width: 140,
        height: 140,
        background: gekozen
          ? `linear-gradient(135deg, ${accentLicht} 0%, ${accentLicht}CC 100%)`
          : `linear-gradient(135deg, ${accentZacht} 0%, #FFFFFF 100%)`,
        border: gekozen ? `4px solid ${accent}` : '3px solid rgba(255,255,255,0.8)',
        boxShadow: gekozen
          ? `0 6px 20px -4px ${accent}40, inset 0 2px 4px rgba(255,255,255,0.6)`
          : '0 4px 14px -4px rgba(0,0,0,0.08), inset 0 2px 4px rgba(255,255,255,0.6)',
        transition: 'border 0.2s, box-shadow 0.2s',
      }}
      whileTap={{ scale: 0.92 }}
      aria-label={hand === 'links' ? 'Linkshandig' : 'Rechtshandig'}
      aria-pressed={gekozen}
    >
      <svg
        width="96"
        height="115"
        viewBox="0 0 120 150"
        fill="none"
        style={{ transform: hand === 'links' ? 'scaleX(-1)' : undefined }}
      >
        <rect x="42" y="128" width="44" height="14" rx="7" fill={cuffKleur} />
        <path d="M 34 88 C 24 84, 10 90, 8 102 C 6 114, 18 120, 26 114 C 34 108, 38 98, 36 88 Z" fill={handKleur} />
        <path d="M 32 78 C 28 84, 28 105, 32 118 C 36 126, 44 130, 52 130 L 76 130 C 84 130, 92 126, 96 118 C 100 105, 100 84, 96 78 Z" fill={handKleur} />
        <path d="M 36 78 C 33 56, 33 30, 38 22 Q 44 14, 50 22 C 53 30, 53 56, 50 78 Z" fill={handKleur} />
        <path d="M 52 78 C 49 50, 49 18, 54 10 Q 60 2, 66 10 C 69 18, 69 50, 66 78 Z" fill={handKleur} />
        <path d="M 68 78 C 65 55, 65 25, 70 17 Q 76 9, 82 17 C 85 25, 85 55, 82 78 Z" fill={handKleur} />
        <path d="M 84 78 C 81 62, 81 40, 86 32 Q 92 24, 98 32 C 101 40, 101 62, 98 78 Z" fill={handKleur} />
        <path d="M 42 100 Q 64 106, 86 100" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.35" fill="none" />
        <ellipse cx="60" cy="103" rx="16" ry="11" fill="white" opacity="0.18" />
      </svg>
      {gekozen && (
        <motion.div
          className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full flex items-center justify-center"
          style={{ backgroundColor: accent }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400 }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </motion.div>
      )}
    </motion.button>
  );
}

// Decoratieve zwevende vormpjes op de achtergrond — losgetrokken voor leesbaarheid.
function Decoraties() {
  return (
    <>
      <motion.div
        className="absolute top-[10%] left-[8%] pointer-events-none"
        animate={{ y: [0, -12, 0], rotate: [0, 10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <svg width="40" height="40" viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="18" fill="#C7D2FE" opacity="0.5" />
        </svg>
      </motion.div>
      <motion.div
        className="absolute top-[15%] right-[10%] pointer-events-none"
        animate={{ y: [0, 10, 0], rotate: [0, -15, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      >
        <svg width="32" height="32" viewBox="0 0 32 32">
          <polygon points="16,2 30,30 2,30" fill="#FDE68A" opacity="0.5" />
        </svg>
      </motion.div>
      <motion.div
        className="absolute bottom-[12%] left-[15%] pointer-events-none"
        animate={{ y: [0, -8, 0], x: [0, 6, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      >
        <svg width="36" height="36" viewBox="0 0 36 36">
          <rect x="4" y="4" width="28" height="28" rx="6" fill="#A7F3D0" opacity="0.4" />
        </svg>
      </motion.div>
      <motion.div
        className="absolute bottom-[18%] right-[12%] pointer-events-none"
        animate={{ y: [0, 14, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
      >
        <svg width="28" height="28" viewBox="0 0 28 28">
          <circle cx="14" cy="14" r="12" fill="#FBCFE8" opacity="0.5" />
        </svg>
      </motion.div>
    </>
  );
}
