'use client';

import { useRef, useEffect } from 'react';
import type { ItemDef, Niveau } from '@/types';

interface TemplateCanvasProps {
  item: ItemDef;
  niveau: Niveau;
  breedte: number;
  hoogte: number;
}

export default function TemplateCanvas({ item, niveau, breedte, hoogte }: TemplateCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = breedte * dpr;
    canvas.height = hoogte * dpr;
    const ctx = canvas.getContext('2d')!;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, breedte, hoogte);

    // Bereken schaalfactor om item in canvas te passen
    const bb = item.boundingBox;
    const padding = 40;
    const beschikbareBreedte = breedte - padding * 2;
    const beschikbareHoogte = hoogte - padding * 2;
    const schaalX = beschikbareBreedte / bb.breedte;
    const schaalY = beschikbareHoogte / bb.hoogte;
    const schaal = Math.min(schaalX, schaalY);
    const offsetX = padding + (beschikbareBreedte - bb.breedte * schaal) / 2 - bb.x * schaal;
    const offsetY = padding + (beschikbareHoogte - bb.hoogte * schaal) / 2 - bb.y * schaal;

    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(schaal, schaal);

    if (niveau === 'overtrekken') {
      // Brede lichtgrijze zone
      ctx.globalAlpha = 0.15;
      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = 30 / schaal;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      item.paden.forEach((pad) => {
        const path = new Path2D(pad);
        ctx.stroke(path);
      });

      // Gestippeld pad
      ctx.globalAlpha = 0.4;
      ctx.setLineDash([8 / schaal, 12 / schaal]);
      ctx.lineWidth = 3 / schaal;
      ctx.strokeStyle = '#64748B';
      item.paden.forEach((pad) => {
        const path = new Path2D(pad);
        ctx.stroke(path);
      });
      ctx.setLineDash([]);

      // Startpunt markering
      if (item.streken.length > 0) {
        const start = item.streken[0].startPunt;
        ctx.globalAlpha = 0.8;
        ctx.fillStyle = item.kleur;
        ctx.beginPath();
        ctx.arc(start.x, start.y, 8 / schaal, 0, Math.PI * 2);
        ctx.fill();

        // Pulserende ring
        ctx.strokeStyle = item.kleur;
        ctx.lineWidth = 2 / schaal;
        ctx.globalAlpha = 0.4;
        ctx.beginPath();
        ctx.arc(start.x, start.y, 14 / schaal, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
    } else if (niveau === 'naschrijven') {
      // Volledig voorbeeld in kleur
      ctx.globalAlpha = 1;
      ctx.strokeStyle = item.kleur;
      ctx.lineWidth = 4 / schaal;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      item.paden.forEach((pad) => {
        const path = new Path2D(pad);
        ctx.stroke(path);
      });
    }
    // Niveau 'zelfstandig': geen template, canvas blijft leeg

    ctx.restore();

    // Baseline (schrijflijn)
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.5;
    const baselineY = hoogte * 0.8;
    ctx.beginPath();
    ctx.moveTo(20, baselineY);
    ctx.lineTo(breedte - 20, baselineY);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }, [item, niveau, breedte, hoogte]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0"
      style={{ width: breedte, height: hoogte }}
    />
  );
}
