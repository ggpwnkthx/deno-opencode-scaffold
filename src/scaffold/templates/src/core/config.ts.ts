import type { TemplateContext } from "@scaffold/types";

export const metadata = { outputPath: "src/core/config.ts", conditional: "config" };

export default function (_context: TemplateContext): string {
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
  if (!/^\\d+\\.\\d+\\.\\d+$/.test(normalizedVersion)) {
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
