import { useEffect, useMemo, useState } from "react";
import type { Zavod, Zeme } from "./types";
import { ZAVODY } from "./data/zavody";
import { PROFILY, klicMesice, porovnejZavody } from "./ui";
import { PRIHLASKY_ZAPNUTE } from "./prihlasky";
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

const SEZONY = ["2026", "2027"];
const JAZYKY: Jazyk[] = ["cs", "de"];

/* Sdílení závodu přes hash: #zavod/<id>. Bez routovací knihovny. */
function zavodZHash(): Zavod | null {
  const shoda = window.location.hash.match(/^#zavod\/(.+)$/);
  if (!shoda) return null;
  const id = decodeURIComponent(shoda[1]);
  return ZAVODY.find((z) => z.id === id) ?? null;
}

const ZAVOD_Z_URL = zavodZHash();

/* Vedlejší stránka s přihláškami: #mitfahren, případně #mitfahren/<id>. */
type Stranka = { typ: "kalendar" } | { typ: "prihlasky"; zavod: string | null };

function strankaZHash(): Stranka {
  const shoda = window.location.hash.match(/^#mitfahren(?:\/(.+))?$/);
  if (!shoda) return { typ: "kalendar" };
  return { typ: "prihlasky", zavod: shoda[1] ? decodeURIComponent(shoda[1]) : null };
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

  if (stranka.typ === "prihlasky") {
    return <Prihlasky cilovyZavod={stranka.zavod} />;
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
          {PRIHLASKY_ZAPNUTE && (
            <a className="odkaz-prihlasky" href="#mitfahren">
              {t.odkazPrihlasky}
            </a>
          )}
        </header>

        <div className="ovladani">
          {SEZONY.map((s) => (
            <button
              key={s}
              className={"prepinac prepinac-sezona" + (sezona === s ? " aktivni" : "")}
              onClick={() => {
                setSezona(s);
                prepniZavod(null);
              }}
            >
              {s}
            </button>
          ))}

          <div className="ovladani-oddelovac" />

          {volbyZeme.map((volba) => (
            <button
              key={volba}
              className={"prepinac" + (zeme === volba ? " aktivni" : "")}
              onClick={() => setZeme(volba)}
            >
              {volba === "vse" ? t.vse : volba}
            </button>
          ))}

          <div className="ovladani-mezera" />

          {(
            [
              ["seznam", t.seznam],
              ["kalendar", t.kalendar],
            ] as const
          ).map(([klic, popisek]) => (
            <button
              key={klic}
              className={"prepinac" + (pohled === klic ? " aktivni" : "")}
              onClick={() => setPohled(klic)}
            >
              {popisek}
            </button>
          ))}
        </div>

        {mesice.length === 0 ? (
          <div className="prazdno">
            <p>{t.prazdno}</p>
          </div>
        ) : (
          mesice.map(([klic, zavodyMesice]) => {
            const cisloMesice = Number(klic.slice(5));
            return (
              <section key={klic}>
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

        <div className="legenda">
          <div className="legenda-titulek">{t.legenda}</div>
          <div className="legenda-polozky">
            {PROFILY.map((p, i) => (
              <div key={p.klic} className="legenda-polozka">
                <div className={`legenda-vzorek pruh--${p.klic}`} />
                <span>
                  {t.profily[p.klic]}{" "}
                  {i === 0
                    ? "<8"
                    : p.max === Infinity
                      ? ">22"
                      : `${PROFILY[i - 1].max}–${p.max}`}
                </span>
              </div>
            ))}
          </div>
        </div>

        <p className="poznamka">{t.poznamka}</p>
      </div>
    </TextyContext.Provider>
  );
}
