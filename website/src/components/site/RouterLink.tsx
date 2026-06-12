import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { appLink } from "../../lib/router-links";
import { Link as StyledLink } from "../link.arv";

export function RouterLink(props: {
  to: string;
  tone?: "default" | "muted" | "accent";
  children: ReactNode;
}) {
  const styles = StyledLink({ tone: props.tone ?? "default" });
  const link = appLink(props.to);
  return (
    <Link
      {...link}
      className={styles.root}
      activeProps={{ className: StyledLink({ tone: props.tone ?? "default", active: "yes" }).root }}
      activeOptions={{ exact: true }}
    >
      {props.children}
    </Link>
  );
}
