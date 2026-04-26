# LetterLab — Interactieve leer-app voor Nore (en alle andere kinderen)

## Projectoverzicht

LetterLab is een iPad-geoptimaliseerde web-app waarmee Nore (3,5 jaar) en andere kinderen tot ca. 6 jaar **letters, cijfers en vormen** leren schrijven. Drie progressieniveaus per item (overtrekken → naschrijven → zelfstandig) met Nederlandse audio-instructie en directe positieve feedback.

**Taal van de app: Nederlands.** UI-teksten (waar relevant), audio-scripts, comments in code, commit messages — alles in het Nederlands.

## Knowledge sync naar Obsidian — DOEN NIET OVERSLAAN

De durable kennis voor dit project leeft in het Obsidian-vault onder `claude/Projects/letterlab/`. Deze `CLAUDE.md` is een korte-termijn pointer; de vault is de bron van waarheid.

**Bij start van elke significante sessie**: lees relevante notities. Voor audio-werk → [[Lessons]] § iOS Safari. Voor canvas-werk → [[Lessons]] § canvas. Voor deploy/Vercel → [[Lessons]] § Vercel.

**Bij einde van elke significante sessie**: update Obsidian voor je sluit. Pas alleen de relevante items aan:

1. **Tracklog.md** — gedateerde entry: probleem → root cause → fix → commit-hash → deploy-resultaat. Verplicht voor élke fix/feature/incident.
2. **Changelog.md** — als de wijziging zichtbaar is voor de gebruiker, voeg toe aan huidige of nieuwe release-sectie.
3. **Backlog.md** — nieuwe ideeën erbij (P2 default), opgeloste items eraf, prioriteiten herzien.
4. **Known Issues.md** — nieuwe bugs erbij, opgeloste eraf, status van re-enable't-zichzelf items checken.
5. **Lessons.md** — als je dacht "dit had ik kunnen weten voordat ik begon", voeg een bullet toe onder het juiste domein. Concreet, met context, met actie. Zo wordt het project elke iteratie slimmer.
6. **Architecture.md** — alleen bij stack/structuur/pattern-wijzigingen.
7. **README.md** — alleen bij URL/hosting/contributor-wijzigingen.

Behoud `[[wikilink]]` cross-references. Lees bestaande notities voor je herschrijft (Obsidian MCP-tools `read_note`, `write_note`). Sync gebeurt expliciet via deze tools — niet via shell-bewerking.

Reden dat deze sectie bovenaan staat: vergeten te syncen = volgende sessie weet niet meer waarom een keuze gemaakt is = dezelfde fout opnieuw maken. We hebben de [[Lessons]] juist om dat te voorkomen.

## Tech Stack

| Component | Technologie |
|-----------|-------------|
| Framework | Next.js 14 (App Router, TypeScript) |
| Canvas | HTML5 Canvas + `perfect-freehand` |
| Audio | Web Speech API (nl-NL) met fallback naar pre-recorded `.mp3` |
| State | Zustand `persist` met localStorage |
| Animaties | Framer Motion |
| Styling | Tailwind CSS 3 |
| PWA | Custom service worker (`public/sw.js`) — offline first, immutable cache voor audio/icons |
| Hosting | Vercel — auto-deploy uit `main` |

## Kernregels

### Doelgroep = 3,5 jaar oud kind
- **Geen tekst** in de kind-UI. Alle navigatie via iconen, kleuren en audio.
- **Alle instructie is auditief.** Nederlandse stem, vriendelijk, langzaam.
- **Alleen positieve feedback.** Nooit "fout". Altijd "probeer nog eens" met aanmoediging.
- **Touch targets minimaal 44x44pt.** Liefst groter (alle knoppen zijn 48–56px).
- **Geen complexe gebaren.** Alleen tap, drag, draw. Geen pinch, double-tap of multi-touch.
- **Wis-knop oranje, klaar-knop groen.** Visueel onderscheidend zodat het kind ze niet verwart.

### Canvas & tekenen
- **PointerEvents** (niet TouchEvents) voor Apple Pencil + vinger-support in één API.
- Twee gestapelde canvas-lagen: template (statisch) + tekenlaag (interactief).
- `perfect-freehand` voor drukgevoelige, vloeiende lijnen.
- Palm rejection: door iPadOS afgehandeld zodra Apple Pencil gepaird is.

### Drie niveaus per item
1. **Overtrekken** — Gestippeld pad + startpunt-puls + brede tolerantie-zone.
2. **Naschrijven** — Voorbeeld links (met "kijk-icoon"), leeg canvas rechts.
3. **Zelf schrijven** — Alleen audio-prompt, geen visueel voorbeeld.

Drempels staan in `src/stores/instellingen-store.ts` en zijn ouder-instelbaar:
- Overtrekken: 60% pad-bedekking
- Naschrijven: 35% similarity
- Zelfstandig: 30% similarity

### Audio
- Per item 7 snippets (`intro`, `niveau1_instructie` t/m `voltooiing`) in `src/data/audio-scripts.json`.
- MVP: Web Speech API (nl-NL stem op iPad Safari is "Ellen").
- Productie-upgrade: pre-recorded `.mp3`'s in `/public/audio/<categorie>/<itemId>/<type>.mp3`.
- Token-systeem in `useAudioSpeler` zorgt dat overlappende calls oudere afspeel-acties netjes afkappen.

### PWA / offline
- Manifest (`public/manifest.json`) verwijst naar SVG + PNG iconen (any + maskable).
- Service worker (`public/sw.js`) cached shell + statische assets + audio (cache-first voor immutable assets, network-first voor HTML).
- Service worker wordt alleen in productie geregistreerd (`ServiceWorkerRegister.tsx`).

## Projectstructuur (actueel)

```
src/
├── app/
│   ├── layout.tsx                  # Root layout met fonts, audio-ontgrendeling, rotatie-overlay, SW
│   ├── page.tsx                    # Startscherm (3 categorie-knoppen) + profiel-gate
│   ├── letters/page.tsx            # Thin wrapper → CategorieOverzichtPagina
│   ├── letters/[letter]/page.tsx   # Thin wrapper → OefeningPagina
│   ├── cijfers/page.tsx            # idem
│   ├── cijfers/[cijfer]/page.tsx   # idem
│   ├── vormen/page.tsx             # idem
│   ├── vormen/[vorm]/page.tsx      # idem
│   ├── ouder/page.tsx              # Ouder-dashboard (pincode-beveiligd)
│   └── profiel/page.tsx            # Profiel-instelling (geslacht verplicht, naam optioneel)
├── components/
│   ├── pages/
│   │   ├── CategorieOverzichtPagina.tsx  # Gedeelde overzichtspagina
│   │   └── OefeningPagina.tsx            # Gedeelde oefenpagina (audio + diploma's)
│   ├── canvas/
│   │   ├── OefeningView.tsx        # Hoofdcomponent voor een oefening
│   │   ├── TekenCanvas.tsx         # Interactieve tekenlaag
│   │   ├── TemplateCanvas.tsx      # Statische template/voorbeeld-laag
│   │   └── StrokePad.tsx           # Pulserend startpunt voor overtrekken
│   ├── navigatie/
│   │   ├── CategorieKnop.tsx       # Grote startscherm-knop met SVG-iconen
│   │   ├── ItemGrid.tsx            # Grid van letters/cijfers/vormen + sterren
│   │   ├── TerugKnop.tsx           # Universele terug-knop
│   │   └── VoortgangSterren.tsx    # 3 sterren-indicator
│   ├── feedback/
│   │   ├── BeloningAnimatie.tsx    # Sparkle / ster / confetti per niveau
│   │   ├── DiplomaOverlay.tsx      # Item- en categorie-diploma's
│   │   └── FeedbackOverlay.tsx     # Succes / aanmoediging schermen
│   ├── audio/
│   │   ├── AudioOntgrendelaar.tsx  # iOS Safari first-tap audio unlock
│   │   └── AudioSpeler.tsx         # useAudioSpeler hook (cancellable, mp3 + TTS)
│   ├── RotatieOverlay.tsx          # Toont prompt bij portrait
│   └── ServiceWorkerRegister.tsx   # Registreert sw.js in productie
├── hooks/
│   └── useVoortgang.ts             # Convenience-wrapper rond voortgang-store
├── lib/
│   ├── categorie-registry.ts       # Centrale lookup categorie → data + kleuren
│   ├── stroke-matching.ts          # evalueerOvertrekking + evalueerSimilarity
│   ├── pad-normalisatie.ts         # SVG → punten + bbox-normalisatie
│   └── scoring.ts                  # IoU rasterisatie + proportie/richting
├── stores/
│   ├── voortgang-store.ts          # Voortgang per item (3 niveaus, sterren)
│   ├── instellingen-store.ts       # Audio aan/uit, drempels, pincode, sessieLimiet
│   └── profiel-store.ts            # Naam, geslacht, behaalde diploma's
├── data/
│   ├── letters.json                # 26 letters (a-z, lowercase id, label uppercase)
│   ├── cijfers.json                # 11 cijfers (0-10)
│   ├── vormen.json                 # 12 basisvormen
│   └── audio-scripts.json          # NL audio-teksten per item + generieke prompts
└── types/
    └── index.ts                    # Centrale type-definities
public/
├── audio/                          # Pre-recorded audiobestanden (optioneel; TTS-fallback)
├── icons/                          # PWA-iconen (SVG masters + gegenereerde PNGs)
├── manifest.json                   # PWA-manifest
└── sw.js                           # Service worker
scripts/
└── maak-pwa-icons.sh               # Regenereert PNGs vanuit SVG masters (vereist librsvg)
.github/
└── workflows/ci.yml                # CI: typecheck + lint + build op PR/push
```

## Conventies

- **Bestandsnamen**: Nederlands, kebab-case voor bestanden, PascalCase voor React-componenten.
- **Variabelen/functies**: Nederlands voor UI/domein (`voortgang`, `niveau`, `evaluatie`), Engels voor pure tech-termen (`stroke`, `canvas`, `render`, `ref`).
- **Comments**: Nederlands. Een korte regel die uitlegt **waarom** iets zo is, niet **wat**.
- **Commit messages**: Nederlands, imperatief ("Voeg letter-grid toe", "Fix audio timing").
- **Types**: Nederlands (`type Niveau = 'overtrekken' | 'naschrijven' | 'zelfstandig'`).

## Snel starten

```bash
nvm use 22
npm install
npm run dev          # development
npm run build        # productie-build (lokaal verifiëren)
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
npm run icons        # regenereer PWA-iconen (vereist `brew install librsvg`)
```

## Deploy

1. **Git author moet `jeroenturksema@live.nl` zijn** — Vercel Hobby blokkeert andere authors silent.
2. Push naar `main` → Vercel auto-deploy't.
3. **Check Deployment Protection**: Vercel Dashboard → Project → Settings → Deployment Protection moet UIT staan, anders krijgt het publiek HTTP 401.

## Referentie-documenten

- `docs/PRD.md` — volledig Product Requirements Document
- `README.md` — quick reference voor nieuwe contributors
- Obsidian: `claude/Projects/letterlab/` — long-term knowledge base (README, Architecture, Tracklog, Known Issues)
