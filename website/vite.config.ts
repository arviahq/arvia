import { defineConfig } from "vite";
import fbteePreset from "@nkzw/babel-preset-fbtee";
import react from "@vitejs/plugin-react";
import { arvia } from "@arviahq/vite-plugin-react";

export default defineConfig({
  plugins: [
    arvia({ theme: "src/theme.arv" }),
    react({
      babel: {
        presets: [fbteePreset],
      },
    }),
  ],
});
