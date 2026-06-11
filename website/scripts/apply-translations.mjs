#!/usr/bin/env node
/**
 * Applies human translations to fbtee translation JSON files by English source text.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const LOCALE_MAP = {
  fr_FR: {
    "See what you ship": "Voyez ce que vous livrez",
    "Edit the": "Modifiez le",
    "or switch to": "ou passez à",
    "— the preview, CSS, and TypeScript types compile live in your browser.":
      "— l'aperçu, le CSS et les types TypeScript se compilent en direct dans votre navigateur.",
    Playground: "Terrain de jeu",
    or: "ou",
    "— the preview, CSS, and types compile live in your browser. Load any demo from the select.":
      "— l'aperçu, le CSS et les types se compilent en direct dans votre navigateur. Chargez une démo depuis le menu.",
    "Getting started": "Premiers pas",
    Introduction: "Introduction",
    Installation: "Installation",
    "Quick start": "Démarrage rapide",
    Language: "Langage",
    "Theme & tokens": "Thème et tokens",
    "Theme modes": "Modes de thème",
    "Global styles": "Styles globaux",
    Recipes: "Recettes",
    Styles: "Styles",
    Components: "Composants",
    Slots: "Slots",
    "Local tokens": "Tokens locaux",
    "Variants & defaults": "Variantes et valeurs par défaut",
    "Compound variants": "Variantes composées",
    States: "États",
    Responsive: "Responsive",
    "Container queries": "Requêtes conteneur",
    Keyframes: "Images clés",
    "Token docs": "Documentation des tokens",
    Tooling: "Outils",
    Packages: "Paquets",
    "Vite plugin": "Plugin Vite",
    CLI: "CLI",
    "Language server": "Serveur de langage",
    Storybook: "Storybook",
    Copied: "Copié",
    "Copy code": "Copier le code",
    Copy: "Copier",
    Docs: "Docs",
    Light: "Clair",
    Dark: "Sombre",
    "Switch to light mode": "Passer en mode clair",
    "Switch to dark mode": "Passer en mode sombre",
    "zero runtime · fully typed": "zéro runtime · entièrement typé",
    "Design systems deserve": "Les design systems méritent",
    "their own language.": "leur propre langage.",
    "Extend familiar CSS with first-class tokens, themes, variants, slots, and components.":
      "Étendez le CSS familier avec des tokens, thèmes, variantes, slots et composants de première classe.",
    "Compile to optimized CSS, generated types, and typed component APIs — zero runtime overhead.":
      "Compilez en CSS optimisé, types générés et API de composants typées — zéro surcoût à l'exécution.",
    "Get started": "Commencer",
    "Try playground": "Essayer le playground",
    "Supported frameworks:": "Frameworks pris en charge :",
    "Zero runtime CSS": "CSS sans runtime",
    "Styles compile at build time. No style recalculation in the browser.":
      "Les styles se compilent à la build. Aucun recalcul de style dans le navigateur.",
    "Typed variants": "Variantes typées",
    "Autocomplete for every variant prop. Catch invalid combinations early.":
      "Autocomplétion pour chaque prop de variante. Détectez les combinaisons invalides tôt.",
    "Design tokens": "Tokens de design",
    "Themes, modes, breakpoints, and container tokens — all first-class.":
      "Thèmes, modes, breakpoints et tokens conteneur — tous de première classe.",
    "Slots & recipes": "Slots et recettes",
    "Multi-part components and reusable style fragments with use.":
      "Composants multi-parties et fragments de style réutilisables avec use.",
    "Responsive & containers": "Responsive et conteneurs",
    "Breakpoint and container-query variants with object props.":
      "Variantes par breakpoint et requête conteneur avec props objet.",
    "Full toolchain": "Chaîne d'outils complète",
    "Vite plugin, LSP, Storybook generator, and token documentation.":
      "Plugin Vite, LSP, générateur Storybook et documentation des tokens.",
  },
  es_ES: {
    "See what you ship": "Mira lo que entregas",
    "Edit the": "Edita el",
    "or switch to": "o cambia a",
    "— the preview, CSS, and TypeScript types compile live in your browser.":
      "— la vista previa, el CSS y los tipos TypeScript se compilan en vivo en tu navegador.",
    Playground: "Playground",
    or: "o",
    "— the preview, CSS, and types compile live in your browser. Load any demo from the select.":
      "— la vista previa, el CSS y los tipos se compilan en vivo en tu navegador. Carga una demo desde el selector.",
    "Getting started": "Primeros pasos",
    Introduction: "Introducción",
    Installation: "Instalación",
    "Quick start": "Inicio rápido",
    Language: "Lenguaje",
    "Theme & tokens": "Tema y tokens",
    "Theme modes": "Modos de tema",
    "Global styles": "Estilos globales",
    Recipes: "Recetas",
    Styles: "Estilos",
    Components: "Componentes",
    Slots: "Slots",
    "Local tokens": "Tokens locales",
    "Variants & defaults": "Variantes y valores predeterminados",
    "Compound variants": "Variantes compuestas",
    States: "Estados",
    Responsive: "Responsive",
    "Container queries": "Consultas de contenedor",
    Keyframes: "Keyframes",
    "Token docs": "Documentación de tokens",
    Tooling: "Herramientas",
    Packages: "Paquetes",
    "Vite plugin": "Plugin de Vite",
    CLI: "CLI",
    "Language server": "Servidor de lenguaje",
    Storybook: "Storybook",
    Copied: "Copiado",
    "Copy code": "Copiar código",
    Copy: "Copiar",
    Docs: "Docs",
    Light: "Claro",
    Dark: "Oscuro",
    "Switch to light mode": "Cambiar a modo claro",
    "Switch to dark mode": "Cambiar a modo oscuro",
    "zero runtime · fully typed": "cero runtime · totalmente tipado",
    "Design systems deserve": "Los design systems merecen",
    "their own language.": "su propio lenguaje.",
    "Extend familiar CSS with first-class tokens, themes, variants, slots, and components.":
      "Extiende CSS familiar con tokens, temas, variantes, slots y componentes de primera clase.",
    "Compile to optimized CSS, generated types, and typed component APIs — zero runtime overhead.":
      "Compila a CSS optimizado, tipos generados y APIs de componentes tipadas — cero coste en runtime.",
    "Get started": "Empezar",
    "Try playground": "Probar playground",
    "Supported frameworks:": "Frameworks compatibles:",
    "Zero runtime CSS": "CSS sin runtime",
    "Styles compile at build time. No style recalculation in the browser.":
      "Los estilos se compilan en build. Sin recálculo de estilos en el navegador.",
    "Typed variants": "Variantes tipadas",
    "Autocomplete for every variant prop. Catch invalid combinations early.":
      "Autocompletado para cada prop de variante. Detecta combinaciones inválidas pronto.",
    "Design tokens": "Tokens de diseño",
    "Themes, modes, breakpoints, and container tokens — all first-class.":
      "Temas, modos, breakpoints y tokens de contenedor — todos de primera clase.",
    "Slots & recipes": "Slots y recetas",
    "Multi-part components and reusable style fragments with use.":
      "Componentes multiparte y fragmentos de estilo reutilizables con use.",
    "Responsive & containers": "Responsive y contenedores",
    "Breakpoint and container-query variants with object props.":
      "Variantes por breakpoint y container query con props objeto.",
    "Full toolchain": "Toolchain completa",
    "Vite plugin, LSP, Storybook generator, and token documentation.":
      "Plugin Vite, LSP, generador Storybook y documentación de tokens.",
  },
  de_DE: {
    "See what you ship": "Sieh, was du auslieferst",
    "Edit the": "Bearbeite die",
    "or switch to": "oder wechsle zu",
    "— the preview, CSS, and TypeScript types compile live in your browser.":
      "— Vorschau, CSS und TypeScript-Typen werden live im Browser kompiliert.",
    Playground: "Playground",
    or: "oder",
    "— the preview, CSS, and types compile live in your browser. Load any demo from the select.":
      "— Vorschau, CSS und Typen werden live im Browser kompiliert. Lade eine Demo aus der Auswahl.",
    "Getting started": "Erste Schritte",
    Introduction: "Einführung",
    Installation: "Installation",
    "Quick start": "Schnellstart",
    Language: "Sprache",
    "Theme & tokens": "Theme & Tokens",
    "Theme modes": "Theme-Modi",
    "Global styles": "Globale Styles",
    Recipes: "Rezepte",
    Styles: "Styles",
    Components: "Komponenten",
    Slots: "Slots",
    "Local tokens": "Lokale Tokens",
    "Variants & defaults": "Varianten & Defaults",
    "Compound variants": "Zusammengesetzte Varianten",
    States: "Zustände",
    Responsive: "Responsive",
    "Container queries": "Container Queries",
    Keyframes: "Keyframes",
    "Token docs": "Token-Dokumentation",
    Tooling: "Tooling",
    Packages: "Pakete",
    "Vite plugin": "Vite-Plugin",
    CLI: "CLI",
    "Language server": "Language Server",
    Storybook: "Storybook",
    Copied: "Kopiert",
    "Copy code": "Code kopieren",
    Copy: "Kopieren",
    Docs: "Docs",
    Light: "Hell",
    Dark: "Dunkel",
    "Switch to light mode": "Zum hellen Modus wechseln",
    "Switch to dark mode": "Zum dunklen Modus wechseln",
    "zero runtime · fully typed": "Zero Runtime · voll typisiert",
    "Design systems deserve": "Design Systems verdienen",
    "their own language.": "eine eigene Sprache.",
    "Extend familiar CSS with first-class tokens, themes, variants, slots, and components.":
      "Erweitere vertrautes CSS mit erstklassigen Tokens, Themes, Varianten, Slots und Komponenten.",
    "Compile to optimized CSS, generated types, and typed component APIs — zero runtime overhead.":
      "Kompiliere zu optimiertem CSS, generierten Typen und typisierten Komponenten-APIs — ohne Runtime-Overhead.",
    "Get started": "Loslegen",
    "Try playground": "Playground testen",
    "Supported frameworks:": "Unterstützte Frameworks:",
    "Zero runtime CSS": "Zero-Runtime-CSS",
    "Styles compile at build time. No style recalculation in the browser.":
      "Styles werden zur Build-Zeit kompiliert. Keine Neuberechnung im Browser.",
    "Typed variants": "Typisierte Varianten",
    "Autocomplete for every variant prop. Catch invalid combinations early.":
      "Autovervollständigung für jede Varianten-Prop. Ungültige Kombinationen früh erkennen.",
    "Design tokens": "Design Tokens",
    "Themes, modes, breakpoints, and container tokens — all first-class.":
      "Themes, Modi, Breakpoints und Container-Tokens — alles erstklassig.",
    "Slots & recipes": "Slots & Rezepte",
    "Multi-part components and reusable style fragments with use.":
      "Mehrteilige Komponenten und wiederverwendbare Style-Fragmente mit use.",
    "Responsive & containers": "Responsive & Container",
    "Breakpoint and container-query variants with object props.":
      "Breakpoint- und Container-Query-Varianten mit Objekt-Props.",
    "Full toolchain": "Vollständige Toolchain",
    "Vite plugin, LSP, Storybook generator, and token documentation.":
      "Vite-Plugin, LSP, Storybook-Generator und Token-Dokumentation.",
  },
  pt_PT: {
    "See what you ship": "Veja o que entrega",
    "Edit the": "Edite o",
    "or switch to": "ou mude para",
    "— the preview, CSS, and TypeScript types compile live in your browser.":
      "— a pré-visualização, o CSS e os tipos TypeScript compilam ao vivo no seu browser.",
    Playground: "Playground",
    or: "ou",
    "— the preview, CSS, and types compile live in your browser. Load any demo from the select.":
      "— a pré-visualização, o CSS e os tipos compilam ao vivo no browser. Carregue uma demo no selector.",
    "Getting started": "Primeiros passos",
    Introduction: "Introdução",
    Installation: "Instalação",
    "Quick start": "Início rápido",
    Language: "Linguagem",
    "Theme & tokens": "Tema e tokens",
    "Theme modes": "Modos de tema",
    "Global styles": "Estilos globais",
    Recipes: "Receitas",
    Styles: "Estilos",
    Components: "Componentes",
    Slots: "Slots",
    "Local tokens": "Tokens locais",
    "Variants & defaults": "Variantes e predefinições",
    "Compound variants": "Variantes compostas",
    States: "Estados",
    Responsive: "Responsive",
    "Container queries": "Container queries",
    Keyframes: "Keyframes",
    "Token docs": "Documentação de tokens",
    Tooling: "Ferramentas",
    Packages: "Pacotes",
    "Vite plugin": "Plugin Vite",
    CLI: "CLI",
    "Language server": "Servidor de linguagem",
    Storybook: "Storybook",
    Copied: "Copiado",
    "Copy code": "Copiar código",
    Copy: "Copiar",
    Docs: "Docs",
    Light: "Claro",
    Dark: "Escuro",
    "Switch to light mode": "Mudar para modo claro",
    "Switch to dark mode": "Mudar para modo escuro",
    "zero runtime · fully typed": "zero runtime · totalmente tipado",
    "Design systems deserve": "Design systems merecem",
    "their own language.": "a sua própria linguagem.",
    "Extend familiar CSS with first-class tokens, themes, variants, slots, and components.":
      "Estenda CSS familiar com tokens, temas, variantes, slots e componentes de primeira classe.",
    "Compile to optimized CSS, generated types, and typed component APIs — zero runtime overhead.":
      "Compile para CSS otimizado, tipos gerados e APIs de componentes tipadas — zero overhead em runtime.",
    "Get started": "Começar",
    "Try playground": "Experimentar playground",
    "Supported frameworks:": "Frameworks suportados:",
    "Zero runtime CSS": "CSS sem runtime",
    "Styles compile at build time. No style recalculation in the browser.":
      "Os estilos compilam em build. Sem recálculo de estilos no browser.",
    "Typed variants": "Variantes tipadas",
    "Autocomplete for every variant prop. Catch invalid combinations early.":
      "Autocompletar para cada prop de variante. Detete combinações inválidas cedo.",
    "Design tokens": "Tokens de design",
    "Themes, modes, breakpoints, and container tokens — all first-class.":
      "Temas, modos, breakpoints e tokens de contentor — todos de primeira classe.",
    "Slots & recipes": "Slots e receitas",
    "Multi-part components and reusable style fragments with use.":
      "Componentes multi-parte e fragmentos de estilo reutilizáveis com use.",
    "Responsive & containers": "Responsive e contentores",
    "Breakpoint and container-query variants with object props.":
      "Variantes por breakpoint e container query com props objeto.",
    "Full toolchain": "Toolchain completa",
    "Vite plugin, LSP, Storybook generator, and token documentation.":
      "Plugin Vite, LSP, gerador Storybook e documentação de tokens.",
  },
};

for (const [locale, map] of Object.entries(LOCALE_MAP)) {
  const file = path.join(root, "translations", `${locale}.json`);
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  for (const entry of Object.values(data.translations)) {
    const english = entry.translations[0].translation;
    if (map[english]) {
      entry.translations[0].translation = map[english];
      entry.status = "translated";
    }
  }
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
  console.log("Updated", locale);
}
