# Product Requirements Document: LetterLab

**Interactieve leer-app voor letters, cijfers en vormen**

iPad Web App • Next.js • Vercel

| | |
|---|---|
| **Versie** | 1.0 |
| **Datum** | April 2026 |
| **Auteur** | Jeroen (Product Owner) |
| **Status** | Draft – ter review door development team |

---

## 1. Executive Summary

LetterLab is een interactieve web-app (geoptimaliseerd voor iPad met Apple Pencil en touch) waarmee kinderen van 3–6 jaar letters, cijfers en basisvormen leren schrijven. De app combineert visueel overtrekken, auditieve instructie en progressieve moeilijkheidsgraden tot een samenhangende leerervaring.

De app wordt gebouwd als Next.js web-app, gehost op Vercel, en is direct toegankelijk via Safari op iPad zonder App Store-installatie. Dit maakt snelle iteratie, eenvoudige distributie en lage onderhoudskosten mogelijk.

| Aspect | Detail |
|--------|--------|
| Doelgroep | Kinderen 3–6 jaar (primair 3,5 jaar) |
| Platform | iPad (Safari PWA), Apple Pencil + touch |
| Taal | Nederlands (v1), uitbreidbaar naar EN/DE |
| Tech stack | Next.js, React, HTML5 Canvas, Web Speech API, Vercel |
| Content | 26 letters (A–Z), cijfers 0–10, 12+ basisvormen |

---

## 2. Probleemstelling & Context

### 2.1 Waarom deze app?

Bestaande letter-tracing apps (Writing Wizard, LetterSchool, ABC Kids) zijn native iOS-apps met abonnementsmodellen, advertenties, of beperkte aanpasbaarheid. Ze missen vaak een coherent progressiemodel dat overtrekken, naschrijven en zelfstandig schrijven als één doorlopend leertraject behandelt.

LetterLab vult dit gat als ad-free, custom-built leerapp die specifiek is ontworpen voor één kind, met volledige controle over content, tempo en pedagogische aanpak.

### 2.2 Concurrentieanalyse – lessen uit bestaande apps

| App | Sterk | Zwak | Les voor LetterLab |
|-----|-------|------|---------------------|
| Writing Wizard | Aanpasbare fonts, sticker-rewards, ouderrecordings | Geen echte progressie; altijd tracing | Combineer tracing met freehand niveaus |
| LetterSchool | 4 stappen per letter, visueel aantrekkelijk | Geen auditieve uitleg van wat letter is | Audio-first: eerst horen, dan doen |
| ABC Kids | Gratis, geen ads, eenvoudig | Geen pencil support, geen progressie | Apple Pencil + touch als first-class |
| Khan Academy Kids | Breed curriculum, adaptive difficulty | Generiek; niet gefocust op schrijven | Focus op één ding, doe het excellent |
| Duolingo ABC | Gamified scaffolding, exaggerated rewards | Alleen Engels, geen pencil | Reward loops kort en positief houden |

---

## 3. Doelgroep & Design Principes

### 3.1 Gebruikersprofiel

**Primaire gebruiker:** Kind, 3–4 jaar. Pre-literair, beperkte fijne motoriek, korte aandachtsspanne (8–10 minuten), denkt in symbolen en visueel. Kan niet lezen; alle instructie moet visueel en auditief zijn.

**Secundaire gebruiker:** Ouder/begeleider. Configureert sessies, monitort voortgang. Heeft eigen afgeschermd instellingenscherm (pincode-beveiligd).

### 3.2 UX-principes (niet-onderhandelbaar)

| Principe | Implementatie |
|----------|---------------|
| Geen tekst als navigatie | Alle navigatie via iconen, kleuren en vormen. Geen leesbare labels in kind-UI. |
| Audio-first instructie | Elke interactie wordt begeleid door gesproken instructie. Stem spreekt letter/cijfer/vorm uit vóór de oefening begint. |
| Onmiddellijke feedback | Elke touch/stroke geeft direct visueel resultaat. Geen wachttijden. Geluid bij voltooiing. |
| Alleen positieve reinforcement | Nooit "fout", alleen "probeer nog eens" met aanmoediging. Sterren, confetti, vrolijke geluiden. |
| Grote touch targets | Minimum 44x44pt voor alle interactieve elementen. Ruime spacing. |
| Geen complexe gebaren | Alleen tap, drag en draw. Geen pinch, double-tap of multi-touch. |
| Korte sessies | Maximaal 5–7 oefeningen per sessie. Natuurlijke eindpunten met beloning. |

### 3.3 Visueel ontwerp

- Zachte, warme kleurenpalet (geen neon, geen zwart). Denk aan pasteltinten met heldere accenten.
- Grote, ronde vormen. Afgeronde hoeken overal. Vriendelijk en uitnodigend.
- Subtiele animaties: zachte bounces, fade-ins, sparkle-effecten bij voltooiing. Geen flitsende of overweldigende effecten.
- Consistent visueel karakter/mascotte die het kind begeleidt (optioneel, v2).
- Dark mode niet nodig; altijd lichte, warme achtergrond.

---

## 4. Functionele Requirements

### 4.1 Content-categorieën

De app bevat drie content-categorieën, elk toegankelijk via een duidelijk visueel icoon op het startscherm:

| Categorie | Items | Icoon (suggestie) | Audio |
|-----------|-------|-------------------|-------|
| Letters | A–Z (hoofdletters v1, kleine letters v2) | ABC-blokje | Letternaam + klank |
| Cijfers | 0 t/m 10 | 123-blokje | Cijfernaam + hoeveelheid |
| Vormen | Cirkel, vierkant, driehoek, ster, hart, ovaal, ruit, halve maan, kruis, pijl, spiraal, golf | Vormen-collage | Vormnaam |

### 4.2 Progressiemodel – drie niveaus

Het hart van de app is een drie-staps progressiemodel per item. Elk niveau bouwt voort op het vorige en verhoogt geleidelijk de zelfstandigheid van het kind.

#### Niveau 1: Overtrekken (Tracing)

**Doel:** Kennismaken met de vorm en het motorische pad van de letter/cijfer/vorm.

- **Visueel:** Het item wordt groot en helder getoond in het midden van het canvas. Een lichtgrijze of gestippelde versie dient als template.
- **Guided path:** Gekleurde stippen of een animerend pad tonen de schrijfrichting en volgorde van de streken. Een pulserend startpunt geeft aan waar het kind moet beginnen.
- **Haptic/visueel feedback:** Terwijl het kind traceert, kleurt het pad in met een vrolijke kleur. Bij afwijking van het pad wordt de lijn lichter (maar niet onzichtbaar) – nooit rood of "fout".
- **Tolerantie:** Breed. Het kind hoeft niet pixel-perfect te traceren. Een marge van ~30–40px rond het pad wordt geaccepteerd.
- **Voltooiing:** Wanneer >70% van het pad is gevolgd, toont de app een beloning (sterren, sparkle-animatie) en speelt de stem het item nogmaals af.

#### Niveau 2: Naschrijven (Side-by-Side)

**Doel:** Het kind reproduceert het item op basis van een visueel voorbeeld, zonder direct over te trekken.

- **Layout:** Split-screen. Links: het voltooide voorbeeld (helder, in kleur). Rechts: een leeg canvas met alleen een baseline/schrijflijn.
- **Geen guided path:** Het kind moet zelf de streken bepalen op basis van het voorbeeld.
- **Feedback:** Na voltooiing (kind tikt op een "klaar"-knop of na 5 seconden inactiviteit) vergelijkt de app de tekening met het template via een eenvoudige stroke-matching analyse.
- **Tolerantie:** Ruim. De app kijkt naar globale gelijkenis (proportie, richting van streken), niet naar precisie. Het doel is herkenning, niet perfectie.
- **Beloning:** Vergelijkbaar met Niveau 1, plus de stem benoemt het item opnieuw: "Super! Dat is de letter A!"

#### Niveau 3: Zelf schrijven (Freehand)

**Doel:** Het kind schrijft/tekent het item volledig uit het geheugen, na alleen een auditieve prompt.

- **Prompt:** De stem zegt: "Kun je een [A/3/cirkel] tekenen?" Er is géén visueel voorbeeld.
- **Canvas:** Volledig leeg canvas met alleen een lichte baseline.
- **Evaluatie:** Na voltooiing wordt de tekening vergeleken met het template. De app gebruikt een simpele similarity score.
- **Bij succes:** Uitgebreide beloning met confetti-animatie. De stem zegt: "Wauw, geweldig! Je hebt een [item] getekend!" Het item krijgt een gouden ster in het overzicht.
- **Bij "niet helemaal":** De stem moedigt aan: "Bijna! Wil je het nog een keer proberen?" Het voorbeeld wordt kort getoond als hint, waarna het kind opnieuw kan proberen.

### 4.3 Audiosysteem

Audio is een kernonderdeel van de leerervaring, niet een nice-to-have. Het cognitieve element – weten wat je schrijft – is minstens zo belangrijk als het motorische element.

#### Audiomomenten in de flow

| Moment | Wat wordt afgespeeld | Voorbeeld |
|--------|---------------------|-----------|
| Item selectie | Naam van het item + korte context | *"Dit is de letter A. A is van Aap!"* |
| Start oefening | Instructie voor het niveau | *"Trek de letter A na over de stipjes!"* |
| Tijdens tekenen | Subtiel geluidseffect bij streken (optioneel, zacht) | *Zacht potloodgeluid of klokje* |
| Voltooiing | Beloning + herhaling itemnaam | *"Goed gedaan! Dat is de letter A!" + jingle* |
| Herhaling nodig | Aanmoediging, nooit afkeuring | *"Bijna! Probeer het nog een keer!"* |

#### Audio-implementatie

- **Optie A – Pre-recorded (aanbevolen):** Professionele Nederlandse stem (warm, vriendelijk, geduldig). Ingesproken audiobestanden per item en per instructieregel. Geeft de meeste controle over kwaliteit en toon.
- **Optie B – Web Speech API (fallback/MVP):** Browser-native TTS met Nederlandse stem (nl-NL). iPad Safari ondersteunt dit. Kwaliteit is acceptabel maar minder warm. Goed voor MVP/prototype, vervangen door pre-recorded voor productie.
- **Optie C – ElevenLabs API (premium):** AI-gegenereerde Nederlandse stem met hoge kwaliteit. Per-request kosten maar zeer natuurlijk klinkend. Geschikt als pre-recorded bestanden worden gegenereerd bij build-time.

*Aanbeveling: Start met Web Speech API voor de MVP. Genereer daarna pre-recorded audio met ElevenLabs voor de productieversie. Sla audiobestanden op als .mp3 in een /public/audio/ directory, geïndexeerd per item en instructietype.*

### 4.4 Tekensysteem (Canvas)

#### Technische aanpak

- **HTML5 Canvas API:** Twee gestapelde canvas-lagen: (1) template-laag (statisch, toont het voorbeeld/pad) en (2) tekenlaag (interactief, vangt input op).
- **Pointer Events API:** Gebruik PointerEvents (niet TouchEvents) voor uniforme ondersteuning van Apple Pencil én vinger. PointerEvents bieden pressure-data voor pencil, waarmee lijndikte kan variëren.
- **Palm rejection:** iPadOS handelt palm rejection af op OS-niveau wanneer Apple Pencil is gekoppeld. Voor finger-only modus: accepteer alle touches.
- **Lijnkwaliteit:** Gebruik de `perfect-freehand` library (npm: perfect-freehand) voor vloeiende, drukgevoelige lijnen. Dit geeft een natuurlijk "potlood"-gevoel.

#### Template/pad definitie

Elk item (letter, cijfer, vorm) wordt gedefinieerd als een set SVG-paden met metadata:

- **pathData:** SVG path string(s) voor de volledige vorm.
- **strokes[]:** Array van individuele streken, elk met startpunt, eindpunt en tussenpunten. Dit definieert de correcte schrijfvolgorde.
- **startPoint:** Het geanimeerde startpunt per stroke.
- **boundingBox:** Afmetingen voor schaling naar het canvas.

*Opslag: JSON-bestanden per categorie (letters.json, numbers.json, shapes.json) in /public/data/.*

#### Stroke-matching & evaluatie

De evaluatie moet forgiving zijn – het doel is motivatie, niet precisie. De aanpak:

- **Niveau 1 (Tracing):** Bereken het percentage van het template-pad dat is "bedekt" door de gebruikersinput (proximity-based). Drempel: 70% = geslaagd.
- **Niveau 2 (Side-by-side):** Normaliseer zowel de gebruikersinput als het template naar dezelfde bounding box. Bereken een globale similarity score op basis van stroke-richting, proportie en overlap. Drempel: 50% = geslaagd.
- **Niveau 3 (Freehand):** Zelfde als Niveau 2, maar met een lagere drempel (40%) en aanvullende heuristics: bevat de tekening de juiste hoeveelheid streken? Zijn de streken in de juiste globale richtingen?

*Belangrijk: gebruik GEEN ML-model of OCR voor evaluatie. De doelgroep is 3–4 jaar; hun output is inherent onvoorspelbaar. Eenvoudige geometrische vergelijking is voldoende en betrouwbaarder.*

### 4.5 Navigatie & User Flow

#### Startscherm

Drie grote, kleurrijke knoppen voor de categorieën: Letters, Cijfers, Vormen. Elk met een duidelijk icoon en een korte animatie bij hover/touch. Geen tekst-labels in de kind-UI. Optioneel: ouder-knop (klein, in hoek, pincode-beveiligd) voor instellingen.

#### Categorie-overzicht

Grid van items (bv. alle 26 letters). Elk item toont de letter/cijfer/vorm met een visuele voortgangsindicator:

- Geen sterren = nog niet geprobeerd (item is helder en uitnodigend)
- 1 ster (brons) = Niveau 1 voltooid
- 2 sterren (zilver) = Niveau 2 voltooid
- 3 sterren (goud) = Niveau 3 voltooid

Het kind kan elk item aantikken om te starten. Volgorde is vrij (geen lock-mechanisme). De volgende niet-voltooide letter wordt visueel gehighlight met een subtiel pulse-effect.

#### Oefening-flow per item

De flow per item verloopt als volgt:

1. Audio introduceert het item ("Dit is de letter B. B is van Beer!")
2. Het huidige niveau wordt geladen (automatisch het eerstvolgende onvoltooide niveau)
3. Audio geeft niveau-specifieke instructie ("Trek de B na over de stipjes!")
4. Kind tekent op het canvas
5. Bij voltooiing: evaluatie + feedback + audio ("Goed zo! Dat is de B!")
6. Beloning (sterren-animatie)
7. Optie: "Nog een keer" of "Volgende" (via iconen, niet tekst)

#### Wis-functionaliteit

Een duidelijke "gum"-knop (icoon van een gum) wist het canvas. Daarnaast een "undo"-knop die de laatste stroke verwijdert. Beide knoppen zijn groot genoeg voor kindervingers maar gepositioneerd buiten het tekengebied om per-ongeluk-wissen te voorkomen.

### 4.6 Beloningssysteem

Het beloningssysteem is cruciaal voor engagement maar moet subtiel en positief zijn. Geen straffen, geen lives, geen timers.

- **Per oefening:** Korte sparkle-animatie + vrolijk geluidje bij voltooiing. De getekende letter/cijfer kleurt in met een regenboog-gradient of leuk patroon.
- **Per niveau voltooid:** Ster wordt toegevoegd aan het item in het overzicht. Confetti-burst animatie.
- **Per categorie voltooid:** Speciale celebration screen met alle voltooide items. Een "medaille" wordt ontgrendeld.
- **Collectie-element:** Een "schrift" of "boekje" waar alle voltooide tekeningen worden opgeslagen. Het kind kan erdoorheen bladeren om eerder werk te bekijken.

*Design-richtlijn: beloningen moeten aanmoedigen om door te gaan, niet om te "farmen". Houd ze kort (max 3 seconden) en laat het kind snel door naar de volgende oefening.*

### 4.7 Ouder-dashboard (Pincode-beveiligd)

- Voortgangsoverzicht per item en per niveau
- Instelling: welke categorieën/items actief zijn (om content geleidelijk vrij te geven)
- Taalinstelling (NL standaard)
- Audio aan/uit toggle
- Sessieduur-limiet (optioneel: herinnering na X minuten)
- Reset voortgang per item of volledig

---

## 5. Technische Architectuur

### 5.1 Stack

| Component | Technologie | Rationale |
|-----------|-------------|-----------|
| Framework | Next.js 14+ (App Router) | SSG voor snelle loads, React voor UI, Vercel-native |
| Canvas | HTML5 Canvas + perfect-freehand | Low-level controle, pressure support, smooth lines |
| Audio | Web Speech API (MVP) / Pre-recorded .mp3 | Geen server nodig voor TTS; fallback naar bestanden |
| State | Zustand + localStorage | Lichtgewicht, persisted state zonder backend |
| Animaties | Framer Motion | Declaratieve animaties, gesture support |
| Styling | Tailwind CSS | Utility-first, snel itereren op design |
| Hosting | Vercel | Zero-config deployment, CDN, preview URLs |
| PWA | next-pwa of handmatig manifest | Add-to-homescreen, offline caching van assets |

### 5.2 Data-model (lokaal)

Alle voortgang wordt opgeslagen in localStorage. Geen account, geen server, geen privacy-concerns. Structuur:

- **progress:** `{ [itemId]: { level1: boolean, level2: boolean, level3: boolean, attempts: number, lastAttempt: timestamp } }`
- **settings:** `{ language: 'nl', audioEnabled: true, activeCategories: ['letters', 'numbers', 'shapes'], sessionLimit: 15 }`
- **gallery:** `{ [itemId]: { dataUrl: string, timestamp: Date }[] }` – opgeslagen tekeningen als base64 canvas snapshots

### 5.3 Projectstructuur (suggestie)

```
src/
├── app/                  # Next.js App Router pages (startscherm, categorie, oefening)
├── components/           # React componenten (Canvas, ProgressGrid, RewardAnimation, AudioPlayer)
├── hooks/                # Custom hooks (useDrawing, useAudio, useProgress, useEvaluation)
├── lib/                  # Utilities (stroke-matching, path-normalization, scoring)
├── data/                 # Item-definities (letters.json, numbers.json, shapes.json)
└── stores/               # Zustand stores (progress, settings)
public/
├── audio/                # Pre-recorded audiobestanden
└── sounds/               # UI-geluidseffecten (jingles, sparkle, etc.)
```

---

## 6. Release Strategie & Fasering

### 6.1 MVP (Fase 1) – 4–6 weken

Scope: functioneel werkende app met de kernloop.

- Letters A–Z (hoofdletters) met alle drie niveaus
- Web Speech API voor audio (Nederlands)
- Basis tracing-evaluatie (proximity-based)
- Voortgang in localStorage
- Basis beloningen (sterren, geluidjes)
- iPad-geoptimaliseerd responsive design
- Vercel deployment

### 6.2 Fase 2 – +2–3 weken

- Cijfers 0–10 toevoegen
- Vormen toevoegen (12 basisvormen)
- Pre-recorded audio (ElevenLabs) ter vervanging van Web Speech API
- Verbeterde stroke-evaluatie (richting + proportie)
- Ouder-dashboard met pincode
- PWA-installatie (add to homescreen)

### 6.3 Fase 3 – +2–4 weken

- Kleine letters (a–z)
- Galerij-functie (opgeslagen tekeningen doorbladeren)
- Sessie-timer met zachte herinnering
- Woorden schrijven (eigen naam!)
- Meerdere talen (Engels, Duits)
- Optioneel: mascotte/karakter met animaties

---

## 7. Acceptatiecriteria

### 7.1 Functioneel

- Een kind van 3,5 jaar kan zonder hulp van ouder navigeren van startscherm naar een oefening en deze voltooien.
- Apple Pencil en vinger-input worden beide correct herkend en produceren vloeiende lijnen.
- Audio speelt betrouwbaar af bij elk contactmoment (item-intro, instructie, voltooiing, aanmoediging).
- Voortgang wordt correct opgeslagen en overleeft browser-refresh.
- Een tekening die "goed genoeg" is (herkenbaar als het beoogde item) wordt geaccepteerd; een willekeurige krabbel niet.

### 7.2 Performance

- First Contentful Paint <1.5s op iPad via WiFi
- Canvas-rendering op 60fps zonder dropped frames tijdens tekenen
- Geen merkbare latency tussen touch/pencil-input en lijnweergave
- Audio start binnen 200ms na trigger

### 7.3 Compatibiliteit

- Safari op iPadOS 16+ (primair)
- Chrome op iPad (secundair)
- iPhone Safari (responsive, maar niet primaire target)
- Desktop browser (alleen voor development/demo)

---

## 8. Niet in Scope (v1)

- Native iOS app (App Store)
- Gebruikersaccounts of cloud-sync
- Multiplayer of sociale features
- AI/ML-gebaseerde handschriftherkenning
- Gamification met punten, levels of leaderboards
- Cursief schrift
- Android-optimalisatie (werkt via Chrome maar niet primary target)
- Accessibility (screen reader support) – doelgroep kan niet lezen

---

## 9. Risico's & Mitigatie

| Risico | Impact | Mitigatie |
|--------|--------|----------|
| Web Speech API kwaliteit NL onvoldoende | Hoog – audio is kern | Fallback naar pre-recorded audio. Test vroeg op iPad Safari. |
| Stroke-evaluatie te streng of te soepel | Medium – frustratie of zinloosheid | Configureerbare drempels. Test met doelgroep (het kind!). Begin soepel. |
| Canvas performance op oudere iPads | Medium – laggy tekenen | Optimaliseer canvas rendering. Test op iPad Air 3 of ouder. |
| Kind verliest interesse na eerste sessie | Hoog – app wordt niet gebruikt | Variatie in beloningen. Regelmatig nieuwe content. Korte sessies. |
| localStorage vol of gewist | Laag – voortgang kwijt | Export/import functie in ouder-dashboard (JSON). PWA cache. |

---

## 10. Open Vragen voor Development Team

- Wat is de beste aanpak voor het definiëren van letter-paden? Handmatig SVG-paths of een font-based approach (bv. opentype.js om font glyphs te extraheren)?
- Moeten we `perfect-freehand` gebruiken of is een eenvoudiger quadratic Bézier smoothing voldoende voor de doelgroep?
- Hoe gaan we om met de PWA-installatie flow op iPad Safari? Service worker caching strategie?
- Is het haalbaar om canvas tekeningen als kleine thumbnails op te slaan in localStorage zonder de quota te overschrijden? Alternatief: IndexedDB?
- Welke iPad-modellen moeten we als minimum baseline nemen voor performance testing?
- Willen we haptic feedback (vibration API) inzetten bij tracing milestones? Beschikbaar in Safari?

---

## Appendix A: Visuele Referenties

Inspiratie-apps om te bestuderen voor het visuele ontwerp en de interactiepatronen:

- **Writing Wizard** (lescapadou.com) – Beste referentie voor tracing UX en sticker-rewards. Let op het gebruik van gekleurde dots als schrijfpad-gids.
- **LetterSchool** – Uitstekende 4-staps progressie per letter. De visuele beloning bij voltooiing (letter "komt tot leven") is zeer effectief.
- **Khan Academy Kids** – Referentie voor de algehele warme, uitnodigende visuele stijl en het gebruik van een begeleidend karakter.
- **Duolingo ABC** – Gamified scaffolding voorbeeld. Let op de confetti-animatie en de manier waarop moeilijkheid automatisch wordt aangepast.
- **Toca Boca apps** – Referentie voor de "minder is meer" aanpak: geen tekst, geen punten, geen timers. Pure exploratie.

## Appendix B: Audio Script-structuur

Elke letter/cijfer/vorm heeft een set audio-snippets nodig. Voorbeeld voor de letter A:

- `intro.mp3`: "Dit is de letter A. A is van Aap!"
- `level1_instruction.mp3`: "Trek de letter A na over de stipjes!"
- `level2_instruction.mp3`: "Kijk goed naar de A en schrijf hem zelf!"
- `level3_instruction.mp3`: "Kun je een A tekenen?"
- `success.mp3`: "Super! Dat is de letter A!"
- `encouragement.mp3`: "Bijna! Probeer het nog een keer!"
- `completion.mp3`: "Wauw, je hebt de A helemaal geleerd!"

*Totaal per item: ~7 audio-bestanden. Totaal voor MVP (26 letters): ~182 bestanden + ~20 generieke UI-geluiden.*
