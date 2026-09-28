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
    de: { zdroj: "Veranstalter" },
  },
  {
    id: "carinthia200-2026", nazev: "Carinthia200",
    misto: "Villach", region: "Kärnten", zeme: "AT",
    datum: "2026-09-20", overeno: "ok", serie: null,
    // Oprava: dřívější údaj "Mittel 105 km / 1304 hm" neodpovídá žádné
    // vypsané trase. Pořadatel uvádí tři trasy; zdroj: carinthia200.com
    trasy: [
      { nazev: "125 km", km: 125, hm: 1575 },  // [uncertain]
      { nazev: "155 km", km: 155, hm: 2630 },  // [uncertain]
      { nazev: "200 km", km: 200, hm: 3285 },  // [uncertain]
    ],
    uzavirky: "nezname", startovne: null,
    web: null, zdroj: "pořadatel",

    /* ── rozšířená pole ── */
    distanceKm: 200,   // [uncertain] nejdelší ze 3 tras
    elevationM: 3285,  // [uncertain]
    profile: "hilly",  // [uncertain] odvozeno z hm/km = 16.4
    startLocation: { city: "Villach", country: "AT" },
    status: "confirmed",  // [uncertain] odvozeno z overeno="ok"
    de: { zdroj: "Veranstalter" },
  },
  {
    id: "istria300-2026", nazev: "Istria300",
    misto: "Poreč", region: "Istra", zeme: "HR",
    // ročník 2026 byl mimořádně posunut z konce září kvůli změnám v kalendáři UCI
    datum: "2026-10-03", overeno: "ok", serie: null,
    trasy: [
      { nazev: "Istria300", km: 300.5, hm: 5150 },  // [uncertain]
      { nazev: "Istria209", km: 209, hm: 3250 },    // [uncertain]
      { nazev: "Istria135", km: 134.5, hm: 1800 },  // [uncertain]
    ],
    uzavirky: "nezname", startovne: null,
    web: "https://www.istria300.com",
    zdroj: "istria300.com (vyhledávání 27. 9. 2026)",

    /* ── rozšířená pole ── */
    distanceKm: 300.5,  // [uncertain] nejdelší ze 3 tras
    elevationM: 5150,   // [uncertain]
    profile: "hilly",   // [uncertain] odvozeno z hm/km = 17.1
    startLocation: { city: "Poreč", country: "HR" },
    status: "confirmed",  // [uncertain] odvozeno z overeno="ok"
    registrationUrl: "https://www.istria300.com/istria300-registration/",  // [uncertain] z výpisu vyhledávání, nenačteno
    sourceUrl: "https://www.istria300.com/istria300-will-take-place-on-a-new-date-next-year/",  // [uncertain]
    de: { zdroj: "istria300.com (Websuche 27. 9. 2026)" },
  },
  {
    id: "letape-rovinata-2026", nazev: "L'Etape Czech Republic — Rovinatá etapa",
    misto: "Pardubice", region: "Pardubický kraj", zeme: "CZ",
    // Termín dle stránky pořadatele "Rovinatá etapa 3. 10. 2026" a jejího
    // harmonogramu soboty 3. 10. (start 10:30). Starší tisková zpráva
    // uváděla neděli 4. 10. — ta už neplatí. (vyhledávání 28. 9. 2026)
    datum: "2026-10-03", overeno: "ok", serie: "L'Etape by Tour de France",
    trasy: [{ nazev: "Hlavní trasa", km: 111, hm: 300 }],
    uzavirky: "plna",
    startovne: "1 990 Kč v předprodeji → 3 690 Kč",
    web: "https://www.letapeczech.cz",
    zdroj: "letapeczech.cz",

    /* ── rozšířená pole ── */
    distanceKm: 111,
    elevationM: 300,
    profile: "flat",  // [uncertain] odvozeno z hm/km = 2.7
    startTime: "10:30",  // [uncertain] z harmonogramu ve výpisu vyhledávání, nenačteno
    startLocation: { city: "Pardubice", country: "CZ" },
    entryFee: "1 990 Kč v předprodeji → 3 690 Kč",
    series: "L'Etape by Tour de France",
    status: "confirmed",  // [uncertain] odvozeno z overeno="ok"
    sourceUrl: "https://www.letapeczech.cz/rovinata-etapa-2026/",  // [uncertain] z výpisu vyhledávání, nenačteno
    de: {
      nazev: "L'Etape Czech Republic — Flache Etappe",
      region: "Region Pardubice",
      startovne: "1 990 Kč im Vorverkauf → 3 690 Kč",
      trasy: ["Hauptstrecke"],
    },
  },

  {
    id: "zadar-2026", nazev: "Zadar Granfondo",
    misto: "Zadar", region: "Zadarska županija", zeme: "HR",
    datum: "2026-10-18", overeno: "check", serie: null,
    // Pozor: web pořadatele má podstránku "GRANFONDO 65km", granfondoguide.com
    // ale uvádí kratší trasu 56 km / 516 hm. Použito 56 km, rozpor k ověření.
    trasy: [
      { nazev: "112 km", km: 112, hm: 1034 },  // [uncertain]
      { nazev: "56 km", km: 56, hm: 516 },     // [uncertain] rozpor 56 / 65 km
    ],
    uzavirky: "nezname", startovne: null,
    web: "https://www.zadargranfondo.com",
    zdroj: "granfondoguide.com, zadargranfondo.com (vyhledávání 27. 9. 2026)",

    /* ── rozšířená pole ── */
    distanceKm: 112,   // [uncertain] delší ze 2 tras
    elevationM: 1034,  // [uncertain]
    profile: "hilly",  // [uncertain] odvozeno z hm/km = 9.2
    // start i cíl u Falkensteiner Resort Borik
    startLocation: { city: "Zadar", country: "HR" },
    status: "provisional",  // [uncertain] odvozeno z overeno="check"
    sourceUrl: "https://www.granfondoguide.com/Events/Index/8778/zadar-granfondo",  // [uncertain]
    de: { zdroj: "granfondoguide.com, zadargranfondo.com (Websuche 27. 9. 2026)" },
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
    de: { startovne: "56 € bis 31. 12. 2026 → 80 € am Renntag" },
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
    de: { startovne: "Frühbucherrabatt · Limit 800 Starter" },
  },
  {
    id: "fichtelberg-2027", nazev: "15. Fichtelberg-Radmarathon",
    misto: "Chemnitz", region: "Sachsen", zeme: "DE",
    // termín z příspěvku pořadatele "Save the Date 2027!"; přihlášky od prosince 2026
    datum: "2027-06-06", overeno: "ok", serie: null,
    trasy: [{ nazev: "Marathon", km: 90, hm: 1900 }],
    uzavirky: "nezname", startovne: null,
    web: "https://fichtelberg-radmarathon.de",
    zdroj: "fichtelberg-radmarathon.de (vyhledávání 28. 9. 2026)",

    /* ── rozšířená pole ── */
    distanceKm: 90,
    elevationM: 1900,
    profile: "hilly",  // [uncertain] odvozeno z hm/km = 21.1
    startLocation: { city: "Chemnitz", country: "DE" },
    status: "confirmed",  // [uncertain] odvozeno z overeno="ok"
    sourceUrl: "https://fichtelberg-radmarathon.de",  // [uncertain] domovská stránka pořadatele
    de: { zdroj: "fichtelberg-radmarathon.de (Websuche 28. 9. 2026)" },
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
    de: {
      misto: "Riesengebirge",
      region: "Region Hradec Králové",
      startovne: "1 290 / 1 490 Kč bis 31. 12. 2026 → 1 890 / 2 090 Kč",
      trasy: ["Hauptstrecke", "Kurze Strecke"],
    },
  },
  {
    id: "mondsee-2027", nazev: "Mondsee 5 Seen Radmarathon",
    misto: "Mondsee", region: "Oberösterreich", zeme: "AT",
    // 39. ročník; web opraven — dřívější 5seen-radmarathon.at nemá žádný obsah
    datum: "2027-06-20", overeno: "ok", serie: null,
    trasy: [
      { nazev: "Kurz", km: 75, hm: 400 },
      { nazev: "Mittel", km: 140, hm: 1400 },
      { nazev: "Lang", km: 200, hm: 2600 },
    ],
    uzavirky: "nezname", startovne: null,
    web: "https://www.mondsee-radmarathon.com",
    zdroj: "mondsee-radmarathon.com, racetime.pro (vyhledávání 28. 9. 2026)",

    /* ── rozšířená pole ── */
    distanceKm: 200,  // [uncertain] nejdelší ze 3 změřených tras
    elevationM: 2600,  // [uncertain] nejdelší ze 3 změřených tras
    profile: "hilly",  // [uncertain] odvozeno z hm/km = 13.0
    startLocation: { city: "Mondsee", country: "AT" },
    registrationUrl: "https://entry.racetime.pro/event/1480/start",  // [uncertain] z výpisu vyhledávání, nenačteno
    registrationDeadline: "2027-06-17",  // [uncertain] racetime.pro: online do 17. 6. 2027 cca 8:00, pokud zbývají místa
    status: "confirmed",  // [uncertain] odvozeno z overeno="ok"
    sourceUrl: "https://www.mondsee-radmarathon.com",  // [uncertain] domovská stránka pořadatele
    de: { zdroj: "mondsee-radmarathon.com, racetime.pro (Websuche 28. 9. 2026)" },
  },
  {
    id: "dreilaendergiro-2027", nazev: "Dreiländergiro",
    misto: "Nauders", region: "Tirol", zeme: "AT",
    // termín potvrzen na dreilaendergiro.at; prodej startovních míst od 1. 10. 2026
    datum: "2027-06-27", overeno: "ok", serie: null,
    // trasa vede přes Rakousko, Itálii a Švýcarsko (Stilfserjoch, Umbrailpass)
    trasy: [
      { nazev: "Strecke A – Stelvio Engadin", km: 168, hm: 3300 },   // [uncertain]
      { nazev: "Strecke B – Stelvio Vinschgau", km: 120, hm: 3000 }, // [uncertain]
    ],
    uzavirky: "nezname", startovne: null,
    web: "https://www.dreilaendergiro.at",
    zdroj: "dreilaendergiro.at (vyhledávání 28. 9. 2026)",

    /* ── rozšířená pole ── */
    distanceKm: 168,   // [uncertain] nejdelší ze 2 tras
    elevationM: 3300,  // [uncertain]
    profile: "hilly",  // [uncertain] odvozeno z hm/km = 19.6
    startLocation: { city: "Nauders", country: "AT" },
    status: "confirmed",  // [uncertain] odvozeno z overeno="ok"
    sourceUrl: "https://www.dreilaendergiro.at",  // [uncertain] domovská stránka pořadatele
    de: { zdroj: "dreilaendergiro.at (Websuche 28. 9. 2026)" },
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
    // termín z arlberg-giro.com; přihlášky otevřeny 15. 9. 2026,
    // den předtím (30. 7. 2027) se jede St. Anton Night Sprint
    datum: "2027-08-01", overeno: "ok", serie: "Tiroler Rennrad Cup",
    trasy: [{ nazev: "Giro", km: 150, hm: 2500 }],
    uzavirky: "nezname", startovne: null,
    web: "https://arlberg-giro.com",
    zdroj: "arlberg-giro.com (vyhledávání 28. 9. 2026)",

    /* ── rozšířená pole ── */
    distanceKm: 150,
    elevationM: 2500,
    profile: "hilly",  // [uncertain] odvozeno z hm/km = 16.7
    startLocation: { city: "St. Anton am Arlberg", country: "AT" },
    registrationUrl: "https://arlberg-giro.com/en/registration",  // [uncertain] z výpisu vyhledávání, nenačteno
    series: "Tiroler Rennrad Cup",
    status: "confirmed",  // [uncertain] odvozeno z overeno="ok"
    sourceUrl: "https://arlberg-giro.com",  // [uncertain] domovská stránka pořadatele
    de: { zdroj: "arlberg-giro.com (Websuche 28. 9. 2026)" },
  },

  {
    id: "kufstein-2027", nazev: "Kufsteinerland Radmarathon",
    misto: "Kufstein", region: "Tirol", zeme: "AT",
    datum: "2027-08-22", overeno: "ok",
    serie: "Tiroler Rennrad Cup",
    // km/hm dle 10. ročníku (23. 8. 2026); zdroj: kufsteinerland-radmarathon.at
    trasy: [
      { nazev: "Marathon", km: 120, hm: 1800 },     // [uncertain] zdroj uvádí "ca. 1800 hm"
      { nazev: "Seenrunde", km: 95, hm: 1160 },     // [uncertain]
      { nazev: "Panoramarunde", km: 48, hm: 400 },  // [uncertain]
    ],
    uzavirky: "nezname", startovne: null,
    web: "https://www.kufsteinerland-radmarathon.at",
    zdroj: "kufsteinerland-radmarathon.at (termín, vyhledávání 28. 9. 2026); trasy dle ročníku 2026",

    /* ── rozšířená pole ── */
    distanceKm: 120,   // [uncertain] nejdelší ze 3 tras, ročník 2026
    elevationM: 1800,  // [uncertain] ročník 2026
    profile: "hilly",  // [uncertain] odvozeno z hm/km = 15.0
    startLocation: { city: "Kufstein", country: "AT" },
    series: "Tiroler Rennrad Cup",
    status: "confirmed",  // [uncertain] odvozeno z overeno="ok"
    de: { zdroj: "kufsteinerland-radmarathon.at (Termin, Websuche 28. 9. 2026); Strecken laut Ausgabe 2026" },
  },
  {
    id: "oetztaler-2027", nazev: "Ötztaler Radmarathon",
    misto: "Sölden", region: "Tirol", zeme: "AT",
    datum: "2027-08-29", overeno: "check", serie: null,
    trasy: [{ nazev: "Marathon", km: 227, hm: 5500 }],
    uzavirky: "nezname", startovne: null,
    web: "https://www.oetztaler-radmarathon.com",
    zdroj: "termín: central-soelden.com + intervalcoach.app (vyhledávání 27. 9. 2026); trasa dle ročníku 2026",

    /* ── rozšířená pole ── */
    distanceKm: 227,
    elevationM: 5500,
    profile: "mountain",  // [uncertain] odvozeno z hm/km = 24.2
    startLocation: { city: "Sölden", country: "AT" },
    status: "provisional",  // [uncertain] odvozeno z overeno="check"
    de: { zdroj: "Termin: central-soelden.com + intervalcoach.app (Websuche 27. 9. 2026); Strecke laut Ausgabe 2026" },
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
    de: { zdroj: "kitzbuehel.com (Termin), kitzbueheler-radmarathon.at (Strecken), Websuche 27. 9. 2026" },
  },

  {
    id: "kotl-2027", nazev: "King of the Lake",
    misto: "Schörfling am Attersee", region: "Oberösterreich", zeme: "AT",
    // pořadatel uvádí termín jako předběžný (vždy 3. sobota v září)
    datum: "2027-09-18", overeno: "check", serie: null,
    // časovka jednotlivců kolem Attersee, start po jednom
    trasy: [{ nazev: "Okruh kolem Attersee", km: 47.2, hm: 280 }],  // [uncertain]
    uzavirky: "plna",  // [uncertain] dle spoferan.com je silnice kolem jezera zcela uzavřená
    startovne: null,
    web: "https://www.kotl.at",
    zdroj: "kotl.at (předběžný termín), spoferan.com (trasa), vyhledávání 27. 9. 2026",

    /* ── rozšířená pole ── */
    distanceKm: 47.2,  // [uncertain]
    elevationM: 280,   // [uncertain]
    profile: "flat",   // [uncertain] odvozeno z hm/km = 5.9
    startTime: "13:00",  // [uncertain] první start v ročníku 2026
    startLocation: { city: "Schörfling am Attersee", country: "AT" },
    status: "provisional",  // [uncertain] odvozeno z overeno="check"
    sourceUrl: "https://www.kotl.at",  // [uncertain] domovská stránka pořadatele
    format: "time-trial",
    de: {
      zdroj: "kotl.at (vorläufiger Termin), spoferan.com (Strecke), Websuche 27. 9. 2026",
      trasy: ["Runde um den Attersee"],
    },
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
    de: {
      nazev: "L'Etape Czech Republic — Hügelige Etappe",
      misto: "Prag und Umgebung",
      region: "Prag",
      zdroj: "Ausgabe 2026 zur Orientierung",
      trasy: ["Kurz", "Mittel", "Lang"],
    },
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
    de: {
      nazev: "L'Etape Czech Republic — Flache Etappe",
      misto: "Umgebung von Pardubice",
      region: "Region Pardubice",
      zdroj: "Ausgabe 2026 zur Orientierung",
      trasy: ["Hauptstrecke"],
    },
  },
  {
    id: "sauwald-2027", nazev: "SauwaldGiro",
    misto: "Sauwald", region: "Oberösterreich", zeme: "AT",
    datum: null, odhadMesic: "2027-08", overeno: "tbc", serie: null,
    // km/hm dle sauwaldgiro.at; zdroj značí trasy jako Route A / Route B
    trasy: [
      { nazev: "Runde A", km: 105, hm: 1600 },  // [uncertain]
      { nazev: "Runde B", km: 61, hm: 900 },    // [uncertain]
    ],
    uzavirky: "nezname", startovne: null,
    web: "https://www.sauwaldgiro.at",
    zdroj: "sauwaldgiro.at / radmarathon.at (vyhledávání 27. 9. 2026); termín 2027 zatím nevyhlášen",

    /* ── rozšířená pole ── */
    distanceKm: 105,   // [uncertain] delší ze 2 tras
    elevationM: 1600,  // [uncertain]
    profile: "hilly",  // [uncertain] odvozeno z hm/km = 15.2
    // pořadatel uvádí jako místo startu St. Roman bei Schärding v Innviertelu
    startLocation: { city: "St. Roman bei Schärding", country: "AT" },
    status: "provisional",  // [uncertain] odvozeno z overeno="tbc"
    sourceUrl: "https://www.sauwaldgiro.at",  // [uncertain] domovská stránka pořadatele
    de: { zdroj: "sauwaldgiro.at / radmarathon.at (Websuche 27. 9. 2026); Termin 2027 noch nicht bekannt" },
  },
  {
    id: "carinthia200-2027", nazev: "Carinthia200",
    misto: "Villach", region: "Kärnten", zeme: "AT",
    datum: null, odhadMesic: "2027-09", overeno: "tbc", serie: null,
    // Oprava: dřívější údaj "Mittel 105 km / 1304 hm" neodpovídá žádné
    // vypsané trase. Pořadatel uvádí tři trasy; zdroj: carinthia200.com
    trasy: [
      { nazev: "125 km", km: 125, hm: 1575 },  // [uncertain]
      { nazev: "155 km", km: 155, hm: 2630 },  // [uncertain]
      { nazev: "200 km", km: 200, hm: 3285 },  // [uncertain]
    ],
    uzavirky: "nezname", startovne: null,
    web: null, zdroj: "ročník 2026 pro orientaci",

    /* ── rozšířená pole ── */
    distanceKm: 200,   // [uncertain] nejdelší ze 3 tras
    elevationM: 3285,  // [uncertain]
    profile: "hilly",  // [uncertain] odvozeno z hm/km = 16.4
    startLocation: { city: "Villach", country: "AT" },
    status: "provisional",  // [uncertain] odvozeno z overeno="tbc"
    de: { zdroj: "Ausgabe 2026 zur Orientierung" },
  },
  {
    id: "istria300-2027", nazev: "Istria300",
    misto: "Poreč", region: "Istra", zeme: "HR",
    datum: null, odhadMesic: "2027-09", overeno: "tbc", serie: null,
    trasy: [
      { nazev: "Istria300", km: 300.5, hm: 5150 },  // [uncertain]
      { nazev: "Istria209", km: 209, hm: 3250 },    // [uncertain]
      { nazev: "Istria135", km: 134.5, hm: 1800 },  // [uncertain]
    ],
    uzavirky: "nezname", startovne: null,
    web: "https://www.istria300.com",
    zdroj: "termín 2027 zatím nevyhlášen; měsíc odhadnut podle ročníku 2025 (27. 9.), ročník 2026 byl mimořádně posunut na 3. 10.",

    /* ── rozšířená pole ── */
    distanceKm: 300.5,  // [uncertain] nejdelší ze 3 tras
    elevationM: 5150,   // [uncertain]
    profile: "hilly",   // [uncertain] odvozeno z hm/km = 17.1
    startLocation: { city: "Poreč", country: "HR" },
    status: "provisional",  // [uncertain] odvozeno z overeno="tbc"
    de: { zdroj: "Termin 2027 noch nicht bekannt; Monat geschätzt nach der Ausgabe 2025 (27. 9.), die Ausgabe 2026 wurde ausnahmsweise auf den 3. 10. verschoben" },
  },
  {
    id: "zadar-2027", nazev: "Zadar Granfondo",
    misto: "Zadar", region: "Zadarska županija", zeme: "HR",
    datum: null, odhadMesic: "2027-10", overeno: "tbc", serie: null,
    // Pozor: web pořadatele má podstránku "GRANFONDO 65km", granfondoguide.com
    // ale uvádí kratší trasu 56 km / 516 hm. Použito 56 km, rozpor k ověření.
    trasy: [
      { nazev: "112 km", km: 112, hm: 1034 },  // [uncertain]
      { nazev: "56 km", km: 56, hm: 516 },     // [uncertain] rozpor 56 / 65 km
    ],
    uzavirky: "nezname", startovne: null,
    web: "https://www.zadargranfondo.com",
    zdroj: "ročník 2026 pro orientaci",

    /* ── rozšířená pole ── */
    distanceKm: 112,   // [uncertain] delší ze 2 tras
    elevationM: 1034,  // [uncertain]
    profile: "hilly",  // [uncertain] odvozeno z hm/km = 9.2
    // start i cíl u Falkensteiner Resort Borik
    startLocation: { city: "Zadar", country: "HR" },
    status: "provisional",  // [uncertain] odvozeno z overeno="tbc"
    de: { zdroj: "Ausgabe 2026 zur Orientierung" },
  },
];

/* Kontrola dat běží jen ve vývoji — v produkčním buildu je podmínka
   staticky nepravdivá, takže se validace do bundlu nezabalí. */
if (import.meta.env.DEV) {
  vypisKontrolu(ZAVODY);
}
