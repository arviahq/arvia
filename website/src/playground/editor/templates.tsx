import type { ReactNode } from "react";

export type EditorTemplate = {
  id: string;
  label: ReactNode;
  source: string;
};

export function getEditorTemplates(): EditorTemplate[] {
  return [
    {
      id: "button",
      label: <fbt desc="Playground starter template label">{"Button"}</fbt>,
      source: `component Button {
  base {
    display: inline-flex;
    align-items: center;
    gap: space.2;
    padding: space.2 space.4;
    border: none;
    border-radius: radius.md;
    background: color.primary;
    color: white;
    font: inherit;
    cursor: pointer;
    use FocusRing;

    &:hover {
      background: color.primaryHover;
    }
  }
}
`,
    },
    {
      id: "badge",
      label: <fbt desc="Playground starter template label">{"Badge"}</fbt>,
      source: `component Badge {
  display: inline-flex;
  padding: space.1 space.3;
  border-radius: radius.full;
  font-size: font.sm;
  font-weight: 600;
  background: color.border;
  color: color.text;

  variants {
    tone {
      success { background: color.success; color: white; }
      danger { background: color.danger; color: white; }
    }
  }

  defaults {
    tone: success;
  }
}
`,
    },
    {
      id: "variants",
      label: <fbt desc="Playground starter template label">{"Variants"}</fbt>,
      source: `component Pill {
  base {
    display: inline-flex;
    padding: space.1 space.3;
    border-radius: radius.full;
    font-size: font.sm;
    border: none;
    cursor: pointer;
  }

  variants {
    tone {
      primary { background: color.primary; color: white; }
      ghost {
        background: transparent;
        color: color.text;
        border: 1px solid color.border;
      }
    }
    size {
      sm { font-size: font.sm; }
      lg { font-size: font.lg; padding: space.2 space.4; }
    }
  }

  defaults {
    tone: primary;
    size: sm;
  }
}
`,
    },
    {
      id: "slots",
      label: <fbt desc="Playground starter template label">{"Slots"}</fbt>,
      source: `component IconButton {
  slots {
    icon { flex-shrink: 0; }
    label { font-weight: 500; }
  }

  base {
    display: inline-flex;
    align-items: center;
    gap: space.2;
    padding: space.2 space.4;
    border-radius: radius.md;
    background: color.primary;
    color: white;
    border: none;
    font: inherit;
  }
}
`,
    },
    {
      id: "responsive",
      label: <fbt desc="Playground starter template label">{"Responsive"}</fbt>,
      source: `theme {
  color { primary = #635bff; }
  space { 1 = 4px; 3 = 12px; 5 = 24px; }
  radius { md = 10px; }
  font { sm = 13px; lg = 18px; }
  breakpoint { md = 768px; }
}

component ResponsiveButton {
  base {
    display: inline-flex;
    border: none;
    border-radius: radius.md;
    background: color.primary;
    color: white;
    font: inherit;
    cursor: pointer;
    padding: space.1 space.3;
    font-size: font.sm;

    @media (min-width: breakpoint.md) {
      padding: space.3 space.5;
      font-size: font.lg;
    }
  }
}
`,
    },
  ];
}

export function getDefaultTemplate(): EditorTemplate {
  return getEditorTemplates()[0]!;
}
