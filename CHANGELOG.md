# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.10] - 2026-04-01

### Changed

- Renamed `opencode.json` template to `.opencode/settings.json` for proper dotfile organization
- Renamed `deno-guards.ts.ts` template to `.opencode/plugins/deno-guards.ts` removing redundant extension
- Updated README examples to use local path instead of JSR package
- Updated `.devcontainer/devcontainer.json` to use project-specific name

### Added

- New `code-grade.ts` plugin template for code grading functionality
- Added `OPENCODE_CONFIG` environment variable to Dockerfile for OpenCode configuration path

## [0.2.9] - 2026-03-31

### Changed

- Renamed `opencode.json.ts` template to `.opencode/settings.json.ts` for proper dotfile organization
- Renamed `deno-guards.ts.ts` template to `.opencode/plugins/deno-guards.ts` removing redundant extension

### Added

- New `code-grade.ts` plugin template for code grading functionality

## [0.2.8] - 2026-03-24

### Changed

- Simplified `deno-guards.ts.ts` template by removing redundant `cd` commands

## [0.2.7] - 2026-03-24

### Changed

- Refactored `deno-guards.ts.ts` template to use new OpenCode plugin API with session-based validation

## [0.2.6] - 2026-03-23

### Fixed

- Improved README.md wording for clarity

## [0.2.5] - 2026-03-23

### Fixed

- Changed exclude pattern from `".*"` to `"./*"` to properly exclude dotfiles at root only

## [0.2.4] - 2026-03-23

### Fixed

- JSR publish configuration now includes template files in `src/scaffold/templates/`
- Removed overly broad `"exclude": [".*"]` pattern that was preventing template files from being published

## [0.2.3] - 2026-03-23

### Changed

- Refactored template loading system to use centralized template registry
- Changed `loadTemplates()` from async to sync function for improved performance

## [0.2.2] - 2026-03-23

### Changed

- Updated AGENTS.md naming convention examples with more concrete patterns

### Fixed

- Renamed `tests/generate_test.ts` to `tests/generate.test.ts` to follow kebab-case naming convention

## [0.2.1] - 2026-03-23

### Added

- `basename()` helper function in `src/lib/path.ts` for extracting directory names from paths

### Changed

- CLI now initializes in current directory when app name is omitted or passed as `.`
- App name is derived from current directory name when not provided
- Underscores in app names are normalized to hyphens (e.g., `my_app` becomes `my-app`)
- Updated README with new usage examples for current directory initialization

### Fixed

- `ensureWritableTarget()` now properly handles `targetDir === "."` without attempting to create the directory

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
