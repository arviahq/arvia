import type { CompileResult, ThemeEnv } from "@arviahq/compiler";
import type { SnippetLabels } from "./app-snippets";
import type { FrameworkId } from "./frameworks";

export interface BuildRequest {
  id: number;
  framework: FrameworkId;
  arvSource: string;
  /** null → the worker generates the default snippet from the compiled meta. */
  appSource: string | null;
  labels: SnippetLabels;
  env?: ThemeEnv;
}

export interface BuildResponse {
  id: number;
  /** Raw compile artifacts — null when the .arv source has errors. */
  css: string | null;
  dts: string | null;
  designJs: string | null;
  meta: CompileResult["meta"];
  diagnostics: CompileResult["diagnostics"];
  /** Effective app source: the user's edit, or the generated default snippet. */
  appSource: string;
  /** Transpiled app module — null when transpilation failed. */
  appJs: string | null;
  /** Extra CSS from Vue <style> blocks. */
  appCss: string;
  appError: string | null;
}
