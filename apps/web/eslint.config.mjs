import next from "eslint-config-next";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = [
  ...next,
  ...nextVitals,
  ...nextTs,
  {
    ignores: [
      "android/**",
      "ios/**",
    ],
  },
];

export default eslintConfig;
