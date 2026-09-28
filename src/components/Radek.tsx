import type { Zavod } from "../types";
import { profilZavodu } from "../ui";
import { useTexty } from "../i18n";
import { dnesniDatum, jeBudouci } from "../prihlasky";
import { Detail } from "./Detail";
import { Vlajka } from "./Vlajka";

/* Převýšení na kilometr, při kterém je profilový pruh vyplněný na 100 %. */
const MAX_POMER_PRUHU = 28;

interface Props {
  zavod: Zavod;
  otevreno: boolean;
  prepni: () => void;
}

export function Radek({ zavod, otevreno, prepni }: Props) {
  const t = useTexty();
  const p = profilZavodu(zavod);
  const datum = zavod.datum ? new Date(zavod.datum + "T12:00:00") : null;
  const probehlo = !jeBudouci(zavod, dnesniDatum());
  // bez převýšení aspoň délka nejdelší trasy (profil se pak nepočítá)
  const nejdelsiKm = Math.max(0, ...zavod.trasy.map((tr) => tr.km ?? 0));
  const nejiste = zavod.datum !== null && zavod.overeno === "check" && !probehlo;

  return (
    <div
      className={
        "radek" +
        (p ? ` radek--${p.profil.klic}` : "") +
        (probehlo ? " radek--probehlo" : "")
      }
      id={`zavod-${zavod.id}`}
    >
      <button
        className={"radek-tlacitko" + (otevreno ? " otevrene" : "")}
        onClick={prepni}
        aria-expanded={otevreno}
      >
        <div className={"radek-datum" + (nejiste ? " radek-datum--nejiste" : "")}>
          {datum ? (
            <>
              <div className="radek-den">{datum.getDate()}</div>
              <div className="radek-den-tydne">{t.dnyZkratky[datum.getDay()]}</div>
              {nejiste && (
                <span className="radek-otaznik" title={t.terminKOvereni}>
                  ?<span className="jen-ctecka"> {t.terminKOvereni}</span>
                </span>
              )}
            </>
          ) : (
            <div className="radek-tbc">{t.tbc}</div>
          )}
        </div>

        <div className="radek-stred">
          <div className="radek-titulek">
            <span className="radek-nazev">{zavod.nazev}</span>
            {probehlo && <span className="odznak odznak--probehlo">{t.probehlo}</span>}
            {zavod.format === "time-trial" && (
              <span className="odznak odznak--casovka">{t.casovka}</span>
            )}
            {zavod.uzavirky === "plna" && (
              <span className="odznak odznak--uzavreno">{t.uzavreno}</span>
            )}
          </div>
          <div className="radek-misto">
            <Vlajka zeme={zavod.zeme} />
            <span className="zeme-kod">{zavod.zeme}</span>
            {zavod.misto} · {zavod.region}
            {zavod.serie && <span className="serie"> · {zavod.serie}</span>}
          </div>
          {p && (
            <div className="radek-profil">
              <div className="profil-pruh">
                <div
                  className={`pruh--${p.profil.klic}`}
                  style={{ width: `${Math.min(100, (p.pomer / MAX_POMER_PRUHU) * 100)}%` }}
                />
              </div>
              <span className={`profil-popisek profil--${p.profil.klic}`}>
                {t.profily[p.profil.klic]}
              </span>
              <span className="profil-pomer">
                {p.pomer.toFixed(1).replace(".", ",")} {t.jednotkaHm}/km
              </span>
            </div>
          )}
        </div>

        <div className="radek-cisla">
          {p ? (
            <>
              <div className="radek-km">{p.trasa.km} km</div>
              <div className="radek-hm">
                <span className={`profil--${p.profil.klic}`} aria-hidden="true">
                  ▲{" "}
                </span>
                {p.trasa.hm} {t.jednotkaHm}
              </div>
            </>
          ) : nejdelsiKm > 0 ? (
            <>
              <div className="radek-km">{nejdelsiKm} km</div>
              <div className="radek-hm radek-hm--chybi" title={t.nedoplneno}>
                – {t.jednotkaHm}
              </div>
            </>
          ) : (
            <div className="radek-nedoplneno">{t.nedoplneno}</div>
          )}
          <div className="radek-sipka">{otevreno ? "▲" : "▼"}</div>
        </div>
      </button>
      {otevreno && <Detail zavod={zavod} />}
    </div>
  );
}
