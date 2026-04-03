'use client';

import { useParams, useRouter } from 'next/navigation';
import { useMemo, useCallback } from 'react';
import OefeningView from '@/components/canvas/OefeningView';
import { useVoortgangStore } from '@/stores/voortgang-store';
import { useInstellingenStore } from '@/stores/instellingen-store';
import { useAudioSpeler } from '@/components/audio/AudioSpeler';
import cijfersData from '@/data/cijfers.json';
import type { ItemDef, Niveau } from '@/types';

const cijfers = cijfersData as ItemDef[];

export default function CijferOefening() {
  const params = useParams();
  const router = useRouter();
  const cijferId = params.cijfer as string;
  const { markeerVoltooid, huidigNiveau, registreerPoging } = useVoortgangStore();
  const { audioAan } = useInstellingenStore();
  const { speelVoorItem } = useAudioSpeler(audioAan);

  const item = useMemo(() => cijfers.find((c) => c.id === cijferId), [cijferId]);
  const niveau = useMemo(() => (item ? huidigNiveau(item.id) : 'overtrekken' as Niveau), [item, huidigNiveau]);

  const audioSpeelFn = useCallback(
    (type: string) => {
      if (item) {
        speelVoorItem('cijfers', item.id, type as any);
      }
    },
    [item, speelVoorItem]
  );

  if (!item) {
    router.push('/cijfers');
    return null;
  }

  const handleVoltooid = (geslaagd: boolean) => {
    if (geslaagd) {
      markeerVoltooid(item.id, niveau);
      speelVoorItem('cijfers', item.id, 'voltooiing');
    }
    registreerPoging(item.id);
    const volgendNiveau = huidigNiveau(item.id);
    if (volgendNiveau === niveau && geslaagd) {
      router.push('/cijfers');
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
        onTerug={() => router.push('/cijfers')}
        audioSpeelFn={audioSpeelFn}
      />
    </div>
  );
}
