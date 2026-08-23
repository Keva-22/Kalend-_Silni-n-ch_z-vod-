export type Zeme = 'CZ' | 'AT' | 'DE' | 'SK' | 'IT';
export type Overeno = 'ok' | 'check' | 'tbc';
export type Uzavirky = 'plna' | 'castecna' | 'provoz' | 'nezname';

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
}
