import { createContext, useContext } from "react";
import type { Uzavirky, Zavod } from "./types";
import type { KlicProfilu } from "./ui";

/* Přepínání jazyka bez knihovny: slovník textů rozhraní + volitelné
   německé znění datových polí (Zavod.de). Typ Texty zajistí, že když
   v jednom jazyce nějaký text chybí, build spadne. */

export type Jazyk = "cs" | "de";

export interface Texty {
  htmlLang: string;
  titulekStranky: string;
  znacka: string;
  nadpis1: string;
  nadpis2: string;
  popis: string;
  vyberJazyka: string;
  vse: string;
  seznam: string;
  kalendar: string;
  prazdno: string;
  legenda: string;
  poznamka: string;
  pocetZavodu: (pocet: number) => string;
  bezTerminu: (pocet: number) => string;
  mesice: string[];
  dnyZkratky: string[];   // indexováno podle Date.getDay(), neděle = 0
  dnyMrizka: string[];    // pondělí až neděle
  profily: Record<KlicProfilu, string>;
  uzavirky: Record<Uzavirky, string>;
  uzavreno: string;
  casovka: string;
  nedoplneno: string;
  tbc: string;
  sloupecTrasa: string;
  sloupecKm: string;
  sloupecHm: string;
  sloupecProfil: string;
  jednotkaHm: string;
  trasyNedoplneny: string;
  silnice: string;
  startovne: string;
  oficialniWeb: string;
  odkazNedoplnen: string;
  zdroj: string;
  odkazPrihlasky: string;
  kdoJede: string;
}

const CS: Texty = {
  htmlLang: "cs",
  titulekStranky: "Roadbook — silniční maratony střední Evropy",
  znacka: "Roadbook · pracovní název",
  nadpis1: "Silniční maratony",
  nadpis2: "střední Evropy",
  popis:
    "Velké hobby závody v Česku a Rakousku, plus příhraniční Německo, " +
    "Slovensko a Itálie a vybrané závody v Chorvatsku. Klikni na závod " +
    "pro trasy a odkaz na pořadatele.",
  vyberJazyka: "Jazyk",
  vse: "vše",
  seznam: "seznam",
  kalendar: "kalendář",
  prazdno:
    "Pro tuhle kombinaci zatím žádné závody nemáme. Zkus jinou zemi nebo sezónu.",
  legenda: "Profil = převýšení na kilometr",
  poznamka:
    "Termíny pocházejí z rychlé rešerše — před přihlášením si je ověř " +
    "u pořadatele. U každého závodu je uveden zdroj.",
  pocetZavodu: (n) =>
    `${n} ${n === 1 ? "závod" : n >= 2 && n <= 4 ? "závody" : "závodů"}`,
  bezTerminu: (n) => `+ ${n} bez potvrzeného termínu`,
  mesice: [
    "leden", "únor", "březen", "duben", "květen", "červen",
    "červenec", "srpen", "září", "říjen", "listopad", "prosinec",
  ],
  dnyZkratky: ["ne", "po", "út", "st", "čt", "pá", "so"],
  dnyMrizka: ["po", "út", "st", "čt", "pá", "so", "ne"],
  profily: {
    rovina: "rovina",
    zvlnena: "zvlněná",
    kopcovita: "kopcovitá",
    horska: "horská",
  },
  uzavirky: {
    plna: "Plně uzavřené silnice",
    castecna: "Částečně uzavřené",
    provoz: "Za provozu",
    nezname: "Uzavírky neověřeny",
  },
  uzavreno: "uzavřeno",
  casovka: "časovka",
  nedoplneno: "nedoplněno",
  tbc: "TBC",
  sloupecTrasa: "Trasa",
  sloupecKm: "km",
  sloupecHm: "hm",
  sloupecProfil: "profil",
  jednotkaHm: "hm",
  trasyNedoplneny: "Trasy zatím nedoplněny.",
  silnice: "Silnice",
  startovne: "Startovné",
  oficialniWeb: "Oficiální web →",
  odkazNedoplnen: "odkaz nedoplněn",
  zdroj: "zdroj:",
  odkazPrihlasky: "Kdo jede na který závod? Přihlášky (v němčině) →",
  kdoJede: "Přihlásit se · kdo jede →",
};

const DE: Texty = {
  htmlLang: "de",
  titulekStranky: "Roadbook — Radmarathons in Mitteleuropa",
  znacka: "Roadbook · Arbeitstitel",
  nadpis1: "Radmarathons",
  nadpis2: "in Mitteleuropa",
  popis:
    "Große Jedermannrennen in Tschechien und Österreich, dazu grenznahe " +
    "Rennen in Deutschland, der Slowakei und Italien sowie ausgewählte " +
    "Rennen in Kroatien. Klick auf ein Rennen für Strecken und den Link " +
    "zum Veranstalter.",
  vyberJazyka: "Sprache",
  vse: "alle",
  seznam: "Liste",
  kalendar: "Kalender",
  prazdno:
    "Für diese Auswahl haben wir noch keine Rennen. Probier ein anderes " +
    "Land oder eine andere Saison.",
  legenda: "Profil = Höhenmeter pro Kilometer",
  poznamka:
    "Die Termine stammen aus einer schnellen Recherche — bitte vor der " +
    "Anmeldung beim Veranstalter prüfen. Bei jedem Rennen ist die Quelle " +
    "angegeben.",
  pocetZavodu: (n) => `${n} Rennen`,
  bezTerminu: (n) => `+ ${n} ohne bestätigten Termin`,
  mesice: [
    "Januar", "Februar", "März", "April", "Mai", "Juni",
    "Juli", "August", "September", "Oktober", "November", "Dezember",
  ],
  dnyZkratky: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
  dnyMrizka: ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"],
  profily: {
    rovina: "flach",
    zvlnena: "wellig",
    kopcovita: "hügelig",
    horska: "bergig",
  },
  uzavirky: {
    plna: "Straßen komplett gesperrt",
    castecna: "Teilweise gesperrt",
    provoz: "Bei laufendem Verkehr",
    nezname: "Sperren nicht bestätigt",
  },
  uzavreno: "gesperrt",
  casovka: "Zeitfahren",
  nedoplneno: "keine Angabe",
  tbc: "TBC",
  sloupecTrasa: "Strecke",
  sloupecKm: "km",
  sloupecHm: "Hm",
  sloupecProfil: "Profil",
  jednotkaHm: "Hm",
  trasyNedoplneny: "Strecken noch nicht erfasst.",
  silnice: "Straßen",
  startovne: "Startgeld",
  oficialniWeb: "Offizielle Website →",
  odkazNedoplnen: "kein Link hinterlegt",
  zdroj: "Quelle:",
  odkazPrihlasky: "Wer fährt mit? Zu den Anmeldungen →",
  kdoJede: "Anmelden · wer fährt mit →",
};

export const TEXTY: Record<Jazyk, Texty> = { cs: CS, de: DE };

/** Každý jazyk se nabízí svým vlastním jménem. */
export const NAZVY_JAZYKU: Record<Jazyk, string> = { cs: "Česky", de: "Deutsch" };

const KLIC_ULOZISTE = "roadbook-jazyk";

/** Uložená volba, jinak jazyk prohlížeče (německy mluvícím rovnou němčina). */
export function vychoziJazyk(): Jazyk {
  try {
    const ulozeny = window.localStorage.getItem(KLIC_ULOZISTE);
    if (ulozeny === "cs" || ulozeny === "de") return ulozeny;
  } catch {
    // úložiště nedostupné (soukromé okno, zablokovaná data) — jen se nepamatuje
  }
  return (navigator.language || "").toLowerCase().startsWith("de") ? "de" : "cs";
}

export function ulozJazyk(jazyk: Jazyk): void {
  try {
    window.localStorage.setItem(KLIC_ULOZISTE, jazyk);
  } catch {
    // viz vychoziJazyk
  }
}

/** Závod s textovými poli v daném jazyce; chybějící překlad = originál. */
export function lokalizujZavod(z: Zavod, jazyk: Jazyk): Zavod {
  const d = z.de;
  if (jazyk === "cs" || d === undefined) return z;
  return {
    ...z,
    nazev: d.nazev ?? z.nazev,
    misto: d.misto ?? z.misto,
    region: d.region ?? z.region,
    startovne: d.startovne ?? z.startovne,
    zdroj: d.zdroj ?? z.zdroj,
    trasy: d.trasy
      ? z.trasy.map((t, i) => ({ ...t, nazev: d.trasy?.[i] ?? t.nazev }))
      : z.trasy,
  };
}

export const TextyContext = createContext<Texty>(CS);

export function useTexty(): Texty {
  return useContext(TextyContext);
}
