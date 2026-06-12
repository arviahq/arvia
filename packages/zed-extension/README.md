# Arvia for Zed

Zed extension for `.arv` design-system files: tree-sitter syntax
highlighting (grammar in `packages/tree-sitter-arvia`) and the full
`arvia-language-server` (diagnostics, completion, hover, rename,
references, formatting, …).

> **Status:** skeleton, not yet submitted to the Zed extension registry.
> Build/registry submission requires the Rust toolchain and a published
> grammar revision — see the checklist below.

## Try it locally

1. `npm i -g @arviahq/language-server` (or add it to your workspace).
2. Pin `[grammars.arvia] rev` in `extension.toml` to a commit that contains
   `packages/tree-sitter-arvia`.
3. Zed → Extensions → **Install Dev Extension** → select this directory.
   Zed compiles the Rust glue and fetches/compiles the grammar itself.

## Publishing checklist

- [ ] Pin `rev` to a stable commit (not `main`)
- [ ] `cargo build --target wasm32-wasip2` compiles clean
- [ ] PR to [zed-industries/extensions](https://github.com/zed-industries/extensions)
      (registry is submodule-based; it may require pointing the submodule at
      this monorepo subdirectory or splitting the extension into its own repo)
