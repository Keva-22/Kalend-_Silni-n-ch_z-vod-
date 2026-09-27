/* Roadbook – přihlášky na závody („Wer fährt mit?")
 *
 * Celá serverová část přihlášek: Google Apps Script připojený ke Google
 * Tabulce. Běží zdarma pod tvým Google účtem a:
 *   – uloží přihlášku z webu do tabulky (stav „čeká"),
 *   – pošle ti e-mail s tlačítky Schválit / Zamítnout,
 *   – webu vydá jen schválené přihlášky a jen veřejné údaje.
 *
 * Nastavení (jednou, pár minut) je v README v sekci „Přihlášky".
 * Po úpravě kódu: Nasadit → Spravovat nasazení → upravit → Nová verze.
 */

const WEB = "https://keva-22.github.io/Kalend-_Silni-n-ch_z-vod-/#mitfahren";
const LIST = "Přihlášky";
const HLAVICKA = ["Čas", "ID", "Token", "Stav", "Závod ID", "Závod", "Jméno", "Trasa", "Tempo", "Odvoz", "Komentář"];
const S = { cas: 0, id: 1, token: 2, stav: 3, zavodId: 4, zavod: 5, jmeno: 6, trasa: 7, tempo: 8, odvoz: 9, komentar: 10 };
const STAV = { ceka: "čeká", schvaleno: "schváleno", zamitnuto: "zamítnuto" };
const MAX = { zavodId: 40, zavod: 120, jmeno: 40, trasa: 60, tempo: 60, komentar: 500 };
const ODVOZ = { nabizi: "má auto, nabízí místa", hleda: "hledá odvoz", vyreseno: "cestu má vyřešenou" };
const LIMIT_ZA_DEN = 60; // ochrana proti zahlcení (e-maily mají denní limit 100)

/* ── Spusť jednou z editoru (▶ Spustit): připraví list, potvrdí oprávnění
      a pošle ti zkušební e-mail. ─────────────────────────────────────── */
function nastavit() {
  const tabulka = tabulka_();
  PropertiesService.getScriptProperties().setProperty("TABULKA_ID", tabulka.getId());
  list_();
  MailApp.sendEmail({
    to: Session.getEffectiveUser().getEmail(),
    subject: "Roadbook: přihlášky jsou připravené",
    body:
      "Tohle je zkušební e-mail. Přesně sem ti budou chodit nové přihlášky.\n\n" +
      "Teď ještě: Nasadit → Nové nasazení → Webová aplikace " +
      "(Spustit jako: Já, Přístup: Kdokoli) a adresu /exec vlož do webu.",
    name: "Roadbook",
  });
}

/* ── Web: GET ───────────────────────────────────────────────────────── */
function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.akce === "seznam") return json_({ ok: true, prihlasky: schvalene_() });
  if (p.akce === "schvalit" || p.akce === "zamitnout") return rozhodni_(p);
  return json_({ ok: true, sluzba: "roadbook-prihlasky" });
}

/* ── Web: POST (nová přihláška) ─────────────────────────────────────── */
function doPost(e) {
  let data;
  try {
    data = JSON.parse((e && e.postData && e.postData.contents) || "");
  } catch (err) {
    return json_({ ok: false, chyba: "neplatne" });
  }
  if (!data || typeof data !== "object") return json_({ ok: false, chyba: "neplatne" });

  // past na roboty: skryté pole, které člověk nevidí a nevyplní
  if (data.web) return json_({ ok: true });

  const p = {
    zavodId: text_(data.zavodId, MAX.zavodId).toLowerCase(),
    zavod: text_(data.zavod, MAX.zavod),
    jmeno: text_(data.jmeno, MAX.jmeno),
    trasa: text_(data.trasa, MAX.trasa),
    tempo: text_(data.tempo, MAX.tempo),
    odvoz: Object.prototype.hasOwnProperty.call(ODVOZ, data.odvoz) ? data.odvoz : "",
    komentar: text_(data.komentar, MAX.komentar, true),
  };
  if (data.souhlas !== true) return json_({ ok: false, chyba: "souhlas" });
  if (!/^[a-z0-9-]{3,40}$/.test(p.zavodId) || !p.zavod || !p.jmeno) {
    return json_({ ok: false, chyba: "neplatne" });
  }

  const list = list_();
  const zamek = LockService.getScriptLock();
  zamek.waitLock(10000);
  let id, token;
  try {
    if (dnesnichPrihlasek_(list) >= LIMIT_ZA_DEN) return json_({ ok: false, chyba: "limit" });
    id = Utilities.getUuid();
    token = Utilities.getUuid().replace(/-/g, "");
    list.appendRow([
      new Date(), id, token, STAV.ceka, p.zavodId,
      jakoText_(p.zavod), jakoText_(p.jmeno), jakoText_(p.trasa),
      jakoText_(p.tempo), p.odvoz, jakoText_(p.komentar),
    ]);
  } finally {
    zamek.releaseLock();
  }
  posliEmail_(p, id, token, list.getParent().getUrl());
  return json_({ ok: true });
}

/* ── Schválené přihlášky pro web — jen veřejné sloupce ──────────────── */
function schvalene_() {
  return list_()
    .getDataRange()
    .getValues()
    .slice(1)
    .filter((r) => ["schvaleno", "ano", "ja"].indexOf(normalizuj_(r[S.stav])) >= 0)
    .map((r) => ({
      zavodId: String(r[S.zavodId]),
      zavod: String(r[S.zavod]),
      jmeno: String(r[S.jmeno]),
      trasa: String(r[S.trasa]),
      tempo: String(r[S.tempo]),
      odvoz: String(r[S.odvoz]),
      komentar: String(r[S.komentar]),
    }));
}

/* ── Odkaz z e-mailu: schválit / zamítnout ──────────────────────────── */
function rozhodni_(p) {
  const list = list_();
  const radky = list.getDataRange().getValues();
  for (let i = 1; i < radky.length; i++) {
    if (String(radky[i][S.id]) !== String(p.id || "")) continue;
    if (!p.token || String(radky[i][S.token]) !== String(p.token)) break;
    const schvalit = p.akce === "schvalit";
    list.getRange(i + 1, S.stav + 1).setValue(schvalit ? STAV.schvaleno : STAV.zamitnuto);
    const kdo = esc_(radky[i][S.jmeno]) + " – " + esc_(radky[i][S.zavod]);
    return stranka_(
      schvalit ? "✓ Schváleno" : "✕ Zamítnuto",
      kdo + "<br>" + (schvalit ? "Na webu se objeví během chvíle." : "Na webu se nezobrazí."),
    );
  }
  return stranka_("Odkaz neplatí", "Přihláška nebyla nalezena, nebo odkaz není celý.");
}

/* ── E-mail správci ─────────────────────────────────────────────────── */
function posliEmail_(p, id, token, urlTabulky) {
  const url = ScriptApp.getService().getUrl();
  const odkaz = (akce) =>
    url + "?akce=" + akce + "&id=" + encodeURIComponent(id) + "&token=" + token;
  const udaje = [
    ["Závod", p.zavod],
    ["Jméno", p.jmeno],
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
    to: Session.getEffectiveUser().getEmail(),
    subject: "Nová přihláška: " + p.jmeno + " – " + p.zavod,
    name: "Roadbook",
    body:
      udaje.map((r) => r[0] + ": " + r[1]).join("\n") +
      "\n\nSchválit: " + odkaz("schvalit") +
      "\nZamítnout: " + odkaz("zamitnout") +
      "\n\nTabulka: " + urlTabulky,
    htmlBody:
      '<div style="font-family:system-ui,sans-serif;font-size:14px;color:#12212b">' +
      "<p>Nová přihláška na webu Roadbook:</p>" +
      '<table style="border-collapse:collapse;margin-bottom:18px">' + tabulka + "</table>" +
      tlacitko("✓ Schválit", odkaz("schvalit"), "#0d7a5e") +
      tlacitko("✕ Zamítnout", odkaz("zamitnout"), "#8a9aa5") +
      '<p style="margin-top:18px;font-size:12px;color:#5e7784">Dokud nekliknete na Schválit, ' +
      'přihláška se na webu nezobrazí. <a href="' + urlTabulky + '">Otevřít tabulku</a></p>' +
      "</div>",
  });
}

/* ── Pomocné funkce ─────────────────────────────────────────────────── */
function tabulka_() {
  const aktivni = SpreadsheetApp.getActiveSpreadsheet();
  if (aktivni) return aktivni;
  const id = PropertiesService.getScriptProperties().getProperty("TABULKA_ID");
  if (id) return SpreadsheetApp.openById(id);
  throw new Error("Skript není připojený k tabulce — spusť nejdřív funkci nastavit().");
}

function list_() {
  const tabulka = tabulka_();
  let list = tabulka.getSheetByName(LIST);
  if (!list) {
    const prvni = tabulka.getSheets()[0];
    const prazdny = prvni && prvni.getLastRow() === 0;
    list = prazdny ? prvni.setName(LIST) : tabulka.insertSheet(LIST);
    list.appendRow(HLAVICKA);
    list.setFrozenRows(1);
  }
  return list;
}

function dnesnichPrihlasek_(list) {
  const tz = Session.getScriptTimeZone();
  const dnes = Utilities.formatDate(new Date(), tz, "yyyy-MM-dd");
  return list
    .getDataRange()
    .getValues()
    .slice(1)
    .filter((r) => r[S.cas] instanceof Date && Utilities.formatDate(r[S.cas], tz, "yyyy-MM-dd") === dnes)
    .length;
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
  return String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
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
