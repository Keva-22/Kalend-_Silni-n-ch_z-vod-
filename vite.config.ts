import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Relativní `base`: odkazy na skripty a styly jsou vůči stránce, takže web
// běží pod jakýmkoli názvem repozitáře (https://keva-22.github.io/<název>/)
// a přejmenování repozitáře ho nerozbije. Jde to díky tomu, že stránka
// používá jen hash adresy (#zavod/…, #mitfahren), ne cesty.
export default defineConfig({
  plugins: [react()],
  base: "./",
});
