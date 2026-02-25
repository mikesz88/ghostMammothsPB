import nextConfig from "eslint-config-next/core-web-vitals";
import jsxA11y from "eslint-plugin-jsx-a11y";

const eslintConfig = [
  {
    ignores: ["node_modules/**", ".next/**", "out/**", "build/**", "next-env.d.ts"],
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
