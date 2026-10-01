import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...coreWebVitals,
  ...typescript,
  {
    rules: {
      // API payloads still contain untyped fields across the existing app.
      // Keep strict TypeScript checks while those contracts are migrated.
      "@typescript-eslint/no-explicit-any": "off",
      // Several existing components hydrate local preferences in effects.
      "react-hooks/set-state-in-effect": "off",
    },
  },
];

export default eslintConfig;
