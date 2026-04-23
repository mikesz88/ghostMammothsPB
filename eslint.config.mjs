import tseslint from "@typescript-eslint/eslint-plugin";
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import boundaries from "eslint-plugin-boundaries";
import importPlugin from "eslint-plugin-import";
import unusedImports from "eslint-plugin-unused-imports";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      "unused-imports": unusedImports,
      import: importPlugin,
      boundaries,
      "@typescript-eslint": tseslint,
    },
    settings: {
      "boundaries/elements": [
        { type: "app", pattern: "app/**" },
        { type: "components", pattern: "components/**" },
        { type: "hooks", pattern: "hooks/**" },
        { type: "lib", pattern: "lib/**" },
        { type: "server", pattern: "server/**" },
      ],
      "import/resolver": {
        typescript: true,
        node: true,
      },
    },
    rules: {
      /*
       * Accessibility
       * Keep the stronger marketing-site-friendly rules.
       */
      "jsx-a11y/alt-text": "warn",
      "jsx-a11y/anchor-is-valid": "warn",
      "jsx-a11y/aria-props": "warn",
      "jsx-a11y/aria-role": "warn",
      "jsx-a11y/heading-has-content": "warn",
      "jsx-a11y/label-has-associated-control": "warn",
      "jsx-a11y/no-autofocus": "warn",
      "jsx-a11y/interactive-supports-focus": "warn",
      "jsx-a11y/click-events-have-key-events": "warn",

      /*
       * Imports / cleanup
       */
      "unused-imports/no-unused-imports": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "import/no-cycle": "warn",
      "import/no-duplicates": "warn",
      "import/first": "warn",
      "import/newline-after-import": "warn",
      "import/order": [
        "warn",
        {
          groups: [
            ["builtin", "external"],
            ["internal"],
            ["parent", "sibling", "index"],
            ["type"],
          ],
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],

      /*
       * Readability / maintainability
       */
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-nested-ternary": "warn",
      "max-depth": ["warn", 3],
      "max-params": ["warn", 4],
      complexity: ["warn", 10],
      "max-lines": [
        "warn",
        {
          // max: 250,
          max: 200,
          skipBlankLines: true,
          skipComments: true,
        },
      ],
      "max-lines-per-function": [
        "warn",
        {
          max: 25,
          skipBlankLines: true,
          skipComments: true,
          IIFEs: true,
        },
      ],

      /*
       * Architecture boundaries (eslint-plugin-boundaries v6: use dependencies, not element-types)
       */
      "boundaries/dependencies": [
        "warn",
        {
          default: "allow",
          rules: [
            {
              from: { type: "components" },
              disallow: { to: { type: "server" } },
              message: "Components must not import server-only code.",
            },
            {
              from: { type: "hooks" },
              disallow: { to: { type: "server" } },
              message: "Hooks must not import server-only code.",
            },
            {
              from: { type: "server" },
              allow: { to: { type: ["server", "lib"] } },
            },
          ],
        },
      ],
    },
  },

  /*
   * page.tsx must stay server-first
   */
  {
    files: ["app/**/page.tsx"],
    rules: {
      "no-restricted-syntax": [
        "warn",
        {
          selector:
            'Program > ExpressionStatement > Literal[value="use client"]',
          message:
            "page.tsx must remain a Server Component. Move interactivity into smaller client components.",
        },
      ],
    },
  },

  /*
   * Block server imports in UI
   */
  {
    files: ["components/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "warn",
        {
          patterns: [
            {
              group: ["@/server/*"],
              message: "Components must not import server-only modules.",
            },
          ],
        },
      ],
    },
  },

  {
    files: ["hooks/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "warn",
        {
          patterns: [
            {
              group: ["@/server/*"],
              message: "Hooks must not import server-only modules.",
            },
          ],
        },
      ],
    },
  },

  /*
   * Scripts: allow logging; no line-budget enforcement in tooling.
   */
  {
    files: ["script/**/*.mjs", "scripts/**/*.mjs", "scripts/**/*.ts"],
    rules: {
      "no-console": "off",
      "max-lines": "off",
      // "max-lines-per-function": "off",
      // complexity: "off",
      // "max-depth": "off",
      // "max-params": "off",
      // "no-nested-ternary": "off",
    },
  },

  /*

/*

* Tests: allow console, larger files/functions, and more branching where useful.
* These exceptions apply only to test code.
  */
  {
    files: [
      "tests/**/*.{ts,tsx}",
      "**/**tests**/**/*.{ts,tsx}",
      "**/*.{test,spec}.{ts,tsx}",
      "e2e/**/*.{ts,tsx}",
    ],
    rules: {
      "no-console": "off",
      "max-lines": "off",
      "max-lines-per-function": "off",
      "no-nested-ternary": "off",
      complexity: "off",
      "max-params": "off",
    },
  },

  /*

* Prisma seed script: allow console and a longer file for setup/bootstrap work.
* Keep this override narrow so it does not relax standards elsewhere.
  */
  {
    files: ["prisma/seed.ts"],
    rules: {
      "no-console": "off",
      "max-lines": "off",
      complexity: "off",
    },
  },

  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "dist/**",
    "coverage/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
