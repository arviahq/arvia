import type { ReactNode } from "react";
import { DocsLayout } from "../layout.arv";
import { DocsMobileNav } from "./DocsMobileNav";
import { DocsSidebar } from "./DocsSidebar";

export function DocsShell(props: { children: ReactNode; toc?: ReactNode }) {
  const layout = DocsLayout();
  return (
    <div className={layout.root}>
      <div className={layout.sidebar}>
        <DocsSidebar />
      </div>
      <main className={layout.content}>
        <DocsMobileNav />
        {props.children}
      </main>
      <div className={layout.toc}>{props.toc}</div>
    </div>
  );
}
