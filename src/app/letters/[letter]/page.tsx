'use client';

import { useParams, useRouter } from 'next/navigation';
import { useMemo, useCallback, useState } from 'react';
import OefeningView from '@/components/canvas/OefeningView';
import DiplomaOverlay from '@/components/feedback/DiplomaOverlay';
import type { DiplomaInfo } from '@/components/feedback/DiplomaOverlay';
import { useVoortgangStore } from '@/stores/voortgang-store';
import { useInstellingenStore } from '@/stores/instellingen-store';
import { useProfielStore } from '@/stores/profiel-store';
import { useAudioSpeler } from '@/components/audio/AudioSpeler';
import lettersData from '@/data/letters.json';
import type { ItemDef, Niveau } from '@/types';

const letters = lettersData as ItemDef[];

export default function LetterOefening() {
  const params = useParams();
  const router = useRouter();
  const letterId = params.letter as string;
  const { markeerVoltooid, huidigNiveau, registreerPoging, items } = useVoortgangStore();
  const { audioAan } = useInstellingenStore();
  const { naam, voegDiplomaToe, heeftDiploma } = useProfielStore();
  const { speelVoorItem } = useAudioSpeler(audioAan);

  // Diploma-overlay state
  const [diplomaInfo, setDiplomaInfo] = useState<DiplomaInfo | null>(null);
  const [toonDiploma, setToonDiploma] = useState(false);

  const item = useMemo(() => letters.find((l) => l.id === letterId), [letterId]);
  const niveau = useMemo(() => (item ? huidigNiveau(item.id) : 'overtrekken' as Niveau), [item, huidigNiveau]);

  const audioSpeelFn = useCallback(
    (type: string) => {
      if (item) {
        speelVoorItem('letters', item.id, type as any);
      }
    },
    [item, speelVoorItem]
  );

  // Controleer of alle items in de categorie volledig zijn afgerond
  const controleerCategorieDiploma = useCallback((): boolean => {
    const voortgangItems = useVoortgangStore.getState().items;
    return letters.every((letter) => {
      const voortgang = voortgangItems[letter.id];
      return voortgang && voortgang.niveau1 && voortgang.niveau2 && voortgang.niveau3;
    });
  }, []);

  if (!item) {
    router.push('/letters');
    return null;
  }

  const handleVoltooid = (geslaagd: boolean) => {
    if (geslaagd) {
      markeerVoltooid(item.id, niveau);
      speelVoorItem('letters', item.id, 'voltooiing');

      // Controleer of dit een diploma oplevert (alleen bij niveau 3 = zelfstandig)
      if (niveau === 'zelfstandig') {
        const itemDiplomaId = `item-${item.id}`;

        // Item-diploma: alle 3 niveaus van dit item voltooid
        if (!heeftDiploma(itemDiplomaId)) {
          voegDiplomaToe(itemDiplomaId);

          // Controleer of dit ook een categorie-diploma oplevert
          const categorieDiplomaId = 'categorie-letters';
          if (!heeftDiploma(categorieDiplomaId) && controleerCategorieDiploma()) {
            // Categorie-diploma heeft voorrang
            voegDiplomaToe(categorieDiplomaId);
            setDiplomaInfo({
              type: 'categorie',
              itemLabel: item.label,
              itemPaden: item.paden,
              categorie: 'letters',
              kindNaam: naam,
            });
          } else {
            // Toon item-diploma
            setDiplomaInfo({
              type: 'item',
              itemLabel: item.label,
              itemPaden: item.paden,
              categorie: 'letters',
              kindNaam: naam,
            });
          }
          setToonDiploma(true);
          return; // Wacht met navigeren tot diploma gesloten wordt
        }
      }
    }
    registreerPoging(item.id);

    // Ga naar het volgende level of terug naar het overzicht
    const volgendNiveau = huidigNiveau(item.id);
    if (volgendNiveau === niveau && geslaagd) {
      // Alle niveaus voltooid voor dit item
      router.push('/letters');
    } else {
      // Herlaad de pagina voor het volgende niveau
      router.refresh();
    }
  };

  const handleDiplomaSluiten = () => {
    setToonDiploma(false);
    setDiplomaInfo(null);
    registreerPoging(item.id);

    // Na sluiten van diploma, navigeer terug
    const volgendNiveau = huidigNiveau(item.id);
    if (volgendNiveau === niveau) {
      router.push('/letters');
    } else {
      router.refresh();
    }
  };

  return (
    <div className="h-full">
      <OefeningView
        item={item}
        niveau={niveau}
        onVoltooid={handleVoltooid}
        onTerug={() => router.push('/letters')}
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
