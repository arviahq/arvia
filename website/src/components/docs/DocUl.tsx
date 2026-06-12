import type { ReactNode } from "react";
import { Prose } from "../layout.arv";

export function DocUl(props: { children: ReactNode }) {
  const p = Prose();
  return <ul className={p.ul}>{props.children}</ul>;
}
