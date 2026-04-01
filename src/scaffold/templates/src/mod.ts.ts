import type { TemplateContext } from "@scaffold/types";

export const metadata = { outputPath: "src/mod.ts" };

export default function (context: TemplateContext): string {
  if (context.includeConfig) {
    return `/**
 * Public entry point for configuration helpers.
 * @module
 */

export { createConfig, type Config } from "./core/config.ts";
`;
  }
  return `/**
 * Public entry point for the package.
 * @module
 */

// Config utilities were not generated. Use --no-config to skip.
`;
}
