const config = {
  "src/**/*.{ts,tsx}": [
    "eslint --fix",
    "node scripts/check-test-pairs.mjs",
    "prettier --write",
  ],
  "*.{js,jsx,mjs,cjs,json,css,md}": ["prettier --write"],
};

export default config;
