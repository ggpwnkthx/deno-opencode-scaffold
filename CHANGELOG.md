# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).


## [0.2.0] - 2026-03-23

### Added

- Import mapping support (`@scaffold/types` → `./src/domain/types.ts`)
- Async `buildRenderedFiles()` function returning `Promise`
- New `template-loader.ts` module for dynamic template loading
- 23 individual template files in `src/scaffold/templates/`

### Changed

- Template system refactored to use dynamic template loading via `loadTemplates()`
## [0.1.0] - 2026-03-23

### Added

- `init` command for scaffolding new Deno v2.7+ projects
- Configurable scaffold options: `--scope`, `--github-user`, `--github-repo`, `--codeowner`, `--security-email`
- `--dir` flag for custom target directory
- `--dry-run` flag to preview generated files without writing to disk
- `--force` flag to overwrite non-empty directories
- Template rendering system with `TemplateContext` for placeholder substitution
- Generated project structure includes:
  - DevContainer configuration (`.devcontainer/`)
  - GitHub workflows, CODEOWNERS, and Dependabot config (`.github/`)
  - OpenCode Deno guards plugin (`.opencode/plugins/`)
  - VSCode settings and extensions (`.vscode/`)
  - Standard documentation files (`README.md`, `CHANGELOG.md`, `CONTRIBUTING.md`, `CONVENTIONAL_COMMITS.md`, `SECURITY.md`, `LICENSE.md`)
  - `AGENTS.md` for AI agent guidance
  - `opencode.json` configuration
  - `deno.jsonc` with task scripts and formatting rules
  - Starter `src/`, `tests/`, `benchmarks/`, and `examples/` tree
