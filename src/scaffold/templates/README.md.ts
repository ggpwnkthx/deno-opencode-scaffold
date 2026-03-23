import type { TemplateContext } from "@scaffold/types";

export const metadata = { outputPath: "README.md" };

export default function (context: TemplateContext): string {
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
