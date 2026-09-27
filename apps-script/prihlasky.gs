/* Roadbook – přihlášky na závody („Wer fährt mit?")
 *
 * Celá serverová část přihlášek: Google Apps Script připojený ke Google
 * Tabulce. Běží zdarma pod tvým Google účtem.
 *
 * Jak to funguje:
 *   – Kdo se přihlásí poprvé, dostane tajný osobní klíč (prohlížeč si ho
 *     zapamatuje). Tobě přijde e-mail s tlačítky Schválit / Zamítnout.
 *   – Schvaluje se OSOBA, ne jednotlivá přihláška. Jakmile ji jednou
 *     schválíš, její další přihlášky a změny se zobrazí rovnou.
 *   – Každý si svou přihlášku může změnit (jede / možná, trasa, tempo…)
 *     nebo zrušit.
 *   – Web dostane jen přihlášky schválených osob a jen veřejné údaje.
 *
 * Nastavení (jednou, pár minut) je v README v sekci „Přihlášky".
 * Po úpravě kódu: Nasadit → Spravovat nasazení → upravit → Nová verze.
 */

const WEB = "https://keva-22.github.io/Kalend-_Silni-n-ch_z-vod-/#mitfahren";

// Kam chodí e-maily ke schválení. Prázdné = na účet, pod kterým skript běží
// (vlastník tabulky). Chceš je jinam? Napiš sem adresu, např. "ja@example.com".
const EMAIL_SPRAVCE = "";

const LIST_OSOBY = "Osoby";
const HLAVICKA_OSOBY = ["ID", "Jméno", "Stav", "Otisk klíče", "Token schválení", "Založeno"];
const O = { id: 0, jmeno: 1, stav: 2, otisk: 3, token: 4, zalozeno: 5 };

const LIST_PRIHLASKY = "Přihlášky";
const HLAVICKA_PRIHLASKY = ["ID", "Osoba ID", "Závod ID", "Závod", "Účast", "Trasa", "Tempo", "Odvoz", "Komentář", "Změněno"];
const P = { id: 0, osoba: 1, zavodId: 2, zavod: 3, ucast: 4, trasa: 5, tempo: 6, odvoz: 7, komentar: 8, zmeneno: 9 };

const STAV = { ceka: "čeká", schvaleno: "schváleno", zamitnuto: "zamítnuto" };
const UCAST = { jede: "jede", mozna: "možná" };
const ODVOZ = { nabizi: "má auto, nabízí místa", hleda: "hledá odvoz", vyreseno: "cestu má vyřešenou" };
const MAX = { zavodId: 40, zavod: 120, jmeno: 40, trasa: 60, tempo: 60, komentar: 500 };
const LIMIT_NOVYCH_OSOB_ZA_DEN = 40; // každá nová osoba = jeden e-mail (Gmail smí 100 denně)
const LIMIT_ZMEN_ZA_DEN = 40;        // uložení / smazání na jednu osobu a den

/* ── Spusť jednou z editoru (▶ Spustit): připraví listy, potvrdí
      oprávnění a pošle ti zkušební e-mail. ──────────────────────────── */
function nastavit() {
  const tabulka = tabulka_();
  PropertiesService.getScriptProperties().setProperty("TABULKA_ID", tabulka.getId());
  osoby_();
  prihlasky_();
  const adresa = adresaSpravce_();
  MailApp.sendEmail({
    to: adresa,
    subject: "Roadbook: přihlášky jsou připravené",
    body:
      "Tohle je zkušební e-mail. Přesně sem ti budou chodit nové osoby ke schválení.\n\n" +
      "Teď ještě: Nasadit → Nové nasazení → Webová aplikace " +
      "(Spustit jako: Já, Přístup: Kdokoli) a adresu /exec vlož do webu.",
    name: "Roadbook",
  });
  console.log("Zkušební e-mail odeslán na " + adresa);
}

/* ── Spusť z editoru, když nepřišel e-mail: pošle ho znovu za každou
      osobu, která čeká na schválení, a v protokolu ukáže, na jakou adresu. */
function poslatZnovu() {
  const osoby = osoby_().getDataRange().getValues().slice(1);
  const prihlasky = prihlasky_().getDataRange().getValues().slice(1);
  const urlTabulky = tabulka_().getUrl();
  let pocet = 0;
  osoby.forEach((r) => {
    if (stav_(r[O.stav]) !== "ceka") return;
    const posledni = prihlasky.filter((x) => String(x[P.osoba]) === String(r[O.id])).pop();
    const p = { jmeno: String(r[O.jmeno]), zavod: "", ucast: "", trasa: "", tempo: "", odvoz: "", komentar: "" };
    if (posledni) {
      Object.assign(p, {
        zavod: String(posledni[P.zavod]),
        ucast: String(posledni[P.ucast]) === "mozna" ? "mozna" : "jede",
        trasa: String(posledni[P.trasa]),
        tempo: String(posledni[P.tempo]),
        odvoz: String(posledni[P.odvoz]),
        komentar: String(posledni[P.komentar]),
      });
    }
    posliEmail_({ id: String(r[O.id]), token: String(r[O.token]) }, p, urlTabulky);
    pocet++;
  });
  console.log(pocet
    ? "Odesláno e-mailů: " + pocet + ", na adresu " + adresaSpravce_()
    : "Nikdo nečeká na schválení, nebylo co poslat.");
}

/* ── Web: GET ───────────────────────────────────────────────────────── */
function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.akce === "seznam") return json_(seznam_(p.klic));
  if (p.akce === "schvalit" || p.akce === "zamitnout") return rozhodni_(p);
  return json_({ ok: true, sluzba: "roadbook-prihlasky" });
}

/* ── Web: POST (uložit / smazat přihlášku) ──────────────────────────── */
function doPost(e) {
  let data;
  try {
    data = JSON.parse((e && e.postData && e.postData.contents) || "");
  } catch (err) {
    return json_({ ok: false, chyba: "neplatne" });
  }
  if (!data || typeof data !== "object") return json_({ ok: false, chyba: "neplatne" });
  // past na roboty: skryté pole, které člověk nevidí a nevyplní
  if (data.web) return json_({ ok: true, stav: "ceka" });
  if (data.akce === "smazat") return smazat_(data);
  return ulozit_(data);
}

function ulozit_(data) {
  const p = {
    zavodId: text_(data.zavodId, MAX.zavodId).toLowerCase(),
    zavod: text_(data.zavod, MAX.zavod),
    jmeno: text_(data.jmeno, MAX.jmeno),
    ucast: data.ucast === "mozna" ? "mozna" : "jede",
    trasa: text_(data.trasa, MAX.trasa),
    tempo: text_(data.tempo, MAX.tempo),
    odvoz: Object.prototype.hasOwnProperty.call(ODVOZ, data.odvoz) ? data.odvoz : "",
    komentar: text_(data.komentar, MAX.komentar, true),
  };
  if (!/^[a-z0-9-]{3,40}$/.test(p.zavodId) || !p.zavod || !p.jmeno) {
    return json_({ ok: false, chyba: "neplatne" });
  }

  const osoby = osoby_();
  const prihlasky = prihlasky_();
  const zamek = LockService.getScriptLock();
  zamek.waitLock(10000);
  let osoba, klic, nova = false;
  try {
    osoba = najdiOsobu_(osoby, data.klic);
    if (osoba) {
      klic = data.klic;
      if (!pripocitejZmenu_(osoba.id)) return json_({ ok: false, chyba: "limit" });
      if (osoba.jmeno !== p.jmeno) osoby.getRange(osoba.radek, O.jmeno + 1).setValue(jakoText_(p.jmeno));
    } else {
      // nová osoba — souhlas se zveřejněním je povinný
      if (data.souhlas !== true) return json_({ ok: false, chyba: "souhlas" });
      if (dnesZalozenychOsob_(osoby) >= LIMIT_NOVYCH_OSOB_ZA_DEN) return json_({ ok: false, chyba: "limit" });
      klic = Utilities.getUuid().replace(/-/g, "");
      osoba = { id: Utilities.getUuid(), jmeno: p.jmeno, stav: "ceka", token: Utilities.getUuid().replace(/-/g, "") };
      osoby.appendRow([osoba.id, jakoText_(p.jmeno), STAV.ceka, otisk_(klic), osoba.token, new Date()]);
      nova = true;
    }

    // jedna přihláška na osobu a závod: existující se přepíše
    const radek = najdiPrihlasku_(prihlasky, osoba.id, p.zavodId);
    const hodnoty = [
      radek ? radek.id : Utilities.getUuid(), osoba.id, p.zavodId, jakoText_(p.zavod), p.ucast,
      jakoText_(p.trasa), jakoText_(p.tempo), p.odvoz, jakoText_(p.komentar), new Date(),
    ];
    if (radek) {
      hodnoty.forEach((h, i) => prihlasky.getRange(radek.radek, i + 1).setValue(h));
    } else {
      prihlasky.appendRow(hodnoty);
    }
  } finally {
    zamek.releaseLock();
  }
  if (nova) {
    // přihláška už je uložená; když e-mail selže (třeba denní limit),
    // chyba je v editoru vlevo v „Spuštění“ a osobu jde schválit i ručně v tabulce
    try {
      posliEmail_(osoba, p, prihlasky.getParent().getUrl());
    } catch (err) {
      console.error("E-mail ke schválení se nepodařilo odeslat: " + err);
    }
  }
  return json_({ ok: true, klic: klic, stav: osoba.stav });
}

function smazat_(data) {
  const zavodId = text_(data.zavodId, MAX.zavodId).toLowerCase();
  const osoby = osoby_();
  const prihlasky = prihlasky_();
  const zamek = LockService.getScriptLock();
  zamek.waitLock(10000);
  try {
    const osoba = najdiOsobu_(osoby, data.klic);
    if (!osoba) return json_({ ok: false, chyba: "neplatne" });
    if (!pripocitejZmenu_(osoba.id)) return json_({ ok: false, chyba: "limit" });
    const radek = najdiPrihlasku_(prihlasky, osoba.id, zavodId);
    if (radek) prihlasky.deleteRow(radek.radek);
    return json_({ ok: true, stav: osoba.stav });
  } finally {
    zamek.releaseLock();
  }
}

/* ── Seznam: veřejné přihlášky + (s klíčem) vlastní přihlášky ───────── */
function seznam_(klic) {
  const osoby = osoby_().getDataRange().getValues().slice(1);
  const podleId = {};
  osoby.forEach((r) => (podleId[String(r[O.id])] = r));
  const vsechny = prihlasky_().getDataRange().getValues().slice(1);
  const verejna = (r) => ({
    zavodId: String(r[P.zavodId]),
    zavod: String(r[P.zavod]),
    ucast: String(r[P.ucast]) === "mozna" ? "mozna" : "jede",
    trasa: String(r[P.trasa]),
    tempo: String(r[P.tempo]),
    odvoz: String(r[P.odvoz]),
    komentar: String(r[P.komentar]),
  });

  const vysledek = {
    ok: true,
    prihlasky: vsechny
      .filter((r) => podleId[String(r[P.osoba])] && stav_(podleId[String(r[P.osoba])][O.stav]) === "schvaleno")
      .map((r) => Object.assign({ jmeno: String(podleId[String(r[P.osoba])][O.jmeno]) }, verejna(r))),
  };

  const ja = najdiOsobu_(osoby_(), klic);
  if (ja) {
    vysledek.ja = {
      jmeno: ja.jmeno,
      stav: ja.stav,
      prihlasky: vsechny.filter((r) => String(r[P.osoba]) === ja.id).map(verejna),
    };
  }
  return vysledek;
}

/* ── Odkaz z e-mailu: schválit / zamítnout osobu ────────────────────── */
function rozhodni_(p) {
  const osoby = osoby_();
  const radky = osoby.getDataRange().getValues();
  for (let i = 1; i < radky.length; i++) {
    if (String(radky[i][O.id]) !== String(p.osoba || "")) continue;
    if (!p.token || String(radky[i][O.token]) !== String(p.token)) break;
    const schvalit = p.akce === "schvalit";
    osoby.getRange(i + 1, O.stav + 1).setValue(schvalit ? STAV.schvaleno : STAV.zamitnuto);
    const pocet = prihlasky_().getDataRange().getValues().slice(1)
      .filter((r) => String(r[P.osoba]) === String(radky[i][O.id])).length;
    return stranka_(
      schvalit ? "✓ Schváleno" : "✕ Zamítnuto",
      esc_(radky[i][O.jmeno]) + " (přihlášek: " + pocet + ")<br>" +
        (schvalit
          ? "Přihlášky jsou teď na webu. Další přihlášky a změny této osoby už schvalovat nemusíš."
          : "Žádná přihláška této osoby se na webu nezobrazí. Rozhodnutí můžeš změnit druhým tlačítkem v e-mailu."),
    );
  }
  return stranka_("Odkaz neplatí", "Osoba nebyla nalezena, nebo odkaz není celý.");
}

/* ── E-mail správci: nová osoba ke schválení ────────────────────────── */
function posliEmail_(osoba, p, urlTabulky) {
  const url = ScriptApp.getService().getUrl();
  const odkaz = (akce) =>
    url + "?akce=" + akce + "&osoba=" + encodeURIComponent(osoba.id) + "&token=" + osoba.token;
  const udaje = [
    ["Jméno", p.jmeno],
    ["Závod", p.zavod],
    ["Účast", UCAST[p.ucast] || ""],
    ["Trasa", p.trasa],
    ["Tempo", p.tempo],
    ["Odvoz", ODVOZ[p.odvoz] || ""],
    ["Komentář", p.komentar],
  ].filter((r) => r[1]);

  const tabulka = udaje
    .map((r) =>
      '<tr><td style="padding:4px 12px 4px 0;color:#5e7784">' + r[0] + "</td>" +
      '<td style="padding:4px 0;white-space:pre-line">' + esc_(r[1]) + "</td></tr>")
    .join("");
  const tlacitko = (text, href, barva) =>
    '<a href="' + href + '" style="display:inline-block;padding:10px 18px;margin-right:8px;' +
    "border-radius:6px;color:#fff;text-decoration:none;font-weight:600;background:" + barva + '">' +
    text + "</a>";

  MailApp.sendEmail({
    to: adresaSpravce_(),
    subject: "Nová osoba ke schválení: " + p.jmeno + (p.zavod ? " – " + p.zavod : ""),
    name: "Roadbook",
    body:
      udaje.map((r) => r[0] + ": " + r[1]).join("\n") +
      "\n\nSchválit: " + odkaz("schvalit") +
      "\nZamítnout: " + odkaz("zamitnout") +
      "\n\nPo schválení se této osobě zobrazí i všechny další přihlášky a změny, " +
      "bez dalšího schvalování.\n\nTabulka: " + urlTabulky,
    htmlBody:
      '<div style="font-family:system-ui,sans-serif;font-size:14px;color:#12212b">' +
      "<p>Na webu Roadbook se poprvé přihlásil nový člověk:</p>" +
      '<table style="border-collapse:collapse;margin-bottom:18px">' + tabulka + "</table>" +
      tlacitko("✓ Schválit", odkaz("schvalit"), "#0d7a5e") +
      tlacitko("✕ Zamítnout", odkaz("zamitnout"), "#8a9aa5") +
      '<p style="margin-top:18px;font-size:12px;color:#5e7784">Schvaluješ osobu, ne jen tuto ' +
      "přihlášku: po schválení se jí další přihlášky a změny zobrazí rovnou. Zamítnutím skryješ " +
      'všechny její přihlášky — tlačítka fungují i později. <a href="' + urlTabulky +
      '">Otevřít tabulku</a></p></div>',
  });
}

/* ── Pomocné funkce ─────────────────────────────────────────────────── */
function adresaSpravce_() {
  return EMAIL_SPRAVCE.trim() || Session.getEffectiveUser().getEmail();
}

function tabulka_() {
  const aktivni = SpreadsheetApp.getActiveSpreadsheet();
  if (aktivni) return aktivni;
  const id = PropertiesService.getScriptProperties().getProperty("TABULKA_ID");
  if (id) return SpreadsheetApp.openById(id);
  throw new Error("Skript není připojený k tabulce — spusť nejdřív funkci nastavit().");
}

function list_(nazev, hlavicka) {
  const tabulka = tabulka_();
  let list = tabulka.getSheetByName(nazev);
  if (!list) {
    const prvni = tabulka.getSheets()[0];
    const volny = prvni && prvni.getLastRow() === 0 && [LIST_OSOBY, LIST_PRIHLASKY].indexOf(prvni.getName()) < 0;
    list = volny ? prvni.setName(nazev) : tabulka.insertSheet(nazev);
    list.appendRow(hlavicka);
    list.setFrozenRows(1);
  }
  return list;
}

function osoby_() {
  return list_(LIST_OSOBY, HLAVICKA_OSOBY);
}

function prihlasky_() {
  return list_(LIST_PRIHLASKY, HLAVICKA_PRIHLASKY);
}

/** Osoba podle tajného klíče (v tabulce je jen jeho otisk). */
function najdiOsobu_(osoby, klic) {
  if (typeof klic !== "string" || !/^[0-9a-f]{32}$/.test(klic)) return null;
  const hledany = otisk_(klic);
  const radky = osoby.getDataRange().getValues();
  for (let i = 1; i < radky.length; i++) {
    if (String(radky[i][O.otisk]) === hledany) {
      return {
        radek: i + 1,
        id: String(radky[i][O.id]),
        jmeno: String(radky[i][O.jmeno]),
        stav: stav_(radky[i][O.stav]),
        token: String(radky[i][O.token]),
      };
    }
  }
  return null;
}

function najdiPrihlasku_(prihlasky, osobaId, zavodId) {
  const radky = prihlasky.getDataRange().getValues();
  for (let i = 1; i < radky.length; i++) {
    if (String(radky[i][P.osoba]) === osobaId && String(radky[i][P.zavodId]) === zavodId) {
      return { radek: i + 1, id: String(radky[i][P.id]) };
    }
  }
  return null;
}

/** Stav osoby jako klíč; ručně psané „ano" / „ja" se počítá jako schváleno. */
function stav_(hodnota) {
  const s = normalizuj_(hodnota);
  if (["schvaleno", "ano", "ja"].indexOf(s) >= 0) return "schvaleno";
  if (["zamitnuto", "ne", "nein"].indexOf(s) >= 0) return "zamitnuto";
  return "ceka";
}

function dnesZalozenychOsob_(osoby) {
  const tz = Session.getScriptTimeZone();
  const dnes = Utilities.formatDate(new Date(), tz, "yyyy-MM-dd");
  return osoby.getDataRange().getValues().slice(1)
    .filter((r) => r[O.zalozeno] instanceof Date && Utilities.formatDate(r[O.zalozeno], tz, "yyyy-MM-dd") === dnes)
    .length;
}

/** Počítadlo změn jedné osoby za den; false = limit vyčerpán. */
function pripocitejZmenu_(osobaId) {
  const cache = CacheService.getScriptCache();
  const klic = "zmeny-" + osobaId;
  const pocet = Number(cache.get(klic) || 0);
  if (pocet >= LIMIT_ZMEN_ZA_DEN) return false;
  cache.put(klic, String(pocet + 1), 21600); // 6 hodin, víc cache neumí
  return true;
}

function otisk_(klic) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, klic)
    .map((b) => ("0" + (b & 0xff).toString(16)).slice(-2))
    .join("");
}

/** Očistí vstup: řídicí znaky pryč, oříznout, zkrátit na max. */
function text_(hodnota, max, viceRadku) {
  let s = hodnota == null ? "" : String(hodnota);
  s = viceRadku
    ? s.replace(/\r\n?/g, "\n").replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, "")
    : s.replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ");
  return s.trim().slice(0, max);
}

/** Apostrof = tabulka hodnotu uloží jako text (nikdy jako vzorec či datum). */
function jakoText_(s) {
  return s === "" ? "" : "'" + s;
}

function normalizuj_(s) {
  return String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

function esc_(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function json_(objekt) {
  return ContentService.createTextOutput(JSON.stringify(objekt)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

function stranka_(nadpis, text) {
  return HtmlService.createHtmlOutput(
    '<div style="font-family:system-ui,sans-serif;max-width:480px;margin:48px auto;padding:0 16px;color:#12212b">' +
      '<h1 style="font-size:28px">' + nadpis + "</h1>" +
      '<p style="font-size:15px;line-height:1.5">' + text + "</p>" +
      '<p><a href="' + WEB + '" target="_top" style="color:#0d7a5e">Zur Seite „Wer fährt mit?" →</a></p>' +
      "</div>",
  ).setTitle("Roadbook – přihlášky");
}
