'use client';

// app/profiel/page.tsx — Profielinstelling-scherm (ouder helpt kind)

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useProfielStore } from '@/stores/profiel-store';

export default function ProfielPagina() {
  const router = useRouter();
  const { setNaam, setGeslacht, markeerProfielIngesteld, geslacht, naam } = useProfielStore();
  const [gekozenGeslacht, setGekozenGeslacht] = useState<'jongen' | 'meisje' | null>(geslacht);
  const [invoerNaam, setInvoerNaam] = useState(naam || '');

  const handleBevestig = () => {
    if (!invoerNaam.trim() || !gekozenGeslacht) return;

    setNaam(invoerNaam.trim());
    setGeslacht(gekozenGeslacht);
    markeerProfielIngesteld();
    router.push('/');
  };

  const handleGeslachtKeuze = (keuze: 'jongen' | 'meisje') => {
    setGekozenGeslacht(keuze);
  };

  const isGereed = invoerNaam.trim().length > 0 && gekozenGeslacht !== null;

  return (
    <div className="h-full relative overflow-hidden flex flex-col items-center justify-center gap-10 p-8">
      {/* Achtergrond — zachte warme gradient */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: 'radial-gradient(ellipse at 50% 40%, #FFF8F0 0%, #FFF0E0 50%, #FFE8D0 100%)',
        }}
      />

      {/* Decoratieve zwevende vormpjes */}
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

      {/* Geslacht-keuze — twee grote silhouet-knoppen */}
      <motion.div
        className="flex gap-8 md:gap-12 relative z-10"
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 120 }}
      >
        {/* Jongen-knop */}
        <motion.button
          onClick={() => handleGeslachtKeuze('jongen')}
          className="relative flex items-center justify-center rounded-[2rem] cursor-pointer outline-none focus:outline-none"
          style={{
            width: 180,
            height: 200,
            background: gekozenGeslacht === 'jongen'
              ? 'linear-gradient(135deg, #BFDBFE 0%, #93C5FD 100%)'
              : 'linear-gradient(135deg, #F0F4FF 0%, #E0E8FF 100%)',
            border: gekozenGeslacht === 'jongen'
              ? '4px solid #60A5FA'
              : '3px solid rgba(255,255,255,0.7)',
            boxShadow: gekozenGeslacht === 'jongen'
              ? '0 8px 30px -4px rgba(59, 130, 246, 0.35), inset 0 2px 4px rgba(255,255,255,0.6)'
              : '0 4px 20px -4px rgba(0,0,0,0.1), inset 0 2px 4px rgba(255,255,255,0.7)',
            transition: 'border 0.2s, box-shadow 0.2s',
          }}
          whileTap={{ scale: 0.92 }}
        >
          {/* Jongen silhouet SVG */}
          <svg width="90" height="130" viewBox="0 0 90 130" fill="none">
            {/* Hoofd */}
            <circle cx="45" cy="30" r="22" fill={gekozenGeslacht === 'jongen' ? '#3B82F6' : '#94A3B8'} />
            {/* Haar (kort) */}
            <path d="M23 28C23 14 33 8 45 8C57 8 67 14 67 28" fill={gekozenGeslacht === 'jongen' ? '#2563EB' : '#64748B'} />
            {/* Lichaam */}
            <path
              d="M45 52V82"
              stroke={gekozenGeslacht === 'jongen' ? '#3B82F6' : '#94A3B8'}
              strokeWidth="8"
              strokeLinecap="round"
            />
            {/* Armen */}
            <path
              d="M45 62L25 78M45 62L65 78"
              stroke={gekozenGeslacht === 'jongen' ? '#3B82F6' : '#94A3B8'}
              strokeWidth="7"
              strokeLinecap="round"
            />
            {/* Benen */}
            <path
              d="M45 82L30 115M45 82L60 115"
              stroke={gekozenGeslacht === 'jongen' ? '#3B82F6' : '#94A3B8'}
              strokeWidth="7"
              strokeLinecap="round"
            />
          </svg>

          {/* Selectie-vinkje */}
          {gekozenGeslacht === 'jongen' && (
            <motion.div
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </motion.div>
          )}
        </motion.button>

        {/* Meisje-knop */}
        <motion.button
          onClick={() => handleGeslachtKeuze('meisje')}
          className="relative flex items-center justify-center rounded-[2rem] cursor-pointer outline-none focus:outline-none"
          style={{
            width: 180,
            height: 200,
            background: gekozenGeslacht === 'meisje'
              ? 'linear-gradient(135deg, #FBCFE8 0%, #F9A8D4 100%)'
              : 'linear-gradient(135deg, #FFF0F6 0%, #FFE4EE 100%)',
            border: gekozenGeslacht === 'meisje'
              ? '4px solid #F472B6'
              : '3px solid rgba(255,255,255,0.7)',
            boxShadow: gekozenGeslacht === 'meisje'
              ? '0 8px 30px -4px rgba(244, 114, 182, 0.35), inset 0 2px 4px rgba(255,255,255,0.6)'
              : '0 4px 20px -4px rgba(0,0,0,0.1), inset 0 2px 4px rgba(255,255,255,0.7)',
            transition: 'border 0.2s, box-shadow 0.2s',
          }}
          whileTap={{ scale: 0.92 }}
        >
          {/* Meisje silhouet SVG */}
          <svg width="90" height="130" viewBox="0 0 90 130" fill="none">
            {/* Hoofd */}
            <circle cx="45" cy="30" r="22" fill={gekozenGeslacht === 'meisje' ? '#EC4899' : '#94A3B8'} />
            {/* Haar (lang) */}
            <path
              d="M23 28C23 14 33 8 45 8C57 8 67 14 67 28L70 55C70 55 62 48 55 48L54 35C54 35 50 40 45 40C40 40 36 35 36 35L35 48C28 48 20 55 20 55L23 28Z"
              fill={gekozenGeslacht === 'meisje' ? '#DB2777' : '#64748B'}
            />
            {/* Lichaam (jurk-vorm) */}
            <path
              d="M45 52L32 95L58 95L45 52Z"
              fill={gekozenGeslacht === 'meisje' ? '#EC4899' : '#94A3B8'}
              strokeLinecap="round"
            />
            {/* Armen */}
            <path
              d="M38 60L22 76M52 60L68 76"
              stroke={gekozenGeslacht === 'meisje' ? '#EC4899' : '#94A3B8'}
              strokeWidth="7"
              strokeLinecap="round"
            />
            {/* Benen */}
            <path
              d="M38 95L32 120M52 95L58 120"
              stroke={gekozenGeslacht === 'meisje' ? '#EC4899' : '#94A3B8'}
              strokeWidth="7"
              strokeLinecap="round"
            />
          </svg>

          {/* Selectie-vinkje */}
          {gekozenGeslacht === 'meisje' && (
            <motion.div
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </motion.div>
          )}
        </motion.button>
      </motion.div>

      {/* Naam-invoerveld — de ene plek waar tekst OK is (ouder vult in) */}
      <motion.div
        className="relative z-10 w-full max-w-sm"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <input
          type="text"
          value={invoerNaam}
          onChange={(e) => setInvoerNaam(e.target.value)}
          placeholder="Naam..."
          maxLength={20}
          autoComplete="off"
          className="w-full text-center text-2xl md:text-3xl font-bold rounded-2xl py-4 px-6 outline-none"
          style={{
            background: 'rgba(255, 255, 255, 0.8)',
            border: '3px solid rgba(255, 255, 255, 0.9)',
            boxShadow: '0 4px 20px -4px rgba(0,0,0,0.08), inset 0 2px 4px rgba(255,255,255,0.5)',
            color: '#4B3A2A',
            caretColor: '#F59E0B',
          }}
        />
      </motion.div>

      {/* Bevestig-knop — grote gekleurde pijl */}
      <motion.div
        className="relative z-10"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 150 }}
      >
        <motion.button
          onClick={handleBevestig}
          disabled={!isGereed}
          className="flex items-center justify-center rounded-full cursor-pointer outline-none focus:outline-none disabled:cursor-not-allowed"
          style={{
            width: 80,
            height: 80,
            background: isGereed
              ? 'linear-gradient(135deg, #34D399 0%, #10B981 50%, #059669 100%)'
              : 'linear-gradient(135deg, #D1D5DB 0%, #9CA3AF 100%)',
            border: '4px solid rgba(255,255,255,0.7)',
            boxShadow: isGereed
              ? '0 8px 30px -4px rgba(16, 185, 129, 0.4), inset 0 2px 4px rgba(255,255,255,0.4)'
              : '0 4px 12px -4px rgba(0,0,0,0.1)',
            transition: 'background 0.3s, box-shadow 0.3s',
          }}
          whileTap={isGereed ? { scale: 0.85 } : undefined}
          animate={isGereed ? { y: [0, -4, 0] } : {}}
          transition={isGereed ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' } as any : undefined}
        >
          {/* Pijl-icoon naar rechts */}
          <svg width="36" height="36" viewBox="0 0 24 24" fill="white" stroke="none">
            <path d="M5 12h14M13 5l7 7-7 7" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.button>
      </motion.div>
    </div>
  );
}
