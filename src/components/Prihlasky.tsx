import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { Zavod } from "../types";
import { ZAVODY } from "../data/zavody";
import { klicMesice, porovnejZavody } from "../ui";
import { TEXTY, lokalizujZavod } from "../i18n";
import {
  ChybaPrihlasky,
  PLATNY_KLIC,
  PRIHLASKY_ZAPNUTE,
  dnesniDatum,
  jeBudouci,
  nactiKlic,
  osobniOdkaz,
  smazPrihlasku,
  stahniPrihlasky,
  ulozKlic,
  ulozPrihlasku,
  zapomenKlic,
  type Ja,
  type KodChyby,
  type Odvoz,
  type Prihlaska,
  type StavOsoby,
  type Ucast,
  type Udaje,
} from "../prihlasky";
import { Vlajka } from "./Vlajka";

/* Stránka „Wer fährt mit?" — jen německy. U každého nadcházejícího závodu
   ukazuje přihlášky schválených osob a formulář pro novou přihlášku nebo
   úpravu té vlastní. */

const DE = TEXTY.de;

const ODVOZ_STITEK: Record<Odvoz, string> = {
  nabizi: "bietet Mitfahrt",
  hleda: "sucht Mitfahrt",
  vyreseno: "Anreise geklärt",
};

const ODVOZ_VOLBY: [Odvoz | "", string][] = [
  ["nabizi", "Ich habe ein Auto und freie Plätze"],
  ["hleda", "Ich suche eine Mitfahrgelegenheit"],
  ["vyreseno", "Anreise ist geklärt"],
  ["", "keine Angabe"],
];

const STAV_OSOBY: Record<StavOsoby, { stitek: string; popis: string }> = {
  ceka: {
    stitek: "wartet auf Freigabe",
    popis:
      "Deine Anmeldungen erscheinen, sobald du einmal freigegeben bist. Danach sind " +
      "alle weiteren Anmeldungen und Änderungen sofort sichtbar.",
  },
  schvaleno: {
    stitek: "freigegeben",
    popis: "Deine Anmeldungen und Änderungen sind sofort für alle sichtbar.",
  },
  zamitnuto: {
    stitek: "nicht freigegeben",
    popis: "Deine Anmeldungen werden nicht veröffentlicht.",
  },
};

const PO_ULOZENI: Record<StavOsoby, string> = {
  ceka: "Gespeichert. Deine Anmeldung erscheint, sobald du freigegeben bist.",
  schvaleno: "Gespeichert — schon für alle sichtbar.",
  zamitnuto: "Gespeichert, wird aber nicht veröffentlicht.",
};

const CHYBY: Record<KodChyby, string> = {
  souhlas: "Bitte bestätige, dass deine Angaben veröffentlicht werden dürfen.",
  neplatne: "Bitte prüfe deinen Namen und die Angaben.",
  limit: "Heute ist das Limit für Anmeldungen erreicht. Bitte versuch es morgen noch einmal.",
  sit: "Das Senden hat nicht geklappt. Bitte versuch es später noch einmal.",
};

type Stav = "vypnuto" | "nacitam" | "hotovo" | "chyba";

export function Prihlasky({
  cilovyZavod,
  klicZOdkazu,
}: {
  cilovyZavod: string | null;
  klicZOdkazu: string | null;
}) {
  const [klic, setKlic] = useState<string | null>(() =>
    klicZOdkazu && PLATNY_KLIC.test(klicZOdkazu) ? klicZOdkazu : nactiKlic(),
  );
  const [stav, setStav] = useState<Stav>(PRIHLASKY_ZAPNUTE ? "nacitam" : "vypnuto");
  const [verejne, setVerejne] = useState<Prihlaska[]>([]);
  const [ja, setJa] = useState<Ja | null>(null);
  const [chyba, setChyba] = useState("");
  const [pokus, setPokus] = useState(0);
  const [otevreny, setOtevreny] = useState<string | null>(cilovyZavod);

  // klíč z osobního odkazu si zapamatovat a z adresního řádku uklidit
  useEffect(() => {
    if (!klicZOdkazu) return;
    if (PLATNY_KLIC.test(klicZOdkazu)) {
      ulozKlic(klicZOdkazu);
      setKlic(klicZOdkazu);
    }
    const zaklad = window.location.pathname + window.location.search;
    window.history.replaceState(null, "", `${zaklad}#mitfahren`);
  }, [klicZOdkazu]);

  useEffect(() => {
    setOtevreny(cilovyZavod);
  }, [cilovyZavod]);

  const { zavody, znameId } = useMemo(() => {
    const dnes = dnesniDatum();
    return {
      zavody: ZAVODY.filter((z) => jeBudouci(z, dnes))
        .map((z) => lokalizujZavod(z, "de"))
        .sort(porovnejZavody),
      znameId: new Set(ZAVODY.map((z) => z.id)),
    };
  }, []);

  useEffect(() => {
    if (!PRIHLASKY_ZAPNUTE) return;
    let zruseno = false;
    // obnova po uložení nemá schovat seznam, jen ho tiše vyměnit
    setStav((s) => (s === "hotovo" ? s : "nacitam"));
    stahniPrihlasky(klic)
      .then((data) => {
        if (zruseno) return;
        setVerejne(data.verejne);
        setJa(data.ja);
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
  }, [klic, pokus]);

  // posun na cílový závod, jakmile je seznam poprvé vidět
  const seznamVidet = stav === "hotovo";
  useEffect(() => {
    if (seznamVidet && cilovyZavod) {
      document.getElementById(`mitfahren-${cilovyZavod}`)?.scrollIntoView();
    }
  }, [seznamVidet, cilovyZavod]);

  function poUlozeni(novyKlic: string | null) {
    if (novyKlic && novyKlic !== klic) {
      ulozKlic(novyKlic);
      setKlic(novyKlic); // změna klíče sama spustí nové načtení
    } else {
      setPokus((n) => n + 1);
    }
  }

  function zapomen() {
    const potvrzeno = window.confirm(
      "Ohne deinen persönlichen Link kannst du deine Anmeldungen danach nicht mehr ändern. Trotzdem auf diesem Gerät abmelden?",
    );
    if (!potvrzeno) return;
    zapomenKlic();
    setKlic(null);
    setJa(null);
  }

  const podleZavodu = useMemo(() => {
    const m = new Map<string, Prihlaska[]>();
    for (const p of verejne) m.set(p.zavodId, [...(m.get(p.zavodId) ?? []), p]);
    return m;
  }, [verejne]);
  const moje = useMemo(
    () => new Map((ja?.prihlasky ?? []).map((p) => [p.zavodId, p])),
    [ja],
  );
  // přihlášky k závodu, který z kalendáře zmizel; k odjetým se neukazují
  const neprirazene = verejne.filter((p) => !znameId.has(p.zavodId));

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
          bist — oder vielleicht dabei bist. Gern mit Tempo und ob du eine
          Mitfahrgelegenheit hast oder suchst. Deine Anmeldung kannst du jederzeit
          ändern.
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

      {stav === "hotovo" && ja && klic && <MujPanel ja={ja} klic={klic} zapomen={zapomen} />}

      {stav === "hotovo" &&
        mesice.map(([klicMes, zavodyMesice]) => (
          <section key={klicMes}>
            <div className="mesic-hlava">
              {/* stránka sahá přes dvě sezóny, proto i s rokem */}
              <h2>
                {DE.mesice[Number(klicMes.slice(5)) - 1]} {klicMes.slice(0, 4)}
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
                  moje={moje.get(z.id)}
                  ja={ja}
                  klic={klic}
                  cil={z.id === cilovyZavod}
                  otevreno={otevreny === z.id}
                  prepni={() => setOtevreny(otevreny === z.id ? null : z.id)}
                  poUlozeni={poUlozeni}
                  poSmazani={() => {
                    setOtevreny(null);
                    setPokus((n) => n + 1);
                  }}
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
        Mit der Anmeldung erscheinen dein Name und deine Angaben öffentlich auf
        dieser Seite, sobald du einmal freigegeben wurdest. Gib deshalb nur an,
        was alle sehen dürfen — Vorname und Initial reichen.
      </p>
    </div>
  );
}

function MujPanel({ ja, klic, zapomen }: { ja: Ja; klic: string; zapomen: () => void }) {
  const [zkopirovano, setZkopirovano] = useState(false);
  const odkaz = osobniOdkaz(klic);
  const s = STAV_OSOBY[ja.stav];

  function kopirovat() {
    navigator.clipboard
      ?.writeText(odkaz)
      .then(() => setZkopirovano(true))
      .catch(() => document.getElementById("osobni-odkaz")?.focus());
  }

  return (
    <div className="pr-ja">
      <div className="pr-ja-hlava">
        <span>
          Angemeldet als <strong>{ja.jmeno}</strong>
        </span>
        <span className={`pr-stav pr-stav--${ja.stav}`}>{s.stitek}</span>
      </div>
      <p className="pr-ja-popis">{s.popis}</p>
      <label className="pr-ja-popisek" htmlFor="osobni-odkaz">
        Dein persönlicher Link — damit änderst du deine Anmeldungen auch auf einem
        anderen Gerät. Nicht weitergeben.
      </label>
      <div className="pr-odkaz-radek">
        <input id="osobni-odkaz" readOnly value={odkaz} onFocus={(e) => e.target.select()} />
        <button className="prepinac aktivni" onClick={kopirovat}>
          {zkopirovano ? "Kopiert ✓" : "Kopieren"}
        </button>
      </div>
      <button className="pr-zapomen" onClick={zapomen}>
        Auf diesem Gerät abmelden
      </button>
    </div>
  );
}

function ZavodSPrihlaskami({
  zavod,
  prihlasky,
  moje,
  ja,
  klic,
  cil,
  otevreno,
  prepni,
  poUlozeni,
  poSmazani,
}: {
  zavod: Zavod;
  prihlasky: Prihlaska[];
  moje: Udaje | undefined;
  ja: Ja | null;
  klic: string | null;
  cil: boolean;
  otevreno: boolean;
  prepni: () => void;
  poUlozeni: (novyKlic: string | null) => void;
  poSmazani: () => void;
}) {
  const datum = zavod.datum ? new Date(zavod.datum + "T12:00:00") : null;
  const jede = prihlasky.filter((p) => p.ucast === "jede");
  const mozna = prihlasky.filter((p) => p.ucast === "mozna");
  const pocet =
    prihlasky.length === 0
      ? "noch niemand"
      : [jede.length && `${jede.length} dabei`, mozna.length && `${mozna.length} vielleicht`]
          .filter(Boolean)
          .join(" · ");
  // vlastní přihlášku bez schválení vidí jen autor
  const mojeSkryta = moje && ja && ja.stav !== "schvaleno";

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
            {zavod.format === "time-trial" && (
              <span className="odznak odznak--casovka">{DE.casovka}</span>
            )}
          </div>
          <div className="radek-misto">
            <Vlajka zeme={zavod.zeme} />
            <span className="zeme-kod">{zavod.zeme}</span>
            {zavod.misto} · {zavod.region}
          </div>
        </div>
        <div className="pr-akce">
          <span className="pr-pocet">{pocet}</span>
          <button
            className={"pr-tlacitko" + (otevreno ? " pr-tlacitko--otevrene" : "")}
            aria-expanded={otevreno}
            aria-controls={`formular-${zavod.id}`}
            onClick={prepni}
          >
            {otevreno ? "Schließen" : moje ? "Ändern" : "Ich fahre mit →"}
          </button>
        </div>
      </div>
      {otevreno && (
        <Formular
          zavod={zavod}
          moje={moje}
          ja={ja}
          klic={klic}
          poUlozeni={poUlozeni}
          poSmazani={poSmazani}
        />
      )}
      {(prihlasky.length > 0 || mojeSkryta) && (
        <ul className="pr-seznam">
          {[...jede, ...mozna].map((p, i) => (
            <Ucastnik key={i} p={p} jaJmeno={ja?.stav === "schvaleno" ? ja.jmeno : null} />
          ))}
          {mojeSkryta && ja && (
            <Ucastnik
              p={{ ...moje, jmeno: ja.jmeno }}
              jaJmeno={ja.jmeno}
              stavOsoby={ja.stav}
            />
          )}
        </ul>
      )}
    </div>
  );
}

function Formular({
  zavod,
  moje,
  ja,
  klic,
  poUlozeni,
  poSmazani,
}: {
  zavod: Zavod;
  moje: Udaje | undefined;
  ja: Ja | null;
  klic: string | null;
  poUlozeni: (novyKlic: string | null) => void;
  poSmazani: () => void;
}) {
  const [jmeno, setJmeno] = useState(ja?.jmeno ?? "");
  const [ucast, setUcast] = useState<Ucast>(moje?.ucast ?? "jede");
  const [trasa, setTrasa] = useState(moje?.trasa ?? "");
  const [tempo, setTempo] = useState(moje?.tempo ?? "");
  const [odvoz, setOdvoz] = useState<Odvoz | "">(moje?.odvoz ?? "");
  const [komentar, setKomentar] = useState(moje?.komentar ?? "");
  const [souhlas, setSouhlas] = useState(false);
  const [past, setPast] = useState("");
  const [stav, setStav] = useState<"vyplnuje" | "odesila" | "ulozeno">("vyplnuje");
  const [vysledek, setVysledek] = useState<StavOsoby>("ceka");
  const [chyba, setChyba] = useState<KodChyby | null>(null);

  const id = (pole: string) => `${zavod.id}-${pole}`;
  const trasy = [...new Set([...zavod.trasy.map((t) => t.nazev), ...(trasa ? [trasa] : [])])];
  const novaOsoba = !ja;

  async function odeslat(e: FormEvent) {
    e.preventDefault();
    setChyba(null);
    setStav("odesila");
    try {
      const odpoved = await ulozPrihlasku({
        klic,
        zavodId: zavod.id,
        zavod: zavod.nazev,
        jmeno: jmeno.trim(),
        ucast,
        trasa,
        tempo: tempo.trim(),
        odvoz,
        komentar: komentar.trim(),
        souhlas,
        web: past,
      });
      setVysledek(odpoved.stav);
      setStav("ulozeno");
      poUlozeni(odpoved.klic);
    } catch (err) {
      setChyba(err instanceof ChybaPrihlasky ? err.kod : "sit");
      setStav("vyplnuje");
    }
  }

  async function smazat() {
    if (!klic || !window.confirm(`Anmeldung für ${zavod.nazev} löschen?`)) return;
    setChyba(null);
    setStav("odesila");
    try {
      await smazPrihlasku(klic, zavod.id);
      poSmazani();
    } catch (err) {
      setChyba(err instanceof ChybaPrihlasky ? err.kod : "sit");
      setStav("vyplnuje");
    }
  }

  if (stav === "ulozeno") {
    return (
      <div className="pr-formular pr-formular--hotovo" id={`formular-${zavod.id}`} role="status">
        <strong>Danke, {jmeno.trim()}!</strong> {PO_ULOZENI[vysledek]}
        {novaOsoba && (
          <> Oben findest du deinen persönlichen Link, mit dem du die Anmeldung später ändern kannst.</>
        )}
      </div>
    );
  }

  return (
    <form className="pr-formular" id={`formular-${zavod.id}`} onSubmit={odeslat}>
      <div className="pr-pole">
        <label htmlFor={id("jmeno")}>Name *</label>
        <input
          id={id("jmeno")}
          value={jmeno}
          onChange={(e) => setJmeno(e.target.value)}
          required
          maxLength={40}
          autoComplete="given-name"
          placeholder="Vorname und Initial, z. B. Kevin H."
        />
        {ja && <span className="pr-napoveda">Gilt für alle deine Anmeldungen.</span>}
      </div>

      <fieldset className="pr-pole">
        <legend>Teilnahme *</legend>
        <div className="pr-volby">
          {(
            [
              ["jede", "Ich fahre mit"],
              ["mozna", "Vielleicht"],
            ] as const
          ).map(([hodnota, popis]) => (
            <label key={hodnota} className="pr-volba">
              <input
                type="radio"
                name={id("ucast")}
                value={hodnota}
                checked={ucast === hodnota}
                onChange={() => setUcast(hodnota)}
              />
              {popis}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="pr-radek-poli">
        {trasy.length > 0 && (
          <div className="pr-pole">
            <label htmlFor={id("trasa")}>Strecke</label>
            <select id={id("trasa")} value={trasa} onChange={(e) => setTrasa(e.target.value)}>
              <option value="">noch offen</option>
              {trasy.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="pr-pole">
          <label htmlFor={id("tempo")}>Tempo</label>
          <input
            id={id("tempo")}
            value={tempo}
            onChange={(e) => setTempo(e.target.value)}
            maxLength={60}
            placeholder="z. B. 28–30 km/h oder gemütlich"
          />
        </div>
      </div>

      <fieldset className="pr-pole">
        <legend>Mitfahrgelegenheit</legend>
        <div className="pr-volby">
          {ODVOZ_VOLBY.map(([hodnota, popis]) => (
            <label key={hodnota || "zadna"} className="pr-volba">
              <input
                type="radio"
                name={id("odvoz")}
                value={hodnota}
                checked={odvoz === hodnota}
                onChange={() => setOdvoz(hodnota)}
              />
              {popis}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="pr-pole">
        <label htmlFor={id("komentar")}>Kommentar</label>
        <textarea
          id={id("komentar")}
          value={komentar}
          onChange={(e) => setKomentar(e.target.value)}
          maxLength={500}
          rows={3}
          placeholder="z. B. Start aus Wien, wie man dich erreicht (Strava, Instagram)"
        />
      </div>

      {/* past na roboty — člověk ji nevidí ani na ni nenarazí klávesnicí */}
      <div className="pr-past" aria-hidden="true">
        <label htmlFor={id("web")}>Website</label>
        <input
          id={id("web")}
          value={past}
          onChange={(e) => setPast(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {novaOsoba && (
        <label className="pr-volba pr-souhlas">
          <input
            type="checkbox"
            checked={souhlas}
            onChange={(e) => setSouhlas(e.target.checked)}
            required
          />
          Ich bin einverstanden, dass mein Name und meine Angaben nach der Freigabe
          öffentlich auf dieser Seite erscheinen. *
        </label>
      )}

      {chyba && (
        <p className="pr-formular-chyba" role="alert">
          {CHYBY[chyba]}
        </p>
      )}

      <div className="pr-tlacitka">
        <button className="pr-tlacitko" type="submit" disabled={stav === "odesila"}>
          {stav === "odesila" ? "Wird gesendet …" : moje ? "Änderung speichern" : "Anmeldung absenden"}
        </button>
        {moje && klic && (
          <button type="button" className="pr-smazat" onClick={smazat} disabled={stav === "odesila"}>
            Abmelden
          </button>
        )}
      </div>
    </form>
  );
}

function Ucastnik({
  p,
  sZavodem = false,
  jaJmeno = null,
  stavOsoby,
}: {
  p: Prihlaska;
  sZavodem?: boolean;
  jaJmeno?: string | null;
  stavOsoby?: StavOsoby;
}) {
  const udaje = [sZavodem ? p.zavod : "", p.trasa, p.tempo].filter(Boolean).join(" · ");
  const jsemTo = jaJmeno !== null && p.jmeno === jaJmeno;
  return (
    <li className={"pr-ucastnik" + (jsemTo ? " pr-ucastnik--ja" : "")}>
      <div className="pr-radek">
        <span className="pr-jmeno">
          {p.jmeno}
          {jsemTo && <span className="pr-du"> (du)</span>}
        </span>
        {p.ucast === "mozna" && <span className="pr-mozna">vielleicht</span>}
        {udaje && <span className="pr-udaje">{udaje}</span>}
        {p.odvoz && (
          <span className={`pr-odvoz pr-odvoz--${p.odvoz}`}>{ODVOZ_STITEK[p.odvoz]}</span>
        )}
        {stavOsoby && (
          <span className={`pr-stav pr-stav--${stavOsoby}`}>
            {STAV_OSOBY[stavOsoby].stitek} · nur für dich sichtbar
          </span>
        )}
      </div>
      {p.komentar && <p className="pr-komentar">{p.komentar}</p>}
    </li>
  );
}
