export type Zeme = 'CZ' | 'AT' | 'DE' | 'SK' | 'IT' | 'HR';
export type Overeno = 'ok' | 'check' | 'tbc';
export type Uzavirky = 'plna' | 'castecna' | 'provoz' | 'nezname';

/* ── Rozšířený model (krok 1) ─────────────────────────────────────
   Nová pole jsou VŠECHNA volitelná, aby stávající záznamy i komponenty
   zůstaly beze změny. Názvy jsou anglické podle zadání rozšíření, i když
   původní model je česky — část polí proto zrcadlí stávající česká pole
   (series ↔ serie, entryFee ↔ startovne, sourceUrl ↔ zdroj).
   ───────────────────────────────────────────────────────────────── */

export type Profile = 'flat' | 'hilly' | 'mountain';
export type Status = 'confirmed' | 'provisional' | 'cancelled';
export type Format = 'mass-start' | 'time-trial';

/** Německé znění textových polí. Vyplňuje se jen tam, kde se liší od
    originálu — vlastní jména (rakouská místa, názvy závodů) se nepřekládají. */
export interface PrekladZavodu {
  nazev?: string;
  misto?: string;
  region?: string;
  startovne?: string;
  zdroj?: string;
  trasy?: string[];                 // názvy tras ve stejném pořadí jako trasy[]
}

export interface StartLocation {
  city: string;
  country: Zeme;
  lat?: number;
  lng?: number;
}

export interface Trasa {
  nazev: string;
  km: number | null;
  hm: number | null;
}

export interface Zavod {
  id: string;
  nazev: string;
  misto: string;
  region: string;
  zeme: Zeme;
  datum: string | null;      // 'YYYY-MM-DD'; null = termín zatím nevyhlášen
  odhadMesic?: string;       // 'YYYY-MM'; povinné, když datum === null
  overeno: Overeno;          // ok = z oficiálního webu, check = z cizího kalendáře, tbc = bez termínu
  serie: string | null;
  trasy: Trasa[];
  uzavirky: Uzavirky;
  startovne: string | null;
  web: string | null;
  zdroj: string;

  /* ── Rozšířená volitelná pole ────────────────────────────────
     undefined = údaj zatím není ověřený. Nikdy se sem nedoplňuje
     odhad — chybějící hodnota je lepší než vymyšlená. */
  distanceKm?: number;              // km nejdelší trasy
  elevationM?: number;              // převýšení nejdelší trasy v metrech
  profile?: Profile;
  startTime?: string;               // 'HH:MM' místního času
  startLocation?: StartLocation;
  categories?: string[];            // vypsané kategorie závodu
  entryFee?: string;                // volný text včetně měny a termínů
  registrationUrl?: string;
  registrationDeadline?: string;    // 'YYYY-MM-DD'
  gpxUrl?: string;
  resultsUrl?: string;
  organizer?: string;               // jméno pořadatele
  series?: string;
  status?: Status;
  lastVerified?: string;            // 'YYYY-MM-DD', kdy byl záznam naposledy ověřen
  sourceUrl?: string;               // URL zdroje, ze kterého údaje pocházejí
  format?: Format;                  // undefined = hromadný start

  de?: PrekladZavodu;               // německé znění pro přepínač jazyka
}
