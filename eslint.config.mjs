import { fileURLToPath } from "node:url";
import path from "node:path";
import nextConfig from "eslint-config-next";
import prettierConfig from "eslint-config-prettier";
import tailwindPlugin from "eslint-plugin-tailwindcss";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default [
  ...nextConfig,
  ...tailwindPlugin.configs["flat/recommended"],
  prettierConfig,
  {
    settings: {
      tailwindcss: {
        config: path.join(__dirname, "tailwind.config.ts"),
        callees: ["cn", "cva"],
      },
    },
    rules: {
      "no-undef": "off",
      "tailwindcss/no-custom-classname": "off",
      "tailwindcss/classnames-order": "off",
      // New in eslint-plugin-react-hooks v7; downgrade to warn because the
      // existing codebase has legitimate patterns (e.g. syncing derived state
      // from a controlled prop) that this rule flags as errors.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.mts", "**/*.cts"],
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "dist/**",
      "node_modules/**",
      "next-env.d.ts",
      "__tests__/**",
    ],
  },
];
