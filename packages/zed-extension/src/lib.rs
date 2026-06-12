//! Zed extension for Arvia (.arv): tree-sitter highlighting plus the
//! `arvia-language-server` over stdio. The server binary is resolved from
//! PATH or from a workspace `node_modules/.bin` install of
//! `@arviahq/language-server`.

use zed_extension_api::{self as zed, Result};

struct ArviaExtension;

impl zed::Extension for ArviaExtension {
    fn new() -> Self {
        ArviaExtension
    }

    fn language_server_command(
        &mut self,
        _language_server_id: &zed::LanguageServerId,
        worktree: &zed::Worktree,
    ) -> Result<zed::Command> {
        let path = worktree
            .which("arvia-language-server")
            .or_else(|| {
                let local = "node_modules/.bin/arvia-language-server";
                worktree.read_text_file(local).ok().map(|_| local.to_string())
            })
            .ok_or_else(|| {
                "arvia-language-server not found — install @arviahq/language-server \
                 (npm i -g @arviahq/language-server) or add it to the workspace"
                    .to_string()
            })?;

        Ok(zed::Command {
            command: path,
            args: vec![],
            env: worktree.shell_env(),
        })
    }
}

zed::register_extension!(ArviaExtension);
