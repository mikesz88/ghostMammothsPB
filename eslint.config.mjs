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
      "jsx-a11y/alt-text": "error",
      "jsx-a11y/anchor-is-valid": "error",
      "jsx-a11y/aria-props": "error",
      "jsx-a11y/aria-role": "error",
      "jsx-a11y/heading-has-content": "error",
      "jsx-a11y/label-has-associated-control": "error",
      "jsx-a11y/no-autofocus": "error",
      "jsx-a11y/interactive-supports-focus": "error",
      "jsx-a11y/click-events-have-key-events": "error",

      /*
       * Imports / cleanup
       */
      "unused-imports/no-unused-imports": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "import/no-cycle": "error",
      "import/no-duplicates": "error",
      "import/first": "error",
      "import/newline-after-import": "error",
      "import/order": [
        "error",
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
      "no-console": ["error", { allow: ["warn", "error"] }],
      "no-nested-ternary": "error",
      "max-depth": ["error", 3],
      "max-params": ["error", 4],
      complexity: ["error", 10],
      "max-lines": [
        "error",
        {
          max: 200,
          skipBlankLines: true,
          skipComments: true,
        },
      ],
      "max-lines-per-function": [
        "error",
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
        "error",
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
        "error",
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
        "error",
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
        "error",
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
   * Email: HTML templates (large literals) and Resend transport (retry / error probe helpers).
   * Line/complexity budgets are noise compared to splitting those for style only.
   */
  {
    files: ["lib/email/templates/**/*.ts", "lib/email/resend.ts"],
    rules: {
      "max-lines": "off",
      "max-lines-per-function": "off",
      complexity: "off",
      "max-depth": "off",
      "no-nested-ternary": "off",
    },
  },

  /*
   * Stripe webhooks: handler modules mirror Stripe payloads; console used for operational tracing.
   */
  {
    files: ["lib/stripe/webhooks/**/*.ts"],
    rules: {
      "max-lines": "off",
      "max-lines-per-function": "off",
      "max-params": "off",
      complexity: "off",
      "max-depth": "off",
      "no-console": "off",
    },
  },

  /*
   * Queue algorithm: parameters match existing court/queue call sites; splitting only for signatures hurts clarity.
   */
  {
    files: ["lib/queue/algorithm/**/*.ts", "lib/queue-manager.ts"],
    rules: {
      "max-lines": "off",
      "max-lines-per-function": "off",
      "max-params": "off",
      complexity: "off",
    },
  },

  /*
   * Site header: nav markup and user menu are inherently lengthy; splitting further hurts scanability.
   */
  {
    files: ["components/marketing/**/*.{ts,tsx}"],
    rules: {
      "max-lines": "off",
      "max-lines-per-function": "off",
      complexity: "off",
    },
  },

  {
    files: ["components/events/events-page-client.tsx"],
    rules: {
      "max-lines": "off",
      "max-lines-per-function": "off",
      complexity: "off",
      "no-nested-ternary": "off",
    },
  },

  {
    files: ["lib/hooks/use-realtime-events.ts"],
    rules: {
      "max-lines-per-function": "off",
    },
  },

  {
    files: ["components/ui/header/**/*.{ts,tsx}"],
    rules: {
      "max-lines": "off",
      "max-lines-per-function": "off",
      complexity: "off",
      "no-nested-ternary": "off",
    },
  },

  {
    files: ["app/layout.tsx"],
    rules: {
      "max-lines-per-function": "off",
    },
  },

  /*
   * Procedural HTTP handlers, OAuth callback, admin/test actions, marketing FAQ/calendar
   * pages, Stripe/Supabase integration glue, and large queue/event UI. Size/complexity
   * rules are relaxed until targeted refactors (see docs/engineering/refactor-inventory.md).
   */
  {
    files: [
      "app/api/**/*.ts",
      "app/auth/**/*.ts",
      "app/actions/test-helpers.ts",
      "app/actions/admin-users.ts",
      "app/actions/user-profile.ts",
      "app/admin/faq/page.tsx",
      "app/faq/page.tsx",
      "app/calendar/page.tsx",
      "app/sitemap/page.tsx",
      "lib/stripe/server.ts",
      "lib/supabase/middleware.ts",
      "lib/admin-queue.ts",
      "lib/admin-middleware.ts",
      "lib/membership-helpers.ts",
      "lib/membership/get-user-membership.ts",
      "lib/membership/verify-paid-membership-checkout-persist.ts",
      "lib/use-notifications.ts",
      "components/queue-list.tsx",
      "components/join-queue-dialog.tsx",
      "components/court-status.tsx",
      "components/create-event-dialog.tsx",
      "components/edit-event-dialog.tsx",
      "components/notification-prompt.tsx",
      "components/queue-position-alert.tsx",
      "components/ui/footer.tsx",
      "components/ui/select.tsx",
      "components/search/**/*.tsx",
    ],
    rules: {
      "max-lines": "off",
      "max-lines-per-function": "off",
      complexity: "off",
      "max-params": "off",
      "max-depth": "off",
      "no-nested-ternary": "off",
    },
  },

  {
    files: ["app/api/webhooks/stripe/route.ts"],
    rules: {
      "max-lines-per-function": "off",
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
      "max-depth": "off",
    },
  },

  /*

* Supabase schema script: allow console and a longer file for setup/bootstrap work.
* Keep this override narrow so it does not relax standards elsewhere.
  */
  {
    files: ["supabase/supa-schema.ts"],
    rules: {
      "no-console": "off",
      "max-lines": "off",
      complexity: "off",
      "max-lines-per-function": "off",
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
