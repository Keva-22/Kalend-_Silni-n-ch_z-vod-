import type { Zavod } from "../types";

/* ═══════════════════════════════════════════════════════════════════
   DATA — tohle je jediný soubor, který se pravidelně edituje.
   Postup přidání nového závodu je popsaný v README.md.

   overeno:  'ok'    = termín z oficiálního webu závodu
             'check' = termín z cizího kalendáře, nutno ověřit
             'tbc'   = termín zatím nevyhlášen
   uzavirky: 'plna' | 'castecna' | 'provoz' | 'nezname'
   ═══════════════════════════════════════════════════════════════════ */

export const ZAVODY: Zavod[] = [
  // ─── 2026, zbytek sezóny ───────────────────────────────────────
  {
    id: "oetztaler-2026", nazev: "Ötztaler Radmarathon",
    misto: "Sölden", region: "Tirol", zeme: "AT",
    datum: "2026-08-30", overeno: "check", serie: null,
    trasy: [{ nazev: "Marathon", km: 227, hm: 5500 }],
    uzavirky: "nezname", startovne: null,
    web: "https://www.oetztaler-radmarathon.com",
    zdroj: "tirol.at",
  },
  {
    id: "sauwald-2026", nazev: "SauwaldGiro",
    misto: "Sauwald", region: "Oberösterreich", zeme: "AT",
    datum: "2026-08-30", overeno: "ok", serie: null,
    trasy: [{ nazev: "Lange Runde", km: 105, hm: 1600 }],
    uzavirky: "nezname", startovne: null,
    web: null, zdroj: "pořadatel",
  },
  {
    id: "carinthia200-2026", nazev: "Carinthia200",
    misto: "Villach", region: "Kärnten", zeme: "AT",
    datum: "2026-09-20", overeno: "ok", serie: null,
    trasy: [{ nazev: "Mittel", km: 105, hm: 1304 }],
    uzavirky: "nezname", startovne: null,
    web: null, zdroj: "pořadatel",
  },
  {
    id: "letape-rovinata-2026", nazev: "L'Etape Czech Republic — Rovinatá etapa",
    misto: "Pardubice", region: "Pardubický kraj", zeme: "CZ",
    datum: "2026-10-04", overeno: "ok", serie: "L'Etape by Tour de France",
    trasy: [{ nazev: "Hlavní trasa", km: 111, hm: 300 }],
    uzavirky: "plna",
    startovne: "1 990 Kč v předprodeji → 3 690 Kč",
    web: "https://www.letapeczech.cz",
    zdroj: "letapeczech.cz",
  },

  // ─── 2027 ──────────────────────────────────────────────────────
  {
    id: "imst-2027", nazev: "Imster Radmarathon",
    misto: "Imst", region: "Tirol", zeme: "AT",
    datum: "2027-05-23", overeno: "ok", serie: "Tiroler Rennrad Cup",
    trasy: [
      { nazev: "Strecke A", km: null, hm: null },
      { nazev: "Strecke B", km: null, hm: null },
      { nazev: "Panoramarunde", km: null, hm: null },
    ],
    uzavirky: "nezname",
    startovne: "56 € do 31. 12. 2026 → 80 € v den závodu",
    web: "https://www.imster-radmarathon.at",
    zdroj: "imster-radmarathon.at",
  },
  {
    id: "kaernten-2027", nazev: "ARBÖ Kärnten Radmarathon",
    misto: "Bad Kleinkirchheim", region: "Kärnten", zeme: "AT",
    datum: "2027-06-06", overeno: "ok", serie: null,
    trasy: [{ nazev: "Nockberge", km: null, hm: null }],
    uzavirky: "nezname",
    startovne: "sleva při brzké registraci · limit 800 startujících",
    web: "https://www.kaernten-radmarathon.at",
    zdroj: "kaernten-radmarathon.at",
  },
  {
    id: "fichtelberg-2027", nazev: "15. Fichtelberg-Radmarathon",
    misto: "Chemnitz", region: "Sachsen", zeme: "DE",
    datum: "2027-06-06", overeno: "check", serie: null,
    trasy: [{ nazev: "Marathon", km: 90, hm: 1900 }],
    uzavirky: "nezname", startovne: null,
    web: null, zdroj: "radsport-events.de",
  },
  {
    id: "krakonos-2027", nazev: "Casia Krakonošův cyklomaraton",
    misto: "Krkonoše", region: "Královéhradecký kraj", zeme: "CZ",
    datum: "2027-06-12", overeno: "ok", serie: null,
    trasy: [{ nazev: "Hlavní trasa", km: null, hm: null }],
    uzavirky: "nezname",
    startovne: "1 290 / 1 490 Kč do 31. 12. 2026 → 1 890 / 2 090 Kč",
    web: "https://krakonosuvcyklomaraton.cz",
    zdroj: "krakonosuvcyklomaraton.cz",
  },
  {
    id: "mondsee-2027", nazev: "Mondsee 5 Seen Radmarathon",
    misto: "Mondsee", region: "Oberösterreich", zeme: "AT",
    datum: "2027-06-20", overeno: "check", serie: null,
    trasy: [
      { nazev: "Kurz", km: 75, hm: 400 },
      { nazev: "Mittel", km: 140, hm: 1400 },
      { nazev: "Lang", km: 200, hm: 2600 },
    ],
    uzavirky: "nezname", startovne: null,
    web: "https://www.5seen-radmarathon.at",
    zdroj: "radsport-events.de",
  },
  {
    id: "tannheim-2027", nazev: "Rad-Marathon Tannheimer Tal",
    misto: "Tannheimer Tal", region: "Tirol", zeme: "AT",
    datum: "2027-07-04", overeno: "ok", serie: null,
    trasy: [{ nazev: "Marathon", km: null, hm: null }],
    uzavirky: "nezname", startovne: null,
    web: "https://www.rad-marathon.at",
    zdroj: "rad-marathon.at",
  },
  {
    id: "wachau-2027", nazev: "Wachau Radmarathon",
    misto: "Mautern an der Donau", region: "Niederösterreich", zeme: "AT",
    datum: "2027-07-18", overeno: "ok", serie: null,
    trasy: [
      { nazev: "Trasa 1", km: null, hm: null },
      { nazev: "Trasa 2", km: null, hm: null },
      { nazev: "Trasa 3", km: null, hm: null },
    ],
    uzavirky: "nezname", startovne: null,
    web: "https://www.wachau-radmarathon.at",
    zdroj: "wachau-radmarathon.at",
  },
  {
    id: "arlberg-2027", nazev: "Arlberg Giro",
    misto: "St. Anton am Arlberg", region: "Tirol", zeme: "AT",
    datum: "2027-08-01", overeno: "check", serie: "Tiroler Rennrad Cup",
    trasy: [{ nazev: "Giro", km: 150, hm: 2500 }],
    uzavirky: "nezname", startovne: null,
    web: null, zdroj: "tirol.at",
  },

  // ─── 2027, termín zatím nevyhlášen ─────────────────────────────
  {
    id: "letape-kopcovita-2027", nazev: "L'Etape Czech Republic — Kopcovitá etapa",
    misto: "Praha a okolí", region: "Praha", zeme: "CZ",
    datum: null, odhadMesic: "2027-06", overeno: "tbc",
    serie: "L'Etape by Tour de France",
    trasy: [
      { nazev: "Krátká", km: 58, hm: 450 },
      { nazev: "Střední", km: 105, hm: 1200 },
      { nazev: "Dlouhá", km: 135, hm: 1700 },
    ],
    uzavirky: "plna", startovne: null,
    web: "https://www.letapeczech.cz",
    zdroj: "ročník 2026 pro orientaci",
  },
  {
    id: "letape-rovinata-2027", nazev: "L'Etape Czech Republic — Rovinatá etapa",
    misto: "Pardubicko", region: "Pardubický kraj", zeme: "CZ",
    datum: null, odhadMesic: "2027-10", overeno: "tbc",
    serie: "L'Etape by Tour de France",
    trasy: [{ nazev: "Hlavní trasa", km: 111, hm: 300 }],
    uzavirky: "plna", startovne: null,
    web: "https://www.letapeczech.cz",
    zdroj: "ročník 2026 pro orientaci",
  },
  {
    id: "kufstein-2027", nazev: "Kufsteinerland Radmarathon",
    misto: "Kufstein", region: "Tirol", zeme: "AT",
    datum: null, odhadMesic: "2027-08", overeno: "tbc",
    serie: "Tiroler Rennrad Cup",
    trasy: [{ nazev: "Marathon", km: null, hm: null }],
    uzavirky: "nezname", startovne: null,
    web: "https://www.kufsteinerland-radmarathon.at",
    zdroj: "ročník 2026 pro orientaci",
  },
  {
    id: "oetztaler-2027", nazev: "Ötztaler Radmarathon",
    misto: "Sölden", region: "Tirol", zeme: "AT",
    datum: null, odhadMesic: "2027-08", overeno: "tbc", serie: null,
    trasy: [{ nazev: "Marathon", km: 227, hm: 5500 }],
    uzavirky: "nezname", startovne: null,
    web: "https://www.oetztaler-radmarathon.com",
    zdroj: "trasa dle ročníku 2026",
  },
  {
    id: "carinthia200-2027", nazev: "Carinthia200",
    misto: "Villach", region: "Kärnten", zeme: "AT",
    datum: null, odhadMesic: "2027-09", overeno: "tbc", serie: null,
    trasy: [{ nazev: "Mittel", km: 105, hm: 1304 }],
    uzavirky: "nezname", startovne: null,
    web: null, zdroj: "ročník 2026 pro orientaci",
  },
];
