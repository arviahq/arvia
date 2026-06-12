import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

export type TocEntry = { id: string; text: string; level: 2 | 3 };

type DocHeadingContextValue = {
  entries: TocEntry[];
  register: (entry: TocEntry) => () => void;
};

const DocHeadingContext = createContext<DocHeadingContextValue | null>(null);

export function DocHeadingProvider(props: { children: ReactNode }) {
  const [entries, setEntries] = useState<TocEntry[]>([]);

  const register = useCallback((entry: TocEntry) => {
    setEntries((prev) => {
      if (prev.some((item) => item.id === entry.id)) return prev;
      return [...prev, entry];
    });
    return () => {
      setEntries((prev) => prev.filter((item) => item.id !== entry.id));
    };
  }, []);

  const value = useMemo(() => ({ entries, register }), [entries, register]);

  return <DocHeadingContext.Provider value={value}>{props.children}</DocHeadingContext.Provider>;
}

export function useDocHeadings(): TocEntry[] {
  const context = useContext(DocHeadingContext);
  return context?.entries ?? [];
}

export function useRegisterDocHeading(): DocHeadingContextValue["register"] {
  const context = useContext(DocHeadingContext);
  if (!context) {
    throw new Error("Doc headings must be used within DocHeadingProvider");
  }
  return context.register;
}
