# LetterLab

Interactieve iPad-leer-app waarmee kinderen van 3–6 jaar **letters, cijfers en vormen** leren schrijven via overtrekken, naschrijven en zelfstandig schrijven, ondersteund door Nederlandse audio-instructie.

> Web-app, geen App Store. Open de URL in iPad Safari, voeg toe aan beginscherm en je hebt een fullscreen leeromgeving met Apple Pencil-ondersteuning.

## Live

- **Productie**: https://letterlab-nu.vercel.app
- **Repo**: https://github.com/Jeroenturksema88/LetterLab
- **Vercel project**: `letterlab` (team `jeroen-turksemas-projects`)

## Snel starten

```bash
nvm use 22
npm install
npm run dev
# open http://localhost:3000 in iPad Safari of Chrome DevTools (iPad simulatie)
```

## Tech-stack (samenvatting)

| Onderdeel | Keuze | Waarom |
|---|---|---|
| Framework | Next.js 14 App Router | SSG-snel, geen backend nodig, native op Vercel |
| Tekenen | HTML5 Canvas + `perfect-freehand` + PointerEvents | Vloeiende drukgevoelige lijnen voor Apple Pencil én vinger |
| Audio | Web Speech API (nl-NL) met fallback naar pre-recorded `.mp3` | Geen kosten in MVP, productie-upgrade naar opnames mogelijk |
| State | Zustand met `persist` (localStorage) | Geen account, geen server, geen privacy-issues |
| Animaties | Framer Motion | Declaratief, springs, gestures |
| Styling | Tailwind CSS 3 | Snel itereren op design tokens |
| PWA | Manifest + custom service worker (`public/sw.js`) | Add-to-Homescreen, offline first |
| Hosting | Vercel | Auto-deploy uit `main`, edge cache |

Volledige architectuur: zie `docs/PRD.md` en `claude/Projects/letterlab/Architecture.md` in het Obsidian-vault.

## Belangrijke commando's

```bash
npm run dev        # development server
npm run build      # productie build (lokaal verifiëren)
npm run lint       # ESLint + next-vitals
npm run typecheck  # TypeScript zonder bouwen
npm run icons      # regenereer PWA-iconen (vereist librsvg: brew install librsvg)
```

## Deploy

1. Commit met git-author `jeroenturksema@live.nl` (Vercel-Hobby blokkeert andere authors).
2. Push naar `main` op GitHub. Vercel deploy't automatisch.
3. Controleer: Vercel Dashboard → Project Settings → **Deployment Protection** moet UIT staan, anders krijgt het publiek 401.

## Repo-conventies

- **Taal**: Nederlands. UI, audio-scripts, comments, commit messages.
- **Naamgeving**: kebab-case voor bestanden, PascalCase voor componenten, Nederlands voor domein-termen, Engels voor pure tech-termen.
- **Geen tekst in kind-UI**. Iconen, kleuren en audio dragen de UX.
- **Forgiving evaluatie**: drempels staan in `stores/instellingen-store.ts` en kunnen in het ouder-dashboard worden bijgesteld.

## Documentatie

- `docs/PRD.md` — volledig product-requirements-document
- `CLAUDE.md` — instructies voor Claude Code (project-context)
- Obsidian: `claude/Projects/letterlab/` — long-term knowledge base (README, Architecture, Tracklog, Known Issues)
