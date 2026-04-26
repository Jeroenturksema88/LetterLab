'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useVoortgangStore } from '@/stores/voortgang-store';
import { useInstellingenStore } from '@/stores/instellingen-store';
import { useProfielStore } from '@/stores/profiel-store';
import TerugKnop from '@/components/navigatie/TerugKnop';
import lettersData from '@/data/letters.json';
import cijfersData from '@/data/cijfers.json';
import vormenData from '@/data/vormen.json';
import type { ItemDef } from '@/types';

const letters = lettersData as ItemDef[];
const cijfers = cijfersData as ItemDef[];
const vormen = vormenData as ItemDef[];

export default function OuderDashboard() {
  const router = useRouter();
  const [pinInvoer, setPinInvoer] = useState('');
  const [ontgrendeld, setOntgrendeld] = useState(false);
  const [pinFout, setPinFout] = useState(false);

  const { pincode, audioAan, sessieLimiet, updateInstellingen, evaluatie, dominanteHand } = useInstellingenStore();
  const { items, aantalSterren, resetItem, resetAlles } = useVoortgangStore();
  const { naam, geslacht, profielIngesteld, reset: resetProfiel } = useProfielStore();

  // Pincode-wijzigen state. Gebruikt drie 4-cijfer invoervelden: huidig,
  // nieuw, bevestigen. Validatie loopt via de wijzig-handler.
  const [pwHuidig, setPwHuidig] = useState('');
  const [pwNieuw, setPwNieuw] = useState('');
  const [pwBevestig, setPwBevestig] = useState('');
  const [pwFout, setPwFout] = useState<null | 'huidig' | 'mismatch' | 'kort'>(null);
  const [pwSucces, setPwSucces] = useState(false);

  const wijzigPincode = () => {
    setPwSucces(false);
    if (pwHuidig !== pincode) {
      setPwFout('huidig');
      return;
    }
    if (pwNieuw.length !== 4) {
      setPwFout('kort');
      return;
    }
    if (pwNieuw !== pwBevestig) {
      setPwFout('mismatch');
      return;
    }
    updateInstellingen({ pincode: pwNieuw });
    setPwHuidig('');
    setPwNieuw('');
    setPwBevestig('');
    setPwFout(null);
    setPwSucces(true);
    // Verberg succes-melding na 3 seconden
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

  const voortgangOverzicht = useMemo(() => {
    const berekenCat = (catItems: ItemDef[]) => {
      let voltooid = 0;
      catItems.forEach((item) => {
        if (aantalSterren(item.id) === 3) voltooid++;
      });
      return { voltooid, totaal: catItems.length };
    };
    return {
      letters: berekenCat(letters),
      cijfers: berekenCat(cijfers),
      vormen: berekenCat(vormen),
    };
  }, [items, aantalSterren]);

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
                  ? pinFout
                    ? 'bg-red-400'
                    : 'bg-letter-kleur'
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
                if (cijfer === '←') {
                  setPinInvoer((prev) => prev.slice(0, -1));
                } else if (cijfer) {
                  handlePinInvoer(cijfer);
                }
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
        {/* Voortgang */}
        <section className="bg-white rounded-kind p-6 shadow-md">
          <h3 className="text-lg font-bold mb-4">Voortgang</h3>
          <div className="space-y-3">
            {[
              { naam: 'Letters', data: voortgangOverzicht.letters, kleur: 'bg-letter-kleur' },
              { naam: 'Cijfers', data: voortgangOverzicht.cijfers, kleur: 'bg-cijfer-kleur' },
              { naam: 'Vormen', data: voortgangOverzicht.vormen, kleur: 'bg-vorm-kleur' },
            ].map(({ naam, data, kleur }) => (
              <div key={naam}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-semibold">{naam}</span>
                  <span className="text-gray-500">{data.voltooid}/{data.totaal}</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${kleur} rounded-full transition-all duration-500`}
                    style={{ width: `${(data.voltooid / data.totaal) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Instellingen */}
        <section className="bg-white rounded-kind p-6 shadow-md">
          <h3 className="text-lg font-bold mb-4">Instellingen</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Audio</span>
              <button
                onClick={() => updateInstellingen({ audioAan: !audioAan })}
                className={`w-14 h-8 rounded-full transition-colors ${
                  audioAan ? 'bg-succes' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`w-6 h-6 bg-white rounded-full shadow transition-transform ${
                    audioAan ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span>Sessielimiet (min)</span>
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
            </div>

            <div className="flex items-center justify-between">
              <span>Schrijfhand</span>
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
            </div>

            <div>
              <span className="block mb-2">Evaluatie-drempels</span>
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

            <div className="flex items-center justify-between">
              <span>Wachttijd voor auto-evaluatie</span>
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
            </div>
          </div>
        </section>

        {/* Profiel */}
        <section className="bg-white rounded-kind p-6 shadow-md">
          <h3 className="text-lg font-bold mb-4">Profiel</h3>
          {profielIngesteld ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span>Naam</span>
                <span className="font-semibold">{naam}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Geslacht</span>
                <span className="font-semibold">{geslacht === 'jongen' ? '👦' : '👧'}</span>
              </div>
              <button
                onClick={() => router.push('/profiel')}
                className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg font-semibold hover:bg-blue-200 transition-colors"
              >
                Profiel wijzigen
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

        {/* Pincode wijzigen — toegankelijk wanneer ouder is ingelogd */}
        <section className="bg-white rounded-kind p-6 shadow-md">
          <h3 className="text-lg font-bold mb-4">Pincode wijzigen</h3>
          <div className="space-y-4">
            <PincodeVeld
              label="Huidige pincode"
              waarde={pwHuidig}
              setWaarde={(v) => {
                setPwHuidig(v);
                setPwFout(null);
                setPwSucces(false);
              }}
              foutief={pwFout === 'huidig'}
            />
            <PincodeVeld
              label="Nieuwe pincode (4 cijfers)"
              waarde={pwNieuw}
              setWaarde={(v) => {
                setPwNieuw(v);
                setPwFout(null);
                setPwSucces(false);
              }}
              foutief={pwFout === 'mismatch' || pwFout === 'kort'}
            />
            <PincodeVeld
              label="Bevestig nieuwe pincode"
              waarde={pwBevestig}
              setWaarde={(v) => {
                setPwBevestig(v);
                setPwFout(null);
                setPwSucces(false);
              }}
              foutief={pwFout === 'mismatch'}
            />

            {pwFout && (
              <div className="text-sm text-red-600 font-medium">
                {pwFout === 'huidig' && 'Huidige pincode is onjuist'}
                {pwFout === 'kort' && 'Nieuwe pincode moet 4 cijfers zijn'}
                {pwFout === 'mismatch' && 'Nieuwe pincodes komen niet overeen'}
              </div>
            )}
            {pwSucces && (
              <div className="text-sm text-green-600 font-medium">
                ✓ Pincode is gewijzigd
              </div>
            )}

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
                if (confirm('Weet je zeker dat je alle voortgang wilt resetten?')) {
                  resetAlles();
                }
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
    </div>
  );
}

// Compact 4-cijfer pincode-invoerveld met masked-display, only-digits-filter
// en visuele fout-indicatie. autoComplete="new-password" voorkomt dat browsers
// hier pincodes uit andere sites invullen.
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
