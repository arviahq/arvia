import type { ReactNode } from "react";
import { Alert, type AlertProps } from "../molecules/alert.arv";
import { FormField } from "../molecules/form-field.arv";
import { Stat, type StatProps } from "../molecules/stat.arv";
import { Badge } from "../atoms/badge.arv";
import { Button, type ButtonProps } from "../atoms/button.arv";
import { Link } from "../atoms/link.arv";
import { Stack } from "../atoms/stack.arv";
import { Text } from "../atoms/text.arv";
import { ConfirmPanel } from "../organisms/confirm-panel.arv";
import { FeatureGrid } from "../organisms/feature-grid.arv";
import { ProductCard } from "../organisms/product-card.arv";
import { SiteHeader } from "../organisms/site-header.arv";
import { DashboardLayout } from "../templates/dashboard-layout.arv";
import { PageShell } from "../templates/page-shell.arv";

export function DemoButton(
  props: ButtonProps & { children: ReactNode; disabled?: boolean; onClick?: () => void },
) {
  const styles = Button({ size: props.size, tone: props.tone });
  return (
    <button className={styles.root} disabled={props.disabled} onClick={props.onClick} type="button">
      <span className={styles.icon}>✦</span>
      <span className={styles.label}>{props.children}</span>
    </button>
  );
}

export function DemoAlert(props: AlertProps & { title: string; message: string; icon?: string }) {
  const styles = Alert({ tone: props.tone });
  return (
    <div className={styles.root} role="alert">
      <span className={styles.icon}>{props.icon ?? "ℹ"}</span>
      <div>
        <div className={styles.title}>{props.title}</div>
        <div className={styles.message}>{props.message}</div>
      </div>
    </div>
  );
}

export function DemoFormField(props: {
  label: string;
  hint?: string;
  invalid?: boolean;
  disabled?: boolean;
  placeholder?: string;
}) {
  const styles = FormField();
  return (
    <div className={styles.root} data-invalid={props.invalid ? "true" : undefined}>
      <label className={styles.label}>{props.label}</label>
      <input
        className={styles.input}
        placeholder={props.placeholder}
        disabled={props.disabled}
        aria-invalid={props.invalid ? "true" : undefined}
      />
      {props.hint ? <span className={styles.hint}>{props.hint}</span> : null}
    </div>
  );
}

export function DemoStat(props: StatProps & { value: string; label: string }) {
  const styles = Stat({ size: props.size, tone: props.tone });
  return (
    <div className={styles.root}>
      <div className={styles.value}>{props.value}</div>
      <div className={styles.label}>{props.label}</div>
    </div>
  );
}

export function DemoSiteHeader() {
  const styles = SiteHeader();
  const navLink = Link({ tone: "muted" });
  const navLinkPrimary = Link({ tone: "primary" });
  return (
    <header className={styles.root}>
      <div className={styles.brand}>Arvia</div>
      <nav className={styles.nav}>
        <a className={navLink.root} href="#">
          Home
        </a>
        <a className={navLinkPrimary.root} href="#">
          Docs
        </a>
        <a className={navLink.root} href="#">
          Blog
        </a>
      </nav>
      <div className={styles.actions}>
        <DemoButton size="sm" tone="ghost">
          Sign in
        </DemoButton>
        <DemoButton size="sm" tone="primary">
          Get started
        </DemoButton>
      </div>
    </header>
  );
}

export function DemoProductCard() {
  const card = ProductCard();
  const badge = Badge({ tone: "success" });
  return (
    <article className={card.root} style={{ width: 360 }}>
      <div className={card.media}>📦</div>
      <div className={card.content}>
        <div>
          <div className={card.title}>Design System Kit</div>
          <div className={card.price}>$49</div>
          <div className={card.meta}>
            <span className={badge.root}>In stock</span>
          </div>
        </div>
        <div className={card.actions}>
          <DemoButton size="sm" tone="primary">
            Add to cart
          </DemoButton>
        </div>
      </div>
    </article>
  );
}

export function DemoFeatureGrid() {
  const grid = FeatureGrid();
  const features = [
    { icon: "⚡", title: "Zero runtime", description: "Styles compile to static CSS." },
    { icon: "🎯", title: "Type-safe", description: "Variant props are fully typed." },
    { icon: "🧩", title: "Composable", description: "Recipes, slots, and tokens." },
  ];
  return (
    <div className={grid.root} style={{ width: 720 }}>
      {features.map((feature) => (
        <div key={feature.title} className={grid.item}>
          <div className={grid.icon}>{feature.icon}</div>
          <div className={grid.title}>{feature.title}</div>
          <div className={grid.description}>{feature.description}</div>
        </div>
      ))}
    </div>
  );
}

export function DemoConfirmPanel() {
  const panel = ConfirmPanel();
  const row = Stack({ direction: "row", gap: "2", align: "center" });
  return (
    <div className={panel.root}>
      <header className={panel.header}>Delete project?</header>
      <div className={panel.body}>
        This action cannot be undone. All data associated with this project will be permanently
        removed.
      </div>
      <footer className={panel.footer}>
        <div className={row.root}>
          <DemoButton size="sm" tone="ghost">
            Cancel
          </DemoButton>
          <DemoButton size="sm" tone="danger">
            Delete
          </DemoButton>
        </div>
      </footer>
    </div>
  );
}

export function DemoPageShell() {
  const shell = PageShell();
  return (
    <div className={shell.root} style={{ width: 720, minHeight: 400 }}>
      <header className={shell.header}>
        <DemoSiteHeader />
      </header>
      <main className={shell.main}>
        <h1 className={Text({ size: "xl", weight: "bold" }).root}>Page content</h1>
        <p className={Text({ tone: "muted" }).root}>
          Templates compose organisms and atoms into full-page layouts.
        </p>
      </main>
      <footer className={shell.footer}>© 2026 Arvia Design System</footer>
    </div>
  );
}

export function DemoDashboardLayout() {
  const layout = DashboardLayout();
  return (
    <div className={layout.root} style={{ width: 720, minHeight: 400 }}>
      <aside className={layout.sidebar}>
        <p className={Text({ size: "sm", weight: "bold" }).root}>Navigation</p>
        <p className={Text({ size: "sm", tone: "muted" }).root}>Overview</p>
        <p className={Text({ size: "sm", tone: "muted" }).root}>Components</p>
        <p className={Text({ size: "sm", tone: "muted" }).root}>Tokens</p>
      </aside>
      <main className={layout.content}>
        <h1 className={Text({ size: "lg", weight: "bold" }).root}>Dashboard</h1>
        <p className={Text({ tone: "muted" }).root}>
          Sidebar appears at the lg breakpoint. Resize the viewport to see responsive behavior.
        </p>
      </main>
    </div>
  );
}
