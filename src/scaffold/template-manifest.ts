/**
 * Explicit manifest of all template files.
 * This ensures JSR includes these files in the published package.
 * @module
 */

export const TEMPLATE_FILES = [
  "src/scaffold/templates/AGENTS.md.ts",
  "src/scaffold/templates/CHANGELOG.md.ts",
  "src/scaffold/templates/CONTRIBUTING.md.ts",
  "src/scaffold/templates/CONVENTIONAL_COMMITS.md.ts",
  "src/scaffold/templates/LICENSE.md.ts",
  "src/scaffold/templates/README.md.ts",
  "src/scaffold/templates/SECURITY.md.ts",
  "src/scaffold/templates/benchmarks/config.bench.ts.ts",
  "src/scaffold/templates/deno-jsonc.ts",
  "src/scaffold/templates/examples/basic.ts.ts",
  "src/scaffold/templates/gitattributes.ts",
  "src/scaffold/templates/gitignore.ts",
  "src/scaffold/templates/opencode.json.ts",
  "src/scaffold/templates/src/core/config.ts.ts",
  "src/scaffold/templates/src/mod.ts.ts",
  "src/scaffold/templates/tests/core/config.test.ts.ts",
  "src/scaffold/templates/.devcontainer/Dockerfile.ts",
  "src/scaffold/templates/.devcontainer/devcontainer.json.ts",
  "src/scaffold/templates/.github/CODEOWNERS.ts",
  "src/scaffold/templates/.github/dependabot.yml.ts",
  "src/scaffold/templates/.github/workflows/ci.yml.ts",
  "src/scaffold/templates/.opencode/plugins/deno-guards.ts.ts",
  "src/scaffold/templates/.vscode/extensions.json.ts",
  "src/scaffold/templates/.vscode/settings.json.ts",
] as const;

export type TemplateFile = (typeof TEMPLATE_FILES)[number];
