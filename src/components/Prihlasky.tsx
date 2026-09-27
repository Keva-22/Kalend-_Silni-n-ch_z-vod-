import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { Zavod } from "../types";
import { ZAVODY } from "../data/zavody";
import { klicMesice, porovnejZavody } from "../ui";
import { TEXTY, lokalizujZavod } from "../i18n";
import {
  ChybaPrihlasky,
  PRIHLASKY_ZAPNUTE,
  dnesniDatum,
  jeBudouci,
  odesliPrihlasku,
  stahniPrihlasky,
  type KodChyby,
  type Odvoz,
  type Prihlaska,
} from "../prihlasky";

/* Stránka „Wer fährt mit?" — jen německy. U každého nadcházejícího závodu
   ukazuje schválené přihlášky a rozbalovací formulář pro novou. */

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

const CHYBY: Record<KodChyby, string> = {
  souhlas: "Bitte bestätige, dass deine Angaben veröffentlicht werden dürfen.",
  neplatne: "Bitte prüfe deinen Namen und die Angaben.",
  limit: "Heute sind schon sehr viele Anmeldungen eingegangen. Bitte versuch es morgen noch einmal.",
  sit: "Das Senden hat nicht geklappt. Bitte versuch es später noch einmal.",
};

type Stav = "vypnuto" | "nacitam" | "hotovo" | "chyba";

export function Prihlasky({ cilovyZavod }: { cilovyZavod: string | null }) {
  const [stav, setStav] = useState<Stav>(PRIHLASKY_ZAPNUTE ? "nacitam" : "vypnuto");
  const [prihlasky, setPrihlasky] = useState<Prihlaska[]>([]);
  const [chyba, setChyba] = useState("");
  const [pokus, setPokus] = useState(0);
  const [otevreny, setOtevreny] = useState<string | null>(cilovyZavod);

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
    setStav("nacitam");
    stahniPrihlasky()
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
  }, [pokus]);

  useEffect(() => {
    setOtevreny(cilovyZavod);
  }, [cilovyZavod]);

  useEffect(() => {
    if (stav === "hotovo" && cilovyZavod) {
      document.getElementById(`mitfahren-${cilovyZavod}`)?.scrollIntoView();
    }
  }, [stav, cilovyZavod]);

  const podleZavodu = useMemo(() => {
    const m = new Map<string, Prihlaska[]>();
    for (const p of prihlasky) m.set(p.zavodId, [...(m.get(p.zavodId) ?? []), p]);
    return m;
  }, [prihlasky]);
  // přihlášky k závodu, který z kalendáře zmizel; k odjetým se neukazují
  const neprirazene = prihlasky.filter((p) => !znameId.has(p.zavodId));

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
                  otevreno={otevreny === z.id}
                  prepni={() => setOtevreny(otevreny === z.id ? null : z.id)}
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
  otevreno,
  prepni,
}: {
  zavod: Zavod;
  prihlasky: Prihlaska[];
  cil: boolean;
  otevreno: boolean;
  prepni: () => void;
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
          <button
            className={"pr-tlacitko" + (otevreno ? " pr-tlacitko--otevrene" : "")}
            aria-expanded={otevreno}
            aria-controls={`formular-${zavod.id}`}
            onClick={prepni}
          >
            {otevreno ? "Schließen" : "Ich fahre mit →"}
          </button>
        </div>
      </div>
      {otevreno && <Formular zavod={zavod} />}
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

function Formular({ zavod }: { zavod: Zavod }) {
  const [jmeno, setJmeno] = useState("");
  const [trasa, setTrasa] = useState("");
  const [tempo, setTempo] = useState("");
  const [odvoz, setOdvoz] = useState<Odvoz | "">("");
  const [komentar, setKomentar] = useState("");
  const [souhlas, setSouhlas] = useState(false);
  const [past, setPast] = useState("");
  const [stav, setStav] = useState<"vyplnuje" | "odesila" | "odeslano">("vyplnuje");
  const [chyba, setChyba] = useState<KodChyby | null>(null);

  const id = (pole: string) => `${zavod.id}-${pole}`;
  const trasy = [...new Set(zavod.trasy.map((t) => t.nazev))];

  async function odeslat(e: FormEvent) {
    e.preventDefault();
    setChyba(null);
    setStav("odesila");
    try {
      await odesliPrihlasku({
        zavodId: zavod.id,
        zavod: zavod.nazev,
        jmeno: jmeno.trim(),
        trasa,
        tempo: tempo.trim(),
        odvoz,
        komentar: komentar.trim(),
        souhlas,
        web: past,
      });
      setStav("odeslano");
    } catch (err) {
      setChyba(err instanceof ChybaPrihlasky ? err.kod : "sit");
      setStav("vyplnuje");
    }
  }

  if (stav === "odeslano") {
    return (
      <div className="pr-formular pr-formular--hotovo" id={`formular-${zavod.id}`} role="status">
        <strong>Danke, {jmeno.trim()}!</strong> Deine Anmeldung ist angekommen und
        erscheint hier, sobald sie freigegeben wurde.
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
      </div>

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

      {chyba && (
        <p className="pr-formular-chyba" role="alert">
          {CHYBY[chyba]}
        </p>
      )}

      <button className="pr-tlacitko" type="submit" disabled={stav === "odesila"}>
        {stav === "odesila" ? "Wird gesendet …" : "Anmeldung absenden"}
      </button>
    </form>
  );
}

function Ucastnik({ p, sZavodem = false }: { p: Prihlaska; sZavodem?: boolean }) {
  const udaje = [sZavodem ? p.zavod : "", p.trasa, p.tempo].filter(Boolean).join(" · ");
  return (
    <li className="pr-ucastnik">
      <div className="pr-radek">
        <span className="pr-jmeno">{p.jmeno}</span>
        {udaje && <span className="pr-udaje">{udaje}</span>}
        {p.odvoz && (
          <span className={`pr-odvoz pr-odvoz--${p.odvoz}`}>{ODVOZ_STITEK[p.odvoz]}</span>
        )}
      </div>
      {p.komentar && <p className="pr-komentar">{p.komentar}</p>}
    </li>
  );
}
