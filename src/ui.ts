import type { Zavod } from "./types";

/* Sdílené odvozené hodnoty a pomocné funkce pro kalendář.
   Texty (názvy profilů, měsíců, dnů…) jsou v i18n.ts. */

export type KlicProfilu = "rovina" | "zvlnena" | "kopcovita" | "horska";

export interface ProfilTrati {
  klic: KlicProfilu;
  max: number; // horní hranice převýšení na kilometr (hm/km)
}

export const PROFILY: ProfilTrati[] = [
  { klic: "rovina", max: 8 },
  { klic: "zvlnena", max: 15 },
  { klic: "kopcovita", max: 22 },
  { klic: "horska", max: Infinity },
];

interface MerenaTrasa {
  nazev: string;
  km: number;
  hm: number;
}

export function profilTrasy(km: number, hm: number): ProfilTrati {
  const pomer = hm / km;
  return PROFILY.find((p) => pomer <= p.max)!;
}

export interface ProfilZavodu {
  profil: ProfilTrati;
  pomer: number;
  trasa: MerenaTrasa;
}

/** Profil nejdelší trasy, u které známe km i hm; null, když žádná taková není. */
export function profilZavodu(zavod: Zavod): ProfilZavodu | null {
  const merene = zavod.trasy.filter(
    (t): t is MerenaTrasa => t.km !== null && t.hm !== null,
  );
  if (merene.length === 0) return null;
  const nejdelsi = merene.reduce((a, b) => (b.km > a.km ? b : a));
  return {
    profil: profilTrasy(nejdelsi.km, nejdelsi.hm),
    pomer: nejdelsi.hm / nejdelsi.km,
    trasa: nejdelsi,
  };
}

/** Počet dní z data `dnes` do data `datum` (obě 'YYYY-MM-DD'). */
export function dniDo(datum: string, dnes: string): number {
  const poledne = (d: string) => new Date(d + "T12:00:00").getTime();
  return Math.round((poledne(datum) - poledne(dnes)) / (24 * 60 * 60 * 1000));
}

/** 'YYYY-MM' — z termínu, nebo z odhadovaného měsíce u závodů bez termínu. */
export function klicMesice(zavod: Zavod): string {
  return zavod.datum ? zavod.datum.slice(0, 7) : (zavod.odhadMesic ?? "");
}

/** Řazení podle měsíce a data; závody bez termínu jdou na konec svého měsíce. */
export function porovnejZavody(a: Zavod, b: Zavod): number {
  const ka = klicMesice(a);
  const kb = klicMesice(b);
  if (ka !== kb) return ka < kb ? -1 : 1;
  if (!a.datum && !b.datum) return 0;
  if (!a.datum) return 1;
  if (!b.datum) return -1;
  return a.datum < b.datum ? -1 : 1;
}
