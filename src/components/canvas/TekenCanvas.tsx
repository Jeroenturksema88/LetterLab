'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import getStroke from 'perfect-freehand';
import type { TekenPunt } from '@/types';

interface TekenCanvasProps {
  breedte: number;
  hoogte: number;
  kleur: string;
  onStreekKlaar: (punten: TekenPunt[]) => void;
  disabled?: boolean;
}

function maakSvgPad(punten: number[][]): string {
  if (punten.length === 0) return '';
  const [eerste, ...rest] = punten;
  let pad = `M ${eerste[0]} ${eerste[1]}`;
  for (const [x, y] of rest) {
    pad += ` L ${x} ${y}`;
  }
  pad += ' Z';
  return pad;
}

export default function TekenCanvas({ breedte, hoogte, kleur, onStreekKlaar, disabled }: TekenCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const isTekeningRef = useRef(false);
  const huidigeStreekRef = useRef<TekenPunt[]>([]);
  const strekenRef = useRef<TekenPunt[][]>([]);
  const [, forceUpdate] = useState(0);

  const opties = {
    size: 12,
    thinning: 0.5,
    smoothing: 0.5,
    streamline: 0.5,
    simulatePressure: true,
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = breedte * dpr;
    canvas.height = hoogte * dpr;
    const ctx = canvas.getContext('2d')!;
    ctx.scale(dpr, dpr);
    ctxRef.current = ctx;

    // Herteken bestaande streken
    herteken();
  }, [breedte, hoogte]);

  const herteken = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    ctx.clearRect(0, 0, breedte, hoogte);

    for (const streek of strekenRef.current) {
      tekenStreek(ctx, streek);
    }
  }, [breedte, hoogte, kleur]);

  function tekenStreek(ctx: CanvasRenderingContext2D, punten: TekenPunt[]) {
    if (punten.length === 0) return;
    const invoer = punten.map((p) => [p.x, p.y, p.druk]);
    const omtrek = getStroke(invoer, opties);
    const padData = maakSvgPad(omtrek);
    if (!padData) return;

    ctx.fillStyle = kleur;
    ctx.fill(new Path2D(padData));
  }

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (disabled) return;
    e.preventDefault();
    isTekeningRef.current = true;
    huidigeStreekRef.current = [{
      x: e.nativeEvent.offsetX,
      y: e.nativeEvent.offsetY,
      druk: e.pressure || 0.5,
      tijdstempel: Date.now(),
    }];
  }, [disabled]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isTekeningRef.current || disabled) return;
    e.preventDefault();

    const punt: TekenPunt = {
      x: e.nativeEvent.offsetX,
      y: e.nativeEvent.offsetY,
      druk: e.pressure || 0.5,
      tijdstempel: Date.now(),
    };

    // Filter punten die te dicht bij elkaar liggen
    const vorige = huidigeStreekRef.current[huidigeStreekRef.current.length - 1];
    if (vorige) {
      const dx = punt.x - vorige.x;
      const dy = punt.y - vorige.y;
      if (dx * dx + dy * dy < 4) return;
    }

    huidigeStreekRef.current.push(punt);

    // Teken huidige streek
    const ctx = ctxRef.current;
    if (!ctx) return;
    herteken();
    tekenStreek(ctx, huidigeStreekRef.current);
  }, [disabled, herteken, kleur]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!isTekeningRef.current) return;
    e.preventDefault();
    isTekeningRef.current = false;

    if (huidigeStreekRef.current.length > 1) {
      const voltooideStreek = [...huidigeStreekRef.current];
      strekenRef.current.push(voltooideStreek);
      onStreekKlaar(voltooideStreek);
    }
    huidigeStreekRef.current = [];
  }, [onStreekKlaar]);

  const wisAlles = useCallback(() => {
    strekenRef.current = [];
    huidigeStreekRef.current = [];
    const ctx = ctxRef.current;
    if (ctx) ctx.clearRect(0, 0, breedte, hoogte);
    forceUpdate((n) => n + 1);
  }, [breedte, hoogte]);

  const ongedaanMaken = useCallback(() => {
    strekenRef.current = strekenRef.current.slice(0, -1);
    herteken();
    forceUpdate((n) => n + 1);
  }, [herteken]);

  // Expose methods via ref-like pattern
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      (canvas as any).wisAlles = wisAlles;
      (canvas as any).ongedaanMaken = ongedaanMaken;
    }
  }, [wisAlles, ongedaanMaken]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-10"
      style={{ width: breedte, height: hoogte, touchAction: 'none' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    />
  );
}
