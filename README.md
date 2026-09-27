# Roadbook — kalendář silničních maratonů střední Evropy

Kalendář silničních závodů v Česku a Rakousku, plus příhraniční Německo,
Slovensko a Itálie a vybrané závody v Chorvatsku. Převážně hromadné starty,
časovky jsou v seznamu označené. Každý řádek nese kilometry, převýšení
a profil trati — bez prokliku. Rozhraní je česky a německy.

Stack: Vite + React + TypeScript, deploy na GitHub Pages. Žádný backend —
všechna data žijí v jednom typovaném souboru `src/data/zavody.ts`.

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
