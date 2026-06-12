import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { proseLink } from "../layout.arv";

export function DocLink(props: { href: string; children: ReactNode }) {
  if (props.href.startsWith("http")) {
    return (
      <a className={proseLink} href={props.href} target="_blank" rel="noopener noreferrer">
        {props.children}
      </a>
    );
  }
  return (
    <Link className={proseLink} to={props.href}>
      {props.children}
    </Link>
  );
}
