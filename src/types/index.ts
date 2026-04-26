// types/index.ts — Type-definities voor LetterLab

export type Categorie = 'letters' | 'cijfers' | 'vormen';
export type Niveau = 'overtrekken' | 'naschrijven' | 'zelfstandig';
// Dominante hand van het kind. Bepaalt of bij naschrijven het voorbeeld
// links of rechts staat — voor een linkshandig kind staat het voorbeeld rechts
// zodat de tekenende hand het niet bedekt.
export type DominanteHand = 'links' | 'rechts';
export type AudioType =
  | 'intro'
  | 'niveau1_instructie'
  | 'niveau2_instructie'
  | 'niveau3_instructie'
  | 'succes'
  | 'aanmoediging'
  | 'voltooiing';
export type FeedbackType = 'succes' | 'aanmoediging';

export interface Punt {
  x: number;
  y: number;
}

export interface TekenPunt extends Punt {
  druk: number;
  tijdstempel: number;
}

export interface BoundingBox {
  x: number;
  y: number;
  breedte: number;
  hoogte: number;
}

export interface StreekDef {
  startPunt: Punt;
  eindPunt: Punt;
  tussenPunten: Punt[];
  padData: string;
}

export interface ItemDef {
  id: string;
  categorie: Categorie;
  label: string;
  paden: string[];
  streken: StreekDef[];
  boundingBox: BoundingBox;
  kleur: string;
}

export interface ItemVoortgang {
  niveau1: boolean;
  niveau2: boolean;
  niveau3: boolean;
  pogingen: number;
  laatstePoging: number | null;
}

export interface VoortgangState {
  items: Record<string, ItemVoortgang>;
  markeerVoltooid: (itemId: string, niveau: Niveau) => void;
  registreerPoging: (itemId: string) => void;
  resetItem: (itemId: string) => void;
  resetAlles: () => void;
  huidigNiveau: (itemId: string) => Niveau;
  isVoltooid: (itemId: string, niveau: Niveau) => boolean;
  aantalSterren: (itemId: string) => number;
}

export interface EvaluatieInstellingen {
  overtrekDrempel: number;
  naschrijfDrempel: number;
  freehandDrempel: number;
  proximityMarge: number;
  inactiviteitTimeout: number;
}

export interface Instellingen {
  taal: 'nl' | 'en' | 'de';
  audioAan: boolean;
  actieveCategorieen: Categorie[];
  sessieLimiet: number;
  pincode: string;
  dominanteHand: DominanteHand;
  evaluatie: EvaluatieInstellingen;
}

export interface InstellingenState extends Instellingen {
  updateInstellingen: (deels: Partial<Instellingen>) => void;
  resetInstellingen: () => void;
}

export interface OvertrekResultaat {
  type: 'overtrekken';
  dekking: number;
  // Minimale dekking over alle segmenten — vangt het geval dat één deel
  // van het pad keurig overgetrokken is en de rest leeg.
  minSegmentDekking: number;
  geslaagd: boolean;
  feedback: FeedbackType;
}

export interface SimilarityResultaat {
  type: 'naschrijven' | 'zelfstandig';
  score: number;
  geslaagd: boolean;
  feedback: FeedbackType;
  details: {
    proportieScore: number;
    richtingScore: number;
    chamferScore: number;
    overlapScore: number;
  };
}

export type EvaluatieResultaat = OvertrekResultaat | SimilarityResultaat;

export interface GalerijItem {
  itemId: string;
  categorie: Categorie;
  niveau: Niveau;
  afbeelding: string;
  tijdstempel: number;
  sterren: number;
}

export interface AudioScripts {
  intro: string;
  niveau1_instructie: string;
  niveau2_instructie: string;
  niveau3_instructie: string;
  succes: string;
  aanmoediging: string;
  voltooiing: string;
}

export interface AlleAudioScripts {
  letters: Record<string, AudioScripts>;
  cijfers: Record<string, AudioScripts>;
  vormen: Record<string, AudioScripts>;
  generiek: Record<string, string>;
}

export interface TekenCanvasProps {
  item: ItemDef;
  niveau: Niveau;
  kleur: string;
  onStreekKlaar: (punten: TekenPunt[]) => void;
  onWis: () => void;
  onOngedaanMaken: () => void;
}

export interface TemplateCanvasProps {
  item: ItemDef;
  niveau: Niveau;
  zichtbaar: boolean;
}

export type BeloningType = 'sparkle' | 'ster' | 'confetti' | 'medaille' | 'regenboog';

export interface BeloningConfig {
  type: BeloningType;
  duur: number;
  geluid: string;
}
