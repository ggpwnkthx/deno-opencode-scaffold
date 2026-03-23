/**
 * Static template files emitted into a newly initialized application.
 * @module
 */

import type { RenderedFile, TemplateContext } from "../domain/types.ts";
import { renderDenoJsonc } from "./deno-jsonc.ts";

function renderDevcontainerJson(): string {
  return `{
  "name": "base-deno",
  "build": {
    "dockerfile": "Dockerfile"
  },
  "initializeCommand": "sh -c 'ENVFILE=\\"\${localWorkspaceFolder}/.env\\"; if [ ! -f \\"$ENVFILE\\" ]; then umask 000; : > \\"$ENVFILE\\"; chmod 666 \\"$ENVFILE\\"; fi'",
  "runArgs": [
    "--env-file",
    "\${localWorkspaceFolder}/.env"
  ],
  "customizations": {
    "vscode": {
      "extensions": [
        "justjavac.vscode-deno-extensionpack",
        "vscode-icons-team.vscode-icons"
      ]
    }
  },
  "features": {
    "ghcr.io/devcontainers/features/git:1": {},
    "ghcr.io/devcontainers/features/github-cli:1": {}
  }
}
`;
}

function renderDevcontainerDockerfile(): string {
  return `# Stage 1: Get Deno binary
FROM denoland/deno:bin AS deno
# Stage 2: Main development environment
FROM mcr.microsoft.com/devcontainers/base:debian
# Copy Deno binary from Stage 1
COPY --from=deno /deno /usr/local/bin/deno

USER vscode
RUN curl -fsSL https://opencode.ai/install | bash
`;
}

function renderGithubCiWorkflow(): string {
  return `name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  ci:
    name: CI
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: denoland/setup-deno@v2
        with:
          deno-version: "2.7.7"

      - run: deno task ci

      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: coverage
          path: coverage/
          retention-days: 7
`;
}

function renderCodeowners(context: TemplateContext): string {
  return `# Code ownership
# Add your GitHub username or team handle here
* ${context.codeOwner}
`;
}

function renderDependabot(): string {
  return `version: 2
updates:
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
    labels:
      - "dependencies"
      - " automated"

  - package-ecosystem: "deno"
    directory: "/"
    schedule:
      interval: "weekly"
    labels:
      - "dependencies"
      - "automated"
    ignore:
      - dependency-name: "*"
        update-types: ["version-update:semver-major"]
`;
}

function renderDenoGuardsPlugin(): string {
  return 'import type { Plugin } from "@opencode-ai/plugin";\nimport { spawn } from "node:child_process";\nimport path from "node:path";\n\nconst DENO_EXTENSIONS = new Set([".ts", ".tsx"]);\nconst EDIT_TOOLS = new Set(["write", "edit", "patch", "multiedit"]);\n\nfunction isRecord(v: unknown): v is Record<string, unknown> {\n  return typeof v === "object" && v !== null;\n}\n\nfunction asString(v: unknown): string | undefined {\n  return typeof v === "string" ? v : undefined;\n}\n\nfunction getNestedString(obj: unknown, ...keys: string[]): string | undefined {\n  let cur: unknown = obj;\n  for (const key of keys) {\n    if (!isRecord(cur)) return undefined;\n    cur = cur[key];\n  }\n  return asString(cur);\n}\n\nfunction getFilePath(input: unknown, output: unknown): string | undefined {\n  return (\n    getNestedString(output, "args", "filePath") ??\n      getNestedString(output, "args", "path") ??\n      getNestedString(output, "args", "newPath") ??\n      getNestedString(input, "args", "filePath") ??\n      getNestedString(input, "args", "path") ??\n      getNestedString(input, "args", "newPath") ??\n      getNestedString(input, "filePath") ??\n      getNestedString(input, "path")\n  );\n}\n\nfunction isDenoFile(filePath: string | undefined): filePath is string {\n  return !!filePath && DENO_EXTENSIONS.has(path.extname(filePath));\n}\n\nasync function runCommand(\n  args: string[],\n  cwd: string,\n): Promise<{ code: number; stdout: string; stderr: string }> {\n  return await new Promise((resolve, reject) => {\n    const child = spawn(args[0], args.slice(1), {\n      cwd,\n      stdio: ["ignore", "pipe", "pipe"],\n    });\n\n    let stdout = "";\n    let stderr = "";\n\n    child.stdout.on("data", (chunk) => {\n      stdout += chunk.toString();\n    });\n\n    child.stderr.on("data", (chunk) => {\n      stderr += chunk.toString();\n    });\n\n    child.on("error", reject);\n    child.on("close", (code) => {\n      resolve({\n        code: code ?? 1,\n        stdout,\n        stderr,\n      });\n    });\n  });\n}\n\nfunction formatFailure(params: {\n  cmd: string[];\n  exitCode: number;\n  toolName?: string;\n  filePath?: string;\n  stdout: string;\n  stderr: string;\n}): string {\n  const header = [\n    `\u274c ${params.cmd.join(" ")} failed (exit code ${params.exitCode})`,\n    params.toolName ? `Tool: ${params.toolName}` : undefined,\n    params.filePath ? `File: ${params.filePath}` : undefined,\n  ].filter(Boolean).join("\\n");\n\n  const stdoutBlock = params.stdout.trim()\n    ? `\\n\\n--- stdout ---\\n${params.stdout.trimEnd()}`\n    : "";\n\n  const stderrBlock = params.stderr.trim()\n    ? `\\n\\n--- stderr ---\\n${params.stderr.trimEnd()}`\n    : "";\n\n  return `${header}${stdoutBlock}${stderrBlock}`.trimEnd();\n}\n\nasync function runOrBlock(\n  cmd: string[],\n  cwd: string,\n  toolName?: string,\n  filePath?: string,\n) {\n  const res = await runCommand(cmd, cwd);\n\n  if (res.code !== 0) {\n    throw new Error(\n      formatFailure({\n        cmd,\n        exitCode: res.code,\n        toolName,\n        filePath,\n        stdout: res.stdout,\n        stderr: res.stderr,\n      }),\n    );\n  }\n}\n\nconst LINT_PATTERNS = ["./src", "./tests", "./benchmarks", "./examples"];\nconst CHECK_PATTERN = "./src";\n\nexport const DenoGuards: Plugin = async ({\n  directory,\n}: {\n  directory: string;\n}) => {\n  await Promise.resolve();\n  return {\n    "tool.execute.after": async (\n      input: Record<string, unknown>,\n      _output: Record<string, unknown>,\n    ) => {\n      const toolName = asString(input?.tool);\n      if (!toolName || !EDIT_TOOLS.has(toolName)) return;\n\n      const filePath = getFilePath(input, _output);\n      if (!isDenoFile(filePath)) return;\n\n      await runOrBlock(\n        ["deno", "lint", "--fix", ...LINT_PATTERNS],\n        directory,\n        toolName,\n        filePath,\n      );\n\n      await runOrBlock(\n        ["deno", "check", CHECK_PATTERN],\n        directory,\n        toolName,\n        filePath,\n      );\n    },\n  };\n};\n\nexport default DenoGuards;\n';
}
function renderGitattributes(): string {
  return `# Auto detect text files and perform LF normalization
* text=auto

# Source files
*.ts text diff=typescript

# Documentation
*.md text

# Configuration
*.json text
*.yml text
*.yaml text

# Scripts
*.sh text eol=lf

# Denote all shell files have shell syntax
*.sh text eol=lf
`;
}

function renderGitignore(): string {
  return `# Environment
.env
.env.local
.env.*.local

# IDE
.idea/
.vscode/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Logs
*.log
logs/

# Coverage
coverage/

# Build output
dist/
build/

# Temp files
tmp/
temp/
*.tmp

# Misc
CLAUDE.md
`;
}

function renderAgents(): string {
  return `# AGENTS.md

This document provides guidance for AI agents operating in this repository.

## Project Overview

A Deno package template for building reusable libraries and applications.
Target: Deno v2.7+ only; no Node.js APIs.

## Build/Lint/Test Commands

### Standard Tasks

\`\`\`bash
deno task test       # Run all tests with coverage
deno task coverage   # Generate LCOV coverage report
deno task coverage:check  # Verify coverage thresholds
deno task bench      # Run benchmarks
deno task fmt        # Format code
deno task fmt:check  # Check formatting without modifying
deno task lint       # Lint code
deno task check      # Type-check all source files
deno task ci         # Run all CI checks (fmt && lint && check && coverage)
\`\`\`

### Single Test Execution

\`\`\`bash
# Run a specific test file
deno test -A ./tests/core/config.test.ts

# Run a specific test by name (uses regex)
deno test -A --filter "test name pattern" ./tests/

# Run with coverage for specific files
deno test -A --coverage=coverage ./tests/*
\`\`\`

### Permissions

Required permissions vary by functionality. Document all \`--allow-*\` flags used:

- \`--allow-read\` - File system access
- \`--allow-write\` - File system writes
- \`--allow-net\` - Network access
- \`--allow-env\` - Environment variables
- \`--allow-ffi\` - Foreign Function Interface

## Code Style Guidelines

### TypeScript

- **Strict mode always** - \`strict: true\` in deno.jsonc
- **Avoid \`any\`** - Use \`unknown\` + type narrowing instead
- **Prefer generics** over union types where appropriate
- **Strong types for all domain entities**, external inputs/outputs, config, and errors
- Use \`interface\` for object shapes; \`type\` for unions, intersections, mapped types

### Imports

- Use jsr.io packages only; never \`https://deno.land\` imports
- Pin versions: \`import { X } from "jsr:@scope/pkg@1.2.3";\`
- Current deps:
  - \`@std/assert@1.0.19\` for testing assertions
- Sort imports: external → internal → relative

### Formatting (from deno.jsonc)

\`\`\`json
{
  "lineWidth": 88,
  "indentWidth": 2,
  "useTabs": false,
  "semiColons": true,
  "singleQuote": false,
  "proseWrap": "preserve",
  "trailingCommas": "onlyMultiLine",
  "operatorPosition": "nextLine"
}
\`\`\`

### Naming Conventions

- **Files**: kebab-case (\`my-file.ts\`)
- **Types/Interfaces**: PascalCase (\`MyType\`, \`IMyInterface\`)
- **Functions/Methods**: camelCase (\`myFunction\`)
- **Constants**: SCREAMING_SNAKE_CASE for compile-time constants
- **Enums**: PascalCase with UPPER values

## Documentation Standards

Every package must have sufficient documentation:

### README or Module Doc Required

The package must have EITHER:

- A \`README.md\` in the repository root, OR
- A module doc (\`/** ... */\`) in the main entrypoint (\`src/mod.ts\`)

### Usage Example Required

The README or main entrypoint module doc must include a code block demonstrating how to use the package:

\`\`\`typescript
import { myFunction } from "jsr:@scope/package@version";

const result = myFunction("example");
console.log(result);
\`\`\`

### Every Entrypoint Needs Module Doc

Every public entrypoint (files listed in \`exports\` in \`deno.jsonc\`) must have a module doc summarizing what is defined in that module:

\`\`\`typescript
/**
 * Core configuration utilities for creating and validating application configs.
 * @module
 */
\`\`\`

### Exported Symbols Need Symbol Documentation

All exported functions, types, interfaces, classes, and constants must have JSDoc comments:

\`\`\`typescript
/**
 * Creates a validated configuration object.
 * @param name - The application name (non-empty string)
 * @param version - Semantic version string (x.y.z format)
 * @returns A typed Config object
 * @throws {Error} If name is empty or version is invalid
 */
export function createConfig(name: string, version: string): Config;
\`\`\`

### No Slow Types

Avoid types that cause performance overhead:

- **Avoid \`any\`** - Use \`unknown\` + type narrowing
- **Avoid large unions** - Use interfaces or generics instead
- **Avoid circular references** in types where possible
- **Use \`interface\` for object shapes** - Interfaces are faster for type checking than intersection types

### Error Handling

- Use typed errors with clear messages
- Define error classes hierarchy for different failure modes
- Fail fast with validation errors
- Never swallow errors silently

## Architecture

### Directory Structure

\`\`\`
.
├── benchmarks/       # Performance benchmarks
├── scripts/          # Build/utility scripts
├── src/              # Source code
│   ├── mod.ts        # Public entry point
│   └── core/         # Internal shared helpers, config, validation
├── tests/            # Test suite
│   └── core/         # Core functionality tests
└── deno.jsonc        # Deno configuration
\`\`\`

### Memory Safety

- **Stream large I/O** - Use \`AsyncIterable\`, generators, cursors for pagination
- **Avoid loading entire datasets** into memory
- **Close resources explicitly** - Use \`using\` or try/finally
- **Document complexity hot spots** - Comment FFI, pointer handling, memory layout assumptions

### Input Validation

- Validate ALL untrusted input (HTTP params, env vars, file contents, user data)
- Use centralized validation helpers
- Fail fast with typed error shapes
- Never trust external data without validation

## Dependency Policy

- **Minimal dependencies** - Prefer built-ins or small focused libs
- **Prefer jsr.io** - Always use jsr.io packages over deno.land/x
- **Check latest stable** - Before adding a dep, skim docs for latest version
- **Pin versions** - Always pin to specific version (e.g., \`@1.2.3\`)

## Testing Guidelines

- Use \`@std/assert\` for assertions
- Tests under \`tests/\` directory
- Use descriptive test names
- Keep fixtures minimal
- Close resources explicitly
- Add regression coverage for reported bugs

### Test Patterns

\`\`\`typescript
import { assertEquals, assertThrows } from "jsr:@std/assert@1.0.19";

// Basic test
Deno.test("myFeature works correctly", () => {
  assertEquals(myFeature(), expected);
});

// Async test
Deno.test("myAsyncFeature resolves correctly", async () => {
  const result = await myAsyncFeature();
  assertEquals(result, expected);
});

// Assert throws
Deno.test("invalid input throws TypedError", () => {
  assertThrows(() => myFunction(invalidInput), TypedError, "clear message");
});
\`\`\`

## Pull Request Checklist

- [ ] Branch from \`main\`
- [ ] Add/update tests for all changes
- [ ] Run \`deno task ci\` - all checks must pass
- [ ] Update README if public API changed
- [ ] Keep dependencies minimal
- [ ] Review code for memory safety issues
- [ ] Verify no \`any\` types introduced

## Git Conventions

- Commit messages: clear, descriptive, explain _why_ not just _what_
- AI-generated code: contributors responsible for reviewing all generated code
- Do not commit secrets, .env files, or private data

## Contributing Guidelines (from CONTRIBUTING.md)

### For Bug Fixes

- Add/update tests that fail before fix and pass after
- Prefer smallest change that fixes cleanly
- Preserve existing public API unless breaking change is intentional

### For New Features

- Open issue/discussion first for substantial changes
- Include tests
- Update README and examples for API changes

### FFI/Memory Changes

Changes touching FFI, pointers, memory layout, or ABI:

- Explain assumptions clearly in PR
- Add focused tests
- Call out memory safety risks

## Configuration

### Deno Settings

- \`deno.enable: true\` in VS Code (already configured)
- \`deno.lint: true\` in VS Code (already configured)
- Strict TypeScript enabled via \`compilerOptions.strict: true\`

### Dev Container

- Uses \`.devcontainer/devcontainer.json\`
- Initializes empty \`.env\` file on first run
- Includes Deno extension pack and GitHub CLI

## Quick Reference

\`\`\`bash
# First time setup
deno cache ./src/mod.ts

# Run CI checks
deno task ci

# Run specific test
deno test -A ./tests/my.test.ts

# Type-check
deno check ./src/mod.ts

# Format and lint
deno fmt && deno lint
\`\`\`
`;
}

function renderChangelog(): string {
  return `# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

`;
}

function renderContributing(): string {
  return `# Contributions

Thanks for your interest in contributing.

## Before You Start

Please read the README first for an overview of this library.

## Development Setup

1. Fork and clone the repository
2. Ensure you are using a compatible Deno version (see README for requirements)
3. Cache dependencies:

\`\`\`bash
deno cache ./src/mod.ts
\`\`\`

## Permissions

Typical development and test workflows may require:

- \`--allow-read\`
- \`--allow-write\`
- \`--allow-net\`
- \`--allow-env\`
- \`--allow-ffi\`

Refer to the README or documentation for specific permission requirements.

Most repository tasks already pass the necessary flags where applicable.

## Development Commands

\`\`\`bash
# Run all checks used in CI
deno task ci

# Run tests
deno task test

# Run a specific test file
deno test -A ./tests/path/to/test.ts

# Type-check the public entrypoint
deno check ./src/mod.ts

# Lint
deno lint

# Format
deno fmt

# Run benchmarks
deno task bench
\`\`\`

## Project Structure

- \`src/\` - source code
- \`src/core/\` - internal shared helpers, config, validation
- \`tests/\` - test suite

## Contribution Guidelines

### Bug Fixes

- Add or update tests that fail before the fix and pass after it
- Prefer the smallest change that fixes the issue cleanly
- Preserve existing public API behavior unless a breaking change is intentional

### New Features

- Open an issue or discussion first for substantial changes
- Include tests
- Update README and examples when the public API changes
- Keep dependencies minimal

### Memory-Sensitive Changes

Changes touching FFI, pointers, memory layout, resource lifecycle, or ABI-sensitive code
need extra care.

For these changes:

- explain the assumption clearly in the PR
- add focused tests for the affected types/paths
- call out risks around memory safety or resource management

## Code Style

This project uses Deno's formatter and linter. The canonical settings are defined in
\`deno.jsonc\`.

Please run:

\`\`\`bash
deno fmt
deno lint
\`\`\`

before opening a PR.

A few expectations:

- keep TypeScript strict
- avoid \`any\`
- prefer small, composable functions
- validate untrusted inputs early
- preserve typed errors and clear failure modes
- avoid unnecessary dependencies

## Testing

Tests live under \`tests/\` and use \`@std/assert\`.

When adding tests:

- use descriptive names
- keep fixtures minimal
- close resources explicitly when appropriate
- add regression coverage for reported bugs

## Pull Requests

1. Create a branch from \`main\`
2. Make your changes
3. Add or update tests
4. Update docs if behavior changed
5. Run \`deno task ci\`
6. Open a pull request with a clear description of:
   - what changed
   - why it changed
   - any compatibility or safety considerations

## AI / LLM-Assisted Contributions

AI/LLM-generated code is allowed, but contributors are fully responsible for anything they submit.

If you use AI tools:

- review, understand, and test all generated code before opening a PR
- ensure the code matches this project's style, safety, and version requirements
- do not submit code you cannot explain or maintain
- verify that generated code does not add unsafe dependencies, weaken validation, or change public behavior unintentionally
- avoid including secrets, private data, or unpublished code in AI tool prompts

PRs may be rejected if AI-generated changes are low-quality, unreviewed, overly broad, or unsafe.

## Reporting Security Issues

Please do **not** open public issues for security-sensitive bugs.

See \`SECURITY.md\` for vulnerability reporting instructions.

## Questions

Open an issue for bugs or feature requests.

For general questions, GitHub Discussions is the best place to ask.
`;
}

function renderConventionalCommits(): string {
  return `# Conventional Commits

This project follows the [Conventional Commits](https://www.conventionalcommits.org/) specification.

## Format

\`\`\`
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
\`\`\`

## Types

| Type       | Description                                             |
| ---------- | ------------------------------------------------------- |
| \`feat\`     | A new feature                                           |
| \`fix\`      | A bug fix                                               |
| \`docs\`     | Documentation only changes                              |
| \`style\`    | Changes that do not affect meaning (formatting, etc.)   |
| \`refactor\` | Code change that neither fixes a bug nor adds a feature |
| \`perf\`     | Performance improvement                                 |
| \`test\`     | Adding or correcting tests                              |
| \`build\`    | Changes to build system or dependencies                 |
| \`ci\`       | Changes to CI configuration                             |
| \`chore\`    | Other changes that don't modify src or test files       |
| \`revert\`   | Reverts a previous commit                               |

## Examples

\`\`\`
feat(core): add new configuration option
fix(api): resolve race condition in client
docs: update README with new examples
chore: update dependencies
\`\`\`

## Commit Message Validation

The \`commit-msg\` hook validates that your commit messages follow this format.
`;
}

function renderLicense(context: TemplateContext): string {
  return `MIT License

Copyright (c) ${context.currentYear}

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`;
}

function renderOpencodeJson(): string {
  return `{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "minimax": {
      "npm": "@ai-sdk/anthropic",
      "models": {
        "MiniMax-M2.7": {
          "name": "MiniMax-M2.7"
        }
      }
    }
  },
  "formatter": {
    "deno-fmt": {
      "command": ["deno", "fmt", "$FILE"],
      "extensions": [".ts", ".tsx"]
    }
  }
}
`;
}

function renderReadme(context: TemplateContext): string {
  return `# ${context.displayPackageName}

[![CI](https://github.com/${context.githubUser}/${context.githubRepo}/actions/workflows/ci.yml/badge.svg)](https://github.com/${context.githubUser}/${context.githubRepo}/actions/workflows/ci.yml)
[![Deno v2.7+](https://img.shields.io/badge/Deno-2.7+-lightgrey?logo=deno)](https://deno.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A Deno package template for building reusable libraries and applications.

## Features

- **Deno-first**: Built for Deno v2.7+ with native permissions system
- **Type-safe**: Full TypeScript strict mode enabled
- **Well-tested**: Coverage tracking with threshold enforcement
- **CI-ready**: GitHub Actions workflow for automated testing
- **Conventional commits**: Documentation included for commit hygiene

## Quick Start

\`\`\`typescript
import { createConfig } from "jsr:${context.displayPackageName}@0.0.1";

// Create a configuration object
const config = createConfig("${context.packageName}", "1.0.0");
console.log(config);
// { name: "${context.packageName}", version: "1.0.0" }
\`\`\`

## Installation

\`\`\`bash
# Clone the repository
git clone https://github.com/${context.githubUser}/${context.githubRepo}.git
cd ${context.githubRepo}

# Cache dependencies
deno cache ./src/mod.ts
\`\`\`

## Development

\`\`\`bash
# Run all CI checks (format, lint, type-check, coverage)
deno task ci

# Run tests
deno task test

# Type-check
deno task check

# Lint
deno task lint

# Format code
deno task fmt

# Run benchmarks
deno task bench

# Generate coverage report
deno task coverage
\`\`\`

## API Reference

### \`createConfig(name, version)\`

Creates a typed configuration object with validation.

**Parameters:**

- \`name\` (\`string\`): The application or library name
- \`version\` (\`string\`): Semantic version string (\`x.y.z\`)

**Returns:** \`Config\` object with \`name\` and \`version\` properties

**Throws:** \`Error\` if name is empty/whitespace or version is not semver format

\`\`\`typescript
const config = createConfig("${context.packageName}", "1.0.0");
// => { name: "${context.packageName}", version: "1.0.0" }

createConfig("", "1.0.0");
// => Error: Name cannot be empty

createConfig("${context.packageName}", "invalid");
// => Error: Version must be in semver format
\`\`\`

## Project Structure

\`\`\`
.
├── .github/            # GitHub workflows and configs
│   ├── workflows/      # CI action
│   ├── dependabot.yml  # Dependency update config
│   └── CODEOWNERS      # Code ownership
├── benchmarks/         # Performance benchmarks
├── examples/           # Example entrypoints
├── src/                # Source code
│   └── core/           # Core module
├── tests/              # Test suite
├── deno.jsonc          # Deno configuration
└── AGENTS.md           # AI agent instructions
\`\`\`

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## License

MIT
`;
}

function renderSecurity(context: TemplateContext): string {
  return `# Security Policy

## Supported Versions

Security fixes are generally provided for the latest published release.

If you believe an older version is affected, please report it anyway and include the
exact version(s) tested.

## Reporting a Vulnerability

Please report suspected vulnerabilities privately. Do **not** open a public issue or
discussion for security-sensitive reports.

### Preferred Reporting Channel

Send your report to: **${context.securityEmail}**

If this repository provides a private vulnerability reporting mechanism, use that
channel instead.

### What to Include

Please include as much of the following as possible:

- affected package version
- Deno version
- operating system and architecture
- a clear description of the issue
- reproduction steps or a minimal proof of concept
- expected impact
- any suggested mitigation or fix, if known

If the issue depends on a particular configuration or data, include a minimal
example that reproduces the behavior safely.

## Response Process

We aim to:

- acknowledge receipt within **48 hours**
- provide an initial triage update within **7 days**
- keep reporters informed of fix status when possible
- coordinate public disclosure after a fix or mitigation is available

## Scope

### In Scope

Please report vulnerabilities in this library's code and packaging, including for
example:

- unsafe code patterns or memory-safety issues
- invalid resource lifecycle management
- insecure temporary-file or configuration handling introduced by this library
- dependency or packaging issues that create a security impact

### Out of Scope

The following are usually not handled as vulnerabilities in this repository:

- vulnerabilities in third-party dependencies (report to their maintainers)
- vulnerabilities in downstream applications using this library
- misuse of the library that leads to security issues
- feature requests or hardening suggestions without a demonstrable security impact

## Disclosure

Please allow time for investigation and remediation before public disclosure.

We follow a coordinated disclosure process and will credit reporters if they would
like to be acknowledged.
`;
}

function renderVscodeSettings(): string {
  return `{
  "deno.enable": true,
  "deno.lint": true,
  "editor.formatOnSave": true,
  "files.insertFinalNewline": true
}
`;
}

function renderVscodeExtensions(): string {
  return `{
  "recommendations": [
    "justjavac.vscode-deno-extensionpack",
    "vscode-icons-team.vscode-icons"
  ]
}
`;
}

function renderSrcMod(): string {
  return `/**
 * Public entry point for configuration helpers.
 * @module
 */

export { createConfig, type Config } from "./core/config.ts";
`;
}

function renderSrcConfig(): string {
  return `/**
 * Core configuration utilities for scaffolded repositories.
 * @module
 */

/**
 * Minimal application configuration.
 */
export interface Config {
  readonly name: string;
  readonly version: string;
}

function validateName(name: string): string {
  const normalizedName = name.trim();
  if (normalizedName.length === 0) {
    throw new Error("Name cannot be empty");
  }
  return normalizedName;
}

function validateVersion(version: string): string {
  const normalizedVersion = version.trim();
  if (!/^\d+\.\d+\.\d+$/.test(normalizedVersion)) {
    throw new Error("Version must be in semver format");
  }
  return normalizedVersion;
}

/**
 * Creates a validated configuration object.
 * @param name - The application or library name.
 * @param version - Semantic version string.
 * @returns A typed configuration object.
 */
export function createConfig(name: string, version: string): Config {
  return {
    name: validateName(name),
    version: validateVersion(version),
  };
}
`;
}

function renderConfigTest(context: TemplateContext): string {
  return `import {
  assertEquals,
  assertThrows,
} from "jsr:@std/assert@1.0.19";

import { createConfig } from "../../src/mod.ts";

Deno.test("createConfig returns a config for valid input", () => {
  assertEquals(createConfig("${context.packageName}", "1.0.0"), {
    name: "${context.packageName}",
    version: "1.0.0",
  });
});

Deno.test("createConfig rejects an empty name", () => {
  assertThrows(() => createConfig("   ", "1.0.0"), Error, "Name cannot be empty");
});

Deno.test("createConfig rejects a non-semver version", () => {
  assertThrows(
    () => createConfig("${context.packageName}", "one"),
    Error,
    "Version must be in semver format",
  );
});
`;
}

function renderBenchmark(): string {
  return `import { createConfig } from "../src/mod.ts";

Deno.bench("createConfig", () => {
  createConfig("bench-app", "1.0.0");
});
`;
}

function renderExample(context: TemplateContext): string {
  return `import { createConfig } from "../src/mod.ts";

const config = createConfig("${context.packageName}", "1.0.0");
console.log(config);
`;
}

export function renderTemplateFiles(context: TemplateContext): readonly RenderedFile[] {
  return [
    { path: ".devcontainer/devcontainer.json", content: renderDevcontainerJson() },
    { path: ".devcontainer/Dockerfile", content: renderDevcontainerDockerfile() },
    { path: ".github/workflows/ci.yml", content: renderGithubCiWorkflow() },
    { path: ".github/CODEOWNERS", content: renderCodeowners(context) },
    { path: ".github/dependabot.yml", content: renderDependabot() },
    { path: ".opencode/plugins/deno-guards.ts", content: renderDenoGuardsPlugin() },
    { path: ".vscode/settings.json", content: renderVscodeSettings() },
    { path: ".vscode/extensions.json", content: renderVscodeExtensions() },
    { path: ".gitattributes", content: renderGitattributes() },
    { path: ".gitignore", content: renderGitignore() },
    { path: "AGENTS.md", content: renderAgents() },
    { path: "CHANGELOG.md", content: renderChangelog() },
    { path: "CONTRIBUTING.md", content: renderContributing() },
    { path: "CONVENTIONAL_COMMITS.md", content: renderConventionalCommits() },
    { path: "LICENSE.md", content: renderLicense(context) },
    { path: "README.md", content: renderReadme(context) },
    { path: "SECURITY.md", content: renderSecurity(context) },
    { path: "opencode.json", content: renderOpencodeJson() },
    { path: "deno.jsonc", content: renderDenoJsonc(context) },
    { path: "src/mod.ts", content: renderSrcMod() },
    { path: "src/core/config.ts", content: renderSrcConfig() },
    { path: "tests/core/config.test.ts", content: renderConfigTest(context) },
    { path: "benchmarks/config.bench.ts", content: renderBenchmark() },
    { path: "examples/basic.ts", content: renderExample(context) },
  ];
}
