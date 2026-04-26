'use client';

import { useParams } from 'next/navigation';
import OefeningPagina from '@/components/pages/OefeningPagina';

export default function LetterOefening() {
  const params = useParams();
  const letterId = params.letter as string;
  return <OefeningPagina categorie="letters" itemId={letterId} />;
}
