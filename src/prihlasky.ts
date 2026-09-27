import type { Zavod } from "./types";
import { FORMULAR_URL, TABULKA_CSV_URL } from "./data/prihlasky";

/* Přihlášky na závody („Wer fährt mit?").
   Přihlášku odešle návštěvník Google Formulářem; správce dostane e-mail
   a v Google Tabulce ji schválí. Stránka čte jen publikovanou záložku se
   schválenými řádky (CSV). Serverová část ani knihovna tu není. */

export const PRIHLASKY_ZAPNUTE = FORMULAR_URL !== "" && TABULKA_CSV_URL !== "";

if (import.meta.env.DEV) {
  if (!PRIHLASKY_ZAPNUTE) {
    console.info(
      "Přihlášky jsou vypnuté: doplň FORMULAR_URL a TABULKA_CSV_URL v src/data/prihlasky.ts (návod v README).",
    );
  } else {
    if (!FORMULAR_URL.includes("RENNEN")) {
      console.warn("Přihlášky: FORMULAR_URL neobsahuje RENNEN, závod se do formuláře nepředvyplní.");
    }
    if (!TABULKA_CSV_URL.includes("output=csv")) {
      console.warn("Přihlášky: TABULKA_CSV_URL nevypadá jako publikované CSV (chybí output=csv).");
    }
  }
}

export type Odvoz = "nabizi" | "hleda" | "vyreseno";

export interface Prihlaska {
  jmeno: string;
  zavodText: string;      // jak ho vyplnil formulář
  zavodId: string | null; // null = nepodařilo se přiřadit k závodu v kalendáři
  trasa: string;
  tempo: string;
  odvoz: Odvoz | null;
  odvozText: string;
  komentar: string;
}

/** Rozdělí CSV na řádky a buňky; zvládá uvozovky, "" uvnitř a zalomení v buňce. */
export function parsujCsv(text: string): string[][] {
  const radky: string[][] = [];
  let radek: string[] = [];
  let bunka = "";
  let vUvozovkach = false;
  const t = text.replace(/^﻿/, "");

  for (let i = 0; i < t.length; i++) {
    const z = t[i];
    if (vUvozovkach) {
      if (z === '"' && t[i + 1] === '"') {
        bunka += '"';
        i++;
      } else if (z === '"') {
        vUvozovkach = false;
      } else {
        bunka += z;
      }
    } else if (z === '"') {
      vUvozovkach = true;
    } else if (z === ",") {
      radek.push(bunka);
      bunka = "";
    } else if (z === "\n" || z === "\r") {
      if (z === "\r" && t[i + 1] === "\n") i++;
      radek.push(bunka);
      radky.push(radek);
      radek = [];
      bunka = "";
    } else {
      bunka += z;
    }
  }
  if (bunka !== "" || radek.length > 0) {
    radek.push(bunka);
    radky.push(radek);
  }
  return radky;
}

/* Sloupce se hledají podle začátku nadpisu (= názvu otázky ve formuláři),
   takže na pořadí sloupců v tabulce nezáleží. */
const SLOUPCE = {
  jmeno: ["name"],
  zavod: ["rennen"],
  trasa: ["strecke"],
  tempo: ["tempo"],
  odvoz: ["mitfahr"],
  komentar: ["kommentar", "bemerkung"],
} as const;

function najdiSloupec(hlavicka: string[], zacatky: readonly string[]): number {
  return hlavicka.findIndex((h) => {
    const n = h.trim().toLowerCase();
    return zacatky.some((z) => n.startsWith(z));
  });
}

function rozpoznejOdvoz(text: string): Odvoz | null {
  const n = text.toLowerCase();
  if (n.includes("suche")) return "hleda";
  if (n.includes("freie") || n.includes("biete") || n.includes("plätze")) return "nabizi";
  if (n.includes("geklärt") || n.includes("versorgt")) return "vyreseno";
  return null;
}

/** Závod z textu formuláře: podle id v závorce na konci, jinak podle názvu. */
function prirad(text: string, zavody: Zavod[]): string | null {
  const id = text.match(/\(([a-z0-9-]+)\)\s*$/i)?.[1]?.toLowerCase();
  if (id && zavody.some((z) => z.id === id)) return id;
  const nazev = text.trim().toLowerCase();
  return zavody.find((z) => z.nazev.toLowerCase() === nazev)?.id ?? null;
}

/** Schválené přihlášky z CSV. Chyba = tabulka má jiný tvar, než čekáme. */
export function nactiPrihlasky(csv: string, zavody: Zavod[]): Prihlaska[] {
  const radky = parsujCsv(csv).filter((r) => r.some((b) => b.trim() !== ""));
  if (radky.length === 0) return [];

  const [hlavicka, ...data] = radky;
  const iJmeno = najdiSloupec(hlavicka, SLOUPCE.jmeno);
  const iZavod = najdiSloupec(hlavicka, SLOUPCE.zavod);

  if (iJmeno < 0 || iZavod < 0) {
    // Dotaz QUERY bez výsledků vrací místo tabulky jen chybovou hodnotu (#N/A)
    const bunky = radky.flat().filter((b) => b.trim() !== "");
    if (bunky.every((b) => b.trim().startsWith("#"))) return [];
    throw new Error("Tabelle hat unerwartetes Format: Spalten „Name“ und „Rennen“ fehlen.");
  }

  const iTrasa = najdiSloupec(hlavicka, SLOUPCE.trasa);
  const iTempo = najdiSloupec(hlavicka, SLOUPCE.tempo);
  const iOdvoz = najdiSloupec(hlavicka, SLOUPCE.odvoz);
  const iKomentar = najdiSloupec(hlavicka, SLOUPCE.komentar);
  const bunka = (r: string[], i: number) => (i >= 0 ? (r[i] ?? "").trim() : "");

  return data
    .map((r): Prihlaska => {
      const odvozText = bunka(r, iOdvoz);
      const zavodText = bunka(r, iZavod);
      return {
        jmeno: bunka(r, iJmeno),
        zavodText,
        zavodId: prirad(zavodText, zavody),
        trasa: bunka(r, iTrasa),
        tempo: bunka(r, iTempo),
        odvoz: rozpoznejOdvoz(odvozText),
        odvozText,
        komentar: bunka(r, iKomentar),
      };
    })
    .filter((p) => p.jmeno !== "" && !p.jmeno.startsWith("#") && p.zavodText !== "");
}

export async function stahniPrihlasky(zavody: Zavod[]): Promise<Prihlaska[]> {
  const odpoved = await fetch(TABULKA_CSV_URL);
  if (!odpoved.ok) throw new Error(`HTTP ${odpoved.status}`);
  return nactiPrihlasky(await odpoved.text(), zavody);
}

/** Odkaz na formulář s předvyplněným závodem ("Název (id)"). */
export function odkazNaFormular(z: Zavod): string {
  return FORMULAR_URL.replace("RENNEN", encodeURIComponent(`${z.nazev} (${z.id})`));
}

/** Dnešní datum 'YYYY-MM-DD' v místním čase. */
export function dnesniDatum(): string {
  const d = new Date();
  const dvoj = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${dvoj(d.getMonth() + 1)}-${dvoj(d.getDate())}`;
}

/** Závod, který se teprve pojede (u TBC podle odhadovaného měsíce). */
export function jeBudouci(z: Zavod, dnes: string): boolean {
  if (z.datum) return z.datum >= dnes;
  return (z.odhadMesic ?? "") >= dnes.slice(0, 7);
}
