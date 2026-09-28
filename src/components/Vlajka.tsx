import type { Zeme } from "../types";

/* Malá vlajka z CSS přechodů (bez obrázků a emoji, které Windows
   nevykreslí). Kód země je vždy vedle jako text, vlajka je jen ozdoba. */
export function Vlajka({ zeme }: { zeme: Zeme }) {
  return <span className={`vlajka vlajka--${zeme}`} aria-hidden="true" />;
}
