import nextConfig from "eslint-config-next/core-web-vitals";
import importPlugin from "eslint-plugin-import";
import unusedImports from "eslint-plugin-unused-imports";
import tseslint from "typescript-eslint";

const eslintConfig = [
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "dist/**",
      "coverage/**",
      "next-env.d.ts",
      "supabase/supa-schema.ts",
    ],
  },

  ...nextConfig,

  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },

  {
    plugins: {
      "unused-imports": unusedImports,
      import: importPlugin,
    },

    settings: {
      "import/resolver": {
        typescript: true,
      },
    },

    rules: {
      /*
       * Phase 1: low-friction cleanup rules
       */
      "unused-imports/no-unused-imports": "error",
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
       * Phase 1: readability / complexity rules
       */
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-nested-ternary": "warn",
      "max-depth": ["warn", 4],
      "max-params": ["warn", 5],
      complexity: ["warn", 12],
      "max-lines": [
        "warn",
        {
          max: 250,
          skipBlankLines: true,
          skipComments: true,
        },
      ],

      "import/no-cycle": "warn",
    },
  },

  {
    files: ["app/**/page.{ts,tsx}", "src/app/**/page.{ts,tsx}"],
    rules: {
      "no-restricted-syntax": [
        "warn",
        {
          selector:
            'Program > ExpressionStatement > Literal[value="use client"]',
          message:
            "page.tsx should remain a Server Component by default. Extract interactivity into a smaller client component when possible.",
        },
      ],
    },
  },

  {
    files: ["components/**/*.{ts,tsx}", "src/components/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "warn",
        {
          patterns: [
            {
              group: ["@/server/*", "@/src/server/*"],
              message:
                "Components should not import server-only modules. Move that logic behind a service or server boundary.",
            },
          ],
        },
      ],
    },
  },

  {
    files: ["hooks/**/*.{ts,tsx}", "src/hooks/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "warn",
        {
          patterns: [
            {
              group: ["@/server/*", "@/src/server/*"],
              message:
                "Hooks should not import server-only modules. Keep hooks focused on client behavior.",
            },
          ],
        },
      ],
    },
  },
];

export default eslintConfig;
