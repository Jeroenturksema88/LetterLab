'use client';

// components/pages/OefeningPagina.tsx — Gedeelde oefenpagina voor letters / cijfers / vormen.
// Bevat de volledige flow: laad item, speel intro-audio, render OefeningView, regel
// voortgang/diploma's bij voltooiing. Vervangt drie eerder gedupliceerde routes.

import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import OefeningView from '@/components/canvas/OefeningView';
import DiplomaOverlay from '@/components/feedback/DiplomaOverlay';
import type { DiplomaInfo } from '@/components/feedback/DiplomaOverlay';
import { useVoortgangStore } from '@/stores/voortgang-store';
import { useInstellingenStore } from '@/stores/instellingen-store';
import { useProfielStore } from '@/stores/profiel-store';
import { useAudioSpeler } from '@/components/audio/AudioSpeler';
import { haalCategorieConfig } from '@/lib/categorie-registry';
import type { AudioType, Categorie, Niveau } from '@/types';

interface OefeningPaginaProps {
  categorie: Categorie;
  itemId: string;
}

export default function OefeningPagina({ categorie, itemId }: OefeningPaginaProps) {
  const router = useRouter();
  const letterStijl = useInstellingenStore((s) => s.letterStijl);
  const config = haalCategorieConfig(categorie, letterStijl);
  const { markeerVoltooid, huidigNiveau, registreerPoging } = useVoortgangStore();
  // Subscribe expliciet op `items` zodat dit component re-rendert wanneer markeerVoltooid
  // de store wijzigt. Zonder deze subscription blijft `niveau` op de oude waarde
  // hangen (Zustand's actions zijn stabiele referenties — useMemo zou hier dus
  // nooit re-evalueren).
  const voortgangItems = useVoortgangStore((s) => s.items);
  const { audioAan } = useInstellingenStore();
  const { naam, voegDiplomaToe, heeftDiploma } = useProfielStore();
  const { speelVoorItem } = useAudioSpeler(audioAan);

  const [diplomaInfo, setDiplomaInfo] = useState<DiplomaInfo | null>(null);
  const [toonDiploma, setToonDiploma] = useState(false);

  const item = useMemo(
    () => config.items.find((i) => i.id === itemId),
    [config.items, itemId]
  );

  // Niveau wordt elke render fresh berekend uit de store, want huidigNiveau is
  // een stabiele actie-referentie (useMemo zou hier dus nooit re-evalueren).
  // De `voortgangItems` subscription hierboven garandeert dat we re-renderen
  // zodra markeerVoltooid de state wijzigt.
  const niveau: Niveau = item ? huidigNiveau(item.id) : 'overtrekken';

  // Detecteer of alle drie niveaus voor dit item al voltooid zijn. In dat geval
  // tonen we een replay-modus ("tekenfeest") in plaats van het kind opnieuw
  // door alle 3 niveaus te trekken — anders raakt het kind verward bij her-tap
  // op een al voltooid item (persona "Bram" uit panel).
  const isAllesVoltooid = item
    ? (() => {
        const v = voortgangItems[item.id];
        return v ? v.niveau1 && v.niveau2 && v.niveau3 : false;
      })()
    : false;

  const audioSpeelFn = useCallback(
    (type: string) => {
      if (item) speelVoorItem(categorie, item.id, type as AudioType);
    },
    [item, speelVoorItem, categorie]
  );

  // Categorie-diploma: alle items in de categorie hebben alle 3 niveaus voltooid
  const isCategorieKlaar = useCallback((): boolean => {
    const voortgang = useVoortgangStore.getState().items;
    return config.items.every((i) => {
      const v = voortgang[i.id];
      return v && v.niveau1 && v.niveau2 && v.niveau3;
    });
  }, [config.items]);

  if (!item) {
    router.push(config.routePrefix);
    return null;
  }

  const handleVoltooid = (geslaagd: boolean) => {
    if (geslaagd) {
      markeerVoltooid(item.id, niveau);
      speelVoorItem(categorie, item.id, 'voltooiing');

      // Diploma alleen bij niveau 3 (zelfstandig)
      if (niveau === 'zelfstandig') {
        const itemDiplomaId = `item-${item.id}`;
        if (!heeftDiploma(itemDiplomaId)) {
          voegDiplomaToe(itemDiplomaId);

          const categorieDiplomaId = `categorie-${categorie}`;
          if (!heeftDiploma(categorieDiplomaId) && isCategorieKlaar()) {
            voegDiplomaToe(categorieDiplomaId);
            setDiplomaInfo({
              type: 'categorie',
              itemLabel: item.label,
              itemPaden: item.paden,
              categorie,
              kindNaam: naam,
            });
          } else {
            setDiplomaInfo({
              type: 'item',
              itemLabel: item.label,
              itemPaden: item.paden,
              categorie,
              kindNaam: naam,
            });
          }
          setToonDiploma(true);
          return; // Wacht tot diploma gesloten wordt
        }
      }
    }

    registreerPoging(item.id);

    // Bepaal waar we naartoe gaan op basis van de NIEUWE store-state.
    const volgendNiveau = huidigNiveau(item.id);

    if (geslaagd && niveau === 'zelfstandig' && volgendNiveau === 'zelfstandig') {
      // Alle drie niveaus voor dit item al voltooid (en geen nieuwe diploma).
      // Terug naar het overzicht. Set sessie-flag zodat de overzichts-pagina
      // weet dat ze het volgende item kan suggereren via audio.
      try {
        sessionStorage.setItem('letterlab:suggestVolgende', categorie);
      } catch { /* sessionStorage kan disabled zijn */ }
      router.push(config.routePrefix);
      return;
    }

    // In alle andere gevallen blijven we op deze pagina staan. Dankzij de
    // store-subscription hierboven re-rendert dit component automatisch wanneer
    // de voortgang wijzigt; de `key` op OefeningView verderop garandeert dat
    // OefeningView volledig schoon remount bij een niveau-wisseling
    // (canvas leeg, streken-state gereset, juiste audio-instructie).
  };

  const handleDiplomaSluiten = () => {
    setToonDiploma(false);
    setDiplomaInfo(null);
    registreerPoging(item.id);

    const volgendNiveau = huidigNiveau(item.id);
    if (volgendNiveau === niveau) {
      // Alle 3 niveaus van dit item klaar — terug naar overzicht. Suggest-flag
      // zetten zodat het overzicht het volgende item via audio kan voorstellen.
      try {
        sessionStorage.setItem('letterlab:suggestVolgende', categorie);
      } catch { /* sessionStorage kan disabled zijn */ }
      router.push(config.routePrefix);
    }
    // Anders: blijf op de pagina; OefeningView remount via key-change.
  };

  return (
    <div className="h-full">
      <OefeningView
        // Key bevat zowel itemId als niveau (en replay-flag). Bij elke wisseling
        // unmount React de oude OefeningView en mount een schone nieuwe —
        // daardoor reset al de lokale state (streken, feedback-overlay,
        // disabled, kleur/dikte) en start de useEffect die de nieuwe
        // niveau-instructie afspeelt.
        key={`${item.id}-${niveau}-${isAllesVoltooid ? 'replay' : 'normaal'}`}
        item={item}
        niveau={niveau}
        replayModus={isAllesVoltooid}
        onVoltooid={handleVoltooid}
        onTerug={() => router.push(config.routePrefix)}
        audioSpeelFn={audioSpeelFn}
      />
      <DiplomaOverlay
        diploma={diplomaInfo}
        zichtbaar={toonDiploma}
        onSluiten={handleDiplomaSluiten}
      />
    </div>
  );
}
