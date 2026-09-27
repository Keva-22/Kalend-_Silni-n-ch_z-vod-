import type { Zavod } from "../types";
import { profilZavodu } from "../ui";
import { useTexty } from "../i18n";
import { Detail } from "./Detail";

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

  return (
    <div
      className={"radek" + (p ? ` radek--${p.profil.klic}` : "")}
      id={`zavod-${zavod.id}`}
    >
      <button
        className={"radek-tlacitko" + (otevreno ? " otevrene" : "")}
        onClick={prepni}
        aria-expanded={otevreno}
      >
        <div className="radek-datum">
          {datum ? (
            <>
              <div className="radek-den">{datum.getDate()}</div>
              <div className="radek-den-tydne">{t.dnyZkratky[datum.getDay()]}</div>
            </>
          ) : (
            <div className="radek-tbc">{t.tbc}</div>
          )}
        </div>

        <div className="radek-stred">
          <div className="radek-titulek">
            <span className="radek-nazev">{zavod.nazev}</span>
            <span className="odznak">{zavod.zeme}</span>
            {zavod.format === "time-trial" && (
              <span className="odznak odznak--casovka">{t.casovka}</span>
            )}
            {zavod.uzavirky === "plna" && (
              <span className="odznak odznak--uzavreno">{t.uzavreno}</span>
            )}
          </div>
          <div className="radek-misto">
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
            </div>
          )}
        </div>

        <div className="radek-cisla">
          {p ? (
            <>
              <div className="radek-km">{p.trasa.km} km</div>
              <div className="radek-hm">
                {p.trasa.hm} {t.jednotkaHm}
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
