'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useVoortgangStore } from '@/stores/voortgang-store';
import { useInstellingenStore } from '@/stores/instellingen-store';
import { useProfielStore } from '@/stores/profiel-store';
import TerugKnop from '@/components/navigatie/TerugKnop';
import OuderTour from '@/components/ouder/OuderTour';
import { AvatarSilhouet, AVATAR_KLEUREN } from '@/components/avatars/AvatarSilhouet';
import { haalCategorieConfig } from '@/lib/categorie-registry';
import lettersData from '@/data/letters.json';
import cijfersData from '@/data/cijfers.json';
import vormenData from '@/data/vormen.json';
import type { Categorie, ItemDef } from '@/types';

const letters = lettersData as ItemDef[];
const cijfers = cijfersData as ItemDef[];
const vormen = vormenData as ItemDef[];

export default function OuderDashboard() {
  const router = useRouter();
  const [pinInvoer, setPinInvoer] = useState('');
  const [ontgrendeld, setOntgrendeld] = useState(false);
  const [pinFout, setPinFout] = useState(false);

  const { pincode, audioAan, sessieLimiet, updateInstellingen, evaluatie, dominanteHand, letterStijl } = useInstellingenStore();
  const { items, aantalSterren, resetAlles } = useVoortgangStore();
  const { naam, avatar, profielIngesteld, reset: resetProfiel } = useProfielStore();

  // Pincode-wijzigen state
  const [pwHuidig, setPwHuidig] = useState('');
  const [pwNieuw, setPwNieuw] = useState('');
  const [pwBevestig, setPwBevestig] = useState('');
  const [pwFout, setPwFout] = useState<null | 'huidig' | 'mismatch' | 'kort'>(null);
  const [pwSucces, setPwSucces] = useState(false);

  // Welke categorie is uitgeklapt voor drill-down? Eén tegelijk om scroll te beperken.
  const [uitgeklapt, setUitgeklapt] = useState<Categorie | null>(null);

  const wijzigPincode = () => {
    setPwSucces(false);
    if (pwHuidig !== pincode) { setPwFout('huidig'); return; }
    if (pwNieuw.length !== 4) { setPwFout('kort'); return; }
    if (pwNieuw !== pwBevestig) { setPwFout('mismatch'); return; }
    updateInstellingen({ pincode: pwNieuw });
    setPwHuidig(''); setPwNieuw(''); setPwBevestig('');
    setPwFout(null);
    setPwSucces(true);
    setTimeout(() => setPwSucces(false), 3000);
  };

  const pwCompleet =
    pwHuidig.length === 4 && pwNieuw.length === 4 && pwBevestig.length === 4;

  const handlePinInvoer = (cijfer: string) => {
    const nieuwePinInvoer = pinInvoer + cijfer;
    setPinInvoer(nieuwePinInvoer);
    setPinFout(false);

    if (nieuwePinInvoer.length === 4) {
      if (nieuwePinInvoer === pincode) {
        setOntgrendeld(true);
      } else {
        setPinFout(true);
        setTimeout(() => {
          setPinInvoer('');
          setPinFout(false);
        }, 1000);
      }
    }
  };

  const voortgangData = useMemo(() => ({
    letters: { items: letters, voltooid: letters.filter((l) => aantalSterren(l.id) === 3).length },
    cijfers: { items: cijfers, voltooid: cijfers.filter((c) => aantalSterren(c.id) === 3).length },
    vormen: { items: vormen, voltooid: vormen.filter((v) => aantalSterren(v.id) === 3).length },
  }), [items, aantalSterren]);

  if (!ontgrendeld) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-6 p-8">
        <TerugKnop href="/" />
        <h2 className="text-2xl font-bold text-gray-600">Ouder Dashboard</h2>
        <p className="text-gray-500">Voer de pincode in</p>

        <div className="flex gap-3 mb-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full ${
                i < pinInvoer.length
                  ? pinFout ? 'bg-red-400' : 'bg-letter-kleur'
                  : 'bg-gray-200'
              } transition-colors`}
            />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '←'].map((cijfer) => (
            <button
              key={cijfer}
              onClick={() => {
                if (cijfer === '←') setPinInvoer((prev) => prev.slice(0, -1));
                else if (cijfer) handlePinInvoer(cijfer);
              }}
              className={`w-16 h-16 rounded-2xl text-2xl font-bold flex items-center justify-center ${
                cijfer ? 'bg-white shadow-md active:bg-gray-100' : ''
              }`}
              disabled={!cijfer || pinInvoer.length >= 4}
            >
              {cijfer}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-y-auto">
      <div className="flex items-center gap-4 px-4 py-3 bg-white/50 sticky top-0 z-10">
        <TerugKnop href="/" />
        <h2 className="text-2xl font-bold text-gray-600">Ouder Dashboard</h2>
      </div>

      <div className="p-6 space-y-6 max-w-2xl mx-auto w-full">
        {/* Voortgang met drill-down per categorie */}
        <section className="bg-white rounded-kind p-6 shadow-md">
          <h3 className="text-lg font-bold mb-4">Voortgang</h3>
          <div className="space-y-3">
            {(['letters', 'cijfers', 'vormen'] as Categorie[]).map((cat) => {
              const data = voortgangData[cat];
              const config = haalCategorieConfig(cat, letterStijl);
              const isOpen = uitgeklapt === cat;
              const naamLabel = cat.charAt(0).toUpperCase() + cat.slice(1);
              return (
                <div key={cat}>
                  <button
                    onClick={() => setUitgeklapt(isOpen ? null : cat)}
                    className="w-full text-left"
                    aria-expanded={isOpen}
                  >
                    <div className="flex justify-between items-center text-sm mb-1.5">
                      <div className="flex items-center gap-2">
                        <motion.div
                          animate={{ rotate: isOpen ? 90 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2.5" strokeLinecap="round">
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                        </motion.div>
                        <span className="font-semibold">{naamLabel}</span>
                      </div>
                      <span className="text-gray-500">{data.voltooid}/{data.items.length}</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${(data.voltooid / data.items.length) * 100}%`,
                          backgroundColor: config.hoofdkleur,
                        }}
                      />
                    </div>
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-3 pb-1 grid grid-cols-7 sm:grid-cols-8 gap-1.5">
                          {data.items.map((item) => {
                            const sterren = aantalSterren(item.id);
                            return (
                              <button
                                key={item.id}
                                onClick={() => router.push(`${config.routePrefix}/${item.id}`)}
                                className="aspect-square rounded-lg flex flex-col items-center justify-center p-1 transition-colors"
                                style={{
                                  backgroundColor: sterren === 3 ? `${config.hoofdkleur}20` : '#F3F4F6',
                                  border: sterren === 3 ? `1.5px solid ${config.hoofdkleur}` : '1.5px solid transparent',
                                }}
                                aria-label={`${item.label} — ${sterren} van 3 sterren`}
                              >
                                <svg
                                  viewBox={`${item.boundingBox.x} ${item.boundingBox.y} ${item.boundingBox.breedte} ${item.boundingBox.hoogte}`}
                                  className="w-6 h-6"
                                >
                                  {item.paden.map((pad, i) => (
                                    <path
                                      key={i}
                                      d={pad}
                                      stroke={config.hoofdkleur}
                                      strokeWidth="10"
                                      fill="none"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  ))}
                                </svg>
                                <div className="flex gap-0.5 mt-0.5">
                                  {[0, 1, 2].map((i) => (
                                    <div
                                      key={i}
                                      className="w-1 h-1 rounded-full"
                                      style={{
                                        backgroundColor: i < sterren ? '#EAB308' : '#D1D5DB',
                                      }}
                                    />
                                  ))}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>

        {/* Instellingen met tooltips */}
        <section className="bg-white rounded-kind p-6 shadow-md">
          <h3 className="text-lg font-bold mb-4">Instellingen</h3>
          <div className="space-y-4">
            <InstellingRij
              label="Audio"
              tooltip="Schakelt alle gesproken instructies en feedback aan of uit."
            >
              <button
                onClick={() => updateInstellingen({ audioAan: !audioAan })}
                className={`w-14 h-8 rounded-full transition-colors ${audioAan ? 'bg-succes' : 'bg-gray-300'}`}
              >
                <div
                  className={`w-6 h-6 bg-white rounded-full shadow transition-transform ${
                    audioAan ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </InstellingRij>

            <InstellingRij
              label="Sessielimiet (min)"
              tooltip="Na deze tijd verschijnt een 'klaar voor vandaag' scherm. Doorgaan kan alleen via de pincode. Kies 'onbeperkt' om uit te schakelen."
            >
              <select
                value={sessieLimiet}
                onChange={(e) => updateInstellingen({ sessieLimiet: Number(e.target.value) })}
                className="border rounded-lg px-3 py-1"
              >
                <option value={0}>Onbeperkt</option>
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={20}>20</option>
                <option value={30}>30</option>
              </select>
            </InstellingRij>

            <InstellingRij
              label="Schrijfhand"
              tooltip="Voor linkshandige kinderen wisselt de naschrijven-layout: voorbeeld komt rechts, canvas links. Zo bedekt de tekenende hand het voorbeeld niet."
            >
              <div className="flex gap-2">
                {(['links', 'rechts'] as const).map((hand) => (
                  <button
                    key={hand}
                    onClick={() => updateInstellingen({ dominanteHand: hand })}
                    className={`px-4 py-1.5 rounded-lg font-semibold text-sm transition-colors ${
                      dominanteHand === hand
                        ? hand === 'links'
                          ? 'bg-violet-100 text-violet-700 border-2 border-violet-400'
                          : 'bg-emerald-100 text-emerald-700 border-2 border-emerald-400'
                        : 'bg-gray-50 text-gray-500 border-2 border-transparent'
                    }`}
                  >
                    {hand === 'links' ? '🤚 Links' : 'Rechts ✋'}
                  </button>
                ))}
              </div>
            </InstellingRij>

            <InstellingRij
              label="Letter-stijl"
              tooltip="Blok = klassieke hoekige hoofdletters (goed voor 3-5j herkenning). Schoolschrift = aanleerletters met afgeronde curves zoals NL groep 1-3 leren schrijven (sluit aan bij methode Pennenstreken/Schrijfsleutel)."
            >
              <div className="flex gap-2">
                {(['blok', 'schoolschrift'] as const).map((stijl) => (
                  <button
                    key={stijl}
                    onClick={() => updateInstellingen({ letterStijl: stijl })}
                    className={`px-4 py-1.5 rounded-lg font-semibold text-sm transition-colors ${
                      letterStijl === stijl
                        ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-400'
                        : 'bg-gray-50 text-gray-500 border-2 border-transparent'
                    }`}
                  >
                    {stijl === 'blok' ? 'Blok' : 'Schoolschrift'}
                  </button>
                ))}
              </div>
            </InstellingRij>

            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <span>Evaluatie-drempels</span>
                <TooltipKnop tekst="Hoe streng de app de tekening beoordeelt. Lager = makkelijker geslaagd. Bij herhaald falen wordt de drempel automatisch tijdelijk verlaagd." />
              </div>
              <div className="space-y-2 text-sm">
                {[
                  { label: 'Overtrekken', key: 'overtrekDrempel' as const, waarde: evaluatie.overtrekDrempel },
                  { label: 'Naschrijven', key: 'naschrijfDrempel' as const, waarde: evaluatie.naschrijfDrempel },
                  { label: 'Zelfstandig', key: 'freehandDrempel' as const, waarde: evaluatie.freehandDrempel },
                ].map(({ label, key, waarde }) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-gray-600">{label}</span>
                    <input
                      type="range"
                      min="0.1"
                      max="0.9"
                      step="0.05"
                      value={waarde}
                      onChange={(e) =>
                        updateInstellingen({
                          evaluatie: { ...evaluatie, [key]: parseFloat(e.target.value) },
                        })
                      }
                      className="w-32"
                    />
                    <span className="w-12 text-right">{Math.round(waarde * 100)}%</span>
                  </div>
                ))}
              </div>
            </div>

            <InstellingRij
              label="Wachttijd auto-evaluatie"
              tooltip="Hoe lang de app wacht na de laatste streek voordat hij automatisch beoordeelt. 10 seconden is ruim voor een 3,5-jarige die even nadenkt."
            >
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="3000"
                  max="20000"
                  step="1000"
                  value={evaluatie.inactiviteitTimeout}
                  onChange={(e) =>
                    updateInstellingen({
                      evaluatie: { ...evaluatie, inactiviteitTimeout: parseInt(e.target.value, 10) },
                    })
                  }
                  className="w-32"
                />
                <span className="w-12 text-right text-sm text-gray-600">
                  {Math.round(evaluatie.inactiviteitTimeout / 1000)}s
                </span>
              </div>
            </InstellingRij>
          </div>
        </section>

        {/* Profiel — toon avatar i.p.v. geslacht */}
        <section className="bg-white rounded-kind p-6 shadow-md">
          <h3 className="text-lg font-bold mb-4">Profiel</h3>
          {profielIngesteld ? (
            <div className="flex items-center gap-4">
              {avatar && (
                <div
                  className="rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{
                    width: 64,
                    height: 64,
                    background: AVATAR_KLEUREN[avatar].achtergrond,
                  }}
                >
                  <AvatarSilhouet
                    avatar={avatar}
                    hoofdkleur={AVATAR_KLEUREN[avatar].hoofd}
                    accentDonker={AVATAR_KLEUREN[avatar].donker}
                    accentLicht={AVATAR_KLEUREN[avatar].licht}
                    grootte={48}
                  />
                </div>
              )}
              <div className="flex-1">
                <div className="text-sm text-gray-500">Naam</div>
                <div className="font-semibold text-lg">{naam}</div>
              </div>
              <button
                onClick={() => router.push('/profiel')}
                className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg font-semibold hover:bg-blue-200 transition-colors"
              >
                Wijzigen
              </button>
            </div>
          ) : (
            <button
              onClick={() => router.push('/profiel')}
              className="px-4 py-2 bg-green-100 text-green-600 rounded-lg font-semibold hover:bg-green-200 transition-colors"
            >
              Profiel instellen
            </button>
          )}
        </section>

        {/* Pincode wijzigen */}
        <section className="bg-white rounded-kind p-6 shadow-md">
          <div className="flex items-center gap-1.5 mb-4">
            <h3 className="text-lg font-bold">Pincode wijzigen</h3>
            <TooltipKnop tekst="De pincode beveiligt dit dashboard zodat je kind het niet zelf kan openen. Standaard is 1234 — verander hem!" />
          </div>
          <div className="space-y-4">
            <PincodeVeld
              label="Huidige pincode"
              waarde={pwHuidig}
              setWaarde={(v) => { setPwHuidig(v); setPwFout(null); setPwSucces(false); }}
              foutief={pwFout === 'huidig'}
            />
            <PincodeVeld
              label="Nieuwe pincode (4 cijfers)"
              waarde={pwNieuw}
              setWaarde={(v) => { setPwNieuw(v); setPwFout(null); setPwSucces(false); }}
              foutief={pwFout === 'mismatch' || pwFout === 'kort'}
            />
            <PincodeVeld
              label="Bevestig nieuwe pincode"
              waarde={pwBevestig}
              setWaarde={(v) => { setPwBevestig(v); setPwFout(null); setPwSucces(false); }}
              foutief={pwFout === 'mismatch'}
            />

            {pwFout && (
              <div className="text-sm text-red-600 font-medium">
                {pwFout === 'huidig' && 'Huidige pincode is onjuist'}
                {pwFout === 'kort' && 'Nieuwe pincode moet 4 cijfers zijn'}
                {pwFout === 'mismatch' && 'Nieuwe pincodes komen niet overeen'}
              </div>
            )}
            {pwSucces && <div className="text-sm text-green-600 font-medium">✓ Pincode is gewijzigd</div>}

            <button
              onClick={wijzigPincode}
              disabled={!pwCompleet}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                pwCompleet
                  ? 'bg-letter-kleur text-white hover:opacity-90'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              Wijzigen
            </button>
          </div>
        </section>

        {/* Reset */}
        <section className="bg-white rounded-kind p-6 shadow-md">
          <h3 className="text-lg font-bold mb-4">Reset</h3>
          <div className="space-y-3">
            <button
              onClick={() => {
                if (confirm('Weet je zeker dat je alle voortgang wilt resetten?')) resetAlles();
              }}
              className="px-4 py-2 bg-red-100 text-red-600 rounded-lg font-semibold hover:bg-red-200 transition-colors"
            >
              Alle voortgang resetten
            </button>
            <button
              onClick={() => {
                if (confirm('Profiel en voortgang resetten?')) {
                  resetAlles();
                  resetProfiel();
                }
              }}
              className="px-4 py-2 bg-red-100 text-red-600 rounded-lg font-semibold hover:bg-red-200 transition-colors ml-2"
            >
              Alles resetten (incl. profiel)
            </button>
          </div>
        </section>
      </div>

      {/* Eerste-keer onboarding tour — toont zichzelf alleen wanneer
          dashboardTourGezien false is in store. */}
      <OuderTour />
    </div>
  );
}

// --- Helper componenten ---

// Eén-regel instelling met label, tooltip-button, en de control rechts.
function InstellingRij({
  label,
  tooltip,
  children,
}: {
  label: string;
  tooltip?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1.5">
        <span>{label}</span>
        {tooltip && <TooltipKnop tekst={tooltip} />}
      </div>
      {children}
    </div>
  );
}

// Tap-toggle tooltip (geen hover want we mikken op iPad). Pop-over verschijnt
// onder de knop; tap weg om te sluiten.
function TooltipKnop({ tekst }: { tekst: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative inline-block">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="w-5 h-5 rounded-full bg-gray-200 text-gray-600 text-xs font-bold flex items-center justify-center hover:bg-gray-300 transition-colors"
        aria-label="Uitleg"
      >
        ⓘ
      </button>
      <AnimatePresence>
        {open && (
          <>
            {/* Achtergrond-tap om te sluiten */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />
            <motion.div
              className="absolute z-50 top-7 right-0 bg-gray-800 text-white text-xs rounded-lg p-3 shadow-xl"
              style={{ width: 240 }}
              initial={{ opacity: 0, y: -5, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -5, scale: 0.95 }}
              transition={{ duration: 0.15 }}
            >
              {tekst}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Compact 4-cijfer pincode-invoerveld
function PincodeVeld({
  label,
  waarde,
  setWaarde,
  foutief,
}: {
  label: string;
  waarde: string;
  setWaarde: (v: string) => void;
  foutief?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-sm text-gray-600">{label}</label>
      <input
        type="password"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={4}
        value={waarde}
        onChange={(e) => setWaarde(e.target.value.replace(/\D/g, '').slice(0, 4))}
        placeholder="● ● ● ●"
        autoComplete="new-password"
        className={`w-32 text-center text-xl font-bold tracking-widest rounded-lg px-3 py-2 border-2 transition-colors ${
          foutief
            ? 'border-red-400 bg-red-50 text-red-700'
            : 'border-gray-200 bg-white focus:border-letter-kleur'
        } focus:outline-none`}
      />
    </div>
  );
}
