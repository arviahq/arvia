import { defineConfig } from "vite";
import fbteePreset from "@nkzw/babel-preset-fbtee";
import react from "@vitejs/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { arvia } from "@arviahq/vite-plugin-react";

export default defineConfig({
  plugins: [
    arvia({ theme: "src/theme.arv" }),
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    react({
      babel: {
        presets: [fbteePreset],
      },
    }),
  ],
});
