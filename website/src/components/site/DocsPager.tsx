import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { appLink } from "../../lib/router-links";
import { Pager } from "../layout.arv";

export function DocsPager(props: {
  prev?: { slug: string; title: ReactNode };
  next?: { slug: string; title: ReactNode };
}) {
  const pager = Pager();
  return (
    <div className={pager.root}>
      {props.prev ? (
        <Link className={pager.item} {...appLink("/docs/$slug", { slug: props.prev.slug })}>
          <span className={pager.label}>
            <fbt desc="Pager previous label">{"Previous"}</fbt>
          </span>
          <span className={pager.title}>{props.prev.title}</span>
        </Link>
      ) : (
        <span />
      )}
      {props.next ? (
        <Link
          className={pager.item}
          {...appLink("/docs/$slug", { slug: props.next.slug })}
          style={{ textAlign: "right" }}
        >
          <span className={pager.label}>
            <fbt desc="Pager next label">{"Next"}</fbt>
          </span>
          <span className={pager.title}>{props.next.title}</span>
        </Link>
      ) : (
        <span />
      )}
    </div>
  );
}
