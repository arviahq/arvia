import { useEffect, type ReactNode } from "react";
import { Prose } from "../layout.arv";
import { headingId } from "../../lib/doc-heading";
import { headingText, renderProse } from "../../lib/render-prose";
import { useRegisterDocHeading } from "./DocHeadingContext";

export function DocH2(props: { children: ReactNode }) {
  const p = Prose();
  const text = headingText(props.children);
  const id = headingId(text);
  const register = useRegisterDocHeading();

  useEffect(() => register({ id, text, level: 2 }), [id, text, register]);

  return (
    <h2 id={id} className={p.h2}>
      {renderProse(props.children)}
    </h2>
  );
}
