'use client';

import { useRef, useEffect, useCallback, useState, useImperativeHandle, forwardRef } from 'react';
import getStroke from 'perfect-freehand';
import type { TekenPunt } from '@/types';

export interface TekenCanvasActies {
  wisAlles: () => void;
  ongedaanMaken: () => void;
}

interface TekenCanvasProps {
  breedte: number;
  hoogte: number;
  kleur: string;
  lijnDikte?: number;
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

const TekenCanvas = forwardRef<TekenCanvasActies, TekenCanvasProps>(
  function TekenCanvas({ breedte, hoogte, kleur, lijnDikte = 12, onStreekKlaar, disabled }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
    const isTekeningRef = useRef(false);
    const huidigeStreekRef = useRef<TekenPunt[]>([]);
    const strekenRef = useRef<TekenPunt[][]>([]);
    const kleurRef = useRef(kleur);
    const lijnDikteRef = useRef(lijnDikte);

    // Houd kleur/dikte bij voor hertekenen
    kleurRef.current = kleur;
    lijnDikteRef.current = lijnDikte;

    // Bewaar kleur per streek zodat hertekenen correct is
    const streekKleurenRef = useRef<string[]>([]);
    const streekDiktesRef = useRef<number[]>([]);

    const opties = useCallback(() => ({
      size: lijnDikteRef.current,
      thinning: 0.5,
      smoothing: 0.5,
      streamline: 0.5,
      simulatePressure: true,
    }), []);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = breedte * dpr;
      canvas.height = hoogte * dpr;
      const ctx = canvas.getContext('2d')!;
      ctx.scale(dpr, dpr);
      ctxRef.current = ctx;

      herteken();
    }, [breedte, hoogte]);

    const herteken = useCallback(() => {
      const ctx = ctxRef.current;
      if (!ctx) return;
      ctx.clearRect(0, 0, breedte, hoogte);

      for (let i = 0; i < strekenRef.current.length; i++) {
        const streekKleur = streekKleurenRef.current[i] || kleurRef.current;
        const streekDikte = streekDiktesRef.current[i] || lijnDikteRef.current;
        tekenStreek(ctx, strekenRef.current[i], streekKleur, streekDikte);
      }
    }, [breedte, hoogte]);

    function tekenStreek(ctx: CanvasRenderingContext2D, punten: TekenPunt[], streekKleur: string, dikte: number) {
      if (punten.length === 0) return;
      const invoer = punten.map((p) => [p.x, p.y, p.druk]);
      const streekOpties = {
        size: dikte,
        thinning: 0.5,
        smoothing: 0.5,
        streamline: 0.5,
        simulatePressure: true,
      };
      const omtrek = getStroke(invoer, streekOpties);
      const padData = maakSvgPad(omtrek);
      if (!padData) return;

      ctx.fillStyle = streekKleur;
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

      const vorige = huidigeStreekRef.current[huidigeStreekRef.current.length - 1];
      if (vorige) {
        const dx = punt.x - vorige.x;
        const dy = punt.y - vorige.y;
        if (dx * dx + dy * dy < 4) return;
      }

      huidigeStreekRef.current.push(punt);

      const ctx = ctxRef.current;
      if (!ctx) return;
      herteken();
      tekenStreek(ctx, huidigeStreekRef.current, kleurRef.current, lijnDikteRef.current);
    }, [disabled, herteken]);

    const handlePointerUp = useCallback((e: React.PointerEvent) => {
      if (!isTekeningRef.current) return;
      e.preventDefault();
      isTekeningRef.current = false;

      if (huidigeStreekRef.current.length > 1) {
        const voltooideStreek = [...huidigeStreekRef.current];
        strekenRef.current.push(voltooideStreek);
        streekKleurenRef.current.push(kleurRef.current);
        streekDiktesRef.current.push(lijnDikteRef.current);
        onStreekKlaar(voltooideStreek);
      }
      huidigeStreekRef.current = [];
    }, [onStreekKlaar]);

    const wisAlles = useCallback(() => {
      strekenRef.current = [];
      streekKleurenRef.current = [];
      streekDiktesRef.current = [];
      huidigeStreekRef.current = [];
      const ctx = ctxRef.current;
      if (ctx) ctx.clearRect(0, 0, breedte, hoogte);
    }, [breedte, hoogte]);

    const ongedaanMaken = useCallback(() => {
      strekenRef.current = strekenRef.current.slice(0, -1);
      streekKleurenRef.current = streekKleurenRef.current.slice(0, -1);
      streekDiktesRef.current = streekDiktesRef.current.slice(0, -1);
      herteken();
    }, [herteken]);

    // Expose wisAlles en ongedaanMaken via ref
    useImperativeHandle(ref, () => ({
      wisAlles,
      ongedaanMaken,
    }), [wisAlles, ongedaanMaken]);

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
);

export default TekenCanvas;
