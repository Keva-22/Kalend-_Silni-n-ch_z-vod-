import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// `base` odpovídá názvu repozitáře na GitHubu — nutné pro GitHub Pages,
// kde web běží na https://keva-22.github.io/Kalend-_Silni-n-ch_z-vod-/
export default defineConfig({
  plugins: [react()],
  base: "/Kalend-_Silni-n-ch_z-vod-/",
});
