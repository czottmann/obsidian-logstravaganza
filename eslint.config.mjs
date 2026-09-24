import tsParser from "@typescript-eslint/parser";
import obsidianmd from "eslint-plugin-obsidianmd";

export default [
  {
    ignores: ["main.js", "esbuild.config.mjs", "eslint.config.mjs", "node_modules/**"],
  },
  ...obsidianmd.configs.recommended,
  {
    files: ["src/**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: { project: "./tsconfig.json" },
    },
  },
  {
    files: ["src/settings.ts"],
    rules: {
      // Obsidian 1.8.0 does not support declarative setting definitions.
      "obsidianmd/settings-tab/prefer-setting-definitions": "off",
    },
  },
];
