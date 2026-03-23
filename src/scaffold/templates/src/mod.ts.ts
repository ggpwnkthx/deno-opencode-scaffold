import type { TemplateContext } from "@scaffold/types";

export const metadata = { outputPath: "src/mod.ts" };

export default function (_context: TemplateContext): string {
  return `/**
 * Public entry point for configuration helpers.
 * @module
 */

export { createConfig, type Config } from "./core/config.ts";
`;
}
