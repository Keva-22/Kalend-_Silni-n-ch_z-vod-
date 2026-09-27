import type { Zavod } from "./types";

/* Minimální deklarace toho, co do import.meta doplňuje Vite. Projekt nemá
   v tsconfigu typy "vite/client" a build config se v tomto kroku nemění,
   takže si vystačíme s tímhle. Díky tomu Vite v produkčním buildu podmínku
   vyhodnotí staticky a kontrola se do bundlu vůbec nedostane. */
declare global {
  interface ImportMeta {
    readonly env: { readonly DEV: boolean };
  }
}

/* Kontrola datového souboru zavody.ts.
   Hlídá dvě věci:
   1) tvar hodnot, které TypeScript sám neuhlídá (formát data, rozsah čísel, tvar URL),
   2) která rozšířená pole ještě nejsou doplněná.
   Bez závislostí, jen prostý TypeScript. */

/** Rozšířená volitelná pole, jejichž doplněnost sledujeme.
    `satisfies` zajistí, že se seznam při přejmenování pole v typu rozbije při buildu. */
export const ROZSIRENA_POLE = [
  "distanceKm",
  "elevationM",
  "profile",
  "startTime",
  "startLocation",
  "categories",
  "entryFee",
  "registrationUrl",
  "registrationDeadline",
  "gpxUrl",
  "resultsUrl",
  "organizer",
  "series",
  "status",
  "lastVerified",
  "sourceUrl",
] as const satisfies readonly (keyof Zavod)[];

export type RozsirenePole = (typeof ROZSIRENA_POLE)[number];

export interface KontrolaZavodu {
  id: string;
  nazev: string;
  chybi: RozsirenePole[];
  chyby: string[];
}

const ZEME = ["CZ", "AT", "DE", "SK", "IT", "HR"];
const OVERENO = ["ok", "check", "tbc"];
const UZAVIRKY = ["plna", "castecna", "provoz", "nezname"];
const PROFILE = ["flat", "hilly", "mountain"];
const STATUS = ["confirmed", "provisional", "cancelled"];
const FORMATY = ["mass-start", "time-trial"];

const DATUM = /^\d{4}-\d{2}-\d{2}$/;
const MESIC = /^\d{4}-\d{2}$/;
const CAS = /^\d{2}:\d{2}$/;

function jeText(h: unknown): boolean {
  return typeof h === "string" && h.trim().length > 0;
}

/** Zkontroluje jeden závod: vrátí seznam chyb tvaru a seznam nedoplněných polí. */
export function zkontrolujZavod(z: Zavod): KontrolaZavodu {
  const chyby: string[] = [];
  const vytkni = (podminka: boolean, zprava: string) => {
    if (!podminka) chyby.push(zprava);
  };

  // ── povinná pole původního modelu ──
  for (const pole of ["id", "nazev", "misto", "region", "zdroj"] as const) {
    vytkni(jeText(z[pole]), `${pole}: musí být neprázdný text`);
  }
  vytkni(ZEME.includes(z.zeme), `zeme: "${z.zeme}" není povolená hodnota`);
  vytkni(OVERENO.includes(z.overeno), `overeno: "${z.overeno}" není povolená hodnota`);
  vytkni(UZAVIRKY.includes(z.uzavirky), `uzavirky: "${z.uzavirky}" není povolená hodnota`);
  vytkni(z.datum === null || DATUM.test(z.datum), "datum: čekám 'YYYY-MM-DD' nebo null");
  if (z.datum === null) {
    vytkni(
      z.odhadMesic !== undefined && MESIC.test(z.odhadMesic),
      "odhadMesic: povinný ve tvaru 'YYYY-MM', když datum === null",
    );
  }
  vytkni(Array.isArray(z.trasy), "trasy: musí být pole");
  z.trasy.forEach((t, i) => {
    vytkni(jeText(t.nazev), `trasy[${i}].nazev: musí být neprázdný text`);
    vytkni(t.km === null || t.km > 0, `trasy[${i}].km: čekám kladné číslo nebo null`);
    vytkni(t.hm === null || t.hm >= 0, `trasy[${i}].hm: čekám nezáporné číslo nebo null`);
  });

  // ── rozšířená pole, kontrolují se jen když jsou vyplněná ──
  if (z.distanceKm !== undefined) {
    vytkni(z.distanceKm > 0, "distanceKm: čekám kladné číslo");
  }
  if (z.elevationM !== undefined) {
    vytkni(z.elevationM >= 0, "elevationM: čekám nezáporné číslo");
  }
  if (z.profile !== undefined) {
    vytkni(PROFILE.includes(z.profile), `profile: "${z.profile}" není povolená hodnota`);
  }
  if (z.startTime !== undefined) {
    vytkni(CAS.test(z.startTime), "startTime: čekám 'HH:MM'");
  }
  if (z.startLocation !== undefined) {
    vytkni(jeText(z.startLocation.city), "startLocation.city: musí být neprázdný text");
    vytkni(
      ZEME.includes(z.startLocation.country),
      `startLocation.country: "${z.startLocation.country}" není povolená hodnota`,
    );
    const { lat, lng } = z.startLocation;
    if (lat !== undefined) vytkni(lat >= -90 && lat <= 90, "startLocation.lat: mimo rozsah");
    if (lng !== undefined) vytkni(lng >= -180 && lng <= 180, "startLocation.lng: mimo rozsah");
  }
  if (z.categories !== undefined) {
    vytkni(
      z.categories.length > 0 && z.categories.every(jeText),
      "categories: čekám neprázdné pole neprázdných textů",
    );
  }
  for (const pole of ["entryFee", "organizer", "series"] as const) {
    const h = z[pole];
    if (h !== undefined) vytkni(jeText(h), `${pole}: musí být neprázdný text`);
  }
  for (const pole of ["registrationUrl", "gpxUrl", "resultsUrl", "sourceUrl"] as const) {
    const h = z[pole];
    if (h !== undefined) vytkni(h.startsWith("https://"), `${pole}: čekám URL začínající https://`);
  }
  for (const pole of ["registrationDeadline", "lastVerified"] as const) {
    const h = z[pole];
    if (h !== undefined) vytkni(DATUM.test(h), `${pole}: čekám 'YYYY-MM-DD'`);
  }
  if (z.status !== undefined) {
    vytkni(STATUS.includes(z.status), `status: "${z.status}" není povolená hodnota`);
  }
  if (z.format !== undefined) {
    vytkni(FORMATY.includes(z.format), `format: "${z.format}" není povolená hodnota`);
  }

  // ── německé znění ──
  if (z.de !== undefined) {
    for (const pole of ["nazev", "misto", "region", "startovne", "zdroj"] as const) {
      const h = z.de[pole];
      if (h !== undefined) vytkni(jeText(h), `de.${pole}: musí být neprázdný text`);
    }
    if (z.de.trasy !== undefined) {
      vytkni(
        z.de.trasy.length === z.trasy.length,
        `de.trasy: čekám ${z.trasy.length} názvů (stejně jako trasy), je jich ${z.de.trasy.length}`,
      );
      vytkni(z.de.trasy.every(jeText), "de.trasy: názvy musí být neprázdný text");
    }
    if (z.de.startovne !== undefined) {
      vytkni(z.startovne !== null, "de.startovne: vyplněno, ale startovne je null");
    }
  }

  const chybi = ROZSIRENA_POLE.filter((pole) => z[pole] === undefined);
  return { id: z.id, nazev: z.nazev, chybi, chyby };
}

/** Zkontroluje celý seznam závodů. */
export function zkontrolujZavody(zavody: Zavod[]): KontrolaZavodu[] {
  const kontroly = zavody.map(zkontrolujZavod);
  const idcka = new Set<string>();
  for (const z of zavody) {
    if (idcka.has(z.id)) {
      kontroly.find((k) => k.id === z.id)?.chyby.push(`id: "${z.id}" se opakuje`);
    }
    idcka.add(z.id);
  }
  return kontroly;
}

/** Vypíše do konzole chyby tvaru a přehled nedoplněných rozšířených polí. */
export function vypisKontrolu(zavody: Zavod[]): KontrolaZavodu[] {
  const kontroly = zkontrolujZavody(zavody);

  const svadne = kontroly.filter((k) => k.chyby.length > 0);
  if (svadne.length > 0) {
    console.group(`Kontrola dat: ${svadne.length} závodů má chybu tvaru`);
    for (const k of svadne) console.warn(`${k.id} — ${k.chyby.join("; ")}`);
    console.groupEnd();
  }

  const neuplne = kontroly.filter((k) => k.chybi.length > 0);
  if (neuplne.length > 0) {
    console.group(
      `Kontrola dat: ${neuplne.length} z ${zavody.length} závodů nemá doplněná všechna rozšířená pole`,
    );
    for (const k of neuplne) console.info(`${k.id} — chybí: ${k.chybi.join(", ")}`);
    console.groupEnd();
  }

  if (svadne.length === 0 && neuplne.length === 0) {
    console.info(`Kontrola dat: všech ${zavody.length} závodů je kompletních.`);
  }
  return kontroly;
}
