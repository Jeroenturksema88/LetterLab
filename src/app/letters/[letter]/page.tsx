'use client';

import { useParams, useRouter } from 'next/navigation';
import { useMemo, useCallback } from 'react';
import OefeningView from '@/components/canvas/OefeningView';
import { useVoortgangStore } from '@/stores/voortgang-store';
import { useInstellingenStore } from '@/stores/instellingen-store';
import { useAudioSpeler } from '@/components/audio/AudioSpeler';
import lettersData from '@/data/letters.json';
import type { ItemDef, Niveau } from '@/types';

const letters = lettersData as ItemDef[];

export default function LetterOefening() {
  const params = useParams();
  const router = useRouter();
  const letterId = params.letter as string;
  const { markeerVoltooid, huidigNiveau, registreerPoging } = useVoortgangStore();
  const { audioAan } = useInstellingenStore();
  const { speelVoorItem } = useAudioSpeler(audioAan);

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

  if (!item) {
    router.push('/letters');
    return null;
  }

  const handleVoltooid = (geslaagd: boolean) => {
    if (geslaagd) {
      markeerVoltooid(item.id, niveau);
      speelVoorItem('letters', item.id, 'voltooiing');
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

  return (
    <div className="h-full">
      <OefeningView
        item={item}
        niveau={niveau}
        onVoltooid={handleVoltooid}
        onTerug={() => router.push('/letters')}
        audioSpeelFn={audioSpeelFn}
      />
    </div>
  );
}
