import { PRIHLASKY_URL } from "./data/prihlasky";

/* Přihlášky na závody („Wer fährt mit?").
   Formulář je přímo na webu; přihlášku přijme Google Apps Script
   (apps-script/prihlasky.gs), uloží ji do tabulky a pošle správci e-mail
   se schválením. Web čte jen schválené přihlášky. */

export const PRIHLASKY_ZAPNUTE = PRIHLASKY_URL !== "";

if (import.meta.env.DEV) {
  if (!PRIHLASKY_ZAPNUTE) {
    console.info("Přihlášky jsou vypnuté: doplň PRIHLASKY_URL v src/data/prihlasky.ts (návod v README).");
  } else if (!/\/exec$/.test(PRIHLASKY_URL) && !PRIHLASKY_URL.startsWith("http://localhost")) {
    console.warn("Přihlášky: PRIHLASKY_URL by měla končit na /exec (adresa nasazené webové aplikace).");
  }
}

export type Odvoz = "nabizi" | "hleda" | "vyreseno";
const ODVOZY: readonly string[] = ["nabizi", "hleda", "vyreseno"];

/** Schválená přihláška, jak ji vydá server. */
export interface Prihlaska {
  zavodId: string;
  zavod: string;
  jmeno: string;
  trasa: string;
  tempo: string;
  odvoz: Odvoz | null;
  komentar: string;
}

/** Nová přihláška z formuláře. `web` je past na roboty — člověk ji nechá prázdnou. */
export interface NovaPrihlaska {
  zavodId: string;
  zavod: string;
  jmeno: string;
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

function text(v: unknown): string {
  return typeof v === "string" ? v : v == null ? "" : String(v);
}

/** Přihlášky z odpovědi serveru; cokoli nečekaného se zahodí. */
export function nactiPrihlasky(odpoved: unknown): Prihlaska[] {
  const seznam = (odpoved as { prihlasky?: unknown } | null)?.prihlasky;
  if (!Array.isArray(seznam)) throw new Error("Unerwartete Antwort vom Server.");
  return seznam
    .map((r: Record<string, unknown>): Prihlaska => {
      const odvoz = text(r?.odvoz);
      return {
        zavodId: text(r?.zavodId),
        zavod: text(r?.zavod),
        jmeno: text(r?.jmeno),
        trasa: text(r?.trasa),
        tempo: text(r?.tempo),
        odvoz: ODVOZY.includes(odvoz) ? (odvoz as Odvoz) : null,
        komentar: text(r?.komentar),
      };
    })
    .filter((p) => p.jmeno !== "" && p.zavodId !== "");
}

export async function stahniPrihlasky(): Promise<Prihlaska[]> {
  const odpoved = await fetch(`${PRIHLASKY_URL}?akce=seznam`);
  if (!odpoved.ok) throw new Error(`HTTP ${odpoved.status}`);
  return nactiPrihlasky(await odpoved.json());
}

/* text/plain = „jednoduchý" požadavek bez CORS preflightu, který Apps Script
   neumí obsloužit; tělo je přesto JSON. */
export async function odesliPrihlasku(p: NovaPrihlaska): Promise<void> {
  let data: { ok?: unknown; chyba?: unknown };
  try {
    const odpoved = await fetch(PRIHLASKY_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(p),
    });
    data = await odpoved.json();
  } catch {
    throw new ChybaPrihlasky("sit");
  }
  if (data.ok === true) return;
  const kod = text(data.chyba);
  throw new ChybaPrihlasky(
    kod === "souhlas" || kod === "neplatne" || kod === "limit" ? kod : "sit",
  );
}

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
