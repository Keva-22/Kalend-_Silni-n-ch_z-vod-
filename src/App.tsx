import { useEffect, useMemo, useState } from "react";
import type { Zavod, Zeme } from "./types";
import { ZAVODY } from "./data/zavody";
import { MESICE, PROFILY, klicMesice } from "./ui";
import { Radek } from "./components/Radek";
import { Mrizka } from "./components/Mrizka";

const SEZONY = ["2026", "2027"];

/* Sdílení závodu přes hash: #zavod/<id>. Bez routovací knihovny. */
function zavodZHash(): Zavod | null {
  const shoda = window.location.hash.match(/^#zavod\/(.+)$/);
  if (!shoda) return null;
  const id = decodeURIComponent(shoda[1]);
  return ZAVODY.find((z) => z.id === id) ?? null;
}

const ZAVOD_Z_URL = zavodZHash();

function tvarPoctu(pocet: number): string {
  if (pocet === 1) return "závod";
  return pocet < 5 ? "závody" : "závodů";
}

export default function App() {
  const [sezona, setSezona] = useState(
    ZAVOD_Z_URL ? klicMesice(ZAVOD_Z_URL).slice(0, 4) : "2027",
  );
  const [zeme, setZeme] = useState<Zeme | "vse">("vse");
  const [pohled, setPohled] = useState<"seznam" | "kalendar">("seznam");
  const [otevreny, setOtevreny] = useState<string | null>(ZAVOD_Z_URL?.id ?? null);

  useEffect(() => {
    if (ZAVOD_Z_URL) {
      document.getElementById(`zavod-${ZAVOD_Z_URL.id}`)?.scrollIntoView();
    }
  }, []);

  function prepniZavod(id: string | null) {
    setOtevreny(id);
    const zaklad = window.location.pathname + window.location.search;
    window.history.replaceState(null, "", id ? `${zaklad}#zavod/${id}` : zaklad);
  }

  const filtrovane = useMemo(() => {
    return ZAVODY.filter((z) => klicMesice(z).startsWith(sezona))
      .filter((z) => zeme === "vse" || z.zeme === zeme)
      .sort((a, b) => {
        const ka = klicMesice(a);
        const kb = klicMesice(b);
        if (ka !== kb) return ka < kb ? -1 : 1;
        // závody bez termínu patří na konec svého odhadovaného měsíce
        if (!a.datum && !b.datum) return 0;
        if (!a.datum) return 1;
        if (!b.datum) return -1;
        return a.datum < b.datum ? -1 : 1;
      });
  }, [sezona, zeme]);

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

  return (
    <div className="obal">
      <header className="hlavicka">
        <div className="hlavicka-znacka">Roadbook · pracovní název</div>
        <h1>
          Silniční maratony
          <br />
          <span className="tlumene">střední Evropy</span>
        </h1>
        <p>
          Velké hobby závody v Česku a Rakousku, plus příhraniční Německo,
          Slovensko a Itálie. Klikni na závod pro trasy a odkaz na pořadatele.
        </p>
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
            {volba === "vse" ? "vše" : volba}
          </button>
        ))}

        <div className="ovladani-mezera" />

        {(
          [
            ["seznam", "seznam"],
            ["kalendar", "kalendář"],
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
          <p>
            Pro tuhle kombinaci zatím žádné závody nemáme. Zkus jinou zemi nebo
            sezónu.
          </p>
        </div>
      ) : (
        mesice.map(([klic, zavodyMesice]) => {
          const cisloMesice = Number(klic.slice(5));
          return (
            <section key={klic}>
              <div className="mesic-hlava">
                <h2>{MESICE[cisloMesice - 1]}</h2>
                <div className="cara" />
                <span className="pocet">
                  {zavodyMesice.length} {tvarPoctu(zavodyMesice.length)}
                </span>
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
        <div className="legenda-titulek">Profil = převýšení na kilometr</div>
        <div className="legenda-polozky">
          {PROFILY.map((p, i) => (
            <div key={p.klic} className="legenda-polozka">
              <div className={`legenda-vzorek pruh--${p.klic}`} />
              <span>
                {p.nazev}{" "}
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

      <p className="poznamka">
        Termíny pocházejí z rychlé rešerše a před zveřejněním je nutné ověřit u
        pořadatelů — u každého závodu je uveden zdroj.
      </p>
    </div>
  );
}
