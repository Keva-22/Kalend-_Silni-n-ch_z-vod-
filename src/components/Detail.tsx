import type { Zavod } from "../types";
import { profilTrasy } from "../ui";
import { useTexty } from "../i18n";

export function Detail({ zavod }: { zavod: Zavod }) {
  const t = useTexty();
  return (
    <div className="detail">
      {zavod.trasy.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>{t.sloupecTrasa}</th>
              <th>{t.sloupecKm}</th>
              <th>{t.sloupecHm}</th>
              <th>{t.sloupecProfil}</th>
            </tr>
          </thead>
          <tbody>
            {zavod.trasy.map((trasa) => {
              const profil =
                trasa.km !== null && trasa.hm !== null
                  ? profilTrasy(trasa.km, trasa.hm)
                  : null;
              return (
                <tr key={trasa.nazev}>
                  <td>{trasa.nazev}</td>
                  <td className={trasa.km === null ? "nedoplneno" : undefined}>
                    {trasa.km ?? t.nedoplneno}
                  </td>
                  <td className={"hm" + (trasa.hm === null ? " nedoplneno" : "")}>
                    {trasa.hm ?? t.nedoplneno}
                  </td>
                  <td
                    className={
                      "profil-bunka " +
                      (profil ? `profil--${profil.klic}` : "nedoplneno")
                    }
                  >
                    {profil ? t.profily[profil.klic] : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <p className="detail-bez-tras">{t.trasyNedoplneny}</p>
      )}

      <div className="detail-info">
        <div className="detail-blok">
          <div className="detail-popisek">{t.silnice}</div>
          <div className={`detail-hodnota uzavirky--${zavod.uzavirky}`}>
            {t.uzavirky[zavod.uzavirky]}
          </div>
        </div>
        <div className="detail-blok roztazny">
          <div className="detail-popisek">{t.startovne}</div>
          <div className={"detail-hodnota" + (zavod.startovne ? "" : " nedoplneno")}>
            {zavod.startovne ?? t.nedoplneno}
          </div>
        </div>
      </div>

      <div className="detail-pata">
        {zavod.web ? (
          <a
            className="detail-web"
            href={zavod.web}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t.oficialniWeb}
          </a>
        ) : (
          <span className="detail-bez-webu">{t.odkazNedoplnen}</span>
        )}
        <span className="detail-zdroj">
          {t.zdroj} {zavod.zdroj}
        </span>
      </div>
    </div>
  );
}
