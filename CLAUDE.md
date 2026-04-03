# LetterLab — Interactieve leer-app voor Nore

## Projectoverzicht

LetterLab is een iPad-geoptimaliseerde web-app waarmee Nore (3,5 jaar) letters, cijfers en vormen leert schrijven. De app combineert overtrekken, naschrijven en zelfstandig schrijven met Nederlandse audio-instructie.

**Taal van de app: Nederlands.** Alle UI-teksten, audio-scripts, comments in code, en commit messages zijn in het Nederlands.

## Tech Stack

| Component | Technologie |
|-----------|-------------|
| Framework | Next.js 14+ (App Router, TypeScript) |
| Canvas | HTML5 Canvas + `perfect-freehand` |
| Audio | Web Speech API (MVP) → pre-recorded .mp3 (productie) |
| State | Zustand + localStorage |
| Animaties | Framer Motion |
| Styling | Tailwind CSS |
| Hosting | Vercel |
| PWA | next-pwa |

## Kernregels

### Doelgroep = 3,5 jaar oud kind
- **Geen tekst** in de kind-UI. Alle navigatie via iconen en kleuren.
- **Alle instructie is auditief.** De stem spreekt Nederlands.
- **Alleen positieve feedback.** Nooit "fout". Altijd "probeer nog eens" met aanmoediging.
- **Touch targets minimaal 44x44pt.** Liefst groter.
- **Geen complexe gebaren.** Alleen tap, drag, draw. Geen pinch, double-tap, multi-touch.

### Canvas & tekenen
- Gebruik **PointerEvents** (niet TouchEvents) voor Apple Pencil + vinger support.
- Twee gestapelde canvas-lagen: template (statisch) + tekenlaag (interactief).
- Gebruik `perfect-freehand` voor drukgevoelige, vloeiende lijnen.
- Palm rejection wordt door iPadOS afgehandeld.

### Drie niveaus per item
1. **Overtrekken (Tracing)** — Gestippeld pad met startpunt-animatie. Tolerantie: 70% pad bedekt = geslaagd.
2. **Naschrijven (Side-by-Side)** — Voorbeeld links, leeg canvas rechts. Tolerantie: 50% similarity = geslaagd.
3. **Zelf schrijven (Freehand)** — Alleen audio-prompt, geen visueel voorbeeld. Tolerantie: 40% similarity = geslaagd.

### Audio
- Elk item heeft 7 audio-snippets (zie `data/audio-scripts.json`).
- MVP: Web Speech API met `lang: 'nl-NL'`.
- Productie: pre-recorded .mp3 bestanden in `/public/audio/`.

### Evaluatie
- **Geen ML/OCR.** Gebruik geometrische stroke-matching (proximity, richting, proportie).
- Configureerbare drempels per niveau.
- Begin altijd soepel — liever te makkelijk dan te moeilijk.

## Projectstructuur

```
src/
├── app/
│   ├── page.tsx                    # Startscherm (3 categorie-knoppen)
│   ├── letters/
│   │   ├── page.tsx                # Letter-grid overzicht
│   │   └── [letter]/page.tsx       # Oefening per letter
│   ├── cijfers/
│   │   ├── page.tsx                # Cijfer-grid overzicht
│   │   └── [cijfer]/page.tsx       # Oefening per cijfer
│   ├── vormen/
│   │   ├── page.tsx                # Vormen-grid overzicht
│   │   └── [vorm]/page.tsx         # Oefening per vorm
│   └── ouder/page.tsx              # Ouder-dashboard (pincode)
├── components/
│   ├── canvas/
│   │   ├── TekenCanvas.tsx         # Hoofdcomponent voor tekenen
│   │   ├── TemplateCanvas.tsx      # Template/voorbeeld laag
│   │   └── StrokePad.tsx           # Geanimeerd schrijfpad (niveau 1)
│   ├── navigatie/
│   │   ├── CategorieKnop.tsx       # Grote startscherm-knop
│   │   ├── ItemGrid.tsx            # Grid van letters/cijfers/vormen
│   │   └── VoortgangSterren.tsx    # Sterren-indicator per item
│   ├── feedback/
│   │   ├── BeloningAnimatie.tsx     # Sterren, confetti, sparkle
│   │   ├── VoltooiingScherm.tsx     # Scherm na voltooiing
│   │   └── AanmoedigingScherm.tsx   # "Probeer nog eens" scherm
│   └── audio/
│       └── AudioSpeler.tsx         # Audio-afspeelcomponent
├── hooks/
│   ├── useTekenCanvas.ts           # Canvas drawing logic
│   ├── useAudio.ts                 # Audio afspelen (TTS of mp3)
│   ├── useVoortgang.ts             # Progress tracking
│   └── useEvaluatie.ts             # Stroke-matching evaluatie
├── lib/
│   ├── stroke-matching.ts          # Geometrische vergelijkingsalgoritmes
│   ├── pad-normalisatie.ts         # SVG path → punten conversie
│   └── scoring.ts                  # Similarity scoring
├── stores/
│   ├── voortgang-store.ts          # Zustand store voor progress
│   └── instellingen-store.ts       # Zustand store voor settings
├── data/
│   ├── letters.json                # Letter-definities met paden
│   ├── cijfers.json                # Cijfer-definities met paden
│   ├── vormen.json                 # Vorm-definities met paden
│   └── audio-scripts.json          # Nederlandse audio-teksten
└── types/
    └── index.ts                    # TypeScript type-definities
public/
├── audio/                          # Pre-recorded audiobestanden
├── sounds/                         # UI-geluidseffecten
└── icons/                          # App-iconen voor PWA
```

## Conventies

- **Bestandsnamen:** Nederlands, kebab-case voor bestanden, PascalCase voor componenten
- **Variabelen/functies:** Nederlands waar het UI/domein betreft (`voortgang`, `niveau`, `evaluatie`), Engels voor technische termen (`stroke`, `canvas`, `render`)
- **Comments:** Nederlands
- **Commit messages:** Nederlands, imperatief ("Voeg letter-grid toe", "Fix audio timing")
- **Types:** Nederlands (`type Niveau = 'overtrekken' | 'naschrijven' | 'zelfstandig'`)

## Referentie-documenten

- `docs/PRD.md` — Volledig Product Requirements Document
- `data/audio-scripts.json` — Alle Nederlandse audio-teksten per item
- `data/letters.json` — Letter-definities (SVG-paden, streken, metadata)
- `.claude/skills/` — Gedetailleerde technische skills per subsysteem

## Snel starten

```bash
# Project opzetten
npx create-next-app@latest letterlab --typescript --tailwind --app --src-dir
cd letterlab
npm install perfect-freehand framer-motion zustand next-pwa

# Development
npm run dev
# Open in iPad Safari of Chrome DevTools (iPad simulatie)
```
