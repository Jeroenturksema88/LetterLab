'use client';

import { useParams } from 'next/navigation';
import OefeningPagina from '@/components/pages/OefeningPagina';

export default function VormOefening() {
  const params = useParams();
  const vormId = params.vorm as string;
  return <OefeningPagina categorie="vormen" itemId={vormId} />;
}
