import type { Zavod } from "../types";
import { profilZavodu } from "../ui";
import { useTexty } from "../i18n";

interface Props {
  zavody: Zavod[];
  mesic: string; // 'YYYY-MM'
  naKlik: (id: string) => void;
}

export function Mrizka({ zavody, mesic, naKlik }: Props) {
  const t = useTexty();
  const [rok, cisloMesice] = mesic.split("-").map(Number);
  // týden začíná pondělkem
  const posun = (new Date(rok, cisloMesice - 1, 1).getDay() + 6) % 7;
  const pocetDni = new Date(rok, cisloMesice, 0).getDate();
  const bunky: (number | null)[] = [
    ...Array<null>(posun).fill(null),
    ...Array.from({ length: pocetDni }, (_, i) => i + 1),
  ];
  const bezTerminu = zavody.filter((z) => !z.datum).length;

  return (
    <div className="mrizka-obal">
      <div className="mrizka-dny">
        {t.dnyMrizka.map((den) => (
          <div key={den}>{den}</div>
        ))}
      </div>
      <div className="mrizka">
        {bunky.map((den, i) => {
          if (den === null) return <div key={`prazdna-${i}`} />;
          const dnesni = zavody.filter(
            (z) => z.datum !== null && Number(z.datum.slice(8)) === den,
          );
          return (
            <div
              key={den}
              className={"mrizka-den" + (dnesni.length ? " se-zavodem" : "")}
            >
              <div className="mrizka-cislo">{den}</div>
              {dnesni.map((z) => {
                const p = profilZavodu(z);
                return (
                  <button
                    key={z.id}
                    className={
                      "mrizka-zavod" + (p ? ` okraj--${p.profil.klic}` : "")
                    }
                    onClick={() => naKlik(z.id)}
                    title={z.nazev}
                  >
                    {z.nazev}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
      {bezTerminu > 0 && (
        <div className="mrizka-tbc">{t.bezTerminu(bezTerminu)}</div>
      )}
    </div>
  );
}
