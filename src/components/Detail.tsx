import type { Zavod } from "../types";
import { UZAVIRKY, profilTrasy } from "../ui";

export function Detail({ zavod }: { zavod: Zavod }) {
  return (
    <div className="detail">
      {zavod.trasy.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Trasa</th>
              <th>km</th>
              <th>hm</th>
              <th>profil</th>
            </tr>
          </thead>
          <tbody>
            {zavod.trasy.map((t) => {
              const profil =
                t.km !== null && t.hm !== null ? profilTrasy(t.km, t.hm) : null;
              return (
                <tr key={t.nazev}>
                  <td>{t.nazev}</td>
                  <td className={t.km === null ? "nedoplneno" : undefined}>
                    {t.km ?? "nedoplněno"}
                  </td>
                  <td className={"hm" + (t.hm === null ? " nedoplneno" : "")}>
                    {t.hm ?? "nedoplněno"}
                  </td>
                  <td
                    className={
                      "profil-bunka " +
                      (profil ? `profil--${profil.klic}` : "nedoplneno")
                    }
                  >
                    {profil ? profil.nazev : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <p className="detail-bez-tras">Trasy zatím nedoplněny.</p>
      )}

      <div className="detail-info">
        <div className="detail-blok">
          <div className="detail-popisek">Silnice</div>
          <div className={`detail-hodnota uzavirky--${zavod.uzavirky}`}>
            {UZAVIRKY[zavod.uzavirky].text}
          </div>
        </div>
        <div className="detail-blok roztazny">
          <div className="detail-popisek">Startovné</div>
          <div className={"detail-hodnota" + (zavod.startovne ? "" : " nedoplneno")}>
            {zavod.startovne ?? "nedoplněno"}
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
            Oficiální web →
          </a>
        ) : (
          <span className="detail-bez-webu">odkaz nedoplněn</span>
        )}
        <span className="detail-zdroj">zdroj: {zavod.zdroj}</span>
      </div>
    </div>
  );
}
