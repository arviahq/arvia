---
"@arviahq/vite-plugin-vue": minor
"@arviahq/typescript-plugin": minor
---

Add `@arviahq/vite-plugin-vue`, the Vue + Vite entrypoint for Arvia. Its `arvia-tsc` is Vue-aware: a new `@arviahq/typescript-plugin/vue-cli` entry loads the Vue language plugin alongside Arvia's, so `.arv` imports inside `.vue` single-file components typecheck with no on-disk `.d.ts` files — use it in place of `vue-tsc`.
