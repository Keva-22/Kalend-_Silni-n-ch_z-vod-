import { PRIHLASKY_URL } from "./data/prihlasky";

/* Přihlášky na závody („Wer fährt mit?").
   Formulář je přímo na webu, přihlášky přijímá Google Apps Script
   (apps-script/prihlasky.gs). Schvaluje se osoba: kdo se přihlásí poprvé,
   dostane tajný osobní klíč a správce ho jednou schválí. Pak už se jeho
   přihlášky a změny zobrazují rovnou. Klíč si pamatuje prohlížeč; na jiné
   zařízení se přenese osobním odkazem. */

export const PRIHLASKY_ZAPNUTE = PRIHLASKY_URL !== "";

if (import.meta.env.DEV) {
  if (!PRIHLASKY_ZAPNUTE) {
    console.info("Přihlášky jsou vypnuté: doplň PRIHLASKY_URL v src/data/prihlasky.ts (návod v README).");
  } else if (!/\/exec$/.test(PRIHLASKY_URL) && !PRIHLASKY_URL.startsWith("http://localhost")) {
    console.warn("Přihlášky: PRIHLASKY_URL by měla končit na /exec (adresa nasazené webové aplikace).");
  }
}

export type Odvoz = "nabizi" | "hleda" | "vyreseno";
export type Ucast = "jede" | "mozna";
export type StavOsoby = "ceka" | "schvaleno" | "zamitnuto";
const ODVOZY: readonly string[] = ["nabizi", "hleda", "vyreseno"];

/** Přihláška bez jména — tak ji server vrací v přehledu „moje". */
export interface Udaje {
  zavodId: string;
  zavod: string;
  ucast: Ucast;
  trasa: string;
  tempo: string;
  odvoz: Odvoz | null;
  komentar: string;
}

/** Veřejná přihláška schválené osoby. */
export interface Prihlaska extends Udaje {
  jmeno: string;
}

/** Já podle osobního klíče: jméno, stav schválení a všechny moje přihlášky. */
export interface Ja {
  jmeno: string;
  stav: StavOsoby;
  prihlasky: Udaje[];
}

/** Co posílá formulář. `web` je past na roboty — člověk ji nechá prázdnou. */
export interface Ulozeni {
  klic: string | null;
  zavodId: string;
  zavod: string;
  jmeno: string;
  ucast: Ucast;
  trasa: string;
  tempo: string;
  odvoz: Odvoz | "";
  komentar: string;
  souhlas: boolean;
  web: string;
}

export type KodChyby = "souhlas" | "neplatne" | "limit" | "sit";

export class ChybaPrihlasky extends Error {
  kod: KodChyby;
  constructor(kod: KodChyby) {
    super(kod);
    this.kod = kod;
  }
}

/* ── osobní klíč v prohlížeči ─────────────────────────────────────── */

const KLIC_ULOZISTE = "roadbook-osobni-klic";
export const PLATNY_KLIC = /^[0-9a-f]{32}$/;

export function nactiKlic(): string | null {
  try {
    const k = window.localStorage.getItem(KLIC_ULOZISTE);
    return k && PLATNY_KLIC.test(k) ? k : null;
  } catch {
    return null; // úložiště nedostupné — klíč vydrží jen do zavření stránky
  }
}

export function ulozKlic(klic: string): void {
  try {
    window.localStorage.setItem(KLIC_ULOZISTE, klic);
  } catch {
    // viz nactiKlic
  }
}

export function zapomenKlic(): void {
  try {
    window.localStorage.removeItem(KLIC_ULOZISTE);
  } catch {
    // viz nactiKlic
  }
}

/** Odkaz, kterým si člověk přenese svůj klíč na jiné zařízení. */
export function osobniOdkaz(klic: string): string {
  return `${window.location.origin}${window.location.pathname}#mitfahren/ich/${klic}`;
}

/* ── komunikace se serverem ───────────────────────────────────────── */

function text(v: unknown): string {
  return typeof v === "string" ? v : v == null ? "" : String(v);
}

function udaje(r: Record<string, unknown>): Udaje {
  const odvoz = text(r?.odvoz);
  return {
    zavodId: text(r?.zavodId),
    zavod: text(r?.zavod),
    ucast: r?.ucast === "mozna" ? "mozna" : "jede",
    trasa: text(r?.trasa),
    tempo: text(r?.tempo),
    odvoz: ODVOZY.includes(odvoz) ? (odvoz as Odvoz) : null,
    komentar: text(r?.komentar),
  };
}

/** Odpověď serveru → data pro stránku; cokoli nečekaného se zahodí. */
export function nactiOdpoved(odpoved: unknown): { verejne: Prihlaska[]; ja: Ja | null } {
  const o = odpoved as { prihlasky?: unknown; ja?: unknown } | null;
  if (!Array.isArray(o?.prihlasky)) throw new Error("Unerwartete Antwort vom Server.");
  const verejne = o.prihlasky
    .map((r: Record<string, unknown>): Prihlaska => ({ jmeno: text(r?.jmeno), ...udaje(r) }))
    .filter((p) => p.jmeno !== "" && p.zavodId !== "");
  const j = o.ja as { jmeno?: unknown; stav?: unknown; prihlasky?: unknown } | undefined;
  const ja: Ja | null = j
    ? {
        jmeno: text(j.jmeno),
        stav: j.stav === "schvaleno" || j.stav === "zamitnuto" ? j.stav : "ceka",
        prihlasky: Array.isArray(j.prihlasky)
          ? j.prihlasky.map(udaje).filter((p) => p.zavodId !== "")
          : [],
      }
    : null;
  return { verejne, ja };
}

export async function stahniPrihlasky(klic: string | null) {
  const dotaz = klic ? `?akce=seznam&klic=${klic}` : "?akce=seznam";
  const odpoved = await fetch(PRIHLASKY_URL + dotaz);
  if (!odpoved.ok) throw new Error(`HTTP ${odpoved.status}`);
  return nactiOdpoved(await odpoved.json());
}

/* text/plain = „jednoduchý" požadavek bez CORS preflightu, který Apps Script
   neumí obsloužit; tělo je přesto JSON. */
async function posli(telo: object): Promise<{ klic?: unknown; stav?: unknown }> {
  let data: { ok?: unknown; chyba?: unknown; klic?: unknown; stav?: unknown };
  try {
    const odpoved = await fetch(PRIHLASKY_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(telo),
    });
    data = await odpoved.json();
  } catch {
    throw new ChybaPrihlasky("sit");
  }
  if (data.ok === true) return data;
  const kod = text(data.chyba);
  throw new ChybaPrihlasky(
    kod === "souhlas" || kod === "neplatne" || kod === "limit" ? kod : "sit",
  );
}

export async function ulozPrihlasku(
  p: Ulozeni,
): Promise<{ klic: string | null; stav: StavOsoby }> {
  const data = await posli({ akce: "ulozit", ...p });
  const klic = text(data.klic);
  const stav = data.stav === "schvaleno" || data.stav === "zamitnuto" ? data.stav : "ceka";
  return { klic: PLATNY_KLIC.test(klic) ? klic : null, stav };
}

export async function smazPrihlasku(klic: string, zavodId: string): Promise<void> {
  await posli({ akce: "smazat", klic, zavodId });
}

/* ── datum ────────────────────────────────────────────────────────── */

/** Dnešní datum 'YYYY-MM-DD' v místním čase. */
export function dnesniDatum(): string {
  const d = new Date();
  const dvoj = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${dvoj(d.getMonth() + 1)}-${dvoj(d.getDate())}`;
}

/** Závod, který se teprve pojede (u TBC podle odhadovaného měsíce). */
export function jeBudouci(z: { datum: string | null; odhadMesic?: string }, dnes: string): boolean {
  if (z.datum) return z.datum >= dnes;
  return (z.odhadMesic ?? "") >= dnes.slice(0, 7);
}
