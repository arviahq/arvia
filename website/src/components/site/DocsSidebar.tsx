import { getDocNav } from "../../docs/registry";
import { headingText } from "../../lib/render-prose";
import { SidebarSection } from "../layout.arv";
import { DocsSearchTrigger, isAlgoliaDocSearchEnabled } from "../DocsSearch";
import { RouterLink } from "./RouterLink";

export function DocsSidebar() {
  const docNav = getDocNav();
  return (
    <aside>
      {!isAlgoliaDocSearchEnabled() ? <DocsSearchTrigger variant="sidebar" /> : null}
      {docNav.map((group) => {
        const s = SidebarSection();
        return (
          <div key={headingText(group.section)} className={s.root}>
            <p className={s.title}>{group.section}</p>
            <div className={s.links}>
              {group.items.map((item) => (
                <RouterLink key={item.slug} to={`/docs/${item.slug}`} tone="muted">
                  {item.title}
                </RouterLink>
              ))}
            </div>
          </div>
        );
      })}
    </aside>
  );
}
