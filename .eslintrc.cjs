/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: [
    "@remix-run/eslint-config",
    "@remix-run/eslint-config/node",
    "prettier",
    "plugin:no-template-curly-in-string-fix/recommended",
    "plugin:perfectionist/recommended-natural-legacy"
  ],
  plugins: ["perfectionist"],
  rules: {
    "@typescript-eslint/consistent-type-imports": [
      "warn",
      {
        disallowTypeAnnotations: true,
        fixStyle: "inline-type-imports",
        prefer: "type-imports"
      }
    ],
    "import/no-duplicates": "warn"
  }
};
