# Roadbook — kalendář silničních maratonů střední Evropy

Kalendář silničních hromadných závodů v Česku a Rakousku, plus příhraniční
Německo, Slovensko a Itálie. Každý řádek seznamu nese kilometry, převýšení
a profil trati — bez prokliku.

Stack: Vite + React + TypeScript, deploy na GitHub Pages. Žádný backend —
všechna data žijí v jednom typovaném souboru `src/data/zavody.ts`.

## Vývoj

```bash
npm install
npm run dev       # vývojový server
npx tsc --noEmit  # typová kontrola
npm run build     # produkční build do dist/
npm run deploy    # build + publikace na GitHub Pages (balík gh-pages)
```

## Jak přidat nový závod

Všechny závody jsou v poli `ZAVODY` v souboru `src/data/zavody.ts`. Nový
závod přidej jako další objekt do pole — TypeScript při buildu ohlídá
překlepy v polích i chybějící hodnoty.

```ts
{
  id: "mondsee-2027",              // unikátní, tvar "<slug>-<rok>"; používá se v URL (#zavod/mondsee-2027)
  nazev: "Mondsee 5 Seen Radmarathon",
  misto: "Mondsee",
  region: "Oberösterreich",
  zeme: "AT",                      // jen 'CZ' | 'AT' | 'DE' | 'SK' | 'IT'
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

### Jak se data zobrazují

- Závod se řadí do sezóny a měsíce podle `datum`, u závodů bez termínu
  podle `odhadMesic`. Závody bez termínu jdou na konec svého měsíce
  a místo dne mají značku TBC.
- Profil (rovina / zvlněná / kopcovitá / horská) se počítá automaticky
  z nejdelší trasy, u které jsou vyplněné `km` i `hm`:
  převýšení na kilometr < 8 rovina, 8–15 zvlněná, 15–22 kopcovitá, > 22 horská.
- Chybějící `km`, `hm` a `startovne` se zobrazují jako „nedoplněno".
