import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "public/sw.js",
    // macOS AppleDouble-resource-fork bestanden (komen voor op ExFAT-volumes)
    "**/._*",
  ]),
  {
    rules: {
      // React 19's purity-rule is overly strict op decoratieve animaties die met
      // Math.random binnen useMemo eenmalig stabiele variatie genereren. We willen
      // dat patroon expliciet behouden — de waardes worden niet hergebruikt en de
      // randomness is intentioneel decoratief.
      "react-hooks/purity": "off",

      // any blijft een waarschuwing, maar geen error.
      "@typescript-eslint/no-explicit-any": "warn",

      // Ongebruikte vars worden warnings; vars die opzettelijk met _ beginnen
      // worden volledig genegeerd.
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],

      // Hoisting-binnen-component is een legitiem patroon (functie X wordt eerst
      // gebruikt door Y dat hierboven gedeclareerd staat); blok als waarschuwing.
      "no-use-before-define": "off",

      // Function declaraties binnen een render-component zijn een normaal React-patroon
      // wanneer ze sluiten over props/state. We accepteren dit en gebruiken
      // useCallback waar her-rendering performance-impact heeft.
      "react-hooks/immutability": "off",
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);

export default eslintConfig;
