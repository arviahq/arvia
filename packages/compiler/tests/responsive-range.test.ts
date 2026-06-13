import { describe, expect, it } from "vitest";
import { compile, compileDts } from "../src/index.js";
import { formatArv } from "../src/format/format.js";

const THEME = `theme {
  breakpoint { sm = 480px; md = 768px; lg = 1024px; }
  container { narrow = 320px; wide = 560px; }
}`;

/** Compiles a component body against the shared range theme above. */
const css = (body: string) => {
  const result = compile(`${THEME}\n${body}`, { filename: "range.arv" });
  expect(result.diagnostics.filter((d) => d.severity === "error")).toEqual([]);
  return result.css!;
};

const codes = (source: string) =>
  compile(source, { filename: "range.arv" }).diagnostics.map((d) => d.code);

describe("responsive/container range syntax", () => {
  describe("CSS emission", () => {
    it("bare breakpoint stays @media (min-width) — backward compatible", () => {
      const out = css(`component B {
        variants { size { sm { padding: 4px; } lg { padding: 16px; } } }
        defaults { size: sm; }
        responsive { md { size: lg; } }
      }`);
      expect(out).toContain("@media (min-width: 768px)");
    });

    it("`md..` is identical to bare `md`", () => {
      const bare = css(`component B {
        variants { size { sm { padding: 4px; } lg { padding: 16px; } } }
        defaults { size: sm; }
        responsive { md { size: lg; } }
      }`);
      const explicit = css(`component B {
        variants { size { sm { padding: 4px; } lg { padding: 16px; } } }
        defaults { size: sm; }
        responsive { md.. { size: lg; } }
      }`);
      expect(explicit).toBe(bare);
    });

    it("`..lg` emits an exclusive upper bound", () => {
      const out = css(`component B {
        variants { size { sm { padding: 4px; } lg { padding: 16px; } } }
        defaults { size: sm; }
        responsive { ..lg { size: lg; } }
      }`);
      expect(out).toContain("@media (width < 1024px)");
    });

    it("`sm..lg` emits a half-open band", () => {
      const out = css(`component B {
        variants { size { sm { padding: 4px; } lg { padding: 16px; } } }
        defaults { size: sm; }
        responsive { sm..lg { size: lg; } }
      }`);
      expect(out).toContain("@media (480px <= width < 1024px)");
    });

    it("container ranges use inline-size for bounded forms, min-width for >=", () => {
      const out = css(`component C {
        variants { layout { stacked { padding: 8px; } row { padding: 16px; } } }
        defaults { layout: stacked; }
        container {
          wide { layout: row; }
          ..wide { layout: stacked; }
          narrow..wide { layout: row; }
        }
      }`);
      expect(out).toContain("@container (min-width: 560px)");
      expect(out).toContain("@container (inline-size < 560px)");
      expect(out).toContain("@container (320px <= inline-size < 560px)");
    });

    it("readable class names encode the range", () => {
      const out = css(`component B {
        variants { size { sm { padding: 4px; } lg { padding: 16px; } } }
        defaults { size: sm; }
        responsive { ..lg { size: lg; } sm..lg { size: sm; } }
      }`);
      expect(out).toContain("B_size_lg_bp_to_lg_root_");
      expect(out).toContain("B_size_sm_bp_sm_to_lg_root_");
    });
  });

  describe("typed prop surface (.d.ts)", () => {
    it("exposes range bands as quoted prop keys", () => {
      const { dts } = compileDts(
        `${THEME}\ncomponent B {
          variants { size { sm {} lg {} } }
          defaults { size: sm; }
          responsive { md { size: lg; } sm..lg { size: lg; } }
        }`,
        { filename: "range.arv" },
      );
      // bare breakpoint stays a bare key, range becomes a quoted key
      expect(dts).toContain('md?: "sm" | "lg"');
      expect(dts).toContain('"sm..lg"?: "sm" | "lg"');
    });
  });

  describe("parsing", () => {
    it("accepts all four head forms", () => {
      expect(
        codes(`${THEME}\ncomponent B {
          variants { size { sm {} lg {} } }
          defaults { size: sm; }
          responsive { md {} md.. {} ..lg {} sm..lg {} }
        }`).filter((c) => c !== "ARV140"),
      ).toEqual([]);
    });

    it("rejects a bare `..` with no endpoint", () => {
      expect(
        codes(`${THEME}\ncomponent B {
          variants { size { sm {} lg {} } }
          defaults { size: sm; }
          responsive { .. { size: lg; } }
        }`),
      ).toContain("ARV010");
    });
  });

  describe("checker diagnostics", () => {
    it("flags an unknown endpoint with a did-you-mean fix", () => {
      const d = compile(
        `${THEME}\ncomponent B {
          variants { size { sm {} lg {} } }
          defaults { size: sm; }
          responsive { sm..lgg { size: lg; } }
        }`,
        { filename: "range.arv" },
      ).diagnostics.find((x) => x.code === "ARV141");
      expect(d).toBeDefined();
      expect(d!.hint).toContain("lg");
    });

    it("flags an inverted same-unit range", () => {
      expect(
        codes(`${THEME}\ncomponent B {
          variants { size { sm {} lg {} } }
          defaults { size: sm; }
          responsive { lg..sm { size: lg; } }
        }`),
      ).toContain("ARV145");
    });

    it("treats `md` and `md..` as duplicates", () => {
      expect(
        codes(`${THEME}\ncomponent B {
          variants { size { sm {} lg {} } }
          defaults { size: sm; }
          responsive { md { size: lg; } md.. { size: sm; } }
        }`),
      ).toContain("ARV140");
    });
  });

  describe("formatter", () => {
    it("round-trips range heads unchanged", () => {
      const source = `${THEME}\ncomponent B {
  variants { size { sm {} lg {} } }
  defaults { size: sm; }
  responsive {
    ..lg { size: lg; }
    sm..lg { size: sm; }
  }
}
`;
      // idempotent: formatting twice equals formatting once, and `..` survives.
      const once = formatArv(source);
      expect(once).toContain("..lg");
      expect(once).toContain("sm..lg");
      expect(formatArv(once)).toBe(once);
    });
  });
});
