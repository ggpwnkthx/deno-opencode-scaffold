/**
 * Statically imported templates registry.
 * Each template file is imported here to ensure JSR includes it in the package.
 * @module
 */

import type { RenderedFile, TemplateContext } from "@scaffold/types";

type FeatureFlag = "config";

interface TemplateModule {
  metadata: { outputPath: string; conditional?: FeatureFlag };
  default: (context: TemplateContext) => string;
}

import * as AGENTS from "./templates/AGENTS.md.ts";
import * as CHANGELOG from "./templates/CHANGELOG.md.ts";
import * as CONTRIBUTING from "./templates/CONTRIBUTING.md.ts";
import * as CONVENTIONAL_COMMITS from "./templates/CONVENTIONAL_COMMITS.md.ts";
import * as LICENSE from "./templates/LICENSE.md.ts";
import * as README from "./templates/README.md.ts";
import * as SECURITY from "./templates/SECURITY.md.ts";
import * as BENCH_CONFIG from "./templates/benchmarks/config.bench.ts.ts";
import * as DENO_JSONC from "./templates/deno.jsonc.ts";
import * as EXAMPLES_BASIC from "./templates/examples/basic.ts.ts";
import * as GITATTRIBUTES from "./templates/gitattributes.ts";
import * as GITIGNORE from "./templates/gitignore.ts";
import * as OPENCODE_JSON from "./templates/.opencode/settings.json.ts";
import * as SRC_CORE_CONFIG from "./templates/src/core/config.ts.ts";
import * as SRC_MOD from "./templates/src/mod.ts.ts";
import * as TESTS_CORE_CONFIG from "./templates/tests/core/config.test.ts.ts";
import * as DEVCONTAINER_DOCKERFILE from "./templates/.devcontainer/Dockerfile.ts";
import * as DEVCONTAINER_DEVCONTAINER_JSON from "./templates/.devcontainer/devcontainer.json.ts";
import * as GITHUB_CODEOWNERS from "./templates/.github/CODEOWNERS.ts";
import * as GITHUB_DEPENDABOT from "./templates/.github/dependabot.yml.ts";
import * as GITHUB_WORKFLOWS_CI from "./templates/.github/workflows/ci.yml.ts";
import * as OPENCODE_PLUGINS_DENO_GUARDS from "./templates/.opencode/plugins/deno-guards.ts";
import * as OPENCODE_PLUGINS_CODE_GRADE from "./templates/.opencode/plugins/code-grade.ts";
import * as VSCODE_EXTENSIONS from "./templates/.vscode/extensions.json.ts";
import * as VSCODE_SETTINGS from "./templates/.vscode/settings.json.ts";

const templateModules: TemplateModule[] = [
  { metadata: AGENTS.metadata, default: AGENTS.default },
  { metadata: CHANGELOG.metadata, default: CHANGELOG.default },
  { metadata: CONTRIBUTING.metadata, default: CONTRIBUTING.default },
  { metadata: CONVENTIONAL_COMMITS.metadata, default: CONVENTIONAL_COMMITS.default },
  { metadata: LICENSE.metadata, default: LICENSE.default },
  { metadata: README.metadata, default: README.default },
  { metadata: SECURITY.metadata, default: SECURITY.default },
  { metadata: BENCH_CONFIG.metadata, default: BENCH_CONFIG.default },
  { metadata: DENO_JSONC.metadata, default: DENO_JSONC.default },
  { metadata: EXAMPLES_BASIC.metadata, default: EXAMPLES_BASIC.default },
  { metadata: GITATTRIBUTES.metadata, default: GITATTRIBUTES.default },
  { metadata: GITIGNORE.metadata, default: GITIGNORE.default },
  { metadata: OPENCODE_JSON.metadata, default: OPENCODE_JSON.default },
  { metadata: SRC_CORE_CONFIG.metadata, default: SRC_CORE_CONFIG.default },
  { metadata: SRC_MOD.metadata, default: SRC_MOD.default },
  { metadata: TESTS_CORE_CONFIG.metadata, default: TESTS_CORE_CONFIG.default },
  {
    metadata: DEVCONTAINER_DOCKERFILE.metadata,
    default: DEVCONTAINER_DOCKERFILE.default,
  },
  {
    metadata: DEVCONTAINER_DEVCONTAINER_JSON.metadata,
    default: DEVCONTAINER_DEVCONTAINER_JSON.default,
  },
  { metadata: GITHUB_CODEOWNERS.metadata, default: GITHUB_CODEOWNERS.default },
  { metadata: GITHUB_DEPENDABOT.metadata, default: GITHUB_DEPENDABOT.default },
  { metadata: GITHUB_WORKFLOWS_CI.metadata, default: GITHUB_WORKFLOWS_CI.default },
  {
    metadata: OPENCODE_PLUGINS_DENO_GUARDS.metadata,
    default: OPENCODE_PLUGINS_DENO_GUARDS.default,
  },
  {
    metadata: OPENCODE_PLUGINS_CODE_GRADE.metadata,
    default: OPENCODE_PLUGINS_CODE_GRADE.default,
  },
  { metadata: VSCODE_EXTENSIONS.metadata, default: VSCODE_EXTENSIONS.default },
  { metadata: VSCODE_SETTINGS.metadata, default: VSCODE_SETTINGS.default },
];

export function getTemplateModules(): TemplateModule[] {
  return templateModules;
}

export function loadTemplates(
  context: TemplateContext,
): readonly RenderedFile[] {
  const renderedFiles: RenderedFile[] = [];

  for (const module of templateModules) {
    if (module.metadata.conditional && !context.includeConfig) {
      continue;
    }
    const content = module.default(context);
    renderedFiles.push({
      path: module.metadata.outputPath,
      content,
    });
  }

  return renderedFiles;
}
