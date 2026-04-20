import nextConfig from "eslint-config-next/core-web-vitals";
import jsxA11y from "eslint-plugin-jsx-a11y";

const eslintConfig = [
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  ...nextConfig,
  // Strict a11y: catch things devs might forget (labels, roles, no nested interactive, etc.)
  { rules: jsxA11y.configs.strict.rules },
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
];

export default eslintConfig;

// import nextConfig from "eslint-config-next/core-web-vitals";
// import jsxA11y from "eslint-plugin-jsx-a11y";
// import unusedImports from "eslint-plugin-unused-imports";
// import importPlugin from "eslint-plugin-import";

// const eslintConfig = [
//   {
//     ignores: [
//       "node_modules/**",
//       ".next/**",
//       "out/**",
//       "build/**",
//       "dist/**",
//       "coverage/**",
//       "next-env.d.ts",
//     ],
//   },

//   ...nextConfig,

//   {
//     plugins: {
//       "jsx-a11y": jsxA11y,
//       "unused-imports": unusedImports,
//       import: importPlugin,
//     },
//     settings: {
//       "import/resolver": {
//         typescript: true,
//       },
//     },
//     rules: {
//       ...jsxA11y.configs.strict.rules,

//       /*
//        * Phase 1: low-friction cleanup rules
//        * Safe to enforce now without causing architecture churn
//        */
//       "unused-imports/no-unused-imports": "error",
//       "import/no-duplicates": "warn",
//       "import/first": "warn",
//       "import/newline-after-import": "warn",
//       "import/order": [
//         "warn",
//         {
//           groups: [
//             ["builtin", "external"],
//             ["internal"],
//             ["parent", "sibling", "index"],
//             ["type"],
//           ],
//           "newlines-between": "always",
//           alphabetize: {
//             order: "asc",
//             caseInsensitive: true,
//           },
//         },
//       ],

//       /*
//        * Phase 1: readability / complexity rules
//        * Warnings only for now so the current codebase can breathe
//        */
//       "no-console": ["warn", { allow: ["warn", "error"] }],
//       "no-nested-ternary": "warn",
//       "max-depth": ["warn", 4],
//       "max-params": ["warn", 5],
//       complexity: ["warn", 12],
//       "max-lines": [
//         "warn",
//         {
//           max: 250,
//           skipBlankLines: true,
//           skipComments: true,
//         },
//       ],

//       /*
//        * Keep TypeScript from double-reporting unused vars
//        * since unused-imports handles the imports cleanly
//        */
//       "@typescript-eslint/no-unused-vars": [
//         "warn",
//         {
//           argsIgnorePattern: "^_",
//           varsIgnorePattern: "^_",
//           caughtErrorsIgnorePattern: "^_",
//         },
//       ],

//       /*
//        * Cycles are bad, but messy repos often have some.
//        * Start as warn so you can chip away at them.
//        */
//       "import/no-cycle": "warn",
//     },
//   },

//   /* Phase 1 route/page nudges: warn, don't fail, when page.tsx becomes a client component */
//   {
//     files: ["app/**/page.{ts,tsx}", "src/app/**/page.{ts,tsx}"],
//     rules: {
//       "no-restricted-syntax": [
//         "warn",
//         {
//           selector:
//             'Program > ExpressionStatement > Literal[value="use client"]',
//           message:
//             "page.tsx should remain a Server Component by default. Extract interactivity into a smaller client component when possible.",
//         },
//       ],
//     },
//   },

//   /* Phase 1: warn if components import server-only modules */
//   {
//     files: ["components/**/*.{ts,tsx}", "src/components/**/*.{ts,tsx}"],
//     rules: {
//       "no-restricted-imports": [
//         "warn",
//         {
//           patterns: [
//             {
//               group: ["@/server/*", "@/src/server/*"],
//               message:
//                 "Components should not import server-only modules. Move that logic behind a service or server boundary.",
//             },
//           ],
//         },
//       ],
//     },
//   },

//   /* Phase 1: warn if hooks import server-only modules */
//   {
//     files: ["hooks/**/*.{ts,tsx}", "src/hooks/**/*.{ts,tsx}"],
//     rules: {
//       "no-restricted-imports": [
//         "warn",
//         {
//           patterns: [
//             {
//               group: ["@/server/*", "@/src/server/*"],
//               message:
//                 "Hooks should not import server-only modules. Keep hooks focused on client behavior.",
//             },
//           ],
//         },
//       ],
//     },
//   },
// ];

// export default eslintConfig;
