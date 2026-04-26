'use client';

import { useParams } from 'next/navigation';
import OefeningPagina from '@/components/pages/OefeningPagina';

export default function CijferOefening() {
  const params = useParams();
  const cijferId = params.cijfer as string;
  return <OefeningPagina categorie="cijfers" itemId={cijferId} />;
}
