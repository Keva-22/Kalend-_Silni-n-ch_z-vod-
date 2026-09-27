import { useEffect, useMemo, useState } from "react";
import type { Zavod } from "../types";
import { ZAVODY } from "../data/zavody";
import { klicMesice, porovnejZavody } from "../ui";
import { TEXTY, lokalizujZavod } from "../i18n";
import {
  PRIHLASKY_ZAPNUTE,
  dnesniDatum,
  jeBudouci,
  odkazNaFormular,
  stahniPrihlasky,
  type Odvoz,
  type Prihlaska,
} from "../prihlasky";

/* Stránka „Wer fährt mit?" — jen německy. Zobrazuje schválené přihlášky
   u závodů, které se teprve pojedou, a u každého odkaz na formulář. */

const DE = TEXTY.de;

const ODVOZ: Record<Odvoz, string> = {
  nabizi: "bietet Mitfahrt",
  hleda: "sucht Mitfahrt",
  vyreseno: "Anreise geklärt",
};

type Stav = "vypnuto" | "nacitam" | "hotovo" | "chyba";

export function Prihlasky({ cilovyZavod }: { cilovyZavod: string | null }) {
  const [stav, setStav] = useState<Stav>(PRIHLASKY_ZAPNUTE ? "nacitam" : "vypnuto");
  const [prihlasky, setPrihlasky] = useState<Prihlaska[]>([]);
  const [chyba, setChyba] = useState("");
  const [pokus, setPokus] = useState(0);

  /* Budoucí závody se zobrazují; ke všem se přiřazují přihlášky, aby
     přihláška k už odjetému závodu zmizela, místo aby skončila mezi
     nepřiřazenými. Budoucí jsou první, takže shoda podle názvu vybere
     nadcházející ročník. */
  const { zavody, proPrirazeni } = useMemo(() => {
    const dnes = dnesniDatum();
    const vsechny = ZAVODY.map((z) => lokalizujZavod(z, "de"));
    const budouci = vsechny.filter((z) => jeBudouci(z, dnes)).sort(porovnejZavody);
    const minule = vsechny.filter((z) => !jeBudouci(z, dnes));
    return { zavody: budouci, proPrirazeni: [...budouci, ...minule] };
  }, []);

  useEffect(() => {
    if (!PRIHLASKY_ZAPNUTE) return;
    let zruseno = false;
    setStav("nacitam");
    stahniPrihlasky(proPrirazeni)
      .then((data) => {
        if (zruseno) return;
        setPrihlasky(data);
        setStav("hotovo");
      })
      .catch((e: unknown) => {
        if (zruseno) return;
        setChyba(e instanceof Error ? e.message : String(e));
        setStav("chyba");
      });
    return () => {
      zruseno = true;
    };
  }, [proPrirazeni, pokus]);

  useEffect(() => {
    if (stav === "hotovo" && cilovyZavod) {
      document.getElementById(`mitfahren-${cilovyZavod}`)?.scrollIntoView();
    }
  }, [stav, cilovyZavod]);

  const podleZavodu = useMemo(() => {
    const m = new Map<string, Prihlaska[]>();
    for (const p of prihlasky) {
      if (!p.zavodId) continue;
      m.set(p.zavodId, [...(m.get(p.zavodId) ?? []), p]);
    }
    return m;
  }, [prihlasky]);
  const neprirazene = prihlasky.filter((p) => !p.zavodId);

  const mesice = useMemo(() => {
    const skupiny = new Map<string, Zavod[]>();
    for (const z of zavody) {
      const k = klicMesice(z);
      skupiny.set(k, [...(skupiny.get(k) ?? []), z]);
    }
    return [...skupiny.entries()];
  }, [zavody]);

  return (
    <div className="obal" lang="de">
      <header className="hlavicka">
        <a className="zpet" href="#">
          ← Zum Kalender
        </a>
        <h1>
          Wer fährt mit?
          <br />
          <span className="tlumene">Anmeldungen</span>
        </h1>
        <p>
          Trag dich für ein Rennen ein, damit die anderen wissen, dass du dabei
          bist — gern mit Tempo und ob du eine Mitfahrgelegenheit hast oder
          suchst. Einträge erscheinen erst, nachdem sie freigegeben wurden.
        </p>
      </header>

      {stav === "vypnuto" && (
        <div className="prazdno">
          <p>Die Anmeldung ist noch nicht freigeschaltet. Schau bald wieder vorbei.</p>
        </div>
      )}

      {stav === "nacitam" && (
        <div className="prazdno">
          <p>Anmeldungen werden geladen …</p>
        </div>
      )}

      {stav === "chyba" && (
        <div className="prazdno">
          <p>Die Anmeldungen konnten nicht geladen werden.</p>
          <p className="pr-chyba">{chyba}</p>
          <button className="prepinac aktivni" onClick={() => setPokus((n) => n + 1)}>
            Erneut versuchen
          </button>
        </div>
      )}

      {stav === "hotovo" &&
        mesice.map(([klic, zavodyMesice]) => (
          <section key={klic}>
            <div className="mesic-hlava">
              {/* stránka sahá přes dvě sezóny, proto i s rokem */}
              <h2>
                {DE.mesice[Number(klic.slice(5)) - 1]} {klic.slice(0, 4)}
              </h2>
              <div className="cara" />
              <span className="pocet">{DE.pocetZavodu(zavodyMesice.length)}</span>
            </div>
            <div className="seznam">
              {zavodyMesice.map((z) => (
                <ZavodSPrihlaskami
                  key={z.id}
                  zavod={z}
                  prihlasky={podleZavodu.get(z.id) ?? []}
                  cil={z.id === cilovyZavod}
                />
              ))}
            </div>
          </section>
        ))}

      {stav === "hotovo" && neprirazene.length > 0 && (
        <section>
          <div className="mesic-hlava">
            <h2>Weitere Anmeldungen</h2>
            <div className="cara" />
          </div>
          <div className="seznam">
            <div className="pr-zavod">
              <ul className="pr-seznam">
                {neprirazene.map((p, i) => (
                  <Ucastnik key={i} p={p} sZavodem />
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      <p className="poznamka">
        Mit der Anmeldung erscheinen dein Name und deine Angaben nach der
        Freigabe öffentlich auf dieser Seite. Gib deshalb nur an, was alle sehen
        dürfen — Vorname und Initial reichen.
      </p>
    </div>
  );
}

function ZavodSPrihlaskami({
  zavod,
  prihlasky,
  cil,
}: {
  zavod: Zavod;
  prihlasky: Prihlaska[];
  cil: boolean;
}) {
  const datum = zavod.datum ? new Date(zavod.datum + "T12:00:00") : null;
  return (
    <div className={"pr-zavod" + (cil ? " pr-zavod--cil" : "")} id={`mitfahren-${zavod.id}`}>
      <div className="pr-hlava">
        <div className="radek-datum">
          {datum ? (
            <>
              <div className="radek-den">{datum.getDate()}</div>
              <div className="radek-den-tydne">{DE.dnyZkratky[datum.getDay()]}</div>
            </>
          ) : (
            <div className="radek-tbc">{DE.tbc}</div>
          )}
        </div>
        <div className="radek-stred">
          <div className="radek-titulek">
            <span className="radek-nazev">{zavod.nazev}</span>
            <span className="odznak">{zavod.zeme}</span>
            {zavod.format === "time-trial" && (
              <span className="odznak odznak--casovka">{DE.casovka}</span>
            )}
          </div>
          <div className="radek-misto">
            {zavod.misto} · {zavod.region}
          </div>
        </div>
        <div className="pr-akce">
          <span className="pr-pocet">
            {prihlasky.length > 0 ? `${prihlasky.length} dabei` : "noch niemand"}
          </span>
          <a
            className="pr-tlacitko"
            href={odkazNaFormular(zavod)}
            target="_blank"
            rel="noopener noreferrer"
          >
            Ich fahre mit →
          </a>
        </div>
      </div>
      {prihlasky.length > 0 && (
        <ul className="pr-seznam">
          {prihlasky.map((p, i) => (
            <Ucastnik key={i} p={p} />
          ))}
        </ul>
      )}
    </div>
  );
}

function Ucastnik({ p, sZavodem = false }: { p: Prihlaska; sZavodem?: boolean }) {
  const udaje = [sZavodem ? p.zavodText : "", p.trasa, p.tempo].filter(Boolean).join(" · ");
  return (
    <li className="pr-ucastnik">
      <div className="pr-radek">
        <span className="pr-jmeno">{p.jmeno}</span>
        {udaje && <span className="pr-udaje">{udaje}</span>}
        {p.odvozText && (
          <span className={"pr-odvoz" + (p.odvoz ? ` pr-odvoz--${p.odvoz}` : "")}>
            {p.odvoz ? ODVOZ[p.odvoz] : p.odvozText}
          </span>
        )}
      </div>
      {p.komentar && <p className="pr-komentar">{p.komentar}</p>}
    </li>
  );
}
