'use client';

// hooks/useTekenCanvas.ts — Canvas-tekenhook met PointerEvents en perfect-freehand
//
// Beheert het tekenproces op een HTML5 Canvas:
// - Retina/HiDPI-schaling via devicePixelRatio
// - PointerEvents voor Apple Pencil + vinger-ondersteuning
// - Vloeiende, drukgevoelige lijnen via perfect-freehand
// - Undo en wis-functionaliteit

import { useRef, useState, useCallback, useEffect } from 'react';
import getStroke from 'perfect-freehand';
import type { TekenPunt, Punt } from '@/types';

// Converteer een puntenarray van getStroke naar een SVG-padstring (M ... L ... Z)
function maakSvgPad(punten: number[][]): string {
  if (punten.length === 0) return '';

  const [eersteX, eersteY] = punten[0];
  let pad = `M ${eersteX.toFixed(2)} ${eersteY.toFixed(2)}`;

  for (let i = 1; i < punten.length; i++) {
    const [px, py] = punten[i];
    pad += ` L ${px.toFixed(2)} ${py.toFixed(2)}`;
  }

  pad += ' Z';
  return pad;
}

// perfect-freehand opties
const FREEHAND_OPTIES = {
  size: 12, // Wordt overschreven door lijnDikte parameter
  thinning: 0.5,
  smoothing: 0.5,
  streamline: 0.5,
  simulatePressure: true,
};

export function useTekenCanvas(kleur: string, lijnDikte: number = 12) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [streken, setStreken] = useState<TekenPunt[][]>([]);
  const huidigeStreekRef = useRef<TekenPunt[]>([]);
  const isAanHetTekenenRef = useRef(false);

  // Configureer canvas voor retina/HiDPI-schermen
  const configureerCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    // Stel canvas-resolutie in op basis van devicePixelRatio
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    // Schaal de tekencontext zodat CSS-pixels 1:1 overeenkomen
    ctx.scale(dpr, dpr);

    // Stel canvas CSS-afmetingen in (voorkomt vervormingen)
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
  }, []);

  // Teken een enkele streek (gevulde Path2D shape) op het canvas
  const tekenStreek = useCallback(
    (ctx: CanvasRenderingContext2D, punten: TekenPunt[]) => {
      if (punten.length === 0) return;

      // Genereer de vloeiende omtrekpunten via perfect-freehand
      const outlinePunten = getStroke(
        punten.map((p) => [p.x, p.y, p.druk]),
        {
          ...FREEHAND_OPTIES,
          size: lijnDikte,
        }
      );

      if (outlinePunten.length === 0) return;

      // Converteer naar SVG-pad en teken als gevulde vorm
      const padString = maakSvgPad(outlinePunten);
      const path = new Path2D(padString);

      ctx.fillStyle = kleur;
      ctx.fill(path);
    },
    [kleur, lijnDikte]
  );

  // Herteken alle streken op het canvas
  const herteken = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    // Wis het volledige canvas
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

    // Teken alle voltooide streken
    for (const streek of streken) {
      tekenStreek(ctx, streek);
    }

    // Teken de huidige streek (als de gebruiker aan het tekenen is)
    if (huidigeStreekRef.current.length > 0) {
      tekenStreek(ctx, huidigeStreekRef.current);
    }
  }, [streken, tekenStreek]);

  // Haal canvas-coördinaten op uit een PointerEvent
  const haalCanvasCoordinaten = useCallback(
    (e: PointerEvent): TekenPunt | null => {
      const canvas = canvasRef.current;
      if (!canvas) return null;

      const rect = canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        druk: e.pressure || 0.5,
        tijdstempel: Date.now(),
      };
    },
    []
  );

  // Pointer event handlers
  const handlePointerDown = useCallback(
    (e: PointerEvent) => {
      // Negeer niet-primaire pointers (bijv. palm bij Apple Pencil)
      if (!e.isPrimary) return;

      e.preventDefault();
      isAanHetTekenenRef.current = true;

      const punt = haalCanvasCoordinaten(e);
      if (!punt) return;

      huidigeStreekRef.current = [punt];

      // Teken onmiddellijk het eerste punt
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          tekenStreek(ctx, huidigeStreekRef.current);
        }
      }
    },
    [haalCanvasCoordinaten, tekenStreek]
  );

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!isAanHetTekenenRef.current || !e.isPrimary) return;

      e.preventDefault();

      const punt = haalCanvasCoordinaten(e);
      if (!punt) return;

      huidigeStreekRef.current.push(punt);

      // Herteken het canvas met de bijgewerkte huidige streek
      herteken();
    },
    [haalCanvasCoordinaten, herteken]
  );

  const handlePointerUp = useCallback(
    (e: PointerEvent) => {
      if (!isAanHetTekenenRef.current || !e.isPrimary) return;

      e.preventDefault();
      isAanHetTekenenRef.current = false;

      // Voeg de voltooide streek toe aan de lijst (als er punten zijn)
      if (huidigeStreekRef.current.length > 0) {
        const voltooideStreek = [...huidigeStreekRef.current];
        huidigeStreekRef.current = [];

        setStreken((vorige) => [...vorige, voltooideStreek]);
      }
    },
    []
  );

  // Registreer en verwijder PointerEvent listeners op het canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Configureer het canvas bij het mounten
    configureerCanvas();

    // Voeg event listeners toe
    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointerleave', handlePointerUp);

    // Voorkom standaard touch-acties (scrollen, zoomen) op het canvas
    canvas.style.touchAction = 'none';

    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('pointerleave', handlePointerUp);
    };
  }, [configureerCanvas, handlePointerDown, handlePointerMove, handlePointerUp]);

  // Herteken wanneer streken wijzigen
  useEffect(() => {
    herteken();
  }, [herteken]);

  // Herscale canvas bij venstergrootte-wijziging
  useEffect(() => {
    const handleResize = () => {
      configureerCanvas();
      herteken();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [configureerCanvas, herteken]);

  // Wis alle streken
  const wisAlles = useCallback(() => {
    huidigeStreekRef.current = [];
    setStreken([]);

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const dpr = window.devicePixelRatio || 1;
        ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
      }
    }
  }, []);

  // Maak de laatste streek ongedaan
  const ongedaanMaken = useCallback(() => {
    setStreken((vorige) => {
      if (vorige.length === 0) return vorige;
      return vorige.slice(0, -1);
    });
  }, []);

  return {
    canvasRef,
    streken,
    wisAlles,
    ongedaanMaken,
    herteken,
  };
}
