import type { ReactNode } from "react";
import { Callout } from "../layout.arv";
import { renderProse } from "../../lib/render-prose";

export function DocCallout(props: { tone: "info" | "warning" | "tip"; children: ReactNode }) {
  const callout = Callout({ tone: props.tone });
  const labels = {
    info: <fbt desc="Callout label — informational note">{"Note"}</fbt>,
    warning: <fbt desc="Callout label — warning about a pitfall">{"Warning"}</fbt>,
    tip: <fbt desc="Callout label — pro tip">{"Tip"}</fbt>,
  };
  return (
    <aside className={callout.root}>
      <span className={callout.label}>{labels[props.tone]}</span>
      <span className={callout.body}>{renderProse(props.children)}</span>
    </aside>
  );
}
