---
"@arviahq/vite-plugin": patch
---

Stop warning when emitting sibling `.d.ts` for `.arv` files outside the source root

Consuming a workspace/published Arvia library compiles its `.arv` across a package boundary, so each file falls outside the central dts `sourceRoot` and gets a sibling `.d.ts` instead. The plugin used to log a `[arvia] … is outside the dts sourceRoot` warning per file, which flooded consumers' build output. The sibling fallback (so the types still resolve) is unchanged — only the per-file warning is removed, since those declarations belong to the dependency, not the consuming build.
