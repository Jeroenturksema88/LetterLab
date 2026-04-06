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
import vormenData from '@/data/vormen.json';
import type { ItemDef, Niveau } from '@/types';

const vormen = vormenData as ItemDef[];

export default function VormOefening() {
  const params = useParams();
  const router = useRouter();
  const vormId = params.vorm as string;
  const { markeerVoltooid, huidigNiveau, registreerPoging } = useVoortgangStore();
  const { audioAan } = useInstellingenStore();
  const { naam, voegDiplomaToe, heeftDiploma } = useProfielStore();
  const { speelVoorItem } = useAudioSpeler(audioAan);

  // Diploma-overlay state
  const [diplomaInfo, setDiplomaInfo] = useState<DiplomaInfo | null>(null);
  const [toonDiploma, setToonDiploma] = useState(false);

  const item = useMemo(() => vormen.find((v) => v.id === vormId), [vormId]);
  const niveau = useMemo(() => (item ? huidigNiveau(item.id) : 'overtrekken' as Niveau), [item, huidigNiveau]);

  const audioSpeelFn = useCallback(
    (type: string) => {
      if (item) {
        speelVoorItem('vormen', item.id, type as any);
      }
    },
    [item, speelVoorItem]
  );

  // Controleer of alle vormen volledig zijn afgerond
  const controleerCategorieDiploma = useCallback((): boolean => {
    const voortgangItems = useVoortgangStore.getState().items;
    return vormen.every((vorm) => {
      const voortgang = voortgangItems[vorm.id];
      return voortgang && voortgang.niveau1 && voortgang.niveau2 && voortgang.niveau3;
    });
  }, []);

  if (!item) {
    router.push('/vormen');
    return null;
  }

  const handleVoltooid = (geslaagd: boolean) => {
    if (geslaagd) {
      markeerVoltooid(item.id, niveau);
      speelVoorItem('vormen', item.id, 'voltooiing');

      // Controleer of dit een diploma oplevert (alleen bij niveau 3 = zelfstandig)
      if (niveau === 'zelfstandig') {
        const itemDiplomaId = `item-${item.id}`;

        // Item-diploma: alle 3 niveaus van dit item voltooid
        if (!heeftDiploma(itemDiplomaId)) {
          voegDiplomaToe(itemDiplomaId);

          // Controleer of dit ook een categorie-diploma oplevert
          const categorieDiplomaId = 'categorie-vormen';
          if (!heeftDiploma(categorieDiplomaId) && controleerCategorieDiploma()) {
            voegDiplomaToe(categorieDiplomaId);
            setDiplomaInfo({
              type: 'categorie',
              itemLabel: item.label,
              itemPaden: item.paden,
              categorie: 'vormen',
              kindNaam: naam,
            });
          } else {
            setDiplomaInfo({
              type: 'item',
              itemLabel: item.label,
              itemPaden: item.paden,
              categorie: 'vormen',
              kindNaam: naam,
            });
          }
          setToonDiploma(true);
          return; // Wacht met navigeren tot diploma gesloten wordt
        }
      }
    }
    registreerPoging(item.id);
    const volgendNiveau = huidigNiveau(item.id);
    if (volgendNiveau === niveau && geslaagd) {
      router.push('/vormen');
    } else {
      router.refresh();
    }
  };

  const handleDiplomaSluiten = () => {
    setToonDiploma(false);
    setDiplomaInfo(null);
    registreerPoging(item.id);

    const volgendNiveau = huidigNiveau(item.id);
    if (volgendNiveau === niveau) {
      router.push('/vormen');
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
        onTerug={() => router.push('/vormen')}
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
