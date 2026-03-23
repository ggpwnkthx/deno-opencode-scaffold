# AGENTS.md

This document provides guidance for AI agents operating in this repository.

## Project Overview

A Deno package template for building reusable libraries and applications.
Target: Deno v2.7+ only; no Node.js APIs.

## Build/Lint/Test Commands

### Standard Tasks

```bash
deno task test       # Run all tests with coverage
deno task coverage   # Generate LCOV coverage report
deno task coverage:check  # Verify coverage thresholds
deno task bench      # Run benchmarks
deno task fmt        # Format code
deno task fmt:check  # Check formatting without modifying
deno task lint       # Lint code
deno task check      # Type-check all source files
deno task ci         # Run all CI checks (fmt && lint && check && coverage)
```

### Single Test Execution

```bash
# Run a specific test file
deno test -A ./tests/core/config.test.ts

# Run a specific test by name (uses regex)
deno test -A --filter "test name pattern" ./tests/

# Run with coverage for specific files
deno test -A --coverage=coverage ./tests/*
```

### Permissions

Required permissions vary by functionality. Document all `--allow-*` flags used:

- `--allow-read` - File system access
- `--allow-write` - File system writes
- `--allow-net` - Network access
- `--allow-env` - Environment variables
- `--allow-ffi` - Foreign Function Interface

## Code Style Guidelines

### TypeScript

- **Strict mode always** - `strict: true` in deno.jsonc
- **Avoid `any`** - Use `unknown` + type narrowing instead
- **Prefer generics** over union types where appropriate
- **Strong types for all domain entities**, external inputs/outputs, config, and errors
- Use `interface` for object shapes; `type` for unions, intersections, mapped types

### Imports

- Use jsr.io packages only; never `https://deno.land` imports
- Pin versions: `import { X } from "jsr:@scope/pkg@1.2.3";`
- Current deps:
  - `@std/assert@1.0.19` for testing assertions
- Sort imports: external → internal → relative

### Formatting (from deno.jsonc)

```json
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
```

### Naming Conventions

- **Files**: kebab-case (`my-file.ts`)
- **Types/Interfaces**: PascalCase (`MyType`, `IMyInterface`)
- **Functions/Methods**: camelCase (`myFunction`)
- **Constants**: SCREAMING_SNAKE_CASE for compile-time constants
- **Enums**: PascalCase with UPPER values

## Documentation Standards

Every package must have sufficient documentation:

### README or Module Doc Required

The package must have EITHER:

- A `README.md` in the repository root, OR
- A module doc (`/** ... */`) in the main entrypoint (`src/mod.ts`)

### Usage Example Required

The README or main entrypoint module doc must include a code block demonstrating how to use the package:

```typescript
import { myFunction } from "jsr:@scope/package@version";

const result = myFunction("example");
console.log(result);
```

### Every Entrypoint Needs Module Doc

Every public entrypoint (files listed in `exports` in `deno.jsonc`) must have a module doc summarizing what is defined in that module:

```typescript
/**
 * Core configuration utilities for creating and validating application configs.
 * @module
 */
```

### Exported Symbols Need Symbol Documentation

All exported functions, types, interfaces, classes, and constants must have JSDoc comments:

```typescript
/**
 * Creates a validated configuration object.
 * @param name - The application name (non-empty string)
 * @param version - Semantic version string (x.y.z format)
 * @returns A typed Config object
 * @throws {Error} If name is empty or version is invalid
 */
export function createConfig(name: string, version: string): Config;
```

### No Slow Types

Avoid types that cause performance overhead:

- **Avoid `any`** - Use `unknown` + type narrowing
- **Avoid large unions** - Use interfaces or generics instead
- **Avoid circular references** in types where possible
- **Use `interface` for object shapes** - Interfaces are faster for type checking than intersection types

### Error Handling

- Use typed errors with clear messages
- Define error classes hierarchy for different failure modes
- Fail fast with validation errors
- Never swallow errors silently

## Architecture

### Directory Structure

```
.
├── benchmarks/       # Performance benchmarks
├── scripts/          # Build/utility scripts
├── src/              # Source code
│   ├── mod.ts        # Public entry point
│   └── core/         # Internal shared helpers, config, validation
├── tests/            # Test suite
│   └── core/         # Core functionality tests
└── deno.jsonc        # Deno configuration
```

### Memory Safety

- **Stream large I/O** - Use `AsyncIterable`, generators, cursors for pagination
- **Avoid loading entire datasets** into memory
- **Close resources explicitly** - Use `using` or try/finally
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
- **Pin versions** - Always pin to specific version (e.g., `@1.2.3`)

## Testing Guidelines

- Use `@std/assert` for assertions
- Tests under `tests/` directory
- Use descriptive test names
- Keep fixtures minimal
- Close resources explicitly
- Add regression coverage for reported bugs

### Test Patterns

```typescript
import { assertEquals, assertThrows } from "@std/assert";

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
```

## Pull Request Checklist

- [ ] Branch from `main`
- [ ] Add/update tests for all changes
- [ ] Run `deno task ci` - all checks must pass
- [ ] Update README if public API changed
- [ ] Keep dependencies minimal
- [ ] Review code for memory safety issues
- [ ] Verify no `any` types introduced

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

- `deno.enable: true` in VS Code (already configured)
- `deno.lint: true` in VS Code (already configured)
- Strict TypeScript enabled via `compilerOptions.strict: true`

### Dev Container

- Uses `.devcontainer/devcontainer.json`
- Initializes empty `.env` file on first run
- Includes Deno extension pack and GitHub CLI

## Quick Reference

```bash
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
```
