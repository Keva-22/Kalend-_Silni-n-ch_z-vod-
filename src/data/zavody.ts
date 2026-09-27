import type { Zavod } from "../types";
import { vypisKontrolu } from "../validace";

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

    /* ── rozšířená pole ── */
    distanceKm: 227,
    elevationM: 5500,
    profile: "mountain",  // [uncertain] odvozeno z hm/km = 24.2
    startLocation: { city: "Sölden", country: "AT" },
    status: "provisional",  // [uncertain] odvozeno z overeno="check"
  },
  {
    id: "sauwald-2026", nazev: "SauwaldGiro",
    misto: "Sauwald", region: "Oberösterreich", zeme: "AT",
    datum: "2026-08-30", overeno: "ok", serie: null,
    trasy: [{ nazev: "Lange Runde", km: 105, hm: 1600 }],
    uzavirky: "nezname", startovne: null,
    web: null, zdroj: "pořadatel",

    /* ── rozšířená pole ── */
    distanceKm: 105,
    elevationM: 1600,
    profile: "hilly",  // [uncertain] odvozeno z hm/km = 15.2
    startLocation: { city: "Sauwald", country: "AT" },
    status: "confirmed",  // [uncertain] odvozeno z overeno="ok"
  },
  {
    id: "carinthia200-2026", nazev: "Carinthia200",
    misto: "Villach", region: "Kärnten", zeme: "AT",
    datum: "2026-09-20", overeno: "ok", serie: null,
    trasy: [{ nazev: "Mittel", km: 105, hm: 1304 }],
    uzavirky: "nezname", startovne: null,
    web: null, zdroj: "pořadatel",

    /* ── rozšířená pole ── */
    distanceKm: 105,
    elevationM: 1304,
    profile: "hilly",  // [uncertain] odvozeno z hm/km = 12.4
    startLocation: { city: "Villach", country: "AT" },
    status: "confirmed",  // [uncertain] odvozeno z overeno="ok"
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

    /* ── rozšířená pole ── */
    distanceKm: 111,
    elevationM: 300,
    profile: "flat",  // [uncertain] odvozeno z hm/km = 2.7
    startLocation: { city: "Pardubice", country: "CZ" },
    entryFee: "1 990 Kč v předprodeji → 3 690 Kč",
    series: "L'Etape by Tour de France",
    status: "confirmed",  // [uncertain] odvozeno z overeno="ok"
    sourceUrl: "https://www.letapeczech.cz",  // [uncertain] zdroj "letapeczech.cz" odpovídá doméně webu
  },

  // ─── 2027 ──────────────────────────────────────────────────────
  {
    id: "imst-2027", nazev: "Imster Radmarathon",
    misto: "Imst", region: "Tirol", zeme: "AT",
    datum: "2027-05-23", overeno: "ok", serie: "Tiroler Rennrad Cup",
    // km/hm dle posledního odjetého ročníku; zdroj: imst.at, radsport-rennrad.de
    trasy: [
      { nazev: "Strecke A", km: 110, hm: 2300 },    // [uncertain]
      { nazev: "Strecke B", km: 90, hm: 1300 },     // [uncertain] zdroj uvádí "ca. 90 km"
      { nazev: "Panoramarunde", km: 70, hm: 700 },  // [uncertain]
    ],
    uzavirky: "nezname",
    startovne: "56 € do 31. 12. 2026 → 80 € v den závodu",
    web: "https://www.imster-radmarathon.at",
    zdroj: "imster-radmarathon.at",

    /* ── rozšířená pole ── */
    distanceKm: 110,   // [uncertain] nejdelší ze 3 tras, ročník 2026
    elevationM: 2300,  // [uncertain] ročník 2026
    profile: "hilly",  // [uncertain] odvozeno z hm/km = 20.9
    startLocation: { city: "Imst", country: "AT" },
    entryFee: "56 € do 31. 12. 2026 → 80 € v den závodu",
    series: "Tiroler Rennrad Cup",
    status: "confirmed",  // [uncertain] odvozeno z overeno="ok"
    sourceUrl: "https://www.imster-radmarathon.at",  // [uncertain] zdroj "imster-radmarathon.at" odpovídá doméně webu
  },
  {
    id: "kaernten-2027", nazev: "ARBÖ Kärnten Radmarathon",
    misto: "Bad Kleinkirchheim", region: "Kärnten", zeme: "AT",
    datum: "2027-06-06", overeno: "ok", serie: null,
    // Pozor: prameny se u převýšení rozcházejí (2140 / 2150 / 2236 / 2360 hm).
    // Použito 2140 hm dle nockalmstrasse.at; délka 106 km je napříč zdroji shodná.
    trasy: [
      { nazev: "Nockberge", km: 106, hm: 2140 },     // [uncertain] rozpor mezi zdroji
      { nazev: "2-Seen-Runde", km: 65, hm: null },   // [uncertain] převýšení zdroj neuvádí
    ],
    uzavirky: "nezname",
    startovne: "sleva při brzké registraci · limit 800 startujících",
    web: "https://www.kaernten-radmarathon.at",
    zdroj: "kaernten-radmarathon.at",

    /* ── rozšířená pole ── */
    distanceKm: 106,   // [uncertain] delší ze 2 tras
    elevationM: 2140,  // [uncertain] prameny uvádějí 2140 až 2360 hm
    profile: "hilly",  // [uncertain] odvozeno z hm/km = 20.2
    startLocation: { city: "Bad Kleinkirchheim", country: "AT" },
    entryFee: "sleva při brzké registraci · limit 800 startujících",
    status: "confirmed",  // [uncertain] odvozeno z overeno="ok"
    sourceUrl: "https://www.kaernten-radmarathon.at",  // [uncertain] zdroj "kaernten-radmarathon.at" odpovídá doméně webu
  },
  {
    id: "fichtelberg-2027", nazev: "15. Fichtelberg-Radmarathon",
    misto: "Chemnitz", region: "Sachsen", zeme: "DE",
    datum: "2027-06-06", overeno: "check", serie: null,
    trasy: [{ nazev: "Marathon", km: 90, hm: 1900 }],
    uzavirky: "nezname", startovne: null,
    web: null, zdroj: "radsport-events.de",

    /* ── rozšířená pole ── */
    distanceKm: 90,
    elevationM: 1900,
    profile: "hilly",  // [uncertain] odvozeno z hm/km = 21.1
    startLocation: { city: "Chemnitz", country: "DE" },
    status: "provisional",  // [uncertain] odvozeno z overeno="check"
  },
  {
    id: "krakonos-2027", nazev: "Casia Krakonošův cyklomaraton",
    misto: "Krkonoše", region: "Královéhradecký kraj", zeme: "CZ",
    datum: "2027-06-12", overeno: "ok", serie: null,
    // km/hm dle 13. ročníku (13. 6. 2026); zdroje uvádějí hodnoty jako přibližné
    trasy: [
      { nazev: "Hlavní trasa", km: 140, hm: 2300 },  // [uncertain] zdroj uvádí "cca"
      { nazev: "Krátká trasa", km: 90, hm: 1200 },   // [uncertain] zdroj uvádí "cca"
    ],
    uzavirky: "nezname",
    startovne: "1 290 / 1 490 Kč do 31. 12. 2026 → 1 890 / 2 090 Kč",
    web: "https://krakonosuvcyklomaraton.cz",
    zdroj: "krakonosuvcyklomaraton.cz",

    /* ── rozšířená pole ── */
    distanceKm: 140,   // [uncertain] delší ze 2 tras, ročník 2026
    elevationM: 2300,  // [uncertain] ročník 2026
    profile: "hilly",  // [uncertain] odvozeno z hm/km = 16.4
    startTime: "10:00",  // [uncertain] čas startu dlouhé trasy v ročníku 2026
    // start i cíl je u centra UFFO v Trutnově; pole misto zůstává "Krkonoše"
    startLocation: { city: "Trutnov", country: "CZ" },
    entryFee: "1 290 / 1 490 Kč do 31. 12. 2026 → 1 890 / 2 090 Kč",
    status: "confirmed",  // [uncertain] odvozeno z overeno="ok"
    sourceUrl: "https://krakonosuvcyklomaraton.cz",  // [uncertain] zdroj "krakonosuvcyklomaraton.cz" odpovídá doméně webu
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

    /* ── rozšířená pole ── */
    distanceKm: 200,  // [uncertain] nejdelší ze 3 změřených tras
    elevationM: 2600,  // [uncertain] nejdelší ze 3 změřených tras
    profile: "hilly",  // [uncertain] odvozeno z hm/km = 13.0
    startLocation: { city: "Mondsee", country: "AT" },
    status: "provisional",  // [uncertain] odvozeno z overeno="check"
  },
  {
    id: "dreilaendergiro-2027", nazev: "Dreiländergiro",
    misto: "Nauders", region: "Tirol", zeme: "AT",
    datum: "2027-06-27", overeno: "check", serie: null,
    // trasa vede přes Rakousko, Itálii a Švýcarsko (Stilfserjoch, Umbrailpass)
    trasy: [
      { nazev: "Strecke A – Stelvio Engadin", km: 168, hm: 3300 },   // [uncertain]
      { nazev: "Strecke B – Stelvio Vinschgau", km: 120, hm: 3000 }, // [uncertain]
    ],
    uzavirky: "nezname", startovne: null,
    web: "https://www.dreilaendergiro.at",
    zdroj: "dreilaendergiro.at / tirol.at (vyhledávání 27. 9. 2026)",

    /* ── rozšířená pole ── */
    distanceKm: 168,   // [uncertain] nejdelší ze 2 tras
    elevationM: 3300,  // [uncertain]
    profile: "hilly",  // [uncertain] odvozeno z hm/km = 19.6
    startLocation: { city: "Nauders", country: "AT" },
    status: "provisional",  // [uncertain] odvozeno z overeno="check"
    sourceUrl: "https://www.dreilaendergiro.at",  // [uncertain] domovská stránka pořadatele
  },
  {
    id: "tannheim-2027", nazev: "Rad-Marathon Tannheimer Tal",
    misto: "Tannheimer Tal", region: "Tirol", zeme: "AT",
    datum: "2027-07-04", overeno: "ok", serie: null,
    // km/hm dle rad-marathon.at, kde jsou trasy pojmenované délkou
    trasy: [
      { nazev: "Marathon", km: 214, hm: 3500 },      // [uncertain]
      { nazev: "Strecke 138 km", km: 138, hm: 870 }, // [uncertain]
      { nazev: "Strecke 103 km", km: 103, hm: 760 }, // [uncertain]
      { nazev: "Strecke 66 km", km: 66, hm: 600 },   // [uncertain]
    ],
    uzavirky: "nezname", startovne: null,
    web: "https://www.rad-marathon.at",
    zdroj: "rad-marathon.at",

    /* ── rozšířená pole ── */
    distanceKm: 214,   // [uncertain] nejdelší ze 4 tras
    elevationM: 3500,  // [uncertain]
    profile: "hilly",  // [uncertain] odvozeno z hm/km = 16.4
    startLocation: { city: "Tannheimer Tal", country: "AT" },
    status: "confirmed",  // [uncertain] odvozeno z overeno="ok"
    sourceUrl: "https://www.rad-marathon.at",  // [uncertain] zdroj "rad-marathon.at" odpovídá doméně webu
  },
  {
    id: "wachau-2027", nazev: "Wachau Radmarathon",
    misto: "Mautern an der Donau", region: "Niederösterreich", zeme: "AT",
    datum: "2027-07-18", overeno: "ok", serie: null,
    // zástupné názvy nahrazeny oficiálními; km/hm dle wachau-radmarathon.at
    trasy: [
      { nazev: "Wachau Light Radmarathon", km: 53.2, hm: 463 },      // [uncertain]
      { nazev: "Raiffeisen Power Radmarathon", km: 103.5, hm: 953 }, // [uncertain]
      { nazev: "Krone Champions Radmarathon", km: 200, hm: 3058 },   // [uncertain]
    ],
    uzavirky: "nezname", startovne: null,
    web: "https://www.wachau-radmarathon.at",
    zdroj: "wachau-radmarathon.at",

    /* ── rozšířená pole ── */
    distanceKm: 200,   // [uncertain] nejdelší ze 3 tras
    elevationM: 3058,  // [uncertain]
    profile: "hilly",  // [uncertain] odvozeno z hm/km = 15.3
    startLocation: { city: "Mautern an der Donau", country: "AT" },
    status: "confirmed",  // [uncertain] odvozeno z overeno="ok"
    sourceUrl: "https://www.wachau-radmarathon.at",  // [uncertain] zdroj "wachau-radmarathon.at" odpovídá doméně webu
  },
  {
    id: "arlberg-2027", nazev: "Arlberg Giro",
    misto: "St. Anton am Arlberg", region: "Tirol", zeme: "AT",
    datum: "2027-08-01", overeno: "check", serie: "Tiroler Rennrad Cup",
    trasy: [{ nazev: "Giro", km: 150, hm: 2500 }],
    uzavirky: "nezname", startovne: null,
    web: null, zdroj: "tirol.at",

    /* ── rozšířená pole ── */
    distanceKm: 150,
    elevationM: 2500,
    profile: "hilly",  // [uncertain] odvozeno z hm/km = 16.7
    startLocation: { city: "St. Anton am Arlberg", country: "AT" },
    series: "Tiroler Rennrad Cup",
    status: "provisional",  // [uncertain] odvozeno z overeno="check"
  },

  {
    id: "kitzbuehel-2027", nazev: "Kitzbüheler Radmarathon",
    misto: "Kitzbühel", region: "Tirol", zeme: "AT",
    datum: "2027-09-05", overeno: "check", serie: null,
    // hlavní trasa končí výjezdem na Kitzbüheler Horn, KRM Kitz cílí ve Vorderstadt
    trasy: [
      { nazev: "Marathon", km: 216, hm: 4600 },  // [uncertain]
      { nazev: "KRM Kitz", km: 209, hm: 3800 },  // [uncertain]
    ],
    uzavirky: "nezname", startovne: null,
    web: "https://kitzbueheler-radmarathon.at",
    zdroj: "kitzbuehel.com (termín), kitzbueheler-radmarathon.at (trasy), vyhledávání 27. 9. 2026",

    /* ── rozšířená pole ── */
    distanceKm: 216,   // [uncertain] nejdelší ze 2 tras
    elevationM: 4600,  // [uncertain]
    profile: "hilly",  // [uncertain] odvozeno z hm/km = 21.3
    startLocation: { city: "Kitzbühel", country: "AT" },
    status: "provisional",  // [uncertain] odvozeno z overeno="check"
    registrationUrl: "https://kitzbueheler-radmarathon.at/anmeldung/",  // [uncertain] z výpisu vyhledávání, nenačteno
    resultsUrl: "https://kitzbueheler-radmarathon.at/rennen/ergebnisse/",  // [uncertain] z výpisu vyhledávání, nenačteno
    sourceUrl: "https://www.kitzbuehel.com/events/alle-highlight-veranstaltungen/kitzbueheler-radmarathon/",  // [uncertain]
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

    /* ── rozšířená pole ── */
    distanceKm: 135,  // [uncertain] nejdelší ze 3 změřených tras
    elevationM: 1700,  // [uncertain] nejdelší ze 3 změřených tras
    profile: "hilly",  // [uncertain] odvozeno z hm/km = 12.6
    startLocation: { city: "Praha a okolí", country: "CZ" },
    series: "L'Etape by Tour de France",
    status: "provisional",  // [uncertain] odvozeno z overeno="tbc"
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

    /* ── rozšířená pole ── */
    distanceKm: 111,
    elevationM: 300,
    profile: "flat",  // [uncertain] odvozeno z hm/km = 2.7
    startLocation: { city: "Pardubicko", country: "CZ" },
    series: "L'Etape by Tour de France",
    status: "provisional",  // [uncertain] odvozeno z overeno="tbc"
  },
  {
    id: "kufstein-2027", nazev: "Kufsteinerland Radmarathon",
    misto: "Kufstein", region: "Tirol", zeme: "AT",
    datum: null, odhadMesic: "2027-08", overeno: "tbc",
    serie: "Tiroler Rennrad Cup",
    // km/hm dle 10. ročníku (23. 8. 2026); zdroj: kufsteinerland-radmarathon.at
    trasy: [
      { nazev: "Marathon", km: 120, hm: 1800 },     // [uncertain] zdroj uvádí "ca. 1800 hm"
      { nazev: "Seenrunde", km: 95, hm: 1160 },     // [uncertain]
      { nazev: "Panoramarunde", km: 48, hm: 400 },  // [uncertain]
    ],
    uzavirky: "nezname", startovne: null,
    web: "https://www.kufsteinerland-radmarathon.at",
    zdroj: "ročník 2026 pro orientaci",

    /* ── rozšířená pole ── */
    distanceKm: 120,   // [uncertain] nejdelší ze 3 tras, ročník 2026
    elevationM: 1800,  // [uncertain] ročník 2026
    profile: "hilly",  // [uncertain] odvozeno z hm/km = 15.0
    startLocation: { city: "Kufstein", country: "AT" },
    series: "Tiroler Rennrad Cup",
    status: "provisional",  // [uncertain] odvozeno z overeno="tbc"
  },
  {
    id: "oetztaler-2027", nazev: "Ötztaler Radmarathon",
    misto: "Sölden", region: "Tirol", zeme: "AT",
    datum: null, odhadMesic: "2027-08", overeno: "tbc", serie: null,
    trasy: [{ nazev: "Marathon", km: 227, hm: 5500 }],
    uzavirky: "nezname", startovne: null,
    web: "https://www.oetztaler-radmarathon.com",
    zdroj: "trasa dle ročníku 2026",

    /* ── rozšířená pole ── */
    distanceKm: 227,
    elevationM: 5500,
    profile: "mountain",  // [uncertain] odvozeno z hm/km = 24.2
    startLocation: { city: "Sölden", country: "AT" },
    status: "provisional",  // [uncertain] odvozeno z overeno="tbc"
  },
  {
    id: "carinthia200-2027", nazev: "Carinthia200",
    misto: "Villach", region: "Kärnten", zeme: "AT",
    datum: null, odhadMesic: "2027-09", overeno: "tbc", serie: null,
    trasy: [{ nazev: "Mittel", km: 105, hm: 1304 }],
    uzavirky: "nezname", startovne: null,
    web: null, zdroj: "ročník 2026 pro orientaci",

    /* ── rozšířená pole ── */
    distanceKm: 105,
    elevationM: 1304,
    profile: "hilly",  // [uncertain] odvozeno z hm/km = 12.4
    startLocation: { city: "Villach", country: "AT" },
    status: "provisional",  // [uncertain] odvozeno z overeno="tbc"
  },
];

/* Kontrola dat běží jen ve vývoji — v produkčním buildu je podmínka
   staticky nepravdivá, takže se validace do bundlu nezabalí. */
if (import.meta.env.DEV) {
  vypisKontrolu(ZAVODY);
}
