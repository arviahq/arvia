import type { ReactNode } from "react";
import { Prose } from "../layout.arv";
import { renderProse } from "../../lib/render-prose";

export function DocLi(props: { children: ReactNode }) {
  const p = Prose();
  return <li className={p.li}>{renderProse(props.children)}</li>;
}
