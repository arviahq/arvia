import { Activity, useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { DocsMobileNav as DocsMobileNavStyles } from "../layout.arv";
import { DocsSidebar } from "./DocsSidebar";

export function DocsMobileNav() {
  const nav = DocsMobileNavStyles();
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className={nav.root} data-state={open ? "open" : "closed"}>
      <button
        type="button"
        className={nav.trigger}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span className={nav.chevron} aria-hidden>
          ▸
        </span>
        <fbt desc="Mobile docs navigation trigger">{"Browse docs"}</fbt>
      </button>
      <Activity mode={open ? "visible" : "hidden"}>
        <div className={nav.panel}>
          <DocsSidebar />
        </div>
      </Activity>
    </div>
  );
}
