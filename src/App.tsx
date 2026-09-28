import { useEffect, useMemo, useState } from "react";
import type { Zavod, Zeme } from "./types";
import { ZAVODY } from "./data/zavody";
import {
  PROFILY,
  klicMesice,
  porovnejZavody,
  profilZavodu,
  type KlicProfilu,
} from "./ui";
import { PRIHLASKY_ZAPNUTE, dnesniDatum } from "./prihlasky";
import {
  NAZVY_JAZYKU,
  TEXTY,
  TextyContext,
  lokalizujZavod,
  ulozJazyk,
  vychoziJazyk,
  type Jazyk,
} from "./i18n";
import { Radek } from "./components/Radek";
import { Mrizka } from "./components/Mrizka";
import { Prihlasky } from "./components/Prihlasky";
import { Vlajka } from "./components/Vlajka";

const SEZONY = ["2026", "2027"];
const JAZYKY: Jazyk[] = ["cs", "de"];
const POCET_ZEMI = new Set(ZAVODY.map((z) => z.zeme)).size;
const DEN_MS = 24 * 60 * 60 * 1000;

/* Nejbližší závod s pevným termínem od dneška a počet dní do něj. */
function nejblizsiZavod(): { zavod: Zavod; dni: number } | null {
  const dnes = dnesniDatum();
  const dalsi = ZAVODY.filter((z) => z.datum !== null && z.datum >= dnes).sort(
    porovnejZavody,
  )[0];
  if (!dalsi?.datum) return null;
  const dni = Math.round(
    (new Date(dalsi.datum + "T12:00:00").getTime() - new Date(dnes + "T12:00:00").getTime()) /
      DEN_MS,
  );
  return { zavod: dalsi, dni };
}

/* Sdílení závodu přes hash: #zavod/<id>. Bez routovací knihovny. */
function zavodZHash(): Zavod | null {
  const shoda = window.location.hash.match(/^#zavod\/(.+)$/);
  if (!shoda) return null;
  const id = decodeURIComponent(shoda[1]);
  return ZAVODY.find((z) => z.id === id) ?? null;
}

const ZAVOD_Z_URL = zavodZHash();

/* Vedlejší stránka s přihláškami: #mitfahren, #mitfahren/<id závodu>,
   nebo osobní odkaz #mitfahren/ich/<klíč>. */
type Stranka =
  | { typ: "kalendar" }
  | { typ: "prihlasky"; zavod: string | null; klic: string | null };

function strankaZHash(): Stranka {
  const shoda = window.location.hash.match(/^#mitfahren(?:\/(.+))?$/);
  if (!shoda) return { typ: "kalendar" };
  const cesta = shoda[1] ? decodeURIComponent(shoda[1]) : "";
  if (cesta.startsWith("ich/")) return { typ: "prihlasky", zavod: null, klic: cesta.slice(4) };
  return { typ: "prihlasky", zavod: cesta || null, klic: null };
}

export default function App() {
  const [stranka, setStranka] = useState<Stranka>(strankaZHash);
  const [jazyk, setJazyk] = useState<Jazyk>(vychoziJazyk);
  const [sezona, setSezona] = useState(
    ZAVOD_Z_URL ? klicMesice(ZAVOD_Z_URL).slice(0, 4) : "2027",
  );
  const [zeme, setZeme] = useState<Zeme | "vse">("vse");
  const [pohled, setPohled] = useState<"seznam" | "kalendar">("seznam");
  const [otevreny, setOtevreny] = useState<string | null>(ZAVOD_Z_URL?.id ?? null);

  const t = TEXTY[jazyk];
  const nejblizsi = useMemo(nejblizsiZavod, []);

  useEffect(() => {
    if (ZAVOD_Z_URL) {
      document.getElementById(`zavod-${ZAVOD_Z_URL.id}`)?.scrollIntoView();
    }
  }, []);

  /* Změna hashe (odkaz, tlačítko Zpět, ručně vložená adresa) přepne stránku,
     případně otevře závod z #zavod/<id>. */
  useEffect(() => {
    function priZmeneHashe() {
      const nova = strankaZHash();
      setStranka(nova);
      const zavod = nova.typ === "kalendar" ? zavodZHash() : null;
      if (zavod) {
        setSezona(klicMesice(zavod).slice(0, 4));
        setZeme("vse");
        setPohled("seznam");
        setOtevreny(zavod.id);
        requestAnimationFrame(() =>
          document.getElementById(`zavod-${zavod.id}`)?.scrollIntoView(),
        );
      } else if (nova.typ === "kalendar" || !nova.zavod) {
        window.scrollTo(0, 0);
      }
    }
    window.addEventListener("hashchange", priZmeneHashe);
    return () => window.removeEventListener("hashchange", priZmeneHashe);
  }, []);

  useEffect(() => {
    // stránka s přihláškami je jen německy
    const naPrihlaskach = stranka.typ === "prihlasky";
    document.documentElement.lang = naPrihlaskach ? "de" : t.htmlLang;
    document.title = naPrihlaskach ? "Wer fährt mit? — Roadbook" : t.titulekStranky;
  }, [t, stranka]);

  function zmenJazyk(novy: Jazyk) {
    setJazyk(novy);
    ulozJazyk(novy);
  }

  function prepniZavod(id: string | null) {
    setOtevreny(id);
    const zaklad = window.location.pathname + window.location.search;
    window.history.replaceState(null, "", id ? `${zaklad}#zavod/${id}` : zaklad);
  }

  const zavody = useMemo(() => ZAVODY.map((z) => lokalizujZavod(z, jazyk)), [jazyk]);

  const filtrovane = useMemo(() => {
    return zavody
      .filter((z) => klicMesice(z).startsWith(sezona))
      .filter((z) => zeme === "vse" || z.zeme === zeme)
      .sort(porovnejZavody);
  }, [zavody, sezona, zeme]);

  const mesice = useMemo(() => {
    const skupiny = new Map<string, Zavod[]>();
    for (const z of filtrovane) {
      const klic = klicMesice(z);
      const skupina = skupiny.get(klic);
      if (skupina) skupina.push(z);
      else skupiny.set(klic, [z]);
    }
    return [...skupiny.entries()];
  }, [filtrovane]);

  const dostupneZeme = useMemo(
    () => [
      ...new Set(
        ZAVODY.filter((z) => klicMesice(z).startsWith(sezona)).map((z) => z.zeme),
      ),
    ],
    [sezona],
  );
  const volbyZeme: (Zeme | "vse")[] = ["vse", ...dostupneZeme];

  /* Počty pro boční panel: závody sezóny podle země a vybrané závody
     podle profilu (bez km/hm se do profilů nepočítají). */
  const vSezone = useMemo(
    () => zavody.filter((z) => klicMesice(z).startsWith(sezona)),
    [zavody, sezona],
  );
  const pocetZeme = (volba: Zeme | "vse") =>
    volba === "vse" ? vSezone.length : vSezone.filter((z) => z.zeme === volba).length;
  const pocetProfilu = useMemo(() => {
    const pocty: Record<KlicProfilu, number> = { rovina: 0, zvlnena: 0, kopcovita: 0, horska: 0 };
    for (const z of filtrovane) {
      const p = profilZavodu(z);
      if (p) pocty[p.profil.klic]++;
    }
    return pocty;
  }, [filtrovane]);

  function skocNaMesic(klic: string) {
    const klidne = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document
      .getElementById(`mesic-${klic}`)
      ?.scrollIntoView({ behavior: klidne ? "auto" : "smooth", block: "start" });
  }

  const dalsi = nejblizsi ? lokalizujZavod(nejblizsi.zavod, jazyk) : null;
  const dalsiProfil = dalsi ? profilZavodu(dalsi) : null;
  const dalsiDatum = dalsi?.datum ? new Date(dalsi.datum + "T12:00:00") : null;

  if (stranka.typ === "prihlasky") {
    return <Prihlasky cilovyZavod={stranka.zavod} klicZOdkazu={stranka.klic} />;
  }

  return (
    <TextyContext.Provider value={t}>
      <div className="obal">
        <header className="hlavicka">
          <div className="hlavicka-horni">
            <div className="hlavicka-znacka">{t.znacka}</div>
            <div className="jazyky" role="group" aria-label={t.vyberJazyka}>
              {JAZYKY.map((j) => (
                <button
                  key={j}
                  lang={j}
                  className={"prepinac" + (jazyk === j ? " aktivni" : "")}
                  aria-pressed={jazyk === j}
                  onClick={() => zmenJazyk(j)}
                >
                  {NAZVY_JAZYKU[j]}
                </button>
              ))}
            </div>
          </div>
          <h1>
            {t.nadpis1}
            <br />
            <span className="tlumene">{t.nadpis2}</span>
          </h1>
          <p>{t.popis}</p>
          <div className="hlavicka-pata">
            <span className="cip">
              <strong>{t.pocetZavodu(ZAVODY.length)}</strong> · {t.pocetZemi(POCET_ZEMI)}
            </span>
            {nejblizsi && (
              <a className="cip cip--odkaz" href={`#zavod/${nejblizsi.zavod.id}`}>
                {t.nejblizsi}:{" "}
                <strong>{lokalizujZavod(nejblizsi.zavod, jazyk).nazev}</strong> ·{" "}
                {t.zaDni(nejblizsi.dni)}
              </a>
            )}
          </div>
          {PRIHLASKY_ZAPNUTE && (
            <a className="odkaz-prihlasky" href="#mitfahren">
              {t.odkazPrihlasky}
            </a>
          )}
          {/* na širších displejích karta nejbližšího závodu vpravo */}
          {nejblizsi && dalsi && dalsiDatum && (
            <a className="hero-karta" href={`#zavod/${dalsi.id}`}>
              <span className="hero-karta-popisek">{t.nejblizsiZavod}</span>
              <span className="hero-karta-odpocet">{t.zaDni(nejblizsi.dni)}</span>
              <span className="hero-karta-nazev">{dalsi.nazev}</span>
              <span className="hero-karta-info">
                <Vlajka zeme={dalsi.zeme} />
                {t.dnyZkratky[dalsiDatum.getDay()]} {dalsiDatum.getDate()}.{" "}
                {dalsiDatum.getMonth() + 1}. {dalsiDatum.getFullYear()} · {dalsi.misto}
              </span>
              {dalsiProfil && (
                <span className="hero-karta-cisla">
                  <strong>{dalsiProfil.trasa.km} km</strong>
                  <span>
                    ▲ {dalsiProfil.trasa.hm} {t.jednotkaHm}
                  </span>
                  <span className={`profil-popisek profil--${dalsiProfil.profil.klic}`}>
                    {t.profily[dalsiProfil.profil.klic]}
                  </span>
                </span>
              )}
            </a>
          )}
        </header>

        <div className="rozlozeni">
          <aside className="bocni">
            <div className="ovladani">
              <div className="panel-titulek">{t.sezonaNadpis}</div>
              <div className="segment segment--sezona">
                {SEZONY.map((s) => (
                  <button
                    key={s}
                    className={"prepinac prepinac-sezona" + (sezona === s ? " aktivni" : "")}
                    aria-pressed={sezona === s}
                    onClick={() => {
                      setSezona(s);
                      prepniZavod(null);
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <div className="panel-titulek">{t.zemeNadpis}</div>
              <div className="zeme-volby">
                {volbyZeme.map((volba) => (
                  <button
                    key={volba}
                    className={"prepinac prepinac-zeme" + (zeme === volba ? " aktivni" : "")}
                    aria-pressed={zeme === volba}
                    onClick={() => setZeme(volba)}
                  >
                    {volba === "vse" ? (
                      <span>{t.vse}</span>
                    ) : (
                      <>
                        <Vlajka zeme={volba} />
                        <span>{volba}</span>
                        <span className="zeme-nazev">{t.nazvyZemi[volba]}</span>
                      </>
                    )}
                    <span className="zeme-pocet">{pocetZeme(volba)}</span>
                  </button>
                ))}
              </div>

              <div className="ovladani-mezera" />

              <div className="panel-titulek">{t.zobrazeniNadpis}</div>
              <div className="segment segment--pohled">
                {(
                  [
                    ["seznam", t.seznam],
                    ["kalendar", t.kalendar],
                  ] as const
                ).map(([klic, popisek]) => (
                  <button
                    key={klic}
                    className={"prepinac" + (pohled === klic ? " aktivni" : "")}
                    aria-pressed={pohled === klic}
                    onClick={() => setPohled(klic)}
                  >
                    {popisek}
                  </button>
                ))}
              </div>
            </div>

            <div className="legenda">
              <span className="legenda-titulek">{t.legenda}</span>
              {/* poměr profilů ve výběru — jen na širších displejích */}
              <div className="legenda-graf" aria-hidden="true">
                {PROFILY.map((p) =>
                  pocetProfilu[p.klic] > 0 ? (
                    <span
                      key={p.klic}
                      className={`pruh--${p.klic}`}
                      style={{ flexGrow: pocetProfilu[p.klic] }}
                    />
                  ) : null,
                )}
              </div>
              {PROFILY.map((p, i) => (
                <span key={p.klic} className="legenda-polozka">
                  <span className={`legenda-vzorek pruh--${p.klic}`} />
                  <span className={`profil--${p.klic}`}>{t.profily[p.klic]}</span>
                  <span className="legenda-rozsah">
                    {i === 0
                      ? "<8"
                      : p.max === Infinity
                        ? ">22"
                        : `${PROFILY[i - 1].max}–${p.max}`}
                  </span>
                  <span className="legenda-pocet">{pocetProfilu[p.klic]}</span>
                </span>
              ))}
              <span className="legenda-polozka">
                <span className="radek-otaznik radek-otaznik--legenda" aria-hidden="true">
                  ?
                </span>
                {t.terminKOvereni}
              </span>
            </div>

            {mesice.length > 0 && (
              <nav className="mesice-nav" aria-label={t.mesiceNadpis}>
                <span className="panel-titulek">{t.mesiceNadpis}</span>
                {mesice.map(([klic, zavodyMesice]) => (
                  <button key={klic} className="mesice-nav-polozka" onClick={() => skocNaMesic(klic)}>
                    <span className="mesice-nav-nazev">{t.mesice[Number(klic.slice(5)) - 1]}</span>
                    <span className="mesice-nav-tecky" aria-hidden="true">
                      {zavodyMesice.map((z) => {
                        const p = profilZavodu(z);
                        return (
                          <span
                            key={z.id}
                            className={p ? `pruh--${p.profil.klic}` : "mesice-nav-tecka--tbc"}
                          />
                        );
                      })}
                    </span>
                    <span className="mesice-nav-pocet">{zavodyMesice.length}</span>
                  </button>
                ))}
              </nav>
            )}
          </aside>

          <main className="hlavni">
            {mesice.length === 0 ? (
              <div className="prazdno">
                <p>{t.prazdno}</p>
              </div>
            ) : (
              mesice.map(([klic, zavodyMesice]) => {
                const cisloMesice = Number(klic.slice(5));
                return (
                  <section key={klic} id={`mesic-${klic}`}>
                    <div className="mesic-hlava">
                      <h2>{t.mesice[cisloMesice - 1]}</h2>
                      <div className="cara" />
                      <span className="pocet">{t.pocetZavodu(zavodyMesice.length)}</span>
                    </div>

                    {pohled === "seznam" ? (
                      <div className="seznam">
                        {zavodyMesice.map((z) => (
                          <Radek
                            key={z.id}
                            zavod={z}
                            otevreno={otevreny === z.id}
                            prepni={() => prepniZavod(otevreny === z.id ? null : z.id)}
                          />
                        ))}
                      </div>
                    ) : (
                      <Mrizka
                        zavody={zavodyMesice}
                        mesic={klic}
                        naKlik={(id) => {
                          setPohled("seznam");
                          prepniZavod(id);
                        }}
                      />
                    )}
                  </section>
                );
              })
            )}

            <p className="poznamka">{t.poznamka}</p>
          </main>
        </div>
      </div>
    </TextyContext.Provider>
  );
}
