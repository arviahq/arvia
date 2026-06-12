import type { ReactNode } from "react";
import { Heading } from "../heading.arv";
import { Text } from "../text.arv";
import type { DocPageMeta } from "../../docs/registry";

export function DocArticle(props: { meta: DocPageMeta; children: ReactNode }) {
  return (
    <article style={{ width: "100%" }}>
      <header style={{ marginBottom: 32, maxWidth: "42rem" }}>
        <h1 className={Heading({ level: "h1" }).root}>{props.meta.title}</h1>
        <p className={Text({ tone: "muted", size: "lg" }).root}>{props.meta.description}</p>
      </header>
      {props.children}
    </article>
  );
}
