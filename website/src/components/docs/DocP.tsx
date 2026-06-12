import type { ReactNode } from "react";
import { Prose } from "../layout.arv";
import { renderProse } from "../../lib/render-prose";

export function DocP(props: { children: ReactNode }) {
  const p = Prose();
  return <p className={p.p}>{renderProse(props.children)}</p>;
}
