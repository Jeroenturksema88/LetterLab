'use client';

import { useParams, useRouter } from 'next/navigation';
import { useMemo, useCallback } from 'react';
import OefeningView from '@/components/canvas/OefeningView';
import { useVoortgangStore } from '@/stores/voortgang-store';
import { useInstellingenStore } from '@/stores/instellingen-store';
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
  const { speelVoorItem } = useAudioSpeler(audioAan);

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

  if (!item) {
    router.push('/vormen');
    return null;
  }

  const handleVoltooid = (geslaagd: boolean) => {
    if (geslaagd) {
      markeerVoltooid(item.id, niveau);
      speelVoorItem('vormen', item.id, 'voltooiing');
    }
    registreerPoging(item.id);
    const volgendNiveau = huidigNiveau(item.id);
    if (volgendNiveau === niveau && geslaagd) {
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
    </div>
  );
}
