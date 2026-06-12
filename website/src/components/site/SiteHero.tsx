import { Link } from "@tanstack/react-router";
import { appLink } from "../../lib/router-links";
import { Badge } from "../badge.arv";
import { Button } from "../button.arv";
import { Heading } from "../heading.arv";
import { Hero, HeroShell } from "../layout.arv";
import { Link as StyledLink } from "../link.arv";
import { HeroBackground } from "../HeroBackground";

export function SiteHero() {
  const shell = HeroShell();
  const hero = Hero();
  return (
    <div className={shell.root}>
      <div className={shell.backdrop}>
        <HeroBackground />
      </div>
      <section className={shell.content + " " + hero.root}>
        <div className={hero.badge}>
          <span className={Badge({ tone: "accent" }).root}>
            <fbt desc="Hero badge highlighting product traits">{"zero runtime · fully typed"}</fbt>
          </span>
        </div>
        <h1 className={Heading({ level: "display" }).root + " " + hero.title}>
          <fbt desc="Hero headline first line">{"Design systems deserve"}</fbt>
          <br />
          <fbt desc="Hero headline second line">{"their own language."}</fbt>
        </h1>
        <p className={hero.subtitle}>
          <fbt desc="Hero subtitle first line">
            {
              "Extend familiar CSS with first-class tokens, themes, variants, slots, and components."
            }
          </fbt>
          <br />
          <fbt desc="Hero subtitle second line">
            {
              "Compile to optimized CSS, generated types, and typed component APIs — zero runtime\n            overhead."
            }
          </fbt>
        </p>
        <div className={hero.actions}>
          <Link {...appLink("/docs/quick-start")} className={Button({ tone: "primary" }).root}>
            <fbt desc="Primary hero call to action">{"Get started"}</fbt>
          </Link>
          <Link {...appLink("/playground")} className={Button({ tone: "surface" }).root}>
            <fbt desc="Secondary hero call to action">{"Try playground"}</fbt>
          </Link>
        </div>
        <p className={hero.frameworks}>
          <fbt desc="Label before supported framework links">{"Supported frameworks:"}</fbt>{" "}
          <Link {...appLink("/docs/installation")} className={StyledLink({ tone: "accent" }).root}>
            React
          </Link>
          {" · "}
          <Link {...appLink("/docs/installation")} className={StyledLink({ tone: "accent" }).root}>
            Preact
          </Link>
          {" · "}
          <Link {...appLink("/docs/installation")} className={StyledLink({ tone: "accent" }).root}>
            Vue
          </Link>
        </p>
      </section>
    </div>
  );
}
