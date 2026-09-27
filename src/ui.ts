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

/** 'YYYY-MM' — z termínu, nebo z odhadovaného měsíce u závodů bez termínu. */
export function klicMesice(zavod: Zavod): string {
  return zavod.datum ? zavod.datum.slice(0, 7) : (zavod.odhadMesic ?? "");
}
