# Roadbook — kalendář silničních maratonů střední Evropy

Kalendář silničních závodů v Česku a Rakousku, plus příhraniční Německo,
Slovensko a Itálie a vybrané závody v Chorvatsku. Převážně hromadné starty,
časovky jsou v seznamu označené. Každý řádek nese kilometry, převýšení
a profil trati — bez prokliku. Rozhraní je česky a německy.

Stack: Vite + React + TypeScript, deploy na GitHub Pages. Žádný backend —
všechna data o závodech žijí v jednom typovaném souboru `src/data/zavody.ts`.
Výjimkou jsou přihlášky na stránce „Wer fährt mit?", které se čtou
z Google Tabulky (viz [Přihlášky](#přihlášky-wer-fährt-mit)).

## Vývoj

```bash
npm install
npm run dev       # vývojový server (v konzoli vypíše kontrolu dat)
npx tsc --noEmit  # typová kontrola
npm run build     # produkční build do dist/
npm run deploy    # build + publikace na větev gh-pages (balík gh-pages)
```

`npm run deploy` jen nahraje build na větev `gh-pages`. Samotné zapnutí
GitHub Pages je jednorázové, v Settings → Pages → Deploy from a branch →
`gh-pages` → `/ (root)`.

## Jak přidat nový závod

Všechny závody jsou v poli `ZAVODY` v souboru `src/data/zavody.ts`. Nový
závod přidej jako další objekt do pole — TypeScript při buildu ohlídá
překlepy v polích i chybějící hodnoty.

```ts
{
  // ── povinná pole ──
  id: "mondsee-2027",              // unikátní, tvar "<slug>-<rok>"; používá se v URL (#zavod/mondsee-2027)
  nazev: "Mondsee 5 Seen Radmarathon",
  misto: "Mondsee",
  region: "Oberösterreich",
  zeme: "AT",                      // jen 'CZ' | 'AT' | 'DE' | 'SK' | 'IT' | 'HR'
  datum: "2027-06-20",             // 'YYYY-MM-DD'; null = termín zatím nevyhlášen
  odhadMesic: "2027-06",           // 'YYYY-MM'; povinné, když datum === null (jinak vynech)
  overeno: "check",                // viz níže
  serie: null,                     // název série, nebo null
  trasy: [
    { nazev: "Kurz", km: 75, hm: 400 },
    { nazev: "Lang", km: 200, hm: 2600 },
  ],
  uzavirky: "nezname",             // 'plna' | 'castecna' | 'provoz' | 'nezname'
  startovne: null,                 // volný text, nebo null
  web: "https://www.5seen-radmarathon.at",  // odkaz na pořadatele, nebo null
  zdroj: "radsport-events.de",     // odkud údaje pocházejí — vždy vyplnit

  // ── rozšířená pole, všechna volitelná ──
  distanceKm: 200,                 // [uncertain] nejdelší ze 2 změřených tras
  elevationM: 2600,                // [uncertain] nejdelší ze 2 změřených tras
  profile: "hilly",                // [uncertain] odvozeno z hm/km = 13.0
  startLocation: { city: "Mondsee", country: "AT" },
  status: "provisional",           // [uncertain] odvozeno z overeno="check"
}
```

### Povinná pole

Povinné je každé pole modelu `Zavod` (viz `src/types.ts`) kromě
`odhadMesic`, které je povinné jen tehdy, když `datum` je `null`.
Pole `datum`, `serie`, `startovne` a `web` mohou mít hodnotu `null`;
u tras mohou být `null` hodnoty `km` a `hm`.

**Nikdy si údaje nedomýšlej.** Když kilometry, převýšení nebo startovné
neznáš, nech `null` — web je zobrazí jako „nedoplněno". Vymyšlený termín
nebo cena jsou horší než chybějící údaj.

### Hodnoty `overeno`

| Hodnota   | Význam |
|-----------|--------|
| `ok`      | termín pochází z oficiálního webu závodu |
| `check`   | termín je z cizího kalendáře a je potřeba ho ověřit u pořadatele |
| `tbc`     | termín zatím nevyhlášen (`datum: null` + vyplněný `odhadMesic`) |

## Rozšířená volitelná pole

Model má navíc 16 volitelných polí. Kterékoli z nich se smí vynechat —
`undefined` znamená „zatím neověřeno", nikdy „nula" nebo „neexistuje".

| Pole | Typ | Poznámka |
|------|-----|----------|
| `distanceKm` | `number` | km nejdelší trasy |
| `elevationM` | `number` | převýšení nejdelší trasy v metrech |
| `profile` | `'flat' \| 'hilly' \| 'mountain'` | pozor, jiná škála než zobrazovaná — viz níže |
| `startTime` | `string` | `'HH:MM'` místního času |
| `startLocation` | `{ city, country, lat?, lng? }` | `country` je stejný výčet jako `zeme` |
| `categories` | `string[]` | vypsané kategorie závodu |
| `entryFee` | `string` | volný text včetně měny a termínů |
| `registrationUrl` | `string` | musí začínat `https://` |
| `registrationDeadline` | `string` | `'YYYY-MM-DD'` |
| `gpxUrl` | `string` | musí začínat `https://` |
| `resultsUrl` | `string` | musí začínat `https://` |
| `organizer` | `string` | jméno pořadatele |
| `series` | `string` | název série |
| `status` | `'confirmed' \| 'provisional' \| 'cancelled'` | stav konání závodu |
| `lastVerified` | `string` | `'YYYY-MM-DD'`, kdy byl záznam naposledy ověřen |
| `sourceUrl` | `string` | URL zdroje, musí začínat `https://` |
| `format` | `'mass-start' \| 'time-trial'` | vynechané = hromadný start; časovka dostane v seznamu štítek |
| `de` | `{ nazev?, misto?, region?, startovne?, zdroj?, trasy? }` | německé znění, viz [Němčina](#němčina) |

### Značka `// [uncertain]`

Hodnota, kterou jsi **odvodil** místo toho, abys ji přečetl ze zdroje, se
označuje komentářem `// [uncertain]` na svém řádku. Typicky výběr nejdelší
z více tras, přepočet profilu z hm/km nebo odvození `status` z `overeno`.
Přečtená hodnota se neoznačuje. Díky tomu je při pozdější rešerši vidět,
co je potřeba potvrdit.

### Na co si dát pozor

- **Nová pole se zatím nikde nezobrazují.** Komponenty čtou stará česká
  pole. Vyplnění `distanceKm` nebo `entryFee` samo o sobě web nezmění.
- **Část polí duplikuje stará:** `series` ↔ `serie`, `entryFee` ↔
  `startovne`, `sourceUrl` ↔ `zdroj`, `distanceKm` + `elevationM` ↔
  `trasy[]`. Při editaci udržuj obě strany v souladu, dokud se to
  nesjednotí.
- **`series: undefined` neznamená „dohledat".** U závodu, který do žádné
  série nepatří, je to správný stav — stejně jako `serie: null`.

## Němčina

Web má přepínač Česky / Deutsch v hlavičce. Výchozí jazyk je čeština;
návštěvník s německy nastaveným prohlížečem dostane rovnou němčinu. Volba
se pamatuje v prohlížeči. Žádná knihovna na překlady se nepoužívá.

**Texty rozhraní** jsou ve slovníku `src/i18n.ts` (`CS` a `DE`). Oba
slovníky mají stejný typ `Texty`, takže když nový text doplníš jen do
jednoho jazyka, build spadne.

**Texty v datech** se překládají polem `de` přímo u závodu. Vyplň jen to,
co je v originále česky nebo se v němčině říká jinak:

```ts
de: {
  misto: "Riesengebirge",          // Krkonoše
  region: "Region Hradec Králové",
  startovne: "1 290 Kč bis 31. 12. 2026 → 1 890 Kč",
  trasy: ["Hauptstrecke", "Kurze Strecke"],  // stejné pořadí jako trasy[]
},
```

Co v `de` chybí, zobrazí se v originále. Vlastní jména (rakouská místa,
názvy závodů, německé názvy tras) se nepřekládají. Když píšeš nový závod
s českým `zdroj` nebo `startovne`, přidej rovnou i `de` — jinak se
v německé verzi objeví česky.

## Přihlášky („Wer fährt mit?")

Vedlejší stránka `#mitfahren` (jen německy): návštěvník se u závodu
přihlásí formulářem přímo na webu — **jede / možná (vielleicht)**, trasa,
tempo, jestli má nebo hledá odvoz, komentář. Svou přihlášku může kdykoli
**změnit nebo zrušit**.

**Schvaluje se osoba, ne každá přihláška.** Kdo se přihlásí poprvé, tomu
nic nezobrazí hned — tobě přijde e-mail s tlačítky **Schválit /
Zamítnout**. Jakmile osobu jednou schválíš, její další přihlášky i změny
se na webu objeví rovnou a e-mail už nechodí.

Osobu poznáme podle tajného **osobního klíče**, který dostane při první
přihlášce a zapamatuje si ho prohlížeč. Na jiné zařízení si ho přenese
osobním odkazem (`#mitfahren/ich/<klíč>`), který vidí na stránce nahoře.
Podle jména se osoba nepozná záměrně — jinak by se kdokoli mohl vydávat
za už schváleného člověka. Od lidí nechceme e-mail ani heslo.

Serverovou část obstarává **Google Apps Script** (`apps-script/prihlasky.gs`)
připojený ke Google Tabulce, zdarma pod tvým účtem. Web sám zůstává
statický.

Dokud je v `src/data/prihlasky.ts` prázdná `PRIHLASKY_URL`, je funkce
vypnutá: odkazy se nezobrazují a `#mitfahren` jen oznámí, že ještě není
spuštěná.

### Jednorázové nastavení (asi 5 minut)

**1. Tabulka.** Otevři [sheets.new](https://sheets.new) — založí se nová
Google Tabulka. Pojmenuj ji třeba „Roadbook – přihlášky".

**2. Skript.** V tabulce *Rozšíření → Apps Script*. Smaž, co je v editoru,
a vlož celý obsah souboru
[`apps-script/prihlasky.gs`](https://github.com/Keva-22/Kalend-_Silni-n-ch_z-vod-/blob/claude/attached-documents-2jxd78/apps-script/prihlasky.gs)
(na GitHubu tlačítko *Copy raw file*). Ulož (ikona diskety).

**3. Oprávnění a zkouška.** Nahoře vyber funkci `nastavit` a klikni
*▶ Spustit*. Google chce oprávnění: *Zkontrolovat oprávnění* → tvůj účet →
„Google tuto aplikaci neověřil" → *Rozšířené* → *Přejít na projekt* →
*Povolit*. (Je to tvůj vlastní skript, proto ho Google neověřoval.) Přijde
ti zkušební e-mail a v tabulce vzniknou listy „Osoby" a „Přihlášky".

**4. Nasazení.** *Nasadit → Nové nasazení* → u „Vyberte typ" ozubené
kolečko → *Webová aplikace*. Spustit jako: **Já**, kdo má přístup:
**Kdokoli** → *Nasadit*. Zkopíruj *URL webové aplikace* (končí `/exec`).

**5.** Adresu vlož do `src/data/prihlasky.ts` a spusť `npm run deploy`.
Kontrola: adresa otevřená v prohlížeči ukáže
`{"ok":true,"sluzba":"roadbook-prihlasky"}`.

### Schvalování

E-mail přijde jen tehdy, když se přihlásí **nová osoba**. Obsahuje, co
vyplnila, a tlačítka **✓ Schválit** a **✕ Zamítnout**. Tlačítka fungují
i později: zamítnutím kdykoli skryješ všechny přihlášky té osoby
a schválením je zase vrátíš.

V tabulce jsou dva listy:

- **Osoby** — jméno a stav (`čeká` / `schváleno` / `zamítnuto`). Stav
  můžeš přepsat i ručně, stačí `ano` nebo `ne`. Místo klíče je tu jen
  jeho otisk, takže ani z tabulky se za nikoho vydávat nejde.
- **Přihlášky** — jedna řádka na osobu a závod (jede / možná, trasa,
  tempo, odvoz, komentář).

### Když e-mail nepřišel

Přihláška se uloží vždy, i když e-mail selže. Osoba pak jen čeká
v listu „Osoby".

- E-mail jde na **Google účet, pod kterým skript běží**, tedy na vlastníka
  tabulky. Kdo má víc účtů, ať zkontroluje ten, pod kterým tabulku založil
  (ikona účtu vpravo nahoře v editoru skriptu). Hledej v Gmailu
  „Roadbook" i ve spamu a v záložkách Aktualizace a Promo akce.
- V editoru skriptu vyber funkci **`poslatZnovu`** a *▶ Spustit*. Pošle
  e-mail znovu za každou osobu, která čeká, a v *Protokolu provádění*
  ukáže, na jakou adresu odešel.
- E-maily jinam: nahoře ve skriptu vyplň `EMAIL_SPRAVCE` a nasaď novou
  verzi (viz níže).
- Chyby odesílání jsou v editoru vlevo v **Spuštění** (u běhu `doPost`).
- Schválit jde i bez e-mailu: v listu „Osoby" přepiš Stav na `ano`.

### Co je veřejné a jak je to chráněné

- Web dostane **jen přihlášky schválených osob** a jen jméno, závod,
  účast, trasu, tempo, odvoz a komentář. Kdo ještě čeká, vidí svou
  přihlášku jen sám (s poznámkou „nur für dich sichtbar").
- Upravit nebo smazat přihlášku jde jen s osobním klíčem té osoby.
- Skryté pole jako past na roboty, nejvýš 40 nových osob denně (každá je
  jeden e-mail, Gmail smí 100 denně), nejvýš 40 změn na osobu, omezená
  délka polí. Text z formuláře se do tabulky ukládá vždy jako text, nikdy
  jako vzorec.
- Schválená osoba může měnit i své jméno a změna se ukáže hned — to je
  cena za „schválit jen jednou". Když něco nesedí, zamítni ji tlačítkem
  z původního e-mailu.

### Když se skript změní

*Nasadit → Spravovat nasazení* → tužka → Verze: *Nová verze* → *Nasadit*.
Adresa `/exec` zůstane stejná, na webu není potřeba nic měnit.

## Kontrola dat

`src/validace.ts` kontroluje to, co typový systém neuhlídá: formát data,
rozsahy čísel, tvar URL, opakovaná `id`, povinný `odhadMesic` u závodů
bez termínu a u `de.trasy` stejný počet názvů jako tras. Zároveň hlásí,
která rozšířená pole ještě nejsou doplněná.

Spouští se automaticky při `npm run dev` a vypisuje do konzole prohlížeče.
V produkčním buildu se do bundlu vůbec nezabalí.

```
Kontrola dat: 25 z 25 závodů nemá doplněná všechna rozšířená pole
  oetztaler-2026 — chybí: startTime, categories, entryFee, ...
```

## Jak se data zobrazují

- Závod se řadí do sezóny a měsíce podle `datum`, u závodů bez termínu
  podle `odhadMesic`. Závody bez termínu jdou na konec svého měsíce
  a místo dne mají značku TBC.
- Zobrazovaný profil (rovina / zvlněná / kopcovitá / horská) se počítá
  automaticky z nejdelší trasy, u které jsou vyplněné `km` i `hm`:
  převýšení na kilometr < 8 rovina, 8–15 zvlněná, 15–22 kopcovitá, > 22 horská.
  Barva profilu se promítá i do levého pruhu řádku.
- Volitelné pole `profile` má **jinou, hrubší škálu** (`flat` / `hilly` /
  `mountain`) a na zobrazení nemá vliv.
- Chybějící `km`, `hm` a `startovne` se zobrazují jako „nedoplněno".
