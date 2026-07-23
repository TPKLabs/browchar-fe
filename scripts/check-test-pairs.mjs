#!/usr/bin/env node
/**
 * Pre-commit gate: every newly added source file under src/app, src/components,
 * src/hooks, src/types, src/api, src/schemas, src/mocks or src/utils must ship
 * with a sibling test file in the same commit.
 *
 * Invoked by lint-staged with the staged file paths as argv. Filters those
 * down to files git reports as "added" (renames/edits are exempt) and
 * excludes vendor/type-only files that have nothing to unit test.
 */
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

const repoRoot = execSync("git rev-parse --show-toplevel", {
  encoding: "utf8",
}).trim();

const candidates = process.argv
  .slice(2)
  .map((file) => path.relative(repoRoot, file).split(path.sep).join("/"));
if (candidates.length === 0) process.exit(0);

const addedFiles = new Set(
  execSync("git diff --cached --diff-filter=A --name-only", {
    encoding: "utf8",
  })
    .split("\n")
    .filter(Boolean),
);

const EXEMPT_PATTERNS = [
  /\.test\.tsx?$/,
  /\.spec\.tsx?$/,
  /\.d\.ts$/,
  /\.types\.ts$/,
  /(^|\/)index\.tsx?$/,
  /(^|\/)components\/ui\//, // shadcn/ui vendor primitives
  // src/mocks/** (DEV-200): infraestructura de testing MSW (handlers/server),
  // no lógica de app — la ejercita cada test que la usa vía server.use(...).
  // Mismo criterio que *.module.ts en la API.
  /^src\/mocks\//,
];

function isExempt(file) {
  return EXEMPT_PATTERNS.some((pattern) => pattern.test(file));
}

function hasTestSibling(file) {
  const dir = path.dirname(file);
  const ext = path.extname(file);
  const base = path.basename(file, ext);
  return (
    existsSync(path.join(dir, `${base}.test${ext}`)) ||
    existsSync(path.join(dir, `${base}.spec${ext}`)) ||
    existsSync(path.join(dir, "__tests__", `${base}.test${ext}`))
  );
}

const missing = candidates.filter(
  (file) =>
    addedFiles.has(file) &&
    /^src\/(app|components|hooks|types|api|schemas|mocks|utils)\//.test(file) &&
    !isExempt(file) &&
    !hasTestSibling(file),
);

if (missing.length > 0) {
  console.error("\nFalta un test para estos archivos nuevos:\n");
  for (const file of missing) {
    const ext = path.extname(file);
    console.error(`  ${file} -> ${file.slice(0, -ext.length)}.test${ext}`);
  }
  console.error(
    "\nAgregá el archivo de test junto al código, o si es un caso sin lógica " +
      "propia para testear, marcalo excluido en scripts/check-test-pairs.mjs.\n",
  );
  process.exit(1);
}
