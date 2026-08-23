import type { Uzavirky, Zavod } from "./types";

/* Sdílené odvozené hodnoty a pomocné funkce pro kalendář. */

export interface ProfilTrati {
  klic: "rovina" | "zvlnena" | "kopcovita" | "horska";
  nazev: string;
  max: number; // horní hranice převýšení na kilometr (hm/km)
}

export const PROFILY: ProfilTrati[] = [
  { klic: "rovina", nazev: "rovina", max: 8 },
  { klic: "zvlnena", nazev: "zvlněná", max: 15 },
  { klic: "kopcovita", nazev: "kopcovitá", max: 22 },
  { klic: "horska", nazev: "horská", max: Infinity },
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

export const UZAVIRKY: Record<Uzavirky, { text: string }> = {
  plna: { text: "Plně uzavřené silnice" },
  castecna: { text: "Částečně uzavřené" },
  provoz: { text: "Za provozu" },
  nezname: { text: "Uzavírky neověřeny" },
};

export const MESICE = [
  "leden", "únor", "březen", "duben", "květen", "červen",
  "červenec", "srpen", "září", "říjen", "listopad", "prosinec",
];

/** Zkratky dnů indexované podle Date.getDay() (neděle = 0). */
export const DNY = ["ne", "po", "út", "st", "čt", "pá", "so"];
